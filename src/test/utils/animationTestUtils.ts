/**
 * Animation Test Utilities
 * 
 * Provides consistent utilities for testing animation and physics hooks
 * that depend on RAF, timers, and React state updates.
 */

import { act } from '@testing-library/react';

/**
 * Mock RAF implementation and utilities
 */
interface AnimationTestController {
  /**
   * Advance animation time by the specified amount
   * @param ms Milliseconds to advance
   */
  advanceTime: (ms: number) => void;
  
  /**
   * Advance a single animation frame with the specified time increment
   * @param timeIncrement Time increment in ms (default: 16.66ms - ~60fps)
   */
  advanceFrame: (timeIncrement?: number) => void;
  
  /**
   * Advance multiple animation frames
   * @param frames Number of frames to advance
   * @param timeIncrement Time increment per frame in ms
   */
  advanceFrames: (frames: number, timeIncrement?: number) => void;
  
  /**
   * Advance frames and flush microtasks/timers in one operation
   * @param frames Number of frames to advance
   * @param timeIncrement Time increment per frame in ms
   */
  advanceFramesAndTimers: (frames: number, timeIncrement?: number) => void;
  
  /**
   * Run all pending animation frames
   */
  flushAnimationFrames: () => void;
  
  /**
   * Clean up mock and restore original implementations
   */
  cleanup: () => void;
  
  /**
   * Current mock time
   */
  currentTime: number;
  
  /**
   * Set current time to specific value
   * @param time Time to set in ms
   */
  setCurrentTime: (time: number) => void;

  /**
   * Sync animation frame with React state updates
   * Ensures that animation frame callbacks complete before React state updates
   */
  syncFrameWithStateUpdates: () => Promise<void>;

  /**
   * Simulate a frame drop to test resilience
   * @param count Number of frames to drop
   */
  simulateFrameDrop: (count?: number) => void;

  /**
   * Create a timing-consistent test environment
   * @param setupFn Function to run for test setup
   */
  withConsistentTiming: <T>(setupFn: () => T) => T;
}

/**
 * Save original methods
 */
const originalRAF = window.requestAnimationFrame;
const originalCAF = window.cancelAnimationFrame;
const originalPerformanceNow = performance.now;

/**
 * Setup animation test environment
 * 
 * This function sets up a controlled environment for testing animations by:
 * - Mocking requestAnimationFrame and cancelAnimationFrame
 * - Mocking performance.now for consistent timing
 * - Providing utilities to advance frames and time
 * 
 * @returns Controller object with utility functions
 */
export function setupAnimationTestEnvironment(): AnimationTestController {
  // State for tracking RAF callbacks and time
  let rafCallbacks = new Map<number, FrameRequestCallback>();
  let nextRAFId = 1;
  let mockTime = 0;
  let droppedFrames = 0;
  
  // Mock RAF implementation
  window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback): number => {
    const id = nextRAFId++;
    
    // Simulate frame dropping if enabled
    if (droppedFrames > 0) {
      droppedFrames--;
      return id; // Don't register the callback to simulate a dropped frame
    }
    
    rafCallbacks.set(id, callback);
    return id;
  });
  
  window.cancelAnimationFrame = jest.fn((id: number) => {
    rafCallbacks.delete(id);
  });
  
  // Mock performance.now
  performance.now = jest.fn(() => mockTime);
  
  // Helper to advance a single frame
  const advanceFrame = (timeIncrement = 16.66) => {
    mockTime += timeIncrement;
    const callbacks = Array.from(rafCallbacks.entries());
    // Clear callbacks before running to prevent infinite loops
    rafCallbacks = new Map();
    // Run callbacks with updated time
    callbacks.forEach(([id, callback]) => {
      try {
        callback(mockTime);
      } catch (error) {
        console.error('Error in animation frame callback:', error);
      }
    });
  };
  
  // Helper to advance multiple frames
  const advanceFrames = (frames: number, timeIncrement = 16.66) => {
    for (let i = 0; i < frames; i++) {
      advanceFrame(timeIncrement);
    }
  };
  
  // Helper to advance time by a specific amount
  const advanceTime = (ms: number) => {
    const framesEstimate = Math.ceil(ms / 16.66);
    const timePerFrame = ms / framesEstimate;
    advanceFrames(framesEstimate, timePerFrame);
  };
  
  // Helper that combines frame advancement with timer flushing for React state updates
  const advanceFramesAndTimers = (frames: number, timeIncrement = 16.66) => {
    act(() => {
      for (let i = 0; i < frames; i++) {
        mockTime += timeIncrement;
        const callbacks = Array.from(rafCallbacks.entries());
        // Clear before executing to prevent infinite loops with nested rAFs
        const currentCallbacks = new Map(callbacks);
        callbacks.forEach(([id, _]) => rafCallbacks.delete(id));
        
        // Run each callback
        currentCallbacks.forEach(callback => {
          try {
            callback(mockTime);
          } catch (error) {
            console.error('Error in animation frame callback:', error);
          }
        });
        
        // Flush any microtasks or short timers 
        jest.advanceTimersByTime(0);
      }
    });
  };
  
  // Helper to flush all pending animation frames
  const flushAnimationFrames = () => {
    let callbacks;
    while ((callbacks = Array.from(rafCallbacks.entries())).length > 0) {
      mockTime += 16.66; // Standard frame time
      // Clear callbacks before running to prevent infinite loops
      rafCallbacks = new Map();
      // Run callbacks with updated time
      callbacks.forEach(([id, callback]) => {
        try {
          callback(mockTime);
        } catch (error) {
          console.error('Error in animation frame callback:', error);
        }
      });
    }
  };
  
  // Helper to sync animation frames with React state updates
  const syncFrameWithStateUpdates = async () => {
    // First run all animation frames
    flushAnimationFrames();
    
    // Then allow React state updates to process
    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(0);
    });
  };
  
  // Simulate dropped frames
  const simulateFrameDrop = (count = 1) => {
    droppedFrames = count;
  };

  // Create a consistent timing environment for tests
  const withConsistentTiming = <T>(setupFn: () => T): T => {
    // Force a consistent starting time
    mockTime = 1000; // Start at a non-zero time
    
    // Run the setup function
    const result = setupFn();
    
    // Ensure all pending frames are processed
    flushAnimationFrames();
    
    return result;
  };
  
  // Helper to clean up mocks
  const cleanup = () => {
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
    performance.now = originalPerformanceNow;
    rafCallbacks.clear();
    nextRAFId = 1;
  };
  
  return {
    advanceTime,
    advanceFrame,
    advanceFrames,
    advanceFramesAndTimers,
    flushAnimationFrames,
    syncFrameWithStateUpdates,
    simulateFrameDrop,
    withConsistentTiming,
    cleanup,
    get currentTime() { return mockTime; },
    setCurrentTime: (time: number) => { mockTime = time; }
  };
}

