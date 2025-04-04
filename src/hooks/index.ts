/**
 * Hooks Export
 */
export { useAccessibleAnimationOptions } from './useAccessibleAnimationOptions';
export { useBreakpoint, type Breakpoint, type ResponsiveValue } from './useBreakpoint';
export { useGlassEffects } from './useGlassEffects';
export {
  useGlassPerformance,
  type GlassPerformanceMetrics,
  type GlassPerformanceOptions,
  type PerformanceThresholds,
} from './useGlassPerformance';
export {
  useGlassTheme,
  useThemeColor,
  useThemeColors,
  useThemeSpacing,
  useSpacing,
  useGlassEffectValues,
  useIsDarkMode,
  type ColorMode,
  type ThemeVariant,
  type ThemeColors,
  type ThemeTypography,
  type ThemeSpacing,
  type ThemeEffects,
  type ThemeOptions,
  type GlassThemeContextValue,
} from './useGlassTheme';
export { useMotionSettings } from './useMotionSettings';
export {
  useOptimizedAnimation,
  optimizedAnimation,
  accessibleOptimizedAnimation,
  type OptimizedAnimationOptions,
  AnimationComplexity,
} from './useOptimizedAnimation';
export {
  useOrchestration,
  type OrchestrationOptions,
  type OrchestrationPattern,
  type TimingFunction,
  type GestaltRelationship,
  type GestaltPatternOptions,
  type Point,
} from './useOrchestration';
export {
  usePhysicsInteraction,
  type PhysicsInteractionOptions,
  type PhysicsInteractionType,
  type PhysicsState,
  type PhysicsMaterial,
  type PhysicsVector,
  type CollisionShape,
  type PhysicsQuality,
} from './usePhysicsInteraction';
export { useReducedMotion } from './useReducedMotion';
export { useAccessibleAnimation, type UseAccessibleAnimationOptions } from './useAccessibleAnimation';
export { useAnimationSpeed } from './useAnimationSpeed';
export { useEnhancedReducedMotion } from './useEnhancedReducedMotion';
export { useMotionProfiler } from './useMotionProfiler';
export { useReducedMotionAlternative } from './useReducedMotionAlternative';
export { useAccessibilitySettings } from './useAccessibilitySettings';
export { useResponsiveValue, createResponsiveValue } from './useResponsiveValue';
export { useScrollScene } from './useScrollScene';
export {
  useZSpaceAnimation,
  type ZPlane,
  type ZSpaceAnimationOptions,
  type ZAnimationPattern,
  type ZAnimationTrigger,
  type ZElementSize,
} from './useZSpaceAnimation';
export {
  useFallbackStrategies,
  type FallbackStrategiesResult,
  type FallbackOptions
} from './useFallbackStrategies';

// Re-export the new Physics Engine hook and types (v1.0.8)
export {
  useGalileoPhysicsEngine
} from '../animations/physics/useGalileoPhysicsEngine';
export type {
  PhysicsBodyOptions,
  PhysicsBodyState,
  CollisionEvent,
  Vector2D,
  UnsubscribeFunction,
  GalileoPhysicsEngineAPI
} from '../animations/physics/engineTypes';

// Re-export the animation orchestration hooks
export { useSequence, type UseSequenceParams, type UseSequenceResult } from '../animations/orchestration/useSequence';
export { useAnimationStateMachine, type UseAnimationStateMachineParams, type UseAnimationStateMachineResult } from '../animations/orchestration/useAnimationStateMachine';
export { useAnimationInterpolator, type UseAnimationInterpolatorOptions, type UseAnimationInterpolatorReturn, type StateTransitionOptions } from './useAnimationInterpolator';
export { useAnimationSynchronization, type UseAnimationSynchronizationOptions, type UseAnimationSynchronizationReturn } from './useAnimationSynchronization';
export { useAnimationEvent, type UseAnimationEventOptions, type UseAnimationEventReturn } from './useAnimationEvent';
export { useStaggeredAnimation, type UseStaggeredAnimationOptions, type UseStaggeredAnimationReturn } from './useStaggeredAnimation';
export { useGestureAnimation, GestureAnimationPresets, GestureTypes } from './useGestureAnimation';

// Export the new constraint hook
export { usePhysicsConstraint } from './usePhysicsConstraint';

// Add missing exports for useAnimationSequence and useGesturePhysics
export {
  useAnimationSequence,
  // Export enums as values
  StaggerPattern,
  PlaybackState,
  PlaybackDirection,
  TimingRelationship
} from '../animations/orchestration/useAnimationSequence';

// Use 'export type' syntax for re-exporting interfaces and types (not enums)
export type {
  AnimationSequenceConfig,
  SequenceControls,
  AnimationStage,
  StyleAnimationStage,
  CallbackAnimationStage,
  EventAnimationStage,
  GroupAnimationStage,
  StaggerAnimationStage
} from '../animations/orchestration/useAnimationSequence';

export {
  useGesturePhysics,
  type GesturePhysicsOptions,
  type GesturePhysicsPreset
} from '../animations/physics/gestures/useGesturePhysics';

export { useAmbientTilt } from './useAmbientTilt';

// Physics Utilities (Added from physics/physicUtils)
export { 
    getPhysicsBodyState, 
    verifyPhysicsEngineState, 
    forcePhysicsEngineUpdate 
} from '../animations/physics/physicUtils';
