/**
 * Animation System Mocks
 * 
 * Provides mock implementations of the Galileo Animation System for testing
 */

/**
 * Mock animation preset class
 */
class MockAnimationPreset {
  name: string;
  keyframes: any;
  duration: string;
  easing: string;
  
  constructor(name: string) {
    this.name = name;
    this.keyframes = { 
      getName: () => name, 
      toString: () => name 
    };
    this.duration = '300ms';
    this.easing = 'linear';
  }
}

/**
 * Sets up animation system mocking in Jest
 */
export const mockAnimationSystem = () => {
  jest.mock('../../animations/core/types', () => {
    const actual = jest.requireActual('../../animations/core/types');
    
    return {
      ...actual,
      AnimationPreset: MockAnimationPreset
    };
  });
};

/**
 * Mocks requestAnimationFrame and related timing functions
 */
export const mockAnimationFrame = () => {
  // Store original implementations
  const originalRAF = global.requestAnimationFrame;
  const originalCAF = global.cancelAnimationFrame;
  
  // Setup frame management
  let frameId = 0;
  const frameCallbacks = new Map<number, FrameRequestCallback>();

  // Replace requestAnimationFrame
  global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback): number => {
    frameId++;
    frameCallbacks.set(frameId, callback);
    return frameId;
  });
  
  // Replace cancelAnimationFrame
  global.cancelAnimationFrame = jest.fn((id: number): void => {
    frameCallbacks.delete(id);
  });
  
  // Utility to trigger animation frames
  const triggerAnimationFrame = (time = performance.now()): void => {
    // Create a copy of the callbacks to avoid issues if new callbacks are added during execution
    const callbacks = Array.from(frameCallbacks.entries());
    
    // Clear the callbacks map before executing them
    frameCallbacks.clear();
    
    // Execute all callbacks
    callbacks.forEach(([id, callback]) => {
      callback(time);
    });
  };
  
  // Reset functions
  const reset = (): void => {
    frameCallbacks.clear();
    frameId = 0;
    (global.requestAnimationFrame as jest.Mock).mockClear();
    (global.cancelAnimationFrame as jest.Mock).mockClear();
  };
  
  // Restore original implementations
  const restore = (): void => {
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
  };
  
  // Setup cleanup for tests
  beforeEach(reset);
  afterAll(restore);
  
  // Return utility functions
  return {
    triggerAnimationFrame,
    reset,
    restore,
    getQueueLength: () => frameCallbacks.size
  };
}; 