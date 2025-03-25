/**
 * Glass Surface Mixin
 * 
 * Creates a glass-like surface effect for components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../cssUtils';
import { withAlpha } from '../colorUtils';

export interface GlassSurfaceOptions {
  /**
   * Elevation level (0-5)
   */
  elevation?: number | 'low' | 'medium' | 'high';
  
  /**
   * Strength of the blur effect
   */
  blurStrength?: 'minimal' | 'light' | 'standard' | 'enhanced' | string;
  
  /**
   * Opacity of the background
   */
  backgroundOpacity?: 'subtle' | 'light' | 'medium' | 'strong' | number;
  
  /**
   * Opacity of the border
   */
  borderOpacity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong' | number;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates a glass surface effect
 */
export const glassSurface = (options: GlassSurfaceOptions) => {
  const {
    elevation = 2,
    blurStrength = 'standard',
    backgroundOpacity = 'medium',
    borderOpacity = 'subtle',
    themeContext,
  } = options;
  
  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;
  
  // Convert elevation to a number
  const elevationNum = typeof elevation === 'number' 
    ? elevation
    : elevation === 'low' ? 1 : elevation === 'medium' ? 2 : 3;
  
  // Convert blur strength to a pixel value
  const blurValue = typeof blurStrength === 'string'
    ? blurStrength === 'minimal' ? '4px'
      : blurStrength === 'light' ? '8px'
      : blurStrength === 'standard' ? '12px'
      : blurStrength === 'enhanced' ? '20px'
      : blurStrength
    : `${blurStrength}px`;
  
  // Convert opacities to numbers
  const bgOpacity = typeof backgroundOpacity === 'number'
    ? backgroundOpacity
    : backgroundOpacity === 'subtle' ? 0.1
      : backgroundOpacity === 'light' ? 0.2
      : backgroundOpacity === 'medium' ? 0.4
      : backgroundOpacity === 'strong' ? 0.6
      : 0.2;
  
  const borderOp = typeof borderOpacity === 'number'
    ? borderOpacity
    : borderOpacity === 'none' ? 0
      : borderOpacity === 'subtle' ? 0.1
      : borderOpacity === 'light' ? 0.2
      : borderOpacity === 'medium' ? 0.3
      : borderOpacity === 'strong' ? 0.4
      : 0.1;
  
  // Build the CSS
  return cssWithKebabProps`
    background-color: ${isDarkMode 
      ? `rgba(15, 23, 42, ${bgOpacity})`
      : `rgba(255, 255, 255, ${bgOpacity})`};
    backdrop-filter: blur(${blurValue});
    -webkit-backdrop-filter: blur(${blurValue});
    border: 1px solid ${isDarkMode
      ? `rgba(255, 255, 255, ${borderOp})`
      : `rgba(255, 255, 255, ${borderOp + 0.3})`};
    box-shadow: 0 ${elevationNum * 2}px ${elevationNum * 4}px ${withAlpha(
      isDarkMode ? '#000000' : '#1E293B', 
      0.1 + elevationNum * 0.02
    )};
    border-radius: 8px;
    transition: all 0.2s ease-in-out;
  `;
};