/**
 * Directional Magnetic Fields Implementation
 * 
 * Provides implementation details for directional magnetic fields
 * and force modifiers for more sophisticated magnetic behaviors.
 */

import { 
  DirectionalFieldConfig, 
  PointerData, 
  DirectionalForceResult,
  DirectionalForceModifier,
  FlowField,
  VectorFieldPoint,
  ForceModifierType
} from './directionalField';
import { ForceVector } from './magneticEffect';

/**
 * Normalize a vector to have a magnitude of 1
 */
export function normalizeVector(vector: ForceVector): ForceVector {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  };
}

/**
 * Calculate the magnitude of a vector
 */
export function vectorMagnitude(vector: ForceVector): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

/**
 * Scale a vector by a factor
 */
export function scaleVector(vector: ForceVector, scale: number): ForceVector {
  return {
    x: vector.x * scale,
    y: vector.y * scale
  };
}

/**
 * Get the angle of a vector in radians
 */
export function vectorAngle(vector: ForceVector): number {
  return Math.atan2(vector.y, vector.x);
}

/**
 * Create a vector from angle and magnitude
 */
export function vectorFromAngle(angle: number, magnitude = 1): ForceVector {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude
  };
}

/**
 * Rotate a vector by an angle in radians
 */
export function rotateVector(vector: ForceVector, angle: number): ForceVector {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos
  };
}

/**
 * Add two vectors together
 */
