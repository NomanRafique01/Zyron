/**
 * WebSearchTicker.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium animated ticker bar shown only while a web search is actively
 * executing (either via the backend path or the local orchestrator path).
 *
 * Props:
 *   isWebSearching {boolean} — mount/unmount gate; when false the component
 *                              never renders at all.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

// ── Ticker content ────────────────────────────────────────────────────────────
const TICKER_TEXT =
  'Web Searching...  ·  Fetching live data  ·  Scanning sources  ·  Retrieving results  ·  Analyzing web content  ·  Cross-referencing information  ·  ';

// Duplicate the string so the scroll loop is seamless.
const TICKER_LOOP = TICKER_TEXT + TICKER_TEXT;

// Approximate char-width of one copy at fontSize 11 (empirically ~6.5 px/char).
const CHAR_WIDTH       = 6.5;
const SINGLE_COPY_PX   = TICKER_TEXT.length * CHAR_WIDTH;
const SCROLL_DURATION  = 22000; // ms for one full single-copy scroll

// ─────────────────────────────────────────────────────────────────────────────

export default function WebSearchTicker({ isWebSearching }) {
  // Mounting logic: keep the component in the tree during the fade-out so the
  // animation can play before it fully unmounts.
  const [mounted, setMounted] = useState(false);
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scrollAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;

  // ── Mount / unmount gate ─────────────────────────────────────────────────
  useEffect(() => {
    if (isWebSearching) {
      setMounted(true);
    }
  }, [isWebSearching]);

  // ── Fade in / out ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    if (isWebSearching) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out → then unmount
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [isWebSearching, mounted]);

  // ── Continuous marquee scroll ────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    scrollAnim.setValue(0);

    const loop = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -SINGLE_COPY_PX,
        duration: SCROLL_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [mounted]);

  // ── Pulse dot ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      {/* Left accent indicator */}
      <View style={s.leftIndicator}>
        <Animated.View style={[s.pulseDot, { opacity: pulseAnim }]} />
      </View>

      {/* Scrolling marquee */}
      <View style={s.marqueeClip}>
        <Animated.Text
          style={[s.tickerText, { transform: [{ translateX: scrollAnim }] }]}
          numberOfLines={1}
        >
          {TICKER_LOOP}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderLeftWidth: 2,
    borderLeftColor: '#7B2FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 47, 255, 0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 47, 255, 0.15)',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 0,
    overflow: 'hidden',
    marginBottom: 4,
  },
  leftIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginRight: 8,
    flexShrink: 0,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7B2FFF',
  },
  marqueeClip: {
    flex: 1,
    overflow: 'hidden',
    height: 18,
    justifyContent: 'center',
  },
  tickerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#C4B5FD',
    letterSpacing: 0.3,
    lineHeight: 18,
    whiteSpace: 'nowrap',
  },
});
