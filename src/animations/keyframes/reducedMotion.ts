/**
 * Reduced Motion Alternatives
 * 
 * Animation keyframes specifically designed for users who prefer reduced motion.
 * These animations avoid movement and use opacity/color changes instead.
 */
import { keyframes } from 'styled-components';

/**
 * Simple fade in animation (no movement)
 */
export const reducedFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Simple fade out animation (no movement)
 */
export const reducedFadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

/**
 * Subtle emphasis through opacity pulsing
 */
export const reducedEmphasis = keyframes`
  0% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.9;
  }
`;

/**
 * Border highlight for focus states
 */
export const reducedBorderHighlight = keyframes`
  0% {
    border-color: rgba(99, 102, 241, 0.6);
  }
  50% {
    border-color: rgba(99, 102, 241, 1);
  }
  100% {
    border-color: rgba(99, 102, 241, 0.6);
  }
`;

/**
 * Shadow change for elevation feedback
 */
export const reducedShadowEmphasis = keyframes`
  0% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

/**
 * Color transition without motion
 */
export const reducedColorShift = keyframes`
  0% {
    color: rgba(99, 102, 241, 0.8);
  }
  50% {
    color: rgba(99, 102, 241, 1);
  }
  100% {
    color: rgba(99, 102, 241, 0.8);
  }
`;

/**
 * Very minimal scaling (almost imperceptible)
 */
export const reducedMinimalScale = keyframes`
  0% {
    transform: scale(0.99);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * Pulsing opacity for glow effects
 */
export const reducedStaticGlow = keyframes`
  0% {
    opacity: 0.9;
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.1);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.2);
  }
  100% {
    opacity: 0.9;
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.1);
  }
`;

/**
 * Focus ring animation without motion
 */
export const reducedFocusRing = keyframes`
  0% {
    outline-color: rgba(99, 102, 241, 0.6);
  }
  50% {
    outline-color: rgba(99, 102, 241, 1);
  }
  100% {
    outline-color: rgba(99, 102, 241, 0.6);
  }
`;

/**
 * Loading indicator using opacity instead of spinning
 */
export const reducedLoading = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
`;

/**
 * Subtle notification highlighting
 */
export const reducedNotification = keyframes`
  0%, 100% {
    background-color: rgba(99, 102, 241, 0.1);
  }
  50% {
    background-color: rgba(99, 102, 241, 0.2);
  }
`;

/**
 * Subtle border pulse
 */
export const reducedBorderPulse = keyframes`
  0%, 100% {
    border-color: rgba(99, 102, 241, 0.3);
  }
  50% {
    border-color: rgba(99, 102, 241, 0.6);
  }
`;

/**
 * Background color pulse
 */
export const reducedBackgroundPulse = keyframes`
  0%, 100% {
    background-color: rgba(99, 102, 241, 0.05);
  }
  50% {
    background-color: rgba(99, 102, 241, 0.1);
  }
`;

/**
 * Reduced glass effect
 */
export const reducedGlassEffect = keyframes`
  0% {
    backdrop-filter: blur(8px);
  }
  50% {
    backdrop-filter: blur(10px);
  }
  100% {
    backdrop-filter: blur(8px);
  }
`;

/**
 * Reduced attention indicator
 */
export const reducedAttention = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  }
`;

/**
 * Map of standard animations to their reduced motion alternatives
 */
export const REDUCED_MOTION_ALTERNATIVES = {
  // Basic animations
  fadeIn: reducedFadeIn,
  fadeOut: reducedFadeOut,
  slideInBottom: reducedFadeIn,
  slideInTop: reducedFadeIn,
  slideInLeft: reducedFadeIn,
  slideInRight: reducedFadeIn,
  zoomIn: reducedFadeIn,
  zoomOut: reducedFadeOut,
  
  // Feedback animations
  pulse: reducedEmphasis,
  spin: reducedLoading,
  bounce: reducedEmphasis,
  shake: reducedAttention,
  
  // Glass animations
  glassFadeIn: reducedFadeIn,
  glassFadeOut: reducedFadeOut,
  glassReveal: reducedFadeIn,
  glassGlow: reducedStaticGlow,
  glassBorderShine: reducedBorderHighlight,
  
  // Interaction feedback
  focusRingPulse: reducedFocusRing,
  borderPulse: reducedBorderPulse,
  glow: reducedStaticGlow,
  shimmer: reducedEmphasis,
};