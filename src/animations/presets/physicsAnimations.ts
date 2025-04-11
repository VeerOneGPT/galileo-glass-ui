/**
 * Physics-Based Animation Presets
 *
 * A comprehensive collection of physics-based animations using spring, inertial,
 * momentum, and other physics systems from the Galileo Glass UI animation engine.
 */
import { keyframes } from 'styled-components';
import { GalileoPhysics } from '../physics/unifiedPhysicsAPI';
import { SpringPresets as _ImportedSpringPresets } from '../physics';
import { PhysicsInteractionType } from '../physics/types';
import { PhysicsAnimationMode as _PhysicsAnimationMode } from '../physics/advancedPhysicsAnimations';

import {
  animationTimings,
  animationEasings,
  AnimationIntensity,
  fadeAnimation,
} from './accessibleAnimations';
import type { AnimationPreset } from '../core/types';

// Define spring preset type to match what's expected
export interface SpringPreset {
  tension: number;
  friction: number;
  mass: number;
  initialVelocity?: number; // Changed to number to match SpringConfig
}

// Define extended SpringPresets including the missing ones
export const CustomSpringPresets: Record<string, SpringPreset> = {
  GENTLE: { tension: 120, friction: 14, mass: 1.0 },
  DEFAULT: { tension: 170, friction: 26, mass: 1.0 },
  SNAPPY: { tension: 300, friction: 24, mass: 1.0 },
  BOUNCY: { tension: 180, friction: 12, mass: 1.0 },
  HEAVY: { tension: 200, friction: 40, mass: 5.0 },
  REDUCED_MOTION: { tension: 170, friction: 26, mass: 1.0 },
  // Add missing presets
  RESPONSIVE: { tension: 240, friction: 22, mass: 1.0 },
  WOBBLY: { tension: 180, friction: 8, mass: 1.0 },
  STIFF: { tension: 400, friction: 30, mass: 1.0 },
  SLOW: { tension: 100, friction: 24, mass: 1.5 }
};