export function addVectors(a: ForceVector, b: ForceVector): ForceVector {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

/**
 * Calculate a unidirectional force
 */
function calculateUnidirectionalForce(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): ForceVector {
  // Default direction is to the right if not specified
  const direction = config.direction || { x: 1, y: 0 };
  const normalizedDirection = normalizeVector(direction);
  
  // Calculate force magnitude based on behavior
  let magnitude = 1.0;
  
  switch (config.behavior) {
    case 'distance-based':
      // Force decreases with distance
      magnitude = 1.0 - pointerData.normalizedDistance;
      break;
    case 'responsive':
      // Force responds to pointer direction
      const pointerDirection = normalizeVector(pointerData.position);
      const dotProduct = pointerDirection.x * normalizedDirection.x + 
                         pointerDirection.y * normalizedDirection.y;
      magnitude = Math.max(0, dotProduct);
      break;
    case 'interactive':
      // Force responds to both distance and direction
      const interactiveMagnitude = 1.0 - pointerData.normalizedDistance;
      const pointerDir = normalizeVector(pointerData.position);
      const dot = pointerDir.x * normalizedDirection.x + 
                  pointerDir.y * normalizedDirection.y;
      magnitude = interactiveMagnitude * Math.max(0, dot);
      break;
    case 'angle-based':
      // Force varies based on angle between pointer and force direction
      const pointerAngle = vectorAngle(pointerData.position);
      const directionAngle = vectorAngle(normalizedDirection);
      const angleDiff = Math.abs(pointerAngle - directionAngle);
      const normalizedAngleDiff = angleDiff / Math.PI;
      magnitude = 1.0 - normalizedAngleDiff;
      break;
    case 'constant':
    default:
      // Constant force regardless of pointer
      magnitude = 1.0;
      break;
  }
  
  // Return the force vector
  return scaleVector(normalizedDirection, magnitude);
}

/**
 * Calculate a bidirectional force
 */
function calculateBidirectionalForce(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): ForceVector {
  // Use angle if provided, otherwise default to horizontal axis
  const angle = config.angle !== undefined 
    ? (config.angle * Math.PI / 180) 
    : 0;
  
  // Create axis vector
  const axisVector = vectorFromAngle(angle);
  
  // Project pointer position onto the axis
  const dotProduct = pointerData.position.x * axisVector.x + 
                    pointerData.position.y * axisVector.y;
  
  // Calculate magnitude based on behavior
  let magnitude = 0;
  const sign = Math.sign(dotProduct) || 1; // Default to positive if zero
  
  switch (config.behavior) {
    case 'distance-based':
      magnitude = (1.0 - pointerData.normalizedDistance) * Math.abs(dotProduct);
      break;
    case 'responsive':
      magnitude = Math.abs(dotProduct);
      break;
    case 'interactive':
      magnitude = (1.0 - pointerData.normalizedDistance) * Math.abs(dotProduct);
      break;
    case 'angle-based':
      const projectedVector = scaleVector(axisVector, dotProduct);
      const projectionMagnitude = vectorMagnitude(projectedVector);
      magnitude = projectionMagnitude;
      break;
    case 'constant':
    default:
      magnitude = sign === 0 ? 0 : 1.0;
      break;
  }
  
  // Scale the axis vector
  return scaleVector(axisVector, magnitude * sign);
}

/**
 * Calculate a radial force (away from center)
 */
function calculateRadialForce(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): ForceVector {
  // Get center point (default to center of element)
  const center = config.center || { x: 0.5, y: 0.5 };
  
  // Calculate vector from center to pointer position
  const deltaX = pointerData.position.x - center.x;
  const deltaY = pointerData.position.y - center.y;
  
  // Create radial vector (pointing away from center)
  const radialVector = normalizeVector({
    x: deltaX,
    y: deltaY
  });
  
  // Calculate magnitude based on behavior
  let magnitude = 1.0;
  
  switch (config.behavior) {
    case 'distance-based':
      // Stronger near center, weaker at edges
      magnitude = 1.0 - pointerData.normalizedDistance;
      break;
    case 'responsive':
      // Responds to how direct the pointer is from center
      magnitude = pointerData.normalizedDistance;
      break;
    case 'interactive':
      // Peaks at middle distance
      magnitude = 1.0 - Math.abs(pointerData.normalizedDistance - 0.5) * 2;
      break;
    case 'angle-based':
      // Based on angle sectors
      const angle = vectorAngle(radialVector);
      const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
      magnitude = Math.sin(normalizedAngle * 4 * Math.PI) * 0.5 + 0.5;
      break;
    case 'constant':
    default:
      magnitude = 1.0;
      break;
  }
  
  // Return the scaled radial vector
  return scaleVector(radialVector, magnitude);
}

/**
 * Calculate a tangential force (perpendicular to radial)
 */
function calculateTangentialForce(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): ForceVector {
  // First get the radial vector
  const radialVector = calculateRadialForce(config, pointerData);
  
  // Rotate by 90 degrees to get tangential vector
  const tangentialVector = {
    x: -radialVector.y,
    y: radialVector.x
  };
  
  // Scale by the same magnitude calculation
  const magnitude = vectorMagnitude(radialVector);
  
  // Return the scaled tangential vector
  return scaleVector(tangentialVector, magnitude);
}

/**
 * Calculate a vortex force (like a whirlpool)
 */
function calculateVortexForce(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): ForceVector {
  // Get center point (default to center of element)
  const center = config.center || { x: 0.5, y: 0.5 };
  
  // Calculate normalized coordinates relative to center (-1 to 1)
  const normalizedX = (pointerData.position.x / pointerData.distance) * 2 - center.x * 2;
  const normalizedY = (pointerData.position.y / pointerData.distance) * 2 - center.y * 2;
  
  // Create radial vector (pointing away from center)
  const radialVector = normalizeVector({
    x: normalizedX,
    y: normalizedY
  });
  
  // Get tangential component (perpendicular to radial)
  const tangentialVector = {
    x: -radialVector.y,
    y: radialVector.x
  };
  
  // Calculate radial and tangential components based on distance
  let radialComponent = 0;
  let tangentialComponent = 0;
  
  switch (config.behavior) {
    case 'distance-based':
      // More tangential near center, more radial near edge
      radialComponent = pointerData.normalizedDistance;
      tangentialComponent = 1.0 - pointerData.normalizedDistance;
      break;
    case 'responsive':
      // Always tangential but strength varies with distance
      radialComponent = 0;
      tangentialComponent = 1.0 - pointerData.normalizedDistance;
      break;
    case 'interactive':
      // Mix of both based on distance
      radialComponent = Math.pow(pointerData.normalizedDistance, 2);
      tangentialComponent = Math.sin(pointerData.normalizedDistance * Math.PI);
      break;
    case 'angle-based':
      // Components vary based on angle
      const angle = pointerData.angle;
      radialComponent = Math.abs(Math.cos(angle * 2));
      tangentialComponent = Math.abs(Math.sin(angle * 2));
      break;
    case 'constant':
    default:
      // Fixed mix of radial and tangential
      radialComponent = 0.3;
      tangentialComponent = 0.7;
      break;
  }
  
  // Combine components
  return {
    x: radialVector.x * radialComponent + tangentialVector.x * tangentialComponent,
    y: radialVector.y * radialComponent + tangentialVector.y * tangentialComponent
  };
}

/**
 * Calculate a flow field force based on vector field sampling
 */
function calculateFlowFieldForce(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): ForceVector {
  // Ensure flow field is defined
  if (!config.flowField) {
    return { x: 0, y: 0 }; // Default to no force if flow field is missing
  }
  
  const { points, interpolation, resolution, wrap = false } = config.flowField;
  
  // Normalize pointer position to field coordinates (0-1)
  const normalizedX = pointerData.position.x;
  const normalizedY = pointerData.position.y;
  
  // Determine force based on interpolation method
  switch (interpolation) {
    case 'nearest':
      return getNearestFieldVector(points, normalizedX, normalizedY, wrap);
    case 'bilinear':
      return getBilinearFieldVector(points, normalizedX, normalizedY, resolution, wrap);
    case 'smooth':
      return getSmoothFieldVector(points, normalizedX, normalizedY, resolution, wrap);
    case 'linear':
    default:
      return getLinearFieldVector(points, normalizedX, normalizedY, wrap);
  }
}

/**
 * Get nearest vector field point
 */
function getNearestFieldVector(
  points: VectorFieldPoint[],
  x: number,
  y: number,
  wrap: boolean
): ForceVector {
  if (points.length === 0) return { x: 0, y: 0 };
  
  // Find nearest point
  let nearestPoint = points[0];
  let minDistance = Math.pow(x - nearestPoint.x, 2) + Math.pow(y - nearestPoint.y, 2);
  
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    
    // Handle wrapping if enabled
    let pointX = point.x;
    let pointY = point.y;
    
    if (wrap) {
      // Check wrapped distances
      if (Math.abs(pointX - x) > 0.5) {
        pointX = pointX > 0.5 ? pointX - 1 : pointX + 1;
      }
      if (Math.abs(pointY - y) > 0.5) {
        pointY = pointY > 0.5 ? pointY - 1 : pointY + 1;
      }
    }
    
    const distance = Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }
  
  // Apply strength multiplier if available
  const strength = nearestPoint.strength !== undefined ? nearestPoint.strength : 1.0;
  return scaleVector(nearestPoint.direction, strength);
}

