/**
 * ApiLockGate.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * API Configuration Lock gate overlay — shown inside the Settings modal when
 * the user taps "API Configuration" while a lock password is set.
 * Renders over the ScrollView as an absolute overlay card.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { CrossIcon, LockIcon } from '../../../components/shared/Icons';
import PasswordField from '../../../components/shared/PasswordField.component.jsx';

export default function ApiLockGate({
  visible,
  apiLockGatePassword,
  apiLockGateAttempts,
  apiLockGateError,
  apiLockHint,
  passwordVisibility,
  onChangePassword,     // (val) => void
  onToggleVisible,      // () => void
  onUnlock,             // () => void
  onClose,              // () => void — resetApiLockGate
}) {
  if (!visible) return null;

  return (
    <View style={s.apiLockOverlay}>
      <View style={s.apiLockCard}>
        {/* Close */}
        <TouchableOpacity style={s.apiLockCloseBtn} onPress={onClose} activeOpacity={0.72}>
          <CrossIcon color="#8A8A9D" />
        </TouchableOpacity>

        <View style={s.apiLockIconWrap}>
          <LockIcon color={C.purpleSoft || C.purple} />
        </View>
        <Text style={s.apiLockTitle}>API Configuration Locked</Text>
        <Text style={s.apiLockSub}>Enter your password to manage provider sockets and API keys.</Text>

        <PasswordField
          label="Password"
          value={apiLockGatePassword}
          onChangeText={(val) => onChangePassword(val)}
          visible={passwordVisibility.gate}
          onToggleVisible={onToggleVisible}
          placeholder="Enter password"
          error={!!apiLockGateError}
          autoFocus
        />

        {apiLockGateError ? (
          <Text style={s.passwordInlineError}>{apiLockGateError}</Text>
        ) : null}

        {/* Show hint after 5 failed attempts */}
        {apiLockGateAttempts >= 5 && apiLockHint ? (
          <View style={s.apiLockHintBanner}>
            <Text style={s.apiLockHintTitle}>Password hint</Text>
            <Text style={s.apiLockHintText}>{apiLockHint}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={s.apiLockUnlockBtn} onPress={onUnlock} activeOpacity={0.85}>
          <Text style={s.verifyAddBtnText}>Unlock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
