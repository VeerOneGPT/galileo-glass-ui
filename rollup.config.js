import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Shared plugins config for all bundles
// Check if we should skip TypeScript checking 
const skipTypeCheck = process.env.SKIP_TS_CHECK === 'true' || process.argv.includes('--environment') && process.argv.includes('SKIP_TYPECHECK:true');

// TypeScript plugin configuration
const typescriptPlugin = skipTypeCheck 
  ? typescript({ 
      tsconfig: './tsconfig.json',
      declaration: false, // Skip declaration files in emergency mode
      rootDir: './src',
      sourceMap: true,
      noEmitOnError: false, // Continue even with errors
      skipLibCheck: true  // Skip lib checks
    })
  : typescript({ 
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/dts',
      rootDir: './src',
      sourceMap: true
    });

if (skipTypeCheck) {
  console.log('🚨 Building with TypeScript checks disabled'); 
}

// Patch declaration files to fix path issues
const patchDeclarationFiles = {
  name: 'patch-declaration-files',
  writeBundle: async () => {
    // Custom fix for animations/presets
    const presetsIndexDtsPath = path.join(__dirname, 'dist/dts/animations/presets/index.d.ts');
    
    if (fs.existsSync(presetsIndexDtsPath)) {
      console.log('Patching declaration file imports...');
      
      let content = fs.readFileSync(presetsIndexDtsPath, 'utf8');
      
      // Replace problematic import with the correct path
      content = content.replace(
        /import\s+{([^}]+)}\s+from\s+['"]\.\/(animationPresets)['"]/g, 
        'import {$1} from "../animationPresets"'
      );

      // Also handle default imports if present
      content = content.replace(
        /import\s+(\w+)\s+from\s+['"]\.\/(animationPresets)['"]/g, 
        'import $1 from "../animationPresets"'
      );
      
      fs.writeFileSync(presetsIndexDtsPath, content);
      console.log('✅ Fixed imports in presets index declaration file');
    }

    // Also check for the final declaration file that might have the issue
    const finalDtsPath = path.join(__dirname, 'dist/animations.d.ts');
    if (fs.existsSync(finalDtsPath)) {
      let content = fs.readFileSync(finalDtsPath, 'utf8');
      
      // Fix any problematic imports in the final bundled declaration file
      content = content.replace(
        /from\s+['"]\.\/(animationPresets)['"]/g, 
        'from "./animationPresets"'
      );
      
      fs.writeFileSync(finalDtsPath, content);
      console.log('✅ Fixed imports in final animations declaration file');
    }
  }
};

const basePlugins = [
  peerDepsExternal(),
  resolve({ 
    extensions,
    preferBuiltins: false,
    // Improved aliases for resolving galileo-glass-ui imports in examples and internal imports
    alias: {
      'galileo-glass-ui': path.resolve(__dirname, 'src'),
      'galileo-glass-ui/core': path.resolve(__dirname, 'src/core'),
      'galileo-glass-ui/animations': path.resolve(__dirname, 'src/animations'),
      'galileo-glass-ui/theme': path.resolve(__dirname, 'src/theme'),
      'galileo-glass-ui/components': path.resolve(__dirname, 'src/components'),
      'galileo-glass-ui/hooks': path.resolve(__dirname, 'src/hooks'),
      'galileo-glass-ui/slim': path.resolve(__dirname, 'src/slim'),
      'galileo-glass-ui/utils': path.resolve(__dirname, 'src/utils'),
      // Handle internal path issues
      '@styled': path.resolve(__dirname, 'src/animations/styled')
    }
  }),
  commonjs({
    include: /node_modules/,
    requireReturnsDefault: 'auto'
  }),
  typescriptPlugin,
  babel({
    extensions,
    babelHelpers: 'bundled',
    include: ['src/**/*', 'examples/**/*'],
    exclude: 'node_modules/**'
  }),
  terser({
    compress: {
      passes: 2,
      drop_console: true,
      pure_getters: true
    },
    format: {
      comments: false
    }
  }),
  patchDeclarationFiles
];

// Common external packages that shouldn't be bundled
const baseExternal = [
  'react', 
  'react-dom', 
  'styled-components',
  'chart.js',
  'react-chartjs-2',
  '@mui/icons-material',
  '@mui/material',
  'color',
  'csstype',
  'date-fns',
  'framer-motion',
  'polished',
  'popmotion',
  'react-spring',
  'react-window',
  'react-intersection-observer',
  'resize-observer-polyfill',
  'scheduler',
  'use-resize-observer',
  'tiny-invariant',
  'zustand'
];

// Create config for each entry point
const createConfig = (input, output) => ({
  input,
  output: [
    {
      file: output.cjs,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: output.esm,
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: basePlugins,
  external: baseExternal,
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  }
});

// Define all entry points and their outputs
const entryPoints = [
  {
    input: 'src/index.ts',
    output: {
      cjs: 'dist/index.js',
      esm: 'dist/index.esm.js'
    }
  },
  {
    input: 'src/core.ts',
    output: {
      cjs: 'dist/core.js',
      esm: 'dist/core.esm.js'
    }
  },
  {
    input: 'src/mixins.ts',
    output: {
      cjs: 'dist/mixins.js',
      esm: 'dist/mixins.esm.js'
    }
  },
  {
    input: 'src/theme/index.ts',
    output: {
      cjs: 'dist/theme.js',
      esm: 'dist/theme.esm.js'
    }
  },
  {
    input: 'src/animations/index.ts',
    output: {
      cjs: 'dist/animations.js',
      esm: 'dist/animations.esm.js'
    }
  },
  {
    input: 'src/components/index.ts',
    output: {
      cjs: 'dist/components.js',
      esm: 'dist/components.esm.js'
    }
  },
  // Add component category builds for tree-shaking friendly imports
  {
    input: 'src/components/Button/index.ts',
    output: {
      cjs: 'dist/components/Button.js',
      esm: 'dist/components/Button.esm.js'
    }
  },
  {
    input: 'src/components/Card/index.ts',
    output: {
      cjs: 'dist/components/Card.js',
      esm: 'dist/components/Card.esm.js'
    }
  },
  {
    input: 'src/components/Charts/index.ts',
    output: {
      cjs: 'dist/components/Charts.js',
      esm: 'dist/components/Charts.esm.js'
    }
  },
  // New 1.0.3 components
  {
    input: 'src/components/MultiSelect/index.ts',
    output: {
      cjs: 'dist/components/MultiSelect.js',
      esm: 'dist/components/MultiSelect.esm.js'
    }
  },
  {
    input: 'src/components/DateRangePicker/index.ts',
    output: {
      cjs: 'dist/components/DateRangePicker.js',
      esm: 'dist/components/DateRangePicker.esm.js'
    }
  },
  {
    input: 'src/components/Masonry/index.ts',
    output: {
      cjs: 'dist/components/Masonry.js',
      esm: 'dist/components/Masonry.esm.js'
    }
  },
  {
    input: 'src/components/Timeline/index.ts',
    output: {
      cjs: 'dist/components/Timeline.js',
      esm: 'dist/components/Timeline.esm.js'
    }
  },
  {
    input: 'src/hooks/index.ts',
    output: {
      cjs: 'dist/hooks.js',
      esm: 'dist/hooks.esm.js'
    }
  },
  // Slim bundle with only the most commonly used components
  {
    input: 'src/slim.ts',
    output: {
      cjs: 'dist/slim.js',
      esm: 'dist/slim.esm.js'
    }
  },
  // Add examples build
  {
    input: 'examples/index.tsx',
    output: {
      cjs: 'dist/examples.js',
      esm: 'dist/examples.esm.js'
    }
  }
];

// Common DTS plugin config with improved path resolution
const createDtsPlugin = () => dts({
  respectExternal: true, 
  compilerOptions: {
    baseUrl: ".",
    paths: {
      "styled-components": ["node_modules/styled-components"],
      "galileo-glass-ui": ["src"],
      "galileo-glass-ui/*": ["src/*"]
    }
  }
});

// Common external dependencies for .d.ts files
const dtsExternal = [
  /\.css$/,
  'styled-components',
  'react',
  'react-dom',
  './styled',
  '../styled',
  '../../styled',
  'chart.js',
  'react-chartjs-2',
  'date-fns',
  'framer-motion', 
  'popmotion',
  'react-spring',
  'react-window',
  'react-intersection-observer',
  'resize-observer-polyfill',
  'scheduler',
  'use-resize-observer',
  'color',
  'csstype',
  'polished',
  'tiny-invariant',
  'zustand'
];

// Create TypeScript definition configs with improved path handling
const dtsConfigs = [
  {
    input: 'dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/slim.d.ts',
    output: [{ file: 'dist/slim.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/mixins.d.ts',
    output: [{ file: 'dist/mixins.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/animations/index.d.ts',
    output: [{ file: 'dist/animations.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/core/index.d.ts',
    output: [{ file: 'dist/core.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/components/index.d.ts',
    output: [{ file: 'dist/components.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/components/Button/index.d.ts',
    output: [{ file: 'dist/components/Button.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/components/Card/index.d.ts',
    output: [{ file: 'dist/components/Card.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/components/Charts/index.d.ts',
    output: [{ file: 'dist/components/Charts.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  // New 1.0.3 component types
  {
    input: 'dist/dts/components/MultiSelect/index.d.ts',
    output: [{ file: 'dist/components/MultiSelect.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/components/DateRangePicker/index.d.ts',
    output: [{ file: 'dist/components/DateRangePicker.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/components/Masonry/index.d.ts',
    output: [{ file: 'dist/components/Masonry.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/components/Timeline/index.d.ts',
    output: [{ file: 'dist/components/Timeline.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/hooks/index.d.ts',
    output: [{ file: 'dist/hooks.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'dist/dts/theme/index.d.ts',
    output: [{ file: 'dist/theme.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  // Examples types (optional)
  {
    input: 'dist/dts/examples/index.d.ts',
    output: [{ file: 'dist/examples.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  }
];

// Export all configs
export default [
  ...entryPoints.map(entry => createConfig(entry.input, entry.output)),
  ...dtsConfigs
];