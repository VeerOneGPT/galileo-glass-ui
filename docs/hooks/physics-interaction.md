# usePhysicsInteraction Hook

**Status:** Core Hook

## Overview

The `usePhysicsInteraction` hook applies physics-based interactive effects (like springy movement, attraction, repulsion) to DOM elements in response to pointer (mouse/touch) events. It provides a simple way to add delightful micro-interactions without needing to manage the physics simulation directly.

## Import

```typescript
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
  // Valid Preset Names: 'DEFAULT', 'GENTLE', 'WOBBLY', 'STIFF', 'SLOW', 'MASSIVE', 'RESPONSIVE', 'SNAPPY', 'BOUNCY', 'HEAVY', 'REDUCED_MOTION', 'HOVER_QUICK', 'FOCUS_HIGHLIGHT', 'PRESS_FEEDBACK', 'MODAL_TRANSITION', 'MENU_POPOVER', 'NOTIFICATION_SLIDE'
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
  /** 
   * Bounds for constraining the physics effect. 
   * Requires an object with coordinate values: { top, left, right, bottom }.
   * **Note:** Do not pass a React Ref directly. Calculate bounds from the ref first.
   */
  bounds?: { top?: number; right?: number; bottom?: number; left?: number; zNear?: number; zFar?: number };
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

## Configuration (`PhysicsInteractionOptions`)

The hook accepts a configuration object with the following properties:

### Core Physics Control

There are three ways to control the fundamental spring physics:

1.  **`animationConfig` (Preset String):** The simplest way. Assign a preset name string. Requires importing `SpringPresetName` for type safety.
    ```typescript
    import { SpringPresetName } from '@veerone/galileo-glass-ui';
    // ...
    animationConfig: 'BOUNCY' as SpringPresetName
    ```
2.  **`animationConfig` (SpringConfig Object):** Provide a standard `SpringConfig` object.
    ```typescript
    animationConfig: { tension: 200, friction: 18, mass: 1 }
    ```
3.  **Direct Properties:** Set `stiffness`, `dampingRatio`, and `mass` directly. **These will override any values derived from `animationConfig`**. 
    ```typescript
    stiffness: 500,
    dampingRatio: 0.5,
    mass: 2,
    ```

*   **`stiffness`?**: `number` - Spring stiffness (tension). Higher = faster response. Overrides `animationConfig`. Default derived from `animationConfig` or `SpringPresets.DEFAULT`.
*   **`dampingRatio`?**: `number` - Damping ratio (0-2). 1 = critical damping (no bounce), <1 = underdamped (bounce), >1 = overdamped (slow settle). Overrides `animationConfig`. Default derived from `animationConfig` or `~0.6`.
*   **`mass`?**: `number` - Mass of the object. Higher = more inertia. Overrides `animationConfig`. Default derived from `animationConfig` or `1`.

### Interaction Behavior

*   **`type`?**: `PhysicsInteractionType` - Type of physics simulation (e.g., `'spring'`, `'magnetic'`, `'follow'`). Default: `'spring'`.
*   **`strength`?**: `number` (0-1) - Strength factor for some interaction types.
*   **`radius`?**: `number` (px) - Activation radius for interactions like `'magnetic'`.
*   **`maxDisplacement`?**: `number` (px) - Maximum distance the element can move from its origin due to the interaction. Default: `10`.
*   **`easeFactor`?**: `number` (0-1) - Smoothing factor for certain types like `'follow'`. Lower = smoother.
*   **`bounds`?**: `{ top?: number; right?: number; bottom?: number; left?: number; zNear?: number; zFar?: number }` - Constrains the physics movement relative to the element's origin. `top`/`left` are typically negative, `bottom`/`right` positive. See examples above.
*   **`velocityDecay`?**: `number` (0-1) - Factor by which velocity decays each frame. Higher = faster decay.

### Affected Transforms

*   **`affectsScale`?**: `boolean` - If true, interaction affects element scale. Default: `false`.
*   **`scaleAmplitude`?**: `number` - Maximum scale change factor (e.g., 0.1 means scale between 0.9 and 1.1). Default: `0.05`.
*   **`affectsRotation`?**: `boolean` - If true, interaction affects Z-axis rotation. Default: `false`.
*   **`rotationAmplitude`?**: `number` (degrees) - Maximum rotation angle. Default: `10`.
*   **`affectsTilt`?**: `boolean` - If true, interaction affects 3D tilt (rotateX/Y). Requires parent `perspective`. Default: `false`.
*   **`tiltAmplitude`?**: `number` (degrees) - Maximum tilt angle. Default: `15`.
*   **`enable3D`?**: `boolean` - Enables 3D physics calculations (affects Z position). Default: `false`.
*   **`depthRange`?**: `number` (px) - Maximum Z-depth movement if `enable3D` is true.

### Performance & Accessibility

*   **`gpuAccelerated`?**: `boolean` - Hints to use GPU acceleration (`transform: translateZ(0)`). Default: `true` (usually).
*   **`smooth`?**: `boolean` - Applies a CSS transition for smoother settling (can conflict with pure physics). Default: `false`.
*   **`smoothingDuration`?**: `number` (ms) - Duration for the CSS transition if `smooth` is true.
*   **`reducedMotion`?**: `boolean` - Force reduced motion behavior, overriding system/context settings.
*   **`motionSensitivityLevel`?**: `MotionSensitivityLevel` (`'LOW'`, `'MEDIUM'`, `'HIGH'`) - Adjusts the intensity of effects like scale/rotation/tilt based on sensitivity. Default: `'MEDIUM'`.
*   **`calculationQuality`?**: `PhysicsQuality` (`'low'`-'`ultra'`) - Precision of internal calculations.
*   **`updateRate`?**: `number` (calls/sec) - How often the physics simulation updates.
*   **`timeScale`?**: `number` - Speed up (>1) or slow down (<1) the simulation.
*   **`pauseWhenInvisible`?**: `boolean` - Pause physics simulation if the element is off-screen.

