/**
 * Core Type Definitions
 * 
 * TypeScript types used throughout the Glass UI system
 */
import { ReactNode, ElementType, CSSProperties, Ref } from 'react';
import { StyledComponent } from 'styled-components';

/**
 * Common component props interface
 */
export interface CommonProps {
  /**
   * CSS class name
   */
  className?: string;
  
  /**
   * Inline styles
   */
  style?: CSSProperties;
  
  /**
   * ID attribute
   */
  id?: string;
  
  /**
   * Data attributes
   */
  [key: `data-${string}`]: string | number | boolean;
}

/**
 * Common polymorphic component props
 * 
 * @template T The component element type
 */
export interface PolymorphicProps<T extends ElementType = 'div'> extends CommonProps {
  /**
   * Component element type
   */
  as?: T;
  
  /**
   * Forwarded ref
   */
  ref?: Ref<any>;
  
  /**
   * Children elements
   */
  children?: ReactNode;
  
  /**
   * All other props
   */
  [key: string]: any;
}

/**
 * Theme variants
 */
export type ThemeVariant = 'default' | 'marketing' | 'dashboard' | 'admin' | string;

/**
 * Color mode
 */
export type ColorMode = 'light' | 'dark' | 'system';

/**
 * Color intensity
 */
export type ColorIntensity = 
  'lightest' | 'lighter' | 'light' | 
  'main' | 
  'dark' | 'darker' | 'darkest';

/**
 * Named colors
 */
export type NamedColor = 
  'primary' | 'secondary' | 'tertiary' | 
  'success' | 'warning' | 'error' | 'info' | 
  'surface' | 'background' | 'text' | 
  'muted' | 'accent' | string;

/**
 * Glass blur strength
 */
export type BlurStrength = 
  'none' | 'minimal' | 'light' | 'standard' | 
  'medium' | 'enhanced' | 'strong' | 'extreme' | 
  number;

/**
 * Glass surface properties
 */
export interface GlassSurfaceProps {
  /**
   * Blur strength
   */
  blurStrength?: BlurStrength;
  
  /**
   * Background opacity
   */
  backgroundOpacity?: 'transparent' | 'lightest' | 'light' | 'medium' | 'high' | 'solid' | number;
  
  /**
   * Border opacity
   */
  borderOpacity?: 'none' | 'minimal' | 'subtle' | 'medium' | 'high' | number;
  
  /**
   * Elevation level
   */
  elevation?: 'none' | 'low' | 'medium' | 'high' | number;
  
  /**
   * Whether the surface is interactive
   */
  interactive?: boolean;
  
  /**
   * Whether to force dark mode
   */
  forceDarkMode?: boolean;
  
  /**
   * Whether the component should use reduced transparency for accessibility
   */
  reducedTransparency?: boolean;
}

/**
 * Glow effect properties
 */
export interface GlowEffectProps {
  /**
   * Glow color
   */
  color?: NamedColor | string;
  
  /**
   * Glow intensity
   */
  intensity?: 'minimal' | 'light' | 'medium' | 'strong' | 'extreme' | number;
  
  /**
   * Glow spread radius
   */
  spread?: number;
  
  /**
   * Glow position
   */
  position?: 'inner' | 'outer' | 'ambient' | 'edge';
  
  /**
   * Whether the glow is animated
   */
  animated?: boolean;
}

/**
 * Interactive glass effect properties
 */
export interface InteractiveGlassProps extends GlassSurfaceProps {
  /**
   * Hover effect
   */
  hoverEffect?: 'none' | 'glow' | 'brighten' | 'lift' | 'border' | 'scale';
  
  /**
   * Active effect
   */
  activeEffect?: 'none' | 'press' | 'darken' | 'glow' | 'border';
  
  /**
   * Focus effect
   */
  focusEffect?: 'none' | 'glow' | 'border' | 'outline';
  
  /**
   * Effect intensity
   */
  effectIntensity?: 'subtle' | 'medium' | 'strong';
}

/**
 * Z-Space layer names
 */
export enum ZLayer {
  /**
   * Background layer (lowest)
   */
  BACKGROUND = 'background',
  
  /**
   * Regular content
   */
  CONTENT = 'content',
  
  /**
   * Surface elements (cards, panels)
   */
  SURFACE = 'surface',
  
  /**
   * Overlay elements (alerts, snackbars)
   */
  OVERLAY = 'overlay',
  
  /**
   * Dropdowns and menus
   */
  DROPDOWN = 'dropdown',
  
  /**
   * Fixed elements (headers, navigation)
   */
  FIXED = 'fixed',
  
  /**
   * Dialogs and modals
   */
  MODAL = 'modal',
  
  /**
   * Tooltips and popovers
   */
  TOOLTIP = 'tooltip',
  
  /**
   * Highest layer (notifications, alerts)
   */
  TOP = 'top'
}

/**
 * Z-Space depth values
 */
export enum ZDepth {
  /**
   * Base level (no 3D transformation)
   */
  BASE = 'base',
  
  /**
   * Slightly depressed
   */
  DEPRESSED = 'depressed',
  
