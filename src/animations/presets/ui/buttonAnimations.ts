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
  AnimationPreset, 
  fadeAnimation 
} from '../accessibleAnimations';

// Click ripple effect for buttons
export const rippleAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.standard,
  fillMode: 'forwards',
  reducedMotionAlternative: null, // No alternative needed as this is purely decorative
  intensity: AnimationIntensity.STANDARD
};

// Button hover effect
export const buttonHoverAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: translateY(0); }
    to { transform: translateY(-2px); }
  `,
  duration: animationTimings.fast,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: null, // No movement for reduced motion
  intensity: AnimationIntensity.SUBTLE
};

// Button press/active effect
export const buttonPressAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: scale(1); }
    to { transform: scale(0.97); }
  `,
  duration: animationTimings.instant,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: null, // No movement for reduced motion
  intensity: AnimationIntensity.SUBTLE
};

// Loading spinner for buttons
export const buttonLoadingAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `,
  duration: '1s',
  easing: animationEasings.linear,
  fillMode: 'none',
  // This should still run in reduced motion as it's a loading indicator
  reducedMotionAlternative: {
    keyframes: keyframes`
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `,
    duration: '1.5s', // Slightly slower for reduced motion
    easing: animationEasings.linear,
    fillMode: 'none',
    intensity: AnimationIntensity.STANDARD
  },
  intensity: AnimationIntensity.STANDARD
};

// Glass button reveal animation
export const glassButtonRevealAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      backdrop-filter: blur(0);
      background-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 0 rgba(255, 255, 255, 0);
    }
    to {
      backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE
};

// Button success animation
export const buttonSuccessAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  `,
  duration: animationTimings.emphasized,
  easing: animationEasings.elastic,
  fillMode: 'forwards',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.EXPRESSIVE
};

// Button shake animation (for error states)
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
  intensity: AnimationIntensity.EXPRESSIVE
};

// Export all button animations
export const buttonAnimations = {
  ripple: rippleAnimation,
  hover: buttonHoverAnimation,
  press: buttonPressAnimation,
  loading: buttonLoadingAnimation,
  glassReveal: glassButtonRevealAnimation,
  success: buttonSuccessAnimation,
  shake: buttonShakeAnimation
};