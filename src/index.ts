/**
 * Galileo Glass UI
 *
 * A comprehensive UI system for creating beautiful glass morphism interfaces
 * with React and styled-components.
 */

// Explicitly re-export components to avoid conflicts
export * from './components';

// Explicitly re-export core modules
export { createThemeContext } from './core/themeContext';

// Re-export mixins for backward compatibility
export { 
  glassSurface, 
  glassBorder,
  glowEffects, 
  innerGlow, 
  interactiveGlass,
  zSpaceLayer 
} from './core/mixins';

// Import GlassSurfaceOptions from the correct file
export type { GlassSurfaceOptions } from './core/mixins/glassSurface';

// Re-export core types
export type { 
  GlassSurfaceProps, 
  Theme, 
  ThemeVariant, 
  ColorMode,
  ThemeOptions
} from './core/types';

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
export { 
  accessibleAnimation, 
  animateWithPhysics, 
  useZSpaceAnimation,
  springAnimation
} from './animations';

// Explicitly re-export hooks
export { 
  useGlassTheme, 
  usePhysicsInteraction, 
  useOrchestration,
  useGalileoPhysicsEngine
} from './hooks';

// Re-export physics engine types
export type {
  PhysicsBodyOptions,
  PhysicsBodyState,
  CollisionEvent,
  Vector2D,
  UnsubscribeFunction,
  GalileoPhysicsEngineAPI
} from './animations/physics/engineTypes';

// Main version (consolidated)
export const version = '1.0.4'; // Updated package version
