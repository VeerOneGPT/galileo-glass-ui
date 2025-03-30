/**
 * useGamePhysics.ts
 * 
 * A specialized physics hook for game-like interactions in Galileo Glass UI.
 * Provides optimized physics behaviors for interactive game elements, including
 * projectile motion, bouncing, collisions, and dynamic forces.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';
import GalileoPhysicsSystem, {
  PhysicsObject,
  PhysicsObjectConfig,
  PhysicsConfig,
  Vector,
  VectorUtils,
  PhysicsEventType
} from './galileoPhysicsSystem';
import { 
  PhysicsAnimationMode, 
  PhysicsQuality 
} from './types';

/**
 * Types of game physics behaviors
 */
export enum GamePhysicsBehavior {
  /** Standard projectile motion with gravity */
  PROJECTILE = 'projectile',
  
  /** Object that bounces off surfaces */
  BOUNCING = 'bouncing',
  
  /** Object that follows a path */
  PATH_FOLLOWING = 'path-following',
  
  /** Object affected by player input */
  CONTROLLED = 'controlled',
  
  /** Object affected by forces like wind, explosions, etc. */
  FORCE_AFFECTED = 'force-affected',
  
  /** Object with inertia and momentum */
  INERTIAL = 'inertial',
  
  /** Floating/hovering object */
  FLOATING = 'floating',
  
  /** Object following orbital path */
  ORBITAL = 'orbital',
  
  /** Object with custom physics behavior */
  CUSTOM = 'custom'
}

/**
 * Game gravity presets
 */
export enum GameGravityPreset {
  /** No gravity */
  NONE = 'none',
  
  /** Earth-like downward gravity */
  EARTH = 'earth',
  
  /** Moon-like (low) gravity */
  MOON = 'moon',
  
  /** Strong gravity */
  HEAVY = 'heavy',
  
  /** Micro-gravity */
  MICRO = 'micro',
  
  /** Sideways (horizontal) gravity */
  SIDEWAYS = 'sideways'
}

/**
 * Game physics environment
 */
export interface GamePhysicsEnvironment {
  /** Gravity setting */
  gravity: Vector | GameGravityPreset;
  
  /** Global wind force */
  wind?: Vector;
  
  /** Global fluid resistance (air/water) */
  fluidResistance?: number;
  
  /** Physics simulation quality level */
  quality?: PhysicsQuality;
  
  /** Whether object sleeping is enabled */
  enableSleeping?: boolean;
  
  /** Physics boundaries */
  boundaries?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  
  /** Whether to bounce off boundaries */
  bounceOffBoundaries?: boolean;
  
  /** Restitution (bounciness) for boundary collisions */
  boundaryRestitution?: number;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
}

/**
 * Configuration for a game physics object
 */
export interface GamePhysicsObjectConfig extends PhysicsObjectConfig {
  /** Type of physics behavior */
  behavior?: GamePhysicsBehavior;
  
  /** Initial position */
  position?: Vector;
  
  /** Initial velocity */
  velocity?: Vector;
  
  /** Mass of the object */
  mass?: number;
  
  /** Whether object is affected by gravity */
  affectedByGravity?: boolean;
  
  /** Whether object collides with other objects */
  collidable?: boolean;
  
  /** Whether object bounces off boundaries */
  bounceOffBoundaries?: boolean;
  
  /** Restitution (bounciness) */
  restitution?: number;
  
  /** Friction coefficient */
  friction?: number;
  
  /** Drag coefficient */
  drag?: number;
  
  /** Custom forces function */
  customForces?: (obj: PhysicsObject, dt: number) => Vector;
  
  /** Whether object responds to player input */
  playerControlled?: boolean;
  
  /** For controlled objects, input mapping function */
  inputMapping?: (input: any) => Vector;
  
  /** Pathing configuration */
  path?: {
    points: Vector[];
    loop: boolean;
    speed: number;
  };
  
  /** Orbital configuration */
  orbit?: {
    center: Vector;
    radius: number;
    speed: number;
    phase?: number;
  };
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Object rendering element or selector */
  element?: HTMLElement | string;
}

/**
 * Game physics hook configuration
 */
export interface GamePhysicsConfig {
  /** Environment settings */
  environment?: GamePhysicsEnvironment;
  
  /** Initial physics objects */
  objects?: GamePhysicsObjectConfig[];
  
  /** Auto-start physics simulation */
  autoStart?: boolean;
  
