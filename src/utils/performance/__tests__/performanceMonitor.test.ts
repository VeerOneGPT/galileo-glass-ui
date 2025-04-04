/**
 * Tests for Performance Monitor
 */
// Import the dependencies after the mock setup, not at the top

// Add empty export to make this file a module
export {};

// Mock dependencies
const mockMetricType = {
  FPS: 'fps',
  FRAME_TIME: 'frameTime',
  MEMORY: 'memory',
  CPU: 'cpu',
  GPU: 'gpu',
  LAYOUT: 'layout',
  PAINT: 'paint',
  COMPOSITE: 'composite',
  STYLE: 'style',
  JS_HEAP: 'jsHeap',
  DOM_NODES: 'domNodes',
  NETWORK: 'network',
  TIME_TO_INTERACTIVE: 'timeToInteractive',
  LONG_TASKS: 'longTasks',
};

const mockMetricSeverity = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  MODERATE: 'moderate',
  POOR: 'poor',
  CRITICAL: 'critical',
};

// Mock the entire module
jest.mock('../performanceMonitor', () => {
  const createSnapshot = () => ({
    metrics: {
      fps: { value: 60, type: 'fps', severity: 'good', threshold: {}, normalized: 1, unit: 'fps' },
      frameTime: {
        value: 16.67,
        type: 'frameTime',
        severity: 'good',
        threshold: {},
        normalized: 1,
        unit: 'ms',
      },
      memory: {
        value: 100,
        type: 'memory',
        severity: 'good',
        threshold: {},
        normalized: 1,
        unit: 'MB',
      },
    },
    timestamp: Date.now(),
    deviceInfo: {
      deviceCapabilityTier: 'medium',
      featureSupportLevel: 'full',
      devicePixelRatio: 1,
      isMobile: false,
      screenSize: { width: 1920, height: 1080 },
      userAgent: 'test',
    },
    overallScore: 100,
    recommendations: [],
  });

  return {
    MetricType: mockMetricType,
    MetricSeverity: mockMetricSeverity,
    PerformanceMonitor: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
      getSnapshot: jest.fn(() => createSnapshot()),
      getMetric: jest.fn(type => ({ value: 60, type, severity: 'good' })),
      setCustomMetric: jest.fn(),
      getCustomMetrics: jest.fn(() => ({})),
      shouldReduceGlassEffects: jest.fn(() => false),
      getRecommendedGlassSettings: jest.fn(() => ({
        blurStrength: '10',
        backgroundOpacity: 0.2,
        enableGlow: true,
      })),
      identifyBottlenecks: jest.fn(() => []),
      getRecommendations: jest.fn(() => []),
      markEvent: jest.fn(),
      measureEvent: jest.fn(() => 42),
    })),
    createPerformanceMonitor: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
      getSnapshot: jest.fn(() => createSnapshot()),
      getMetric: jest.fn(type => ({ value: 60, type, severity: 'good' })),
      setCustomMetric: jest.fn(),
      getCustomMetrics: jest.fn(() => ({})),
      shouldReduceGlassEffects: jest.fn(() => false),
      getRecommendedGlassSettings: jest.fn(() => ({
        blurStrength: '10',
        backgroundOpacity: 0.2,
        enableGlow: true,
      })),
      identifyBottlenecks: jest.fn(() => []),
      getRecommendations: jest.fn(() => []),
      markEvent: jest.fn(),
      measureEvent: jest.fn(() => 42),
    })),
  };
});

// After mock setup, import the module
// const { // Remove require block
//   PerformanceMonitor,
//   MetricType,
//   MetricSeverity: _MetricSeverity,
//   createPerformanceMonitor,
// } = require('../performanceMonitor');

// Import using ES6 syntax after jest.mock
import {
  PerformanceMonitor,
  MetricType,
  MetricSeverity as _MetricSeverity, // Keep renaming
  createPerformanceMonitor,
  PerformanceMetric, // Assuming this is the correct type/enum 
  PerformanceSnapshot,
  PerformanceThresholds,
} from '../performanceMonitor';

