/**
 * Theme Utilities
 * 
 * Utility functions for working with themes in Glass UI
 */
import { CSSProperties } from 'react';
import { css } from 'styled-components';
import { cssWithKebabProps } from './cssUtils';
import { 
  NamedColor, 
  ColorIntensity, 
  Theme, 
  ColorMode,
  BlurStrength,
  ZLayer,
  ZDepth,
  Z_INDEX_MAP,
  Z_DEPTH_TRANSFORM
} from './types';

/**
 * Context value for using theme within mixins
 */
export interface ThemeContext {
  /**
   * The current theme object
   */
  theme: Theme;
  
  /**
   * Whether dark mode is active
   */
  isDarkMode: boolean;
  
  /**
   * Current theme variant
   */
  variant: string;
}

/**
 * Default blur strength values
 */
export const BLUR_STRENGTH_VALUES: Record<string | number, string | number> = {
  none: 0,
  minimal: 2,
  light: 4,
  standard: 8,
  medium: 12,
  enhanced: 16,
  strong: 24,
  extreme: 32
};

/**
 * Default background opacity values
 */
export const BACKGROUND_OPACITY_VALUES: Record<string, number> = {
  transparent: 0,
  lightest: 0.05,
  light: 0.1,
  medium: 0.2,
  high: 0.5,
  solid: 1
};

/**
 * Default border opacity values
 */
export const BORDER_OPACITY_VALUES: Record<string, number> = {
  none: 0,
  minimal: 0.05,
  subtle: 0.1,
  medium: 0.2,
  high: 0.4
};

/**
 * Default glow intensity values
 */
export const GLOW_INTENSITY_VALUES: Record<string, number> = {
  minimal: 0.02,
  light: 0.05,
  medium: 0.1,
  strong: 0.15,
  extreme: 0.25
};

/**
 * Create a theme context for use in mixins
 * 
 * @param themeObj The styled-components theme object
 * @param forceDarkMode Whether to force dark mode regardless of theme
 * @returns ThemeContext object
 */
export const createThemeContext = (
  themeObj: any = {},
  forceDarkMode = false
): ThemeContext => {
  // Create default context if theme is missing
  if (!themeObj) {
    return {
      theme: {} as Theme,
      isDarkMode: forceDarkMode || false,
      variant: 'default'
    };
  }
  
  return {
    theme: themeObj,
    isDarkMode: forceDarkMode || themeObj.isDarkMode || themeObj.colorMode === 'dark',
    variant: themeObj.variant || 'default'
  };
};

/**
 * Get color value from theme
 * 
 * @param context Theme context
 * @param color Named color or custom color
 * @param intensity Color intensity
 * @returns CSS color value
 */
export const getThemeColor = (
  context: ThemeContext,
  color: NamedColor | string,
  intensity: ColorIntensity = 'main'
): string => {
  // If it's a valid CSS color (hex, rgb, etc.), return as-is
  if (
    color.startsWith('#') || 
    color.startsWith('rgb') || 
    color.startsWith('hsl') ||
    color === 'transparent' ||
    color === 'currentColor'
  ) {
    return color;
  }
  
  // Get from theme if available
  if (context.theme?.colors?.[color]?.[intensity]) {
    return context.theme.colors[color][intensity];
  }
  
  // Fallback values based on dark mode
  const darkModeDefaults: Record<NamedColor, string> = {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    tertiary: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    surface: 'rgba(30, 41, 59, 0.8)',
    background: '#0F172A',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#F43F5E'
  };
  
  const lightModeDefaults: Record<NamedColor, string> = {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    tertiary: '#DB2777',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
    surface: 'rgba(255, 255, 255, 0.8)',
    background: '#F1F5F9',
    text: '#0F172A',
    muted: '#64748B',
    accent: '#E11D48'
  };
  
  // Choose defaults based on theme mode
  const defaults = context.isDarkMode ? darkModeDefaults : lightModeDefaults;
  
  // Return default color if available
  return defaults[color as NamedColor] || '#6366F1';
};

/**
 * Get a blur strength value
 * 
 * @param context Theme context
 * @param strength Blur strength
 * @returns CSS blur value
 */
