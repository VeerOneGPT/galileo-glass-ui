/**
 * Reduced Transparency Mixin
 * 
 * Creates reduced transparency alternatives for better accessibility
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../cssUtils';
import { withAlpha } from '../../colorUtils';

/**
 * Reduced transparency options
 */
export interface ReducedTransparencyOptions {
  /**
   * If true, applies reduced transparency mode styling
   */
  enabled?: boolean;
  
  /**
   * Current background opacity before reduction
   */
  currentBackgroundOpacity?: number;
  
  /**
   * Current border opacity before reduction
   */
  currentBorderOpacity?: number;
  
  /**
   * Type of background adjustment
   */
  backgroundAdjustment?: 'solid' | 'increase' | 'pattern';
  
  /**
   * Minimum opacity to ensure for backgrounds
   */
  minBackgroundOpacity?: number;
  
  /**
   * Minimum opacity to ensure for borders
   */
  minBorderOpacity?: number;
  
  /**
   * Solid background color to use (if backgroundAdjustment is 'solid')
   */
  solidBackgroundColor?: string;
  
  /**
   * If true, removes backdrop-filter effects
   */
  removeBackdropFilters?: boolean;
  
  /**
   * If true, only applies reduced transparency when system preference is enabled
   */
  respectSystemPreference?: boolean;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates reduced transparency styling for better accessibility
 */
export const reducedTransparency = (options: ReducedTransparencyOptions) => {
  const {
    enabled = true,
    currentBackgroundOpacity = 0.2,
    currentBorderOpacity = 0.1,
    backgroundAdjustment = 'solid',
    minBackgroundOpacity = 0.8,
    minBorderOpacity = 0.6,
    solidBackgroundColor,
    removeBackdropFilters = true,
    respectSystemPreference = true,
    themeContext,
  } = options;
  
  // If not enabled, return empty
  if (!enabled) return '';
  
  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;
  
  // Determine colors based on theme and provided options
  const backgroundColor = solidBackgroundColor || (isDarkMode ? '#1a1a1a' : '#f0f0f0');
  
  // Build reduced transparency styles based on background adjustment type
  let reducedTransparencyStyles = '';
  
  switch (backgroundAdjustment) {
    case 'solid':
      reducedTransparencyStyles = `
        background-color: ${backgroundColor} !important;
        border-color: ${isDarkMode ? '#ffffff' : '#000000'} !important;
        border-opacity: ${Math.max(currentBorderOpacity, minBorderOpacity)} !important;
        
        ${removeBackdropFilters ? `
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        ` : ''}
      `;
      break;
      
    case 'increase':
      reducedTransparencyStyles = `
        background-color: ${withAlpha(backgroundColor, Math.max(currentBackgroundOpacity, minBackgroundOpacity))} !important;
        border-color: ${withAlpha(isDarkMode ? '#ffffff' : '#000000', Math.max(currentBorderOpacity, minBorderOpacity))} !important;
        
        ${removeBackdropFilters ? `
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        ` : ''}
      `;
      break;
      
    case 'pattern':
      // Create a subtle pattern instead of transparency
      reducedTransparencyStyles = `
        background-color: ${backgroundColor} !important;
        background-image: ${isDarkMode 
          ? `linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a),
             linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)`
          : `linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0),
             linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0)`
        } !important;
        background-size: 10px 10px !important;
        background-position: 0 0, 5px 5px !important;
        border-color: ${isDarkMode ? '#ffffff' : '#000000'} !important;
        border-opacity: ${Math.max(currentBorderOpacity, minBorderOpacity)} !important;
        
        ${removeBackdropFilters ? `
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        ` : ''}
      `;
      break;
      
    default:
      reducedTransparencyStyles = `
        background-color: ${backgroundColor} !important;
        
        ${removeBackdropFilters ? `
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        ` : ''}
      `;
      break;
  }
  
  // If respecting system preference, wrap in media query
  if (respectSystemPreference) {
    return cssWithKebabProps`
      @media (prefers-reduced-transparency: reduce) {
        ${reducedTransparencyStyles}
      }
    `;
  }
  
  // Otherwise apply directly
  return cssWithKebabProps`
    ${reducedTransparencyStyles}
  `;
};

export default reducedTransparency;