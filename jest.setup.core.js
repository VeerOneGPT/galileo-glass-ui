// jest.setup.core.js
require('@testing-library/jest-dom');

// Mock window.matchMedia for tests needing it (e.g., Orchestrator)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to no match (e.g., no prefers-reduced-motion)
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 