/**
 * Linear interpolation between two values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Linear interpolation between two vectors
 */
function lerpVector(a: ForceVector, b: ForceVector, t: number): ForceVector {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t)
  };
}

/**
 * Get linear interpolated vector field
 */
function getLinearFieldVector(
  points: VectorFieldPoint[],
  x: number,
  y: number,
  wrap: boolean
): ForceVector {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return scaleVector(points[0].direction, points[0].strength || 1.0);
  
  // Find two nearest points
  let nearest = { index: 0, distance: Number.MAX_VALUE };
  let secondNearest = { index: 0, distance: Number.MAX_VALUE };
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    
    // Handle wrapping if enabled
    let pointX = point.x;
    let pointY = point.y;
    
    if (wrap) {
      // Check wrapped distances
      if (Math.abs(pointX - x) > 0.5) {
        pointX = pointX > 0.5 ? pointX - 1 : pointX + 1;
      }
      if (Math.abs(pointY - y) > 0.5) {
        pointY = pointY > 0.5 ? pointY - 1 : pointY + 1;
      }
    }
    
    const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
    
    if (distance < nearest.distance) {
      secondNearest = nearest;
      nearest = { index: i, distance };
    } else if (distance < secondNearest.distance) {
      secondNearest = { index: i, distance };
    }
  }
  
  // If both points are the same, return that vector
  if (nearest.distance === secondNearest.distance) {
    const point = points[nearest.index];
    return scaleVector(point.direction, point.strength || 1.0);
  }
  
  // Calculate weights based on distances
  const totalDistance = nearest.distance + secondNearest.distance;
  const weight = totalDistance > 0 ? secondNearest.distance / totalDistance : 0.5;
  
  // Interpolate between the two vectors
  const pointA = points[nearest.index];
  const pointB = points[secondNearest.index];
  
  const vectorA = scaleVector(pointA.direction, pointA.strength || 1.0);
  const vectorB = scaleVector(pointB.direction, pointB.strength || 1.0);
  
  return lerpVector(vectorA, vectorB, weight);
}

