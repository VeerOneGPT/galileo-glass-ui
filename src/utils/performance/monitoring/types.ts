/**
 * Performance Monitoring System - Type Definitions
 * 
 * Type definitions for the automatic performance monitoring system
 */

/**
 * Severity level for performance issues
 */
export enum PerformanceSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

/**
 * Performance issue categories
 */
export enum PerformanceCategory {
  FPS = 'fps',
  MEMORY = 'memory',
  RENDERING = 'rendering',
  LAYOUT = 'layout',
  SCRIPT = 'script',
  NETWORK = 'network',
  RESOURCE = 'resource',
  ANIMATION = 'animation',
  INPUT = 'input',
  GENERAL = 'general'
}

/**
 * Performance issue description
 */
export interface PerformanceIssue {
  /** Unique identifier for the issue */
  id: string;
  
  /** Human-readable description of the issue */
  description: string;
  
  /** Severity level of the issue */
  severity: PerformanceSeverity;
  
  /** Category of the issue */
  category: PerformanceCategory;
  
  /** Element selector or component name if applicable */
  target?: string;
  
  /** When the issue was detected */
  timestamp: Date;
  
  /** Current performance value that triggered the issue */
  value?: number;
  
  /** Threshold that was crossed */
  threshold?: number;
  
  /** Metric unit (e.g., 'ms', 'fps', 'MB') */
  unit?: string;
  
  /** Recommended solution */
  recommendation?: string;
  
  /** Whether the issue is resolved */
  resolved?: boolean;
  
  /** When the issue was resolved, if applicable */
  resolvedAt?: Date;
}

/**
 * Frame rate measurement
 */
export interface FrameRateMetric {
  /** Average FPS over the measurement period */
  averageFps: number;
  
  /** Lowest FPS in the measurement period */
  minFps: number;
  
  /** Highest FPS in the measurement period */
  maxFps: number;
  
  /** Standard deviation of FPS (stability indicator) */
  fpsStandardDeviation: number;
  
  /** Number of frames dropped */
  droppedFrames: number;
  
  /** Percentage of frames that were dropped */
  droppedFramesPercentage: number;
  
  /** Duration of the measurement period in milliseconds */
  duration: number;
  
  /** When the measurement was taken */
  timestamp: Date;
}

/**
 * Layout metrics
 */
export interface LayoutMetrics {
  /** Number of layout recalculations */
  layoutCount: number;
  
  /** Number of style recalculations */
  styleCount: number;
  
  /** Time spent in layout operations (ms) */
  layoutDuration: number;
  
  /** Time spent in style operations (ms) */
  styleDuration: number;
  
  /** Number of forced reflows */
  forcedReflows: number;
  
  /** Duration of the measurement period in milliseconds */
  duration: number;
  
  /** When the measurement was taken */
  timestamp: Date;
}

/**
 * Memory metrics
 */
export interface MemoryMetrics {
  /** Total JavaScript heap size (bytes) */
  totalJSHeapSize?: number;
  
  /** Used JavaScript heap size (bytes) */
  usedJSHeapSize?: number;
  
  /** JavaScript heap size limit (bytes) */
  jsHeapSizeLimit?: number;
  
  /** DOM node count */
  domNodeCount: number;
  
  /** Whether garbage collection occurred during the measurement */
  gcOccurred?: boolean;
  
  /** Duration of the measurement period in milliseconds */
  duration: number;
  
  /** When the measurement was taken */
  timestamp: Date;
}

/**
 * Resource timing metrics
 */
export interface ResourceMetrics {
  /** Number of resources loaded */
  resourceCount: number;
  
  /** Total resource size (bytes) */
  totalResourceSize: number;
  
  /** Time spent loading resources (ms) */
  resourceLoadTime: number;
  
  /** Resources by type (images, scripts, styles, etc.) */
  resourcesByType: Record<string, number>;
  
  /** Duration of the measurement period in milliseconds */
  duration: number;
  
  /** When the measurement was taken */
  timestamp: Date;
}

/**
 * Interaction metrics
 */
export interface InteractionMetrics {
  /** First input delay (ms) */
  firstInputDelay?: number;
  
