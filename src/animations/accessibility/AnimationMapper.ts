/**
 * Animation Mapper
 *
 * Maps animations to reduced motion alternatives.
 */
import { Keyframes } from 'styled-components';

// Import each animation preset individually to avoid importing the entire presets object
import { 
  fadeIn, 
  fadeOut, 
  glassFadeIn, 
  glassFadeOut 
} from '../keyframes/basic';

// Import animation presets
import { presets } from '../presets';

// Define basic animations for alternatives
const basicAnimations = {
  fade: {
    keyframes: fadeIn,
    duration: '300ms',
    easing: 'ease-in-out'
  }
};
import { AnimationPreset } from '../core/types';

import { AnimationMapping } from './AccessibilityTypes';
import {
  AnimationComplexity,
  MotionSensitivityLevel,
  getMotionSensitivity,
} from './MotionSensitivity';

/**
 * Animation mapping configuration
 */
export interface AnimationMapperConfig {
  /** Source animation to be replaced */
  source: AnimationPreset | Keyframes | string;

  /** Reduced motion alternative */
  alternative: AnimationPreset | Keyframes | null;

  /** Minimum sensitivity level required for this replacement */
  minimumSensitivity: MotionSensitivityLevel;

  /** Animation complexity */
  complexity: AnimationComplexity;

  /** Animation category */
  category?:
    | 'entrance'
    | 'exit'
    | 'hover'
    | 'focus'
    | 'active'
    | 'loading'
    | 'background'
    | 'feedback';

  /** Animation duration to use in ms */
  duration?: number;
}

// Default animation mapping
const DEFAULT_MAPPINGS: AnimationMapping[] = [
  // Fade animations are subtlest, keep them even for higher sensitivity levels
  {
    source: basicAnimations.fade,
    alternative: null, // Already subtle enough
    minimumSensitivity: MotionSensitivityLevel.HIGH,
    complexity: AnimationComplexity.MINIMAL,
    category: 'entrance',
  },

  // Mapping for slide animations
  {
    source: null, // Will be defined at runtime
    alternative: basicAnimations.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance',
  },
  {
    source: null, // Will be defined at runtime
    alternative: basicAnimations.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance',
  },
  {
    source: null, // Will be defined at runtime
    alternative: basicAnimations.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance',
  },
  {
    source: null, // Will be defined at runtime
    alternative: basicAnimations.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance',
  },

  // Glass reveal animations
  {
    source: null, // Will be defined at runtime
    alternative: basicAnimations.fade,
    minimumSensitivity: MotionSensitivityLevel.LOW,
    complexity: AnimationComplexity.ENHANCED,
    category: 'entrance',
  },

  // Button animations
  {
    source: presets.ui.button.ripple,
    alternative: null, // Disable completely
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.ENHANCED,
    category: 'hover',
  },
  {
    source: presets.ui.button.hover,
    alternative: null, // Disable hover effects
    minimumSensitivity: MotionSensitivityLevel.HIGH,
    complexity: AnimationComplexity.STANDARD,
    category: 'hover',
  },
  {
    source: presets.ui.button.press,
    alternative: null, // Disable press animation
    minimumSensitivity: MotionSensitivityLevel.HIGH,
    complexity: AnimationComplexity.BASIC,
    category: 'active',
  },

  // Card animations
  {
    source: presets.ui.card.hover,
    alternative: null, // Disable card hover
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'hover',
  },
  {
    source: presets.ui.card.flip,
    alternative: presets.basic.fade, // Replace flip with fade
    minimumSensitivity: MotionSensitivityLevel.LOW,
    complexity: AnimationComplexity.ENHANCED,
    category: 'active',
  },
  {
    source: presets.ui.card.tilt3D,
    alternative: null, // Disable 3D tilt
    minimumSensitivity: MotionSensitivityLevel.LOW,
    complexity: AnimationComplexity.COMPLEX,
    category: 'hover',
  },

  // Loading animations should remain unless at maximum sensitivity
  {
    source: presets.ui.button.loading,
    alternative: null, // Keep loading animations
    minimumSensitivity: MotionSensitivityLevel.MAXIMUM,
    complexity: AnimationComplexity.BASIC,
    category: 'loading',
  },
];

