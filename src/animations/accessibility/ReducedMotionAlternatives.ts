/**
 * Reduced Motion Alternatives
 * 
 * Comprehensive system for providing alternative animations for users who prefer reduced motion
 */
import { keyframes, css, FlattenSimpleInterpolation } from 'styled-components';

import { AnimationCategory } from './MotionSensitivity';
import { AnimationPropertyType, MotionIntensityLevel } from './MotionIntensityProfiler';
import animationPresets from '../presets';

/**
 * Alternative animation type
 */
export enum AlternativeType {
  /** No animation at all */
  NONE = 'none',
  
  /** Simple fade in */
  FADE = 'fade',
  
  /** Reduced distance */
  REDUCED_DISTANCE = 'reduced_distance',
  
  /** Static indicator */
  STATIC = 'static',
  
  /** Simplified version */
  SIMPLIFIED = 'simplified',
  
  /** Alternative property */
  ALTERNATIVE_PROPERTY = 'alternative_property',
  
  /** Original with adjusted parameters */
  ADJUSTED = 'adjusted',
}

/**
 * Alternative animation mapping
 */
export interface AlternativeAnimation {
  /** Generated keyframes for the alternative */
  keyframes: ReturnType<typeof keyframes>;
  
  /** Alternative type */
  type: AlternativeType;
  
  /** Adjusted duration in ms (if applicable) */
  duration?: number;
  
  /** Adjusted easing function (if applicable) */
  easing?: string;
  
  /** Description of the alternative */
  description: string;
  
  /** Animation iterations (if applicable) */
  iterations?: number | string;
}

// Define common alternative animations

/**
 * Simple fade in animation
 */
export const simpleFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/**
 * Simple fade out animation
 */
export const simpleFadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

/**
 * Simple opacity pulse (subtle)
 */
export const simpleOpacityPulse = keyframes`
  0% { opacity: 0.85; }
  50% { opacity: 1; }
  100% { opacity: 0.85; }
`;

/**
 * Simple border pulse (subtle)
 */
export const simpleBorderPulse = keyframes`
  0% { border-color: rgba(255, 255, 255, 0.3); }
  50% { border-color: rgba(255, 255, 255, 0.8); }
  100% { border-color: rgba(255, 255, 255, 0.3); }
`;

/**
 * Simple shadow pulse (subtle)
 */
export const simpleShadowPulse = keyframes`
  0% { box-shadow: 0 0 0 rgba(0, 0, 0, 0.1); }
  50% { box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); }
  100% { box-shadow: 0 0 0 rgba(0, 0, 0, 0.1); }
`;

/**
 * Simple background color change (subtle)
 */
export const simpleBackgroundChange = keyframes`
  0% { background-color: rgba(255, 255, 255, 0.05); }
  50% { background-color: rgba(255, 255, 255, 0.1); }
  100% { background-color: rgba(255, 255, 255, 0.05); }
`;

/**
 * Simple opacity for loading indication
 */
export const simpleLoadingPulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

/**
 * Simple scale in (minimal)
 */
export const simpleScaleIn = keyframes`
  from { transform: scale(0.97); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

/**
 * Simple scale out (minimal)
 */
export const simpleScaleOut = keyframes`
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.97); opacity: 0; }
`;

/**
 * Very subtle slide up (minimal distance)
 */
export const subtleSlideUp = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

/**
 * Very subtle slide down (minimal distance)
 */
export const subtleSlideDown = keyframes`
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

/**
 * Generate reduced motion animation CSS
 * 
 * @param alternative Alternative animation
 * @param options Animation options
 * @returns CSS animation
 */