  /**
   * Slightly elevated
   */
  ELEVATED = 'elevated',
  
  /**
   * Floating above other elements
   */
  FLOATING = 'floating',
  
  /**
   * Highest elevation
   */
  HIGHEST = 'highest'
}

/**
 * Map of z-index values for each layer
 */
export const Z_INDEX_MAP: Record<ZLayer, number> = {
  [ZLayer.BACKGROUND]: 0,
  [ZLayer.CONTENT]: 1,
  [ZLayer.SURFACE]: 10,
  [ZLayer.OVERLAY]: 20,
  [ZLayer.DROPDOWN]: 30,
  [ZLayer.FIXED]: 40,
  [ZLayer.MODAL]: 50,
  [ZLayer.TOOLTIP]: 60,
  [ZLayer.TOP]: 70
};

/**
 * Map of CSS transforms for 3D depth
 */
export const Z_DEPTH_TRANSFORM: Record<ZDepth, string> = {
  [ZDepth.BASE]: 'translateZ(0)',
  [ZDepth.DEPRESSED]: 'translateZ(-5px)',
  [ZDepth.ELEVATED]: 'translateZ(5px)',
  [ZDepth.FLOATING]: 'translateZ(15px)',
  [ZDepth.HIGHEST]: 'translateZ(30px)'
};

/**
 * Color palette interface
 */
export interface ColorPalette {
  [key: string]: {
    [intensity in ColorIntensity]?: string;
  };
}

/**
 * Typography options
 */
export interface TypographyOptions {
  /**
   * Font family
   */
  fontFamily: string;
  
  /**
   * Font sizes for different elements
   */
  sizes: {
    [key: string]: {
      fontSize: string;
      lineHeight: string;
      fontWeight?: number | string;
      letterSpacing?: string;
    }
  };
  
  /**
   * Font weights
   */
  weights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

/**
 * Theme options
 */
export interface ThemeOptions {
  /**
   * Color palette
   */
  colors: ColorPalette;
  
  /**
   * Typography settings
   */
  typography: TypographyOptions;
  
  /**
   * Spacing scale
   */
  spacing: {
    unit: number;
    scale: Record<string, number>;
  };
  
  /**
   * Border radius scale
   */
  borderRadius: Record<string, string>;
  
  /**
   * Shadows scale
   */
  shadows: Record<string, string>;
  
  /**
   * Z-index settings
   */
  zIndex: {
    base: number;
    layers: Record<string, number>;
  };
  
  /**
   * Glass effect settings
   */
  glass: {
    blurStrengths: Record<string, string | number>;
    backgroundOpacities: Record<string, number>;
    borderOpacities: Record<string, number>;
    glowIntensities: Record<string, number>;
  };
  
  /**
   * Breakpoints for responsive design
   */
  breakpoints: {
    values: Record<string, number>;
    unit: string;
  };
  
  /**
   * Color mode (light or dark)
   */
  colorMode: ColorMode;
  
  /**
   * Theme variant
   */
  variant: ThemeVariant;
}

/**
 * Theme object extended from options with derived values
 */
export interface Theme extends ThemeOptions {
  /**
   * Unique theme ID
   */
  id: string;
  
  /**
   * Is dark mode active
   */
  isDarkMode: boolean;
  
  /**
   * Current theme variant
   */
  variant: ThemeVariant;
  
  /**
   * Utility functions
   */
  utils: {
    /**
     * Get a color from the palette
     */
    getColor: (color: NamedColor, intensity?: ColorIntensity) => string;
    
    /**
     * Get spacing value
     */
    getSpacing: (size: string | number) => string;
    
    /**
     * Get typography values
     */
    getTypography: (variant: string) => CSSProperties;
    
    /**
     * Get responsive value based on breakpoint
     */
    getResponsiveValue: <T>(values: Record<string, T>) => T;
  };
}

/**
 * Branded component type for Glass UI components
 */
export type GlassComponent<P> = StyledComponent<
  ElementType,
  {
    theme?: Theme;
  },
  P & { theme?: Theme }
>;

/**
 * Animation options interface
 */
export interface AnimationOptions {
  /**
   * Animation duration in seconds
   */
  duration?: number;
  
  /**
   * Animation easing function
   */
  easing?: string;
  
  /**
   * Animation delay in seconds
   */
  delay?: number;
  
  /**
   * Number of iterations
   */
  iterations?: number | 'infinite';
  
  /**
   * Direction of the animation
   */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  
  /**
   * Fill mode of the animation
   */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  
  /**
   * Whether to reduce motion for accessibility
   */
  reduceMotion?: boolean;
  
  /**
   * Alternative animation for reduced motion
   */
  reducedMotionAlternative?: any;
}

/**
 * Transition options interface
 */
export interface TransitionOptions {
  /**
   * Properties to transition
   */
  properties?: string[];
  
  /**
   * Transition duration in seconds
   */
  duration?: number;
  
  /**
   * Transition easing function
   */
  easing?: string;
  
  /**
   * Transition delay in seconds
   */
  delay?: number;
}