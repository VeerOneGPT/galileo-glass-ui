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
import { usePhysicsInteraction } from '@galileo_glass/core';
import { Box } from '@mui/material'; // Or any element

function InteractiveElement() {
  const { ref, style } = usePhysicsInteraction<HTMLDivElement>({
    // Using default spring physics
    maxDisplacement: 15, // How far it moves (pixels)
    affectsTilt: true, // Enable tilt effect
    tiltAmplitude: 10, // Tilt amount (degrees)
    stiffness: 150,
    dampingRatio: 0.6,
    mass: 1,
  });

  return (
    <Box 
      ref={ref} 
      style={style} 
      sx={{ 
        width: 150, 
        height: 150, 
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', 
        borderRadius: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white', 
        fontSize: '1.2em',
        cursor: 'pointer' 
      }}
    >
      Interact Me!
    </Box>
  );
}
```

## Options (`PhysicsInteractionOptions`)

This hook offers a wide range of options. Key ones include:

-   `type` (`PhysicsInteractionType`, optional): Defines the core physics behavior (e.g., 'spring', 'magnetic'). Defaults usually imply a spring model.
-   `strength` (number, optional): General strength factor (0-1).
-   `radius` (number, optional): Interaction radius in pixels.
-   `mass`, `stiffness`, `dampingRatio`: Parameters for the internal spring model controlling movement feel.
-   `easeFactor` (number, optional): Smoothing factor (0-1).
-   `maxDisplacement` (number, optional): Maximum translation distance in pixels.
-   `affectsRotation`, `rotationAmplitude`: Enable/control Z-axis rotation.
-   `affectsScale`, `scaleAmplitude`: Enable/control scaling.
-   `affectsTilt`, `tiltAmplitude`: Enable/control 3D tilt (requires parent perspective).
-   `gpuAccelerated` (boolean, optional): Hint to optimize for GPU (uses `translateZ(0)`).
-   `reducedMotion` (boolean, optional): Force reduced motion state.
-   `animationConfig` (string | SpringConfig, optional): Use animation presets or custom config for the spring.
-   `motionSensitivityLevel` (MotionSensitivityLevel, optional): Overrides context sensitivity. Adjusts physics parameters (e.g., displacement, amplitude) when reduced motion is active.
-   `category` (AnimationCategory, optional): Semantic category for the animation.
-   `elementRef` (RefObject, optional): *Alternative* to the returned `ref`. If provided, the hook attaches listeners to this ref instead of its internal one.
-   `enableAmbientTilt`, `ambientTiltOptions`: Integrates with `useAmbientTilt` for a combined effect.
-   *(Many others exist for advanced physics simulation, bounds, collisions, forces - see `PhysicsInteractionOptions` type definition)*

## Return Value

The hook returns an object with:

-   `ref` (RefObject<T>): Attach this ref to the target element.
-   `style` (React.CSSProperties): Style object with calculated `transform`. Apply this to the target element.
-   `state` (PhysicsState): An object containing the current physics state (position, velocity, relative pointer position, active status, etc.). Useful for debugging or complex coordination.
-   `update` ((newOptions: Partial<PhysicsInteractionOptions>) => void): Function to update the hook's options dynamically.
-   `reset` (() => void): Function to reset the element's position and physics state to the origin.
-   `applyForce`, `applyImpulse`, `setPosition`: *Placeholder functions for future physics engine integration.* Currently have limited effect.
-   `isPaused`, `togglePause`: *Placeholder functions for future physics engine integration.*

## Accessibility

-   Respects `prefers-reduced-motion` by disabling the physics simulation and returning an empty style object.
-   The degree of motion reduction (when enabled) can be tuned via `motionSensitivityLevel`, affecting parameters like `maxDisplacement` and tilt/scale/rotation amplitudes. 

## Recent Fixes (v1.0.22)

*   **Magnetic Type Fix:** Resolved an issue (Bug #19) where the `magnetic` interaction type was not functioning correctly. Now, when `type: 'magnetic'` is used:
    *   A positive `strength` value correctly causes the element to attract towards the pointer within the interaction `radius`.
    *   A negative `strength` value correctly causes the element to repel the pointer.
    *   The standard physics parameters (`stiffness`, `dampingRatio`, `mass`) apply to the magnetic movement. 