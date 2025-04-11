/**
 * Animation preferences hook for user-controlled quality settings
 * 
 * Provides a system for users to override automatic quality settings
 * with their own preferences, including battery saving options and
 * specific feature toggles.
 */

import { useState, useEffect, useCallback } from 'react';
import { QualityTier, QualityFeatureFlags } from './types';

/**
 * Storage keys for animation preferences
 */
const STORAGE_KEYS = {
  QUALITY_PREFERENCE: 'galileo-glass-quality-preference',
  BATTERY_SAVER: 'galileo-glass-battery-saver',
  CUSTOM_FEATURES: 'galileo-glass-custom-features',
  REDUCED_MOTION: 'galileo-glass-reduced-motion',
};

/**
 * Animation preference mode
 */
export enum PreferenceMode {
  /** Let the system automatically determine settings */
  AUTO = 'auto',
  
  /** Use custom user-defined settings */
  CUSTOM = 'custom',
  
  /** Battery saving mode - reduce animations to save power */
  BATTERY_SAVER = 'battery-saver',
  
  /** Performance mode - prioritize smoothness over visual quality */
  PERFORMANCE = 'performance',
  
  /** Quality mode - prioritize visual quality over performance */
  QUALITY = 'quality',
}

/**
 * Animation preference options
 */
export interface AnimationPreferences {
  /** Preference mode - auto, custom, or preset modes */
  mode: PreferenceMode;
  
  /** Preferred quality tier, used when mode is CUSTOM */
  qualityTier: QualityTier;
  
  /** Whether to use customized feature flags */
  useCustomFeatures: boolean;
  
  /** Custom feature flags, used when useCustomFeatures is true */
  customFeatures: Partial<QualityFeatureFlags>;
  
  /** Whether reduced motion is enabled by user preference */
  prefersReducedMotion: boolean;
}

/**
 * Default animation preferences
 */
const DEFAULT_PREFERENCES: AnimationPreferences = {
  mode: PreferenceMode.AUTO,
  qualityTier: QualityTier.MEDIUM,
  useCustomFeatures: false,
  customFeatures: {},
  prefersReducedMotion: false,
};

/**
 * Preset configurations for different preference modes
 */
const PRESET_CONFIGURATIONS: Record<PreferenceMode, Partial<AnimationPreferences>> = {
  [PreferenceMode.AUTO]: {
    mode: PreferenceMode.AUTO,
    useCustomFeatures: false,
  },
  [PreferenceMode.CUSTOM]: {
    mode: PreferenceMode.CUSTOM,
    useCustomFeatures: true,
  },
  [PreferenceMode.BATTERY_SAVER]: {
    mode: PreferenceMode.BATTERY_SAVER,
    qualityTier: QualityTier.LOW,
    useCustomFeatures: true,
    customFeatures: {
      maxParticles: 10,
      blurEffects: false,
      reflectionEffects: false,
      shadowEffects: false,
      depthEffects: false,
      maxPhysicsObjects: 20,
      physicsHz: 30,
      maxConcurrentAnimations: 10,
    },
  },
  [PreferenceMode.PERFORMANCE]: {
    mode: PreferenceMode.PERFORMANCE,
    qualityTier: QualityTier.MEDIUM,
    useCustomFeatures: true,
    customFeatures: {
      blurEffects: false,
      reflectionEffects: false,
      highPrecisionPhysics: false,
      physicsHz: 60,
    },
  },
  [PreferenceMode.QUALITY]: {
    mode: PreferenceMode.QUALITY,
    qualityTier: QualityTier.HIGH,
    useCustomFeatures: false,
  },
};

/**
 * Options for useAnimationPreferences hook
 */
export interface AnimationPreferencesOptions {
  /** 
   * Whether to sync preferences with localStorage 
   * (defaults to true) 
   */
  persistPreferences?: boolean;
  
  /**
   * Custom storage key prefix for preferences
   * (defaults to 'galileo-glass-')
   */
  storageKeyPrefix?: string;
}

/**
 * Hook to manage user animation preferences
 * @param options Configuration options
 * @returns Animation preferences and control methods
 */
