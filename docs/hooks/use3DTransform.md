import React from 'react';
import { use3DTransform, Transform3DState, Vector3D } from '@veerone/galileo-glass-ui';
import styled from 'styled-components';
import { GlassPaper } from '@veerone/galileo-glass-ui'; // Use actual component

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

// Use GlassPaper for styling
const StyledDimensionalElement = styled(GlassPaper)`
  padding: 30px;
  width: 150px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease-out; // Add a basic transition for non-physics interaction
`;

/**
 * Demonstrates using the use3DTransform hook
 */
const DimensionalElementDemo = () => {
  // Hook Setup
  const { 
    elementRef,   // Ref to attach to the element
    transformState, // Current state { translate, rotate, scale }
    style,        // CSS style object to apply
    setTransform, // Function to update state
    animateTo     // Function to animate state (uses physics if enabled)
  } = use3DTransform<HTMLDivElement>({
    initialTranslate: { x: 0, y: 0, z: 0 },
    initialRotate: { x: 0, y: 0, z: 0 },
    initialScale: 1,
    transformOrigin: '50% 50%',
    enablePhysics: true, // Enable spring physics
    physicsConfig: 'DEFAULT', // Use a spring preset
  });

  const handleMouseEnter = () => {
    // Define target state using the exported Vector3D type
    const targetState: Partial<Transform3DState> = {
      translate: { x: 0, y: -10, z: 50 } as Vector3D,
      rotate: { x: 20, y: 0, z: 5 } as Vector3D,
      scale: { x: 1.1, y: 1.1, z: 1.1 } as Vector3D, // Scale up
    };
    animateTo(targetState); // Animate to the target state
  };

  const handleMouseLeave = () => {
    // Animate back to initial state (or define explicitly)
    const initialState: Partial<Transform3DState> = {
      translate: { x: 0, y: 0, z: 0 } as Vector3D,
      rotate: { x: 0, y: 0, z: 0 } as Vector3D,
      scale: { x: 1, y: 1, z: 1 } as Vector3D,
    };
    animateTo(initialState);
  };

  return (
    <PerspectiveContainer> { /* Perspective must be on a parent */ }
      <StyledDimensionalElement
        ref={elementRef} // Attach the ref
        style={style}    // Apply the transform styles
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        elevation={3} // GlassPaper prop
      >
        Hover Me (3D)
      </StyledDimensionalElement>
    </PerspectiveContainer>
  );
};

export default DimensionalElementDemo;


---

## Hook Usage (`use3DTransform`)

This hook manages 3D transformations (translate, rotate, scale) for an element, optionally using spring physics for animations.

```typescript
import { use3DTransform, Transform3DOptions, Transform3DState, Vector3D } from '@veerone/galileo-glass-ui';

const { 
  elementRef, 
  transformState, 
  style, 
  setTransform, 
  animateTo 
} = use3DTransform<ElementType>(options);
```

### Configuration (`Transform3DOptions`)

*   `initialTranslate?`: `Partial<Vector3D>` - Initial `{ x, y, z }` translation.
*   `initialRotate?`: `Partial<Vector3D>` - Initial `{ x, y, z }` rotation in degrees.
*   `initialScale?`: `Partial<Vector3D> | number` - Initial `{ x, y, z }` scale or a single number for uniform scale.
*   `transformOrigin?`: `string` - CSS `transform-origin` property (e.g., `'50% 50% 0'`).
*   `enablePhysics?`: `boolean` - Set to `true` to use spring physics for animations via `animateTo`. Default: `false`.
*   `physicsConfig?`: `Partial<SpringConfig> | SpringPresetName` - Configuration for the physics springs (used if `enablePhysics` is true). Accepts a `SpringConfig` object or a preset name string.

### Return Value (`Transform3DResult<T>`)

The hook returns an object containing:

*   **`elementRef`**: `RefObject<T>` - A React ref object. Attach this to the DOM element you want to transform.
*   **`transformState`**: `Transform3DState` - An object representing the current transformation state:
    *   `translate`: `Vector3D` (`{ x, y, z }`)
    *   `rotate`: `Vector3D` (`{ x, y, z }` degrees)
    *   `scale`: `Vector3D` (`{ x, y, z }`)
*   **`style`**: `CSSProperties` - An object containing the calculated CSS `transform` and `transform-origin` styles. Apply this directly to your element's `style` prop.
*   **`setTransform`**: `(newState: Partial<Transform3DState>) => void` - Function to instantly update the transform state. If `enablePhysics` is true, this will start spring animations towards the new state.
*   **`animateTo`**: `(targetState: Partial<Transform3DState>, duration?: number) => void` - Function to animate to a target state. If `enablePhysics` is true, it uses the configured springs (duration is ignored). If `enablePhysics` is false, a basic transition might be needed via CSS (as shown in the demo).

### Important Notes

*   **Perspective:** For 3D effects (especially Z translation and X/Y rotation) to be visible, the **parent element** of the element using `use3DTransform` needs to have the CSS `perspective` property set (e.g., `perspective: 800px;`). This property should *not* be set on the transformed element itself.
*   **State Structure:** Use the exported `Vector3D` type when defining target states for `setTransform` or `animateTo` to ensure type safety.
*   **Physics:** When `enablePhysics` is true, `animateTo` leverages the `useVectorSpring` hook internally. The `duration` parameter is ignored in this mode. 