# Galileo Glass Animation System Migration Guide

## Overview

This guide explains how to migrate from the legacy animation system to the new event-based animation system introduced in version 1.0.28. The new system offers improved performance, better state management, and enhanced error recovery.

## Key Improvements

- **Event Emitter Pattern**: More predictable state transitions with proper event flow
- **Middleware Layers**: For logging, transformations, and error recovery
- **AbortController Pattern**: Cleaner cancellation and resource management
- **Improved Error Recovery**: Graceful handling of animation interruptions
- **Performance Optimizations**: Batched style updates and reduced DOM reflows

## Migration Steps

### Step 1: Update Import Statements

Replace the old imports with the new refactored hook:

```typescript
// Before
import { useGameAnimation } from '@galileo/animations/game';

// After
import { useGameAnimationRefactored as useGameAnimation } from '@galileo/animations/game';
```

### Step 2: Update Component Configuration

The API remains backward compatible, so your existing configuration should work with the new system. However, you can take advantage of new options:

```typescript
// Before
const gameAnimation = useGameAnimation({
  initialState: 'menu',
  states: gameStates,
  transitions: gameTransitions,
  debug: false
});

// After - with enhanced options
const gameAnimation = useGameAnimation({
  initialState: 'menu',
  states: gameStates,
  transitions: gameTransitions,
  debug: false,
  // New options (all optional)
  motionSensitivity: MotionSensitivityLevel.MEDIUM // Better accessibility
});
```

### Step 3: Update Event Listeners (Optional)

If you were manually managing animations or listening for state changes, you can now use the event system for more precise control:

```typescript
import { GameAnimationEventType } from '@galileo/animations/game';

// Inside your component
useEffect(() => {
  // Get the event emitter from the hook (requires ref forwarding)
  const emitter = gameAnimationRef.current.getEventEmitter();
  
  // Add event listeners
  const stateChangeListener = (event) => {
    console.log('State changed:', event.data);
  };
  
  emitter.on(GameAnimationEventType.STATE_CHANGE, stateChangeListener);
  
  // Clean up
  return () => {
    emitter.removeEventListener(GameAnimationEventType.STATE_CHANGE, stateChangeListener);
  };
}, []);
```

### Step 4: Implement Error Recovery (Optional)

The new system provides built-in error recovery for common animation issues. You can extend this with custom strategies:

```typescript
import { createErrorRecoveryMiddleware } from '@galileo/animations/game';

// Define custom recovery strategies
const customStrategies = {
  'NetworkError': (error, context) => {
    // Handle network-related animation errors
    return { resolved: true, resolution: 'Retried animation after network recovery' };
  }
};

// Apply custom middleware
const middleware = createErrorRecoveryMiddleware(customStrategies);
```

## Usage Examples

### Basic State Transition

```typescript
function GameMenu() {
  const gameAnimation = useGameAnimation({
    initialState: 'menu',
    states: [
      { id: 'menu', elements: '.menu-element' },
      { id: 'settings', elements: '.settings-element' },
      { id: 'game', elements: '.game-element' }
    ],
    transitions: [
      { from: 'menu', to: 'game', type: TransitionType.FADE }
    ]
  });
  
  return (
    <div>
      <button onClick={() => gameAnimation.transitionTo('game')}>
        Start Game
      </button>
    </div>
  );
}
```

### Advanced Usage with Error Handling

```typescript
function GameWithErrorHandling() {
  const [errorState, setErrorState] = useState(null);
  
  const gameAnimation = useGameAnimation({
    initialState: 'menu',
    states: gameStates,
    transitions: gameTransitions
  });
  
  useEffect(() => {
    const emitter = gameAnimationRef.current.getEventEmitter();
    
    const errorListener = (event) => {
      setErrorState({
        message: event.data.error.message,
        recoverable: event.data.recoverable
      });
    };
    
    emitter.on(GameAnimationEventType.ANIMATION_ERROR, errorListener);
    
    return () => {
      emitter.removeEventListener(GameAnimationEventType.ANIMATION_ERROR, errorListener);
    };
  }, []);
  
  // Render with error state handling
  return (
    <div>
      {errorState && (
        <ErrorBanner 
          message={errorState.message} 
          isRecoverable={errorState.recoverable}
          onRetry={() => gameAnimation.resumeTransition()}
        />
      )}
      {/* Game UI */}
    </div>
  );
}
```

## Troubleshooting

### Animation Not Completing

If animations get stuck or don't complete:

1. Check if elements are visible and in the DOM
2. Verify transition parameters (duration, easing)
3. Use the `debug: true` option to see detailed logging
4. Listen for `TRANSITION_ERROR` events to catch issues

### Unexpected State Changes

If states change unexpectedly:

1. Add `onStateChange` callback for additional logging
2. Verify transition conditions
3. Check if there are conflicting automations

### Performance Issues

If animations are slow or cause jank:

1. Use the built-in performance middleware to identify bottlenecks
2. Consider reducing the number of animated elements
3. Simplify complex transitions
4. Use staggered animations for many elements

## Additional Resources

- See the full API documentation at `/docs/api/animations.md`
- Example components in `/examples/animations/`
- Unit tests for reference at `/src/animations/game/__tests__/` 