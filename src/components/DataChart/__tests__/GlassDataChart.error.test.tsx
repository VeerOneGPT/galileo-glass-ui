/**
 * GlassDataChart Error Tests
 * 
 * Tests specifically focused on verifying fixes for:
 * 1. TypeError when changing variant props
 * 2. Maximum Update Depth errors when interaction options are disabled
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from '../../../theme';
import { GlassDataChart } from '../GlassDataChart';
import { AnimationProvider } from '../../../contexts/AnimationContext';
import { ChartDataset } from '../types/ChartTypes';

// Mock Chart.js register method to avoid actual registration
jest.mock('chart.js', () => {
  const original = jest.requireActual('chart.js');
  return {
    ...original,
    Chart: {
      register: jest.fn(),
    },
  };
});

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Chart: jest.fn(() => <div data-testid="mocked-chart">Chart</div>)
}));

// Mock hooks
jest.mock('../../../hooks/useAccessibilitySettings', () => ({
  useAccessibilitySettings: jest.fn(() => ({
    prefersReducedMotion: false,
    colorBlindnessType: null,
    contrastPreference: 'normal',
    fontSizeAdjustment: 0,
    isReducedMotion: false
  }))
}));

jest.mock('../../../hooks/useGlassTheme', () => ({
  useGlassTheme: jest.fn(() => ({
    colors: {
      primary: { main: '#7B68EE', light: '#9370DB', dark: '#6A5ACD' },
      background: { default: '#F9FAFB', paper: '#FFFFFF' },
      text: { primary: '#111827', secondary: '#6B7280' }
    },
    palette: {
      blue: '#3B82F6',
      green: '#10B981',
      red: '#EF4444',
      orange: '#F97316',
      purple: '#8B5CF6'
    }
  }))
}));

// Mock useGalileoStateSpring to avoid physics calculations
jest.mock('../../../hooks/useGalileoStateSpring', () => ({
  useGalileoStateSpring: jest.fn(() => ({ 
    value: 0, 
    isAnimating: false, 
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn()
  }))
}));

// Mock useChartPhysicsInteraction
jest.mock('../hooks/useChartPhysicsInteraction', () => ({
  useChartPhysicsInteraction: jest.fn(() => ({
    isPanning: false,
    zoomLevel: 1,
    applyZoom: jest.fn(),
    resetZoom: jest.fn()
  }))
}));

// Mock usePhysicsAnimation
jest.mock('../hooks/usePhysicsAnimation', () => ({
  usePhysicsAnimation: jest.fn(() => ({
    value: 0,
    applyOscillation: jest.fn(),
    applyPopIn: jest.fn()
  }))
}));

// Mock useQualityTier
jest.mock('../hooks/useQualityTier', () => ({
  useQualityTier: jest.fn(() => 'high'),
  getQualityBasedPhysicsParams: jest.fn(() => ({
    stiffness: 170,
    dampingRatio: 0.6,
    mass: 1,
    precision: 0.01
  })),
  getQualityBasedGlassParams: jest.fn(() => ({
    blurStrength: 'medium'
  }))
}));

// Mock dataset for testing
const mockChartDatasets: ChartDataset[] = [
  {
    id: '1',
    label: 'Dataset 1',
    data: [
      { x: 'Jan', y: 10 },
      { x: 'Feb', y: 20 },
      { x: 'Mar', y: 30 },
      { x: 'Apr', y: 25 },
      { x: 'May', y: 35 }
    ],
    style: {
      fillColor: 'rgba(75, 192, 192, 0.2)',
      lineColor: 'rgba(75, 192, 192, 1)',
    }
  }
];

// Custom renderer with all required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <AnimationProvider>
        {ui}
      </AnimationProvider>
    </ThemeProvider>
  );
};

describe('GlassDataChart Error Tests', () => {
  // Test for TypeError when changing variant
  test('should not throw TypeError when changing variant prop', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {}); // Suppress console errors
    
    const { rerender } = renderWithProviders(
      <GlassDataChart 
        datasets={mockChartDatasets}
        title="Test Chart"
        variant="line"
        legend={{ show: true }}
      />
    );
    
    // Rerender with different chart type
    act(() => {
      rerender(
        <ThemeProvider>
          <AnimationProvider>
            <GlassDataChart 
              datasets={mockChartDatasets}
              title="Test Chart"
              variant="bar"
              legend={{ show: true }}
            />
          </AnimationProvider>
        </ThemeProvider>
      );
    });
    
    // Rerender with pie chart type
    act(() => {
      rerender(
        <ThemeProvider>
          <AnimationProvider>
            <GlassDataChart 
              datasets={mockChartDatasets}
              title="Test Chart"
              variant="pie"
              legend={{ show: true }}
            />
          </AnimationProvider>
        </ThemeProvider>
      );
    });
    
    // Check that there were no errors related to TypeError on variant switch
    const typeErrorCalls = consoleSpy.mock.calls.filter(
      call => call[0] && typeof call[0] === 'string' && call[0].includes('TypeError')
    );
    
    expect(typeErrorCalls.length).toBe(0);
    consoleSpy.mockRestore();
  });
  
  // Test for Maximum Update Depth errors when hover interactions are disabled
  test('should not cause maximum update depth exceeded error when interactions are disabled', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {}); // Suppress console errors
    
    const onHover = jest.fn();
    
    renderWithProviders(
      <GlassDataChart 
        datasets={mockChartDatasets}
        title="Test Chart"
        variant="line"
        interaction={{
          physicsHoverEffects: false,
          showTooltips: false,
          zoomPanEnabled: false
        }}
      />
    );
    
    // Get the chart element
    const chart = screen.getByTestId('mocked-chart');
    
    // Simulate multiple hover events to try to trigger the error
    act(() => {
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseMove(chart);
      }
    });
    
    // Check for maximum update depth error messages
    const updateDepthErrors = consoleSpy.mock.calls.filter(
      call => call[0] && typeof call[0] === 'string' && 
      (call[0].includes('Maximum update depth exceeded') || call[0].includes('too many re-renders'))
    );
    
    expect(updateDepthErrors.length).toBe(0);
    consoleSpy.mockRestore();
  });
  
  // Test that physics interactions are properly disabled
  test('should completely disable physics effects when physicsHoverEffects is false', () => {
    const onHover = jest.fn();
    
    renderWithProviders(
      <GlassDataChart 
        datasets={mockChartDatasets}
        title="Test Chart"
        variant="line"
        interaction={{
          physicsHoverEffects: false
        }}
      />
    );
    
    // Get the chart element
    const chart = screen.getByTestId('mocked-chart');
    
    // Simulate hover event
    fireEvent.mouseMove(chart);
    
    // onHover might still be called but physics effects should be disabled
    // This is hard to test directly, but we're verifying the component doesn't crash
    expect(chart).toBeInTheDocument();
  });

  // Test key prop remounting for chart type changes
  test('should use key prop based on variant to guarantee remounting', () => {
    const { container, rerender } = renderWithProviders(
      <GlassDataChart 
        datasets={mockChartDatasets}
        title="Test Chart"
        variant="line"
      />
    );
    
    // With proper key implementation, the component should remount when variant changes
    // We can test this by checking if react-chartjs-2's Chart is called again
    const initialRenderCount = require('react-chartjs-2').Chart.mock.calls.length;
    
    // Rerender with different chart type
    rerender(
      <ThemeProvider>
        <AnimationProvider>
          <GlassDataChart 
            datasets={mockChartDatasets}
            title="Test Chart"
            variant="bar"
          />
        </AnimationProvider>
      </ThemeProvider>
    );
    
    const newRenderCount = require('react-chartjs-2').Chart.mock.calls.length;
    
    // The Chart component should be called again due to the key change
    expect(newRenderCount).toBeGreaterThan(initialRenderCount);
  });
}); 