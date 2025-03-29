/**
 * Common type definitions for the physics animation system
 */

/**
 * Represents a 2D vector
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Physical state of an element
 */
export interface PhysicsState {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  forces: Vector2D;
  rotation?: number;
  angularVelocity?: number;
  scale?: number;
  mass?: number;
  isAtRest?: boolean;
  timestamp?: number;
}

/**
 * Represents spring physics parameters
 */
export interface SpringParams {
  stiffness: number;
  damping: number;
  mass: number;
  initialVelocity?: Vector2D;
  restPosition?: Vector2D;
}

/**
 * Types of physics interactions
 */
export enum PhysicsInteractionType {
  SPRING = 'spring',
  MAGNETIC = 'magnetic',
  ADVANCED = 'advanced',
  DRAG = 'drag',
  INERTIA = 'inertia',
}

/**
 * Animation modes for physics animations
 */
export enum PhysicsAnimationMode {
  NATURAL = 'natural',
  REALISTIC = 'realistic',
  EXAGGERATED = 'exaggerated',
  RESPONSIVE = 'responsive',
  SMOOTH = 'smooth',
}

/**
 * Quality levels for physics calculations
 */
export enum PhysicsQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
  ADAPTIVE = 'adaptive',
}

/**
 * Physical material properties
 */
export interface PhysicsMaterial {
  density: number;
  restitution: number;
  friction: number;
  airResistance: number;
}

/**
 * Collision shapes for physics objects
 */
export enum CollisionShape {
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
  POLYGON = 'polygon',
  POINT = 'point',
}

/**
 * Physics boundaries
 */
export interface PhysicsBoundaries {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * Physics settings
 */
export interface PhysicsSettings {
  gravity?: Vector2D;
  friction?: number;
  timestep?: number;
  maxStepsPerFrame?: number;
  velocityThreshold?: number;
  displacementThreshold?: number;
  constrainToBoundaries?: boolean;
  boundaries?: PhysicsBoundaries;
}

/**
 * Particle system parameters
 */
export interface ParticleSystemParams {
  count: number;
  lifetime: number;
  emissionRate: number;
  direction: Vector2D | (() => Vector2D);
  speed: number | [number, number];
  size: number | [number, number];
  color: string | string[];
  opacity: number | [number, number];
  gravity: Vector2D;
  wind: Vector2D;
  decay: number;
  spread: number;
}

/**
 * Represents a particle in a particle system
 */
export interface Particle {
  id: string | number;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  size: number;
  color: string;
  opacity: number;
  lifetime: number;
  age: number;
  active: boolean;
}

/**
 * Force field types
 */
export enum ForceFieldType {
  POINT = 'point',
  DIRECTIONAL = 'directional',
  RADIAL = 'radial',
  VORTEX = 'vortex',
  NOISE = 'noise',
}

/**
 * Force field parameters
 */
export interface ForceField {
  type: ForceFieldType;
  position?: Vector2D;
  direction?: Vector2D;
  strength: number;
  radius?: number;
  falloff?: 'linear' | 'quadratic' | 'exponential';
}

/**
 * Common physics animation options
 */
export interface PhysicsAnimationOptions {
  type: PhysicsInteractionType;
  mass?: number;
  stiffness?: number;
  damping?: number;
  gravity?: number | Vector2D;
  friction?: number;
  boundaries?: PhysicsBoundaries;
  collisionElasticity?: number;
  mode?: PhysicsAnimationMode;
  quality?: PhysicsQuality;
  initialVelocity?: Vector2D;
}

/**
 * Threshold options for gesture detection
 */
export interface ThresholdOptions {
  horizontal?: number;
  vertical?: number;
  diagonal?: number;
}
