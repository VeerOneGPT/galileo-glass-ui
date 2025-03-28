/**
 * useReducedMotionAlternative Hook
 * 
 * Hook for using reduced motion alternatives in components
 */
import { useMemo } from 'react';
import { FlattenSimpleInterpolation } from 'styled-components';

import { 
  getReducedMotionAlternative, 
  AlternativeType
} from '../animations/accessibility/ReducedMotionAlternatives';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';
import { MotionIntensityLevel } from '../animations/accessibility/MotionIntensityProfiler';
import { useReducedMotion } from './useReducedMotion';
import { useEnhancedReducedMotion } from './useEnhancedReducedMotion';
import { useMotionProfiler } from './useMotionProfiler';

/**
 * Hook for getting appropriate animation based on reduced motion preferences
 * 
 * @param originalAnimation Original animation CSS
 * @param options Animation options
 * @returns Appropriate animation CSS based on motion preferences
 */
export const useReducedMotionAlternative = (
  originalAnimation: FlattenSimpleInterpolation,
  options: {
    /** Unique animation ID for profiling */
    id?: string;
    
    /** Animation category */
    category?: AnimationCategory;
    
    /** Animation duration in ms */
    duration?: number;
    
    /** Animation complexity */
    intensity?: MotionIntensityLevel;
    
    /** Animation delay in ms or string */
    delay?: number | string;
    
    /** Animation iterations */
    iterations?: number | string;
    
    /** Animation fill mode */
    fillMode?: string;
    
    /** Animation direction */
    direction?: string;
    
    /** Animation play state */
    playState?: string;
    
    /** Animation easing */
    easing?: string;
    
    /** Preferred alternative type */
    preferredAlternative?: AlternativeType;
    
    /** Whether to respect prefers-reduced-motion */
    respectReducedMotion?: boolean;
    
    /** Whether to force using alternative */
    forceAlternative?: boolean;
    
    /** Whether this is an important animation */
    isImportant?: boolean;
  } = {}
): FlattenSimpleInterpolation => {
  const {
    id,
    category = AnimationCategory.ENTRANCE,
    duration = 300,
    intensity = MotionIntensityLevel.MODERATE,
    delay,
    iterations,
    fillMode,
    direction,
    playState,
    easing,
    preferredAlternative,
    respectReducedMotion = true,
    forceAlternative = false,
    isImportant = false,
  } = options;
  
  // Get basic reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Get enhanced reduced motion information if ID provided
  const enhancedMotionInfo = useEnhancedReducedMotion();
  
  // Get motion profile if ID provided
  const motionProfile = id ? useMotionProfiler(id, {
    category,
    duration,
    importance: isImportant ? 8 : 5,
  }) : null;
  
  // Determine if we should use alternative animation
  const shouldUseAlternative = useMemo(() => {
    // Force alternative if specified
    if (forceAlternative) {
      return true;
    }
    
    // If not respecting reduced motion preference, use original
    if (!respectReducedMotion) {
      return false;
    }
    
    // If using motion profiler and it recommends reduced motion
    if (motionProfile && motionProfile.shouldReduceMotion) {
      return true;
    }
    
    // Use enhanced reduced motion info if available
    if (enhancedMotionInfo && enhancedMotionInfo.prefersReducedMotion) {
      return true;
    }
    
    // Fall back to basic reduced motion preference
    return prefersReducedMotion;
  }, [
    forceAlternative, 
    respectReducedMotion, 
    motionProfile, 
    enhancedMotionInfo, 
    prefersReducedMotion
  ]);
  
  // Get appropriate animation
  return useMemo(() => {
    if (!shouldUseAlternative) {
      return originalAnimation;
    }
    
    // Get the alternative based on category and intensity
    return getReducedMotionAlternative(
      category,
      // Use profile intensity if available, otherwise use provided intensity
      motionProfile?.profile.intensityLevel || intensity,
      {
        duration,
        delay,
        iterations,
        fillMode,
        direction,
        playState,
        easing,
        preferredType: preferredAlternative,
      }
    );
  }, [
    shouldUseAlternative,
    originalAnimation,
    category,
    motionProfile?.profile.intensityLevel,
    intensity,
    duration,
    delay,
    iterations,
    fillMode,
    direction,
    playState,
    easing,
    preferredAlternative,
  ]);
};

/**
 * Flexible hook for getting either original or alternative animation
 * based on the current animation state and motion preferences
 * 
 * @param options Animation options
 * @returns Appropriate animation CSS
 */
export const useFlexibleAnimation = (
  options: {
    /** Whether the animation is currently active */
    animate: boolean;
    
    /** Original animation CSS */
    originalAnimation: FlattenSimpleInterpolation;
    
    /** Unique animation ID for profiling */
    id?: string;
    
    /** Animation category */
    category?: AnimationCategory;
    
    /** Animation duration in ms */
    duration?: number;
    
    /** Animation complexity */
    intensity?: MotionIntensityLevel;
    
    /** Animation delay in ms or string */
    delay?: number | string;
    
    /** Animation iterations */
    iterations?: number | string;
    
    /** Animation fill mode */
    fillMode?: string;
    
    /** Animation direction */
    direction?: string;
    
    /** Animation play state */
    playState?: string;
    
    /** Animation easing */
    easing?: string;
    
    /** Preferred alternative type */
    preferredAlternative?: AlternativeType;
    
    /** Whether to respect prefers-reduced-motion */
    respectReducedMotion?: boolean;
    
    /** Whether to force using alternative */
    forceAlternative?: boolean;
    
    /** Whether this is an important animation */
    isImportant?: boolean;
  }
): FlattenSimpleInterpolation => {
  const {
    animate,
    originalAnimation,
    ...restOptions
  } = options;
  
  // Get reduced motion alternative
  const alternativeAnimation = useReducedMotionAlternative(originalAnimation, restOptions);
  
  // Return appropriate animation based on animate flag
  return animate ? alternativeAnimation : '';
};

// Export types for convenience
export { AlternativeType } from '../animations/accessibility/ReducedMotionAlternatives';