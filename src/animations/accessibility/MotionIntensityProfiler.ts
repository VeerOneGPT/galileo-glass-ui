/**
 * Motion Intensity Profiler
 * 
 * Advanced system for profiling animation intensity and optimizing animations
 * based on user preferences and device capabilities.
 */
import { Keyframes } from 'styled-components';

import { AnimationPreset } from '../types';
import { AnimationCategory } from './MotionSensitivity';

/**
 * Motion intensity level
 */
export enum MotionIntensityLevel {
  /** No motion at all */
  NONE = 'none',
  
  /** Minimal motion - simple opacity changes only */
  MINIMAL = 'minimal',
  
  /** Low motion - small, simple animations */
  LOW = 'low',
  
  /** Moderate motion - standard UI animations */
  MODERATE = 'moderate',
  
  /** High motion - enhanced animations with effects */
  HIGH = 'high',
  
  /** Very high motion - complex animations with multiple effects */
  VERY_HIGH = 'very_high',
  
  /** Extreme motion - intensive animations with 3D, physics, etc. */
  EXTREME = 'extreme',
}

/**
 * Animation property types for analysis
 */
export enum AnimationPropertyType {
  /** Position changes (translate, top, left, etc.) */
  POSITION = 'position',
  
  /** Scaling transformations */
  SCALE = 'scale',
  
  /** Rotation transformations */
  ROTATION = 'rotation',
  
  /** Opacity changes */
  OPACITY = 'opacity',
  
  /** Color changes */
  COLOR = 'color',
  
  /** Blurring or filter effects */
  FILTER = 'filter',
  
  /** 3D transformations */
  TRANSFORM_3D = 'transform_3d',
  
  /** Perspective changes */
  PERSPECTIVE = 'perspective',
  
  /** Shadow or glow effects */
  SHADOW = 'shadow',
}

/**
 * Motion trigger mechanism
 */
export enum MotionTrigger {
  /** Automatically plays on load/mount */
  AUTO_PLAY = 'auto_play',
  
  /** Triggered by user hover */
  HOVER = 'hover',
  
  /** Triggered by user click/tap */
  CLICK = 'click',
  
  /** Triggered by focus event */
  FOCUS = 'focus',
  
  /** Triggered by scroll position */
  SCROLL = 'scroll',
  
  /** Continuously playing (infinite) */
  CONTINUOUS = 'continuous',
  
  /** Triggered by state change */
  STATE_CHANGE = 'state_change',
}

/**
 * Motion area impact
 */
export enum MotionAreaImpact {
  /** Tiny area, minimal visual impact */
  TINY = 'tiny',        // 0-5% of viewport
  
  /** Small area with limited impact */
  SMALL = 'small',      // 5-15% of viewport
  
  /** Medium sized area with moderate impact */
  MEDIUM = 'medium',    // 15-30% of viewport
  
  /** Large area with significant impact */
  LARGE = 'large',      // 30-60% of viewport
  
  /** Huge area with major visual impact */
  HUGE = 'huge',        // 60-100% of viewport
  
  /** Full screen animation */
  FULL_SCREEN = 'full_screen',
}

/**
 * Motion intensity profile for an animation
 */
export interface MotionIntensityProfile {
  /** Overall intensity level */
  intensityLevel: MotionIntensityLevel;
  
  /** Numerical intensity score (0-100) */
  intensityScore: number;
  
  /** Animation properties being animated */
  properties: AnimationPropertyType[];
  
  /** Duration in milliseconds */
  duration: number;
  
  /** Animation category */
  category: AnimationCategory;
  
  /** Area impact of the animation */
  areaImpact: MotionAreaImpact;
  
  /** Animation trigger mechanism */
  trigger: MotionTrigger;
  
  /** Maximum movement distance in pixels (if applicable) */
  movementDistance?: number;
  
  /** Whether animation uses 3D transformations */
  uses3D: boolean;
  
  /** Whether animation has rapid changes */
  hasRapidChanges: boolean;
  
  /** Whether animation has flashing content */
  hasFlashing: boolean;
  
