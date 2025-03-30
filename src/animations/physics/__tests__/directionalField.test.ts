/**
 * Tests for Directional Magnetic Fields
 */

import { 
  calculateDirectionalForce, 
  normalizeVector,
  vectorMagnitude,
  scaleVector,
  vectorAngle,
  vectorFromAngle,
  rotateVector,
  addVectors
} from '../directionalFieldImpl';

import { 
  DirectionalFieldConfig, 
  PointerData,
  FieldDirectionType,
  DirectionalForceBehavior
} from '../directionalField';

// Test vector math utilities
describe('Vector math utilities', () => {
  test('normalizeVector returns unit vector', () => {
    const vector = { x: 3, y: 4 };
    const normalized = normalizeVector(vector);
    
    expect(normalized.x).toBeCloseTo(0.6);
    expect(normalized.y).toBeCloseTo(0.8);
  });
  
  test('normalizeVector handles zero vector', () => {
    const vector = { x: 0, y: 0 };
    const normalized = normalizeVector(vector);
    
    expect(normalized.x).toBe(0);
    expect(normalized.y).toBe(0);
  });
  
  test('vectorMagnitude calculates correct length', () => {
    const vector = { x: 3, y: 4 };
    const magnitude = vectorMagnitude(vector);
    
    expect(magnitude).toBe(5);
  });
  
  test('scaleVector multiplies vector by scalar', () => {
    const vector = { x: 2, y: 3 };
    const scaled = scaleVector(vector, 2);
    
    expect(scaled.x).toBe(4);
    expect(scaled.y).toBe(6);
  });
  
  test('vectorAngle calculates correct angle', () => {
    const vector = { x: 1, y: 0 };
    expect(vectorAngle(vector)).toBe(0);
    
    const vector2 = { x: 0, y: 1 };
    expect(vectorAngle(vector2)).toBeCloseTo(Math.PI / 2);
  });
  
  test('vectorFromAngle creates vector with correct angle', () => {
    const vector = vectorFromAngle(0, 1);
    expect(vector.x).toBeCloseTo(1);
    expect(vector.y).toBeCloseTo(0);
    
    const vector2 = vectorFromAngle(Math.PI / 2, 1);
    expect(vector2.x).toBeCloseTo(0);
    expect(vector2.y).toBeCloseTo(1);
  });
  
  test('rotateVector rotates vector correctly', () => {
    const vector = { x: 1, y: 0 };
    const rotated = rotateVector(vector, Math.PI / 2);
    
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(1);
  });
  
  test('addVectors adds vectors correctly', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 3, y: 4 };
    const sum = addVectors(a, b);
    
    expect(sum.x).toBe(4);
    expect(sum.y).toBe(6);
  });
});

// Test unidirectional field
describe('Unidirectional field', () => {
  test('calculateDirectionalForce with unidirectional field returns force in specified direction', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 }
    };
    
    const pointerData: PointerData = {
      position: { x: 0.5, y: 0.3 },
      distance: 100,
      normalizedDistance: 0.5,
      angle: 0,
      elapsedTime: 100
    };
    
    const result = calculateDirectionalForce(config, pointerData);
    
    // Force should be in the x direction only
    expect(result.force.x).toBeGreaterThan(0);
    expect(result.force.y).toBe(0);
    expect(result.magnitude).toBeGreaterThan(0);
  });
  
  test('unidirectional field with distance-based behavior decreases with distance', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'distance-based',
      direction: { x: 1, y: 0 }
    };
    
    const nearPointer: PointerData = {
      position: { x: 0.2, y: 0 },
      distance: 20,
      normalizedDistance: 0.1,
      angle: 0,
      elapsedTime: 100
    };
    
    const farPointer: PointerData = {
      position: { x: 0.8, y: 0 },
      distance: 80,
      normalizedDistance: 0.8,
      angle: 0,
      elapsedTime: 100
    };
    
    const nearResult = calculateDirectionalForce(config, nearPointer);
    const farResult = calculateDirectionalForce(config, farPointer);
    
    // Near force should be stronger than far force
    expect(nearResult.magnitude).toBeGreaterThan(farResult.magnitude);
  });
});

// Test bidirectional field
describe('Bidirectional field', () => {
  test('calculateDirectionalForce with bidirectional field returns force along axis', () => {
    const config: DirectionalFieldConfig = {
      type: 'bidirectional',
      behavior: 'constant',
      angle: 45 // 45-degree angle
    };
    
    const pointerData: PointerData = {
      position: { x: 0.5, y: 0.5 },
      distance: 100,
      normalizedDistance: 0.5,
      angle: Math.PI / 4, // 45 degrees
      elapsedTime: 100
    };
    
    const result = calculateDirectionalForce(config, pointerData);
    
    // Force should be along the 45-degree axis
    expect(result.force.x).toBeGreaterThan(0);
    expect(result.force.y).toBeGreaterThan(0);
    expect(Math.abs(result.force.x - result.force.y)).toBeLessThan(0.01);
  });
  
  test('bidirectional field changes direction based on pointer position', () => {
    const config: DirectionalFieldConfig = {
      type: 'bidirectional',
      behavior: 'responsive',
      angle: 0 // Horizontal axis
    };
    
    const positivePointer: PointerData = {
      position: { x: 0.8, y: 0 },
      distance: 80,
      normalizedDistance: 0.8,
      angle: 0,
      elapsedTime: 100
    };
    
    const negativePointer: PointerData = {
      position: { x: -0.8, y: 0 },
      distance: 80,
      normalizedDistance: 0.8,
      angle: Math.PI,
      elapsedTime: 100
    };
    
    const positiveResult = calculateDirectionalForce(config, positivePointer);
    const negativeResult = calculateDirectionalForce(config, negativePointer);
    
    // Forces should be in opposite directions
    expect(Math.sign(positiveResult.force.x)).toBe(1);
    expect(Math.sign(negativeResult.force.x)).toBe(-1);
  });
});

