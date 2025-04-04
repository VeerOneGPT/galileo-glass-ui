/**
 * GestureDetector.fixed.test.ts
 * 
 * Self-contained tests for the GestureDetector class with improved
 * mocks and isolated state between tests to avoid test interference.
 */

import { 
  createGestureDetector, 
  GestureType, 
  GestureState, 
  GestureDirection,
  GestureEventData
} from '../GestureDetector';

// --- Improved Mock Implementations ---

// Minimal mock implementation with proper type support
class MockEventTarget {
  listeners: Record<string, Function[]> = {};
  
  addEventListener(type: string, listener: any) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }
  
  removeEventListener(type: string, listener: any) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }
  
  dispatchEvent(event: any) {
    const type = event.type;
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => listener(event));
    }
    return true;
  }
}

// Mock HTMLElement with style and getBoundingClientRect
class MockElement extends MockEventTarget {
  style: Record<string, any> = {};
  
  getBoundingClientRect() {
    return { 
      left: 0, 
      top: 0, 
      width: 100, 
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0
    };
  }
  
  setPointerCapture(pointerId: number) {
    // Mock implementation
  }
  
  releasePointerCapture(pointerId: number) {
    // Mock implementation
  }
}

// Create a fresh environment for each test to prevent state leakage
function createTestEnvironment() {
  // Fresh document and window mocks for each test
  const mockDocument = new MockEventTarget();
  const mockWindow = {
    setTimeout: jest.fn().mockImplementation((cb, delay) => {
      const id = setTimeout(() => {}, 0); // Create a real timeout ID
      // Store the callback for manual triggering
      timeoutCallbacks.set(id as unknown as number, cb);
      return id;
    }),
    clearTimeout: jest.fn().mockImplementation((id) => {
      timeoutCallbacks.delete(id as unknown as number);
      clearTimeout(id); // Clear the real timeout
    }),
  };
  
  // Store timeout callbacks for manual triggering
  const timeoutCallbacks = new Map<number, Function>();
  
  // Trigger a stored timeout callback
  const triggerTimeout = (id: number) => {
    const callback = timeoutCallbacks.get(id);
    if (callback) {
      callback();
      timeoutCallbacks.delete(id);
    }
  };
  
  // Set up globals for this test
  const originalDocument = global.document;
  const originalWindow = global.window;
  global.document = mockDocument as any;
  global.window = mockWindow as any;
  
  // Create a fresh element and detector for this test
  const element = new MockElement();
  
  return {
    document: mockDocument,
    window: mockWindow,
    element,
    timeoutCallbacks,
    triggerTimeout,
    cleanup: () => {
      global.document = originalDocument;
      global.window = originalWindow;
    }
  };
}

// --- Helper Functions for Event Simulation ---

// Helper to simulate mouse events
function simulateMouseEvent(target: MockEventTarget, type: string, options: any = {}) {
  const event = {
    type,
    clientX: options.clientX ?? 100,
    clientY: options.clientY ?? 100,
    button: options.button ?? 0,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: options.target ?? target,
    ...options
  };
  
  if (type.startsWith('mouse')) {
    if (type === 'mousedown' || type === 'mouseover' || type === 'mouseout') {
      target.dispatchEvent(event);
    } else {
      // For mousemove and mouseup, dispatch to document
      (global.document as any).dispatchEvent(event);
    }
  }
  
  return event;
}

// Helper to simulate touch events with proper structure
function simulateTouchEvent(target: MockEventTarget, type: string, touchList: any[] = [], options: any = {}) {
  const touches = touchList.map((touch, index) => ({
    identifier: touch.identifier ?? index,
    clientX: touch.clientX ?? 100,
    clientY: touch.clientY ?? 100,
    target: touch.target ?? target,
    ...touch
  }));
  
  const event = {
    type,
    touches: [...touches],
    changedTouches: [...touches],
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: options.target ?? target,
    ...options
  };
  
  if (type === 'touchstart') {
    target.dispatchEvent(event);
  } else {
    // For touchmove, touchend, and touchcancel, dispatch to document
    (global.document as any).dispatchEvent(event);
  }
  
  return event;
}