### Advanced & Experimental

*   **`material`?**: `PhysicsMaterial` (`{ density?, restitution?, friction?, drag? }`) - Properties for advanced physics calculations.
*   **`collisionShape`?**: `CollisionShape` (`'circle'`, `'rectangle'`, etc.) - Shape for collision detection.
*   **`affectedByGlobalForces`?**: `boolean` - Allow interaction with global forces like simulated wind.
*   **`externalForce`?**: `PhysicsVector` (`{ x, y, z? }`) - Apply a continuous external force.
*   **`gravity`?**: `PhysicsVector & { strength? }` - Apply gravitational force.
*   **`highPrecision`?**: `boolean` - Use higher precision math for calculations.
*   **`autoOptimize`?**: `boolean` - Enable automatic performance optimizations.
*   **`enableCollisions`?**: `boolean` - Enable collision detection (experimental).
*   **`attractorPosition`?**: `PhysicsVector` - Position for single attractor types.
*   **`attractors`?**: `Array<{ position: PhysicsVector, strength: number, radius: number }>` - Multiple attractors.
*   **`easingFunction`?**: `(t: number) => number` - Custom easing curve for interpolation.
*   **`useAirResistance`?**: `boolean` - Simulate air resistance.
*   **`elementRef`?**: `React.RefObject<HTMLElement | SVGElement | null>` - Explicitly provide the element ref if not using the returned `ref`.
*   **`enableAmbientTilt`?**: `boolean` - Enable the global ambient tilt effect. Requires `useAmbientTilt` hook context. Default: `false`.
*   **`ambientTiltOptions`?**: `AmbientTiltOptions` - Configuration for the ambient tilt effect. See `useAmbientTilt` hook.

## Return Value

The hook returns an object with the following properties:

*   **`ref`**: `React.RefObject<T>` - A React ref object. Attach this to the DOM element you want to apply the physics interaction to.
*   **`style`**: `React.CSSProperties` - An object containing the necessary CSS `transform` styles based on the physics state. Apply this to the element's `style` prop.
*   **`state`**: `PhysicsState` - An object containing the current state of the physics simulation (position offsets `x`, `y`, `z`, relative pointer positions `relativeX`, `relativeY`, `rotation`, `scale`, `active` status, `velocity`, etc.).
*   **`update`**: `(newOptions: Partial<PhysicsInteractionOptions>) => void` - Function to update the hook's configuration options dynamically.
*   **`reset`**: `() => void` - Function to reset the physics state back to its origin (0, 0, 0) and stop any motion.
*   **`applyForce`**: `(force: PhysicsVector) => void` - Apply a continuous force to the object.
*   **`applyImpulse`**: `(impulse: PhysicsVector) => void` - Apply a sudden impulse (change in velocity) to the object.
*   **`setPosition`**: `(position: PhysicsVector) => void` - Instantly set the physics object's position (relative to origin).
*   **`isPaused`**: `boolean` - Indicates if the physics simulation is currently paused.
*   **`togglePause`**: `() => void` - Function to pause or resume the physics simulation.

## Notes

*   For tilt effects (`affectsTilt: true`), ensure a parent element has the `perspective` CSS property set (e.g., `perspective: 800px;`).
*   The `smooth` option adds a CSS transition, which might feel different from pure spring physics and could potentially conflict if durations are mismatched.
*   Performance can be impacted by complex options like high `updateRate`, `enableCollisions`, or many `attractors`.
*   The hook automatically handles reduced motion preferences unless overridden by the `reducedMotion` option.