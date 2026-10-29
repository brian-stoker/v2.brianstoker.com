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
  // The tracing root for this site is the repository root, so every deploy was
  // packing the whole checkout into the server Lambda: source artwork, blog
  // media, SST's own pulumi state and old artifact zips. The package crossed
  // Lambda's 250 MB unzipped limit on 2026-10-29 and the deploy failed with
  // "Unzipped size must be smaller than 262144000 bytes". Public media and
  // hero images are uploaded to the bucket as static assets and never read by
  // the function, and the .plan MDX files the pages do read are re-included
  // below.
  outputFileTracingExcludes: {
    '*': [
      './.sst/**',
      './.next/cache/**',
      './.git/**',
      './data/**/*.ai',
      './data/**/*.pdf',
      './*.ai',
      './*.xcf',
      './public/static/**',
    ],
  },
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
