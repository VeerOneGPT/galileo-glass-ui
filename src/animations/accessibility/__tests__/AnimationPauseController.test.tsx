/**
 * Tests for AnimationPauseController
 * 
 * These tests verify that the animation pause controller functions correctly
 * and provides appropriate controls for animations.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { 
  AnimationPauseControllerProvider,
  useAnimationPauseController,
  useControllableAnimation,
  createGlobalPauseControl,
  createAnimationPauseButton
} from '../AnimationPauseController';

// Mock for Web Animations API
class AnimationMock implements Animation {
  playState: AnimationPlayState = 'running';
  currentTime: number | null = 0;
  playbackRate = 1;
  effect: AnimationEffect | null = null;
  finished: Promise<Animation> = Promise.resolve(this);
  id = '';
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null;
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null;
  onremove: ((this: Animation, ev: Event) => any) | null = null;
  pending = false;
  ready: Promise<Animation> = Promise.resolve(this);
  replaceState: AnimationReplaceState = 'active';
  startTime: number | null = 0;
  timeline: AnimationTimeline | null = null;
  commitStyles = () => {};
  finish = () => {};
  persist = () => {};
  reverse = () => {};
  updatePlaybackRate = (playbackRate: number) => {};
  addEventListener = <K extends keyof AnimationEventMap>(type: K, listener: (this: Animation, ev: AnimationEventMap[K]) => any, options?: boolean | AddEventListenerOptions) => {};
  removeEventListener = <K extends keyof AnimationEventMap>(type: K, listener: (this: Animation, ev: AnimationEventMap[K]) => any, options?: boolean | EventListenerOptions) => {};
  dispatchEvent = (event: Event) => true;
  
  pause() {
    this.playState = 'paused';
  }
  
  play() {
    this.playState = 'running';
  }
  
  cancel() {
    this.playState = 'idle';
    this.currentTime = 0;
  }
}

// Mock for Element.getAnimations
Element.prototype.getAnimations = jest.fn(() => {
  return [new AnimationMock()];
});

// Mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock for document.getAnimations
document.getAnimations = jest.fn(() => {
  return [new AnimationMock()];
});

// Test component that uses the animation pause controller
const TestComponent: React.FC = () => {
  const { 
    globalPaused, 
    toggleGlobalPause,
    globalSpeed,
    setGlobalSpeed,
    createAnimationController 
  } = useAnimationPauseController();
  
  // Create a test animation controller
  const animation = useControllableAnimation({
    id: 'test-animation',
    name: 'Test Animation',
    canPause: true,
    canAdjustSpeed: true
  });
  
  return (
    <div>
      <div data-testid="global-status">
        {globalPaused ? 'Paused' : 'Playing'}
      </div>
      <div data-testid="animation-status">
        {animation.paused ? 'Paused' : 'Playing'}
      </div>
      <div data-testid="speed-status">
        {animation.speed}
      </div>
      <button 
        data-testid="toggle-global"
        onClick={toggleGlobalPause}
      >
        Toggle Global
      </button>
      <button 
        data-testid="toggle-animation"
        onClick={animation.togglePause}
      >
        Toggle Animation
      </button>
      <button 
        data-testid="restart-animation"
        onClick={animation.restart}
      >
        Restart Animation
      </button>
      <input
        data-testid="speed-slider"
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={animation.speed}
        onChange={(e) => animation.setSpeed(parseFloat(e.target.value))}
      />
    </div>
  );
};

describe('AnimationPauseController', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Reset DOM animation mocks
    (Element.prototype.getAnimations as jest.Mock).mockReturnValue([new AnimationMock()]);
    (document.getAnimations as jest.Mock).mockReturnValue([new AnimationMock()]);
  });
  
  test('AnimationPauseControllerProvider renders children', () => {
    render(
      <AnimationPauseControllerProvider>
        <div data-testid="child">Child Content</div>
      </AnimationPauseControllerProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
  
  test('useAnimationPauseController provides context values', () => {
    const { result } = renderHook(() => useAnimationPauseController(), {
      wrapper: ({ children }) => (
        <AnimationPauseControllerProvider>
          {children}
        </AnimationPauseControllerProvider>
      )
    });
    
    expect(result.current.globalPaused).toBe(false);
    expect(result.current.globalSpeed).toBe(1);
    expect(typeof result.current.toggleGlobalPause).toBe('function');
    expect(typeof result.current.createAnimationController).toBe('function');
  });
  
  test('global pause controls animation state', () => {
    render(
      <AnimationPauseControllerProvider>
        <TestComponent />
      </AnimationPauseControllerProvider>
    );
    
    // Initially playing
    expect(screen.getByTestId('global-status')).toHaveTextContent('Playing');
    expect(screen.getByTestId('animation-status')).toHaveTextContent('Playing');
    
    // Toggle global pause
    fireEvent.click(screen.getByTestId('toggle-global'));
    
    // Should pause animation
    expect(screen.getByTestId('global-status')).toHaveTextContent('Paused');
    expect(screen.getByTestId('animation-status')).toHaveTextContent('Paused');
    
    // Toggle back
    fireEvent.click(screen.getByTestId('toggle-global'));
    
    // Should resume (animation still playing since it was paused by global)
    expect(screen.getByTestId('global-status')).toHaveTextContent('Playing');
    expect(screen.getByTestId('animation-status')).toHaveTextContent('Playing');
  });
  
  test('individual animation controls work', () => {
    render(
      <AnimationPauseControllerProvider>
        <TestComponent />
      </AnimationPauseControllerProvider>
    );
    
    // Initially playing
    expect(screen.getByTestId('animation-status')).toHaveTextContent('Playing');
    
    // Toggle animation pause
    fireEvent.click(screen.getByTestId('toggle-animation'));
    
    // Should pause just this animation
    expect(screen.getByTestId('global-status')).toHaveTextContent('Playing');
    expect(screen.getByTestId('animation-status')).toHaveTextContent('Paused');
    
    // Toggle back
    fireEvent.click(screen.getByTestId('toggle-animation'));
    
    // Should resume
    expect(screen.getByTestId('animation-status')).toHaveTextContent('Playing');
  });
  
  test('animation speed controls work', () => {
    render(
      <AnimationPauseControllerProvider>
        <TestComponent />
      </AnimationPauseControllerProvider>
    );
    
    // Initially speed is 1
    expect(screen.getByTestId('speed-status')).toHaveTextContent('1');
    
    // Change speed
    fireEvent.change(screen.getByTestId('speed-slider'), { target: { value: '0.5' } });
    
    // Speed should update
    expect(screen.getByTestId('speed-status')).toHaveTextContent('0.5');
  });
  
  test('restart animation function works', () => {
    // We'll check that Element.getAnimations was called and animations were restarted
    const mockAnimation = new AnimationMock();
    (Element.prototype.getAnimations as jest.Mock).mockReturnValue([mockAnimation]);
    
    const cancelSpy = jest.spyOn(mockAnimation, 'cancel');
    const playSpy = jest.spyOn(mockAnimation, 'play');
    
    render(
      <AnimationPauseControllerProvider>
        <TestComponent />
      </AnimationPauseControllerProvider>
    );
    
    // Restart animation
    fireEvent.click(screen.getByTestId('restart-animation'));
    
    // Should call cancel and play
    expect(cancelSpy).toHaveBeenCalled();
    expect(playSpy).toHaveBeenCalled();
  });
  
  test('preferences are saved to localStorage', () => {
    const { result } = renderHook(() => useAnimationPauseController(), {
      wrapper: ({ children }) => (
        <AnimationPauseControllerProvider>
          {children}
        </AnimationPauseControllerProvider>
      )
    });
    
    // Set global paused
    act(() => {
      result.current.setGlobalPaused(true);
    });
    
    // Save preferences
    act(() => {
      result.current.savePreferences();
    });
    
    // Check localStorage
    const savedPrefs = JSON.parse(window.localStorage.getItem('galileo-glass-animation-preferences') || '{}');
    expect(savedPrefs.globalPaused).toBe(true);
  });
  
  test('createGlobalPauseControl creates a DOM element', () => {
    const control = createGlobalPauseControl();
    
    expect(control).toBeInstanceOf(HTMLElement);
    expect(control.id).toBe('galileo-glass-animation-pause-control');
  });
  
  test('createAnimationPauseButton creates a DOM element', () => {
    const button = createAnimationPauseButton();
    
    expect(button).toBeInstanceOf(HTMLElement);
    expect(button.id).toBe('galileo-glass-animation-pause-button');
  });
});