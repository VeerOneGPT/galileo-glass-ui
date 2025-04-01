/**
 * Comprehensive Animation Presets Library
 *
 * A unified library that combines all animation presets from various systems
 * including basic animations, physics-based animations, orchestrated animations,
 * and gesture-driven animations.
 */

// Import all preset categories
import { 
  animationPresets,
  animationTimings, 
  animationEasings, 
  AnimationIntensity,
  useAccessibleAnimation,
  getAccessibleAnimation,
} from './accessibleAnimations';

import { 
  physicsAnimationPresets, 
  createSpringAnimation, 
  getPhysicsConfig,
  CustomSpringPresets 
} from './physicsAnimations';
import { orchestrationPresets, OrchestrationPreset, getOrchestrationDelay, getOrchestrationAnimation } from './orchestrationAnimations';
import { gestureAnimationPresets, GestureAnimationConfig, createGestureAnimationConfig } from './gestureAnimations';
import { uiAnimations } from './ui';

// Import the core type
import type { AnimationPreset } from '../core/types';

// Import system-specific components needed for the presets
import { PhysicsAnimationMode } from '../physics';
import { GestureAnimationPreset } from '../physics/gestures/GestureAnimation';
import { GestureType } from '../physics/gestures/GestureDetector';

// Unified Animation Presets Library
import { keyframes } from 'styled-components';

/**
 * Unified animation presets combining all categories
 */
export const allAnimationPresets = {
  // Basic animations
  basic: animationPresets,
  
  // UI-specific animations
  ui: uiAnimations,
  
  // Physics-based animations
  physics: physicsAnimationPresets,
  
  // Orchestration animations
  orchestration: orchestrationPresets,
  
  // Gesture-driven animations
  gesture: gestureAnimationPresets,
  
  // Animation timing constants
  timings: animationTimings,
  
  // Animation easing functions
  easings: animationEasings,
  
  // Animation intensity levels
  intensity: AnimationIntensity,
};

/**
 * Animation preset categories
 */
export enum AnimationCategory {
  BASIC = 'basic',
  UI = 'ui',
  PHYSICS = 'physics',
  ORCHESTRATION = 'orchestration',
  GESTURE = 'gesture',
}

/**
 * Helper function to get a preset from any category
 * @param category Animation preset category
 * @param presetName Name of the animation preset
 * @returns The requested animation preset
 */
export function getAnimationPreset(
  category: AnimationCategory, 
  presetName: string
): AnimationPreset | OrchestrationPreset | GestureAnimationConfig | undefined {
  switch (category) {
    case AnimationCategory.BASIC:
      return animationPresets[presetName as keyof typeof animationPresets];
    case AnimationCategory.UI: {
      // Handle UI animations differently as they have a nested structure
      const [section, name] = presetName.includes('.') ? presetName.split('.') : [null, presetName];
      
      if (section && name) {
        // Access nested animation (e.g., "button.hover")
        const sectionAnimations = uiAnimations[section as keyof typeof uiAnimations];
        if (sectionAnimations && typeof sectionAnimations === 'object') {
          return sectionAnimations[name as keyof typeof sectionAnimations] as AnimationPreset;
        }
        return undefined;
      } else {
        // Direct access (e.g., "ripple")
        return uiAnimations[presetName as keyof typeof uiAnimations] as AnimationPreset;
      }
    }
    case AnimationCategory.PHYSICS:
      return physicsAnimationPresets[presetName as keyof typeof physicsAnimationPresets];
    case AnimationCategory.ORCHESTRATION:
      return orchestrationPresets[presetName as keyof typeof orchestrationPresets];
    case AnimationCategory.GESTURE:
      return gestureAnimationPresets[presetName as keyof typeof gestureAnimationPresets];
    default:
      return undefined;
  }
}

/**
 * Get animation preset by its full name, including category
 * @param fullName Full preset name in format "category.presetName"
 * @returns The requested animation preset
 */
export function getPresetByName(fullName: string): AnimationPreset | OrchestrationPreset | GestureAnimationConfig | undefined {
  const [category, presetName] = fullName.split('.');
  
  if (!category || !presetName) {
    return undefined;
  }
  
  return getAnimationPreset(
    category as AnimationCategory,
    presetName
  );
}

/**
 * Physics configuration helpers
 */
export const PhysicsConfig = {
  createSpringAnimation,
  getPhysicsConfig,
  springPresets: CustomSpringPresets,
  animationModes: PhysicsAnimationMode,
};

/**
 * Orchestration helpers
 */
export const OrchestrationConfig = {
  getOrchestrationDelay,
  getOrchestrationAnimation,
};

/**
 * Gesture animation helpers
 */
export const GestureConfig = {
  createGestureAnimationConfig,
  presets: GestureAnimationPreset,
};

// Re-export types and utilities
export type {
  AnimationPreset,
  OrchestrationPreset,
  GestureAnimationConfig,
};

export {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  useAccessibleAnimation,
  getAccessibleAnimation,
};

// Default export of all presets
export default allAnimationPresets;