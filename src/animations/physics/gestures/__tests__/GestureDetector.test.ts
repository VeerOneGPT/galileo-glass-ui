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
  ownerDocument: any;

  constructor(doc: any) {
    super();
    this.ownerDocument = doc;
  }
  
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

// Mock Touch object for environments without Touch Events API
class MockTouch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX?: number;
  pageY?: number;
  screenX?: number;
  screenY?: number;
  radiusX?: number;
  radiusY?: number;
  rotationAngle?: number;
  force?: number;

  constructor(init: Partial<MockTouch>) {
    this.identifier = init.identifier ?? 0;
    this.target = init.target ?? new MockEventTarget(); // Use MockEventTarget as default
    this.clientX = init.clientX ?? 0;
    this.clientY = init.clientY ?? 0;
    this.pageX = init.pageX;
    this.pageY = init.pageY;
    this.screenX = init.screenX;
    this.screenY = init.screenY;
    this.radiusX = init.radiusX;
    this.radiusY = init.radiusY;
    this.rotationAngle = init.rotationAngle;
    this.force = init.force;
  }
}

// Create a fresh environment for each test to prevent state leakage
function createTestEnvironment() {
  // Store original globals
  const originalDocument = global.document;
  const originalWindow = global.window;
  const originalTouch = global.Touch;

  // Spy on document methods
  if (!global.document) {
    throw new Error('global.document is not available in test environment.');
  }
  const docAddSpy = jest.spyOn(global.document, 'addEventListener');
  const docRemoveSpy = jest.spyOn(global.document, 'removeEventListener');

  // --- Mock window timers using spies --- 
  const timeoutCallbacks = new Map<number, Function>();

  if (!global.window) {
    throw new Error('global.window is not available in test environment.');
  }

  // Store original timer functions BEFORE spying
  const originalSetTimeout = global.window.setTimeout;
  const originalClearTimeout = global.window.clearTimeout;

  const timeoutSpy = jest.spyOn(global.window, 'setTimeout').mockImplementation(((cb: Function, delay?: number) => {
    // Use the ORIGINAL setTimeout to get a real ID, but track the callback
    const id = originalSetTimeout(() => { 
      // This inner callback might run if not cleared, but we control the *intended* callback execution via triggerTimeout
    }, delay || 0); 
    timeoutCallbacks.set(id as unknown as number, cb);
    return id as any; 
  }) as typeof setTimeout);

  const clearTimeoutSpy = jest.spyOn(global.window, 'clearTimeout').mockImplementation(((id?: number) => {
    if (id !== undefined) {
      timeoutCallbacks.delete(id);
      originalClearTimeout(id); // Use the ORIGINAL clearTimeout
    }
  }) as typeof clearTimeout);

  // Helper to manually trigger a stored timeout callback
  const triggerTimeout = (id: number) => {
    const callback = timeoutCallbacks.get(id);
    if (callback) {
      callback();
      timeoutCallbacks.delete(id); // Remove after execution
    }
  };
  // --- End timer mocking ---

  global.Touch = MockTouch as any; // Keep MockTouch assignment

  const element = new MockElement(global.document);

  return {
    document: global.document, 
    window: global.window, // Return the actual window
    element,
    docAddSpy,    
    docRemoveSpy,
    // We don't need to return the timer spies themselves, but keep the map and trigger fn
    timeoutCallbacks, 
    triggerTimeout,
    cleanup: () => {
      // Restore spies
      docAddSpy.mockRestore();
      docRemoveSpy.mockRestore();
      timeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
      // Restore original globals
      global.document = originalDocument; 
      global.window = originalWindow;
      global.Touch = originalTouch;
    }
  };
}

// --- Helper Functions for Event Simulation ---

// Helper to simulate mouse events
function simulateMouseEvent(target: MockEventTarget, type: string, options: any = {}) {
  // Use the actual MouseEvent constructor if available in the environment
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: options.clientX ?? 100,
    clientY: options.clientY ?? 100,
    button: options.button ?? 0,
    // JSDOM might not support all options, add based on need
    ...(options.view && { view: options.view }),
    ...(options.detail && { detail: options.detail }),
    ...(options.screenX && { screenX: options.screenX }),
    ...(options.screenY && { screenY: options.screenY }),
    ...(options.ctrlKey && { ctrlKey: options.ctrlKey }),
    ...(options.altKey && { altKey: options.altKey }),
    ...(options.shiftKey && { shiftKey: options.shiftKey }),
    ...(options.metaKey && { metaKey: options.metaKey }),
    ...(options.relatedTarget && { relatedTarget: options.relatedTarget }),
  });
  
  // Add potentially missing properties if JSDOM doesn't set them
  Object.defineProperty(event, 'target', { value: options.target ?? target, writable: false });

  if (type.startsWith('mouse')) {
    if (type === 'mousedown' || type === 'mouseover' || type === 'mouseout') {
      target.dispatchEvent(event);
    } else {
      // For mousemove and mouseup, dispatch to the actual global document
      global.document.dispatchEvent(event);
    }
  }
  
  return event;
}

