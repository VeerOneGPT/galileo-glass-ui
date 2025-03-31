/**
 * Enhanced useReducedMotion Hook
 * 
 * Advanced hook for detecting user's preference for reduced motion with
 * support for configurable alternatives and fine-grained motion control.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlternativeType, getAlternativesRegistry } from './ReducedMotionAlternatives';
import { 
  MotionSensitivityLevel,
  AnimationCategory,
  getMotionSensitivity,
  getDistanceScaleFactor,
  MotionSensitivityConfig,
  MOTION_SENSITIVITY_CONFIGS,
  AnimationComplexity,
  AnimationDistanceScale
} from './MotionSensitivity';

/**
 * Local storage keys for app-level settings
 */
const STORAGE_KEYS = {
  REDUCED_MOTION: 'galileo-glass-reduced-motion',
  MOTION_SENSITIVITY: 'galileo-glass-motion-sensitivity',
  CATEGORY_PREFERENCES: 'galileo-glass-category-preferences',
  ALTERNATIVE_PREFERENCES: 'galileo-glass-alternative-preferences'
};

/**
 * Options for the enhanced useReducedMotion hook
 */
export interface EnhancedReducedMotionOptions {
  /**
   * If true, will respect both system and app settings for reduced motion
   * If false, will only respect system prefers-reduced-motion setting
   * Default: true
   */
  respectAppSettings?: boolean;
  
  /**
   * Default value to return if running in an environment without media query support
   * such as server-side rendering.
   * Default: false (to avoid no-animation on first render)
   */
  defaultValue?: boolean;

  /**
   * Default motion sensitivity level to use when user enables reduced motion
   * Default: MotionSensitivityLevel.MEDIUM
   */
  defaultSensitivity?: MotionSensitivityLevel;

  /**
   * If true, applies more granular motion sensitivity levels rather than a binary on/off
   * Default: true
   */
  useGranularControl?: boolean;

  /**
   * Default preferred alternative animation type
   * Default: AlternativeType.FADE
   */
  defaultAlternativeType?: AlternativeType;

  /**
   * Animation category-specific preferences
   */
  categoryPreferences?: Partial<Record<AnimationCategory, {
    enabled?: boolean;
    alternativeType?: AlternativeType;
    maxComplexity?: AnimationComplexity;
  }>>;
}

/**
 * Animation preference for a specific category
 */
export interface CategoryPreference {
  /**
   * Whether animations for this category are enabled
   */
  enabled: boolean;
  
  /**
   * Preferred alternative type for this category
   */
  alternativeType: AlternativeType;
  
  /**
   * Maximum allowed complexity for this category
   */
  maxComplexity: AnimationComplexity;
  
  /**
   * Distance scale for animations in this category
   */
  distanceScale: AnimationDistanceScale;
}

/**
 * Return value for the enhanced useReducedMotion hook
 */
export interface EnhancedReducedMotionResult {
  /**
   * Whether the user prefers reduced motion (system setting)
   */
  systemReducedMotion: boolean;
  
  /**
   * Whether the app-level reduced motion setting is enabled
   */
  appReducedMotion: boolean;
  
  /**
   * Whether reduced motion should be applied (combines system and app settings)
   */
  prefersReducedMotion: boolean;
  
  /**
   * Current motion sensitivity level
   */
  motionSensitivity: MotionSensitivityLevel;
  
  /**
   * Complete motion sensitivity configuration
   */
  sensitivityConfig: MotionSensitivityConfig;
  
  /**
   * Preferred alternative animation type
   */
  preferredAlternativeType: AlternativeType;
  
  /**
   * Current category-specific preferences
   */
  categoryPreferences: Record<AnimationCategory, CategoryPreference>;
  
  /**
   * Set app-level reduced motion setting
   */
  setAppReducedMotion: (value: boolean) => void;
  
  /**
   * Set motion sensitivity level
   */
  setMotionSensitivity: (level: MotionSensitivityLevel) => void;
  
  /**
   * Set preferred alternative animation type
   */
  setPreferredAlternativeType: (type: AlternativeType) => void;
  
  /**
   * Update preferences for a specific animation category
   */
  setCategoryPreference: (
    category: AnimationCategory,
    preferences: Partial<CategoryPreference>
  ) => void;
  
  /**
   * Reset all preferences to defaults
   */
  resetPreferences: () => void;
  
  /**
   * Check if animation is allowed for a specific category
   */
  isAnimationAllowed: (category: AnimationCategory) => boolean;
  
