/** @type {import('next').NextConfig} */
const { parsed: localEnv } = require('dotenv').config()

const nextConfig = {
  env: {
    OPENAI_API_KEY: localEnv.OPENAI_API_KEY, //not in use, using .env file
  },
  reactStrictMode: true,
}

module.exports = nextConfig
