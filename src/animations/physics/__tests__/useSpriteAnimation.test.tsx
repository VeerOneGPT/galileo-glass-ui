/**
 * Tests for the useSpriteAnimation hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useSpriteAnimation, PlaybackMode } from '../useSpriteAnimation';
import * as SpriteAnimation from '../SpriteAnimation';
import {
  SpriteAnimationManager,
  SpriteAnimation as SpriteAnimationType,
  SpriteFrame,
  Spritesheet,
  PlaybackMode as SpriteAnimationPlaybackMode,
  SpriteSheetManager,
  createAnimationFromSpritesheet as actualCreateFromSpritesheet,
  createFrameAnimation as actualCreateFromFrames
} from '../SpriteAnimation';

// Mock useReducedMotion
jest.mock('../../accessibility/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue({
    prefersReducedMotion: false,
    isAnimationAllowed: jest.fn().mockReturnValue(true)
  })
}));

// Mock functions for instance methods
const mockPlay = jest.fn();
const mockStop = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();
const mockSetSpeed = jest.fn();
const mockGotoFrame = jest.fn();
const mockRegisterAnimation = jest.fn();
const mockRegisterAnimations = jest.fn();
const mockOnFrameChange = jest.fn();
const mockOnAnimationComplete = jest.fn();
const mockOnAnimationLoop = jest.fn();
const mockIsPlaying = jest.fn().mockReturnValue(false);
const mockIsPaused = jest.fn().mockReturnValue(false);
const mockIsComplete = jest.fn().mockReturnValue(false);
const mockGetCurrentFrameIndex = jest.fn().mockReturnValue(0);
const mockGetCurrentAnimation = jest.fn().mockReturnValue(null);
const mockSetElement = jest.fn();
const mockSetReducedMotion = jest.fn();
const mockDispose = jest.fn();
const mockGetAnimation = jest.fn();

// Mock functions for SpritesheetManager
const mockRegisterSheet = jest.fn();
const mockGetSheet = jest.fn().mockReturnValue({
  src: 'test.png',
  frameWidth: 32,
  frameHeight: 32,
  framesPerRow: 4,
  frameCount: 8
});

// Mock functions for static methods
const mockStaticCreateFromSpritesheet = jest.fn().mockReturnValue({ id: 'mock-sprite-anim', name: 'Mock Sprite Anim', frames: [] });
const mockStaticCreateFromFrames = jest.fn().mockReturnValue({ id: 'mock-frame-anim', name: 'Mock Frame Anim', frames: [] });

// Mock the entire module
jest.mock('../SpriteAnimation', () => {
  return {
    __esModule: true,
    SpriteAnimationManager: jest.fn().mockImplementation(() => ({
      play: mockPlay,
      stop: mockStop,
      pause: mockPause,
      resume: mockResume,
      setSpeed: mockSetSpeed,
      gotoFrame: mockGotoFrame,
      registerAnimation: mockRegisterAnimation,
      registerAnimations: mockRegisterAnimations,
      getAnimation: mockGetAnimation,
      onFrameChange: mockOnFrameChange,
      onAnimationComplete: mockOnAnimationComplete,
      onAnimationLoop: mockOnAnimationLoop,
      isPlaying: mockIsPlaying,
      isPaused: mockIsPaused,
      isComplete: mockIsComplete,
      getCurrentFrameIndex: mockGetCurrentFrameIndex,
      getCurrentAnimation: mockGetCurrentAnimation,
      setElement: mockSetElement,
      setReducedMotion: mockSetReducedMotion,
      dispose: mockDispose,
    })),
    SpriteSheetManager: {
      getInstance: jest.fn().mockReturnValue({
        registerSheet: mockRegisterSheet,
        getSheet: mockGetSheet,
      }),
    },
    createAnimationFromSpritesheet: mockStaticCreateFromSpritesheet,
    createFrameAnimation: mockStaticCreateFromFrames,
    PlaybackMode: {
      ONCE: 'once',
      LOOP: 'loop',
      PING_PONG: 'ping-pong',
      HOLD: 'hold'
    },
  };
});

// Sample animation object
const testAnimation: SpriteAnimationType = {
  id: 'test-animation',
  name: 'Test Animation',
  frames: [
    {
      id: 'test_1',
      src: 'test1.png',
      width: 64,
      height: 64,
      duration: 100
    },
    {
      id: 'test_2',
      src: 'test2.png',
      width: 64,
      height: 64,
      duration: 100
    }
  ],
  playbackMode: PlaybackMode.LOOP
};

describe('useSpriteAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('initializes with default options', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    const [state, actions] = result.current;
    
    // Check initial state
    expect(state.currentAnimation).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.isComplete).toBe(false);
    expect(state.speed).toBe(1);
    
    // Check that actions are available
    expect(actions.play).toBeDefined();
    expect(actions.stop).toBeDefined();
    expect(actions.pause).toBeDefined();
    expect(actions.resume).toBeDefined();
    expect(actions.setSpeed).toBeDefined();
    expect(actions.gotoFrame).toBeDefined();
    expect(actions.registerAnimation).toBeDefined();
    expect(actions.registerAnimations).toBeDefined();
    expect(actions.registerSpritesheet).toBeDefined();
    expect(actions.createFromSpritesheet).toBeDefined();
    expect(actions.createFromFrames).toBeDefined();
  });
  
  test('plays an animation', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    act(() => {
      const [, actions] = result.current;
      actions.play('test-animation');
    });
    
    const [state] = result.current;
    expect(state.currentAnimation).toBe('test-animation');
    expect(state.isPlaying).toBe(true);
    
    expect(mockPlay).toHaveBeenCalledWith('test-animation', true);
  });
  
  test('stops an animation', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    act(() => {
      const [, actions] = result.current;
      actions.stop();
    });
    
    expect(mockStop).toHaveBeenCalled();
    
    const [state] = result.current;
    expect(state.isPlaying).toBe(false);
    expect(state.isPaused).toBe(false);
  });
  
  test('pauses and resumes an animation', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    act(() => { result.current[1].pause(); });
    expect(result.current[0].isPaused).toBe(true);
    
    const mockPause = jest.requireMock('../SpriteAnimation').SpriteAnimationManager.mock.results[0]?.value.pause;
    expect(mockPause).toHaveBeenCalled();
    
    act(() => { result.current[1].resume(); });
    expect(result.current[0].isPaused).toBe(false);
    
    const mockResume = jest.requireMock('../SpriteAnimation').SpriteAnimationManager.mock.results[0]?.value.resume;
    expect(mockResume).toHaveBeenCalled();
  });
  
  test('sets animation speed', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    act(() => { result.current[1].setSpeed(2.5); });
    
    const [state] = result.current;
    expect(state.speed).toBe(2.5);
    
    const mockSetSpeed = jest.requireMock('../SpriteAnimation').SpriteAnimationManager.mock.results[0]?.value.setSpeed;
    expect(mockSetSpeed).toHaveBeenCalledWith(2.5);
  });
  
  test('goes to a specific frame', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    act(() => { result.current[1].gotoFrame(1); });
    
    const mockGotoFrame = jest.requireMock('../SpriteAnimation').SpriteAnimationManager.mock.results[0]?.value.gotoFrame;
    expect(mockGotoFrame).toHaveBeenCalledWith(1);
  });
  
  test('registers animations', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    act(() => { result.current[1].registerAnimation(testAnimation); });
    
    const mockRegisterAnimation = jest.requireMock('../SpriteAnimation').SpriteAnimationManager.mock.results[0]?.value.registerAnimation;
    expect(mockRegisterAnimation).toHaveBeenCalledWith(testAnimation);
  });
  
  test('registers multiple animations', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    const animations = [
      testAnimation,
      { ...testAnimation, id: 'test-animation-2' }
    ];
    
    act(() => { result.current[1].registerAnimations(animations); });
    
    const mockRegisterAnimations = jest.requireMock('../SpriteAnimation').SpriteAnimationManager.mock.results[0]?.value.registerAnimations;
    expect(mockRegisterAnimations).toHaveBeenCalledWith(animations);
  });
  
  test('registers spritesheet', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    const spritesheet: Spritesheet = {
      src: 'spritesheet.png',
      frameWidth: 32,
      frameHeight: 32,
      framesPerRow: 4,
      frameCount: 8
    };
    
    act(() => { result.current[1].registerSpritesheet('test-sheet', spritesheet); });
    
    expect(mockRegisterSheet).toHaveBeenCalledWith('test-sheet', spritesheet);
  });
  
  test('creates animation from spritesheet', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    let animation: SpriteAnimationType | null = null;
    const options = {
      startFrame: 0,
      endFrame: 3,
      frameDuration: 100,
      playbackMode: PlaybackMode.LOOP
    };

    act(() => {
      animation = result.current[1].createFromSpritesheet(
        'sprite-anim',
        'Sprite Animation',
        'test-sheet',
        options
      );
    });
    
    expect(mockStaticCreateFromSpritesheet).toHaveBeenCalledWith(
      'sprite-anim',
      'Sprite Animation',
      expect.anything(),
      options
    );
    expect(animation).not.toBeNull();
    expect(animation?.id).toBe('mock-sprite-anim');
    
    expect(mockGetSheet).toHaveBeenCalledWith('test-sheet');
    
    const MockSpriteAnimationManager = jest.requireMock('../SpriteAnimation').SpriteAnimationManager;
    const managerInstanceMock = MockSpriteAnimationManager.mock.results[0]?.value;
    expect(managerInstanceMock?.registerAnimation).toHaveBeenCalledWith(animation);
  });
  
  test('creates animation from frames', () => {
    const { result } = renderHook(() => useSpriteAnimation());
    
    let animation: SpriteAnimationType | null = null;
    const frameSources = ['frame1.png', 'frame2.png', 'frame3.png'];
    const options = {
      frameWidth: 64,
      frameHeight: 64,
      frameDuration: 100,
      playbackMode: PlaybackMode.LOOP
    };

    act(() => {
      animation = result.current[1].createFromFrames(
        'frame-anim',
        'Frame Animation',
        frameSources,
        options
      );
    });
    
    expect(mockStaticCreateFromFrames).toHaveBeenCalledWith(
      'frame-anim',
      'Frame Animation',
      frameSources,
      options
    );
    expect(animation).not.toBeNull();
    expect(animation?.id).toBe('mock-frame-anim');

    const MockSpriteAnimationManager = jest.requireMock('../SpriteAnimation').SpriteAnimationManager;
    const managerInstanceMock = MockSpriteAnimationManager.mock.results[0]?.value;
    expect(managerInstanceMock?.registerAnimation).toHaveBeenCalledWith(animation);
  });
  
  test('cleans up resources on unmount with autoCleanup', () => {
    const { unmount } = renderHook(() => useSpriteAnimation({
      autoCleanup: true
    }));
    
    unmount();
    
    expect(mockDispose).toHaveBeenCalled();
  });
  
  test('plays initial animation with autoPlay', () => {
    renderHook(() => useSpriteAnimation({
      initialAnimation: 'initial-anim',
      autoPlay: true
    }));
    
    expect(mockPlay).toHaveBeenCalledWith('initial-anim');
  });
});