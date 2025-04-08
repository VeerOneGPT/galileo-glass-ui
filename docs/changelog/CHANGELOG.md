# Galileo Glass UI Changelog

## [1.0.24] - 2025-04-08

### Major Changes

- **Fixed Critical Crash in Styled-Components Animation:** Resolved application crashes when importing the library in projects using `styled-components` v4+ by fixing keyframe interpolation.
- **Completely Refactored GlassTimeline Layout:** Replaced absolute positioning with a nested flexbox approach for stable and predictable timeline item positioning.
- **Enhanced GlassMultiSelect Component:** Fixed animation implementation, keyboard navigation, state comparisons, and portal-based dropdown positioning.
- **Improved GlassDateRangePicker Styling:** Enhanced calendar container with better frosted glass styling, increased size, and improved visual elements.

### Details
See the [full v1.0.24 changelog](./CHANGELOG-1.0.24.md) for comprehensive details on all changes and improvements.

## [1.0.23] - 2025-04-08

Version 1.0.23 is primarily a **corrective release** focused on addressing critical build configuration issues, export errors, and functional regressions identified following the v1.0.22 release.

### Bug Fixes

- **Build & Export Issues:** Resolved fundamental build configuration problems in `rollup.config.js` and `package.json` that prevented several hooks and components (especially nested ones) from being correctly exported.
- **Hook Exports:** Fixed export issues with `useParticleSystem`, `useChartPhysicsInteraction`, `useMagneticElement`, and `useAnimationSequence`.
- **`useAnimationSequence` Initialization:** Applied a core fix to the initialization logic to correctly apply initial `from` styles just before the first animation frame.
- **`usePhysicsInteraction` Magnetic Mode:** Corrected internal force calculation logic to ensure `strength` polarity correctly determines attraction vs. repulsion.
- **`DataChart` Visual Glitches:** Fixed legend cutoff issues and resolved layering problems with glass effects overlapping chart content.

### Documentation
- Updated documentation for affected hooks with accurate usage patterns and examples
- Added detailed fix logs and troubleshooting guides

### Details
See the [full v1.0.23 changelog](./CHANGELOG-1.0.23.md) for comprehensive details on all bug fixes and enhancements.

## [1.0.22] - 2025-04-07

Version 1.0.22 focuses on resolving critical bugs in animation and component behavior, enhancing the `useGameAnimation` hook with physics and gesture capabilities, and improving overall type safety and error handling.

### Bug Fixes
- **Export of useParticleSystem Hook:** Fixed exporting from both main entry point and hooks subpath
- **GlassDataGrid:** Fixed rendering issues with table structure and data
- **DataChart Errors:** Resolved TypeError on variant change and Maximum Update Depth errors when interaction options are disabled
- **Card Component:** Fixed React DOM warning about invalid `parallax` attribute
- **usePhysicsInteraction:** Fixed non-functional magnetic interaction type for attraction and repulsion behaviors
- **useAnimationSequence:** Partially fixed initial state application and sequence execution (implementation relies on placeholder functions)

### Enhancements
- **useGameAnimation Hook:** Significantly enhanced with new capabilities:
  - Added physics-based transitions using spring physics
  - Added 3D transition types leveraging Z-space and perspective
  - Added glass effect transitions for glass UI components
  - Added component state synchronization for automatic prop updates
  - Added gesture physics integration for interactive transitions
  - Improved accessibility support with motion sensitivity levels
  - Added debugging capabilities for transitions and state changes

### Documentation
- Updated README.md "What's New" section
- Updated Button.tsx JSDoc for `physicsOptions`
- Added GameAnimation.stories.tsx and comprehensive changelog

## [1.0.21] - 2025-04-06

Version 1.0.21 is a feature-rich update that addresses key issues from v1.0.20 while introducing several substantial new features focusing on animations, physics interactions, and accessibility. This release significantly expands the library's capabilities for creating immersive, physically realistic UI experiences while maintaining strong accessibility support.

