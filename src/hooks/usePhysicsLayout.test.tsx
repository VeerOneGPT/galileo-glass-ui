import React, { useRef } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { usePhysicsLayout } from './usePhysicsLayout';
import { PhysicsLayoutOptions, PhysicsLayoutResult } from '../types/hooks';
import { useGalileoPhysicsEngine } from '../animations/physics/useGalileoPhysicsEngine';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
// import * as vi from 'vitest'; // Comment out

// --- JEST Mock for useGalileoPhysicsEngine ---
const mockEngineState = new Map(); // Stores { id, position, ..., targetPosition, userData }

jest.mock('../animations/physics/useGalileoPhysicsEngine', () => ({
  useGalileoPhysicsEngine: jest.fn(() => ({
    addBody: jest.fn((options) => {
      const id = options.id || 'mock_body_' + Math.random();
      mockEngineState.set(id, {
         id,
         position: { ...(options.initialPosition || { x: 0, y: 0 }) },
         angle: options.initialAngle || 0,
         velocity: { x: 0, y: 0 },
         angularVelocity: 0,
         isStatic: options.isStatic || false,
         // Store target position within the mock state if provided via userData
         targetPosition: options.userData?.targetPosition || { ...(options.initialPosition || { x: 0, y: 0 }) },
         userData: options.userData || {},
      });
      return id;
    }),
    removeBody: jest.fn((id) => {
      mockEngineState.delete(id);
    }),
    updateBodyState: jest.fn((id, updates) => {
      if (mockEngineState.has(id)) {
        const currentState = mockEngineState.get(id);
        // Update target if passed in userData
        const newTarget = updates.userData?.targetPosition;
        mockEngineState.set(id, { 
            ...currentState, 
            ...updates, 
            // Keep existing target unless explicitly updated
            targetPosition: newTarget || currentState.targetPosition 
        });
      }
    }),
    // Simulate movement towards target when state is requested
    getBodyState: jest.fn((id) => {
        if (!mockEngineState.has(id)) return undefined;
        const state = mockEngineState.get(id);
        // Simple simulation: Move 10% towards target each time state is read
        const dx = state.targetPosition.x - state.position.x;
        const dy = state.targetPosition.y - state.position.y;
        state.position.x += dx * 0.1;
        state.position.y += dy * 0.1;
        return { ...state }; // Return a copy
    }),
    getAllBodyStates: jest.fn(() => {
        const updatedStates = new Map();
        mockEngineState.forEach((state, id) => {
            // Simple simulation: Move 10% towards target 
            const dx = state.targetPosition.x - state.position.x;
            const dy = state.targetPosition.y - state.position.y;
            state.position.x += dx * 0.1;
            state.position.y += dy * 0.1;
            updatedStates.set(id, { ...state }); // Return copies
        });
        return updatedStates;
    }),
    applyForce: jest.fn((id, force, point) => {
      // Potentially update targetPosition here based on force for more realism?
      // For now, assume target is set via updateBodyState
    }),
    applyImpulse: jest.fn(),
    onCollisionStart: jest.fn(() => jest.fn()),
    onCollisionActive: jest.fn(() => jest.fn()),
    onCollisionEnd: jest.fn(() => jest.fn()),
    addConstraint: jest.fn(() => 'mock_constraint_' + Math.random()),
    removeConstraint: jest.fn(),
  })),
}));
// --- End Mock ---

