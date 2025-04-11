# Galileo Animation System

Welcome to the documentation for the Galileo Glass UI animation system. This system is designed to provide performant, physics-based, and accessible animations to create engaging and intuitive user experiences.

## Overview

The Galileo animation system is built around a few core concepts:

1. **Integrated Physics Engine:** A powerful physics simulation system (enhanced in v1.0.8) that provides:
   - Realistic spring physics and collision detection
   - Support for various body shapes (circles, rectangles)
   - Advanced features like object sleeping and custom integration methods
   - Direct access via `useGalileoPhysicsEngine` or its alias `usePhysicsEngine` for custom simulations

2. **Specialized Hooks:** High-level hooks that build on the physics engine:
   - `usePhysicsInteraction` for common UI interactions
   - `useGesturePhysics` for gesture-based animations
   - `useMagneticElement` for attraction effects
   - `useGalileoStateSpring` and `useMultiSpring` for state transitions

3. **Orchestration:** The `useAnimationSequence` hook allows coordinating complex multi-step and multi-element animations.
   - Now with improved TypeScript support in v1.0.19 through the new `PublicAnimationStage` type system
   - Simplified API makes creating complex animation sequences more intuitive

4. **Event-Based State Transitions:** The refactored `useGameAnimation` hook (v1.0.28+) provides a powerful system for state-based animations with:
   - Event emitter pattern for predictable state transitions 
   - Middleware support for logging, error recovery, and performance monitoring
   - AbortController pattern for cleaner resource management
   - Improved error handling for interrupted animations

5. **Accessibility:** Features like `useReducedMotion` ensure animations respect user preferences and device capabilities.

6. **Performance:** Adaptive quality tiers and optimizations ensure animations run smoothly across devices.

## Documentation Sections

*   **[Physics Engine API](../physics/engine-api.md):** Documentation for the enhanced physics engine and `useGalileoPhysicsEngine` (also available as `usePhysicsEngine`) hook (v1.0.8+).
*   **[Core Physics Hooks](./hooks/physics-interaction.md):** Learn about hooks like `usePhysicsInteraction`, `useGalileoStateSpring`, and `useMultiSpring` for adding physics-based feedback and state transitions.
*   **[Gesture Physics](./gesture-physics.md):** Documentation for `useGesturePhysics` and related gesture handling.
*   **[Magnetic Effects](./magnetic-effects.md):** Documentation for `useMagneticElement`.
*   **[Animation Orchestration](./orchestration.md):** Deep dive into `useAnimationSequence` for creating complex animation sequences.
*   **[Game Animation](./game-animation.md):** Documentation for the `useGameAnimation` hook for state-based animations.
*   **[Animation Context & Configuration](./context-config.md):** Understand how to use `AnimationProvider` and `useAnimationContext` for global settings and presets.
*   **[Accessibility](./accessibility.md):** Details on `useReducedMotion` and building accessible animations.
*   **[Migration Guide](../migrations/ANIMATION-SYSTEM-MIGRATION-GUIDE.md):** Guide for migrating to the refactored event-based animation system (v1.0.28+).

Choose the appropriate section based on your needs:
- For custom physics simulations or game-like mechanics, start with the Physics Engine API.
- For common UI interactions, use the Core Physics Hooks.
- For complex animations, refer to Animation Orchestration.
- For state-based transitions in components or applications, use the Game Animation Framework.
- For migrating from the older animation system to the new event-based system, see the Migration Guide.