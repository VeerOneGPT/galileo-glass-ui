/**
 * Galileo Glass UI - Core
 * 
 * Re-exports all core functionality for easier imports
 */

// Most of the exports are re-exported by the mixins module, so we'll use that
export * from './core/mixins';

// Export specific modules that may not be covered by mixins
export * from './core/types';
export * from './core/theme';

// Re-export the createThemeContext function but not the ThemeContext interface
export { createThemeContext } from './core/themeContext';

// Export all the style utilities needed by demo files
export {
  padding,
  margin,
  borderRadius,
  shadow,
  typography,
  flex,
  grid,
  truncate,
  responsive,
  visuallyHidden
} from './core/styleUtils';

// Export CSS helper utilities
export {
  withAlpha,
  hexToRGBA,
  parseColorWithAlpha
} from './core/colorUtils';

export {
  backdropFilter,
  fontSmoothing,
  userSelect,
  transform3d
} from './core/cssHelpers';

// Export theme utilities
export {
  getThemeColor,
  getBlurStrength,
  getBackgroundOpacity,
  colorModeAware,
  getColorWithOpacity,
  withTheme
} from './core/themeUtils';

// Re-export zSpaceLayer 
export { zSpaceLayer, ZSpaceLayerType, ZSpacePosition } from './core/mixins/depth/zSpaceLayer';

// Re-export glassGlow for backward compatibility
export { glassGlow } from './animations/keyframes/glass';

// Export zLayer alias to match the ZLayer enum
export { ZLayer as zLayer } from './core/types'; 