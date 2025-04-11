/**
 * Tests for withOrchestration HOC
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { withOrchestration, animationOrchestrator, AnimationSequence, AnimationTarget } from '../Orchestrator';
import { MotionSensitivityLevel } from '../../accessibility/MotionSensitivity';
import '@testing-library/jest-dom'; // Explicitly import matchers
import { keyframes } from 'styled-components';
import { AnimationPreset } from '../../core/types';

// Get the original animationOrchestrator instance to mock it
import * as OrchestratorModule from '../Orchestrator';

// Mock dependencies
// REMOVED manual jest.mock for styled-components

// Use the globally defined mock object from the jest.mock call
const mockOrchestrator = animationOrchestrator;

// Define spies on the mock object
const createSequenceSpy = jest.spyOn(mockOrchestrator, 'createSequence');
const stopSpy = jest.spyOn(mockOrchestrator, 'stop');
const playSpy = jest.spyOn(mockOrchestrator, 'play'); // Add playSpy if needed

// Define a keyframe animation name string
const testKfsName = 'test-fade-in';
const testKfs = keyframes`${testKfsName} { from { opacity: 0; } to { opacity: 1; } }`;

// Test component
interface TestProps { testProp: string; }
const TestComponent: React.FC<TestProps> = ({ testProp }) => <div>{testProp}</div>;
TestComponent.displayName = 'MyTestComponent'; // Add displayName for sequence ID testing

describe('withOrchestration', () => {

  beforeEach(() => {
    // Clear spies on the mock object
    createSequenceSpy.mockClear();
    stopSpy.mockClear();
    playSpy.mockClear();
    // Reset implementations if needed (e.g., if a test overrides them)
    createSequenceSpy.mockImplementation(function (this: any, _id, _sequence) { return this; });
    stopSpy.mockImplementation(() => {});
    playSpy.mockImplementation(() => Promise.resolve());
  });

  const testAnimation: AnimationPreset = {
    // keyframes: testKfs, // Use name string
    keyframes: testKfsName,
    duration: '300ms',
    easing: 'linear',
  };
  
  const testTarget: AnimationTarget = {
    target: '#test-target',
    animation: testAnimation,
  };

  const testSequence: AnimationSequence = {
    targets: [testTarget],
    autoPlay: true,
  };

  it('should render the wrapped component', () => {
    const EnhancedComponent = withOrchestration(TestComponent, testSequence);
    render(<EnhancedComponent testProp="Test Value" />);
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should have correct displayName', () => {
    const EnhancedComponent = withOrchestration(TestComponent, testSequence);
    expect(EnhancedComponent.displayName).toBe('WithOrchestration(MyTestComponent)');
  });

  it('should create a sequence on mount', () => {
    const EnhancedComponent = withOrchestration(TestComponent, testSequence);
    render(<EnhancedComponent testProp="Test" />);
    expect(createSequenceSpy).toHaveBeenCalledTimes(1);
  });

  it('should pass sequence config to createSequence', () => {
    const EnhancedComponent = withOrchestration(TestComponent, testSequence);
    render(<EnhancedComponent testProp="Test" />);
    expect(createSequenceSpy).toHaveBeenCalledWith(expect.any(String), testSequence);
  });

  it('should generate a unique sequence ID containing component name', () => {
    const EnhancedComponent = withOrchestration(TestComponent, testSequence);
    render(<EnhancedComponent testProp="Test" />);
    expect(createSequenceSpy).toHaveBeenCalledWith(
      expect.stringContaining('MyTestComponent'),
      expect.anything()
    );
  });

  it('should call orchestrator stop on unmount', () => {
    const EnhancedComponent = withOrchestration(TestComponent, testSequence);
    const { unmount } = render(<EnhancedComponent testProp="Test" />);
    
    // Ensure createSequence was called to get the ID
    expect(createSequenceSpy).toHaveBeenCalledTimes(1);
    const sequenceId = createSequenceSpy.mock.calls[0][0]; // Get the ID used
    
    // Unmount
    unmount();
    
    // Verify stop was called exactly once with the correct ID
    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledWith(sequenceId);
  });
});
