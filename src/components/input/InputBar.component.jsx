import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import C from '../../config/colors.config';
import { SendIcon, StopIcon, MicIcon, LiveIcon } from '../shared/Icons';
import {
  fontScale,
  spacing,
  radius,
  verticalScale,
  scale,
} from '../../utils/responsive.utils';

// ─── Speech recognition — safe lazy load ─────────────────────────────────────
//
// expo-speech-recognition uses requireNativeModule() (JSI / Expo Modules API),
// NOT the old React Native bridge NativeModules.  Checking NativeModules is
// therefore ALWAYS undefined, even in a real APK.  The correct guard is a
// try/catch around the actual require() — it throws when the native module is
// absent (Expo Go), succeeds when it is linked (custom dev build / release APK).
//
let ExpoSpeechRecognitionModule = null;
let useSpeechRecognitionEvent = (_eventName, _listener) => {};   // no-op fallback

try {
  const mod = require('expo-speech-recognition');
  // requireNativeModule will throw here if the native side is not linked.
  // If it succeeds we know the module is truly available.
  if (mod?.ExpoSpeechRecognitionModule?.start) {
    ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
  }
} catch (_) {
  // Native module not linked — Expo Go, web, or stripped build.
}

// ─── Agent accent color map ───────────────────────────────────────────────────
const AGENT_ACCENT = {
  reasoner: C.agentReasoner,
  coder: C.agentCoder,
  vision: C.agentVision,
  writer: C.agentWriter,
  Reasoner: C.agentReasoner,
  Coder: C.agentCoder,
  Vision: C.agentVision,
  Writer: C.agentWriter,
};

// ─── MiniAgentDot ─────────────────────────────────────────────────────────────
function MiniAgentDot({ name, role, status }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isActive = status !== 'done' && status !== 'queued' && status !== 'error';
  const isDone   = status === 'done';
  const isError  = status === 'error';
  const accent   = AGENT_ACCENT[role] || AGENT_ACCENT[name] || C.cyan;

  useEffect(() => {
    if (!isActive) { pulseAnim.setValue(1); return undefined; }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isActive, pulseAnim]);

  let dotColor = '#333344';
  if (isDone)      dotColor = C.green;
  else if (isError) dotColor = C.orange;
  else if (isActive) dotColor = accent;

  return (
    <View style={s.miniAgentItem}>
      <Animated.View style={[s.miniDot, { backgroundColor: dotColor, opacity: isActive ? pulseAnim : 1 }]} />
      <Text style={[s.miniAgentName, { color: isDone ? C.green : isError ? C.orange : isActive ? accent : '#555566' }]}>
        {name.charAt(0)}
      </Text>
    </View>
  );
}

// ─── AgentStrip ───────────────────────────────────────────────────────────────
function AgentStrip({ agents, isTyping }) {
  if (!isTyping || !agents?.length) return null;
  const doneCount = agents.filter((a) => a.status === 'done' || a.status === 'error').length;
  return (
    <View style={s.agentStrip}>
      <View style={s.stripContent}>
        <View style={s.stripDots}>
          {agents.map((agent, i) => <MiniAgentDot key={i} {...agent} />)}
        </View>
        <Text style={s.stripStatus}>{doneCount}/{agents.length} complete</Text>
      </View>
    </View>
  );
}

// ─── Waveform constants ───────────────────────────────────────────────────────
const BAR_COUNT   = 5;
// Arch shape — centre bar tallest
const BAR_SHAPE   = [0.55, 0.80, 1.0, 0.80, 0.55];
const BAR_MIN     = 0.12;   // scaleY floor (always visible)
const BAR_MAX     = 1.0;    // scaleY ceiling
const BAR_H       = verticalScale(18);
const BAR_W       = scale(3);
const BAR_GAP     = scale(2);
const WAVE_W      = BAR_COUNT * BAR_W + (BAR_COUNT - 1) * BAR_GAP;

