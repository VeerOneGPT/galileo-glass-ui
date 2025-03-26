#!/usr/bin/env node

/**
 * Fix React Hooks Dependencies Script
 * 
 * This script scans for and suggests fixes for React Hook dependency issues
 * by identifying common patterns of missing dependencies in useEffect/useCallback hooks.
 * 
 * Usage:
 *   node scripts/fix-hooks.js [--fix]
 * 
 * Options:
 *   --fix    Attempt to automatically fix some common issues (experimental)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const AUTO_FIX = process.argv.includes('--fix');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Get list of ESLint rules violations for hooks
function getHookDependencyWarnings() {
  try {
    const output = execSync(
      'npx eslint --ext .ts,.tsx,.js,.jsx src/ --format json',
      { encoding: 'utf8' }
    );
    
    const results = JSON.parse(output);
    const hookWarnings = [];

    results.forEach(result => {
      const filePath = result.filePath;
      
      result.messages
        .filter(msg => 
          msg.ruleId === 'react-hooks/exhaustive-deps')
        .forEach(warning => {
          hookWarnings.push({
            filePath,
            line: warning.line,
            column: warning.column,
            message: warning.message,
            suggestedDeps: extractSuggestedDeps(warning.message)
          });
        });
    });

    return hookWarnings;
  } catch (error) {
    console.error('Error running ESLint:', error.message);
    return [];
  }
}

// Extract suggested dependencies from ESLint warning message
function extractSuggestedDeps(message) {
  const missingDeps = [];
  
  // Pattern for useEffect message: Either 'X', 'Y' or 'Z' 
  const effectMatch = message.match(/Either include (?:it|them) or remove the dependency array.(.+)/);
  
  if (effectMatch) {
    const depStr = effectMatch[1];
    depStr.split(',').forEach(part => {
      const trimmed = part.trim();
      const match = trimmed.match(/'([^']+)'/);
      if (match) {
        missingDeps.push(match[1]);
      }
    });
  }
  
  // Pattern for useCallback/useMemo message: The 'X' function makes the dependencies change on every render.
  const callbackMatch = message.match(/The '([^']+)' function/);
  if (callbackMatch) {
    missingDeps.push(callbackMatch[1]);
  }
  
  return missingDeps;
}

// Find hooks usage and their dependency arrays in files
function findHooksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const hooks = [];
  
  // Look for hooks patterns like useEffect(() => {}, []) or useCallback(() => {}, [])
  const hookNameRegex = /(useEffect|useCallback|useMemo)\(\s*(?:\([^)]*\)|[^,]*)\s*=>\s*\{/g;
  const dependencyArrayRegex = /\},\s*\[(.*?)\]\s*\)/g;
  
  let match;
  
  // Find potential hook locations
  let lineIndex = 0;
  for (const line of lines) {
    if (line.includes('useEffect') || line.includes('useCallback') || line.includes('useMemo')) {
      // Found a potential hook, need to analyze it and its dependency array
      let hookStart = lineIndex;
      let hookEnd = lineIndex;
      let inHook = true;
      let bracketCount = 0;
      let hookType = '';
      
      // Determine hook type
      if (line.includes('useEffect')) hookType = 'useEffect';
      else if (line.includes('useCallback')) hookType = 'useCallback';
      else if (line.includes('useMemo')) hookType = 'useMemo';
      
      // Find the end of this hook (which may span multiple lines)
      for (let i = lineIndex; i < lines.length && inHook; i++) {
        const currentLine = lines[i];
        
        // Count brackets to track nesting
        for (const char of currentLine) {
          if (char === '{') bracketCount++;
          if (char === '}') {
            bracketCount--;
            if (bracketCount <= 0 && currentLine.includes('])')) {
              hookEnd = i;
              inHook = false;
              break;
            }
          }
        }
      }
      
      // Extract the full hook including dependency array
      const hookLines = lines.slice(hookStart, hookEnd + 1).join('\n');
      
      // Extract the dependency array from the hook
      const depArrayMatch = hookLines.match(/\[\s*(.*?)\s*\]\s*\)/);
      let dependencies = [];
      
      if (depArrayMatch) {
        dependencies = depArrayMatch[1]
          .split(',')
          .map(dep => dep.trim())
          .filter(dep => dep !== '');
      }
      
      hooks.push({
        type: hookType,
        startLine: hookStart + 1, // 1-indexed for reporting
        endLine: hookEnd + 1,
        dependencies,
        code: hookLines
      });
    }
    
    lineIndex++;
  }
  
  return hooks;
}

// Analyze and potentially fix hook dependencies
function analyzeAndFixHooks(warnings) {
  // Group warnings by file
  const warningsByFile = {};
  warnings.forEach(warning => {
    if (!warningsByFile[warning.filePath]) {
      warningsByFile[warning.filePath] = [];
    }
    warningsByFile[warning.filePath].push(warning);
  });
  
  // Process each file
  Object.entries(warningsByFile).forEach(([filePath, fileWarnings]) => {
    console.log(`\nAnalyzing ${filePath} (${fileWarnings.length} warnings)`);
    
    // Find all hooks in the file
    const hooksInFile = findHooksInFile(filePath);
    
    // Match warnings to hooks
    fileWarnings.forEach(warning => {
      const { line, suggestedDeps } = warning;
      
      // Find the hook for this warning
      const matchingHook = hooksInFile.find(hook => 
        line >= hook.startLine && line <= hook.endLine
      );
      
      if (matchingHook) {
        console.log(`\n  ${matchingHook.type} at lines ${matchingHook.startLine}-${matchingHook.endLine}`);
        console.log(`  Current dependencies: [${matchingHook.dependencies.join(', ')}]`);
        console.log(`  Missing dependencies: [${suggestedDeps.join(', ')}]`);
        
        if (AUTO_FIX) {
          const fixResult = attemptToFixHook(filePath, matchingHook, suggestedDeps);
          if (fixResult) {
            console.log(`  ✅ Applied fix: ${fixResult}`);
          } else {
            console.log(`  ❌ Could not auto-fix this hook`);
          }
        } else {
          console.log(`  Suggestion: Add ${suggestedDeps.join(', ')} to the dependency array`);
        }
      } else {
        console.log(`  Could not locate hook for warning at line ${line}`);
      }
    });
  });
}

// Try to fix hook dependencies
function attemptToFixHook(filePath, hook, suggestedDeps) {
  if (!AUTO_FIX) return null;
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find dependency array in the hook
  const depArrayRegex = /\[\s*(.*?)\s*\]\s*\)/g;
  
  // Extract the hook code
  const hookCode = lines.slice(hook.startLine - 1, hook.endLine).join('\n');
  
  // Find the dependency array
  const depArrayMatch = hookCode.match(depArrayRegex);
  
  if (depArrayMatch) {
    // Extract existing dependencies
    const existingDepsMatch = depArrayMatch[0].match(/\[\s*(.*?)\s*\]/);
    let existingDeps = [];
    
    if (existingDepsMatch && existingDepsMatch[1]) {
      existingDeps = existingDepsMatch[1]
        .split(',')
        .map(dep => dep.trim())
        .filter(dep => dep !== '');
    }
    
    // Add the missing dependencies
    const newDeps = [...new Set([...existingDeps, ...suggestedDeps])];
    
    // Create the new dependency array string
    const newDepArrayStr = `[${newDeps.join(', ')}])`;
    
    // Replace the dependency array in the file
    const updatedContent = content.replace(depArrayMatch[0], newDepArrayStr);
    
    // Write back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    return `Updated dependencies to [${newDeps.join(', ')}]`;
  }
  
  return null;
}

// Main execution
console.log(`${AUTO_FIX ? '[AUTO-FIX MODE] ' : ''}Scanning for React Hook dependency issues...`);
const warnings = getHookDependencyWarnings();
console.log(`Found ${warnings.length} Hook dependency warnings`);

if (warnings.length > 0) {
  analyzeAndFixHooks(warnings);
  console.log('\nDone analyzing hooks!');
  
  if (!AUTO_FIX) {
    console.log('\nTo attempt auto-fixing, run: node scripts/fix-hooks.js --fix');
  }
} else {
  console.log('No Hook dependency issues to fix.');
} 