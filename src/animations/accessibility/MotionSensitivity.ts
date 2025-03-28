/**
 * Motion Sensitivity Configuration
 *
 * Defines motion sensitivity levels and utilities for accessibility.
 */

/**
 * Motion sensitivity levels with expanded granular control
 */
export enum MotionSensitivityLevel {
  /** No motion limitations */
  NONE = 'none',

  /** Very low sensitivity - limit only the most extreme animations */
  VERY_LOW = 'very_low',

  /** Low sensitivity - only limit the most intense animations */
  LOW = 'low',

  /** Low-medium sensitivity - moderate reduction of complex animations */
  LOW_MEDIUM = 'low_medium',

  /** Medium sensitivity - reduce most animations */
  MEDIUM = 'medium',

  /** Medium-high sensitivity - allow only simple animations */
  MEDIUM_HIGH = 'medium_high',

  /** High sensitivity - minimal animations */
  HIGH = 'high',

  /** Very high sensitivity - nearly all animations disabled */
  VERY_HIGH = 'very_high',

  /** No animations at all */
  MAXIMUM = 'maximum',
}

/**
 * Animation complexity levels with expanded granularity
 */
export enum AnimationComplexity {
  /** No animations */
  NONE = 'none',

  /** Simple opacity changes only */
  MINIMAL = 'minimal',

  /** Basic fade transitions */
  FADE_ONLY = 'fade_only',

  /** Basic transitions (opacity, simple position changes) */
  BASIC = 'basic',

  /** Simple transitions with limited motion range */
  RESTRAINED = 'restrained',

  /** Standard animations (opacity, position, scale) */
  STANDARD = 'standard',

  /** Moderate animations with some dynamic elements */
  MODERATE = 'moderate',

  /** Enhanced animations (transforms, multiple properties) */
  ENHANCED = 'enhanced',

  /** Advanced animations with limited physics */
  ADVANCED = 'advanced',

  /** Complex animations (full physics, particles, 3D effects) */
  COMPLEX = 'complex',

  /** Maximum complexity with all effects enabled */
  MAXIMUM = 'maximum',
}

/**
 * Animation distance scale options for limiting motion range
 */
export enum AnimationDistanceScale {
  /** No distance restrictions */
  FULL = 'full',
  
  /** 75% of normal distance */
  LARGE = 'large',
  
  /** 50% of normal distance */
  MEDIUM = 'medium',
  
  /** 25% of normal distance */
  SMALL = 'small',
  
  /** 10% of normal distance */
  MINIMAL = 'minimal',
  
  /** No motion distance (only opacity/color changes) */
  NONE = 'none'
}

/**
 * Animation category types
 */
export enum AnimationCategory {
  /** Essential UI feedback animations */
  ESSENTIAL = 'essential',
  
  /** Entrance animations (elements appearing) */
  ENTRANCE = 'entrance',
  
  /** Exit animations (elements disappearing) */
  EXIT = 'exit',
  
  /** Hover state animations */
  HOVER = 'hover',
  
  /** Focus state animations */
  FOCUS = 'focus',
  
  /** Active/pressed state animations */
  ACTIVE = 'active',
  
  /** Loading/progress animations */
  LOADING = 'loading',
  
  /** Background/decorative animations */
  BACKGROUND = 'background',
  
  /** Scrolling effects and parallax */
  SCROLL = 'scroll',
  
  /** Attention-grabbing animations */
  ATTENTION = 'attention'
}

/**
 * Interface for motion sensitivity configuration with granular control
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

  /** Animation distance scale factor to limit motion range */
  distanceScale: AnimationDistanceScale;

  /** Animation speed multiplier (1.0 = normal speed, <1 = slower, >1 = faster) */
  speedMultiplier: number;
  
  /** Category-specific settings to enable fine-grained control */
  categorySettings: {
    [key in AnimationCategory]?: {
      /** Whether this category is enabled */
      enabled: boolean;
      /** Maximum complexity for this specific category */
      maxComplexity?: AnimationComplexity;
      /** Duration limit override for this category */
      maxDuration?: number;
      /** Distance scale override for this category */
      distanceScale?: AnimationDistanceScale;
      /** Speed multiplier override for this category */
      speedMultiplier?: number;
    };
  };

  /** Legacy options kept for backward compatibility */
  disableParallax: boolean;
  disableAutoPlay: boolean;
  disableBackgroundAnimations: boolean;
  disableHoverAnimations: boolean;
  
  /** Frequency limit for animations (max number of animations per second) */
  maxAnimationsPerSecond?: number;
  
  /** Whether to use alternative animations for this sensitivity level */
  useAlternativeAnimations: boolean;
  
  /** Whether to disable 3D perspective effects */
  disable3DEffects: boolean;
  
  /** Whether to reduce or eliminate flashing effects */
  reduceFlashing: boolean;
}

/**
 * Default motion sensitivity configurations with granular control
 */
