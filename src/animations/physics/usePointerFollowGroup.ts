/**
 * Physics-Based Mouse/Pointer Following Group Hook
 * 
 * React hook that enables a group of elements to follow the pointer
 * with staggered, coordinated physics-based motion.
 */

import { useRef, useState, useEffect, useCallback, createRef, RefObject } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { InertialMovement, InertialConfig } from './inertialMovement';
import { InertialPresets } from './inertialPresets';
import { 
  FollowBehavior, 
  FollowTransform, 
  Vector2D,

  PointerFollowOptions
} from './usePointerFollow';

/**
 * Configuration options for each follower in the group
 */
export interface FollowerConfig extends Partial<PointerFollowOptions> {
  /**
   * Delay factor for this follower (0-1)
   * Higher values cause more delay from the leader
   */
  delayFactor?: number;
  
  /**
   * Distance factor for this follower (0-1)
   * Controls how closely this follower tracks the target
   */
  distanceFactor?: number;
  
  /**
   * Custom transform function
   * Allows custom modification of the follower's transform
   */
  transformFn?: (
    transform: FollowTransform, 
    index: number, 
    leaderTransform: FollowTransform
  ) => FollowTransform;
}

/**
 * Options for the usePointerFollowGroup hook
 */
export interface PointerFollowGroupOptions {
  /**
   * Number of follower elements in the group
   */
  count: number;
  
  /**
   * How the group should follow the pointer
   */
  behavior?: FollowBehavior;
  
  /**
   * Physics configuration
   */
  physics?: Partial<InertialConfig> | keyof typeof InertialPresets;
  
  /**
   * Whether to always follow the pointer
   */
  alwaysFollow?: boolean;
  
  /**
   * Maximum distance the leader can move from origin
   */
  maxDistance?: number;
  
  /**
   * Whether group follows in order (chain) or all follow the leader
   */
  chainFollow?: boolean;
  
  /**
   * Stagger delay between followers (ms)
   */
  staggerDelay?: number;
  
  /**
   * Stagger distance between followers (px)
   */
  staggerDistance?: number;
  
  /**
   * Whether to respect user's reduced motion preferences
   */
  respectReducedMotion?: boolean;
  
  /**
   * Optional callback when group starts following
   */
  onFollowStart?: () => void;
  
  /**
   * Optional callback when group stops following
   */
  onFollowEnd?: () => void;
  
  /**
   * Individual follower configurations
   * Indexed array with specific settings for each follower
   */
  followers?: (FollowerConfig | null)[];
}

/**
 * Individual follower element state
 */
interface FollowerState {
  /**
   * Element reference
   */
  ref: RefObject<HTMLDivElement>;
  
  /**
   * Current transform
   */
  transform: FollowTransform;
  
  /**
   * Inertial controllers for x and y
   */
  controllers: {
    x: InertialMovement;
    y: InertialMovement;
  };
  
  /**
   * Element config
   */
  config: Required<FollowerConfig>;
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
 * Result of the usePointerFollowGroup hook
 */
export interface PointerFollowGroupResult {
  /**
   * Array of refs to attach to elements
   */
  refs: RefObject<HTMLDivElement>[];
  
  /**
   * Array of transforms for each follower
   */
  transforms: FollowTransform[];
  
  /**
   * Whether the group is currently following
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
   * Apply force to the leader element
   */
  applyForce: (force: Vector2D) => void;
  
