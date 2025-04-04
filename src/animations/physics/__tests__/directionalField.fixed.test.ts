/**
 * Fixed tests for Directional Magnetic Fields
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

describe('Vector Math Utilities (Fixed)', () => {
  test('normalizeVector returns unit vector', () => {
    const vector = { x: 3, y: 4 };
    const normalized = normalizeVector(vector);
    
    // Should return a vector with magnitude of 1
    expect(normalized.x).toBeCloseTo(0.6);
    expect(normalized.y).toBeCloseTo(0.8);
    
    // Verify magnitude
    const magnitude = Math.sqrt(normalized.x * normalized.x + normalized.y * normalized.y);
    expect(magnitude).toBeCloseTo(1);
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
    
    // Try another vector
    const vector2 = { x: 5, y: 12 };
    const magnitude2 = vectorMagnitude(vector2);
    
    expect(magnitude2).toBe(13);
  });
  
  test('scaleVector multiplies vector by scalar', () => {
    const vector = { x: 2, y: 3 };
    const scaled = scaleVector(vector, 2);
    
    expect(scaled.x).toBe(4);
    expect(scaled.y).toBe(6);
    
    // Verify scale doesn't mutate the original
    expect(vector.x).toBe(2);
    expect(vector.y).toBe(3);
    
    // Test with zero scale
    const zeroScaled = scaleVector(vector, 0);
    expect(zeroScaled.x).toBe(0);
    expect(zeroScaled.y).toBe(0);
    
    // Test with negative scale
    const negativeScaled = scaleVector(vector, -1);
    expect(negativeScaled.x).toBe(-2);
    expect(negativeScaled.y).toBe(-3);
  });
  
  test('vectorAngle calculates correct angle', () => {
    // Test cardinal directions
    const right = { x: 1, y: 0 };
    expect(vectorAngle(right)).toBeCloseTo(0);
    
    const down = { x: 0, y: 1 };
    expect(vectorAngle(down)).toBeCloseTo(Math.PI / 2);
    
    const left = { x: -1, y: 0 };
    expect(vectorAngle(left)).toBeCloseTo(Math.PI);
    
    const up = { x: 0, y: -1 };
    expect(vectorAngle(up)).toBeCloseTo(-Math.PI / 2);
    
    // Test diagonal directions
    const downRight = { x: 1, y: 1 };
    expect(vectorAngle(downRight)).toBeCloseTo(Math.PI / 4);
    
    const downLeft = { x: -1, y: 1 };
    expect(vectorAngle(downLeft)).toBeCloseTo(3 * Math.PI / 4);
  });
  
  test('vectorFromAngle creates vector with correct angle', () => {
    // Test common angles
    const right = vectorFromAngle(0, 1);
    expect(right.x).toBeCloseTo(1);
    expect(right.y).toBeCloseTo(0);
    
    const down = vectorFromAngle(Math.PI / 2, 1);
    expect(down.x).toBeCloseTo(0);
    expect(down.y).toBeCloseTo(1);
    
    const left = vectorFromAngle(Math.PI, 1);
    expect(left.x).toBeCloseTo(-1);
    expect(left.y).toBeCloseTo(0);
    
    const up = vectorFromAngle(-Math.PI / 2, 1);
    expect(up.x).toBeCloseTo(0);
    expect(up.y).toBeCloseTo(-1);
    
    // Test with custom magnitude
    const largeMagnitude = vectorFromAngle(Math.PI / 4, 2);
    expect(largeMagnitude.x).toBeCloseTo(Math.SQRT2);
    expect(largeMagnitude.y).toBeCloseTo(Math.SQRT2);
    
    // Verify magnitude
    const magnitude = Math.sqrt(largeMagnitude.x * largeMagnitude.x + largeMagnitude.y * largeMagnitude.y);
    expect(magnitude).toBeCloseTo(2);
  });
  
  test('rotateVector rotates vector correctly', () => {
    const vector = { x: 1, y: 0 };
    
    // Rotate by 90 degrees
    const rotated90 = rotateVector(vector, Math.PI / 2);
    expect(rotated90.x).toBeCloseTo(0);
    expect(rotated90.y).toBeCloseTo(1);
    
    // Rotate by 180 degrees
    const rotated180 = rotateVector(vector, Math.PI);
    expect(rotated180.x).toBeCloseTo(-1);
    expect(rotated180.y).toBeCloseTo(0);
    
    // Rotate by 270 degrees
    const rotated270 = rotateVector(vector, 3 * Math.PI / 2);
    expect(rotated270.x).toBeCloseTo(0);
    expect(rotated270.y).toBeCloseTo(-1);
    
    // Rotate by 360 degrees (should return to original)
    const rotated360 = rotateVector(vector, 2 * Math.PI);
    expect(rotated360.x).toBeCloseTo(1);
    expect(rotated360.y).toBeCloseTo(0);
    
    // Verify rotating a non-unit vector preserves magnitude
    const nonUnitVector = { x: 3, y: 4 };
    const originalMagnitude = vectorMagnitude(nonUnitVector);
    const rotatedNonUnit = rotateVector(nonUnitVector, Math.PI / 4);
    const newMagnitude = vectorMagnitude(rotatedNonUnit);
    expect(newMagnitude).toBeCloseTo(originalMagnitude);
  });
  
  test('addVectors adds vectors correctly', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 3, y: 4 };
    const sum = addVectors(a, b);
    
    expect(sum.x).toBe(4);
    expect(sum.y).toBe(6);
    
    // Test commutativity
    const sum2 = addVectors(b, a);
    expect(sum2.x).toBe(4);
    expect(sum2.y).toBe(6);
    
    // Test with zero vector
    const zero = { x: 0, y: 0 };
    const sumWithZero = addVectors(a, zero);
    expect(sumWithZero.x).toBe(a.x);
    expect(sumWithZero.y).toBe(a.y);
    
    // Test with negative vector
    const negative = { x: -3, y: -4 };
    const sumWithNegative = addVectors(a, negative);
    expect(sumWithNegative.x).toBe(-2);
    expect(sumWithNegative.y).toBe(-2);
  });
});

// Test unidirectional field
describe('Unidirectional Field (Fixed)', () => {
  test('calculateDirectionalForce with unidirectional field returns force in specified direction', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 } // Right direction
    };
    
    const pointerData: PointerData = {
      position: { x: 0.5, y: 0.3 },
      distance: 100,
      normalizedDistance: 0.5,
      angle: 0,
      elapsedTime: 100
    };
    
    const result = calculateDirectionalForce(config, pointerData);
    
    // Force should be in the x direction only (right)
    expect(result.force.x).toBeGreaterThan(0);
    expect(result.force.y).toBeCloseTo(0);
    expect(result.magnitude).toBeGreaterThan(0);
    
    // Test with different direction
    const upConfig: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 0, y: -1 } // Up direction
    };
    
    const upResult = calculateDirectionalForce(upConfig, pointerData);
    
    // Force should be in the y direction only (up)
    expect(upResult.force.x).toBeCloseTo(0);
    expect(upResult.force.y).toBeLessThan(0);
    expect(upResult.magnitude).toBeGreaterThan(0);
  });
  
  test('unidirectional field with distance-based behavior decreases with distance', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'distance-based',
      direction: { x: 1, y: 0 } // Right direction
    };
    
    // Pointer close to center
    const nearPointer: PointerData = {
      position: { x: 0.2, y: 0 },
      distance: 20,
      normalizedDistance: 0.1, // 10% of maximum distance
      angle: 0,
      elapsedTime: 100
    };
    
    // Pointer far from center
    const farPointer: PointerData = {
      position: { x: 0.8, y: 0 },
      distance: 80,
      normalizedDistance: 0.8, // 80% of maximum distance
      angle: 0,
      elapsedTime: 100
    };
    
    const nearResult = calculateDirectionalForce(config, nearPointer);
    const farResult = calculateDirectionalForce(config, farPointer);
    
    // Near force should be stronger than far force
    expect(nearResult.magnitude).toBeGreaterThan(farResult.magnitude);
    
    // Verify the ratio is approximately what we expect
    // For distance-based behavior, force ~ (1 - normalizedDistance)
    // So near should be ~(1-0.1) = 0.9, far should be ~(1-0.8) = 0.2
    // Ratio should be roughly 0.9/0.2 = 4.5
    const expectedRatio = (1 - nearPointer.normalizedDistance) / (1 - farPointer.normalizedDistance);
    const actualRatio = nearResult.magnitude / farResult.magnitude;
    expect(actualRatio).toBeCloseTo(expectedRatio);
  });
  
  test('unidirectional field with responsive behavior varies with pointer alignment', () => {
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'responsive',
      direction: { x: 1, y: 0 } // Right direction
    };
    
    // Pointer aligned with direction
    const alignedPointer: PointerData = {
      position: { x: 0.8, y: 0 }, // Pointing right
      distance: 80,
      normalizedDistance: 0.8,
      angle: 0,
      elapsedTime: 100
    };
    
    // Pointer perpendicular to direction
    const perpendicularPointer: PointerData = {
      position: { x: 0, y: 0.8 }, // Pointing down
      distance: 80,
      normalizedDistance: 0.8,
      angle: Math.PI / 2,
      elapsedTime: 100
    };
    
    // Pointer opposite to direction
    const oppositePointer: PointerData = {
      position: { x: -0.8, y: 0 }, // Pointing left
      distance: 80,
      normalizedDistance: 0.8,
      angle: Math.PI,
      elapsedTime: 100
    };
    
    const alignedResult = calculateDirectionalForce(config, alignedPointer);
    const perpendicularResult = calculateDirectionalForce(config, perpendicularPointer);
    const oppositeResult = calculateDirectionalForce(config, oppositePointer);
    
    // Aligned pointer should produce strongest force
    expect(alignedResult.magnitude).toBeGreaterThan(perpendicularResult.magnitude);
    
    // Perpendicular pointer should produce zero or minimal force
    expect(perpendicularResult.magnitude).toBeCloseTo(0);
    
    // Opposite pointer should produce zero or negative force
    expect(oppositeResult.force.x).toBeLessThanOrEqual(0);
  });
});

// Test bidirectional field
describe('Bidirectional Field (Fixed)', () => {
  test('calculateDirectionalForce with bidirectional field returns force along axis', () => {
    // Create a bidirectional field with 45-degree axis
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
    // For a 45-degree angle, x and y components should be approximately equal
    expect(result.force.x).not.toBe(0);
    expect(result.force.y).not.toBe(0);
    expect(Math.abs(result.force.x)).toBeCloseTo(Math.abs(result.force.y), 2);
    
    // Test with a different angle (90 degrees - vertical axis)
    const verticalConfig: DirectionalFieldConfig = {
      type: 'bidirectional',
      behavior: 'constant',
      angle: 90 // Vertical axis
    };
    
    const verticalResult = calculateDirectionalForce(verticalConfig, pointerData);
    
    // Force should be along vertical axis
    expect(verticalResult.force.x).toBeCloseTo(0);
    expect(Math.abs(verticalResult.force.y)).toBeGreaterThan(0);
  });
  
  test('bidirectional field changes direction based on pointer position', () => {
    const config: DirectionalFieldConfig = {
      type: 'bidirectional',
      behavior: 'responsive',
      angle: 0 // Horizontal axis
    };
    
    const positivePointer: PointerData = {
      position: { x: 0.8, y: 0 }, // Pointing right
      distance: 80,
      normalizedDistance: 0.8,
      angle: 0,
      elapsedTime: 100
    };
    
    const negativePointer: PointerData = {
      position: { x: -0.8, y: 0 }, // Pointing left
      distance: 80,
      normalizedDistance: 0.8,
      angle: Math.PI,
      elapsedTime: 100
    };
    
    const positiveResult = calculateDirectionalForce(config, positivePointer);
    const negativeResult = calculateDirectionalForce(config, negativePointer);
    
    // Forces should be in opposite directions
    expect(Math.sign(positiveResult.force.x)).toBe(1); // Pointing right
    expect(Math.sign(negativeResult.force.x)).toBe(-1); // Pointing left
    
    // Y components should be close to zero (horizontal axis)
    expect(positiveResult.force.y).toBeCloseTo(0);
    expect(negativeResult.force.y).toBeCloseTo(0);
  });
  
  test('bidirectional field with angle-based behavior creates smooth transitions', () => {
    const config: DirectionalFieldConfig = {
      type: 'bidirectional',
      behavior: 'angle-based',
      angle: 0 // Horizontal axis
    };
    
    // Test multiple angles
    const angles = [0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, Math.PI];
    const results = angles.map(angle => {
      const pointerData: PointerData = {
        position: { 
          x: Math.cos(angle), 
          y: Math.sin(angle) 
        },
        distance: 100,
        normalizedDistance: 0.5,
        angle,
        elapsedTime: 100
      };
      
      return calculateDirectionalForce(config, pointerData);
    });
    
    // All forces should be on the horizontal axis
    results.forEach(result => {
      // Force direction should be horizontal (y close to 0)
      expect(Math.abs(result.force.y)).toBeCloseTo(0);
      
      // Force should be non-zero
      expect(vectorMagnitude(result.force)).toBeGreaterThan(0);
    });
    
    // Forces on opposite sides should point in opposite directions
    expect(Math.sign(results[0].force.x)).toBe(-Math.sign(results[5].force.x));
  });
});

// Test radial field
describe('Radial Field (Fixed)', () => {
  test('calculateDirectionalForce with radial field returns force away from center', () => {
    const config: DirectionalFieldConfig = {
      type: 'radial',
      behavior: 'constant',
      center: { x: 0.5, y: 0.5 } // Center of element
    };
    
    // Test points in different quadrants
    const pointers: PointerData[] = [
      // Top-right quadrant
      {
        position: { x: 0.8, y: 0.2 },
        distance: 100,
        normalizedDistance: 0.5,
        angle: Math.atan2(0.2 - 0.5, 0.8 - 0.5),
        elapsedTime: 100
      },
      // Bottom-right quadrant
      {
        position: { x: 0.8, y: 0.8 },
        distance: 100,
        normalizedDistance: 0.5,
        angle: Math.atan2(0.8 - 0.5, 0.8 - 0.5),
        elapsedTime: 100
      },
      // Bottom-left quadrant
      {
        position: { x: 0.2, y: 0.8 },
        distance: 100,
        normalizedDistance: 0.5,
        angle: Math.atan2(0.8 - 0.5, 0.2 - 0.5),
        elapsedTime: 100
      },
      // Top-left quadrant
      {
        position: { x: 0.2, y: 0.2 },
        distance: 100,
        normalizedDistance: 0.5,
        angle: Math.atan2(0.2 - 0.5, 0.2 - 0.5),
        elapsedTime: 100
      }
    ];
    
    const results = pointers.map(pointer => calculateDirectionalForce(config, pointer));
    
    // For each point, the force should point away from center
    results.forEach((result, i) => {
      const pointer = pointers[i];
      
      // Calculate expected direction from pointer position to center
      const expectedDirection = {
        x: Math.sign(pointer.position.x - 0.5),
        y: Math.sign(pointer.position.y - 0.5)
      };
      
      // Force should have the expected direction sign
      expect(Math.sign(result.force.x) || 0).toBe(expectedDirection.x);
      expect(Math.sign(result.force.y) || 0).toBe(expectedDirection.y);
      
      // Force magnitude should be positive
      expect(result.magnitude).toBeGreaterThan(0);
    });
  });
  
  test('radial field with distance-based behavior decreases with distance', () => {
    const config: DirectionalFieldConfig = {
      type: 'radial',
      behavior: 'distance-based',
      center: { x: 0.5, y: 0.5 }
    };
    
    // Create test points at different distances
    const nearPointer: PointerData = {
      position: { x: 0.6, y: 0.5 }, // Close to center
      distance: 10,
      normalizedDistance: 0.1, // 10% of max distance
      angle: 0,
      elapsedTime: 100
    };
    
    const farPointer: PointerData = {
      position: { x: 0.9, y: 0.5 }, // Far from center
      distance: 80,
      normalizedDistance: 0.8, // 80% of max distance
      angle: 0,
      elapsedTime: 100
    };
    
    const nearResult = calculateDirectionalForce(config, nearPointer);
    const farResult = calculateDirectionalForce(config, farPointer);
    
    // Near should have stronger force than far
    expect(nearResult.magnitude).toBeGreaterThan(farResult.magnitude);
    
    // Force direction should be the same (both pointing right from center)
    expect(Math.sign(nearResult.force.x)).toBe(Math.sign(farResult.force.x));
    
    // With distance-based behavior, force should be inversely proportional to distance
    // nearResult should be approximately (1 - 0.1) = 0.9
    // farResult should be approximately (1 - 0.8) = 0.2
    // Ratio should be around 4.5
    const expectedRatio = (1 - nearPointer.normalizedDistance) / (1 - farPointer.normalizedDistance);
    const actualRatio = nearResult.magnitude / farResult.magnitude;
    
    // Allow for some implementation differences with a reasonable tolerance
    expect(actualRatio).toBeGreaterThan(expectedRatio * 0.5);
    expect(actualRatio).toBeLessThan(expectedRatio * 2);
  });
});

// Test force modifiers
describe('Force Modifiers (Fixed)', () => {
  test('dampen modifier reduces force magnitude', () => {
    // Create a config with a dampen modifier
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 },
      modifiers: [
        {
          type: 'dampen',
          factor: 0.5, // 50% reduction
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
    
    // Force with modifier should be half as strong (factor is 0.5)
    expect(withModifier.magnitude).toBeCloseTo(withoutModifier.magnitude * 0.5);
  });
  
  test('invert modifier flips force direction', () => {
    // Create a config with an invert modifier
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 }, // Pointing right
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
    
    // Get force with and without modifier
    const withModifier = calculateDirectionalForce(config, pointerData);
    const configWithoutModifier = { ...config, modifiers: [] };
    const withoutModifier = calculateDirectionalForce(configWithoutModifier, pointerData);
    
    // Force with invert modifier should be opposite direction
    expect(Math.sign(withModifier.force.x)).toBe(-Math.sign(withoutModifier.force.x));
    expect(withModifier.force.y).toBeCloseTo(withoutModifier.force.y); // Y should be unchanged (both 0)
    
    // Magnitude should be the same
    expect(withModifier.magnitude).toBeCloseTo(withoutModifier.magnitude);
  });
  
  test('cap modifier limits force magnitude', () => {
    // Create a config with a cap modifier
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 2, y: 0 }, // Extra strong direction vector
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
    
    // Direction should be preserved (x > 0, y = 0)
    expect(result.force.x).toBeGreaterThan(0);
    expect(result.force.y).toBeCloseTo(0);
  });
  
  test('multiple modifiers can be applied in sequence', () => {
    // Create a config with multiple modifiers
    const config: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 },
      modifiers: [
        {
          type: 'dampen',
          factor: 0.5, // 50% reduction
          target: 'both',
          applyModifier: () => ({ x: 0, y: 0 })
        },
        {
          type: 'invert',
          factor: 1,
          target: 'x', // Only invert x component
          applyModifier: () => ({ x: 0, y: 0 })
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
    
    // Get force with modifiers
    const result = calculateDirectionalForce(config, pointerData);
    
    // Get baseline result with no modifiers
    const baseline = calculateDirectionalForce({ ...config, modifiers: [] }, pointerData);
    
    // Result should be dampened by 50% and inverted
    // Dampen: 1.0 -> 0.5
    // Invert x: 0.5 -> -0.5
    expect(result.force.x).toBeCloseTo(-baseline.force.x * 0.5);
    
    // Magnitude should be 50% of baseline
    expect(result.magnitude).toBeCloseTo(baseline.magnitude * 0.5);
  });
}); 