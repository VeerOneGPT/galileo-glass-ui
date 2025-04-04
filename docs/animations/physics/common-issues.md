# Common Physics Engine Movement Issues

This guide addresses frequently encountered issues where physics bodies don't move as expected in the Galileo Physics Engine. If your physics objects appear static or behave unexpectedly, check for these common causes.

## Bodies Not Moving At All

### 1. `isStatic` Property Set to `true`

The most common reason for immobile bodies is that they were created with the `isStatic` property set to `true`:

```typescript
// This body won't move regardless of forces applied
const staticBodyId = engine.addBody({
  shape: { type: 'circle', radius: 20 },
  position: { x: 100, y: 100 },
  isStatic: true // ← This makes the body immovable
});
```

**Solution**: Set `isStatic: false` explicitly when creating dynamic bodies:

```typescript
const dynamicBodyId = engine.addBody({
  shape: { type: 'circle', radius: 20 },
  position: { x: 100, y: 100 },
  isStatic: false // Ensure this is false for movable bodies
});
```

### 2. Infinite Mass

Bodies with infinite or extremely high mass behave like static bodies:

```typescript
// Infinite mass makes the body essentially static
const heavyBodyId = engine.addBody({
  shape: { type: 'circle', radius: 20 },
  position: { x: 100, y: 100 },
  mass: Infinity // ← Same effect as isStatic: true
});
```

**Solution**: Use reasonable mass values for dynamic bodies:

```typescript
const appropriateMassId = engine.addBody({
  shape: { type: 'circle', radius: 20 },
  position: { x: 100, y: 100 },
  mass: 1 // Use a reasonable mass value
});
```

### 3. Physics Engine Not Running

The physics engine simulation may not be properly initialized or running:

**Solution**: Verify the engine is active by checking object counts:

```typescript
// Check engine status
const engineState = verifyPhysicsEngineState(engine);
console.log("Engine status:", engineState.message);

// Manually force an update to "wake up" the engine
forcePhysicsEngineUpdate(engine, bodyId);
```

### 4. Object Is Sleeping

The Galileo Physics Engine has an optimization feature that puts objects to sleep when they stop moving:

```typescript
// By default, objects that stop moving will sleep
const engine = useGalileoPhysicsEngine({
  enableSleeping: true, // Default is true
  velocitySleepThreshold: 0.05 // Bodies below this velocity may sleep
});
```

**Solution**: Disable sleeping or apply forces to wake the object:

```typescript
// Option 1: Disable sleeping engine-wide
const engine = useGalileoPhysicsEngine({
  enableSleeping: false // Keep all bodies active
});

// Option 2: Wake a specific body with a small impulse
engine.applyImpulse(bodyId, { x: 0.0001, y: 0.0001 });
```

### 5. Constraints Restricting Movement

Bodies may be connected by constraints that limit their movement:

**Solution**: Check for constraints and modify or remove them:

```typescript
// Example: Remove a constraint
engine.removeConstraint(constraintId);

// Or modify it to be less restrictive
engine.updateConstraint(constraintId, {
  stiffness: 0.3, // Lower stiffness allows more movement
  damping: 0.1
});
```

## Bodies Move Incorrectly

### 1. Extremely High Damping

High damping values can cause objects to slow down very quickly, making them appear almost static:

```typescript
// Object with high damping will barely move
const highDampingId = engine.addBody({
  // ... other options
  damping: 0.95 // ← Very high damping
});
```

**Solution**: Use moderate damping values:

```typescript
const moderateDampingId = engine.addBody({
  // ... other options
  damping: 0.1 // More reasonable value
});
```

### 2. Gravity Settings

Unexpected movement can result from gravity settings:

```typescript
// Default gravity pulls objects downward (positive y is down)
const engine = useGalileoPhysicsEngine({
  gravity: { x: 0, y: 9.8 } // Default value
});
```

**Solutions**:

