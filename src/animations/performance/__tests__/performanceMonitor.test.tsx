/**
 * Tests for usePerformanceMonitor hook
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { 
    PerformanceMonitor, 
    createPerformanceMonitor, 
    MetricType, 
    PerformanceMetric 
} from '../../../utils/performance/performanceMonitor';
import '../../../types/css.d';
import { usePerformanceMonitor, PerformanceMetricType } from '../performanceMonitor';
import { useQualityTier } from '../useQualityTier';
import { QualityTier } from '../types';

// Define a mock class structure matching PerformanceObserver
class MockPerformanceObserverClass implements PerformanceObserver {
    // Static property
    static supportedEntryTypes: ReadonlyArray<string> = [];

    // Instance properties/methods
    observe = jest.fn();
    disconnect = jest.fn();
    takeRecords = jest.fn().mockReturnValue([]);

    // Constructor mock (can be simple if not used directly)
    constructor(callback: PerformanceObserverCallback) {}
}

// Assign the mock class to the global scope
global.PerformanceObserver = MockPerformanceObserverClass;

// --- Improved Time Mocks (Similar to useQualityTier fix) ---
let mockRafCallbacks: FrameRequestCallback[] = [];
let currentRafId = 0;
let mockTime = 0;
const originalPerformance = window.performance;
const originalRaf = global.requestAnimationFrame;
const originalCaf = global.cancelAnimationFrame;

const advanceTime = (ms: number) => {
  mockTime += ms;
};

const runAnimationFrame = (timeDeltaMs = 16.667) => {
  advanceTime(timeDeltaMs);
  const callbacks = mockRafCallbacks;
  mockRafCallbacks = [];
  callbacks.forEach(cb => {
    try {
      cb(mockTime);
    } catch (e) {
      console.error('Error in rAF callback', e);
    }
  });
};
// --- End Improved Time Mocks ---

// Mock useQualityTier hook
jest.mock('../useQualityTier');

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset Time Mocks
    mockTime = 0;
    mockRafCallbacks = [];
    currentRafId = 0;
    window.performance = {
        ...originalPerformance,
        now: jest.fn(() => mockTime),
        mark: jest.fn(),
        measure: jest.fn(),
        getEntriesByName: jest.fn().mockReturnValue([]),
        getEntriesByType: jest.fn().mockReturnValue([]),
        clearMarks: jest.fn(),
        clearMeasures: jest.fn(),
    };
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      const id = ++currentRafId;
      mockRafCallbacks.push(callback);
      return id;
    });
    global.cancelAnimationFrame = jest.fn((id: number) => {});
    // End Reset Time Mocks

    // Provide a default mock implementation for useQualityTier
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      setQualityPreference: jest.fn(),
      featureFlags: {}, // Default feature flags
      autoAdjusted: false,
      startPerformanceMonitoring: jest.fn(),
      stopPerformanceMonitoring: jest.fn(),
    });
  });

  afterEach(() => {
    // Restore original time functions
    window.performance = originalPerformance;
    global.requestAnimationFrame = originalRaf;
    global.cancelAnimationFrame = originalCaf;
  });

  describe('Initialization', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current.isEnabled).toBe(true); // Default enabled
      expect(result.current.samples).toEqual([]);
      // Test that initial average metrics are empty or default
      expect(result.current.averageMetrics).toEqual({}); // Check averageMetrics
      expect(result.current.fps).toBe(60); // Default FPS
      expect(result.current.isPerformanceIssue).toBe(false);
      expect(result.current.qualityTier).toBe(QualityTier.MEDIUM); // From default mock
    });

    test('should be disabled if options.enabled is false', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('Monitoring Control', () => {
    test('should enable monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      act(() => {
        result.current.enable();
      });
      expect(result.current.isEnabled).toBe(true);
      // Check if quality tier monitoring was started
      const qualityTierMockResult = (useQualityTier as jest.Mock).mock.results[0].value;
      expect(qualityTierMockResult.startPerformanceMonitoring).toHaveBeenCalled();
    });

    test('should disable monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor()); // Start enabled
      act(() => {
        result.current.disable();
      });
      expect(result.current.isEnabled).toBe(false);
      // Check if quality tier monitoring was stopped
      const qualityTierMockResult = (useQualityTier as jest.Mock).mock.results[0].value;
      expect(qualityTierMockResult.stopPerformanceMonitoring).toHaveBeenCalled();
    });
  });

  describe('Sampling and Metrics', () => {
    test('should collect samples when enabled', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({ sampleInterval: 100 }));

      await act(async () => {
        result.current.enable(); // Enable starts the rAF loop internally
      });

      // Simulate passing time and animation frames
      await act(async () => {
        // Simulate a few frames with realistic timings
        runAnimationFrame(16); // Frame 1
        runAnimationFrame(17); // Frame 2
        runAnimationFrame(16); // Frame 3
        // Add more frames to pass the sampleInterval (100ms)
        runAnimationFrame(18); // Frame 4
        runAnimationFrame(16); // Frame 5
        runAnimationFrame(17); // Frame 6 (~100ms passed)
      });

      // State updates happen within the rAF callbacks
      await waitFor(() => {
         expect(result.current.averageMetrics).not.toEqual({});
         expect(Object.keys(result.current.averageMetrics)).toContain(PerformanceMetricType.FPS);
         expect(Object.keys(result.current.averageMetrics)).toContain(PerformanceMetricType.FRAME_TIME);
      });
    });
  });

  describe('Quality Adjustment', () => {
    test('should downgrade quality tier if FPS is below threshold', async () => {
      const mockSetQualityPreference = jest.fn();
      (useQualityTier as jest.Mock).mockReturnValue({
        qualityTier: QualityTier.HIGH,
        setQualityPreference: mockSetQualityPreference,
      });

      const { result } = renderHook(() => usePerformanceMonitor({
        minFpsThreshold: 30,
        downgradeCooldown: 100,
        sampleInterval: 50,
        sampleSize: 5
      }));

      await act(async () => {
        result.current.enable();
      });

      // Simulate low FPS by running frames with long durations
      await act(async () => {
        for(let i = 0; i < 10; i++) { // Run enough frames to trigger sampling and cooldown
            runAnimationFrame(40); // Simulate ~25 FPS
        }
      });

      await waitFor(() => {
        expect(result.current.isPerformanceIssue).toBe(true);
        expect(mockSetQualityPreference).toHaveBeenCalledWith(QualityTier.MEDIUM);
      });
    });

    test('should upgrade quality tier if FPS recovers', async () => {
        const mockSetQualityPreference = jest.fn();
        (useQualityTier as jest.Mock).mockReturnValue({
            qualityTier: QualityTier.MEDIUM,
            setQualityPreference: mockSetQualityPreference,
            autoAdjusted: true, // Important: Must be true to allow upgrade
        });

        const { result } = renderHook(() => usePerformanceMonitor({
            targetFps: 55,
            minFpsThreshold: 45,
            upgradeCooldown: 100,
            sampleInterval: 50,
            sampleSize: 10
        }));

        await act(async () => {
            result.current.enable();
        });

        // Simulate high FPS
        await act(async () => {
           for(let i = 0; i < 20; i++) { // Run enough frames
               runAnimationFrame(16); // Simulate ~60+ FPS
           }
        });

        await waitFor(() => {
            expect(result.current.isPerformanceIssue).toBe(false);
            expect(mockSetQualityPreference).toHaveBeenCalledWith(QualityTier.HIGH);
        });
    });
  });
}); 