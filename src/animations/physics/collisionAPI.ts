/**
 * Unified API for the Collision Detection and Response System
 * 
 * This module provides a simplified interface for the collision system
 * that can be easily used by components and animations.
 */

import {
  CollisionSystem,
  createCollisionSystem,
  CollisionBody,
  createCircleBody,
  createRectangleBody,
  createPolygonBody,
  createPointBody,
  createBoundaryWalls
} from './collisionSystem';
import { CollisionShape, PhysicsMaterial, PhysicsAnimationOptions, PhysicsSettings } from './types';
import { Vector2D, createVector } from './physicsCalculations';

/**
 * Collision detection options
 */
export interface CollisionOptions {
  /** Whether collision detection is enabled */
  enabled?: boolean;
  
  /** Collision layer - bodies only collide with matching layers */
  layer?: number;
  
  /** Whether the body is static (immovable) */
  isStatic?: boolean;
  
  /** Custom material properties */
  material?: PhysicsMaterial;
}

/**
 * Main collision system instance
 */
let globalCollisionSystem: CollisionSystem | null = null;

/**
 * Gets the global collision system instance, creating it if it doesn't exist
 */
export function getCollisionSystem(): CollisionSystem {
  if (!globalCollisionSystem) {
    globalCollisionSystem = createCollisionSystem();
  }
  return globalCollisionSystem;
}

/**
 * Resets the global collision system
 */
export function resetCollisionSystem(): void {
  if (globalCollisionSystem) {
    globalCollisionSystem.clear();
  }
  globalCollisionSystem = createCollisionSystem();
}

/**
 * Creates a circular collision object
 */
export function createCollisionCircle(
  id: string | number,
  position: Vector2D,
  radius: number,
  mass = 1,
  velocity: Vector2D = { x: 0, y: 0 },
  options: CollisionOptions = {}
): CollisionBody {
  const body = createCircleBody(
    id,
    position,
    radius,
    mass,
    velocity,
    options.material,
    options.isStatic
  );
  
  if (options.enabled !== undefined) {
    body.collisionEnabled = options.enabled;
  }
  
  if (options.layer !== undefined) {
    body.collisionLayer = options.layer;
  }
  
  // Add to global system if it exists
  if (globalCollisionSystem) {
    globalCollisionSystem.addBody(body);
  }
  
  return body;
}

/**
 * Creates a rectangular collision object
 */
export function createCollisionRectangle(
  id: string | number,
  position: Vector2D,
  width: number,
  height: number,
  mass = 1,
  velocity: Vector2D = { x: 0, y: 0 },
  rotation = 0,
  options: CollisionOptions = {}
): CollisionBody {
  const body = createRectangleBody(
    id,
    position,
    width,
    height,
    mass,
    velocity,
    rotation,
    options.material,
    options.isStatic
  );
  
  if (options.enabled !== undefined) {
    body.collisionEnabled = options.enabled;
  }
  
  if (options.layer !== undefined) {
    body.collisionLayer = options.layer;
  }
  
  // Add to global system if it exists
  if (globalCollisionSystem) {
    globalCollisionSystem.addBody(body);
  }
  
  return body;
}

/**
 * Creates a point collision object
 */
export function createCollisionPoint(
  id: string | number,
  position: Vector2D,
  mass = 1,
  velocity: Vector2D = { x: 0, y: 0 },
  tolerance = 1,
  options: CollisionOptions = {}
): CollisionBody {
  const body = createPointBody(
    id,
    position,
    mass,
    velocity,
    tolerance,
    options.material,
    options.isStatic
  );
  
  if (options.enabled !== undefined) {
    body.collisionEnabled = options.enabled;
  }
  
  if (options.layer !== undefined) {
    body.collisionLayer = options.layer;
  }
  
  // Add to global system if it exists
  if (globalCollisionSystem) {
    globalCollisionSystem.addBody(body);
  }
  
  return body;
}

/**
 * Creates a polygon collision object
 */
export function createCollisionPolygon(
  id: string | number,
  position: Vector2D,
  vertices: Vector2D[],
  mass = 1,
  velocity: Vector2D = { x: 0, y: 0 },
  rotation = 0,
  options: CollisionOptions = {}
): CollisionBody {
  const body = createPolygonBody(
    id,
    position,
    vertices,
    mass,
    velocity,
    rotation,
    options.material,
    options.isStatic
  );
  
  if (options.enabled !== undefined) {
    body.collisionEnabled = options.enabled;
  }
  
  if (options.layer !== undefined) {
    body.collisionLayer = options.layer;
  }
  
  // Add to global system if it exists
  if (globalCollisionSystem) {
    globalCollisionSystem.addBody(body);
  }
  
  return body;
}

/**
 * Creates a set of boundary walls and adds them to the collision system
 */
export function createCollisionBoundaries(
  id: string | number,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness = 10
): CollisionBody[] {
  const walls = createBoundaryWalls(id, x, y, width, height, thickness);
  
  // Add to global system if it exists
  if (globalCollisionSystem) {
    walls.forEach(wall => globalCollisionSystem!.addBody(wall));
  }
  
  return walls;
}

/**
 * Updates a collision body's position and velocity
 */
export function updateCollisionBody(
  id: string | number,
  position?: Vector2D,
  velocity?: Vector2D,
  rotation?: number
): void {
  if (!globalCollisionSystem) return;
  
  const properties: any = {};
  if (position) properties.position = position;
  if (velocity) properties.velocity = velocity;
  if (rotation !== undefined) properties.rotation = rotation;
  
  globalCollisionSystem.updateBody(id, properties);
}

/**
 * Removes a collision body from the system
 */
export function removeCollisionBody(id: string | number): void {
  if (!globalCollisionSystem) return;
  globalCollisionSystem.removeBody(id);
}

/**
 * Updates the physics simulation, including collision detection and response
 * @returns Results of collision detections
 */
export function updateCollisionSystem(): void {
  if (!globalCollisionSystem) return;
  globalCollisionSystem.update();
}

/**
 * Creates default materials for different surfaces
 */
export const CollisionMaterials = {
  /** Bouncy material with high restitution */
  BOUNCY: {
    density: 1,
    restitution: 0.8,
    friction: 0.1,
    airResistance: 0.01
  },
  
  /** Standard material with moderate properties */
  STANDARD: {
    density: 1,
    restitution: 0.3,
    friction: 0.3,
    airResistance: 0.02
  },
  
  /** Heavy material with high density and low bounce */
  HEAVY: {
    density: 5,
    restitution: 0.1,
    friction: 0.5,
    airResistance: 0.05
  },
  
  /** Slippery material with low friction */
  SLIPPERY: {
    density: 0.8,
    restitution: 0.4,
    friction: 0.05,
    airResistance: 0.01
  },
  
  /** Sticky material with high friction */
  STICKY: {
    density: 1.2,
    restitution: 0.1,
    friction: 0.8,
    airResistance: 0.03
  }
};