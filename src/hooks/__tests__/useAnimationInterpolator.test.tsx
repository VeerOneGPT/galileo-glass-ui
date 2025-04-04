/**
 * Fixed tests for useAnimationInterpolator hook
 */

import React, { useRef } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAnimationInterpolator } from '../useAnimationInterpolator';
import { AnimationState } from '../../animations/orchestration/AnimationStateMachine';

// Mock AnimationInterpolator
jest.mock('../../animations/orchestration/AnimationInterpolator', () => {
  return {
    AnimationInterpolator: {
      createStateInterpolator: jest.fn((fromState, toState, config) => {
        // Return a simple mock interpolator function
        return jest.fn((progress) => {
          // Return a blend of from and to styles based on progress
          const result: Record<string, any> = {};
          
          // Blend styles
          const fromStyles = fromState.styles || {};
          const toStyles = toState.styles || {};
          
          // Combine all style keys
          const allStyleKeys = new Set([...Object.keys(fromStyles), ...Object.keys(toStyles)]);
          
          allStyleKeys.forEach(key => {
            // Simple linear interpolation for demo purposes
            if (key in fromStyles && key in toStyles) {
              // For simple numeric values
              if (key === 'width' || key === 'height') {
                const fromVal = parseInt(fromStyles[key], 10);
                const toVal = parseInt(toStyles[key], 10);
                result[key] = `${Math.round(fromVal + (toVal - fromVal) * progress)}px`;
              } else {
                // For other values, just switch at 50%
                result[key] = progress < 0.5 ? fromStyles[key] : toStyles[key];
              }
            } else if (key in fromStyles) {
              result[key] = fromStyles[key];
            } else if (key in toStyles) {
              result[key] = toStyles[key];
            }
          });
          
          return result;
        });
      }),
      applyInterpolatedState: jest.fn((target, state) => {
        // Mock applying styles to the target
        if (target && state) {
          Object.entries(state).forEach(([key, value]) => {
            if (target.style && typeof target.style.setProperty === 'function') {
              target.style.setProperty(key, value as string);
            }
          });
        }
      }),
    },
    BlendMode: {
      OVERRIDE: 'override',
      ADD: 'add',
      MULTIPLY: 'multiply',
    },
    InterpolationType: {
      NUMBER: 'number',
      COLOR: 'color',
      STRING: 'string',
      ARRAY: 'array',
      OBJECT: 'object',
      TRANSFORM: 'transform',
      PATH: 'path',
    },
  };
});

// Setup controlled mock timing
let mockTime = 0;

// Save original methods
const originalRAF = window.requestAnimationFrame;
const originalCAF = window.cancelAnimationFrame;
const originalPerformanceNow = performance.now;

describe('useAnimationInterpolator (Fixed)', () => {
  // Setup mocks before tests
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
    
    // Mock requestAnimationFrame to use setTimeout and controlled time
    window.requestAnimationFrame = jest.fn((callback) => {
      return setTimeout(() => {
        mockTime += 16; // Simulate ~60fps
        callback(mockTime);
      }, 0) as unknown as number;
    });
    
    // Mock cancelAnimationFrame
    window.cancelAnimationFrame = jest.fn((id) => {
      clearTimeout(id);
    });
    
    // Mock performance.now to return controlled time
    performance.now = jest.fn(() => mockTime);
    
    // Enable fake timers for setTimeout/clearTimeout control
    jest.useFakeTimers();
  });
  
  // Restore original methods after tests
  afterAll(() => {
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
    performance.now = originalPerformanceNow;
    jest.useRealTimers();
  });
  
  // Helper to advance animation frames
  const advanceAnimationFrames = (frames = 1) => {
    for (let i = 0; i < frames; i++) {
      act(() => {
        jest.runAllTimers(); // Run any pending timers including rAF callbacks
      });
    }
  };
  
  it('should initialize with initial state', () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px',
        backgroundColor: 'red',
      },
    };
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { immediate: true })
    );
    
    expect(result.current.getCurrentState()).toBe(initialState);
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.progress).toBe(0);
  });
  
  it('should transition to a new state', () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px',
        backgroundColor: 'red',
      },
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px',
        backgroundColor: 'blue',
      },
    };
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true,
      })
    );
    
    // Start transition
    act(() => {
      result.current.transitionTo(targetState);
    });
    
    // Should now be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Advance halfway (50ms at 16ms/frame ≈ 3 frames)
    mockTime = 50; // Set time manually to ensure exact 50% progress
    advanceAnimationFrames(3);
    
    // Should be at approximately 50% progress
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.progress).toBeLessThan(1);
    
    // Advance to completion (100ms total)
    mockTime = 150; // Set time to ensure we're past 100% progress
    advanceAnimationFrames(3);
    
    // Animation should be complete
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.progress).toBe(0); // Progress resets to 0 when complete
    expect(result.current.getCurrentState()).toBe(targetState);
  });
  
  it('should pause and resume transitions', () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px',
      },
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px',
      },
    };
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true,
      })
    );
    
    // Start transition
    act(() => {
      result.current.transitionTo(targetState);
    });
    
    // Should now be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Advance halfway (50ms)
    mockTime = 50;
    advanceAnimationFrames(3);
    
    // Pause the animation
    act(() => {
      result.current.pause();
    });
    
    // Should no longer be transitioning
    expect(result.current.isTransitioning).toBe(false);
    
    // Store the progress value at pause time
    const pausedProgress = result.current.progress;
    
    // Move time forward but animation should remain paused
    mockTime = 150;
    advanceAnimationFrames(3);
    
    // Progress should not have changed
    expect(result.current.progress).toBe(pausedProgress);
    
    // Resume the animation
    act(() => {
      result.current.resume();
    });
    
    // Should be transitioning again
    expect(result.current.isTransitioning).toBe(true);
    
    // Complete the animation
    mockTime = 200;
    advanceAnimationFrames(3);
    
    // Animation should be complete
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.progress).toBe(0); // Progress resets to 0 when complete
    expect(result.current.getCurrentState()).toBe(targetState);
  });
  
  it('should cancel transitions', () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px',
      },
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px',
      },
    };
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true,
      })
    );
    
    // Start transition
    act(() => {
      result.current.transitionTo(targetState);
    });
    
    // Should now be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Advance halfway (50ms)
    mockTime = 50;
    advanceAnimationFrames(3);
    
    // Cancel the animation
    act(() => {
      result.current.cancel();
    });
    
    // Should no longer be transitioning
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.progress).toBe(0);
    
    // Current state should still be initial
    expect(result.current.getCurrentState()).toBe(initialState);
  });
  
  it('should handle transition callbacks', () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px',
      },
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px',
      },
    };
    
    const onStart = jest.fn();
    const onUpdate = jest.fn();
    const onComplete = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true,
      })
    );
    
    // Start transition with callbacks
    act(() => {
      result.current.transitionTo(targetState, {
        onStart,
        onUpdate,
        onComplete,
      });
    });
    
    // onStart should have been called
    expect(onStart).toHaveBeenCalledTimes(1);
    
    // Advance halfway (50ms)
    mockTime = 50;
    advanceAnimationFrames(3);
    
    // onUpdate should have been called
    expect(onUpdate).toHaveBeenCalled();
    
    // Complete the animation
    mockTime = 150;
    advanceAnimationFrames(3);
    
    // onComplete should have been called
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
}); 