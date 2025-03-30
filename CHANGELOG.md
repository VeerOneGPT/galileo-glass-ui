# Galileo Glass UI Changelog

## [1.0.6] - YYYY-MM-DD

### Fixed

*   Resolved build errors related to invalid TypeScript declaration (`.d.ts`) file generation. Specifically addressed issues caused by `PropTypes` type inference within dependencies (like `@types/react`), which resulted in incorrect syntax (e.g., `= undefined<T>;`) in the bundled declaration files (`animations.d.ts`, `hooks.d.ts`, `index.d.ts`). Implemented a post-build patching step in `rollup.config.js` to correct this syntax automatically.
*   Updated build process dependencies (`rollup-plugin-terser` replaced with `@rollup/plugin-terser`) and configuration (`rollup.config.js`) to ensure compatibility with Rollup 3.
*   Corrected component exports (`BottomNavigation`) that were preventing successful builds.

## [1.0.5] - YYYY-MM-DD

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
    *   Added new documentation sections for [Physics Hooks](../docs/animations/physics-hooks.md), [Transition Hooks](../docs/animations/transition-hooks.md), [Orchestration](../docs/animations/orchestration.md), [Context/Config](../docs/animations/context-config.md), and [Accessibility](../docs/animations/accessibility.md).
    *   Added an [Animation Migration Guide](../docs/migration/animation-migration-v1.0.5.md).
*   **Component Animation Integration:**
    *   Refactored numerous components (Buttons, Inputs, Modals, Menus, Cards, Navigation, etc.) to use the new animation system (see integration checklist in `animate2.md` for full list).
    *   Removed Framer Motion dependency from components like `TreeView`.
    *   Standardized animations across the library using context presets.

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

## [1.0.4] - 2024-08-23

This maintenance release focuses on chart visualizations and data presentation capabilities, adding several improvements to the GlassDataChart component.

### Added
- Enhanced legend interactivity with glass morphism styling
- Advanced data formatting utilities for numbers, currency, and percentages
- Improved chart export capabilities with better resolution and format options
- Comprehensive documentation for new formatting features

### Fixed
- Resolved animation keyframe integration with styled-components
- Fixed tooltip z-index issues to ensure proper layering
- Improved overflow handling to prevent content clipping
- Enhanced accessibility for screen readers and keyboard navigation

## [1.0.3] - 2024-07-15

Major feature release with significant enhancements to the animation system and component library.

### Added
- Custom physics engine with spring physics and inertial movement
- 10 new Glass-prefixed components including GlassTooltip and GlassDataChart
- Enhanced theming capabilities with dynamic atmosphere effects
- Comprehensive accessibility improvements
- Expanded documentation and examples

### Fixed
- Performance optimizations for glass effects on larger surfaces
- Improved touch interaction responsiveness
- Better cross-browser compatibility
- Z-index management for complex component layouts

## [1.0.2] - 2024-05-10

Stability release with performance enhancements and bug fixes.

### Added
- Animation optimization via hardware acceleration
- Improved responsive behavior for all components
- Better support for dark mode transitions

### Fixed
- Memory leaks in animation system
- Glass effect rendering on certain mobile browsers
- Type definitions for better TypeScript support

## [1.0.1] - 2025-03-27

### Added
- Initial public release with core Glass UI components
- Comprehensive animation system with physics-based interactions
- Accessibility features including reduced motion support
- Theme system with dark/light mode support
- Documentation and examples 