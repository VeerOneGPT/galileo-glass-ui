/**
 * Glass Border Mixin
 * 
 * Creates glass-like border effects for components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../cssUtils';
import { withAlpha } from '../colorUtils';

/**
 * Glass border options
 */
export interface GlassBorderOptions {
  /**
   * Border width in pixels
   */
  width?: number | string;
  
  /**
   * Border style
   */
  style?: 'solid' | 'dashed' | 'dotted';
  
  /**
   * Border opacity
   */
  opacity?: 'subtle' | 'light' | 'medium' | 'strong' | number;
  
  /**
   * Border color
   */
  color?: string;
  
  /**
   * If true, applies a gradient to the border
   */
  gradient?: boolean;
  
  /**
   * If true, applies a glow effect to the border
   */
  glow?: boolean;
  
  /**
   * Glow color
   */
  glowColor?: string;
  
  /**
   * Glow intensity (0-1)
   */
  glowIntensity?: 'subtle' | 'light' | 'medium' | 'strong' | number;
  
  /**
   * Border radius
   */
  radius?: number | string;
  
  /**
   * Border position
   */
  position?: 'all' | 'top' | 'right' | 'bottom' | 'left' | 'horizontal' | 'vertical';
  
  /**
   * If true, animates border glow
   */
  animated?: boolean;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Get border opacity value
 */
const getBorderOpacity = (opacity?: 'subtle' | 'light' | 'medium' | 'strong' | number): number => {
  if (typeof opacity === 'number') return opacity;
  
  switch (opacity) {
    case 'subtle': return 0.1;
    case 'light': return 0.2;
    case 'medium': return 0.3;
    case 'strong': return 0.5;
    default: return 0.2;
  }
};

/**
 * Get glow intensity value
 */
const getGlowIntensity = (intensity?: 'subtle' | 'light' | 'medium' | 'strong' | number): number => {
  if (typeof intensity === 'number') return intensity;
  
  switch (intensity) {
    case 'subtle': return 0.2;
    case 'light': return 0.3;
    case 'medium': return 0.5;
    case 'strong': return 0.8;
    default: return 0.4;
  }
};

/**
 * Converts a border position to CSS border properties
 */
const getBorderPosition = (position?: string): Record<string, boolean> => {
  const borders = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };
  
  switch (position) {
    case 'top':
      borders.top = true;
      break;
    case 'right':
      borders.right = true;
      break;
    case 'bottom':
      borders.bottom = true;
      break;
    case 'left':
      borders.left = true;
      break;
    case 'horizontal':
      borders.top = true;
      borders.bottom = true;
      break;
    case 'vertical':
      borders.left = true;
      borders.right = true;
      break;
    case 'all':
    default:
      borders.top = true;
      borders.right = true;
      borders.bottom = true;
      borders.left = true;
      break;
  }
  
  return borders;
};

/**
 * Creates a glass border effect
 */
export const glassBorder = (options: GlassBorderOptions) => {
  const {
    width = 1,
    style = 'solid',
    opacity = 'medium',
    color,
    gradient = false,
    glow = false,
    glowColor,
    glowIntensity = 'medium',
    radius = 8,
    position = 'all',
    animated = false,
    themeContext,
  } = options;
  
  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;
  
  // Parse border width
  const borderWidth = typeof width === 'number' ? `${width}px` : width;
  
  // Parse border radius
  const borderRadius = typeof radius === 'number' ? `${radius}px` : radius;
  
  // Get border opacity value
  const borderOpacity = getBorderOpacity(opacity);
  
  // Get glow intensity value
  const glowOpacity = getGlowIntensity(glowIntensity);
  
  // Determine border color
  const borderColor = color || (isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.75)');
  
  // Build CSS for glow effect
  const glowStyles = glow ? `
    box-shadow: 0 0 10px ${withAlpha(glowColor || borderColor, glowOpacity)};
    ${animated ? `
      animation: glassBorderGlow 2s ease-in-out infinite;
      
      @keyframes glassBorderGlow {
        0%, 100% {
          box-shadow: 0 0 5px ${withAlpha(glowColor || borderColor, glowOpacity * 0.5)};
        }
        50% {
          box-shadow: 0 0 12px ${withAlpha(glowColor || borderColor, glowOpacity)};
        }
      }
    ` : ''}
  ` : '';
  
  // Get border positions
  const borders = getBorderPosition(position);
  
  // Build gradient border if requested
  const gradientBorder = gradient ? `
    border-image: ${isDarkMode 
      ? `linear-gradient(135deg, rgba(255,255,255,${borderOpacity * 0.6}), rgba(255,255,255,${borderOpacity * 1.4}))`
      : `linear-gradient(135deg, rgba(255,255,255,${borderOpacity * 1.2}), rgba(255,255,255,${borderOpacity * 0.8}))`
    } 1;
  ` : '';
  
  // Build the CSS
  return cssWithKebabProps`
    ${borders.top ? `border-top: ${borderWidth} ${style} ${withAlpha(borderColor, borderOpacity)};` : ''}
    ${borders.right ? `border-right: ${borderWidth} ${style} ${withAlpha(borderColor, borderOpacity)};` : ''}
    ${borders.bottom ? `border-bottom: ${borderWidth} ${style} ${withAlpha(borderColor, borderOpacity)};` : ''}
    ${borders.left ? `border-left: ${borderWidth} ${style} ${withAlpha(borderColor, borderOpacity)};` : ''}
    border-radius: ${borderRadius};
    ${gradientBorder}
    ${glowStyles}
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
  `;
};

export default glassBorder;