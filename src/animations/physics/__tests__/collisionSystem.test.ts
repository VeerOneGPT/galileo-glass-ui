/**
 * Tests for the collision detection and response system
 */

import {
  CollisionBody,
  createCircleBody,
  createRectangleBody,
  createPointBody,
  createPolygonBody,
  detectBodyCollision,
  resolveCollisionWithImpulse,
  CollisionSystem,
  createCollisionSystem,
  createBoundaryWalls,
  SpatialGrid
} from '../collisionSystem';
import { CollisionShape } from '../types';
import { createVector, vectorDistance, vectorMagnitude } from '../physicsCalculations';
import { CollisionCategories } from '../collisionSystem';
import { CollisionEvent, CollisionEventType } from '../collisionSystem';

describe('Collision Detection', () => {
  // Test Circle-Circle collision detection
  describe('Circle-Circle Collision', () => {
    test('should detect collision between two overlapping circles', () => {
      const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
      const circleB = createCircleBody('b', { x: 15, y: 0 }, 10, 1);
      
      const result = detectBodyCollision(circleA, circleB);
      
      expect(result.collision).toBeTruthy();
      expect(result.normal).toBeDefined();
      expect(result.penetration).toBeCloseTo(5);
    });
    
    test('should not detect collision between non-overlapping circles', () => {
      const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
      const circleB = createCircleBody('b', { x: 25, y: 0 }, 10, 1);
      
      const result = detectBodyCollision(circleA, circleB);
      
      expect(result.collision).toBeFalsy();
    });
    
    test('should calculate correct normal direction', () => {
      const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
      const circleB = createCircleBody('b', { x: 15, y: 0 }, 10, 1);
      
      const result = detectBodyCollision(circleA, circleB);
      
      expect(result.normal).toBeDefined();
      expect(result.normal!.x).toBeCloseTo(1);
      expect(result.normal!.y).toBeCloseTo(0);
    });
  });
  
  // Test Rectangle-Rectangle collision detection
  describe('Rectangle-Rectangle Collision', () => {
    test('should detect collision between two overlapping rectangles', () => {
      const rectA = createRectangleBody('a', { x: 0, y: 0 }, 20, 20, 1);
      const rectB = createRectangleBody('b', { x: 15, y: 0 }, 20, 20, 1);
      
      const result = detectBodyCollision(rectA, rectB);
      
      expect(result.collision).toBeTruthy();
      expect(result.normal).toBeDefined();
      expect(result.penetration).toBeCloseTo(5);
    });
    
    test('should not detect collision between non-overlapping rectangles', () => {
      const rectA = createRectangleBody('a', { x: 0, y: 0 }, 20, 20, 1);
      const rectB = createRectangleBody('b', { x: 30, y: 0 }, 20, 20, 1);
      
      const result = detectBodyCollision(rectA, rectB);
      
      expect(result.collision).toBeFalsy();
    });
    
    test('should calculate correct normal for horizontal overlap', () => {
      const rectA = createRectangleBody('a', { x: 0, y: 0 }, 20, 20, 1);
      const rectB = createRectangleBody('b', { x: 15, y: 0 }, 20, 20, 1);
      
      const result = detectBodyCollision(rectA, rectB);
      
      expect(result.normal).toBeDefined();
      expect(result.normal!.x).not.toBeCloseTo(0);
      expect(result.normal!.y).toBeCloseTo(0);
    });
    
    test('should calculate correct normal for vertical overlap', () => {
      const rectA = createRectangleBody('a', { x: 0, y: 0 }, 20, 20, 1);
      const rectB = createRectangleBody('b', { x: 0, y: 15 }, 20, 20, 1);
      
      const result = detectBodyCollision(rectA, rectB);
      
      expect(result.normal).toBeDefined();
      expect(result.normal!.x).toBeCloseTo(0);
      expect(result.normal!.y).not.toBeCloseTo(0);
    });
  });
  
  // Test Circle-Rectangle collision detection
  describe('Circle-Rectangle Collision', () => {
    test('should detect collision between circle and rectangle', () => {
      const circle = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
      const rect = createRectangleBody('b', { x: 15, y: 0 }, 20, 20, 1);
      
      const result = detectBodyCollision(circle, rect);
      
      expect(result.collision).toBeTruthy();
      expect(result.normal).toBeDefined();
    });
    
    test('should not detect collision between non-overlapping circle and rectangle', () => {
      const circle = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
      const rect = createRectangleBody('b', { x: 25, y: 0 }, 20, 20, 1);
      
      const result = detectBodyCollision(circle, rect);
      
      expect(result.collision).toBeFalsy();
    });
    
    test('should handle circle center inside rectangle', () => {
      const circle = createCircleBody('a', { x: 15, y: 15 }, 10, 1);
      const rect = createRectangleBody('b', { x: 15, y: 15 }, 40, 40, 1);
      
      const result = detectBodyCollision(circle, rect);
      
      expect(result.collision).toBeTruthy();
      expect(result.normal).toBeDefined();
      expect(vectorMagnitude(result.normal!)).toBeCloseTo(1);
    });
  });
  
  // Test Point-Circle collision detection
  describe('Point-Circle Collision', () => {
    test('should detect collision between point and circle', () => {
      const point = createPointBody('a', { x: 0, y: 0 }, 1);
      const circle = createCircleBody('b', { x: 5, y: 0 }, 10, 1);
      
      const result = detectBodyCollision(point, circle);
      
      expect(result.collision).toBeTruthy();
      expect(result.normal).toBeDefined();
    });
    
    test('should not detect collision between non-overlapping point and circle', () => {
      const point = createPointBody('a', { x: 0, y: 0 }, 1);
      const circle = createCircleBody('b', { x: 20, y: 0 }, 10, 1);
      
      const result = detectBodyCollision(point, circle);
      
      expect(result.collision).toBeFalsy();
    });
  });
  
  // Test disabled collision detection
  describe('Disabled Collision', () => {
    test('should not detect collision when collision is disabled', () => {
      const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
      const circleB = createCircleBody('b', { x: 15, y: 0 }, 10, 1);
      
      circleA.collisionEnabled = false;
      
      const result = detectBodyCollision(circleA, circleB);
      
      expect(result.collision).toBeFalsy();
    });
    
    test('should not detect collision between different collision layers', () => {
      const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
      const circleB = createCircleBody('b', { x: 15, y: 0 }, 10, 1);
      
      circleA.collisionLayer = 1;
      circleB.collisionLayer = 2;
      
      const result = detectBodyCollision(circleA, circleB);
      
      expect(result.collision).toBeFalsy();
    });
  });
});

