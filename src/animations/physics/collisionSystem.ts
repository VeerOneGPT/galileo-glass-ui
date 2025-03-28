/**
 * Advanced Collision Detection and Response System
 * 
 * Provides a comprehensive system for detecting and resolving
 * collisions between various shapes in physics simulations.
 */

import {
  Vector2D, 
  createVector,
  normalizeVector,
  subtractVectors,
  multiplyVector,
  addVectors,
  vectorDistance,
  dotProduct,
  vectorMagnitude
} from './physicsCalculations';
import { CollisionShape, PhysicsMaterial } from './types';

/**
 * Represents a physical body for collision detection
 */
export interface CollisionBody {
  /** Unique identifier */
  id: string | number;
  
  /** Position vector */
  position: Vector2D;
  
  /** Velocity vector */
  velocity: Vector2D;
  
  /** Mass of the body */
  mass: number;
  
  /** Collision shape type */
  shape: CollisionShape;
  
  /** Shape parameters (radius for circle, width/height for rectangle, etc.) */
  shapeData: CircleData | RectangleData | PolygonData | PointData;
  
  /** Physical material properties affecting collision response */
  material?: PhysicsMaterial;
  
  /** Whether the body is static (immovable) */
  isStatic?: boolean;
  
  /** Whether collision detection is enabled for this body */
  collisionEnabled?: boolean;
  
  /** Collision layer (bodies only collide with matching layers) */
  collisionLayer?: number;
  
  /** Rotation in radians */
  rotation?: number;
}

/**
 * Circle collision shape data
 */
export interface CircleData {
  /** Radius of the circle */
  radius: number;
}

/**
 * Rectangle collision shape data
 */
export interface RectangleData {
  /** Width of the rectangle */
  width: number;
  
  /** Height of the rectangle */
  height: number;
}

/**
 * Polygon collision shape data
 */
export interface PolygonData {
  /** Array of vertices defining the polygon */
  vertices: Vector2D[];
}

/**
 * Point collision shape data
 */
export interface PointData {
  /** Tolerance radius for point collisions */
  tolerance?: number;
}

/**
 * Represents the result of a collision detection
 */
export interface CollisionResult {
  /** Whether a collision occurred */
  collision: boolean;
  
  /** The two colliding bodies */
  bodyA: CollisionBody;
  bodyB: CollisionBody;
  
  /** Point of contact */
  contactPoint?: Vector2D;
  
  /** Normal vector at point of contact */
  normal?: Vector2D;
  
  /** Penetration depth */
  penetration?: number;
  
  /** Relative velocity at impact */
  relativeVelocity?: Vector2D;
}

/**
 * Creates a circular collision body
 */
export function createCircleBody(
  id: string | number,
  position: Vector2D,
  radius: number,
  mass: number,
  velocity: Vector2D = { x: 0, y: 0 },
  material?: PhysicsMaterial,
  isStatic = false
): CollisionBody {
  return {
    id,
    position,
    velocity,
    mass,
    shape: CollisionShape.CIRCLE,
    shapeData: { radius },
    material,
    isStatic,
    collisionEnabled: true
  };
}

/**
 * Creates a rectangular collision body
 */
export function createRectangleBody(
  id: string | number,
  position: Vector2D,
  width: number,
  height: number,
  mass: number,
  velocity: Vector2D = { x: 0, y: 0 },
  rotation = 0,
  material?: PhysicsMaterial,
  isStatic = false
): CollisionBody {
  return {
    id,
    position,
    velocity,
    mass,
    shape: CollisionShape.RECTANGLE,
    shapeData: { width, height },
    rotation,
    material,
    isStatic,
    collisionEnabled: true
  };
}

/**
 * Creates a polygon collision body
 */
export function createPolygonBody(
  id: string | number,
  position: Vector2D,
  vertices: Vector2D[],
  mass: number,
  velocity: Vector2D = { x: 0, y: 0 },
  rotation = 0,
  material?: PhysicsMaterial,
  isStatic = false
): CollisionBody {
  return {
    id,
    position,
    velocity,
    mass,
    shape: CollisionShape.POLYGON,
    shapeData: { vertices },
    rotation,
    material,
    isStatic,
    collisionEnabled: true
  };
}

