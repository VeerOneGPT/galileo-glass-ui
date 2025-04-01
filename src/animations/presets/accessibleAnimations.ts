/**
 * Accessible Animation Presets
 *
 * A collection of animation presets that respect user's motion preferences
 * and provide sensible fallbacks for reduced motion settings.
 */
import { keyframes } from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AnimationPreset } from '../core/types';

// Animation timing presets
export const animationTimings = {
  /** Fast animation for small UI elements (100-150ms) */
  instant: '0.1s',

  /** Quick animation for small UI elements (150-200ms) */
  fast: '0.18s',

  /** Standard animation for most UI interactions (250-350ms) */
  normal: '0.3s',

  /** Slower animation for emphasized transitions (400-500ms) */
  emphasized: '0.45s',

  /** Long animation for page transitions (600-800ms) */
  pageTransition: '0.7s',
};

// Animation easing presets
export const animationEasings = {
  /** Standard easing for most animations */
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

  /** Easing for elements entering the screen */
  enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  /** Easing for elements leaving the screen */
  exit: 'cubic-bezier(0.4, 0.0, 1, 1)',

  /** Sharp easing for emphasized motions */
  emphasized: 'cubic-bezier(0.4, 0.0, 0.6, 1)',

  /** Elastic/bouncy easing for playful elements */
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  /** Linear progression for constant speed */
  linear: 'linear',
};

// Animation intensity levels
export enum AnimationIntensity {
  /** No animation */
  NONE = 'none',

  /** Minimal subtle animations */
  SUBTLE = 'subtle',

  /** Standard level animations */
  STANDARD = 'standard',

  /** Expressive, emphasis animations */
  EXPRESSIVE = 'expressive',
}

// Basic fade animation
export const fadeAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.standard,
  fillMode: 'both',
  intensity: AnimationIntensity.SUBTLE,
};

// Fade animation with scale
export const fadeScaleAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { 
      opacity: 0; 
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.standard,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Slide up animation
export const slideUpAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.enter,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Slide down animation
export const slideDownAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { 
      opacity: 0;
      transform: translateY(-20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.enter,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Slide left animation
export const slideLeftAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { 
      opacity: 0;
      transform: translateX(-20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.enter,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Slide right animation
export const slideRightAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { 
      opacity: 0;
      transform: translateX(20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.enter,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Glass reveal animation
export const glassRevealAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      backdrop-filter: blur(0);
      background-color: rgba(255, 255, 255, 0);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.1);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Scale animation
export const scaleAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: scale(0); }
    to { transform: scale(1); }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Rotate animation
export const rotateAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: rotate(-10deg); }
    to { transform: rotate(0); }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.elastic,
  fillMode: 'both',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Page transition animation
export const pageTransitionAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.pageTransition,
  easing: animationEasings.standard,
  fillMode: 'both',
  reducedMotionAlternative: {
    keyframes: keyframes`
      from { opacity: 0; }
      to { opacity: 1; }
    `,
    duration: '0.2s',
    easing: animationEasings.standard,
    fillMode: 'both',
    intensity: AnimationIntensity.SUBTLE,
  },
  intensity: AnimationIntensity.STANDARD,
};

// Staggered reveal animation
export const staggeredAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.standard,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Attention-getting pulse animation
export const pulseAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `,
  duration: animationTimings.emphasized,
  easing: animationEasings.emphasized,
  fillMode: 'both',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Collection of all animation presets
export const animationPresets = {
  fade: fadeAnimation,
  fadeScale: fadeScaleAnimation,
  slideUp: slideUpAnimation,
  slideDown: slideDownAnimation,
  slideLeft: slideLeftAnimation,
  slideRight: slideRightAnimation,
  glassReveal: glassRevealAnimation,
  scale: scaleAnimation,
  rotate: rotateAnimation,
  pageTransition: pageTransitionAnimation,
  staggered: staggeredAnimation,
  pulse: pulseAnimation,
};

/**
 * Hook to get an animation preset that respects reduced motion preferences
 * @param preset The animation preset to use
 * @returns The appropriate animation preset based on user's motion preferences
 */
export const useAccessibleAnimation = (preset: AnimationPreset): AnimationPreset => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && preset.reducedMotionAlternative !== undefined) {
    return (
      preset.reducedMotionAlternative || {
        keyframes: keyframes`
        from { opacity: 0; }
        to { opacity: 1; }
      `,
        duration: '0.1s',
        easing: animationEasings.standard,
        fillMode: 'both',
        intensity: AnimationIntensity.SUBTLE,
      }
    );
  }

  return preset;
};

/**
 * Generate CSS for an animation with user preference considerations
 * @param preset Animation preset to use
 * @param options Additional animation options
 * @returns CSS string for the animation
 */
export const getAccessibleAnimation = (
  preset: AnimationPreset,
  options?: {
    duration?: string;
    delay?: string;
    easing?: string;
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
    iterations?: number;
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    playState?: 'running' | 'paused';
  }
): string => {
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Use reduced motion alternative if available and needed
  const finalPreset =
    prefersReducedMotion && preset.reducedMotionAlternative !== undefined
      ? preset.reducedMotionAlternative || fadeAnimation
      : preset;

  // No animation if reduced motion preference and no alternative
  if (prefersReducedMotion && preset.reducedMotionAlternative === undefined) {
    return 'none';
  }

  // Build the animation string
  return `
    animation-name: ${finalPreset.keyframes.name};
    animation-duration: ${options?.duration || finalPreset.duration};
    animation-timing-function: ${options?.easing || finalPreset.easing};
    animation-delay: ${options?.delay || finalPreset.delay || '0s'};
    animation-fill-mode: ${options?.fillMode || finalPreset.fillMode || 'both'};
    animation-iteration-count: ${options?.iterations || 1};
    animation-direction: ${options?.direction || 'normal'};
    animation-play-state: ${options?.playState || 'running'};
  `;
};
