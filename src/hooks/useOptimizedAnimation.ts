/**
 * useOptimizedAnimation Hook
 * 
 * A hook for creating performance-optimized animations that adapt to device capabilities
 */
import { useState, useEffect, useMemo } from 'react';
import { css, keyframes } from 'styled-components';
import { cssWithKebabProps } from '../core/cssUtils';
import { useReducedMotion } from './useReducedMotion';
import { 
  DeviceCapabilityTier, 
  getDeviceCapabilityTier 
} from '../utils/deviceCapabilities';

/**
 * Animation complexity levels for optimization
 */
export enum AnimationComplexity {
  NONE = 'none',         // No animation
  MINIMAL = 'minimal',   // Simplest possible animation (opacity only)
  BASIC = 'basic',       // Simplified but still noticeable (transforms, no filters)
  STANDARD = 'standard', // Default complexity level
  ENHANCED = 'enhanced', // More complex (with shadows, transforms)
  COMPLEX = 'complex'    // Most complex (filters, multiple properties)
}

/**
 * Animation performance characteristics
 */
interface AnimationPerformance {
  gpuAccelerated: boolean;
  compositingOptimized: boolean;
  repaintOptimized: boolean;
  useWillChange: boolean;
  properties: string[];
}

/**
 * Options for the useOptimizedAnimation hook
 */
export interface OptimizedAnimationOptions {
  /**
   * The primary animation keyframes
   */
  animation: ReturnType<typeof keyframes>;
  
  /**
   * The fallback animation for reduced motion
   */
  reducedMotionFallback?: ReturnType<typeof keyframes>;
  
  /**
   * The complexity level of the animation
   */
  complexity?: AnimationComplexity;
  
  /**
   * Animation duration in seconds
   */
  duration?: number;
  
  /**
   * Animation easing function
   */
  easing?: string;
  
  /**
   * Animation delay in seconds
   */
  delay?: number;
  
  /**
   * Number of iterations
   */
  iterations?: number | 'infinite';
  
  /**
   * Direction of the animation
   */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  
  /**
   * Fill mode of the animation
   */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  
  /**
   * Whether to adapt to device capabilities
   */
  adaptToCapabilities?: boolean;
  
  /**
   * Whether to force GPU acceleration
   */
  forceGPU?: boolean;
  
  /**
   * Alternative animation for low-capability devices
   */
  lowCapabilityFallback?: ReturnType<typeof keyframes>;
  
  /**
   * List of CSS properties being animated
   */
  animatedProperties?: string[];
  
  /**
   * Whether the animation is essential
   */
  isEssential?: boolean;
}

/**
 * Default options for the animation
 */
const DEFAULT_OPTIONS: Partial<OptimizedAnimationOptions> = {
  complexity: AnimationComplexity.STANDARD,
  duration: 0.3,
  easing: 'ease',
  delay: 0,
  iterations: 1,
  direction: 'normal',
  fillMode: 'both',
  adaptToCapabilities: true,
  forceGPU: false,
  isEssential: false
};

/**
 * Determine appropriate complexity for the device tier
 */
