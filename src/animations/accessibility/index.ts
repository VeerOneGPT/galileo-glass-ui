/**
 * Animation Accessibility
 *
 * Core modules for accessible animation system.
 */

// Export motion sensitivity utilities
export * from './MotionSensitivity';

// Export animation mapper
export * from './AnimationMapper';

// Export accessibility types
export * from './AccessibilityTypes';

// Export accessible animation utilities
export * from './accessibleAnimation';

// Export ARIA attributes utilities
export * from './AnimationAccessibilityUtils';

// Export animation speed controller
export * from './AnimationSpeedController';

// Export motion intensity profiler
export * from './MotionIntensityProfiler';

// Export reduced motion alternatives
export * from './ReducedMotionAlternatives';

// Export intelligent fallbacks
export * from './IntelligentFallbacks';

// Export accessibility hooks
export { useReducedMotion } from './useReducedMotion';
export { default as useHighContrast } from './useHighContrast';

// Export focus animation utilities
export {
  useAccessibleFocusAnimation,
  createAccessibleFocusAnimation,
  focusAnimation,
  mapFocusToHighContrastType,
  FocusAnimationStyle,
  FocusAnimationIntensity
} from './AccessibleFocusAnimation';

// Export animation pause controls
export {
  AnimationPauseControllerProvider,
  useAnimationPauseController,
  useControllableAnimation,
  usePauseableAnimation,
  createGlobalPauseControl,
  installGlobalPauseControl,
  removeGlobalPauseControl,
  createAnimationPauseButton,
  installAnimationPauseButton,
  removeAnimationPauseButton,
  autoInstallAnimationControls,
  type AnimationControlInterface,
  type AnimationControlOptions,
  type AnimationPauseControllerContextType
} from './AnimationPauseController';

// Export vestibular fallbacks
export {
  useVestibularFallback,
  vestibularFallback,
  createVestibularFallback,
  setVestibularFallbackPreferences,
  getVestibularFallbackPreferences,
  resetVestibularFallbackPreferences,
  FeedbackType,
  StateChangeType,
  ImportanceLevel,
  type VestibularFallbackOptions,
  type FeedbackThresholds
} from './VestibularFallbacks';
