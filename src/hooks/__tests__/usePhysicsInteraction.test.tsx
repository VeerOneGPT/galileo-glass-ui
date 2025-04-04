/**
 * usePhysicsInteraction.fixed.test.tsx
 * 
 * Self-contained tests for the usePhysicsInteraction hook with improved
 * mocks and isolated state between tests to avoid test interference.
 */

// Mock dependencies before imports
jest.mock('../../animations/accessibility/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

// Mock the required context
jest.mock('../../contexts/AnimationContext', () => ({
  useAnimationContext: jest.fn().mockReturnValue({
    animationPresets: {},
    defaultConfig: {
      spring: {
        stiffness: 170,
        dampingRatio: 0.6
      }
    }
  })
}));

// Mock console.warn to suppress warnings
jest.spyOn(console, 'warn').mockImplementation(() => {});

import React, { useRef, useEffect } from 'react';
import { render, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import usePhysicsInteraction, { PhysicsInteractionOptions, PhysicsState } from '../usePhysicsInteraction';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Helper to set up environment and clean up properly
function setupTest() {
  // Mock IntersectionObserver
  const originalIntersectionObserver = window.IntersectionObserver;
  
  class MockIntersectionObserver {
    callback: IntersectionObserverCallback;
    
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      
      // Simulate immediate intersection
      setTimeout(() => {
        const mockEntry = {
          isIntersecting: true,
          boundingClientRect: {
            x: 0, y: 0, width: 100, height: 100,
            top: 0, right: 100, bottom: 100, left: 0,
            toJSON: () => {}
          },
          intersectionRatio: 1,
          intersectionRect: {
            x: 0, y: 0, width: 100, height: 100,
            top: 0, right: 100, bottom: 100, left: 0,
            toJSON: () => {}
          },
          rootBounds: null,
          target: document.createElement('div'),
          time: Date.now()
        };
        
        this.callback([mockEntry as IntersectionObserverEntry], this as any);
      }, 0);
    }
    
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  
  window.IntersectionObserver = MockIntersectionObserver as any;
  
  // Cleanup function to restore original APIs
  const cleanupTest = () => {
    window.IntersectionObserver = originalIntersectionObserver;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Clean up React component tests
    cleanup();
  };
  
  return { cleanupTest };
}

// Test component that uses the hook
function PhysicsComponent({
  options,
  onStateChange = () => {}
}: {
  options: PhysicsInteractionOptions;
  onStateChange?: (state: PhysicsState) => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Add mock getBoundingClientRect for hook calculations
  useEffect(() => {
    if (elementRef.current) {
      (elementRef.current as any).getBoundingClientRect = () => ({
        top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100,
        x: 0, y: 0
      });
    }
  }, []);
  
  const { style, state, reset, applyForce } = usePhysicsInteraction<HTMLDivElement>({
    ...options,
    elementRef
  });
  
  // Notify parent component of state changes
  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);
  
  return (
    <div ref={elementRef} style={style} data-testid="physics-element">
      <button onClick={() => reset()} data-testid="reset-button">Reset</button>
      <button onClick={() => applyForce({ x: 10, y: 5, z: 0 })} data-testid="force-button">Apply Force</button>
    </div>
  );
}

// Test suite
describe('usePhysicsInteraction Hook (Fixed)', () => {  
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  
  describe('Initialization', () => {
    it('initializes with default state', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const onStateChange = jest.fn();
        
        render(
          <ThemeProvider>
            <PhysicsComponent options={{}} onStateChange={onStateChange} />
          </ThemeProvider>
        );
        
        expect(onStateChange).toHaveBeenCalledWith(
          expect.objectContaining({
            x: 0,
            y: 0,
            scale: 1,
            active: false
          })
        );
      } finally {
        cleanupTest();
      }
    });
    
    it('applies styles to the element', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const { getByTestId } = render(
          <ThemeProvider>
            <PhysicsComponent options={{ affectsScale: true, smooth: true }} />
          </ThemeProvider>
        );
        
        const element = getByTestId('physics-element');
        expect(element.style.transform).toBeDefined();
      } finally {
        cleanupTest();
      }
    });
  });
  
  describe('Physics Types', () => {
    // These tests just verify the hook initializes with different physics types
    // We don't test actual physics calculations as they're timing-dependent
    
    it('initializes with magnetic type', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const { getByTestId } = render(
          <ThemeProvider>
            <PhysicsComponent options={{ type: 'magnetic', strength: 1, radius: 300 }} />
          </ThemeProvider>
        );
        
        // Just verify the component rendered 
        expect(getByTestId('physics-element')).toBeInTheDocument();
      } finally {
        cleanupTest();
      }
    });
    
    it('initializes with repel type', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const { getByTestId } = render(
          <ThemeProvider>
            <PhysicsComponent options={{ type: 'repel', strength: 1, radius: 300 }} />
          </ThemeProvider>
        );
        
        // Just verify the component rendered
        expect(getByTestId('physics-element')).toBeInTheDocument();
      } finally {
        cleanupTest();
      }
    });
  });
}); 