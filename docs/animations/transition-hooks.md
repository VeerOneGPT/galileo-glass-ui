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

## Integration with Event-Based Animation System (v1.0.28+)

The transition hooks can be integrated with the refactored event-based animation system introduced in v1.0.28.

### Combining Transition Hooks with GameAnimationController

```tsx
import React, { useEffect } from 'react';
import { 
  useTransitioningState, 
  useGameAnimation, 
  GameAnimationEventType 
} from '@veerone/galileo-glass-ui';

function AnimatedDropdown({ isOpen }) {
  // Use transitioning state for mount/unmount control
  const { isMounted, transitionStatus } = useTransitioningState(isOpen, {
    onExited: () => console.log('Fully unmounted'),
    onEntered: () => console.log('Fully mounted')
  });
  
  // Use game animation for the actual animation logic
  const gameAnimation = useGameAnimation({
    initialState: 'closed',
    states: [
      { id: 'closed', name: 'Dropdown Closed' },
      { id: 'open', name: 'Dropdown Open', enterElements: '.dropdown-content' }
    ],
    transitions: [
      { from: 'closed', to: 'open', type: 'fade', duration: 300 },
      { from: 'open', to: 'closed', type: 'fade', duration: 200 }
    ]
  });
  
  // Connect the hooks via effects
  useEffect(() => {
    if (isOpen && transitionStatus === 'entering') {
      gameAnimation.transitionTo('open');
    } else if (!isOpen && transitionStatus === 'exiting') {
      gameAnimation.transitionTo('closed');
    }
  }, [isOpen, transitionStatus, gameAnimation]);
  
  // Use the event emitter for additional coordination
  useEffect(() => {
    const emitter = gameAnimation.getEventEmitter();
    
    const unsubscribe = emitter.on(GameAnimationEventType.TRANSITION_COMPLETE, (event) => {
      // Additional logic when transitions complete
      console.log(`Transition to ${event.data.targetStateId} complete`);
    });
    
    return unsubscribe;
  }, [gameAnimation]);
  
  // Render only when mounted
  if (!isMounted) return null;
  
  return (
    <div className="dropdown-container">
      <div className="dropdown-content">
        Dropdown Content
      </div>
    </div>
  );
}
```

### Benefits of Integration

This integration offers several advantages:

1. **Separation of Concerns**:
   - `useTransitioningState` handles mount/unmount lifecycle
   - `useGameAnimation` handles actual animation behavior
   - The event system provides coordination and monitoring

2. **Enhanced Transitions**:
   - Leverage the middleware system for error recovery
   - Monitor performance of transitions
   - Log transition events for debugging

3. **Centralized State Management**:
   - Keep animation state in a single location
   - Trigger transitions from multiple sources while maintaining consistency

### Example: Enhanced Dropdown with Logging

```tsx
import React from 'react';
import { 
  useTransitioningState, 
  useGameAnimation, 
  createLoggingMiddleware 
} from '@veerone/galileo-glass-ui';

function EnhancedDropdown({ isOpen }) {
  // Basic transition management
  const { isMounted, transitionStatus } = useTransitioningState(isOpen);
  
  // Game animation for coordinated effects
  const animation = useGameAnimation({ /* config */ });
  
  // Add logging middleware to the event emitter
  React.useEffect(() => {
    const emitter = animation.getEventEmitter();
    if (emitter) {
      emitter.addMiddleware(createLoggingMiddleware({
        level: 'debug',
        prefix: 'Dropdown'
      }));
    }
  }, [animation]);
  
  // Render...
}
```

This pattern is particularly useful for complex UI elements that need to coordinate multiple animations, handle errors gracefully, and maintain consistent state throughout the application. 