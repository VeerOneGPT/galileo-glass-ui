import React from 'react';
import { Vector2D } from '../animations/physics/engineTypes'; // Adjust path as needed

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