  /** Whether to use requestAnimationFrame for updates */
  useRAF?: boolean;
  
  /** Fixed timestep for physics simulation (in ms) */
  timestep?: number;
  
  /** Maximum simulation steps per frame */
  maxStepsPerFrame?: number;
  
  /** Animation mode/style */
  animationMode?: PhysicsAnimationMode;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Callback when simulation starts */
  onStart?: () => void;
  
  /** Callback when simulation stops */
  onStop?: () => void;
  
  /** Callback for each simulation step */
  onStep?: (dt: number) => void;
  
  /** Callback for collisions */
  onCollision?: (objA: PhysicsObject, objB: PhysicsObject, contactPoint: Vector) => void;
}

/**
 * Result object returned from useGamePhysics hook
 */
export interface GamePhysicsResult {
  /** Get a physics object by ID */
  getObject: (id: string) => PhysicsObject | undefined;
  
  /** Add a new physics object */
  addObject: (config: GamePhysicsObjectConfig) => string;
  
  /** Remove a physics object */
  removeObject: (id: string) => boolean;
  
  /** Update a physics object */
  updateObject: (id: string, updates: Partial<GamePhysicsObjectConfig>) => boolean;
  
  /** Apply a force to an object */
  applyForce: (id: string, force: Partial<Vector>) => boolean;
  
  /** Apply an impulse to an object */
  applyImpulse: (id: string, impulse: Partial<Vector>) => boolean;
  
  /** Set an object's position directly */
  setPosition: (id: string, position: Partial<Vector>) => boolean;
  
  /** Set an object's velocity directly */
  setVelocity: (id: string, velocity: Partial<Vector>) => boolean;
  
  /** Get all physics objects */
  getAllObjects: () => PhysicsObject[];
  
  /** Predefined force generators */
  forces: {
    /** Create gravity force */
    gravity: (mass: number, g?: Vector) => Vector;
    
    /** Create wind force */
    wind: (strength: number, direction?: Vector) => Vector;
    
    /** Create drag force */
    drag: (velocity: Vector, coefficient: number) => Vector;
    
    /** Create attraction force to a point */
    attraction: (position: Vector, target: Vector, strength: number) => Vector;
    
    /** Create explosion force (radial from a point) */
    explosion: (position: Vector, center: Vector, strength: number, radius: number) => Vector;
    
    /** Create vortex force */
    vortex: (position: Vector, center: Vector, strength: number, radius: number) => Vector;
  };
  
  /** Start the physics simulation */
  start: () => void;
  
  /** Stop the physics simulation */
  stop: () => void;
  
  /** Pause the physics simulation */
  pause: () => void;
  
  /** Resume the physics simulation */
  resume: () => void;
  
  /** Reset the simulation */
  reset: () => void;
  
  /** Perform a single simulation step */
  step: (dt?: number) => void;
  
  /** Is simulation running */
  isRunning: boolean;
  
  /** Is simulation paused */
  isPaused: boolean;
  
  /** Is reduced motion active */
  reducedMotion: boolean;
  
  /** Get the current environment settings */
  getEnvironment: () => GamePhysicsEnvironment;
  
  /** Update the environment settings */
  updateEnvironment: (updates: Partial<GamePhysicsEnvironment>) => void;
  
  /** Add event listener */
  addEventListener: (type: PhysicsEventType, listener: (event: any) => void) => void;
  
  /** Remove event listener */
  removeEventListener: (type: PhysicsEventType, listener: (event: any) => void) => void;
  
  /** Create a projectile with specified parameters */
  createProjectile: (
    startPosition: Vector,
    angle: number,
    power: number,
    mass?: number,
    options?: Partial<GamePhysicsObjectConfig>
  ) => string;
  
  /** Create an orbital object around a point */
  createOrbital: (
    center: Vector,
    radius: number,
    speed: number,
    options?: Partial<GamePhysicsObjectConfig>
  ) => string;
  
  /** Create a path-following object */
  createPathFollower: (
    path: Vector[],
    speed: number,
    loop?: boolean,
    options?: Partial<GamePhysicsObjectConfig>
  ) => string;
  
  /** Update DOM elements with physics state */
  updateDOMElements: () => void;
}

/**
 * Convert gravity preset to vector
 */