  /** Interaction to next paint (ms) */
  interactionToNextPaint?: number;
  
  /** Cumulative layout shift score */
  cumulativeLayoutShift?: number;
  
  /** Input events processed */
  inputEventCount: number;
  
  /** Animation frames processed */
  animationFrameCount: number;
  
  /** Duration of the measurement period in milliseconds */
  duration: number;
  
  /** When the measurement was taken */
  timestamp: Date;
}

/**
 * Performance timer data
 */
export interface PerformanceTimerData {
  /** Name of the timer */
  name: string;
  
  /** Duration in milliseconds */
  duration: number;
  
  /** When the timer was started */
  startTime: Date;
  
  /** When the timer was stopped */
  endTime: Date;
  
  /** Category of the timer */
  category?: PerformanceCategory;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Scope of performance monitoring
 */
export enum MonitoringScope {
  GLOBAL = 'global',
  COMPONENT = 'component',
  ANIMATION = 'animation',
  ROUTE = 'route',
  CUSTOM = 'custom'
}

/**
 * Performance snapshot containing all metrics
 */
export interface PerformanceSnapshot {
  /** Unique identifier for the snapshot */
  id: string;
  
  /** When the snapshot was taken */
  timestamp: Date;
  
  /** Frame rate metrics */
  frameRate?: FrameRateMetric;
  
  /** Layout metrics */
  layout?: LayoutMetrics;
  
  /** Memory metrics */
  memory?: MemoryMetrics;
  
  /** Resource metrics */
  resources?: ResourceMetrics;
  
  /** Interaction metrics */
  interaction?: InteractionMetrics;
  
  /** Custom timers */
  timers?: PerformanceTimerData[];
  
  /** Performance issues detected */
  issues?: PerformanceIssue[];
  
  /** Scope of the monitoring */
  scope: MonitoringScope;
  
  /** Target of the monitoring (e.g., component name, route path) */
  target?: string;
  
  /** Overall performance score (0-100) */
  score?: number;
}

/**
 * Configuration for performance monitoring
 */
export interface PerformanceMonitoringConfig {
  /** Whether monitoring is enabled */
  enabled: boolean;
  
  /** Monitoring interval in milliseconds */
  monitoringInterval: number;
  
  /** Max snapshots to keep in history */
  maxSnapshots: number;
  
  /** Whether to enable detailed logging */
  verbose: boolean;
  
  /** Whether to automatically detect and report issues */
  autoDetectIssues: boolean;
  
  /** Threshold for FPS to trigger a warning (FPS below this value) */
  fpsWarningThreshold: number;
  
  /** Threshold for FPS to trigger an error (FPS below this value) */
  fpsErrorThreshold: number;
  
  /** Threshold for memory usage percentage to trigger a warning */
  memoryWarningThreshold: number;
  
  /** Threshold for layout operations count to trigger a warning */
  layoutOperationsWarningThreshold: number;
  
  /** Threshold for ANR (Application Not Responding) in milliseconds */
  anrThreshold: number;
  
  /** Categories to monitor */
  enabledCategories: PerformanceCategory[];
  
  /** Minimum severity level to report */
  minimumSeverity: PerformanceSeverity;
  
  /** Whether to enable monitoring in production */
  enableInProduction: boolean;
}

/**
 * Default configuration for performance monitoring
 */
export const DEFAULT_MONITORING_CONFIG: PerformanceMonitoringConfig = {
  enabled: true,
  monitoringInterval: 1000, // 1 second
  maxSnapshots: 100,
  verbose: false,
  autoDetectIssues: true,
  fpsWarningThreshold: 30,
  fpsErrorThreshold: 15,
  memoryWarningThreshold: 80, // 80% of available memory
  layoutOperationsWarningThreshold: 30, // 30 layout operations per second
  anrThreshold: 100, // 100ms
  enabledCategories: [
    PerformanceCategory.FPS,
    PerformanceCategory.MEMORY,
    PerformanceCategory.LAYOUT,
    PerformanceCategory.ANIMATION
  ],
  minimumSeverity: PerformanceSeverity.MEDIUM,
  enableInProduction: false
};