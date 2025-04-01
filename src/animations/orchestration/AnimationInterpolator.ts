/**
 * Animation Interpolator
 *
 * Provides interpolation utilities for creating smooth transitions between animation states.
 * This system bridges the gap between the state machine and the physics engine, allowing
 * for dynamic interpolation between states with various easing functions and blending modes.
 */

import { EasingFunction, bezier, lerp, clamp } from '../physics/interpolation';
import { AnimationState, StateTransition } from './AnimationStateMachine';

/**
 * Interpolation types for different animation properties
 */
export enum InterpolationType {
  /** Linear interpolation for numeric values */
  NUMBER = 'number',
  
  /** Color interpolation with proper RGB/HSL handling */
  COLOR = 'color',
  
  /** Transform interpolation with decomposition */
  TRANSFORM = 'transform',
  
  /** Path interpolation for SVG path animations */
  PATH = 'path',
  
  /** Object interpolation for complex property sets */
  OBJECT = 'object',
  
  /** Array interpolation */
  ARRAY = 'array',
  
  /** String interpolation with template support */
  STRING = 'string',
  
  /** CSS value interpolation */
  CSS_VALUE = 'css-value',
}

/**
 * Blend modes for combining multiple animations
 */
export enum BlendMode {
  /** Override values from second animation */
  OVERRIDE = 'override',
  
  /** Add values together (for numbers, transforms) */
  ADD = 'add',
  
  /** Multiply values together (for scaling effects) */
  MULTIPLY = 'multiply',
  
  /** Screen blend mode (for colors, lighting effects) */
  SCREEN = 'screen',
  
  /** Average the values */
  AVERAGE = 'average',
  
  /** Use min value between animations */
  MIN = 'min',
  
  /** Use max value between animations */
  MAX = 'max',
  
  /** Custom blending function */
  CUSTOM = 'custom',
}

/**
 * Transition easing options
 */
export interface TransitionEasingOptions {
  /** Easing function for the transition */
  easing?: EasingFunction;
  
  /** Bezier curve parameters for custom easing */
  bezier?: [number, number, number, number];
  
  /** Elastic configuration for bounce effects */
  elastic?: {
    amplitude?: number;
    period?: number;
  };
  
  /** Steps for step-based easing */
  steps?: {
    count: number;
    position?: 'start' | 'end' | 'both';
  };
  
  /** Composite easing with multiple functions */
  composite?: Array<{
    easing: EasingFunction;
    weight: number;
  }>;
}

/**
 * Interpolation configuration for a transition
 */
export interface InterpolationConfig {
  /** Properties to interpolate */
  properties: Record<string, {
    /** Type of interpolation for this property */
    type: InterpolationType;
    
    /** Custom interpolation function */
    interpolator?: (from: unknown, to: unknown, progress: number) => unknown;
    
    /** Value snap points */
    snapPoints?: number[];
    
    /** Value limits */
    clamp?: [number, number];
    
    /** Property-specific easing */
    easing?: EasingFunction;
    
    /** Property-specific duration */
    duration?: number;
    
    /** Property-specific delay */
    delay?: number;
  }>;
  
  /** Global easing settings for all properties */
  easing?: TransitionEasingOptions;
  
  /** Blend mode settings */
  blendMode?: BlendMode;
  
  /** Custom blending function if using CUSTOM blend mode */
  blendFunction?: (a: unknown, b: unknown, progress: number) => unknown;
  
  /** Duration of the interpolation in milliseconds */
  duration?: number;
  
  /** Delay before interpolation starts */
  delay?: number;
  
  /** Apply transition out of order (useful for staggered animations) */
  staggered?: boolean;
  
  /** Stagger delay between items in milliseconds */
  staggerDelay?: number;
  
  /** Amount of overshoot for physics-based transitions */
  overshoot?: number;
  
  /** Whether to dynamically adjust interpolation based on value change magnitude */
  dynamicDuration?: boolean;
}

/**
 * Value interpolator for different data types
 */
