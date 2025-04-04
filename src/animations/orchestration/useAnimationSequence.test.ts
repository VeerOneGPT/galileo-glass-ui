import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { 
  useAnimationSequence, 
  AnimationSequenceConfig, 
  StyleAnimationStage // Import necessary types
} from './useAnimationSequence'; 
// NOTE: For type checking against build output, this import path would ideally
// represent the public export (e.g., '@veerone/galileo-glass-ui/hooks'), 
// but direct import is used here for Jest execution pre-build.

describe('useAnimationSequence (with properties)', () => {
  
  // Minimal mock target element for type checking config
  let mockElement: HTMLElement;
  beforeEach(() => {
    mockElement = document.createElement('div');
    mockElement.id = 'test-target';
    document.body.appendChild(mockElement);
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should accept StyleAnimationStage with "properties" key without type errors', () => {
    const styleStage: StyleAnimationStage = {
      id: 'style1',
      type: 'style',
      targets: '#test-target', // Use CSS selector
      duration: 500,
      // CRITICAL: Use the 'properties' key
      properties: { 
        opacity: 0.5,
        transform: 'translateX(100px)',
      },
      // Ensure BaseAnimationStage properties are included if needed by logic
      // easing: 'linear' // Example
    };

    const testConfig: AnimationSequenceConfig = {
      id: 'testSequenceProperties',
      stages: [styleStage],
      autoplay: false, // Don't autoplay for this basic test
    };

    // Render the hook with the config using 'properties'
    const { result } = renderHook(() => useAnimationSequence(testConfig));

    // Basic assertions: Check if the hook returns the expected structure
    expect(result.current).toBeDefined();
    expect(typeof result.current.play).toBe('function');
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.stop).toBe('function');
    expect(typeof result.current.seek).toBe('function');
    expect(typeof result.current.getProgress).toBe('function');
    expect(result.current.playbackState).toBeDefined();
    expect(result.current.stages).toEqual([styleStage]); // Check if stage is passed through

    // No explicit type error assertion needed here. 
    // If this test file compiles and runs without TS errors related to 
    // 'properties', the type checking aspect is implicitly validated 
    // for the direct source import context. Verification against the 
    // actual build output types is the next step.
  });

  // TODO: Add more tests for runtime behavior (play, pause, progress, callbacks)
  // using the 'properties' key once the build/export is confirmed correct.
}); 