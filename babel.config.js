module.exports = function (api) {
  api.cache(true);

  const isProd = process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove all console.* calls in production APK — prevents log overhead
      // and avoids leaking debug info on user devices.
      ...(isProd ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
    ],
  };
};
