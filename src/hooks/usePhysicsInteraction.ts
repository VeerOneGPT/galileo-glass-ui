/**
 * Advanced Physics Interaction Hook
 *
 * React hook for applying realistic physics-based interactions to elements
 * with enhanced capabilities and performance optimizations.
 */
import React, { useRef, useEffect, useState, useCallback, useMemo, CSSProperties, RefObject } from 'react';

import { applyGpuAcceleration, backfaceVisibility } from '../core/cssHelpers';
import { AnyHTMLElement, FlexibleElementRef } from '../utils/elementTypes';
import { useGlassPerformance } from './useGlassPerformance';
import { useReducedMotion } from './useReducedMotion';
import { AnimationProps } from '../animations/types';
import { SpringConfig, SpringPresets } from '../animations/physics/springPhysics';
import { useAnimationContext } from '../contexts/AnimationContext';
import { MotionSensitivityLevel } from '../animations/accessibility/MotionSensitivity';
import { useAmbientTilt, AmbientTiltOptions } from './useAmbientTilt';

// Import from local utils
const markAsAnimating = (element: AnyHTMLElement | null): void => {
  if (!element) return;
  element.style.willChange = 'transform';
};

// Local wrapper for GPU acceleration
const addGpuAcceleration = (
  element: AnyHTMLElement | CSSStyleDeclaration | null,
  useWillChange = false
): void => {
  if (!element) return;

  if (element instanceof HTMLElement) {
    // If it's an HTML element, use the imported utility
    applyGpuAcceleration(element);
  } else {
    // For CSSStyleDeclaration
    // Apply 3D transform for GPU hardware acceleration
    if ('transform' in element) {
      element.transform = 'translateZ(0)';
    }

    // Apply backface visibility with proper typing
    element.backfaceVisibility = 'hidden';
    element.webkitBackfaceVisibility = 'hidden';

    // Apply will-change if requested
    if (useWillChange && 'willChange' in element) {
      element.willChange = 'transform, opacity';
    }
  }
};

/**
 * Physics interaction types
 */
export type PhysicsInteractionType =
  | 'spring' // Spring-based movement
  | 'gravity' // Gravitational pull
  | 'particle' // Particle-like jittering
  | 'magnetic' // Attraction force (renamed from attract)
  | 'repel' // Repulsion force
  | 'follow' // Smooth following
  | 'orbit' // Orbital movement
  | 'elastic' // Elastic snap-back
  | 'fluid' // Fluid-like movement
  | 'bounce' // Bouncy interaction
  | 'inertia' // Movement with inertia
  | 'vortex' // Spiral/vortex movement
  | 'none'; // No physics interaction

/**
 * Physics object material properties
 */
export interface PhysicsMaterial {
  /**
   * Density of the material (affects mass)
   */
  density?: number;

  /**
   * Elasticity/restitution of the material (bounciness)
   */
  restitution?: number;

  /**
   * Friction coefficient
   */
  friction?: number;

  /**
   * Air resistance/drag coefficient
   */
  drag?: number;
}

/**
 * Physics vector for 2D/3D positions and forces
 */
export interface PhysicsVector {
  x: number;
  y: number;
  z?: number;
}

/**
 * Physics collision shape
 */
export type CollisionShape = 'circle' | 'rectangle' | 'polygon' | 'none';

/**
 * Physics calculation quality
 */
export type PhysicsQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Physics interaction options with advanced capabilities
 */
export interface PhysicsInteractionOptions {
  /**
   * Type of physics interaction
   */
  type?: PhysicsInteractionType;

  /**
   * Strength of the interaction (0-1)
   */
  strength?: number;

  /**
   * Activation radius in pixels
   */
  radius?: number;

  /**
   * Mass of the object (higher = more inertia)
   */
  mass?: number;

  /**
   * Stiffness for spring physics (higher = faster)
   */
  stiffness?: number;

  /**
   * Damping ratio (1 = critically damped, <1 = bouncy, >1 = overdamped)
   */
  dampingRatio?: number;

