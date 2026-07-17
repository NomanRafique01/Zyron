import React, { useRef, useEffect } from 'react';
import { View, Text, Image, Animated, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import C from '../../config/colors.config';
import { CrossIcon } from '../shared/Icons';
import { AGENT_KEYS, AGENT_ATTRIBUTION, getDemoTokens } from './chatBubble.constants.js';
import { s } from './chatBubble.styles.js';

// ─── Agent Attribution Legend Panel ──────────────────
export function VisualLegend({ onClose }) {
  return (
    <View style={s.legendCard}>
      <View style={s.legendContent}>
        <View style={s.legendHeader}>
          <Text style={s.legendTitle}>Attribution Map</Text>
          <TouchableOpacity onPress={onClose} style={s.legendCloseBtn} activeOpacity={0.7}>
            <CrossIcon color={C.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={s.legendGrid}>
          {AGENT_KEYS.map(key => (
            <View key={key} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: AGENT_ATTRIBUTION[key].color }]} />
              <Text style={s.legendText}>{AGENT_ATTRIBUTION[key].label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Token Usage Expandable Panel ────────────────────
export function TokenUsagePanel({ tokenUsage, mode, expanded, setExpanded }) {
  const isAgents = mode === 'agents';
  const themeColor = isAgents ? C.purpleSoft : C.purple;
  const metrics = tokenUsage || getDemoTokens(mode);

  const rows = Object.entries(metrics).map(([agentName, usage]) => ({
    name: agentName,
    prompt: usage.prompt_tokens || 0,
    completion: usage.completion_tokens || 0,
    total: usage.total_tokens || (usage.prompt_tokens + usage.completion_tokens) || 0,
  }));

  const totalPrompt     = rows.reduce((sum, r) => sum + r.prompt, 0);
  const totalCompletion = rows.reduce((sum, r) => sum + r.completion, 0);
  const totalTokens     = rows.reduce((sum, r) => sum + r.total, 0);

  if (!expanded) return null;

  return (
    <View style={[
      s.tokenTable,
      { borderColor: isAgents ? 'rgba(123, 47, 255, 0.25)' : 'rgba(0, 212, 255, 0.25)' }
    ]}>
      <View style={s.tokenTableHeader}>
        <Text style={[s.tokenTableTitle, { color: themeColor }]}>Token Metrics</Text>
        <View style={[s.tokenBadge, { borderColor: themeColor + '40', backgroundColor: themeColor + '12' }]}>
          <Text style={[s.tokenBadgeText, { color: themeColor }]}>{totalTokens.toLocaleString()}</Text>
        </View>
      </View>

      <View style={s.tableHeaderRow}>
        <Text style={[s.tableHeaderCell, s.colAgent, { color: themeColor }]}>Agent</Text>
        <Text style={[s.tableHeaderCell, s.colVal, { color: themeColor }]}>Prompt</Text>
        <Text style={[s.tableHeaderCell, s.colVal, { color: themeColor }]}>Compl.</Text>
        <Text style={[s.tableHeaderCell, s.colVal, { color: themeColor }]}>Total</Text>
      </View>

      {rows.map((row, idx) => {
        const roleKey    = AGENT_KEYS[idx % AGENT_KEYS.length];
        const agentColor = AGENT_ATTRIBUTION[roleKey]?.color || '#A7A7C0';
        return (
          <View key={idx} style={[s.tableRow, idx % 2 === 0 && s.tableRowAlt]}>
            <View style={[s.colAgent, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: agentColor }} />
              <Text style={[s.tableCell, s.cellAgentName]}>{row.name}</Text>
            </View>
            <Text style={[s.tableCell, s.colVal]}>{row.prompt}</Text>
            <Text style={[s.tableCell, s.colVal]}>{row.completion}</Text>
            <Text style={[s.tableCell, s.colVal, s.cellTotalVal]}>{row.total}</Text>
          </View>
        );
      })}

      {isAgents && rows.length > 1 && (
        <View style={s.tableTotalRow}>
          <Text style={[s.tableCell, s.colAgent, s.cellTotalLabel]}>Total Agents</Text>
          <Text style={[s.tableCell, s.colVal, s.cellTotalVal]}>{totalPrompt}</Text>
          <Text style={[s.tableCell, s.colVal, s.cellTotalVal]}>{totalCompletion}</Text>
          <Text style={[s.tableCell, s.colVal, s.cellTotalFinal]}>{totalTokens}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Custom User Avatar SVG ──────────────────────────
export function UserAvatar() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill="#2E1A47" />
      <Circle cx="12" cy="8" r="4" fill={C.purple} />
      <Path
        d="M5 19C5 15.6863 8.13401 13 12 13C15.866 13 19 15.6863 19 19"
        stroke={C.purple}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Custom AI Avatar ─────────────────────────────────
export function AiAvatar() {
  return (
    <View style={s.aiAvatarContainer}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={s.aiAvatarImage}
        resizeMode="contain"
      />
    </View>
  );
}

// ─── Pulsing Dot Indicator (for Fast mode typing) ─────
export function PulsingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={s.pulsingDotsRow}>
      <Animated.View style={[s.pulsingDot, s.pulsingDotCyan, { opacity: dot1 }]} />
      <Animated.View style={[s.pulsingDot, s.pulsingDotCyan, { opacity: dot2 }]} />
      <Animated.View style={[s.pulsingDot, s.pulsingDotCyan, { opacity: dot3 }]} />
    </View>
  );
}
