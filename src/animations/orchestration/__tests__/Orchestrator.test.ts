/**
 * Tests for Animation Orchestrator
 */
import { keyframes } from 'styled-components';
import { AnimationOrchestrator, AnimationSequence } from '../Orchestrator';
import { MotionSensitivityLevel } from '../../accessibility/MotionSensitivity';
import { animationMapper } from '../../accessibility/AnimationMapper';

// Mock styled-components
jest.mock('styled-components', () => ({
  keyframes: jest.fn(() => ({
    name: 'mock-keyframes',
  })),
}));

// Mock the animation mapper
jest.mock('../../accessibility/AnimationMapper', () => ({
  animationMapper: {
    getAccessibleAnimation: jest.fn(() => ({
      animation: {
        keyframes: { name: 'mock-mapped-animation' },
        duration: '300ms',
        easing: 'ease',
        fillMode: 'both',
      },
      duration: 300,
      shouldAnimate: true,
    })),
  },
}));

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

// Mock DOM methods
global.document.querySelector = jest.fn();

// Create a wrapper function to make testing with the async AnimationOrchestrator easier
const createTestSequence = (options = {}): AnimationSequence => {
  return {
    targets: [
      {
        target: '#test-element',
        animation: {
          keyframes: keyframes`from { opacity: 0; } to { opacity: 1; }`,
          duration: '300ms',
          easing: 'ease',
          fillMode: 'both',
        },
      },
    ],
    parallel: false,
    autoPlay: false,
    ...options,
  };
};