describe('Collision Response', () => {
  test('should correctly resolve collision between two circles', () => {
    const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1, { x: 5, y: 0 });
    const circleB = createCircleBody('b', { x: 15, y: 0 }, 10, 1, { x: -5, y: 0 });
    
    const result = detectBodyCollision(circleA, circleB);
    expect(result.collision).toBeTruthy();
    
    // Save original velocities
    const velA = { ...circleA.velocity };
    const velB = { ...circleB.velocity };
    
    resolveCollisionWithImpulse(result);
    
    // Velocities should be reversed approximately (with restitution)
    expect(Math.sign(circleA.velocity.x)).not.toEqual(Math.sign(velA.x));
    expect(Math.sign(circleB.velocity.x)).not.toEqual(Math.sign(velB.x));
  });
  
  test('should not move static bodies', () => {
    const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1, { x: 5, y: 0 });
    const circleB = createCircleBody('b', { x: 15, y: 0 }, 10, 1, { x: -5, y: 0 }, undefined, true);
    
    const result = detectBodyCollision(circleA, circleB);
    expect(result.collision).toBeTruthy();
    
    // Save original positions and velocities
    const posA = { ...circleA.position };
    const velA = { ...circleA.velocity };
    const posB = { ...circleB.position };
    const velB = { ...circleB.velocity };
    
    resolveCollisionWithImpulse(result);
    
    // Static body B should not move
    expect(circleB.position).toEqual(posB);
    expect(circleB.velocity).toEqual(velB);
    
    // Body A should change velocity
    expect(Math.sign(circleA.velocity.x)).not.toEqual(Math.sign(velA.x));
  });
  
  test('should apply friction during collision', () => {
    const circleA = createCircleBody('a', { x: 0, y: 0 }, 10, 1, { x: 0, y: 5 });
    const circleB = createCircleBody('b', { x: 15, y: 0 }, 10, 1, { x: 0, y: -5 });
    
    // Add physical materials with friction
    circleA.material = { density: 1, restitution: 0.5, friction: 0.5, airResistance: 0.01 };
    circleB.material = { density: 1, restitution: 0.5, friction: 0.5, airResistance: 0.01 };
    
    const result = detectBodyCollision(circleA, circleB);
    
    resolveCollisionWithImpulse(result);
    
    // Some horizontal friction force should be generated despite horizontal velocities being 0
    expect(Math.abs(circleA.velocity.x)).toBeGreaterThan(0.001);
    expect(Math.abs(circleB.velocity.x)).toBeGreaterThan(0.001);
  });
});

