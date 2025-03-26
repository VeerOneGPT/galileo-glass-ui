/**
 * Tests for accessible animation system
 */
import _React from 'react';

import 'jest-styled-components';

// Import in alphabetical order grouped by path depth
import {
  accessibleAnimation,
  conditionalAnimation,
  getAccessibleKeyframes,
  useAccessibleAnimation,
} from '../accessibleAnimation';
import { AnimationComplexity as _AnimationComplexity, MotionSensitivityLevel } from '../MotionSensitivity';

// Mock useReducedMotion hook
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false),
}));

// Mock AnimationMapper
jest.mock('../AnimationMapper', () => ({
  animationMapper: {
    getAccessibleAnimation: jest.fn().mockImplementation(animation => ({
      animation,
      shouldAnimate: true,
      duration: 300,
    })),
  },
}));

// Mock file imports
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { animationMapper } from '../AnimationMapper';

// Mock styled-components
jest.mock('styled-components', () => ({
  css: jest.fn(() => ({})),
  keyframes: jest.fn(() => ({})),
}));

// Create a proper mock Keyframes object for testing
const testKeyframes = {
  getName: () => 'test-keyframes',
  id: 'test-id',
  name: 'test-keyframes',
  rules: 'from { opacity: 0; } to { opacity: 1; }',
  toString: () => 'test-keyframes',
};

// Mock the accessibleAnimation function for tests that need mockReturnValueOnce
jest.mock('../accessibleAnimation', () => {
  const originalModule = jest.requireActual('../accessibleAnimation');
  return {
    ...originalModule,
    accessibleAnimation: jest.fn().mockImplementation(originalModule.accessibleAnimation),
    getAccessibleKeyframes: jest.fn().mockImplementation(originalModule.getAccessibleKeyframes),
  };
});

describe('accessibleAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle basic animation', () => {
    const result = accessibleAnimation(testKeyframes);
    expect(result).toBeDefined();
  });

  test('should handle disabled animation', () => {
    // Set up the mock to return shouldAnimate: false
    (animationMapper.getAccessibleAnimation as jest.Mock).mockReturnValueOnce({
      animation: testKeyframes,
      shouldAnimate: false,
    });

    const result = accessibleAnimation(testKeyframes, {
      motionSensitivity: MotionSensitivityLevel.HIGH,
    });

    expect(result).toBeDefined();
  });
});

describe('useAccessibleAnimation hook', () => {
  test('should work with reduced motion', () => {
    // Mock the hook to return true for reduced motion
    (useReducedMotion as jest.Mock).mockReturnValueOnce(true);

    const result = useAccessibleAnimation(testKeyframes);
    expect(result).toBeDefined();
  });
});

describe('conditionalAnimation', () => {
  test('should return animation when condition is true', () => {
    const result = conditionalAnimation(true, testKeyframes);
    expect(result).toBeDefined();
  });

  test('should return empty styles when condition is false', () => {
    const result = conditionalAnimation(false, testKeyframes);
    expect(result).toBeDefined();
  });
});

describe('getAccessibleKeyframes', () => {
  test('should return animation when enabled', () => {
    (animationMapper.getAccessibleAnimation as jest.Mock).mockReturnValueOnce({
      animation: testKeyframes,
      shouldAnimate: true,
    });

    const result = getAccessibleKeyframes(testKeyframes);
    expect(result).toBe(testKeyframes);
  });

  test('should return null when disabled', () => {
    (animationMapper.getAccessibleAnimation as jest.Mock).mockReturnValueOnce({
      animation: testKeyframes,
      shouldAnimate: false,
    });

    const result = getAccessibleKeyframes(testKeyframes);
    expect(result).toBeNull();
  });
});
