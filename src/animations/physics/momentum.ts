/**
 * Momentum-based interactions system
 * Provides realistic physics for gesture-driven interfaces
 */

import { InertialMovement, InertialConfig } from './inertialMovement';

/**
 * Types of momentum interactions
 */
export enum MomentumInteractionType {
  SWIPE = 'swipe',
  DRAG = 'drag',
  SCROLL = 'scroll',
  THROW = 'throw',
  FLICK = 'flick'
}

/**
 * Direction of momentum
 */
export enum MomentumDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  BOTH = 'both'
}

/**
 * Configuration for momentum interactions
 */
export interface MomentumConfig extends Partial<InertialConfig> {
  /**
   * Type of interaction
   */
  type: MomentumInteractionType;
  
  /**
   * Direction for momentum
   */
  direction: MomentumDirection;
  
  /**
   * Multiplier for amplifying or reducing input velocity (default: 1.0)
   */
  velocityMultiplier?: number;
  
  /**
   * Velocity scaling factor for small/short gestures (default: 1.5)
   * Helps short movements still feel responsive
   */
  smallGestureMultiplier?: number;
  
  /**
   * Minimum velocity required to trigger momentum (default: 1.0)
   */
  minimumVelocity?: number;
  
  /**
   * Minimum gesture distance to trigger momentum (default: 10)
   */
  minimumDistance?: number;
  
  /**
   * Maximum velocity cap (default: 100)
   */
  maxVelocity?: number;
  
  /**
   * Whether to scale velocity based on gesture duration (default: true)
   * Shorter gestures will have more velocity
   */
  durationScaling?: boolean;
  
  /**
   * Enable axis locking to primary direction (default: false)
   */
  axisLock?: boolean;
  
  /**
   * Enable rubber-banding for overscroll (default: false)
   */
  rubberBand?: boolean;
  
  /**
   * Rubber band tension factor (default: 0.5)
   * Lower = more stretchy
   */
  rubberBandTension?: number;
}

// Default configuration
const DEFAULT_MOMENTUM_CONFIG: MomentumConfig = {
  type: MomentumInteractionType.SWIPE,
  direction: MomentumDirection.HORIZONTAL,
  friction: 0.92,
  velocityMultiplier: 1.0,
  smallGestureMultiplier: 1.5,
  minimumVelocity: 1.0,
  minimumDistance: 10,
  maxVelocity: 100,
  durationScaling: true,
  axisLock: false,
  rubberBand: false,
  rubberBandTension: 0.5,
  bounceFactor: 0.2
};

/**
 * Momentum gesture data
 */
export interface MomentumGesture {
  // Start position
  startX: number;
  startY: number;
  
  // Current position
  currentX: number;
  currentY: number;
  
  // Total distance moved
  deltaX: number;
  deltaY: number;
  
  // Velocity
  velocityX: number;
  velocityY: number;
  
  // Timing
  startTime: number;
  currentTime: number;
  duration: number;
}

/**
 * Momentum result after processing gesture
 */
export interface MomentumResult {
  // Resulting velocity to apply
  velocityX: number;
  velocityY: number;
  
  // Primary direction of movement
  primaryDirection: 'x' | 'y' | null;
  
  // Distance moved
  distance: number;
  
  // Whether the movement passed threshold to trigger momentum
  shouldAnimate: boolean;
}

/**
 * Momentum interaction controller
 */
export class MomentumInteraction {
  private config: Required<MomentumConfig>;
  private gesture: MomentumGesture | null = null;
  private velocityTracker: Array<{ time: number, x: number, y: number }> = [];
  private horizontalMovement: InertialMovement;
  private verticalMovement: InertialMovement;
  
