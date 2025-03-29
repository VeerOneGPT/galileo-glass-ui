/**
 * Unified Physics API Tests
 * 
 * This file contains tests for the unified physics API to ensure it provides
 * consistent interfaces and functionality across different animation types.
 */
import GalileoPhysics from '../unifiedPhysicsAPI';

// Use type assertion to allow accessing properties that might not be in the type definition
const physicsAPI = GalileoPhysics as any;

describe('Unified Physics API', () => {
  describe('Core functionality', () => {
    test('should export the GalileoPhysics object', () => {
      expect(physicsAPI).toBeDefined();
    });
    
    test('should provide access to spring physics', () => {
      expect(physicsAPI.Spring).toBeDefined();
      expect(typeof physicsAPI.Spring.create).toBe('function');
    });
    
    test('should provide access to inertial movement', () => {
      expect(physicsAPI.Inertial).toBeDefined();
      expect(typeof physicsAPI.Inertial.create).toBe('function');
    });
    
    test('should provide access to momentum physics', () => {
      expect(physicsAPI.Momentum).toBeDefined();
      expect(typeof physicsAPI.Momentum.calculate).toBe('function');
    });
    
    test('should provide access to collision system', () => {
      expect(physicsAPI.Collision).toBeDefined();
      expect(typeof physicsAPI.Collision.detect).toBe('function');
    });
  });
  
  describe('Spring physics', () => {
    test('should create a spring with default parameters', () => {
      const spring = physicsAPI.Spring.create();
      
      expect(spring).toBeDefined();
      expect(spring.tension).toBeDefined();
      expect(spring.friction).toBeDefined();
      expect(spring.mass).toBeDefined();
    });
    
    test('should create a spring with custom parameters', () => {
      const spring = physicsAPI.Spring.create({
        tension: 200,
        friction: 15,
        mass: 2
      });
      
      expect(spring.tension).toBe(200);
      expect(spring.friction).toBe(15);
      expect(spring.mass).toBe(2);
    });
    
    test('should calculate spring force correctly', () => {
      const spring = physicsAPI.Spring.create({
        tension: 100,
        friction: 10,
        mass: 1
      });
      
      const force = physicsAPI.Spring.calculateForce(
        spring,
        10, // position
        5   // velocity
      );
      
      // Hooke's law: F = -kx - cv
      // With k = tension, c = friction, x = distance from equilibrium
      const expectedForce = -(100 * 10) - (10 * 5);
      expect(force).toBeCloseTo(expectedForce);
    });
  });
  
  describe('Animation presets', () => {
    test('should provide default animation presets', () => {
      expect(physicsAPI.Presets).toBeDefined();
      expect(physicsAPI.Presets.Spring).toBeDefined();
      
      const presets = physicsAPI.Presets.Spring;
      expect(presets.default).toBeDefined();
      expect(presets.gentle).toBeDefined();
      expect(presets.bouncy).toBeDefined();
      expect(presets.snappy).toBeDefined();
    });
    
    test('should create spring with preset parameters', () => {
      const bouncySpring = physicsAPI.Spring.createWithPreset('bouncy');
      const gentleSpring = physicsAPI.Spring.createWithPreset('gentle');
      
      // Bouncy should have lower friction and/or higher tension
      expect(bouncySpring.friction).toBeLessThan(gentleSpring.friction);
      expect(bouncySpring.tension / bouncySpring.friction)
        .toBeGreaterThan(gentleSpring.tension / gentleSpring.friction);
    });
  });
  
  describe('Utility functions', () => {
    test('should provide vector operations', () => {
      expect(physicsAPI.Vector).toBeDefined();
      
      const v1 = { x: 3, y: 4 };
      const v2 = { x: 1, y: 2 };
      
      const sum = physicsAPI.Vector.add(v1, v2);
      expect(sum.x).toBe(4);
      expect(sum.y).toBe(6);
      
      const magnitude = physicsAPI.Vector.magnitude(v1);
      expect(magnitude).toBe(5); // 3-4-5 triangle
    });
    
    test('should provide interpolation functions', () => {
      expect(physicsAPI.Interpolation).toBeDefined();
      
      const lerp = physicsAPI.Interpolation.lerp(10, 20, 0.5);
      expect(lerp).toBe(15);
      
      const easeOut = physicsAPI.Interpolation.easeOutQuad(0.5);
      expect(easeOut).toBeGreaterThan(0.5); // Ease out should progress faster initially
    });
  });
  
  describe('Performance optimizations', () => {
    test('should provide performance utilities', () => {
      expect(physicsAPI.Performance).toBeDefined();
      expect(typeof physicsAPI.Performance.getDomBatcher).toBe('function');
      expect(typeof physicsAPI.Performance.getTransformConsolidator).toBe('function');
    });
  });
});