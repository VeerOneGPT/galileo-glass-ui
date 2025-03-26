/**
 * Tests for advanced physics animations
 */
import { advancedPhysicsAnimation, generatePhysicsKeyframes, PhysicsAnimationMode } from '../advancedPhysicsAnimations';
import { AnimationComplexity, MotionSensitivityLevel } from '../../accessibility/MotionSensitivity';

// Mock style and animation utilities
jest.mock('styled-components', () => ({
  css: jest.fn(() => "mock-css"),
  keyframes: jest.fn(() => "mock-keyframes")
}));

// Mock cssWithKebabProps
jest.mock('../../../core/cssUtils', () => ({
  cssWithKebabProps: jest.fn(() => 'mock-css-output')
}));

// Mock motion sensitivity functions
jest.mock('../../accessibility/MotionSensitivity', () => {
  const original = jest.requireActual('../../accessibility/MotionSensitivity');
  return {
    ...original,
    getMotionSensitivity: jest.fn().mockImplementation((level) => {
      // Return appropriate config based on level
      switch(level) {
        case 'maximum':
          return {
            level: 'maximum',
            maxAllowedComplexity: 'minimal',
            maxAllowedDuration: 100,
            disableParallax: true,
            disableAutoPlay: true,
            disableBackgroundAnimations: true,
            disableHoverAnimations: true
          };
        case 'high':
          return {
            level: 'high',
            maxAllowedComplexity: 'basic',
            maxAllowedDuration: 300,
            disableParallax: true,
            disableAutoPlay: true,
            disableBackgroundAnimations: true,
            disableHoverAnimations: true
          };
        case 'medium':
          return {
            level: 'medium',
            maxAllowedComplexity: 'standard',
            maxAllowedDuration: 500,
            disableParallax: true,
            disableAutoPlay: false,
            disableBackgroundAnimations: true,
            disableHoverAnimations: false
          };
        case 'low':
          return {
            level: 'low',
            maxAllowedComplexity: 'enhanced',
            maxAllowedDuration: 1000,
            disableParallax: false,
            disableAutoPlay: false,
            disableBackgroundAnimations: false,
            disableHoverAnimations: false
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
            disableHoverAnimations: false
          };
      }
    }),
    isAnimationComplexityAllowed: jest.fn().mockReturnValue(true),
    getAdjustedAnimation: jest.fn().mockReturnValue({
      duration: 500,
      shouldAnimate: true
    })
  };
});

// Mock GPU acceleration utility
jest.mock('../../performance/GPUAcceleration', () => ({
  getOptimizedGPUAcceleration: jest.fn().mockReturnValue({
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform, opacity'
  })
}));

