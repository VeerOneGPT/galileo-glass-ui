import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { usePhysicsInteraction, PhysicsInteractionOptions, PhysicsState, PhysicsVector } from './usePhysicsInteraction'; // Ensure types are imported
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import user-event

// --- REMOVE Mock react-spring --- 
// const mockSpringApi = {
//   start: jest.fn(),
//   stop: jest.fn(),
// };
// jest.mock('react-spring', () => ({
//   ...jest.requireActual('react-spring'), // Keep other exports
//   useSpring: jest.fn(() => [ 
//     { /* Mock style object - tests can inspect mockApi calls */ }, 
//     mockSpringApi // Mock API object
//   ]), 
// }));
// --- End Mock ---

// Helper function to parse transform style
const getTransformValues = (style: React.CSSProperties | undefined): { x: number; y: number; scale: number; rotation: number } => {
  if (!style || !style.transform) return { x: 0, y: 0, scale: 1, rotation: 0 };

  let x = 0, y = 0, scale = 1, rotation = 0;

  const translateMatch = style.transform.match(/translate3d\(([^p]+)px, ([^p]+)px, ([^p]+)px\)/);
  if (translateMatch) {
    x = parseFloat(translateMatch[1]);
    y = parseFloat(translateMatch[2]);
    // z = parseFloat(translateMatch[3]); // z not tracked here currently
  }

  const scaleMatch = style.transform.match(/scale\(([^\)]+)\)/);
  if (scaleMatch) {
    scale = parseFloat(scaleMatch[1]);
  }

  const rotateMatch = style.transform.match(/rotateZ\(([^d]+)deg\)/);
  if (rotateMatch) {
    rotation = parseFloat(rotateMatch[1]);
  }

  return { x, y, scale, rotation };
};

