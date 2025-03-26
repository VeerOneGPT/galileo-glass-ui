/**
 * Global optimizers for the application
 * These are singletons that are initialized once and used throughout the app
 */
import { PaintOptimizer, PaintOptimizationConfig } from './paintOptimizer';
import { OptimizedStyleSheet, OptimizedStyleSheetConfig } from './optimizedStyleSheet';
import { OptimizationLevel } from '../performanceOptimizations';

// Global paint optimizer instance
export const globalPaintOptimizer = new PaintOptimizer({
  enableProfiling: process.env.NODE_ENV === 'development',
  reduceOverdraw: true,
  useOpacityAwarePainting: true,
  clipToViewport: true,
  optimizeGlassEffects: true,
  cacheSize: 100,
  optimizationLevel: OptimizationLevel.NONE
} as PaintOptimizationConfig);

// Global optimized stylesheet instance
export const globalStyleSheet = new OptimizedStyleSheet({
  namespace: 'galileo-glass',
  optimizeSelectors: true,
  reuseClasses: true,
  cacheSize: 50,
  includeComments: false,
  autoOptimize: true,
  classNamePrefix: 'glass-',
  maxStyleSheets: 10,
  maxRulesPerSheet: 4000,
  cacheStyles: true,
  useNamespacedClasses: true,
  groupSimilarRules: true,
  minifyCss: true
} as OptimizedStyleSheetConfig);