  /** Whether animation has parallax effects */
  hasParallax: boolean;
  
  /** Component name or animation context */
  context?: string;
  
  /** Importance level (1-10) */
  importance: number;
}

/**
 * Options for profiling an animation
 */
export interface MotionProfilerOptions {
  /** Animation name or identifier */
  name?: string;
  
  /** Animation CSS properties and values */
  properties?: Record<string, string | number>;
  
  /** CSS transform properties */
  transforms?: string[];
  
  /** Animation keyframes or preset */
  keyframes?: Keyframes | AnimationPreset;
  
  /** Animation duration in ms */
  duration?: number;
  
  /** Animation timing function (easing) */
  easing?: string;
  
  /** Animation category */
  category?: AnimationCategory;
  
  /** Animation trigger mechanism */
  trigger?: MotionTrigger;
  
  /** Area impact as percentage of viewport */
  areaImpact?: number;
  
  /** Whether animation uses 3D transformations */
  uses3D?: boolean;
  
  /** Whether animation has flashing content */
  hasFlashing?: boolean;
  
  /** Component name or animation context */
  context?: string;
  
  /** Importance level (1-10) */
  importance?: number;
}

/**
 * Analyzes CSS keyframes to extract motion properties
 * 
 * @param keyframes Keyframes to analyze
 * @returns Extracted properties and metrics
 */
export const analyzeKeyframes = (
  keyframes: Keyframes | AnimationPreset | string
): {
  properties: AnimationPropertyType[];
  movementDistance: number;
  hasRapidChanges: boolean;
  hasFlashing: boolean;
  uses3D: boolean;
} => {
  // Default return values
  const defaultResult = {
    properties: [] as AnimationPropertyType[],
    movementDistance: 0,
    hasRapidChanges: false,
    hasFlashing: false,
    uses3D: false,
  };
  
  // If string name provided, we can't analyze it
  if (typeof keyframes === 'string') {
    return defaultResult;
  }
  
  // Try to get keyframes string
  let keyframesStr: string;
  
  if ('keyframes' in keyframes) {
    // AnimationPreset type
    keyframesStr = keyframes.keyframes.toString();
  } else if ('cssText' in keyframes) {
    // Keyframes object with cssText property
    keyframesStr = (keyframes as any).cssText;
  } else if ('toString' in keyframes) {
    // Generic object with toString method
    keyframesStr = keyframes.toString();
  } else {
    // Can't analyze
    return defaultResult;
  }
  
  // Check for property types
  const properties: AnimationPropertyType[] = [];
  
  // Check for position-related properties
  if (keyframesStr.match(/transform:\s*translate|left|right|top|bottom|margin|padding/i)) {
    properties.push(AnimationPropertyType.POSITION);
  }
  
  // Check for scale-related properties
  if (keyframesStr.match(/transform:\s*scale|width|height|size/i)) {
    properties.push(AnimationPropertyType.SCALE);
  }
  
  // Check for rotation-related properties
  if (keyframesStr.match(/transform:\s*rotate|skew/i)) {
    properties.push(AnimationPropertyType.ROTATION);
  }
  
  // Check for opacity changes
  if (keyframesStr.match(/opacity:/i)) {
    properties.push(AnimationPropertyType.OPACITY);
  }
  
  // Check for color changes
  if (keyframesStr.match(/color:|background-color:|border-color:|fill:|stroke:/i)) {
    properties.push(AnimationPropertyType.COLOR);
  }
  
  // Check for filter effects
  if (keyframesStr.match(/filter:|backdrop-filter:|blur|brightness|contrast|hue-rotate|saturate/i)) {
    properties.push(AnimationPropertyType.FILTER);
  }
  
  // Check for 3D transforms
  const has3D = keyframesStr.match(/transform:\s*(.*)(3d|perspective|rotateX|rotateY|rotateZ|translateZ)/i);
  if (has3D) {
    properties.push(AnimationPropertyType.TRANSFORM_3D);
    properties.push(AnimationPropertyType.PERSPECTIVE);
  }
  
  // Check for shadow effects
  if (keyframesStr.match(/box-shadow:|text-shadow:|drop-shadow/i)) {
    properties.push(AnimationPropertyType.SHADOW);
  }
  
  // Estimate movement distance by looking for translate values
  let movementDistance = 0;
  const translateMatches = keyframesStr.matchAll(/translate\w*\(\s*(-?\d+(?:\.\d+)?)(px|rem|em|%|vw|vh)/gi);
  for (const match of translateMatches) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    // Convert to pixels (rough estimation)
    let pixels = value;
    if (unit === 'rem' || unit === 'em') {
      pixels = value * 16; // Assume 1rem = 16px
    } else if (unit === '%') {
      pixels = value * 3; // Rough estimate: 100% = 300px
    } else if (unit === 'vw') {
      pixels = value * 10; // Rough estimate: 100vw = 1000px
    } else if (unit === 'vh') {
      pixels = value * 6; // Rough estimate: 100vh = 600px
    }
    
    movementDistance = Math.max(movementDistance, Math.abs(pixels));
  }
  
  // Check for rapid changes by looking for multiple keyframe stops
  const keyframeStops = keyframesStr.match(/(from|to|\d+%)/g);
  const hasRapidChanges = keyframeStops ? keyframeStops.length > 3 : false;
  
  // Check for flashing by looking for rapid opacity or visibility changes
  const hasFlashing = keyframesStr.match(/opacity:\s*0|opacity:\s*1|visibility:\s*hidden|visibility:\s*visible/gi) !== null && hasRapidChanges;
  
  return {
    properties,
    movementDistance,
    hasRapidChanges,
    hasFlashing,
    uses3D: has3D !== null,
  };
};

