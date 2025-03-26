/**
 * Inner Glow Effects
 *
 * Provides style mixins for creating inner glow effects for glass surfaces.
 */
import { css } from 'styled-components';

import { ThemeContext } from '../../theme';

export interface InnerGlowOptions {
  /**
   * Color of the inner glow
   */
  color?: string;

  /**
   * Intensity of the glow
   */
  intensity?: 'subtle' | 'medium' | 'strong';

  /**
   * Spread of the glow effect
   */
  spread?: number;

  /**
   * Theme context for theme-aware styling
   */
  themeContext?: any;
}

/**
 * Get the alpha value based on intensity
 */
const getIntensityAlpha = (intensity?: 'subtle' | 'medium' | 'strong'): number => {
  switch (intensity) {
    case 'subtle':
      return 0.15;
    case 'strong':
      return 0.4;
    default:
      return 0.25; // medium
  }
};

/**
 * Creates an inner glow effect for glass surfaces
 *
 * @param options Configuration options for the inner glow effect
 * @returns CSS styles for the inner glow effect
 */
export const innerGlow = (options: InnerGlowOptions = {}) => {
  const { color = '#ffffff', intensity = 'medium', spread = 10, themeContext } = options;

  // Get theme-based color if color is a theme path
  const resolvedColor = themeContext?.getColor ? themeContext.getColor(color, color) : color;

  const alpha = getIntensityAlpha(intensity);
  const glowColor = `${resolvedColor}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;

  return css`
    box-shadow: inset 0 0 ${spread}px 0 ${glowColor};
  `;
};

/**
 * Creates a focused inner highlight effect
 *
 * @param options Configuration options for the inner highlight
 * @returns CSS styles for the inner highlight effect
 */
export const innerHighlight = (options: InnerGlowOptions = {}) => {
  const { color = '#ffffff', intensity = 'medium', spread = 3, themeContext } = options;

  // Get theme-based color if color is a theme path
  const resolvedColor = themeContext?.getColor ? themeContext.getColor(color, color) : color;

  const alpha = getIntensityAlpha(intensity) * 1.5; // Higher alpha for highlights
  const highlightColor = `${resolvedColor}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;

  return css`
    box-shadow: inset 0 1px ${spread}px 0 ${highlightColor};
  `;
};

/**
 * Creates an inner shadow effect
 *
 * @param options Configuration options for the inner shadow
 * @returns CSS styles for the inner shadow effect
 */
export const innerShadow = (options: InnerGlowOptions = {}) => {
  const { color = '#000000', intensity = 'medium', spread = 10, themeContext } = options;

  // Get theme-based color if color is a theme path
  const resolvedColor = themeContext?.getColor ? themeContext.getColor(color, color) : color;

  const alpha = getIntensityAlpha(intensity);
  const shadowColor = `${resolvedColor}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;

  return css`
    box-shadow: inset 0 0 ${spread}px 0 ${shadowColor};
  `;
};
