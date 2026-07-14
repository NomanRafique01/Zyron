import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from './src/screens/splash/SplashScreen.screen.jsx';
import MainApp from './src/screens/chat/MainApp.screen.jsx';

// NOTE: react-native-keyboard-controller's KeyboardProvider requires
// react-native-reanimated, which is not installed in this project.
// The native keyboard events (KeyboardEvents emitter) are loaded via
// a deep sub-path import in keyboardUtils.js, bypassing the provider/hooks
// barrel that pulls in Reanimated.  No wrapper is needed here.

// Called at module evaluation time — before any render — so the native
// splash is held in its (now dark, logo-free) state until we dismiss it.
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Dismiss the native splash on the very first effect after mount so our
  // custom SplashScreen is already painted before the native one disappears.
  useEffect(() => {
    ExpoSplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <MainApp splashVisible={isLoading} />
      {isLoading && (
        <SplashScreen onFinish={() => setIsLoading(false)} />
      )}
    </SafeAreaProvider>
  );
}