/**
 * Creates a point collision body
 */
export function createPointBody(
  id: string | number,
  position: Vector2D,
  mass: number,
  velocity: Vector2D = { x: 0, y: 0 },
  tolerance = 1,
  material?: PhysicsMaterial,
  isStatic = false
): CollisionBody {
  return {
    id,
    position,
    velocity,
    mass,
    shape: CollisionShape.POINT,
    shapeData: { tolerance },
    material,
    isStatic,
    collisionEnabled: true
  };
}

/**
 * Detects collision between two bodies
 */
export function detectBodyCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  // Check if collision detection is disabled for either body
  if (bodyA.collisionEnabled === false || bodyB.collisionEnabled === false) {
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
  
  // Check if bodies are on different collision layers
  if (
    bodyA.collisionLayer !== undefined &&
    bodyB.collisionLayer !== undefined &&
    bodyA.collisionLayer !== bodyB.collisionLayer
  ) {
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
  
  // Dispatch to appropriate collision detection function based on shape types
  if (bodyA.shape === CollisionShape.CIRCLE && bodyB.shape === CollisionShape.CIRCLE) {
    return detectCircleCircleCollision(bodyA, bodyB);
  } else if (bodyA.shape === CollisionShape.RECTANGLE && bodyB.shape === CollisionShape.RECTANGLE) {
    return detectRectangleRectangleCollision(bodyA, bodyB);
  } else if (bodyA.shape === CollisionShape.CIRCLE && bodyB.shape === CollisionShape.RECTANGLE) {
    return detectCircleRectangleCollision(bodyA, bodyB);
  } else if (bodyA.shape === CollisionShape.RECTANGLE && bodyB.shape === CollisionShape.CIRCLE) {
    // Swap the order and flip the normal
    const result = detectCircleRectangleCollision(bodyB, bodyA);
    if (result.collision && result.normal) {
      result.normal = { x: -result.normal.x, y: -result.normal.y };
      result.bodyA = bodyA;
      result.bodyB = bodyB;
    }
    return result;
  } else if (bodyA.shape === CollisionShape.POINT && bodyB.shape === CollisionShape.CIRCLE) {
    return detectPointCircleCollision(bodyA, bodyB);
  } else if (bodyA.shape === CollisionShape.CIRCLE && bodyB.shape === CollisionShape.POINT) {
    // Swap the order and flip the normal
    const result = detectPointCircleCollision(bodyB, bodyA);
    if (result.collision && result.normal) {
      result.normal = { x: -result.normal.x, y: -result.normal.y };
      result.bodyA = bodyA;
      result.bodyB = bodyB;
    }
    return result;
  } else if (bodyA.shape === CollisionShape.POINT && bodyB.shape === CollisionShape.RECTANGLE) {
    return detectPointRectangleCollision(bodyA, bodyB);
  } else if (bodyA.shape === CollisionShape.RECTANGLE && bodyB.shape === CollisionShape.POINT) {
    // Swap the order and flip the normal
    const result = detectPointRectangleCollision(bodyB, bodyA);
    if (result.collision && result.normal) {
      result.normal = { x: -result.normal.x, y: -result.normal.y };
      result.bodyA = bodyA;
      result.bodyB = bodyB;
    }
    return result;
  } else if (bodyA.shape === CollisionShape.POLYGON || bodyB.shape === CollisionShape.POLYGON) {
    // For polygon collisions, we would need more complex algorithms like SAT
    // This is a simplified implementation
    return {
      collision: false,
      bodyA,
      bodyB,
      normal: { x: 0, y: 0 },
      contactPoint: { x: 0, y: 0 },
      penetration: 0
    };
  }
  
  // Default: no collision
  return {
    collision: false,
    bodyA,
    bodyB
  };
}

/**
 * Detects collision between two circles
 */
function detectCircleCircleCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  const circleA = bodyA.shapeData as CircleData;
  const circleB = bodyB.shapeData as CircleData;
  
  const distance = vectorDistance(bodyA.position, bodyB.position);
  const minDistance = circleA.radius + circleB.radius;
  
  if (distance < minDistance) {
    // Calculate collision normal (direction from A to B)
    const normal = normalizeVector(subtractVectors(bodyB.position, bodyA.position));
    
    // Calculate penetration depth
    const penetration = minDistance - distance;
    
    // Calculate contact point
    const contactPoint = {
      x: bodyA.position.x + normal.x * circleA.radius,
      y: bodyA.position.y + normal.y * circleA.radius
    };
    
    // Calculate relative velocity
    const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
    
    return {
      collision: true,
      bodyA,
      bodyB,
      normal,
      contactPoint,
      penetration,
      relativeVelocity
    };
  }
  
  return {
    collision: false,
    bodyA,
    bodyB
  };
}

