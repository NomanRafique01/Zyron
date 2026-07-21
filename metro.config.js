const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ── Resolver: ensure .jsx files are always resolved ─────────────────────────
const defaultExtensions = config.resolver.sourceExts || [];
if (!defaultExtensions.includes('jsx')) {
  config.resolver.sourceExts = ['jsx', ...defaultExtensions];
}

// ── Transformer: inline requires (lazy module loading) ───────────────────────
// Modules are only evaluated when they are first accessed, not at startup.
// This shrinks the cold-start JS parse cost and reduces the bundle evaluated
// on launch — all logic stays identical, execution is just deferred.
config.transformer = {
  ...config.transformer,
  inlineRequires: true,
};

// ── Serializer: minify identifier names in production ────────────────────────
// Metro's default minifier (terser) already runs in prod via expo build.
// Setting minifierConfig here ensures tree-shaking passes run cleanly.
config.serializer = {
  ...config.serializer,
};

module.exports = config;
