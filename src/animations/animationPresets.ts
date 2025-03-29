/**
 * Chart Animation Presets
 * 
 * Common animation presets that can be used for chart components
 */

import { keyframes } from 'styled-components';
import { accessibleAnimation } from './accessibleAnimation';

// Import keyframes
import {
  fadeIn,
  fadeSlideUp,
  drawLine,
  popIn,
  glowPulse,
  shimmer,
  activePoint,
  tooltipFade,
  atmosphericMovement
} from './keyframes/chartAnimations';

/**
 * Animation preset for chart entry effects
 */
export const chartEntryAnimation = (props?: any) => accessibleAnimation({
  animation: fadeSlideUp,
  duration: 0.6,
  delay: 0.1,
  fillMode: 'forwards',
  easing: 'ease-out'
});

/**
 * Animation preset for chart line drawing
 */
export const chartLineAnimation = (props?: any) => accessibleAnimation({
  animation: drawLine,
  duration: 1.5,
  fillMode: 'forwards',
  easing: 'ease-out'
});

/**
 * Animation preset for tooltip appearing
 */
export const tooltipAnimation = (props?: any) => accessibleAnimation({
  animation: tooltipFade,
  duration: 0.2,
  fillMode: 'forwards',
  easing: 'ease-out'
});

/**
 * Animation preset for data point highlighting
 */
export const dataPointAnimation = (props?: any) => accessibleAnimation({
  animation: activePoint,
  duration: 0.8,
  fillMode: 'forwards',
  easing: 'ease-in-out'
});

/**
 * Animation preset for atmospheric background
 */
export const atmosphericAnimation = (props?: any) => accessibleAnimation({
  animation: atmosphericMovement,
  duration: 8,
  fillMode: 'forwards',
  easing: 'ease-in-out'
});

/**
 * Export all chart animation presets
 */
export const chartAnimationPresets = {
  chartEntryAnimation,
  chartLineAnimation,
  tooltipAnimation,
  dataPointAnimation,
  atmosphericAnimation
};

export default chartAnimationPresets; 