/**
 * Detects collision between two rectangles (AABB)
 * Note: This implementation is for non-rotated rectangles (Axis-Aligned Bounding Boxes)
 */
function detectRectangleRectangleCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  const rectA = bodyA.shapeData as RectangleData;
  const rectB = bodyB.shapeData as RectangleData;
  
  // Calculate rectangle half-dimensions
  const halfWidthA = rectA.width / 2;
  const halfHeightA = rectA.height / 2;
  const halfWidthB = rectB.width / 2;
  const halfHeightB = rectB.height / 2;
  
  // Calculate rectangle bounds
  const minA = { 
    x: bodyA.position.x - halfWidthA, 
    y: bodyA.position.y - halfHeightA 
  };
  const maxA = { 
    x: bodyA.position.x + halfWidthA, 
    y: bodyA.position.y + halfHeightA 
  };
  const minB = { 
    x: bodyB.position.x - halfWidthB, 
    y: bodyB.position.y - halfHeightB 
  };
  const maxB = { 
    x: bodyB.position.x + halfWidthB, 
    y: bodyB.position.y + halfHeightB 
  };
  
  // Check for overlap
  if (
    maxA.x < minB.x || minA.x > maxB.x ||
    maxA.y < minB.y || minA.y > maxB.y
  ) {
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
  
  // Calculate penetration depths for each axis
  const overlapX = Math.min(maxA.x - minB.x, maxB.x - minA.x);
  const overlapY = Math.min(maxA.y - minB.y, maxB.y - minA.y);
  
  // Determine collision normal based on minimum penetration
  let normal: Vector2D;
  let penetration: number;
  
  if (overlapX < overlapY) {
    // X-axis has smallest penetration
    penetration = overlapX;
    normal = {
      x: bodyA.position.x < bodyB.position.x ? -1 : 1,
      y: 0
    };
  } else {
    // Y-axis has smallest penetration
    penetration = overlapY;
    normal = {
      x: 0,
      y: bodyA.position.y < bodyB.position.y ? -1 : 1
    };
  }
  
  // Calculate contact point (approximate at center of overlap region)
  const contactPoint = {
    x: bodyA.position.x + (bodyB.position.x - bodyA.position.x) * 0.5,
    y: bodyA.position.y + (bodyB.position.y - bodyA.position.y) * 0.5
  };
  
  // Calculate relative velocity
  const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
  
  return {
    collision: true,
    bodyA,
    bodyB,
    normal,
    contactPoint,
    penetration,
    relativeVelocity
  };
}

/**
 * Detects collision between a circle and a rectangle
 */
function detectCircleRectangleCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  const circle = bodyA.shapeData as CircleData;
  const rect = bodyB.shapeData as RectangleData;
  
  // Calculate rectangle half-dimensions
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  
  // Find the closest point on the rectangle to the circle center
  const closestPoint = {
    x: Math.max(bodyB.position.x - halfWidth, Math.min(bodyA.position.x, bodyB.position.x + halfWidth)),
    y: Math.max(bodyB.position.y - halfHeight, Math.min(bodyA.position.y, bodyB.position.y + halfHeight))
  };
  
  // Calculate distance between closest point and circle center
  const distance = vectorDistance(bodyA.position, closestPoint);
  
  if (distance < circle.radius) {
    // Calculate normal (direction from closest point to circle center)
    let normal = subtractVectors(bodyA.position, closestPoint);
    
    // Check if circle center is inside rectangle (edge case)
    if (vectorMagnitude(normal) < 0.0001) {
      // Circle center is inside rectangle, find closest edge
      const dx = Math.min(
        Math.abs(bodyA.position.x - (bodyB.position.x - halfWidth)),
        Math.abs(bodyA.position.x - (bodyB.position.x + halfWidth))
      );
      const dy = Math.min(
        Math.abs(bodyA.position.y - (bodyB.position.y - halfHeight)),
        Math.abs(bodyA.position.y - (bodyB.position.y + halfHeight))
      );
      
      if (dx < dy) {
        normal = {
          x: bodyA.position.x < bodyB.position.x ? -1 : 1,
          y: 0
        };
      } else {
        normal = {
          x: 0,
          y: bodyA.position.y < bodyB.position.y ? -1 : 1
        };
      }
    } else {
      normal = normalizeVector(normal);
    }
    
    // Calculate penetration
    const penetration = circle.radius - distance;
    
    // Calculate contact point
    const contactPoint = {
      x: bodyA.position.x - normal.x * circle.radius,
      y: bodyA.position.y - normal.y * circle.radius
    };
    
    // Calculate relative velocity
    const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
    
    return {
      collision: true,
      bodyA,
      bodyB,
      normal,
      contactPoint,
      penetration,
      relativeVelocity
    };
  }
  
  return {
    collision: false,
    bodyA,
    bodyB
  };
}

/**
 * Detects collision between a point and a circle
 */
function detectPointCircleCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  const point = bodyA.shapeData as PointData;
  const circle = bodyB.shapeData as CircleData;
  
  // Get the point tolerance (or use default of 1)
  const tolerance = point.tolerance || 1;
  
  // Calculate distance between point and circle center
  const distance = vectorDistance(bodyA.position, bodyB.position);
  
  if (distance < circle.radius + tolerance) {
    // Calculate collision normal (direction from circle to point)
    const normal = normalizeVector(subtractVectors(bodyA.position, bodyB.position));
    
    // Calculate penetration depth
    const penetration = (circle.radius + tolerance) - distance;
    
    // Contact point is the point position
    const contactPoint = { ...bodyA.position };
    
    // Calculate relative velocity
    const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
    
    return {
      collision: true,
      bodyA,
      bodyB,
      normal,
      contactPoint,
      penetration,
      relativeVelocity
    };
  }
  
  return {
    collision: false,
    bodyA,
    bodyB
  };
}

/**
 * Detects collision between a point and a rectangle
 */
function detectPointRectangleCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  const point = bodyA.shapeData as PointData;
  const rect = bodyB.shapeData as RectangleData;
  
  // Get the point tolerance (or use default of 1)
  const tolerance = point.tolerance || 1;
  
  // Calculate rectangle bounds with tolerance
  const halfWidth = rect.width / 2 + tolerance;
  const halfHeight = rect.height / 2 + tolerance;
  
  const minX = bodyB.position.x - halfWidth;
  const maxX = bodyB.position.x + halfWidth;
  const minY = bodyB.position.y - halfHeight;
  const maxY = bodyB.position.y + halfHeight;
  
  // Check if point is inside the expanded rectangle
  if (
    bodyA.position.x >= minX && bodyA.position.x <= maxX &&
    bodyA.position.y >= minY && bodyA.position.y <= maxY
  ) {
    // Determine which edge is closest to find the collision normal
    const distToLeft = bodyA.position.x - minX;
    const distToRight = maxX - bodyA.position.x;
    const distToTop = bodyA.position.y - minY;
    const distToBottom = maxY - bodyA.position.y;
    
    let normal: Vector2D;
    let penetration: number;
    
    // Find the minimum distance to determine the collision normal
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    
    if (minDist === distToLeft) {
      normal = { x: -1, y: 0 };
      penetration = tolerance + distToLeft;
    } else if (minDist === distToRight) {
      normal = { x: 1, y: 0 };
      penetration = tolerance + distToRight;
    } else if (minDist === distToTop) {
      normal = { x: 0, y: -1 };
      penetration = tolerance + distToTop;
    } else {
      normal = { x: 0, y: 1 };
      penetration = tolerance + distToBottom;
    }
    
    // Calculate relative velocity
    const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
    
    return {
      collision: true,
      bodyA,
      bodyB,
      normal,
      contactPoint: { ...bodyA.position },
      penetration,
      relativeVelocity
    };
  }
  
  return {
    collision: false,
    bodyA,
    bodyB
  };
}

