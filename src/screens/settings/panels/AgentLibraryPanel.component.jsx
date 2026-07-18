/**
 * AgentLibraryPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Agent Team Library panel inside Settings.
 * Renders the accordion list of all teams (built-in + custom) — each card
 * shows the team name, tagline, agent roster, and a toggle switch to
 * activate/deactivate it.  Custom teams are tagged with a CUSTOM badge.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { AGENTS_TEAMS } from '../../../utils/agentLogic.utils';
import { getAllTeams } from '../../../agents/workshop/customTeamRegistry';
import { BoltIcon } from '../../../components/shared/Icons';

export default function AgentLibraryPanel({
  activeTeamId,
  activeTeam,
  expandedTeamId,
  teamNodeRef,
  teamLayoutRef,
  onToggleTeam,     // (teamId) => void
  onSelectTeam,     // (teamId) => void
}) {
  const roster = ['reasoner', 'coder', 'vision', 'writer'];

  // Merge built-in + custom teams; re-render when custom teams change
  const [allTeams, setAllTeams] = useState(() => getAllTeams());
  useEffect(() => {
    setAllTeams(getAllTeams());
  }, []);

  return (
    <View style={s.agentLibraryPanel}>
      {/* Hero */}
      <View style={s.agentLibraryHero}>
        <View style={s.agentLibraryHeroIcon}>
          <BoltIcon color={C.purpleSoft} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.agentLibraryHeroTitle}>Agent Team Library</Text>
          <Text style={s.agentLibraryHeroSub}>
            Review each team and assign it to Agents 1-4
          </Text>
        </View>
        <View style={s.agentLibraryActivePill}>
          <Text style={s.agentLibraryActivePillText}>{activeTeam.name.toUpperCase()}</Text>
        </View>
      </View>

      {/* Team accordion grid */}
      <View style={s.agentLibraryGrid}>
        {allTeams.map((team) => {
          const isTeamActive = team.id === activeTeamId;
          const isExpanded = expandedTeamId === team.id;
          const teamIcon = team.teamIcon || team.agents.reasoner.icon;

          return (
            <View
              key={team.id}
              style={s.teamAccordionGroup}
              ref={(node) => {
                if (node) teamNodeRef.current[team.id] = node;
              }}
              onLayout={(event) => {
                teamLayoutRef.current[team.id] = event.nativeEvent.layout;
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
                  onPress={() => onToggleTeam(team.id)}
                  activeOpacity={0.75}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Text style={s.teamAccordionIcon}>{teamIcon}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={s.teamAccordionTitle}>{team.name}</Text>
                          {team.badge === 'CUSTOM' && (
                            <View style={{ backgroundColor: `${team.accent}22`, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: `${team.accent}55` }}>
                              <Text style={{ color: team.accent, fontSize: 7, fontWeight: '900', letterSpacing: 0.4 }}>CUSTOM</Text>
                            </View>
                          )}
                        </View>
                        <Text style={s.teamAccordionSub} numberOfLines={1}>
                          {isTeamActive
                            ? `Active · ${team.agents.writer.name} synthesizes`
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
                          onPress={() => onSelectTeam(team.id)}
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

                  {/* Collapsed view: description + roster chips */}
                  {!isExpanded && (
                    <>
                      <Text style={s.teamBriefDesc} numberOfLines={2}>
                        {team.description}
                      </Text>
                      <View style={s.agentLibraryRoster}>
                        {roster.map((role) => {
                          const agent = team.agents[role];
                          return (
                            <View key={role} style={s.agentLibraryRosterChip}>
                              <Text style={s.agentLibraryRosterIcon}>{agent.icon}</Text>
                              <Text style={s.agentLibraryRosterName}>{agent.name}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                {/* Expanded: detailed agent breakdown */}
                {isExpanded && (
                  <View style={s.teamAccordionBody}>
                    <Text style={s.teamBodyIntro}>{team.description}</Text>

                    {roster.map((role, idx) => {
                      const agent = team.agents[role];
                      const isLast = idx === roster.length - 1;
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
                                  borderColor: agent.accent + '44',
                                },
                              ]}
                            >
                              <Text style={s.teamAgentIcon}>{agent.icon}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={s.teamAgentName}>{agent.name}</Text>
                              <Text style={s.teamAgentRole}>{agent.socketLabel}</Text>
                            </View>
                          </View>
                          <View style={s.teamAgentFeatures}>
                            {features.map((feature) => (
                              <View key={feature} style={s.teamAgentFeatureLine}>
                                <Text style={s.teamAgentFeatureBullet}>•</Text>
                                <Text style={s.teamAgentFeatureText}>{feature}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