  /**
   * Creates a new momentum interaction
   */
  constructor(config: Partial<MomentumConfig> = {}) {
    // Merge with defaults
    this.config = {
      ...DEFAULT_MOMENTUM_CONFIG,
      ...config
    } as Required<MomentumConfig>;
    
    // Create inertial controllers
    this.horizontalMovement = new InertialMovement({
      friction: this.config.friction,
      restThreshold: this.config.restThreshold,
      maxVelocity: this.config.maxVelocity,
      bounds: this.config.bounds,
      bounceFactor: this.config.bounceFactor
    });
    
    this.verticalMovement = new InertialMovement({
      friction: this.config.friction,
      restThreshold: this.config.restThreshold,
      maxVelocity: this.config.maxVelocity,
      bounds: this.config.bounds,
      bounceFactor: this.config.bounceFactor
    });
  }
  
  /**
   * Start tracking a gesture
   * @param x Initial X position
   * @param y Initial Y position
   */
  public start(x: number, y: number): void {
    const now = Date.now();
    
    this.gesture = {
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      startTime: now,
      currentTime: now,
      duration: 0
    };
    
    this.velocityTracker = [{ time: now, x, y }];
  }
  
  /**
   * Update gesture with new position
   * @param x Current X position
   * @param y Current Y position
   */
  public update(x: number, y: number): void {
    if (!this.gesture) return;
    
    const now = Date.now();
    
    // Update gesture data
    this.gesture.currentX = x;
    this.gesture.currentY = y;
    this.gesture.deltaX = x - this.gesture.startX;
    this.gesture.deltaY = y - this.gesture.startY;
    this.gesture.currentTime = now;
    this.gesture.duration = now - this.gesture.startTime;
    
    // Add to velocity tracker (capped at 5 points)
    this.velocityTracker.push({ time: now, x, y });
    if (this.velocityTracker.length > 5) {
      this.velocityTracker.shift();
    }
    
    // Calculate current velocity
    this.updateVelocity();
  }
  
  /**
   * End the gesture and calculate momentum
   */
  public end(): MomentumResult {
    if (!this.gesture) {
      return {
        velocityX: 0,
        velocityY: 0,
        primaryDirection: null,
        distance: 0,
        shouldAnimate: false
      };
    }
    
    // Calculate final velocity
    this.updateVelocity();
    
    // Apply velocity multiplier
    let velocityX = this.gesture.velocityX * this.config.velocityMultiplier;
    let velocityY = this.gesture.velocityY * this.config.velocityMultiplier;
    
    // Apply small gesture multiplier if gesture is short but fast
    const distance = Math.sqrt(
      this.gesture.deltaX * this.gesture.deltaX + 
      this.gesture.deltaY * this.gesture.deltaY
    );
    
    if (distance < this.config.minimumDistance && this.gesture.duration < 300) {
      velocityX *= this.config.smallGestureMultiplier;
      velocityY *= this.config.smallGestureMultiplier;
    }
    
    // Duration scaling - shorter gestures get more velocity
    if (this.config.durationScaling && this.gesture.duration > 0) {
      const durationFactor = Math.max(0.5, Math.min(1, 300 / this.gesture.duration));
      velocityX *= durationFactor;
      velocityY *= durationFactor;
    }
    
    // Apply direction constraints
    if (this.config.direction === MomentumDirection.HORIZONTAL) {
      velocityY = 0;
    } else if (this.config.direction === MomentumDirection.VERTICAL) {
      velocityX = 0;
    }
    
    // Determine primary direction
    const absX = Math.abs(velocityX);
    const absY = Math.abs(velocityY);
    let primaryDirection: 'x' | 'y' | null = null;
    
    if (absX > absY) {
      primaryDirection = 'x';
      if (this.config.axisLock) {
        velocityY = 0;
      }
    } else if (absY > absX) {
      primaryDirection = 'y';
      if (this.config.axisLock) {
        velocityX = 0;
      }
    }
    
    // Check if the movement should trigger momentum animation
    const absVelocity = Math.max(absX, absY);
    const shouldAnimate = 
      absVelocity >= this.config.minimumVelocity && 
      distance >= this.config.minimumDistance;
    
    // Cap velocity
    velocityX = Math.max(-this.config.maxVelocity, Math.min(this.config.maxVelocity, velocityX));
    velocityY = Math.max(-this.config.maxVelocity, Math.min(this.config.maxVelocity, velocityY));
    
    // Clear state
    const result: MomentumResult = {
      velocityX,
      velocityY,
      primaryDirection,
      distance,
      shouldAnimate
    };
    
    this.gesture = null;
    this.velocityTracker = [];
    
    return result;
  }
  
