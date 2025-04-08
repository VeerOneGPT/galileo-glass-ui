import React from 'react';
import { Vector2D } from '../animations/physics/engineTypes'; // Adjust path as needed
import { RefObject } from 'react';
import { SpringConfig, SpringPresets } from '../animations/physics/springPhysics'; // <= Add import
import { MotionSensitivityLevel } from './accessibility'; // Import enum
import { AnimationCategory } from '../types/accessibility'; // Import enum

// --- Types for usePhysicsLayout Hook ---

export type LayoutType = 'grid' | 'stack' | 'freeform';

/** Configuration for individual item physics in usePhysicsLayout */
export interface PhysicsLayoutItemConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  friction?: number;
}

// Updated PhysicsLayoutOptions to match implementation/docs
export interface PhysicsLayoutOptions {
  /** Type of layout to apply */
  layoutType: LayoutType; // Now required

  /** Physics configuration for the spring forces driving elements */
  physicsConfig?: {
    stiffness?: number; // Spring stiffness (Default: 0.15)
    damping?: number;   // Damping factor (Default: 0.8)
    mass?: number;      // Mass of each element (Default: 1)
    friction?: number;  // Movement friction (Default: 0.1)
  };

  /** Options specific to the 'grid' layout type */
  gridOptions?: {
    columns: number;       // Number of columns in the grid
    rowSpacing?: number;    // Vertical space between items (Default: 10)
    columnSpacing?: number; // Horizontal space between items (Default: 10)
  };

  /** Options specific to the 'stack' layout type */
  stackOptions?: {
    direction?: 'horizontal' | 'vertical'; // Stack direction (Default: 'vertical')
    spacing?: number;                     // Space between stacked items (Default: 5)
    offsetStep?: { x: number; y: number }; // Additional offset per item (Default: {x: 0, y: 0})
  };

  /** Options specific to the 'freeform' layout type */
  freeformOptions?: {
    // Configuration for forces like gravity, repulsion, attraction
    gravity?: { x: number; y: number }; // Applied gravity force (Default: {x: 0, y: 0})
    repulsionStrength?: number;         // Strength of repulsion between items (Default: 50)
    repulsionRadius?: number;           // Radius for repulsion force (Default: 50)
    centerAttraction?: number;        // Strength of attraction towards bounds center (Default: 0.01)
  };

  /** Bounding box within which elements are constrained */
  bounds?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };

  /** Optional: Provide different physics config per item */
  itemPhysicsConfigs?: (
    | Partial<PhysicsLayoutOptions['physicsConfig']>
    | undefined
  )[];

  /** Initial positions for elements (optional) */
  initialPositions?: { x: number; y: number }[];

  // Deprecated/Old properties (remove or comment out if fully replaced)
  // gridColumns?: number; 
  // spacing?: number | { x: number; y: number }; 
  // containerSize?: { width: number; height: number }; 
  // stiffness?: number; 
  // damping?: number; 
  // mass?: number; 
  // friction?: number; 
  // itemPhysics?: PhysicsLayoutItemConfig[] | ((index: number, bodyId: string) => PhysicsLayoutItemConfig | undefined);
}

export interface PhysicsLayoutResult {
  // Function to apply to the container element (e.g., setting relative position)
  getContainerProps: () => Record<string, unknown>;
  // Function to get props for each individual item (position, ref)
  getItemProps: (index: number) => { 
    ref: React.RefCallback<HTMLElement | null>;
    style: React.CSSProperties;
  };
}

// --- Add other hook-related types below --- 

// ----------------------------------
// Magnetic Element Types (Task 3)
// ----------------------------------

/**
 * Configuration options for the useMagneticElement hook.
 */
