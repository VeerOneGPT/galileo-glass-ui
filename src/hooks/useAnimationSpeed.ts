/**
 * useAnimationSpeed Hook
 * 
 * Hook for using and controlling animation speed preferences
 */
import { useState, useEffect, useCallback } from 'react';

import { 
  AnimationSpeedController, 
  AnimationSpeedPreference, 
  AnimationSpeedControlConfig,
  getSpeedController,
  DurationAdjustmentMode
} from '../animations/accessibility/AnimationSpeedController';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

/**
 * Hook for managing animation speed preferences
 * 
 * @param initialConfig Optional initial configuration
 * @returns Animation speed control functions and state
 */
export const useAnimationSpeed = (
  initialConfig?: Partial<AnimationSpeedControlConfig>
) => {
  // Get speed controller instance
  const controller = getSpeedController(initialConfig);
  
  // State for current configuration
  const [config, setConfig] = useState<AnimationSpeedControlConfig>(controller.getConfig());
  
  // Subscribe to controller updates
  useEffect(() => {
    const unsubscribe = controller.addListener(newConfig => {
      setConfig(newConfig);
    });
    
    // Ensure initial state is up to date
    setConfig(controller.getConfig());
    
    return unsubscribe;
  }, [controller]);
  
  // Set global speed preference
  const setGlobalSpeedPreference = useCallback((preference: AnimationSpeedPreference) => {
    controller.setGlobalSpeedPreference(preference);
  }, [controller]);
  
  // Set category-specific speed preference
  const setCategorySpeedPreference = useCallback((
    category: AnimationCategory, 
    preference: AnimationSpeedPreference
  ) => {
    controller.setCategorySpeedPreference(category, preference);
  }, [controller]);
  
  // Reset a category to use global preference
  const resetCategoryPreference = useCallback((category: AnimationCategory) => {
    controller.resetCategoryPreference(category);
  }, [controller]);
  
  // Reset all preferences to defaults
  const resetAllPreferences = useCallback(() => {
    controller.resetAllPreferences();
  }, [controller]);
  
  // Update entire configuration
  const updateConfig = useCallback((newConfig: Partial<AnimationSpeedControlConfig>) => {
    controller.updateConfig(newConfig);
  }, [controller]);
  
  // Get effective speed preference for a category
  const getEffectiveSpeedPreference = useCallback((category?: AnimationCategory) => {
    return controller.getEffectiveSpeedPreference(category);
  }, [controller]);
  
  // Adjust a duration based on preferences
  const adjustDuration = useCallback((duration: number, category?: AnimationCategory) => {
    return controller.adjustDuration(duration, category);
  }, [controller]);
  
  // Get speed factor for a preference
  const getSpeedFactor = useCallback((preference: AnimationSpeedPreference) => {
    switch (preference) {
      case AnimationSpeedPreference.SLOWER: return 1.5;
      case AnimationSpeedPreference.SLIGHTLY_SLOWER: return 1.25;
      case AnimationSpeedPreference.NORMAL: return 1.0;
      case AnimationSpeedPreference.SLIGHTLY_FASTER: return 0.75;
      case AnimationSpeedPreference.FASTER: return 0.5;
      case AnimationSpeedPreference.VERY_FAST: return 0.25;
      default: return 1.0;
    }
  }, []);
  
  // Return controller and functions
  return {
    // Current configuration
    config,
    
    // Control functions
    setGlobalSpeedPreference,
    setCategorySpeedPreference,
    resetCategoryPreference,
    resetAllPreferences,
    updateConfig,
    
    // Utility functions
    getEffectiveSpeedPreference,
    adjustDuration,
    getSpeedFactor,
    
    // Enums for use in components
    AnimationSpeedPreference,
    DurationAdjustmentMode,
  };
};

/**
 * Hook to get the adjusted duration for an animation
 * 
 * @param baseDuration Base duration in ms
 * @param category Animation category
 * @returns Adjusted duration in ms
 */
export const useAdjustedDuration = (
  baseDuration: number,
  category?: AnimationCategory
): number => {
  const { adjustDuration } = useAnimationSpeed();
  
  return adjustDuration(baseDuration, category);
};

/**
 * Get a human-readable label for a speed preference
 * 
 * @param preference Animation speed preference
 * @returns Human-readable label
 */
export const getSpeedPreferenceLabel = (preference: AnimationSpeedPreference): string => {
  switch (preference) {
    case AnimationSpeedPreference.SLOWER:
      return 'Slower (1.5x duration)';
    case AnimationSpeedPreference.SLIGHTLY_SLOWER:
      return 'Slightly Slower (1.25x duration)';
    case AnimationSpeedPreference.NORMAL:
      return 'Normal Speed';
    case AnimationSpeedPreference.SLIGHTLY_FASTER:
      return 'Slightly Faster (0.75x duration)';
    case AnimationSpeedPreference.FASTER:
      return 'Faster (0.5x duration)';
    case AnimationSpeedPreference.VERY_FAST:
      return 'Very Fast (0.25x duration)';
    default:
      return 'Unknown';
  }
};