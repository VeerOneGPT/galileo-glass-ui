# Changelog for v1.0.28

## Release Date: April 12, 2025

## Major Changes

### Animation System 2.0 Redesign

Introduced a foundational redesign of the animation system ("Animation System 2.0") aimed at improving performance, state management, testability, and developer experience. Key aspects include:

*   **New Engine Foundation:** Implemented core modules like `TimingProvider`, `StyleProcessor`, `AnimationStateManager`, and `AnimationController` for better performance, batched updates, predictable state, and unified lifecycle management.
*   **Refactored React Hooks API:** Simplified and standardized the API for animation hooks: `useAnimation`, `useAnimationInterpolator`, `useAnimationSequence`, `useStaggeredAnimation`.
*   **Infrastructure:** Added feature flags for gradual rollout and comprehensive testing utilities. Maintained backward compatibility layers for existing code.

## Bug Fixes

### Core Animation & Physics Issues

*   **Animation Engine:** Resolved critical issues including unpredictable timing dependencies, excessive style processing overhead during animations, singleton pattern limitations preventing parallel animations, and memory leaks from improper resource cleanup.
*   **Component Stability:**
    *   `AnimationPauseController`: Fixed potential infinite render loops by improving memoization and state handling.
    *   `useDraggableListPhysics`: Fixed infinite loop bug caused by incorrect `useEffect` dependencies and improved internal state update consistency during drag interactions.
    *   `useGalileoStateSpring`: Fixed `TypeError` during initialization related to accessing mocked `SpringPresets`.
    *   `MultiSelect`: Fixed an issue where the DOM did not update correctly after token removal during testing, although logical state was correct.

### Test Reliability & CI/CD Pipeline

*   Fixed numerous critical test failures across the animation system that were previously blocking CI/CD pipelines. Addressed issues like style interpolation mismatches and Jest module factory restrictions.

## Test Infrastructure Improvements

*   **Unified Animation Testing Solution:** Created a comprehensive animation testing utility library (`src/test/utils/animationTestUtils.ts`). This library provides controlled mocks (RAF, timers), helpers for precise time/frame advancement, and wrappers for reliable test setup/cleanup, resolving persistent timing issues in tests.
*   **Resolved Skipped Tests:** Successfully fixed and unskipped a large number of previously deferred tests, significantly improving coverage and confidence in core animation/physics hooks (`useAnimationInterpolator`, `useAnimationSequence`, `useStaggeredAnimation`, `useDraggableListPhysics`, `useGameAnimation`, `performanceMonitor`) and components (`DatePicker`, `GlassDatePicker`).

## Documentation Updates

*   **Animation System 2.0 Migration Guide:** Added a comprehensive guide (`docs/migrations/ANIMATION-SYSTEM-MIGRATION-GUIDE.md`) detailing the new architecture, migration steps, and troubleshooting.
*   **Migration Examples:** Included practical code examples (`docs/migrations/examples/animation-migration-examples.tsx`) demonstrating migration patterns.
*   **DatePicker Tests:** Created and improved test files for `DatePicker.test.tsx` and `GlassDatePicker.test.tsx`, implementing comprehensive test cases.

## Internal Changes

*   Executed significant portions of the Animation System Technical Debt Resolution Plan, refactoring core orchestration components (`AnimationStateMachine`, `AnimationSynchronizer`, `DeclarativeSequencer`) and hooks (`useAnimationInterpolator`, `useAnimationSequence`, `useStaggeredAnimation`, `useGameAnimation`) towards a more robust and testable architecture.
*   Implemented improved testing utilities and feature flag infrastructure.

## Known Issues

*   **`DeclarativeSequencer` Tests:** Two tests in `DeclarativeSequencer.test.ts` remain failing due to persistent difficulties mocking the `animationOrchestrator` singleton in the Jest environment. Manual verification confirms the component's functionality in the application. Refactoring the orchestrator away from a singleton pattern is recommended for future testability.
*   **Remaining Skipped Tests:** Some tests primarily related to visual styling verification, JSDOM rendering/focus inaccuracies, or third-party library (Chart.js) incompatibilities remain skipped for components like `MultiSelect` (Styling, Disabled), `GlassTimeline` (Grouping, Keyboard Nav), `GlassFocusRing` (Visuals, Animation), `GlassDataChart` (Physics), and `DateRangePicker` (Format, Animation, etc.).

## Breaking Changes

*   **Animation System 2.0:** Introduces significant changes to the animation system's internal architecture and public hook APIs. While backward compatibility layers, feature flags, and deprecation notices are provided to ease the transition, migrating to the new APIs is recommended for leveraging performance improvements and new features. Refer to the Animation System Migration Guide (`docs/migrations/ANIMATION-SYSTEM-MIGRATION-GUIDE.md`) for details.
