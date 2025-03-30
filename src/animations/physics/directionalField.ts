/**
 * Directional Magnetic Fields
 * 
 * Provides interface and utilities for directional magnetic fields
 * and force modifiers for more sophisticated magnetic behaviors.
 */

import { ForceVector } from './magneticEffect';

/**
 * Field direction type determines how the force is applied
 */
export type FieldDirectionType = 
  | 'unidirectional'   // Force in one fixed direction only
  | 'bidirectional'    // Force along an axis (positive and negative)
  | 'radial'           // Force directed away from a center point
  | 'tangential'       // Force perpendicular to radial direction
  | 'flow'             // Force follows a flow field pattern
  | 'vortex'           // Force creates a vortex/spiral pattern
  | 'custom';          // Custom direction function

/**
 * Directional force behavior determines how forces respond to pointer
 */
export type DirectionalForceBehavior = 
  | 'constant'         // Force direction is constant
  | 'responsive'       // Force direction changes based on pointer
  | 'interactive'      // Force direction changes and intensity varies
  | 'distance-based'   // Force varies with distance
  | 'angle-based'      // Force varies with angle
  | 'custom';          // Custom behavior function

/**
 * Vector field point definition for flow fields
 */
export interface VectorFieldPoint {
  /**
   * X position in the field (0-1 normalized)
   */
  x: number;

  /**
   * Y position in the field (0-1 normalized)
   */
  y: number;

  /**
   * Force direction at this point
   */
  direction: ForceVector;

  /**
   * Optional strength multiplier at this point (1.0 by default)
   */
  strength?: number;
}

/**
 * Flow field definition for complex directional effects
 */
export interface FlowField {
  /**
   * Vector field points defining the flow field
   */
  points: VectorFieldPoint[];

  /**
   * Interpolation method between points
   */
  interpolation: 'nearest' | 'linear' | 'bilinear' | 'smooth';

  /**
   * Field resolution (how many rows/columns)
   */
  resolution: number;

  /**
   * If true, field wraps around at edges
   */
  wrap?: boolean;
}

/**
 * Directional field configuration
 */
export interface DirectionalFieldConfig {
  /**
   * Type of directional field
   */
  type: FieldDirectionType;

  /**
   * How the force behaves with interaction
   */
  behavior: DirectionalForceBehavior;

  /**
   * Base direction vector (normalized internally)
   */
  direction?: ForceVector;

  /**
   * Angle in degrees (used for bidirectional fields)
   */
  angle?: number;

  /**
   * Multiple directions for complex fields
   */
  directions?: ForceVector[];

  /**
   * Flow field definition for flow type
   */
  flowField?: FlowField;

  /**
   * Center point for radial and vortex fields (0.5, 0.5 is center)
   */
  center?: {
    x: number;
    y: number;
  };

  /**
   * Modifiers that affect the directional force
   */
  modifiers?: DirectionalForceModifier[];

  /**
   * Custom direction function as string (for 'custom' type)
   */
  customDirectionFunction?: string;

  /**
   * Custom behavior function as string (for 'custom' behavior)
   */
  customBehaviorFunction?: string;
}

/**
 * Force modifier types
 */
export type ForceModifierType = 
  | 'dampen'         // Reduce force based on a factor
  | 'amplify'        // Increase force based on a factor
  | 'threshold'      // Apply force only above threshold
  | 'cap'            // Limit maximum force
  | 'invert'         // Invert the force direction
  | 'oscillate'      // Apply periodic oscillation to force
  | 'noise'          // Apply noise to force
  | 'distort'        // Distort force direction
  | 'channel'        // Constrain force to channel/path
  | 'bias'           // Bias force in a particular direction
  | 'custom';        // Custom modifier function

/**
 * Directional force modifier
 */
export interface DirectionalForceModifier {
  /**
   * Type of modifier
   */
  type: ForceModifierType;

  /**
   * Strength or factor of modification (0-1)
   */
  factor: number;

  /**
   * Affects which component of the force
   */
  target: 'x' | 'y' | 'both' | 'magnitude' | 'direction';

  /**
   * Function for applying the modification
   */
  applyModifier: (force: ForceVector, pointerData: PointerData) => ForceVector;

  /**
   * Custom function as string (for 'custom' type)
   */
  customFunction?: string;

  /**
   * Additional parameters for specific modifiers
   */
  params?: Record<string, any>;
}

/**
 * Pointer data provided to direction and behavior functions
 */
export interface PointerData {
  /**
   * Pointer position relative to element
   */
  position: ForceVector;

  /**
   * Distance from element center
   */
  distance: number;

  /**
   * Normalized distance (0-1 where 1 is at field boundary)
   */
  normalizedDistance: number;

  /**
   * Angle from element center to pointer (radians)
   */
  angle: number;

  /**
   * Pointer velocity (when available)
   */
  velocity?: ForceVector;

  /**
   * Time elapsed since interaction start
   */
  elapsedTime: number;
}

/**
 * Result of directional field calculation
 */
export interface DirectionalForceResult {
  /**
   * The calculated force vector to apply
   */
  force: ForceVector;

  /**
   * Normalized force magnitude (0-1)
   */
  magnitude: number;

  /**
   * Force angle in radians
   */
  angle: number;

  /**
   * Modified pointer data after all calculations
   */
  pointerData: PointerData;
}

/**
 * Calculate a force vector based on a directional field
 *
 * @param config The directional field configuration
 * @param pointerData Data about the current pointer position
 * @returns Calculated force vector and metadata
 */
export function calculateDirectionalForce(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): DirectionalForceResult {
  // Implementation will be added in the implementation file
  return {
    force: { x: 0, y: 0 },
    magnitude: 0,
    angle: 0,
    pointerData
  };
} 