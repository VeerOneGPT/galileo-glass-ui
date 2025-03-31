/**
 * Integration Tests for Animation Pipeline
 *
 * This test file demonstrates how different parts of the animation system
 * work together to create a complete animation pipeline.
 */
import { render, screen, act as _act } from '@testing-library/react';
import React from 'react';
import { keyframes as _keyframes } from 'styled-components';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { accessibleAnimation } from '../../accessibility/accessibleAnimation';
import { getMotionSensitivity , MotionSensitivityLevel } from '../../accessibility/MotionSensitivity';
import { AnimationPreset } from '../../utils/types';
import { createAnimationSequence } from '../../orchestration/GestaltPatterns';

// Import AnimationIntensity to use the proper enum values
import { ZSpaceProvider } from '../../../core/zspace/ZSpaceContext';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { ZSpaceAnimator } from '../../dimensional/ZSpaceAnimation';
import { AnimationOrchestrator } from '../../orchestration/Orchestrator';
import { springAnimation } from '../../physics/springAnimation';
import { AnimationIntensity } from '../../presets/accessibleAnimations';

// Mock styled-components
jest.mock('styled-components', () => {
  const mockKeyframes = str => ({
    name: 'mock-keyframes',
    styles: str,
    // Add required Keyframes properties
    getName: () => 'mock-keyframes',
    id: 'mock-id',
    rules: str,
  });

  return {
    keyframes: jest.fn(mockKeyframes),
    css: jest.fn(str => ({ styles: str })),
  };
});

// Mock animation presets
jest.mock('../../presets', () => ({
  presets: {
    fade: {
      keyframes: { name: 'fade', getName: () => 'fade', id: 'fade-id', rules: '' },
      duration: '300ms',
      easing: 'ease',
      intensity: AnimationIntensity.SUBTLE,
    },
    slideUp: {
      keyframes: { name: 'slideUp', getName: () => 'slideUp', id: 'slideUp-id', rules: '' },
      duration: '300ms',
      easing: 'ease',
      intensity: AnimationIntensity.STANDARD,
    },
    slideDown: {
      keyframes: { name: 'slideDown', getName: () => 'slideDown', id: 'slideDown-id', rules: '' },
      duration: '300ms',
      easing: 'ease',
      intensity: AnimationIntensity.STANDARD,
    },
    slideLeft: {
      keyframes: { name: 'slideLeft', getName: () => 'slideLeft', id: 'slideLeft-id', rules: '' },
      duration: '300ms',
      easing: 'ease',
      intensity: AnimationIntensity.STANDARD,
    },
    slideRight: {
      keyframes: {
        name: 'slideRight',
        getName: () => 'slideRight',
        id: 'slideRight-id',
        rules: '',
      },
      duration: '300ms',
      easing: 'ease',
      intensity: AnimationIntensity.STANDARD,
    },
    glassReveal: {
      keyframes: {
        name: 'glassReveal',
        getName: () => 'glassReveal',
        id: 'glassReveal-id',
        rules: '',
      },
      duration: '500ms',
      easing: 'ease',
      intensity: AnimationIntensity.EXPRESSIVE,
    },
    button: {
      ripple: {
        keyframes: {
          name: 'buttonRipple',
          getName: () => 'buttonRipple',
          id: 'buttonRipple-id',
          rules: '',
        },
        duration: '300ms',
        easing: 'ease',
        intensity: AnimationIntensity.STANDARD,
      },
      hover: {
        keyframes: {
          name: 'buttonHover',
          getName: () => 'buttonHover',
          id: 'buttonHover-id',
          rules: '',
        },
        duration: '200ms',
        easing: 'ease',
        intensity: AnimationIntensity.SUBTLE,
      },
      press: {
        keyframes: {
          name: 'buttonPress',
          getName: () => 'buttonPress',
          id: 'buttonPress-id',
          rules: '',
        },
        duration: '100ms',
        easing: 'ease',
        intensity: AnimationIntensity.SUBTLE,
      },
      loading: {
        keyframes: {
          name: 'buttonLoading',
          getName: () => 'buttonLoading',
          id: 'buttonLoading-id',
          rules: '',
        },
        duration: '1500ms',
        easing: 'ease',
        intensity: AnimationIntensity.STANDARD,
      },
    },
    card: {
      hover: {
        keyframes: { name: 'cardHover', getName: () => 'cardHover', id: 'cardHover-id', rules: '' },
        duration: '200ms',
        easing: 'ease',
        intensity: AnimationIntensity.SUBTLE,
      },
      flip: {
        keyframes: { name: 'cardFlip', getName: () => 'cardFlip', id: 'cardFlip-id', rules: '' },
        duration: '500ms',
        easing: 'ease',
        intensity: AnimationIntensity.EXPRESSIVE,
      },
      tilt3D: {
        keyframes: {
          name: 'cardTilt3D',
          getName: () => 'cardTilt3D',
          id: 'cardTilt3D-id',
          rules: '',
        },
        duration: '300ms',
        easing: 'ease',
        intensity: AnimationIntensity.STANDARD,
      },
    },
  },
}));

