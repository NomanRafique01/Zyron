/**
 * TeamBuilderPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom Team Builder — Agents Workshop
 *
 * Builds a complete team object matching the existing team schema.
 * All four role slots must be filled before registration.
 * No new runtime paths are created — the team is inserted into the
 * unified teams collection and behaves identically to built-in teams.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import Svg, { Circle, Rect, Polygon, Path, Ellipse, Line, G } from 'react-native-svg';
import C from '../../config/colors.config';
import {
  saveCustomTeam,
  generateTeamId,
} from '../../agents/workshop/customTeamsStorage';
import { CrossIcon, TeamBuilderIcon } from '../shared/Icons';
import { ICON_OPTIONS } from './AgentBuilderPanel.component';

const ROLE_SLOTS = ['reasoner', 'coder', 'vision', 'writer'];
const ROLE_LABELS = {
  reasoner: 'Agent 1',
  coder:    'Agent 2',
  vision:   'Agent 3',
  writer:   'Agent 4',
};

// ── 8 unique team SVG icons ───────────────────────────────────────────────────

const TEAM_ICON_OPTIONS = [
  {
    key: 'shield',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Path
          d="M14 3L4 7v7c0 5.5 4.3 10.6 10 12 5.7-1.4 10-6.5 10-12V7L14 3z"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path
          d="M10 14l3 3 5-5"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    ),
  },
  {
    key: 'network',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Circle cx={14} cy={14} r={3} fill={color} />
        <Circle cx={5} cy={7} r={2.5} fill="none" stroke={color} strokeWidth={1.6} />
        <Circle cx={23} cy={7} r={2.5} fill="none" stroke={color} strokeWidth={1.6} />
        <Circle cx={5} cy={21} r={2.5} fill="none" stroke={color} strokeWidth={1.6} />
        <Circle cx={23} cy={21} r={2.5} fill="none" stroke={color} strokeWidth={1.6} />
        <Line x1={7} y1={8.5} x2={12} y2={13} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        <Line x1={21} y1={8.5} x2={16} y2={13} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        <Line x1={7} y1={19.5} x2={12} y2={15} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        <Line x1={21} y1={19.5} x2={16} y2={15} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: 'rocket',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Path
          d="M14 4c0 0-6 4-6 11v1l2 2h8l2-2v-1c0-7-6-11-6-11z"
          fill="none"
          stroke={color}
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        <Path
          d="M10 18l-2 4h12l-2-4"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <Circle cx={14} cy={13} r={2} fill="none" stroke={color} strokeWidth={1.5} />
      </Svg>
    ),
  },
  {
    key: 'hexagon',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Polygon
          points="14,3 24,8.5 24,19.5 14,25 4,19.5 4,8.5"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Polygon
          points="14,8 19,10.8 19,17.2 14,20 9,17.2 9,10.8"
          fill={color}
          opacity={0.25}
        />
        <Polygon
          points="14,8 19,10.8 19,17.2 14,20 9,17.2 9,10.8"
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'crown',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Path
          d="M4 20h20M4 20l3-10 7 6 7-6 3 10"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={14} cy={8} r={2} fill={color} />
        <Circle cx={4.5} cy={9.5} r={1.5} fill={color} />
        <Circle cx={23.5} cy={9.5} r={1.5} fill={color} />
      </Svg>
    ),
  },
  {
    key: 'atom',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Circle cx={14} cy={14} r={2.5} fill={color} />
        <Ellipse cx={14} cy={14} rx={10} ry={4} fill="none" stroke={color} strokeWidth={1.5} />
        <Ellipse
          cx={14} cy={14} rx={10} ry={4}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          transform="rotate(60 14 14)"
        />
        <Ellipse
          cx={14} cy={14} rx={10} ry={4}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          transform="rotate(120 14 14)"
        />
      </Svg>
    ),
  },
  {
    key: 'lightning',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Path
          d="M16 3L7 16h8l-3 9 10-13h-8L16 3z"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
  {
    key: 'diamond',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Path
          d="M14 3l10 8-10 14L4 11l10-8z"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path
          d="M4 11h20"
          stroke={color}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
        <Path
          d="M9 11L14 3M19 11L14 3"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
  {
    key: 'target',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Circle cx={14} cy={14} r={10} fill="none" stroke={color} strokeWidth={1.6} />
        <Circle cx={14} cy={14} r={6} fill="none" stroke={color} strokeWidth={1.4} />
        <Circle cx={14} cy={14} r={2.5} fill={color} />
        <Line x1={14} y1={4} x2={14} y2={7} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        <Line x1={14} y1={21} x2={14} y2={24} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        <Line x1={4} y1={14} x2={7} y2={14} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        <Line x1={21} y1={14} x2={24} y2={14} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: 'eye',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Path
          d="M3 14c0 0 4-8 11-8s11 8 11 8-4 8-11 8S3 14 3 14z"
          fill="none"
          stroke={color}
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        <Circle cx={14} cy={14} r={3.5} fill="none" stroke={color} strokeWidth={1.5} />
        <Circle cx={14} cy={14} r={1.5} fill={color} />
      </Svg>
    ),
  },
  {
    key: 'flask',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Path
          d="M10 4h8M11 4v8L5 22h18L17 12V4"
          fill="none"
          stroke={color}
          strokeWidth={1.7}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Line x1={8} y1={18} x2={14} y2={18} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
        <Line x1={10} y1={21} x2={13} y2={21} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: 'compass',
    render: (color) => (
      <Svg width={20} height={20} viewBox="0 0 28 28">
        <Circle cx={14} cy={14} r={10} fill="none" stroke={color} strokeWidth={1.6} />
        <Polygon
          points="14,6 16.5,13.5 14,12 11.5,13.5"
          fill={color}
          opacity={0.9}
        />
        <Polygon
          points="14,22 11.5,14.5 14,16 16.5,14.5"
          fill="none"
          stroke={color}
          strokeWidth={1.2}
        />
        <Circle cx={14} cy={14} r={1.5} fill={color} />
      </Svg>
    ),
  },
];

/** Resolve a stored teamIcon key to an inline SVG element. Falls back to null. */
export const renderTeamSvgIcon = (key, color = '#A78BFA') => {
  const opt = TEAM_ICON_OPTIONS.find((o) => o.key === key);
  if (!opt) return null;
  return opt.render(color);
};

