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

