# Magnetic Element Demo

## React Example

```jsx
import React from 'react';
import { useMagneticElement } from '@veerone/galileo-glass-ui/hooks';
import styled from 'styled-components';

const MagneticBox = styled.div`
  width: 100px;
  height: 100px;
  background-color: #8b5cf6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transform-origin: center center;
  will-change: transform;
`;

const MagneticDemo = () => {
  const { 
    elementRef,
    transform,
    isActive,
  } = useMagneticElement<HTMLDivElement>({
    strength: 0.6,
    radius: 150,
    maxDisplacement: 25,
    affectsRotation: true,
    rotationAmplitude: 15,
    affectsScale: true,
    scaleAmplitude: 0.1,
    easeFactor: 0.2,
    motionSensitivityLevel: 'subtle',
    category: 'FEEDBACK',
  });

  return (
    <div style={{ padding: '50px' }}>
      <MagneticBox ref={elementRef}>
        Magnetic
        {isActive && <span style={{ fontSize: '10px', position: 'absolute', bottom: '5px' }}>Active!</span>}
      </MagneticBox>
      <div style={{ marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
        Active: {isActive.toString()} <br />
        Force: {transform.force.toFixed(2)} <br />
        X: {transform.x.toFixed(2)}px <br />
        Y: {transform.y.toFixed(2)}px <br />
        Rot: {transform.rotation.toFixed(2)}deg <br />
        Scale: {transform.scale.toFixed(2)}
      </div>
    </div>
  );
};

export default MagneticDemo;
```

---

## `useMagneticElement` Hook Documentation

### Importing the Hook

```typescript
import { useMagneticElement, MagneticElementOptions } from '@veerone/galileo-glass-ui/hooks';
```

### Usage Guide

1. **Initialize:** Call `useMagneticElement` with desired `MagneticElementOptions`.
2. **Attach Ref:** Attach the returned `elementRef` to your DOM element:

```jsx
<div ref={elementRef}>Magnetic Element</div>
```

3. **Automatic Style:** The hook automatically applies transforms. Avoid conflicting CSS transforms.
4. **Access State:** Use returned states like `transform` and `isActive` for additional logic.

### Configuration (`MagneticElementOptions`)

| Option                    | Type                | Default  | Description                                             |
|---------------------------|---------------------|----------|---------------------------------------------------------|
| `strength`                | `number` (0-1)      | `0.5`    | Strength of magnetic pull                               |
| `radius`                  | `number` (px)       | `100`    | Activation radius                                       |
| `maxDisplacement`         | `number` (px)       | `50`     | Max displacement                                        |
| `affectsRotation`         | `boolean`           | `false`  | Enable rotation effect                                  |
| `rotationAmplitude`       | `number` (degrees)  | `10`     | Rotation amplitude                                      |
| `affectsScale`            | `boolean`           | `false`  | Enable scale effect                                     |
| `scaleAmplitude`          | `number`            | `0.1`    | Scale amplitude                                         |
| `easeFactor`              | `number` (0-1)      | `0.2`    | Smoothing factor                                        |
| `motionSensitivityLevel`  | `string`            | Context  | Overrides context/system sensitivity level              |
| `category`                | `AnimationCategory` | Optional | Semantic animation categorization                       |

### Returned Values (`MagneticElementResult<T>`)

- **`elementRef`**: Attach to element to enable effect.
- **`transform`**: Current state `{ x, y, rotation, scale, active, force }`.
- **`isActive`**: Boolean indicating if the effect is currently active.
- **`activate` / `deactivate`**: Functions to manually control the magnetic effect.

## Integration with Event-Based Animation System (v1.0.28+)

The `useMagneticElement` hook can be combined with the event-based animation system introduced in v1.0.28:

```tsx
import React, { useEffect } from 'react';
import { 
  useMagneticElement, 
  useGameAnimation, 
  GameAnimationEventType 
} from '@veerone/galileo-glass-ui';

function MagneticWithEvents() {
  // Set up magnetic element
  const { 
    elementRef, 
    isActive, 
    transform 
  } = useMagneticElement({
    strength: 0.5,
    radius: 120,
    affectsScale: true,
    affectsRotation: true
  });
  
  // Set up game animation controller
  const gameAnimation = useGameAnimation({
    initialState: 'default',
    states: [
      { id: 'default', name: 'Default State' },
      { id: 'highlighted', name: 'Highlighted State' },
      { id: 'disabled', name: 'Disabled State' }
    ],
    transitions: [
      { from: 'default', to: 'highlighted', type: 'fade', duration: 300 },
      { from: 'highlighted', to: 'default', type: 'fade', duration: 200 },
      { from: '*', to: 'disabled', type: 'fade', duration: 200 }
    ]
  });
  
  // Get the event emitter
  const emitter = gameAnimation.getEventEmitter();
  
  // Use magnetic activity to trigger state changes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isActive) {
      // When magnetic effect becomes active, transition to highlighted state
      gameAnimation.transitionTo('highlighted');
      
      // Log the event using the emitter
      emitter.emit({
        type: 'magnetic:active',
        data: { transform },
        source: 'magnetic-element',
        timestamp: Date.now(),
        preventDefault: false,
        prevent: () => {}
      });
    } else {
      // Add a small delay before returning to default state
      timeout = setTimeout(() => {
        if (gameAnimation.activeStates[0]?.id !== 'disabled') {
          gameAnimation.transitionTo('default');
        }
      }, 300);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isActive, gameAnimation, emitter, transform]);
  
  // Listen for state changes from the game animation system
  useEffect(() => {
    const unsubscribe = emitter.on(GameAnimationEventType.STATE_CHANGE, (event) => {
      const { newStateId } = event.data;
      
      // When entering disabled state, modify the magnetic element's DOM node
      if (newStateId === 'disabled' && elementRef.current) {
        elementRef.current.style.pointerEvents = 'none';
        elementRef.current.style.opacity = '0.5';
      } else if (elementRef.current) {
        elementRef.current.style.pointerEvents = 'auto';
        elementRef.current.style.opacity = '1';
      }
    });
    
    return unsubscribe;
  }, [emitter, elementRef]);
  
  return (
    <div className="container">
      <div 
        ref={elementRef} 
        className="magnetic-element"
        style={{
          width: 100,
          height: 100,
          background: isActive ? '#4f46e5' : '#6366f1',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer'
        }}
        onClick={() => {
          // Toggle between disabled and default states on click
          if (gameAnimation.activeStates[0]?.id === 'disabled') {
            gameAnimation.transitionTo('default');
          } else {
            gameAnimation.transitionTo('disabled');
          }
        }}
      >
        {gameAnimation.activeStates[0]?.id === 'disabled' ? 'Disabled' : 'Magnetic'}
      </div>
      
      <div style={{ marginTop: 16 }}>
        <p>State: {gameAnimation.activeStates[0]?.id}</p>
        <p>Magnetic active: {isActive.toString()}</p>
      </div>
    </div>
  );
}
```

This integration demonstrates:

1. **Bidirectional Communication**: The magnetic element can trigger state changes in the animation system, and the animation system can modify the magnetic element's behavior.

2. **Custom Events**: You can emit custom events through the event emitter to track user interactions.

3. **Coordinated States**: The magnetic element and the game animation system stay synchronized.

4. **Enhanced User Experience**: Combine the subtle, interactive magnetic effect with broader application state transitions.

