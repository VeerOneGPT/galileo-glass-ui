# Dimensional Effects (Z-Space, 3D, Parallax)

Galileo Glass UI includes features for creating a sense of depth and dimensionality in the interface using Z-space positioning, 3D transformations, and parallax effects. These effects enhance the spatial understanding and visual hierarchy of the UI.

## Core Concepts

- **Z-Space:** A conceptual third dimension perpendicular to the screen, allowing elements to be positioned at different depths (Implemented via `useZSpace`).
- **Perspective:** Applying CSS `perspective` to a container creates a 3D rendering context (Can be applied manually or via `useZSpace` parent effect).
- **3D Transforms:** Using CSS transforms like `translateZ()`, `rotateX()`, `rotateY()` to position and orient elements in 3D space (Implemented via `use3DTransform`, `useZSpace`).
- **Parallax:** Creating an illusion of depth by moving background elements slower than foreground elements during scrolling or pointer movement (Implemented via `useParallaxScroll`).

## `useZSpace` Hook

This hook manages the positioning of an element along the Z-axis and can optionally apply perspective to its parent.

### Purpose

- Apply `translateZ` transforms easily.
- Optionally manage the `perspective` and `perspective-origin` CSS properties on the element's parent for a shared 3D context.

### Signature

```typescript
import { useZSpace, ZSpaceOptions, ZSpaceResult } from 'galileo-glass-ui'; // Adjust path

function MyDepthComponent() {
    const { 
        ref,    // Attach to the element to move in Z-space
        style,  // Apply to the element (contains transform: translateZ)
        // parentStyle is handled automatically by an effect if applyPerspectiveToParent=true
    }: ZSpaceResult = useZSpace({
        depth: -50, // Move 50px further away
        applyPerspectiveToParent: 800, // Apply 800px perspective to the parent element
        preserve3d: true, // Apply transform-style: preserve-3d
    });

    return (
        <div style={{ /* Needs position: relative/absolute for parent perspective */ }}>
             <div ref={ref} style={{ ...style, /* other styles */ }}>
                 I am further away!
             </div>
        </div>
    );
}

// See types/hooks.ts for ZSpaceOptions definition
```

## `use3DTransform` Hook

This hook simplifies the application and state management of complex 3D transformations (rotations, translations, scale).

### Purpose

- Provide a stateful way to manage 3D transform properties.
- Apply the combined CSS `transform` string based on the current state.
- Offer a `setTransform` function to update the transformation.
- Optionally apply physics-based animations for smooth transitions.

### Signature

```typescript
import React from 'react';
import { 
    use3DTransform, 
    Transform3DState, 
    Transform3DOptions, 
    Transform3DResult 
} from 'galileo-glass-ui'; // Adjust path

function My3DComponent() {
    const { 
        ref,    // Attach to the element to transform
        style,  // Apply to the element (contains combined transform string)
        setTransform, // Function: (transform: Partial<Transform3DState>) => void
        currentTransform // Readonly current state: { translateX, ..., scaleZ }
    }: Transform3DResult = use3DTransform(
        { rotateY: 30, translateZ: -20 }, // Initial transform state
        { 
          usePhysics: true,  // Enable physics-based animations
          animationConfig: 'gentle', // Physics preset (gentle, bounce, etc.)
          disabled: false // Disable transformations
        }
    );

    // Example: Update transform on interaction
    const handleHover = () => {
        setTransform({ rotateY: 0, scale: 1.1 });
    };

    return (
        <div style={{ perspective: '1000px' }}> {/* Parent perspective needed */} 
            <div 
                ref={ref} 
                style={style} 
                onMouseEnter={handleHover}
            >
                I am 3D transformed!
            </div>
        </div>
    );
}

// See types/hooks.ts for Transform3DState and Transform3DOptions definitions
```

### Usage Example (Tilting Card)

