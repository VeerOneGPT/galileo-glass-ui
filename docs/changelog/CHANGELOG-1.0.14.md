
# Galileo Glass UI - Changelog Version 1.0.14

## Release Date: 06-15-2025

## Overview

Version 1.0.14 represents a major enhancement to the Galileo Glass UI library, introducing significant physics engine improvements, new components, interactive features, accessibility enhancements, and critical bug fixes. This release focuses on extending the physics capabilities, improving component interactions, and enhancing the overall developer experience.

## Key Changes

### New Features

#### Physics Engine & Animation

- **Advanced Physics Constraints**
  - Implemented support for `DistanceConstraint` (fixed distance between points on bodies) and `HingeConstraint` (allows rotation around a single point)
  - Added new API methods to `useGalileoPhysicsEngine` for constraint management: `engine.addConstraint(options)` and `engine.removeConstraint(constraintId)`
  - Added comprehensive type definitions for constraint configurations

- **Physics-Based Layout Hook (`usePhysicsLayout`)**
  - Created new hook for dynamically arranging elements with physics-based transitions
  - Implemented support for three layout types: 'grid', 'stack', and 'freeform'
  - Added configuration options for spacing, stiffness, damping, and other physics parameters
  - Optimized for smooth transitions when layout changes or elements are added/removed

- **Enhanced Collision Events**
  - Significantly improved collision event data in `useGalileoPhysicsEngine`:
    - Added `impactForce` (magnitude of collision impact)
    - Added `collisionPoint` (point of contact in world coordinates)
    - Added `relativeVelocity` (velocity difference between bodies at contact)
  - Enhanced collision detection pipeline for more accurate event triggering

- **Ambient Tilt Feature**
  - Implemented global mouse-reactive tilt effect for physics-enabled components
  - Created standalone `useAmbientTilt` hook for simplified implementation
  - Added smoothing/easing options via configurable `smoothingFactor`
  - Integrated with `usePhysicsInteraction` hook via ambient configuration options
  - Added reduced motion support for accessibility

- **New Animation Presets**
  - Added 'shake' animation preset for error indication
  - Added 'pulse' animation preset for attention focusing
  - Added 'confetti' animation preset for success confirmations
  - Ensured all presets work with `useReducedMotion` preferences

- **Magnetic & Repel Interactions**
  - Implemented distinct `'magnetic'` (attraction) and `'repel'` interaction types
  - Added to `usePhysicsInteraction` hook with configurable strength and radius
  - Updated `PhysicsInteractionType` union type with new options

#### Components

- **Glass Data Grid (`GlassDataGrid`)**
  - Introduced new component for displaying tabular data with Glass UI aesthetics
  - Implemented sorting functionality with physics-based animations
  - Added draggable rows with smooth physics transitions
  - Integrated keyboard navigation for accessibility

- **Glass Stepper Component (`GlassStepper`)**
  - Created new component for multi-step processes with Glass UI styling
  - Implemented both horizontal and vertical layout options
  - Added support for active, completed, and optional steps
  - Implemented smooth physics-based transitions between states
  - Added keyboard navigation support

- **Optional Glass Focus Ring**
  - Implemented aesthetically pleasing focus indicator using glass effects
  - Created animation that respects `useReducedMotion` preferences
  - Integrated with theme system for customizable appearance

- **Z-Space App Layout**
  - Implemented basic structure for Z-space layered application layouts
  - Added responsive behavior for different viewport sizes
  - Created proper Z-index layering for depth effects

### Enhancements

- **Refined Chart Interactivity (`GlassDataChart`)**
  - Added physics-based zoom and pan functionality
  - Created custom `useChartPhysicsInteraction` hook for smooth transitions
  - Updated axes handling during zoom/pan operations
  - Ensured compatibility with existing tooltips and chart features

- **Component Ref Forwarding**
  - Completed comprehensive audit of all components
  - Implemented `React.forwardRef` correctly for:
    - `GlassTimeline`
    - `GlassTabBar`
    - `GlassImageViewer`
    - `GlassDateRangePicker`
    - `KpiChart`
    - `GlassChart`
  - Fixed ref parameter usage in physics hook components
  - Added compatibility with `asChild` pattern from libraries like Radix UI

