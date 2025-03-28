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
  createBoundaryWalls
} from '../collisionSystem';
import { CollisionShape } from '../types';
import { createVector, vectorDistance, vectorMagnitude } from '../physicsCalculations';

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