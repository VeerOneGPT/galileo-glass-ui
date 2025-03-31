/**
 * Tests for the SpriteAnimation system
 */

import {
  SpriteAnimationManager,
  SpriteSheetManager,
  SpriteAnimation,
  Spritesheet,
  PlaybackMode,
  createAnimationFromSpritesheet,
  createFrameAnimation
} from '../SpriteAnimation';

// Mock window.requestAnimationFrame and performance.now
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(() => callback(Date.now()), 0);
  return Math.floor(Math.random() * 1000);
});

global.cancelAnimationFrame = jest.fn();

global.performance = {
  now: jest.fn(() => Date.now()),
} as any;

// Mock HTMLElement and DOM methods
class MockElement {
  style: Record<string, any> = {};
  className = '';
  children: MockElement[] = [];
  
  appendChild = jest.fn((child: MockElement) => {
    this.children.push(child);
    return child;
  });
  
  remove = jest.fn(() => {
    this.style = {};
    this.className = '';
    this.children = [];
  });
  
  querySelector = jest.fn(() => null);
  querySelectorAll = jest.fn(() => []);
}

// Mock document and Image
global.document = {
  createElement: jest.fn(() => new MockElement()),
  querySelector: jest.fn(() => new MockElement()),
} as any;

// Mock Image
class MockImage {
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

global.Image = MockImage as any;

// Sample animations and spritesheets for testing
const testAnimation: SpriteAnimation = {
  id: 'test',
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
    },
    {
      id: 'test_3',
      src: 'test3.png',
      width: 64,
      height: 64,
      duration: 100
    }
  ],
  playbackMode: PlaybackMode.LOOP
};

const testSpritesheet: Spritesheet = {
  src: 'spritesheet.png',
  frameWidth: 32,
  frameHeight: 32,
  framesPerRow: 4,
  frameCount: 8,
  margin: 2,
  padding: 1
};

