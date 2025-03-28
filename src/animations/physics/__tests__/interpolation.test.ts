/**
 * Tests for animation interpolation functions
 */

import {
  Easings,
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  springLight,
  springMedium,
  springHeavy,
  bezier,
  createSpringEasing,
  composeEasings,
  blendEasings,
  applyEasing,
  steps,
  clamp
} from '../interpolation';

describe('Animation Interpolation Functions', () => {
  describe('Utility Functions', () => {
    test('clamp should restrict values to 0-1 range', () => {
      expect(clamp(-0.5)).toBe(0);
      expect(clamp(0)).toBe(0);
      expect(clamp(0.5)).toBe(0.5);
      expect(clamp(1)).toBe(1);
      expect(clamp(1.5)).toBe(1);
      
      // Custom range
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
    
    test('applyEasing should interpolate correctly', () => {
      expect(applyEasing(linear, 0, 100, 200)).toBe(100);
      expect(applyEasing(linear, 0.5, 100, 200)).toBe(150);
      expect(applyEasing(linear, 1, 100, 200)).toBe(200);
      
      // With easing function
      expect(applyEasing(easeInQuad, 0.5, 0, 100)).toBe(25);
    });
  });
  
  describe('Basic Easing Functions', () => {
    test('linear easing should interpolate linearly', () => {
      expect(linear.function(0)).toBe(0);
      expect(linear.function(0.25)).toBe(0.25);
      expect(linear.function(0.5)).toBe(0.5);
      expect(linear.function(0.75)).toBe(0.75);
      expect(linear.function(1)).toBe(1);
    });
    
    test('quadratic ease-in', () => {
      expect(easeInQuad.function(0)).toBe(0);
      expect(easeInQuad.function(0.5)).toBe(0.25);
      expect(easeInQuad.function(1)).toBe(1);
    });
    
    test('quadratic ease-out', () => {
      expect(easeOutQuad.function(0)).toBe(0);
      expect(easeOutQuad.function(0.5)).toBe(0.75);
      expect(easeOutQuad.function(1)).toBe(1);
    });
    
    test('quadratic ease-in-out', () => {
      expect(easeInOutQuad.function(0)).toBe(0);
      expect(easeInOutQuad.function(0.25)).toBe(0.125);
      expect(easeInOutQuad.function(0.5)).toBe(0.5);
      expect(easeInOutQuad.function(0.75)).toBe(0.875);
      expect(easeInOutQuad.function(1)).toBe(1);
    });
  });
  
  describe('Cubic Easing Functions', () => {
    test('cubic ease-in', () => {
      expect(easeInCubic.function(0)).toBe(0);
      expect(easeInCubic.function(0.5)).toBe(0.125);
      expect(easeInCubic.function(1)).toBe(1);
    });
    
    test('cubic ease-out', () => {
      expect(easeOutCubic.function(0)).toBe(0);
      expect(easeOutCubic.function(0.5)).toBeCloseTo(0.875);
      expect(easeOutCubic.function(1)).toBe(1);
    });
    
    test('cubic ease-in-out', () => {
      expect(easeInOutCubic.function(0)).toBe(0);
      expect(easeInOutCubic.function(0.25)).toBe(0.0625);
      expect(easeInOutCubic.function(0.5)).toBe(0.5);
      expect(easeInOutCubic.function(0.75)).toBe(0.9375);
      expect(easeInOutCubic.function(1)).toBe(1);
    });
  });
  
  describe('Exponential Easing Functions', () => {
    test('exponential ease-in', () => {
      expect(easeInExpo.function(0)).toBe(0);
      expect(easeInExpo.function(0.5)).toBeCloseTo(0.03125);
      expect(easeInExpo.function(1)).toBe(1);
    });
    
    test('exponential ease-out', () => {
      expect(easeOutExpo.function(0)).toBe(0);
      expect(easeOutExpo.function(0.5)).toBeCloseTo(0.96875);
      expect(easeOutExpo.function(1)).toBe(1);
    });
    
    test('exponential ease-in-out', () => {
      expect(easeInOutExpo.function(0)).toBe(0);
      expect(easeInOutExpo.function(0.25)).toBeCloseTo(0.015625);
      expect(easeInOutExpo.function(0.5)).toBe(0.5);
      expect(easeInOutExpo.function(0.75)).toBeCloseTo(0.984375);
      expect(easeInOutExpo.function(1)).toBe(1);
    });
  });
  
  describe('Elastic Easing Functions', () => {
    test('elastic ease-in', () => {
      expect(easeInElastic.function(0)).toBe(0);
      expect(easeInElastic.function(1)).toBe(1);
      // Overshooting inbetween
      expect(easeInElastic.function(0.4)).toBeLessThan(0);
    });
    
    test('elastic ease-out', () => {
      expect(easeOutElastic.function(0)).toBe(0);
      expect(easeOutElastic.function(1)).toBe(1);
      // Overshooting inbetween
      expect(easeOutElastic.function(0.2)).toBeGreaterThan(1);
    });
    
    test('elastic ease-in-out', () => {
      expect(easeInOutElastic.function(0)).toBe(0);
      expect(easeInOutElastic.function(0.5)).toBe(0.5);
      expect(easeInOutElastic.function(1)).toBe(1);
      // Overshooting inbetween
      expect(easeInOutElastic.function(0.25)).toBeLessThan(0);
      expect(easeInOutElastic.function(0.75)).toBeGreaterThan(1);
    });
  });
  
  describe('Bounce Easing Functions', () => {
    test('bounce ease-in', () => {
      expect(easeInBounce.function(0)).toBe(0);
      expect(easeInBounce.function(1)).toBe(1);
      // No overshooting but non-linear path
      expect(easeInBounce.function(0.2)).toBeLessThan(0.2);
      expect(easeInBounce.function(0.4)).toBeGreaterThan(0.2);
    });
    
    test('bounce ease-out', () => {
      expect(easeOutBounce.function(0)).toBe(0);
      expect(easeOutBounce.function(1)).toBe(1);
      // No overshooting but non-linear path
      expect(easeOutBounce.function(0.2)).toBeGreaterThan(0.2);
      expect(easeOutBounce.function(0.85)).toBeLessThan(1);
    });
    
    test('bounce ease-in-out', () => {
      expect(easeInOutBounce.function(0)).toBe(0);
      expect(easeInOutBounce.function(0.5)).toBe(0.5);
      expect(easeInOutBounce.function(1)).toBe(1);
    });
  });
  
  describe('Spring Easing Functions', () => {
    test('light spring should oscillate mildly', () => {
      expect(springLight.function(0)).toBeCloseTo(0);
      expect(springLight.function(1)).toBeCloseTo(1);
      
      // Should approach 1 with some oscillation
      const values = [0.2, 0.4, 0.6, 0.8].map(t => springLight.function(t));
      
      // Check that it has at least one oscillation
      let hasOscillation = false;
      for (let i = 1; i < values.length; i++) {
        if ((values[i] - values[i-1]) < 0) {
          hasOscillation = true;
          break;
        }
      }
      
      expect(hasOscillation).toBe(true);
    });
    
    test('medium spring should oscillate moderately', () => {
      expect(springMedium.function(0)).toBeCloseTo(0);
      expect(springMedium.function(1)).toBeCloseTo(1);
    });
    
    test('heavy spring should oscillate strongly', () => {
      expect(springHeavy.function(0)).toBeCloseTo(0);
      expect(springHeavy.function(1)).toBeCloseTo(1);
      
      // Heavy spring should have more pronounced oscillations than light spring
      const lightValues = [0.2, 0.4, 0.6, 0.8].map(t => springLight.function(t));
      const heavyValues = [0.2, 0.4, 0.6, 0.8].map(t => springHeavy.function(t));
      
      // Calculate oscillation amplitude as max deviation from monotonic increase
      let lightMaxDeviation = 0;
      let heavyMaxDeviation = 0;
      
      for (let i = 1; i < lightValues.length; i++) {
        const lightDelta = lightValues[i] - lightValues[i-1];
        const heavyDelta = heavyValues[i] - heavyValues[i-1];
        
        if (lightDelta < 0) lightMaxDeviation = Math.max(lightMaxDeviation, Math.abs(lightDelta));
        if (heavyDelta < 0) heavyMaxDeviation = Math.max(heavyMaxDeviation, Math.abs(heavyDelta));
      }
      
      expect(heavyMaxDeviation).toBeGreaterThan(lightMaxDeviation);
    });
  });
  
  describe('Special Easing Functions', () => {
    test('steps easing should create discrete steps', () => {
      const stepsFunction = steps(4);
      
      expect(stepsFunction.function(0)).toBe(0);
      expect(stepsFunction.function(0.24)).toBe(0);
      expect(stepsFunction.function(0.25)).toBe(0.25);
      expect(stepsFunction.function(0.49)).toBe(0.25);
      expect(stepsFunction.function(0.5)).toBe(0.5);
      expect(stepsFunction.function(0.74)).toBe(0.5);
      expect(stepsFunction.function(0.75)).toBe(0.75);
      expect(stepsFunction.function(0.99)).toBe(0.75);
      expect(stepsFunction.function(1)).toBe(1);
    });
  });
  
  describe('Bezier Easing', () => {
    test('bezier easing should create custom curves', () => {
      const customBezier = bezier(0.42, 0, 0.58, 1); // Equivalent to CSS ease-in-out
      
      expect(customBezier.function(0)).toBe(0);
      expect(customBezier.function(1)).toBe(1);
      
      // Mid-point should approximate CSS ease-in-out
      expect(customBezier.function(0.5)).toBeCloseTo(0.5);
      
      // Should be symmetric
      expect(customBezier.function(0.2)).toBeCloseTo(1 - customBezier.function(0.8), 2);
    });
  });
  
  describe('Composition Functions', () => {
    test('composeEasings should combine multiple easings', () => {
      const composed = composeEasings([easeInQuad, easeOutQuad], [0.5]);
      
      expect(composed.function(0)).toBe(0);
      expect(composed.function(0.25)).toBeCloseTo(easeInQuad.function(0.5));
      expect(composed.function(0.5)).toBeCloseTo(0.5);
      expect(composed.function(0.75)).toBeCloseTo(0.5 + 0.5 * easeOutQuad.function(0.5));
      expect(composed.function(1)).toBe(1);
    });
    
    test('blendEasings should interpolate between two easings', () => {
      const blended = blendEasings(linear, easeInQuad, 0.5);
      
      expect(blended.function(0)).toBe(0);
      expect(blended.function(0.5)).toBe((0.5 + 0.25) / 2); // Average of linear and quad
      expect(blended.function(1)).toBe(1);
    });
  });
  
  describe('Custom Spring Easing', () => {
    test('createSpringEasing should create custom spring-like easing', () => {
      const customSpring = createSpringEasing(1, 100, 10, 0);
      
      expect(customSpring.function(0)).toBe(0);
      expect(customSpring.function(1)).toBe(1);
      
      // Should have some oscillation in the middle
      const values = Array.from({ length: 21 }, (_, i) => customSpring.function(i / 20));
      
      // Check for direction changes (oscillation)
      let directionChanges = 0;
      for (let i = 2; i < values.length; i++) {
        const prevDiff = values[i-1] - values[i-2];
        const currDiff = values[i] - values[i-1];
        
        if ((prevDiff > 0 && currDiff < 0) || (prevDiff < 0 && currDiff > 0)) {
          directionChanges++;
        }
      }
      
      // Should have at least one oscillation
      expect(directionChanges).toBeGreaterThan(0);
    });
  });
  
  describe('Easing Collection', () => {
    test('Easings object should contain all easing functions', () => {
      expect(Object.keys(Easings).length).toBeGreaterThan(30);
      expect(Easings.linear).toBe(linear);
      expect(Easings.easeInQuad).toBe(easeInQuad);
      expect(Easings.easeOutQuad).toBe(easeOutQuad);
      expect(Easings.easeInOutQuad).toBe(easeInOutQuad);
      expect(Easings.bezier).toBe(bezier);
    });
  });
});