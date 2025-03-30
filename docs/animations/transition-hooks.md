# State and Transition Hooks

Galileo Glass UI provides specialized hooks to manage component state transitions and create smooth entrance/exit animations, especially for elements like dropdowns and popovers.

## `useTransitioningState`

The `useTransitioningState` hook is a powerful utility for managing the lifecycle states of a component (e.g., entering, entered, exiting, exited) and applying animations during these transitions. It often works in conjunction with spring-based animation hooks like `useGalileoStateSpring` or `useMultiSpring`.

**Purpose:**

*   Manages mount/unmount animations.
*   Provides explicit state flags (`isMounted`, `isEntering`, `isExiting`) for conditional rendering and styling.
*   Coordinates animation timing with component lifecycle.

**Basic Usage:**

```tsx
import { useState } from 'react';
import { useTransitioningState, useGalileoStateSpring } from 'galileo-glass-ui';
import { animated } from '@react-spring/web';

function AnimatedComponent({ isVisible }) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  const { isMounted, isEntering, transitionStatus } = useTransitioningState(isVisible, {
    onExited: () => setShouldRender(false), // Unmount after exit animation
    onEnter: () => setShouldRender(true), // Mount before enter animation
  });

  const styles = useGalileoStateSpring({
    opacity: isMounted && transitionStatus !== 'exiting' ? 1 : 0,
    transform: isMounted && transitionStatus !== 'exiting' ? 'translateY(0px)' : 'translateY(20px)',
    config: 'gentle', // Or use context/props
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <animated.div style={styles}>
      I fade and slide in/out!
    </animated.div>
  );
}
```

**Key Features:**

*   **State Management:** Tracks `entering`, `entered`, `exiting`, `exited` states.
*   **Callbacks:** Provides `onEnter`, `onEntering`, `onEntered`, `onExit`, `onExiting`, `onExited` callbacks.
*   **Animation Integration:** Designed to work seamlessly with React Spring hooks.
*   **Configuration:** Allows customization of transition durations or behavior (though often driven by the animation hook's config).

## `useDropdownTransition`

This hook is specifically designed to simplify the creation of physics-based entrance and exit animations for dropdown menus, select popovers, and similar elements. It likely wraps `useTransitioningState` and `useGalileoStateSpring` with preset configurations suitable for dropdowns.

**Purpose:**

*   Provides standardized, accessible dropdown animations.
*   Simplifies the implementation of common popover transitions (e.g., fade + scale).
*   Ensures consistency across dropdown-like components.

**Basic Usage:**

```tsx
import { useDropdownTransition } from 'galileo-glass-ui';
import { animated } from '@react-spring/web';

function DropdownMenu({ isOpen }) {
  // Manages rendering, state, and animation styles based on isOpen
  const { shouldRender, styles } = useDropdownTransition(isOpen, {
     // Optional: Override default spring config or callbacks
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <animated.div style={styles} role="menu">
      {/* Menu items */}
    </animated.div>
  );
}

```

**Key Features:**

*   **Simplified API:** Abstracts away the complexity of combining state management and animation hooks.
*   **Presets:** Uses default spring configurations suitable for dropdowns (e.g., quick, subtle).
*   **Accessibility:** Ensures transitions are handled accessibly (e.g., respecting reduced motion).

*(Note: The exact API and configuration options might differ slightly based on the final implementation. Refer to the source code or specific component examples for precise usage.)* 