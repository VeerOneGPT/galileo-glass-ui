/**
 * Performance monitoring and automatic quality adjustment system
 * 
 * Tracks animation performance metrics and automatically adjusts
 * quality settings to maintain smooth performance.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { QualityTier } from './types';
import { useQualityTier } from './useQualityTier';
import { PhysicsSettings } from './physicsSettings';

/**
 * Performance metric types that can be monitored
 */
export enum PerformanceMetricType {
  /** Frames per second */
  FPS = 'fps',
  
  /** Frame time in milliseconds */
  FRAME_TIME = 'frameTime',
  
  /** JavaScript execution time */
  JS_TIME = 'jsTime',
  
  /** Layout and style recalculation time */
  LAYOUT_TIME = 'layoutTime',
  
  /** Paint time */
  PAINT_TIME = 'paintTime',
  
  /** Combined total frame processing time */
  TOTAL_TIME = 'totalTime',
  
  /** Memory usage */
  MEMORY = 'memory'
}

/**
 * Performance sample data point
 */
export interface PerformanceSample {
  /** Timestamp of the sample */
  timestamp: number;
  
  /** Metrics collected in this sample */
  metrics: Partial<Record<PerformanceMetricType, number>>;
}

/**
 * Quality adjustment options
 */
export interface QualityAdjustmentOptions {
  /** Whether to enable automatic quality adjustment */
  enabled?: boolean;
  
  /** Target FPS to maintain */
  targetFps?: number;
  
  /** FPS threshold below which quality will be reduced */
  minFpsThreshold?: number;
  
  /** Duration in ms that FPS must be below threshold before quality reduction */
  downgradeCooldown?: number;
  
  /** Duration in ms that FPS must be above target before quality upgrade */
  upgradeCooldown?: number;
  
  /** Sample size for moving average calculations */
  sampleSize?: number;
  
  /** Interval between samples in ms */
  sampleInterval?: number;
  
  /** Whether to adjust quality tier */
  adjustQualityTier?: boolean;
  
  /** Whether to collect detailed metrics (may affect performance) */
  collectDetailedMetrics?: boolean;
}

/** Default quality adjustment options */
const DEFAULT_OPTIONS: QualityAdjustmentOptions = {
  enabled: true,
  targetFps: 60,
  minFpsThreshold: 45,
  downgradeCooldown: 2000,
  upgradeCooldown: 10000,
  sampleSize: 20,
  sampleInterval: 500,
  adjustQualityTier: true,
  collectDetailedMetrics: false
};

/**
 * Hook to monitor performance and automatically adjust quality
 */
