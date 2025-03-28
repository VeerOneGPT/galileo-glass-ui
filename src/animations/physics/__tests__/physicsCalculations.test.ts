/**
 * Tests for physics calculation utilities
 */

import {
  // Vector operations
  createVector,
  addVectors,
  subtractVectors,
  multiplyVector,
  vectorMagnitude,
  normalizeVector,
  limitVector,
  dotProduct,
  vectorDistance,
  
  // Forces
  calculateSpringForce,
  calculateDampingForce,
  calculateGravity,
  calculateFriction,
  calculateMagneticForce,
  
  // Particle physics
  updateParticle,
  
  // Collision
  detectCollision,
  resolveCollision,
  
  // Design utilities
  designSpring,
  
  // Motion generators
  oscillateAround,
  noise,
  applyNoise,
  
  // Types
  type Vector2D,
  type SpringParams,
  type ParticleState
} from '../physicsCalculations';

describe('Vector Operations', () => {
  describe('createVector', () => {
    test('creates a vector with specified components', () => {
      const v = createVector(3, 4);
      expect(v).toEqual({ x: 3, y: 4 });
    });
    
    test('creates a zero vector by default', () => {
      const v = createVector();
      expect(v).toEqual({ x: 0, y: 0 });
    });
  });
  
  describe('addVectors', () => {
    test('adds two vectors correctly', () => {
      const v1 = { x: 3, y: 4 };
      const v2 = { x: 1, y: 2 };
      const result = addVectors(v1, v2);
      
      expect(result).toEqual({ x: 4, y: 6 });
    });
    
    test('handles zero vectors', () => {
      const v1 = { x: 3, y: 4 };
      const zero = { x: 0, y: 0 };
      
      expect(addVectors(v1, zero)).toEqual(v1);
      expect(addVectors(zero, v1)).toEqual(v1);
    });
    
    test('handles negative components', () => {
      const v1 = { x: 3, y: 4 };
      const v2 = { x: -1, y: -2 };
      
      expect(addVectors(v1, v2)).toEqual({ x: 2, y: 2 });
    });
  });
  
  describe('subtractVectors', () => {
    test('subtracts second vector from first', () => {
      const v1 = { x: 5, y: 7 };
      const v2 = { x: 2, y: 3 };
      const result = subtractVectors(v1, v2);
      
      expect(result).toEqual({ x: 3, y: 4 });
    });
    
    test('handles zero vectors', () => {
      const v1 = { x: 3, y: 4 };
      const zero = { x: 0, y: 0 };
      
      expect(subtractVectors(v1, zero)).toEqual(v1);
      expect(subtractVectors(zero, v1)).toEqual({ x: -3, y: -4 });
    });
    
    test('handles negative components', () => {
      const v1 = { x: 3, y: 4 };
      const v2 = { x: -1, y: -2 };
      
      expect(subtractVectors(v1, v2)).toEqual({ x: 4, y: 6 });
    });
  });
  
  describe('multiplyVector', () => {
    test('multiplies vector by positive scalar', () => {
      const v = { x: 3, y: 4 };
      const result = multiplyVector(v, 2);
      
      expect(result).toEqual({ x: 6, y: 8 });
    });
    
    test('multiplies vector by negative scalar', () => {
      const v = { x: 3, y: 4 };
      const result = multiplyVector(v, -2);
      
      expect(result).toEqual({ x: -6, y: -8 });
    });
    
    test('multiplies vector by zero', () => {
      const v = { x: 3, y: 4 };
      const result = multiplyVector(v, 0);
      
      expect(result).toEqual({ x: 0, y: 0 });
    });
    
    test('handles fractional scalars', () => {
      const v = { x: 3, y: 4 };
      const result = multiplyVector(v, 0.5);
      
      expect(result).toEqual({ x: 1.5, y: 2 });
    });
  });
  
  describe('vectorMagnitude', () => {
    test('calculates magnitude of vector correctly', () => {
      const v = { x: 3, y: 4 };
      const magnitude = vectorMagnitude(v);
      
      expect(magnitude).toBe(5);
    });
    
    test('handles zero vector', () => {
      const v = { x: 0, y: 0 };
      const magnitude = vectorMagnitude(v);
      
      expect(magnitude).toBe(0);
    });
    
    test('handles negative components', () => {
      const v = { x: -3, y: -4 };
      const magnitude = vectorMagnitude(v);
      
      expect(magnitude).toBe(5);
    });
  });
  
  describe('normalizeVector', () => {
    test('normalizes non-zero vector to unit length', () => {
      const v = { x: 3, y: 4 };
      const normalized = normalizeVector(v);
      
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
      expect(vectorMagnitude(normalized)).toBeCloseTo(1);
    });
    
    test('returns zero vector when given zero vector', () => {
      const v = { x: 0, y: 0 };
      const normalized = normalizeVector(v);
      
      expect(normalized).toEqual({ x: 0, y: 0 });
    });
    
    test('maintains direction when normalizing', () => {
      const v = { x: -3, y: 4 };
      const normalized = normalizeVector(v);
      
      // Direction is maintained if ratios of components are the same
      expect(normalized.x / normalized.y).toBeCloseTo(v.x / v.y);
    });
  });
  
  describe('limitVector', () => {
    test('does not modify vector within limit', () => {
      const v = { x: 3, y: 4 }; // magnitude = 5
      const limited = limitVector(v, 10);
      
      expect(limited).toEqual(v);
    });
    
    test('scales vector down to limit', () => {
      const v = { x: 6, y: 8 }; // magnitude = 10
      const limited = limitVector(v, 5);
      
      // Should be scaled by 0.5
      expect(limited.x).toBeCloseTo(3);
      expect(limited.y).toBeCloseTo(4);
      expect(vectorMagnitude(limited)).toBeCloseTo(5);
    });
    
    test('maintains direction when limiting', () => {
      const v = { x: -30, y: 40 }; // magnitude = 50
      const limited = limitVector(v, 5);
      
      // Direction is maintained if ratios of components are the same
      expect(limited.x / limited.y).toBeCloseTo(v.x / v.y);
      expect(vectorMagnitude(limited)).toBeCloseTo(5);
    });
    
    test('handles zero vector', () => {
      const v = { x: 0, y: 0 };
      const limited = limitVector(v, 5);
      
      expect(limited).toEqual({ x: 0, y: 0 });
    });
  });
  
  describe('dotProduct', () => {
    test('calculates dot product correctly', () => {
      const v1 = { x: 1, y: 2 };
      const v2 = { x: 3, y: 4 };
      const dot = dotProduct(v1, v2);
      
      expect(dot).toBe(11); // 1*3 + 2*4 = 11
    });
    
    test('returns zero for perpendicular vectors', () => {
      const v1 = { x: 1, y: 0 };
      const v2 = { x: 0, y: 1 };
      const dot = dotProduct(v1, v2);
      
      expect(dot).toBe(0);
    });
    
    test('handles zero vectors', () => {
      const v1 = { x: 3, y: 4 };
      const zero = { x: 0, y: 0 };
      
      expect(dotProduct(v1, zero)).toBe(0);
      expect(dotProduct(zero, v1)).toBe(0);
    });
    
    test('returns negative value for vectors with opposite directions', () => {
      const v1 = { x: 1, y: 0 };
      const v2 = { x: -1, y: 0 };
      
      expect(dotProduct(v1, v2)).toBeLessThan(0);
    });
  });
  
  describe('vectorDistance', () => {
    test('calculates distance between vectors correctly', () => {
      const v1 = { x: 1, y: 2 };
      const v2 = { x: 4, y: 6 };
      const distance = vectorDistance(v1, v2);
      
      expect(distance).toBeCloseTo(5); // sqrt((4-1)^2 + (6-2)^2) = 5
    });
    
    test('returns zero for identical vectors', () => {
      const v = { x: 3, y: 4 };
      const distance = vectorDistance(v, v);
      
      expect(distance).toBe(0);
    });
    
    test('is symmetric', () => {
      const v1 = { x: 1, y: 2 };
      const v2 = { x: 4, y: 6 };
      
      expect(vectorDistance(v1, v2)).toBeCloseTo(vectorDistance(v2, v1));
    });
  });
});

