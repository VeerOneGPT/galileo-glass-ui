/**
 * Animation Presets
 *
 * A comprehensive collection of animation presets for Galileo Glass UI.
 */

// Export the core AnimationPreset type
export type { AnimationPreset } from '../core/types';

// Export UI-specific animations
export * from './ui';

// Export animation preset categories
export * from './physicsAnimations';
export * from './orchestrationAnimations';
export * from './gestureAnimations';

// Explicitly export timings and easings from accessibleAnimations
export { animationTimings, animationEasings, AnimationIntensity } from './accessibleAnimations';

// Export unified animation presets library
export * from './animationPresets';

// Explicitly re-export needed items if export * doesn't cover them
export { getAnimationPreset, getPresetByName, AnimationCategory } from './animationPresets';
export type { OrchestrationPreset } from './orchestrationAnimations';
export type { GestureAnimationConfig } from './gestureAnimations';

// Export chart animation presets directly
// NOTE: These are defined in this file to avoid circular imports
export const chartAnimationPresets = {
  chart: {
    entry: 'smooth-in',
    line: 'draw-sequential',
    tooltip: 'fade-in',
    dataPoint: 'pop-in',
    atmospheric: 'gentle-pulse'
  }
};

export const chartEntryAnimation = chartAnimationPresets.chart.entry;
export const chartLineAnimation = chartAnimationPresets.chart.line;
export const tooltipAnimation = chartAnimationPresets.chart.tooltip;
export const dataPointAnimation = chartAnimationPresets.chart.dataPoint;
export const atmosphericAnimation = chartAnimationPresets.chart.atmospheric;

// Import main presets library
import allAnimationPresets from './animationPresets';

// Export allAnimationPresets as presets for backward compatibility
export { allAnimationPresets as presets };

// Export the unified presets library as default
export default allAnimationPresets;
