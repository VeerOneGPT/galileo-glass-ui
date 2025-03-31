/**
 * Magnetic Snap Points System
 * 
 * This system provides physics-based magnetic snap points for precise alignment of UI elements.
 * It allows elements to naturally "snap" to specified positions, guides, or grids, making
 * it easier for users to align elements precisely while maintaining the natural feel of
 * the Galileo Glass UI physics system.
 */

import { Vector2D } from './magneticUtils';

/**
 * Types of snap point behaviors
 */
export enum SnapPointType {
  POINT = 'point',       // Snap to exact coordinate points
  GRID = 'grid',         // Snap to grid intersections
  LINE = 'line',         // Snap to horizontal/vertical lines
  EDGE = 'edge',         // Snap to edges of other elements
  CENTER = 'center',     // Snap to centers of other elements
  CURVE = 'curve',       // Snap to a path/curve
  SPACING = 'spacing',   // Maintain equal spacing between elements
}

/**
 * Orientation for line-based snap guides
 */
export enum SnapOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  BOTH = 'both',
}

/**
 * Configuration for individual snap points
 */
export interface SnapPointConfig {
  id?: string;                   // Optional identifier for the snap point
  type: SnapPointType;           // Type of snap point
  position?: Vector2D;           // Position for point-based snapping
  orientation?: SnapOrientation; // Orientation for line-based snapping
  gridSize?: Vector2D;           // Cell size for grid-based snapping
  strength?: number;             // Magnetic strength (0.0-1.0)
  threshold?: number;            // Distance threshold for snap activation
  targets?: string[];            // IDs of elements this snap point affects (empty = all)
  zIndex?: number;               // Priority when multiple snap points are active
  disabled?: boolean;            // Whether this snap point is active
  metadata?: Record<string, any>; // Custom metadata for specific snap behaviors
}

/**
 * Event when a snap occurs
 */
export interface SnapEvent {
  elementId: string;             // ID of the element that snapped
  snapPointId: string;           // ID of the snap point
  position: Vector2D;            // Position where the snap occurred
  delta: Vector2D;               // Distance moved to snap
  type: SnapPointType;           // Type of snap that occurred
  timestamp: number;             // When the snap occurred
}

/**
 * Result of a snap point calculation
 */
export interface SnapResult {
  snapped: boolean;              // Whether a snap occurred
  position: Vector2D;            // Final position after snap calculation
  delta: Vector2D;               // Amount moved to snap
  snapPointId?: string;          // ID of the snap point if snapped
  snapType?: SnapPointType;      // Type of snap that occurred
  force: Vector2D;               // Resulting force from the snap
  strength: number;              // Strength of the snap (0.0-1.0)
  events: SnapEvent[];           // Snap events that occurred
}

/**
 * Global configuration for the snap system
 */
export interface SnapSystemConfig {
  enabled: boolean;              // Whether the snap system is active
  defaultThreshold: number;      // Default distance threshold for snapping
  defaultStrength: number;       // Default magnetic strength for snap points
  gridSize?: Vector2D;           // Default size for grid cells
  showGuides: boolean;           // Whether to display visual snap guides
  snapToGrid: boolean;           // Whether grid snapping is enabled
  snapToLines: boolean;          // Whether line snapping is enabled
  snapToPoints: boolean;         // Whether point snapping is enabled
  snapToElements: boolean;       // Whether element snapping is enabled
  guideColor?: string;           // Color for visual guides
  forceMultiplier: number;       // Scaling factor for snap forces
  requireModifierKey?: boolean;  // Require modifier key (e.g., Shift) for snapping
}

/**
 * Default system configuration
 */
export const DEFAULT_SNAP_CONFIG: SnapSystemConfig = {
  enabled: true,
  defaultThreshold: 10,
  defaultStrength: 0.7,
  gridSize: { x: 20, y: 20 },
  showGuides: true,
  snapToGrid: true,
  snapToLines: true,
  snapToPoints: true,
  snapToElements: true,
  guideColor: 'rgba(74, 108, 247, 0.7)',
  forceMultiplier: 1.0,
  requireModifierKey: false,
};

/**
 * Calculates the snap force for a point-type snap point
 */
export function calculatePointSnapForce(
  position: Vector2D,
  snapPoint: SnapPointConfig,
  config: SnapSystemConfig
): Vector2D {
  if (!snapPoint.position || !config.snapToPoints) {
    return { x: 0, y: 0 };
  }

  const threshold = snapPoint.threshold || config.defaultThreshold;
  const strength = snapPoint.strength || config.defaultStrength;
  
  // Calculate distance to snap point
  const dx = snapPoint.position.x - position.x;
  const dy = snapPoint.position.y - position.y;
  const distanceSquared = dx * dx + dy * dy;
  const distance = Math.sqrt(distanceSquared);
  
  // If within threshold, calculate force
  if (distance <= threshold) {
    // Force gets stronger as distance decreases
    const forceMagnitude = strength * (1 - distance / threshold) * config.forceMultiplier;
    
    // Direction is towards the snap point
    if (distance === 0) {
      return { x: 0, y: 0 }; // Already at snap point
    }
    
    return {
      x: dx / distance * forceMagnitude,
      y: dy / distance * forceMagnitude
    };
  }
  
  return { x: 0, y: 0 };
}

