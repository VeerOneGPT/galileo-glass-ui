/**
 * Jest Setup Configuration
 * 
 * This file runs before each test file and sets up the testing environment
 */

// Add custom Jest matchers
import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react'; // Needed for the styled-components mock

// Remove the global styled-components mock
// // --- Add Global Styled Components Mock ---
// jest.mock('styled-components', () => {
//   const React = require('react'); // Require React inside the mock
//   return {
//     // ... mock details ...
//   }
// });
// // --- End Global Styled Components Mock ---

// Mock Animation Frame API
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

// Assign mock directly to window for JSDOM environment
window.requestAnimationFrame = jest.fn((cb: FrameRequestCallback): number => {
  const id = ++rafId;
  rafCallbacks.set(id, cb);
  // Return the ID, but don't automatically schedule/run the callback
  return id;
});
window.cancelAnimationFrame = jest.fn((handle: number) => {
  rafCallbacks.delete(handle);
});

// Also assign to global for broader compatibility if needed, although window should suffice for jsdom
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;

// Helper function to manually run RAF callbacks (can be imported in tests)
// Renamed to avoid conflict with potential testing-library functions
export const runAllRafs = (timestamp?: number) => {
  const time = timestamp ?? performance.now();
  const callbacksToRun = Array.from(rafCallbacks.values());
  rafCallbacks.clear(); // Clear before running to prevent infinite loops if a callback requests another frame
  callbacksToRun.forEach(cb => {
    try {
      cb(time);
    } catch (e) {
      console.error('Error running RAF callback:', e);
    }
  });
};

// Mock Performance API (based on test plan)
let mockTime = 0;
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => mockTime),
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  },
  writable: true,
});

// Set up extra DOM globals mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to false
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated but might be used
    removeListener: jest.fn(), // Deprecated but might be used
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn(() => []),
}));

// Mock MutationObserver (basic)
global.MutationObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => [])
}));

// Mock CSS.supports
Object.defineProperty(window, 'CSS', {
  value: {
    ...window.CSS, // Preserve existing CSS object properties if any
    supports: jest.fn((property, value) => {
      // Basic mock: return true for common cases, false otherwise
      // You might need to refine this based on specific features used
      if (property === 'backdrop-filter' || property === '-webkit-backdrop-filter') {
        return true; 
      }
      if (property === 'animation') {
        return true; // Assume animations are supported
      }
      // Add more specific checks if needed for your tests
      return false; 
    }),
  },
  writable: true,
  configurable: true, // Ensure it can be configured
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset time for performance mock
  mockTime = 0;
  // Clear any pending RAF callbacks and reset ID
  rafCallbacks.clear();
  rafId = 0;
  // Reset specific mocks if needed, e.g., matchMedia
  (window.matchMedia as jest.Mock).mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

// Optional: Add global afterEach for cleanup verification
afterEach(() => {
  // Example: Verify no pending timers or RAF callbacks are left
  // if (rafCallbacks.size > 0) {
  //   console.warn(`Warning: ${rafCallbacks.size} RAF callbacks left after test.`);
  //   rafCallbacks.clear();
  // }
}); 