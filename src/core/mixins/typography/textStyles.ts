/**
 * Text Styles Mixin
 * 
 * Creates glass-specific text styling for components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../cssUtils';
import { withAlpha } from '../../colorUtils';

/**
 * Text styles options
 */
export interface TextStylesOptions {
  /**
   * The variant of the text
   */
  variant?: 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'glassTitle' | 'glassHeading' | 'glassBody' | 'code' | 'quote' | 'custom';
  
  /**
   * Size of the text
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number;
  
  /**
   * Weight of the text
   */
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | number;
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Color of the text
   */
  color?: string;
  
  /**
   * Text opacity
   */
  opacity?: number;
  
  /**
   * Line height multiplier
   */
  lineHeight?: number | string;
  
  /**
   * Letter spacing in em
   */
  letterSpacing?: number | string;
  
  /**
   * Text decoration
   */
  decoration?: 'none' | 'underline' | 'line-through';
  
  /**
   * Text transform
   */
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  /**
   * If true, applies a glass-like text effect
   */
  glass?: boolean;
  
  /**
   * If true, applies a shadow to text
   */
  shadow?: boolean | 'light' | 'medium' | 'strong';
  
  /**
   * If true, applies a gradient to text
   */
  gradient?: boolean;
  
  /**
   * Colors to use for gradient (if gradient is true)
   */
  gradientColors?: string[];
  
  /**
   * If true, truncates text with ellipsis
   */
  truncate?: boolean;
  