  /**
   * Get alternative animation type for a category
   */
  getAlternativeForCategory: (category: AnimationCategory) => AlternativeType;
  
  /**
   * Get adjusted animation duration for a category (considering sensitivity)
   */
  getAdjustedDuration: (baseDuration: number, category?: AnimationCategory) => number;
  
  /**
   * Get distance scale factor for a category
   */
  getDistanceScale: (category?: AnimationCategory) => number;
}

/**
 * Default category preferences
 */
const getDefaultCategoryPreferences = (): Record<AnimationCategory, CategoryPreference> => {
  const defaults: Record<AnimationCategory, CategoryPreference> = {} as any;
  
  // Initialize with defaults for each category
  Object.values(AnimationCategory).forEach(category => {
    defaults[category] = {
      enabled: true,
      alternativeType: AlternativeType.FADE,
      maxComplexity: AnimationComplexity.STANDARD,
      distanceScale: AnimationDistanceScale.MEDIUM
    };
  });
  
  // Override with sensible defaults for specific categories
  defaults[AnimationCategory.ESSENTIAL].enabled = true;
  defaults[AnimationCategory.ESSENTIAL].maxComplexity = AnimationComplexity.ENHANCED;
  
  defaults[AnimationCategory.LOADING].enabled = true;
  defaults[AnimationCategory.LOADING].alternativeType = AlternativeType.SIMPLIFIED;
  
  defaults[AnimationCategory.BACKGROUND].enabled = false;
  defaults[AnimationCategory.BACKGROUND].maxComplexity = AnimationComplexity.MINIMAL;
  
  defaults[AnimationCategory.SCROLL].enabled = false;
  
  defaults[AnimationCategory.HOVER].alternativeType = AlternativeType.STATIC;
  
  defaults[AnimationCategory.ATTENTION].alternativeType = AlternativeType.ALTERNATIVE_PROPERTY;
  
  return defaults;
};

/**
 * Load preferences from localStorage
 */
const loadPreferencesFromStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      appReducedMotion: false,
      motionSensitivity: MotionSensitivityLevel.MEDIUM,
      categoryPreferences: getDefaultCategoryPreferences(),
      preferredAlternativeType: AlternativeType.FADE
    };
  }
  
  try {
    // Load app reduced motion setting
    const appReducedMotion = localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION) === 'true';
    
    // Load motion sensitivity level
    const storedSensitivity = localStorage.getItem(STORAGE_KEYS.MOTION_SENSITIVITY);
    const motionSensitivity = storedSensitivity 
      ? (storedSensitivity as MotionSensitivityLevel)
      : MotionSensitivityLevel.MEDIUM;
    
    // Load category preferences
    const storedCategoryPrefs = localStorage.getItem(STORAGE_KEYS.CATEGORY_PREFERENCES);
    const categoryPreferences = storedCategoryPrefs 
      ? JSON.parse(storedCategoryPrefs)
      : getDefaultCategoryPreferences();
    
    // Load preferred alternative type
    const storedAlternativeType = localStorage.getItem(STORAGE_KEYS.ALTERNATIVE_PREFERENCES);
    const preferredAlternativeType = storedAlternativeType 
      ? (storedAlternativeType as AlternativeType)
      : AlternativeType.FADE;
    
    return {
      appReducedMotion,
      motionSensitivity,
      categoryPreferences,
      preferredAlternativeType
    };
  } catch (e) {
    // Return defaults if there's any error
    return {
      appReducedMotion: false,
      motionSensitivity: MotionSensitivityLevel.MEDIUM,
      categoryPreferences: getDefaultCategoryPreferences(),
      preferredAlternativeType: AlternativeType.FADE
    };
  }
};

/**
 * Save preferences to localStorage
 */
const savePreferencesToStorage = (
  appReducedMotion: boolean,
  motionSensitivity: MotionSensitivityLevel,
  categoryPreferences: Record<AnimationCategory, CategoryPreference>,
  preferredAlternativeType: AlternativeType
) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  
  try {
    // Save app reduced motion setting
    localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, appReducedMotion.toString());
    
    // Save motion sensitivity level
    localStorage.setItem(STORAGE_KEYS.MOTION_SENSITIVITY, motionSensitivity);
    
    // Save category preferences
    localStorage.setItem(STORAGE_KEYS.CATEGORY_PREFERENCES, JSON.stringify(categoryPreferences));
    
    // Save preferred alternative type
    localStorage.setItem(STORAGE_KEYS.ALTERNATIVE_PREFERENCES, preferredAlternativeType);
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.REDUCED_MOTION,
      newValue: appReducedMotion.toString()
    }));
  } catch (e) {
    // Ignore localStorage errors
  }
};

