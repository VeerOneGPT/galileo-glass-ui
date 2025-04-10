# Galileo Physics Engine API (v1.0.8)

This document describes the lower-level API for interacting directly with the Galileo physics engine, introduced in version 1.0.8. This API complements the specialized interaction hooks (like `useGesturePhysics`) by providing direct control over physics bodies and simulation events.

> **Note on Hook Names:** The physics engine hook is implemented as `useGalileoPhysicsEngine` and is also available via the alias `usePhysicsEngine`. Both names can be used interchangeably throughout your code. This documentation primarily uses the original name `useGalileoPhysicsEngine`, but you can substitute `usePhysicsEngine` in any example.

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
  type GalileoPhysicsEngineAPI,
  type PhysicsConstraintOptions,
  type DistanceConstraintOptions,
  type SpringConstraintOptions,
  type HingeConstraintOptions
} from '@veerone/galileo-glass-ui';
```

2. Through the physics subpath (alternative):
```typescript
import { 
  usePhysicsEngine, 
  type PhysicsBodyOptions, 
  type Vector2D,
  type PhysicsBodyState,
  type CollisionEvent,
  type GalileoPhysicsEngineAPI,
  type PhysicsConstraintOptions,
  type DistanceConstraintOptions,
  type SpringConstraintOptions,
  type HingeConstraintOptions
} from '@veerone/galileo-glass-ui/physics';
```

## `useGalileoPhysicsEngine` Hook (also available as `usePhysicsEngine`)

The primary entry point to the engine is the `useGalileoPhysicsEngine` hook, which is also available as `usePhysicsEngine` (an alias). Both names can be used interchangeably.

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
useGalileoPhysicsEngine = (config?: PhysicsEngineConfig): GalileoPhysicsEngineAPI;
```

*   **`config` (optional):** An object providing configuration options for the physics world.
    ```typescript
    // Intended Public Configuration Options
    export interface PhysicsEngineConfig {
      gravity?: Vector2D;           // Global gravity vector. Default: { x: 0, y: 9.8 }
      timeScale?: number;           // Multiplier for simulation speed. Default: 1.0
      enableSleeping?: boolean;     // Allow bodies to sleep when inactive? Default: true
      velocitySleepThreshold?: number;  // Velocity magnitude below which a body can sleep. Default: 0.05
      angularSleepThreshold?: number; // Angular velocity (radians/s) below which a body can sleep. Default: 0.05
      sleepTimeThreshold?: number;    // Time (ms) a body must be inactive to sleep. Default: 1000
      // Note: Other internal config like fixedTimeStep, maxSubSteps, integrationMethod are generally not exposed.
    }
    ```
*   **Returns:** An object implementing the `GalileoPhysicsEngineAPI` interface. The object reference is stable.

### Animation Loop / State Updates

**Important:** The `useGalileoPhysicsEngine` hook does **not** provide built-in `onUpdate` or `tick` events for subscribing to per-frame physics updates. To get the state of physics bodies for rendering or other effects, you must implement your own animation loop, typically using `requestAnimationFrame`:

```typescript
useEffect(() => {
  if (!engine) return;

  let animationFrameId: number;

  const updateLoop = () => {
    const allStates = engine.getAllBodyStates(); // Get current state of all bodies
    
    // Iterate through states and update your component visuals
    allStates.forEach((state, bodyId) => {
      // Example: Find corresponding DOM element and apply transform
      const element = document.getElementById(bodyId); 
      if (element) {
        element.style.transform = `translate(${state.position.x}px, ${state.position.y}px) rotate(${state.angle}rad)`;
      }
    });

    animationFrameId = requestAnimationFrame(updateLoop);
  };

  animationFrameId = requestAnimationFrame(updateLoop); // Start the loop

  return () => {
    cancelAnimationFrame(animationFrameId); // Stop the loop on unmount
  };
}, [engine]);
```

Referencing the implementation of hooks like `usePhysicsLayout` can provide further examples of this pattern.

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

  // Constraints (v1.0.14+)
  addConstraint: (options: PhysicsConstraintOptions) => string;
  removeConstraint: (id: string) => void;
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

