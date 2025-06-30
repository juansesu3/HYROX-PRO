// next.config.mjs

/** @type {import('next').NextConfig} */

// 1. Importar el wrapper de PWA
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

// 2. Definir tu configuración de Next.js
const nextConfig = {
  // Tu configuración de imágenes que ya tenías
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'my-page-negiupp.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Aquí puedes añadir otras configuraciones en el futuro
};

// 3. Envolver tu configuración con la de la PWA y exportarla
module.exports = withPWA(nextConfig);