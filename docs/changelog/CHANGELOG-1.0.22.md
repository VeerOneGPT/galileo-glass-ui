# Galileo Glass UI v1.0.22 - Changelog

## Release Date: April 7, 2025

## Overview

Version 1.0.22 focuses on resolving critical bugs in animation and component behavior, enhancing the `useGameAnimation` hook with physics and gesture capabilities, and improving overall type safety and error handling.

## 🐛 Bug Fixes

### Export of useParticleSystem Hook

- Fixed the export of `useParticleSystem` hook to make it available for import by consuming applications
- Ensured the hook is correctly exported from both the main entry point and hooks subpath
- Verified all related types are properly exported

### GlassDataGrid

- Fixed an issue where the component would not render table structure and data correctly
- Ensured proper usage of the correct surface component (`DimensionalGlass`) 
- Verified compatibility of props between components

### DataChart Errors

- **Fixed TypeError on Variant Change:** Resolved issues that would cause TypeErrors when dynamically changing the chart variant (e.g., from 'line' to 'bar' to 'pie')
  - Improved chart remounting strategy
  - Added proper legend state handling during transitions
  - Enhanced handling of different chart type option requirements

- **Fixed Maximum Update Depth Errors:** Resolved infinite re-render loop errors that occurred when certain interaction options were disabled
  - Added complete bail-out from hover handling when `physicsHoverEffects` is disabled
  - Prevented unnecessary state updates in the hover flow
  - Ensured hooks don't run effects when features are disabled

### Card Component

- Fixed React DOM warning about invalid `parallax` attribute
- Ensured the component doesn't spread Boolean props as attributes to the DOM element

### usePhysicsInteraction

- Fixed non-functional magnetic interaction type
- Corrected force calculation for attraction and repulsion behaviors
- Ensured proper application of physics simulation parameters
- Added support for changing polarity on-the-fly

### useAnimationSequence

- **Partially Fixed** - Implementation relies on placeholder functions
- Improved initialization logic to better apply initial state to target elements
- Enhanced execution of defined animation sequences
- Added warnings where core functionality (`applyStyles`) uses placeholder implementations
- Improved element ref resolution by deferring application to first frame
- Fixed conversion between public and internal types

## ✨ Enhancements

### useGameAnimation Hook

The `useGameAnimation` hook has been significantly enhanced with new capabilities:

#### Physics-Based Transitions
- Added new transition types: `PHYSICS_SLIDE`, `PHYSICS_BOUNCE`, and other physics-based enums
- Integrated with existing spring hooks (`useGalileoStateSpring`, `useMultiSpring`)
- Added `physicsConfig` property to `StateTransition` for fine-tuning physics parameters

#### Glass Effect Transitions
- Added support for animating glass effect properties (blur, opacity)
- Integrated with `useGlassEffects` mixins
- Added support for targeting glass styles in transitions

#### 3D Transitions
- Added new transition types such as `PUSH_3D`, `ROTATE_IN_3D`
- Leveraged existing `useZSpace` and `use3DTransform` hooks
- Enabled 3D perspective and transform effects during transitions

#### Component State Synchronization
- Added interfaces for state-to-props mapping in transitions
- Enabled automatic updating of component props based on animation state
- Added support for component state updates during transitions

#### Gesture Physics Integration
- Added `gesturePhysics` configuration to `StateTransition` interface
- Implemented support for interactive transitions with gesture controls
- Added support for user interaction during transitions

#### Advanced Orchestration
- Added support for complex `AnimationSequenceConfig` objects in transitions
- Enhanced transition timing and staging capabilities
- Improved coordination of multiple animated elements

#### Accessibility Improvements
- Integrated with `MotionSensitivityLevel` for finer control
- Added adaptive physics parameters based on sensitivity level
- Enhanced support for reduced motion preferences

#### Debugging
- Added `debug` option to the main hook config
- Implemented conditional logging for state changes, transitions, and animation stages
- Enhanced error reporting for animations

## 📚 Documentation

- Updated README.md "What's New" section
- Updated Button.tsx JSDoc for `physicsOptions`
- Added GameAnimation.stories.tsx for the enhanced hook
- Created comprehensive changelog documentation
- Updated version numbers in package.json and src/index.ts

## 🧪 Testing

- Added comprehensive test suite for GlassDataGrid
- Added tests for DataChart variant changes and state handling
- Added tests for the Card component's attribute behavior
- Added Storybook tests for usePhysicsInteraction magnetic functionality
- Verified useAnimationSequence with the SequenceAnimationDemo test case

## 💻 Development & Performance

- Improved error handling in complex animation scenarios
- Enhanced type safety for animation and transition configurations
- Added better debugging tools for animation development
- Improved performance for physics-based animations

## Major Features

### Enhanced `useGameAnimation` Hook

- Added physics-based transitions using spring physics
  - New transition types: `PHYSICS_FADE`, `PHYSICS_SLIDE`, `PHYSICS_ZOOM`, `PHYSICS_FLIP`
  - Physics configuration via `physicsConfig` parameter
  - Integration with `defaultPhysicsConfig` in main configuration

- Added 3D transition types leveraging Z-space and perspective
  - New transition types: `ROTATE_3D`, `PUSH_3D`, `FLIP_3D`
  - 3D transform options via `transform3D` parameter
  - Custom perspective, rotation, and translation control

- Added glass effect transitions for glass UI components
  - New transition types: `GLASS_BLUR`, `GLASS_OPACITY`, `GLASS_GLOW`
  - Glass effect configuration via `glassEffect` parameter
  - Fine-grained control over blur, opacity, and glow properties

- Improved accessibility support
  - Integration with `MotionSensitivityLevel` for motion reduction
  - Added `motionSensitivity` option to configuration
  - Enhanced reduced motion alternatives

- Added debugging capabilities
  - Debug logging for transitions and state changes
  - Debug toggle via the new `setDebug` method
  - More verbose warnings and error messages when issues occur

## Bug Fixes

- Fixed export of `useParticleSystem` hook
- Fixed `Card` component rendering invalid `parallax` attribute
- Fixed `usePhysicsInteraction` magnetic type functionality
- Fixed persistent `DataChart` errors on variant switch
- Fixed `GlassDataGrid` rendering issues

## Documentation Updates

- Updated README.md "What's New" section
- Updated Button.tsx JSDoc for `physicsOptions`
- Created detailed changelog documentation

---

**Full Release Date:** 2023-10-12 