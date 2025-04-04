#!/usr/bin/env node

/**
 * Rollup Configuration Processor
 * 
 * This script ensures all configurations in rollup.config.js are processed
 * properly, addressing the issue where Rollup CLI sometimes only processes
 * the first configuration in an array.
 */

import { rollup } from 'rollup';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function build() {
  console.log('🚀 Starting Galileo Glass UI build...');
  console.log('📂 Loading rollup configuration...');
  
  // Dynamically import the rollup config
  const configModule = await import('../../rollup.config.js');
  
  // Get the configs from the default export
  let configs = configModule.default;
  
  // Ensure configs is an array
  if (!Array.isArray(configs)) {
    console.warn('Warning: Configuration is not an array, converting to array.');
    configs = [configs];
  }
  
  console.log(`🔍 Found ${configs.length} build configurations`);
  
  // Process each config separately
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    try {
      // Skip null or invalid configs
      if (!config || !config.input) {
        console.warn(`Skipping invalid config at index ${i}:`, config);
        continue;
      }
      
      const inputFile = path.relative(rootDir, 
        typeof config.input === 'string' ? config.input : 
        Array.isArray(config.input) ? config.input[0] : 'unknown');
      
      console.log(`📦 Building (${i + 1}/${configs.length}): ${inputFile}`);
      
      // Create bundle
      const bundle = await rollup(config);
      
      // Ensure output is an array
      const outputs = Array.isArray(config.output) ? config.output : [config.output];
      
      // Write all outputs
      for (const output of outputs) {
        if (!output || !output.file) {
          console.warn(`Skipping invalid output configuration:`, output);
          continue;
        }
        
        const outputFile = path.relative(rootDir, output.file);
        console.log(`📝 Writing ${output.format} to ${outputFile}`);
        
        // Ensure directory exists
        const outputDir = path.dirname(output.file);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        await bundle.write(output);
      }
      
      // Clean up
      await bundle.close();
      console.log(`✅ Completed building ${inputFile}`);
    } catch (error) {
      console.error(`❌ Error building config ${i}:`, error);
      process.exit(1);
    }
  }
  
  console.log('🎉 Galileo Glass UI build completed successfully!');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
}); 