/**
 * Advanced Physics Animations
 *
 * Enhanced physics-based animation system with advanced simulation capabilities.
 */
import { css } from 'styled-components';
import { keyframes } from 'styled-components';

import {
  getMotionSensitivity,
  MotionSensitivityLevel,
  AnimationComplexity
} from '../accessibility/MotionSensitivity';
import { getOptimizedGPUAcceleration } from '../performance/GPUAcceleration';

import { MagneticEffectOptions, magneticEffect } from './magneticEffect';
import { ParticleSystemOptions, particleSystem } from './particleSystem';
import { SpringAnimationOptions, springAnimation } from './springAnimation';

/**
 * Advanced animation modes
 */
export enum PhysicsAnimationMode {
  /** Standard spring animation */
  SPRING = 'spring',

  /** Bounce animation with gravity */
  BOUNCE = 'bounce',

  /** Magnetic pull effect */
  MAGNETIC = 'magnetic',

  /** Elastic movement (stretchy) */
  ELASTIC = 'elastic',

  /** Liquid-like movement (squishy) */
  LIQUID = 'liquid',

  /** Inertia with friction */
  INERTIA = 'inertia',

  /** Chain reaction (connected elements) */
  CHAIN = 'chain',
}

/**
 * Animation state model
 */
export interface PhysicsState {
  /** Position X */
  x: number;

  /** Position Y */
  y: number;

  /** Rotation angle */
  rotation: number;

  /** Scale factor */
  scale: number;

  /** Opacity value */
  opacity: number;

  /** Velocity X */
  vx: number;

  /** Velocity Y */
  vy: number;

  /** Angular velocity */
  vRotation: number;

  /** Scale velocity */
  vScale: number;

  /** Opacity velocity */
  vOpacity: number;
}

/**
 * Advanced physics animation options
 */
export interface AdvancedPhysicsOptions {
  /** Animation mode */
  mode: PhysicsAnimationMode;

  /** Spring configuration (for spring-based modes) */
  spring?: SpringAnimationOptions;

  /** Magnetic configuration (for magnetic mode) */
  magnetic?: MagneticEffectOptions;

  /** Particles configuration (for particle effects) */
  particles?: ParticleSystemOptions;

  /** Gravity strength (pixels/ms²) */
  gravity?: number;

  /** Air resistance/friction (0-1) */
  friction?: number;

  /** Bounciness coefficient (0-1) */
  bounciness?: number;

  /** Elasticity coefficient (0-1) */
  elasticity?: number;

  /** Fluid viscosity (for liquid mode) */
  viscosity?: number;

  /** Whether to enable collision detection */
  collisions?: boolean;

  /** Initial state */
  initialState?: Partial<PhysicsState>;

  /** Target state */
  targetState?: Partial<PhysicsState>;

  /** Animation duration in ms (0 for physics-controlled) */
  duration?: number;

  /** Animation complexity level */
  complexity?: AnimationComplexity;

  /** Motion sensitivity level */
  sensitivity?: MotionSensitivityLevel;

  /** Whether to optimize for GPU */
  gpuAccelerated?: boolean;
}

/**
 * Default physics state
 */
const DEFAULT_PHYSICS_STATE: PhysicsState = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  opacity: 1,
  vx: 0,
  vy: 0,
  vRotation: 0,
  vScale: 0,
  vOpacity: 0,
};

/**
 * Calculate spring parameters based on desired behavior
 * @param mass Mass of the object
 * @param stiffness Spring stiffness
 * @param dampingRatio Damping ratio (1 = critically damped)
 * @returns Spring parameters
 */
export const calculateSpringParameters = (
  mass = 1,
  stiffness = 100,
  dampingRatio = 0.8
): {
  damping: number;
  period: number;
  velocity: number;
} => {
  // Calculate damping coefficient
  const damping = dampingRatio * 2 * Math.sqrt(mass * stiffness);

  // Calculate natural period
  const period = 2 * Math.PI * Math.sqrt(mass / stiffness);

  // Calculate initial velocity for critically damped motion
  const velocity = 1 / (mass * period);

  return { damping, period, velocity };
};

/**
 * Generate a keyframe animation based on physics simulation
 * @param options Physics animation options
 * @returns Keyframes and CSS properties
 */
