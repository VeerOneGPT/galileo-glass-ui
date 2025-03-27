/**
 * Pre-build script for Galileo Glass UI
 * 
 * This script creates a pre-built version of the library that can be used
 * for direct installation without requiring a build step.
 * 
 * Usage:
 * - Run `node prebuild.js` to create a pre-built version
 * - The pre-built version will be in the `dist` directory
 * - Users can install from the specific commit with the pre-built version
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Creating pre-built version of Galileo Glass UI...');

// Ensure the build is clean
try {
  console.log('Cleaning old build files...');
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true, force: true });
  }
} catch (e) {
  console.error('Error cleaning old build files:', e);
}

// Create a production build
try {
  console.log('Creating production build...');
  execSync('npm run build:clean', { stdio: 'inherit' });
} catch (e) {
  console.error('Error creating production build:', e);
  process.exit(1);
}

// Create a marker file to indicate this is a pre-built version
try {
  console.log('Creating marker file...');
  fs.writeFileSync('./dist/PREBUILT', `Galileo Glass UI Pre-built Version
Created: ${new Date().toISOString()}
Do not modify these files directly.
`);
} catch (e) {
  console.error('Error creating marker file:', e);
}

// Update package.json to include skipBuild flag
try {
  console.log('Updating package.json...');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Add a prebuild configuration flag
  packageJson.prebuild = true;
  
  // Write the changes to a temp file
  fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
} catch (e) {
  console.error('Error updating package.json:', e);
}

// Copy necessary files
const filesToCopy = [
  'README.md',
  'INSTALLATION.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'install.sh',
];

try {
  console.log('Copying files...');
  filesToCopy.forEach(file => {
    if (fs.existsSync(`./${file}`)) {
      fs.copyFileSync(`./${file}`, `./dist/${file}`);
    }
  });
} catch (e) {
  console.error('Error copying files:', e);
}

console.log(`
✅ Pre-built version created successfully!

To use the pre-built version:
1. Commit and push your changes
2. Users can install with:
   NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui#prebuild

This version is ready for direct installation without requiring a build step.
`);