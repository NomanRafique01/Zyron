/**
 * ResetAuthOverlay.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reset authentication password overlay — shown inside the Settings modal
 * when device biometrics are unavailable and a Zyron password is set.
 * The user must enter their password to authorise a destructive reset action.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { CrossIcon, ShieldIcon } from '../../../components/shared/Icons';
import PasswordField from '../../../components/shared/PasswordField.component.jsx';

export default function ResetAuthOverlay({
  visible,
  resetAuthPassword,
  resetAuthError,
  passwordVisibility,
  onChangePassword,   // (val) => void
  onToggleVisible,    // () => void
  onConfirm,          // () => void
  onDismiss,          // () => void
}) {
  if (!visible) return null;

  return (
    <View style={s.apiLockOverlay}>
      <View style={s.apiLockCard}>
        {/* Close */}
        <TouchableOpacity style={s.apiLockCloseBtn} onPress={onDismiss} activeOpacity={0.72}>
          <CrossIcon color="#8A8A9D" />
        </TouchableOpacity>

        <View style={s.apiLockIconWrap}>
          <ShieldIcon color={C.purpleSoft || C.purple} />
        </View>
        <Text style={s.apiLockTitle}>Confirm Reset</Text>
        <Text style={s.apiLockSub}>Enter your Zyron password to authorise this reset action.</Text>

        <PasswordField
          label="Password"
          value={resetAuthPassword}
          onChangeText={(val) => onChangePassword(val)}
          visible={passwordVisibility.gate}
          onToggleVisible={onToggleVisible}
          placeholder="Enter password"
          error={!!resetAuthError}
          autoFocus
        />

        {resetAuthError ? (
          <Text style={s.passwordInlineError}>{resetAuthError}</Text>
        ) : null}

        <TouchableOpacity style={s.apiLockUnlockBtn} onPress={onConfirm} activeOpacity={0.85}>
          <Text style={s.verifyAddBtnText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