export const MOTION_SENSITIVITY_CONFIGS: Record<MotionSensitivityLevel, MotionSensitivityConfig> = {
  [MotionSensitivityLevel.NONE]: {
    level: MotionSensitivityLevel.NONE,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.MAXIMUM,
    maxAllowedDuration: 2500,
    distanceScale: AnimationDistanceScale.FULL,
    speedMultiplier: 1.0,
    disableParallax: false,
    disableAutoPlay: false,
    disableBackgroundAnimations: false,
    disableHoverAnimations: false,
    useAlternativeAnimations: false,
    disable3DEffects: false,
    reduceFlashing: false,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { enabled: true },
      [AnimationCategory.ENTRANCE]: { enabled: true },
      [AnimationCategory.EXIT]: { enabled: true },
      [AnimationCategory.HOVER]: { enabled: true },
      [AnimationCategory.FOCUS]: { enabled: true },
      [AnimationCategory.ACTIVE]: { enabled: true },
      [AnimationCategory.LOADING]: { enabled: true },
      [AnimationCategory.BACKGROUND]: { enabled: true },
      [AnimationCategory.SCROLL]: { enabled: true },
      [AnimationCategory.ATTENTION]: { enabled: true },
    }
  },

  [MotionSensitivityLevel.VERY_LOW]: {
    level: MotionSensitivityLevel.VERY_LOW,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.COMPLEX,
    maxAllowedDuration: 2000,
    distanceScale: AnimationDistanceScale.FULL,
    speedMultiplier: 1.0,
    disableParallax: false,
    disableAutoPlay: false,
    disableBackgroundAnimations: false,
    disableHoverAnimations: false,
    useAlternativeAnimations: false,
    disable3DEffects: false,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { enabled: true },
      [AnimationCategory.ENTRANCE]: { enabled: true },
      [AnimationCategory.EXIT]: { enabled: true },
      [AnimationCategory.HOVER]: { enabled: true },
      [AnimationCategory.FOCUS]: { enabled: true },
      [AnimationCategory.ACTIVE]: { enabled: true },
      [AnimationCategory.LOADING]: { enabled: true },
      [AnimationCategory.BACKGROUND]: { enabled: true },
      [AnimationCategory.SCROLL]: { enabled: true },
      [AnimationCategory.ATTENTION]: { 
        enabled: true, 
        maxComplexity: AnimationComplexity.ADVANCED,
      },
    }
  },

  [MotionSensitivityLevel.LOW]: {
    level: MotionSensitivityLevel.LOW,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.ENHANCED,
    maxAllowedDuration: 1500,
    distanceScale: AnimationDistanceScale.LARGE,
    speedMultiplier: 0.9,
    disableParallax: false,
    disableAutoPlay: false,
    disableBackgroundAnimations: false,
    disableHoverAnimations: false,
    useAlternativeAnimations: false,
    disable3DEffects: false,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { enabled: true },
      [AnimationCategory.ENTRANCE]: { enabled: true },
      [AnimationCategory.EXIT]: { enabled: true },
      [AnimationCategory.HOVER]: { enabled: true },
      [AnimationCategory.FOCUS]: { enabled: true },
      [AnimationCategory.ACTIVE]: { enabled: true },
      [AnimationCategory.LOADING]: { enabled: true },
      [AnimationCategory.BACKGROUND]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.MODERATE 
      },
      [AnimationCategory.SCROLL]: { enabled: true },
      [AnimationCategory.ATTENTION]: { 
        enabled: true, 
        maxComplexity: AnimationComplexity.MODERATE,
      },
    }
  },

  [MotionSensitivityLevel.LOW_MEDIUM]: {
    level: MotionSensitivityLevel.LOW_MEDIUM,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.MODERATE,
    maxAllowedDuration: 1200,
    distanceScale: AnimationDistanceScale.MEDIUM,
    speedMultiplier: 0.85,
    disableParallax: false,
    disableAutoPlay: false,
    disableBackgroundAnimations: false,
    disableHoverAnimations: false,
    useAlternativeAnimations: false,
    disable3DEffects: false,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { enabled: true },
      [AnimationCategory.ENTRANCE]: { enabled: true },
      [AnimationCategory.EXIT]: { enabled: true },
      [AnimationCategory.HOVER]: { enabled: true },
      [AnimationCategory.FOCUS]: { enabled: true },
      [AnimationCategory.ACTIVE]: { enabled: true },
      [AnimationCategory.LOADING]: { enabled: true },
      [AnimationCategory.BACKGROUND]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.STANDARD 
      },
      [AnimationCategory.SCROLL]: { 
        enabled: true,
        distanceScale: AnimationDistanceScale.MEDIUM 
      },
      [AnimationCategory.ATTENTION]: { 
        enabled: true, 
        maxComplexity: AnimationComplexity.STANDARD,
      },
    }
  },

  [MotionSensitivityLevel.MEDIUM]: {
    level: MotionSensitivityLevel.MEDIUM,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.STANDARD,
    maxAllowedDuration: 1000,
    distanceScale: AnimationDistanceScale.MEDIUM,
    speedMultiplier: 0.8,
    disableParallax: true,
    disableAutoPlay: false,
    disableBackgroundAnimations: false,
    disableHoverAnimations: false,
    useAlternativeAnimations: true,
    disable3DEffects: false,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { enabled: true },
      [AnimationCategory.ENTRANCE]: { enabled: true },
      [AnimationCategory.EXIT]: { enabled: true },
      [AnimationCategory.HOVER]: { enabled: true },
      [AnimationCategory.FOCUS]: { enabled: true },
      [AnimationCategory.ACTIVE]: { enabled: true },
      [AnimationCategory.LOADING]: { enabled: true },
      [AnimationCategory.BACKGROUND]: { 
        enabled: false,
        maxComplexity: AnimationComplexity.BASIC 
      },
      [AnimationCategory.SCROLL]: { 
        enabled: false,
      },
      [AnimationCategory.ATTENTION]: { 
        enabled: true, 
        maxComplexity: AnimationComplexity.RESTRAINED,
        distanceScale: AnimationDistanceScale.SMALL,
      },
    }
  },

  [MotionSensitivityLevel.MEDIUM_HIGH]: {
    level: MotionSensitivityLevel.MEDIUM_HIGH,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.RESTRAINED,
    maxAllowedDuration: 800,
    distanceScale: AnimationDistanceScale.SMALL,
    speedMultiplier: 0.75,
    disableParallax: true,
    disableAutoPlay: true,
    disableBackgroundAnimations: true,
    disableHoverAnimations: false,
    useAlternativeAnimations: true,
    disable3DEffects: true,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { enabled: true },
      [AnimationCategory.ENTRANCE]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.BASIC,
        distanceScale: AnimationDistanceScale.SMALL,
      },
      [AnimationCategory.EXIT]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.BASIC,
        distanceScale: AnimationDistanceScale.SMALL,
      },
      [AnimationCategory.HOVER]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.BASIC,
      },
      [AnimationCategory.FOCUS]: { enabled: true },
      [AnimationCategory.ACTIVE]: { enabled: true },
      [AnimationCategory.LOADING]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.BASIC,
      },
      [AnimationCategory.BACKGROUND]: { enabled: false },
      [AnimationCategory.SCROLL]: { enabled: false },
      [AnimationCategory.ATTENTION]: { 
        enabled: true, 
        maxComplexity: AnimationComplexity.BASIC,
        distanceScale: AnimationDistanceScale.MINIMAL,
      },
    }
  },

  [MotionSensitivityLevel.HIGH]: {
    level: MotionSensitivityLevel.HIGH,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.BASIC,
    maxAllowedDuration: 500,
    distanceScale: AnimationDistanceScale.SMALL,
    speedMultiplier: 0.7,
    disableParallax: true,
    disableAutoPlay: true,
    disableBackgroundAnimations: true,
    disableHoverAnimations: true,
    useAlternativeAnimations: true,
    disable3DEffects: true,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.BASIC,
      },
      [AnimationCategory.ENTRANCE]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.FADE_ONLY,
        distanceScale: AnimationDistanceScale.MINIMAL,
      },
      [AnimationCategory.EXIT]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.FADE_ONLY,
        distanceScale: AnimationDistanceScale.MINIMAL,
      },
      [AnimationCategory.HOVER]: { enabled: false },
      [AnimationCategory.FOCUS]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.MINIMAL,
      },
      [AnimationCategory.ACTIVE]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.MINIMAL,
      },
      [AnimationCategory.LOADING]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.BASIC,
        speedMultiplier: 0.6,
      },
      [AnimationCategory.BACKGROUND]: { enabled: false },
      [AnimationCategory.SCROLL]: { enabled: false },
      [AnimationCategory.ATTENTION]: { 
        enabled: true, 
        maxComplexity: AnimationComplexity.MINIMAL,
        distanceScale: AnimationDistanceScale.NONE,
      },
    }
  },

  [MotionSensitivityLevel.VERY_HIGH]: {
    level: MotionSensitivityLevel.VERY_HIGH,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.FADE_ONLY,
    maxAllowedDuration: 300,
    distanceScale: AnimationDistanceScale.MINIMAL,
    speedMultiplier: 0.6,
    disableParallax: true,
    disableAutoPlay: true,
    disableBackgroundAnimations: true,
    disableHoverAnimations: true,
    useAlternativeAnimations: true,
    disable3DEffects: true,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.FADE_ONLY,
      },
      [AnimationCategory.ENTRANCE]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.FADE_ONLY,
        distanceScale: AnimationDistanceScale.NONE,
      },
      [AnimationCategory.EXIT]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.FADE_ONLY,
        distanceScale: AnimationDistanceScale.NONE,
      },
      [AnimationCategory.HOVER]: { enabled: false },
      [AnimationCategory.FOCUS]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.MINIMAL,
      },
      [AnimationCategory.ACTIVE]: { enabled: false },
      [AnimationCategory.LOADING]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.MINIMAL,
        speedMultiplier: 0.5,
      },
      [AnimationCategory.BACKGROUND]: { enabled: false },
      [AnimationCategory.SCROLL]: { enabled: false },
      [AnimationCategory.ATTENTION]: { enabled: false },
    }
  },

  [MotionSensitivityLevel.MAXIMUM]: {
    level: MotionSensitivityLevel.MAXIMUM,
    respectPrefersReducedMotion: true,
    maxAllowedComplexity: AnimationComplexity.MINIMAL,
    maxAllowedDuration: 200,
    distanceScale: AnimationDistanceScale.NONE,
    speedMultiplier: 0.5,
    disableParallax: true,
    disableAutoPlay: true,
    disableBackgroundAnimations: true,
    disableHoverAnimations: true,
    useAlternativeAnimations: true,
    disable3DEffects: true,
    reduceFlashing: true,
    categorySettings: {
      [AnimationCategory.ESSENTIAL]: { 
        enabled: false,
      },
      [AnimationCategory.ENTRANCE]: { enabled: false },
      [AnimationCategory.EXIT]: { enabled: false },
      [AnimationCategory.HOVER]: { enabled: false },
      [AnimationCategory.FOCUS]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.MINIMAL,
        distanceScale: AnimationDistanceScale.NONE,
      },
      [AnimationCategory.ACTIVE]: { enabled: false },
      [AnimationCategory.LOADING]: { 
        enabled: true,
        maxComplexity: AnimationComplexity.MINIMAL,
        distanceScale: AnimationDistanceScale.NONE,
        speedMultiplier: 0.4,
      },
      [AnimationCategory.BACKGROUND]: { enabled: false },
      [AnimationCategory.SCROLL]: { enabled: false },
      [AnimationCategory.ATTENTION]: { enabled: false },
    }
  },
};

