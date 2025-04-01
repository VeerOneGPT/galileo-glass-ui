/**
 * Card Animations
 *
 * Animation presets specifically designed for card components
 */
import { keyframes } from 'styled-components';

import {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  fadeAnimation,
  slideUpAnimation,
} from '../accessibleAnimations';

import type { AnimationPreset } from '..';

// Card entrance animation
export const cardEnterAnimation: AnimationPreset = {
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
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Card hover animation
export const cardHoverAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    to {
      transform: translateY(-4px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.standard,
  fillMode: 'both',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.SUBTLE,
};

// Glass card reveal animation
export const glassCardRevealAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      backdrop-filter: blur(0);
      background-color: rgba(255, 255, 255, 0);
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(12px);
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Card expand animation (for expandable cards)
export const cardExpandAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: scale(0.98);
      opacity: 0.8;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Card collapse animation (for expandable cards)
export const cardCollapseAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0.98);
      opacity: 0;
    }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.exit,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Card flip animation (from front to back)
export const cardFlipAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(180deg);
    }
  `,
  duration: animationTimings.emphasized,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation, // Just fade for reduced motion users
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Card fade in from bottom (stacked cards)
export const cardStackedEnterAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Card 3D tilt hover effect
export const card3DTiltAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: perspective(1000px) rotateX(0) rotateY(0);
    }
    to {
      transform: perspective(1000px) rotateX(var(--rx, 2deg)) rotateY(var(--ry, -2deg));
    }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.standard,
  fillMode: 'forwards',
  reducedMotionAlternative: null, // No alternative for reduced motion
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Card reveal animation (slide up and fade in)
export const cardRevealAnimation: AnimationPreset = {
  keyframes: slideUpAnimation.keyframes,
  duration: animationTimings.normal,
  easing: animationEasings.enter,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Card dismiss animation (slide down and fade out)
export const cardDismissAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.exit,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Export all card animations
export const cardAnimations = {
  enter: cardEnterAnimation,
  hover: cardHoverAnimation,
  glassReveal: glassCardRevealAnimation,
  expand: cardExpandAnimation,
  collapse: cardCollapseAnimation,
  flip: cardFlipAnimation,
  stackedEnter: cardStackedEnterAnimation,
  tilt3D: card3DTiltAnimation,
  reveal: cardRevealAnimation,
  dismiss: cardDismissAnimation,
};
