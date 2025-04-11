/**
 * Intelligent Animation Fallbacks
 *
 * Provides mechanisms for automatically determining and applying appropriate
 * animation fallbacks based on user preferences, device capabilities, and
 * context.
 */

import { css, keyframes, Keyframes, FlattenSimpleInterpolation } from 'styled-components';
import { 
  AnimationPreset, 
  AccessibleAnimationOptions
} from '../core/types'; // Keep core types needed
import { 
  AnimationCategory, 
  AnimationComplexity, // Use AnimationComplexity from MotionSensitivity
  getMotionSensitivity,
  getAdjustedAnimation,
  EnhancedAnimationOptions, 
  MotionSensitivityLevel,
  MotionSensitivityConfig, // Import MotionSensitivityConfig
  AnimationDistanceScale // Import AnimationDistanceScale
} from './MotionSensitivity';
import { animationMapper } from './AnimationMapper';
import { 
  useEnhancedReducedMotion, 
  EnhancedReducedMotionInfo 
} from '../../hooks/useEnhancedReducedMotion';

/**
 * Animation fallback behavior types
 */
export enum AnimationFallbackType {
  /** Use original animation */
  ORIGINAL = 'original',
  
  /** Use fade-only animation (no movement) */
  FADE_ONLY = 'fade_only',
  
  /** Use simplified version with less movement */
  SIMPLIFIED = 'simplified',
  
  /** Skip animation entirely */
  SKIP = 'skip',
  
  /** Use a static image instead of animation */
  STATIC_IMAGE = 'static_image',
  
  /** Reduce distance/scale of the animation */
  REDUCED_MAGNITUDE = 'reduced_magnitude',
  
  /** Reduce speed of the animation */
  REDUCED_SPEED = 'reduced_speed',
  
  /** Smart fallback */
  SMART = 'smart',
}

/**
 * Animation fallback configuration
 */
export interface AnimationFallbackConfig {
  /** Type of fallback to use */
  type: AnimationFallbackType;
  
  /** Adjusted duration (if applicable) */
  duration?: number;
  
  /** Adjusted distance scale (if applicable) */
  distanceScale?: number;
  
  /** Adjusted speed multiplier (if applicable) */
  speedMultiplier?: number;
  
  /** Alternative animation to use (if applicable) */
  alternativeAnimation?: AnimationPreset | Keyframes | string | null;
  
  /** Static URI to display instead of animation (if applicable) */
  staticUri?: string;
  
  // Removed properties that come from EnhancedReducedMotionInfo
}

/**
 * Generate simple fade-only keyframes
 * @returns Fade-only keyframes
 */
export const generateFadeOnlyKeyframes = (): Keyframes => {
  const fadeOnlyKeyframes = keyframes`
    @keyframes fade-only {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `;
  return fadeOnlyKeyframes;
};

/**
 * Generate reduced magnitude keyframes based on an existing animation
 * @param originalName Original animation name
 * @param scale Scale factor (0-1)
 * @returns Reduced magnitude keyframes name
 */
export const generateReducedMagnitudeAnimation = (
  originalName: string,
  scale: number
): string => {
  return `${originalName}-reduced-magnitude-${Math.round(scale * 100)}`;
};

/**
 * Determine the most appropriate fallback for an animation based on user preferences
 * 
 * @param animation Original animation preset or keyframes
 * @param options Animation options
 * @param reducedMotionInfo Information about the user's reduced motion preference
 * @param sensitivityConfig The resolved motion sensitivity configuration to use
 * @param confidence Optional confidence score for reduced motion detection
 * @returns Appropriate fallback configuration
 */
