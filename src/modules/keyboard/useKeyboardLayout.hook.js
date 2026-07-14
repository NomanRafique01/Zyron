/**
 * useKeyboardLayout.hook.js  — v3
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-grade keyboard layout hook for Zyron.
 *
 * WHAT THIS HOOK OWNS
 * ───────────────────
 * • Native Window Inset events via react-native-keyboard-controller (RNKC)
 *   with a transparent fallback to RN's Keyboard.addListener.
 * • Keyboard animation progress (0 → 1) via Animated.Value.
 * • Discrete keyboard state machine: closed → opening → open → closing → closed
 * • Floating keyboard detection (tablets, foldables, Gboard float mode)
 * • Hardware keyboard detection (Bluetooth/USB — no layout shift needed)
 * • Foldable / multi-window support — re-calculates geometry on every
 *   Dimensions change, no restart required.
 * • Emoji-panel / GIF-picker height changes treated as keyboard updates.
 * • Debounced height updates: only propagate changes > KEYBOARD_HEIGHT_THRESHOLD.
 * • Orientation-keyed height cache: portrait/landscape remembered independently.
 * • AppState handling: blur input on background/inactive; reset state on resume.
 * • Defensive try/catch everywhere touching native APIs.
 *
 * HUAWEI / ADJUSTRESIZE FALLBACK (v3 key addition)
 * ─────────────────────────────────────────────────
 * Huawei EMUI and HarmonyOS, plus some Xiaomi/Vivo/Oppo ROMs, partially or
 * fully ignore softwareKeyboardLayoutMode="resize".  The OS window never
 * shrinks, so a pure flex layout never pushes the composer up.
 *
 * Detection: after a keyboardShow event, compare the window height from the
 * event's endCoordinates against the baseline window height.  If they are
 * equal (the window did NOT shrink) while keyboard height > 0, adjustResize
 * failed.  In that case the hook exposes `adjustResizeFailed=true` and a
 * `keyboardAvoidingPadding` value that the layout uses as an explicit
 * paddingBottom on the chat shell to manually push content up.
 *
 * BACKWARD-COMPATIBLE PUBLIC API (v1 fields unchanged)
 * ────────────────────────────────────────────────────
 *   keyboardVisible, keyboardVisibleRef, lastKeyboardHeightRef,
 *   lastKeyboardEventRef, baselineWindowHeightRef, navBarHeightRef,
 *   COMPOSER_SAFETY_BUFFER
 *
 * NEW FIELDS (v2)
 *   keyboardHeight, keyboardProgress, keyboardState,
 *   isFloatingKeyboard, isHardwareKeyboard, nativeKeyboardControllerActive
 *
 * NEW FIELDS (v3)
 *   adjustResizeFailed       — bool: OS did not shrink window on keyboard open
 *   keyboardAvoidingPadding  — number: px to add as paddingBottom when failed
 *
 * USAGE
 * ─────
 *   const {
 *     keyboardVisible, keyboardHeight, keyboardProgress, keyboardState,
 *     isFloatingKeyboard, isHardwareKeyboard,
 *     adjustResizeFailed, keyboardAvoidingPadding,
 *     COMPOSER_SAFETY_BUFFER,
 *   } = useKeyboardLayout(insets.bottom, inputRef);
 *
 * PARAMETERS
 * ──────────
 *   insetsBottom  — number   : safe area bottom inset
 *   inputRef      — React ref: composer TextInput; blurred on bg/inactive
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Animated,
  AppState,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';

import {
  COMPOSER_SAFETY_BUFFER,
  KEYBOARD_HEIGHT_THRESHOLD,
  MIN_SOFTWARE_KEYBOARD_HEIGHT,
  KeyboardStateEnum,
  OrientationKeyboardCache,
  computeNavBarHeight,
  getKeyboardBottomInset,
  getOrientation,
  isFloatingKeyboard as detectFloatingKeyboard,
  tryRequireNativeKeyboardEvents,
} from './keyboardUtils.js';

// Re-export so callers can still do:
//   import { COMPOSER_SAFETY_BUFFER } from './useKeyboardLayout.hook'
export { COMPOSER_SAFETY_BUFFER };
export { getKeyboardBottomInset };

// ─────────────────────────────────────────────────────────────────────────────
// Module-level: probe native module availability once at import time.
// ─────────────────────────────────────────────────────────────────────────────
const NativeKeyboardEvents = tryRequireNativeKeyboardEvents();
const HAS_NATIVE_KB = NativeKeyboardEvents !== null;

// ─────────────────────────────────────────────────────────────────────────────
// adjustResize detection tolerance (logical px).
//
// After a keyboard show event we compare the window height from
// endCoordinates.screenY against the captured baseline.  If the window
// shrank by at least this many pixels we consider adjustResize working.
// A 4 px tolerance absorbs rounding and status-bar variation.
// ─────────────────────────────────────────────────────────────────────────────
const ADJUST_RESIZE_TOLERANCE = 4;

// ─────────────────────────────────────────────────────────────────────────────
// Animation helper
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Animate progressAnim to toValue over duration ms.
 * Falls back to 220 ms when duration is 0 / undefined.
 */
