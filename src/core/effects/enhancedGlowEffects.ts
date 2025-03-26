/**
 * Enhanced Glow Effects
 *
 * Advanced glow and reflection effects for glass UI elements with dynamic lighting features.
 */
import { css } from 'styled-components';

import { withAlpha } from '../colorUtils';
import { cssWithKebabProps } from '../cssUtils';
import { ThemeContext } from '../themeContext';

/**
 * Enhanced glow effect options
 */
export interface EnhancedGlowOptions {
  /** Base glow color */
  color?: string;

  /** Secondary glow color for multi-color effects */
  secondaryColor?: string;

  /** Glow intensity (0-1) */
  intensity?: number | 'subtle' | 'medium' | 'strong' | 'extreme';

  /** Glow radius in pixels */
  radius?: number;

  /** Whether the glow should pulse */
  pulsing?: boolean;

  /** Pulse animation speed in seconds */
  pulseSpeed?: number;

  /** Pulse animation pattern */
  pulsePattern?: 'sine' | 'exponential' | 'bounce' | 'flicker';

  /** Enable inner glow */
  innerGlow?: boolean;

  /** Inner glow intensity (0-1) */
  innerGlowIntensity?: number;

  /** Enable outer glow */
  outerGlow?: boolean;

  /** Outer glow intensity (0-1) */
  outerGlowIntensity?: number;

  /** Enable edge glow */
  edgeGlow?: boolean;

  /** Edge glow intensity (0-1) */
  edgeGlowIntensity?: number;

  /** Enable directional glow */
  directional?: boolean;

  /** Direction angle in degrees */
  angle?: number;

  /** Enable layered glow */
  layered?: boolean;

  /** Number of layers for layered glow */
  layers?: number;

  /** Enable animated glow */
  animated?: boolean;

  /** Animation type */
  animationType?: 'rotate' | 'shift' | 'breathe' | 'wave' | 'rainbow';

  /** Animation duration in seconds */
  animationDuration?: number;

  /** Enable responsive intensity (adjusts with screen size) */
  responsiveIntensity?: boolean;

  /** Enable blur for softer glow */
  blurred?: boolean;

  /** Blur amount in pixels */
  blurAmount?: number;

  /** Enable 3D lighting effect */
  enable3D?: boolean;

  /** Theme context */
  themeContext?: ThemeContext;
}

/**
 * Default enhanced glow options
 */
const DEFAULT_GLOW_OPTIONS: EnhancedGlowOptions = {
  intensity: 'medium',
  radius: 15,
  pulsing: false,
  pulseSpeed: 2,
  pulsePattern: 'sine',
  innerGlow: false,
  innerGlowIntensity: 0.3,
  outerGlow: true,
  outerGlowIntensity: 0.7,
  edgeGlow: false,
  edgeGlowIntensity: 0.5,
  directional: false,
  angle: 45,
  layered: false,
  layers: 3,
  animated: false,
  animationType: 'breathe',
  animationDuration: 3,
  responsiveIntensity: false,
  blurred: true,
  blurAmount: 8,
  enable3D: false,
};

/**
 * Converts intensity string to numeric value
 */
const getIntensityValue = (
  intensity: number | 'subtle' | 'medium' | 'strong' | 'extreme'
): number => {
  if (typeof intensity === 'number') return intensity;

  switch (intensity) {
    case 'subtle':
      return 0.3;
    case 'medium':
      return 0.5;
    case 'strong':
      return 0.7;
    case 'extreme':
      return 0.9;
    default:
      return 0.5;
  }
};

/**
 * Create a pulsing glow animation
 */