// Test radial field
describe('Radial field', () => {
  test('calculateDirectionalForce with radial field returns force away from center', () => {
    const config: DirectionalFieldConfig = {
      type: 'radial',
      behavior: 'constant',
      center: { x: 0.5, y: 0.5 }
    };
    
    const pointerData: PointerData = {
      position: { x: 0.8, y: 0.8 },
      distance: 100,
      normalizedDistance: 0.5,
      angle: Math.PI / 4, // 45 degrees
      elapsedTime: 100
    };
    
    const result = calculateDirectionalForce(config, pointerData);
    
    // Force should point outward from center (positive in both x and y)
    expect(result.force.x).toBeGreaterThan(0);
    expect(result.force.y).toBeGreaterThan(0);
  });
});

// Test force modifiers
describe('Force modifiers', () => {
  test('dampen modifier reduces force magnitude', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 },
      modifiers: [
        {
          type: 'dampen',
          factor: 0.5,
          target: 'both',
          applyModifier: () => ({ x: 0, y: 0 }) // Not used directly in tests
        }
      ]
    };
    
    const pointerData: PointerData = {
      position: { x: 0.5, y: 0 },
      distance: 50,
      normalizedDistance: 0.5,
      angle: 0,
      elapsedTime: 100
    };
    
    // Get force with and without modifier
    const withModifier = calculateDirectionalForce(config, pointerData);
    
    const configWithoutModifier = { ...config, modifiers: [] };
    const withoutModifier = calculateDirectionalForce(configWithoutModifier, pointerData);
    
    // Force with modifier should be half as strong
    expect(withModifier.magnitude).toBeCloseTo(withoutModifier.magnitude * 0.5);
  });
  
  test('invert modifier flips force direction', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 },
      modifiers: [
        {
          type: 'invert',
          factor: 1,
          target: 'both',
          applyModifier: () => ({ x: 0, y: 0 }) // Not used directly in tests
        }
      ]
    };
    
    const pointerData: PointerData = {
      position: { x: 0.5, y: 0 },
      distance: 50,
      normalizedDistance: 0.5,
      angle: 0,
      elapsedTime: 100
    };
    
    const result = calculateDirectionalForce(config, pointerData);
    
    // Force should be in the negative x direction
    expect(result.force.x).toBeLessThan(0);
  });
  
  test('cap modifier limits force magnitude', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 2, y: 0 },
      modifiers: [
        {
          type: 'cap',
          factor: 0.5, // Cap at 0.5
          target: 'both',
          applyModifier: () => ({ x: 0, y: 0 }) // Not used directly in tests
        }
      ]
    };
    
    const pointerData: PointerData = {
      position: { x: 0.5, y: 0 },
      distance: 50,
      normalizedDistance: 0.5,
      angle: 0,
      elapsedTime: 100
    };
    
    const result = calculateDirectionalForce(config, pointerData);
    
    // Force magnitude should be capped at 0.5
    expect(result.magnitude).toBeCloseTo(0.5);
  });
});

// Test flow field
describe('Flow field', () => {
  test('calculateDirectionalForce with flow field interpolates between points', () => {
    const config: DirectionalFieldConfig = {
      type: 'flow',
      behavior: 'constant',
      flowField: {
        points: [
          { x: 0, y: 0, direction: { x: 1, y: 0 } },
          { x: 1, y: 0, direction: { x: 0, y: 1 } },
          { x: 1, y: 1, direction: { x: -1, y: 0 } },
          { x: 0, y: 1, direction: { x: 0, y: -1 } }
        ],
        interpolation: 'linear',
        resolution: 10
      }
    };
    
    const pointerData: PointerData = {
      position: { x: 0.5, y: 0.5 },
      distance: 0,
      normalizedDistance: 0,
      angle: 0,
      elapsedTime: 100
    };
    
    const result = calculateDirectionalForce(config, pointerData);
    
    // Force should be some interpolation of the surrounding points
    expect(result.force.x).not.toBe(0);
    expect(result.force.y).not.toBe(0);
  });
});

// System integration test
describe('System integration', () => {
  test('complex field configuration works correctly', () => {
    // Create a complex field with multiple types and modifiers
    const config: DirectionalFieldConfig = {
      type: 'vortex',
      behavior: 'interactive',
      center: { x: 0.5, y: 0.5 },
      modifiers: [
        {
          type: 'dampen',
          factor: 0.2,
          target: 'both',
          applyModifier: () => ({ x: 0, y: 0 })
        },
        {
          type: 'oscillate',
          factor: 0.3,
          target: 'magnitude',
          params: { frequency: 0.5 },
          applyModifier: () => ({ x: 0, y: 0 })
        }
      ]
    };
    
    const pointerData: PointerData = {
      position: { x: 0.7, y: 0.7 },
      distance: 50,
      normalizedDistance: 0.5,
      angle: Math.PI / 4,
      elapsedTime: 100
    };
    
    // Should not throw and should return a valid force
    const result = calculateDirectionalForce(config, pointerData);
    
    expect(result.force).toBeDefined();
    expect(result.magnitude).toBeGreaterThanOrEqual(0);
  });
});