/**
 * Timing Provider Test Utilities
 * 
 * Provides utilities for testing the timing provider in the new animation architecture.
 * These utilities help test animation timing without relying on actual requestAnimationFrame.
 */

import { act } from '@testing-library/react';

/**
 * Callback for animation frame
 */
type TimingCallback = (time: number) => void;

/**
 * Represents a scheduled callback
 */
interface ScheduledCallback {
  id: number;
  callback: TimingCallback;
  startTime: number;
  options?: {
    duration?: number;
    iterations?: number;
    delay?: number;
  };
}

/**
 * Mock timing provider interface
 */
export interface MockTimingProvider {
  /**
   * Current time in milliseconds
   */
  currentTime: number;
  
  /**
   * Schedule a callback to run on the next animation frame
   */
  requestAnimationFrame: (callback: TimingCallback) => number;
  
  /**
   * Cancel a previously scheduled callback
   */
  cancelAnimationFrame: (id: number) => void;
  
  /**
   * Schedule a callback to run at a specific time or after a delay
   */
  setTimeout: (callback: () => void, delay: number) => number;
  
  /**
   * Cancel a previously scheduled timeout
   */
  clearTimeout: (id: number | undefined) => void;
  
  /**
   * Schedule a recurring callback
   */
  setInterval: (callback: () => void, delay: number) => number;
  
  /**
   * Cancel a previously scheduled interval
   */
  clearInterval: (id: number | undefined) => void;
  
  /**
   * Advance time by a specific amount
   * @param ms Milliseconds to advance
   */
  advanceTime: (ms: number) => void;
  
  /**
   * Advance a single animation frame
   * @param timeIncrement How much time to advance (default: 16.66ms for 60fps)
   */
  advanceFrame: (timeIncrement?: number) => void;
  
  /**
   * Advance multiple animation frames
   * @param frames Number of frames to advance
   * @param timeIncrement Time increment per frame
   */
  advanceFrames: (frames: number, timeIncrement?: number) => void;
  
  /**
   * Run all pending callbacks up to a specific time
   * @param targetTime The target time to advance to
   */
  runPendingCallbacks: (targetTime?: number) => void;
  
  /**
   * Clean up and restore original timing functions
   */
  cleanup: () => void;
  
  /**
   * Get all currently scheduled callbacks
   */
  getScheduledCallbacks: () => ScheduledCallback[];
  
  /**
   * Simulate a callback error to test error handling
   * @param id The ID of the callback to inject an error into
   * @param error The error to throw
   */
  injectCallbackError: (id: number, error: Error) => void;
}

/**
 * Create a mock timing provider for testing
 * 
 * This provides a way to test animation timing without relying on the actual
 * browser timing APIs.
 */
