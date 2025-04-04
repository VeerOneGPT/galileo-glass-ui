# Physics Engine Migration Guide

This document provides guidance for migrating between versions of the Galileo Physics Engine, particularly when breaking changes or bug fixes require code updates.

## v1.0.14 - Physics Engine Bugfixes

Version 1.0.14 includes critical fixes for the Galileo Physics Engine, addressing issues with state retrieval and ref handling.

### Fixed Issues

1. **State Retrieval Bug (`getBodyState` Returns Null)**:
   - **Issue**: The `engine.getBodyState(id)` function would return `null` even when the body was successfully created in the physics system.
   - **Root Cause**: The internal ID lookup mechanism was not handling certain ID formats correctly, leading to lookup failures despite the body existing.
   - **Fix**: Enhanced lookup with robust fallback mechanisms and improved error reporting.

2. **forwardRef Implementation Error**:
   - **Issue**: Components using physics hooks with React's `forwardRef` would throw an error about incorrect parameter usage.
   - **Root Cause**: The physics hooks weren't properly merging refs passed via `forwardRef` with their internal refs.
   - **Fix**: Added proper ref merging utilities and updated affected components.

### How to Upgrade

#### For the State Retrieval Bug:

The bug is fixed in the core engine, but for maximum compatibility (especially if you need to support older versions), you can use the new utility functions:

```typescript
import { 
  useGalileoPhysicsEngine, 
  getPhysicsBodyState 
} from '@veerone/galileo-glass-ui';

function MyPhysicsComponent() {
  const engine = useGalileoPhysicsEngine();
  
  useEffect(() => {
    if (!engine) return;
    
    // Create a body
    const bodyId = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: 100, y: 100 }
    });
    
    // OLD WAY (may return null in older versions):
    const state = engine.getBodyState(bodyId);
    
    // NEW WAY (robust retrieval with fallbacks):
    const state = getPhysicsBodyState(engine, bodyId);
    
    // Rest of your code...
    
  }, [engine]);
  
  // Rest of your component...
}
```

#### For Debugging Physics Issues:

New utility functions are available for diagnosing physics engine issues:

```typescript
import { 
  verifyPhysicsEngineState, 
  forcePhysicsEngineUpdate,
  debugPhysicsEngine 
} from '@veerone/galileo-glass-ui';

// Check if the engine is running correctly
const engineState = verifyPhysicsEngineState(engine);
console.log(engineState.message); // Prints status message

// Force an update (can help "wake up" the engine)
forcePhysicsEngineUpdate(engine, bodyId);

// Comprehensive debug info
debugPhysicsEngine(engine); // Logs detailed diagnostics
```

#### For forwardRef Implementation:

If you've created custom components that use physics hooks and also forward refs, make sure to properly merge refs:

```typescript
// Before (problematic):
const MyComponent = forwardRef((props, ref) => {
  const { propA, propB } = props;
  const physicsRef = usePhysicsInteraction(); // This creates its own ref
  
  // WRONG: Simply passing the external ref won't work
  return <div ref={ref} {...physicsRef} />;
});

// After (fixed):
import { mergeRefs } from '@veerone/galileo-glass-ui';

const MyComponent = forwardRef((props, ref) => {
  const { propA, propB } = props;
  const physicsRef = usePhysicsInteraction();
  
  // CORRECT: Merge the external ref with the physics ref
  const combinedRef = useMemo(() => mergeRefs(ref, physicsRef), [ref, physicsRef]);
  
  return <div ref={combinedRef} />;
});
```

### If You Were Using Workarounds

If you implemented workarounds for these issues, you can now remove them and use the built-in fixes:

```typescript
// OLD WORKAROUND:
function getBodyStateWithFallback(engine, id) {
  const direct = engine.getBodyState(id);
  if (direct) return direct;
  
  // Fallback to getAllBodyStates
  const allStates = engine.getAllBodyStates();
  return allStates.get(id) || null;
}

// NEW SOLUTION:
// Replace with built-in function
import { getPhysicsBodyState } from '@veerone/galileo-glass-ui';
const state = getPhysicsBodyState(engine, id);
```

## Migrating from `getBodyState()` Workarounds (Pre v1.0.14)

**Issue:** In versions prior to `v1.0.14`, `engine.getBodyState(bodyId)` could sometimes incorrectly return `null`, even if the body existed. This often happened immediately after body creation or under specific timing conditions.

**Workaround Used:** A common workaround was to retrieve the state indirectly from the map returned by `engine.getAllBodyStates()`:

```typescript
// Old Workaround (Pre v1.0.14)
function getBodyStateWorkaround(engine: GalileoPhysicsEngineAPI, bodyId: string): PhysicsBodyState | null {
  const allStates = engine.getAllBodyStates(); // Map<string, PhysicsBodyState>
  return allStates.get(bodyId) || null;
}

// Usage
const state = getBodyStateWorkaround(engine, myBodyId);
```

**Fix in v1.0.14+:** The internal state management and ID handling have been improved. `engine.getBodyState(bodyId)` should now reliably return the correct `PhysicsBodyState` object if the body exists.

**Migration Steps:**

1.  **Remove Workaround:** Replace any custom functions or direct uses of `engine.getAllBodyStates().get(bodyId)` with a direct call to `engine.getBodyState(bodyId)`.

    ```typescript
    // New Code (v1.0.14+)

    // Directly use the engine method:
    const state = engine.getBodyState(myBodyId);

    if (state) {
      // Use the state object
      console.log('Body position:', state.position);
    } else {
      console.warn('Body not found:', myBodyId);
    }
    ```

2.  **Verify ID:** Ensure you are passing the exact `string` ID returned by `engine.addBody()` to `engine.getBodyState()`.

3.  **Consider Timing (If Still Null):** Although the bug is fixed, physics state updates still occur within the engine's simulation loop (`requestAnimationFrame`). If you need the state immediately after applying a force or impulse *within the same synchronous block*, the state might not reflect that change until the next frame. For immediate post-action state, consider awaiting the next frame or using event listeners if appropriate.

    ```typescript
    engine.applyImpulse(myBodyId, { x: 10, y: 0 });

    // State here might not reflect the impulse yet
    // const stateNow = engine.getBodyState(myBodyId);

    requestAnimationFrame(() => {
      // State here is more likely to reflect the impulse result
      const stateAfterFrame = engine.getBodyState(myBodyId);
      if (stateAfterFrame) {
        console.log('Velocity after impulse:', stateAfterFrame.velocity);
      }
    });
    ```

4.  **Troubleshooting:** If `getBodyState` *still* returns `null` in v1.0.14+, consult the [Troubleshooting Guide](./engine-api.md#troubleshooting-guide) in the main engine API documentation, particularly the section on State Retrieval Issues.

## Troubleshooting Remaining Issues

If you still encounter issues after upgrading:

1. Use the `debugPhysicsEngine(engine)` function to get comprehensive diagnostics.
2. Ensure the physics engine is properly initialized before trying to use it.
3. Wait for at least one animation frame after adding bodies before trying to retrieve their state.
4. Make sure you're not accidentally unmounting components using the physics engine prematurely.
5. Check the browser console for any error messages, especially related to physics or animation.

For more information, refer to the [Physics Engine API Documentation](./engine-api.md) and the [Physics Interaction Hook Documentation](../hooks/physics-interaction.md). 