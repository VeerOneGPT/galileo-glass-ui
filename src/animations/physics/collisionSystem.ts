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
 * Enhanced collision filtering system
 * Provides fine-grained control over which bodies can collide with each other
 */

/**
 * Collision filter for a physics body
 */
export interface CollisionFilter {
  /** 
   * Collision category this body belongs to (powers of 2: 1, 2, 4, 8, 16...) 
   * A body can only belong to one category
   */
  category: number;
  
  /** 
   * Bit mask defining which categories this body can collide with 
   * Combine multiple categories with bitwise OR: category1 | category2 | category3
   */
  mask: number;
  
  /** 
   * Optional collision group for additional filtering
   * Bodies with the same non-zero group value always collide (positive) or never collide (negative)
   * Zero means no special group behavior
   */
  group?: number;
}

/**
 * Predefined collision categories for common UI elements
 */
export const CollisionCategories = {
  DEFAULT: 0x0001,
  UI_ELEMENT: 0x0002,
  DRAGGABLE: 0x0004,
  BOUNDARY: 0x0008,
  SENSOR: 0x0010,
  PARTICLE: 0x0020,
  MOUSE: 0x0040,
  CUSTOM_1: 0x0080,
  CUSTOM_2: 0x0100,
  CUSTOM_3: 0x0200,
  CUSTOM_4: 0x0400,
  CUSTOM_5: 0x0800,
  ALL: 0xFFFF
};

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
  
  /** 
   * @deprecated Use collisionFilter instead for more precise control
   * Legacy collision layer (bodies only collide with matching layers) 
   */
  collisionLayer?: number;
  
  /** Advanced collision filtering */
  collisionFilter?: CollisionFilter;
  
  /** Rotation in radians */
  rotation?: number;
  
  /** Optional arbitrary data attached by the user */
  userData?: any;
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
  isStatic = false,
  collisionFilter?: CollisionFilter
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
    collisionEnabled: true,
    collisionFilter: collisionFilter || {
      category: CollisionCategories.DEFAULT,
      mask: CollisionCategories.ALL
    }
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
  isStatic = false,
  collisionFilter?: CollisionFilter
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
    collisionEnabled: true,
    collisionFilter: collisionFilter || {
      category: CollisionCategories.DEFAULT,
      mask: CollisionCategories.ALL
    }
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
  isStatic = false,
  collisionFilter?: CollisionFilter
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
    collisionEnabled: true,
    collisionFilter: collisionFilter || {
      category: CollisionCategories.DEFAULT,
      mask: CollisionCategories.ALL
    }
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
  isStatic = false,
  collisionFilter?: CollisionFilter
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
    collisionEnabled: true,
    collisionFilter: collisionFilter || {
      category: CollisionCategories.DEFAULT,
      mask: CollisionCategories.ALL
    }
  };
}

/**
 * Type Guards for Shape Data
 */
function isCircleData(data: any): data is CircleData {
    return typeof data === 'object' && data !== null && typeof data.radius === 'number';
}

function isRectangleData(data: any): data is RectangleData {
    return typeof data === 'object' && data !== null && typeof data.width === 'number' && typeof data.height === 'number';
}

function isPolygonData(data: any): data is PolygonData {
    return typeof data === 'object' && data !== null && Array.isArray(data.vertices);
}

function isPointData(data: any): data is PointData {
    return typeof data === 'object' && data !== null; // tolerance is optional
}

/**
 * Implements the Separating Axis Theorem (SAT) for polygon collision detection
 */

/**
 * Projects a polygon onto an axis
 */
function projectPolygon(vertices: Vector2D[], axis: Vector2D): { min: number; max: number } {
  let min = dotProduct(vertices[0], axis);
  let max = min;
  
  for (let i = 1; i < vertices.length; i++) {
    const projection = dotProduct(vertices[i], axis);
    if (projection < min) {
      min = projection;
    }
    if (projection > max) {
      max = projection;
    }
  }
  
  return { min, max };
}

/**
 * Gets the edges of a polygon
 */
function getPolygonEdges(vertices: Vector2D[]): Vector2D[] {
  const edges: Vector2D[] = [];
  
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    edges.push({
      x: vertices[nextIndex].x - vertices[i].x,
      y: vertices[nextIndex].y - vertices[i].y
    });
  }
  
  return edges;
}

/**
 * Gets the normal vectors from edges
 */
function getPolygonNormals(edges: Vector2D[]): Vector2D[] {
  return edges.map(edge => {
    // Perpendicular to edge
    return normalizeVector({ x: -edge.y, y: edge.x });
  });
}

/**
 * Checks if two projections overlap and calculates overlap amount
 */
function projectionsOverlap(projA: { min: number; max: number }, projB: { min: number; max: number }): { overlap: boolean; amount: number } {
  const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
  return {
    overlap: overlap > 0,
    amount: overlap
  };
}

/**
 * Transforms polygon vertices accounting for position and rotation
 */
function transformPolygonVertices(vertices: Vector2D[], position: Vector2D, rotation = 0): Vector2D[] {
  const transformedVertices: Vector2D[] = [];
  
  for (const vertex of vertices) {
    if (rotation === 0) {
      // Simple translation if no rotation
      transformedVertices.push({
        x: vertex.x + position.x,
        y: vertex.y + position.y
      });
    } else {
      // Apply rotation and translation
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      transformedVertices.push({
        x: vertex.x * cos - vertex.y * sin + position.x,
        y: vertex.x * sin + vertex.y * cos + position.y
      });
    }
  }
  
  return transformedVertices;
}

/**
 * Detects collision between two polygons using SAT
 */
function detectPolygonPolygonCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  // Use type guards
  if (!isPolygonData(bodyA.shapeData) || !isPolygonData(bodyB.shapeData)) {
     console.error('Invalid shape data for Polygon-Polygon collision');
     return { collision: false, bodyA, bodyB };
  }
  const polygonA = bodyA.shapeData;
  const polygonB = bodyB.shapeData;
  
  // Transform vertices to account for position and rotation
  const verticesA = transformPolygonVertices(
    polygonA.vertices,
    bodyA.position,
    bodyA.rotation || 0
  );
  
  const verticesB = transformPolygonVertices(
    polygonB.vertices,
    bodyB.position,
    bodyB.rotation || 0
  );
  
  // Get edges and normals for both polygons
  const edgesA = getPolygonEdges(verticesA);
  const edgesB = getPolygonEdges(verticesB);
  
  const normalsA = getPolygonNormals(edgesA);
  const normalsB = getPolygonNormals(edgesB);
  
  // Combine all normals to check
  const allNormals = [...normalsA, ...normalsB];
  
  // Track minimum overlap and corresponding normal for collision resolution
  let minOverlap = Infinity;
  let minOverlapNormal: Vector2D | null = null;
  
  // Check each normal as a potential separating axis
  for (const normal of allNormals) {
    const projA = projectPolygon(verticesA, normal);
    const projB = projectPolygon(verticesB, normal);
    
    const { overlap, amount } = projectionsOverlap(projA, projB);
    
    // If no overlap on any axis, then no collision
    if (!overlap) {
      return {
        collision: false,
        bodyA,
        bodyB
      };
    }
    
    // Track the minimum overlap and its normal
    if (amount < minOverlap) {
      minOverlap = amount;
      minOverlapNormal = normal;
    }
  }
  
  // We have a collision; determine collision details
  if (!minOverlapNormal) {
    // This shouldn't happen, but as a safety check
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
  
  // Calculate collision response data
  
  // Ensure normal points from A to B by checking relative positions
  const centerA = bodyA.position;
  const centerB = bodyB.position;
  const direction = subtractVectors(centerB, centerA);
  
  // If the normal is pointing the wrong way, flip it
  if (dotProduct(direction, minOverlapNormal) < 0) {
    minOverlapNormal = { x: -minOverlapNormal.x, y: -minOverlapNormal.y };
  }
  
  // Find contact point (approximate)
  // For simplicity, we'll use the midpoint between the closest points
  let contactPoint: Vector2D = { x: 0, y: 0 };
  
  // Find the closest vertices from each polygon to the other polygon
  let minDistanceA = Infinity;
  let closestVertexA: Vector2D | null = null;
  
  for (const vertex of verticesA) {
    // Project the vertex onto the normal
    const distance = dotProduct(subtractVectors(vertex, centerB), minOverlapNormal);
    if (distance < minDistanceA) {
      minDistanceA = distance;
      closestVertexA = vertex;
    }
  }
  
  let minDistanceB = Infinity;
  let closestVertexB: Vector2D | null = null;
  
  for (const vertex of verticesB) {
    // Project the vertex onto the inverted normal
    const invNormal = { x: -minOverlapNormal.x, y: -minOverlapNormal.y };
    const distance = dotProduct(subtractVectors(vertex, centerA), invNormal);
    if (distance < minDistanceB) {
      minDistanceB = distance;
      closestVertexB = vertex;
    }
  }
  
  if (closestVertexA && closestVertexB) {
    contactPoint = {
      x: (closestVertexA.x + closestVertexB.x) / 2,
      y: (closestVertexA.y + closestVertexB.y) / 2
    };
  } else {
    // Fallback to center point
    contactPoint = {
      x: (centerA.x + centerB.x) / 2,
      y: (centerA.y + centerB.y) / 2
    };
  }
  
  // Calculate relative velocity
  const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
  
  return {
    collision: true,
    bodyA,
    bodyB,
    normal: minOverlapNormal,
    contactPoint,
    penetration: minOverlap,
    relativeVelocity
  };
}

/**
 * Converts a rectangle to a polygon for collision detection
 */
function rectangleToPolygon(body: CollisionBody): CollisionBody {
  if (!isRectangleData(body.shapeData)) {
    console.error('Invalid shape data for rectangleToPolygon');
    // Return original body or throw error?
    return body; // Returning original for now
  }
  const rect = body.shapeData;
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  
  // Create vertices for rectangle corners
  const vertices: Vector2D[] = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight }
  ];
  
  // Create a new polygon body with same properties
  return {
    ...body,
    shape: CollisionShape.POLYGON,
    shapeData: { vertices }
  };
}

/**
 * Checks if two bodies can collide based on their collision filters
 */
export function canBodiesCollide(bodyA: CollisionBody, bodyB: CollisionBody): boolean {
  // Check if collision detection is disabled for either body
  if (bodyA.collisionEnabled === false || bodyB.collisionEnabled === false) {
    return false;
  }
  
  // Handle legacy collision layers for backward compatibility
  if (
    bodyA.collisionLayer !== undefined &&
    bodyB.collisionLayer !== undefined &&
    bodyA.collisionLayer !== bodyB.collisionLayer
  ) {
    return false;
  }
  
  // If either body has no collision filter, use default behavior
  if (!bodyA.collisionFilter || !bodyB.collisionFilter) {
    return true;
  }
  
  // Check collision groups (non-zero and same sign groups have special behavior)
  const groupA = bodyA.collisionFilter.group || 0;
  const groupB = bodyB.collisionFilter.group || 0;
  
  // If both bodies have the same non-zero group
  if (groupA !== 0 && groupA === groupB) {
    // Positive groups always collide, negative groups never collide
    return groupA > 0;
  }
  
  // Check category/mask pairs
  const categoryA = bodyA.collisionFilter.category;
  const maskA = bodyA.collisionFilter.mask;
  const categoryB = bodyB.collisionFilter.category;
  const maskB = bodyB.collisionFilter.mask;
  
  // Bodies collide if each one's category is in the other's mask
  return (categoryA & maskB) !== 0 && (categoryB & maskA) !== 0;
}

