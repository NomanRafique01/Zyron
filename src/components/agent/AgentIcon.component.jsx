import React from 'react';
import { Image, Text } from 'react-native';
import { ICON_OPTIONS } from '../../config/agentIconOptions';

/**
 * AgentIcon
 *
 * Renders an agent icon in three ways:
 *   1. `icon` is a number  → require() asset (built-in team agents) → <Image>
 *   2. `icon` is a string key in ICON_OPTIONS → custom agent asset   → <Image>
 *   3. `icon` is any other string (emoji / unknown key)              → <Text>
 */
const AgentIcon = ({ icon, size = 28, style }) => {
  // Built-in team agents store icon as a require() number
  if (typeof icon === 'number') {
    return (
      <Image
        source={icon}
        style={[{ width: size, height: size }, style]}
        resizeMode="cover"
        fadeDuration={0}
        defaultSource={icon}
      />
    );
  }

  // Custom agents store icon as a string key (e.g. "reporter", "creator")
  if (typeof icon === 'string') {
    const option = ICON_OPTIONS.find((o) => o.key === icon);
    if (option) {
      return (
        <Image
          source={option.src}
          style={[{ width: size, height: size }, style]}
          resizeMode="cover"
          fadeDuration={0}
        />
      );
    }
    // Emoji or unrecognised string — render as text
    return (
      <Text style={[{ fontSize: size * 0.8 }, style]}>
        {icon}
      </Text>
    );
  }

  return null;
};

export default React.memo(AgentIcon);
