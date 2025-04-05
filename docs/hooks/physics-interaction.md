# usePhysicsInteraction Hook

**Status:** Core Hook

## Overview

The `usePhysicsInteraction` hook applies physics-based interactive effects (like springy movement, attraction, repulsion) to DOM elements in response to pointer (mouse/touch) events. It provides a simple way to add delightful micro-interactions without needing to manage the physics simulation directly.

## Import

```typescript
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui';
// Or
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui/hooks';
```

## Usage

Attach the `ref` returned by the hook to the target DOM element and apply the `style` object.

```typescript
import React, { useRef } from 'react';
import styled from 'styled-components';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '@veerone/galileo-glass-ui';

const InteractiveElement = styled.div`
  width: 100px;
  height: 100px;
  background-color: purple;
  border-radius: 10px;
  cursor: pointer;
  /* Apply perspective on a parent for tilt effects */
`;

function MyInteractiveComponent() {
  const config: PhysicsInteractionOptions = {
    type: 'magnetic', // Try 'spring', 'repel', 'magnetic'
    strength: 0.8,
    radius: 150,
    affectsScale: true,
    scaleAmplitude: 0.1,
    affectsTilt: true,
    tiltAmplitude: 10,
    animationConfig: { // Corrected: Use animationConfig or direct stiffness/dampingRatio
      tension: 150,
      friction: 12,
    },
    // Example enabling ambient tilt
    // enableAmbientTilt: true,
    // ambientTiltOptions: {
    //   maxTilt: 5,
    //   perspective: 800,
    // }
  };

  // Use the hook with configuration
  const { ref, style, state } = usePhysicsInteraction<HTMLDivElement>(config);

  return (
    <InteractiveElement ref={ref} style={style}>
      Interact with me!
      {/* Display state info (optional) */}
      {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
    </InteractiveElement>
  );
}
```

## API

### Hook Signature

```typescript
usePhysicsInteraction = <T extends HTMLElement = HTMLElement>(
  options?: PhysicsInteractionOptions
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties;
  state: PhysicsState;
  update: (newOptions: Partial<PhysicsInteractionOptions>) => void;
  reset: () => void;
  applyForce: (force: PhysicsVector) => void; // Placeholder
  applyImpulse: (impulse: PhysicsVector) => void; // Placeholder
  setPosition: (position: PhysicsVector) => void; // Placeholder
  isPaused: boolean; // Placeholder
  togglePause: () => void; // Placeholder
};
```

*   **`options?`**: Optional configuration object (`PhysicsInteractionOptions`).
*   **Returns:** An object containing:
    *   `ref`: A React ref object to attach to the target DOM element.
    *   `style`: A `React.CSSProperties` object containing calculated `transform` properties. Apply this to the element's `style` prop.
    *   `state`: A `PhysicsState` object containing the current values of the physics simulation (position, velocity, active state, etc.).
    *   `update`: Function to partially update the hook's options dynamically.
    *   `reset`: Function to reset the physics state to its initial position.
    *   *(Other returned functions like `applyForce`, `applyImpulse` are likely placeholders or less commonly used for this specific hook)*.

### `PhysicsInteractionOptions`

(Referencing types from `src/hooks/usePhysicsInteraction.ts`)

```typescript
export interface PhysicsInteractionOptions {
  /** Type of physics interaction (Default: 'spring') */
  type?: PhysicsInteractionType;
  /** Strength of the interaction (0-1) */
  strength?: number;
  /** Activation radius in pixels */
  radius?: number;
  /** Mass of the object (Default: 1) */
  mass?: number;
  /** Stiffness for spring physics (Default: ~170) */
  stiffness?: number;
  /** Damping ratio (Default: ~0.6) */
  dampingRatio?: number;
  /** Animation config preset or object (overrides stiffness/dampingRatio if provided) */
  animationConfig?: AnimationProps['animationConfig']; // e.g., 'gentle', { tension: 150, friction: 12 }
  /** Max displacement in pixels (Default: 10) */
  maxDisplacement?: number;
  /** Applies effect to Z-axis rotation */
  affectsRotation?: boolean;
  /** Rotation amplitude in degrees */
  rotationAmplitude?: number;
  /** Applies effect to scale */
  affectsScale?: boolean;
  /** Scale amplitude (e.g., 0.1 for 10% scale change) */
  scaleAmplitude?: number;
  /** Applies effect to 3D tilt (rotateX/rotateY) */
  affectsTilt?: boolean;
  /** Tilt amplitude in degrees */
  tiltAmplitude?: number;
  /** Use GPU acceleration (translateZ(0)) */
  gpuAccelerated?: boolean; // Default: true
  /** Force reduced motion */
  reducedMotion?: boolean;
  /** Motion sensitivity level */
  motionSensitivityLevel?: MotionSensitivityLevel; // 'LOW', 'MEDIUM', 'HIGH'
  /** 
   * Optional ref to the target element. If provided, the hook will use this ref 
   * instead of returning a new one. Useful when combining with other hooks 
   * or existing refs. Ensure the ref points to an HTMLElement or SVGElement.
   */
  elementRef?: React.RefObject<HTMLElement | SVGElement>;
  /** Whether to enable the global ambient tilt effect. Defaults to false. */
  enableAmbientTilt?: boolean;
  /** Specific configuration options for the ambient tilt effect if enabled. */
  ambientTiltOptions?: AmbientTiltOptions; // See useAmbientTilt hook docs
  // ... other advanced options (material, collisions, gravity, etc. - may be experimental)
}
```

