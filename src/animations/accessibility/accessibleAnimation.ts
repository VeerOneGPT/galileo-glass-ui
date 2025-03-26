/**
 * Accessible Animation Utilities
 * 
 * Core utilities for creating and managing accessible animations.
 */
import { keyframes, css, FlattenSimpleInterpolation, Keyframes } from 'styled-components';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { 
  MotionSensitivityLevel, 
  AnimationComplexity, 
  getMotionSensitivity, 
  getAdjustedAnimation 
} from './MotionSensitivity';
import { animationMapper } from './AnimationMapper';
import { presets } from '../presets';
import { AnimationPreset } from '../styled';
import { AccessibleAnimationOptions as AccessibleAnimOptions } from '../types';

/**
 * Options for accessible animations
 */
export interface AccessibleAnimationOptions {
  /** Animation duration */
  duration?: string | number;
  
  /** Animation delay */
  delay?: string | number;
  
  /** Animation timing function */
  easing?: string;
  
  /** Animation fill mode */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  
  /** Animation iteration count */
  iterations?: number | 'infinite';
  
  /** Animation direction */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  
  /** Animation play state */
  playState?: 'running' | 'paused';
  
  /** Animation complexity level */
  complexity?: AnimationComplexity;
  
  /** Motion sensitivity level */
  sensitivity?: MotionSensitivityLevel;
  
  /** Whether animation is background/decorative */
  isBackground?: boolean;
  
  /** Whether animation is on hover */
  isHover?: boolean;
  
  /** Whether animation is parallax effect */
  isParallax?: boolean;
  
  /** Whether animation autoplays */
  autoPlay?: boolean;
  
  /** Animation category */
  category?: 'entrance' | 'exit' | 'hover' | 'focus' | 'active' | 'loading' | 'background' | 'feedback';
  
  /** Alternative animation for reduced motion */
  alternate?: AnimationPreset | Keyframes | string;
  
  /** Whether user prefers reduced motion */
  prefersReducedMotion?: boolean;
  
  /** Accessibility mode */
  accessibilityMode?: 'auto' | 'standard' | 'reduced' | 'none';
}

/**
 * Format duration as CSS string
 * @param duration Duration in ms or CSS string
 * @returns Formatted CSS duration string
 */
const formatDuration = (duration?: string | number): string => {
  if (duration === undefined) {
    return '0.3s';
  }
  
  if (typeof duration === 'number') {
    return `${duration}ms`;
  }
  
  return duration;
};

/**
 * Create an accessible animation
 * @param animation Animation preset or keyframes
 * @param options Animation options
 * @returns CSS animation string or empty string if animation is disabled
 */
