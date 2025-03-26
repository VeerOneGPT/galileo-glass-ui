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

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const DRY_RUN = process.argv.includes('--dry-run');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Get list of ESLint warnings for unused variables
function getUnusedVarsWarnings() {
  try {
    const output = execSync(
      'npx eslint --ext .ts,.tsx,.js,.jsx src/ --format json',
      { encoding: 'utf8' }
    );
    
    const results = JSON.parse(output);
    const unusedVarsWarnings = [];

    results.forEach(result => {
      const filePath = result.filePath;
      
      result.messages
        .filter(msg => 
          msg.ruleId === '@typescript-eslint/no-unused-vars' || 
          msg.ruleId === 'no-unused-vars')
        .forEach(warning => {
          unusedVarsWarnings.push({
            filePath,
            line: warning.line,
            column: warning.column,
            variableName: extractVariableName(warning.message)
          });
        });
    });

    return unusedVarsWarnings;
  } catch (error) {
    console.error('Error running ESLint:', error.message);
    return [];
  }
}

// Extract variable name from ESLint warning message
function extractVariableName(message) {
  const match = message.match(/'([^']+)' is defined but never used/);
  return match ? match[1] : null;
}

// Fix unused variables by prefixing them with underscore
function fixUnusedVars(warnings) {
  // Group warnings by file path
  const warningsByFile = {};
  warnings.forEach(warning => {
    if (!warningsByFile[warning.filePath]) {
      warningsByFile[warning.filePath] = [];
    }
    warningsByFile[warning.filePath].push(warning);
  });

  // Process each file
  Object.entries(warningsByFile).forEach(([filePath, fileWarnings]) => {
    // Sort warnings by line and column in descending order to avoid offset issues
    fileWarnings.sort((a, b) => {
      if (a.line === b.line) {
        return b.column - a.column;
      }
      return b.line - a.line;
    });

    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    console.log(`Processing ${filePath} (${fileWarnings.length} warnings)`);
    
    if (DRY_RUN) {
      fileWarnings.forEach(warning => {
        console.log(`  Would fix: ${warning.variableName} -> _${warning.variableName} at line ${warning.line}`);
      });
      return;
    }

    // Apply fixes from bottom to top to avoid offset issues
    fileWarnings.forEach(warning => {
      const { line, variableName } = warning;
      
      if (!variableName) return;
      
      // Skip if already prefixed
      if (variableName.startsWith('_')) return;
      
      const lineContent = lines[line - 1];
      
      // Replace variable declaration patterns
      const patterns = [
        // const variableName
        new RegExp(`(const|let|var)\\s+(${variableName})\\b(?!.*=.*=>)`, 'g'),
        // function params: (variableName) =>
        new RegExp(`\\(\\s*(${variableName})\\s*(,|\\))`, 'g'),
        // destructuring: { variableName }
        new RegExp(`{\\s*(${variableName})\\s*(,|})`, 'g'),
        // function parameters: function name(variableName)
        new RegExp(`function\\s+\\w+\\s*\\(\\s*(${variableName})\\s*(,|\\))`, 'g')
      ];
      
      let modified = false;
      let newLineContent = lineContent;
      
      for (const pattern of patterns) {
        if (pattern.test(lineContent)) {
          if (pattern === patterns[0]) {
            // Variable declaration
            newLineContent = lineContent.replace(pattern, `$1 _$2`);
          } else if (pattern === patterns[1]) {
            // Function parameter
            newLineContent = lineContent.replace(pattern, `(_$1)$2`);
          } else if (pattern === patterns[2]) {
            // Destructuring
            newLineContent = lineContent.replace(pattern, `{ _$1 }$2`);
          } else if (pattern === patterns[3]) {
            // Function parameters
            newLineContent = lineContent.replace(pattern, `function \\w+\\(_$1\\)$2`);
          }
          modified = true;
          break;
        }
      }
      
      if (modified) {
        lines[line - 1] = newLineContent;
        console.log(`  Fixed: ${variableName} -> _${variableName} at line ${line}`);
      } else {
        console.log(`  Skipped: Could not safely fix ${variableName} at line ${line}`);
      }
    });

    // Write updated content
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    }
  });
}

// Main execution
console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fixing unused variables...`);
const warnings = getUnusedVarsWarnings();
console.log(`Found ${warnings.length} unused variable warnings`);

if (warnings.length > 0) {
  fixUnusedVars(warnings);
  console.log('Done fixing unused variables!');
} else {
  console.log('No unused variables to fix.');
} 