function animateProgress(progressAnim, toValue, duration) {
  const ms = typeof duration === 'number' && duration > 0 ? duration : 220;
  Animated.timing(progressAnim, {
    toValue,
    duration: ms,
    useNativeDriver: false, // used for layout (paddingBottom) — must be false
  }).start();
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export default function useKeyboardLayout(insetsBottom, inputRef) {
  // ── React state ─────────────────────────────────────────────────────────────
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardState, setKeyboardState] = useState(KeyboardStateEnum.CLOSED);
  const [floatingKeyboard, setFloatingKeyboard] = useState(false);
  const [hardwareKeyboard, setHardwareKeyboard] = useState(false);

  // v3: tracks whether the OS adjustResize failed (Huawei / some OEM ROMs)
  // and how many px of padding to apply manually in that case.
  const [adjustResizeFailed, setAdjustResizeFailed] = useState(false);
  const [keyboardAvoidingPadding, setKeyboardAvoidingPadding] = useState(0);

  // ── Animated value — keyboard open/close progress (0 → 1) ──────────────────
  const keyboardProgressRef = useRef(new Animated.Value(0));
  const keyboardProgress = keyboardProgressRef.current;

  // ── Synchronous refs ────────────────────────────────────────────────────────
  const baselineWindowHeightRef = useRef(Dimensions.get('window').height);
  const keyboardVisibleRef = useRef(false);
  const lastKeyboardHeightRef = useRef(0);
  const lastKeyboardEventRef = useRef(null);
  const navBarHeightRef = useRef(0);

  // ── Internal refs ───────────────────────────────────────────────────────────
  const orientationCacheRef = useRef(new OrientationKeyboardCache());
  const committedHeightRef = useRef(0);
  const hwKbConsecutiveRef = useRef(0);
  // v3: ref mirror of adjustResizeFailed for synchronous reads in handlers
  const adjustResizeFailedRef = useRef(false);

  // ─── Geometry recalculation ─────────────────────────────────────────────────
  const refreshGeometry = useCallback(() => {
    try {
      baselineWindowHeightRef.current = Dimensions.get('window').height;
      navBarHeightRef.current = computeNavBarHeight();
    } catch (err) {
      console.warn('[useKeyboardLayout] refreshGeometry error:', err);
    }
  }, []);

  // ─── adjustResize failure detector ─────────────────────────────────────────
  /**
   * Called after a keyboard show event with the committed keyboard height.
   *
   * How adjustResize is supposed to work:
   *   When the keyboard appears, Android shrinks the app window by exactly
   *   the keyboard height. The window's new height == baseline - keyboardHeight.
   *   React Native's flex layout then naturally pushes the composer to the top
   *   of the shrunken window, i.e. flush with the keyboard.
   *
   * How it breaks on Huawei / some OEM ROMs:
   *   The window is NEVER resized. The keyboard overlaps the bottom of the
   *   unchanged window. The composer stays at the physical bottom of the screen
   *   and is hidden behind the keyboard.
   *
   * Detection heuristic:
   *   Read the current window height AFTER the keyboard event. If it is within
   *   ADJUST_RESIZE_TOLERANCE px of the baseline (i.e. it didn't shrink) while
   *   we have a real keyboard height, adjustResize failed.
   *
   * Remedy:
   *   Expose `keyboardAvoidingPadding = keyboardHeight` so the layout can apply
   *   it as an explicit paddingBottom on the chatShell, manually lifting content.
   *   This is functionally equivalent to what KeyboardAvoidingView does but
   *   without the double-offset bug on well-behaved devices.
   *
   * @param {number} kbHeight  — committed keyboard height in logical px
   */
  const checkAdjustResize = useCallback((kbHeight) => {
    if (Platform.OS !== 'android' || kbHeight === 0) return;

    try {
      const currentWindowH = Dimensions.get('window').height;
      const expectedShrink = baselineWindowHeightRef.current - kbHeight;
      // If window shrank enough, adjustResize is working → no manual padding.
      const resizeWorked = currentWindowH <= expectedShrink + ADJUST_RESIZE_TOLERANCE;

      if (resizeWorked) {
        if (adjustResizeFailedRef.current) {
          adjustResizeFailedRef.current = false;
          setAdjustResizeFailed(false);
          setKeyboardAvoidingPadding(0);
        }
      } else {
        // Window did NOT shrink — adjustResize broken. Apply manual padding.
        // Subtract safe-area bottom (insetsBottom) to avoid double-counting on
        // gesture-nav devices where the inset already reserves space below the
        // composer. Cap at zero so we never apply negative padding.
        const manualPad = Math.max(0, kbHeight - (insetsBottom ?? 0));
        adjustResizeFailedRef.current = true;
        setAdjustResizeFailed(true);
        setKeyboardAvoidingPadding(manualPad);
      }
    } catch (err) {
      console.warn('[useKeyboardLayout] checkAdjustResize error:', err);
    }
  }, [insetsBottom]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Core keyboard-show handler ─────────────────────────────────────────────
  const handleKeyboardShow = useCallback((height, rawEvent, duration) => {
    // ── Floating keyboard guard ──
    if (rawEvent && detectFloatingKeyboard(rawEvent)) {
      setFloatingKeyboard(true);
      if (!adjustResizeFailedRef.current) {
        // Floating panel — clear any manual padding immediately
        setKeyboardAvoidingPadding(0);
      }
      lastKeyboardHeightRef.current = 0;
      committedHeightRef.current = 0;
      return;
    }
    setFloatingKeyboard(false);

    // ── Hardware keyboard guard ──
    if (height < MIN_SOFTWARE_KEYBOARD_HEIGHT) {
      hwKbConsecutiveRef.current += 1;
      if (hwKbConsecutiveRef.current >= 3) {
        setHardwareKeyboard(true);
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        setKeyboardState(KeyboardStateEnum.CLOSED);
        setKeyboardAvoidingPadding(0);
        adjustResizeFailedRef.current = false;
        setAdjustResizeFailed(false);
        keyboardVisibleRef.current = false;
        lastKeyboardHeightRef.current = 0;
        animateProgress(keyboardProgress, 0, 120);
      }
      return;
    }
    hwKbConsecutiveRef.current = 0;
    setHardwareKeyboard(false);

    // ── Debounce: ignore micro-fluctuations ──
    const delta = Math.abs(height - committedHeightRef.current);
    if (delta < KEYBOARD_HEIGHT_THRESHOLD && keyboardVisibleRef.current) {
      lastKeyboardEventRef.current = rawEvent;
      return;
    }

    // ── Commit ──
    committedHeightRef.current = height;
    lastKeyboardHeightRef.current = height;
    lastKeyboardEventRef.current = rawEvent;
    keyboardVisibleRef.current = true;

    orientationCacheRef.current.set(getOrientation(), height);

    setKeyboardHeight(height);
    setKeyboardVisible(true);
    setKeyboardState(KeyboardStateEnum.OPEN);
    animateProgress(keyboardProgress, 1, duration);

    // v3: check if OS adjustResize actually worked for this device
    // Use requestAnimationFrame so Dimensions.get reads the post-layout value.
    requestAnimationFrame(() => checkAdjustResize(height));
  }, [checkAdjustResize]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Core keyboard-hide handler ─────────────────────────────────────────────
  const handleKeyboardHide = useCallback((duration) => {
    committedHeightRef.current = 0;
    lastKeyboardHeightRef.current = 0;
    keyboardVisibleRef.current = false;
    lastKeyboardEventRef.current = null;
    hwKbConsecutiveRef.current = 0;

    setKeyboardVisible(false);
    setKeyboardHeight(0);
    setKeyboardState(KeyboardStateEnum.CLOSED);
    setFloatingKeyboard(false);

    // Clear manual padding on hide — OS will restore window height (or it was
    // never shrunk, in which case no padding is needed when keyboard is gone).
    setKeyboardAvoidingPadding(0);
    // Keep adjustResizeFailedRef.current as-is so next show re-checks correctly.

    animateProgress(keyboardProgress, 0, duration);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Main effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    refreshGeometry();

    let showSubNative = null;
    let hideSubNative = null;
    let showSubRN = null;
    let hideSubRN = null;

    if (HAS_NATIVE_KB) {
      // ── react-native-keyboard-controller native path ─────────────────────────
      // Uses WindowInsetsAnimation API on Android (API 30+), polyfilled below.
      // Events fire before animation starts on both platforms.
      showSubNative = NativeKeyboardEvents.addListener('keyboardWillShow', (e) => {
        const height = typeof e.height === 'number' ? e.height : 0;
        handleKeyboardShow(height, { endCoordinates: { height }, height }, e.duration);
        setKeyboardState(KeyboardStateEnum.OPENING);
      });

      hideSubNative = NativeKeyboardEvents.addListener('keyboardWillHide', (e) => {
        setKeyboardState(KeyboardStateEnum.CLOSING);
        handleKeyboardHide(e?.duration);
      });

    } else {
      // ── React Native Keyboard API fallback ───────────────────────────────────
      // iOS:     keyboardWillShow/Hide  — fire before animation (smooth)
      // Android: keyboardDidShow/Hide   — fire after animation (best available)
      //
      // On Android we also listen to keyboardDidShow so we catch keyboards that
      // don't fire Will events (some Huawei/EMUI versions skip Will entirely).
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      showSubRN = Keyboard.addListener(showEvent, (e) => {
        const height = getKeyboardBottomInset(e, baselineWindowHeightRef.current);
        if (Platform.OS === 'android') {
          setKeyboardState(KeyboardStateEnum.OPENING);
        }
        handleKeyboardShow(height, e, undefined);
      });

      hideSubRN = Keyboard.addListener(hideEvent, () => {
        if (Platform.OS === 'android') {
          setKeyboardState(KeyboardStateEnum.CLOSING);
        }
        handleKeyboardHide(undefined);
      });
    }

    // ── Dimensions change listener ───────────────────────────────────────────
    // Handles: rotation, multi-window, foldable fold/unfold, split-screen resize.
    const dimSub = Dimensions.addEventListener('change', ({ window: win }) => {
      try {
        baselineWindowHeightRef.current = win.height;
        navBarHeightRef.current = computeNavBarHeight();

        const orientation = win.width >= win.height ? 'landscape' : 'portrait';
        const cachedH = orientationCacheRef.current.get(orientation);

        if (keyboardVisibleRef.current) {
          if (cachedH > 0 && cachedH < win.height * 0.7) {
            lastKeyboardHeightRef.current = cachedH;
          } else if (cachedH === 0) {
            lastKeyboardHeightRef.current = 0;
            committedHeightRef.current = 0;
          }
          // Re-check adjustResize validity after a window size change
          if (cachedH > 0) {
            requestAnimationFrame(() => checkAdjustResize(cachedH));
          }
        } else {
          // Keyboard not visible — clear any stale manual padding
          setKeyboardAvoidingPadding(0);
          adjustResizeFailedRef.current = false;
        }
      } catch (err) {
        console.warn('[useKeyboardLayout] Dimensions change error:', err);
      }
    });

    // ── AppState listener ────────────────────────────────────────────────────
    // background/inactive → blur input.
    // active (from background) → reset keyboard state + re-read geometry.
    //
    // Guard: skip Dimensions read on inactive→active (notification banner) to
    // avoid JSI native surface crash on Android New Architecture in release mode.
    let prevAppState = AppState.currentState;

    const appStateSub = AppState.addEventListener('change', (nextAppState) => {
      try {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          inputRef?.current?.blur();
        }

        if (nextAppState === 'active' && prevAppState !== 'active') {
          committedHeightRef.current = 0;
          lastKeyboardHeightRef.current = 0;
          keyboardVisibleRef.current = false;
          lastKeyboardEventRef.current = null;
          hwKbConsecutiveRef.current = 0;
          adjustResizeFailedRef.current = false;

          setKeyboardVisible(false);
          setKeyboardHeight(0);
          setKeyboardState(KeyboardStateEnum.CLOSED);
          setKeyboardAvoidingPadding(0);
          setAdjustResizeFailed(false);
          animateProgress(keyboardProgress, 0, 0);

          if (prevAppState === 'background') {
            refreshGeometry();
          }
        }
      } catch (err) {
        console.warn('[useKeyboardLayout] AppState handler error:', err);
      }
      prevAppState = nextAppState;
    });

    return () => {
      showSubNative?.remove();
      hideSubNative?.remove();
      showSubRN?.remove();
      hideSubRN?.remove();
      dimSub?.remove();
      appStateSub.remove();
    };

    // insetsBottom re-registers listeners when safe area changes (rotation,
    // foldable unfold, display scaling change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insetsBottom]);

  return {
    // ── v1 fields (unchanged) ────────────────────────────────────────────────
    keyboardVisible,
    keyboardVisibleRef,
    lastKeyboardHeightRef,
    lastKeyboardEventRef,
    baselineWindowHeightRef,
    navBarHeightRef,
    COMPOSER_SAFETY_BUFFER,

    // ── v2 fields ────────────────────────────────────────────────────────────
    /** Keyboard height in logical px (0 when hidden). React state. */
    keyboardHeight,
    /** Animated.Value 0→1 tracking keyboard open progress. */
    keyboardProgress,
    /** 'closed' | 'opening' | 'open' | 'closing' */
    keyboardState,
    /** True when keyboard is floating/undocked — do NOT shift layout. */
    isFloatingKeyboard: floatingKeyboard,
    /** True when a hardware (BT/USB) keyboard is connected. */
    isHardwareKeyboard: hardwareKeyboard,
    /** Whether the RNKC native module is linked and active. */
    nativeKeyboardControllerActive: HAS_NATIVE_KB,

    // ── v3 fields ────────────────────────────────────────────────────────────
    /**
     * True when the OS failed to shrink the window on keyboard open (Huawei
     * EMUI/HarmonyOS, some Xiaomi/Oppo/Vivo ROMs).
     * When true, apply `keyboardAvoidingPadding` as paddingBottom on the chat
     * shell to manually push content above the keyboard.
     */
    adjustResizeFailed,
    /**
     * Explicit bottom padding (px) to apply to the chat shell when
     * adjustResizeFailed is true. 0 on iOS and when adjustResize works.
     */
    keyboardAvoidingPadding,
  };
}
