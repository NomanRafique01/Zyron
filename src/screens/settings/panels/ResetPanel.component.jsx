/**
 * ResetPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reset Data panel inside Settings.
 * Four reset actions with escalating destructiveness:
 *   1. Deactivate all API keys  (keeps keys, just sets inactive)
 *   2. Delete all chats         (wipes SQLite + index)
 *   3. Delete saved API keys    (wipes SecureStore credentials)
 *   4. Reset app data           (full wipe — uninstall simulation)
 *
 * Each button calls onRequestReset({ key, title, message, impact, confirmLabel,
 * onConfirm }) which triggers auth + confirm dialog in the parent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import s from '../../../styles/app.styles';

export default function ResetPanel({
  onDeactivateAllApiKeys,    // () => void  (wrapped in requestReset by parent)
  onDeleteAllChats,          // () => void
  onDeleteSavedApiKeys,      // () => void
  onClearAllData,            // () => void
  onRequestReset,            // ({ key, title, message, impact, confirmLabel, onConfirm }) => void
}) {
  return (
    <View style={s.resetPanel}>
      <Text style={s.infoPanelTitle}>Reset controls</Text>
      <Text style={s.infoPanelText}>
        Choose exactly what to clear. Full reset returns Zyron to a fresh install state.
      </Text>

      {/* Deactivate API keys */}
      <TouchableOpacity
        style={s.resetActionBtn}
        onPress={() => onRequestReset({
          key: 'deactivate',
          title: 'Deactivate all API keys?',
          message: 'Every socket will be switched off while your saved provider keys stay encrypted on this device.',
          impact: 'Use this when you want to pause the agent execution without deleting credentials.',
          confirmLabel: 'Deactivate',
          onConfirm: onDeactivateAllApiKeys,
        })}
        activeOpacity={0.8}
      >
        <Text style={s.resetActionTitle}>Deactivate all API keys</Text>
        <Text style={s.resetActionSub}>Keeps saved keys but turns every socket inactive.</Text>
      </TouchableOpacity>

      {/* Delete chats */}
      <TouchableOpacity
        style={s.resetActionBtn}
        onPress={() => onRequestReset({
          key: 'chats',
          title: 'Delete all chats?',
          message: 'This removes every local conversation and message from chat history.',
          impact: 'API keys, provider settings, profile, and app preferences will remain unchanged.',
          confirmLabel: 'Delete chats',
          onConfirm: onDeleteAllChats,
        })}
        activeOpacity={0.8}
      >
        <Text style={s.resetActionTitle}>Delete all chats</Text>
        <Text style={s.resetActionSub}>Removes local conversation history only.</Text>
      </TouchableOpacity>

      {/* Delete saved API keys */}
      <TouchableOpacity
        style={s.resetActionBtn}
        onPress={() => onRequestReset({
          key: 'keys',
          title: 'Delete saved API keys?',
          message: 'All provider keys will be removed from SecureStore and every socket will become inactive.',
          impact: 'Chat history and app settings stay intact, but custom providers must be configured again.',
          confirmLabel: 'Delete keys',
          onConfirm: onDeleteSavedApiKeys,
        })}
        activeOpacity={0.8}
      >
        <Text style={s.resetActionTitle}>Delete saved API keys</Text>
        <Text style={s.resetActionSub}>Clears provider keys from secure storage.</Text>
      </TouchableOpacity>

      {/* Full reset — danger */}
      <TouchableOpacity
        style={s.resetDangerBtn}
        onPress={() => onRequestReset({
          key: 'app',
          title: 'Reset all Zyron data?',
          message: 'This wipes chats, API keys, profile context, locks, preferences, and local app state.',
          impact: 'Zyron will return to a fresh install state. This action cannot be undone.',
          confirmLabel: 'Reset app',
          onConfirm: onClearAllData,
        })}
        activeOpacity={0.8}
      >
        <Text style={s.resetDangerTitle}>Reset app data</Text>
        <Text style={s.resetDangerSub}>Wipes chats, API keys, settings, and local app state.</Text>
      </TouchableOpacity>
    </View>
  );
}
