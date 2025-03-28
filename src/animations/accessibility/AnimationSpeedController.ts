/**
 * Animation Speed Controller
 * 
 * Provides utilities for controlling animation speed based on user preferences
 */
import { css, FlattenSimpleInterpolation } from 'styled-components';

import { AnimationCategory } from './MotionSensitivity';

/**
 * Animation speed preference level
 */
export enum AnimationSpeedPreference {
  /** Slower animations (1.5x duration) */
  SLOWER = 'slower',
  
  /** Slightly slower animations (1.25x duration) */
  SLIGHTLY_SLOWER = 'slightly_slower',
  
  /** Default animation speed (1x duration) */
  NORMAL = 'normal',
  
  /** Slightly faster animations (0.75x duration) */
  SLIGHTLY_FASTER = 'slightly_faster',
  
  /** Faster animations (0.5x duration) */
  FASTER = 'faster',
  
  /** Very fast animations (0.25x duration) */
  VERY_FAST = 'very_fast',
}

/**
 * Animation duration adjustment mode
 */
export enum DurationAdjustmentMode {
  /** Multiply the duration by a factor */
  MULTIPLY = 'multiply',
  
  /** Add a constant offset to the duration */
  ADD = 'add',
  
  /** Set a fixed maximum duration */
  MAX = 'max',
  
  /** Set a fixed minimum duration */
  MIN = 'min',
  
  /** Set a fixed duration regardless of original value */
  FIXED = 'fixed',
}

/**
 * Animation speed control configuration
 */
export interface AnimationSpeedControlConfig {
  /** Global animation speed preference */
  globalSpeedPreference: AnimationSpeedPreference;
  
  /** Category-specific speed preferences */
  categoryPreferences?: Partial<Record<AnimationCategory, AnimationSpeedPreference>>;
  
  /** Mode for adjusting animation durations */
  adjustmentMode?: DurationAdjustmentMode;
  
  /** Base factor or value for duration adjustment */
  adjustmentValue?: number;
  
  /** Whether to apply speed adjustments to hover animations */
  adjustHoverAnimations?: boolean;
  
  /** Whether to apply speed adjustments to focus animations */
  adjustFocusAnimations?: boolean;
  
  /** Whether to apply speed adjustments to loading animations */
  adjustLoadingAnimations?: boolean;
  
  /** Whether to apply different speed scaling to short vs long animations */
  smartDurationScaling?: boolean;
  
  /** Custom duration thresholds for different animation types */
  durationThresholds?: {
    /** Threshold between short and medium animations (ms) */
    shortMedium?: number;
    
    /** Threshold between medium and long animations (ms) */
    mediumLong?: number;
  };
}

/**
 * Default speed factors for different preferences
 */
export const SPEED_FACTORS: Record<AnimationSpeedPreference, number> = {
  [AnimationSpeedPreference.SLOWER]: 1.5,
  [AnimationSpeedPreference.SLIGHTLY_SLOWER]: 1.25,
  [AnimationSpeedPreference.NORMAL]: 1.0,
  [AnimationSpeedPreference.SLIGHTLY_FASTER]: 0.75,
  [AnimationSpeedPreference.FASTER]: 0.5,
  [AnimationSpeedPreference.VERY_FAST]: 0.25,
};

/**
 * Default animation speed control configuration
 */
export const DEFAULT_SPEED_CONTROL_CONFIG: AnimationSpeedControlConfig = {
  globalSpeedPreference: AnimationSpeedPreference.NORMAL,
  adjustmentMode: DurationAdjustmentMode.MULTIPLY,
  adjustmentValue: 1.0,
  adjustHoverAnimations: true,
  adjustFocusAnimations: true,
  adjustLoadingAnimations: false,
  smartDurationScaling: true,
  durationThresholds: {
    shortMedium: 300,
    mediumLong: 1000,
  },
  categoryPreferences: {
    [AnimationCategory.ENTRANCE]: AnimationSpeedPreference.NORMAL,
    [AnimationCategory.EXIT]: AnimationSpeedPreference.SLIGHTLY_FASTER,
    [AnimationCategory.HOVER]: AnimationSpeedPreference.SLIGHTLY_FASTER,
    [AnimationCategory.FOCUS]: AnimationSpeedPreference.NORMAL,
    [AnimationCategory.ACTIVE]: AnimationSpeedPreference.FASTER,
    [AnimationCategory.LOADING]: AnimationSpeedPreference.NORMAL,
    [AnimationCategory.BACKGROUND]: AnimationSpeedPreference.NORMAL,
    [AnimationCategory.SCROLL]: AnimationSpeedPreference.NORMAL,
    [AnimationCategory.ATTENTION]: AnimationSpeedPreference.SLIGHTLY_SLOWER,
  },
};