export const getBlurStrength = (
  context: ThemeContext,
  strength: BlurStrength = 'standard'
): string => {
  // If it's a number, return as pixels
  if (typeof strength === 'number') {
    return `${strength}px`;
  }
  
  // Get from theme if available
  if (context.theme?.glass?.blurStrengths?.[strength]) {
    const themeValue = context.theme.glass.blurStrengths[strength];
    return typeof themeValue === 'number' ? `${themeValue}px` : themeValue;
  }
  
  // Get from default values
  const defaultValue = BLUR_STRENGTH_VALUES[strength];
  return typeof defaultValue === 'number' ? `${defaultValue}px` : defaultValue?.toString() || '8px';
};

/**
 * Get background opacity value
 * 
 * @param context Theme context
 * @param opacity Opacity value
 * @returns Numeric opacity value
 */
export const getBackgroundOpacity = (
  context: ThemeContext,
  opacity: string | number = 'medium'
): number => {
  // If it's a number, return directly
  if (typeof opacity === 'number') {
    return Math.max(0, Math.min(1, opacity)); // Clamp between 0 and 1
  }
  
  // Get from theme if available
  if (context.theme?.glass?.backgroundOpacities?.[opacity]) {
    return context.theme.glass.backgroundOpacities[opacity];
  }
  
  // Get from default values
  return BACKGROUND_OPACITY_VALUES[opacity] ?? 0.2;
};

/**
 * Get border opacity value
 * 
 * @param context Theme context
 * @param opacity Opacity value
 * @returns Numeric opacity value
 */
export const getBorderOpacity = (
  context: ThemeContext,
  opacity: string | number = 'medium'
): number => {
  // If it's a number, return directly
  if (typeof opacity === 'number') {
    return Math.max(0, Math.min(1, opacity)); // Clamp between 0 and 1
  }
  
  // Get from theme if available
  if (context.theme?.glass?.borderOpacities?.[opacity]) {
    return context.theme.glass.borderOpacities[opacity];
  }
  
  // Get from default values
  return BORDER_OPACITY_VALUES[opacity] ?? 0.2;
};

/**
 * Get glow intensity value
 * 
 * @param context Theme context
 * @param intensity Intensity value
 * @returns Numeric intensity value
 */
export const getGlowIntensity = (
  context: ThemeContext,
  intensity: string | number = 'medium'
): number => {
  // If it's a number, return directly
  if (typeof intensity === 'number') {
    return Math.max(0, Math.min(1, intensity)); // Clamp between 0 and 1
  }
  
  // Get from theme if available
  if (context.theme?.glass?.glowIntensities?.[intensity]) {
    return context.theme.glass.glowIntensities[intensity];
  }
  
  // Get from default values
  return GLOW_INTENSITY_VALUES[intensity] ?? 0.1;
};

/**
 * Get z-index for a layer
 * 
 * @param layer Z-Layer enum value
 * @param offset Optional offset to add to the z-index
 * @returns z-index value
 */
export const getZIndex = (layer: ZLayer, offset: number = 0): number => {
  const base = Z_INDEX_MAP[layer] || 0;
  return base + offset;
};

/**
 * Get transform for z-depth
 * 
 * @param depth Z-depth enum value
 * @returns CSS transform value
 */
export const getZDepthTransform = (depth: ZDepth): string => {
  return Z_DEPTH_TRANSFORM[depth] || 'translateZ(0)';
};

/**
 * Apply z-layer and depth to an element
 * 
 * @param layer Z-layer enum value
 * @param depth Z-depth enum value (optional)
 * @param offset Optional z-index offset
 * @returns CSS properties for z positioning
 */
export const zLayer = (
  layer: ZLayer,
  depth?: ZDepth,
  offset: number = 0
): ReturnType<typeof css> => {
  const zIndex = getZIndex(layer, offset);
  
  if (!depth) {
    return cssWithKebabProps`
      position: relative;
      z-index: ${zIndex};
    `;
  }
  
  const transform = getZDepthTransform(depth);
  
  return cssWithKebabProps`
    position: relative;
    z-index: ${zIndex};
    transform: ${transform};
  `;
};

/**
 * Create a color mode aware style
 * 
 * @param lightStyles Styles for light mode
 * @param darkStyles Styles for dark mode
 * @returns Color mode dependent styles
 */
