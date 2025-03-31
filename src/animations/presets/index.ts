/**
 * Animation Presets
 *
 * A comprehensive collection of animation presets for Galileo Glass UI.
 */

// Export UI-specific animations
export * from './ui';

// Export animation preset categories
export * from './physicsAnimations';
export * from './orchestrationAnimations';
export * from './gestureAnimations';

// Export unified animation presets library
export * from './animationPresets';

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
