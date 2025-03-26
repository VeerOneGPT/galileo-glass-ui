/**
 * Theme Helper Utilities
 *
 * A set of utilities for providing compatibility between different theme context interfaces
 * in the Galileo Glass UI library.
 */

import { DefaultTheme } from 'styled-components';

import { ThemeContext as CoreThemeContext } from '../core/theme';
import { ThemeContext as UtilsThemeContext } from '../core/themeUtils';

/**
 * Unified ThemeContext type that combines the properties from both ThemeContext interfaces
 */
export type UnifiedThemeContext = Partial<CoreThemeContext> & Partial<UtilsThemeContext>;

/**
 * Adapter function that converts a ThemeContext from themeUtils.ts to a ThemeContext
 * that's compatible with theme.ts
 *
 * @param context ThemeContext from themeUtils
 * @returns ThemeContext compatible with theme.ts
 */
export function adaptThemeUtilsContext(context: UtilsThemeContext): CoreThemeContext {
  const theme = context?.theme || {};

  // Create getColor function
  const getColor = (path: string, fallback = ''): string => {
    const parts = path.split('.');
    const themeColors = (theme as any)?.colors || {};
    let current: any = themeColors;

    // Type guard to ensure we have an object with properties
    if (!current || typeof current !== 'object') {
      return fallback;
    }

    for (const part of parts) {
      if (current === undefined || current === null) {
        return fallback;
      }
      current = current[part];
    }

    return current !== undefined ? current : fallback;
  };

  // Create getSpacing function
  const getSpacing = (size: string | number): string => {
    if (typeof size === 'number') {
      const spacingUnit = (theme as any)?.spacing?.unit || 8;
      return `${size * spacingUnit}px`;
    }

    const themeSpacing = (theme as any)?.spacing || {};

    if (typeof size === 'string' && typeof themeSpacing === 'object') {
      // Safe access with index signature cast
      const spacingObj = themeSpacing as Record<string, any>;
      const spacingValue = spacingObj[size];
      return spacingValue ? String(spacingValue) : `${size}px`;
    }

    return typeof size === 'number' ? `${size}px` : size;
  };

  // Create getShadow function
  const getShadow = (level: number, color?: string): string => {
    const themeShadows = (theme as any)?.shadows || [];

    // Early return for missing shadows
    if (!Array.isArray(themeShadows) || !themeShadows[level]) {
      return 'none';
    }

    const shadow = themeShadows[level];

    // Replace color if provided and shadow is a string
    if (color && typeof shadow === 'string') {
      return shadow.replace(/rgba\([^)]+\)/g, color);
    }

    return String(shadow || 'none');
  };

  // Create getBorderRadius function
  const getBorderRadius = (size: string): string => {
    const themeBorderRadius = (theme as any)?.borderRadius || {};

    // Type-safe access with object type check
    if (typeof themeBorderRadius === 'object' && themeBorderRadius !== null) {
      // Use Record to provide an index signature
      const borderRadiusObj = themeBorderRadius as Record<string, any>;

      if (size in borderRadiusObj) {
        const borderValue = borderRadiusObj[size];
        return borderValue ? String(borderValue) : size;
      }
    }

    return size;
  };

  return {
    getColor,
    getSpacing,
    getShadow,
    getBorderRadius,
    colorMode: context.isDarkMode ? 'dark' : 'light',
    isDarkMode: context.isDarkMode,
    variant: context.variant,
    theme: theme as any,
    availableThemes: [],
  };
}

/**
 * Create a theme context that's compatible with both interfaces
 *
 * @param theme Theme object (can be any shape)
 * @returns A unified ThemeContext object
 */
export function createCompatibleThemeContext(
  theme: any = {}
): Omit<UnifiedThemeContext, 'theme'> & { theme: any } {
  // Create utils-compatible ThemeContext
  const utilsContext: UtilsThemeContext = {
    theme,
    isDarkMode: false,
    variant: 'default',
  };

  // Create core-compatible ThemeContext
  const coreContext = adaptThemeUtilsContext(utilsContext);

  // Merge them into a unified context
  return {
    ...coreContext,
    ...utilsContext,
  };
}

/**
 * Cast any theme context to be compatible with core/theme.ts ThemeContext
 *
 * @param context Any theme context
 * @returns A ThemeContext compatible with core/theme.ts
 */
export function asCoreThemeContext(context: any): CoreThemeContext {
  if (!context) {
    return {
      getColor: (path: string, fallback = '') => fallback,
      getSpacing: (size: string | number) => (typeof size === 'number' ? `${size}px` : size),
      getShadow: () => 'none',
      getBorderRadius: () => '0',
      colorMode: 'light',
      isDarkMode: false,
      theme: {} as DefaultTheme,
      availableThemes: [],
    };
  }

  if (typeof context.getColor === 'function') {
    // Already has core interface methods
    return context as CoreThemeContext;
  }

  // Create adapter
  return adaptThemeUtilsContext(context as UtilsThemeContext);
}

/**
 * Convert any theme context to a format compatible with both interfaces
 *
 * @param context Any theme context or theme object
 * @returns A unified ThemeContext
 */
export function asCompatibleThemeContext(context: any): UnifiedThemeContext {
  if (!context) {
    return createCompatibleThemeContext();
  }

  if (typeof context === 'object' && !context.theme && !context.getColor) {
    // Raw theme object
    return createCompatibleThemeContext(context);
  }

  // Context object with either utils or core interface
  const utilsProps =
    typeof context.isDarkMode !== 'undefined' && typeof context.theme !== 'undefined';
  const coreProps =
    typeof context.getColor === 'function' && typeof context.getSpacing === 'function';

  if (utilsProps && coreProps) {
    // Already has both interfaces
    return context as UnifiedThemeContext;
  }

  if (utilsProps) {
    // Convert utils interface to core
    const coreContext = adaptThemeUtilsContext(context as UtilsThemeContext);
    return { ...context, ...coreContext };
  }

  if (coreProps) {
    // Convert core interface to utils
    const utilsContext: UtilsThemeContext = {
      theme: (context as CoreThemeContext).theme || ({} as any),
      isDarkMode:
        (context as CoreThemeContext).isDarkMode ||
        (context as CoreThemeContext).colorMode === 'dark',
      variant: (context as CoreThemeContext).variant || 'default',
    };
    return { ...context, ...utilsContext };
  }

  // Unknown format, create new compatible context
  return createCompatibleThemeContext(context);
}
