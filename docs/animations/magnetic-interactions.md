# Magnetic Interactions

Galileo Glass UI provides hooks and effects to create magnetic interactions, where elements appear to attract or repel the user's pointer or other elements, adding an intuitive and engaging feel to interfaces.

## Core Concepts

- **Attraction/Repulsion:** Elements can be configured to pull the pointer towards their center or push it away when nearby.
- **Pointer Following:** Elements can physically follow the mouse/pointer movement with inertia and spring physics.
- **Snap Points:** Define specific points where magnetically attracted elements will snap into place for alignment.
- **Directional Fields:** Create more complex interactions where magnetic forces are stronger or weaker in specific directions.
- **Multi-Element Systems:** Link multiple elements together so they respond magnetically as a group.

## `useMagneticElement` Hook

This is the primary hook for applying magnetic effects to a component.

### Purpose

- Easily integrate magnetic attraction/repulsion behavior into any component.
- Handle pointer tracking and physics calculations for magnetic effects.
- Provide styles to apply the magnetic movement to the element.

### Signature (Conceptual)

*(Note: The exact signature might vary based on implementation details. This is a likely structure.)*

```typescript
import { useMagneticElement, MagneticElementOptions } from 'galileo-glass-ui';

function useMagneticElement<T extends HTMLElement = HTMLElement>(
  options?: MagneticElementOptions
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties; // Applies transform based on magnetic forces
  isActive: boolean; // Is the pointer currently within the magnetic field?
  // Potentially other state or control functions
};

interface MagneticElementOptions {
  strength?: number; // How strong the attraction/repulsion is (e.g., 0-1)
  radius?: number; // Distance (px) at which the effect starts
  mode?: 'attract' | 'repel'; // Default: 'attract'
  damping?: number; // How quickly the magnetic movement settles (affects oscillation)
  stiffness?: number; // Spring stiffness for the magnetic movement
  snapPoints?: { x: number; y: number }[]; // Coordinates for snapping
  directionalField?: { angle: number; strength: number }; // Example structure
  followPointer?: boolean; // Whether the element itself follows the pointer
  animationConfig?: string | object; // Spring config preset or object
  // ... other physics or configuration options
}
```

### Return Value

- `ref`: Attach to the element that should be magnetic.
- `style`: Apply to the element to make it move based on the magnetic effect.
- `isActive`: Boolean indicating if the pointer is currently close enough to activate the effect.

### Basic Usage

```tsx
import React from 'react';
import { useMagneticElement } from 'galileo-glass-ui';
import { Box } from '@mui/material'; // Or any component

function MagneticComponent() {
  const { ref, style, isActive } = useMagneticElement({
    strength: 0.4,
    radius: 150,
    animationConfig: 'gentle',
  });

  return (
    <Box
      ref={ref}
      style={style} // Apply the calculated transform
      sx={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        backgroundColor: isActive ? 'primary.light' : 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        willChange: 'transform', // Performance optimization
      }}
    >
      Attracts!
    </Box>
  );
}
```

## Pointer Following

If `followPointer: true` is enabled (or via a separate hook like `usePointerFollow`), the element itself will track the pointer's movement, often with physics-based easing (inertia, damping) for a natural feel.

## Snap Points & Alignment Guides

Defining `snapPoints` allows elements being dragged or magnetically influenced to snap cleanly to predefined positions, improving usability for alignment tasks.

## Use Cases

- **Buttons/Icons:** Make interactive elements subtly attract the cursor when hovering nearby.
- **Dock Items:** Simulate macOS-style dock magnification/interaction.
- **Draggable Elements:** Add snap-to-grid or alignment behavior.
- **Interactive Backgrounds:** Create background elements that react to pointer movement.

*(Further details on specific configuration options like directional fields or multi-element systems would depend on the final API design.)* 