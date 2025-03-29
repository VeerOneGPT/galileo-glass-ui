import React from 'react';
import { render, act } from '@testing-library/react';
import { useGestureAnimation, GestureAnimationPresets } from '../useGestureAnimation';
import { GestureAnimation } from '../../animations/physics/gestures/GestureAnimation';
import { GestureType } from '../../animations/physics/gestures/GestureDetector';
import * as reducedMotionHook from '../useReducedMotion';

// Mock the GestureAnimation class
jest.mock('../../animations/physics/gestures/GestureAnimation', () => {
  return {
    GestureAnimation: jest.fn().mockImplementation(() => ({
      getTransform: jest.fn().mockReturnValue({
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: 0,
        velocity: { x: 0, y: 0 }
      }),
      setTransform: jest.fn(),
      animateTo: jest.fn(),
      reset: jest.fn(),
      destroy: jest.fn()
    })),
    GestureAnimationPreset: {
      SPRING_BOUNCE: 'springBounce',
      INERTIAL_SLIDE: 'inertialSlide'
    }
  };
});

// Mock useReducedMotion hook
jest.spyOn(reducedMotionHook, 'useReducedMotion').mockReturnValue(false);

describe('useGestureAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test component that uses the hook
  const TestComponent = ({
    enabled = true,
    respectReducedMotion = true,
    onTransformChange = undefined,
    preset = undefined
  }) => {
    const ref = React.useRef(null);
    const { transform, setTransform, animateTo, reset, isActive } = useGestureAnimation({
      ref,
      enabled,
      respectReducedMotion,
      onTransformChange,
      preset,
      gestures: [GestureType.PAN, GestureType.PINCH] // Use the enum values
    });
    
    return (
      <div ref={ref} data-testid="test-element">
        <div data-testid="transform-x">{transform.translateX}</div>
        <div data-testid="transform-y">{transform.translateY}</div>
        <div data-testid="transform-scale">{transform.scale}</div>
        <div data-testid="transform-rotation">{transform.rotation}</div>
        <div data-testid="is-active">{isActive ? 'active' : 'inactive'}</div>
        <button
          data-testid="set-transform-btn"
          onClick={() => setTransform({ translateX: 100, translateY: 50 })}
        >
          Set Transform
        </button>
        <button
          data-testid="animate-to-btn"
          onClick={() => animateTo({ translateX: 200, translateY: 100 })}
        >
          Animate To
        </button>
        <button
          data-testid="reset-btn"
          onClick={() => reset()}
        >
          Reset
        </button>
      </div>
    );
  };
  
  test('should initialize GestureAnimation when rendered', () => {
    render(<TestComponent />);
    
    expect(GestureAnimation).toHaveBeenCalledTimes(1);
    expect(GestureAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        gestures: [GestureType.PAN, GestureType.PINCH]
      })
    );
  });
  
  test('should not initialize GestureAnimation when enabled is false', () => {
    render(<TestComponent enabled={false} />);
    
    expect(GestureAnimation).not.toHaveBeenCalled();
  });
  
  test('should apply reduced motion settings when reduced motion is preferred', () => {
    // Mock that user prefers reduced motion
    jest.spyOn(reducedMotionHook, 'useReducedMotion').mockReturnValue(true);
    
    render(<TestComponent />);
    
    expect(GestureAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        // Should have higher tension and friction values
        tension: expect.any(Number),
        friction: expect.any(Number),
        // Should have reduced velocity scale and multipliers
        velocityScale: expect.any(Number),
        translateMultiplier: expect.any(Number),
        scaleMultiplier: expect.any(Number),
        rotateMultiplier: expect.any(Number)
      })
    );
    
    // Reset mock
    (reducedMotionHook.useReducedMotion as jest.Mock).mockReturnValue(false);
  });
  
  test('should not apply reduced motion settings when respectReducedMotion is false', () => {
    // Mock that user prefers reduced motion
    jest.spyOn(reducedMotionHook, 'useReducedMotion').mockReturnValue(true);
    
    render(<TestComponent respectReducedMotion={false} />);
    
    // Should not contain reduced motion adjustments
    expect(GestureAnimation).toHaveBeenCalledWith(
      expect.not.objectContaining({
        velocityScale: expect.any(Number),
        translateMultiplier: expect.any(Number)
      })
    );
    
    // Reset mock
    (reducedMotionHook.useReducedMotion as jest.Mock).mockReturnValue(false);
  });
  
  test('should clean up GestureAnimation on unmount', () => {
    const { unmount } = render(<TestComponent />);
    
    const mockGestureAnimation = (GestureAnimation as jest.Mock).mock.instances[0];
    
    unmount();
    
    expect(mockGestureAnimation.destroy).toHaveBeenCalledTimes(1);
  });
  
  test('should call setTransform method on GestureAnimation instance', () => {
    const { getByTestId } = render(<TestComponent />);
    
    const mockGestureAnimation = (GestureAnimation as jest.Mock).mock.instances[0];
    
    // Click button to call setTransform
    act(() => {
      getByTestId('set-transform-btn').click();
    });
    
    expect(mockGestureAnimation.setTransform).toHaveBeenCalledWith({
      translateX: 100,
      translateY: 50
    });
  });
  
  test('should call animateTo method on GestureAnimation instance', () => {
    const { getByTestId } = render(<TestComponent />);
    
    const mockGestureAnimation = (GestureAnimation as jest.Mock).mock.instances[0];
    
    // Click button to call animateTo
    act(() => {
      getByTestId('animate-to-btn').click();
    });
    
    expect(mockGestureAnimation.animateTo).toHaveBeenCalledWith({
      translateX: 200,
      translateY: 100
    });
  });
  
  test('should call reset method on GestureAnimation instance', () => {
    const { getByTestId } = render(<TestComponent />);
    
    const mockGestureAnimation = (GestureAnimation as jest.Mock).mock.instances[0];
    
    // Click button to call reset
    act(() => {
      getByTestId('reset-btn').click();
    });
    
    expect(mockGestureAnimation.reset).toHaveBeenCalledTimes(1);
  });
  
  test('should apply preset configuration when specified', () => {
    render(<TestComponent preset={GestureAnimationPresets.SPRING_BOUNCE} />);
    
    expect(GestureAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: 'springBounce'
      })
    );
  });
  
  test('should call onTransformChange callback when transform changes', () => {
    const onTransformChange = jest.fn();
    
    render(<TestComponent onTransformChange={onTransformChange} />);
    
    // Get the onTransformChange callback passed to GestureAnimation
    const gestureAnimationConfig = (GestureAnimation as jest.Mock).mock.calls[0][0];
    const onTransformChangeCallback = gestureAnimationConfig.onTransformChange;
    
    // Simulate transform change
    const newTransform = {
      translateX: 100,
      translateY: 50,
      scale: 1.5,
      rotation: 45,
      velocity: { x: 1, y: 0.5 }
    };
    
    act(() => {
      onTransformChangeCallback(newTransform);
    });
    
    // Should call the user's callback
    expect(onTransformChange).toHaveBeenCalledWith(newTransform);
  });
  
  test('should update isActive state during gesture lifecycle', () => {
    const { getByTestId } = render(<TestComponent />);
    
    // Get callbacks from GestureAnimation
    const gestureAnimationConfig = (GestureAnimation as jest.Mock).mock.calls[0][0];
    const onGestureStart = gestureAnimationConfig.onGestureStart;
    const onGestureEnd = gestureAnimationConfig.onGestureEnd;
    
    // Initial state should be inactive
    expect(getByTestId('is-active').textContent).toBe('inactive');
    
    // Simulate gesture start
    act(() => {
      onGestureStart({ type: 'pan', state: 'began' });
    });
    
    // State should be active
    expect(getByTestId('is-active').textContent).toBe('active');
    
    // Simulate gesture end
    act(() => {
      onGestureEnd({ type: 'pan', state: 'ended' }, {});
    });
    
    // State should be inactive again
    expect(getByTestId('is-active').textContent).toBe('inactive');
  });
});