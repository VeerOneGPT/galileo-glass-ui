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
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui/hooks'; // Assuming correct path for the hook
import { Box } from '@veerone/galileo-glass-ui/components'; // Import Box from Galileo

function InteractiveElement() {
  const { ref, style: dynamicStyle } = usePhysicsInteraction<HTMLDivElement>({
    // Using default spring physics
    maxDisplacement: 15, // How far it moves (pixels)
    affectsTilt: true, // Enable tilt effect
    tiltAmplitude: 10, // Tilt amount (degrees)
    stiffness: 150,
    dampingRatio: 0.6,
    mass: 1,
  });

  // Define static styles separately
  const staticStyles: React.CSSProperties = {
    width: 150,
    height: 150,
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.2em',
    cursor: 'pointer',
    willChange: 'transform', // Good practice with transforms
  };

  return (
    <Box
      ref={ref}
      // Combine static styles and dynamic styles from the hook
      style={{ ...staticStyles, ...dynamicStyle }}
    >
      Interact Me!
    </Box>
  );
}
```