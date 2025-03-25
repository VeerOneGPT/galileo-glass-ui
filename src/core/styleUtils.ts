/**
 * Core Style Utilities
 * 
 * Utility functions for styling Glass UI components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from './cssUtils';

/**
 * Style mixin interface
 */
export interface StyleMixin {
  (props?: any): ReturnType<typeof css>;
}

/**
 * Spacing size values and aliases
 */
export type SpacingSize = 
  'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 
  number | string;

/**
 * Spacing units mapping (for named sizes)
 */
export const SPACING_UNITS: Record<string, number> = {
  'xxs': 4,
  'xs': 8,
  'sm': 12, 
  'md': 16,
  'lg': 24,
  'xl': 32,
  'xxl': 48
};

/**
 * Base unit for spacing calculations
 */
export const SPACING_BASE_UNIT = 8;

/**
 * Convert a spacing value to pixels
 */
export const getSpacing = (size: SpacingSize): string => {
  // If it's already a string with units, return as-is
  if (typeof size === 'string' && !SPACING_UNITS[size]) {
    return size;
  }
  
  // If it's a named size, convert using the mapping
  if (typeof size === 'string' && SPACING_UNITS[size]) {
    return `${SPACING_UNITS[size]}px`;
  }
  
  // If it's a number, multiply by the base unit
  if (typeof size === 'number') {
    return `${size * SPACING_BASE_UNIT}px`;
  }
  
  // Default
  return `${SPACING_BASE_UNIT}px`;
};

/**
 * Create padding CSS
 */
export const padding = (
  top: SpacingSize,
  right?: SpacingSize,
  bottom?: SpacingSize,
  left?: SpacingSize
): ReturnType<typeof css> => {
  // Handle shorthand cases
  // - padding(all)
  // - padding(vertical, horizontal)
  // - padding(top, right, bottom, left)
  if (right === undefined) {
    return cssWithKebabProps`padding: ${getSpacing(top)};`;
  }
  
  if (bottom === undefined) {
    return cssWithKebabProps`
      padding-top: ${getSpacing(top)};
      padding-right: ${getSpacing(right)};
      padding-bottom: ${getSpacing(top)};
      padding-left: ${getSpacing(right)};
    `;
  }
  
  if (left === undefined) {
    return cssWithKebabProps`
      padding-top: ${getSpacing(top)};
      padding-right: ${getSpacing(right)};
      padding-bottom: ${getSpacing(bottom)};
      padding-left: ${getSpacing(right)};
    `;
  }
  
  return cssWithKebabProps`
    padding-top: ${getSpacing(top)};
    padding-right: ${getSpacing(right)};
    padding-bottom: ${getSpacing(bottom)};
    padding-left: ${getSpacing(left)};
  `;
};

/**
 * Create margin CSS
 */
export const margin = (
  top: SpacingSize,
  right?: SpacingSize,
  bottom?: SpacingSize,
  left?: SpacingSize
): ReturnType<typeof css> => {
  // Handle shorthand cases
  // - margin(all)
  // - margin(vertical, horizontal)
  // - margin(top, right, bottom, left)
  if (right === undefined) {
    return cssWithKebabProps`margin: ${getSpacing(top)};`;
  }
  
  if (bottom === undefined) {
    return cssWithKebabProps`
      margin-top: ${getSpacing(top)};
      margin-right: ${getSpacing(right)};
      margin-bottom: ${getSpacing(top)};
      margin-left: ${getSpacing(right)};
    `;
  }
  
  if (left === undefined) {
    return cssWithKebabProps`
      margin-top: ${getSpacing(top)};
      margin-right: ${getSpacing(right)};
      margin-bottom: ${getSpacing(bottom)};
      margin-left: ${getSpacing(right)};
    `;
  }
  
  return cssWithKebabProps`
    margin-top: ${getSpacing(top)};
    margin-right: ${getSpacing(right)};
    margin-bottom: ${getSpacing(bottom)};
    margin-left: ${getSpacing(left)};
  `;
};

/**
 * Border radius values
 */
export type BorderRadiusSize = 
  'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 
  number | string;

/**
 * Border radius mapping
 */
export const BORDER_RADIUS: Record<string, string> = {
  'none': '0',
  'xs': '2px',
  'sm': '4px',
  'md': '8px',
  'lg': '12px',
  'xl': '16px',
  'full': '9999px'
};

/**
 * Get border radius value
 */
