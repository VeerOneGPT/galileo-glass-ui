/**
 * Tests for useAnimationInterpolator hook
 */

import React, { useRef } from 'react';
import { renderHook, act, waitFor , render, screen } from '@testing-library/react';
import { useAnimationInterpolator } from '../useAnimationInterpolator';
import { AnimationState } from '../../animations/orchestration/AnimationStateMachine';
import { BlendMode } from '../../animations/orchestration/AnimationInterpolator';

// Mock requestAnimationFrame with proper typing
global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(performance.now()), 0) as unknown as number;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  clearTimeout(id);
});

// Mock performance.now
const originalPerformanceNow = performance.now;
let mockTime = 0;
global.performance.now = jest.fn(() => mockTime);

// Simple component for testing
const TestComponent = ({ initialState, targetState }: { 
  initialState: AnimationState;
  targetState: AnimationState;
}) => {
  // Create a ref with a more specific type compatible with HTMLDivElement
  const divRef = useRef<HTMLDivElement>(null);
  const { ref, transitionTo, progress } = useAnimationInterpolator(initialState, {
    defaultTransition: { duration: 100 },
    immediate: true
  });

  // Combine the refs
  const combinedRef = (el: HTMLDivElement) => {
    // @ts-ignore - This is a workaround for the ref incompatibility
    ref(el);
    divRef.current = el;
  };
  
  React.useEffect(() => {
    if (targetState) {
      transitionTo(targetState);
    }
  }, [targetState, transitionTo]);
  
  return (
    <div data-testid="test-element" ref={combinedRef}>
      Progress: {progress.toFixed(2)}
    </div>
  );
};

describe('useAnimationInterpolator', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
    jest.useFakeTimers();
  });
  
  // Restore performance.now after tests
  afterAll(() => {
    performance.now = originalPerformanceNow;
    jest.useRealTimers();
  });
  
  // Example to replace waitForNextUpdate
  const sleep = async (ms = 0) => {
    await act(async () => {
      jest.advanceTimersByTime(ms);
      await Promise.resolve();
    });
  };
  
  it('should initialize with initial state', () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px',
        backgroundColor: 'red'
      }
    };
    
    const { result } = renderHook(() => useAnimationInterpolator(initialState, { immediate: true }));
    
    expect(result.current.getCurrentState()).toBe(initialState);
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.progress).toBe(0);
  });
  
  it('should transition to a new state', async () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px',
        backgroundColor: 'red'
      }
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px',
        backgroundColor: 'blue'
      }
    };
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true 
      })
    );
    
    // Start transition
    act(() => {
      result.current.transitionTo(targetState);
    });
    
    // Should now be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Move time forward to 50% of the animation
    act(() => {
      mockTime = 50;
      jest.advanceTimersByTime(50);
    });
    
    // Wait for the next frame
    await sleep();
    
    // Should be at approximately 50% progress
    expect(result.current.progress).toBeGreaterThan(0);
    
    // Move time forward to complete the animation
    act(() => {
      mockTime = 150;
      jest.advanceTimersByTime(150);
    });
    
    // Wait for the next frame
    await sleep();
    
    // Animation should be complete
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.getCurrentState()).toBe(targetState);
  });
  
  it('should pause and resume transitions', async () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px'
      }
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px'
      }
    };
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true 
      })
    );
    
    // Start transition
    act(() => {
      result.current.transitionTo(targetState);
    });
    
    // Should now be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Move time forward to 50% of the animation
    act(() => {
      mockTime = 50;
      jest.advanceTimersByTime(50);
    });
    
    // Wait for the next frame
    await sleep();
    
    // Pause the animation
    act(() => {
      result.current.pause();
    });
    
    // Should no longer be transitioning
    expect(result.current.isTransitioning).toBe(false);
    
    // Store the progress value at pause time
    const pausedProgress = result.current.progress;
    
    // Move time forward but animation should remain paused
    act(() => {
      mockTime = 150;
      jest.advanceTimersByTime(100);
    });
    
    // Progress should not have changed
    expect(result.current.progress).toBe(pausedProgress);
    
    // Resume the animation
    act(() => {
      mockTime = 150;
      result.current.resume();
    });
    
    // Should be transitioning again
    expect(result.current.isTransitioning).toBe(true);
    
    // Move time forward to complete the animation
    act(() => {
      mockTime = 200;
      jest.advanceTimersByTime(50);
    });
    
    // Wait for the next frame
    await sleep();
    
    // Animation should be complete
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.getCurrentState()).toBe(targetState);
  });
  
  it('should cancel transitions', async () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px'
      }
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px'
      }
    };
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true 
      })
    );
    
    // Start transition
    act(() => {
      result.current.transitionTo(targetState);
    });
    
    // Should now be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Move time forward to 50% of the animation
    act(() => {
      mockTime = 50;
      jest.advanceTimersByTime(50);
    });
    
    // Wait for the next frame
    await sleep();
    
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
  
  it('should handle transition callbacks', async () => {
    const initialState: AnimationState = {
      id: 'initial',
      name: 'Initial',
      styles: {
        width: '100px'
      }
    };
    
    const targetState: AnimationState = {
      id: 'target',
      name: 'Target',
      styles: {
        width: '200px'
      }
    };
    
    const onStart = jest.fn();
    const onUpdate = jest.fn();
    const onComplete = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationInterpolator(initialState, { 
        defaultTransition: { duration: 100 },
        immediate: true 
      })
    );
    
    // Start transition with callbacks
    act(() => {
      result.current.transitionTo(targetState, {
        onStart,
        onUpdate,
        onComplete
      });
    });
    
    // onStart should have been called
    expect(onStart).toHaveBeenCalledTimes(1);
    
    // Move time forward to 50% of the animation
    act(() => {
      mockTime = 50;
      jest.advanceTimersByTime(50);
    });
    
    // Wait for the next frame
    await sleep();
    
    // onUpdate should have been called
    expect(onUpdate).toHaveBeenCalled();
    
    // Move time forward to complete the animation
    act(() => {
      mockTime = 150;
      jest.advanceTimersByTime(100);
    });
    
    // Wait for the next frame
    await sleep();
    
    // onComplete should have been called
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});