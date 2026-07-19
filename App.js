import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from './src/screens/splash/SplashScreen.screen.jsx';
import MainApp from './src/screens/chat/MainApp.screen.jsx';

// Pre-resolve and cache all agent icon PNGs so they are in memory before
// the Agent Library panel scrolls. resolveAssetSource turns the static
// require() number into a URI that Image.prefetch can load immediately.
const AGENT_ICON_SOURCES = [
  require('./assets/agent-icons/analyst.png'),
  require('./assets/agent-icons/archivist.png'),
  require('./assets/agent-icons/biographer.png'),
  require('./assets/agent-icons/cartographer.png'),
  require('./assets/agent-icons/coder.png'),
  require('./assets/agent-icons/contextualist.png'),
  require('./assets/agent-icons/creator.png'),
  require('./assets/agent-icons/curator.png'),
  require('./assets/agent-icons/debugger.png'),
  require('./assets/agent-icons/designer.png'),
  require('./assets/agent-icons/editor.png'),
  require('./assets/agent-icons/executor.png'),
  require('./assets/agent-icons/experimenter.png'),
  require('./assets/agent-icons/modeler.png'),
  require('./assets/agent-icons/narrator.png'),
  require('./assets/agent-icons/programmer.png'),
  require('./assets/agent-icons/reasoner.png'),
  require('./assets/agent-icons/reporter.png'),
  require('./assets/agent-icons/scholar.png'),
  require('./assets/agent-icons/strategist.png'),
  require('./assets/agent-icons/synthesizer.png'),
  require('./assets/agent-icons/theorist.png'),
  require('./assets/agent-icons/vision.png'),
  require('./assets/agent-icons/writer.png'),
];

AGENT_ICON_SOURCES.forEach((src) => {
  const resolved = Image.resolveAssetSource(src);
  if (resolved?.uri) Image.prefetch(resolved.uri);
});

// Hold the native splash until our custom one is painted.
ExpoSplashScreen.preventAutoHideAsync();

// Check if Firebase native modules are available (they are NOT in Expo Go).
let FIREBASE_AVAILABLE = false;
try {
  require('@react-native-firebase/app');
  FIREBASE_AVAILABLE = true;
} catch (_) {}

export default function App() {
  const [isLoading, setIsLoading]     = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Dismiss native splash on first render.
  useEffect(() => {
    ExpoSplashScreen.hideAsync();
  }, []);

  // Listen to Firebase auth state only if Firebase is available.
  useEffect(() => {
    if (!FIREBASE_AVAILABLE) {
      // Expo Go — skip auth entirely, go straight to main app.
      setAuthChecked(true);
      return;
    }

    // Custom dev build — real Firebase auth listener.
    const { onAuthStateChanged } = require('./src/services/auth.service');
    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // Show splash while Firebase resolves auth state.
  if (!authChecked) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => {}} />
      </SafeAreaProvider>
    );
  }

  // Expo Go path — no auth, straight to app.
  if (!FIREBASE_AVAILABLE) {
    return (
      <SafeAreaProvider>
        <MainApp
          splashVisible={isLoading}
          currentUser={null}
          onSignedOut={() => {}}
        />
        {isLoading && (
          <SplashScreen onFinish={() => setIsLoading(false)} />
        )}
      </SafeAreaProvider>
    );
  }

  // Custom dev build — full auth flow.
  const AuthScreen = require('./src/screens/auth/AuthScreen.screen.jsx').default;

  return (
    <SafeAreaProvider>
      {currentUser ? (
        <>
          <MainApp
            splashVisible={isLoading}
            currentUser={currentUser}
            onSignedOut={() => setCurrentUser(null)}
          />
          {isLoading && (
            <SplashScreen onFinish={() => setIsLoading(false)} />
          )}
        </>
      ) : (
        <AuthScreen onAuthenticated={() => {
          // onAuthStateChanged fires automatically and updates currentUser
        }} />
      )}
    </SafeAreaProvider>
  );
}
