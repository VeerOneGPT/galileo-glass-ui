/**
 * GestureKeyboardNavigation.fixed.test.tsx
 * 
 * Self-contained tests for the GestureKeyboardNavigation module with improved
 * mocks and isolated state between tests to avoid test interference.
 */

// Mock useReducedMotion before imports to avoid dependency on actual implementations
jest.mock('../../../accessibility/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false),
  AnimationCategory: {
    ESSENTIAL: 'essential',
    FEEDBACK: 'feedback',
    DECORATIVE: 'decorative'
  }
}));

// Directly mock GestureDetector module
jest.mock('../GestureDetector', () => {
  const GestureType = {
    TAP: 'tap',
    DOUBLE_TAP: 'doubleTap',
    LONG_PRESS: 'longPress',
    PAN: 'pan',
    SWIPE: 'swipe',
    PINCH: 'pinch',
    ROTATE: 'rotate',
    HOVER: 'hover'
  };
  
  const GestureState = {
    POSSIBLE: 'possible',
    BEGAN: 'began',
    CHANGED: 'changed',
    ENDED: 'ended',
    CANCELLED: 'cancelled',
    RECOGNIZED: 'recognized',
    FAILED: 'failed'
  };
  
  const GestureDirection = {
    NONE: 'none',
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
  };
  
  return {
    GestureType,
    GestureState,
    GestureDirection
  };
});

import React from 'react';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  useKeyboardGestureAlternatives,
  KeyboardActivationMode,
  KeyboardFeedbackType,
  createKeyboardMapping
} from '../GestureKeyboardNavigation';
import { GestureType, GestureState, GestureDirection } from '../GestureDetector';

// Simplify test setup with appropriate mocks
const setupTest = () => {
  // Mock Date.now for consistent timestamps
  const originalDateNow = Date.now;
  jest.spyOn(Date, 'now').mockImplementation(() => 1000);

  // Cleanup function to restore all mocks
  const cleanupTest = () => {
    // Restore original functions
    Date.now = originalDateNow;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Clear React components
    cleanup();
  };
  
  return { cleanupTest };
};

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

// --- Tests ---

