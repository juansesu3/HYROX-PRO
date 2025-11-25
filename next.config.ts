// next.config.mjs

/** @type {import('next').NextConfig} */

import nextPWA from '@ducanh2912/next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,

  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'my-page-negiupp.s3.amazonaws.com',
        // ❌ port: ''  -> lo quitamos
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        // ❌ port: ''  -> lo quitamos
        pathname: '/**',
      },
    ],
  },

  // Importante para Next 16 + Turbopack
  turbopack: {},
};

export default withPWA(nextConfig);
