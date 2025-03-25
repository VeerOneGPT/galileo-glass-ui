/**
 * Edge Highlight Effects
 * 
 * Adds edge highlighting to glass components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../cssUtils';

export interface EdgeHighlightOptions {
  /**
   * Thickness of the edge highlight
   */
  thickness?: number;
  
  /**
   * Opacity of the edge highlight
   */
  opacity?: number;
  
  /**
   * Position of the edge highlight
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  
  /**
   * Color of the edge highlight
   */
  color?: 'primary' | 'secondary' | 'white' | string;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates an edge highlight effect for glass components
 */
export const edgeHighlight = (options: EdgeHighlightOptions) => {
  const {
    thickness = 1,
    opacity = 0.7,
    position = 'all',
    color = 'white',
    themeContext,
  } = options;
  
  // Get the color based on theme or fallback
  let highlightColor: string;
  
  if (themeContext?.getColor && typeof color === 'string') {
    switch (color) {
      case 'primary':
        highlightColor = themeContext.getColor('nebula.accentPrimary', '#6366F1');
        break;
      case 'secondary':
        highlightColor = themeContext.getColor('nebula.accentSecondary', '#8B5CF6');
        break;
      case 'white':
        highlightColor = '#FFFFFF';
        break;
      default:
        highlightColor = color;
    }
  } else {
    // Fallback colors
    switch (color) {
      case 'primary': highlightColor = '#6366F1'; break;
      case 'secondary': highlightColor = '#8B5CF6'; break;
      case 'white': highlightColor = '#FFFFFF'; break;
      default: highlightColor = typeof color === 'string' ? color : '#FFFFFF';
    }
  }
  
  // Apply highlight based on position
  let borderStyle = '';
  
  switch (position) {
    case 'top':
      borderStyle = `border-top: ${thickness}px solid ${highlightColor}${Math.floor(opacity * 255).toString(16)}`;
      break;
    case 'bottom':
      borderStyle = `border-bottom: ${thickness}px solid ${highlightColor}${Math.floor(opacity * 255).toString(16)}`;
      break;
    case 'left':
      borderStyle = `border-left: ${thickness}px solid ${highlightColor}${Math.floor(opacity * 255).toString(16)}`;
      break;
    case 'right':
      borderStyle = `border-right: ${thickness}px solid ${highlightColor}${Math.floor(opacity * 255).toString(16)}`;
      break;
    case 'all':
    default:
      borderStyle = `border: ${thickness}px solid ${highlightColor}${Math.floor(opacity * 255).toString(16)}`;
  }
  
  // Build the CSS
  return cssWithKebabProps`
    ${borderStyle};
  `;
};