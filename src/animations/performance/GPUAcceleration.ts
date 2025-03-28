/**
 * GPU Acceleration Utilities
 *
 * Utilities for optimizing animations using GPU acceleration techniques.
 * This system provides intelligent GPU acceleration hinting based on:
 * 1. Element animation complexity
 * 2. Device capabilities
 * 3. Performance monitoring feedback
 * 4. Animation type and properties
 */
import { CSSProperties } from 'react';

import { 
  getDeviceCapabilityTier, 
  DeviceCapabilityTier, 
  getDeviceCapabilities,
  HardwareAcceleration,
  BrowserCapabilities
} from '../../utils/deviceCapabilities';

/**
 * Detailed feature detection for GPU acceleration
 */
export const detectGPUFeatures = (): {
  webgl: boolean;
  webgl2: boolean;
  webgpu: boolean;
  supports: Record<string, boolean>;
  performanceScore: number;
} => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return {
      webgl: false,
      webgl2: false,
      webgpu: false,
      supports: {
        transform3d: true,
        backdropFilter: true,
        webkitBackdropFilter: true,
        willChange: true,
      },
      performanceScore: 5, // Medium performance score as default
    };
  }

  // Check WebGL support
  let webgl = false;
  let webgl2 = false;
  let webgpu = false;
  let webglMaxTextureSize = 0;
  let webglPerformance = 0;

  try {
    const canvas = document.createElement('canvas');
    
    // Check WebGL1
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (gl) {
      webgl = true;
      webglMaxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      // Simple performance check - extensions count is a rough proxy
      const extensions = gl.getSupportedExtensions();
      webglPerformance = extensions ? extensions.length / 10 : 0; // Normalize to 0-10 scale
    }
    
    // Check WebGL2
    const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    if (gl2) {
      webgl2 = true;
      // WebGL2 indicates better GPU typically
      webglPerformance += 2;
    }
    
    // Check WebGPU
    webgpu = 'gpu' in navigator;
    if (webgpu) {
      // WebGPU suggests a very powerful GPU
      webglPerformance += 5;
    }
  } catch (e) {
    // Failed to check WebGL, this could be a security restriction
    webgl = false;
    webgl2 = false;
  }

  // Feature detection for critical GPU-accelerated features
  const testEl = document.createElement('div');
  const supports: Record<string, boolean> = {
    transform3d: 'transform' in testEl.style,
    backdropFilter: 'backdropFilter' in testEl.style,
    webkitBackdropFilter: 'webkitBackdropFilter' in testEl.style,
    willChange: 'willChange' in testEl.style,
    animations: 'animate' in Element.prototype,
    customProperties: CSS.supports('(--a: 0)'),
    compositing: CSS.supports('transform-style: preserve-3d') && CSS.supports('backface-visibility: hidden'),
  };

  // Calculate a performance score (0-10)
  let performanceScore = webglPerformance;
  
  // Adjust based on device pixel ratio (higher values suggest better screens & GPUs)
  if (window.devicePixelRatio > 1) {
    performanceScore += window.devicePixelRatio / 2; // Add up to 2 points
  }
  
  // Adjust for CPU capability
  if (navigator.hardwareConcurrency) {
    performanceScore += Math.min(navigator.hardwareConcurrency / 4, 2); // Add up to 2 points
  }

  // Cap the score at 10
  performanceScore = Math.min(10, performanceScore);

  return {
    webgl,
    webgl2, 
    webgpu,
    supports,
    performanceScore,
  };
};

/**
 * Feature detection cache to avoid recomputing 
 */
let cachedFeatures: ReturnType<typeof detectGPUFeatures> | null = null;

/**
 * Get GPU features with caching
 */
export const getGPUFeatures = () => {
  if (!cachedFeatures) {
    cachedFeatures = detectGPUFeatures();
  }
  return cachedFeatures;
};

/**
 * Element acceleration state
 */
export interface ElementAccelerationState {
  /** Element being accelerated */
  element: HTMLElement;

  /** Currently applied acceleration properties */
  properties: GPUAccelerationProperties;
  
  /** Animation complexity level */
  complexityLevel: AnimationComplexity;
  
  /** Whether acceleration is currently enabled */
  accelerationEnabled: boolean;
  
