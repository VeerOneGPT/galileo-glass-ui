import { SpringPhysics, SpringConfig, SpringPresets } from './springPhysics';

/**
 * Vector object to be animated
 */
export interface SpringVector {
  [key: string]: number;
}

/**
 * Target configuration for a spring animation
 */
export interface SpringTarget<T extends SpringVector> {
  to: T;
  from?: T;
  velocity?: Partial<T>;
}

/**
 * Multi-spring animation system for animating vectors and objects
 */
export class MultiSpring<T extends SpringVector> {
  private springs: Map<keyof T, SpringPhysics> = new Map();
  private values: T;
  private targets: T;
  private config: Partial<SpringConfig>;
  private frameRate: number = 1/60;
  private atRest = true;
  
  /**
   * Creates a new multi-spring system
   * @param initial Initial vector values
   * @param config Spring configuration
   */
  constructor(initial: T, config: Partial<SpringConfig> | keyof typeof SpringPresets = 'DEFAULT') {
    this.values = { ...initial };
    this.targets = { ...initial };
    
    // Resolve spring configuration
    this.config = typeof config === 'string' ? SpringPresets[config] : config;
    
    // Create springs for each property
    Object.keys(initial).forEach((key) => {
      const spring = new SpringPhysics({
        ...this.config,
        initialVelocity: 0
      });
      
      spring.setTarget(initial[key]);
      this.springs.set(key as keyof T, spring);
    });
  }
  
  /**
   * Updates the spring configuration
   * @param config New spring configuration
   */
  public updateConfig(config: Partial<SpringConfig> | keyof typeof SpringPresets): void {
    // Resolve configuration
    const newConfig = typeof config === 'string' ? SpringPresets[config] : config;
    this.config = { ...this.config, ...newConfig };
    
    // Update all springs
    this.springs.forEach(spring => {
      spring.updateConfig(this.config);
    });
  }
  
  /**
   * Sets the target values for the spring system
   * @param target Target configuration
   */
  public setTarget(target: SpringTarget<T>): void {
    const { to, from, velocity } = target;
    
    // Set targets for each property
    Object.keys(to).forEach((key) => {
      const spring = this.springs.get(key as keyof T);
      if (spring) {
        const fromValue = from ? from[key as keyof T] : undefined;
        const velocityValue = velocity ? velocity[key as keyof T] : undefined;
        
        spring.setTarget(to[key as keyof T], {
          from: fromValue,
          velocity: velocityValue
        });
        
        this.targets[key as keyof T] = to[key as keyof T];
      }
    });
    
    this.atRest = false;
  }
  
  /**
   * Sets the frame rate for the physics calculation
   * @param fps Frames per second
   */
  public setFrameRate(fps: number): void {
    this.frameRate = 1 / fps;
    this.springs.forEach(spring => {
      spring.setFrameRate(fps);
    });
  }
  
  /**
   * Updates the spring system for a single frame
   * @returns Current vector values
   */
  public update(): T {
    if (this.atRest) {
      return { ...this.values };
    }
    
    let allAtRest = true;
    
    // Update each spring
    this.springs.forEach((spring, key) => {
      const state = spring.update();
      this.values[key] = state.position as T[keyof T];
      
      if (!state.atRest) {
        allAtRest = false;
      }
    });
    
    this.atRest = allAtRest;
    
    return { ...this.values };
  }
  
  /**
   * Resets the spring system to initial values
   * @param values Initial values
   */
  public reset(values?: T): void {
    const resetValues = values || this.values;
    
    // Reset each spring
    this.springs.forEach((spring, key) => {
      const value = resetValues[key as keyof T];
      spring.reset(value, 0);
    });
    
    this.values = { ...resetValues };
    this.targets = { ...resetValues };
    this.atRest = true;
  }
  
  /**
   * Get the current values
   */
  public getCurrentValues(): T {
    return { ...this.values };
  }
  
  /**
   * Get the target values
   */
  public getTargetValues(): T {
    return { ...this.targets };
  }
  
  /**
   * Checks if the spring system is at rest
   */
  public isAtRest(): boolean {
    return this.atRest;
  }
}

/**
 * Creates a multi-spring system
 * @param initial Initial values
 * @param config Spring configuration
 * @returns MultiSpring instance
 */
export function createMultiSpring<T extends SpringVector>(
  initial: T,
  config?: Partial<SpringConfig> | keyof typeof SpringPresets
): MultiSpring<T> {
  return new MultiSpring<T>(initial, config);
}

/**
 * Creates a 2D vector spring system
 * @param x Initial x value
 * @param y Initial y value
 * @param config Spring configuration
 * @returns MultiSpring instance for 2D vector
 */
export function createVector2Spring(
  x = 0,
  y = 0,
  config?: Partial<SpringConfig> | keyof typeof SpringPresets
): MultiSpring<{x: number, y: number}> {
  return createMultiSpring({ x, y }, config);
}

/**
 * Creates a 3D vector spring system
 * @param x Initial x value
 * @param y Initial y value
 * @param z Initial z value
 * @param config Spring configuration
 * @returns MultiSpring instance for 3D vector
 */
export function createVector3Spring(
  x = 0,
  y = 0,
  z = 0,
  config?: Partial<SpringConfig> | keyof typeof SpringPresets
): MultiSpring<{x: number, y: number, z: number}> {
  return createMultiSpring({ x, y, z }, config);
} 