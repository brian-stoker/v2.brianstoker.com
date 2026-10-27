// next.config.js or next.config.mjs
import createMDX from '@next/mdx'

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

/** @type {import('next').NextConfig} */
const nextConfig = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  outputFileTracingIncludes: {
    '/plan': ['./data/.plan/**/*.mdx', './pages/home/**/*.mdx'],
    '/plan/*': ['./data/.plan/**/*.mdx', './pages/home/**/*.mdx'],
    '/api/plan': ['./data/.plan/**/*.mdx', './pages/home/**/*.mdx'],
    '/api/plan/rss': ['./data/.plan/**/*.mdx', './pages/home/**/*.mdx'],
  },
  transpilePackages: ['@stoked-ui/docs', '@mui/icons-material'],
  // Turbopack config (used with next dev --turbopack)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      '@mui/icons-material': '@mui/icons-material/esm',
    },
  },
  async rewrites() {
    return { beforeFiles: [
      { source: '/.plan/:path*', destination: '/plan/:path*' },
      { source: '/feed/.plan/rss.xml', destination: '/api/plan/rss' },
    ] };
  },
  // Webpack config (used for production builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/icons-material': '@mui/icons-material/esm',
      };
    }

    // Configure @svgr/webpack for SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});

export default nextConfig;
