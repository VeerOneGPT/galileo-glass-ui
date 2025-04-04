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

// Simple throttle function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

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
  
  // --- Define Handlers Earlier --- 
  // Update element info on resize
  const updateElementInfo = useCallback(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setElementDimensions({
        width: rect.width,
        height: rect.height
      });
    }
  }, []);

  // Update animation frame (forward declaration)
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
        const velocityMagnitude = Math.sqrt(vx * vx + vy * vy);
        const normalizedMagnitude = Math.min(1, velocityMagnitude / 20);
        const velocityAngle = Math.atan2(vy, vx) * (180 / Math.PI);
        rotation = velocityAngle * normalizedMagnitude * (maxRotation / 180);
        if (shouldReduceMotion) {
          rotation *= 0.3;
        }
      }
      
      // Calculate scale based on velocity if enabled
      let scale = 1;
      if (enableScaling) {
        const velocityMagnitude = Math.sqrt(vx * vx + vy * vy);
        const normalizedMagnitude = Math.min(1, velocityMagnitude / 30);
        const scaleRange = maxScale - minScale;
        scale = minScale + scaleRange * normalizedMagnitude;
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
      onTransform?.(newTransform);
      
      // Add or remove following class
      if (elementRef.current && followingClassName) {
        elementRef.current.classList.toggle(followingClassName, isFollowing);
      }
      
      // Check if we should continue animating
      const isMoving = !stateX.atRest || !stateY.atRest;
      if (isMoving) {
        rafRef.current = requestAnimationFrame(updateAnimation);
      } else {
        rafRef.current = null;
        if (!isPointerOverRef.current && !alwaysFollow) {
          returnToOrigin();
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    alwaysFollow, elementOrigin.x, elementOrigin.y, enableRotation, enableScaling,
    followingClassName, isFollowing, maxRotation, maxScale, minScale,
    onTransform, shouldReduceMotion, /* returnToOrigin will be added below */
  ]);

  // Start animation loop
  const startAnimation = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(updateAnimation);
    }
  }, [updateAnimation]); // Depend on the memoized updateAnimation

  // Return to origin position
  const returnToOrigin = useCallback(() => {
    if (inertialXRef.current && inertialYRef.current) {
      const currentX = inertialXRef.current.getPosition();
      const currentY = inertialYRef.current.getPosition();
      const toOriginX = (elementOrigin.x - currentX) * 0.1;
      const toOriginY = (elementOrigin.y - currentY) * 0.1;
      inertialXRef.current.set(currentX, toOriginX);
      inertialYRef.current.set(currentY, toOriginY);
      startAnimation();
    }
  }, [elementOrigin.x, elementOrigin.y, startAnimation]);

  // Now add returnToOrigin to updateAnimation dependencies
  useEffect(() => {
    // This effect is just to establish the dependency link
    // The actual call happens within updateAnimation
  }, [updateAnimation, returnToOrigin]);

  // Handle pointer movement (Throttled)
  const handlePointerMoveThrottled = useCallback(
    throttle((e: PointerEvent) => {
      const pointerPos = { x: e.clientX, y: e.clientY };
      setPointerPosition(pointerPos);
      const now = Date.now();
      const timeDelta = now - lastPointerRef.current.time;
      if (timeDelta > 0) {
        const xVelocity = (pointerPos.x - lastPointerRef.current.x) / timeDelta * 16.67;
        const yVelocity = (pointerPos.y - lastPointerRef.current.y) / timeDelta * 16.67;
        pointerVelocityRef.current = {
          x: pointerVelocityRef.current.x * 0.8 + xVelocity * 0.2,
          y: pointerVelocityRef.current.y * 0.8 + yVelocity * 0.2
        };
      }
      lastPointerRef.current = { x: pointerPos.x, y: pointerPos.y, time: now };
  
      if (!isFollowing) return;
      
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const elementCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const distanceX = pointerPos.x - elementCenter.x;
        const distanceY = pointerPos.y - elementCenter.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if (followThreshold > 0 && distance < followThreshold) return;
        let targetX = 0;
        let targetY = 0;
        switch (behavior) {
          case 'direct':
            targetX = pointerPos.x - elementCenter.x + offset.x;
            targetY = pointerPos.y - elementCenter.y + offset.y;
            break;
          case 'delayed':
            if (inertialXRef.current && inertialYRef.current) {
              targetX = pointerPos.x - elementCenter.x + transform.x + offset.x;
              targetY = pointerPos.y - elementCenter.y + transform.y + offset.y;
            }
            break;
          case 'springy':
            targetX = (pointerPos.x - elementCenter.x) * 0.5 + offset.x;
            targetY = (pointerPos.y - elementCenter.y) * 0.5 + offset.y;
            break;
          case 'magnetic':
            const maxAttractionDistance = maxDistance * 2;
            const attractionFactor = Math.max(0, 1 - distance / maxAttractionDistance);
            targetX = distanceX * attractionFactor + offset.x;
            targetY = distanceY * attractionFactor + offset.y;
            break;
          case 'orbit':
            const angle = Math.atan2(distanceY, distanceX) + Math.PI / 4;
            const orbitRadius = followDistance || maxDistance / 2;
            targetX = Math.cos(angle) * orbitRadius + offset.x;
            targetY = Math.sin(angle) * orbitRadius + offset.y;
            break;
          case 'elastic':
            const elasticFactor = 1 - Math.min(1, distance / (maxDistance * 2));
            targetX = distanceX * elasticFactor * 2 + offset.x;
            targetY = distanceY * elasticFactor * 2 + offset.y;
            break;
          case 'momentum':
          default:
            if (inertialXRef.current && inertialYRef.current) {
              const blendFactor = 0.85;
              targetX = ((pointerPos.x - elementCenter.x) * (1 - blendFactor) + transform.x * blendFactor) + offset.x;
              targetY = ((pointerPos.y - elementCenter.y) * (1 - blendFactor) + transform.y * blendFactor) + offset.y;
            }
            break;
        }
        targetX *= speedFactor;
        targetY *= speedFactor;
        const targetDistance = Math.sqrt(targetX * targetX + targetY * targetY);
        if (targetDistance > maxDistance) {
          const scaleFactor = maxDistance / targetDistance;
          targetX *= scaleFactor;
          targetY *= scaleFactor;
        }
  
        if (inertialXRef.current && inertialYRef.current) {
          const currentX = inertialXRef.current.getPosition();
          const currentY = inertialYRef.current.getPosition();
          if (behavior === 'momentum') {
            const vx = inertialXRef.current.getVelocity();
            const vy = inertialYRef.current.getVelocity();
            const newVx = vx * 0.92 + pointerVelocityRef.current.x * 0.08;
            const newVy = vy * 0.92 + pointerVelocityRef.current.y * 0.08;
            inertialXRef.current.set(currentX + (targetX - currentX) * 0.08, newVx);
            inertialYRef.current.set(currentY + (targetY - currentY) * 0.08, newVy);
          } else {
            const velX = (targetX - currentX) * 0.2;
            const velY = (targetY - currentY) * 0.2;
            inertialXRef.current.set(currentX, velX);
            inertialYRef.current.set(currentY, velY);
          }
        }
        startAnimation();
      }
    }, 16), // Throttle to roughly 60fps (1000ms / 60fps ≈ 16ms)
    [
      behavior, followDistance, followThreshold, isFollowing, maxDistance, 
      offset.x, offset.y, speedFactor, transform.x, transform.y, startAnimation
    ]
  );
  
  // --- Define Control Functions Earlier --- 
  // Start following
  const startFollowing = useCallback(() => {
    if (!isFollowing) {
      setIsFollowing(true);
      onFollowStart?.();
      startAnimation(); 
    }
  }, [isFollowing, onFollowStart, startAnimation]);

  // Stop following and return to origin
  const stopFollowing = useCallback(() => {
    if (isFollowing) {
      setIsFollowing(false);
      onFollowEnd?.();
      returnToOrigin();
    }
  }, [isFollowing, onFollowEnd, returnToOrigin]);

  // --- Define Remaining Handlers Earlier --- 
  // Handle pointer enter
  const handlePointerEnter = useCallback(() => {
    isPointerOverRef.current = true;
    if (alwaysFollow) {
      startFollowing(); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alwaysFollow, startFollowing]);
  
  // Handle pointer leave
  const handlePointerLeave = useCallback(() => {
    isPointerOverRef.current = false;
    if (!alwaysFollow && !capturePointer) {
      stopFollowing(); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alwaysFollow, capturePointer, stopFollowing]);

  // --- Initialize and Attach/Detach Event Listeners --- 
  useEffect(() => {
    // Initialize inertial controllers
    const configObject = typeof physics === 'string' 
      ? { ...InertialPresets[physics] } // Clone preset
      : { ...physics }; // Clone custom config
    
    if (shouldReduceMotion) {
      configObject.friction = Math.min(configObject.friction ?? 0.95, 0.8);
      configObject.restThreshold = Math.max(configObject.restThreshold ?? 0.1, 0.5);
    }
    
    inertialXRef.current = new InertialMovement(configObject);
    inertialYRef.current = new InertialMovement(configObject);
    inertialXRef.current.set(originPosition.x, 0);
    inertialYRef.current.set(originPosition.y, 0);
    
    // Get initial element info
    updateElementInfo();
    
    // Attach event listeners (use throttled handler)
    window.addEventListener('pointermove', handlePointerMoveThrottled);
    window.addEventListener('resize', updateElementInfo);

    const currentElement = elementRef.current;
    if (currentElement) {
      currentElement.addEventListener('pointerenter', handlePointerEnter);
      currentElement.addEventListener('pointerleave', handlePointerLeave);
    }
    
    // Start if autoStart
    if (autoStart) {
      startFollowing();
    }

    // Cleanup function
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Remove the throttled handler
      window.removeEventListener('pointermove', handlePointerMoveThrottled);
      window.removeEventListener('resize', updateElementInfo);
      if (currentElement) {
        currentElement.removeEventListener('pointerenter', handlePointerEnter);
        currentElement.removeEventListener('pointerleave', handlePointerLeave);
      }
    };
  // Update dependencies to use the throttled handler
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [physics, originPosition.x, originPosition.y, shouldReduceMotion, autoStart, 
      handlePointerMoveThrottled, updateElementInfo, handlePointerEnter, handlePointerLeave,
      startFollowing // Added startFollowing
     ]);

  // --- Define Remaining Control Functions --- 
  // Manually set position (useful for initialization or external control)
  const setPosition = useCallback((position: Vector2D) => {
    if (inertialXRef.current && inertialYRef.current) {
      inertialXRef.current.set(position.x, 0);
      inertialYRef.current.set(position.y, 0);
      // Update state immediately without animation
      setTransform(prev => ({ ...prev, x: position.x, y: position.y }));
      // Stop any existing animation
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, []);

  // Apply force/impulse
  const applyForce = useCallback((force: Vector2D) => {
    if (inertialXRef.current && inertialYRef.current) {
      inertialXRef.current.addVelocity(force.x);
      inertialYRef.current.addVelocity(force.y);
      startAnimation();
    }
  }, [startAnimation]);

  // Update configuration dynamically
  const updateConfig = useCallback((newConfig: Partial<PointerFollowOptions>) => {
    // TODO: Implement logic to update internal options and potentially re-initialize physics
    console.warn('updateConfig is not fully implemented yet.', newConfig);
  }, []);

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