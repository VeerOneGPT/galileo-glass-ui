/**
 * Animation Testing Utilities
 * 
 * Provides utilities for testing animation-related functionality
 */
import { advanceTime, resetTime } from '../mocks/performance';

/**
 * Simulates a requestAnimationFrame cycle
 * @param deltaMs Time delta in milliseconds (default: 16.667ms which is ~60fps)
 */
export const runAnimationFrame = (deltaMs = 16.667): void => {
  // Advance mock timer
  advanceTime(deltaMs);
  
  // If jest timers are being used, also advance those
  if (jest.isMockFunction(setTimeout)) {
    jest.advanceTimersByTime(deltaMs);
  }
  
  // Simulate a real requestAnimationFrame call
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    const callbacks: FrameRequestCallback[] = [];
    const original = window.requestAnimationFrame;
    
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      callbacks.push(cb);
      return 0;
    });
    
    // Execute callbacks
    callbacks.forEach(cb => cb(performance.now()));
    
    // Restore original implementation
    (window.requestAnimationFrame as jest.Mock).mockRestore();
  }
};

/**
 * Runs multiple animation frames in sequence
 * @param frameCount Number of frames to run
 * @param frameDelta Time between frames in ms
 */
export const runAnimationFrames = (frameCount: number, frameDelta = 16.667): void => {
  for (let i = 0; i < frameCount; i++) {
    runAnimationFrame(frameDelta);
  }
};

/**
 * Sets up animation test environment with beforeEach cleanup
 */
export const setupAnimationTest = () => {
  beforeEach(() => {
    resetTime();
    jest.clearAllMocks();
  });
  
  return { 
    runAnimationFrame,
    runAnimationFrames
  };
}; 