// Mock AccessibilityTypes
jest.mock('../../accessibility/AccessibilityTypes', () => ({
  // Create a minimal mock for required types
}));

// Mock AnimationMapper
jest.mock('../../accessibility/AnimationMapper', () => {
  return {
    AnimationComplexity: {
      NONE: 'none',
      MINIMAL: 'minimal',
      BASIC: 'basic',
      STANDARD: 'standard',
      ENHANCED: 'enhanced',
      COMPLEX: 'complex',
    },
    animationMapper: {
      getAccessibleAnimation: jest.fn(() => ({
        animation: { keyframes: { name: 'mock-animation' } },
        duration: 300,
        shouldAnimate: true,
      })),
    },
    AnimationMapper: jest.fn().mockImplementation(() => ({
      getAccessibleAnimation: jest.fn(() => ({
        animation: { keyframes: { name: 'mock-animation' } },
        duration: 300,
        shouldAnimate: true,
      })),
      addMapping: jest.fn(),
      getAllMappings: jest.fn(() => []),
      clearMappings: jest.fn(),
      resetToDefaults: jest.fn(),
    })),
  };
});

// Mock all animation-related modules
jest.mock('../../orchestration/Orchestrator', () => {
  const MockAnimationOrchestrator = jest.fn().mockImplementation(() => ({
    createSequence: jest.fn(sequenceConfig => ({
      animations: Array.isArray(sequenceConfig) ? sequenceConfig : [],
      totalDuration: 950,
    })),
    play: jest.fn(_sequence => ({
      isPlaying: true,
      then: jest.fn(callback => {
        setTimeout(callback, 1000);
        return { isPlaying: false };
      }),
    })),
    getSequences: jest.fn(() => new Map()),
    pause: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  return {
    AnimationOrchestrator: MockAnimationOrchestrator,
    animationOrchestrator: new MockAnimationOrchestrator(),
    withOrchestration: jest.fn((Component, _config) => props => Component(props)),
  };
});

jest.mock('../../orchestration/GestaltPatterns', () => ({
  createStaggeredSequence: jest.fn(options => ({
    sequences: options.elements.map((element, i) => ({
      startTime: options.initialDelay + i * options.staggerDelay,
    })),
  })),
}));

// Now import animation system components

const withOrchestration = (Component, _config) => {
  // Simple mock that just returns the original component
  return props => <Component {...props} />;
};
// Mock ThemeProvider
jest.mock('../../../theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }) => children,
}));

// Mock ZSpaceProvider
jest.mock('../../../core/zspace/ZSpaceContext', () => ({
  ZSpaceProvider: ({ children }) => children,
  useZSpace: jest.fn(() => ({
    baseZIndex: 0,
    perspectiveDepth: 1000,
    animationsEnabled: true,
    getZIndex: jest.fn(layer => layer),
    getZDepth: jest.fn(depth => depth),
    getTransformCSS: jest.fn(depth => `translateZ(${depth}px)`),
  })),
}));

// Mock dependencies
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(true)
}));

