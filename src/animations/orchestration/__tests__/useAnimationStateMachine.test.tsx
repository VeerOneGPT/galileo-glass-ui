/**
 * useAnimationStateMachine Hook Tests
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook, act as hookAct } from '@testing-library/react-hooks';
import { useAnimationStateMachine } from '../useAnimationStateMachine';
import { AnimationState, StateTransition , createAnimationStateMachine } from '../AnimationStateMachine';

// Mock useReducedMotion hook
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

// Mock AnimationStateMachine
jest.mock('../AnimationStateMachine', () => {
  const mockMachine = {
    getState: jest.fn().mockReturnValue('idle'),
    getPreviousState: jest.fn().mockReturnValue(''),
    send: jest.fn().mockImplementation((event) => {
      // Mock the behavior of send to update state
      if (event === 'activate') {
        mockMachine.getState.mockReturnValue('active');
        mockMachine.getPreviousState.mockReturnValue('idle');
        return Promise.resolve(true);
      }
      if (event === 'deactivate') {
        mockMachine.getState.mockReturnValue('idle');
        mockMachine.getPreviousState.mockReturnValue('active');
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    }),
    is: jest.fn().mockImplementation((state) => mockMachine.getState() === state),
    can: jest.fn().mockReturnValue(true),
    reset: jest.fn().mockReturnValue(Promise.resolve(true)),
    getAvailableTransitions: jest.fn().mockReturnValue([]),
    getHistory: jest.fn().mockReturnValue([]),
    clearHistory: jest.fn(),
    setData: jest.fn(),
    getData: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  };
  
  return {
    AnimationState: jest.fn(),
    StateTransition: jest.fn(),
    StateMachineOptions: jest.fn(),
    createAnimationStateMachine: jest.fn().mockReturnValue(mockMachine),
    AnimationStateMachine: jest.fn().mockImplementation(() => mockMachine)
  };
});

describe('useAnimationStateMachine', () => {
  let states: AnimationState[];
  let transitions: StateTransition[];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up test data
    states = [
      {
        id: 'idle',
        name: 'Idle State'
      },
      {
        id: 'active',
        name: 'Active State'
      },
      {
        id: 'disabled',
        name: 'Disabled State'
      }
    ];
    
    transitions = [
      {
        from: 'idle',
        to: 'active',
        on: 'activate'
      },
      {
        from: 'active',
        to: 'idle',
        on: 'deactivate'
      }
    ];
  });
  
  it('should initialize with the correct state', () => {
    const { result } = renderHook(() => useAnimationStateMachine({
      states,
      transitions,
      initialState: 'idle'
    }));
    
    expect(result.current.currentState).toBe('idle');
    expect(result.current.previousState).toBe('');
  });
  
  it('should update state after sending an event', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAnimationStateMachine({
      states,
      transitions,
      initialState: 'idle'
    }));
    
    // Require act for state updates
    await hookAct(async () => {
      const success = await result.current.send('activate');
      expect(success).toBe(true);
    });
    
    expect(result.current.currentState).toBe('active');
    expect(result.current.previousState).toBe('idle');
  });
  
  it('should check current state with "is" method', () => {
    const { result } = renderHook(() => useAnimationStateMachine({
      states,
      transitions,
      initialState: 'idle'
    }));
    
    expect(result.current.is('idle')).toBe(true);
    expect(result.current.is('active')).toBe(false);
  });
  
  it('should respect dependency changes', () => {
    const onStateChange = jest.fn();
    
    // Create a wrapper to manage props
    const wrapper = ({ children, deps }: { children: React.ReactNode, deps: any[] }) => (
      <>{children}</>
    );
    
    const { result, rerender } = renderHook(
      ({ deps }) => useAnimationStateMachine({
        states,
        transitions,
        initialState: 'idle',
        onStateChange,
        deps
      }),
      {
        wrapper,
        initialProps: { children: <></>, deps: [1] }
      }
    );
    
    // Verify the initial render creates the machine
    expect((result.current as any).machine).toBeDefined();
    
    // Change dependencies to trigger recreation
    rerender({ children: <></>, deps: [2] });
    
    // Machine should be recreated
    expect(createAnimationStateMachine as jest.Mock).toHaveBeenCalledTimes(2);
  });
  
  it('should handle transitioning state', async () => {
    const { result } = renderHook(() => useAnimationStateMachine({
      states,
      transitions,
      initialState: 'idle'
    }));
    
    // Initially not transitioning
    expect(result.current.transitioning).toBe(false);
    
    // Start transition
    let promise: Promise<boolean>;
    await hookAct(async () => {
      promise = result.current.send('activate');
      
      // Should be transitioning now
      expect(result.current.transitioning).toBe(true);
      
      // Wait for transition to complete
      await promise;
    });
    
    // Should no longer be transitioning
    expect(result.current.transitioning).toBe(false);
  });
  
  it('should expose all state machine methods', () => {
    const { result } = renderHook(() => useAnimationStateMachine({
      states,
      transitions,
      initialState: 'idle'
    }));
    
    // Check that all methods are exposed
    expect(typeof result.current.send).toBe('function');
    expect(typeof result.current.is).toBe('function');
    expect(typeof result.current.can).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(typeof result.current.getAvailableTransitions).toBe('function');
    expect(typeof result.current.getHistory).toBe('function');
    expect(typeof result.current.clearHistory).toBe('function');
    expect(typeof result.current.setData).toBe('function');
    expect(typeof result.current.getData).toBe('function');
    expect(typeof result.current.on).toBe('function');
    expect(typeof result.current.off).toBe('function');
  });
  
  it('should call the onStateChange callback when state changes', async () => {
    const onStateChange = jest.fn();
    
    const { result } = renderHook(() => useAnimationStateMachine({
      states,
      transitions,
      initialState: 'idle',
      onStateChange
    }));
    
    await hookAct(async () => {
      await result.current.send('activate');
    });
    
    // This would be called by the machine's onStateChange
    // But since we're mocking, we won't see it directly
    expect(onStateChange).toHaveBeenCalled();
  });
  
  // Example of using in a component test
  test('Component using useAnimationStateMachine', async () => {
    function TestComponent() {
      const machine = useAnimationStateMachine({
        states,
        transitions,
        initialState: 'idle'
      });
      
      return (
        <div>
          <div data-testid="current-state">{machine.currentState}</div>
          <div data-testid="previous-state">{machine.previousState}</div>
          <button 
            data-testid="activate-btn" 
            onClick={() => machine.send('activate')}
            disabled={machine.is('active') || machine.transitioning}
          >
            Activate
          </button>
          <button 
            data-testid="deactivate-btn" 
            onClick={() => machine.send('deactivate')}
            disabled={!machine.is('active') || machine.transitioning}
          >
            Deactivate
          </button>
        </div>
      );
    }
    
    // Render component
    render(<TestComponent />);
    
    // Initial state
    expect(screen.getByTestId('current-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('previous-state')).toHaveTextContent('');
    
    // Transition to active
    await act(async () => {
      fireEvent.click(screen.getByTestId('activate-btn'));
    });
    
    // Check updated state
    expect(screen.getByTestId('current-state')).toHaveTextContent('active');
    expect(screen.getByTestId('previous-state')).toHaveTextContent('idle');
    
    // Transition back to idle
    await act(async () => {
      fireEvent.click(screen.getByTestId('deactivate-btn'));
    });
    
    // Check updated state again
    expect(screen.getByTestId('current-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('previous-state')).toHaveTextContent('active');
  });
});