**Important Behavior Change (v1.0.25+):** 

*   The `callback` function you provide to these methods is now executed **asynchronously** using `setTimeout(..., 0)`. 
*   This change prevents potential "Maximum update depth exceeded" errors in React if your callback synchronously updates component state during the initial physics steps.
*   **Implication:** Do not rely on the callback executing within the same synchronous tick as the collision event. If you need to update React state based on collision events, the asynchronous execution is generally safer. However, be mindful that the physics state might have changed slightly between the collision occurring and your callback executing.

All subscription methods return an `UnsubscribeFunction` to remove the listener.

The `callback` receives a `CollisionEvent` object:

```typescript
// From src/animations/physics/engineTypes.ts
export interface CollisionEvent {
  bodyAId: string;
  bodyBId: string;
  bodyAUserData?: any;
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
   * This value represents the change in momentum during the collision, 
   * which is a direct measure of the collision's intensity.
   */
  impulse?: number; 
}
```

**Key Collision Data:**
*   `contactPoint`: Useful for positioning collision effects (e.g., sparks).
*   `relativeVelocity`: Can be used to determine the speed of impact along the collision normal (`dotProduct(relativeVelocity, normal)`).
*   `impulse`: A direct measure of the collision's intensity. Higher values indicate stronger impacts. Useful for triggering different sound effects, visual feedback, or game logic based on impact strength.

For detailed examples of using collision events to drive UI updates efficiently, see the [Event-Driven Physics Updates](./event-driven-updates.md) guide.

### Constraints (v1.0.14+)

Methods for adding and removing constraints between physics bodies. Constraints enforce specific geometric relationships (like fixed distance, coincident points, or orientation limits) between two bodies.

*   **`addConstraint(options: PhysicsConstraintOptions): string`**
    *   Adds a constraint between two bodies based on the provided options.
    *   Returns the unique ID assigned to the constraint, or an empty string on failure (e.g., if body IDs are invalid).
    *   **`PhysicsConstraintOptions`:** (Union type from `src/animations/physics/engineTypes.ts`)
        ```typescript
        // Base options common to all constraints
        export interface BaseConstraintOptions {
          id?: string; // Optional user-defined ID for the constraint
          bodyAId: string; // ID of the first body
          bodyBId: string; // ID of the second body
          // Optional: Define points relative to the body centers where the constraint attaches
          pointA?: Vector2D; // Default: { x: 0, y: 0 }
          pointB?: Vector2D; // Default: { x: 0, y: 0 }
          collideConnected?: boolean; // Should the connected bodies still collide? Default: false
          stiffness?: number; // Spring stiffness (0 to 1 typical). Used by Distance, Spring, Hinge (positional).
          damping?: number; // Damping factor (0 to 1 typical). Used by Spring.
        }

        // Distance Constraint: Maintains a fixed distance
        export interface DistanceConstraintOptions extends BaseConstraintOptions {
          type: 'distance';
          distance: number; // Target distance between pointA and pointB
          // Inherits stiffness for 'softness'
        }

        // Spring Constraint: Acts like a damped spring between two points
        export interface SpringConstraintOptions extends BaseConstraintOptions {
            type: 'spring';
            restLength: number; // The natural length of the spring
            stiffness: number; // Spring stiffness (e.g., 0.5)
            damping: number; // Damping factor (e.g., 0.1)
        }

        // Hinge Constraint: Restricts relative rotation (like a door hinge)
        export interface HingeConstraintOptions extends BaseConstraintOptions {
          type: 'hinge';
          // Hinge connects bodies at a single world point (anchor)
          // If specified, takes precedence over pointA/pointB - NOT IMPLEMENTED YET
          // anchor?: Vector2D; 
          // Optional: Enable motor - NOT IMPLEMENTED YET
          // enableMotor?: boolean;
          // motorSpeed?: number;
          // maxMotorTorque?: number;
          // Optional: Enable limits - NOT IMPLEMENTED YET
          // enableLimit?: boolean;
          // lowerAngle?: number; // Radians
          // upperAngle?: number; // Radians
        }

        // Union of all constraint types
        export type PhysicsConstraintOptions =
            DistanceConstraintOptions |
            HingeConstraintOptions |
            SpringConstraintOptions;
        ```