/**
 * Custom motion sensitivity options for fine-grained control
 */
export interface MotionSensitivityOptions {
  /** Base sensitivity level */
  level?: MotionSensitivityLevel;
  
  /** Whether to respect the prefers-reduced-motion setting */
  respectPrefersReducedMotion?: boolean;
  
  /** Maximum allowed animation complexity */
  maxAllowedComplexity?: AnimationComplexity;
  
  /** Maximum allowed animation duration in ms */
  maxAllowedDuration?: number;
  
  /** Animation distance scale factor */
  distanceScale?: AnimationDistanceScale;
  
  /** Animation speed multiplier */
  speedMultiplier?: number;
  
  /** Whether to use alternative animations */
  useAlternativeAnimations?: boolean;
  
  /** Whether to disable 3D effects */
  disable3DEffects?: boolean;
  
  /** Whether to reduce flashing */
  reduceFlashing?: boolean;
  
  /** Legacy option: Whether to disable parallax effects */
  disableParallax?: boolean;
  
  /** Legacy option: Whether to disable auto-play animations */
  disableAutoPlay?: boolean;
  
  /** Legacy option: Whether to disable background animations */
  disableBackgroundAnimations?: boolean;
  
  /** Legacy option: Whether to disable hover animations */
  disableHoverAnimations?: boolean;
  
