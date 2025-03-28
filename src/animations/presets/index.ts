/**
 * Animation Presets
 *
 * A comprehensive collection of animation presets for Galileo Glass UI.
 */

// Export UI-specific animations
export * from './ui';

// Export animation preset categories
export * from './accessibleAnimations';
export * from './physicsAnimations';
export * from './orchestrationAnimations';
export * from './gestureAnimations';

// Export unified animation presets library
export * from './animationPresets';

// Import main presets library
import allAnimationPresets from './animationPresets';

// Export allAnimationPresets as presets for backward compatibility
export { allAnimationPresets as presets };

// Export the unified presets library as default
export default allAnimationPresets;