export const generateReducedMotionCSS = (
  alternative: AlternativeAnimation,
  options: {
    duration?: number;
    delay?: number | string;
    iterations?: number | string;
    fillMode?: string;
    direction?: string;
    playState?: string;
    easing?: string;
  } = {}
): FlattenSimpleInterpolation => {
  const {
    duration = alternative.duration || 300,
    delay = 0,
    iterations = 1,
    fillMode = 'both',
    direction = 'normal',
    playState = 'running',
    easing = alternative.easing || 'ease',
  } = options;
  
  // Format time values
  const formatDuration = (value: number | string): string => {
    if (typeof value === 'number') {
      return `${value}ms`;
    }
    return value;
  };
  
  // Create CSS animation
  return css`
    animation-name: ${alternative.keyframes.name};
    animation-duration: ${formatDuration(duration)};
    animation-timing-function: ${easing};
    animation-delay: ${typeof delay === 'number' ? formatDuration(delay) : delay};
    animation-fill-mode: ${fillMode};
    animation-iteration-count: ${iterations};
    animation-direction: ${direction};
    animation-play-state: ${playState};
  `;
};

/**
 * Create reduced distance version of common animation
 * 
 * @param originalKeyframes Original keyframes to transform
 * @param distanceScale Scale factor (0-1)
 * @returns Alternative animation with reduced distance
 */