// Helper to simulate touch events with proper structure
function simulateTouchEvent(target: MockEventTarget, type: string, touchList: any[] = [], options: any = {}) {
  const touchPoints = touchList.map((touch, index) => {
    // Create Touch objects using the (now potentially mocked) global Touch
    return new (global.Touch as any)({
      identifier: touch.identifier ?? index,
      target: touch.target ?? target,
      clientX: touch.clientX ?? 100,
      clientY: touch.clientY ?? 100,
      // Add other Touch properties if needed
      ...(touch.pageX && { pageX: touch.pageX }),
      ...(touch.pageY && { pageY: touch.pageY }),
      ...(touch.screenX && { screenX: touch.screenX }),
      ...(touch.screenY && { screenY: touch.screenY }),
      ...(touch.radiusX && { radiusX: touch.radiusX }),
      ...(touch.radiusY && { radiusY: touch.radiusY }),
      ...(touch.rotationAngle && { rotationAngle: touch.rotationAngle }),
      ...(touch.force && { force: touch.force }),
    });
  });

  // Use TouchEvent constructor
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touchPoints, // Use created Touch objects
    targetTouches: touchPoints.filter(t => t.target === target),
    changedTouches: touchPoints, // Assume all touches changed for simplicity
    ...(options.view && { view: options.view }),
    ...(options.ctrlKey && { ctrlKey: options.ctrlKey }),
    ...(options.altKey && { altKey: options.altKey }),
    ...(options.shiftKey && { shiftKey: options.shiftKey }),
    ...(options.metaKey && { metaKey: options.metaKey }),
  });
  
  // Add potentially missing properties
  Object.defineProperty(event, 'target', { value: options.target ?? target, writable: false });

  if (type === 'touchstart') {
    target.dispatchEvent(event);
  } else {
    // For touchmove, touchend, and touchcancel, dispatch to the actual global document
    global.document.dispatchEvent(event);
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
  beforeAll(() => {
    // Keep jest.useFakeTimers() as it helps control time-based logic within tests
    // even though we manually trigger our specific long-press timeout.
    jest.useFakeTimers(); 
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });
  
  describe('Event Subscription', () => {
    test('should attach event listeners when created', () => { 
      const env = createTestEnvironment();
      let gestureDetector: any; 

      try {
        gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          enableTouchEvents: true,
          enablePointerEvents: false // Assuming pointer events off for this check
        });

        // Check element listeners (using internal mock state is fine here)
        expect(env.element.listeners['mousedown']).toBeDefined();
        expect(env.element.listeners['touchstart']).toBeDefined();
        expect(env.element.listeners['mouseover']).toBeDefined(); 
        expect(env.element.listeners['mouseout']).toBeDefined();

        // Check document listeners using the spy
        expect(env.docAddSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
        expect(env.docAddSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
        expect(env.docAddSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
        expect(env.docAddSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
        expect(env.docAddSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));

      } finally {
        gestureDetector?.destroy();
        env.cleanup();
      }
    });

    test('should detach event listeners on destroy', () => {
      const env = createTestEnvironment();
      let gestureDetector: any;
      let elementRemoveSpy: jest.SpyInstance | null = null; // Declare spy

      try {
        gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          enableTouchEvents: true,
          enablePointerEvents: false
        });

        // Spy on element's removeEventListener *after* creation but *before* destroy
        elementRemoveSpy = jest.spyOn(env.element, 'removeEventListener');

        gestureDetector.destroy();

        // Check element listeners removed using spy
        expect(elementRemoveSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(elementRemoveSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
        expect(elementRemoveSpy).toHaveBeenCalledWith('mouseover', expect.any(Function));
        expect(elementRemoveSpy).toHaveBeenCalledWith('mouseout', expect.any(Function));

        // Check document listeners removed using the global document spy
        expect(env.docRemoveSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
        expect(env.docRemoveSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
        expect(env.docRemoveSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
        expect(env.docRemoveSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
        expect(env.docRemoveSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));

      } finally {
        elementRemoveSpy?.mockRestore(); // Restore element spy if created
        // gestureDetector is already destroyed if created
        env.cleanup(); // Cleans up global document spies and globals
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
      let gestureDetector: any;
      try {
        gestureDetector = createGestureDetector(env.element as any, {
          enableMouseEvents: true,
          longPressTimeThreshold: 500
        });
        
        const gestureHandler = jest.fn();
        gestureDetector.on(GestureType.LONG_PRESS, gestureHandler);
        
        simulateMouseEvent(env.element, 'mousedown');
        
        // Get the last timeout ID *from our map*
        const timeoutIds = Array.from(env.timeoutCallbacks.keys());
        const longPressTimeoutId = timeoutIds[timeoutIds.length - 1];

        if (longPressTimeoutId === undefined) {
          // Throw error if timer wasn't set as expected
          throw new Error('Long press timer ID was not found in mock callbacks map.');
        }
        
        // Trigger the long press timeout via our helper
        env.triggerTimeout(longPressTimeoutId);
        
        expect(gestureHandler).toHaveBeenCalledTimes(1);
        expect(gestureHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.LONG_PRESS,
            state: GestureState.RECOGNIZED
          })
        );
        
        gestureDetector?.destroy(); 
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
      let gestureDetector: any;
      try {
        gestureDetector = createGestureDetector(env.element as any, {
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
          env.element, 
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
          env.element, 
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
      let gestureDetector: any;
      try {
        gestureDetector = createGestureDetector(env.element as any, {
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
          env.element, 
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
          env.element, 
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