  /**
   * Ease factor for smoothing (0-1, lower = more smoothing)
   */
  easeFactor?: number;

  /**
   * Maximum displacement in pixels
   */
  maxDisplacement?: number;

  /**
   * If true, applies effect to Z-axis rotation as well
   */
  affectsRotation?: boolean;

  /**
   * If true, applies effect to scale as well
   */
  affectsScale?: boolean;

  /**
   * Rotation amplitude in degrees (if affectsRotation is true)
   */
  rotationAmplitude?: number;

  /**
   * Scale amplitude (if affectsScale is true)
   */
  scaleAmplitude?: number;

  /**
   * If true, applies effect to 3D tilt (rotateX/rotateY) as well.
   * Requires perspective to be set on a parent element.
   */
  affectsTilt?: boolean;

  /**
   * Tilt amplitude in degrees (if affectsTilt is true)
   */
  tiltAmplitude?: number;

  /**
   * If true, will optimize for GPU acceleration
   */
  gpuAccelerated?: boolean;

  /**
   * If true, applies transition to movement for smoother effect
   */
  smooth?: boolean;

  /**
   * Smoothing duration in milliseconds
   */
  smoothingDuration?: number;

  /**
   * If true, will only activate when hovering over the element (deprecated, use pointer events)
   */
  activeOnHoverOnly?: boolean;

  /**
   * Material properties for physics calculations
   */
  material?: PhysicsMaterial;

  /**
   * Collision shape for the object
   */
  collisionShape?: CollisionShape;

  /**
   * Whether the object should be affected by global forces
   */
  affectedByGlobalForces?: boolean;

  /**
   * External force vector to apply
   */
  externalForce?: PhysicsVector;

  /**
   * Gravity strength and direction
   */
  gravity?: PhysicsVector & { strength?: number };

  /**
   * Precision of physics calculations
   */
  calculationQuality?: PhysicsQuality;

  /**
   * Physics update rate (calls per second, higher = more accurate but less performant)
   */
  updateRate?: number;

  /**
   * Time scale for physics (1 = normal, <1 = slower, >1 = faster)
   */
  timeScale?: number;

  /**
   * Whether to pause physics when element is not visible
   */
  pauseWhenInvisible?: boolean;

  /**
   * Whether to use high-precision physics for small movements
   */
  highPrecision?: boolean;

  /**
   * Whether to optimize performance automatically
   */
  autoOptimize?: boolean;

  /**
   * Whether to enable advanced collision detection
   */
  enableCollisions?: boolean;

  /**
   * Whether to enable 3D physics effects (used for perspective/transform-style)
   */
  enable3D?: boolean;

  /**
   * Z-depth range for 3D effects
   */
  depthRange?: number;

  /**
   * Position of attractor for certain physics types
   */
  attractorPosition?: PhysicsVector;

  /**
   * Multiple attractors for complex physics interactions
   */
  attractors?: Array<{
    position: PhysicsVector;
    strength: number;
    radius: number;
  }>;

  /**
   * Bounds for constraining the physics effect
   */
  bounds?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    zNear?: number;
    zFar?: number;
  };

  /**
   * Custom easing function for interpolation
   */
  easingFunction?: (t: number) => number;

  /**
   * Whether to use realistic air resistance simulation
   */
  useAirResistance?: boolean;

  /**
   * Velocity decay factor (0-1, higher = faster decay)
   */
  velocityDecay?: number;

  /**
   * Whether to force reduced motion mode regardless of system settings
   */
  reducedMotion?: boolean;

  /**
   * Animation configuration
   */
  animationConfig?: AnimationProps['animationConfig'];

  /**
   * Motion sensitivity level
   */
  motionSensitivityLevel?: MotionSensitivityLevel;

  /**
   * A React ref pointing to the DOM element that should trigger the physics interaction.
   */
  elementRef?: React.RefObject<HTMLElement | SVGElement | null>;

  /**
   * Whether to enable the global ambient tilt effect. Defaults to false.
   */
  enableAmbientTilt?: boolean;
  /**
   * Specific configuration options for the ambient tilt effect if enabled.
   */
  ambientTiltOptions?: AmbientTiltOptions;
}