  /**
   * Number of lines to show before truncating
   */
  lineClamp?: number;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Get font size based on size prop
 */
const getFontSize = (size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number): string => {
  if (typeof size === 'number') return `${size}px`;
  
  switch (size) {
    case 'xs': return '0.75rem';
    case 'sm': return '0.875rem';
    case 'md': return '1rem';
    case 'lg': return '1.125rem';
    case 'xl': return '1.25rem';
    case '2xl': return '1.5rem';
    case '3xl': return '1.875rem';
    default: return '1rem';
  }
};

/**
 * Get font weight based on weight prop
 */
const getFontWeight = (weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | number): number => {
  if (typeof weight === 'number') return weight;
  
  switch (weight) {
    case 'light': return 300;
    case 'regular': return 400;
    case 'medium': return 500;
    case 'semibold': return 600;
    case 'bold': return 700;
    default: return 400;
  }
};

/**
 * Get line height based on lineHeight prop
 */
const getLineHeight = (lineHeight?: number | string): string => {
  if (lineHeight === undefined) return '1.5';
  if (typeof lineHeight === 'number') return lineHeight.toString();
  return lineHeight;
};

/**
 * Get letter spacing based on letterSpacing prop
 */
const getLetterSpacing = (letterSpacing?: number | string): string => {
  if (letterSpacing === undefined) return 'normal';
  if (typeof letterSpacing === 'number') return `${letterSpacing}em`;
  return letterSpacing;
};

/**
 * Get shadow style based on shadow prop
 */
const getShadowStyle = (shadow?: boolean | 'light' | 'medium' | 'strong', isDarkMode?: boolean): string => {
  if (!shadow) return '';
  
  const shadowColor = isDarkMode ? '#000000' : '#000000';
  const lightColor = isDarkMode ? '#ffffff' : '#ffffff';
  
  let intensity = 0.5;
  if (shadow === 'light') intensity = 0.3;
  if (shadow === 'medium') intensity = 0.5;
  if (shadow === 'strong') intensity = 0.7;
  
  return `
    text-shadow: 
      0 1px 2px ${withAlpha(shadowColor, intensity * 0.4)},
      0 0 1px ${withAlpha(lightColor, intensity * 0.1)};
  `;
};

/**
 * Get gradient style based on gradient prop
 */
const getGradientStyle = (gradient?: boolean, gradientColors?: string[], isDarkMode?: boolean): string => {
  if (!gradient) return '';
  
  const colors = gradientColors || [
    isDarkMode ? '#7dd3fc' : '#0ea5e9',
    isDarkMode ? '#c084fc' : '#8b5cf6'
  ];
  
  return `
    background: linear-gradient(135deg, ${colors.join(', ')});
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  `;
};

/**
 * Get glass style based on glass prop
 */
const getGlassStyle = (glass?: boolean, isDarkMode?: boolean): string => {
  if (!glass) return '';
  
  const shadowColor = isDarkMode ? '#000000' : '#000000';
  const glowColor = isDarkMode ? '#ffffff' : '#ffffff';
  
  return `
    text-shadow: 
      0 0 1px ${withAlpha(glowColor, 0.3)},
      0 1px 2px ${withAlpha(shadowColor, 0.1)};
    mix-blend-mode: ${isDarkMode ? 'screen' : 'multiply'};
  `;
};

/**
 * Create styles for text truncation
 */
const getTruncateStyle = (truncate?: boolean, lineClamp?: number): string => {
  if (!truncate) return '';
  
  if (lineClamp && lineClamp > 1) {
    return `
      display: -webkit-box;
      -webkit-line-clamp: ${lineClamp};
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
  }
  
  return `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
};

/**
 * Get variant-specific styles
 */
const getVariantStyles = (variant?: string, isDarkMode?: boolean): string => {
  switch (variant) {
    case 'title':
      return `
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 0.5em;
      `;
    case 'heading':
      return `
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.3;
        margin-bottom: 0.5em;
      `;
    case 'subheading':
      return `
        font-size: 1.25rem;
        font-weight: 500;
        line-height: 1.4;
        margin-bottom: 0.5em;
      `;
    case 'body':
      return `
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
      `;
    case 'caption':
      return `
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.4;
        opacity: 0.8;
      `;
    case 'glassTitle':
      return `
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.02em;
        ${getGlassStyle(true, isDarkMode)}
        ${getShadowStyle('medium', isDarkMode)}
      `;
    case 'glassHeading':
      return `
        font-size: 1.75rem;
        font-weight: 600;
        line-height: 1.3;
        letter-spacing: -0.01em;
        ${getGlassStyle(true, isDarkMode)}
        ${getShadowStyle('light', isDarkMode)}
      `;
    case 'glassBody':
      return `
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.6;
        ${getGlassStyle(true, isDarkMode)}
      `;
    case 'code':
      return `
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 0.9em;
        background-color: ${isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
        padding: 0.2em 0.4em;
        border-radius: 3px;
      `;
    case 'quote':
      return `
        font-size: 1.1rem;
        font-style: italic;
        line-height: 1.6;
        border-left: 4px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
        padding-left: 1em;
        margin-left: 0;
        margin-right: 0;
      `;
    default:
      return '';
  }
};

/**
 * Creates glass-specific text styling
 */
export const textStyles = (options: TextStylesOptions) => {
  const {
    variant,
    size,
    weight,
    align,
    color,
    opacity,
    lineHeight,
    letterSpacing,
    decoration,
    transform,
    glass,
    shadow,
    gradient,
    gradientColors,
    truncate,
    lineClamp,
    themeContext,
  } = options;
  
  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;
  
  // Get base styles from variant
  const variantStyles = getVariantStyles(variant, isDarkMode);
  
  // Get individual style properties
  const fontSize = size !== undefined ? getFontSize(size) : undefined;
  const fontWeight = weight !== undefined ? getFontWeight(weight) : undefined;
  const lineHeightValue = lineHeight !== undefined ? getLineHeight(lineHeight) : undefined;
  const letterSpacingValue = letterSpacing !== undefined ? getLetterSpacing(letterSpacing) : undefined;
  
  // Get special effects
  const shadowStyle = getShadowStyle(shadow, isDarkMode);
  const gradientStyle = getGradientStyle(gradient, gradientColors, isDarkMode);
  const glassStyle = getGlassStyle(glass, isDarkMode);
  const truncateStyle = getTruncateStyle(truncate, lineClamp);
  
  // Combine all styles
  return cssWithKebabProps`
    ${variantStyles}
    
    ${fontSize !== undefined ? `font-size: ${fontSize};` : ''}
    ${fontWeight !== undefined ? `font-weight: ${fontWeight};` : ''}
    ${align !== undefined ? `text-align: ${align};` : ''}
    ${color !== undefined && !gradient ? `color: ${color};` : ''}
    ${opacity !== undefined ? `opacity: ${opacity};` : ''}
    ${lineHeightValue !== undefined ? `line-height: ${lineHeightValue};` : ''}
    ${letterSpacingValue !== undefined ? `letter-spacing: ${letterSpacingValue};` : ''}
    ${decoration !== undefined ? `text-decoration: ${decoration};` : ''}
    ${transform !== undefined ? `text-transform: ${transform};` : ''}
    
    ${shadowStyle}
    ${gradientStyle}
    ${glassStyle}
    ${truncateStyle}
  `;
};

export default textStyles;