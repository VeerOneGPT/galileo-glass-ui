/**
 * Alternative Animations Utility
 * 
 * This file provides simpler, more accessible animation alternatives
 * that can be used when users prefer reduced motion or have specific
 * motion sensitivity requirements.
 */

import { css, FlattenSimpleInterpolation, keyframes } from 'styled-components';
import { MotionSensitivityLevel, AnimationCategory } from '../../types/accessibility';

/**
 * Options for alternative animations
 */
export interface AlternativeAnimationOptions {
  /** The animation duration in milliseconds */
  duration?: number;
  /** The animation delay in milliseconds */
  delay?: number;
  /** The easing function to use */
  easing?: string;
  /** The animation iteration count */
  iterations?: number | 'infinite';
  /** The animation direction */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  /** The animation fill mode */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  /** The animation play state */
  playState?: 'running' | 'paused';
  /** The motion sensitivity level of the user */
  sensitivityLevel?: MotionSensitivityLevel;
  /** The category of animation */
  category?: AnimationCategory;
}

// Default options for alternative animations
const defaultOptions: AlternativeAnimationOptions = {
  duration: 300,
  delay: 0,
  easing: 'ease-in-out',
  iterations: 1,
  direction: 'normal',
  fillMode: 'both',
  playState: 'running',
  sensitivityLevel: MotionSensitivityLevel.MEDIUM,
};

/**
 * Get adjusted animation duration based on sensitivity level
 */
export const getAdjustedDuration = (
  baseDuration: number,
  sensitivity: MotionSensitivityLevel = MotionSensitivityLevel.MEDIUM,
  category: AnimationCategory = AnimationCategory.TRANSITION
): number => {
  // Adjust duration based on sensitivity
  switch (sensitivity) {
    case MotionSensitivityLevel.LOW:
      return category === AnimationCategory.ESSENTIAL ? baseDuration * 1.5 : baseDuration * 2;
    case MotionSensitivityLevel.MEDIUM:
      return baseDuration * 1.3;
    case MotionSensitivityLevel.HIGH:
      return baseDuration * 1.1;
    default:
      return baseDuration;
  }
};

/**
 * Get appropriate animation CSS based on sensitivity level
 */
export const getAlternativeAnimation = (
  originalCss: FlattenSimpleInterpolation,
  simplifiedCss: FlattenSimpleInterpolation,
  options: AlternativeAnimationOptions = {}
): FlattenSimpleInterpolation => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { sensitivityLevel, category } = mergedOptions;

  if (!sensitivityLevel || sensitivityLevel === MotionSensitivityLevel.NONE) {
    return originalCss;
  }

  if (sensitivityLevel === MotionSensitivityLevel.LOW) {
    return simplifiedCss;
  }

  // For MEDIUM and HIGH, we keep the original animation but adjust properties
  return originalCss;
};

/**
 * Simple fade animation that's suitable for users with motion sensitivity
 */
export const simpleFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/**
 * Simple scale animation that's suitable for users with motion sensitivity
 */
export const simpleScale = keyframes`
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

/**
 * Simplified slide animations for different directions
 */
export const simpleSlideIn = {
  up: keyframes`
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `,
  down: keyframes`
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `,
  left: keyframes`
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `,
  right: keyframes`
    from { transform: translateX(10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `,
};

/**
 * Creates a CSS transition string optimized for the user's motion sensitivity
 */
export const createAccessibleTransition = (
  properties: string[],
  options: AlternativeAnimationOptions = {}
): string => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { sensitivityLevel, category, easing } = mergedOptions;
  const duration = getAdjustedDuration(
    mergedOptions.duration || 300,
    sensitivityLevel,
    category
  );

  // Join all properties with the same transition parameters
  return properties
    .map(prop => `${prop} ${duration}ms ${easing}`)
    .join(', ');
};

/**
 * Creates a CSS animation string optimized for the user's motion sensitivity
 */
export const createAccessibleAnimation = (
  animationName: any,
  options: AlternativeAnimationOptions = {}
): string => {
  const mergedOptions = { ...defaultOptions, ...options };
  const {
    sensitivityLevel,
    category,
    easing,
    iterations,
    direction,
    fillMode,
    playState,
    delay
  } = mergedOptions;
  
  const duration = getAdjustedDuration(
    mergedOptions.duration || 300,
    sensitivityLevel,
    category
  );

  return `${animationName} ${duration}ms ${easing} ${delay}ms ${iterations} ${direction} ${fillMode} ${playState}`;
};

/**
 * Utility to generate simplified styling for components based on motion sensitivity
 */
export const getAccessibleStyles = (
  sensitivityLevel: MotionSensitivityLevel = MotionSensitivityLevel.MEDIUM,
  category: AnimationCategory = AnimationCategory.TRANSITION
): { 
  useSimplified: boolean;
  transitionDuration: number;
  transitions: (properties: string[]) => string;
  animation: (name: any, options?: Partial<AlternativeAnimationOptions>) => string;
} => {
  // Determine if we should use simplified animations
  const useSimplified = sensitivityLevel === MotionSensitivityLevel.LOW;
  
  // Base duration adjusted for sensitivity
  const transitionDuration = getAdjustedDuration(300, sensitivityLevel, category);
  
  // Function to create transitions
  const transitions = (properties: string[]) => 
    createAccessibleTransition(properties, { sensitivityLevel, category });
  
  // Function to create animations
  const animation = (name: any, options: Partial<AlternativeAnimationOptions> = {}) => 
    createAccessibleAnimation(name, { 
      sensitivityLevel, 
      category,
      ...options
    });
  
  return {
    useSimplified,
    transitionDuration,
    transitions,
    animation
  };
}; 