/**
 * Resolves a collision by calculating and applying impulses
 */
export function resolveCollisionWithImpulse(result: CollisionResult): void {
  if (!result.collision) return;
  
  const { bodyA, bodyB, normal, penetration } = result;
  if (!normal) return;
  
  // Skip collision resolution if either body is static
  if (bodyA.isStatic && bodyB.isStatic) return;
  
  // Get restitution (bounciness) - use highest value from both materials
  const restitutionA = bodyA.material?.restitution ?? 0.2;
  const restitutionB = bodyB.material?.restitution ?? 0.2;
  const restitution = Math.max(restitutionA, restitutionB);
  
  // Get friction coefficients
  const frictionA = bodyA.material?.friction ?? 0.1;
  const frictionB = bodyB.material?.friction ?? 0.1;
  const friction = (frictionA + frictionB) * 0.5; // Average the friction
  
  // Calculate relative velocity
  const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
  
  // Calculate relative velocity along the normal
  const velocityAlongNormal = dotProduct(relativeVelocity, normal);
  
  // Don't resolve if objects are moving away from each other
  if (velocityAlongNormal > 0) return;
  
  // Calculate impulse scalar
  const j = -(1 + restitution) * velocityAlongNormal;
  const totalMass = bodyA.isStatic ? bodyB.mass : (bodyB.isStatic ? bodyA.mass : bodyA.mass + bodyB.mass);
  const impulseScalar = j / totalMass;
  
  // Apply impulse
  const impulse = multiplyVector(normal, impulseScalar);
  
  // Update velocities
  if (!bodyA.isStatic) {
    bodyA.velocity = subtractVectors(bodyA.velocity, multiplyVector(impulse, bodyB.mass / totalMass));
  }
  
  if (!bodyB.isStatic) {
    bodyB.velocity = addVectors(bodyB.velocity, multiplyVector(impulse, bodyA.mass / totalMass));
  }
  
  // Apply friction force (tangential component)
  // Calculate tangent vector (perpendicular to normal)
  const tangent = {
    x: -normal.y,
    y: normal.x
  };
  
  // Calculate relative velocity along tangent
  const velAlongTangent = dotProduct(relativeVelocity, tangent);
  
  // Calculate tangential impulse
  const frictionImpulse = -velAlongTangent * friction;
  
  // Apply tangential impulse
  if (!bodyA.isStatic) {
    bodyA.velocity = subtractVectors(
      bodyA.velocity, 
      multiplyVector(tangent, (frictionImpulse * bodyB.mass) / totalMass)
    );
  }
  
  if (!bodyB.isStatic) {
    bodyB.velocity = addVectors(
      bodyB.velocity, 
      multiplyVector(tangent, (frictionImpulse * bodyA.mass) / totalMass)
    );
  }
  
  // Positional correction to prevent sinking (using the penetration depth)
  // Skip if either body is static
  if (bodyA.isStatic || bodyB.isStatic) return;
  
  const percent = 0.2; // Correction percentage (0.2-0.8)
  const correction = multiplyVector(normal, penetration! * percent);
  
  const massSum = bodyA.mass + bodyB.mass;
  const correctionA = multiplyVector(correction, bodyB.mass / massSum);
  const correctionB = multiplyVector(correction, -bodyA.mass / massSum);
  
  bodyA.position = subtractVectors(bodyA.position, correctionA);
  bodyB.position = addVectors(bodyB.position, correctionB);
}

/**
 * Collision system to manage all collision bodies and handle collision detection and response
 */
export class CollisionSystem {
  private bodies: CollisionBody[] = [];
  private collisionPairs: { bodyA: CollisionBody; bodyB: CollisionBody }[] = [];
  
  /**
   * Adds a collision body to the system
   */
  public addBody(body: CollisionBody): void {
    this.bodies.push(body);
  }
  
