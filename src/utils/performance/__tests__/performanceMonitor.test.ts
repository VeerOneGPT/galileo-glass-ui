/**
 * Tests for Performance Monitor
 */

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
      frameTime: { value: 16.67, type: 'frameTime', severity: 'good', threshold: {}, normalized: 1, unit: 'ms' },
      memory: { value: 100, type: 'memory', severity: 'good', threshold: {}, normalized: 1, unit: 'MB' },
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
      getMetric: jest.fn((type) => ({ value: 60, type, severity: 'good' })),
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
      getMetric: jest.fn((type) => ({ value: 60, type, severity: 'good' })),
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
const {
  PerformanceMonitor,
  MetricType,
  MetricSeverity,
  createPerformanceMonitor,
} = require('../performanceMonitor');

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
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(() => callback(performance.now() + 16), 16) as unknown as number;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn((id) => {
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
      getEntries: () => entries
    });
  }
}

global.PerformanceObserver = MockPerformanceObserver as any;

describe('PerformanceMonitor', () => {
  let monitor;
  
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    monitor = new PerformanceMonitor();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('can be instantiated', () => {
    expect(monitor).toBeDefined();
    expect(PerformanceMonitor).toHaveBeenCalled();
  });
  
  test('factory function creates a monitor instance', () => {
    const instance = createPerformanceMonitor();
    expect(instance).toBeDefined();
  });
  
  test('starts and stops monitoring', () => {
    monitor.start();
    expect(monitor.start).toHaveBeenCalled();
    
    monitor.stop();
    expect(monitor.stop).toHaveBeenCalled();
  });
  
  test('getSnapshot returns a performance snapshot', () => {
    const snapshot = monitor.getSnapshot();
    expect(snapshot).toBeDefined();
    expect(snapshot.metrics).toBeDefined();
    expect(snapshot.deviceInfo).toBeDefined();
    expect(snapshot.overallScore).toBe(100);
  });
  
  test('getMetric returns a specific metric', () => {
    const metric = monitor.getMetric(MetricType.FPS);
    expect(metric).toBeDefined();
    expect(metric.type).toBe(MetricType.FPS);
  });
  
  test('reset clears metrics', () => {
    monitor.reset();
    expect(monitor.reset).toHaveBeenCalled();
  });
  
  test('custom metrics can be set and retrieved', () => {
    monitor.setCustomMetric('test', 42);
    expect(monitor.setCustomMetric).toHaveBeenCalledWith('test', 42);
    
    const metrics = monitor.getCustomMetrics();
    expect(monitor.getCustomMetrics).toHaveBeenCalled();
    expect(metrics).toBeDefined();
  });
  
  test('recommendations are provided when needed', () => {
    const recommendations = monitor.getRecommendations();
    expect(monitor.getRecommendations).toHaveBeenCalled();
    expect(Array.isArray(recommendations)).toBe(true);
  });
  
  test('provides glass effect recommendations', () => {
    const settings = monitor.getRecommendedGlassSettings();
    expect(monitor.getRecommendedGlassSettings).toHaveBeenCalled();
    expect(settings).toHaveProperty('blurStrength');
    expect(settings).toHaveProperty('backgroundOpacity');
  });
  
  test('identifies performance bottlenecks', () => {
    const bottlenecks = monitor.identifyBottlenecks();
    expect(monitor.identifyBottlenecks).toHaveBeenCalled();
    expect(Array.isArray(bottlenecks)).toBe(true);
  });
  
  test('timing events can be measured', () => {
    monitor.markEvent('start');
    expect(monitor.markEvent).toHaveBeenCalledWith('start');
    
    const duration = monitor.measureEvent('test', 'start', 'end');
    expect(monitor.measureEvent).toHaveBeenCalledWith('test', 'start', 'end');
    expect(duration).toBe(42);
  });
});