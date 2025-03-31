/**
 * Physics Animation System
 *
 * Export all physics-based animation utilities
 */

// Basic physics animations
export { springAnimation, type SpringAnimationOptions } from './springAnimation';
export { particleSystem, type ParticleSystemOptions } from './particleSystem';
export { 
  magneticEffect, 
  type MagneticEffectOptions, 
  type ForceVector,
  type FieldShape,
  type FieldDecayFunction 
} from './magneticEffect';

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
  type SpringParams,
  type ParticleState,
} from './physicsCalculations';

// Magnetic utilities
export {
  distance,
  normalize,
  scale,
  add,
  calculateFieldDistance,
  calculateForceMultiplier,
  calculateMagneticForce as calculateMagneticForceVector,
  type Vector2D as MagneticVector
} from './magneticUtils';

// Enhanced magnetic hooks and effects
export { useMagneticEffect } from './useMagneticEffect';
export { useMagneticElement } from './useMagneticElement';
export { useMagneticSystemElement } from './useMagneticSystemElement';
export { MagneticSystemProvider, useMagneticSystem } from './MagneticSystemProvider';

// Multi-element magnetic system
export {
  MagneticSystemManager,
  createMagneticSystem,
  getMagneticSystem,
  type MagneticSystemConfig,
  type MagneticElementOptions,
  type MagneticElement,
  type MagneticTransform
} from './magneticSystem';

// Directional magnetic fields
export {
  type FieldDirectionType,
  type DirectionalForceBehavior, 
  type VectorFieldPoint,
  type FlowField,
  type DirectionalFieldConfig,
  type ForceModifierType,
  type DirectionalForceModifier,
  type PointerData,
  type DirectionalForceResult
} from './directionalField';

export {
  calculateDirectionalForce,
  normalizeVector as normalizeFieldVector,
  vectorMagnitude as calculateVectorMagnitude,
  scaleVector,
  vectorAngle,
  vectorFromAngle,
  rotateVector,
  addVectors as addFieldVectors
} from './directionalFieldImpl';

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
export { SpringPhysicsVector, createVectorSpring, type Vector3D } from './springPhysicsVector';

// Physics React hooks
export { useMultiSpring } from './useMultiSpring';
export type { MultiSpringOptions, MultiSpringResult } from './useMultiSpring';
export { useVectorSpring } from './useVectorSpring';
export type { VectorSpringOptions, VectorSpringHookResult } from './useVectorSpring';
export { useInertialMovement } from './useInertialMovement';
export type { InertialMovementOptions, InertialMovementResult } from './useInertialMovement';
export { useMomentum } from './useMomentum';
export type { MomentumOptions, MomentumResult } from './useMomentum';

// Inertial presets
export { InertialPresets, createCustomInertialPreset } from './inertialPresets';

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

// Gesture physics system
export {
  useGesturePhysics,
  GesturePhysicsPreset,
  createGesturePhysics,
  type GesturePhysicsOptions,
  type GestureTransform as GesturePhysicsTransform
} from './gestures/useGesturePhysics';

export {
  useGestureWithInertia,
  type GestureWithInertiaOptions,
  type GestureWithInertiaResult
} from './gestures/useGestureWithInertia';

export {
  GestureResponder,
  createGestureResponder,
  ResponseType,
  RESPONDER_PRESETS,
  type ResponderConfig,
  type GestureResponderOptions,
  type ResponderResult
} from './gestures/gestureResponders';

// Keyboard navigation alternatives for gestures
export {
  useKeyboardGestureAlternatives,
  KeyboardActivationMode,
  KeyboardFeedbackType,
  createKeyboardMapping,
  type GestureKeyboardMapping,
  type KeyboardNavigationOptions
} from './gestures/GestureKeyboardNavigation';

// Gesture physics example
export { GesturePhysicsDemo } from './gestures/examples/GesturePhysicsDemo';

// Pointer following hooks
export { usePointerFollow } from './usePointerFollow';
export type { 
  PointerFollowOptions, 
  PointerFollowResult, 
  FollowTransform, 
  FollowBehavior 
} from './usePointerFollow';

export { usePointerFollowGroup } from './usePointerFollowGroup';
export type { 
  PointerFollowGroupOptions, 
  PointerFollowGroupResult, 
} from './usePointerFollowGroup';

