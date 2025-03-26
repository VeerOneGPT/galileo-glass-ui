/**
 * Global optimizers for the application
 * These are singletons that are initialized once and used throughout the app
 */
import { OptimizationLevel } from '../performanceOptimizations';

import { OptimizedStyleSheet, OptimizedStyleSheetConfig } from './optimizedStyleSheet';
import { PaintOptimizer, PaintOptimizationConfig } from './paintOptimizer';

/**
 * Global Paint Optimizer instance for optimizing paint operations
 * Null in server-side rendering environments, initialized in browser
 */
export const globalPaintOptimizer =
  typeof window !== 'undefined'
    ? new PaintOptimizer({
        enableProfiling: process.env.NODE_ENV === 'development',
        reduceOverdraw: true,
        useOpacityAwarePainting: true,
        clipToViewport: true,
        optimizeGlassEffects: true,
        cacheSize: 100,
        optimizationLevel: OptimizationLevel.NONE,
      })
    : null;

/**
 * Safely access the global paint optimizer
 * Returns null if not available (SSR) and provides proper type checking
 */
export function getPaintOptimizer(): PaintOptimizer | null {
  return globalPaintOptimizer;
}

/**
 * Global Optimized Stylesheet instance for stylesheet optimization
 * Null in server-side rendering environments, initialized in browser
 */
export const globalStyleSheet =
  typeof window !== 'undefined'
    ? new OptimizedStyleSheet({
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
        minifyCss: true,
      })
    : null;

/**
 * Safely access the global stylesheet
 * Returns null if not available (SSR) and provides proper type checking
 */
export function getStyleSheet(): OptimizedStyleSheet | null {
  return globalStyleSheet;
}
