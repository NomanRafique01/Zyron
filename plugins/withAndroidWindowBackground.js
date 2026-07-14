const {
  withAndroidStyles,
  withAndroidManifest,
} = require('@expo/config-plugins');
const {
  assignStylesValue,
  getAppThemeGroup,
} = require('@expo/config-plugins/build/android/Styles');

const ANDROID_WINDOW_BACKGROUND = 'android:windowBackground';
const ANDROID_COLOR_BACKGROUND = 'android:colorBackground';
const DEFAULT_BACKGROUND = '#0A0A0F';
const SPLASH_BG = '#050508';

// Item attribute names that must NEVER appear in any theme — they all either
// reference the non-existent splashscreen_logo drawable or trigger the Android
// 12+ SplashScreen API which shows an icon we don't want.
const BANNED_ITEM_NAMES = [
  'windowSplashScreenAnimatedIcon',
  'windowSplashScreenIcon',
  'android:windowSplashScreenAnimatedIcon',
  'android:windowSplashScreenBehavior',
  'windowSplashScreenBehavior',
  'android:windowSplashScreenBrandingImage',
  'windowSplashScreenBrandingImage',
];

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Strip any item whose name attribute is in BANNED_ITEM_NAMES, or whose value
 * contains 'splashscreen_logo'. Safe to call on any style block.
 */
function stripBannedItems(styleBlock) {
  if (!Array.isArray(styleBlock.item)) return;
  styleBlock.item = styleBlock.item.filter((item) => {
    const itemName = item.$?.name || '';
    const itemVal  = item._ || '';
    if (BANNED_ITEM_NAMES.includes(itemName)) return false;
    if (itemVal.includes('splashscreen_logo')) return false;
    return true;
  });
}

function setThemeBackground(styles, backgroundColor) {
  const parent = getAppThemeGroup();

  styles = assignStylesValue(styles, {
    parent,
    name: ANDROID_WINDOW_BACKGROUND,
    value: backgroundColor,
    add: true,
  });

  return assignStylesValue(styles, {
    parent,
    name: ANDROID_COLOR_BACKGROUND,
    value: backgroundColor,
    add: true,
  });
}

/**
 * Fully replaces Theme.App.SplashScreen with a plain AppCompat theme that
 * renders only a solid dark background — no logo, no icon, no SplashScreen API.
 *
 * Self-healing strategy (runs on every prebuild):
 *   1. Strip all banned items (windowSplashScreenAnimatedIcon etc.) from EVERY
 *      style block, not just Theme.App.SplashScreen, in case expo-splash-screen
 *      injects them elsewhere.
 *   2. Replace Theme.App.SplashScreen entirely — overwrite parent + items.
 *   3. If Theme.App.SplashScreen doesn't exist yet (e.g. plugin order changed),
 *      create it from scratch so this plugin is fully self-sufficient.
 *   4. Also strip banned items from AppTheme as a belt-and-suspenders pass.
 */
function neutraliseSplashTheme(styles) {
  const resources = styles.resources;
  if (!resources) return styles;
  if (!resources.style) resources.style = [];

  // Pass 1 — strip banned items from every style block unconditionally.
  resources.style.forEach(stripBannedItems);

  // Pass 2 — find or create Theme.App.SplashScreen.
  let splashStyle = resources.style.find(
    (s) => s.$ && s.$['name'] === 'Theme.App.SplashScreen',
  );

  if (!splashStyle) {
    // expo-splash-screen didn't generate it (e.g. different plugin order) —
    // create it so MainActivity still has a valid theme to reference.
    splashStyle = { $: { name: 'Theme.App.SplashScreen', parent: '' } };
    resources.style.push(splashStyle);
  }

  // Pass 3 — fully overwrite parent and items with a plain colour-only theme.
  splashStyle.$['parent'] = 'Theme.AppCompat.DayNight.NoActionBar';
  splashStyle.item = [
    { $: { name: 'android:windowBackground' }, _: SPLASH_BG },
    { $: { name: 'android:colorBackground' }, _: SPLASH_BG },
    { $: { name: 'android:windowIsTranslucent' }, _: 'false' },
    { $: { name: 'android:windowNoTitle' }, _: 'true' },
  ];

  return styles;
}

// ─── point MainActivity at AppTheme directly (not Theme.App.SplashScreen) ──

function pointActivityToAppTheme(androidManifest) {
  const app = androidManifest.manifest.application?.[0];
  if (!app) return androidManifest;

  const activities = app.activity || [];
  for (const activity of activities) {
    const attrs = activity.$ || {};
    if (
      attrs['android:name'] === '.MainActivity' &&
      attrs['android:theme'] === '@style/Theme.App.SplashScreen'
    ) {
      attrs['android:theme'] = '@style/AppTheme';
    }
  }

  return androidManifest;
}

// ─── plugin entry ────────────────────────────────────────────────────────────

module.exports = function withAndroidWindowBackground(config, props = {}) {
  const backgroundColor =
    props.backgroundColor ||
    config.android?.backgroundColor ||
    config.backgroundColor ||
    DEFAULT_BACKGROUND;

  // 1. Set windowBackground / colorBackground on the main AppTheme
  config = withAndroidStyles(config, (cfg) => {
    cfg.modResults = setThemeBackground(cfg.modResults, backgroundColor);
    cfg.modResults = neutraliseSplashTheme(cfg.modResults);
    return cfg;
  });

  // 2. Redirect MainActivity's theme so it never loads Theme.App.SplashScreen
  config = withAndroidManifest(config, (cfg) => {
    cfg.modResults = pointActivityToAppTheme(cfg.modResults);
    return cfg;
  });

  return config;
};
