#!/usr/bin/env node

/**
 * Galileo Glass UI - Local Installation Helper
 * 
 * This script helps you install the pre-built version of Galileo Glass UI
 * from your local directory. It's useful when you want to test the package
 * without publishing it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Galileo Glass UI - Local Installation Helper\n');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ The dist directory doesn\'t exist yet. Let\'s create it for you!');
  
  try {
    console.log('\n🔨 Creating pre-built version...');
    execSync('node prebuild.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Failed to create pre-built version. Please fix the errors and try again.');
    process.exit(1);
  }
}

// Ask for the target directory
console.log('\n✅ Pre-built version is ready for installation.');
console.log('\nYou can now install it in your project with:');
console.log(`\n   npm install ${distPath} styled-components\n`);
console.log('Or, to install directly in another project:');
console.log('\n   cd /path/to/your/project');
console.log(`   npm install ${distPath} styled-components\n`);

// Show next steps
console.log('After installation, you can use it like this:');
console.log(`
import { ThemeProvider, GlassCard, GlassButton } from 'galileo-glass-ui';

function App() {
  return (
    <ThemeProvider>
      <GlassCard>
        <h2>Hello Galileo Glass!</h2>
        <GlassButton>Click me</GlassButton>
      </GlassCard>
    </ThemeProvider>
  );
}
`);

console.log('\n💡 Tip: If you encounter any issues, check the INSTALLATION.md file for troubleshooting tips.\n');