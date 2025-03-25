/**
 * useGlassPerformance Hook
 * 
 * A hook for monitoring and optimizing the performance of glass UI effects
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../utils/deviceCapabilities';

/**
 * Performance metrics collected by the hook
 */
export interface GlassPerformanceMetrics {
  /**
   * Frames per second
   */
  fps: number;
  
  /**
   * Frame timing in milliseconds
   */
  frameTiming: number;
  
  /**
   * Count of Recalculate Style operations triggered
   */
  recalculateStyleCount: number;
  
  /**
   * Count of Layout operations triggered
   */
  layoutCount: number;
  
  /**
   * Time spent on style calculation in milliseconds
   */
  styleCalculationTime: number;
  
  /**
   * Jank score (higher means more stuttering)
   */
  jankScore: number;
  
  /**
   * Indicates if the UI is currently performing poorly
   */
  isPoorPerformance: boolean;
  
  /**
   * Detected capability tier of the device
   */
  deviceCapabilityTier: DeviceCapabilityTier;
  
  /**
   * Indicates if the UI is currently throttled
   */
  isThrottled: boolean;
  
  /**
   * Timestamp of last update
   */
  lastUpdated: number;
}

/**
 * Default performance thresholds for different metrics
 */
export interface PerformanceThresholds {
  /**
   * Minimum acceptable FPS
   */
  minFps: number;
  
  /**
   * Maximum acceptable frame timing in ms
   */
  maxFrameTiming: number;
  
  /**
   * Maximum acceptable style recalculations per second
   */
  maxRecalculateStyleCountPerSecond: number;
  
  /**
   * Maximum acceptable layout operations per second
   */
  maxLayoutCountPerSecond: number;
  
  /**
   * Maximum acceptable jank score
   */
  maxJankScore: number;
}

/**
 * Default performance thresholds
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFps: 45,
  maxFrameTiming: 22, // ~45 fps
  maxRecalculateStyleCountPerSecond: 200,
  maxLayoutCountPerSecond: 30,
  maxJankScore: 5
};

/**
 * Configuration options for useGlassPerformance
 */
export interface GlassPerformanceOptions {
  /**
   * Whether to enable monitoring
   */
  enabled?: boolean;
  
  /**
   * How frequently to update metrics in milliseconds
   */
  updateInterval?: number;
  
  /**
   * Custom performance thresholds
   */
  thresholds?: Partial<PerformanceThresholds>;
  
  /**
   * Whether to attempt automatic optimizations
   */
  autoOptimize?: boolean;
  
  /**
   * Whether to log performance issues to console
   */
  logPerformanceIssues?: boolean;
  
  /**
   * The element to monitor (defaults to document.body)
   */
  targetElement?: HTMLElement | null;
  
  /**
   * Custom identifier for this monitoring instance
   */
  id?: string;
}

/**
 * Stores performance data history
 */
interface PerformanceHistory {
  fpsHistory: number[];
  frameTimingHistory: number[];
  styleCalcHistory: number[];
  layoutHistory: number[];
  jankHistory: number[];
  timestamps: number[];
}

/**
 * Default metrics when monitoring is not active
 */
const DEFAULT_METRICS: GlassPerformanceMetrics = {
  fps: 60,
  frameTiming: 16.67,
  recalculateStyleCount: 0,
  layoutCount: 0,
  styleCalculationTime: 0,
  jankScore: 0,
  isPoorPerformance: false,
  deviceCapabilityTier: DeviceCapabilityTier.MEDIUM,
  isThrottled: false,
  lastUpdated: 0
};

/**
 * Calculate FPS from frame time
 */
const calculateFPS = (frameTime: number): number => {
  return Math.round(1000 / Math.max(frameTime, 1));
};

/**
 * Calculate jank score based on frame timing stability
 */
