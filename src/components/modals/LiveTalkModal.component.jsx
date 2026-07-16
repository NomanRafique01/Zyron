/**
 * LiveTalkModal.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen overlay for Zyron Live Talk Mode.
 *
 * Displays:
 *  • Phase-aware label  (Listening / Thinking / Speaking / Error)
 *  • Lightweight audio-reactive waveform animation (6 bars, rAF-driven)
 *  • Live transcript of user speech
 *  • Streaming AI text (word by word)
 *  • Tap-to-interrupt while AI is speaking
 *  • Close (X) button to end session
 *
 * Animation strategy:
 *  - All bar animations use Animated API with useNativeDriver:true → GPU-free
 *  - Volume data comes from a plain ref (zero setState / re-renders)
 *  - rAF loop runs at ~30 fps — light on CPU and battery
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../../config/colors.config';
import { CrossIcon } from '../shared/Icons';
import {
  scale, verticalScale, fontScale, spacing, radius,
} from '../../utils/responsive.utils';

// ─── Waveform constants ───────────────────────────────────────────────────────
const BAR_COUNT  = 7;
const BAR_SHAPE  = [0.4, 0.65, 0.85, 1.0, 0.85, 0.65, 0.4];   // arch
const BAR_MIN    = 0.06;
const BAR_MAX    = 1.0;
const BAR_H      = verticalScale(52);
const BAR_W      = scale(5);
const BAR_GAP    = scale(5);
const WAVE_W     = BAR_COUNT * BAR_W + (BAR_COUNT - 1) * BAR_GAP;

// Phase-specific waveform colours
const PHASE_COLOR = {
  idle:      '#3B3B5A',
  listening: C.purpleSoft,      // #A78BFA
  thinking:  C.cyan,            // #00D4FF
  speaking:  C.cyan,
  error:     '#EF4444',
};

// Phase label text
const PHASE_LABEL = {
  idle:      '',
  listening: 'Listening…',
  thinking:  'Thinking…',
  speaking:  'Speaking…',
  error:     'Error',
};

// ─── LiveWaveform ─────────────────────────────────────────────────────────────
// Reads `volumeRef` at ~30 fps. Never causes a React re-render.
function LiveWaveform({ volumeRef, phase }) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(BAR_MIN))
  ).current;

  const idleLoopRef  = useRef(null);
  const phaseRef     = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const color = PHASE_COLOR[phase] || PHASE_COLOR.idle;

  const stopIdle = useCallback(() => {
    if (idleLoopRef.current) {
      idleLoopRef.current.stop();
      idleLoopRef.current = null;
    }
  }, []);

  const startIdle = useCallback(() => {
    if (idleLoopRef.current) return;
    const seqs = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: BAR_MIN + 0.18 * BAR_SHAPE[i],
            duration: 480 + i * 60,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: BAR_MIN,
            duration: 480 + i * 60,
            useNativeDriver: true,
          }),
        ])
      )
    );
    idleLoopRef.current = Animated.parallel(seqs);
    idleLoopRef.current.start();
  }, [bars]);

  const driveFromAmplitude = useCallback((amp) => {
    stopIdle();
    bars.forEach((bar, i) => {
      Animated.timing(bar, {
        toValue: Math.max(BAR_MIN, BAR_MIN + (BAR_MAX - BAR_MIN) * amp * BAR_SHAPE[i]),
        duration: 70,
        useNativeDriver: true,
      }).start();
    });
  }, [bars, stopIdle]);

  useEffect(() => {
    startIdle();
    let rafId;
    let lastAt = 0;

    const tick = () => {
      const vol = volumeRef.current;
      const now = Date.now();
      if (now - lastAt > 33) {
        lastAt = now;
        const p = phaseRef.current;
        if ((p === 'listening' || p === 'speaking') && vol !== null && vol !== undefined) {
          const amp = Math.min(1, Math.max(0, (vol / 10)));
          if (amp > 0.03) driveFromAmplitude(amp);
          else startIdle();
        } else if (p === 'thinking') {
          // Gentle pulse while thinking
          const t = (now / 800) % 1;
          const amp = 0.25 + 0.25 * Math.sin(t * Math.PI * 2);
          driveFromAmplitude(amp);
        } else {
          startIdle();
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      stopIdle();
    };
  }, [volumeRef, driveFromAmplitude, startIdle, stopIdle]);

  return (
    <View style={styles.waveRow} pointerEvents="none">
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              backgroundColor: color,
              transform: [{ scaleY: bar }],
              marginLeft: i === 0 ? 0 : BAR_GAP,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── LiveTalkModal ────────────────────────────────────────────────────────────
export default function LiveTalkModal({
  visible,
  phase,
  volumeRef,
  transcript,
  aiText,
  errorMsg,
  onStop,          // close + stop session
  onInterrupt,     // interrupt AI mid-speech
}) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in/out the overlay
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  const isAISpeaking  = phase === 'speaking';
  const isListening   = phase === 'listening';
  const isThinking    = phase === 'thinking';
  const isError       = phase === 'error';

  const phaseLabel   = PHASE_LABEL[phase] || '';
  const phaseColor   = PHASE_COLOR[phase] || PHASE_COLOR.idle;

  // Pulsing dot for thinking state
  const dotPulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (!isThinking) { dotPulse.setValue(0.5); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isThinking, dotPulse]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onStop}
    >
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />

      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>

        {/* ── Top bar ── */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing(12) }]}>
          <View style={styles.topBarLeft}>
            <View style={[styles.liveDot, { backgroundColor: phaseColor }]} />
            <Text style={[styles.topLabel, { color: phaseColor }]}>LIVE TALK</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onStop}
            activeOpacity={0.75}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <CrossIcon color="#8A8A9D" />
          </TouchableOpacity>
        </View>

        {/* ── Main waveform area ── */}
        <View style={styles.waveArea}>
          {/* Orbital rings — purely decorative, CSS-only, no GPU cost */}
          <View style={styles.ring1} pointerEvents="none" />
          <View style={styles.ring2} pointerEvents="none" />

          {/* Waveform */}
          <LiveWaveform volumeRef={volumeRef} phase={phase} />

          {/* Phase label with pulsing indicator */}
          <View style={styles.phaseLabelRow}>
            {isThinking && (
              <Animated.View style={[styles.thinkingDot, { opacity: dotPulse, backgroundColor: C.cyan }]} />
            )}
            <Text style={[styles.phaseLabel, { color: phaseColor }]}>{phaseLabel}</Text>
          </View>
        </View>

        {/* ── Text area ── */}
        <View style={styles.textArea}>
          {/* User transcript */}
          {(isListening || transcript) && !isError && (
            <View style={styles.transcriptBlock}>
              <Text style={styles.transcriptLabel}>You</Text>
              <Text style={styles.transcriptText} numberOfLines={3}>
                {transcript || '…'}
              </Text>
            </View>
          )}

          {/* AI text stream */}
          {(isThinking || isAISpeaking || aiText) && !isError && (
            <View style={styles.aiBlock}>
              <Text style={styles.aiLabel}>Zyron</Text>
              <Text style={styles.aiText} numberOfLines={6}>
                {aiText || '…'}
              </Text>
            </View>
          )}

          {/* Error state */}
          {isError && (
            <View style={styles.errorBlock}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMsg}>{errorMsg}</Text>
            </View>
          )}
        </View>

        {/* ── Bottom action ── */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing(16) }]}>
          {isAISpeaking ? (
            // Tap anywhere to interrupt
            <TouchableOpacity
              style={styles.interruptBtn}
              onPress={onInterrupt}
              activeOpacity={0.8}
            >
              <View style={[styles.interruptDot, { backgroundColor: C.cyan }]} />
              <Text style={styles.interruptBtnText}>Tap to interrupt</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.hintText}>
              {isListening ? 'Speak now…' : isThinking ? 'Processing your message…' : isError ? 'Tap × to close' : ''}
            </Text>
          )}
        </View>

      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#07070F',
    justifyContent: 'space-between',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(20),
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(7),
  },
  liveDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  topLabel: {
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  closeBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Waveform area
  waveArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Decorative rings — border-only circles, no shadows = zero GPU cost
  ring1: {
    position: 'absolute',
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.12)',
  },
  ring2: {
    position: 'absolute',
    width: scale(280),
    height: scale(280),
    borderRadius: scale(140),
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.06)',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_H,
    width: WAVE_W,
    marginBottom: spacing(20),
  },
  waveBar: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: BAR_W / 2,
  },

  // Phase label
  phaseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(6),
  },
  thinkingDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  phaseLabel: {
    fontSize: fontScale(14),
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Text area
  textArea: {
    paddingHorizontal: spacing(24),
    gap: spacing(12),
    paddingBottom: spacing(8),
  },
  transcriptBlock: {
    backgroundColor: 'rgba(123,47,255,0.1)',
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.25)',
    padding: spacing(12),
  },
  transcriptLabel: {
    fontSize: fontScale(10),
    fontWeight: '700',
    color: C.purpleSoft,
    letterSpacing: 0.8,
    marginBottom: spacing(4),
  },
  transcriptText: {
    color: '#D8D8F0',
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
    fontWeight: '400',
  },
  aiBlock: {
    backgroundColor: 'rgba(0,212,255,0.07)',
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    padding: spacing(12),
  },
  aiLabel: {
    fontSize: fontScale(10),
    fontWeight: '700',
    color: C.cyan,
    letterSpacing: 0.8,
    marginBottom: spacing(4),
  },
  aiText: {
    color: '#D8F4FF',
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
    fontWeight: '400',
  },
  errorBlock: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: spacing(14),
    alignItems: 'center',
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: fontScale(13),
    fontWeight: '700',
    marginBottom: spacing(4),
  },
  errorMsg: {
    color: '#F8C0C0',
    fontSize: fontScale(12),
    lineHeight: fontScale(17),
    textAlign: 'center',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing(24),
    alignItems: 'center',
    minHeight: verticalScale(64),
    justifyContent: 'center',
  },
  interruptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(8),
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderRadius: radius(24),
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.35)',
    paddingHorizontal: spacing(20),
    paddingVertical: spacing(12),
  },
  interruptDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  interruptBtnText: {
    color: C.cyan,
    fontSize: fontScale(13),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  hintText: {
    color: '#4E4E62',
    fontSize: fontScale(12),
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
