/**
 * Theme Tokens
 * 
 * Design tokens for the Glass UI theme system
 */

/**
 * Color tokens
 */
export const colors = {
  // Brand colors
  nebula: {
    // Primary colors
    accentPrimary: '#6366F1',
    accentSecondary: '#8B5CF6',
    accentTertiary: '#EC4899',
    
    // State colors
    stateCritical: '#EF4444',
    stateOptimal: '#10B981',
    stateAttention: '#F59E0B',
    stateInformational: '#3B82F6',
    
    // Neutral colors
    neutralBackground: '#0F172A',
    neutralForeground: '#E2E8F0',
    neutralBorder: 'rgba(255, 255, 255, 0.12)',
    neutralSurface: 'rgba(15, 23, 42, 0.7)',
  },
  
  // Extended primary palette
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main brand color
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  
  // Extended secondary palette
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Main secondary color
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },
  
  // Accent color palette
  accent: {
    50: '#FCE7F3',
    100: '#FBCFE8',
    200: '#F9A8D4',
    300: '#F472B6',
    400: '#EC4899', // Main accent color
    500: '#DB2777',
    600: '#BE185D',
    700: '#9D174D',
    800: '#831843',
    900: '#500724',
  },
  
  // Success color palette
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main success color
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },
  
  // Error color palette
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
  
  // Warning color palette
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },
  
  // Info color palette
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main info color
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  
  // Grayscale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#0A0C14',
  },
  
  // Glass specific colors
  glass: {
    // Light mode glass colors
    light: {
      background: 'rgba(255, 255, 255, 0.65)',
      border: 'rgba(255, 255, 255, 0.2)',
      highlight: 'rgba(255, 255, 255, 0.8)',
      shadow: 'rgba(0, 0, 0, 0.03)',
      glow: 'rgba(255, 255, 255, 0.8)',
    },
    // Dark mode glass colors
    dark: {
      background: 'rgba(15, 23, 42, 0.65)',
      border: 'rgba(255, 255, 255, 0.08)',
      highlight: 'rgba(255, 255, 255, 0.08)',
      shadow: 'rgba(0, 0, 0, 0.25)',
      glow: 'rgba(139, 92, 246, 0.15)',
    },
    // Tinted glass variations
    tints: {
      blue: 'rgba(59, 130, 246, 0.08)',
      purple: 'rgba(139, 92, 246, 0.08)',
      pink: 'rgba(236, 72, 153, 0.08)',
      green: 'rgba(16, 185, 129, 0.08)',
      amber: 'rgba(245, 158, 11, 0.08)',
    }
  }
};

/**
 * Typography tokens
 */
export const typography = {
  // Font families
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    code: "'SF Mono', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    display: "'Inter', system-ui, sans-serif",
    mono: "'SF Mono', SFMono-Regular, ui-monospace, 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  
  // Font weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // Font sizes
  fontSize: {
    xxs: '0.625rem', // 10px
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Text case transformations
  textCase: {
    none: 'none',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  },
  
  // Text decoration
  textDecoration: {
    none: 'none',
    underline: 'underline',
    lineThrough: 'line-through',
  },
  
  // Paragraph spacing
  paragraphSpacing: {
    default: '1em',
    tight: '0.75em',
    loose: '1.5em',
  },
  
  // Common text styles
  styles: {
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '-0.005em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
};

/**
 * Spacing tokens
 */
export const spacing = {
  // Base spacing units
  xxs: '0.25rem', // 4px
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
  '4xl': '6rem',  // 96px
  '5xl': '8rem',  // 128px
  
  // Numeric spacing scale (for more fine-grained control)
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

/**
 * Shadow tokens
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  
  // Glass-specific shadows
  glass: {
    light: '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.15)',
    medium: '0 12px 40px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
    heavy: '0 16px 48px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
    inner: 'inset 0 1px 4px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.15)',
    glow: '0 0 20px rgba(139, 92, 246, 0.15)',
    highlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  
  // Colored shadows
  colored: {
    primary: '0 8px 16px rgba(99, 102, 241, 0.15)',
    success: '0 8px 16px rgba(16, 185, 129, 0.15)',
    error: '0 8px 16px rgba(239, 68, 68, 0.15)',
    warning: '0 8px 16px rgba(245, 158, 11, 0.15)',
    info: '0 8px 16px rgba(59, 130, 246, 0.15)',
  },
};

/**
 * Breakpoint tokens
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
  '2xl': 2560,
  
  // Device specific breakpoints
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
};

/**
 * Border radius tokens
 */
export const borderRadius = {
  none: '0',
  xs: '0.0625rem', // 1px
  sm: '0.125rem',  // 2px
  md: '0.25rem',   // 4px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
  
  // Specific border radius values
  card: '0.75rem',
  button: '0.5rem',
  input: '0.5rem',
  badge: '0.25rem',
  tooltip: '0.25rem',
};

/**
 * Z-index tokens
 */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  glacial: 2000, // For elements that need to appear above everything else
};

/**
 * Opacity tokens
 */
export const opacity = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
  
  // Glass-specific opacities
  glass: {
    ultraLight: '0.1',
    light: '0.25',
    medium: '0.45',
    heavy: '0.65',
    solid: '0.85',
  },
};

/**
 * Blur tokens
 */
export const blur = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
  
  // Glass-specific blurs
  glass: {
    light: '8px',
    medium: '16px',
    heavy: '24px',
  },
};

/**
 * Animation duration tokens
 */
export const duration = {
  fastest: '50ms',
  faster: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',
  
  // Specific durations
  tooltip: '200ms',
  modal: '300ms',
  transition: '250ms',
};

/**
 * Animation easing tokens
 */
export const easing = {
  // Standard easing functions
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Natural motion
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.375)',
  elastic: 'cubic-bezier(0.5, 0.75, 0.25, 1.25)',
  
  // Simple curves
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

/**
 * Media query tokens
 */
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  
  // Device-specific queries
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
  tablet: `@media (min-width: ${breakpoints.mobile + 1}px) and (max-width: ${breakpoints.tablet}px)`,
  desktop: `@media (min-width: ${breakpoints.tablet + 1}px)`,
  
  // Feature queries
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  highContrast: '@media (prefers-contrast: more)',
  
  // Viewport orientation
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
};

/**
 * Grid tokens
 */
export const grid = {
  columns: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  gutter: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
  },
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },
};

/**
 * Export all tokens as a unified theme object
 */
export const tokens = {
  colors,
  typography,
  spacing,
  shadows,
  breakpoints,
  borderRadius,
  zIndex,
  opacity,
  blur,
  duration,
  easing,
  mediaQueries,
  grid,
};