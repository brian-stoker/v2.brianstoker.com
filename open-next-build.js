#!/usr/bin/env node

/**
 * OpenNext Build Script for Next.js 15
 * This script creates a temporary modified next.config.js to build with open-next
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Backup the original next.config.mjs
const nextConfigPath = './next.config.mjs';
let originalConfig = '';

if (fs.existsSync(nextConfigPath)) {
  originalConfig = fs.readFileSync(nextConfigPath, 'utf8');
  fs.copyFileSync(nextConfigPath, `${nextConfigPath}.bak`);
  console.log('Backed up original next.config.mjs');
}

// Apply the patches from fix-nextjs15.js first
try {
  console.log('Applying Next.js 15 compatibility patches...');
  execSync('node fix-nextjs15.js apply', { stdio: 'inherit' });

  // Create a simplified next.config.js file for open-next
  const openNextConfig = `
/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Strip unserializable props with workaround
    externalMiddlewareRewritesResolve: true,
    workerThreads: true,
    cpus: 3,
  }
};

// Add custom serialization hook to fix DataCloneError
process.env.NEXT_SKIP_SERIALIZING_PROPS = '1';

export default config;
`;

  fs.writeFileSync(nextConfigPath, openNextConfig);
  console.log('Created optimized next.config.mjs for open-next build');

  // Run open-next build
  console.log('Running open-next build...');
  execSync('npx open-next@2.2.3 build', { stdio: 'inherit' });
  console.log('open-next build completed successfully!');

} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Restore the original files
  console.log('Restoring original next.config.mjs');
  if (originalConfig) {
    fs.writeFileSync(nextConfigPath, originalConfig);
  } else if (fs.existsSync(`${nextConfigPath}.bak`)) {
    fs.copyFileSync(`${nextConfigPath}.bak`, nextConfigPath);
  }
  
  if (fs.existsSync(`${nextConfigPath}.bak`)) {
    fs.unlinkSync(`${nextConfigPath}.bak`);
  }

  // Restore the files patched by fix-nextjs15.js
  execSync('node fix-nextjs15.js restore', { stdio: 'inherit' });
  console.log('All files restored to original state');
} 