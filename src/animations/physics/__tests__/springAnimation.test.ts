/**
 * Tests for spring animation system
 */
import { springAnimation } from '../springAnimation';

// Mock styled-components
jest.mock('styled-components', () => ({
  css: jest.fn(() => ({})),
  keyframes: jest.fn(() => ({}))
}));

// Mock cssWithKebabProps
jest.mock('../../../core/cssUtils', () => ({
  cssWithKebabProps: jest.fn(() => 'mock-css-output')
}));

describe('springAnimation', () => {
  test('should create animation with default options', () => {
    const result = springAnimation();
    expect(result).toBe('mock-css-output');
  });
  
  test('should handle reducedMotion option', () => {
    const result = springAnimation({ reducedMotion: true });
    expect(result).toBe('mock-css-output');
  });
  
  test('should handle custom physics parameters', () => {
    const result = springAnimation({
      mass: 2,
      stiffness: 100,
      dampingRatio: 0.5
    });
    expect(result).toBe('mock-css-output');
  });
  
  test('should handle custom properties and values', () => {
    const result = springAnimation({
      properties: ['transform', 'opacity'],
      from: { opacity: 0 },
      to: { opacity: 1 }
    });
    expect(result).toBe('mock-css-output');
  });
});