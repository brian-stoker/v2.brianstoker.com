#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Next.js app with static export...');

// Ensure the export directory exists
if (!fs.existsSync('./export')) {
  fs.mkdirSync('./export', { recursive: true });
}

// Create a simple next.config.js for export
const nextConfigContent = `
/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  distDir: 'export',
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
fs.writeFileSync('./next.config.export.mjs', nextConfigContent);

try {
  // Temporarily rename original next.config.mjs to use our custom config
  if (fs.existsSync('./next.config.mjs')) {
    fs.renameSync('./next.config.mjs', './next.config.mjs.bak');
    fs.renameSync('./next.config.export.mjs', './next.config.mjs');
  }

  // Run the build command with static export
  console.log('Running static export build...');
  const result = spawnSync(
    'npx', 
    [
      'next', 
      'build',
      '--no-lint'
    ],
    { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_SKIP_TYPECHECKING: '1',
        NODE_OPTIONS: '--max_old_space_size=8192',
      }
    }
  );

  if (result.status !== 0) {
    console.error('Build failed with status:', result.status);
    process.exit(1);
  }

  console.log('Build completed successfully with static export!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Restore original files
  console.log('Restoring original files...');
  
  // Restore config
  if (fs.existsSync('./next.config.mjs.bak')) {
    fs.renameSync('./next.config.mjs.bak', './next.config.mjs');
  }
  if (fs.existsSync('./next.config.export.mjs')) {
    fs.unlinkSync('./next.config.export.mjs');
  }
} 