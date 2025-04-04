/**
 * @file galileoPhysicsSystem.ts
 * Central physics simulation system for Galileo Glass UI animations.
 * 
 * This system manages all physics objects, handles simulation steps,
 * and provides a consistent API for physics-based animations.
 * 
 * @version 1.0.5
 */

import { 
  PhysicsBodyOptions, 
  PhysicsBodyState, 
  CollisionEvent, 
  Vector2D, 
  UnsubscribeFunction, 
  PhysicsConstraintOptions,
  DistanceConstraintOptions,
  HingeConstraintOptions,
  BaseConstraintOptions,
  SpringConstraintOptions
} from './engineTypes';

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
  angle?: number;
  angularVelocity?: number;
  torque?: number;
  inertia?: number;
  inverseInertia?: number;
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
  angle: number;
  angularVelocity: number;
  torque: number;
  inertia: number;
  inverseInertia: number;
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

// --- Internal Constraint Types ---

// Base internal constraint structure
interface InternalConstraint {
  id: string;
  options: PhysicsConstraintOptions; // Store the original options (UNION type is OK here)
  bodyA: PhysicsObject; // Direct reference to the first body
  bodyB: PhysicsObject; // Direct reference to the second body
  // Pre-calculate attachment points in local coordinates for efficiency
  localPointA: Vector;
  localPointB: Vector;
}

// No longer need specific internal types if the base holds the union
// interface InternalDistanceConstraint extends InternalConstraint {
//   options: DistanceConstraintOptions;
// }
// 
// interface InternalHingeConstraint extends InternalConstraint {
//   options: HingeConstraintOptions;
//   // Add runtime state for hinge if necessary (e.g., current impulse)
// }