// Example components
export { default as MagneticEffectExample } from './examples/MagneticEffectExample';
export { default as DirectionalFieldExample } from './examples/DirectionalFieldExample';
export { default as MagneticElementExample } from './examples/MagneticElementExample';
export { default as MagneticSystemExample } from './examples/MagneticSystemExample';
export { PointerFollowExample } from './examples/PointerFollowExample';
export { MagneticSnapExample } from './examples/MagneticSnapExample';

// Snap points and alignment guides
export {
  SnapPointType,
  SnapOrientation,
  DEFAULT_SNAP_CONFIG,
  calculatePointSnapForce,
  calculateGridSnapForce,
  calculateLineSnapForce,
  calculateEdgeSnapForce,
  composeSnapForces,
  calculateSnapPosition,
  processElementSnap,
  type SnapPointConfig,
  type SnapSystemConfig,
  type SnapEvent,
  type SnapResult
} from './snapPoints';

export {
  useSnapPoints,
  type SnapPointsOptions,
  type SnapPointsResult,
  type DraggableElementState
} from './useSnapPoints';

export {
  collectAllGuides,
  createGuidePath,
  createHorizontalGuide,
  createVerticalGuide,
  createGridGuides,
  createElementEdgeGuides,
  createGuidesFromSnapEvents,
  deduplicateGuides,
  calculateLabelPosition,
  DEFAULT_GUIDE_STYLE,
  type AlignmentGuide,
  type GuideLineStyle
} from './alignmentGuides';

export {
  useAlignmentGuides,
  type AlignmentGuidesOptions,
  type AlignmentGuidesResult
} from './useAlignmentGuides';

export {
  useMagneticLayout,
  type MagneticLayoutOptions,
  type MagneticLayoutResult
} from './useMagneticLayout';

// Game physics system
export { useGamePhysics } from './useGamePhysics';
export {
  GamePhysicsBehavior,
  GameGravityPreset,
  type GamePhysicsConfig,
  type GamePhysicsResult,
  type GamePhysicsObjectConfig,
  type GamePhysicsEnvironment
} from './useGamePhysics';

// Trajectory and projectile motion utilities
export {
  TrajectoryType,
  calculateProjectileTrajectory,
  calculateBezierTrajectory,
  calculateSpiralTrajectory,
  calculateSineWaveTrajectory,
  calculateCustomTrajectory,
  calculateLaunchParameters,
  generateSvgPath,
  createTrajectoryClipPath,
  renderTrajectorySVG,
  type TrajectoryOptions,
  type BezierTrajectoryOptions,
  type SpiralTrajectoryOptions,
  type SineWaveTrajectoryOptions,
  type CustomTrajectoryOptions,
  type TrajectoryPoint,
  type TrajectoryResult,
  type TrajectoryFunction
} from './TrajectoryUtils';

export {
  useTrajectory,
  type TrajectoryHookOptions,
  type TrajectoryHookResult,
  type TrajectoryAnimationOptions
} from './useTrajectory';

// Game particle effects system
export {
  GameParticleSystem,
  createGameParticleSystem,
  GameEventType,
  EmitterShape,
  ParticleShape,
  ParticleAnimationType,
  EVENT_PRESETS,
  type Particle,
  type ParticleEmitterConfig,
  type GameParticleSystemConfig,
  type ParticleConfig
} from './GameParticleSystem';

export {
  useGameParticles,
  type GameParticlesHookConfig,
  type GameParticlesResult,
  type GameParticlesActions
} from './useGameParticles';

// Z-Space and 3D effects
export {
  useZSpace,
  type ZSpaceOptions,
  type ZSpaceResult,
  type ZSpaceTransform
} from './useZSpace';
export {
  ZSpaceProvider,
  useZSpaceContext,
  type ZSpaceProviderProps
} from './ZSpaceProvider';

// 3D Transforms
export {
  use3DTransform,
  type Transform3DOptions,
  type Transform3DState,
  type Transform3DResult
} from './use3DTransform';

// Remove the circular reference to unifiedPhysicsAPI
// export { 
//   GalileoPhysics,
//   default as Physics
// } from './unifiedPhysicsAPI';

// Export the unified API as the default
// export { default } from './unifiedPhysicsAPI';

// Export the physics engine hook and types
export { useGalileoPhysicsEngine } from './useGalileoPhysicsEngine';
export type {
  PhysicsBodyOptions,
  PhysicsBodyState,
  CollisionEvent,
  Vector2D,
  UnsubscribeFunction,
  GalileoPhysicsEngineAPI
} from './engineTypes';