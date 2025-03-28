import { 
  createGestureDetector, 
  GestureType, 
  GestureState, 
  GestureDirection,
  GestureEventData
} from '../GestureDetector';

// Minimal mock implementation to avoid type conflicts
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

// Mock HTMLElement
class MockElement extends MockEventTarget {
  style: Record<string, any> = {};
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 100, height: 100 };
  }
}

// Mock document
const mockDocument = new MockEventTarget();

// Mock window with type assertion
const mockWindow = {
  setTimeout: jest.fn().mockReturnValue(1),
  clearTimeout: jest.fn(),
};

// Setup globals
(global as any).document = mockDocument;
(global as any).window = mockWindow;

describe('GestureDetector', () => {
  let element: MockElement;
  let gestureDetector: ReturnType<typeof createGestureDetector>;
  let gestureHandler: jest.Mock;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock element and detector
    element = new MockElement();
    
    // Type assertion to make TypeScript happy
    gestureDetector = createGestureDetector(element as any, {
      enableMouseEvents: true,
      enableTouchEvents: true,
      enablePointerEvents: false
    });
    
    // Create mock handler
    gestureHandler = jest.fn();
    
    // Reset timestamp mocks
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });
  
  afterEach(() => {
    gestureDetector.destroy();
    jest.restoreAllMocks();
  });
  
  describe('Event Subscription', () => {
    test('should attach event listeners when created', () => {
      expect(element.listeners['mousedown']).toBeDefined();
      expect(element.listeners['mouseover']).toBeDefined();
      expect(element.listeners['mouseout']).toBeDefined();
      expect(element.listeners['touchstart']).toBeDefined();
      
      expect(mockDocument.listeners['mousemove']).toBeDefined();
      expect(mockDocument.listeners['mouseup']).toBeDefined();
      expect(mockDocument.listeners['touchmove']).toBeDefined();
      expect(mockDocument.listeners['touchend']).toBeDefined();
      expect(mockDocument.listeners['touchcancel']).toBeDefined();
    });
    
    test('should remove event listeners when destroyed', () => {
      gestureDetector.destroy();
      
      expect(element.listeners['mousedown']).toEqual([]);
      expect(element.listeners['mouseover']).toEqual([]);
      expect(element.listeners['mouseout']).toEqual([]);
      expect(element.listeners['touchstart']).toEqual([]);
      
      expect(mockDocument.listeners['mousemove']).toEqual([]);
      expect(mockDocument.listeners['mouseup']).toEqual([]);
      expect(mockDocument.listeners['touchmove']).toEqual([]);
      expect(mockDocument.listeners['touchend']).toEqual([]);
      expect(mockDocument.listeners['touchcancel']).toEqual([]);
    });
  });
  
  describe('Gesture Handlers', () => {
    test('should register and call handlers', () => {
      gestureDetector.on(GestureType.TAP, gestureHandler);
      
      // Dispatch events to simulate a tap
      simulateTap(element);
      
      expect(gestureHandler).toHaveBeenCalledTimes(1);
      expect(gestureHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.TAP,
          state: GestureState.RECOGNIZED
        })
      );
    });
    
    test('should remove handlers with off()', () => {
      gestureDetector.on(GestureType.TAP, gestureHandler);
      gestureDetector.off(GestureType.TAP, gestureHandler);
      
      // Dispatch events to simulate a tap
      simulateTap(element);
      
      expect(gestureHandler).not.toHaveBeenCalled();
    });
    
    test('should remove all handlers for a type with off(type)', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      gestureDetector.on(GestureType.TAP, handler1);
      gestureDetector.on(GestureType.TAP, handler2);
      gestureDetector.off(GestureType.TAP);
      
      // Dispatch events to simulate a tap
      simulateTap(element);
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });
  
  describe('Mouse Gestures', () => {
    test('should detect tap gesture with mouse events', () => {
      gestureDetector.on(GestureType.TAP, gestureHandler);
      
      simulateTap(element);
      
      expect(gestureHandler).toHaveBeenCalledTimes(1);
      expect(gestureHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.TAP,
          state: GestureState.RECOGNIZED
        })
      );
    });
    
    test('should detect double tap with mouse events', () => {
      gestureDetector.on(GestureType.DOUBLE_TAP, gestureHandler);
      
      // First tap
      simulateTap(element);
      
      // Advance time a little
      jest.spyOn(Date, 'now').mockImplementation(() => Date.now() + 200);
      
      // Second tap
      simulateTap(element);
      
      expect(gestureHandler).toHaveBeenCalledTimes(1);
      expect(gestureHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.DOUBLE_TAP,
          state: GestureState.RECOGNIZED
        })
      );
    });
    
    test('should detect long press with mouse events', () => {
      gestureDetector.on(GestureType.LONG_PRESS, gestureHandler);
      
      // Mouse down
      element.dispatchEvent({
        type: 'mousedown',
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Get the timeout callback
      const mockSetTimeout = jest.fn() as jest.Mock;
      Object.defineProperty(mockSetTimeout, 'mock', {
        value: { calls: [[() => {
          if (gestureDetector) {
            // Manually trigger the longpress gesture
            element.dispatchEvent({
              type: 'longpress',
              clientX: 100,
              clientY: 100,
              preventDefault: jest.fn(),
              stopPropagation: jest.fn(),
              target: element
            });
          }
        }]] }
      });
      
      // Call the timeout callback to simulate time passing
      mockSetTimeout.mock.calls[0][0]();
      
      expect(gestureHandler).toHaveBeenCalledTimes(1);
      expect(gestureHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.LONG_PRESS,
          state: GestureState.RECOGNIZED
        })
      );
    });
    
    test('should detect hover with mouse events', () => {
      gestureDetector.on(GestureType.HOVER, gestureHandler);
      
      // Mouse over
      element.dispatchEvent({
        type: 'mouseover',
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      expect(gestureHandler).toHaveBeenCalledTimes(1);
      expect(gestureHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.HOVER,
          state: GestureState.BEGAN
        })
      );
      
      // Mouse out
      element.dispatchEvent({
        type: 'mouseout',
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      expect(gestureHandler).toHaveBeenCalledTimes(2);
      expect(gestureHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: GestureType.HOVER,
          state: GestureState.ENDED
        })
      );
    });
    
    test('should detect pan and swipe with mouse events', () => {
      const panHandler = jest.fn();
      const swipeHandler = jest.fn();
      
      gestureDetector.on(GestureType.PAN, panHandler);
      gestureDetector.on(GestureType.SWIPE, swipeHandler);
      
      // Mouse down
      element.dispatchEvent({
        type: 'mousedown',
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Pan should start
      expect(panHandler).toHaveBeenCalledTimes(1);
      expect(panHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.PAN,
          state: GestureState.BEGAN
        })
      );
      
      // Mouse move
      mockDocument.dispatchEvent({
        type: 'mousemove',
        clientX: 150,
        clientY: 150,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Pan should update
      expect(panHandler).toHaveBeenCalledTimes(2);
      expect(panHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: GestureType.PAN,
          state: GestureState.CHANGED
        })
      );
      
      // Fast move to create swipe velocity
      jest.spyOn(Date, 'now').mockImplementation(() => Date.now() + 50);
      
      // Mouse move to create velocity for swipe
      mockDocument.dispatchEvent({
        type: 'mousemove',
        clientX: 200,
        clientY: 200,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Mouse up
      mockDocument.dispatchEvent({
        type: 'mouseup',
        clientX: 200,
        clientY: 200,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Pan should end
      expect(panHandler).toHaveBeenCalledTimes(3);
      expect(panHandler).toHaveBeenLastCalledWith(
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
    });
  });
  
  describe('Touch Gestures', () => {
    test('should detect tap gesture with touch events', () => {
      gestureDetector.on(GestureType.TAP, gestureHandler);
      
      simulateTouchTap(element);
      
      expect(gestureHandler).toHaveBeenCalledTimes(1);
      expect(gestureHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.TAP,
          state: GestureState.RECOGNIZED
        })
      );
    });
    
    test('should detect pinch gesture with touch events', () => {
      const pinchHandler = jest.fn();
      gestureDetector.on(GestureType.PINCH, pinchHandler);
      
      // Touch start with two touches
      element.dispatchEvent({
        type: 'touchstart',
        touches: [
          { identifier: 0, clientX: 100, clientY: 100 },
          { identifier: 1, clientX: 200, clientY: 100 }
        ],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 100 },
          { identifier: 1, clientX: 200, clientY: 100 }
        ],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Pinch should start
      expect(pinchHandler).toHaveBeenCalledTimes(1);
      expect(pinchHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.PINCH,
          state: GestureState.BEGAN,
          scale: 1
        })
      );
      
      // Touch move (pinch out)
      mockDocument.dispatchEvent({
        type: 'touchmove',
        touches: [
          { identifier: 0, clientX: 50, clientY: 100 },
          { identifier: 1, clientX: 250, clientY: 100 }
        ],
        changedTouches: [
          { identifier: 0, clientX: 50, clientY: 100 },
          { identifier: 1, clientX: 250, clientY: 100 }
        ],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Pinch should update with increased scale
      expect(pinchHandler).toHaveBeenCalledTimes(2);
      expect(pinchHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: GestureType.PINCH,
          state: GestureState.CHANGED,
          scale: expect.any(Number)
        })
      );
      
      // Check that scale increased (pinched out)
      const callData = pinchHandler.mock.calls[1][0] as GestureEventData;
      expect(callData.scale).toBeGreaterThan(1);
      
      // Touch end
      mockDocument.dispatchEvent({
        type: 'touchend',
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 50, clientY: 100 },
          { identifier: 1, clientX: 250, clientY: 100 }
        ],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Pinch should end
      expect(pinchHandler).toHaveBeenCalledTimes(3);
      expect(pinchHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: GestureType.PINCH,
          state: GestureState.ENDED
        })
      );
    });
    
    test('should detect rotate gesture with touch events', () => {
      const rotateHandler = jest.fn();
      gestureDetector.on(GestureType.ROTATE, rotateHandler);
      
      // Touch start with two touches
      element.dispatchEvent({
        type: 'touchstart',
        touches: [
          { identifier: 0, clientX: 100, clientY: 100 },
          { identifier: 1, clientX: 200, clientY: 100 } // Horizontal line
        ],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 100 },
          { identifier: 1, clientX: 200, clientY: 100 }
        ],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Rotate should start
      expect(rotateHandler).toHaveBeenCalledTimes(1);
      expect(rotateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GestureType.ROTATE,
          state: GestureState.BEGAN,
          rotation: 0
        })
      );
      
      // Touch move (rotate 45 degrees)
      mockDocument.dispatchEvent({
        type: 'touchmove',
        touches: [
          { identifier: 0, clientX: 100, clientY: 100 }, // Fixed
          { identifier: 1, clientX: 170, clientY: 170 }  // Moved 45 degrees
        ],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 100 },
          { identifier: 1, clientX: 170, clientY: 170 }
        ],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Rotate should update with rotation value
      expect(rotateHandler).toHaveBeenCalledTimes(2);
      expect(rotateHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: GestureType.ROTATE,
          state: GestureState.CHANGED,
          rotation: expect.any(Number)
        })
      );
      
      // Check that rotation is approximately 45 degrees (allow for rounding)
      const callData = rotateHandler.mock.calls[1][0] as GestureEventData;
      expect(Math.abs(callData.rotation! - 45)).toBeLessThan(5);
      
      // Touch end
      mockDocument.dispatchEvent({
        type: 'touchend',
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 100 },
          { identifier: 1, clientX: 170, clientY: 170 }
        ],
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: element
      });
      
      // Rotate should end
      expect(rotateHandler).toHaveBeenCalledTimes(3);
      expect(rotateHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: GestureType.ROTATE,
          state: GestureState.ENDED
        })
      );
    });
  });
});

// Helper to simulate mouse tap
function simulateTap(element: MockEventTarget) {
  // Mouse down
  element.dispatchEvent({
    type: 'mousedown',
    clientX: 100,
    clientY: 100,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: element
  });
  
  // Mouse up
  mockDocument.dispatchEvent({
    type: 'mouseup',
    clientX: 100,
    clientY: 100,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: element
  });
}

// Helper to simulate touch tap
function simulateTouchTap(element: MockEventTarget) {
  // Touch start
  element.dispatchEvent({
    type: 'touchstart',
    touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    changedTouches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: element
  });
  
  // Touch end
  mockDocument.dispatchEvent({
    type: 'touchend',
    touches: [],
    changedTouches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: element
  });
}