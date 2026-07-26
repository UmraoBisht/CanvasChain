/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@canvas-chain/ui',
    '@canvas-chain/icons',
    '@canvas-chain/hooks',
    '@canvas-chain/canvas-engine',
    '@canvas-chain/types',
    '@canvas-chain/utils',
    '@canvas-chain/shared',
    '@canvas-chain/service-sync',
    '@canvas-chain/service-auth',
    '@canvas-chain/service-storage',
  ],
};

module.exports = nextConfig;
