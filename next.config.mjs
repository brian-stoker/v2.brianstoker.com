// next.config.js or next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  transpilePackages: ['@stoked-ui/docs', '@mui/icons-material'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/icons-material': '@mui/icons-material/esm',
      };
    }
    return config;
  },
  // Any other config you need
};

export default nextConfig;