*   **`removeConstraint(id: string): void`**
    *   Removes the constraint with the specified ID from the simulation.
    *   Does nothing if the ID is not found.

**Implementation Notes (Constraints v1.0.14):**
*   Constraints are resolved iteratively within the physics `step` using positional correction.
*   `DistanceConstraint` uses the `stiffness` parameter to control how strongly the target distance is enforced (lower values are softer).
*   `SpringConstraint` uses `stiffness` and `damping` to simulate a damped harmonic oscillator between the attachment points, aiming for the `restLength`.
*   `HingeConstraint` currently only enforces the positional aspect: keeping the world-space positions of `pointA` (rotated by bodyA's angle) and `pointB` (rotated by bodyB's angle) coincident. Angular limits and motors are **not implemented**. Using the `anchor` property is **not implemented**.
*   The `collideConnected` option is not yet implemented; connected bodies will not collide with each other regardless of this setting.

**Example: Adding a Spring Constraint**

```typescript
useEffect(() => {
  if (!engine) return;

  const bodyId1 = engine.addBody({ /* ... options ... */ });
  const bodyId2 = engine.addBody({ /* ... options ... */ });

  const springOptions: SpringConstraintOptions = {
    type: 'spring',
    bodyAId: bodyId1,
    bodyBId: bodyId2,
    restLength: 50,
    stiffness: 0.6,
    damping: 0.1,
    pointA: { x: 0, y: 10 }, // Attach 10 units above center of body 1
    pointB: { x: 0, y: -10 } // Attach 10 units below center of body 2
  };

  const constraintId = engine.addConstraint(springOptions);
  console.log('Added spring constraint:', constraintId);

  // Cleanup function to remove the constraint
  return () => {
    if (constraintId) {
      engine.removeConstraint(constraintId);
      console.log('Removed spring constraint:', constraintId);
    }
  };
}, [engine]);
```

## Declarative Constraint Management

For a more React-friendly way to manage constraints declaratively, see the `usePhysicsConstraint` hook documentation (located in `docs/hooks/usePhysicsConstraint.md`).

## Implementation Notes

*   The hook integrates the `GalileoPhysicsSystem` (for simulation) and `CollisionSystem` (for detection/response).
*   Collision detection is triggered based on the physics system's `step` event, ensuring synchronization.
*   Body state (position, velocity, rotation) is synchronized from the physics system to the collision system on each step.
*   `userData` is attached to bodies in both internal systems.

## Performance Considerations

*   Adding a large number of bodies or complex shapes can impact performance. Profile your specific use case.
*   The system uses a spatial grid for broad-phase collision detection by default, which helps performance in scenes with many bodies.
*   Collision event callbacks should be efficient to avoid delaying the simulation loop.

## Troubleshooting Guide

This section addresses common issues developers may encounter when working with the Galileo Physics Engine and provides solutions.

### State Retrieval Issues

**Problem:** `engine.getBodyState(bodyId)` returns `null` even though body creation was successful.

**Solutions:**

1. **Use State Retrieval Utility (Recommended)**: A reliable utility function is provided:
   ```typescript
   // Import from the main hooks export
   import { getPhysicsBodyState } from '@veerone/galileo-glass-ui/hooks';
   
   // ... inside component ...
   const state = getPhysicsBodyState(engine, bodyId);
   ```

2. **Verify the Body ID**: Always use the exact ID returned from `addBody()`. String vs. number type issues have been fixed in v1.0.14.

3. **Wait for Physics Updates**: The physics system may need at least one update cycle to initialize body states.
   ```typescript
   // Create body
   const bodyId = engine.addBody({ /* options */ });
   
   // Wait for next frame
   requestAnimationFrame(() => {
     const state = engine.getBodyState(bodyId);
     // Use state here...
   });
   ```

