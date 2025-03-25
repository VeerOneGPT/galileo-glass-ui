/**
 * Spring Animation System
 * 
 * Physics-based spring animations for more natural motion
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../core/cssUtils';

/**
 * Spring animation options
 */
export interface SpringAnimationOptions {
  /**
   * Mass of the spring (higher = more inertia)
   */
  mass?: number;
  
  /**
   * Stiffness of the spring (higher = faster)
   */
  stiffness?: number;
  
  /**
   * Damping ratio (1 = critically damped, <1 = underdamped/bouncy, >1 = overdamped)
   */
  dampingRatio?: number;
  
  /**
   * Initial velocity (pixels/ms)
   */
  initialVelocity?: number;
  
  /**
   * Duration (if specified, creates a duration-based spring)
   */
  duration?: number;
  
  /**
   * Properties to animate
   */
  properties?: ('transform' | 'opacity' | 'width' | 'height' | string)[];
  
  /**
   * Start values for properties
   */
  from?: Record<string, string | number>;
  
  /**
   * End values for properties
   */
  to?: Record<string, string | number>;
  
  /**
   * Delay before animation starts (ms)
   */
  delay?: number;
  
  /**
   * If true, animation will repeat
   */
  repeat?: boolean | number;
  
  /**
   * If true, animation will alternate
   */
  alternate?: boolean;
  
  /**
   * If true, animation fill mode will be forwards
   */
  fillForwards?: boolean;
  
  /**
   * If true, will optimize for GPU acceleration
   */
  gpuAccelerated?: boolean;
  
  /**
   * If true, reduces motion for accessibility
   */
  reducedMotion?: boolean;
  
  /**
   * Alternative animation for reduced motion
   */
  reducedMotionAlternative?: string;
}

/**
 * Get CSS animation timing function from spring parameters
 */
const getSpringTimingFunction = (
  mass: number = 1,
  stiffness: number = 170,
  dampingRatio: number = 0.8,
  initialVelocity: number = 0
): string => {
  // Calculate damping from damping ratio and other parameters
  const damping = dampingRatio * 2 * Math.sqrt(mass * stiffness);
  
  // Generate the cubic-bezier curve for the spring
  // These calculations are simplified approximations of spring physics
  const b = damping / (2 * Math.sqrt(stiffness * mass));
  const c1 = initialVelocity / stiffness;
  const c2 = 1 - b;
  
  // Clamp values to valid cubic-bezier range (0 to 1)
  const x1 = Math.min(Math.max(c1, 0), 1);
  const y1 = Math.min(Math.max(c2, 0), 1);
  const x2 = Math.min(Math.max(1 - c1, 0), 1);
  const y2 = Math.min(Math.max(1 + c2, 0), 1);
  
  return `cubic-bezier(${x1.toFixed(3)}, ${y1.toFixed(3)}, ${x2.toFixed(3)}, ${y2.toFixed(3)})`;
};

/**
 * Calculate optimal animation duration based on spring parameters
 */
const calculateDuration = (
  mass: number = 1,
  stiffness: number = 170,
  dampingRatio: number = 0.8
): number => {
  // Higher mass and lower stiffness = longer duration
  // The calculation is a simplified model of spring physics
  const baseDuration = Math.sqrt(mass / stiffness) * 1000;
  
  // Adjust for damping ratio
  // Underdamped systems (bouncy) need more time to settle
  const dampingFactor = (dampingRatio < 1) ? 1 + (1 - dampingRatio) * 2 : 1;
  
  return Math.max(Math.min(baseDuration * dampingFactor, 5000), 200);
};

/**
 * Create animation name and keyframes for given properties
 */
const createAnimationKeyframes = (
  from: Record<string, string | number>,
  to: Record<string, string | number>,
  prefix: string = 'spring'
): { name: string; keyframes: string } => {
  // Generate a unique animation name
  const animationId = Math.random().toString(36).substring(2, 9);
  const animationName = `${prefix}Animation${animationId}`;
  
  // Create keyframes
  const fromStyles = Object.entries(from)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
  
  const toStyles = Object.entries(to)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
  
  const keyframes = `
    @keyframes ${animationName} {
      from { ${fromStyles} }
      to { ${toStyles} }
    }
  `;
  
  return { name: animationName, keyframes };
};

/**
 * Creates a spring-based animation
 */
export const springAnimation = (options: SpringAnimationOptions = {}) => {
  const {
    mass = 1,
    stiffness = 170,
    dampingRatio = 0.8,
    initialVelocity = 0,
    duration,
    properties = ['transform'],
    from = {},
    to = {},
    delay = 0,
    repeat = false,
    alternate = false,
    fillForwards = true,
    gpuAccelerated = true,
    reducedMotion = false,
    reducedMotionAlternative,
  } = options;
  
  // If reduced motion is enabled, use alternative animation or simple fade
  if (reducedMotion) {
    if (reducedMotionAlternative) {
      return cssWithKebabProps`
        ${reducedMotionAlternative}
      `;
    }
    
    // Default reduced motion is a simple opacity change
    return cssWithKebabProps`
      transition: opacity 0.3s ease;
    `;
  }
  
  // Calculate spring timing function
  const timingFunction = getSpringTimingFunction(mass, stiffness, dampingRatio, initialVelocity);
  
  // Calculate animation duration if not specified
  const animationDuration = duration || calculateDuration(mass, stiffness, dampingRatio);
  
  // Set default from/to values if not provided
  const defaultFrom: Record<string, string | number> = {};
  const defaultTo: Record<string, string | number> = {};
  
  properties.forEach(prop => {
    if (prop === 'transform' && !from[prop] && !to[prop]) {
      defaultFrom[prop] = 'translateY(20px)';
      defaultTo[prop] = 'translateY(0)';
    } else if (prop === 'opacity' && !from[prop] && !to[prop]) {
      defaultFrom[prop] = 0;
      defaultTo[prop] = 1;
    }
  });
  
  // Merge defaults with provided values
  const mergedFrom = { ...defaultFrom, ...from };
  const mergedTo = { ...defaultTo, ...to };
  
  // Create animation keyframes
  const { name: animationName, keyframes } = createAnimationKeyframes(
    mergedFrom,
    mergedTo,
    'spring'
  );
  
  // Configure animation properties
  const repeatValue = repeat === true ? 'infinite' : typeof repeat === 'number' ? repeat : '1';
  const alternateValue = alternate ? 'alternate' : 'normal';
  const fillMode = fillForwards ? 'forwards' : 'none';
  
  // Add GPU acceleration if requested
  const gpuStyles = gpuAccelerated ? `
    will-change: ${properties.join(', ')};
    backface-visibility: hidden;
  ` : '';
  
  // Build the final CSS
  return cssWithKebabProps`
    ${keyframes}
    animation-name: ${animationName};
    animation-duration: ${animationDuration}ms;
    animation-timing-function: ${timingFunction};
    animation-delay: ${delay}ms;
    animation-iteration-count: ${repeatValue};
    animation-direction: ${alternateValue};
    animation-fill-mode: ${fillMode};
    ${gpuStyles}
  `;
};

export default springAnimation;