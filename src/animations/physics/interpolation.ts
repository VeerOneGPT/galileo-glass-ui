/**
 * Animation Interpolation Functions
 *
 * A comprehensive library of easing and interpolation functions for creating
 * various animation curves. These functions can be used with the physics system
 * to create more natural and engaging animations.
 */

/**
 * Interpolation function type
 * Takes a progress value between 0 and 1 and returns a transformed value
 */
export type InterpolationFunction = (t: number) => number;

/**
 * Extended interpolation function with metadata
 */
export interface EasingFunction {
  /** The easing implementation */
  function: InterpolationFunction;
  
  /** Human-readable name of the easing function */
  name: string;
  
  /** Description of the easing behavior */
  description: string;
  
  /** Category for grouping similar easing functions */
  category: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'elastic' | 'bounce' | 'spring' | 'special';
  
  /** Intensity of the effect (1-5, with 5 being most dramatic) */
  intensity: 1 | 2 | 3 | 4 | 5;
}

/**
 * Clamping function to ensure values stay within 0-1 range
 */
export const clamp = (n: number, min = 0, max = 1): number => {
  return Math.min(Math.max(n, min), max);
};

/**
 * Linear interpolation between two values
 * @param start Start value
 * @param end End value
 * @param t Interpolation factor (0-1)
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * clamp(t);
};

/**
 * Linear easing (no easing)
 */
export const linear: EasingFunction = {
  function: (t) => clamp(t),
  name: 'Linear',
  description: 'Constant speed with no easing',
  category: 'linear',
  intensity: 1
};

// Quadratic easing functions

/**
 * Quadratic ease in
 */
export const easeInQuad: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t * t;
  },
  name: 'Ease In Quad',
  description: 'Accelerating from zero velocity (quadratic)',
  category: 'ease-in',
  intensity: 2
};

/**
 * Quadratic ease out
 */
export const easeOutQuad: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t * (2 - t);
  },
  name: 'Ease Out Quad',
  description: 'Decelerating to zero velocity (quadratic)',
  category: 'ease-out',
  intensity: 2
};

/**
 * Quadratic ease in-out
 */
export const easeInOutQuad: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  name: 'Ease In Out Quad',
  description: 'Acceleration until halfway, then deceleration (quadratic)',
  category: 'ease-in-out',
  intensity: 2
};

// Cubic easing functions

/**
 * Cubic ease in
 */
export const easeInCubic: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t * t * t;
  },
  name: 'Ease In Cubic',
  description: 'Accelerating from zero velocity (cubic)',
  category: 'ease-in',
  intensity: 3
};

/**
 * Cubic ease out
 */
export const easeOutCubic: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return (--t) * t * t + 1;
  },
  name: 'Ease Out Cubic',
  description: 'Decelerating to zero velocity (cubic)',
  category: 'ease-out',
  intensity: 3
};

/**
 * Cubic ease in-out
 */
export const easeInOutCubic: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  name: 'Ease In Out Cubic',
  description: 'Acceleration until halfway, then deceleration (cubic)',
  category: 'ease-in-out',
  intensity: 3
};

// Quartic easing functions

/**
 * Quartic ease in
 */
export const easeInQuart: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t * t * t * t;
  },
  name: 'Ease In Quart',
  description: 'Accelerating from zero velocity (quartic)',
  category: 'ease-in',
  intensity: 4
};

/**
 * Quartic ease out
 */
export const easeOutQuart: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return 1 - (--t) * t * t * t;
  },
  name: 'Ease Out Quart',
  description: 'Decelerating to zero velocity (quartic)',
  category: 'ease-out',
  intensity: 4
};

/**
 * Quartic ease in-out
 */
export const easeInOutQuart: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
  },
  name: 'Ease In Out Quart',
  description: 'Acceleration until halfway, then deceleration (quartic)',
  category: 'ease-in-out',
  intensity: 4
};