describe('Collision System', () => {
  test('should add and remove bodies', () => {
    const system = createCollisionSystem();
    
    const bodyA = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
    const bodyB = createCircleBody('b', { x: 20, y: 0 }, 10, 1);
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    
    expect(system.getBodyCount()).toBe(2);
    
    system.removeBody('a');
    
    expect(system.getBodyCount()).toBe(1);
    expect(system.getBody('b')).toBeDefined();
    expect(system.getBody('a')).toBeUndefined();
  });
  
  test('should update body properties', () => {
    const system = createCollisionSystem();
    
    const body = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
    system.addBody(body);
    
    system.updateBody('a', { 
      position: { x: 10, y: 10 },
      velocity: { x: 5, y: 5 }
    });
    
    const updatedBody = system.getBody('a');
    
    expect(updatedBody?.position.x).toBe(10);
    expect(updatedBody?.position.y).toBe(10);
    expect(updatedBody?.velocity.x).toBe(5);
    expect(updatedBody?.velocity.y).toBe(5);
  });
  
  test('should detect and resolve collisions', () => {
    const system = createCollisionSystem();
    
    const bodyA = createCircleBody('a', { x: 0, y: 0 }, 10, 1, { x: 5, y: 0 });
    const bodyB = createCircleBody('b', { x: 15, y: 0 }, 10, 1, { x: -5, y: 0 });
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    
    const results = system.update();
    
    expect(results.length).toBe(1);
    expect(results[0].collision).toBeTruthy();
    
    // Velocities should be reversed approximately
    expect(Math.sign(bodyA.velocity.x)).toBe(-1);
    expect(Math.sign(bodyB.velocity.x)).toBe(1);
  });
  
  test('should handle multiple collisions', () => {
    const system = createCollisionSystem();
    
    // Add three bodies that will all collide
    const bodyA = createCircleBody('a', { x: 0, y: 0 }, 10, 1, { x: 5, y: 0 });
    const bodyB = createCircleBody('b', { x: 15, y: 0 }, 10, 1, { x: 0, y: 0 });
    const bodyC = createCircleBody('c', { x: 30, y: 0 }, 10, 1, { x: -5, y: 0 });
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    system.addBody(bodyC);
    
    const results = system.update();
    
    // There should be two collisions: A-B and B-C
    expect(results.length).toBe(2);
  });
  
  test('should create boundary walls', () => {
    const walls = createBoundaryWalls('boundary', 0, 0, 100, 100, 10);
    
    // There should be 4 walls (top, right, bottom, left)
    expect(walls.length).toBe(4);
    
    // All walls should be static
    expect(walls.every(wall => wall.isStatic)).toBeTruthy();
    
    // Each wall should have appropriate dimensions
    // Check the positions of walls
    const top = walls.find(w => w.id === 'boundary_top');
    const right = walls.find(w => w.id === 'boundary_right');
    const bottom = walls.find(w => w.id === 'boundary_bottom');
    const left = walls.find(w => w.id === 'boundary_left');
    
    expect(top?.position.y).toBeLessThan(right?.position.y!);
    expect(bottom?.position.y).toBeGreaterThan(right?.position.y!);
    expect(left?.position.x).toBeLessThan(top?.position.x!);
    expect(right?.position.x).toBeGreaterThan(top?.position.x!);
  });
});

