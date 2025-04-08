# Magnetic Interactions

Galileo Glass UI provides hooks and effects to create magnetic interactions, where elements appear to attract or repel the user's pointer or other elements, adding an intuitive and engaging feel to interfaces.

## Core Concepts

- **Attraction/Repulsion:** Elements can be configured to pull the pointer towards their center or push it away when nearby (Implemented).
- **Pointer Following:** Elements can physically follow the mouse/pointer movement with inertia and spring physics (Implemented).
- **Snap Points:** Define specific points where magnetically attracted elements will snap into place for alignment (Implemented).
- **Directional Fields:** Create more complex interactions where magnetic forces are stronger or weaker in specific directions (Implemented).
- **Multi-Element Systems:** Link multiple elements together so they respond magnetically as a group (Implemented).

## `useMagneticElement` Hook

This is the primary hook for applying magnetic effects to a component.

### Purpose

- Easily integrate magnetic attraction/repulsion behavior into any component.
- Handle pointer tracking and apply transformations based on proximity.
- Provide ready-to-use styles for the magnetic movement effect.

### Signature

```typescript
import React from 'react';
import { useMagneticElement } from '@veerone/galileo-glass-ui';

function MyMagneticComponent() {
    const { 
        ref,
        style,
        isActive,
    } = useMagneticElement<HTMLDivElement>({
        strength: 0.5,      // How strong the pull/push is (positive for attract, negative for repel)
        radius: 150,        // Activation distance (px)
        mode: 'attract',    // 'attract' or 'repel'
        maxDisplacement: 30, // Max distance the element moves (px)
        disabled: false,     // Disable the effect
        // --- Physics options ---
        animationConfig: 'gentle', 
        damping: 0.5, 
        stiffness: 200, 
        mass: 1, 
        snapPoints: [{ x: 0, y: 0 }], 
        followPointer: false,
        // --- Directional field ---
        directionalField: {
            direction: 90,    // Direction in degrees (90 = downward)
            intensity: 2,     // How focused the effect is
            shape: 'cosine',  // 'linear' or 'cosine'
            invert: false     // Whether to invert the effect
        },
        // --- Linked elements ---
        linkedElements: [
            {
                elementRef: otherElementRef, // Ref to another element
                strength: 0.3,              // Strength of connection
                maxDistance: 200,           // Max distance for connection
                mode: 'attract'             // Connection mode
            }
        ]
    });

    return (
        <div 
            ref={ref} 
            style={{
                ...style, // Apply the magnetic effect styles
                /* your other styles */
                backgroundColor: isActive ? 'blue' : 'gray',
            }} 
        >
            Magnetic Element
        </div>
    );
}
```

### Return Value

- `ref`: Attach to the element that should be magnetic.
- `style`: A complete React.CSSProperties object containing the transform, willChange, and transition properties needed for the magnetic effect.
- `isActive`: Boolean indicating if the pointer is currently close enough to activate the effect.

### ⚠️ Important: Handling Transform Conflicts

**Warning:** The `style` object from `useMagneticElement` contains a `transform` property that will conflict with any other transforms you apply to the same element.

#### Common Transform Conflict Issues:

- Centering elements with `transform: translate(-50%, -50%)`
- Applying rotation, scaling, or other transformations
- Animations that modify transforms

#### Correct Pattern: Use a Parent Wrapper for Positioning

To avoid transform conflicts, use a parent wrapper for positioning and let the magnetic element have its own transform:

```tsx
function CorrectMagneticUsage() {
    const { ref, style, isActive } = useMagneticElement<HTMLDivElement>({
        strength: 0.5,
        radius: 150,
        // Other options...
    });

    return (
        {/* Parent wrapper handles positioning */}
        <div style={{ 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)'
        }}>
            {/* Magnetic element has clean transform */}
            <div 
                ref={ref} 
                style={{
                    ...style, // Magnetic effect styles
                    width: '100px',
                    height: '100px',
                    backgroundColor: isActive ? 'blue' : 'gray',
                }} 
            >
                Magnetic!
            </div>
        </div>
    );
}
```

### Basic Usage

```tsx
import React from 'react';
import { useMagneticElement } from '@veerone/galileo-glass-ui';
import { GlassBox } from '@veerone/galileo-glass-ui/components';

function MagneticComponent() {
  const { ref, style, isActive } = useMagneticElement<HTMLDivElement>({
    strength: 0.4,
    radius: 150,
    mode: 'attract',
    maxDisplacement: 25,
  });

  return (
    // Parent wrapper for positioning
    <div style={{ position: 'relative' }}>
      <GlassBox
        ref={ref}
        style={{
          ...style, // Apply the magnetic effect styles
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: isActive ? 'rgba(165, 180, 252, 0.6)' : 'rgba(99, 102, 241, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        Attracts!
      </GlassBox>
    </div>
  );
}
```

## Directional Fields