export const getBorderRadius = (size: BorderRadiusSize): string => {
  // If it's already a string with units, return as-is
  if (typeof size === 'string' && !BORDER_RADIUS[size]) {
    return size;
  }
  
  // If it's a named size, convert using the mapping
  if (typeof size === 'string' && BORDER_RADIUS[size]) {
    return BORDER_RADIUS[size];
  }
  
  // If it's a number, convert to pixels
  if (typeof size === 'number') {
    return `${size}px`;
  }
  
  // Default
  return BORDER_RADIUS.md;
};

/**
 * Create border radius CSS
 */
export const borderRadius = (
  topLeft: BorderRadiusSize,
  topRight?: BorderRadiusSize,
  bottomRight?: BorderRadiusSize,
  bottomLeft?: BorderRadiusSize
): ReturnType<typeof css> => {
  // Handle shorthand cases
  if (topRight === undefined) {
    return cssWithKebabProps`border-radius: ${getBorderRadius(topLeft)};`;
  }
  
  if (bottomRight === undefined) {
    return cssWithKebabProps`
      border-top-left-radius: ${getBorderRadius(topLeft)};
      border-top-right-radius: ${getBorderRadius(topRight)};
      border-bottom-right-radius: ${getBorderRadius(topRight)};
      border-bottom-left-radius: ${getBorderRadius(topLeft)};
    `;
  }
  
  if (bottomLeft === undefined) {
    return cssWithKebabProps`
      border-top-left-radius: ${getBorderRadius(topLeft)};
      border-top-right-radius: ${getBorderRadius(topRight)};
      border-bottom-right-radius: ${getBorderRadius(bottomRight)};
      border-bottom-left-radius: ${getBorderRadius(topRight)};
    `;
  }
  
  return cssWithKebabProps`
    border-top-left-radius: ${getBorderRadius(topLeft)};
    border-top-right-radius: ${getBorderRadius(topRight)};
    border-bottom-right-radius: ${getBorderRadius(bottomRight)};
    border-bottom-left-radius: ${getBorderRadius(bottomLeft)};
  `;
};

/**
 * Elevation levels for shadows
 */
export type ElevationLevel = 
  'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 
  0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Shadow values for light mode
 */
