/**
 * Animation Mapper
 * 
 * Maps animations to reduced motion alternatives.
 */
import { keyframes, Keyframes } from 'styled-components';
import { AnimationComplexity, MotionSensitivityLevel, getMotionSensitivity } from './MotionSensitivity';
import { presets } from '../presets';
import { AnimationPreset } from '../styled';
import { KeyframeDefinition } from '../types';
import { AnimationMapping } from './AccessibilityTypes';

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
  category?: 'entrance' | 'exit' | 'hover' | 'focus' | 'active' | 'loading' | 'background' | 'feedback';
  
  /** Animation duration to use in ms */
  duration?: number;
}

// Default animation mapping
const DEFAULT_MAPPINGS: AnimationMapping[] = [
  // Fade animations are subtlest, keep them even for higher sensitivity levels
  {
    source: presets.fade,
    alternative: null, // Already subtle enough
    minimumSensitivity: MotionSensitivityLevel.HIGH,
    complexity: AnimationComplexity.MINIMAL,
    category: 'entrance'
  },
  
  // Mapping for slide animations
  {
    source: presets.slideUp,
    alternative: presets.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance'
  },
  {
    source: presets.slideDown,
    alternative: presets.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance'
  },
  {
    source: presets.slideLeft,
    alternative: presets.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance'
  },
  {
    source: presets.slideRight,
    alternative: presets.fade,
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'entrance'
  },
  
  // Glass reveal animations
  {
    source: presets.glassReveal,
    alternative: presets.fade,
    minimumSensitivity: MotionSensitivityLevel.LOW,
    complexity: AnimationComplexity.ENHANCED,
    category: 'entrance'
  },
  
  // Button animations
  {
    source: presets.button.ripple,
    alternative: null, // Disable completely
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'feedback'
  },
  {
    source: presets.button.hover,
    alternative: null, // Disable hover effects
    minimumSensitivity: MotionSensitivityLevel.HIGH,
    complexity: AnimationComplexity.BASIC,
    category: 'hover'
  },
  {
    source: presets.button.press,
    alternative: null, // Disable press animation
    minimumSensitivity: MotionSensitivityLevel.HIGH,
    complexity: AnimationComplexity.BASIC,
    category: 'active'
  },
  
  // Card animations
  {
    source: presets.card.hover,
    alternative: null, // Disable card hover
    minimumSensitivity: MotionSensitivityLevel.MEDIUM,
    complexity: AnimationComplexity.STANDARD,
    category: 'hover'
  },
  {
    source: presets.card.flip,
    alternative: presets.fade, // Replace flip with fade
    minimumSensitivity: MotionSensitivityLevel.LOW,
    complexity: AnimationComplexity.ENHANCED,
    category: 'active'
  },
  {
    source: presets.card.tilt3D,
    alternative: null, // Disable 3D tilt
    minimumSensitivity: MotionSensitivityLevel.LOW,
    complexity: AnimationComplexity.ENHANCED,
    category: 'hover'
  },
  
  // Loading animations should remain unless at maximum sensitivity
  {
    source: presets.button.loading,
    alternative: null, // Keep loading animations
    minimumSensitivity: MotionSensitivityLevel.MAXIMUM,
    complexity: AnimationComplexity.BASIC,
    category: 'loading',
    duration: 1500 // Slow down loading animations
  }
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
    const mapping = this.mappings.find((m) => 
      (m.source === animation || 
       (typeof animation === 'string' && animation === (m.source as AnimationPreset).keyframes.name)) &&
      (category === undefined || m.category === category)
    );
    
    // If no mapping found or sensitivity is lower than required, return original
    if (!mapping || 
        Object.values(MotionSensitivityLevel).indexOf(sensitivityConfig.level) < 
        Object.values(MotionSensitivityLevel).indexOf(mapping.minimumSensitivity)) {
      // Create correct return object based on the type of animation
      const finalDuration = typeof duration === 'number' ? duration : 300;
      
      if (typeof animation === 'string') {
        return {
          animation,
          duration: finalDuration,
          shouldAnimate: true
        };
      } else {
        let animDuration: number = 300;
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
          shouldAnimate: true
        };
      }
    }
    
    // If animation complexity is not allowed, disable animation
    if (!sensitivityConfig.maxAllowedComplexity || 
        Object.values(AnimationComplexity).indexOf(mapping.complexity) > 
        Object.values(AnimationComplexity).indexOf(sensitivityConfig.maxAllowedComplexity)) {
      return {
        animation: null,
        duration: 0,
        shouldAnimate: false
      };
    }
    
    // Return alternative or null if no alternative
    return {
      animation: mapping.alternative,
      duration: mapping.duration || sensitivityConfig.maxAllowedDuration,
      shouldAnimate: mapping.alternative !== null
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