export class ValueInterpolator {
  /**
   * Interpolate numeric values
   * @param from Start value
   * @param to End value
   * @param progress Progress from 0 to 1
   * @param options Interpolation options
   * @returns Interpolated value
   */
  static number(
    from: number,
    to: number,
    progress: number,
    options: { 
      clamp?: [number, number];
      snapPoints?: number[];
    } = {}
  ): number {
    const value = lerp(from, to, progress);
    
    // Apply clamping if specified
    if (options.clamp) {
      return clamp(value, options.clamp[0], options.clamp[1]);
    }
    
    // Apply snapping if specified
    if (options.snapPoints && options.snapPoints.length > 0) {
      // Find closest snap point when near it
      const snapThreshold = 0.05; // 5% threshold for snapping
      const closestSnapPoint = options.snapPoints.find(point => {
        return Math.abs(value - point) / Math.abs(to - from) < snapThreshold;
      });
      
      if (closestSnapPoint !== undefined) {
        return closestSnapPoint;
      }
    }
    
    return value;
  }
  
  /**
   * Parse a CSS color string to RGBA components
   * @param color CSS color string
   * @returns Array of RGBA values [r, g, b, a]
   */
  static parseColor(color: string): [number, number, number, number] {
    // Create temporary element to use browser's color parsing
    const el = document.createElement('div');
    el.style.color = color;
    document.body.appendChild(el);
    const computedColor = window.getComputedStyle(el).color;
    document.body.removeChild(el);
    
    // Parse RGB(A) format
    const rgbaMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (rgbaMatch) {
      return [
        parseInt(rgbaMatch[1], 10),
        parseInt(rgbaMatch[2], 10),
        parseInt(rgbaMatch[3], 10),
        rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
      ];
    }
    
    // Default to black if parsing fails
    return [0, 0, 0, 1];
  }
  
  /**
   * Interpolate color values
   * @param from Start color (CSS color string)
   * @param to End color (CSS color string)
   * @param progress Progress from 0 to 1
   * @returns Interpolated color as rgba string
   */
  static color(from: string, to: string, progress: number): string {
    const fromRGBA = this.parseColor(from);
    const toRGBA = this.parseColor(to);
    
    const r = Math.round(lerp(fromRGBA[0], toRGBA[0], progress));
    const g = Math.round(lerp(fromRGBA[1], toRGBA[1], progress));
    const b = Math.round(lerp(fromRGBA[2], toRGBA[2], progress));
    const a = lerp(fromRGBA[3], toRGBA[3], progress);
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  
  /**
   * Parse transform string into matrix components
   * @param transform CSS transform string
   * @returns Transform matrix components
   */
  static parseTransform(transform: string): DOMMatrix {
    // Create temporary element to calculate computed transform
    const el = document.createElement('div');
    el.style.transform = transform;
    document.body.appendChild(el);
    const computedTransform = window.getComputedStyle(el).transform;
    document.body.removeChild(el);
    
    // Create DOMMatrix from computed transform
    return new DOMMatrix(computedTransform === 'none' ? undefined : computedTransform);
  }
  
  /**
   * Interpolate transform values
   * @param from Start transform (CSS transform string)
   * @param to End transform (CSS transform string)
   * @param progress Progress from 0 to 1
   * @returns Interpolated transform as CSS string
   */
  static transform(from: string, to: string, progress: number): string {
    const fromMatrix = this.parseTransform(from);
    const toMatrix = this.parseTransform(to);
    
    // Interpolate matrix values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = new DOMMatrix() as any;
    
    // Interpolate each matrix value
    ['a', 'b', 'c', 'd', 'e', 'f', 'm11', 'm12', 'm13', 'm14', 'm21', 'm22', 
     'm23', 'm24', 'm31', 'm32', 'm33', 'm34', 'm41', 'm42', 'm43', 'm44'].forEach(key => {
      if (key in fromMatrix && key in toMatrix) {
        result[key] = lerp(fromMatrix[key], toMatrix[key], progress);
      }
    });
    
    return `matrix3d(${result.m11}, ${result.m12}, ${result.m13}, ${result.m14}, 
                     ${result.m21}, ${result.m22}, ${result.m23}, ${result.m24}, 
                     ${result.m31}, ${result.m32}, ${result.m33}, ${result.m34}, 
                     ${result.m41}, ${result.m42}, ${result.m43}, ${result.m44})`;
  }
  
  /**
   * Interpolate path data for SVG paths
   * @param from Start path data
   * @param to End path data
   * @param progress Progress from 0 to 1
   * @returns Interpolated path data
   */
  static path(from: string, to: string, progress: number): string {
    // This is a simplified implementation
    // For production, a full SVG path parser would be needed
    
    // For demo purposes, we'll simply interpolate the path length
    // assuming the paths have identical structure but different coordinates
    
    // Create temporary SVG elements to calculate path points
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.style.visibility = "hidden";
    document.body.appendChild(svg);
    
    const fromPath = document.createElementNS(svgNS, "path");
    fromPath.setAttribute("d", from);
    svg.appendChild(fromPath);
    
    const toPath = document.createElementNS(svgNS, "path");
    toPath.setAttribute("d", to);
    svg.appendChild(toPath);
    
    // Get path lengths
    const fromLength = fromPath.getTotalLength();
    const toLength = toPath.getTotalLength();
    
    // Create result path by sampling points
    const numPoints = 100;
    let result = "M";
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Get point from "from" path
      const fromPoint = fromPath.getPointAtLength(t * fromLength);
      // Get point from "to" path
      const toPoint = toPath.getPointAtLength(t * toLength);
      
      // Interpolate points
      const x = lerp(fromPoint.x, toPoint.x, progress);
      const y = lerp(fromPoint.y, toPoint.y, progress);
      
      // Add to result path
      if (i === 0) {
        result += `${x},${y}`;
      } else {
        result += ` L${x},${y}`;
      }
    }
    
    // Clean up
    document.body.removeChild(svg);
    
    return result;
  }
  
