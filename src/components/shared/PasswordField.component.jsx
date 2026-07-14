/**
 * PasswordField.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable password input field with show/hide toggle.
 * Used by the Password Manager panel and the API Lock gate overlays.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import s from '../../styles/app.styles';
import { EyeIcon, EyeOffIcon } from './Icons';

/**
 * PasswordField
 *
 * @param {string}   label            — Field label rendered above the input
 * @param {string}   value            — Controlled input value
 * @param {function} onChangeText     — onChange handler
 * @param {boolean}  visible          — true = text visible, false = masked
 * @param {function} onToggleVisible  — toggle callback
 * @param {string}   [placeholder]    — Placeholder text (default: 'Password')
 * @param {boolean}  [error]          — Applies error border style when true
 * @param {boolean}  [autoFocus]      — Auto-focuses the input on mount
 */
export default function PasswordField({
  label,
  value,
  onChangeText,
  visible,
  onToggleVisible,
  placeholder = 'Password',
  error = false,
  autoFocus = false,
}) {
  return (
    <View style={s.passwordFieldBlock}>
      <Text style={s.inputLabel}>{label}</Text>
      <View style={[s.passwordInputShell, error && s.passwordInputError]}>
        <TextInput
          style={s.passwordTextInput}
          placeholder={placeholder}
          placeholderTextColor="#5A5A70"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
        />
        <TouchableOpacity
          style={s.passwordEyeBtn}
          onPress={onToggleVisible}
          activeOpacity={0.72}
        >
          {visible ? <EyeOffIcon color="#8A8A9D" /> : <EyeIcon color="#8A8A9D" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
