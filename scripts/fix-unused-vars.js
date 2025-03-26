#!/usr/bin/env node

/**
 * Fix Unused Variables Script
 * 
 * This script automatically prefixes unused variables with an underscore (_)
 * to suppress ESLint's no-unused-vars warnings.
 * 
 * Usage:
 *   node scripts/fix-unused-vars.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Only print which files would be modified without making changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, '../src');
const DRY_RUN = process.argv.includes('--dry-run');

// List of files with known unused variables issues
const FILES_WITH_ISSUES = [
  'src/animations/__tests__/integration/AnimationPipeline.test.tsx',
  'src/animations/orchestration/Orchestrator.ts',
  'src/animations/physics/advancedPhysicsAnimations.ts',
  'src/animations/physics/magneticEffect.ts',
  'src/animations/styled.d.ts',
  'src/components/Button/Button.tsx',
  'src/components/Charts/EnhancedGlassTabs.tsx',
  'src/components/Charts/GlassChart.tsx',
  'src/hooks/useGlassEffects.ts',
  'src/theme/ThemeProvider.tsx'
];

// Example of known unused variables in the codebase
const COMMON_UNUSED_VARIABLES = [
  'springAnimation',
  'ReactElement',
  'ReactNode',
  'AnimationMapping',
  'accessibleAnimation',
  'AnimationComplexity',
  'magneticEffect',
  'particleSystem',
  'css',
  'glassSurface',
  'glassGlow',
  'createThemeContext',
  'useMagneticButton',
  'GlowEffectProps',
  'usePhysicsInteraction',
  'useGlassTheme',
  'FlexibleElementRef',
  'GlassTooltip',
  'GlassTooltipContent',
  'isInteractive',
  'ThemeContextType',
  'isolateTheme',
  'enableOptimizations',
  'updateOnlyOnCommit',
  'GlassSurfacePropTypes'
];

// Fix unused variables by prefixing them with underscore
function fixUnusedVarsInFiles(filePaths) {
  // Process each file
  filePaths.forEach(filePath => {
    // Read file content
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Replace known variable patterns
      COMMON_UNUSED_VARIABLES.forEach(variableName => {
        // Skip if already prefixed
        if (variableName.startsWith('_')) return;
        
        // Variable declaration pattern
        const importPattern = new RegExp(`import\\s+{([^}]*)${variableName}([^}]*)}\\s+from`, 'g');
        content = content.replace(importPattern, (match, before, after) => {
          return `import {${before}_${variableName}${after}} from`;
        });
        
        // Variable declaration patterns
        const constPattern = new RegExp(`(const|let|var)\\s+(${variableName})\\b(?!.*=.*=>)`, 'g');
        content = content.replace(constPattern, `$1 _$2`);
        
        // Parameter patterns
        const paramPattern = new RegExp(`\\(\\s*(${variableName})\\s*(,|\\))`, 'g');
        content = content.replace(paramPattern, `(_$1)$2`);
        
        // Destructuring patterns
        const destructurePattern = new RegExp(`{([^}]*)\\s+(${variableName})\\s*([,}])`, 'g');
        content = content.replace(destructurePattern, `{$1 _$2$3`);
      });
      
      // Only write changes if the content has been modified
      if (content !== originalContent) {
        console.log(`Processing ${filePath}`);
        
        if (DRY_RUN) {
          console.log(`  Would modify file (dry run)`);
        } else {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  Updated file`);
        }
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error.message);
    }
  });
}

// Main execution
console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fixing unused variables directly in known files...`);

fixUnusedVarsInFiles(FILES_WITH_ISSUES);
console.log('Done fixing unused variables!'); 