/**
 * Estimate area impact based on element size
 * 
 * @param element Element to measure or size object
 * @returns Area impact category
 */
export const estimateAreaImpact = (
  element: HTMLElement | { width: number; height: number } | number
): MotionAreaImpact => {
  let area = 0;
  
  if (typeof element === 'number') {
    // Direct percentage value
    area = element;
  } else if ('width' in element && 'height' in element) {
    // Size object
    const { width, height } = element;
    
    // Calculate percentage of viewport
    if (typeof window !== 'undefined') {
      const viewportArea = window.innerWidth * window.innerHeight;
      area = (width * height) / viewportArea * 100;
    } else {
      // Fallback if window not available
      area = 15; // Assume medium area
    }
  } else {
    // HTML element
    const rect = element.getBoundingClientRect();
    
    // Calculate percentage of viewport
    if (typeof window !== 'undefined') {
      const viewportArea = window.innerWidth * window.innerHeight;
      area = (rect.width * rect.height) / viewportArea * 100;
    } else {
      // Fallback if window not available
      area = 15; // Assume medium area
    }
  }
  
  // Determine area impact category based on percentage
  if (area < 5) {
    return MotionAreaImpact.TINY;
  } else if (area < 15) {
    return MotionAreaImpact.SMALL;
  } else if (area < 30) {
    return MotionAreaImpact.MEDIUM;
  } else if (area < 60) {
    return MotionAreaImpact.LARGE;
  } else if (area < 90) {
    return MotionAreaImpact.HUGE;
  } else {
    return MotionAreaImpact.FULL_SCREEN;
  }
};

/**
 * Calculate motion intensity score from properties and metrics
 * 
 * @param options Profiler options
 * @param analysis Keyframe analysis results
 * @returns Intensity score (0-100)
 */
