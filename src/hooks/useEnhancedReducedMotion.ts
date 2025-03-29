/**
 * useEnhancedReducedMotion Hook
 *
 * Enhanced hook for detecting user's motion preferences with intelligent fallbacks
 */
import { useState, useEffect, useMemo, useCallback } from 'react';

import { 
  MotionSensitivityLevel, 
  AnimationComplexity,
  getMotionSensitivity,
  EnhancedAnimationOptions
} from '../animations/accessibility/MotionSensitivity';

/**
 * Detection methods for reduced motion preference
 */
export enum ReducedMotionDetectionMethod {
  /** Media query for prefers-reduced-motion */
  MEDIA_QUERY = 'media_query',

  /** User agent detection for mobile devices */
  USER_AGENT = 'user_agent',

  /** Power saving mode detection */
  POWER_SAVING = 'power_saving',

  /** User set override in localStorage */
  USER_PREFERENCE = 'user_preference',

  /** Detection based on device performance */
  PERFORMANCE = 'performance',
  
  /** Hardware acceleration detection */
  HARDWARE_ACCELERATION = 'hardware_acceleration',
  
  /** Screen reader detection */
  ACCESSIBILITY_TOOLS = 'accessibility_tools',
}

/**
 * Enhanced reduced motion information with detection details
 */
export interface EnhancedReducedMotionInfo {
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
  
  /** The primary detection method that triggered the reduced motion state */
  detectionMethod: ReducedMotionDetectionMethod;
  
  /** Additional detection methods that also indicate reduced motion */
  additionalDetectionMethods: ReducedMotionDetectionMethod[];
  
  /** Confidence score (0-1) in the detection */
  confidence: number;
  
  /** The recommended sensitivity level based on detection */
  recommendedSensitivityLevel: MotionSensitivityLevel;
  
  /** Set a user override for reduced motion preference */
  setUserOverride: (prefersReducedMotion: boolean | null) => void;
}

/**
 * Attempts to detect if the device is in a power saving mode
 * @returns True if the device appears to be in power saving mode
 */
const detectPowerSavingMode = (): boolean => {
  // Try to access the navigator.getBattery API if available
  if (
    typeof navigator !== 'undefined' && 
    'getBattery' in navigator && 
    typeof (navigator as any).getBattery === 'function'
  ) {
    try {
      // We can't await directly in this function, so we'll just check for hints
      // that might indicate power saving mode
      const batteryPromise = (navigator as any).getBattery();
      
      // Set up a callback for when we get battery info
      batteryPromise.then((battery: any) => {
        // If battery level is low (less than 15%) and not charging, it's likely in power saving mode
        if (battery.level < 0.15 && !battery.charging) {
          // We can't update state directly here because this is async
          // This will affect future hook calls but not the current one
          localStorage.setItem('galileo-glass-power-saving-hint', 'true');
        } else {
          localStorage.setItem('galileo-glass-power-saving-hint', 'false');
        }
      }).catch(() => {
        // Ignore errors
      });
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Check if we previously detected power saving mode
  const savedPowerSavingHint = 
    typeof localStorage !== 'undefined' 
      ? localStorage.getItem('galileo-glass-power-saving-hint') 
      : null;
      
  return savedPowerSavingHint === 'true';
};

/**
 * Attempts to detect if hardware acceleration is available and enabled
 * @returns True if hardware acceleration appears to be disabled
 */
const detectHardwareAcceleration = (): boolean => {
  if (typeof window === 'undefined' || !window.document) {
    return false;
  }
  
  // Check for previously cached result
  const cachedResult = localStorage.getItem('galileo-glass-hw-accel-hint');
  if (cachedResult) {
    return cachedResult === 'false';
  }
  
  try {
    // Create canvas for WebGL context
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      localStorage.setItem('galileo-glass-hw-accel-hint', 'false');
      return true;
    }
    
    // Check for WebGL renderer info which can indicate SW rendering
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL as number);
      const isSoftwareRenderer = 
        renderer.indexOf('SwiftShader') >= 0 || 
        renderer.indexOf('Software') >= 0 ||
        renderer.indexOf('llvmpipe') >= 0;
        
      localStorage.setItem('galileo-glass-hw-accel-hint', isSoftwareRenderer ? 'false' : 'true');
      return isSoftwareRenderer;
    }
    
    // If we couldn't determine definitely, assume hardware acceleration is available
    localStorage.setItem('galileo-glass-hw-accel-hint', 'true');
    return false;
  } catch (e) {
    // If there was an error, we'll assume hardware acceleration is available
    return false;
  }
};

