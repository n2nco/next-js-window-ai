const { parsed: localEnv } = require('dotenv').config()

module.exports = {
  env: {
    OPENAI_API_KEY: localEnv.OPENAI_API_KEY, //not in use, using .env file
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.experiments = {
        asyncWebAssembly: true,
      };
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });
    }
    return config;
  },
};