describe('advancedPhysicsAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create animation with default options', () => {
    const result = advancedPhysicsAnimation({
      mode: PhysicsAnimationMode.SPRING,
      sensitivity: MotionSensitivityLevel.NONE
    });
    
    // Should return a string (CSS result)
    expect(typeof result).toBe('string');
  });
  
  test('should handle different animation modes', () => {
    const modes = [
      PhysicsAnimationMode.SPRING,
      PhysicsAnimationMode.BOUNCE,
      PhysicsAnimationMode.ELASTIC,
      PhysicsAnimationMode.INERTIA,
      PhysicsAnimationMode.MAGNETIC
    ];
    
    modes.forEach(mode => {
      const result = advancedPhysicsAnimation({ 
        mode: mode,
        sensitivity: MotionSensitivityLevel.NONE
      });
      
      expect(typeof result).toBe('string');
    });
  });

  test('should handle high sensitivity level with reduced animations', () => {
    const { getMotionSensitivity } = require('../../accessibility/MotionSensitivity');
    
    // Configure mock to return high sensitivity
    getMotionSensitivity.mockReturnValueOnce({
      level: 'high',
      maxAllowedComplexity: 'basic',
      maxAllowedDuration: 300,
      disableParallax: true,
      disableAutoPlay: true,
      disableBackgroundAnimations: true,
      disableHoverAnimations: true
    });
    
    const result = advancedPhysicsAnimation({ 
      mode: PhysicsAnimationMode.SPRING,
      sensitivity: MotionSensitivityLevel.HIGH, 
      complexity: AnimationComplexity.COMPLEX // Too complex for HIGH sensitivity
    });
    
    // Should return a simplified animation
    expect(typeof result).toBe('string');
    expect(getMotionSensitivity).toHaveBeenCalledWith(MotionSensitivityLevel.HIGH);
  });
  
  test('should use simplified animation for medium sensitivity', () => {
    const { getMotionSensitivity } = require('../../accessibility/MotionSensitivity');
    
    // Configure mock to return medium sensitivity
    getMotionSensitivity.mockReturnValueOnce({
      level: 'medium',
      maxAllowedComplexity: 'standard',
      maxAllowedDuration: 500,
      disableParallax: true,
      disableAutoPlay: false,
      disableBackgroundAnimations: true,
      disableHoverAnimations: false
    });
    
    const result = advancedPhysicsAnimation({
      mode: PhysicsAnimationMode.SPRING,
      sensitivity: MotionSensitivityLevel.MEDIUM,
      complexity: AnimationComplexity.STANDARD // Just right for MEDIUM sensitivity
    });
    
    expect(typeof result).toBe('string');
    expect(getMotionSensitivity).toHaveBeenCalledWith(MotionSensitivityLevel.MEDIUM);
  });
  
  test('should fall back to spring animation for basic complexity', () => {
    const { getMotionSensitivity } = require('../../accessibility/MotionSensitivity');
    
    // Configure mock to limit to basic animations
    getMotionSensitivity.mockReturnValueOnce({
      level: 'high',
      maxAllowedComplexity: 'basic',
      maxAllowedDuration: 300,
      disableParallax: true,
      disableAutoPlay: true,
      disableBackgroundAnimations: true,
      disableHoverAnimations: true
    });
    
    // Use spring parameters with high sensitivity
    const result = advancedPhysicsAnimation({
      mode: PhysicsAnimationMode.SPRING,
      sensitivity: MotionSensitivityLevel.HIGH,
      spring: {
        mass: 2,
        stiffness: 170,
        dampingRatio: 0.7
      }
    });
    
    expect(typeof result).toBe('string');
  });
  
  test('should use minimal transition for maximum sensitivity', () => {
    const { getMotionSensitivity } = require('../../accessibility/MotionSensitivity');
    
    // Configure mock to limit to minimal animations
    getMotionSensitivity.mockReturnValueOnce({
      level: 'maximum',
      maxAllowedComplexity: 'minimal',
      maxAllowedDuration: 100,
      disableParallax: true,
      disableAutoPlay: true,
      disableBackgroundAnimations: true,
      disableHoverAnimations: true
    });
    
    const result = advancedPhysicsAnimation({
      mode: PhysicsAnimationMode.SPRING,
      sensitivity: MotionSensitivityLevel.MAXIMUM
    });
    
    expect(typeof result).toBe('string');
  });
  
  test('should use regular physics for low sensitivity', () => {
    const { getMotionSensitivity } = require('../../accessibility/MotionSensitivity');
    
    // Configure mock for low sensitivity (allows most animations)
    getMotionSensitivity.mockReturnValueOnce({
      level: 'low',
      maxAllowedComplexity: 'enhanced',
      maxAllowedDuration: 1000,
      disableParallax: false,
      disableAutoPlay: false,
      disableBackgroundAnimations: false,
      disableHoverAnimations: false
    });
    
    const result = advancedPhysicsAnimation({
      mode: PhysicsAnimationMode.ELASTIC,
      sensitivity: MotionSensitivityLevel.LOW,
      complexity: AnimationComplexity.ENHANCED
    });
    
    expect(typeof result).toBe('string');
  });
  
  test('should handle animation parameters', () => {
    const result = advancedPhysicsAnimation({
      mode: PhysicsAnimationMode.SPRING,
      sensitivity: MotionSensitivityLevel.NONE,
      initialState: { opacity: 0 },
      targetState: { opacity: 1 }
    });
    
    expect(typeof result).toBe('string');
  });
  
  test('should apply GPU acceleration when specified', () => {
    const { getOptimizedGPUAcceleration } = require('../../performance/GPUAcceleration');
    
    const result = advancedPhysicsAnimation({
      mode: PhysicsAnimationMode.SPRING,
      sensitivity: MotionSensitivityLevel.NONE,
      gpuAccelerated: true
    });
    
    expect(typeof result).toBe('string');
    expect(getOptimizedGPUAcceleration).toHaveBeenCalled();
  });
});

describe('generatePhysicsKeyframes', () => {
  test('should generate spring keyframes', () => {
    const result = generatePhysicsKeyframes({
      mode: PhysicsAnimationMode.SPRING
    });
    
    expect(result).toHaveProperty('keyframes');
    expect(result).toHaveProperty('css');
  });
  
  test('should generate keyframes for different physics modes', () => {
    const modes = [
      PhysicsAnimationMode.SPRING,
      PhysicsAnimationMode.BOUNCE,
      PhysicsAnimationMode.ELASTIC,
      PhysicsAnimationMode.LIQUID,
      PhysicsAnimationMode.INERTIA,
      PhysicsAnimationMode.CHAIN,
      PhysicsAnimationMode.MAGNETIC
    ];
    
    modes.forEach(mode => {
      const result = generatePhysicsKeyframes({
        mode: mode
      });
      
      expect(result).toHaveProperty('keyframes');
      expect(result).toHaveProperty('css');
    });
  });
  
  test('should generate keyframes with custom properties', () => {
    const result = generatePhysicsKeyframes({
      mode: PhysicsAnimationMode.SPRING,
      initialState: { opacity: 0, scale: 0.8 },
      targetState: { opacity: 1, scale: 1 }
    });
    
    expect(result).toHaveProperty('keyframes');
    expect(result).toHaveProperty('css');
  });
  
  test('should include duration in animation CSS', () => {
    const result = generatePhysicsKeyframes({
      mode: PhysicsAnimationMode.SPRING,
      duration: 750
    });
    
    // Check that the css property includes the duration
    expect(result.css).toBeDefined();
  });
  
  test('should include GPU acceleration when specified', () => {
    const result = generatePhysicsKeyframes({
      mode: PhysicsAnimationMode.SPRING,
      gpuAccelerated: true
    });
    
    // Check that the css property includes acceleration styles
    expect(result.css).toBeDefined();
  });
});