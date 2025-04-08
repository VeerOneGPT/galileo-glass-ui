import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
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

// TypeScript plugin configuration using rollup-plugin-typescript2
const tsconfigDefaults = { compilerOptions: { declaration: true } };
const tsconfigOverride = { compilerOptions: { declaration: false } }; // Don't emit declarations for non-entry files if needed, adjust as necessary

const typescriptPlugin = typescript({
  typescript: require('typescript'), // Ensure it uses the installed TypeScript version
  tsconfig: './tsconfig.json',
  // Use default tsconfig settings, including declaration: true
  // rollup-plugin-typescript2 handles declaration file merging better
  clean: true, // Clean the cache before building
  check: false, // Keep check: false as build works with it
});

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
    include: ['src/**/*'],
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
];

// Common external packages that shouldn't be bundled
const baseExternal = [
  'react', 
  'react-dom', 
  'styled-components',
  'chart.js',
  'react-chartjs-2',
  '@mui/icons-material',
  'color',
  'csstype',
  'date-fns',
  'polished',
  'popmotion',
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
  {
    input: 'src/animations/physics/index.ts',
    output: {
      cjs: 'dist/animations/physics/index.js',
      esm: 'dist/animations/physics/index.esm.js'
    }
  },
  // FIX: Add explicit entry points for problematic hooks in nested directories
  {
    input: 'src/components/DataChart/hooks/useChartPhysicsInteraction.ts',
    output: {
      cjs: 'dist/components/DataChart/hooks/useChartPhysicsInteraction.js',
      esm: 'dist/components/DataChart/hooks/useChartPhysicsInteraction.esm.js'
    }
  },
  {
    input: 'src/animations/physics/useMagneticElement.ts',
    output: {
      cjs: 'dist/animations/physics/useMagneticElement.js',
      esm: 'dist/animations/physics/useMagneticElement.esm.js'
    }
  },
  {
    input: 'src/animations/orchestration/useAnimationSequence.ts',
    output: {
      cjs: 'dist/animations/orchestration/useAnimationSequence.js',
      esm: 'dist/animations/orchestration/useAnimationSequence.esm.js'
    }
  }
];

// Adjust final export: rollup-plugin-typescript2 typically doesn't require a separate dts bundling step
const mainConfigs = entryPoints.map(entry => createConfig(entry.input, entry.output));

// ADDED BACK: Common DTS plugin config
const createDtsPlugin = () => dts({
  respectExternal: true
});

// ADDED BACK: Common external dependencies for .d.ts files
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
  'popmotion',
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

// ADDED BACK: Create TypeScript definition configs
const dtsConfigs = [
  {
    input: 'src/index.ts', // Pointing to SRC
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()], // Use dts plugin
    external: dtsExternal
  },
  {
    input: 'src/slim.ts', // Pointing to SRC
    output: [{ file: 'dist/slim.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  // Physics engine types
  {
    input: 'src/animations/physics/index.ts', // Pointing to SRC
    output: [{ file: 'dist/animations/physics/index.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/mixins.ts', // Pointing to SRC
    output: [{ file: 'dist/mixins.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/animations/index.ts', // Pointing to SRC
    output: [{ file: 'dist/animations.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/core.ts', // Pointing to SRC
    output: [{ file: 'dist/core.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/components/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/components/Button/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components/Button.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/components/Card/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components/Card.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/components/Charts/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components/Charts.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  // New 1.0.3 component types
  {
    input: 'src/components/MultiSelect/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components/MultiSelect.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/components/DateRangePicker/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components/DateRangePicker.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/components/Masonry/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components/Masonry.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/components/Timeline/index.ts', // Pointing to SRC
    output: [{ file: 'dist/components/Timeline.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/hooks/index.ts', // Pointing to SRC
    output: [{ file: 'dist/hooks/index.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/theme/index.ts', // Pointing to SRC
    output: [{ file: 'dist/theme.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  // FIX: Add type definitions for problematic hooks in nested directories
  {
    input: 'src/components/DataChart/hooks/useChartPhysicsInteraction.ts',
    output: [{ file: 'dist/components/DataChart/hooks/useChartPhysicsInteraction.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/animations/physics/useMagneticElement.ts',
    output: [{ file: 'dist/animations/physics/useMagneticElement.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  },
  {
    input: 'src/animations/orchestration/useAnimationSequence.ts',
    output: [{ file: 'dist/animations/orchestration/useAnimationSequence.d.ts', format: 'es' }],
    plugins: [createDtsPlugin()],
    external: dtsExternal
  }
];

// Final export combining JS and DTS configs
const configs = [
  ...mainConfigs,
  ...dtsConfigs // ADDED BACK
];

// Export as named exports for Rollup v2/v3 ESM compatibility
export { configs as default };