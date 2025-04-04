# Galileo Glass UI Changelog

## [1.0.14] - 2025-06-15

This major release enhances the physics engine with advanced constraints (Distance, Hinge), introduces a physics-based layout hook (`usePhysicsLayout`), and improves collision event data. New components include `GlassDataGrid` (sortable, draggable rows) and `GlassStepper`. Added features like ambient tilt, new animation presets (shake, pulse, confetti), magnetic/repel interactions, and an optional glass focus ring. Enhancements were made to chart interactivity (zoom/pan), component ref forwarding, `GlassTabs` physics indicator, and per-element physics in `DataChart`. Numerous bug fixes address physics engine state retrieval, collision detection, type definitions (`useAnimationSequence`, `usePhysicsInteraction`), component exports, and `DataChart` rendering. Documentation was significantly improved for the physics engine, performance guidance, and component usage.

## [1.0.13] - 2025-04-01

This patch release addresses several key bug fixes related to physics interactions, hook exports, and component implementations, improving stability and developer experience. Fixes include corrections to the 3D tilt effect in `usePhysicsInteraction`, added missing hook exports (`useAnimationSequence`, `useGesturePhysics`), and resolved various TypeScript/build errors.

## [1.0.11] - 2025-03-31

This release focuses on improving component composability and resolving build/type errors related to component exports.

### Added
- **`forwardRef` Implementation:** Added `React.forwardRef` to numerous components:
  - `ParticleBackground`
  - `AtmosphericBackground`
  - `SpeedDialAction`
  - `DimensionalGlass`
  - `HeatGlass`
  - `FrostedGlass`
  - `PageGlassContainer`
  - `WidgetGlass`
  - `GlassMultiSelectInternal`

### Fixed
- **Export Fixes:** Added numerous missing exports to the main `src/index.ts` entry point, including:
  - Glass containers and effects components
  - Navigation and layout components
  - Data visualization components
  - Interactive components
  - Utility components
- Fixed typo in `examples/AdvancedComponentsDemo.tsx`
- Build process now completes successfully

## [1.0.8] - 2025-03-31

This release focuses on exposing the underlying Galileo physics engine to developers.

### Added
- **Physics Engine API (`useGalileoPhysicsEngine`):**
  - Direct access to core physics simulation engine
  - API methods for managing physics bodies
  - Methods for applying forces and impulses
  - Collision event subscription system
  - Comprehensive documentation and examples
  
### Fixed
- Various type errors and import issues
- Collision system integration improvements

### Known Issues
- Comprehensive testing pending
- Performance profiling under heavy load pending
- Some limitations in force/impulse application points
- Build warnings in TypeScript declaration generation

## [1.0.6] - 2025-03-31

### Fixed

*   Resolved build errors related to invalid TypeScript declaration (`.d.ts`) file generation. Specifically addressed issues caused by `PropTypes` type inference within dependencies (like `@types/react`), which resulted in incorrect syntax (e.g., `= undefined<T>;`) in the bundled declaration files (`animations.d.ts`, `hooks.d.ts`, `index.d.ts`). Implemented a post-build patching step in `rollup.config.js` to correct this syntax automatically.
*   Updated build process dependencies (`rollup-plugin-terser` replaced with `@rollup/plugin-terser`) and configuration (`rollup.config.js`) to ensure compatibility with Rollup 3.
*   Corrected component exports (`BottomNavigation`) that were preventing successful builds.

## [1.0.5] - 2025-03-30

This major release introduces a comprehensive overhaul of the animation system, replacing previous methods (CSS transitions, Framer Motion) with a unified, physics-based system powered by React Spring and custom Galileo hooks. It also includes significant documentation updates and component integrations.

### Added

*   **New Physics-Based Animation System:**
    *   Introduced core hooks: `usePhysicsInteraction`, `useGalileoStateSpring`, `useMultiSpring`.
    *   Added transition management hooks: `useTransitioningState`, `useDropdownTransition`.
    *   Implemented animation sequence orchestration: `useAnimationSequence`.
    *   Created `AnimationProvider` and `useAnimationContext` for global configuration and presets.
    *   Integrated `useReducedMotion` for enhanced accessibility.
    *   Specialized hooks like `useInertialMovement`, `useMagneticElement` (details in component integrations).