/**
 * Calculates the snap force for a grid-type snap point
 */
export function calculateGridSnapForce(
  position: Vector2D,
  snapPoint: SnapPointConfig,
  config: SnapSystemConfig
): Vector2D {
  if (!config.snapToGrid) {
    return { x: 0, y: 0 };
  }

  const gridSize = snapPoint.gridSize || config.gridSize || { x: 20, y: 20 };
  const threshold = snapPoint.threshold || config.defaultThreshold;
  const strength = snapPoint.strength || config.defaultStrength;
  
  // Find nearest grid points
  const gridX = Math.round(position.x / gridSize.x) * gridSize.x;
  const gridY = Math.round(position.y / gridSize.y) * gridSize.y;
  
  // Calculate distances to nearest grid lines
  const distX = Math.abs(position.x - gridX);
  const distY = Math.abs(position.y - gridY);
  
  // Calculate forces if within threshold
  let forceX = 0;
  let forceY = 0;
  
  if (distX <= threshold) {
    // Force increases as distance decreases
    const forceMagnitude = strength * (1 - distX / threshold) * config.forceMultiplier;
    forceX = (gridX - position.x) / distX * forceMagnitude;
  }
  
  if (distY <= threshold) {
    const forceMagnitude = strength * (1 - distY / threshold) * config.forceMultiplier;
    forceY = (gridY - position.y) / distY * forceMagnitude;
  }
  
  return { x: forceX, y: forceY };
}

/**
 * Calculates the snap force for a line-type snap point
 */
export function calculateLineSnapForce(
  position: Vector2D,
  snapPoint: SnapPointConfig,
  config: SnapSystemConfig
): Vector2D {
  if (!config.snapToLines || !snapPoint.position) {
    return { x: 0, y: 0 };
  }

  const threshold = snapPoint.threshold || config.defaultThreshold;
  const strength = snapPoint.strength || config.defaultStrength;
  const orientation = snapPoint.orientation || SnapOrientation.BOTH;
  
  let forceX = 0;
  let forceY = 0;
  
  // Snap to horizontal line
  if (orientation === SnapOrientation.HORIZONTAL || orientation === SnapOrientation.BOTH) {
    const distY = Math.abs(position.y - snapPoint.position.y);
    
    if (distY <= threshold) {
      const forceMagnitude = strength * (1 - distY / threshold) * config.forceMultiplier;
      forceY = (snapPoint.position.y - position.y) / (distY || 1) * forceMagnitude;
    }
  }
  
  // Snap to vertical line
  if (orientation === SnapOrientation.VERTICAL || orientation === SnapOrientation.BOTH) {
    const distX = Math.abs(position.x - snapPoint.position.x);
    
    if (distX <= threshold) {
      const forceMagnitude = strength * (1 - distX / threshold) * config.forceMultiplier;
      forceX = (snapPoint.position.x - position.x) / (distX || 1) * forceMagnitude;
    }
  }
  
  return { x: forceX, y: forceY };
}

/**
 * Calculates the snap force for an element edge snap point
 */
export function calculateEdgeSnapForce(
  position: Vector2D,
  elementRect: DOMRect,
  targetRect: DOMRect,
  snapPoint: SnapPointConfig,
  config: SnapSystemConfig
): Vector2D {
  if (!config.snapToElements) {
    return { x: 0, y: 0 };
  }

  const threshold = snapPoint.threshold || config.defaultThreshold;
  const strength = snapPoint.strength || config.defaultStrength;
  
  // Calculate element edges
  const element = {
    left: position.x,
    right: position.x + elementRect.width,
    top: position.y,
    bottom: position.y + elementRect.height,
    centerX: position.x + elementRect.width / 2,
    centerY: position.y + elementRect.height / 2
  };
  
  // Calculate target edges
  const target = {
    left: targetRect.left,
    right: targetRect.right,
    top: targetRect.top,
    bottom: targetRect.bottom,
    centerX: targetRect.left + targetRect.width / 2,
    centerY: targetRect.top + targetRect.height / 2
  };
  
  // Check all possible edge alignments
  const alignments = [
    // Left edge alignments
    { dist: Math.abs(element.left - target.left), alignX: target.left, alignY: null },
    { dist: Math.abs(element.left - target.right), alignX: target.right, alignY: null },
    
    // Right edge alignments
    { dist: Math.abs(element.right - target.left), alignX: target.left - elementRect.width, alignY: null },
    { dist: Math.abs(element.right - target.right), alignX: target.right - elementRect.width, alignY: null },
    
    // Top edge alignments
    { dist: Math.abs(element.top - target.top), alignX: null, alignY: target.top },
    { dist: Math.abs(element.top - target.bottom), alignX: null, alignY: target.bottom },
    
    // Bottom edge alignments
    { dist: Math.abs(element.bottom - target.top), alignX: null, alignY: target.top - elementRect.height },
    { dist: Math.abs(element.bottom - target.bottom), alignX: null, alignY: target.bottom - elementRect.height },
    
    // Center alignments
    { dist: Math.abs(element.centerX - target.centerX), alignX: target.centerX - elementRect.width / 2, alignY: null },
    { dist: Math.abs(element.centerY - target.centerY), alignX: null, alignY: target.centerY - elementRect.height / 2 }
  ];
  
  // Find the closest alignment within threshold
  const forceX = 0;
  const forceY = 0;
  let closestX = null;
  let closestY = null;
  let minDistX = threshold;
  let minDistY = threshold;
  
  for (const align of alignments) {
    if (align.dist <= threshold) {
      if (align.alignX !== null && align.dist < minDistX) {
        minDistX = align.dist;
        closestX = align.alignX;
      }
      if (align.alignY !== null && align.dist < minDistY) {
        minDistY = align.dist;
        closestY = align.alignY;
      }
    }
  }
  
  // Calculate forces for the closest alignments
  let forceVectorX = 0;
  let forceVectorY = 0;
  
  if (closestX !== null) {
    const distX = Math.abs(position.x - closestX);
    const forceMagnitude = strength * (1 - distX / threshold) * config.forceMultiplier;
    forceVectorX = (closestX - position.x) / (distX || 1) * forceMagnitude;
  }
  
  if (closestY !== null) {
    const distY = Math.abs(position.y - closestY);
    const forceMagnitude = strength * (1 - distY / threshold) * config.forceMultiplier;
    forceVectorY = (closestY - position.y) / (distY || 1) * forceMagnitude;
  }
  
  return { x: forceVectorX, y: forceVectorY };
}

