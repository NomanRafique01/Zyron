/**
 * ConfirmDialog.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic confirmation dialog Modal for Zyron.
 *
 * Used for all destructive/confirmable actions:
 *   • Delete conversation
 *   • Delete API key
 *   • Deactivate agents
 *   • Clear all data
 *   etc.
 *
 * Dialog is controlled externally via the `confirmDialog` state object.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import s from '../../styles/app.styles';

/**
 * ConfirmDialog
 *
 * @param {object|null} confirmDialog — { title, message, confirmLabel, destructive, onConfirm }
 * @param {function}    onClose       — called when Cancel pressed or dialog dismissed
 */
export default function ConfirmDialog({ confirmDialog, onClose }) {
  return (
    <Modal
      visible={!!confirmDialog}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={s.confirmOverlay}>
        <View style={s.confirmCard}>
          <View style={[
            s.confirmAccent,
            confirmDialog?.destructive ? s.confirmAccentDanger : s.confirmAccentInfo
          ]} />
          <Text style={s.confirmTitle}>{confirmDialog?.title}</Text>
          <Text style={s.confirmMessage}>{confirmDialog?.message}</Text>
          <View style={s.confirmActions}>
            <TouchableOpacity
              style={s.confirmCancelBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={s.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.confirmPrimaryBtn,
                confirmDialog?.destructive ? s.confirmDangerBtn : s.confirmInfoBtn
              ]}
              onPress={async () => {
                const action = confirmDialog?.onConfirm;
                onClose();
                await action?.();
              }}
              activeOpacity={0.85}
            >
              <Text style={s.confirmPrimaryText}>{confirmDialog?.confirmLabel || 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
