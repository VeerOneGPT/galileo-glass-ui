/**
 * Dynamic resolution scaling for physics simulations
 * 
 * Automatically adjusts physics precision based on performance
 * to maintain framerate while maximizing quality.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQualityTier, QualityTier } from './useQualityTier';
import { PhysicsSettings } from './physicsSettings';

/**
 * Performance sample for tracking FPS history
 */
interface PerformanceSample {
  /** Timestamp of the sample */
  timestamp: number;
  
  /** FPS measured at this sample */
  fps: number;
  
  /** Physics resolution factor at this sample */
  resolution: number;
}

/**
 * Resolution scaling configuration
 */
export interface ResolutionScalingConfig {
  /** Target FPS to maintain (default: depends on quality tier) */
  targetFps?: number;
  
  /** Minimum resolution factor allowed (default: 0.25) */
  minResolution?: number;
  
  /** Maximum resolution factor allowed (default: 1.5) */
  maxResolution?: number;
  
  /** Initial resolution factor (default: from quality tier) */
  initialResolution?: number;
  
  /** 
   * How aggressively to reduce resolution when under target FPS
   * Higher values reduce resolution more quickly (default: 0.1)
   */
  downscaleFactor?: number;
  
  /** 
   * How conservatively to increase resolution when above target FPS
   * Higher values increase resolution more quickly (default: 0.05)
   */
  upscaleFactor?: number;
  
  /** 
   * Hysteresis buffer around target FPS to prevent oscillation
   * FPS must be outside this range to trigger a change (default: 5)
   */
  fpsBuffer?: number;
  
  /** 
   * How many samples to keep for moving average
   * Higher values mean more stable but slower response (default: 10)
   */
  sampleCount?: number;
  
  /** 
   * How often to sample FPS and adjust resolution in milliseconds
   * (default: 1000)
   */
  updateInterval?: number;
  
  /** 
   * Whether to enable automatic resolution scaling
   * (default: true)
   */
  enabled?: boolean;
}

/**
 * Default scaling configurations for different quality tiers
 */
const DEFAULT_CONFIGS: Record<QualityTier, ResolutionScalingConfig> = {
  [QualityTier.MINIMAL]: {
    targetFps: 30,
    minResolution: 0.25,
    maxResolution: 0.5,
    initialResolution: 0.5,
    downscaleFactor: 0.2,
    upscaleFactor: 0.02,
    fpsBuffer: 3,
    sampleCount: 5,
    updateInterval: 1000,
    enabled: true
  },
  [QualityTier.LOW]: {
    targetFps: 45,
    minResolution: 0.5,
    maxResolution: 0.75,
    initialResolution: 0.75,
    downscaleFactor: 0.15,
    upscaleFactor: 0.03,
    fpsBuffer: 4,
    sampleCount: 8,
    updateInterval: 1000,
    enabled: true
  },
  [QualityTier.MEDIUM]: {
    targetFps: 60,
    minResolution: 0.5,
    maxResolution: 1.0,
    initialResolution: 1.0,
    downscaleFactor: 0.1,
    upscaleFactor: 0.04,
    fpsBuffer: 5,
    sampleCount: 10,
    updateInterval: 1000,
    enabled: true
  },
  [QualityTier.HIGH]: {
    targetFps: 60,
    minResolution: 0.75,
    maxResolution: 1.25,
    initialResolution: 1.0,
    downscaleFactor: 0.08,
    upscaleFactor: 0.05,
    fpsBuffer: 5,
    sampleCount: 12,
    updateInterval: 800,
    enabled: true
  },
  [QualityTier.ULTRA]: {
    targetFps: 90,
    minResolution: 1.0,
    maxResolution: 1.5,
    initialResolution: 1.25,
    downscaleFactor: 0.05,
    upscaleFactor: 0.05,
    fpsBuffer: 8,
    sampleCount: 15,
    updateInterval: 500,
    enabled: true
  }
};

/**
 * Hook for dynamic resolution scaling of physics simulations
 * @param customConfig Custom configuration options
 * @returns Current resolution factor and control methods
 */
