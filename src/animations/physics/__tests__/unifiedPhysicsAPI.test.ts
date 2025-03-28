/**
 * Unified Physics API Tests
 * 
 * This file contains tests for the unified physics API to ensure it provides
 * consistent interfaces and functionality across different animation types.
 */
import { unifiedPhysicsAPI } from '../unifiedPhysicsAPI';

describe('Unified Physics API', () => {
  describe('Core functionality', () => {
    test('should export the GalileoPhysics object', () => {
      expect(unifiedPhysicsAPI).toBeDefined();
      expect(unifiedPhysicsAPI.GalileoPhysics).toBeDefined();
    });
    
    test('should provide access to spring physics', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Spring).toBeDefined();
      expect(typeof GalileoPhysics.Spring.create).toBe('function');
    });
    
    test('should provide access to inertial movement', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Inertial).toBeDefined();
      expect(typeof GalileoPhysics.Inertial.create).toBe('function');
    });
    
    test('should provide access to momentum physics', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Momentum).toBeDefined();
      expect(typeof GalileoPhysics.Momentum.calculate).toBe('function');
    });
    
    test('should provide access to collision system', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Collision).toBeDefined();
      expect(typeof GalileoPhysics.Collision.detect).toBe('function');
    });
  });
  
  describe('Spring physics', () => {
    test('should create a spring with default parameters', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      const spring = GalileoPhysics.Spring.create();
      
      expect(spring).toBeDefined();
      expect(spring.tension).toBeDefined();
      expect(spring.friction).toBeDefined();
      expect(spring.mass).toBeDefined();
    });
    
    test('should create a spring with custom parameters', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      const spring = GalileoPhysics.Spring.create({
        tension: 200,
        friction: 15,
        mass: 2
      });
      
      expect(spring.tension).toBe(200);
      expect(spring.friction).toBe(15);
      expect(spring.mass).toBe(2);
    });
    
    test('should calculate spring force correctly', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      const spring = GalileoPhysics.Spring.create({
        tension: 100,
        friction: 10,
        mass: 1
      });
      
      const force = GalileoPhysics.Spring.calculateForce(
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
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Presets).toBeDefined();
      expect(GalileoPhysics.Presets.Spring).toBeDefined();
      
      const presets = GalileoPhysics.Presets.Spring;
      expect(presets.default).toBeDefined();
      expect(presets.gentle).toBeDefined();
      expect(presets.bouncy).toBeDefined();
      expect(presets.snappy).toBeDefined();
    });
    
    test('should create spring with preset parameters', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      const bouncySpring = GalileoPhysics.Spring.createWithPreset('bouncy');
      const gentleSpring = GalileoPhysics.Spring.createWithPreset('gentle');
      
      // Bouncy should have lower friction and/or higher tension
      expect(bouncySpring.friction).toBeLessThan(gentleSpring.friction);
      expect(bouncySpring.tension / bouncySpring.friction)
        .toBeGreaterThan(gentleSpring.tension / gentleSpring.friction);
    });
  });
  
  describe('Utility functions', () => {
    test('should provide vector operations', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Vector).toBeDefined();
      
      const v1 = { x: 3, y: 4 };
      const v2 = { x: 1, y: 2 };
      
      const sum = GalileoPhysics.Vector.add(v1, v2);
      expect(sum.x).toBe(4);
      expect(sum.y).toBe(6);
      
      const magnitude = GalileoPhysics.Vector.magnitude(v1);
      expect(magnitude).toBe(5); // 3-4-5 triangle
    });
    
    test('should provide interpolation functions', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Interpolation).toBeDefined();
      
      const lerp = GalileoPhysics.Interpolation.lerp(10, 20, 0.5);
      expect(lerp).toBe(15);
      
      const easeOut = GalileoPhysics.Interpolation.easeOutQuad(0.5);
      expect(easeOut).toBeGreaterThan(0.5); // Ease out should progress faster initially
    });
  });
  
  describe('Performance optimizations', () => {
    test('should provide performance utilities', () => {
      const { GalileoPhysics } = unifiedPhysicsAPI;
      expect(GalileoPhysics.Performance).toBeDefined();
      expect(typeof GalileoPhysics.Performance.getDomBatcher).toBe('function');
      expect(typeof GalileoPhysics.Performance.getTransformConsolidator).toBe('function');
    });
  });
});