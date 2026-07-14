require('dotenv/config');

// app.config.js is the active Expo config — it takes priority over app.json at build/start time.
// app.json is kept unchanged as a static reference for EAS metadata.

module.exports = ({ config }) => ({
  ...config,
});
