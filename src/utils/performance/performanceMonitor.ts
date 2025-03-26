/**
 * Enhanced Performance Monitor
 *
 * Advanced performance monitoring system for glass UI components with
 * detailed metrics collection, analysis, and reporting capabilities.
 */
// Import CSS type definitions
import '../../types/css';
import {
  detectFeatures,
  FeatureLevel,
  getFeatureSupportLevel,
  GLASS_REQUIREMENTS,
} from '../browserCompatibility';
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../deviceCapabilities';

/**
 * Performance metric types
 */
export enum MetricType {
  FPS = 'fps',
  FRAME_TIME = 'frameTime',
  MEMORY = 'memory',
  CPU = 'cpu',
  GPU = 'gpu',
  LAYOUT = 'layout',
  PAINT = 'paint',
  COMPOSITE = 'composite',
  STYLE = 'style',
  JS_HEAP = 'jsHeap',
  DOM_NODES = 'domNodes',
  NETWORK = 'network',
  TIME_TO_INTERACTIVE = 'timeToInteractive',
  LONG_TASKS = 'longTasks',
}

/**
 * Performance metric severity
 */
export enum MetricSeverity {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  MODERATE = 'moderate',
  POOR = 'poor',
  CRITICAL = 'critical',
}

/**
 * Single performance metric with metadata
 */
export interface PerformanceMetric {
  type: MetricType;
  value: number;
  unit: string;
  timestamp: number;
  severity: MetricSeverity;
  threshold: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  normalized: number; // 0-1 value for relative comparison
  delta?: number; // Change from previous measurement
  deltaPercent?: number; // Percentage change from previous
}

/**
 * Complete performance snapshot
 */
export interface PerformanceSnapshot {
  metrics: Record<MetricType, PerformanceMetric>;
  timestamp: number;
  deviceInfo: {
    deviceCapabilityTier: DeviceCapabilityTier;
    featureSupportLevel: FeatureLevel;
    devicePixelRatio: number;
    isMobile: boolean;
    isLowPowerMode?: boolean;
    userAgent: string;
    screenSize: {
      width: number;
      height: number;
    };
  };
  overallScore: number; // 0-100 score
  detectedBottleneck?: MetricType;
  recommendations: string[];
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  [MetricType.FPS]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.FRAME_TIME]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.MEMORY]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.CPU]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.GPU]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.LAYOUT]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.PAINT]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.COMPOSITE]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.STYLE]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.JS_HEAP]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.DOM_NODES]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.NETWORK]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.TIME_TO_INTERACTIVE]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
  [MetricType.LONG_TASKS]: {
    excellent: number;
    good: number;
    moderate: number;
    poor: number;
  };
}

/**
 * Default performance thresholds
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  [MetricType.FPS]: {
    excellent: 58, // 58+ FPS
    good: 50, // 50-57 FPS
    moderate: 40, // 40-49 FPS
    poor: 30, // below 30 FPS is critical
  },
  [MetricType.FRAME_TIME]: {
    excellent: 16.7, // 16.7ms or less (60 FPS)
    good: 20, // 20ms (50 FPS)
    moderate: 25, // 25ms (40 FPS)
    poor: 33.3, // 33.3ms (30 FPS) or more is critical
  },
  [MetricType.MEMORY]: {
    excellent: 50, // <50MB
    good: 100, // <100MB
    moderate: 200, // <200MB
    poor: 300, // >300MB is critical
  },
  [MetricType.CPU]: {
    excellent: 20, // <20% CPU usage
    good: 40, // <40% CPU usage
    moderate: 60, // <60% CPU usage
    poor: 80, // >80% is critical
  },
  [MetricType.GPU]: {
    excellent: 20, // <20% GPU usage
    good: 40, // <40% GPU usage
    moderate: 60, // <60% GPU usage
    poor: 80, // >80% is critical
  },
  [MetricType.LAYOUT]: {
    excellent: 5, // <5 layout operations per second
    good: 10, // <10 layout operations per second
    moderate: 20, // <20 layout operations per second
    poor: 30, // >30 layout operations per second is critical
  },
  [MetricType.PAINT]: {
    excellent: 5, // <5 paint operations per second
    good: 10, // <10 paint operations per second
    moderate: 20, // <20 paint operations per second
    poor: 30, // >30 paint operations per second is critical
  },
  [MetricType.COMPOSITE]: {
    excellent: 10, // <10 composite operations per second
    good: 20, // <20 composite operations per second
    moderate: 30, // <30 composite operations per second
    poor: 50, // >50 composite operations per second is critical
  },
  [MetricType.STYLE]: {
    excellent: 20, // <20 style recalculations per second
    good: 50, // <50 style recalculations per second
    moderate: 100, // <100 style recalculations per second
    poor: 200, // >200 style recalculations per second is critical
  },
  [MetricType.JS_HEAP]: {
    excellent: 50, // <50MB
    good: 100, // <100MB
    moderate: 200, // <200MB
    poor: 300, // >300MB is critical
  },
  [MetricType.DOM_NODES]: {
    excellent: 500, // <500 nodes
    good: 1000, // <1000 nodes
    moderate: 2000, // <2000 nodes
    poor: 5000, // >5000 nodes is critical
  },
  [MetricType.NETWORK]: {
    excellent: 10, // <10 requests per second
    good: 20, // <20 requests per second
    moderate: 30, // <30 requests per second
    poor: 50, // >50 requests per second is critical
  },
  [MetricType.TIME_TO_INTERACTIVE]: {
    excellent: 50, // <50ms
    good: 100, // <100ms
    moderate: 200, // <200ms
    poor: 300, // >300ms is critical
  },
  [MetricType.LONG_TASKS]: {
    excellent: 0, // 0 long tasks
    good: 1, // 1 long task
    moderate: 3, // 2-3 long tasks
    poor: 5, // >5 long tasks is critical
  },
};

/**
 * Default metric units
 */
