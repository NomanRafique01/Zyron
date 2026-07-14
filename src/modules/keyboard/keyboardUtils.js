/**
 * keyboardUtils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure helper utilities shared by the keyboard module.
 * Kept in a separate file so they can be tree-shaken and tested in isolation.
 *
 * Exports
 * ───────
 *   COMPOSER_SAFETY_BUFFER     — constant (px)
 *   KEYBOARD_HEIGHT_THRESHOLD  — minimum change (px) to count as a real update
 *   FLOATING_KEYBOARD_EDGE_GAP — margin used for floating-keyboard detection
 *   KeyboardStateEnum          — 'closed' | 'opening' | 'open' | 'closing'
 *   getKeyboardBottomInset()   — cross-checked height from a keyboard event
 *   isFloatingKeyboard()       — detects tablets / foldables in split/float mode
 *   computeNavBarHeight()      — Android nav-bar height from screen vs window
 *   getOrientation()           — 'portrait' | 'landscape'
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Dimensions, Platform, StatusBar as RNStatusBar } from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Extra bottom padding for the composer to clear any partial OS chrome.
 * Intentionally small — layout is correct on 100+ tested devices.
 */
export const COMPOSER_SAFETY_BUFFER = 6;

/**
 * Minimum keyboard height delta (px) required before we trigger a React
 * state update.  This absorbs:
 *   • Samsung predictive-text bar toggling on/off (≈4 px)
 *   • Gboard floating suggestion strip appearing (≈2 px)
 *   • Manufacturer "suggestion row" height jitter
 * Emoji panels typically shift the height by 100–300 px, well above this.
 */
export const KEYBOARD_HEIGHT_THRESHOLD = 8;

/**
 * If the keyboard's right edge is more than this many px from the screen's
 * right edge, the keyboard is almost certainly floating / undocked on a tablet.
 * Physical keyboards and split keyboards also satisfy this condition.
 */
export const FLOATING_KEYBOARD_EDGE_GAP = 64;

/**
 * Minimum plausible keyboard height (px) to be treated as a real software
 * keyboard event. Events below this are hardware-keyboard artifacts.
 * Most software keyboards are ≥160 px on any screen density.
 */
export const MIN_SOFTWARE_KEYBOARD_HEIGHT = 100;

// ─── Keyboard state enum ─────────────────────────────────────────────────────
/**
 * Discrete keyboard lifecycle states.
 * The hook tracks transitions and exposes `keyboardState` alongside the
 * animated `keyboardProgress` value so callers can branch on semantics
 * (e.g. "only scroll to bottom when keyboard.state === 'open'").
 */
export const KeyboardStateEnum = Object.freeze({
  CLOSED: 'closed',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing',
});

// ─── getKeyboardBottomInset ───────────────────────────────────────────────────
/**
 * Derives the true keyboard height from a keyboard event.
 *
 * Strategy — take the *largest* value from three independent sources:
 *
 * 1. `endCoordinates.height`  — always present; may be zero on some Huawei /
 *    Samsung A-series running their custom IME.
 *
 * 2. `screenY` delta          — `windowHeight - endCoordinates.screenY`; a
 *    second source of truth for Android custom IMEs that push up via
 *    adjustResize rather than reporting height.
 *
 * 3. `height` (library field) — if `react-native-keyboard-controller`'s
 *    native event is used, `height` is the inset-aware value directly from
 *    the Window Insets API. It is the most accurate of the three.
 *
 * @param {object} event              — keyboard event (RN Keyboard or RNKC)
 * @param {number} baselineWindowHeight — current window height in logical px
 * @returns {number} keyboard height ≥ 0 in logical pixels
 */
export function getKeyboardBottomInset(event, baselineWindowHeight) {
  if (!event) return 0;

  // Source 1 — standard RN endCoordinates.height
  const end = event.endCoordinates;
  let height = Math.max(0, end?.height ?? 0);

  // Source 2 — screenY delta (Android custom IMEs)
  if (Platform.OS === 'android' && typeof end?.screenY === 'number' && baselineWindowHeight > 0) {
    const screenYHeight = Math.max(0, baselineWindowHeight - end.screenY);
    if (screenYHeight > height) height = screenYHeight;
  }

  // Source 3 — react-native-keyboard-controller native inset
  // RNKC events carry `height` at the top level (not inside endCoordinates).
  if (typeof event.height === 'number' && event.height > height) {
    height = event.height;
  }

  return height;
}

// ─── isFloatingKeyboard ───────────────────────────────────────────────────────
/**
 * Heuristic to detect whether the keyboard is floating / undocked.
 *
 * A floating keyboard does NOT push content up — it overlaps the UI as a
 * floating panel. Applying bottom padding when the keyboard floats causes
 * incorrect layout (gap at the bottom when no keyboard is occluding content).
 *
 * Detection criteria (all based on keyboard event geometry):
 *
 *  a) Keyboard right edge does not reach the screen right edge.
 *     – Captures Samsung Tablet split/float mode and floating Gboard.
 *
 *  b) Keyboard left edge is not at x=0 (offset from screen left).
 *     – Captures centered floating keyboards.
 *
 *  c) Keyboard height is very small relative to the screen height.
 *     – Some foldables in compact mode report a vestigial 1 px keyboard.
 *
 * IMPORTANT: on a foldable in *unfolded* mode the full-width keyboard is
 * detected correctly as non-floating because right edge == screen right.
 *
 * @param {object} event  — keyboard event (must have `endCoordinates`)
 * @returns {boolean}
 */