  /** Performance metrics for this element */
  metrics?: {
    /** Average frame rate when animated */
    averageFps?: number;
    
    /** Layout thrashing count */
    layoutThrashing?: number;
    
    /** Repaint count */
    repaintCount?: number;
  };
}

/**
 * Animation complexity levels
 */
export enum AnimationComplexity {
  MINIMAL = 1,  // Simple transforms (translation, opacity)
  LOW = 2,      // Basic transforms and simple filters
  MEDIUM = 3,   // Multiple properties, basic shadows, non-3D transforms
  HIGH = 4,     // Complex animations with multiple properties
  EXTREME = 5   // 3D transforms, complex filters, particle effects
}

/**
 * GPU acceleration properties applied to elements
 */
export interface GPUAccelerationProperties {
  /** Whether transform3d is being used */
  transform3d: boolean;
  
  /** Properties set in will-change */
  willChangeProperties: string[];
  
  /** Whether backface-visibility is set */
  backfaceVisibility: boolean;
  
  /** Whether contain property is used */
  containment: boolean | 'paint' | 'layout' | 'paint layout';
  
  /** Whether isolation is applied */
  isolation: boolean;
  
  /** Whether perspective is applied */
  perspective: boolean;
  
  /** Current z-index (for stacking context) */
  zIndex?: number;
}

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
  
  /** Animation complexity level */
  complexity?: AnimationComplexity;
  
  /** Whether to enable automatic complexity detection */
  autoDetectComplexity?: boolean;
  
  /** Whether to intelligently apply acceleration based on performance metrics */
  intelligentAcceleration?: boolean;
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
  minimumDeviceTier: DeviceCapabilityTier.MEDIUM,
  complexity: AnimationComplexity.MEDIUM,
  autoDetectComplexity: true,
  intelligentAcceleration: true,
};

/**
 * Default acceleration properties for an element
 */
const DEFAULT_ACCELERATION_PROPERTIES: GPUAccelerationProperties = {
  transform3d: true,
  willChangeProperties: ['transform', 'opacity'],
  backfaceVisibility: true,
  containment: false,
  isolation: false,
  perspective: false
};

/**
 * Check if hardware acceleration is available
 * @returns Whether GPU acceleration is likely available
 */
export const isGPUAccelerationAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Feature detection
  const features = getGPUFeatures();

  // Check for 3D transform support
  if (!features.supports.transform3d) {
    return false;
  }

  // Check for reasonable device capabilities
  const deviceTier = getDeviceCapabilityTier();
  if (deviceTier === DeviceCapabilityTier.MINIMAL) {
    return false;
  }

  // Additional checks for Safari as it has different behavior
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    // Safari can struggle with extensive use of 3D transforms and filters
    // Check if it's a higher tier device
    return (
      deviceTier === DeviceCapabilityTier.MEDIUM ||
      deviceTier === DeviceCapabilityTier.HIGH ||
      deviceTier === DeviceCapabilityTier.ULTRA
    );
  }

  // Generally available otherwise
  return true;
};

/**
 * Analyze an element to determine its animation complexity
 */