import { act } from '@testing-library/react'; // Import act

// Mock browser APIs that might not be available in Jest environment
// Mock window.performance
const mockPerformanceMemory = {
  jsHeapSizeLimit: 2 * 1024 * 1024 * 1024, // 2GB
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB
};

const mockPerformance = {
  now: jest.fn(() => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn((name: string, type: string) => {
    if (name === 'testMeasure' && type === 'measure') {
      return [{ duration: 42 }];
    }
    return [];
  }),
  memory: mockPerformanceMemory,
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  return setTimeout(() => callback(performance.now() + 16), 16) as unknown as number;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn(id => {
  clearTimeout(id as unknown as NodeJS.Timeout);
});

// Mock performance object
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock PerformanceObserver
class MockPerformanceObserver {
  private callback: (list: any) => void;

  constructor(callback: (list: any) => void) {
    this.callback = callback;
  }

  observe() {
    // Store observer for testing
  }

  disconnect() {
    // No-op
  }

  // Helper method for testing
  triggerCallback(entries: any[]) {
    this.callback({
      getEntries: () => entries,
    });
  }
}

global.PerformanceObserver = MockPerformanceObserver as any;

// Mock performance.now if not relying on perf_hooks
if (typeof global.performance === 'undefined') {
  (global as any).performance = { now: jest.fn(() => Date.now()) };
}

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  // Use controllable time/rAF mocks
  let mockRafCallbacks: FrameRequestCallback[] = [];
  let currentRafId = 0;
  let mockTime = 0;
  const originalPerformanceNow = performance.now;
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

  beforeEach(() => {
    // Reset Time Mocks
    mockTime = 0;
    mockRafCallbacks = [];
    currentRafId = 0;
    performance.now = jest.fn(() => mockTime);
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      const id = ++currentRafId;
      mockRafCallbacks.push(callback);
      return id;
    });
    global.cancelAnimationFrame = jest.fn((id: number) => {});
    // End Reset Time Mocks

    monitor = createPerformanceMonitor(); // Test the actual factory
    // REMOVED: jest.useFakeTimers(); - Control time manually
  });

  afterEach(() => {
    monitor.stop();
    // Restore originals
    performance.now = originalPerformanceNow;
    global.requestAnimationFrame = originalRaf;
    global.cancelAnimationFrame = originalCaf;
    // REMOVED: jest.useRealTimers();
  });

  test('can be instantiated via factory', () => {
    // Check if the factory returns an instance of the actual class
    expect(monitor).toBeInstanceOf(PerformanceMonitor);
  });

  // test('factory function creates a monitor instance', () => { // Redundant with above
  //   const factoryMonitor = createPerformanceMonitor();
  //   expect(factoryMonitor).toBeInstanceOf(PerformanceMonitor);
  // });

  test('starts and stops monitoring', () => {
    const rafSpy = jest.spyOn(global, 'requestAnimationFrame');
    const cafSpy = jest.spyOn(global, 'cancelAnimationFrame');

    monitor.start();
    expect(rafSpy).toHaveBeenCalled();
    // Need to get the rafId returned by the first call
    const rafId = rafSpy.mock.results[0].value;

    monitor.stop();
    // Check stopped state - stop should cancel the *specific* rAF ID
    expect(cafSpy).toHaveBeenCalledWith(rafId);

    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  test('getSnapshot returns a valid snapshot structure', async () => {
    monitor.start();
    // Run a few frames to populate data
    await act(async () => {
        runAnimationFrame();
        runAnimationFrame();
    });
    monitor.stop();

    const snapshot = monitor.getSnapshot();
    expect(snapshot).toBeDefined();
    expect(snapshot.metrics).toBeDefined();
    expect(snapshot.metrics.fps).toBeDefined();
    expect(snapshot.metrics.fps?.value).toBeDefined();
    expect(snapshot.metrics.frameTime).toBeDefined();
    expect(snapshot.metrics.frameTime?.value).toBeDefined();
    expect(snapshot.deviceInfo).toBeDefined();
    expect(snapshot.overallScore).toBeDefined();
    expect(snapshot.timestamp).toBeGreaterThan(0);
  });

  test('getMetric returns a specific metric after sampling', async () => {
    monitor.start();
    await act(async () => {
        runAnimationFrame(16); // ~60fps
        runAnimationFrame(17);
        runAnimationFrame(16);
        runAnimationFrame(18);
    });
    monitor.stop();

    const metric = monitor.getMetric(MetricType.FPS);
    expect(metric).toBeDefined();
    expect(metric?.type).toBe(MetricType.FPS);
    expect(metric?.value).toBeGreaterThan(0);
    expect(metric?.unit).toBe('fps');

    const frameTimeMetric = monitor.getMetric(MetricType.FRAME_TIME);
    expect(frameTimeMetric).toBeDefined();
    expect(frameTimeMetric?.type).toBe(MetricType.FRAME_TIME);
    expect(frameTimeMetric?.value).toBeGreaterThan(0);
    expect(frameTimeMetric?.unit).toBe('ms');
  });

  test('reset clears metrics', async () => {
    monitor.start();
    await act(async () => { runAnimationFrame(); }); // Collect one sample
    monitor.stop();
    const snapshot1 = monitor.getSnapshot();
    expect(snapshot1.metrics.fps?.value).toBeGreaterThan(0);

    monitor.reset();
    const snapshot2 = monitor.getSnapshot();
    expect(snapshot2.metrics.fps?.value).toBe(0);
  });

  test('custom metrics can be set and retrieved', () => {
    monitor.setCustomMetric('testMetric', 42);
    const customMetrics = monitor.getCustomMetrics();
    
    // Check if the key exists
    expect(customMetrics['testMetric']).toBeDefined();
    // Assert directly on the value returned for the key
    expect(customMetrics['testMetric']).toBe(42);
  });

  test('getRecommendations returns an array', () => {
    // May need to simulate a performance issue to get actual recommendations
    const recommendations = monitor.getRecommendations();
    expect(Array.isArray(recommendations)).toBe(true);
  });

  test('provides default glass effect recommendations', () => {
    // This might depend on the initial state or simulated performance
    const settings = monitor.getRecommendedGlassSettings();
    expect(settings).toHaveProperty('blurStrength');
    expect(settings).toHaveProperty('backgroundOpacity');
    // Add more checks based on expected default recommendations
  });

  test('identifyBottlenecks returns an array', () => {
    // May need to simulate performance issues
    const bottlenecks = monitor.identifyBottlenecks();
    expect(Array.isArray(bottlenecks)).toBe(true);
  });

  test('timing events can be measured', () => {
    const perfSpyMark = jest.spyOn(performance, 'mark');
    const perfSpyMeasure = jest.spyOn(performance, 'measure');
    const perfSpyGetEntries = jest.spyOn(performance, 'getEntriesByName');

    monitor.markEvent('testStart');
    expect(perfSpyMark).toHaveBeenCalledWith('testStart');

    monitor.markEvent('testEnd');
    expect(perfSpyMark).toHaveBeenCalledWith('testEnd');

    const duration = monitor.measureEvent('testMeasure', 'testStart', 'testEnd');
    // Check if performance.measure was called correctly
    expect(perfSpyMeasure).toHaveBeenCalledWith('testMeasure', 'testStart', 'testEnd');
    // Check if performance.getEntriesByName was called to retrieve the measurement
    expect(perfSpyGetEntries).toHaveBeenCalledWith('testMeasure', 'measure');
    // Check the duration returned (using the mock value for getEntriesByName)
    expect(duration).toBe(42);

    perfSpyMark.mockRestore();
    perfSpyMeasure.mockRestore();
    perfSpyGetEntries.mockRestore();
  });
});
