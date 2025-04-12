const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Applying fixes for Next.js on AWS Lambda...');

// Fix 1: Ensure caniuse-lite is properly included
console.log('Fixing caniuse-lite...');

// First, ensure the latest version is installed
execSync('pnpm install caniuse-lite@latest --save-exact', { stdio: 'inherit' });

// Find all places where standalone build might exist
const possibleBuildDirs = [
  './.next/standalone',
  './open-next/standalone',
  './dist/apps/web',
  './dist'
];

const caniuseLiteSourceDir = path.resolve('./node_modules/caniuse-lite');

// Function to copy a directory recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Process each possible build directory
let fixesApplied = false;

for (const buildDir of possibleBuildDirs) {
  const targetDir = path.resolve(buildDir, 'node_modules/caniuse-lite');
  
  if (fs.existsSync(path.dirname(targetDir))) {
    console.log(`Copying caniuse-lite to ${targetDir}...`);
    
    // Ensure target directory exists
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Copy the entire directory
    copyRecursiveSync(caniuseLiteSourceDir, targetDir);
    
    console.log(`Successfully copied caniuse-lite to ${targetDir}`);
    fixesApplied = true;
  }
}

// Fix 2: Create a browserslist loader that handles missing files
const createBrowserslistLoader = (buildDir) => {
  if (!fs.existsSync(buildDir)) return false;
  
  const loaderDir = path.join(buildDir, 'browserslist-loader');
  fs.mkdirSync(loaderDir, { recursive: true });
  
  const loaderContent = `
// This is a custom loader to handle browserslist/caniuse-lite issues in AWS Lambda
const path = require('path');
const fs = require('fs');
const originalModule = require.extensions['.js'];

// Keep track of modules we've processed
const processedModules = new Set();

require.extensions['.js'] = function(module, filename) {
  // Check if this is a browserslist or caniuse-lite module
  if (filename.includes('browserslist') || filename.includes('caniuse-lite')) {
    // Only process each module once to avoid infinite recursion
    if (processedModules.has(filename)) {
      return originalModule(module, filename);
    }
    
    processedModules.add(filename);
    
    // Read the file content
    let content = fs.readFileSync(filename, 'utf8');
    
    // Patch any require statements for caniuse-lite
    content = content.replace(
      /require\(['"]caniuse-lite\/([^'"]+)['"]\)/g,
      (match, subpath) => {
        // Check if the required file exists
        const requiredPath = path.resolve(process.cwd(), 'node_modules/caniuse-lite', subpath);
        if (!fs.existsSync(requiredPath)) {
          console.warn(\`Warning: Missing file \${requiredPath}, providing fallback\`);
          
          // For agents.js, provide a minimal fallback
          if (subpath === 'dist/unpacker/agents') {
            return '({ chrome: { A: { D: 0 } }, firefox: { A: { D: 0 } }, safari: { A: { D: 0 } } })';
          }
          
          // For other files, provide an empty object
          return '({})';
        }
        
        return match;
      }
    );
    
    // Override the module's compile method
    module._compile(content, filename);
  } else {
    // Use the original loader for all other files
    originalModule(module, filename);
  }
};

// Preload browserslist to ensure our patched loader is used
try {
  require('browserslist');
  console.log('Browserslist loaded with custom loader');
} catch (error) {
  console.error('Error loading browserslist:', error);
}
`;
  
  // Write the loader file
  const loaderFilePath = path.join(loaderDir, 'index.js');
  fs.writeFileSync(loaderFilePath, loaderContent);
  
  // Create a package.json for the loader
  const packageJson = {
    name: "browserslist-loader",
    version: "1.0.0",
    main: "index.js"
  };
  
  fs.writeFileSync(
    path.join(loaderDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log(`Created browserslist loader in ${loaderDir}`);
  return true;
}

// Fix 3: Update the server entry point to use our loader
const updateServerEntry = (buildDir) => {
  if (!fs.existsSync(buildDir)) return false;
  
  const serverFiles = [
    path.join(buildDir, 'server.js'),
    path.join(buildDir, 'index.js'),
    path.join(buildDir, 'app.js')
  ];
  
  for (const serverFile of serverFiles) {
    if (fs.existsSync(serverFile)) {
      console.log(`Updating server entry point: ${serverFile}`);
      
      let content = fs.readFileSync(serverFile, 'utf8');
      
      // Only add the loader if it's not already there
      if (!content.includes('browserslist-loader')) {
        // Add our loader at the top of the file
        content = `// Load custom browserslist-loader to handle caniuse-lite issues
require('./browserslist-loader');\n\n${content}`;
        
        fs.writeFileSync(serverFile, content);
        console.log(`Updated ${serverFile} to use browserslist-loader`);
        return true;
      } else {
        console.log(`Server file ${serverFile} already includes browserslist-loader`);
        return true;
      }
    }
  }
  
  console.log(`No server entry point found in ${buildDir}`);
  return false;
}

// Apply all fixes to each build directory
for (const buildDir of possibleBuildDirs) {
  const fullBuildDir = path.resolve(buildDir);
  if (fs.existsSync(fullBuildDir)) {
    console.log(`Applying fixes to build directory: ${fullBuildDir}`);
    createBrowserslistLoader(fullBuildDir);
    updateServerEntry(fullBuildDir);
    fixesApplied = true;
  }
}

if (fixesApplied) {
  console.log('All fixes applied successfully!');
} else {
  console.error('No build directories found. Make sure to run this script after building your Next.js application.');
  process.exit(1);
} 