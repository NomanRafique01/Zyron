/**
 * PasswordManagerPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Password Manager panel inside Settings.
 * Renders the API lock creation form (when no lock is set) or the
 * update/remove form (when a lock exists), plus the feedback toast.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { ShieldIcon } from '../../../components/shared/Icons';
import PasswordField from '../../../components/shared/PasswordField.component.jsx';

export default function PasswordManagerPanel({
  apiLockPasswordSet,
  passwordForm,
  passwordVisibility,
  passwordManagerFeedback,
  pwFeedbackOpacity,
  onUpdateForm,          // (field, value) => void
  onToggleVisibility,    // (field) => void
  onSetPassword,         // () => void
  onUpdatePassword,      // () => void
  onRemovePassword,      // () => void
}) {
  return (
    <View style={s.passwordPanel}>
      {/* Hero */}
      <View style={s.passwordPanelHero}>
        <View style={s.passwordHeroIcon}>
          <ShieldIcon color={C.purpleSoft} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.passwordPanelTitle}>
            {apiLockPasswordSet ? 'Manage API lock' : 'Create API lock'}
          </Text>
          <Text style={s.passwordPanelSub}>
            {apiLockPasswordSet
              ? 'Update or remove the password used to open API Configuration.'
              : 'Protect provider keys and socket controls with a local password.'}
          </Text>
        </View>
        <View style={apiLockPasswordSet ? s.teamPanelSwitchGlow : null}>
          <View style={[s.teamPanelSwitch, apiLockPasswordSet && s.teamPanelSwitchActive]}>
            <View style={[s.teamPanelSwitchKnob, apiLockPasswordSet && s.teamPanelSwitchKnobActive]} />
          </View>
        </View>
      </View>

      {/* ── No lock: create form ── */}
      {!apiLockPasswordSet ? (
        <>
          <PasswordField
            label="Password"
            value={passwordForm.password}
            onChangeText={(val) => onUpdateForm('password', val)}
            visible={passwordVisibility.password}
            onToggleVisible={() => onToggleVisibility('password')}
            error={passwordManagerFeedback.message === 'Passwords do not match' || passwordManagerFeedback.message === 'Password cannot be empty'}
          />
          <PasswordField
            label="Confirm Password"
            value={passwordForm.confirmPassword}
            onChangeText={(val) => onUpdateForm('confirmPassword', val)}
            visible={passwordVisibility.confirmPassword}
            onToggleVisible={() => onToggleVisibility('confirmPassword')}
            placeholder="Confirm password"
            error={passwordManagerFeedback.message === 'Passwords do not match'}
          />
          <Text style={s.inputLabel}>Hint <Text style={s.pwHintOptional}>(optional)</Text></Text>
          <TextInput
            style={s.keyTextInput}
            placeholder="Recovery hint in case you forget"
            placeholderTextColor="#5A5A70"
            value={passwordForm.hint}
            onChangeText={(val) => onUpdateForm('hint', val)}
          />
          <TouchableOpacity style={s.verifyAddBtn} onPress={onSetPassword} activeOpacity={0.85}>
            <Text style={s.verifyAddBtnText}>Set Password</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <PasswordField
            label="Current Password"
            value={passwordForm.oldPassword}
            onChangeText={(val) => onUpdateForm('oldPassword', val)}
            visible={passwordVisibility.oldPassword}
            onToggleVisible={() => onToggleVisibility('oldPassword')}
            placeholder="Enter current password"
            error={passwordManagerFeedback.message === 'Current password is incorrect'}
          />
          <PasswordField
            label="New Password"
            value={passwordForm.newPassword}
            onChangeText={(val) => onUpdateForm('newPassword', val)}
            visible={passwordVisibility.newPassword}
            onToggleVisible={() => onToggleVisibility('newPassword')}
            placeholder="Choose a new password"
            error={passwordManagerFeedback.message === 'Passwords do not match' || passwordManagerFeedback.message === 'New password cannot be empty'}
          />
          <PasswordField
            label="Confirm New Password"
            value={passwordForm.confirmNewPassword}
            onChangeText={(val) => onUpdateForm('confirmNewPassword', val)}
            visible={passwordVisibility.confirmNewPassword}
            onToggleVisible={() => onToggleVisibility('confirmNewPassword')}
            placeholder="Re-enter new password"
            error={passwordManagerFeedback.message === 'Passwords do not match'}
          />
          <Text style={s.inputLabel}>Updated Hint <Text style={s.pwHintOptional}>(optional)</Text></Text>
          <TextInput
            style={s.keyTextInput}
            placeholder="Recovery hint for the new password"
            placeholderTextColor="#5A5A70"
            value={passwordForm.newHint}
            onChangeText={(val) => onUpdateForm('newHint', val)}
          />
          <View style={s.pwActionRow}>
            <TouchableOpacity style={[s.verifyAddBtn, s.pwActionBtn]} onPress={onUpdatePassword} activeOpacity={0.85}>
              <Text style={s.verifyAddBtnText}>Update Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.verifyAddBtn, s.pwActionBtn]} onPress={onRemovePassword} activeOpacity={0.85}>
              <Text style={s.verifyAddBtnText}>Remove Password</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Feedback banner */}
      {passwordManagerFeedback.message ? (
        <Animated.View style={[s.testAlert, passwordManagerFeedback.type === 'success' ? s.testSuccess : s.testFailure, { opacity: pwFeedbackOpacity }]}>
          <Text style={[s.testAlertText, passwordManagerFeedback.type === 'error' && s.passwordErrorText]}>
            {passwordManagerFeedback.message}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
