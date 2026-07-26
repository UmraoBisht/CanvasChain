/** @type {import('tailwindcss').Config} */
const preset = require('@canvas-chain/config/tailwind.config.preset');

module.exports = {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
