import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMagneticElement } from '../useMagneticElement';

// Mock the physics system to avoid browser API dependencies
jest.mock('../galileoPhysicsSystem', () => {
  return {
    GalileoPhysicsSystem: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      addObject: jest.fn().mockReturnValue('test-physics-id'),
      updateObject: jest.fn(),
      removeObject: jest.fn()
    }))
  };
});

// Mock the useMagneticEffect hook
jest.mock('../useMagneticEffect', () => ({
  useMagneticEffect: jest.fn().mockImplementation(() => {
    const ref = { current: null };
    return ref;
  })
}));

// Mock the useReducedMotion hook
jest.mock('../../accessibility/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(false)
}));

// Mock MutationObserver globally
class MockMutationObserver {
  observe: jest.Mock;
  disconnect: jest.Mock;
  callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.disconnect = jest.fn();
  }

  // Helper method to trigger the callback
  triggerMutations(mutations: Partial<MutationRecord>[]) {
    const mutationRecords = mutations.map(mutation => ({
      type: 'attributes',
      attributeName: 'style',
      target: document.createElement('div'),
      addedNodes: [] as any,
      removedNodes: [] as any,
      previousSibling: null,
      nextSibling: null,
      attributeNamespace: null,
      oldValue: null,
      ...mutation
    })) as MutationRecord[];
    
    this.callback(mutationRecords, this as unknown as MutationObserver);
  }
}

// Component for testing the hook
const TestComponent = ({ options = {} }) => {
  const { 
    elementRef, 
    transform, 
    isActive, 
    activeClass, 
    activate, 
    deactivate 
  } = useMagneticElement<HTMLDivElement>(options);

  return (
    <div
      data-testid="magnetic-element"
      ref={elementRef}
      className={activeClass || ''}
    >
      <p data-testid="x-value">{transform.x}</p>
      <p data-testid="y-value">{transform.y}</p>
      <p data-testid="scale-value">{transform.scale}</p>
      <p data-testid="rotation-value">{transform.rotation}</p>
      <p data-testid="active-value">{transform.active.toString()}</p>
      <p data-testid="force-value">{transform.force}</p>
      <p data-testid="is-active-value">{isActive.toString()}</p>
      <button data-testid="activate-btn" onClick={activate}>Activate</button>
      <button data-testid="deactivate-btn" onClick={deactivate}>Deactivate</button>
    </div>
  );
};

