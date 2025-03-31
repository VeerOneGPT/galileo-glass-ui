# Galileo Physics Engine API (v1.0.8)

This document describes the lower-level API for interacting directly with the Galileo physics engine, introduced in version 1.0.8. This API complements the specialized interaction hooks (like `useGesturePhysics`) by providing direct control over physics bodies and simulation events.

**Note:** This API is intended for advanced use cases like custom game mechanics or complex physics visualizations. For common UI interactions, prefer using the specialized hooks.

## Import Options

You can import the physics engine in two ways:

1. Through the main package (recommended):
```typescript
import { 
  useGalileoPhysicsEngine, 
  type PhysicsBodyOptions, 
  type Vector2D,
  type PhysicsBodyState,
  type CollisionEvent,
  type GalileoPhysicsEngineAPI
} from '@veerone/galileo-glass-ui';
```

2. Through the physics subpath (alternative):
```typescript
import { 
  useGalileoPhysicsEngine, 
  type PhysicsBodyOptions, 
  type Vector2D,
  type PhysicsBodyState,
  type CollisionEvent,
  type GalileoPhysicsEngineAPI
} from '@veerone/galileo-glass-ui/physics';
```

## `useGalileoPhysicsEngine` Hook

The primary entry point to the engine is the `useGalileoPhysicsEngine` hook.

```typescript
import { 
  useGalileoPhysicsEngine, 
  type PhysicsBodyOptions, 
  type Vector2D,
  type PhysicsBodyState,
  type CollisionEvent,
  type GalileoPhysicsEngineAPI
} from '@veerone/galileo-glass-ui';

function MyPhysicsComponent() {
  // Example: Configure gravity and other engine settings
  const customConfig = {
    gravity: { x: 0, y: -9.8 }, // Override default gravity
    defaultDamping: 0.01,       // Optional: Adjust damping
    timeScale: 1.0             // Optional: Adjust simulation speed
  };
  const engine = useGalileoPhysicsEngine(customConfig);

  useEffect(() => {
    // Engine is guaranteed non-null after initial render

    // Use engine API methods here...
    const bodyOptions: PhysicsBodyOptions = {
        shape: { type: 'circle', radius: 10 },
        position: { x: 50, y: 50 },
        mass: 1,
    };
    const bodyId = engine.addBody(bodyOptions);

    const unsubscribe = engine.onCollisionStart((event) => {
      console.log('Collision Start!', event.bodyAId, event.bodyBId);
    });

    return () => unsubscribe();

  }, [engine]); // Dependency array ensures effect runs if engine config changes

  // ... render logic using engine state (e.g., engine.getAllBodyStates()) ...
}
```

### Hook Signature

```typescript
useGalileoPhysicsEngine = (config?: EngineConfiguration): GalileoPhysicsEngineAPI;
```

*   **`config` (optional):** An object containing engine configuration options:
    ```typescript
    interface EngineConfiguration {
      gravity?: Vector2D;           // Default: { x: 0, y: 9.81 }
      defaultDamping?: number;      // Default: 0.01
      timeScale?: number;           // Default: 1.0
      fixedTimeStep?: number;       // Default: 1/60
      maxSubSteps?: number;         // Default: 10
      velocitySleepThreshold?: number;  // Default: 0.05
      angularSleepThreshold?: number;   // Default: 0.05
      sleepTimeThreshold?: number;      // Default: 1000 (ms)
      enableSleeping?: boolean;         // Default: true
      integrationMethod?: 'euler' | 'verlet' | 'rk4';  // Default: 'verlet'
      boundsCheckEnabled?: boolean;     // Default: false
      bounds?: {
        min: Vector2D;
        max: Vector2D;
      };
    }
    ```
*   **Returns:** An object implementing the `GalileoPhysicsEngineAPI` interface. The object reference is stable.

## `GalileoPhysicsEngineAPI` Interface

The hook returns an object with the following methods:

```typescript
export interface GalileoPhysicsEngineAPI {
  // Body Management
  addBody: (options: PhysicsBodyOptions) => string;
  removeBody: (id: string) => void;
  updateBodyState: (id: string, state: Partial<Omit<PhysicsBodyState, 'id' | 'isStatic'>>) => void;
  getBodyState: (id: string) => PhysicsBodyState | null;
  getAllBodyStates: () => Map<string, PhysicsBodyState>;

  // Forces & Impulses
  applyForce: (id: string, force: Vector2D, point?: Vector2D) => void;
  applyImpulse: (id: string, impulse: Vector2D, point?: Vector2D) => void;

  // Collision Events
  onCollisionStart: (callback: (event: CollisionEvent) => void) => UnsubscribeFunction;
  onCollisionActive: (callback: (event: CollisionEvent) => void) => UnsubscribeFunction;
  onCollisionEnd: (callback: (event: CollisionEvent) => void) => UnsubscribeFunction;
}
```

### Body Management

