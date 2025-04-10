# Particle System

Galileo Glass UI includes a particle system for creating dynamic visual effects like sparks, dust, confetti, or ambient atmospheric elements. This system allows for generating and animating numerous small particles based on configurable parameters.

## Core Concepts

- **Emitters:** Points or areas from which particles are generated (Implemented: point, line, circle, rectangle).
- **Particles:** Individual elements with properties like position, velocity, lifespan, size, color, opacity (Implemented).
- **Forces:** Influences acting on particles (Implemented: gravity, friction, wind, attractors, repulsors).
- **Rendering:** Efficiently drawing potentially thousands of particles (Implemented: Canvas. WebGL TODO).
- **Presets:** Pre-configured templates for common effects (Implemented: default, snow, fireworks. Others TODO).

## `useParticleSystem` Hook

This hook manages the creation, simulation, and rendering of a particle effect within a container element.

### Purpose

- Simplify the integration of particle effects into React components.
- Handle the physics simulation for particle movement.
- Manage the rendering loop for displaying particles.
- Provide controls for starting, stopping, pausing, and modifying the effect.

### Signature

```typescript
import {
  useParticleSystem, 
  ParticleSystemOptions, 
  ParticleSystemResult,
  ParticlePresetCollection
} from 'galileo-glass-ui'; // Adjust import path as needed

// Example Presets (replace with actual import if available)
const particlePresets: ParticlePresetCollection = { /* ... */ }; 

function MyComponent() {
  const particleSystem: ParticleSystemResult = useParticleSystem(
    'snow', // Preset name or ParticleSystemOptions object
    particlePresets // Optional: Provide custom/additional presets
  );

  // Destructure the result:
  const {
    containerRef, // Attach this ref to your container element
  // Controls:
    start,
    stop,
    pause,
    updateOptions,
    emitParticles, // (count: number, position?: Vector2D | 'center' | 'random') => void
    clearParticles,
  // State:
    isActive,      // boolean: Is the animation loop running?
    particleCount, // number: Current number of active particles
  } = particleSystem;

  // ... use ref, controls, and state ...
}

// Options type structure (defined in types/particles.ts)
// export type ParticleSystemOptions = string | { /* ... detailed options ... */ };
```

### Return Value

- `containerRef`: Ref to attach to the element where particles should be rendered.
- `start`, `stop`, `pause`, `updateOptions`, `emitParticles`, `clearParticles`: Control functions.
- `isActive`, `particleCount`: State variables.

### Basic Usage

```tsx
import React, { useEffect } from 'react';
import { useParticleSystem } from 'galileo-glass-ui'; // Adjust import path
import { GlassBox } from 'galileo-glass-ui/components'; // Adjust import path
import { particlePresets } from 'galileo-glass-ui/animations/particles'; // Adjust import path

function InteractiveParticles() {
  // Use the 'fireworks' preset, but disable automatic emission
  const { containerRef, emitParticles } = useParticleSystem({
    preset: 'fireworks', 
    emitter: { emissionRate: 0 }, // Override preset to stop auto-emission
    // Optionally override other fireworks properties here
  }, particlePresets);

  const handleClick = (event: React.MouseEvent) => {
    if (!containerRef.current) return; 
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Emit a burst of particles at the click position (use count from preset or default)
    emitParticles(100, { x, y }); 
  };

  return (
    <GlassBox
      ref={containerRef as React.Ref<HTMLDivElement>} // Attach ref (cast if needed)
      onClick={handleClick}
      style={{
        width: '100%',
        height: 300,
        border: '1px solid grey',
        position: 'relative', // Important for positioning canvas
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e', // Dark background
        color: 'white'
      }}
    >
      Click Me for Fireworks!
    </GlassBox>
  );
}
```

## Presets

The system includes pre-configured presets for common effects, simplifying usage. Currently implemented:

- `default`: Basic slow-moving white dots.
- `snow`: Simulates falling snow with wind.
- `fireworks`: Creates an exploding burst effect (best triggered manually with `emitParticles`).

*(TODO: Implement rain, magicDust, confetti, fire, smoke presets)*

Using a preset name (e.g., `useParticleSystem('snow')`) applies its specific configuration.

## Performance & Accessibility

### Quality Tiers

The particle system integrates with the Galileo Glass UI's quality tier system to automatically adjust performance based on device capabilities. It determines the active quality tier, likely by consuming the `activeQualityTier` value from `useAnimationContext`, which itself is determined by the `AnimationProvider` (using `useAdaptiveQuality` internally or a forced value).

```typescript
import { QualityTier } from 'galileo-glass-ui';
import { AnimationProvider } from 'galileo-glass-ui';

function App() {
  return (
    <AnimationProvider forceQualityTier={QualityTier.HIGH}> // Optional: Force a tier
      {/* Your components using particle system */}
    </AnimationProvider>
  );
}
```

The detected `activeQualityTier` affects particle systems in the following ways:

- **LOW**: Reduces maximum particles (e.g., to ~150), lowers emission rate, limits velocity, potentially increases friction.
- **MEDIUM**: Balanced settings with moderate particle count (e.g., ~300).
- **HIGH**: Default settings with no significant adjustments.
- **ULTRA**: May increase emission rate or particle complexity slightly for high-end devices.

These adjustments help maintain smooth performance across different hardware.

### Reduced Motion

The particle system respects the user's motion preferences:
- If `prefersReducedMotion` is true, automatic start of animation is disabled
- Works with the `AnimationContext` to adjust parameters based on motion sensitivity

## Attractors & Repulsors

The particle system supports force points that can attract or repel particles:

```typescript
const { updateOptions } = useParticleSystem({
  /* other options */
  physics: {
    // Attractors pull particles toward their position
    attractors: [
      { 
        position: { x: 300, y: 200 }, // Position in the container
        strength: 0.5,                // Positive value attracts
        radius: 150,                  // Radius of influence
        decay: 'linear'               // How the force weakens with distance
      }
    ],
    // Repulsors push particles away from their position
    repulsors: [
      { 
        position: { x: 100, y: 100 },
        strength: 0.3,               // Positive value for strength still (handled internally)
        radius: 100,
        decay: 'inverse'             // Faster decay at greater distances
      }
    ]
  }
});
```

Force points can be updated dynamically:

```typescript
// Follow the mouse pointer
const handleMouseMove = (e) => {
  if (!containerRef.current) return;
  const rect = containerRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  updateOptions({
    physics: {
      attractors: [{ position: { x, y }, strength: 0.4, radius: 100 }]
    }
  });
};
```

## Performance Considerations

- Particle systems can be computationally intensive.
- The number of particles (`maxParticles`, `emissionRate`) significantly impacts performance.
- Using WebGL renderer (TODO) is generally faster than Canvas for large numbers of particles.
- Limit complex physics (like many attractors or repulsors) if performance suffers.
- Ensure the system pauses or stops when the component unmounts or is hidden (Handled by hook cleanup).
- Object pooling is implemented internally to reduce garbage collection overhead.

## Use Cases

- **Feedback:** Bursts on button clicks or successful actions (confetti - TODO).
- **Ambiance:** Gentle background effects (snow, dust motes - TODO, stars - TODO).
- **Visual Effects:** Simulate fire (TODO), smoke (TODO), explosions (fireworks), or magic spells (magicDust - TODO).
- **Game Effects:** Enhance events in game-like interfaces.
- **Interactive Elements:** Use attractors/repulsors to create interactive particle fields that respond to user input.

*(Implementation details confirmed for Canvas renderer, basic physics, and initial presets. WebGL, advanced physics, and remaining presets are pending.)* 