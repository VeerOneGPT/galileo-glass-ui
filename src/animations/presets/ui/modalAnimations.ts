/**
 * Modal Animations
 *
 * Animation presets specifically designed for modal and dialog components
 */
import { keyframes } from 'styled-components';

import {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  AnimationPreset,
  fadeAnimation,
} from '../accessibleAnimations';

// Modal/dialog entrance animation
export const modalEnterAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Modal/dialog exit animation
export const modalExitAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.exit,
  fillMode: 'forwards',
  reducedMotionAlternative: {
    keyframes: keyframes`
      from { opacity: 1; }
      to { opacity: 0; }
    `,
    duration: animationTimings.fast,
    easing: animationEasings.exit,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  intensity: AnimationIntensity.STANDARD,
};

// Modal backdrop enter animation
export const backdropEnterAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.enter,
  fillMode: 'forwards',
  reducedMotionAlternative: null, // This is subtle enough for reduced motion
  intensity: AnimationIntensity.SUBTLE,
};

// Modal backdrop exit animation
export const backdropExitAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { opacity: 1; }
    to { opacity: 0; }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.exit,
  fillMode: 'forwards',
  reducedMotionAlternative: null, // This is subtle enough for reduced motion
  intensity: AnimationIntensity.SUBTLE,
};

// Glass modal reveal animation
export const glassModalRevealAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      backdrop-filter: blur(0);
      background-color: rgba(255, 255, 255, 0);
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(15px);
      background-color: rgba(255, 255, 255, 0.1);
      transform: scale(1);
    }
  `,
  duration: animationTimings.emphasized,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Slide in from top
export const slideInTopAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Slide in from bottom
export const slideInBottomAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Slide in from left
export const slideInLeftAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Slide in from right
export const slideInRightAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Export all modal animations
export const modalAnimations = {
  enter: modalEnterAnimation,
  exit: modalExitAnimation,
  backdropEnter: backdropEnterAnimation,
  backdropExit: backdropExitAnimation,
  glassReveal: glassModalRevealAnimation,
  slideInTop: slideInTopAnimation,
  slideInBottom: slideInBottomAnimation,
  slideInLeft: slideInLeftAnimation,
  slideInRight: slideInRightAnimation,
};
