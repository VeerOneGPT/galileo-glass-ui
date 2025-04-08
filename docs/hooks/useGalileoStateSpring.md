# useGalileoStateSpring Hook

Animates a single numerical value towards a target using Galileo's spring physics implementation. It's designed to be a replacement or alternative to libraries like `react-spring` for simpler state animations, respecting accessibility settings.

## Import

```jsx
import { useGalileoStateSpring } from '@galileo_glass/core';
// Or path: import { useGalileoStateSpring } from '../hooks/useGalileoStateSpring';
```

## Usage

```jsx
import React, { useState } from 'react';
import { useGalileoStateSpring } from '@galileo_glass/core';

function AnimatedComponent() {
  const [targetValue, setTargetValue] = useState(0);
  const { value, isAnimating, start, stop, reset } = useGalileoStateSpring(targetValue, {
    tension: 170, 
    friction: 26,
    onRest: (result) => console.log('Animation ended:', result),
  });

  return (
    <div>
      <div 
        style={{
          width: '100px',
          height: '100px',
          background: 'blue',
          transform: `translateX(${value}px)`,
        }}
      />
      <p>Current Value: {value.toFixed(2)}</p>
      <p>Is Animating: {isAnimating ? 'Yes' : 'No'}</p>
      <button onClick={() => setTargetValue(prev => prev + 100)}>Move Right</button>
      <button onClick={() => setTargetValue(0)}>Reset Position</button>
      <button onClick={() => start({ to: 50, velocity: 500 })}>Start Imperative</button>
      <button onClick={stop}>Stop</button>
      <button onClick={() => reset(-100)}>Reset Imperative</button>
    </div>
  );
}
```

## Parameters

-   `targetValue` (number): The target numerical value the spring should animate towards.
-   `options` (GalileoStateSpringOptions, optional): An object containing configuration options:
    -   `tension`, `friction`, `mass`, `restThreshold`, `precision`: Direct spring physics parameters (see `SpringPhysics` class). These override `animationConfig` if provided.
    -   `animationConfig` (string | SpringConfig, optional): A preset name (e.g., `'DEFAULT'`, `'GENTLE'`) or a custom `SpringConfig` object. Defaults are taken from `AnimationContext` if available.
    -   `immediate` (boolean, optional): If `true`, skips the animation and jumps directly to the `targetValue`. Overrides `prefers-reduced-motion`.
    -   `onRest` ((result: SpringAnimationResult) => void, optional): Callback function triggered when the spring settles at its target value or is stopped.
    -   `motionSensitivityLevel` (MotionSensitivityLevel, optional): Overrides the sensitivity level from `AnimationContext`. Affects how physics parameters are adjusted when `prefers-reduced-motion` is active. See `MotionSensitivityLevel` enum.
    -   `category` (AnimationCategory, optional): Categorizes the animation's purpose (e.g., `FEEDBACK`, `TRANSITION`). Currently used primarily for context/debugging, but may influence behavior more directly in the future. See `AnimationCategory` enum.

## Return Value

The hook returns an object (`GalileoSpringResult`) with the following properties:

-   `value` (number): The current animated value of the spring.
-   `isAnimating` (boolean): `true` if the spring is currently in motion, `false` otherwise.
-   `start` ((options?: SpringStartOptions) => void): Function to imperatively start or update the animation. 
    -   `options`: 
        -   `to` (number): The target value to animate towards.
        -   `from` (number): The value to start the animation from (defaults to the current value).
        -   `velocity` (number): The initial velocity for the animation.
-   `stop` (() => void): Function to immediately stop the animation at its current value.
-   `reset` ((resetValue?: number, resetVelocity?: number) => void): Function to stop the animation and reset the spring to a specific value (defaults to the initial `targetValue` the hook was mounted with) and velocity (defaults to 0).

## Accessibility

-   The hook automatically respects the user's `prefers-reduced-motion` setting by default. If reduced motion is preferred, the animation behaves as if `immediate: true` was set, unless `immediate: false` is explicitly passed in the options.
-   When reduced motion is active, the physics parameters can be further adjusted based on the `motionSensitivityLevel` (provided directly or from `AnimationContext`), allowing for nuanced control over the reduced animation (e.g., slightly less bouncy vs. completely static). 