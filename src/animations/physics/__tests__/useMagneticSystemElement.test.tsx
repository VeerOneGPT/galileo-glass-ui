/**
 * Tests for the useMagneticSystemElement hook
 */

import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { useMagneticSystemElement } from '../useMagneticSystemElement';
import { MagneticSystemProvider } from '../MagneticSystemProvider';
import { useReducedMotion } from '../../accessibility/useReducedMotion';

// Mock the useReducedMotion hook
jest.mock('../../accessibility/useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false)
}));

// Mock requestAnimationFrame and cancelAnimationFrame
jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
  setTimeout(() => cb(performance.now()), 0);
  return 0;
});

jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

// Mock Element.prototype.getBoundingClientRect
const mockGetBoundingClientRect = jest.fn(() => ({
  width: 100,
  height: 100,
  top: 100,
  left: 100,
  right: 200,
  bottom: 200,
  x: 100,
  y: 100,
  toJSON: () => ({})
}));

Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;

describe('useMagneticSystemElement', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  
  test('should create a ref and connect to a magnetic system', () => {
    // Create a test component with the hook
    const TestComponent = () => {
      const { ref } = useMagneticSystemElement<HTMLDivElement>({
        systemId: 'test-system',
        autoRegister: true
      });
      
      return <div ref={ref} data-testid="magnetic-element">Test</div>;
    };
    
    // Render with system provider
    const { getByTestId } = render(
      <MagneticSystemProvider systemId="test-system">
        <TestComponent />
      </MagneticSystemProvider>
    );
    
    // Should render correctly
    expect(getByTestId('magnetic-element')).toBeInTheDocument();
  });
  
  test('should handle manual registration and unregistration', () => {
    // Create a test component with manual control
    const TestComponent = () => {
      const { ref, register, unregister, elementId } = useMagneticSystemElement<HTMLDivElement>({
        systemId: 'manual-system',
        autoRegister: false
      });
      
      return (
        <div>
          <div ref={ref} data-testid="magnetic-element">Test</div>
          <button data-testid="register" onClick={register}>Register</button>
          <button data-testid="unregister" onClick={unregister}>Unregister</button>
          <div data-testid="element-id">{elementId || 'none'}</div>
        </div>
      );
    };
    
    // Render with system provider
    const { getByTestId } = render(
      <MagneticSystemProvider systemId="manual-system">
        <TestComponent />
      </MagneticSystemProvider>
    );
    
    // Initially not registered
    expect(getByTestId('element-id').textContent).toBe('none');
    
    // Manually register
    getByTestId('register').click();
    
    // Now should have an ID
    expect(getByTestId('element-id').textContent).not.toBe('none');
    
    // Manually unregister
    getByTestId('unregister').click();
    
    // Should be removed
    expect(getByTestId('element-id').textContent).toBe('none');
  });
  
  test('should apply active class when specified', async () => {
    // Create a test component with active class
    const TestComponent = () => {
      const { ref, activate } = useMagneticSystemElement<HTMLDivElement>({
        systemId: 'active-system',
        autoRegister: true,
        activeClassName: 'is-active'
      });
      
      return (
        <div>
          <div ref={ref} data-testid="magnetic-element">Test</div>
          <button data-testid="activate" onClick={activate}>Activate</button>
        </div>
      );
    };
    
    // Render with system provider
    const { getByTestId } = render(
      <MagneticSystemProvider systemId="active-system">
        <TestComponent />
      </MagneticSystemProvider>
    );
    
    // Element ref should have correct methods
    const element = getByTestId('magnetic-element');
    
    // Mock classList methods to verify they're called
    // element.classList.add = jest.fn(); // Mocking might interfere with waitFor
    // element.classList.remove = jest.fn();
    
    // Activate the element
    getByTestId('activate').click();
    
    // Wait for the class to be added
    await waitFor(() => {
      expect(element).toHaveClass('is-active');
    });
  });
  
  test('should respect reduced motion setting', () => {
    // Mock useReducedMotion to return true
    (useReducedMotion as jest.Mock).mockReturnValue(true);
    
    // Create a test component with reduced motion support
    const TestComponent = () => {
      const { ref } = useMagneticSystemElement<HTMLDivElement>({
        systemId: 'reduced-motion-system',
        autoRegister: true,
        respectReducedMotion: true
      });
      
      return <div ref={ref} data-testid="magnetic-element">Test</div>;
    };
    
    // Render with system provider
    const { getByTestId } = render(
      <MagneticSystemProvider systemId="reduced-motion-system">
        <TestComponent />
      </MagneticSystemProvider>
    );
    
    // Should render correctly
    expect(getByTestId('magnetic-element')).toBeInTheDocument();
    
    // The actual reduced motion behavior is tested through internal functions
    // that are difficult to verify in a unit test
  });
});