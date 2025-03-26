/**
 * Focus Effects Mixin
 *
 * Creates focus state effects for components
 */
import { css } from 'styled-components';

import { withAlpha } from '../../colorUtils';
import { cssWithKebabProps } from '../../cssUtils';

/**
 * Focus effects options
 */
export interface FocusEffectsOptions {
  /**
   * Focus effect type
   */
  type?: 'outline' | 'ring' | 'glow' | 'border' | 'inset' | 'custom';

  /**
   * Color of the focus effect
   */
  color?: string;

  /**
   * Thickness of the focus effect in pixels
   */
  thickness?: number;

  /**
   * Opacity of the focus effect (0-1)
   */
  opacity?: number;

  /**
   * If true, the effect will be animated
   */
  animated?: boolean;

  /**
   * If true, uses focus-visible instead of focus
   */
  focusVisible?: boolean;

  /**
   * Border radius in pixels
   */
  borderRadius?: number | string;

  /**
   * Offset of the focus effect in pixels
   */
  offset?: number;

  /**
   * For custom focus type, a custom CSS snippet
   */
  customCss?: string;

  /**
   * How long the animation takes in seconds
   */
  animationDuration?: number;

  /**
   * If true, provides high contrast focus indicators
   */
  highContrast?: boolean;

  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Get border radius value
 */
const getBorderRadius = (radius?: number | string): string => {
  if (radius === undefined) return '4px';
  if (typeof radius === 'number') return `${radius}px`;
  return radius;
};

/**
 * Creates a focus effect
 */
export const focusEffects = (options: FocusEffectsOptions) => {
  const {
    type = 'outline',
    color,
    thickness = 2,
    opacity = 0.6,
    animated = true,
    focusVisible = true,
    borderRadius,
    offset = 0,
    customCss,
    animationDuration = 0.2,
    highContrast = false,
    themeContext,
  } = options;

  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;

  // Determine focus color
  const focusColor =
    color ||
    (isDarkMode ? (highContrast ? '#ffffff' : '#90caf9') : highContrast ? '#000000' : '#2196f3');

  // Get border radius
  const radius = getBorderRadius(borderRadius);

  // Create focus selector
  const focusSelector = focusVisible ? '&:focus-visible' : '&:focus';

  // Create animation styles
  const animationStyles = animated
    ? `transition: box-shadow ${animationDuration}s ease-out, border-color ${animationDuration}s ease-out;`
    : '';

  // Build the focus effect based on type
  let focusStyle = '';

  switch (type) {
    case 'outline':
      focusStyle = `
        ${focusSelector} {
          outline: none;
          box-shadow: 0 0 0 ${thickness}px ${withAlpha(focusColor, opacity)};
          ${animationStyles}
        }
      `;
      break;

    case 'ring':
      focusStyle = `
        ${focusSelector} {
          outline: none;
          box-shadow: 0 0 0 ${offset}px ${isDarkMode ? '#000000' : '#ffffff'}, 0 0 0 ${
        offset + thickness
      }px ${withAlpha(focusColor, opacity)};
          ${animationStyles}
        }
      `;
      break;

    case 'glow':
      focusStyle = `
        ${focusSelector} {
          outline: none;
          box-shadow: 0 0 ${thickness * 4}px ${withAlpha(focusColor, opacity)},
                      0 0 0 ${thickness}px ${withAlpha(focusColor, opacity / 2)};
          ${animationStyles}
        }
      `;
      break;

    case 'border':
      focusStyle = `
        ${focusSelector} {
          outline: none;
          border-color: ${withAlpha(focusColor, opacity)};
          border-width: ${thickness}px;
          ${animationStyles}
        }
      `;
      break;

    case 'inset':
      focusStyle = `
        ${focusSelector} {
          outline: none;
          box-shadow: inset 0 0 0 ${thickness}px ${withAlpha(focusColor, opacity)};
          ${animationStyles}
        }
      `;
      break;

    case 'custom':
      focusStyle = `
        ${focusSelector} {
          outline: none;
          ${customCss || ''}
        }
      `;
      break;

    default:
      focusStyle = `
        ${focusSelector} {
          outline: none;
          box-shadow: 0 0 0 ${thickness}px ${withAlpha(focusColor, opacity)};
          ${animationStyles}
        }
      `;
      break;
  }

  // Default outline removal for accessibility
  const defaultOutlineStyle = `
    &:focus {
      outline: none; /* Remove default outline but ensure we replace it with something visible */
    }
  `;

  // Add high contrast option if needed
  const highContrastStyle = highContrast
    ? `
    @media (prefers-contrast: more) {
      ${focusSelector} {
        outline: ${thickness + 1}px solid ${isDarkMode ? '#ffffff' : '#000000'};
        outline-offset: 2px;
        box-shadow: none;
      }
    }
  `
    : '';

  // Build the complete CSS
  return cssWithKebabProps`
    ${defaultOutlineStyle}
    ${focusStyle}
    ${highContrastStyle}
  `;
};

export default focusEffects;
