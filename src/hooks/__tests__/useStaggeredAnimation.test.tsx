/**
 * Tests for useStaggeredAnimation hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useStaggeredAnimation } from '../useStaggeredAnimation';
import {
  DistributionPattern,
  StaggerDirection,
  GroupingStrategy,
  DistributionEasing,
  StaggerTarget,
  staggeredAnimator
} from '../../animations/orchestration/StaggeredAnimations';
import { keyframes } from 'styled-components';

// Create actual keyframes for testing
const testKeyframes = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Mock staggeredAnimator
jest.mock('../../animations/orchestration/StaggeredAnimations', () => {
  const originalModule = jest.requireActual('../../animations/orchestration/StaggeredAnimations');
  
  // Mock StaggerResult
  const mockStaggerResult = {
    delays: new Map(),
    durations: new Map(),
    totalDuration: 1000,
    order: [],
    play: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn()
  };
  
  // Mock staggeredAnimator
  const mockAnimator = {
    createAnimation: jest.fn().mockReturnValue(mockStaggerResult),
    play: jest.fn().mockImplementation(() => mockStaggerResult.play()),
    cancel: jest.fn().mockImplementation(() => mockStaggerResult.cancel()),
    getResult: jest.fn().mockReturnValue(mockStaggerResult),
    getConfig: jest.fn(),
    removeAnimation: jest.fn().mockReturnValue(true),
    clear: jest.fn(),
    setDebugMode: jest.fn().mockReturnThis()
  };
  
  // Mock createStaggeredAnimation
  const mockCreateStaggeredAnimation = jest.fn().mockReturnValue(mockStaggerResult);
  
  return {
    ...originalModule,
    staggeredAnimator: mockAnimator,
    createStaggeredAnimation: mockCreateStaggeredAnimation
  };
});

// Mock useReducedMotion hook
jest.mock('../useReducedMotion', () => ({
  __esModule: true,
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

// Mock performance.now
let mockTime = 0;
const originalPerformanceNow = performance.now;
global.performance.now = jest.fn(() => mockTime);

describe('useStaggeredAnimation', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
  });
  
  // Restore performance.now after tests
  afterAll(() => {
    performance.now = originalPerformanceNow;
  });
  
  it('should create the hook with minimal options', () => {
    const { result } = renderHook(() => useStaggeredAnimation());
    
    expect(result.current).toHaveProperty('setTargets');
    expect(result.current).toHaveProperty('setAnimation');
    expect(result.current).toHaveProperty('createAnimation');
    expect(result.current).toHaveProperty('play');
    expect(result.current).toHaveProperty('cancel');
    expect(result.current).toHaveProperty('isPlaying', false);
    expect(result.current).toHaveProperty('progress', 0);
  });
  
  it('should initialize with autoCreate and autoPlay', () => {
    const { result } = renderHook(() => useStaggeredAnimation({
      autoCreate: true,
      autoPlay: true,
      initialConfig: {
        targets: [{ element: 'test' }],
        animation: { 
          keyframes: testKeyframes,
          duration: '300ms',
          easing: 'ease-out',
          fillMode: 'forwards'
        }
      }
    }));
    
    expect(staggeredAnimator.createAnimation).toHaveBeenCalled();
    expect(result.current.result).not.toBeNull();
    expect(result.current.result?.play).toHaveBeenCalled();
  });
  
  it('should set configuration options', () => {
    const { result } = renderHook(() => useStaggeredAnimation());
    
    // Set various configuration options
    act(() => {
      result.current.setTargets([{ element: 'test' }]);
      result.current.setDuration(500);
      result.current.setStaggerDelay(100);
      result.current.setPattern(DistributionPattern.FROM_CENTER);
      result.current.setDirection(StaggerDirection.LEFT_RIGHT);
      result.current.setGrouping(GroupingStrategy.CATEGORY);
      result.current.setEasing(DistributionEasing.EASE_OUT);
    });
    
    // Create animation with updated config
    act(() => {
      result.current.createAnimation();
    });
    
    // Config should be updated
    expect(result.current.config).toHaveProperty('targets');
    expect(result.current.config).toHaveProperty('duration', 500);
    expect(result.current.config).toHaveProperty('staggerDelay', 100);
    expect(result.current.config).toHaveProperty('pattern', DistributionPattern.FROM_CENTER);
    expect(result.current.config).toHaveProperty('direction', StaggerDirection.LEFT_RIGHT);
    expect(result.current.config).toHaveProperty('grouping', GroupingStrategy.CATEGORY);
    expect(result.current.config).toHaveProperty('easing', DistributionEasing.EASE_OUT);
  });
  
  it('should play and cancel animations', async () => {
    const { result } = renderHook(() => useStaggeredAnimation({
      initialConfig: {
        targets: [{ element: 'test' }],
        animation: { 
          keyframes: testKeyframes,
          duration: '300ms',
          easing: 'ease-out',
          fillMode: 'forwards'
        }
      }
    }));
    
    // Create animation
    act(() => {
      result.current.createAnimation();
    });
    
    // Play animation
    act(() => {
      result.current.play();
    });
    
    // Should be playing
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.progress).toBe(0);
    
    // Advance time to simulate animation progress
    mockTime = 500;
    
    // Manually trigger the progress interval
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Progress should be updated
    expect(result.current.progress).toBeGreaterThan(0);
    
    // Cancel animation
    act(() => {
      result.current.cancel();
    });
    
    // Should not be playing
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.progress).toBe(0);
  });
  
  it('should register and track element refs', () => {
    const { result } = renderHook(() => useStaggeredAnimation());
    
    // Mock elements
    const mockElement1 = document.createElement('div');
    const mockElement2 = document.createElement('div');
    
    // Register refs
    act(() => {
      result.current.registerRef('element1', mockElement1);
      result.current.registerRef('element2', mockElement2);
    });
    
    // Get registered elements
    const elements = result.current.getRegisteredElements();
    
    // Check elements
    expect(elements.size).toBe(2);
    expect(elements.get('element1')).toBe(mockElement1);
    expect(elements.get('element2')).toBe(mockElement2);
    
    // Unregister a ref
    act(() => {
      result.current.registerRef('element1', null);
    });
    
    // Check elements again
    const updatedElements = result.current.getRegisteredElements();
    expect(updatedElements.size).toBe(1);
    expect(updatedElements.has('element1')).toBe(false);
    expect(updatedElements.get('element2')).toBe(mockElement2);
  });
  
  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useStaggeredAnimation({
      initialConfig: {
        targets: [{ element: 'test' }],
        animation: { 
          keyframes: testKeyframes,
          duration: '300ms',
          easing: 'ease-out',
          fillMode: 'forwards'
        }
      }
    }));
    
    // Create a spy on clearInterval
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    // Unmount the hook
    unmount();
    
    // Should have cleared any intervals
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    // Restore the spy
    clearIntervalSpy.mockRestore();
  });
});