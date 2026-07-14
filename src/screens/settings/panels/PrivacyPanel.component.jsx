/**
 * PrivacyPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Privacy & Security information panel inside Settings.
 * Pure display — no interactive controls; five static information blocks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text } from 'react-native';
import s from '../../../styles/app.styles';

export default function PrivacyPanel() {
  return (
    <View style={s.infoPanel}>
      <Text style={s.infoPanelTitle}>On-device credential storage</Text>
      <Text style={s.infoPanelText}>
        Zyron stores provider API keys exclusively on your device using Expo SecureStore, which leverages the platform's encrypted credential vault where available. Keys are never embedded in chat history, transmitted to Zyron servers, or shared with third parties. They are accessed only when an active agent makes an authorized request to its configured model provider.
      </Text>

      <Text style={s.infoPanelTitle}>Saved-key visibility lock</Text>
      <Text style={s.infoPanelText}>
        Once an API key is verified and saved, Zyron permanently masks the credential in the interface and prevents it from being revealed again through Settings. To replace a stored key, delete the existing credential and verify a new one. This design adds a deliberate second layer of protection beyond encrypted storage, reducing the risk of accidental exposure on a shared or unattended device.
      </Text>

      <Text style={s.infoPanelTitle}>API Configuration Lock</Text>
      <Text style={s.infoPanelText}>
        The optional API Configuration Lock requires a local password before provider keys, model selections, and agent settings can be accessed or modified. Both the password and recovery hint are stored via SecureStore on the same encrypted path as your API credentials, ensuring sensitive configuration remains protected even if someone gains physical access to the device.
      </Text>

      <Text style={s.infoPanelTitle}>Third-party provider data handling</Text>
      <Text style={s.infoPanelText}>
        When Zyron contacts a model provider on your behalf, your prompts, attachments, and responses may be subject to that provider's own privacy policy, retention schedule, logging practices, and training policies. Before activating any key, review the provider's terms of service and data processing documentation to confirm they meet your compliance and confidentiality requirements.
      </Text>

      <Text style={s.infoPanelTitle}>Conversation and profile data</Text>
      <Text style={s.infoPanelText}>
        Chat history, profile preferences, and application settings are retained locally on this device. Zyron does not operate a cloud backend that collects or synchronizes your conversations. You maintain full control over your data through the Reset Data controls, which allow selective or complete removal of stored information at any time.
      </Text>

      <Text style={s.infoPanelTitle}>Responsible use guidelines</Text>
      <Text style={s.infoPanelText}>
        Use dedicated API keys scoped to Zyron where your provider allows it, rotate credentials on a regular schedule, and deactivate agents you are not actively using. Do not submit passwords, authentication tokens, financial records, health information, or other regulated or confidential material unless you have verified that your chosen provider supports the required data protection and compliance posture.
      </Text>
    </View>
  );
}
