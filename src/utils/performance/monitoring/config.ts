/**
 * Performance monitoring configuration
 * 
 * This file contains configurations for the performance monitoring system,
 * including thresholds, metrics, and monitoring options.
 */
import { PerformanceMetricThresholds, MonitoringOptions } from './types';

/**
 * Default performance metric thresholds
 * Used to determine when to trigger warnings or optimizations
 */
export const DEFAULT_METRIC_THRESHOLDS: PerformanceMetricThresholds = {
  // Frame rate thresholds in frames per second (fps)
  frameRate: {
    critical: 20,  // Below this fps, experience is very poor
    warning: 30,   // Below this fps, experience is degraded
    good: 45,      // Below this fps, experience is not optimal
    excellent: 58  // Below this fps, experience is good but not excellent
  },
  
  // Frame time thresholds in milliseconds
  frameTime: {
    critical: 50,  // Above this ms, frames are very delayed
    warning: 33,   // Above this ms, frames are noticeably delayed
    good: 22,      // Above this ms, frames are slightly delayed
    excellent: 17  // Above this ms, frames are minimally delayed
  },
  
  // Layout thrashing thresholds (layout reads followed by writes causing reflow)
  layoutThrashing: {
    critical: 5,   // Per frame, severe performance impact
    warning: 3,    // Per frame, noticeable performance impact
    good: 1,       // Per frame, minimal performance impact
    excellent: 0   // No layout thrashing
  },
  
  // Memory usage thresholds in MB (approximate heap size)
  memoryUsage: {
    critical: 150,  // MB, very high memory usage for animations
    warning: 100,   // MB, high memory usage
    good: 60,       // MB, moderate memory usage
    excellent: 30   // MB, efficient memory usage
  },
  
  // Animation complexity thresholds (complex properties being animated)
  animationComplexity: {
    critical: 8,    // Many complex properties animated at once
    warning: 5,     // Several complex properties animated at once
    good: 3,        // Few complex properties animated at once
    excellent: 1    // Only simple properties or optimized complex ones
  },
  
  // Long task thresholds in milliseconds
  longTask: {
    critical: 200,  // Tasks blocking the main thread severely
    warning: 100,   // Tasks noticeably blocking the main thread
    good: 50,       // Tasks slightly blocking the main thread
    excellent: 16   // Tasks are non-blocking or minimal impact
  },
  
  // DOM mutations per frame
  domMutations: {
    critical: 20,   // Excessive DOM changes per frame
    warning: 10,    // Many DOM changes per frame
    good: 5,        // Moderate DOM changes per frame
    excellent: 2    // Few DOM changes per frame
  },
  
  // Number of concurrent animations
  concurrentAnimations: {
    critical: 15,   // Too many animations running at once
    warning: 10,    // Many animations running at once
    good: 5,        // Moderate number of animations
    excellent: 3    // Few concurrent animations
  }
};

/**
 * Default monitoring options 
 */
export const DEFAULT_MONITORING_OPTIONS: MonitoringOptions = {
  // Whether to enable monitoring
  enabled: true,
  
  // Monitor frame rate
  frameRate: true,
  
  // Monitor memory usage 
  memoryUsage: true,
  
  // Monitor layout thrashing
  layoutThrashing: true,
  
  // Monitor animation complexity
  animationComplexity: true,
  
  // Monitor long tasks
  longTasks: true,
  
  // Whether to automatically apply optimizations
  autoOptimize: true,
  
  // Sampling rate (1 = monitor every frame, 2 = every other frame, etc.)
  samplingRate: 2,
  
  // Whether to log warnings to console
  logWarnings: true,
  
  // Whether to collect performance timelines for later analysis
  collectTimelines: true,
  
  // Maximum timeline length in frames
  maxTimelineLength: 300,
  
  // Monitoring detail level: 'basic', 'standard', or 'detailed'
  detailLevel: 'standard',
  
  // Whether to map performance issues to components
  mapToComponents: true,
  
  // How many frames of low performance to tolerate before taking action
  lowPerformanceThreshold: 5,
  
  // Whether to track resource consumption (images, etc.)
  trackResources: true,
  
  // Whether to monitor intersection with viewport
  trackVisibility: true,
  
  // Whether to collect metrics for analytics
  analyticsCollection: false,
  
  // Refresh interval for memory usage tracking in ms
  memoryRefreshInterval: 2000,
  
  // Whether to use the Performance API
  usePerformanceAPI: true,
  
  // Whether to track Web Animations API usage
  trackWAAPI: true,
  
  // Whether to track requestAnimationFrame usage
  trackRAF: true,
  
  // Device type specific adjustments
  deviceAdjustments: true
};

