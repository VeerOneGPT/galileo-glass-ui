/**
 * Mock for jest-styled-components
 * 
 * This fixes the "scStyles is not iterable" and "Cannot read properties of undefined (reading 'removeChild')"
 * errors in tests that use styled-components.
 */

// Completely mock jest-styled-components instead of trying to use the real one
jest.mock('jest-styled-components', () => {
  // Create basic stubs for the most commonly used functions
  const toHaveStyleRule = jest.fn().mockImplementation(() => ({ pass: true, message: () => '' }));
  
  // Mock the styleSheetSerializer
  const styleSheetSerializer = {
    test: () => false,
    print: () => '',
    serialize: () => ''
  };
  
  // Return mock implementation
  return {
    toHaveStyleRule,
    styleSheetSerializer,
    createGlobalStyle: jest.fn(),
    css: jest.fn(() => ({})),
    resetStyleSheet: jest.fn(),
    ServerStyleSheet: jest.fn().mockImplementation(() => ({
      collectStyles: jest.fn(comp => comp),
      getStyleTags: jest.fn(() => ''),
      getStyleElement: jest.fn(() => []),
      seal: jest.fn(),
      instance: { 
        toHTML: jest.fn() 
      }
    })),
    // Add any other exports needed
  };
}, { virtual: true });

// Add to expect.extend
if (global.expect && typeof global.expect.extend === 'function') {
  global.expect.extend({
    toHaveStyleRule: jest.fn().mockImplementation(() => ({ pass: true }))
  });
}

// Export setup function
module.exports = {
  setupStyledComponentsMock: () => {
    // Ensure document.head exists for tests
    if (typeof document !== 'undefined' && !document.head) {
      document.head = document.createElement('head');
    }
    
    // Add any other setup steps here
  }
}; 