- **Glass Tabs Enhancements**
  - Refactored active tab indicator to use Galileo Physics Engine
  - Added `physics` prop for configurable animation parameters

- **Data Chart Per-Element Physics**
  - Enhanced `DataChart` to support physics interactions on individual elements
  - Implemented plugin system for hover effects with translate/scale/opacity springs
  - Added API for custom physics configuration per data element

### Bug Fixes

- **Physics Engine State Retrieval**
  - Fixed critical bug where `engine.getBodyState(bodyId)` returned `null` despite successful body creation
  - Corrected internal state management and ID lookup

- **Collision Detection Issues**
  - Fixed event emission for collision events (`onCollisionStart`, `onCollisionEnd`, `onCollisionActive`)
  - Ensured correct application of collision response forces/impulses

- **`useAnimationSequence` Export/Type Definition**
  - Fixed type definition discrepancy for `StyleAnimationStage`
  - Refactored source code to use `properties` instead of `to` for consistency
  - Updated affected components (`AnimationSequenceDemo`, `ImageList`, `List`, `GlassMultiSelect`)

- **`usePhysicsInteraction` Type Definition**
  - Added missing `elementRef?: React.RefObject<HTMLElement | SVGElement>` property to `PhysicsInteractionOptions` interface
  - Ensured type-safe passing of React refs to the hook

- **Component Exports**
  - Added missing exports for `GlassTimeline` and `GlassDateRangePicker`
  - Ensured components are correctly bundled in main library exports

- **Data Chart Rendering Bugs**
  - Fixed `glassVariant` rendering issues
  - Corrected area chart rendering
  - Fixed doughnut chart display problems
  - Addressed rendering issues with pie charts

### Documentation Improvements

- **Physics Engine Documentation**
  - Added comprehensive troubleshooting section in `engine-api.md`
  - Created dedicated guides for physics debugging with visualization tools
  - Added detailed guides for diagnosing movement issues
  - Created documentation for event-driven position updates
  - Added migration guides for users with workarounds

- **Performance Guidance**
  - Created comprehensive documentation on physics performance profiling
  - Added browser developer tools usage guidance
  - Included specific tips for optimizing physics simulations
  - Documented impact of body count, collision complexity, and `isSleeping` state

- **Component Documentation Updates**
  - Corrected `GlassMultiSelect` documentation to reflect current API
  - Updated documentation for `GlassDateRangePicker` dependencies
  - Added clear examples of physics interaction configuration

### Examples & Demonstrations

- **Composite Component Examples**
  - Implemented interactive Dashboard Widget example using multiple Galileo components
  - Demonstrated best practices for component integration

- **Storybook Examples**
  - Added comprehensive examples for all new components and features
  - Created dedicated demos for physics constraints, layout hooks, and animation presets
  - Implemented examples showing proper usage of component ref forwarding

## Developer Notes

- When using physics constraints, ensure you maintain references to constraint IDs if you need to remove them later.
- The `usePhysicsLayout` hook works best with elements of similar dimensions. For highly variable content, consider additional wrapper elements.
- For optimal performance with `GlassDataGrid` when using many rows, consider implementing virtual scrolling or pagination.
- Components using 3D tilt effects (including the new ambient tilt) require a parent element with the `perspective` CSS property set.
- The `GlassDateRangePicker` component requires a date utility library (like `date-fns` or `dayjs`) configured via its adapter.
- When upgrading from previous versions, review the migration guides for physics-related components if you implemented custom workarounds.
- The new animation presets (`shake`, `pulse`, `confetti`) can be accessed via the `AnimationProvider` or directly in animation hooks.

---

## Breaking Changes

- The `StyleAnimationStage` interface now uses `properties` instead of `to` for consistency. Update any animation sequences to use the new property name.
- The `PhysicsInteractionType` type has been updated to include distinct `'magnetic'` and `'repel'` types. Review any code using ambiguous magnetic interactions.
- Several internal physics APIs have been refactored for better performance and stability. If you were accessing low-level physics engine internals, consult the migration guides.

## Upcoming Features (Planned for Future Releases)

- Complete implementation of Settings Panel composite example
- Enhanced test coverage for physics interactions
- Comprehensive Storybook coverage for all components
