/**
 * Physics-Based Mouse/Pointer Following Hook
 * 
 * A React hook that enables elements to follow the mouse/pointer with natural
 * physics-based motion, including momentum, inertia, and customizable behaviors.
 */

import { useRef, useState, useEffect, useCallback, RefObject, useMemo } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { InertialMovement, InertialPresets, InertialConfig } from './inertialMovement';
import { 
    createVector as createVector2D, 
    calculateSpringForce as springForce, 
    calculateDampingForce as dampingForce
} from './physicsCalculations';
import { lerp as linearInterpolate } from './interpolation';

/**
 * Vector for 2D position and motion
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Transform applied to followed element
 */
export interface FollowTransform {
  /**
   * X position in pixels
   */
  x: number;
  
  /**
   * Y position in pixels
   */
  y: number;
  
  /**
   * Rotation in degrees
   */
  rotation: number;
  
  /**
   * Scale factor
   */
  scale: number;
  
  /**
   * Distance from pointer
   */
  distance: number;
  
  /**
   * Whether the element is currently following the pointer
   */
  isFollowing: boolean;
  
  /**
   * Normalized pointer direction vector
   */
  direction: Vector2D;
  
  /**
   * Velocity of movement
   */
  velocity: Vector2D;
}

/**
 * Follow behavior determines how the element follows the pointer
 */
export type FollowBehavior = 
  | 'direct'        // Element directly follows the pointer position
  | 'delayed'       // Element follows with a delay
  | 'springy'       // Element follows with a spring-like motion
  | 'magnetic'      // Element is attracted to pointer within a radius
  | 'orbit'         // Element orbits around the pointer
  | 'elastic'       // Element follows with elastic motion (stretches and contracts)
  | 'momentum'      // Element follows with momentum and continues after pointer stops
  | 'custom';       // Custom behavior

/**
 * Options for the usePointerFollow hook
 */
export interface PointerFollowOptions {
  /**
   * How the element should follow the pointer
   */
  behavior?: FollowBehavior;
  
  /**
   * Configuration for 'momentum' behavior.
   * Can be a partial InertialConfig object or a keyof InertialPresets.
   */
  physics?: Partial<InertialConfig> | keyof typeof InertialPresets;
  
  /**
   * Offset from the pointer position
   */
  offset?: Vector2D;
  
  /**
   * Maximum distance the element can move from its origin
   */
  maxDistance?: number;
  
  /**
   * Whether to enable rotation based on movement
   */
  enableRotation?: boolean;
  
  /**
   * Maximum rotation in degrees
   */
  maxRotation?: number;
  
  /**
   * Whether to enable scaling based on movement
   */
  enableScaling?: boolean;
  
  /**
   * Minimum scale factor
   */
  minScale?: number;
  
  /**
   * Maximum scale factor
   */
  maxScale?: number;
  
  /**
   * Distance threshold to start following
   * Element won't move until pointer is within this distance
   */
  followThreshold?: number;
  
  /**
   * Follow distance in pixels
   * Used for behaviors that maintain a distance from the pointer
   */
  followDistance?: number;
  
  /**
   * Speed multiplier for movement (1 = normal speed)
   */
  speedFactor?: number;
  
  /**
   * Whether to follow mouse/pointer even when not over the element
   */
  alwaysFollow?: boolean;
  
  /**
   * Whether to respect user's reduced motion preferences
   */
  respectReducedMotion?: boolean;
  
  /**
   * Origin position to return to when not following
   */
  originPosition?: Vector2D;
  
  /**
   * Whether to capture pointer events
   * When true, pointer events are captured to enable following even when
   * the pointer moves outside the element or over other elements
   */
  capturePointer?: boolean;
  
  /**
   * Whether to automatically start following when mounted
   */
  autoStart?: boolean;
  
  /**
   * CSS class to add when element is following
   */
  followingClassName?: string;
  
