const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env.local');
const parsed = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

// Build finalEnv by preferring actual process.env (e.g. from EAS secrets)
const finalEnv = {};
Object.keys(parsed).forEach((k) => {
  finalEnv[k] = process.env[k] || parsed[k];
});

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      ...finalEnv,
    },
  };
};
