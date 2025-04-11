/**
 * Fixed tests for useGalileoStateSpring hook
 */

import React, { useRef } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useGalileoStateSpring } from '../useGalileoStateSpring';
import { SpringPresets, SpringConfig } from '../../animations/physics/springPhysics';
import { AnimationProvider } from '../../contexts/AnimationContext';

// Import the actual module first
import * as springPhysics from '../../animations/physics/springPhysics';

// Mock the SpringPhysics class
class MockSpringPhysics {
  private position: number;
  private velocity: number;
  private target: number;
  private atRest: boolean;
  private config: any;

  constructor(config: any) {
    this.position = 0;
    this.velocity = config.initialVelocity || 0;
    this.target = 0;
    this.atRest = false;
    this.config = config;
  }

  reset(position: number, velocity: number = 0) {
    this.position = position;
    this.velocity = velocity;
    this.atRest = false;
  }

  setTarget(target: number) {
    this.target = target;
    this.atRest = this.target === this.position && this.velocity === 0;
  }

  update() {
    if (this.atRest) return { position: this.position, velocity: this.velocity, atRest: true };

    // Simple spring physics simulation for testing
    const displacement = this.position - this.target;
    const acceleration = (-this.config.tension * displacement - this.config.friction * this.velocity) / this.config.mass;
    
    this.velocity += acceleration * 0.016; // Simplified timestep
    this.position += this.velocity * 0.016;

    // Determine if at rest
    if (Math.abs(this.velocity) < this.config.restThreshold && Math.abs(displacement) < this.config.restThreshold) {
      this.velocity = 0;
      this.position = this.target;
      this.atRest = true;
    }

    return { position: this.position, velocity: this.velocity, atRest: this.atRest };
  }

  isAtRest() {
    return this.atRest;
  }
}

// Mock the SpringPhysics class using spyOn
jest.spyOn(springPhysics, 'SpringPhysics').mockImplementation((config) => {
  return new MockSpringPhysics(config) as any; // Use 'as any' if types mismatch
});

// Mock SpringPresets
const mockSpringPresets = {
  DEFAULT: { tension: 170, friction: 26, mass: 1 },
  GENTLE: { tension: 120, friction: 14, mass: 1 },
  WOBBLY: { tension: 180, friction: 12, mass: 1 },
  STIFF: { tension: 210, friction: 20, mass: 1 },
  SLOW: { tension: 40, friction: 18, mass: 1 },
  RESPONSIVE: { tension: 250, friction: 22, mass: 1 },
  NOTIFICATION_SLIDE: { tension: 220, friction: 26, mass: 1 },
};

// Mock the module factory *outside* describe/beforeEach
// This ensures the module structure is mocked correctly before tests run
jest.mock('../../animations/physics/springPhysics', () => ({
  ...jest.requireActual('../../animations/physics/springPhysics'),
  SpringPresets: mockSpringPresets, // Use defined mock presets
  // Use jest.fn() as a placeholder, will be implemented in beforeEach
  SpringPhysics: jest.fn(), 
}));

// Mock the AnimationContext
jest.mock('../../contexts/AnimationContext', () => ({
  useAnimationContext: jest.fn(() => ({
    defaultSpring: 'DEFAULT'
  }))
}));

// Mock the reduced motion hook
jest.mock('../useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

// Mock the performance timing
const mockTime = {
  current: 0
};

// Mock requestAnimationFrame
const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;

describe('useGalileoStateSpring', () => {
  // Reference to the mocked class constructor
  let MockSpringPhysicsClass: jest.MockInstance<any, any>;

  beforeEach(() => {
    // Clear module cache if necessary (might not be needed if mock factory is outside)
    // jest.resetModules(); 
    
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Re-implement the SpringPhysics mock for this test run
    // This assigns the implementation to the jest.fn() placeholder defined above
    MockSpringPhysicsClass = (springPhysics.SpringPhysics as jest.Mock).mockImplementation(
        (config) => new MockSpringPhysics(config)
    );
  });

  test('should initialize with target value', () => {
    // Use the imported hook directly
    const { result } = renderHook(() => useGalileoStateSpring(100));
    expect(result.current.value).toBe(100);
    expect(result.current.isAnimating).toBe(false);
  });

  test('should use default spring preset if none provided', () => {
      // Use the imported hook directly
      const { result } = renderHook(() => useGalileoStateSpring(0));
      expect(result.current.value).toBe(0); 
      
      // Verify constructor call using the mock reference from beforeEach
      expect(MockSpringPhysicsClass).toHaveBeenCalledWith(expect.objectContaining(mockSpringPresets.DEFAULT));
  });

  // Add tests for start, stop, reset, onRest callback, immediate option, etc.
}); 