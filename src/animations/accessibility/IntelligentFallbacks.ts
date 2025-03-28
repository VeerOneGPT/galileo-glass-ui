/**
 * Intelligent Animation Fallbacks
 * 
 * Provides intelligent fallbacks for animations based on user preferences
 */
import { css, FlattenSimpleInterpolation, Keyframes } from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useEnhancedReducedMotion, EnhancedReducedMotionInfo } from '../../hooks/useEnhancedReducedMotion';
import { AnimationPreset, AccessibleAnimationOptions } from '../types';
import { presets } from '../presets';

import { animationMapper } from './AnimationMapper';
import {
  MotionSensitivityLevel,
  AnimationComplexity,
  AnimationCategory,
  getMotionSensitivity,
  getAdjustedAnimation,
  EnhancedAnimationOptions,
} from './MotionSensitivity';

/**
 * Animation fallback type
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
}

/**
 * Generate simple fade-only keyframes
 * @returns Fade-only keyframes
 */
export const generateFadeOnlyKeyframes = (): Keyframes => {
  return css`
    @keyframes fade-only {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `;
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
 * @param reducedMotionInfo Enhanced reduced motion information
 * @returns Appropriate fallback configuration
 */
export const determineAnimationFallback = (
  animation: AnimationPreset | Keyframes | string,
  options: EnhancedAnimationOptions,
  reducedMotionInfo: EnhancedReducedMotionInfo
): AnimationFallbackConfig => {
  const { 
    prefersReducedMotion, 
    confidence, 
    recommendedSensitivityLevel,
    detectionMethod
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
  
  // If user doesn't prefer reduced motion and importance is high, use original
  if (!prefersReducedMotion && importance >= 7) {
    return {
      type: AnimationFallbackType.ORIGINAL,
      duration,
    };
  }
  
  // Get motion sensitivity configuration
  const sensitivityConfig = getMotionSensitivity(recommendedSensitivityLevel);
  
  // Get adjusted animation parameters
  const adjustedAnimation = getAdjustedAnimation(options, sensitivityConfig);
  
  // If animation should be disabled, skip it entirely
  if (!adjustedAnimation.shouldAnimate) {
    return {
      type: AnimationFallbackType.SKIP,
    };
  }
  
  // For background or decorative animations with low importance, prefer skipping
  if ((isBackground || importance <= 3) && prefersReducedMotion && confidence > 0.6) {
    return {
      type: AnimationFallbackType.SKIP,
    };
  }
  
  // For parallax effects, either skip or significantly reduce
  if (isParallax && prefersReducedMotion) {
    if (confidence > 0.7) {
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
  if (autoPlay && prefersReducedMotion && confidence > 0.5) {
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
    sensitivity: recommendedSensitivityLevel,
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
 * @param fallback Fallback configuration
 * @returns CSS for the animation with fallback applied
 */
export const applyAnimationFallback = (
  animation: AnimationPreset | Keyframes | string,
  fallback: AnimationFallbackConfig,
  options: Omit<AccessibleAnimationOptions, 'duration'> = {}
): FlattenSimpleInterpolation => {
  const {
    type,
    duration = 300,
    distanceScale = 1.0,
    speedMultiplier = 1.0,
    alternativeAnimation,
    staticUri,
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
          keyframeName = alternativeAnimation.keyframes.name;
        } else if ('animation' in alternativeAnimation && alternativeAnimation.animation) {
          keyframeName = alternativeAnimation.animation.name;
        } else if ('name' in alternativeAnimation) {
          keyframeName = alternativeAnimation.name;
        } else {
          // Fallback to fade-only if can't determine name
          return applyAnimationFallback(
            animation, 
            { type: AnimationFallbackType.FADE_ONLY, duration }, 
            options
          );
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
      return applyAnimationFallback(
        animation, 
        { type: AnimationFallbackType.FADE_ONLY, duration }, 
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
        keyframeName = animation.keyframes.name;
      } else if ('animation' in animation && animation.animation) {
        keyframeName = animation.animation.name;
      } else if ('name' in animation) {
        keyframeName = animation.name;
      } else {
        // Fallback to fade-only if can't determine name
        return applyAnimationFallback(
          animation, 
          { type: AnimationFallbackType.FADE_ONLY, duration }, 
          options
        );
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
  // Get enhanced reduced motion information
  const reducedMotionInfo = useEnhancedReducedMotion();
  
  // Determine appropriate fallback
  const fallback = determineAnimationFallback(animation, options, reducedMotionInfo);
  
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