/**
 * Unified Physics API
 *
 * This module provides a comprehensive, unified API for all physics-based animations
 * and interactions in the Galileo Glass UI system, including:
 * - Spring physics animations
 * - Inertial and momentum-based motion
 * - Collision detection and response
 * - Advanced easing and interpolation functions
 * - Physics-based hooks for React components
 * - High-performance animation renderers (WAAPI)
 */

import {
  // Spring physics
  createSpring,
  SpringPresets,
  // Physics calculations
  createVector,
  Vector2D,
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
  designSpring,
  oscillateAround,
  noise,
  applyNoise,
  ParticleState,
  SpringParams,
  // Collision system
  CollisionSystem,
  createCollisionSystem,
  CollisionBody,
  CollisionResult,
  detectBodyCollision,
  resolveCollisionWithImpulse,
  // Animation renderers
  WaapiRenderer,
  RafRenderer,
  GalileoRendererFactory,
  AnimationRenderer,
  AnimationOptions,
  KeyframeEffect,
  AnimationTarget,
  AnimationPerformanceMetrics,
  // Gesture animation system
  createGestureDetector,
  GestureType,
  GestureState,
  GestureDirection,
  GestureEventData,
  GestureOptions,
  GestureHandler,
  GestureAnimation,
  createGestureAnimation,
  GestureAnimationPreset,
  GestureAnimationConfig,
  GestureTransform
} from './index';

// Import DOM batching from the correct location
import {
  domBatcher,
  DomBatcher,
  BatchPriority,
} from '../performance/DomBatcher';

// Import interpolation functions
import Easings, {
  EasingFunction,
  InterpolationFunction,
  applyEasing,
  blendEasings,
  composeEasings,
  bezier,
  createSpringEasing,
  steps,
  hermiteSpline,
  harmonicOscillation,
  cssStandard,
  materialDesign
} from './interpolation';

// Re-exporting with potentially clearer names if needed internally or for specific contexts
export type {
  InterpolationFunction as InterpolationFunctionFromEasings,
  applyEasing as applyEasingFromEasings,
  blendEasings as blendEasingsFromEasings,
  composeEasings as composeEasingsFromEasings,
  bezier as bezierFromEasings,
  createSpringEasing as createSpringEasingFromEasings,
  steps as stepsFromEasings,
  hermiteSpline as hermiteSplineFromEasings,
  harmonicOscillation as harmonicOscillationFromEasings,
  cssStandard as cssStandardFromEasings,
  materialDesign as materialDesignFromEasings
} from './interpolation';

// Import from collision API
import {
  updateCollisionBody,
  removeCollisionBody,
  updateCollisionSystem,
  CollisionMaterials,
  CollisionOptions,
  createCollisionCircle,
  createCollisionRectangle,
  createCollisionPoint,
  createCollisionPolygon,
  createCollisionBoundaries
} from './collisionAPI';

import { useInertialMovement } from './useInertialMovement';
// Use slightly more descriptive placeholder types
interface InertialMovementOptions { [key: string]: any; }
interface InertialMovementResult { [key: string]: any; }

import { useMomentum } from './useMomentum';
interface MomentumOptions { [key: string]: any; }
interface MomentumResult { [key: string]: any; }

import { useMultiSpring } from './useMultiSpring';
interface MultiSpringOptions { [key: string]: any; }
interface MultiSpringResult { [key: string]: any; }

import {
  PhysicsAnimationMode,
  PhysicsQuality,
  PhysicsInteractionType,
  PhysicsAnimationOptions
} from './types';

import {
  advancedPhysicsAnimation,
  generatePhysicsKeyframes,
  calculateSpringParameters,
  AdvancedPhysicsOptions,
  PhysicsState,
  SimulationType
} from './advancedPhysicsAnimations';

import {
  springAnimation,
  SpringAnimationOptions
} from './springAnimation';

import {
  magneticEffect,
  MagneticEffectOptions
} from './magneticEffect';

import {
  particleSystem,
  ParticleSystemOptions
} from './particleSystem';

