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

// Re-introduce import for ONLY PhysicsQuality and Vector2D
import { PhysicsQuality, Vector2D } from './types';

// Comment out potentially conflicting import to diagnose linter issue
// import { PhysicsAnimationMode, PhysicsQuality, Vector2D } from './types';

// --- Define Local Enum for Simulation Type --- //
export enum SimulationType {
  SPRING = 'spring',
  BOUNCE = 'bounce',
  MAGNETIC = 'magnetic',
  ELASTIC = 'elastic',
  LIQUID = 'liquid',
  INERTIA = 'inertia',
  CHAIN = 'chain',
  // Add NATURAL if it's meant to be a simulation type handled here (e.g., mapping to magnetic?)
  // NATURAL = 'natural' // Example if needed
}

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
 * Animation state model (Restore Vector2D)
 * Note: Ensure PhysicsState interface is correctly defined in this file or imported elsewhere if needed.
 * Assuming it might be defined locally for now based on previous context.
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
 * Restore specific types, keep PhysicsAnimationMode out
 */
export interface AdvancedPhysicsOptions {
  simulationType: SimulationType;
  // qualityMode?: PhysicsAnimationMode; // Commented out import
  magnetic?: MagneticEffectOptions;
  particles?: ParticleSystemOptions;
  property?: string;
  from?: number;
  to?: number;
  mass?: number;
  stiffness?: number;
  damping?: number;
  initialVelocity?: number | Vector2D; // Restore Vector2D
  boundaries?: { min?: number; max?: number };
  friction?: number;
  gravity?: Vector2D | number; // Restore Vector2D
  collisionElasticity?: number;
  quality?: PhysicsQuality; // Restore PhysicsQuality
  bounciness?: number;
  elasticity?: number;
  viscosity?: number;
  collisions?: boolean;
  initialState?: Partial<PhysicsState>; // Restore PhysicsState
  targetState?: Partial<PhysicsState>; // Restore PhysicsState
  duration?: number;
  complexity?: AnimationComplexity;
  sensitivity?: MotionSensitivityLevel;
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
 * @param options Physics animation options (using updated AdvancedPhysicsOptions)
 * @returns Keyframes, CSS properties, and calculated duration
 */
export const generatePhysicsKeyframes = (
  options: AdvancedPhysicsOptions
): {
  keyframes: ReturnType<typeof keyframes>;
  css: ReturnType<typeof css>;
  duration: number;
} => {
  const {
    // Destructure simulationType instead of mode
    simulationType,
    property = 'transform',
    from = 0,
    to = 1,
    mass = 1,
    stiffness = 170,
    damping = 26,
    initialVelocity = 0,
    friction = 0.2,
    bounciness = 0.5,
    elasticity = 0.3,
    initialState = {},
    targetState = {},
    duration = 0,
    complexity = AnimationComplexity.STANDARD,
    gpuAccelerated = true,
  } = options;

  let calculatedDuration = duration;

  // Merge initial and target states with defaults
  // Map 'from'/'to' to relevant axis based on property if simple transform
  let derivedInitialState = { ...DEFAULT_PHYSICS_STATE, ...initialState };
  let derivedTargetState = { ...DEFAULT_PHYSICS_STATE, ...targetState };

  if (property === 'translateX' || property === 'x') {
      derivedInitialState.x = from;
      derivedTargetState.x = to;
  } else if (property === 'translateY' || property === 'y') {
      derivedInitialState.y = from;
      derivedTargetState.y = to;
  } else if (property === 'scale') {
      derivedInitialState.scale = from;
      derivedTargetState.scale = to;
  } else if (property === 'rotate' || property === 'rotation') {
      derivedInitialState.rotation = from;
      derivedTargetState.rotation = to;
  } else if (property === 'opacity') {
      derivedInitialState.opacity = from;
      derivedTargetState.opacity = to;
  }

  const initial = derivedInitialState;
  const target = derivedTargetState;

  const keyframePoints: { [key: string]: Record<string, string> } = {};

  // Use local SimulationType in switch statement
  switch (simulationType) {
    case SimulationType.SPRING: { // Use local enum
      const dampingRatio = damping / (2 * Math.sqrt(mass * stiffness));
      const result = generateSpringKeyframes(initial, target, {
        mass: mass,
        stiffness: stiffness,
        dampingRatio: dampingRatio,
        initialVelocity: typeof initialVelocity === 'number' ? initialVelocity : initialVelocity.x,
        property: property,
        steps: complexity >= AnimationComplexity.ENHANCED ? 100 : 50,
      });
      Object.assign(keyframePoints, result.keyframes);
      if (calculatedDuration <= 0) calculatedDuration = result.duration;
      break;
    }
    case SimulationType.BOUNCE: { // Use local enum
        const gravityValue = typeof options.gravity === 'object' && options.gravity !== null ? options.gravity.y : (typeof options.gravity === 'number' ? options.gravity : 0);
        const result = generateBounceKeyframes(initial, target, {
            gravity: gravityValue,
            bounciness,
            friction,
            property: property,
            steps: complexity >= AnimationComplexity.ENHANCED ? 60 : 30,
        });
        Object.assign(keyframePoints, result.keyframes);
        if (calculatedDuration <= 0) calculatedDuration = result.duration;
        break;
    }
    case SimulationType.ELASTIC: { // Use local enum
        const result = generateElasticKeyframes(initial, target, {
            elasticity,
            property: property,
            stiffness: stiffness,
            damping: damping,
            steps: complexity >= AnimationComplexity.ENHANCED ? 80 : 40,
        });
        Object.assign(keyframePoints, result.keyframes);
        if (calculatedDuration <= 0) calculatedDuration = result.duration;
        break;
    }
    case SimulationType.LIQUID: { // Use local enum
        const result = generateLiquidKeyframes(initial, target, {
            viscosity: options.viscosity || 0.3,
            property: property,
            steps: complexity >= AnimationComplexity.ENHANCED ? 100 : 50,
        });
        Object.assign(keyframePoints, result.keyframes);
        if (calculatedDuration <= 0) calculatedDuration = result.duration;
        break;
    }
    case SimulationType.INERTIA: { // Use local enum
       const inertiaVelocity = typeof initialVelocity === 'number' ? initialVelocity : initialVelocity[propertyToStateKey(property)] ?? 0;
       const result = generateInertiaKeyframes(initial, target, {
            friction,
            initialVelocity: inertiaVelocity,
            property: property,
            steps: complexity >= AnimationComplexity.ENHANCED ? 60 : 30,
       });
        Object.assign(keyframePoints, result.keyframes);
        if (calculatedDuration <= 0) calculatedDuration = result.duration;
        break;
    }
    case SimulationType.CHAIN: { // Use local enum
        const result = generateChainKeyframes(initial, target, {
            springTension: stiffness,
            friction,
            property: property,
            steps: complexity >= AnimationComplexity.ENHANCED ? 100 : 50,
        });
        Object.assign(keyframePoints, result.keyframes);
        if (calculatedDuration <= 0) calculatedDuration = result.duration;
        break;
    }
    case SimulationType.MAGNETIC: // Use local enum
    default: { // Default case, perhaps MAGNETIC is the default?
        const result = generateMagneticKeyframes(initial, target, {
            strength: options.magnetic?.strength || 0.3,
            radius: options.magnetic?.radius || 100,
            initialVelocity: typeof initialVelocity === 'number' ? initialVelocity : initialVelocity[propertyToStateKey(property)] ?? 0,
            property: property,
            steps: complexity >= AnimationComplexity.ENHANCED ? 60 : 30,
        });
        Object.assign(keyframePoints, result.keyframes);
        if (calculatedDuration <= 0) calculatedDuration = result.duration;
        break;
    }
  }

  if (calculatedDuration <= 0) {
      calculatedDuration = 1000;
  }

  const keyframesAnimation = keyframes`
    ${Object.entries(keyframePoints)
      .sort(([a], [b]) => parseFloat(a.replace('%', '')) - parseFloat(b.replace('%', '')))
      .map(
        ([percent, props]) => `
      ${percent} {
        ${Object.entries(props)
          .map(([prop, value]) => `  ${prop.replace(/[A-Z]/g, '-$&').toLowerCase()}: ${value};`)
          .join('\n')}
      }`
      )
      .join('\n')}
  `;

  const animationCSS = css`
    animation: ${keyframesAnimation} ${calculatedDuration}ms linear forwards;
    ${gpuAccelerated
      ? css`
          will-change: ${property === 'opacity' ? 'opacity' : 'transform, opacity'};
          transform: translateZ(0);
          backface-visibility: hidden;
        `
      : ''}
  `;

  return {
    keyframes: keyframesAnimation,
    css: animationCSS,
    duration: calculatedDuration,
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
    initialVelocity: number;
    property: string;
    steps: number;
  }
): { keyframes: { [key: string]: Record<string, string> }; duration: number } => {
  const { mass, stiffness, dampingRatio, initialVelocity, property, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};
  const precision = 0.01;
  let calculatedDuration = 0; // Duration calculated *within this helper*

  const initialValue = (initial as any)[propertyToStateKey(property)] ?? 0;
  const targetValue = (target as any)[propertyToStateKey(property)] ?? 0;
  let currentValue = initialValue;
  let currentVelocity = initialVelocity;
  const dt = 10;

  keyframePoints['0%'] = { [property]: `${currentValue}${getPropertyUnit(property)}` };

  for (let time = 0; ; time += dt) {
      const displacement = currentValue - targetValue;
      const springForce = -stiffness * displacement;
      const dampingForce = -dampingRatio * 2 * Math.sqrt(mass * stiffness) * currentVelocity;
      const totalForce = springForce + dampingForce;
      const acceleration = totalForce / mass;

      currentVelocity += acceleration * (dt / 1000);
      currentValue += currentVelocity * (dt / 1000);

      if (Math.abs(currentValue - targetValue) < precision && Math.abs(currentVelocity) < precision && time > 0) {
          calculatedDuration = time;
          keyframePoints['100%'] = { [property]: `${targetValue}${getPropertyUnit(property)}` };
          break;
      }

      const percent = `${Math.min(100, Math.round((time / (calculatedDuration || 1000)) * 100))}%`;
      if (!keyframePoints[percent] || percent === '0%') {
            keyframePoints[percent] = { [property]: `${currentValue.toFixed(3)}${getPropertyUnit(property)}` };
      }

      if (time > 10000) {
          calculatedDuration = 10000;
          keyframePoints['100%'] = { [property]: `${targetValue}${getPropertyUnit(property)}` };
          console.warn('Spring animation exceeded max duration');
          break;
      }
  }
  // Correct return for helper
  return { keyframes: keyframePoints, duration: calculatedDuration };
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
    property: string;
    steps: number;
  }
): { keyframes: { [key: string]: Record<string, string> }; duration: number } => {
   const { gravity, bounciness, friction, property, steps } = options;
   const keyframePoints: { [key: string]: Record<string, string> } = {};
   const precision = 0.1;
   const velocityPrecision = 0.1;
   let calculatedDuration = 0; // Duration calculated *within this helper*
   const dt = 10;

    const initialValue = (initial as any)[propertyToStateKey(property)] ?? 0;
    const targetValue = (target as any)[propertyToStateKey(property)] ?? 0;
    const initialVelocity = (initial as any)[`v${propertyToStateKey(property).charAt(0).toUpperCase() + propertyToStateKey(property).slice(1)}`] ?? 0;

    let currentValue = initialValue;
    let currentVelocity = initialVelocity;

    keyframePoints['0%'] = { [property]: `${currentValue}${getPropertyUnit(property)}` };

    for (let time = 0; ; time += dt) {
         currentVelocity += gravity * (dt / 1000);
         currentValue += currentVelocity * (dt / 1000);

        if (currentValue >= targetValue && currentVelocity > 0) {
             currentValue = targetValue;
             currentVelocity = -currentVelocity * bounciness;
             if (Math.abs(currentVelocity) < velocityPrecision) {
                 currentVelocity = 0;
             }
        }

         if (Math.abs(currentValue - targetValue) < precision && Math.abs(currentVelocity) < velocityPrecision && time > 100) {
              calculatedDuration = time;
              keyframePoints['100%'] = { [property]: `${targetValue}${getPropertyUnit(property)}` };
              break;
         }

        const percent = `${Math.min(100, Math.round((time / (calculatedDuration || 1000)) * 100))}%`;
        if (!keyframePoints[percent] || percent === '0%') {
            keyframePoints[percent] = { [property]: `${currentValue.toFixed(3)}${getPropertyUnit(property)}` };
        }

         if (time > 15000) {
             calculatedDuration = 15000;
             keyframePoints['100%'] = { [property]: `${targetValue}${getPropertyUnit(property)}` };
             console.warn('Bounce animation exceeded max duration');
             break;
         }
    }
   // Correct return for helper
   return { keyframes: keyframePoints, duration: calculatedDuration };
};