const calculateJankScore = (frameTimings: number[]): number => {
  if (frameTimings.length < 10) return 0;
  
  // Get last 10 timings
  const recentTimings = frameTimings.slice(-10);
  
  // Calculate variance in frame times
  const average = recentTimings.reduce((sum, val) => sum + val, 0) / recentTimings.length;
  const squaredDifferences = recentTimings.map(val => Math.pow(val - average, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / squaredDifferences.length;
  
  // Calculate jank score (normalized against 16.67ms target)
  const normalizedVariance = variance / (16.67 * 16.67);
  const baseJank = Math.sqrt(normalizedVariance) * 10;
  
  // Penalize long frames
  const longFrameCount = recentTimings.filter(t => t > 33.33).length;
  const longFramePenalty = longFrameCount * 2;
  
  // Combine scores
  return Math.min(Math.round(baseJank + longFramePenalty), 10);
};

/**
 * Use the Performance Observer API to capture layout and style metrics
 */
const usePerformanceObserver = (
  enabled: boolean,
  onMetrics: (recalculateStyleCount: number, layoutCount: number, styleTime: number) => void
) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }
    
    let recalculateStyleCount = 0;
    let layoutCount = 0;
    let styleCalculationTime = 0;
    
    // Create observers for different entry types
    try {
      const layoutObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift') {
            layoutCount++;
          }
        });
        
        onMetrics(recalculateStyleCount, layoutCount, styleCalculationTime);
      });
      
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.name === 'style-recalculation') {
            recalculateStyleCount++;
            styleCalculationTime += entry.duration || 0;
          }
        });
        
        onMetrics(recalculateStyleCount, layoutCount, styleCalculationTime);
      });
      
      // Observe relevant performance events
      layoutObserver.observe({ type: 'layout-shift', buffered: true });
      
      if ('layout' in PerformanceObserver.supportedEntryTypes) {
        paintObserver.observe({ entryTypes: ['layout'], buffered: true });
      }
      
      // Reset counts periodically to measure per-second metrics
      const resetInterval = setInterval(() => {
        recalculateStyleCount = 0;
        layoutCount = 0;
        styleCalculationTime = 0;
      }, 1000);
      
      // Clean up
      return () => {
        layoutObserver.disconnect();
        paintObserver.disconnect();
        clearInterval(resetInterval);
      };
    } catch (err) {
      console.warn('Performance observer not supported:', err);
      return;
    }
  }, [enabled, onMetrics]);
};

/**
 * Hook for monitoring glass UI performance
 */