```typescript
// Option 1: Zero gravity for objects that shouldn't fall
const engine = useGalileoPhysicsEngine({
  gravity: { x: 0, y: 0 } // No gravity
});

// Option 2: Adjust specific body's response to gravity
const lowGravityId = engine.addBody({
  // ... other options
  gravityScale: 0.1 // 10% of normal gravity effect
});
```

### 3. Inverted Coordinate System

Remember that in many computer graphics systems, the Y-axis is inverted (positive Y is down):

**Solution**: Account for coordinate system in your forces:

```typescript
// To move a body upward on screen (negative Y direction):
engine.applyForce(bodyId, { x: 0, y: -10 });
```

### 4. Collision Filtering Issues

Bodies might be colliding with invisible boundaries or other objects:

```typescript
// Bodies with incompatible collision filters won't interact
const bodyA = engine.addBody({
  // ... other options
  collisionFilter: { 
    group: 1,
    mask: 0x0002 // Only collide with group 2
  }
});

const bodyB = engine.addBody({
  // ... other options
  collisionFilter: { 
    group: 3, // Not group 2, so bodyA won't collide with it
    mask: 0xFFFF
  }
});
```

**Solution**: Check and fix collision filters:

```typescript
// Ensure bodies can collide with each other
const bodyA = engine.addBody({
  // ... other options
  collisionFilter: { 
    group: 1,
    mask: 0xFFFF // Collide with everything (default)
  }
});
```

## Debugging Movement Issues

### 1. Log Body States

Logging body states can help pinpoint the issue:

```typescript
// Check a specific body's state
const bodyState = getPhysicsBodyState(engine, bodyId);
console.log("Body state:", bodyState);

// Check all active bodies
const allStates = engine.getAllBodyStates();
console.log("All body states:", allStates);
```

### 2. Visualize Physics Bodies

Adding visual debugging elements can help see what's happening:

```typescript
function renderDebugBodies() {
  const allStates = engine.getAllBodyStates();
  
  // Clear previous debug elements
  debugContainer.innerHTML = '';
  
  // Render each body
  allStates.forEach((state, id) => {
    const debugElement = document.createElement('div');
    debugElement.className = 'physics-debug-body';
    debugElement.style.position = 'absolute';
    debugElement.style.left = `${state.position.x - 2}px`;
    debugElement.style.top = `${state.position.y - 2}px`;
    debugElement.style.width = '4px';
    debugElement.style.height = '4px';
    debugElement.style.backgroundColor = state.isStatic ? 'red' : 'green';
    debugElement.title = `ID: ${id}, Velocity: ${state.velocity.x.toFixed(2)},${state.velocity.y.toFixed(2)}`;
    
    debugContainer.appendChild(debugElement);
  });
  
  requestAnimationFrame(renderDebugBodies);
}
```

### 3. Test with Simple Bodies

Create a simplified test case to isolate the issue:

```typescript
// Create a simple test body to verify engine functionality
const testBodyId = engine.addBody({
  shape: { type: 'circle', radius: 10 },
  position: { x: 100, y: 100 },
  velocity: { x: 10, y: 0 }, // Should definitely move
  isStatic: false,
  mass: 1,
  damping: 0.01, // Very low damping
  restitution: 0.8 // Bouncy
});

// Force it to move with a significant impulse
engine.applyImpulse(testBodyId, { x: 20, y: 0 });

// Track its position over time
const checkPosition = () => {
  const state = getPhysicsBodyState(engine, testBodyId);
  console.log(`Test body position at ${Date.now()}: ${state?.position.x}, ${state?.position.y}`);
};

// Check position several times
setTimeout(checkPosition, 100);
setTimeout(checkPosition, 500);
setTimeout(checkPosition, 1000);
```

## Example: Fixing a Static Object

Here's a complete example of diagnosing and fixing a static object:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { 
  useGalileoPhysicsEngine,
  getPhysicsBodyState,
  verifyPhysicsEngineState,
  forcePhysicsEngineUpdate
} from '@veerone/galileo-glass-ui';