function gravityPresetToVector(preset: GameGravityPreset): Vector {
  switch (preset) {
    case GameGravityPreset.NONE:
      return { x: 0, y: 0, z: 0 };
    case GameGravityPreset.EARTH:
      return { x: 0, y: 9.8, z: 0 };
    case GameGravityPreset.MOON:
      return { x: 0, y: 1.6, z: 0 };
    case GameGravityPreset.HEAVY:
      return { x: 0, y: 20, z: 0 };
    case GameGravityPreset.MICRO:
      return { x: 0, y: 0.5, z: 0 };
    case GameGravityPreset.SIDEWAYS:
      return { x: 9.8, y: 0, z: 0 };
    default:
      return { x: 0, y: 9.8, z: 0 };
  }
}

/**
 * Hook for specialized game physics in Galileo Glass UI applications
 * 
 * @param config Game physics configuration
 * @returns Game physics controller
 */
export function useGamePhysics(config: GamePhysicsConfig = {}): GamePhysicsResult {
  // Extract config values with defaults
  const {
    environment,
    objects = [],
    autoStart = true,
    useRAF = true,
    timestep = 1000 / 60, // 60 fps by default
    maxStepsPerFrame = 5,
    animationMode = PhysicsAnimationMode.NATURAL,
    category = AnimationCategory.BACKGROUND,
    onStart,
    onStop,
    onStep,
    onCollision
  } = config;
  
  // Reduced motion support
  const { prefersReducedMotion, isAnimationAllowed } = useReducedMotion();
  
  // Physics system reference
  const physicsSystemRef = useRef<GalileoPhysicsSystem | null>(null);
  
  // Animation frame reference
  const rafIdRef = useRef<number | null>(null);
  
  // Time tracking
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);
  
  // Simulation state
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  
  // Element references
  const elementRefsRef = useRef<Map<string, HTMLElement>>(new Map());
  
  // Setup physics system
  useEffect(() => {
    // Create the physics system
    const gravityVector = environment?.gravity 
      ? typeof environment.gravity === 'string'
        ? gravityPresetToVector(environment.gravity as GameGravityPreset)
        : environment.gravity as Vector
      : { x: 0, y: 9.8, z: 0 };
      
    const physicsConfig: PhysicsConfig = {
      gravity: gravityVector,
      defaultDamping: 0.01,
      timeScale: 1,
      fixedTimeStep: timestep / 1000, // Convert to seconds
      maxSubSteps: maxStepsPerFrame,
      enableSleeping: environment?.enableSleeping ?? true,
      integrationMethod: 'verlet', // Best for game physics
      boundsCheckEnabled: !!environment?.boundaries,
      velocitySleepThreshold: 0.05,
      angularSleepThreshold: 0.05,
      sleepTimeThreshold: 0.5
    };
    
    // Add boundaries if specified
    if (environment?.boundaries) {
      physicsConfig.bounds = {
        min: { 
          x: environment.boundaries.left ?? -Infinity, 
          y: environment.boundaries.top ?? -Infinity,
          z: -Infinity 
        },
        max: { 
          x: environment.boundaries.right ?? Infinity, 
          y: environment.boundaries.bottom ?? Infinity,
          z: Infinity 
        }
      };
    }
    
    // Create physics system
    physicsSystemRef.current = new GalileoPhysicsSystem(physicsConfig);
    
    // Add initial objects
    objects.forEach(objConfig => {
      addObjectToSystem(objConfig);
    });
    
    // Add collision handler
    if (onCollision) {
      physicsSystemRef.current.addEventListener('collision', (event: any) => {
        if (event.objectA && event.objectB && event.contactPoint) {
          onCollision(event.objectA, event.objectB, event.contactPoint);
        }
      });
    }
    
    // Start simulation if needed
    if (autoStart) {
      if (useRAF) {
        startRAFLoop();
      } else {
        physicsSystemRef.current.start();
      }
      
      if (onStart) {
        onStart();
      }
    }
    
    // Cleanup function
    return () => {
      if (physicsSystemRef.current) {
        physicsSystemRef.current.stop();
      }
      
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []); // Empty dependency array means this only runs once on mount
  
  /**
   * Add object to physics system with enhanced game properties
   */
  const addObjectToSystem = useCallback((config: GamePhysicsObjectConfig): string => {
    if (!physicsSystemRef.current) {
      throw new Error('Physics system not initialized');
    }
    
    // Store element reference if provided
    if (config.element) {
      if (typeof config.element === 'string') {
        const el = document.querySelector(config.element) as HTMLElement;
        if (el) {
          if (config.id) {
            elementRefsRef.current.set(config.id, el);
          }
        }
      } else if (config.element instanceof HTMLElement) {
        if (config.id) {
          elementRefsRef.current.set(config.id, config.element);
        }
      }
    }
    
    // Setup physics object config
    const baseConfig: PhysicsObjectConfig = {
      ...config,
      // Default values for game physics
      restitution: config.restitution ?? 0.3,
      friction: config.friction ?? 0.1,
      gravityScale: config.affectedByGravity === false ? 0 : 1
    };
    
    // Add behavior-specific properties
    if (config.behavior) {
      switch (config.behavior) {
        case GamePhysicsBehavior.FLOATING:
          // Floating objects have no gravity but jitter slightly
          baseConfig.gravityScale = 0;
          baseConfig.userData = {
            ...baseConfig.userData,
            behaviorType: 'floating',
            floatTimer: 0,
            floatAmplitude: 5,
            floatFrequency: 2
          };
          break;
          
        case GamePhysicsBehavior.BOUNCING:
          // Bouncing objects have high restitution
          baseConfig.restitution = config.restitution ?? 0.7;
          break;
          
        case GamePhysicsBehavior.ORBITAL:
          // Initialize orbital properties
          if (config.orbit) {
            baseConfig.userData = {
              ...baseConfig.userData,
              behaviorType: 'orbital',
              orbitCenter: config.orbit.center,
              orbitRadius: config.orbit.radius,
              orbitSpeed: config.orbit.speed,
              orbitPhase: config.orbit.phase ?? 0
            };
            
            // Initial position on orbital path
            const phase = config.orbit.phase ?? 0;
            baseConfig.position = {
              x: config.orbit.center.x + Math.cos(phase) * config.orbit.radius,
              y: config.orbit.center.y + Math.sin(phase) * config.orbit.radius,
              z: 0
            };
            
            // Initial velocity tangent to orbit
            const tangentAngle = phase + Math.PI / 2;
            const speedMagnitude = config.orbit.speed;
            baseConfig.velocity = {
              x: Math.cos(tangentAngle) * speedMagnitude,
              y: Math.sin(tangentAngle) * speedMagnitude,
              z: 0
            };
            
            // No gravity for orbital objects
            baseConfig.gravityScale = 0;
          }
          break;
          
        case GamePhysicsBehavior.PATH_FOLLOWING:
          // Initialize path following properties
          if (config.path) {
            baseConfig.userData = {
              ...baseConfig.userData,
              behaviorType: 'path-following',
              pathPoints: config.path.points,
              pathSpeed: config.path.speed,
              pathLoop: config.path.loop,
              currentPathIndex: 0,
              pathProgress: 0
            };
            
            // Start at first path point
            if (config.path.points.length > 0) {
              baseConfig.position = { ...config.path.points[0] };
            }
            
            // No gravity for path followers by default
            baseConfig.gravityScale = config.affectedByGravity === true ? 1 : 0;
          }
          break;
          
        case GamePhysicsBehavior.INERTIAL:
          // Low friction for inertial objects
          baseConfig.friction = config.friction ?? 0.05;
          baseConfig.damping = config.drag ?? 0.01;
          break;
          
        case GamePhysicsBehavior.CONTROLLED:
          // Player controlled objects
          baseConfig.userData = {
            ...baseConfig.userData,
            behaviorType: 'controlled',
            inputVector: { x: 0, y: 0, z: 0 },
            controlSpeed: 5
          };
          break;
      }
    }
    
    // Add to physics system
    return physicsSystemRef.current.addObject(baseConfig);
  }, []);
  
  /**
   * Start RAF animation loop
   */
  const startRAFLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    lastTimeRef.current = null;
    accumulatorRef.current = 0;
    
    const animate = (timestamp: number) => {
      if (!physicsSystemRef.current || isPaused) {
        return;
      }
      
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      
      // Calculate elapsed time in milliseconds
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Skip large time gaps (e.g., tab was inactive)
      if (elapsed > 200) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Add to accumulator
      accumulatorRef.current += elapsed;
      
      // Fixed timestep simulation
      const fixedTimestep = timestep;
      let stepsThisFrame = 0;
      
      while (accumulatorRef.current >= fixedTimestep && stepsThisFrame < maxStepsPerFrame) {
        // Process custom behaviors
        updateCustomBehaviors(fixedTimestep / 1000); // Convert to seconds
        
        // Run physics step
        physicsSystemRef.current.step();
        
        accumulatorRef.current -= fixedTimestep;
        stepsThisFrame++;
        
        // Call step callback
        if (onStep) {
          onStep(fixedTimestep / 1000);
        }
      }
      
      // Update DOM elements
      updateDOMElements();
      
      // Schedule next frame
      rafIdRef.current = requestAnimationFrame(animate);
    };
    
    rafIdRef.current = requestAnimationFrame(animate);
  }, [timestep, maxStepsPerFrame, isPaused, onStep]);
  
  /**
   * Update custom behaviors for objects
   */
  const updateCustomBehaviors = useCallback((dt: number) => {
    if (!physicsSystemRef.current) return;
    
    const objects = physicsSystemRef.current.getAllObjects();
    
    objects.forEach(obj => {
      if (!obj.userData || !obj.userData.behaviorType) return;
      
      switch (obj.userData.behaviorType) {
        case 'floating':
          // Apply subtle floating motion using sine waves
          obj.userData.floatTimer += dt;
          const floatOffset = Math.sin(obj.userData.floatTimer * obj.userData.floatFrequency) * obj.userData.floatAmplitude;
          
          // Apply a gentle force upward based on sine wave
          physicsSystemRef.current?.applyForce(obj.id, { 
            y: floatOffset - obj.velocity.y * 2 // Damping to prevent excessive oscillation
          });
          break;
          
        case 'orbital':
          // Enforce orbital motion around center
          const orbitData = obj.userData;
          const centerToObj = VectorUtils.subtract(obj.position, orbitData.orbitCenter);
          const currentRadius = VectorUtils.magnitude(centerToObj);
          const normalizedDir = VectorUtils.normalize(centerToObj);
          
          // Force to maintain radius
          const radiusForce = (orbitData.orbitRadius - currentRadius) * 5;
          const radialForce = VectorUtils.multiply(normalizedDir, radiusForce);
          
          // Centripetal force for circular motion
          const tangent = { x: -normalizedDir.y, y: normalizedDir.x, z: 0 };
          const centripetalForce = VectorUtils.multiply(tangent, orbitData.orbitSpeed * 0.1);
          
          const totalForce = VectorUtils.add(radialForce, centripetalForce);
          
          // Apply the combined force
          physicsSystemRef.current?.applyForce(obj.id, totalForce);
          break;
          
        case 'path-following':
          // Follow defined path
          const pathData = obj.userData;
          if (!pathData.pathPoints || pathData.pathPoints.length < 2) return;
          
          // Get current target point
          const currentIndex = pathData.currentPathIndex;
          const targetPoint = pathData.pathPoints[currentIndex];
          
          // Calculate direction to target
          const direction = VectorUtils.subtract(targetPoint, obj.position);
          const distance = VectorUtils.magnitude(direction);
          
          // If we've reached the target, move to next point
          if (distance < 5) {
            pathData.currentPathIndex++;
            
            // Loop back to start if needed
            if (pathData.currentPathIndex >= pathData.pathPoints.length) {
              if (pathData.pathLoop) {
                pathData.currentPathIndex = 0;
              } else {
                pathData.currentPathIndex = pathData.pathPoints.length - 1;
                return; // End of path
              }
            }
          }
          
          // Steer toward target
          const pathNormalizedDir = VectorUtils.normalize(direction);
          const desiredVelocity = VectorUtils.multiply(pathNormalizedDir, pathData.pathSpeed);
          const steeringForce = VectorUtils.subtract(desiredVelocity, obj.velocity);
          
          // Apply steering force
          physicsSystemRef.current?.applyForce(obj.id, steeringForce);
          break;
          
        case 'controlled':
          // Apply player input forces
          if (obj.userData.inputVector) {
            const controlForce = VectorUtils.multiply(
              obj.userData.inputVector,
              obj.userData.controlSpeed
            );
            
            physicsSystemRef.current?.applyForce(obj.id, controlForce);
          }
          break;
      }
      
      // Apply custom forces if defined
      if (obj.userData.customForces && typeof obj.userData.customForces === 'function') {
        const customForce = obj.userData.customForces(obj, dt);
        physicsSystemRef.current?.applyForce(obj.id, customForce);
      }
    });
  }, []);
  
  /**
   * Update DOM elements with physics state
   */
  const updateDOMElements = useCallback(() => {
    if (!physicsSystemRef.current) return;
    
    elementRefsRef.current.forEach((element, id) => {
      const obj = physicsSystemRef.current?.getObject(id);
      if (!obj) return;
      
      // Apply position to DOM element
      element.style.transform = `translate(${obj.position.x}px, ${obj.position.y}px)`;
      
      // If the object has rotation, apply it
      if (obj.userData && obj.userData.rotation !== undefined) {
        element.style.transform += ` rotate(${obj.userData.rotation}deg)`;
      }
    });
  }, []);
  
  /**
   * Start the physics simulation
   */
  const start = useCallback(() => {
    if (isPaused) {
      // Resume from pause
      setIsPaused(false);
      if (useRAF) {
        startRAFLoop();
      } else if (physicsSystemRef.current) {
        physicsSystemRef.current.start();
      }
    } else if (!isRunning) {
      // Start from stopped state
      setIsRunning(true);
      
      if (useRAF) {
        startRAFLoop();
      } else if (physicsSystemRef.current) {
        physicsSystemRef.current.start();
      }
      
      if (onStart) {
        onStart();
      }
    }
  }, [isRunning, isPaused, useRAF, startRAFLoop, onStart]);
  
  /**
   * Stop the physics simulation
   */
  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (physicsSystemRef.current) {
      physicsSystemRef.current.stop();
    }
    
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    if (onStop) {
      onStop();
    }
  }, [onStop]);
  
  /**
   * Pause the physics simulation
   */
  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      
      if (physicsSystemRef.current && !useRAF) {
        physicsSystemRef.current.stop();
      }
      
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }
  }, [isRunning, isPaused, useRAF]);
  
  /**
   * Resume the physics simulation
   */
  const resume = useCallback(() => {
    if (isRunning && isPaused) {
      setIsPaused(false);
      
      if (useRAF) {
        startRAFLoop();
      } else if (physicsSystemRef.current) {
        physicsSystemRef.current.start();
      }
    }
  }, [isRunning, isPaused, useRAF, startRAFLoop]);
  
  /**
   * Reset the simulation
   */
  const reset = useCallback(() => {
    if (physicsSystemRef.current) {
      physicsSystemRef.current.reset();
      
      // Re-add initial objects
      objects.forEach(objConfig => {
        addObjectToSystem(objConfig);
      });
    }
  }, [objects, addObjectToSystem]);
  
  /**
   * Perform a single simulation step
   */
  const step = useCallback((dt?: number) => {
    if (physicsSystemRef.current) {
      // Update custom behaviors
      updateCustomBehaviors((dt || timestep) / 1000);
      
      // Run physics step
      physicsSystemRef.current.step();
      
      // Update DOM elements
      updateDOMElements();
      
      // Call step callback
      if (onStep) {
        onStep((dt || timestep) / 1000);
      }
    }
  }, [timestep, updateCustomBehaviors, updateDOMElements, onStep]);
  
  /**
   * Get a physics object by ID
   */
  const getObject = useCallback((id: string): PhysicsObject | undefined => {
    return physicsSystemRef.current?.getObject(id);
  }, []);
  
  /**
   * Add a new physics object
   */
  const addObject = useCallback((config: GamePhysicsObjectConfig): string => {
    return addObjectToSystem(config);
  }, [addObjectToSystem]);
  
  /**
   * Remove a physics object
   */
  const removeObject = useCallback((id: string): boolean => {
    // Remove element reference
    elementRefsRef.current.delete(id);
    
    // Remove from physics system
    return physicsSystemRef.current?.removeObject(id) || false;
  }, []);
  
  /**
   * Update a physics object
   */
  const updateObject = useCallback((id: string, updates: Partial<GamePhysicsObjectConfig>): boolean => {
    // Update element reference if changed
    if (updates.element) {
      if (typeof updates.element === 'string') {
        const el = document.querySelector(updates.element) as HTMLElement;
        if (el) {
          elementRefsRef.current.set(id, el);
        }
      } else if (updates.element instanceof HTMLElement) {
        elementRefsRef.current.set(id, updates.element);
      }
    }
    
    // Create physics update object
    const physicsUpdates: PhysicsObjectConfig = {
      ...updates,
      gravityScale: updates.affectedByGravity === false ? 0 : 
                   updates.affectedByGravity === true ? 1 : undefined
    };
    
    // Update in physics system
    return physicsSystemRef.current?.updateObject(id, physicsUpdates) || false;
  }, []);
  
  /**
   * Apply a force to an object
   */
  const applyForce = useCallback((id: string, force: Partial<Vector>): boolean => {
    return physicsSystemRef.current?.applyForce(id, force) || false;
  }, []);
  
  /**
   * Apply an impulse to an object
   */
  const applyImpulse = useCallback((id: string, impulse: Partial<Vector>): boolean => {
    return physicsSystemRef.current?.applyImpulse(id, impulse) || false;
  }, []);
  
  /**
   * Set object position
   */
  const setPosition = useCallback((id: string, position: Partial<Vector>): boolean => {
    return physicsSystemRef.current?.updateObject(id, { position }) || false;
  }, []);
  
  /**
   * Set object velocity
   */
  const setVelocity = useCallback((id: string, velocity: Partial<Vector>): boolean => {
    return physicsSystemRef.current?.updateObject(id, { velocity }) || false;
  }, []);
  
  /**
   * Get all physics objects
   */
  const getAllObjects = useCallback((): PhysicsObject[] => {
    return physicsSystemRef.current?.getAllObjects() || [];
  }, []);
  
  /**
   * Get current environment settings
   */
  const getEnvironment = useCallback((): GamePhysicsEnvironment => {
    if (!physicsSystemRef.current) {
      return environment || { gravity: { x: 0, y: 9.8, z: 0 } };
    }
    
    const config = physicsSystemRef.current.getConfig();
    
    return {
      gravity: config.gravity,
      enableSleeping: config.enableSleeping,
      boundaries: config.bounds ? {
        left: config.bounds.min.x === -Infinity ? undefined : config.bounds.min.x,
        top: config.bounds.min.y === -Infinity ? undefined : config.bounds.min.y,
        right: config.bounds.max.x === Infinity ? undefined : config.bounds.max.x,
        bottom: config.bounds.max.y === Infinity ? undefined : config.bounds.max.y
      } : undefined,
      bounceOffBoundaries: false, // Can't easily determine from config
      category: environment?.category
    };
  }, [environment]);
  
  /**
   * Update environment settings
   */
  const updateEnvironment = useCallback((updates: Partial<GamePhysicsEnvironment>) => {
    if (!physicsSystemRef.current) return;
    
    const configUpdates: Partial<PhysicsConfig> = {};
    
    if (updates.gravity) {
      configUpdates.gravity = typeof updates.gravity === 'string'
        ? gravityPresetToVector(updates.gravity as GameGravityPreset)
        : updates.gravity as Vector;
    }
    
    if (updates.enableSleeping !== undefined) {
      configUpdates.enableSleeping = updates.enableSleeping;
    }
    
    if (updates.boundaries) {
      configUpdates.boundsCheckEnabled = true;
      configUpdates.bounds = {
        min: { 
          x: updates.boundaries.left ?? -Infinity, 
          y: updates.boundaries.top ?? -Infinity,
          z: -Infinity 
        },
        max: { 
          x: updates.boundaries.right ?? Infinity, 
          y: updates.boundaries.bottom ?? Infinity,
          z: Infinity 
        }
      };
    }
    
    physicsSystemRef.current.updateConfig(configUpdates);
  }, []);
  
  /**
   * Add event listener
   */
  const addEventListener = useCallback((type: PhysicsEventType, listener: (event: any) => void) => {
    physicsSystemRef.current?.addEventListener(type, listener);
  }, []);
  
  /**
   * Remove event listener
   */
  const removeEventListener = useCallback((type: PhysicsEventType, listener: (event: any) => void) => {
    physicsSystemRef.current?.removeEventListener(type, listener);
  }, []);
  
  /**
   * Create a projectile
   */
  const createProjectile = useCallback((
    startPosition: Vector,
    angle: number,
    power: number,
    mass = 1,
    options: Partial<GamePhysicsObjectConfig> = {}
  ): string => {
    const radians = angle * Math.PI / 180; // Convert degrees to radians
    
    const velocityX = Math.cos(radians) * power;
    const velocityY = Math.sin(radians) * power;
    
    const config: GamePhysicsObjectConfig = {
      position: startPosition,
      velocity: { x: velocityX, y: velocityY, z: 0 },
      mass: mass,
      restitution: 0.5,
      behavior: GamePhysicsBehavior.PROJECTILE,
      affectedByGravity: true,
      ...options
    };
    
    return addObjectToSystem(config);
  }, [addObjectToSystem]);
  
  /**
   * Create an orbital object
   */
  const createOrbital = useCallback((
    center: Vector,
    radius: number,
    speed: number,
    options: Partial<GamePhysicsObjectConfig> = {}
  ): string => {
    const config: GamePhysicsObjectConfig = {
      behavior: GamePhysicsBehavior.ORBITAL,
      orbit: {
        center,
        radius,
        speed,
        phase: options.orbit?.phase ?? 0
      },
      affectedByGravity: false,
      ...options
    };
    
    return addObjectToSystem(config);
  }, [addObjectToSystem]);
  
  /**
   * Create a path-following object
   */
  const createPathFollower = useCallback((
    path: Vector[],
    speed: number,
    loop = true,
    options: Partial<GamePhysicsObjectConfig> = {}
  ): string => {
    if (path.length < 2) {
      throw new Error('Path must contain at least 2 points');
    }
    
    const config: GamePhysicsObjectConfig = {
      behavior: GamePhysicsBehavior.PATH_FOLLOWING,
      path: {
        points: path,
        speed,
        loop
      },
      position: { ...path[0] },
      affectedByGravity: false,
      ...options
    };
    
    return addObjectToSystem(config);
  }, [addObjectToSystem]);
  
  // Pre-defined force generators
  const forces = {
    gravity: (mass: number, g?: Vector): Vector => {
      const gravity = g || physicsSystemRef.current?.getConfig().gravity || { x: 0, y: 9.8, z: 0 };
      return {
        x: gravity.x * mass,
        y: gravity.y * mass,
        z: gravity.z * mass
      };
    },
    
    wind: (strength: number, direction: Vector = { x: 1, y: 0, z: 0 }): Vector => {
      const normalized = VectorUtils.normalize(direction);
      return VectorUtils.multiply(normalized, strength);
    },
    
    drag: (velocity: Vector, coefficient: number): Vector => {
      const speed = VectorUtils.magnitude(velocity);
      const dragMagnitude = coefficient * speed * speed;
      
      if (speed === 0) return { x: 0, y: 0, z: 0 };
      
      const dragDirection = VectorUtils.multiply(
        VectorUtils.normalize(velocity),
        -1
      );
      
      return VectorUtils.multiply(dragDirection, dragMagnitude);
    },
    
    attraction: (position: Vector, target: Vector, strength: number): Vector => {
      const direction = VectorUtils.subtract(target, position);
      const distance = VectorUtils.magnitude(direction);
      
      if (distance === 0) return { x: 0, y: 0, z: 0 };
      
      const forceMagnitude = strength / (distance * distance);
      return VectorUtils.multiply(VectorUtils.normalize(direction), forceMagnitude);
    },
    
    explosion: (position: Vector, center: Vector, strength: number, radius: number): Vector => {
      const direction = VectorUtils.subtract(position, center);
      const distance = VectorUtils.magnitude(direction);
      
      if (distance === 0) return { x: 0, y: 0, z: 0 };
      if (distance > radius) return { x: 0, y: 0, z: 0 };
      
      const forceMagnitude = strength * (1 - distance / radius);
      return VectorUtils.multiply(VectorUtils.normalize(direction), forceMagnitude);
    },
    
    vortex: (position: Vector, center: Vector, strength: number, radius: number): Vector => {
      const direction = VectorUtils.subtract(position, center);
      const distance = VectorUtils.magnitude(direction);
      
      if (distance === 0) return { x: 0, y: 0, z: 0 };
      if (distance > radius) return { x: 0, y: 0, z: 0 };
      
      // Create perpendicular direction for rotation
      const perpendicular = {
        x: -direction.y,
        y: direction.x,
        z: 0
      };
      
      const forceMagnitude = strength * (1 - distance / radius);
      return VectorUtils.multiply(VectorUtils.normalize(perpendicular), forceMagnitude);
    }
  };
  
  return {
    getObject,
    addObject,
    removeObject,
    updateObject,
    applyForce,
    applyImpulse,
    setPosition,
    setVelocity,
    getAllObjects,
    forces,
    start,
    stop,
    pause,
    resume,
    reset,
    step,
    isRunning,
    isPaused,
    reducedMotion: prefersReducedMotion,
    getEnvironment,
    updateEnvironment,
    addEventListener,
    removeEventListener,
    createProjectile,
    createOrbital,
    createPathFollower,
    updateDOMElements
  };
}

export default useGamePhysics;