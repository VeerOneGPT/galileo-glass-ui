/**
 * Utility functions for magnetic effect calculations
 */

import { FieldShape, FieldDecayFunction } from './magneticEffect';

/**
 * 2D vector interface
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Calculate the distance between two points
 */
export const distance = (a: Vector2D, b: Vector2D): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Normalize a vector to unit length (magnitude of 1)
 */
export const normalize = (v: Vector2D): Vector2D => {
  const magnitude = Math.sqrt(v.x * v.x + v.y * v.y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return {
    x: v.x / magnitude,
    y: v.y / magnitude
  };
};

/**
 * Scale a vector by a factor
 */
export const scale = (v: Vector2D, factor: number): Vector2D => {
  return {
    x: v.x * factor,
    y: v.y * factor
  };
};

/**
 * Add two vectors
 */
export const add = (a: Vector2D, b: Vector2D): Vector2D => {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
};

/**
 * Calculate the normalized distance based on field shape
 * @returns A value from 0 to 1, where 0 is at the center and 1 is at the edge of the field
 */
export const calculateFieldDistance = (
  elementPosition: Vector2D,
  mousePosition: Vector2D,
  options: {
    fieldShape: FieldShape;
    radius: number;
    fieldWidth?: number;
    fieldHeight?: number;
    fieldRotation?: number;
  }
): number => {
  const { fieldShape, radius, fieldWidth = radius * 2, fieldHeight = radius * 2, fieldRotation = 0 } = options;
  
  // Calculate raw distances
  const distanceX = mousePosition.x - elementPosition.x;
  const distanceY = mousePosition.y - elementPosition.y;
  
  // For circular fields, use simple Euclidean distance
  if (fieldShape === 'circular') {
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    return Math.min(1, distance / radius);
  }
  
  // For other field shapes, transform coordinates
  const angleInRadians = fieldRotation * Math.PI / 180;
  const cosAngle = Math.cos(angleInRadians);
  const sinAngle = Math.sin(angleInRadians);
  
  // Rotate coordinates to align with field orientation
  const rotatedX = distanceX * cosAngle + distanceY * sinAngle;
  const rotatedY = -distanceX * sinAngle + distanceY * cosAngle;
  
  if (fieldShape === 'elliptical') {
    // Normalized elliptical distance
    const normalizedX = rotatedX / (fieldWidth / 2);
    const normalizedY = rotatedY / (fieldHeight / 2);
    const ellipticalDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    return Math.min(1, ellipticalDistance);
  }
  
  if (fieldShape === 'rectangular') {
    // Normalized rectangular distance
    const normalizedX = Math.abs(rotatedX) / (fieldWidth / 2);
    const normalizedY = Math.abs(rotatedY) / (fieldHeight / 2);
    const rectangularDistance = Math.max(normalizedX, normalizedY);
    return Math.min(1, rectangularDistance);
  }
  
  // Default to circular if shape is not recognized
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  return Math.min(1, distance / radius);
};

/**
 * Calculate the force multiplier based on distance and decay function
 * @param normalizedDistance A value from 0 to 1, where 0 is at the center and 1 is at the edge
 * @param decayFunction The type of decay function to use
 * @returns A value from 0 to 1 representing the force multiplier
 */
export const calculateForceMultiplier = (
  normalizedDistance: number,
  decayFunction: FieldDecayFunction,
  customDecayFunction?: (distance: number) => number
): number => {
  // Clamp normalized distance to 0-1 range
  const clampedDistance = Math.max(0, Math.min(1, normalizedDistance));
  
  // Only apply force if within the field
  if (clampedDistance >= 1) return 0;
  
  switch (decayFunction) {
    case 'quadratic':
      // Quadratic decay: force decreases with square of distance
      return 1 - clampedDistance * clampedDistance;
      
    case 'exponential':
      // Exponential decay: force decreases exponentially with distance
      return Math.exp(-4 * clampedDistance);
      
    case 'inverse':
      // Inverse decay: force is inversely proportional to distance
      return clampedDistance < 0.1 ? 1 : 1 / (10 * clampedDistance);
      
    case 'constant':
      // Constant force within the field
      return 1;
      
    case 'custom':
      // Use custom decay function if provided
      if (customDecayFunction) {
        return customDecayFunction(clampedDistance);
      }
      // Fall back to linear if no custom function is provided
      return 1 - clampedDistance;
      
    case 'linear':
    default:
      // Linear decay: force decreases linearly with distance
      return 1 - clampedDistance;
  }
};

/**
 * Calculate the magnetic force vector based on field parameters
 */
export const calculateMagneticForce = (
  elementPosition: Vector2D,
  mousePosition: Vector2D,
  options: {
    type: 'attract' | 'repel' | 'follow' | 'orbit' | 'directional' | 'vortex' | 'custom';
    fieldShape: FieldShape;
    radius: number;
    strength: number;
    fieldWidth?: number;
    fieldHeight?: number;
    fieldRotation?: number;
    decayFunction: FieldDecayFunction;
    customDecayFunction?: (distance: number) => number;
    forceDirection?: Vector2D;
    maxDisplacement: number;
    oscillationFrequency?: number;
    startTime?: number;
  }
): Vector2D => {
  const { 
    type, 
    fieldShape, 
    radius, 
    strength, 
    fieldWidth = radius * 2, 
    fieldHeight = radius * 2, 
    fieldRotation = 0,
    decayFunction,
    customDecayFunction,
    forceDirection = { x: 1, y: 0 },
    maxDisplacement,
    oscillationFrequency = 1,
    startTime = performance.now()
  } = options;
  
  // Calculate distance from element to mouse
  const distanceX = mousePosition.x - elementPosition.x;
  const distanceY = mousePosition.y - elementPosition.y;
  const rawDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  
  // If outside maximum radius, return zero force
  if (rawDistance > radius) {
    return { x: 0, y: 0 };
  }
  
  // Calculate normalized distance based on field shape
  const normalizedDistance = calculateFieldDistance(
    elementPosition,
    mousePosition,
    { fieldShape, radius, fieldWidth, fieldHeight, fieldRotation }
  );
  
  // Calculate force multiplier based on decay function
  const forceMultiplier = calculateForceMultiplier(
    normalizedDistance,
    decayFunction,
    customDecayFunction
  );
  
  // Calculate the force based on type
  let forceX = 0;
  let forceY = 0;
  
  switch (type) {
    case 'repel':
      // Force away from mouse
      forceX = -distanceX * forceMultiplier * strength;
      forceY = -distanceY * forceMultiplier * strength;
      break;
      
    case 'orbit':
      // Force perpendicular to mouse
      const angle = Math.atan2(distanceY, distanceX) + Math.PI / 2; // 90 degrees
      const orbitDistance = rawDistance * forceMultiplier * strength;
      forceX = Math.cos(angle) * orbitDistance;
      forceY = Math.sin(angle) * orbitDistance;
      break;
      
    case 'directional':
      // Force in specified direction
      const normalizedForce = normalize(forceDirection);
      forceX = normalizedForce.x * forceMultiplier * strength * maxDisplacement;
      forceY = normalizedForce.y * forceMultiplier * strength * maxDisplacement;
      break;
      
    case 'vortex':
      // Vortex swirl effect
      const now = performance.now();
      const timeDelta = (now - startTime) / 1000; // in seconds
      const vortexAngle = Math.atan2(distanceY, distanceX) + timeDelta * Math.PI * oscillationFrequency;
      const vortexRadius = rawDistance * forceMultiplier * strength;
      forceX = Math.cos(vortexAngle) * vortexRadius;
      forceY = Math.sin(vortexAngle) * vortexRadius;
      break;
      
    case 'follow':
      // Force toward mouse, decreasing with distance
      const followFactor = Math.min(strength, strength * (1 - rawDistance / (radius * 2)));
      forceX = distanceX * followFactor;
      forceY = distanceY * followFactor;
      break;
      
    case 'attract':
    default:
      // Force toward mouse
      forceX = distanceX * forceMultiplier * strength;
      forceY = distanceY * forceMultiplier * strength;
      break;
  }
  
  // Apply max displacement
  const magnitude = Math.sqrt(forceX * forceX + forceY * forceY);
  if (magnitude > maxDisplacement) {
    const scale = maxDisplacement / magnitude;
    forceX *= scale;
    forceY *= scale;
  }
  
  return { x: forceX, y: forceY };
};

export default {
  distance,
  normalize,
  scale,
  add,
  calculateFieldDistance,
  calculateForceMultiplier,
  calculateMagneticForce
}; 