const getAdaptedComplexity = (
  originalComplexity: AnimationComplexity,
  deviceTier: DeviceCapabilityTier
): AnimationComplexity => {
  // Map complexity to capability tier
  const complexityMap: Record<AnimationComplexity, Record<DeviceCapabilityTier, AnimationComplexity>> = {
    [AnimationComplexity.COMPLEX]: {
      [DeviceCapabilityTier.ULTRA]: AnimationComplexity.COMPLEX,
      [DeviceCapabilityTier.HIGH]: AnimationComplexity.ENHANCED,
      [DeviceCapabilityTier.MEDIUM]: AnimationComplexity.STANDARD,
      [DeviceCapabilityTier.LOW]: AnimationComplexity.BASIC,
      [DeviceCapabilityTier.MINIMAL]: AnimationComplexity.MINIMAL
    },
    [AnimationComplexity.ENHANCED]: {
      [DeviceCapabilityTier.ULTRA]: AnimationComplexity.ENHANCED,
      [DeviceCapabilityTier.HIGH]: AnimationComplexity.ENHANCED,
      [DeviceCapabilityTier.MEDIUM]: AnimationComplexity.STANDARD,
      [DeviceCapabilityTier.LOW]: AnimationComplexity.BASIC,
      [DeviceCapabilityTier.MINIMAL]: AnimationComplexity.MINIMAL
    },
    [AnimationComplexity.STANDARD]: {
      [DeviceCapabilityTier.ULTRA]: AnimationComplexity.STANDARD,
      [DeviceCapabilityTier.HIGH]: AnimationComplexity.STANDARD,
      [DeviceCapabilityTier.MEDIUM]: AnimationComplexity.STANDARD,
      [DeviceCapabilityTier.LOW]: AnimationComplexity.BASIC,
      [DeviceCapabilityTier.MINIMAL]: AnimationComplexity.MINIMAL
    },
    [AnimationComplexity.BASIC]: {
      [DeviceCapabilityTier.ULTRA]: AnimationComplexity.BASIC,
      [DeviceCapabilityTier.HIGH]: AnimationComplexity.BASIC,
      [DeviceCapabilityTier.MEDIUM]: AnimationComplexity.BASIC,
      [DeviceCapabilityTier.LOW]: AnimationComplexity.BASIC,
      [DeviceCapabilityTier.MINIMAL]: AnimationComplexity.MINIMAL
    },
    [AnimationComplexity.MINIMAL]: {
      [DeviceCapabilityTier.ULTRA]: AnimationComplexity.MINIMAL,
      [DeviceCapabilityTier.HIGH]: AnimationComplexity.MINIMAL,
      [DeviceCapabilityTier.MEDIUM]: AnimationComplexity.MINIMAL,
      [DeviceCapabilityTier.LOW]: AnimationComplexity.MINIMAL,
      [DeviceCapabilityTier.MINIMAL]: AnimationComplexity.MINIMAL
    },
    [AnimationComplexity.NONE]: {
      [DeviceCapabilityTier.ULTRA]: AnimationComplexity.NONE,
      [DeviceCapabilityTier.HIGH]: AnimationComplexity.NONE,
      [DeviceCapabilityTier.MEDIUM]: AnimationComplexity.NONE,
      [DeviceCapabilityTier.LOW]: AnimationComplexity.NONE,
      [DeviceCapabilityTier.MINIMAL]: AnimationComplexity.NONE
    }
  };
  
  return complexityMap[originalComplexity][deviceTier];
};

/**
 * Adjust animation duration based on complexity and device
 */
const getAdaptedDuration = (
  originalDuration: number,
  complexity: AnimationComplexity,
  deviceTier: DeviceCapabilityTier
): number => {
  // Reduction factor for low-end devices
  let factor = 1.0;
  
  if (deviceTier === DeviceCapabilityTier.LOW) {
    factor = 0.8; // 20% reduction for low-tier devices
  } else if (deviceTier === DeviceCapabilityTier.MINIMAL) {
    factor = 0.6; // 40% reduction for minimal-tier devices
  }
  
  // Adjust based on complexity
  if (complexity === AnimationComplexity.ENHANCED || 
      complexity === AnimationComplexity.COMPLEX) {
    factor *= 0.9; // Further reduce for complex animations
  }
  
  return originalDuration * factor;
};

/**
 * Get optimized animation properties based on requirements
 */
const getOptimizedProperties = (
  animatedProperties: string[] = [],
  complexity: AnimationComplexity,
  forceGPU: boolean
): AnimationPerformance => {
  // Default for minimal animations
  if (complexity === AnimationComplexity.MINIMAL) {
    return {
      gpuAccelerated: false,
      compositingOptimized: false,
      repaintOptimized: true,
      useWillChange: false,
      properties: ['opacity']
    };
  }
  
  // Force GPU acceleration when requested
  if (forceGPU) {
    return {
      gpuAccelerated: true,
      compositingOptimized: true,
      repaintOptimized: false,
      useWillChange: true,
      properties: ['transform']
    };
  }
  
  // Look for transform properties
  const hasTransform = animatedProperties.some(prop => 
    prop === 'transform' || 
    prop.startsWith('translate') || 
    prop.startsWith('rotate') || 
    prop.startsWith('scale')
  );
  
  // Look for opacity
  const hasOpacity = animatedProperties.includes('opacity');
  
  // Look for filter properties
  const hasFilter = animatedProperties.some(prop => 
    prop === 'filter' || 
    prop === 'backdrop-filter' ||
    prop.startsWith('blur') ||
    prop.startsWith('brightness')
  );
  
  // For standard animations
  if (complexity === AnimationComplexity.STANDARD) {
    return {
      gpuAccelerated: hasTransform,
      compositingOptimized: hasTransform || hasOpacity,
      repaintOptimized: !hasFilter,
      useWillChange: hasTransform && (hasFilter || hasTransform),
      properties: hasTransform ? ['transform'] : hasOpacity ? ['opacity'] : animatedProperties
    };
  }
  
  // For enhanced and complex animations
  return {
    gpuAccelerated: true,
    compositingOptimized: true,
    repaintOptimized: false,
    useWillChange: true,
    properties: hasTransform ? ['transform'] : ['opacity', ...animatedProperties]
  };
};