const createPulseAnimation = (
  color: string,
  radius: number,
  intensity: number,
  pulseSpeed: number,
  pattern: 'sine' | 'exponential' | 'bounce' | 'flicker'
): ReturnType<typeof css> => {
  // Base color with alpha
  const baseAlpha = Math.min(intensity * 0.8, 0.8);
  const maxAlpha = Math.min(intensity * 1.2, 0.9);
  const baseColor = withAlpha(color, baseAlpha);
  const peakColor = withAlpha(color, maxAlpha);

  let keyframes: string;

  switch (pattern) {
    case 'exponential':
      // Quick rise, slow fall
      keyframes = `
        @keyframes pulse-glow-exp {
          0% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
          20% { box-shadow: 0 0 ${radius * 1.1}px 0 ${peakColor}; }
          100% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
        }
      `;
      return cssWithKebabProps`
        ${keyframes}
        animation: pulse-glow-exp ${pulseSpeed}s cubic-bezier(0.11, 0, 0.5, 0) infinite;
      `;

    case 'bounce':
      // Bouncy effect
      keyframes = `
        @keyframes pulse-glow-bounce {
          0% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
          20% { box-shadow: 0 0 ${radius * 1.2}px 0 ${peakColor}; }
          28% { box-shadow: 0 0 ${radius * 0.9}px 0 ${baseColor}; }
          36% { box-shadow: 0 0 ${radius * 1.1}px 0 ${peakColor}; }
          100% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
        }
      `;
      return cssWithKebabProps`
        ${keyframes}
        animation: pulse-glow-bounce ${pulseSpeed}s ease-in-out infinite;
      `;

    case 'flicker':
      // Random flickering
      keyframes = `
        @keyframes pulse-glow-flicker {
          0% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
          10% { box-shadow: 0 0 ${radius * 1.2}px 0 ${peakColor}; }
          15% { box-shadow: 0 0 ${radius * 0.8}px 0 ${baseColor}; }
          20% { box-shadow: 0 0 ${radius * 1.1}px 0 ${withAlpha(color, maxAlpha * 0.9)}; }
          35% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
          40% { box-shadow: 0 0 ${radius * 1.3}px 0 ${peakColor}; }
          45% { box-shadow: 0 0 ${radius * 0.9}px 0 ${baseColor}; }
          100% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
        }
      `;
      return cssWithKebabProps`
        ${keyframes}
        animation: pulse-glow-flicker ${pulseSpeed * 1.5}s ease-in-out infinite;
      `;

    case 'sine':
    default:
      // Smooth sine wave
      keyframes = `
        @keyframes pulse-glow-sine {
          0% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
          50% { box-shadow: 0 0 ${radius * 1.2}px 0 ${peakColor}; }
          100% { box-shadow: 0 0 ${radius}px 0 ${baseColor}; }
        }
      `;
      return cssWithKebabProps`
        ${keyframes}
        animation: pulse-glow-sine ${pulseSpeed}s ease-in-out infinite;
      `;
  }
};

/**
 * Create an inner glow effect
 */
const createInnerGlow = (
  color: string,
  intensity: number,
  blurred: boolean,
  blurAmount: number
): ReturnType<typeof css> => {
  const glowColor = withAlpha(color, intensity);

  return cssWithKebabProps`
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 ${blurred ? blurAmount : 4}px ${glowColor};
      pointer-events: none;
    }
  `;
};

/**
 * Create a directional glow effect
 */
const createDirectionalGlow = (
  color: string,
  intensity: number,
  radius: number,
  angle: number
): ReturnType<typeof css> => {
  // Calculate x and y offsets based on angle
  const radian = (angle * Math.PI) / 180;
  const x = Math.cos(radian) * (radius / 2);
  const y = Math.sin(radian) * (radius / 2);

  // Create directional shadow
  const glowColor = withAlpha(color, intensity);

  return cssWithKebabProps`
    box-shadow: ${x}px ${y}px ${radius}px 0 ${glowColor};
  `;
};

/**
 * Create a layered glow effect
 */