function StaticObjectDebug() {
  const engine = useGalileoPhysicsEngine();
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const bodyIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!engine) return;
    
    // Step 1: Create a test body
    const bodyId = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: 100, y: 100 }
      // Note: Not specifying isStatic or mass
    });
    
    bodyIdRef.current = bodyId;
    
    // Step 2: Check if body was created
    const initialState = getPhysicsBodyState(engine, bodyId);
    console.log("Initial body state:", initialState);
    
    if (!initialState) {
      setDebugInfo('Error: Body state not available after creation');
      return;
    }
    
    // Step 3: Check if the engine is running
    const engineState = verifyPhysicsEngineState(engine);
    console.log("Engine state:", engineState);
    
    // Step 4: Log whether the body is static
    setDebugInfo(`Body created with ID: ${bodyId}
      isStatic: ${initialState.isStatic}
      position: ${JSON.stringify(initialState.position)}
      velocity: ${JSON.stringify(initialState.velocity)}
      Engine active: ${engineState.isActive}
    `);
    
    // Step 5: Try moving the body
    engine.applyImpulse(bodyId, { x: 10, y: -5 });
    
    // Step 6: Check if it moved after a moment
    setTimeout(() => {
      const updatedState = getPhysicsBodyState(engine, bodyId);
      
      if (!updatedState) {
        setDebugInfo(prev => prev + '\nError: Could not retrieve updated state');
        return;
      }
      
      const posChanged = 
        updatedState.position.x !== initialState.position.x || 
        updatedState.position.y !== initialState.position.y;
      
      setDebugInfo(prev => prev + `\n
        Body moved: ${posChanged}
        New position: ${JSON.stringify(updatedState.position)}
      `);
      
      // Step 7: If it didn't move, force it to be dynamic
      if (!posChanged) {
        console.log("Body didn't move, fixing...");
        
        // Fix: Ensure it's not static and has reasonable mass
        engine.updateBodyState(bodyId, {
          // Can't update isStatic directly, but can reset properties
          // that affect movement
          velocity: { x: 5, y: 0 } // Set initial velocity
        });
        
        // Apply another impulse
        engine.applyImpulse(bodyId, { x: 20, y: -10 });
        
        // Force a physics update
        forcePhysicsEngineUpdate(engine, bodyId);
        
        // Check if fix worked
        setTimeout(() => {
          const fixedState = getPhysicsBodyState(engine, bodyId);
          
          if (!fixedState) {
            setDebugInfo(prev => prev + '\nError: Could not retrieve state after fix');
            return;
          }
          
          const nowMoved = 
            fixedState.position.x !== updatedState.position.x || 
            fixedState.position.y !== updatedState.position.y;
          
          setDebugInfo(prev => prev + `\n
            Fix applied: ${nowMoved ? 'SUCCESS' : 'FAILED'}
            Final position: ${JSON.stringify(fixedState.position)}
          `);
        }, 500);
      }
    }, 500);
    
    return () => {
      if (bodyIdRef.current) {
        engine.removeBody(bodyIdRef.current);
      }
    };
  }, [engine]);
  
  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
      <h3>Physics Engine Debug</h3>
      <div>{debugInfo}</div>
    </div>
  );
}
```

## Key Takeaways

1. **Check Static Status**: Ensure `isStatic: false` for bodies that should move.
2. **Verify Mass**: Use reasonable mass values (not too low, not Infinity).
3. **Consider Damping**: High damping greatly reduces movement over time.
4. **Monitor Velocity**: Bodies below the sleep threshold may become inactive.
5. **Debug Visually**: Add visual indicators to see what's happening in the physics simulation.
6. **Test With Impulses**: When in doubt, apply a strong impulse to test if a body can move.
7. **Check Constraints**: Constraints may limit movement in unexpected ways.

If problems persist after trying these solutions, check out the [Physics Engine Debugging Guide](./physics-debugging.md) for more advanced troubleshooting techniques. 