/**
 * Create will-change CSS based on performance requirements
 */
const createWillChangeCSS = (performance: AnimationPerformance): string => {
  if (!performance.useWillChange) {
    return '';
  }
  
  const willChangeProps = Array.from(new Set([
    ...performance.properties,
    ...(performance.gpuAccelerated ? ['transform'] : [])
  ])).join(', ');
  
  return `will-change: ${willChangeProps};`;
};

/**
 * Create transform hack for GPU acceleration
 */
const createGPUHackCSS = (performance: AnimationPerformance): string => {
  if (!performance.gpuAccelerated || !performance.useWillChange) {
    return '';
  }
  
  // Add a minimal transform that doesn't change appearance but forces GPU
  return `
    transform: translateZ(0);
    backface-visibility: hidden;
  `;
};

/**
 * Creates an animation with performance optimizations
 * 
 * @param animation The keyframes to animate
 * @param options Animation options
 * @returns CSS string with optimized animation
 */
export const optimizedAnimation = (options: OptimizedAnimationOptions) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const {
    animation,
    reducedMotionFallback,
    lowCapabilityFallback,
    complexity = AnimationComplexity.STANDARD,
    duration = 0.3,
    easing = 'ease',
    delay = 0,
    iterations = 1,
    direction = 'normal',
    fillMode = 'both',
    adaptToCapabilities = true,
    forceGPU = false,
    animatedProperties = [],
    isEssential = false
  } = mergedOptions;
  
  // Get device capability
  const deviceTier = getDeviceCapabilityTier();
  
  // Adapt complexity if needed
  const adaptedComplexity = adaptToCapabilities
    ? getAdaptedComplexity(complexity, deviceTier)
    : complexity;
  
  // Adjust duration based on complexity and device
  const adaptedDuration = adaptToCapabilities
    ? getAdaptedDuration(duration, adaptedComplexity, deviceTier)
    : duration;
  
  // Get performance optimizations
  const performance = getOptimizedProperties(
    animatedProperties, 
    adaptedComplexity,
    forceGPU
  );
  
  // CPU-only animations for minimal complexity or low-end devices
  if (
    adaptedComplexity === AnimationComplexity.MINIMAL || 
    adaptedComplexity === AnimationComplexity.BASIC ||
    deviceTier === DeviceCapabilityTier.MINIMAL
  ) {
    // If non-essential, potentially skip animation
    if ((!isEssential && deviceTier === DeviceCapabilityTier.MINIMAL) ||
        adaptedComplexity === AnimationComplexity.NONE) {
      return '';
    }
    
    // Use low capability fallback or just opacity for minimal animations
    const minimalAnimation = lowCapabilityFallback || animation;
    
    // Convert iterations to a string
    const iterationCount = iterations === 'infinite' || iterations === Infinity
      ? 'infinite'
      : String(iterations);
    
    return cssWithKebabProps`
      animation-name: ${css`${minimalAnimation}`};
      animation-duration: ${adaptedDuration}s;
      animation-timing-function: ${easing};
      animation-delay: ${delay}s;
      animation-iteration-count: ${iterationCount};
      animation-direction: ${direction};
      animation-fill-mode: ${fillMode};
      animation-play-state: running;
    `;
  }
  
  // Create optimization CSS
  const willChangeCSS = createWillChangeCSS(performance);
  const gpuHackCSS = createGPUHackCSS(performance);
  
  // Convert iterations to a string
  const iterationCount = iterations === 'infinite' || iterations === Infinity
    ? 'infinite'
    : String(iterations);

  // Otherwise, create optimized animation
  return cssWithKebabProps`
    ${willChangeCSS ? `${willChangeCSS}` : ''}
    ${gpuHackCSS ? `${gpuHackCSS}` : ''}
    animation-name: ${css`${animation}`};
    animation-duration: ${adaptedDuration}s;
    animation-timing-function: ${easing};
    animation-delay: ${delay}s;
    animation-iteration-count: ${iterationCount};
    animation-direction: ${direction};
    animation-fill-mode: ${fillMode};
    animation-play-state: running;
  `;
};