const createLayeredGlow = (
  color: string,
  secondaryColor: string,
  intensity: number,
  radius: number,
  layers: number
): ReturnType<typeof css> => {
  let shadowLayers = '';

  for (let i = 1; i <= layers; i++) {
    // Alternate between primary and secondary colors
    const layerColor = i % 2 === 0 ? secondaryColor || color : color;

    // Decrease opacity as layers grow outward
    const layerOpacity = intensity * (1 - ((i - 1) / layers) * 0.7);
    const layerRadius = radius * (i / layers);

    shadowLayers += `0 0 ${layerRadius}px ${withAlpha(layerColor, layerOpacity)}`;

    if (i < layers) shadowLayers += ', ';
  }

  return cssWithKebabProps`
    box-shadow: ${shadowLayers};
  `;
};

/**
 * Create an edge glow effect
 */
const createEdgeGlow = (color: string, intensity: number): ReturnType<typeof css> => {
  const glowColor = withAlpha(color, intensity);

  return cssWithKebabProps`
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      border: 1px solid ${glowColor};
      filter: blur(2px);
      opacity: ${intensity};
      pointer-events: none;
    }
  `;
};

/**
 * Create animated glow effects
 */
const createAnimatedGlow = (
  color: string,
  secondaryColor: string | undefined,
  intensity: number,
  radius: number,
  type: 'rotate' | 'shift' | 'breathe' | 'wave' | 'rainbow',
  duration: number
): ReturnType<typeof css> => {
  const baseColor = withAlpha(color, intensity);
  const altColor = secondaryColor
    ? withAlpha(secondaryColor, intensity)
    : withAlpha(color, intensity * 0.7);

  switch (type) {
    case 'rotate':
      return cssWithKebabProps`
        @keyframes rotate-glow {
          0% { 
            box-shadow: 0 ${radius / 2}px ${radius}px 0 ${baseColor},
                       ${radius / 2}px 0 ${radius}px 0 ${altColor};
          }
          25% { 
            box-shadow: ${radius / 2}px 0 ${radius}px 0 ${baseColor},
                        0 -${radius / 2}px ${radius}px 0 ${altColor};
          }
          50% { 
            box-shadow: 0 -${radius / 2}px ${radius}px 0 ${baseColor},
                       -${radius / 2}px 0 ${radius}px 0 ${altColor};
          }
          75% { 
            box-shadow: -${radius / 2}px 0 ${radius}px 0 ${baseColor},
                        0 ${radius / 2}px ${radius}px 0 ${altColor};
          }
          100% { 
            box-shadow: 0 ${radius / 2}px ${radius}px 0 ${baseColor},
                       ${radius / 2}px 0 ${radius}px 0 ${altColor};
          }
        }
        animation: rotate-glow ${duration}s linear infinite;
      `;

    case 'shift':
      return cssWithKebabProps`
        @keyframes shift-glow {
          0% { box-shadow: -${radius / 2}px 0 ${radius}px 0 ${baseColor}; }
          50% { box-shadow: ${radius / 2}px 0 ${radius}px 0 ${baseColor}; }
          100% { box-shadow: -${radius / 2}px 0 ${radius}px 0 ${baseColor}; }
        }
        animation: shift-glow ${duration}s ease-in-out infinite;
      `;

    case 'breathe':
      return cssWithKebabProps`
        @keyframes breathe-glow {
          0% { box-shadow: 0 0 ${radius * 0.8}px 0 ${baseColor}; }
          50% { box-shadow: 0 0 ${radius * 1.3}px 0 ${baseColor}; }
          100% { box-shadow: 0 0 ${radius * 0.8}px 0 ${baseColor}; }
        }
        animation: breathe-glow ${duration}s ease-in-out infinite;
      `;

    case 'wave':
      return cssWithKebabProps`
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: -100%;
          left: -100%;
          right: -100%;
          bottom: -100%;
          background: radial-gradient(
            circle,
            ${baseColor} 0%,
            transparent 70%
          );
          animation: wave-glow ${duration}s linear infinite;
        }
        
        @keyframes wave-glow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;

    case 'rainbow':
      return cssWithKebabProps`
        @keyframes rainbow-glow {
          0% { box-shadow: 0 0 ${radius}px 0 rgba(255, 0, 0, ${intensity}); }
          17% { box-shadow: 0 0 ${radius}px 0 rgba(255, 165, 0, ${intensity}); }
          33% { box-shadow: 0 0 ${radius}px 0 rgba(255, 255, 0, ${intensity}); }
          50% { box-shadow: 0 0 ${radius}px 0 rgba(0, 255, 0, ${intensity}); }
          67% { box-shadow: 0 0 ${radius}px 0 rgba(0, 0, 255, ${intensity}); }
          83% { box-shadow: 0 0 ${radius}px 0 rgba(75, 0, 130, ${intensity}); }
          100% { box-shadow: 0 0 ${radius}px 0 rgba(255, 0, 0, ${intensity}); }
        }
        animation: rainbow-glow ${duration * 2}s linear infinite;
      `;

    default:
      return cssWithKebabProps``;
  }
};

/**
 * Create a 3D lighting effect
 */
const create3DLightingEffect = (
  color: string,
  intensity: number,
  radius: number
): ReturnType<typeof css> => {
  const glowColor = withAlpha(color, intensity * 0.7);

  return cssWithKebabProps`
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        135deg,
        ${withAlpha(color, intensity * 0.3)} 0%,
        transparent 50%
      );
      pointer-events: none;
      z-index: 1;
    }
    
    box-shadow: 0 ${radius / 4}px ${radius / 2}px 0 ${withAlpha('#000000', 0.2)},
                0 0 ${radius}px 0 ${glowColor};
  `;
};

/**
 * Creates responsive glow intensity
 */
const createResponsiveGlow = (
  color: string,
  baseIntensity: number,
  radius: number
): ReturnType<typeof css> => {
  return cssWithKebabProps`
    @media (max-width: 480px) {
      box-shadow: 0 0 ${radius * 0.7}px 0 ${withAlpha(color, baseIntensity * 0.7)};
    }
    
    @media (min-width: 481px) and (max-width: 768px) {
      box-shadow: 0 0 ${radius * 0.85}px 0 ${withAlpha(color, baseIntensity * 0.85)};
    }
    
    @media (min-width: 769px) {
      box-shadow: 0 0 ${radius}px 0 ${withAlpha(color, baseIntensity)};
    }
  `;
};

/**
 * Enhanced glow effects for glass UI elements
 * @param options Options for the enhanced glow effect
 * @returns CSS styles for the glow effect
 */
export const enhancedGlowEffects = (options: EnhancedGlowOptions = {}): ReturnType<typeof css> => {
  // Merge options with defaults
  const mergedOptions: EnhancedGlowOptions = {
    ...DEFAULT_GLOW_OPTIONS,
    ...options,
  };

  const {
    color,
    secondaryColor,
    intensity,
    radius,
    pulsing,
    pulseSpeed,
    pulsePattern,
    innerGlow,
    innerGlowIntensity,
    outerGlow,
    outerGlowIntensity,
    edgeGlow,
    edgeGlowIntensity,
    directional,
    angle,
    layered,
    layers,
    animated,
    animationType,
    animationDuration,
    responsiveIntensity,
    blurred,
    blurAmount,
    enable3D,
    themeContext,
  } = mergedOptions;

  // Get color from theme or use default
  let glowColor = color || '#6366F1'; // Default: Indigo
  let secondaryGlowColor = secondaryColor;

  // Get colors from theme if available
  if (themeContext?.getColor && typeof color === 'string') {
    if (color === 'primary') {
      glowColor = themeContext.getColor('nebula.accentPrimary', '#6366F1');
    } else if (color === 'secondary') {
      glowColor = themeContext.getColor('nebula.accentSecondary', '#8B5CF6');
    } else if (color.includes('.')) {
      // Try to get from theme path
      glowColor = themeContext.getColor(color, glowColor);
    }

    // Try to get secondary color from theme
    if (secondaryColor) {
      if (secondaryColor === 'primary') {
        secondaryGlowColor = themeContext.getColor('nebula.accentPrimary', '#6366F1');
      } else if (secondaryColor === 'secondary') {
        secondaryGlowColor = themeContext.getColor('nebula.accentSecondary', '#8B5CF6');
      } else if (secondaryColor.includes('.')) {
        secondaryGlowColor = themeContext.getColor(secondaryColor, secondaryGlowColor);
      }
    }
  }

  // If no secondary color, derive from primary
  if (!secondaryGlowColor) {
    // Simple shift for example - in real implementation, use color theory to create complementary color
    secondaryGlowColor = glowColor;
  }

  // Convert intensity to numeric value
  const intensityValue = getIntensityValue(intensity || 'medium');
  const radiusValue = radius || 15;

  // Base styles
  let glowStyles = cssWithKebabProps``;

  // Apply effects in order of render priority

  // 1. Base outer glow (if enabled)
  if (outerGlow) {
    const outerIntensityValue = outerGlowIntensity || intensityValue;

    if (responsiveIntensity) {
      glowStyles = cssWithKebabProps`
        ${glowStyles}
        ${createResponsiveGlow(glowColor, outerIntensityValue, radiusValue)}
      `;
    } else {
      glowStyles = cssWithKebabProps`
        ${glowStyles}
        box-shadow: 0 0 ${radiusValue}px 0 ${withAlpha(glowColor, outerIntensityValue)};
      `;
    }
  }

  // 2. Layered glow (if enabled)
  if (layered) {
    glowStyles = cssWithKebabProps`
      ${glowStyles}
      ${createLayeredGlow(
        glowColor,
        secondaryGlowColor,
        outerGlowIntensity || intensityValue,
        radiusValue,
        layers || 3
      )}
    `;
  }

  // 3. Directional glow (if enabled)
  if (directional) {
    glowStyles = cssWithKebabProps`
      ${glowStyles}
      ${createDirectionalGlow(
        glowColor,
        outerGlowIntensity || intensityValue,
        radiusValue,
        angle || 45
      )}
    `;
  }

  // 4. Inner glow (if enabled)
  if (innerGlow) {
    glowStyles = cssWithKebabProps`
      ${glowStyles}
      ${createInnerGlow(
        glowColor,
        innerGlowIntensity || intensityValue * 0.7,
        blurred || false,
        blurAmount || 5
      )}
    `;
  }

  // 5. Edge glow (if enabled)
  if (edgeGlow) {
    glowStyles = cssWithKebabProps`
      ${glowStyles}
      ${createEdgeGlow(glowColor, edgeGlowIntensity || intensityValue * 0.8)}
    `;
  }

  // 6. 3D lighting (if enabled)
  if (enable3D) {
    glowStyles = cssWithKebabProps`
      ${glowStyles}
      ${create3DLightingEffect(glowColor, intensityValue, radiusValue)}
    `;
  }

  // 7. Animations (if enabled)

  // Pulsing animation
  if (pulsing) {
    glowStyles = cssWithKebabProps`
      ${glowStyles}
      ${createPulseAnimation(
        glowColor,
        radiusValue,
        intensityValue,
        pulseSpeed || 2,
        pulsePattern || 'sine'
      )}
    `;
  }

  // Other animations
  if (animated && !pulsing) {
    glowStyles = cssWithKebabProps`
      ${glowStyles}
      ${createAnimatedGlow(
        glowColor,
        secondaryGlowColor,
        intensityValue,
        radiusValue,
        animationType || 'breathe',
        animationDuration || 3
      )}
    `;
  }

  return glowStyles;
};

/**
 * Export the glassGlow alias for compatibility
 */
export const enhancedGlow = enhancedGlowEffects;
