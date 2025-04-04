# Galileo Animation System

Welcome to the documentation for the Galileo Glass UI animation system. This system is designed to provide performant, physics-based, and accessible animations to create engaging and intuitive user experiences.

## Overview

The Galileo animation system is built around a few core concepts:

1. **Integrated Physics Engine:** A powerful physics simulation system (enhanced in v1.0.8) that provides:
   - Realistic spring physics and collision detection
   - Support for various body shapes (circles, rectangles)
   - Advanced features like object sleeping and custom integration methods
   - Direct access via `useGalileoPhysicsEngine` for custom simulations

2. **Specialized Hooks:** High-level hooks that build on the physics engine:
   - `usePhysicsInteraction` for common UI interactions
   - `useGesturePhysics` for gesture-based animations
   - `useMagneticElement` for attraction effects
   - `useGalileoStateSpring` and `useMultiSpring` for state transitions

3. **Orchestration:** The `useAnimationSequence` hook allows coordinating complex multi-step and multi-element animations.

4. **Accessibility:** Features like `useReducedMotion` ensure animations respect user preferences and device capabilities.

5. **Performance:** Adaptive quality tiers and optimizations ensure animations run smoothly across devices.

## Documentation Sections

*   **[Physics Engine API](../physics/engine-api.md):** Documentation for the enhanced physics engine and `useGalileoPhysicsEngine` hook (v1.0.8+).
*   **[Core Physics Hooks](./hooks/physics-interaction.md):** Learn about hooks like `usePhysicsInteraction`, `useGalileoStateSpring`, and `useMultiSpring` for adding physics-based feedback and state transitions.
*   **[Gesture Physics](./gesture-physics.md):** Documentation for `useGesturePhysics` and related gesture handling.
*   **[Magnetic Effects](./magnetic-effects.md):** Documentation for `useMagneticElement`.
*   **[Animation Orchestration](./orchestration.md):** Deep dive into `useAnimationSequence` for creating complex animation sequences.
*   **[Animation Context & Configuration](./context-config.md):** Understand how to use `AnimationProvider` and `useAnimationContext` for global settings and presets.
*   **[Accessibility](./accessibility.md):** Details on `useReducedMotion` and building accessible animations.

Choose the appropriate section based on your needs:
- For custom physics simulations or game-like mechanics, start with the Physics Engine API.
- For common UI interactions, use the Core Physics Hooks.
- For complex animations, refer to Animation Orchestration. 