export const analyzeElementComplexity = (element: HTMLElement): AnimationComplexity => {
  if (typeof window === 'undefined') return AnimationComplexity.MEDIUM;
  
  // Get computed style
  const style = getComputedStyle(element);
  let complexity = AnimationComplexity.MINIMAL;
  
  // Check for complex transforms
  if (style.transform && style.transform !== 'none') {
    if (style.transform.includes('3d') || 
        style.transform.includes('matrix3d') || 
        style.transform.includes('perspective')) {
      complexity = Math.max(complexity as number, AnimationComplexity.HIGH);
    } else if (style.transform.includes('rotate') || 
               style.transform.includes('scale') || 
               style.transform.includes('skew')) {
      complexity = Math.max(complexity as number, AnimationComplexity.MEDIUM);
    } else {
      complexity = Math.max(complexity as number, AnimationComplexity.LOW);
    }
  }
  
  // Check for filter complexity
  if (style.filter && style.filter !== 'none') {
    if (style.filter.includes('blur') || 
        style.filter.includes('shadow')) {
      complexity = Math.max(complexity as number, AnimationComplexity.HIGH);
    } else {
      complexity = Math.max(complexity as number, AnimationComplexity.MEDIUM);
    }
  }
  
  // Check for backdrop filter (very expensive)
  if ((style.backdropFilter && style.backdropFilter !== 'none') || 
      ((style as any).webkitBackdropFilter && (style as any).webkitBackdropFilter !== 'none')) {
    complexity = Math.max(complexity as number, AnimationComplexity.EXTREME);
  }
  
  // Check for box-shadow complexity
  if (style.boxShadow && style.boxShadow !== 'none') {
    complexity = Math.max(complexity as number, AnimationComplexity.MEDIUM);
  }
  
  // Check for opacity animation
  if (style.opacity !== '1' && style.opacity !== '') {
    complexity = Math.max(complexity as number, AnimationComplexity.MINIMAL);
  }
  
  // Check for child element count to estimate rendering complexity
  const childCount = element.querySelectorAll('*').length;
  if (childCount > 50) {
    complexity = Math.max(complexity as number, AnimationComplexity.HIGH);
  } else if (childCount > 20) {
    complexity = Math.max(complexity as number, AnimationComplexity.MEDIUM);
  }
  
  // Check for animation/transition properties
  if (style.animation && style.animation !== 'none') {
    complexity = Math.max(complexity as number, AnimationComplexity.MEDIUM);
  }
  
  if (style.transition && style.transition !== 'none') {
    complexity = Math.max(complexity as number, AnimationComplexity.LOW);
  }
  
  return complexity;
};

/**
 * Get CSS properties for GPU acceleration
 * @param options GPU acceleration options
 * @returns CSS properties object for React
 */
export const getGPUAccelerationCSS = (options: GPUAccelerationOptions = {}): CSSProperties => {
  const mergedOptions = { ...DEFAULT_GPU_OPTIONS, ...options };
  const css: CSSProperties = {};

  // If hardware acceleration isn't available, return minimal properties
  if (!isGPUAccelerationAvailable()) {
    return {
      // Only minimal acceleration for critical properties
      backfaceVisibility: 'hidden',
    };
  }

  // Check device tier if adaptToDevice is enabled
  if (mergedOptions.adaptToDevice) {
    const deviceTier = getDeviceCapabilityTier();
    const features = getGPUFeatures();

    // For lower-end devices, adapt acceleration strategy based on complexity
    if (deviceTier < (mergedOptions.minimumDeviceTier || DeviceCapabilityTier.MEDIUM)) {
      const complexity = mergedOptions.complexity || AnimationComplexity.MEDIUM;
      
      // Lowest tier devices with complex animations - minimal acceleration
      if (deviceTier === DeviceCapabilityTier.MINIMAL && complexity > AnimationComplexity.LOW) {
        return {
          backfaceVisibility: 'hidden',
        };
      }
      
      // Low-tier devices with medium complexity animations
      if (deviceTier === DeviceCapabilityTier.LOW && complexity <= AnimationComplexity.MEDIUM) {
        return {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity',
        };
      }
      
      // Low-tier devices with high complexity animations - partial acceleration
      if (deviceTier === DeviceCapabilityTier.LOW && complexity > AnimationComplexity.MEDIUM) {
        const essentialProps = mergedOptions.properties?.slice(0, 2) || ['transform', 'opacity'];
        return {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: essentialProps.join(', '),
        };
      }
    }
    
    // For high-end devices with WebGPU/WebGL2, we can be more aggressive with hints
    if (deviceTier === DeviceCapabilityTier.ULTRA && (features.webgpu || features.webgl2)) {
      // Enhanced optimization for powerful devices
      css.willChange = mergedOptions.properties?.join(', ') || 'transform, opacity';
      css.transform = 'translateZ(0)';
      css.backfaceVisibility = 'hidden';
      
      // Add additional optimizations for complex animations
      if (mergedOptions.complexity && mergedOptions.complexity >= AnimationComplexity.HIGH) {
        css.contain = 'paint layout';
        css.perspectiveOrigin = 'center center';
      }
      
      return css;
    }
  }

  // Apply optimizations based on animation complexity
  const complexity = mergedOptions.complexity || AnimationComplexity.MEDIUM;
  
  // Force GPU acceleration with transform3d
  if (mergedOptions.useTransform3d) {
    css.transform = 'translateZ(0)';
  }

  // Use will-change for browser hinting with proper property selection based on complexity
  if (mergedOptions.useWillChange && mergedOptions.properties) {
    // Limit will-change properties based on complexity and device tier
    // (will-change with too many properties can cause performance issues)
    const deviceTier = getDeviceCapabilityTier();
    const maxProperties = 
      deviceTier === DeviceCapabilityTier.ULTRA ? 6 :
      deviceTier === DeviceCapabilityTier.HIGH ? 4 :
      deviceTier === DeviceCapabilityTier.MEDIUM ? 3 : 2;
      
    const criticalProps = mergedOptions.properties.slice(0, maxProperties);
    css.willChange = criticalProps.join(', ');
  }

  // Backface visibility optimization
  if (mergedOptions.backfaceVisibility) {
    css.backfaceVisibility = 'hidden';
  }

  // Containment for layout isolation, but only for medium complexity and above
  if (mergedOptions.useContainment && complexity >= AnimationComplexity.MEDIUM) {
    css.contain = complexity >= AnimationComplexity.HIGH ? 'paint layout' : 'paint';
  }
  
  // For extremely complex animations on capable devices, add perspective origin
  // which helps create a proper stacking context and optimizes 3D transforms
  if (complexity >= AnimationComplexity.HIGH) {
    const deviceTier = getDeviceCapabilityTier();
    if (deviceTier >= DeviceCapabilityTier.HIGH) {
      css.perspectiveOrigin = 'center center';
      
      // For extreme complexity, also add isolation
      if (complexity === AnimationComplexity.EXTREME) {
        css.isolation = 'isolate';
      }
    }
  }

  return css;
};

