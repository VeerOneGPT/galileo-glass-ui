# Gesture Physics

Galileo Glass UI incorporates a gesture physics system that allows UI elements to respond naturally to user gestures (like dragging, swiping, flicking, pinching) with realistic momentum, inertia, and boundary constraints.

## Core Concepts

- **Unified Gesture Handling:** Captures touch, mouse, and pointer events through a consistent API (Implemented in both `useInertialMovement` and `useGesturePhysics`).
- **Physics-Based Response:** Maps gesture inputs (velocity, displacement) to physical forces or impulses applied to elements (Implemented via springs and inertia in both hooks).
- **Inertia & Momentum:** Allows elements (like scrollable content) to continue moving and gradually slow down after a flick gesture (Implemented via `useInertialMovement`).
- **Multi-Touch:** Recognizes and responds to common multi-touch gestures like pinch-to-zoom or rotation (Implemented in `useGesturePhysics`).
- **Boundary Constraints:** Defines physical boundaries (e.g., scroll limits) with configurable elasticity or collision behavior (Implemented in both hooks).
- **Haptic Feedback:** Integrates with device haptics to provide physical confirmation for gesture interactions (Implemented).

## `useGesturePhysics` Hook

This hook is the primary mechanism for adding physics-driven responses to gestures like panning, swiping, pinching, and tapping on an element.

### Purpose

- Detect and interpret common user gestures on a specific HTML element.
- Calculate real-time gesture properties like displacement and velocity.
- Manage internal physics simulations (inertial movement for pan/swipe, springs for pinch/rotate) based on gesture inputs and configuration.
- Provide the necessary `style` properties (primarily `transform`, `touchAction`, `userSelect`) to apply to the target element for visual feedback.
- Optionally provide haptic feedback for gesture events.

### Signature

```typescript
import {
  useGesturePhysics,
  GesturePhysicsOptions,
  GesturePhysicsResult,
  GesturePhysicsPreset
} from '@veerone/galileo-glass-ui';

function MyComponent() {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const { 
    transform,         // Current transform state (x, y, scale, rotation)
    cssTransform,      // CSS transform string
    style,             // Complete style object to apply
    elementRef,        // Reference to the element (pass to component)
    setTransform,      // Function to set transform directly
    animateTo,         // Function to animate to a target transform
    reset,             // Function to reset to initial state
    isGestureActive    // Boolean indicating if gesture is active
  } = useGesturePhysics({
    elementRef,        // Reference to the element
    preset: GesturePhysicsPreset.NATURAL, // Predefined physics configuration
    
    // Physics settings
    mass: 1,           // Mass of the object (affects momentum)
    tension: 200,      // Spring tension (higher = stiffer)
    friction: 20,      // Friction coefficient (higher = less movement)
    inertia: true,     // Enable inertial movement
    
    // Gesture configurations
    pan: { enabled: true, threshold: 5, multiplier: 1 },
    pinch: { enabled: true, threshold: 0.05, multiplier: 0.8 },
    rotate: { enabled: true, threshold: 5 },
    
    // Boundaries
    boundaries: {
      x: { min: -100, max: 100 },
      y: { min: -100, max: 100 },
      scale: { min: 0.5, max: 3 },
      rotation: { min: -180, max: 180 }
    },
    
    // Haptic feedback
    enableHaptics: true,
    
    // Additional options
    preventDefaultEvents: true,
    disableScroll: false,
    
    // Callbacks
    onGestureStart: (type, event) => console.log('Start', type),
    onGestureChange: (type, event, state) => console.log('Change', type),
    onGestureEnd: (type, event) => console.log('End', type),
    onTransformChange: (transform) => console.log('Transform', transform)
  });
  
  return (
    <div 
      ref={elementRef}
      style={{
        ...style,
        width: 200,
        height: 200,
        backgroundColor: 'teal',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      Drag, Pinch, Rotate Me
    </div>
  );
}
```

### Gesture Physics Presets

The hook offers predefined physics presets for quick configuration:

```typescript
enum GesturePhysicsPreset {
  RESPONSIVE = 'responsive',   // Quick, highly responsive
  NATURAL = 'natural',         // Balanced, natural feeling (default)
  SMOOTH = 'smooth',           // Smoother, more gradual
  BOUNCY = 'bouncy',           // Springy, with overshoot
  PRECISE = 'precise',         // Direct with minimal physics
  ELASTIC = 'elastic',         // Stretchy with resistance
  MOMENTUM = 'momentum',       // Heavy with continued motion
  SNAPPY = 'snappy'            // Quick with fast settle
}
```

