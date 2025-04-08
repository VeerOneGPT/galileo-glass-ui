/**
 * useAnimationSequence Hook Tests
 * 
 * Testing the animation sequencing hook with focus on verifying the PhysicsAnimationStage
 * type conversion works correctly
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAnimationSequence } from '../useAnimationSequence';
import { 
  PublicPhysicsAnimationStage, 
  PlaybackState,
  TransitionType,
  AnimationTarget,
} from '../../types';

// Mock requestAnimationFrame and performance.now
const originalRAF = global.requestAnimationFrame;
const originalCancelRAF = global.cancelAnimationFrame;
const originalPerformanceNow = global.performance.now;

// Mock implementations
let rafCallbacks: Map<number, FrameRequestCallback> = new Map();
let nextRAFId = 1;

// Setup mock for testing
const setupRAFMock = () => {
  global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback): number => {
    const id = nextRAFId++;
    rafCallbacks.set(id, callback);
    return id;
  });
  
  global.cancelAnimationFrame = jest.fn((id: number) => {
    rafCallbacks.delete(id);
  });
  
  let now = 0;
  global.performance.now = jest.fn(() => now);
  
  // Helper to advance time and run animations
  return {
    advanceTime: (ms: number) => {
      now += ms;
      const callbacks = Array.from(rafCallbacks.entries());
      callbacks.forEach(([id, callback]) => {
        rafCallbacks.delete(id);
        callback(now);
      });
    }
  };
};

// Reset mocks
const resetRAFMock = () => {
  global.requestAnimationFrame = originalRAF;
  global.cancelAnimationFrame = originalCancelRAF;
  global.performance.now = originalPerformanceNow;
  rafCallbacks.clear();
  nextRAFId = 1;
};

// Component using the hook for testing
const TestAnimationSequenceComponent = ({
  stages,
  onSetupComplete
}: {
  stages: any[],
  onSetupComplete: (result: any) => void
}) => {
  const sequenceResult = useAnimationSequence({
    id: 'test-sequence',
    stages
  });
  
  // Notify when setup is complete
  React.useEffect(() => {
    onSetupComplete(sequenceResult);
  }, [onSetupComplete, sequenceResult]);
  
  return <div data-testid="animation-container">Animation Test</div>;
};

describe('useAnimationSequence Hook', () => {
  let advanceTime: (ms: number) => void;
  
  beforeEach(() => {
    const mock = setupRAFMock();
    advanceTime = mock.advanceTime;
  });
  
  afterEach(() => {
    resetRAFMock();
    jest.clearAllMocks();
  });
  
  test('should convert PublicPhysicsAnimationStage to internal format correctly', async () => {
    const mockTargetRef = { current: document.createElement('div') };
    const mockPhysicsStages: PublicPhysicsAnimationStage[] = [
      {
        id: 'physics-stage',
        targets: mockTargetRef,
        type: 'physics',
        physics: {
          mass: 1,
          tension: 170,
          friction: 26
        },
        from: {
          opacity: 0,
          scale: 0.8
        },
        properties: {
          opacity: 1,
          scale: 1
        },
        duration: 500
      }
    ];
    
    let sequenceResult: any;
    const handleSetupComplete = jest.fn((result) => {
      sequenceResult = result;
    });
    
    // Render component with physics animation stage
    render(
      <TestAnimationSequenceComponent 
        stages={mockPhysicsStages} 
        onSetupComplete={handleSetupComplete}
      />
    );
    
    // Wait for setup to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Should have called setup complete
    expect(handleSetupComplete).toHaveBeenCalled();
    
    // Play the animation
    act(() => {
      sequenceResult.play();
    });
    
    // Component should be rendered
    const container = screen.getByTestId('animation-container');
    expect(container).toBeInTheDocument();
    
    // Should be playing now
    expect(sequenceResult.playbackState).toBe(PlaybackState.PLAYING);
    
    // Advance time to complete animation
    act(() => {
      advanceTime(600);
    });
    
    // Check if animation finished successfully
    expect(sequenceResult.progress).toBeGreaterThan(0.9);
    
    // Animation should eventually complete
    act(() => {
      advanceTime(100);
    });
    
    // Progress should now be 1
    expect(sequenceResult.progress).toBe(1);
  });
  
  test('should handle mixed animation stage types in the same sequence', async () => {
    const mockTargetRef = { current: document.createElement('div') };
    const mockMixedStages = [
      // Standard animation stage
      {
        id: 'standard-stage',
        targets: mockTargetRef,
        type: 'keyframe',
        keyframes: [
          { opacity: 0, offset: 0 },
          { opacity: 1, offset: 1 }
        ],
        duration: 300
      },
      // Physics animation stage 
      {
        id: 'physics-stage',
        targets: mockTargetRef,
        type: 'physics',
        physics: {
          mass: 1,
          tension: 170,
          friction: 26
        },
        from: {
          scale: 0.8
        },
        properties: {
          scale: 1
        },
        duration: 500,
        startDelay: 300 // Start after first stage
      }
    ];
    
    let sequenceResult: any;
    const handleSetupComplete = jest.fn((result) => {
      sequenceResult = result;
    });
    
    // Render component with mixed animation stages
    render(
      <TestAnimationSequenceComponent 
        stages={mockMixedStages} 
        onSetupComplete={handleSetupComplete}
      />
    );
    
    // Wait for setup to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Should have called setup complete
    expect(handleSetupComplete).toHaveBeenCalled();
    
    // Play the animation
    act(() => {
      sequenceResult.play();
    });
    
    // Advance time to complete first stage
    act(() => {
      advanceTime(350);
    });
    
    // At this point, second stage should be active
    expect(sequenceResult.currentStageId).toBe('physics-stage');
    
    // Advance time to complete second stage
    act(() => {
      advanceTime(600);
    });
    
    // Animation should be complete
    expect(sequenceResult.progress).toBe(1);
  });
}); 