export const calculateIntensityScore = (
  options: MotionProfilerOptions,
  analysis: ReturnType<typeof analyzeKeyframes>
): number => {
  let score = 0;
  
  // Base score based on animation properties
  const propertyScores: Record<AnimationPropertyType, number> = {
    [AnimationPropertyType.OPACITY]: 5,
    [AnimationPropertyType.COLOR]: 10,
    [AnimationPropertyType.POSITION]: 20,
    [AnimationPropertyType.SCALE]: 15,
    [AnimationPropertyType.ROTATION]: 25,
    [AnimationPropertyType.FILTER]: 20,
    [AnimationPropertyType.SHADOW]: 15,
    [AnimationPropertyType.TRANSFORM_3D]: 35,
    [AnimationPropertyType.PERSPECTIVE]: 30,
  };
  
  // Add scores for each property type
  for (const property of analysis.properties) {
    score += propertyScores[property] || 0;
  }
  
  // Adjust based on duration
  const duration = options.duration || 300;
  if (duration < 150) {
    // Very fast animations can be more disorienting
    score += 10;
  } else if (duration > 1000) {
    // Long animations generally feel less intense
    score -= 10;
  }
  
  // Adjust based on distance
  if (analysis.movementDistance > 100) {
    score += 15;
  } else if (analysis.movementDistance > 50) {
    score += 10;
  } else if (analysis.movementDistance > 25) {
    score += 5;
  }
  
  // Adjust based on area impact
  const areaImpactScores: Record<MotionAreaImpact, number> = {
    [MotionAreaImpact.TINY]: 0,
    [MotionAreaImpact.SMALL]: 5,
    [MotionAreaImpact.MEDIUM]: 15,
    [MotionAreaImpact.LARGE]: 25,
    [MotionAreaImpact.HUGE]: 35,
    [MotionAreaImpact.FULL_SCREEN]: 50,
  };
  
  // Calculate area impact
  if (options.areaImpact !== undefined) {
    const areaCategory = estimateAreaImpact(options.areaImpact);
    score += areaImpactScores[areaCategory];
  }
  
  // Additional factors
  if (analysis.hasRapidChanges) {
    score += 15;
  }
  
  if (analysis.hasFlashing) {
    score += 25;
  }
  
  if (analysis.uses3D || options.uses3D) {
    score += 20;
  }
  
  // Adjust based on trigger mechanism
  if (options.trigger) {
    const triggerScores: Record<MotionTrigger, number> = {
      [MotionTrigger.AUTO_PLAY]: 15,
      [MotionTrigger.CONTINUOUS]: 25,
      [MotionTrigger.SCROLL]: 10,
      [MotionTrigger.HOVER]: 5,
      [MotionTrigger.CLICK]: 0,
      [MotionTrigger.FOCUS]: 5,
      [MotionTrigger.STATE_CHANGE]: 10,
    };
    
    score += triggerScores[options.trigger];
  }
  
  // Ensure score is within bounds
  return Math.min(Math.max(0, score), 100);
};

/**
 * Determine intensity level from score
 * 
 * @param score Intensity score (0-100)
 * @returns Intensity level
 */
export const determineIntensityLevel = (score: number): MotionIntensityLevel => {
  if (score === 0) {
    return MotionIntensityLevel.NONE;
  } else if (score < 10) {
    return MotionIntensityLevel.MINIMAL;
  } else if (score < 30) {
    return MotionIntensityLevel.LOW;
  } else if (score < 50) {
    return MotionIntensityLevel.MODERATE;
  } else if (score < 70) {
    return MotionIntensityLevel.HIGH;
  } else if (score < 90) {
    return MotionIntensityLevel.VERY_HIGH;
  } else {
    return MotionIntensityLevel.EXTREME;
  }
};

/**
 * Generate a complete motion intensity profile for an animation
 * 
 * @param options Animation properties and options
 * @returns Complete motion intensity profile
 */
