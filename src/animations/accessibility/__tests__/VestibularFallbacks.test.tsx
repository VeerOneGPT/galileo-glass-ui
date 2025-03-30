/**
 * Tests for VestibularFallbacks
 * 
 * These tests verify that the vestibular fallbacks provide appropriate 
 * alternative feedback mechanisms for users with vestibular disorders.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
import styled from 'styled-components';
import { 
  useVestibularFallback, 
  vestibularFallback,
  createVestibularFallback,
  setVestibularFallbackPreferences,
  getVestibularFallbackPreferences,
  resetVestibularFallbackPreferences,
  FeedbackType, 
  StateChangeType, 
  ImportanceLevel
} from '../VestibularFallbacks';

// Mock for useReducedMotion
jest.mock('../useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => ({
    prefersReducedMotion: true,
    isAnimationAllowed: jest.fn(() => false)
  }))
}));

// Mock for Web Audio API
window.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockImplementation(() => ({
    type: 'sine',
    frequency: { value: 0 },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  })),
  createGain: jest.fn().mockImplementation(() => ({
    gain: { value: 0 },
    connect: jest.fn()
  })),
  destination: {}
}));

// Mock for navigator.vibrate
navigator.vibrate = jest.fn();

// Mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component using hook
const TestComponent: React.FC<{
  stateChangeType: StateChangeType;
  feedbackTypes: FeedbackType[];
  importance?: ImportanceLevel;
}> = ({ stateChangeType, feedbackTypes, importance = ImportanceLevel.IMPORTANT }) => {
  const fallback = useVestibularFallback({
    stateChangeType,
    preferredFallbacks: feedbackTypes,
    importance,
    message: 'Test message',
    duration: 500
  });
  
  return (
    <div>
      <div
        data-testid="test-element"
        onClick={fallback.applyFallback}
        {...fallback.props}
        style={{
          width: '100px',
          height: '100px',
          background: fallback.isActive ? '#e74c3c' : '#3498db',
        }}
      >
        Test Element
      </div>
      <button 
        data-testid="apply-button"
        onClick={fallback.applyFallback}
      >
        Apply Fallback
      </button>
      <div data-testid="active-status">
        {fallback.isActive ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
};

// Styled component with vestibular fallback
const StyledTestComponent = styled.div`
  width: 100px;
  height: 100px;
  background: blue;
  
  ${vestibularFallback({
    stateChangeType: StateChangeType.TOGGLE,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.BORDER],
    color: 'red',
    duration: 500
  })}
`;

describe('VestibularFallbacks', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });
  
  test('useVestibularFallback provides expected properties', () => {
    const { result } = renderHook(() => useVestibularFallback({
      stateChangeType: StateChangeType.TOGGLE,
      preferredFallbacks: [FeedbackType.COLOR, FeedbackType.ARIA]
    }));
    
    expect(result.current).toHaveProperty('styles');
    expect(result.current).toHaveProperty('applyFallback');
    expect(result.current).toHaveProperty('props');
    expect(result.current).toHaveProperty('isActive');
    expect(typeof result.current.applyFallback).toBe('function');
  });
  
  test('applyFallback triggers appropriate feedback', () => {
    const { getByTestId } = render(
      <TestComponent 
        stateChangeType={StateChangeType.ERROR} 
        feedbackTypes={[FeedbackType.ARIA, FeedbackType.SOUND, FeedbackType.HAPTIC]}
      />
    );
    
    // Apply fallback
    fireEvent.click(getByTestId('apply-button'));
    
    // Should attempt to use AudioContext if sound feedback is requested
    expect(window.AudioContext).toHaveBeenCalled();
    
    // Should attempt to use vibration if haptic feedback is requested
    expect(navigator.vibrate).toHaveBeenCalled();
  });
  
  test('ARIA props are correctly applied for critical state changes', () => {
    const { getByTestId } = render(
      <TestComponent 
        stateChangeType={StateChangeType.ERROR} 
        feedbackTypes={[FeedbackType.ARIA]}
        importance={ImportanceLevel.CRITICAL}
      />
    );
    
    const element = getByTestId('test-element');
    
    // Error state should use 'alert' role
    expect(element).toHaveAttribute('role', 'alert');
    expect(element).toHaveAttribute('aria-live', 'assertive');
  });
  
  test('createVestibularFallback returns expected object structure', () => {
    const fallback = createVestibularFallback({
      stateChangeType: StateChangeType.SELECT,
      preferredFallbacks: [FeedbackType.COLOR, FeedbackType.BORDER, FeedbackType.ARIA],
      color: 'blue',
      message: 'Item selected'
    });
    
    expect(fallback).toHaveProperty('cssStyles');
    expect(fallback).toHaveProperty('applyFallback');
    expect(fallback).toHaveProperty('ariaProps');
    expect(fallback.ariaProps).toHaveProperty('aria-live');
  });
  
  test('vestibularFallback generates CSS for styled-components', () => {
    const TestElement = styled.div`
      ${vestibularFallback({
        stateChangeType: StateChangeType.TOGGLE,
        preferredFallbacks: [FeedbackType.COLOR],
        color: 'red'
      })}
    `;
    
    const { container } = render(<TestElement />);
    
    // Not easy to test exact CSS from styled-components, but we can verify the component renders
    expect(container.firstChild).toBeInTheDocument();
  });
  
  test('isActive reflects reduced motion preferences', () => {
    const { getByTestId } = render(
      <TestComponent 
        stateChangeType={StateChangeType.TOGGLE} 
        feedbackTypes={[FeedbackType.COLOR]}
      />
    );
    
    // Should be active since the mock returns prefersReducedMotion: true
    expect(getByTestId('active-status')).toHaveTextContent('Active');
  });
  
  test('preferences can be saved and restored', () => {
    // Set preferences
    setVestibularFallbackPreferences({
      audioEnabled: false,
      hapticEnabled: true,
      visualEnabled: true,
      feedbackThresholds: {
        audio: ImportanceLevel.CRITICAL
      }
    });
    
    // Get preferences
    const prefs = getVestibularFallbackPreferences();
    
    // Verify saved values
    expect(prefs.audioEnabled).toBe(false);
    expect(prefs.hapticEnabled).toBe(true);
    
    // Verify threshold was updated
    expect(prefs.feedbackThresholds.audio).toBe(ImportanceLevel.CRITICAL);
    
    // Reset preferences
    resetVestibularFallbackPreferences();
    
    // Get updated preferences
    const resetPrefs = getVestibularFallbackPreferences();
    
    // Verify reset values
    expect(resetPrefs.audioEnabled).toBe(true); // Default value
  });
  
  test('different state change types get appropriate default settings', () => {
    // Test error state
    const errorFallback = createVestibularFallback({
      stateChangeType: StateChangeType.ERROR,
      preferredFallbacks: [FeedbackType.COLOR, FeedbackType.ICON]
    });
    
    // Test success state
    const successFallback = createVestibularFallback({
      stateChangeType: StateChangeType.SUCCESS,
      preferredFallbacks: [FeedbackType.COLOR, FeedbackType.ICON]
    });
    
    // Each state change type should use different default icons
    expect(errorFallback.iconContent).toBeDefined();
    expect(successFallback.iconContent).toBeDefined();
    expect(errorFallback.iconContent).not.toEqual(successFallback.iconContent);
  });
});