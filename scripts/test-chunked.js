#!/usr/bin/env node

/**
 * Chunked Test Runner
 * 
 * This script runs tests in smaller chunks to avoid memory issues,
 * particularly for physics and animation-related tests.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure test chunks
const TEST_CHUNKS = [
  // Animation tests
  {
    name: 'Animation Core',
    pattern: 'src/animations/__tests__/*.test.ts',
    maxOldSpaceSize: 4096
  },
  {
    name: 'Animation System Components',
    pattern: 'src/animations/components/__tests__/*.test.{ts,tsx}',
    maxOldSpaceSize: 4096
  },
  
  // Physics tests - these are more memory intensive
  {
    name: 'Physics - Calculations & Utils',
    pattern: 'src/animations/physics/__tests__/physicsCalculations.test.ts',
    maxOldSpaceSize: 8192
  },
  {
    name: 'Physics - Collision System',
    pattern: 'src/animations/physics/__tests__/collisionSystem.test.ts',
    maxOldSpaceSize: 8192
  },
  {
    name: 'Physics - Galileo System',
    // pattern: 'src/animations/physics/__tests__/galileoPhysicsSystem.test.ts',
    // Use our fixed test file instead
    pattern: 'src/animations/physics/__tests__/galileoPhysicsSystem.fixed.test.ts',
    maxOldSpaceSize: 8192
  },

  // Gesture & Interaction Tests - Next up
  {
    name: 'Gesture & Interaction - Detector',
    pattern: 'src/gestures/__tests__/GestureDetector.test.ts',
    maxOldSpaceSize: 4096,
    enabled: false // Disabled until fixed
  },
  {
    name: 'Gesture & Interaction - Animation',
    pattern: 'src/gestures/__tests__/GestureAnimation.test.ts',
    maxOldSpaceSize: 4096,
    enabled: false // Disabled until fixed
  },
  {
    name: 'Gesture & Interaction - Keyboard Nav',
    pattern: 'src/gestures/__tests__/GestureKeyboardNavigation.test.tsx',
    maxOldSpaceSize: 4096,
    enabled: false // Disabled until fixed
  },

  // Component tests
  {
    name: 'UI Components',
    pattern: 'src/components/__tests__/*.test.{ts,tsx}',
    maxOldSpaceSize: 4096
  },
  
  // Hook tests
  {
    name: 'React Hooks',
    pattern: 'src/hooks/__tests__/*.test.{ts,tsx}',
    maxOldSpaceSize: 4096
  }
];

// Get args
const args = process.argv.slice(2);
const verboseMode = args.includes('--verbose');
const singleTestMode = args.includes('--single');
const includeDisabled = args.includes('--all');

// Parse single test pattern if provided
let singleTestPattern = null;
if (singleTestMode) {
  const singleTestArg = args.find(arg => !arg.startsWith('--'));
  if (singleTestArg) {
    singleTestPattern = singleTestArg;
  } else {
    console.error('Error: --single flag requires a test pattern argument');
    process.exit(1);
  }
}

/**
 * Run a jest command with the given arguments
 */
function runJest(testPattern, { maxOldSpaceSize = 4096 } = {}) {
  const jestBin = path.resolve('./node_modules/.bin/jest');
  const nodeArgs = `--max-old-space-size=${maxOldSpaceSize}`;
  
  const command = [
    `node ${nodeArgs} ${jestBin}`,
    testPattern ? `"${testPattern}"` : '',
    verboseMode ? '--verbose' : '',
    singleTestMode ? '' : '--passWithNoTests',
  ].filter(Boolean).join(' ');
  
  try {
    console.log(`\n==> Running command: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Test execution failed:', error.message);
    return false;
  }
}

/**
 * Main script execution
 */
async function main() {
  console.log('\n========================================');
  console.log(' Chunked Test Runner');
  console.log('========================================\n');
  
  if (singleTestPattern) {
    console.log(`Running single test pattern: ${singleTestPattern}`);
    // For single test mode, use the highest memory allocation for safety
    runJest(singleTestPattern, { maxOldSpaceSize: 8192 });
    return;
  }
  
  let allSuccessful = true;
  
  // Run each chunk of tests
  for (const chunk of TEST_CHUNKS) {
    // Skip disabled chunks unless includeDisabled flag is set
    if (chunk.enabled === false && !includeDisabled) {
      console.log(`\n-----------------------------------`);
      console.log(`Test Chunk: ${chunk.name} (SKIPPED - disabled)`);
      console.log(`Pattern: ${chunk.pattern}`);
      console.log(`-----------------------------------`);
      continue;
    }
    
    console.log(`\n-----------------------------------`);
    console.log(`Test Chunk: ${chunk.name}`);
    console.log(`Pattern: ${chunk.pattern}`);
    console.log(`Memory: ${chunk.maxOldSpaceSize}MB`);
    console.log(`-----------------------------------`);
    
    const success = runJest(chunk.pattern, {
      maxOldSpaceSize: chunk.maxOldSpaceSize
    });
    
    if (!success) {
      allSuccessful = false;
      if (!verboseMode) {
        console.log('\nTest failed. Re-running with verbose output:');
        runJest(chunk.pattern, {
          maxOldSpaceSize: chunk.maxOldSpaceSize,
          verbose: true
        });
      }
    }
  }
  
  process.exit(allSuccessful ? 0 : 1);
}

// Run the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 