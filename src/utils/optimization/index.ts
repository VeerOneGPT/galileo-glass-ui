/**
 * Style Optimization Utilities
 *
 * Advanced utilities for optimizing styles and rendering in Glass UI components.
 */

// Import style optimization utilities
import {
  OptimizedStyleSheet,
  globalStyleSheet as importedGlobalStyleSheet,
  createOptimizedStyleSheet,
} from './optimizedStyleSheet';

// Import paint optimization utilities
import {
  PaintOptimizer,
  globalPaintOptimizer as importedGlobalPaintOptimizer,
  createPaintOptimizer,
  markAsAnimating,
  optimizeForPainting,
  type PaintOptimizationConfig,
} from './paintOptimizer';

// Re-export the imported items
export {
  OptimizedStyleSheet,
  createOptimizedStyleSheet,
  PaintOptimizer,
  createPaintOptimizer,
  markAsAnimating,
  optimizeForPainting,
  type PaintOptimizationConfig,
};

// Export references to the global instances with proper type safety
export const globalStyleSheet: OptimizedStyleSheet | null = importedGlobalStyleSheet;
export const globalPaintOptimizer: PaintOptimizer | null = importedGlobalPaintOptimizer;

// Export StyleUpdateBatcher
export {
  StyleUpdateBatcher,
  globalStyleBatcher,
  createStyleBatcher,
  setStyle,
  addClass,
  removeClass,
  StyleOperationType,
  StyleOperationPriority,
  type StyleBatcherConfig,
  type StyleOperation,
  type BatchPerformanceMetrics,
} from './styleUpdateBatcher';

/**
 * Utility to optimize an element's rendering performance
 */
export const optimizeElement = (element: HTMLElement, isGlass = false): void => {
  if (!element) return;

  // Apply paint optimizations
  if (globalPaintOptimizer) {
    globalPaintOptimizer.optimizeElement(element, isGlass);
  }

  // Add to optimized stylesheet if it's not already styled
  if (globalStyleSheet && !element.className) {
    const className = globalStyleSheet.createClass(
      `position: relative; will-change: transform; backface-visibility: hidden; -webkit-backface-visibility: hidden;${
        isGlass ? ' transform: translateZ(0);' : ''
      }`,
      isGlass ? 'glass-element' : 'optimized-element',
      isGlass
    );
    element.className = className;
  }
};

/**
 * Utility to optimize a list of elements
 */
export const optimizeElements = (
  elements: HTMLElement[] | NodeListOf<HTMLElement>,
  isGlass = false
): void => {
  Array.from(elements).forEach(element => {
    optimizeElement(element, isGlass);
  });
};
