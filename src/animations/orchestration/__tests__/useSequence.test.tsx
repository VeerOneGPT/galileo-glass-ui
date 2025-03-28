/**
 * useSequence hook tests
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useSequence } from '../useSequence';

// Mock DeclarativeSequencer
jest.mock('../DeclarativeSequencer', () => {
  const mockSequencer = {
    start: jest.fn().mockImplementation(() => Promise.resolve()),
    pause: jest.fn(),
    resume: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn()
  };
  
  return {
    DeclarativeSequencer: {
      create: jest.fn().mockImplementation(() => mockSequencer)
    },
    SequenceBuilder: jest.fn().mockImplementation(function() {
      this.animate = jest.fn().mockReturnThis();
      this.stagger = jest.fn().mockReturnThis();
      this.wait = jest.fn().mockReturnThis();
      this.sequence = jest.fn().mockReturnThis();
      this.parallel = jest.fn().mockReturnThis();
      this.if = jest.fn().mockReturnThis();
      this.else = jest.fn().mockReturnThis();
      this.elseIf = jest.fn().mockReturnThis();
      this.endIf = jest.fn().mockReturnThis();
      this.forEach = jest.fn().mockReturnThis();
      this.endForEach = jest.fn().mockReturnThis();
      this.call = jest.fn().mockReturnThis();
      this.set = jest.fn().mockReturnThis();
    })
  };
});

// Mock useReducedMotion hook
jest.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

describe('useSequence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  function TestComponent({
    autoPlay = false,
    loop = false,
    onRender
  }: {
    autoPlay?: boolean;
    loop?: boolean;
    onRender: (controls: any) => void;
  }) {
    const builderFn = jest.fn((builder) => {
      builder.animate('.test', 'fadeIn')
        .wait(300)
        .animate('.test', 'fadeOut');
    });
    
    const sequence = useSequence(
      {
        name: 'test-sequence',
        autoPlay,
        loop,
        deps: [autoPlay, loop]
      },
      builderFn
    );
    
    React.useEffect(() => {
      onRender(sequence);
    }, [onRender, sequence]);
    
    return (
      <div>
        <div className="test">Test Element</div>
        <button onClick={() => sequence.start()}>Start</button>
        <button onClick={() => sequence.pause()}>Pause</button>
        <button onClick={() => sequence.resume()}>Resume</button>
        <button onClick={() => sequence.stop()}>Stop</button>
        <button onClick={() => sequence.reset()}>Reset</button>
      </div>
    );
  }
  
  it('should create a sequence with the builder function', () => {
    const onRender = jest.fn();
    render(<TestComponent onRender={onRender} />);
    
    expect(onRender).toHaveBeenCalled();
    const { builder } = onRender.mock.calls[0][0];
    expect(builder).toBeDefined();
    expect(typeof builder).toBe('function');
  });
  
  it('should provide control methods for the sequence', () => {
    const onRender = jest.fn();
    render(<TestComponent onRender={onRender} />);
    
    expect(onRender).toHaveBeenCalled();
    const controls = onRender.mock.calls[0][0];
    
    expect(controls.start).toBeDefined();
    expect(controls.pause).toBeDefined();
    expect(controls.resume).toBeDefined();
    expect(controls.stop).toBeDefined();
    expect(controls.reset).toBeDefined();
    expect(controls.isPlaying).toBeDefined();
    expect(controls.isPaused).toBeDefined();
    expect(controls.isComplete).toBeDefined();
  });
  
  it('should call start method when clicked', async () => {
    const onRender = jest.fn();
    render(<TestComponent onRender={onRender} />);
    
    const { start } = onRender.mock.calls[0][0];
    expect(start).toBeDefined();
    
    await act(async () => {
      await start();
    });
    
    // Get mockSequencer.start from DeclarativeSequencer mock
    const mockSequencer = require('../DeclarativeSequencer').DeclarativeSequencer.create();
    expect(mockSequencer.start).toHaveBeenCalledTimes(1);
  });
  
  it('should recreate sequence when deps change', () => {
    const onRender = jest.fn();
    const { rerender } = render(<TestComponent onRender={onRender} autoPlay={false} loop={false} />);
    
    // First render creates the sequence
    expect(require('../DeclarativeSequencer').DeclarativeSequencer.create).toHaveBeenCalledTimes(1);
    
    // Rerender with same props doesn't recreate
    rerender(<TestComponent onRender={onRender} autoPlay={false} loop={false} />);
    expect(require('../DeclarativeSequencer').DeclarativeSequencer.create).toHaveBeenCalledTimes(1);
    
    // Rerender with different props recreates
    rerender(<TestComponent onRender={onRender} autoPlay={true} loop={false} />);
    expect(require('../DeclarativeSequencer').DeclarativeSequencer.create).toHaveBeenCalledTimes(2);
    
    // Rerender with different props again recreates
    rerender(<TestComponent onRender={onRender} autoPlay={true} loop={true} />);
    expect(require('../DeclarativeSequencer').DeclarativeSequencer.create).toHaveBeenCalledTimes(3);
  });
  
  it('should provide utility methods for direct animation', () => {
    const onRender = jest.fn();
    render(<TestComponent onRender={onRender} />);
    
    const { animationTarget, staggerTarget } = onRender.mock.calls[0][0];
    
    expect(animationTarget).toBeDefined();
    expect(typeof animationTarget).toBe('function');
    
    expect(staggerTarget).toBeDefined();
    expect(typeof staggerTarget).toBe('function');
  });
});