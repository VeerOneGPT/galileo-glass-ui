/**
 * Tests for useGameAnimation hook
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { 
  useGameAnimation, 
  TransitionType, 
  TransitionDirection,
  GameAnimationState, 
  StateTransition 
} from '../useGameAnimation';
import { AnimationCategory } from '../../accessibility/MotionSensitivity';
import { StaggerPattern } from '../../orchestration/useAnimationSequence';

// Mock useAnimationSequence which is used internally by useGameAnimation
jest.mock('../../orchestration/useAnimationSequence', () => {
  return {
    __esModule: true,
    useAnimationSequence: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      restart: jest.fn(),
      seek: jest.fn(),
      seekProgress: jest.fn(),
      addStage: jest.fn(),
      removeStage: jest.fn(),
      updateStage: jest.fn(),
      addCallback: jest.fn((type, callback) => {
        if (type === 'update') {
          // Immediately call with progress 1 to simulate animation completion
          setTimeout(() => callback(1), 0);
        }
      }),
      removeCallback: jest.fn(),
      stages: [],
      progress: 0,
      playbackState: 'idle',
      duration: 500,
      direction: 'forward',
      playbackRate: 1,
      reducedMotion: false
    })),
    StaggerPattern,
    PlaybackDirection: {
      FORWARD: 'forward',
      BACKWARD: 'backward',
      ALTERNATE: 'alternate',
      ALTERNATE_REVERSE: 'alternate-reverse'
    }
  };
});

// Mock useReducedMotion
jest.mock('../../accessibility/useReducedMotion', () => {
  return {
    __esModule: true,
    useReducedMotion: jest.fn(() => ({
      prefersReducedMotion: false,
      isAnimationAllowed: jest.fn(() => true)
    }))
  };
});

// Define test states
const testStates: GameAnimationState[] = [
  {
    id: 'menu',
    name: 'Main Menu',
    enterElements: '.menu-element',
    exitElements: '.menu-element',
    exclusive: true,
    enterDuration: 500,
    exitDuration: 300
  },
  {
    id: 'game',
    name: 'Game',
    enterElements: '.game-element',
    exitElements: '.game-element',
    exclusive: true,
    enterDuration: 400,
    exitDuration: 200
  },
  {
    id: 'settings',
    name: 'Settings',
    enterElements: '.settings-element',
    exitElements: '.settings-element',
    exclusive: true,
    enterDuration: 300,
    exitDuration: 200
  }
];

// Define test transitions
const testTransitions: StateTransition[] = [
  {
    from: 'menu',
    to: 'game',
    type: TransitionType.FADE,
    duration: 500,
    easing: 'easeInOutCubic',
    category: AnimationCategory.ATTENTION
  },
  {
    from: 'game',
    to: 'menu',
    type: TransitionType.SLIDE,
    direction: TransitionDirection.RIGHT_TO_LEFT,
    duration: 600,
    easing: 'easeInOutCubic',
    category: AnimationCategory.ATTENTION
  },
  {
    from: 'menu',
    to: 'settings',
    type: TransitionType.ZOOM,
    direction: TransitionDirection.FROM_CENTER,
    duration: 400,
    easing: 'easeOutBack',
    category: AnimationCategory.ATTENTION
  }
];

// Test component that uses the hook
const TestComponent: React.FC = () => {
  const { activeStates, transitionTo, isStateActive } = useGameAnimation({
    initialState: 'menu',
    states: testStates,
    transitions: testTransitions
  });
  
  return (
    <div>
      <div data-testid="active-state">{activeStates[0]?.id || 'none'}</div>
      <button 
        data-testid="to-game-btn"
        onClick={() => transitionTo('game')}
      >
        To Game
      </button>
      <button 
        data-testid="to-menu-btn"
        onClick={() => transitionTo('menu')}
      >
        To Menu
      </button>
      <button 
        data-testid="to-settings-btn"
        onClick={() => transitionTo('settings')}
      >
        To Settings
      </button>
      <div data-testid="menu-active">{isStateActive('menu') ? 'true' : 'false'}</div>
      <div data-testid="game-active">{isStateActive('game') ? 'true' : 'false'}</div>
    </div>
  );
};

describe('useGameAnimation', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('initializes with correct initial state', () => {
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: testStates,
      transitions: testTransitions
    }));
    
    expect(result.current.activeStates).toHaveLength(1);
    expect(result.current.activeStates[0].id).toBe('menu');
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.transitionProgress).toBe(0);
  });
  
  test('can transition between states', async () => {
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: testStates,
      transitions: testTransitions
    }));
    
    // Transition to game state
    act(() => {
      result.current.transitionTo('game');
    });
    
    // Immediately after calling transitionTo, it should be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Wait for animation to complete (mocked to be immediate)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // After "animation", should be on game state
    expect(result.current.activeStates[0].id).toBe('game');
    expect(result.current.isStateActive('game')).toBe(true);
    expect(result.current.isStateActive('menu')).toBe(false);
  });
  
  test('handles transition playback controls', async () => {
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: testStates,
      transitions: testTransitions
    }));
    
    // Start a transition
    act(() => {
      result.current.transitionTo('game');
    });
    
    // Should be transitioning
    expect(result.current.isTransitioning).toBe(true);
    
    // Test pause
    act(() => {
      result.current.pauseTransition();
    });
    
    // Test resume
    act(() => {
      result.current.resumeTransition();
    });
    
    // Test cancel
    act(() => {
      result.current.cancelTransition();
    });
    
    // Should not be transitioning after cancel
    expect(result.current.isTransitioning).toBe(false);
    
    // Start another transition
    act(() => {
      result.current.transitionTo('game');
    });
    
    // Test complete
    act(() => {
      result.current.completeTransition();
    });
    
    // Wait for any pending callbacks
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Should be on game state after completing
    expect(result.current.activeStates[0].id).toBe('game');
  });
  
  test('can add and remove states and transitions', () => {
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: testStates,
      transitions: testTransitions
    }));
    
    // Add a new state
    act(() => {
      result.current.addState({
        id: 'help',
        name: 'Help Screen',
        enterElements: '.help-element',
        exitElements: '.help-element',
        exclusive: true
      });
    });
    
    // Add a new transition
    act(() => {
      result.current.addTransition({
        from: 'menu',
        to: 'help',
        type: TransitionType.FADE,
        duration: 300,
        category: AnimationCategory.ATTENTION
      });
    });
    
    // Transition to new state should work
    act(() => {
      result.current.transitionTo('help');
    });
    
    // Remove the state
    act(() => {
      result.current.removeState('help');
    });
    
    // Remove a transition
    act(() => {
      result.current.removeTransition('menu', 'game');
    });
  });
  
  test('can play individual enter/exit animations', () => {
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: testStates,
      transitions: testTransitions
    }));
    
    // Play enter animation for a state
    act(() => {
      result.current.playEnterAnimation('game');
    });
    
    // Play exit animation for a state
    act(() => {
      result.current.playExitAnimation('menu');
    });
  });
  
  test('can go to a state without animation', () => {
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: testStates,
      transitions: testTransitions
    }));
    
    // Go to state directly
    act(() => {
      result.current.goToState('game');
    });
    
    // Should be on game state immediately without transitioning
    expect(result.current.activeStates[0].id).toBe('game');
    expect(result.current.isTransitioning).toBe(false);
  });
  
  test('renders and transitions in a component', async () => {
    render(<TestComponent />);
    
    // Initial state should be menu
    expect(screen.getByTestId('active-state').textContent).toBe('menu');
    expect(screen.getByTestId('menu-active').textContent).toBe('true');
    expect(screen.getByTestId('game-active').textContent).toBe('false');
    
    // Transition to game
    fireEvent.click(screen.getByTestId('to-game-btn'));
    
    // Wait for animation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Should now be on game state
    expect(screen.getByTestId('game-active').textContent).toBe('true');
    expect(screen.getByTestId('menu-active').textContent).toBe('false');
    
    // Transition back to menu
    fireEvent.click(screen.getByTestId('to-menu-btn'));
    
    // Wait for animation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Should be back on menu state
    expect(screen.getByTestId('menu-active').textContent).toBe('true');
    expect(screen.getByTestId('game-active').textContent).toBe('false');
  });
});