export const generatePhysicsKeyframes = (
  options: AdvancedPhysicsOptions
): {
  keyframes: ReturnType<typeof keyframes>;
  css: ReturnType<typeof css>;
} => {
  const {
    mode,
    spring = { mass: 1, stiffness: 100, dampingRatio: 0.8 },
    gravity = 0,
    friction = 0.2,
    bounciness = 0.5,
    elasticity = 0.3,
    initialState = {},
    targetState = {},
    duration = 0,
    complexity = AnimationComplexity.STANDARD,
    gpuAccelerated = true,
  } = options;

  // Merge initial and target states with defaults
  const initial = { ...DEFAULT_PHYSICS_STATE, ...initialState };
  const target = { ...DEFAULT_PHYSICS_STATE, ...targetState };

  // Initialize keyframes data
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Generate different physics animations based on mode
  switch (mode) {
    case PhysicsAnimationMode.SPRING: {
      // Use existing spring animation with enhanced options
      const springKeyframes = generateSpringKeyframes(initial, target, {
        mass: spring.mass || 1,
        stiffness: spring.stiffness || 100,
        dampingRatio: spring.dampingRatio || 0.8,
        steps: complexity >= AnimationComplexity.ENHANCED ? 20 : 10,
      });

      Object.assign(keyframePoints, springKeyframes);
      break;
    }

    case PhysicsAnimationMode.BOUNCE: {
      // Generate bounce animation with gravity
      const bounceKeyframes = generateBounceKeyframes(initial, target, {
        gravity,
        bounciness,
        friction,
        steps: complexity >= AnimationComplexity.ENHANCED ? 15 : 8,
      });

      Object.assign(keyframePoints, bounceKeyframes);
      break;
    }

    case PhysicsAnimationMode.ELASTIC: {
      // Generate elastic/stretchy animation
      const elasticKeyframes = generateElasticKeyframes(initial, target, {
        elasticity,
        steps: complexity >= AnimationComplexity.ENHANCED ? 20 : 10,
      });

      Object.assign(keyframePoints, elasticKeyframes);
      break;
    }

    case PhysicsAnimationMode.LIQUID: {
      // Generate liquid/squishy animation
      const liquidKeyframes = generateLiquidKeyframes(initial, target, {
        viscosity: options.viscosity || 0.3,
        steps: complexity >= AnimationComplexity.ENHANCED ? 25 : 12,
      });

      Object.assign(keyframePoints, liquidKeyframes);
      break;
    }

    case PhysicsAnimationMode.INERTIA: {
      // Generate inertia animation
      const inertiaKeyframes = generateInertiaKeyframes(initial, target, {
        friction,
        steps: complexity >= AnimationComplexity.ENHANCED ? 15 : 8,
      });

      Object.assign(keyframePoints, inertiaKeyframes);
      break;
    }

    case PhysicsAnimationMode.CHAIN: {
      // Generate chain reaction animation
      const chainKeyframes = generateChainKeyframes(initial, target, {
        springTension: spring.stiffness || 100,
        friction,
        steps: complexity >= AnimationComplexity.ENHANCED ? 25 : 12,
      });

      Object.assign(keyframePoints, chainKeyframes);
      break;
    }

    case PhysicsAnimationMode.MAGNETIC:
    default: {
      // Use magnetic effect for default or magnetic mode
      const magneticKeyframes = generateMagneticKeyframes(initial, target, {
        strength: options.magnetic?.strength || 0.3,
        radius: options.magnetic?.radius || 100,
        steps: complexity >= AnimationComplexity.ENHANCED ? 15 : 8,
      });

      Object.assign(keyframePoints, magneticKeyframes);
      break;
    }
  }

  // Create keyframes
  const keyframesAnimation = keyframes`
    ${Object.entries(keyframePoints)
      .map(
        ([percent, props]) => `
      ${percent} {
        ${Object.entries(props)
          .map(([prop, value]) => `${prop}: ${value};`)
          .join('\n        ')}
      }
    `
      )
      .join('\n')}
  `;

  // Create CSS
  const animationCSS = css`
    animation: ${keyframesAnimation} ${duration > 0 ? `${duration}ms` : '1000ms'} forwards;
    ${gpuAccelerated
      ? css`
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        `
      : ''}
  `;

  return {
    keyframes: keyframesAnimation,
    css: animationCSS,
  };
};

/**
 * Generate spring-based keyframes
 */
const generateSpringKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    mass: number;
    stiffness: number;
    dampingRatio: number;
    steps: number;
  }
): { [key: string]: Record<string, string> } => {
  const { mass, stiffness, dampingRatio, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Calculate spring parameters
  const { damping, period } = calculateSpringParameters(mass, stiffness, dampingRatio);

  // Critical damping factor
  const criticalDamping = 2 * Math.sqrt(mass * stiffness);
  const actualDamping = dampingRatio * criticalDamping;

  // Generate steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const percent = `${Math.round(t * 100)}%`;

    // Spring equation
    // For underdamped system (dampingRatio < 1)
    let x, y, scale, rotation, opacity;

    if (dampingRatio < 1) {
      // Underdamped (bouncy)
      const omega = Math.sqrt(stiffness / mass);
      const omegaD = omega * Math.sqrt(1 - dampingRatio * dampingRatio);

      const A = 1;
      const decay = Math.exp(-dampingRatio * omega * t);

      const cosine = Math.cos(omegaD * t);
      const sine = Math.sin(omegaD * t);

      const progress = 1 - decay * (cosine + ((dampingRatio * omega) / omegaD) * sine);

      x = initial.x + (target.x - initial.x) * progress;
      y = initial.y + (target.y - initial.y) * progress;
      scale = initial.scale + (target.scale - initial.scale) * progress;
      rotation = initial.rotation + (target.rotation - initial.rotation) * progress;
      opacity = initial.opacity + (target.opacity - initial.opacity) * progress;
    } else if (dampingRatio === 1) {
      // Critically damped (smooth)
      const omega = Math.sqrt(stiffness / mass);
      const decay = Math.exp(-omega * t);

      const progress = 1 - decay * (1 + omega * t);

      x = initial.x + (target.x - initial.x) * progress;
      y = initial.y + (target.y - initial.y) * progress;
      scale = initial.scale + (target.scale - initial.scale) * progress;
      rotation = initial.rotation + (target.rotation - initial.rotation) * progress;
      opacity = initial.opacity + (target.opacity - initial.opacity) * progress;
    } else {
      // Overdamped (no bounce, slow approach)
      const omega = Math.sqrt(stiffness / mass);
      const alpha = dampingRatio * omega;
      const beta = Math.sqrt(alpha * alpha - omega * omega);

      const decay1 = Math.exp((-alpha + beta) * t);
      const decay2 = Math.exp((-alpha - beta) * t);

      const progress = 1 - (decay1 + decay2) / 2;

      x = initial.x + (target.x - initial.x) * progress;
      y = initial.y + (target.y - initial.y) * progress;
      scale = initial.scale + (target.scale - initial.scale) * progress;
      rotation = initial.rotation + (target.rotation - initial.rotation) * progress;
      opacity = initial.opacity + (target.opacity - initial.opacity) * progress;
    }

    keyframePoints[percent] = {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: `${opacity}`,
    };
  }

  return keyframePoints;
};

/**
 * Generate bounce keyframes with gravity
 */
const generateBounceKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    gravity: number;
    bounciness: number;
    friction: number;
    steps: number;
  }
): { [key: string]: Record<string, string> } => {
  const { gravity, bounciness, friction, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Initial velocity
  let vx = initial.vx;
  let vy = initial.vy;

  // Current position
  let x = initial.x;
  let y = initial.y;
  let scale = initial.scale;
  let rotation = initial.rotation;
  let opacity = initial.opacity;

  // Ground position (y coordinate where bouncing occurs)
  const ground = Math.max(initial.y, target.y) + 50;

  // Generate steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const percent = `${Math.round(t * 100)}%`;

    // Apply gravity
    vy += gravity * (1 / steps);

    // Apply friction
    vx *= 1 - friction * (1 / steps);

    // Update position
    x += vx;
    y += vy;

    // Check for ground collision (bounce)
    if (y >= ground) {
      y = ground;
      vy = -vy * bounciness;

      // Squash effect on bounce
      scale = initial.scale * 1.2;
    } else {
      // Restore or progress scale
      scale = scale + (target.scale - scale) * 0.1;
    }

    // Progress rotation toward target
    rotation = rotation + (target.rotation - rotation) * 0.05;

    // Progress opacity toward target
    opacity = opacity + (target.opacity - opacity) * 0.1;

    keyframePoints[percent] = {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: `${opacity}`,
    };
  }

  return keyframePoints;
};

/**
 * Generate elastic/stretchy keyframes
 */
const generateElasticKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    elasticity: number;
    steps: number;
  }
): { [key: string]: Record<string, string> } => {
  const { elasticity, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Elastic effect parameters
  const frequency = 3; // Oscillation frequency
  const decay = 5; // Decay rate of oscillations

  // Generate steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const percent = `${Math.round(t * 100)}%`;

    // Elastic function
    const elapsedTimeRate = Math.min(1, t * 1.5);
    const elasticEffect = 1 - Math.cos(frequency * Math.PI * t) * Math.exp(-decay * t) * elasticity;

    // Apply elastic effect to motion
    const x = initial.x + (target.x - initial.x) * elapsedTimeRate;
    const y = initial.y + (target.y - initial.y) * elapsedTimeRate;

    // Apply elastic effect to scale
    const baseScale = initial.scale + (target.scale - initial.scale) * elapsedTimeRate;
    const scaleModifier =
      1 + Math.cos(frequency * Math.PI * t) * Math.exp(-decay * t) * elasticity * 0.3;
    const scale = baseScale * scaleModifier;

    // Apply elastic effect to rotation
    const baseRotation = initial.rotation + (target.rotation - initial.rotation) * elapsedTimeRate;
    const rotationModifier =
      Math.cos(frequency * Math.PI * t) * Math.exp(-decay * t) * elasticity * 10;
    const rotation = baseRotation + rotationModifier;

    // Progress opacity toward target (not elastic)
    const opacity = initial.opacity + (target.opacity - initial.opacity) * elapsedTimeRate;

    keyframePoints[percent] = {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: `${opacity}`,
    };
  }

  return keyframePoints;
};

/**
 * Generate liquid/squishy keyframes
 */
const generateLiquidKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    viscosity: number;
    steps: number;
  }
): { [key: string]: Record<string, string> } => {
  const { viscosity, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Liquid effect parameters
  const frequency = 2.5;
  const decay = 4;

  // Generate steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const percent = `${Math.round(t * 100)}%`;

    // Time warping for viscous effect
    const warpedTime = Math.pow(t, 1 - viscosity * 0.5);

    // Base position interpolation
    const x = initial.x + (target.x - initial.x) * warpedTime;
    const y = initial.y + (target.y - initial.y) * warpedTime;

    // Liquid squish effect for scale
    const xScale =
      1 + Math.sin(frequency * Math.PI * t) * Math.exp(-decay * t) * (1 - viscosity) * 0.3;
    const yScale =
      1 - Math.sin(frequency * Math.PI * t) * Math.exp(-decay * t) * (1 - viscosity) * 0.2;

    // Base scale interpolation
    const baseScale = initial.scale + (target.scale - initial.scale) * warpedTime;

    // Progress rotation
    const rotation = initial.rotation + (target.rotation - initial.rotation) * warpedTime;

    // Progress opacity (not affected by liquid effect)
    const opacity = initial.opacity + (target.opacity - initial.opacity) * warpedTime;

    keyframePoints[percent] = {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${baseScale * xScale}, ${
        baseScale * yScale
      })`,
      opacity: `${opacity}`,
    };
  }

  return keyframePoints;
};

/**
 * Generate inertia keyframes
 */
const generateInertiaKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    friction: number;
    steps: number;
  }
): { [key: string]: Record<string, string> } => {
  const { friction, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Initial velocity
  let vx = initial.vx || (target.x - initial.x) * 0.05;
  let vy = initial.vy || (target.y - initial.y) * 0.05;
  let vRotation = initial.vRotation || (target.rotation - initial.rotation) * 0.05;
  let vScale = initial.vScale || (target.scale - initial.scale) * 0.05;

  // Current position
  let x = initial.x;
  let y = initial.y;
  let rotation = initial.rotation;
  let scale = initial.scale;
  let opacity = initial.opacity;

  // Generate steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const percent = `${Math.round(t * 100)}%`;

    // Calculate friction effect
    const frictionFactor = Math.pow(1 - friction, 1 / steps);

    // Apply friction to velocities
    vx *= frictionFactor;
    vy *= frictionFactor;
    vRotation *= frictionFactor;
    vScale *= frictionFactor;

    // Add attraction to target
    const attraction = 0.02;
    vx += (target.x - x) * attraction;
    vy += (target.y - y) * attraction;
    vRotation += (target.rotation - rotation) * attraction;
    vScale += (target.scale - scale) * attraction;

    // Update positions
    x += vx;
    y += vy;
    rotation += vRotation;
    scale += vScale;

    // Progress opacity linearly (not affected by inertia)
    opacity = initial.opacity + (target.opacity - initial.opacity) * t;

    keyframePoints[percent] = {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: `${opacity}`,
    };
  }

  return keyframePoints;
};

/**
 * Generate magnetic effect keyframes
 */
const generateMagneticKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    strength: number;
    radius: number;
    steps: number;
  }
): { [key: string]: Record<string, string> } => {
  const { strength, radius, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Current position
  let x = initial.x;
  let y = initial.y;
  let vx = initial.vx || 0;
  let vy = initial.vy || 0;

  // Other properties
  let rotation = initial.rotation;
  let scale = initial.scale;
  let opacity = initial.opacity;

  // Generate steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const percent = `${Math.round(t * 100)}%`;

    // Calculate distance to target
    const dx = target.x - x;
    const dy = target.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply magnetic force
    if (distance > 0) {
      const magneticForce = Math.min(strength * (1 - Math.min(distance, radius) / radius), 1);

      vx += dx * magneticForce * 0.1;
      vy += dy * magneticForce * 0.1;
    }

    // Apply friction
    vx *= 0.92;
    vy *= 0.92;

    // Update position
    x += vx;
    y += vy;

    // Progress other properties
    rotation = rotation + (target.rotation - rotation) * 0.1;
    scale = scale + (target.scale - scale) * 0.1;
    opacity = opacity + (target.opacity - opacity) * 0.1;

    keyframePoints[percent] = {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: `${opacity}`,
    };
  }

  return keyframePoints;
};

/**
 * Generate chain reaction keyframes
 */
const generateChainKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    springTension: number;
    friction: number;
    steps: number;
  }
): { [key: string]: Record<string, string> } => {
  const { springTension, friction, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Time delay between chain links
  const chainDelay = 0.15;

  // Generate steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const percent = `${Math.round(t * 100)}%`;

    // Apply chain delay effect - time shifts based on property
    const xDelay = Math.max(0, Math.min(1, (t - 0 * chainDelay) / (1 - 0 * chainDelay)));
    const yDelay = Math.max(0, Math.min(1, (t - 1 * chainDelay) / (1 - 1 * chainDelay)));
    const rotDelay = Math.max(0, Math.min(1, (t - 2 * chainDelay) / (1 - 2 * chainDelay)));
    const scaleDelay = Math.max(0, Math.min(1, (t - 3 * chainDelay) / (1 - 3 * chainDelay)));

    // Apply spring effect to each property
    const springFactor = (delay: number) => {
      if (delay <= 0) return 0;
      const frequency = Math.sqrt(springTension) * 0.3;
      const damping = friction * 2;
      return Math.exp(-damping * delay) * Math.sin(frequency * Math.PI * delay);
    };

    // Calculate each property with chain and spring effects
    const x = initial.x + (target.x - initial.x) * xDelay + springFactor(xDelay) * 10;
    const y = initial.y + (target.y - initial.y) * yDelay + springFactor(yDelay) * 10;
    const rotation =
      initial.rotation +
      (target.rotation - initial.rotation) * rotDelay +
      springFactor(rotDelay) * 15;
    const scale =
      initial.scale +
      (target.scale - initial.scale) * scaleDelay * (1 + springFactor(scaleDelay) * 0.1);

    // Opacity follows first property (x)
    const opacity = initial.opacity + (target.opacity - initial.opacity) * xDelay;

    keyframePoints[percent] = {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: `${opacity}`,
    };
  }

  return keyframePoints;
};

/**
 * Create a advanced physics animation with accessibility considerations
 * @param options Physics animation options
 * @returns CSS animation string or reduced motion alternative
 */
export const advancedPhysicsAnimation = (
  options: AdvancedPhysicsOptions
): ReturnType<typeof css> => {
  // Apply motion sensitivity
  const sensitivityConfig = getMotionSensitivity(options.sensitivity);

  // Check if animation complexity is allowed
  if (
    !sensitivityConfig.maxAllowedComplexity ||
    (Object.values(AnimationComplexity).indexOf(options.complexity || AnimationComplexity.STANDARD) >
      Object.values(AnimationComplexity).indexOf(sensitivityConfig.maxAllowedComplexity))
  ) {
    // Return empty animation for reduced motion
    return css``;
  }

  // For minimal motion, use simpler animations
  if (sensitivityConfig.maxAllowedComplexity === AnimationComplexity.MINIMAL) {
    return css`
      transition: opacity 0.2s ease, transform 0.2s ease;
    `;
  }

  // For basic motion, use standard spring instead of advanced physics
  if (sensitivityConfig.maxAllowedComplexity === AnimationComplexity.BASIC) {
    return springAnimation({
      mass: options.spring?.mass || 1,
      stiffness: options.spring?.stiffness || 100,
      dampingRatio: options.spring?.dampingRatio || 0.8,
      duration: options.duration || 300,
    });
  }

  // Generate full physics animation for standard+ complexity
  const { css: animationCSS } = generatePhysicsKeyframes(options);

  // Add GPU acceleration if needed
  if (options.gpuAccelerated) {
    // Get acceleration properties
    const gpuProps = getOptimizedGPUAcceleration(4);

    // Convert to CSS string format
    const gpuCssString = Object.entries(gpuProps)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');

    return css`
      ${animationCSS}
      ${gpuCssString}
    `;
  }

  return animationCSS;
};
