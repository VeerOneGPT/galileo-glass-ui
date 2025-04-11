/**
 * Style Processing Test Utilities
 * 
 * Provides utilities for testing style processing in the new animation architecture.
 * These utilities help test style updates without relying on actual DOM operations.
 */

import { act } from '@testing-library/react';

interface StyleUpdate {
  selector: string;
  property: string;
  value: string;
  priority?: string;
}

interface StyleOperation {
  type: 'add' | 'remove' | 'update';
  update: StyleUpdate;
  timestamp: number;
}

interface MockStyleProcessor {
  /**
   * Track all style operations performed
   */
  operations: StyleOperation[];
  
  /**
   * Current style state for all elements
   */
  styles: Record<string, Record<string, string>>;
  
  /**
   * Apply a style to an element
   */
  applyStyle: (selector: string, property: string, value: string, priority?: string) => void;
  
  /**
   * Remove a style from an element
   */
  removeStyle: (selector: string, property: string) => void;
  
  /**
   * Get computed style for an element
   */
  getComputedStyle: (selector: string) => Record<string, string>;
  
  /**
   * Process all pending style updates
   */
  flushStyleUpdates: () => void;
  
  /**
   * Reset the mock style processor
   */
  reset: () => void;
  
  /**
   * Check if a selector has a style property
   */
  hasStyle: (selector: string, property: string) => boolean;
  
  /**
   * Check if a selector + property combo has a specific style value
   */
  hasStyleValue: (selector: string, property: string, expectedValue: string) => boolean;
}

/**
 * Create a mock style processor for testing
 * 
 * This provides a way to test style updates without relying on the DOM
 */
export function createMockStyleProcessor(): MockStyleProcessor {
  const operations: StyleOperation[] = [];
  const styles: Record<string, Record<string, string>> = {};
  const pendingOperations: StyleOperation[] = [];
  
  const applyStyle = (selector: string, property: string, value: string, priority?: string) => {
    pendingOperations.push({
      type: 'update',
      update: { selector, property, value, priority },
      timestamp: Date.now()
    });
  };
  
  const removeStyle = (selector: string, property: string) => {
    pendingOperations.push({
      type: 'remove',
      update: { selector, property, value: '' },
      timestamp: Date.now()
    });
  };
  
  const getComputedStyle = (selector: string): Record<string, string> => {
    return styles[selector] || {};
  };
  
  const flushStyleUpdates = () => {
    act(() => {
      pendingOperations.forEach(operation => {
        const { update } = operation;
        
        // Initialize selector if needed
        if (!styles[update.selector]) {
          styles[update.selector] = {};
        }
        
        if (operation.type === 'remove') {
          delete styles[update.selector][update.property];
        } else {
          styles[update.selector][update.property] = update.value;
        }
        
        operations.push(operation);
      });
      
      pendingOperations.length = 0;
    });
  };
  
  const reset = () => {
    operations.length = 0;
    Object.keys(styles).forEach(key => {
      delete styles[key];
    });
    pendingOperations.length = 0;
  };
  
  const hasStyle = (selector: string, property: string): boolean => {
    return !!(styles[selector] && styles[selector][property] !== undefined);
  };
  
  const hasStyleValue = (selector: string, property: string, expectedValue: string): boolean => {
    return hasStyle(selector, property) && styles[selector][property] === expectedValue;
  };
  
  return {
    operations,
    styles,
    applyStyle,
    removeStyle,
    getComputedStyle,
    flushStyleUpdates,
    reset,
    hasStyle,
    hasStyleValue
  };
}

/**
 * Create a mock style adapter for testing
 * 
 * This simulates the adapter pattern in the new architecture
 */
export function createMockStyleAdapter(styleProcessor = createMockStyleProcessor()) {
  return {
    apply: styleProcessor.applyStyle,
    remove: styleProcessor.removeStyle,
    getStyleProcessor: () => styleProcessor,
    flushUpdates: styleProcessor.flushStyleUpdates
  };
}

/**
 * Test with style processing
 * 
 * Helper function to test components that use the style adapter
 * 
 * @example
 * ```ts
 * test('component applies styles correctly', async () => {
 *   await testWithStyleProcessing(async (styleAdapter) => {
 *     // Render component
 *     render(<YourComponent styleAdapter={styleAdapter} />);
 *     
 *     // Trigger style updates
 *     await userEvent.click(screen.getByText('Update Style'));
 *     
 *     // Flush style updates
 *     styleAdapter.flushUpdates();
 *     
 *     // Check applied styles
 *     const processor = styleAdapter.getStyleProcessor();
 *     expect(processor.hasStyleValue('.my-element', 'opacity', '1')).toBe(true);
 *   });
 * });
 */
export async function testWithStyleProcessing(
  testFn: (styleAdapter: ReturnType<typeof createMockStyleAdapter>) => Promise<void> | void
): Promise<void> {
  const styleProcessor = createMockStyleProcessor();
  const styleAdapter = createMockStyleAdapter(styleProcessor);
  
  try {
    await testFn(styleAdapter);
  } finally {
    styleProcessor.reset();
  }
}

/**
 * Create a visual snapshot of styles
 * 
 * Helper function to create a snapshot of all applied styles
 * Useful for visual regression testing
 */
export function createStyleSnapshot(styleProcessor: MockStyleProcessor): Record<string, Record<string, string>> {
  return JSON.parse(JSON.stringify(styleProcessor.styles));
}

export default {
  createMockStyleProcessor,
  createMockStyleAdapter,
  testWithStyleProcessing,
  createStyleSnapshot
}; 