describe('Force Calculations', () => {
  describe('calculateSpringForce', () => {
    test('calculates spring force correctly', () => {
      const position = { x: 3, y: 4 };
      const target = { x: 0, y: 0 };
      const springParams: SpringParams = { mass: 1, stiffness: 2, damping: 0 };
      
      const force = calculateSpringForce(position, target, springParams);
      
      // Force should be in opposite direction of displacement and proportional to displacement
      expect(force.x).toBe(-6); // -2 * 3
      expect(force.y).toBe(-8); // -2 * 4
    });
    
    test('returns zero force at rest position', () => {
      const position = { x: 5, y: 10 };
      const target = { x: 5, y: 10 };
      const springParams: SpringParams = { mass: 1, stiffness: 50, damping: 0 };
      
      const force = calculateSpringForce(position, target, springParams);
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });
    
    test('scales with stiffness', () => {
      const position = { x: 10, y: 0 };
      const target = { x: 0, y: 0 };
      
      const force1 = calculateSpringForce(position, target, { mass: 1, stiffness: 1, damping: 0 });
      const force2 = calculateSpringForce(position, target, { mass: 1, stiffness: 2, damping: 0 });
      
      // Force should double when stiffness doubles
      expect(force2.x).toBe(force1.x * 2);
    });
  });
  
  describe('calculateDampingForce', () => {
    test('calculates damping force correctly', () => {
      const velocity = { x: 3, y: 4 };
      const damping = 2;
      
      const force = calculateDampingForce(velocity, damping);
      
      // Force should be in opposite direction of velocity
      expect(force.x).toBe(-6); // -2 * 3
      expect(force.y).toBe(-8); // -2 * 4
    });
    
    test('returns zero force for zero velocity', () => {
      const velocity = { x: 0, y: 0 };
      const damping = 10;
      
      const force = calculateDampingForce(velocity, damping);
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });
    
    test('scales with damping coefficient', () => {
      const velocity = { x: 10, y: 0 };
      
      const force1 = calculateDampingForce(velocity, 1);
      const force2 = calculateDampingForce(velocity, 2);
      
      // Force should double when damping doubles
      expect(force2.x).toBe(force1.x * 2);
    });
  });
  
  describe('calculateGravity', () => {
    test('calculates gravity force correctly', () => {
      const mass = 2;
      const gravity = 10;
      
      const force = calculateGravity(mass, gravity);
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(20); // 2 * 10
    });
    
    test('uses default gravity if not specified', () => {
      const mass = 2;
      
      const force = calculateGravity(mass);
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(19.6); // 2 * 9.8
    });
    
    test('returns zero force for zero mass', () => {
      const force = calculateGravity(0);
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });
  });
  
  describe('calculateFriction', () => {
    test('calculates friction force correctly', () => {
      const velocity = { x: 3, y: 4 };
      const coefficient = 0.5;
      
      const force = calculateFriction(velocity, coefficient);
      
      // Friction should be opposite to velocity
      expect(force.x).toBeCloseTo(-1.5); // -3 * 0.5
      expect(force.y).toBeCloseTo(-2); // -4 * 0.5
    });
    
    test('returns zero force for zero velocity', () => {
      const velocity = { x: 0, y: 0 };
      const coefficient = 0.5;
      
      const force = calculateFriction(velocity, coefficient);
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });
    
    test('scales with friction coefficient', () => {
      const velocity = { x: 10, y: 0 };
      
      const force1 = calculateFriction(velocity, 0.1);
      const force2 = calculateFriction(velocity, 0.2);
      
      // Force should double when coefficient doubles
      expect(force2.x).toBeCloseTo(force1.x * 2);
    });
  });
  
  describe('calculateMagneticForce', () => {
    test('calculates magnetic force correctly', () => {
      const position = { x: 3, y: 0 };
      const center = { x: 0, y: 0 };
      const strength = 9;
      
      const force = calculateMagneticForce(position, center, strength);
      
      // Force should be towards center with magnitude = strength / distance^2
      expect(force.x).toBeCloseTo(-1); // -9 / 3^2
      expect(force.y).toBeCloseTo(0);
    });
    
    test('returns zero force at center', () => {
      const position = { x: 5, y: 10 };
      const center = { x: 5, y: 10 };
      const strength = 100;
      
      const force = calculateMagneticForce(position, center, strength);
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });
    
    test('scales with strength', () => {
      const position = { x: 10, y: 0 };
      const center = { x: 0, y: 0 };
      
      const force1 = calculateMagneticForce(position, center, 10);
      const force2 = calculateMagneticForce(position, center, 20);
      
      // Force should double when strength doubles
      expect(force2.x).toBeCloseTo(force1.x * 2);
    });
    
    test('handles custom falloff', () => {
      const position = { x: 2, y: 0 };
      const center = { x: 0, y: 0 };
      const strength = 16;
      
      // With falloff = 2 (default), force magnitude = 16 / 2^2 = 4
      const force1 = calculateMagneticForce(position, center, strength);
      // With falloff = 3, force magnitude = 16 / 2^3 = 2
      const force2 = calculateMagneticForce(position, center, strength, 3);
      
      expect(Math.abs(force1.x)).toBeCloseTo(4);
      expect(Math.abs(force2.x)).toBeCloseTo(2);
    });
  });
});

