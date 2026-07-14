/**
 * SetupGuideModal.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * First-run / no-keys setup guide modal for Zyron.
 *
 * Shown when the user tries to send a message but has no API keys configured.
 * Presents a brief 3-step onboarding guide and a CTA to open the API
 * Configuration panel in Settings.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';

// BlurView safe wrapper — expo-blur can crash on older Android GPU drivers
// (Mali-T720 / Kirin 659 in Huawei Y7 Prime and similar budget devices).
// If BlurView fails to render, fall back to a semi-opaque dark View.
const SafeBlurView = ExpoBlurView || (({ style }) => (
  <View style={[style, { backgroundColor: 'rgba(0,0,0,0.88)' }]} />
));

/**
 * SetupGuideModal
 *
 * @param {boolean}  visible
 * @param {function} onClose
 * @param {function} onOpenSettings   — opens Settings then navigates to api panel
 */
export default function SetupGuideModal({ visible, onClose, onOpenSettings }) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <SafeBlurView
          intensity={70}
          tint="dark"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={{
          width: '88%',
          maxWidth: 380,
          backgroundColor: '#0D0D18',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(123, 47, 255, 0.2)',
          padding: 28,
          alignItems: 'center',
          shadowColor: '#7B2FFF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 30,
          elevation: 12,
        }}>
          {/* Glow Accent Line */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 28,
            right: 28,
            height: 2,
            borderRadius: 1,
            backgroundColor: '#7B2FFF',
            opacity: 0.6,
          }} />

          {/* Logo */}
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'rgba(123, 47, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(123, 47, 255, 0.25)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={{ width: 36, height: 36, borderRadius: 10 }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={{
            color: '#FFFFFF',
            fontSize: 17,
            fontWeight: '800',
            letterSpacing: 0.3,
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Welcome to Zyron
          </Text>

          {/* Subtitle */}
          <Text style={{
            color: '#8A8A9D',
            fontSize: 12,
            fontWeight: '500',
            textAlign: 'center',
            lineHeight: 18,
            marginBottom: 22,
            paddingHorizontal: 8,
          }}>
            To get started, pick a team, add your API keys, and activate Agent Coordination. Each agent handles a dedicated role.
          </Text>

          {/* Steps */}
          <View style={{ width: '100%', marginBottom: 22 }}>
            {[
              { step: '1', text: 'Open Settings → API Configuration' },
              { step: '2', text: 'Select a team and add your API keys' },
              { step: '3', text: 'Verify keys, then activate Agent Coordination' },
            ].map((item) => (
              <View key={item.step} style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginBottom: 10,
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  backgroundColor: 'rgba(123, 47, 255, 0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(123, 47, 255, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ color: '#A78BFA', fontSize: 10, fontWeight: '800' }}>{item.step}</Text>
                </View>
                <Text style={{ color: '#C8C8D4', fontSize: 11, fontWeight: '600', flex: 1 }}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* Primary Action */}
          <TouchableOpacity
            style={{
              width: '100%',
              backgroundColor: '#7B2FFF',
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
            onPress={onOpenSettings}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Set Up Agents</Text>
          </TouchableOpacity>

          {/* Secondary / Cancel */}
          <TouchableOpacity
            style={{
              width: '100%',
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#222235',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Text style={{ color: '#8A8A9D', fontSize: 12, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
