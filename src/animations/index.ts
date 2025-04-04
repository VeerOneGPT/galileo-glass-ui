/**
 * Galileo Glass UI - Animations
 *
 * Animation system for Glass UI components.
 */

// Animation utilities
export { animate, accessibleAnimation, conditionalAnimate } from './animationUtils';

// Keyframes
export { fadeIn, fadeOut, slideUp, slideDown } from './keyframes/basic';
export { glassFadeIn, glassFadeOut, glassReveal } from './keyframes/glass';

// Physics animations - Basic
export { springAnimation, type SpringAnimationOptions } from './physics/springAnimation';
export { particleSystem, type ParticleSystemOptions } from './physics/particleSystem';
export { magneticEffect, type MagneticEffectOptions } from './physics/magneticEffect';

// Physics animations - Advanced
export {
  advancedPhysicsAnimation,
  generatePhysicsKeyframes,
  calculateSpringParameters,
  PhysicsAnimationMode,
  type AdvancedPhysicsOptions,
} from './physics/advancedPhysicsAnimations';

// Export animateWithPhysics for backward compatibility
export { advancedPhysicsAnimation as animateWithPhysics } from './physics/advancedPhysicsAnimations';

// Re-export physics state types from a common location
export type { PhysicsState } from './physics/types';

// Physics calculations
export {
  createVector,
  addVectors,
  subtractVectors,
  multiplyVector,
  vectorMagnitude,
  normalizeVector,
  limitVector,
  vectorDistance,
  calculateSpringForce,
  calculateDampingForce,
  calculateGravity,
  calculateFriction,
  calculateMagneticForce,
  detectCollision,
  resolveCollision,
  designSpring,
  oscillateAround,
  applyNoise,
  type Vector2D,
  type SpringParams,
  type ParticleState,
} from './physics/physicsCalculations';

// Animation hooks
export {
  useMouseCursorEffect,
  usePhysicsInteraction,
  useMouseMagneticEffect, // Legacy alias for backward compatibility
  useMagneticButton, // Legacy alias for backward compatibility
  type MouseCursorEffectOptions,
  type CursorEffectType,
  type PhysicsInteractionOptions,
  type PhysicsInteractionType,
} from './hooks';

// Reduced motion
export { useReducedMotion } from '../hooks/useReducedMotion';

// Animation presets
export {
  presets,
  animationTimings,
  animationEasings,
  AnimationIntensity,
} from './presets';

// Export getAccessibleAnimation from its actual location
export { getAccessibleAnimation } from './presets/accessibleAnimations';

// Animation accessibility
export {
  AnimationComplexity,
  MotionSensitivityLevel,
  getMotionSensitivity,
  isAnimationComplexityAllowed,
  isAnimationDurationAllowed,
  getAdjustedAnimation,
  animationMapper,
  accessibleAnimation as accessibleAnimationCss,
  useAccessibleAnimation as useAccessibleAnimationCss,
  conditionalAnimation,
  getAccessibleKeyframes,
  useAccessibleAnimation
} from './accessibility';

// Animation orchestration
export {
  GestaltPatterns,
  createStaggeredAnimation,
  createAnimationSequence,
  animationOrchestrator,
  withOrchestration,
} from './orchestration';

// Z-Space animations
export { ZSpaceAnimator, useZSpaceAnimation, type ZSpaceAnimationOptions } from './dimensional';

// Game animations
// export {
//   useGameAnimation,
//   TransitionType,
//   TransitionDirection,
//   type GameAnimationState,
//   type StateTransition,
//   type GameAnimationConfig,
//   type GameAnimationController,
// } from './game';

// Scene transitions and level changes
export {
  useSceneTransition,
  SceneTransitionManager,
  SceneType,
  TransitionEffect,
  SceneDepthEffect,
  ContentPreservation,
  type SceneTransitionConfig,
  type SceneTransitionResult,
  type SceneTransitionActions,
} from './physics/useSceneTransition';

// Animation renderers
export {
  WaapiRenderer,
  type AnimationRenderer,
  type AnimationOptions,
  type KeyframeEffect,
  type AnimationTarget,
  type AnimationPerformanceMetrics,
  type AnimationRendererFactory,
} from './renderers';

// Performance optimizations
export {
  // GPU Acceleration
  AnimationComplexity as AnimationPerformanceComplexity,
  GPUAccelerationManager,
  isGPUAccelerationAvailable,
  getGPUAccelerationCSS,
  getOptimizedGPUAcceleration,
  createGPUOptimizedTransform,
  optimizeKeyframes,
  isGPUAcceleratedProperty,
  createGPUAcceleratedClass,
  useGPUAcceleration,
  analyzeElementComplexity,
  getGPUFeatures,
  detectGPUFeatures,
  type GPUAccelerationOptions,
  type GPUAccelerationProperties,
  type ElementAccelerationState,
  // DOM Batching
  domBatcher,
  DomBatcher,
  DomOperationType,
  BatchPriority,
  type DomTask,
  type DomBatch,
  type DomBatcherOptions,
  // Transform Consolidation
  transformConsolidator,
  TransformConsolidator,
  TransformType,
  type TransformOptions,
  type TransformOperation,
  type ElementTransformState,
  // Examples - REMOVED
  // DomBatcherExample, // Removed
  // TransformConsolidatorExample, // Removed
  // GPUAccelerationExample, // Removed
} from './performance';

// Animation Effects (Parallax, etc.)
export * from './effects';

// Unified Physics API (including renderers)
export { GalileoPhysics, default as Physics } from './physics/unifiedPhysicsAPI';

// Version
export const animationsVersion = '1.3.0';
