/**
 * Theme Context
 *
 * Core theme context and utilities
 */
import { DefaultTheme } from 'styled-components';

/**
 * Extended theme interface with Glass UI specific properties
 */
export interface GlassTheme extends DefaultTheme {
  // Additional properties beyond DefaultTheme
  shadows?: string[];
  
  borderRadius?: {
    [key: string]: string;
  };
  
  variant?: string;
  
  availableThemes?: string[];
}

/**
 * Theme context interface for accessing theme values
 */
export interface ThemeContext {
  /** Get a color value from the theme */
  getColor: (path: string, fallback?: string) => string;

  /** Get a spacing value from the theme */
  getSpacing: (size: string | number) => string;

  /** Get a shadow definition from the theme */
  getShadow: (level: number, color?: string) => string;

  /** Get a border radius value from the theme */
  getBorderRadius?: (size: string) => string;

  /** Get a typography value from the theme */
  getTypography?: (variant: string) => any;

  /** Get a z-index value from the theme */
  getZIndex?: (component: string) => number;

  /** Get a breakpoint value from the theme */
  getBreakpoint?: (name: string) => number;

  /** Current color mode */
  colorMode?: 'light' | 'dark';

  /** Current theme variant */
  variant?: string;

  /** Raw theme object */
  theme?: GlassTheme;

  /** Whether dark mode is enabled (alias for colorMode === 'dark') */
  isDarkMode?: boolean;

  /** Available theme names */
  availableThemes?: string[];
}

/**
 * Creates a theme context object for use with the Glass UI components
 */
export const createThemeContext = (theme?: DefaultTheme): ThemeContext => {
  // If no theme is provided, return a minimal context
  if (!theme) {
    return {
      getColor: (path: string, fallback = '') => fallback,
      getSpacing: (size: string | number) => (typeof size === 'number' ? `${size * 8}px` : size),
      getShadow: () => 'none',
      theme: undefined,
      isDarkMode: false,
    };
  }

  // Cast the theme to our extended interface
  const glassTheme = theme as GlassTheme;

  /**
   * Gets a nested property from an object using a dot-notation path
   */
  const getNestedProperty = (obj: any, path: string, fallback?: any): any => {
    if (!obj) return fallback;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return fallback;
      }
      current = current[part];
    }

    return current !== undefined ? current : fallback;
  };

  /**
   * Get color value from theme
   */
  const getColor = (path: string, fallback = ''): string => {
    return getNestedProperty(glassTheme.colors || {}, path, fallback);
  };

  /**
   * Get spacing value from theme
   */
  const getSpacing = (size: string | number): string => {
    if (typeof size === 'number') {
      // Ensure spacingUnit is a number with a default of 8
      const spacingUnit = typeof glassTheme.spacing?.unit === 'number' 
        ? glassTheme.spacing.unit 
        : 8;
      
      return `${size * spacingUnit}px`;
    }

    if (typeof size === 'string' && glassTheme.spacing && size in glassTheme.spacing) {
      return glassTheme.spacing[size] as string;
    }

    return typeof size === 'string' ? size : `${size}px`;
  };

  /**
   * Get shadow definition from theme
   */
  const getShadow = (level: number, color?: string): string => {
    const shadows = glassTheme.shadows || [];
    const shadowLevel = Math.min(Math.max(0, level), shadows.length - 1 || 0);

    if (!shadows || !shadows[shadowLevel]) {
      return 'none';
    }

    // If color is provided, replace the default shadow color
    if (color) {
      return shadows[shadowLevel].replace(/rgba\([^)]+\)/g, color);
    }

    return shadows[shadowLevel];
  };

  /**
   * Get border radius value from theme
   */
  const getBorderRadius = (size: string): string => {
    if (glassTheme.borderRadius && size in glassTheme.borderRadius) {
      return glassTheme.borderRadius[size];
    }

    return size;
  };

  /**
   * Get typography style from theme
   */
  const getTypography = (variant: string): any => {
    return getNestedProperty(glassTheme.typography || {}, variant, {});
  };

  /**
   * Get z-index value from theme
   */
  const getZIndex = (component: string): number => {
    return getNestedProperty(glassTheme.zIndex || {}, component, 0);
  };

  // Get current color mode and variant
  const colorMode = glassTheme.colorMode || 'light';
  const variant = glassTheme.variant || 'default';

  // Get available themes
  const availableThemes = glassTheme.availableThemes || [];

  return {
    getColor,
    getSpacing,
    getShadow,
    getBorderRadius,
    getTypography,
    getZIndex,
    colorMode,
    variant,
    theme: glassTheme,
    isDarkMode: colorMode === 'dark',
    availableThemes,
  };
};