export const profileAnimation = (options: MotionProfilerOptions): MotionIntensityProfile => {
  // Default values
  const defaults = {
    name: 'Unknown Animation',
    duration: 300,
    category: AnimationCategory.ENTRANCE,
    trigger: MotionTrigger.AUTO_PLAY,
    areaImpact: 15, // Assume medium area by default
    importance: 5,
  };
  
  // Merge with defaults
  const mergedOptions = { ...defaults, ...options };
  
  // Analyze keyframes if provided
  const analysis = mergedOptions.keyframes
    ? analyzeKeyframes(mergedOptions.keyframes)
    : {
        properties: [] as AnimationPropertyType[],
        movementDistance: 0,
        hasRapidChanges: false,
        hasFlashing: false,
        uses3D: false,
      };
  
  // Add properties from CSS values if provided
  if (mergedOptions.properties) {
    for (const [property, value] of Object.entries(mergedOptions.properties)) {
      // Analyze CSS property
      if (property.includes('transform')) {
        if (String(value).includes('translate')) {
          analysis.properties.push(AnimationPropertyType.POSITION);
        }
        if (String(value).includes('scale')) {
          analysis.properties.push(AnimationPropertyType.SCALE);
        }
        if (String(value).includes('rotate')) {
          analysis.properties.push(AnimationPropertyType.ROTATION);
        }
        if (String(value).includes('3d') || String(value).includes('perspective')) {
          analysis.properties.push(AnimationPropertyType.TRANSFORM_3D);
          analysis.uses3D = true;
        }
      } else if (property.includes('opacity')) {
        analysis.properties.push(AnimationPropertyType.OPACITY);
      } else if (property.includes('color')) {
        analysis.properties.push(AnimationPropertyType.COLOR);
      } else if (property.includes('filter')) {
        analysis.properties.push(AnimationPropertyType.FILTER);
      } else if (property.includes('shadow')) {
        analysis.properties.push(AnimationPropertyType.SHADOW);
      }
    }
  }
  
  // Add properties from transform list if provided
  if (mergedOptions.transforms) {
    for (const transform of mergedOptions.transforms) {
      if (transform.includes('translate')) {
        analysis.properties.push(AnimationPropertyType.POSITION);
      }
      if (transform.includes('scale')) {
        analysis.properties.push(AnimationPropertyType.SCALE);
      }
      if (transform.includes('rotate')) {
        analysis.properties.push(AnimationPropertyType.ROTATION);
      }
      if (transform.includes('3d') || transform.includes('perspective')) {
        analysis.properties.push(AnimationPropertyType.TRANSFORM_3D);
        analysis.uses3D = true;
      }
    }
  }
  
  // Remove duplicate properties
  analysis.properties = [...new Set(analysis.properties)];
  
  // Calculate area impact
  const areaImpact = estimateAreaImpact(mergedOptions.areaImpact);
  
  // Calculate intensity score
  const intensityScore = calculateIntensityScore(mergedOptions, analysis);
  
  // Determine intensity level
  const intensityLevel = determineIntensityLevel(intensityScore);
  
  // Return complete profile
  return {
    intensityLevel,
    intensityScore,
    properties: analysis.properties,
    duration: mergedOptions.duration,
    category: mergedOptions.category,
    areaImpact,
    trigger: mergedOptions.trigger,
    movementDistance: analysis.movementDistance,
    uses3D: analysis.uses3D || mergedOptions.uses3D || false,
    hasRapidChanges: analysis.hasRapidChanges,
    hasFlashing: analysis.hasFlashing || mergedOptions.hasFlashing || false,
    hasParallax: analysis.uses3D || false,
    context: mergedOptions.context,
    importance: mergedOptions.importance,
  };
};

/**
 * Motion intensity profiler singleton for managing profiles across the application
 */
export class MotionIntensityProfiler {
  private static instance: MotionIntensityProfiler;
  private profiles: Map<string, MotionIntensityProfile> = new Map();
  