import { Vector2D as EngineVector2D, PhysicsBodyOptions, PhysicsBodyState } from './engineTypes';
import { GalileoPhysicsSystem } from './galileoPhysicsSystem';
import { SpringConfig } from './springPhysics';

// Consolidated API class
export class GalileoPhysics {
  // Main physics systems
  private static _collisionSystem: CollisionSystem | null = null;
  private static _waapiRenderer: WaapiRenderer | null = null;
  private static _rafRenderer: RafRenderer | null = null;
  private static _rendererFactory: GalileoRendererFactory = GalileoRendererFactory.getInstance();
  
  // Spring systems and physics animations
  public static createSpring = createSpring;
  public static SpringPresets = SpringPresets;
  public static advancedPhysicsAnimation = advancedPhysicsAnimation;
  public static generatePhysicsKeyframes = generatePhysicsKeyframes;
  public static calculateSpringParameters = calculateSpringParameters;
  public static springAnimation = springAnimation;
  public static magneticEffect = magneticEffect;
  public static particleSystem = particleSystem;
  
  // Interpolation functions
  public static Easings = Easings;
  public static applyEasing = applyEasing;
  public static blendEasings = blendEasings;
  public static composeEasings = composeEasings;
  public static bezier = bezier;
  public static createSpringEasing = createSpringEasing;
  public static steps = steps;
  public static hermiteSpline = hermiteSpline;
  public static harmonicOscillation = harmonicOscillation;
  public static cssStandard = cssStandard;
  public static materialDesign = materialDesign;
  
  // Physics React hooks
  public static useInertialMovement = useInertialMovement;
  public static useMomentum = useMomentum;
  public static useMultiSpring = useMultiSpring;
  
  // Vector and physics calculation utilities
  public static createVector = createVector;
  public static addVectors = addVectors;
  public static subtractVectors = subtractVectors;
  public static multiplyVector = multiplyVector;
  public static vectorMagnitude = vectorMagnitude;
  public static normalizeVector = normalizeVector;
  public static limitVector = limitVector;
  public static dotProduct = dotProduct;
  public static vectorDistance = vectorDistance;
  public static calculateSpringForce = calculateSpringForce;
  public static calculateDampingForce = calculateDampingForce;
  public static calculateGravity = calculateGravity;
  public static calculateFriction = calculateFriction;
  public static calculateMagneticForce = calculateMagneticForce;
  public static designSpring = designSpring;
  public static oscillateAround = oscillateAround;
  public static noise = noise;
  public static applyNoise = applyNoise;
  public static updateParticle = updateParticle;
  
  // Collision system methods
  
  /**
   * Gets the global collision system, creating it if needed
   */
  public static getCollisionSystem(): CollisionSystem {
    if (!this._collisionSystem) {
      this._collisionSystem = createCollisionSystem();
    }
    return this._collisionSystem;
  }
  
  /**
   * Resets the collision system
   */
  public static resetCollisionSystem(): void {
    if (this._collisionSystem) {
      this._collisionSystem.clear();
    }
    this._collisionSystem = createCollisionSystem();
  }
  
  /**
   * Creates a circular collision body
   */
  public static createCircle(
    id: string | number,
    position: Vector2D,
    radius: number,
    mass = 1,
    velocity: Vector2D = { x: 0, y: 0 },
    options: CollisionOptions = {}
  ): CollisionBody {
    return createCollisionCircle(id, position, radius, mass, velocity, options);
  }
  
  /**
   * Creates a rectangular collision body
   */
  public static createRectangle(
    id: string | number,
    position: Vector2D,
    width: number,
    height: number,
    mass = 1,
    velocity: Vector2D = { x: 0, y: 0 },
    rotation = 0,
    options: CollisionOptions = {}
  ): CollisionBody {
    return createCollisionRectangle(id, position, width, height, mass, velocity, rotation, options);
  }
  
  /**
   * Creates a point collision body
   */
  public static createPoint(
    id: string | number,
    position: Vector2D,
    mass = 1,
    velocity: Vector2D = { x: 0, y: 0 },
    tolerance = 1,
    options: CollisionOptions = {}
  ): CollisionBody {
    return createCollisionPoint(id, position, mass, velocity, tolerance, options);
  }
  
