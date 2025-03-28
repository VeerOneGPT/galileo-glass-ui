# Changelog

All notable changes to the Galileo Glass UI library will be documented in this file.

## [1.0.3] - 2025-03-29

### Added
- Enhanced Animation System
  - Custom Physics Engine with spring physics, inertial movement, and momentum-based interactions
  - Collision detection and response system
  - Unified physics API with extensive interpolation functions
  - Web Animations API (WAAPI) renderer with requestAnimationFrame fallback
  - Performance optimizations with DOM operation batching and transform consolidation
  - GPU acceleration for smooth animations
  - Device capability detection for adaptive performance
  - Enhanced accessibility features for motion sensitivity and reduced motion
  - Animation composition with timing-agnostic synchronization
  - Gesture-driven animation system for natural interactions

- New Glass Components
  - GlassTooltip: Physics-based glass tooltip with intelligent positioning
  - GlassDataChart: Chart components with glass styling and physics interactions
  - GlassTabBar: Advanced tab navigation with physics-based selection indicator
  - GlassBreadcrumbs: Z-space depth navigation component
  - GlassCarousel: Physics-based carousel with momentum scrolling
  - GlassImageViewer: Interactive image viewer with physics-based zoom/pan
  - GlassMultiSelect: Token-based multi-select with physics animations
  - GlassDateRangePicker: Date range picker with comparison mode
  - GlassMasonry: Physics-based masonry layout for content
  - GlassTimeline: Chronological data visualization component

### Changed
- Updated dependencies to support React 19
- Improved performance monitoring with detailed metrics
- Enhanced TypeScript definitions with more comprehensive types
- Reorganized project structure for better tree shaking

### Fixed
- Fixed server-side rendering issues with Window/Document references
- Improved cross-browser compatibility, especially for Safari and Firefox
- Fixed GlassTimeline tests with proper mocking and styled-components integration
- Resolved naming conflicts in Timeline component tests
- Fixed environment-specific date calculations in TimelineUtils tests

## [1.0.2] - 2025-03-28

### Fixed
- Fixed TypeScript errors in `AnimationPipeline.test.tsx` related to inconsistent `AnimationPreset` interface definitions
- Properly implemented `GlassDatePicker` component to fix import errors
- Updated `PhysicsAnimationDemo` to use correct properties (`velocityDecay` instead of `friction`) 
- Added proper mocking in test files to support Jest methods
- Fixed require statements not being part of import statements in test files

### Changed
- Added ts-ignore comments to temporarily resolve complex type conflicts in test files

## [1.0.1] - 2025-03-27

### Added
- Initial public release with core Glass UI components
- Comprehensive animation system with physics-based interactions
- Accessibility features including reduced motion support
- Theme system with dark/light mode support
- Documentation and examples 