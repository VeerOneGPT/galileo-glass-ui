# Galileo Glass UI - Changelog Version 1.0.19

## Release Date: April 5th, 2025

## Overview

Version 1.0.19 focuses on addressing critical type definition issues identified in v1.0.18, resolving missing exports for components and utilities, improving hook APIs and documentation based on user feedback, and continuing the stabilization of the library's build process and type generation.

## Key Changes

### Bug Fixes & Enhancements

-   **Type Definitions (`.d.ts` Generation):**
    -   **`useAnimationSequence` (Bug #1):**
        -   Corrected the type definition for the `targets` property within `AnimationStage` to properly accept function refs and arrays containing nulls (Fixes Bug #1.1).
        -   Created separate public and internal type hierarchies with `PublicBaseAnimationStage` and `PublicAnimationStage` to provide a clean, simplified API for users while maintaining internal functionality (Fixes Bug #1.2).
        -   Added type converters to seamlessly translate between public and internal types without breaking existing code.
        -   Updated `useAnimationSequence` hook signature to use the new public types in both parameter and return types.
    -   **`GlassMultiSelect` (Bug #2):**
        -   Corrected the generated type definition for the `itemRemoveAnimation` prop to accurately reflect valid animation configurations (e.g., `{ type: 'spring', preset: ... }` or `false`).
    -   **`use3DTransform` (Bug #9):**
        -   Addressed broken type definitions. Exported the `use3DTransform` hook directly. Investigated and corrected issues preventing `Transform3DOptions` and `Transform3DState` from being importable and ensured the `Transform3DResult` type matches the source implementation.
    -   **`Point` Type Export:** Changed export source for `Point` and added `Point3D` export from `src/types/physics` for consistency. Removed `Point` export from `src/animations/types`.

-   **Missing Exports:**
    -   **Components (Bug #7.1):** Exported `Select` and `MenuItem` components from the main entry point (`src/index.ts`). *(Note: `GlassSwitch` export status needs confirmation)*.
    -   **Hooks:** Exported `use3DTransform` and `useMagneticElement` hooks directly from their source files in `src/index.ts` (Addresses Bug #9 / Bug #6). Exported `useGlassFocus` hook.
    -   **Hook Types:** Exported types associated with newly exported/corrected hooks, including `UseGlassFocusOptions`, `UseGlassFocusReturn`, and `MagneticElementOptions` (Addresses Bug #6).
    -   **Localization Utilities (Bug #10):** Added exports for `GlassLocalizationProvider` and `createDateFnsAdapter` to `src/index.ts` to support date picker components.

-   **Hook API & Usage:**
    -   **`usePhysicsInteraction` (Bug #7.3 / Bug #6):** Addressed potential type issues with `animationConfig` accepting preset strings. Ensured options use `*Amplitude` naming convention consistently.
    -   **`useGlassFocus`:** Ensured hook and its associated types (`UseGlassFocusOptions`, `UseGlassFocusReturn`) are correctly exported.

### Documentation Improvements

-   **`GlassDataGrid` (Bug #3):** Added initial comprehensive API documentation.
-   **`GlassCardLink` (Bug #4):** Verified existing documentation accuracy.
-   **`useAnimationSequence` (Bug #1):** Updated documentation to reflect the `targets` type fix, clarify expected `AnimationStage` structures, explain the intentional omission of `defaults` in the return signature, and detail the recommended patterns for managing state/resetting.
    -   Added comprehensive documentation for the new `PublicAnimationStage` type system, including examples of how to use the simplified public API.
    -   Updated orchestration documentation to explain the difference between internal and public type structures.
-   **`GlassMultiSelect` (Bug #2):** Updated documentation to show the correct object structure for the `itemRemoveAnimation` prop.
-   **Physics Hooks (Bug #6, #7, #8):**
    -   Updated documentation for `usePhysicsInteraction`, `useGesturePhysics`, `useMagneticElement` to use correct prop names (e.g., `rotationAmplitude` instead of `*Factor`).
    -   Clarified `usePhysicsInteraction` `bounds` prop usage (expects coordinate object, not a Ref) with examples.
    -   Clarified `usePhysicsEngine` API details, configuration, and usage patterns in `engine-api.md`.
-   **`use3DTransform` (Bug #9):** Updated documentation to align with corrected type definitions and API.
-   **Localization (Bug #10):** Updated examples and documentation to use correct import paths for `GlassLocalizationProvider` and `createDateFnsAdapter` from the main entry point.

### Developer Notes

-   **Type Definitions:** Significant effort went into correcting `.d.ts` generation issues, particularly for `useAnimationSequence` and `use3DTransform`. While major issues are addressed, ongoing monitoring of the type generation process is recommended.
-   **`Point` Type Export Location:** The canonical export for the `Point` type is now `src/types/physics`. Update imports accordingly.
-   **Galileo Spring Types:** Exports for `GalileoSpringConfig`, `SpringAnimationResult`, `SpringStartOptions`, `GalileoSpringResult`, `GalileoStateSpringOptions` were removed from the main `src/index.ts`. Import them directly from `./hooks/useGalileoStateSpring` if needed.
-   **Component Exports:** `Select` and `MenuItem` are now exported. Confirm if `GlassSwitch` should also be exported.
-   **Build Configuration:** The build continues to use `check: false` for `rollup-plugin-typescript2`. Ensure type checking is performed separately (`npm run typecheck` or IDE).

---

## Breaking Changes

-   **`Point` Type Import Path:** Projects importing the `Point` type directly from `src/animations/types` will need to update their import path to `src/types/physics` (or preferably, the main package entry point if re-exported there).
-   **Galileo Spring Type Imports:** Projects importing spring-related types (`GalileoSpringConfig`, etc.) from the main package entry point (`src/index.ts`) will need to update their import path to `./hooks/useGalileoStateSpring`.
