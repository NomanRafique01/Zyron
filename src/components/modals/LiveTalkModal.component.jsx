/**
 * LiveTalkModal.component.jsx  — Premium Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen overlay for Zyron Live Talk Mode.
 *
 * Features:
 *  • Slide-up entrance / fade-out exit animation
 *  • Central glowing ORB with breathing pulse per phase
 *  • Three layered orbital rings with staggered pulse
 *  • Phase label pill with cross-fade transition
 *  • User transcript card — shown only while listening, hidden when Zyron speaks
 *  • Small "Speaking" toggle pill (tap to interrupt) replaces the big panel
 *
 * Animation rules:
 *  - All Animated transforms use useNativeDriver:true → 60 fps GPU thread
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  StatusBar,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../../config/colors.config';
import { CrossIcon } from '../shared/Icons';
import {
  scale, verticalScale, fontScale, spacing, radius, screenHeight,
} from '../../utils/responsive.utils';

// ORB sizes (responsive)
const ORB_SIZE   = scale(120);
const RING1_SIZE = scale(168);
const RING2_SIZE = scale(228);
const RING3_SIZE = scale(300);

// Phase accent colours — purple-only palette
const PHASE_COLOR = {
  idle:      '#2A2A40',
  listening: C.purpleSoft,   // #A78BFA
  thinking:  '#C084FC',      // lighter purple
  speaking:  '#D946EF',      // fuchsia-purple
  error:     '#EF4444',
};

const PHASE_LABEL = {
  idle:      '',
  listening: 'Listening',
  thinking:  'Thinking',
  speaking:  'Speaking',
  error:     'Error',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hex2rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ─── OrbCore ─────────────────────────────────────────────────────────────────
// Central glowing orb that breathes per phase. Pure Animated, no re-renders.
function OrbCore({ phase }) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0.55)).current;
  const phaseRef   = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    let loop;
    const base   = phase === 'idle' || phase === 'error' ? 0.9  : 1.0;
    const peak   = phase === 'speaking'                   ? 1.10 :
                   phase === 'listening'                  ? 1.07 :
                   phase === 'thinking'                   ? 1.05 : 0.94;
    const dur    = phase === 'thinking'  ? 900 :
                   phase === 'speaking'  ? 650 :
                   phase === 'listening' ? 750 : 1200;
    const glowLo = phase === 'idle' ? 0.10 : 0.30;
    const glowHi = phase === 'speaking' ? 0.80 :
                   phase === 'listening' ? 0.65 :
                   phase === 'thinking'  ? 0.55 : 0.15;

    loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: peak, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowAnim,  { toValue: glowHi, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: base, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowAnim,  { toValue: glowLo, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, scaleAnim, glowAnim]);

  const color = PHASE_COLOR[phase] || PHASE_COLOR.idle;
  const orbBg = phase === 'idle' || phase === 'error'
    ? 'rgba(20,20,35,0.95)'
    : phase === 'listening'
      ? 'rgba(80,40,180,0.60)'
      : phase === 'speaking'
        ? 'rgba(140,30,160,0.52)'
        : 'rgba(100,40,200,0.50)';

  return (
    <Animated.View
      style={[
        styles.orbWrap,
        { transform: [{ scale: scaleAnim }] },
      ]}
      pointerEvents="none"
    >
      {/* Outer glow halo */}
      <Animated.View
        style={[
          styles.orbGlow,
          {
            backgroundColor: hex2rgba(color === '#2A2A40' ? '#7B2FFF' : color, 0),
            shadowColor: color,
            shadowOpacity: glowAnim,
          },
        ]}
      />
      {/* Solid orb core */}
      <View style={[styles.orbCore, { backgroundColor: orbBg, borderColor: hex2rgba(color, 0.55) }]}>
        {/* Inner highlight ring */}
        <View style={[styles.orbInner, { borderColor: hex2rgba(color, 0.35) }]} />
      </View>
    </Animated.View>
  );
}

