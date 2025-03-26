/**
 * Advanced Interactive Effects
 *
 * Enhanced interactive effects for glass UI elements with advanced animation and feedback features.
 */
import { css } from 'styled-components';

import { hexToRGBA, parseColorWithAlpha } from '../colorUtils';
import { cssWithKebabProps } from '../cssUtils';
import { ThemeContext } from '../themeContext';

import { focusEffects, FocusEffectsOptions } from './interactions/focusEffects';
import { hoverEffects, HoverEffectsOptions } from './interactions/hoverEffects';

/**
 * Interactive effect options
 */
export interface InteractiveEffectOptions {
  /** Base color for interactive effects */
  color?: string;

  /** Effect intensity (0-1) */
  intensity?: number;

  /** Interaction timing in milliseconds */
  timing?: number;

  /** Whether to include hover effects */
  hover?: boolean;

  /** Whether to include focus effects */
  focus?: boolean;

  /** Whether to include active/pressed effects */
  active?: boolean;

  /** Whether to include disabled state */
  disabled?: boolean;

  /** Whether to add magnetic effects */
  magnetic?: boolean;

  /** Magnetic effect strength (0-1) */
  magneticStrength?: number;

  /** Whether to add parallax effects */
  parallax?: boolean;

  /** Parallax depth in pixels */
  parallaxDepth?: number;

  /** Whether to enhance with 3D effects */
  enable3D?: boolean;

  /** 3D rotation amount in degrees */
  rotation3D?: number;

  /** Whether to include ripple effects */
  ripple?: boolean;

  /** Ripple color */
  rippleColor?: string;

  /** Ripple opacity (0-1) */
  rippleOpacity?: number;

  /** Whether to include state transitions */
  stateTransitions?: boolean;

  /** Whether to include elastic press effect */
  elasticPress?: boolean;

  /** Elastic press scale factor (0-1) */
  elasticScale?: number;

  /** Whether to include glow on interaction */
  glow?: boolean;

  /** Glow color */
  glowColor?: string;

  /** Glow radius in pixels */
  glowRadius?: number;

  /** Whether to include border highlight on interaction */
  borderHighlight?: boolean;

  /** Border highlight color */
  borderHighlightColor?: string;

  /** Whether to include sound feedback */
  sound?: boolean;

  /** Sound effect URL */
  soundUrl?: string;

  /** Whether to include haptic feedback if available */
  haptic?: boolean;
}

/**
 * Options for hover effects
 */
export interface HoverEffectOptions {
  /** Effect color */
  color?: string;

  /** Effect intensity (0-1) */
  intensity?: number;

  /** Theme context */
  themeContext?: ThemeContext;
}

/**
 * Options for focus effects
 */
export interface FocusEffectOptions {
  /** Effect color */
  color?: string;

  /** Effect intensity (0-1) */
  intensity?: number;

  /** Theme context */
  themeContext?: ThemeContext;
}

/**
 * Default interactive effect options
 */
const DEFAULT_INTERACTIVE_OPTIONS: InteractiveEffectOptions = {
  intensity: 0.7,
  timing: 200,
  hover: true,
  focus: true,
  active: true,
  disabled: true,
  magnetic: false,
  magneticStrength: 0.3,
  parallax: false,
  parallaxDepth: 5,
  enable3D: false,
  rotation3D: 5,
  ripple: false,
  rippleOpacity: 0.2,
  stateTransitions: true,
  elasticPress: false,
  elasticScale: 0.95,
  glow: false,
  glowRadius: 10,
  borderHighlight: false,
  sound: false,
  haptic: false,
};

/**
 * Create ripple effect styles
 */
const createRippleEffect = (color: string, opacity = 0.2): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${opacity})`;

  return cssWithKebabProps`
    position: relative;
    overflow: hidden;
    
    /* Ripple element will be created in JS, this is the styling for it */
    & .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: ${rgba};
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    }
    
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    /* JS-free ripple fallback using pseudo-element */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${rgba};
      opacity: 0;
      border-radius: inherit;
      transform: scale(0);
      pointer-events: none;
    }
    
    &:active::after {
      opacity: ${opacity};
      transform: scale(1);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
  `;
};

/**
 * Create 3D transform hover effect
 */
const create3DEffect = (rotationAmount = 5): CSSMixin => {
  return cssWithKebabProps`
    transform-style: preserve-3d;
    perspective: 800px;
    
    &:hover {
      transform: rotateX(${rotationAmount}deg) rotateY(${rotationAmount}deg);
    }
  `;
};

/**
 * Create parallax effect
 */
const createParallaxEffect = (depth = 5): CSSMixin => {
  return cssWithKebabProps`
    transform-style: preserve-3d;
    transform: translateZ(0);
    transition: transform 0.1s ease-out;
    
    &:hover {
      transform: translateZ(${depth}px);
    }
  `;
};

/**
 * Create elastic press effect
 */
const createElasticPressEffect = (scale = 0.95): CSSMixin => {
  return cssWithKebabProps`
    &:active {
      transform: scale(${scale});
    }
  `;
};

/**
 * Create glow effect on interaction
 */
const createInteractiveGlow = (color: string, radius = 10): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 0.5)`;

  return cssWithKebabProps`
    transition: box-shadow 0.2s ease;
    
    &:hover {
      box-shadow: 0 0 ${radius}px ${rgba};
    }
    
    &:active {
      box-shadow: 0 0 ${Math.floor(radius * 1.5)}px ${rgba};
    }
  `;
};

