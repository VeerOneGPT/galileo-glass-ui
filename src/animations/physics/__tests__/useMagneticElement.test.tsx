import React, { useState, useRef, useCallback } from 'react';
import { render, fireEvent, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMagneticElement } from '../useMagneticElement';
import { useMagneticEffect } from '../useMagneticEffect';
import { GalileoPhysicsSystem } from '../galileoPhysicsSystem';
import { useReducedMotion } from '../../accessibility/useReducedMotion';

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

// --- Reverted Mock for useMagneticEffect ---
// Control the state externally
let mockMagneticEffectState = {
  transform: {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    active: false,
    force: 0,
  },
  // Provide a stable mock ref object. Tests can modify .current if needed.
  elementRef: { current: null as HTMLDivElement | null }, 
};

jest.mock('../useMagneticEffect', () => ({
  // The factory now just returns the externally controlled state
  useMagneticEffect: jest.fn().mockImplementation(() => mockMagneticEffectState),
}));
// --- End Reverted Mock ---

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

// --- Reverted Helper to update mock state --- 
const updateMockMagneticTransform = (newState: Partial<typeof mockMagneticEffectState.transform>) => {
    mockMagneticEffectState = {
        ...mockMagneticEffectState,
        transform: { 
            ...mockMagneticEffectState.transform, 
            ...newState 
        }
    };
    // NOTE: Rerender must be called *after* this in the test within an act block
};
// --- End Reverted Helper ---

// Component for testing the hook
const TestComponent = ({ options = {} }: { options?: any }) => {
  const { 
    elementRef, 
    transform,
    isActive, 
    activate, 
    deactivate 
  } = useMagneticElement<HTMLDivElement>(options);

  return (
    <div
      data-testid="magnetic-element"
      ref={elementRef}
      className={isActive ? (options?.activeClassName || 'active') : ''}
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
    global.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;
  });

  afterAll(() => {
    global.MutationObserver = originalMutationObserver;
  });

  beforeEach(() => {
    // Reset external mock state
    mockMagneticEffectState = {
      transform: { x: 0, y: 0, scale: 1, rotation: 0, active: false, force: 0 },
      elementRef: { current: null },
    };
    // Use the imported module to clear the mock
    (useMagneticEffect as jest.Mock).mockClear();
    (useReducedMotion as jest.Mock).mockClear().mockReturnValue(false);
    (GalileoPhysicsSystem as jest.Mock).mockClear();
    // Reset getBoundingClientRect mock
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
  });

  it('renders with default values from mocked effect', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('x-value').textContent).toBe('0');
    expect(screen.getByTestId('y-value').textContent).toBe('0');
    expect(screen.getByTestId('scale-value').textContent).toBe('1');
    expect(screen.getByTestId('rotation-value').textContent).toBe('0');
    expect(screen.getByTestId('active-value').textContent).toBe('false');
    expect(screen.getByTestId('force-value').textContent).toBe('0');
    expect(screen.getByTestId('is-active-value').textContent).toBe('false');
  });

  it('applies active className when isActive state is true', async () => {
    const activeClassName = 'magnetic-active';
    // Get rerender function
    const { rerender } = render(<TestComponent options={{ activeClassName }} />); 
    expect(screen.getByTestId('magnetic-element')).not.toHaveClass(activeClassName);

    // Update state and rerender within act
    await act(async () => {
        updateMockMagneticTransform({ x: 10, y: 15 }); 
        rerender(<TestComponent options={{ activeClassName }} />);
        // Add a small delay if needed for effects to propagate after rerender
        // await new Promise(res => setTimeout(res, 0)); 
    });
    
    await waitFor(() => {
        expect(screen.getByTestId('is-active-value').textContent).toBe('true'); 
        expect(screen.getByTestId('magnetic-element')).toHaveClass(activeClassName);
    });

    // Update state back and rerender within act
    await act(async () => {
        updateMockMagneticTransform({ x: 0, y: 0 });
        rerender(<TestComponent options={{ activeClassName }} />);
    });

    await waitFor(() => {
        expect(screen.getByTestId('is-active-value').textContent).toBe('false');
        expect(screen.getByTestId('magnetic-element')).not.toHaveClass(activeClassName);
    });
  });

  it('calls callbacks when activation state changes based on movement', async () => {
    const onActivate = jest.fn();
    const onDeactivate = jest.fn();
    // Get rerender function
    const { rerender } = render(<TestComponent options={{ onActivate, onDeactivate }} />); 

    // Trigger activation: update state and rerender
    await act(async () => {
        updateMockMagneticTransform({ x: 5, y: -5 });
        rerender(<TestComponent options={{ onActivate, onDeactivate }} />);
    });
    
    await waitFor(() => expect(onActivate).toHaveBeenCalledTimes(1));
    expect(onDeactivate).not.toHaveBeenCalled();
    expect(screen.getByTestId('is-active-value').textContent).toBe('true');

    // Trigger deactivation: update state and rerender
    await act(async () => {
        updateMockMagneticTransform({ x: 0, y: 0 });
        rerender(<TestComponent options={{ onActivate, onDeactivate }} />);
    });

    await waitFor(() => expect(onDeactivate).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('is-active-value').textContent).toBe('false');
  });

  it('handles manual activation and deactivation via hook functions', async () => {
    const onActivate = jest.fn();
    const onDeactivate = jest.fn();
    render(<TestComponent options={{ onActivate, onDeactivate }}/>);

    await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
    });
    expect(screen.getByTestId('is-active-value').textContent).toBe('true');
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onDeactivate).not.toHaveBeenCalled();

    await act(async () => {
        fireEvent.click(screen.getByTestId('deactivate-btn'));
    });
    expect(screen.getByTestId('is-active-value').textContent).toBe('false');
    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('registers with physics system when registerWithPhysics is true', () => {
    render(
      <TestComponent
        options={{
          registerWithPhysics: true,
          physicsConfig: { mass: 2.0, restitution: 0.5 }
        }}
      />
    );
    expect(GalileoPhysicsSystem).toHaveBeenCalled();
    const mockInstance = (GalileoPhysicsSystem as jest.Mock).mock.results[0].value;
    expect(mockInstance.start).toHaveBeenCalled();
    expect(mockInstance.addObject).toHaveBeenCalledWith(expect.objectContaining({
      position: expect.objectContaining({ x: 250, y: 125 }),
      shape: 'circle',
      radius: 50,
      mass: 2.0,
      restitution: 0.5,
      isStatic: false,
      userData: expect.objectContaining({ isMagneticElement: true })
    }));
  });
}); 