/**
 * Enhanced hook for detecting and configuring reduced motion preferences
 * 
 * This hook provides fine-grained control over motion sensitivity and
 * alternative animations for different categories of animations.
 * 
 * @param options Configuration options
 * @returns Enhanced reduced motion controls and state
 */
export function useReducedMotion(
  options: EnhancedReducedMotionOptions = {}
): EnhancedReducedMotionResult {
  const {
    respectAppSettings = true,
    defaultValue = false,
    defaultSensitivity = MotionSensitivityLevel.MEDIUM,
    useGranularControl = true,
    defaultAlternativeType = AlternativeType.FADE,
    categoryPreferences: initialCategoryPrefs = {}
  } = options;
  
  // Initialize the alternatives registry
  const alternativesRegistry = useMemo(() => getAlternativesRegistry(), []);
  
  // State to track system preference via media query
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() => {
    // Check if window is defined (to handle SSR case)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return defaultValue;
    }
    
    // Check system preference via media query
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  
  // Load stored preferences
  const storedPrefs = useMemo(() => loadPreferencesFromStorage(), []);
  
  // State for app-level settings
  const [appReducedMotion, setAppReducedMotionState] = useState<boolean>(
    storedPrefs.appReducedMotion
  );
  
  const [motionSensitivity, setMotionSensitivityState] = useState<MotionSensitivityLevel>(
    storedPrefs.motionSensitivity || defaultSensitivity
  );
  
  const [preferredAlternativeType, setPreferredAlternativeTypeState] = useState<AlternativeType>(
    storedPrefs.preferredAlternativeType || defaultAlternativeType
  );
  
  // Merge stored category preferences with provided initial preferences
  const initialCategoryPreferences = useMemo(() => {
    const defaults = getDefaultCategoryPreferences();
    const stored = storedPrefs.categoryPreferences || {};
    
    // Apply stored preferences
    const merged = { ...defaults };
    Object.keys(stored).forEach(category => {
      if (Object.values(AnimationCategory).includes(category as AnimationCategory)) {
        merged[category as AnimationCategory] = {
          ...merged[category as AnimationCategory],
          ...stored[category as AnimationCategory]
        };
      }
    });
    
    // Apply initial preferences passed to the hook
    Object.keys(initialCategoryPrefs).forEach(category => {
      if (Object.values(AnimationCategory).includes(category as AnimationCategory)) {
        merged[category as AnimationCategory] = {
          ...merged[category as AnimationCategory],
          ...initialCategoryPrefs[category as AnimationCategory]
        };
      }
    });
    
    return merged;
  }, [initialCategoryPrefs, storedPrefs.categoryPreferences]);
  
  // State for category-specific preferences
  const [categoryPreferences, setCategoryPreferencesState] = useState<
    Record<AnimationCategory, CategoryPreference>
  >(initialCategoryPreferences);
  
  // Compute current sensitivity configuration
  const sensitivityConfig = useMemo(() => {
    return getMotionSensitivity(motionSensitivity);
  }, [motionSensitivity]);
  
  // Effect to listen for changes in system preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    
    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Handler for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };
    
    // Subscribe to changes with browser compatibility
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Older browsers
      (mediaQuery as any).addListener(handleChange);
    }
    
    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Older browsers
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);
  
  // Effect to listen for app setting changes from other components
  useEffect(() => {
    if (typeof window === 'undefined' || !respectAppSettings) {
      return;
    }
    
    // Handler for storage events (when localStorage is updated in other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.REDUCED_MOTION) {
        setAppReducedMotionState(event.newValue === 'true');
      }
      else if (event.key === STORAGE_KEYS.MOTION_SENSITIVITY && event.newValue) {
        setMotionSensitivityState(event.newValue as MotionSensitivityLevel);
      }
      else if (event.key === STORAGE_KEYS.CATEGORY_PREFERENCES && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setCategoryPreferencesState(current => ({
            ...current,
            ...parsed
          }));
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
      else if (event.key === STORAGE_KEYS.ALTERNATIVE_PREFERENCES && event.newValue) {
        setPreferredAlternativeTypeState(event.newValue as AlternativeType);
      }
    };
    
    // Subscribe to storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [respectAppSettings]);
  
  // Save preferences whenever they change
  useEffect(() => {
    savePreferencesToStorage(
      appReducedMotion,
      motionSensitivity,
      categoryPreferences,
      preferredAlternativeType
    );
  }, [appReducedMotion, motionSensitivity, categoryPreferences, preferredAlternativeType]);
  
  // Combine system and app preference to determine if reduced motion should be used
  const prefersReducedMotion = useMemo(() => {
    return respectAppSettings
      ? (systemReducedMotion || appReducedMotion)
      : systemReducedMotion;
  }, [respectAppSettings, systemReducedMotion, appReducedMotion]);
  
  // Set app reduced motion setting
  const setAppReducedMotion = useCallback((value: boolean) => {
    setAppReducedMotionState(value);
  }, []);
  
  // Set motion sensitivity level
  const setMotionSensitivity = useCallback((level: MotionSensitivityLevel) => {
    setMotionSensitivityState(level);
  }, []);
  
  // Set preferred alternative type
  const setPreferredAlternativeType = useCallback((type: AlternativeType) => {
    setPreferredAlternativeTypeState(type);
  }, []);
  
  // Update preferences for a specific category
  const setCategoryPreference = useCallback((
    category: AnimationCategory,
    preferences: Partial<CategoryPreference>
  ) => {
    setCategoryPreferencesState(current => ({
      ...current,
      [category]: {
        ...current[category],
        ...preferences
      }
    }));
  }, []);
  
  // Reset all preferences to defaults
  const resetPreferences = useCallback(() => {
    setAppReducedMotionState(false);
    setMotionSensitivityState(defaultSensitivity);
    setPreferredAlternativeTypeState(defaultAlternativeType);
    setCategoryPreferencesState(getDefaultCategoryPreferences());
  }, [defaultSensitivity, defaultAlternativeType]);
  
  // Check if animation is allowed for a specific category
  const isAnimationAllowed = useCallback((category: AnimationCategory) => {
    // If not using reduced motion, all animations are allowed
    if (!prefersReducedMotion) return true;
    
    // If using granular control, check category preferences and sensitivity settings
    if (useGranularControl) {
      // Check if category is enabled in preferences
      const categoryEnabled = categoryPreferences[category]?.enabled ?? true;
      
      // Check if category is enabled in sensitivity config
      const sensitivityCategoryEnabled = 
        sensitivityConfig.categorySettings[category]?.enabled ?? true;
      
      return categoryEnabled && sensitivityCategoryEnabled;
    }
    
    // In binary mode, essential animations are always allowed
    return category === AnimationCategory.ESSENTIAL;
  }, [
    prefersReducedMotion, 
    useGranularControl, 
    categoryPreferences, 
    sensitivityConfig
  ]);
  
  // Get alternative animation type for a category
  const getAlternativeForCategory = useCallback((category: AnimationCategory): AlternativeType => {
    // Check for category-specific preference
    const categoryPreference = categoryPreferences[category]?.alternativeType;
    if (categoryPreference) {
      return categoryPreference;
    }
    
    // Fall back to global preference
    return preferredAlternativeType;
  }, [categoryPreferences, preferredAlternativeType]);
  
  // Get adjusted animation duration for a category
  const getAdjustedDuration = useCallback((
    baseDuration: number, 
    category?: AnimationCategory
  ): number => {
    if (!prefersReducedMotion) return baseDuration;
    
    // Get speed multiplier from sensitivity config
    const speedMultiplier = category
      ? sensitivityConfig.categorySettings[category]?.speedMultiplier ?? sensitivityConfig.speedMultiplier
      : sensitivityConfig.speedMultiplier;
    
    return Math.round(baseDuration * speedMultiplier);
  }, [prefersReducedMotion, sensitivityConfig]);
  
  // Get distance scale factor for a category
  const getDistanceScale = useCallback((category?: AnimationCategory): number => {
    if (!prefersReducedMotion) return 1.0;
    
    return getDistanceScaleFactor(sensitivityConfig, category);
  }, [prefersReducedMotion, sensitivityConfig]);
  
  // Return the full enhanced result
  return {
    systemReducedMotion,
    appReducedMotion,
    prefersReducedMotion,
    motionSensitivity,
    sensitivityConfig,
    preferredAlternativeType,
    categoryPreferences,
    setAppReducedMotion,
    setMotionSensitivity,
    setPreferredAlternativeType,
    setCategoryPreference,
    resetPreferences,
    isAnimationAllowed,
    getAlternativeForCategory,
    getAdjustedDuration,
    getDistanceScale
  };
}