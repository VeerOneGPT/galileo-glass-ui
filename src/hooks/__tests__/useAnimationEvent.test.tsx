/**
 * Tests for useAnimationEvent hook
 */
import { renderHook, act } from '@testing-library/react-hooks';
import _React from 'react';
import { useAnimationEvent } from '../useAnimationEvent';
import {
  AnimationEventBus,
  AnimationEventType,
  AnimationEvent
} from '../../animations/orchestration/AnimationEventSystem';

// Testing types - match the real enum values for compatibility
const mockAnimationEventTypes = {
  START: 'start',
  UPDATE: 'update',
  COMPLETE: 'complete',
  CANCEL: 'cancel',
  PAUSE: 'pause',
  RESUME: 'resume'
};

// Type for event listeners
type MockEventListenerType = (event: AnimationEvent) => void;

// Type for subscription
interface MockSubscription {
  _active: boolean;
  _type: string;
  _listener: MockEventListenerType;
  isActive(): boolean;
  unsubscribe(): void;
  getType(): string;
  getListener(): MockEventListenerType;
}

// Create a mock event bus class that implements the AnimationEventBus interface
class MockEventBus {
  private _listeners: Map<string, Set<MockSubscription>> = new Map();
  private _middleware: MockEventListenerType[] = [];
  private _filters: MockEventListenerType[] = [];
  
  constructor() {
    // Initialize event bus
  }
  
  on(type: string, listener: MockEventListenerType): MockSubscription {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    
    const subscription = new MockSubscriptionImpl(type, listener, 
      () => this._removeSubscription(subscription));
    
    this._listeners.get(type)?.add(subscription);
    
    return subscription;
  }
  
  once(type: string, listener: MockEventListenerType): MockSubscription {
    const onceListener = (event: AnimationEvent) => {
      subscription.unsubscribe();
      listener(event);
    };
    
    const subscription = this.on(type, onceListener);
    return subscription;
  }
  
  off(type: string, listener: (event: AnimationEvent) => void, _options?: unknown): this {
    if (this._listeners.has(type)) {
      const subscriptions = this._listeners.get(type);
      subscriptions?.forEach(sub => {
        if (sub.getListener() === listener) {
          sub.unsubscribe();
        }
      });
    }
    return this;
  }
  
  emit(type: string, target?: string, data?: unknown): void {
    if (target === undefined) {
      target = 'mock-target';
    }
    
    const event = {
      type,
      target,
      data,
      timestamp: Date.now()
    } as AnimationEvent;
    
    if (this._listeners.has(type)) {
      // Call listeners with the event object
      this._listeners.get(type)?.forEach(sub => sub._listener(event));
    }
  }
  
  _removeSubscription(subscription: MockSubscription): void {
    const type = subscription.getType();
    if (this._listeners.has(type)) {
      this._listeners.get(type)?.delete(subscription);
      if (this._listeners.get(type)?.size === 0) {
        this._listeners.delete(type);
      }
    }
  }
  
  addEventListener(type: string, listener: MockEventListenerType, _options?: unknown) {
    return this.on(type, listener);
  }
  
  removeEventListener(type: string, listener: MockEventListenerType, _options?: unknown) {
    this.off(type, listener);
  }
  
  dispatchEvent(event: AnimationEvent) {
    // Simple dispatch, might need more logic based on AnimationEvent structure
    return this.emit(event.type, event.target, event.data);
  }
  
  addMiddleware(middleware: MockEventListenerType) {
    this._middleware.push(middleware);
    return this;
  }
  
  removeMiddleware(middleware: MockEventListenerType) {
    const index = this._middleware.indexOf(middleware);
    if (index !== -1) {
      this._middleware.splice(index, 1);
    }
    return this;
  }
  
  addFilter(filter: MockEventListenerType) {
    this._filters.push(filter);
    return this;
  }
  
  removeFilter(filter: MockEventListenerType) {
    const index = this._filters.indexOf(filter);
    if (index !== -1) {
      this._filters.splice(index, 1);
    }
    return this;
  }
  
  executeListeners(event: AnimationEvent) {
    if (!this._listeners.has(event.type)) return;
    
    const subscriptions = [...this._listeners.get(event.type) || []];
    subscriptions.forEach(subscription => {
      if (subscription.isActive()) {
        subscription.getListener()(event);
      }
    });
  }
  
  createEvent(type: string, target: string, data?: unknown) {
    return {
      type,
      target,
      data,
      timestamp: Date.now()
    } as AnimationEvent;
  }
  
  clearListeners(type?: string) {
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
  
  destroy() {
    // Cleanup resources
  }
}

// MockSubscriptionImpl class implementation
class MockSubscriptionImpl implements MockSubscription {
  _active = true;
  _type: string;
  _listener: MockEventListenerType;
  _unsubscribeFn: () => void;
  
  constructor(type: string, listener: MockEventListenerType, unsubscribeFn: () => void) {
    this._type = type;
    this._listener = listener;
    this._unsubscribeFn = unsubscribeFn;
  }
  
  isActive(): boolean {
    return this._active;
  }
  
  unsubscribe(): void {
    if (this._active) {
      this._active = false;
      this._unsubscribeFn();
    }
  }
  
  getType(): string {
    return this._type;
  }
  
  getListener(): MockEventListenerType {
    return this._listener;
  }
}

// Create the mock event bus before tests run
const mockBus = new MockEventBus();

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
    const customBus = mockBus as unknown as AnimationEventBus;
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
    const customBus = mockBus as unknown as AnimationEventBus;
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.on(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      mockBus.emit(mockAnimationEventTypes.START, 'test-target', { value: 123 });
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
    const customBus = mockBus as unknown as AnimationEventBus;
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.once(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
  });
  
  it('should unsubscribe from events', () => {
    const customBus = mockBus as unknown as AnimationEventBus;
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.on(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    act(() => {
      result.current.off(mockAnimationEventTypes.START, listener);
    });
    
    act(() => {
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
  
  it('should emit events', () => {
    const customBus = mockBus as unknown as AnimationEventBus;
    const listener = jest.fn();
    
    act(() => {
      mockBus.on(mockAnimationEventTypes.START, listener);
      mockBus.on(mockAnimationEventTypes.COMPLETE, listener);
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
    const customBus = mockBus as unknown as AnimationEventBus;
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
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
      mockBus.emit(mockAnimationEventTypes.COMPLETE, 'test-target');
    });
    
    expect(startListener).toHaveBeenCalledTimes(1);
    expect(completeListener).toHaveBeenCalledTimes(1);
  });
  
  it('should not set up initial events when immediate is false', () => {
    const customBus = mockBus as unknown as AnimationEventBus;
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
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(startListener).toHaveBeenCalledTimes(0);
  });
  
  it('should clean up subscriptions on unmount', () => {
    const customBus = mockBus as unknown as AnimationEventBus;
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
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    // Unmount the hook
    unmount();
    
    // Should not receive event after unmount
    act(() => {
      mockBus.emit(mockAnimationEventTypes.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
}); 