type PhysicsConstraint = InternalConstraint; // Just use the base internal type now

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
  private accumulator = 0;
  private lastTime: number | null = null;
  private isRunning = false;
  private rafId: number | null = null;
  private nextObjectId = 1;
  private nextConstraintId = 1; // Counter for constraint IDs
  private constraints: Map<string, InternalConstraint> = new Map(); // Storage for constraints

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
      angle: 0,
      angularVelocity: 0,
      torque: 0,
      inertia: 1,
      inverseInertia: 1,
      userData: {}
    };
  }

  /**
   * Add a physics object to the system
   * @param config Object configuration
   * @returns The ID of the created object
   */
  public addObject(config: PhysicsObjectConfig): string {
    const rawId = config.id !== undefined ? config.id : this.generateId();
    const id = String(rawId);

    if (this.objects.has(id)) {
      console.warn(
        `Physics object with stringified ID "${id}" (raw: ${rawId}) already exists. Consider using unique IDs.`
      );
    }

    const object = this.createDefaultObject(id);
    
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
      object.inverseInertia = object.isStatic ? 0 : object.inverseInertia;
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
      
      if (config.shape === 'circle' && config.radius !== undefined) {
        object.radius = Math.max(0.0001, config.radius);
        object.boundingRadius = object.radius;
        object.inertia = 0.5 * object.mass * object.radius * object.radius;
      } else if (config.shape === 'rectangle') {
        if (config.width !== undefined) {
          object.width = Math.max(0.0001, config.width);
        }
        if (config.height !== undefined) {
          object.height = Math.max(0.0001, config.height);
        }
        
        object.boundingRadius = Math.sqrt(
          (object.width / 2) * (object.width / 2) + 
          (object.height / 2) * (object.height / 2)
        );
        
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
        object.inertia = (1/12) * object.mass * (object.width * object.width + object.height * object.height);
      } else if (config.shape === 'polygon' && config.vertices) {
        object.vertices = [...config.vertices];
        
        let maxDistSq = 0;
        for (const vertex of object.vertices) {
          const distSq = vertex.x * vertex.x + vertex.y * vertex.y;
          if (distSq > maxDistSq) {
            maxDistSq = distSq;
          }
        }
        object.boundingRadius = Math.sqrt(maxDistSq);
        object.inertia = 0.5 * object.mass * object.boundingRadius * object.boundingRadius;
      }
    }
    
    if (config.userData !== undefined) {
      object.userData = config.userData;
    }
    
    if (config.angle !== undefined) {
      object.angle = config.angle;
    }
    if (config.angularVelocity !== undefined) {
      object.angularVelocity = config.angularVelocity;
    }
    
    this.objects.set(id, object);
    
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
    // Ensure we consistently use a string ID for map lookup
    const stringId = String(id);

    const obj = this.objects.get(stringId);

    // If found directly, return it
    if (obj) {
      return obj;
    }

    // REMOVED complex fallback logic (trimming, iterating)
    // A direct map lookup should be sufficient and less error-prone.
    // If the object isn't found with its string ID, it's considered not present.

    // Log failure only if not found directly
    console.debug(`[PhysicsSystem] Object not found with ID: "${stringId}". Available IDs: [${Array.from(this.objects.keys()).join(', ')}]`);
    return undefined;
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
    
    if (updates.position) {
      if (updates.position.x !== undefined) object.position.x = updates.position.x;
      if (updates.position.y !== undefined) object.position.y = updates.position.y;
      if (updates.position.z !== undefined) object.position.z = updates.position.z;
    }
    
    if (updates.velocity) {
      if (updates.velocity.x !== undefined) object.velocity.x = updates.velocity.x;
      if (updates.velocity.y !== undefined) object.velocity.y = updates.velocity.y;
      if (updates.velocity.z !== undefined) object.velocity.z = updates.velocity.z;
      
      if (object.isSleeping && this.getVelocityMagnitudeSquared(object) > 0) {
        this.wakeObject(object);
      }
    }
    
    if (updates.acceleration) {
      if (updates.acceleration.x !== undefined) object.acceleration.x = updates.acceleration.x;
      if (updates.acceleration.y !== undefined) object.acceleration.y = updates.acceleration.y;
      if (updates.acceleration.z !== undefined) object.acceleration.z = updates.acceleration.z;
      
      if (object.isSleeping && this.getVelocityMagnitudeSquared(object) > 0) {
        this.wakeObject(object);
      }
    }
    
    if (updates.mass !== undefined) {
      object.mass = Math.max(0.0001, updates.mass);
      object.inverseMass = object.isStatic ? 0 : 1 / object.mass;
    }
    
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
      object.inverseInertia = object.isStatic ? 0 : object.inverseInertia;
    }
    
    if (updates.gravityScale !== undefined) {
      object.gravityScale = updates.gravityScale;
    }
    
    if (updates.userData !== undefined) {
      object.userData = updates.userData;
    }
    
    if (updates.angle !== undefined) {
      object.angle = updates.angle;
    }
    if (updates.angularVelocity !== undefined) {
      object.angularVelocity = updates.angularVelocity;
      if (object.isSleeping && Math.abs(object.angularVelocity) > 0) {
        this.wakeObject(object);
      }
    }
    
    let needsInertiaUpdate = false;
    if (updates.shape !== undefined) {
      if (updates.shape === 'circle' && updates.radius !== undefined) {
        object.radius = Math.max(0.0001, updates.radius);
        object.boundingRadius = object.radius;
        object.inertia = 0.5 * object.mass * object.radius * object.radius;
      } else if (updates.shape === 'rectangle') {
        if (updates.width !== undefined) {
          object.width = Math.max(0.0001, updates.width);
        }
        if (updates.height !== undefined) {
          object.height = Math.max(0.0001, updates.height);
        }
        
        object.boundingRadius = Math.sqrt(
          (object.width / 2) * (object.width / 2) + 
          (object.height / 2) * (object.height / 2)
        );
        
        if (!updates.vertices || updates.vertices.length === 0) {
          const halfWidth = object.width / 2;
          const halfHeight = object.height / 2;
          object.vertices = [
            { x: -halfWidth, y: -halfHeight, z: 0 },
            { x: halfWidth, y: -halfHeight, z: 0 },
            { x: halfWidth, y: halfHeight, z: 0 },
            { x: -halfWidth, y: halfHeight, z: 0 }
          ];
        }
        object.inertia = (1/12) * object.mass * (object.width * object.width + object.height * object.height);
      } else if (updates.shape === 'polygon' && updates.vertices) {
        object.vertices = [...updates.vertices];
        
        let maxDistSq = 0;
        for (const vertex of object.vertices) {
          const distSq = vertex.x * vertex.x + vertex.y * vertex.y;
          if (distSq > maxDistSq) {
            maxDistSq = distSq;
          }
        }
        object.boundingRadius = Math.sqrt(maxDistSq);
        object.inertia = 0.5 * object.mass * object.boundingRadius * object.boundingRadius;
      }
    }
    
    if (updates.isStatic !== undefined) {
      object.isStatic = updates.isStatic;
      object.inverseMass = object.isStatic ? 0 : 1 / object.mass;
      object.inverseInertia = object.isStatic ? 0 : object.inverseInertia;
    }
    
    if (needsInertiaUpdate) {
      if (object.shape === 'circle') {
        object.inertia = 0.5 * object.mass * object.radius * object.radius;
      } else if (object.shape === 'rectangle') {
        object.inertia = (1/12) * object.mass * (object.width * object.width + object.height * object.height);
      } else if (object.shape === 'polygon') {
        object.inertia = 0.5 * object.mass * object.boundingRadius * object.boundingRadius;
      }

      if (!object.isStatic) {
        object.inertia = Math.max(0.0001, object.inertia);
        object.inverseInertia = 1.0 / object.inertia;
      } else {
        object.inertia = Infinity;
        object.inverseInertia = 0;
      }
    }
    
    return true;
  }

  /**
   * Apply a force to a physics object
   * @param id The ID of the object to apply force to
   * @param force The force vector { x, y, z } to apply
   * @param point Optional point relative to the object's center where the force is applied. Defaults to center.
   * @returns True if force was applied, false otherwise.
   */
  public applyForce(id: string, force: Partial<Vector>, point?: Partial<Vector>): boolean {
    const object = this.objects.get(id);
    
    if (!object) {
      return false;
    }
    
    const fx = force.x ?? 0;
    const fy = force.y ?? 0;
    const fz = force.z ?? 0;

    object.forces.x += fx;
    object.forces.y += fy;
    object.forces.z += fz;

    if (point && !object.isStatic) {
      const rx = point.x ?? 0;
      const ry = point.y ?? 0;
      const torqueZ = rx * fy - ry * fx;
      object.torque += torqueZ;
    }
    
    if (object.isSleeping) {
      this.wakeObject(object);
    }
    
    return true;
  }

  /**
   * Apply an impulse (immediate velocity change) to a physics object
   * @param id The ID of the object to apply impulse to
   * @param impulse The impulse vector { x, y, z } to apply
   * @param point Optional point relative to the object's center where the impulse is applied. Defaults to center.
   * @returns True if impulse was applied, false otherwise.
   */
  public applyImpulse(id: string, impulse: Partial<Vector>, point?: Partial<Vector>): boolean {
    const object = this.objects.get(id);
    
    if (!object || object.isStatic) {
      return false;
    }
    
    const ix = impulse.x ?? 0;
    const iy = impulse.y ?? 0;
    const iz = impulse.z ?? 0;

    object.velocity.x += ix * object.inverseMass;
    object.velocity.y += iy * object.inverseMass;
    object.velocity.z += iz * object.inverseMass;

    if (point) {
      const rx = point.x ?? 0;
      const ry = point.y ?? 0;
      const angularImpulseZ = rx * iy - ry * ix;
      object.angularVelocity += angularImpulseZ * object.inverseInertia;
    }
    
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
      object.angularVelocity = 0;
      object.torque = 0;
      
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
   * Calculate the squared magnitude of an object's angular velocity
   */
  private getAngularVelocityMagnitudeSquared(object: PhysicsObject): number {
    return object.angularVelocity * object.angularVelocity;
  }

  /**
   * Reset accumulated forces and torques on an object
   */
  private resetForcesAndTorques(object: PhysicsObject): void {
    object.forces.x = 0;
    object.forces.y = 0;
    object.forces.z = 0;
    object.torque = 0;
  }

  /**
   * Integrate physics for a single object for a single time step
   */
  private integrateObject(object: PhysicsObject, dt: number): void {
    if (object.isStatic || object.isSleeping) {
      return;
    }
    
    object.previousPosition.x = object.position.x;
    object.previousPosition.y = object.position.y;
    object.previousPosition.z = object.position.z;
    
    const gravityForceX = this.config.gravity.x * object.gravityScale * object.mass;
    const gravityForceY = this.config.gravity.y * object.gravityScale * object.mass;
    const gravityForceZ = this.config.gravity.z * object.gravityScale * object.mass;
    
    const linearAccelerationX = (object.forces.x + gravityForceX) * object.inverseMass;
    const linearAccelerationY = (object.forces.y + gravityForceY) * object.inverseMass;
    const linearAccelerationZ = (object.forces.z + gravityForceZ) * object.inverseMass;
    
    object.acceleration.x = linearAccelerationX;
    object.acceleration.y = linearAccelerationY;
    object.acceleration.z = linearAccelerationZ;
    
    const angularAcceleration = object.torque * object.inverseInertia;
    
    object.velocity.x += linearAccelerationX * dt * 0.5;
    object.velocity.y += linearAccelerationY * dt * 0.5;
    object.velocity.z += linearAccelerationZ * dt * 0.5;
    object.angularVelocity += angularAcceleration * dt * 0.5;
    
    object.position.x += object.velocity.x * dt;
    object.position.y += object.velocity.y * dt;
    object.position.z += object.velocity.z * dt;
    object.angle += object.angularVelocity * dt;
    
    const linearDamping = Math.pow(1 - object.damping, dt);
    const angularDampingFactor = 0.99;
    const angularDamping = Math.pow(1 - angularDampingFactor, dt);
    object.velocity.x *= linearDamping;
    object.velocity.y *= linearDamping;
    object.velocity.z *= linearDamping;
    object.angularVelocity *= angularDamping;
    
    object.velocity.x += linearAccelerationX * dt * 0.5;
    object.velocity.y += linearAccelerationY * dt * 0.5;
    object.velocity.z += linearAccelerationZ * dt * 0.5;
    object.angularVelocity += angularAcceleration * dt * 0.5;
    
    if (this.config.enableSleeping) {
      const linearSpeedSq = this.getVelocityMagnitudeSquared(object);
      const angularSpeedSq = this.getAngularVelocityMagnitudeSquared(object);
      
      const linearThresholdSq = this.config.velocitySleepThreshold * this.config.velocitySleepThreshold;
      const angularThresholdSq = this.config.angularSleepThreshold * this.config.angularSleepThreshold;
      
      if (linearSpeedSq < linearThresholdSq && angularSpeedSq < angularThresholdSq) {
        object.timeIdle += dt * 1000;
        
        if (object.timeIdle > this.config.sleepTimeThreshold) {
          this.sleepObject(object);
        }
      } else {
        object.timeIdle = 0;
      }
    }
    
    this.resetForcesAndTorques(object);
  }

  /**
   * Update physics simulation for a single step
   * @param dt Time step in seconds
   */
  private update(dt: number): void {
    const scaledDt = dt * this.config.timeScale;
    
    for (const object of this.objects.values()) {
      this.integrateObject(object, scaledDt);
    }
    
    this.applyConstraints(scaledDt);

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
    this.accumulator += elapsed;
    
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
    
    const elapsed = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    
    this.simulate(elapsed);
    
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

  // --- Constraint Management ---

  /**
   * Generate a unique ID for a physics constraint
   */
  private generateConstraintId(): string {
    return `physics_constraint_${this.nextConstraintId++}`;
  }

  /**
   * Adds a constraint between two bodies.
   * @param options Configuration options for the constraint.
   * @returns The unique ID of the created constraint, or null if creation failed.
   */
  public addConstraint(options: PhysicsConstraintOptions): string | null {
    const bodyA = this.getObject(options.bodyAId);
    const bodyB = this.getObject(options.bodyBId);

    if (!bodyA || !bodyB) {
      console.error(
        `[PhysicsSystem] Cannot add constraint: Body A ('${options.bodyAId}') or Body B ('${options.bodyBId}') not found.`
      );
      return null;
    }

    if (bodyA === bodyB) {
      console.error(
        `[PhysicsSystem] Cannot add constraint: Body A and Body B are the same ('${options.bodyAId}').`
      );
      return null;
    }

    // Ensure Z is 0 if not provided in local points
    const localPointA: Vector = { x: options.pointA?.x ?? 0, y: options.pointA?.y ?? 0, z: 0 };
    const localPointB: Vector = { x: options.pointB?.x ?? 0, y: options.pointB?.y ?? 0, z: 0 };

    const constraintId = options.id ?? this.generateConstraintId();

    if (this.constraints.has(constraintId)) {
        console.warn(`[PhysicsSystem] Constraint with ID "${constraintId}" already exists. Overwriting.`);
    }

    const internalConstraint: InternalConstraint = {
      id: constraintId,
      options: options, // Store the specific options (DistanceConstraintOptions, etc.)
      bodyA: bodyA,
      bodyB: bodyB,
      localPointA: localPointA,
      localPointB: localPointB,
    };

    this.constraints.set(constraintId, internalConstraint);
    console.log(`[PhysicsSystem] Added constraint ${constraintId} of type ${options.type} between ${bodyA.id} and ${bodyB.id}`);
    return constraintId;
  }

  /**
   * Removes a constraint from the simulation.
   * @param id The ID of the constraint to remove.
   * @returns True if the constraint was found and removed, false otherwise.
   */
  public removeConstraint(id: string): boolean {
    if (this.constraints.has(id)) {
      this.constraints.delete(id);
      console.log(`[PhysicsSystem] Removed constraint ${id}`);
      return true;
    }
    console.warn(`[PhysicsSystem] Constraint with ID "${id}" not found for removal.`);
    return false;
  }

  /**
   * Resolves all constraints iteratively.
   * This method applies positional corrections to satisfy constraints.
   * @param dt Time step (can be used for stiffness/damping later, ignored for now)
   */
  private applyConstraints(dt: number): void {
      if (this.constraints.size === 0) {
          return;
      }

      // --- Simple Iterative Solver ---
      // Repeat resolution step multiple times for better stability
      const iterations = 5; // TODO: Make configurable?
      for (let i = 0; i < iterations; ++i) {
          for (const constraint of this.constraints.values()) {
              // --- Distance & Spring Constraint Resolution ---
              this.resolveDistanceConstraint(constraint);
          }
      }
  }

  /**
   * Resolves a single distance or spring constraint using iterative impulse solver.
   * @param constraint The internal constraint data.
   */
  private resolveDistanceConstraint(constraint: InternalConstraint): void {
      const { bodyA, bodyB, localPointA, localPointB } = constraint;
      // Assert the constraint type to access specific options
      if (constraint.options.type !== 'distance' && constraint.options.type !== 'spring') return;
      const options = constraint.options; // Now options is DistanceConstraintOptions | SpringConstraintOptions

      // Determine target length and parameters based on type
      const targetDistance = options.type === 'spring' ? options.restLength : options.distance;
      // Stiffness/Damping are currently used only for simple positional correction scaling, not true spring forces here
      const stiffnessFactor = 1.0; // For rigid positional correction in this solver iteration

      if (bodyA.isStatic && bodyB.isStatic) {
          return;
      }

      // --- Calculate World Attachment Points (Includes rotation) ---
      // Use VectorUtils for consistency
      const rotatedLocalA = VectorUtils.rotate(localPointA, bodyA.angle);
      const rotatedLocalB = VectorUtils.rotate(localPointB, bodyB.angle);

      const worldPointA: Vector = {
          x: bodyA.position.x + rotatedLocalA.x,
          y: bodyA.position.y + rotatedLocalA.y,
          z: bodyA.position.z ?? 0, // Assuming 2D if z is undefined
      };
      const worldPointB: Vector = {
          x: bodyB.position.x + rotatedLocalB.x,
          y: bodyB.position.y + rotatedLocalB.y,
          z: bodyB.position.z ?? 0, // Assuming 2D if z is undefined
      };

      // --- Calculate Delta and Current Distance --- 
      const delta = VectorUtils.subtract(worldPointB, worldPointA);
      const currentDistanceSq = VectorUtils.magnitudeSquared(delta);
      const currentDistance = Math.sqrt(currentDistanceSq);

      if (currentDistance < 0.0001 && targetDistance < 0.0001) {
          // Avoid division by zero if points coincide and target is zero
          return;
      }

      // --- Calculate Positional Difference --- 
      const positionError = currentDistance - targetDistance;

      // If error is negligible, skip correction
      if (Math.abs(positionError) < 0.001) { // Use a small tolerance
        return;
      }

      const normal: Vector = currentDistance < 0.0001
          ? { x: 1, y: 0, z: 0 } // Default direction if points coincide
          : VectorUtils.divide(delta, currentDistance);

      // --- Calculate Effective Mass & Impulse (Simplified for Position Correction) ---
      // Vectors from body centers to world anchor points
      const rA = VectorUtils.subtract(worldPointA, bodyA.position);
      const rB = VectorUtils.subtract(worldPointB, bodyB.position);

      // Terms involving cross product with normal (for angular contribution)
      const rACrossN = VectorUtils.cross2D(rA, normal); // Cross product z-component for 2D rotation
      const rBCrossN = VectorUtils.cross2D(rB, normal);

      // Effective mass along the constraint normal
      const k = bodyA.inverseMass + bodyB.inverseMass + 
                (rACrossN * rACrossN * bodyA.inverseInertia) + 
                (rBCrossN * rBCrossN * bodyB.inverseInertia);

      if (k <= 0.00001) { // Avoid division by zero if effective mass is near zero
        return; 
      }

      // Calculate impulse magnitude needed for positional correction
      // Simple linear correction: lambda = -Error / EffectiveMass
      // Scaled by stiffnessFactor (which is 1.0 for now for rigidity)
      const lambda = (-positionError / k) * stiffnessFactor;

      // Impulse vector
      const impulse = VectorUtils.multiply(normal, lambda);

      // --- Apply Positional Correction --- 
      // Distribute correction based on inverse mass
      // Convert impulse to positional change (deltaPos = impulse * inverseMass)
      // Note: This is a direct positional adjustment, common in iterative solvers like Sequential Impulse or PBD
      if (!bodyA.isStatic) {
          const posCorrectionA = VectorUtils.multiply(impulse, bodyA.inverseMass);
          bodyA.position = VectorUtils.add(bodyA.position, posCorrectionA);

          // Apply angular correction
          const angularCorrectionA = VectorUtils.cross2D(rA, impulse) * bodyA.inverseInertia;
          bodyA.angle += angularCorrectionA;
      }

      if (!bodyB.isStatic) {
          const posCorrectionB = VectorUtils.multiply(impulse, bodyB.inverseMass);
          bodyB.position = VectorUtils.subtract(bodyB.position, posCorrectionB);

          // Apply angular correction
          const angularCorrectionB = VectorUtils.cross2D(rB, impulse) * bodyB.inverseInertia;
          bodyB.angle -= angularCorrectionB;
      }
  }

  /**
   * Resolves a hinge constraint, ensuring anchor points coincide.
   * Note: This does NOT currently implement angular limits or motors.
   * @param constraint The internal constraint data.
   * @param options The specific hinge constraint options.
   */
  private resolveHingeConstraint(constraint: InternalConstraint, options: HingeConstraintOptions): void {
      const { bodyA, bodyB, localPointA, localPointB } = constraint;
      // Stiffness/Damping might be added later for softness or limits

      if (bodyA.isStatic && bodyB.isStatic) {
          return; // Both bodies are fixed
      }

      // --- Calculate World Attachment Points (Includes rotation) ---
      const rotatedLocalA = VectorUtils.rotate(localPointA, bodyA.angle);
      const rotatedLocalB = VectorUtils.rotate(localPointB, bodyB.angle);

      const worldPointA: Vector = {
          x: bodyA.position.x + rotatedLocalA.x,
          y: bodyA.position.y + rotatedLocalA.y,
          z: bodyA.position.z ?? 0, // Assuming 2D
      };
      const worldPointB: Vector = {
          x: bodyB.position.x + rotatedLocalB.x,
          y: bodyB.position.y + rotatedLocalB.y,
          z: bodyB.position.z ?? 0, // Assuming 2D
      };

      // --- Calculate Delta (Difference between world anchor points) ---
      const delta = VectorUtils.subtract(worldPointB, worldPointA);

      const currentDistanceSq = delta.x * delta.x + delta.y * delta.y + (delta.z ? delta.z * delta.z : 0);

      // If points nearly coincide, no positional correction needed
      if (currentDistanceSq < 0.001 * 0.001) { // Tolerance
          return; 
      }

      // Target distance for a hinge is 0
      const positionError = Math.sqrt(currentDistanceSq); // The error is the current distance

      // --- Calculate Correction ---
      // Normalize delta vector (direction of correction)
      const currentDistance = Math.sqrt(currentDistanceSq);
      const normal: Vector = currentDistance < 0.0001
          ? { x: 1, y: 0, z: 0 } // Default correction direction if points coincide exactly
          : VectorUtils.divide(delta, currentDistance);

      // --- Calculate Effective Mass & Impulse (Same as distance constraint with target=0) ---
      const rA = VectorUtils.subtract(worldPointA, bodyA.position);
      const rB = VectorUtils.subtract(worldPointB, bodyB.position);

      const rACrossN = VectorUtils.cross2D(rA, normal);
      const rBCrossN = VectorUtils.cross2D(rB, normal);

      const k = bodyA.inverseMass + bodyB.inverseMass + 
                (rACrossN * rACrossN * bodyA.inverseInertia) + 
                (rBCrossN * rBCrossN * bodyB.inverseInertia);

      if (k <= 0.00001) return; // Effective mass is zero

      // Calculate impulse magnitude: lambda = -Error / EffectiveMass
      // Error is positionError (the current distance)
      const lambda = -positionError / k;

      // Impulse vector
      const impulse = VectorUtils.multiply(normal, lambda);

      // --- Apply Positional Correction --- 
      // Distribute correction based on inverse mass to move anchors together
      // (Same impulse application as distance constraint)
      if (!bodyA.isStatic) {
          const posCorrectionA = VectorUtils.multiply(impulse, bodyA.inverseMass);
          bodyA.position = VectorUtils.add(bodyA.position, posCorrectionA);
          const angularCorrectionA = VectorUtils.cross2D(rA, impulse) * bodyA.inverseInertia;
          bodyA.angle += angularCorrectionA;
      }

      if (!bodyB.isStatic) {
          const posCorrectionB = VectorUtils.multiply(impulse, bodyB.inverseMass);
          bodyB.position = VectorUtils.subtract(bodyB.position, posCorrectionB);
          const angularCorrectionB = VectorUtils.cross2D(rB, impulse) * bodyB.inverseInertia;
          bodyB.angle -= angularCorrectionB;
      }
  }

  /**
   * Helper function to rotate a 2D vector by an angle.
   * @param v The vector { x, y } to rotate.
   * @param angle The angle in radians.
   * @returns The rotated vector.
   */
  private rotateVector(v: { x: number; y: number }, angle: number): { x: number; y: number } {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
          x: v.x * cos - v.y * sin,
          y: v.x * sin + v.y * cos
      };
  }
}