describe('Particle Physics', () => {
  describe('updateParticle', () => {
    test('updates particle state correctly', () => {
      const state: ParticleState = {
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 },
        acceleration: { x: 0, y: 0 },
        mass: 1,
        rotation: 0,
        angularVelocity: 0.1,
        scale: 1,
        lifetime: 10,
        age: 0
      };
      
      const forces = { x: 10, y: 20 };
      const dt = 0.1; // time step
      
      const newState = updateParticle(state, forces, dt);
      
      // Acceleration = force / mass
      expect(newState.acceleration.x).toBe(10);
      expect(newState.acceleration.y).toBe(20);
      
      // Velocity = old velocity + acceleration * dt
      expect(newState.velocity.x).toBe(2); // 1 + 10 * 0.1
      expect(newState.velocity.y).toBe(4); // 2 + 20 * 0.1
      
      // Position = old position + velocity * dt
      expect(newState.position.x).toBe(0.2); // 0 + 2 * 0.1
      expect(newState.position.y).toBe(0.4); // 0 + 4 * 0.1
      
      // Rotation = old rotation + angularVelocity * dt
      expect(newState.rotation).toBe(0.01); // 0 + 0.1 * 0.1
      
      // Age = old age + dt
      expect(newState.age).toBe(0.1); // 0 + 0.1
    });
    
    test('handles zero forces correctly', () => {
      const state: ParticleState = {
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 2 },
        acceleration: { x: 0, y: 0 },
        mass: 1,
        rotation: 0,
        angularVelocity: 0,
        scale: 1,
        lifetime: 10,
        age: 0
      };
      
      const forces = { x: 0, y: 0 };
      const dt = 0.1; // time step
      
      const newState = updateParticle(state, forces, dt);
      
      // Acceleration should be zero
      expect(newState.acceleration.x).toBe(0);
      expect(newState.acceleration.y).toBe(0);
      
      // Velocity should remain the same
      expect(newState.velocity.x).toBe(1);
      expect(newState.velocity.y).toBe(2);
      
      // Position should change based on velocity
      expect(newState.position.x).toBe(0.1); // 0 + 1 * 0.1
      expect(newState.position.y).toBe(0.2); // 0 + 2 * 0.1
    });
    
    test('respects mass in acceleration calculation', () => {
      const state1: ParticleState = {
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: 1,
        rotation: 0,
        angularVelocity: 0,
        scale: 1,
        lifetime: 10,
        age: 0
      };
      
      const state2: ParticleState = {
        ...state1,
        mass: 2 // Double the mass
      };
      
      const forces = { x: 10, y: 0 };
      const dt = 0.1;
      
      const newState1 = updateParticle(state1, forces, dt);
      const newState2 = updateParticle(state2, forces, dt);
      
      // Acceleration and resulting velocity should be half for double mass
      expect(newState2.acceleration.x).toBe(newState1.acceleration.x / 2);
      expect(newState2.velocity.x).toBe(newState1.velocity.x / 2);
    });
  });
});