  /**
   * Creates a polygon collision body
   */
  public static createPolygon(
    id: string | number,
    position: Vector2D,
    vertices: Vector2D[],
    mass = 1,
    velocity: Vector2D = { x: 0, y: 0 },
    rotation = 0,
    options: CollisionOptions = {}
  ): CollisionBody {
    return createCollisionPolygon(id, position, vertices, mass, velocity, rotation, options);
  }
  
  /**
   * Creates boundary walls
   */
  public static createBoundaries(
    id: string | number,
    x: number,
    y: number,
    width: number,
    height: number,
    thickness = 10
  ): CollisionBody[] {
    return createCollisionBoundaries(id, x, y, width, height, thickness);
  }
  
  /**
   * Updates a collision body
   */
  public static updateBody(
    id: string | number,
    position?: Vector2D,
    velocity?: Vector2D,
    rotation?: number
  ): void {
    updateCollisionBody(id, position, velocity, rotation);
  }
  
  /**
   * Removes a collision body
   */
  public static removeBody(id: string | number): void {
    removeCollisionBody(id);
  }
  
  /**
   * Updates the collision system
   */
  public static update(): void {
    updateCollisionSystem();
  }
  
  /**
   * Detects collision between two bodies
   */
  public static detectCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
    return detectBodyCollision(bodyA, bodyB);
  }
  
  /**
   * Resolves a collision
   */
  public static resolveCollision(result: CollisionResult): void {
    resolveCollisionWithImpulse(result);
  }
  
  /**
   * Creates a physics animation configuration
   */
  public static createAnimationConfig(options: Partial<PhysicsAnimationOptions> = {}): PhysicsAnimationOptions {
    return {
      type: options.type || PhysicsInteractionType.SPRING,
      mass: options.mass || 1,
      stiffness: options.stiffness || 170,
      damping: options.damping || 26,
      gravity: options.gravity || { x: 0, y: 0 },
      friction: options.friction || 0.1,
      boundaries: options.boundaries || undefined,
      collisionElasticity: options.collisionElasticity || 0.3,
      mode: options.mode || PhysicsAnimationMode.NATURAL,
      quality: options.quality || PhysicsQuality.MEDIUM,
      initialVelocity: options.initialVelocity || { x: 0, y: 0 }
    };
  }
  
  // DOM Batching

  /**
   * Gets the DOM batcher instance
   */
  public static getDomBatcher(): DomBatcher {
    return domBatcher;
  }

  /**
   * Batch multiple style changes for an element
   */
  public static batchStyles(
    element: HTMLElement,
    styles: Record<string, string>,
    priority?: BatchPriority
  ): Promise<void> {
    return domBatcher.batchStyles(element, styles, priority);
  }

  /**
   * Schedule a DOM read operation
   */
  public static readDOM<T>(
    callback: () => T,
    priority?: BatchPriority
  ): Promise<T> {
    return domBatcher.read(callback, priority);
  }

  /**
   * Schedule a DOM write operation
   */
  public static writeDOM<T>(
    callback: () => T,
    priority?: BatchPriority
  ): Promise<T> {
    return domBatcher.write(callback, priority);
  }

  /**
   * Schedule a DOM measure operation
   */
  public static measureDOM<T>(
    element: Element,
    measureFn: (el: Element) => T,
    priority?: BatchPriority
  ): Promise<T> {
    return domBatcher.measure(element, measureFn, priority);
  }

  /**
   * Schedule a DOM mutation operation
   */
  public static mutateDOM<T>(
    element: Element,
    mutateFn: (el: Element) => T,
    priority?: BatchPriority
  ): Promise<T> {
    return domBatcher.mutate(element, mutateFn, priority);
  }

  // Animation renderers
  
  /**
   * Gets the WAAPI renderer, creating it if needed
   */
  public static getWaapiRenderer(options?: Record<string, any>): WaapiRenderer {
    if (!this._waapiRenderer) {
      this._waapiRenderer = new WaapiRenderer(options);
    }
    return this._waapiRenderer;
  }
  
  /**
   * Gets the RAF renderer, creating it if needed
   */
  public static getRafRenderer(options?: Record<string, any>): RafRenderer {
    if (!this._rafRenderer) {
      this._rafRenderer = new RafRenderer(options);
    }
    return this._rafRenderer;
  }
  
  /**
   * Gets the renderer factory instance
   */
  public static getRendererFactory(): GalileoRendererFactory {
    return this._rendererFactory;
  }
  
  /**
   * Creates the optimal renderer based on device capabilities and options
   */
  public static createRenderer(options?: Record<string, any>): AnimationRenderer {
    return this._rendererFactory.createRenderer(options);
  }
  
  /**
   * Checks if the Web Animations API is supported
   */
  public static isWaapiSupported(): boolean {
    return WaapiRenderer.isSupported();
  }
  
  /**
   * Animate an element using the optimal renderer
   */
  public static animate<T extends AnimationTarget>(
    target: T,
    keyframes: KeyframeEffect,
    options: AnimationOptions = {}
  ): { id: string; animation: Animation | null } {
    // Use the factory to get the optimal renderer
    const renderer = this.createRenderer({
      // Pass options correctly
      ...options
    });
    
    // Cast the result animation type
    const result = renderer.animate(target, keyframes, options);
    return {
        id: result.id,
        animation: result.animation as Animation | null
    };
  }
  
  /**
   * Get performance metrics for the current optimal renderer
   */
  public static getPerformanceMetrics(): AnimationPerformanceMetrics {
    const renderer = this.createRenderer();
    return this._rendererFactory.getPerformanceMetrics(renderer);
  }
  
  /**
   * Control animation playback
   */
  public static playAnimation(id: string): void {
    if (this._waapiRenderer) {
      this._waapiRenderer.play(id);
    }
  }
  
  /**
   * Pause animation
   */
  public static pauseAnimation(id: string): void {
    if (this._waapiRenderer) {
      this._waapiRenderer.pause(id);
    }
  }
  
  /**
   * Cancel animation
   */
  public static cancelAnimation(id: string): void {
    if (this._waapiRenderer) {
      this._waapiRenderer.cancel(id);
    }
  }
  
  /**
   * Get animation state
   */
  public static getAnimationState(id: string): string | null {
    if (this._waapiRenderer) {
      return this._waapiRenderer.getState(id);
    }
    return null;
  }
  
  /**
   * Create a physics-based animation using WAAPI
   */
  public static animateWithPhysics<T extends AnimationTarget>(
    target: T,
    property: string,
    from: number | string,
    to: number | string,
    physicsConfig: Partial<AdvancedPhysicsOptions> = {}, 
    animationConfig: AnimationOptions = {} 
  ): { id: string; animation: Animation | null } {
    // Construct full physics options needed by generatePhysicsKeyframes
    const fullPhysicsOptions: AdvancedPhysicsOptions = {
      // Use simulationType from physicsConfig or default to SPRING
      simulationType: physicsConfig.simulationType ?? SimulationType.SPRING,
      property: property,
      from: typeof from === 'string' ? parseFloat(from) : from,
      to: typeof to === 'string' ? parseFloat(to) : to,
      // Pass other physics properties directly
      mass: physicsConfig.mass !== undefined ? physicsConfig.mass : undefined,
      stiffness: physicsConfig.stiffness !== undefined ? physicsConfig.stiffness : undefined,
      damping: physicsConfig.damping !== undefined ? physicsConfig.damping : undefined,
      initialVelocity: physicsConfig.initialVelocity !== undefined ? physicsConfig.initialVelocity : undefined,
      boundaries: physicsConfig.boundaries !== undefined ? physicsConfig.boundaries : undefined,
      friction: physicsConfig.friction !== undefined ? physicsConfig.friction : undefined,
      gravity: physicsConfig.gravity !== undefined ? physicsConfig.gravity : undefined,
      collisionElasticity: physicsConfig.collisionElasticity !== undefined ? physicsConfig.collisionElasticity : undefined,
      quality: physicsConfig.quality !== undefined ? physicsConfig.quality : undefined,
      // Include other relevant options from AdvancedPhysicsOptions if needed
      magnetic: physicsConfig.magnetic,
      particles: physicsConfig.particles,
      bounciness: physicsConfig.bounciness,
      elasticity: physicsConfig.elasticity,
      viscosity: physicsConfig.viscosity,
      complexity: physicsConfig.complexity,
      // etc.
    };
    
    // Generate physics keyframes and get calculated duration
    const keyframesResult = generatePhysicsKeyframes(fullPhysicsOptions);
    
    // Construct final AnimationOptions using the separate animationConfig
    const finalAnimationOptions: AnimationOptions = {
        // Prioritize user-specified duration, otherwise use physics duration
        duration: animationConfig.duration ?? keyframesResult.duration,
        easing: 'linear', // Use linear easing as physics is in keyframes
        delay: animationConfig.delay,
        endDelay: animationConfig.endDelay,
        iterations: animationConfig.iterations,
    };
    
    // Call animate with the generated keyframes and final animation options
    return this.animate(target, keyframesResult.keyframes, finalAnimationOptions);
  }
  
  /**
   * Create a gesture detector for an HTML element
   */
  public static createGestureDetector(
    element: HTMLElement,
    options?: GestureOptions
  ) {
    return createGestureDetector(element, options);
  }
  
  /**
   * Create a gesture-driven animation
   */
  public static createGestureAnimation(
    config: GestureAnimationConfig
  ) {
    return createGestureAnimation(config);
  }
  
  /**
   * Gesture types available for detection
   */
  public static Gestures = GestureType;
  
  /**
   * Gesture animation presets
   */
  public static GesturePresets = GestureAnimationPreset;
  
  /**
   * Standard material presets
   */
  public static Materials = {
    // Extend with collision materials
    ...CollisionMaterials,
    
    // Additional materials
    GLASS: {
      density: 0.8,
      restitution: 0.3,
      friction: 0.1,
      airResistance: 0.01
    },
    METAL: {
      density: 2.0,
      restitution: 0.2,
      friction: 0.2,
      airResistance: 0.005
    },
    PAPER: {
      density: 0.3,
      restitution: 0.1,
      friction: 0.4,
      airResistance: 0.05
    },
    RUBBER: {
      density: 1.0,
      restitution: 0.7,
      friction: 0.7,
      airResistance: 0.02
    }
  };
}