describe('AnimationOrchestrator', () => {
  let orchestrator: AnimationOrchestrator;
  let mockEventListener: jest.Mock;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new orchestrator instance for each test
    orchestrator = new AnimationOrchestrator();
    
    // Spy on internal methods
    jest.spyOn(orchestrator as any, 'triggerEvent');
    jest.spyOn(orchestrator as any, 'applyAnimation').mockImplementation(() => {});
    jest.spyOn(orchestrator as any, 'animateTarget').mockImplementation(() => Promise.resolve());
    
    // Create a mock event listener
    mockEventListener = jest.fn();
    
    // Mock document.querySelector to return a div
    const mockElement = document.createElement('div');
    (document.querySelector as jest.Mock).mockReturnValue(mockElement);
  });

  test('should create a new sequence', () => {
    const sequence = createTestSequence();
    orchestrator.createSequence('test-sequence', sequence);
    
    const sequences = orchestrator.getSequences();
    expect(sequences.has('test-sequence')).toBe(true);
    expect(sequences.get('test-sequence')).toEqual(sequence);
  });

  test('should auto-play a sequence when autoPlay is true', () => {
    // Spy on the play method
    const playSpy = jest.spyOn(orchestrator, 'play').mockResolvedValue();
    
    const sequence = createTestSequence({ autoPlay: true });
    orchestrator.createSequence('test-sequence', sequence);
    
    expect(playSpy).toHaveBeenCalledWith('test-sequence');
  });

  test('should register and trigger event listeners', async () => {
    orchestrator.addEventListener('start', mockEventListener);
    
    const sequence = createTestSequence();
    orchestrator.createSequence('test-sequence', sequence);
    
    // Mock internal methods to resolve immediately
    (orchestrator as any).animateTarget.mockResolvedValue();
    
    // Run the play method
    await orchestrator.play('test-sequence');
    
    // Check that the event was triggered
    expect((orchestrator as any).triggerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'start',
        target: 'test-sequence',
      })
    );
    
    // Check that the event listener was called
    expect(mockEventListener).toHaveBeenCalled();
  });

  test('should remove event listeners', async () => {
    orchestrator.addEventListener('start', mockEventListener);
    orchestrator.removeEventListener('start', mockEventListener);
    
    const sequence = createTestSequence();
    orchestrator.createSequence('test-sequence', sequence);
    
    // Run the play method
    await orchestrator.play('test-sequence');
    
    // The event listener should not be called
    expect(mockEventListener).not.toHaveBeenCalled();
  });

  test('should pause animations', () => {
    const sequence = createTestSequence();
    orchestrator.addEventListener('pause', mockEventListener);
    orchestrator.createSequence('test-sequence', sequence);
    orchestrator.pause('test-sequence');
    
    // Check that the event was triggered
    expect((orchestrator as any).triggerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'pause',
        target: 'test-sequence',
      })
    );
    
    // Check that the event listener was called
    expect(mockEventListener).toHaveBeenCalled();
  });

  test('should stop animations', () => {
    const sequence = createTestSequence();
    orchestrator.addEventListener('cancel', mockEventListener);
    orchestrator.createSequence('test-sequence', sequence);
    orchestrator.stop('test-sequence');
    
    // Check that the event was triggered
    expect((orchestrator as any).triggerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'cancel',
        target: 'test-sequence',
      })
    );
    
    // Check that the event listener was called
    expect(mockEventListener).toHaveBeenCalled();
  });

  test('should run animations sequentially', async () => {
    // Reset mock implementation to track calls to animateTarget
    (orchestrator as any).animateTarget.mockReset();
    
    // Create a spy that resolves after each call
    const animateTargetSpy = jest.spyOn(orchestrator as any, 'animateTarget')
      .mockImplementation(() => Promise.resolve());
    
    const sequence = createTestSequence({
      targets: [
        {
          target: '#element1',
          animation: {
            keyframes: keyframes`from { opacity: 0; } to { opacity: 1; }`,
            duration: '300ms',
            easing: 'ease',
            fillMode: 'both',
          },
        },
        {
          target: '#element2',
          animation: {
            keyframes: keyframes`from { opacity: 0; } to { opacity: 1; }`,
            duration: '300ms',
            easing: 'ease',
            fillMode: 'both',
          },
        },
      ],
      parallel: false,
    });
    
    orchestrator.createSequence('test-sequence', sequence);
    
    // Start the animation
    const playPromise = orchestrator.play('test-sequence');
    
    // Wait for the play promise to resolve
    await playPromise;
    
    // Should have called animateTarget twice (once for each target)
    expect(animateTargetSpy).toHaveBeenCalledTimes(2);
    
    // First call should be for the first target
    // Use type assertion to correctly access the target property
    expect((animateTargetSpy.mock.calls[0][0] as { target: string }).target).toBe('#element1');
    
    // Second call should be for the second target
    // Use type assertion to correctly access the target property
    expect((animateTargetSpy.mock.calls[1][0] as { target: string }).target).toBe('#element2');
  });

  test('should run animations in parallel', async () => {
    // Reset mock implementation
    (orchestrator as any).animateTarget.mockReset();
    
    // Create a spy that resolves after each call
    const animateTargetSpy = jest.spyOn(orchestrator as any, 'animateTarget')
      .mockImplementation(() => Promise.resolve());
    
    const sequence = createTestSequence({
      targets: [
        {
          target: '#element1',
          animation: {
            keyframes: keyframes`from { opacity: 0; } to { opacity: 1; }`,
            duration: '300ms',
            easing: 'ease',
            fillMode: 'both',
          },
        },
        {
          target: '#element2',
          animation: {
            keyframes: keyframes`from { opacity: 0; } to { opacity: 1; }`,
            duration: '300ms',
            easing: 'ease',
            fillMode: 'both',
          },
        },
      ],
      parallel: true,
    });
    
    orchestrator.createSequence('test-sequence', sequence);
    
    // Start the animation
    const playPromise = orchestrator.play('test-sequence');
    
    // Wait for the play promise to resolve
    await playPromise;
    
    // Should have called animateTarget twice (once for each target)
    expect(animateTargetSpy).toHaveBeenCalledTimes(2);
  });

  test('should respect motion sensitivity settings', async () => {
    // Reset mock implementation
    (orchestrator as any).animateTarget.mockReset();
    
    const animateTargetSpy = jest.spyOn(orchestrator as any, 'animateTarget')
      .mockImplementation(() => Promise.resolve());
    
    const sequence = createTestSequence({
      sensitivity: MotionSensitivityLevel.HIGH,
    });
    
    orchestrator.createSequence('test-sequence', sequence);
    
    // Start the animation
    await orchestrator.play('test-sequence');
    
    // Check that animateTarget was called with the correct sensitivity level
    expect(animateTargetSpy).toHaveBeenCalledWith(
      expect.anything(),
      'test-sequence',
      MotionSensitivityLevel.HIGH
    );
  });

  test('should throw an error when playing a non-existent sequence', async () => {
    await expect(orchestrator.play('non-existent-sequence')).rejects.toThrow(
      'Animation sequence "non-existent-sequence" not found'
    );
  });

  test('should clear all sequences', () => {
    const sequence = createTestSequence();
    orchestrator.createSequence('test-sequence', sequence);
    orchestrator.clear();
    
    const sequences = orchestrator.getSequences();
    expect(sequences.size).toBe(0);
  });
});