/**
 * Component test utility that helps test hooks with
 * animation frame and timer dependencies
 * 
 * @example
 * test('animation hook works', async () => {
 *   await testWithAnimationControl(async (animationControl) => {
 *     // Render your hook or component
 *     const { result } = renderHook(() => useAnimationHook());
 *     
 *     // Start an animation
 *     act(() => { result.current.start(); });
 *     
 *     // Advance animation frames
 *     animationControl.advanceFramesAndTimers(10);
 *     
 *     // Check if animation progressed
 *     expect(result.current.progress).toBeGreaterThan(0);
 *   });
 * });
 */
export async function testWithAnimationControl(
  testFn: (controller: AnimationTestController) => Promise<void> | void
): Promise<void> {
  // Setup test environment with fake timers
  jest.useFakeTimers();
  const controller = setupAnimationTestEnvironment();
  
  try {
    // Run the test function
    await testFn(controller);
  } finally {
    // Clean up
    controller.cleanup();
    jest.useRealTimers();
  }
}

/**
 * Wait safely for a condition to be true, with timeout
 * Works in both fake and real timer environments
 */
export async function waitSafelyFor(
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();
  
  // Helper to wait with setTimeout
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Detect if fake timers are active by trying to get the current implementation
  const usingFakeTimers = () => {
    try {
      // Check if setTimeout is mocked
      return (setTimeout as any)._isMockFunction === true;
    } catch {
      return false;
    }
  };
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    
    // Wait using either fake or real timers
    if (usingFakeTimers()) {
      jest.advanceTimersByTime(interval);
      // Allow any immediate state updates to process
      await Promise.resolve();
    } else {
      await wait(interval);
    }
  }
}

/**
 * Creates a mock animation controller with consistent behavior
 * for animations that rely on controller callbacks
 */
export function createMockAnimationController() {
  // Store callbacks for manual triggering in tests
  const mockCallbacks: Record<string, Function[]> = {};

  const mockController = {
    play: jest.fn(() => {
      // Immediately call any registered sequence-start callbacks
      const startCallbacks = mockCallbacks['start'] || [];
      startCallbacks.forEach(callback => callback());
      
      // Return resolved promise for chaining
      return Promise.resolve();
    }),
    pause: jest.fn(),
    resume: jest.fn(),
    cancel: jest.fn(() => {
      // Trigger cancel callbacks
      const cancelCallbacks = mockCallbacks['cancel'] || [];
      cancelCallbacks.forEach(callback => callback());
      return Promise.resolve();
    }),
    complete: jest.fn(() => {
      // Trigger complete callbacks
      const completeCallbacks = mockCallbacks['complete'] || [];
      completeCallbacks.forEach(callback => callback());
      return Promise.resolve(); 
    }),
    reset: jest.fn(),
    addCallback: jest.fn((event, callback) => {
      // Store the callback to be called manually in tests
      if (!mockCallbacks[event]) {
        mockCallbacks[event] = [];
      }
      mockCallbacks[event].push(callback);
      return () => {
        mockCallbacks[event] = mockCallbacks[event].filter(cb => cb !== callback);
      };
    }),
    removeCallback: jest.fn(),
    getState: jest.fn(() => 'idle'),
    setPlaybackRate: jest.fn(),
    
    // Helper to manually trigger callbacks
    triggerCallback: (event: string, ...args: any[]) => {
      const callbacks = mockCallbacks[event] || [];
      callbacks.forEach(callback => callback(...args));
    },
    
    // Helper to reset all callbacks
    resetCallbacks: () => {
      Object.keys(mockCallbacks).forEach(key => {
        delete mockCallbacks[key];
      });
    }
  };

  return mockController;
}

export default {
  setupAnimationTestEnvironment,
  testWithAnimationControl,
  waitSafelyFor,
  createMockAnimationController
}; 