/**
 * Apply optimized GPU acceleration based on the animation complexity
 * @param complexity Animation complexity (1-5, higher = more complex)
 * @returns CSS properties for GPU acceleration
 */
export const getOptimizedGPUAcceleration = (complexity: AnimationComplexity): CSSProperties => {
  // Use enhanced API with full options
  return getGPUAccelerationCSS({
    complexity,
    adaptToDevice: true,
    useTransform3d: true,
    backfaceVisibility: true,
    useWillChange: true,
    properties: 
      complexity === AnimationComplexity.MINIMAL ? 
        ['transform', 'opacity'] :
      complexity === AnimationComplexity.LOW ? 
        ['transform', 'opacity', 'filter'] :
      complexity === AnimationComplexity.MEDIUM ? 
        ['transform', 'opacity', 'filter', 'box-shadow'] :
      complexity === AnimationComplexity.HIGH ? 
        ['transform', 'opacity', 'filter', 'box-shadow', 'backdrop-filter'] :
        ['transform', 'opacity', 'filter', 'box-shadow', 'backdrop-filter', 'border'],
    useContainment: complexity >= AnimationComplexity.MEDIUM,
    intelligentAcceleration: true
  });
};

/**
 * Singleton class to manage GPU acceleration for elements
 */
export class GPUAccelerationManager {
  private static instance: GPUAccelerationManager;
  
  // Track acceleration state for each element
  private elementStates: Map<HTMLElement, ElementAccelerationState> = new Map();
  