// Quintic easing functions

/**
 * Quintic ease in
 */
export const easeInQuint: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t * t * t * t * t;
  },
  name: 'Ease In Quint',
  description: 'Accelerating from zero velocity (quintic)',
  category: 'ease-in',
  intensity: 5
};

/**
 * Quintic ease out
 */
export const easeOutQuint: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return 1 + (--t) * t * t * t * t;
  },
  name: 'Ease Out Quint',
  description: 'Decelerating to zero velocity (quintic)',
  category: 'ease-out',
  intensity: 5
};

/**
 * Quintic ease in-out
 */
export const easeInOutQuint: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
  },
  name: 'Ease In Out Quint',
  description: 'Acceleration until halfway, then deceleration (quintic)',
  category: 'ease-in-out',
  intensity: 5
};

// Sine easing functions

/**
 * Sine ease in
 */
export const easeInSine: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return 1 - Math.cos(t * Math.PI / 2);
  },
  name: 'Ease In Sine',
  description: 'Gradual acceleration using a sine curve',
  category: 'ease-in',
  intensity: 2
};

/**
 * Sine ease out
 */
export const easeOutSine: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return Math.sin(t * Math.PI / 2);
  },
  name: 'Ease Out Sine',
  description: 'Gradual deceleration using a sine curve',
  category: 'ease-out',
  intensity: 2
};

/**
 * Sine ease in-out
 */
export const easeInOutSine: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return -(Math.cos(Math.PI * t) - 1) / 2;
  },
  name: 'Ease In Out Sine',
  description: 'Sinusoidal acceleration and deceleration',
  category: 'ease-in-out',
  intensity: 2
};

// Exponential easing functions

/**
 * Exponential ease in
 */
export const easeInExpo: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
  },
  name: 'Ease In Expo',
  description: 'Exponential acceleration from zero velocity',
  category: 'ease-in',
  intensity: 5
};

/**
 * Exponential ease out
 */
export const easeOutExpo: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },
  name: 'Ease Out Expo',
  description: 'Exponential deceleration to zero velocity',
  category: 'ease-out',
  intensity: 5
};

/**
 * Exponential ease in-out
 */
export const easeInOutExpo: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  name: 'Ease In Out Expo',
  description: 'Exponential acceleration until halfway, then deceleration',
  category: 'ease-in-out',
  intensity: 5
};

// Circular easing functions

/**
 * Circular ease in
 */
export const easeInCirc: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return 1 - Math.sqrt(1 - t * t);
  },
  name: 'Ease In Circ',
  description: 'Circular acceleration from zero velocity',
  category: 'ease-in',
  intensity: 3
};

/**
 * Circular ease out
 */
export const easeOutCirc: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return Math.sqrt(1 - (--t) * t);
  },
  name: 'Ease Out Circ',
  description: 'Circular deceleration to zero velocity',
  category: 'ease-out',
  intensity: 3
};

/**
 * Circular ease in-out
 */
export const easeInOutCirc: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  },
  name: 'Ease In Out Circ',
  description: 'Circular acceleration until halfway, then deceleration',
  category: 'ease-in-out',
  intensity: 3
};

// Back easing functions (with overshoot)

/**
 * Back ease in
 */
export const easeInBack: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  name: 'Ease In Back',
  description: 'Overshooting acceleration from zero velocity',
  category: 'ease-in',
  intensity: 4
};

/**
 * Back ease out
 */
export const easeOutBack: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  name: 'Ease Out Back',
  description: 'Overshooting deceleration to zero velocity',
  category: 'ease-out',
  intensity: 4
};

/**
 * Back ease in-out
 */
export const easeInOutBack: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  name: 'Ease In Out Back',
  description: 'Overshooting acceleration until halfway, then deceleration',
  category: 'ease-in-out',
  intensity: 4
};

// Elastic easing functions

/**
 * Elastic ease in
 */