  /**
   * Interpolate between two arrays
   * @param from Start array
   * @param to End array
   * @param progress Progress from 0 to 1
   * @returns Interpolated array
   */
  static array(from: unknown[], to: unknown[], progress: number): unknown[] {
    // Handle different array lengths by padding the shorter one
    const maxLength = Math.max(from.length, to.length);
    const result: unknown[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      // If index exists in both arrays, interpolate values
      if (i < from.length && i < to.length) {
        const fromVal = from[i];
        const toVal = to[i];
        
        // Determine the type of values and use appropriate interpolator
        if (typeof fromVal === 'number' && typeof toVal === 'number') {
          result.push(this.number(fromVal as number, toVal as number, progress));
        } else if (typeof fromVal === 'string' && typeof toVal === 'string') {
          // Handle color values
          if (fromVal.startsWith('#') || fromVal.startsWith('rgb') ||
              toVal.startsWith('#') || toVal.startsWith('rgb')) {
            result.push(this.color(fromVal as string, toVal as string, progress));
          } else {
            // For non-interpolatable strings, crossfade based on progress
            result.push(progress < 0.5 ? fromVal : toVal);
          }
        } else if (Array.isArray(fromVal) && Array.isArray(toVal)) {
          // Recursive handling for nested arrays
          result.push(this.array(fromVal as unknown[], toVal as unknown[], progress));
        } else if (
          typeof fromVal === 'object' && fromVal !== null &&
          typeof toVal === 'object' && toVal !== null
        ) {
          // Recursive handling for objects
          result.push(this.object(
            fromVal as Record<string, unknown>,
            toVal as Record<string, unknown>,
            progress
          ));
        } else {
          // For incompatible types, crossfade based on progress
          result.push(progress < 0.5 ? fromVal : toVal);
        }
      } else if (i < from.length) {
        // Index only exists in "from" array, fade out based on progress
        result.push(progress < 0.5 ? from[i] : undefined);
      } else {
        // Index only exists in "to" array, fade in based on progress
        result.push(progress >= 0.5 ? to[i] : undefined);
      }
    }
    
    return result;
  }
  
  /**
   * Interpolate between two objects
   * @param from Start object
   * @param to End object
   * @param progress Progress from 0 to 1
   * @returns Interpolated object
   */
  static object(from: Record<string, unknown>, to: Record<string, unknown>, progress: number): Record<string, unknown> {
    const result: Record<string, unknown> = { ...from }; // Start with the 'from' object
    
