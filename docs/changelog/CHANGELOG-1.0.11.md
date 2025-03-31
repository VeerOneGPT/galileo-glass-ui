# Galileo Glass UI - Changelog Version 1.0.11

## Release Date: [Current Date]

## Overview

This release focuses on improving component composability and resolving build/type errors related to component exports. Key changes include adding `forwardRef` support to numerous components and ensuring all components used in examples are correctly exported.

## Key Changes

### Component Enhancements

-   **`forwardRef` Implementation:** Added `React.forwardRef` to the following components to allow external refs, enhancing integration capabilities:
    -   `ParticleBackground`
    -   `AtmosphericBackground`
    -   `SpeedDialAction`
    -   `DimensionalGlass`
    -   `HeatGlass`
    -   `FrostedGlass`
    -   `PageGlassContainer`
    -   `WidgetGlass`
    -   `GlassMultiSelectInternal` (with internal ref handling adjustments)
    -   _(Potentially others modified during the refactoring process)_

### Export Fixes & API Expansion

-   **Corrected Missing Exports:** Added numerous missing exports to the main `src/index.ts` entry point to resolve build errors and TypeScript (`TS2305`) errors encountered when using components in example applications or external projects. This significantly expands the reliably usable public API surface. Components now correctly exported include:
    -   `PageGlassContainer`
    -   `FrostedGlass`
    -   `DimensionalGlass`
    -   `HeatGlass`
    -   `WidgetGlass`
    -   `SpeedDial`, `GlassSpeedDial`
    -   `SpeedDialAction`
    -   `SpeedDialIcon`
    -   `Accordion`, `GlassAccordion`
    -   `AccordionSummary`, `GlassAccordionSummary`
    -   `AccordionDetails`, `GlassAccordionDetails`
    -   `TreeView`, `GlassTreeView`
    -   `TreeItem`, `GlassTreeItem`
    -   `ToggleButton`, `GlassToggleButton`
    -   `ToggleButtonGroup`, `GlassToggleButtonGroup`
    -   `Rating`, `GlassRating`
    -   `ImageList`, `GlassImageList`
    -   `ImageListItem`, `GlassImageListItem`
    -   `ImageListItemBar`, `GlassImageListItemBar`
    -   `KpiCard`
    -   `PerformanceMetricCard`, `GlassPerformanceMetricCard`
    -   `InteractiveKpiCard`, `GlassInteractiveKpiCard`
    -   `GlassNavigation`
    -   `ResponsiveNavigation`
    -   `PageTransition`
    -   `ZSpaceAppLayout`
    -   `GlassThemeSwitcher`
    -   `AtmosphericBackground`
    -   `ParticleBackground`
    -   `VisualFeedback`
    -   `RippleButton`
-   **Corrected Typo:** Fixed import of `OptimizedGlassContainer` to `PageGlassContainer` in `examples/AdvancedComponentsDemo.tsx`.

### Build & Tooling

-   Build process now completes successfully (Exit Code 0) after resolving export issues.
-   Acknowledged non-critical warnings related to `@types/react` and `prop-types` during the build process.

## Developer Notes

-   Ensure downstream projects update to `1.0.11` to benefit from the corrected exports and `forwardRef` additions.
-   The expanded export surface makes more components readily available for direct import.

---

[Link to 1.0.11 Build Notes](1.0.11-build-notes.md) 