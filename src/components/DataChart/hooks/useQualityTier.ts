/**
 * useQualityTier Hook
 * 
 * This hook determines the appropriate rendering quality tier based on device capabilities.
 * It checks for device performance indicators and sets the appropriate quality level
 * to provide the best experience for each device while maintaining performance.
 */
import { useState, useEffect } from 'react';

// Quality tier types
export type QualityTier = 'low' | 'medium' | 'high' | 'ultra';

// Physics parameters for each quality tier
export interface PhysicsParams {
  stiffness: number;
  dampingRatio: number;
  mass: number;
  precision?: number;
}

// Glass UI parameters for each quality tier
export interface GlassParams {
  blurStrength?: 'low' | 'medium' | 'high';
  backgroundOpacity?: 'light' | 'medium' | 'dark';
  enableGlow?: boolean;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
  animationDetail?: 'minimal' | 'standard' | 'detailed';
}

/**
 * Quality assessment rules for determining device capability
 */
const assessDeviceCapability = (): QualityTier => {
  // Default to medium quality
  let tier: QualityTier = 'medium';
  
  if (typeof window === 'undefined') {
    return tier; // Default for SSR
  }
  
  try {
    // Check for low-end device indicators
    const isLowEnd = 
      // Check for low memory (if exposed by browser)
      ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) ||
      // Check for battery saving mode in Safari
      (('getBattery' in navigator) && (navigator as any).getBattery && 
       (navigator as any).getBattery().then((battery: any) => battery.charging === false && battery.level < 0.2)) ||
      // Low-end mobile check
      /Android 4|Android 5|Mobile.*Firefox/.test(navigator.userAgent);
    
    // Check for high-end device indicators
    const isHighEnd =
      // Check for high memory (if exposed by browser)
      ('deviceMemory' in navigator && (navigator as any).deviceMemory >= 8) ||
      // Check high-res screen size (common in high-end devices)
      (window.screen.width * window.devicePixelRatio >= 1920) ||
      // Check for desktop with decent GPU
      (/Win64|Mac|Linux/.test(navigator.userAgent) && !(/Mobile/.test(navigator.userAgent)));
    
    // Check for ultra high-end device indicators
    const isUltraHighEnd =
      // Check for very high memory
      ('deviceMemory' in navigator && (navigator as any).deviceMemory >= 16) ||
      // Check for high performance indicators
      (window.screen.width * window.devicePixelRatio >= 2560);
    
    // Determine tier based on checks
    if (isLowEnd) {
      tier = 'low';
    } else if (isUltraHighEnd) {
      tier = 'ultra';
    } else if (isHighEnd) {
      tier = 'high';
    }
    
    // Additional check for reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Step down one tier if reduced motion is preferred
      if (tier === 'ultra') tier = 'high';
      else if (tier === 'high') tier = 'medium';
      else tier = 'low';
    }
    
    // Check if user has forced a specific quality in localStorage
    const storedQuality = localStorage.getItem('chart-quality-preference');
    if (storedQuality && ['low', 'medium', 'high', 'ultra'].includes(storedQuality)) {
      tier = storedQuality as QualityTier;
    }
    
    return tier;
  } catch (e) {
    // If any error occurs during detection, fall back to medium
    console.error('Error determining quality tier:', e);
    return 'medium';
  }
};

/**
 * Maps quality tier to physics animation parameters
 */
export const getQualityBasedPhysicsParams = (tier: QualityTier): PhysicsParams => {
  switch (tier) {
    case 'ultra':
      return {
        stiffness: 400,
        dampingRatio: 0.7,
        mass: 1,
        precision: 0.001
      };
    case 'high':
      return {
        stiffness: 300,
        dampingRatio: 0.7,
        mass: 1,
        precision: 0.01
      };
    case 'medium':
      return {
        stiffness: 200,
        dampingRatio: 0.8,
        mass: 1
      };
    case 'low':
      return {
        stiffness: 150,
        dampingRatio: 0.9,
        mass: 1
      };
  }
};

/**
 * Maps quality tier to glass UI parameters
 */
export const getQualityBasedGlassParams = (tier: QualityTier): GlassParams => {
  switch (tier) {
    case 'ultra':
      return {
        blurStrength: 'high',
        backgroundOpacity: 'light',
        enableGlow: true,
        glowIntensity: 'strong',
        animationDetail: 'detailed'
      };
    case 'high':
      return {
        blurStrength: 'medium',
        backgroundOpacity: 'light',
        enableGlow: true,
        glowIntensity: 'medium',
        animationDetail: 'standard'
      };
    case 'medium':
      return {
        blurStrength: 'medium',
        backgroundOpacity: 'medium',
        enableGlow: true,
        glowIntensity: 'subtle',
        animationDetail: 'standard'
      };
    case 'low':
      return {
        blurStrength: 'low',
        backgroundOpacity: 'medium',
        enableGlow: false,
        animationDetail: 'minimal'
      };
  }
};

/**
 * Hook to determine and provide the appropriate quality tier based on device capabilities
 */
export const useQualityTier = (): QualityTier => {
  const [qualityTier, setQualityTier] = useState<QualityTier>('medium');
  
  useEffect(() => {
    // Assess device capability and set quality tier
    const detectedTier = assessDeviceCapability();
    setQualityTier(detectedTier);
    
    // Optionally store the detected tier for future reference
    try {
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('chart-quality-detected')) {
        localStorage.setItem('chart-quality-detected', detectedTier);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);
  
  return qualityTier;
};

export default useQualityTier; 