/**
 * useAnimationStateMachine Hook Tests
 */
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderHook, act as hookAct } from '@testing-library/react-hooks';
import { useAnimationStateMachine } from '../useAnimationStateMachine';
import { AnimationState, StateTransition , createAnimationStateMachine } from '../AnimationStateMachine';

// Mock useReducedMotion hook
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

// --- Improved Mock for AnimationStateMachine ---
jest.mock('../AnimationStateMachine', () => {
  // Keep track of the *last* created mock instance for potential inspection if needed
  let lastMockInstance: any = null;

  return {
    AnimationState: jest.fn(),
    StateTransition: jest.fn(),
    StateMachineOptions: jest.fn(),
    createAnimationStateMachine: jest.fn().mockImplementation((states, transitions, options) => {
      // --- Define state and mock machine INSIDE create --- 
      let currentState = options?.initialState || 'idle';
      let previousState = '';
      let isTransitioning = false;
      let stateChangeCallback = options?.onStateChange || null;
      const history: any[] = []; // Add history mock
      const data: Record<string, any> = {}; // Add data mock
      const eventHandlers: Map<string, Function[]> = new Map(); // Add event handlers map

      const mockMachine = {
        getState: jest.fn(() => currentState),
        getPreviousState: jest.fn(() => previousState),
        send: jest.fn().mockImplementation(async (event) => {
          const validTransition = 
            (currentState === 'idle' && event === 'activate') ||
            (currentState === 'active' && event === 'deactivate');

          if (!validTransition) return false;

          isTransitioning = true;
          await new Promise(resolve => setTimeout(resolve, 0)); 

          const oldState = currentState;
          if (event === 'activate') {
            previousState = currentState;
            currentState = 'active';
          } else if (event === 'deactivate') {
            previousState = currentState;
            currentState = 'idle';
          }
          
          history.push({ from: previousState, to: currentState, event, timestamp: Date.now() }); // Update history
          isTransitioning = false;

          if (stateChangeCallback) {
            // Call with from (old) and to (new) in correct order
            stateChangeCallback(oldState, currentState, { 
              currentState,
              previousState: oldState,
              event,
              params: {},
              targets: [],
              history,
              data
            });
          }
          
          // Emit events if handlers exist
          if (eventHandlers.has(event)) {
            eventHandlers.get(event)?.forEach(handler => handler());
          }
          if (eventHandlers.has('stateChanged')) {
             eventHandlers.get('stateChanged')?.forEach(handler => handler({ from: oldState, to: currentState }));
          }
          if (eventHandlers.has(`state:${currentState}`)) {
             eventHandlers.get(`state:${currentState}`)?.forEach(handler => handler());
          }
          return true;
        }),
        is: jest.fn().mockImplementation((state) => currentState === state),
        can: jest.fn().mockImplementation((event) => {
          return (currentState === 'idle' && event === 'activate') || (currentState === 'active' && event === 'deactivate');
        }),
        reset: jest.fn().mockImplementation(async () => {
            const oldState = currentState;
            currentState = options?.initialState || 'idle';
            previousState = oldState; // Reset previous state correctly
            isTransitioning = false;
            history.push({ from: previousState, to: currentState, event: 'reset', timestamp: Date.now() });
            if (stateChangeCallback) {
              stateChangeCallback(previousState, currentState, { /* mock context */ });
            }
            return true;
        }),
        getAvailableTransitions: jest.fn(() => {
            if (currentState === 'idle') return [{ from: 'idle', to: 'active', on: 'activate' }]; // Return full object
            if (currentState === 'active') return [{ from: 'active', to: 'idle', on: 'deactivate' }];
            return [];
        }),
        getHistory: jest.fn(() => [...history]), // Return copy
        clearHistory: jest.fn(() => { history.length = 0; }),
        setData: jest.fn((key, value) => { data[key] = value; }),
        getData: jest.fn((key) => data[key]),
        on: jest.fn((eventName, handler) => {
          if (!eventHandlers.has(eventName)) {
            eventHandlers.set(eventName, []);
          }
          eventHandlers.get(eventName)?.push(handler);
        }),
        off: jest.fn((eventName, handler) => {
           if (!eventHandlers.has(eventName)) return;
           const handlers = eventHandlers.get(eventName);
           const index = handlers?.indexOf(handler);
           if (handlers && index !== -1 && index !== undefined) {
             handlers.splice(index, 1);
           }
        }),
        get transitioning() {
            return isTransitioning;
        }
      };
      // ---------------------------------------------
      lastMockInstance = mockMachine; // Store reference to this instance
      return mockMachine;
    }),
    // Provide the class mock as well if needed by instanceof checks, though create should be primary
    AnimationStateMachine: jest.fn().mockImplementation(() => lastMockInstance)
  };
});
// --- End Improved Mock ---

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
    const { result } = renderHook(() => useAnimationStateMachine({
      states,
      transitions,
      initialState: 'idle'
    }));
    
    let success = false;
    await hookAct(async () => {
      success = await result.current.send('activate');
    });
    expect(success).toBe(true);
    
    // Use waitFor to check state after async callback update
    await waitFor(() => {
      expect(result.current.currentState).toBe('active');
    });
    // Previous state might update slightly later, wait for it too if needed
    // await waitFor(() => {
    //   expect(result.current.previousState).toBe('idle');
    // });
    expect(result.current.previousState).toBe('idle'); // Check directly for now
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
    
    expect(result.current.transitioning).toBe(false); // Initial state
    
    // Call send directly
    const promise = result.current.send('activate');
    
    // Check transitioning state immediately after calling send (sync part of mock)
    expect(result.current.transitioning).toBe(true);
    
    // Now await the promise 
    await promise;
    
    // Check state AFTER transition completes
    expect(result.current.transitioning).toBe(false);
    expect(result.current.currentState).toBe('active');
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
    
    // Use waitFor for the callback assertion
    await waitFor(() => {
      expect(onStateChange).toHaveBeenCalled();
    });
    expect(onStateChange).toHaveBeenCalledWith('idle', 'active', expect.any(Object)); // Fix argument order
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
    
    render(<TestComponent />);
    
    // Initial state
    expect(screen.getByTestId('current-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('previous-state')).toHaveTextContent('');
    
    // Transition to active
    await act(async () => {
      fireEvent.click(screen.getByTestId('activate-btn'));
      await new Promise(resolve => setTimeout(resolve, 0)); 
    });
    
    // Use waitFor to check component state update
    await waitFor(() => {
        expect(screen.getByTestId('current-state')).toHaveTextContent('active');
    });
    expect(screen.getByTestId('previous-state')).toHaveTextContent('idle');
    
    // Transition back to idle
    await act(async () => {
      fireEvent.click(screen.getByTestId('deactivate-btn'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Use waitFor to check component state update
     await waitFor(() => {
        expect(screen.getByTestId('current-state')).toHaveTextContent('idle');
    });
    expect(screen.getByTestId('previous-state')).toHaveTextContent('active');
  });
});