/**
 * Inner Glow Effects
 *
 * Adds inner glow effects to glass components
 */
import { css } from 'styled-components';

import { cssWithKebabProps } from '../../cssUtils';

export interface InnerGlowOptions {
  /**
   * Color of the inner glow
   */
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | string;

  /**
   * Intensity of the inner glow
   */
  intensity?: 'subtle' | 'medium' | 'strong' | number;

  /**
   * Spread of the inner glow
   */
  spread?: number;

  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates an inner glow effect for glass components
 */
export const innerGlow = (options: InnerGlowOptions) => {
  const { color = 'primary', intensity = 'medium', spread = 15, themeContext } = options;

  // Convert intensity to a number
  const glowIntensity =
    typeof intensity === 'number'
      ? intensity
      : intensity === 'subtle'
      ? 0.2
      : intensity === 'medium'
      ? 0.35
      : intensity === 'strong'
      ? 0.5
      : 0.35;

  // Get the color based on theme or fallback
  let glowColor: string;

  if (themeContext?.getColor && typeof color === 'string') {
    switch (color) {
      case 'primary':
        glowColor = themeContext.getColor('nebula.accentPrimary', '#6366F1');
        break;
      case 'secondary':
        glowColor = themeContext.getColor('nebula.accentSecondary', '#8B5CF6');
        break;
      case 'error':
        glowColor = themeContext.getColor('nebula.stateCritical', '#EF4444');
        break;
      case 'success':
        glowColor = themeContext.getColor('nebula.stateOptimal', '#10B981');
        break;
      case 'warning':
        glowColor = themeContext.getColor('nebula.stateAttention', '#F59E0B');
        break;
      case 'info':
        glowColor = themeContext.getColor('nebula.stateInformational', '#3B82F6');
        break;
      default:
        glowColor = color;
    }
  } else {
    // Fallback colors
    switch (color) {
      case 'primary':
        glowColor = '#6366F1';
        break;
      case 'secondary':
        glowColor = '#8B5CF6';
        break;
      case 'error':
        glowColor = '#EF4444';
        break;
      case 'success':
        glowColor = '#10B981';
        break;
      case 'warning':
        glowColor = '#F59E0B';
        break;
      case 'info':
        glowColor = '#3B82F6';
        break;
      default:
        glowColor = typeof color === 'string' ? color : '#6366F1';
    }
  }

  // Convert opacity to hex
  const opacityHex = Math.floor(glowIntensity * 255)
    .toString(16)
    .padStart(2, '0');

  // Build the CSS
  return cssWithKebabProps`
    box-shadow: inset 0 0 ${spread}px ${glowColor}${opacityHex};
  `;
};