export function useAnimationPreferences(options: AnimationPreferencesOptions = {}) {
  const {
    persistPreferences = true,
    storageKeyPrefix = 'galileo-glass-',
  } = options;
  
  // Initialize state with defaults
  const [preferences, setPreferences] = useState<AnimationPreferences>(DEFAULT_PREFERENCES);
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    if (!persistPreferences || typeof window === 'undefined') {
      return;
    }
    
    let loadedPreferences: Partial<AnimationPreferences> = {};
    let loadedMode: PreferenceMode | null = null;
    
    try {
      // Load individual preferences first
      const savedQualityTier = localStorage.getItem(STORAGE_KEYS.QUALITY_PREFERENCE);
      if (savedQualityTier && Object.values(QualityTier).includes(savedQualityTier as QualityTier)) {
        loadedPreferences.qualityTier = savedQualityTier as QualityTier;
      }

      const savedBatterySaver = localStorage.getItem(STORAGE_KEYS.BATTERY_SAVER);
      // Load battery saver setting - affects mode later
      const isBatterySaver = savedBatterySaver === 'true'; 

      const savedCustomFeatures = localStorage.getItem(STORAGE_KEYS.CUSTOM_FEATURES);
      if (savedCustomFeatures) {
        try {
          loadedPreferences.customFeatures = JSON.parse(savedCustomFeatures);
          loadedPreferences.useCustomFeatures = true; // Assume custom features mean useCustom is true
        } catch (e) { /* Ignore */ }
      }

      const savedReducedMotion = localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION);
      if (savedReducedMotion === 'true' || savedReducedMotion === 'false') { // Check for both true/false
         loadedPreferences.prefersReducedMotion = savedReducedMotion === 'true';
      }
      
      // Load the preference mode LAST
      const savedMode = localStorage.getItem(`${storageKeyPrefix}preference-mode`);
      if (savedMode && Object.values(PreferenceMode).includes(savedMode as PreferenceMode)) {
         loadedMode = savedMode as PreferenceMode;
      } else if (isBatterySaver) { 
          // If battery saver flag is set but no mode, default mode to battery saver
          loadedMode = PreferenceMode.BATTERY_SAVER;
      } else if (loadedPreferences.qualityTier || loadedPreferences.useCustomFeatures) {
          // If quality or custom features were set but no mode, default mode to custom
          loadedMode = PreferenceMode.CUSTOM;
      }

      // Now apply the loaded state
      setPreferences(current => {
        let finalMode = loadedMode || PreferenceMode.AUTO;
        let finalPrefs: Partial<AnimationPreferences> = {};

        // Apply preset if mode is not custom or auto initially
        if (finalMode !== PreferenceMode.AUTO && finalMode !== PreferenceMode.CUSTOM) {
            finalPrefs = PRESET_CONFIGURATIONS[finalMode];
        }

        // Merge loaded individual settings over defaults/presets
        finalPrefs = {
            ...current, // Start with current (or default)
            ...finalPrefs, // Apply preset values if applicable
            ...loadedPreferences, // Apply individually loaded settings
            mode: finalMode // Apply final mode
        };
        
        // Ensure consistency: if mode is not CUSTOM, useCustomFeatures should be false unless preset says otherwise
        if (finalMode !== PreferenceMode.CUSTOM && PRESET_CONFIGURATIONS[finalMode]?.useCustomFeatures !== true) {
           finalPrefs.useCustomFeatures = false;
        }
        // Ensure consistency: if mode is CUSTOM, useCustomFeatures should be true
        else if (finalMode === PreferenceMode.CUSTOM) {
           finalPrefs.useCustomFeatures = true;
        }
        
        return finalPrefs as AnimationPreferences;
      });

    } catch (e) {
      // Ignore localStorage errors
      console.error('Error loading animation preferences:', e);
    }
    // Dependencies: Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistPreferences, storageKeyPrefix]);
  
  /**
   * Update the preference mode
   */
  const updatePreferenceMode = useCallback((mode: PreferenceMode) => {
    setPreferences(current => {
      // Get preset configuration for the selected mode
      const presetConfig = PRESET_CONFIGURATIONS[mode];
      
      // Merge with current preferences, prioritizing preset values
      const newPreferences = {
        ...current,
        ...presetConfig,
      };
      
      // Persist to localStorage if enabled
      if (persistPreferences && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${storageKeyPrefix}preference-mode`, mode);
          
          // If switching to battery saver, also set that flag
          if (mode === PreferenceMode.BATTERY_SAVER) {
            localStorage.setItem(STORAGE_KEYS.BATTERY_SAVER, 'true');
          } else {
            localStorage.removeItem(STORAGE_KEYS.BATTERY_SAVER);
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      return newPreferences;
    });
  }, [persistPreferences, storageKeyPrefix]);
  
  /**
   * Update quality tier preference
   */
  const updateQualityTier = useCallback((tier: QualityTier) => {
    setPreferences(current => {
      const newPreferences = {
        ...current,
        qualityTier: tier,
        // If setting a custom tier, switch to custom mode
        mode: PreferenceMode.CUSTOM,
      };
      
      // Persist to localStorage if enabled
      if (persistPreferences && typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.QUALITY_PREFERENCE, tier);
          localStorage.setItem(`${storageKeyPrefix}preference-mode`, PreferenceMode.CUSTOM);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      return newPreferences;
    });
  }, [persistPreferences, storageKeyPrefix]);
  
  /**
   * Update custom feature flags
   */
  const updateCustomFeatures = useCallback((features: Partial<QualityFeatureFlags>) => {
    setPreferences(current => {
      const newPreferences = {
        ...current,
        customFeatures: {
          ...current.customFeatures,
          ...features,
        },
        useCustomFeatures: true,
        // If setting custom features, switch to custom mode
        mode: PreferenceMode.CUSTOM,
      };
      
      // Persist to localStorage if enabled
      if (persistPreferences && typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_FEATURES, JSON.stringify(newPreferences.customFeatures));
          localStorage.setItem(`${storageKeyPrefix}preference-mode`, PreferenceMode.CUSTOM);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      return newPreferences;
    });
  }, [persistPreferences, storageKeyPrefix]);
  
  /**
   * Toggle reduced motion preference
   */
  const toggleReducedMotion = useCallback((enabled: boolean) => {
    setPreferences(current => {
      const newPreferences = {
        ...current,
        prefersReducedMotion: enabled,
      };
      
      // Persist to localStorage if enabled
      if (persistPreferences && typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, enabled ? 'true' : 'false');
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      return newPreferences;
    });
  }, [persistPreferences]);
  
  /**
   * Toggle battery saving mode
   */
  const toggleBatterySaver = useCallback((enabled: boolean) => {
    if (enabled) {
      updatePreferenceMode(PreferenceMode.BATTERY_SAVER);
    } else if (preferences.mode === PreferenceMode.BATTERY_SAVER) {
      // Only switch off if currently in battery saver mode
      updatePreferenceMode(PreferenceMode.AUTO);
    }
  }, [preferences.mode, updatePreferenceMode]);
  
  /**
   * Reset all preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    
    // Clear from localStorage if enabled
    if (persistPreferences && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${storageKeyPrefix}preference-mode`);
        localStorage.removeItem(STORAGE_KEYS.QUALITY_PREFERENCE);
        localStorage.removeItem(STORAGE_KEYS.BATTERY_SAVER);
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_FEATURES);
        localStorage.removeItem(STORAGE_KEYS.REDUCED_MOTION);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [persistPreferences, storageKeyPrefix]);
  
  return {
    /** Current animation preferences */
    preferences,
    
    /** Update the preference mode (auto, custom, battery saver, etc.) */
    updatePreferenceMode,
    
    /** Update the preferred quality tier */
    updateQualityTier,
    
    /** Update custom feature flags */
    updateCustomFeatures,
    
    /** Toggle reduced motion preference */
    toggleReducedMotion,
    
    /** Toggle battery saving mode */
    toggleBatterySaver,
    
    /** Reset all preferences to defaults */
    resetPreferences,
    
    /** Available preference modes */
    availableModes: PreferenceMode,
    
    /** Available quality tiers */
    availableTiers: QualityTier,
  };
}

export default useAnimationPreferences; 