export const accessibleAnimation = (
  animation: AnimationPreset | Keyframes | string,
  options?: AccessibleAnimationOptions
): FlattenSimpleInterpolation => {
  const {
    duration,
    delay = '0s',
    easing = 'ease',
    fillMode = 'both',
    iterations = 1,
    direction = 'normal',
    playState = 'running',
    complexity = AnimationComplexity.STANDARD,
    sensitivity,
    isBackground = false,
    isHover = false,
    isParallax = false,
    autoPlay = true,
    category
  } = options || {};
  
  // Check if animation should be skipped based on motion settings
  const motionConfig = getMotionSensitivity(sensitivity);
  const adjustedAnimation = getAdjustedAnimation({
    duration: typeof duration === 'number' ? duration : 300,
    complexity,
    autoPlay,
    isBackground,
    isHover,
    isParallax
  }, motionConfig);
  
  // If animation is disabled, return empty styles
  if (!adjustedAnimation.shouldAnimate) {
    return css``;
  }
  
  // Map to accessible alternative if needed
  const mapped = animationMapper.getAccessibleAnimation(animation, {
    sensitivity: motionConfig.level,
    category,
    duration: adjustedAnimation.duration
  });
  
  // If no animation should be used, return empty styles
  if (!mapped.animation || !mapped.shouldAnimate) {
    return css``;
  }
  
  // Get the final keyframes
  let keyframeName: string;
  
  if (typeof mapped.animation === 'string') {
    keyframeName = mapped.animation;
  } else if ('keyframes' in mapped.animation && mapped.animation.keyframes) {
    keyframeName = mapped.animation.keyframes.name;
  } else if ('animation' in mapped.animation && mapped.animation.animation) {
    keyframeName = mapped.animation.animation.name;
  } else if ('name' in mapped.animation) {
    // Direct keyframes object
    keyframeName = mapped.animation.name;
  } else {
    // Fallback to using the animation id or a generated name
    keyframeName = `animation-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Create and return the animation CSS
  return css`
    animation-name: ${keyframeName};
    animation-duration: ${formatDuration(duration || mapped.duration)};
    animation-timing-function: ${easing};
    animation-delay: ${typeof delay === 'number' ? `${delay}ms` : delay};
    animation-fill-mode: ${fillMode};
    animation-iteration-count: ${iterations};
    animation-direction: ${direction};
    animation-play-state: ${playState};
  `;
};

/**
 * Hook for using accessible animations in components
 * @param animation Animation preset or keyframes
 * @param options Animation options
 * @returns CSS animation string or empty string if animation is disabled
 */
export const useAccessibleAnimation = (
  animation: AnimationPreset | Keyframes | string,
  options?: AccessibleAnimationOptions
): FlattenSimpleInterpolation => {
  const prefersReducedMotion = useReducedMotion();
  
  // If reduced motion is preferred, check for alternatives
  if (prefersReducedMotion) {
    const { 
      complexity = AnimationComplexity.STANDARD,
      sensitivity = MotionSensitivityLevel.MEDIUM,
      ...restOptions
    } = options || {};
    
    // Use medium sensitivity for reduced motion preference
    return accessibleAnimation(animation, {
      ...restOptions,
      complexity,
      sensitivity: MotionSensitivityLevel.MEDIUM
    });
  }
  
  // Otherwise use normal animation with provided options
  return accessibleAnimation(animation, options);
};

/**
 * Apply an animation conditionally
 * @param condition Whether to apply the animation
 * @param animation The animation to apply if condition is true
 * @param options Animation options
 * @returns CSS animation or empty string
 */
export const conditionalAnimation = (
  condition: boolean,
  animation: AnimationPreset | Keyframes | string,
  options?: AccessibleAnimationOptions
): FlattenSimpleInterpolation => {
  if (!condition) {
    return css``;
  }
  
  return accessibleAnimation(animation, options);
};

/**
 * Get keyframes for an accessible animation
 * @param animation Animation preset or keyframes
 * @param options Animation options
 * @returns The accessible keyframes or null if animation is disabled
 */
export const getAccessibleKeyframes = (
  animation: AnimationPreset | Keyframes | string,
  options?: AccessibleAnimationOptions
): Keyframes | null => {
  const { sensitivity, category } = options || {};
  
  // Get the motion sensitivity configuration
  const motionConfig = getMotionSensitivity(sensitivity);
  
  // Map to accessible alternative if needed
  const mapped = animationMapper.getAccessibleAnimation(animation, {
    sensitivity: motionConfig.level,
    category
  });
  
  // If no animation should be used, return null
  if (!mapped.animation || !mapped.shouldAnimate) {
    return null;
  }
  
  // Return the keyframes
  if (typeof mapped.animation === 'string') {
    // If string, find the corresponding preset
    const animationName = mapped.animation;
    
    // Look through all presets for matching name
    for (const presetKey in presets) {
      const preset = presets[presetKey as keyof typeof presets];
      
      // Skip non-object properties or ones without keyframes
      if (typeof preset !== 'object' || !preset || !('keyframes' in preset)) {
        continue;
      }
      
      // Check if this preset's keyframes name matches
      if (preset.keyframes && preset.keyframes.name === animationName) {
        return preset.keyframes;
      }
    }
    
    return null;
  } else if (mapped.animation && typeof mapped.animation === 'object' && 'keyframes' in mapped.animation) {
    return mapped.animation.keyframes;
  } else {
    // If it's already a Keyframes object
    return mapped.animation as unknown as Keyframes;
  }
};