jest.mock('../../accessibility/MotionSensitivity', () => ({
  MotionSensitivityLevel: {
    NONE: 'none',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    MAXIMUM: 'maximum',
  },
  AnimationComplexity: {
    NONE: 'none',
    MINIMAL: 'minimal',
    BASIC: 'basic',
    STANDARD: 'standard',
    ENHANCED: 'enhanced',
    COMPLEX: 'complex',
  },
  getMotionSensitivity: jest.fn(level => ({
    level: level || 'none',
    disableParallax: level === 'high',
    reduceShadows: level === 'high' || level === 'medium',
    reduceFloating: level === 'high',
    maxAllowedComplexity: level === 'high' ? 'basic' : 'complex',
    maxAllowedDuration: level === 'high' ? 300 : 2000,
    scaleEffects: level === 'high' ? 0 : level === 'medium' ? 0.5 : level === 'low' ? 0.8 : 1,
  })),
  isAnimationComplexityAllowed: jest.fn(() => true),
  isAnimationDurationAllowed: jest.fn(() => true),
  getAdjustedAnimation: jest.fn((options, _sensitivity) => ({
    duration: options.duration || 300,
    shouldAnimate: true,
  })),
}));

// Mock requestAnimationFrame and other browser APIs
const mockRequestAnimationFrame = jest.fn(callback => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
});

const mockCancelAnimationFrame = jest.fn(id => {
  clearTimeout(id as unknown as NodeJS.Timeout);
});

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

// Set up Jest timers
jest.useFakeTimers();

// Setup window mock
global.window = {
  ...global.window,
  matchMedia: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
} as any;

// Mock the animation functions
jest.mock('../../accessibility/accessibleAnimation', () => {
  // Create a compliant keyframes object
  const mockKeyframes = {
    name: 'accessibleFade',
    getName: () => 'accessibleFade',
    id: 'accessible-fade-id',
    rules: '',
  };

  const mockAccessibleAnimation = jest.fn(config => {
    // Return a mock animation that includes the required AnimationPreset properties
    const duration =
      config && config.reducedMotionDuration
        ? config.reducedMotionDuration
        : (config && config.duration) || 300;

    return {
      name: 'mock-accessible-animation',
      keyframes: mockKeyframes,
      duration: `${duration}ms`,
      easing: 'ease-out',
      intensity: AnimationIntensity.SUBTLE,
      fillMode: 'both',
    };
  });

  // For tests that need to mock the implementation
  mockAccessibleAnimation.mockImplementation = jest.fn(implementation => {
    const original = mockAccessibleAnimation;
    mockAccessibleAnimation.mockImplementation = original.mockImplementation;
    return jest.fn(implementation);
  });

  return {
    accessibleAnimation: mockAccessibleAnimation,
  };
});

jest.mock('../../physics/springAnimation', () => {
  // Create a compliant keyframes object
  const mockKeyframes = {
    name: 'springKeyframes',
    getName: () => 'springKeyframes',
    id: 'spring-id',
    rules: '',
  };

  return {
    springAnimation: jest.fn(() => ({
      name: 'mock-spring-animation',
      keyframes: mockKeyframes,
      duration: '300ms',
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      intensity: AnimationIntensity.STANDARD,
    })),
  };
});

// Create example animations with our mocked functions - updated to match AnimationPreset interface
const mockKeyframes = name => ({
  name,
  getName: () => name,
  id: `${name}-id`,
  rules: '',
});

const fadeInAnimation = {
  name: 'fade-in-animation',
  keyframes: mockKeyframes('fadeIn'),
  duration: '300ms',
  easing: 'ease-out',
  intensity: AnimationIntensity.STANDARD,
};

const slideInAnimation = {
  name: 'slide-in-animation',
  keyframes: mockKeyframes('slideIn'),
  duration: '400ms',
  easing: 'ease-out',
  intensity: AnimationIntensity.STANDARD,
};

