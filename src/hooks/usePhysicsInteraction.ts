/**
 * Advanced Physics Interaction Hook
 *
 * React hook for applying realistic physics-based interactions to elements
 * with enhanced capabilities and performance optimizations.
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { applyGpuAcceleration, backfaceVisibility } from '../core/cssHelpers';
import { AnyHTMLElement, FlexibleElementRef } from '../utils/elementTypes';
import { getCurrentTime } from '../utils/time';

import { useGlassPerformance } from './useGlassPerformance';
import { useReducedMotion } from './useReducedMotion';
import { AnimationProps } from '../animations/types';
import { SpringConfig, SpringPresets } from '../animations/physics/springPhysics';
import { useAnimationContext } from '../contexts/AnimationContext';
import { MotionSensitivityLevel } from '../animations/accessibility/MotionSensitivity';

// Import from local utils
const markAsAnimating = (element: AnyHTMLElement | null): void => {
  if (!element) return;
  element.style.willChange = 'transform, opacity';
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
  | 'magnetic' // Magnetic-like attraction
  | 'gravity' // Gravitational pull
  | 'particle' // Particle-like jittering
  | 'attract' // Attraction force
  | 'repel' // Repulsion force
  | 'follow' // Smooth following
  | 'orbit' // Orbital movement
  | 'elastic' // Elastic snap-back
  | 'fluid' // Fluid-like movement
  | 'bounce' // Bouncy interaction
  | 'magnet-grid' // Snap to grid with magnetic behavior
  | 'inertia' // Movement with inertia
  | 'vortex'; // Spiral/vortex movement

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
   * If true, applies effect to rotation as well
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
   * If true, will only activate when hovering over the element
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
   * Whether to enable 3D physics effects
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
}

/**
 * Physics state values with enhanced properties
 */
export interface PhysicsState {
  /**
   * Current x position offset
   */
  x: number;

  /**
   * Current y position offset
   */
  y: number;

  /**
   * Current z position offset (for 3D physics)
   */
  z: number;

  /**
   * Current rotation in degrees
   */
  rotation: number;

  /**
   * Current scale factor
   */
  scale: number;

  /**
   * Boolean indicating if the element is currently active
   */
  active: boolean;

  /**
   * Current velocity vector
   */
  velocity: PhysicsVector;

  /**
   * Current acceleration vector
   */
  acceleration: PhysicsVector;

  /**
   * Angular velocity (degrees per second)
   */
  angularVelocity: number;

  /**
   * Distance from attractor
   */
  distance: number;

  /**
   * Whether the object is currently colliding
   */
  isColliding: boolean;