describe('Enhanced Collision System', () => {
  describe('Spatial Grid', () => {
    let grid: SpatialGrid;
    
    beforeEach(() => {
      grid = new SpatialGrid(50);
    });
    
    test('should correctly insert and retrieve bodies', () => {
      const body1 = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
      const body2 = createCircleBody('circle2', { x: 100, y: 100 }, 10, 1);
      
      grid.insertBody(body1);
      grid.insertBody(body2);
      
      const pairs = grid.getPotentialCollisionPairs();
      expect(pairs.length).toBe(0); // Bodies are far apart, should have no collision pairs
    });
    
    test('should correctly detect potential collision pairs', () => {
      const body1 = createCircleBody('circle1', { x: 0, y: 0 }, 30, 1);
      const body2 = createCircleBody('circle2', { x: 40, y: 0 }, 30, 1);
      
      grid.insertBody(body1);
      grid.insertBody(body2);
      
      const pairs = grid.getPotentialCollisionPairs();
      expect(pairs.length).toBe(1); // Bodies are close, should have 1 collision pair
    });
    
    test('should handle updating body positions', () => {
      const body1 = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
      grid.insertBody(body1);
      
      // Move body to new cell
      body1.position = { x: 100, y: 100 };
      grid.updateBody(body1);
      
      // Insert another body at original position
      const body2 = createCircleBody('circle2', { x: 0, y: 0 }, 10, 1);
      grid.insertBody(body2);
      
      const pairs = grid.getPotentialCollisionPairs();
      expect(pairs.length).toBe(0); // Bodies are far apart, should have no collision pairs
    });
  });
  
  describe('Collision Detection', () => {
    test('should correctly detect circle-circle collisions', () => {
      const circle1 = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
      const circle2 = createCircleBody('circle2', { x: 15, y: 0 }, 10, 1);
      
      const result = detectBodyCollision(circle1, circle2);
      
      expect(result.collision).toBe(true);
      expect(result.penetration).toBe(5); // Circles overlap by 5 units
      expect(result.normal?.x).toBeCloseTo(1); // Normal points along x-axis
      expect(result.normal?.y).toBeCloseTo(0);
    });
    
    test('should correctly detect rectangle-rectangle collisions (AABB)', () => {
      const rect1 = createRectangleBody('rect1', { x: 0, y: 0 }, 20, 20, 1);
      const rect2 = createRectangleBody('rect2', { x: 15, y: 0 }, 20, 20, 1);
      
      const result = detectBodyCollision(rect1, rect2);
      
      expect(result.collision).toBe(true);
      expect(result.penetration).toBe(5); // Rectangles overlap by 5 units
      expect(result.normal?.x).toBeCloseTo(1); // Normal points along x-axis
      expect(result.normal?.y).toBeCloseTo(0);
    });
    
    test('should correctly detect rotated rectangle collisions using SAT', () => {
      const rect1 = createRectangleBody('rect1', { x: 0, y: 0 }, 20, 20, 1, { x: 0, y: 0 }, Math.PI / 4);
      const rect2 = createRectangleBody('rect2', { x: 15, y: 0 }, 20, 20, 1, { x: 0, y: 0 }, -Math.PI / 4);
      
      const result = detectBodyCollision(rect1, rect2);
      expect(result.collision).toBe(true);
    });
    
    test('should correctly detect circle-rectangle collisions', () => {
      const circle = createCircleBody('circle', { x: 0, y: 0 }, 10, 1);
      const rect = createRectangleBody('rect', { x: 15, y: 0 }, 20, 20, 1);
      
      const result = detectBodyCollision(circle, rect);
      
      expect(result.collision).toBe(true);
      expect(result.normal?.x).toBeLessThan(0); // Normal points from rect to circle
    });
    
    test('should correctly detect polygon-polygon collisions', () => {
      const triangleA = createPolygonBody(
        'triangleA',
        { x: 0, y: 0 },
        [
          { x: 0, y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 }
        ],
        1
      );
      
      const triangleB = createPolygonBody(
        'triangleB',
        { x: 5, y: 0 },
        [
          { x: 0, y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 }
        ],
        1
      );
      
      const result = detectBodyCollision(triangleA, triangleB);
      expect(result.collision).toBe(true);
    });
    
    test('should correctly detect circle-polygon collisions', () => {
      const circle = createCircleBody('circle', { x: 0, y: 0 }, 10, 1);
      const triangle = createPolygonBody(
        'triangle',
        { x: 15, y: 0 },
        [
          { x: 0, y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 }
        ],
        1
      );
      
      const result = detectBodyCollision(circle, triangle);
      expect(result.collision).toBe(true);
    });
    
    test('should handle collision layers correctly', () => {
      const circle1 = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
      circle1.collisionLayer = 1;
      
      const circle2 = createCircleBody('circle2', { x: 15, y: 0 }, 10, 1);
      circle2.collisionLayer = 2;
      
      const result = detectBodyCollision(circle1, circle2);
      expect(result.collision).toBe(false); // Different layers shouldn't collide
    });
  });
  
  describe('Collision System Integration', () => {
    let system: CollisionSystem;
    
    beforeEach(() => {
      system = createCollisionSystem(100, true);
    });
    
    test('should handle multiple bodies efficiently', () => {
      // Add 100 bodies to the system
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const body = createCircleBody(
            `circle_${i}_${j}`,
            { x: i * 50, y: j * 50 },
            5,
            1
          );
          system.addBody(body);
        }
      }
      
      expect(system.getBodyCount()).toBe(100);
      
      // Should produce collision pairs only for nearby bodies
      const collisions = system.update();
      expect(collisions.length).toBe(0); // No collisions with this spacing
      
      // The key is that without spatial partitioning, we'd have 4950 collision checks (n*(n-1)/2)
      // With spatial partitioning, most distant pairs are filtered out early
      expect(system.getCollisionPairCount()).toBeLessThan(500);
    });
    
    test('should resolve collisions correctly', () => {
      const bodyA = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1, { x: 1, y: 0 });
      const bodyB = createCircleBody('circle2', { x: 25, y: 0 }, 10, 1, { x: -1, y: 0 });
      
      system.addBody(bodyA);
      system.addBody(bodyB);
      
      // Bodies are moving toward each other
      const collisions = system.update();
      
      // No collision yet
      expect(collisions.length).toBe(0);
      
      // Move bodies to create collision
      bodyA.position = { x: 5, y: 0 };
      bodyB.position = { x: 20, y: 0 };
      
      const collisions2 = system.update();
      
      // Should detect collision
      expect(collisions2.length).toBe(1);
      
      // Velocities should have changed direction due to collision response
      expect(bodyA.velocity.x).toBeLessThan(0); // Should bounce back
      expect(bodyB.velocity.x).toBeGreaterThan(0); // Should bounce back
    });
    
    test('should handle removal of bodies', () => {
      const bodyA = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
      const bodyB = createCircleBody('circle2', { x: 15, y: 0 }, 10, 1);
      
      system.addBody(bodyA);
      system.addBody(bodyB);
      
      expect(system.getBodyCount()).toBe(2);
      
      // Should detect collision
      const collisions = system.update();
      expect(collisions.length).toBe(1);
      
      // Remove a body
      system.removeBody('circle1');
      expect(system.getBodyCount()).toBe(1);
      
      // Should no longer detect collisions
      const collisions2 = system.update();
      expect(collisions2.length).toBe(0);
    });
  });
});

