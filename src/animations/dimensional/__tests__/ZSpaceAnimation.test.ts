/**
 * Tests for ZSpaceAnimation
 */
import { MotionSensitivityLevel } from '../../accessibility/MotionSensitivity';
import { ZSpaceAnimator, useZSpaceAnimation } from '../ZSpaceAnimation';

// Mock hook
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false),
}));

// Mock getMotionSensitivity
jest.mock('../../accessibility/MotionSensitivity', () => ({
  MotionSensitivityLevel: {
    NONE: 'none',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },
  getMotionSensitivity: jest.fn(level => ({
    disableParallax: level === 'high',
    reduceShadows: level === 'high' || level === 'medium',
    reduceFloating: level === 'high',
    scaleEffects: level === 'high' ? 0 : level === 'medium' ? 0.5 : level === 'low' ? 0.8 : 1,
  })),
}));

// Mock window and requestAnimationFrame
const mockRequestAnimationFrame = jest.fn(callback => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
});

const mockCancelAnimationFrame = jest.fn(id => {
  clearTimeout(id as unknown as NodeJS.Timeout);
});

const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

// Extend the mock return type to include the changeHandler property
interface MockMatchMediaReturn {
  matches: boolean;
  addEventListener: jest.Mock;
  changeHandler?: (event: any) => void;
}

// Create a type that extends the Jest mock function to include changeHandler
type MockMatchMediaFunction = jest.Mock<MockMatchMediaReturn, []> & {
  changeHandler?: (event: any) => void;
};

const mockMatchMedia: MockMatchMediaFunction = jest.fn(() => ({
  matches: false,
  addEventListener: jest.fn((event, handler) => {
    if (event === 'change') {
      mockMatchMedia.changeHandler = handler;
    }
  }),
}));

// Initialize the changeHandler property
mockMatchMedia.changeHandler = undefined;

// Setup global mocks
beforeAll(() => {
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
  global.window = {
    ...global.window,
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    matchMedia: mockMatchMedia,
    performance: {
      now: () => Date.now(),
    },
  } as any;

  // Ensure window.addEventListener is bound to global.window
  // This is necessary because the init/cleanup methods will use this
  global.window.addEventListener = mockAddEventListener;
  global.window.removeEventListener = mockRemoveEventListener;
});

