/**
 * Galileo Glass UI - Core
 *
 * Core utilities and foundation for the Glass UI system.
 */

// CSS utilities
export { cssWithKebabProps } from './cssUtils';
export { withAlpha } from './colorUtils';
export { vendorPrefix, backdropFilter, fontSmoothing, userSelect, appearance } from './cssHelpers';

// Theme utilities
export { createThemeContext } from './themeContext';
export {
  getThemeColor,
  getBlurStrength,
  getBackgroundOpacity,
  getBorderOpacity,
  getGlowIntensity,
  getZIndex,
  getZDepthTransform,
  zLayer as zLayerUtil,
  colorModeAware,
  getColorWithOpacity,
  getElevationShadow,
  withTheme,
  generateThemeCssVars,
  BLUR_STRENGTH_VALUES,
  BACKGROUND_OPACITY_VALUES,
  BORDER_OPACITY_VALUES,
  GLOW_INTENSITY_VALUES,
} from './themeUtils';

// Style utilities
export {
  getSpacing,
  padding,
  margin,
  getBorderRadius,
  borderRadius,
  getShadow,
  shadow,
  getTypographyProps,
  typography,
  flex,
  grid,
  truncate,
  responsive,
  visuallyHidden,
  composeStyles,
  SPACING_UNITS,
  SPACING_BASE_UNIT,
  BORDER_RADIUS,
  TYPOGRAPHY_SIZES,
} from './styleUtils';

// Glass mixins
export { glassSurface } from './mixins/glassSurface';
export { glowEffects as glassGlow } from './mixins/effects/glowEffects';
export { innerGlow } from './mixins/effects/innerEffects';
export { edgeHighlight } from './mixins/effects/edgeEffects';

// Enhanced effects mixins
export { enhancedGlowEffects, enhancedGlow } from './effects/enhancedGlowEffects';
export { contextAwareGlass, adaptiveGlass } from './effects/contextAwareGlass';

// Z-Space system
export { ZLayer, ZDepth, zLayer, zDepth, zPerspective, ZSpaceProvider, useZSpace } from './zspace';
export { zSpaceLayer, ZSpaceLayerType, ZSpacePosition } from './mixins/depth/zSpaceLayer';

// Types
export type {
  CommonProps,
  PolymorphicProps,
  ThemeVariant,
  ColorMode,
  ColorIntensity,
  NamedColor,
  BlurStrength,
  GlassSurfaceProps,
  GlowEffectProps,
  InteractiveGlassProps,
  Theme,
  ThemeOptions,
  AnimationOptions,
  TransitionOptions,
} from './types';

// Add missing types
export type { ThemeContext } from './themeContext';

// Define missing utility types
export type StyleMixin = (...args: any[]) => any;
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type BorderRadiusSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'circle' | number;
export type ElevationLevel = 'none' | 'low' | 'medium' | 'high' | number;
export type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;
export type FlexAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

// Version
export const version = '1.0.0';
