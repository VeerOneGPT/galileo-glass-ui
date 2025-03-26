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
  AnimationPreset,
  fadeAnimation,
} from '../accessibleAnimations';

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
      transform: translateY(0) scale(1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    to {
      transform: translateY(-5px) scale(1.01);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: {
    keyframes: keyframes`
      from {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      to {
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }
    `,
    duration: animationTimings.fast,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  intensity: AnimationIntensity.STANDARD,
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
      max-height: 0;
      opacity: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
    }
    to {
      max-height: 1000px;
      opacity: 1;
      padding-top: inherit;
      padding-bottom: inherit;
      margin-top: inherit;
      margin-bottom: inherit;
    }
  `,
  duration: animationTimings.emphasized,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Card collapse animation (for expandable cards)
export const cardCollapseAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      max-height: 1000px;
      opacity: 1;
      padding-top: inherit;
      padding-bottom: inherit;
      margin-top: inherit;
      margin-bottom: inherit;
    }
    to {
      max-height: 0;
      opacity: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: {
    keyframes: keyframes`
      from { opacity: 1; }
      to { opacity: 0; display: none; }
    `,
    duration: animationTimings.fast,
    easing: animationEasings.exit,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
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
};
