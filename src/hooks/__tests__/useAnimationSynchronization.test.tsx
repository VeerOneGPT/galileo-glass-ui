/**
 * Tests for useAnimationSynchronization hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAnimationSynchronization } from '../useAnimationSynchronization';
import { 
  SyncGroupState, 
  SynchronizationStrategy,
  animationSynchronizer
} from '../../animations/orchestration/AnimationSynchronizer';

// Mock AnimationSynchronizer
jest.mock('../../animations/orchestration/AnimationSynchronizer', () => {
  const originalModule = jest.requireActual('../../animations/orchestration/AnimationSynchronizer');
  
  // Mock SynchronizedGroup
  class MockSynchronizedGroup {
    state = originalModule.SyncGroupState.INITIALIZING;
    animations = new Map();
    listeners = new Map();
    
    addAnimation = jest.fn((animation) => {
      this.animations.set(animation.id, animation);
      return this;
    });
    
    addAnimations = jest.fn((animations) => {
      animations.forEach(anim => this.animations.set(anim.id, anim));
      return this;
    });
    
    removeAnimation = jest.fn((id) => {
      this.animations.delete(id);
      return this;
    });
    
    initialize = jest.fn(() => {
      this.state = originalModule.SyncGroupState.READY;
      return this;
    });
    
    play = jest.fn(() => {
      this.state = originalModule.SyncGroupState.PLAYING;
      return Promise.resolve();
    });
    
    pause = jest.fn(() => {
      this.state = originalModule.SyncGroupState.PAUSED;
      return this;
    });
    
    cancel = jest.fn(() => {
      this.state = originalModule.SyncGroupState.CANCELED;
      return this;
    });
    
    getState = jest.fn(() => this.state);
    
    getProgress = jest.fn(() => {
      if (this.state === originalModule.SyncGroupState.PLAYING) {
        return 0.5; // Mock progress
      } else if (this.state === originalModule.SyncGroupState.COMPLETED) {
        return 1;
      }
      return 0;
    });
    
    addSyncPointListener = jest.fn((animationId, listener) => {
      if (!this.listeners.has(animationId)) {
        this.listeners.set(animationId, new Set());
      }
      
      this.listeners.get(animationId).add(listener);
      return this;
    });
    
    removeSyncPointListener = jest.fn((animationId, listener) => {
      const listeners = this.listeners.get(animationId);
      
      if (listeners) {
        listeners.delete(listener);
      }
      
      return this;
    });
    
    connectStateMachine = jest.fn((animationId, stateMachine, stateMap) => {
      return this;
    });
    
    disconnectStateMachine = jest.fn((animationId) => {
      return this;
    });
  }
  
  // Mock AnimationSynchronizer
  class MockAnimationSynchronizer {
    groups = new Map();
    
    createSyncGroup = jest.fn((options) => {
      const group = new MockSynchronizedGroup();
      this.groups.set(options.id, group);
      return group;
    });
    
    getGroup = jest.fn((id) => {
      return this.groups.get(id);
    });
    
    removeGroup = jest.fn((id) => {
      if (this.groups.has(id)) {
        this.groups.delete(id);
        return true;
      }
      return false;
    });
    
    getGroupIds = jest.fn(() => {
      return Array.from(this.groups.keys());
    });
    
    createDefaultSyncPoints = jest.fn(() => {
      return [
        {
          id: 'start',
          name: 'Start',
          phase: originalModule.AnimationPhase.START,
          position: 0
        },
        {
          id: 'middle',
          name: 'Middle',
          phase: originalModule.AnimationPhase.MIDDLE,
          position: 0.5
        },
        {
          id: 'end',
          name: 'End',
          phase: originalModule.AnimationPhase.END,
          position: 1
        }
      ];
    });
  }
  
  // Create mock instances
  const mockSynchronizer = new MockAnimationSynchronizer();
  
  return {
    ...originalModule,
    AnimationSynchronizer: MockAnimationSynchronizer,
    animationSynchronizer: mockSynchronizer,
    SynchronizedGroup: MockSynchronizedGroup
  };
});

// Mock useReducedMotion hook
jest.mock('../useReducedMotion', () => ({
  __esModule: true,
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

// Setup timers
jest.useFakeTimers();

describe('useAnimationSynchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should create a sync group and return proper controls', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group', {
        strategy: SynchronizationStrategy.COMMON_DURATION,
        duration: 1000
      })
    );
    
    expect(result.current).toHaveProperty('addAnimation');
    expect(result.current).toHaveProperty('play');
    expect(result.current).toHaveProperty('pause');
    expect(result.current).toHaveProperty('cancel');
    expect(result.current).toHaveProperty('groupState');
    expect(result.current).toHaveProperty('progress');
    expect(result.current.groupRef.current).toBeTruthy();
  });
  
  it('should initialize with autoInitialize option', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group', {
        autoInitialize: true
      })
    );
    
    expect(result.current.groupRef.current?.initialize).toHaveBeenCalled();
  });
  
  it('should auto-play with autoPlay option', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group', {
        autoInitialize: true,
        autoPlay: true
      })
    );
    
    expect(result.current.groupRef.current?.initialize).toHaveBeenCalled();
    expect(result.current.groupRef.current?.play).toHaveBeenCalled();
  });
  
  it('should add animations', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group')
    );
    
    act(() => {
      result.current.addAnimation({
        id: 'anim1',
        target: 'test1',
        animation: { 
          keyframes: { 
            name: 'test1', 
            id: 'test1', 
            rules: 'test1-rules',
            getName: () => 'test1'
          },
          duration: 1000,
          easing: 'ease-in-out'
        },
        duration: 1000
      });
    });
    
    expect(result.current.groupRef.current?.addAnimation).toHaveBeenCalledTimes(1);
  });
  
  it('should add multiple animations', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group')
    );
    
    act(() => {
      result.current.addAnimations([
        {
          id: 'anim1',
          target: 'test1',
          animation: { 
            keyframes: { 
              name: 'test1', 
              id: 'test1', 
              rules: 'test1-rules',
              getName: () => 'test1'
            },
            duration: 1000,
            easing: 'ease-in-out'
          },
          duration: 1000
        },
        {
          id: 'anim2',
          target: 'test2',
          animation: { 
            keyframes: { 
              name: 'test2', 
              id: 'test2', 
              rules: 'test2-rules',
              getName: () => 'test2'
            },
            duration: 2000,
            easing: 'ease-out'
          },
          duration: 2000
        }
      ]);
    });
    
    expect(result.current.groupRef.current?.addAnimations).toHaveBeenCalledTimes(1);
    expect(result.current.groupRef.current?.addAnimations).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'anim1' }),
        expect.objectContaining({ id: 'anim2' })
      ])
    );
  });
  
  it('should initialize the group', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group')
    );
    
    act(() => {
      result.current.initialize();
    });
    
    expect(result.current.groupRef.current?.initialize).toHaveBeenCalledTimes(1);
  });
  
  it('should play, pause, and cancel animations', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group')
    );
    
    act(() => {
      result.current.initialize();
    });
    
    expect(result.current.groupRef.current?.initialize).toHaveBeenCalledTimes(1);
    
    act(() => {
      result.current.play();
    });
    
    expect(result.current.groupRef.current?.play).toHaveBeenCalledTimes(1);
    // Advance timers to allow the interval to update the state
    // act(() => {
    //   jest.advanceTimersByTime(20); // Advance by more than the interval (16ms)
    // });
    
    act(() => {
      result.current.pause();
    });
    
    expect(result.current.groupRef.current?.pause).toHaveBeenCalledTimes(1);
    
    act(() => {
      result.current.cancel();
    });
    
    expect(result.current.groupRef.current?.cancel).toHaveBeenCalledTimes(1);
  });
  
  it('should add and remove sync point listeners', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group')
    );
    
    const listener = jest.fn();
    
    act(() => {
      result.current.addSyncPointListener('anim1', listener);
    });
    
    expect(result.current.groupRef.current?.addSyncPointListener).toHaveBeenCalledWith(
      'anim1',
      listener
    );
    
    act(() => {
      result.current.removeSyncPointListener('anim1', listener);
    });
    
    expect(result.current.groupRef.current?.removeSyncPointListener).toHaveBeenCalledWith(
      'anim1',
      listener
    );
  });
  
  it('should connect and disconnect state machines', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group')
    );
    
    const mockStateMachine = {};
    const stateMap = { start: 'initial', middle: 'active', end: 'final' };
    
    act(() => {
      result.current.connectStateMachine('anim1', mockStateMachine, stateMap);
    });
    
    expect(result.current.groupRef.current?.connectStateMachine).toHaveBeenCalledWith(
      'anim1',
      mockStateMachine,
      stateMap
    );
  });
  
  it('should create default sync points', () => {
    const { result } = renderHook(() => 
      useAnimationSynchronization('test-group')
    );
    
    const syncPoints = result.current.createDefaultSyncPoints();
    
    expect(syncPoints).toHaveLength(3);
    expect(syncPoints[0].id).toBe('start');
    expect(syncPoints[1].id).toBe('middle');
    expect(syncPoints[2].id).toBe('end');
  });
  
  it('should clean up on unmount', () => {
    const groupRef = { current: null };
    
    const { unmount } = renderHook(() => {
      const result = useAnimationSynchronization('test-group');
      groupRef.current = result.groupRef.current;
      return result;
    });
    
    unmount();
    
    // We can't easily test the cleanup directly due to closure scope,
    // but we can verify the group is created and then removed appropriately
    // jest.runAllTimers(); // Removed timer run
    expect(animationSynchronizer.removeGroup).toHaveBeenCalledWith('test-group');
  });
});