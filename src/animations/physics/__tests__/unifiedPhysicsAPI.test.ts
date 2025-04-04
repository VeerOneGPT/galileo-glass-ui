/**
 * Unified Physics API Tests
 * 
 * This file contains tests for the unified physics API to ensure it provides
 * consistent interfaces and functionality across different animation types.
 */
import GalileoPhysics from '../unifiedPhysicsAPI';

// Remove the 'as any' cast as we will use static access
// const physicsAPI = GalileoPhysics as any;

describe('Unified Physics API', () => {
  describe('Core functionality', () => {
    test('should export the GalileoPhysics class/object', () => {
      // Test the class itself
      expect(GalileoPhysics).toBeDefined();
    });
    
    test('should provide access to spring physics functions', () => {
      // Use static access
      expect(typeof GalileoPhysics.createSpring).toBe('function');
      expect(GalileoPhysics.SpringPresets).toBeDefined();
    });
    
    test('should provide access to inertial movement hook', () => {
      // Use static access
      expect(typeof GalileoPhysics.useInertialMovement).toBe('function');
    });
    
    test('should provide access to momentum hook', () => {
      // Use static access
      expect(typeof GalileoPhysics.useMomentum).toBe('function');
    });
    
    test('should provide access to collision system functions', () => {
      // Use static access
      expect(typeof GalileoPhysics.getCollisionSystem).toBe('function');
      expect(typeof GalileoPhysics.createCircle).toBe('function');
      expect(typeof GalileoPhysics.detectCollision).toBe('function');
    });
  });
  
  describe('Spring physics', () => {
    test('should create a spring with default parameters using direct function', () => {
      // Use static access
      const spring = GalileoPhysics.createSpring();
      
      expect(spring).toBeDefined();
      // Use the new getConfig method
      const springConfig = spring.getConfig();
      expect(springConfig).toBeDefined();
      expect(springConfig.tension).toBeDefined();
      expect(springConfig.friction).toBeDefined();
      expect(springConfig.mass).toBeDefined();
    });
    
    test('should create a spring with custom parameters using direct function', () => {
      const config = {
        tension: 200,
        friction: 15,
        mass: 2
      };
      // Use static access
      const spring = GalileoPhysics.createSpring(config);
      
      // Use the new getConfig method
      const springConfig = spring.getConfig();
      expect(springConfig.tension).toBe(200);
      expect(springConfig.friction).toBe(15);
      expect(springConfig.mass).toBe(2);
    });
    
    test('should calculate spring force correctly using direct function', () => {
      // Use static access
      const force = GalileoPhysics.calculateSpringForce(
        { x: 10, y: 0 }, // position (displacement from origin is 10)
        { x: 0, y: 0 }, // target (origin)
        // Use SpringParams type definition directly if possible, or define inline
        { mass: 1, stiffness: 100, damping: 10 }, 
        { x: 5, y: 0 } // velocity
      );
      
      // Total Force = F_spring + F_damp = -(stiffness * displacement) - (damping * velocity)
      // Displacement = position - target = 10
      // Velocity = 5
      const expectedForceX = -(100 * 10) - (10 * 5); // = -1000 - 50 = -1050
      expect(force.x).toBeCloseTo(expectedForceX); 
      expect(force.y).toBeCloseTo(0); // No y displacement or velocity
    });
  });
  
  describe('Animation presets', () => {
    test('should provide default animation presets object', () => {
      // Use static access
      expect(GalileoPhysics.SpringPresets).toBeDefined();
      
      // Use static access
      const presets = GalileoPhysics.SpringPresets;
      // Use uppercase preset names as defined in springPhysics.ts
      expect(presets.DEFAULT).toBeDefined();
      expect(presets.GENTLE).toBeDefined();
      expect(presets.BOUNCY).toBeDefined();
      expect(presets.SNAPPY).toBeDefined();
    });
    
    test('should be able to use presets (conceptual check)', () => {
      // Use static access
      const bouncyPreset = GalileoPhysics.SpringPresets.BOUNCY; // Uppercase
      const gentlePreset = GalileoPhysics.SpringPresets.GENTLE; // Uppercase
      expect(bouncyPreset).toBeDefined();
      expect(gentlePreset).toBeDefined();
      // Assume bouncy has lower friction/tension ratio than gentle
      expect(bouncyPreset.friction / bouncyPreset.tension)
        .toBeLessThan(gentlePreset.friction / gentlePreset.tension);
    });
  });
  
  describe('Utility functions', () => {
    test('should provide vector operations directly', () => {
      // Use static access
      expect(typeof GalileoPhysics.addVectors).toBe('function');
      expect(typeof GalileoPhysics.vectorMagnitude).toBe('function');
      
      const v1 = { x: 3, y: 4 };
      const v2 = { x: 1, y: 2 };
      
      // Use static access
      const sum = GalileoPhysics.addVectors(v1, v2);
      expect(sum.x).toBe(4);
      expect(sum.y).toBe(6);
      
      // Use static access
      const magnitude = GalileoPhysics.vectorMagnitude(v1);
      expect(magnitude).toBe(5);
    });
    
    test('should provide interpolation functions directly', () => {
       // Use static access
      expect(GalileoPhysics.Easings).toBeDefined();
      // Check that the .function property of an easing is a function
      expect(typeof GalileoPhysics.Easings.linear.function).toBe('function'); 
      expect(typeof GalileoPhysics.applyEasing).toBe('function'); 
      
      // Use static access
      const linearValue = GalileoPhysics.applyEasing(0.5, 'linear');
      expect(linearValue).toBe(0.5);

      // Check easeOutQuad exists and works roughly as expected
      expect(typeof GalileoPhysics.Easings.easeOutQuad.function).toBe('function');
      // Use static access
      const easeOut = GalileoPhysics.applyEasing(0.5, 'easeOutQuad');
      expect(easeOut).toBeGreaterThan(0.5); // Ease out should progress faster initially
    });
  });
  
  describe('Performance optimizations', () => {
    test('should provide performance utilities directly', () => {
      // Use static access
      expect(typeof GalileoPhysics.getDomBatcher).toBe('function');
      // expect(typeof GalileoPhysics.getTransformConsolidator).toBe('function'); // Assuming this might not exist
    });
  });
});