4. **Force a Physics Update**: You can trigger an update to ensure the physics state is current using another utility:
   ```typescript
   // Import from the main hooks export
   import { forcePhysicsEngineUpdate } from '@veerone/galileo-glass-ui/hooks';
   
   // ... inside component ...
   forcePhysicsEngineUpdate(engine, bodyId);
   const state = engine.getBodyState(bodyId); // State should now be available
   ```

5. **Check Engine Status**: Use the diagnostic utility to verify the engine is working correctly:
   ```typescript
   // Import from the main hooks export
   import { verifyPhysicsEngineState } from '@veerone/galileo-glass-ui/hooks';
   
   // ... inside component ...
   const status = verifyPhysicsEngineState(engine);
   console.log(status.message);
   ```

**Note:** If you're using a version prior to 1.0.14, you can implement a workaround by retrieving the state from `getAllBodyStates()`. See the [migration guide](./migration-guides.md) for details.

### Bodies Not Moving as Expected

**Problem:** Physics bodies don't respond to forces or appear static when they should be moving.

**Solutions:**

1. **Verify Engine is Running**: The physics loop should start automatically, but for debugging:
   ```typescript
   // Check if engine is creating bodies successfully
   const bodyId = engine.addBody({
     position: { x: 100, y: 100 },
     velocity: { x: 50, y: 0 },
     shape: { type: 'circle', radius: 10 }
   });
   console.log("Initial body state:", engine.getBodyState(bodyId));
   
   // Force a state update to trigger the physics loop
   engine.updateBodyState(bodyId, { 
     velocity: { x: 50, y: 0 } // Even re-applying the same velocity helps
   });
   ```

2. **Check Static Bodies**: Ensure bodies aren't accidentally static:
   ```typescript
   // Explicitly set isStatic to false for dynamic bodies
   const bodyId = engine.addBody({
     // ...other options
     isStatic: false, // Must be false for movement
     mass: 1 // Must NOT be Infinity for dynamic bodies
   });
   ```

3. **Apply Forces/Impulses**: If bodies aren't moving, try applying direct forces:
   ```typescript
   // Apply a significant impulse to verify movement
   engine.applyImpulse(bodyId, { x: 100, y: 0 });
   ```

For a comprehensive guide to diagnosing and fixing issues with static or incorrectly moving bodies, see [Common Physics Engine Movement Issues](./common-issues.md).

### Collision Detection Issues

**Problem:** Collisions aren't being detected or collision events aren't firing.

**Solutions:**
1. **Verify Collision Registration**: Make sure you've subscribed to collision events:
   ```typescript
   // Log for confirmation that subscription happened
   const unsubscribe = engine.onCollisionStart((event) => {
     console.log("Collision detected:", event);
   });
   console.log("Collision listener registered");
   ```

2. **Check Collision Filters**: Bodies might have incompatible collision filters:
   ```typescript
   // Ensure collision masks allow interaction
   const bodyA = engine.addBody({
     // ...other options
     collisionFilter: {
       group: 1, // Same group will collide by default
       mask: 0xFFFFFFFF // Allow collision with all groups
     }
   });
   ```

3. **Verify Body Shapes**: Ensure collision shapes are appropriate:
   ```typescript
   // For better collision detection, use explicit radius/dimensions
   const smallBody = engine.addBody({
     shape: { type: 'circle', radius: 5 }, // Too small can miss collisions
     // ...other options
   });
   const largeBody = engine.addBody({
     shape: { type: 'rectangle', width: 50, height: 50 },
     // ...other options
   });
   ```

For advanced physics engine debugging and visualization, see our [Physics Engine Debugging Guide](./physics-debugging.md) which includes visualization tools to help you see exactly what's happening in your physics simulation.

### Event-Based Updates

**Problem:** Polling with `getBodyState()` isn't efficient for tracking position changes.

