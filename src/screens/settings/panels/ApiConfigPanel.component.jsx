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

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { UserIcon } from '../../../components/shared/Icons';
import AgentSocketRow from '../rows/AgentSocketRow.component.jsx';
import { saveKey, getKey, deleteKey } from '../../../agents/security/keyGuard';

// ─── Web Search Key Row ───────────────────────────────────────────────────────
// Self-contained row for Tavily and Serper API keys.
// Keys are stored and read via keyGuard (encrypted SecureStore).
function WebSearchKeyRow({ provider, label, placeholder, storageKey }) {
  const [value, setValue]     = useState('');
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [hasKey, setHasKey]   = useState(false);

  // Check whether a key is already saved on mount.
  useEffect(() => {
    getKey(provider).then((k) => {
      setHasKey(!!k);
      setSaved(!!k);
    });
  }, [provider]);

  const handleSave = useCallback(async () => {
    if (!value.trim()) return;
    setSaving(true);
    await saveKey(provider, value.trim());
    setValue('');
    setSaved(true);
    setHasKey(true);
    setSaving(false);
  }, [provider, value]);

  const handleDelete = useCallback(async () => {
    await deleteKey(provider);
    setValue('');
    setSaved(false);
    setHasKey(false);
  }, [provider]);

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={s.inputLabel}>{label}</Text>
        {hasKey && (
          <View style={[s.statusPill, s.statusVerified, { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2 }]}>
            <Text style={[s.statusPillText, { color: '#10B981', fontSize: 10 }]}>SAVED</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput
          style={[s.keyTextInput, { flex: 1, marginBottom: 0 }]}
          placeholder={hasKey ? '••••••••••••  (tap Save to replace)' : placeholder}
          placeholderTextColor="#5A5A70"
          value={value}
          onChangeText={setValue}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[s.activateEngineBtn, s.activateEngineBtnActive, { paddingHorizontal: 14, paddingVertical: 8, minWidth: 0 }]}
          onPress={handleSave}
          disabled={saving || !value.trim()}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.activateEngineBtnText}>SAVE</Text>
          }
        </TouchableOpacity>
        {hasKey && (
          <TouchableOpacity
            style={[s.activateEngineBtn, { backgroundColor: '#1E1E2E', borderColor: '#3E3E52', paddingHorizontal: 14, paddingVertical: 8, minWidth: 0 }]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={[s.activateEngineBtnText, { color: '#EF4444' }]}>DEL</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
            {isEngineLive ? '⚡ COORDINATION ACTIVE' : '🔌 ACTIVATE COORDINATION'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionDesc}>
        {activeTeamId
          ? `${activeTeam.name} are Active — Each agent handles a dedicated role. ${teamRoleInfo.writer.name} compiles and delivers the final response.`
          : 'Please select a team.'}
      </Text>

      {/* ── Web Search Keys ────────────────────────────────────────────────── */}
      <View style={{ marginTop: 12, marginBottom: 4, borderTopWidth: 1, borderTopColor: '#1E1E2E', paddingTop: 16 }}>
        <Text style={s.sectionHeader}>Web Search Keys</Text>
        <Text style={[s.sectionDesc, { marginBottom: 12 }]}>
          Zyron automatically searches the web before agents respond when your query needs real-time data. Fallback chain: Tavily → Serper → model knowledge. Enter at least one key to enable live search.
        </Text>
        <WebSearchKeyRow
          provider="tavily"
          label="Tavily API Key"
          placeholder="tvly-..."
        />
        <WebSearchKeyRow
          provider="serper"
          label="Serper API Key"
          placeholder="Paste your Serper key..."
        />
      </View>

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