export const determineAnimationFallback = (
  animation: AnimationPreset | Keyframes | string,
  options: EnhancedAnimationOptions,
  reducedMotionInfo: EnhancedReducedMotionInfo, // Use the specific type from the hook
  sensitivityConfig: MotionSensitivityConfig, // Pass the config explicitly
  confidence?: number // Pass confidence separately
): AnimationFallbackConfig => {
  // Destructure only prefersReducedMotion from the hook result
  const { 
    prefersReducedMotion, 
  } = reducedMotionInfo;
  
  const {
    complexity = AnimationComplexity.STANDARD,
    duration = 300,
    category = AnimationCategory.ENTRANCE,
    distance = 50,
    autoPlay = false,
    isBackground = false,
    isHover = false,
    isParallax = false,
    importance = 5,
  } = options;
  
  // Use the passed sensitivityConfig directly
  
  // If user doesn't prefer reduced motion and importance is high, use original
  if (!prefersReducedMotion && importance >= 7) {
    return {
      type: AnimationFallbackType.ORIGINAL,
      duration,
      // Removed properties now passed via reducedMotionInfo/sensitivityConfig
    };
  }
  
  // Get adjusted animation parameters using the passed sensitivityConfig
  const adjustedAnimation = getAdjustedAnimation(options, sensitivityConfig);
  
  // If animation should be disabled, skip it entirely
  if (!adjustedAnimation.shouldAnimate) {
    return {
      type: AnimationFallbackType.SKIP,
    };
  }
  
  // For background or decorative animations with low importance, prefer skipping
  // Use the passed confidence value if available
  if ((isBackground || importance <= 3) && prefersReducedMotion && confidence && confidence > 0.6) {
    return {
      type: AnimationFallbackType.SKIP,
    };
  }
  
  // For parallax effects, either skip or significantly reduce
  if (isParallax && prefersReducedMotion) {
    if (confidence && confidence > 0.7) {
      return {
        type: AnimationFallbackType.SKIP,
      };
    } else {
      return {
        type: AnimationFallbackType.REDUCED_MAGNITUDE,
        distanceScale: 0.1,
        duration: Math.max(300, duration * 1.5),
      };
    }
  }
  
  // For auto-playing animations, consider user preferences more strongly
  if (autoPlay && prefersReducedMotion && confidence && confidence > 0.5) {
    // Check category-specific settings
    if (sensitivityConfig.categorySettings[category]?.enabled === false) {
      return {
        type: AnimationFallbackType.SKIP,
      };
    }
    
    // For lower importance auto-play animations, prefer static or fade-only
    if (importance <= 5) {
      return {
        type: AnimationFallbackType.FADE_ONLY,
        duration: adjustedAnimation.duration,
      };
    }
  }
  
  // For hover animations, respect user preferences
  if (isHover && sensitivityConfig.disableHoverAnimations) {
    return {
      type: AnimationFallbackType.SKIP,
    };
  }
  
  // Check mapped animations from animation mapper
  const mappedAnimation = animationMapper.getAccessibleAnimation(animation, {
    sensitivity: sensitivityConfig.level, // Use level from the passed config
    category,
    duration: adjustedAnimation.duration,
  });
  
  // If mapper suggests an alternative animation, use that
  if (mappedAnimation.animation && mappedAnimation.animation !== animation) {
    return {
      type: AnimationFallbackType.SIMPLIFIED,
      alternativeAnimation: mappedAnimation.animation,
      duration: mappedAnimation.duration,
      speedMultiplier: adjustedAnimation.speedMultiplier,
    };
  }
  
  // Apply reduced magnitude if distance scale is significantly reduced
  if (adjustedAnimation.distanceScale < 0.5) {
    return {
      type: AnimationFallbackType.REDUCED_MAGNITUDE,
      distanceScale: adjustedAnimation.distanceScale,
      duration: adjustedAnimation.duration,
      speedMultiplier: adjustedAnimation.speedMultiplier,
    };
  }
  
  // Apply reduced speed if speed multiplier is significantly different
  if (adjustedAnimation.speedMultiplier < 0.7) {
    return {
      type: AnimationFallbackType.REDUCED_SPEED,
      duration: adjustedAnimation.duration,
      speedMultiplier: adjustedAnimation.speedMultiplier,
    };
  }
  
  // For minimal animation complexity, use fade-only
  // Compare using AnimationComplexity from MotionSensitivity.ts
  if (sensitivityConfig.maxAllowedComplexity === AnimationComplexity.MINIMAL ||
      sensitivityConfig.maxAllowedComplexity === AnimationComplexity.FADE_ONLY) { 
    return {
      type: AnimationFallbackType.FADE_ONLY,
      duration: adjustedAnimation.duration,
    };
  }
  
  // If no specific fallback needed, apply adjusted parameters to original
  return {
    type: AnimationFallbackType.ORIGINAL,
    duration: adjustedAnimation.duration,
    distanceScale: adjustedAnimation.distanceScale,
    speedMultiplier: adjustedAnimation.speedMultiplier,
  };
};