**Solution:** Use collision events for reactive updates:
```typescript
// Set up a reactive system using collision events
const bodyIds = new Set(); // Track bodies of interest

// Add bodies you want to track
const targetId = engine.addBody({/* options */});
bodyIds.add(targetId);

// Get position updates during collisions
engine.onCollisionActive((event) => {
  if (bodyIds.has(event.bodyAId) || bodyIds.has(event.bodyBId)) {
    // Get the body ID we care about
    const id = bodyIds.has(event.bodyAId) ? event.bodyAId : event.bodyBId;
    const state = engine.getBodyState(id);
    if (state) {
      // Update your UI with the new position
      updateElementPosition(state.position);
    }
  }
});

// Alternative: Set up a render loop for continuous updates
// (More appropriate for game-like interfaces)
function updateFrame() {
  bodyIds.forEach(id => {
    const state = engine.getBodyState(id);
    if (state) {
      updateElementPosition(id, state.position);
    }
  });
  requestAnimationFrame(updateFrame);
}
requestAnimationFrame(updateFrame);
```

### Performance Issues

**Problem:** Physics simulations are slow or dropping frames.

**Solutions:**
1. **Reduce Body Count**: Limit the number of physics bodies in your scene.
2. **Use Simple Shapes**: Prefer circles over rectangles where possible.
3. **Enable Sleeping**: Bodies at rest can "sleep" to save CPU:
   ```typescript
   const engine = useGalileoPhysicsEngine({
     enableSleeping: true,
     velocitySleepThreshold: 0.05,
     sleepTimeThreshold: 500 // ms
   });
   ```
4. **Optimize Collision Filters**: Use collision groups/masks to limit collision checks.
5. **Clean Up**: Remove bodies when no longer needed:
   ```typescript
   useEffect(() => {
     const bodyIds = []; // Store IDs
     // Add bodies...
     
     return () => {
       // Clean up when component unmounts
       bodyIds.forEach(id => engine.removeBody(id));
     };
   }, [engine]);
   ```