export const easeInElastic: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    if (t === 0) return 0;
    if (t === 1) return 1;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
  },
  name: 'Ease In Elastic',
  description: 'Elastic bounce effect at the beginning',
  category: 'elastic',
  intensity: 5
};

/**
 * Elastic ease out
 */
export const easeOutElastic: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  name: 'Ease Out Elastic',
  description: 'Elastic bounce effect at the end',
  category: 'elastic',
  intensity: 5
};

/**
 * Elastic ease in-out
 */
export const easeInOutElastic: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1;
  },
  name: 'Ease In Out Elastic',
  description: 'Elastic bounce effect at both the beginning and end',
  category: 'elastic',
  intensity: 5
};

// Bounce easing functions

/**
 * Bounce ease in
 */
export const easeInBounce: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return 1 - easeOutBounce.function(1 - t);
  },
  name: 'Ease In Bounce',
  description: 'Bouncing effect at the beginning',
  category: 'bounce',
  intensity: 4
};

/**
 * Bounce ease out
 */
export const easeOutBounce: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  name: 'Ease Out Bounce',
  description: 'Bouncing effect at the end',
  category: 'bounce',
  intensity: 4
};

/**
 * Bounce ease in-out
 */
export const easeInOutBounce: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t < 0.5
      ? (1 - easeOutBounce.function(1 - 2 * t)) / 2
      : (1 + easeOutBounce.function(2 * t - 1)) / 2;
  },
  name: 'Ease In Out Bounce',
  description: 'Bouncing effect at both the beginning and end',
  category: 'bounce',
  intensity: 4
};

// Spring-like easing functions

/**
 * Light spring oscillation
 */
export const springLight: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    const decay = 8; // Higher = less oscillation
    const frequency = 10; // Higher = more oscillations
    return 1 - Math.cos(t * frequency) * Math.exp(-decay * t);
  },
  name: 'Spring Light',
  description: 'Gentle spring-like oscillation with quick settling',
  category: 'spring',
  intensity: 2
};

/**
 * Medium spring oscillation
 */
export const springMedium: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    const decay = 5; // Higher = less oscillation
    const frequency = 12; // Higher = more oscillations
    return 1 - Math.cos(t * frequency) * Math.exp(-decay * t);
  },
  name: 'Spring Medium',
  description: 'Moderate spring-like oscillation with medium settling',
  category: 'spring',
  intensity: 3
};

/**
 * Heavy spring oscillation
 */
export const springHeavy: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    const decay = 3; // Higher = less oscillation
    const frequency = 15; // Higher = more oscillations
    return 1 - Math.cos(t * frequency) * Math.exp(-decay * t);
  },
  name: 'Spring Heavy',
  description: 'Strong spring-like oscillation with slow settling',
  category: 'spring',
  intensity: 5
};

// Special/unique easing functions

/**
 * Step function (staircase effect)
 */
export const steps: (steps: number) => EasingFunction = (steps: number) => ({
  function: (t) => {
    t = clamp(t);
    return Math.floor(t * steps) / steps;
  },
  name: `Steps (${steps})`,
  description: `Staircase function with ${steps} equal steps`,
  category: 'special',
  intensity: 3
});

/**
 * Smooth step (smoothed linear interpolation)
 */
export const smoothStep: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t * t * (3 - 2 * t);
  },
  name: 'Smooth Step',
  description: 'Smoothed linear interpolation with ease in/out',
  category: 'special',
  intensity: 2
};

/**
 * Smoother step (higher-order smoothing)
 */
export const smootherStep: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    return t * t * t * (t * (t * 6 - 15) + 10);
  },
  name: 'Smoother Step',
  description: 'Higher-order smoothed interpolation with ease in/out',
  category: 'special',
  intensity: 2
};

/**
 * Slow-in-middle easing (acceleration followed by deceleration then acceleration)
 */