const LIGHT_MODE_SHADOWS: Record<string | number, string> = {
  'none': 'none',
  0: 'none',
  'xs': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
  1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
  'sm': '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  2: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  4: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  5: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  'xxl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  6: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

/**
 * Shadow values for dark mode
 */
const DARK_MODE_SHADOWS: Record<string | number, string> = {
  'none': 'none',
  0: 'none',
  'xs': '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.2)',
  1: '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.2)',
  'sm': '0 2px 4px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)',
  2: '0 2px 4px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)',
  'md': '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  3: '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  4: '0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  5: '0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  'xxl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  6: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

/**
 * Get shadow value based on elevation and theme mode
 */
export const getShadow = (elevation: ElevationLevel, isDarkMode = false): string => {
  const shadows = isDarkMode ? DARK_MODE_SHADOWS : LIGHT_MODE_SHADOWS;
  return shadows[elevation] || shadows.md;
};

/**
 * Create shadow CSS
 */
export const shadow = (elevation: ElevationLevel, isDarkMode = false): ReturnType<typeof css> => {
  const shadowValue = getShadow(elevation, isDarkMode);
  return cssWithKebabProps`box-shadow: ${shadowValue};`;
};

/**
 * Typography size values
 */
export type TypographySize = 
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' |
  number | string;

/**
 * Typography properties by size
 */
interface TypographyProps {
  fontSize: string;
  lineHeight: string;
  fontWeight?: number | string;
  letterSpacing?: string;
}

/**
 * Typography size mapping
 */
export const TYPOGRAPHY_SIZES: Record<string, TypographyProps> = {
  'xs': {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',     // 16px
    letterSpacing: '0.03em'
  },
  'sm': {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.25rem',  // 20px
    letterSpacing: '0.02em'
  },
  'md': {
    fontSize: '1rem',       // 16px
    lineHeight: '1.5rem',   // 24px
    letterSpacing: '0.01em'
  },
  'lg': {
    fontSize: '1.125rem',   // 18px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '0'
  },
  'xl': {
    fontSize: '1.25rem',    // 20px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '-0.01em'
  },
  'xxl': {
    fontSize: '1.5rem',     // 24px
    lineHeight: '2rem',     // 32px
    letterSpacing: '-0.01em'
  },
  'h1': {
    fontSize: '2.25rem',    // 36px
    lineHeight: '2.5rem',   // 40px
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  'h2': {
    fontSize: '1.875rem',   // 30px
    lineHeight: '2.25rem',  // 36px
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  'h3': {
    fontSize: '1.5rem',     // 24px
    lineHeight: '2rem',     // 32px
    fontWeight: 600,
    letterSpacing: '-0.01em'
  },
  'h4': {
    fontSize: '1.25rem',    // 20px
    lineHeight: '1.75rem',  // 28px
    fontWeight: 600,
    letterSpacing: '-0.01em'
  },
  'h5': {
    fontSize: '1.125rem',   // 18px
    lineHeight: '1.75rem',  // 28px
    fontWeight: 600,
    letterSpacing: '0'
  },
  'h6': {
    fontSize: '1rem',       // 16px
    lineHeight: '1.5rem',   // 24px
    fontWeight: 600,
    letterSpacing: '0.01em'
  }
};

/**
 * Get typography properties
 */
export const getTypographyProps = (size: TypographySize): TypographyProps => {
  // If it's a named size, return from mapping
  if (typeof size === 'string' && TYPOGRAPHY_SIZES[size]) {
    return TYPOGRAPHY_SIZES[size];
  }
  
  // If it's a number, create custom typography props
  if (typeof size === 'number') {
    return {
      fontSize: `${size / 16}rem`,
      lineHeight: `${Math.max(Math.round(size * 1.5) / 16, 1)}rem`
    };
  }
  
  // If it's a string with units
  if (typeof size === 'string') {
    return {
      fontSize: size,
      lineHeight: '1.5'
    };
  }
  
  // Default
  return TYPOGRAPHY_SIZES.md;
};

/**
 * Create typography CSS
 */
export const typography = (size: TypographySize): ReturnType<typeof css> => {
  const props = getTypographyProps(size);
  
  return cssWithKebabProps`
    font-size: ${props.fontSize};
    line-height: ${props.lineHeight};
    ${props.fontWeight ? `font-weight: ${props.fontWeight};` : ''}
    ${props.letterSpacing ? `letter-spacing: ${props.letterSpacing};` : ''}
  `;
};

/**
 * Flexbox alignment values
 */
export type FlexAlignment = 
  'start' | 'center' | 'end' | 
  'flex-start' | 'flex-end' | 
  'space-between' | 'space-around' | 'space-evenly' | 
  'stretch' | 'baseline';

/**
 * Create flexbox CSS
 */
export const flex = (
  direction: 'row' | 'column' = 'row',
  justifyContent: FlexAlignment = 'flex-start',
  alignItems: FlexAlignment = 'stretch',
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse' = 'nowrap'
): ReturnType<typeof css> => {
  return cssWithKebabProps`
    display: flex;
    flex-direction: ${direction};
    justify-content: ${justifyContent};
    align-items: ${alignItems};
    flex-wrap: ${wrap};
  `;
};

/**
 * Create grid CSS
 */
export const grid = (
  columns: number | string = 12,
  gap: SpacingSize = 'md'
): ReturnType<typeof css> => {
  // Convert columns to CSS grid template
  const columnsTemplate = typeof columns === 'number' 
    ? `repeat(${columns}, 1fr)`
    : columns;
  
  return cssWithKebabProps`
    display: grid;
    grid-template-columns: ${columnsTemplate};
    gap: ${getSpacing(gap)};
  `;
};

/**
 * Create a truncated text CSS
 */
export const truncate = (lines: number = 1): ReturnType<typeof css> => {
  if (lines === 1) {
    return cssWithKebabProps`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
  }
  
  return cssWithKebabProps`
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;
};

/**
 * Create responsive styles for different breakpoints
 */
export const responsive = (
  styles: Record<string, ReturnType<typeof css>>,
  breakpoints: Record<string, string> = {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px'
  }
): ReturnType<typeof css> => {
  let result = '';
  
  // Add base styles (if any)
  if (styles.base) {
    result += styles.base;
  }
  
  // Add responsive styles
  Object.entries(styles)
    .filter(([key]) => key !== 'base' && breakpoints[key])
    .forEach(([key, value]) => {
      result += `
        @media (min-width: ${breakpoints[key]}) {
          ${value}
        }
      `;
    });
  
  return css`${result}`;
};

/**
 * Hide element visually but keep it accessible to screen readers
 */
export const visuallyHidden = (): ReturnType<typeof css> => {
  return cssWithKebabProps`
    border: 0;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    width: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  `;
};

/**
 * Compose multiple style mixins together
 */
export const composeStyles = (...mixins: StyleMixin[]): StyleMixin => {
  return (props?: any) => {
    return css`${mixins.map(mixin => mixin(props)).join('')}`;
  };
};