/**
 * Animation Presets
 *
 * A comprehensive collection of animation presets for Galileo Glass UI.
 */

// Export accessible animation utilities
export * from './accessibleAnimations';

// Export UI-specific animations
export * from './ui';

// Combine all presets for easier access
import {
  animationPresets,
  animationTimings,
  animationEasings,
  AnimationIntensity,
  useAccessibleAnimation,
  getAccessibleAnimation,
} from './accessibleAnimations';
import { uiAnimations } from './ui';

// Combined presets object
export const presets = {
  ...animationPresets,
  ...uiAnimations,

  // Categorized access
  timings: animationTimings,
  easings: animationEasings,
  intensity: AnimationIntensity,
  basic: animationPresets,
  ui: uiAnimations,
};

// Export utilities
export { useAccessibleAnimation, getAccessibleAnimation };
