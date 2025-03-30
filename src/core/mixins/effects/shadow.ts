/**
 * shadow.ts
 * 
 * Styled-components mixin for generating dynamic shadow effects based on elevation.
 */

import { css, FlattenSimpleInterpolation } from 'styled-components';
import { DefaultTheme } from 'styled-components'; // Import DefaultTheme

export interface ShadowEffectOptions {
  /**
   * Elevation level (e.g., 0-24). Higher values create larger, softer shadows.
   */
  elevation?: number;
  /**
   * Optional shadow color. Defaults to theme shadow color.
   */
  color?: string;
  /**
   * Opacity multiplier (0-1). Defaults to theme shadow opacity based on elevation.
   */
  opacity?: number;
  /**
   * Theme context for accessing theme variables.
   */
  theme: DefaultTheme; // Add theme object
}

// Pre-calculated or theme-based shadow configurations for different elevations
// Example structure (replace with actual theme values)
const getShadowConfig = (elevation: number, theme: DefaultTheme) => { // Use theme directly
  // These values should ideally come from the theme
  const shadows = theme?.shadows || []; // Access theme.shadows
  // Basic fallback if theme doesn't provide shadows array
  if (!shadows[elevation]) {
    if (elevation === 0) return 'none';
    const yOffset = Math.min(1 + elevation, 20);
    const blur = Math.min(4 + elevation * 1.5, 50);
    const spread = Math.min(0 + elevation * 0.5, 10);
    // Access theme palette directly
    const defaultColor = theme?.palette?.common?.black || '#000';
    const defaultOpacity = Math.min(0.1 + elevation * 0.01, 0.25);
    // Basic color check (assuming defaultColor is hex or similar)
    if (defaultColor.startsWith('#') || defaultColor.startsWith('rgb')) {
        // Convert hex/rgb to rgba - basic implementation
        let rgbValues = '0,0,0';
        if(defaultColor.startsWith('#')) {
            const bigint = parseInt(defaultColor.slice(1), 16);
            rgbValues = `${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255}`;
        } else if (defaultColor.startsWith('rgb(')) {
            rgbValues = defaultColor.substring(4, defaultColor.length-1);
        }
        return `${yOffset}px ${blur}px ${spread}px rgba(${rgbValues}, ${defaultOpacity})`; 
    } else {
        // Fallback if color format is unknown
        return `${yOffset}px ${blur}px ${spread}px rgba(0, 0, 0, ${defaultOpacity})`; 
    }
  }
  return shadows[elevation] || 'none'; // Get pre-defined shadow from theme array
};

/**
 * Mixin to apply shadow effects based on elevation.
 * Uses theme variables for consistent styling.
 */
export const shadowEffect = (options: ShadowEffectOptions): FlattenSimpleInterpolation => {
  const { elevation = 0, color, opacity, theme } = options; // Use theme from options

  if (!theme) {
    console.warn('ShadowEffect: Theme object not provided.');
    return css``; // Return empty css if no theme
  }

  if (elevation <= 0) {
    return css`box-shadow: none;`;
  }

  // Get the base shadow configuration from the theme or calculate fallback
  const baseShadow = getShadowConfig(elevation, theme);

  // Allow overriding color and opacity
  let finalShadow = baseShadow;
  if (color || opacity !== undefined) {
    // Basic regex to parse calculated shadow (may need refinement)
    const shadowRegex = /(\d+px)\s+(\d+px)\s+(\d+px)\s+rgba?\(([^)]+),\s*([\d.]+)\)/;
    const match = baseShadow.match(shadowRegex);
    
    if (match) {
      const [, yOffset, blur, spread, baseColorString, baseOpacity] = match;
      const finalColor = color || `rgb(${baseColorString})`; // Assuming rgb for simplicity
      const finalOpacity = opacity !== undefined ? opacity : parseFloat(baseOpacity);
      // Reconstruct with potential overrides
      finalShadow = `${yOffset} ${blur} ${spread} ${finalColor.replace(/\)$/, ',' + finalOpacity + ')')}`;
      // Simple rgba append if color is not rgba already
      if (!finalColor.startsWith('rgba')) { 
          // Try converting hex/rgb to rgba (basic implementation)
          let rgbValues = '0,0,0';
          if(finalColor.startsWith('#')) {
             const bigint = parseInt(finalColor.slice(1), 16);
             rgbValues = `${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255}`;
          } else if (finalColor.startsWith('rgb(')) {
             rgbValues = finalColor.substring(4, finalColor.length-1);
          }
          finalShadow = `${yOffset} ${blur} ${spread} rgba(${rgbValues}, ${finalOpacity})`;
      } else { // color already rgba, just update opacity
          finalShadow = finalColor.replace(/,[\d\.]+\)$/, `, ${finalOpacity})`);
          finalShadow = `${yOffset} ${blur} ${spread} ${finalShadow}`;
      } 
    }
     // If regex fails or color override complex, potentially just apply color filter?
     // For now, we fallback to baseShadow if parsing/override fails
  }

  return css`
    box-shadow: ${finalShadow};
  `;
}; 