### Interaction Types (`PhysicsInteractionType`)

*   **`spring` (Default):** Element moves towards the pointer position within the radius, driven by spring physics defined by `stiffness`/`dampingRatio` (or `animationConfig`). The distance moved is proportional to `strength` and capped by `maxDisplacement`.
*   **`magnetic` (v1.0.14+):** Element is attracted towards the pointer position. The attraction force increases as the pointer gets closer within the `radius`, scaled by `strength`. Target position is pulled towards the pointer.
*   **`repel` (v1.0.14+):** Element is repulsed away from the pointer position. The repulsion force increases as the pointer gets closer within the `radius`, scaled by `strength`. Target position is pushed away from the pointer.
*   *(Other types like `gravity`, `particle`, `follow`, `orbit`, etc., may exist but might be experimental or less defined)*.

### `PhysicsState`

```typescript
export interface PhysicsState {
  x: number; // Current x offset from spring
  y: number; // Current y offset from spring
  z: number; // Current z offset from spring
  relativeX: number; // Pointer X relative to center (-1 to 1)
  relativeY: number; // Pointer Y relative to center (-1 to 1)
  rotation: number; // Current Z rotation (degrees)
  scale: number; // Current scale factor
  active: boolean; // Is pointer interacting (within radius)?
  velocity: PhysicsVector; // Current spring velocity
  // ... other potential state values (acceleration, energy, etc.)
}
```

## How it Works

1.  **Event Listeners:** The hook attaches pointer event listeners (`pointermove`, `pointerleave`) to the target element (identified by the `ref`).
2.  **Pointer Tracking:** When the pointer moves over the element, it calculates the pointer's position relative to the element's center (`relativeX`, `relativeY`) and whether it's within the specified `radius`.
3.  **Target Calculation:** Based on the interaction `type`, `strength`, `radius`, and the pointer's relative position, it calculates a target offset (`targetX`, `targetY`, `targetZ`) for the internal physics model (a `SpringModel`).
    *   For `spring`, the target moves towards the pointer.
    *   For `magnetic`, the target is pulled towards the pointer.
    *   For `repel`, the target is pushed away from the pointer.
    *   When the pointer leaves or is outside the radius, the target resets to `{x: 0, y: 0, z: 0}`.
4.  **Physics Simulation:** The internal `SpringModel` updates its position on each animation frame (`requestAnimationFrame`), moving towards the calculated target based on the configured `stiffness`, `dampingRatio`, and `mass`.
5.  **Style Generation:** The hook reads the current position (`x`, `y`, `z`) from the `SpringModel`. If `affectsRotation`, `affectsScale`, or `affectsTilt` are true, it also calculates rotation/scale/tilt values based on the spring's position and the configured amplitudes.
6.  **Transform Application:** These position, rotation, scale, and tilt values are combined into a CSS `transform` string (e.g., `translateX(...) translateY(...) rotateZ(...) scale(...) rotateX(...) rotateY(...)`).
7.  **Return Values:** The `ref`, the calculated `style` object, and the current physics `state` are returned.

## Reduced Motion

The hook respects the user's system preference for reduced motion (`prefers-reduced-motion`) via the `useReducedMotion` hook. If reduced motion is enabled (or the `reducedMotion` option is forced true), the physics simulation is skipped, and the element remains static.

## Ambient Tilt Integration

This hook integrates with the `useAmbientTilt` hook to provide a subtle, global background tilt effect based on the cursor's position relative to the viewport (distinct from the direct interaction tilt defined by `affectsTilt`).

*   **Enable:** Set `enableAmbientTilt: true` in the options.
*   **Configure:** Pass configuration specific to the ambient tilt via the `ambientTiltOptions` object. Refer to the documentation for `useAmbientTilt` for available options (e.g., `maxTilt`, `perspective`, `smoothingFactor`).

The ambient tilt effect is applied independently and adds to any transforms generated by the main interaction physics.