export const slowInMiddle: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    // Moving slowly in the middle region
    if (t > 0.3 && t < 0.7) {
      return 0.3 + (t - 0.3) * 0.5;
    }
    // Fast at the beginning and end
    return t < 0.3 ? t * 1.5 : 0.5 + (t - 0.7) * 1.5;
  },
  name: 'Slow In Middle',
  description: 'Slows down in the middle, fast at the beginning and end',
  category: 'special',
  intensity: 3
};

/**
 * Anticipation easing (small back motion before main motion)
 */
export const anticipate: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    // Small backwards movement in the first 15% of the animation
    if (t < 0.15) {
      return t * -0.5;
    }
    // Then accelerate forward with an ease-out curve
    return (t - 0.15) * 1.18;
  },
  name: 'Anticipate',
  description: 'Small backwards movement before moving forward',
  category: 'special',
  intensity: 4
};

/**
 * Overshoot and settle easing
 */
export const overshootAndSettle: EasingFunction = {
  function: (t) => {
    t = clamp(t);
    // Overshoot
    if (t < 0.7) {
      return t * 1.3;
    }
    // Then settle back
    return 0.91 + (t - 0.7) * 0.3;
  },
  name: 'Overshoot and Settle',
  description: 'Moves past the target then settles back',
  category: 'special',
  intensity: 3
};

/**
 * Hermite spline interpolation with custom control points
 */
export const hermiteSpline = (
  p0: number,
  p1: number,
  m0: number,
  m1: number
): EasingFunction => ({
  function: (t) => {
    t = clamp(t);
    const t2 = t * t;
    const t3 = t2 * t;
    
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    
    return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
  },
  name: 'Hermite Spline',
  description: 'Custom hermite spline interpolation with control points',
  category: 'special',
  intensity: 3
});

/**
 * Harmonic oscillation with decay
 */
export const harmonicOscillation = (
  frequency = 10,
  damping = 5
): EasingFunction => ({
  function: (t) => {
    t = clamp(t);
    // Harmonic motion with exponential decay
    return 1 - Math.cos(frequency * t * Math.PI) * Math.exp(-damping * t);
  },
  name: `Harmonic (f=${frequency}, d=${damping})`,
  description: 'Harmonic oscillation with exponential decay',
  category: 'special',
  intensity: 4
});

/**
 * Apply easing function to a value with specified range
 */
export const applyEasing = (
  t: number,
  easing: EasingFunction | keyof typeof Easings | string,
  start = 0,
  end = 1
): number => {
  let easingFn: InterpolationFunction | undefined;
  
  if (typeof easing === 'function') {
    easingFn = easing as InterpolationFunction; 
  } else if (typeof easing === 'object' && easing.function) { 
    easingFn = easing.function;
  } else if (typeof easing === 'string' && Easings[easing as keyof typeof Easings]) {
    const easingObject = Easings[easing as keyof typeof Easings];
    if (typeof easingObject === 'object' && easingObject.function) {
       easingFn = easingObject.function;
    } else {
       console.warn(`Easing function generator "${easing}" cannot be used directly. Defaulting to linear.`);
       easingFn = Easings.linear.function;
    }
  } else {
    console.warn(`Easing function "${easing}" not found. Defaulting to linear.`);
    easingFn = Easings.linear.function;
  }

  const time = Math.max(0, Math.min(1, t));

  if (typeof easingFn !== 'function') {
      return time; // Linear fallback
  }
  return start + (end - start) * easingFn(time); 
};

/**
 * Compose multiple easing functions sequentially
 */