    for (const key in to) {
      // Determine if key exists in both objects
      const hasFromKey = key in from;
      const hasToKey = key in to;
      
      if (hasFromKey && hasToKey) {
        const fromVal = from[key];
        const toVal = to[key];
        
        // Determine value types and use appropriate interpolator
        if (typeof fromVal === 'number' && typeof toVal === 'number') {
          result[key] = this.number(fromVal as number, toVal as number, progress);
        } else if (typeof fromVal === 'string' && typeof toVal === 'string') {
          // Handle color values
          if (fromVal.startsWith('#') || fromVal.startsWith('rgb') ||
              toVal.startsWith('#') || toVal.startsWith('rgb')) {
            result[key] = this.color(fromVal as string, toVal as string, progress);
          } else if (fromVal.includes('transform') || toVal.includes('transform')) {
            result[key] = this.transform(fromVal as string, toVal as string, progress);
          } else {
            // For non-interpolatable strings, crossfade based on progress
            result[key] = progress < 0.5 ? fromVal : toVal;
          }
        } else if (Array.isArray(fromVal) && Array.isArray(toVal)) {
          result[key] = this.array(fromVal as unknown[], toVal as unknown[], progress);
        } else if (
          typeof fromVal === 'object' && fromVal !== null &&
          typeof toVal === 'object' && toVal !== null
        ) {
          result[key] = this.object(
            fromVal as Record<string, unknown>,
            toVal as Record<string, unknown>,
            progress
          );
        } else {
          // For incompatible types, crossfade based on progress
          result[key] = progress < 0.5 ? fromVal : toVal;
        }
      } else if (hasFromKey) {
        // Key only exists in "from" object, fade out based on progress
        result[key] = progress < 0.5 ? from[key] : undefined;
      } else {
        // Key only exists in "to" object, fade in based on progress
        result[key] = progress >= 0.5 ? to[key] : undefined;
      }
    }
    
    return result;
  }
  
  /**
   * Extract numeric value and unit from CSS value string
   * @param cssValue CSS value string (e.g. "10px", "1.5em")
   * @returns Tuple of [numeric value, unit string]
   */
  static extractCssValue(cssValue: string): [number, string] {
    const match = cssValue.match(/^([+-]?(?:\d+|\d*\.\d+))([a-z%]*)$/i);
    if (match) {
      return [parseFloat(match[1]), match[2]];
    }
    return [0, ''];
  }
  
  /**
   * Interpolate CSS values (handling different units)
   * @param from Start CSS value
   * @param to End CSS value
   * @param progress Progress from 0 to 1
   * @returns Interpolated CSS value
   */
  static cssValue(from: string, to: string, progress: number): string {
    // Extract value and unit
    const [fromValue, fromUnit] = this.extractCssValue(from);
    const [toValue, toUnit] = this.extractCssValue(to);
    
    // If units match, interpolate value and keep unit
    if (fromUnit === toUnit) {
      const interpolatedValue = lerp(fromValue, toValue, progress);
      return `${interpolatedValue}${fromUnit}`;
    }
    
    // If units don't match, we need special handling for certain unit pairs
    // For this simplified implementation, we'll just crossfade
    // In a full implementation, this would convert between related units
    return progress < 0.5 ? from : to;
  }
  
  /**
   * Get appropriate interpolator for a value type
   * @param type Interpolation type
   * @returns Interpolator function
   */
  static getInterpolator(type: InterpolationType): (from: unknown, to: unknown, progress: number, options?: Record<string, unknown>) => unknown {
    switch (type) {
      case InterpolationType.NUMBER:
        return (f, t, p, o) => this.number(f as number, t as number, p, o);
      case InterpolationType.COLOR:
        return this.color;
      case InterpolationType.TRANSFORM:
        return this.transform;
      case InterpolationType.PATH:
        return this.path;
      case InterpolationType.ARRAY:
        return this.array;
      case InterpolationType.OBJECT:
        return this.object;
      case InterpolationType.CSS_VALUE:
        return this.cssValue;
      case InterpolationType.STRING:
      default:
        // For strings, just crossfade based on progress
        return (from, to, progress) => progress < 0.5 ? from : to;
    }
  }
}

/**
 * Animation Interpolator class for creating smooth transitions
 */
