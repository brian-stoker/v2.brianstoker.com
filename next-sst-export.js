#!/usr/bin/env node

/**
 * Next.js 15 Static Export for SST
 * This script creates a static export and then manually generates
 * the .open-next structure needed by SST
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure directories exist
const openNextDir = './.open-next';
if (!fs.existsSync(openNextDir)) {
  fs.mkdirSync(openNextDir, { recursive: true });
}

// Backup the original next.config.mjs
const nextConfigPath = './next.config.mjs';
let originalConfig = '';

if (fs.existsSync(nextConfigPath)) {
  originalConfig = fs.readFileSync(nextConfigPath, 'utf8');
  fs.copyFileSync(nextConfigPath, `${nextConfigPath}.bak`);
  console.log('Backed up original next.config.mjs');
}

// Apply Next.js 15 compatibility patches
try {
  console.log('Applying Next.js 15 compatibility patches...');
  execSync('node fix-nextjs15.js apply', { stdio: 'inherit' });

  // Create a static export config
  const staticExportConfig = `
/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  distDir: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
};

export default config;
`;

  fs.writeFileSync(nextConfigPath, staticExportConfig);
  console.log('Created static export next.config.mjs');

  // Run Next.js build
  console.log('Running static export build...');
  execSync('next build', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
  console.log('Static export completed!');

  // Create mock .open-next structure for SST
  console.log('Creating .open-next structure for SST...');
  
  // Create output.json
  const openNextOutput = {
    "version": "2.2.3",
    "routes": [],
    "staticRoutes": [
      { "regex": "^/assets/(.*)$", "sourcePath": "/assets/\\1" },
      { "regex": "^/static/(.*)$", "sourcePath": "/static/\\1" },
      { "regex": "^/(.*)\\.(jpg|jpeg|png|webp|avif|gif|ico|svg|webmanifest|json)$", "sourcePath": "/\\1.\\2" },
      { "regex": "^/_next/static/(.*)$", "sourcePath": "/_next/static/\\1" },
      { "regex": "^/(.*)\\.txt$", "sourcePath": "/\\1.txt" },
      { "regex": "^/(.*)\\.js$", "sourcePath": "/\\1.js" },
      { "regex": "^/(.*)\\.css$", "sourcePath": "/\\1.css" },
      { "regex": "^/\\.well-known/(.*)$", "sourcePath": "/.well-known/\\1" },
    ],
    "publicFiles": [],
    "staticGenerationRoutes": [],
    "nextConfigOutput": "export"
  };
  
  fs.writeFileSync(path.join(openNextDir, 'open-next.output.json'), JSON.stringify(openNextOutput, null, 2));
  
  // Create server directory structure
  const serverDir = path.join(openNextDir, 'server');
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  
  // Create static directory for SST
  const staticDir = path.join(openNextDir, 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }
  
  // Copy static export to .open-next/static
  execSync(`cp -R ./export/* ${staticDir}/`, { stdio: 'inherit' });
  
  console.log('Created .open-next structure for SST!');
  console.log('You can now deploy with SST + open-next.');

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