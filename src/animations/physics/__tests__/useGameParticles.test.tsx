/**
 * Tests for the useGameParticles hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameParticles, GameParticlesHookConfig } from '../useGameParticles';
import { GameEventType } from '../GameParticleSystem';

// Mock GameParticleSystem
jest.mock('../GameParticleSystem', () => {
  const mockBurst = jest.fn();
  const mockCreateTrail = jest.fn().mockReturnValue('mock-emitter-id');
  const mockTriggerEvent = jest.fn();
  const mockAddEmitter = jest.fn().mockReturnValue('mock-emitter-id');
  const mockRemoveEmitter = jest.fn().mockReturnValue(true);
  const mockUpdateEmitter = jest.fn().mockReturnValue(true);
  const mockStart = jest.fn();
  const mockStop = jest.fn();
  const mockPause = jest.fn();
  const mockResume = jest.fn();
  const mockDispose = jest.fn();
  
  class MockGameParticleSystem {
    isActive = false;
    isPaused = false;
    
    constructor(config: any) {
      this.isActive = config.autoStart || false;
    }
    
    burst = mockBurst;
    createTrail = mockCreateTrail;
    triggerEvent = mockTriggerEvent;
    addEmitter = mockAddEmitter;
    removeEmitter = mockRemoveEmitter;
    updateEmitter = mockUpdateEmitter;
    start = mockStart;
    stop = mockStop;
    pause = mockPause;
    resume = mockResume;
    dispose = mockDispose;
  }
  
  return {
    GameParticleSystem: MockGameParticleSystem,
    createGameParticleSystem: (eventType: any, config: any) => new MockGameParticleSystem({
      eventType,
      ...config
    }),
    GameEventType: {
      SUCCESS: 'success',
      ERROR: 'error',
      REWARD: 'reward',
      EXPLOSION: 'explosion',
      SPARKLE: 'sparkle',
      TRAIL: 'trail',
      IMPACT: 'impact',
      COLLECT: 'collect',
      ENERGY: 'energy',
      CUSTOM: 'custom'
    },
    EmitterShape: {
      POINT: 'point',
      CIRCLE: 'circle',
      RECTANGLE: 'rectangle',
      LINE: 'line'
    },
    ParticleShape: {
      CIRCLE: 'circle',
      SQUARE: 'square',
      TRIANGLE: 'triangle',
      STAR: 'star',
      CUSTOM: 'custom',
      IMAGE: 'image'
    },
    ParticleAnimationType: {
      FADE: 'fade',
      SCALE: 'scale',
      ROTATE: 'rotate',
      COLOR: 'color',
      COMBINED: 'combined'
    },
    // Expose the mock functions for testing
    __mocks__: {
      mockBurst,
      mockCreateTrail,
      mockTriggerEvent,
      mockAddEmitter,
      mockRemoveEmitter,
      mockUpdateEmitter,
      mockStart,
      mockStop,
      mockPause,
      mockResume,
      mockDispose
    }
  };
});

// Import the mocked module
import * as GameParticleSystemModule from '../GameParticleSystem';

// Access the mocks via the imported module (with type assertion)
const mocks = (GameParticleSystemModule as any).__mocks__;

// Mock useReducedMotion
jest.mock('../../accessibility/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue({
    prefersReducedMotion: false,
    isAnimationAllowed: jest.fn().mockReturnValue(true)
  })
}));

describe('useGameParticles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('initializes with default options', () => {
    const { result } = renderHook(() => useGameParticles());
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.reducedMotion).toBe(false);
    expect(result.current.system).toBeDefined();
    expect(result.current.actions).toBeDefined();
  });
  
  test('initializes with autoStart option', () => {
    const { result } = renderHook(() => useGameParticles({ autoStart: true }));
    
    expect(result.current.isActive).toBe(true);
  });
  
  test('exposes actions for controlling particles', () => {
    const { result } = renderHook(() => useGameParticles());
    
    expect(result.current.actions.burst).toBeDefined();
    expect(result.current.actions.createTrail).toBeDefined();
    expect(result.current.actions.triggerEvent).toBeDefined();
    expect(result.current.actions.addEmitter).toBeDefined();
    expect(result.current.actions.removeEmitter).toBeDefined();
    expect(result.current.actions.updateEmitter).toBeDefined();
    expect(result.current.actions.start).toBeDefined();
    expect(result.current.actions.stop).toBeDefined();
    expect(result.current.actions.pause).toBeDefined();
    expect(result.current.actions.resume).toBeDefined();
    expect(result.current.actions.handleEvent).toBeDefined();
    expect(result.current.actions.createHandlers).toBeDefined();
  });
  
  test('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useGameParticles());
    
    unmount();
    
    expect(mocks.mockDispose).toHaveBeenCalled();
  });
  
  describe('Action Methods', () => {
    test('burst action triggers a particle burst', () => {
      const { result } = renderHook(() => useGameParticles());
      
      act(() => {
        result.current.actions.burst({ x: 100, y: 100 });
      });
      
      expect(mocks.mockBurst).toHaveBeenCalledWith(
        { x: 100, y: 100 }, 
        expect.any(Object)
      );
      expect(result.current.isActive).toBe(true);
    });
    
    test('createTrail action creates a particle trail', () => {
      const mockElement = document.createElement('div');
      const { result } = renderHook(() => useGameParticles());
      
      let emitterId = '';
      act(() => {
        emitterId = result.current.actions.createTrail(mockElement);
      });
      
      expect(mocks.mockCreateTrail).toHaveBeenCalledWith(
        mockElement, 
        expect.any(Object)
      );
      expect(emitterId).toBe('mock-emitter-id');
      expect(result.current.isActive).toBe(true);
    });
    
    test('triggerEvent action triggers a preset event', () => {
      const { result } = renderHook(() => useGameParticles());
      
      act(() => {
        result.current.actions.triggerEvent(GameEventType.SUCCESS, { x: 100, y: 100 });
      });
      
      expect(mocks.mockTriggerEvent).toHaveBeenCalledWith(
        GameEventType.SUCCESS, 
        { x: 100, y: 100 }
      );
      expect(result.current.isActive).toBe(true);
    });
    
    test('addEmitter action adds a new emitter', () => {
      const { result } = renderHook(() => useGameParticles());
      
      let emitterId = '';
      act(() => {
        emitterId = result.current.actions.addEmitter({
          position: { x: 100, y: 100, z: 0 },
          burstCount: 10
        });
      });
      
      expect(mocks.mockAddEmitter).toHaveBeenCalledWith({
        position: { x: 100, y: 100, z: 0 },
        burstCount: 10
      });
      expect(emitterId).toBe('mock-emitter-id');
      expect(result.current.isActive).toBe(true);
    });
    
    test('removeEmitter action removes an emitter', () => {
      const { result } = renderHook(() => useGameParticles());
      
      let success = false;
      act(() => {
        success = result.current.actions.removeEmitter('test-emitter');
      });
      
      expect(mocks.mockRemoveEmitter).toHaveBeenCalledWith('test-emitter');
      expect(success).toBe(true);
    });
    
    test('updateEmitter action updates an emitter', () => {
      const { result } = renderHook(() => useGameParticles());
      
      let success = false;
      act(() => {
        success = result.current.actions.updateEmitter('test-emitter', {
          position: { x: 200, y: 200, z: 0 }
        });
      });
      
      expect(mocks.mockUpdateEmitter).toHaveBeenCalledWith('test-emitter', {
        position: { x: 200, y: 200, z: 0 }
      });
      expect(success).toBe(true);
    });
    
    test('start action starts the particle system', () => {
      const { result } = renderHook(() => useGameParticles());
      
      act(() => {
        result.current.actions.start();
      });
      
      expect(mocks.mockStart).toHaveBeenCalled();
      expect(result.current.isActive).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });
    
    test('stop action stops the particle system', () => {
      const { result } = renderHook(() => useGameParticles());
      
      act(() => {
        result.current.actions.stop();
      });
      
      expect(mocks.mockStop).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });
    
    test('pause action pauses the particle system', () => {
      const { result } = renderHook(() => useGameParticles());
      
      act(() => {
        result.current.actions.pause();
      });
      
      expect(mocks.mockPause).toHaveBeenCalled();
      expect(result.current.isPaused).toBe(true);
    });
    
    test('resume action resumes the particle system', () => {
      const { result } = renderHook(() => useGameParticles());
      
      // First pause
      act(() => {
        result.current.actions.pause();
      });
      
      expect(result.current.isPaused).toBe(true);
      
      // Then resume
      act(() => {
        result.current.actions.resume();
      });
      
      expect(mocks.mockResume).toHaveBeenCalled();
      expect(result.current.isPaused).toBe(false);
    });
    
    test('handleEvent triggers an event from a mouse event', () => {
      const { result } = renderHook(() => useGameParticles());
      
      const mockEvent = {
        clientX: 100,
        clientY: 100
      } as MouseEvent;
      
      act(() => {
        result.current.actions.handleEvent(mockEvent, GameEventType.SPARKLE);
      });
      
      expect(mocks.mockTriggerEvent).toHaveBeenCalledWith(
        GameEventType.SPARKLE, 
        mockEvent
      );
    });
    
    test('createHandlers returns a set of event handlers', () => {
      const { result } = renderHook(() => useGameParticles());
      
      const handlers = result.current.actions.createHandlers();
      
      expect(handlers.onClick).toBeDefined();
      expect(handlers.onHover).toBeDefined();
      expect(handlers.onSuccess).toBeDefined();
      expect(handlers.onError).toBeDefined();
      expect(handlers.onCollect).toBeDefined();
    });
  });
});