/**
 * Attempts to detect if accessibility tools are being used
 * @returns True if accessibility tools appear to be in use
 */
const detectAccessibilityTools = (): boolean => {
  if (typeof window === 'undefined' || !window.document) {
    return false;
  }
  
  // Check for screen reader hints
  // Note: this is not 100% reliable as some screen readers don't set these
  const hasScreenReader = (
    // Common screen reader indicators
    'speechSynthesis' in window || 
    document.documentElement.getAttribute('aria-live') !== null ||
    document.documentElement.getAttribute('role') === 'application'
  );
  
  // Check high contrast mode
  const highContrastMedia = window.matchMedia('(forced-colors: active)');
  const hasHighContrast = highContrastMedia.matches;
  
  // Check for touch accommodations
  const hasLargeFonts = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  
  return hasScreenReader || hasHighContrast || hasLargeFonts;
};

/**
 * Detects if the device is likely to be one that would benefit from reduced motion
 * @returns True if the device is likely to need reduced motion
 */
const detectLowPerformanceDevice = (): boolean => {
  if (typeof window === 'undefined' || !navigator) {
    return false;
  }
  
  // Check for previously cached result
  const cachedResult = localStorage.getItem('galileo-glass-low-perf-device');
  if (cachedResult) {
    return cachedResult === 'true';
  }
  
  try {
    // Check for device memory API (Chrome only)
    const lowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
    
    // Check for hardware concurrency (CPU cores)
    const lowCores = 'hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4;
    
    // Check for connection type (mobile connections tend to indicate mobile devices)
    const slowConnection = 
      'connection' in navigator && 
      (navigator as any).connection && 
      ((navigator as any).connection.saveData || 
       (navigator as any).connection.effectiveType === 'slow-2g' || 
       (navigator as any).connection.effectiveType === '2g' || 
       (navigator as any).connection.effectiveType === '3g');
       
    // User agent sniffing for older devices
    const userAgent = navigator.userAgent.toLowerCase();
    const isOlderDevice = (
      /android 4\./i.test(userAgent) || 
      /iphone os [6-9]_/i.test(userAgent) ||
      /windows phone/i.test(userAgent)
    );
    
    const isLowPerformance = lowMemory || lowCores || slowConnection || isOlderDevice;
    
    // Cache the result
    localStorage.setItem('galileo-glass-low-perf-device', isLowPerformance ? 'true' : 'false');
    
    return isLowPerformance;
  } catch (e) {
    // If there was an error, we'll assume it's not a low performance device
    return false;
  }
};

/**
 * Enhanced hook for detecting and managing reduced motion preferences
 * with multiple detection methods and intelligent fallbacks
 * 
 * @param options Configuration options
 * @returns Enhanced reduced motion information
 */