/**
 * Creates an accessible and optimized animation
 * 
 * @param animation The keyframes to animate
 * @param reducedMotionAnimation Fallback for reduced motion
 * @param options Animation options
 * @returns CSS string with accessible and optimized animation
 */
export const accessibleOptimizedAnimation = (options: OptimizedAnimationOptions) => {
  const { reducedMotionFallback } = options;
  
  if (!reducedMotionFallback) {
    return cssWithKebabProps`
      @media (prefers-reduced-motion: no-preference) {
        ${optimizedAnimation(options)}
      }
    `;
  }
  
  // With reduced motion fallback
  const reducedMotionOptions = {
    ...options,
    animation: reducedMotionFallback,
    duration: Math.min(options.duration || 0.3, 0.3), // Limit duration for reduced motion
    complexity: AnimationComplexity.MINIMAL,
    forceGPU: false
  };
  
  return cssWithKebabProps`
    @media (prefers-reduced-motion: reduce) {
      ${optimizedAnimation(reducedMotionOptions)}
    }
    
    @media (prefers-reduced-motion: no-preference) {
      ${optimizedAnimation(options)}
    }
  `;
};

/**
 * Hook for creating optimized animations
 * 
 * @param options Animation options
 * @returns Object with generate function and state
 */
export const useOptimizedAnimation = (options: OptimizedAnimationOptions) => {
  const [deviceCapabilityTier, setDeviceCapabilityTier] = useState<DeviceCapabilityTier>(
    DeviceCapabilityTier.MEDIUM
  );
  const prefersReducedMotion = useReducedMotion();
  
  // Get device capability on mount
  useEffect(() => {
    const tier = getDeviceCapabilityTier();
    setDeviceCapabilityTier(tier);
  }, []);
  
  // Create a memoized CSS generator function
  const generate = useMemo(() => {
    return (animationOptions?: Partial<OptimizedAnimationOptions>) => {
      const mergedOptions = { ...options, ...animationOptions };
      
      return prefersReducedMotion && mergedOptions.reducedMotionFallback
        ? optimizedAnimation({
            ...mergedOptions,
            animation: mergedOptions.reducedMotionFallback,
            duration: Math.min(mergedOptions.duration || 0.3, 0.3),
            complexity: AnimationComplexity.MINIMAL
          })
        : optimizedAnimation(mergedOptions as OptimizedAnimationOptions);
    };
  }, [options, prefersReducedMotion]);
  
  // Calculate appropriate complexity
  const adaptedComplexity = useMemo(() => {
    return options.adaptToCapabilities
      ? getAdaptedComplexity(
          options.complexity || AnimationComplexity.STANDARD,
          deviceCapabilityTier
        )
      : options.complexity || AnimationComplexity.STANDARD;
  }, [options.complexity, options.adaptToCapabilities, deviceCapabilityTier]);
  
  // Calculate appropriate duration
  const adaptedDuration = useMemo(() => {
    return options.adaptToCapabilities
      ? getAdaptedDuration(
          options.duration || 0.3,
          adaptedComplexity,
          deviceCapabilityTier
        )
      : options.duration || 0.3;
  }, [options.duration, options.adaptToCapabilities, adaptedComplexity, deviceCapabilityTier]);
  
  return {
    generate,
    isReducedMotion: prefersReducedMotion,
    deviceCapabilityTier,
    adaptedComplexity,
    adaptedDuration,
    css: generate()
  };
};