/**
 * Animation speed control manager singleton
 */
export class AnimationSpeedController {
  private static instance: AnimationSpeedController;
  
  private config: AnimationSpeedControlConfig;
  private listeners: ((config: AnimationSpeedControlConfig) => void)[] = [];
  
  /**
   * Creates a new animation speed controller
   * @param initialConfig Initial configuration
   */
  private constructor(initialConfig: Partial<AnimationSpeedControlConfig> = {}) {
    this.config = {
      ...DEFAULT_SPEED_CONTROL_CONFIG,
      ...initialConfig,
      categoryPreferences: {
        ...DEFAULT_SPEED_CONTROL_CONFIG.categoryPreferences,
        ...initialConfig.categoryPreferences,
      },
      durationThresholds: {
        ...DEFAULT_SPEED_CONTROL_CONFIG.durationThresholds,
        ...initialConfig.durationThresholds,
      },
    };
    
    // Load saved preferences if available
    this.loadSavedPreferences();
  }
  
  /**
   * Gets the singleton instance
   * @param initialConfig Initial configuration
   * @returns The singleton instance
   */
  public static getInstance(initialConfig: Partial<AnimationSpeedControlConfig> = {}): AnimationSpeedController {
    if (!AnimationSpeedController.instance) {
      AnimationSpeedController.instance = new AnimationSpeedController(initialConfig);
    }
    
    return AnimationSpeedController.instance;
  }
  