export class AnimationInterpolator {
  /**
   * Create an easing function from easing options
   * @param options Easing options
   * @returns Easing function
   */
  static createEasing(options?: TransitionEasingOptions): EasingFunction {
    if (!options) {
      // Default to cubic bezier ease
      return { 
        function: (t) => bezier(0.25, 0.1, 0.25, 1).function(t),
        name: "Default Cubic Bezier",
        description: "Default easing with cubic bezier curve",
        category: "ease-in-out",
        intensity: 3
      };
    }
    
    if (options.easing) {
      return options.easing;
    }
    
    if (options.bezier) {
      return {
        function: (t) => bezier(...options.bezier).function(t),
        name: "Custom Bezier",
        description: "Custom bezier curve easing",
        category: "special",
        intensity: 3
      };
    }
    
    if (options.steps) {
      return {
        function: (t) => {
          const { count, position = 'end' } = options.steps!;
          const step = Math.floor(t * count);
          
          if (position === 'start') {
            return step / count;
          } else if (position === 'end') {
            return Math.min(1, (step + 1) / count);
          } else {
            // For 'both' position
            if (t === 0) return 0;
            if (t === 1) return 1;
            return (step + 0.5) / count;
          }
        },
        name: "Steps",
        description: "Stepped easing function",
        category: "special",
        intensity: 3
      };
    }
    
    if (options.elastic) {
      const { amplitude = 1, period = 0.3 } = options.elastic;
      return {
        function: (t) => {
          if (t === 0 || t === 1) return t;
          
          const s = period / (2 * Math.PI) * Math.asin(1 / amplitude);
          return amplitude * Math.pow(2, -10 * t) * 
                Math.sin((t - s) * (2 * Math.PI) / period) + 1;
        },
        name: "Elastic",
        description: "Elastic easing with bounce effect",
        category: "elastic",
        intensity: 4
      };
    }
    
    if (options.composite && options.composite.length > 0) {
      return {
        function: (t) => {
          let result = 0;
          let totalWeight = 0;
          
          options.composite!.forEach(({ easing, weight }) => {
            result += easing.function(t) * weight;
            totalWeight += weight;
          });
          
          return result / totalWeight;
        },
        name: "Composite",
        description: "Composite of multiple easing functions",
        category: "special",
        intensity: 3
      };
    }
    
    // Default cubic bezier ease
    return {
      function: (t) => bezier(0.25, 0.1, 0.25, 1).function(t),
      name: "Default Cubic Bezier",
      description: "Default easing with cubic bezier curve",
      category: "ease-in-out",
      intensity: 3
    };
  }
  
  /**
   * Blend two values based on blend mode
   * @param a First value
   * @param b Second value
   * @param progress Blend progress (0-1)
   * @param mode Blend mode
   * @param customFn Custom blend function (for CUSTOM mode)
   * @returns Blended value
   */
  static blend(
    a: unknown,
    b: unknown,
    progress: number,
    mode: BlendMode = BlendMode.OVERRIDE,
    customFn?: (a: unknown, b: unknown, progress: number) => unknown
  ): unknown {
    switch (mode) {
      case BlendMode.OVERRIDE:
        return progress < 1 ? a : b;
        
      case BlendMode.ADD:
        if (typeof a === 'number' && typeof b === 'number') {
          return a + (b - 0) * progress;
        }
        return progress < 0.5 ? a : b;
        
      case BlendMode.MULTIPLY:
        if (typeof a === 'number' && typeof b === 'number') {
          return a * Math.pow(b / a, progress);
        }
        return progress < 0.5 ? a : b;
        
      case BlendMode.AVERAGE: {
        // Average requires numeric values, return 'a' if not applicable
        if (typeof a === 'number' && typeof b === 'number') {
          return a * (1 - progress) + b * progress;
        }
        return progress < 0.5 ? a : b;
      }
        
      case BlendMode.MIN: {
        // Min requires numeric values, return 'a' if not applicable
        if (typeof a === 'number' && typeof b === 'number') {
          return Math.min(a, b);
        }
        return progress < 0.5 ? a : b;
      }
        
      case BlendMode.MAX: {
        // Max requires numeric values, return 'a' if not applicable
        if (typeof a === 'number' && typeof b === 'number') {
          return Math.max(a, b);
        }
        return progress < 0.5 ? a : b;
      }
        
      case BlendMode.CUSTOM: {
        if (customFn) {
          return customFn(a, b, progress);
        }
        // Fallback to OVERRIDE if no custom function provided
        return progress < 0.5 ? a : b;
      }
      default:
        return progress < 0.5 ? a : b; // Default to OVERRIDE
    }
  }
  
