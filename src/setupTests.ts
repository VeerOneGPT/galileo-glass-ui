// Setup file for Jest tests
import '@testing-library/jest-dom';
import 'jest-styled-components';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

// --- Mock document.querySelectorAll --- 
const mockElementForQuerySelector = { style: {} }; // Simple mock element
global.document.querySelectorAll = jest.fn((selector: string) => {
  // Return a few mock elements for common selectors used in tests
  if (selector.startsWith('.menu-element') || 
      selector.startsWith('.game-element') || 
      selector.startsWith('.settings-element') ||
      selector.startsWith('.help-element')) { 
    // Return objects mimicking NodeList behavior sufficiently for tests
    const mockNodeList = [mockElementForQuerySelector, mockElementForQuerySelector, mockElementForQuerySelector];
    (mockNodeList as any).item = (index: number) => mockNodeList[index];
    return mockNodeList as any;
  }
  const emptyNodeList: any[] = [];
  (emptyNodeList as any).item = (index: number) => undefined;
  return emptyNodeList as any; // Default empty NodeList-like array
});
global.document.querySelector = jest.fn().mockReturnValue(mockElementForQuerySelector);
// --- End Mock --- 

// Mock performance.now()
global.performance = {
  ...global.performance,
  now: jest.fn().mockReturnValue(Date.now()), // Use Date.now or a mock timer
};

// Mock ResizeObserver if needed globally (or keep in specific test files)
// global.ResizeObserver = jest.fn().mockImplementation(() => ({
//   observe: jest.fn(),
//   unobserve: jest.fn(),
//   disconnect: jest.fn(),
// }));
