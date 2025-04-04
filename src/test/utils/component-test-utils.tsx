/**
 * Component Testing Utilities
 * 
 * Provides utilities for testing components with necessary context providers
 */
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AnimationProvider } from '../../contexts/AnimationContext';

/**
 * Custom render function that wraps components with required providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider>
      <AnimationProvider>
        {children}
      </AnimationProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Creates a mock component for testing
 * @param name Component name
 * @param additionalProps Additional props to add to the mock component
 */
export function createMockComponent(name: string, additionalProps: Record<string, any> = {}) {
  const MockComponent = ({ children, ...props }: any) => (
    <div data-testid={`mock-${name.toLowerCase()}`} {...props} {...additionalProps}>
      {children}
    </div>
  );
  
  MockComponent.displayName = name;
  return MockComponent;
}

/**
 * Waits for component animations/effects to settle
 */
export async function waitForComponentToRender(timeout = 50): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * Sets up mocks for common UI components
 */
export function mockUIComponents() {
  jest.mock('../../components/Button', () => ({
    Button: createMockComponent('Button')
  }));
  
  jest.mock('../../components/Card', () => ({
    Card: createMockComponent('Card')
  }));
  
  jest.mock('../../components/DataChart/GlassDataChart', () => ({
    GlassDataChart: createMockComponent('GlassDataChart')
  }));
  
  // Add more component mocks as needed
} 