/**
 * Physics state values with enhanced properties
 */
export interface PhysicsState {
  /**
   * Current x position offset (from spring)
   */
  x: number;

  /**
   * Current y position offset (from spring)
   */
  y: number;

  /**
   * Current z position offset (from spring)
   */
  z: number;

  /**
   * Pointer's horizontal position relative to element center (-1 to 1).
   * Updated only when interaction is active.
   */
  relativeX: number;

  /**
   * Pointer's vertical position relative to element center (-1 to 1).
   * Updated only when interaction is active.
   */
  relativeY: number;

  /**
   * Current Z-axis rotation in degrees (if affectsRotation)
   */
  rotation: number;

  /**
   * Current scale factor (if affectsScale)
   */
  scale: number;

  /**
   * Boolean indicating if the pointer is currently interacting (over the element)
   */
  active: boolean;

  /**
   * Current velocity vector of the spring model
   */
  velocity: PhysicsVector;

  /**
   * Current acceleration vector (internal, might not be useful externally)
   */
  acceleration: PhysicsVector;

  /**
   * Angular velocity (degrees per second) - Placeholder
   */
  angularVelocity: number;

  /**
   * Distance from attractor - Placeholder
   */
  distance: number;

  /**
   * Whether the object is currently colliding - Placeholder
   */
  isColliding: boolean;

  /**
   * Energy of the physics system - Placeholder
   */
  energy: number;
}

/**
 * Spring physics simulation model (critically damped spring)
 */
class SpringModel {
  private position: PhysicsVector = { x: 0, y: 0, z: 0 };
  private velocity: PhysicsVector = { x: 0, y: 0, z: 0 };
  private target: PhysicsVector = { x: 0, y: 0, z: 0 };
  private mass: number;
  private stiffness: number;
  private damping: number;
  private precisionThreshold: number = 0.01;

  constructor(mass: number, stiffness: number, dampingRatio: number, precision: number = 0.01) {
    this.mass = Math.max(mass, 0.1);
    this.stiffness = Math.max(stiffness, 0);
    this.damping = dampingRatio * 2 * Math.sqrt(this.mass * this.stiffness);
    this.precisionThreshold = precision;
  }

  public setTarget(x: number, y: number, z = 0): void {
    this.target = { x, y, z: z || 0 };
  }

  public update(dt: number): PhysicsVector {
    if (dt <= 0) return this.position;

    const deltaTime = Math.min(dt, 0.032);

    ['x', 'y', 'z'].forEach(axis => {
      const currentPos = this.position[axis];
      const currentVel = this.velocity[axis];
      const targetPos = this.target[axis];

      if (currentPos === undefined || currentVel === undefined || targetPos === undefined) return;

      const displacement = currentPos - targetPos;
      const springForce = -this.stiffness * displacement;
      const dampingForce = -this.damping * currentVel;
      const acceleration = (springForce + dampingForce) / this.mass;
      this.velocity[axis] = currentVel + acceleration * deltaTime;
      this.position[axis] = currentPos + this.velocity[axis] * deltaTime;
    });

    return this.position;
  }

  public getPosition(): PhysicsVector {
    return { ...this.position };
  }

  public getVelocity(): PhysicsVector {
    return { ...this.velocity };
  }

  public setPosition(x: number, y: number, z = 0): void {
    this.position = { x, y, z: z || 0 };
  }

  public setVelocity(x: number, y: number, z = 0): void {
    this.velocity = { x, y, z: z || 0 };
  }

  public getEnergy(): number {
    const kineticEnergy =
      0.5 * this.mass * (this.velocity.x ** 2 + this.velocity.y ** 2 + (this.velocity.z || 0) ** 2);

    const potentialEnergy =
      0.5 *
      this.stiffness *
      ((this.position.x - this.target.x) ** 2 +
        (this.position.y - this.target.y) ** 2 +
        ((this.position.z || 0) - (this.target.z || 0)) ** 2);

    return kineticEnergy + potentialEnergy;
  }