export const useGlassPerformance = (options: GlassPerformanceOptions = {}) => {
  const {
    enabled = true,
    updateInterval = 1000,
    thresholds = DEFAULT_THRESHOLDS,
    autoOptimize = true,
    logPerformanceIssues = false,
    targetElement = null,
    id = 'glass-ui'
  } = options;
  
  // Merge with default thresholds
  const mergedThresholds: PerformanceThresholds = {
    ...DEFAULT_THRESHOLDS,
    ...thresholds
  };
  
  // State for performance metrics
  const [metrics, setMetrics] = useState<GlassPerformanceMetrics>(DEFAULT_METRICS);
  
  // State for optimization level (0=none, 1=light, 2=medium, 3=aggressive)
  const [optimizationLevel, setOptimizationLevel] = useState<number>(0);
  
  // Refs for tracking frame timing
  const lastFrameTime = useRef<number>(0);
  const frameTimings = useRef<number[]>([]);
  const animationFrameId = useRef<number | null>(null);
  
  // Refs for performance history
  const history = useRef<PerformanceHistory>({
    fpsHistory: [],
    frameTimingHistory: [],
    styleCalcHistory: [],
    layoutHistory: [],
    jankHistory: [],
    timestamps: []
  });
  
  // Refs for observer metrics
  const observerMetrics = useRef({
    recalculateStyleCount: 0,
    layoutCount: 0,
    styleCalculationTime: 0
  });
  
  // Track whether performance is currently poor
  const isPoorPerformance = useRef<boolean>(false);
  
  // Update observer metrics
  const handleObserverMetrics = useCallback((
    recalculateStyleCount: number,
    layoutCount: number,
    styleTime: number
  ) => {
    observerMetrics.current = {
      recalculateStyleCount,
      layoutCount,
      styleCalculationTime: styleTime
    };
  }, []);
  
  // Setup performance observer
  usePerformanceObserver(enabled, handleObserverMetrics);
  
  // Measure frame timing
  const measureFrameTiming = useCallback(() => {
    if (!enabled) return;
    
    const now = performance.now();
    
    if (lastFrameTime.current > 0) {
      const frameTiming = now - lastFrameTime.current;
      frameTimings.current.push(frameTiming);
      
      // Keep frame history limited to 60 frames
      if (frameTimings.current.length > 60) {
        frameTimings.current.shift();
      }
    }
    
    lastFrameTime.current = now;
    animationFrameId.current = requestAnimationFrame(measureFrameTiming);
  }, [enabled]);
  
  // Calculate current metrics
  const calculateMetrics = useCallback(() => {
    if (!enabled || frameTimings.current.length === 0) {
      return DEFAULT_METRICS;
    }
    
    // Calculate average frame timing from the last 30 frames
    const recentFrames = frameTimings.current.slice(-30);
    const avgFrameTiming = recentFrames.reduce((sum, time) => sum + time, 0) / recentFrames.length;
    
    // Calculate FPS from average frame timing
    const fps = calculateFPS(avgFrameTiming);
    
    // Calculate jank score
    const jankScore = calculateJankScore(frameTimings.current);
    
    // Get observer metrics
    const {
      recalculateStyleCount,
      layoutCount,
      styleCalculationTime
    } = observerMetrics.current;
    
    // Check if performance is poor based on thresholds
    const newIsPoorPerformance = 
      fps < mergedThresholds.minFps ||
      avgFrameTiming > mergedThresholds.maxFrameTiming ||
      jankScore > mergedThresholds.maxJankScore;
    
    // Update poor performance ref
    isPoorPerformance.current = newIsPoorPerformance;
    
    // Log performance issues if enabled
    if (logPerformanceIssues && newIsPoorPerformance) {
      console.warn(`[Glass UI Performance] Poor performance detected in ${id}:`, {
        fps,
        frameTiming: avgFrameTiming,
        jankScore,
        recalculateStyleCount,
        layoutCount,
        styleCalculationTime
      });
    }
    
    // Check if device is being throttled
    const isThrottled = avgFrameTiming > 20 && fps < 40 && frameTimings.current.some(t => t > 50);
    
    // Detect device capability tier
    const deviceCapabilityTier = getDeviceCapabilityTier();
    
    return {
      fps,
      frameTiming: avgFrameTiming,
      recalculateStyleCount,
      layoutCount,
      styleCalculationTime,
      jankScore,
      isPoorPerformance: newIsPoorPerformance,
      deviceCapabilityTier,
      isThrottled,
      lastUpdated: Date.now()
    };
  }, [enabled, id, logPerformanceIssues, mergedThresholds]);
  
  // Update metrics periodically
  useEffect(() => {
    if (!enabled) return;
    
    // Start measuring frame timing
    measureFrameTiming();
    
    // Update metrics at the specified interval
    const intervalId = setInterval(() => {
      const newMetrics = calculateMetrics();
      setMetrics(newMetrics);
      
      // Update history
      history.current.fpsHistory.push(newMetrics.fps);
      history.current.frameTimingHistory.push(newMetrics.frameTiming);
      history.current.styleCalcHistory.push(newMetrics.recalculateStyleCount);
      history.current.layoutHistory.push(newMetrics.layoutCount);
      history.current.jankHistory.push(newMetrics.jankScore);
      history.current.timestamps.push(Date.now());
      
      // Keep history limited to 60 data points
      if (history.current.timestamps.length > 60) {
        history.current.fpsHistory.shift();
        history.current.frameTimingHistory.shift();
        history.current.styleCalcHistory.shift();
        history.current.layoutHistory.shift();
        history.current.jankHistory.shift();
        history.current.timestamps.shift();
      }
      
      // Auto-optimize if enabled and performance is poor
      if (autoOptimize && newMetrics.isPoorPerformance) {
        // Gradually increase optimization level when performance is poor
        setOptimizationLevel(level => Math.min(level + 1, 3));
      } else if (autoOptimize && !newMetrics.isPoorPerformance && optimizationLevel > 0) {
        // Gradually decrease optimization level when performance is good
        setOptimizationLevel(level => Math.max(level - 0.5, 0));
      }
    }, updateInterval);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    enabled,
    updateInterval,
    measureFrameTiming,
    calculateMetrics,
    autoOptimize,
    optimizationLevel
  ]);
  
  // Apply optimizations to the target element
  useEffect(() => {
    if (!enabled || !autoOptimize || !targetElement) {
      return;
    }
    
    // Apply different optimization levels
    switch (Math.floor(optimizationLevel)) {
      case 1: // Light optimizations
        targetElement.style.willChange = 'transform';
        targetElement.style.transform = 'translateZ(0)';
        break;
      
      case 2: // Medium optimizations
        targetElement.style.willChange = 'transform';
        targetElement.style.transform = 'translateZ(0)';
        targetElement.style.backfaceVisibility = 'hidden';
        // Reduce blur strength
        const currentBlur = targetElement.style.backdropFilter || 
                            targetElement.style.webkitBackdropFilter || '';
        if (currentBlur.includes('blur')) {
          const blurValue = parseInt(currentBlur.match(/blur\((\d+)px\)/)?.[1] || '0', 10);
          if (blurValue > 5) {
            const newBlur = currentBlur.replace(
              /blur\(\d+px\)/,
              `blur(${Math.max(blurValue - 2, 5)}px)`
            );
            targetElement.style.backdropFilter = newBlur;
            targetElement.style.webkitBackdropFilter = newBlur;
          }
        }
        break;
      
      case 3: // Aggressive optimizations
        targetElement.style.willChange = 'transform, opacity';
        targetElement.style.transform = 'translateZ(0)';
        targetElement.style.backfaceVisibility = 'hidden';
        // Significantly reduce blur and effects
        const aggressiveBlur = targetElement.style.backdropFilter || 
                               targetElement.style.webkitBackdropFilter || '';
        if (aggressiveBlur.includes('blur')) {
          const minimalBlur = aggressiveBlur.replace(
            /blur\(\d+px\)/,
            'blur(3px)'
          );
          targetElement.style.backdropFilter = minimalBlur;
          targetElement.style.webkitBackdropFilter = minimalBlur;
        }
        // Reduce transparency to improve rendering performance
        if (targetElement.style.backgroundColor.includes('rgba')) {
          const bg = targetElement.style.backgroundColor;
          const match = bg.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
          if (match) {
            const [, r, g, b, a] = match;
            const newAlpha = Math.min(Number(a) + 0.15, 0.95);
            targetElement.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
          }
        }
        break;
      
      default: // No optimizations
        if (targetElement.style.willChange) targetElement.style.willChange = '';
        if (targetElement.style.transform === 'translateZ(0)') targetElement.style.transform = '';
        if (targetElement.style.backfaceVisibility) targetElement.style.backfaceVisibility = '';
        break;
    }
  }, [enabled, autoOptimize, optimizationLevel, targetElement]);
  
  // Get suggestions for optimization
  const getSuggestions = useCallback(() => {
    if (!metrics.isPoorPerformance) {
      return [];
    }
    
    const suggestions: string[] = [];
    
    if (metrics.fps < mergedThresholds.minFps) {
      suggestions.push('Reduce animation complexity or disable animations');
    }
    
    if (metrics.recalculateStyleCount > mergedThresholds.maxRecalculateStyleCountPerSecond) {
      suggestions.push('Reduce CSS complexity and minimize style changes');
    }
    
    if (metrics.layoutCount > mergedThresholds.maxLayoutCountPerSecond) {
      suggestions.push('Avoid layout thrashing by batching DOM operations');
    }
    
    if (metrics.jankScore > mergedThresholds.maxJankScore) {
      suggestions.push('Optimize main thread usage and reduce heavy calculations');
    }
    
    // Add glass-specific recommendations
    suggestions.push('Reduce blur strength for backdrop-filter effects');
    suggestions.push('Increase background opacity to reduce transparent rendering');
    suggestions.push('Use GPU-accelerated properties (transform, opacity) for animations');
    suggestions.push('Apply will-change property to elements with glass effects');
    
    return suggestions;
  }, [
    metrics.fps,
    metrics.isPoorPerformance,
    metrics.jankScore,
    metrics.layoutCount,
    metrics.recalculateStyleCount,
    mergedThresholds
  ]);
  
  // Get performance history
  const getHistory = useCallback(() => {
    return history.current;
  }, []);
  
  // Get optimization recommendations for a specific element
  const getElementOptimizations = useCallback((element: HTMLElement) => {
    if (!element || !metrics.isPoorPerformance) {
      return {};
    }
    
    const style = window.getComputedStyle(element);
    const optimizations: Record<string, any> = {};
    
    // Check for backdrop filter
    if (style.backdropFilter || style.webkitBackdropFilter) {
      const filterStr = style.backdropFilter || style.webkitBackdropFilter;
      const blurMatch = filterStr.match(/blur\((\d+)px\)/);
      
      if (blurMatch && parseInt(blurMatch[1], 10) > 5) {
        optimizations.backdropFilter = filterStr.replace(
          /blur\(\d+px\)/,
          `blur(${Math.max(parseInt(blurMatch[1], 10) - 3, 5)}px)`
        );
      }
    }
    
    // Check for transparent background
    if (style.backgroundColor.includes('rgba')) {
      const bgMatch = style.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (bgMatch && parseFloat(bgMatch[4]) < 0.7) {
        const alpha = Math.min(parseFloat(bgMatch[4]) + 0.15, 0.85);
        optimizations.backgroundColor = `rgba(${bgMatch[1]}, ${bgMatch[2]}, ${bgMatch[3]}, ${alpha})`;
      }
    }
    
    // Check for hardware acceleration
    if (!style.transform.includes('translateZ') && !style.willChange) {
      optimizations.willChange = 'transform';
      optimizations.transform = 'translateZ(0)';
    }
    
    return optimizations;
  }, [metrics.isPoorPerformance]);
  
  return {
    metrics,
    optimizationLevel,
    isOptimized: optimizationLevel > 0,
    isPoorPerformance: metrics.isPoorPerformance,
    getSuggestions,
    getHistory,
    getElementOptimizations,
    reset: () => {
      frameTimings.current = [];
      lastFrameTime.current = 0;
      observerMetrics.current = {
        recalculateStyleCount: 0,
        layoutCount: 0,
        styleCalculationTime: 0
      };
      setOptimizationLevel(0);
    }
  };
};