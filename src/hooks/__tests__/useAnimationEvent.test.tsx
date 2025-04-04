/**
 * Fixed tests for useAnimationEvent hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAnimationEvent } from '../useAnimationEvent';

// Mock AnimationEventSystem
// Create a simplified version of the required classes and types
enum AnimationEventType {
  START = 'animation:start',
  UPDATE = 'animation:update',
  COMPLETE = 'animation:complete',
  CANCEL = 'animation:cancel',
  PAUSE = 'animation:pause',
  RESUME = 'animation:resume'
}

interface AnimationEvent<T = any> {
  type: string;
  target: string;
  data?: T;
  timestamp: number;
}

// Cast the mock bus to match the AnimationEventBus interface
type AnimationEventBusType = any;

// Store a reference to the mock classes to use in tests
let MockBus: any;
let mockAnimationEventTypes: any;

// Move the mock implementation inside the jest.mock to avoid referencing out-of-scope variables
jest.mock('../../animations/orchestration/AnimationEventSystem', () => {
  // Define enum values inside the mock function
  mockAnimationEventTypes = {
    START: 'animation:start',
    UPDATE: 'animation:update',
    COMPLETE: 'animation:complete',
    CANCEL: 'animation:cancel',
    PAUSE: 'animation:pause',
    RESUME: 'animation:resume'
  };

  // Define the MockAnimationEventSubscription inside the mock function
  class MockSubscription {
    _active = true;
    _type;
    _listener;
    _unsubscribeFn;
    
    constructor(type, listener, unsubscribeFn) {
      this._type = type;
      this._listener = listener;
      this._unsubscribeFn = unsubscribeFn;
    }
    
    isActive() {
      return this._active;
    }
    
    unsubscribe() {
      if (this._active) {
        this._active = false;
        this._unsubscribeFn(this);
      }
    }
    
    getType() {
      return this._type;
    }
    
    getListener() {
      return this._listener;
    }
  }

  // Define the MockAnimationEventBus inside the mock function
  class MockEventBus {
    private _listeners: Map<string, Set<MockSubscription>> = new Map();
    private middleware: any[] = [];
    private filters: any[] = [];

    constructor() {
      // Initialization moved to property declarations
    }
    
    on(type: string, listener: Function, options?: { once?: boolean }): MockSubscription {
      if (!this._listeners.has(type)) {
        this._listeners.set(type, new Set());
      }
      const subscription = new MockSubscription(type, listener, () => this._removeSubscription(subscription));
      this._listeners.get(type)!.add(subscription);

      if (options?.once) {
        const originalListener = listener;
        listener = (event: AnimationEvent) => {
          originalListener(event);
          this.off(type, listener);
        };
        // Re-create subscription with the wrapped listener for correct removal
        this._removeSubscription(subscription); // Remove the original one
        const onceSubscription = new MockSubscription(type, listener, () => this._removeSubscription(onceSubscription));
        this._listeners.get(type)!.add(onceSubscription);
        return onceSubscription;
      }
      
      return subscription;
    }
    
    once(type: string, listener: Function, options?: {}): MockSubscription {
      return this.on(type, listener, { ...options, once: true });
    }
    
    off(type: string, listener: Function, options?: {}): this {
      if (!this._listeners.has(type)) return this;

      const subscriptions = this._listeners.get(type)!;
      subscriptions.forEach(subscription => {
        if (subscription.getListener() === listener) {
          subscription.unsubscribe(); // This calls _removeSubscription
        }
      });
      return this;
    }
    
    emit<T = any>(type: string, target?: string, data?: T): this {
      const event = this.createEvent(type, target, data) as AnimationEvent<T>;

      // Apply middleware
      let processedEvent = event;
      for (const mw of this.middleware) {
        processedEvent = mw(processedEvent);
        if (!processedEvent) return this; // Middleware cancelled the event
      }

      // Apply filters
      for (const filter of this.filters) {
        if (!filter(processedEvent)) return this; // Filter stopped the event
      }

      // Execute listeners
      this.executeListeners(processedEvent);
      return this;
    }
    
    _removeSubscription(subscription: MockSubscription): void {
      const type = subscription.getType();
      if (this._listeners.has(type)) {
        this._listeners.get(type)!.delete(subscription);
        if (this._listeners.get(type)!.size === 0) {
          this._listeners.delete(type);
        }
      }
    }
    
    addEventListener(type, listener, options) {
      return this.on(type, listener, options);
    }
    
    removeEventListener(type, listener, options) {
      this.off(type, listener, options);
    }
    
    dispatchEvent(event) {
      return this.emit(event.type, event.target, event.data);
    }
    
    addMiddleware(middleware) {
      this.middleware.push(middleware);
      return this;
    }
    
    removeMiddleware(middleware) {
      const index = this.middleware.indexOf(middleware);
      if (index !== -1) {
        this.middleware.splice(index, 1);
      }
      return this;
    }
    
    addFilter(filter) {
      this.filters.push(filter);
      return this;
    }
    
    removeFilter(filter) {
      const index = this.filters.indexOf(filter);
      if (index !== -1) {
        this.filters.splice(index, 1);
      }
      return this;
    }
    
    executeListeners(event) {
      if (!this._listeners.has(event.type)) return;
      
      const subscriptions = [...this._listeners.get(event.type)];
      subscriptions.forEach(subscription => {
        if (subscription.isActive()) {
          subscription.getListener()(event);
        }
      });
    }
    
    createEvent(type, target, data) {
      return {
        type,
        target,
        data,
        timestamp: Date.now()
      };
    }
    
    clearListeners(type) {
      if (type) {
        this._listeners.delete(type);
      } else {
        this._listeners.clear();
      }
      return this;
    }
    
    getEventTypes() {
      return Array.from(this._listeners.keys());
    }
  }

  // Store the class in the outer variable
  MockBus = MockEventBus;

  return {
    animationEventBus: new MockEventBus(),
    AnimationEventBus: MockEventBus,
    AnimationEventType: mockAnimationEventTypes
  };
});

describe('useAnimationEvent (Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should create hook with default options', () => {
    const { result } = renderHook(() => useAnimationEvent());
    
    expect(result.current).toHaveProperty('on');
    expect(result.current).toHaveProperty('once');
    expect(result.current).toHaveProperty('off');
    expect(result.current).toHaveProperty('emit');
    expect(result.current).toHaveProperty('getEventBus');
    expect(result.current).toHaveProperty('getId');
    
    // Should create a unique ID
    expect(result.current.getId()).toMatch(/component-[a-z0-9]+/);
  });
  
  it('should use provided event bus and ID', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const customId = 'test-component';
    
    const { result } = renderHook(() => 
      useAnimationEvent({
        eventBus: customBus,
        id: customId
      })
    );
    
    expect(result.current.getEventBus()).toBe(customBus);
    expect(result.current.getId()).toBe(customId);
  });
  
  it('should subscribe to events and receive notifications', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.on(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target', { value: 123 });
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: mockAnimationEventTypes.START,
        target: 'test-target',
        data: { value: 123 }
      })
    );
  });
  
  it('should subscribe once and receive only one notification', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.once(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
  });
  
  it('should unsubscribe from events', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.on(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    act(() => {
      result.current.off(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
  
  it('should emit events', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const listener = jest.fn();
    
    act(() => {
      customBus.on(mockAnimationEventTypes.START, listener);
      customBus.on(mockAnimationEventTypes.COMPLETE, listener);
    });
    
    const { result } = renderHook(() => 
      useAnimationEvent({ 
        eventBus: customBus,
        id: 'test-component'
      })
    );
    
    act(() => {
      result.current.emit(mockAnimationEventTypes.START, 'custom-target', { value: 123 });
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: mockAnimationEventTypes.START,
        target: 'custom-target',
        data: { value: 123 }
      })
    );
    
    // Without explicit target, should use component ID
    act(() => {
      result.current.emit(mockAnimationEventTypes.COMPLETE);
    });
    
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: mockAnimationEventTypes.COMPLETE,
        target: 'test-component'
      })
    );
  });
  
  it('should set up initial events when immediate is true', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const startListener = jest.fn();
    const completeListener = jest.fn();
    
    renderHook(() => 
      useAnimationEvent({
        eventBus: customBus,
        immediate: true,
        events: [
          {
            type: mockAnimationEventTypes.START,
            listener: startListener
          },
          {
            type: mockAnimationEventTypes.COMPLETE,
            listener: completeListener
          }
        ]
      })
    );
    
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
      customBus.emit(mockAnimationEventTypes.COMPLETE, 'test-target');
    });
    
    expect(startListener).toHaveBeenCalledTimes(1);
    expect(completeListener).toHaveBeenCalledTimes(1);
  });
  
  it('should not set up initial events when immediate is false', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const startListener = jest.fn();
    
    renderHook(() => 
      useAnimationEvent({
        eventBus: customBus,
        immediate: false,
        events: [
          {
            type: mockAnimationEventTypes.START,
            listener: startListener
          }
        ]
      })
    );
    
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(startListener).toHaveBeenCalledTimes(0);
  });
  
  it('should clean up subscriptions on unmount', () => {
    const customBus = new MockBus() as AnimationEventBusType;
    const listener = jest.fn();
    
    const { unmount } = renderHook(() => {
      const hook = useAnimationEvent({ eventBus: customBus });
      
      act(() => {
        hook.on(mockAnimationEventTypes.START, listener);
      });
      
      return hook;
    });
    
    // Should receive event before unmount
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    // Unmount the hook
    unmount();
    
    // Should not receive event after unmount
    act(() => {
      customBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
}); 