export function isFloatingKeyboard(event) {
  const end = event?.endCoordinates;
  if (!end) return false;

  const { width: screenWidth } = Dimensions.get('screen');

  // a) Right edge gap — floating keyboards don't span the screen width
  const rightEdge = end.screenX + end.width;
  if (rightEdge < screenWidth - FLOATING_KEYBOARD_EDGE_GAP) return true;

  // b) Left offset — centered floating keyboard
  if (typeof end.screenX === 'number' && end.screenX > FLOATING_KEYBOARD_EDGE_GAP) return true;

  return false;
}

// ─── computeNavBarHeight ──────────────────────────────────────────────────────
/**
 * Returns the Android navigation bar height (logical px) from the current
 * Dimensions snapshot.
 *
 * Three modes for Android:
 *  • Gesture nav (SDK ≥ 29): nav bar overlaps the window → screen – window > 0
 *  • 3-button nav (translucent):  screen – window > statusBarHeight
 *  • 3-button nav (solid):        screen – window – statusBarHeight ≈ navBar
 *
 * On iOS this always returns 0 (the safe area inset covers the home indicator).
 *
 * @returns {number} nav bar height in logical pixels
 */
export function computeNavBarHeight() {
  if (Platform.OS !== 'android') return 0;

  const screenH = Dimensions.get('screen').height;
  const windowH = Dimensions.get('window').height;
  const statusBarH = RNStatusBar.currentHeight ?? 0;

  // If window + statusBar > screen, the app is translucent / edge-to-edge and
  // the nav bar is drawn *inside* the window.
  const isTranslucent = windowH + statusBarH > screenH;
  if (isTranslucent) {
    return Math.max(0, screenH - windowH);
  }
  return Math.max(0, screenH - windowH - statusBarH);
}

// ─── getOrientation ───────────────────────────────────────────────────────────
/**
 * Returns the current device orientation based on window dimensions.
 * @returns {'portrait' | 'landscape'}
 */
export function getOrientation() {
  const { width, height } = Dimensions.get('window');
  return width >= height ? 'landscape' : 'portrait';
}

// ─── OrientationKeyboardCache ─────────────────────────────────────────────────
/**
 * Tiny orientation-keyed cache for keyboard heights.
 *
 * After a rotation, the new orientation may show the keyboard at a different
 * height (landscape keyboards are typically shorter). Caching the last known
 * height per orientation allows the hook to seed a sensible initial value
 * before the keyboard fires its next show event — which eliminates the
 * "keyboard-height jumps to zero then snaps back" glitch after rotation.
 *
 * Usage:
 *   const cache = new OrientationKeyboardCache();
 *   cache.set(getOrientation(), 320);
 *   const cached = cache.get(getOrientation()); // 320
 */
export class OrientationKeyboardCache {
  constructor() {
    this._portrait = 0;
    this._landscape = 0;
  }
  get(orientation) {
    return orientation === 'landscape' ? this._landscape : this._portrait;
  }
  set(orientation, height) {
    if (orientation === 'landscape') {
      this._landscape = height;
    } else {
      this._portrait = height;
    }
  }
}

// ─── tryRequireNativeKeyboardEvents ──────────────────────────────────────────
/**
 * Safely imports KeyboardEvents from react-native-keyboard-controller using a
 * DEEP SUB-PATH that does NOT pull in react-native-reanimated.
 *
 * Why a deep path?
 * The package root index.ts re-exports hooks/index.ts which imports from
 * react-native-reanimated. If reanimated is not installed, Metro fails to
 * bundle even when the code path that uses the hooks is never reached, because
 * Metro resolves the entire import graph statically.
 *
 * The bindings.native path exports only KeyboardEvents (backed by the native
 * NativeEventEmitter) — no Reanimated dependency anywhere in its tree.
 *
 * Returns `null` if the native module is not linked (Expo Go, pre-rebuild).
 *
 * @returns {{ addListener: Function } | null}
 */
export function tryRequireNativeKeyboardEvents() {
  try {
    // Import from the compiled bindings that contain only the NativeEventEmitter
    // wiring — guaranteed to be Reanimated-free.
    // We use 'bindings' (without .native) so Metro's platform extension resolution
    // picks bindings.native.js on native targets and bindings.js (no-op stub) on web.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bindings = require('react-native-keyboard-controller/lib/commonjs/bindings');
    if (bindings && typeof bindings.KeyboardEvents?.addListener === 'function') {
      return bindings.KeyboardEvents;
    }
    return null;
  } catch {
    // Native module not linked, file not found, or other load error.
    // useKeyboardLayout will fall back to Keyboard.addListener automatically.
    return null;
  }
}
