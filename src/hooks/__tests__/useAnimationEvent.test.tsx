/**
 * Tests for useAnimationEvent hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAnimationEvent } from '../useAnimationEvent';
import {
  AnimationEventBus,
  AnimationEventType
} from '../../animations/orchestration/AnimationEventSystem';

// Mock performance.now for consistent timestamps
let mockTime = 0;
const originalPerformanceNow = performance.now;
global.performance.now = jest.fn(() => mockTime);

describe('useAnimationEvent', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
  });
  
  // Restore performance.now after tests
  afterAll(() => {
    performance.now = originalPerformanceNow;
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
    const customBus = new AnimationEventBus();
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
    const customBus = new AnimationEventBus();
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.on(AnimationEventType.START, listener);
    });
    
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target', { value: 123 });
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AnimationEventType.START,
        target: 'test-target',
        data: { value: 123 }
      })
    );
  });
  
  it('should subscribe once and receive only one notification', () => {
    const customBus = new AnimationEventBus();
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.once(AnimationEventType.START, listener);
    });
    
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target');
      customBus.emit(AnimationEventType.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
  });
  
  it('should unsubscribe from events', () => {
    const customBus = new AnimationEventBus();
    const listener = jest.fn();
    
    const { result } = renderHook(() => 
      useAnimationEvent({ eventBus: customBus })
    );
    
    act(() => {
      result.current.on(AnimationEventType.START, listener);
    });
    
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    act(() => {
      result.current.off(AnimationEventType.START, listener);
    });
    
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
  
  it('should emit events', () => {
    const customBus = new AnimationEventBus();
    const listener = jest.fn();
    
    customBus.on(AnimationEventType.START, listener);
    
    const { result } = renderHook(() => 
      useAnimationEvent({ 
        eventBus: customBus,
        id: 'test-component'
      })
    );
    
    act(() => {
      result.current.emit(AnimationEventType.START, 'custom-target', { value: 123 });
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AnimationEventType.START,
        target: 'custom-target',
        data: { value: 123 }
      })
    );
    
    // Without explicit target, should use component ID
    act(() => {
      result.current.emit(AnimationEventType.COMPLETE);
    });
    
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: AnimationEventType.COMPLETE,
        target: 'test-component'
      })
    );
  });
  
  it('should set up initial events when immediate is true', () => {
    const customBus = new AnimationEventBus();
    const startListener = jest.fn();
    const completeListener = jest.fn();
    
    renderHook(() => 
      useAnimationEvent({
        eventBus: customBus,
        immediate: true,
        events: [
          {
            type: AnimationEventType.START,
            listener: startListener
          },
          {
            type: AnimationEventType.COMPLETE,
            listener: completeListener
          }
        ]
      })
    );
    
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target');
      customBus.emit(AnimationEventType.COMPLETE, 'test-target');
    });
    
    expect(startListener).toHaveBeenCalledTimes(1);
    expect(completeListener).toHaveBeenCalledTimes(1);
  });
  
  it('should not set up initial events when immediate is false', () => {
    const customBus = new AnimationEventBus();
    const startListener = jest.fn();
    
    renderHook(() => 
      useAnimationEvent({
        eventBus: customBus,
        immediate: false,
        events: [
          {
            type: AnimationEventType.START,
            listener: startListener
          }
        ]
      })
    );
    
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target');
    });
    
    expect(startListener).toHaveBeenCalledTimes(0);
  });
  
  it('should clean up subscriptions on unmount', () => {
    const customBus = new AnimationEventBus();
    const listener = jest.fn();
    
    const { unmount } = renderHook(() => {
      const hook = useAnimationEvent({ eventBus: customBus });
      hook.on(AnimationEventType.START, listener);
      return hook;
    });
    
    // Should receive event before unmount
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    // Unmount the hook
    unmount();
    
    // Should not receive event after unmount
    act(() => {
      customBus.emit(AnimationEventType.START, 'test-target');
    });
    
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
});