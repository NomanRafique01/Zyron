/**
 * SuggestionChips.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders 2-3 horizontally scrollable tappable chips below the last AI response
 * bubble. Tapping a chip fires it as the next user message and hides the chips.
 *
 * Props
 * ──────
 *   suggestions  {string[]}  — array of 2-3 short follow-up strings
 *   onChipPress  {function}  — (text: string) => void — called when a chip is tapped
 *
 * Design: Zyron dark-purple / neon theme — matches bgBubbleAi + purple accent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Animated,
  StyleSheet,
} from 'react-native';

// Animated wrapper so chips fade in smoothly when they arrive
function SuggestionChips({ suggestions, onChipPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!suggestions || suggestions.length === 0) {
      fadeAnim.setValue(0);
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      delay: 80,          // tiny delay so the response bubble renders first
      useNativeDriver: true,
    }).start();
  }, [suggestions]);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {suggestions.map((text, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.72}
            onPress={() => onChipPress(text)}
            style={styles.chip}
          >
            {/* Left accent bar — neon purple glow */}
            <View style={styles.chipAccent} />
            <Text style={styles.chipText} numberOfLines={2}>
              {text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Sits directly below the last AI bubble; the caller controls top margin.
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
    alignItems: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162A',
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 255, 0.38)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingRight: 12,
    paddingLeft: 0,
    maxWidth: 220,
    // subtle purple shadow
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  chipAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: '#7B2FFF',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 9,
    opacity: 0.85,
  },
  chipText: {
    color: '#C4B5FD',       // purpleSoft — warm, readable, on-brand
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    flexShrink: 1,
  },
});

export default React.memo(SuggestionChips);
