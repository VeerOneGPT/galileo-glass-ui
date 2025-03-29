/**
 * useAccessibleAnimation Hook
 * 
 * Provides a way to make animations accessible with proper ARIA attributes
 * and respect for user motion preferences.
 */
import { useCallback, useState, useContext } from 'react';
import { FlattenSimpleInterpolation, css } from 'styled-components';

import { 
  AnimationCategory,
  getMotionSensitivity, 
  MotionSensitivityLevel, 
  getAdjustedAnimation 
} from '../animations/accessibility/MotionSensitivity';
import { 
  getSpeedController 
} from '../animations/accessibility/AnimationSpeedController';
import { 
  getAlternativesRegistry, 
  AlternativeType 
} from '../animations/accessibility/ReducedMotionAlternatives';
import { 
  useAnimationAccessibility, 
  AnnouncementType 
} from '../animations/accessibility/AnimationAccessibilityUtils';
import {
  MotionIntensityLevel 
} from '../animations/accessibility/MotionIntensityProfiler';
import { useReducedMotion } from './useReducedMotion';

// Direct import of the context to avoid circular dependency
import { AccessibilityContext } from '../components/AccessibilityProvider';

/**
 * Options for useAccessibleAnimation hook
 */
export interface UseAccessibleAnimationOptions {
  /** Animation category */
  category?: AnimationCategory;
  
  /** Animation duration in ms */
  duration?: number;
  
  /** Whether animation autoplays */
  autoPlay?: boolean;
  
  /** Whether to respect user's prefers-reduced-motion setting */
  respectReducedMotion?: boolean;
  
  /** Custom motion sensitivity level */
  motionSensitivity?: MotionSensitivityLevel;
  
  /** Whether the animation is important for functionality */
  isEssential?: boolean;
  
  /** Whether to adjust animation speed based on user preferences */
  adjustSpeed?: boolean;
  
  /** ID for the animation (used for announcements) */
  id?: string;
  
  /** Description for screen readers */
  description?: string;
  
  /** Whether to announce animation to screen readers */
  announce?: boolean;
  
  /** Announcement type (polite or assertive) */
  announcementType?: AnnouncementType;
  
  /** Whether the element has an interactive role */
  isInteractive?: boolean;
  
  /** Preferred alternative animation type */
  preferredAlternative?: AlternativeType;
}

/**
 * Hook to create accessible animations
 * 
 * @param animation CSS animation
 * @param options Accessibility options
 * @returns Accessible animation CSS and helper functions
 */
export const useAccessibleAnimation = (
  animation: FlattenSimpleInterpolation,
  options: UseAccessibleAnimationOptions = {}
) => {
  // Default options
  const {
    category = AnimationCategory.ESSENTIAL,
    duration = 300,
    autoPlay = false,
    respectReducedMotion = true,
    motionSensitivity: userSensitivity,
    isEssential = false,
    adjustSpeed = true,
    id,
    description,
    announce,
    announcementType,
    isInteractive = false,
    preferredAlternative,
  } = options;
  
  // Check if reduced motion is enabled - direct implementation to avoid circular dependency
  const systemReducedMotion = useReducedMotion();
  const accessibilityContext = useContext(AccessibilityContext);
  const userReducedMotion = accessibilityContext?.reducedMotion || accessibilityContext?.disableAnimations || false;
  const reducedMotion = respectReducedMotion && (systemReducedMotion || userReducedMotion);
  
  // Get animation accessibility utilities
  const {
    ariaAttributes,
    isAnimating,
    startAnimation,
    endAnimation,
    Announcer,
  } = useAnimationAccessibility(category, {
    id,
    description,
    announce,
    announcementType,
    isInteractive,
  });
  
  // Apply motion sensitivity settings
  const getAdjustedAnimationCSS = useCallback(() => {
    // Skip adjustments for essential animations when explicitly marked essential
    if (isEssential && category === AnimationCategory.ESSENTIAL) {
      return animation;
    }
    
    // Get motion sensitivity configuration
    const sensitivity = getMotionSensitivity(userSensitivity || 
      (reducedMotion ? MotionSensitivityLevel.MEDIUM : MotionSensitivityLevel.NONE));
    
    // Check if we should animate
    const adjustedAnimation = getAdjustedAnimation({
      duration,
      category,
      autoPlay,
    }, sensitivity);
    
    // If animation should be disabled, return empty styles
    if (!adjustedAnimation.shouldAnimate) {
      return css``;
    }
    
    // If we should use alternative animation
    if (adjustedAnimation.shouldUseAlternative) {
      const alternativesRegistry = getAlternativesRegistry();
      
      // Convert MotionSensitivityLevel to MotionIntensityLevel
      const intensityLevel = reducedMotion 
        ? MotionIntensityLevel.MINIMAL 
        : MotionIntensityLevel.MODERATE;
      
      // Get the best alternative from the registry
      const alternative = alternativesRegistry.getBestAlternative(
        category,
        intensityLevel,
        preferredAlternative
      );
      
      // Generate CSS from the alternative
      return css`
        animation-name: ${alternative.keyframes};
        animation-duration: ${adjustedAnimation.duration}ms;
        animation-timing-function: ${alternative.easing || 'ease'};
        animation-delay: 0ms;
        animation-fill-mode: both;
        animation-iteration-count: ${alternative.iterations || 1};
        animation-direction: normal;
      `;
    }
    
    // Apply speed adjustments if enabled
    if (adjustSpeed) {
      const speedController = getSpeedController();
      const adjustedCSS = speedController.applySpeedAdjustment(
        animation,
        duration,
        category
      );
      return adjustedCSS;
    }
    
    // Return original animation
    return animation;
  }, [
    animation,
    category,
    duration,
    autoPlay,
    reducedMotion,
    userSensitivity,
    isEssential,
    adjustSpeed,
    preferredAlternative,
  ]);
  
  // Get final CSS animation
  const accessibleAnimation = getAdjustedAnimationCSS();
  
  // Return animation CSS, ARIA attributes, and helper functions
  return {
    animation: accessibleAnimation,
    ariaAttributes,
    isAnimating,
    startAnimation,
    endAnimation,
    Announcer,
  };
};

export default useAccessibleAnimation;