export const useEnhancedReducedMotion = (
  options: {
    /** Whether to use the media query detection method */
    useMediaQuery?: boolean;
    
    /** Whether to use the user agent detection method */
    useUserAgent?: boolean;
    
    /** Whether to use the power saving detection method */
    usePowerSaving?: boolean;
    
    /** Whether to use the user preference detection method */
    useUserPreference?: boolean;
    
    /** Whether to use the performance detection method */
    usePerformance?: boolean;
    
    /** Whether to use hardware acceleration detection */
    useHardwareAcceleration?: boolean;
    
    /** Whether to use accessibility tools detection */
    useAccessibilityTools?: boolean;
    
    /** Confidence threshold for each detection method (0-1) */
    confidenceThresholds?: Partial<Record<ReducedMotionDetectionMethod, number>>;
    
    /** Whether to automatically apply fallbacks */
    autoApplyFallbacks?: boolean;
  } = {}
): EnhancedReducedMotionInfo => {
  const {
    useMediaQuery = true,
    useUserAgent = true,
    usePowerSaving = true,
    useUserPreference = true,
    usePerformance = true,
    useHardwareAcceleration = true,
    useAccessibilityTools = true,
    confidenceThresholds = {},
    autoApplyFallbacks = true,
  } = options;

  // Fallback confidence scores when not specified
  const defaultConfidenceThresholds: Record<ReducedMotionDetectionMethod, number> = {
    [ReducedMotionDetectionMethod.MEDIA_QUERY]: 1.0,        // Direct user preference, highest confidence
    [ReducedMotionDetectionMethod.USER_PREFERENCE]: 1.0,    // Explicitly set by the user in our app
    [ReducedMotionDetectionMethod.ACCESSIBILITY_TOOLS]: 0.8, // Strong indicator
    [ReducedMotionDetectionMethod.POWER_SAVING]: 0.7,       // Good indicator
    [ReducedMotionDetectionMethod.HARDWARE_ACCELERATION]: 0.6, // Moderate indicator
    [ReducedMotionDetectionMethod.PERFORMANCE]: 0.5,        // Lower confidence
    [ReducedMotionDetectionMethod.USER_AGENT]: 0.4,         // Lowest confidence
  };
  
  // Merge default thresholds with user-provided ones
  const mergedThresholds = { ...defaultConfidenceThresholds, ...confidenceThresholds };
  
  // State for detection results
  const [detectionResults, setDetectionResults] = useState<
    Record<ReducedMotionDetectionMethod, { detected: boolean; confidence: number }>
  >({
    [ReducedMotionDetectionMethod.MEDIA_QUERY]: { detected: false, confidence: 0 },
    [ReducedMotionDetectionMethod.USER_AGENT]: { detected: false, confidence: 0 },
    [ReducedMotionDetectionMethod.POWER_SAVING]: { detected: false, confidence: 0 },
    [ReducedMotionDetectionMethod.USER_PREFERENCE]: { detected: false, confidence: 0 },
    [ReducedMotionDetectionMethod.PERFORMANCE]: { detected: false, confidence: 0 },
    [ReducedMotionDetectionMethod.HARDWARE_ACCELERATION]: { detected: false, confidence: 0 },
    [ReducedMotionDetectionMethod.ACCESSIBILITY_TOOLS]: { detected: false, confidence: 0 },
  });
  
  // State for user override
  const [userOverride, setUserOverrideState] = useState<boolean | null>(() => {
    // Try to load user preference from localStorage
    if (typeof localStorage !== 'undefined') {
      const savedPreference = localStorage.getItem('galileo-glass-reduced-motion');
      if (savedPreference === 'true') return true;
      if (savedPreference === 'false') return false;
    }
    return null;
  });
  
  // Handler for setting user override
  const setUserOverride = useCallback((value: boolean | null) => {
    setUserOverrideState(value);
    
    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      if (value === null) {
        localStorage.removeItem('galileo-glass-reduced-motion');
      } else {
        localStorage.setItem('galileo-glass-reduced-motion', value.toString());
      }
    }
  }, []);
  
  // Setup media query listener
  useEffect(() => {
    if (!useMediaQuery || typeof window === 'undefined') {
      return undefined;
    }
    
    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Update state when media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setDetectionResults(prev => ({
        ...prev,
        [ReducedMotionDetectionMethod.MEDIA_QUERY]: {
          detected: event.matches,
          confidence: mergedThresholds[ReducedMotionDetectionMethod.MEDIA_QUERY],
        },
      }));
    };
    
    // Set initial state
    setDetectionResults(prev => ({
      ...prev,
      [ReducedMotionDetectionMethod.MEDIA_QUERY]: {
        detected: mediaQuery.matches,
        confidence: mergedThresholds[ReducedMotionDetectionMethod.MEDIA_QUERY],
      },
    }));
    
    // Add listener
    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy support
      (mediaQuery as any).addListener(handleChange);
      return () => (mediaQuery as any).removeListener(handleChange);
    }
  }, [useMediaQuery, mergedThresholds]);
  
  // Setup additional detection methods
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      return;
    }
    
    // Current detection results
    const results = { ...detectionResults };
    
    // User agent detection
    if (useUserAgent) {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check for mobile devices (which often benefit from reduced motion)
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Check for older browsers/devices
      const isOlder = /msie|trident|edge\/(?:12|13|14|15|16|17|18)/i.test(userAgent);
      
      results[ReducedMotionDetectionMethod.USER_AGENT] = {
        detected: isMobile || isOlder,
        confidence: mergedThresholds[ReducedMotionDetectionMethod.USER_AGENT],
      };
    }
    
    // Power saving detection
    if (usePowerSaving) {
      const isPowerSaving = detectPowerSavingMode();
      
      results[ReducedMotionDetectionMethod.POWER_SAVING] = {
        detected: isPowerSaving,
        confidence: mergedThresholds[ReducedMotionDetectionMethod.POWER_SAVING],
      };
    }
    
    // User preference from localStorage
    if (useUserPreference) {
      const userPref = localStorage.getItem('galileo-glass-reduced-motion');
      
      results[ReducedMotionDetectionMethod.USER_PREFERENCE] = {
        detected: userPref === 'true',
        confidence: userPref !== null 
          ? mergedThresholds[ReducedMotionDetectionMethod.USER_PREFERENCE]
          : 0,
      };
    }
    
    // Performance-based detection
    if (usePerformance) {
      const isLowPerformance = detectLowPerformanceDevice();
      
      results[ReducedMotionDetectionMethod.PERFORMANCE] = {
        detected: isLowPerformance,
        confidence: mergedThresholds[ReducedMotionDetectionMethod.PERFORMANCE],
      };
    }
    
    // Hardware acceleration detection
    if (useHardwareAcceleration) {
      const isHardwareAccelerationDisabled = detectHardwareAcceleration();
      
      results[ReducedMotionDetectionMethod.HARDWARE_ACCELERATION] = {
        detected: isHardwareAccelerationDisabled,
        confidence: mergedThresholds[ReducedMotionDetectionMethod.HARDWARE_ACCELERATION],
      };
    }
    
    // Accessibility tools detection
    if (useAccessibilityTools) {
      const hasAccessibilityTools = detectAccessibilityTools();
      
      results[ReducedMotionDetectionMethod.ACCESSIBILITY_TOOLS] = {
        detected: hasAccessibilityTools,
        confidence: mergedThresholds[ReducedMotionDetectionMethod.ACCESSIBILITY_TOOLS],
      };
    }
    
    // Update detection results
    setDetectionResults(results);
  }, [
    useUserAgent, 
    usePowerSaving, 
    useUserPreference, 
    usePerformance,
    useHardwareAcceleration,
    useAccessibilityTools,
    mergedThresholds,
  ]);
  
  // Compute final reduced motion preference and additional information
  const reducedMotionInfo = useMemo(() => {
    // If user has explicitly set a preference, use that
    if (userOverride !== null) {
      return {
        prefersReducedMotion: userOverride,
        detectionMethod: ReducedMotionDetectionMethod.USER_PREFERENCE,
        additionalDetectionMethods: [],
        confidence: 1.0,
        recommendedSensitivityLevel: userOverride 
          ? MotionSensitivityLevel.MEDIUM 
          : MotionSensitivityLevel.NONE,
        setUserOverride,
      };
    }
    
    // Get all active detection methods
    const activeDetectionMethods = Object.entries(detectionResults)
      .filter(([_, { detected }]) => detected)
      .map(([method]) => method as ReducedMotionDetectionMethod);
      
    // Find the detection method with the highest confidence
    let highestConfidence = 0;
    let primaryDetectionMethod = ReducedMotionDetectionMethod.MEDIA_QUERY;
    
    for (const method of activeDetectionMethods) {
      const { confidence } = detectionResults[method];
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        primaryDetectionMethod = method;
      }
    }
    
    // Calculate weighted confidence score across all detection methods
    let totalConfidence = 0;
    let totalWeight = 0;
    
    for (const method of Object.keys(detectionResults) as ReducedMotionDetectionMethod[]) {
      const { detected, confidence } = detectionResults[method];
      if (detected) {
        totalConfidence += confidence;
        totalWeight += 1;
      }
    }
    
    // Normalized confidence score
    const normalizedConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
    
    // Determine overall reduced motion preference
    const prefersReducedMotion = normalizedConfidence >= 0.5;
    
    // Remove primary detection method from additional methods
    const additionalDetectionMethods = activeDetectionMethods.filter(
      method => method !== primaryDetectionMethod
    );
    
    // Determine recommended sensitivity level based on confidence
    let recommendedSensitivityLevel: MotionSensitivityLevel;
    
    if (normalizedConfidence > 0.9) {
      recommendedSensitivityLevel = MotionSensitivityLevel.HIGH;
    } else if (normalizedConfidence > 0.7) {
      recommendedSensitivityLevel = MotionSensitivityLevel.MEDIUM_HIGH;
    } else if (normalizedConfidence > 0.5) {
      recommendedSensitivityLevel = MotionSensitivityLevel.MEDIUM;
    } else if (normalizedConfidence > 0.3) {
      recommendedSensitivityLevel = MotionSensitivityLevel.LOW_MEDIUM;
    } else if (normalizedConfidence > 0.1) {
      recommendedSensitivityLevel = MotionSensitivityLevel.LOW;
    } else {
      recommendedSensitivityLevel = MotionSensitivityLevel.NONE;
    }
    
    return {
      prefersReducedMotion,
      detectionMethod: primaryDetectionMethod,
      additionalDetectionMethods,
      confidence: normalizedConfidence,
      recommendedSensitivityLevel,
      setUserOverride,
    };
  }, [detectionResults, userOverride, setUserOverride]);
  
  return reducedMotionInfo;
};

