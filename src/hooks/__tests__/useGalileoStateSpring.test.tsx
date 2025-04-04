/**
 * Fixed tests for useGalileoStateSpring hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useGalileoStateSpring } from '../useGalileoStateSpring';

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

// Mock the springPhysics module
jest.mock('../../animations/physics/springPhysics', () => ({
  ...jest.requireActual('../../animations/physics/springPhysics'), // Keep actual implementations
  SpringPresets: mockSpringPresets, // Override SpringPresets with our mock
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

describe('useGalileoStateSpring (Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime.current = 0;
    
    // Mock requestAnimationFrame to advance our controlled time
    global.requestAnimationFrame = jest.fn((callback) => {
      const id = setTimeout(() => {
        mockTime.current += 16; // Simulate ~60fps frame
        callback(mockTime.current);
      }, 0);
      return id as unknown as number;
    });
    
    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = jest.fn((id) => {
      clearTimeout(id as unknown as NodeJS.Timeout);
    });

    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  afterAll(() => {
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
  });

  // Helper to advance animation frames
  const advanceAnimationFrames = (frames = 1) => {
    for (let i = 0; i < frames; i++) {
      act(() => {
        jest.runAllTimers();
      });
    }
  };

  it('should initialize with the target value', () => {
    const initialValue = 50;
    const { result } = renderHook(() => useGalileoStateSpring(initialValue));
    
    expect(result.current.value).toBe(initialValue);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should animate to a new target value', () => {
    const initialValue = 0;
    const newValue = 100;
    
    // Render with initial value
    const { result, rerender } = renderHook(
      (props) => useGalileoStateSpring(props.value),
      { initialProps: { value: initialValue } }
    );
    
    // Initial state check
    expect(result.current.value).toBe(initialValue);
    
    // Update to new value
    rerender({ value: newValue });
    
    // Should start animating
    expect(result.current.isAnimating).toBe(true);
    
    // Advance a few frames
    advanceAnimationFrames(5);
    
    // Value should be moving toward target
    expect(result.current.value).toBeGreaterThan(initialValue);
    expect(result.current.value).toBeLessThan(newValue);
    
    // Complete animation
    advanceAnimationFrames(20);
    
    // Should reach target and stop animating
    expect(result.current.value).toBe(newValue);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should use provided spring configuration', () => {
    const { result } = renderHook(() => 
      useGalileoStateSpring(0, { 
        tension: 500,
        friction: 50,
        mass: 2
      })
    );
    
    // Update to new value
    act(() => {
      result.current.start({ to: 100 });
    });
    
    // Should start animating
    expect(result.current.isAnimating).toBe(true);
    
    // Advance a few frames
    advanceAnimationFrames(5);
    
    // Animation should be in progress
    expect(result.current.value).toBeGreaterThan(0);
    
    // Complete animation
    advanceAnimationFrames(20);
    
    // Should reach target
    expect(result.current.value).toBe(100);
  });

  it('should skip animation when immediate is true', () => {
    const { result } = renderHook(() => 
      useGalileoStateSpring(0, { immediate: true })
    );
    
    // Update to new value
    act(() => {
      result.current.start({ to: 100 });
    });
    
    // Should immediately jump to target value without animating
    expect(result.current.value).toBe(100);
    expect(result.current.isAnimating).toBe(false);
    
    // No animation frames should be requested
    expect(global.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('should call onRest when animation completes', () => {
    const onRest = jest.fn();
    const { result } = renderHook(() => 
      useGalileoStateSpring(0, { onRest })
    );
    
    // Start animation
    act(() => {
      result.current.start({ to: 100 });
    });
    
    // Complete animation
    advanceAnimationFrames(30);
    
    // onRest should be called with final result
    expect(onRest).toHaveBeenCalledWith(
      expect.objectContaining({
        finished: true,
        value: 100
      })
    );
  });

  it('should stop animation when stop is called', () => {
    const { result } = renderHook(() => useGalileoStateSpring(0));
    
    // Start animation
    act(() => {
      result.current.start({ to: 100 });
    });
    
    // Advance a few frames
    advanceAnimationFrames(5);
    
    // Animation should be in progress
    expect(result.current.isAnimating).toBe(true);
    expect(result.current.value).toBeGreaterThan(0);
    expect(result.current.value).toBeLessThan(100);
    
    // Stop animation
    act(() => {
      result.current.stop();
    });
    
    // Should stop at current value
    expect(result.current.isAnimating).toBe(false);
    
    // Advancing frames shouldn't change value
    const valueAfterStop = result.current.value;
    advanceAnimationFrames(5);
    expect(result.current.value).toBe(valueAfterStop);
  });

  it('should reset to specified value when reset is called', () => {
    const { result } = renderHook(() => useGalileoStateSpring(0));
    
    // Start animation
    act(() => {
      result.current.start({ to: 100 });
    });
    
    // Advance a few frames
    advanceAnimationFrames(5);
    
    // Animation should be in progress
    expect(result.current.value).toBeGreaterThan(0);
    
    // Reset to specific value
    act(() => {
      result.current.reset(50);
    });
    
    // Should reset to specified value
    expect(result.current.value).toBe(50);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should handle velocity in start options', () => {
    const { result } = renderHook(() => useGalileoStateSpring(0));
    
    // Start with high initial velocity
    act(() => {
      result.current.start({ to: 100, velocity: 50 });
    });
    
    // Advance a few frames - with high velocity, should move quickly
    advanceAnimationFrames(3);
    
    // Should move faster than normal
    expect(result.current.value).toBeGreaterThan(20); // Arbitrary threshold
    
    // Complete animation
    advanceAnimationFrames(20);
    
    // Should still reach target
    expect(result.current.value).toBe(100);
  });
}); 