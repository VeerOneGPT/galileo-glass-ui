# Galileo Glass UI - Changelog Version 1.0.20

## Release Date: April 6, 2025

## Overview

Version 1.0.20 is a patch release focused on resolving issues identified after v1.0.19, primarily addressing missing type exports, correcting hook type definitions, improving documentation clarity for several hooks and components, and ensuring overall type safety and developer experience improvements.

## Key Changes

### Bug Fixes & Enhancements

-   **Type Exports & Definitions:**
    -   **`use3DTransform` (Bug #10):** Exported the `Vector3D` type to allow type-safe state updates.
    -   **Physics Hooks (Bug #11):** Exported the `SpringPresetName` type for use with `usePhysicsInteraction` and related hooks.
    -   **`useAnimationSequence` (Bug #13):**
        -   Reviewed and updated `AnimationSequenceResult` and `AnimationSequenceConfig` types for improved API usability (specific additions like `currentStageId`, `loop`, `onStageChange` confirmed during implementation).
        -   Removed internal type exports (e.g., `AnimationStage`, `BaseAnimationStage`) from the public API to avoid confusion.
    -   **Theme Context (Bug #13):** Exported `useGlassTheme` hook and `GlassThemeContextValue` type for type-safe theme access. Clarified the role of the existing `useTheme` export.
    -   **`DataChart` (Bug #13):** Exported core data types `DataPoint` and `ChartDataset`.
    -   **`GlassDataGrid` (Bug #3):** Exported the `ColumnDefinition` type.
    -   **`useGesturePhysics` (Bug #6):** Exported the `GesturePhysicsOptions` type.
-   **Component Verification:**
    -   **`GlassMultiSelect` (Bug #12):** Verified correct usage of `itemRemoveAnimation` prop in `GlassMultiSelectDemo.tsx` without requiring `any` casting.
    -   **`useAnimationSequence` (Bug #13):** Verified that `any[]` casting is no longer needed for the `stages` prop in demos after type fixes.

### Documentation Improvements

-   **`use3DTransform` (Bug #10):**
    -   Clarified that the `perspective` CSS property should be applied to the parent element.
    -   Clearly listed the returned properties (`elementRef`, `transformState`).
-   **Physics Hooks (Bug #11 / Bug #8):**
    -   **`useMagneticElement`:** Added clarification on applying styles and using the `transform` state object.
    -   **`usePhysicsInteraction`:**
        -   Updated `animationConfig` documentation to reference the exported `SpringPresetName` type and cover both preset string and detailed object configuration.
        -   Provided clearer examples for the `bounds` prop.
-   **New Component Docs (Bug #12 / Bug #8):**
    -   Created documentation pages for `Select` (`docs/components/select.md`), `MenuItem` (`docs/components/menu-item.md`), and `Switch` (`docs/components/switch.md`), including props and usage examples.
-   **`useAnimationSequence` (Bug #13):**
    -   Updated documentation based on revised `AnimationSequenceResult` and `AnimationSequenceConfig` types.
-   **Theme Access (Bug #13):**
    -   Added documentation explaining the usage of the newly exported `useGlassTheme` hook and `GlassThemeContextValue` type.
-   **`DataChart` (Bug #13):**
    -   Clarified that physics-based zoom/pan is enabled via the `interaction.zoomPanEnabled` prop and configured via `interaction.physics`.
    -   Documented the current limitation regarding passing arbitrary Chart.js options directly.
-   **`GlassDataGrid` (Bug #3):**
    -   Removed incorrect documentation for a non-existent `getRowId` prop.

### Developer Notes

-   **Build Verification:** Build process should be checked to ensure all new type exports (`Vector3D`, `SpringPresetName`, `useGlassTheme`, `GlassThemeContextValue`, `DataPoint`, `ChartDataset`, `ColumnDefinition`, `GesturePhysicsOptions`) are correctly included and internal types (`AnimationStage`, etc.) are excluded from the public `.d.ts` files.
-   **Internal vs Public Types:** The removal of internal types like `AnimationStage` from exports is intentional to provide a cleaner public API.

## Breaking Changes

-   **Internal Type Exports:** Previously exported internal types (e.g., `AnimationStage`, `BaseAnimationStage`) are no longer exported. Users who were incorrectly importing these internal types directly will need to update their code, likely by relying on the public configuration types (e.g., `PublicAnimationStage` introduced in v1.0.19) or inferred types. 