/**
 * Get adjusted animation parameters based on enhanced reduced motion settings
 * 
 * @param options Animation options
 * @param reducedMotionInfo Enhanced reduced motion information
 * @returns Adjusted animation options
 */
export const getReducedMotionFallbacks = (
  options: EnhancedAnimationOptions,
  reducedMotionInfo: EnhancedReducedMotionInfo
): {
  shouldAnimate: boolean;
  complexity: AnimationComplexity;
  duration: number;
  distance: number;
  alternatives: {
    useFade: boolean;
    useStaticImage: boolean;
    useSimplified: boolean;
  };
} => {
  const { 
    prefersReducedMotion, 
    confidence, 
    recommendedSensitivityLevel 
  } = reducedMotionInfo;
  
  // If no reduced motion preference, return original options
  if (!prefersReducedMotion) {
    return {
      shouldAnimate: true,
      complexity: options.complexity || AnimationComplexity.STANDARD,
      duration: options.duration || 300,
      distance: options.distance || 30,
      alternatives: {
        useFade: false,
        useStaticImage: false,
        useSimplified: false,
      },
    };
  }
  
  // Get motion sensitivity configuration based on recommended level
  const sensitivityConfig = getMotionSensitivity(recommendedSensitivityLevel);
  
  // Determine if animation should be shown at all
  const isAllowedComplexity = 
    (options.complexity || AnimationComplexity.STANDARD) <= sensitivityConfig.maxAllowedComplexity;
    
  // Adjust duration based on sensitivity level and confidence
  let adjustedDuration = options.duration || 300;
  
  // Apply duration adjustment based on sensitivity config
  adjustedDuration = Math.min(adjustedDuration, sensitivityConfig.maxAllowedDuration);
  
  // Apply speed multiplier
  adjustedDuration = adjustedDuration * (1 / sensitivityConfig.speedMultiplier);
  
  // Calculate adjusted distance based on sensitivity config
  const distanceScale = (() => {
    switch (sensitivityConfig.distanceScale) {
      case 'full': return 1.0;
      case 'large': return 0.75;
      case 'medium': return 0.5;
      case 'small': return 0.25;
      case 'minimal': return 0.1;
      case 'none': return 0.0;
      default: return 0.5;
    }
  })();
  
  const adjustedDistance = (options.distance || 30) * distanceScale;
  
  // Determine appropriate animation complexity fallback
  let adjustedComplexity = options.complexity || AnimationComplexity.STANDARD;
  
  // If current complexity is not allowed, find the highest allowed complexity
  if (!isAllowedComplexity) {
    const complexityValues = Object.values(AnimationComplexity);
    const maxAllowedIndex = complexityValues.indexOf(sensitivityConfig.maxAllowedComplexity);
    
    // Find highest allowed complexity that's lower than current
    const currentIndex = complexityValues.indexOf(adjustedComplexity);
    
    if (currentIndex > maxAllowedIndex && maxAllowedIndex >= 0) {
      adjustedComplexity = complexityValues[maxAllowedIndex];
    }
  }
  
  // Determine if certain alternatives should be used
  const useFade = adjustedComplexity === AnimationComplexity.MINIMAL || 
                 adjustedComplexity === AnimationComplexity.FADE_ONLY;
                 
  const useStaticImage = !isAllowedComplexity && confidence > 0.8;
  
  const useSimplified = !isAllowedComplexity || confidence > 0.6;
  
  return {
    shouldAnimate: isAllowedComplexity,
    complexity: adjustedComplexity,
    duration: adjustedDuration,
    distance: adjustedDistance,
    alternatives: {
      useFade,
      useStaticImage,
      useSimplified,
    },
  };
};