export function useDynamicResolutionScaling(
  customConfig: Partial<ResolutionScalingConfig> = {}
) {
  // Get the current quality tier
  const { qualityTier, currentFps, isPerformanceMonitoring, startPerformanceMonitoring } = useQualityTier();
  
  // Get default config for current quality tier
  const defaultConfig = DEFAULT_CONFIGS[qualityTier];
  
  // Merge with custom config
  const config = {
    ...defaultConfig,
    ...customConfig
  };
  
  // Initialize state
  const [resolution, setResolution] = useState(config.initialResolution || defaultConfig.initialResolution);
  const [isEnabled, setIsEnabled] = useState(config.enabled !== undefined ? config.enabled : true);
  const [samples, setSamples] = useState<PerformanceSample[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [averageFps, setAverageFps] = useState(config.targetFps || 60);
  
  // Reference to current physics settings (for consumers to apply resolution)
  const physicsSettingsRef = useRef<PhysicsSettings | null>(null);
  
  // Start performance monitoring if not already active
  useEffect(() => {
    if (isEnabled && !isPerformanceMonitoring) {
      startPerformanceMonitoring();
    }
  }, [isEnabled, isPerformanceMonitoring, startPerformanceMonitoring]);
  
  // Update average FPS
  useEffect(() => {
    if (!isEnabled || !isPerformanceMonitoring) return;
    
    // Add new sample
    const now = performance.now();
    
    // Only update at the specified interval
    if (now - lastUpdateTime < (config.updateInterval || 1000)) {
      return;
    }
    
    setLastUpdateTime(now);
    
    // Add FPS sample
    const newSample: PerformanceSample = {
      timestamp: now,
      fps: currentFps,
      resolution
    };
    
    // Keep the most recent samples
    const maxSamples = config.sampleCount || 10;
    const newSamples = [...samples, newSample].slice(-maxSamples);
    setSamples(newSamples);
    
    // Calculate moving average FPS
    const sumFps = newSamples.reduce((sum, sample) => sum + sample.fps, 0);
    const newAverageFps = sumFps / newSamples.length;
    setAverageFps(newAverageFps);
    
    // Determine if resolution adjustment is needed
    const targetFps = config.targetFps || defaultConfig.targetFps;
    const fpsBuffer = config.fpsBuffer || defaultConfig.fpsBuffer;
    
    if (newAverageFps < targetFps - fpsBuffer) {
      // FPS too low - decrease resolution
      decreaseResolution();
    } else if (newAverageFps > targetFps + fpsBuffer) {
      // FPS above target - can try increasing resolution
      increaseResolution();
    }
  }, [currentFps, isEnabled, isPerformanceMonitoring]);
  
  /**
   * Decrease resolution to improve performance
   */
  const decreaseResolution = useCallback(() => {
    setResolution(current => {
      // Calculate new resolution
      const downscaleFactor = config.downscaleFactor || defaultConfig.downscaleFactor;
      const minResolution = config.minResolution || defaultConfig.minResolution;
      
      // Apply reduction with larger steps when FPS is very low
      const newResolution = Math.max(
        minResolution,
        current * (1 - downscaleFactor)
      );
      
      return newResolution;
    });
  }, [config, defaultConfig]);
  
  /**
   * Increase resolution to improve quality
   */
  const increaseResolution = useCallback(() => {
    setResolution(current => {
      // Calculate new resolution
      const upscaleFactor = config.upscaleFactor || defaultConfig.upscaleFactor;
      const maxResolution = config.maxResolution || defaultConfig.maxResolution;
      
      // Apply increase with smaller steps to avoid oscillation
      const newResolution = Math.min(
        maxResolution,
        current * (1 + upscaleFactor)
      );
      
      return newResolution;
    });
  }, [config, defaultConfig]);
  
  /**
   * Enable dynamic resolution scaling
   */
  const enable = useCallback(() => {
    setIsEnabled(true);
    if (!isPerformanceMonitoring) {
      startPerformanceMonitoring();
    }
  }, [isPerformanceMonitoring, startPerformanceMonitoring]);
  
  /**
   * Disable dynamic resolution scaling
   */
  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);
  
  /**
   * Reset resolution to initial value for current quality tier
   */
  const resetResolution = useCallback(() => {
    setResolution(config.initialResolution || defaultConfig.initialResolution);
    setSamples([]);
  }, [config.initialResolution, defaultConfig.initialResolution]);
  
  /**
   * Set resolution to a specific value
   */
  const setResolutionValue = useCallback((value: number) => {
    const minResolution = config.minResolution || defaultConfig.minResolution;
    const maxResolution = config.maxResolution || defaultConfig.maxResolution;
    
    // Clamp to valid range
    const clampedValue = Math.max(
      minResolution,
      Math.min(maxResolution, value)
    );
    
    setResolution(clampedValue);
  }, [config, defaultConfig]);
  
  /**
   * Update physics settings with current resolution factor
   * @param settings Physics settings to update
   * @returns Updated physics settings
   */
  const applyResolutionToSettings = useCallback((settings: PhysicsSettings): PhysicsSettings => {
    // Store reference to latest settings
    physicsSettingsRef.current = settings;
    
    // Apply current resolution factor
    return {
      ...settings,
      simulationResolution: resolution
    };
  }, [resolution]);
  
  return {
    /** Current resolution factor */
    resolution,
    
    /** Whether dynamic scaling is enabled */
    isEnabled,
    
    /** Current average FPS */
    averageFps,
    
    /** Enable dynamic scaling */
    enable,
    
    /** Disable dynamic scaling */
    disable,
    
    /** Reset resolution to initial value */
    resetResolution,
    
    /** Set resolution to specific value */
    setResolution: setResolutionValue,
    
    /** Apply resolution to physics settings */
    applyResolutionToSettings,
    
    /** Performance samples */
    samples,
    
    /** Configuration (merged default + custom) */
    config
  };
}

export default useDynamicResolutionScaling; 