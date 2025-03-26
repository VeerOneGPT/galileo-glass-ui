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