  /** Category-specific overrides */
  categorySettings?: Partial<{
    [key in AnimationCategory]?: Partial<{
      enabled: boolean;
      maxComplexity: AnimationComplexity;
      maxDuration: number;
      distanceScale: AnimationDistanceScale;
      speedMultiplier: number;
    }>;
  }>;
}

/**
 * Get the motion sensitivity based on system settings and user preferences
 * with support for fine-grained customization
 * 
 * @param options User sensitivity options or predefined level
 * @returns The appropriate motion sensitivity configuration
 */
export const getMotionSensitivity = (
  options?: MotionSensitivityLevel | MotionSensitivityOptions
): MotionSensitivityConfig => {
  // Check if prefers-reduced-motion is enabled
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Handle case where options is a simple level enum
  if (typeof options === 'string' || options === undefined) {
    const userLevel = options as MotionSensitivityLevel | undefined;
    
    // If user hasn't specified a level but prefers reduced motion, use MEDIUM
    if (!userLevel && prefersReducedMotion) {
      return MOTION_SENSITIVITY_CONFIGS[MotionSensitivityLevel.MEDIUM];
    }
    
    // Use user level or default to NONE
    return MOTION_SENSITIVITY_CONFIGS[userLevel || MotionSensitivityLevel.NONE];
  }
  
  // Handle case where options is a detailed configuration object
  const customOptions = options as MotionSensitivityOptions;
  
  // Get base configuration from level
  const baseLevel = customOptions.level || 
    (prefersReducedMotion && customOptions.respectPrefersReducedMotion !== false 
      ? MotionSensitivityLevel.MEDIUM 
      : MotionSensitivityLevel.NONE);
      
  const baseConfig = { ...MOTION_SENSITIVITY_CONFIGS[baseLevel] };
  
  // Apply custom overrides to base configuration
  if (customOptions.maxAllowedComplexity !== undefined) {
    baseConfig.maxAllowedComplexity = customOptions.maxAllowedComplexity;
  }
  
  if (customOptions.maxAllowedDuration !== undefined) {
    baseConfig.maxAllowedDuration = customOptions.maxAllowedDuration;
  }
  
  if (customOptions.distanceScale !== undefined) {
    baseConfig.distanceScale = customOptions.distanceScale;
  }
  
  if (customOptions.speedMultiplier !== undefined) {
    baseConfig.speedMultiplier = customOptions.speedMultiplier;
  }
  
  if (customOptions.useAlternativeAnimations !== undefined) {
    baseConfig.useAlternativeAnimations = customOptions.useAlternativeAnimations;
  }
  
  if (customOptions.disable3DEffects !== undefined) {
    baseConfig.disable3DEffects = customOptions.disable3DEffects;
  }
  
  if (customOptions.reduceFlashing !== undefined) {
    baseConfig.reduceFlashing = customOptions.reduceFlashing;
  }
  
  if (customOptions.respectPrefersReducedMotion !== undefined) {
    baseConfig.respectPrefersReducedMotion = customOptions.respectPrefersReducedMotion;
  }
  
  // Legacy options
  const legacyOptionsMap = {
    disableParallax: customOptions.disableParallax,
    disableAutoPlay: customOptions.disableAutoPlay,
    disableBackgroundAnimations: customOptions.disableBackgroundAnimations,
    disableHoverAnimations: customOptions.disableHoverAnimations,
  };
  
  Object.entries(legacyOptionsMap).forEach(([key, value]) => {
    if (value !== undefined) {
      (baseConfig as any)[key] = value;
    }
  });
  
  // Apply category-specific overrides
  if (customOptions.categorySettings) {
    Object.entries(customOptions.categorySettings).forEach(([category, settings]) => {
      if (!baseConfig.categorySettings[category as AnimationCategory]) {
        baseConfig.categorySettings[category as AnimationCategory] = { enabled: true };
      }
      
      const categoryConfig = baseConfig.categorySettings[category as AnimationCategory]!;
      
      Object.entries(settings || {}).forEach(([settingKey, settingValue]) => {
        if (settingValue !== undefined) {
          (categoryConfig as any)[settingKey] = settingValue;
        }
      });
    });
  }
  
  return baseConfig;
};

