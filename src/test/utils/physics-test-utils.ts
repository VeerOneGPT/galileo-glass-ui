/**
 * Physics Testing Utilities
 * 
 * Provides utilities for testing physics-related functionality
 */
import { waitFor } from '@testing-library/react';
import { runAnimationFrame } from '../helpers/animation-test-utils';

/**
 * Interface for a simple vector
 */
export interface Vector {
  x: number;
  y: number;
  z?: number;
}

/**
 * Wait for physics simulation to stabilize
 * @param timeMs Time to wait in ms
 */
export const waitForPhysicsToSettle = async (timeMs = 100): Promise<void> => {
  // Advance mock timer if using fake timers
  if (jest.isMockFunction(setTimeout)) {
    jest.advanceTimersByTime(timeMs);
  }
  
  // Wait for any pending state updates
  await waitFor(() => {}, { timeout: timeMs + 50 });
};

/**
 * Run physics simulation for a number of frames
 * @param frameCount Number of physics steps to simulate
 * @param deltaMs Time delta per step in ms
 */
export const runPhysicsSimulation = (frameCount: number, deltaMs = 16.667): void => {
  for (let i = 0; i < frameCount; i++) {
    runAnimationFrame(deltaMs);
  }
};

/**
 * Compares vectors with tolerance for floating point errors
 * @param a First vector
 * @param b Second vector
 * @param tolerance Allowed difference between components
 */
export const vectorsAreEqual = (a: Vector, b: Vector, tolerance = 0.001): boolean => {
  if (Math.abs(a.x - b.x) > tolerance) return false;
  if (Math.abs(a.y - b.y) > tolerance) return false;
  
  // If z is defined in both vectors, compare it
  if (a.z !== undefined && b.z !== undefined) {
    if (Math.abs(a.z - b.z) > tolerance) return false;
  }
  
  return true;
};

/**
 * Creates a mock physics body with given properties
 * @param id Body ID
 * @param position Initial position
 * @param options Additional body options
 */
export const createMockBody = (id: string, position: Vector, options: Record<string, any> = {}) => {
  return {
    id,
    position: { ...position },
    velocity: { x: 0, y: 0, z: 0 },
    forces: [],
    ...options
  };
}; 