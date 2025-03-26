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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Shared plugins config for all bundles
const basePlugins = [
  peerDepsExternal(),
  resolve({ 
    extensions,
    // Add aliases for resolving galileo-glass-ui imports in examples
    alias: {
      'galileo-glass-ui': path.resolve(__dirname, 'src'),
      'galileo-glass-ui/core': path.resolve(__dirname, 'src/core'),
      'galileo-glass-ui/animations': path.resolve(__dirname, 'src/animations'),
      'galileo-glass-ui/theme': path.resolve(__dirname, 'src/theme'),
      'galileo-glass-ui/components': path.resolve(__dirname, 'src/components'),
      'galileo-glass-ui/hooks': path.resolve(__dirname, 'src/hooks')
    }
  }),
  commonjs(),
  typescript({ tsconfig: './tsconfig.json' }),
  babel({
    extensions,
    babelHelpers: 'bundled',
    include: ['src/**/*', 'examples/**/*'],
    exclude: 'node_modules/**'
  }),
  terser()
];

// Common external packages that shouldn't be bundled
const baseExternal = [
  'react', 
  'react-dom', 
  'styled-components',
  'chart.js',
  'react-chartjs-2',
  '@mui/icons-material',
  '@mui/material'
];

// Create config for each entry point
const createConfig = (input, output) => ({
  input,
  output: [
    {
      file: output.cjs,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: output.esm,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: basePlugins,
  external: baseExternal
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
    input: 'src/core/index.ts',
    output: {
      cjs: 'dist/core.js',
      esm: 'dist/core.esm.js'
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
  {
    input: 'src/hooks/index.ts',
    output: {
      cjs: 'dist/hooks.js',
      esm: 'dist/hooks.esm.js'
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

// Create TypeScript definition configs
const dtsConfigs = [
  {
    input: 'dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/dts/animations/index.d.ts',
    output: [{ file: 'dist/animations.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/dts/core/index.d.ts',
    output: [{ file: 'dist/core.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/dts/components/index.d.ts',
    output: [{ file: 'dist/components.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/dts/hooks/index.d.ts',
    output: [{ file: 'dist/hooks.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  {
    input: 'dist/dts/theme/index.d.ts',
    output: [{ file: 'dist/theme.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/]
  },
  // Examples types (optional)
  {
    input: 'dist/dts/examples/index.d.ts',
    output: [{ file: 'dist/examples.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/]
  }
];

// Export all configs
export default [
  ...entryPoints.map(entry => createConfig(entry.input, entry.output)),
  ...dtsConfigs
];