/**
 * Performance tier specifications based on device capabilities
 */
export const PERFORMANCE_TIERS = {
  // Ultra high-end devices (high-end desktops, gaming laptops)
  ULTRA: {
    frameRateTarget: 60,
    animationComplexityLimit: 10,
    concurrentAnimationsLimit: 20,
    memoryLimit: 150,
    gpuAccelerationLevel: 'maximum'
  },
  
  // High-end devices (modern phones, laptops)
  HIGH: {
    frameRateTarget: 60,
    animationComplexityLimit: 7,
    concurrentAnimationsLimit: 12,
    memoryLimit: 100,
    gpuAccelerationLevel: 'high'
  },
  
  // Medium devices (older laptops, mid-range phones)
  MEDIUM: {
    frameRateTarget: 45,
    animationComplexityLimit: 4,
    concurrentAnimationsLimit: 8,
    memoryLimit: 60,
    gpuAccelerationLevel: 'medium'
  },
  
  // Low-end devices (older phones, low-spec devices)
  LOW: {
    frameRateTarget: 30,
    animationComplexityLimit: 2,
    concurrentAnimationsLimit: 4,
    memoryLimit: 40,
    gpuAccelerationLevel: 'minimal'
  },
  
  // Minimal experience (very old devices)
  MINIMAL: {
    frameRateTarget: 24,
    animationComplexityLimit: 1,
    concurrentAnimationsLimit: 2,
    memoryLimit: 20,
    gpuAccelerationLevel: 'none'
  }
};

/**
 * Animation properties categorized by performance impact
 */
export const ANIMATION_PROPERTY_IMPACT = {
  // Properties that often trigger layout/reflow (expensive)
  high: [
    'width', 'height', 'top', 'right', 'bottom', 'left',
    'margin', 'padding', 'border-width', 'font-size',
    'position', 'display', 'float', 'overflow',
    'min-height', 'max-width', 'margin-top', 'padding-left'
  ],
  
  // Properties that sometimes trigger layout (medium cost)
  medium: [
    'border-radius', 'box-shadow', 'text-shadow',
    'filter', 'backdrop-filter', 'background-image',
    'background-position', 'background-size',
    'text-decoration', 'font-weight'
  ],
  
  // Properties optimized for animation (low cost)
  low: [
    'transform', 'opacity', 'color', 'background-color',
    'border-color', 'outline-color', 'visibility',
    'z-index', 'pointer-events'
  ]
};

/**
 * Optimization strategy priorities
 */
export const OPTIMIZATION_PRIORITIES = {
  // Critical optimizations - always apply
  CRITICAL: 100,
  
  // High priority - apply unless user explicitly disabled
  HIGH: 75,
  
  // Medium priority - apply on medium/low devices
  MEDIUM: 50,
  
  // Low priority - only apply on low-end devices
  LOW: 25,
  
  // Minimal - only apply in emergency low performance situations
  MINIMAL: 10
};

/**
 * Performance monitoring flags
 */
export const MONITORING_FLAGS = {
  // Whether the monitor is currently active
  isActive: false,
  
  // Whether we're currently in a low performance state
  isLowPerformance: false,
  
  // Whether we should take drastic actions to improve performance
  emergencyOptimizationsActive: false,
  
  // Number of consecutive problematic frames
  problematicFrameCount: 0,
  
  // Most recent performance score
  lastPerformanceScore: 100
};

// Export default configurations
export default {
  thresholds: DEFAULT_METRIC_THRESHOLDS,
  options: DEFAULT_MONITORING_OPTIONS,
  tiers: PERFORMANCE_TIERS,
  propertyImpact: ANIMATION_PROPERTY_IMPACT,
  optimizationPriorities: OPTIMIZATION_PRIORITIES,
  flags: MONITORING_FLAGS
};