  // Performance monitoring - track frames per second when animations are running
  private perfMonitoring: {
    isMonitoring: boolean;
    lastFrameTime: number;
    frameTimes: number[];
    frameCount: number;
    animatingElements: Set<HTMLElement>;
  } = {
    isMonitoring: false,
    lastFrameTime: 0,
    frameTimes: [],
    frameCount: 0,
    animatingElements: new Set()
  };
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): GPUAccelerationManager {
    if (!GPUAccelerationManager.instance) {
      GPUAccelerationManager.instance = new GPUAccelerationManager();
    }
    return GPUAccelerationManager.instance;
  }
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Start performance monitoring if we're in a browser
    if (typeof window !== 'undefined') {
      this.startPerformanceMonitoring();
    }
  }
  
  /**
   * Start monitoring performance metrics
   */
  private startPerformanceMonitoring(): void {
    if (this.perfMonitoring.isMonitoring) return;
    
    this.perfMonitoring.isMonitoring = true;
    this.perfMonitoring.lastFrameTime = performance.now();
    this.perfMonitoring.frameTimes = [];
    
    const monitorFrame = () => {
      const now = performance.now();
      const frameDuration = now - this.perfMonitoring.lastFrameTime;
      this.perfMonitoring.lastFrameTime = now;
      
      // Only track frame times if we have animating elements
      if (this.perfMonitoring.animatingElements.size > 0) {
        this.perfMonitoring.frameTimes.push(frameDuration);
        this.perfMonitoring.frameCount++;
        
        // Keep only the last 120 frames (about 2 seconds)
        if (this.perfMonitoring.frameTimes.length > 120) {
          this.perfMonitoring.frameTimes.shift();
        }
        
        // Every 60 frames, update metrics for all animating elements
        if (this.perfMonitoring.frameCount % 60 === 0) {
          this.updatePerformanceMetrics();
        }
      }
      
      if (this.perfMonitoring.isMonitoring) {
        requestAnimationFrame(monitorFrame);
      }
    };
    
    requestAnimationFrame(monitorFrame);
  }
  
  /**
   * Update performance metrics for all animating elements
   */
  private updatePerformanceMetrics(): void {
    if (this.perfMonitoring.frameTimes.length === 0) return;
    
    // Calculate average FPS
    const avgFrameTime = this.perfMonitoring.frameTimes.reduce((sum, time) => sum + time, 0) / 
                          this.perfMonitoring.frameTimes.length;
    const fps = 1000 / avgFrameTime;
    
    // Update metrics for each animating element
    this.perfMonitoring.animatingElements.forEach(element => {
      const state = this.elementStates.get(element);
      if (state) {
        if (!state.metrics) {
          state.metrics = {};
        }
        state.metrics.averageFps = fps;
        
        // If FPS is too low, consider reducing acceleration for high complexity animations
        if (fps < 30 && state.complexityLevel > AnimationComplexity.MEDIUM) {
          this.adaptAccelerationToPerformance(element, state);
        }
      }
    });
  }
  
  /**
   * Adapt acceleration settings based on performance metrics
   */
  private adaptAccelerationToPerformance(element: HTMLElement, state: ElementAccelerationState): void {
    if (!state.metrics || state.metrics.averageFps === undefined) return;
    
    const fps = state.metrics.averageFps;
    const deviceTier = getDeviceCapabilityTier();
    
    // If performance is poor, reduce acceleration complexity
    if (fps < 20) {
      // For lower tier devices, disable some acceleration features
      if (deviceTier <= DeviceCapabilityTier.MEDIUM) {
        // Update properties to reduce GPU pressure
        state.properties.willChangeProperties = ['transform', 'opacity'].filter(
          p => state.properties.willChangeProperties.includes(p)
        );
        state.properties.containment = false;
        
        // Apply the updated properties
        this.applyAccelerationProperties(element, state.properties);
      }
    } 
    // If performance is acceptable but not ideal, fine tune
    else if (fps < 40) {
      // Reduce will-change properties to essential ones
      const essentialProps = state.properties.willChangeProperties.slice(0, 2);
      state.properties.willChangeProperties = essentialProps;
      
      // Apply the updated properties
      this.applyAccelerationProperties(element, state.properties);
    }
  }
  
  /**
   * Apply acceleration properties to an element
   */
  private applyAccelerationProperties(element: HTMLElement, properties: GPUAccelerationProperties): void {
    const style = element.style;
    
    // Apply transform3d if needed
    if (properties.transform3d && !style.transform.includes('translateZ')) {
      // If element already has a transform, add translateZ(0)
      if (style.transform && style.transform !== 'none') {
        style.transform = `${style.transform} translateZ(0)`;
      } else {
        style.transform = 'translateZ(0)';
      }
    }
    
    // Apply will-change
    if (properties.willChangeProperties.length > 0) {
      style.willChange = properties.willChangeProperties.join(', ');
    } else {
      style.willChange = 'auto';
    }
    
    // Apply backface-visibility
    style.backfaceVisibility = properties.backfaceVisibility ? 'hidden' : 'visible';
    
    // Apply containment
    if (properties.containment) {
      style.contain = typeof properties.containment === 'string' 
        ? properties.containment 
        : 'paint';
    } else {
      style.contain = 'none';
    }
    
    // Apply isolation
    style.isolation = properties.isolation ? 'isolate' : 'auto';
    
    // Apply z-index if provided
    if (properties.zIndex !== undefined) {
      style.zIndex = properties.zIndex.toString();
    }
  }
  
  /**
   * Register an element for acceleration
   */
  public registerElement(
    element: HTMLElement, 
    options: GPUAccelerationOptions = {}
  ): ElementAccelerationState {
    // If element is already registered, update its options
    if (this.elementStates.has(element)) {
      const state = this.elementStates.get(element)!;
      this.updateElementAcceleration(element, options);
      return state;
    }
    
    // Determine complexity level
    let complexityLevel = options.complexity || AnimationComplexity.MEDIUM;
    
    // Auto-detect complexity if requested
    if (options.autoDetectComplexity) {
      complexityLevel = analyzeElementComplexity(element);
    }
    
    // Create acceleration properties based on options and complexity
    const cssProps = getGPUAccelerationCSS({
      ...options,
      complexity: complexityLevel
    });
    
    // Convert CSS properties to acceleration properties
    const accelerationProps: GPUAccelerationProperties = {
      transform3d: cssProps.transform !== undefined,
      willChangeProperties: cssProps.willChange 
        ? cssProps.willChange.split(', ') 
        : [],
      backfaceVisibility: cssProps.backfaceVisibility === 'hidden',
      containment: cssProps.contain !== undefined 
        ? cssProps.contain as 'paint layout' | 'paint' | boolean
        : false,
      isolation: cssProps.isolation === 'isolate',
      perspective: cssProps.perspectiveOrigin !== undefined,
      zIndex: undefined
    };
    
    // Create element state
    const state: ElementAccelerationState = {
      element,
      properties: accelerationProps,
      complexityLevel,
      accelerationEnabled: isGPUAccelerationAvailable()
    };
    
    // Store state
    this.elementStates.set(element, state);
    
    // Apply acceleration properties
    this.applyAccelerationProperties(element, accelerationProps);
    
    return state;
  }
  
  /**
   * Update acceleration for an element
   */
  public updateElementAcceleration(
    element: HTMLElement,
    options: GPUAccelerationOptions = {}
  ): void {
    if (!this.elementStates.has(element)) {
      this.registerElement(element, options);
      return;
    }
    
    const state = this.elementStates.get(element)!;
    
    // Update complexity if auto-detect is enabled
    if (options.autoDetectComplexity) {
      state.complexityLevel = analyzeElementComplexity(element);
    } 
    // Or use provided complexity
    else if (options.complexity !== undefined) {
      state.complexityLevel = options.complexity;
    }
    
    // Get updated CSS properties
    const cssProps = getGPUAccelerationCSS({
      ...options,
      complexity: state.complexityLevel
    });
    
    // Update acceleration properties
    state.properties = {
      transform3d: cssProps.transform !== undefined,
      willChangeProperties: cssProps.willChange 
        ? cssProps.willChange.split(', ') 
        : [],
      backfaceVisibility: cssProps.backfaceVisibility === 'hidden',
      containment: cssProps.contain !== undefined 
        ? cssProps.contain as 'paint layout' | 'paint' | boolean
        : false,
      isolation: cssProps.isolation === 'isolate',
      perspective: cssProps.perspectiveOrigin !== undefined,
      zIndex: state.properties.zIndex
    };
    
    // Apply updated properties
    this.applyAccelerationProperties(element, state.properties);
  }
  
  /**
   * Mark an element as animating to track performance
   */
  public markElementAsAnimating(element: HTMLElement, isAnimating = true): void {
    if (isAnimating) {
      this.perfMonitoring.animatingElements.add(element);
    } else {
      this.perfMonitoring.animatingElements.delete(element);
      
      // If element is registered, clean up will-change to avoid unnecessary GPU memory usage
      if (this.elementStates.has(element)) {
        const state = this.elementStates.get(element)!;
        // Only keep transform in will-change when not animating to maintain compositing layer
        if (state.properties.willChangeProperties.length > 1) {
          state.properties.willChangeProperties = ['transform'];
          this.applyAccelerationProperties(element, state.properties);
        }
      }
    }
  }
  
  /**
   * Unregister an element to release resources
   */
  public unregisterElement(element: HTMLElement): void {
    if (!this.elementStates.has(element)) return;
    
    // Remove from animating elements
    this.perfMonitoring.animatingElements.delete(element);
    
    // Clear acceleration properties
    element.style.willChange = 'auto';
    element.style.backfaceVisibility = 'visible';
    element.style.contain = 'none';
    element.style.isolation = 'auto';
    
    // Remove from state map
    this.elementStates.delete(element);
  }
  
  /**
   * Get the current acceleration state for an element
   */
  public getElementState(element: HTMLElement): ElementAccelerationState | undefined {
    return this.elementStates.get(element);
  }
}

