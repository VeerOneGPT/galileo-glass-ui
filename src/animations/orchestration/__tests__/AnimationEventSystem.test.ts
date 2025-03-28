/**
 * Tests for Animation Event System
 */

import {
  AnimationEventBus,
  AnimationEventEmitter,
  AnimationEventManager,
  AnimationEventType,
  AnimationInteractionType,
  AnimationEvent
} from '../AnimationEventSystem';

// Mock performance.now
const originalPerformanceNow = performance.now;
let mockTime = 0;
global.performance.now = jest.fn(() => mockTime);

describe('AnimationEventSystem', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
  });
  
  // Restore performance.now after tests
  afterAll(() => {
    performance.now = originalPerformanceNow;
  });
  
  describe('AnimationEventBus', () => {
    it('should create a new event bus', () => {
      const eventBus = new AnimationEventBus();
      expect(eventBus).toBeDefined();
    });
    
    it('should add and trigger event listeners', () => {
      const eventBus = new AnimationEventBus();
      const listener = jest.fn();
      
      eventBus.addEventListener('test', listener);
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(1);
    });
    
    it('should handle once option correctly', () => {
      const eventBus = new AnimationEventBus();
      const listener = jest.fn();
      
      eventBus.addEventListener('test', listener, { once: true });
      
      // First dispatch should trigger the listener
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      // Second dispatch should not trigger the listener again
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(1);
    });
    
    it('should respect event filters', () => {
      const eventBus = new AnimationEventBus();
      const listener = jest.fn();
      
      // Add a filter that only allows events with a specific target
      const filter = (event: AnimationEvent) => event.target === 'allowedTarget';
      
      eventBus.addEventListener('test', listener, { filter });
      
      // This should not trigger the listener due to the filter
      eventBus.dispatchEvent({
        type: 'test',
        target: 'blockedTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      // This should trigger the listener
      eventBus.dispatchEvent({
        type: 'test',
        target: 'allowedTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(1);
    });
    
    it('should handle middleware correctly', () => {
      const eventBus = new AnimationEventBus();
      const listener = jest.fn();
      const middleware = jest.fn((event, next) => {
        // Modify the event
        event.data = 'modified';
        // Call next middleware
        next(event);
      });
      
      eventBus.addMiddleware(middleware);
      eventBus.addEventListener('test', listener);
      
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(middleware).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ data: 'modified' })
      );
    });
    
    it('should respect event propagation flag', () => {
      const eventBus = new AnimationEventBus();
      const listener1 = jest.fn((event) => {
        event.propagate = false; // Stop propagation
      });
      const listener2 = jest.fn();
      
      eventBus.addEventListener('test', listener1, { priority: 1 });
      eventBus.addEventListener('test', listener2, { priority: 0 });
      
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(0); // Should not be called due to propagation stop
    });
    
    it('should process listeners by priority', () => {
      const eventBus = new AnimationEventBus();
      const order: number[] = [];
      
      const listener1 = jest.fn(() => order.push(1));
      const listener2 = jest.fn(() => order.push(2));
      const listener3 = jest.fn(() => order.push(3));
      
      eventBus.addEventListener('test', listener1, { priority: 1 });
      eventBus.addEventListener('test', listener2, { priority: 3 });
      eventBus.addEventListener('test', listener3, { priority: 2 });
      
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(order).toEqual([2, 3, 1]); // Highest priority first
    });
    
    it('should return subscription object with working methods', () => {
      const eventBus = new AnimationEventBus();
      const listener = jest.fn();
      
      const subscription = eventBus.on('test', listener);
      
      // Dispatch should trigger listener
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(1);
      
      // Pause subscription
      subscription.pause();
      
      // Dispatch should not trigger listener
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(1); // Still 1
      
      // Resume subscription
      subscription.resume();
      
      // Dispatch should trigger listener again
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(2);
      
      // Unsubscribe
      subscription.unsubscribe();
      
      // Dispatch should not trigger listener
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(2); // Still 2
    });
    
    it('should emit events properly', () => {
      const eventBus = new AnimationEventBus();
      const listener = jest.fn();
      
      eventBus.on('test', listener);
      
      eventBus.emit('test', 'testTarget', { value: 123 });
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test',
          target: 'testTarget',
          data: { value: 123 }
        })
      );
    });
  });
  
  describe('AnimationEventEmitter', () => {
    it('should create a new event emitter', () => {
      const emitter = new AnimationEventEmitter('testEmitter');
      expect(emitter).toBeDefined();
      expect(emitter.getId()).toBe('testEmitter');
    });
    
    it('should add and trigger event listeners', () => {
      const emitter = new AnimationEventEmitter('testEmitter');
      const listener = jest.fn();
      
      emitter.addEventListener('test', listener);
      emitter.dispatchEvent({
        type: 'test',
        target: 'testEmitter',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(listener).toHaveBeenCalledTimes(1);
    });
    
    it('should bubble events to parent event bus', () => {
      const eventBus = new AnimationEventBus();
      const emitter = new AnimationEventEmitter('testEmitter', eventBus);
      const busListener = jest.fn();
      const emitterListener = jest.fn();
      
      eventBus.addEventListener('test', busListener);
      emitter.addEventListener('test', emitterListener);
      
      emitter.dispatchEvent({
        type: 'test',
        target: 'testEmitter',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(emitterListener).toHaveBeenCalledTimes(1);
      expect(busListener).toHaveBeenCalledTimes(1);
    });
    
    it('should not bubble events when propagation is stopped', () => {
      const eventBus = new AnimationEventBus();
      const emitter = new AnimationEventEmitter('testEmitter', eventBus);
      const busListener = jest.fn();
      const emitterListener = jest.fn((event) => {
        event.propagate = false; // Stop propagation
      });
      
      eventBus.addEventListener('test', busListener);
      emitter.addEventListener('test', emitterListener);
      
      emitter.dispatchEvent({
        type: 'test',
        target: 'testEmitter',
        timestamp: performance.now(),
        propagate: true
      });
      
      expect(emitterListener).toHaveBeenCalledTimes(1);
      expect(busListener).toHaveBeenCalledTimes(0); // Should not be called due to propagation stop
    });
    
    it('should set target on events if not provided', () => {
      const emitter = new AnimationEventEmitter('testEmitter');
      const listener = jest.fn();
      
      emitter.addEventListener('test', listener);
      
      emitter.dispatchEvent({
        type: 'test',
        timestamp: performance.now(),
        propagate: true
      } as AnimationEvent);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ target: 'testEmitter' })
      );
    });
    
    it('should create and emit events properly', () => {
      const emitter = new AnimationEventEmitter('testEmitter');
      const listener = jest.fn();
      
      emitter.on('test', listener);
      
      emitter.emit('test', { value: 123 });
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test',
          target: 'testEmitter',
          data: { value: 123 }
        })
      );
    });
  });
  
  describe('AnimationEventManager', () => {
    it('should create a new event manager', () => {
      const eventBus = new AnimationEventBus();
      const manager = new AnimationEventManager(eventBus);
      expect(manager).toBeDefined();
      expect(manager.getEventBus()).toBe(eventBus);
    });
    
    it('should register and unregister emitters', () => {
      const eventBus = new AnimationEventBus();
      const manager = new AnimationEventManager(eventBus);
      const emitter = new AnimationEventEmitter('testEmitter');
      
      manager.registerEmitter(emitter);
      expect(manager.getEmitter('testEmitter')).toBe(emitter);
      
      manager.unregisterEmitter('testEmitter');
      expect(manager.getEmitter('testEmitter')).toBeUndefined();
    });
    
    it('should track event history', () => {
      const eventBus = new AnimationEventBus();
      const manager = new AnimationEventManager(eventBus);
      
      // Clear any existing history
      manager.clearEventHistory();
      
      // Create and dispatch a test event
      eventBus.dispatchEvent({
        type: 'test',
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      const history = manager.getEventHistory();
      expect(history.length).toBe(1);
      expect(history[0].type).toBe('test');
    });
    
    it('should respect max history size', () => {
      const eventBus = new AnimationEventBus();
      const manager = new AnimationEventManager(eventBus);
      
      // Set a small max history size
      manager.setMaxHistorySize(3);
      
      // Clear any existing history
      manager.clearEventHistory();
      
      // Dispatch several events
      for (let i = 0; i < 5; i++) {
        eventBus.dispatchEvent({
          type: `test${i}`,
          target: 'testTarget',
          timestamp: performance.now(),
          propagate: true
        });
      }
      
      const history = manager.getEventHistory();
      expect(history.length).toBe(3);
      expect(history[0].type).toBe('test2');
      expect(history[1].type).toBe('test3');
      expect(history[2].type).toBe('test4');
    });
    
    it('should filter event history', () => {
      const eventBus = new AnimationEventBus();
      const manager = new AnimationEventManager(eventBus);
      
      // Clear any existing history
      manager.clearEventHistory();
      
      // Dispatch events of different types
      eventBus.dispatchEvent({
        type: AnimationEventType.START,
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      eventBus.dispatchEvent({
        type: AnimationEventType.PROGRESS,
        target: 'testTarget',
        timestamp: performance.now(),
        progress: 0.5,
        propagate: true
      });
      
      eventBus.dispatchEvent({
        type: AnimationEventType.COMPLETE,
        target: 'testTarget',
        timestamp: performance.now(),
        propagate: true
      });
      
      // Filter for only START events
      const filteredHistory = manager.getEventHistory(
        undefined,
        event => event.type === AnimationEventType.START
      );
      
      expect(filteredHistory.length).toBe(1);
      expect(filteredHistory[0].type).toBe(AnimationEventType.START);
    });
    
    it('should limit event history', () => {
      const eventBus = new AnimationEventBus();
      const manager = new AnimationEventManager(eventBus);
      
      // Clear any existing history
      manager.clearEventHistory();
      
      // Dispatch several events
      for (let i = 0; i < 5; i++) {
        eventBus.dispatchEvent({
          type: `test${i}`,
          target: 'testTarget',
          timestamp: performance.now(),
          propagate: true
        });
      }
      
      // Get only the last 2 events
      const limitedHistory = manager.getEventHistory(2);
      
      expect(limitedHistory.length).toBe(2);
      expect(limitedHistory[0].type).toBe('test3');
      expect(limitedHistory[1].type).toBe('test4');
    });
  });
});