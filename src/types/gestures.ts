import type { Vector2D } from './particles'; // Reusing Vector2D
import type { SpringConfig, SpringPresets } from '../animations/physics/springPhysics';

// --- Gesture Physics Types --- 

/** Type of gesture being performed. */
export type GestureType = 'pan' | 'swipe' | 'pinch' | 'rotate' | 'tap' | 'longPress' | 'doubleTap';

/** Data associated with a gesture event. */
export interface GestureEventData {
    event: PointerEvent | TouchEvent | MouseEvent | KeyboardEvent; // Raw event
    // Common properties from @use-gesture
    xy: [number, number]; // Current [x, y] coordinates
    initial: [number, number]; // Initial [x, y]
    delta: [number, number]; // Change since last event [dx, dy]
    offset: [number, number]; // Accumulated change [ox, oy]
    movement: [number, number]; // Total movement since start [mx, my]
    velocity: [number, number]; // Velocity [vx, vy] (pixels per ms)
    direction: [number, number]; // Direction vector [dirX, dirY]
    distance: number | [number, number]; // Pinch distance or wheel distance
    angle: number | [number, number]; // Rotate angle or wheel angle
    pinching?: boolean;
    wheeling?: boolean;
    dragging?: boolean; // Or panning
    rotating?: boolean;
    first?: boolean;
    last?: boolean;
    active?: boolean; // Is the gesture ongoing?
    down?: boolean; // Is the pointer/touch down?
    // ... potentially others
}

/** Base configuration for a specific gesture type. */
export interface BaseGestureConfig {
    enabled?: boolean;
    threshold?: number | [number, number];
    // Add other common config options from @use-gesture if needed
}

/** Specific configuration for pan/drag/swipe gestures. */
export interface PanGestureConfig extends BaseGestureConfig {
    axis?: 'x' | 'y';
    lockDirection?: boolean;
    // ... more pan options
}

/** Specific configuration for pinch gestures. */
export interface PinchGestureConfig extends BaseGestureConfig {
    // ... pinch options
}

/** Specific configuration for rotate gestures. */
export interface RotateGestureConfig extends BaseGestureConfig {
     // ... rotate options
}

/** Specific configuration for tap/press gestures. */
export interface TapGestureConfig extends BaseGestureConfig {
    // ... tap/longPress/doubleTap options
}

// Add configs for other gestures (Wheel, Hover, Move) if needed later

/** Main options object for the useGesturePhysics hook. */
export interface GesturePhysicsOptions {
    /** Ref to the target element for attaching gesture handlers. */
    elementRef: React.RefObject<HTMLElement>;
    /** Configuration for pan/drag/swipe gestures. */
    pan?: boolean | PanGestureConfig;
    /** Configuration for pinch gestures. */
    pinch?: boolean | PinchGestureConfig;
    /** Configuration for rotate gestures. */
    rotate?: boolean | RotateGestureConfig;
    /** Configuration for tap gestures. */
    tap?: boolean | TapGestureConfig;
    /** Configuration for long press gestures. */
    longPress?: boolean | TapGestureConfig; // Uses tap config
    /** Configuration for double tap gestures. */
    doubleTap?: boolean | TapGestureConfig; // Uses tap config
    // Add wheel/hover/move if needed

    /** Base spring physics configuration (preset name or object). */
    animationConfig?: keyof typeof SpringPresets | SpringConfig;
    /** Apply inertia (momentum) after drag/swipe release. Default: true */
    inertia?: boolean; 
    /** Decay factor for inertia (0-1, lower = faster stop). Default: 0.99 */
    inertiaDecay?: number;
    /** Boundaries for movement { top, bottom, left, right }. */
    bounds?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
    /** Elasticity/bounce when hitting bounds (0-1). Default: 0.3 */
    bounce?: number;
    /** Prevent default browser actions (e.g., scrolling, pinch-zoom). Default: true */
    preventDefault?: boolean;
    /** Disable all gestures and physics. */
    disabled?: boolean;

    // --- Callbacks --- 
    onGestureStart?: (type: GestureType, data: GestureEventData) => void;
    onGestureChange?: (type: GestureType, data: GestureEventData, transform: GestureTransform) => void;
    onGestureEnd?: (type: GestureType, data: GestureEventData) => void;
    /** Callback triggered on every physics update (after gesture ends, during inertia/bounce). */
    onTransformChange?: (transform: GestureTransform) => void;
    // Add specific gesture callbacks if needed (onPan, onPinch, onTap, etc.)
}

/** Represents the current transformation state managed by physics. */
export interface GestureTransform {
    x: number;        // Current translateX
    y: number;        // Current translateY
    scale: number;    // Current scale
    rotation: number; // Current rotation (degrees)
    // Could add velocities if needed externally
} 