const METRIC_UNITS: Record<MetricType, string> = {
  [MetricType.FPS]: 'fps',
  [MetricType.FRAME_TIME]: 'ms',
  [MetricType.MEMORY]: 'MB',
  [MetricType.CPU]: '%',
  [MetricType.GPU]: '%',
  [MetricType.LAYOUT]: 'ops',
  [MetricType.PAINT]: 'ops',
  [MetricType.COMPOSITE]: 'ops',
  [MetricType.STYLE]: 'ops',
  [MetricType.JS_HEAP]: 'MB',
  [MetricType.DOM_NODES]: 'nodes',
  [MetricType.NETWORK]: 'req/s',
  [MetricType.TIME_TO_INTERACTIVE]: 'ms',
  [MetricType.LONG_TASKS]: 'tasks',
};

/**
 * Generate initial empty performance snapshot
 */
const createEmptySnapshot = (): PerformanceSnapshot => {
  const metrics: Record<MetricType, PerformanceMetric> = {} as Record<
    MetricType,
    PerformanceMetric
  >;

  Object.values(MetricType).forEach(metricType => {
    metrics[metricType] = {
      type: metricType,
      value: 0,
      unit: METRIC_UNITS[metricType],
      timestamp: Date.now(),
      severity: MetricSeverity.GOOD,
      threshold: DEFAULT_THRESHOLDS[metricType],
      normalized: 1, // Start with perfect score
      delta: 0,
      deltaPercent: 0,
    };
  });

  // Initialize with good FPS
  metrics[MetricType.FPS].value = 60;
  metrics[MetricType.FRAME_TIME].value = 16.67;

  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth || 1920 : 1920;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight || 1080 : 1080;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile =
    typeof navigator !== 'undefined'
      ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      : false;

  return {
    metrics,
    timestamp: Date.now(),
    deviceInfo: {
      deviceCapabilityTier: DeviceCapabilityTier.MEDIUM,
      featureSupportLevel: FeatureLevel.FULL,
      devicePixelRatio,
      isMobile,
      userAgent,
      screenSize: {
        width: screenWidth,
        height: screenHeight,
      },
    },
    overallScore: 100,
    recommendations: [],
  };
};

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitorConfig {
  /** Auto-start monitoring when created */
  autoStart?: boolean;

  /** Update interval in milliseconds */
  updateInterval?: number;

  /** History size (number of snapshots to keep) */
  historySize?: number;

  /** Custom performance thresholds */
  thresholds?: Partial<PerformanceThresholds>;

  /** Whether to capture long tasks */
  captureLongTasks?: boolean;

  /** Whether to capture layout operations */
  captureLayoutOperations?: boolean;

  /** Whether to capture paint operations */
  capturePaintOperations?: boolean;

  /** Whether to measure DOM nodes */
  measureDOMNodes?: boolean;

  /** Whether to capture network requests */
  captureNetworkRequests?: boolean;

  /** Whether to report to console when performance is poor */
  reportToCosole?: boolean;

  /** Whether to use the Performance Observer API */
  usePerformanceObserver?: boolean;

  /** Callback when snapshot is updated */
  onUpdate?: (snapshot: PerformanceSnapshot) => void;

  /** Callback when performance becomes poor */
  onPerformanceIssue?: (snapshot: PerformanceSnapshot) => void;
}

