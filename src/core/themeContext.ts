/**
 * Theme Context Creator for Glass UI
 */

// import { GalileoTheme } from '../theme/types'; // Removed problematic import
import { CSSProperties } from 'react';

/**
 * Helper function to safely get nested properties
 */
const get = (obj: any, path: string, fallback: any) => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      return fallback;
    }
  }
  return result !== undefined ? result : fallback;
};

/**
 * Theme context interface for Glass UI system
 */
export interface ThemeContext {
  /**
   * The theme object
   */
  theme: any;

  /**
   * Whether dark mode is enabled
   */
  isDarkMode: boolean;

  /**
   * Get a color from the theme by path
   */
  getColor: (path: string, fallback: string) => string;

  /**
   * Get a shadow from the theme
   */
  getShadow: (level: number, color?: string) => string;

  /**
   * Get spacing from the theme
   */
  getSpacing: (size: number) => string;

  /**
   * Get a breakpoint from the theme
   */
  getBreakpoint: (name: string) => number;

  zIndex: {
    hide: number;
    auto: string;
    base: number;
    docked: number;
    dropdown: number;
    sticky: number;
    banner: number;
    overlay: number;
    modal: number;
    popover: number;
    skipLink: number;
    toast: number;
    tooltip: number;
    glacial: number;
  };
}

/**
 * Core theme context interface, mirroring the expected structure for mixins
 */
export interface CoreThemeContext {
  isDarkMode: boolean;
  themeVariant: string;
  colors: {
    accentPrimary: string;
    accentSecondary: string;
    accentTertiary: string;
    stateCritical: string;
    stateOptimal: string;
    stateAttention: string;
    stateInformational: string;
    neutralBackground: string;
    neutralForeground: string;
    neutralBorder: string;
    neutralSurface: string;
  };
  zIndex: {
    hide: number;
    auto: string;
    base: number;
    docked: number;
    dropdown: number;
    sticky: number;
    banner: number;
    overlay: number;
    modal: number;
    popover: number;
    skipLink: number;
    toast: number;
    tooltip: number;
    glacial: number;
  };
  // spacing?: number; // Removed spacing property for now
}

/**
 * Create a full theme context object from a theme object
 */
export const createThemeContext = (theme: any): ThemeContext => {
  const isDarkMode = theme?.isDarkMode || false;
  const themeVariant = theme?.themeVariant || 'nebula';

  const getColor = (path: string, fallback: string): string => {
    // Prioritize themeVariant path
    const variantPath = `colors.${themeVariant}.${path}`;
    const variantColor = get(theme, variantPath, undefined);
    if (variantColor !== undefined) return variantColor;

    // Fallback to base colors path
    const basePath = `colors.${path}`;
    const baseColor = get(theme, basePath, undefined);
    if (baseColor !== undefined) return baseColor;

    // Use provided fallback
    return fallback;
  };

  const getShadow = (level: number, color?: string): string => {
    const shadowColor = color || (isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)');
    const elevationShadows = get(theme, 'shadows.elevation', {});
    const shadow = elevationShadows[level] || elevationShadows[1] || '0px 2px 4px -1px rgba(0,0,0,0.2)'; // Default shadow
    // Simple approach: replace default shadow color with provided color - might need refinement
    return shadow.replace(/rgba\([^)]+\)/g, shadowColor);
  };

  const getSpacing = (size: number): string => {
    const baseUnit = get(theme, 'spacing.unit', 8);
    return `${baseUnit * size}px`;
  };

  const getBreakpoint = (name: string): number => {
    return get(theme, `breakpoints.values.${name}`, 0);
  };

  const zIndex = get(theme, 'zIndex', {
    hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000, 
    sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, 
    popover: 1500, skipLink: 1600, toast: 1700, tooltip: 1800, 
    glacial: 9999
  });

  return {
    theme: theme || {},
    isDarkMode,
    getColor,
    getShadow,
    getSpacing,
    getBreakpoint,
    zIndex
  };
};

/**
 * Resolve spacing value based on theme context
 */
export const resolveSpacing = (
  themeContext: ThemeContext,
  size: number | string
): string => {
  if (typeof size === 'string') {
    return size;
  }
  return themeContext.getSpacing(size);
};

// Define CoreThemeContext - simplified for clarity
