/**
 * Advanced Physics Interaction Hook
 * 
 * React hook for applying realistic physics-based interactions to elements
 * with enhanced capabilities and performance optimizations.
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useGlassPerformance } from './useGlassPerformance';
import { getCurrentTime } from '../utils/time';
import { applyGpuAcceleration, backfaceVisibility } from '../core/cssHelpers';
import { AnyHTMLElement, FlexibleElementRef } from '../utils/elementTypes';

// Import from local utils
const markAsAnimating = (element: AnyHTMLElement | null): void => {
  if (!element) return;
  element.style.willChange = 'transform, opacity';
};

// Local wrapper for GPU acceleration
const addGpuAcceleration = (
  element: AnyHTMLElement | CSSStyleDeclaration | null,
  useWillChange: boolean = false
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
  | 'spring'        // Spring-based movement
  | 'magnetic'      // Magnetic-like attraction
  | 'gravity'       // Gravitational pull
  | 'particle'      // Particle-like jittering
  | 'attract'       // Attraction force
  | 'repel'         // Repulsion force
  | 'follow'        // Smooth following
  | 'orbit'         // Orbital movement
  | 'elastic'       // Elastic snap-back
  | 'fluid'         // Fluid-like movement
  | 'bounce'        // Bouncy interaction
  | 'magnet-grid'   // Snap to grid with magnetic behavior
  | 'inertia'       // Movement with inertia
  | 'vortex';       // Spiral/vortex movement

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
  
  public setTarget(x: number, y: number, z: number = 0): void {
    this.target = { x, y, z };
  }
  
  public update(dt: number): PhysicsVector {
    // For each axis
    ['x', 'y', 'z'].forEach((axis) => {
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
  
  public setPosition(x: number, y: number, z: number = 0): void {
    this.position = { x, y, z };
  }
  
  public setVelocity(x: number, y: number, z: number = 0): void {
    this.velocity = { x, y, z };
  }
  
  public getEnergy(): number {
    // Kinetic energy: 1/2 * m * v^2
    const kineticEnergy = 0.5 * this.mass * (
      this.velocity.x ** 2 + 
      this.velocity.y ** 2 + 
      (this.velocity.z || 0) ** 2
    );
    
    // Potential energy: 1/2 * k * x^2
    const potentialEnergy = 0.5 * this.stiffness * (
      (this.position.x - this.target.x) ** 2 +
      (this.position.y - this.target.y) ** 2 +
      ((this.position.z || 0) - (this.target.z || 0)) ** 2
    );
    
    return kineticEnergy + potentialEnergy;
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
    z: a.z !== undefined && b.z !== undefined ? lerp(a.z, b.z, t) : undefined
  };
};

/**
 * Enhanced easing functions
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInElastic: (t: number) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
  easeOutElastic: (t: number) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
  easeInOutElastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) {
      return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2;
    }
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1;
  }
};

/**
 * Hook for applying advanced physics-based interactions to elements
 */