  public isAtRest(): boolean {
    const threshold = this.precisionThreshold;
    const isPositionAtRest =
      Math.abs(this.position.x - this.target.x) < threshold &&
      Math.abs(this.position.y - this.target.y) < threshold &&
      Math.abs((this.position.z || 0) - (this.target.z || 0)) < threshold;

    const isVelocityAtRest =
      Math.abs(this.velocity.x) < threshold &&
      Math.abs(this.velocity.y) < threshold &&
      Math.abs(this.velocity.z || 0) < threshold;

    return isPositionAtRest && isVelocityAtRest;
  }

  public reset(): void {
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
  }
}

/**
 * Clamp a value between min and max
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

/**
 * Vector interpolation
 */
const lerpVector = (a: PhysicsVector, b: PhysicsVector, t: number): PhysicsVector => {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: a.z !== undefined && b.z !== undefined ? lerp(a.z, b.z, t) : undefined,
  };
};

/**
 * Enhanced easing functions
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInElastic: (t: number) =>
    t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
  easeOutElastic: (t: number) =>
    t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
  easeInOutElastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) {
      return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2;
    }
    return (
      (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1
    );
  },
};

// --- Internal Helper for Config Resolution ---
const resolvePhysicsConfig = (
  options: PhysicsInteractionOptions,
  contextDefaultSpring: AnimationProps['animationConfig'] | undefined
): {
  stiffness: number;
  dampingRatio: number;
  mass: number;
  affectsScale: boolean;
  scaleAmplitude: number;
  affectsRotation: boolean;
  rotationAmplitude: number;
  affectsTilt: boolean;
  tiltAmplitude: number;
  motionSensitivityLevel: MotionSensitivityLevel;
  maxDisplacement: number;
  enableAmbientTilt: boolean;
  ambientTiltOptions: AmbientTiltOptions | undefined;
} => {
  // Base defaults for the hook's physics behavior
  const basePhysicsDefaults = {
    stiffness: SpringPresets.DEFAULT.tension,
    dampingRatio: 0.6,
    mass: SpringPresets.DEFAULT.mass ?? 1,
    affectsScale: false,
    scaleAmplitude: 0.05,
    affectsRotation: false,
    rotationAmplitude: 10,
    affectsTilt: false,
    tiltAmplitude: 15,
    motionSensitivityLevel: MotionSensitivityLevel.MEDIUM,
    maxDisplacement: 10,
  };

  let finalSpringConfig: SpringConfig = { ...SpringPresets.DEFAULT };

  if (typeof contextDefaultSpring === 'string' && contextDefaultSpring in SpringPresets) {
    finalSpringConfig = { ...finalSpringConfig, ...SpringPresets[contextDefaultSpring as keyof typeof SpringPresets] };
  } else if (typeof contextDefaultSpring === 'object' && contextDefaultSpring !== null) {
    finalSpringConfig = { ...finalSpringConfig, ...contextDefaultSpring };
  }

  const propAnimCfg = options.animationConfig;
  if (typeof propAnimCfg === 'string' && propAnimCfg in SpringPresets) {
    finalSpringConfig = { ...finalSpringConfig, ...SpringPresets[propAnimCfg as keyof typeof SpringPresets] };
  } else if (typeof propAnimCfg === 'object' && ('tension' in propAnimCfg || 'friction' in propAnimCfg)) {
    finalSpringConfig = { ...finalSpringConfig, ...(propAnimCfg as Partial<SpringConfig>) };
  }

  const mappedStiffness = finalSpringConfig.tension;
  const mappedMass = finalSpringConfig.mass ?? basePhysicsDefaults.mass;
  let mappedDampingRatio = basePhysicsDefaults.dampingRatio;
  if (finalSpringConfig.friction && mappedStiffness > 0 && mappedMass > 0) {
      mappedDampingRatio = finalSpringConfig.friction / (2 * Math.sqrt(mappedStiffness * mappedMass));
  }

  const sensitivityLevel = options.motionSensitivityLevel ?? basePhysicsDefaults.motionSensitivityLevel;
  let sensitivityMultiplier = 1.0;
  switch (sensitivityLevel) {
      case MotionSensitivityLevel.LOW: sensitivityMultiplier = 0.5; break;
      case MotionSensitivityLevel.HIGH: sensitivityMultiplier = 1.5; break;
      default: sensitivityMultiplier = 1.0; break;
  }

  const stiffness = options.stiffness ?? mappedStiffness;
  const dampingRatio = options.dampingRatio ?? mappedDampingRatio;
  const mass = options.mass ?? mappedMass;
  const affectsScale = options.affectsScale ?? basePhysicsDefaults.affectsScale;
  const scaleAmplitude = (options.scaleAmplitude ?? basePhysicsDefaults.scaleAmplitude) * sensitivityMultiplier;
  const affectsRotation = options.affectsRotation ?? basePhysicsDefaults.affectsRotation;
  const rotationAmplitude = (options.rotationAmplitude ?? basePhysicsDefaults.rotationAmplitude) * sensitivityMultiplier;
  const affectsTilt = options.affectsTilt ?? basePhysicsDefaults.affectsTilt;
  const tiltAmplitude = (options.tiltAmplitude ?? basePhysicsDefaults.tiltAmplitude) * sensitivityMultiplier;
  const maxDisplacement = options.maxDisplacement ?? basePhysicsDefaults.maxDisplacement;

  const enableAmbientTilt = options.enableAmbientTilt ?? false;
  const ambientTiltOptions = options.ambientTiltOptions;

  return {
    stiffness: Math.max(0.1, stiffness),
    dampingRatio: clamp(dampingRatio, 0, 2),
    mass: Math.max(0.1, mass),
    affectsScale,
    scaleAmplitude,
    affectsRotation,
    rotationAmplitude,
    affectsTilt,
    tiltAmplitude,
    motionSensitivityLevel: sensitivityLevel,
    maxDisplacement,
    enableAmbientTilt,
    ambientTiltOptions,
  };
};

/**
 * React Hook for Physics-Based UI Interactions
 */
