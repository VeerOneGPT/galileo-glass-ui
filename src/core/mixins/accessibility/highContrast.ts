/**
 * High Contrast Mixin
 *
 * Creates high contrast alternatives for better accessibility
 */
import { css } from 'styled-components';

import { cssWithKebabProps } from '../../cssUtils';

/**
 * High contrast options
 */
export interface HighContrastOptions {
  /**
   * If true, applies high contrast mode styling
   */
  enabled?: boolean;

  /**
   * The type of high contrast enhancement
   */
  type?: 'borders' | 'colors' | 'both' | 'custom';

  /**
   * Border width for high contrast elements
   */
  borderWidth?: number | string;

  /**
   * Border color for high contrast elements
   */
  borderColor?: string;

  /**
   * Text color for high contrast
   */
  textColor?: string;

  /**
   * Background color for high contrast
   */
  backgroundColor?: string;

  /**
   * If true, removes background images for better contrast
   */
  removeBackgroundImages?: boolean;

  /**
   * If true, removes shadows for better contrast
   */
  removeShadows?: boolean;

  /**
   * For custom type, a custom CSS snippet
   */
  customCss?: string;

  /**
   * If true, only applies high contrast when system preference is enabled
   */
  respectSystemPreference?: boolean;

  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates high contrast styling for better accessibility
 */
export const highContrast = (options: HighContrastOptions) => {
  const {
    enabled = true,
    type = 'both',
    borderWidth = 2,
    borderColor,
    textColor,
    backgroundColor,
    removeBackgroundImages = true,
    removeShadows = true,
    customCss,
    respectSystemPreference = true,
    themeContext,
  } = options;

  // If not enabled, return empty
  if (!enabled) return '';

  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;

  // Determine colors based on theme and provided options
  const highContrastBorderColor = borderColor || (isDarkMode ? '#ffffff' : '#000000');
  const highContrastTextColor = textColor || (isDarkMode ? '#ffffff' : '#000000');
  const highContrastBackgroundColor = backgroundColor || (isDarkMode ? '#000000' : '#ffffff');

  // Build high contrast styles based on type
  let highContrastStyles = '';

  switch (type) {
    case 'borders':
      highContrastStyles = `
        border: ${borderWidth}px solid ${highContrastBorderColor} !important;
        outline: none !important;
        
        ${
          removeShadows
            ? `
          box-shadow: none !important;
          text-shadow: none !important;
        `
            : ''
        }
        
        /* Ensure all child elements have visible borders as well */
        & > * {
          border-color: ${highContrastBorderColor} !important;
          ${
            removeShadows
              ? `
            box-shadow: none !important;
            text-shadow: none !important;
          `
              : ''
          }
        }
      `;
      break;

    case 'colors':
      highContrastStyles = `
        color: ${highContrastTextColor} !important;
        background-color: ${highContrastBackgroundColor} !important;
        
        ${
          removeBackgroundImages
            ? `
          background-image: none !important;
        `
            : ''
        }
        
        ${
          removeShadows
            ? `
          box-shadow: none !important;
          text-shadow: none !important;
        `
            : ''
        }
        
        /* Ensure all child elements have high contrast colors as well */
        & * {
          color: ${highContrastTextColor} !important;
          ${
            removeBackgroundImages
              ? `
            background-image: none !important;
          `
              : ''
          }
          ${
            removeShadows
              ? `
            box-shadow: none !important;
            text-shadow: none !important;
          `
              : ''
          }
        }
      `;
      break;

    case 'both':
      highContrastStyles = `
        color: ${highContrastTextColor} !important;
        background-color: ${highContrastBackgroundColor} !important;
        border: ${borderWidth}px solid ${highContrastBorderColor} !important;
        outline: none !important;
        
        ${
          removeBackgroundImages
            ? `
          background-image: none !important;
        `
            : ''
        }
        
        ${
          removeShadows
            ? `
          box-shadow: none !important;
          text-shadow: none !important;
        `
            : ''
        }
        
        /* Ensure all child elements have high contrast as well */
        & * {
          color: ${highContrastTextColor} !important;
          border-color: ${highContrastBorderColor} !important;
          ${
            removeBackgroundImages
              ? `
            background-image: none !important;
          `
              : ''
          }
          ${
            removeShadows
              ? `
            box-shadow: none !important;
            text-shadow: none !important;
          `
              : ''
          }
        }
      `;
      break;

    case 'custom':
      highContrastStyles = customCss || '';
      break;

    default:
      highContrastStyles = '';
      break;
  }

  // If respecting system preference, wrap in media query
  if (respectSystemPreference) {
    return cssWithKebabProps`
      @media (prefers-contrast: more) {
        ${highContrastStyles}
      }
    `;
  }

  // Otherwise apply directly
  return cssWithKebabProps`
    ${highContrastStyles}
  `;
};

export default highContrast;
