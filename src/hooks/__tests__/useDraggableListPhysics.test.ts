import React, { createRef, RefObject } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useDraggableListPhysics } from '../useDraggableListPhysics';
import * as PhysicsEngineHook from '../../animations/physics/useGalileoPhysicsEngine';
import { Vector2D } from '../../animations/physics'; 

// --- Mock Data and Helpers ---

// Create a controlled mock implementation of the physics engine
const mockEngineState = new Map();
const mockLatestPosition = new Map();
const bodyIds = { current: new Map() };

const mockAddBody = jest.fn((options) => {
  const id = options.id || `body-${options?.userData?.listIndex ?? Math.random()}`;
  const initialPos = { ...(options.position || { x: 0, y: 0 }) };
  mockEngineState.set(id, {
     id,
     position: initialPos,
     angle: options.initialAngle || 0,
     velocity: { x: 0, y: 0 },
     angularVelocity: 0,
     isStatic: options.isStatic || false,
     targetPosition: { ...initialPos },
     userData: options.userData || {},
  });
  mockLatestPosition.set(id, { ...initialPos });
  return id;
});

const mockRemoveBody = jest.fn((id) => {
  mockEngineState.delete(id);
  mockLatestPosition.delete(id);
});

const mockApplyForce = jest.fn();
const mockGetBodyState = jest.fn();
const mockUpdate = jest.fn();

// Helper to update mock body state for testing
const mockUpdateBodyState = (id, updates) => {
  const currentState = mockEngineState.get(id) || {};
  const newState = { ...currentState, ...updates };
  
  // Handle special case for nested position
  if (updates.position) {
    mockLatestPosition.set(id, { ...updates.position });
    newState.position = { ...updates.position };
  }
  
  mockEngineState.set(id, newState);
  return newState;
};

// Create mock Element with properly implemented getBoundingClientRect
const createMockElement = (height = 50, width = 100): HTMLDivElement => {
  const element = document.createElement('div');
  
  // Add missing methods used by the hook
  element.setPointerCapture = jest.fn();
  element.releasePointerCapture = jest.fn();
  
  // Correctly implement getBoundingClientRect with toJSON
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: jest.fn(() => ({
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width: width,
      height: height,
      x: 0,
      y: 0,
      toJSON: () => ({
        top: 0, left: 0, right: width, bottom: height,
        width: width, height: height, x: 0, y: 0
      })
    })),
    configurable: true
  });
  
  Object.defineProperty(element, 'offsetWidth', { value: width });
  Object.defineProperty(element, 'offsetHeight', { value: height });
  
  return element;
};

// Helper to create multiple mock refs
const createMockRefs = (count: number, height = 50, width = 100): RefObject<HTMLDivElement>[] => {
  return Array.from({ length: count }, () => {
    const ref = createRef<HTMLDivElement>();
    // Explicitly set the current value with the correct type
    Object.defineProperty(ref, 'current', {
      value: createMockElement(height, width),
      writable: true
    });
    // Assert the type here as we know .current is set
    return ref as RefObject<HTMLDivElement>;
  });
};

// Mock the physics engine hook
jest.mock('../../animations/physics/useGalileoPhysicsEngine', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      addBody: mockAddBody,
      removeBody: mockRemoveBody,
      applyForce: mockApplyForce,
      getBodyState: mockGetBodyState,
      update: mockUpdate
    }))
  };
});

// Setup proper mock timing
let mockTime = 0;

// Mock performance.now
const originalPerformanceNow = global.performance.now;
global.performance.now = jest.fn(() => mockTime);

// Mock requestAnimationFrame
const originalRAF = global.requestAnimationFrame;
global.requestAnimationFrame = jest.fn(callback => {
  setTimeout(() => {
    mockTime += 16; // Advance time by 16ms (60fps)
    callback(mockTime);
  }, 0);
  return 1;
});

// Mock cancelAnimationFrame
const originalCAF = global.cancelAnimationFrame;
global.cancelAnimationFrame = jest.fn();

// Create a mock event factory to ensure correct types
type MockEventProps = {
  key?: string;
  pointerId?: number;
  clientX?: number;
  clientY?: number;
  target?: HTMLElement;
};