/**
 * Animation mapper class
 */
export class AnimationMapper {
  private mappings: AnimationMapping[] = [];

  /**
   * Create a new animation mapper
   * @param customMappings Optional custom mappings to add
   */
  constructor(customMappings: AnimationMapping[] = []) {
    this.mappings = [...DEFAULT_MAPPINGS, ...customMappings];
  }

  /**
   * Add a new mapping
   * @param mapping The mapping to add
   */
  addMapping(mapping: AnimationMapping): void {
    this.mappings.push(mapping);
  }

  /**
   * Get appropriate animation based on sensitivity
   * @param animation The original animation
   * @param options Additional options
   * @returns The appropriate animation and duration
   */
  getAccessibleAnimation(
    animation: AnimationPreset | Keyframes | string,
    options?: {
      sensitivity?: MotionSensitivityLevel;
      category?: string;
      duration?: number;
    }
  ): {
    animation: AnimationPreset | Keyframes | string | null;
    duration: number;
    shouldAnimate: boolean;
  } {
    const { sensitivity: userSensitivity, category, duration } = options || {};

    // Get the motion sensitivity configuration
    const sensitivityConfig = getMotionSensitivity(userSensitivity);

    // Find matching mapping
    const mapping = this.mappings.find(
      m =>
        (m.source === animation ||
          (typeof animation === 'string' &&
            typeof (m.source as AnimationPreset).keyframes !== 'string' &&
            (m.source as AnimationPreset).keyframes &&
            animation === ((m.source as AnimationPreset).keyframes as Keyframes).name)) &&
        (category === undefined || m.category === category)
    );

    // If no mapping found or sensitivity is lower than required, return original
    if (
      !mapping ||
      Object.values(MotionSensitivityLevel).indexOf(sensitivityConfig.level) <
        Object.values(MotionSensitivityLevel).indexOf(mapping.minimumSensitivity)
    ) {
      // Create correct return object based on the type of animation
      const finalDuration = typeof duration === 'number' ? duration : 300;

      if (typeof animation === 'string') {
        return {
          animation,
          duration: finalDuration,
          shouldAnimate: true,
        };
      } else {
        let animDuration = 300;
        const presetDuration = (animation as AnimationPreset).duration;

        if (typeof presetDuration === 'string') {
          // Try to extract ms value from string like "300ms" or "0.3s"
          if (presetDuration.endsWith('ms')) {
            animDuration = parseInt(presetDuration, 10) || 300;
          } else if (presetDuration.endsWith('s')) {
            const seconds = parseFloat(presetDuration) || 0.3;
            animDuration = seconds * 1000;
          } else {
            // Try parsing as plain number
            animDuration = parseInt(presetDuration, 10) || 300;
          }
        } else if (typeof presetDuration === 'number') {
          animDuration = presetDuration;
        }

        return {
          animation,
          duration: finalDuration || animDuration,
          shouldAnimate: true,
        };
      }
    }

    // If animation complexity is not allowed, disable animation
    if (
      !sensitivityConfig.maxAllowedComplexity ||
      Object.values(AnimationComplexity).indexOf(mapping.complexity) >
        Object.values(AnimationComplexity).indexOf(sensitivityConfig.maxAllowedComplexity)
    ) {
      return {
        animation: null,
        duration: 0,
        shouldAnimate: false,
      };
    }

    // Return alternative or null if no alternative
    return {
      animation: mapping.alternative,
      duration: mapping.duration || sensitivityConfig.maxAllowedDuration,
      shouldAnimate: mapping.alternative !== null,
    };
  }

  /**
   * Get all mappings
   * @returns All registered mappings
   */
  getAllMappings(): AnimationMapping[] {
    return [...this.mappings];
  }

  /**
   * Clear all mappings
   */
  clearMappings(): void {
    this.mappings = [];
  }

  /**
   * Reset to default mappings
   */
  resetToDefaults(): void {
    this.mappings = [...DEFAULT_MAPPINGS];
  }
}

// Create and export default mapper instance
export const animationMapper = new AnimationMapper();