export function usePerformanceMonitor(options: QualityAdjustmentOptions = {}) {
  // Merge options with defaults
  const config: QualityAdjustmentOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  // Get quality tier control functions
  const { 
    qualityTier, 
    setQualityPreference, 
    featureFlags,
    autoAdjusted,
    startPerformanceMonitoring,
    stopPerformanceMonitoring 
  } = useQualityTier();
  
  // State for performance monitoring
  const [isEnabled, setIsEnabled] = useState(config.enabled);
  const [samples, setSamples] = useState<PerformanceSample[]>([]);
  const [averageMetrics, setAverageMetrics] = useState<Partial<Record<PerformanceMetricType, number>>>({});
  const [isPerformanceIssue, setIsPerformanceIssue] = useState(false);
  const [lastAdjustmentTime, setLastAdjustmentTime] = useState(0);
  const [consecutiveLowFpsFrames, setConsecutiveLowFpsFrames] = useState(0);
  const [consecutiveHighFpsFrames, setConsecutiveHighFpsFrames] = useState(0);
  
  // Use refs for values needed in animation frame callback
  const frameTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastSampleTimeRef = useRef(0);
  const isMonitoringRef = useRef(false);
  
  // For detailed metrics
  const detailedMetricsRef = useRef<{
    jsStartTime: number;
    jsEndTime: number;
    layoutStartTime: number;
    layoutEndTime: number;
    paintStartTime: number;
    paintEndTime: number;
  }>({
    jsStartTime: 0,
    jsEndTime: 0,
    layoutStartTime: 0,
    layoutEndTime: 0,
    paintStartTime: 0,
    paintEndTime: 0
  });
  
  /**
   * Start performance monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoringRef.current) return;
    
    isMonitoringRef.current = true;
    lastFrameTimeRef.current = performance.now();
    frameCountRef.current = 0;
    lastSampleTimeRef.current = performance.now();
    
    // Start frame monitoring
    const monitorFrame = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      
      // Skip the first frame as it might have initialization overhead
      if (frameCountRef.current > 0) {
        frameTimeRef.current = frameTime;
        
        // Check if we need to take a sample
        if (now - lastSampleTimeRef.current >= (config.sampleInterval || 500)) {
          takeSample();
          lastSampleTimeRef.current = now;
        }
      }
      
      frameCountRef.current++;
      animationFrameIdRef.current = requestAnimationFrame(monitorFrame);
    };
    
    // Start the monitoring
    animationFrameIdRef.current = requestAnimationFrame(monitorFrame);
    
    // Also enable quality tier performance monitoring
    startPerformanceMonitoring();
  }, [config.sampleInterval, startPerformanceMonitoring]);
  
  /**
   * Stop performance monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoringRef.current) return;
    
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    isMonitoringRef.current = false;
    
    // Also disable quality tier performance monitoring
    stopPerformanceMonitoring();
  }, [stopPerformanceMonitoring]);
  
  /**
   * Take a performance sample
   */
  const takeSample = useCallback(() => {
    const now = performance.now();
    
    // Calculate FPS from frame time
    const fps = frameTimeRef.current > 0 
      ? Math.min(1000 / frameTimeRef.current, 120) // Cap at 120fps
      : 60; // Default if no frame time data yet
    
    const sample: PerformanceSample = {
      timestamp: now,
      metrics: {
        [PerformanceMetricType.FPS]: fps,
        [PerformanceMetricType.FRAME_TIME]: frameTimeRef.current
      }
    };
    
    // Add detailed metrics if enabled
    if (config.collectDetailedMetrics) {
      const metrics = detailedMetricsRef.current;
      
      sample.metrics[PerformanceMetricType.JS_TIME] = metrics.jsEndTime - metrics.jsStartTime;
      sample.metrics[PerformanceMetricType.LAYOUT_TIME] = metrics.layoutEndTime - metrics.layoutStartTime;
      sample.metrics[PerformanceMetricType.PAINT_TIME] = metrics.paintEndTime - metrics.paintStartTime;
      sample.metrics[PerformanceMetricType.TOTAL_TIME] = 
        (metrics.jsEndTime - metrics.jsStartTime) + 
        (metrics.layoutEndTime - metrics.layoutStartTime) + 
        (metrics.paintEndTime - metrics.paintStartTime);
      
      // Get memory usage if available (Note: performance.memory is non-standard and deprecated)
      const memoryUsage = null; // Removed performance.memory usage
    }
    
    // Add to samples, keeping only the most recent samples
    setSamples(prevSamples => {
      const newSamples = [...prevSamples, sample].slice(-(config.sampleSize || 20));
      
      // Calculate average metrics
      const averages: Partial<Record<PerformanceMetricType, number>> = {};
      
      // For each metric type
      Object.values(PerformanceMetricType).forEach(metricType => {
        // Get all samples with this metric
        const metricSamples = newSamples
          .filter(s => s.metrics[metricType] !== undefined)
          .map(s => s.metrics[metricType] as number);
        
        if (metricSamples.length > 0) {
          // Calculate average
          const sum = metricSamples.reduce((total, value) => total + value, 0);
          averages[metricType] = sum / metricSamples.length;
        }
      });
      
      // Set average metrics
      setAverageMetrics(averages);
      
      // Check for performance issues
      const avgFps = averages[PerformanceMetricType.FPS];
      if (avgFps !== undefined) {
        checkPerformance(avgFps);
      }
      
      return newSamples;
    });
  }, [config.collectDetailedMetrics, config.sampleSize]);
  
  /**
   * Check performance against thresholds and adjust if needed
   */
  const checkPerformance = useCallback((currentFps: number) => {
    const targetFps = config.targetFps || 60;
    const minFps = config.minFpsThreshold || 45;
    const now = performance.now();
    
    if (currentFps < minFps) {
      // Track consecutive low FPS frames
      setConsecutiveLowFpsFrames(prev => prev + 1);
      setConsecutiveHighFpsFrames(0);
      
      // Check if we need to reduce quality
      const downgradeCooldown = config.downgradeCooldown || 2000;
      const timeSinceLastAdjustment = now - lastAdjustmentTime;
      
      if (
        consecutiveLowFpsFrames > 3 && 
        timeSinceLastAdjustment > downgradeCooldown &&
        config.adjustQualityTier
      ) {
        // Downgrade quality tier
        downgradeQuality();
        setLastAdjustmentTime(now);
        setConsecutiveLowFpsFrames(0);
      }
      
      setIsPerformanceIssue(true);
    } else if (currentFps >= targetFps) {
      // Track consecutive high FPS frames
      setConsecutiveHighFpsFrames(prev => prev + 1);
      setConsecutiveLowFpsFrames(0);
      
      // Check if we can increase quality
      const upgradeCooldown = config.upgradeCooldown || 10000;
      const timeSinceLastAdjustment = now - lastAdjustmentTime;
      
      if (
        consecutiveHighFpsFrames > 20 && 
        timeSinceLastAdjustment > upgradeCooldown &&
        config.adjustQualityTier &&
        autoAdjusted // Only upgrade if we previously auto-adjusted
      ) {
        // Upgrade quality tier
        upgradeQuality();
        setLastAdjustmentTime(now);
        setConsecutiveHighFpsFrames(0);
      }
      
      setIsPerformanceIssue(false);
    } else {
      // Reset counters for middle range FPS
      setConsecutiveLowFpsFrames(0);
      setConsecutiveHighFpsFrames(0);
    }
  }, [
    config.targetFps, 
    config.minFpsThreshold,
    config.downgradeCooldown,
    config.upgradeCooldown,
    config.adjustQualityTier,
    lastAdjustmentTime,
    consecutiveLowFpsFrames,
    consecutiveHighFpsFrames,
    autoAdjusted
  ]);
  
  /**
   * Downgrade quality tier
   */
  const downgradeQuality = useCallback(() => {
    const tiers = [
      QualityTier.ULTRA,
      QualityTier.HIGH,
      QualityTier.MEDIUM,
      QualityTier.LOW,
      QualityTier.MINIMAL
    ];
    
    const currentIndex = tiers.indexOf(qualityTier);
    
    if (currentIndex < tiers.length - 1) {
      // Move down one tier
      setQualityPreference(tiers[currentIndex + 1]);
    }
  }, [qualityTier, setQualityPreference]);
  
  /**
   * Upgrade quality tier
   */
  const upgradeQuality = useCallback(() => {
    const tiers = [
      QualityTier.ULTRA,
      QualityTier.HIGH,
      QualityTier.MEDIUM,
      QualityTier.LOW,
      QualityTier.MINIMAL
    ];
    
    const currentIndex = tiers.indexOf(qualityTier);
    
    if (currentIndex > 0) {
      // Move up one tier
      setQualityPreference(tiers[currentIndex - 1]);
    }
  }, [qualityTier, setQualityPreference]);
  
  /**
   * Enable performance monitoring and quality adjustment
   */
  const enable = useCallback(() => {
    setIsEnabled(true);
    startMonitoring();
  }, [startMonitoring]);
  
  /**
   * Disable performance monitoring and quality adjustment
   */
  const disable = useCallback(() => {
    setIsEnabled(false);
    stopMonitoring();
  }, [stopMonitoring]);
  
  // Start/stop monitoring when enabled state changes
  useEffect(() => {
    if (isEnabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [isEnabled, startMonitoring, stopMonitoring]);
  
  return {
    /** Whether performance monitoring is enabled */
    isEnabled,
    
    /** Enable performance monitoring */
    enable,
    
    /** Disable performance monitoring */
    disable,
    
    /** Performance samples */
    samples,
    
    /** Average performance metrics */
    averageMetrics,
    
    /** Current FPS */
    fps: averageMetrics[PerformanceMetricType.FPS] || 60,
    
    /** Whether there's a performance issue */
    isPerformanceIssue,
    
    /** Current quality tier (after auto-adjustments) */
    qualityTier,
    
    /** Current feature flags based on quality */
    featureFlags
  };
}

export default usePerformanceMonitor; 