export function createMockTimingProvider(): MockTimingProvider {
  // Store original methods
  const originalRAF = window.requestAnimationFrame;
  const originalCAF = window.cancelAnimationFrame;
  const originalSetTimeout = window.setTimeout;
  const originalClearTimeout = window.clearTimeout;
  const originalSetInterval = window.setInterval;
  const originalClearInterval = window.clearInterval;
  const originalPerformanceNow = performance.now;
  
  // Set up state
  let currentTime = 0;
  let nextCallbackId = 1;
  
  // Callbacks
  const scheduledCallbacks: Map<number, ScheduledCallback> = new Map();
  const timeouts: Map<number, { callback: () => void; time: number }> = new Map();
  const intervals: Map<number, { callback: () => void; delay: number; lastRun: number }> = new Map();
  
  // Error injection
  const errorInjections: Map<number, Error> = new Map();
  
  // Mock APIs
  const requestAnimationFrame = (callback: TimingCallback): number => {
    const id = nextCallbackId++;
    scheduledCallbacks.set(id, {
      id,
      callback,
      startTime: currentTime,
    });
    return id;
  };
  
  const cancelAnimationFrame = (id: number): void => {
    scheduledCallbacks.delete(id);
  };
  
  const setTimeout = (callback: () => void, delay: number): number => {
    const id = nextCallbackId++;
    timeouts.set(id, {
      callback,
      time: currentTime + delay,
    });
    return id;
  };
  
  const clearTimeout = (id: number | undefined): void => {
    if (id !== undefined) {
      timeouts.delete(id);
    }
  };
  
  const setInterval = (callback: () => void, delay: number): number => {
    const id = nextCallbackId++;
    intervals.set(id, {
      callback,
      delay,
      lastRun: currentTime,
    });
    return id;
  };
  
  const clearInterval = (id: number | undefined): void => {
    if (id !== undefined) {
      intervals.delete(id);
    }
  };
  
  // Install mocks
  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;
  window.setTimeout = setTimeout as any;
  window.clearTimeout = clearTimeout as any;
  window.setInterval = setInterval as any;
  window.clearInterval = clearInterval as any;
  performance.now = () => currentTime;
  
  // Advance time utilities
  const advanceTime = (ms: number) => {
    act(() => {
      const targetTime = currentTime + ms;
      runPendingCallbacks(targetTime);
      currentTime = targetTime;
    });
  };
  
  const advanceFrame = (timeIncrement = 16.66) => {
    advanceTime(timeIncrement);
  };
  
  const advanceFrames = (frames: number, timeIncrement = 16.66) => {
    for (let i = 0; i < frames; i++) {
      advanceFrame(timeIncrement);
    }
  };
  
  const runPendingCallbacks = (targetTime = currentTime + 10000) => {
    // Sort timeouts by execution time
    const sortedTimeouts = Array.from(timeouts.entries())
      .sort((a, b) => a[1].time - b[1].time);
    
    // Run RAF callbacks and timeouts in order until targetTime
    while (currentTime < targetTime) {
      // Calculate the time for the next event
      let nextEventTime = targetTime;
      
      // Check if there's a timeout before that
      if (sortedTimeouts.length > 0 && sortedTimeouts[0][1].time < nextEventTime) {
        nextEventTime = sortedTimeouts[0][1].time;
      }
      
      // Set time to the next event time
      currentTime = nextEventTime;
      
      // Run all timeouts that should execute at this time
      while (sortedTimeouts.length > 0 && sortedTimeouts[0][1].time <= currentTime) {
        const [timeoutId, { callback }] = sortedTimeouts.shift()!;
        timeouts.delete(timeoutId);
        try {
          callback();
        } catch (error) {
          console.error('Error in timeout callback:', error);
        }
      }
      
      // Run all RAF callbacks for this frame
      const currentCallbacks = Array.from(scheduledCallbacks.values());
      scheduledCallbacks.clear();
      
      currentCallbacks.forEach(({ id, callback }) => {
        if (errorInjections.has(id)) {
          const error = errorInjections.get(id)!;
          errorInjections.delete(id);
          throw error;
        }
        
        try {
          callback(currentTime);
        } catch (error) {
          console.error('Error in RAF callback:', error);
        }
      });
      
      // Run all intervals that should execute
      intervals.forEach((interval, id) => {
        if (currentTime - interval.lastRun >= interval.delay) {
          interval.lastRun = currentTime;
          try {
            interval.callback();
          } catch (error) {
            console.error('Error in interval callback:', error);
          }
        }
      });
      
      // If no more callbacks to run, we're done
      if (scheduledCallbacks.size === 0 && timeouts.size === 0) {
        break;
      }
    }
  };
  
  const cleanup = () => {
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
    window.setTimeout = originalSetTimeout;
    window.clearTimeout = originalClearTimeout;
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
    performance.now = originalPerformanceNow;
    
    scheduledCallbacks.clear();
    timeouts.clear();
    intervals.clear();
    errorInjections.clear();
  };
  
  const getScheduledCallbacks = () => {
    return Array.from(scheduledCallbacks.values());
  };
  
  const injectCallbackError = (id: number, error: Error) => {
    errorInjections.set(id, error);
  };
  
  return {
    get currentTime() { return currentTime; },
    requestAnimationFrame,
    cancelAnimationFrame,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    advanceTime,
    advanceFrame,
    advanceFrames,
    runPendingCallbacks,
    cleanup,
    getScheduledCallbacks,
    injectCallbackError,
  };
}

/**
 * Test with controlled timing
 * 
 * Helper function to test components that use the timing provider
 * 
 * @example
 * ```ts
 * test('animation completes correctly', async () => {
 *   await testWithControlledTiming(async (timingProvider) => {
 *     // Render component
 *     render(<YourComponent timingProvider={timingProvider} />);
 *     
 *     // Start animation
 *     await userEvent.click(screen.getByText('Start Animation'));
 *     
 *     // Advance 10 frames
 *     timingProvider.advanceFrames(10);
 *     
 *     // Verify component state
 *     expect(screen.getByTestId('progress').textContent).toBe('100%');
 *   });
 * });
 * ```
 */
export async function testWithControlledTiming(
  testFn: (timingProvider: MockTimingProvider) => Promise<void> | void
): Promise<void> {
  const timingProvider = createMockTimingProvider();
  
  try {
    await testFn(timingProvider);
  } finally {
    timingProvider.cleanup();
  }
}

export default {
  createMockTimingProvider,
  testWithControlledTiming,
}; 