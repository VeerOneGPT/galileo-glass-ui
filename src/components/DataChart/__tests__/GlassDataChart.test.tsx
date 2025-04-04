import React, { useRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlassDataChart } from '../GlassDataChart';
import { ChartData, ChartOptions } from 'chart.js';
import 'jest-styled-components';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import userEvent from '@testing-library/user-event';
import { GlassDataChartProps, GlassDataChartRef } from '../types/ChartProps';
import { ChartDataset, DataPoint } from '../types/ChartTypes';

// Mock useGalileoStateSpring
jest.mock('../../../hooks/useGalileoStateSpring', () => ({
  useGalileoStateSpring: jest.fn((config, options) => ({
    style: { opacity: 1, transform: 'none' }, // Basic default style
    setState: jest.fn(),
    ref: { current: null }, // Keep original mock structure if needed
  })),
}));

// Mock useChartPhysicsInteraction with access to mock function
const mockInteractionHookReturn = {
    isDragging: false,
    isZooming: false,
    currentTransform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    getInteractionHandlers: jest.fn(() => ({ /* mock handlers */ })),
    zoomTo: jest.fn(),
    panBy: jest.fn(),
    resetView: jest.fn(),
};
const mockUseChartPhysicsInteraction = jest.fn(() => mockInteractionHookReturn);
jest.mock('../hooks/useChartPhysicsInteraction', () => ({
  useChartPhysicsInteraction: mockUseChartPhysicsInteraction,
}));

// Mock Chart.js library completely
// ... (rest of file)

// Helper for rendering with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
};

// Sample Data
const sampleDatasets: ChartDataset[] = [
    { id: 'd1', label: 'Dataset 1', data: [{ x: 1, y: 10 }, { x: 2, y: 20 }] },
];

describe('GlassDataChart - Physics Interaction Integration', () => {
    beforeEach(() => {
        // Clear mocks before each test
        mockUseChartPhysicsInteraction.mockClear();
        // Clear mock calls for returned functions if needed
        mockInteractionHookReturn.getInteractionHandlers.mockClear();
        mockInteractionHookReturn.zoomTo.mockClear();
        // ... clear other mock function calls ...
    });

    it('should pass interaction props to useChartPhysicsInteraction hook', () => {
        const interactionProps: GlassDataChartProps['interaction'] = {
            zoomPanEnabled: true,
            zoomMode: 'xy',
            physics: {
                tension: 200,
                friction: 25,
                mass: 1.5,
                minZoom: 0.2,
                maxZoom: 6,
                wheelSensitivity: 0.07,
                inertiaDuration: 400,
            }
        };

        renderWithTheme(
            <GlassDataChart
                datasets={sampleDatasets}
                variant="line"
                interaction={interactionProps}
            />
        );

        // Check if the hook was called
        expect(mockUseChartPhysicsInteraction).toHaveBeenCalledTimes(1);

        // Check if the hook was called with the correct options derived from props
        expect(mockUseChartPhysicsInteraction).toHaveBeenCalledWith(
            expect.anything(), // chartRef
            expect.objectContaining({
                enabled: true,
                mode: 'xy',
                physics: {
                    tension: 200,
                    friction: 25,
                    mass: 1.5,
                },
                minZoom: 0.2,
                maxZoom: 6,
                wheelSensitivity: 0.07,
                inertiaDuration: 400,
                respectReducedMotion: true, // Default value
            })
        );
    });

    it('should pass enabled: false to hook when zoomPanEnabled is false', () => {
         renderWithTheme(
            <GlassDataChart
                datasets={sampleDatasets}
                variant="line"
                interaction={{ zoomPanEnabled: false }}
            />
        );
        expect(mockUseChartPhysicsInteraction).toHaveBeenCalledTimes(1);
        expect(mockUseChartPhysicsInteraction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ enabled: false })
        );
    });

     it('should respect reduced motion preference', () => {
        // Mock useReducedMotion if needed, or check the default passed
         renderWithTheme(
            <GlassDataChart
                datasets={sampleDatasets}
                variant="line"
                interaction={{ zoomPanEnabled: true }}
            />
        );
        expect(mockUseChartPhysicsInteraction).toHaveBeenCalledTimes(1);
        expect(mockUseChartPhysicsInteraction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ respectReducedMotion: true }) // Check default
        );
    });
    
    // Add more tests if needed, e.g., for specific interaction scenarios
    // that might involve calls to the mocked hook's return functions,
    // although this depends on how GlassDataChart uses those functions.
});

// ... (rest of file, potentially other describe blocks) ...