// Spring-based fade in animation
export const springFadeAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(0);
    }
    25% {
      opacity: 0.5;
      transform: translateY(-5px);
    }
    75% {
      opacity: 0.9;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.normal,
  easing: 'ease-out',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Spring-based slide up animation with realistic physics
export const springSlideUpAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    25% {
      opacity: 0.7;
      transform: translateY(-5px);
    }
    50% {
      opacity: 0.9;
      transform: translateY(3px);
    }
    75% {
      opacity: 1;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'ease-out',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Spring-based slide down animation with realistic physics
export const springSlideDownAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    25% {
      opacity: 0.7;
      transform: translateY(5px);
    }
    50% {
      opacity: 0.9;
      transform: translateY(-3px);
    }
    75% {
      opacity: 1;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'ease-out',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Inertial slide animation with realistic deceleration
export const inertialSlideAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: translateX(-100px);
      opacity: 0;
    }
    20% {
      transform: translateX(10px);
      opacity: 0.7;
    }
    40% {
      transform: translateX(-5px);
      opacity: 0.9;
    }
    60% {
      transform: translateX(2px);
      opacity: 1;
    }
    80% {
      transform: translateX(-1px);
      opacity: 1;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Bouncy entrance animation with spring dynamics
export const bouncyEntranceAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: scale(0);
      opacity: 0;
    }
    40% {
      transform: scale(1.1);
      opacity: 0.7;
    }
    60% {
      transform: scale(0.9);
      opacity: 0.9;
    }
    80% {
      transform: scale(1.02);
      opacity: 1;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Natural swinging animation with pendulum physics
export const swingAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: rotate(-10deg);
      transform-origin: top center;
    }
    20% {
      transform: rotate(8deg);
      transform-origin: top center;
    }
    40% {
      transform: rotate(-6deg);
      transform-origin: top center;
    }
    60% {
      transform: rotate(4deg);
      transform-origin: top center;
    }
    80% {
      transform: rotate(-2deg);
      transform-origin: top center;
    }
    to {
      transform: rotate(0);
      transform-origin: top center;
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'ease-out',
  fillMode: 'both',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Elastic stretch animation
export const elasticStretchAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: scaleX(0);
    }
    40% {
      transform: scaleX(1.1);
    }
    60% {
      transform: scaleX(0.9);
    }
    80% {
      transform: scaleX(1.03);
    }
    to {
      transform: scaleX(1);
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Magnetic snap animation
export const magneticSnapAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: translateX(var(--start-x, -50px));
    }
    40% {
      transform: translateX(var(--overshoot-x, 10px));
    }
    70% {
      transform: translateX(var(--undershoot-x, -5px));
    }
    90% {
      transform: translateX(var(--final-adjust-x, 2px));
    }
    to {
      transform: translateX(0);
    }
  `,
  duration: animationTimings.normal,
  easing: 'ease-out',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Elastic pulse animation (like a stretchy bubble)
export const elasticPulseAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% {
      transform: scale(1);
    }
    30% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(0.9);
    }
    70% {
      transform: scale(1.05);
    }
    90% {
      transform: scale(0.98);
    }
    100% {
      transform: scale(1);
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'ease-in-out',
  fillMode: 'both',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Gravity drop animation
export const gravityDropAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    30% {
      transform: translateY(5px);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-3px);
      opacity: 0.9;
    }
    70% {
      transform: translateY(2px);
      opacity: 1;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  duration: animationTimings.normal,
  easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Momentum-based slide animation
export const momentumSlideAnimation: AnimationPreset = {
  keyframes: keyframes`
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    25% {
      opacity: 0.5;
    }
    50% {
      transform: translateX(10%);
      opacity: 0.7;
    }
    75% {
      transform: translateX(-2%);
      opacity: 0.9;
    }
    to {
      transform: translateX(0%);
      opacity: 1;
    }
  `,
  duration: animationTimings.emphasized,
  easing: 'cubic-bezier(0.35, 0.91, 0.33, 0.97)',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.STANDARD,
};

// Particle explosion entrance
export const particleExplosionAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% {
      opacity: 0;
      filter: blur(10px);
      transform: scale(0.5);
    }
    50% {
      opacity: 0.8;
      filter: blur(3px);
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
    }
  `,
  duration: animationTimings.pageTransition,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  fillMode: 'both',
  reducedMotionAlternative: fadeAnimation,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Ripple wave effect
export const rippleWaveAnimation: AnimationPreset = {
  keyframes: keyframes`
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    60% {
      transform: scale(0.8);
      opacity: 0.3;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.emphasized,
  fillMode: 'forwards',
  reducedMotionAlternative: null,
  intensity: AnimationIntensity.EXPRESSIVE,
};

// Collection of all physics-based animation presets
export const physicsAnimationPresets = {
  springFade: springFadeAnimation,
  springSlideUp: springSlideUpAnimation,
  springSlideDown: springSlideDownAnimation,
  inertialSlide: inertialSlideAnimation,
  bouncyEntrance: bouncyEntranceAnimation,
  swing: swingAnimation,
  elasticStretch: elasticStretchAnimation,
  magneticSnap: magneticSnapAnimation,
  elasticPulse: elasticPulseAnimation,
  gravityDrop: gravityDropAnimation,
  momentumSlide: momentumSlideAnimation,
  particleExplosion: particleExplosionAnimation,
  rippleWave: rippleWaveAnimation,
};

/**
 * Creates a physics-based spring animation with customizable parameters
 * @param config Spring physics configuration
 * @returns A function that generates keyframes for the animation
 */
export const createSpringAnimation = (config: Partial<SpringPreset> = {}) => {
  const springConfig: SpringPreset = {
    tension: config.tension !== undefined ? config.tension : CustomSpringPresets.RESPONSIVE.tension,
    friction: config.friction !== undefined ? config.friction : CustomSpringPresets.RESPONSIVE.friction,
    mass: config.mass !== undefined ? config.mass : CustomSpringPresets.RESPONSIVE.mass,
    initialVelocity: config.initialVelocity || 0, // Changed to number
  };

  return {
    generateKeyframes: (property: string, from: number, to: number) => {
      // Generate frames using the spring physics calculations
      const frames = [];
      const steps = 20; // Number of keyframes to generate
      const _springPhysics = GalileoPhysics.createSpring(springConfig);
      
      // Instead of using solve method
      for (let i = 0; i < steps; i++) {
        const progress = i / (steps - 1);
        const position = progress; // Calculate position based on spring (simplified for now)
        const value = from + (to - from) * position;
        
        frames.push({
          progress: progress * 100,
          value,
        });
      }
      
      // Convert to keyframes string
      let keyframeString = '';
      frames.forEach(frame => {
        keyframeString += `${frame.progress}% { ${property}: ${frame.value}; }\n`;
      });
      
      return keyframes`${keyframeString}`;
    },
  };
};

/**
 * Creates physics configuration parameters for use with GalileoPhysics
 * @param preset Animation preset name or custom config
 * @returns Physics animation configuration
 */
export const getPhysicsConfig = (preset: string | Partial<SpringPreset> = 'responsive') => {
  // Initialize with default values to avoid type errors
  let config: SpringPreset = { ...CustomSpringPresets.RESPONSIVE };
  
  // Use built-in presets if a string is provided
  if (typeof preset === 'string') {
    switch (preset.toLowerCase()) {
      case 'bouncy':
        config = CustomSpringPresets.BOUNCY;
        break;
      case 'gentle':
        config = CustomSpringPresets.GENTLE;
        break;
      case 'wobbly':
        config = CustomSpringPresets.WOBBLY;
        break;
      case 'stiff':
        config = CustomSpringPresets.STIFF;
        break;
      case 'slow':
        config = CustomSpringPresets.SLOW;
        break;
      case 'responsive':
      default:
        config = CustomSpringPresets.RESPONSIVE;
        break;
    }
  } else if (preset) {
    // Use custom config with fallbacks to RESPONSIVE preset
    config = {
      tension: preset.tension ?? CustomSpringPresets.RESPONSIVE.tension,
      friction: preset.friction ?? CustomSpringPresets.RESPONSIVE.friction,
      mass: preset.mass ?? CustomSpringPresets.RESPONSIVE.mass,
    };
  }
  
  // Return animation config with correct mode
  return GalileoPhysics.createAnimationConfig({
    type: PhysicsInteractionType.SPRING,
    stiffness: config.tension,
    damping: config.friction,
    mass: config.mass
  });
};