/**
 * Animation Utilities for Glass UI
 * 
 * Core animation utilities and helpers
 */
import { css, keyframes } from 'styled-components';
import { cssWithKebabProps } from '../core/cssUtils';

/**
 * Options for the animate function
 */
export interface AnimateOptions {
  /**
   * The keyframes to animate
   */
  animation: ReturnType<typeof keyframes>;
  
  /**
   * Secondary animation for reduced motion
   */
  secondaryAnimation?: ReturnType<typeof keyframes> | null;
  
  /**
   * Duration of the animation in seconds
   */
  duration?: number;
  
  /**
   * Easing function for the animation
   */
  easing?: string;
  
  /**
   * Delay before starting the animation in seconds
   */
  delay?: number;
  
  /**
   * Number of iterations (use Infinity for infinite)
   */
  iterations?: number | 'infinite';
  
  /**
   * Direction of the animation
   */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  
  /**
   * Fill mode for the animation
   */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

/**
 * Creates an animation with the given keyframes and options
 */
export const animate = (options: AnimateOptions) => {
  const {
    animation,
    duration = 0.3,
    easing = 'ease',
    delay = 0,
    iterations = 1,
    direction = 'normal',
    fillMode = 'both',
  } = options;
  
  // Convert iterations to a string
  const iterationCount = iterations === 'infinite' || iterations === Infinity
    ? 'infinite'
    : String(iterations);
  
  // Create the animation CSS
  return cssWithKebabProps`
    animation-name: ${css`${animation}`};
    animation-duration: ${duration}s;
    animation-timing-function: ${easing};
    animation-delay: ${delay}s;
    animation-iteration-count: ${iterationCount};
    animation-direction: ${direction};
    animation-fill-mode: ${fillMode};
    animation-play-state: running;
  `;
};

/**
 * Creates an animation that respects user's motion preferences
 */
export const accessibleAnimation = (options: AnimateOptions) => {
  const {
    animation,
    secondaryAnimation,
    duration = 0.3,
    easing = 'ease',
    delay = 0,
    iterations = 1,
    direction = 'normal',
    fillMode = 'both',
  } = options;
  
  // If there's no secondary animation, just use the primary one
  if (!secondaryAnimation) {
    return cssWithKebabProps`
      @media (prefers-reduced-motion: no-preference) {
        ${animate({
          animation,
          duration,
          easing,
          delay,
          iterations,
          direction,
          fillMode,
        })}
      }
    `;
  }
  
  // Otherwise, use the appropriate animation based on user preferences
  return cssWithKebabProps`
    @media (prefers-reduced-motion: reduce) {
      ${animate({
        animation: secondaryAnimation,
        duration: Math.min(duration, 0.3), // Limit duration for reduced motion
        easing,
        delay,
        iterations,
        direction,
        fillMode,
      })}
    }
    
    @media (prefers-reduced-motion: no-preference) {
      ${animate({
        animation,
        duration,
        easing,
        delay,
        iterations,
        direction,
        fillMode,
      })}
    }
  `;
};

/**
 * Creates a conditional animation based on a condition
 */
export const conditionalAnimate = (
  condition: boolean,
  options: AnimateOptions
) => {
  if (!condition) {
    return '';
  }
  
  return animate(options);
};