  /**
   * Removes a collision body from the system
   */
  public removeBody(id: string | number): void {
    this.bodies = this.bodies.filter(body => body.id !== id);
    this.updateCollisionPairs();
  }
  
  /**
   * Updates a body's properties
   */
  public updateBody(
    id: string | number, 
    properties: Partial<Omit<CollisionBody, 'id' | 'shape' | 'shapeData'>>
  ): void {
    const body = this.bodies.find(body => body.id === id);
    if (body) {
      Object.assign(body, properties);
    }
  }
  
  /**
   * Gets a body by its ID
   */
  public getBody(id: string | number): CollisionBody | undefined {
    return this.bodies.find(body => body.id === id);
  }
  
  /**
   * Updates collision pairs for efficient collision checking
   */
  private updateCollisionPairs(): void {
    this.collisionPairs = [];
    
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i];
        const bodyB = this.bodies[j];
        
        // Skip if both bodies are static
        if (bodyA.isStatic && bodyB.isStatic) continue;
        
        // Skip if collision is disabled for either body
        if (bodyA.collisionEnabled === false || bodyB.collisionEnabled === false) continue;
        
        // Skip if bodies are on different collision layers
        if (
          bodyA.collisionLayer !== undefined &&
          bodyB.collisionLayer !== undefined &&
          bodyA.collisionLayer !== bodyB.collisionLayer
        ) continue;
        
        this.collisionPairs.push({ bodyA, bodyB });
      }
    }
  }
  
  /**
   * Detects and resolves all collisions in the system
   * @returns Array of collision results
   */
  public update(): CollisionResult[] {
    // Update collision pairs if needed
    this.updateCollisionPairs();
    
    const collisionResults: CollisionResult[] = [];
    
    // Check all collision pairs
    for (const pair of this.collisionPairs) {
      const result = detectBodyCollision(pair.bodyA, pair.bodyB);
      
      if (result.collision) {
        // Resolve the collision
        resolveCollisionWithImpulse(result);
        collisionResults.push(result);
      }
    }
    
    return collisionResults;
  }
  
  /**
   * Clear all bodies from the system
   */
  public clear(): void {
    this.bodies = [];
    this.collisionPairs = [];
  }
  
  /**
   * Returns the current number of bodies in the system
   */
  public getBodyCount(): number {
    return this.bodies.length;
  }
}

/**
 * Creates a new collision system
 * @returns A new collision system instance
 */
export function createCollisionSystem(): CollisionSystem {
  return new CollisionSystem();
}

/**
 * Converts a rectangle into a set of boundary walls
 * Useful for creating boundaries for a physics world
 * 
 * @param id Base ID for the boundary walls
 * @param x Left position
 * @param y Top position
 * @param width Width of the boundary
 * @param height Height of the boundary
 * @param thickness Wall thickness
 * @returns Array of four static rectangle bodies forming walls
 */
export function createBoundaryWalls(
  id: string | number,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness = 10
): CollisionBody[] {
  const walls: CollisionBody[] = [];
  
  // Top wall
  walls.push(createRectangleBody(
    `${id}_top`,
    { x: x + width / 2, y: y },
    width + thickness * 2,
    thickness,
    Infinity, // Infinite mass = static
    { x: 0, y: 0 },
    0,
    undefined,
    true // isStatic
  ));
  
  // Right wall
  walls.push(createRectangleBody(
    `${id}_right`,
    { x: x + width, y: y + height / 2 },
    thickness,
    height + thickness * 2,
    Infinity,
    { x: 0, y: 0 },
    0,
    undefined,
    true
  ));
  
  // Bottom wall
  walls.push(createRectangleBody(
    `${id}_bottom`,
    { x: x + width / 2, y: y + height },
    width + thickness * 2,
    thickness,
    Infinity,
    { x: 0, y: 0 },
    0,
    undefined,
    true
  ));
  
  // Left wall
  walls.push(createRectangleBody(
    `${id}_left`,
    { x: x, y: y + height / 2 },
    thickness,
    height + thickness * 2,
    Infinity,
    { x: 0, y: 0 },
    0,
    undefined,
    true
  ));
  
  return walls;
}