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
 * Converts hex color to RGBA format
 */
export const hexToRGBA = (hex: string, alpha = 1): string => {
  // Remove the hash if it exists
  const cleanHex = hex.charAt(0) === '#' ? hex.slice(1) : hex;

  // Convert short hex to full form
  const fullHex =
    cleanHex.length === 3
      ? cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2]
      : cleanHex;

  // Parse the values
  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Parses a color string into RGBA components
 */
export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const parseColorWithAlpha = (color: string): RGBAColor => {
  // Default color if parsing fails
  const defaultColor: RGBAColor = { r: 0, g: 0, b: 0, a: 1 };

  // Check if it's already an rgba color
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: parseFloat(match[4]),
      };
    }
  }

  // Check if it's an rgb color
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: 1,
      };
    }
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }

  // Return the default color if parsing failed
  return defaultColor;
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
