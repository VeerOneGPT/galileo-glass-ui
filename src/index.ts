/**
 * Galileo Glass UI
 *
 * A comprehensive UI system for creating beautiful glass morphism interfaces
 * with React and styled-components.
 */

// Explicitly re-export components to avoid conflicts
export * from './components';

// Explicitly re-export core modules
export { createThemeContext } from './core';
export type { GlassSurfaceProps, Theme, ThemeVariant, ColorMode } from './core';

// Explicitly re-export theme modules
export {
  ThemeProvider,
  GlassThemeProvider,
  useTheme,
  useColorMode,
  useThemeVariant,
  usePreferences,
  useResponsive,
  ThemeTransition,
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} from './theme';

// Explicitly re-export animations
export { accessibleAnimation, animateWithPhysics, useZSpaceAnimation } from './animations';

// Explicitly re-export hooks
export { useGlassTheme, usePhysicsInteraction, useOrchestration } from './hooks';

// Version
export const version = '1.0.0';
