import { useState, useEffect, useMemo, useCallback } from 'react';
import { QualityTier } from '../types/accessibility'; // Corrected import path

// LocalStorage key for user's quality preference
const QUALITY_PREFERENCE_KEY = 'galileo-glass-quality-preference';

/**
 * Represents the detected capabilities of the device.
 */
interface DeviceCapabilities {
  // Hardware details
  cpuCores: number;
  memoryGB: number;
  
  // Browser/rendering capabilities
  supportsBackdropFilter: boolean;
  supportsWebGL: boolean;
  supportsWebGL2: boolean;
  
  // Connection details (if available)
  connectionType?: string;
  connectionSpeed?: 'slow' | 'medium' | 'fast' | 'unknown';
  exactConnectionType?: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  saveData?: boolean; // User's data-saving preference
  
  // Battery status (if available)
  isBatterySaving?: boolean;
}

/**
 * Represents adaptive settings derived from device capabilities.
 * These are ready-to-use values for components to consume.
 */
interface AdaptiveSettings {
  // Particle system related
  maxParticles: number;
  particleComplexity: 'simple' | 'standard' | 'complex';
  
  // Effects related
  enableBlurEffects: boolean;
  enableReflectionEffects: boolean;
  enableGlowEffects: boolean;
  blurStrength: 'light' | 'standard' | 'strong';
  
  // Animation related
  enablePhysicsEffects: boolean;
  physicsAccuracy: 'low' | 'standard' | 'high';
  animationFidelity: 'minimal' | 'reduced' | 'standard' | 'high';
  
  // Rendering related
  useHighResTextures: boolean;
  useDynamicLighting: boolean;
  
  // Any arbitrary values can be checked by components
  [key: string]: any;
}

/**
 * Options for the useAdaptiveQuality hook
 */
interface AdaptiveQualityOptions {
  /**
   * Whether to allow user preferences to override automatic detection
   * @default true
   */
  allowUserOverride?: boolean;
  
  /**
   * Whether to respect system battery saver mode
   * @default true
   */
  respectBatterySaver?: boolean;
  
  /**
   * Automatically track and adapt to performance issues
   * @default false - Not fully implemented
   */
  enableAutoAdjust?: boolean;
}

/**
 * Result type for the useAdaptiveQuality hook.
 */
interface AdaptiveQualityResult {
  /** Device capability information detected by the system */
  deviceCapabilities: DeviceCapabilities;
  
  /** Current quality tier (automatically detected or user-selected) */
  qualityTier: QualityTier;
  
  /** Ready-to-use settings derived from the quality tier */
  adaptiveSettings: AdaptiveSettings;
  
  /** Whether the current tier was set by user preference */
  isUserPreferred: boolean;
  
  /** Set a user preference for quality tier (persisted to localStorage) */
  setQualityPreference: (tier: QualityTier | null) => void;
  
  /** Reset to automatically detected quality tier */
  resetToAutoDetect: () => void;
}

/**
 * Hook to detect device capabilities and determine an appropriate quality tier 
 * for rendering and animation performance adjustments.
 * 
 * Replaces deprecated useDeviceCapabilities and useQualityTier hooks by combining
 * their functionality into a single, more comprehensive hook.
 * 
 * @param options Configuration options for the hook
 * @returns An object containing detected capabilities, quality tier, and adaptive settings
 */
