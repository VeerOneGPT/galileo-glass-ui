/**
 * Glow Effects Mixins
 * 
 * Styled-components mixins for creating glass-like glow effects
 */
import { css } from 'styled-components';
import { createThemeContext, ThemeContext } from '../theme';

/**
 * Glow intensity levels
 */
export type GlowIntensity = 'none' | 'subtle' | 'light' | 'medium' | 'strong' | 'high' | 'low' | 'minimal' | number;

/**
 * Glow effect options
 */
export interface GlowEffectProps {
  /** Glow intensity level */
  glowIntensity?: GlowIntensity;
  
  /** Glow color */
  glowColor?: string;
  
  /** Dark mode toggle */
  darkMode?: boolean;
  
  /** Scale up glow on hover */
  hoverEffect?: boolean;

  /** Animate glow */
  animated?: boolean;
  
  /** Apply glow to element border */
  borderGlow?: boolean;
  
  /** Theme context for styled-components */
  themeContext?: ThemeContext;
  
  /**
   * @deprecated Use glowIntensity instead
   */
  intensity?: GlowIntensity;
  
  /**
   * @deprecated Use glowColor instead
   */
  color?: string;
}

/**
 * Convert glow intensity to numeric value
 */
export const getGlowIntensity = (intensity?: GlowIntensity): number => {
  if (typeof intensity === 'number') {
    return Math.max(0, Math.min(1, intensity));
  }
  
  switch (intensity) {
    case 'strong': return 1;
    case 'high': return 0.85;
    case 'medium': return 0.6; 
    case 'light': return 0.3;
    case 'low': return 0.25;
    case 'subtle': return 0.15;
    case 'minimal': return 0.05;
    case 'none':
    default: return 0;
  }
};

/**
 * Create a glass glow effect
 */
export const glassGlow = (props: GlowEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  
  // Handle legacy property names
  const glowIntensity = props.glowIntensity || props.intensity;
  const intensity = getGlowIntensity(glowIntensity);
  
  if (intensity === 0) {
    return css``;
  }
  
  const glowColor = props.glowColor || props.color || themeContext.getColor('primary.main');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';
  
  // Calculate glow parameters based on intensity and theme
  const glowOpacity = isDark ? intensity * 0.5 : intensity * 0.3;
  const glowSize = Math.round(intensity * 20) + 5;
  const glowSpread = Math.round(intensity * 2);
  
  // Calculate border glow effect
  const borderGlowSize = props.borderGlow ? Math.max(1, Math.round(intensity * 4)) : 0;
  
  // Base glow effect
  const baseGlow = css`
    box-shadow: 0 0 ${glowSize}px ${glowSpread}px ${glowColor}${Math.round(glowOpacity * 100).toString(16)};
    ${props.borderGlow ? `border: ${borderGlowSize}px solid ${glowColor}${Math.round(glowOpacity * 150).toString(16)};` : ''}
  `;
  
  // Apply hover effect if requested
  if (props.hoverEffect) {
    return css`
      ${baseGlow}
      transition: box-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
      
      &:hover {
        box-shadow: 0 0 ${glowSize * 1.5}px ${glowSpread * 1.3}px ${glowColor}${Math.round(glowOpacity * 130).toString(16)};
        ${props.borderGlow ? `border: ${borderGlowSize}px solid ${glowColor}${Math.round(glowOpacity * 180).toString(16)};` : ''}
      }
    `;
  }
  
  // Apply animated effect if requested
  if (props.animated) {
    return css`
      ${baseGlow}
      animation: pulse-glow 2s infinite alternate;
      
      @keyframes pulse-glow {
        0% {
          box-shadow: 0 0 ${glowSize}px ${glowSpread}px ${glowColor}${Math.round(glowOpacity * 80).toString(16)};
        }
        100% {
          box-shadow: 0 0 ${glowSize * 1.3}px ${glowSpread * 1.2}px ${glowColor}${Math.round(glowOpacity * 120).toString(16)};
        }
      }
    `;
  }
  
  return baseGlow;
};

/**
 * Focused element glow effect
 */
export const focusGlow = (props: GlowEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  const glowIntensity = props.glowIntensity || props.intensity || 'medium';
  const intensity = getGlowIntensity(glowIntensity);
  const glowColor = props.glowColor || props.color || themeContext.getColor('primary.main');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';
  
  // Calculate glow parameters
  const glowOpacity = isDark ? intensity * 0.7 : intensity * 0.5;
  const glowSize = Math.round(intensity * 15) + 3;
  const glowSpread = Math.round(intensity * 2);
  
  return css`
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 ${glowSize}px ${glowSpread}px ${glowColor}${Math.round(glowOpacity * 150).toString(16)};
    }
  `;
};

/**
 * Interactive button glow effect
 */
export const buttonGlow = (props: GlowEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  const glowIntensity = props.glowIntensity || props.intensity || 'medium';
  const intensity = getGlowIntensity(glowIntensity);
  const glowColor = props.glowColor || props.color || themeContext.getColor('primary.main');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';
  
  // Calculate glow parameters
  const glowOpacity = isDark ? intensity * 0.6 : intensity * 0.4;
  const glowSize = Math.round(intensity * 18) + 4;
  const glowSpread = Math.round(intensity * 3);
  const pressedGlowSize = Math.round(intensity * 10) + 2;
  
  return css`
    position: relative;
    
    &:hover {
      box-shadow: 0 0 ${glowSize}px ${glowSpread}px ${glowColor}${Math.round(glowOpacity * 120).toString(16)};
    }
    
    &:active {
      box-shadow: 0 0 ${pressedGlowSize}px ${Math.round(glowSpread * 0.7)}px ${glowColor}${Math.round(glowOpacity * 180).toString(16)};
      transform: translateY(1px);
    }
    
    ${focusGlow(props, themeContext)}
  `;
};

/**
 * Apply inner glow effect to elements
 */
export const innerGlow = (props: GlowEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  const glowIntensity = props.glowIntensity || props.intensity || 'medium'; 
  const intensity = getGlowIntensity(glowIntensity);
  
  if (intensity === 0) {
    return css``;
  }
  
  const glowColor = props.glowColor || themeContext.getColor('primary.light');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';
  
  // Calculate glow parameters
  const glowOpacity = isDark ? intensity * 0.4 : intensity * 0.25;
  const glowSize = Math.max(1, Math.round(intensity * 15));
  const glowSpread = Math.round(intensity * 2);
  
  return css`
    box-shadow: inset 0 0 ${glowSize}px ${glowSpread}px ${glowColor}${Math.round(glowOpacity * 100).toString(16)};
  `;
};

// Export all glow mixins
export const glow = {
  glass: glassGlow,
  focus: focusGlow,
  button: buttonGlow,
  inner: innerGlow,
  getIntensity: getGlowIntensity
};