export interface MagneticElementOptions {
  /** 
   * Strength of the magnetic force (0 to 1 recommended, but can be higher).
   * Higher values mean stronger attraction/repulsion. 
   */
  strength?: number; 
  /** Distance (px) from the element's center at which the magnetic effect starts. */
  radius?: number; 
  /** The mode of interaction: attract the pointer or repel it. */
  mode?: 'attract' | 'repel'; 
  /** 
   * Damping ratio for the spring physics (0 to 2 recommended).
   * Lower values (<1) are more bouncy, 1 is critically damped, higher values are sluggish.
   */
  damping?: number; 
  /** 
   * Stiffness (tension) for the spring physics.
   * Higher values result in faster, tighter movement.
   */
  stiffness?: number; 
   /** Mass for the spring physics. Higher values result in slower, heavier movement. */
  mass?: number;
  /** Coordinates relative to the element's container where the element should snap. */
  snapPoints?: { x: number; y: number }[]; 
  /** If true, the element itself will visually follow the pointer within its bounds. */
  followPointer?: boolean; 
  /** 
   * Animation configuration preset name (e.g., 'gentle', 'stiff') or a custom spring config object.
   * Used for the underlying spring physics.
   * Overrides damping, stiffness, mass if provided as an object.
   */
  animationConfig?: keyof typeof SpringPresets | SpringConfig;
  /** Maximum distance the element can be displaced by the magnetic effect. */
  maxDisplacement?: number;
  /** Whether the magnetic effect is disabled. */
  disabled?: boolean;
  /** Optional: Hint for adjusting animation intensity based on sensitivity level. Falls back to context. */
  motionSensitivityLevel?: MotionSensitivityLevel;
  /** Optional: Categorize the animation's purpose. */
  category?: AnimationCategory;
  /**
   * Directional field that modifies the magnetic force based on the angle.
   * Allows creating directional effects where the force is stronger in specific directions.
   */
  directionalField?: {
    /** The direction in degrees where the force is strongest (0 = right, 90 = down, etc.) */
    direction: number;
    /** How focused the directional effect is (higher = more focused in the given direction) */
    intensity: number;
    /** Shape of the directional field ('linear' = simple falloff, 'cosine' = smoother falloff) */
    shape?: 'linear' | 'cosine';
    /** Whether to invert the effect (strongest perpendicular to direction) */
    invert?: boolean;
  };
  /**
   * Link this magnetic element to other elements to create a multi-element system.
   * All linked elements will interact with each other based on the linkOptions.
   */
  linkedElements?: {
    /** Reference to the linked element's ref object */
    elementRef: React.RefObject<HTMLElement>;
    /** How strongly this element is influenced by the linked element */
    strength?: number;
    /** Maximum distance between elements where the link is active */
    maxDistance?: number;
    /** Whether the elements attract or repel each other */
    mode?: 'attract' | 'repel';
  }[];
}

// ----------------------------------
// Inertial Movement Types (Task 4)
// ----------------------------------

/** Options for the useInertialMovement hook. */
export interface InertialMovementOptions {
    /** Ref to the scrollable container element (optional, for bounds calculation). */
    containerRef?: RefObject<HTMLElement>;
    /** Ref to the draggable/scrollable content element. */
    contentRef: RefObject<HTMLElement>;
    /** Friction factor (0 to 1). Higher values mean faster deceleration. Default: 0.05 */
    friction?: number;
    /** Elasticity when hitting bounds (0 to 1). 0 = rigid stop, 1 = no energy loss. Default: 0.3 */
    bounceFactor?: number;
    /** Optional explicit boundaries { top, bottom, left, right }. */
    bounds?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
    /** Minimum velocity threshold to trigger inertial movement. Default: 0.1 */
    velocityThreshold?: number;
    /** Factor applied to the release velocity. Default: 1 */
    velocityFactor?: number;
    /** Maximum allowed velocity. Default: 3000 */
    maxVelocity?: number;
    /** Whether to disable the inertial movement. */
    disabled?: boolean;
    /** Axis to enable movement on. Default: 'both' */
    axis?: 'x' | 'y' | 'both';
}

/** State returned by useInertialMovement. */
export interface InertialMovementState {
    isDragging: boolean;
    isMoving: boolean; // Is currently moving due to inertia
    position: Vector2D; // Current translated position
    velocity: Vector2D; // Current velocity
}

/** Result returned by useInertialMovement. */
export interface InertialMovementResult {
    style: React.CSSProperties; // Style to apply to the content element
    state: InertialMovementState; // Current state
    reset: () => void; // Function to reset position
    stopMovement: () => void; // Function to stop any current inertial movement
}

// ----------------------------------
// Z-Space Types (Task 5)
// ----------------------------------