/**
 * Enhanced animation adjustment options
 */
export interface EnhancedAnimationOptions {
  /** Animation duration in ms */
  duration?: number;
  
  /** Animation complexity level */
  complexity?: AnimationComplexity;
  
  /** Whether animation autoplays */
  autoPlay?: boolean;
  
  /** Whether animation is background/decorative */
  isBackground?: boolean;
  
  /** Whether animation is on hover */
  isHover?: boolean;
  
  /** Whether animation is a parallax effect */
  isParallax?: boolean;
  
  /** Animation category */
  category?: AnimationCategory;
  
  /** Animation distance/magnitude */
  distance?: number;
  
  /** CSS transform properties used in the animation */
  transformProperties?: string[];
  
  /** Whether animation uses 3D transformations */
  uses3D?: boolean;
  
  /** Whether animation has flashing content */
  hasFlashing?: boolean;
  
  /** Animation importance (1-10, with 10 being most important) */
  importance?: number;
}

/**
 * Check if an animation complexity is allowed for a given sensitivity level
 * with support for category-specific complexity limits
 * 
 * @param complexity The animation complexity to check
 * @param sensitivity The motion sensitivity configuration
 * @param category Optional animation category
 * @returns Whether the animation complexity is allowed
 */
export const isAnimationComplexityAllowed = (
  complexity: AnimationComplexity,
  sensitivity: MotionSensitivityConfig,
  category?: AnimationCategory
): boolean => {
  // Convert enum values to numbers for comparison
  const complexityValue = Object.values(AnimationComplexity).indexOf(complexity);
  
  // If category is specified, check for category-specific complexity limit
  if (category && sensitivity.categorySettings[category]) {
    const categorySettings = sensitivity.categorySettings[category];
    
    // Check if category is enabled first
    if (categorySettings && categorySettings.enabled === false) {
      return false;
    }
    
    // If category has a specific complexity limit, use that
    if (categorySettings && categorySettings.maxComplexity !== undefined) {
      const categoryMaxValue = Object.values(AnimationComplexity).indexOf(
        categorySettings.maxComplexity
      );
      return complexityValue <= categoryMaxValue;
    }
  }
  
  // Otherwise use global complexity limit
  const maxAllowedValue = Object.values(AnimationComplexity).indexOf(
    sensitivity.maxAllowedComplexity
  );

  return complexityValue <= maxAllowedValue;
};

