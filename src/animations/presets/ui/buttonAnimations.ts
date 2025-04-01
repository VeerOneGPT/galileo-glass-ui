/**
 * Button Animations
 *
 * Animation presets specifically designed for button components
 */
import { keyframes } from 'styled-components';

import {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  fadeAnimation
} from '../accessibleAnimations';

// Import the core type definition
import type { AnimationPreset } from '..'; // Corrected import path

// Click ripple effect for buttons
export const rippleAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { 
      transform: scale(0);
      opacity: 0.4;
    }
    to { 
      transform: scale(4);
      opacity: 0;
    }
  `,
  duration: animationTimings.emphasized,
  easing: animationEasings.standard,
  fillMode: 'forwards',
  reducedMotionAlternative: null, // Disable ripple effect entirely for reduced motion
  intensity: AnimationIntensity.STANDARD,
};

// Button hover effect
export const buttonHoverAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: scale(1); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    to { transform: scale(1.03); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.standard,
  fillMode: 'both',
  reducedMotionAlternative: null, // Subtle enough for reduced motion
  intensity: AnimationIntensity.SUBTLE,
};

// Button press effect (scale down)
export const buttonPressAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: scale(1); }
    to { transform: scale(0.96); }
  `,
  duration: animationTimings.instant,
  easing: animationEasings.standard,
  fillMode: 'both',
  reducedMotionAlternative: null, // No alternative needed, very subtle
  intensity: AnimationIntensity.SUBTLE,
};

// Loading spinner animation for buttons
export const buttonLoadingAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `,
  duration: '1s',
  easing: 'linear',
  iterations: 'infinite',
  reducedMotionAlternative: null, // Loading state is essential
  intensity: AnimationIntensity.STANDARD,
};

// Glass reveal effect for buttons
export const glassButtonRevealAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      backdrop-filter: blur(0) saturate(100%);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(5px) saturate(150%);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.enter,
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Success checkmark animation
export const buttonSuccessAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% { stroke-dashoffset: 24; }
    100% { stroke-dashoffset: 0; }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.standard,
  fillMode: 'forwards',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.STANDARD,
};

// Shake animation for error states
export const buttonShakeAnimation: AnimationPreset = {
  keyframes: keyframes`
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  `,
  duration: animationTimings.emphasized,
  easing: animationEasings.emphasized,
  fillMode: 'both',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Export all button animations
export const buttonAnimations = {
  ripple: rippleAnimation,
  hover: buttonHoverAnimation,
  press: buttonPressAnimation,
  loading: buttonLoadingAnimation,
  glassReveal: glassButtonRevealAnimation,
  success: buttonSuccessAnimation,
  shake: buttonShakeAnimation,
};