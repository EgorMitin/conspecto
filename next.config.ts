import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
  },
  transpilePackages: [
    'lexical',
    '@lexical/react',
    '@lexical/rich-text',
    '@lexical/list',
    '@lexical/utils'
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'lexical': require.resolve('lexical'),
      '@lexical/utils': require.resolve('@lexical/utils'),
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