export const usePhysicsInteraction = <T extends HTMLElement = HTMLElement>(options: PhysicsInteractionOptions = {}): {
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
  // Get system preference for reduced motion and allow override via options
  const systemPrefersReducedMotion = useReducedMotion();
  const prefersReducedMotion = options.reducedMotion !== undefined 
    ? options.reducedMotion 
    : systemPrefersReducedMotion;
  const { getRecommendedGlassSettings } = useGlassPerformance();
  
  // Merge in default options with user options
  const {
    type = 'spring',
    strength = 0.5,
    radius = 200,
    mass = 1,
    stiffness = 170,
    dampingRatio = 0.8,
    easeFactor = 0.15,
    maxDisplacement = 40,
    affectsRotation = false,
    affectsScale = false,
    rotationAmplitude = 10,
    scaleAmplitude = 0.1,
    gpuAccelerated = true,
    smooth = true,
    smoothingDuration = 200,
    activeOnHoverOnly = false,
    material = { density: 1, restitution: 0.3, friction: 0.1, drag: 0.01 },
    collisionShape = 'circle',
    affectedByGlobalForces = true,
    externalForce = { x: 0, y: 0, z: 0 },
    gravity = { x: 0, y: 0.1, z: 0, strength: 9.8 },
    calculationQuality = 'medium',
    updateRate = 60,
    timeScale = 1,
    pauseWhenInvisible = true,
    highPrecision = false,
    autoOptimize = true,
    enableCollisions = false,
    enable3D = false,
    depthRange = 100,
    attractorPosition,
    attractors = [],
    bounds,
    easingFunction,
    useAirResistance = false,
    velocityDecay = 0.98
  } = options;
  
  // Element ref that the physics will be applied to
  const elementRef = useRef<T | null>(null);
  
  // Animation frame ref for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // Spring physics model
  const springModelRef = useRef<SpringModel>(new SpringModel(mass, stiffness, dampingRatio));
  
  // Last update time for time-based physics
  const lastUpdateTimeRef = useRef<number>(0);
  
  // State for pause toggling
  const [isPaused, setIsPaused] = useState(false);
  
  // State for position and animation with enhanced properties
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
    scale: 1,
    active: false,
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    angularVelocity: 0,
    distance: 0,
    isColliding: false,
    energy: 0
  });
  
  // State to track if the mouse is inside the element (for hover-only mode)
  const [isHovering, setIsHovering] = useState(false);
  
  // Current mouse position
  const mousePositionRef = useRef<PhysicsVector>({ x: 0, y: 0, z: 0 });
  
  // Previous mouse position for velocity calculation
  const prevMousePositionRef = useRef<PhysicsVector>({ x: 0, y: 0, z: 0 });
  
  // Current element position (center)
  const elementPositionRef = useRef<PhysicsVector>({ x: 0, y: 0, z: 0 });
  
  // Current state (for use in animation loop without re-renders)
  const currentStateRef = useRef<PhysicsState>({
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
    scale: 1,
    active: false,
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    angularVelocity: 0,
    distance: 0,
    isColliding: false,
    energy: 0
  });
  
  // Options ref for dynamic updates
  const optionsRef = useRef<PhysicsInteractionOptions>(options);
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Apply reduced motion if needed
  const adjustedStrength = prefersReducedMotion ? Math.min(strength * 0.2, 0.1) : strength;
  const adjustedMaxDisplacement = prefersReducedMotion ? Math.min(maxDisplacement * 0.2, 10) : maxDisplacement;
  const adjustedRotationAmplitude = prefersReducedMotion ? 0 : rotationAmplitude;
  const adjustedScaleAmplitude = prefersReducedMotion ? 0 : scaleAmplitude;
  
  // Determine calculation frequency based on quality setting
  const calculationFrequency = useMemo(() => {
    switch (calculationQuality) {
      case 'low': return 30;
      case 'medium': return 60;
      case 'high': return 120;
      case 'ultra': return 240;
      default: return updateRate;
    }
  }, [calculationQuality, updateRate]);
  
  // Visibility observer
  useEffect(() => {
    if (!pauseWhenInvisible || !elementRef.current) return;
    
    // Create intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !isPaused) {
          setIsPaused(true);
        } else if (entry.isIntersecting && isPaused) {
          setIsPaused(false);
        }
      },
      { threshold: 0.1 }
    );
    
    // Start observing
    observer.observe(elementRef.current);
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [pauseWhenInvisible, isPaused]);
  
  // Mouse move handler with enhanced tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Store previous position for velocity calculation
    prevMousePositionRef.current = { ...mousePositionRef.current };
    
    // Update current mouse position
    mousePositionRef.current = { 
      x: e.clientX, 
      y: e.clientY,
      z: mousePositionRef.current.z // Keep Z value
    };
    
    // Update element position if ref exists
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      elementPositionRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        z: elementPositionRef.current.z || 0
      };
      
      // Calculate distance
      const distance = calculateDistance(
        mousePositionRef.current,
        elementPositionRef.current
      );
      
      // Current options for dynamic updates
      const opts = optionsRef.current;
      const effectiveRadius = opts.radius ?? radius;
      const effectiveActiveOnHoverOnly = opts.activeOnHoverOnly ?? activeOnHoverOnly;
      
      // Only process if we're not in hover-only mode, or if we are and the element is being hovered
      const shouldProcess = !effectiveActiveOnHoverOnly || isHovering;
      
      // Activate physics if within radius and should process
      if (distance < effectiveRadius && shouldProcess && !isPaused) {
        if (!currentStateRef.current.active) {
          currentStateRef.current.active = true;
          currentStateRef.current.distance = distance;
          
          // Start animation loop if not already running
          if (!animationFrameRef.current) {
            lastUpdateTimeRef.current = getCurrentTime();
            animationFrameRef.current = requestAnimationFrame(updateAnimation);
          }
        }
      } else {
        // Set active state based on distance and hover state
        currentStateRef.current.active = false;
      }
    }
  }, [radius, activeOnHoverOnly, isHovering, isPaused]);
  
  // Function to handle mouse enter and leave for hover-only mode
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    
    // Mark the element as animating for performance optimization
    if (gpuAccelerated && elementRef.current) {
      markAsAnimating(elementRef.current);
    }
  }, [gpuAccelerated]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);
  
  // Dynamic calculation of attraction/repulsion force
  const calculateForce = useCallback((
    type: PhysicsInteractionType,
    distance: number,
    distanceVector: PhysicsVector,
    strength: number,
    mass: number,
    maxDistance: number
  ): PhysicsVector => {
    // Default force vector
    const force: PhysicsVector = { x: 0, y: 0, z: 0 };
    
    // Scale for converting to unit vector if needed
    const scale = distance > 0 ? 1 / distance : 0;
    
    // Normalized direction vector
    const dirX = distanceVector.x * scale;
    const dirY = distanceVector.y * scale;
    const dirZ = (distanceVector.z || 0) * scale;
    
    // Calculate force based on physics type
    switch (type) {
      case 'spring':
      case 'attract':
        // Linear attraction with distance falloff
        const pullFactor = Math.max(0, 1 - distance / maxDistance) * strength;
        force.x = distanceVector.x * pullFactor;
        force.y = distanceVector.y * pullFactor;
        force.z = (distanceVector.z || 0) * pullFactor;
        break;
        
      case 'magnetic':
        // Inverse square law (magnetic-like)
        const magneticFactor = Math.min(strength, strength * maxDistance / (distance * distance + 0.1));
        force.x = dirX * magneticFactor * distance;
        force.y = dirY * magneticFactor * distance;
        force.z = dirZ * magneticFactor * distance;
        break;
        
      case 'repel':
        // Repulsion force (inverse of attraction)
        const repelFactor = Math.max(0, 1 - distance / maxDistance) * strength;
        force.x = -distanceVector.x * repelFactor;
        force.y = -distanceVector.y * repelFactor;
        force.z = -(distanceVector.z || 0) * repelFactor;
        break;
        
      case 'gravity':
        // Gravitational force (inverse square)
        const gravityStrength = strength * (mass / Math.max(0.01, distance * distance * 0.001));
        force.x = dirX * gravityStrength * 10;
        force.y = dirY * gravityStrength * 10;
        force.z = dirZ * gravityStrength * 10;
        break;
        
      case 'follow':
        // Smoothed following with increasing strength as distance decreases
        const followFactor = Math.min(strength, strength * (1 - distance / (2 * maxDistance)));
        force.x = distanceVector.x * followFactor;
        force.y = distanceVector.y * followFactor;
        force.z = (distanceVector.z || 0) * followFactor;
        break;
        
      case 'orbit':
        // Calculate perpendicular vectors for orbit
        const angle = Math.atan2(distanceVector.y, distanceVector.x);
        const orbitFactor = strength * Math.min(1, distance / maxDistance);
        
        // Tangential force
        force.x = Math.cos(angle + Math.PI/2) * orbitFactor * distance * 0.1;
        force.y = Math.sin(angle + Math.PI/2) * orbitFactor * distance * 0.1;
        break;
        
      case 'elastic':
        // Elastic band-like behavior - stronger pull with greater distance
        const elasticStrength = strength * Math.pow(distance / maxDistance, 2);
        force.x = dirX * elasticStrength * distance;
        force.y = dirY * elasticStrength * distance;
        force.z = dirZ * elasticStrength * distance;
        break;
        
      case 'fluid':
        // Fluid-like motion (influenced by mouse velocity)
        const prevMouse = prevMousePositionRef.current;
        const mouse = mousePositionRef.current;
        const mouseVelocityX = mouse.x - prevMouse.x;
        const mouseVelocityY = mouse.y - prevMouse.y;
        
        const velocityFactor = strength * (1 - Math.min(1, distance / maxDistance));
        force.x = mouseVelocityX * velocityFactor;
        force.y = mouseVelocityY * velocityFactor;
        break;
        
      case 'bounce':
        // Bouncy interaction - stronger at edges of radius
        const bounceRatio = distance / maxDistance;
        const bounceFactor = strength * Math.sin(bounceRatio * Math.PI);
        force.x = dirX * bounceFactor * distance;
        force.y = dirY * bounceFactor * distance;
        force.z = dirZ * bounceFactor * distance;
        break;
        
      case 'magnet-grid':
        // Snap to grid with magnetic behavior
        const gridSize = 20; // Pixel grid size
        
        // Calculate nearest grid point
        const gridX = Math.round(distanceVector.x / gridSize) * gridSize;
        const gridY = Math.round(distanceVector.y / gridSize) * gridSize;
        
        // Calculate force toward nearest grid point
        const snapStrength = strength * Math.max(0, 1 - distance / maxDistance);
        force.x = (gridX - distanceVector.x) * snapStrength;
        force.y = (gridY - distanceVector.y) * snapStrength;
        break;
        
      case 'inertia':
        // Inertia-based movement (momentum)
        const prev = prevMousePositionRef.current;
        const curr = mousePositionRef.current;
        
        // Calculate mouse velocity
        const mx = curr.x - prev.x;
        const my = curr.y - prev.y;
        
        // Apply velocity with distance falloff
        const inertiaFactor = strength * Math.max(0, 1 - distance / maxDistance);
        force.x = mx * inertiaFactor;
        force.y = my * inertiaFactor;
        break;
        
      case 'vortex':
        // Vortex/spiral movement
        const vortexDistance = distance / maxDistance;
        const spiralAngle = Math.atan2(distanceVector.y, distanceVector.x);
        const radiusFactor = Math.max(0, 1 - vortexDistance) * strength;
        const tangentialFactor = radiusFactor * 0.5;
        
        // Combine inward pull with tangential movement
        force.x = Math.cos(spiralAngle) * radiusFactor * distance * 0.1 +
                  Math.cos(spiralAngle + Math.PI/2) * tangentialFactor * distance * 0.1;
        force.y = Math.sin(spiralAngle) * radiusFactor * distance * 0.1 +
                  Math.sin(spiralAngle + Math.PI/2) * tangentialFactor * distance * 0.1;
        break;
        
      case 'particle':
      default:
        // Random jittering
        const jitterAmount = (1 - distance / maxDistance) * strength * 5;
        force.x = (Math.random() * 2 - 1) * jitterAmount;
        force.y = (Math.random() * 2 - 1) * jitterAmount;
        break;
    }
    
    return force;
  }, []);
  
  // Calculate forces from multiple attractors
  const calculateAttractorForces = useCallback((): PhysicsVector => {
    const force: PhysicsVector = { x: 0, y: 0, z: 0 };
    
    if (!elementPositionRef.current) return force;
    
    // Handle single attractor position if provided
    if (attractorPosition) {
      const distanceVector = {
        x: attractorPosition.x - elementPositionRef.current.x,
        y: attractorPosition.y - elementPositionRef.current.y,
        z: (attractorPosition.z || 0) - (elementPositionRef.current.z || 0)
      };
      
      const distance = calculateDistance(attractorPosition, elementPositionRef.current);
      
      const opts = optionsRef.current;
      const effectiveType = opts.type || type;
      const effectiveStrength = opts.strength || strength;
      const effectiveMass = opts.mass || mass;
      const effectiveRadius = opts.radius || radius;
      
      // Calculate force from this attractor
      const attractorForce = calculateForce(
        effectiveType,
        distance,
        distanceVector,
        effectiveStrength,
        effectiveMass,
        effectiveRadius
      );
      
      force.x += attractorForce.x;
      force.y += attractorForce.y;
      force.z += attractorForce.z || 0;
    }
    
    // Handle multiple attractors if provided
    if (attractors && attractors.length > 0) {
      attractors.forEach(attractor => {
        const distanceVector = {
          x: attractor.position.x - elementPositionRef.current.x,
          y: attractor.position.y - elementPositionRef.current.y,
          z: (attractor.position.z || 0) - (elementPositionRef.current.z || 0)
        };
        
        const distance = calculateDistance(attractor.position, elementPositionRef.current);
        
        // Only apply force if within attractor's radius
        if (distance < attractor.radius) {
          const opts = optionsRef.current;
          const effectiveType = opts.type || type;
          const effectiveMass = opts.mass || mass;
          
          // Calculate force from this attractor
          const attractorForce = calculateForce(
            effectiveType,
            distance,
            distanceVector,
            attractor.strength,
            effectiveMass,
            attractor.radius
          );
          
          force.x += attractorForce.x;
          force.y += attractorForce.y;
          force.z += attractorForce.z || 0;
        }
      });
    }
    
    return force;
  }, [attractorPosition, attractors, calculateForce, type, strength, mass, radius]);
  
  // Apply air resistance based on velocity
  const applyAirResistance = useCallback((
    velocity: PhysicsVector, 
    drag: number
  ): PhysicsVector => {
    // Calculate velocity magnitude
    const speed = Math.sqrt(
      velocity.x * velocity.x + 
      velocity.y * velocity.y + 
      (velocity.z || 0) * (velocity.z || 0)
    );
    
    // Air resistance increases with the square of speed
    const resistance = drag * speed * speed;
    
    // Calculate scaling factor
    const scale = Math.max(0, 1 - resistance);
    
    // Apply resistance
    return {
      x: velocity.x * scale,
      y: velocity.y * scale,
      z: velocity.z !== undefined ? velocity.z * scale : undefined
    };
  }, []);
  
  // Apply bounds constraints
  const applyBounds = useCallback((position: PhysicsVector): PhysicsVector => {
    if (!bounds) return position;
    
    const newPosition = { ...position };
    
    if (bounds.left !== undefined && newPosition.x < bounds.left) {
      newPosition.x = bounds.left;
    }
    
    if (bounds.right !== undefined && newPosition.x > bounds.right) {
      newPosition.x = bounds.right;
    }
    
    if (bounds.top !== undefined && newPosition.y < bounds.top) {
      newPosition.y = bounds.top;
    }
    
    if (bounds.bottom !== undefined && newPosition.y > bounds.bottom) {
      newPosition.y = bounds.bottom;
    }
    
    if (bounds.zNear !== undefined && newPosition.z !== undefined && newPosition.z < bounds.zNear) {
      newPosition.z = bounds.zNear;
    }
    
    if (bounds.zFar !== undefined && newPosition.z !== undefined && newPosition.z > bounds.zFar) {
      newPosition.z = bounds.zFar;
    }
    
    return newPosition;
  }, [bounds]);
  
  // Animation update function with enhanced physics
  const updateAnimation = useCallback((timestamp: number) => {
    if (!elementRef.current || isPaused) {
      animationFrameRef.current = null;
      return;
    }
    
    // Calculate time delta for physics simulation
    const now = timestamp;
    const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1); // Cap at 100ms to prevent large jumps
    lastUpdateTimeRef.current = now;
    
    // Scale time by timeScale factor
    const scaledDeltaTime = deltaTime * timeScale;
    
    // Get current options
    const opts = optionsRef.current;
    const effectiveType = opts.type || type;
    const effectiveRadius = opts.radius || radius;
    const effectiveMass = opts.mass || mass;
    const effectiveMaxDisplacement = opts.maxDisplacement || maxDisplacement;
    const effectiveAffectsRotation = opts.affectsRotation ?? affectsRotation;
    const effectiveAffectsScale = opts.affectsScale ?? affectsScale;
    const effectiveRotationAmplitude = opts.rotationAmplitude || rotationAmplitude;
    const effectiveScaleAmplitude = opts.scaleAmplitude || scaleAmplitude;
    const effectiveStrength = opts.strength || strength;
    const effectiveEaseFactor = opts.easeFactor || easeFactor;
    const effectiveMaterial = opts.material || material;
    const effectiveGravity = opts.gravity || gravity;
    const effectiveUseAirResistance = opts.useAirResistance ?? useAirResistance;
    const effectiveVelocityDecay = opts.velocityDecay ?? velocityDecay;
    const effectiveEasingFunction = opts.easingFunction || easingFunction || easingFunctions.easeOutQuad;
    
    // Calculate current values based on physics type
    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetRotation = 0;
    let targetScale = 1;
    
    if (currentStateRef.current.active) {
      // Calculate distance and direction vector
      const distanceX = mousePositionRef.current.x - elementPositionRef.current.x;
      const distanceY = mousePositionRef.current.y - elementPositionRef.current.y;
      const distanceZ = (mousePositionRef.current.z || 0) - (elementPositionRef.current.z || 0);
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ);
      
      // Update distance in state
      currentStateRef.current.distance = distance;
      
      // Apply different physics based on type
      if (distance < effectiveRadius) {
        // Calculate force from mouse interaction
        const force = calculateForce(
          effectiveType,
          distance,
          { x: distanceX, y: distanceY, z: distanceZ },
          effectiveStrength * adjustedStrength,
          effectiveMass,
          effectiveRadius
        );
        
        // Apply attractor forces if available
        const attractorForce = calculateAttractorForces();
        force.x += attractorForce.x;
        force.y += attractorForce.y;
        force.z += attractorForce.z;
        
        // Apply external force if affected by global forces
        if (affectedByGlobalForces) {
          force.x += externalForce.x;
          force.y += externalForce.y;
          force.z += (externalForce.z || 0);
          
          // Apply gravity if enabled
          if (effectiveGravity && effectiveGravity.strength) {
            force.x += effectiveGravity.x * effectiveGravity.strength * scaledDeltaTime;
            force.y += effectiveGravity.y * effectiveGravity.strength * scaledDeltaTime;
            force.z += (effectiveGravity.z || 0) * effectiveGravity.strength * scaledDeltaTime;
          }
        }
        
        // Calculate rotation based on position or force
        if (effectiveAffectsRotation) {
          if (['orbit', 'vortex'].includes(effectiveType)) {
            // Rotation follows movement direction
            targetRotation = Math.atan2(force.y, force.x) * (180 / Math.PI);
          } else {
            // Standard rotation based on position
            targetRotation = (distanceX / effectiveRadius) * adjustedRotationAmplitude * effectiveRotationAmplitude;
          }
        }
        
        // Calculate scale based on distance
        if (effectiveAffectsScale) {
          if (effectiveType === 'repel') {
            // Inverse scaling for repulsion
            targetScale = 1 - (1 - distance / effectiveRadius) * adjustedScaleAmplitude * effectiveScaleAmplitude;
          } else {
            // Standard scaling
            targetScale = 1 + (1 - distance / effectiveRadius) * adjustedScaleAmplitude * effectiveScaleAmplitude;
          }
        }
        
        // For spring-based models (spring, elastic, etc.)
        if (['spring', 'elastic'].includes(effectiveType)) {
          // Update spring model
          springModelRef.current.setTarget(force.x, force.y, force.z);
          const position = springModelRef.current.update(scaledDeltaTime);
          
          targetX = position.x;
          targetY = position.y;
          targetZ = position.z;
          
          // Get velocity and energy for state updates
          const velocity = springModelRef.current.getVelocity();
          const energy = springModelRef.current.getEnergy();
          
          currentStateRef.current.velocity = velocity;
          currentStateRef.current.energy = energy;
        } else {
          // Direct force application for non-spring models
          targetX = force.x;
          targetY = force.y;
          targetZ = force.z;
          
          // Simple velocity estimation
          currentStateRef.current.velocity = {
            x: (targetX - currentStateRef.current.x) / scaledDeltaTime,
            y: (targetY - currentStateRef.current.y) / scaledDeltaTime,
            z: (targetZ - currentStateRef.current.z) / scaledDeltaTime
          };
        }
      }
      
      // Apply air resistance if enabled
      if (effectiveUseAirResistance) {
        currentStateRef.current.velocity = applyAirResistance(
          currentStateRef.current.velocity,
          effectiveMaterial.drag || 0.01
        );
      }
      
      // Apply velocity decay
      currentStateRef.current.velocity.x *= effectiveVelocityDecay;
      currentStateRef.current.velocity.y *= effectiveVelocityDecay;
      if (currentStateRef.current.velocity.z !== undefined) {
        currentStateRef.current.velocity.z *= effectiveVelocityDecay;
      }
      
      // Apply max displacement
      const magnitude = Math.sqrt(targetX * targetX + targetY * targetY + targetZ * targetZ);
      if (magnitude > adjustedMaxDisplacement * effectiveMaxDisplacement) {
        const scale = (adjustedMaxDisplacement * effectiveMaxDisplacement) / magnitude;
        targetX *= scale;
        targetY *= scale;
        targetZ *= scale;
      }
      
      // Apply bounds constraints
      const boundedPosition = applyBounds({ x: targetX, y: targetY, z: targetZ });
      targetX = boundedPosition.x;
      targetY = boundedPosition.y;
      targetZ = boundedPosition.z || 0;
    } else {
      // If not active, gradually return to neutral position
      const returnEasing = effectiveEasingFunction(Math.min(1, effectiveEaseFactor * 2));
      
      targetX = 0;
      targetY = 0;
      targetZ = 0;
      targetRotation = 0;
      targetScale = 1;
      
      // Apply velocity decay for more natural return
      currentStateRef.current.velocity.x *= effectiveVelocityDecay * 0.9;
      currentStateRef.current.velocity.y *= effectiveVelocityDecay * 0.9;
      if (currentStateRef.current.velocity.z !== undefined) {
        currentStateRef.current.velocity.z *= effectiveVelocityDecay * 0.9;
      }
    }
    
    // Apply easing for smooth motion
    // Custom easing function if provided, otherwise use exponential smoothing
    if (effectiveEasingFunction && typeof effectiveEasingFunction === 'function') {
      const easingAmount = effectiveEasingFunction(effectiveEaseFactor);
      
      currentStateRef.current.x += (targetX - currentStateRef.current.x) * easingAmount;
      currentStateRef.current.y += (targetY - currentStateRef.current.y) * easingAmount;
      currentStateRef.current.z += (targetZ - currentStateRef.current.z) * easingAmount;
      currentStateRef.current.rotation += (targetRotation - currentStateRef.current.rotation) * easingAmount;
      currentStateRef.current.scale += (targetScale - currentStateRef.current.scale) * easingAmount;
    } else {
      // Default exponential smoothing
      currentStateRef.current.x += (targetX - currentStateRef.current.x) * effectiveEaseFactor;
      currentStateRef.current.y += (targetY - currentStateRef.current.y) * effectiveEaseFactor;
      currentStateRef.current.z += (targetZ - currentStateRef.current.z) * effectiveEaseFactor;
      currentStateRef.current.rotation += (targetRotation - currentStateRef.current.rotation) * effectiveEaseFactor;
      currentStateRef.current.scale += (targetScale - currentStateRef.current.scale) * effectiveEaseFactor;
    }
    
    // Check if animation should continue
    const isMoving = (
      Math.abs(currentStateRef.current.x) > 0.1 ||
      Math.abs(currentStateRef.current.y) > 0.1 ||
      Math.abs(currentStateRef.current.z) > 0.1 ||
      Math.abs(currentStateRef.current.rotation) > 0.1 ||
      Math.abs(currentStateRef.current.scale - 1) > 0.01 ||
      Math.abs(currentStateRef.current.velocity.x) > 0.1 ||
      Math.abs(currentStateRef.current.velocity.y) > 0.1 ||
      (currentStateRef.current.velocity.z !== undefined && Math.abs(currentStateRef.current.velocity.z) > 0.1)
    );
    
    // Update state only if significant change (to avoid unnecessary re-renders)
    if (isMoving || currentStateRef.current.active) {
      setPhysicsState({
        x: currentStateRef.current.x,
        y: currentStateRef.current.y,
        z: currentStateRef.current.z,
        rotation: currentStateRef.current.rotation,
        scale: currentStateRef.current.scale,
        active: currentStateRef.current.active,
        velocity: currentStateRef.current.velocity,
        acceleration: currentStateRef.current.acceleration,
        angularVelocity: currentStateRef.current.angularVelocity,
        distance: currentStateRef.current.distance,
        isColliding: currentStateRef.current.isColliding,
        energy: currentStateRef.current.energy
      });
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    } else {
      // Stop animation loop if movement is minimal
      setPhysicsState({
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
        scale: 1,
        active: false,
        velocity: { x: 0, y: 0, z: 0 },
        acceleration: { x: 0, y: 0, z: 0 },
        angularVelocity: 0,
        distance: 0,
        isColliding: false,
        energy: 0
      });
      animationFrameRef.current = null;
    }
  }, [
    adjustedMaxDisplacement, 
    adjustedRotationAmplitude,
    adjustedScaleAmplitude,
    adjustedStrength,
    affectedByGlobalForces,
    affectsRotation,
    affectsScale,
    applyAirResistance,
    applyBounds,
    calculateAttractorForces,
    calculateForce,
    easeFactor,
    easingFunction,
    externalForce,
    gravity,
    isPaused,
    material,
    maxDisplacement,
    radius,
    rotationAmplitude,
    scaleAmplitude,
    strength,
    timeScale,
    type,
    useAirResistance,
    velocityDecay
  ]);
  
  // Toggle pause state
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  
  // Reset physics state
  const reset = useCallback(() => {
    currentStateRef.current = {
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      scale: 1,
      active: false,
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      angularVelocity: 0,
      distance: 0,
      isColliding: false,
      energy: 0
    };
    
    setPhysicsState({ ...currentStateRef.current });
    
    // Reset spring model
    springModelRef.current.setPosition(0, 0, 0);
    springModelRef.current.setVelocity(0, 0, 0);
  }, []);
  
  // Update options dynamically
  const update = useCallback((newOptions: Partial<PhysicsInteractionOptions>) => {
    optionsRef.current = { ...optionsRef.current, ...newOptions };
    
    // Update spring model if mass or stiffness changed
    if (newOptions.mass !== undefined || newOptions.stiffness !== undefined || newOptions.dampingRatio !== undefined) {
      const newMass = newOptions.mass ?? optionsRef.current.mass ?? mass;
      const newStiffness = newOptions.stiffness ?? optionsRef.current.stiffness ?? stiffness;
      const newDampingRatio = newOptions.dampingRatio ?? optionsRef.current.dampingRatio ?? dampingRatio;
      
      // Create new spring model with updated parameters
      springModelRef.current = new SpringModel(newMass, newStiffness, newDampingRatio);
      
      // Keep current position and velocity
      springModelRef.current.setPosition(
        currentStateRef.current.x,
        currentStateRef.current.y,
        currentStateRef.current.z
      );
      
      springModelRef.current.setVelocity(
        currentStateRef.current.velocity.x,
        currentStateRef.current.velocity.y,
        currentStateRef.current.velocity.z || 0
      );
    }
  }, [mass, stiffness, dampingRatio]);
  
  // Apply external force
  const applyForce = useCallback((force: PhysicsVector) => {
    // Add force to current velocity
    currentStateRef.current.velocity.x += force.x;
    currentStateRef.current.velocity.y += force.y;
    if (force.z !== undefined) {
      currentStateRef.current.velocity.z = (currentStateRef.current.velocity.z || 0) + force.z;
    }
    
    // Ensure animation frame is active
    if (!animationFrameRef.current && !isPaused) {
      lastUpdateTimeRef.current = getCurrentTime();
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    }
  }, [isPaused, updateAnimation]);
  
  // Apply impulse (force divided by mass)
  const applyImpulse = useCallback((impulse: PhysicsVector) => {
    const effectiveMass = optionsRef.current.mass || mass;
    
    // Add impulse to current velocity (F = ma, so v += F/m)
    currentStateRef.current.velocity.x += impulse.x / effectiveMass;
    currentStateRef.current.velocity.y += impulse.y / effectiveMass;
    if (impulse.z !== undefined) {
      currentStateRef.current.velocity.z = 
        (currentStateRef.current.velocity.z || 0) + (impulse.z / effectiveMass);
    }
    
    // Ensure animation frame is active
    if (!animationFrameRef.current && !isPaused) {
      lastUpdateTimeRef.current = getCurrentTime();
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    }
  }, [isPaused, mass, updateAnimation]);
  
  // Set position directly
  const setPosition = useCallback((position: PhysicsVector) => {
    currentStateRef.current.x = position.x;
    currentStateRef.current.y = position.y;
    currentStateRef.current.z = position.z || 0;
    
    setPhysicsState(prev => ({
      ...prev,
      x: position.x,
      y: position.y,
      z: position.z || 0
    }));
    
    // Update spring model position
    springModelRef.current.setPosition(position.x, position.y, position.z || 0);
  }, []);
  
  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    
    const element = elementRef.current;
    if (element && activeOnHoverOnly) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Apply GPU acceleration if requested
    if (gpuAccelerated && element) {
      if (autoOptimize) {
        // Get recommended settings based on performance
        const recommendations = getRecommendedGlassSettings();
        
        // Optimize GPU acceleration
        addGpuAcceleration(element.style, true);
      } else {
        // Basic GPU acceleration
        applyGpuAcceleration(element);
      }
    }
    
    // Apply smooth transitions if requested
    if (smooth && element) {
      element.style.transition = `transform ${smoothingDuration}ms ease-out`;
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (element && activeOnHoverOnly) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      // Cancel animation frame on cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Reset styles
      if (element) {
        element.style.willChange = '';
        element.style.backfaceVisibility = '';
        element.style.transition = '';
        element.style.transform = '';
      }
    };
  }, [
    handleMouseMove, 
    handleMouseEnter, 
    handleMouseLeave, 
    gpuAccelerated, 
    smooth, 
    smoothingDuration, 
    activeOnHoverOnly,
    autoOptimize,
    getRecommendedGlassSettings
  ]);
  
  // Get transform style based on current state
  const style = useMemo(() => {
    let transforms = [];
    
    // Add 3D transforms if enabled
    if (enable3D) {
      transforms.push(`translate3d(${physicsState.x}px, ${physicsState.y}px, ${physicsState.z}px)`);
    } else {
      transforms.push(`translate(${physicsState.x}px, ${physicsState.y}px)`);
    }
    
    // Add rotation if enabled
    if (affectsRotation) {
      transforms.push(`rotate(${physicsState.rotation}deg)`);
    }
    
    // Add scale if enabled
    if (affectsScale) {
      transforms.push(`scale(${physicsState.scale})`);
    }
    
    // Create base style object
    const styleObject: React.CSSProperties & {
      backfaceVisibility?: string;
      WebkitBackfaceVisibility?: string;
    } = {
      transform: transforms.join(' '),
      transition: smooth ? `transform ${smoothingDuration}ms ease-out` : 'none',
    };
    
    // Add GPU acceleration properties if needed
    if (gpuAccelerated) {
      styleObject.willChange = 'transform';
      styleObject.backfaceVisibility = 'hidden';
      styleObject.WebkitBackfaceVisibility = 'hidden';
      styleObject.perspective = enable3D ? '1000px' : 'none';
    }
    
    return styleObject;
  }, [
    physicsState, 
    affectsRotation, 
    affectsScale, 
    smooth, 
    smoothingDuration, 
    gpuAccelerated, 
    enable3D
  ]);
  
  // Create event handlers for use in components
  const eventHandlers = useMemo(() => ({
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }), [handleMouseEnter, handleMouseLeave]);
  
  return { 
    ref: elementRef, 
    style, 
    state: physicsState, 
    eventHandlers,
    update,
    reset,
    applyForce,
    applyImpulse,
    setPosition,
    isPaused,
    togglePause
  };
};

export default usePhysicsInteraction;