### Bug Fixes & Enhancements
- Fixed "interpolating a keyframe declaration" error in `usePhysicsInteraction` by properly wrapping dynamically generated keyframes with the `css` helper function.

### New Features
- **Particle System:** Implemented `useParticleSystem` hook with comprehensive physics engine for particle movement and interactions, thousands of particles support, various forces, pre-configured presets, and performance optimizations.
- **Magnetic Interactions:** Implemented `useMagneticElement` hook for creating elements that attract or repel the pointer, with support for pointer following, snap points, directional fields, and multi-element magnetic systems.
- **Gesture Physics & Inertial Movement:** Implemented `useGesturePhysics` and `useInertialMovement` hooks for physics-based interactions and momentum-based animations with haptic feedback integration.
- **Dimensional Effects:** Implemented `useZSpace`, `use3DTransform`, and `useParallaxScroll` hooks for 3D space management, transforms, and parallax effects.
- **Enhanced Accessibility & Performance Controls:** Implemented Motion Sensitivity Levels, Animation Categories, Alternative Animations framework, and Adaptive Performance/Quality Tier system.
- **`GlassFocusRing` Component:** Created reusable component with customization props and support for composition with any focusable element.

## [1.0.20] - 2025-04-06

Version 1.0.20 is a patch release focused on resolving issues identified after v1.0.19, addressing missing type exports, correcting hook type definitions, improving documentation clarity, and ensuring overall type safety and developer experience improvements.

### Bug Fixes & Enhancements
- **Type Exports & Definitions:**
  - Exported `Vector3D` type for `use3DTransform` to allow type-safe state updates.
  - Exported `SpringPresetName` type for use with `usePhysicsInteraction` and related hooks.
  - Updated `AnimationSequenceResult` and `AnimationSequenceConfig` types for improved API usability.
  - Removed internal type exports (e.g., `AnimationStage`, `BaseAnimationStage`) from the public API.
  - Exported `useGlassTheme` hook and `GlassThemeContextValue` type for type-safe theme access.
  - Exported core data types: `DataPoint`, `ChartDataset`, `ColumnDefinition`, `GesturePhysicsOptions`.
- **Component Verification:** Verified correct usage of components without requiring `any` casting.

### Documentation Improvements
- Clarified `perspective` CSS property usage in `use3DTransform`.
- Updated documentation for physics hooks with clearer examples and configuration options.
- Created documentation for `Select`, `MenuItem`, and `Switch` components.
- Clarified physics-based zoom/pan configuration in `DataChart`.

### Breaking Changes
- Previously exported internal types are no longer exported. Users who were directly importing these types will need to update their code.

## [1.0.19] - 2025-04-05

Version 1.0.19 focuses on addressing critical type definition issues identified in v1.0.18, resolving missing exports for components and utilities, improving hook APIs and documentation based on user feedback, and continuing the stabilization of the library's build process and type generation.

### Bug Fixes & Enhancements
- **Type Definitions:**
  - Corrected `useAnimationSequence` type definitions for the `targets` property and created separate public and internal type hierarchies.
  - Corrected generated type definition for the `itemRemoveAnimation` prop in `GlassMultiSelect`.
  - Fixed broken type definitions for `use3DTransform` and exported the hook directly.
  - Changed export source for `Point` and added `Point3D` export from `src/types/physics`.
- **Missing Exports:**
  - Exported `Select`, `MenuItem`, and various hooks (`use3DTransform`, `useMagneticElement`, `useGlassFocus`).
  - Added exports for `GlassLocalizationProvider` and `createDateFnsAdapter`.
- **Hook API & Usage:** Addressed type issues with `usePhysicsInteraction` and ensured consistent naming conventions.

### Documentation Improvements
- Added comprehensive API documentation for `GlassDataGrid`.
- Updated documentation for `useAnimationSequence`, physics hooks, and localization to reflect corrected types and usage patterns.

