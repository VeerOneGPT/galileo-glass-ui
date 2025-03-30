/**
 * Vector-based Spring physics implementation
 * Adapts springPhysics.ts to work with 3D vectors.
 */

import { SpringConfig, SpringPresets } from './springPhysics'; // Reuse config and presets

// Type for 3D Vector
export type Vector3D = { x: number; y: number; z: number };

/**
 * Vector Spring physics state
 */
interface SpringVectorState {
  position: Vector3D;
  velocity: Vector3D;
  atRest: boolean;
}

/**
 * Vector-based Spring animation calculation controller
 */
export class SpringPhysicsVector {
  private config: Required<SpringConfig>;
  private state: SpringVectorState;
  private targetValue: Vector3D;
  private frameRate: number;
  private dimensions: ('x' | 'y' | 'z')[];

  /**
   * Creates a new vector spring physics controller
   * @param config Spring configuration
   * @param initialValue Initial position vector
   */
  constructor(config: Partial<SpringConfig> = {}, initialValue: Partial<Vector3D> = {}) {
    this.config = {
      tension: config.tension ?? SpringPresets.DEFAULT.tension,
      friction: config.friction ?? SpringPresets.DEFAULT.friction,
      mass: config.mass ?? SpringPresets.DEFAULT.mass,
      restThreshold: config.restThreshold ?? 0.01,
      initialVelocity: config.initialVelocity ?? 0, // Applied per dimension if needed
      clamp: config.clamp ?? false,
    };

    const initialPos = { x: 0, y: 0, z: 0, ...initialValue };
    // Use initialVelocity from config for each dimension
    const initialVel = { 
        x: this.config.initialVelocity, 
        y: this.config.initialVelocity, 
        z: this.config.initialVelocity 
    };

    this.state = {
      position: initialPos,
      velocity: initialVel,
      atRest: false,
    };

    this.targetValue = { ...initialPos };
    this.frameRate = 1 / 60; // Default 60fps
    this.dimensions = ['x', 'y', 'z'];
  }

  public updateConfig(config: Partial<SpringConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Sets the target value for the vector spring
   * @param to Target vector
   * @param options Optional parameters like initial position/velocity
   */
  public setTarget(to: Partial<Vector3D>, options?: { from?: Partial<Vector3D>, velocity?: Partial<Vector3D> }): void {
    if (options?.from) {
      this.state.position = { ...this.state.position, ...options.from };
    }
    if (options?.velocity) {
      this.state.velocity = { ...this.state.velocity, ...options.velocity };
    }

    this.targetValue = { ...this.targetValue, ...to };
    this.state.atRest = false; // Assume not at rest when target changes
  }

  public setFrameRate(fps: number): void {
    this.frameRate = 1 / fps;
  }

  /**
   * Updates the vector spring physics for a single frame
   * @returns Current spring state
   */
  public update(): SpringVectorState {
    if (this.state.atRest) {
      return { ...this.state };
    }

    let isMoving = false;
    const nextState: SpringVectorState = {
        position: { ...this.state.position },
        velocity: { ...this.state.velocity },
        atRest: true // Assume at rest initially for this frame
    };

    // Calculate physics independently for each dimension
    for (const dim of this.dimensions) {
      const displacement = this.state.position[dim] - this.targetValue[dim];
      const springForce = -this.config.tension * displacement;
      const dampingForce = -this.config.friction * this.state.velocity[dim];
      const totalForce = springForce + dampingForce;
      const acceleration = totalForce / this.config.mass;
      const newVelocity = this.state.velocity[dim] + acceleration * this.frameRate;
      const newPosition = this.state.position[dim] + newVelocity * this.frameRate;

      const isDimensionAtRest = 
        Math.abs(newVelocity) < this.config.restThreshold && 
        Math.abs(newPosition - this.targetValue[dim]) < this.config.restThreshold;

      nextState.position[dim] = newPosition; // Update position first
      nextState.velocity[dim] = isDimensionAtRest ? 0 : newVelocity;
        
      if (!isDimensionAtRest) {
          nextState.atRest = false; // If any dimension is moving, the whole vector is not at rest
          isMoving = true;
      }

      // Apply clamping if configured (per dimension)
      if (this.config.clamp) {
        // Need original position for clamping range calculation
        // This clamping logic might need refinement for vectors
        const initialPositionForDim = this.targetValue[dim]; // Assuming target is the 'other' end for clamp range
        const currentPositionForDim = this.state.position[dim]; 
        const min = Math.min(initialPositionForDim, currentPositionForDim);
        const max = Math.max(initialPositionForDim, currentPositionForDim);
        nextState.position[dim] = Math.min(Math.max(nextState.position[dim], min), max);
      }
    }

    this.state = nextState;
    return { ...this.state };
  }
  
  public reset(position: Partial<Vector3D> = {}, velocity: Partial<Vector3D> = {}): void {
    const initialPos = { x: 0, y: 0, z: 0, ...position };
    const initialVel = { x: 0, y: 0, z: 0, ...velocity };
    this.state = {
      position: initialPos,
      velocity: initialVel,
      atRest: false, 
    };
    this.targetValue = { ...initialPos };
  }

  public getState(): SpringVectorState {
    return { ...this.state };
  }

  public isAtRest(): boolean {
    // Recalculate atRest status based on current velocity/position thresholds
    for (const dim of this.dimensions) {
        if (Math.abs(this.state.velocity[dim]) >= this.config.restThreshold || 
            Math.abs(this.state.position[dim] - this.targetValue[dim]) >= this.config.restThreshold) {
            return false;
        }
    }
    // Update state if it truly came to rest
    if (!this.state.atRest) {
        this.state.atRest = true;
        // Zero out velocity explicitly when coming to rest
        this.state.velocity = { x: 0, y: 0, z: 0 };
    }
    return true;
  }

  public getCurrentValue(): Vector3D {
    return { ...this.state.position };
  }
}

/**
 * Creates a new vector spring animator
 */
export const createVectorSpring = (
    config?: Partial<SpringConfig>,
    initialValue?: Partial<Vector3D>
): SpringPhysicsVector => {
  return new SpringPhysicsVector(config, initialValue);
}; 