// Create a global instance for easy import
export const gpuAccelerationManager = GPUAccelerationManager.getInstance();

/**
 * Create a transform property optimized for GPU acceleration
 * @param transforms Transform functions to apply
 * @param complexity Animation complexity level
 * @returns Optimized transform string
 */
export const createGPUOptimizedTransform = (
  transforms: Record<string, string | number>,
  complexity: AnimationComplexity = AnimationComplexity.MEDIUM
): string => {
  // The optimal order of transforms for performance is:
  // 1. perspective
  // 2. translate
  // 3. rotate
  // 4. scale
  // 5. skew
  const orderedTransformFunctions = ['perspective', 'translate', 'rotate', 'scale', 'skew', 'matrix'];
  const transformString: string[] = [];
  
  // Force GPU acceleration with translateZ(0) but only if appropriate
  // Lower complexity animations might not need it
  if (complexity >= AnimationComplexity.MEDIUM && !transforms.translateZ) {
    transformString.push('translateZ(0)');
  }
  
  // Process transform functions in the optimal order
  for (const baseFunc of orderedTransformFunctions) {
    // Get all transform functions that start with this base function
    const funcs = Object.keys(transforms).filter(f => f.startsWith(baseFunc));
    
    // Sort them - 3D transforms come before 2D ones for better acceleration
    funcs.sort((a, b) => {
      if (a.includes('3d') && !b.includes('3d')) return -1;
      if (!a.includes('3d') && b.includes('3d')) return 1;
      if (a.length < b.length) return -1;
      if (a.length > b.length) return 1;
      return 0;
    });
    
    // Add each transform function
    for (const func of funcs) {
      if (func === 'translateZ' && transformString.includes('translateZ(0)')) continue;
      transformString.push(`${func}(${transforms[func]})`);
    }
  }
  
  // Get any remaining transform functions we didn't handle
  const remainingFuncs = Object.keys(transforms).filter(f => 
    !orderedTransformFunctions.some(base => f.startsWith(base)));
  
  // Add the remaining transform functions
  for (const func of remainingFuncs) {
    transformString.push(`${func}(${transforms[func]})`);
  }
  
  return transformString.join(' ');
};