  /**
   * Reset all elements to their origin positions
   */
  resetPositions: () => void;
}

/**
 * Hook for creating a group of elements that follow the pointer
 * with coordinated, staggered physics-based motion
 * 
 * @example
 * ```jsx
 * const { refs, transforms, isFollowing } = usePointerFollowGroup({
 *   count: 5,
 *   behavior: 'momentum',
 *   physics: 'SMOOTH',
 *   chainFollow: true,
 *   staggerDelay: 50,
 *   staggerDistance: 10
 * });
 * 
 * return (
 *   <div>
 *     {transforms.map((transform, i) => (
 *       <div
 *         key={i}
 *         ref={refs[i]}
 *         className={transform.isFollowing ? 'active' : ''}
 *         style={{
 *           transform: `translate(${transform.x}px, ${transform.y}px) 
 *                     rotate(${transform.rotation}deg) 
 *                     scale(${transform.scale})`
 *         }}
 *       >
 *         Follower {i}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function usePointerFollowGroup(
  options: PointerFollowGroupOptions
): PointerFollowGroupResult {
  // Extract options with defaults
  const {
    count,
    behavior = 'momentum',
    physics = 'SMOOTH',
    alwaysFollow = false,
    maxDistance = 100,
    chainFollow = false,
    staggerDelay = 30,
    staggerDistance = 5,
    respectReducedMotion = true,
    onFollowStart,
    onFollowEnd,
    followers = []
  } = options;
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion && respectReducedMotion;
  
  // Track pointer position
  const [pointerPosition, setPointerPosition] = useState<Vector2D>({ x: 0, y: 0 });
  
  // Track whether the group is following
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  
  // Calculate time-based stagger delay (adjusted for reduced motion if needed)
  const effectiveStaggerDelay = shouldReduceMotion 
    ? Math.min(staggerDelay * 2, 100) // Increased delay for reduced motion
    : staggerDelay;
  
  // Calculate distance-based stagger (adjusted for reduced motion if needed)
  const effectiveStaggerDistance = shouldReduceMotion
    ? Math.min(staggerDistance * 0.5, 10) // Reduced distance for reduced motion
    : staggerDistance;
  
  // Renamed state variable from followers to followerStates
  const [followerStates, setFollowerStates] = useState<FollowerState[]>(() => {
    // Create physics config object
    const configObject = typeof physics === 'string'
      ? { ...InertialPresets[physics] }
      : { ...InertialPresets.SMOOTH, ...physics };
    
    if (shouldReduceMotion) {
      configObject.friction = Math.min(configObject.friction, 0.85);
    }
    
    // Explicitly define defaultConfig with all PointerFollowOptions + FollowerConfig defaults
    const defaultConfig: Required<PointerFollowOptions & FollowerConfig> = {
      behavior: behavior,
      physics: configObject, // Note: physics here might need adjustment if its type changed
      offset: { x: 0, y: 0 },
      maxDistance: maxDistance,
      enableRotation: true,
      maxRotation: 15,
      enableScaling: true,
      minScale: 0.9,
      maxScale: 1.1,
      followThreshold: 0,
      followDistance: 0,
      speedFactor: 1,
      alwaysFollow: alwaysFollow,
      respectReducedMotion: respectReducedMotion,
      originPosition: { x: 0, y: 0 },
      capturePointer: false,
      autoStart: true, // Assuming default based on usePointerFollow
      followingClassName: undefined, // Assuming default based on usePointerFollow
      onTransform: undefined, // Assuming default based on usePointerFollow
      onFollowStart: undefined, // Assuming default based on usePointerFollow
      onFollowEnd: undefined, // Assuming default based on usePointerFollow
      // FollowerConfig specific defaults
      delayFactor: 0,
      distanceFactor: 1,
      transformFn: undefined,
    };
    
    // Resolve the default physics config separately, asserting its type
    const resolvedDefaultPhysics: Partial<InertialConfig> = defaultConfig.physics as Partial<InertialConfig>;
    
    // Create array of followers with refs and controllers
    return Array.from({ length: count }, (_, index) => {
      const customConfig = options.followers?.[index] || {};
      
      // Resolve custom physics config inline
      const resolvedCustomPhysics = typeof customConfig.physics === 'string'
        ? InertialPresets[customConfig.physics] || InertialPresets.SMOOTH
        : customConfig.physics || {};

      // Deep merge configs
      const mergedConfig = {
        ...defaultConfig,
        ...customConfig,
        delayFactor: customConfig.delayFactor ?? (index / Math.max(1, count - 1)),
        distanceFactor: customConfig.distanceFactor ?? (1 - index * 0.1),
        offset: { ...defaultConfig.offset, ...customConfig.offset },
        // Merge physics objects using the pre-resolved default
        physics: {
          ...resolvedDefaultPhysics, // Use the pre-resolved object
          ...resolvedCustomPhysics
        } as Partial<InertialConfig>
      };

      const finalPhysicsConfig = mergedConfig.physics;

      const baseFriction = finalPhysicsConfig.friction ?? InertialPresets.SMOOTH.friction;
      const followerFriction = baseFriction + (mergedConfig.delayFactor * 0.05);
      
      const xController = new InertialMovement({
        ...finalPhysicsConfig,
        friction: followerFriction
      });
      
      const yController = new InertialMovement({
        ...finalPhysicsConfig,
        friction: followerFriction
      });
      
      return {
        ref: createRef<HTMLDivElement>(),
        transform: { ...DEFAULT_TRANSFORM },
        controllers: {
          x: xController,
          y: yController
        },
        // Cast the final mergedConfig here if needed, or adjust FollowerState['config'] type
        config: mergedConfig as Required<FollowerConfig>
      };
    });
  });
  
  // Animation frame reference
  const rafRef = useRef<number | null>(null);
  
  // Last update timestamp
  const lastUpdateRef = useRef<number>(0);
  
  // Store element origins
  const originPositionsRef = useRef<Vector2D[]>(
    Array(count).fill({ x: 0, y: 0 })
  );
  
  // Last pointer positions for velocity calculation
  const lastPointerRef = useRef<{ x: number, y: number, time: number }>({
    x: 0, y: 0, time: Date.now()
  });
  
  // Pointer velocity tracking
  const pointerVelocityRef = useRef<Vector2D>({ x: 0, y: 0 });
  
  // Track if any element has pointer over it
  const hasPointerOverRef = useRef<boolean>(false);
  
  // Initialize element origins
  useEffect(() => {
    // Get initial positions for all followers
    const newOrigins: Vector2D[] = Array(count).fill({ x: 0, y: 0 });
    
    followerStates.forEach((follower, index) => {
      if (follower.ref.current) {
        const rect = follower.ref.current.getBoundingClientRect();
        newOrigins[index] = {
          x: 0, // Relative to initial position
          y: 0
        };
      }
    });
    
    originPositionsRef.current = newOrigins;
    
    // Clean up animation frame on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [count]);
  
  // --- Callback Definitions (Ordered to resolve hoisting) ---

  // Start/Stop Following (Few dependencies)
  const startFollowing = useCallback(() => {
    if (!isFollowing) {
      setIsFollowing(true);
      if (onFollowStart) onFollowStart();
    }
  }, [isFollowing, onFollowStart]);

  // Forward declaration for resetPositions needed by stopFollowing
  const resetPositionsRef = useRef<() => void>();

  const stopFollowing = useCallback(() => {
    if (isFollowing) {
      setIsFollowing(false);
      resetPositionsRef.current?.(); // Call reset via ref
      if (onFollowEnd) onFollowEnd();
    }
  }, [isFollowing, onFollowEnd]);

  // Forward declaration for updateAnimation needed by startAnimation
  const updateAnimationRef = useRef<(timestamp: number) => void>();

  // Animation Loop Start (Depends on updateAnimation)
  const startAnimation = useCallback(() => {
    if (rafRef.current === null) {
      lastUpdateRef.current = performance.now();
      // Ensure updateAnimationRef.current is defined before calling requestAnimationFrame
      if (updateAnimationRef.current) {
        rafRef.current = requestAnimationFrame(updateAnimationRef.current);
      }
    }
  }, []); // Dependency will be handled via ref

  // Reset Positions (Depends on startAnimation)
  const resetPositions = useCallback(() => {
    const updatedFollowers = [...followerStates];
    updatedFollowers.forEach((follower, index) => {
      const origin = originPositionsRef.current[index] || { x: 0, y: 0 };
      const currentX = follower.controllers.x.getPosition();
      const currentY = follower.controllers.y.getPosition();
      const toOriginX = (origin.x - currentX) * (0.2 - index * 0.02);
      const toOriginY = (origin.y - currentY) * (0.2 - index * 0.02);
      follower.controllers.x.addVelocity(toOriginX);
      follower.controllers.y.addVelocity(toOriginY);
    });
    startAnimation();
  }, [followerStates, startAnimation]);

  // Update ref for resetPositions
  useEffect(() => {
    resetPositionsRef.current = resetPositions;
  }, [resetPositions]);

  // Animation Update (The core loop, depends on resetPositions via ref)
  const updateAnimation = useCallback((timestamp: number) => {
    const deltaTime = Math.min(0.064, (timestamp - lastUpdateRef.current) / 1000);
    lastUpdateRef.current = timestamp;
    if (deltaTime === 0) {
      rafRef.current = requestAnimationFrame(updateAnimationRef.current!); // Use ref
      return;
    }

    let allAtRest = true;
    const updatedFollowers = [...followerStates];
    const newTransforms = updatedFollowers.map((follower, index) => {
      // Update the follower's controllers
      const stateX = follower.controllers.x.update();
      const stateY = follower.controllers.y.update();
      
      // Get current position and velocity
      const x = stateX.position;
      const y = stateY.position;
      const vx = stateX.velocity;
      const vy = stateY.velocity;
      
      // Calculate if this follower is at rest
      const isAtRest = stateX.atRest && stateY.atRest;
      
      // Track if any follower is still moving
      if (!isAtRest) {
        allAtRest = false;
      }
      
      // Now update the next follower in the chain (if chain following is enabled)
      if (chainFollow && index < updatedFollowers.length - 1) {
        const nextFollower = updatedFollowers[index + 1];
        const nextDelayFactor = nextFollower.config.delayFactor;
        const nextDistanceFactor = nextFollower.config.distanceFactor;
        
        // Calculate target position for next follower
        // It follows this follower with delay and distance factors
        const targetX = x - (effectiveStaggerDistance * index * nextDistanceFactor);
        const targetY = y;
        
        // Get current position of next follower
        const currentX = nextFollower.controllers.x.getPosition();
        const currentY = nextFollower.controllers.y.getPosition();
        
        // Calculate blend factor based on delay
        const blendFactor = 0.1 * (1 - nextDelayFactor);
        
        // Set velocity based on distance to target
        const velX = (targetX - currentX) * blendFactor;
        const velY = (targetY - currentY) * blendFactor;
        
        // Update next follower's controllers
        nextFollower.controllers.x.set(currentX, velX);
        nextFollower.controllers.y.set(currentY, velY);
      }
      
      // Calculate rotation based on velocity if enabled
      let rotation = 0;
      if (follower.config.enableRotation) {
        // Calculate rotation based on velocity and direction
        const velocityMagnitude = Math.sqrt(vx * vx + vy * vy);
        const normalizedMagnitude = Math.min(1, velocityMagnitude / 20);
        
        // Calculate angle from velocity components
        const velocityAngle = Math.atan2(vy, vx) * (180 / Math.PI);
        
        // Scale rotation by magnitude and max rotation
        rotation = velocityAngle * normalizedMagnitude * (follower.config.maxRotation / 180);
        
        // Make rotation smoother with index (followers rotate less than leader)
        rotation *= Math.max(0.2, 1 - (index * 0.1));
        
        // Reduce motion if needed
        if (shouldReduceMotion) {
          rotation *= 0.3;
        }
      }
      
      // Calculate scale based on velocity if enabled
      let scale = 1;
      if (follower.config.enableScaling) {
        // Scale based on velocity magnitude
        const velocityMagnitude = Math.sqrt(vx * vx + vy * vy);
        const normalizedMagnitude = Math.min(1, velocityMagnitude / 30);
        
        // Interpolate scale between min and max values
        const scaleRange = follower.config.maxScale - follower.config.minScale;
        scale = follower.config.minScale + scaleRange * normalizedMagnitude;
        
        // Make scaling smoother with index (followers scale less than leader)
        scale = 1 + (scale - 1) * Math.max(0.3, 1 - (index * 0.15));
        
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
      
      // Calculate distance
      const distance = Math.sqrt(x * x + y * y);
      
      // Create transform
      let transform: FollowTransform = {
        x,
        y,
        rotation,
        scale,
        distance,
        isFollowing,
        direction,
        velocity: { x: vx, y: vy }
      };
      
      // Apply custom transform function if provided
      if (follower.config.transformFn) {
        transform = follower.config.transformFn(
          transform,
          index,
          updatedFollowers[0].transform // Access leader transform from updated array
        );
      }
      
      // Store the updated transform
      follower.transform = transform;
      
      return transform;
    });
    
    // Update followerStates state with new transforms
    setFollowerStates(updatedFollowers);
    
    // Continue animation if any follower is still moving
    if (!allAtRest) {
      rafRef.current = requestAnimationFrame(updateAnimationRef.current!); // Use ref
    } else {
      rafRef.current = null;
      
      // If all followers are at rest and pointer is not over any,
      // consider returning to origin
      if (!hasPointerOverRef.current && !alwaysFollow) {
        resetPositionsRef.current?.(); // Call reset via ref
      }
    }
  }, [
    alwaysFollow, 
    chainFollow, 
    effectiveStaggerDistance, 
    followerStates,
    isFollowing, 
    shouldReduceMotion,
    // No resetPositions dependency needed here due to ref usage
  ]);

  // Update ref for updateAnimation
  useEffect(() => {
    updateAnimationRef.current = updateAnimation;
  }, [updateAnimation]);

  // Pointer/Event Handlers (Depend on start/stop/animation functions)
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
    
    // Update the leader (first follower) using followerStates
    if (followerStates.length > 0) {
      const leader = followerStates[0];
      if (leader.ref.current) {
        const rect = leader.ref.current.getBoundingClientRect();
        const elementCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        
        // Calculate target position based on behavior
        let targetX = 0;
        let targetY = 0;
        
        switch (leader.config.behavior) {
          case 'direct':
            // Direct following
            targetX = pointerPos.x - elementCenter.x + leader.transform.x;
            targetY = pointerPos.y - elementCenter.y + leader.transform.y;
            break;
            
          case 'momentum':
          default:
            // Momentum following - natural physics motion
            const blendFactor = 0.85; // How much to blend
            targetX = ((pointerPos.x - elementCenter.x) * (1 - blendFactor) + 
                      leader.transform.x * blendFactor);
            targetY = ((pointerPos.y - elementCenter.y) * (1 - blendFactor) + 
                      leader.transform.y * blendFactor);
            break;
        }
        
        // Apply offset
        targetX += leader.config.offset.x;
        targetY += leader.config.offset.y;
        
        // Apply speed factor
        targetX *= leader.config.speedFactor;
        targetY *= leader.config.speedFactor;
        
        // Apply max distance constraint
        const targetDistance = Math.sqrt(targetX * targetX + targetY * targetY);
        if (targetDistance > leader.config.maxDistance) {
          const scale = leader.config.maxDistance / targetDistance;
          targetX *= scale;
          targetY *= scale;
        }
        
        // Update leader's controllers
        const currentX = leader.controllers.x.getPosition();
        const currentY = leader.controllers.y.getPosition();
        
        if (leader.config.behavior === 'momentum') {
          // For momentum behavior, we need to set new targets but keep existing velocity
          const vx = leader.controllers.x.getVelocity();
          const vy = leader.controllers.y.getVelocity();
          
          // Add some of the pointer's velocity to create more natural feel
          const newVx = vx * 0.92 + pointerVelocityRef.current.x * 0.08;
          const newVy = vy * 0.92 + pointerVelocityRef.current.y * 0.08;
          
          // Blend toward target position
          leader.controllers.x.set(
            currentX + (targetX - currentX) * 0.08, 
            newVx
          );
          
          leader.controllers.y.set(
            currentY + (targetY - currentY) * 0.08,
            newVy
          );
        } else {
          // For other behaviors, set target position with calculated velocity
          const velX = (targetX - currentX) * 0.2;
          const velY = (targetY - currentY) * 0.2;
          
          leader.controllers.x.set(currentX, velX);
          leader.controllers.y.set(currentY, velY);
        }
      }
    }
    
    // Start animation loop
    startAnimation(); // Now defined
  }, [followerStates, isFollowing, startAnimation]);

  const handlePointerEnter = useCallback(() => {
    hasPointerOverRef.current = true;
    if (alwaysFollow) {
      startFollowing(); // Now defined
    }
  }, [alwaysFollow, startFollowing]);
  
  const handlePointerLeave = useCallback(() => {
    hasPointerOverRef.current = false;
    if (!alwaysFollow) {
      setTimeout(() => {
        if (!hasPointerOverRef.current) {
          stopFollowing(); // Now defined
        }
      }, 100);
    }
  }, [alwaysFollow, stopFollowing]);

  // Apply Force (Depends on startAnimation)
  const applyForce = useCallback((force: Vector2D) => {
    if (followerStates.length > 0) { 
      const leader = followerStates[0];
      leader.controllers.x.addVelocity(force.x);
      leader.controllers.y.addVelocity(force.y);
      startAnimation(); // Now defined
    }
  }, [followerStates, startAnimation]);

  // Set up event listeners (Dependencies are correct now)
  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove);
    followerStates.forEach(follower => {
      const element = follower.ref.current;
      if (element) {
        element.addEventListener('pointerenter', handlePointerEnter);
        element.addEventListener('pointerleave', handlePointerLeave);
      }
    });
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      followerStates.forEach(follower => {
        const element = follower.ref.current;
        if (element) {
          element.removeEventListener('pointerenter', handlePointerEnter);
          element.removeEventListener('pointerleave', handlePointerLeave);
        }
      });
    };
  }, [followerStates, handlePointerEnter, handlePointerLeave, handlePointerMove]);

  // Extract refs and transforms for return value
  const refs = followerStates.map(f => f.ref);
  const transforms = followerStates.map(f => f.transform);
  
  return {
    refs,
    transforms,
    isFollowing,
    startFollowing,
    stopFollowing,
    applyForce,
    resetPositions
  };
}

export default usePointerFollowGroup;