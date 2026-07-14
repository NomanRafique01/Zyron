/**
 * RemoveLockBanner.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Confirmation overlay for removing the API Configuration lock.
 * Shown as an absolute card inside the Settings modal when the user taps
 * "Remove Password" in the Password Manager panel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import s from '../../../styles/app.styles';
import C from '../../../config/colors.config';
import { CrossIcon, LockIcon } from '../../../components/shared/Icons';
import PasswordField from '../../../components/shared/PasswordField.component.jsx';

export default function RemoveLockBanner({
  visible,
  removeLockBannerPassword,
  removeLockBannerError,
  passwordVisibility,
  onChangePassword,   // (val) => void
  onToggleVisible,    // () => void
  onConfirm,          // () => void
  onCancel,           // () => void
}) {
  if (!visible) return null;

  return (
    <View style={s.apiLockOverlay}>
      <View style={s.apiLockCard}>
        {/* Close */}
        <TouchableOpacity
          style={s.apiLockCloseBtn}
          onPress={onCancel}
          activeOpacity={0.72}
        >
          <CrossIcon color="#8A8A9D" />
        </TouchableOpacity>

        <View style={s.apiLockIconWrap}>
          <LockIcon color={C.purpleSoft || C.purple} />
        </View>
        <Text style={s.apiLockTitle}>Remove API Lock?</Text>
        <Text style={s.apiLockSub}>
          Enter your current password to confirm. This will disable the API Configuration lock.
        </Text>

        <PasswordField
          label="Current Password"
          value={removeLockBannerPassword}
          onChangeText={(val) => onChangePassword(val)}
          visible={passwordVisibility.removeLock}
          onToggleVisible={onToggleVisible}
          placeholder="Enter current password"
          error={!!removeLockBannerError}
          autoFocus
        />

        {removeLockBannerError ? (
          <Text style={s.passwordInlineError}>{removeLockBannerError}</Text>
        ) : null}

        <View style={s.removeLockBannerActions}>
          <TouchableOpacity style={s.removeLockCancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={s.removeLockCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.removeLockConfirmBtn} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={s.removeLockConfirmText}>Remove Lock</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
