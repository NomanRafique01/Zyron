import React from 'react';
import { Text, Image } from 'react-native';

/**
 * AgentIcon
 *
 * Renders an agent icon that can be either:
 *   - an emoji string  → <Text>
 *   - a require() result (number) → <Image>
 *
 * Props:
 *   icon      {string | number}  emoji string or require() image source
 *   size      {number}           font size for emoji / width+height for image  (default 10)
 *   style     {object}           extra style applied to either element
 *   animated  {boolean}          when true, caller must wrap this in Animated.View;
 *                                the component itself is always non-animated
 */
export default function AgentIcon({ icon, size = 10, style }) {
  if (typeof icon === 'string') {
    return (
      <Text style={[{ fontSize: size }, style]}>
        {icon}
      </Text>
    );
  }

  // require() returns a number in React Native
  return (
    <Image
      source={icon}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
