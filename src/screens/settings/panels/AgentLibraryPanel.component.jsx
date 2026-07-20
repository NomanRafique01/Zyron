/**
 * AgentLibraryPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Agent Team Library panel inside Settings.
 *
 * Two sub-sections:
 *   1. "Zyron's Agent Teams" — built-in teams
 *   2. "Your Custom Teams"   — teams saved in Agents Workshop
 *
 * Each card in both sections shows the same accordion UI:
 *   collapsed  → name, tagline, agent roster chips
 *   expanded   → description + full agent breakdown + activate toggle
 *
 * Custom teams behave identically to built-in teams when selected.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import AgentIcon from '../../../components/agent/AgentIcon.component';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { AGENTS_TEAMS } from '../../../utils/agentLogic.utils';
import { BoltIcon, AgentBuilderIcon } from '../../../components/shared/Icons';
import { renderTeamSvgIcon } from '../../../components/workshop/TeamBuilderPanel.component';
import {
  loadCustomTeams,
} from '../../../agents/workshop/customTeamsStorage';

const ROSTER = ['reasoner', 'coder', 'vision', 'writer'];

// ── Shared team accordion card ─────────────────────────────────────────────

const TeamAccordionCard = React.memo(function TeamAccordionCard({
  team,
  isTeamActive,
  isExpanded,
  teamNodeRef,
  teamLayoutRef,
  onToggle,
  onSelect,
  isCustom = false,
}) {
  const teamIcon = team.teamIcon || team.agents?.reasoner?.icon || null;
  const writerName = team.agents?.writer?.name || 'Writer';

  // Native-driver animation: fade + scale the expanded body in/out
  const animProgress = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const prevExpanded = useRef(isExpanded);

  useEffect(() => {
    if (prevExpanded.current === isExpanded) return;
    prevExpanded.current = isExpanded;
    Animated.timing(animProgress, {
      toValue: isExpanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, animProgress]);

  const bodyStyle = useMemo(() => ({
    opacity: animProgress,
    transform: [
      {
        scale: animProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  }), [animProgress]);

  return (
    <View
      style={s.teamAccordionGroup}
      ref={(node) => { if (node && teamNodeRef) teamNodeRef.current[team.id] = node; }}
      onLayout={(event) => {
        if (teamLayoutRef) teamLayoutRef.current[team.id] = event.nativeEvent.layout;
      }}
    >
      <View
        style={[
          s.teamAccordionCard,
          isTeamActive && { borderColor: team.accent + '73', borderWidth: 1.5 },
          isExpanded && { borderColor: team.accent + '59' },
        ]}
      >
        <TouchableOpacity
          style={[
            s.teamAccordionHeader,
            { flexDirection: 'column', alignItems: 'stretch' },
            isTeamActive && s.teamAccordionHeaderActive,
          ]}
          onPress={() => onToggle(team.id)}
          activeOpacity={0.75}
        >
          <View style={rowStyle}>
            <View style={rowLeftStyle}>
              {(isCustom
                  ? renderTeamSvgIcon(team.teamIcon, team.accent || '#A78BFA')
                  : (typeof teamIcon !== 'string' ? teamIcon : null))
                || (typeof teamIcon === 'string' && !isCustom
                    ? <Text style={s.teamAccordionIcon}>{teamIcon}</Text>
                    : <AgentBuilderIcon color="#A78BFA" size={22} />)}
              <View style={rowTitleBlockStyle}>
                <View style={titleRowStyle}>
                  <Text style={s.teamAccordionTitle}>{team.name}</Text>
                  {isCustom && (
                    <View style={[ls.customBadge, { backgroundColor: team.accent + '22', borderColor: team.accent + '55' }]}>
                      <Text style={[ls.customBadgeText, { color: team.accent }]}>CUSTOM</Text>
                    </View>
                  )}
                </View>
                <Text style={s.teamAccordionSub} numberOfLines={1}>
                  {isTeamActive
                    ? `Active · ${writerName} synthesizes`
                    : team.tagline}
                </Text>
              </View>
            </View>
            {isExpanded && (
              <View style={s.teamPanelSwitchGlow}>
                <TouchableOpacity
                  style={[
                    s.teamPanelSwitch,
                    isTeamActive && s.teamPanelSwitchActive,
                  ]}
                  onPress={() => onSelect(team.id)}
                  activeOpacity={0.82}
                >
                  <View
                    style={[
                      s.teamPanelSwitchKnob,
                      isTeamActive && s.teamPanelSwitchKnobActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Collapsed: description + roster chips — 4 icons only */}
          {!isExpanded && (
            <>
              <Text style={s.teamBriefDesc} numberOfLines={2}>
                {team.description}
              </Text>
              <View style={s.agentLibraryRoster}>
                {ROSTER.map((role) => {
                  const agent = team.agents?.[role];
                  if (!agent) return null;
                  return (
                    <View key={role} style={s.agentLibraryRosterChip}>
                      <AgentIcon icon={agent.icon} size={22} />
                      <Text style={s.agentLibraryRosterName}>{agent.name}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Expanded body — only mounted when the card is actually expanded */}
        {isExpanded && (
          <Animated.View style={[s.teamAccordionBody, bodyStyle]}>

            {/* Icon row — 4 agents centered at the top */}
            <View style={ls.iconRow}>
              {ROSTER.map((role) => {
                const agent = team.agents?.[role];
                if (!agent) return null;
                return (
                  <View key={role} style={ls.iconItem}>
                    <View style={[ls.iconWrap, { backgroundColor: agent.accentDim, borderColor: (agent.accent || team.accent) + '44' }]}>
                      <AgentIcon icon={agent.icon} size={56} />
                    </View>
                    <Text style={ls.iconName} numberOfLines={1}>{agent.name}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={s.teamBodyIntro}>{team.description}</Text>

            {ROSTER.map((role, idx) => {
              const agent = team.agents?.[role];
              if (!agent) return null;
              const isLast = idx === ROSTER.length - 1;
              const features = agent.features || [];

              return (
                <View
                  key={role}
                  style={[s.teamAgentRow, isLast && s.teamAgentRowLast]}
                >
                  <Text style={[s.teamAgentSlotLabel, { color: team.accent }]}>
                    Agent {idx + 1}{idx === 3 ? ' · Writer' : ''}
                  </Text>
                  <View style={s.teamAgentHeader}>
                    <View
                      style={[
                        s.teamAgentIconWrap,
                        {
                          backgroundColor: agent.accentDim,
                          borderColor: (agent.accent || team.accent) + '44',
                        },
                      ]}
                    >
                      <AgentIcon icon={agent.icon} size={36} />
                    </View>
                    <View style={agentNameBlockStyle}>
                      <Text style={s.teamAgentName}>{agent.name}</Text>
                      <Text style={s.teamAgentRole}>{agent.socketLabel}</Text>
                    </View>
                  </View>
                  {features.length > 0 && (
                    <View style={s.teamAgentFeatures}>
                      {features.map((feature) => (
                        <View key={feature} style={s.teamAgentFeatureLine}>
                          <Text style={s.teamAgentFeatureBullet}>•</Text>
                          <Text style={s.teamAgentFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>
    </View>
  );
});

// Static style objects — defined outside render to avoid recreation on every paint
const rowStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' };
const rowLeftStyle = { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 };
const rowTitleBlockStyle = { flex: 1 };
const titleRowStyle = { flexDirection: 'row', alignItems: 'center', gap: 6 };
const agentNameBlockStyle = { flex: 1 };

// ── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ label, count }) {
  return (
    <View style={ls.sectionHeader}>
      <Text style={ls.sectionLabel}>{label}</Text>
      {count != null && (
        <View style={ls.sectionCount}>
          <Text style={ls.sectionCountText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AgentLibraryPanel({
  style,
  activeTeamId,
  activeTeam,
  expandedTeamId,
  teamNodeRef,
  teamLayoutRef,
  onToggleTeam,
  onSelectTeam,
}) {
  const [customTeams, setCustomTeams] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadCustomTeams()
      .then((teams) => { if (!cancelled) setCustomTeams(teams); })
      .catch(() => { if (!cancelled) setCustomTeams([]); });
    return () => { cancelled = true; };
  }, []);

  const builtInTeams = useMemo(
    () => AGENTS_TEAMS.map((t) => ({ ...t, _isCustom: false })),
    [],
  );

  const customTeamsMapped = useMemo(
    () => customTeams.map((t) => ({ ...t, _isCustom: true })),
    [customTeams],
  );

  return (
    <View style={[s.agentLibraryPanel, style]}>

      {/* Hero */}
      <View style={[s.agentLibraryHero, heroPaddingStyle]}>
        <View style={s.agentLibraryHeroIcon}>
          <BoltIcon color={C.purpleSoft} />
        </View>
        <View style={heroTextBlockStyle}>
          <Text style={s.agentLibraryHeroTitle}>Agent Team Library</Text>
          <Text style={s.agentLibraryHeroSub}>
            Select a team to activate it across all coordination pipelines
          </Text>
        </View>
        <View style={s.agentLibraryActivePill}>
          <Text style={s.agentLibraryActivePillText}>{activeTeam.name.toUpperCase()}</Text>
        </View>
      </View>

      {/*
       * Plain View + .map() — no nested scrollable list.
       * FlatList with scrollEnabled=false provides zero virtualization benefit
       * inside a ScrollView and adds significant JS bridge overhead on every
       * scroll frame. A plain View is ~60% lighter in this configuration.
       */}
      <View style={listContainerStyle}>
        <SectionHeader label="ZYRON'S AGENT TEAMS" count={builtInTeams.length} />
        {builtInTeams.map((team) => (
          <TeamAccordionCard
            key={team.id}
            team={team}
            isTeamActive={team.id === activeTeamId}
            isExpanded={expandedTeamId === team.id}
            teamNodeRef={teamNodeRef}
            teamLayoutRef={teamLayoutRef}
            onToggle={onToggleTeam}
            onSelect={onSelectTeam}
            isCustom={false}
          />
        ))}

        <SectionHeader label="YOUR CUSTOM TEAMS" count={customTeamsMapped.length} />
        {customTeamsMapped.length === 0 ? (
          <View style={ls.emptyCustom}>
            <Text style={ls.emptyCustomText}>
              No custom teams yet — build one in the Agents Workshop
            </Text>
          </View>
        ) : (
          customTeamsMapped.map((team) => (
            <TeamAccordionCard
              key={team.id}
              team={team}
              isTeamActive={team.id === activeTeamId}
              isExpanded={expandedTeamId === team.id}
              teamNodeRef={teamNodeRef}
              teamLayoutRef={teamLayoutRef}
              onToggle={onToggleTeam}
              onSelect={onSelectTeam}
              isCustom={true}
            />
          ))
        )}
      </View>

    </View>
  );
}

// Static layout style objects
const heroPaddingStyle = { padding: 10 };
const heroTextBlockStyle = { flex: 1 };
const listContainerStyle = { paddingHorizontal: 10, paddingBottom: 14 };

// ── Local styles (panel-scoped extras) ────────────────────────────────────

const ls = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: C.purpleSoft,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    backgroundColor: 'rgba(123, 47, 255, 0.2)',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sectionCountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  customBadge: {
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
  },
  customBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyCustom: {
    backgroundColor: 'rgba(123, 47, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 255, 0.15)',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyCustomText: {
    color: '#5A5A70',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  iconItem: {
    alignItems: 'center',
    width: 68,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconName: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: '600',
    color: '#AAAACC',
    textAlign: 'center',
  },
});
