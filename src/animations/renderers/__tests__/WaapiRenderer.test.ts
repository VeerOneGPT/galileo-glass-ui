/**
 * WaapiRenderer Tests
 * 
 * Tests for the Web Animations API renderer.
 */

import { WaapiRenderer } from '../WaapiRenderer';

// Create mock Animation class
class MockAnimation {
  playState = 'idle';
  currentTime: number | null = 0;
  playbackRate = 1;
  effect: any;
  private listeners: Record<string, Array<EventListenerOrEventListenerObject>> = {
    'finish': [],
    'cancel': [],
    'start': []
  };

  constructor(
    readonly element: Element,
    readonly keyframes: Keyframe[] | PropertyIndexedKeyframes,
    readonly options: KeyframeAnimationOptions
  ) {
    this.effect = {
      updateTiming: jest.fn()
    };
  }

  play() {
    this.playState = 'running';
  }

  pause() {
    this.playState = 'paused';
  }

  cancel() {
    this.playState = 'idle';
    this.callListeners('cancel', new AnimationPlaybackEvent('cancel', { currentTime: this.currentTime }));
  }

  reverse() {
    this.playbackRate *= -1;
  }

  finish() {
    this.playState = 'finished';
    this.callListeners('finish', new AnimationPlaybackEvent('finish', { currentTime: this.currentTime }));
  }

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject
  ) {
    if (this.listeners[type]) {
      this.listeners[type].push(callback);
    }
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject
  ) {
    if (this.listeners[type]) {
      const index = this.listeners[type].indexOf(callback);
      if (index !== -1) {
        this.listeners[type].splice(index, 1);
      }
    }
  }

  private callListeners(type: string, event: AnimationPlaybackEvent) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => {
        if (typeof listener === 'function') {
          listener(event);
        } else {
          listener.handleEvent(event);
        }
      });
    }
  }
}

// Create mock AnimationPlaybackEvent class
class AnimationPlaybackEvent {
  readonly type: string;
  readonly currentTime: number | null;

  constructor(type: string, init: { currentTime: number | null }) {
    this.type = type;
    this.currentTime = init.currentTime;
  }
}

// Mock Element.animate
Element.prototype.animate = function(
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions
): Animation {
  return new MockAnimation(this, keyframes, options) as unknown as Animation;
};

