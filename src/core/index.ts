/**
 * Galileo Glass UI - Core
 * 
 * Core utilities and foundation for the Glass UI system.
 */

// CSS utilities
export { cssWithKebabProps } from './cssUtils';
export { withAlpha } from './colorUtils';

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
  GLOW_INTENSITY_VALUES
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
  TYPOGRAPHY_SIZES
} from './styleUtils';

// Glass mixins
export { glassSurface } from './mixins/glassSurface';
export { glowEffects as glassGlow } from './mixins/effects/glowEffects';
export { innerEffects as innerGlow } from './mixins/effects/innerEffects';
export { edgeEffects as edgeHighlight } from './mixins/effects/edgeEffects';

// Z-Space system
export { 
  ZLayer, 
  ZDepth, 
  zLayer, 
  zDepth, 
  zPerspective,
  ZSpaceProvider,
  useZSpace
} from './zspace';

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
  ThemeContext,
  Theme,
  ThemeOptions,
  AnimationOptions,
  TransitionOptions,
  StyleMixin,
  SpacingSize,
  BorderRadiusSize,
  ElevationLevel,
  TypographySize,
  FlexAlignment
} from './types';

// Version
export const version = '1.0.0';