/**
 * Get bilinear interpolated vector field
 */
function getBilinearFieldVector(
  points: VectorFieldPoint[],
  x: number,
  y: number,
  resolution: number,
  wrap: boolean
): ForceVector {
  if (points.length === 0) return { x: 0, y: 0 };
  
  // Convert normalized coordinates to grid coordinates
  const gridX = Math.floor(x * resolution);
  const gridY = Math.floor(y * resolution);
  
  // Calculate grid cell corners
  const x0 = gridX / resolution;
  const y0 = gridY / resolution;
  const x1 = (gridX + 1) / resolution;
  const y1 = (gridY + 1) / resolution;
  
  // Find the four corner points
  const corners = [
    { x: x0, y: y0 }, // Top-left
    { x: x1, y: y0 }, // Top-right
    { x: x0, y: y1 }, // Bottom-left
    { x: x1, y: y1 }  // Bottom-right
  ];
  
  // Find nearest field points to each corner
  const cornerVectors: ForceVector[] = corners.map(corner => {
    // Find nearest field point
    let nearestPoint = points[0];
    let minDistance = Number.MAX_VALUE;
    
    for (const point of points) {
      // Handle wrapping if enabled
      let pointX = point.x;
      let pointY = point.y;
      
      if (wrap) {
        // Check wrapped distances
        if (Math.abs(pointX - corner.x) > 0.5) {
          pointX = pointX > 0.5 ? pointX - 1 : pointX + 1;
        }
        if (Math.abs(pointY - corner.y) > 0.5) {
          pointY = pointY > 0.5 ? pointY - 1 : pointY + 1;
        }
      }
      
      const distance = Math.pow(corner.x - pointX, 2) + Math.pow(corner.y - pointY, 2);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }
    
    return scaleVector(nearestPoint.direction, nearestPoint.strength || 1.0);
  });
  
  // Calculate interpolation factors
  const tx = (x - x0) / (x1 - x0);
  const ty = (y - y0) / (y1 - y0);
  
  // Perform bilinear interpolation
  const topVector = lerpVector(cornerVectors[0], cornerVectors[1], tx);
  const bottomVector = lerpVector(cornerVectors[2], cornerVectors[3], tx);
  
  return lerpVector(topVector, bottomVector, ty);
}

/**
 * Smooth interpolation function (cubic)
 */
function smoothstep(a: number, b: number, t: number): number {
  // Clamp t to 0-1
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  // Smoothstep formula
  return t * t * (3 - 2 * t);
}

/**
 * Get smooth interpolated vector field
 */
