// next.config.js or next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  ental: {
    turbo: false, // Disable for OpenNext compatibility
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Any other config you need
};

export default nextConfig;
