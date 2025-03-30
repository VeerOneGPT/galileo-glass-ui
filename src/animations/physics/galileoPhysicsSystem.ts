/**
 * @file galileoPhysicsSystem.ts
 * Central physics simulation system for Galileo Glass UI animations.
 * 
 * This system manages all physics objects, handles simulation steps,
 * and provides a consistent API for physics-based animations.
 * 
 * @version 1.0.5
 */

// Basic vector interface for physics calculations
export interface Vector {
  x: number;
  y: number;
  z?: number;
}

// Physics object configuration
export interface PhysicsObjectConfig {
  id?: string;
  position?: Partial<Vector>;
  velocity?: Partial<Vector>;
  acceleration?: Partial<Vector>;
  mass?: number;
  restitution?: number;
  friction?: number;
  damping?: number;
  isStatic?: boolean;
  gravityScale?: number;
  collisionGroup?: number;
  collisionMask?: number;
  shape?: 'circle' | 'rectangle' | 'polygon';
  radius?: number;
  width?: number;
  height?: number;
  vertices?: Vector[];
  userData?: any;
}

// Complete physics object with all properties
export interface PhysicsObject {
  id: string;
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  previousPosition: Vector;
  mass: number;
  inverseMass: number;
  restitution: number;
  friction: number;
  damping: number;
  isStatic: boolean;
  isSleeping: boolean;
  sleepThreshold: number;
  timeIdle: number;
  gravityScale: number;
  collisionGroup: number;
  collisionMask: number;
  shape: 'circle' | 'rectangle' | 'polygon';
  radius: number;
  width: number;
  height: number;
  vertices: Vector[];
  boundingRadius: number;
  forces: Vector;
  userData: any;
}

// Physics system configuration
export interface PhysicsConfig {
  gravity: Vector;
  defaultDamping: number;
  timeScale: number;
  fixedTimeStep: number;
  maxSubSteps: number;
  velocitySleepThreshold: number;
  angularSleepThreshold: number;
  sleepTimeThreshold: number;
  enableSleeping: boolean;
  integrationMethod: 'euler' | 'verlet' | 'rk4';
  boundsCheckEnabled: boolean;
  bounds?: {
    min: Vector;
    max: Vector;
  };
}

// Event types for the physics system
export type PhysicsEventType = 
  | 'collision'
  | 'sleep'
  | 'wake'
  | 'boundaryContact'
  | 'step'
  | 'objectAdded'
  | 'objectRemoved';

// Event data structure
export interface PhysicsEvent {
  type: PhysicsEventType;
  objectA?: PhysicsObject;
  objectB?: PhysicsObject;
  contactPoint?: Vector;
  contactNormal?: Vector;
  penetration?: number;
  timestamp: number;
}

// Event listener type
export type PhysicsEventListener = (event: PhysicsEvent) => void;

/**
 * Galileo Physics System - Central physics management for animations
 * 
 * This class manages all physics objects, handles simulation steps,
 * and provides a consistent API for physics-based animations.
 */
export class GalileoPhysicsSystem {
  private objects: Map<string, PhysicsObject> = new Map();
  private config: PhysicsConfig;
  private eventListeners: Map<PhysicsEventType, Set<PhysicsEventListener>> = new Map();
  private accumulator: number = 0;
  private lastTime: number | null = null;
  private isRunning: boolean = false;
  private rafId: number | null = null;
  private nextObjectId: number = 1;

  /**
   * Get the current running state of the physics system
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Create a new physics system with the specified configuration
   */
  constructor(config?: Partial<PhysicsConfig>) {
    // Default configuration
    this.config = {
      gravity: { x: 0, y: 9.8, z: 0 },
      defaultDamping: 0.01,
      timeScale: 1,
      fixedTimeStep: 1 / 60,
      maxSubSteps: 5,
      velocitySleepThreshold: 0.05,
      angularSleepThreshold: 0.05,
      sleepTimeThreshold: 1000, // ms
      enableSleeping: true,
      integrationMethod: 'verlet',
      boundsCheckEnabled: false,
    };

    // Override with provided config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Initialize event listeners
    const eventTypes: PhysicsEventType[] = [
      'collision', 'sleep', 'wake', 'boundaryContact', 
      'step', 'objectAdded', 'objectRemoved'
    ];
    
    eventTypes.forEach(type => {
      this.eventListeners.set(type, new Set());
    });
  }

