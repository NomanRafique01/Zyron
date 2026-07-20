/**
 * ApiConfigPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * API Configuration panel inside Settings.
 * Renders the four agent socket rows (reasoner / coder / vision / writer)
 * with provider selector, model preset chips, API key input, key-sharing
 * controls, verify/activate/delete buttons, and status pills.
 *
 * Each socket row is further broken out into AgentSocketRow.component.jsx
 * to keep this file under 300 lines.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { UserIcon } from '../../../components/shared/Icons';
import AgentSocketRow from '../rows/AgentSocketRow.component.jsx';

export default function ApiConfigPanel({
  // State
  agentConfigs,
  isEngineLive,
  activeTeamId,
  activeTeam,
  teamRoleInfo,
  expandedAgent,
  verifyingRole,
  verificationResult,
  pendingShareTargets,
  apiKeyVisibility,
  // Helpers
  getSyncedKeySource,
  getAgentLinkAvailability,
  getAgentRoleNumberName,
  showSocketLockBanner,
  showToast,
  // Handlers
  onToggleEngineActive,
  onToggleSocketPanel,    // (role) => void
  onUpdateAgentField,     // (role, field, value) => void
  onVerifyAndSave,        // (role) => void
  onToggleAgentActive,    // (role) => void
  onRequestDeleteKey,     // (role) => void
  onSelectKeySharingTarget, // (role, targetRole) => void
  onToggleLinkAgent,      // (role) => void
  onToggleApiKeyVisibility, // (role) => void
  socketLayoutRef,
  socketNodeRef,
  socketHeaderLayoutRef,
  socketBodyLayoutRef,
  socketBannerNodeRef,
}) {
  return (
    <View style={s.settingsSection}>
      {/* Header row with engine toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={s.sectionHeader}>
            {activeTeamId ? `${activeTeam.name} Agent Configuration` : 'Agent Configuration'}
          </Text>
          <Text style={[s.sectionDesc, { marginBottom: 0 }]}>
            {teamRoleInfo.reasoner.name} · {teamRoleInfo.coder.name} · {teamRoleInfo.vision.name} · {teamRoleInfo.writer.name}
          </Text>
        </View>

        {/* Activate Engine Toggle */}
        <TouchableOpacity
          style={[
            s.activateEngineBtn,
            isEngineLive ? s.activateEngineBtnActive : s.activateEngineBtnInactive
          ]}
          onPress={onToggleEngineActive}
          activeOpacity={0.8}
        >
          <Text style={s.activateEngineBtnText}>
            {isEngineLive ? 'COORDINATION ACTIVE' : 'ACTIVATE COORDINATION'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionDesc}>
        {activeTeamId
          ? `${activeTeam.name} are Active — Each agent handles a dedicated role. ${teamRoleInfo.writer.name} compiles and delivers the final response.`
          : 'Please select a team.'}
      </Text>

      {/* Agent socket rows */}
      {['reasoner', 'coder', 'vision', 'writer'].map((role, index) => {
        if (!activeTeamId) {
          return (
            <View key={role} style={s.agentSocketGroup}>
              <TouchableOpacity
                style={[s.apiPanelToggle, { marginBottom: 14 }]}
                onPress={() => showToast('No Team Selected', 'Select a team in Agent Library.', 'warning')}
                activeOpacity={0.7}
              >
                <View style={s.apiPanelToggleLeft}>
                  <View style={[s.apiPanelIconBox, s.profileIconBox]}>
                    <UserIcon color={C.purpleSoft || C.purple} />
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={s.apiPanelTitle}>Agent {index + 1}</Text>
                    <Text style={s.apiPanelSub}>Select a team in Agent Library</Text>
                  </View>
                </View>
                <View style={[s.statusPill, s.statusInactive]}>
                  <Text style={[s.statusPillText, { color: '#8A8A9D' }]}>LOCKED</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <AgentSocketRow
            key={role}
            role={role}
            index={index}
            config={agentConfigs[role]}
            agentConfigs={agentConfigs}
            isEngineLive={isEngineLive}
            activeTeam={activeTeam}
            teamRoleInfo={teamRoleInfo}
            isExpanded={expandedAgent === role}
            verifyingRole={verifyingRole}
            verificationResult={verificationResult}
            pendingShareTargets={pendingShareTargets}
            apiKeyVisibility={apiKeyVisibility}
            getSyncedKeySource={getSyncedKeySource}
            getAgentLinkAvailability={getAgentLinkAvailability}
            getAgentRoleNumberName={getAgentRoleNumberName}
            showSocketLockBanner={showSocketLockBanner}
            showToast={showToast}
            onToggleSocket={() => onToggleSocketPanel(role)}
            onUpdateField={(field, value) => onUpdateAgentField(role, field, value)}
            onVerifyAndSave={() => onVerifyAndSave(role)}
            onToggleActive={() => onToggleAgentActive(role)}
            onRequestDelete={() => onRequestDeleteKey(role)}
            onSelectSharingTarget={(targetRole) => onSelectKeySharingTarget(role, targetRole)}
            onToggleLink={() => onToggleLinkAgent(role)}
            onToggleKeyVisibility={() => onToggleApiKeyVisibility(role)}
            socketLayoutRef={socketLayoutRef}
            socketNodeRef={socketNodeRef}
            socketHeaderLayoutRef={socketHeaderLayoutRef}
            socketBodyLayoutRef={socketBodyLayoutRef}
            socketBannerNodeRef={socketBannerNodeRef}
          />
        );
      })}
    </View>
  );
}