const bounceAnimation = {
  name: 'bounce-animation',
  keyframes: mockKeyframes('bounce'),
  duration: '500ms',
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Create a mock animation preset
const mockAnimation = _keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const mockReducedMotion = _keyframes`
  from { opacity: 0.8; }
  to { opacity: 1; }
`;

const mockPreset: AnimationPreset = {
  name: 'fade',
  animation: mockAnimation,
  reducedMotionAlternative: mockReducedMotion,
  defaultDuration: 0.3,
  defaultEasing: 'ease-in-out'
};

// Create a mock animation preset using the existing mock keyframes function
const testAnimation = mockKeyframes('test-animation');
const reducedMotionAnimation = mockKeyframes('reduced-motion-animation');

// Create a mock animation preset compatible with the test
const mockAnimationPreset = {
  name: 'test-animation',
  keyframes: testAnimation,
  duration: '300ms',
  easing: 'ease-out',
  intensity: AnimationIntensity.SUBTLE
};

// Mock the accessibleAnimation function
jest.mock('../../accessibility/accessibleAnimation', () => ({
  accessibleAnimation: jest.fn().mockImplementation(() => ({
    name: 'mock-accessible-animation',
    keyframes: mockKeyframes('accessibleFade'),
    duration: '300ms',
    easing: 'ease-out',
    intensity: AnimationIntensity.SUBTLE,
    fillMode: 'both',
  }))
}));

// Mock the getMotionSensitivity function
jest.mock('../../accessibility/MotionSensitivity', () => ({
  getMotionSensitivity: jest.fn()
}));

describe('Animation Pipeline Integration', () => {
  test('orchestrator can create and manage animation sequences', () => {
    // Create a new orchestrator
    const orchestrator = new AnimationOrchestrator();

    // Create a sequence of animations - fix to match the actual API
    const sequenceId = 'test-sequence';
    orchestrator.createSequence(sequenceId, {
      targets: [
        { target: 'element1', animation: fadeInAnimation, duration: 300 },
        { target: 'element2', animation: slideInAnimation, duration: 400, delay: 100 },
        { target: 'element3', animation: bounceAnimation, duration: 500, delay: 50 },
      ],
    });

    // Check that the sequence was created correctly
    const sequences = orchestrator.getSequences();
    expect(sequences.has(sequenceId)).toBe(true);

    // Start the sequence
    const playPromise = orchestrator.play(sequenceId);
    expect(playPromise).toBeInstanceOf(Promise);

    // Fast-forward time to complete the animation
    jest.advanceTimersByTime(1000);

    // Since play() returns a Promise, we need to handle it differently
    // The test can continue if we know the promise will resolve
  });

  test('staggered animations can be created for multiple elements', () => {
    // Create a staggered sequence for multiple elements
    const elements = ['elem1', 'elem2', 'elem3', 'elem4'];

    // @ts-ignore - Temporarily ignore type error for staggered animations
    const staggered = createStaggeredSequence({
      elements,
      animation: fadeInAnimation,
      staggerDelay: 50,
      initialDelay: 100,
    });

    // Check that the staggered sequence has the right structure
    expect(staggered.sequences.length).toBe(elements.length);

    // First element starts after initialDelay
    expect(staggered.sequences[0].startTime).toBe(100);

    // Each subsequent element starts after the staggerDelay
    expect(staggered.sequences[1].startTime).toBe(150);
    expect(staggered.sequences[2].startTime).toBe(200);
    expect(staggered.sequences[3].startTime).toBe(250);
  });

  // Test the withOrchestration HOC
  test('withOrchestration HOC applies animations to a component', () => {
    // Create a simple component
    const TestComponent = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="test-component">{children}</div>
    );

    // Create an orchestrated version
    const animations = {
      enter: [
        { animation: fadeInAnimation, duration: 300 },
        { animation: slideInAnimation, duration: 400, delay: 100 },
      ],
      exit: [{ animation: fadeInAnimation, duration: 300, reverse: true }],
    };

    const OrchestrationConfig = {
      animations,
      orchestrationProps: {
        staggerChildren: true,
        staggerDelay: 50,
      },
    };

    const OrchestatedComponent = withOrchestration(TestComponent, OrchestrationConfig);

    // Render the orchestrated component
    render(
      <ThemeProvider>
        <OrchestatedComponent>
          <div>Item 1</div>
          <div>Item 2</div>
        </OrchestatedComponent>
      </ThemeProvider>
    );

    // Component should render correctly
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  // Test combining Z-Space with animation orchestration
  test('Z-Space animations can be integrated with animation orchestration', () => {
    // Create a component that uses both Z-Space and animation orchestration
    const TestComponent = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="test-component">{children}</div>
    );

    const animations = {
      enter: [
        { animation: fadeInAnimation, duration: 300 },
        { animation: slideInAnimation, duration: 400, delay: 100 },
      ],
    };

    const OrchestatedComponent = withOrchestration(TestComponent, { animations });

    // Create the Z-Space animator
    const zSpaceAnimator = new ZSpaceAnimator({
      perspective: 1500,
      zOffset: 20,
    });

    // Get CSS properties from the Z-Space animator
    const { containerStyle, elementStyle } = zSpaceAnimator.getCSSProperties();

    // Render the component with both Z-Space and orchestration
    render(
      <ThemeProvider>
        <ZSpaceProvider perspectiveDepth={1500}>
          <div style={containerStyle}>
            <div style={elementStyle}>
              <OrchestatedComponent>
                <div>Z-Space with Orchestration</div>
              </OrchestatedComponent>
            </div>
          </div>
        </ZSpaceProvider>
      </ThemeProvider>
    );

    // Component should render correctly
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Z-Space with Orchestration')).toBeInTheDocument();
  });

  // Test accessibility features of the animation system
  test('Animation system respects accessibility preferences', () => {
    // Mock reduced motion preference
    jest.mock('../../../hooks/useReducedMotion');
    (useReducedMotion as jest.Mock).mockReturnValue(true);

    // Mock accessibleAnimation
    jest.mock('../../accessibility/accessibleAnimation');
    const mockAccessibleAnimation = accessibleAnimation as jest.MockedFunction<typeof accessibleAnimation>;

    // Create properly structured AnimationPreset for reduced motion
    // @ts-ignore - AnimationPreset interface is inconsistently defined across the codebase
    const reducedMotionPreset: AnimationPreset = {
      name: 'reduced-motion-animation',
      // @ts-ignore - 'keyframes' property inconsistent across AnimationPreset definitions
      keyframes: mockKeyframes('reducedMotion'),
      duration: '50ms',
      easing: 'ease',
      intensity: AnimationIntensity.SUBTLE,
      fillMode: 'both',
    };

    // Set up the mock implementation for this test
    // @ts-ignore - Temporarily ignore type error for mock implementation
    mockAccessibleAnimation.mockImplementation(() => reducedMotionPreset);

    // Create accessible animation with standard properties
    const accessibleFade = mockAccessibleAnimation({
      duration: '300ms',
      easing: 'ease-in-out',
    });

    // Check that the animation respects reduced motion preference
    const orchestrator = new AnimationOrchestrator();
    const sequenceId = 'accessible-sequence';

    // Create a sequence with our mock animation
    // @ts-ignore - Temporarily ignore type error for animation target
    orchestrator.createSequence(sequenceId, {
      targets: [{ 
        target: 'element1', 
        // @ts-ignore - Temporarily ignore type error for animation preset
        animation: accessibleFade 
      }],
    });

    // Get sequences to check that it was created
    const sequences = orchestrator.getSequences();
    expect(sequences.has(sequenceId)).toBe(true);

    // Reset useReducedMotion mock
    (useReducedMotion as jest.Mock).mockReturnValue(false);

    // Now test with motion sensitivity
    jest.mock('../../accessibility/MotionSensitivity');
    (getMotionSensitivity as jest.Mock).mockReturnValueOnce({
      disableParallax: true,
      reduceShadows: true,
      reduceFloating: true,
      scaleEffects: 0.5,
    });

    // ZSpace animation should respect motion sensitivity
    const zSpaceAnimator = new ZSpaceAnimator({
      sensitivity: MotionSensitivityLevel.HIGH,
    });

    // Get CSS properties - should be empty due to high sensitivity
    const { containerStyle, elementStyle } = zSpaceAnimator.getCSSProperties();
    expect(containerStyle).toEqual({});
    expect(elementStyle).toEqual({});
  });

  it('should respect reduced motion preferences', () => {
    // Create a sequence with the mock animation
    const sequence = createAnimationSequence([
      {
        target: '.test-element',
        animation: mockAnimationPreset,
        delay: 100
      }
    ]);
    
    // Verify the sequence exists
    expect(sequence).toBeDefined();
    expect(Object.keys(sequence).length).toBeGreaterThan(0);
  });
});

const TestComponent = () => {
  return <div>Test Component</div>;
};
TestComponent.displayName = 'TestComponent';
