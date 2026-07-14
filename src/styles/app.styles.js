import { StyleSheet } from 'react-native';

import layoutStyles from './layout.styles';
import feedbackStyles from './feedback.styles';
import welcomeStyles from './welcome.styles';
import sidebarStyles from './sidebar.styles';
import settingsStyles from './settings.styles';
import profileStyles from './profile.styles';
import socketStyles from './socket.styles';

const appStyles = StyleSheet.create({
  ...layoutStyles,
  ...feedbackStyles,
  ...welcomeStyles,
  ...sidebarStyles,
  ...settingsStyles,
  ...profileStyles,
  ...socketStyles,
});

export default appStyles;