### Breaking Changes
- Projects importing the `Point` type from `src/animations/types` need to update their import path to `src/types/physics`.
- Projects importing spring-related types from the main package entry point need to update their import paths.

## [1.0.18] - 2025-04-05

Version 1.0.18 focuses on resolving type definition issues, improving hook documentation, converting legacy examples to Storybook format, fixing numerous TypeScript errors across the codebase, resolving build configuration issues, and introducing item removal animations for the MultiSelect component.

### Bug Fixes
- **Type Definitions:**
  - Fixed type generation issues for `useOrchestration`, `usePhysicsInteraction`, and various component exports.
  - Standardized export paths for hooks and their associated types.
  - Corrected numerous TypeScript errors across components and test files.
- **Build Configuration:** Resolved persistent build failures by adjusting `rollup-plugin-typescript2` options.

### Enhancements
- **`GlassMultiSelect` - Item Removal Animation:** Added new `itemRemoveAnimation` prop for configuring physics-based animations when removing selected items.

### Documentation Improvements
- Updated documentation for various hooks to clarify usage, options, return values, and known issues/workarounds.

### Examples & Demonstrations
- Converted legacy example components to Storybook stories and cleaned up outdated examples.

## [1.0.17] - 2025-04-05

Version 1.0.17 introduces several component enhancements focused on animation customization, usability improvements for scrollable elements, and refined physics interaction controls.

### New Features & Enhancements
- **`GlassMultiSelect` - Item Removal Animation:** Added `itemRemoveAnimation` prop for configuring physics-based animations when removing selected items.
- **`GlassTabs` - Scrollable Variant Buttons:** Enhanced the `scrollable` variant with optional scroll indicator buttons that automatically appear when tab content overflows.
- **`GlassFocusRing` - Customization Props:** Added new props for customizing appearance and animation (`thickness`, `animationPreset`).
- **`GlassDataChart` - Physics Configuration Refinement:** Clarified and documented configuration of zoom/pan physics parameters.

### Documentation Improvements
- Updated documentation for affected components to reflect new features and configuration options.

### Breaking Changes
- **`GlassFocusRing`**: The `pulseAnimation: boolean` prop has been replaced by `animationPreset: 'pulse' | 'fade' | 'static'`.

## [1.0.15] - 2025-04-05

Version 1.0.15 is a patch release focused primarily on addressing API and documentation inconsistencies identified in user bug reports, fixing component rendering issues, clarifying internal vs. external APIs, and ensuring correct exports for library features.

### New Features
- **GlassTabs Layout Enhancement:** Added `verticalAlign` prop to control vertical alignment of tab items within the list container.

### Enhancements
- **GlassTabs Layout Flexibility:** Introduced `variant` prop (`equal`, `auto`, `scrollable`) for better control over tab sizing and overflow behavior.

### Bug Fixes
- **DataChart Pie Segment Rendering:** Implemented aggregation logic to group very small pie/doughnut segments (<0.5%) into an "Other" category.
- **`useOrchestration` API Clarification:** Corrected documentation to accurately reflect the hook's API.
- **`useAnimationSequence` API Conflict:** Clarified that this is not the primary hook by updating `useOrchestration` API documentation.
- **`GlassTimeline` and `GlassStepper` API Verification:** Confirmed no mismatches with current implementations or documentation.
- **Focus Ring Exports:** Added missing exports for `GlassFocusRing` component and `useGlassFocus` hook.
- **`useChartPhysicsInteraction` Clarification:** Verified internal usage and documentation updates.
- **`AnimationProvider` Export:** Added missing export for `AnimationProvider` and `useAnimationContext`.

### Documentation Improvements
- Updated documentation for various components and hooks to align with implemented APIs.
- Created new documentation for `GlassFocusRing` and `useChartPhysicsInteraction`.

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
    *   Refactored numerous components (Buttons, Inputs, Modals, Menus, Cards, Navigation, etc.) to use the new animation system.
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

*   Addressed various import errors, type errors, and linter warnings encountered during the animation system integration.

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