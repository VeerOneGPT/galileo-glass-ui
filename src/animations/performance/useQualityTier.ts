/**
 * Quality tier detection and management hook
 * 
 * Determines the appropriate quality level for animations
 * based on device capabilities and user preferences.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import useDeviceCapabilities, { DeviceTier } from './useDeviceCapabilities';
import useAnimationPreferences, { PreferenceMode } from './useAnimationPreferences';
import { QualityTier, QualityFeatureFlags } from './types';

/**
 * Feature flags for different quality tiers
 */
const QUALITY_TIER_FEATURES: Record<QualityTier, QualityFeatureFlags> = {
  [QualityTier.MINIMAL]: {
    maxParticles: 10,
    blurEffects: false,
    reflectionEffects: false,
    shadowEffects: false,
    highPrecisionPhysics: false,
    depthEffects: false,
    maxPhysicsObjects: 10,
    antiAliasing: false,
    textureScale: 0.5,
    maxConcurrentAnimations: 5,
    physicsHz: 30,
    useSIMD: false,
    useWebGL: false
  },
  [QualityTier.LOW]: {
    maxParticles: 30,
    blurEffects: false,
    reflectionEffects: false,
    shadowEffects: true,
    highPrecisionPhysics: false,
    depthEffects: false,
    maxPhysicsObjects: 20,
    antiAliasing: false,
    textureScale: 0.75,
    maxConcurrentAnimations: 10,
    physicsHz: 45,
    useSIMD: false,
    useWebGL: true
  },
  [QualityTier.MEDIUM]: {
    maxParticles: 100,
    blurEffects: true,
    reflectionEffects: false,
    shadowEffects: true,
    highPrecisionPhysics: false,
    depthEffects: true,
    maxPhysicsObjects: 50,
    antiAliasing: true,
    textureScale: 1.0,
    maxConcurrentAnimations: 20,
    physicsHz: 60,
    useSIMD: true,
    useWebGL: true
  },
  [QualityTier.HIGH]: {
    maxParticles: 200,
    blurEffects: true,
    reflectionEffects: true,
    shadowEffects: true,
    highPrecisionPhysics: true,
    depthEffects: true,
    maxPhysicsObjects: 100,
    antiAliasing: true,
    textureScale: 1.0,
    maxConcurrentAnimations: 50,
    physicsHz: 90,
    useSIMD: true,
    useWebGL: true
  },
  [QualityTier.ULTRA]: {
    maxParticles: 500,
    blurEffects: true,
    reflectionEffects: true,
    shadowEffects: true,
    highPrecisionPhysics: true,
    depthEffects: true,
    maxPhysicsObjects: 250,
    antiAliasing: true,
    textureScale: 1.5,
    maxConcurrentAnimations: 100,
    physicsHz: 120,
    useSIMD: true,
    useWebGL: true
  }
};

/**
 * Local storage key for user quality preference
 */
const QUALITY_PREFERENCE_KEY = 'galileo-glass-quality-preference';

/**
 * Options for useQualityTier hook
 */
export interface QualityTierOptions {
  /** 
   * Whether to allow user preferences to override automatic detection
   * (defaults to true)
   */
  allowUserOverride?: boolean;
  
  /**
   * Custom mapping from device tier to quality tier
   * (defaults to standard mapping)
   */
  deviceToQualityMap?: Record<DeviceTier, QualityTier>;
  
  /**
   * Whether to drop quality tier when battery saving is active
   * (defaults to true)
   */
  reduceTierOnBatterySaving?: boolean;
  
  /**
   * Whether to track FPS and auto-adjust if needed
   * (defaults to true)
   */
  enableAutoAdjust?: boolean;
  
  /**
   * Custom FPS threshold for auto-adjustment
   * (defaults to 45 FPS)
   */
  fpsThreshold?: number;
  
  /**
   * Whether to use detailed user preferences system
   * (defaults to true)
   */
  useDetailedPreferences?: boolean;
}

/**
 * Hook to determine and manage the quality tier for animations
 * @param options Configuration options
 * @returns Quality tier information and control methods
 */