export const createReducedDistanceAlternative = (
  originalKeyframes: string,
  distanceScale: number
): AlternativeAnimation => {
  // Extract transform values and reduce them
  const reducedKeyframes = originalKeyframes.replace(
    /transform:[^;]*(translate\w*\()(\-?\d+(\.\d+)?)(px|rem|em|%)/gi,
    (match, prefix, value, decimal, unit) => {
      const numericValue = parseFloat(value);
      const scaledValue = numericValue * distanceScale;
      return match.replace(`${value}${unit}`, `${scaledValue}${unit}`);
    }
  );
  
  // Create and return alternative
  return {
    keyframes: keyframes`${reducedKeyframes}`,
    type: AlternativeType.REDUCED_DISTANCE,
    duration: 400, // Slightly faster duration for reduced distance
    description: 'Reduced distance version with scaled transform values'
  };
};

/**
 * Map of default alternative animations for different categories
 */
export const DEFAULT_ALTERNATIVES: Record<AnimationCategory, Record<MotionIntensityLevel, AlternativeAnimation>> = {
  [AnimationCategory.ENTRANCE]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 200,
      easing: 'ease-out',
      description: 'Simple fade in for entrance'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 250,
      easing: 'ease-out',
      description: 'Simple fade in for entrance'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleScaleIn,
      type: AlternativeType.SIMPLIFIED,
      duration: 300,
      easing: 'ease-out',
      description: 'Simple scale in for entrance'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: subtleSlideUp,
      type: AlternativeType.REDUCED_DISTANCE,
      duration: 350,
      easing: 'ease-out',
      description: 'Subtle slide up for entrance'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleScaleIn,
      type: AlternativeType.SIMPLIFIED,
      duration: 300,
      easing: 'ease-out',
      description: 'Simple scale in for entrance'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 200,
      easing: 'ease-out',
      description: 'Simple fade in for entrance'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 150,
      easing: 'ease-out',
      description: 'Simple fade in for entrance'
    },
  },
  
  [AnimationCategory.EXIT]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: simpleFadeOut,
      type: AlternativeType.FADE,
      duration: 200,
      easing: 'ease-in',
      description: 'Simple fade out for exit'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleFadeOut,
      type: AlternativeType.FADE,
      duration: 250,
      easing: 'ease-in',
      description: 'Simple fade out for exit'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleScaleOut,
      type: AlternativeType.SIMPLIFIED,
      duration: 300,
      easing: 'ease-in',
      description: 'Simple scale out for exit'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: subtleSlideDown,
      type: AlternativeType.REDUCED_DISTANCE,
      duration: 350,
      easing: 'ease-in',
      description: 'Subtle slide down for exit'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleScaleOut,
      type: AlternativeType.SIMPLIFIED,
      duration: 300,
      easing: 'ease-in',
      description: 'Simple scale out for exit'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: simpleFadeOut,
      type: AlternativeType.FADE,
      duration: 200,
      easing: 'ease-in',
      description: 'Simple fade out for exit'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: simpleFadeOut,
      type: AlternativeType.FADE,
      duration: 150,
      easing: 'ease-in',
      description: 'Simple fade out for exit'
    },
  },
  
  [AnimationCategory.HOVER]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for hover'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 0,
      description: 'Simple border highlight for hover'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleShadowPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 200,
      description: 'Simple shadow pulse for hover'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleBackgroundChange,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 200,
      description: 'Simple background change for hover'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 0,
      description: 'Simple border highlight for hover'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for hover'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for hover'
    },
  },
  
  [AnimationCategory.FOCUS]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for focus'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 0,
      description: 'Simple border highlight for focus'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 200,
      description: 'Simple border pulse for focus'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 200,
      description: 'Simple border pulse for focus'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 0,
      description: 'Simple border highlight for focus'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for focus'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for focus'
    },
  },
  
  [AnimationCategory.ACTIVE]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for active state'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleBackgroundChange,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 0,
      description: 'Simple background change for active state'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleBackgroundChange,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 100,
      description: 'Simple background change for active state'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleBackgroundChange,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 150,
      description: 'Simple background change for active state'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleBackgroundChange,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 0,
      description: 'Simple background change for active state'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for active state'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for active state'
    },
  },
  
  [AnimationCategory.LOADING]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 1500,
      iterations: 'infinite',
      description: 'Simple opacity pulse for loading'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 1500,
      iterations: 'infinite',
      description: 'Simple opacity pulse for loading'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleLoadingPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 1200,
      iterations: 'infinite',
      description: 'Simple loading pulse'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleLoadingPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 1200,
      iterations: 'infinite',
      description: 'Simple loading pulse'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 1500,
      iterations: 'infinite',
      description: 'Simple opacity pulse for loading'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 2000,
      iterations: 'infinite',
      description: 'Simple opacity pulse for loading'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 2500,
      iterations: 'infinite',
      description: 'Simple opacity pulse for loading'
    },
  },
  
  [AnimationCategory.BACKGROUND]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for background'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for background'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 5000,
      iterations: 'infinite',
      description: 'Very subtle opacity pulse for background'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 5000,
      iterations: 'infinite',
      description: 'Very subtle opacity pulse for background'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for background'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for background'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for background'
    },
  },
  
  [AnimationCategory.SCROLL]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for scroll'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for scroll'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 400,
      description: 'Simple fade in for scroll reveal'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 300,
      description: 'Simple fade in for scroll reveal'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 200,
      description: 'Simple fade in for scroll reveal'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for scroll'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for scroll'
    },
  },
  
  [AnimationCategory.ATTENTION]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for attention'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 800,
      iterations: 3,
      description: 'Simple border pulse for attention'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 800,
      iterations: 3,
      description: 'Simple opacity pulse for attention'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleOpacityPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 800,
      iterations: 3,
      description: 'Simple opacity pulse for attention'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 800,
      iterations: 2,
      description: 'Simple border pulse for attention'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: simpleBorderPulse,
      type: AlternativeType.ALTERNATIVE_PROPERTY,
      duration: 800,
      iterations: 1,
      description: 'Simple border pulse for attention'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, // Empty keyframes
      type: AlternativeType.NONE,
      description: 'No animation for attention'
    },
  },
  
  [AnimationCategory.ESSENTIAL]: {
    [MotionIntensityLevel.NONE]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 300,
      description: 'Simple fade for essential animations'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 300,
      description: 'Simple fade for essential animations'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleScaleIn,
      type: AlternativeType.SIMPLIFIED,
      duration: 300,
      description: 'Simple scale in for essential animations'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: subtleSlideUp,
      type: AlternativeType.REDUCED_DISTANCE,
      duration: 300,
      description: 'Subtle slide for essential animations'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleScaleIn,
      type: AlternativeType.SIMPLIFIED,
      duration: 300,
      description: 'Simple scale in for essential animations'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 200,
      description: 'Simple fade for essential animations'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration: 150,
      description: 'Simple fade for essential animations'
    },
  },
  
  // --- Additions for Interaction, Game, Animation ---
  
  [AnimationCategory.INTERACTION]: { // Copied from HOVER
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, type: AlternativeType.NONE, description: 'No animation for hover'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleBorderPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 0, description: 'Simple border highlight for hover'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleShadowPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 200, description: 'Simple shadow pulse for hover'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleBackgroundChange, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 200, description: 'Simple background change for hover'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleBorderPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 0, description: 'Simple border highlight for hover'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: keyframes``, type: AlternativeType.NONE, description: 'No animation for hover'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, type: AlternativeType.NONE, description: 'No animation for hover'
    },
  },
  
  [AnimationCategory.GAME]: { // Copied from ATTENTION
    [MotionIntensityLevel.NONE]: {
      keyframes: keyframes``, type: AlternativeType.NONE, description: 'No animation for attention'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleBorderPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 800, iterations: 3, description: 'Simple border pulse for attention'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleOpacityPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 800, iterations: 3, description: 'Simple opacity pulse for attention'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: simpleOpacityPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 800, iterations: 3, description: 'Simple opacity pulse for attention'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleOpacityPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 800, iterations: 3, description: 'Simple opacity pulse for attention'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: simpleBorderPulse, type: AlternativeType.ALTERNATIVE_PROPERTY, duration: 1000, iterations: 2, description: 'Simple border pulse for attention'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: keyframes``, type: AlternativeType.NONE, description: 'No animation for attention'
    },
  },
  
  [AnimationCategory.ANIMATION]: { // Copied from ENTRANCE
    [MotionIntensityLevel.NONE]: {
      keyframes: simpleFadeIn, type: AlternativeType.FADE, duration: 200, easing: 'ease-out', description: 'Simple fade in for entrance'
    },
    [MotionIntensityLevel.MINIMAL]: {
      keyframes: simpleFadeIn, type: AlternativeType.FADE, duration: 250, easing: 'ease-out', description: 'Simple fade in for entrance'
    },
    [MotionIntensityLevel.LOW]: {
      keyframes: simpleScaleIn, type: AlternativeType.SIMPLIFIED, duration: 300, easing: 'ease-out', description: 'Simple scale in for entrance'
    },
    [MotionIntensityLevel.MODERATE]: {
      keyframes: subtleSlideUp, type: AlternativeType.REDUCED_DISTANCE, duration: 350, easing: 'ease-out', description: 'Subtle slide up for entrance'
    },
    [MotionIntensityLevel.HIGH]: {
      keyframes: simpleScaleIn, type: AlternativeType.SIMPLIFIED, duration: 300, easing: 'ease-out', description: 'Simple scale in for entrance'
    },
    [MotionIntensityLevel.VERY_HIGH]: {
      keyframes: simpleFadeIn, type: AlternativeType.FADE, duration: 200, easing: 'ease-out', description: 'Simple fade in for entrance'
    },
    [MotionIntensityLevel.EXTREME]: {
      keyframes: simpleFadeIn, type: AlternativeType.FADE, duration: 150, easing: 'ease-out', description: 'Simple fade in for entrance'
    },
  },
  
};

