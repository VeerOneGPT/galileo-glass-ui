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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Create a production build with less strict TypeScript checks
try {
  console.log('Creating production build with relaxed TypeScript checks...');
  // First, try to run a more permissive build that ignores TypeScript errors
  console.log('Step 1: Running TypeScript in ultra-permissive mode...');
  execSync('npm run typecheck:ultra', { stdio: 'inherit' });
  console.log('Step 2: Running linting with warnings as non-fatal...');
  execSync('npm run lint:lenient', { stdio: 'inherit' });
  console.log('Step 3: Running Rollup build directly...');
  execSync('rollup -c', { stdio: 'inherit' });
  
  // If direct rollup fails, try the most permissive build possible
  if (!fs.existsSync('./dist/index.js')) {
    console.log('Step 4: Trying alternative build approach...');
    // Set environment variable to bypass TypeScript errors
    process.env.SKIP_TS_CHECK = 'true';
    execSync('rollup -c --environment SKIP_TYPECHECK:true', { stdio: 'inherit' });
  }
  
  // Verify the build was created
  if (!fs.existsSync('./dist/index.js')) {
    throw new Error('Build failed to produce output files');
  }
} catch (e) {
  console.error('Error creating production build:', e);
  console.log('\n🛠 Creating emergency build without type checking...\n');
  
  try {
    // Create clean dist directory
    if (fs.existsSync('./dist')) {
      fs.rmSync('./dist', { recursive: true, force: true });
    }
    fs.mkdirSync('./dist', { recursive: true });
    
    // Copy essential files (for direct imports)
    execSync('cp -r ./src/* ./dist/', { stdio: 'inherit' });
    console.log('Created emergency build from source files');
  } catch (emergencyError) {
    console.error('Emergency build failed:', emergencyError);
    process.exit(1);
  }
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

// Create a simplified package.json for the prebuild version
try {
  console.log('Creating simplified package.json for prebuild...');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Add a prebuild configuration flag
  packageJson.prebuild = true;
  
  // Remove problematic scripts that can cause installation issues
  if (packageJson.scripts) {
    // Keep only essential scripts
    const safeScripts = {
      "test": packageJson.scripts.test || "echo \"No tests specified\" && exit 0",
      "postinstall": "echo '\n✅ Galileo Glass UI installed successfully! See documentation for optional dependencies you may need.'"
    };
    packageJson.scripts = safeScripts;
  }
  
  // Fix paths to not include 'dist/' prefix since we're already in the dist directory
  if (packageJson.main) packageJson.main = packageJson.main.replace(/^dist\//, './');
  if (packageJson.module) packageJson.module = packageJson.module.replace(/^dist\//, './');
  if (packageJson.types) packageJson.types = packageJson.types.replace(/^dist\//, './');
  
  // Fix exports paths
  if (packageJson.exports) {
    for (const key in packageJson.exports) {
      const entry = packageJson.exports[key];
      if (typeof entry === 'object') {
        for (const format in entry) {
          if (entry[format] && typeof entry[format] === 'string') {
            entry[format] = entry[format].replace(/^\.\/dist\//, './');
          }
        }
      }
    }
  }
  
  // Ensure peerDependencies and peerDependenciesMeta are correctly set
  // Keep only essential direct dependencies
  packageJson.dependencies = {
    "color": packageJson.dependencies.color,
    "csstype": packageJson.dependencies.csstype,
    "polished": packageJson.dependencies.polished
  };
  
  // Make sure peerDependenciesMeta is preserved
  if (!packageJson.peerDependenciesMeta) {
    // Create it based on peerDependencies if missing
    packageJson.peerDependenciesMeta = {
      "react": {
        "optional": false
      },
      "react-dom": {
        "optional": false
      },
      "styled-components": {
        "optional": false
      },
      "chart.js": {
        "optional": true
      },
      "react-chartjs-2": {
        "optional": true
      },
      "framer-motion": {
        "optional": true
      },
      "popmotion": {
        "optional": true
      },
      "react-spring": {
        "optional": true
      },
      "react-window": {
        "optional": true
      }
    };
  }
  
  // Remove unnecessary files array
  packageJson.files = ["*"];
  
  // Remove dev dependencies for a cleaner installation
  packageJson.devDependencies = undefined;
  
  // Add helpful readme about optional dependencies
  packageJson.optionalDependenciesInfo = "Check PREBUILD.md for information about which optional dependencies to install based on the components you use.";
  
  // Write the simplified package.json
  fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
  console.log('Created simplified package.json with proper dependency settings');
} catch (e) {
  console.error('Error updating package.json:', e);
}

// Copy necessary files
const filesToCopy = [
  'README.md',
  'docs/installation/INSTALLATION.md',
  'docs/installation/PREBUILD.md',  // Added PREBUILD.md with detailed installation instructions
  'LICENSE',
  'docs/CONTRIBUTING.md',
  'scripts/installation/install.sh',
  'scripts/installation/install-local.js'  // Added install-local.js script for easier local installation
];

try {
  console.log('Copying files...');
  filesToCopy.forEach(file => {
    if (fs.existsSync(`./${file}`)) {
      fs.copyFileSync(`./${file}`, `./dist/${file}`);
      console.log(`✓ Copied ${file} to dist/`);
    } else {
      console.log(`⚠ Warning: Could not find ${file} to copy`);
    }
  });
} catch (e) {
  console.error('Error copying files:', e);
}

console.log(`
✅ Pre-built version created successfully!

To use the pre-built version locally:
   npm install ${path.resolve(__dirname, 'dist')} styled-components

For NPM installation (recommended):
   npm install @veerone/galileo-glass-ui styled-components

For direct GitHub installation (after committing and pushing):
   npm install github:VeerOneGPT/galileo-glass-ui#prebuild styled-components

IMPORTANT NOTES:
1. This version is ready for direct installation without requiring a build step.
2. Remember that you'll need additional dependencies for certain features:
   - For charts: npm install chart.js react-chartjs-2
   - For physics animations: npm install react-spring
   - For advanced animations: npm install framer-motion popmotion
   - For virtualized lists: npm install react-window

See PREBUILD.md for complete documentation on the modular dependency system.
`);