/**
 * Check if an animation duration is allowed for a given sensitivity level
 * with support for category-specific duration limits
 * 
 * @param duration The animation duration to check (in ms)
 * @param sensitivity The motion sensitivity configuration
 * @param category Optional animation category
 * @returns Whether the animation duration is allowed
 */
export const isAnimationDurationAllowed = (
  duration: number,
  sensitivity: MotionSensitivityConfig,
  category?: AnimationCategory
): boolean => {
  // If category is specified, check for category-specific duration limit
  if (category && sensitivity.categorySettings[category]) {
    const categorySettings = sensitivity.categorySettings[category];
    
    // If category has a specific duration limit, use that
    if (categorySettings && categorySettings.maxDuration !== undefined) {
      return duration <= categorySettings.maxDuration;
    }
  }
  
  // Otherwise use global duration limit
  return duration <= sensitivity.maxAllowedDuration;
};

/**
 * Get distance scale factor for an animation based on sensitivity settings
 * 
 * @param sensitivity The motion sensitivity configuration
 * @param category Optional animation category
 * @returns Distance scale factor (0.0 - 1.0)
 */
export const getDistanceScaleFactor = (
  sensitivity: MotionSensitivityConfig,
  category?: AnimationCategory
): number => {
  // Get the appropriate distance scale
  let distanceScale = sensitivity.distanceScale;
  
  // If category is specified, check for category-specific distance scale
  if (category && sensitivity.categorySettings[category]) {
    const categorySettings = sensitivity.categorySettings[category];
    
    // If category has a specific distance scale, use that
    if (categorySettings && categorySettings.distanceScale !== undefined) {
      distanceScale = categorySettings.distanceScale;
    }
  }
  
  // Convert the distance scale to a numeric factor
  switch (distanceScale) {
    case AnimationDistanceScale.FULL:
      return 1.0;
    case AnimationDistanceScale.LARGE:
      return 0.75;
    case AnimationDistanceScale.MEDIUM:
      return 0.5;
    case AnimationDistanceScale.SMALL:
      return 0.25;
    case AnimationDistanceScale.MINIMAL:
      return 0.1;
    case AnimationDistanceScale.NONE:
      return 0.0;
    default:
      return 1.0;
  }
};

/**
 * Get speed multiplier for an animation based on sensitivity settings
 * 
 * @param sensitivity The motion sensitivity configuration
 * @param category Optional animation category
 * @returns Speed multiplier factor
 */
export const getSpeedMultiplier = (
  sensitivity: MotionSensitivityConfig,
  category?: AnimationCategory
): number => {
  // If category is specified, check for category-specific speed multiplier
  if (category && sensitivity.categorySettings[category]) {
    const categorySettings = sensitivity.categorySettings[category];
    
    // If category has a specific speed multiplier, use that
    if (categorySettings && categorySettings.speedMultiplier !== undefined) {
      return categorySettings.speedMultiplier;
    }
  }
  
  // Otherwise use global speed multiplier
  return sensitivity.speedMultiplier;
};

/**
 * Get adjusted animation parameters based on enhanced motion sensitivity
 * 
 * @param options Original animation options
 * @param sensitivity The motion sensitivity configuration
 * @returns Adjusted animation options
 */
export const getAdjustedAnimation = (
  options: EnhancedAnimationOptions,
  sensitivity: MotionSensitivityConfig
): {
  duration: number;
  shouldAnimate: boolean;
  distanceScale: number;
  speedMultiplier: number;
  shouldUseAlternative: boolean;
} => {
  const {
    duration = 300,
    complexity = AnimationComplexity.STANDARD,
    autoPlay = false,
    isBackground = false,
    isHover = false,
    isParallax = false,
    category,
    uses3D = false,
    hasFlashing = false,
  } = options;

  // Check if animation category is enabled
  if (category && 
      sensitivity.categorySettings[category] && 
      sensitivity.categorySettings[category]?.enabled === false) {
    return {
      duration: 0,
      shouldAnimate: false,
      distanceScale: 0,
      speedMultiplier: 1,
      shouldUseAlternative: true,
    };
  }
  
  // Check for legacy disabling flags
  if (
    (sensitivity.disableAutoPlay && autoPlay) ||
    (sensitivity.disableBackgroundAnimations && isBackground) ||
    (sensitivity.disableHoverAnimations && isHover) ||
    (sensitivity.disableParallax && isParallax) ||
    (sensitivity.disable3DEffects && uses3D) ||
    (sensitivity.reduceFlashing && hasFlashing)
  ) {
    return {
      duration: 0,
      shouldAnimate: false,
      distanceScale: 0,
      speedMultiplier: 1,
      shouldUseAlternative: true,
    };
  }

  // Check if complexity is allowed
  const complexityAllowed = isAnimationComplexityAllowed(
    complexity, 
    sensitivity,
    category as AnimationCategory
  );
  
  if (!complexityAllowed) {
    return {
      duration: 0,
      shouldAnimate: false,
      distanceScale: 0,
      speedMultiplier: 1,
      shouldUseAlternative: true,
    };
  }

  // Check if duration is allowed
  const durationAllowed = isAnimationDurationAllowed(
    duration, 
    sensitivity,
    category as AnimationCategory
  );
  
  if (!durationAllowed) {
    // If duration not allowed, adjust it to maximum allowed
    const maxDuration = category && 
      sensitivity.categorySettings[category]?.maxDuration !== undefined 
        ? sensitivity.categorySettings[category]!.maxDuration! 
        : sensitivity.maxAllowedDuration;
        
    const speedMultiplier = getSpeedMultiplier(sensitivity, category as AnimationCategory);
    
    // Adjust duration with speed multiplier
    const adjustedDuration = Math.min(duration, maxDuration) * speedMultiplier;
    
    return {
      duration: adjustedDuration,
      shouldAnimate: true,
      distanceScale: getDistanceScaleFactor(sensitivity, category as AnimationCategory),
      speedMultiplier: speedMultiplier,
      shouldUseAlternative: sensitivity.useAlternativeAnimations,
    };
  }

  // All checks passed - adjust duration and return
  const speedMultiplier = getSpeedMultiplier(sensitivity, category as AnimationCategory);
  
  // Adjust duration with speed multiplier
  const adjustedDuration = Math.min(duration, sensitivity.maxAllowedDuration) * speedMultiplier;

  return {
    duration: adjustedDuration,
    shouldAnimate: true,
    distanceScale: getDistanceScaleFactor(sensitivity, category as AnimationCategory),
    speedMultiplier: speedMultiplier,
    shouldUseAlternative: sensitivity.useAlternativeAnimations,
  };
};