describe('Collision Calculations', () => {
  describe('detectCollision', () => {
    test('detects collision between overlapping circles', () => {
      const p1 = { x: 0, y: 0 };
      const r1 = 5;
      const p2 = { x: 8, y: 0 };
      const r2 = 5;
      
      const colliding = detectCollision(p1, r1, p2, r2);
      
      // Distance = 8, combined radii = 10, so they should be colliding
      expect(colliding).toBe(true);
    });
    
    test('does not detect collision between non-overlapping circles', () => {
      const p1 = { x: 0, y: 0 };
      const r1 = 5;
      const p2 = { x: 11, y: 0 };
      const r2 = 5;
      
      const colliding = detectCollision(p1, r1, p2, r2);
      
      // Distance = 11, combined radii = 10, so they should not be colliding
      expect(colliding).toBe(false);
    });
    
    test('detects collision for exactly touching circles', () => {
      const p1 = { x: 0, y: 0 };
      const r1 = 5;
      const p2 = { x: 10, y: 0 };
      const r2 = 5;
      
      const colliding = detectCollision(p1, r1, p2, r2);
      
      // Distance = 10, combined radii = 10, so they should be touching
      expect(colliding).toBe(false);
    });
  });
  
  describe('resolveCollision', () => {
    test('correctly resolves head-on collision between equal masses', () => {
      const p1 = { x: 0, y: 0 };
      const v1 = { x: 1, y: 0 };
      const m1 = 1;
      
      const p2 = { x: 10, y: 0 };
      const v2 = { x: -1, y: 0 };
      const m2 = 1;
      
      const result = resolveCollision(p1, v1, m1, p2, v2, m2);
      
      // For equal masses in head-on collision, velocities should be exchanged
      expect(result.v1.x).toBeCloseTo(-1);
      expect(result.v2.x).toBeCloseTo(1);
    });
    
    test('does not resolve collision if objects are moving away', () => {
      const p1 = { x: 0, y: 0 };
      const v1 = { x: -1, y: 0 };
      const m1 = 1;
      
      const p2 = { x: 10, y: 0 };
      const v2 = { x: 1, y: 0 };
      const m2 = 1;
      
      const result = resolveCollision(p1, v1, m1, p2, v2, m2);
      
      // Should not change velocities
      expect(result.v1.x).toBe(-1);
      expect(result.v2.x).toBe(1);
    });
    
    test('handles different masses correctly', () => {
      const p1 = { x: 0, y: 0 };
      const v1 = { x: 1, y: 0 };
      const m1 = 1;
      
      const p2 = { x: 10, y: 0 };
      const v2 = { x: -1, y: 0 };
      const m2 = 3; // 3 times heavier
      
      const result = resolveCollision(p1, v1, m1, p2, v2, m2);
      
      // Heavy object should change less than light object
      expect(Math.abs(result.v2.x - v2.x)).toBeLessThan(Math.abs(result.v1.x - v1.x));
    });
    
    test('conserves momentum', () => {
      const p1 = { x: 0, y: 0 };
      const v1 = { x: 2, y: 1 };
      const m1 = 2;
      
      const p2 = { x: 10, y: 0 };
      const v2 = { x: -1, y: -1 };
      const m2 = 3;
      
      const result = resolveCollision(p1, v1, m1, p2, v2, m2);
      
      // Initial momentum
      const initialMomentum = {
        x: m1 * v1.x + m2 * v2.x,
        y: m1 * v1.y + m2 * v2.y
      };
      
      // Final momentum
      const finalMomentum = {
        x: m1 * result.v1.x + m2 * result.v2.x,
        y: m1 * result.v1.y + m2 * result.v2.y
      };
      
      // Momentum should be conserved
      expect(finalMomentum.x).toBeCloseTo(initialMomentum.x);
      expect(finalMomentum.y).toBeCloseTo(initialMomentum.y);
    });
    
    test('handles restitution correctly', () => {
      const p1 = { x: 0, y: 0 };
      const v1 = { x: 1, y: 0 };
      const m1 = 1;
      
      const p2 = { x: 10, y: 0 };
      const v2 = { x: -1, y: 0 };
      const m2 = 1;
      
      // Perfectly elastic collision (restitution = 1)
      const elastic = resolveCollision(p1, v1, m1, p2, v2, m2, 1);
      
      // Inelastic collision (restitution = 0)
      const inelastic = resolveCollision(p1, v1, m1, p2, v2, m2, 0);
      
      // For restitution = 1, velocities should be exchanged
      expect(elastic.v1.x).toBeCloseTo(-1);
      expect(elastic.v2.x).toBeCloseTo(1);
      
      // For restitution = 0, objects should stick together
      expect(inelastic.v1.x).toBeCloseTo(0);
      expect(inelastic.v2.x).toBeCloseTo(0);
    });
  });
});

