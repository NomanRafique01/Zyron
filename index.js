import { registerRootComponent } from 'expo';

import App from './App';

// ─── Global JS error handler ─────────────────────────────────────────────────
// In release builds there is no Metro error overlay. Without this, any
// unhandled JS exception silently kills the app with no visible trace.
// ErrorUtils is a React Native global — always present in both dev and release.
if (global.ErrorUtils) {
  const originalHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Log to Metro / adb logcat so the crash is visible in release builds.
    // Tag: [ZyronError] — filter with: adb logcat -s ZyronError
    console.error(
      `[ZyronError] ${isFatal ? 'FATAL' : 'non-fatal'}: ${error?.message ?? error}`,
      error?.stack ?? ''
    );
    // Delegate to the original handler so React Native can do its own cleanup.
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
