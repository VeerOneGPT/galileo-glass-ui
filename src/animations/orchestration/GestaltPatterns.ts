/**
 * Gestalt Animation Patterns
 *
 * Animation patterns based on Gestalt principles of visual perception.
 * These patterns create coordinated animations that feel natural and cohesive.
 */
import { keyframes } from 'styled-components';
import {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  fadeAnimation,
} from '../presets/accessibleAnimations';
import type { AnimationPreset } from '../core/types';

/**
 * Staggered animation options
 */
export interface StaggerOptions {
  /** Base delay between items in milliseconds */
  baseDelay?: number;

  /** Whether to stagger in sequence or from center */
  pattern?: 'sequence' | 'center-out' | 'edges-in';

  /** Easing function for stagger timing */
  staggerEasing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

  /** Maximum stagger delay in milliseconds */
  maxDelay?: number;

  /** Whether to reverse the stagger order */
  reverse?: boolean;
}

/**
 * Staggered sequence options
 */
export interface StaggeredSequenceOptions {
  /** Elements to apply animation to */
  elements: string[] | HTMLElement[];

  /** Animation to apply */
  animation: AnimationPreset;

  /** Delay between elements */
  staggerDelay: number;

  /** Initial delay before first element */
  initialDelay: number;

  /** Additional options */
  options?: Record<string, any>;
}

/**
 * Animation sequence item
 */
export interface AnimationSequenceItem {
  /** Target element selector or reference */
  target: string | HTMLElement;

  /** Animation to apply */
  animation: AnimationPreset;

  /** Delay before this animation in milliseconds */
  delay?: number;

  /** Duration override for this animation */
  duration?: number;

  /** Whether this animation triggers the next one */
  triggers?: boolean;

  /** Custom options for this animation */
  options?: Record<string, any>;
}

/**
 * Gestalt animation patterns based on perceptual principles
 */
export const GestaltPatterns = {
  /**
   * Staggered reveal pattern
   * Items appear with staggered timing to create a sense of order and hierarchy
   */
  staggered: keyframes`
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  /**
   * Unified movement pattern
   * Elements moving together are perceived as a group
   */
  unifiedMovement: keyframes`
    from {
      transform: translateY(20px);
    }
    to {
      transform: translateY(0);
    }
  `,

  /**
   * Common fate pattern
   * Elements that move in the same direction at the same speed are perceived as related
   */
  commonFate: keyframes`
    0% {
      transform: translateX(-10px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  `,

  /**
   * Progressive disclosure pattern
   * Information is revealed gradually to prevent overwhelming the user
   */
  progressiveDisclosure: keyframes`
    from {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
    }
    to {
      max-height: 1000px;
      opacity: 1;
      margin-top: 1rem;
    }
  `,

  /**
   * Focus and blur pattern
   * Focus attention on important elements by blurring others
   */
  focusAndBlur: keyframes`
    from {
      filter: blur(5px);
      opacity: 0.5;
    }
    to {
      filter: blur(0);
      opacity: 1;
    }
  `,

  /**
   * Proximity pattern
   * Items that are close to each other are perceived as a group
   */
  proximity: keyframes`
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,
};

/**
 * Animation preset factory for staggered animations
 * @param index Item index in the collection
 * @param totalItems Total number of items
 * @param baseAnimation Base animation preset to apply
 * @param options Stagger options
 * @returns Modified animation preset with staggered delay
 */
export const createStaggeredAnimation = (
  index: number,
  totalItems: number,
  baseAnimation: AnimationPreset,
  options: StaggerOptions = {}
): AnimationPreset => {
  const {
    baseDelay = 50,
    pattern = 'sequence',
    staggerEasing = 'ease-out',
    maxDelay = 1000,
    reverse = false,
  } = options;

  let delay: number;
  const adjustedIndex = reverse ? totalItems - 1 - index : index;

  // Calculate delay based on pattern
  // Variables for all cases
  let center: number, distanceFromCenter: number, edgeDistance: number;

  switch (pattern) {
    case 'center-out':
      // Items animate outward from the center
      center = Math.floor(totalItems / 2);
      distanceFromCenter = Math.abs(adjustedIndex - center);
      delay = distanceFromCenter * baseDelay;
      break;

    case 'edges-in':
      // Items animate inward from the edges
      edgeDistance = Math.min(adjustedIndex, totalItems - 1 - adjustedIndex);
      delay = edgeDistance * baseDelay;
      break;

    case 'sequence':
    default:
      // Sequential stagger
      delay = adjustedIndex * baseDelay;
      break;
  }

  // Apply easing to the delay
  let easedDelay: number;
  const progress = index / (totalItems - 1 || 1);

  switch (staggerEasing) {
    case 'ease-in':
      easedDelay = delay * (progress * progress);
      break;
    case 'ease-out':
      easedDelay = delay * (1 - Math.pow(1 - progress, 2));
      break;
    case 'ease-in-out':
      easedDelay =
        delay * (progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2);
      break;
    case 'linear':
    default:
      easedDelay = delay;
      break;
  }

  // Ensure delay doesn't exceed maxDelay
  const finalDelay = Math.min(easedDelay, maxDelay);

  // Return modified animation preset
  return {
    ...baseAnimation,
    delay: `${finalDelay}ms`,
  };
};

/**
 * Create an animation sequence
 * @param items Animation sequence items
 * @returns Animation configuration for each target
 */
export const createAnimationSequence = (items: AnimationSequenceItem[]): Record<string, any> => {
  const result: Record<string, any> = {};

  items.forEach((item, index) => {
    const targetKey = typeof item.target === 'string' ? item.target : `element-${index}`;

    result[targetKey] = {
      animation: item.animation,
      delay: item.delay || index * 100,
      duration: item.duration || undefined,
      options: item.options || {},
    };
  });

  return result;
};

/**
 * Coordinated animations for related elements
 */
export const coordinatedAnimations = {
  /**
   * Parent-child relationship
   * Parent animates first, followed by staggered children
   */
  parentChild: {
    parent: {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.standard,
      fillMode: 'both',
      intensity: AnimationIntensity.STANDARD,
    },

    child: {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.standard,
      fillMode: 'both',
      intensity: AnimationIntensity.STANDARD,
    },
  },

  /**
   * Before-after relationship
   * Perfect for showing changes or transformations
   */
  beforeAfter: {
    before: {
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
      duration: animationTimings.normal,
      easing: animationEasings.exit,
      fillMode: 'both',
      intensity: AnimationIntensity.STANDARD,
    },

    after: {
      keyframes: keyframes`
        from {
          opacity: 0;
          transform: scale(1.1);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      `,
      duration: animationTimings.normal,
      easing: animationEasings.enter,
      fillMode: 'both',
      intensity: AnimationIntensity.STANDARD,
    },
  },

  /**
   * Group relationship
   * Elements in a group animate together with slight variations
   */
  group: {
    keyframes: keyframes`
      from {
        opacity: 0;
        transform: translateY(var(--offset, 10px));
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.standard,
    fillMode: 'both',
    intensity: AnimationIntensity.STANDARD,
  },
};

/**
 * Create a staggered sequence for multiple elements
 * @param options Staggered sequence configuration
 * @returns Staggered animation sequence
 */
export const createStaggeredSequence = (options: StaggeredSequenceOptions) => {
  const { elements, animation, staggerDelay, initialDelay, options: additionalOptions } = options;

  return {
    sequences: elements.map((element, i) => ({
      element,
      animation,
      startTime: initialDelay + i * staggerDelay,
      options: additionalOptions,
    })),
  };
};
