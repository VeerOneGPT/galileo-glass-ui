# Particle System

Galileo Glass UI includes a particle system for creating dynamic visual effects like sparks, dust, confetti, or ambient atmospheric elements. This system allows for generating and animating numerous small particles based on configurable parameters.

## Core Concepts

- **Emitters:** Points or areas from which particles are generated.
- **Particles:** Individual elements with properties like position, velocity, lifespan, size, color, opacity.
- **Forces:** Influences acting on particles (e.g., gravity, wind, attraction/repulsion).
- **Rendering:** Efficiently drawing potentially thousands of particles (often using Canvas or WebGL).
- **Presets:** Pre-configured templates for common effects (e.g., 'fireworks', 'snow', 'magic dust').

## `useParticleSystem` Hook (Conceptual)

This hook likely manages the creation, simulation, and rendering of a particle effect within a container element.

### Purpose

- Simplify the integration of particle effects into React components.
- Handle the physics simulation for particle movement.
- Manage the rendering loop for displaying particles.
- Provide controls for starting, stopping, and modifying the effect.

### Signature (Conceptual)

```typescript
import { useParticleSystem, ParticleSystemOptions } from 'galileo-glass-ui';

function useParticleSystem(
  options: ParticleSystemOptions | string // Options object or preset name
): {
  containerRef: React.RefObject<HTMLElement>; // Attach to the container element
  // Controls:
  start: () => void;
  stop: () => void;
  pause: () => void;
  updateOptions: (newOptions: Partial<ParticleSystemOptions>) => void;
  emitParticles: (count: number, position?: { x: number; y: number }) => void;
  // State:
  isActive: boolean;
  particleCount: number;
};

interface ParticleSystemOptions {
  preset?: string; // Use a pre-defined effect template
  // Emitter Configuration
  emitterPosition?: { x: number; y: number } | 'center' | 'top' | 'random';
  emitterShape?: 'point' | 'circle' | 'rectangle';
  emissionRate?: number; // Particles per second
  burst?: { count: number; time: number }; // Emit a burst of particles
  maxParticles?: number;
  // Particle Properties
  lifespan?: { min: number; max: number }; // Seconds
  initialVelocity?: { x: [number, number]; y: [number, number] }; // Range [min, max]
  initialRotation?: [number, number];
  initialScale?: [number, number];
  sizeOverLife?: [number, number]; // Scale factor at start and end of life
  colorOverLife?: [string[], string[]]; // Array of colors for start/end
  opacityOverLife?: [number, number];
  // Physics / Forces
  gravity?: { x: number; y: number };
  friction?: number;
  wind?: { x: number; y: number };
  attractors?: { x: number; y: number; strength: number; radius: number }[];
  // Rendering
  particleImage?: string; // URL for custom particle texture
  blendMode?: string; // CSS blend mode (e.g., 'screen', 'add')
  renderer?: 'canvas' | 'webgl'; // Underlying render tech
  // ... other advanced options
}
```

### Return Value

- `containerRef`: Ref to attach to the element where particles should be rendered.
- `start`, `stop`, `pause`, `updateOptions`, `emitParticles`: Control functions.
- `isActive`, `particleCount`: State variables.

### Basic Usage

```tsx
import React, { useEffect } from 'react';
import { useParticleSystem } from 'galileo-glass-ui';
import { Box } from '@mui/material';

function InteractiveParticles() {
  const { containerRef, emitParticles } = useParticleSystem({
    preset: 'magicDust', // Use a predefined preset
    emissionRate: 0, // Don't emit automatically
    maxParticles: 200,
  });

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    emitParticles(30, { x, y }); // Emit a burst of 30 particles at click position
  };

  return (
    <Box
      ref={containerRef} // Particles render inside this box
      onClick={handleClick}
      sx={{
        width: '100%',
        height: 300,
        border: '1px solid grey',
        position: 'relative', // Important for positioning particles
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      Click Me!
    </Box>
  );
}
```

## Presets

The system likely includes pre-configured presets for common effects, simplifying usage. Examples mentioned in `animate2.md` might include:

- Fireworks
- Snow
- Rain
- Magic Dust
- Confetti
- Fire
- Smoke

Using a preset name (e.g., `useParticleSystem('snow')`) would apply its specific configuration.

## Performance Considerations

- Particle systems can be computationally intensive.
- The number of particles (`maxParticles`, `emissionRate`) significantly impacts performance.
- Using WebGL renderer (if available) is generally faster than Canvas for large numbers of particles.
- Limit complex physics (like many attractors or collisions) if performance suffers.
- Ensure the system pauses or stops when the component unmounts or is hidden.

## Use Cases

- **Feedback:** Bursts on button clicks or successful actions (confetti).
- **Ambiance:** Gentle background effects (snow, dust motes, stars).
- **Visual Effects:** Simulate fire, smoke, explosions, or magic spells.
- **Game Effects:** Enhance events in game-like interfaces.

*(Confirm specific presets, options, and rendering details via source code or Storybook examples.)* 