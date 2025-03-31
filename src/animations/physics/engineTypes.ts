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

// Data provided by collision events
export interface CollisionEvent {
  bodyAId: string;
  bodyBId: string;
  bodyAUserData?: any;
  bodyBUserData?: any;
  contactPoints?: Vector2D[]; // Points of contact
  normal?: Vector2D; // Collision normal vector
  penetration?: number; // Penetration depth
}

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
} 