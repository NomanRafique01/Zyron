import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

export const scale = (size) => Math.round(size * widthScale);

export const verticalScale = (size) => Math.round(size * heightScale);

export const moderateScale = (size, factor = 0.5) => (
  Math.round(size + (scale(size) - size) * factor)
);

export const fontScale = (size) => {
  const scaled = size * widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const spacing = (size) => scale(size);

export const radius = (size) => scale(size);

export const wp = (percent) => Math.round(SCREEN_WIDTH * (percent / 100));

export const hp = (percent) => Math.round(SCREEN_HEIGHT * (percent / 100));

export const composerBottomPad = (safeBottom = 0) => (
  Math.max(safeBottom, verticalScale(12))
);

export const inputMinHeight = () => moderateScale(50, 0.35);

export const isCompactScreen = () => SCREEN_HEIGHT < 700;
