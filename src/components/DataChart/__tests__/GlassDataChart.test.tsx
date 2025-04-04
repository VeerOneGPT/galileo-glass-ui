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

// Mock useChartPhysicsInteraction
jest.mock('../hooks/useChartPhysicsInteraction', () => ({
  useChartPhysicsInteraction: jest.fn(() => ({
    isDragging: false,
    isZooming: false,
    currentTransform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    getInteractionHandlers: jest.fn(() => ({ /* mock handlers */ })),
    zoomTo: jest.fn(),
    panBy: jest.fn(),
    resetView: jest.fn(),
  })),
}));

// Mock Chart.js library completely
// ... (rest of file)