// ─── OrbRings ─────────────────────────────────────────────────────────────────
// Three concentric orbital rings with staggered pulse animations.
function OrbRings({ phase }) {
  const rings = useRef([
    new Animated.Value(0.55),
    new Animated.Value(0.30),
    new Animated.Value(0.18),
  ]).current;

  useEffect(() => {
    const durations = [1600, 2200, 3000];
    const peaks = phase === 'idle' || phase === 'error'
      ? [0.20, 0.10, 0.06]
      : phase === 'speaking'
        ? [0.90, 0.55, 0.28]
        : phase === 'listening'
          ? [0.75, 0.42, 0.22]
          : [0.55, 0.32, 0.16];  // thinking

    const loops = rings.map((ring, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring, { toValue: peaks[i], duration: durations[i], easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(ring, { toValue: peaks[i] * 0.25, duration: durations[i], easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      )
    );
    const parallel = Animated.parallel(loops);
    parallel.start();
    return () => parallel.stop();
  }, [phase, rings]);

  const color = PHASE_COLOR[phase] || PHASE_COLOR.idle;
  const ringColor = color === '#2A2A40' ? '#7B2FFF' : color;

  const sizes = [RING1_SIZE, RING2_SIZE, RING3_SIZE];

  return (
    <>
      {rings.map((ring, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.orbRingBase,
            {
              width: sizes[i],
              height: sizes[i],
              borderRadius: sizes[i] / 2,
              borderColor: hex2rgba(ringColor, 0.6),
              opacity: ring,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── PhasePill ────────────────────────────────────────────────────────────────
// Small pill with label + animated dot. Fades in/out on phase change.
function PhasePill({ phase }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const label    = PHASE_LABEL[phase] || '';
  const color    = PHASE_COLOR[phase] || PHASE_COLOR.idle;

  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [phase, fadeAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 0.25, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1,    duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dotPulse]);

  if (!label) return null;

  return (
    <Animated.View style={[styles.phasePill, { borderColor: hex2rgba(color, 0.35), backgroundColor: hex2rgba(color, 0.10), opacity: fadeAnim }]}>
      <Animated.View style={[styles.phaseDot, { backgroundColor: color, opacity: dotPulse }]} />
      <Text style={[styles.phasePillText, { color }]}>{label}</Text>
    </Animated.View>
  );
}

// ─── SpeakingToggle ───────────────────────────────────────────────────────────
// Small professional pill that shows while Zyron is speaking. Tap to interrupt.
function SpeakingToggle({ onPress }) {
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1,   duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dotOpacity]);

  return (
    <TouchableOpacity
      style={styles.speakingToggle}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
    >
      <Animated.View style={[styles.speakingDot, { opacity: dotOpacity }]} />
      <Text style={styles.speakingToggleText}>Speaking</Text>
      <Text style={styles.speakingToggleSub}>  ·  tap to interrupt</Text>
    </TouchableOpacity>
  );
}

// ─── FadeCard ─────────────────────────────────────────────────────────────────
// Wrapper that fades in a card on mount.
function FadeCard({ children, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [fade]);
  return (
    <Animated.View style={[style, { opacity: fade }]}>
      {children}
    </Animated.View>
  );
}

// ─── LiveTalkModal ────────────────────────────────────────────────────────────
export default function LiveTalkModal({
  visible,
  phase,
  volumeRef,
  transcript,
  errorMsg,
  onStop,
  onInterrupt,
}) {
  const insets = useSafeAreaInsets();

  // Slide-up entrance
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 180,
          mass: 1,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(screenHeight);
      bgOpacity.setValue(0);
    }
  }, [visible, slideAnim, bgOpacity]);

  const isAISpeaking = phase === 'speaking';
  const isListening  = phase === 'listening';
  const isThinking   = phase === 'thinking';
  const isError      = phase === 'error';

  const phaseColor = PHASE_COLOR[phase] || PHASE_COLOR.idle;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent
      onRequestClose={onStop}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Dim background */}
      <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]} />

      {/* Slide-up sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingTop:    insets.top + spacing(14),
            paddingBottom: insets.bottom + spacing(20),
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >

        {/* ── Top bar ─────────────────────────────────────── */}
        <View style={styles.topBar}>
          {/* Live badge */}
          <View style={styles.liveBadge}>
            <View style={[styles.liveBadgeDot, { backgroundColor: phaseColor }]} />
            <Text style={[styles.liveBadgeText, { color: phaseColor }]}>LIVE TALK</Text>
          </View>

          {/* Close */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onStop}
            activeOpacity={0.7}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <CrossIcon color="#7A7A94" />
          </TouchableOpacity>
        </View>

        {/* ── Orb + rings area ─────────────────────────────── */}
        <View style={styles.orbArea}>
          {/* Rings behind orb */}
          <OrbRings phase={phase} />

          {/* ORB */}
          <OrbCore phase={phase} />
        </View>

        {/* Phase pill — hidden when AI is speaking (SpeakingToggle already labels it) */}
        {!isAISpeaking && (
          <View style={styles.pillRow}>
            <PhasePill phase={phase} />
          </View>
        )}

        {/* ── Text cards ──────────────────────────────────── */}
        <View style={styles.textArea}>
          {/* User transcript — only visible while actively listening */}
          {isListening && transcript ? (
            <FadeCard style={styles.transcriptCard} key={`tr-${transcript?.slice(0, 8)}`}>
              <Text style={styles.cardLabel}>YOU</Text>
              <Text style={styles.transcriptText} numberOfLines={3}>
                {transcript}
              </Text>
            </FadeCard>
          ) : null}

          {isError && (
            <FadeCard style={styles.errorCard}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMsg}>{errorMsg}</Text>
            </FadeCard>
          )}
        </View>

        {/* ── Bottom action ─────────────────────────────── */}
        <View style={styles.bottomBar}>
          {isAISpeaking ? (
            <SpeakingToggle onPress={onInterrupt} />
          ) : isError ? (
            <TouchableOpacity
              onPress={onStop}
              activeOpacity={0.75}
              hitSlop={{ top: 16, bottom: 16, left: 32, right: 32 }}
            >
              <Text style={styles.hintClose}>Tap × to close</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.hintText}>
              {isListening ? 'Speak now — I\'m listening…'
                : isThinking ? 'Processing your message…'
                : ''}
            </Text>
          )}
        </View>

      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,4,12,0.88)',
  },

  sheet: {
    flex: 1,
    backgroundColor: '#07070F',
    borderTopLeftRadius: radius(28),
    borderTopRightRadius: radius(28),
    overflow: 'hidden',
    // Top separator glow line
    borderTopWidth: 1,
    borderTopColor: 'rgba(123,47,255,0.22)',
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(22),
    marginBottom: spacing(4),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(7),
    backgroundColor: 'rgba(123,47,255,0.10)',
    borderRadius: radius(20),
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.20)',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(5),
  },
  liveBadgeDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
  },
  liveBadgeText: {
    fontSize: fontScale(10),
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  closeBtn: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Orb + rings ──
  orbArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRingBase: {
    position: 'absolute',
    borderWidth: 1,
  },
  orbWrap: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: ORB_SIZE * 1.55,
    height: ORB_SIZE * 1.55,
    borderRadius: (ORB_SIZE * 1.55) / 2,
    shadowRadius: scale(42),
    shadowOffset: { width: 0, height: 0 },
  },
  orbCore: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: ORB_SIZE * 0.6,
    height: ORB_SIZE * 0.6,
    borderRadius: (ORB_SIZE * 0.6) / 2,
    borderWidth: 1,
  },

  // ── Phase pill ──
  pillRow: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(6),
    minHeight: verticalScale(28),
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(6),
    borderRadius: radius(20),
    borderWidth: 1,
    paddingHorizontal: spacing(14),
    paddingVertical: spacing(5),
  },
  phaseDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  phasePillText: {
    fontSize: fontScale(12),
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // ── Text cards ──
  textArea: {
    paddingHorizontal: spacing(20),
    gap: spacing(10),
    paddingBottom: spacing(10),
  },
  transcriptCard: {
    backgroundColor: 'rgba(123,47,255,0.09)',
    borderRadius: radius(14),
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.22)',
    padding: spacing(14),
  },
  errorCard: {
    backgroundColor: 'rgba(239,68,68,0.09)',
    borderRadius: radius(14),
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.28)',
    padding: spacing(16),
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: C.purpleSoft,
    letterSpacing: 1.2,
    marginBottom: spacing(5),
  },
  transcriptText: {
    color: '#CCC8EC',
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: fontScale(13),
    fontWeight: '700',
    marginBottom: spacing(4),
  },
  errorMsg: {
    color: '#F5ADAD',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    textAlign: 'center',
  },

  // ── Bottom bar ──
  bottomBar: {
    paddingHorizontal: spacing(24),
    alignItems: 'center',
    minHeight: verticalScale(56),
    justifyContent: 'center',
  },
  // Speaking toggle pill
  speakingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(6),
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderRadius: radius(20),
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    paddingHorizontal: spacing(14),
    paddingVertical: spacing(7),
  },
  speakingDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: C.purpleSoft,
  },
  speakingToggleText: {
    color: C.purpleSoft,
    fontSize: fontScale(12),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  speakingToggleSub: {
    color: '#6B5EA8',
    fontSize: fontScale(11),
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  hintText: {
    color: '#3E3E58',
    fontSize: fontScale(12),
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  hintClose: {
    color: '#EF4444',
    fontSize: fontScale(12),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
