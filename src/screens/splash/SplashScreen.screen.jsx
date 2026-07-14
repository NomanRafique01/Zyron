import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, radius, spacing } from '../../utils/responsive.utils';

// Shorter splash on all devices — show the app faster on low-end hardware
const SPLASH_DURATION = 1800;

export default function SplashScreen({ onFinish }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -28,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish?.();
      });
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [opacity, translateY, onFinish]);

  return (
    <Animated.View
      style={[styles.container, StyleSheet.absoluteFillObject, { opacity, transform: [{ translateY }], pointerEvents: 'none' }]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#050508" />
      <LinearGradient
        colors={['#050508', '#080810', '#050508']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.brandBlock}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.appName}>Zyron</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050508',
    zIndex: 999,
  },

  brandBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -12 }],
  },
  logoContainer: {
    borderRadius: radius(20),
    borderWidth: 1.5,
    borderColor: 'rgba(123, 47, 255, 0.5)',
    backgroundColor: 'rgba(123, 47, 255, 0.08)',
    padding: 3,
    elevation: 12,
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
  },
  logo: {
    width: scale(80),
    height: scale(80),
    borderRadius: radius(18),
    backgroundColor: '#050508',
  },
  appName: {
    marginTop: spacing(22),
    color: '#F7F4FF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1.8,
    textShadowColor: 'rgba(123, 47, 255, 0.28)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
});
