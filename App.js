import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from './src/screens/splash/SplashScreen.screen.jsx';
import MainApp from './src/screens/chat/MainApp.screen.jsx';

// Pre-resolve and cache all agent icon PNGs so they are in memory before
// the Agent Library panel scrolls.
const AGENT_ICON_SOURCES = [
  // Mega Minds
  require('./assets/agent-icons/mega-minds/scholar.png'),
  require('./assets/agent-icons/mega-minds/analyst.png'),
  require('./assets/agent-icons/mega-minds/synthesizer.png'),
  require('./assets/agent-icons/mega-minds/editor.png'),
  // Coders
  require('./assets/agent-icons/coders/designer.png'),
  require('./assets/agent-icons/coders/programmer.png'),
  require('./assets/agent-icons/coders/debugger.png'),
  require('./assets/agent-icons/coders/executor.png'),
  // Creative Thinkers
  require('./assets/agent-icons/creative/strategist.png'),
  require('./assets/agent-icons/creative/creator.png'),
  require('./assets/agent-icons/creative/curator.png'),
  require('./assets/agent-icons/creative/narrator.png'),
  // Scientists
  require('./assets/agent-icons/scientists/theorist.png'),
  require('./assets/agent-icons/scientists/experimenter.png'),
  require('./assets/agent-icons/scientists/modeler.png'),
  require('./assets/agent-icons/scientists/reporter.png'),
  // Historians
  require('./assets/agent-icons/historians/archivist.png'),
  require('./assets/agent-icons/historians/contextualist.png'),
  require('./assets/agent-icons/historians/cartographer.png'),
  require('./assets/agent-icons/historians/biographer.png'),
  // Financers
  require('./assets/agent-icons/financers/accountant.png'),
  require('./assets/agent-icons/financers/adviser.png'),
  require('./assets/agent-icons/financers/auditor.png'),
  require('./assets/agent-icons/financers/investor.png'),
];

AGENT_ICON_SOURCES.forEach((src) => {
  const resolved = Image.resolveAssetSource(src);
  if (resolved?.uri) Image.prefetch(resolved.uri);
});

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
      <MainApp
        splashVisible={isLoading}
        onSignedOut={() => {}}
      />
      {isLoading && (
        <SplashScreen onFinish={() => setIsLoading(false)} />
      )}
    </SafeAreaProvider>
  );
}