  /**
   * Optional callback for transform updates
   */
  onTransform?: (transform: FollowTransform) => void;
  
  /**
   * Optional callback when following starts
   */
  onFollowStart?: () => void;
  
  /**
   * Optional callback when following stops
   */
  onFollowEnd?: () => void;
}

/**
 * Default transform state
 */
const DEFAULT_TRANSFORM: FollowTransform = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  distance: 0,
  isFollowing: false,
  direction: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 }
};

/**
 * Result of the usePointerFollow hook
 */
export interface PointerFollowResult<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the element
   */
  ref: RefObject<T>;
  
  /**
   * Current transform state
   */
  transform: FollowTransform;
  
  /**
   * Whether the element is currently following
   */
  isFollowing: boolean;
  
  /**
   * Start following the pointer
   */
  startFollowing: () => void;
  
  /**
   * Stop following the pointer
   */
  stopFollowing: () => void;
  
  /**
   * Manually update the position
   */
  setPosition: (position: Vector2D) => void;
  
  /**
   * Apply a force/impulse to the element
   */
  applyForce: (force: Vector2D) => void;
  
  /**
   * Update the follow configuration
   */
  updateConfig: (config: Partial<PointerFollowOptions>) => void;
}

/**
 * Hook for physics-based mouse/pointer following with natural movement
 * 
 * @example
 * ```jsx
 * const { ref, transform, isFollowing } = usePointerFollow({
 *   behavior: 'momentum',
 *   enableRotation: true,
 *   maxRotation: 15,
 *   enableScaling: true,
 *   maxScale: 1.2,
 *   physics: 'SMOOTH'
 * });
 * 
 * return (
 *   <div
 *     ref={ref}
 *     className={isFollowing ? 'active' : ''}
 *     style={{
 *       transform: `translate(${transform.x}px, ${transform.y}px) 
 *                  rotate(${transform.rotation}deg) 
 *                  scale(${transform.scale})`
 *     }}
 *   >
 *     Follow me!
 *   </div>
 * );
 * ```
 */
