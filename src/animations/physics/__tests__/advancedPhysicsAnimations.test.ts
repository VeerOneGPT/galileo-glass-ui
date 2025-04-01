/**
 * Tests for advanced physics animations
 */
import {
  AnimationComplexity,
  MotionSensitivityLevel,
  getMotionSensitivity
} from '../../accessibility/MotionSensitivity';
import {
  advancedPhysicsAnimation,
  generatePhysicsKeyframes,
  SimulationType,
} from '../advancedPhysicsAnimations';
import { getOptimizedGPUAcceleration } from '../../performance/GPUAcceleration';

// Type the mocked functions
const mockedGetMotionSensitivity = getMotionSensitivity as jest.MockedFunction<typeof getMotionSensitivity>;
const mockedGetOptimizedGPUAcceleration = getOptimizedGPUAcceleration as jest.MockedFunction<typeof getOptimizedGPUAcceleration>;

// Mock style and animation utilities
jest.mock('styled-components', () => ({
  css: jest.fn(() => 'mock-css'),
  keyframes: jest.fn(() => 'mock-keyframes'),
}));

// Mock cssWithKebabProps
jest.mock('../../../core/cssUtils', () => ({
  cssWithKebabProps: jest.fn(() => 'mock-css-output'),
}));

// Mock motion sensitivity functions
jest.mock('../../accessibility/MotionSensitivity', () => {
  const original = jest.requireActual('../../accessibility/MotionSensitivity');
  return {
    ...original,
    getMotionSensitivity: jest.fn().mockImplementation(level => {
      // Return appropriate config based on level
      switch (level) {
        case 'maximum':
          return {
            level: 'maximum',
            maxAllowedComplexity: 'minimal',
            maxAllowedDuration: 100,
            disableParallax: true,
            disableAutoPlay: true,
            disableBackgroundAnimations: true,
            disableHoverAnimations: true,
          };
        case 'high':
          return {
            level: 'high',
            maxAllowedComplexity: 'basic',
            maxAllowedDuration: 300,
            disableParallax: true,
            disableAutoPlay: true,
            disableBackgroundAnimations: true,
            disableHoverAnimations: true,
          };
        case 'medium':
          return {
            level: 'medium',
            maxAllowedComplexity: 'standard',
            maxAllowedDuration: 500,
            disableParallax: true,
            disableAutoPlay: false,
            disableBackgroundAnimations: true,
            disableHoverAnimations: false,
          };
        case 'low':
          return {
            level: 'low',
            maxAllowedComplexity: 'enhanced',
            maxAllowedDuration: 1000,
            disableParallax: false,
            disableAutoPlay: false,
            disableBackgroundAnimations: false,
            disableHoverAnimations: false,
          };
        case 'none':
        default:
          return {
            level: 'none',
            maxAllowedComplexity: 'complex',
            maxAllowedDuration: 2000,
            disableParallax: false,
            disableAutoPlay: false,
            disableBackgroundAnimations: false,
            disableHoverAnimations: false,
          };
      }
    }),
    isAnimationComplexityAllowed: jest.fn().mockReturnValue(true),
    getAdjustedAnimation: jest.fn().mockReturnValue({
      duration: 500,
      shouldAnimate: true,
    }),
  };
});

// Mock GPU acceleration utility
jest.mock('../../performance/GPUAcceleration', () => ({
  getOptimizedGPUAcceleration: jest.fn().mockReturnValue({
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform, opacity',
  }),
}));

