# Gesture Physics

Galileo Glass UI incorporates a gesture physics system that allows UI elements to respond naturally to user gestures (like dragging, swiping, flicking, pinching) with realistic momentum, inertia, and boundary constraints.

## Core Concepts

- **Unified Gesture Handling:** Captures touch, mouse, and pointer events through a consistent API.
- **Physics-Based Response:** Maps gesture inputs (velocity, displacement) to physical forces or impulses applied to elements.
- **Inertia & Momentum:** Allows elements (like scrollable content) to continue moving and gradually slow down after a flick gesture (`useInertialMovement`).
- **Multi-Touch:** Recognizes and responds to common multi-touch gestures like pinch-to-zoom or rotation, often applying physics to the transformation.
- **Boundary Constraints:** Defines physical boundaries (e.g., scroll limits) with configurable elasticity or collision behavior.
- **Haptic Feedback:** Integrates with device haptics to provide physical confirmation for gesture interactions.

## `useGesturePhysics` Hook

This hook is likely the central piece for connecting gesture inputs to physics-based animations.

### Purpose

- Simplify the detection and interpretation of user gestures on an element.
- Calculate gesture velocity and displacement.
- Translate gesture information into physics parameters (forces, velocities) to drive animation hooks like `useMultiSpring` or specialized inertial movement hooks.
- Manage the state of the gesture interaction (dragging, flicking, pinching).

### Signature (Conceptual)

*(The exact API might involve separate hooks for different gesture types like dragging vs. pinching, or a single more complex hook.)*

```typescript
import { useGesturePhysics, GesturePhysicsOptions } from 'galileo-glass-ui';

function useGesturePhysics<T extends HTMLElement = HTMLElement>(
  options?: GesturePhysicsOptions
): {
  ref: React.RefObject<T>;
  // State reflecting gesture activity:
  isDragging: boolean;
  isScrolling: boolean;
  isPinching: boolean;
  // Calculated gesture properties:
  delta: { x: number, y: number }; // Change since last frame
  velocity: { x: number, y: number };
  distance: number; // Total distance moved during gesture
  direction: number; // Angle of movement
  scaleDelta?: number; // For pinching
  rotationDelta?: number; // For rotation gestures
  // Event handlers to attach:
  // eventHandlers: Record<string, (e: any) => void>; // Note: Actual hooks like usePhysicsInteraction handle events internally.
  // Functions to connect to animation hooks:
  applyToSpring?: (springApi: MultiSpringResult<any>) => void; // Example
};

interface GesturePhysicsOptions {
  axis?: 'x' | 'y' | 'both'; // Constrain dragging/scrolling
  momentum?: boolean; // Enable inertial movement after gesture end
  momentumStrength?: number;
  friction?: number; // How quickly inertial movement slows down
  bounds?: { top?: number; left?: number; right?: number; bottom?: number };
  lockDirection?: boolean; // Lock to initial axis of movement
  threshold?: number; // Minimum distance before gesture is considered active
  enablePinch?: boolean;
  enableRotate?: boolean;
  // ... other configuration
}
```

### Return Value

- `ref`: Attach to the element that should respond to gestures.
- `isDragging`, `isPinching`, etc.: State flags indicating the current gesture type.
- `delta`, `velocity`, etc.: Real-time information about the gesture's movement.
- `eventHandlers`: *Note: In the actual implemented hooks (like `usePhysicsInteraction`), event handlers are typically managed internally and not returned for manual attachment.* Conceptual handlers (`onPointerDown`, `onPointerMove`, etc.) would be attached to the target element.
- `applyToSpring` (or similar): Functions or mechanisms to link the gesture output to drive animation hooks.

## Inertial Movement (`useInertialMovement`)

A common application of gesture physics is inertial scrolling or dragging. This might be handled by `useGesturePhysics` directly (with `momentum: true`) or potentially by a dedicated hook like `useInertialMovement`.

- Captures the velocity of a drag/flick gesture when the user releases.
- Continues animating the element's position based on that initial velocity, gradually slowing down due to friction.
- Handles boundary collisions (e.g., overscroll bounce).

```tsx
// Conceptual usage for inertial scrolling
function ScrollableContent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Hook manages gesture capture and applies physics-based scroll offset
  // Corrected: Assuming useInertialMovement handles events internally, like usePhysicsInteraction.
  const { ref: gestureRef, scrollStyle } = useInertialMovement({
    containerRef: scrollRef, // Ref to the scrollable container
    friction: 0.95, // Adjust friction for desired deceleration
    bounds: { top: 0, bottom: /* Calculate based on content height */ },
    bounceFactor: 0.5, // How much to bounce on hitting bounds
  });

  return (
    <div ref={scrollRef} style={{ overflow: 'hidden' }}> 
      <div 
        ref={gestureRef} 
        style={{ ...scrollStyle, touchAction: 'pan-y' }} // Apply calculated transform
        // Removed {...eventHandlers} - Assuming internal handling
      >
        {/* Long content here */} 
      </div>
    </div>
  );
}
```

## Use Cases

- **Scrollable Lists/Containers:** Implement smooth, native-like scrolling with inertia on web.
- **Draggable Elements:** Allow elements to be thrown or flicked.
- **Image Carousels:** Swipe between items with momentum.
- **Zoomable/Pannable Content:** Use pinch and drag gestures with physics.
- **Sliders/Knobs:** Drag controls with physical resistance or snapping.

*(Specific implementation details, especially how gesture outputs drive animation hooks, require referencing the actual source code or more detailed examples.)* 