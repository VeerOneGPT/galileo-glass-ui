/**
 * Style Optimization Utilities
 * 
 * Advanced utilities for optimizing styles and rendering in Glass UI components.
 */

// Import globalStyleSheet for use in this file
import { OptimizedStyleSheet, globalStyleSheet as importedGlobalStyleSheet, createOptimizedStyleSheet } from './optimizedStyleSheet';

// Import globalPaintOptimizer for use in this file
import { 
  PaintOptimizer, 
  globalPaintOptimizer as importedGlobalPaintOptimizer,
  createPaintOptimizer,
  markAsAnimating,
  optimizeForPainting,
  PaintOptimizationConfig
} from './paintOptimizer';

// Re-export the imported items
export {
  OptimizedStyleSheet,
  createOptimizedStyleSheet,
  PaintOptimizer,
  createPaintOptimizer,
  markAsAnimating,
  optimizeForPainting,
  type PaintOptimizationConfig
};

// Export references to the global instances
export const globalStyleSheet = importedGlobalStyleSheet;
export const globalPaintOptimizer = importedGlobalPaintOptimizer;

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
  type BatchPerformanceMetrics
} from './styleUpdateBatcher';

/**
 * Utility to optimize an element's rendering performance
 */
export const optimizeElement = (element: HTMLElement, isGlass: boolean = false): void => {
  if (!element) return;
  
  // Apply paint optimizations
  if (globalPaintOptimizer) {
    globalPaintOptimizer.optimizeElement(element, isGlass);
  }
  
  // Add to optimized stylesheet if it's not already styled
  if (globalStyleSheet && !element.className) {
    const className = globalStyleSheet.createClass(
      `position: relative; will-change: transform; backface-visibility: hidden;${
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
  isGlass: boolean = false
): void => {
  Array.from(elements).forEach(element => {
    optimizeElement(element, isGlass);
  });
};