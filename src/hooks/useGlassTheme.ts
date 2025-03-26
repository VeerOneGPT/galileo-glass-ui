import { useContext, useMemo } from 'react';
import { createContext } from 'react';

// Define theme types
export type ColorMode = 'light' | 'dark' | 'system';
export type ThemeVariant = 'default' | 'dashboard' | 'marketing' | 'minimal' | 'immersive';

// Define theme colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  divider: string;
}

// Define theme typography
export interface ThemeTypography {
  fontFamily: string;
  fontWeightLight: number;
  fontWeightRegular: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  h1: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  h2: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  h3: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  h4: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  h5: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  h6: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  body1: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  body2: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  button: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
    textTransform: string;
  };
  caption: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
}

// Define theme spacing
export interface ThemeSpacing {
  unit: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

// Define theme effects
export interface ThemeEffects {
  borderRadius: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  boxShadow: {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transition: {
    shortest: string;
    shorter: string;
    short: string;
    standard: string;
    complex: string;
  };
  glassEffects: {
    blur: {
      light: string;
      standard: string;
      strong: string;
    };
    opacity: {
      light: number;
      medium: number;
      heavy: number;
    };
    glow: {
      light: string;
      medium: string;
      strong: string;
    };
  };
}

// Define theme options
export interface ThemeOptions {
  colorMode: ColorMode;
  themeVariant: ThemeVariant;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  effects: ThemeEffects;
}

// Define theme context value
export interface GlassThemeContextValue {
  colorMode: ColorMode;
  themeVariant: ThemeVariant;
  theme: ThemeOptions;
  setColorMode: (mode: ColorMode) => void;
  setThemeVariant: (variant: ThemeVariant) => void;
  isDarkMode: boolean;
}

// Default typography
const defaultTypography: ThemeTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
};

// Default spacing
const defaultSpacing: ThemeSpacing = {
  unit: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Default effects
const defaultEffects: ThemeEffects = {
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },
  boxShadow: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.18)',
  },
  transition: {
    shortest: '0.1s',
    shorter: '0.2s',
    short: '0.3s',
    standard: '0.4s',
    complex: '0.5s',
  },
  glassEffects: {
    blur: {
      light: '5px',
      standard: '10px',
      strong: '20px',
    },
    opacity: {
      light: 0.1,
      medium: 0.2,
      heavy: 0.3,
    },
    glow: {
      light: '0 0 10px rgba(255, 255, 255, 0.1)',
      medium: '0 0 20px rgba(255, 255, 255, 0.15)',
      strong: '0 0 30px rgba(255, 255, 255, 0.2)',
    },
  },
};

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#6366F1', // Indigo
  secondary: '#8B5CF6', // Violet
  success: '#10B981', // Emerald
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  background: '#F9FAFB', // Gray 50
  surface: '#FFFFFF', // White
  text: {
    primary: '#1F2937', // Gray 800
    secondary: '#4B5563', // Gray 600
    disabled: '#9CA3AF', // Gray 400
  },
  border: '#E5E7EB', // Gray 200
  divider: '#E5E7EB', // Gray 200
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#818CF8', // Lighter Indigo
  secondary: '#A78BFA', // Lighter Violet
  success: '#34D399', // Lighter Emerald
  error: '#F87171', // Lighter Red
  warning: '#FBBF24', // Lighter Amber
  info: '#60A5FA', // Lighter Blue
  background: '#111827', // Gray 900
  surface: '#1F2937', // Gray 800
  text: {
    primary: '#F9FAFB', // Gray 50
    secondary: '#E5E7EB', // Gray 200
    disabled: '#6B7280', // Gray 500
  },
  border: '#374151', // Gray 700
  divider: '#374151', // Gray 700
};