// Export individual physics system components for direct access
export {
  // Basic value exports
  SpringPresets,
  PhysicsAnimationMode,
  PhysicsQuality,
  
  // Hooks
  useInertialMovement,
  useMomentum,
  useMultiSpring,
};

// Export types with the 'export type' syntax
export type { Vector2D };
export type { SpringConfig };
export type { SpringParams };
export type { ParticleState };
export type { PhysicsState };
export type { CollisionBody };
export type { CollisionResult };
export type { CollisionOptions };

// Hook-related types
export type { InertialMovementOptions };
export type { InertialMovementResult };
export type { MomentumOptions };
export type { MomentumResult };
export type { MultiSpringOptions };
export type { MultiSpringResult };

// Animation options types
export type { PhysicsAnimationOptions };
export type { AdvancedPhysicsOptions };
export type { SpringAnimationOptions };
export type { MagneticEffectOptions };
export type { ParticleSystemOptions };

// Animation renderers
export { WaapiRenderer };
export type { AnimationRenderer };
export type { AnimationOptions };
export type { KeyframeEffect };
export type { AnimationTarget };
export type { AnimationPerformanceMetrics };

// Gesture system
export {
  GestureType,
  GestureState,
  GestureDirection,
  GestureAnimation,
  GestureAnimationPreset,
  createGestureDetector,
  createGestureAnimation,
};
export type { GestureEventData };
export type { GestureOptions };
export type { GestureHandler };
export type { GestureAnimationConfig };
export type { GestureTransform };

// Interpolation and easing
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
  materialDesign
};
export type { EasingFunction };
export type { InterpolationFunction };

// Default export for the unified API
export default GalileoPhysics;