/**
 * Generate elastic/stretchy keyframes
 */
const generateElasticKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    elasticity: number;
    property: string;
    stiffness: number;
    damping: number;
    steps: number;
  }
): { keyframes: { [key: string]: Record<string, string> }; duration: number } => {
  const { elasticity, property, stiffness, damping, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};
  let calculatedDuration = 0;

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
      [property]: `${x}px, ${y}px, ${rotation}deg, ${scale}`,
      opacity: `${opacity}`,
    };
  }

  calculatedDuration = 1000;
  return { keyframes: keyframePoints, duration: calculatedDuration };
};

/**
 * Generate liquid/squishy keyframes
 */
const generateLiquidKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    viscosity: number;
    property: string;
    steps: number;
  }
): { keyframes: { [key: string]: Record<string, string> }; duration: number } => {
  const { viscosity, property, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};
  let calculatedDuration = 0;

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
      [property]: `${x}px, ${y}px, ${rotation}deg, ${baseScale * xScale}, ${baseScale * yScale}`,
      opacity: `${opacity}`,
    };
  }

  calculatedDuration = 1000;
  return { keyframes: keyframePoints, duration: calculatedDuration };
};

/**
 * Generate inertia keyframes
 */
const generateInertiaKeyframes = (
  initial: PhysicsState,
  target: PhysicsState,
  options: {
    friction: number;
    initialVelocity: number;
    property: string;
    steps: number;
  }
): { keyframes: { [key: string]: Record<string, string> }; duration: number } => {
  const { friction, initialVelocity, property, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};
  let calculatedDuration = 0;

  // Current position
  let x = initial.x;
  let y = initial.y;
  let vx = initial.vx || (target.x - initial.x) * 0.05;
  let vy = initial.vy || (target.y - initial.y) * 0.05;
  let vRotation = initial.vRotation || (target.rotation - initial.rotation) * 0.05;
  let vScale = initial.vScale || (target.scale - initial.scale) * 0.05;

  // Current position
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
      [property]: `${x}px, ${y}px, ${rotation}deg, ${scale}`,
      opacity: `${opacity}`,
    };
  }

  calculatedDuration = 1000;
  return { keyframes: keyframePoints, duration: calculatedDuration };
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
    initialVelocity: number;
    property: string;
    steps: number;
  }
): { keyframes: { [key: string]: Record<string, string> }; duration: number } => {
  const { strength, radius, initialVelocity, property, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};
  let calculatedDuration = 0;

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
      [property]: `${x}px, ${y}px, ${rotation}deg, ${scale}`,
      opacity: `${opacity}`,
    };
  }

  calculatedDuration = 1000;
  return { keyframes: keyframePoints, duration: calculatedDuration };
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
    property: string;
    steps: number;
  }
): { keyframes: { [key: string]: Record<string, string> }; duration: number } => {
  const { springTension, friction, property, steps } = options;
  const keyframePoints: { [key: string]: Record<string, string> } = {};
  let calculatedDuration = 0;

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
      [property]: `${x}px, ${y}px, ${rotation}deg, ${scale}`,
      opacity: `${opacity}`,
    };
  }

  calculatedDuration = 1000;
  return { keyframes: keyframePoints, duration: calculatedDuration };
};

