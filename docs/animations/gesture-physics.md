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

This hook is the primary mechanism for adding physics-driven responses to gestures like panning, swiping, pinching, and tapping on an element.

### Purpose

- Detect and interpret common user gestures on a specific HTML element.
- Calculate real-time gesture properties like displacement and velocity.
- Manage internal physics simulations (inertial movement for pan/swipe, springs for pinch/rotate) based on gesture inputs and configuration.
- Provide the necessary `style` properties (primarily `transform`, `touchAction`, `userSelect`) to apply to the target element for visual feedback.

### Signature (Conceptual - Based on Implementation)

```typescript
import {
  useGesturePhysics,
  type GesturePhysicsOptions,
  type GestureTransform
} from '@veerone/galileo-glass-ui'; // Adjust path

function useGesturePhysics(
  options: GesturePhysicsOptions
): {
  // Ref Management:
  // Note: The hook *requires* the elementRef option to be passed.
  // It does not return a ref itself.
  elementRef: React.RefObject<HTMLElement>; // From options

  // Style Output:
  style: React.CSSProperties; // Apply this to the element
  cssTransform: string; // The CSS transform string (e.g., "translate3d(...) scale(...) ...")

  // State & Control:
  transform: GestureTransform; // Current physics state (x, y, scale, rotation, velocities)
  isGestureActive: boolean; // Is any gesture currently active?
  setTransform: (newTransform: Partial<GestureTransform>) => void; // Manually set state
  animateTo: (targetTransform: Partial<GestureTransform>, options?: { duration?: number }) => void; // Animate to a state
  reset: (animate?: boolean) => void; // Reset to initial state
};

interface GesturePhysicsOptions {
  // **Required**: Ref to the target element.
  // Important: Must point to a non-null HTMLElement when the hook initializes.
  elementRef: React.RefObject<HTMLElement>;

  // Gesture Configurations (optional):
  pan?: Partial<GestureConfig>;
  swipe?: Partial<GestureConfig>;
  pinch?: Partial<GestureConfig>;
  rotate?: Partial<GestureConfig>;
  tap?: Partial<GestureConfig>;
  longPress?: Partial<GestureConfig>;
  doubleTap?: Partial<GestureConfig>;

  // General Physics & Behavior (optional):
  mass?: number;
  tension?: number;
  friction?: number;
  inertia?: boolean; // Global inertia toggle
  preset?: GesturePhysicsPreset; // e.g., 'natural', 'responsive'
  boundaries?: { /* ... boundary definitions ... */ };
  usePointerEvents?: boolean; // Default: true
  preventDefaultEvents?: boolean; // Default: true
  disableScroll?: boolean; // Default: false

  // Callbacks (optional):
  onGestureStart?: (type: GestureType, event: GestureEventData) => void;
  onGestureChange?: (type: GestureType, event: GestureEventData, state: any) => void;
  onGestureEnd?: (type: GestureType, event: GestureEventData) => void;
  // **Important**: Use this callback to react to physics updates.
  onTransformChange?: (transform: GestureTransform) => void;
}

// GestureConfig defines settings per gesture type (enabled, threshold, etc.)
// GestureTransform holds the physics state (x, y, scale, rotation, velocities)
```

### Return Value Explained

- **`elementRef`**: This is passed *in* via options, not returned.
- **`style`**: A `React.CSSProperties` object. You **must** apply this to your target element's `style` prop. It contains crucial properties like `touchAction: 'none'` (to prevent browser interference), `userSelect: 'none'`, and the calculated `transform`. 
    *(Note: There might be a type issue where `style.userSelect` is returned as `string` but needs to be `UserSelect | undefined`. A temporary workaround might be needed: `style={{ ...hookStyle, userSelect: hookStyle.userSelect as any }}`)*.
- **`cssTransform`**: The raw CSS `transform` string, useful if applying styles differently.
- **`transform`**: An object containing the current physics state (position, scale, rotation, velocities).
- **`isGestureActive`**: Boolean flag indicating if a gesture is currently interacting with the element.
- **`setTransform`, `animateTo`, `reset`**: Functions to programmatically control the element's physics state.

### Applying the Transform

There are two main ways to apply the visual transform:

1.  **Directly via `style` prop (Recommended):**
    ```tsx
    const { style } = useGesturePhysics({ elementRef });
    return <DraggableElement ref={elementRef} style={style} />;
    ```
    The hook updates the `style.transform` property internally.

2.  **Using `onTransformChange` (Alternative):**
    ```tsx
    const [dynamicStyle, setDynamicStyle] = useState({});
    useGesturePhysics({
      elementRef,
      onTransformChange: (t) => {
        setDynamicStyle(prev => ({
          ...prev,
          transform: `translate3d(...) scale(...) ...` // Construct transform from t.x, t.y, etc.
        }));
      }
    });
    return <DraggableElement ref={elementRef} style={dynamicStyle} />;
    ```
    This gives more control but requires managing the style state yourself.

### Important Considerations

- **Ref Initialization:** Ensure the `elementRef` passed in the options points to a valid `HTMLElement` when the hook runs. If the ref might be initially null (e.g., from `useRef(null)`), initialize the hook inside a `useEffect` that runs when the ref is populated.
- **Invalid Options:** Options like `boundsRef` or `press` seen in some examples are *not* valid for `useGesturePhysics`.
- **CSS:** The target element should ideally have `will-change: transform;` for performance.

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