  /**
   * Energy of the physics system
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

  constructor(mass: number, stiffness: number, dampingRatio: number) {
    this.mass = mass;
    this.stiffness = stiffness;
    // Calculate critical damping
    this.damping = dampingRatio * 2 * Math.sqrt(mass * stiffness);
  }

  public setTarget(x: number, y: number, z = 0): void {
    this.target = { x, y, z };
  }

  public update(dt: number): PhysicsVector {
    // For each axis
    ['x', 'y', 'z'].forEach(axis => {
      // Calculate spring force: F = -k(x - x0)
      const displacement = this.position[axis] - this.target[axis];
      const springForce = -this.stiffness * displacement;

      // Calculate damping force: F = -cv
      const dampingForce = -this.damping * this.velocity[axis];

      // Calculate acceleration: F = ma, so a = F/m
      const acceleration = (springForce + dampingForce) / this.mass;

      // Update velocity: v = v0 + a*dt
      this.velocity[axis] += acceleration * dt;

      // Update position: x = x0 + v*dt
      this.position[axis] += this.velocity[axis] * dt;
    });

    return this.position;
  }

  public getPosition(): PhysicsVector {
    return this.position;
  }

  public getVelocity(): PhysicsVector {
    return this.velocity;
  }

  public setPosition(x: number, y: number, z = 0): void {
    this.position = { x, y, z };
  }

  public setVelocity(x: number, y: number, z = 0): void {
    this.velocity = { x, y, z };
  }

  public getEnergy(): number {
    // Kinetic energy: 1/2 * m * v^2
    const kineticEnergy =
      0.5 * this.mass * (this.velocity.x ** 2 + this.velocity.y ** 2 + (this.velocity.z || 0) ** 2);

    // Potential energy: 1/2 * k * x^2
    const potentialEnergy =
      0.5 *
      this.stiffness *
      ((this.position.x - this.target.x) ** 2 +
        (this.position.y - this.target.y) ** 2 +
        ((this.position.z || 0) - (this.target.z || 0)) ** 2);

    return kineticEnergy + potentialEnergy;
  }

  public isAtRest(): boolean {
    return (
      Math.abs(this.position.x - this.target.x) < 0.01 &&
      Math.abs(this.position.y - this.target.y) < 0.01 &&
      Math.abs(this.position.z - this.target.z) < 0.01 &&
      Math.abs(this.velocity.x) < 0.01 &&
      Math.abs(this.velocity.y) < 0.01 &&
      (this.velocity.z === undefined || Math.abs(this.velocity.z) < 0.01)
    );
  }

  public reset(): void {
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
  }
}

/**
 * Calculate distance between two points in 2D or 3D space
 */
const calculateDistance = (p1: PhysicsVector, p2: PhysicsVector): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = (p2.z || 0) - (p1.z || 0);

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Calculate angle between two points in 2D space
 */
const calculateAngle = (p1: PhysicsVector, p2: PhysicsVector): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

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
): { stiffness: number; dampingRatio: number; mass: number; affectsScale: boolean; scaleAmplitude: number; affectsRotation: boolean; rotationAmplitude: number; motionSensitivityLevel: MotionSensitivityLevel; /* other resolved options */ } => {

  // Base defaults for the hook's physics behavior
  const basePhysicsDefaults = {
    stiffness: SpringPresets.DEFAULT.tension, // Use tension as stiffness default
    dampingRatio: 0.6, // Default damping ratio if friction isn't calculable
    mass: SpringPresets.DEFAULT.mass ?? 1,
    affectsScale: true,
    scaleAmplitude: 0.05, // Default scale effect
    affectsRotation: false,
    rotationAmplitude: 10, // Default rotation effect
    motionSensitivityLevel: MotionSensitivityLevel.MEDIUM, // Default sensitivity
    // Add other physics option defaults here
  };
  
  let finalSpringConfig: SpringConfig = { ...SpringPresets.DEFAULT }; // Start with base preset

  // 1. Resolve Context Config
  let contextConfig: Partial<SpringConfig> = {};
  if (typeof contextDefaultSpring === 'string' && contextDefaultSpring in SpringPresets) {
    contextConfig = SpringPresets[contextDefaultSpring as keyof typeof SpringPresets];
  } else if (typeof contextDefaultSpring === 'object' && contextDefaultSpring !== null) {
    contextConfig = contextDefaultSpring;
  }
  finalSpringConfig = { ...finalSpringConfig, ...contextConfig }; // Merge context

  // 2. Resolve Prop Animation Config (SpringPreset name or SpringConfig object)
  const propAnimCfg = options.animationConfig;
  let propSpringConfig: Partial<SpringConfig> = {};
  if (typeof propAnimCfg === 'string' && propAnimCfg in SpringPresets) {
    propSpringConfig = SpringPresets[propAnimCfg as keyof typeof SpringPresets];
  } else if (typeof propAnimCfg === 'object' && ('tension' in propAnimCfg || 'friction' in propAnimCfg)) {
    propSpringConfig = propAnimCfg as Partial<SpringConfig>;
  }
  finalSpringConfig = { ...finalSpringConfig, ...propSpringConfig }; // Merge prop spring config

  // 3. Map final SpringConfig to physics parameters
  const mappedStiffness = finalSpringConfig.tension;
  const mappedMass = finalSpringConfig.mass ?? basePhysicsDefaults.mass;
  let mappedDampingRatio = basePhysicsDefaults.dampingRatio; // Default
  if (finalSpringConfig.friction && mappedStiffness > 0) {
      mappedDampingRatio = finalSpringConfig.friction / (2 * Math.sqrt(mappedStiffness * mappedMass));
  }

  // 4. Apply Motion Sensitivity
  const sensitivityLevel = options.motionSensitivityLevel ?? basePhysicsDefaults.motionSensitivityLevel;
  let sensitivityMultiplier = 1.0;
  switch (sensitivityLevel) {
      case MotionSensitivityLevel.LOW:
          sensitivityMultiplier = 0.5;
          break;
      case MotionSensitivityLevel.HIGH:
          sensitivityMultiplier = 1.5;
          break;
      case MotionSensitivityLevel.MEDIUM:
      default:
          sensitivityMultiplier = 1.0;
          break;
  }

  // Prioritize Direct Physics Options and apply sensitivity
  const stiffness = options.stiffness ?? mappedStiffness;
  const dampingRatio = options.dampingRatio ?? mappedDampingRatio;
  const mass = options.mass ?? mappedMass;
  const affectsScale = options.affectsScale ?? basePhysicsDefaults.affectsScale;
  const scaleAmplitude = (options.scaleAmplitude ?? basePhysicsDefaults.scaleAmplitude) * sensitivityMultiplier;
  const affectsRotation = options.affectsRotation ?? basePhysicsDefaults.affectsRotation;
  const rotationAmplitude = (options.rotationAmplitude ?? basePhysicsDefaults.rotationAmplitude) * sensitivityMultiplier;

  // Return resolved physics parameters
  return {
    stiffness,
    dampingRatio,
    mass,
    affectsScale,
    scaleAmplitude,
    affectsRotation,
    rotationAmplitude,
    motionSensitivityLevel: sensitivityLevel,
    // Include other resolved options from basePhysicsDefaults or options
  };
};