describe('ZSpaceAnimator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default options', () => {
    const animator = new ZSpaceAnimator();

    // Check internal state by accessing private property
    const options = (animator as any).options;

    expect(options.enabled).toBe(true);
    expect(options.intensity).toBe(0.5);
    expect(options.perspective).toBe(1000);
    expect(options.parallax).toBe(true);
  });

  test('initializes with custom options', () => {
    const customOptions = {
      enabled: false,
      intensity: 0.8,
      perspective: 2000,
      zOffset: 10,
      parallax: false,
    };

    const animator = new ZSpaceAnimator(customOptions);
    const options = (animator as any).options;

    expect(options.enabled).toBe(false);
    expect(options.intensity).toBe(0.8);
    expect(options.perspective).toBe(2000);
    expect(options.zOffset).toBe(10);
    expect(options.parallax).toBe(false);
  });

  test('init method sets up event listeners when enabled', () => {
    const animator = new ZSpaceAnimator({ enabled: true });
    animator.init();

    expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('mouseleave', expect.any(Function));
  });

  test('does not set up event listeners when disabled', () => {
    const animator = new ZSpaceAnimator({ enabled: false });
    animator.init();

    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  test('cleanup method removes event listeners', () => {
    const animator = new ZSpaceAnimator();

    // Initialize and then clean up
    animator.init();
    animator.cleanup();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('mouseleave', expect.any(Function));
  });

  test('registerElement adds element to the elements map', () => {
    const animator = new ZSpaceAnimator();
    const element = document.createElement('div');

    animator.registerElement('test-element', element);

    // Check internal state
    const elements = (animator as any).elements;
    expect(elements.get('test-element')).toBe(element);
  });

  test('unregisterElement removes element from the elements map', () => {
    const animator = new ZSpaceAnimator();
    const element = document.createElement('div');

    animator.registerElement('test-element', element);
    animator.unregisterElement('test-element');

    // Check internal state
    const elements = (animator as any).elements;
    expect(elements.has('test-element')).toBe(false);
  });

  test('updateOptions merges new options with existing ones', () => {
    const animator = new ZSpaceAnimator({ intensity: 0.5, perspective: 1000 });

    animator.updateOptions({ intensity: 0.8 });

    // Check that options were updated
    const options = (animator as any).options;
    expect(options.intensity).toBe(0.8);
    expect(options.perspective).toBe(1000); // Unchanged
  });

  test('getCSSProperties returns appropriate styles based on options', () => {
    const animator = new ZSpaceAnimator({
      perspective: 1500,
      zOffset: 20,
      rotation: { x: 10, y: 15, z: 5 },
      scale: 1.2,
      transitionDuration: 500,
      easing: 'ease-out',
    });

    const { containerStyle, elementStyle } = animator.getCSSProperties();

    expect(containerStyle.perspective).toBe('1500px');
    expect(containerStyle.transformStyle).toBe('preserve-3d');

    expect(elementStyle.transform).toContain('translate3d(0, 0, 20px)');
    expect(elementStyle.transform).toContain('rotateX(10deg)');
    expect(elementStyle.transform).toContain('rotateY(15deg)');
    expect(elementStyle.transform).toContain('rotateZ(5deg)');
    expect(elementStyle.transform).toContain('scale(1.2)');
    expect(elementStyle.transition).toContain('transform 500ms ease-out');
  });

  test('returns empty styles when disabled', () => {
    const animator = new ZSpaceAnimator({ enabled: false });

    const { containerStyle, elementStyle } = animator.getCSSProperties();

    expect(containerStyle).toEqual({});
    expect(elementStyle).toEqual({});
  });
});

// We need to mock React hooks (unused function but kept for documentation)
const _mockReactHooks = () => {
  jest.mock('react', () => {
    const actual = jest.requireActual('react');
    return {
      ...actual,
      useState: jest.fn(val => [val, jest.fn()]),
      useEffect: jest.fn(fn => fn()),
      useRef: jest.fn(val => ({ current: val })),
    };
  });
};

// Test the hook separately
describe('useZSpaceAnimation hook', () => {
  // Mock implementation as we can't fully test the hook outside of a React environment
  test('returns animator and styles', () => {
    // We can't directly test hooks outside of React components
    // So we'll check that the function at least returns the expected structure
    const { animator, containerStyle, elementStyle } = useZSpaceAnimation({
      intensity: 0.7,
      perspective: 2000,
    });

    expect(animator).toBeInstanceOf(ZSpaceAnimator);
    expect(containerStyle).toBeDefined();
    expect(elementStyle).toBeDefined();
  });

  test('respects reduced motion preference', () => {
    // Temporarily mock useReducedMotion to return true
    const useReducedMotion = require('../../../hooks/useReducedMotion').useReducedMotion;
    useReducedMotion.mockReturnValueOnce(true);

    const { containerStyle, elementStyle } = useZSpaceAnimation();

    // Should return empty styles with reduced motion
    expect(containerStyle).toEqual({});
    expect(elementStyle).toEqual({});
  });

  test('respects motion sensitivity', () => {
    // Mock high sensitivity which disables parallax
    const { getMotionSensitivity } = require('../../accessibility/MotionSensitivity');
    getMotionSensitivity.mockReturnValueOnce({ disableParallax: true });

    const { containerStyle, elementStyle } = useZSpaceAnimation({
      sensitivity: MotionSensitivityLevel.HIGH,
    });

    // Should return empty styles with high motion sensitivity
    expect(containerStyle).toEqual({});
    expect(elementStyle).toEqual({});
  });
});