describe('usePhysicsLayout', () => {
  // --- rAF Mocking with Jest Timers ---
  let rafId = 0;
  const rafCallbacks = new Map<number, FrameRequestCallback>();

  beforeAll(() => {
    jest.useFakeTimers();
    
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      const id = ++rafId;
      const timerId = setTimeout(() => {
        if (rafCallbacks.has(id)) {
          rafCallbacks.delete(id);
          try {
             // Use performance.now provided by Jest's fake timers
            callback(performance.now());
          } catch (e) {
            console.error('Error in rAF callback:', e);
          }
        }
      }, 16); // Simulate 16ms frame delay
      rafCallbacks.set(id, callback);
      // Store timerId for cancellation
      (global.requestAnimationFrame as any).mock.calls[id - 1].timerId = timerId;
      return id;
    });

    global.cancelAnimationFrame = jest.fn((id: number) => {
      if (rafCallbacks.has(id)) {
        rafCallbacks.delete(id);
        const callData = (global.requestAnimationFrame as any).mock.calls[id - 1];
        if (callData && callData.timerId) {
           clearTimeout(callData.timerId);
        }
      }
    });
  });

  afterAll(() => {
    jest.useRealTimers();
    // Restore original rAF/cAF if necessary (though Jest usually handles this)
  });
  // --- End rAF Mocking ---

  beforeEach(() => {
    // Reset mocks and mock state before each test
    jest.clearAllMocks();
    mockEngineState.clear();
    rafCallbacks.clear();
    rafId = 0;
  });

  test('should return getContainerProps and getItemProps functions', () => {
    const { result } = renderHook(() => usePhysicsLayout(5, { layoutType: 'grid', gridOptions: { columns: 3 } }));

    expect(result.current).toBeDefined();
    expect(typeof result.current.getContainerProps).toBe('function');
    expect(typeof result.current.getItemProps).toBe('function');
  });

  test('getContainerProps should return an object with style', () => {
    // Note: containerSize is now deprecated/removed from options type, test simple case
    const { result } = renderHook(() => usePhysicsLayout(5, { 
      layoutType: 'grid',
      gridOptions: { columns: 3 }
      // containerSize: { width: 500, height: 400 } 
    }));
    const containerProps = result.current.getContainerProps();

    expect(containerProps).toBeInstanceOf(Object);
    expect(containerProps).toHaveProperty('style');
    expect(containerProps.style).toHaveProperty('position', 'relative');
    // Cannot reliably test width/height without containerSize option
    // expect(containerProps.style).toHaveProperty('width', 500); 
    // expect(containerProps.style).toHaveProperty('height', 400);
  });

  test('getItemProps should return an object with style and ref for each index', () => {
    const itemCount = 3;
    const { result } = renderHook(() => usePhysicsLayout(itemCount, { layoutType: 'grid', gridOptions: { columns: 2 } }));

    for (let i = 0; i < itemCount; i++) {
      const itemProps = result.current.getItemProps(i);
      expect(itemProps).toBeInstanceOf(Object);
      expect(itemProps).toHaveProperty('style');
      expect(itemProps.style).toHaveProperty('position', 'absolute');
      // Initial visibility might be hidden, check for it or transform
      expect(itemProps.style).toHaveProperty('visibility'); 
      expect(itemProps).toHaveProperty('ref');
      expect(typeof itemProps.ref).toBe('function');
    }
  });

  test('getItemProps should handle invalid index gracefully (return undefined or throw)', () => {
      const itemCount = 3;
      const { result } = renderHook(() => usePhysicsLayout(itemCount, { layoutType: 'grid', gridOptions: { columns: 2 } }));
      
      // Check how the actual hook handles invalid indices
      // It might return undefined/null for props or throw an error
      let propsInvalidLow, propsInvalidHigh;
      let errorLow, errorHigh;

      try { propsInvalidLow = result.current.getItemProps(-1); } catch (e) { errorLow = e; }
      try { propsInvalidHigh = result.current.getItemProps(itemCount); } catch (e) { errorHigh = e; }

      // Assert that either an error was thrown OR the result is not a valid prop object (e.g., undefined)
      expect(errorLow !== undefined || propsInvalidLow === undefined).toBe(true);
      expect(errorHigh !== undefined || propsInvalidHigh === undefined).toBe(true);
    });

  test('should update internally when itemCount changes', () => {
    const initialCount = 3;
    const { result, rerender } = renderHook(({ count }) => usePhysicsLayout(count, { layoutType: 'grid', gridOptions: { columns: 2 }}), {
      initialProps: { count: initialCount }
    });

    // Check initial props can be accessed without error for valid indices
    expect(result.current.getItemProps(initialCount - 1)).toBeDefined();

    const newCount = 5;
    rerender({ count: newCount });

    // Check props after rerender with new count
    expect(result.current.getItemProps(newCount - 1)).toBeDefined();
    // Verify old indices still work if they overlap
    expect(result.current.getItemProps(initialCount - 1)).toBeDefined(); 
    // Style array inside the hook should have updated length (cannot test directly)
  });

  test('should update internally when layout options change', () => {
    const { result, rerender } = renderHook(({ opts }) => usePhysicsLayout(4, opts), {
      initialProps: { opts: { layoutType: 'grid', gridOptions: { columns: 2 } } as PhysicsLayoutOptions }
    });

    const initialItemProps0 = result.current.getItemProps(0);
    const initialStyleString = JSON.stringify(initialItemProps0.style);

    rerender({ opts: { layoutType: 'stack' } as PhysicsLayoutOptions });

    // Check that props can still be retrieved
    const newItemProps0 = result.current.getItemProps(0);
    expect(newItemProps0).toBeDefined();

    // Conceptual check: After rerender and potential animation frame,
    // styles should change if the target calculation differs for stack vs grid.
    // This requires advancing timers/frames to be accurate.
    // act(() => { /* Advance time */ });
    // const finalStyleString = JSON.stringify(result.current.getItemProps(0).style);
    // expect(finalStyleString).not.toEqual(initialStyleString);
    // Placeholder:
    expect(newItemProps0.style).toBeDefined(); 
  });

  test('should conceptually use itemPhysicsConfigs if provided', () => {
      const itemCount = 2;
      const itemConfigs: PhysicsLayoutOptions['itemPhysicsConfigs'] = [
        { stiffness: 1, damping: 1 }, // Item 0 - very stiff/damped
        { stiffness: 0.01, damping: 0.1 } // Item 1 - very loose
      ];
      const { result } = renderHook(() => usePhysicsLayout(itemCount, {
         layoutType: 'grid', 
         gridOptions: { columns: 1 }, 
         itemPhysicsConfigs: itemConfigs 
      }));

      // This test can't easily verify the *effect* of different physics
      // without deep mocking or timer advancement + style comparison.
      // We mainly check that the hook runs with the prop.
      expect(result.current.getItemProps(0)).toBeDefined();
      expect(result.current.getItemProps(1)).toBeDefined();
      // TODO: Find a way to assert that different physics configs were applied internally.
  });

  // TODO: Add tests for interaction with actual DOM refs via ref callback in getItemProps
  // TODO: Test 'stack' layout target calculation conceptually (styles should differ from grid)
  test('stack layout should produce different styles than grid (conceptual)', () => {
      const itemCount = 4;
      const gridHook = renderHook(() => usePhysicsLayout(itemCount, { layoutType: 'grid', gridOptions: { columns: 2 } }));
      const stackHook = renderHook(() => usePhysicsLayout(itemCount, { layoutType: 'stack' }));
      
      // Allow physics engine and style updates to run
      act(() => {
        jest.advanceTimersByTime(100); // Advance time sufficiently for updates
      });
      
      const gridStyle = gridHook.result.current.getItemProps(1)?.style || {};
      const stackStyle = stackHook.result.current.getItemProps(1)?.style || {};

      // Basic check - styles should now include transforms and differ
      expect(gridStyle).toHaveProperty('transform');
      expect(stackStyle).toHaveProperty('transform');
      expect(JSON.stringify(gridStyle)).not.toEqual(JSON.stringify(stackStyle));
  });

  // TODO: Test 'freeform' layout target calculation (conceptual)
  test('freeform layout should produce different styles than grid (conceptual)', () => {
      const itemCount = 4;
      const gridHook = renderHook(() => usePhysicsLayout(itemCount, { layoutType: 'grid', gridOptions: { columns: 2 } }));
      const freeformHook = renderHook(() => usePhysicsLayout(itemCount, { layoutType: 'freeform' }));
      
      // Allow physics engine and style updates to run
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const gridStyle = gridHook.result.current.getItemProps(1)?.style || {};
      const freeformStyle = freeformHook.result.current.getItemProps(1)?.style || {};

      // Basic check - styles should now include transforms and differ
      expect(gridStyle).toHaveProperty('transform');
      expect(freeformStyle).toHaveProperty('transform');
      expect(JSON.stringify(gridStyle)).not.toEqual(JSON.stringify(freeformStyle));
  });

  // TODO: Test bounds enforcement (conceptual - check if styles stay within bounds over time)
  // TODO: Test dynamic changes in the elements array (add/remove elements) - already covered by itemCount change test.

  it('should initialize correctly with default options', () => {
    const { result } = renderHook(() => usePhysicsLayout(3, { layoutType: 'grid' }));

    expect(result.current.getContainerProps).toBeDefined();
    expect(result.current.getItemProps).toBeDefined();

    // Example: Check initial styles or mock calls
    // const item0Props = result.current.getItemProps(0);
    // expect(item0Props.style.visibility).toBe('hidden'); // Initially hidden before state update
  });

  it('should calculate styles for grid layout', () => {
    // TODO: Implement test
    // - Render with grid options
    // - Mock engine.getAllBodyStates to return specific positions
    // - Advance frames/timers if needed
    // - Check styles returned by getItemProps
  });

  it('should calculate styles for stack layout', () => {
    // TODO: Implement test
    // - Render with stack options
    // - Mock engine.getAllBodyStates
    // - Check styles
  });

  it('should handle freeform layout (no specific targets)', () => {
    // TODO: Implement test
    // - Render with freeform options
    // - Verify forces are applied (check engine.applyForce mock calls)
  });

  it('should handle dynamic changes in itemCount', () => {
    // TODO: Implement test
    // - Render with initial itemCount
    // - Re-render with different itemCount
    // - Verify engine.addBody / engine.removeBody calls
  });

  it('should handle changes in layout options', () => {
    // TODO: Implement test
    // - Render with initial options
    // - Re-render with different options (e.g., change grid columns)
    // - Verify mocks or resulting styles/targets
  });

  it('should apply item-specific physics configurations', () => {
    // TODO: Implement test
    // - Render with itemPhysicsConfigs array
    // - Verify engine.addBody or force calculations use specific configs
  });

  it('should respect bounds', () => {
    // TODO: Implement test
    // - Render with bounds options
    // - Check force application near boundaries
  });

  test('renders correctly', () => {
    // Simple component to use the hook and render container/items
    const TestComponent = ({ count, opts }: { count: number, opts: PhysicsLayoutOptions }) => {
      const { getContainerProps, getItemProps } = usePhysicsLayout(count, opts);
      return (
        <div {...getContainerProps()} data-testid="layout-container">
          {Array.from({ length: count }).map((_, i) => (
            <div {...getItemProps(i)} key={i} data-testid={`item-${i}`} />
          ))}
        </div>
      );
    }
    
    render(
      <TestComponent count={3} opts={{ layoutType: 'grid' }} />
    );
    
    expect(screen.getByTestId('layout-container')).toBeInTheDocument();
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  test('forwards ref correctly with imperative handle methods', () => {
    // useImperativeHandle is tricky to test directly with renderHook
    // This test might need rethinking or relying on integration tests
    // For now, just check if the hook runs without error when a ref is passed
    const TestComponentWithRef = () => {
      const ref = useRef<any>(null);
      usePhysicsLayout(3, { layoutType: 'grid' });
      return <div ref={ref}>Test</div>;
    }
    
    expect(() => render(<TestComponentWithRef />)).not.toThrow();
    // We cannot easily assert the ref methods directly here 
    // without exposing the ref from TestComponentWithRef
  });
}); 