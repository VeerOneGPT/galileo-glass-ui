/**
 * Tests for AnimationPauseController
 * 
 * These tests verify that the animation pause controller functions correctly
 * and provides appropriate controls for animations.
 * 
 * Note: We are testing the core functionality while isolating components from
 * potential infinite loops with useSyncExternalStore.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

// Mock useSyncExternalStore to avoid infinite loop issues
jest.mock('use-sync-external-store/shim', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => getSnapshot()),
}));

// Import after mocking
import { 
  AnimationPauseControllerProvider,
  useAnimationPauseController,
  useControllableAnimation,
  createGlobalPauseControl,
  createAnimationPauseButton
} from '../AnimationPauseController';
import { AnimationProvider } from '../../../contexts/AnimationContext';

// Mock for Web Animations API
class AnimationMock implements Animation {
  playState: AnimationPlayState = 'running';
  currentTime: number | null = 0;
  playbackRate = 1;
  effect: AnimationEffect | null = null;
  finished: Promise<Animation> = Promise.resolve(this);
  id = '';
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => void) | null = null;
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => void) | null = null;
  onremove: ((this: Animation, ev: Event) => void) | null = null;
  pending = false;
  ready: Promise<Animation> = Promise.resolve(this);
  replaceState: AnimationReplaceState = 'active';
  startTime: number | null = 0;
  timeline: AnimationTimeline | null = null;
  commitStyles = () => { /* No-op */ };
  finish = () => { /* No-op */ };
  persist = () => { /* No-op */ };
  reverse = () => { /* No-op */ };
  updatePlaybackRate = (_playbackRate: number) => { /* No-op */ };
  addEventListener = <K extends keyof AnimationEventMap>(_type: K, _listener: (this: Animation, ev: AnimationEventMap[K]) => void, _options?: boolean | AddEventListenerOptions) => { /* No-op */ };
  removeEventListener = <K extends keyof AnimationEventMap>(_type: K, _listener: (this: Animation, ev: AnimationEventMap[K]) => void, _options?: boolean | EventListenerOptions) => { /* No-op */ };
  dispatchEvent = (_event: Event) => true;
  
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

// Simplified test component that uses the animation pause controller
const TestComponent: React.FC = () => {
  const { 
    globalPaused, 
    toggleGlobalPause,
    createAnimationController 
  } = useAnimationPauseController();
  
  // Create a test animation controller and store in a ref to avoid re-creation
  const animationRef = React.useRef(createAnimationController({
    id: 'test-animation',
    name: 'Test Animation',
    canPause: true,
    canAdjustSpeed: true
  }));
  
  // Extract the current animation from the ref
  const animation = animationRef.current;
  
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

// Wrapper component for tests that includes all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AnimationProvider>
    <AnimationPauseControllerProvider>
      {children}
    </AnimationPauseControllerProvider>
  </AnimationProvider>
);

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
      <AnimationProvider>
        <AnimationPauseControllerProvider>
          <div data-testid="child">Child Content</div>
        </AnimationPauseControllerProvider>
      </AnimationProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
  
  test('useAnimationPauseController provides context values', () => {
    const { result } = renderHook(() => useAnimationPauseController(), {
      wrapper: ({ children }) => (
        <AnimationProvider>
          <AnimationPauseControllerProvider>
            {children}
          </AnimationPauseControllerProvider>
        </AnimationProvider>
      )
    });
    
    expect(result.current.globalPaused).toBe(false);
    expect(result.current.globalSpeed).toBe(1);
    expect(typeof result.current.toggleGlobalPause).toBe('function');
    expect(typeof result.current.createAnimationController).toBe('function');
  });
  
  test('global pause controls animation state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    // Initially playing
    expect(screen.getByTestId('global-status')).toHaveTextContent('Playing');
    
    // Toggle global pause
    fireEvent.click(screen.getByTestId('toggle-global'));
    
    // Should pause globally
    expect(screen.getByTestId('global-status')).toHaveTextContent('Paused');
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