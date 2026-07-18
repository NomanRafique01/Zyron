import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from './src/screens/splash/SplashScreen.screen.jsx';
import MainApp from './src/screens/chat/MainApp.screen.jsx';

// Hold the native splash until our custom one is painted.
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Dismiss native splash on first render.
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
