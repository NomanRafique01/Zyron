const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .jsx files are always resolved (alongside the default .js, .ts, .tsx)
// Without this, Metro on some platforms skips .jsx when the import has no extension.
const defaultExtensions = config.resolver.sourceExts || [];
if (!defaultExtensions.includes('jsx')) {
  config.resolver.sourceExts = ['jsx', ...defaultExtensions];
}

module.exports = config;
