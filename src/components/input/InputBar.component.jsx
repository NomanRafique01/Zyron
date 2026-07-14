import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Platform } from 'react-native';
import C from '../../config/colors.config';
import { SendIcon, StopIcon } from '../shared/Icons';
import {
  fontScale,
  spacing,
  radius,
  verticalScale,
  scale,
} from '../../utils/responsive.utils';

// ─── Agent accent color map ──────────────────────────
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

function MiniAgentDot({ name, role, status }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isActive = status !== 'done' && status !== 'queued' && status !== 'error';
  const isDone = status === 'done';
  const isError = status === 'error';
  const accent = AGENT_ACCENT[role] || AGENT_ACCENT[name] || C.cyan;

  useEffect(() => {
    if (!isActive) {
      pulseAnim.setValue(1);
      return undefined;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isActive, pulseAnim]);

  let dotColor = '#333344';
  if (isDone) dotColor = C.green;
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

function AgentStrip({ agents, isTyping }) {
  if (!isTyping || !agents?.length) return null;
  const doneCount = agents.filter((a) => a.status === 'done' || a.status === 'error').length;

  return (
    <View style={s.agentStrip}>
      <View style={s.stripContent}>
        <View style={s.stripDots}>
          {agents.map((agent, i) => (
            <MiniAgentDot key={i} {...agent} />
          ))}
        </View>
        <Text style={s.stripStatus}>{doneCount}/{agents.length} complete</Text>
      </View>
    </View>
  );
}

export default function InputBar({
  inputText,
  setInputText,
  isTyping,
  onSend,
  onStop,
  keyboardVisible,
  simulatedAgents,
  offline,
  loading = false,
  floating = false,
  docked = false,
  chatMode = false,
  onInputPressIn,
  placeholder = 'Message Zyron',
  inputRef,
}) {
  const hasText = inputText.trim().length > 0;
  const sendBtnSize = verticalScale(32);
  // Treat loading the same as offline for interactivity — nothing is editable/sendable
  const blocked = isTyping || offline || loading;

  const handleSend = () => {
    inputRef?.current?.blur();
    requestAnimationFrame(onSend);
  };

  return (
    <View style={[
      s.inputBar,
      floating && s.inputBarFloating,
      docked && s.inputBarDocked,
      chatMode && s.inputBarChat,
      loading && s.inputBarLoading,
    ]}>
      <AgentStrip agents={simulatedAgents} isTyping={isTyping} />

      <View style={[s.inputContainer, floating && s.inputContainerFloating, offline && s.inputContainerOffline]}>
        <TextInput
          ref={inputRef}
          style={s.inputField}
          placeholder={offline ? 'You are offline' : placeholder}
          placeholderTextColor="#6B6B7A"
          selectionColor={C.purpleSoft}
          value={inputText}
          onChangeText={setInputText}
          onPressIn={onInputPressIn}
          onSubmitEditing={blocked ? null : handleSend}
          returnKeyType="send"
          editable={!blocked}
          multiline
          blurOnSubmit={false}
        />

        {isTyping ? (
          <TouchableOpacity
            style={[s.sendBtn, s.stopBtnActive, { width: sendBtnSize, height: sendBtnSize, borderRadius: sendBtnSize / 2 }]}
            onPress={onStop}
            activeOpacity={0.85}
          >
            <StopIcon color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              s.sendBtn,
              { width: sendBtnSize, height: sendBtnSize, borderRadius: sendBtnSize / 2 },
              hasText && !offline && !loading ? s.sendBtnActive : s.sendBtnInactive,
            ]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={!hasText || offline || loading}
          >
            <SendIcon isActive={hasText && !offline && !loading} color={hasText && !offline && !loading ? '#0E0E18' : '#6B6B7A'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Non-interactive scrim over the bar while conversation is loading */}
      {loading && (
        <View style={[s.inputBarScrim, { pointerEvents: 'box-only' }]} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  inputBar: {
    paddingHorizontal: spacing(16),
    paddingTop: spacing(8),
    paddingBottom: Platform.select({
      ios: spacing(24),
      android: spacing(20),
    }),
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
  agentStrip: {
    marginBottom: spacing(8),
  },
  stripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius(10),
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(5),
    minHeight: verticalScale(30),
  },
  stripDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(10),
  },
  miniAgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  miniDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  miniAgentName: {
    fontSize: fontScale(9),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  stripStatus: {
    fontSize: fontScale(9),
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0D0D16',
    borderWidth: 1.5,
    borderColor: 'rgba(123, 47, 255, 0.45)',
    borderRadius: radius(26),
    paddingLeft: spacing(16),
    paddingRight: spacing(6),
    paddingVertical: spacing(6),
    minHeight: verticalScale(48),
    maxHeight: verticalScale(140),
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
  },
  inputContainerFloating: {
    backgroundColor: '#0D0D16',
    borderColor: 'rgba(123, 47, 255, 0.5)',
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
  },
  inputContainerOffline: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
  },
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
  sendBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
  sendBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  sendBtnInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  stopBtnActive: {
    backgroundColor: '#EF4444',
  },
  inputBarLoading: {
    opacity: 0.38,
  },
  inputBarScrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius(26),
  },
});
