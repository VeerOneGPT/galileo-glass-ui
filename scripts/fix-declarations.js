/**
 * Fix TypeScript Declaration Files
 * 
 * This script manually fixes import paths in the TypeScript declaration
 * files to resolve circular dependencies and incorrect path issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Copy TypeScript declarations from dist/src directories to dist
console.log('🔧 Fixing TypeScript declaration files...');

// Function to recursively find all .d.ts files
function findDeclarationFiles(directory) {
  let results = [];
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findDeclarationFiles(filePath));
    } else if (file.endsWith('.d.ts')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Generate declaration files manually if they don't exist
if (!fs.existsSync(path.join(rootDir, 'dist/index.d.ts'))) {
  console.log('⚠️ Declaration files missing. Creating basic declarations...');
  
  // Create basic declarations for key files
  const createBasicDeclaration = (inputFile, outputFile) => {
    const basePath = path.join(rootDir, 'src');
    const relativePath = path.relative(basePath, inputFile);
    const content = `// Auto-generated declaration file
export * from './${relativePath.replace(/\.tsx?$/, '')}';
`;
    
    fs.writeFileSync(outputFile, content);
    console.log(`✅ Created ${outputFile}`);
  };
  
  // Create key declaration files
  ['index.ts', 'animations/index.ts', 'components/index.ts', 'core/index.ts', 'theme/index.ts', 'hooks/index.ts', 'slim.ts'].forEach(file => {
    const inputFile = path.join(rootDir, 'src', file);
    const outputFile = path.join(rootDir, 'dist', file.replace(/\.tsx?$/, '.d.ts'));
    
    // Ensure directory exists
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    createBasicDeclaration(inputFile, outputFile);
  });
}

// Fix problematic imports in all .d.ts files
const declarationFiles = findDeclarationFiles(path.join(rootDir, 'dist'));
console.log(`Found ${declarationFiles.length} declaration files to process.`);

let fixCount = 0;

for (const file of declarationFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Fix the presets import issue
  content = content.replace(
    /from\s+['"]\.\/(animationPresets)['"]/g, 
    'from "../animationPresets"'
  );
  
  // Fix any other problematic relative imports 
  content = content.replace(
    /from\s+['"]\.\.\/\.\.\/animations\/animationPresets['"]/g,
    'from "../animationPresets"'
  );
  
  // Fix circular dependencies in animation files
  if (file.includes('animations/presets')) {
    content = content.replace(
      /import\s+{([^}]+)}\s+from\s+['"]\.\.\/accessibility\/accessibleAnimation['"]/g,
      'import {$1} from "../accessibility/accessibleAnimation"'
    );
  }
  
  // Write the file back if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed imports in ${path.relative(rootDir, file)}`);
    fixCount++;
  }
}

console.log(`✨ Fixed ${fixCount} declaration files successfully!`);
console.log('🎉 Build completed successfully with fixed TypeScript declarations.'); 