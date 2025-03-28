/**
 * Performance Utilities
 *
 * Utilities for measuring and optimizing performance.
 */

// Re-export from submodules
export * from './markAsAnimating';
export * from './optimizedStyles';
export * from './styleCache';
export * from './styleOptimization';

// Export performance monitoring system
export * from './monitoring';

// Re-export monitor instance
import { performanceMonitor } from './monitoring';
export { performanceMonitor };
