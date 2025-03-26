#!/usr/bin/env node

/**
 * Fix React Hooks Dependencies Script
 * 
 * This script fixes known React Hook dependency issues in the codebase
 * by adding missing dependencies to dependency arrays.
 * 
 * Usage:
 *   node scripts/fix-hooks.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Only print what would be fixed without making changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DRY_RUN = process.argv.includes('--dry-run');

// List of known hook dependency issues to fix
const HOOK_FIXES = [
  {
    file: 'src/components/Charts/GlassChart.tsx',
    // This will look for renderChart dependency array and add any missing dependencies
    hooks: [
      {
        name: 'renderChart',
        pattern: /const renderChart = useCallback\(\(\) => \{[\s\S]+?\}, \[(.*?)\]\);/,
        dependencies: ['currentType', 'data', 'glass', 'chartProps', 'useSimplified', 'adaptToCapabilities', 'onError']
      }
    ]
  },
  {
    file: 'src/components/Charts/AreaChart.tsx',
    hooks: [
      {
        name: 'useMemo for blur',
        pattern: /useMemo\(\(\) => \{[\s\S]+?getBlurValue[\s\S]+?\}, \[(.*?)\]\)/,
        dependencies: ['getBlurValue']
      }
    ]
  },
  {
    file: 'src/hooks/useGlassEffects.ts',
    hooks: [
      {
        name: 'useMemo for effects',
        pattern: /useMemo\(\(\) => \{[\s\S]+?createGlassGlow[\s\S]+?\}, \[(.*?)\]\)/,
        dependencies: ['createGlassGlow', 'createGlassSurface']
      }
    ]
  }
];

// Fix hook dependencies in files
function fixHookDependencies() {
  HOOK_FIXES.forEach(({ file, hooks }) => {
    console.log(`\nProcessing ${file}...`);
    
    try {
      // Read file content
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;
      
      // Process each hook in the file
      hooks.forEach(({ name, pattern, dependencies }) => {
        const match = content.match(pattern);
        
        if (match) {
          const existingDepsStr = match[1];
          const existingDeps = existingDepsStr
            .split(',')
            .map(dep => dep.trim())
            .filter(dep => dep !== '');
          
          // Find missing dependencies
          const missingDeps = dependencies.filter(dep => !existingDeps.includes(dep));
          
          if (missingDeps.length > 0) {
            console.log(`  Found hook: ${name}`);
            console.log(`  Current dependencies: [${existingDeps.join(', ')}]`);
            console.log(`  Missing dependencies: [${missingDeps.join(', ')}]`);
            
            // Create new dependency array
            const newDeps = [...existingDeps, ...missingDeps];
            const newDepsStr = newDeps.join(', ');
            
            // Replace in content
            content = content.replace(pattern, (match) => {
              return match.replace(/\[(.*?)\]/, `[${newDepsStr}]`);
            });
            
            if (DRY_RUN) {
              console.log(`  Would update to: [${newDepsStr}]`);
            } else {
              console.log(`  ✅ Updated to: [${newDepsStr}]`);
            }
          } else {
            console.log(`  ✓ Hook ${name} already has all required dependencies`);
          }
        } else {
          console.log(`  Could not find hook pattern for ${name}`);
        }
      });
      
      // Write changes if needed
      if (content !== originalContent && !DRY_RUN) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`  📝 Saved changes to ${file}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  });
}

// Main execution
console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fixing React Hook dependency issues...`);
fixHookDependencies();
console.log('\nDone fixing hooks!'); 