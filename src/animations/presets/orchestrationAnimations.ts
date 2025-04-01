/**
 * Orchestration Animation Presets
 *
 * A comprehensive collection of animation presets for sequencing, state machines,
 * and orchestration using the Galileo Glass UI animation orchestration systems.
 */
import { keyframes } from 'styled-components';
import {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  fadeAnimation,
  slideUpAnimation,
} from './accessibleAnimations';
import type { AnimationPreset } from '../core/types';

// Types for orchestration animation presets
export interface OrchestrationPreset {
  /** Name of the animation pattern */
  name: string;
  
  /** Description of the animation pattern */
  description: string;
  
  /** Animation configurations for each element in the sequence */
  animations: AnimationPreset[];
  
  /** Timing pattern for the animation sequence */
  timing: 'sequential' | 'parallel' | 'staggered' | 'cascade' | 'custom';
  
  /** Delay pattern between elements */
  delayPattern?: 'linear' | 'exponential' | 'logarithmic' | 'custom';
  
  /** Base delay between animations (in ms) */
  baseDelay?: number;

  /** Duration scaling pattern for animations in sequence */
  durationPattern?: 'uniform' | 'decreasing' | 'increasing' | 'custom';
  
  /** Spatial distribution pattern (if applicable) */
  spatialPattern?: 'fromCenter' | 'toCenter' | 'fromLeft' | 'fromRight' | 'fromTop' | 'fromBottom' | 'custom';
}

// Sequenced fade-in animation
export const sequentialFadeInPreset: OrchestrationPreset = {
  name: 'Sequential Fade In',
  description: 'Elements fade in one after another in sequence',
  animations: [
    {
      keyframes: keyframes`
        from { opacity: 0; }
        to { opacity: 1; }
      `,
      duration: animationTimings.fast,
      easing: animationEasings.standard,
      fillMode: 'both',
      intensity: AnimationIntensity.SUBTLE,
    }
  ],
  timing: 'sequential',
  baseDelay: 100,
  delayPattern: 'linear',
  durationPattern: 'uniform',
};

