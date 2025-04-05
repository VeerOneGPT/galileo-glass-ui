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

  // --- Reverted DEBUG ---
  // console.log('🧪 DEBUG: Isolating build to DTS configs...');
  // const configs = allConfigs.filter(config => 
  //   config.plugins && config.plugins.some(plugin => plugin && plugin.name === 'dts')
  // );
  // console.log(`Found ${configs.length} DTS configurations to process.`);
  // --- END Reverted DEBUG ---
  
  if (!Array.isArray(configs)) {
    configs = [configs];
  }
  
  console.log(`🔍 Found ${configs.length} build configuration(s) to process`);

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const input = Array.isArray(config.input) ? config.input.join(', ') : config.input;
    console.log(`\n📦 Building (${i + 1}/${configs.length}): ${input}`);
    
    try {
      const bundle = await rollup(config);
      
      // Ensure output is an array
      const outputOptionsArray = Array.isArray(config.output) ? config.output : [config.output];
      
      // Generate bundle + sourcemap
      for (const outputOptions of outputOptionsArray) {
        console.log(`  📄 Generating output: ${outputOptions.file} (${outputOptions.format})`);
        await bundle.write(outputOptions);
      }
      
      // Close the bundle to release resources
      await bundle.close();
      console.log(`✅ Successfully built: ${input}`);
    } catch (error) {
      console.error(`❌ Error building config ${i} for ${input}: `);
      console.error(error);
      process.exit(1); // Exit with error on first failure
    }
  }

  console.log('\n✨ Build completed successfully! ✨');
}

build().catch((error) => {
  console.error('Build script failed:', error);
  process.exit(1);
}); 