*   **`addBody(options: PhysicsBodyOptions): string`**
    *   Adds a body to both the physics simulation and collision detection systems.
    *   Returns the unique ID assigned to the body.
    *   **`PhysicsBodyOptions`:** (From `src/animations/physics/engineTypes.ts`)
        ```typescript
        export interface PhysicsBodyOptions {
          id?: string; // Optional user-provided ID
          shape: { type: 'circle', radius: number } | { type: 'rectangle', width: number, height: number };
          position: Vector2D;
          angle?: number; // Initial angle in radians
          velocity?: Vector2D;
          angularVelocity?: number; // Note: Mapped internally, may have limitations
          mass?: number; // Default: 1. Use Infinity or isStatic:true for static.
          friction?: number; // Coefficient of friction (Default: ~0.1)
          restitution?: number; // Coefficient of restitution (bounciness, Default: ~0.5)
          isStatic?: boolean; // Convenience for setting infinite mass (Default: false)
          collisionFilter?: {
            group?: number; // Mapped to collision category
            mask?: number; // Bitmask defining collision interactions
          };
          userData?: any; // Attach custom data to the body
        }
        ```
*   **`removeBody(id: string): void`**
    *   Removes the body with the specified ID from both physics and collision systems.
*   **`updateBodyState(...)`**
    *   Updates properties like position, velocity, angle. 
    *   **Warning:** This directly manipulates the body's state and can interfere with the physics simulation. Prefer using `applyForce`/`applyImpulse` for realistic movement. Its implementation might have limitations, especially regarding angular properties.
*   **`getBodyState(id: string): PhysicsBodyState | null`**
    *   Gets the current physics state of a single body from the physics system.
    *   **`PhysicsBodyState`:** (From `src/animations/physics/engineTypes.ts`)
        ```typescript
        export interface PhysicsBodyState {
          id: string;
          position: Vector2D;
          angle: number; // Radians (mapped from internal state)
          velocity: Vector2D;
          angularVelocity: number; // (mapped from internal state)
          isStatic: boolean;
          userData?: any;
        }
        ```
*   **`getAllBodyStates(): Map<string, PhysicsBodyState>`**
    *   Gets the state of all bodies from the physics system. Recommended for use within `requestAnimationFrame` for rendering.

### Forces & Impulses

*   **`applyForce(id, force, point?)`**: Applies a continuous force vector to the body's center of mass.
    *   **Note:** Applying force at a specific `point` (to induce torque) is **not currently supported** by the underlying physics system.
*   **`applyImpulse(id, impulse, point?)`**: Applies an instantaneous impulse (change in momentum) to the body's center of mass.
    *   **Note:** Applying impulse at a specific `point` is **not currently supported** by the underlying physics system.

### Collision Events

Subscribe to collision events originating from the internal `CollisionSystem`.

*   **`onCollisionStart(callback)`**: Fires when two bodies begin contact.
*   **`onCollisionActive(callback)`**: Fires on each simulation step while bodies remain in contact.
*   **`onCollisionEnd(callback)`**: Fires when two bodies cease contact.

All subscription methods return an `UnsubscribeFunction` to remove the listener.

The `callback` receives a `CollisionEvent` object:

```typescript
// From src/animations/physics/engineTypes.ts
export interface CollisionEvent {
  bodyAId: string;
  bodyBId: string;
  bodyAUserData?: any;
  bodyBUserData?: any;
  contactPoints?: Vector2D[];
  normal?: Vector2D; // Collision normal vector (points from A to B)
  penetration?: number; // How much bodies overlap
}
```

## Implementation Notes

*   The hook integrates the `GalileoPhysicsSystem` (for simulation) and `CollisionSystem` (for detection/response).
*   Collision detection is triggered based on the physics system's `step` event, ensuring synchronization.
*   Body state (position, velocity, rotation) is synchronized from the physics system to the collision system on each step.
*   `userData` is attached to bodies in both internal systems.

## Performance Considerations

*   Adding a large number of bodies or complex shapes can impact performance. Profile your specific use case.
*   The system uses a spatial grid for broad-phase collision detection by default, which helps performance in scenes with many bodies.
*   Collision event callbacks should be efficient to avoid delaying the simulation loop.

## Best Practices

*   Synchronize rendering with physics state using `requestAnimationFrame` and `getAllBodyStates`.
*   Prefer `applyForce` and `applyImpulse` over `updateBodyState` for simulated motion.
*   Use `collisionFilter` (`category` and `mask`) for efficient collision management.
*   Clean up subscriptions using the returned `UnsubscribeFunction` when components unmount.

## Examples

See the example implementation:
[`docs/examples/animations/CustomPhysicsDemo.tsx`](../examples/animations/CustomPhysicsDemo.tsx)

### Example Usage

```typescript
// Option 1: Import from main package (recommended)
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui';

// Option 2: Import from physics subpath
// import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui/physics';

function MyPhysicsComponent() {
  // Example: Configure gravity and other engine settings
  const customConfig = {
    gravity: { x: 0, y: -9.8 }, // Override default gravity
    defaultDamping: 0.01,       // Optional: Adjust damping
    timeScale: 1.0             // Optional: Adjust simulation speed
  };
  const engine = useGalileoPhysicsEngine(customConfig);

  useEffect(() => {
    // Engine is guaranteed non-null after initial render

    // Use engine API methods here...
    const bodyOptions: PhysicsBodyOptions = {
        shape: { type: 'circle', radius: 10 },
        position: { x: 50, y: 50 },
        mass: 1,
    };
    const bodyId = engine.addBody(bodyOptions);

    const unsubscribe = engine.onCollisionStart((event) => {
      console.log('Collision Start!', event.bodyAId, event.bodyBId);
    });

    return () => unsubscribe();

  }, [engine]); // Dependency array ensures effect runs if engine config changes

  // ... render logic using engine state (e.g., engine.getAllBodyStates()) ...
} 