  /**
   * Create a new motion intensity profiler
   */
  private constructor() {}
  
  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): MotionIntensityProfiler {
    if (!MotionIntensityProfiler.instance) {
      MotionIntensityProfiler.instance = new MotionIntensityProfiler();
    }
    
    return MotionIntensityProfiler.instance;
  }
  
  /**
   * Register an animation with the profiler
   * 
   * @param id Unique animation identifier
   * @param options Animation properties and options
   * @returns Motion intensity profile
   */
  public registerAnimation(id: string, options: MotionProfilerOptions): MotionIntensityProfile {
    // Generate profile
    const profile = profileAnimation(options);
    
    // Store profile
    this.profiles.set(id, profile);
    
    return profile;
  }
  
  /**
   * Get a profile by ID
   * 
   * @param id Animation identifier
   * @returns Motion intensity profile or undefined if not found
   */
  public getProfile(id: string): MotionIntensityProfile | undefined {
    return this.profiles.get(id);
  }
  
  /**
   * Get all registered profiles
   * 
   * @returns Map of all profiles
   */
  public getAllProfiles(): Map<string, MotionIntensityProfile> {
    return new Map(this.profiles);
  }
  
  /**
   * Get profiles matching certain criteria
   * 
   * @param criteria Filter criteria
   * @returns Filtered profiles
   */
  public getFilteredProfiles(
    criteria: Partial<MotionIntensityProfile>
  ): Map<string, MotionIntensityProfile> {
    const filtered = new Map();
    
    for (const [id, profile] of this.profiles.entries()) {
      let match = true;
      
      for (const [key, value] of Object.entries(criteria)) {
        if (profile[key as keyof MotionIntensityProfile] !== value) {
          match = false;
          break;
        }
      }
      
      if (match) {
        filtered.set(id, profile);
      }
    }
    
    return filtered;
  }
  
  /**
   * Calculate overall motion intensity across all registered animations
   * 
   * @returns Overall intensity metrics
   */
  public calculateOverallIntensity(): {
    averageScore: number;
    maxScore: number;
    totalAnimations: number;
    countByLevel: Record<MotionIntensityLevel, number>;
    countByCategory: Record<AnimationCategory, number>;
  } {
    let totalScore = 0;
    let maxScore = 0;
    const countByLevel: Record<MotionIntensityLevel, number> = {
      [MotionIntensityLevel.NONE]: 0,
      [MotionIntensityLevel.MINIMAL]: 0,
      [MotionIntensityLevel.LOW]: 0,
      [MotionIntensityLevel.MODERATE]: 0,
      [MotionIntensityLevel.HIGH]: 0,
      [MotionIntensityLevel.VERY_HIGH]: 0,
      [MotionIntensityLevel.EXTREME]: 0,
    };
    
    const countByCategory: Record<AnimationCategory, number> = {
      [AnimationCategory.ESSENTIAL]: 0,
      [AnimationCategory.ENTRANCE]: 0,
      [AnimationCategory.EXIT]: 0,
      [AnimationCategory.HOVER]: 0,
      [AnimationCategory.FOCUS]: 0,
      [AnimationCategory.ACTIVE]: 0,
      [AnimationCategory.LOADING]: 0,
      [AnimationCategory.BACKGROUND]: 0,
      [AnimationCategory.SCROLL]: 0,
      [AnimationCategory.ATTENTION]: 0,
    };
    
    for (const profile of this.profiles.values()) {
      totalScore += profile.intensityScore;
      maxScore = Math.max(maxScore, profile.intensityScore);
      countByLevel[profile.intensityLevel]++;
      countByCategory[profile.category]++;
    }
    
    return {
      averageScore: this.profiles.size > 0 ? totalScore / this.profiles.size : 0,
      maxScore,
      totalAnimations: this.profiles.size,
      countByLevel,
      countByCategory,
    };
  }
  
  /**
   * Find all animations exceeding a certain intensity threshold
   * 
   * @param threshold Intensity score threshold
   * @returns Map of animations exceeding threshold
   */
  public findIntenseAnimations(threshold: number): Map<string, MotionIntensityProfile> {
    const intense = new Map();
    
    for (const [id, profile] of this.profiles.entries()) {
      if (profile.intensityScore >= threshold) {
        intense.set(id, profile);
      }
    }
    
    return intense;
  }
  
  /**
   * Clear all registered profiles
   */
  public clearProfiles(): void {
    this.profiles.clear();
  }
}

/**
 * Get an instance of the motion intensity profiler
 * @returns Motion intensity profiler instance
 */
export const getMotionProfiler = (): MotionIntensityProfiler => {
  return MotionIntensityProfiler.getInstance();
};