/**
 * Create a advanced physics animation with accessibility considerations
 * @param options Physics animation options
 * @returns CSS animation string or reduced motion alternative
 */
export const advancedPhysicsAnimation = (
  options: AdvancedPhysicsOptions
): ReturnType<typeof css> => {
  // Get motion sensitivity configuration
  const motionSensitivity = getMotionSensitivity(options.sensitivity || MotionSensitivityLevel.NONE);
  
  // Check if animation complexity exceeds user's preference
  if (
    motionSensitivity.maxAllowedComplexity &&
    (Object.values(AnimationComplexity).indexOf(options.complexity || AnimationComplexity.STANDARD) >
    Object.values(AnimationComplexity).indexOf(motionSensitivity.maxAllowedComplexity))
  ) {
    // Return empty animation for reduced motion
    return css`
      animation: none;
      transition: none;
      transform: none;
    `;
  }

  // Generate keyframes based on physics simulation
  const { keyframes: animationKeyframes, css: animationCss, duration } = generatePhysicsKeyframes(options);

  // Apply GPU acceleration if enabled
  const gpuAcceleration = options.gpuAccelerated ? getOptimizedGPUAcceleration(4) : 'none';

  // Return the final animation CSS
  return css`
    ${animationKeyframes}
    ${animationCss}
    ${gpuAcceleration ? `transform: ${gpuAcceleration};` : ''}
  `;
};

// Helper to map CSS property to PhysicsState key
const propertyToStateKey = (prop: string): keyof PhysicsState => {
    switch(prop.toLowerCase()) {
        case 'x':
        case 'translatex': return 'x';
        case 'y':
        case 'translatey': return 'y';
        case 'scale':
        case 'scaleX':
        case 'scaleY': return 'scale';
        case 'rotate':
        case 'rotation': return 'rotation';
        case 'opacity': return 'opacity';
        default:
            console.warn(`Unsupported property mapping: ${prop}, defaulting to x`);
            return 'x'; // Default or throw error?
    }
}

// Helper to get units for CSS property
const getPropertyUnit = (prop: string): string => {
     switch(prop.toLowerCase()) {
        case 'x':
        case 'translatex':
        case 'y':
        case 'translatey': return 'px'; // Assuming pixels for translation
        case 'rotate':
        case 'rotation': return 'deg';
        case 'scale':
        case 'scaleX':
        case 'scaleY':
        case 'opacity': return ''; // No unit for scale/opacity
        default: return '';
    }
}
