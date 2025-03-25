/**
 * useAccessibleAnimationOptions Hook
 * 
 * Hook for creating accessible animation options based on user preferences
 */
import { useMemo } from 'react';
import { useMotionSettings } from './useMotionSettings';
import { AnimationOptions } from '../animations/utils/types';
import { REDUCED_MOTION_ALTERNATIVES } from '../animations/keyframes/reducedMotion';

/**
 * Hook to transform animation options based on motion preferences
 * 
 * @param baseOptions Base animation options
 * @returns Transformed animation options for accessibility
 */
export const useAccessibleAnimationOptions = (
  baseOptions: AnimationOptions
): AnimationOptions => {
  // Get motion settings
  const {
    prefersReducedMotion,
    useAlternativeAnimations,
    disableAnimations,
    durationMultiplier
  } = useMotionSettings();
  
  // Create accessible options based on user preferences
  const accessibleOptions = useMemo(() => {
    // If animations are disabled, return empty animation
    if (disableAnimations) {
      return {
        ...baseOptions,
        duration: 0.01,  // Nearly instant
        delay: 0,
        iterations: 1
      };
    }
    
    // If reduced motion or alternative animations are preferred
    if (prefersReducedMotion || useAlternativeAnimations) {
      // Find a suitable alternative animation
      const alternativeAnimation = baseOptions.secondaryAnimation || 
        REDUCED_MOTION_ALTERNATIVES[baseOptions.animation.toString() as keyof typeof REDUCED_MOTION_ALTERNATIVES] || 
        REDUCED_MOTION_ALTERNATIVES.fadeIn;
      
      // Use a shorter duration for reduced motion
      const reducedDuration = Math.min(
        (baseOptions.duration || 0.3) * 0.6,  // 60% of original duration
        0.3  // Maximum 300ms for reduced motion
      );
      
      return {
        ...baseOptions,
        animation: alternativeAnimation,
        duration: reducedDuration,
        easing: 'ease-out',  // Preference for ease-out with reduced motion
      };
    }
    
    // For standard animations, apply duration multiplier
    if (durationMultiplier !== 1) {
      return {
        ...baseOptions,
        duration: (baseOptions.duration || 0.3) * durationMultiplier
      };
    }
    
    // Return original options if no adjustments needed
    return baseOptions;
  }, [baseOptions, prefersReducedMotion, useAlternativeAnimations, disableAnimations, durationMultiplier]);
  
  return accessibleOptions;
};

/**
 * Hook that enhances animation options with automatic accessibility adjustments
 * 
 * @param animation The animation keyframes
 * @param options Additional animation options
 * @returns Animation options with accessibility adjustments
 */
export const useAnimationWithAccessibility = (
  animation: AnimationOptions['animation'],
  options: Partial<Omit<AnimationOptions, 'animation'>> = {}
): AnimationOptions => {
  // Create complete base options
  const baseOptions: AnimationOptions = {
    animation,
    duration: options.duration || 0.3,
    easing: options.easing || 'ease',
    delay: options.delay || 0,
    iterations: options.iterations || 1,
    direction: options.direction || 'normal',
    fillMode: options.fillMode || 'forwards',
    secondaryAnimation: options.secondaryAnimation
  };
  
  // Apply accessibility adjustments
  return useAccessibleAnimationOptions(baseOptions);
};