export const composeEasings = (
  easings: (EasingFunction | InterpolationFunction)[],
  segments: number[] = [] // Values between 0-1 representing segment boundaries
): EasingFunction => {
  // If no segments provided, distribute evenly
  const bounds = segments.length > 0 
    ? [0, ...segments.filter(s => s > 0 && s < 1).sort((a, b) => a - b), 1]
    : easings.map((_, i) => i / easings.length).concat(1);
    
  return {
    function: (t) => {
      t = clamp(t);
      
      // Find which segment we're in
      for (let i = 0; i < bounds.length - 1; i++) {
        if (t >= bounds[i] && t <= bounds[i + 1]) {
          // Scale t to the local segment
          const segmentLength = bounds[i + 1] - bounds[i];
          const localT = (t - bounds[i]) / segmentLength;
          
          // Apply the corresponding easing function
          const easingFn = typeof easings[i] === 'function' 
            ? easings[i] as InterpolationFunction
            : (easings[i] as EasingFunction).function;
          
          return bounds[i] + segmentLength * easingFn(localT);
        }
      }
      
      // Fallback (should never reach here if t is clamped)
      return t;
    },
    name: 'Composed Easing',
    description: 'Multiple easing functions composed sequentially',
    category: 'special',
    intensity: 3
  };
};

/**
 * Parametrized interpolation between two easing functions
 */
export const blendEasings = (
  easing1: EasingFunction | InterpolationFunction,
  easing2: EasingFunction | InterpolationFunction,
  blend = 0.5
): EasingFunction => {
  const easingFn1 = typeof easing1 === 'function' ? easing1 : easing1.function;
  const easingFn2 = typeof easing2 === 'function' ? easing2 : easing2.function;
  
  return {
    function: (t) => {
      t = clamp(t);
      return lerp(easingFn1(t), easingFn2(t), blend);
    },
    name: 'Blended Easing',
    description: `Blend between two easing functions (${blend * 100}% blend)`,
    category: 'special',
    intensity: 3
  };
};

/**
 * Bezier curve interpolation
 */
export const bezier = (x1: number, y1: number, x2: number, y2: number): EasingFunction => {
  // Inspired by CSS cubic-bezier calculation

  // Constants for cubic bezier curve
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  
  // Helper to solve for x given t in the bezier curve
  const solveCurveX = (t: number): number => {
    return ((ax * t + bx) * t + cx) * t;
  };
  
  // Derivative of solveCurveX
  const solveCurveDerivativeX = (t: number): number => {
    return (3 * ax * t + 2 * bx) * t + cx;
  };
  
  // Find t for a given x using Newton's method
  const solveWithNewtonRaphsonIteration = (x: number, t: number): number => {
    for (let i = 0; i < 4; i++) {
      const currentX = solveCurveX(t) - x;
      if (Math.abs(currentX) < 1e-5) {
        return t;
      }
      const currentSlope = solveCurveDerivativeX(t);
      if (Math.abs(currentSlope) < 1e-5) {
        break;
      }
      t -= currentX / currentSlope;
    }
    return t;
  };
  
  // Find t for a given x using binary subdivision
  const findTFromX = (x: number): number => {
    let t = x;
    
    // Try Newton's method first for a good approximation
    if (x > 0 && x < 1) {
      t = solveWithNewtonRaphsonIteration(x, x);
    }
    
    // Calculate y from t
    const y = ((ay * t + by) * t + cy) * t;
    
    return y;
  };
  
  return {
    function: (t) => {
      t = clamp(t);
      if (t === 0 || t === 1) return t;
      return findTFromX(t);
    },
    name: `Bezier (${x1.toFixed(2)}, ${y1.toFixed(2)}, ${x2.toFixed(2)}, ${y2.toFixed(2)})`,
    description: 'Cubic bezier curve interpolation',
    category: 'special',
    intensity: 4
  };
};

/**
 * CSS standard easing functions
 */
export const cssStandard = {
  ease: bezier(0.25, 0.1, 0.25, 1),
  easeIn: bezier(0.42, 0, 1, 1),
  easeOut: bezier(0, 0, 0.58, 1),
  easeInOut: bezier(0.42, 0, 0.58, 1)
};

/**
 * Material Design easing functions
 */
