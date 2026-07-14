import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import C from '../../config/colors.config';

export default function AgentBadge({ mode }) {
  const isAgents = mode === 'agents';
  return (
    <View style={s.agentBadge}>
      <View style={[s.agentDot, { backgroundColor: isAgents ? C.cyan : C.green }]} />
      <Text style={s.agentBadgeText}>
        Zyron · {isAgents ? 'agent mode' : 'fast mode'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingLeft: 4,
  },
  agentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  agentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 0.3,
  },
});
