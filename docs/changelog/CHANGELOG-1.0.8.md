# Galileo Glass UI v1.0.8 Release Notes

This release focuses on exposing the underlying Galileo physics engine to developers for advanced use cases, enabling the creation of custom physics simulations and interactions beyond the standard UI component hooks.

## ✨ New Features

*   **Physics Engine API (`useGalileoPhysicsEngine`):**
    *   Introduced the `useGalileoPhysicsEngine` hook, providing direct access to an instance of the core physics simulation engine integrated with a collision detection system.
    *   Exposed API methods for managing physics bodies:
        *   `addBody(options: PhysicsBodyOptions): string`
        *   `removeBody(id: string): void`
        *   `updateBodyState(id: string, state: Partial<Omit<PhysicsBodyState, 'id' | 'isStatic'>>): void` (Note: Direct state manipulation, use with caution)
        *   `getBodyState(id: string): PhysicsBodyState | null`
        *   `getAllBodyStates(): Map<string, PhysicsBodyState>`
    *   Exposed API methods for applying forces and impulses (to center of mass):
        *   `applyForce(id: string, force: Vector2D, point?: Vector2D): void`
        *   `applyImpulse(id: string, impulse: Vector2D, point?: Vector2D): void`
    *   Exposed API methods for subscribing to collision events (`start`, `active`, `end`):
        *   `onCollisionStart(callback: (event: CollisionEvent) => void): UnsubscribeFunction`
        *   `onCollisionActive(callback: (event: CollisionEvent) => void): UnsubscribeFunction`
        *   `onCollisionEnd(callback: (event: CollisionEvent) => void): UnsubscribeFunction`
    *   Defined associated public types: `PhysicsBodyOptions`, `PhysicsBodyState`, `CollisionEvent`, `Vector2D`, `UnsubscribeFunction`, etc. (See `engineTypes.ts`)
    *   Added `userData` field to `CollisionBody` interface in the internal `collisionSystem`.
    *   Refactored collision system integration to use physics `step` event instead of patching `simulate`.

*   **Documentation:**
    *   Added documentation for the new Physics Engine API in `docs/physics/engine-api.md`.
    *   Created an example implementation in `docs/examples/animations/CustomPhysicsDemo.tsx` (Note: May require path adjustments or have minor lint issues).
    *   Updated `README.md` and other core documentation files to reference the new API.

## 🐛 Bug Fixes

*   Fixed various type errors and import issues related to `engineTypes.ts`, `collisionSystem.ts`, and `useGalileoPhysicsEngine.ts`, including `CollisionShape` usage and `PhysicsMaterial` definitions.
*   Ensured `Vector2D` and `UnsubscribeFunction` are correctly exported from `engineTypes.ts`.

## ⚠️ Known Issues / TODOs

*   **Testing:** Comprehensive unit and integration tests for `useGalileoPhysicsEngine` are pending.
*   **Performance:** Formal performance profiling under heavy load is pending.
*   **Point Application:** `applyForce`/`applyImpulse` do not support application at an offset point (torque) due to limitations in the underlying `GalileoPhysicsSystem`.
*   **Angular Mapping:** Mapping of `angle`/`angularVelocity` between the public API and internal systems relies on assumptions (using z-axis of internal Vector) and may require refinement in `PhysicsObject` definition.
*   **Example (`CustomPhysicsDemo.tsx`):** May require import path adjustments for final project structure. Faced persistent (potentially inaccurate) linter errors during refinement, specifically regarding the `title` attribute.
*   **Build Warnings:** Root cause of TypeScript declaration generation warnings during build still exists (previously worked around by patching).

## 🚀 Upgrade Instructions

```bash
npm install @veerone/galileo-glass-ui@1.0.8
``` 