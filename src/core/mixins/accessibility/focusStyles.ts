/**
 * Focus Styles Mixin
 *
 * Creates accessible focus styles for better keyboard navigation
 */
import { css } from 'styled-components';

import { withAlpha } from '../../colorUtils';
import { cssWithKebabProps } from '../../cssUtils';

/**
 * Focus styles options
 */
export interface FocusStylesOptions {
  /**
   * Type of focus style
   */
  type?: 'outline' | 'ring' | 'border' | 'highlight' | 'custom';

  /**
   * Width of the focus indicator
   */
  width?: number | string;

  /**
   * Color of the focus indicator
   */
  color?: string;

  /**
   * Opacity of the focus indicator
   */
  opacity?: number;

  /**
   * Offset of the focus indicator
   */
  offset?: number | string;

  /**
   * Border radius of the focus indicator
   */
  borderRadius?: number | string;

  /**
   * If true, uses the :focus-visible selector for focus styles
   */
  focusVisible?: boolean;

  /**
   * If true, uses a more prominent style for high contrast mode
   */
  highContrast?: boolean;

  /**
   * For custom type, a custom CSS snippet
   */
  customCss?: string;

  /**
   * If true, the focus indicator will be animated
   */
  animated?: boolean;

  /**
   * Animation duration in seconds
   */
  animationDuration?: number;

  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates accessible focus styles
 */
export const focusStyles = (options: FocusStylesOptions) => {
  const {
    type = 'outline',
    width = 2,
    color,
    opacity = 1,
    offset = 2,
    borderRadius,
    focusVisible = true,
    highContrast = true,
    customCss,
    animated = true,
    animationDuration = 0.2,
    themeContext,
  } = options;

  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;

  // Determine focus color
  const focusColor = color || (isDarkMode ? '#90caf9' : '#2196f3');

  // Convert width and offset to pixels if they are numbers
  const widthPx = typeof width === 'number' ? `${width}px` : width;
  const offsetPx = typeof offset === 'number' ? `${offset}px` : offset;

  // Determine border radius
  const radius =
    borderRadius !== undefined
      ? typeof borderRadius === 'number'
        ? `${borderRadius}px`
        : borderRadius
      : 'inherit';

  // Create focus selector based on preference
  const focusSelector = focusVisible ? '&:focus-visible' : '&:focus';

  // Animation styles if enabled
  const animationStyles = animated
    ? `transition: box-shadow ${animationDuration}s ease-out, outline ${animationDuration}s ease-out;`
    : '';

  // Build focus styles based on type
  let focusStylesCSS = '';

  switch (type) {
    case 'outline':
      focusStylesCSS = `
        ${focusSelector} {
          outline: ${widthPx} solid ${withAlpha(focusColor, opacity)};
          outline-offset: ${offsetPx};
          ${animationStyles}
        }
      `;
      break;

    case 'ring':
      focusStylesCSS = `
        ${focusSelector} {
          outline: none;
          box-shadow: 0 0 0 ${widthPx} ${withAlpha(focusColor, opacity)};
          border-radius: ${radius};
          ${animationStyles}
        }
      `;
      break;

    case 'border':
      focusStylesCSS = `
        ${focusSelector} {
          outline: none;
          border: ${widthPx} solid ${withAlpha(focusColor, opacity)} !important;
          ${animationStyles}
        }
      `;
      break;

    case 'highlight':
      focusStylesCSS = `
        ${focusSelector} {
          outline: none;
          background-color: ${withAlpha(focusColor, opacity * 0.2)} !important;
          border-color: ${withAlpha(focusColor, opacity)} !important;
          ${animationStyles}
        }
      `;
      break;

    case 'custom':
      focusStylesCSS = `
        ${focusSelector} {
          outline: none;
          ${customCss || ''}
        }
      `;
      break;

    default:
      focusStylesCSS = `
        ${focusSelector} {
          outline: ${widthPx} solid ${withAlpha(focusColor, opacity)};
          outline-offset: ${offsetPx};
          ${animationStyles}
        }
      `;
      break;
  }

  // Add high contrast mode styles if enabled
  const highContrastStyles = highContrast
    ? `
    @media (prefers-contrast: more) {
      ${focusSelector} {
        outline: ${widthPx} solid ${isDarkMode ? '#ffffff' : '#000000'} !important;
        outline-offset: ${offsetPx} !important;
        box-shadow: none !important;
      }
    }
  `
    : '';

  // Combine all styles
  return cssWithKebabProps`
    /* Remove default focus styles */
    &:focus {
      outline: none;
    }
    
    /* Apply custom focus styles */
    ${focusStylesCSS}
    
    /* High contrast mode styles */
    ${highContrastStyles}
  `;
};

export default focusStyles;
