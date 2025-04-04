/**
 * Defines the public API shape for the Galileo physics engine hook.
 */

// Basic types (can be expanded)
export type Vector2D = { x: number; y: number };
export type UnsubscribeFunction = () => void;

// Shape definitions
interface CircleShape {
  type: 'circle';
  radius: number;
}

interface RectangleShape {
  type: 'rectangle';
  width: number;
  height: number;
}

type PhysicsShape = CircleShape | RectangleShape; // Add more shapes later if needed

// Options for creating a new physics body
export interface PhysicsBodyOptions {
  id?: string; // Optional user-defined ID
  shape: PhysicsShape;
  position: Vector2D;
  angle?: number; // Initial angle in radians
  velocity?: Vector2D;
  angularVelocity?: number;
  mass?: number; // Use Infinity for static bodies
  friction?: number; // Coefficient of friction (e.g., 0.1)
  restitution?: number; // Coefficient of restitution (bounciness, e.g., 0.5)
  isStatic?: boolean; // Convenience for setting infinite mass
  collisionFilter?: {
    group?: number; // Collision group index
    mask?: number; // Bitmask defining which groups this body collides with
  };
  userData?: any; // For attaching custom data
}

// Readable state of a physics body
export interface PhysicsBodyState {
  id: string;
  position: Vector2D;
  angle: number; // Angle in radians
  velocity: Vector2D;
  angularVelocity: number;
  isStatic: boolean;
  userData?: any;
}

/**
 * Interface describing a collision event between two bodies.
 */
export interface CollisionEvent {
  /** The ID of the first body involved in the collision. */
  bodyAId: string;
  /** The ID of the second body involved in the collision. */
  bodyBId: string;
  /** User data associated with the first body, if any. */
  bodyAUserData?: any;
  /** User data associated with the second body, if any. */
  bodyBUserData?: any;
  /** 
   * The approximate point of contact in world coordinates. 
   * Calculation depends on the shapes involved.
   */
  contactPoint?: Vector2D;
  /** 
   * The collision normal vector, pointing from bodyA towards bodyB.
   */
  normal?: Vector2D;
  /** 
   * The depth of penetration between the bodies at the time of collision.
   */
  penetration?: number;
  /** 
   * The relative velocity between the two bodies at the point of contact.
   * Calculated as `velocityB - velocityA`.
   */
  relativeVelocity?: Vector2D;
  /**
   * The magnitude of the impulse applied to resolve the collision.
   * This value represents the intensity of the collision impact (impactForce).
   */
  impulse?: number; 
}

// --- Constraint Types ---

/** Base interface for all constraint options. */
export interface BaseConstraintOptions {
  id?: string; // Optional user-defined ID for the constraint
  bodyAId: string; // ID of the first body
  bodyBId: string; // ID of the second body
  // Optional: Define points relative to the body centers where the constraint attaches
  pointA?: Vector2D; // Default: { x: 0, y: 0 }
  pointB?: Vector2D; // Default: { x: 0, y: 0 }
  collideConnected?: boolean; // Should the connected bodies still collide? Default: false
  stiffness?: number; // Spring stiffness for soft constraints (optional)
  damping?: number; // Damping for soft constraints (optional)
}

/** Options for a Distance Constraint. */
export interface DistanceConstraintOptions extends BaseConstraintOptions {
  type: 'distance';
  distance: number; // The target distance to maintain between pointA and pointB
  // Stiffness and damping are inherited from BaseConstraintOptions
}

/** Options for a Spring Constraint (similar to Distance, but emphasizes stiffness/damping). */
export interface SpringConstraintOptions extends BaseConstraintOptions {
    type: 'spring';
    restLength: number; // The natural length of the spring
    // Requires stiffness and damping from BaseConstraintOptions
    // Ensure stiffness and damping are required or have sensible defaults when type is 'spring'?
}