// Helper to simulate a complete tap with mouse
function simulateMouseTap(element: MockEventTarget, position = { x: 100, y: 100 }) {
  simulateMouseEvent(element, 'mousedown', { clientX: position.x, clientY: position.y });
  simulateMouseEvent(element, 'mouseup', { clientX: position.x, clientY: position.y });
}

// Helper to simulate a complete tap with touch
function simulateTouchTap(element: MockEventTarget, position = { x: 100, y: 100 }) {
  const touch = { clientX: position.x, clientY: position.y, identifier: 0 };
  simulateTouchEvent(element, 'touchstart', [touch]);
  simulateTouchEvent(element, 'touchend', [touch], { touches: [] });
}

// --- Tests ---

describe('GestureDetector (Fixed)', () => {
  // Use fake timers for all tests
  beforeAll(() => {
    jest.useFakeTimers();
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });
  
  describe('Event Subscription', () => {
    test('should attach event listeners when created', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          enableTouchEvents: true,
          enablePointerEvents: false
        });
        
        // Check element listeners
        expect(env.element.listeners['mousedown']).toBeDefined();
        expect(env.element.listeners['mouseover']).toBeDefined();
        expect(env.element.listeners['mouseout']).toBeDefined();
        expect(env.element.listeners['touchstart']).toBeDefined();
        
        // Check document listeners
        expect(env.document.listeners['mousemove']).toBeDefined();
        expect(env.document.listeners['mouseup']).toBeDefined();
        expect(env.document.listeners['touchmove']).toBeDefined();
        expect(env.document.listeners['touchend']).toBeDefined();
        expect(env.document.listeners['touchcancel']).toBeDefined();
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should remove event listeners when destroyed', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          enableTouchEvents: true,
          enablePointerEvents: false
        });
        
        // Destroy the detector
        gestureDetector.destroy();
        
        // Check element listeners are gone
        expect(env.element.listeners['mousedown'] || []).toHaveLength(0);
        expect(env.element.listeners['mouseover'] || []).toHaveLength(0);
        expect(env.element.listeners['mouseout'] || []).toHaveLength(0);
        expect(env.element.listeners['touchstart'] || []).toHaveLength(0);
        
        // Check document listeners are gone
        expect(env.document.listeners['mousemove'] || []).toHaveLength(0);
        expect(env.document.listeners['mouseup'] || []).toHaveLength(0);
        expect(env.document.listeners['touchmove'] || []).toHaveLength(0);
        expect(env.document.listeners['touchend'] || []).toHaveLength(0);
        expect(env.document.listeners['touchcancel'] || []).toHaveLength(0);
      } finally {
        env.cleanup();
      }
    });
  });
  
  describe('Gesture Handlers', () => {
    test('should register and call handlers', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.TAP, gestureHandler);
        
        // Simulate a tap
        simulateMouseTap(env.element);
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.TAP,
            state: GestureState.RECOGNIZED
          })
        );
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should remove handlers with off()', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.TAP, gestureHandler);
        
        // Remove the handler
        gestureDetector.off(GestureType.TAP, gestureHandler);
        
        // Simulate a tap
        simulateMouseTap(env.element);
        
        expect(gestureHandler).not.toHaveBeenCalled();
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should remove all handlers for a type with off(type)', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true
        });
        
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        
        gestureDetector.on(GestureType.TAP, handler1);
        gestureDetector.on(GestureType.TAP, handler2);
        
        // Remove all handlers for tap
        gestureDetector.off(GestureType.TAP);
        
        // Simulate a tap
        simulateMouseTap(env.element);
        
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
  });
  
  describe('Mouse Gestures', () => {
    test('should detect tap gesture with mouse events', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.TAP, gestureHandler);
        
        // Simulate a tap
        simulateMouseTap(env.element);
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.TAP,
            state: GestureState.RECOGNIZED
          })
        );
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should detect double tap with mouse events', () => {
      const env = createTestEnvironment();
      
      try {
        // Mock Date.now for consistent timing
        const originalNow = Date.now;
        const mockNow = jest.fn();
        let now = 1000;
        mockNow.mockImplementation(() => now);
        Date.now = mockNow;
        
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          doubleTapTimeThreshold: 300
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.DOUBLE_TAP, gestureHandler);
        
        // First tap
        simulateMouseTap(env.element);
        
        // Advance time a little
        now += 200;
        
        // Second tap
        simulateMouseTap(env.element);
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.DOUBLE_TAP,
            state: GestureState.RECOGNIZED
          })
        );
        
        gestureDetector.destroy();
        Date.now = originalNow;
      } finally {
        env.cleanup();
      }
    });
    
    test('should detect long press with mouse events', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          longPressTimeThreshold: 500
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.LONG_PRESS, gestureHandler);
        
        // Start mouse down
        simulateMouseEvent(env.element, 'mousedown');
        
        // Get the last timeout ID
        const timeoutIds = Array.from(env.timeoutCallbacks.keys());
        const longPressTimeoutId = timeoutIds[timeoutIds.length - 1];
        
        // Trigger the long press timeout
        env.triggerTimeout(longPressTimeoutId);
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.LONG_PRESS,
            state: GestureState.RECOGNIZED
          })
        );
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should detect hover with mouse events', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.HOVER, gestureHandler);
        
        // Mouse over
        simulateMouseEvent(env.element, 'mouseover');
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.HOVER,
            state: GestureState.BEGAN
          })
        );
        
        // Reset the mock
        gestureHandler.mockClear();
        
        // Mouse out
        simulateMouseEvent(env.element, 'mouseout');
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.HOVER,
            state: GestureState.ENDED
          })
        );
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should detect pan and swipe with mouse events', () => {
      const env = createTestEnvironment();
      
      try {
        // Mock Date.now for consistent timing
        const originalNow = Date.now;
        const mockNow = jest.fn();
        let now = 1000;
        mockNow.mockImplementation(() => now);
        Date.now = mockNow;
        
        const gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          swipeVelocityThreshold: 0.5,
          swipeDistanceThreshold: 50
        });
        
        const panHandler = jest.fn();
        const swipeHandler = jest.fn();
        
        gestureDetector.on(GestureType.PAN, panHandler);
        gestureDetector.on(GestureType.SWIPE, swipeHandler);
        
        // Mouse down
        simulateMouseEvent(env.element, 'mousedown', { clientX: 100, clientY: 100 });
        
        // Pan should start
        expect(panHandler).toHaveBeenCalledTimes(1);
        expect(panHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PAN,
            state: GestureState.BEGAN
          })
        );
        
        // Reset the mock
        panHandler.mockClear();
        
        // Mouse move
        simulateMouseEvent(env.element, 'mousemove', { clientX: 150, clientY: 150 });
        
        // Pan should update
        expect(panHandler).toHaveBeenCalledTimes(1);
        expect(panHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PAN,
            state: GestureState.CHANGED
          })
        );
        
        // Reset the mock
        panHandler.mockClear();
        
        // Advance time for swipe velocity
        now += 50;
        
        // Fast move to create swipe velocity
        simulateMouseEvent(env.element, 'mousemove', { clientX: 200, clientY: 200 });
        
        // Reset the mock
        panHandler.mockClear();
        
        // Mouse up
        simulateMouseEvent(env.element, 'mouseup', { clientX: 200, clientY: 200 });
        
        // Pan should end
        expect(panHandler).toHaveBeenCalledTimes(1);
        expect(panHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PAN,
            state: GestureState.ENDED
          })
        );
        
        // Swipe should be detected
        expect(swipeHandler).toHaveBeenCalledTimes(1);
        expect(swipeHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.SWIPE,
            state: GestureState.RECOGNIZED
          })
        );
        
        gestureDetector.destroy();
        Date.now = originalNow;
      } finally {
        env.cleanup();
      }
    });
  });
  
  describe('Touch Gestures', () => {
    test('should detect tap gesture with touch events', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableTouchEvents: true
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.TAP, gestureHandler);
        
        // Simulate a touch tap
        simulateTouchTap(env.element);
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.TAP,
            state: GestureState.RECOGNIZED
          })
        );
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should detect pinch gesture with touch events', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableTouchEvents: true
        });
        
        const pinchHandler = jest.fn();
        gestureDetector.on(GestureType.PINCH, pinchHandler);
        
        // Touch start with two touches
        simulateTouchEvent(
          env.element, 
          'touchstart', 
          [
            { identifier: 0, clientX: 100, clientY: 100 },
            { identifier: 1, clientX: 200, clientY: 100 }
          ]
        );
        
        // Pinch should start
        expect(pinchHandler).toHaveBeenCalledTimes(1);
        expect(pinchHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PINCH,
            state: GestureState.BEGAN,
            scale: 1
          })
        );
        
        // Reset the mock
        pinchHandler.mockClear();
        
        // Touch move (pinch out)
        simulateTouchEvent(
          env.document, 
          'touchmove', 
          [
            { identifier: 0, clientX: 50, clientY: 100 },
            { identifier: 1, clientX: 250, clientY: 100 }
          ]
        );
        
        // Pinch should update with increased scale
        expect(pinchHandler).toHaveBeenCalledTimes(1);
        expect(pinchHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PINCH,
            state: GestureState.CHANGED
          })
        );
        
        // Check that scale increased (pinched out)
        const callData = pinchHandler.mock.calls[0][0] as GestureEventData;
        expect(callData.scale).toBeGreaterThan(1);
        
        // Reset the mock
        pinchHandler.mockClear();
        
        // Touch end
        simulateTouchEvent(
          env.document, 
          'touchend', 
          [
            { identifier: 0, clientX: 50, clientY: 100 },
            { identifier: 1, clientX: 250, clientY: 100 }
          ], 
          { touches: [] }
        );
        
        // Pinch should end
        expect(pinchHandler).toHaveBeenCalledTimes(1);
        expect(pinchHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PINCH,
            state: GestureState.ENDED
          })
        );
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
    
    test('should detect rotate gesture with touch events', () => {
      const env = createTestEnvironment();
      
      try {
        const gestureDetector = createGestureDetector(env.element as any, {
          enableTouchEvents: true
        });
        
        const rotateHandler = jest.fn();
        gestureDetector.on(GestureType.ROTATE, rotateHandler);
        
        // Touch start with two touches (horizontal line)
        simulateTouchEvent(
          env.element, 
          'touchstart', 
          [
            { identifier: 0, clientX: 100, clientY: 100 },
            { identifier: 1, clientX: 200, clientY: 100 }
          ]
        );
        
        // Rotate should start
        expect(rotateHandler).toHaveBeenCalledTimes(1);
        expect(rotateHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.ROTATE,
            state: GestureState.BEGAN,
            rotation: 0
          })
        );
        
        // Reset the mock
        rotateHandler.mockClear();
        
        // Touch move (rotate 45 degrees)
        simulateTouchEvent(
          env.document, 
          'touchmove', 
          [
            { identifier: 0, clientX: 100, clientY: 100 }, // Fixed
            { identifier: 1, clientX: 170, clientY: 170 }  // Moved ~45 degrees
          ]
        );
        
        // Rotate should update with rotation value
        expect(rotateHandler).toHaveBeenCalledTimes(1);
        expect(rotateHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.ROTATE,
            state: GestureState.CHANGED
          })
        );
        
        // Check that rotation is approximately 45 degrees (allow for rounding)
        const callData = rotateHandler.mock.calls[0][0] as GestureEventData;
        expect(Math.abs(callData.rotation! - 45)).toBeLessThan(10);
        
        // Reset the mock
        rotateHandler.mockClear();
        
        // Touch end
        simulateTouchEvent(
          env.document, 
          'touchend', 
          [
            { identifier: 0, clientX: 100, clientY: 100 },
            { identifier: 1, clientX: 170, clientY: 170 }
          ], 
          { touches: [] }
        );
        
        // Rotate should end
        expect(rotateHandler).toHaveBeenCalledTimes(1);
        expect(rotateHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.ROTATE,
            state: GestureState.ENDED
          })
        );
        
        gestureDetector.destroy();
      } finally {
        env.cleanup();
      }
    });
  });
}); 