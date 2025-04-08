import React from 'react';
import { useMagneticElement } from '@veerone/galileo-glass-ui';
import styled from 'styled-components';

const MagneticBox = styled.div`
  width: 100px;
  height: 100px;
  background-color: #8b5cf6; /* secondary color */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  /* Base transform origin */
  transform-origin: center center;
  will-change: transform; /* Performance hint */
`;

const MagneticDemo = () => {
  const { 
    elementRef,   // Ref to attach to the div
    transform,    // Current transform state { x, y, rotation, scale, active, force }
    isActive,     // Boolean indicating if the effect is active
    // activeClass // Optional class name when active
  } = useMagneticElement<HTMLDivElement>({
    strength: 0.6,         // How strong the pull is (0-1)
    radius: 150,           // Activation radius in pixels
    maxDisplacement: 25,   // Max pixels the element can move
    affectsRotation: true, // Allow rotation
    rotationAmplitude: 15, // Max rotation in degrees
    affectsScale: true,    // Allow scaling
    scaleAmplitude: 0.1,   // Max scale change (e.g., 0.9 to 1.1)
    easeFactor: 0.2,       // Smoothing factor
    motionSensitivityLevel: 'subtle', // Overrides the sensitivity level from AnimationContext
    category: 'FEEDBACK', // Semantic category for the animation
  });

  return (
    <div style={{ padding: '50px' }}> {/* Add padding to allow movement */} 
      <MagneticBox 
        ref={elementRef} // *** CRITICAL: Attach the ref here ***
        // *** NO style object needed - transform is applied directly by the hook ***
      >
        Magnetic
        {isActive && <span style={{ fontSize: '10px', position: 'absolute', bottom: '5px' }}>Active!</span>}
      </MagneticBox>
      {/* Displaying the state for demonstration */}
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

---

## `useMagneticElement` Hook

This hook simplifies adding magnetic pointer interactions to elements.

```typescript
import { useMagneticElement, MagneticElementOptions } from '@veerone/galileo-glass-ui';

const { 
  elementRef,
  transform,
  isActive,
  activeClass,
  activate,
  deactivate
} = useMagneticElement<ElementType>(options);
```

### How it Works & Usage

1.  **Initialization:** Call the hook with desired `MagneticElementOptions`.
2.  **Attach Ref:** **Crucially, you *must* attach the returned `elementRef` to the DOM element you want to make magnetic.**
    ```jsx
    <div ref={elementRef}>Magnetic Element</div>
    ```
3.  **Style Application:** The hook internally uses `useMagneticEffect`, which directly manipulates the `transform` style property of the referenced element during pointer interaction. **You do NOT need to apply a `style` object returned from the hook** (unlike `usePhysicsInteraction` or `use3DTransform`). Ensure the element doesn't have conflicting CSS `transform` rules.
4.  **State Access:** The hook returns:
    *   `transform`: A state object (`MagneticTransform`) reflecting the current calculated magnetic effect (`{ x, y, rotation, scale, active, force }`). Use this to read the element's current displacement, rotation, etc., for other logic or UI feedback.
    *   `isActive`: A boolean indicating if the pointer is currently within the activation `radius` and the effect is active.
    *   `activeClass`: A CSS class name (if provided in options) that is added to the element when `isActive` is true.
    *   `activate`/`deactivate`: Functions to manually trigger the effect (useful for programmatic control).

### Configuration (`MagneticElementOptions`)

This extends the `MagneticEffectOptions` (from the underlying `useMagneticEffect` hook) with additional options:

*   **Core `MagneticEffectOptions`:**
    *   `strength?`: `number` (0-1) - Strength of the magnetic pull. Default: `0.5`.
    *   `radius?`: `number` (px) - Distance from the pointer at which the effect activates. Default: `100`.
    *   `maxDisplacement?`: `number` (px) - Maximum distance the element will move towards the pointer. Default: `50`.
    *   `affectsRotation?`: `boolean` - If true, the element rotates based on pointer position. Default: `false`.
    *   `rotationAmplitude?`: `number` (degrees) - Max rotation angle. Default: `10`.
    *   `affectsScale?`: `boolean` - If true, the element scales based on pointer proximity. Default: `false`.
    *   `scaleAmplitude?`: `number` - Max scale factor change (0-1). Default: `0.1`.
    *   `easeFactor?`: `number` (0-1) - Smoothing factor for the movement. Lower = smoother. Default: `0.2`.
    *   `reducedMotion?`: `boolean` - Force reduced motion (overrides context/system preference).
*   **`useMagneticElement` Specific Options:**
    *   `registerWithPhysics?`: `boolean` - If true, registers the element with a global physics system (experimental, allows interactions between elements). Default: `false`.
    *   `physicsConfig?`: `Partial<PhysicsObjectConfig>` - Configuration for the physics body if `registerWithPhysics` is true.
    *   `interactWithOtherElements?`: `boolean` - If true and registered with physics, allows this element to be moved by other magnetic physics objects. Default: `false`.
    *   `activeClassName?`: `string` - CSS class name to apply to the element when `isActive` is true.
    *   `onActivate?`: `() => void` - Callback when the effect becomes active.
    *   `onDeactivate?`: `() => void` - Callback when the effect becomes inactive.
    *   `onTransform?`: `(transform: MagneticTransform) => void` - Callback fired on each animation frame while the transform is changing.
    *   `motionSensitivityLevel?`: `MotionSensitivityLevel` - Overrides the sensitivity level from `AnimationContext`. Affects physics parameters (`maxDisplacement`, spring settings) when `prefers-reduced-motion` is active.
    *   `category?`: `AnimationCategory` - Semantic category for the animation (e.g., `FEEDBACK`).

### Return Value (`MagneticElementResult<T>`)

*   **`elementRef`**: `RefObject<T>` - Attach this to your target element.
*   **`transform`**: `MagneticTransform` - Current state (`{ x, y, rotation, scale, active, force }`).
*   **`isActive`**: `boolean` - True if the pointer is within the radius.
*   **`activeClass`**: `string | null` - The `activeClassName` if provided and `isActive` is true.
*   **`activate`**: `() => void` - Manually trigger activation.
*   **`deactivate`**: `() => void` - Manually trigger deactivation. 