describe('Collision Filtering System', () => {
  test('should respect collision categories and masks', () => {
    const system = createCollisionSystem();
    
    // Create bodies in different categories
    const categoryA = CollisionCategories.UI_ELEMENT;
    const categoryB = CollisionCategories.DRAGGABLE;
    const categoryC = CollisionCategories.SENSOR;
    
    // bodyA collides with bodyB but not bodyC
    const bodyA = createCircleBody(
      'a', 
      { x: 0, y: 0 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: categoryA, 
        mask: categoryB // Can only collide with DRAGGABLE
      }
    );
    
    // bodyB collides with everyone
    const bodyB = createCircleBody(
      'b', 
      { x: 15, y: 0 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: categoryB, 
        mask: CollisionCategories.ALL // Can collide with all categories
      }
    );
    
    // bodyC collides with only bodyB
    const bodyC = createCircleBody(
      'c', 
      { x: 15, y: 20 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: categoryC, 
        mask: categoryB // Can only collide with DRAGGABLE
      }
    );
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    system.addBody(bodyC);
    
    // Move bodies to ensure they overlap
    bodyA.position = { x: 0, y: 0 };
    bodyB.position = { x: 15, y: 0 }; // Overlaps with bodyA
    bodyC.position = { x: 0, y: 15 }; // Overlaps with bodyA, but shouldn't collide
    
    const collisions = system.update();
    
    // Only bodyA and bodyB should collide, bodyC should not collide with bodyA
    expect(collisions.length).toBe(1);
    
    // Check the specific collision pair
    const collision = collisions[0];
    expect(
      (collision.bodyA.id === 'a' && collision.bodyB.id === 'b') ||
      (collision.bodyA.id === 'b' && collision.bodyB.id === 'a')
    ).toBeTruthy();
  });
  
  test('should respect collision groups', () => {
    const system = createCollisionSystem();
    
    // Bodies in positive groups always collide
    const bodyA1 = createCircleBody(
      'a1', 
      { x: 0, y: 0 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: CollisionCategories.DEFAULT, 
        mask: 0x0000, // Would normally prevent collision
        group: 1 // Positive group
      }
    );
    
    const bodyA2 = createCircleBody(
      'a2', 
      { x: 15, y: 0 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: CollisionCategories.DEFAULT, 
        mask: 0x0000, // Would normally prevent collision
        group: 1 // Same positive group as bodyA1
      }
    );
    
    // Bodies in negative groups never collide
    const bodyB1 = createCircleBody(
      'b1', 
      { x: 0, y: 30 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: CollisionCategories.DEFAULT, 
        mask: CollisionCategories.ALL, // Would normally allow collision
        group: -1 // Negative group
      }
    );
    
    const bodyB2 = createCircleBody(
      'b2', 
      { x: 15, y: 30 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: CollisionCategories.DEFAULT, 
        mask: CollisionCategories.ALL, // Would normally allow collision
        group: -1 // Same negative group as bodyB1
      }
    );
    
    system.addBody(bodyA1);
    system.addBody(bodyA2);
    system.addBody(bodyB1);
    system.addBody(bodyB2);
    
    const collisions = system.update();
    
    // Only bodyA1 and bodyA2 should collide (positive group)
    // bodyB1 and bodyB2 should not collide (negative group)
    expect(collisions.length).toBe(1);
    
    // Check the specific collision pair
    const collision = collisions[0];
    expect(
      (collision.bodyA.id === 'a1' && collision.bodyB.id === 'a2') ||
      (collision.bodyA.id === 'a2' && collision.bodyB.id === 'a1')
    ).toBeTruthy();
  });
  
  test('should allow dynamic updating of collision filters', () => {
    const system = createCollisionSystem();
    
    // Create two bodies that initially don't collide
    const bodyA = createCircleBody(
      'a', 
      { x: 0, y: 0 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: CollisionCategories.UI_ELEMENT, 
        mask: CollisionCategories.UI_ELEMENT // Can only collide with other UI elements
      }
    );
    
    const bodyB = createCircleBody(
      'b', 
      { x: 15, y: 0 }, 
      10, 
      1, 
      { x: 0, y: 0 }, 
      undefined, 
      false, 
      { 
        category: CollisionCategories.DRAGGABLE, 
        mask: CollisionCategories.DRAGGABLE // Can only collide with other draggables
      }
    );
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    
    // Initially, they shouldn't collide despite overlapping
    let collisions = system.update();
    expect(collisions.length).toBe(0);
    
    // Update bodyA's collision filter to collide with draggables
    system.setCollisionFilter('a', {
      category: CollisionCategories.UI_ELEMENT,
      mask: CollisionCategories.UI_ELEMENT | CollisionCategories.DRAGGABLE
    });
    
    // Update bodyB's collision filter to collide with UI elements
    system.setCollisionFilter('b', {
      category: CollisionCategories.DRAGGABLE,
      mask: CollisionCategories.DRAGGABLE | CollisionCategories.UI_ELEMENT
    });
    
    // Now they should collide
    collisions = system.update();
    expect(collisions.length).toBe(1);
  });
});