// ─── VoiceWaveform ────────────────────────────────────────────────────────────
// Reads volumeRef (a plain ref — zero re-renders) at ~30 fps via rAF.
// volumechange events from expo-speech-recognition emit values in [-2, 10].
// Anything ≤ 0 is inaudible.  Map [0, 10] → [0, 1] amplitude.
function VoiceWaveform({ volumeRef }) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(BAR_MIN))
  ).current;

  const idleRef = useRef(null);

  const driveFromAmplitude = useCallback((amp) => {
    if (idleRef.current) { idleRef.current.stop(); idleRef.current = null; }
    bars.forEach((bar, i) => {
      Animated.timing(bar, {
        toValue: Math.max(BAR_MIN, BAR_MIN + (BAR_MAX - BAR_MIN) * amp * BAR_SHAPE[i]),
        duration: 80,
        useNativeDriver: true,
      }).start();
    });
  }, [bars]);

  const startIdle = useCallback(() => {
    if (idleRef.current) return;
    const seqs = bars.map((bar, i) =>
      Animated.loop(Animated.sequence([
        Animated.timing(bar, {
          toValue: BAR_MIN + 0.22 * BAR_SHAPE[i],
          duration: 430 + i * 55,
          useNativeDriver: true,
        }),
        Animated.timing(bar, {
          toValue: BAR_MIN,
          duration: 430 + i * 55,
          useNativeDriver: true,
        }),
      ]))
    );
    idleRef.current = Animated.parallel(seqs);
    idleRef.current.start();
  }, [bars]);

  useEffect(() => {
    startIdle();
    let rafId;
    let lastAt = 0;

    const tick = () => {
      const vol = volumeRef.current;
      if (vol !== null && vol !== undefined) {
        const now = Date.now();
        if (now - lastAt > 33) {          // ~30 fps
          lastAt = now;
          // vol range: -2 (silence) to 10 (loud).  Map [0, 10] → [0, 1].
          const amp = Math.min(1, Math.max(0, vol / 10));
          if (amp > 0.02) {
            driveFromAmplitude(amp);
          } else {
            startIdle();
          }
        }
      } else {
        startIdle();
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (idleRef.current) { idleRef.current.stop(); idleRef.current = null; }
    };
  }, [volumeRef, driveFromAmplitude, startIdle]);

  return (
    <View style={s.waveformContainer} pointerEvents="none">
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            s.waveBar,
            { transform: [{ scaleY: bar }], marginLeft: i === 0 ? 0 : BAR_GAP },
          ]}
        />
      ))}
    </View>
  );
}

