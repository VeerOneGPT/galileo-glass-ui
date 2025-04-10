# Dimensional Element Demo (3D Transform Hook)

## React Component Example

This demonstrates the use of the `use3DTransform` hook provided by the `@veerone/galileo-glass-ui` library to create interactive 3D transformations.

### Import Statements

```jsx
import React from 'react';
import { use3DTransform, Transform3DState, Vector3D } from '@veerone/galileo-glass-ui/hooks';
import styled from 'styled-components';
import { GlassPaper } from '@veerone/galileo-glass-ui';
```

### Styled Components

Define styled components for container and element:

```jsx
// Container to provide perspective
const PerspectiveContainer = styled.div`
  perspective: 800px;
  perspective-origin: 50% 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  background-color: #f0f0f0;
`;

// Styled dimensional element using GlassPaper
const StyledDimensionalElement = styled(GlassPaper)`
  padding: 30px;
  width: 150px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease-out;
`;
```

### Component Implementation

```jsx
const DimensionalElementDemo = () => {
  const {
    elementRef,
    transformState,
    style,
    setTransform,
    animateTo
  } = use3DTransform<HTMLDivElement>({
    initialTranslate: { x: 0, y: 0, z: 0 },
    initialRotate: { x: 0, y: 0, z: 0 },
    initialScale: 1,
    transformOrigin: '50% 50%',
    enablePhysics: true,
    physicsConfig: 'DEFAULT',
  });

  const handleMouseEnter = () => {
    const targetState: Partial<Transform3DState> = {
      translate: { x: 0, y: -10, z: 50 } as Vector3D,
      rotate: { x: 20, y: 0, z: 5 } as Vector3D,
      scale: { x: 1.1, y: 1.1, z: 1.1 } as Vector3D,
    };
    animateTo(targetState);
  };

  const handleMouseLeave = () => {
    const initialState: Partial<Transform3DState> = {
      translate: { x: 0, y: 0, z: 0 } as Vector3D,
      rotate: { x: 0, y: 0, z: 0 } as Vector3D,
      scale: { x: 1, y: 1, z: 1 } as Vector3D,
    };
    animateTo(initialState);
  };

  return (
    <PerspectiveContainer>
      <StyledDimensionalElement
        ref={elementRef}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        elevation={3}
      >
        Hover Me (3D)
      </StyledDimensionalElement>
    </PerspectiveContainer>
  );
};

export default DimensionalElementDemo;
```

---

## Hook Documentation (`use3DTransform`)

This hook manages 3D transformations for React elements, optionally leveraging spring physics for smooth animations.

### Basic Usage

```typescript
import { use3DTransform, Transform3DOptions, Transform3DState, Vector3D } from '@veerone/galileo-glass-ui/hooks';

const { elementRef, transformState, style, setTransform, animateTo } = use3DTransform<ElementType>(options);
```

### Configuration Options (`Transform3DOptions`)

- **`initialTranslate?`**: `Partial<Vector3D>` - Initial translation (`{ x, y, z }`).
- **`initialRotate?`**: `Partial<Vector3D>` - Initial rotation (`{ x, y, z }` degrees).
- **`initialScale?`**: `Partial<Vector3D> | number` - Initial scale (`{ x, y, z }`) or uniform scale number.
- **`transformOrigin?`**: `string` - CSS `transform-origin` (e.g., `'50% 50% 0'`).
- **`enablePhysics?`**: `boolean` - Enables spring physics. Default is `false`.
- **`physicsConfig?`**: `Partial<SpringConfig> | SpringPresetName` - Spring physics configuration or preset.

### Returned Values (`Transform3DResult<T>`)

- **`elementRef`**: React ref object.
- **`transformState`**: Current transform state (`translate`, `rotate`, `scale`).
- **`style`**: CSS properties for element styles (`transform`, `transform-origin`).
- **`setTransform`**: Instantly updates the transform state; uses physics if enabled.
- **`animateTo`**: Animates element to target state; physics enabled ignores `duration`.

### Notes

- **Perspective Requirement**: The parent element must define the CSS `perspective` property.
- **Type Safety**: Use `Vector3D` for defining transformations.
- **Physics Animation**: When physics is enabled, animations utilize the `useVectorSpring` hook internally, ignoring the explicit duration.