describe('Collision Event System', () => {
  test('should trigger START event when collision begins', () => {
    const system = createCollisionSystem();
    
    // Create two bodies that don't initially collide
    const bodyA = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
    const bodyB = createCircleBody('circle2', { x: 30, y: 0 }, 10, 1);
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    
    // Set up collision event listener
    const collisionEvents: CollisionEvent[] = [];
    system.onCollision(event => {
      collisionEvents.push(event);
    }, { eventType: CollisionEventType.START });
    
    // No collision yet
    system.update();
    expect(collisionEvents.length).toBe(0);
    
    // Move bodies to create collision
    bodyB.position = { x: 15, y: 0 }; // Now they overlap
    
    // Should trigger START event
    system.update();
    expect(collisionEvents.length).toBe(1);
    expect(collisionEvents[0].type).toBe(CollisionEventType.START);
    expect(collisionEvents[0].collision.collision).toBe(true);
    expect(collisionEvents[0].impulse).toBeDefined();
  });
  
  test('should trigger ACTIVE events during ongoing collision', () => {
    const system = createCollisionSystem();
    
    // Create two overlapping bodies
    const bodyA = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
    const bodyB = createCircleBody('circle2', { x: 15, y: 0 }, 10, 1);
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    
    // Set up collision event listener
    const activeEvents: CollisionEvent[] = [];
    system.onCollision(event => {
      if (event.type === CollisionEventType.ACTIVE) {
        activeEvents.push(event);
      }
    });
    
    // First update - should trigger START but not ACTIVE
    system.update();
    expect(activeEvents.length).toBe(0);
    
    // Second update - should trigger ACTIVE since collision continues
    system.update();
    expect(activeEvents.length).toBe(1);
    expect(activeEvents[0].type).toBe(CollisionEventType.ACTIVE);
    expect(activeEvents[0].duration).toBeGreaterThan(0);
    
    // Third update - should trigger another ACTIVE
    system.update();
    expect(activeEvents.length).toBe(2);
  });
  
  test('should trigger END event when collision ends', () => {
    const system = createCollisionSystem();
    
    // Create two overlapping bodies
    const bodyA = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
    const bodyB = createCircleBody('circle2', { x: 15, y: 0 }, 10, 1);
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    
    // Set up collision event listeners
    const endEvents: CollisionEvent[] = [];
    system.onCollision(event => {
      if (event.type === CollisionEventType.END) {
        endEvents.push(event);
      }
    });
    
    // Initial collision
    system.update();
    expect(endEvents.length).toBe(0);
    
    // Move bodies apart
    bodyB.position = { x: 30, y: 0 }; // No longer overlapping
    
    // Should trigger END event
    system.update();
    expect(endEvents.length).toBe(1);
    expect(endEvents[0].type).toBe(CollisionEventType.END);
    expect(endEvents[0].duration).toBeGreaterThan(0);
  });
  
  test('should filter events by body ID', () => {
    const system = createCollisionSystem();
    
    // Create three bodies where two pairs collide
    const bodyA = createCircleBody('a', { x: 0, y: 0 }, 10, 1);
    const bodyB = createCircleBody('b', { x: 15, y: 0 }, 10, 1); // Collides with A
    const bodyC = createCircleBody('c', { x: 0, y: 25 }, 10, 1); // Collides with A
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    system.addBody(bodyC);
    
    // Only listen to collisions involving bodyB
    const bEvents: CollisionEvent[] = [];
    system.onCollision(event => {
      bEvents.push(event);
    }, { bodyId: 'b' });
    
    // Both collisions should occur
    system.update();
    
    // But only one event should be captured (for bodyB)
    expect(bEvents.length).toBe(1);
    
    // The collision should involve bodyB
    const collision = bEvents[0].collision;
    expect(
      (collision.bodyA.id === 'b' || collision.bodyB.id === 'b')
    ).toBeTruthy();
  });
  
  test('should allow unsubscribing from events', () => {
    const system = createCollisionSystem();
    
    // Create two overlapping bodies
    const bodyA = createCircleBody('circle1', { x: 0, y: 0 }, 10, 1);
    const bodyB = createCircleBody('circle2', { x: 15, y: 0 }, 10, 1);
    
    system.addBody(bodyA);
    system.addBody(bodyB);
    
    // Set up collision event listener
    const events: CollisionEvent[] = [];
    const subscriptionId = system.onCollision(event => {
      events.push(event);
    });
    
    // First update - should capture event
    system.update();
    expect(events.length).toBe(1);
    
    // Unsubscribe
    const result = system.offCollision(subscriptionId);
    expect(result).toBe(true);
    
    // Clear the events array
    events.length = 0;
    
    // Next update should not add any events
    system.update();
    expect(events.length).toBe(0);
  });
});