/**
 * Apply an animation fallback to generate the appropriate CSS
 * 
 * @param animation Original animation preset or keyframes
 * @param fallback Fallback configuration (now simpler)
 * @param options Animation options
 * @returns CSS for the animation with fallback applied
 */
export const applyAnimationFallback = (
  animation: AnimationPreset | Keyframes | string,
  fallback: AnimationFallbackConfig, // This interface is now simpler
  options: Omit<AccessibleAnimationOptions, 'duration'> = {}
): FlattenSimpleInterpolation => {
  const {
    type,
    duration = 300,
    distanceScale = 1.0,
    speedMultiplier = 1.0,
    alternativeAnimation,
    staticUri,
    // Removed properties that are not part of the simplified fallback config
  } = fallback;
  
  const {
    delay = '0s',
    easing = 'ease',
    fillMode = 'both',
    iterations = 1,
    direction = 'normal',
    playState = 'running',
  } = options;
  
  // Format duration string
  const formatDuration = (ms: number): string => {
    return `${ms}ms`;
  };
  
  // Handle different fallback types
  switch (type) {
    case AnimationFallbackType.SKIP:
      // Return empty styles for skip
      return css``;
      
    case AnimationFallbackType.FADE_ONLY:
      // Use fade-only animation
      return css`
        animation-name: fade-only;
        animation-duration: ${formatDuration(duration)};
        animation-timing-function: ${easing};
        animation-delay: ${typeof delay === 'number' ? `${delay}ms` : delay};
        animation-fill-mode: ${fillMode};
        animation-iteration-count: ${iterations};
        animation-direction: ${direction};
        animation-play-state: ${playState};
        
        @keyframes fade-only {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `;
      
    case AnimationFallbackType.SIMPLIFIED:
      // Use alternative animation if available
      if (alternativeAnimation) {
        let keyframeName: string;
        
        if (typeof alternativeAnimation === 'string') {
          keyframeName = alternativeAnimation;
        } else if ('keyframes' in alternativeAnimation && alternativeAnimation.keyframes) {
          keyframeName = typeof alternativeAnimation.keyframes === 'string'
            ? alternativeAnimation.keyframes
            : (alternativeAnimation.keyframes as Keyframes).name || 'unknown-animation';
        } else if ('animation' in alternativeAnimation && alternativeAnimation.animation) {
          keyframeName = typeof alternativeAnimation.animation === 'string'
            ? alternativeAnimation.animation
            : (alternativeAnimation.animation as Keyframes).name || 'unknown-animation';
        } else {
          // Fallback to a generated name
          keyframeName = `animation-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        return css`
          animation-name: ${keyframeName};
          animation-duration: ${formatDuration(duration)};
          animation-timing-function: ${easing};
          animation-delay: ${typeof delay === 'number' ? `${delay}ms` : delay};
          animation-fill-mode: ${fillMode};
          animation-iteration-count: ${iterations};
          animation-direction: ${direction};
          animation-play-state: ${playState};
        `;
      }
      
      // Fallback to fade-only if no alternative
      // Pass only necessary properties for FADE_ONLY
      return applyAnimationFallback(
        animation, 
        {
          type: AnimationFallbackType.FADE_ONLY,
          duration, // Pass duration
          // No need to pass other properties like prefersReducedMotion here
        },
        options
      );
      
    case AnimationFallbackType.STATIC_IMAGE:
      // For static image, don't use animation but set background image
      if (staticUri) {
        return css`
          background-image: url(${staticUri});
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
        `;
      }
      
      // If no static URI provided, skip animation
      return css``;
      
    case AnimationFallbackType.REDUCED_MAGNITUDE:
    case AnimationFallbackType.REDUCED_SPEED:
    case AnimationFallbackType.ORIGINAL:
    default:
      // For original or reduced magnitude/speed, use original animation with adjusted parameters
      let keyframeName: string;
      
      if (typeof animation === 'string') {
        keyframeName = animation;
      } else if ('keyframes' in animation && animation.keyframes) {
        keyframeName = typeof animation.keyframes === 'string'
          ? animation.keyframes
          : (animation.keyframes as Keyframes).name || 'unknown-animation';
      } else if ('animation' in animation && animation.animation) {
        keyframeName = typeof animation.animation === 'string'
          ? animation.animation
          : (animation.animation as Keyframes).name || 'unknown-animation';
      } else {
        // Fallback to a generated name
        keyframeName = `animation-${Math.random().toString(36).substring(2, 9)}`;
      }
      
      // Return animation CSS with adjusted duration
      return css`
        animation-name: ${keyframeName};
        animation-duration: ${formatDuration(duration)};
        animation-timing-function: ${easing};
        animation-delay: ${typeof delay === 'number' ? `${delay}ms` : delay};
        animation-fill-mode: ${fillMode};
        animation-iteration-count: ${iterations};
        animation-direction: ${direction};
        animation-play-state: ${playState};
        transform-origin: center;
        
        /* Scale transforms by distance scale if reduced magnitude */
        ${type === AnimationFallbackType.REDUCED_MAGNITUDE && distanceScale !== 1.0 ? css`
          --galileo-distance-scale: ${distanceScale};
        ` : ''}
      `;
  }
};

/**
 * Hook for using intelligent animation fallbacks in components
 * 
 * @param animation Animation preset or keyframes
 * @param options Animation options
 * @returns CSS animation string with appropriate fallbacks
 */
export const useIntelligentAnimationFallbacks = (
  animation: AnimationPreset | Keyframes | string,
  options: EnhancedAnimationOptions & Omit<AccessibleAnimationOptions, 'duration'> = {}
): FlattenSimpleInterpolation => {
  // Get reduced motion preference info from the hook
  const reducedMotionInfo = useEnhancedReducedMotion();
  
  // --- Determine sensitivity level and confidence (Needs implementation) ---
  // Placeholder: Determine sensitivity level based on context or options
  // Example: Could come from component props, context, or be calculated
  const sensitivityLevel: MotionSensitivityLevel = MotionSensitivityLevel.MEDIUM; // TODO: Replace placeholder
  const confidence: number | undefined = undefined; // TODO: Determine confidence if needed
  
  // Get the motion sensitivity config based on the determined level
  const sensitivityConfig = getMotionSensitivity(sensitivityLevel);
  // --- End Placeholder ---
  
  // Determine appropriate fallback by passing the necessary info
  const fallback = determineAnimationFallback(
    animation, 
    options, 
    reducedMotionInfo, 
    sensitivityConfig, 
    confidence
  );
  
  // Apply fallback
  return applyAnimationFallback(animation, fallback, options);
};

/**
 * Applies an animation with intelligent fallbacks conditionally
 * 
 * @param condition Whether to apply the animation
 * @param animation The animation to apply if condition is true
 * @param options Animation options
 * @returns CSS animation with appropriate fallbacks or empty string
 */
export const conditionalIntelligentAnimation = (
  condition: boolean,
  animation: AnimationPreset | Keyframes | string,
  options: EnhancedAnimationOptions & Omit<AccessibleAnimationOptions, 'duration'> = {}
): FlattenSimpleInterpolation => {
  if (!condition) {
    return css``;
  }
  
  return useIntelligentAnimationFallbacks(animation, options);
};