/**
 * Animation intensity metrics
 */
export interface AnimationIntensityMetrics {
  /** Overall intensity score (0-100) */
  intensity: number;
  
  /** Motion intensity score (0-100) */
  motionIntensity: number;
  
  /** Duration intensity score (0-100) */
  durationIntensity: number;
  
  /** Visual complexity score (0-100) */
  visualComplexity: number;
  
  /** User impact score (0-100) */
  userImpact: number;
  
  /** Recommended motion sensitivity level */
  recommendedLevel: MotionSensitivityLevel;
  
  /** Detailed analysis of the animation */
  analysis: {
    /** Whether the animation uses 3D transforms */
    has3DTransforms: boolean;
    
    /** Whether the animation has rapid movement */
    hasRapidMovement: boolean;
    
    /** Whether the animation has flashing elements */
    hasFlashing: boolean;
    
    /** Whether the animation covers a large area */
    hasLargeArea: boolean;
    
    /** Whether the animation has complex transforms */
    hasComplexTransforms: boolean;
    
    /** Whether the animation has long duration */
    hasLongDuration: boolean;
  };
}

/**
 * Calculate the intensity of an animation to determine appropriate sensitivity levels
 * 
 * @param options Animation properties to analyze
 * @returns Animation intensity metrics
 */
