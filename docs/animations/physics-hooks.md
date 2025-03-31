# Core Physics Animation Hooks

This document provides detailed documentation for the core physics-based animation hooks available in the Galileo Glass UI library. These hooks provide the foundation for creating dynamic, interactive, and natural-feeling animations.

## Import Options

You can import the physics hooks in two ways:

1. Through the main package (recommended):
```typescript
import { 
  useGalileoPhysicsEngine,
  usePhysicsInteraction,
  useGalileoStateSpring,
  useMultiSpring,
  type PhysicsBodyOptions,
  type Vector2D,
  type CollisionEvent
} from '@veerone/galileo-glass-ui';
```

2. Through the physics subpath (alternative):
```typescript
import { 
  useGalileoPhysicsEngine,
  usePhysicsInteraction,
  useGalileoStateSpring,
  useMultiSpring,
  type PhysicsBodyOptions,
  type Vector2D,
  type CollisionEvent
} from '@veerone/galileo-glass-ui/physics';
```

## Table of Contents

- [`useGalileoPhysicsEngine`](#usegalileophysicsengine) (v1.0.8+)
- [`usePhysicsInteraction`](#usephysicsinteraction)
- [`useGalileoStateSpring`](#usegalileostatespring)
- [`useMultiSpring`](#usemultispring)

---

## `useGalileoPhysicsEngine`

The `useGalileoPhysicsEngine` hook (introduced in v1.0.8) provides direct access to the Galileo physics engine for advanced use cases like custom game mechanics or complex physics visualizations.

### Purpose

- Create custom physics-based interactions and simulations
- Implement game mechanics or physics-based visualizations
- Build complex, multi-body physics systems

### Signature

```typescript
import { 
  useGalileoPhysicsEngine,
  type PhysicsBodyOptions,
  type Vector2D,
  type CollisionEvent
} from '@veerone/galileo-glass-ui';

function useGalileoPhysicsEngine(config?: EngineConfiguration): GalileoPhysicsEngineAPI;

interface EngineConfiguration {
  gravity?: Vector2D;           // Default: { x: 0, y: 9.81 }
  defaultDamping?: number;      // Default: 0.01
  timeScale?: number;           // Default: 1.0
  fixedTimeStep?: number;       // Default: 1/60
  maxSubSteps?: number;         // Default: 10
  velocitySleepThreshold?: number;  // Default: 0.05
  angularSleepThreshold?: number;   // Default: 0.05
  sleepTimeThreshold?: number;      // Default: 1000 (ms)
  enableSleeping?: boolean;         // Default: true
  integrationMethod?: 'euler' | 'verlet' | 'rk4';  // Default: 'verlet'
  boundsCheckEnabled?: boolean;     // Default: false
  bounds?: {
    min: Vector2D;
    max: Vector2D;
  };
}
```

### Example Usage

```tsx
import React, { useEffect } from 'react';
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui';

function PhysicsSimulation() {
  const engine = useGalileoPhysicsEngine({
    gravity: { x: 0, y: 9.81 },
    defaultDamping: 0.01
  });

  useEffect(() => {
    if (!engine) return;

    // Add a bouncing ball
    const ballId = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: 100, y: 0 },
      restitution: 0.7,
      friction: 0.1
    });

    // Add a static floor
    const floorId = engine.addBody({
      shape: { type: 'rectangle', width: 500, height: 20 },
      position: { x: 250, y: 400 },
      isStatic: true
    });

    // Listen for collisions
    const unsubscribe = engine.onCollisionStart((event) => {
      if (event.bodyAId === ballId || event.bodyBId === ballId) {
        console.log('Ball collision!');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [engine]);

  return <div>Physics simulation container</div>;
}
```

### Best Practices

- Use for advanced physics simulations where higher-level hooks like `usePhysicsInteraction` aren't sufficient
- Clean up collision subscriptions and bodies in useEffect cleanup functions
- Consider performance implications when adding many bodies or complex shapes
- Use `isStatic: true` for immovable objects like walls or floors
- Leverage the object sleeping system for better performance

For detailed API documentation, see the [Physics Engine API Guide](../physics/engine-api.md).

---

## `usePhysicsInteraction`

The `usePhysicsInteraction` hook applies realistic physics-based interactions to DOM elements, primarily responding to pointer events (hover, press). It allows elements to react with effects like springiness, magnetism, or subtle movements.

### Purpose

- Create engaging micro-interactions on buttons, cards, and other interactive elements.
- Provide physical feedback to user actions (e.g., a button compressing when pressed).
- Add subtle hover effects that draw attention without being distracting.

### Signature

```typescript
import { usePhysicsInteraction, PhysicsInteractionOptions, PhysicsState } from 'galileo-glass-ui';

function usePhysicsInteraction<T extends HTMLElement = HTMLElement>(
  options?: PhysicsInteractionOptions
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties;
  state: PhysicsState;
  eventHandlers: Record<string, (e: any) => void>;
  update: (newOptions: Partial<PhysicsInteractionOptions>) => void;
  reset: () => void;
  applyForce: (force: PhysicsVector) => void;
  applyImpulse: (impulse: PhysicsVector) => void;
  setPosition: (position: PhysicsVector) => void;
  isPaused: boolean;
  togglePause: () => void;
};
```

### Parameters

- **`options`** (`PhysicsInteractionOptions`, optional): An object to configure the physics behavior.
    - `type`: (`PhysicsInteractionType`, default: `'spring'`) The type of interaction (e.g., `'spring'`, `'magnetic'`).
    - `strength`: (`number`, 0-1) General strength multiplier.
    - `radius`: (`number`) Interaction radius (primarily for magnetic effects).
    - `mass`: (`number`) Affects inertia. Higher mass means slower reaction.
    - `stiffness`: (`number`) Spring stiffness (tension). Higher means faster, tighter spring.
    - `dampingRatio`: (`number`) Controls bounciness (1 = no bounce, <1 = bounce, >1 = slow return).
    - `easeFactor`: (`number`, 0-1) Smoothing for certain interaction types.
    - `maxDisplacement`: (`number`) Maximum distance the element can move.
    - `affectsRotation`: (`boolean`, default: `false`) If true, interaction affects element rotation.
    - `affectsScale`: (`boolean`, default: `true`) If true, interaction affects element scale.
    - `rotationAmplitude`: (`number`) Max rotation degrees if `affectsRotation` is true.
    - `scaleAmplitude`: (`number`) Max scale change (e.g., 0.1 for 10%) if `affectsScale` is true.
    - `gpuAccelerated`: (`boolean`, default: `true`) Uses `translate3d` and `will-change` for performance.
    - `animationConfig`: (`string | SpringConfig`) Overrides default spring settings. Can be a preset name (e.g., `'gentle'`, `'quick'`) or a `SpringConfig` object (`{ tension, friction, mass }`). Takes priority over `stiffness`, `dampingRatio`, `mass` if provided as an object.
        - **Note on Presets:** While standard spring presets like `'gentle'` can be used, the system might also support physics-specific presets (e.g., `'responsiveInteraction'`, `'bouncyButton'`) defined elsewhere or via context, which might tune multiple parameters (`strength`, `stiffness`, `damping`, etc.) for common interaction feels. Check `AnimationContext` or component examples for available interaction-specific presets.
    - `reducedMotion`: (`boolean`) Force reduced motion behavior. Defaults to system preference.
    - `motionSensitivityLevel`: (`MotionSensitivityLevel`, default: `MEDIUM`) Adjusts interaction intensity based on sensitivity ('LOW', 'MEDIUM', 'HIGH').
    - *(Other advanced options: see `PhysicsInteractionOptions` interface in source code)*

### Return Value

An object containing:
- `ref`: A React ref object to attach to the target DOM element.
- `style`: A style object containing calculated `transform` (and potentially other properties like `will-change`) to apply to the element.
- `state`: (`PhysicsState`) An object containing the current physics state (position, velocity, active status, etc.).
- `eventHandlers`: An object containing event handlers (`onPointerEnter`, `onPointerLeave`, `onPointerDown`, `onPointerUp`, etc.) to spread onto the target element.
- `update`: Function to update the hook's options dynamically.
- `reset`: Function to reset the element's physics state to its origin.
- `applyForce`: Function to apply a continuous force.
- `applyImpulse`: Function to apply an instantaneous force (like a push).
- `setPosition`: Function to directly set the physics position.
- `isPaused`: Boolean indicating if the physics simulation is paused.
- `togglePause`: Function to pause/resume the simulation.

### Example Usage

```tsx
import React from 'react';
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui';
import { Button } from '../components/Button'; // Example component

const PhysicsButton = () => {
  const { ref, style, eventHandlers } = usePhysicsInteraction<HTMLButtonElement>({
    // Use a gentle spring effect on hover/press
    animationConfig: 'gentle', 
    affectsScale: true,
    scaleAmplitude: 0.05, // Slight scale down on press
    affectsRotation: false,
  });

  return (
    <Button 
      ref={ref} 
      style={style}
      {...eventHandlers}
    >
      Click me!
    </Button>
  );
};
```

### Best Practices

- Apply to interactive elements like buttons, cards, list items for engaging feedback.
- Use subtle effects for hover states (`scaleAmplitude`, `rotationAmplitude` should be small).
- Combine with `useAnimationContext` to ensure consistency with theme defaults.
- Test performance, especially if applying to many elements simultaneously. Consider disabling `gpuAccelerated` if causing issues, though it usually helps.
- Respect `reducedMotion` preferences by default.

---

## `useGalileoStateSpring`

This hook animates a single numerical value towards a target using spring physics. It's ideal for animating properties like opacity, color components, or simple translations based on component state changes.

### Purpose

- Animate simple state-driven numerical changes smoothly (e.g., fading in/out, sliding).
- Create physics-based transitions for single properties.
- Serve as a building block for more complex animations.

### Signature

```typescript
import { useGalileoStateSpring, GalileoStateSpringOptions, GalileoSpringResult } from 'galileo-glass-ui';

function useGalileoStateSpring(
  targetValue: number,
  options?: GalileoStateSpringOptions
): GalileoSpringResult;

interface GalileoStateSpringOptions extends Partial<SpringConfig> {
  onRest?: (result: { finished: boolean; value: number }) => void;
  immediate?: boolean; 
  animationConfig?: string | Partial<SpringConfig>; // Preset name or config object
}

interface GalileoSpringResult {
  value: number; // The current animated value
  isAnimating: boolean;
  start: (options?: { to?: number; from?: number; velocity?: number }) => void;
  stop: () => void;
  reset: (resetValue?: number, resetVelocity?: number) => void;
}
```

### Parameters

- **`targetValue`** (`number`): The target numerical value the spring should animate towards.
- **`options`** (`GalileoStateSpringOptions`, optional): Configuration object.
    - `tension`, `friction`, `mass`: Direct physics parameters.
    - `restThreshold`, `precision`: Control when the spring is considered "at rest".
    - `onRest`: Callback function executed when the animation comes to rest. Receives an object with `finished` (boolean) and final `value`.
    - `immediate`: (`boolean`) If `true`, skips animation and jumps directly to the `targetValue`. Defaults to respecting `useReducedMotion`.
    - `animationConfig`: (`string | Partial<SpringConfig>`) Overrides default spring settings. Can be a preset name (e.g., `'quick'`) or a `SpringConfig` object (`{ tension, friction, mass }`). Takes priority over direct `tension`, `friction`, `mass` props.

### Return Value

An object (`GalileoSpringResult`) containing:
- `value`: The current animated numerical value. Use this in styles or component logic.
- `isAnimating`: Boolean indicating if the spring is currently moving.
- `start`: Imperative function to start or retarget the animation. Can optionally define `to`, `from`, and initial `velocity`.
- `stop`: Imperative function to stop the animation immediately.
- `reset`: Imperative function to reset the spring to a specific value (defaults to the initial `targetValue`).

### Example Usage

```tsx
import React, { useState } from 'react';
import { useGalileoStateSpring } from 'galileo-glass-ui';
import { Box } from '@mui/material'; // Example layout component

const FadingBox = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Animate opacity between 0 and 1 based on isVisible state
  const { value: opacity } = useGalileoStateSpring(isVisible ? 1 : 0, {
    animationConfig: 'gentle', // Use a gentle fade
  });

  return (
    <>
      <button onClick={() => setIsVisible(v => !v)}>
        Toggle Box
      </button>
      <Box
        sx={{
          width: 100,
          height: 100,
          backgroundColor: 'primary.main',
          opacity: opacity, // Apply the animated value
          // Apply will-change for performance if opacity changes often
          willChange: opacity > 0 && opacity < 1 ? 'opacity' : 'auto', 
        }}
      />
    </>
  );
};
```

### Best Practices

- Ideal for animating single, non-transform properties like `opacity`, `backgroundColor` (individual channels), `height`, `width`.
- For animating multiple properties together (like `x`, `y`, `scale`), use `useMultiSpring`.
- Leverage `animationConfig` presets for consistency.
- Use the `onRest` callback for triggering actions after an animation completes.
- Consider adding `will-change` to the animated property if performance is critical.

---

## `useMultiSpring`

This hook manages multiple spring animations simultaneously, animating a vector (an object of numerical values) towards a target vector. It's perfect for animating properties that often change together, like position (`x`, `y`), scale (`scaleX`, `scaleY`), or color (`r`, `g`, `b`).

### Purpose

- Animate multiple related numerical values using coordinated spring physics.
- Create complex transitions involving position, scale, rotation, etc.
- Drive `transform` properties efficiently.

### Signature

```typescript
import { useMultiSpring, MultiSpringOptions, MultiSpringResult } from 'galileo-glass-ui';

// T must be an object where all values are numbers (e.g., { x: number, y: number })
function useMultiSpring<T extends Record<string, number>>(
  options: MultiSpringOptions<T>
): MultiSpringResult<T>;

interface MultiSpringOptions<T> {
  from: T; // Initial values
  to?: T; // Target values (optional, can be set via start())
  animationConfig?: string | Partial<SpringConfig>; // Preset name or config object
  velocity?: Partial<T>; // Initial velocities for each property
  immediate?: boolean; // Skip animation if true
  autoStart?: boolean; // Automatically start animation when 'to' changes (default: true)
}

interface MultiSpringResult<T> {
  values: T; // Object containing the current animated values
  isAnimating: boolean;
  start: (target: { to?: T; from?: T; velocity?: Partial<T> }) => void;
  stop: () => void;
  reset: (values?: T) => void; // Reset to specific values or 'from' values
  updateConfig: (config: string | Partial<SpringConfig>) => void;
}
```

### Parameters

- **`options`** (`MultiSpringOptions<T>`): Configuration object.
    - `from`: (`T`) An object representing the initial state (e.g., `{ x: 0, y: 0, scale: 1 }`). **Required**.
    - `to`: (`T`, optional) An object representing the target state. If provided and `autoStart` is true, the animation begins immediately.
    - `animationConfig`: (`string | Partial<SpringConfig>`) Spring configuration preset name or object. Applied to all springs in the vector.
    - `velocity`: (`Partial<T>`, optional) Initial velocities for specific properties (e.g., `{ x: 100 }`).
    - `immediate`: (`boolean`) If `true`, skips animation. Defaults to respecting `useReducedMotion`.
    - `autoStart`: (`boolean`, default: `true`) If `true`, the animation starts automatically whenever the `to` prop changes. If `false`, you must call `start()` manually.

### Return Value

An object (`MultiSpringResult<T>`) containing:
- `values`: An object (`T`) holding the current animated values for each property defined in `from`.
- `isAnimating`: Boolean indicating if any spring in the vector is currently moving.
- `start`: Imperative function to start or retarget the animation. The argument should be an object, typically with a `to` property defining the new target state (e.g., `start({ to: { x: 100, y: 50 } })`). Can also set `from` and `velocity`.
- `stop`: Imperative function to stop all springs immediately.
- `reset`: Imperative function to reset all springs to a specific state (defaults to the initial `from` state).
- `updateConfig`: Function to dynamically update the spring configuration for all springs.

### Example Usage

```tsx
import React, { useState } from 'react';
import { useMultiSpring } from 'galileo-glass-ui';
import { Box } from '@mui/material';

const MovingBox = () => {
  const [isToggled, setIsToggled] = useState(false);

  const { values } = useMultiSpring({
    from: { x: 0, y: 0, scale: 1, opacity: 0 },
    to: isToggled 
      ? { x: 150, y: 50, scale: 1.2, opacity: 1 } 
      : { x: 0, y: 0, scale: 1, opacity: 0 },
    animationConfig: 'wobbly', // Use a wobbly preset
    autoStart: true, // Automatically animate when 'to' changes
  });

  // Construct transform from animated values
  const transform = `translate(${values.x}px, ${values.y}px) scale(${values.scale})`;

  return (
    <>
      <button onClick={() => setIsToggled(v => !v)}>
        Toggle Position & Scale
      </button>
      <Box
        sx={{
          width: 80,
          height: 80,
          backgroundColor: 'secondary.main',
          borderRadius: '8px',
          opacity: values.opacity,
          transform: transform,
          willChange: 'transform, opacity', // Optimize for performance
        }}
      />
    </>
  );
};
```

### Best Practices

- Use `useMultiSpring` for animating `transform` properties (`translate`, `scale`, `rotate`) or any set of related numerical values.
- Define all potentially animated properties in the `from` object, even if their initial value is `0`.
- Leverage `autoStart: true` (default) for animations driven by state changes reflected in the `to` prop.
- Use `autoStart: false` and the imperative `start()` function for event-driven animations (e.g., starting an animation on button click).
- Ensure `will-change: transform` (or relevant properties) is applied for smoother performance during animation.
- Group related transformations (e.g., `x`, `y` for position) together in the state object for clarity. 