// Create theme for specified color mode and variant
const createTheme = (colorMode: ColorMode, themeVariant: ThemeVariant): ThemeOptions => {
  const isDarkMode = colorMode === 'dark' || 
    (colorMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const baseColors = isDarkMode ? darkColors : lightColors;
  
  // Apply variant-specific adjustments
  let variantColors = { ...baseColors };
  
  switch (themeVariant) {
    case 'dashboard':
      // More saturation for dashboard
      variantColors = {
        ...variantColors,
        primary: isDarkMode ? '#818CF8' : '#4F46E5',
        background: isDarkMode ? '#0F172A' : '#F8FAFC',
      };
      break;
      
    case 'marketing':
      // More contrast for marketing
      variantColors = {
        ...variantColors,
        primary: isDarkMode ? '#818CF8' : '#4338CA',
        secondary: isDarkMode ? '#A78BFA' : '#7C3AED',
      };
      break;
      
    case 'minimal':
      // More subtle for minimal
      variantColors = {
        ...variantColors,
        primary: isDarkMode ? '#818CF8' : '#6366F1',
        background: isDarkMode ? '#111827' : '#FFFFFF',
      };
      break;
      
    case 'immersive':
      // Deeper colors for immersive
      variantColors = {
        ...variantColors,
        primary: isDarkMode ? '#818CF8' : '#4F46E5',
        secondary: isDarkMode ? '#A78BFA' : '#7C3AED',
        background: isDarkMode ? '#0F172A' : '#F1F5F9',
      };
      break;
      
    default:
      break;
  }
  
  return {
    colorMode,
    themeVariant,
    colors: variantColors,
    typography: defaultTypography,
    spacing: defaultSpacing,
    effects: defaultEffects,
  };
};

// Default theme
const defaultTheme = createTheme('light', 'default');

// Create theme context
export const GlassThemeContext = createContext<GlassThemeContextValue>({
  colorMode: 'light',
  themeVariant: 'default',
  theme: defaultTheme,
  setColorMode: () => {},
  setThemeVariant: () => {},
  isDarkMode: false,
});

/**
 * Hook to access the current theme
 * 
 * @returns The current theme and methods to change it
 */
export const useGlassTheme = (): GlassThemeContextValue => {
  const context = useContext(GlassThemeContext);
  
  if (!context) {
    throw new Error('useGlassTheme must be used within a GlassThemeProvider');
  }
  
  return context;
};

/**
 * Hook to access a specific theme color
 * 
 * @param colorKey - The color key to retrieve
 * @returns The color value from the current theme
 */
export const useThemeColor = (
  colorKey: keyof ThemeColors | 'text.primary' | 'text.secondary' | 'text.disabled'
): string => {
  const { theme } = useGlassTheme();
  
  // Handle nested text properties
  if (colorKey === 'text.primary') {
    const primary = theme.colors.text?.primary;
    return typeof primary === 'string' ? primary : (primary as any)?.primary || '#000000';
  }
  
  if (colorKey === 'text.secondary') {
    const secondary = theme.colors.text?.secondary;
    return typeof secondary === 'string' ? secondary : (secondary as any)?.secondary || '#666666';
  }
  
  if (colorKey === 'text.disabled') {
    const disabled = theme.colors.text?.disabled;
    return typeof disabled === 'string' ? disabled : (disabled as any)?.disabled || '#999999';
  }
  
  // Handle regular color properties
  const color = theme.colors[colorKey as keyof ThemeColors];
  return typeof color === 'string' ? color : (color as any)?.main || '#666666';
};

/**
 * Hook to get all theme color values
 * 
 * @returns All colors from the current theme
 */
export const useThemeColors = (): ThemeColors => {
  const { theme } = useGlassTheme();
  return theme.colors;
};

/**
 * Hook to get spacing values from the theme
 * 
 * @returns The spacing configuration from the current theme
 */
export const useThemeSpacing = (): ThemeSpacing => {
  const { theme } = useGlassTheme();
  return theme.spacing;
};

/**
 * Hook to get a spacing value by scale
 * 
 * @param scale - The spacing scale (number will be multiplied by unit)
 * @returns The calculated spacing value in pixels
 */
export const useSpacing = (scale: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number => {
  const { theme } = useGlassTheme();
  
  if (typeof scale === 'number') {
    return theme.spacing.unit * scale;
  }
  
  return theme.spacing[scale];
};

/**
 * Hook to get glass effect values
 * 
 * @returns Glass effect configuration from the current theme
 */
export const useGlassEffectValues = (): ThemeEffects['glassEffects'] => {
  const { theme } = useGlassTheme();
  return theme.effects.glassEffects;
};

/**
 * Hook to check if dark mode is active
 * 
 * @returns True if dark mode is active
 */
export const useIsDarkMode = (): boolean => {
  const { isDarkMode } = useGlassTheme();
  return isDarkMode;
};

export default useGlassTheme;