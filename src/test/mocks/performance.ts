/**
 * Performance API Mock
 * 
 * Mocks the browser's performance API for deterministic testing
 */

let mockTime = 0;

// Mock the global performance object
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => mockTime),
    mark: jest.fn(),
    measure: jest.fn(),
  },
  writable: true
});

/**
 * Advances the mock timer by specified milliseconds
 */
export const advanceTime = (ms: number): number => {
  mockTime += ms;
  return mockTime;
};

/**
 * Resets the mock timer to zero
 */
export const resetTime = (): void => {
  mockTime = 0;
};

/**
 * Sets up performance mocking in a test suite
 */
export const mockPerformanceAPI = () => {
  beforeEach(() => {
    resetTime();
    (global.performance.now as jest.Mock).mockClear();
  });
  
  return { advanceTime, resetTime };
}; 