  /**
   * Create easing functions for transitioning between states
   * @param fromState Source animation state
   * @param toState Target animation state
   * @param transition State transition definition
   * @returns Interpolation configuration
   */
  static createStateTransitionConfig(
    fromState: AnimationState,
    toState: AnimationState,
    transition: StateTransition
  ): InterpolationConfig {
    // Extract relevant properties from states
    const fromProps = fromState.properties || {};
    const toProps = toState.properties || {};
    
    // Extract styles from states
    const fromStyles = fromState.styles || {};
    const toStyles = toState.styles || {};
    
    // Create merged property list
    const allProps = new Set([
      ...Object.keys(fromProps),
      ...Object.keys(toProps),
      ...Object.keys(fromStyles),
      ...Object.keys(toStyles)
    ]);
    
    // Build interpolation properties
    const properties: InterpolationConfig['properties'] = {};
    
    allProps.forEach(prop => {
      // Handle style properties
      if (prop in fromStyles || prop in toStyles) {
        const fromValue = fromStyles[prop] || '';
        const toValue = toStyles[prop] || '';
        
        // Determine interpolation type based on property name and value
        let type = InterpolationType.CSS_VALUE;
        
        if (prop.includes('color') || fromValue.startsWith('#') || fromValue.startsWith('rgb')) {
          type = InterpolationType.COLOR;
        } else if (prop.includes('transform')) {
          type = InterpolationType.TRANSFORM;
        }
        
        properties[prop] = { type };
      } 
      // Handle data properties
      else if (prop in fromProps || prop in toProps) {
        const fromValue = fromProps[prop];
        const toValue = toProps[prop];
        
        // Determine interpolation type based on value type
        let type = InterpolationType.NUMBER;
        
        if (typeof fromValue === 'string' || typeof toValue === 'string') {
          const strValue = (typeof fromValue === 'string' ? fromValue : toValue) as string;
          
          if (strValue.startsWith('#') || strValue.startsWith('rgb')) {
            type = InterpolationType.COLOR;
          } else if (strValue.includes('transform')) {
            type = InterpolationType.TRANSFORM;
          } else if (strValue.includes('path')) {
            type = InterpolationType.PATH;
          } else {
            type = InterpolationType.STRING;
          }
        } else if (Array.isArray(fromValue) || Array.isArray(toValue)) {
          type = InterpolationType.ARRAY;
        } else if (
          typeof fromValue === 'object' && fromValue !== null ||
          typeof toValue === 'object' && toValue !== null
        ) {
          type = InterpolationType.OBJECT;
        }
        
        properties[prop] = { type };
      }
    });
    
    // Create easing options based on transition parameters
    const easingOptions: TransitionEasingOptions = {};
    
    // If the transition specifies an animation with easing, use it
    if (transition.animation && typeof transition.animation !== 'string') {
      if (transition.animation.easing) {
        easingOptions.easing = {
          function: (t: number) => {
            if (typeof transition.animation === 'string') return t;
            
            // Convert CSS easing names to functions
            const easingName = transition.animation.easing;
            switch (easingName) {
              case 'ease':
                return bezier(0.25, 0.1, 0.25, 1).function(t);
              case 'ease-in':
                return bezier(0.42, 0, 1, 1).function(t);
              case 'ease-out':
                return bezier(0, 0, 0.58, 1).function(t);
              case 'ease-in-out':
                return bezier(0.42, 0, 0.58, 1).function(t);
              default:
                // Try to parse cubic-bezier
                const bezierMatch = /cubic-bezier\(([^,]+),([^,]+),([^,]+),([^)]+)\)/.exec(easingName);
                if (bezierMatch) {
                  const x1 = parseFloat(bezierMatch[1]);
                  const y1 = parseFloat(bezierMatch[2]);
                  const x2 = parseFloat(bezierMatch[3]);
                  const y2 = parseFloat(bezierMatch[4]);
                  return bezier(x1, y1, x2, y2).function(t);
                }
                return t;
            }
          },
          name: "Custom Animation Easing",
          description: "Easing function from animation configuration",
          category: "special",
          intensity: 3
        };
      }
    }
    