// Add defaults for the new categories by copying existing ones
DEFAULT_ALTERNATIVES[AnimationCategory.INTERACTION] = DEFAULT_ALTERNATIVES[AnimationCategory.HOVER];
DEFAULT_ALTERNATIVES[AnimationCategory.GAME] = DEFAULT_ALTERNATIVES[AnimationCategory.ATTENTION];
DEFAULT_ALTERNATIVES[AnimationCategory.ANIMATION] = DEFAULT_ALTERNATIVES[AnimationCategory.ENTRANCE];

/**
 * Custom alternative animations registry
 */
export class AlternativeAnimationsRegistry {
  private static instance: AlternativeAnimationsRegistry;
  private customAlternatives: Map<string, AlternativeAnimation> = new Map();
  
  /**
   * Create a new alternative animations registry
   */
  private constructor() {}
  
  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): AlternativeAnimationsRegistry {
    if (!AlternativeAnimationsRegistry.instance) {
      AlternativeAnimationsRegistry.instance = new AlternativeAnimationsRegistry();
    }
    
    return AlternativeAnimationsRegistry.instance;
  }
  
  /**
   * Register a custom alternative animation
   * 
   * @param id Unique alternative ID
   * @param alternative Alternative animation
   */
  public registerAlternative(id: string, alternative: AlternativeAnimation): void {
    this.customAlternatives.set(id, alternative);
  }
  
  /**
   * Get a custom alternative by ID
   * 
   * @param id Alternative ID
   * @returns Alternative animation or undefined if not found
   */
  public getAlternative(id: string): AlternativeAnimation | undefined {
    return this.customAlternatives.get(id);
  }
  
  /**
   * Get the best alternative for a given animation
   * 
   * @param category Animation category
   * @param intensityLevel Intensity level
   * @param preferredType Preferred alternative type (optional)
   * @returns Best matching alternative animation
   */
  public getBestAlternative(
    category: AnimationCategory,
    intensityLevel: MotionIntensityLevel,
    preferredType?: AlternativeType
  ): AlternativeAnimation {
    // Try to get alternative for specific category and intensity
    const alternatives = DEFAULT_ALTERNATIVES[category] || DEFAULT_ALTERNATIVES[AnimationCategory.ENTRANCE];
    let alternative = alternatives[intensityLevel];
    
    // If preferred type is specified, try to find a matching alternative
    if (preferredType && alternative.type !== preferredType) {
      // Look for an alternative with the preferred type
      for (const level of Object.values(MotionIntensityLevel)) {
        if (alternatives[level].type === preferredType) {
          alternative = alternatives[level];
          break;
        }
      }
    }
    
    return alternative;
  }
  
  /**
   * Get a fade-only alternative with customized duration
   * 
   * @param duration Duration in ms
   * @returns Fade alternative animation
   */
  public getFadeAlternative(duration = 300): AlternativeAnimation {
    return {
      keyframes: simpleFadeIn,
      type: AlternativeType.FADE,
      duration,
      easing: 'ease',
      description: 'Simple fade in animation'
    };
  }
  
  /**
   * Get all registered alternatives
   * 
   * @returns Map of all custom alternatives
   */
  public getAllAlternatives(): Map<string, AlternativeAnimation> {
    return new Map(this.customAlternatives);
  }
  
  /**
   * Clear all custom alternatives
   */
  public clearAlternatives(): void {
    this.customAlternatives.clear();
  }
}

