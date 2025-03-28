# Changelog

All notable changes to the Galileo Glass UI library will be documented in this file.

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