export const calculateAnimationIntensity = (
  options: {
    /** Duration in ms */
    duration?: number;
    
    /** Animation complexity */
    complexity?: AnimationComplexity;
    
    /** Distance of movement in pixels */
    distance?: number;
    
    /** CSS transform properties */
    transformProperties?: string[];
    
    /** Whether the animation plays automatically */
    autoPlay?: boolean;
    
    /** Whether the animation uses 3D transforms */
    uses3D?: boolean;
    
    /** Whether animation has flashing content */
    hasFlashing?: boolean;
    
    /** Area covered by animation as percentage of viewport */
    areaCoverage?: number;
    
    /** Animation frames per second */
    fps?: number;
    
    /** Importance level (1-10) */
    importance?: number;
  }
): AnimationIntensityMetrics => {
  const {
    duration = 300,
    complexity = AnimationComplexity.STANDARD,
    distance = 50,
    transformProperties = [],
    autoPlay = false,
    uses3D = false,
    hasFlashing = false,
    areaCoverage = 10, // percentage of viewport
    fps = 60,
    importance = 5,
  } = options;
  
  // Calculate motion intensity (0-100)
  let motionIntensity = 0;
  
  // Base on complexity
  const complexityValues: Record<AnimationComplexity, number> = {
    [AnimationComplexity.NONE]: 0,
    [AnimationComplexity.MINIMAL]: 10,
    [AnimationComplexity.FADE_ONLY]: 15,
    [AnimationComplexity.BASIC]: 25,
    [AnimationComplexity.RESTRAINED]: 35,
    [AnimationComplexity.STANDARD]: 50,
    [AnimationComplexity.MODERATE]: 60,
    [AnimationComplexity.ENHANCED]: 70,
    [AnimationComplexity.ADVANCED]: 80,
    [AnimationComplexity.COMPLEX]: 90,
    [AnimationComplexity.MAXIMUM]: 100,
  };
  
  motionIntensity += complexityValues[complexity] || 50;
  
  // Factor in distance (higher distance = more intense)
  const distanceFactor = Math.min(1, distance / 300); // Cap at 300px
  motionIntensity += distanceFactor * 20;
  
  // Factor in transform properties
  if (transformProperties.includes('rotate') || 
      transformProperties.includes('rotate3d') ||
      transformProperties.includes('rotateX') ||
      transformProperties.includes('rotateY') ||
      transformProperties.includes('rotateZ')) {
    motionIntensity += 15;
  }
  
  if (transformProperties.includes('scale') || 
      transformProperties.includes('scale3d') ||
      transformProperties.includes('scaleX') ||
      transformProperties.includes('scaleY')) {
    motionIntensity += 10;
  }
  
  if (transformProperties.includes('skew') || 
      transformProperties.includes('skewX') || 
      transformProperties.includes('skewY')) {
    motionIntensity += 15;
  }
  
  if (uses3D || 
      transformProperties.includes('perspective') ||
      transformProperties.includes('translate3d') ||
      transformProperties.includes('scale3d') ||
      transformProperties.includes('rotate3d')) {
    motionIntensity += 20;
  }
  
  // Calculate duration intensity (0-100)
  let durationIntensity = 0;
  
  if (duration <= 100) {
    durationIntensity = 20; // Very quick animations
  } else if (duration <= 300) {
    durationIntensity = 30;
  } else if (duration <= 500) {
    durationIntensity = 40;
  } else if (duration <= 1000) {
    durationIntensity = 60;
  } else if (duration <= 2000) {
    durationIntensity = 80;
  } else {
    durationIntensity = 100; // Very long animations
  }
  
  // Calculate visual complexity (0-100)
  let visualComplexity = complexityValues[complexity] || 50;
  
  // Add for various factors
  if (hasFlashing) {
    visualComplexity += 30;
  }
  
  // Area coverage contributes to visual complexity
  visualComplexity += Math.min(areaCoverage, 100) * 0.3;
  
  // Higher FPS can increase perceived complexity
  visualComplexity += (fps > 30 ? (fps - 30) / 30 * 10 : 0);
  
  // Calculate user impact (0-100)
  let userImpact = 0;
  
  // Auto-playing animations have higher impact
  if (autoPlay) {
    userImpact += 40;
  }
  
  // Higher area coverage = higher impact
  userImpact += Math.min(areaCoverage, 100) * 0.4;
  
  // Longer durations generally mean higher impact
  userImpact += Math.min(duration / 2000 * 30, 30);
  
  // Adjust based on importance (lower importance = potentially lower sensitivity needs)
  userImpact = userImpact * (importance / 5);
  
  // Cap all metrics at 100
  motionIntensity = Math.min(Math.max(0, motionIntensity), 100);
  durationIntensity = Math.min(Math.max(0, durationIntensity), 100);
  visualComplexity = Math.min(Math.max(0, visualComplexity), 100);
  userImpact = Math.min(Math.max(0, userImpact), 100);
  
  // Calculate overall intensity
  const intensity = (
    motionIntensity * 0.4 + 
    durationIntensity * 0.2 + 
    visualComplexity * 0.2 + 
    userImpact * 0.2
  );
  
  // Determine recommended sensitivity level
  let recommendedLevel: MotionSensitivityLevel;
  
  if (intensity >= 90) {
    recommendedLevel = MotionSensitivityLevel.MAXIMUM;
  } else if (intensity >= 80) {
    recommendedLevel = MotionSensitivityLevel.VERY_HIGH;
  } else if (intensity >= 70) {
    recommendedLevel = MotionSensitivityLevel.HIGH;
  } else if (intensity >= 60) {
    recommendedLevel = MotionSensitivityLevel.MEDIUM_HIGH;
  } else if (intensity >= 50) {
    recommendedLevel = MotionSensitivityLevel.MEDIUM;
  } else if (intensity >= 40) {
    recommendedLevel = MotionSensitivityLevel.LOW_MEDIUM;
  } else if (intensity >= 30) {
    recommendedLevel = MotionSensitivityLevel.LOW;
  } else if (intensity >= 20) {
    recommendedLevel = MotionSensitivityLevel.VERY_LOW;
  } else {
    recommendedLevel = MotionSensitivityLevel.NONE;
  }
  
  // Detailed analysis
  const analysis = {
    has3DTransforms: uses3D || 
                    transformProperties.includes('perspective') || 
                    transformProperties.some(p => p.includes('3d')),
    hasRapidMovement: distance > 100 && duration < 500,
    hasFlashing,
    hasLargeArea: areaCoverage > 30,
    hasComplexTransforms: transformProperties.length > 2 || 
                          transformProperties.some(p => p.includes('rotate') || p.includes('skew')),
    hasLongDuration: duration > 1000,
  };
  
  return {
    intensity,
    motionIntensity,
    durationIntensity,
    visualComplexity,
    userImpact,
    recommendedLevel,
    analysis,
  };
};
