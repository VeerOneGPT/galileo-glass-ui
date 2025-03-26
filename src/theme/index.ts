/**
 * Galileo Glass UI - Theme
 *
 * Comprehensive theme system for Glass UI.
 */

// Main theme provider with context architecture
export {
  ThemeProvider,
  // Export ThemeProvider as GlassThemeProvider for backwards compatibility
  ThemeProvider as GlassThemeProvider,
  useTheme,
  useColorMode,
  useThemeVariant,
  useStyleUtils,
  useGlassEffects,
  usePreferences,
  useResponsive,
  useThemeObserver,
  useThemeProviderPresence,
} from './ThemeProvider';

// Legacy Glass Context (for backward compatibility)
export { useGlass } from './GlassContext';

// Theme transition component for animation between themes
export { default as ThemeTransition } from './ThemeTransition';

// Performance monitoring tools
export { default as ThemePerformanceMonitor } from './ThemePerformanceMonitor';

// Theme tokens
export { colors, typography, spacing, shadows, borderRadius, zIndex, breakpoints } from './tokens';

// Theme constants
export {
  THEME_NAMES,
  THEME_VARIANTS,
  GLASS_QUALITY_TIERS,
  BLUR_STRENGTHS,
  GLOW_INTENSITIES,
  ANIMATION_PRESETS,
} from './constants';

// Version
export const themeVersion = '1.1.0';
