/**
 * Accessible Animation Utilities
 *
 * Core utilities for creating and managing accessible animations.
 */
import { css, FlattenSimpleInterpolation, Keyframes } from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationSpeed } from '../../hooks/useAnimationSpeed';
import { presets } from '../presets';
import { AnimationPreset, AccessibleAnimationOptions } from '../core/types';

import { animationMapper } from './AnimationMapper';
import {
  MotionSensitivityLevel,
  AnimationComplexity,
  AnimationCategory,
  getMotionSensitivity,
  getAdjustedAnimation,
} from './MotionSensitivity';
import { getSpeedController, applyAnimationSpeedAdjustment } from './AnimationSpeedController';

/**
 * Options for accessible animations - local type that extends the global one
 * @see AccessibleAnimationOptions in ../types.ts for complete documentation
 */
export interface AnimOptionsWithLocalProps extends AccessibleAnimationOptions {
  /** Whether animation is background/decorative */
  isBackground?: boolean;

  /** Whether animation is on hover */
  isHover?: boolean;

  /** Whether animation is parallax effect */
  isParallax?: boolean;

  /** Whether animation autoplays */
  autoPlay?: boolean;

  /** Animation category */
  category?:
    | 'entrance'
    | 'exit'
    | 'hover'
    | 'focus'
    | 'active'
    | 'loading'
    | 'background'
    | 'feedback';

  /**
   * Motion sensitivity level
   * @deprecated Use motionSensitivity from AccessibleAnimationOptions instead
   */
  sensitivity?: MotionSensitivityLevel;
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
  options?: AnimOptionsWithLocalProps
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
    motionSensitivity,
    isBackground = false,
    isHover = false,
    isParallax = false,
    autoPlay = true,
    category,
  } = options || {};

  // Check if animation should be skipped based on motion settings
  // For backward compatibility, try sensitivity first, then motionSensitivity
  const sensitivityLevel = sensitivity || motionSensitivity;
  const motionConfig = getMotionSensitivity(sensitivityLevel);
  const adjustedAnimation = getAdjustedAnimation(
    {
      duration: typeof duration === 'number' ? duration : 300,
      complexity: complexity as AnimationComplexity,
      autoPlay,
      isBackground,
      isHover,
      isParallax,
    },
    motionConfig
  );

  // If animation is disabled, return empty styles
  if (!adjustedAnimation.shouldAnimate) {
    return css``;
  }

  // Map to accessible alternative if needed
  const mapped = animationMapper.getAccessibleAnimation(animation, {
    sensitivity: motionConfig.level,
    category,
    duration: adjustedAnimation.duration,
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
    keyframeName = typeof mapped.animation.keyframes === 'string' 
      ? mapped.animation.keyframes 
      : mapped.animation.keyframes.name || 'unknown-animation';
  } else if ('animation' in mapped.animation && mapped.animation.animation) {
    keyframeName = typeof mapped.animation.animation === 'string'
      ? mapped.animation.animation
      : (mapped.animation.animation as Keyframes).name || 'unknown-animation';
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
  options?: AnimOptionsWithLocalProps
): FlattenSimpleInterpolation => {
  const prefersReducedMotion = useReducedMotion();
  
  // Get animation category for speed adjustments
  const category = options?.category as AnimationCategory | undefined;

  // If reduced motion is preferred, check for alternatives
  if (prefersReducedMotion) {
    const {
      complexity = AnimationComplexity.STANDARD,
      sensitivity,
      motionSensitivity,
      ...restOptions
    } = options || {};

    // Use sensitivity if provided, otherwise motionSensitivity, or default to MEDIUM
    const _sensitivityLevel = sensitivity || motionSensitivity || MotionSensitivityLevel.MEDIUM;

    // Create accessible animation with medium sensitivity for reduced motion preference
    const baseAnimation = accessibleAnimation(animation, {
      ...restOptions,
      complexity: complexity as any,
      motionSensitivity: MotionSensitivityLevel.MEDIUM as any,
    });
    
    // Apply animation speed adjustment
    const duration = typeof restOptions.duration === 'number' 
      ? restOptions.duration 
      : 300;
      
    return applyAnimationSpeedAdjustment(baseAnimation, duration, category);
  }

  // Otherwise use normal animation with provided options, but still apply speed adjustment
  const baseAnimation = accessibleAnimation(animation, options);
  
  // Apply animation speed adjustment
  const duration = typeof options?.duration === 'number' 
    ? options.duration 
    : 300;
    
  return applyAnimationSpeedAdjustment(baseAnimation, duration, category);
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
  options?: AnimOptionsWithLocalProps
): FlattenSimpleInterpolation => {
  if (!condition) {
    return css``;
  }

  // Use useAccessibleAnimation to get animation with speed adjustment
  return useAccessibleAnimation(animation, options);
};

/**
 * Get keyframes for an accessible animation
 * @param animation Animation preset or keyframes
 * @param options Animation options
 * @returns The accessible keyframes or null if animation is disabled
 */
export const getAccessibleKeyframes = (
  animation: AnimationPreset | Keyframes | string,
  options?: AnimOptionsWithLocalProps
): Keyframes | null => {
  const { sensitivity, motionSensitivity, category } = options || {};
  // For backward compatibility, try sensitivity first, then motionSensitivity
  const sensitivityLevel = sensitivity || motionSensitivity;

  // Get the motion sensitivity configuration
  const motionConfig = getMotionSensitivity(sensitivityLevel);

  // Map to accessible alternative if needed
  const mapped = animationMapper.getAccessibleAnimation(animation, {
    sensitivity: motionConfig.level,
    category,
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
      if (preset.keyframes && 
          typeof preset.keyframes === 'object' && 
          'name' in preset.keyframes && 
          preset.keyframes.name === animationName) {
        // Return the found keyframes with proper type assertion
        return preset.keyframes as Keyframes;
      }
    }

    return null;
  } else if (
    mapped.animation &&
    typeof mapped.animation === 'object' &&
    'keyframes' in mapped.animation
  ) {
    return typeof mapped.animation.keyframes === 'string'
      ? null // Can't return a string as Keyframes
      : mapped.animation.keyframes;
  } else {
    // If it's already a Keyframes object or needs to be cast as one
    return (mapped.animation && typeof mapped.animation === 'object' && 'name' in mapped.animation) 
      ? (mapped.animation as Keyframes) 
      : null;
  }
};
