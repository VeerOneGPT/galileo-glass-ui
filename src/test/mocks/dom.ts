/**
 * DOM Mocks
 * 
 * Provides mock implementations of DOM elements and events for testing
 */

interface MockElementAttributes {
  [key: string]: any;
  rect?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width?: number;
    height?: number;
  };
}

interface MockElement {
  getBoundingClientRect: jest.Mock;
  style: Record<string, any>;
  getAttribute: jest.Mock;
  setAttribute: jest.Mock;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  listeners: Record<string, Function[]>;
  [key: string]: any;
}

interface MockDocument {
  listeners: Record<string, Function[]>;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  body: MockElement;
  createElement: jest.Mock;
  [key: string]: any;
}

/**
 * Creates a mock DOM element for testing
 */
export const createMockElement = (attrs: MockElementAttributes = {}): MockElement => {
  const element: MockElement = {
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      ...attrs.rect
    })),
    style: {},
    getAttribute: jest.fn(name => attrs[name] || null),
    setAttribute: jest.fn((name, value) => {
      attrs[name] = value;
    }),
    addEventListener: jest.fn((event, handler) => {
      if (!element.listeners[event]) element.listeners[event] = [];
      element.listeners[event].push(handler);
    }),
    removeEventListener: jest.fn((event, handler) => {
      if (!element.listeners[event]) return;
      element.listeners[event] = element.listeners[event].filter(h => h !== handler);
    }),
    listeners: {},
    ...attrs
  };
  
  return element;
};

/**
 * Creates a mock document object for testing
 */
export const createMockDocument = (): MockDocument => {
  const doc: MockDocument = {
    listeners: {},
    addEventListener: jest.fn(function(this: MockDocument, event, handler) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(handler);
    }),
    removeEventListener: jest.fn(function(this: MockDocument, event, handler) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }),
    body: createMockElement({ nodeName: 'BODY' }),
    createElement: jest.fn(tagName => createMockElement({ nodeName: tagName.toUpperCase() }))
  };
  
  return doc;
};

/**
 * Provides utility functions for simulating DOM events
 */
export const mockDOMEvents = () => {
  return {
    simulateEvent: (element: MockElement, eventName: string, eventData: Record<string, any> = {}) => {
      const handlers = element.listeners[eventName] || [];
      const event = { 
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element,
        ...eventData
      };
      
      handlers.forEach(handler => handler(event));
      return event;
    }
  };
}; 