describe('SpriteAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('SpriteSheetManager', () => {
    test('getInstance returns a singleton instance', () => {
      const instance1 = SpriteSheetManager.getInstance();
      const instance2 = SpriteSheetManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    test('registerSheet adds a spritesheet', () => {
      const manager = SpriteSheetManager.getInstance();
      manager.registerSheet('test-sheet', testSpritesheet);
      
      const sheet = manager.getSheet('test-sheet');
      expect(sheet).toBeDefined();
      expect(sheet?.src).toBe(testSpritesheet.src);
    });
    
    test('getFrameCoordinates calculates correct frame coordinates', () => {
      const manager = SpriteSheetManager.getInstance();
      manager.registerSheet('coords-test', {
        src: 'test.png',
        frameWidth: 32,
        frameHeight: 32,
        framesPerRow: 4,
        frameCount: 8,
        margin: 2,
        padding: 1
      });
      
      // Test frame 0 (top-left)
      const frame0 = manager.getFrameCoordinates('coords-test', 0);
      expect(frame0).toEqual({
        x: 1, // padding
        y: 1, // padding
        width: 30, // frameWidth - padding*2
        height: 30 // frameHeight - padding*2
      });
      
      // Test frame 5 (second row, second column)
      const frame5 = manager.getFrameCoordinates('coords-test', 5);
      expect(frame5).toEqual({
        x: 35, // 1 + (32+2)*1
        y: 35, // 1 + (32+2)*1
        width: 30,
        height: 30
      });
    });
    
    test('getBackgroundPosition returns CSS position string', () => {
      const manager = SpriteSheetManager.getInstance();
      manager.registerSheet('bg-test', {
        src: 'test.png',
        frameWidth: 32,
        frameHeight: 32,
        framesPerRow: 4,
        frameCount: 8,
        margin: 0,
        padding: 0
      });
      
      const pos = manager.getBackgroundPosition('bg-test', 5);
      expect(pos).toBe('-32px -32px');
    });
  });
  
  describe('SpriteAnimationManager', () => {
    test('can be instantiated with default options', () => {
      const manager = new SpriteAnimationManager();
      expect(manager).toBeDefined();
    });
    
    test('can register and retrieve animations', () => {
      const manager = new SpriteAnimationManager();
      manager.registerAnimation(testAnimation);
      
      const retrievedAnimation = manager.getAnimation('test');
      expect(retrievedAnimation).toBe(testAnimation);
    });
    
    test('can register multiple animations at once', () => {
      const manager = new SpriteAnimationManager();
      const anim1 = { ...testAnimation, id: 'anim1' };
      const anim2 = { ...testAnimation, id: 'anim2' };
      
      manager.registerAnimations([anim1, anim2]);
      
      expect(manager.getAnimation('anim1')).toBe(anim1);
      expect(manager.getAnimation('anim2')).toBe(anim2);
    });
    
    test('play starts an animation', () => {
      const manager = new SpriteAnimationManager();
      manager.registerAnimation(testAnimation);
      
      // Mock requestAnimationFrame to capture calls
      const spy = jest.spyOn(window, 'requestAnimationFrame');
      
      // Start animation
      const result = manager.play('test');
      
      expect(result).toBe(true);
      expect(spy).toHaveBeenCalled();
      expect(manager.isPlaying()).toBe(true);
      expect(manager.getCurrentAnimation()).toBe(testAnimation);
    });
    
    test('stop ends an animation', () => {
      const manager = new SpriteAnimationManager();
      manager.registerAnimation(testAnimation);
      
      // Start and then stop
      manager.play('test');
      manager.stop();
      
      expect(manager.isPlaying()).toBe(false);
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
    
    test('pause and resume work correctly', () => {
      const manager = new SpriteAnimationManager();
      manager.registerAnimation(testAnimation);
      
      // Start, pause, and check state
      manager.play('test');
      manager.pause();
      
      expect(manager.isPaused()).toBe(true);
      expect(cancelAnimationFrame).toHaveBeenCalled();
      
      // Resume and check state
      const spy = jest.spyOn(window, 'requestAnimationFrame');
      manager.resume();
      
      expect(manager.isPaused()).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
    
    test('setSpeed changes animation speed', () => {
      const manager = new SpriteAnimationManager();
      
      expect(manager.getStats().speed).toBe(1); // Default speed
      
      manager.setSpeed(2);
      expect(manager.getStats().speed).toBe(2);
      
      manager.setSpeed(0.5);
      expect(manager.getStats().speed).toBe(0.5);
    });
    
    test('gotoFrame changes current frame', () => {
      const manager = new SpriteAnimationManager();
      manager.registerAnimation(testAnimation);
      manager.play('test');
      
      manager.gotoFrame(1);
      expect(manager.getCurrentFrameIndex()).toBe(1);
    });
    
    test('callbacks are invoked at appropriate times', () => {
      const manager = new SpriteAnimationManager();
      
      // Create animation with callbacks
      const callbackAnimation: SpriteAnimation = {
        ...testAnimation,
        id: 'callback-test',
        onStart: jest.fn(),
        onLoop: jest.fn(),
        onComplete: jest.fn()
      };
      
      // Add our own callbacks
      const frameChangeCallback = jest.fn();
      const completeCallback = jest.fn();
      const loopCallback = jest.fn();
      
      manager.onFrameChange(frameChangeCallback);
      manager.onAnimationComplete(completeCallback);
      manager.onAnimationLoop(loopCallback);
      
      // Register and play
      manager.registerAnimation(callbackAnimation);
      manager.play('callback-test');
      
      // Check that onStart was called
      expect(callbackAnimation.onStart).toHaveBeenCalled();
      
      // Manually advance frames to test frame change callback
      manager.gotoFrame(1);
      expect(frameChangeCallback).toHaveBeenCalled();
    });
    
    test('getStats returns correct animation statistics', () => {
      const manager = new SpriteAnimationManager();
      manager.registerAnimation(testAnimation);
      
      // Check initial stats
      let stats = manager.getStats();
      expect(stats.animationId).toBeUndefined();
      expect(stats.frameCount).toBe(0);
      expect(stats.isPlaying).toBe(false);
      
      // Start animation and check stats
      manager.play('test');
      
      stats = manager.getStats();
      expect(stats.animationId).toBe('test');
      expect(stats.frameCount).toBe(3);
      expect(stats.currentFrame).toBe(0);
      expect(stats.isPlaying).toBe(true);
      expect(stats.isPaused).toBe(false);
      expect(stats.loopCount).toBe(0);
    });
  });
  
  describe('Animation Creation Utilities', () => {
    test('createAnimationFromSpritesheet creates animation from spritesheet', () => {
      // Register the spritesheet first
      SpriteSheetManager.getInstance().registerSheet('sheet-test', testSpritesheet);
      
      const animation = createAnimationFromSpritesheet(
        'sheet-anim',
        'Spritesheet Animation',
        testSpritesheet,
        {
          startFrame: 1,
          endFrame: 3,
          frameDuration: 200,
          playbackMode: PlaybackMode.ONCE
        }
      );
      
      expect(animation.id).toBe('sheet-anim');
      expect(animation.name).toBe('Spritesheet Animation');
      expect(animation.frames.length).toBe(3); // 3 frames (1, 2, 3)
      expect(animation.frames[0].duration).toBe(200);
      expect(animation.playbackMode).toBe(PlaybackMode.ONCE);
    });
    
    test('createFrameAnimation creates animation from individual frames', () => {
      const animation = createFrameAnimation(
        'frame-anim',
        'Frame Animation',
        ['frame1.png', 'frame2.png', 'frame3.png'],
        {
          frameWidth: 100,
          frameHeight: 100,
          frameDuration: 300,
          playbackMode: PlaybackMode.PING_PONG
        }
      );
      
      expect(animation.id).toBe('frame-anim');
      expect(animation.name).toBe('Frame Animation');
      expect(animation.frames.length).toBe(3);
      expect(animation.frames[0].width).toBe(100);
      expect(animation.frames[0].height).toBe(100);
      expect(animation.frames[0].duration).toBe(300);
      expect(animation.playbackMode).toBe(PlaybackMode.PING_PONG);
    });
  });
});