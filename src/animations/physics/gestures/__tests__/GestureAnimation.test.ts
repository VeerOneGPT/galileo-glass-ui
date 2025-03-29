import { GestureAnimation, GestureAnimationPreset } from '../GestureAnimation';
import * as GestureDetectorModule from '../GestureDetector';
import * as springPhysicsModule from '../../springPhysics';
import * as inertialMovementModule from '../../inertialMovement';

// Mock the dependencies
jest.mock('../GestureDetector', () => {
  const originalModule = jest.requireActual('../GestureDetector');
  
  return {
    ...originalModule,
    createGestureDetector: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      off: jest.fn(),
      destroy: jest.fn()
    }))
  };
});

jest.mock('../../springPhysics', () => ({
  springPhysics: jest.fn().mockImplementation(params => ({
    position: { ...params.position },
    velocity: { ...params.velocity },
    targetPosition: { ...params.targetPosition }
  }))
}));

jest.mock('../../inertialMovement', () => ({
  inertialMovement: jest.fn().mockImplementation(params => ({
    position: { ...params.position },
    velocity: { x: params.velocity.x * 0.95, y: params.velocity.y * 0.95 },
    timestamp: params.timestamp
  }))
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(cb => {
  return window.setTimeout(cb, 0);
});

global.cancelAnimationFrame = jest.fn().mockImplementation(id => {
  window.clearTimeout(id);
});

describe('GestureAnimation', () => {
  let element: HTMLElement;
  let gestureAnimation: GestureAnimation;
  
  beforeEach(() => {
    // Create a mock element
    element = document.createElement('div');
    Object.defineProperty(element, 'style', {
      value: {},
      writable: true
    });
    
    // Create the gesture animation instance
    gestureAnimation = new GestureAnimation({
      element,
      gestures: [
        GestureDetectorModule.GestureType.PAN,
        GestureDetectorModule.GestureType.PINCH,
        GestureDetectorModule.GestureType.ROTATE
      ]
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    gestureAnimation.destroy();
  });
  
  describe('Initialization', () => {
    test('should create a gesture detector with the provided element', () => {
      expect(GestureDetectorModule.createGestureDetector).toHaveBeenCalledWith(
        element,
        expect.any(Object)
      );
    });
    
    test('should initialize with default transform values', () => {
      const transform = gestureAnimation.getTransform();
      expect(transform).toEqual({
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: 0,
        velocity: { x: 0, y: 0 }
      });
    });
    
    test('should apply preset configuration when specified', () => {
      const gestureAnimationWithPreset = new GestureAnimation({
        element,
        preset: GestureAnimationPreset.SPRING_BOUNCE,
        gestures: [GestureDetectorModule.GestureType.PAN]
      });
      
      // Should have applied the preset's settings
      expect(GestureDetectorModule.createGestureDetector).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          enableMouseEvents: true,
          enableTouchEvents: true
        })
      );
      
      gestureAnimationWithPreset.destroy();
    });
  });
  
  describe('Transform Methods', () => {
    test('should update transform with setTransform method', () => {
      gestureAnimation.setTransform({
        translateX: 100,
        translateY: 50,
        scale: 1.5,
        rotation: 45
      });
      
      const transform = gestureAnimation.getTransform();
      expect(transform).toEqual({
        translateX: 100,
        translateY: 50,
        scale: 1.5,
        rotation: 45,
        velocity: { x: 0, y: 0 }
      });
      
      // Should have applied transform to element
      expect(element.style.transform).toContain('translate(100px, 50px)');
      expect(element.style.transform).toContain('scale(1.5)');
      expect(element.style.transform).toContain('rotate(45deg)');
    });
    
    test('should call onTransformChange callback when transform changes', () => {
      const onTransformChange = jest.fn();
      
      const gestureAnimationWithCallback = new GestureAnimation({
        element,
        onTransformChange,
        gestures: [GestureDetectorModule.GestureType.PAN]
      });
      
      gestureAnimationWithCallback.setTransform({ translateX: 100 });
      
      expect(onTransformChange).toHaveBeenCalledWith(
        expect.objectContaining({
          translateX: 100
        })
      );
      
      gestureAnimationWithCallback.destroy();
    });
    
    test('should reset transform to initial values', () => {
      // First set to some non-default values
      gestureAnimation.setTransform({
        translateX: 100,
        translateY: 50,
        scale: 1.5,
        rotation: 45
      });
      
      // Reset without animation
      gestureAnimation.reset(false);
      
      const transform = gestureAnimation.getTransform();
      expect(transform).toEqual({
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: 0,
        velocity: { x: 0, y: 0 }
      });
    });
    
    test('should start animation with animateTo method', () => {
      // Mock requestAnimationFrame to immediately call the callback
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
      });
      
      gestureAnimation.animateTo({
        translateX: 100,
        translateY: 50,
        scale: 1.5,
        rotation: 45
      });
      
      // Should have started animations using springPhysics
      expect(springPhysicsModule.springPhysics).toHaveBeenCalled();
      
      // Clean up
      (window.requestAnimationFrame as jest.Mock).mockRestore();
    });
  });
  
  describe('Gesture Handling', () => {
    test('should handle gesture events through the detector callbacks', () => {
      // Get the 'on' mock from the detector
      const detectorOn = (GestureDetectorModule.createGestureDetector as jest.Mock).mock.results[0].value.on;
      
      // Find the handler registered for PAN gesture
      const panHandler = detectorOn.mock.calls.find(
        call => call[0] === GestureDetectorModule.GestureType.PAN
      )[1];
      
      // Create mock gesture event data
      const mockGestureData: GestureDetectorModule.GestureEventData = {
        type: GestureDetectorModule.GestureType.PAN,
        state: GestureDetectorModule.GestureState.BEGAN,
        position: { x: 100, y: 100 },
        initialPosition: { x: 100, y: 100 },
        movement: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        distance: 0,
        duration: 0,
        direction: GestureDetectorModule.GestureDirection.NONE,
        target: element,
        event: new MouseEvent('mousedown'),
        timestamp: Date.now()
      };
      
      // Call the pan handler with BEGAN state
      panHandler(mockGestureData);
      
      // Create update data with movement
      const updateData = {
        ...mockGestureData,
        state: GestureDetectorModule.GestureState.CHANGED,
        position: { x: 150, y: 120 },
        movement: { x: 50, y: 20 },
        velocity: { x: 1, y: 0.4 },
        distance: 53.85, // sqrt(50^2 + 20^2)
      };
      
      // Call the pan handler with CHANGED state
      panHandler(updateData);
      
      // Transform should be updated with the movement
      const transform = gestureAnimation.getTransform();
      expect(transform.translateX).toBe(50);
      expect(transform.translateY).toBe(20);
      
      // Create end data
      const endData = {
        ...updateData,
        state: GestureDetectorModule.GestureState.ENDED
      };
      
      // Call the pan handler with ENDED state
      panHandler(endData);
    });
    
    test('should call custom callbacks during gesture lifecycle', () => {
      const onGestureStart = jest.fn();
      const onGestureUpdate = jest.fn();
      const onGestureEnd = jest.fn();
      
      const gestureAnimationWithCallbacks = new GestureAnimation({
        element,
        gestures: [GestureDetectorModule.GestureType.PAN],
        onGestureStart,
        onGestureUpdate,
        onGestureEnd
      });
      
      // Get the 'on' mock from the detector
      const detectorOn = (GestureDetectorModule.createGestureDetector as jest.Mock).mock.results[1].value.on;
      
      // Find the handler registered for PAN gesture
      const panHandler = detectorOn.mock.calls.find(
        call => call[0] === GestureDetectorModule.GestureType.PAN
      )[1];
      
      // Create mock gesture event data
      const mockGestureData: GestureDetectorModule.GestureEventData = {
        type: GestureDetectorModule.GestureType.PAN,
        state: GestureDetectorModule.GestureState.BEGAN,
        position: { x: 100, y: 100 },
        initialPosition: { x: 100, y: 100 },
        movement: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        distance: 0,
        duration: 0,
        direction: GestureDetectorModule.GestureDirection.NONE,
        target: element,
        event: new MouseEvent('mousedown'),
        timestamp: Date.now()
      };
      
      // Call the pan handler with BEGAN state
      panHandler(mockGestureData);
      expect(onGestureStart).toHaveBeenCalledWith(mockGestureData);
      
      // Create update data with movement
      const updateData = {
        ...mockGestureData,
        state: GestureDetectorModule.GestureState.CHANGED,
        position: { x: 150, y: 120 },
        movement: { x: 50, y: 20 },
        velocity: { x: 1, y: 0.4 },
        distance: 53.85, // sqrt(50^2 + 20^2)
      };
      
      // Call the pan handler with CHANGED state
      panHandler(updateData);
      expect(onGestureUpdate).toHaveBeenCalledWith(
        updateData,
        expect.objectContaining({
          translateX: 50,
          translateY: 20
        })
      );
      
      // Create end data
      const endData = {
        ...updateData,
        state: GestureDetectorModule.GestureState.ENDED
      };
      
      // Call the pan handler with ENDED state
      panHandler(endData);
      expect(onGestureEnd).toHaveBeenCalledWith(
        endData,
        expect.objectContaining({
          translateX: 50,
          translateY: 20
        })
      );
      
      gestureAnimationWithCallbacks.destroy();
    });
    
    test('should respect boundaries when transforming', () => {
      const gestureAnimationWithBoundaries = new GestureAnimation({
        element,
        gestures: [GestureDetectorModule.GestureType.PAN],
        boundaries: {
          x: { min: -100, max: 100 },
          y: { min: -50, max: 50 },
          scale: { min: 0.5, max: 2 },
          rotation: { min: -90, max: 90 }
        }
      });
      
      // Get the 'on' mock from the detector
      const detectorOn = (GestureDetectorModule.createGestureDetector as jest.Mock).mock.results[2].value.on;
      
      // Find the handler registered for PAN gesture
      const panHandler = detectorOn.mock.calls.find(
        call => call[0] === GestureDetectorModule.GestureType.PAN
      )[1];
      
      // Create mock gesture with movement beyond boundaries
      const mockGestureData: GestureDetectorModule.GestureEventData = {
        type: GestureDetectorModule.GestureType.PAN,
        state: GestureDetectorModule.GestureState.BEGAN,
        position: { x: 100, y: 100 },
        initialPosition: { x: 100, y: 100 },
        movement: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        distance: 0,
        duration: 0,
        direction: GestureDetectorModule.GestureDirection.NONE,
        target: element,
        event: new MouseEvent('mousedown'),
        timestamp: Date.now()
      };
      
      // Call the pan handler with BEGAN state
      panHandler(mockGestureData);
      
      // Create update data with movement beyond boundaries
      const updateData = {
        ...mockGestureData,
        state: GestureDetectorModule.GestureState.CHANGED,
        position: { x: 300, y: 200 },
        movement: { x: 200, y: 100 },
        velocity: { x: 4, y: 2 },
        distance: 223.6, // sqrt(200^2 + 100^2)
      };
      
      // Call the pan handler with CHANGED state
      panHandler(updateData);
      
      // Transform should be limited by boundaries
      const transform = gestureAnimationWithBoundaries.getTransform();
      expect(transform.translateX).toBe(100); // Limited by max: 100
      expect(transform.translateY).toBe(50);  // Limited by max: 50
      
      gestureAnimationWithBoundaries.destroy();
    });
  });
  
  describe('Animation Physics', () => {
    test('should use spring physics for animation', () => {
      // Use animateTo to trigger spring physics
      gestureAnimation.animateTo({ translateX: 100, translateY: 50 });
      
      // Should have called springPhysics
      expect(springPhysicsModule.springPhysics).toHaveBeenCalledWith(
        expect.objectContaining({
          targetPosition: expect.objectContaining({ x: 100, y: 50 })
        })
      );
    });
    
    test('should use inertial movement for swipe gestures', () => {
      // Get the 'on' mock from the detector
      const detectorOn = (GestureDetectorModule.createGestureDetector as jest.Mock).mock.results[0].value.on;
      
      // Find the handler registered for SWIPE gesture
      const swipeHandler = detectorOn.mock.calls.find(
        call => call[0] === GestureDetectorModule.GestureType.SWIPE
      )?.[1];
      
      // If no specific swipe handler was registered, PAN handler handles swipes too
      const handler = swipeHandler || detectorOn.mock.calls.find(
        call => call[0] === GestureDetectorModule.GestureType.PAN
      )[1];
      
      // Create mock swipe gesture data
      const mockSwipeData: GestureDetectorModule.GestureEventData = {
        type: GestureDetectorModule.GestureType.SWIPE,
        state: GestureDetectorModule.GestureState.RECOGNIZED,
        position: { x: 200, y: 150 },
        initialPosition: { x: 100, y: 100 },
        movement: { x: 100, y: 50 },
        velocity: { x: 2, y: 1 }, // Fast enough to be a swipe
        acceleration: { x: 0.1, y: 0.05 },
        distance: 111.8, // sqrt(100^2 + 50^2)
        duration: 100,
        direction: GestureDetectorModule.GestureDirection.RIGHT,
        target: element,
        event: new MouseEvent('mouseup'),
        timestamp: Date.now()
      };
      
      // Mock requestAnimationFrame to immediately call the callback
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
      });
      
      // Call the handler with swipe data
      handler(mockSwipeData);
      
      // Should have started inertial animation
      expect(inertialMovementModule.inertialMovement).toHaveBeenCalled();
      
      // Should have applied velocity from the swipe
      expect(inertialMovementModule.inertialMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          velocity: expect.objectContaining({ x: 2, y: 1 })
        })
      );
      
      // Clean up
      (window.requestAnimationFrame as jest.Mock).mockRestore();
    });
  });
  
  describe('Cleanup', () => {
    test('should clean up resources when destroyed', () => {
      const destroySpy = (GestureDetectorModule.createGestureDetector as jest.Mock).mock.results[0].value.destroy;
      
      gestureAnimation.destroy();
      
      expect(destroySpy).toHaveBeenCalled();
    });
    
    test('should cancel animations when destroyed', () => {
      // Start an animation
      gestureAnimation.animateTo({ translateX: 100 });
      
      // Then destroy
      gestureAnimation.destroy();
      
      // Should have cancelled animation frames
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});