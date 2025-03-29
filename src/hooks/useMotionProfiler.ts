/**
 * useMotionProfiler Hook
 * 
 * Hook for using the motion intensity profiler in components
 */
import { useRef, useEffect, useCallback, useMemo } from 'react';

import {
  MotionIntensityProfiler,
  MotionIntensityProfile,
  MotionProfilerOptions,
  getMotionProfiler,
  profileAnimation,
  MotionAreaImpact,
  MotionIntensityLevel,
  MotionTrigger,
  AnimationPropertyType
} from '../animations/accessibility/MotionIntensityProfiler';
import { Keyframes } from 'styled-components';
import { AnimationPreset } from '../animations/types';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

/**
 * Hook for profiling and registering animations
 * 
 * @param id Unique animation identifier
 * @param options Animation properties and options
 * @returns Motion intensity profile and utility functions
 */
export const useMotionProfiler = (
  id: string,
  options: MotionProfilerOptions
): {
  profile: MotionIntensityProfile;
  updateProfile: (newOptions: Partial<MotionProfilerOptions>) => void;
  isHighIntensity: boolean;
  shouldReduceMotion: boolean;
  recommendReducedMotion: boolean;
} => {
  // Get motion profiler instance
  const profiler = getMotionProfiler();
  
  // Use ref to avoid unnecessary re-renders
  const optionsRef = useRef(options);
  
  // Generate profile ID if component doesn't have a stable ID
  const profileId = useMemo(() => {
    return id || `animation-${Math.random().toString(36).substring(2, 9)}`;
  }, [id]);
  
  // Register animation with profiler
  useEffect(() => {
    optionsRef.current = options;
    profiler.registerAnimation(profileId, options);
    
    // Clean up on unmount
    return () => {
      // Consider keeping the profile for analysis even after component unmounts
      // profiler.clearProfiles(); // Don't clear all profiles, just remove this one if needed
    };
  }, [profileId, options, profiler]);
  
  // Update profile with new options
  const updateProfile = useCallback((newOptions: Partial<MotionProfilerOptions>) => {
    const updatedOptions = { ...optionsRef.current, ...newOptions };
    optionsRef.current = updatedOptions;
    profiler.registerAnimation(profileId, updatedOptions);
  }, [profileId, profiler]);
  
  // Get current profile
  const profile = useMemo(() => {
    const existing = profiler.getProfile(profileId);
    if (existing) {
      return existing;
    }
    
    // If not found (shouldn't happen due to useEffect), create a new one
    return profileAnimation(options);
  }, [profileId, options, profiler]);
  
  // Determine if this is a high intensity animation
  const isHighIntensity = useMemo(() => {
    return profile.intensityLevel === MotionIntensityLevel.HIGH ||
           profile.intensityLevel === MotionIntensityLevel.VERY_HIGH ||
           profile.intensityLevel === MotionIntensityLevel.EXTREME;
  }, [profile.intensityLevel]);
  
  // Determine if motion should be reduced for this animation
  const shouldReduceMotion = useMemo(() => {
    // Check for problematic combinations
    const hasProblematicFeatures = 
      profile.hasFlashing || 
      profile.hasRapidChanges || 
      (profile.uses3D && profile.areaImpact !== MotionAreaImpact.TINY);
    
    // Check for auto-playing high intensity animations
    const isAutoplayingHighIntensity = 
      profile.trigger === MotionTrigger.AUTO_PLAY && isHighIntensity;
    
    // Check for large area high intensity animations
    const isLargeAreaHighIntensity = 
      (profile.areaImpact === MotionAreaImpact.LARGE || 
       profile.areaImpact === MotionAreaImpact.HUGE || 
       profile.areaImpact === MotionAreaImpact.FULL_SCREEN) && 
      isHighIntensity;
    
    // Animation should be reduced if any of these conditions are met
    return hasProblematicFeatures || isAutoplayingHighIntensity || isLargeAreaHighIntensity;
  }, [profile, isHighIntensity]);
  
  // Determine if reduced motion is recommended (less strict than shouldReduceMotion)
  const recommendReducedMotion = useMemo(() => {
    // Less strict check that focuses on accessibility concerns
    return profile.hasFlashing || 
           profile.intensityLevel === MotionIntensityLevel.EXTREME ||
           (profile.areaImpact === MotionAreaImpact.FULL_SCREEN && 
            profile.intensityLevel === MotionIntensityLevel.VERY_HIGH);
  }, [profile]);
  
  return {
    profile,
    updateProfile,
    isHighIntensity,
    shouldReduceMotion,
    recommendReducedMotion
  };
};

/**
 * Hook to access the global motion intensity metrics
 * 
 * @returns Global motion intensity metrics
 */
export const useGlobalMotionIntensity = () => {
  // Get motion profiler instance
  const profiler = getMotionProfiler();
  
  // Calculate metrics
  const metrics = useMemo(() => {
    return profiler.calculateOverallIntensity();
  }, [profiler]);
  
  // Find animations exceeding threshold
  const findIntenseAnimations = useCallback((threshold: number) => {
    return profiler.findIntenseAnimations(threshold);
  }, [profiler]);
  
  // Get all profiles
  const getAllProfiles = useCallback(() => {
    return profiler.getAllProfiles();
  }, [profiler]);
  
  return {
    ...metrics,
    findIntenseAnimations,
    getAllProfiles,
  };
};

/**
 * Register an animation with the profiler
 * 
 * @param id Animation identifier
 * @param keyframes Animation keyframes or preset
 * @param options Profiler options
 * @returns Motion intensity profile
 */
export const registerAnimation = (
  id: string,
  keyframes: Keyframes | AnimationPreset | string,
  options: Omit<MotionProfilerOptions, 'keyframes'>
): MotionIntensityProfile => {
  const profiler = getMotionProfiler();
  
  // Convert string keyframes to proper Keyframes object
  let processedKeyframes: Keyframes | AnimationPreset;
  if (typeof keyframes === 'string') {
    processedKeyframes = {
      name: keyframes,
      id: keyframes,
      rules: '',
      toString: () => keyframes,
      getName: () => keyframes
    };
  } else {
    processedKeyframes = keyframes;
  }
  
  return profiler.registerAnimation(id, { ...options, keyframes: processedKeyframes });
};

/**
 * Get animation categories by intensity level
 * 
 * @returns Categorized animation profiles
 */
export const getCategorizedAnimations = (): {
  lowIntensity: Map<string, MotionIntensityProfile>;
  moderateIntensity: Map<string, MotionIntensityProfile>;
  highIntensity: Map<string, MotionIntensityProfile>;
} => {
  const profiler = getMotionProfiler();
  const all = profiler.getAllProfiles();
  
  const lowIntensity = new Map();
  const moderateIntensity = new Map();
  const highIntensity = new Map();
  
  for (const [id, profile] of all.entries()) {
    if (
      profile.intensityLevel === MotionIntensityLevel.NONE ||
      profile.intensityLevel === MotionIntensityLevel.MINIMAL ||
      profile.intensityLevel === MotionIntensityLevel.LOW
    ) {
      lowIntensity.set(id, profile);
    } else if (
      profile.intensityLevel === MotionIntensityLevel.MODERATE
    ) {
      moderateIntensity.set(id, profile);
    } else {
      highIntensity.set(id, profile);
    }
  }
  
  return { lowIntensity, moderateIntensity, highIntensity };
};

// Export types for convenience
export {
  MotionIntensityLevel,
  MotionAreaImpact,
  MotionTrigger,
  AnimationPropertyType
} from '../animations/accessibility/MotionIntensityProfiler';