  /**
   * Generate a unique ID for a physics object
   */
  private generateId(): string {
    return `physics_object_${this.nextObjectId++}`;
  }

  /**
   * Create a new physics object with default values
   */
  private createDefaultObject(id: string): PhysicsObject {
    return {
      id,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      previousPosition: { x: 0, y: 0, z: 0 },
      mass: 1,
      inverseMass: 1,
      restitution: 0.2,
      friction: 0.1,
      damping: this.config.defaultDamping,
      isStatic: false,
      isSleeping: false,
      sleepThreshold: this.config.velocitySleepThreshold,
      timeIdle: 0,
      gravityScale: 1,
      collisionGroup: 1,
      collisionMask: 0xFFFFFFFF, // Collide with everything by default
      shape: 'circle',
      radius: 1,
      width: 1,
      height: 1,
      vertices: [],
      boundingRadius: 1,
      forces: { x: 0, y: 0, z: 0 },
      userData: {}
    };
  }

  /**
   * Add a physics object to the system
   * @param config Object configuration
   * @returns The ID of the created object
   */
  public addObject(config: PhysicsObjectConfig): string {
    const id = config.id || this.generateId();
    
    // Check if ID already exists
    if (this.objects.has(id)) {
      throw new Error(`Physics object with ID ${id} already exists`);
    }
    
    // Create base object with defaults
    const object = this.createDefaultObject(id);
    
    // Apply configuration
    if (config.position) {
      object.position.x = config.position.x ?? object.position.x;
      object.position.y = config.position.y ?? object.position.y;
      object.position.z = config.position.z ?? object.position.z;
      object.previousPosition = { ...object.position };
    }
    
    if (config.velocity) {
      object.velocity.x = config.velocity.x ?? object.velocity.x;
      object.velocity.y = config.velocity.y ?? object.velocity.y;
      object.velocity.z = config.velocity.z ?? object.velocity.z;
    }
    
    if (config.acceleration) {
      object.acceleration.x = config.acceleration.x ?? object.acceleration.x;
      object.acceleration.y = config.acceleration.y ?? object.acceleration.y;
      object.acceleration.z = config.acceleration.z ?? object.acceleration.z;
    }
    
    if (config.mass !== undefined) {
      object.mass = Math.max(0.0001, config.mass);
      object.inverseMass = object.isStatic ? 0 : 1 / object.mass;
    }
    
    if (config.restitution !== undefined) {
      object.restitution = Math.max(0, Math.min(1, config.restitution));
    }
    
    if (config.friction !== undefined) {
      object.friction = Math.max(0, config.friction);
    }
    
    if (config.damping !== undefined) {
      object.damping = Math.max(0, Math.min(1, config.damping));
    }
    
    if (config.isStatic !== undefined) {
      object.isStatic = config.isStatic;
      object.inverseMass = object.isStatic ? 0 : 1 / object.mass;
    }
    
    if (config.gravityScale !== undefined) {
      object.gravityScale = config.gravityScale;
    }
    
    if (config.collisionGroup !== undefined) {
      object.collisionGroup = config.collisionGroup;
    }
    
    if (config.collisionMask !== undefined) {
      object.collisionMask = config.collisionMask;
    }
    
    if (config.shape !== undefined) {
      object.shape = config.shape;
      
      // Set shape-specific properties
      if (config.shape === 'circle' && config.radius !== undefined) {
        object.radius = Math.max(0.0001, config.radius);
        object.boundingRadius = object.radius;
      } else if (config.shape === 'rectangle') {
        if (config.width !== undefined) {
          object.width = Math.max(0.0001, config.width);
        }
        if (config.height !== undefined) {
          object.height = Math.max(0.0001, config.height);
        }
        
        // Calculate bounding radius for rectangle
        object.boundingRadius = Math.sqrt(
          (object.width / 2) * (object.width / 2) + 
          (object.height / 2) * (object.height / 2)
        );
        
        // Generate vertices for rectangle if not provided
        if (!config.vertices || config.vertices.length === 0) {
          const halfWidth = object.width / 2;
          const halfHeight = object.height / 2;
          object.vertices = [
            { x: -halfWidth, y: -halfHeight, z: 0 },
            { x: halfWidth, y: -halfHeight, z: 0 },
            { x: halfWidth, y: halfHeight, z: 0 },
            { x: -halfWidth, y: halfHeight, z: 0 }
          ];
        }
      } else if (config.shape === 'polygon' && config.vertices) {
        object.vertices = [...config.vertices];
        
        // Calculate bounding radius for polygon
        let maxDistSq = 0;
        for (const vertex of object.vertices) {
          const distSq = vertex.x * vertex.x + vertex.y * vertex.y;
          if (distSq > maxDistSq) {
            maxDistSq = distSq;
          }
        }
        object.boundingRadius = Math.sqrt(maxDistSq);
      }
    }
    
    if (config.userData !== undefined) {
      object.userData = config.userData;
    }
    
    // Add object to the system
    this.objects.set(id, object);
    
    // Dispatch event
    this.dispatchEvent({
      type: 'objectAdded',
      objectA: object,
      timestamp: Date.now()
    });
    
    return id;
  }

