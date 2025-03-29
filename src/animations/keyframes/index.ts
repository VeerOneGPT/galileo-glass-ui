/**
 * Animation Keyframes
 * 
 * Exports all available keyframe animations for the Galileo Glass UI library
 */

// Import all keyframes with namespaces to avoid naming conflicts
import * as basicKeyframes from './basic';
import * as motionKeyframes from './motion';
import * as glassKeyframes from './glass';
import * as reducedMotionKeyframes from './reducedMotion';
import * as chartKeyframes from './chartAnimations';

// Export with namespaces
export {
  basicKeyframes,
  motionKeyframes,
  glassKeyframes,
  reducedMotionKeyframes,
  chartKeyframes
};

// Export individual keyframes for common direct imports
// Basic animations
export const { fadeIn, fadeOut } = basicKeyframes;

// Motion animations
export const { slideInBottom, slideInTop, slideInLeft, slideInRight } = motionKeyframes;

// Glass animations
export const { glassFadeIn, glassReveal, glassGlow } = glassKeyframes;

// Reduced motion animations
export const { reducedFadeIn } = reducedMotionKeyframes;

// Chart animations
export const { 
  drawLine,
  popIn,
  fadeSlideUp,
  glowPulse,
  shimmer,
  activePoint,
  tooltipFade,
  atmosphericMovement
} = chartKeyframes; 