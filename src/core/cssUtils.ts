/**
 * CSS Utilities for Glass UI
 *
 * Utilities for working with CSS in styled-components
 */

import { css } from 'styled-components';

/**
 * Utility to ensure kebab-case is used for CSS properties in styled-components template literals
 * This is critical for proper runtime behavior
 *
 * @jest-mock This function is mocked in tests
 */
export const cssWithKebabProps = (strings: TemplateStringsArray, ...values: any[]) => {
  return css(strings, ...values);
};

/**
 * Converts camelCase property names to kebab-case
 * Useful when programmatically generating CSS
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Creates a CSS class name from a component name
 */
export const createClassName = (componentName: string): string => {
  return `glass-${componentName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
};