### Haptic Feedback

The `useGesturePhysics` hook integrates with the browser's vibration API to provide haptic feedback on gesture events:

```typescript
const { /* ... */ } = useGesturePhysics({
  elementRef,
  enableHaptics: true, // Enable haptic feedback
  // ... other options
});
```

When enabled, haptic feedback is triggered at appropriate times:
- **Tap**: Light vibration
- **Double Tap**: Success pattern
- **Long Press**: Medium vibration
- **Pan/Swipe**: Selection pulse
- **Pinch/Rotate**: Light vibration
- **Snap**: Success pattern when element snaps to a defined point

## Inertial Movement (`useInertialMovement`)

A hook specifically designed for implementing inertial scrolling or dragging based on pointer velocity.

### Purpose

- Capture pointer drag events on a target element.
- Calculate velocity based on pointer movement.
- Initiate an animation loop on pointer release if velocity exceeds a threshold.
- Continue animating the element's position based on the captured velocity, applying friction and boundary constraints.

### Signature

```typescript
import React from 'react';
import { 
    useInertialMovement, 
    InertialMovementOptions, 
    InertialMovementResult 
} from '@veerone/galileo-glass-ui'; // Adjust path

function MyScrollableComponent() {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null); // Optional

    const { 
        style, // Apply this style to the content element (ref={contentRef})
        state, // { isDragging: boolean, isMoving: boolean, position: {x,y}, velocity: {x,y} }
        reset, // Function to reset position to {x: 0, y: 0}
        stopMovement // Function to stop current inertial movement
    }: InertialMovementResult = useInertialMovement({
        contentRef,       // Required: Ref to the element being dragged
        containerRef,     // Optional: Ref to the container for bounds calculation
        friction: 0.06,    // How quickly it slows down (0-1)
        bounceFactor: 0.2, // How much energy is lost on bounce (0-1)
        axis: 'y',         // Allow movement only on 'y' axis
        // explicitBounds: { top: -500, bottom: 0 } // Optional manual bounds
  });

  return (
        <div ref={containerRef} style={{ height: 300, overflow: 'hidden', border: '1px solid grey' }}>
            <div ref={contentRef} style={{ ...style, width: '100%', background: 'lightblue' }}>
                {/* Long content that requires scrolling */}
                <p>Scrollable Content...</p>
                {/* ... more content ... */}
      </div>
    </div>
  );
}

// See types/hooks.ts for InertialMovementOptions definition
```

### Return Value Explained

- **`style`**: A `React.CSSProperties` object containing `transform: translate3d(...)` and `willChange: transform`. Apply this to the draggable element.
- **`state`**: An object containing the current movement state:
    - `isDragging` (boolean): True if the user is currently dragging the element.
    - `isMoving` (boolean): True if the element is currently moving due to inertia.
    - `position` ({x, y}): The current translation applied to the element.
    - `velocity` ({x, y}): The current calculated velocity (units per second).
- **`reset`**: A function `() => void` to immediately stop movement and reset the position to `{ x: 0, y: 0 }`.
- **`stopMovement`**: A function `() => void` to immediately stop any ongoing inertial movement, retaining the current position.

### Key Features

- Captures pointer events (down, move, up/cancel) on the `contentRef` element.
- Calculates velocity based on the last few pointer movements before release.
- Uses `requestAnimationFrame` for the inertial animation loop.
- Applies friction to gradually decrease velocity.
- Handles boundary collisions based on `containerRef` size difference or `explicitBounds`.
    - Implements basic bounce using `bounceFactor`.
- Respects `prefers-reduced-motion` by disabling inertial movement.
- Allows restricting movement to `x`, `y`, or `both` axes.
- Sets `touch-action` CSS property to prevent conflicts with browser scrolling.

## Use Cases

- **Scrollable Lists/Containers:** Implement smooth, native-like scrolling with inertia on web (via `useInertialMovement`).
- **Draggable Elements:** Allow elements to be thrown or flicked (via `useInertialMovement` or `useGesturePhysics`).
- **Image Carousels:** Swipe between items with momentum (via `useInertialMovement` or `useGesturePhysics`).
- **Zoomable/Pannable Content:** Use pinch and drag gestures with physics (via `useGesturePhysics`).
- **Sliders/Knobs:** Drag controls with physical resistance or snapping (via `useGesturePhysics`). 