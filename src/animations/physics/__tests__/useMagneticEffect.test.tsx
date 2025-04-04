import React, { useRef } from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { useMagneticEffect } from '../useMagneticEffect';
import { useReducedMotion } from '../../accessibility/useReducedMotion';

// Mock the useReducedMotion hook
jest.mock('../../accessibility/useReducedMotion', () => ({
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

// Test Component: Uses the real hook, assuming it returns the ref directly
const TestComponent = ({ options }: { options: any }) => { // Use 'any' for options type temporarily
  // Assume the hook returns the ref object directly
  const magneticRef = useMagneticEffect(options); 
  return <div data-testid="magnetic-target" ref={magneticRef} style={{ width: 100, height: 50 }}>Target</div>;
};

describe('useMagneticEffect', () => {
  // Add fake timer setup/teardown
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock MutationObserver (if needed by the hook)
    global.MutationObserver = class {
        observe = jest.fn();
        disconnect = jest.fn();
        constructor(callback: MutationCallback) {}
    } as any;
    // Clear other mocks
    jest.clearAllMocks();
    (useReducedMotion as jest.Mock).mockReturnValue(false); // Reset reduced motion mock
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('updates transform based on mouse position within radius', () => {
    // Pass the options object to the TestComponent
    render(<TestComponent options={{
        strength: 0.5,
        radius: 200,
        damping: 0.9
    }} />);
    const targetElement = screen.getByTestId('magnetic-target');
    // Mock getBoundingClientRect
    targetElement.getBoundingClientRect = jest.fn(() => ({
        width: 100, height: 50, top: 100, left: 100, bottom: 150, right: 200, x: 100, y: 100, toJSON: () => this
    }));

    // Simulate mouse enter & move (dispatch move on window)
    act(() => {
        fireEvent.mouseEnter(targetElement);
    });
    act(() => {
       const moveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 125, bubbles: true, cancelable: true });
       fireEvent(window, moveEvent); 
    });

    // Advance timers & run pending
    act(() => {
        jest.advanceTimersByTime(16.667); 
        jest.runOnlyPendingTimers();
    });
    
    expect(targetElement.style.transform).toContain('translate3d');
  });

  it('resets transform when mouse leaves radius', () => {
    render(<TestComponent options={{
        strength: 0.5,
        radius: 200,
        damping: 0.9
    }} />);
    const targetElement = screen.getByTestId('magnetic-target');
    targetElement.getBoundingClientRect = jest.fn(() => ({
        width: 100, height: 50, top: 100, left: 100, bottom: 150, right: 200, x: 100, y: 100, toJSON: () => this
    }));

    // Enter, Move, Advance
    act(() => {
        fireEvent.mouseEnter(targetElement);
        const moveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 125, bubbles: true, cancelable: true });
        fireEvent(window, moveEvent); 
        jest.advanceTimersByTime(16.667);
        jest.runOnlyPendingTimers(); 
    });
    const initialTransform = targetElement.style.transform;
    expect(initialTransform).toContain('translate3d');

    // Leave
    act(() => {
        fireEvent.mouseLeave(targetElement); 
    });

    // Advance timers & run pending
    act(() => {
        jest.advanceTimersByTime(500);
        jest.runOnlyPendingTimers();
    });

    expect(targetElement.style.transform).not.toBe(initialTransform);
    // Check against the expected reset style string
    expect(targetElement.style.transform).toBe('translate3d(0px, 0px, 0px) scale(1) rotate(0deg)'); 
  });

  it('does not apply transform when reduced motion is preferred', () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true); 

    render(<TestComponent options={{
        strength: 0.5,
        radius: 200,
        damping: 0.9
    }} />);
    const targetElement = screen.getByTestId('magnetic-target');
    targetElement.getBoundingClientRect = jest.fn(() => ({
        width: 100, height: 50, top: 100, left: 100, bottom: 150, right: 200, x: 100, y: 100, toJSON: () => this
    }));

    // Enter, Move, Advance
    act(() => {
      fireEvent.mouseEnter(targetElement);
      const moveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 125, bubbles: true, cancelable: true });
      fireEvent(window, moveEvent);
      jest.advanceTimersByTime(16.667); 
      jest.runOnlyPendingTimers();
    });

    // Expect the reset style string
    expect(targetElement.style.transform).toBe('translate3d(0px, 0px, 0px) scale(1) rotate(0deg)');
  });
});