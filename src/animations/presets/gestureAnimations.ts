/**
 * Gesture-Driven Animation Presets
 *
 * A comprehensive collection of animation presets using gesture-based interactions
 * from the Galileo Glass UI animation system.
 */
import { keyframes } from 'styled-components';
import { GestureAnimationPreset } from '../physics/gestures/GestureAnimation';
import { GestureType } from '../physics/gestures/GestureDetector';

import {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  AnimationPreset,
  fadeAnimation,
} from './accessibleAnimations';

// Gesture animation configuration type
export interface GestureAnimationConfig {
  /** Display name of the preset */
  name: string;
  
  /** Description of the gesture animation */
  description: string;
  
  /** Suitable gesture types for this animation */
  gestures: GestureType[];
  
  /** Base animation preset for non-interactive state */
  baseAnimation: AnimationPreset;
  
  /** Animation preset when gesture starts */
  gestureStartAnimation?: AnimationPreset;
  
  /** Animation preset during gesture */
  gestureDuringAnimation?: AnimationPreset;
  
  /** Animation preset when gesture ends */
  gestureEndAnimation?: AnimationPreset;
  
  /** Internal physics preset to use */
  physicsPreset: GestureAnimationPreset;
  
  /** Parameters for physics calculations */
  physicsParams?: {
    tension?: number;
    friction?: number;
    mass?: number;
    velocityScale?: number;
    deceleration?: number;
  };
  
  /** Default transform constraints */
  constraints?: {
    allowTranslateX?: boolean;
    allowTranslateY?: boolean;
    allowScale?: boolean;
    allowRotate?: boolean;
    boundaries?: {
      x?: { min?: number; max?: number };
      y?: { min?: number; max?: number };
      scale?: { min?: number; max?: number };
      rotation?: { min?: number; max?: number };
    };
  };
  
  /** Motion intensity level */
  intensity: AnimationIntensity;
}