describe('GestureKeyboardNavigation (Fixed)', () => {
  // Setup fake timers for all tests
  beforeAll(() => {
    jest.useFakeTimers();
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });
  
  // Reset mocks between tests
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  
  describe('Activation and Deactivation', () => {
    it('should activate keyboard mode on focus when using FOCUS activation mode', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const { getByTestId } = render(<TestComponent activationMode={KeyboardActivationMode.FOCUS} />);
        const element = getByTestId('gesture-element');
        const status = getByTestId('status');
        
        // Initially inactive
        expect(status).toHaveTextContent('Inactive');
        
        // Focus the element
        act(() => {
          fireEvent.focus(element);
        });
        
        // Should become active
        expect(status).toHaveTextContent('Active');
      } finally {
        cleanupTest();
      }
    });
    
    it('should activate and deactivate keyboard mode programmatically', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const { getByTestId } = render(<TestComponent activationMode={KeyboardActivationMode.EXPLICIT} />);
        const status = getByTestId('status');
        const activateBtn = getByTestId('activate-btn');
        const deactivateBtn = getByTestId('deactivate-btn');
        
        // Initially inactive
        expect(status).toHaveTextContent('Inactive');
        
        // Activate
        act(() => {
          fireEvent.click(activateBtn);
        });
        expect(status).toHaveTextContent('Active');
        
        // Deactivate
        act(() => {
          fireEvent.click(deactivateBtn);
        });
        expect(status).toHaveTextContent('Inactive');
      } finally {
        cleanupTest();
      }
    });
    
    it('should not activate when enabled is false', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const { getByTestId } = render(<TestComponent enabled={false} />);
        const element = getByTestId('gesture-element');
        const status = getByTestId('status');
        
        // Try to focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Should remain inactive
        expect(status).toHaveTextContent('Inactive');
      } finally {
        cleanupTest();
      }
    });
  });
  
  describe('Gesture Generation', () => {
    it('should trigger tap gesture on Enter key', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Press Enter
        act(() => {
          fireEvent.keyDown(element, { key: 'Enter' });
          // Clear long press timer
          jest.advanceTimersByTime(100);
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
      } finally {
        cleanupTest();
      }
    });
    
    it('should trigger long press gesture on held Enter key', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Press and hold Enter
        act(() => {
          fireEvent.keyDown(element, { key: 'Enter' });
          
          // Advance timers to trigger long press (more than 500ms)
          jest.advanceTimersByTime(600);
        });
        
        // Should trigger long press gesture
        expect(mockGestureEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.LONG_PRESS,
            state: GestureState.RECOGNIZED,
            isKeyboardGenerated: true
          })
        );
      } finally {
        cleanupTest();
      }
    });
    
    it('should trigger pan gesture on arrow keys', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Press arrow key
        act(() => {
          fireEvent.keyDown(element, { key: 'ArrowRight' });
        });
        
        // Should trigger pan gesture with BEGAN state
        expect(mockGestureEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PAN,
            state: GestureState.BEGAN,
            isKeyboardGenerated: true
          })
        );
        
        // Clear mock to check next event
        mockGestureEvent.mockClear();
        
        // Continue pressing (simulate repeat key event)
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
        
        // Should end pan gesture with ENDED state
        expect(mockGestureEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.PAN,
            state: GestureState.ENDED,
            isKeyboardGenerated: true
          })
        );
      } finally {
        cleanupTest();
      }
    });
    
    it('should trigger swipe gesture on Shift+Arrow keys', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Press Shift+ArrowRight
        act(() => {
          fireEvent.keyDown(element, { key: 'ArrowRight', shiftKey: true });
        });
        
        // Swipe should generate a direct ENDED event (no BEGAN/CHANGED first)
        expect(mockGestureEvent).toHaveBeenCalledTimes(1);
        expect(mockGestureEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.SWIPE,
            state: GestureState.ENDED,
            isKeyboardGenerated: true,
            direction: GestureDirection.RIGHT
          })
        );
      } finally {
        cleanupTest();
      }
    });
    
    it('should trigger pinch/zoom gesture on +/- keys', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
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
            isKeyboardGenerated: true,
            scale: expect.any(Number) // Scale should increase
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
      } finally {
        cleanupTest();
      }
    });
    
    it('should trigger rotate gesture on [ and ] keys', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Press ] key
        act(() => {
          fireEvent.keyDown(element, { key: ']' });
        });
        
        // Should trigger rotate gesture with CHANGED state directly
        expect(mockGestureEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.ROTATE,
            state: GestureState.CHANGED,
            isKeyboardGenerated: true,
            rotation: expect.any(Number) // Should have rotation value
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
      } finally {
        cleanupTest();
      }
    });
    
    it('should not trigger gestures when disabled', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} enabled={false} />);
        const element = getByTestId('gesture-element');
        
        // Focus and try to activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Status should still be inactive
        expect(getByTestId('status')).toHaveTextContent('Inactive');
        
        // Try arrow key
        act(() => {
          fireEvent.keyDown(element, { key: 'ArrowRight' });
        });
        
        // Should not trigger any gesture
        expect(mockGestureEvent).not.toHaveBeenCalled();
      } finally {
        cleanupTest();
      }
    });
  });
  
  describe('State Management', () => {
    it('should reset gesture state when called', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        const resetBtn = getByTestId('reset-btn');
        const gestureType = getByTestId('gesture-type');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Press arrow key to start a gesture
        act(() => {
          fireEvent.keyDown(element, { key: 'ArrowRight' });
        });
        
        // Clear mocks before reset
        mockGestureEvent.mockClear();
        
        // Reset state
        act(() => {
          fireEvent.click(resetBtn);
        });
        
        // Gesture type should be None
        expect(gestureType).toHaveTextContent('None');
      } finally {
        cleanupTest();
      }
    });
    
    it('should handle key combinations for modifiers', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        const { getByTestId } = render(<TestComponent onGestureEvent={mockGestureEvent} />);
        const element = getByTestId('gesture-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Press Shift modifier key
        act(() => {
          fireEvent.keyDown(element, { key: 'Shift' });
        });
        
        // Press ArrowRight with Shift still down
        act(() => {
          fireEvent.keyDown(element, { key: 'ArrowRight', shiftKey: true });
        });
        
        // Should trigger swipe, not pan
        expect(mockGestureEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.SWIPE,
            direction: GestureDirection.RIGHT
          })
        );
      } finally {
        cleanupTest();
      }
    });
  });
  
  describe('Accessibility Features', () => {
    it('should add appropriate ARIA attributes to the element', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const { getByTestId } = render(<TestComponent />);
        const element = getByTestId('gesture-element');
        
        // Check basic ARIA attributes
        expect(element).toHaveAttribute('role', 'application');
        expect(element).toHaveAttribute('tabIndex', '0');
        expect(element).toHaveAttribute('aria-label');
        
        // Focus to activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Should add keyboard shortcut info
        expect(element).toHaveAttribute('aria-keyshortcuts');
      } finally {
        cleanupTest();
      }
    });
  });
  
  describe('Keyboard Mapping', () => {
    it('createKeyboardMapping should create valid mapping object', () => {
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
    
    it('should use custom keyboard mapping when provided', () => {
      const { cleanupTest } = setupTest();
      
      try {
        const mockGestureEvent = jest.fn();
        
        // Create custom component with custom keyboard mapping
        const CustomMappingComponent = () => {
          const elementRef = React.useRef<HTMLDivElement>(null);
          
          const customMapping = {
            tap: ['t'],
            pan: {
              up: ['w'],
              down: ['s'],
              left: ['a'],
              right: ['d']
            }
          };
          
          const { isKeyboardModeActive } = useKeyboardGestureAlternatives({
            elementRef,
            keyboardMapping: customMapping,
            onGestureEvent: mockGestureEvent
          });
          
          return (
            <div 
              ref={elementRef}
              data-testid="custom-element"
            >
              {isKeyboardModeActive ? 'Active' : 'Inactive'}
            </div>
          );
        };
        
        const { getByTestId } = render(<CustomMappingComponent />);
        const element = getByTestId('custom-element');
        
        // Focus and activate
        act(() => {
          fireEvent.focus(element);
        });
        
        // Standard key shouldn't work
        act(() => {
          fireEvent.keyDown(element, { key: 'Enter' });
          fireEvent.keyUp(element, { key: 'Enter' });
        });
        expect(mockGestureEvent).not.toHaveBeenCalled();
        
        // Custom key should work
        act(() => {
          fireEvent.keyDown(element, { key: 't' });
          fireEvent.keyUp(element, { key: 't' });
        });
        
        expect(mockGestureEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: GestureType.TAP,
            isKeyboardGenerated: true
          })
        );
      } finally {
        cleanupTest();
      }
    });
  });
}); 