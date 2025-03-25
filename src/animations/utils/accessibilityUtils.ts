/**
 * Animation Accessibility Utilities
 * 
 * Utilities for creating accessible animations
 */
import { css } from 'styled-components';
import { AnimationOptions } from '../utils/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { REDUCED_MOTION_MAP } from '../keyframes/motion';
import { cssWithKebabProps } from '../../core/cssUtils';

/**
 * Creates a CSS transition with accessibility considerations
 */
export const createAccessibleTransition = (options: {
  /**
   * Properties to transition
   */
  properties: string[];
  
  /**
   * Duration of the transition in seconds
   */
  duration?: number;
  
  /**
   * Easing function for the transition
   */
  easing?: string;
  
  /**
   * Delay before the transition starts in seconds
   */
  delay?: number;
}) => {
  const {
    properties,
    duration = 0.2,
    easing = 'ease',
    delay = 0,
  } = options;
  
  // Join properties with commas
  const propertiesString = properties.join(', ');
  
  // Create standard transition
  const standardTransition = `
    transition-property: ${propertiesString};
    transition-duration: ${duration}s;
    transition-timing-function: ${easing};
    transition-delay: ${delay}s;
  `;
  
  // Create reduced motion transition
  const reducedMotionTransition = `
    transition-property: ${propertiesString};
    transition-duration: ${Math.min(duration, 0.1)}s;
    transition-timing-function: ${easing};
    transition-delay: ${delay}s;
  `;
  
  // Apply based on user preference
  return cssWithKebabProps`
    @media (prefers-reduced-motion: no-preference) {
      ${standardTransition}
    }
    
    @media (prefers-reduced-motion: reduce) {
      ${reducedMotionTransition}
    }
  `;
};

/**
 * Finds an appropriate reduced motion alternative for a given animation
 * 
 * @param animation The original animation keyframes
 * @returns The reduced motion alternative or fallback
 */
export const getReducedMotionAlternative = (animation: any) => {
  // Check if we have a direct mapping for this animation
  const animationName = Object.keys(REDUCED_MOTION_MAP).find(key => 
    REDUCED_MOTION_MAP[key as keyof typeof REDUCED_MOTION_MAP] === animation
  );
  
  if (animationName) {
    return REDUCED_MOTION_MAP[animationName as keyof typeof REDUCED_MOTION_MAP];
  }
  
  // Default to simple opacity fade
  return REDUCED_MOTION_MAP.contentFadeIn;
};

/**
 * Adjusts animation options based on reduced motion preference
 * 
 * @param options Original animation options
 * @param prefersReducedMotion Whether reduced motion is preferred
 * @returns Adjusted animation options
 */
export const adjustAnimationForReducedMotion = (
  options: AnimationOptions,
  prefersReducedMotion: boolean
): AnimationOptions => {
  if (!prefersReducedMotion) {
    return options;
  }
  
  // Find reduced motion alternative
  const alternativeAnimation = options.secondaryAnimation || 
    getReducedMotionAlternative(options.animation);
  
  // Adjust duration for reduced motion
  const reducedDuration = Math.min(options.duration || 0.3, 0.3);
  
  return {
    ...options,
    animation: alternativeAnimation,
    duration: reducedDuration,
    // Prefer ease-out for reduced motion
    easing: options.easing || 'ease-out',
  };
};

/**
 * Creates a fade alternative to a movement-based animation
 * 
 * @param useFade Whether to use fade effects
 * @returns CSS properties
 */
export const createMotionAlternative = (useFade = true) => {
  if (!useFade) {
    return cssWithKebabProps`
      transition: none;
      animation: none;
    `;
  }
  
  return cssWithKebabProps`
    transition: opacity 0.2s ease-out;
  `;
};

/**
 * Hook to check if user has motion sensitivity
 * 
 * @returns Object with motion sensitivity flags
 */
export const useMotionSensitivity = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    reducedMotion: prefersReducedMotion,
    disableAnimations: prefersReducedMotion,
    useFades: true,
  };
};