  /**
   * Loads saved preferences from localStorage
   */
  private loadSavedPreferences(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const savedPreferences = localStorage.getItem('galileo-glass-animation-speed');
      
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        
        // Merge with default config
        this.config = {
          ...this.config,
          ...parsedPreferences,
          categoryPreferences: {
            ...this.config.categoryPreferences,
            ...parsedPreferences.categoryPreferences,
          },
          durationThresholds: {
            ...this.config.durationThresholds,
            ...parsedPreferences.durationThresholds,
          },
        };
      }
    } catch (error) {
      // Ignore parsing errors
      console.error('Error loading animation speed preferences:', error);
    }
  }
  
  /**
   * Saves current preferences to localStorage
   */
  private savePreferences(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem('galileo-glass-animation-speed', JSON.stringify(this.config));
    } catch (error) {
      // Ignore storage errors
      console.error('Error saving animation speed preferences:', error);
    }
  }
  
  /**
   * Updates the animation speed control configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<AnimationSpeedControlConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      categoryPreferences: {
        ...this.config.categoryPreferences,
        ...config.categoryPreferences,
      },
      durationThresholds: {
        ...this.config.durationThresholds,
        ...config.durationThresholds,
      },
    };
    
    // Save to localStorage
    this.savePreferences();
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Sets the global animation speed preference
   * @param preference Animation speed preference
   */
  public setGlobalSpeedPreference(preference: AnimationSpeedPreference): void {
    this.config.globalSpeedPreference = preference;
    
    // Save to localStorage
    this.savePreferences();
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Sets a category-specific animation speed preference
   * @param category Animation category
   * @param preference Animation speed preference
   */
  public setCategorySpeedPreference(category: AnimationCategory, preference: AnimationSpeedPreference): void {
    if (!this.config.categoryPreferences) {
      this.config.categoryPreferences = {};
    }
    
    this.config.categoryPreferences[category] = preference;
    
    // Save to localStorage
    this.savePreferences();
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Reset a category to use the global preference
   * @param category Animation category
   */
  public resetCategoryPreference(category: AnimationCategory): void {
    if (this.config.categoryPreferences && category in this.config.categoryPreferences) {
      delete this.config.categoryPreferences[category];
      
      // Save to localStorage
      this.savePreferences();
      
      // Notify listeners
      this.notifyListeners();
    }
  }
  
  /**
   * Reset all preferences to defaults
   */
  public resetAllPreferences(): void {
    this.config = { ...DEFAULT_SPEED_CONTROL_CONFIG };
    
    // Save to localStorage
    this.savePreferences();
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Gets the current animation speed control configuration
   * @returns The current configuration
   */
  public getConfig(): AnimationSpeedControlConfig {
    return { ...this.config };
  }
  
  /**
   * Gets the effective speed preference for a specific category
   * @param category Animation category
   * @returns The effective speed preference
   */
  public getEffectiveSpeedPreference(category?: AnimationCategory): AnimationSpeedPreference {
    if (category && this.config.categoryPreferences && category in this.config.categoryPreferences) {
      return this.config.categoryPreferences[category]!;
    }
    
    return this.config.globalSpeedPreference;
  }
  
  /**
   * Adds a listener for configuration changes
   * @param listener Listener function
   * @returns Unsubscribe function
   */
  public addListener(listener: (config: AnimationSpeedControlConfig) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notifies all listeners of configuration changes
   */
  private notifyListeners(): void {
    const config = this.getConfig();
    
    for (const listener of this.listeners) {
      listener(config);
    }
  }
  
  /**
   * Adjusts an animation duration based on the current configuration and animation properties
   * 
   * @param originalDuration Original animation duration in ms
   * @param category Animation category
   * @returns Adjusted animation duration in ms
   */
  public adjustDuration(originalDuration: number, category?: AnimationCategory): number {
    // Get effective speed preference for this category
    const effectivePreference = this.getEffectiveSpeedPreference(category);
    
    // Skip adjustment for loading animations if configured
    if (category === AnimationCategory.LOADING && !this.config.adjustLoadingAnimations) {
      return originalDuration;
    }
    
    // Skip adjustment for hover animations if configured
    if (category === AnimationCategory.HOVER && !this.config.adjustHoverAnimations) {
      return originalDuration;
    }
    
    // Skip adjustment for focus animations if configured
    if (category === AnimationCategory.FOCUS && !this.config.adjustFocusAnimations) {
      return originalDuration;
    }
    
    // Get speed factor for this preference
    const speedFactor = SPEED_FACTORS[effectivePreference];
    
    // Apply smart duration scaling if enabled
    if (this.config.smartDurationScaling) {
      const { shortMedium = 300, mediumLong = 1000 } = this.config.durationThresholds || {};
      
      // Apply different scaling based on animation length
      if (originalDuration <= shortMedium) {
        // Short animations: less aggressive scaling
        return originalDuration * (speedFactor * 0.5 + 0.5);
      } else if (originalDuration <= mediumLong) {
        // Medium animations: normal scaling
        return originalDuration * speedFactor;
      } else {
        // Long animations: more aggressive scaling
        return originalDuration * Math.pow(speedFactor, 1.5);
      }
    }
    
    // Apply regular duration adjustment based on configured mode
    switch (this.config.adjustmentMode) {
      case DurationAdjustmentMode.MULTIPLY:
        return originalDuration * (this.config.adjustmentValue || 1.0) * speedFactor;
        
      case DurationAdjustmentMode.ADD:
        return originalDuration + (this.config.adjustmentValue || 0);
        
      case DurationAdjustmentMode.MAX:
        return Math.min(originalDuration, this.config.adjustmentValue || originalDuration);
        
      case DurationAdjustmentMode.MIN:
        return Math.max(originalDuration, this.config.adjustmentValue || originalDuration);
        
      case DurationAdjustmentMode.FIXED:
        return this.config.adjustmentValue || originalDuration;
        
      default:
        return originalDuration * speedFactor;
    }
  }
  
  /**
   * Applies speed adjustment to animation CSS
   * 
   * @param originalAnimation Original animation CSS
   * @param duration Original animation duration in ms
   * @param category Animation category
   * @returns Adjusted animation CSS
   */
  public applySpeedAdjustment(
    originalAnimation: FlattenSimpleInterpolation,
    duration: number,
    category?: AnimationCategory
  ): FlattenSimpleInterpolation {
    // Adjust duration
    const adjustedDuration = this.adjustDuration(duration, category);
    
    // Skip if no adjustment needed
    if (adjustedDuration === duration) {
      return originalAnimation;
    }
    
    // Apply adjusted duration to animation CSS
    return css`
      ${originalAnimation}
      animation-duration: ${adjustedDuration}ms !important;
    `;
  }
}

/**
 * Get speed controller instance for current context
 * @param config Optional initial configuration
 * @returns Animation speed controller instance
 */
export const getSpeedController = (
  config?: Partial<AnimationSpeedControlConfig>
): AnimationSpeedController => {
  return AnimationSpeedController.getInstance(config);
};

/**
 * Adjust animation duration based on user preferences
 * 
 * @param duration Original animation duration in ms
 * @param category Animation category
 * @param config Optional speed control configuration override
 * @returns Adjusted animation duration in ms
 */
export const adjustAnimationDuration = (
  duration: number,
  category?: AnimationCategory,
  config?: Partial<AnimationSpeedControlConfig>
): number => {
  const controller = getSpeedController(config);
  return controller.adjustDuration(duration, category);
};

/**
 * Apply animation speed adjustment to CSS
 * 
 * @param animation Original animation CSS
 * @param duration Original animation duration in ms
 * @param category Animation category
 * @param config Optional speed control configuration override
 * @returns Adjusted animation CSS
 */
export const applyAnimationSpeedAdjustment = (
  animation: FlattenSimpleInterpolation,
  duration: number,
  category?: AnimationCategory,
  config?: Partial<AnimationSpeedControlConfig>
): FlattenSimpleInterpolation => {
  const controller = getSpeedController(config);
  return controller.applySpeedAdjustment(animation, duration, category);
};