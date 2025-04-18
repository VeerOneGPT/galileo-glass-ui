/**
 * Spring physics implementation for animation system
 * Provides configurable spring parameters for realistic motion
 */

// Export an object for compatibility with imports
export const springPhysics = {};

/**
 * Spring configuration options
 */
export interface SpringConfig {
  /**
   * Spring stiffness - how rigid the spring is (default: 170)
   * Higher values create more rigid/snappy animations
   */
  tension: number;
  
  /**
   * Friction coefficient - how quickly the spring loses energy (default: 26)
   * Higher values create more damping, reducing oscillation
   */
  friction: number;
  
  /**
   * Mass of the object attached to the spring (default: 1)
   * Higher values create more inertia, slowing animations but increasing momentum
   */
  mass: number;
  
  /**
   * Precision threshold for considering the spring at rest (default: 0.01)
   */
  restThreshold?: number;
  
  /**
   * Initial velocity of the spring (default: 0)
   */
  initialVelocity?: number;
  
  /**
   * Whether to clamp the output to prevent values outside the from-to range
   * Useful for preventing overshoot when needed (default: false)
   */
  clamp?: boolean;
}

/**
 * Default spring configurations
 */
export const SpringPresets = {
  DEFAULT: { tension: 170, friction: 26, mass: 1 },
  GENTLE: { tension: 120, friction: 14, mass: 1 },
  WOBBLY: { tension: 180, friction: 12, mass: 1 },
  STIFF: { tension: 210, friction: 20, mass: 1 },
  SLOW: { tension: 80, friction: 20, mass: 1 },
  MASSIVE: { tension: 190, friction: 30, mass: 3 },
  RESPONSIVE: { tension: 300, friction: 25, mass: 1 },
  SNAPPY: { tension: 400, friction: 22, mass: 1 },
  BOUNCY: { tension: 150, friction: 10, mass: 1 },
  HEAVY: { tension: 250, friction: 35, mass: 2 },
  REDUCED_MOTION: { tension: 170, friction: 40, mass: 1 }, // Example reduced motion preset
  // --- Standard UI Interaction Presets ---
  HOVER_QUICK: { tension: 350, friction: 25, mass: 1 },       // For quick hover effects
  FOCUS_HIGHLIGHT: { tension: 250, friction: 28, mass: 1 }, // For focus rings/indicators
  PRESS_FEEDBACK: { tension: 500, friction: 30, mass: 1 },      // For button press feedback
  MODAL_TRANSITION: { tension: 200, friction: 22, mass: 1 }, // For modal/dialog entrance/exit
  MENU_POPOVER: { tension: 280, friction: 24, mass: 1 },     // For menu/popover transitions
  NOTIFICATION_SLIDE: { tension: 220, friction: 26, mass: 1 }, // For notification slides
};

// Type alias for preset names
export type SpringPresetName = keyof typeof SpringPresets;

// Common Default Configurations
export const DefaultSprings = {
  DEFAULT: SpringPresets.DEFAULT,
  GENTLE: SpringPresets.GENTLE,
  HOVER_QUICK: { tension: 300, friction: 20, mass: 1 },
  MODAL_TRANSITION: { tension: 250, friction: 25, mass: 1 },
  STIFF: SpringPresets.STIFF,
};

/**
 * Spring physics state
 */
interface SpringState {
  // Current position of the spring
  position: number;
  
  // Current velocity of the spring
  velocity: number;
  
  // Flag indicating if the spring is considered at rest
  atRest: boolean;
}

/**
 * Spring animation calculation controller
 */
export class SpringPhysics {
  private config: Required<SpringConfig>;
  private state: SpringState;
  private targetValue: number;
  private frameRate: number;
  
  /**
   * Creates a new spring physics controller
   * @param config Spring configuration
   */
  constructor(config: Partial<SpringConfig> = {}) {
    // Merge provided config with defaults
    this.config = {
      tension: config.tension ?? SpringPresets.DEFAULT.tension,
      friction: config.friction ?? SpringPresets.DEFAULT.friction,
      mass: config.mass ?? SpringPresets.DEFAULT.mass,
      restThreshold: config.restThreshold ?? 0.01,
      initialVelocity: config.initialVelocity ?? 0,
      clamp: config.clamp ?? false
    };
    
    this.state = {
      position: 0,
      velocity: this.config.initialVelocity,
      atRest: false
    };
    
    this.targetValue = 0;
    this.frameRate = 1 / 60; // Assuming 60fps as default
  }
  
