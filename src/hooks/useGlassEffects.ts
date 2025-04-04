/**
 * useGlassEffects Hook
 *
 * Hook for creating and managing glass effects
 */
import { useMemo } from 'react';

import { edgeHighlight } from '../core/mixins/effects/edgeEffects';
import { glassGlow } from '../core/mixins/effects/glowEffects';
import { innerGlow } from '../core/mixins/effects/innerEffects';
import { glassSurface } from '../core/mixins/glassSurface';
import { createThemeContext } from '../core/themeContext';

import { useReducedMotion } from './useReducedMotion';
import { Theme } from '../core/types';
import { rgba } from 'polished';

/**
 * Options for glass effects
 */
export interface GlassEffectsOptions {
  /**
   * The strength of the blur effect
   */
  blurStrength?: 'minimal' | 'light' | 'standard' | 'enhanced';

  /**
   * The elevation of the glass surface
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;

  /**
   * The color of glow effects
   */
  glowColor?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';

  /**
   * Whether the component is interactive
   */
  isInteractive?: boolean;

  /**
   * Whether the component is selected
   */
  isSelected?: boolean;

  /**
   * Whether to force dark mode
   */
  forceDarkMode?: boolean;
}

/**
 * Hook for creating and managing glass effects
 */
export const useGlassEffects = () => {
  // Get reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  /**
   * Creates glass surface CSS
   */
  const createGlassSurface = (options: GlassEffectsOptions = {}) => {
    const {
      blurStrength = 'standard',
      elevation = 2,
      forceDarkMode = false,
      isInteractive = false,
      isSelected = false,
    } = options;

    // Reduce blur strength if user prefers reduced motion
    const adjustedBlurStrength = prefersReducedMotion
      ? blurStrength === 'enhanced'
        ? 'standard'
        : blurStrength === 'standard'
        ? 'light'
        : blurStrength
      : blurStrength;

    // Pass only the theme object (empty for now) to createThemeContext
    const themeContext = createThemeContext({ isDarkMode: forceDarkMode });

    // Create glass surface CSS
    return glassSurface({
      blurStrength: adjustedBlurStrength,
      elevation,
      backgroundOpacity: isSelected ? 'medium' : 'light',
      borderOpacity: isSelected ? 'medium' : 'subtle',
      themeContext,
    });
  };

  /**
   * Creates glass glow CSS
   */
  const createGlassGlow = (options: GlassEffectsOptions = {}) => {
    const {
      glowColor = 'primary',
      forceDarkMode = false,
      isInteractive = false,
      isSelected = false,
    } = options;

    // Pass only the theme object (empty for now) to createThemeContext
    const themeContext = createThemeContext({ isDarkMode: forceDarkMode });

    // Create glass glow CSS
    return glassGlow({
      intensity: isSelected ? 'medium' : 'subtle',
      color: glowColor,
      pulsing: isInteractive && !prefersReducedMotion,
      themeContext,
    });
  };

  /**
   * Creates inner glow CSS
   */
  const createInnerGlow = (options: GlassEffectsOptions = {}) => {
    const { glowColor = 'primary', forceDarkMode = false, isSelected = false } = options;

    // Pass only the theme object (empty for now) to createThemeContext
    const themeContext = createThemeContext({ isDarkMode: forceDarkMode });

    // Create inner glow CSS
    return innerGlow({
      intensity: isSelected ? 'medium' : 'subtle',
      color: glowColor,
      spread: 15,
      themeContext,
    });
  };

  /**
   * Creates edge highlight CSS
   */
  const createEdgeHighlight = (options: GlassEffectsOptions = {}) => {
    const { glowColor = 'primary', forceDarkMode = false, isSelected = false } = options;

    // Pass only the theme object (empty for now) to createThemeContext
    const themeContext = createThemeContext({ isDarkMode: forceDarkMode });

    // Create edge highlight CSS
    return edgeHighlight({
      thickness: 1,
      opacity: isSelected ? 0.7 : 0.3,
      position: 'all',
      color: glowColor,
      themeContext,
    });
  };

  // Memoize the functions to avoid unnecessary re-creation
  return useMemo(
    () => ({
      createGlassSurface,
      createGlassGlow,
      createInnerGlow,
      createEdgeHighlight,
      prefersReducedMotion,
    }),
    [prefersReducedMotion]
  );
};