/** Options for a Hinge Constraint (Revolute Joint). */
export interface HingeConstraintOptions extends BaseConstraintOptions {
  type: 'hinge';
  // Hinge connects bodies at a single world point (anchor)
  // If specified, takes precedence over pointA/pointB
  anchor?: Vector2D; 
  // Optional: Enable motor
  enableMotor?: boolean;
  motorSpeed?: number; // Target angular speed
  maxMotorTorque?: number; // Maximum torque the motor can apply
  // Optional: Enable limits
  enableLimit?: boolean;
  lowerAngle?: number; // Lower angular limit (radians)
  upperAngle?: number; // Upper angular limit (radians)
}

// Union type for all possible constraint configurations
export type PhysicsConstraintOptions =
    DistanceConstraintOptions |
    HingeConstraintOptions |
    SpringConstraintOptions; // <-- Add SpringConstraintOptions

// --- Engine API --- 

// The API object returned by useGalileoPhysicsEngine
export interface GalileoPhysicsEngineAPI {
  /**
   * Adds a new physics body to the simulation.
   * @param options Configuration options for the body.
   * @returns The unique ID of the created body.
   */
  addBody: (options: PhysicsBodyOptions) => string;

  /**
   * Removes a physics body from the simulation.
   * @param id The ID of the body to remove.
   */
  removeBody: (id: string) => void;

  /**
   * Updates the state (e.g., position, velocity) of an existing physics body.
   * Note: Directly setting state might interfere with the simulation.
   * Prefer applying forces/impulses for simulated movement.
   * @param id The ID of the body to update.
   * @param state The state properties to update.
   */
  updateBodyState: (id: string, state: Partial<Omit<PhysicsBodyState, 'id' | 'isStatic'>>) => void;

  /**
   * Retrieves the current physics state of a specific body.
   * @param id The ID of the body to query.
   * @returns The current state or null if the body doesn't exist.
   */
  getBodyState: (id: string) => PhysicsBodyState | null;
  
  /**
   * Retrieves the current physics state of all bodies in the simulation.
   * Recommended for use within a requestAnimationFrame loop for rendering.
   * @returns A Map where keys are body IDs and values are their states.
   */
  getAllBodyStates: () => Map<string, PhysicsBodyState>;

  /**
   * Applies a continuous force to a body.
   * @param id The ID of the target body.
   * @param force The force vector { x, y }.
   * @param point Optional point relative to the body's center where the force is applied.
   */
  applyForce: (id: string, force: Vector2D, point?: Vector2D) => void;

  /**
   * Applies an instantaneous impulse (change in momentum) to a body.
   * @param id The ID of the target body.
   * @param impulse The impulse vector { x, y }.
   * @param point Optional point relative to the body's center where the impulse is applied.
   */
  applyImpulse: (id: string, impulse: Vector2D, point?: Vector2D) => void;

  /**
   * Subscribes to events triggered when two bodies start colliding.
   * @param callback The function to call when a collision starts.
   * @returns An unsubscribe function.
   */
  onCollisionStart: (callback: (event: CollisionEvent) => void) => UnsubscribeFunction;

  /**
   * Subscribes to events triggered while two bodies are actively colliding.
   * @param callback The function to call during active collision.
   * @returns An unsubscribe function.
   */
  onCollisionActive: (callback: (event: CollisionEvent) => void) => UnsubscribeFunction;

  /**
   * Subscribes to events triggered when two bodies stop colliding.
   * @param callback The function to call when a collision ends.
   * @returns An unsubscribe function.
   */
  onCollisionEnd: (callback: (event: CollisionEvent) => void) => UnsubscribeFunction;

  // --- Constraints API --- 

  /**
   * Adds a constraint between two bodies.
   * @param options Configuration options for the constraint.
   * @returns The unique ID of the created constraint.
   */
  addConstraint: (options: PhysicsConstraintOptions) => string;

  /**
   * Removes a constraint from the simulation.
   * @param id The ID of the constraint to remove.
   */
  removeConstraint: (id: string) => void;
} 