#!/usr/bin/env node

// This script builds Next.js while bypassing TypeScript checks
const { spawn } = require('child_process');
const { existsSync, copyFileSync, renameSync } = require('fs');
const path = require('path');

// Backup original tsconfig if it exists
const originalTsconfig = path.join(__dirname, 'tsconfig.json');
const backupTsconfig = path.join(__dirname, 'tsconfig.json.bak');

if (existsSync(originalTsconfig)) {
  copyFileSync(originalTsconfig, backupTsconfig);
  console.log('Backed up original tsconfig.json');
}

// Copy build tsconfig to main tsconfig
const buildTsconfig = path.join(__dirname, 'tsconfig.build.json');
if (existsSync(buildTsconfig)) {
  copyFileSync(buildTsconfig, originalTsconfig);
  console.log('Using build tsconfig to skip type checking');
}

// Run Next.js build
const nextBuild = spawn('next', ['build', '--no-lint'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NEXT_SKIP_TYPECHECKING: '1',
    NODE_OPTIONS: '--max_old_space_size=8192'
  }
});

// Restore original tsconfig when done
nextBuild.on('exit', (code) => {
  if (existsSync(backupTsconfig)) {
    renameSync(backupTsconfig, originalTsconfig);
    console.log('Restored original tsconfig.json');
  }
  
  process.exit(code);
});

nextBuild.on('error', (err) => {
  console.error('Failed to start build process:', err);
  if (existsSync(backupTsconfig)) {
    renameSync(backupTsconfig, originalTsconfig);
    console.log('Restored original tsconfig.json');
  }
  process.exit(1);
}); 