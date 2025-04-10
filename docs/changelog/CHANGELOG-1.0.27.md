# Changelog for v1.0.27

## Release Date: [Insert Date - e.g., April 15, 2024]

## Major Changes

### Critical Physics Engine Stability Fixes (Bugs #22, #25)

Addressed multiple critical "Maximum update depth exceeded" errors related to the physics engine and component interactions:

*   **v1.0.25 Fix:** Resolved infinite loops caused by synchronous state updates within physics event callbacks (like collision events). Event dispatch is now handled asynchronously to prevent immediate re-renders that violate React's update limits.
*   **v1.0.26 Fix:** Fixed infinite loops occurring *within* library components (`GlassStepper`, `DataChart` with physics zoom/pan) during initialization or interaction. This involved correcting internal state management, effect dependencies, and physics integration logic within these components and related hooks (`useVectorSpring`, `useChartPhysicsInteraction`, `usePhysicsInteraction`).
*   **v1.0.27 Fix:** Resolved high-frequency update loops during interactions (e.g., drag gestures) by replacing `setTimeout(0)` with `requestAnimationFrame` for physics-driven state updates in `useGalileoPhysicsEngine` and implementing better update throttling.

### Physics Interaction Hook & Component Fixes (Bugs #23, #24)

*   **Fixed Core Hook Exports (Bug #24):** Resolved issues preventing `useGesturePhysics` and `useGalileoPhysicsEngine` from being reliably imported and used from the main package entry point. Updated exports and documentation.
*   **Restored DataChart Physics Zoom/Pan (Bug #23):** Fixed an issue where the physics-based zoom (scroll) and pan (drag) features in `DataChart` became non-functional after previous physics fixes. Restored the expected behavior when `interaction.zoomPanEnabled: true`.

### `useEnhancedReducedMotion` Stability Fix (Bug #27)

*   **Fixed Infinite Loops:** Resolved "Maximum update depth exceeded" errors caused by `useEnhancedReducedMotion` when used as a dependency in other hooks (like the initial version of `useScrollReveal`). Added proper memoization and optimizations to ensure stable return values.
*   **Fixed `Fab` Component:** Addressed a related infinite loop in the `Fab` component by correctly memoizing derived values and fixing hook dependency arrays.
*   **Applied Best Practices:** Reviewed and updated hook usage across the library to prefer primitive values and stable references in dependency arrays, enhancing overall stability.

### New Features & Enhancements

*   **Added Scroll Reveal:** Introduced the `useScrollReveal` hook and `ScrollReveal` component to easily apply scroll-triggered entrance animations (fade, slide, zoom) using `IntersectionObserver` and spring physics. Includes configuration options and respects reduced motion preferences.
*   **Consolidated Adaptive Quality Hook:** Deprecated `useQualityTier` and `useDeviceCapabilities`, replacing them with a single, more comprehensive `useAdaptiveQuality` hook. This new hook includes detection for battery saver, data saver, network capabilities, WebGL support, and allows user overrides via localStorage.

## Documentation Updates

*   Added documentation for the new `useScrollReveal` hook and component (`docs/hooks/useScrollReveal.md`).
*   Added documentation and examples for the new `useAdaptiveQuality` hook (`docs/animations/context-config.md`, `docs/hooks/import-paths.md`, `docs/core/framework-guide.md`).
*   Updated documentation regarding safe usage of physics event callbacks.
*   Updated documentation on the correct usage patterns for `useEnhancedReducedMotion`.
*   Created examples demonstrating physics optimization techniques (`docs/examples/physics-optimization.tsx`).
*   Created examples demonstrating correct `useGesturePhysics` usage (`docs/examples/gesture-physics-demo.tsx`).
*   Enhanced `docs/hooks/import-paths.md` to clarify supported import paths and document TypeScript workarounds for known declaration issues with physics hooks.

## Hook Import Path Clarifications

*   `useScrollReveal` and `ScrollReveal` should be imported from the main package entry point: `@veerone/galileo-glass-ui`.
*   `useGesturePhysics` and `useGalileoPhysicsEngine` should be imported from the main package entry point: `@veerone/galileo-glass-ui`. Refer to `docs/hooks/import-paths.md` for details and workarounds if TypeScript errors occur.
*   `useAdaptiveQuality` should be imported from the main package entry point: `@veerone/galileo-glass-ui`.

## Internal Changes

*   Refactored internal state management and effect dependencies in physics-related components and hooks.
*   Applied hook usage best practices (memoization, stable dependencies) across the codebase.
*   Removed deprecated hooks (`useQualityTier`, `useDeviceCapabilities`).

## Known Issues

*   While core physics hooks exports are fixed, some TypeScript environments might still show declaration errors for `useGesturePhysics` or `useGalileoPhysicsEngine`. Workarounds are documented in `docs/hooks/import-paths.md`.

## Breaking Changes

*   Removed `useQualityTier` and `useDeviceCapabilities`. Use the new `useAdaptiveQuality` hook instead. (Technically breaking, but replaces deprecated hooks with a superior alternative). 