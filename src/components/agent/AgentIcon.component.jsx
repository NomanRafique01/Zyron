import React from 'react';
import { Image, Text } from 'react-native';

const AgentIcon = ({ icon, size = 28, style }) => {
  if (typeof icon === 'number') {
    return (
      <Image
        source={icon}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
      />
    );
  }
  return (
    <Text style={[{ fontSize: size * 0.8 }, style]}>
      {icon}
    </Text>
  );
};

export default AgentIcon;