/**
 * Create border highlight effect
 */
const createBorderHighlight = (color: string): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 0.7)`;

  return cssWithKebabProps`
    transition: border-color 0.2s ease;
    
    &:focus-visible {
      outline: none;
      border-color: ${rgba};
      box-shadow: 0 0 0 2px ${rgba}40;
    }
  `;
};

/**
 * Create magnetic effect
 */
const createMagneticEffect = (strength = 0.3): CSSMixin => {
  return cssWithKebabProps`
    transform: translate(0, 0);
    transition: transform 0.1s ease-out;
    
    &.magnetic {
      transform: translate(var(--magnetic-x, 0), var(--magnetic-y, 0));
    }
  `;
};

/**
 * Create sound effect callback
 */
const createSoundEffect = (soundUrl: string): string => {
  // Return a JavaScript function as string that can be executed
  return `
    (function createSoundEffect() {
      const audio = new Audio('${soundUrl}');
      audio.volume = 0.5;
      return function playSound() {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn('Could not play sound effect:', e));
      };
    })()
  `;
};

/**
 * Create haptic feedback effect
 */
const createHapticFeedback = (): string => {
  // Return a JavaScript function as string that can be executed
  return `
    function triggerHaptic() {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  `;
};

// Define CSSMixin type for consistent return types
type CSSMixin = ReturnType<typeof css>;

/**
 * Advanced interactive effects mixin with complex animations and feedback
 * @param themeContext Theme context for accessing theme values
 * @param options Interactive effect options
 * @returns CSS styles for enhanced interactive effects
 */
export const interactiveEffects = (
  themeContext: ThemeContext,
  options: InteractiveEffectOptions = {}
): CSSMixin => {
  // Merge with default options
  const mergedOptions: InteractiveEffectOptions = {
    ...DEFAULT_INTERACTIVE_OPTIONS,
    ...options,
  };

  const {
    color,
    intensity,
    timing,
    hover,
    focus,
    active,
    disabled,
    magnetic,
    magneticStrength,
    parallax,
    parallaxDepth,
    enable3D,
    rotation3D,
    ripple,
    rippleColor,
    rippleOpacity,
    stateTransitions,
    elasticPress,
    elasticScale,
    glow,
    glowColor,
    glowRadius,
    borderHighlight,
    borderHighlightColor,
    sound,
    soundUrl,
    haptic,
  } = mergedOptions;

  // Get colors from theme or options
  const interactionColor =
    color || (themeContext.getColor ? themeContext.getColor('primary', '#4B66EA') : '#4B66EA');
  const rippleColorValue = rippleColor || interactionColor;
  const glowColorValue = glowColor || interactionColor;
  const borderColorValue = borderHighlightColor || interactionColor;

  // Build base interactive styles
  let interactiveStyles = cssWithKebabProps`
    position: relative;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    
    ${
      stateTransitions
        ? `
      transition-property: transform, box-shadow, border-color, background-color, opacity;
      transition-duration: ${timing}ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    `
        : ''
    }
    
    ${
      disabled
        ? `
      &:disabled,
      &[disabled],
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
    `
        : ''
    }
  `;

  // Apply special interactive effects
  if (hover) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${hoverEffects({
        color: interactionColor,
        themeContext,
        type: 'glow',
        intensity: intensity as any,
      })}
    `;
  }

  if (focus) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${focusEffects({
        color: interactionColor,
        themeContext,
        type: 'outline',
      })}
    `;
  }

  if (ripple) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${createRippleEffect(rippleColorValue, rippleOpacity)}
    `;
  }

  if (enable3D) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${create3DEffect(rotation3D)}
    `;
  }

  if (parallax) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${createParallaxEffect(parallaxDepth)}
    `;
  }

  if (elasticPress && active) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${createElasticPressEffect(elasticScale)}
    `;
  }

  if (glow) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${createInteractiveGlow(glowColorValue, glowRadius)}
    `;
  }

  if (borderHighlight) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${createBorderHighlight(borderColorValue)}
    `;
  }

  if (magnetic) {
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      ${createMagneticEffect(magneticStrength)}
    `;
  }

  // Add JavaScript-based effects
  if (sound && soundUrl) {
    const soundScript = createSoundEffect(soundUrl);
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      
      &::after {
        content: '';
        display: none;
      }
      
      &.js-enabled:active::after {
        /* Inject sound effect function */
        content: '${soundScript}';
      }
    `;
  }

  if (haptic) {
    const hapticScript = createHapticFeedback();
    interactiveStyles = cssWithKebabProps`
      ${interactiveStyles}
      
      &::before {
        content: '';
        display: none;
      }
      
      &.js-enabled:active::before {
        /* Inject haptic feedback function */
        content: '${hapticScript}';
      }
    `;
  }

  return interactiveStyles;
};