// ─── InputBar ─────────────────────────────────────────────────────────────────
export default function InputBar({
  inputText,
  setInputText,
  isTyping,
  onSend,
  onStop,
  keyboardVisible,
  simulatedAgents,
  offline,
  loading         = false,
  floating        = false,
  docked          = false,
  chatMode        = false,
  onInputPressIn,
  placeholder     = 'Message Zyron',
  inputRef,
  onLiveTalk,     // () => void — opens the Live Talk overlay
  liveTalkActive  = false,  // true while Live Talk modal is open — suppress mic events
}) {
  const hasText     = inputText.trim().length > 0;
  const sendBtnSize = verticalScale(36);
  const blocked     = isTyping || offline || loading;

  const [isListening, setIsListening] = useState(false);
  const [micError,    setMicError]    = useState(false);

  // Plain ref updated by the volumechange event — no setState, no re-renders.
  const volumeRef = useRef(null);

  // ── Android RECORD_AUDIO permission ───────────────────────────────────────
  const ensureAndroidPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const already = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (already) return true;
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Access',
          message: 'Zyron needs your microphone for voice input.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  // ── Start ─────────────────────────────────────────────────────────────────
  const startVoice = async () => {
    if (!ExpoSpeechRecognitionModule) return;   // not available (Expo Go)
    setMicError(false);
    volumeRef.current = null;
    setInputText('');  // always start fresh — no leftover transcript

    try {
      // Step 1 — Android runtime permission
      if (!(await ensureAndroidPermission())) {
        setMicError(true);
        return;
      }

      // Step 2 — expo-speech-recognition permission (also handles iOS)
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        setMicError(true);
        return;
      }

      // Step 3 — start recogniser
      setIsListening(true);
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 50,   // 20 Hz volume updates → smooth waveform
        },
      });
    } catch (err) {
      setIsListening(false);
      setMicError(true);
    }
  };

  // ── Stop ──────────────────────────────────────────────────────────────────
  const stopVoice = useCallback(() => {
    try { ExpoSpeechRecognitionModule?.stop(); } catch (_) {}
    volumeRef.current = null;
    setIsListening(false);
  }, []);

  // ── Events ────────────────────────────────────────────────────────────────
  // Guard all handlers: when Live Talk is active, its own hook owns the
  // speech-recognition session — InputBar must not touch inputText or its state.
  useSpeechRecognitionEvent('result', (e) => {
    if (liveTalkActive) return;
    if (e?.results?.[0]?.transcript) setInputText(e.results[0].transcript);
  });

  useSpeechRecognitionEvent('end', () => {
    if (liveTalkActive) return;
    volumeRef.current = null;
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', () => {
    if (liveTalkActive) return;
    volumeRef.current = null;
    setIsListening(false);
  });

  // Volume: value is in [-2, 10].  Store in ref — VoiceWaveform reads via rAF.
  useSpeechRecognitionEvent('volumechange', (e) => {
    if (liveTalkActive) return;
    if (e?.value !== undefined) volumeRef.current = e.value;
  });

  // Cleanup on unmount
  useEffect(() => () => {
    try { if (isListening) ExpoSpeechRecognitionModule?.stop(); } catch (_) {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = () => {
    inputRef?.current?.blur();
    requestAnimationFrame(onSend);
  };

  const handleChangeText = (text) => {
    // Typing while mic is on → stop mic first
    if (isListening) stopVoice();
    setInputText(text);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[
      s.inputBar,
      floating  && s.inputBarFloating,
      docked    && s.inputBarDocked,
      chatMode  && s.inputBarChat,
      loading   && s.inputBarLoading,
    ]}>
      <AgentStrip agents={simulatedAgents} isTyping={isTyping} />

      <View style={[
        s.inputContainer,
        floating    && s.inputContainerFloating,
        offline     && s.inputContainerOffline,
        isListening && s.inputContainerListening,
      ]}>

        {/* ── Waveform + label (absolutely overlays the text field) ──── */}
        {isListening && (
          <View style={s.waveformOverlay} pointerEvents="none">
            <VoiceWaveform volumeRef={volumeRef} />
            <Text style={s.listeningLabel}>Listening…</Text>
          </View>
        )}

        {/* ── Text input — hidden (opacity:0) while listening so its
             flex:1 still holds the space, keeping the bar height fixed ── */}
        <TextInput
          ref={inputRef}
          style={[s.inputField, isListening && s.inputFieldHidden]}
          placeholder={offline ? 'You are offline' : placeholder}
          placeholderTextColor="#6B6B7A"
          selectionColor={C.purpleSoft}
          value={inputText}
          onChangeText={handleChangeText}
          onPressIn={onInputPressIn}
          onSubmitEditing={blocked ? null : handleSend}
          returnKeyType="send"
          editable={!blocked && !isListening}
          multiline
          blurOnSubmit={false}
        />

        {/* ── Right-side action buttons ───────────────────────────────
             Empty input  → Mic (left of Live) + Live (rightmost)
             Text typed   → Send only (rightmost)
             AI typing    → Stop only (rightmost)                    ── */}

        {isTyping ? (
          /* ── Stop button (AI is generating) ── */
          <TouchableOpacity
            style={[s.actionBtn, s.stopBtnActive,
              { width: sendBtnSize, height: sendBtnSize, borderRadius: sendBtnSize / 2 }]}
            onPress={onStop}
            activeOpacity={0.85}
          >
            <StopIcon color="#FFFFFF" />
          </TouchableOpacity>

        ) : hasText ? (
          /* ── Send button (user has typed something) ── */
          <TouchableOpacity
            style={[
              s.actionBtn,
              { width: sendBtnSize, height: sendBtnSize, borderRadius: sendBtnSize / 2 },
              !offline && !loading ? s.sendBtnActive : s.sendBtnInactive,
            ]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={offline || loading}
          >
            <SendIcon
              isActive={!offline && !loading}
              color={!offline && !loading ? '#0E0E18' : '#6B6B7A'}
            />
          </TouchableOpacity>

        ) : (
          /* ── Empty input: Mic (left) + Live (right, at Send position) ── */
          <>
            <TouchableOpacity
              style={[
                s.micBtn,
                isListening && s.micBtnActive,
                micError    && s.micBtnError,
              ]}
              onPress={isListening ? stopVoice : startVoice}
              disabled={offline || loading}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MicIcon active={isListening} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionBtn,
                { width: sendBtnSize, height: sendBtnSize, borderRadius: sendBtnSize / 2 },
                s.liveBtnIdle,
              ]}
              onPress={onLiveTalk}
              disabled={offline || loading}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LiveIcon active={false} size={19} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Loading scrim ─────────────────────────────────────────────── */}
      {loading && <View style={[s.inputBarScrim, { pointerEvents: 'box-only' }]} />}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Outer bar
  inputBar: {
    paddingHorizontal: spacing(16),
    paddingTop: spacing(8),
    paddingBottom: Platform.select({ ios: spacing(24), android: spacing(20) }),
    flexShrink: 0,
    backgroundColor: 'transparent',
  },
  inputBarDocked: {
    paddingTop: 0,
    paddingBottom: spacing(8),
    marginBottom: spacing(8),
  },
  inputBarFloating: {
    width: '96%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 0,
    paddingTop: spacing(8),
  },
  inputBarChat: {
    width: '96%',
    alignSelf: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputBarLoading: { opacity: 0.38 },

  // Agent strip
  agentStrip: { marginBottom: spacing(8) },
  stripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius(10),
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(5),
    minHeight: verticalScale(30),
  },
  stripDots: { flexDirection: 'row', alignItems: 'center', gap: spacing(10) },
  miniAgentItem: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  miniDot: { width: scale(6), height: scale(6), borderRadius: scale(3) },
  miniAgentName: { fontSize: fontScale(9), fontWeight: '700', letterSpacing: 0.3 },
  stripStatus: { fontSize: fontScale(9), fontWeight: '600', color: C.textMuted, letterSpacing: 0.3 },

  // Input container row
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0D0D16',
    borderWidth: 1.5,
    borderColor: 'rgba(123,47,255,0.45)',
    borderRadius: radius(26),
    paddingLeft: spacing(16),
    paddingRight: spacing(14),
    paddingVertical: spacing(6),
    minHeight: verticalScale(48),
    maxHeight: verticalScale(140),
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',   // clips the waveform inside the pill
  },
  inputContainerFloating: {
    backgroundColor: '#0D0D16',
    borderColor: 'rgba(123,47,255,0.5)',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
  },
  inputContainerOffline: {
    borderColor: 'rgba(239,68,68,0.45)',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
  },
  inputContainerListening: {
    borderColor: 'rgba(123,47,255,0.85)',
    shadowOpacity: 0.8,
  },

  // Text field
  inputField: {
    flex: 1,
    color: '#ECECF1',
    fontSize: fontScale(16),
    lineHeight: fontScale(22),
    paddingTop: Platform.OS === 'ios' ? spacing(8) : spacing(6),
    paddingBottom: Platform.OS === 'ios' ? spacing(8) : spacing(6),
    paddingRight: spacing(8),
    maxHeight: verticalScale(120),
  },
  // Keep flex:1 space but hide text while mic is live (no layout change)
  // Also lock height to a single line so interim transcripts can't grow the bar.
  inputFieldHidden: { opacity: 0, maxHeight: verticalScale(36) },

  // Waveform overlay — sits over the invisible TextInput, never adds height
  waveformOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Align with the text field's left padding; pull back before the buttons
    left: spacing(16),
    right: verticalScale(32) * 2 + spacing(4) + spacing(6) + spacing(6),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(8),
    zIndex: 2,
    overflow: 'hidden',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_H,
    width: WAVE_W,
  },
  waveBar: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: BAR_W / 2,
    backgroundColor: '#A78BFA',
  },
  listeningLabel: {
    fontSize: fontScale(13),
    color: 'rgba(167,139,250,0.75)',
    fontWeight: '500',
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  // Buttons — shared base for the rightmost circular action slot
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
  sendBtnActive:   { backgroundColor: '#FFFFFF' },
  sendBtnInactive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  stopBtnActive:   { backgroundColor: '#EF4444' },

  // Live button idle state — purple circle border, no fill
  liveBtnIdle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.45)',
  },

  // Mic button
  micBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: verticalScale(18),
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.45)',
    marginBottom: spacing(2),
    marginRight: spacing(10),
  },
  micBtnActive: {
    backgroundColor: 'rgba(123,47,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.65)',
  },
  micBtnError: {
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
  },

  // Loading scrim
  inputBarScrim: { ...StyleSheet.absoluteFillObject, borderRadius: radius(26) },
});
