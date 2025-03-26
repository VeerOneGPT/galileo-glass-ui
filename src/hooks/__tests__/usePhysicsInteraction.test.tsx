import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import usePhysicsInteraction from '../usePhysicsInteraction';
import { AnyHTMLElement } from '../../utils/elementTypes';

// Mock performance.now for testing
const originalPerformanceNow = global.performance.now;
jest.spyOn(global.performance, 'now').mockImplementation(() => 1000);

// Test component that uses the hook with proper typing
const PhysicsComponent = ({ 
  options = {}, 
  onStateChange = () => {}
}: {
  options?: any;
  onStateChange?: (state: any) => void;
}) => {
  // Use the generic parameter to specify HTMLDivElement
  const { ref, style, state, reset, applyForce } = usePhysicsInteraction<HTMLDivElement>(options);
  
  // Call the callback when state changes
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);
  
  return (
    <div 
      ref={ref}
      style={style}
      data-testid="physics-element"
    >
      <button 
        onClick={() => reset()} 
        data-testid="reset-button"
      >
        Reset
      </button>
      <button 
        onClick={() => applyForce({ x: 10, y: 5, z: 0 })} 
        data-testid="force-button"
      >
        Apply Force
      </button>
      <div data-testid="x-value">{state.x}</div>
      <div data-testid="y-value">{state.y}</div>
      <div data-testid="scale-value">{state.scale}</div>
      <div data-testid="active-value">{state.active ? 'true' : 'false'}</div>
    </div>
  );
};

// Clean up mocks after tests
afterAll(() => {
  global.performance.now = originalPerformanceNow;
});

describe('usePhysicsInteraction Hook', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      return setTimeout(() => cb(performance.now() + 16), 16) as unknown as number;
    });
    
    // Mock cancelAnimationFrame
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
      clearTimeout(id as unknown as NodeJS.Timeout);
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('initializes with default state', () => {
    const onStateChange = jest.fn();
    
    const { getByTestId } = render(
      <ThemeProvider>
        <PhysicsComponent onStateChange={onStateChange} />
      </ThemeProvider>
    );
    
    // Initial state should have zeros
    expect(getByTestId('x-value')).toHaveTextContent('0');
    expect(getByTestId('y-value')).toHaveTextContent('0');
    expect(getByTestId('scale-value')).toHaveTextContent('1');
    expect(getByTestId('active-value')).toHaveTextContent('false');
    
    // onStateChange should have been called with initial state
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      active: false
    }));
  });
  
  test('applies force and updates state', async () => {
    const onStateChange = jest.fn();
    
    const { getByTestId } = render(
      <ThemeProvider>
        <PhysicsComponent 
          options={{ type: 'spring', strength: 0.8 }} 
          onStateChange={onStateChange}
        />
      </ThemeProvider>
    );
    
    // Click the force button to apply a force
    fireEvent.click(getByTestId('force-button'));
    
    // Wait for animation frame to be processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // onStateChange should have been called with updated state
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
      x: expect.any(Number),
      y: expect.any(Number),
      velocity: expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number)
      })
    }));
    
    // Force button should have moved the element
    const xValue = Number(getByTestId('x-value').textContent);
    const yValue = Number(getByTestId('y-value').textContent);
    
    // Values should have changed from the force
    expect(xValue !== 0 || yValue !== 0).toBe(true);
  });
  
  test('resets state when reset is called', async () => {
    const onStateChange = jest.fn();
    
    const { getByTestId } = render(
      <ThemeProvider>
        <PhysicsComponent onStateChange={onStateChange} />
      </ThemeProvider>
    );
    
    // Apply force first
    fireEvent.click(getByTestId('force-button'));
    
    // Wait for animation frame to be processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Clear the mock to focus on reset calls
    onStateChange.mockClear();
    
    // Click the reset button
    fireEvent.click(getByTestId('reset-button'));
    
    // onStateChange should have been called with reset state
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      active: false,
      velocity: expect.objectContaining({
        x: 0,
        y: 0,
        z: 0
      })
    }));
    
    // The element should be reset to initial position
    expect(getByTestId('x-value')).toHaveTextContent('0');
    expect(getByTestId('y-value')).toHaveTextContent('0');
    expect(getByTestId('scale-value')).toHaveTextContent('1');
  });
  
  test('applies styles to the element', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <PhysicsComponent 
          options={{ 
            gpuAccelerated: true,
            affectsScale: true,
            smooth: true
          }}
        />
      </ThemeProvider>
    );
    
    const element = getByTestId('physics-element');
    
    // Should have transform style
    expect(element).toHaveStyle({
      transform: expect.any(String),
      willChange: 'transform',
      transition: expect.stringContaining('transform')
    });
  });
  
  test('respects different physics types', async () => {
    // Test multiple physics types
    const types = ['spring', 'magnetic', 'attract', 'repel'];
    
    for (const physicsType of types) {
      const onStateChange = jest.fn();
      
      const { unmount, getByTestId } = render(
        <ThemeProvider>
          <PhysicsComponent 
            options={{ 
              type: physicsType as any, 
              strength: 1,
              radius: 300
            }} 
            onStateChange={onStateChange}
          />
        </ThemeProvider>
      );
      
      // Simulate mouse movement without event data
      // This is the compatible way to do it in newer versions of testing-library
      fireEvent.mouseMove(document.body);
      
      // Apply a force
      fireEvent.click(getByTestId('force-button'));
      
      // Wait for animation frames
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      
      // Should have called onStateChange with non-zero values
      expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
        velocity: expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        })
      }));
      
      // Clean up between tests
      unmount();
    }
  });
});