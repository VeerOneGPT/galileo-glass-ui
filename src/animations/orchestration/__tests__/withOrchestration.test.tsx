/**
 * Tests for withOrchestration HOC
 */
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { keyframes } from 'styled-components';

// Get the original animationOrchestrator instance to mock it
import * as OrchestratorModule from '../Orchestrator';
import { withOrchestration, AnimationSequence } from '../Orchestrator';

// Mock dependencies
jest.mock('styled-components', () => ({
  keyframes: jest.fn(() => ({
    name: 'mock-keyframes',
  })),
}));

// Create spy objects for the orchestrator functions
const createSequenceSpy = jest
  .spyOn(OrchestratorModule.animationOrchestrator, 'createSequence')
  .mockImplementation(function (this: any, _id, _sequence) {
    return this;
  });

const stopSpy = jest
  .spyOn(OrchestratorModule.animationOrchestrator, 'stop')
  .mockImplementation(() => {});

const _playSpy = jest
  .spyOn(OrchestratorModule.animationOrchestrator, 'play')
  .mockImplementation(() => Promise.resolve());

describe('withOrchestration', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('should create a sequence when component mounts', () => {
    // Define a basic component
    const TestComponent = () => <div>Test Component</div>;

    // Define animation sequence
    const sequence: AnimationSequence = {
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
      autoPlay: true,
    };

    // Create wrapped component
    const WrappedComponent = withOrchestration(TestComponent, sequence);

    // Render the wrapped component
    render(<WrappedComponent />);

    // Check that createSequence was called with a sequence ID and the sequence
    expect(createSequenceSpy).toHaveBeenCalledWith(
      expect.stringContaining('Component'),
      expect.objectContaining({
        targets: sequence.targets,
        parallel: sequence.parallel,
        autoPlay: sequence.autoPlay,
      })
    );
  });

  test('should stop the sequence when component unmounts', () => {
    // Define a basic component
    const TestComponent = () => <div>Test Component</div>;

    // Define animation sequence
    const sequence: AnimationSequence = {
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
      autoPlay: true,
    };

    // Create wrapped component
    const WrappedComponent = withOrchestration(TestComponent, sequence);

    // Render and unmount the wrapped component
    const { unmount } = render(<WrappedComponent />);
    unmount();

    // Check that stop was called with a sequence ID
    expect(stopSpy).toHaveBeenCalledWith(expect.stringContaining('Component'));
  });

  test('should pass props to the wrapped component', () => {
    // Define a component with props
    interface TestProps {
      testProp: string;
    }
    const TestComponent: React.FC<TestProps> = ({ testProp }) => <div>{testProp}</div>;
    TestComponent.displayName = 'TestComponent';

    // Define animation sequence
    const sequence: AnimationSequence = {
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
      autoPlay: true,
    };

    // Create wrapped component
    const WrappedComponent = withOrchestration(TestComponent, sequence);

    // Render the wrapped component with props
    const { getByText } = render(<WrappedComponent testProp="Test Value" />);

    // Check that the props were passed through
    expect(getByText('Test Value')).toBeInTheDocument();

    // Check that the sequence ID includes the component's displayName
    expect(createSequenceSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent'),
      expect.anything()
    );
  });

  test('should generate unique IDs based on timestamp', () => {
    // Define a basic component
    const TestComponent = () => <div>Test Component</div>;

    // Define animation sequence
    const sequence: AnimationSequence = {
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
      autoPlay: true,
    };

    // Spy on Date.now to control the timestamp
    const realDateNow = Date.now;
    let dateNowCallCount = 0;

    // Mock Date.now to return different timestamps
    Date.now = jest.fn(() => {
      dateNowCallCount++;
      return 1000000 + dateNowCallCount;
    });

    // Create two wrapped components (they should have different IDs)
    const WrappedComponent1 = withOrchestration(TestComponent, sequence);
    const WrappedComponent2 = withOrchestration(TestComponent, sequence);

    // Render both components
    render(<WrappedComponent1 />);
    render(<WrappedComponent2 />);

    // Verify createSequence was called with different IDs
    expect(createSequenceSpy).toHaveBeenCalledTimes(2);
    const firstCallId = createSequenceSpy.mock.calls[0][0];
    const secondCallId = createSequenceSpy.mock.calls[1][0];

    // The IDs should be different due to different timestamps
    expect(firstCallId).not.toEqual(secondCallId);

    // Restore the original Date.now
    Date.now = realDateNow;
  });
});
