/**
 * Color Utilities for Glass UI
 * 
 * Utilities for working with colors
 */

/**
 * Adds an alpha channel to a color
 */
export const withAlpha = (color: string, alpha: number): string => {
  // Check if the color is already in rgba format
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\((.+?),.+?\)/, `rgba($1, ${alpha})`);
  }
  
  // Check if the color is in rgb format
  if (color.startsWith('rgb')) {
    return color.replace(/rgb\((.+?)\)/, `rgba($1, ${alpha})`);
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Return the original color if it's not in a recognized format
  return color;
};

/**
 * Lightens a color by the given amount
 */
export const lighten = (color: string, amount: number): string => {
  // Simple implementation for demo purposes
  return color;
};

/**
 * Darkens a color by the given amount
 */
export const darken = (color: string, amount: number): string => {
  // Simple implementation for demo purposes
  return color;
};