export const materialDesign = {
  standard: bezier(0.4, 0, 0.2, 1),
  decelerated: bezier(0, 0, 0.2, 1),
  accelerated: bezier(0.4, 0, 1, 1)
};

/**
 * Create a custom spring easing function
 */
export const createSpringEasing = (
  mass = 1,
  stiffness = 100,
  damping = 10,
  initialVelocity = 0
): EasingFunction => {
  // Calculate factors for analytical solution
  const dampingRatio = damping / (2 * Math.sqrt(mass * stiffness));
  const angularFreq = Math.sqrt(stiffness / mass);
  
  let easingFn: InterpolationFunction;
  
  if (dampingRatio < 1) {
    // Underdamped case (oscillation)
    const dampedFreq = angularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
    
    easingFn = (t) => {
      t = clamp(t);
      if (t === 0) return 0;
      if (t === 1) return 1;
      
      // Analytical solution for underdamped spring
      const decay = Math.exp(-dampingRatio * angularFreq * t);
      const oscillation = Math.sin(dampedFreq * t);
      const coeff = (initialVelocity + dampingRatio * angularFreq) / dampedFreq;
      
      return 1 - decay * (Math.cos(dampedFreq * t) + coeff * oscillation);
    };
  } else if (dampingRatio === 1) {
    // Critically damped case
    easingFn = (t) => {
      t = clamp(t);
      if (t === 0) return 0;
      if (t === 1) return 1;
      
      // Analytical solution for critically damped spring
      const decay = Math.exp(-angularFreq * t);
      return 1 - decay * (1 + angularFreq * t);
    };
  } else {
    // Overdamped case
    const alpha = angularFreq * Math.sqrt(dampingRatio * dampingRatio - 1);
    
    easingFn = (t) => {
      t = clamp(t);
      if (t === 0) return 0;
      if (t === 1) return 1;
      
      // Analytical solution for overdamped spring
      const decay = Math.exp(-dampingRatio * angularFreq * t);
      const decay1 = Math.exp((dampingRatio * angularFreq - alpha) * t);
      const decay2 = Math.exp((dampingRatio * angularFreq + alpha) * t);
      
      return 1 - decay * ((dampingRatio * angularFreq + alpha) * decay1 - (dampingRatio * angularFreq - alpha) * decay2) / (2 * alpha);
    };
  }
  
  return {
    function: easingFn,
    name: `Spring (m=${mass}, k=${stiffness}, c=${damping})`,
    description: `Custom spring with mass=${mass}, stiffness=${stiffness}, damping=${damping}`,
    category: 'spring',
    intensity: 4
  };
};

/**
 * Collection of all easing functions
 */
export const Easings = {
  // Basic
  linear,
  
  // Quad
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  
  // Cubic
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  
  // Quart
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  
  // Quint
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  
  // Sine
  easeInSine,
  easeOutSine,
  easeInOutSine,
  
  // Expo
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  
  // Circ
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  
  // Back
  easeInBack,
  easeOutBack,
  easeInOutBack,
  
  // Elastic
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  
  // Bounce
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  
  // Spring
  springLight,
  springMedium,
  springHeavy,
  
  // Special
  steps,
  smoothStep,
  smootherStep,
  slowInMiddle,
  anticipate,
  overshootAndSettle,
  
  // CSS standard
  cssEase: cssStandard.ease,
  cssEaseIn: cssStandard.easeIn,
  cssEaseOut: cssStandard.easeOut,
  cssEaseInOut: cssStandard.easeInOut,
  
  // Material Design
  materialStandard: materialDesign.standard,
  materialDecelerated: materialDesign.decelerated,
  materialAccelerated: materialDesign.accelerated,
  
  // Creator functions
  bezier,
  createSpringEasing,
  hermiteSpline,
  harmonicOscillation,
  composeEasings,
  blendEasings
};

// Default export of all easing functions
export default Easings;