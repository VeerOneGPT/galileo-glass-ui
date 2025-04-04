/**
 * usePhysicsLayout.fixed.test.tsx
 * 
 * Self-contained tests for the usePhysicsLayout hook with improved
 * mocks and isolated state between tests to avoid test interference.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
// Import helpers from test-utils
import { waitForPhysics, runAllRafs } from '../../test/utils/test-utils';
import { usePhysicsLayout } from '../usePhysicsLayout';
import { PhysicsLayoutOptions, LayoutType } from '../../types/hooks';

// Polyfill performance.now() for Node.js environment
if (typeof window.performance === 'undefined') {
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(() => Date.now())
    },
    writable: true
  });
}

// Mock the physics engine hook
// Export mock functions for checking calls
export const mockAddBody = jest.fn((options) => options.id || `mock_body_${Math.random()}`);
export const mockRemoveBody = jest.fn();
export const mockGetAllBodyStates = jest.fn(() => new Map());
export const mockApplyForce = jest.fn();
export const mockGetBodyState = jest.fn((id) => ({
    id,
    position: { x: 0, y: 0 }, 
    velocity: { x: 0, y: 0 }, 
    angle: 0,
    angularVelocity: 0,
    isStatic: false,
    userData: {}
}));
export const mockUpdateBodyState = jest.fn();

// Mock function to setup body state for testing calculations
export const mockSetBodyState = jest.fn((id, state) => {
  const allStates = mockGetAllBodyStates();
  allStates.set(id, { ...mockGetBodyState(id), ...state });
  mockGetAllBodyStates.mockReturnValue(allStates);
});

// Create a fresh engine instance for each test to avoid state leakage
const createMockEngine = () => ({
  addBody: mockAddBody,
  removeBody: mockRemoveBody,
  getAllBodyStates: mockGetAllBodyStates,
  applyForce: mockApplyForce,
  getBodyState: mockGetBodyState,
  updateBodyState: mockUpdateBodyState,
});

// Mock hooks/external modules
jest.mock('../../animations/physics', () => ({
  useGalileoPhysicsEngine: jest.fn(() => createMockEngine()), 
}));

// Mock element size for consistent layout calculations
const mockElementSize = { width: 100, height: 50 };

describe('usePhysicsLayout Hook (Fixed)', () => {
  // Set up fake timers for consistent timing
  beforeEach(() => {
    jest.useFakeTimers();
    
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up a default empty body state map
    const emptyMap = new Map();
    mockGetAllBodyStates.mockReturnValue(emptyMap);
    
    // Mock getBoundingClientRect for container and elements
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: function() { return this; }
    }));
    
    // Mock requestAnimationFrame without immediately calling callback
    // This gives more control over when animations execute
    window.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(() => cb(Date.now()), 0);
      return 1;
    });
    window.cancelAnimationFrame = jest.fn();
  });
  
  afterEach(() => {
    // Clean up timers
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  // Basic functionality tests
  it('should initialize correctly', () => {
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    const { result } = renderHook(() => usePhysicsLayout(5, options));
    
    expect(result.current.getContainerProps).toBeDefined();
    expect(result.current.getItemProps).toBeDefined();
    expect(mockAddBody).toHaveBeenCalledTimes(5);
  });

  it('should return container props with relative position', () => {
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    const { result } = renderHook(() => usePhysicsLayout(3, options));
    
    const containerProps = result.current.getContainerProps();
    expect(containerProps.style).toHaveProperty('position', 'relative');
  });

  it('should return item props with absolute position', () => {
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    const { result } = renderHook(() => usePhysicsLayout(1, options));
    
    const itemProps = result.current.getItemProps(0);
    expect(itemProps?.style).toHaveProperty('position', 'absolute');
  });

  it('should return undefined for out-of-bounds index', () => {
    const itemCount = 5;
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    const { result } = renderHook(() => usePhysicsLayout(itemCount, options));
    
    const outOfBoundsProps = result.current.getItemProps(itemCount);
    expect(outOfBoundsProps).toBeUndefined();
  });

  it('should provide style objects through getItemProps', () => {
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    const { result } = renderHook(() => usePhysicsLayout(1, options));
    
    const itemProps = result.current.getItemProps(0);
    expect(itemProps?.style).toEqual(
      expect.objectContaining({ position: 'absolute' })
    );
  });

  // Dynamic update tests
  it('should add bodies when itemCount increases', async () => {
    const initialItemCount = 2;
    const finalItemCount = 5;
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    
    const { rerender } = renderHook(({ count, opts }) => usePhysicsLayout(count, opts), {
      initialProps: { count: initialItemCount, opts: options },
    });
    
    // Flush timers to allow component effects to run
    await waitForPhysics();
    
    expect(mockAddBody).toHaveBeenCalledTimes(initialItemCount);
    mockAddBody.mockClear();
    
    rerender({ count: finalItemCount, opts: options });
    
    // Wait for physics updates after re-render
    await waitForPhysics();
    
    expect(mockAddBody).toHaveBeenCalledTimes(finalItemCount - initialItemCount);
  });

  it('should call removeBody when itemCount decreases', async () => {
    const initialItemCount = 5;
    const finalItemCount = 2;
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    
    const { rerender } = renderHook(({ count, opts }) => usePhysicsLayout(count, opts), {
      initialProps: { count: initialItemCount, opts: options },
    });
    
    // Initial render and physics settle
    await waitForPhysics();
    expect(mockAddBody).toHaveBeenCalledTimes(initialItemCount);

    // Re-render with fewer items
    rerender({ count: finalItemCount, opts: options });

    // Wait for physics updates and cleanup
    await waitForPhysics();
    
    expect(mockRemoveBody).toHaveBeenCalledTimes(initialItemCount - finalItemCount);
  });

  // Layout-specific tests
  it('should use grid layout configuration', async () => {
    const options: PhysicsLayoutOptions = { 
      layoutType: 'grid',
      gridOptions: { 
        columns: 3,
        rowSpacing: 20,
        columnSpacing: 15
      } 
    };
    
    renderHook(() => usePhysicsLayout(9, options));
    
    // Wait for physics to apply forces
    await waitForPhysics(10);
    
    expect(mockApplyForce).toHaveBeenCalled();
  });

  it('should use stack layout configuration', async () => {
    const options: PhysicsLayoutOptions = { 
      layoutType: 'stack',
      stackOptions: {
        direction: 'vertical',
        spacing: 10,
        offsetStep: { x: 5, y: 0 }
      } 
    };
    
    renderHook(() => usePhysicsLayout(5, options));
    
    // Wait for physics to apply forces
    await waitForPhysics(10);
    
    expect(mockApplyForce).toHaveBeenCalled();
  });

  it('should apply forces based on layout targets', async () => {
    // This test mocks the engine state to verify force application
    const options: PhysicsLayoutOptions = { layoutType: 'grid' };
    const bodyId = 'test_body_1';
    
    // Setup mock body states map
    const mockBodyStates = new Map();
    mockBodyStates.set(bodyId, {
      id: bodyId,
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      angle: 0,
      isStatic: false,
      userData: { index: 0 }
    });
    mockGetAllBodyStates.mockReturnValue(mockBodyStates);
    
    // Render hook to start physics simulation
    renderHook(() => usePhysicsLayout(1, options));
    
    // Wait for physics to apply forces
    await waitForPhysics(10);
    
    // Verify that engine methods were called
    expect(mockApplyForce).toHaveBeenCalled();
  });

  it('should handle custom item physics configurations', async () => {
    const options: PhysicsLayoutOptions = { 
      layoutType: 'grid',
      physicsConfig: { stiffness: 0.5, damping: 0.9 },
      itemPhysicsConfigs: [
        { stiffness: 0.2, damping: 0.7 },
        { mass: 2.0 }
      ]
    };
    
    renderHook(() => usePhysicsLayout(3, options));
    
    // Wait for physics updates
    await waitForPhysics(10);
    
    expect(mockAddBody).toHaveBeenCalledWith(expect.objectContaining({ config: { tension: 500 } }));
    expect(mockAddBody).toHaveBeenCalledWith(expect.objectContaining({ config: { tension: 170 } })); // Default
  });
}); 