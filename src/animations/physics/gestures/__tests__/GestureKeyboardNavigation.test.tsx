/**
 * Tests for GestureKeyboardNavigation
 * 
 * These tests verify that the keyboard navigation alternatives for gesture interactions
 * work correctly and provide appropriate accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  useKeyboardGestureAlternatives,
  KeyboardActivationMode,
  KeyboardFeedbackType,
  createKeyboardMapping
} from '../GestureKeyboardNavigation';
import { GestureType, GestureState } from '../GestureDetector';

// Simple test component that uses the keyboard gesture hook
const TestComponent: React.FC<{
  onGestureEvent?: jest.Mock;
  activationMode?: KeyboardActivationMode;
  feedbackType?: KeyboardFeedbackType;
  enabled?: boolean;
}> = ({ 
  onGestureEvent = jest.fn(), 
  activationMode = KeyboardActivationMode.FOCUS,
  feedbackType = KeyboardFeedbackType.BOTH,
  enabled = true
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  
  const {
    isKeyboardModeActive,
    activateKeyboardMode,
    deactivateKeyboardMode,
    activeGestureType,
    resetGestureState,
    ariaAttributes
  } = useKeyboardGestureAlternatives({
    elementRef,
    activationMode,
    feedbackType,
    enabled,
    onGestureEvent,
    onKeyboardModeActivate: jest.fn(),
    onKeyboardModeDeactivate: jest.fn()
  });
  
  return (
    <div>
      <div 
        ref={elementRef}
        data-testid="gesture-element"
        style={{ width: '200px', height: '200px', backgroundColor: '#eee' }}
        {...ariaAttributes}
      >
        Gesture Element
      </div>
      <div data-testid="status">
        {isKeyboardModeActive ? 'Active' : 'Inactive'}
      </div>
      <div data-testid="gesture-type">
        {activeGestureType || 'None'}
      </div>
      <button 
        data-testid="activate-btn"
        onClick={() => activateKeyboardMode()}
      >
        Activate
      </button>
      <button 
        data-testid="deactivate-btn"
        onClick={() => deactivateKeyboardMode()}
      >
        Deactivate
      </button>
      <button 
        data-testid="reset-btn"
        onClick={() => resetGestureState()}
      >
        Reset
      </button>
    </div>
  );
};

describe('GestureKeyboardNavigation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('should activate keyboard mode on focus when using FOCUS activation mode', () => {
    const { getByTestId } = render(<TestComponent activationMode={KeyboardActivationMode.FOCUS} />);
    const element = getByTestId('gesture-element');
    const status = getByTestId('status');
    
    // Initially inactive
    expect(status).toHaveTextContent('Inactive');
    
    // Focus the element
    act(() => {
      element.focus();
    });
    
    // Should become active
    expect(status).toHaveTextContent('Active');
  });
  
  test('should activate and deactivate keyboard mode programmatically', () => {
    const { getByTestId } = render(<TestComponent activationMode={KeyboardActivationMode.EXPLICIT} />);
    const status = getByTestId('status');
    const activateBtn = getByTestId('activate-btn');
    const deactivateBtn = getByTestId('deactivate-btn');
    
    // Initially inactive
    expect(status).toHaveTextContent('Inactive');
    
    // Activate
    act(() => {
      activateBtn.click();
    });
    expect(status).toHaveTextContent('Active');
    
    // Deactivate
    act(() => {
      deactivateBtn.click();
    });
    expect(status).toHaveTextContent('Inactive');
  });
  
  test('should trigger tap gesture on Enter key', () => {
    const mockGestureEvent = jest.fn();
    const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
    const element = getByTestId('gesture-element');
    
    // Focus and activate
    act(() => {
      element.focus();
    });
    
    // Press Enter
    act(() => {
      fireEvent.keyDown(element, { key: 'Enter' });
      fireEvent.keyUp(element, { key: 'Enter' });
    });
    
    // Should trigger tap gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.TAP,
        state: GestureState.RECOGNIZED,
        isKeyboardGenerated: true
      })
    );
  });
  
  test('should trigger pan gesture on arrow keys', () => {
    const mockGestureEvent = jest.fn();
    const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
    const element = getByTestId('gesture-element');
    
    // Focus and activate
    act(() => {
      element.focus();
    });
    
    // Press arrow key
    act(() => {
      fireEvent.keyDown(element, { key: 'ArrowRight' });
    });
    
    // Should trigger pan gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.PAN,
        state: GestureState.BEGAN,
        isKeyboardGenerated: true
      })
    );
    
    // Clear mock to check next event
    mockGestureEvent.mockClear();
    
    // Continue pressing
    act(() => {
      fireEvent.keyDown(element, { key: 'ArrowRight' });
    });
    
    // Should send changed event
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.PAN,
        state: GestureState.CHANGED,
        isKeyboardGenerated: true
      })
    );
    
    // Clear mock to check release event
    mockGestureEvent.mockClear();
    
    // Release arrow key
    act(() => {
      fireEvent.keyUp(element, { key: 'ArrowRight' });
    });
    
    // Should end pan gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.PAN,
        state: GestureState.ENDED,
        isKeyboardGenerated: true
      })
    );
  });
  
  test('should trigger pinch/zoom gesture on +/- keys', () => {
    const mockGestureEvent = jest.fn();
    const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
    const element = getByTestId('gesture-element');
    
    // Focus and activate
    act(() => {
      element.focus();
    });
    
    // Press + key
    act(() => {
      fireEvent.keyDown(element, { key: '+' });
    });
    
    // Should trigger pinch gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.PINCH,
        state: GestureState.BEGAN,
        isKeyboardGenerated: true
      })
    );
    
    // Clear mock to check release event
    mockGestureEvent.mockClear();
    
    // Release + key
    act(() => {
      fireEvent.keyUp(element, { key: '+' });
    });
    
    // Should end pinch gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.PINCH,
        state: GestureState.ENDED,
        isKeyboardGenerated: true
      })
    );
  });
  
  test('should trigger rotate gesture on [ and ] keys', () => {
    const mockGestureEvent = jest.fn();
    const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
    const element = getByTestId('gesture-element');
    
    // Focus and activate
    act(() => {
      element.focus();
    });
    
    // Press ] key
    act(() => {
      fireEvent.keyDown(element, { key: ']' });
    });
    
    // Should trigger rotate gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.ROTATE,
        state: GestureState.BEGAN,
        isKeyboardGenerated: true
      })
    );
    
    // Clear mock to check release event
    mockGestureEvent.mockClear();
    
    // Release ] key
    act(() => {
      fireEvent.keyUp(element, { key: ']' });
    });
    
    // Should end rotate gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GestureType.ROTATE,
        state: GestureState.ENDED,
        isKeyboardGenerated: true
      })
    );
  });
  
  test('should trigger swipe gesture on Shift+Arrow keys', () => {
    const mockGestureEvent = jest.fn();
    const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
    const element = getByTestId('gesture-element');
    
    // Focus and activate
    act(() => {
      element.focus();
    });
    
    // Press Shift+ArrowRight
    act(() => {
      fireEvent.keyDown(element, { key: 'ArrowRight', shiftKey: true });
    });
    
    // Should trigger swipe gesture with all three states in sequence
    expect(mockGestureEvent).toHaveBeenCalledTimes(3);
    
    // First call should be BEGAN
    expect(mockGestureEvent.mock.calls[0][0]).toMatchObject({
      type: GestureType.SWIPE,
      state: GestureState.BEGAN,
      isKeyboardGenerated: true
    });
    
    // Second call should be CHANGED
    expect(mockGestureEvent.mock.calls[1][0]).toMatchObject({
      type: GestureType.SWIPE,
      state: GestureState.CHANGED,
      isKeyboardGenerated: true
    });
    
    // Third call should be ENDED
    expect(mockGestureEvent.mock.calls[2][0]).toMatchObject({
      type: GestureType.SWIPE,
      state: GestureState.ENDED,
      isKeyboardGenerated: true
    });
  });
  
  test('should reset gesture state when called', () => {
    const mockGestureEvent = jest.fn();
    const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
    const element = getByTestId('gesture-element');
    const resetBtn = getByTestId('reset-btn');
    const gestureType = getByTestId('gesture-type');
    
    // Focus and activate
    act(() => {
      element.focus();
    });
    
    // Press arrow key to start a gesture
    act(() => {
      fireEvent.keyDown(element, { key: 'ArrowRight' });
    });
    
    // Reset state
    act(() => {
      resetBtn.click();
    });
    
    // Gesture type should be None
    expect(gestureType).toHaveTextContent('None');
    
    // Should trigger cancel event for active gesture
    expect(mockGestureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        state: GestureState.CANCELLED,
        isKeyboardGenerated: true
      })
    );
  });
  
  test('should not trigger gestures when disabled', () => {
    const mockGestureEvent = jest.fn();
    const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} enabled={false} />);
    const element = getByTestId('gesture-element');
    
    // Focus and try to activate
    act(() => {
      element.focus();
    });
    
    // Status should still be inactive
    expect(getByTestId('status')).toHaveTextContent('Inactive');
    
    // Try arrow key
    act(() => {
      fireEvent.keyDown(element, { key: 'ArrowRight' });
    });
    
    // Should not trigger any gesture
    expect(mockGestureEvent).not.toHaveBeenCalled();
  });
  
  test('should add appropriate ARIA attributes to the element', () => {
    const { getByTestId } = render(<TestComponent />);
    const element = getByTestId('gesture-element');
    
    // Check basic ARIA attributes
    expect(element).toHaveAttribute('role', 'application');
    expect(element).toHaveAttribute('tabIndex', '0');
    expect(element).toHaveAttribute('aria-label');
    
    // Focus to activate
    act(() => {
      element.focus();
    });
    
    // Should add keyboard shortcut info
    expect(element).toHaveAttribute('aria-keyshortcuts');
  });
  
  test('createKeyboardMapping should create valid mapping object', () => {
    const mapping = createKeyboardMapping({
      tap: ['Enter', ' '],
      panUp: ['ArrowUp', 'w'],
      panDown: ['ArrowDown', 's'],
      zoomIn: ['+'],
      rotateClockwise: [']']
    });
    
    // Check structure matches expected format
    expect(mapping.tap).toEqual(['Enter', ' ']);
    expect(mapping.pan?.up).toEqual(['ArrowUp', 'w']);
    expect(mapping.pan?.down).toEqual(['ArrowDown', 's']);
    expect(mapping.pinch?.zoomIn).toEqual(['+']);
    expect(mapping.rotate?.clockwise).toEqual([']']);
  });
});