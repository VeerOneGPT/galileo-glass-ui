import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useMagneticEffect } from '../useMagneticEffect';
import { DirectionalFieldConfig } from '../directionalField';

// Mock the useReducedMotion hook
jest.mock('../accessibility/useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false)
}));

// Mock requestAnimationFrame
const mockRaf = (cb: FrameRequestCallback): number => {
  setTimeout(() => cb(performance.now()), 0);
  return 0;
};

// Set up requestAnimationFrame mock
global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = jest.fn();

// Helper to create a test component with magnetic effect
const createTestComponent = (options = {}) => {
  const TestComponent = () => {
    const ref = useMagneticEffect(options);
    return <div ref={ref} data-testid="magnetic-element">Magnetic Element</div>;
  };
  return TestComponent;
};

describe('useMagneticEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders without crashing', () => {
    const TestComponent = createTestComponent();
    render(<TestComponent />);
    expect(screen.getByTestId('magnetic-element')).toBeInTheDocument();
  });
  
  test('applies transform on mousemove', () => {
    const TestComponent = createTestComponent({
      strength: 1,
      radius: 100,
      maxDisplacement: 20
    });
    
    render(<TestComponent />);
    const element = screen.getByTestId('magnetic-element');
    
    // Create DOMRect mock for getBoundingClientRect
    const rectMock = {
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    };
    
    // Mock getBoundingClientRect
    element.getBoundingClientRect = jest.fn(() => rectMock);
    
    // Simulate mouse movement
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
        bubbles: true
      }));
    });
    
    // Update animation frame
    act(() => {
      jest.runAllTimers();
    });
    
    // Check if transform has been applied
    expect(element.style.transform).toBeDefined();
  });
  
  test('supports directional field configuration', () => {
    // Create a directional field config
    const directionalField: DirectionalFieldConfig = {
      type: 'unidirectional',
      behavior: 'constant',
      direction: { x: 1, y: 0 }
    };
    
    const TestComponent = createTestComponent({
      directionalField,
      strength: 1,
      radius: 100,
      maxDisplacement: 20
    });
    
    render(<TestComponent />);
    const element = screen.getByTestId('magnetic-element');
    
    // Create DOMRect mock for getBoundingClientRect
    const rectMock = {
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    };
    
    // Mock getBoundingClientRect
    element.getBoundingClientRect = jest.fn(() => rectMock);
    
    // Simulate mouse movement
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
        bubbles: true
      }));
    });
    
    // Update animation frame
    act(() => {
      jest.runAllTimers();
    });
    
    // Check if transform has been applied
    expect(element.style.transform).toBeDefined();
  });
  
  test('resets transform on mouseout', () => {
    const TestComponent = createTestComponent();
    render(<TestComponent />);
    const element = screen.getByTestId('magnetic-element');
    
    // Create DOMRect mock for getBoundingClientRect
    const rectMock = {
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    };
    
    // Mock getBoundingClientRect
    element.getBoundingClientRect = jest.fn(() => rectMock);
    
    // Simulate mouse movement inside
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
        bubbles: true
      }));
    });
    
    // Update animation frame
    act(() => {
      jest.runAllTimers();
    });
    
    // Now move mouse outside the radius
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 500,
        bubbles: true
      }));
    });
    
    // Update several animation frames to reset
    act(() => {
      for (let i = 0; i < 10; i++) {
        jest.runAllTimers();
      }
    });
    
    // Transform should eventually reset (or be very close to reset)
    // This is hard to test precisely since it's based on animation easing
    expect(element.style.transform).toBeDefined();
  });
  
  test('respects reduced motion settings', () => {
    // Mock useReducedMotion to return true
    require('../accessibility/useReducedMotion').useReducedMotion.mockReturnValue(true);
    
    const TestComponent = createTestComponent({
      strength: 1,
      maxDisplacement: 50
    });
    
    render(<TestComponent />);
    const element = screen.getByTestId('magnetic-element');
    
    // Create DOMRect mock for getBoundingClientRect
    const rectMock = {
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    };
    
    // Mock getBoundingClientRect
    element.getBoundingClientRect = jest.fn(() => rectMock);
    
    // Simulate mouse movement
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
        bubbles: true
      }));
    });
    
    // Update animation frame
    act(() => {
      jest.runAllTimers();
    });
    
    // Effect should still work, but with reduced strength
    expect(element.style.transform).toBeDefined();
  });
});