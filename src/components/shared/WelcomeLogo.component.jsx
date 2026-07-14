/**
 * WelcomeLogo.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Zyron logo on the welcome / empty-chat screen.
 *
 * Logo image is static (fully opaque at all times).
 * Only the border/glow wrapper breathes via opacity animation.
 * Uses useNativeDriver:true (opacity only) — safe on all Android GPU drivers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useEffect } from 'react';
import { View, Image, Animated } from 'react-native';
import { scale, spacing, radius } from '../../utils/responsive.utils';

/**
 * WelcomeLogo
 *
 * @param {boolean} [isOffline=false] — When true, renders the offline (red)
 *                                      border/glow instead of the default purple.
 */
export default function WelcomeLogo({ isOffline = false }) {
  const logoSize = scale(80);
  // Animate only the border wrapper opacity — logo stays fully opaque
  const borderAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(borderAnim, { toValue: 0.3, duration: 2800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [borderAnim]);

  // Static colors — no JS-driven color interpolation (crashes Mali-T720 / old GPU drivers)
  const borderColor = isOffline ? 'rgba(239, 68, 68, 0.55)' : 'rgba(123, 47, 255, 0.55)';
  const bgColor = isOffline ? 'rgba(239, 68, 68, 0.07)' : 'rgba(123, 47, 255, 0.07)';

  return (
    <View style={{ alignItems: 'center', marginBottom: spacing(18) }}>
      {/* Outer container — holds border animation + static logo in a stack */}
      <View style={{ borderRadius: radius(20), padding: 3 }}>
        {/* Animated border layer — opacity only, sits behind the logo */}
        <Animated.View
          style={{
            ...StyleSheet_absoluteFill,
            borderRadius: radius(20),
            borderWidth: 1.5,
            borderColor,
            backgroundColor: bgColor,
            opacity: borderAnim,
          }}
        />
        {/* Static logo — always fully opaque */}
        <Image
          source={require('../../../assets/images/logo.png')}
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: radius(18),
            backgroundColor: '#050508',
          }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

// Inline absoluteFill to avoid importing StyleSheet just for one constant
const StyleSheet_absoluteFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