function getSmoothFieldVector(
  points: VectorFieldPoint[],
  x: number,
  y: number,
  resolution: number,
  wrap: boolean
): ForceVector {
  // Same implementation as bilinear, but with smoothstep
  if (points.length === 0) return { x: 0, y: 0 };
  
  // Convert normalized coordinates to grid coordinates
  const gridX = Math.floor(x * resolution);
  const gridY = Math.floor(y * resolution);
  
  // Calculate grid cell corners
  const x0 = gridX / resolution;
  const y0 = gridY / resolution;
  const x1 = (gridX + 1) / resolution;
  const y1 = (gridY + 1) / resolution;
  
  // Find the four corner points
  const corners = [
    { x: x0, y: y0 }, // Top-left
    { x: x1, y: y0 }, // Top-right
    { x: x0, y: y1 }, // Bottom-left
    { x: x1, y: y1 }  // Bottom-right
  ];
  
  // Find nearest field points to each corner
  const cornerVectors: ForceVector[] = corners.map(corner => {
    // Find nearest field point
    let nearestPoint = points[0];
    let minDistance = Number.MAX_VALUE;
    
    for (const point of points) {
      // Handle wrapping if enabled
      let pointX = point.x;
      let pointY = point.y;
      
      if (wrap) {
        // Check wrapped distances
        if (Math.abs(pointX - corner.x) > 0.5) {
          pointX = pointX > 0.5 ? pointX - 1 : pointX + 1;
        }
        if (Math.abs(pointY - corner.y) > 0.5) {
          pointY = pointY > 0.5 ? pointY - 1 : pointY + 1;
        }
      }
      
      const distance = Math.pow(corner.x - pointX, 2) + Math.pow(corner.y - pointY, 2);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }
    
    return scaleVector(nearestPoint.direction, nearestPoint.strength || 1.0);
  });
  
  // Calculate smooth interpolation factors
  const tx = smoothstep(x0, x1, x);
  const ty = smoothstep(y0, y1, y);
  
  // Perform bilinear interpolation with smoothstep
  const topVector = lerpVector(cornerVectors[0], cornerVectors[1], tx);
  const bottomVector = lerpVector(cornerVectors[2], cornerVectors[3], tx);
  
  return lerpVector(topVector, bottomVector, ty);
}

/**
 * Apply a force modifier to the vector
 */
function applyForceModifier(
  force: ForceVector,
  modifier: DirectionalForceModifier,
  pointerData: PointerData
): ForceVector {
  // Extract modifier properties
  const { type, factor, target } = modifier;
  
  // Apply modifier based on type
  switch (type) {
    case 'dampen':
      // Reduce force strength
      return target === 'x' 
        ? { x: force.x * (1 - factor), y: force.y }
        : target === 'y'
          ? { x: force.x, y: force.y * (1 - factor) }
          : scaleVector(force, 1 - factor);
    
    case 'amplify':
      // Increase force strength
      return target === 'x'
        ? { x: force.x * (1 + factor), y: force.y }
        : target === 'y'
          ? { x: force.x, y: force.y * (1 + factor) }
          : scaleVector(force, 1 + factor);
    
    case 'threshold':
      // Apply force only above threshold
      const magnitude = vectorMagnitude(force);
      if (magnitude < factor) {
        return { x: 0, y: 0 };
      }
      return force;
    
    case 'cap':
      // Limit maximum force
      const mag = vectorMagnitude(force);
      if (mag > factor) {
        return scaleVector(normalizeVector(force), factor);
      }
      return force;
    
    case 'invert':
      // Invert force direction
      return target === 'x'
        ? { x: -force.x, y: force.y }
        : target === 'y'
          ? { x: force.x, y: -force.y }
          : { x: -force.x, y: -force.y };
    
    case 'oscillate':
      // Apply periodic oscillation to force
      const time = pointerData.elapsedTime / 1000; // Convert to seconds
      const frequency = modifier.params?.frequency || 1;
      const amplitude = factor;
      const oscillation = Math.sin(time * frequency * 2 * Math.PI) * amplitude;
      
      return target === 'x'
        ? { x: force.x * (1 + oscillation), y: force.y }
        : target === 'y'
          ? { x: force.x, y: force.y * (1 + oscillation) }
          : scaleVector(force, 1 + oscillation);
    
    case 'noise':
      // Add random noise to force
      const noise = (Math.random() * 2 - 1) * factor;
      
      return target === 'x'
        ? { x: force.x * (1 + noise), y: force.y }
        : target === 'y'
          ? { x: force.x, y: force.y * (1 + noise) }
          : scaleVector(force, 1 + noise);
    
    case 'distort':
      // Distort force direction
      const angle = vectorAngle(force);
      const distortion = (Math.random() * 2 - 1) * factor * Math.PI;
      return vectorFromAngle(angle + distortion, vectorMagnitude(force));
    
    case 'channel':
      // Constrain force to a channel/path
      const channelAngle = modifier.params?.angle !== undefined
        ? modifier.params.angle * Math.PI / 180
        : 0; // Default horizontal
      
      // Project force onto channel direction
      const channelVector = vectorFromAngle(channelAngle);
      const projection = force.x * channelVector.x + force.y * channelVector.y;
      
      // Mix original force with channeled force based on factor
      const channeled = scaleVector(channelVector, projection);
      return {
        x: force.x * (1 - factor) + channeled.x * factor,
        y: force.y * (1 - factor) + channeled.y * factor
      };
    
    case 'bias':
      // Bias force in a particular direction
      const biasAngle = modifier.params?.angle !== undefined
        ? modifier.params.angle * Math.PI / 180
        : 0; // Default right
      
      const biasVector = vectorFromAngle(biasAngle);
      
      // Mix original force with bias force based on factor
      return {
        x: force.x * (1 - factor) + biasVector.x * factor,
        y: force.y * (1 - factor) + biasVector.y * factor
      };
    
    case 'custom':
      // Use custom modification function
      if (modifier.applyModifier) {
        return modifier.applyModifier(force, pointerData);
      }
      return force;
    
    default:
      return force;
  }
}