// Drag with inertia preset
export const dragWithInertiaPreset: GestureAnimationConfig = {
  name: 'Drag with Inertia',
  description: 'Draggable element with natural inertia and momentum',
  gestures: [GestureType.PAN, GestureType.SWIPE],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: scale(1); }
      to { transform: scale(1); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureStartAnimation: {
    keyframes: keyframes`
      from { transform: scale(1); filter: brightness(1); }
      to { transform: scale(1.02); filter: brightness(1.1); }
    `,
    duration: animationTimings.fast,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  gestureDuringAnimation: {
    keyframes: keyframes`
      from { box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
      to { box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { transform: scale(1.02); filter: brightness(1.1); }
      to { transform: scale(1); filter: brightness(1); }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  physicsPreset: GestureAnimationPreset.INERTIAL_SLIDE,
  physicsParams: {
    friction: 14,
    tension: 180,
    mass: 1,
    velocityScale: 1.2,
    deceleration: 0.95,
  },
  constraints: {
    allowTranslateX: true,
    allowTranslateY: true,
    allowScale: false,
    allowRotate: false,
  },
  intensity: AnimationIntensity.STANDARD,
};

// Pinch zoom preset
export const pinchZoomPreset: GestureAnimationConfig = {
  name: 'Pinch Zoom',
  description: 'Pinch to zoom with natural spring physics',
  gestures: [GestureType.PINCH],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: scale(1); }
      to { transform: scale(1); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { filter: brightness(1.05); }
      to { filter: brightness(1); }
    `,
    duration: animationTimings.fast,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  physicsPreset: GestureAnimationPreset.PINCH_ZOOM,
  physicsParams: {
    tension: 200,
    friction: 20,
    mass: 1,
  },
  constraints: {
    allowTranslateX: false,
    allowTranslateY: false,
    allowScale: true,
    allowRotate: false,
    boundaries: {
      scale: { min: 0.5, max: 3 }
    }
  },
  intensity: AnimationIntensity.STANDARD,
};

// Rotation gesture preset
export const rotationPreset: GestureAnimationConfig = {
  name: 'Rotation',
  description: 'Rotate with two-finger gesture and spring physics',
  gestures: [GestureType.ROTATE],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: rotate(0deg); }
      to { transform: rotate(0deg); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { filter: brightness(1.05); }
      to { filter: brightness(1); }
    `,
    duration: animationTimings.fast,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  physicsPreset: GestureAnimationPreset.ROTATION_SPIN,
  physicsParams: {
    tension: 80,
    friction: 12,
    mass: 1,
  },
  constraints: {
    allowTranslateX: false,
    allowTranslateY: false,
    allowScale: false,
    allowRotate: true,
    boundaries: {
      rotation: { min: -180, max: 180 }
    }
  },
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Swipe to dismiss preset
export const swipeToDismissPreset: GestureAnimationConfig = {
  name: 'Swipe to Dismiss',
  description: 'Swipe element off-screen with natural physics',
  gestures: [GestureType.SWIPE, GestureType.PAN],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(0); opacity: 1; }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureDuringAnimation: {
    keyframes: keyframes`
      from { opacity: 1; }
      to { opacity: var(--opacity, 0.5); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { transform: translateX(var(--x, 100%)); opacity: var(--opacity, 0); }
      to { transform: translateX(var(--x, 100%)); opacity: var(--opacity, 0); }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  physicsPreset: GestureAnimationPreset.MOMENTUM_FLICK,
  physicsParams: {
    tension: 100,
    friction: 10,
    velocityScale: 2,
    deceleration: 0.9,
  },
  constraints: {
    allowTranslateX: true,
    allowTranslateY: false,
    allowScale: false,
    allowRotate: false,
  },
  intensity: AnimationIntensity.STANDARD,
};

// Pull to refresh preset
export const pullToRefreshPreset: GestureAnimationConfig = {
  name: 'Pull to Refresh',
  description: 'Pull down with resistance and bounce back',
  gestures: [GestureType.PAN],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: translateY(0); }
      to { transform: translateY(0); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { transform: translateY(var(--y, 0)); }
      to { transform: translateY(0); }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  physicsPreset: GestureAnimationPreset.ELASTIC_DRAG,
  physicsParams: {
    tension: 400,
    friction: 30,
    mass: 1,
  },
  constraints: {
    allowTranslateX: false,
    allowTranslateY: true,
    allowScale: false,
    allowRotate: false,
    boundaries: {
      y: { min: -100, max: 0 }
    }
  },
  intensity: AnimationIntensity.STANDARD,
};

// Magnetic snap preset
export const magneticSnapPreset: GestureAnimationConfig = {
  name: 'Magnetic Snap',
  description: 'Drag element that snaps to predefined points',
  gestures: [GestureType.PAN, GestureType.SWIPE],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: translate(0, 0); }
      to { transform: translate(0, 0); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureStartAnimation: {
    keyframes: keyframes`
      from { transform: scale(1); }
      to { transform: scale(1.05); }
    `,
    duration: animationTimings.fast,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { transform: scale(1.05); }
      to { transform: scale(1); }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  physicsPreset: GestureAnimationPreset.MAGNETIC_SNAP,
  physicsParams: {
    tension: 400,
    friction: 20,
    mass: 1,
  },
  constraints: {
    allowTranslateX: true,
    allowTranslateY: true,
    allowScale: false,
    allowRotate: false,
  },
  intensity: AnimationIntensity.STANDARD,
};

// Tilt on drag preset
export const tiltOnDragPreset: GestureAnimationConfig = {
  name: 'Tilt on Drag',
  description: 'Card that tilts in the direction of drag',
  gestures: [GestureType.PAN],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: rotate3d(0, 0, 0, 0deg); }
      to { transform: rotate3d(0, 0, 0, 0deg); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureDuringAnimation: {
    keyframes: keyframes`
      from { transform: perspective(1000px) rotate3d(var(--rotateX, 0), var(--rotateY, 0), 0, 0deg); }
      to { transform: perspective(1000px) rotate3d(var(--rotateX, 0), var(--rotateY, 0), 0, var(--angle, 0deg)); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { transform: perspective(1000px) rotate3d(var(--rotateX, 0), var(--rotateY, 0), 0, var(--angle, 0deg)); }
      to { transform: perspective(1000px) rotate3d(0, 0, 0, 0deg); }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  physicsPreset: GestureAnimationPreset.SPRING_BOUNCE,
  physicsParams: {
    tension: 200,
    friction: 20,
    mass: 1,
  },
  constraints: {
    allowTranslateX: true,
    allowTranslateY: true,
    allowScale: false,
    allowRotate: false,
  },
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Multi-touch transform preset
export const multiTouchTransformPreset: GestureAnimationConfig = {
  name: 'Multi-touch Transform',
  description: 'Combined scale, rotate, and translate with multi-touch',
  gestures: [GestureType.PAN, GestureType.PINCH, GestureType.ROTATE],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: scale(1) rotate(0deg) translate(0, 0); }
      to { transform: scale(1) rotate(0deg) translate(0, 0); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); }
      to { box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  physicsPreset: GestureAnimationPreset.SPRING_BOUNCE,
  physicsParams: {
    tension: 200,
    friction: 20,
    mass: 1,
  },
  constraints: {
    allowTranslateX: true,
    allowTranslateY: true,
    allowScale: true,
    allowRotate: true,
    boundaries: {
      scale: { min: 0.5, max: 3 },
      rotation: { min: -180, max: 180 }
    }
  },
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Scroll-driven parallax preset
export const scrollDrivenParallaxPreset: GestureAnimationConfig = {
  name: 'Scroll-Driven Parallax',
  description: 'Elements move at different speeds based on scroll position',
  gestures: [GestureType.PAN],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: translateY(0); }
      to { transform: translateY(0); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureDuringAnimation: {
    keyframes: keyframes`
      from { transform: translateY(0); }
      to { transform: translateY(calc(var(--scroll-y, 0) * var(--parallax-factor, 0.3))); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.SUBTLE,
  },
  physicsPreset: GestureAnimationPreset.INERTIAL_SLIDE,
  physicsParams: {
    tension: 100,
    friction: 20,
    mass: 1,
    velocityScale: 0.2,
  },
  constraints: {
    allowTranslateX: false,
    allowTranslateY: true,
    allowScale: false,
    allowRotate: false,
  },
  intensity: AnimationIntensity.STANDARD,
};

// Swipe card deck preset
export const swipeCardDeckPreset: GestureAnimationConfig = {
  name: 'Swipe Card Deck',
  description: 'Tinder-like card swiping with physics',
  gestures: [GestureType.PAN, GestureType.SWIPE],
  baseAnimation: {
    keyframes: keyframes`
      from { transform: translate(0, 0) rotate(0deg); }
      to { transform: translate(0, 0) rotate(0deg); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureDuringAnimation: {
    keyframes: keyframes`
      from { transform: translate(0, 0) rotate(0deg); }
      to { transform: translate(var(--x, 0), var(--y, 0)) rotate(calc(var(--x, 0) * 0.1deg)); }
    `,
    duration: animationTimings.instant,
    easing: animationEasings.standard,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  gestureEndAnimation: {
    keyframes: keyframes`
      from { 
        transform: translate(var(--x, 0), var(--y, 0)) rotate(calc(var(--x, 0) * 0.1deg)); 
        opacity: var(--opacity, 1);
      }
      to { 
        transform: translate(var(--final-x, 0), var(--final-y, 0)) rotate(calc(var(--final-x, 0) * 0.1deg)); 
        opacity: var(--final-opacity, 1);
      }
    `,
    duration: animationTimings.normal,
    easing: animationEasings.emphasized,
    fillMode: 'forwards',
    intensity: AnimationIntensity.STANDARD,
  },
  physicsPreset: GestureAnimationPreset.MOMENTUM_FLICK,
  physicsParams: {
    tension: 120,
    friction: 10,
    velocityScale: 2,
    deceleration: 0.85,
  },
  constraints: {
    allowTranslateX: true,
    allowTranslateY: true,
    allowScale: false,
    allowRotate: true,
  },
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Collection of all gesture-driven animation presets
export const gestureAnimationPresets = {
  dragWithInertia: dragWithInertiaPreset,
  pinchZoom: pinchZoomPreset,
  rotation: rotationPreset,
  swipeToDismiss: swipeToDismissPreset,
  pullToRefresh: pullToRefreshPreset,
  magneticSnap: magneticSnapPreset,
  tiltOnDrag: tiltOnDragPreset,
  multiTouchTransform: multiTouchTransformPreset,
  scrollDrivenParallax: scrollDrivenParallaxPreset,
  swipeCardDeck: swipeCardDeckPreset,
};

/**
 * Creates configuration for the gesture animation system based on a preset
 * @param preset Gesture animation preset name or config
 * @param customConfig Additional custom configuration to override preset defaults
 * @returns Configuration object for createGestureAnimation
 */
export const createGestureAnimationConfig = (
  preset: keyof typeof gestureAnimationPresets | GestureAnimationConfig,
  customConfig = {}
) => {
  // Get the preset configuration
  const presetConfig = typeof preset === 'string' 
    ? gestureAnimationPresets[preset] 
    : preset;
  
  if (!presetConfig) {
    throw new Error(`Gesture animation preset "${preset}" not found`);
  }
  
  // Merge with custom config
  const config = {
    ...presetConfig,
    ...customConfig,
    constraints: {
      ...presetConfig.constraints,
      ...((customConfig as any).constraints || {}),
    },
    physicsParams: {
      ...presetConfig.physicsParams,
      ...((customConfig as any).physicsParams || {}),
    },
  };
  
  // Return a configuration object ready for the gesture animation system
  return {
    gestures: config.gestures,
    preset: config.physicsPreset,
    tension: config.physicsParams.tension,
    friction: config.physicsParams.friction,
    mass: config.physicsParams.mass,
    velocityScale: config.physicsParams.velocityScale,
    deceleration: config.physicsParams.deceleration,
    allowTranslateX: config.constraints.allowTranslateX,
    allowTranslateY: config.constraints.allowTranslateY,
    allowScale: config.constraints.allowScale,
    allowRotate: config.constraints.allowRotate,
    boundaries: config.constraints.boundaries,
  };
};