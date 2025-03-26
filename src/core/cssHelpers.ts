/**
 * CSS Helper Functions
 *
 * Helper functions for handling CSS properties, especially vendor prefixes
 */

/**
 * Apply a vendor-prefixed CSS property with fallbacks
 * @param property The CSS property name
 * @param value The CSS property value
 * @returns CSS string with vendor prefixes
 */
export const vendorPrefix = (property: string, value: string): string => {
  // Convert camelCase to kebab-case
  const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();

  // Standard property
  let result = `${kebabProperty}: ${value};`;

  // Webkit prefix
  if (
    kebabProperty.startsWith('backdrop-filter') ||
    kebabProperty.startsWith('font-smoothing') ||
    kebabProperty.startsWith('appearance') ||
    kebabProperty.startsWith('user-select')
  ) {
    result += `\n  -webkit-${kebabProperty}: ${value};`;
  }

  // Moz prefix
  if (kebabProperty.startsWith('osx-font-smoothing') || kebabProperty.startsWith('user-select')) {
    result += `\n  -moz-${kebabProperty}: ${value};`;
  }

  // Ms prefix
  if (kebabProperty.startsWith('user-select')) {
    result += `\n  -ms-${kebabProperty}: ${value};`;
  }

  return result;
};

/**
 * Apply a backdrop filter with appropriate vendor prefixes
 * @param value The backdrop filter value
 * @returns CSS string with vendor prefixes
 */
export const backdropFilter = (value: string): string => {
  return `
  backdrop-filter: ${value};
  -webkit-backdrop-filter: ${value};
  `;
};

/**
 * Apply font smoothing with appropriate vendor prefixes
 * @returns CSS string with vendor prefixes
 */
export const fontSmoothing = (): string => {
  return `
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  `;
};

/**
 * Apply user select with appropriate vendor prefixes
 * @param value The user-select value
 * @returns CSS string with vendor prefixes
 */
export const userSelect = (value: string): string => {
  return `
  user-select: ${value};
  -webkit-user-select: ${value};
  -moz-user-select: ${value};
  -ms-user-select: ${value};
  `;
};

/**
 * Apply CSS appearance with appropriate vendor prefixes
 * @param value The appearance value
 * @returns CSS string with vendor prefixes
 */
export const appearance = (value: string): string => {
  return `
  appearance: ${value};
  -webkit-appearance: ${value};
  `;
};

/**
 * Apply backface-visibility with appropriate vendor prefixes
 * @param value The backface-visibility value ('visible' or 'hidden')
 * @returns CSS string with vendor prefixes
 */
export const backfaceVisibility = (value: 'visible' | 'hidden'): string => {
  return `
  backface-visibility: ${value};
  -webkit-backface-visibility: ${value};
  -moz-backface-visibility: ${value};
  `;
};

// Import our element type
import { AnyHTMLElement } from '../utils/elementTypes';

/**
 * Apply GPU acceleration optimizations to an element
 * @param element HTML element to optimize
 * @returns void
 */
export const applyGpuAcceleration = (element: AnyHTMLElement): void => {
  if (!element || !element.style) return;

  // Add hardware acceleration
  element.style.transform = 'translateZ(0)';

  // Add will-change for modern browsers
  element.style.willChange = 'transform, opacity';

  // Add backface visibility with proper typing
  element.style.backfaceVisibility = 'hidden';
  element.style.webkitBackfaceVisibility = 'hidden';
};

/**
 * Create transform CSS with 3D hardware acceleration
 * @param transforms Array of transform functions or a single transform string
 * @returns CSS string with transforms
 */
export const createTransform = (transforms: string | string[]): string => {
  // Convert single string to array
  const transformArray = Array.isArray(transforms) ? transforms : [transforms];

  // Always add translateZ(0) for hardware acceleration if not already included
  if (!transformArray.some(t => t.includes('translateZ') || t.includes('translate3d'))) {
    transformArray.push('translateZ(0)');
  }

  return transformArray.join(' ');
};

/**
 * Apply 3D transforms with hardware acceleration
 * @param transforms Transform strings to apply
 * @returns CSS string with transforms and hardware acceleration
 */
export const transform3d = (transforms: string | string[]): string => {
  return `transform: ${createTransform(transforms)};`;
};