const createMockKeyboardEvent = (props: MockEventProps) => {
  return {
    key: props.key || '',
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    altKey: false,
    charCode: 0,
    ctrlKey: false,
    code: '',
    locale: '',
    location: 0,
    metaKey: false,
    repeat: false,
    shiftKey: false,
    which: 0
  } as unknown as React.KeyboardEvent<Element>;
};

const createMockPointerEvent = (props: MockEventProps) => {
  return {
    pointerId: props.pointerId || 1,
    clientX: props.clientX || 0,
    clientY: props.clientY || 0,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: props.target,
  } as unknown as React.PointerEvent<Element>;
};

describe('useDraggableListPhysics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEngineState.clear();
    mockLatestPosition.clear();
    bodyIds.current.clear();
    mockTime = 0;
    
    // Default implementation for getBodyState
    mockGetBodyState.mockImplementation(id => {
      const state = mockEngineState.get(id);
      return state ? {
        ...state,
        position: { ...(mockLatestPosition.get(id) || state.position) }
      } : null;
    });
  });
  
  afterEach(() => {
    jest.clearAllTimers();
  });
  
  // Restore original implementations
  afterAll(() => {
    global.performance.now = originalPerformanceNow;
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
  });

  it('should initialize and add bodies to the physics engine', () => {
    const itemCount = 3;
    const mockRefs = createMockRefs(itemCount);

    const { result } = renderHook(() => useDraggableListPhysics({ itemRefs: mockRefs }));

    expect(mockAddBody).toHaveBeenCalledTimes(itemCount);
    expect(result.current.styles.length).toBe(itemCount);
    expect(result.current.isDragging).toBe(false);
    expect(result.current.draggedIndex).toBeNull();
  });

  it('should remove bodies on unmount', () => {
    const itemCount = 2;
    const mockRefs = createMockRefs(itemCount);
    const { unmount } = renderHook(() => useDraggableListPhysics({ itemRefs: mockRefs }));

    expect(mockAddBody).toHaveBeenCalledTimes(itemCount);
    unmount();
    expect(mockRemoveBody).toHaveBeenCalledTimes(itemCount);
  });

  it('should provide handlers for all items', () => {
    const itemCount = 3;
    const mockRefs = createMockRefs(itemCount);

    const { result } = renderHook(() => useDraggableListPhysics({ itemRefs: mockRefs }));

    // Store body IDs for use in tests
    mockAddBody.mock.calls.forEach((call, index) => {
      const id = call[0].id || `body-${call[0].userData.listIndex}`;
      bodyIds.current.set(call[0].userData.listIndex, id);
    });

    // Check that handlers exist for all items
    for (let i = 0; i < itemCount; i++) {
      const handlers = result.current.getHandlers(i);
      expect(handlers).toBeDefined();
      expect(handlers.onPointerDown).toBeDefined();
      expect(handlers.onKeyDown).toBeDefined();
    }
  });

  it('should start dragging on pointer down', async () => {
    const itemCount = 3;
    const mockRefs = createMockRefs(itemCount);
    const { result } = renderHook(() => useDraggableListPhysics({ itemRefs: mockRefs }));

    // Store body IDs for use in tests
    mockAddBody.mock.calls.forEach((call, index) => {
      const id = call[0].id || `body-${call[0].userData.listIndex}`;
      bodyIds.current.set(call[0].userData.listIndex, id);
    });
    
    // Start dragging the first item
    const handlers = result.current.getHandlers(0);
    
    await act(async () => {
      handlers.onPointerDown(createMockPointerEvent({
        pointerId: 1,
        clientY: 25,
        clientX: 10,
        target: mockRefs[0].current as HTMLElement
      }));
      
      // Advance time and process state changes
      jest.advanceTimersByTime(100);
    });
    
    // Check if dragging started
    expect(result.current.isDragging).toBe(true);
    expect(result.current.draggedIndex).toBe(0);
    expect(mockRefs[0].current?.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should start and end keyboard dragging with space key', async () => {
    const itemCount = 3;
    const mockRefs = createMockRefs(itemCount);
    const { result } = renderHook(() => useDraggableListPhysics({ itemRefs: mockRefs }));

    // Store body IDs
    mockAddBody.mock.calls.forEach((call) => {
      const id = call[0].id || `body-${call[0].userData.listIndex}`;
      bodyIds.current.set(call[0].userData.listIndex, id);
    });
    
    // Get handlers for first item
    const handlers = result.current.getHandlers(0);
    
    // Start keyboard drag with space
    await act(async () => {
      handlers.onKeyDown(createMockKeyboardEvent({
        key: ' '
      }));
      
      // Advance timers to process state updates
      jest.advanceTimersByTime(100);
    });
    
    // Verify drag started
    expect(result.current.isDragging).toBe(true);
    expect(result.current.draggedIndex).toBe(0);
    
    // End drag with space
    await act(async () => {
      handlers.onKeyDown(createMockKeyboardEvent({
        key: ' '
      }));
      
      // Advance timers to process state updates
      jest.advanceTimersByTime(100);
    });
    
    // Verify drag ended
    expect(result.current.isDragging).toBe(false);
    expect(result.current.draggedIndex).toBeNull();
  });

  it('should reorder list when dragging down with keyboard', async () => {
    const itemCount = 3;
    const mockRefs = createMockRefs(itemCount);
    const handleOrderChange = jest.fn();
    
    const { result } = renderHook(() => useDraggableListPhysics({
      itemRefs: mockRefs,
      onOrderChange: handleOrderChange,
      direction: 'vertical'
    }));

    // Store body IDs
    mockAddBody.mock.calls.forEach((call) => {
      const id = call[0].id || `body-${call[0].userData.listIndex}`;
      bodyIds.current.set(call[0].userData.listIndex, id);
    });
    
    // Get handlers for first item
    const handlers = result.current.getHandlers(0);
    
    // Start keyboard drag
    await act(async () => {
      handlers.onKeyDown(createMockKeyboardEvent({
        key: ' '
      }));
      jest.advanceTimersByTime(50);
    });
    
    // Verify drag started
    expect(result.current.isDragging).toBe(true);
    expect(result.current.draggedIndex).toBe(0);
    
    // Move down with arrow key
    await act(async () => {
      handlers.onKeyDown(createMockKeyboardEvent({
        key: 'ArrowDown'
      }));
      jest.advanceTimersByTime(50);
    });
    
    // Check order change was called
    expect(handleOrderChange).toHaveBeenCalledWith([1, 0, 2]);
  });

  it('should cancel keyboard drag with Escape key and revert order', async () => {
    const itemCount = 3;
    const mockRefs = createMockRefs(itemCount);
    const handleOrderChange = jest.fn();
    
    const { result } = renderHook(() => useDraggableListPhysics({
      itemRefs: mockRefs,
      onOrderChange: handleOrderChange,
      direction: 'vertical'
    }));

    // Store body IDs
    mockAddBody.mock.calls.forEach((call) => {
      const id = call[0].id || `body-${call[0].userData.listIndex}`;
      bodyIds.current.set(call[0].userData.listIndex, id);
    });
    
    // Get handlers for first item
    let handlers = result.current.getHandlers(0);
    
    // Start keyboard drag
    await act(async () => {
      handlers.onKeyDown(createMockKeyboardEvent({
        key: ' '
      }));
      jest.advanceTimersByTime(50);
    });
    
    // Move down with arrow key
    await act(async () => {
      handlers.onKeyDown(createMockKeyboardEvent({
        key: 'ArrowDown'
      }));
      jest.advanceTimersByTime(50);
    });
    
    // Verify order changed
    expect(handleOrderChange).toHaveBeenCalledWith([1, 0, 2]);
    handleOrderChange.mockClear();
    
    // Cancel with Escape
    handlers = result.current.getHandlers(1); // Now item 0 is at index 1
    
    await act(async () => {
      handlers.onKeyDown(createMockKeyboardEvent({
        key: 'Escape'
      }));
      jest.advanceTimersByTime(50);
    });
    
    // Verify drag ended
    expect(result.current.isDragging).toBe(false);
    expect(result.current.draggedIndex).toBeNull();
    // No additional order change (revert would happen in the component using the hook)
    expect(handleOrderChange).not.toHaveBeenCalled();
  });
}); 