/**
 * Compose multiple snap forces into a single resultant force
 */
export function composeSnapForces(forces: Vector2D[]): Vector2D {
  return forces.reduce(
    (result, force) => ({ x: result.x + force.x, y: result.y + force.y }),
    { x: 0, y: 0 }
  );
}

/**
 * Calculate the final position after applying snap forces
 */
export function calculateSnapPosition(
  position: Vector2D,
  force: Vector2D,
  strength = 1.0
): Vector2D {
  return {
    x: position.x + force.x * strength,
    y: position.y + force.y * strength
  };
}

/**
 * Process a single snap calculation
 */
export function processElementSnap(
  elementId: string,
  position: Vector2D,
  snapPoints: SnapPointConfig[],
  config: SnapSystemConfig,
  elementRect?: DOMRect,
  targetRects?: Map<string, DOMRect>
): SnapResult {
  if (!config.enabled) {
    return {
      snapped: false,
      position: { ...position },
      delta: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      strength: 0,
      events: []
    };
  }
  
  const forces: Vector2D[] = [];
  const events: SnapEvent[] = [];

  // Filter snap points that apply to this element
  const applicableSnapPoints = snapPoints.filter(sp => 
    !sp.disabled && (!sp.targets || sp.targets.length === 0 || sp.targets.includes(elementId))
  );
  
  // Calculate forces for each applicable snap point
  for (const snapPoint of applicableSnapPoints) {
    let force: Vector2D = { x: 0, y: 0 };
    
    switch (snapPoint.type) {
      case SnapPointType.POINT:
        force = calculatePointSnapForce(position, snapPoint, config);
        break;
        
      case SnapPointType.GRID:
        force = calculateGridSnapForce(position, snapPoint, config);
        break;
        
      case SnapPointType.LINE:
        force = calculateLineSnapForce(position, snapPoint, config);
        break;
        
      case SnapPointType.EDGE:
      case SnapPointType.CENTER:
        if (elementRect && targetRects && snapPoint.metadata?.targetId) {
          const targetRect = targetRects.get(snapPoint.metadata.targetId);
          if (targetRect) {
            force = calculateEdgeSnapForce(position, elementRect, targetRect, snapPoint, config);
          }
        }
        break;
        
      // Add more snap types as needed
    }
    
    // If a force was generated, add it to the list
    if (force.x !== 0 || force.y !== 0) {
      forces.push(force);
      
      // Record the snap event
      events.push({
        elementId,
        snapPointId: snapPoint.id || 'unknown',
        position: { ...position },
        delta: force,
        type: snapPoint.type,
        timestamp: Date.now()
      });
    }
  }
  
  // Compose forces and calculate final position
  const resultantForce = composeSnapForces(forces);
  const newPosition = calculateSnapPosition(position, resultantForce);
  
  // Calculate movement delta
  const delta = {
    x: newPosition.x - position.x,
    y: newPosition.y - position.y
  };
  
  // Determine if snapping occurred
  const snapped = delta.x !== 0 || delta.y !== 0;
  
  // Determine strength of snap (magnitude of force)
  const strength = Math.sqrt(resultantForce.x * resultantForce.x + resultantForce.y * resultantForce.y);
  
  // Create result object
  return {
    snapped,
    position: newPosition,
    delta,
    force: resultantForce,
    strength,
    snapPointId: events.length > 0 ? events[0].snapPointId : undefined,
    snapType: events.length > 0 ? events[0].type : undefined,
    events
  };
}