describe('WaapiRenderer', () => {
  let renderer: WaapiRenderer;
  let element: HTMLDivElement;

  beforeEach(() => {
    // Reset the DOM and create a fresh element
    document.body.innerHTML = '<div id="test-element"></div>';
    element = document.getElementById('test-element') as HTMLDivElement;
    
    // Create a new renderer
    renderer = new WaapiRenderer();

    // Spy on console.warn
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clear mocks
    jest.clearAllMocks();
  });

  describe('isSupported()', () => {
    it('should return true when Element.animate is available', () => {
      expect(WaapiRenderer.isSupported()).toBe(true);
    });

    it('should return false when Element.animate is not available', () => {
      const originalAnimate = Element.prototype.animate;
      delete (Element.prototype as any).animate;
      
      expect(WaapiRenderer.isSupported()).toBe(false);
      
      // Restore the animate method
      Element.prototype.animate = originalAnimate;
    });
  });

  describe('animate()', () => {
    it('should create a new animation with the provided keyframes and options', () => {
      const keyframes = [
        { transform: 'translateX(0px)' },
        { transform: 'translateX(100px)' }
      ];
      
      const options = {
        duration: 1000,
        easing: 'ease-in-out',
        fill: 'forwards' as FillMode
      };
      
      const { id, animation } = renderer.animate(element, keyframes, options);
      
      expect(id).toBeDefined();
      expect(id.startsWith('waapi-')).toBe(true);
      expect(animation).toBeDefined();
    });

    it('should handle invalid targets gracefully', () => {
      const { id, animation } = renderer.animate(null, [], {});
      
      expect(id).toBe('');
      expect(animation).toBeNull();
    });

    it('should trigger onStart callback when animation starts', () => {
      const onStart = jest.fn();
      
      renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {
        onStart
      });
      
      // Manually trigger the 'start' event
      const animations = Array.from(renderer['animations'].values());
      const mockAnimation = animations[0] as unknown as MockAnimation;
      mockAnimation['callListeners']('start', new AnimationPlaybackEvent('start', { currentTime: 0 }));
      
      expect(onStart).toHaveBeenCalled();
    });

    it('should trigger onFinish callback when animation finishes', () => {
      const onFinish = jest.fn();
      
      const { animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {
        onFinish
      });
      
      // Manually finish the animation
      (animation as unknown as MockAnimation).finish();
      
      expect(onFinish).toHaveBeenCalled();
    });

    it('should pause animation if autoplay is false', () => {
      const { animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {
        autoplay: false
      });
      
      expect((animation as unknown as MockAnimation).playState).toBe('paused');
    });

    it('should handle animation errors gracefully', () => {
      // Override Element.animate to throw an error
      const originalAnimate = Element.prototype.animate;
      Element.prototype.animate = function() {
        throw new Error('Animation error');
      };
      
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      expect(id).toBe('');
      expect(animation).toBeNull();
      expect(console.error).toHaveBeenCalled();
      
      // Restore the animate method
      Element.prototype.animate = originalAnimate;
    });
  });

  describe('play(), pause(), and cancel()', () => {
    it('should play an animation by ID', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {
        autoplay: false
      });
      
      expect((animation as unknown as MockAnimation).playState).toBe('paused');
      
      renderer.play(id);
      
      expect((animation as unknown as MockAnimation).playState).toBe('running');
    });

    it('should pause an animation by ID', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      expect((animation as unknown as MockAnimation).playState).toBe('running');
      
      renderer.pause(id);
      
      expect((animation as unknown as MockAnimation).playState).toBe('paused');
    });

    it('should cancel an animation by ID', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      expect((animation as unknown as MockAnimation).playState).toBe('running');
      
      renderer.cancel(id);
      
      expect((animation as unknown as MockAnimation).playState).toBe('idle');
      expect(renderer.getAnimation(id)).toBeUndefined();
    });
  });

  describe('getState() and getCurrentTime()', () => {
    it('should get the current animation state', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      expect(renderer.getState(id)).toBe('running');
      
      renderer.pause(id);
      
      expect(renderer.getState(id)).toBe('paused');
    });

    it('should return null for non-existent animation ID', () => {
      expect(renderer.getState('non-existent-id')).toBeNull();
      expect(renderer.getCurrentTime('non-existent-id')).toBeNull();
    });

    it('should get and set the current animation time', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 1000
      });
      
      renderer.setCurrentTime(id, 500);
      
      expect(renderer.getCurrentTime(id)).toBe(500);
    });
  });

  describe('setPlaybackRate() and reverse()', () => {
    it('should update the playback rate', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      renderer.setPlaybackRate(id, 2.5);
      
      expect((animation as unknown as MockAnimation).playbackRate).toBe(2.5);
    });

    it('should reverse the animation direction', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      const initialRate = (animation as unknown as MockAnimation).playbackRate;
      
      renderer.reverse(id);
      
      expect((animation as unknown as MockAnimation).playbackRate).toBe(-initialRate);
    });
  });

  describe('updateTiming()', () => {
    it('should update the animation timing options', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      renderer.updateTiming(id, { duration: 2000 });
      
      expect((animation as unknown as MockAnimation).effect.updateTiming).toHaveBeenCalledWith({ duration: 2000 });
    });
  });

  describe('addEventListener() and removeEventListener()', () => {
    it('should add and remove event listeners', () => {
      const { id, animation } = renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      
      const callback = jest.fn();
      
      renderer.addEventListener(id, 'finish', callback);
      
      // Manually finish the animation
      (animation as unknown as MockAnimation).finish();
      
      expect(callback).toHaveBeenCalled();
      
      // Reset the mock function
      callback.mockReset();
      
      // Remove the event listener
      renderer.removeEventListener(id, 'finish', callback);
      
      // Manually finish again
      (animation as unknown as MockAnimation).finish();
      
      // Callback should not be called this time
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('convertKeyframeEffect()', () => {
    it('should return array keyframes as is', () => {
      const keyframes = [
        { transform: 'translateX(0px)' },
        { transform: 'translateX(100px)' }
      ];
      
      const result = WaapiRenderer.convertKeyframeEffect(keyframes);
      
      expect(result).toBe(keyframes);
    });

    it('should convert property indexed keyframes', () => {
      const keyframeEffect = {
        transform: ['translateX(0px)', 'translateX(100px)'],
        opacity: { from: 0, to: 1 },
        backgroundColor: { value: 'red' }
      };
      
      const result = WaapiRenderer.convertKeyframeEffect(keyframeEffect);
      
      expect(result).toEqual({
        transform: ['translateX(0px)', 'translateX(100px)'],
        opacity: [0, 1],
        backgroundColor: 'red'
      });
    });
  });

  describe('dispose()', () => {
    it('should cancel all animations and clear the animations map', () => {
      renderer.animate(element, [{ opacity: 0 }, { opacity: 1 }], {});
      renderer.animate(element, [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }], {});
      
      expect(renderer['animations'].size).toBe(2);
      
      renderer.dispose();
      
      expect(renderer['animations'].size).toBe(0);
    });
  });
});