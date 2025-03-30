# Migrating Animations to Galileo Glass UI v1.0.5+

Galileo Glass UI v1.0.5 introduces a completely revamped, physics-based animation system built on React Spring. This guide helps you migrate your existing animations (CSS transitions/animations, Framer Motion, etc.) to the new Galileo hooks and conventions for better performance, accessibility, and consistency.

## Prerequisites

*   Ensure your project is using `galileo-glass-ui` version `1.0.5` or later.

## Core Concepts of the New System

*   **Physics Hooks:** Core hooks like `usePhysicsInteraction`, `useGalileoStateSpring`, and `useMultiSpring` provide spring-based animations for interactions and state changes.
*   **Transition Hooks:** Helpers like `useTransitioningState` and `useDropdownTransition` manage component mount/unmount lifecycle animations.
*   **Orchestration:** `useAnimationSequence` allows coordinating complex animation sequences.
*   **Context & Presets:** The `AnimationProvider` and `useAnimationContext` allow global configuration and provide named presets (e.g., `'quick'`, `'gentle'`) for consistent spring physics.
*   **Accessibility:** The system integrates `useReducedMotion` to respect user preferences automatically.

See the full animation documentation for details:
*   [Physics Hooks](../animations/physics-hooks.md)
*   [State and Transition Hooks](../animations/transition-hooks.md)
*   [Orchestration](../animations/orchestration.md)
*   [Context and Configuration](../animations/context-config.md)
*   [Accessibility](../animations/accessibility.md)

## Migration Steps

### 1. Replacing CSS Transitions/Animations

Identify components using CSS `transition` or `@keyframes` for animations, especially on interaction states (hover, focus, active) or conditional classes.

**Before (CSS):**

```css
.my-button {
  transition: transform 0.2s ease-out, background-color 0.2s ease-out;
}

.my-button:hover {
  transform: scale(1.05);
  background-color: var(--hover-color);
}

.my-button:active {
  transform: scale(0.95);
}
```

**After (Galileo Hooks):**

```tsx
import { usePhysicsInteraction } from 'galileo-glass-ui';
import { animated } from '@react-spring/web';

function MyButton(props) {
  const { interactionProps, isPressed, isHovered } = usePhysicsInteraction();

  const styles = useGalileoStateSpring({
    scale: isPressed ? 0.95 : isHovered ? 1.05 : 1,
    // Animate other properties like background-color similarly
    config: 'quick' // Use a preset or define custom config
  });

  return (
    <animated.button {...interactionProps} style={styles} {...props} />
  );
}
```

### 2. Replacing Framer Motion

Replace `motion.div` (or other `motion` elements), `animate` props, and `transition` props with Galileo hooks.

**Before (Framer Motion):**

```tsx
import { motion } from 'framer-motion';

function MotionComponent({ isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    />
  );
}
```

**After (Galileo Hooks):**

```tsx
import { useGalileoStateSpring } from 'galileo-glass-ui';
import { animated } from '@react-spring/web';

function GalileoComponent({ isVisible }) {
  const styles = useGalileoStateSpring({
    opacity: isVisible ? 1 : 0,
    y: isVisible ? 0 : 20,
    config: { tension: 300, friction: 30 } // Or use presets
    // `useTransitioningState` might be needed for mount/unmount
  });

  return (
    <animated.div style={styles} />
  );
}
```

### 3. Leveraging Context

Wrap your application (or relevant parts) in `AnimationProvider` to provide default configurations and allow users to control animation preferences.

```tsx
import { AnimationProvider } from 'galileo-glass-ui';

function App() {
  return (
    <AnimationProvider /* Optional: custom config */ >
      {/* Your application */}
    </AnimationProvider>
  );
}
```

Components using Galileo hooks will automatically pick up context defaults if no specific `config` or `animationConfig` prop is provided.

### 4. Handling Mount/Unmount Animations

For components that need to animate in/out (like modals, dropdowns, tooltips), use `useTransitioningState` (or specialized hooks like `useDropdownTransition`) to manage the component's presence in the DOM and coordinate the animation states.

Refer to the [State and Transition Hooks](../animations/transition-hooks.md) documentation for examples.

### 5. Ensuring Accessibility

The Galileo hooks automatically respect the `prefers-reduced-motion` setting via `useReducedMotion`. Ensure you are not overriding this behavior unnecessarily.

*   Test your animations with reduced motion enabled in your OS or browser settings.
*   Animations should degrade gracefully to fades or instant transitions when reduced motion is preferred.

## Example: Migrating a Button's Hover/Press

*   **Identify:** A button uses CSS `:hover` and `:active` states with `transition`.
*   **Remove:** Delete the CSS transitions and hover/active style overrides.
*   **Implement:**
    *   Use the `usePhysicsInteraction` hook to get interaction state (`isHovered`, `isPressed`) and props (`interactionProps`).
    *   Use `useGalileoStateSpring` to define the animated styles (e.g., `scale`, `backgroundColor`) based on the interaction state.
    *   Apply the `interactionProps` and animated `style` to an `animated` element (e.g., `animated.button`).

## Example: Migrating a Modal Entrance

*   **Identify:** A modal uses Framer Motion's `AnimatePresence` and `motion.div` for entrance/exit.
*   **Remove:** Remove `AnimatePresence` and replace `motion.div` with `animated.div`.
*   **Implement:**
    *   Use `useTransitioningState` hooked to the modal's `isOpen` prop to manage rendering and animation phases.
    *   Use `useGalileoStateSpring` to define the entrance/exit animation styles (e.g., `opacity`, `transform`, `scale`) based on the state from `useTransitioningState`.
    *   Apply the animated `style` to the `animated.div`.

Remember to consult the specific hook documentation and component source code for more detailed examples and configuration options. 