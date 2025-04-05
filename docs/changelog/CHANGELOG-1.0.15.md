# Galileo Glass UI - Changelog Version 1.0.15

## Release Date: 04-05-2025

## Overview

Version 1.0.15 is a patch release focused primarily on addressing API and documentation inconsistencies identified in user bug reports (Conflicts 1-14), fixing component rendering issues, clarifying internal vs. external APIs, and ensuring correct exports for library features. Key areas include resolving API mismatches for hooks and components, fixing focus ring and animation provider exports, improving Tabs layout flexibility, and addressing a pie chart rendering artifact.

## Key Changes

### New Features

- **GlassTabs Layout Enhancement:**
  - Added `verticalAlign` prop to `GlassTabs` to control vertical alignment of tab items within the list container (`flex-start`, `center`, `flex-end`, `stretch`). (Task 11)

### Enhancements

- **GlassTabs Layout Flexibility:**
  - Introduced `variant` prop (`equal`, `auto`, `scrollable`) to `GlassTabs` for better control over tab sizing and overflow behavior, improving integration in constrained layouts. (Task 4)

### Bug Fixes

- **DataChart Pie Segment Rendering:**
  - Implemented aggregation logic in `ChartDataUtils` to group very small pie/doughnut segments (<0.5%) into an "Other" category, resolving rendering artifacts. (Task 1)
- **`useOrchestration` API Clarification:**
  - Corrected documentation (`docs/animations/orchestration.md`) to accurately reflect the `useOrchestration` hook's API, including the generic `AnimationStage` structure and timing patterns, resolving conflict regarding stage types and `delay`/`dependencies` placement. (Task 2)
- **`useAnimationSequence` API Conflict:**
  - Confirmed `useAnimationSequence` is not the primary hook; issue resolved by clarifying `useOrchestration` API and documentation. (Task 5)
- **`GlassTimeline` API Verification:**
  - Verified `GlassTimeline` API (`items`, `onItemSelect`, `activeId`) and confirmed no mismatch with current implementation or documentation. (Task 6)
- **`GlassStepper` API Verification:**
  - Verified `GlassStepper` API (`steps`, `activeStep`, `onStepClick`) and confirmed no mismatch with current implementation or documentation; noted `glassVariant` is not supported. (Task 7)
- **Focus Ring Exports:**
  - Added missing exports for `GlassFocusRing` component and `useGlassFocus` hook to main library entry points (`src/index.ts`, `src/components/index.ts`, `src/hooks/index.ts`), resolving import errors. (Task 8)
- **`useChartPhysicsInteraction` Integration Clarification:**
  - Verified hook is used internally by `GlassDataChart`. Updated documentation and stories to clarify that physics zoom/pan is configured via the `interaction` prop on `GlassDataChart`. (Task 9)
- **`useChartPhysicsInteraction` Export Clarification:**
  - Confirmed `useChartPhysicsInteraction` is an internal hook and not intended for public export, resolving "Not Found" errors stemming from incorrect usage attempts. (Task 10)
- **`AnimationProvider` Export:**
  - Added missing export for `AnimationProvider` and `useAnimationContext` to the main library entry point (`src/index.ts`), resolving import errors. (Task 12)

### Documentation Improvements

- **`useOrchestration`:** Rewritten documentation (`docs/animations/orchestration.md`) to match implemented hook API.
- **`GlassTabs`:** Updated documentation (`docs/components/glass-tabs.md`) with new `variant` and `verticalAlign` props and integration examples.
- **`GlassFocusRing`:** Created new documentation (`docs/components/glass-focus-ring.md`) explaining component usage and mentioning the hook.
- **`useChartPhysicsInteraction`:** Created new documentation (`docs/hooks/useChartPhysicsInteraction.md`) explaining internal usage within `GlassDataChart`.
- **`AnimationProvider`:** Updated `framework-guide.md` with correct import path. Confirmed `context-config.md` was already correct.

### Examples & Demonstrations

- **`GlassDataChart`:** Added Storybook story (`PieWithSmallSegments`) demonstrating small segment aggregation fix. Added story (`ConfiguredPhysicsZoomPan`) demonstrating `interaction` prop usage.
- **`GlassTabs`:** Updated Storybook stories (`examples/components/GlassTabsDemo.stories.tsx`) to include `variant` and `verticalAlign` controls and examples.
- **`GlassFocusRing`:** Updated Storybook stories (`examples/components/GlassFocusRingDemo.stories.tsx`) with proper controls and examples for the component wrapper.

## Developer Notes

- The `useChartPhysicsInteraction` hook is intended for internal use by `GlassDataChart`. Configure physics zoom/pan via the `interaction` prop on `GlassDataChart`.
- The `useQualityTier` and `useDeviceCapabilities` hooks are internal implementation details for adaptive performance and should not be imported directly. Control adaptive quality via relevant component props where available (e.g., `useAdaptiveQuality` on `DataChart`).
- The `GlassFocusRing` component is the recommended way to add focus rings; `useGlassFocus` hook is available for advanced use cases requiring manual rendering.

## Breaking Changes

- None identified in this patch release based on the implemented fixes.