/** Options for the useZSpace hook. */
export interface ZSpaceOptions {
    /** Position along the Z-axis (px). Positive = closer, negative = further. Default: 0 */
    depth?: number;
    /** CSS perspective-origin property. Default: 'center center' */
    perspectiveOrigin?: string;
    /** CSS perspective property applied to the element itself (less common). Default: undefined */
    perspective?: number | string; 
    /** Apply perspective to the parent automatically? Requires parent to be positioned. Default: false */
    applyPerspectiveToParent?: boolean | number; // number applies specific perspective value
    /** Apply transform-style: preserve-3d to the element? Default: true */
    preserve3d?: boolean;
    /** Disable the effect. */
    disabled?: boolean;
    /** Enable auto-animation of Z-depth when scrolling */
    animateOnScroll?: boolean;
    /** Range of z-depth values when using animateOnScroll, e.g. [-50, 50] */
    scrollDepthRange?: [number, number];
    /** Threshold range in viewport percentage where animation begins/ends (0 to 1) */
    scrollThreshold?: [number, number];
    /** Link effects like blur to Z position */
    linkEffects?: {
        /** CSS filter blur amount linked to Z-position */
        blur?: {
            /** Range of blur values in pixels [min, max] */
            range: [number, number];
            /** Whether blur increases with negative Z (true) or positive Z (false) */
            invertZ?: boolean;
        };
        /** Scale element based on Z-position */
        scale?: {
            /** Range of scale values [min, max] */
            range: [number, number];
            /** Whether scale increases with positive Z (true) or negative Z (false) */
            invertZ?: boolean;
        };
        /** Opacity based on Z-position */
        opacity?: {
            /** Range of opacity values [min, max] */
            range: [number, number];
            /** Whether opacity increases with positive Z (true) or negative Z (false) */
            invertZ?: boolean;
        };
    };
}

/** Result returned by useZSpace. */
export interface ZSpaceResult {
    ref: RefObject<any>; // Generic ref type
    style: React.CSSProperties; // Style with transform and potentially perspective/origin
    parentStyle?: React.CSSProperties; // Optional style to apply to parent if applyPerspectiveToParent=true
}

// ----------------------------------
// 3D Transform Types (Task 5)
// ----------------------------------

/** Represents the state of a 3D transformation. */
export interface Transform3DState {
  translateX?: number; // px
  translateY?: number; // px
  translateZ?: number; // px
  rotateX?: number;    // degrees
  rotateY?: number;    // degrees
  rotateZ?: number;    // degrees
  scale?: number;      // unitless factor
  scaleX?: number;     // unitless factor
  scaleY?: number;     // unitless factor
  scaleZ?: number;     // unitless factor
}

/** Options for the use3DTransform hook. */
export interface Transform3DOptions {
  // Currently no specific options needed for basic version
  // Physics integration options would go here later.
  // usePhysics?: boolean;
  // animationConfig?: string | SpringConfig;
  disabled?: boolean;
}

/** Function signature for updating the transform state. */
export type SetTransform3D = (transform: Partial<Transform3DState>) => void;

/** Result returned by use3DTransform. */
export interface Transform3DResult {
    ref: RefObject<any>; // Generic ref type
    style: React.CSSProperties; // Style containing the combined transform
    setTransform: SetTransform3D; // Function to update the transform state
    currentTransform: Readonly<Transform3DState>; // Current state values
}

// ----------------------------------
// Parallax Scroll Types (Task 5)
// ----------------------------------

/** Options for the useParallaxScroll hook. */
export interface ParallaxScrollOptions {
    /** 
     * The parallax factor. 
     * 0 = no movement, 1 = moves with scroll, 
     * < 1 = moves slower (appears further away), 
     * > 1 = moves faster (appears closer).
     * Negative values create inverse parallax.
     * Default: 0.5 
     */
    factor?: number;
    /** The axis to apply the parallax effect on. Default: 'y' */
    axis?: 'x' | 'y';
    /** Disable the effect. */
    disabled?: boolean;
    /** Optional: Ref to a specific scroll container instead of window. */
    scrollContainerRef?: RefObject<HTMLElement>;
}

/** Result returned by useParallaxScroll. */
export interface ParallaxScrollResult {
    style: React.CSSProperties;
} 