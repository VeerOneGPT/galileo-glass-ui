import { useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useEnhancedReducedMotion } from './useEnhancedReducedMotion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { AnimationCategory } from '../types/accessibility';

/**
 * A hook that provides utilities for alternative animations
 * based on user's motion sensitivity preferences
 */
export const useAlternativeAnimations = (options: {
  motionSensitivity?: string;
  category?: AnimationCategory;
  disableAnimation?: boolean;
  baseDuration?: number;
} = {}) => {
  // Extract options
  const {
    motionSensitivity: propSensitivity,
    category = AnimationCategory.TRANSITION,
    disableAnimation: propDisableAnimation,
    baseDuration = 300
  } = options;

  // Get reduced motion preference from system
  const prefersReducedMotion = useReducedMotion();
  
  // Get enhanced motion detection
  const { 
    prefersReducedMotion: detectedReducedMotion,
    recommendedSensitivityLevel 
  } = useEnhancedReducedMotion({});
  
  // Get animation context values
  const { 
    disableAnimation: contextDisableAnimation,
    motionSensitivityLevel: contextSensitivity
  } = useAnimationContext();

  // Compute final values with default fallback to 'medium'
  const finalSensitivityLevel = useMemo(() => {
    return propSensitivity ?? 
           contextSensitivity ?? 
           recommendedSensitivityLevel ?? 
           'medium';
  }, [propSensitivity, contextSensitivity, recommendedSensitivityLevel]);

  const isAnimationDisabled = useMemo(() => {
    return propDisableAnimation ?? 
           contextDisableAnimation ?? 
           prefersReducedMotion;
  }, [propDisableAnimation, contextDisableAnimation, prefersReducedMotion]);

  // Determine if simplified animations should be used
  const useSimplifiedAnimations = useMemo(() => {
    return finalSensitivityLevel === 'low' || 
           detectedReducedMotion;
  }, [finalSensitivityLevel, detectedReducedMotion]);

  // Get adjusted animation duration
  const duration = useMemo(() => {
    // Simple duration adjustment based on sensitivity level
    let durationMultiplier = 1;
    if (finalSensitivityLevel === 'low') {
      durationMultiplier = category === AnimationCategory.ESSENTIAL ? 1.5 : 2;
    } else if (finalSensitivityLevel === 'medium') {
      durationMultiplier = 1.3;
    } else if (finalSensitivityLevel === 'high') {
      durationMultiplier = 1.1;
    }

    return isAnimationDisabled ? 0 : baseDuration * durationMultiplier;
  }, [isAnimationDisabled, baseDuration, finalSensitivityLevel, category]);

  // Create a transition string
  const createTransition = (properties: string[], options: { 
    duration?: number;
    easing?: string;
    delay?: number;
  } = {}) => {
    const { 
      duration: propDuration = duration,
      easing = 'ease-in-out',
      delay = 0
    } = options;
    
    return properties
      .map(prop => `${prop} ${propDuration}ms ${easing}${delay ? ` ${delay}ms` : ''}`)
      .join(', ');
  };
  
  // Create an animation string
  const createAnimation = (name: string, options: {
    duration?: number;
    easing?: string;
    delay?: number;
    iterations?: number | 'infinite';
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
    playState?: 'running' | 'paused';
  } = {}) => {
    const {
      duration: propDuration = duration,
      easing = 'ease-in-out',
      delay = 0,
      iterations = 1,
      direction = 'normal',
      fillMode = 'both',
      playState = 'running'
    } = options;
    
    return `${name} ${propDuration}ms ${easing} ${delay}ms ${iterations} ${direction} ${fillMode} ${playState}`;
  };

  // Return final result
  return {
    // Basic flags
    isAnimationDisabled,
    useSimplifiedAnimations,
    motionSensitivity: finalSensitivityLevel,
    
    // Duration
    duration,
    
    // Helper utilities
    createTransition,
    createAnimation,
    
    // Extra data
    animationCategory: category
  };
};

export default useAlternativeAnimations; 