  /**
   * Calculate current velocity based on tracked points
   */
  private updateVelocity(): void {
    if (!this.gesture || this.velocityTracker.length < 2) return;
    
    // Get last two points for velocity calculation
    const length = this.velocityTracker.length;
    const current = this.velocityTracker[length - 1];
    const previous = this.velocityTracker[length - 2];
    
    // Calculate time difference in seconds
    const timeDelta = (current.time - previous.time) / 1000;
    if (timeDelta <= 0) return;
    
    // Calculate instant velocity
    const velocityX = (current.x - previous.x) / timeDelta;
    const velocityY = (current.y - previous.y) / timeDelta;
    
    // Apply some smoothing with previous velocity
    if (this.gesture.velocityX !== 0 || this.gesture.velocityY !== 0) {
      this.gesture.velocityX = 0.7 * velocityX + 0.3 * this.gesture.velocityX;
      this.gesture.velocityY = 0.7 * velocityY + 0.3 * this.gesture.velocityY;
    } else {
      this.gesture.velocityX = velocityX;
      this.gesture.velocityY = velocityY;
    }
  }
  
  /**
   * Apply momentum result to the inertial controllers
   * @param result Momentum result
   * @param currentX Current X position
   * @param currentY Current Y position
   */
  public applyMomentum(result: MomentumResult, currentX: number, currentY: number): void {
    this.horizontalMovement.set(currentX, result.velocityX);
    this.verticalMovement.set(currentY, result.velocityY);
  }
  
  /**
   * Update the momentum movement for a single frame
   * @returns Current position and movement status
   */
  public update2D(): { x: number; y: number; moving: boolean } {
    const horizontalState = this.horizontalMovement.update();
    const verticalState = this.verticalMovement.update();
    
    return {
      x: horizontalState.position,
      y: verticalState.position,
      moving: !horizontalState.atRest || !verticalState.atRest
    };
  }
  
  /**
   * Check if the momentum is still active
   */
  public isMoving(): boolean {
    return !this.horizontalMovement.isAtRest() || !this.verticalMovement.isAtRest();
  }
  
  /**
   * Stop all momentum immediately
   */
  public stop(): void {
    this.horizontalMovement.stop();
    this.verticalMovement.stop();
  }
  
  /**
   * Reset momentum to specific position
   */
  public reset(x = 0, y = 0): void {
    this.horizontalMovement.reset(x);
    this.verticalMovement.reset(y);
  }
  
  /**
   * Update the configuration
   */
  public updateConfig(config: Partial<MomentumConfig>): void {
    this.config = {
      ...this.config,
      ...config
    } as Required<MomentumConfig>;
    
    // Update inertial controllers
    const inertialConfig: Partial<InertialConfig> = {
      friction: this.config.friction,
      restThreshold: this.config.restThreshold,
      maxVelocity: this.config.maxVelocity,
      bounds: this.config.bounds,
      bounceFactor: this.config.bounceFactor
    };
    
    this.horizontalMovement.updateConfig(inertialConfig);
    this.verticalMovement.updateConfig(inertialConfig);
  }
}

/**
 * Create a new momentum interaction
 * @param config Configuration options
 * @returns Momentum interaction controller
 */
export function createMomentumInteraction(
  config?: Partial<MomentumConfig>
): MomentumInteraction {
  return new MomentumInteraction(config);
} 