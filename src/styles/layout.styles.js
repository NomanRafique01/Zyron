import C from '../config/colors.config';
import { spacing, verticalScale, hp } from '../utils/responsive.utils';

const layoutStyles = {
    rootContainer: {
    flex: 1,
    backgroundColor: '#0E0E18',
    position: 'relative',
  },
    statusBarSpacer: {
    backgroundColor: C.bgHeader,
  },
    mainWrapper: {
    flex: 1,
    backgroundColor: '#0E0E18',
  },
    screenBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
    chatShell: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
    headerGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 78,
    height: 128,
    zIndex: 1,
  },
    topGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 360,
    zIndex: 0,
  },
    chatArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
    chatConversation: {
    flex: 1,
    minHeight: 0,
  },
    composerDock: {
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing(0),
    zIndex: 30,
  },
    // Welcome hero anchored to mainWrapper — position:absolute makes it immune
    // to the OS adjustResize window shrink that only affects chatShell's flex children.
    welcomeHeroAnchor: {
    position: 'absolute',
    top: hp(35),
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing(24),
    zIndex: 1,
  },
    chatContent: {
    paddingTop: verticalScale(52),
    paddingBottom: spacing(12),
  },
    typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
    typingText: {
    color: '#8A8A9D',
    fontSize: 12,
    fontWeight: '500',
  },
    offlineBanner: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
    offlineText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Full-area overlay rendered over the chat shell (message list + composer)
  // while a conversation is loading. position:absolute so it lifts out of flex flow.
    chatLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 14, 24, 0.82)',
    zIndex: 50,
  },
    chatLoadingCard: {
    alignItems: 'center',
    gap: 14,
  },
    chatLoadingText: {
    color: '#8E8EA0',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
};

export default layoutStyles;
