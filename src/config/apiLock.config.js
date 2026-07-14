/**
 * apiLock.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SecureStore key constants for the optional API Configuration Lock feature.
 * Centralises all storage key names so they are never duplicated across files.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** SecureStore key: hashed / plaintext lock password */
export const API_LOCK_PASSWORD_KEY = 'Zyron_API_LOCK_PASSWORD';

/** SecureStore key: plaintext recovery hint (non-sensitive) */
export const API_LOCK_HINT_KEY = 'Zyron_API_LOCK_HINT';

/**
 * Empty password form — used to reset the Password Manager draft state.
 * Spread this object onto passwordForm state to wipe all fields at once.
 */
export const EMPTY_PASSWORD_FORM = {
  password: '',
  confirmPassword: '',
  hint: '',
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
  newHint: '',
};