export const colorModeAware = (
  lightStyles: string | ReturnType<typeof css>,
  darkStyles: string | ReturnType<typeof css>
): ReturnType<typeof css> => {
  return css`
    /* Light mode styles */
    [data-theme="light"] & {
      ${lightStyles}
    }
    
    /* Dark mode styles */
    [data-theme="dark"] & {
      ${darkStyles}
    }
    
    /* System preference styles (fallback) */
    @media (prefers-color-scheme: light) {
      :root:not([data-theme]) & {
        ${lightStyles}
      }
    }
    
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme]) & {
        ${darkStyles}
      }
    }
  `;
};

/**
 * Get a CSS color with transparency
 * 
 * @param color Base color (hex, rgb, etc.)
 * @param opacity Opacity value (0-1)
 * @returns RGBA color string
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // If already in rgba format, replace the alpha value
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }
  
  // If in rgb format, convert to rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  // If it's a hex color, convert to rgba
  if (color.startsWith('#')) {
    // Expand shorthand hex (e.g., #abc to #aabbcc)
    let hex = color;
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    
    // Parse the hex components
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Return as-is if not recognized
  return color;
};

/**
 * Create a CSS box shadow for elevation
 * 
 * @param level Elevation level (0-5)
 * @param isDarkMode Whether to use dark mode shadows
 * @returns CSS box-shadow value
 */
export const getElevationShadow = (level: number, isDarkMode = false): string => {
  // No shadow for level 0
  if (level === 0) {
    return 'none';
  }
  
  // Shadow values for different levels
  const darkShadows = [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.25)',
    '0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.25)',
    '0 10px 20px rgba(0, 0, 0, 0.5), 0 6px 6px rgba(0, 0, 0, 0.25)',
    '0 14px 28px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.25)',
    '0 19px 38px rgba(0, 0, 0, 0.5), 0 15px 12px rgba(0, 0, 0, 0.25)'
  ];
  
  const lightShadows = [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05)',
    '0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.05)',
    '0 14px 28px rgba(0, 0, 0, 0.2), 0 10px 10px rgba(0, 0, 0, 0.1)',
    '0 19px 38px rgba(0, 0, 0, 0.25), 0 15px 12px rgba(0, 0, 0, 0.1)'
  ];
  
  // Clamp level to valid range
  const validLevel = Math.max(0, Math.min(5, level));
  
  // Return appropriate shadow
  return isDarkMode 
    ? darkShadows[validLevel]
    : lightShadows[validLevel];
};

/**
 * Apply theme properties to a CSS block
 * 
 * @param callback Function that takes a theme and returns CSS properties or string
 * @returns A styled-components CSS block
 */
export const withTheme = (
  callback: (theme: Theme) => CSSProperties | string
) => {
  // Convert to string or CSSObject that styled-components can handle
  return (props: any) => {
    if (!props.theme) {
      return '';
    }
    
    const result = callback(props.theme);
    return result;
  };
};

/**
 * Generate CSS variables from a theme
 * 
 * @param theme Theme object
 * @returns CSS variables string
 */
export const generateThemeCssVars = (theme: Theme): string => {
  // Create CSS variables for colors
  let cssVars = Object.entries(theme.colors).map(([name, intensities]) => {
    return Object.entries(intensities).map(([intensity, color]) => {
      return `--color-${name}-${intensity}: ${color};`;
    }).join('\n');
  }).join('\n');
  
  // Add spacing variables
  cssVars += '\n' + Object.entries(theme.spacing.scale).map(([name, value]) => {
    return `--spacing-${name}: ${value}${theme.spacing.unit}px;`;
  }).join('\n');
  
  // Add typography variables
  cssVars += '\n--font-family: ${theme.typography.fontFamily};';
  cssVars += '\n' + Object.entries(theme.typography.sizes).map(([name, values]) => {
    return `--font-size-${name}: ${values.fontSize};
--line-height-${name}: ${values.lineHeight};`;
  }).join('\n');
  
  // Add border radius variables
  cssVars += '\n' + Object.entries(theme.borderRadius).map(([name, value]) => {
    return `--border-radius-${name}: ${value};`;
  }).join('\n');
  
  return cssVars;
};