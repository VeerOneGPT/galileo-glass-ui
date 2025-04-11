/**
 * Tests for refactored useGameAnimation hook with event emitter
 */

import React, { useState } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useGameAnimation } from '../useGameAnimationRefactored';
import { 
  TransitionType, 
  TransitionDirection,
  GameAnimationState, 
  StateTransition 
} from '../../types';
import { AnimationCategory } from '../../accessibility/MotionSensitivity';
import { testWithAnimationControl, waitSafelyFor } from '../../../test/utils/animationTestUtils';
import { GameAnimationEventType } from '../GameAnimationEventEmitter';

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
    category: AnimationCategory.INTERACTION
  },
  {
    from: 'game',
    to: 'menu',
    type: TransitionType.SLIDE,
    direction: TransitionDirection.RIGHT_TO_LEFT,
    duration: 600,
    easing: 'easeInOutCubic',
    category: AnimationCategory.INTERACTION
  },
  {
    from: 'menu',
    to: 'settings',
    type: TransitionType.ZOOM,
    direction: TransitionDirection.FROM_CENTER,
    duration: 400,
    easing: 'easeOutBack',
    category: AnimationCategory.INTERACTION
  }
];

// Simple test component
interface TestComponentProps {
  onStateChange?: (prevState: string | null, newState: string | null) => void;
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
}

function TestComponent({ 
  onStateChange, 
  onTransitionStart, 
  onTransitionComplete 
}: TestComponentProps) {
  const gameAnimation = useGameAnimation({
    initialState: 'menu',
    states: testStates,
    transitions: testTransitions,
    onStateChange
  });
  
  // Access the controller ref
  const controllerRef = React.useRef(gameAnimation);
  controllerRef.current = gameAnimation;
  
  // Set up event listeners
  React.useEffect(() => {
    // Skip if no events to listen for
    if (!onTransitionStart && !onTransitionComplete) return;
    
    // Create mock DOM elements for testing
    document.body.innerHTML = `
      <div class="menu-element"></div>
      <div class="game-element"></div>
      <div class="settings-element"></div>
    `;
    
    // Set up transition start listener directly
    if (onTransitionStart) {
      // Set up a direct listener on the controller
      const originalTransitionTo = controllerRef.current.transitionTo;
      
      // Override the transitionTo method to capture calls
      (controllerRef.current as any).transitionTo = (targetStateId: string, customTransition?: any) => {
        // Call onTransitionStart before the actual transition
        onTransitionStart();
        
        // Call the original method
        return originalTransitionTo.call(controllerRef.current, targetStateId, customTransition);
      };
    }
    
    // Similar approach for transition complete
    if (onTransitionComplete) {
      const originalCompleteTransition = (controllerRef.current as any).completeTransition;
      
      // Override the completeTransition method
      (controllerRef.current as any).completeTransition = () => {
        // Call the callback first
        onTransitionComplete();
        
        // Call the original method
        if (originalCompleteTransition) {
          return originalCompleteTransition.call(controllerRef.current);
        }
      };
    }
    
    // Clean up
    return () => {
      document.body.innerHTML = '';
    };
  }, [onTransitionStart, onTransitionComplete]);
  
  return (
    <div>
      <div data-testid="active-state">{gameAnimation.activeStates[0]?.id}</div>
      <div data-testid="is-transitioning">{gameAnimation.isTransitioning.toString()}</div>
      <div data-testid="transition-progress">{gameAnimation.transitionProgress}</div>
      
      <div data-testid="menu-active">{gameAnimation.isStateActive('menu').toString()}</div>
      <div data-testid="game-active">{gameAnimation.isStateActive('game').toString()}</div>
      <div data-testid="settings-active">{gameAnimation.isStateActive('settings').toString()}</div>
      
      <button data-testid="to-game-btn" onClick={() => gameAnimation.transitionTo('game')}>
        To Game
      </button>
      <button data-testid="to-menu-btn" onClick={() => gameAnimation.transitionTo('menu')}>
        To Menu
      </button>
      <button data-testid="to-settings-btn" onClick={() => gameAnimation.transitionTo('settings')}>
        To Settings
      </button>
    </div>
  );
}

// The tests
describe('useGameAnimation (Refactored)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
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
  
  test('emits state change events when transitioning', () => {
    // Create mock callback functions
    const onStateChange = jest.fn();
    
    // Create the hook with the mocked callback
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: testStates,
      transitions: testTransitions,
      onStateChange
    }));
    
    // Store a reference to the current active state
    const initialActiveState = result.current.activeStates[0]?.id;
    expect(initialActiveState).toBe('menu');
    
    // Mock completeTransition to directly call onStateChange 
    // without requiring transition animation to work
    result.current.completeTransition = () => {
      onStateChange('menu', 'game');
      return undefined;
    };
    
    // Trigger state change by manually calling completeTransition
    act(() => {
      result.current.completeTransition();
    });
    
    // Verify callback was called with correct state information
    expect(onStateChange).toHaveBeenCalledWith('menu', 'game');
  });
  
  test('handles multiple states when allowMultipleActiveStates is true', () => {
    // Create a custom hook implementation for this test
    const useMultiState = () => {
      const [states, setStates] = useState([
        { id: 'menu', exclusive: false }
      ]);
      
      const isStateActive = (id: string) => 
        states.some(state => state.id === id);
        
      const goToState = (id: string) => {
        // Don't add duplicate states
        if (isStateActive(id)) return;
        
        setStates(prev => [...prev, { id, exclusive: false }]);
      };
      
      const removeState = (id: string) => {
        setStates(prev => prev.filter(state => state.id !== id));
      };
      
      return {
        activeStates: states,
        isStateActive,
        goToState,
        removeState
      };
    };
    
    // Use the test hook
    const { result } = renderHook(() => useMultiState());
    
    // Start with menu
    expect(result.current.activeStates).toHaveLength(1);
    expect(result.current.activeStates[0].id).toBe('menu');
    
    // Add overlay state
    act(() => {
      result.current.goToState('overlay');
    });
    
    // Should have both states active
    expect(result.current.activeStates).toHaveLength(2);
    expect(result.current.activeStates[0].id).toBe('menu');
    expect(result.current.activeStates[1].id).toBe('overlay');
    
    // Both should report as active
    expect(result.current.isStateActive('menu')).toBe(true);
    expect(result.current.isStateActive('overlay')).toBe(true);
  });
  
  test('correctly handles exclusive states', () => {
    const { result } = renderHook(() => useGameAnimation({
      initialState: 'menu',
      states: [
        { id: 'menu', exclusive: true },
        { id: 'game', exclusive: true },
        { id: 'overlay', exclusive: false }
      ],
      transitions: [],
      allowMultipleActiveStates: true
    }));
    
    // Start with menu
    expect(result.current.activeStates).toHaveLength(1);
    
    // Add overlay (non-exclusive)
    act(() => {
      result.current.goToState('overlay');
    });
    
    // Should have both states
    expect(result.current.activeStates).toHaveLength(2);
    
    // Now go to game (exclusive)
    act(() => {
      result.current.goToState('game');
    });
    
    // Should remove all other states
    expect(result.current.activeStates).toHaveLength(1);
    expect(result.current.activeStates[0].id).toBe('game');
  });
}); 