# usePhysicsInteraction Hook

Provides sophisticated physics-based interaction effects (like spring, magnetic pull, tilt) for UI elements, responding to pointer events.

## Import

```jsx
import { usePhysicsInteraction } from '@galileo_glass/core';
// Or path: import { usePhysicsInteraction } from '../hooks/usePhysicsInteraction';
```

## Basic Usage (Springy Tilt)

```jsx
import React from 'react';
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui/hooks'; // Assuming correct path for the hook
import { Box } from '@veerone/galileo-glass-ui/components'; // Import Box from Galileo

function InteractiveElement() {
  const { ref, style: dynamicStyle } = usePhysicsInteraction<HTMLDivElement>({
    // Using default spring physics
    maxDisplacement: 15, // How far it moves (pixels)
    affectsTilt: true, // Enable tilt effect
    tiltAmplitude: 10, // Tilt amount (degrees)
    stiffness: 150,
    dampingRatio: 0.6,
    mass: 1,
  });

  // Define static styles separately
  const staticStyles: React.CSSProperties = {
    width: 150,
    height: 150,
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.2em',
    cursor: 'pointer',
    willChange: 'transform', // Good practice with transforms
  };

  return (
    <Box
      ref={ref}
      // Combine static styles and dynamic styles from the hook
      style={{ ...staticStyles, ...dynamicStyle }}
    >
      Interact Me!
    </Box>
  );
}
```

## Integration with Event-Based Animation System (v1.0.28+)

The `usePhysicsInteraction` hook can be integrated with the new event-based animation system introduced in v1.0.28:

```typescript
import React, { useEffect } from 'react';
import { 
  usePhysicsInteraction, 
  useGameAnimation, 
  GameAnimationEventType 
} from '@veerone/galileo-glass-ui';

function PhysicsWithEventExample() {
  // Basic physics interaction for our element
  const { ref, style } = usePhysicsInteraction({
    affectsScale: true,
    scaleAmplitude: 0.1,
    affectsTilt: true,
    tiltAmplitude: 8
  });
  
  // Game animation controller for state management
  const gameAnimation = useGameAnimation({
    initialState: 'idle',
    states: [
      { id: 'idle', name: 'Idle State' },
      { id: 'active', name: 'Active State' },
      { id: 'disabled', name: 'Disabled State' }
    ],
    transitions: [
      { from: 'idle', to: 'active', type: 'fade', duration: 300 },
      { from: 'active', to: 'idle', type: 'fade', duration: 200 },
      { from: '*', to: 'disabled', type: 'fade', duration: 150 }
    ]
  });
  
  // Get the event emitter
  const emitter = gameAnimation.getEventEmitter();
  
  // Listen for state changes to modify physics behavior
  useEffect(() => {
    const unsubscribe = emitter.on(GameAnimationEventType.STATE_CHANGE, (event) => {
      const newState = event.data.newStateId;
      if (newState === 'active') {
        // Boost physics effects in active state
        ref.current?.style.setProperty('--tilt-multiplier', '1.5');
        ref.current?.style.setProperty('--scale-multiplier', '1.2');
      } else if (newState === 'disabled') {
        // Disable physics effects in disabled state
        ref.current?.style.setProperty('--tilt-multiplier', '0');
        ref.current?.style.setProperty('--scale-multiplier', '0');
      } else {
        // Reset to default in idle state
        ref.current?.style.setProperty('--tilt-multiplier', '1');
        ref.current?.style.setProperty('--scale-multiplier', '1');
      }
    });
    
    return unsubscribe;
  }, [emitter, ref]);
  
  return (
    <div>
      <div 
        ref={ref} 
        style={{
          ...style,
          width: 150,
          height: 150,
          background: 'purple',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer'
        }}
        onClick={() => {
          // Toggle between active and idle states
          if (gameAnimation.activeStates[0]?.id === 'idle') {
            gameAnimation.transitionTo('active');
          } else {
            gameAnimation.transitionTo('idle');
          }
        }}
      >
        Interactive Element
      </div>
      
      <button 
        onClick={() => gameAnimation.transitionTo('disabled')}
        style={{ marginTop: 16 }}
      >
        Disable Effects
      </button>
    </div>
  );
}
```

This integration pattern allows:

1. **State-Based Physics Behavior**: Modify physics interaction parameters based on the current application state
2. **Event-Driven Updates**: React to application events to adjust physics behavior
3. **Coordinated Animations**: Synchronize physics interactions with state transitions
4. **Accessibility Control**: Use the event system's middleware to coordinate accessibility adjustments

The combination provides a powerful way to create interactive elements that respond both to direct user input (via physics) and application state (via the event system).