/**
 * Enhanced Performance Monitor class
 */
export class PerformanceMonitor {
  private config: Required<PerformanceMonitorConfig>;
  private active = false;
  private intervalId: NodeJS.Timeout | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameTimings: number[] = [];
  private currentSnapshot: PerformanceSnapshot;
  private history: PerformanceSnapshot[] = [];
  private observers: Record<string, PerformanceObserver | null> = {};
  private longTaskCount = 0;
  private layoutCount = 0;
  private paintCount = 0;
  private styleCount = 0;
  private networkRequests = 0;
  private lastResetTime: number = Date.now();
  private lastMetricsReset: Record<string, number> = {};
  private customMetrics: Record<string, number> = {};

  /**
   * Create a new performance monitor
   */
  constructor(config: PerformanceMonitorConfig = {}) {
    // Default configuration
    this.config = {
      autoStart: config.autoStart ?? false,
      updateInterval: config.updateInterval ?? 1000,
      historySize: config.historySize ?? 60,
      thresholds: config.thresholds ?? DEFAULT_THRESHOLDS,
      captureLongTasks: config.captureLongTasks ?? true,
      captureLayoutOperations: config.captureLayoutOperations ?? true,
      capturePaintOperations: config.capturePaintOperations ?? true,
      measureDOMNodes: config.measureDOMNodes ?? true,
      captureNetworkRequests: config.captureNetworkRequests ?? true,
      reportToCosole: config.reportToCosole ?? false,
      usePerformanceObserver: config.usePerformanceObserver ?? true,
      onUpdate: config.onUpdate ?? (() => {}),
      onPerformanceIssue: config.onPerformanceIssue ?? (() => {}),
    };

    // Initialize snapshot
    this.currentSnapshot = createEmptySnapshot();

    // Apply custom thresholds
    if (config.thresholds) {
      Object.entries(config.thresholds).forEach(([metricType, thresholds]) => {
        if (this.currentSnapshot.metrics[metricType as MetricType]) {
          this.currentSnapshot.metrics[metricType as MetricType].threshold = {
            ...this.currentSnapshot.metrics[metricType as MetricType].threshold,
            ...thresholds,
          };
        }
      });
    }

    // Reset last metrics time
    Object.values(MetricType).forEach(type => {
      this.lastMetricsReset[type] = Date.now();
    });

    // Auto-start if configured
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start monitoring performance
   */
  public start(): void {
    if (this.active) return;

    this.active = true;
    this.lastFrameTime = performance.now();
    this.lastResetTime = Date.now();

    // Initialize device info
    this.updateDeviceInfo();

    // Set up performance observers if available and configured
    if (typeof window !== 'undefined' && this.config.usePerformanceObserver) {
      this.setupPerformanceObservers();
    }

    // Start measuring frames
    this.measureFrame(performance.now());

    // Start update interval
    this.intervalId = setInterval(() => {
      this.updateSnapshot();
    }, this.config.updateInterval);
  }

  /**
   * Stop monitoring performance
   */
  public stop(): void {
    this.active = false;

    // Clear update interval
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Stop frame measurement
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect all observers
    Object.values(this.observers).forEach(observer => {
      if (observer) observer.disconnect();
    });

    this.observers = {};
  }

  /**
   * Reset monitoring
   */
  public reset(): void {
    this.frameTimings = [];
    this.lastFrameTime = 0;
    this.longTaskCount = 0;
    this.layoutCount = 0;
    this.paintCount = 0;
    this.styleCount = 0;
    this.networkRequests = 0;
    this.lastResetTime = Date.now();

    // Reset last metrics time
    Object.values(MetricType).forEach(type => {
      this.lastMetricsReset[type] = Date.now();
    });

    // Reset custom metrics
    this.customMetrics = {};

    // Clear history
    this.history = [];

    // Create new snapshot
    this.currentSnapshot = createEmptySnapshot();
    this.updateDeviceInfo();
  }

  /**
   * Get current performance snapshot
   */
  public getSnapshot(): PerformanceSnapshot {
    return this.currentSnapshot;
  }

  /**
   * Get performance history
   */
  public getHistory(): PerformanceSnapshot[] {
    return [...this.history];
  }

  /**
   * Set a custom metric value
   */
  public setCustomMetric(name: string, value: number): void {
    this.customMetrics[name] = value;
  }

  /**
   * Get a specific metric
   */
  public getMetric(metricType: MetricType): PerformanceMetric {
    return this.currentSnapshot.metrics[metricType];
  }

  /**
   * Get all custom metrics
   */
  public getCustomMetrics(): Record<string, number> {
    return { ...this.customMetrics };
  }

  /**
   * Get overall performance score
   */
  public getOverallScore(): number {
    return this.currentSnapshot.overallScore;
  }

  /**
   * Get performance recommendations
   */
  public getRecommendations(): string[] {
    return [...this.currentSnapshot.recommendations];
  }

  /**
   * Mark a specific event for timing
   */
  public markEvent(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure time between two marks
   */
  public measureEvent(name: string, startMark: string, endMark: string): number {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, 'measure');
        if (entries.length > 0) {
          return entries[0].duration;
        }
      } catch (e) {
        console.warn('Failed to measure event:', e);
      }
    }
    return 0;
  }

  /**
   * Measure a specific DOM element's rendering performance
   */
  public measureElement(element: HTMLElement): Record<string, number> {
    if (!element) return {};

    const metrics: Record<string, number> = {};

    // Get element size
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height;
    metrics.renderArea = area;

    // Count child nodes
    metrics.childNodes = element.querySelectorAll('*').length;

    // Check glass effect properties
    const style = window.getComputedStyle(element);

    // Check backdrop-filter
    if (style.backdropFilter || style.webkitBackdropFilter) {
      metrics.hasBackdropFilter = 1;

      // Extract blur value
      const filterStr = style.backdropFilter || style.webkitBackdropFilter;
      const blurMatch = filterStr.match(/blur\((\d+)px\)/);
      if (blurMatch) {
        metrics.blurStrength = parseInt(blurMatch[1], 10);
      }
    } else {
      metrics.hasBackdropFilter = 0;
    }

    // Check background opacity
    if (style.backgroundColor.includes('rgba')) {
      const match = style.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        metrics.backgroundOpacity = parseFloat(match[4]);
      }
    }

    // Check if hardware accelerated
    metrics.isHardwareAccelerated =
      (style.transform !== 'none' && style.transform.includes('translateZ')) ||
      style.willChange.includes('transform')
        ? 1
        : 0;

    return metrics;
  }

  /**
   * Identify performance bottlenecks
   */
  public identifyBottlenecks(): MetricType[] {
    const criticalMetrics: MetricType[] = [];
    const poorMetrics: MetricType[] = [];

    Object.values(this.currentSnapshot.metrics).forEach(metric => {
      if (metric.severity === MetricSeverity.CRITICAL) {
        criticalMetrics.push(metric.type);
      } else if (metric.severity === MetricSeverity.POOR) {
        poorMetrics.push(metric.type);
      }
    });

    return [...criticalMetrics, ...poorMetrics];
  }

  /**
   * Check if glass effects should be reduced
   */
  public shouldReduceGlassEffects(): boolean {
    const fps = this.currentSnapshot.metrics[MetricType.FPS].value;
    const frameTime = this.currentSnapshot.metrics[MetricType.FRAME_TIME].value;
    const style = this.currentSnapshot.metrics[MetricType.STYLE].value;

    return fps < 40 || frameTime > 25 || style > 100 || this.currentSnapshot.overallScore < 60;
  }

  /**
   * Get recommended glass effect settings based on performance
   */
  public getRecommendedGlassSettings(): Record<string, any> {
    const score = this.currentSnapshot.overallScore;
    const deviceTier = this.currentSnapshot.deviceInfo.deviceCapabilityTier;

    // Recommended settings object
    const settings: Record<string, any> = {};

    // Base blur strength on performance score and device tier
    if (score < 50 || deviceTier === DeviceCapabilityTier.MINIMAL) {
      settings.blurStrength = 3;
      settings.backgroundOpacity = 0.6;
      settings.enableGlow = false;
      settings.enableAnimations = false;
      settings.simplifyBorders = true;
    } else if (score < 70 || deviceTier === DeviceCapabilityTier.LOW) {
      settings.blurStrength = 5;
      settings.backgroundOpacity = 0.5;
      settings.enableGlow = false;
      settings.enableAnimations = true;
      settings.simplifyBorders = true;
    } else if (score < 85 || deviceTier === DeviceCapabilityTier.MEDIUM) {
      settings.blurStrength = 8;
      settings.backgroundOpacity = 0.3;
      settings.enableGlow = true;
      settings.enableAnimations = true;
      settings.simplifyBorders = false;
    } else {
      settings.blurStrength = 10;
      settings.backgroundOpacity = 0.2;
      settings.enableGlow = true;
      settings.enableAnimations = true;
      settings.simplifyBorders = false;
    }

    // Adjust for device pixel ratio
    if (this.currentSnapshot.deviceInfo.devicePixelRatio > 2) {
      settings.blurStrength = Math.min(settings.blurStrength + 2, 12);
    }

    // Special case for mobile
    if (this.currentSnapshot.deviceInfo.isMobile) {
      settings.blurStrength = Math.max(settings.blurStrength - 2, 3);
      settings.backgroundOpacity = Math.min(settings.backgroundOpacity + 0.1, 0.7);
    }

    return settings;
  }

  /**
   * Generate recommendations based on metrics
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.currentSnapshot.metrics;

    // Check FPS and frame time
    if (
      metrics[MetricType.FPS].severity === MetricSeverity.POOR ||
      metrics[MetricType.FPS].severity === MetricSeverity.CRITICAL
    ) {
      recommendations.push('Reduce visual complexity and animation count to improve frame rate.');
    }

    // Check style and layout
    if (
      metrics[MetricType.STYLE].severity === MetricSeverity.POOR ||
      metrics[MetricType.LAYOUT].severity === MetricSeverity.POOR
    ) {
      recommendations.push(
        'Minimize CSS complexity and DOM operations to reduce layout thrashing.'
      );
    }

    // Check memory usage
    if (
      metrics[MetricType.MEMORY].severity === MetricSeverity.POOR ||
      metrics[MetricType.JS_HEAP].severity === MetricSeverity.POOR
    ) {
      recommendations.push(
        'Optimize memory usage by removing unnecessary elements and cleaning up unused resources.'
      );
    }

    // Glass-specific recommendations
    const deviceTier = this.currentSnapshot.deviceInfo.deviceCapabilityTier;

    if (deviceTier === DeviceCapabilityTier.LOW || deviceTier === DeviceCapabilityTier.MINIMAL) {
      recommendations.push('Reduce blur strength for backdrop-filter effects (3-5px recommended).');
      recommendations.push(
        'Increase background opacity to reduce transparency rendering cost (0.5-0.7 recommended).'
      );
      recommendations.push(
        'Disable glow effects and other decorative elements for low-end devices.'
      );
    }

    if (metrics[MetricType.FPS].value < 40) {
      recommendations.push(
        'Apply hardware acceleration with transform: translateZ(0) and will-change: transform to glass elements.'
      );
      recommendations.push('Simplify or disable animations on glass elements when FPS is low.');
    }

    // Check DOM nodes
    if (metrics[MetricType.DOM_NODES].severity === MetricSeverity.POOR) {
      recommendations.push(
        'Reduce the number of DOM nodes in the document to improve rendering performance.'
      );
    }

    return recommendations;
  }

  /**
   * Set up Performance Observer API to monitor various metrics
   */
  private setupPerformanceObservers(): void {
    // Check if Performance Observer API is available
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      // Observer for long tasks
      if (this.config.captureLongTasks) {
        this.observers.longTask = new PerformanceObserver(list => {
          list.getEntries().forEach(() => {
            this.longTaskCount++;
          });
        });
        this.observers.longTask.observe({ entryTypes: ['longtask'] });
      }

      // Observer for layout operations
      if (this.config.captureLayoutOperations) {
        this.observers.layout = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'layout-shift') {
              this.layoutCount++;
            }
          });
        });
        this.observers.layout.observe({ entryTypes: ['layout-shift'] });
      }

      // Observer for paint operations
      if (this.config.capturePaintOperations) {
        this.observers.paint = new PerformanceObserver(list => {
          list.getEntries().forEach(() => {
            this.paintCount++;
          });
        });
        this.observers.paint.observe({ entryTypes: ['paint'] });
      }

      // Observer for resource timing
      if (this.config.captureNetworkRequests) {
        this.observers.resource = new PerformanceObserver(list => {
          list.getEntries().forEach(() => {
            this.networkRequests++;
          });
        });
        this.observers.resource.observe({ entryTypes: ['resource'] });
      }

      // Observer for measure operations (custom timing)
      this.observers.measure = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.customMetrics[entry.name] = entry.duration;
        });
      });
      this.observers.measure.observe({ entryTypes: ['measure'] });
    } catch (e) {
      console.warn('Performance Observer API setup failed:', e);
    }
  }

  /**
   * Measure frame timing
   */
  private measureFrame(timestamp: number): void {
    if (!this.active) return;

    // Calculate time since last frame
    if (this.lastFrameTime > 0) {
      const frameTiming = timestamp - this.lastFrameTime;
      this.frameTimings.push(frameTiming);

      // Keep frame history limited
      if (this.frameTimings.length > 60) {
        this.frameTimings.shift();
      }
    }

    this.lastFrameTime = timestamp;

    // Schedule next frame measurement
    this.animationFrameId = requestAnimationFrame(this.measureFrame.bind(this));
  }

  /**
   * Calculate frame stats
   */
  private calculateFrameStats(): { fps: number; frameTime: number } {
    if (this.frameTimings.length === 0) {
      return { fps: 60, frameTime: 16.67 };
    }

    // Get the last 30 frames or all if less
    const samples = Math.min(this.frameTimings.length, 30);
    const recentFrames = this.frameTimings.slice(-samples);

    // Calculate average frame time
    const avgFrameTime = recentFrames.reduce((sum, time) => sum + time, 0) / samples;

    // Calculate FPS from frame time
    const fps = Math.min(60, Math.round(1000 / Math.max(1, avgFrameTime)));

    return { fps, frameTime: avgFrameTime };
  }

  /**
   * Update device information
   */
  private updateDeviceInfo(): void {
    const deviceCapabilityTier = getDeviceCapabilityTier();
    const features = detectFeatures();
    const featureSupportLevel = getFeatureSupportLevel(GLASS_REQUIREMENTS, features);

    this.currentSnapshot.deviceInfo.deviceCapabilityTier = deviceCapabilityTier;
    this.currentSnapshot.deviceInfo.featureSupportLevel = featureSupportLevel;

    // Detect low power mode if possible (iOS)
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          this.currentSnapshot.deviceInfo.isLowPowerMode = battery.level < 0.2;
        })
        .catch(() => {
          // Ignore errors with battery API
        });
    }
  }

  /**
   * Determine metric severity based on value and thresholds
   */
  private getMetricSeverity(
    value: number,
    thresholds: {
      excellent: number;
      good: number;
      moderate: number;
      poor: number;
    },
    metricType: MetricType
  ): MetricSeverity {
    // Handle special cases first
    if (metricType === MetricType.FPS) {
      if (value >= thresholds.excellent) return MetricSeverity.EXCELLENT;
      if (value >= thresholds.good) return MetricSeverity.GOOD;
      if (value >= thresholds.moderate) return MetricSeverity.MODERATE;
      if (value >= thresholds.poor) return MetricSeverity.POOR;
      return MetricSeverity.CRITICAL;
    }

    if (metricType === MetricType.FRAME_TIME) {
      if (value <= thresholds.excellent) return MetricSeverity.EXCELLENT;
      if (value <= thresholds.good) return MetricSeverity.GOOD;
      if (value <= thresholds.moderate) return MetricSeverity.MODERATE;
      if (value <= thresholds.poor) return MetricSeverity.POOR;
      return MetricSeverity.CRITICAL;
    }

    // For other metrics, lower is better
    if (value <= thresholds.excellent) return MetricSeverity.EXCELLENT;
    if (value <= thresholds.good) return MetricSeverity.GOOD;
    if (value <= thresholds.moderate) return MetricSeverity.MODERATE;
    if (value <= thresholds.poor) return MetricSeverity.POOR;
    return MetricSeverity.CRITICAL;
  }

  /**
   * Calculate normalized score for a metric (0-1)
   */
  private normalizeMetric(
    value: number,
    thresholds: {
      excellent: number;
      good: number;
      moderate: number;
      poor: number;
    },
    metricType: MetricType
  ): number {
    // For FPS, higher is better
    if (metricType === MetricType.FPS) {
      if (value >= thresholds.excellent) return 1;
      if (value >= thresholds.good)
        return 0.8 + ((value - thresholds.good) / (thresholds.excellent - thresholds.good)) * 0.2;
      if (value >= thresholds.moderate)
        return (
          0.6 + ((value - thresholds.moderate) / (thresholds.good - thresholds.moderate)) * 0.2
        );
      if (value >= thresholds.poor)
        return 0.3 + ((value - thresholds.poor) / (thresholds.moderate - thresholds.poor)) * 0.3;
      return Math.max(0, (value / thresholds.poor) * 0.3);
    }

    // For frame time, lower is better
    if (metricType === MetricType.FRAME_TIME) {
      if (value <= thresholds.excellent) return 1;
      if (value <= thresholds.good)
        return 0.8 + ((thresholds.good - value) / (thresholds.good - thresholds.excellent)) * 0.2;
      if (value <= thresholds.moderate)
        return (
          0.6 + ((thresholds.moderate - value) / (thresholds.moderate - thresholds.good)) * 0.2
        );
      if (value <= thresholds.poor)
        return 0.3 + ((thresholds.poor - value) / (thresholds.poor - thresholds.moderate)) * 0.3;
      return Math.max(0, 0.3 - ((value - thresholds.poor) / (thresholds.poor * 0.5)) * 0.3);
    }

    // For other metrics, lower is better
    if (value <= thresholds.excellent) return 1;
    if (value <= thresholds.good)
      return 0.8 + ((thresholds.good - value) / (thresholds.good - thresholds.excellent)) * 0.2;
    if (value <= thresholds.moderate)
      return 0.6 + ((thresholds.moderate - value) / (thresholds.moderate - thresholds.good)) * 0.2;
    if (value <= thresholds.poor)
      return 0.3 + ((thresholds.poor - value) / (thresholds.poor - thresholds.moderate)) * 0.3;

    // Beyond poor threshold
    return Math.max(0, 0.3 - ((value - thresholds.poor) / thresholds.poor) * 0.3);
  }

  /**
   * Calculate overall score based on all metrics
   */
  private calculateOverallScore(metrics: Record<MetricType, PerformanceMetric>): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Define weights for different metrics
    const weights: Partial<Record<MetricType, number>> = {
      [MetricType.FPS]: 3,
      [MetricType.FRAME_TIME]: 3,
      [MetricType.STYLE]: 2,
      [MetricType.LAYOUT]: 2,
      [MetricType.MEMORY]: 1,
      [MetricType.JS_HEAP]: 1,
      [MetricType.LONG_TASKS]: 2,
      [MetricType.DOM_NODES]: 1,
      [MetricType.PAINT]: 1.5,
      [MetricType.COMPOSITE]: 1.5,
    };

    // Calculate weighted score
    Object.entries(metrics).forEach(([type, metric]) => {
      const metricType = type as MetricType;
      const weight = weights[metricType] || 1;

      totalScore += metric.normalized * 100 * weight;
      totalWeight += weight;
    });

    return Math.round(totalScore / totalWeight);
  }

  /**
   * Measure the number of DOM nodes
   */
  private measureDOMNodes(): number {
    if (typeof document === 'undefined' || !this.config.measureDOMNodes) {
      return 0;
    }

    return document.querySelectorAll('*').length;
  }

  /**
   * Get memory usage information
   */
  private getMemoryInfo(): { jsHeapSize: number; totalJSHeapSize: number; usedJSHeapSize: number } {
    if (typeof performance === 'undefined' || !('memory' in performance)) {
      return { jsHeapSize: 0, totalJSHeapSize: 0, usedJSHeapSize: 0 };
    }

    const memory = (performance as any).memory;

    if (!memory) {
      return { jsHeapSize: 0, totalJSHeapSize: 0, usedJSHeapSize: 0 };
    }

    return {
      jsHeapSize: Math.round(memory.jsHeapSizeLimit / (1024 * 1024)),
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / (1024 * 1024)),
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / (1024 * 1024)),
    };
  }

  /**
   * Update the current snapshot with the latest metrics
   */
  private updateSnapshot(): void {
    if (!this.active) return;

    const now = Date.now();
    const elapsedSinceReset = (now - this.lastResetTime) / 1000;
    const prevSnapshot = JSON.parse(JSON.stringify(this.currentSnapshot)) as PerformanceSnapshot;

    // Update individual metrics

    // Frame stats
    const { fps, frameTime } = this.calculateFrameStats();
    this.updateMetric(MetricType.FPS, fps);
    this.updateMetric(MetricType.FRAME_TIME, frameTime);

    // Memory info
    const memoryInfo = this.getMemoryInfo();
    this.updateMetric(MetricType.MEMORY, memoryInfo.totalJSHeapSize);
    this.updateMetric(MetricType.JS_HEAP, memoryInfo.usedJSHeapSize);

    // DOM nodes
    if (this.config.measureDOMNodes) {
      const domNodes = this.measureDOMNodes();
      this.updateMetric(MetricType.DOM_NODES, domNodes);
    }

    // Metrics from observers
    this.updateMetric(MetricType.LONG_TASKS, this.longTaskCount);
    this.updateMetric(MetricType.LAYOUT, Math.round(this.layoutCount / elapsedSinceReset));
    this.updateMetric(MetricType.PAINT, Math.round(this.paintCount / elapsedSinceReset));
    this.updateMetric(MetricType.STYLE, Math.round(this.styleCount / elapsedSinceReset));
    this.updateMetric(MetricType.NETWORK, Math.round(this.networkRequests / elapsedSinceReset));

    // Calculate overall score
    this.currentSnapshot.overallScore = this.calculateOverallScore(this.currentSnapshot.metrics);

    // Generate recommendations
    this.currentSnapshot.recommendations = this.generateRecommendations();

    // Find the bottleneck
    const bottlenecks = this.identifyBottlenecks();
    if (bottlenecks.length > 0) {
      this.currentSnapshot.detectedBottleneck = bottlenecks[0];
    }

    // Update timestamp
    this.currentSnapshot.timestamp = now;

    // Add to history
    this.history.push(JSON.parse(JSON.stringify(this.currentSnapshot)));

    // Limit history size
    if (this.history.length > this.config.historySize) {
      this.history.shift();
    }

    // Call update callback
    this.config.onUpdate(this.currentSnapshot);

    // Check if performance is poor and notify if needed
    const isPoor = this.currentSnapshot.overallScore < 60;
    if (isPoor && this.config.reportToCosole) {
      console.warn('Poor performance detected:', {
        score: this.currentSnapshot.overallScore,
        fps: this.currentSnapshot.metrics[MetricType.FPS].value,
        frameTime: this.currentSnapshot.metrics[MetricType.FRAME_TIME].value,
        recommendations: this.currentSnapshot.recommendations,
      });
    }

    // Call performance issue callback if needed
    if (isPoor && !this.isPoorPerformance(prevSnapshot)) {
      this.config.onPerformanceIssue(this.currentSnapshot);
    }

    // Reset counters periodically
    const timeSinceLastReset = now - this.lastResetTime;
    if (timeSinceLastReset > 10000) {
      // Reset every 10 seconds
      this.longTaskCount = 0;
      this.layoutCount = 0;
      this.paintCount = 0;
      this.styleCount = 0;
      this.networkRequests = 0;
      this.lastResetTime = now;
    }
  }

  /**
   * Check if the previous snapshot indicated poor performance
   */
  private isPoorPerformance(snapshot: PerformanceSnapshot): boolean {
    return snapshot.overallScore < 60;
  }

  /**
   * Update a single metric
   */
  private updateMetric(type: MetricType, value: number): void {
    const prev = this.currentSnapshot.metrics[type].value;
    const threshold = this.currentSnapshot.metrics[type].threshold;

    // Calculate delta
    const delta = value - prev;
    const deltaPercent = prev === 0 ? 0 : (delta / prev) * 100;

    // Update the metric
    this.currentSnapshot.metrics[type] = {
      ...this.currentSnapshot.metrics[type],
      value,
      delta,
      deltaPercent,
      timestamp: Date.now(),
      severity: this.getMetricSeverity(value, threshold, type),
      normalized: this.normalizeMetric(value, threshold, type),
    };
  }
}

/**
 * Create a performance monitor with default configuration
 */
export const createPerformanceMonitor = (config?: PerformanceMonitorConfig): PerformanceMonitor => {
  return new PerformanceMonitor(config);
};

/**
 * Global performance monitor instance for shared use
 */
export const globalPerformanceMonitor = createPerformanceMonitor({
  autoStart: typeof window !== 'undefined',
});
