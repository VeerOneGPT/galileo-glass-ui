# Dimensional Effects (Z-Space, 3D, Parallax)

Galileo Glass UI includes features for creating a sense of depth and dimensionality in the interface using Z-space positioning, 3D transformations, and parallax effects. These effects enhance the spatial understanding and visual hierarchy of the UI.

## Core Concepts

- **Z-Space:** A conceptual third dimension perpendicular to the screen, allowing elements to be positioned at different depths.
- **Perspective:** Applying CSS `perspective` to a container creates a 3D rendering context, making Z-space translations visible.
- **3D Transforms:** Using CSS transforms like `translateZ()`, `rotateX()`, `rotateY()` to position and orient elements in 3D space.
- **Parallax:** Creating an illusion of depth by moving background elements slower than foreground elements during scrolling or pointer movement.

## `useZSpace` Hook (Conceptual)

This hook might manage the positioning of an element along the Z-axis and potentially apply related depth effects.

### Purpose

- Abstract the complexities of applying `translateZ` and managing perspective.
- Potentially link Z-position to other effects (e.g., blur, scale) to enhance the depth illusion.
- Could integrate with scroll or interaction events to animate depth dynamically.

### Signature (Conceptual)

```typescript
import { useZSpace, ZSpaceOptions } from 'galileo-glass-ui';

function useZSpace<T extends HTMLElement = HTMLElement>(
  options?: ZSpaceOptions
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties; // Applies transform with translateZ
  // ... other state or controls
};

interface ZSpaceOptions {
  depth?: number; // Position along the Z-axis (positive = closer, negative = further)
  perspectiveOrigin?: string; // 'center center', 'top left', etc.
  perspective?: number; // Apply perspective to the element itself (less common)
  animateOnScroll?: boolean;
  scrollDepthRange?: [number, number]; // Map scroll position to Z depth
  // ...
}
```

## `use3DTransform` Hook (Conceptual)

This hook likely simplifies the application of complex 3D transformations (rotations, translations) and potentially integrates them with physics or interactions.

### Purpose

- Provide a convenient API for applying `rotateX`, `rotateY`, `rotateZ`, `translateZ`.
- Optimize the calculation and application of 3D transform matrices.
- Could be driven by interaction hooks (`usePhysicsInteraction`) or gesture hooks (`useGesturePhysics`) to create interactive 3D effects (like tilting cards on hover).

### Signature (Conceptual)

```typescript
import { use3DTransform, Transform3DOptions } from 'galileo-glass-ui';

function use3DTransform<T extends HTMLElement = HTMLElement>(
  initialTransform?: Partial<Transform3DState>,
  options?: Transform3DOptions
): {
  ref: React.RefObject<T>;
  style: React.CSSProperties;
  setTransform: (transform: Partial<Transform3DState>) => void;
  // Potentially spring-based animation controls if integrated
};

interface Transform3DState {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number; // degrees
  rotateY: number; // degrees
  rotateZ: number; // degrees
  scale: number;
}

interface Transform3DOptions {
  usePhysics?: boolean; // Animate changes using spring physics
  animationConfig?: string | object;
  // ...
}
```

### Usage Example (Tilting Card)

```tsx
import React from 'react';
import { use3DTransform, usePhysicsInteraction, useComposedRef } from '@veerone/galileo-glass-ui/hooks';
import { GlassBox } from '@veerone/galileo-glass-ui/components';

function TiltingCard() {
  // usePhysicsInteraction detects hover/press and gives interaction strength/position
  const { 
    ref: interactionRef, 
    state, // Get state including relative pointer position
    isHovering 
  } = usePhysicsInteraction({ 
    affectsTilt: true, // Make sure tilt is enabled in the hook's options
    tiltAmplitude: 15,
    /* ... other options ... */ 
  }); 
  
  // use3DTransform applies rotations based on pointer position from state
  const tiltIntensity = 15; // Max degrees tilt
  const { ref: transformRef, style: transformStyle } = use3DTransform({
    rotateX: isHovering ? -state.relativeY * tiltIntensity : 0, // Use state.relativeY
    rotateY: isHovering ? state.relativeX * tiltIntensity : 0,  // Use state.relativeX
  }, { usePhysics: true, animationConfig: 'gentle' }); 

  // Need a way to combine refs if necessary (e.g., useComposedRef hook)
  const composedRef = useComposedRef(interactionRef, transformRef);

  return (
    <GlassBox style={{ perspective: '1000px' }}> {/* Apply perspective to parent */}
      <GlassBox
        ref={composedRef}
        style={{
          ...transformStyle,
          width: 200,
          height: 300,
          backgroundColor: '#6366F1', // Placeholder for theme.colors.primary.main
          borderRadius: '12px',
          willChange: 'transform', // Performance
          transformStyle: 'preserve-3d', // Important for nested 3D elements
        }}
      >
        I tilt!
      </GlassBox>
    </GlassBox>
  );
}
```

## Parallax Effect

Parallax is often achieved by moving elements at different rates relative to scroll position or pointer movement. This might be implemented:

- **Via `useZSpace`:** Elements further back (negative Z) naturally appear to move less in perspective.
- **Via Scroll-Linked Animations:** Directly translating elements based on scroll position, with different multipliers for different layers (e.g., background moves at 0.5x scroll speed, foreground at 1x).
- **Via Pointer Movement:** Translating elements slightly in the opposite direction of pointer movement, with the amount varying by layer depth.

```typescript
// Conceptual hook for scroll-based parallax
function useParallaxScroll(options: { factor: number }): { style: React.CSSProperties };

function ParallaxLayer({ factor, children }) {
  const { style } = useParallaxScroll({ factor });
  return <div style={style}>{children}</div>;
}

// Usage
<ParallaxContainer>
  <ParallaxLayer factor={0.2}>Background</ParallaxLayer>
  <ParallaxLayer factor={0.5}>Midground</ParallaxLayer>
  <ParallaxLayer factor={1.0}>Foreground</ParallaxLayer>
</ParallaxContainer>;
```

## Use Cases

- **Cards & Tiles:** Add subtle 3D tilt on hover for interactivity.
- **Page Headers/Backgrounds:** Create depth with parallax scrolling images or elements.
- **Modals/Popovers:** Animate entrance/exit along the Z-axis.
- **Galleries/Carousels:** Implement Cover Flow-like 3D transitions.

*(Specific hooks and their APIs require confirmation from the source code.)* 