export function useQualityTier(options: QualityTierOptions = {}) {
  const {
    allowUserOverride = true,
    deviceToQualityMap = {
      [DeviceTier.LOW]: QualityTier.LOW,
      [DeviceTier.MEDIUM]: QualityTier.MEDIUM,
      [DeviceTier.HIGH]: QualityTier.HIGH,
      [DeviceTier.ULTRA]: QualityTier.ULTRA
    },
    reduceTierOnBatterySaving = true,
    enableAutoAdjust = true,
    fpsThreshold = 45,
    useDetailedPreferences = true
  } = options;

  // Get device capabilities
  const deviceCapabilities = useDeviceCapabilities();
  
  // Get user animation preferences if enabled
  const userPreferences = useDetailedPreferences 
    ? useAnimationPreferences()
    : null;
  
  // Track quality tier state
  const [qualityTier, setQualityTier] = useState<QualityTier>(QualityTier.MEDIUM);
  
  // Performance tracking state
  const [isPerformanceMonitoring, setIsPerformanceMonitoring] = useState(false);
  const [currentFps, setCurrentFps] = useState(60);
  const [autoAdjusted, setAutoAdjusted] = useState(false);
  
  // Apply user preferences (when preference mode is not AUTO)
  useEffect(() => {
    if (!useDetailedPreferences || !userPreferences || userPreferences.preferences.mode === PreferenceMode.AUTO) {
      // If not using detailed preferences or mode is AUTO, use normal settings flow
      // This will trigger the other useEffect that loads from localStorage or determines based on device
      return;
    }
    
    // Get currently selected tier from the user preferences
    const { qualityTier: preferredTier, useCustomFeatures, customFeatures } = userPreferences.preferences;
    
    // Apply the tier from user preferences
    setQualityTier(preferredTier);
    
    // Reset auto-adjusted flag when explicitly set by user
    setAutoAdjusted(false);
  }, [
    userPreferences, 
    useDetailedPreferences
  ]);
  
  // Load user preference from localStorage on mount, only if we're not using the detailed preferences system
  useEffect(() => {
    if (
      typeof window === 'undefined' || 
      !allowUserOverride || 
      (useDetailedPreferences && userPreferences?.preferences.mode !== PreferenceMode.AUTO)
    ) {
      return;
    }
    
    try {
      const savedPreference = localStorage.getItem(QUALITY_PREFERENCE_KEY);
      if (savedPreference && Object.values(QualityTier).includes(savedPreference as QualityTier)) {
        setQualityTier(savedPreference as QualityTier);
        setAutoAdjusted(false); // Reset auto-adjusted flag when manually set
      } else {
        // No saved preference, calculate based on device capabilities
        determineQualityTier();
      }
    } catch (e) {
      // Ignore localStorage errors
      determineQualityTier();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Determine quality tier based on device capabilities
  const determineQualityTier = useCallback(() => {
    // Check for reduced motion from either system preference or user preference
    const preferReducedMotion = deviceCapabilities.prefersReducedMotion || 
                               (userPreferences?.preferences.prefersReducedMotion || false);
    
    // Check for battery saving from either system or user preference
    const batterySaving = deviceCapabilities.batterySaving || 
                         (userPreferences?.preferences.mode === PreferenceMode.BATTERY_SAVER);
    
    // 1. Start with device tier mapping
    let tier = deviceToQualityMap[deviceCapabilities.deviceTier];
    
    // 2. Special case for minimal tier
    if (
      preferReducedMotion || 
      deviceCapabilities.cpuCores <= 2 ||
      !deviceCapabilities.webglSupport ||
      deviceCapabilities.deviceType === 'mobile' && deviceCapabilities.deviceTier === DeviceTier.LOW
    ) {
      tier = QualityTier.MINIMAL;
    }
    
    // 3. Reduce tier for battery saving mode
    if (reduceTierOnBatterySaving && batterySaving) {
      const tiers = [
        QualityTier.ULTRA, 
        QualityTier.HIGH, 
        QualityTier.MEDIUM, 
        QualityTier.LOW, 
        QualityTier.MINIMAL
      ];
      
      const currentIndex = tiers.indexOf(tier);
      if (currentIndex > 0) {
        // Step down one tier when battery saving
        tier = tiers[currentIndex + 1] || QualityTier.MINIMAL;
      }
    }
    
    setQualityTier(tier);
    return tier;
  }, [
    deviceCapabilities.deviceTier,
    deviceCapabilities.prefersReducedMotion,
    deviceCapabilities.cpuCores,
    deviceCapabilities.webglSupport,
    deviceCapabilities.deviceType,
    deviceCapabilities.batterySaving,
    deviceToQualityMap,
    reduceTierOnBatterySaving,
    userPreferences
  ]);
  
  // Method to explicitly set quality tier for legacy compatibility
  const setQualityPreference = useCallback((tier: QualityTier) => {
    if (useDetailedPreferences && userPreferences) {
      // Use the new preferences system if available
      userPreferences.updateQualityTier(tier);
    } else {
      // Fall back to the legacy approach
      setQualityTier(tier);
      setAutoAdjusted(false);
      
      // Save to localStorage if allowed
      if (allowUserOverride && typeof window !== 'undefined') {
        try {
          localStorage.setItem(QUALITY_PREFERENCE_KEY, tier);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    }
  }, [allowUserOverride, useDetailedPreferences, userPreferences]);
  
  // Method to reset quality tier to automatic
  const resetQualityToAuto = useCallback(() => {
    if (useDetailedPreferences && userPreferences) {
      // Use the new preferences system if available
      userPreferences.updatePreferenceMode(PreferenceMode.AUTO);
    } else {
      // Legacy approach
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(QUALITY_PREFERENCE_KEY);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      setAutoAdjusted(false);
      determineQualityTier();
    }
  }, [determineQualityTier, useDetailedPreferences, userPreferences]);
  
  // Performance monitoring logic
  useEffect(() => {
    if (!enableAutoAdjust || !isPerformanceMonitoring) {
      return;
    }
    
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;
    
    const monitorFrameRate = () => {
      frameCount++;
      const now = performance.now();
      
      // Update every half second
      if (now >= lastTime + 500) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        setCurrentFps(fps);
        
        // Check if we need to reduce quality due to low framerate
        if (fps < fpsThreshold && !autoAdjusted) {
          reduceQualityForPerformance();
        }
        
        // Reset for next check
        frameCount = 0;
        lastTime = now;
      }
      
      animationFrameId = requestAnimationFrame(monitorFrameRate);
    };
    
    animationFrameId = requestAnimationFrame(monitorFrameRate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [enableAutoAdjust, isPerformanceMonitoring, fpsThreshold, autoAdjusted]);
  
  // Method to reduce quality tier for performance
  const reduceQualityForPerformance = useCallback(() => {
    if (useDetailedPreferences && userPreferences) {
      // Use the new preferences system if available
      userPreferences.updatePreferenceMode(PreferenceMode.PERFORMANCE);
    } else {
      // Legacy approach
      setQualityTier(current => {
        // Order from highest to lowest
        const tiers = [
          QualityTier.ULTRA, 
          QualityTier.HIGH, 
          QualityTier.MEDIUM, 
          QualityTier.LOW, 
          QualityTier.MINIMAL
        ];
        
        const currentIndex = tiers.indexOf(current);
        if (currentIndex < tiers.length - 1) {
          // Reduce to next lowest tier
          return tiers[currentIndex + 1];
        }
        return current;
      });
    }
    
    setAutoAdjusted(true);
  }, [useDetailedPreferences, userPreferences]);
  
  // Method to start performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    setIsPerformanceMonitoring(true);
  }, []);
  
  // Method to stop performance monitoring
  const stopPerformanceMonitoring = useCallback(() => {
    setIsPerformanceMonitoring(false);
  }, []);
  
  // Get base feature flags for current quality tier
  const baseFeatureFlags = QUALITY_TIER_FEATURES[qualityTier];
  
  // Apply any custom feature flags from user preferences
  const featureFlags = useMemo(() => {
    if (
      useDetailedPreferences && 
      userPreferences?.preferences.useCustomFeatures && 
      userPreferences.preferences.mode !== PreferenceMode.AUTO
    ) {
      // Merge base feature flags with user's custom flags
      return {
        ...baseFeatureFlags,
        ...userPreferences.preferences.customFeatures
      };
    }
    
    return baseFeatureFlags;
  }, [
    baseFeatureFlags, 
    useDetailedPreferences, 
    userPreferences
  ]);
  
  return {
    /** Current quality tier */
    qualityTier,
    
    /** Feature flags for the current quality tier */
    featureFlags,
    
    /** Manual override for quality tier */
    setQualityPreference,
    
    /** Reset to automatic quality detection */
    resetQualityToAuto,
    
    /** Whether quality has been automatically adjusted */
    autoAdjusted,
    
    /** Current FPS if monitoring is active */
    currentFps,
    
    /** Start monitoring performance */
    startPerformanceMonitoring,
    
    /** Stop monitoring performance */
    stopPerformanceMonitoring,
    
    /** Whether performance monitoring is active */
    isPerformanceMonitoring,
    
    /** Access to user preferences system if enabled */
    userPreferences: useDetailedPreferences ? userPreferences : undefined
  };
}

export default useQualityTier; 