/**
 * GPU Acceleration Utilities
 * 
 * Utilities for optimizing animations using GPU acceleration techniques.
 */
import { CSSProperties } from 'react';
import { getDeviceCapabilityTier, DeviceCapabilityTier } from '../../utils/deviceCapabilities';
// Using utility function directly
const detectFeatures = () => {
  // Create minimal features object 
  return {
    webgl: false,
    webgl2: false,
    supports: {
      transform3d: true,
      backdropFilter: true,
      webkitBackdropFilter: true,
      willChange: true
    }
  };
};

/**
 * GPU acceleration property options
 */
export interface GPUAccelerationOptions {
  /** Whether to use transform3d for forcing GPU acceleration */
  useTransform3d?: boolean;
  
  /** Whether to use will-change for hinting GPU acceleration */
  useWillChange?: boolean;
  
  /** List of properties to optimize */
  properties?: Array<
    | 'transform'
    | 'opacity'
    | 'filter'
    | 'background'
    | 'box-shadow'
    | 'backdrop-filter'
    | 'color'
    | 'border'
  >;
  
  /** Whether to use backface-visibility for additional optimization */
  backfaceVisibility?: boolean;
  
  /** Whether to apply containment for layout optimization */
  useContainment?: boolean;
  
  /** Whether to use minimal acceleration for lower-end devices */
  adaptToDevice?: boolean;
  
  /** Minimum device capability tier for full optimizations */
  minimumDeviceTier?: DeviceCapabilityTier;
}

/**
 * Default GPU acceleration options
 */
const DEFAULT_GPU_OPTIONS: GPUAccelerationOptions = {
  useTransform3d: true,
  useWillChange: true,
  properties: ['transform', 'opacity'],
  backfaceVisibility: true,
  useContainment: false,
  adaptToDevice: true,
  minimumDeviceTier: DeviceCapabilityTier.MEDIUM
};

/**
 * Check if hardware acceleration is available
 * @returns Whether GPU acceleration is likely available
 */
export const isGPUAccelerationAvailable = (): boolean => {
  // Feature detection
  const features = detectFeatures();
  
  // Check for 3D transform support
  if (!features.supports.transform3d) {
    return false;
  }
  
  // Check for reasonable device capabilities
  const deviceTier = getDeviceCapabilityTier();
  if (deviceTier === DeviceCapabilityTier.LOW) {
    return false;
  }
  
  // Additional checks for Safari as it has different behavior
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    // Safari can struggle with extensive use of 3D transforms and filters
    // Check if it's a higher tier device
    return (deviceTier === DeviceCapabilityTier.MEDIUM || 
           deviceTier === DeviceCapabilityTier.HIGH ||  
           deviceTier === DeviceCapabilityTier.ULTRA);
  }
  
  // Generally available otherwise
  return true;
};

/**
 * Get CSS properties for GPU acceleration
 * @param options GPU acceleration options
 * @returns CSS properties object for React
 */
export const getGPUAccelerationCSS = (
  options: GPUAccelerationOptions = {}
): CSSProperties => {
  const mergedOptions = { ...DEFAULT_GPU_OPTIONS, ...options };
  const css: CSSProperties = {};
  
  // If adaptToDevice is enabled, check device capability
  if (mergedOptions.adaptToDevice) {
    const deviceTier = getDeviceCapabilityTier();
    
    // For lower-end devices, use minimal acceleration
    if (deviceTier < (mergedOptions.minimumDeviceTier || DeviceCapabilityTier.MEDIUM)) {
      return {
        // Force compositing layer only for critical animations
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      };
    }
  }
  
  // Force GPU acceleration with transform3d
  if (mergedOptions.useTransform3d) {
    css.transform = 'translateZ(0)';
  }
  
  // Use will-change for browser hinting
  if (mergedOptions.useWillChange && mergedOptions.properties) {
    css.willChange = mergedOptions.properties.join(', ');
  }
  
  // Backface visibility optimization
  if (mergedOptions.backfaceVisibility) {
    css.backfaceVisibility = 'hidden';
  }
  
  // Containment for layout isolation
  if (mergedOptions.useContainment) {
    css.contain = 'paint layout';
  }
  
  return css;
};

