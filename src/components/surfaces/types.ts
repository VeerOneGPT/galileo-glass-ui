/**
 * Glass Surface Components Types
 *
 * Type definitions for the specialized glass surface components.
 */

import React from 'react';

/**
 * Base props for glass surface components
 */
export interface GlassSurfaceBaseProps {
  /** The content of the component */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** The elevation of the surface */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
  /** The blur strength of the glass effect */
  blurStrength?: 'none' | 'light' | 'standard' | 'strong';
  
  /** The opacity of the glass surface */
  opacity?: 'low' | 'medium' | 'high';
  
  /** The border opacity */
  borderOpacity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong';
  
  /** Border width in pixels */
  borderWidth?: number;
  
  /** If true, the component will take the full width of its container */
  fullWidth?: boolean;
  
  /** If true, the component will take the full height of its container */
  fullHeight?: boolean;
  
  /** The border radius of the component */
  borderRadius?: number | string;
  
  /** If true, applies a hover effect */
  interactive?: boolean;
  
  /** Padding around the content */
  padding?: string | number;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * Props for DimensionalGlass component
 */
export interface DimensionalGlassProps extends GlassSurfaceBaseProps {
  /** The depth effect intensity (0-1) */
  depth?: number;
  
  /** If true, adds parallax effect on hover */
  parallax?: boolean;
  
  /** If true, adds shadow that changes on hover */
  dynamicShadow?: boolean;
  
  /** If true, adds subtle animation to the component */
  animate?: boolean;
  
  /** The z-index layer of the component */
  zIndex?: number;
  
  /** Background color (rgba format recommended) */
  backgroundColor?: string;
}

/**
 * Props for HeatGlass component
 */
export interface HeatGlassProps extends GlassSurfaceBaseProps {
  /** The intensity of the heat effect (0-1) */
  intensity?: number;
  
  /** The color of the heat effect */
  heatColor?: string;
  
  /** The center point of the heat effect (e.g., '50% 50%') */
  heatCenter?: string;
  
  /** If true, the heat effect animates */
  animate?: boolean;
  
  /** The speed of the animation (1-10) */
  animationSpeed?: number;
  
  /** Background color (rgba format recommended) */
  backgroundColor?: string;
}

/**
 * Props for FrostedGlass component
 */
export interface FrostedGlassProps extends GlassSurfaceBaseProps {
  /** The intensity of the frost effect (0-1) */
  intensity?: number;
  
  /** The color tint of the frost effect */
  frostColor?: string;
  
  /** If true, adds a subtle frost animation */
  animate?: boolean;
  
  /** The pattern of the frost ('noise', 'lines', 'crystals') */
  pattern?: 'noise' | 'lines' | 'crystals';
  
  /** Background color (rgba format recommended) */
  backgroundColor?: string;
}

/**
 * Props for PageGlassContainer component
 */
export interface PageGlassContainerProps extends GlassSurfaceBaseProps {
  /** If true, adds a scroll fade effect */
  scrollFade?: boolean;
  
  /** The background image or gradient */
  backgroundImage?: string;
  
  /** If true, adds depth to child elements */
  dimensionalChildren?: boolean;
  
  /** If true, applies glass effect to the whole page */
  fullPage?: boolean;
  
  /** The maximum width of the container */
  maxWidth?: string | number;
  
  /** Background color (rgba format recommended) */
  backgroundColor?: string;
}

/**
 * Props for WidgetGlass component
 */
export interface WidgetGlassProps extends GlassSurfaceBaseProps {
  /** The type of widget */
  widgetType?: 'card' | 'panel' | 'modal' | 'tooltip';
  
  /** If true, adds a highlight glow on hover */
  highlightOnHover?: boolean;
  
  /** If true, adds subtle animation on mount */
  animateOnMount?: boolean;
  
  /** The priority/importance of the widget */
  priority?: 'low' | 'medium' | 'high';
  
  /** Background color (rgba format recommended) */
  backgroundColor?: string;
}

/**
 * Props for AtmosphericBackground component
 */
export interface AtmosphericBackgroundProps {
  /** The content of the component */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** The base background color */
  baseColor?: string;
  
  /** The gradient colors */
  gradientColors?: string[];
  
  /** The intensity of the atmospheric effect (0-1) */
  intensity?: number;
  
  /** If true, animates the background */
  animate?: boolean;
  
  /** Animation duration in seconds */
  animationDuration?: number;
  
  /** If true, the animation will respond to cursor movement */
  interactive?: boolean;
  
  /** If true, applies a blur effect */
  blur?: boolean;
  
  /** Blur amount in pixels */
  blurAmount?: number;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * Props for ParticleBackground component
 */
export interface ParticleBackgroundProps {
  /** The content of the component */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** The base background color */
  baseColor?: string;
  
  /** The particle color */
  particleColor?: string;
  
  /** The number of particles */
  particleCount?: number;
  
  /** The size of particles */
  particleSize?: number;
  
  /** The speed of particle movement */
  particleSpeed?: number;
  
  /** If true, particles will connect with lines */
  connectParticles?: boolean;
  
  /** If true, particles will respond to cursor movement */
  interactive?: boolean;
  
  /** If true, applies a blur effect to the background */
  blur?: boolean;
  
  /** Blur amount in pixels */
  blurAmount?: number;
  
  /** Additional props */
  [key: string]: any;
}