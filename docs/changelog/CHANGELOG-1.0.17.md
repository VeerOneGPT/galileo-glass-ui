# Galileo Glass UI - Changelog Version 1.0.17

## Release Date:  04-05-2025

## Overview

Version 1.0.17 introduces several component enhancements focused on animation customization, usability improvements for scrollable elements, and refined physics interaction controls.

## Key Changes

### New Features & Enhancements

-   **`GlassMultiSelect` - Item Removal Animation:**
    -   Added a new `itemRemoveAnimation` prop to `GlassMultiSelect`.
    -   Allows configuring a physics-based animation (using presets or custom `GalileoSpringConfig`) when removing selected items (tokens).
    -   Implemented using the `useGalileoStateSpring` hook internally.
    -   Added Storybook examples demonstrating preset and custom removal animations.
    -   Updated documentation to include the new prop.

-   **`GlassTabs` - Scrollable Variant Buttons:**
    -   Enhanced the `scrollable` variant of `GlassTabs`.
    -   Added optional scroll indicator buttons (left/right arrows) that automatically appear when tab content overflows the container.
    -   Buttons allow users to scroll through tabs horizontally without needing a visible scrollbar.
    -   Implemented using `ResizeObserver` and scroll event listeners for robust detection.

-   **`GlassFocusRing` - Customization Props:**
    -   Added new props for customizing the appearance and animation of the focus ring:
        -   `thickness: 'sm' | 'md' | 'lg'`: Controls the border thickness of the ring (maps to theme border widths). Default: `'md'`.
        -   `animationPreset: 'pulse' | 'fade' | 'static'`: Selects the animation style for the ring when focused. Default: `'pulse'`.
    -   Replaced the previous `pulseAnimation: boolean` prop with `animationPreset`.
    -   Updated documentation and Storybook examples.

-   **`GlassDataChart` - Physics Configuration Refinement:**
    -   Clarified and documented the existing capability to configure zoom/pan physics parameters (`tension`, `friction`, `mass`) via the `interaction.physics` prop.
    -   Updated documentation with clear explanations and examples.
    -   Updated the relevant Storybook example (`ConfigurablePhysicsZoomPan`) to demonstrate setting custom physics values.

### Documentation Improvements

-   Updated documentation for `GlassMultiSelect`, `GlassTabs`, `GlassFocusRing`, and `GlassDataChart` to reflect the new features and configuration options.

### Developer Notes

-   The `itemRemoveAnimation` in `GlassMultiSelect` uses the same spring configuration options as other Galileo physics hooks.
-   Scroll buttons in `GlassTabs` (scrollable variant) appear automatically based on content overflow.
-   Use the new `thickness` and `animationPreset` props to style `GlassFocusRing` according to your application's needs.
-   Fine-tuning `interaction.physics` in `GlassDataChart` can significantly alter the feel of zoom and pan interactions.

---

## Breaking Changes

-   **`GlassFocusRing`**: The `pulseAnimation: boolean` prop has been removed and replaced by `animationPreset: 'pulse' | 'fade' | 'static'`. Update usage accordingly (e.g., `pulseAnimation={true}` becomes `animationPreset="pulse"`, `pulseAnimation={false}` becomes `animationPreset="static"` or `animationPreset="fade"`). 