/**
 * Apply optimized GPU acceleration based on the animation complexity
 * @param complexity Animation complexity (1-5, higher = more complex)
 * @returns CSS properties for GPU acceleration
 */
export const getOptimizedGPUAcceleration = (
  complexity: 1 | 2 | 3 | 4 | 5
): CSSProperties => {
  // Check if GPU acceleration is available at all
  if (!isGPUAccelerationAvailable()) {
    // Return minimal properties for low-end devices
    return {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden'
    };
  }
  
  // For simple animations (opacity, simple transforms)
  if (complexity <= 2) {
    return {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      willChange: 'transform, opacity'
    };
  }
  
  // For medium complexity animations (filters, shadows)
  if (complexity <= 3) {
    return {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden', 
      willChange: 'transform, opacity, filter',
      contain: 'paint'
    };
  }
  
  // For high complexity animations (multiple properties, 3D transforms)
  if (complexity <= 4) {
    return {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      willChange: 'transform, opacity, filter',
      contain: 'paint layout',
      perspectiveOrigin: 'center center'
    };
  }
  
  // For very complex animations (all the optimizations)
  return {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform, opacity, filter, backdrop-filter',
    contain: 'paint layout',
    perspectiveOrigin: 'center center',
    isolation: 'isolate'
  };
};

/**
 * Create a transform property optimized for GPU acceleration
 * @param transforms Transform functions to apply
 * @returns Optimized transform string
 */
export const createGPUOptimizedTransform = (
  transforms: Record<string, string | number>
): string => {
  // Start with a subtle translateZ to force GPU acceleration
  let transformString = 'translateZ(0) ';
  
  // Add each transform function
  Object.entries(transforms).forEach(([func, value]) => {
    // Skip translateZ since we already added it
    if (func === 'translateZ') return;
    
    // Add the transform function
    transformString += `${func}(${value}) `;
  });
  
  return transformString.trim();
};

/**
 * Apply GPU optimizations to a specific animation
 * @param keyframes Animation keyframes
 * @param options GPU acceleration options
 * @returns Optimized keyframes string
 */
export const optimizeKeyframes = (
  keyframes: string,
  options: GPUAccelerationOptions = {}
): string => {
  // Simple optimization for now - add transform: translateZ(0) to force GPU acceleration
  // A more complex implementation would parse and modify the keyframes
  
  // Look for transform properties in keyframes
  if (keyframes.includes('transform:')) {
    // Already has transform, ensure it has translateZ(0)
    if (!keyframes.includes('translateZ(0)')) {
      return keyframes.replace(
        /transform:\s*([^;]*);/g,
        'transform: $1 translateZ(0);'
      );
    }
  } else {
    // Add transform to force GPU acceleration
    return keyframes.replace(
      /\{/g,
      '{ transform: translateZ(0);'
    );
  }
  
  return keyframes;
};

/**
 * Detect if a property can benefit from GPU acceleration
 * @param property CSS property name
 * @returns Whether the property is GPU-accelerated
 */
export const isGPUAcceleratedProperty = (property: string): boolean => {
  const acceleratedProperties = [
    'transform',
    'opacity',
    'filter',
    'backdrop-filter',
    'perspective',
    'animation',
    'transition',
    'will-change'
  ];
  
  return acceleratedProperties.includes(property);
};

/**
 * Create a CSS class with GPU acceleration optimizations
 * @param className Base class name
 * @param options GPU acceleration options
 * @returns CSS class definition string
 */
export const createGPUAcceleratedClass = (
  className: string,
  options: GPUAccelerationOptions = {}
): string => {
  const css = getGPUAccelerationCSS(options);
  
  // Convert React CSSProperties to CSS string
  let cssString = `.${className} {`;
  
  Object.entries(css).forEach(([property, value]) => {
    // Convert camelCase to kebab-case
    const kebabProperty = property.replace(
      /([a-z0-9]|(?=[A-Z]))([A-Z])/g,
      '$1-$2'
    ).toLowerCase();
    
    cssString += `\n  ${kebabProperty}: ${value};`;
  });
  
  cssString += '\n}';
  
  return cssString;
};