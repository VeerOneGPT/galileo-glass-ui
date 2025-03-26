/**
 * useMotionSettings Hook
 *
 * Comprehensive hook for managing motion and animation settings
 */
import { useState, useEffect, useCallback } from 'react';

import { MotionSensitivity } from '../animations/utils/types';

import { useReducedMotion } from './useReducedMotion';

export interface MotionSettings {
  /**
   * Whether reduced motion is preferred by the user
   */
  prefersReducedMotion: boolean;

  /**
   * Current motion sensitivity level
   */
  motionSensitivity: MotionSensitivity;

  /**
   * Set motion sensitivity level
   */
  setMotionSensitivity: (level: MotionSensitivity) => void;

  /**
   * Whether animations should be completely disabled
   */
  disableAnimations: boolean;

  /**
   * Set whether animations should be completely disabled
   */
  setDisableAnimations: (disabled: boolean) => void;

  /**
   * Whether alternative animations should be used
   */
  useAlternativeAnimations: boolean;

  /**
   * Whether to show focus rings
   */
  showFocusRings: boolean;

  /**
   * Whether hover effects should be simplified
   */
  simplifyHoverEffects: boolean;

  /**
   * Adjusted animation duration multiplier
   */
  durationMultiplier: number;
}

/**
 * Hook for accessing and managing motion settings
 *
 * @param initialSensitivity Initial motion sensitivity level
 * @returns Motion settings object
 */
export const useMotionSettings = (
  initialSensitivity: MotionSensitivity = MotionSensitivity.STANDARD
): MotionSettings => {
  // Get user preference for reduced motion
  const prefersReducedMotion = useReducedMotion();

  // Set initial motion sensitivity based on reduced motion preference
  const initialLevel = prefersReducedMotion ? MotionSensitivity.REDUCED : initialSensitivity;

  // State for motion settings
  const [motionSensitivity, setMotionSensitivityState] = useState<MotionSensitivity>(initialLevel);
  const [disableAnimations, setDisableAnimations] = useState<boolean>(
    motionSensitivity === MotionSensitivity.NONE
  );
  const [showFocusRings, setShowFocusRings] = useState<boolean>(true);

  // Update stored preferences when settings change
  const setMotionSensitivity = useCallback((level: MotionSensitivity) => {
    setMotionSensitivityState(level);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('glass-ui-motion-sensitivity', level);
    }

    // Update other settings based on sensitivity level
    setDisableAnimations(level === MotionSensitivity.NONE);
  }, []);

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSensitivity = localStorage.getItem('glass-ui-motion-sensitivity');
      if (
        savedSensitivity &&
        Object.values(MotionSensitivity).includes(savedSensitivity as MotionSensitivity)
      ) {
        setMotionSensitivityState(savedSensitivity as MotionSensitivity);
      } else if (prefersReducedMotion) {
        // If no saved preference but user prefers reduced motion
        setMotionSensitivityState(MotionSensitivity.REDUCED);
      }

      // Load other preferences
      const savedDisableAnimations = localStorage.getItem('glass-ui-disable-animations');
      if (savedDisableAnimations !== null) {
        setDisableAnimations(savedDisableAnimations === 'true');
      }

      const savedShowFocusRings = localStorage.getItem('glass-ui-show-focus-rings');
      if (savedShowFocusRings !== null) {
        setShowFocusRings(savedShowFocusRings === 'true');
      }
    }
  }, [prefersReducedMotion]);

  // Derive additional settings based on sensitivity level
  const useAlternativeAnimations =
    motionSensitivity === MotionSensitivity.REDUCED ||
    motionSensitivity === MotionSensitivity.MINIMAL ||
    prefersReducedMotion;

  const simplifyHoverEffects =
    motionSensitivity === MotionSensitivity.REDUCED ||
    motionSensitivity === MotionSensitivity.MINIMAL ||
    motionSensitivity === MotionSensitivity.NONE;

  // Calculate duration multiplier based on sensitivity
  const getDurationMultiplier = () => {
    switch (motionSensitivity) {
      case MotionSensitivity.ENHANCED:
        return 1.2;
      case MotionSensitivity.STANDARD:
        return 1.0;
      case MotionSensitivity.REDUCED:
        return 0.7;
      case MotionSensitivity.MINIMAL:
        return 0.5;
      case MotionSensitivity.NONE:
        return 0;
      default:
        return 1.0;
    }
  };

  // Return the motion settings
  return {
    prefersReducedMotion,
    motionSensitivity,
    setMotionSensitivity,
    disableAnimations,
    setDisableAnimations,
    useAlternativeAnimations,
    showFocusRings,
    simplifyHoverEffects,
    durationMultiplier: getDurationMultiplier(),
  };
};