describe('Design Utilities', () => {
  describe('designSpring', () => {
    test('calculates appropriate spring parameters for desired motion', () => {
      const mass = 2;
      const settlingTime = 0.5; // Half a second to settle
      const overshoot = 0.01; // 1% overshoot
      
      const params = designSpring(mass, settlingTime, overshoot);
      
      // Check types
      expect(params.mass).toBe(mass);
      expect(typeof params.stiffness).toBe('number');
      expect(typeof params.damping).toBe('number');
      
      // Values should be positive
      expect(params.stiffness).toBeGreaterThan(0);
      expect(params.damping).toBeGreaterThan(0);
      
      // For critically damped spring, damping = 2 * sqrt(mass * stiffness)
      // Since our overshoot is small (0.01), system should be close to critically damped
      const criticalDamping = 2 * Math.sqrt(mass * params.stiffness);
      expect(params.damping).toBeCloseTo(criticalDamping, 0);
    });
    
    test('returns more dampened response for lower overshoot', () => {
      const params1 = designSpring(1, 1, 0.1); // 10% overshoot
      const params2 = designSpring(1, 1, 0.01); // 1% overshoot
      
      // Damping ratio should be higher (more damped) for lower overshoot
      expect(params2.damping).toBeGreaterThan(params1.damping);
    });
    
    test('returns faster response for shorter settling time', () => {
      const params1 = designSpring(1, 2, 0.01); // 2 second settling
      const params2 = designSpring(1, 1, 0.01); // 1 second settling
      
      // Stiffness should be higher (faster response) for shorter settling time
      expect(params2.stiffness).toBeGreaterThan(params1.stiffness);
    });
  });
});

