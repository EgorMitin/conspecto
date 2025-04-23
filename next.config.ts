import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental'
  },
  transpilePackages: [
    'lexical',
    '@lexical/react',
    '@lexical/rich-text',
    '@lexical/list',
    '@lexical/utils'
  ],
  webpack: (config) => {
    // Enable proper module resolution for lexical
    config.resolve.alias = {
      ...config.resolve.alias,
      'lexical': require.resolve('lexical'),
      '@lexical/utils': require.resolve('@lexical/utils'),
    };
    return config;
  },
};

export default nextConfig;
