/**
 * Inertial movement physics implementation
 * Simulates momentum and friction for natural motion
 */

/**
 * Configuration options for inertial movement
 */
export interface InertialConfig {
  /**
   * Deceleration rate (0-1)
   * Lower values cause faster deceleration (default: 0.95)
   */
  friction: number;
  
  /**
   * Minimum velocity threshold before coming to rest (default: 0.1)
   */
  restThreshold?: number;
  
  /**
   * Maximum velocity limit (default: 1000)
   */
  maxVelocity?: number;
  
  /**
   * Boundary constraints
   */
  bounds?: {
    min?: number;
    max?: number;
  };
  
  /**
   * Bounciness factor when hitting boundaries (0-1)
   * 0 = no bounce, 1 = perfect bounce (default: 0.2)
   */
  bounceFactor?: number;
}

/**
 * Default inertial configurations
 */
export const InertialPresets = {
  // Standard inertia with moderate friction
  DEFAULT: { friction: 0.95, restThreshold: 0.1, bounceFactor: 0.2 },
  
  // Fast decay for quick stopping
  QUICK: { friction: 0.85, restThreshold: 0.5, bounceFactor: 0.1 },
  
  // Slow decay for longer movement
  SMOOTH: { friction: 0.98, restThreshold: 0.05, bounceFactor: 0.3 },
  
  // Heavy resistance (like moving through water)
  HEAVY: { friction: 0.8, restThreshold: 1.0, bounceFactor: 0.1 },
  
  // Bouncy behavior when hitting edges
  BOUNCY: { friction: 0.95, restThreshold: 0.1, bounceFactor: 0.8 },
  
  // No bounce on edges
  CLAMP: { friction: 0.92, restThreshold: 0.1, bounceFactor: 0 }
};

/**
 * State of an inertial motion
 */
interface InertialState {
  position: number;
  velocity: number;
  atRest: boolean;
}

/**
 * Inertial movement physics controller
 */
export class InertialMovement {
  private config: Required<InertialConfig>;
  private state: InertialState;
  private frameRate: number;
  
  /**
   * Creates a new inertial movement controller
   * @param config Configuration options
   */
  constructor(config: Partial<InertialConfig> = {}) {
    // Merge with defaults
    this.config = {
      friction: config.friction ?? InertialPresets.DEFAULT.friction,
      restThreshold: config.restThreshold ?? InertialPresets.DEFAULT.restThreshold,
      maxVelocity: config.maxVelocity ?? 1000,
      bounds: config.bounds ?? {},
      bounceFactor: config.bounceFactor ?? InertialPresets.DEFAULT.bounceFactor
    };
    
    this.state = {
      position: 0,
      velocity: 0,
      atRest: true
    };
    
    this.frameRate = 1 / 60; // Default 60fps
  }
  
  /**
   * Updates the configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<InertialConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
  
  /**
   * Sets the frame rate for calculations
   * @param fps Frames per second
   */
  public setFrameRate(fps: number): void {
    this.frameRate = 1 / fps;
  }
  
  /**
   * Sets the position and velocity
   * @param position New position
   * @param velocity New velocity
   */
  public set(position: number, velocity: number): void {
    // Enforce velocity limits
    const clampedVelocity = Math.max(
      -this.config.maxVelocity,
      Math.min(this.config.maxVelocity, velocity)
    );
    
    this.state = {
      position,
      velocity: clampedVelocity,
      atRest: Math.abs(clampedVelocity) < this.config.restThreshold
    };
  }
  
  /**
   * Adds velocity to the movement
   * @param velocity Velocity to add
   */
  public addVelocity(velocity: number): void {
    if (this.state.atRest) {
      this.state.atRest = false;
    }
    
    const newVelocity = this.state.velocity + velocity;
    
    // Enforce velocity limits
    this.state.velocity = Math.max(
      -this.config.maxVelocity,
      Math.min(this.config.maxVelocity, newVelocity)
    );
  }
  
  /**
   * Updates the inertial movement for a single frame
   * @returns Updated state
   */
  public update(): InertialState {
    if (this.state.atRest) {
      return { ...this.state };
    }
    
    // Apply friction to velocity
    const decayedVelocity = this.state.velocity * this.config.friction;
    
    // Calculate new position
    let newPosition = this.state.position + decayedVelocity * this.frameRate;
    let newVelocity = decayedVelocity;
    
    // Handle boundary constraints if set
    if (this.config.bounds) {
      const { min, max } = this.config.bounds;
      
      // Check min boundary
      if (min !== undefined && newPosition < min) {
        // Apply bounce
        const overshoot = min - newPosition;
        newPosition = min + overshoot * this.config.bounceFactor;
        newVelocity = -decayedVelocity * this.config.bounceFactor;
      }
      
      // Check max boundary
      if (max !== undefined && newPosition > max) {
        // Apply bounce
        const overshoot = newPosition - max;
        newPosition = max - overshoot * this.config.bounceFactor;
        newVelocity = -decayedVelocity * this.config.bounceFactor;
      }
    }
    
    // Check if at rest
    const isAtRest = Math.abs(newVelocity) < this.config.restThreshold;
    
    // Final position snapping for bounds when almost at rest
    if (isAtRest && this.config.bounds) {
      const { min, max } = this.config.bounds;
      
      if (min !== undefined && newPosition < min) {
        newPosition = min;
        newVelocity = 0;
      }
      
      if (max !== undefined && newPosition > max) {
        newPosition = max;
        newVelocity = 0;
      }
    }
    
    // Update state
    this.state = {
      position: newPosition,
      velocity: isAtRest ? 0 : newVelocity,
      atRest: isAtRest
    };
    
    return { ...this.state };
  }
  
  /**
   * Immediately stops the motion
   */
  public stop(): void {
    this.state.velocity = 0;
    this.state.atRest = true;
  }
  
  /**
   * Reset to a specific position with no velocity
   * @param position Position to reset to
   */
  public reset(position = 0): void {
    this.state = {
      position,
      velocity: 0,
      atRest: true
    };
  }
  
  /**
   * Gets the current state
   */
  public getState(): InertialState {
    return { ...this.state };
  }
  
  /**
   * Gets the current position
   */
  public getPosition(): number {
    return this.state.position;
  }
  
  /**
   * Gets the current velocity
   */
  public getVelocity(): number {
    return this.state.velocity;
  }
  
  /**
   * Checks if the movement is at rest
   */
  public isAtRest(): boolean {
    return this.state.atRest;
  }
}

/**
 * Creates a new inertial movement controller
 * @param config Configuration options
 * @returns Inertial movement controller
 */
export function createInertialMovement(
  config?: Partial<InertialConfig>
): InertialMovement {
  return new InertialMovement(config);
}

// Export as inertialMovement for backward compatibility
export const inertialMovement = { createInertialMovement };