*   **Comprehensive Animation Documentation:**
    *   Added new documentation sections for [Transition Hooks](../docs/animations/transition-hooks.md), [Orchestration](../docs/animations/orchestration.md), [Context/Config](../docs/animations/context-config.md), and [Accessibility](../docs/animations/accessibility.md).
    *   Added an [Animation Migration Guide](../docs/migration/animation-migration-v1.0.5.md).
*   **Component Animation Integration:**
    *   Refactored numerous components (Buttons, Inputs, Modals, Menus, Cards, Navigation, etc.) to use the new animation system (see integration checklist in `animate2.md` for full list).
    *   Removed Framer Motion dependency from components like `TreeView`.
    *   Standardized animations across the library using context presets.
*   **New Glass Components:**
    *   GlassCardLink: Enhanced 3D perspective transforms with physics-based hover effects
    *   GlassTabs: Glass-morphism styled tabs with animated active indicator
    *   ChartWrapper: Lightweight container for chart components
*   **ModularGlassDataChart Architecture:**
    *   Refactored into smaller, modular components
    *   Implemented quality tier system
    *   Created specialized components for different chart elements
*   **Full React 19 Compatibility:**
    *   Implemented proper forwardRef with TypeScript-friendly typing
    *   Created well-defined interfaces for exposed methods
    *   Added proper default values and null-safety

### Changed

*   **BREAKING CHANGE:** Removed internal usage of Framer Motion. Projects relying on Framer Motion within Galileo components may need updates.
*   **BREAKING CHANGE:** CSS transitions/animations previously applied to Galileo components for interactions might be overridden or removed. Rely on the new animation hooks and props (`animationConfig`, `disableAnimation`).
*   Updated base component types (e.g., Buttons) to include optional `AnimationProps`.

### Removed

*   Framer Motion dependency (implicitly removed where replaced).
*   Legacy animation-related CSS from core components.
*   Old animation documentation files.

### Fixed

*   Addressed various import errors, type errors, and linter warnings encountered during the animation system integration (see checklist in `animate2.md` for specifics).

## [1.0.4] - 2025-03-29

This maintenance release focuses on chart visualizations and data presentation capabilities, adding several improvements to the GlassDataChart component.

### Added
- **Enhanced Visual Styling:**
  - Atmospheric background gradients
  - Enhanced glass styling for legend items
  - Improved visual hierarchy with glow effects
- **Advanced Data Formatting:**
  - Comprehensive value formatting utilities
  - Intelligent number formatting with unit selection
  - Currency and percentage formatting with locale support
- **Enhanced Export & Sharing:**
  - Higher quality output options
  - Configurable export settings
  - Styled export button with glass morphism
- **Improved Tooltip Experience:**
  - Enhanced formatting with intelligent value display
  - Improved positioning and animation
  - Context-aware value formatting

### Fixed
- Resolved animation keyframe integration with styled-components
- Fixed tooltip z-index issues to ensure proper layering
- Improved overflow handling to prevent content clipping
- Enhanced accessibility for screen readers and keyboard navigation

## [1.0.3] - 2025-03-28

Major feature release with significant enhancements to the animation system and component library.

### Added
- **Enhanced Animation System:**
  - Collision detection and response system
  - Unified physics API with interpolation functions
  - Web Animations API renderer with fallback
  - Performance optimizations with DOM operation batching
- **New Glass Components:**
  - GlassTooltip: Physics-based glass tooltip
  - GlassDataChart: Chart components with physics interactions
  - GlassTabBar: Advanced tab navigation
  - GlassBreadcrumbs: Z-space depth navigation
  - GlassCarousel: Physics-based carousel
  - GlassImageViewer: Interactive image viewer
  - GlassMultiSelect: Token-based multi-select
  - GlassDateRangePicker: Date range picker
  - GlassMasonry: Physics-based masonry layout
  - GlassTimeline: Chronological data visualization

### Fixed
- Performance optimizations for glass effects on larger surfaces
- Improved touch interaction responsiveness
- Better cross-browser compatibility
- Z-index management for complex component layouts

## [1.0.2] - 2025-03-28

Stability release with performance enhancements and bug fixes.

### Added
- Animation optimization via hardware acceleration
- Improved responsive behavior for all components
- Better support for dark mode transitions

### Fixed
- Memory leaks in animation system
- Glass effect rendering on certain mobile browsers
- Type definitions for better TypeScript support

## [1.0.1] - 2025-03-28

### Added
- Initial public release with core Glass UI components
- Comprehensive animation system with physics-based interactions
- Accessibility features including reduced motion support
- Theme system with dark/light mode support
- Documentation and examples 