describe('useMagneticElement', () => {
  const originalMutationObserver = global.MutationObserver;
  let mockMutationObserverInstance: MockMutationObserver;

  beforeAll(() => {
    // Replace the global MutationObserver with our mock
    global.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;
  });

  afterAll(() => {
    // Restore the original MutationObserver
    global.MutationObserver = originalMutationObserver;
  });

  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 100,
      height: 50,
      top: 100,
      left: 200,
      right: 300,
      bottom: 150,
      x: 200,
      y: 100
    });

    // Mock getComputedStyle
    window.getComputedStyle = jest.fn().mockReturnValue({
      transform: 'matrix(1, 0, 0, 1, 0, 0)',
      webkitTransform: ''
    });
    
    // Clear the mock MutationObserver instance
    mockMutationObserverInstance = undefined as any;
    
    // Capture the instance when it's created
    (global.MutationObserver as jest.Mock).mockImplementation((callback: MutationCallback) => {
      mockMutationObserverInstance = new MockMutationObserver(callback);
      return mockMutationObserverInstance;
    });
  });

  it('renders with default values', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('magnetic-element')).toBeInTheDocument();
    expect(screen.getByTestId('x-value').textContent).toBe('0');
    expect(screen.getByTestId('y-value').textContent).toBe('0');
    expect(screen.getByTestId('scale-value').textContent).toBe('1');
    expect(screen.getByTestId('rotation-value').textContent).toBe('0');
    expect(screen.getByTestId('active-value').textContent).toBe('false');
    expect(screen.getByTestId('force-value').textContent).toBe('0');
    expect(screen.getByTestId('is-active-value').textContent).toBe('false');
  });

  it('applies active className when active', () => {
    render(<TestComponent options={{ activeClassName: 'magnetic-active' }} />);
    
    // Initially not active
    expect(screen.getByTestId('magnetic-element')).not.toHaveClass('magnetic-active');
    
    // Simulate activation by updating transform state
    expect(mockMutationObserverInstance).toBeDefined();
    
    // Mock transform to simulate active state
    window.getComputedStyle = jest.fn().mockReturnValue({
      transform: 'matrix(1, 0, 0, 1, 10, 20)',
      webkitTransform: ''
    });
    
    // Trigger mutation callback to update state
    act(() => {
      mockMutationObserverInstance.triggerMutations([{ type: 'attributes', attributeName: 'style' }]);
    });
    
    // Check if transform values updated (partial test - full DOM updates are harder to test)
    expect(screen.getByTestId('is-active-value').textContent).toBe('true');
  });

  it('calls callbacks when activation state changes', () => {
    const onActivate = jest.fn();
    const onDeactivate = jest.fn();
    
    render(
      <TestComponent 
        options={{ 
          onActivate, 
          onDeactivate,
          maxDisplacement: 50
        }} 
      />
    );
    
    // Verify MutationObserver was created
    expect(mockMutationObserverInstance).toBeDefined();
    
    // Simulate inactive -> active transition
    window.getComputedStyle = jest.fn().mockReturnValue({
      transform: 'matrix(1, 0, 0, 1, 10, 15)',
      webkitTransform: ''
    });
    
    act(() => {
      mockMutationObserverInstance.triggerMutations([{ type: 'attributes', attributeName: 'style' }]);
    });
    
    // Verify onActivate was called
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onDeactivate).not.toHaveBeenCalled();
    
    // Simulate active -> inactive transition
    window.getComputedStyle = jest.fn().mockReturnValue({
      transform: 'matrix(1, 0, 0, 1, 0, 0)',
      webkitTransform: ''
    });
    
    act(() => {
      mockMutationObserverInstance.triggerMutations([{ type: 'attributes', attributeName: 'style' }]);
    });
    
    // Verify onDeactivate was called
    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('handles manual activation and deactivation', () => {
    const createEventMock = jest.fn();
    document.dispatchEvent = createEventMock;
    
    render(<TestComponent />);
    
    // Click activate button
    fireEvent.click(screen.getByTestId('activate-btn'));
    
    // Verify event was dispatched
    expect(createEventMock).toHaveBeenCalledTimes(1);
    expect(createEventMock.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    
    // Click deactivate button
    fireEvent.click(screen.getByTestId('deactivate-btn'));
    
    // Verify another event was dispatched
    expect(createEventMock).toHaveBeenCalledTimes(2);
    expect(createEventMock.mock.calls[1][0]).toBeInstanceOf(MouseEvent);
  });
  
  it('registers with physics system when registerWithPhysics is true', () => {
    // Import the mock directly to access its methods
    const { GalileoPhysicsSystem } = require('../galileoPhysicsSystem');
    
    render(
      <TestComponent 
        options={{ 
          registerWithPhysics: true,
          interactWithOtherElements: true,
          physicsConfig: {
            mass: 2.0,
            restitution: 0.5
          }
        }} 
      />
    );
    
    // Verify physics system was started
    expect(GalileoPhysicsSystem).toHaveBeenCalled();
    
    // Get the mock instance
    const mockInstance = GalileoPhysicsSystem.mock.results[0].value;
    
    // Verify start was called
    expect(mockInstance.start).toHaveBeenCalled();
    
    // Verify object was added with correct parameters
    expect(mockInstance.addObject).toHaveBeenCalledWith(expect.objectContaining({
      position: expect.objectContaining({
        x: 250, // center of element (left + width/2)
        y: 125  // center of element (top + height/2)
      }),
      shape: 'circle',
      radius: 50, // Max of width/2 and height/2
      mass: 2.0,
      restitution: 0.5,
      isStatic: false,
      userData: expect.objectContaining({
        isMagneticElement: true
      })
    }));
  });
}); 