export const useAdaptiveQuality = (
  options: AdaptiveQualityOptions = {}
): AdaptiveQualityResult => {
  const {
    allowUserOverride = true,
    respectBatterySaver = true,
    enableAutoAdjust = false
  } = options;
  
  // Track if the current tier is from user preference
  const [isUserPreferred, setIsUserPreferred] = useState<boolean>(false);
  
  // Get user preference from localStorage if available
  const getUserPreference = useCallback((): QualityTier | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      
      const stored = window.localStorage.getItem(QUALITY_PREFERENCE_KEY);
      if (!stored) return null;
      
      // Validate that the stored value is a valid QualityTier
      const parsed = JSON.parse(stored);
      if (
        parsed === QualityTier.LOW || 
        parsed === QualityTier.MEDIUM || 
        parsed === QualityTier.HIGH || 
        parsed === QualityTier.ULTRA
      ) {
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('Error reading quality preference from localStorage:', err);
      return null;
    }
  }, []);

  // Detect device capabilities
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>(() => {
    // Start with sensible defaults that work in all environments (including SSR)
    const defaults: DeviceCapabilities = {
      cpuCores: 2,
      memoryGB: 2,
      supportsBackdropFilter: false,
      supportsWebGL: false,
      supportsWebGL2: false
    };
    
    // Only run browser-specific detection in browser environment
    if (typeof window !== 'undefined') {
      return {
        // CPU/Memory detection
        // Note: navigator.hardwareConcurrency can be spoofed or unavailable
        // deviceMemory is experimental and not widely supported
        cpuCores: navigator.hardwareConcurrency || defaults.cpuCores,
        memoryGB: (navigator as any).deviceMemory || defaults.memoryGB,
        
        // Feature detection
        supportsBackdropFilter: typeof CSS !== 'undefined' && 
          (CSS.supports('backdrop-filter', 'blur(10px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(10px)')),
        
        supportsWebGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(
              window.WebGLRenderingContext && 
              (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
          } catch (e) {
            return false;
          }
        })(),
        
        supportsWebGL2: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
          } catch (e) {
            return false;
          }
        })(),
        
        // Network information (if available)
        // Note: navigator.connection is experimental and not widely supported
        connectionType: (navigator as any).connection?.type || 'unknown',
        connectionSpeed: (() => {
          const conn = (navigator as any).connection;
          if (!conn) return 'unknown';
          
          // Use effectiveType, downlink, or rtt to determine a rough speed category
          if (conn.effectiveType === '4g' || conn.downlink >= 2) {
            return 'fast';
          } else if (conn.effectiveType === '3g' || conn.downlink >= 0.5) {
            return 'medium';
          } else {
            return 'slow';
          }
        })() as 'slow' | 'medium' | 'fast' | 'unknown',
        
        // Add exact connection type and saveData flag
        exactConnectionType: (navigator as any).connection?.effectiveType || 'unknown',
        saveData: !!(navigator as any).connection?.saveData,
        
        // Battery status (if available and saving mode is enabled)
        isBatterySaving: false // Default, will be updated in useEffect if API available
      };
    }
    
    return defaults;
  });

  // Update battery saving status and handle connection changes
  useEffect(() => {
    if (typeof window === 'undefined' || !respectBatterySaver) return;
    
    // Battery status detection
    const updateBatteryStatus = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          setDeviceCapabilities(prev => ({
            ...prev,
            isBatterySaving: battery.charging === false && battery.level <= 0.2
          }));
          
          // Listen for battery changes
          battery.addEventListener('chargingchange', updateBatteryStatus);
          battery.addEventListener('levelchange', updateBatteryStatus);
          
          return () => {
            battery.removeEventListener('chargingchange', updateBatteryStatus);
            battery.removeEventListener('levelchange', updateBatteryStatus);
          };
        }
      } catch (err) {
        // Battery API might not be available, just continue
      }
    };
    
    // Connection change handling
    const handleConnectionChange = () => {
      const conn = (navigator as any).connection;
      if (!conn) return;
      
      let speed: 'slow' | 'medium' | 'fast' | 'unknown' = 'unknown';
      
      if (conn.effectiveType === '4g' || conn.downlink >= 2) {
        speed = 'fast';
      } else if (conn.effectiveType === '3g' || conn.downlink >= 0.5) {
        speed = 'medium';
      } else if (conn.effectiveType) {
        speed = 'slow';
      }
      
      setDeviceCapabilities(prev => ({
        ...prev,
        connectionType: conn.type || 'unknown',
        connectionSpeed: speed,
        exactConnectionType: conn.effectiveType || 'unknown',
        saveData: !!conn.saveData
      }));
    };
    
    // Set up connection change listener if available
    const conn = (navigator as any).connection;
    if (conn) {
      handleConnectionChange(); // Initial check
      conn.addEventListener('change', handleConnectionChange);
    }
    
    // Check battery status
    updateBatteryStatus();
    
    // Clean up listeners
    return () => {
      if (conn) {
        conn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [respectBatterySaver]);

  // Determine the appropriate quality tier based on device capabilities or user preference
  const detectedQualityTier = useMemo<QualityTier>(() => {
    const { 
      cpuCores, 
      memoryGB, 
      supportsBackdropFilter, 
      supportsWebGL2,
      isBatterySaving,
      saveData
    } = deviceCapabilities;
    
    // Apply battery-saving downgrade if needed
    if (respectBatterySaver && isBatterySaving) {
      // When battery is low, cap at LOW regardless of device capabilities
      return QualityTier.LOW;
    }
    
    // Apply data-saving downgrade if requested
    if (saveData) {
      // When data saver is enabled, cap at MEDIUM to reduce data usage
      return QualityTier.MEDIUM;
    }
    
    // Feature-based caps:
    // If backdrop-filter is not supported, we cap at MEDIUM since many glass effects won't work
    const backdropFilterCap = supportsBackdropFilter ? QualityTier.ULTRA : QualityTier.MEDIUM;
    
    // WebGL2 capabilities for more advanced rendering
    const webGLCap = supportsWebGL2 ? QualityTier.ULTRA : QualityTier.HIGH;
    
    // Determine base tier from CPU and memory - using thresholds from original useQualityTier
    // These thresholds are kept consistent with the deprecated useQualityTier hook for backward compatibility
    let baseTier: QualityTier;
    
    if (cpuCores >= 12 && memoryGB >= 16) {
      baseTier = QualityTier.ULTRA;
    } else if (cpuCores >= 8 && memoryGB >= 8) {
      baseTier = QualityTier.HIGH;
    } else if (cpuCores >= 4 && memoryGB >= 4) {
      baseTier = QualityTier.MEDIUM;
    } else {
      baseTier = QualityTier.LOW;
    }
    
    // Apply caps based on feature support
    // If any cap is lower than the base tier, use that instead
    const caps = [backdropFilterCap, webGLCap];
    for (const cap of caps) {
      if (getQualityTierValue(cap) < getQualityTierValue(baseTier)) {
        baseTier = cap;
      }
    }
    
    return baseTier;
  }, [deviceCapabilities, respectBatterySaver]);
  
  // Get user preference if available and allowed
  const userPreference = useMemo(() => {
    return allowUserOverride ? getUserPreference() : null;
  }, [allowUserOverride, getUserPreference]);
  
  // Final quality tier (either user preference or detected)
  const qualityTier = useMemo(() => {
    return userPreference ?? detectedQualityTier;
  }, [userPreference, detectedQualityTier]);
  
  // Update isUserPreferred state based on whether we're using user preference
  useEffect(() => {
    setIsUserPreferred(userPreference !== null);
  }, [userPreference]);

  // Derive settings based on the quality tier
  const adaptiveSettings = useMemo<AdaptiveSettings>(() => {
    switch (qualityTier) {
      case QualityTier.ULTRA:
        return {
          maxParticles: 2000,
          particleComplexity: 'complex',
          enableBlurEffects: true,
          enableReflectionEffects: true,
          enableGlowEffects: true,
          blurStrength: 'strong',
          enablePhysicsEffects: true,
          physicsAccuracy: 'high',
          animationFidelity: 'high',
          useHighResTextures: true,
          useDynamicLighting: true
        };
      case QualityTier.HIGH:
        return {
          maxParticles: 1000,
          particleComplexity: 'standard',
          enableBlurEffects: true,
          enableReflectionEffects: true,
          enableGlowEffects: true,
          blurStrength: 'standard',
          enablePhysicsEffects: true,
          physicsAccuracy: 'standard',
          animationFidelity: 'standard',
          useHighResTextures: true,
          useDynamicLighting: true
        };
      case QualityTier.MEDIUM:
        return {
          maxParticles: 500,
          particleComplexity: 'standard',
          enableBlurEffects: true,
          enableReflectionEffects: false,
          enableGlowEffects: true,
          blurStrength: 'light',
          enablePhysicsEffects: true,
          physicsAccuracy: 'standard',
          animationFidelity: 'standard',
          useHighResTextures: false,
          useDynamicLighting: false
        };
      case QualityTier.LOW:
      default:
        return {
          maxParticles: 150,
          particleComplexity: 'simple',
          enableBlurEffects: false,
          enableReflectionEffects: false,
          enableGlowEffects: false,
          blurStrength: 'light',
          enablePhysicsEffects: true,
          physicsAccuracy: 'low',
          animationFidelity: 'reduced',
          useHighResTextures: false,
          useDynamicLighting: false
        };
    }
  }, [qualityTier]);

  // Set user preference for quality tier (persisted to localStorage)
  const setQualityPreference = useCallback((tier: QualityTier | null) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      
      if (tier === null) {
        window.localStorage.removeItem(QUALITY_PREFERENCE_KEY);
        setIsUserPreferred(false);
      } else {
        window.localStorage.setItem(QUALITY_PREFERENCE_KEY, JSON.stringify(tier));
        setIsUserPreferred(true);
      }
    } catch (err) {
      console.warn('Error saving quality preference to localStorage:', err);
    }
  }, []);

  // Reset to automatically detected quality tier
  const resetToAutoDetect = useCallback(() => {
    setQualityPreference(null);
  }, [setQualityPreference]);

  return {
    deviceCapabilities,
    qualityTier,
    adaptiveSettings,
    isUserPreferred,
    setQualityPreference,
    resetToAutoDetect
  };
};

/**
 * Helper function to get a numeric value for a QualityTier enum
 * for easier comparison (higher tier = higher number)
 */
function getQualityTierValue(tier: QualityTier): number {
  switch (tier) {
    case QualityTier.ULTRA: return 4;
    case QualityTier.HIGH: return 3;
    case QualityTier.MEDIUM: return 2;
    case QualityTier.LOW: return 1;
    default: return 0;
  }
}