```tsx
import React from 'react';
import { use3DTransform } from '@veerone/galileo-glass-ui/hooks';
import { GlassBox } from '@veerone/galileo-glass-ui/components';

function TiltingCard() {
  // Simplified: Using basic hover state instead of physics interaction for now
  const [isHovering, setIsHovering] = React.useState(false);
  const pointerPos = React.useRef({ x: 0, y: 0 });

  const { ref, style, setTransform } = use3DTransform(
      { rotateX: 0, rotateY: 0 }, 
      { usePhysics: true, animationConfig: 'gentle' } // Using physics for smooth transitions
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const relativeY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      pointerPos.current = { x: relativeX, y: relativeY };
      if (isHovering) {
          const tiltIntensity = 15; // Max degrees tilt
          setTransform({
              rotateX: -pointerPos.current.y * tiltIntensity, 
              rotateY: pointerPos.current.x * tiltIntensity,
          });
      }
  };

  const handlePointerEnter = () => {
      setIsHovering(true);
  };

  const handlePointerLeave = () => {
      setIsHovering(false);
      setTransform({ rotateX: 0, rotateY: 0 });
  };

  return (
    <GlassBox 
        style={{ perspective: '1000px' }} /* Apply perspective to parent */
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
    >
      <GlassBox
        ref={ref as React.Ref<HTMLDivElement>} // Cast ref if needed
        style={{
          ...style,
          width: 200,
          height: 300,
          backgroundColor: '#6366F1', // Placeholder
          borderRadius: '12px',
        }}
      >
        I tilt with smooth physics!
      </GlassBox>
    </GlassBox>
  );
}
```

## Parallax Effect with `useParallaxScroll`

The `useParallaxScroll` hook creates the illusion of depth by moving elements at different rates relative to scroll position.

### Signature

```typescript
import { useParallaxScroll, ParallaxScrollOptions } from 'galileo-glass-ui';

function ParallaxComponent() {
  const { ref, style } = useParallaxScroll({
    factor: 0.5,              // How fast the element moves relative to scroll
                              // (0 = fixed, 1 = normal scroll, <1 = slower, >1 = faster)
    axis: 'y',                // Which axis to apply parallax on ('x' or 'y')
    disabled: false,          // Disable the effect
    scrollContainerRef: null, // Optional ref to a custom scroll container
  });

  return (
    <div 
      ref={ref}
      style={{
        ...style,
        // Your other styles
      }}
    >
      I move slower as you scroll!
    </div>
  );
}
```

### Usage Example

```tsx
import React from 'react';
import { useParallaxScroll } from '@veerone/galileo-glass-ui/hooks';

function ParallaxBackground() {
  // Background layer - moves slower (appears further away)
  const { ref: bgRef, style: bgStyle } = useParallaxScroll({
    factor: 0.2,
  });
  
  // Middle layer - moves at medium speed
  const { ref: midRef, style: midStyle } = useParallaxScroll({
    factor: 0.5,
  });
  
  // Foreground layer - moves faster (appears closer)
  const { ref: fgRef, style: fgStyle } = useParallaxScroll({
    factor: 0.8,
  });
  
  return (
    <div style={{ height: '200vh', position: 'relative' }}>
      {/* Background */}
      <div 
        ref={bgRef} 
        style={{
          ...bgStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/mountains.jpg)',
          backgroundSize: 'cover',
          zIndex: 1,
        }}
      />
      
      {/* Middle layer */}
      <div 
        ref={midRef} 
        style={{
          ...midStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/trees.png)',
          backgroundSize: 'cover',
          zIndex: 2,
        }}
      />
      
      {/* Foreground */}
      <div 
        ref={fgRef} 
        style={{
          ...fgStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/grass.png)',
          backgroundSize: 'cover',
          zIndex: 3,
        }}
      />
      
      {/* Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 4, 
        padding: '30vh 0',
        textAlign: 'center',
        color: 'white',
      }}>
        <h1>Parallax Example</h1>
        <p>Scroll down to see the effect</p>
      </div>
    </div>
  );
}
```

## Use Cases

- **Cards & Tiles:** Add subtle 3D tilt on hover with physics for smooth transitions (`use3DTransform`).
- **Page Headers/Backgrounds:** Create depth with parallax scrolling (`useParallaxScroll`).
- **Modals/Popovers:** Animate entrance/exit along the Z-axis (`useZSpace` + animation library).
- **Galleries/Carousels:** Implement Cover Flow-like 3D transitions (`use3DTransform` + animation library).