/**
 * Apply GPU optimizations to animation keyframes
 * @param keyframes Animation keyframes
 * @param options GPU acceleration options
 * @returns Optimized keyframes string
 */
export const optimizeKeyframes = (
  keyframes: string,
  options: GPUAccelerationOptions = {}
): string => {
  const mergedOptions = { ...DEFAULT_GPU_OPTIONS, ...options };
  const complexity = mergedOptions.complexity || AnimationComplexity.MEDIUM;
  
  // Don't optimize if hardware acceleration isn't available or device is low-end
  if (!isGPUAccelerationAvailable()) {
    return keyframes;
  }
  
  // Only perform basic optimization for minimal complexity animations
  if (complexity <= AnimationComplexity.LOW) {
    return keyframes;
  }
  
  // Check if hardware acceleration properties are needed
  const needsAcceleration = !keyframes.includes('translateZ(0)') && 
                           !keyframes.includes('will-change:');
  
  // More sophisticated optimization with regex patterns
  if (needsAcceleration) {
    // Get acceleration CSS based on options
    const props = getGPUAccelerationCSS(options);
    
    // Convert acceleration properties to CSS strings
    const accelerationRules: string[] = [];
    
    if (props.transform) {
      // Don't override existing transform, append to it
      keyframes = keyframes.replace(
        /transform\s*:\s*([^;]+);/g, 
        (match, transformValue) => {
          // Only add translateZ if not already present
          if (!transformValue.includes('translateZ')) {
            return `transform: ${transformValue} translateZ(0);`;
          }
          return match;
        }
      );
      
      // If there are no transform rules, add one to the start of each keyframe
      if (!keyframes.includes('transform:')) {
        accelerationRules.push('transform: translateZ(0);');
      }
    }
    
    if (props.willChange) {
      accelerationRules.push(`will-change: ${props.willChange};`);
    }
    
    if (props.backfaceVisibility) {
      accelerationRules.push(`backface-visibility: ${props.backfaceVisibility};`);
    }
    
    // Add the acceleration rules to the start of each keyframe
    if (accelerationRules.length > 0) {
      const rules = accelerationRules.join(' ');
      keyframes = keyframes.replace(/\{/g, `{\n  ${rules}`);
    }
  }
  
  return keyframes;
};

/**
 * Determine if a property benefits from GPU acceleration
 * @param property CSS property name
 * @param deviceTier Device capability tier
 * @returns Whether the property is GPU-accelerated
 */
export const isGPUAcceleratedProperty = (
  property: string,
  deviceTier: DeviceCapabilityTier = getDeviceCapabilityTier()
): boolean => {
  // Always-accelerated core properties
  const coreAcceleratedProperties = [
    'transform',
    'opacity',
  ];
  
  // Additional properties that are accelerated on better devices
  const additionalAcceleratedProperties = [
    'filter',
    'backdrop-filter',
    'perspective',
    'clip-path',
  ];
  
  // Meta properties that influence acceleration
  const metaAccelerationProperties = [
    'animation',
    'transition',
    'will-change',
  ];
  
  // First check core properties that are always accelerated
  if (coreAcceleratedProperties.includes(property)) {
    return true;
  }
  
  // Then check additional properties based on device tier
  if (deviceTier >= DeviceCapabilityTier.MEDIUM && 
      additionalAcceleratedProperties.includes(property)) {
    return true;
  }
  
  // Finally check meta properties
  if (metaAccelerationProperties.includes(property)) {
    return true;
  }
  
  // Check compound properties (e.g., transform-origin)
  for (const base of [...coreAcceleratedProperties, ...additionalAcceleratedProperties]) {
    if (property.startsWith(`${base}-`)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Create a CSS class string with GPU acceleration optimizations
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
    const kebabProperty = property.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    cssString += `\n  ${kebabProperty}: ${value};`;
  });

  cssString += '\n}';
  
  // For animated elements, also create keyframe handling
  if (options.complexity && options.complexity > AnimationComplexity.MINIMAL) {
    // Add transition optimization
    cssString += `\n\n.${className}:hover, .${className}:active, .${className}:focus {`;
    cssString += '\n  will-change: transform, opacity;';
    cssString += '\n}';
    
    // Add animation optimization
    cssString += `\n\n@keyframes optimize-${className} {`;
    cssString += '\n  from { transform: translateZ(0); }';
    cssString += '\n  to { transform: translateZ(0); }';
    cssString += '\n}';
  }

  return cssString;
};

/**
 * Create a react hook for using GPU acceleration on elements
 * @param complexityLevel Animation complexity level
 * @returns Function to get ref and CSS properties
 */
export const useGPUAcceleration = (
  options: GPUAccelerationOptions = {}
) => {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      ref: (node: HTMLElement | null) => {},
      style: {},
      markAsAnimating: (isAnimating = true) => {}
    };
  }
  
  return {
    // Function to attach to element ref
    ref: (node: HTMLElement | null) => {
      if (node) {
        gpuAccelerationManager.registerElement(node, options);
      }
    },
    // Style properties to apply
    style: getGPUAccelerationCSS(options),
    // Function to mark element as animating
    markAsAnimating: (isAnimating = true) => {
      // You'd need to store the element reference to use this
      // This is just a placeholder implementation
    }
  };
};