/**
 * React Hook for Physics-Based UI Interactions
 */
export const usePhysicsInteraction = <T extends HTMLElement = HTMLElement>(
  options: PhysicsInteractionOptions = {}
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties;
  state: PhysicsState;
  eventHandlers: Record<string, (e: any) => void>;
  update: (newOptions: Partial<PhysicsInteractionOptions>) => void;
  reset: () => void;
  applyForce: (force: PhysicsVector) => void;
  applyImpulse: (impulse: PhysicsVector) => void;
  setPosition: (position: PhysicsVector) => void;
  isPaused: boolean;
  togglePause: () => void;
} => {
  const elementRef = useRef<T>(null);
  const physicsStateRef = useRef<PhysicsState>({
    x: 0, y: 0, z: 0,
    rotation: 0, scale: 1, active: false,
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    angularVelocity: 0, distance: 0,
    isColliding: false, energy: 0,
  });
  const [style, setStyle] = useState<React.CSSProperties>({});
  const animationFrameRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const isPressedRef = useRef(false);
  const springModelRef = useRef<SpringModel | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const systemPrefersReducedMotion = useReducedMotion();
  const { defaultSpring } = useAnimationContext();
  const resolvedPhysicsConfig = useMemo(() => {
      return resolvePhysicsConfig(options, defaultSpring);
  }, [options, defaultSpring]);
  const isDisabled = options.reducedMotion ?? systemPrefersReducedMotion;

  useEffect(() => {
    springModelRef.current = new SpringModel(
      resolvedPhysicsConfig.mass,
      resolvedPhysicsConfig.stiffness,
      resolvedPhysicsConfig.dampingRatio
    );
  }, [resolvedPhysicsConfig]);

  const animate = useCallback(() => {
    if (!elementRef.current || !springModelRef.current || isDisabled) {
        animationFrameRef.current = null;
        return;
      }

    const currentTime = getCurrentTime();
    const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = currentTime;

    const { x, y, z } = springModelRef.current.update(deltaTime);

    physicsStateRef.current = {
      ...physicsStateRef.current,
      x,
      y,
      z: z ?? 0,
      active: isInteractingRef.current,
    };

    let transform = `translate3d(${x}px, ${y}px, ${z ?? 0}px)`;
    if (resolvedPhysicsConfig.affectsScale) {
        const scaleFactor = 1 + (isInteractingRef.current ? resolvedPhysicsConfig.scaleAmplitude : 0);
        transform += ` scale(${scaleFactor})`;
    }
    if (resolvedPhysicsConfig.affectsRotation) {
        const rotationFactor = isInteractingRef.current ? resolvedPhysicsConfig.rotationAmplitude : 0;
        transform += ` rotate(${rotationFactor * (x / 10)}deg)`;
    }

    const newStyle: React.CSSProperties = {
      transform: transform,
    };
    if (options.gpuAccelerated) {
       newStyle.willChange = 'transform, opacity';
       newStyle.backfaceVisibility = 'hidden';
       (newStyle as any).webkitBackfaceVisibility = 'hidden';
       if (options.enable3D) {
           newStyle.transformStyle = 'preserve-3d';
       }
    }
    setStyle(newStyle);

    if (!springModelRef.current.isAtRest() || isInteractingRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }

  }, [isDisabled, resolvedPhysicsConfig, options.gpuAccelerated, options.enable3D]);

  const startAnimation = useCallback(() => {
    if (isDisabled || animationFrameRef.current) return;
    lastUpdateTimeRef.current = getCurrentTime();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isDisabled, animate]);

  const handleInteractionStart = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    if (isDisabled || !springModelRef.current) return;
    isInteractingRef.current = true;
    springModelRef.current.setTarget(5, 5);
    startAnimation();
  }, [isDisabled, startAnimation]);

  const handleInteractionEnd = useCallback(() => {
    if (isDisabled || !springModelRef.current || !isInteractingRef.current) return;
    isInteractingRef.current = false;
    springModelRef.current.setTarget(0, 0);
    startAnimation();
  }, [isDisabled, startAnimation]);

  const handleMouseEnter = useCallback((e: MouseEvent) => {
      isHoveringRef.current = true;
      if (!options.activeOnHoverOnly || !isPressedRef.current) {
         handleInteractionStart();
      }
  }, [options.activeOnHoverOnly, handleInteractionStart]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
      isHoveringRef.current = false;
      if (!options.activeOnHoverOnly || !isPressedRef.current) {
          handleInteractionEnd();
      }
  }, [options.activeOnHoverOnly, handleInteractionEnd]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
      isPressedRef.current = true;
      if (options.activeOnHoverOnly) { // Start interaction on press if hover-only
          handleInteractionStart();
      }
      // Add focus logic if needed
      elementRef.current?.focus();
  }, [options.activeOnHoverOnly, handleInteractionStart]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
      isPressedRef.current = false;
      if (options.activeOnHoverOnly && !isHoveringRef.current) {
         handleInteractionEnd(); // End interaction if hover-only and mouse is outside
      }
       // If not hover-only, interaction ends on mouse leave anyway
  }, [options.activeOnHoverOnly, handleInteractionEnd]);

  // Attach/Detach Event Listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || isDisabled) return;

    // Add listeners
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    // Add touch equivalents if needed

    return () => {
      // Remove listeners
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      // Remove touch listeners
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [elementRef, isDisabled, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp]);

  // --- Public API Methods (Placeholder implementations) ---
  const update = useCallback((newOptions: Partial<PhysicsInteractionOptions>) => {
      // Logic to update the internal options and potentially the spring model
      console.warn('usePhysicsInteraction update() not fully implemented');
  }, []);

  const reset = useCallback(() => {
      springModelRef.current?.reset();
      setStyle({});
      isInteractingRef.current = false;
       if (animationFrameRef.current) {
           cancelAnimationFrame(animationFrameRef.current);
           animationFrameRef.current = null;
       }
  }, []);

  const applyForce = useCallback((force: PhysicsVector) => {
     // Logic to apply external force to the model
     console.warn('usePhysicsInteraction applyForce() not fully implemented');
  }, []);

  const applyImpulse = useCallback((impulse: PhysicsVector) => {
      // Logic to apply impulse (sudden velocity change)
      console.warn('usePhysicsInteraction applyImpulse() not fully implemented');
  }, []);

  const setPosition = useCallback((position: PhysicsVector) => {
      springModelRef.current?.setPosition(position.x, position.y, position.z);
      // Update style directly? Or let animation loop handle it?
      startAnimation(); // Trigger animation loop to reflect change
  }, [startAnimation]);

  const isPaused = !animationFrameRef.current && !isInteractingRef.current;
  const togglePause = useCallback(() => {
     if (isPaused) {
         startAnimation();
     } else if (animationFrameRef.current) {
         cancelAnimationFrame(animationFrameRef.current);
         animationFrameRef.current = null;
     }
  }, [isPaused, startAnimation]);

  // --- Event Handlers to Return --- 
  const eventHandlers = useMemo(() => ({
      onMouseEnter: handleInteractionStart,
      onMouseLeave: handleInteractionEnd,
      onMouseDown: handleInteractionStart, // Can enhance later for press state
      onMouseUp: handleInteractionEnd,
      onTouchStart: handleInteractionStart,
      onTouchEnd: handleInteractionEnd,
      // Add focus/blur if needed
      // onFocus: handleInteractionStart,
      // onBlur: handleInteractionEnd,
  }), [handleInteractionStart, handleInteractionEnd]);

  // Return hook state and methods
  return {
    ref: elementRef,
    style,
    state: physicsStateRef.current,
    eventHandlers,
    update,
    reset,
    applyForce,
    applyImpulse,
    setPosition,
    isPaused,
    togglePause,
  };
};

export default usePhysicsInteraction;
