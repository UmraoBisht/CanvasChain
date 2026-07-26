import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@canvas-chain/ui', '@canvas-chain/shared', '@canvas-chain/icons'],
};

export default nextConfig;
