# Galileo Glass UI - Changelog Version 1.0.13

## Release Date: 04-01-2025

## Overview

This patch release addresses several key bug fixes related to physics interactions, hook exports, and component implementations, improving stability and developer experience.

## Key Changes

### Bug Fixes

-   **`usePhysicsInteraction` Hook:**
    -   Fixed 3D tilt effect (`affectsTilt: true`) functionality. It now correctly responds to pointer position.
    -   Corrected the returned `state` object: `state.x`, `state.y`, `state.z` now accurately reflect the spring's translation offset, while new `state.relativeX` and `state.relativeY` provide the pointer's normalized position relative to the element center (-1 to 1).
    -   Switched internal event listeners from mouse events to pointer events for better device compatibility.
    -   Removed the outdated `eventHandlers` return value, as listeners are now handled internally.
    -   Updated documentation (`docs/animations/physics-hooks.md`) to reflect these changes, including the requirement for a parent element with `perspective` for the tilt effect.
-   **Hook Exports (`src/hooks/index.ts`):**
    -   Added missing exports for `useAnimationSequence` and `useGesturePhysics`, allowing them to be imported and used as intended.
    -   Corrected exported type names associated with these hooks (e.g., `AnimationSequenceConfig` instead of `AnimationSequenceOptions`).
-   **`Timeline` Component:**
    -   Modularized Component
    -   Fixed miscellaneous linter errors related to type compatibility and preset naming conventions within `GlassTimeline` and `TimelineEvent`.
-   **`CollisionSystem` (Internal):**
    -   Investigated bug report regarding `onCollisionStart`/`End` events not firing in `useGalileoPhysicsEngine`. Analysis pointed towards potential issues within the internal `CollisionSystem`'s spatial grid or event emission logic (no code changes made in this release, but investigation completed).

### Build & Tooling

-   Resolved various TypeScript errors that could previously cause build failures or warnings (e.g., incorrect type re-exports in `src/components/Timeline/index.ts`).

## Developer Notes

-   Developers using the 3D tilt effect (`affectsTilt: true`) with `usePhysicsInteraction` should ensure a parent element has the `perspective` CSS property set.
-   The `useAnimationSequence` and `useGesturePhysics` hooks are now available for import.
-   The `Timeline` component should now build without TypeScript errors related to `@react-spring/web`.

---

<!-- Optional: Link to specific PRs or issue numbers if available -->
<!-- [Link to v1.0.13 Build Notes](1.0.13-build-notes.md) --> 