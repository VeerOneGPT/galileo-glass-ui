/**
 * Physics Animation System
 *
 * Export all physics-based animation utilities
 */

// Basic physics animations
export { springAnimation, type SpringAnimationOptions } from './springAnimation';
export { particleSystem, type ParticleSystemOptions } from './particleSystem';
export { magneticEffect, type MagneticEffectOptions } from './magneticEffect';

// Advanced physics animations
export {
  advancedPhysicsAnimation,
  generatePhysicsKeyframes,
  calculateSpringParameters,
  PhysicsAnimationMode,
  type PhysicsState,
  type AdvancedPhysicsOptions,
} from './advancedPhysicsAnimations';

// Physics calculations utilities
export {
  createVector,
  addVectors,
  subtractVectors,
  multiplyVector,
  vectorMagnitude,
  normalizeVector,
  limitVector,
  dotProduct,
  vectorDistance,
  calculateSpringForce,
  calculateDampingForce,
  updateParticle,
  calculateGravity,
  calculateFriction,
  calculateMagneticForce,
  detectCollision,
  resolveCollision,
  designSpring,
  oscillateAround,
  noise,
  applyNoise,
  type Vector2D,
  type SpringParams,
  type ParticleState,
} from './physicsCalculations';

// Collision detection and response system
export {
  // Collision API
  getCollisionSystem,
  resetCollisionSystem,
  createCollisionCircle,
  createCollisionRectangle,
  createCollisionPoint,
  createCollisionPolygon,
  createCollisionBoundaries,
  updateCollisionBody,
  removeCollisionBody,
  updateCollisionSystem,
  CollisionMaterials,
  type CollisionOptions,
} from './collisionAPI';

export {
  // Core collision system
  type CollisionBody,
  type CollisionResult,
  type CircleData,
  type RectangleData,
  type PolygonData,
  type PointData,
  createCircleBody,
  createRectangleBody,
  createPolygonBody,
  createPointBody,
  detectBodyCollision,
  resolveCollisionWithImpulse,
  createCollisionSystem,
  CollisionSystem,
  createBoundaryWalls,
} from './collisionSystem';

// Spring physics system
export { SpringPhysics, createSpring, SpringPresets, type SpringConfig } from './springPhysics';

// Physics React hooks
export { useSpring } from './useSpring';
export type { SpringOptions, SpringHookResult } from './useSpring';
export { useInertialMovement } from './useInertialMovement';
export type { InertialMovementOptions, InertialMovementResult } from './useInertialMovement';
export { useMomentum } from './useMomentum';
export type { MomentumOptions, MomentumResult } from './useMomentum';
export { useMultiSpring } from './useMultiSpring';
export type { MultiSpringOptions, MultiSpringResult } from './useMultiSpring';

// General physics types
export { PhysicsQuality, type PhysicsAnimationOptions, type PhysicsMaterial } from './types';

// Interpolation functions
export {
  Easings,
  applyEasing,
  blendEasings,
  composeEasings,
  bezier,
  createSpringEasing,
  steps,
  hermiteSpline,
  harmonicOscillation,
  cssStandard,
  materialDesign,
  type EasingFunction,
  type InterpolationFunction
} from './interpolation';

// Animation renderers
export { 
  WaapiRenderer,
  RafRenderer,
  GalileoRendererFactory,
  type AnimationRenderer,
  type AnimationOptions,
  type KeyframeEffect,
  type AnimationTarget,
  type AnimationPerformanceMetrics,
  type AnimationRendererFactory,
  type RendererOptions
} from '../renderers';

// Gesture animation system
export {
  createGestureDetector,
  GestureType,
  GestureState,
  GestureDirection,
  type GestureEventData,
  type GestureOptions,
  type GestureHandler,
  getGestureName,
  getStateName,
  getDirectionName
} from './gestures/GestureDetector';

export {
  GestureAnimation,
  createGestureAnimation,
  GestureAnimationPreset,
  type GestureAnimationConfig,
  type GestureTransform
} from './gestures/GestureAnimation';

// Remove the circular reference to unifiedPhysicsAPI
// export { 
//   GalileoPhysics,
//   default as Physics
// } from './unifiedPhysicsAPI';

// Export the unified API as the default
// export { default } from './unifiedPhysicsAPI';