  /**
   * Remove a physics object from the system
   * @param id The ID of the object to remove
   */
  public removeObject(id: string): boolean {
    const object = this.objects.get(id);
    
    if (object) {
      this.objects.delete(id);
      
      // Dispatch event
      this.dispatchEvent({
        type: 'objectRemoved',
        objectA: object,
        timestamp: Date.now()
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Get a physics object by ID
   * @param id The ID of the object to retrieve
   */
  public getObject(id: string): PhysicsObject | undefined {
    return this.objects.get(id);
  }

  /**
   * Update a physics object's properties
   * @param id The ID of the object to update
   * @param updates The properties to update
   */
  public updateObject(id: string, updates: Partial<PhysicsObjectConfig>): boolean {
    const object = this.objects.get(id);
    
    if (!object) {
      return false;
    }
    
    // Handle position updates
    if (updates.position) {
      if (updates.position.x !== undefined) object.position.x = updates.position.x;
      if (updates.position.y !== undefined) object.position.y = updates.position.y;
      if (updates.position.z !== undefined) object.position.z = updates.position.z;
    }
    
    // Handle velocity updates
    if (updates.velocity) {
      if (updates.velocity.x !== undefined) object.velocity.x = updates.velocity.x;
      if (updates.velocity.y !== undefined) object.velocity.y = updates.velocity.y;
      if (updates.velocity.z !== undefined) object.velocity.z = updates.velocity.z;
      
      // Wake up object if velocity changed
      if (object.isSleeping && this.getVelocityMagnitudeSquared(object) > 0) {
        this.wakeObject(object);
      }
    }
    
    // Handle acceleration updates
    if (updates.acceleration) {
      if (updates.acceleration.x !== undefined) object.acceleration.x = updates.acceleration.x;
      if (updates.acceleration.y !== undefined) object.acceleration.y = updates.acceleration.y;
      if (updates.acceleration.z !== undefined) object.acceleration.z = updates.acceleration.z;
      
      // Wake up object if acceleration changed
      if (object.isSleeping && this.getVelocityMagnitudeSquared(object) > 0) {
        this.wakeObject(object);
      }
    }
    
    // Handle mass updates
    if (updates.mass !== undefined) {
      object.mass = Math.max(0.0001, updates.mass);
      object.inverseMass = object.isStatic ? 0 : 1 / object.mass;
    }
    
    // Handle other scalar properties
    if (updates.restitution !== undefined) {
      object.restitution = Math.max(0, Math.min(1, updates.restitution));
    }
    
    if (updates.friction !== undefined) {
      object.friction = Math.max(0, updates.friction);
    }
    
    if (updates.damping !== undefined) {
      object.damping = Math.max(0, Math.min(1, updates.damping));
    }
    
    if (updates.isStatic !== undefined) {
      object.isStatic = updates.isStatic;
      object.inverseMass = object.isStatic ? 0 : 1 / object.mass;
    }
    
    if (updates.gravityScale !== undefined) {
      object.gravityScale = updates.gravityScale;
    }
    
    if (updates.userData !== undefined) {
      object.userData = updates.userData;
    }
    
    return true;
  }

  /**
   * Apply a force to a physics object
   * @param id The ID of the object to apply force to
   * @param force The force vector to apply
   */
  public applyForce(id: string, force: Partial<Vector>): boolean {
    const object = this.objects.get(id);
    
    if (!object) {
      return false;
    }
    
    // Apply force to object
    if (force.x) object.forces.x += force.x;
    if (force.y) object.forces.y += force.y;
    if (force.z) object.forces.z += force.z;
    
    // Wake up object if sleeping
    if (object.isSleeping) {
      this.wakeObject(object);
    }
    
    return true;
  }

  /**
   * Apply an impulse (immediate velocity change) to a physics object
   * @param id The ID of the object to apply impulse to
   * @param impulse The impulse vector to apply
   */
  public applyImpulse(id: string, impulse: Partial<Vector>): boolean {
    const object = this.objects.get(id);
    
    if (!object || object.isStatic) {
      return false;
    }
    
    // Apply impulse directly to velocity (F = m*a, impulse = m*Δv)
    if (impulse.x) object.velocity.x += impulse.x * object.inverseMass;
    if (impulse.y) object.velocity.y += impulse.y * object.inverseMass;
    if (impulse.z) object.velocity.z += impulse.z * object.inverseMass;
    
    // Wake up object if sleeping
    if (object.isSleeping) {
      this.wakeObject(object);
    }
    
    return true;
  }

  /**
   * Wake up a sleeping physics object
   */
  private wakeObject(object: PhysicsObject): void {
    if (object.isSleeping) {
      object.isSleeping = false;
      object.timeIdle = 0;
      
      // Dispatch wake event
      this.dispatchEvent({
        type: 'wake',
        objectA: object,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Put a physics object to sleep
   */
  private sleepObject(object: PhysicsObject): void {
    if (!object.isSleeping) {
      object.isSleeping = true;
      object.velocity.x = 0;
      object.velocity.y = 0;
      object.velocity.z = 0;
      object.acceleration.x = 0;
      object.acceleration.y = 0;
      object.acceleration.z = 0;
      object.forces.x = 0;
      object.forces.y = 0;
      object.forces.z = 0;
      
      // Dispatch sleep event
      this.dispatchEvent({
        type: 'sleep',
        objectA: object,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Calculate the squared magnitude of an object's velocity
   */
  private getVelocityMagnitudeSquared(object: PhysicsObject): number {
    return (
      object.velocity.x * object.velocity.x + 
      object.velocity.y * object.velocity.y + 
      object.velocity.z * object.velocity.z
    );
  }

  /**
   * Reset accumulated forces on an object
   */
  private resetForces(object: PhysicsObject): void {
    object.forces.x = 0;
    object.forces.y = 0;
    object.forces.z = 0;
  }

  /**
   * Integrate physics for a single object for a single time step
   */
  private integrateObject(object: PhysicsObject, dt: number): void {
    if (object.isStatic || object.isSleeping) {
      return;
    }
    
    // Store previous position for verlet integration
    object.previousPosition.x = object.position.x;
    object.previousPosition.y = object.position.y;
    object.previousPosition.z = object.position.z;
    
    // Apply gravity
    const gravityForceX = this.config.gravity.x * object.gravityScale * object.mass;
    const gravityForceY = this.config.gravity.y * object.gravityScale * object.mass;
    const gravityForceZ = this.config.gravity.z * object.gravityScale * object.mass;
    
    // Calculate acceleration from forces (F = ma, a = F/m)
    const accelerationX = (object.forces.x + gravityForceX) * object.inverseMass;
    const accelerationY = (object.forces.y + gravityForceY) * object.inverseMass;
    const accelerationZ = (object.forces.z + gravityForceZ) * object.inverseMass;
    
    // Set new acceleration
    object.acceleration.x = accelerationX;
    object.acceleration.y = accelerationY;
    object.acceleration.z = accelerationZ;
    
    // Perform integration based on selected method
    if (this.config.integrationMethod === 'euler') {
      // Explicit Euler integration (simplest, but less stable)
      // Update velocity using acceleration (v = v0 + a*dt)
      object.velocity.x += object.acceleration.x * dt;
      object.velocity.y += object.acceleration.y * dt;
      object.velocity.z += object.acceleration.z * dt;
      
      // Apply damping (drag)
      const damping = Math.pow(1 - object.damping, dt);
      object.velocity.x *= damping;
      object.velocity.y *= damping;
      object.velocity.z *= damping;
      
      // Update position using velocity (p = p0 + v*dt)
      object.position.x += object.velocity.x * dt;
      object.position.y += object.velocity.y * dt;
      object.position.z += object.velocity.z * dt;
    }
    else if (this.config.integrationMethod === 'verlet') {
      // Velocity Verlet integration (more stable than Euler)
      // Update velocity using half-step acceleration (v = v0 + a*dt/2)
      object.velocity.x += object.acceleration.x * dt * 0.5;
      object.velocity.y += object.acceleration.y * dt * 0.5;
      object.velocity.z += object.acceleration.z * dt * 0.5;
      
      // Update position using velocity (p = p0 + v*dt)
      object.position.x += object.velocity.x * dt;
      object.position.y += object.velocity.y * dt;
      object.position.z += object.velocity.z * dt;
      
      // Apply damping (drag)
      const damping = Math.pow(1 - object.damping, dt);
      object.velocity.x *= damping;
      object.velocity.y *= damping;
      object.velocity.z *= damping;
      
      // Complete velocity update with second half-step
      object.velocity.x += object.acceleration.x * dt * 0.5;
      object.velocity.y += object.acceleration.y * dt * 0.5;
      object.velocity.z += object.acceleration.z * dt * 0.5;
    }
    else if (this.config.integrationMethod === 'rk4') {
      // Runge-Kutta 4th order (most accurate, but more computationally expensive)
      // Implementation omitted for brevity, would include 4 evaluation steps
      // This is a placeholder for future implementation
      
      // For now, fall back to verlet integration
      object.velocity.x += object.acceleration.x * dt * 0.5;
      object.velocity.y += object.acceleration.y * dt * 0.5;
      object.velocity.z += object.acceleration.z * dt * 0.5;
      
      object.position.x += object.velocity.x * dt;
      object.position.y += object.velocity.y * dt;
      object.position.z += object.velocity.z * dt;
      
      const damping = Math.pow(1 - object.damping, dt);
      object.velocity.x *= damping;
      object.velocity.y *= damping;
      object.velocity.z *= damping;
      
      object.velocity.x += object.acceleration.x * dt * 0.5;
      object.velocity.y += object.acceleration.y * dt * 0.5;
      object.velocity.z += object.acceleration.z * dt * 0.5;
    }
    
    // Check for sleeping
    if (this.config.enableSleeping) {
      const velocitySquared = this.getVelocityMagnitudeSquared(object);
      
      if (velocitySquared < object.sleepThreshold * object.sleepThreshold) {
        object.timeIdle += dt * 1000; // Convert to ms
        
        if (object.timeIdle > this.config.sleepTimeThreshold) {
          this.sleepObject(object);
        }
      } else {
        object.timeIdle = 0;
      }
    }
    
    // Reset forces for next step
    this.resetForces(object);
  }

  /**
   * Update physics simulation for a single step
   * @param dt Time step in seconds
   */
  private update(dt: number): void {
    // Scale time step by time scale
    const scaledDt = dt * this.config.timeScale;
    
    // Integrate physics for each object
    for (const object of this.objects.values()) {
      this.integrateObject(object, scaledDt);
    }
    
    // Dispatch step event
    this.dispatchEvent({
      type: 'step',
      timestamp: Date.now()
    });
  }

  /**
   * Run a single fixed physics time step
   */
  public step(): void {
    this.update(this.config.fixedTimeStep);
  }

  /**
   * Run the physics simulation with the given elapsed time
   * @param elapsed Elapsed time in seconds since last update
   */
  public simulate(elapsed: number): void {
    // Add elapsed time to accumulator
    this.accumulator += elapsed;
    
    // Run fixed time steps while accumulated time exceeds fixed time step
    let steps = 0;
    while (this.accumulator >= this.config.fixedTimeStep && steps < this.config.maxSubSteps) {
      this.update(this.config.fixedTimeStep);
      this.accumulator -= this.config.fixedTimeStep;
      steps++;
    }
  }

  /**
   * Animation frame callback for continuous simulation
   */
  private animationFrame = (timestamp: number): void => {
    if (!this.isRunning) return;
    
    if (this.lastTime === null) {
      this.lastTime = timestamp;
    }
    
    // Calculate elapsed time in seconds
    const elapsed = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    
    // Run simulation with elapsed time
    this.simulate(elapsed);
    
    // Schedule next frame
    this.rafId = requestAnimationFrame(this.animationFrame);
  };

  /**
   * Start continuous physics simulation
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = null;
    this.rafId = requestAnimationFrame(this.animationFrame);
  }

  /**
   * Stop continuous physics simulation
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Reset all objects in the physics system
   */
  public reset(): void {
    this.objects.clear();
    this.accumulator = 0;
    this.lastTime = null;
    this.nextObjectId = 1;
  }

  /**
   * Add an event listener
   * @param type Event type to listen for
   * @param listener Callback function to call when event occurs
   */
  public addEventListener(type: PhysicsEventType, listener: PhysicsEventListener): void {
    const listeners = this.eventListeners.get(type);
    
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove an event listener
   * @param type Event type to remove listener from
   * @param listener Callback function to remove
   */
  public removeEventListener(type: PhysicsEventType, listener: PhysicsEventListener): void {
    const listeners = this.eventListeners.get(type);
    
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Dispatch an event to all registered listeners
   * @param event Event data to dispatch
   */
  private dispatchEvent(event: PhysicsEvent): void {
    const listeners = this.eventListeners.get(event.type);
    
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in physics event listener for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Get all physics objects in the system
   */
  public getAllObjects(): PhysicsObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Get the current configuration
   */
  public getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  /**
   * Update the physics configuration
   * @param config New configuration values
   */
  public updateConfig(config: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Vector utility functions
export const VectorUtils = {
  /**
   * Create a new vector
   */
  create(x = 0, y = 0, z = 0): Vector {
    return { x, y, z };
  },
  
  /**
   * Add two vectors
   */
  add(a: Vector, b: Vector): Vector {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: (a.z ?? 0) + (b.z ?? 0)
    };
  },
  
  /**
   * Subtract vector b from vector a
   */
  subtract(a: Vector, b: Vector): Vector {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: (a.z ?? 0) - (b.z ?? 0)
    };
  },
  
  /**
   * Multiply a vector by a scalar
   */
  multiply(v: Vector, scalar: number): Vector {
    return {
      x: v.x * scalar,
      y: v.y * scalar,
      z: (v.z ?? 0) * scalar
    };
  },
  
  /**
   * Divide a vector by a scalar
   */
  divide(v: Vector, scalar: number): Vector {
    if (scalar === 0) {
      throw new Error('Cannot divide vector by zero');
    }
    
    return {
      x: v.x / scalar,
      y: v.y / scalar,
      z: (v.z ?? 0) / scalar
    };
  },
  
  /**
   * Calculate the dot product of two vectors
   */
  dot(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y + (a.z ?? 0) * (b.z ?? 0);
  },
  
  /**
   * Calculate the cross product of two vectors (2D)
   */
  cross2D(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  },
  
  /**
   * Calculate the cross product of two vectors (3D)
   */
  cross(a: Vector, b: Vector): Vector {
    const az = a.z ?? 0;
    const bz = b.z ?? 0;
    
    return {
      x: a.y * bz - az * b.y,
      y: az * b.x - a.x * bz,
      z: a.x * b.y - a.y * b.x
    };
  },
  
  /**
   * Calculate the magnitude (length) of a vector
   */
  magnitude(v: Vector): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + (v.z ?? 0) * (v.z ?? 0));
  },
  
  /**
   * Calculate the squared magnitude of a vector
   */
  magnitudeSquared(v: Vector): number {
    return v.x * v.x + v.y * v.y + (v.z ?? 0) * (v.z ?? 0);
  },
  
  /**
   * Normalize a vector (make it unit length)
   */
  normalize(v: Vector): Vector {
    const mag = this.magnitude(v);
    
    if (mag === 0) {
      return { ...v };
    }
    
    return this.divide(v, mag);
  },
  
  /**
   * Calculate the distance between two vectors
   */
  distance(a: Vector, b: Vector): number {
    return this.magnitude(this.subtract(a, b));
  },
  
  /**
   * Calculate the squared distance between two vectors
   */
  distanceSquared(a: Vector, b: Vector): number {
    return this.magnitudeSquared(this.subtract(a, b));
  },
  
  /**
   * Linearly interpolate between two vectors
   */
  lerp(a: Vector, b: Vector, t: number): Vector {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: (a.z ?? 0) + ((b.z ?? 0) - (a.z ?? 0)) * t
    };
  },
  
  /**
   * Calculate the angle between two vectors in radians
   */
  angle(a: Vector, b: Vector): number {
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    
    if (magA === 0 || magB === 0) {
      return 0;
    }
    
    const dot = this.dot(a, b);
    const cos = dot / (magA * magB);
    
    // Clamp to prevent floating point errors
    const clampedCos = Math.max(-1, Math.min(1, cos));
    
    return Math.acos(clampedCos);
  },
  
  /**
   * Rotate a 2D vector by an angle in radians
   */
  rotate(v: Vector, angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos,
      z: v.z
    };
  }
};

// Export a singleton instance for convenience
export const physicsSystem = new GalileoPhysicsSystem();

export default GalileoPhysicsSystem; 