export const usePhysicsInteraction = <T extends HTMLElement | SVGElement>(
  options: PhysicsInteractionOptions = {}
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties;
  state: PhysicsState;
  update: (newOptions: Partial<PhysicsInteractionOptions>) => void;
  reset: () => void;
  applyForce: (force: PhysicsVector) => void;
  applyImpulse: (impulse: PhysicsVector) => void;
  setPosition: (position: PhysicsVector) => void;
  isPaused: boolean;
  togglePause: () => void;
} => {
  const elementRef = useRef<T>(null);
  const [currentOptions, setCurrentOptions] = useState(options);

  const physicsStateRef = useRef<PhysicsState>({
    x: 0, y: 0, z: 0,
    relativeX: 0, relativeY: 0,
    rotation: 0, scale: 1, active: false,
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    angularVelocity: 0, distance: 0,
    isColliding: false, energy: 0,
  });
  // State to make transform values reactive for the returned style object
  const [transformValues, setTransformValues] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);
  const springModelRef = useRef<SpringModel | null>(null);
  const lastUpdateTimeRef = useRef<number>(performance.now());
  const isMounted = useRef(false);

  const systemPrefersReducedMotion = useReducedMotion();
  const { defaultSpring } = useAnimationContext();

  const resolvedPhysicsConfig = useMemo(() => {
      return resolvePhysicsConfig(currentOptions, defaultSpring);
  }, [currentOptions, defaultSpring]);

  const isDisabled = currentOptions.reducedMotion ?? systemPrefersReducedMotion;

  const { style: ambientStyle } = useAmbientTilt(
      resolvedPhysicsConfig.enableAmbientTilt ? resolvedPhysicsConfig.ambientTiltOptions : { enabled: false }
  );

  useEffect(() => {
    isMounted.current = true;
    springModelRef.current = new SpringModel(
      resolvedPhysicsConfig.mass,
      resolvedPhysicsConfig.stiffness,
      resolvedPhysicsConfig.dampingRatio
    );
    springModelRef.current.setTarget(0, 0);
    springModelRef.current.reset();
    setTransformValues({ x: 0, y: 0, scale: 1, rotation: 0 });
    lastUpdateTimeRef.current = performance.now();
    
    return () => { isMounted.current = false; };
  }, [resolvedPhysicsConfig.mass, resolvedPhysicsConfig.stiffness, resolvedPhysicsConfig.dampingRatio]);

  // Initialize useRef with undefined
  const animateCallback = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
     animateCallback.current = () => {
         if (!isMounted.current || !springModelRef.current) {
             animationFrameRef.current = null;
             return;
         }

         const currentTime = performance.now();
         const deltaTime = Math.min((currentTime - lastUpdateTimeRef.current) / 1000, 0.032);
         lastUpdateTimeRef.current = currentTime;

         const position = springModelRef.current.update(deltaTime);
         const velocity = springModelRef.current.getVelocity();

         physicsStateRef.current.x = position.x;
         physicsStateRef.current.y = position.y;
         physicsStateRef.current.z = position.z ?? 0;
         physicsStateRef.current.velocity = velocity;

         const magnitude = Math.sqrt(position.x * position.x + position.y * position.y);
         let scale = 1;
         let rotation = 0;

         if (magnitude > 0.01 && (resolvedPhysicsConfig.affectsScale || resolvedPhysicsConfig.affectsRotation)) {
             const influence = clamp(magnitude / resolvedPhysicsConfig.maxDisplacement, 0, 1);
             if (resolvedPhysicsConfig.affectsScale) {
                 scale = 1 + resolvedPhysicsConfig.scaleAmplitude * influence;
             }
             if (resolvedPhysicsConfig.affectsRotation) {
                  const angle = Math.atan2(position.y, position.x); 
                  rotation = (angle * (180 / Math.PI)) * influence * (resolvedPhysicsConfig.rotationAmplitude / 90); 
             }
         }

         setTransformValues({ x: position.x, y: position.y, scale: scale, rotation: rotation });
         physicsStateRef.current.scale = scale;
         physicsStateRef.current.rotation = rotation;

         if (!springModelRef.current.isAtRest() || isInteractingRef.current) {
           if(isMounted.current) animationFrameRef.current = requestAnimationFrame(animateCallback.current); 
         } else {
           animationFrameRef.current = null;
         }
     };
  }, [resolvedPhysicsConfig]);

  const handlePointerEnter = useCallback((event: PointerEvent) => {
    if (isDisabled || !elementRef.current) return;
    isInteractingRef.current = true;
    physicsStateRef.current.active = true; 
    lastUpdateTimeRef.current = performance.now(); 
    if (!animationFrameRef.current && animateCallback.current) {
      animationFrameRef.current = requestAnimationFrame(animateCallback.current); 
    }
  }, [isDisabled]); 

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (isDisabled || !isInteractingRef.current || !elementRef.current || !springModelRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; 
    
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    const pointerX = event.clientX - elementCenterX;
    const pointerY = event.clientY - elementCenterY;
    const relativeX = clamp(pointerX / (rect.width / 2), -1, 1);
    const relativeY = clamp(pointerY / (rect.height / 2), -1, 1);

    physicsStateRef.current.relativeX = relativeX;
    physicsStateRef.current.relativeY = relativeY;
    
    const targetX = relativeX * resolvedPhysicsConfig.maxDisplacement;
    const targetY = relativeY * resolvedPhysicsConfig.maxDisplacement;

    springModelRef.current.setTarget(targetX, targetY);
    
    if (!animationFrameRef.current && animateCallback.current) {
        lastUpdateTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animateCallback.current);
     }

  }, [isDisabled, resolvedPhysicsConfig.maxDisplacement]); 

  const handlePointerLeave = useCallback(() => {
    if (!elementRef.current || !springModelRef.current) return;
    isInteractingRef.current = false;
    physicsStateRef.current.active = false;
    physicsStateRef.current.relativeX = 0; 
    physicsStateRef.current.relativeY = 0;
    springModelRef.current.setTarget(0, 0);
  }, []); 

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isDisabled) {
         if (animationFrameRef.current) {
             cancelAnimationFrame(animationFrameRef.current);
             animationFrameRef.current = null;
         }
         return;
    }

    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerleave', handlePointerLeave);

    // Check element type before calling helpers
    if (element instanceof HTMLElement) {
        markAsAnimating(element);
        if (currentOptions.gpuAccelerated) {
            addGpuAcceleration(element);
        }
    } else {
        // Handle SVG or other elements if necessary, perhaps just will-change
        element.style.willChange = 'transform';
    }

    return () => {
      if (element) {
         element.removeEventListener('pointerenter', handlePointerEnter);
         element.removeEventListener('pointermove', handlePointerMove);
         element.removeEventListener('pointerleave', handlePointerLeave);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [elementRef, isDisabled, handlePointerEnter, handlePointerMove, handlePointerLeave, currentOptions.gpuAccelerated]);

  const update = useCallback((newOptions: Partial<PhysicsInteractionOptions>) => {
      setCurrentOptions(prev => ({...prev, ...newOptions}));
  }, []);

  const reset = useCallback(() => {
      isInteractingRef.current = false;
      springModelRef.current?.reset();
      springModelRef.current?.setTarget(0,0);
      physicsStateRef.current = {
         x: 0, y: 0, z: 0, 
         relativeX: 0, relativeY: 0,
         rotation: 0, scale: 1, active: false,
         velocity: { x: 0, y: 0, z: 0 },
         acceleration: { x: 0, y: 0, z: 0 }, 
         angularVelocity: 0, distance: 0, isColliding: false, energy: 0,
      };
       setTransformValues({ x: 0, y: 0, scale: 1, rotation: 0 });
      if (!animationFrameRef.current && !isDisabled && animateCallback.current) { 
         lastUpdateTimeRef.current = performance.now();
         animationFrameRef.current = requestAnimationFrame(animateCallback.current);
      }
  }, [isDisabled]); 
  
  const combinedStyle: CSSProperties = useMemo(() => {
      const baseStyle: CSSProperties = { ...ambientStyle }; 

      const interactionTransform = `translate3d(${transformValues.x.toFixed(1)}px, ${transformValues.y.toFixed(1)}px, 0px) rotate(${transformValues.rotation.toFixed(1)}deg) scale(${transformValues.scale.toFixed(2)})`;

       if (ambientStyle.transform) {
            baseStyle.transform = `${interactionTransform} ${ambientStyle.transform}`; 
       } else {
            baseStyle.transform = interactionTransform;
       }

       if (!isDisabled) {
           baseStyle.willChange = 'transform'; 
       }

       return baseStyle;

  }, [transformValues, ambientStyle, isDisabled]);

  const applyForce = useCallback((force: PhysicsVector) => { 
      console.warn("applyForce not fully implemented - applies force to internal spring model only");
   }, []);
  const applyImpulse = useCallback((impulse: PhysicsVector) => { 
      console.warn("applyImpulse not fully implemented - applies impulse to internal spring model only"); 
  }, []);
  const setPosition = useCallback((position: PhysicsVector) => { 
      springModelRef.current?.setPosition(position.x, position.y, position.z);
      springModelRef.current?.setTarget(position.x, position.y, position.z); 
       physicsStateRef.current = { ...physicsStateRef.current, x: position.x, y: position.y, z: position.z ?? 0 };
       setTransformValues(prev => ({ ...prev, x: position.x, y: position.y }));
      if (!animationFrameRef.current && !isDisabled && animateCallback.current) {
          lastUpdateTimeRef.current = performance.now();
          animationFrameRef.current = requestAnimationFrame(animateCallback.current);
       }
  }, [isDisabled]); 
  const togglePause = useCallback(() => { console.warn("togglePause not implemented"); }, []);

  return {
    ref: elementRef,
    style: combinedStyle,
    state: physicsStateRef.current, 
    update,
    reset,
    applyForce,
    applyImpulse,
    setPosition,
    isPaused: false,
    togglePause,
  };
};

export default usePhysicsInteraction;