/**
 * Get an instance of the alternative animations registry
 * @returns Alternative animations registry instance
 */
export const getAlternativesRegistry = (): AlternativeAnimationsRegistry => {
  return AlternativeAnimationsRegistry.getInstance();
};

/**
 * Get a reduced motion alternative for an animation
 * 
 * @param category Animation category
 * @param intensityLevel Intensity level
 * @param options Animation options
 * @returns CSS for the alternative animation
 */
export const getReducedMotionAlternative = (
  category: AnimationCategory,
  intensityLevel: MotionIntensityLevel = MotionIntensityLevel.MODERATE,
  options: {
    duration?: number;
    delay?: number | string;
    iterations?: number | string;
    fillMode?: string;
    direction?: string;
    playState?: string;
    easing?: string;
    preferredType?: AlternativeType;
  } = {}
): FlattenSimpleInterpolation => {
  // Get the best alternative
  const registry = getAlternativesRegistry();
  const alternative = registry.getBestAlternative(category, intensityLevel, options.preferredType);
  
  // If type is NONE, return empty styles
  if (alternative.type === AlternativeType.NONE) {
    return css``;
  }
  
  // Otherwise generate CSS for the alternative
  return generateReducedMotionCSS(alternative, {
    duration: options.duration || alternative.duration,
    delay: options.delay,
    iterations: options.iterations || (alternative.iterations as number | string),
    fillMode: options.fillMode,
    direction: options.direction,
    playState: options.playState,
    easing: options.easing || alternative.easing,
  });
};