// Staggered slide-in from bottom
export const staggeredSlideInBottomPreset: OrchestrationPreset = {
  name: 'Staggered Slide In Bottom',
  description: 'Elements slide in from bottom with a staggered delay',
  animations: [
    {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.emphasized,
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'staggered',
  baseDelay: 50,
  delayPattern: 'linear',
  durationPattern: 'uniform',
  spatialPattern: 'fromBottom',
};

// Cascade slide-in from left
export const cascadeSlideInLeftPreset: OrchestrationPreset = {
  name: 'Cascade Slide In Left',
  description: 'Elements slide in from left with a cascade effect',
  animations: [
    {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.emphasized,
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'cascade',
  baseDelay: 30,
  delayPattern: 'exponential',
  durationPattern: 'decreasing',
  spatialPattern: 'fromLeft',
};

// Radial expansion from center
export const radialExpansionPreset: OrchestrationPreset = {
  name: 'Radial Expansion',
  description: 'Elements expand outward from the center in a radial pattern',
  animations: [
    {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.emphasized,
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'staggered',
  baseDelay: 40,
  delayPattern: 'linear',
  durationPattern: 'uniform',
  spatialPattern: 'fromCenter',
};

// Wave motion effect
export const waveMotionPreset: OrchestrationPreset = {
  name: 'Wave Motion',
  description: 'Elements animate in a wave-like pattern from left to right',
  animations: [
    {
      keyframes: keyframes`
        0% {
          transform: translateY(0);
          opacity: 0;
        }
        30% {
          transform: translateY(-15px);
          opacity: 1;
        }
        60% {
          transform: translateY(5px);
        }
        100% {
          transform: translateY(0);
        }
      `,
      duration: animationTimings.emphasized,
      easing: animationEasings.standard,
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.EXPRESSIVE,
    }
  ],
  timing: 'staggered',
  baseDelay: 80,
  delayPattern: 'linear',
  durationPattern: 'uniform',
  spatialPattern: 'fromLeft',
};

// Domino effect
export const dominoEffectPreset: OrchestrationPreset = {
  name: 'Domino Effect',
  description: 'Elements fall into place like dominoes',
  animations: [
    {
      keyframes: keyframes`
        0% {
          opacity: 0;
          transform: rotateX(90deg);
          transform-origin: bottom;
        }
        40% {
          transform: rotateX(-15deg);
        }
        70% {
          transform: rotateX(15deg);
        }
        100% {
          opacity: 1;
          transform: rotateX(0deg);
        }
      `,
      duration: animationTimings.emphasized,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.EXPRESSIVE,
    }
  ],
  timing: 'sequential',
  baseDelay: 100,
  delayPattern: 'linear',
  durationPattern: 'uniform',
  spatialPattern: 'fromTop',
};

// State transition - appear
export const stateTransitionAppearPreset: OrchestrationPreset = {
  name: 'State Transition Appear',
  description: 'Smooth transition for elements appearing in a new state',
  animations: [
    {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.emphasized,
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'parallel',
  baseDelay: 0,
  durationPattern: 'uniform',
};

// State transition - disappear
export const stateTransitionDisappearPreset: OrchestrationPreset = {
  name: 'State Transition Disappear',
  description: 'Smooth transition for elements disappearing from current state',
  animations: [
    {
      keyframes: keyframes`
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.9);
        }
      `,
      duration: animationTimings.fast,
      easing: animationEasings.exit,
      fillMode: 'both',
      reducedMotionAlternative: {
        keyframes: keyframes`
          from { opacity: 1; }
          to { opacity: 0; }
        `,
        duration: animationTimings.fast,
        easing: animationEasings.standard,
        fillMode: 'both',
        intensity: AnimationIntensity.SUBTLE,
      },
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'parallel',
  baseDelay: 0,
  durationPattern: 'uniform',
};

// State transition - swap (replacement)
export const stateTransitionSwapPreset: OrchestrationPreset = {
  name: 'State Transition Swap',
  description: 'Coordinated exit/entrance for swapping elements between states',
  animations: [
    // Exit animation
    {
      keyframes: keyframes`
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-20px);
        }
      `,
      duration: animationTimings.fast,
      easing: animationEasings.exit,
      fillMode: 'both',
      reducedMotionAlternative: {
        keyframes: keyframes`
          from { opacity: 1; }
          to { opacity: 0; }
        `,
        duration: animationTimings.fast,
        easing: animationEasings.standard,
        fillMode: 'both',
        intensity: AnimationIntensity.SUBTLE,
      },
      intensity: AnimationIntensity.STANDARD,
    },
    // Enter animation
    {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.enter,
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'sequential',
  baseDelay: 50,
  durationPattern: 'uniform',
};

// Synchronized entrance animations
export const synchronizedEntrancePreset: OrchestrationPreset = {
  name: 'Synchronized Entrance',
  description: 'Multiple elements enter in perfect synchronization',
  animations: [
    {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      `,
      duration: animationTimings.emphasized,
      easing: animationEasings.emphasized,
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'parallel',
  durationPattern: 'uniform',
};

// Typewriter effect for text
export const typewriterEffectPreset: OrchestrationPreset = {
  name: 'Typewriter Effect',
  description: 'Text appears one character at a time like typing',
  animations: [
    {
      keyframes: keyframes`
        from {
          width: 0;
          overflow: hidden;
          white-space: nowrap;
        }
        to {
          width: 100%;
          overflow: visible;
        }
      `,
      duration: animationTimings.pageTransition,
      easing: 'steps(40, end)',
      fillMode: 'both',
      reducedMotionAlternative: fadeAnimation,
      intensity: AnimationIntensity.STANDARD,
    }
  ],
  timing: 'sequential',
  baseDelay: 10,
  delayPattern: 'linear',
  durationPattern: 'uniform',
};

// Collection of all orchestration animation presets
export const orchestrationPresets = {
  sequentialFadeIn: sequentialFadeInPreset,
  staggeredSlideInBottom: staggeredSlideInBottomPreset,
  cascadeSlideInLeft: cascadeSlideInLeftPreset,
  radialExpansion: radialExpansionPreset,
  waveMotion: waveMotionPreset,
  dominoEffect: dominoEffectPreset,
  stateTransitionAppear: stateTransitionAppearPreset,
  stateTransitionDisappear: stateTransitionDisappearPreset,
  stateTransitionSwap: stateTransitionSwapPreset,
  synchronizedEntrance: synchronizedEntrancePreset,
  typewriterEffect: typewriterEffectPreset,
};

/**
 * Helper function to get an orchestration preset's delay for an element at a specific index
 * @param preset Orchestration preset to use
 * @param index Index of the element in the sequence
 * @param total Total number of elements in the sequence
 * @returns Delay in milliseconds
 */
export const getOrchestrationDelay = (
  preset: OrchestrationPreset,
  index: number,
  total: number
): number => {
  if (!preset.baseDelay) {
    return 0;
  }

  const baseDelay = preset.baseDelay;
  
  switch (preset.delayPattern) {
    case 'exponential':
      // Exponential increasing delay (1, 2, 4, 8, ...)
      return baseDelay * Math.pow(1.5, index);
      
    case 'logarithmic':
      // Logarithmic delay (slower start, quicker end)
      return baseDelay * Math.log(index + 2);
      
    case 'custom':
      // For custom delay patterns, you'd implement specific logic here
      return baseDelay * index;
      
    case 'linear':
    default:
      // Linear delay (equal spacing)
      return baseDelay * index;
  }
};

/**
 * Helper function to get an orchestration preset's animation for an element at a specific index
 * @param preset Orchestration preset to use
 * @param index Index of the element in the sequence
 * @returns Animation preset
 */
export const getOrchestrationAnimation = (
  preset: OrchestrationPreset,
  index: number
): AnimationPreset => {
  // If multiple animations in the preset, select based on index or pattern
  if (preset.animations.length > 1) {
    // For swap transitions, even indices get the first animation (exit),
    // odd indices get the second animation (enter)
    if (preset.name === 'State Transition Swap') {
      return preset.animations[index % 2];
    }
    
    // For other multi-animation presets, select based on index
    return preset.animations[index % preset.animations.length];
  }
  
  // Default case: return the single animation
  return preset.animations[0];
};