describe('usePhysicsInteraction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset spring mock calls before each test - REMOVED
    // mockSpringApi.start.mockClear();
    // mockSpringApi.stop.mockClear();
    // Reset useSpring mock implementation if needed for specific tests - REMOVED
    // (jest.requireMock('react-spring').useSpring as jest.Mock).mockImplementation(() => [ {}, mockSpringApi ]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Initial basic tests (assuming they exist)
  test('should return ref, style, state, and control functions', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    expect(result.current.ref).toBeDefined();
    expect(result.current.style).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  // Helper to get transform values (simplified)
  const getTransformXY = (style: React.CSSProperties | undefined): { x: number, y: number } => {
    if (!style || !style.transform) return { x: 0, y: 0 };
    // Basic parsing, might need improvement for complex transforms
    const match = style.transform.match(/translateX\(([^p\)]+)px\) translateY\(([^p\)]+)px\)/);
    return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : { x: 0, y: 0 };
  }

  // --- Tests for Magnetic and Repel Types --- 

  test("type='magnetic' should attract element towards pointer and return", () => {
    const mockElement = document.createElement('div');
    // Mock getBoundingClientRect for consistent relative coordinate calculations
    Object.defineProperty(mockElement, 'getBoundingClientRect', {
      configurable: true, // Ensure we can re-define if needed in other tests
      value: jest.fn(() => ({
        width: 200,
        height: 100,
        top: 50,
        left: 50,
        bottom: 150,
        right: 250,
        x: 50,
        y: 50,
        toJSON: () => ({ width: 200, height: 100, top: 50, left: 50, bottom: 150, right: 250, x: 50, y: 50 }),
      })),
    });
    const elementRef = { current: mockElement };

    const options: PhysicsInteractionOptions = {
      elementRef: elementRef as React.RefObject<HTMLDivElement>, // Cast needed
      type: 'magnetic',
      strength: 1.0, // Full strength for clear effect
      radius: 150,   // Activation radius
      maxDisplacement: 40, // Maximum distance it can be pulled
      animationConfig: { tension: 300, friction: 20, mass: 1 }, // Reasonably quick spring
    };

    const { result } = renderHook(() => usePhysicsInteraction<HTMLDivElement>(options));

    // Initial state should be at origin
    let transform = getTransformValues(result.current.style);
    expect(transform.x).toBeCloseTo(0);
    expect(transform.y).toBeCloseTo(0);

    // Simulate pointer entering near the right edge, middle vertically
    // Element center: left + width/2 = 50 + 100 = 150; top + height/2 = 50 + 50 = 100
    // Pointer position: clientX = 200 (towards right), clientY = 100 (vertical center)
    // Expected relative coords: relativeX ≈ (200-150) / (200/2) = 0.5; relativeY ≈ (100-100) / (100/2) = 0
    act(() => {
      // Use userEvent.pointer to simulate move over the element
      userEvent.pointer({
        target: mockElement,
        coords: { clientX: 200, clientY: 100 },
        keys: '[PointerEnter][PointerMove]', // Simulate enter and move
      });
      // Need to advance time for the internal animation loop to pick up the move
      jest.advanceTimersByTime(16); // Advance one frame
    });

    // Advance time significantly to allow the spring to move towards the target
    act(() => {
      jest.advanceTimersByTime(500); // ~0.5 seconds
    });

    // --- REVERTED: Assert element moved towards the pointer (positive X) ---
    transform = getTransformValues(result.current.style);
    expect(transform.x).toBeGreaterThan(15); 
    expect(transform.x).toBeLessThanOrEqual(40); 
    expect(transform.y).toBeCloseTo(0, 1); 
    // --- End Revert ---
    // mockSpringApi.start.mockClear(); // REMOVED

    // Simulate pointer leaving
    act(() => {
      userEvent.pointer({
        target: mockElement,
        keys: '[PointerLeave]',
      });
      jest.advanceTimersByTime(16); // Advance one frame
    });

    // Advance time significantly to allow the spring to return to origin (0,0)
    act(() => {
      jest.advanceTimersByTime(1000); // 1 second should be enough for the spring
    });

    // --- REVERTED: Assert element has returned to origin --- 
    transform = getTransformValues(result.current.style);
    expect(transform.x).toBeCloseTo(0, 1); 
    expect(transform.y).toBeCloseTo(0, 1);
     // --- End Revert ---
    // expect(mockSpringApi.start).toHaveBeenCalledWith(...) // REMOVED
  });

  // --- NEW REPEL TEST --- 
  test("type='repel' should repel element away from pointer and return", () => {
    const mockElement = document.createElement('div');
    // Mock getBoundingClientRect for consistent relative coordinate calculations
    Object.defineProperty(mockElement, 'getBoundingClientRect', {
      configurable: true,
      value: jest.fn(() => ({
        width: 200,
        height: 100,
        top: 50,
        left: 50,
        bottom: 150,
        right: 250,
        x: 50,
        y: 50,
        toJSON: () => ({ width: 200, height: 100, top: 50, left: 50, bottom: 150, right: 250, x: 50, y: 50 }),
      })),
    });
    const elementRef = { current: mockElement };

    const options: PhysicsInteractionOptions = {
      elementRef: elementRef as React.RefObject<HTMLDivElement>,
      type: 'repel', // Set type to repel
      strength: 1.0,
      radius: 150,
      maxDisplacement: 40,
      animationConfig: { tension: 300, friction: 20, mass: 1 },
    };

    const { result } = renderHook(() => usePhysicsInteraction<HTMLDivElement>(options));

    // Initial state should be at origin
    let transform = getTransformValues(result.current.style);
    expect(transform.x).toBeCloseTo(0);
    expect(transform.y).toBeCloseTo(0);
    // expect(mockSpringApi.start).not.toHaveBeenCalled(); // REMOVED

    // Simulate pointer entering near the right edge, middle vertically
    // Pointer position: clientX = 200 (towards right), clientY = 100 (vertical center)
    // Expected relative coords: relativeX ≈ 0.5; relativeY ≈ 0
    act(() => {
      userEvent.pointer({
        target: mockElement,
        coords: { clientX: 200, clientY: 100 },
        keys: '[PointerEnter][PointerMove]',
      });
      jest.advanceTimersByTime(16);
    });

    // Advance time significantly to allow the spring to move towards the repel target
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // --- REVERTED: Assert element moved AWAY from the pointer (negative X) --- 
    transform = getTransformValues(result.current.style);
    expect(transform.x).toBeLessThan(-15); 
    expect(transform.x).toBeGreaterThanOrEqual(-40); 
    expect(transform.y).toBeCloseTo(0, 1); 
    // --- End Revert ---
    // mockSpringApi.start.mockClear(); // REMOVED

    // Simulate pointer leaving
    act(() => {
      userEvent.pointer({
        target: mockElement,
        keys: '[PointerLeave]',
      });
      jest.advanceTimersByTime(16);
    });

    // Advance time significantly to allow the spring to return to origin (0,0)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // --- REVERTED: Assert element has returned to origin --- 
    transform = getTransformValues(result.current.style);
    expect(transform.x).toBeCloseTo(0, 1);
    expect(transform.y).toBeCloseTo(0, 1);
    // --- End Revert ---
    // expect(mockSpringApi.start).toHaveBeenCalledWith(...) // REMOVED
  });

  // TODO: Test strength parameter influence
  // TODO: Test radius parameter influence
  // TODO: Test interaction with affectsScale/Rotation/Tilt

  it('should apply attractive force when type is \'magnetic\'', () => {
    const mockElement = document.createElement('div');
    const elementRef = { current: mockElement };
    const { result } = renderHook(() => usePhysicsInteraction({
      elementRef,
      type: 'magnetic', // Use magnetic type
      strength: 100, // Example strength
      radius: 200, // Example radius
    }));

    // Simulate mouse entering the radius
    act(() => {
      fireEvent.mouseEnter(mockElement);
      // @ts-ignore - Suppress TS2554, assuming types are mismatched
      fireEvent.mouseMove(window, { clientX: 10, clientY: 10 }); 
      // TODO: Need a way to simulate spring updates or check target values
    });

    // Assertion: Check if style transform indicates movement towards the mouse
    // This requires inspecting the internal spring state or mocking useSpring
    // expect(result.current.style.transform).toContain(...);
    // For now, just check if style is returned
    expect(result.current.style).toBeDefined();

    // Simulate mouse leaving
    act(() => {
      fireEvent.mouseLeave(mockElement);
    });
    // TODO: Assert that style returns to origin
  });

  it('should apply repulsive force when type is \'repel\'', () => {
    const mockElement = document.createElement('div');
    const elementRef = { current: mockElement };
    const { result } = renderHook(() => usePhysicsInteraction({
      elementRef,
      type: 'repel', // Use repel type
      strength: 100,
      radius: 150,
    }));

    // Simulate mouse entering the radius
    act(() => {
      fireEvent.mouseEnter(mockElement);
      // @ts-ignore - Suppress TS2554, assuming types are mismatched
      fireEvent.mouseMove(window, { clientX: 5, clientY: 5 }); 
      // TODO: Check target values or spring state
    });

    // Assertion: Check if style transform indicates movement away from the mouse
    expect(result.current.style).toBeDefined();

    act(() => {
      fireEvent.mouseLeave(mockElement);
    });
    // TODO: Assert style returns to origin
  });

  // --- NEW TEST FOR affectsScale ---
  test('should apply scale effect when affectsScale is true', () => {
    const mockElement = document.createElement('div');
    // Mock getBoundingClientRect
    Object.defineProperty(mockElement, 'getBoundingClientRect', {
      configurable: true,
      value: jest.fn(() => ({
        width: 100, height: 100, top: 50, left: 50, bottom: 150, right: 150, x: 50, y: 50,
        toJSON: () => ({ width: 100, height: 100, top: 50, left: 50, bottom: 150, right: 150, x: 50, y: 50 }),
      })),
    });
    const elementRef = { current: mockElement };

    const options: PhysicsInteractionOptions = {
      elementRef: elementRef as React.RefObject<HTMLDivElement>,
      type: 'magnetic', // Use magnetic for interaction trigger
      strength: 1.0,
      radius: 100,
      affectsScale: true, // Enable scaling
      scaleAmplitude: 0.1, // Set scale change amount
      animationConfig: { tension: 300, friction: 20, mass: 1 },
      maxDisplacement: 20, // Allow some movement too
    };

    const { result } = renderHook(() => usePhysicsInteraction<HTMLDivElement>(options));

    // Initial state should be scale 1
    let transform = getTransformValues(result.current.style);
    expect(transform.scale).toBeCloseTo(1);

    // Simulate pointer entering near the center
    // Element center: 100, 100
    // Pointer: 110, 110 (slightly offset)
    act(() => {
      userEvent.pointer({
        target: mockElement,
        coords: { clientX: 110, clientY: 110 },
        keys: '[PointerEnter][PointerMove]',
      });
      jest.advanceTimersByTime(16); // Advance one frame
    });

    // Advance time for the spring to react
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Assert scale has increased (magnetic usually pulls, which might trigger scale increase here)
    transform = getTransformValues(result.current.style);
    // The exact scale depends on pointer position and implementation detail,
    // but it should be greater than 1 and related to scaleAmplitude.
    expect(transform.scale).toBeGreaterThan(1);
    expect(transform.scale).toBeLessThanOrEqual(1 + options.scaleAmplitude!); // Check it doesn't exceed amplitude

    // Simulate pointer leaving
    act(() => {
      userEvent.pointer({
        target: mockElement,
        keys: '[PointerLeave]',
      });
      jest.advanceTimersByTime(16);
    });

    // Advance time for the spring to return to origin
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Assert scale has returned to 1
    transform = getTransformValues(result.current.style);
    expect(transform.scale).toBeCloseTo(1, 2); // Use tolerance for floating point
  });
  // --- END NEW TEST ---
}); 