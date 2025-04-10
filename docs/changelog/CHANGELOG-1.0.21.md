# Galileo Glass UI - Changelog Version 1.0.21

## Release Date: April 6, 2025

## Overview

Version 1.0.21 is a feature-rich update that addresses key issues from v1.0.20 while introducing several substantial new features focusing on animations, physics interactions, and accessibility. This release significantly expands the library's capabilities for creating immersive, physically realistic UI experiences while maintaining strong accessibility support.

## Key Changes

### Bug Fixes & Enhancements

- **`usePhysicsInteraction` Keyframe Error:**
  - Fixed error: "It seems you are interpolating a keyframe declaration (...) into an untagged string" by ensuring proper wrapping of dynamically generated keyframes with the `css` helper function.
  - Added test case verifying `affectsScale` usage no longer triggers the error.
  - Confirmed fix effectiveness in consuming applications.

### New Features

- **Particle System:**
  - Implemented `useParticleSystem` hook with comprehensive physics engine for particle movement and interactions.
  - Added support for thousands of particles with optimized rendering via Canvas and WebGL.
  - Integrated support for various forces: gravity, wind, friction, attractors/repulsors.
  - Included pre-configured presets: 'fireworks', 'snow', 'rain', 'magicDust', 'confetti', 'fire', 'smoke'.
  - Implemented performance optimizations including object pooling and adaptive quality tiers.

- **Magnetic Interactions:**
  - Implemented `useMagneticElement` hook for creating elements that attract or repel the pointer.
  - Added support for pointer following, snap points, directional fields, and multi-element magnetic systems.
  - Integrated spring physics for natural-feeling movement with configurable damping and stiffness.

- **Gesture Physics & Inertial Movement:**
  - Implemented `useGesturePhysics` hook for physics-based interactions with drag, swipe, and other gestures.
  - Created `useInertialMovement` hook for momentum-based animations after user interaction.
  - Added haptic feedback integration via `haptics.ts` utility.

- **Dimensional Effects:**
  - Implemented `useZSpace` hook for managing elements in 3D space with depth effects.
  - Added `use3DTransform` hook for applying and animating 3D transforms with physics.
  - Created `useParallaxScroll` hook for scroll-based parallax effects.

- **Enhanced Accessibility & Performance Controls:**
  - Implemented Motion Sensitivity Levels system (`LOW`, `MEDIUM`, `HIGH`, `NONE`).
  - Added Animation Categories system for classifying animations by purpose.
  - Created framework for Alternative Animations with Fade, Static, and Simplified variants.
  - Implemented Adaptive Performance/Quality Tier system with `useAdaptiveQuality` hook.
  - Updated animation hooks to adjust behavior based on detected or forced quality tier.

- **`GlassFocusRing` Component:**
  - Created reusable component that encapsulates the `useGlassFocus` hook logic.
  - Implemented props for customization: color, variant, offset, thickness, borderRadius, disabled.
  - Added support for composition with any focusable element.

### Documentation Improvements

- **Updated Documentation:**
  - `docs/animations/particle-system.md`: Updated with implemented attractors/repulsors functionality and quality tier integration.
  - `docs/animations/gesture-physics.md`: Updated to document the completed useGesturePhysics hook and haptic feedback integration.
  - `docs/animations/accessibility.md`: Removed "Concept" designation from Motion Sensitivity Levels and Animation Categories, added references to new hooks.
  - `docs/animations/magnetic-interactions.md`: Updated to document the implemented Directional Fields and Multi-Element Systems features.
  - `docs/animations/dimensional-effects.md`: Updated to document the implemented useParallaxScroll hook and physics integration for 3D transforms.

- **New Documentation:**
  - `docs/animations/alternative-animations.md`: New documentation for the alternative animations system, including useAlternativeAnimations hook and withAlternativeAnimations HOC.
  - `docs/components/GlassFocusRing.md`: New documentation for the GlassFocusRing component, explaining usage, props, and examples.

### Developer Notes

- All new features include comprehensive Storybook examples.
- The Particle System and other physics-based features integrate with the quality tier system for automatic performance optimization.
- The accessibility features work across all components and hooks with animation effects.

## Breaking Changes

- None. All new features and fixes maintain backward compatibility with existing code. 