Directional fields allow you to create magnetic effects that are stronger in specific directions, creating more dynamic and interesting interactions:

```typescript
const { ref, style } = useMagneticElement<HTMLDivElement>({
  strength: 0.4,
  radius: 150,
  mode: 'attract',
  directionalField: {
    direction: 0,      // 0 degrees = right, 90 = down, 180 = left, 270 = up
    intensity: 2.5,    // Higher values create more focused directional effect
    shape: 'cosine',   // 'cosine' gives smoother falloff than 'linear'
    invert: false      // When true, effect is strongest perpendicular to direction
  }
});
```

### Key Properties:

- **`direction`**: Angle in degrees where the magnetic force is strongest
- **`intensity`**: Controls focus sharpness (higher values = more focused in the specified direction)
- **`shape`**: Determines how the effect falls off from the main direction
- **`invert`**: When true, the effect is strongest perpendicular to the specified direction

### Use Cases:

- Creating swipe guides that encourage movement in a specific direction
- Making buttons that are more responsive to horizontal vs. vertical approaches
- Simulating gravitational fields that pull more strongly in specific directions

## Multi-Element Systems

Link multiple magnetic elements together to create complex interactive systems:

```typescript
import React, { useRef } from 'react';
import { useMagneticElement } from '@veerone/galileo-glass-ui';

function LinkedMagneticElements() {
  const element1RefInternal = useRef<HTMLDivElement>(null);
  const element2RefInternal = useRef<HTMLDivElement>(null);
  const element3RefInternal = useRef<HTMLDivElement>(null);
  
  // First element - attracts other elements
  const { ref: magRef1, style: style1 } = useMagneticElement<HTMLDivElement>({
    strength: 0.5,
    radius: 100,
    mode: 'attract',
    linkedElements: [
      { elementRef: element2RefInternal, strength: 0.3, maxDistance: 200 },
      { elementRef: element3RefInternal, strength: 0.2, maxDistance: 200 }
    ]
  });
  
  // Second element - repels the third element
  const { ref: magRef2, style: style2 } = useMagneticElement<HTMLDivElement>({
    strength: 0.4,
    radius: 80,
    mode: 'repel',
    linkedElements: [
      { elementRef: element3RefInternal, strength: 0.4, maxDistance: 150, mode: 'repel' }
    ]
  });
  
  // Third element - just follows the pointer
  const { ref: magRef3, style: style3 } = useMagneticElement<HTMLDivElement>({
    strength: 0.3,
    radius: 120,
    followPointer: true
  });
  
  // Combine refs correctly
  const combineRefs = (el: HTMLDivElement | null, ...refs: React.Ref<HTMLDivElement | null>[]) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref != null) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    });
  };

  return (
    <div style={{ position: 'relative', height: '400px' }}>
      {/* First element - use separate divs for positioning vs. magnetic effect */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <div 
          ref={(el) => combineRefs(el, magRef1, element1RefInternal)}
          style={{ ...style1, width: '80px', height: '80px', backgroundColor: 'blue' }}
        >
          Element 1
        </div>
      </div>
      
      {/* Second element */}
      <div style={{ position: 'absolute', left: '30%', top: '30%', transform: 'translate(-50%, -50%)' }}>
        <div 
          ref={(el) => combineRefs(el, magRef2, element2RefInternal)}
          style={{ ...style2, width: '80px', height: '80px', backgroundColor: 'green' }}
        >
          Element 2
        </div>
      </div>
      
      {/* Third element */}
      <div style={{ position: 'absolute', left: '70%', top: '40%', transform: 'translate(-50%, -50%)' }}>
        <div 
          ref={(el) => combineRefs(el, magRef3, element3RefInternal)}
          style={{ ...style3, width: '80px', height: '80px', backgroundColor: 'red' }}
        >
          Element 3
        </div>
      </div>
    </div>
  );
}
```

### Key Properties:

- **`linkedElements`**: Array of objects defining connections to other elements
  - **`elementRef`**: Reference to the target element
  - **`strength`**: How strongly the elements influence each other
  - **`maxDistance`**: Maximum distance where the link remains active
  - **`mode`**: Whether elements attract or repel each other

### Use Cases:

- Creating particle systems with interconnected elements
- Building floating UI elements that attract or repel each other
- Designing interactive diagrams where elements maintain relationships

## Use Cases

- **Buttons/Icons:** Make interactive elements subtly attract the cursor when hovering nearby.
- **Dock Items:** Simulate macOS-style dock magnification/interaction.
- **Draggable Elements:** Add snap-to-grid or alignment behavior with snap points.
- **Interactive Backgrounds:** Create background elements that react to pointer movement.
- **Directional Guides:** Use directional fields to hint at proper swipe or drag directions.
- **Element Networks:** Create clusters of elements that interact with each other using linkedElements.
- **Interactive Diagrams:** Build node graphs where elements attract or repel based on relationships. 