/**
 * Apply custom field behavior using a provided function
 */
function applyCustomFieldBehavior(
  config: DirectionalFieldConfig,
  pointerData: PointerData
): ForceVector {
  // For custom field behavior, try to evaluate the custom function
  // if available, otherwise return a default force
  try {
    if (config.customDirectionFunction) {
      // Create a function from the string (note: this is unsafe in production!)
      // In a real implementation, you would use a secure evaluation mechanism
      // eslint-disable-next-line no-new-func
      const customFn = new Function('pointerData', 'config', config.customDirectionFunction);
      return customFn(pointerData, config) as ForceVector;
    }
  } catch (error) {
    console.error('Error evaluating custom direction function:', error);
  }
  
  // Default to a simple attraction force if custom function fails
  return {
    x: pointerData.position.x * 0.5,
    y: pointerData.position.y * 0.5
  };
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
  // Calculate the base force vector based on field type
  let force: ForceVector;
  
  switch (config.type) {
    case 'unidirectional':
      force = calculateUnidirectionalForce(config, pointerData);
      break;
    case 'bidirectional':
      force = calculateBidirectionalForce(config, pointerData);
      break;
    case 'radial':
      force = calculateRadialForce(config, pointerData);
      break;
    case 'tangential':
      force = calculateTangentialForce(config, pointerData);
      break;
    case 'vortex':
      force = calculateVortexForce(config, pointerData);
      break;
    case 'flow':
      force = calculateFlowFieldForce(config, pointerData);
      break;
    case 'custom':
      force = applyCustomFieldBehavior(config, pointerData);
      break;
    default:
      force = { x: 0, y: 0 };
  }
  
  // Apply modifiers if any
  if (config.modifiers && config.modifiers.length > 0) {
    for (const modifier of config.modifiers) {
      force = applyForceModifier(force, modifier, pointerData);
    }
  }
  
  // Calculate magnitude and angle for the final force
  const magnitude = vectorMagnitude(force);
  const angle = vectorAngle(force);
  
  // Return the final result
  return {
    force,
    magnitude,
    angle,
    pointerData
  };
} 