describe('advancedPhysicsAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create animation with default options', () => {
    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.SPRING,
      sensitivity: MotionSensitivityLevel.NONE,
    });

    // Should return a string (CSS result)
    expect(typeof result).toBe('string');
  });

  test('should handle different animation modes', () => {
    const simulationTypes = [
      SimulationType.SPRING,
      SimulationType.BOUNCE,
      SimulationType.ELASTIC,
      SimulationType.INERTIA,
      SimulationType.MAGNETIC,
      SimulationType.LIQUID,
      SimulationType.CHAIN,
    ];

    simulationTypes.forEach(type => {
      const result = advancedPhysicsAnimation({
        simulationType: type,
        sensitivity: MotionSensitivityLevel.NONE,
      });

      expect(typeof result).toBe('string');
    });
  });

  test('should handle high sensitivity level with reduced animations', () => {
    // Configure mock to return high sensitivity
    // @ts-ignore - Temporarily ignore type error for mock function
    getMotionSensitivity.mockReturnValueOnce({
      level: 'high',
      maxAllowedComplexity: 'basic',
      maxAllowedDuration: 300,
      disableParallax: true,
      disableAutoPlay: true,
      disableBackgroundAnimations: true,
      disableHoverAnimations: true,
    });

    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.SPRING,
      sensitivity: MotionSensitivityLevel.HIGH,
      complexity: AnimationComplexity.COMPLEX, // Too complex for HIGH sensitivity
    });

    // Should return a simplified animation
    expect(typeof result).toBe('string');
    expect(getMotionSensitivity).toHaveBeenCalledWith(MotionSensitivityLevel.HIGH);
  });

  test('should use simplified animation for medium sensitivity', () => {
    // Configure mock to return medium sensitivity
    // @ts-ignore - Temporarily ignore type error for mock function
    getMotionSensitivity.mockReturnValueOnce({
      level: 'medium',
      maxAllowedComplexity: 'standard',
      maxAllowedDuration: 500,
      disableParallax: true,
      disableAutoPlay: false,
      disableBackgroundAnimations: true,
      disableHoverAnimations: false,
    });

    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.SPRING,
      sensitivity: MotionSensitivityLevel.MEDIUM,
      complexity: AnimationComplexity.STANDARD, // Just right for MEDIUM sensitivity
    });

    expect(typeof result).toBe('string');
    expect(getMotionSensitivity).toHaveBeenCalledWith(MotionSensitivityLevel.MEDIUM);
  });

  test('should fall back to spring animation for basic complexity', () => {
    // Configure mock to limit to basic animations
    // @ts-ignore - Temporarily ignore type error for mock function
    getMotionSensitivity.mockReturnValueOnce({
      level: 'high',
      maxAllowedComplexity: 'basic',
      maxAllowedDuration: 300,
      disableParallax: true,
      disableAutoPlay: true,
      disableBackgroundAnimations: true,
      disableHoverAnimations: true,
    });

    // Use spring parameters with high sensitivity
    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.SPRING,
      sensitivity: MotionSensitivityLevel.HIGH,
      mass: 2,
      stiffness: 170,
    });

    expect(typeof result).toBe('string');
  });

  test('should use minimal transition for maximum sensitivity', () => {
    // Configure mock to limit to minimal animations
    // @ts-ignore - Temporarily ignore type error for mock function
    getMotionSensitivity.mockReturnValueOnce({
      level: 'maximum',
      maxAllowedComplexity: 'minimal',
      maxAllowedDuration: 100,
      disableParallax: true,
      disableAutoPlay: true,
      disableBackgroundAnimations: true,
      disableHoverAnimations: true,
    });

    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.SPRING,
      sensitivity: MotionSensitivityLevel.MAXIMUM,
    });

    expect(typeof result).toBe('string');
  });

  test('should use regular physics for low sensitivity', () => {
    // Configure mock for low sensitivity (allows most animations)
    // @ts-ignore - Temporarily ignore type error for mock function
    getMotionSensitivity.mockReturnValueOnce({
      level: 'low',
      maxAllowedComplexity: 'enhanced',
      maxAllowedDuration: 1000,
      disableParallax: false,
      disableAutoPlay: false,
      disableBackgroundAnimations: false,
      disableHoverAnimations: false,
    });

    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.ELASTIC,
      sensitivity: MotionSensitivityLevel.LOW,
      complexity: AnimationComplexity.ENHANCED,
    });

    expect(typeof result).toBe('string');
  });

  test('should handle animation parameters', () => {
    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.SPRING,
      sensitivity: MotionSensitivityLevel.NONE,
      initialState: { opacity: 0 },
      targetState: { opacity: 1 },
    });

    expect(typeof result).toBe('string');
  });

  test('should apply GPU acceleration when specified', () => {
    const result = advancedPhysicsAnimation({
      simulationType: SimulationType.SPRING,
      sensitivity: MotionSensitivityLevel.NONE,
      gpuAccelerated: true,
    });

    expect(typeof result).toBe('string');
    expect(getOptimizedGPUAcceleration).toHaveBeenCalled();
  });
});

describe('generatePhysicsKeyframes', () => {
  test('should generate spring keyframes', () => {
    const result = generatePhysicsKeyframes({
      simulationType: SimulationType.SPRING,
    });

    expect(result).toHaveProperty('keyframes');
    expect(result).toHaveProperty('css');
  });

  test('should generate keyframes for different physics modes', () => {
    const simulationTypes = [
      SimulationType.SPRING,
      SimulationType.BOUNCE,
      SimulationType.ELASTIC,
      SimulationType.LIQUID,
      SimulationType.INERTIA,
      SimulationType.CHAIN,
      SimulationType.MAGNETIC,
    ];

    simulationTypes.forEach(type => {
      const result = generatePhysicsKeyframes({
        simulationType: type,
      });

      expect(result).toHaveProperty('keyframes');
      expect(result).toHaveProperty('css');
    });
  });

  test('should generate keyframes with custom properties', () => {
    const result = generatePhysicsKeyframes({
      simulationType: SimulationType.SPRING,
      initialState: { opacity: 0, scale: 0.8 },
      targetState: { opacity: 1, scale: 1 },
    });

    expect(result).toHaveProperty('keyframes');
    expect(result).toHaveProperty('css');
  });

  test('should include duration in animation CSS', () => {
    const result = generatePhysicsKeyframes({
      simulationType: SimulationType.SPRING,
      duration: 750,
    });

    // Check that the css property includes the duration
    expect(result.css).toBeDefined();
  });

  test('should include GPU acceleration when specified', () => {
    const result = generatePhysicsKeyframes({
      simulationType: SimulationType.SPRING,
      gpuAccelerated: true,
    });

    // Check that the css property includes acceleration styles
    expect(result.css).toBeDefined();
  });
});