// --- Vector Math Utilities ---
// Exported utility object for vector operations
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
      console.warn('Attempted to divide vector by zero.');
      return { x: 0, y: 0, z: 0 };
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
    return Math.sqrt(this.magnitudeSquared(v));
  },
  
  /**
   * Calculate the squared magnitude of a vector (cheaper than magnitude)
   */
  magnitudeSquared(v: Vector): number {
    return v.x * v.x + v.y * v.y + (v.z ?? 0) * (v.z ?? 0);
  },
  
  /**
   * Normalize a vector (make it unit length)
   */
  normalize(v: Vector): Vector {
    const magSq = this.magnitudeSquared(v);
    if (magSq === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    const mag = Math.sqrt(magSq);
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
    const clampedT = Math.max(0, Math.min(1, t));
    return {
      x: a.x + (b.x - a.x) * clampedT,
      y: a.y + (b.y - a.y) * clampedT,
      z: (a.z ?? 0) + ((b.z ?? 0) - (a.z ?? 0)) * clampedT
    };
  },
  
  /**
   * Calculate the angle between two vectors in radians
   */
  angle(a: Vector, b: Vector): number {
    const magSqA = this.magnitudeSquared(a);
    const magSqB = this.magnitudeSquared(b);
    
    if (magSqA === 0 || magSqB === 0) {
      return 0;
    }
    
    const dot = this.dot(a, b);
    const cos = dot / (Math.sqrt(magSqA * magSqB));
    
    const clampedCos = Math.max(-1, Math.min(1, cos));
    
    return Math.acos(clampedCos);
  },
  
  /**
   * Rotate a 2D vector by an angle in radians around the Z axis
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