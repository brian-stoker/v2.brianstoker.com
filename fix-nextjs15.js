#!/usr/bin/env node

/**
 * Next.js 15 Compatibility Patches
 * This script temporarily patches problematic files to allow Next.js 15 
 * to build successfully with SST and open-next.
 */

const fs = require('fs');
const path = require('path');

// Backup directory
const backupDir = './.nextjs15-fixes-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Backup and patch functions
function backupAndPatch(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File ${filePath} does not exist, skipping`);
    return false;
  }

  // Create backup
  const backupPath = path.join(backupDir, path.basename(filePath) + '.bak');
  fs.copyFileSync(filePath, backupPath);
  console.log(`Backed up ${filePath} to ${backupPath}`);

  // Apply patches
  let content = fs.readFileSync(filePath, 'utf8');
  patches.forEach(({ find, replace }) => {
    if (find instanceof RegExp) {
      content = content.replace(find, replace);
    } else {
      content = content.replace(new RegExp(find, 'g'), replace);
    }
  });
  fs.writeFileSync(filePath, content);
  console.log(`Patched ${filePath}`);
  return true;
}

function restoreFromBackup(filePath) {
  const backupPath = path.join(backupDir, path.basename(filePath) + '.bak');
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath);
    console.log(`Restored ${filePath} from backup`);
    return true;
  }
  return false;
}

// Files to patch
const filesToPatch = [
  {
    path: './pages/_app.js',
    patches: [
      {
        find: /MyApp\.getInitialProps\s*=\s*async[\s\S]*?};/m,
        replace: '// getInitialProps removed for Next.js 15 compatibility'
      }
    ]
  },
  {
    path: './src/modules/components/ThemeContext.js',
    patches: [
      {
        find: /const DispatchContext = React\.createContext\(\(\) => {[\s\S]*?}\);/m,
        replace: 'const DispatchContext = React.createContext(null);'
      }
    ]
  },
  {
    path: './src/modules/utils/codeStylingSolution.js',
    patches: [
      {
        find: 'setCodeStyling: () => {},',
        replace: 'setCodeStyling: null,'
      }
    ]
  },
  {
    path: './src/modules/utils/codeVariant.js',
    patches: [
      {
        find: 'setCodeVariant: () => {},',
        replace: 'setCodeVariant: null,'
      }
    ]
  },
  {
    path: './src/modules/components/AdManager.js',
    patches: [
      {
        find: 'export const AdContext = React.createContext();',
        replace: 'export const AdContext = React.createContext(null);'
      }
    ]
  },
  {
    path: './next.config.mjs',
    patches: [
      {
        // Add open-next specific config
        find: /const config = {/,
        replace: `const config = {
  // For open-next compatibility
  output: 'standalone',
  experimental: {
    // Strip unserializable data to avoid DataCloneError
    serverDataFormat: 'simple',
    ...config?.experimental || {}, // Preserve existing experimental options
  },`
      }
    ]
  }
];

// Main operation
const command = process.argv[2];

if (command === 'apply') {
  console.log('Applying Next.js 15 compatibility patches...');
  filesToPatch.forEach(file => {
    backupAndPatch(file.path, file.patches);
  });
  console.log('All patches applied successfully. You can now build with Next.js 15');
} else if (command === 'restore') {
  console.log('Restoring original files from backups...');
  filesToPatch.forEach(file => {
    restoreFromBackup(file.path);
  });
  console.log('All files restored to original state');
} else {
  console.log(`
Usage: node fix-nextjs15.js [command]
  
Commands:
  apply    - Apply all patches to make Next.js 15 compatible
  restore  - Restore original files from backups
  
Example: 
  node fix-nextjs15.js apply
  `);
} 