const DEFAULT_TEAM_ICON = 'shield';

const TEAM_COLOR_PALETTE = [
  { accent: '#7B2FFF', dim: 'rgba(123, 47, 255, 0.12)' },
  { accent: '#2563EB', dim: 'rgba(37, 99, 235, 0.12)' },
  { accent: '#0D9488', dim: 'rgba(13, 148, 136, 0.12)' },
  { accent: '#D97706', dim: 'rgba(217, 119, 6, 0.12)' },
  { accent: '#BE185D', dim: 'rgba(190, 24, 93, 0.12)' },
  { accent: '#7C3AED', dim: 'rgba(124, 58, 237, 0.12)' },
];

// ── Helper: resolve an icon key to an <Image> or fallback text ────────────────

function AgentIconImage({ iconKey, style }) {
  const option = ICON_OPTIONS.find((o) => o.key === iconKey);
  if (option) {
    return <Image source={option.src} style={style} resizeMode="cover" />;
  }
  // fallback: treat as emoji / text
  return <Text style={style}>{iconKey || '🤖'}</Text>;
}

// ── Agent slot picker ─────────────────────────────────────────────────────────

function AgentSlotPicker({ role, selectedAgent, customAgents, usedIds, onSelect, accent }) {
  const [open, setOpen] = useState(false);

  // Agents available for this slot: all agents minus those locked in other slots
  const availableAgents = customAgents.filter(
    (a) => !usedIds.includes(a.id) || a.id === selectedAgent?.id,
  );

  return (
    <View style={ts.slotGroup}>
      <Text style={[ts.slotLabel, { color: accent }]}>{ROLE_LABELS[role].toUpperCase()}</Text>
      <TouchableOpacity
        style={[
          ts.slotBtn,
          selectedAgent && { borderColor: `${accent}66`, backgroundColor: `${accent}0D` },
          open && { borderColor: `${accent}99` },
        ]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.75}
      >
        {selectedAgent ? (
          <View style={ts.slotBtnContent}>
            <AgentIconImage iconKey={selectedAgent.icon} style={ts.slotBtnIcon} />
            <View style={{ flex: 1 }}>
              <Text style={ts.slotBtnName}>{selectedAgent.name}</Text>
              <Text style={ts.slotBtnDesc} numberOfLines={1}>{selectedAgent.description}</Text>
            </View>
            <Text style={[ts.slotChevron, open && { transform: [{ rotate: '180deg' }] }]}>▾</Text>
          </View>
        ) : (
          <View style={ts.slotBtnContent}>
            <Text style={ts.slotEmptyIcon}>○</Text>
            <Text style={ts.slotEmptyText}>Select agent…</Text>
            <Text style={[ts.slotChevron, open && { transform: [{ rotate: '180deg' }] }]}>▾</Text>
          </View>
        )}
      </TouchableOpacity>

      {open && (
        <View style={ts.agentDropdown}>
          {availableAgents.length === 0 ? (
            <Text style={ts.dropdownEmpty}>
              {customAgents.length === 0
                ? 'No agents yet — create some in the Agent Builder'
                : 'All agents are already assigned to other slots'}
            </Text>
          ) : (
            availableAgents.map((agent) => (
              <TouchableOpacity
                key={agent.id}
                style={[
                  ts.dropdownItem,
                  selectedAgent?.id === agent.id && { backgroundColor: `${accent}14` },
                ]}
                onPress={() => { onSelect(role, agent); setOpen(false); }}
                activeOpacity={0.75}
              >
                <AgentIconImage iconKey={agent.icon} style={ts.dropdownIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={ts.dropdownName}>{agent.name}</Text>
                  <Text style={ts.dropdownDesc} numberOfLines={1}>{agent.description}</Text>
                </View>
                {selectedAgent?.id === agent.id && (
                  <Text style={[ts.dropdownCheck, { color: accent }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ── Build team object from form + selected agents ─────────────────────────────

const DEFAULT_ACCENT     = TEAM_COLOR_PALETTE[0].accent;
const DEFAULT_ACCENT_DIM = TEAM_COLOR_PALETTE[0].dim;

const buildTeamObject = (form, slots) => {
  const accent    = DEFAULT_ACCENT;
  const accentDim = DEFAULT_ACCENT_DIM;

  // Build role-map agents section matching existing team schema exactly
  const agents = {};
  ROLE_SLOTS.forEach((role) => {
    const a = slots[role];
    agents[role] = {
      name: a.name,
      icon: a.icon,
      accent: a.accent,
      accentDim: a.accentDim,
      accentGlow: a.accentGlow,
      activeStatus: a.activeStatus || 'working',
      activeLabel: a.activeLabel || 'Processing...',
      socketLabel: a.socketLabel || `${a.name} Agent`,
      contributionLens: a.contributionLens || 'specialist insight',
      specialistDirective: a.specialistDirective || `You are ${a.name}.`,
      features: a.features || [],
    };
  });

  const writerName = slots.writer?.name || 'Writer';

  return {
    id: generateTeamId(),
    name: form.name.trim(),
    tagline: form.tagline.trim() || `Custom team built in Agents Workshop`,
    description: form.description.trim() || `A custom team of four specialists.`,
    accent,
    accentDim,
    badge: 'CUSTOM',
    category: 'Custom',
    teamIcon: form.teamIcon || DEFAULT_TEAM_ICON,
    agents,
    greetingReply: `Hi! I'm the ${form.name.trim()} team.\nHow can we help?`,
    writerRules: `${writerName} synthesizes all specialist insights into one clear, complete answer.`,
    sharedBriefSuffix: form.description.trim() || 'Custom team. Apply specialist expertise.',
  };
};

// ── Main component ────────────────────────────────────────────────────────────

export default function TeamBuilderPanel({ customAgents = [], onRegistered, onClose }) {
  const [form, setForm] = useState({ name: '', tagline: '', description: '', teamIcon: DEFAULT_TEAM_ICON });
  const [slots, setSlots] = useState({ reasoner: null, coder: null, vision: null, writer: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const accent = DEFAULT_ACCENT;

  const setField = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const handleSlotSelect = (role, agent) => setSlots((s) => ({ ...s, [role]: agent }));

  const handleRegister = useCallback(async () => {
    setError('');
    if (!form.name.trim()) { setError('Team name is required'); return; }
    const missingSlots = ROLE_SLOTS.filter((r) => !slots[r]);
    if (missingSlots.length > 0) {
      setError(`All 4 role slots must be filled. Missing: ${missingSlots.join(', ')}`);
      return;
    }
    setSaving(true);
    try {
      const team = buildTeamObject(form, slots);
      await saveCustomTeam(team);
      setSaving(false);
      if (onRegistered) onRegistered(team);
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to register team');
    }
  }, [form, slots, onRegistered]);

  const allSlotsFilled = ROLE_SLOTS.every((r) => !!slots[r]);

  return (
    <View style={ts.panel}>
      {/* Header */}
      <View style={ts.header}>
        <View style={[ts.headerIconBox, { backgroundColor: `${accent}18`, borderColor: `${accent}44` }]}>
          <TeamBuilderIcon color={accent} size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ts.headerTitle}>Team Builder</Text>
          <Text style={ts.headerSub}>Compose 4 custom agents into a team</Text>
        </View>
        {onClose && (
          <TouchableOpacity style={ts.closeBtn} onPress={onClose} activeOpacity={0.75}>
            <CrossIcon color="#8A8A9D" />
          </TouchableOpacity>
        )}
      </View>

      {/* Step 1: Info */}
      <View style={[ts.stepHeader, { borderLeftColor: accent }]}>
        <Text style={ts.stepTitle}>Team Identity</Text>
      </View>

      <Text style={ts.fieldLabel}>TEAM NAME *</Text>
      <TextInput
        style={ts.textInput}
        placeholder="e.g. Research Squad"
        placeholderTextColor="#5A5A70"
        value={form.name}
        onChangeText={(v) => setField('name', v)}
        maxLength={40}
      />

      <Text style={ts.fieldLabel}>TAGLINE</Text>
      <TextInput
        style={ts.textInput}
        placeholder="e.g. Deep research with precision"
        placeholderTextColor="#5A5A70"
        value={form.tagline}
        onChangeText={(v) => setField('tagline', v)}
        maxLength={80}
      />

      <Text style={ts.fieldLabel}>DESCRIPTION</Text>
      <TextInput
        style={[ts.textInput, ts.multilineInput]}
        placeholder="Describe what this team does..."
        placeholderTextColor="#5A5A70"
        value={form.description}
        onChangeText={(v) => setField('description', v)}
        multiline
        textAlignVertical="top"
        maxLength={300}
      />

      {/* Team icon picker */}
      <Text style={ts.fieldLabel}>TEAM ICON</Text>
      <View style={ts.teamIconGrid}>
        {TEAM_ICON_OPTIONS.map(({ key, render }) => {
          const selected = form.teamIcon === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                ts.teamIconBtn,
                selected && { borderColor: `${accent}99`, backgroundColor: `${accent}18` },
              ]}
              onPress={() => setField('teamIcon', key)}
              activeOpacity={0.75}
            >
              {render(selected ? accent : '#5A5A70')}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Step 2: Slot assignment */}
      <View style={[ts.stepHeader, { borderLeftColor: accent }]}>
        <Text style={ts.stepTitle}>Assign Agents to Roles</Text>
        <Text style={ts.stepSub}>All 4 slots required</Text>
      </View>

      <View style={ts.slotsGroup}>
        {ROLE_SLOTS.map((role) => {
          // IDs already picked in every OTHER slot
          const usedIds = ROLE_SLOTS
            .filter((r) => r !== role && slots[r])
            .map((r) => slots[r].id);
          return (
            <AgentSlotPicker
              key={role}
              role={role}
              selectedAgent={slots[role]}
              customAgents={customAgents}
              usedIds={usedIds}
              onSelect={handleSlotSelect}
              accent={accent}
            />
          );
        })}
      </View>

      {/* Slot status */}
      <View style={ts.statusRow}>
        {ROLE_SLOTS.map((role) => (
          <View
            key={role}
            style={[ts.statusDot, slots[role] ? { backgroundColor: accent } : ts.statusDotEmpty]}
          />
        ))}
        <Text style={ts.statusText}>
          {ROLE_SLOTS.filter((r) => slots[r]).length}/4 slots filled
        </Text>
      </View>

      {/* Error */}
      {!!error && <Text style={ts.errorText}>{error}</Text>}

      {/* Register button */}
      <TouchableOpacity
        style={[
          ts.registerBtn,
          { backgroundColor: allSlotsFilled ? accent : '#1A1A2A', opacity: saving ? 0.6 : 1 },
          !allSlotsFilled && { borderWidth: 1, borderColor: '#333344' },
        ]}
        onPress={handleRegister}
        activeOpacity={0.82}
        disabled={saving || !allSlotsFilled}
      >
        <Text style={[ts.registerBtnText, !allSlotsFilled && { color: '#5A5A70' }]}>
          {saving ? 'REGISTERING…' : 'REGISTER TEAM'}
        </Text>
      </TouchableOpacity>

      <Text style={ts.registerNote}>
        The team will be merged into the team ecosystem and available in Team Picker immediately.
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const ts = StyleSheet.create({
  panel: {
    backgroundColor: '#0C0C12',
    borderWidth: 1,
    borderColor: '#20202F',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(123, 47, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 255, 0.22)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  headerSub: { color: '#8A8A9D', fontSize: 10, marginTop: 2 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#262638',
  },
  stepHeader: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  stepNumber: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  stepTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stepSub: { color: '#6A6A7D', fontSize: 9 },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: '#E2E2E9',
    marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: '#1E1E2C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 2,
  },
  multilineInput: { minHeight: 64, lineHeight: 17 },
  teamIconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
    marginBottom: 4,
  },
  teamIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11111A',
    borderWidth: 1,
    borderColor: '#242436',
    borderRadius: 9,
  },
  slotsGroup: { gap: 10 },
  slotGroup: { marginBottom: 2 },
  slotLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
  slotDesc: { color: '#5A5A70', fontSize: 9, marginBottom: 6 },
  slotBtn: {
    backgroundColor: '#11111A',
    borderWidth: 1,
    borderColor: '#242436',
    borderRadius: 10,
    padding: 11,
  },
  slotBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  slotBtnIcon: { width: 24, height: 24, borderRadius: 6 },
  slotBtnName: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  slotBtnDesc: { color: '#6A6A7D', fontSize: 9, marginTop: 1 },
  slotChevron: { color: '#6A6A7D', fontSize: 14 },
  slotEmptyIcon: { fontSize: 16, color: '#3A3A4A', width: 24, textAlign: 'center' },
  slotEmptyText: { flex: 1, color: '#5A5A70', fontSize: 11 },
  agentDropdown: {
    backgroundColor: '#0F0F18',
    borderWidth: 1,
    borderColor: '#232335',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownEmpty: { color: '#5A5A70', fontSize: 10, padding: 12, textAlign: 'center' },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A28',
  },
  dropdownIcon: { width: 24, height: 24, borderRadius: 6 },
  dropdownName: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  dropdownDesc: { color: '#6A6A7D', fontSize: 9, marginTop: 1 },
  dropdownCheck: { fontSize: 12, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotEmpty: { backgroundColor: '#2A2A3A' },
  statusText: { color: '#6A6A7D', fontSize: 9, marginLeft: 2 },
  errorText: { color: '#FCA5A5', fontSize: 10, fontWeight: '700', marginTop: 8 },
  registerBtn: {
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  registerNote: { color: '#5A5A70', fontSize: 9, textAlign: 'center', marginTop: 8, lineHeight: 13 },
});