    return {
      properties,
      easing: easingOptions,
      duration: transition.duration || 300,
      blendMode: BlendMode.OVERRIDE,
    };
  }

  /**
   * Create an interpolation callback for transitioning between states
   * @param fromState Source animation state
   * @param toState Target animation state
   * @param config Interpolation configuration
   * @returns Progress callback function (0-1) that returns interpolated state
   */
  static createStateInterpolator(
    fromState: AnimationState,
    toState: AnimationState,
    config: InterpolationConfig
  ): (progress: number) => Record<string, any> {
    // Create ease function
    const ease = this.createEasing(config.easing);
    
    // Extract state properties
    const fromProps = fromState.properties || {};
    const toProps = toState.properties || {};
    
    // Extract styles from states
    const fromStyles = fromState.styles || {};
    const toStyles = toState.styles || {};
    
    // Return interpolator function
    return (progress: number) => {
      // Apply easing to progress
      const easedProgress = ease.function(progress);
      
      // Initialize result with interpolated properties
      const result: Record<string, any> = {
        properties: {},
        styles: {}
      };
      
      // Interpolate properties defined in config
      Object.entries(config.properties).forEach(([prop, propConfig]) => {
        // Handle style properties
        if (prop in fromStyles || prop in toStyles) {
          const fromValue = fromStyles[prop] || '';
          const toValue = toStyles[prop] || '';
          
          // Get appropriate interpolator
          const interpolator = propConfig.interpolator || 
                              ValueInterpolator.getInterpolator(propConfig.type);
          
          // Calculate property progress with property-specific easing
          let propProgress = easedProgress;
          if (propConfig.easing) {
            propProgress = propConfig.easing.function(progress);
          }
          
          // Apply property-specific delay
          if (propConfig.delay) {
            const delayProgress = Math.max(0, progress - propConfig.delay / config.duration!);
            propProgress = propConfig.easing ? propConfig.easing.function(delayProgress) : delayProgress;
          }
          
          // Interpolate value
          const interpolated = interpolator(fromValue, toValue, propProgress, {
            clamp: propConfig.clamp,
            snapPoints: propConfig.snapPoints
          });
          
          // Store in result
          result.styles[prop] = interpolated;
        } 
        // Handle data properties
        else if (prop in fromProps || prop in toProps) {
          const fromValue = fromProps[prop];
          const toValue = toProps[prop];
          
          // Get appropriate interpolator
          const interpolator = propConfig.interpolator || 
                              ValueInterpolator.getInterpolator(propConfig.type);
          
          // Calculate property progress with property-specific easing
          let propProgress = easedProgress;
          if (propConfig.easing) {
            propProgress = propConfig.easing.function(progress);
          }
          
          // Apply property-specific delay
          if (propConfig.delay) {
            const delayProgress = Math.max(0, progress - propConfig.delay / config.duration!);
            propProgress = propConfig.easing ? propConfig.easing.function(delayProgress) : delayProgress;
          }
          
          // Interpolate value
          const interpolated = interpolator(fromValue, toValue, propProgress, {
            clamp: propConfig.clamp,
            snapPoints: propConfig.snapPoints
          });
          
          // Store in result
          result.properties[prop] = interpolated;
        }
      });
      
      return result;
    };
  }
  
  /**
   * Apply interpolated state to target element
   * @param element Target element
   * @param state Interpolated state (from createStateInterpolator)
   */
  static applyInterpolatedState(element: HTMLElement, state: Record<string, any>): void {
    const { properties, styles } = state;
    
    // Apply properties
    if (properties) {
      Object.entries(properties).forEach(([key, value]) => {
        // Skip undefined values
        if (value === undefined) return;
        
        // @ts-ignore - dynamically setting properties
        element[key] = value;
      });
    }
    
    // Apply styles
    if (styles) {
      Object.entries(styles).forEach(([key, value]) => {
        // Skip undefined values
        if (value === undefined) return;
        
        element.style.setProperty(key, value as string);
      });
    }
  }
}

export default AnimationInterpolator;