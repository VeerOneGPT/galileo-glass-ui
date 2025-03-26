/**
 * Motion Sensitivity Configuration
 * 
 * Defines motion sensitivity levels and utilities for accessibility.
 */

/**
 * Motion sensitivity levels
 */
export enum MotionSensitivityLevel {
  /** No motion limitations */
  NONE = 'none',
  
  /** Low sensitivity - only limit the most intense animations */
  LOW = 'low',
  
  /** Medium sensitivity - reduce most animations */
  MEDIUM = 'medium',
  
  /** High sensitivity - minimal animations */
  HIGH = 'high',
  
  /** No animations at all */
  MAXIMUM = 'maximum'
}

/**
 * Animation complexity levels
 */
export enum AnimationComplexity {
  /** No animations */
  NONE = 'none',
  
  /** Simple opacity changes */
  MINIMAL = 'minimal',
  
  /** Basic transitions (opacity, simple position changes) */
  BASIC = 'basic',
  
  /** Standard animations (opacity, position, scale) */
  STANDARD = 'standard',
  
  /** Enhanced animations (transforms, multiple properties) */
  ENHANCED = 'enhanced',
  
  /** Complex animations (physics, particles, 3D effects) */
  COMPLEX = 'complex'
}

/**
 * Interface for motion sensitivity configuration
 */
export interface MotionSensitivityConfig {
  /** The user's motion sensitivity level */
  level: MotionSensitivityLevel;
  
  /** Whether to respect the prefers-reduced-motion setting */
  respectPrefersReducedMotion: boolean;
  
  /** Maximum allowed animation complexity */
  maxAllowedComplexity: AnimationComplexity;
  
  /** Maximum allowed animation duration in ms */
  maxAllowedDuration: number;
  
  /** Whether to disable parallax effects */
  disableParallax: boolean;
  
  /** Whether to disable auto-playing animations */
  disableAutoPlay: boolean;
  
  /** Whether to disable background animations */
  disableBackgroundAnimations: boolean;
  
  /** Whether to disable hover animations */
  disableHoverAnimations: boolean;
}

/**
 * Default motion sensitivity configurations
 */
export const MOTION_SENSITIVITY_CONFIGS: Record<MotionSensitivityLevel, MotionSensitivityConfig> = {
  [MotionSensitivityLevel.NONE]: {
    level: MotionSensitivityLevel.NONE,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.COMPLEX,
    maxAllowedDuration: 2000,
    disableParallax: false,
    disableAutoPlay: false,
    disableBackgroundAnimations: false,
    disableHoverAnimations: false
  },
  
  [MotionSensitivityLevel.LOW]: {
    level: MotionSensitivityLevel.LOW,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.ENHANCED,
    maxAllowedDuration: 1000,
    disableParallax: false,
    disableAutoPlay: false,
    disableBackgroundAnimations: false,
    disableHoverAnimations: false
  },
  
  [MotionSensitivityLevel.MEDIUM]: {
    level: MotionSensitivityLevel.MEDIUM,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.STANDARD,
    maxAllowedDuration: 500,
    disableParallax: true,
    disableAutoPlay: false,
    disableBackgroundAnimations: true,
    disableHoverAnimations: false
  },
  
  [MotionSensitivityLevel.HIGH]: {
    level: MotionSensitivityLevel.HIGH,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.BASIC,
    maxAllowedDuration: 300,
    disableParallax: true,
    disableAutoPlay: true,
    disableBackgroundAnimations: true,
    disableHoverAnimations: true
  },
  
  [MotionSensitivityLevel.MAXIMUM]: {
    level: MotionSensitivityLevel.MAXIMUM,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.MINIMAL,
    maxAllowedDuration: 100,
    disableParallax: true,
    disableAutoPlay: true,
    disableBackgroundAnimations: true,
    disableHoverAnimations: true
  }
};

/**
 * Get the motion sensitivity based on system settings and user preferences
 * @param userLevel Optional user-specified sensitivity level
 * @returns The appropriate motion sensitivity configuration
 */
export const getMotionSensitivity = (
  userLevel?: MotionSensitivityLevel
): MotionSensitivityConfig => {
  // Check if prefers-reduced-motion is enabled
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // If user hasn't specified a level but prefers reduced motion, use MEDIUM
  if (!userLevel && prefersReducedMotion) {
    return MOTION_SENSITIVITY_CONFIGS[MotionSensitivityLevel.MEDIUM];
  }
  
  // Use user level or default to NONE
  return MOTION_SENSITIVITY_CONFIGS[userLevel || MotionSensitivityLevel.NONE];
};

/**
 * Check if an animation complexity is allowed for a given sensitivity level
 * @param complexity The animation complexity to check
 * @param sensitivity The motion sensitivity configuration
 * @returns Whether the animation complexity is allowed
 */
export const isAnimationComplexityAllowed = (
  complexity: AnimationComplexity,
  sensitivity: MotionSensitivityConfig
): boolean => {
  // Convert enum values to numbers for comparison
  const complexityValue = Object.values(AnimationComplexity).indexOf(complexity);
  const maxAllowedValue = Object.values(AnimationComplexity).indexOf(sensitivity.maxAllowedComplexity);
  
  return complexityValue <= maxAllowedValue;
};

/**
 * Check if an animation duration is allowed for a given sensitivity level
 * @param duration The animation duration to check (in ms)
 * @param sensitivity The motion sensitivity configuration
 * @returns Whether the animation duration is allowed
 */
export const isAnimationDurationAllowed = (
  duration: number,
  sensitivity: MotionSensitivityConfig
): boolean => {
  return duration <= sensitivity.maxAllowedDuration;
};

/**
 * Get adjusted animation parameters based on motion sensitivity
 * @param options Original animation options
 * @param sensitivity The motion sensitivity configuration
 * @returns Adjusted animation options
 */
export const getAdjustedAnimation = (
  options: {
    duration?: number;
    complexity?: AnimationComplexity;
    autoPlay?: boolean;
    isBackground?: boolean;
    isHover?: boolean;
    isParallax?: boolean;
  },
  sensitivity: MotionSensitivityConfig
): {
  duration: number;
  shouldAnimate: boolean;
} => {
  const {
    duration = 300,
    complexity = AnimationComplexity.STANDARD,
    autoPlay = false,
    isBackground = false,
    isHover = false,
    isParallax = false
  } = options;
  
  // Check if this type of animation should be disabled
  if (
    (sensitivity.disableAutoPlay && autoPlay) ||
    (sensitivity.disableBackgroundAnimations && isBackground) ||
    (sensitivity.disableHoverAnimations && isHover) ||
    (sensitivity.disableParallax && isParallax)
  ) {
    return {
      duration: 0,
      shouldAnimate: false
    };
  }
  
  // Check if complexity is allowed
  const complexityAllowed = isAnimationComplexityAllowed(complexity, sensitivity);
  if (!complexityAllowed) {
    return {
      duration: 0,
      shouldAnimate: false
    };
  }
  
  // Adjust duration if needed
  const adjustedDuration = Math.min(duration, sensitivity.maxAllowedDuration);
  
  return {
    duration: adjustedDuration,
    shouldAnimate: true
  };
};