For detailed performance optimization strategies and real-time monitoring tools, see the [Performance Profiling](./physics-debugging.md#performance-profiling) section in our Physics Debugging Guide.

### Complete Lifecycle Example

Here's a comprehensive example showing the complete lifecycle of collision detection with the physics engine:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui';

function PhysicsDemo() {
  const [collisionCount, setCollisionCount] = useState(0);
  const bodyARef = useRef(null);
  const bodyBRef = useRef(null);
  
  // 1. Initialize the physics engine
  const engine = useGalileoPhysicsEngine({
    gravity: { x: 0, y: 0 }, // No gravity for this example
    enableSleeping: false    // Keep bodies active
  });
  
  useEffect(() => {
    if (!engine) return;
    
    console.log("Physics engine initialized");
    
    // 2. Create two bodies that will collide
    const bodyA = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: 100, y: 150 },
      velocity: { x: 50, y: 0 },  // Moving right
      mass: 1,
      restitution: 0.8,           // Bouncy
      friction: 0.1,
      isStatic: false,
      userData: { type: 'playerBall' }  // Custom data
    });
    
    const bodyB = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: 300, y: 150 },
      velocity: { x: -50, y: 0 }, // Moving left
      mass: 1,
      restitution: 0.8,
      friction: 0.1,
      isStatic: false,
      userData: { type: 'enemyBall' }
    });
    
    // Store body IDs for later use
    bodyARef.current = bodyA;
    bodyBRef.current = bodyB;
    
    console.log("Bodies created:", bodyA, bodyB);
    
    // Verify body states are initialized
    setTimeout(() => {
      console.log("Body A state:", engine.getBodyState(bodyA));
      console.log("Body B state:", engine.getBodyState(bodyB));
    }, 32);
    
    // 3. Set up collision event listeners
    const unsubscribeStart = engine.onCollisionStart((event) => {
      console.log("Collision started:", event);
      
      // Extract user data from the event
      const bodyAData = event.bodyAUserData;
      const bodyBData = event.bodyBUserData;
      
      console.log("Collision between:", bodyAData?.type, "and", bodyBData?.type);
      console.log("Impact impulse:", event.impulse);
      console.log("Contact point:", event.contactPoint);
      
      // Update component state
      setCollisionCount(prev => prev + 1);
      
      // Play sound or trigger visual effect based on impact force
      if (event.impulse > 50) {
        console.log("Strong collision detected!");
        // triggerCollisionEffect(event.contactPoint);
      }
    });
    
    const unsubscribeActive = engine.onCollisionActive((event) => {
      // Only log occasionally to avoid console spam
      if (Math.random() < 0.1) {
        console.log("Collision active:", event.bodyAId, event.bodyBId);
      }
      
      // Get updated positions during collision
      const stateA = engine.getBodyState(event.bodyAId);
      const stateB = engine.getBodyState(event.bodyBId);
      
      // Use these states to update UI elements
      // updateVisualPosition('ballA', stateA.position);
      // updateVisualPosition('ballB', stateB.position);
    });
    
    const unsubscribeEnd = engine.onCollisionEnd((event) => {
      console.log("Collision ended:", event.bodyAId, event.bodyBId);
    });
    
    // 4. Set up walls to keep bodies in view
    // Top wall
    engine.addBody({
      shape: { type: 'rectangle', width: 600, height: 20 },
      position: { x: 300, y: -10 },
      isStatic: true
    });
    
    // Bottom wall
    engine.addBody({
      shape: { type: 'rectangle', width: 600, height: 20 },
      position: { x: 300, y: 310 },
      isStatic: true
    });
    
    // Left wall
    engine.addBody({
      shape: { type: 'rectangle', width: 20, height: 300 },
      position: { x: -10, y: 150 },
      isStatic: true
    });
    
    // Right wall
    engine.addBody({
      shape: { type: 'rectangle', width: 20, height: 300 },
      position: { x: 610, y: 150 },
      isStatic: true
    });
    
    // 5. Set up a render loop for visualization (optional)
    const canvasRef = document.getElementById('physics-canvas');
    if (canvasRef) {
      const ctx = canvasRef.getContext('2d');
      
      function render() {
        // Clear canvas
        ctx.clearRect(0, 0, 600, 300);
        
        // Get all body states
        const allBodies = engine.getAllBodyStates();
        
        // Render each body
        allBodies.forEach((state) => {
          ctx.beginPath();
          // Assuming all bodies are circles for simplicity
          ctx.arc(state.position.x, state.position.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = state.id === bodyA ? 'blue' : 'red';
          ctx.fill();
        });
        
        requestAnimationFrame(render);
      }
      
      requestAnimationFrame(render);
    }
    
    // 6. Clean up when component unmounts
    return () => {
      // Unsubscribe from collision events
      unsubscribeStart();
      unsubscribeActive();
      unsubscribeEnd();
      
      // Remove all bodies
      if (bodyARef.current) engine.removeBody(bodyARef.current);
      if (bodyBRef.current) engine.removeBody(bodyBRef.current);
      
      console.log("Physics cleanup complete");
    };
  }, [engine]); // Dependency on engine ensures effect runs once when engine is available
  
  // User interaction example: Apply impulse to body A
  const applyImpulse = () => {
    if (bodyARef.current) {
      engine.applyImpulse(bodyARef.current, { x: 100, y: -50 });
      console.log("Impulse applied to Body A");
    }
  };
  
  return (
    <div>
      <h2>Physics Collision Demo</h2>
      <p>Collision count: {collisionCount}</p>
      <button onClick={applyImpulse}>Apply Impulse</button>
      <div 
        style={{ 
          width: 600, 
          height: 300, 
          border: '1px solid black',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <canvas id="physics-canvas" width={600} height={300} />
      </div>
    </div>
  );
}

export default PhysicsDemo;
```

## Best Practices

*   Synchronize rendering with physics state using `requestAnimationFrame` and `getAllBodyStates`.
*   Prefer `applyForce` and `applyImpulse` over `updateBodyState` for simulated motion.
*   Use `collisionFilter` (`category` and `mask`) for efficient collision management.
*   Clean up subscriptions using the returned `UnsubscribeFunction` when components unmount.

## Examples

See the example implementation:
[`examples/animations/CustomPhysicsDemo.stories.tsx`](../examples/animations/CustomPhysicsDemo.stories.tsx)

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