export function usePointerFollow<T extends HTMLElement = HTMLElement>(
  options: PointerFollowOptions = {}
): PointerFollowResult<T> {
  // Extract options with defaults
  const {
    behavior = 'momentum',
    physics = 'SMOOTH',
    offset = { x: 0, y: 0 },
    maxDistance = 100,
    enableRotation = false,
    maxRotation = 15,
    enableScaling = false,
    minScale = 0.8,
    maxScale = 1.2,
    followThreshold = 0,
    followDistance = 0,
    speedFactor = 1,
    alwaysFollow = false,
    respectReducedMotion = true,
    originPosition = { x: 0, y: 0 },
    capturePointer = false,
    autoStart = true,
    followingClassName,
    onTransform,
    onFollowStart,
    onFollowEnd
  } = options;
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion && respectReducedMotion;
  
  // Create element reference
  const elementRef = useRef<T>(null);
  
  // Track pointer position
  const [pointerPosition, setPointerPosition] = useState<Vector2D>({ x: 0, y: 0 });
  
  // Track current transform
  const [transform, setTransform] = useState<FollowTransform>(DEFAULT_TRANSFORM);
  
  // Track whether the element is following the pointer
  const [isFollowing, setIsFollowing] = useState<boolean>(autoStart);
  
  // State for element origin and dimensions
  const [elementOrigin, setElementOrigin] = useState<Vector2D>(originPosition);
  const [elementDimensions, setElementDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  
  // Refs for inertia controllers
  const inertialXRef = useRef<InertialMovement | null>(null);
  const inertialYRef = useRef<InertialMovement | null>(null);
  
  // Animation frame reference
  const rafRef = useRef<number | null>(null);
  
  // Last known pointer position for velocity calculation
  const lastPointerRef = useRef<{ x: number, y: number, time: number }>({ 
    x: 0, y: 0, time: Date.now() 
  });
  
  // Pointer velocity tracking
  const pointerVelocityRef = useRef<Vector2D>({ x: 0, y: 0 });
  
  // Tracking if pointer is over the element
  const isPointerOverRef = useRef<boolean>(false);
  
  // Initialize controllers
  useEffect(() => {
    // Create inertial controllers
    const configObject = typeof physics === 'string' 
      ? InertialPresets[physics] 
      : physics;
    
    // Apply reduced motion settings if needed
    if (shouldReduceMotion) {
      configObject.friction = Math.min(configObject.friction ?? 0.95, 0.8);
      configObject.restThreshold = Math.max(configObject.restThreshold ?? 0.1, 0.5);
    }
    
    inertialXRef.current = new InertialMovement(configObject);
    inertialYRef.current = new InertialMovement(configObject);
    
    // Set initial positions to origin
    inertialXRef.current.set(originPosition.x, 0);
    inertialYRef.current.set(originPosition.y, 0);
    
    // Get element dimensions
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setElementDimensions({ 
        width: rect.width, 
        height: rect.height 
      });
      setElementOrigin({ 
        x: originPosition.x,
        y: originPosition.y
      });
    }
    
    return () => {
      // Clean up animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [physics, originPosition, shouldReduceMotion]);
  
  // Update element origin and dimensions on resize
  useEffect(() => {
    const updateElementInfo = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setElementDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    // Update on mount and resize
    updateElementInfo();
    window.addEventListener('resize', updateElementInfo);
    
    return () => {
      window.removeEventListener('resize', updateElementInfo);
    };
  }, []);
  
  // Handle pointer movement
  const handlePointerMove = useCallback((e: PointerEvent) => {
    // Update pointer position
    const pointerPos = { x: e.clientX, y: e.clientY };
    setPointerPosition(pointerPos);
    
    // Calculate velocity by comparing with last position
    const now = Date.now();
    const timeDelta = now - lastPointerRef.current.time;
    
    if (timeDelta > 0) {
      const xVelocity = (pointerPos.x - lastPointerRef.current.x) / timeDelta * 16.67; // Normalize to 60fps
      const yVelocity = (pointerPos.y - lastPointerRef.current.y) / timeDelta * 16.67;
      
      // Apply low-pass filter for smoother velocity
      pointerVelocityRef.current = {
        x: pointerVelocityRef.current.x * 0.8 + xVelocity * 0.2,
        y: pointerVelocityRef.current.y * 0.8 + yVelocity * 0.2
      };
    }
    
    // Update last known position
    lastPointerRef.current = {
      x: pointerPos.x,
      y: pointerPos.y,
      time: now
    };
    
    // Only continue if we're following
    if (!isFollowing) return;
    
    // Get element center
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const elementCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      // Calculate distance from pointer to element center
      const distanceX = pointerPos.x - elementCenter.x;
      const distanceY = pointerPos.y - elementCenter.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Check distance threshold
      if (followThreshold > 0 && distance < followThreshold) {
        return;
      }
      
      // Calculate target position based on behavior
      let targetX = 0;
      let targetY = 0;
      
      switch (behavior) {
        case 'direct':
          // Direct following - element follows pointer directly with offset
          targetX = pointerPos.x - elementCenter.x + offset.x;
          targetY = pointerPos.y - elementCenter.y + offset.y;
          break;
          
        case 'delayed':
          // Delayed following - we use inertia controllers with higher friction
          if (inertialXRef.current && inertialYRef.current) {
            targetX = pointerPos.x - elementCenter.x + transform.x + offset.x;
            targetY = pointerPos.y - elementCenter.y + transform.y + offset.y;
          }
          break;
          
        case 'springy':
          // Springy following - spring-like motion towards target
          targetX = (pointerPos.x - elementCenter.x) * 0.5 + offset.x;
          targetY = (pointerPos.y - elementCenter.y) * 0.5 + offset.y;
          break;
          
        case 'magnetic':
          // Magnetic following - attraction based on distance
          const maxAttractionDistance = maxDistance * 2;
          const attractionFactor = Math.max(0, 1 - distance / maxAttractionDistance);
          targetX = distanceX * attractionFactor + offset.x;
          targetY = distanceY * attractionFactor + offset.y;
          break;
          
        case 'orbit':
          // Orbit following - element orbits around pointer
          const angle = Math.atan2(distanceY, distanceX) + Math.PI / 4; // 45° ahead
          const orbitRadius = followDistance || maxDistance / 2;
          targetX = Math.cos(angle) * orbitRadius + offset.x;
          targetY = Math.sin(angle) * orbitRadius + offset.y;
          break;
          
        case 'elastic':
          // Elastic following - stretches and contracts based on movement
          const elasticFactor = 1 - Math.min(1, distance / (maxDistance * 2));
          targetX = distanceX * elasticFactor * 2 + offset.x;
          targetY = distanceY * elasticFactor * 2 + offset.y;
          break;
          
        case 'momentum':
        default:
          // Momentum following - natural physics motion
          if (inertialXRef.current && inertialYRef.current) {
            // Target is a mix of current position and pointer position
            const blendFactor = 0.85; // How much to blend
            targetX = ((pointerPos.x - elementCenter.x) * (1 - blendFactor) + 
                      transform.x * blendFactor) + offset.x;
            targetY = ((pointerPos.y - elementCenter.y) * (1 - blendFactor) + 
                      transform.y * blendFactor) + offset.y;
          }
          break;
      }
      
      // Apply speed factor
      targetX *= speedFactor;
      targetY *= speedFactor;
      
      // Apply max distance constraint
      const targetDistance = Math.sqrt(targetX * targetX + targetY * targetY);
      if (targetDistance > maxDistance) {
        const scale = maxDistance / targetDistance;
        targetX *= scale;
        targetY *= scale;
      }
      
      // Update inertial controllers
      if (inertialXRef.current && inertialYRef.current) {
        // Starting state is important for motion quality
        const currentX = inertialXRef.current.getPosition();
        const currentY = inertialYRef.current.getPosition();
        
        if (behavior === 'momentum') {
          // For momentum behavior, we need to set new targets but keep existing velocity
          const vx = inertialXRef.current.getVelocity();
          const vy = inertialYRef.current.getVelocity();
          
          // Add some of the pointer's velocity to create more natural feel
          const newVx = vx * 0.92 + pointerVelocityRef.current.x * 0.08;
          const newVy = vy * 0.92 + pointerVelocityRef.current.y * 0.08;
          
          // Blend toward target position
          inertialXRef.current.set(
            currentX + (targetX - currentX) * 0.08, 
            newVx
          );
          
          inertialYRef.current.set(
            currentY + (targetY - currentY) * 0.08,
            newVy
          );
        } else {
          // For other behaviors, set target position with calculated velocity
          const velX = (targetX - currentX) * 0.2;
          const velY = (targetY - currentY) * 0.2;
          
          inertialXRef.current.set(currentX, velX);
          inertialYRef.current.set(currentY, velY);
        }
      }
      
      // Start animation if not running
      startAnimation();
    }
  }, [
    behavior, 
    followDistance, 
    followThreshold, 
    isFollowing, 
    maxDistance, 
    offset, 
    speedFactor, 
    transform.x, 
    transform.y
  ]);
  
  // Handle pointer enter
  const handlePointerEnter = useCallback(() => {
    isPointerOverRef.current = true;
    
    if (alwaysFollow) {
      startFollowing();
    }
  }, [alwaysFollow]);
  
  // Handle pointer leave
  const handlePointerLeave = useCallback(() => {
    isPointerOverRef.current = false;
    
    if (!alwaysFollow && !capturePointer) {
      stopFollowing();
    }
  }, [alwaysFollow, capturePointer]);
  
  // Start animation loop
  const startAnimation = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(updateAnimation);
    }
  }, []);
  
  // Update animation frame
  const updateAnimation = useCallback(() => {
    if (inertialXRef.current && inertialYRef.current) {
      // Update both axes
      const stateX = inertialXRef.current.update();
      const stateY = inertialYRef.current.update();
      
      // Get current position and velocity
      const x = stateX.position;
      const y = stateY.position;
      const vx = stateX.velocity;
      const vy = stateY.velocity;
      
      // Calculate distance from origin
      const distanceFromOrigin = Math.sqrt(
        (x - elementOrigin.x) * (x - elementOrigin.x) + 
        (y - elementOrigin.y) * (y - elementOrigin.y)
      );
      
      // Calculate rotation based on velocity if enabled
      let rotation = 0;
      if (enableRotation) {
        // Rotate based on velocity direction and magnitude
        const velocityMagnitude = Math.sqrt(vx * vx + vy * vy);
        const normalizedMagnitude = Math.min(1, velocityMagnitude / 20);
        
        // Calculate angle from velocity components
        const velocityAngle = Math.atan2(vy, vx) * (180 / Math.PI);
        
        // Scale rotation by magnitude and max rotation
        rotation = velocityAngle * normalizedMagnitude * (maxRotation / 180);
        
        // Reduce motion if needed
        if (shouldReduceMotion) {
          rotation *= 0.3;
        }
      }
      
      // Calculate scale based on velocity if enabled
      let scale = 1;
      if (enableScaling) {
        // Scale based on velocity magnitude
        const velocityMagnitude = Math.sqrt(vx * vx + vy * vy);
        const normalizedMagnitude = Math.min(1, velocityMagnitude / 30);
        
        // Interpolate scale between min and max values
        const scaleRange = maxScale - minScale;
        scale = minScale + scaleRange * normalizedMagnitude;
        
        // Reduce motion if needed
        if (shouldReduceMotion) {
          scale = 1 + (scale - 1) * 0.3;
        }
      }
      
      // Calculate normalized direction
      const direction = { x: 0, y: 0 };
      const totalVelocity = Math.sqrt(vx * vx + vy * vy);
      if (totalVelocity > 0) {
        direction.x = vx / totalVelocity;
        direction.y = vy / totalVelocity;
      }
      
      // Create new transform
      const newTransform: FollowTransform = {
        x,
        y,
        rotation,
        scale,
        distance: distanceFromOrigin,
        isFollowing: isFollowing,
        direction,
        velocity: { x: vx, y: vy }
      };
      
      // Update transform state
      setTransform(newTransform);
      
      // Call onTransform if provided
      if (onTransform) {
        onTransform(newTransform);
      }
      
      // Add or remove following class
      if (elementRef.current && followingClassName) {
        if (isFollowing) {
          elementRef.current.classList.add(followingClassName);
        } else {
          elementRef.current.classList.remove(followingClassName);
        }
      }
      
      // Check if we should continue animating
      const isMoving = !stateX.atRest || !stateY.atRest;
      if (isMoving) {
        rafRef.current = requestAnimationFrame(updateAnimation);
      } else {
        rafRef.current = null;
        
        // If we've stopped moving and we're following, should we return to origin?
        if (!isPointerOverRef.current && !alwaysFollow) {
          returnToOrigin();
        }
      }
    }
  }, [
    alwaysFollow, 
    elementOrigin.x, 
    elementOrigin.y, 
    enableRotation,
    enableScaling,
    followingClassName,
    isFollowing,
    maxRotation,
    maxScale,
    minScale,
    onTransform,
    shouldReduceMotion
  ]);
  
  // Return to origin position
  const returnToOrigin = useCallback(() => {
    if (inertialXRef.current && inertialYRef.current) {
      // Get current position
      const currentX = inertialXRef.current.getPosition();
      const currentY = inertialYRef.current.getPosition();
      
      // Calculate velocity toward origin
      const toOriginX = (elementOrigin.x - currentX) * 0.1;
      const toOriginY = (elementOrigin.y - currentY) * 0.1;
      
      // Set new velocity toward origin
      inertialXRef.current.set(currentX, toOriginX);
      inertialYRef.current.set(currentY, toOriginY);
      
      // Start animation if not running
      startAnimation();
    }
  }, [elementOrigin.x, elementOrigin.y, startAnimation]);
  
  // Start following the pointer
  const startFollowing = useCallback(() => {
    if (!isFollowing) {
      setIsFollowing(true);
      
      // Call onFollowStart if provided
      if (onFollowStart) {
        onFollowStart();
      }
    }
  }, [isFollowing, onFollowStart]);
  
  // Stop following the pointer
  const stopFollowing = useCallback(() => {
    if (isFollowing) {
      setIsFollowing(false);
      
      // Return to origin position
      returnToOrigin();
      
      // Call onFollowEnd if provided
      if (onFollowEnd) {
        onFollowEnd();
      }
    }
  }, [isFollowing, onFollowEnd, returnToOrigin]);
  
  // Manually set position
  const setPosition = useCallback((position: Vector2D) => {
    if (inertialXRef.current && inertialYRef.current) {
      inertialXRef.current.set(position.x, 0);
      inertialYRef.current.set(position.y, 0);
      
      // Update states immediately
      setTransform(prev => ({
        ...prev,
        x: position.x,
        y: position.y
      }));
    }
  }, []);
  
  // Apply force to the element
  const applyForce = useCallback((force: Vector2D) => {
    if (inertialXRef.current && inertialYRef.current) {
      // Add velocity based on force
      inertialXRef.current.addVelocity(force.x);
      inertialYRef.current.addVelocity(force.y);
      
      // Start animation
      startAnimation();
    }
  }, [startAnimation]);
  
  // Update configuration
  const updateConfig = useCallback((newOptions: Partial<PointerFollowOptions>) => {
    // This would normally update the options state, but for simplicity
    // we'll just update the inertial controllers with any new physics settings
    if (newOptions.physics && inertialXRef.current && inertialYRef.current) {
      const configObject = typeof newOptions.physics === 'string' 
        ? InertialPresets[newOptions.physics] 
        : newOptions.physics;
        
      inertialXRef.current.updateConfig(configObject);
      inertialYRef.current.updateConfig(configObject);
    }
  }, []);
  
  // Set up event listeners
  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    
    // Add event listeners to the element
    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointerleave', handlePointerLeave);
    
    // Add document-level event listener for pointer movement
    document.addEventListener('pointermove', handlePointerMove);
    
    // If capturing pointer events, handle that specially
    if (capturePointer) {
      const handlePointerDown = () => {
        startFollowing();
        element.setPointerCapture(1); // Capture next pointer events
      };
      
      const handlePointerUp = () => {
        if (!alwaysFollow) {
          stopFollowing();
        }
        element.releasePointerCapture(1);
      };
      
      element.addEventListener('pointerdown', handlePointerDown);
      element.addEventListener('pointerup', handlePointerUp);
      element.addEventListener('pointercancel', handlePointerUp);
      
      return () => {
        element.removeEventListener('pointerdown', handlePointerDown);
        element.removeEventListener('pointerup', handlePointerUp);
        element.removeEventListener('pointercancel', handlePointerUp);
        element.removeEventListener('pointerenter', handlePointerEnter);
        element.removeEventListener('pointerleave', handlePointerLeave);
        document.removeEventListener('pointermove', handlePointerMove);
      };
    }
    
    return () => {
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [
    alwaysFollow,
    capturePointer,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerMove,
    startFollowing,
    stopFollowing
  ]);
  
  return {
    ref: elementRef,
    transform,
    isFollowing,
    startFollowing,
    stopFollowing,
    setPosition,
    applyForce,
    updateConfig
  };
}

export default usePointerFollow;