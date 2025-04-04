import React, { FC, ReactElement } from 'react';
import { render, RenderOptions, act } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeProvider'; // Adjust path as needed
import { AnimationProvider } from '../../contexts/AnimationContext'; // Adjust path as needed

// Define a basic theme structure if needed for the wrapper
const mockTheme = {
  // Add minimal theme properties required by components under test
  // Example:
  colors: {
    primary: '#000',
    secondary: '#ccc',
    background: '#fff',
    text: '#333',
    // ... other necessary theme properties
  },
  spacing: (factor: number) => `${factor * 8}px`,
  // ... other necessary theme properties
};

const AllProviders: FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <ThemeProvider> // Remove theme prop, rely on provider's default
      <AnimationProvider>
        {children}
      </AnimationProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// === ADDED Animation Frame / Time Helpers ===

// Store RAF callbacks globally within the test utils
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

export const mockRaf = () => {
  jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback): number => {
    const id = ++rafId;
    rafCallbacks.set(id, cb);
    return id;
  });
  jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((handle: number) => {
    rafCallbacks.delete(handle);
  });
};

export const clearRafCallbacks = () => {
  rafCallbacks.clear();
  rafId = 0;
}

export const runAllRafs = (timestamp?: number) => {
  const time = timestamp ?? performance.now();
  const callbacksToRun = Array.from(rafCallbacks.values());
  rafCallbacks.clear(); 
  callbacksToRun.forEach(cb => {
    try { cb(time); } catch (e) { console.error('Error in RAF:', e); }
  });
};

// Mock Performance API
let mockPerfTime = 0;
export const mockPerformance = () => {
  jest.spyOn(window.performance, 'now').mockImplementation(() => mockPerfTime);
};

export const advanceTime = (ms: number) => {
  mockPerfTime += ms;
  return mockPerfTime;
};

export const resetTime = () => {
  mockPerfTime = 0;
};

// Helper to wait for physics/animation updates
export const waitForPhysics = async (frames = 5) => {
  for (let i = 0; i < frames; i++) {
    act(() => {
      runAllRafs(); 
    });
    // Add a small delay for React state updates using Promise + setTimeout
    await act(async () => {
      await new Promise(res => setTimeout(res, 0));
    });
  }
}; 