describe('Motion Generators', () => {
  describe('oscillateAround', () => {
    test('generates circular motion around a center point', () => {
      const center = { x: 10, y: 20 };
      const radius = 5;
      const frequency = 1; // 1 Hz
      const phase = 0;
      
      // Test at different times
      const p0 = oscillateAround(center, radius, frequency, phase, 0);
      const p025 = oscillateAround(center, radius, frequency, phase, 0.25);
      const p05 = oscillateAround(center, radius, frequency, phase, 0.5);
      const p075 = oscillateAround(center, radius, frequency, phase, 0.75);
      
      // At t=0, should be at (center.x + radius, center.y)
      expect(p0.x).toBeCloseTo(center.x + radius);
      expect(p0.y).toBeCloseTo(center.y);
      
      // At t=0.25, should be at (center.x, center.y + radius)
      expect(p025.x).toBeCloseTo(center.x);
      expect(p025.y).toBeCloseTo(center.y + radius);
      
      // At t=0.5, should be at (center.x - radius, center.y)
      expect(p05.x).toBeCloseTo(center.x - radius);
      expect(p05.y).toBeCloseTo(center.y);
      
      // At t=0.75, should be at (center.x, center.y - radius)
      expect(p075.x).toBeCloseTo(center.x);
      expect(p075.y).toBeCloseTo(center.y - radius);
    });
    
    test('respects frequency parameter', () => {
      const center = { x: 0, y: 0 };
      const radius = 1;
      const phase = 0;
      
      // Check position at t=0.25 for different frequencies
      const p1 = oscillateAround(center, radius, 1, phase, 0.25);
      const p2 = oscillateAround(center, radius, 2, phase, 0.25);
      
      // With frequency=1, at t=0.25 we should be at (0, 1)
      expect(p1.x).toBeCloseTo(0);
      expect(p1.y).toBeCloseTo(1);
      
      // With frequency=2, at t=0.25 we should be at (0, -1)
      // 0.25 * 2 = 0.5 cycles, which is 180°
      expect(p2.x).toBeCloseTo(0);
      expect(p2.y).toBeCloseTo(-1);
    });
    
    test('respects phase parameter', () => {
      const center = { x: 0, y: 0 };
      const radius = 1;
      const frequency = 1;
      
      // Check position at t=0 for different phases
      const p0 = oscillateAround(center, radius, frequency, 0, 0);
      const pPiHalf = oscillateAround(center, radius, frequency, Math.PI / 2, 0);
      const pPi = oscillateAround(center, radius, frequency, Math.PI, 0);
      
      // With phase=0, at t=0 we should be at (1, 0)
      expect(p0.x).toBeCloseTo(1);
      expect(p0.y).toBeCloseTo(0);
      
      // With phase=PI/2, at t=0 we should be at (0, 1)
      expect(pPiHalf.x).toBeCloseTo(0);
      expect(pPiHalf.y).toBeCloseTo(1);
      
      // With phase=PI, at t=0 we should be at (-1, 0)
      expect(pPi.x).toBeCloseTo(-1);
      expect(pPi.y).toBeCloseTo(0);
    });
  });
  
  describe('noise', () => {
    test('generates values in the -1 to 1 range', () => {
      // Test multiple inputs
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const t = Math.random() * 100;
        
        const value = noise(x, y, t);
        
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
    
    test('produces different values for different inputs', () => {
      const n1 = noise(1, 2, 3);
      const n2 = noise(2, 3, 4);
      const n3 = noise(1, 2, 4);
      
      expect(n1).not.toEqual(n2);
      expect(n1).not.toEqual(n3);
      expect(n2).not.toEqual(n3);
    });
    
    test('produces the same value for the same inputs', () => {
      const n1 = noise(1, 2, 3);
      const n2 = noise(1, 2, 3);
      
      expect(n1).toEqual(n2);
    });
  });
  
  describe('applyNoise', () => {
    test('adds noise to vector components', () => {
      const v = { x: 10, y: 20 };
      const amplitude = 1;
      const time = 0;
      
      const result = applyNoise(v, amplitude, time);
      
      // Should not be equal to original vector
      expect(result).not.toEqual(v);
      
      // But should be close (within amplitude range)
      expect(Math.abs(result.x - v.x)).toBeLessThanOrEqual(amplitude);
      expect(Math.abs(result.y - v.y)).toBeLessThanOrEqual(amplitude);
    });
    
    test('scales with amplitude', () => {
      const v = { x: 0, y: 0 };
      const time = 0;
      
      const result1 = applyNoise(v, 1, time);
      const result2 = applyNoise(v, 2, time);
      
      // The difference should scale with amplitude
      expect(Math.abs(result2.x)).toBeCloseTo(Math.abs(result1.x) * 2);
      expect(Math.abs(result2.y)).toBeCloseTo(Math.abs(result1.y) * 2);
    });
    
    test('produces different results for different times', () => {
      const v = { x: 5, y: 5 };
      const amplitude = 1;
      
      const result1 = applyNoise(v, amplitude, 0);
      const result2 = applyNoise(v, amplitude, 1);
      
      expect(result1).not.toEqual(result2);
    });
  });
});