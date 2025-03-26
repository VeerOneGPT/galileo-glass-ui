/**
 * Glass Glow Effects
 * 
 * Adds a glow effect to glass components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../cssUtils';

export interface GlassGlowOptions {
  /**
   * Intensity of the glow
   */
  intensity?: 'subtle' | 'medium' | 'strong' | number;
  
  /**
   * Color of the glow
   */
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | string;
  
  /**
   * Whether the glow should pulse
   */
  pulsing?: boolean;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates a glow effect for glass components
 */
export const glassGlow = (options: GlassGlowOptions) => {
  const {
    intensity = 'medium',
    color = 'primary',
    pulsing = false,
    themeContext,
  } = options;
  
  // Convert intensity to a number
  const glowSize = typeof intensity === 'number'
    ? intensity
    : intensity === 'subtle' ? 10
      : intensity === 'medium' ? 15
      : intensity === 'strong' ? 25
      : 15;
  
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
      case 'primary': glowColor = '#6366F1'; break;
      case 'secondary': glowColor = '#8B5CF6'; break;
      case 'error': glowColor = '#EF4444'; break;
      case 'success': glowColor = '#10B981'; break;
      case 'warning': glowColor = '#F59E0B'; break;
      case 'info': glowColor = '#3B82F6'; break;
      default: glowColor = typeof color === 'string' ? color : '#6366F1';
    }
  }
  
  // Create the pulsing animation if needed
  const pulseAnimation = pulsing
    ? cssWithKebabProps`
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 ${glowSize}px 0 ${glowColor}40; }
        50% { box-shadow: 0 0 ${glowSize + 5}px 0 ${glowColor}60; }
        100% { box-shadow: 0 0 ${glowSize}px 0 ${glowColor}40; }
      }
      animation: pulse-glow 2s ease-in-out infinite;
    `
    : '';
  
  // Build the CSS
  return cssWithKebabProps`
    box-shadow: 0 0 ${glowSize}px 0 ${glowColor}50;
    ${pulseAnimation}
  `;
};

/**
 * Creates a spotlight glow effect
 */
export const spotlightGlow = (options: GlassGlowOptions & { angle?: number }) => {
  const {
    intensity = 'medium',
    color = 'primary',
    angle = 135,
    themeContext,
  } = options;
  
  // Convert intensity to a number
  const glowSize = typeof intensity === 'number'
    ? intensity
    : intensity === 'subtle' ? 10
      : intensity === 'medium' ? 15
      : intensity === 'strong' ? 25
      : 15;
  
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
      default:
        glowColor = color;
    }
  } else {
    // Fallback colors
    switch (color) {
      case 'primary': glowColor = '#6366F1'; break;
      case 'secondary': glowColor = '#8B5CF6'; break;
      default: glowColor = typeof color === 'string' ? color : '#6366F1';
    }
  }
  
  // Convert angle to x and y offset
  const radian = (angle * Math.PI) / 180;
  const x = Math.round(Math.cos(radian) * (glowSize / 2));
  const y = Math.round(Math.sin(radian) * (glowSize / 2));
  
  // Build the CSS
  return cssWithKebabProps`
    box-shadow: ${x}px ${y}px ${glowSize}px 0 ${glowColor}50;
  `;
};

/**
 * Collection of glow effect methods
 */
export const glowEffects = {
  glassGlow,
  spotlightGlow
};