# `usePhysicsConstraint` Hook

**Status:** Core Hook (v1.0.14+)

## Overview

The `usePhysicsConstraint` hook provides a declarative, React-friendly way to manage physics constraints between bodies within the Galileo Physics Engine. It automatically handles adding the constraint when the component mounts or the constraint options change, and removing it when the component unmounts or the options become invalid.

This simplifies constraint management compared to manually using `useEffect` with `engine.addConstraint` and `engine.removeConstraint`.

## Import

```typescript
import { usePhysicsConstraint } from '@veerone/galileo-glass-ui/hooks';

// Also import necessary engine types if defining options in the component
import { 
  useGalileoPhysicsEngine, 
  type GalileoPhysicsEngineAPI,
  type PhysicsConstraintOptions,
  type SpringConstraintOptions 
} from '@veerone/galileo-glass-ui'; 
```

## Usage

Pass the engine instance from `useGalileoPhysicsEngine` and the constraint configuration object to the hook. Ensure the body IDs in the options are valid before the hook runs.

```typescript
import React, { useState, useEffect } from 'react';
import { 
  useGalileoPhysicsEngine, 
  usePhysicsConstraint, 
  type SpringConstraintOptions 
} from '@veerone/galileo-glass-ui/hooks'; // Assuming engine types are also exported here

function MyComponentWithConstraint() {
  const engine = useGalileoPhysicsEngine();
  const [bodyId1, setBodyId1] = useState<string | null>(null);
  const [bodyId2, setBodyId2] = useState<string | null>(null);

  // Example: Create bodies when engine is ready
  useEffect(() => {
    if (!engine) return;
    setBodyId1(engine.addBody({ 
      shape: { type: 'circle', radius: 10 }, 
      position: { x: 50, y: 50 }
    }));
    setBodyId2(engine.addBody({ 
      shape: { type: 'circle', radius: 10 }, 
      position: { x: 150, y: 50 }
    }));
  }, [engine]);

  // Define constraint options - memoize or define conditionally
  // Ensure body IDs are valid before creating the options object!
  const springOptions: SpringConstraintOptions | null = (bodyId1 && bodyId2) ? {
    type: 'spring',
    bodyAId: bodyId1,
    bodyBId: bodyId2,
    restLength: 50,
    stiffness: 0.6,
    damping: 0.1
  } : null; // Pass null to remove the constraint

  // Use the hook - it handles add/remove automatically based on options
  usePhysicsConstraint(engine, springOptions);

  // ... rest of component rendering logic ...
  // Typically involves getting all body states in a render loop
  // and positioning elements based on engine.getAllBodyStates()
  return (
    <div>
      <p>Constraint managed by hook.</p>
      {/* Render visual elements for bodyId1 and bodyId2 */} 
    </div>
  );
}
```

## API

### Hook Signature

```typescript
usePhysicsConstraint = (
    engine: GalileoPhysicsEngineAPI | null | undefined,
    options: PhysicsConstraintOptions | null | undefined
) => void;
```

*   **`engine`**: The engine instance returned by `useGalileoPhysicsEngine`. The hook will do nothing if the engine is `null` or `undefined`.
*   **`options`**: The constraint configuration object (`DistanceConstraintOptions`, `SpringConstraintOptions`, `HingeConstraintOptions`).
    *   Must include `bodyAId` and `bodyBId` which must correspond to existing bodies in the engine.
    *   If `options` is `null` or `undefined`, or if `bodyAId`/`bodyBId` are missing/invalid, any constraint previously managed by *this instance* of the hook will be automatically removed.
    *   Refer to the `PhysicsConstraintOptions` type definition in `engineTypes.ts` or the `engine-api.md` documentation for details on specific constraint types and their properties.

### Behavior

*   The hook uses `useEffect` internally to manage the constraint lifecycle.
*   **Adding:** When the component mounts or when the `engine` or key properties within `options` (like `type`, `bodyAId`, `bodyBId`, `distance`, `restLength`) change, it calls `engine.addConstraint` with the provided `options`.
*   **Removing:**
    *   When the component unmounts, the cleanup function calls `engine.removeConstraint` using the ID of the constraint it added.
    *   If the `options` parameter becomes `null`/`undefined`, or if `engine` becomes `null`, the cleanup function for the previous effect also removes the constraint.
    *   If the dependencies (`engine` or key `options` properties) change, the previous effect's cleanup runs (removing the old constraint) before the new effect runs (adding the new constraint).
*   The hook stores the ID of the constraint it manages internally.
*   It logs messages to the console for adding/removing/failing constraints, which can be helpful for debugging.

This hook provides a robust and declarative way to ensure physics constraints are correctly added and removed in sync with your component's lifecycle and state. 