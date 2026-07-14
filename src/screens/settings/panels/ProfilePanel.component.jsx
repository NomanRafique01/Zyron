/**
 * ProfilePanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * User workspace identity and personalisation panel inside Settings.
 * Renders the profile avatar, nickname/goal inputs, chip selectors
 * (Role, Tone, Detail Level, Coding Style, Language), privacy toggles,
 * a prompt preview, and a reset button.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import s from '../../../styles/app.styles';

export default function ProfilePanel({
  userProfile,
  profileHasUnsavedChanges,
  onUpdateField,       // (field, value) => void
  onSaveNow,           // () => void
  onReset,             // () => void
}) {
  return (
    <View style={s.profilePanel}>
      {/* Hero row */}
      <View style={s.profileHero}>
        <View style={s.profileAvatar}>
          <Text style={s.profileAvatarText}>
            {(userProfile.displayName || userProfile.role || 'V').trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={s.profileHeroCopy}>
          <Text style={s.profileHeroTitle}>
            {userProfile.displayName ? `${userProfile.displayName}'s workspace` : 'Personal workspace profile'}
          </Text>
          <Text style={s.profileHeroSub}>
            Lightweight context for tone, coding style, language, and goals.
          </Text>
        </View>
        <TouchableOpacity
          style={[s.profileSavePill, profileHasUnsavedChanges && s.profileSavePillDirty]}
          onPress={onSaveNow}
          activeOpacity={0.82}
        >
          <Text style={[s.profileSaveText, profileHasUnsavedChanges && s.profileSaveTextDirty]}>
            {profileHasUnsavedChanges ? 'SAVE' : 'SAVED'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nickname */}
      <Text style={s.inputLabel}>Nickname</Text>
      <TextInput
        style={s.keyTextInput}
        placeholder="What should Zyron call you?"
        placeholderTextColor="#5A5A70"
        value={userProfile.displayName}
        onChangeText={(val) => onUpdateField('displayName', val)}
      />

      {/* Goal */}
      <Text style={s.inputLabel}>Workspace Goal</Text>
      <TextInput
        style={[s.keyTextInput, s.profileMultilineInput]}
        placeholder="Example: building React Native apps, learning AI, debugging production code..."
        placeholderTextColor="#5A5A70"
        value={userProfile.workspaceGoal}
        onChangeText={(val) => onUpdateField('workspaceGoal', val)}
        multiline
        textAlignVertical="top"
      />

      {/* Role chips */}
      <Text style={s.profileSectionLabel}>Role</Text>
      <View style={s.profileChipGrid}>
        {['Developer', 'Student', 'Researcher', 'Writer', 'Founder', 'Designer'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[s.profileChip, userProfile.role === role && s.profileChipActive]}
            onPress={() => onUpdateField('role', role)}
            activeOpacity={0.82}
          >
            <Text style={[s.profileChipText, userProfile.role === role && s.profileChipTextActive]}>{role}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tone chips */}
      <Text style={s.profileSectionLabel}>Preferred Tone</Text>
      <View style={s.profileChipGrid}>
        {['Concise', 'Detailed', 'Friendly', 'Formal', 'Direct', 'Teacher'].map((tone) => (
          <TouchableOpacity
            key={tone}
            style={[s.profileChip, userProfile.tone === tone && s.profileChipActive]}
            onPress={() => onUpdateField('tone', tone)}
            activeOpacity={0.82}
          >
            <Text style={[s.profileChipText, userProfile.tone === tone && s.profileChipTextActive]}>{tone}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Detail Level chips */}
      <Text style={s.profileSectionLabel}>Detail Level</Text>
      <View style={s.profileChipGrid}>
        {['Short', 'Balanced', 'Deep'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[s.profileChip, userProfile.detailLevel === level && s.profileChipActive]}
            onPress={() => onUpdateField('detailLevel', level)}
            activeOpacity={0.82}
          >
            <Text style={[s.profileChipText, userProfile.detailLevel === level && s.profileChipTextActive]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coding Style chips */}
      <Text style={s.profileSectionLabel}>Coding Style</Text>
      <View style={s.profileChipGrid}>
        {['Practical', 'Clean Code', 'Explained', 'Minimal', 'Production'].map((style) => (
          <TouchableOpacity
            key={style}
            style={[s.profileChip, userProfile.codingStyle === style && s.profileChipActive]}
            onPress={() => onUpdateField('codingStyle', style)}
            activeOpacity={0.82}
          >
            <Text style={[s.profileChipText, userProfile.codingStyle === style && s.profileChipTextActive]}>{style}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Language chips */}
      <Text style={s.profileSectionLabel}>Default Language</Text>
      <View style={s.profileChipGrid}>
        {['English', 'Urdu', 'Hinglish', 'Auto'].map((language) => (
          <TouchableOpacity
            key={language}
            style={[s.profileChip, userProfile.language === language && s.profileChipActive]}
            onPress={() => onUpdateField('language', language)}
            activeOpacity={0.82}
          >
            <Text style={[s.profileChipText, userProfile.language === language && s.profileChipTextActive]}>{language}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toggle: use profile context */}
      <View style={s.profileToggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.profileToggleTitle}>Use profile in agent coordination</Text>
          <Text style={s.profileToggleSub}>Adds a compact preference block to model prompts.</Text>
        </View>
        <TouchableOpacity
          style={[s.profileSwitch, userProfile.useProfileContext && s.profileSwitchActive]}
          onPress={() => onUpdateField('useProfileContext', !userProfile.useProfileContext)}
          activeOpacity={0.82}
        >
          <Text style={[s.profileSwitchText, userProfile.useProfileContext && s.profileSwitchTextActive]}>
            {userProfile.useProfileContext ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toggle: privacy mode */}
      <View style={s.profileToggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.profileToggleTitle}>Privacy-aware replies</Text>
          <Text style={s.profileToggleSub}>Reminds agents to avoid exposing secrets unnecessarily.</Text>
        </View>
        <TouchableOpacity
          style={[s.profileSwitch, userProfile.privacyMode && s.profileSwitchActive]}
          onPress={() => onUpdateField('privacyMode', !userProfile.privacyMode)}
          activeOpacity={0.82}
        >
          <Text style={[s.profileSwitchText, userProfile.privacyMode && s.profileSwitchTextActive]}>
            {userProfile.privacyMode ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prompt preview */}
      <View style={s.profilePreviewBox}>
        <Text style={s.profilePreviewLabel}>Prompt preview</Text>
        <Text style={s.profilePreviewText}>
          {userProfile.useProfileContext
            ? `${userProfile.displayName ? `Name: ${userProfile.displayName}. ` : ''}Role: ${userProfile.role}. Tone: ${userProfile.tone}. Language: ${userProfile.language}. Detail: ${userProfile.detailLevel}. Coding: ${userProfile.codingStyle}.${userProfile.workspaceGoal ? ` Goal: ${userProfile.workspaceGoal}` : ''}`
            : 'Profile context is disabled. Model responses will ignore these preferences.'}
        </Text>
      </View>

      {/* Reset */}
      <TouchableOpacity
        style={s.profileResetBtn}
        onPress={onReset}
        activeOpacity={0.82}
      >
        <Text style={s.profileResetBtnText}>RESET PROFILE DEFAULTS</Text>
      </TouchableOpacity>
    </View>
  );
}
