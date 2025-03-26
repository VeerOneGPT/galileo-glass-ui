/**
 * Tests for magnetic effect
 */
import { magneticEffect } from '../magneticEffect';

// Mock styled-components
jest.mock('styled-components', () => ({
  css: jest.fn(() => ({})),
  keyframes: jest.fn(() => ({}))
}));

// Mock cssWithKebabProps
jest.mock('../../../core/cssUtils', () => ({
  cssWithKebabProps: jest.fn(() => 'mock-css-output')
}));

describe('magneticEffect', () => {
  test('should generate basic effect', () => {
    const result = magneticEffect();
    expect(result).toBe('mock-css-output');
  });
  
  test('should accept strength parameter', () => {
    const result = magneticEffect({ strength: 0.5 });
    expect(result).toBe('mock-css-output');
  });
  
  test('should accept 3D-like effects', () => {
    const result = magneticEffect({ affectsRotation: true, affectsScale: true });
    expect(result).toBe('mock-css-output');
  });
  
  test('should handle reduced motion', () => {
    const result = magneticEffect({ reducedMotion: true });
    expect(result).toBe('mock-css-output');
  });
});