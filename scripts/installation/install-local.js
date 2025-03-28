#!/usr/bin/env node

/**
 * Galileo Glass UI - Local Installation Helper (Minimal Version)
 * 
 * This script creates a minimal distribution with only essential dependencies
 * to ensure the fastest and most reliable installation experience.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Galileo Glass UI - Minimal Installation Helper\n');

// Create dist-min directory if it doesn't exist
const minDistPath = path.join(__dirname, 'dist-min');
if (!fs.existsSync(minDistPath)) {
  console.log('Creating minimal distribution directory...');
  fs.mkdirSync(minDistPath, { recursive: true });
}

// Check if prebuild exists, and if not, create it
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  try {
    console.log('\n🔨 Creating base pre-built version first...');
    execSync('node prebuild.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Failed to create pre-built version. Please fix the errors and try again.');
    process.exit(1);
  }
}

console.log('\n🔧 Creating minimal distribution package...');

// Copy only the essential files from dist to dist-min
try {
  // First copy the index files
  ['index.js', 'index.esm.js', 'index.d.ts'].forEach(file => {
    if (fs.existsSync(path.join(distPath, file))) {
      fs.copyFileSync(path.join(distPath, file), path.join(minDistPath, file));
      console.log(`✓ Copied ${file}`);
    }
  });

  // Copy basic component files
  ['Button.js', 'Button.esm.js', 'Button.d.ts'].forEach(file => {
    const componentDir = path.join(minDistPath, 'components');
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }
    if (fs.existsSync(path.join(distPath, 'components', file))) {
      fs.copyFileSync(
        path.join(distPath, 'components', file), 
        path.join(componentDir, file)
      );
      console.log(`✓ Copied components/${file}`);
    }
  });
  
  // Copy Card component (common dependency)
  ['Card.js', 'Card.esm.js', 'Card.d.ts'].forEach(file => {
    const componentDir = path.join(minDistPath, 'components');
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }
    if (fs.existsSync(path.join(distPath, 'components', file))) {
      fs.copyFileSync(
        path.join(distPath, 'components', file), 
        path.join(componentDir, file)
      );
      console.log(`✓ Copied components/${file}`);
    }
  });

  // Copy documentation
  ['README.md', 'INSTALLATION.md', 'PREBUILD.md', 'LICENSE'].forEach(file => {
    if (fs.existsSync(path.join(distPath, file))) {
      fs.copyFileSync(path.join(distPath, file), path.join(minDistPath, file));
      console.log(`✓ Copied ${file}`);
    }
  });

  // Create a minimalist package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(distPath, 'package.json'), 'utf8'));
  
  // Create a ultra-minimalist version
  const minimalPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: "Minimal distribution of the Galileo Glass UI components",
    type: "module",
    main: "./index.js",
    module: "./index.esm.js",
    types: "./index.d.ts",
    files: ["*"],
    exports: {
      ".": {
        "import": "./index.esm.js",
        "require": "./index.js",
        "types": "./index.d.ts"
      },
      "./components/Button": {
        "import": "./components/Button.esm.js",
        "require": "./components/Button.js"
      },
      "./components/Card": {
        "import": "./components/Card.esm.js",
        "require": "./components/Card.js"
      }
    },
    scripts: {
      "postinstall": "echo '\n✅ Minimal Galileo Glass UI installed successfully!'"
    },
    keywords: packageJson.keywords,
    author: packageJson.author,
    license: packageJson.license,
    peerDependencies: {
      "react": "^17.0.0 || ^18.0.0",
      "react-dom": "^17.0.0 || ^18.0.0",
      "styled-components": "^5.3.3 || ^6.0.0"
    },
    dependencies: {
      "color": packageJson.dependencies.color,
      "polished": packageJson.dependencies.polished
    },
    minimalDistribution: true
  };
  
  fs.writeFileSync(
    path.join(minDistPath, 'package.json'), 
    JSON.stringify(minimalPackageJson, null, 2)
  );
  console.log('✓ Created minimal package.json');

  // Create marker file
  fs.writeFileSync(path.join(minDistPath, 'MINIMAL'), `Galileo Glass UI Minimal Distribution
Created: ${new Date().toISOString()}
This is a minimal distribution with only core dependencies.
`);
  console.log('✓ Created MINIMAL marker file');

} catch (error) {
  console.error('Error creating minimal distribution:', error);
  process.exit(1);
}

// Show next steps
console.log(`
✅ Minimal distribution created successfully!

You can install the minimal version using:

   npm install @veerone/galileo-glass-ui styled-components

Or install directly from the local directory:

   npm install ${path.resolve(minDistPath)} styled-components

This minimal version contains only the essential files and dependencies
to ensure the fastest possible installation. Perfect for testing and
quick prototyping.

For production usage, you should install the full version when you need
additional components.
`);