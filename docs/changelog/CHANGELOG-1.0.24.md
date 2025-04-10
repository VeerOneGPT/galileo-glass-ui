# Changelog for v1.0.24

## Release Date: April 8, 2024

## Major Changes

### Fixed Critical Crash in Styled-Components Animation Implementation

Fixed a critical bug that caused application crashes when importing the library in projects using `styled-components` v4+. The issue was related to incorrect interpolation of `keyframes` objects directly into `animation` or `animation-name` properties.

- Fixed `animation` properties to properly use the `css` helper from styled-components
- Updated `.animation-name` properties to use the `.name` property of keyframe objects
- Applied fixes across multiple components including GlassTabBar, DimensionalGlass, FrostedGlass, and others

### Completely Refactored GlassTimeline Layout System

Overhauled the layout logic of the `GlassTimeline` component to ensure stable and predictable positioning of timeline items:

- Replaced absolute positioning with a more reliable nested flexbox approach
- Fixed overlap issues with proper flex layout for events in both vertical and horizontal orientations
- Resolved `goToToday` scrolling issue by moving `scrollToDate` to a useEffect hook
- Improved alignment of timeline items, markers, and connectors
- Fixed various edge cases related to marker positioning and item alignment

### Enhanced GlassMultiSelect Component

Addressed multiple issues in the `GlassMultiSelect` component that were causing inconsistent behavior and performance problems:

- Fixed animation implementation to properly use styled-components `css` helper
- Simplified the token animation system for more consistent behavior
- Improved keyboard navigation, particularly for token removal via Backspace
- Replaced inefficient JSON.stringify comparisons with proper deep equality checks
- Fixed incomplete dependency arrays in React hooks
- Removed debug code and console.warn statements
- Enhanced portal-based dropdown positioning with better coordinate calculations
- Improved state management for more predictable behavior

### Enhanced GlassDateRangePicker Styling

Improved the visual appearance and usability of the `GlassDateRangePicker` component:

- Enhanced the calendar container with a more robust frosted glass styling
- Increased container minimum width from 280px to 340px for better content display
- Added semi-transparent background overlay for improved contrast
- Improved border styling with increased opacity (from 0.08 to 0.12)
- Added subtle gradient glow effect around container edges
- Increased shadow depth for better visual hierarchy
- Added proper overflow handling for calendar content

## Documentation Updates

- Added notes about the GlassTimeline layout improvements in component documentation
- Updated GlassMultiSelect documentation with information about animation and state management enhancements
- Added details about GlassDateRangePicker styling improvements
- Updated examples and prop descriptions where applicable

## Hook Import Path Clarifications

We've identified inconsistencies between documentation and actual exports, particularly with several hooks. This release includes clarifications for the following hook import paths:

- `useAdaptiveQuality` is accessible via `@veerone/galileo-glass-ui/hooks`
- `useZSpaceAnimation` has been renamed to `useZSpace` and should be imported from `@veerone/galileo-glass-ui/core`
- Several hooks were moved from `/animations` to `/hooks` or `/core` packages
- A comprehensive documentation update addressing all import path discrepancies is planned for v1.0.25

## Internal Changes

- Improved code organization and maintainability
- Enhanced type safety across components
- Removed unused code blocks and debug statements
- Applied consistent styling patterns across related components

## Known Issues

- Some hooks mentioned in documentation have different import paths or names than documented. For the correct imports, refer to the "Hook Import Path Clarifications" section above or check the TypeScript definitions in the package.

## Breaking Changes

None. All improvements and fixes maintain backwards compatibility with existing API. 