  /**
   * Gets the current configuration of the spring
   */
  public getConfig(): Required<SpringConfig> {
    return { ...this.config };
  }
  
  /**
   * Updates the spring config
   * @param config New spring configuration
   */
  public updateConfig(config: Partial<SpringConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
  
  /**
   * Sets the target value for the spring
   * @param to Target value
   * @param options Optional parameters
   */
  public setTarget(to: number, options?: { from?: number, velocity?: number }): void {
    if (options?.from !== undefined) {
      this.state.position = options.from;
    }
    
    if (options?.velocity !== undefined) {
      this.state.velocity = options.velocity;
    }
    
    this.targetValue = to;
    this.state.atRest = false;
  }
  
  /**
   * Sets the frame rate for the physics calculation
   * @param fps Frames per second
   */
  public setFrameRate(fps: number): void {
    this.frameRate = 1 / fps;
  }
  
  /**
   * Updates the spring physics for a single frame
   * @returns Current spring state
   */
  public update(): SpringState {
    if (this.state.atRest) {
      return { ...this.state };
    }
    
    // Calculate spring force using Hooke's law: F = -k * x
    // Where k is the spring constant (tension) and x is the displacement
    const displacement = this.state.position - this.targetValue;
    const springForce = -this.config.tension * displacement;
    
    // Calculate damping force: F = -c * v
    // Where c is the damping coefficient (friction) and v is the velocity
    const dampingForce = -this.config.friction * this.state.velocity;
    
    // Calculate acceleration: a = F / m
    // Where F is the total force and m is the mass
    const totalForce = springForce + dampingForce;
    const acceleration = totalForce / this.config.mass;
    
    // Calculate new velocity: v = v0 + a * t
    const newVelocity = this.state.velocity + acceleration * this.frameRate;
    
    // Calculate new position: p = p0 + v * t
    const newPosition = this.state.position + newVelocity * this.frameRate;
    
    // Determine if spring is at rest
    const isAtRest = 
      Math.abs(newVelocity) < this.config.restThreshold && 
      Math.abs(newPosition - this.targetValue) < this.config.restThreshold;
    
    // Apply clamping if configured
    let clampedPosition = newPosition;
    if (this.config.clamp) {
      const min = Math.min(0, this.targetValue);
      const max = Math.max(0, this.targetValue);
      clampedPosition = Math.min(Math.max(newPosition, min), max);
    }
    
    // Update state
    this.state = {
      position: clampedPosition,
      velocity: isAtRest ? 0 : newVelocity,
      atRest: isAtRest
    };
    
    return { ...this.state };
  }
  
  /**
   * Reset the spring to its initial state
   * @param position Initial position
   * @param velocity Initial velocity
   */
  public reset(position = 0, velocity = 0): void {
    this.state = {
      position,
      velocity,
      atRest: false
    };
    this.targetValue = position;
  }
  
  /**
   * Get the current state of the spring
   */
  public getState(): SpringState {
    return { ...this.state };
  }
  
  /**
   * Checks if the spring is at rest
   */
  public isAtRest(): boolean {
    return this.state.atRest;
  }
  
  /**
   * Gets the current position of the spring
   */
  public getCurrentValue(): number {
    return this.state.position;
  }
}

/**
 * Creates a new spring animator with the given configuration
 * Helper function for easier creation
 */
export const createSpring = (config?: Partial<SpringConfig>): SpringPhysics => {
  return new SpringPhysics(config);
};

/**
 * Utility to convert typical spring parameters from other libraries
 * @param stiffness Stiffness parameter (e.g. from react-spring)
 * @param damping Damping parameter (e.g. from react-spring)
 * @param mass Mass parameter
 * @returns Equivalent SpringConfig
 */
export const convertSpringParams = (
  stiffness: number, 
  damping: number, 
  mass = 1
): SpringConfig => {
  return {
    tension: stiffness,
    friction: damping,
    mass: mass
  };
}; 