/**
 * Detects collision between two bodies
 */
export function detectBodyCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  // Check if bodies can collide based on collision filters
  if (!canBodiesCollide(bodyA, bodyB)) {
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
  
  const shapeA = bodyA.shape;
  const shapeB = bodyB.shape;
  const rotationA = bodyA.rotation ?? 0;
  const rotationB = bodyB.rotation ?? 0;

  // Dispatch to appropriate collision detection function based on shape types
  if (shapeA === CollisionShape.CIRCLE && shapeB === CollisionShape.CIRCLE) {
    return detectCircleCircleCollision(bodyA, bodyB);

  } else if (shapeA === CollisionShape.RECTANGLE && shapeB === CollisionShape.RECTANGLE) {
    // For rotated rectangles, convert to polygons and use SAT
    if (rotationA !== 0 || rotationB !== 0) {
      const polyA = rectangleToPolygon(bodyA);
      const polyB = rectangleToPolygon(bodyB);
      return detectPolygonPolygonCollision(polyA, polyB);
    } else {
      // For non-rotated rectangles, use faster AABB check
      return detectRectangleRectangleCollision(bodyA, bodyB);
    }

  } else if (shapeA === CollisionShape.POLYGON && shapeB === CollisionShape.POLYGON) {
    return detectPolygonPolygonCollision(bodyA, bodyB);

  } else if (shapeA === CollisionShape.RECTANGLE && shapeB === CollisionShape.POLYGON) {
    const polyA = rectangleToPolygon(bodyA); // Convert rect A to polygon
    return detectPolygonPolygonCollision(polyA, bodyB);

  } else if (shapeA === CollisionShape.POLYGON && shapeB === CollisionShape.RECTANGLE) {
    const polyB = rectangleToPolygon(bodyB); // Convert rect B to polygon
    return detectPolygonPolygonCollision(bodyA, polyB);

  } else if (shapeA === CollisionShape.CIRCLE && shapeB === CollisionShape.POLYGON) {
    return detectCirclePolygonCollision(bodyA, bodyB);

  } else if (shapeA === CollisionShape.POLYGON && shapeB === CollisionShape.CIRCLE) {
    // Swap the order and flip the normal
    const result = detectCirclePolygonCollision(bodyB, bodyA); // Note: bodyB is circle, bodyA is polygon
    if (result.collision) {
        // Ensure the result reflects the original body order
        result.bodyA = bodyA; // Polygon
        result.bodyB = bodyB; // Circle
        if (result.normal) {
             result.normal = { x: -result.normal.x, y: -result.normal.y }; // Flip normal
        }
    }
    return result;

  } else if (shapeA === CollisionShape.CIRCLE && shapeB === CollisionShape.RECTANGLE) {
    // For rotated rectangles, convert to polygon and use circle-polygon collision
    if (rotationB !== 0) {
      const polyB = rectangleToPolygon(bodyB);
      return detectCirclePolygonCollision(bodyA, polyB);
    } else {
      // Non-rotated rectangle
      return detectCircleRectangleCollision(bodyA, bodyB);
    }

  } else if (shapeA === CollisionShape.RECTANGLE && shapeB === CollisionShape.CIRCLE) {
    // For rotated rectangles, convert to polygon and use circle-polygon collision
    if (rotationA !== 0) {
      const polyA = rectangleToPolygon(bodyA);
      // Use detectCirclePolygonCollision with Circle (bodyB) first
      const result = detectCirclePolygonCollision(bodyB, polyA); 
      if (result.collision) {
          // Ensure the result reflects the original body order
          result.bodyA = bodyA; // Rectangle (as Polygon)
          result.bodyB = bodyB; // Circle
          if (result.normal) {
              result.normal = { x: -result.normal.x, y: -result.normal.y }; // Flip normal
          }
      }
      return result;
    } else {
      // Non-rotated rectangle
      // Swap the order for detectCircleRectangleCollision and flip the normal
      const result = detectCircleRectangleCollision(bodyB, bodyA); // Note: bodyB is circle, bodyA is rectangle
      if (result.collision) {
          // Ensure the result reflects the original body order
          result.bodyA = bodyA; // Rectangle
          result.bodyB = bodyB; // Circle
          if (result.normal) {
              result.normal = { x: -result.normal.x, y: -result.normal.y }; // Flip normal
          }
      }
      return result;
    }

  } else if (shapeA === CollisionShape.POINT && shapeB === CollisionShape.CIRCLE) {
    return detectPointCircleCollision(bodyA, bodyB);

  } else if (shapeA === CollisionShape.CIRCLE && shapeB === CollisionShape.POINT) {
    // Swap the order and flip the normal
    const result = detectPointCircleCollision(bodyB, bodyA); // Note: bodyB is point, bodyA is circle
    if (result.collision) {
        result.bodyA = bodyA; // Circle
        result.bodyB = bodyB; // Point
        if (result.normal) {
             result.normal = { x: -result.normal.x, y: -result.normal.y }; // Flip normal
        }
    }
    return result;

  } else if (shapeA === CollisionShape.POINT && shapeB === CollisionShape.RECTANGLE) {
    return detectPointRectangleCollision(bodyA, bodyB);

  } else if (shapeA === CollisionShape.RECTANGLE && shapeB === CollisionShape.POINT) {
    // Swap the order and flip the normal
    const result = detectPointRectangleCollision(bodyB, bodyA); // Note: bodyB is point, bodyA is rectangle
    if (result.collision) {
        result.bodyA = bodyA; // Rectangle
        result.bodyB = bodyB; // Point
        if (result.normal) {
            result.normal = { x: -result.normal.x, y: -result.normal.y }; // Flip normal
        }
    }
    return result;

  } else if (shapeA === CollisionShape.POINT && shapeB === CollisionShape.POLYGON) {
    // Implementation to be added
    return {
      collision: false,
      bodyA,
      bodyB
    };

  } else if (shapeA === CollisionShape.POLYGON && shapeB === CollisionShape.POINT) {
    // Implementation to be added
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
  
  // Default: no collision for unhandled pairs
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
  // Use type guards
  if (!isCircleData(bodyA.shapeData) || !isCircleData(bodyB.shapeData)) {
     console.error('Invalid shape data for Circle-Circle collision');
     return { collision: false, bodyA, bodyB };
  }
  const circleA = bodyA.shapeData;
  const circleB = bodyB.shapeData;
  
  const distVec = subtractVectors(bodyB.position, bodyA.position);
  const distSq = dotProduct(distVec, distVec); // Use dot product for squared distance
  const radiiSum = circleA.radius + circleB.radius;
  const radiiSumSq = radiiSum * radiiSum;
  
  if (distSq < radiiSumSq) {
    // Collision detected
    const dist = Math.sqrt(distSq);
    const normal = dist === 0 ? { x: 1, y: 0 } : normalizeVector(distVec); // Handle circles at same position
    const penetration = radiiSum - dist;
    
    // Calculate contact point: on the line connecting centers, at the edge of circle A
    const contactPoint = addVectors(bodyA.position, multiplyVector(normal, circleA.radius));

    // Calculate relative velocity
    const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
    
    return {
      collision: true,
      bodyA,
      bodyB,
      normal,
      contactPoint,
      penetration,
      relativeVelocity // Added relative velocity
    };
  } else {
    // No collision
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
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
  // Ensure bodyA is circle, bodyB is rectangle
  if (bodyA.shape !== CollisionShape.CIRCLE || bodyB.shape !== CollisionShape.RECTANGLE) {
      console.error('Invalid shape order for detectCircleRectangleCollision');
      return { collision: false, bodyA, bodyB };
  }
  // Use type guards
  if (!isCircleData(bodyA.shapeData) || !isRectangleData(bodyB.shapeData)) {
     console.error('Invalid shape data for Circle-Rectangle collision');
     return { collision: false, bodyA, bodyB };
  }
  const circle = bodyA.shapeData;
  const rect = bodyB.shapeData;

  // Find the closest point on the rectangle to the circle's center
  const circleCenter = bodyA.position;
  const rectCenter = bodyB.position;
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  
  const closestPoint = {
    x: Math.max(rectCenter.x - halfWidth, Math.min(circleCenter.x, rectCenter.x + halfWidth)),
    y: Math.max(rectCenter.y - halfHeight, Math.min(circleCenter.y, rectCenter.y + halfHeight))
  };
  
  // Calculate distance between circle center and closest point
  const distVec = subtractVectors(circleCenter, closestPoint);
  const distSq = dotProduct(distVec, distVec); // Use dot product for squared distance
  const radiusSq = circle.radius * circle.radius;
  
  if (distSq < radiusSq) {
    // Collision detected
    const dist = Math.sqrt(distSq);
    const penetration = circle.radius - dist;
    // Normal points from rectangle (closest point) towards circle center
    const normal = dist === 0 ? { x: 1, y: 0 } : normalizeVector(distVec); 

    // Calculate relative velocity
    const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
    
    return {
      collision: true,
      bodyA, // Circle
      bodyB, // Rectangle
      normal, 
      contactPoint: closestPoint, // Closest point on rect is contact point
      penetration,
      relativeVelocity // Added relative velocity
    };
  } else {
    // No collision
    return {
      collision: false,
      bodyA,
      bodyB
    };
  }
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
 * Detects collision between a circle and a polygon
 */
function detectCirclePolygonCollision(bodyA: CollisionBody, bodyB: CollisionBody): CollisionResult {
  const circle = bodyA.shapeData as CircleData;
  const polygon = bodyB.shapeData as PolygonData;
  
  // Transform polygon vertices to account for position and rotation
  const transformedVertices = transformPolygonVertices(
    polygon.vertices,
    bodyB.position,
    bodyB.rotation || 0
  );
  
  // Get edges and normals for the polygon
  const edges = getPolygonEdges(transformedVertices);
  const normals = getPolygonNormals(edges);
  
  // Find the closest point on the polygon to the circle center
  let closestPoint: Vector2D | null = null;
  let minDistance = Infinity;
  
  // First, check if the circle center is inside the polygon
  let inside = true;
  
  for (let i = 0; i < transformedVertices.length; i++) {
    const v1 = transformedVertices[i];
    const v2 = transformedVertices[(i + 1) % transformedVertices.length];
    
    // Vector from vertex to circle center
    const toCircle = subtractVectors(bodyA.position, v1);
    
    // Edge vector
    const edge = subtractVectors(v2, v1);
    
    // Normal to the edge (pointing outward)
    const normal = normalizeVector({ x: -edge.y, y: edge.x });
    
    // If the circle center is on the outside of any edge, it's outside the polygon
    if (dotProduct(toCircle, normal) > 0) {
      inside = false;
      
      // Project the circle center onto the edge
      const projection = dotProduct(toCircle, normalizeVector(edge));
      
      let closestOnEdge: Vector2D;
      
      if (projection <= 0) {
        // Closest to v1
        closestOnEdge = v1;
      } else if (projection >= vectorMagnitude(edge)) {
        // Closest to v2
        closestOnEdge = v2;
      } else {
        // Closest to a point on the edge
        closestOnEdge = {
          x: v1.x + normalizeVector(edge).x * projection,
          y: v1.y + normalizeVector(edge).y * projection
        };
      }
      
      const distance = vectorDistance(bodyA.position, closestOnEdge);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = closestOnEdge;
      }
    }
  }
  
  if (inside) {
    // Circle center is inside polygon; find closest edge
    let minPenetration = Infinity;
    let penetrationNormal: Vector2D = { x: 0, y: 0 };
    
    for (let i = 0; i < normals.length; i++) {
      const normal = normals[i];
      
      // Project circle center onto the normal
      const distanceFromEdge = dotProduct(
        subtractVectors(bodyA.position, transformedVertices[i]),
        normal
      );
      
      if (distanceFromEdge < minPenetration) {
        minPenetration = distanceFromEdge;
        penetrationNormal = normal;
      }
    }
    
    // We want the normal pointing from A to B, but the polygon is B, so invert
    penetrationNormal = { x: -penetrationNormal.x, y: -penetrationNormal.y };
    
    return {
      collision: true,
      bodyA,
      bodyB,
      normal: penetrationNormal,
      contactPoint: {
        x: bodyA.position.x - penetrationNormal.x * (circle.radius - minPenetration),
        y: bodyA.position.y - penetrationNormal.y * (circle.radius - minPenetration)
      },
      penetration: circle.radius + minPenetration,
      relativeVelocity: subtractVectors(bodyB.velocity, bodyA.velocity)
    };
  }
  
  if (closestPoint && minDistance <= circle.radius) {
    // Collision detected based on closest point outside
    // Get collision normal (from polygon to circle)
    const normal = normalizeVector(subtractVectors(bodyA.position, closestPoint));
    
    // Calculate penetration
    const penetration = circle.radius - minDistance;
    
    // Calculate contact point
    const contactPoint = {
      x: closestPoint.x,
      y: closestPoint.y
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
 * Resolves a collision by calculating and applying impulses
 * @returns The magnitude of the normal impulse applied.
 */
export function resolveCollisionWithImpulse(result: CollisionResult): number { // Return impulse magnitude
  if (!result.collision) return 0;
  
  const { bodyA, bodyB, normal, penetration } = result;
  if (!normal) return 0;
  
  // Skip collision resolution if either body is static
  if (bodyA.isStatic && bodyB.isStatic) return 0;
  
  // Get restitution (bounciness) - use highest value from both materials
  const restitutionA = bodyA.material?.restitution ?? 0.2;
  const restitutionB = bodyB.material?.restitution ?? 0.2;
  const restitution = Math.max(restitutionA, restitutionB);
  
  // Get friction coefficients
  const frictionA = bodyA.material?.friction ?? 0.1;
  const frictionB = bodyB.material?.friction ?? 0.1;
  const friction = (frictionA + frictionB) * 0.5; // Average the friction
  
  // Calculate inverse masses
  const inverseMassA = (bodyA.isStatic || bodyA.mass === Infinity || bodyA.mass === 0) ? 0 : 1 / bodyA.mass;
  const inverseMassB = (bodyB.isStatic || bodyB.mass === Infinity || bodyB.mass === 0) ? 0 : 1 / bodyB.mass;
  const totalInverseMass = inverseMassA + inverseMassB;

  // If both bodies are effectively static, no impulse needed
  if (totalInverseMass <= 0) {
      return 0;
  }

  // Calculate relative velocity
  const relativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
  
  // Calculate relative velocity along the normal
  const velocityAlongNormal = dotProduct(relativeVelocity, normal);
  
  // Don't resolve if objects are moving away from each other
  if (velocityAlongNormal > 0) return 0;
  
  // Calculate normal impulse scalar (j)
  const j = -(1 + restitution) * velocityAlongNormal / totalInverseMass;
  
  // Apply normal impulse
  const normalImpulseVector = multiplyVector(normal, j);
  
  // Update velocities based on normal impulse
  if (!bodyA.isStatic) {
    bodyA.velocity = subtractVectors(bodyA.velocity, multiplyVector(normalImpulseVector, inverseMassA));
  }
  if (!bodyB.isStatic) {
    bodyB.velocity = addVectors(bodyB.velocity, multiplyVector(normalImpulseVector, inverseMassB));
  }
  
  // --- Apply Friction Impulse ---
  const updatedRelativeVelocity = subtractVectors(bodyB.velocity, bodyA.velocity);
  const tangent = { x: -normal.y, y: normal.x };
  const velAlongTangent = dotProduct(updatedRelativeVelocity, tangent);
  const jt = -velAlongTangent / totalInverseMass;
  const maxFrictionImpulse = Math.abs(j * friction);
  const frictionImpulseScalar = Math.max(-maxFrictionImpulse, Math.min(jt, maxFrictionImpulse));

  // Apply friction impulse only if the scalar is non-negligible
  if (Math.abs(frictionImpulseScalar) > 1e-6) { // Add a tolerance check
      const frictionImpulseVector = multiplyVector(tangent, frictionImpulseScalar);
      
      if (!bodyA.isStatic) {
          bodyA.velocity = subtractVectors(bodyA.velocity, multiplyVector(frictionImpulseVector, inverseMassA));
      }
      if (!bodyB.isStatic) {
          bodyB.velocity = addVectors(bodyB.velocity, multiplyVector(frictionImpulseVector, inverseMassB));
      }
  }
  
  // --- Positional Correction --- (Simple separation)
  // Ensure penetration is a valid number before proceeding
  if (penetration && typeof penetration === 'number' && !isNaN(penetration) && penetration > 0.01) {
      const percent = 0.3; // Correction percentage
      const slop = 0.01; // Allowable penetration
      const correctionMagnitude = Math.max(penetration - slop, 0) / totalInverseMass * percent;
      const correctionVector = multiplyVector(normal, correctionMagnitude);
      
      bodyA.position = subtractVectors(bodyA.position, multiplyVector(correctionVector, inverseMassA));
      bodyB.position = addVectors(bodyB.position, multiplyVector(correctionVector, inverseMassB));
  }

  return j; // Return the magnitude of the normal impulse
}

/**
 * SpatialGrid for efficient broad-phase collision detection
 * Divides the scene into cells for faster collision checks
 */
export class SpatialGrid {
  private cells: Map<string, CollisionBody[]> = new Map();
  private cellSize: number;

  /**
   * Creates a new spatial grid
   * @param cellSize Size of each grid cell (larger = fewer cells but more objects per cell)
   */
  constructor(cellSize = 50) {
    this.cellSize = cellSize;
  }

  /**
   * Gets the cell key for a position
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Gets the cell keys that a body occupies
   */
  private getBodyCellKeys(body: CollisionBody): string[] {
    const keys: string[] = [];
    let minX: number, minY: number, maxX: number, maxY: number;

    switch (body.shape) {
      case CollisionShape.CIRCLE:
        const circle = body.shapeData as CircleData;
        minX = body.position.x - circle.radius;
        minY = body.position.y - circle.radius;
        maxX = body.position.x + circle.radius;
        maxY = body.position.y + circle.radius;
        break;
      case CollisionShape.RECTANGLE:
        const rect = body.shapeData as RectangleData;
        minX = body.position.x - rect.width / 2;
        minY = body.position.y - rect.height / 2;
        maxX = body.position.x + rect.width / 2;
        maxY = body.position.y + rect.height / 2;
        break;
      case CollisionShape.POINT:
        // For points, just use the position
        minX = maxX = body.position.x;
        minY = maxY = body.position.y;
        break;
      case CollisionShape.POLYGON:
        // For polygons, calculate the bounding box
        const polygon = body.shapeData as PolygonData;
        if (polygon.vertices.length === 0) {
          minX = maxX = body.position.x;
          minY = maxY = body.position.y;
        } else {
          minX = maxX = polygon.vertices[0].x + body.position.x;
          minY = maxY = polygon.vertices[0].y + body.position.y;
          
          for (let i = 1; i < polygon.vertices.length; i++) {
            const x = polygon.vertices[i].x + body.position.x;
            const y = polygon.vertices[i].y + body.position.y;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
        break;
    }

    // Get all cell keys this body occupies
    const startCellX = Math.floor(minX / this.cellSize);
    const startCellY = Math.floor(minY / this.cellSize);
    const endCellX = Math.floor(maxX / this.cellSize);
    const endCellY = Math.floor(maxY / this.cellSize);

    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
      for (let cellY = startCellY; cellY <= endCellY; cellY++) {
        keys.push(`${cellX},${cellY}`);
      }
    }

    return keys;
  }

  /**
   * Inserts a body into the grid
   */
  public insertBody(body: CollisionBody): void {
    const cellKeys = this.getBodyCellKeys(body);
    
    for (const key of cellKeys) {
      if (!this.cells.has(key)) {
        this.cells.set(key, []);
      }
      this.cells.get(key)!.push(body);
    }
  }

  /**
   * Updates a body's position in the grid
   */
  public updateBody(body: CollisionBody): void {
    this.removeBody(body);
    this.insertBody(body);
  }

  /**
   * Removes a body from the grid
   */
  public removeBody(body: CollisionBody): void {
    for (const [key, bodies] of this.cells.entries()) {
      const index = bodies.findIndex(b => b.id === body.id);
      if (index !== -1) {
        bodies.splice(index, 1);
        if (bodies.length === 0) {
          this.cells.delete(key);
        }
      }
    }
  }

  /**
   * Clears the grid
   */
  public clear(): void {
    this.cells.clear();
  }

  /**
   * Gets potential collision pairs (Original Simple Implementation)
   */
  public getPotentialCollisionPairs(): { bodyA: CollisionBody; bodyB: CollisionBody }[] {
    const pairs: { bodyA: CollisionBody; bodyB: CollisionBody }[] = [];
    const checked = new Set<string>();

    // For each cell
    for (const [_, bodies] of this.cells.entries()) {
      // Check each body against others in the same cell
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const bodyA = bodies[i];
          const bodyB = bodies[j];
          
          // Skip if both are static
          if (bodyA.isStatic && bodyB.isStatic) continue;
          
          // Skip if collision filtering prevents collision
          if (!canBodiesCollide(bodyA, bodyB)) continue;
          
          // Create a unique pair ID to avoid duplicates
          const pairId = bodyA.id < bodyB.id 
            ? `${bodyA.id}-${bodyB.id}` 
            : `${bodyB.id}-${bodyA.id}`;
          
          if (!checked.has(pairId)) {
            checked.add(pairId);
            pairs.push({ bodyA, bodyB });
          }
        }
      }
    }

    return pairs;
  }
}

/**
 * Types of collision events
 */
export enum CollisionEventType {
  /** Triggered when a collision starts (first detected) */
  START = 'collisionStart',
  
  /** Triggered on each update while a collision continues */
  ACTIVE = 'collisionActive',
  
  /** Triggered when a collision ends */
  END = 'collisionEnd'
}

/**
 * Collision event data passed to callbacks
 */
export interface CollisionEvent {
  /** Type of collision event */
  type: CollisionEventType;
  
  /** The collision result with detailed collision data */
  collision: CollisionResult;
  
  /** Timestamp when the event occurred */
  timestamp: number;
  
  /** Time duration of the collision (for ACTIVE and END events) */
  duration?: number;
  
  /** Impulse applied during the collision */
  impulse?: number;
}

/**
 * Collision event callback function type
 */
export type CollisionEventCallback = (event: CollisionEvent) => void;

/**
 * Collision event subscription with filter options
 */
export interface CollisionEventSubscription {
  /** Callback function to execute when event occurs */
  callback: CollisionEventCallback;
  
  /** Optional body ID to filter events (only receive events for this body) */
  bodyId?: string | number;
  
  /** Optional event type to filter (only receive this type of event) */
  eventType?: CollisionEventType;
  
  /** Unique identifier for this subscription */
  id: string;
}

/**
 * Stores information about an active collision for tracking
 */
interface ActiveCollision {
  /** Unique pair ID identifying the two colliding bodies */
  pairId: string;
  
  /** The two colliding bodies */
  bodyA: CollisionBody;
  bodyB: CollisionBody;
  
  /** When the collision started */
  startTime: number;
  
  /** Last collision result */
  lastResult: CollisionResult;
}

/**
 * Collision system to manage all collision bodies and handle collision detection and response
 */
export class CollisionSystem {
  private bodies: CollisionBody[] = [];
  private collisionPairs: { bodyA: CollisionBody; bodyB: CollisionBody }[] = [];
  private spatialGrid: SpatialGrid;
  private useSpatialGrid = true; // Enable by default for better performance
  
  // Collision event system
  private eventSubscriptions: CollisionEventSubscription[] = [];
  private activeCollisions: Map<string, ActiveCollision> = new Map();
  
  /**
   * Creates a new collision system
   * @param cellSize Size of spatial grid cells for broad-phase collision detection
   * @param useSpatialGrid Whether to use spatial partitioning for broad-phase
   */
  constructor(cellSize = 50, useSpatialGrid = true) {
    this.spatialGrid = new SpatialGrid(cellSize);
    this.useSpatialGrid = useSpatialGrid;
  }
  
  /**
   * Adds a collision body to the system
   */
  public addBody(body: CollisionBody): void {
    this.bodies.push(body);
    if (this.useSpatialGrid) {
      this.spatialGrid.insertBody(body);
    }
  }
  
  /**
   * Removes a collision body from the system
   */
  public removeBody(id: string | number): void {
    const body = this.bodies.find(body => body.id === id);
    if (body && this.useSpatialGrid) {
      this.spatialGrid.removeBody(body);
    }
    
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
      const oldPosition = { ...body.position };
      Object.assign(body, properties);
      
      // If position changed, update spatial grid
      if (this.useSpatialGrid && 
          (properties.position && 
           (properties.position.x !== oldPosition.x || 
            properties.position.y !== oldPosition.y))) {
        this.spatialGrid.updateBody(body);
      }
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
    if (this.useSpatialGrid) {
      // Use spatial grid for efficient broad-phase collision detection
      this.collisionPairs = this.spatialGrid.getPotentialCollisionPairs();
    } else {
      // Fallback to brute force method
      this.collisionPairs = [];
      
      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = i + 1; j < this.bodies.length; j++) {
          const bodyA = this.bodies[i];
          const bodyB = this.bodies[j];
          
          // Skip if both bodies are static
          if (bodyA.isStatic && bodyB.isStatic) continue;
          
          // Skip if collision filtering prevents collision
          if (!canBodiesCollide(bodyA, bodyB)) continue;
          
          this.collisionPairs.push({ bodyA, bodyB });
        }
      }
    }
  }
  
  /**
   * Detects and resolves all collisions in the system
   * @returns Array of collision results
   */
  public update(): CollisionResult[] {
    // Update spatial grid for all bodies (if using spatial grid)
    if (this.useSpatialGrid) {
      this.spatialGrid.clear();
      for (const body of this.bodies) {
        this.spatialGrid.insertBody(body);
      }
    }
    
    // Update collision pairs
    this.updateCollisionPairs();
    
    const collisionResults: CollisionResult[] = [];
    const currentTime = Date.now();
    const endedCollisions: string[] = [];
    
    // Track which pairs we've seen this update
    const activePairIds = new Set<string>();
    
    // Check all collision pairs
    for (const pair of this.collisionPairs) {
      const result = detectBodyCollision(pair.bodyA, pair.bodyB);
      
      const pairId = pair.bodyA.id < pair.bodyB.id 
        ? `${pair.bodyA.id}-${pair.bodyB.id}` 
        : `${pair.bodyB.id}-${pair.bodyA.id}`;
        
      if (result.collision) {
        activePairIds.add(pairId);
        
        // Resolve the collision
        const impulse = resolveCollisionWithImpulse(result);
        collisionResults.push(result);
        
        // Handle collision events
        if (this.eventSubscriptions.length > 0) {
          if (this.activeCollisions.has(pairId)) {
            // Continuing collision
            const activeCollision = this.activeCollisions.get(pairId)!;
            activeCollision.lastResult = result;
            
            // Trigger ACTIVE event
            this.triggerCollisionEvent({
              type: CollisionEventType.ACTIVE,
              collision: result,
              timestamp: currentTime,
              duration: currentTime - activeCollision.startTime,
              impulse
            });
          } else {
            // New collision
            this.activeCollisions.set(pairId, {
              pairId,
              bodyA: pair.bodyA,
              bodyB: pair.bodyB,
              startTime: currentTime,
              lastResult: result
            });
            
            // Trigger START event
            this.triggerCollisionEvent({
              type: CollisionEventType.START,
              collision: result,
              timestamp: currentTime,
              impulse
            });
          }
        }
      }
    }
    
    // --- Debug Log for END Event --- 
    const isEndEventTestFrame2 = Array.from(this.activeCollisions.keys()).includes('circle1-circle2');
    if (isEndEventTestFrame2) {
      console.log('[End Event Debug] Frame 2 Start');
      console.log('[End Event Debug] Active Collisions Before Check:', Array.from(this.activeCollisions.keys()));
      console.log('[End Event Debug] Active Pair IDs This Frame:', Array.from(activePairIds));
    }
    // --- End Debug Log ---

    // Check for ended collisions
    if (this.eventSubscriptions.length > 0) {
      for (const [pairId, activeCollision] of this.activeCollisions.entries()) {
        if (isEndEventTestFrame2) { // Log check for the specific pair
           console.log(`[End Event Debug] Checking pairId: ${pairId}. In activePairIds? ${activePairIds.has(pairId)}`);
        }
        if (!activePairIds.has(pairId)) {
          // Collision has ended
          endedCollisions.push(pairId);
          
          if (isEndEventTestFrame2) {
             console.log(`[End Event Debug] Triggering END for ${pairId}`);
          }

          // Trigger END event
          this.triggerCollisionEvent({
            type: CollisionEventType.END,
            collision: activeCollision.lastResult,
            timestamp: currentTime,
            duration: currentTime - activeCollision.startTime
          });
        }
      }
      
      // Remove ended collisions
      for (const pairId of endedCollisions) {
        this.activeCollisions.delete(pairId);
      }
    }
    
    return collisionResults;
  }
  
  /**
   * Trigger collision event for subscribers
   */
  private triggerCollisionEvent(event: CollisionEvent): void {
    console.log(`[CollisionSystem] Triggering event: ${event.type} for pair ${event.collision.bodyA.id}-${event.collision.bodyB.id}`);
    
    this.eventSubscriptions.forEach(sub => {
      // Check type filter
      if (sub.eventType && sub.eventType !== event.type) {
        return;
      }
      
      // Check body filter
      if (
        sub.bodyId !== undefined &&
        sub.bodyId !== event.collision.bodyA.id &&
        sub.bodyId !== event.collision.bodyB.id
      ) {
        return;
      }
      
      // If filters pass, call the callback
      try {
        // console.log(`[CollisionSystem] Invoking callback for sub ID: ${sub.id}`); // Optional detailed log
        sub.callback(event);
      } catch (error) {
        console.error('[CollisionSystem] Error in collision event callback:', error);
      }
    });
  }
  
  /**
   * Subscribe to collision events
   * @param callback Function to call when matching collision events occur
   * @param options Optional filters to limit which events trigger the callback
   * @returns Subscription ID that can be used to unsubscribe
   */
  public onCollision(
    callback: CollisionEventCallback, 
    options?: { 
      bodyId?: string | number; 
      eventType?: CollisionEventType 
    }
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    this.eventSubscriptions.push({
      id: subscriptionId,
      callback,
      bodyId: options?.bodyId,
      eventType: options?.eventType
    });
    
    return subscriptionId;
  }
  
  /**
   * Unsubscribe from collision events
   * @param subscriptionId ID returned from onCollision
   * @returns Whether the subscription was found and removed
   */
  public offCollision(subscriptionId: string): boolean {
    const initialLength = this.eventSubscriptions.length;
    
    this.eventSubscriptions = this.eventSubscriptions.filter(
      subscription => subscription.id !== subscriptionId
    );
    
    return initialLength > this.eventSubscriptions.length;
  }
  
  /**
   * Remove all collision event subscriptions
   */
  public clearCollisionSubscriptions(): void {
    this.eventSubscriptions = [];
  }
  
  /**
   * Clear all bodies from the system
   */
  public clear(): void {
    this.bodies = [];
    this.collisionPairs = [];
    this.activeCollisions.clear();
    if (this.useSpatialGrid) {
      this.spatialGrid.clear();
    }
  }
  
  /**
   * Returns the current number of bodies in the system
   */
  public getBodyCount(): number {
    return this.bodies.length;
  }
  
  /**
   * Enable or disable spatial grid for broad-phase collision detection
   */
  public setSpatialGridEnabled(enabled: boolean): void {
    this.useSpatialGrid = enabled;
  }
  
  /**
   * Get the current collision pair count for performance monitoring
   */
  public getCollisionPairCount(): number {
    return this.collisionPairs.length;
  }
  
  /**
   * Sets the collision filter for a body
   */
  public setCollisionFilter(id: string | number, filter: CollisionFilter): void {
    const body = this.bodies.find(body => body.id === id);
    if (body) {
      body.collisionFilter = filter;
    }
  }
  
  /**
   * Create a collision filter with the specified properties
   */
  public createCollisionFilter(category: number, mask: number, group = 0): CollisionFilter {
    return { category, mask, group };
  }
}

/**
 * Creates a new collision system
 * @param cellSize Size of spatial grid cells for broad-phase collision detection
 * @param useSpatialGrid Whether to use spatial partitioning for broad-phase
 * @returns A new collision system instance
 */
export function createCollisionSystem(cellSize = 50, useSpatialGrid = true): CollisionSystem {
  return new CollisionSystem(cellSize, useSpatialGrid);
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

// Re-export types that were causing issues
export { CollisionShape };
export type { PhysicsMaterial };