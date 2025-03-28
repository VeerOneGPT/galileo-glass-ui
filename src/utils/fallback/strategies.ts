/**
 * Fallback Strategies for Lower-End Devices
 * 
 * Provides strategies to gracefully degrade experience on lower-end devices
 */

import { 
  DeviceCapabilityTier, 
  getDeviceCapabilityTier,
  getDeviceCapabilities,
  DeviceCapabilityProfile
} from '../deviceCapabilities';

/**
 * Animation fallback strategies
 */
export enum AnimationFallbackStrategy {
  /** Keep all animations as designed */
  NONE = 'none',
  
  /** Simplify animations by removing secondary effects */
  SIMPLIFY = 'simplify',
  
  /** Reduce animation count by only showing primary animations */
  REDUCE = 'reduce',
  
  /** Disable animations completely */
  DISABLE = 'disable'
}

/**
 * Visual effect fallback strategies
 */
export enum VisualEffectFallbackStrategy {
  /** Keep all visual effects as designed */
  NONE = 'none',
  
  /** Use simpler versions of effects */
  SIMPLIFY = 'simplify',
  
  /** Use alternative solid styling */
  ALTERNATIVE = 'alternative',
  
  /** Disable effects completely */
  DISABLE = 'disable'
}

/**
 * Image and media fallback strategies
 */
export enum MediaFallbackStrategy {
  /** Load all media as designed */
  FULL = 'full',
  
  /** Use optimized versions with lower quality */
  OPTIMIZED = 'optimized',
  
  /** Use placeholder content */
  PLACEHOLDER = 'placeholder',
  
  /** Hide non-essential media */
  ESSENTIAL_ONLY = 'essential-only'
}

/**
 * Layout fallback strategies
 */
export enum LayoutFallbackStrategy {
  /** Use designed layout */
  FULL = 'full',
  
  /** Simplify layout by reducing columns */
  SIMPLIFIED = 'simplified',
  
  /** Use minimal layout with essential content only */
  MINIMAL = 'minimal'
}

/**
 * Rendering fallback strategies
 */
export enum RenderingFallbackStrategy {
  /** Render all components */
  ALL = 'all',
  
  /** Use simpler versions of components */
  SIMPLIFIED = 'simplified',
  
  /** Lazy load non-essential components */
  LAZY = 'lazy',
  
  /** Only render essential components */
  ESSENTIAL_ONLY = 'essential-only'
}

/**
 * Loading strategy for resources
 */
export enum ResourceLoadingStrategy {
  /** Load all resources at typical priority */
  NORMAL = 'normal',
  
  /** Preload critical resources, lazy load others */
  PRIORITIZED = 'prioritized',
  
  /** Load all resources lazily */
  LAZY = 'lazy',
  
  /** Load only essential resources */
  MINIMAL = 'minimal'
}

/**
 * Strategy for component composition
 */
export enum ComponentStrategy {
  /** Use all features of components */
  FULL_FEATURED = 'full-featured',
  
  /** Use simplified versions of components */
  SIMPLIFIED = 'simplified',
  
  /** Use minimal versions with only core functionality */
  MINIMAL = 'minimal'
}

/**
 * Complete fallback strategy set
 */
export interface FallbackStrategies {
  /** Animation fallback strategy */
  animation: AnimationFallbackStrategy;
  
  /** Visual effects fallback strategy */
  visualEffects: VisualEffectFallbackStrategy;
  
  /** Media fallback strategy */
  media: MediaFallbackStrategy;
  
  /** Layout fallback strategy */
  layout: LayoutFallbackStrategy;
  
  /** Rendering fallback strategy */
  rendering: RenderingFallbackStrategy;
  
  /** Component complexity strategy */
  componentStrategy: ComponentStrategy;
  
  /** Resource loading strategy */
  resourceLoading: ResourceLoadingStrategy;
  
  /** Whether virtual scrolling should be used for large lists */
  useVirtualScrolling: boolean;
  
  /** Whether to throttle event handlers */
  throttleEvents: boolean;
  
  /** Whether to prefetch resources */
  prefetchResources: boolean;
  
  /** Whether to use RAF throttling */
  throttleAnimationFrames: boolean;
  
  /** Whether to use WebGL */
  useWebGL: boolean;
  
  /** Whether 3D transforms should be used */
  use3DTransforms: boolean;
  
  /** Whether backdrop filters should be used */
  useBackdropFilters: boolean;
  
  /** Whether shadow DOM is safe to use */
  useShadowDOM: boolean;
  
  /** Maximum number of animated elements */
  maxAnimatedElements: number;
  
  /** Maximum DOM depth */
  maxDOMDepth: number;
  
  /** Maximum number of elements in a virtual list before virtualization */
  virtualizationThreshold: number;
  
  /** Whether to use intersection observers for lazy loading */
  useIntersectionObserver: boolean;
  
  /** Whether to use resize observer for responsive elements */
  useResizeObserver: boolean;
  
  /** Whether to use advanced CSS features (grid, flex, etc.) */
  useAdvancedCSS: boolean;
  
  /** Whether to optimize shadow rendering */
  optimizeShadowRendering: boolean;
  
  /** Maximum number of concurrent animations */
  maxConcurrentAnimations: number;
  
  /** Whether to automatically reduce quality under load */
  dynamicQualityReduction: boolean;
}

/**
 * Default fallback strategies for different device tiers
 */
const TIER_STRATEGIES: Record<DeviceCapabilityTier, FallbackStrategies> = {
  [DeviceCapabilityTier.ULTRA]: {
    animation: AnimationFallbackStrategy.NONE,
    visualEffects: VisualEffectFallbackStrategy.NONE,
    media: MediaFallbackStrategy.FULL,
    layout: LayoutFallbackStrategy.FULL,
    rendering: RenderingFallbackStrategy.ALL,
    componentStrategy: ComponentStrategy.FULL_FEATURED,
    resourceLoading: ResourceLoadingStrategy.NORMAL,
    useVirtualScrolling: true,
    throttleEvents: false,
    prefetchResources: true,
    throttleAnimationFrames: false,
    useWebGL: true,
    use3DTransforms: true,
    useBackdropFilters: true,
    useShadowDOM: true,
    maxAnimatedElements: 100,
    maxDOMDepth: 32,
    virtualizationThreshold: 500,
    useIntersectionObserver: true,
    useResizeObserver: true,
    useAdvancedCSS: true,
    optimizeShadowRendering: false,
    maxConcurrentAnimations: 25,
    dynamicQualityReduction: false
  },
  
  [DeviceCapabilityTier.HIGH]: {
    animation: AnimationFallbackStrategy.NONE,
    visualEffects: VisualEffectFallbackStrategy.NONE,
    media: MediaFallbackStrategy.FULL,
    layout: LayoutFallbackStrategy.FULL,
    rendering: RenderingFallbackStrategy.ALL,
    componentStrategy: ComponentStrategy.FULL_FEATURED,
    resourceLoading: ResourceLoadingStrategy.NORMAL,
    useVirtualScrolling: true,
    throttleEvents: false,
    prefetchResources: true,
    throttleAnimationFrames: false,
    useWebGL: true,
    use3DTransforms: true,
    useBackdropFilters: true,
    useShadowDOM: true,
    maxAnimatedElements: 50,
    maxDOMDepth: 32,
    virtualizationThreshold: 300,
    useIntersectionObserver: true,
    useResizeObserver: true,
    useAdvancedCSS: true,
    optimizeShadowRendering: false,
    maxConcurrentAnimations: 15,
    dynamicQualityReduction: true
  },
  
  [DeviceCapabilityTier.MEDIUM]: {
    animation: AnimationFallbackStrategy.SIMPLIFY,
    visualEffects: VisualEffectFallbackStrategy.SIMPLIFY,
    media: MediaFallbackStrategy.OPTIMIZED,
    layout: LayoutFallbackStrategy.FULL,
    rendering: RenderingFallbackStrategy.SIMPLIFIED,
    componentStrategy: ComponentStrategy.SIMPLIFIED,
    resourceLoading: ResourceLoadingStrategy.PRIORITIZED,
    useVirtualScrolling: true,
    throttleEvents: true,
    prefetchResources: false,
    throttleAnimationFrames: false,
    useWebGL: true,
    use3DTransforms: true,
    useBackdropFilters: true,
    useShadowDOM: true,
    maxAnimatedElements: 20,
    maxDOMDepth: 24,
    virtualizationThreshold: 100,
    useIntersectionObserver: true,
    useResizeObserver: true,
    useAdvancedCSS: true,
    optimizeShadowRendering: true,
    maxConcurrentAnimations: 8,
    dynamicQualityReduction: true
  },
  
  [DeviceCapabilityTier.LOW]: {
    animation: AnimationFallbackStrategy.REDUCE,
    visualEffects: VisualEffectFallbackStrategy.ALTERNATIVE,
    media: MediaFallbackStrategy.OPTIMIZED,
    layout: LayoutFallbackStrategy.SIMPLIFIED,
    rendering: RenderingFallbackStrategy.LAZY,
    componentStrategy: ComponentStrategy.SIMPLIFIED,
    resourceLoading: ResourceLoadingStrategy.LAZY,
    useVirtualScrolling: true,
    throttleEvents: true,
    prefetchResources: false,
    throttleAnimationFrames: true,
    useWebGL: false,
    use3DTransforms: false,
    useBackdropFilters: false,
    useShadowDOM: false,
    maxAnimatedElements: 5,
    maxDOMDepth: 16,
    virtualizationThreshold: 50,
    useIntersectionObserver: true,
    useResizeObserver: false,
    useAdvancedCSS: false,
    optimizeShadowRendering: true,
    maxConcurrentAnimations: 3,
    dynamicQualityReduction: true
  },
  
  [DeviceCapabilityTier.MINIMAL]: {
    animation: AnimationFallbackStrategy.DISABLE,
    visualEffects: VisualEffectFallbackStrategy.DISABLE,
    media: MediaFallbackStrategy.ESSENTIAL_ONLY,
    layout: LayoutFallbackStrategy.MINIMAL,
    rendering: RenderingFallbackStrategy.ESSENTIAL_ONLY,
    componentStrategy: ComponentStrategy.MINIMAL,
    resourceLoading: ResourceLoadingStrategy.MINIMAL,
    useVirtualScrolling: true,
    throttleEvents: true,
    prefetchResources: false,
    throttleAnimationFrames: true,
    useWebGL: false,
    use3DTransforms: false,
    useBackdropFilters: false,
    useShadowDOM: false,
    maxAnimatedElements: 0,
    maxDOMDepth: 10,
    virtualizationThreshold: 20,
    useIntersectionObserver: false,
    useResizeObserver: false,
    useAdvancedCSS: false,
    optimizeShadowRendering: true,
    maxConcurrentAnimations: 1,
    dynamicQualityReduction: true
  }
};

// Global fallback strategies
let globalStrategies: FallbackStrategies | null = null;

/**
 * Get fallback strategies based on device capabilities
 * @param tier Device capability tier or capability profile
 * @returns Recommended fallback strategies
 */
export const getFallbackStrategies = (
  tier?: DeviceCapabilityTier | DeviceCapabilityProfile
): FallbackStrategies => {
  // Return cached strategies if available
  if (globalStrategies) {
    return globalStrategies;
  }
  
  // Determine device tier
  let deviceTier: DeviceCapabilityTier;
  
  if (tier === undefined) {
    // Auto-detect tier
    deviceTier = getDeviceCapabilityTier();
  } else if (typeof tier === 'string') {
    // Use provided tier
    deviceTier = tier;
  } else {
    // Extract tier from profile
    deviceTier = tier.tier;
  }
  
  // Get strategies for the tier
  const strategies = { ...TIER_STRATEGIES[deviceTier] };
  
  // Apply user preferences
  if (typeof window !== 'undefined') {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      strategies.animation = AnimationFallbackStrategy.DISABLE;
      strategies.maxAnimatedElements = 0;
    }
    
    // Check for reduced transparency
    if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
      strategies.useBackdropFilters = false;
      strategies.visualEffects = VisualEffectFallbackStrategy.ALTERNATIVE;
    }
    
    // Check for data-saver
    if ('connection' in navigator && (navigator as any).connection?.saveData) {
      strategies.media = MediaFallbackStrategy.ESSENTIAL_ONLY;
      strategies.prefetchResources = false;
      strategies.resourceLoading = ResourceLoadingStrategy.MINIMAL;
    }
    
    // Check for low battery if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2 && !battery.charging) {
          // Very low battery, reduce power usage
          strategies.animation = AnimationFallbackStrategy.DISABLE;
          strategies.throttleAnimationFrames = true;
          strategies.useWebGL = false;
          strategies.resourceLoading = ResourceLoadingStrategy.MINIMAL;
          strategies.maxConcurrentAnimations = 0;
          strategies.dynamicQualityReduction = true;
        }
      }).catch(() => {
        // Battery API not available
      });
    }
    
    // Check for limited memory
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory;
      if (memory && memory < 4) {
        // Reduce memory usage for devices with less than 4GB RAM
        strategies.maxDOMDepth = Math.min(strategies.maxDOMDepth, 12);
        strategies.virtualizationThreshold = Math.min(strategies.virtualizationThreshold, 50);
        
        if (memory < 2) {
          // Further optimization for <2GB devices
          strategies.maxAnimatedElements = Math.min(strategies.maxAnimatedElements, 3);
          strategies.resourceLoading = ResourceLoadingStrategy.MINIMAL;
          strategies.componentStrategy = ComponentStrategy.MINIMAL;
        }
      }
    }
  }
  
  // Cache strategies
  globalStrategies = strategies;
  
  return strategies;
};

/**
 * Check if a specific animation should be shown based on current strategies
 * @param animationName Name of the animation
 * @param importance Importance of the animation (1-10, higher = more important)
 * @returns Whether the animation should be shown
 */
export const shouldShowAnimation = (
  animationName: string,
  importance = 5
): boolean => {
  const strategies = getFallbackStrategies();
  
  // Always show if no fallback
  if (strategies.animation === AnimationFallbackStrategy.NONE) {
    return true;
  }
  
  // Never show if disabled
  if (strategies.animation === AnimationFallbackStrategy.DISABLE) {
    return false;
  }
  
  // For reduced strategy, only show important animations
  if (strategies.animation === AnimationFallbackStrategy.REDUCE) {
    return importance >= 7;
  }
  
  // For simplified strategy, show all but lowest importance
  if (strategies.animation === AnimationFallbackStrategy.SIMPLIFY) {
    return importance >= 3;
  }
  
  return true;
};

/**
 * Get a simplified version of an animation based on current strategies
 * @param animation Original animation object
 * @returns Simplified animation configuration
 */
export const getSimplifiedAnimation = (animation: any): any => {
  const strategies = getFallbackStrategies();
  
  // If no simplification needed, return original
  if (strategies.animation === AnimationFallbackStrategy.NONE) {
    return animation;
  }
  
  // If animations disabled, return null
  if (strategies.animation === AnimationFallbackStrategy.DISABLE) {
    return null;
  }
  
  // Clone the animation to avoid mutating the original
  const simplified = { ...animation };
  
  // Apply simplifications based on strategy
  if (strategies.animation === AnimationFallbackStrategy.SIMPLIFY) {
    // Simplify by reducing duration, easing, and effects
    simplified.duration = simplified.duration * 0.8; // 20% faster
    simplified.easing = 'ease-out'; // Simpler easing
    
    // Remove secondary properties if present
    if (simplified.properties) {
      simplified.properties = simplified.properties.filter((prop: any) => 
        prop.property === 'transform' || prop.property === 'opacity'
      );
    }
  } else if (strategies.animation === AnimationFallbackStrategy.REDUCE) {
    // Dramatically simplify
    simplified.duration = simplified.duration * 0.5; // 50% faster
    simplified.easing = 'linear'; // Simplest easing
    
    // Keep only essential properties
    if (simplified.properties) {
      simplified.properties = simplified.properties.filter((prop: any) => 
        prop.property === 'opacity'
      );
    }
  }
  
  return simplified;
};

/**
 * Check if a visual effect should be applied based on current strategies
 * @param effectType Type of effect
 * @returns Whether the effect should be applied
 */
export const shouldApplyVisualEffect = (
  effectType: 'glass' | 'blur' | 'shadow' | 'gradient' | 'parallax' | '3d' | 'filter'
): boolean => {
  const strategies = getFallbackStrategies();
  
  // If all effects disabled, return false
  if (strategies.visualEffects === VisualEffectFallbackStrategy.DISABLE) {
    return false;
  }
  
  // Special handling for 3D transforms
  if (effectType === '3d') {
    return strategies.use3DTransforms;
  }
  
  // Check specific effect support
  if (effectType === 'glass' || effectType === 'blur') {
    return strategies.useBackdropFilters;
  }
  
  // For alternative strategy, only apply simple effects
  if (strategies.visualEffects === VisualEffectFallbackStrategy.ALTERNATIVE) {
    // Use type assertion to overcome strict type checking
    return (effectType as string) === 'shadow' || (effectType as string) === 'gradient';
  }
  
  // For simplified strategy, apply most effects except the most expensive
  if (strategies.visualEffects === VisualEffectFallbackStrategy.SIMPLIFY) {
    // Use type assertion to overcome strict type checking
    return (effectType as string) !== 'parallax' && (effectType as string) !== '3d';
  }
  
  return true;
};

/**
 * Get alternative styling for an effect based on current strategies
 * @param originalStyles Original styles object
 * @param effectType Type of effect being replaced
 * @returns Alternative styles
 */
export const getAlternativeStyles = (
  originalStyles: Record<string, any>,
  effectType: 'glass' | 'blur' | 'shadow' | 'gradient' | 'parallax' | '3d' | 'filter'
): Record<string, any> => {
  const strategies = getFallbackStrategies();
  
  // If no alternation needed, return original
  if (strategies.visualEffects === VisualEffectFallbackStrategy.NONE) {
    return originalStyles;
  }
  
  // Clone the styles to avoid mutating the original
  const alternativeStyles = { ...originalStyles };
  
  // Apply alternative styling based on effect type
  switch (effectType) {
    case 'glass':
      // Replace glass effect with solid background
      delete alternativeStyles.backdropFilter;
      delete alternativeStyles.WebkitBackdropFilter;
      alternativeStyles.background = 'rgba(255, 255, 255, 0.9)';
      alternativeStyles.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      break;
      
    case 'blur':
      // Replace blur with opacity
      delete alternativeStyles.backdropFilter;
      delete alternativeStyles.WebkitBackdropFilter;
      alternativeStyles.background = 'rgba(240, 240, 240, 0.85)';
      break;
      
    case 'shadow':
      // Replace complex shadow with simpler one
      alternativeStyles.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
      break;
      
    case 'gradient':
      // Replace complex gradient with simpler one or solid color
      if (strategies.visualEffects === VisualEffectFallbackStrategy.ALTERNATIVE) {
        alternativeStyles.background = '#f0f0f0';
      } else {
        alternativeStyles.background = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
      }
      break;
      
    case 'parallax':
      // Remove parallax effect
      delete alternativeStyles.transform;
      delete alternativeStyles.transition;
      alternativeStyles.position = 'static';
      break;
      
    case '3d':
      // Replace 3D transforms with 2D ones or remove
      if (alternativeStyles.transform) {
        // Strip out 3D-specific transforms
        const transform = alternativeStyles.transform as string;
        alternativeStyles.transform = transform
          .replace(/perspective\([^)]+\)\s*/g, '')
          .replace(/translate3d\([^)]+\)/g, (match) => {
            const values = match.substring(12, match.length - 1).split(',');
            return `translate(${values[0]}, ${values[1]})`;
          })
          .replace(/rotate3d\([^)]+\)/g, '')
          .replace(/translateZ\([^)]+\)\s*/g, '')
          .replace(/rotateX\([^)]+\)\s*/g, '')
          .replace(/rotateY\([^)]+\)\s*/g, '');
      }
      break;
      
    case 'filter':
      // Remove or simplify filters
      if (alternativeStyles.filter) {
        // Keep only opacity filter if any
        if (alternativeStyles.filter.includes('opacity')) {
          const opacityMatch = alternativeStyles.filter.match(/opacity\(([^)]+)\)/);
          if (opacityMatch) {
            alternativeStyles.filter = `opacity(${opacityMatch[1]})`;
          } else {
            delete alternativeStyles.filter;
          }
        } else {
          delete alternativeStyles.filter;
        }
      }
      break;
  }
  
  return alternativeStyles;
};

/**
 * Get the optimal image size based on current strategies
 * @param options Available image sizes and options
 * @returns Optimal image configuration
 */
export const getOptimalImageSize = (options: {
  original: string;
  sizes: Array<{ width: number; height: number; url: string; quality: number }>;
  importance?: 'high' | 'medium' | 'low';
  lazyLoad?: boolean;
}): { url: string; width: number; height: number; loading: 'eager' | 'lazy'; } => {
  const strategies = getFallbackStrategies();
  const { original, sizes, importance = 'medium', lazyLoad = true } = options;
  
  // Sort sizes by width descending
  const sortedSizes = [...sizes].sort((a, b) => b.width - a.width);
  
  // Always use original for full strategy or high importance
  if (strategies.media === MediaFallbackStrategy.FULL || (importance as string) === 'high') {
    return {
      url: original,
      width: sortedSizes[0]?.width || 0,
      height: sortedSizes[0]?.height || 0,
      loading: 'eager'
    };
  }
  
  // For essential-only strategy, handle differently based on importance
  if (strategies.media === MediaFallbackStrategy.ESSENTIAL_ONLY) {
    // Only load high importance images
    if ((importance as string) !== 'high') {
      // Return the smallest size or empty for low importance
      if ((importance as string) === 'low') {
        return {
          url: '',
          width: 0,
          height: 0,
          loading: 'lazy'
        };
      }
      
      // Return smallest size for medium importance
      const smallest = sortedSizes[sortedSizes.length - 1];
      if (smallest) {
        return {
          url: smallest.url,
          width: smallest.width,
          height: smallest.height,
          loading: 'lazy'
        };
      }
    }
  }
  
  // For optimized strategy, select a size based on device tier
  if (strategies.media === MediaFallbackStrategy.OPTIMIZED) {
    // Determine target width based on device tier
    let targetWidth: number;
    
    switch (getDeviceCapabilityTier()) {
      case DeviceCapabilityTier.ULTRA:
      case DeviceCapabilityTier.HIGH:
        targetWidth = sortedSizes[0]?.width || 0;
        break;
      case DeviceCapabilityTier.MEDIUM:
        targetWidth = sortedSizes[1]?.width || sortedSizes[0]?.width || 0;
        break;
      case DeviceCapabilityTier.LOW:
        targetWidth = sortedSizes[Math.floor(sortedSizes.length / 2)]?.width || 0;
        break;
      default:
        targetWidth = sortedSizes[sortedSizes.length - 1]?.width || 0;
    }
    
    // Find closest size
    const closest = sortedSizes.reduce((prev, curr) => {
      return Math.abs(curr.width - targetWidth) < Math.abs(prev.width - targetWidth) ? curr : prev;
    });
    
    return {
      url: closest.url,
      width: closest.width,
      height: closest.height,
      loading: lazyLoad ? 'lazy' : 'eager'
    };
  }
  
  // For placeholder, use the smallest size
  if (strategies.media === MediaFallbackStrategy.PLACEHOLDER) {
    const smallest = sortedSizes[sortedSizes.length - 1];
    if (smallest) {
      return {
        url: smallest.url,
        width: smallest.width,
        height: smallest.height,
        loading: 'lazy'
      };
    }
  }
  
  // Fallback to original
  return {
    url: original,
    width: sortedSizes[0]?.width || 0,
    height: sortedSizes[0]?.height || 0,
    loading: lazyLoad ? 'lazy' : 'eager'
  };
};

/**
 * Generate a virtualization config for a list based on current strategies
 * @param itemCount Number of items in the list
 * @returns Virtualization configuration
 */
export const getVirtualizationConfig = (itemCount: number): {
  useVirtualization: boolean;
  itemsPerPage: number;
  overscan: number;
} => {
  const strategies = getFallbackStrategies();
  
  // Check if virtualization should be used
  const useVirtualization = strategies.useVirtualScrolling && 
                           itemCount >= strategies.virtualizationThreshold;
  
  // Default configuration
  const defaultConfig = {
    useVirtualization,
    itemsPerPage: 20,
    overscan: 10
  };
  
  // Adjust based on device tier
  if (!useVirtualization) {
    return defaultConfig;
  }
  
  // Adjust items per page based on device tier
  switch (getDeviceCapabilityTier()) {
    case DeviceCapabilityTier.ULTRA:
      return {
        useVirtualization,
        itemsPerPage: 40,
        overscan: 20
      };
    case DeviceCapabilityTier.HIGH:
      return {
        useVirtualization,
        itemsPerPage: 30,
        overscan: 15
      };
    case DeviceCapabilityTier.MEDIUM:
      return {
        useVirtualization,
        itemsPerPage: 20,
        overscan: 10
      };
    case DeviceCapabilityTier.LOW:
      return {
        useVirtualization,
        itemsPerPage: 10,
        overscan: 5
      };
    case DeviceCapabilityTier.MINIMAL:
      return {
        useVirtualization,
        itemsPerPage: 5,
        overscan: 2
      };
    default:
      return defaultConfig;
  }
};

/**
 * Generate a throttling configuration for events based on current strategies
 * @returns Throttling configuration
 */
export const getThrottlingConfig = (): {
  throttleScroll: boolean;
  throttleResize: boolean;
  throttleMouseMove: boolean;
  scrollThrottleMs: number;
  resizeThrottleMs: number;
  mouseMoveThrottleMs: number;
  rafThrottleMs: number | null;
} => {
  const strategies = getFallbackStrategies();
  
  // Default values
  const defaultConfig = {
    throttleScroll: false,
    throttleResize: false,
    throttleMouseMove: false,
    scrollThrottleMs: 16, // 60fps
    resizeThrottleMs: 100,
    mouseMoveThrottleMs: 16,
    rafThrottleMs: null
  };
  
  // If no throttling needed, return defaults
  if (!strategies.throttleEvents && !strategies.throttleAnimationFrames) {
    return defaultConfig;
  }
  
  // Apply throttling based on device tier
  switch (getDeviceCapabilityTier()) {
    case DeviceCapabilityTier.ULTRA:
    case DeviceCapabilityTier.HIGH:
      return {
        throttleScroll: strategies.throttleEvents,
        throttleResize: strategies.throttleEvents,
        throttleMouseMove: strategies.throttleEvents,
        scrollThrottleMs: 16,
        resizeThrottleMs: 100,
        mouseMoveThrottleMs: 16,
        rafThrottleMs: strategies.throttleAnimationFrames ? 16 : null
      };
    case DeviceCapabilityTier.MEDIUM:
      return {
        throttleScroll: strategies.throttleEvents,
        throttleResize: strategies.throttleEvents,
        throttleMouseMove: strategies.throttleEvents,
        scrollThrottleMs: 32, // 30fps
        resizeThrottleMs: 150,
        mouseMoveThrottleMs: 32,
        rafThrottleMs: strategies.throttleAnimationFrames ? 32 : null
      };
    case DeviceCapabilityTier.LOW:
      return {
        throttleScroll: true,
        throttleResize: true,
        throttleMouseMove: true,
        scrollThrottleMs: 50, // 20fps
        resizeThrottleMs: 200,
        mouseMoveThrottleMs: 50,
        rafThrottleMs: strategies.throttleAnimationFrames ? 50 : null
      };
    case DeviceCapabilityTier.MINIMAL:
      return {
        throttleScroll: true,
        throttleResize: true,
        throttleMouseMove: true,
        scrollThrottleMs: 100, // 10fps
        resizeThrottleMs: 300,
        mouseMoveThrottleMs: 100,
        rafThrottleMs: strategies.throttleAnimationFrames ? 100 : null
      };
    default:
      return defaultConfig;
  }
};

/**
 * Create a throttled version of requestAnimationFrame if needed based on strategies
 * @returns Function to request animation frame (throttled or not)
 */
export const getOptimizedRequestAnimationFrame = (): (callback: FrameRequestCallback) => number => {
  const strategies = getFallbackStrategies();
  
  // If no throttling needed, return standard rAF
  if (!strategies.throttleAnimationFrames) {
    return requestAnimationFrame;
  }
  
  // Get throttling config
  const { rafThrottleMs } = getThrottlingConfig();
  
  // If no throttling, return standard rAF
  if (!rafThrottleMs) {
    return requestAnimationFrame;
  }
  
  // Create throttled version
  let lastTime = 0;
  let rafId = 0;
  
  const throttledRAF = (callback: FrameRequestCallback): number => {
    const currentTime = performance.now();
    const timeElapsed = currentTime - lastTime;
    
    if (timeElapsed >= rafThrottleMs) {
      lastTime = currentTime;
      rafId = requestAnimationFrame(callback);
    } else {
      // Throttle by delaying to the next frame
      clearTimeout(rafId as any);
      rafId = window.setTimeout(() => {
        lastTime = performance.now();
        rafId = requestAnimationFrame(callback);
      }, rafThrottleMs - timeElapsed) as unknown as number;
    }
    
    return rafId;
  };
  
  return throttledRAF;
};

/**
 * Get component-specific fallback configuration
 * @param componentType Type of component
 * @returns Component-specific fallback configuration
 */
export const getComponentFallback = (
  componentType: 'glass' | 'chart' | 'grid' | 'animation' | 'media' | 'interactive' | string
): {
  useSimplifiedVersion: boolean;
  useReducedProps: boolean;
  disableFeatures: string[];
  alternatives: Record<string, any>;
} => {
  const strategies = getFallbackStrategies();
  
  // Default configuration
  const defaultConfig = {
    useSimplifiedVersion: false,
    useReducedProps: false,
    disableFeatures: [],
    alternatives: {}
  };
  
  // If using all features, return default configuration
  if (strategies.componentStrategy === ComponentStrategy.FULL_FEATURED) {
    return defaultConfig;
  }
  
  // For simplified strategy
  if (strategies.componentStrategy === ComponentStrategy.SIMPLIFIED) {
    switch(componentType) {
      case 'glass':
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['animation', 'backdrop-blur', 'inner-reflection'],
          alternatives: {
            backdropFilter: false,
            useBoxShadowInstead: true,
            blurStrength: 0,
            useSolidBackground: true
          }
        };
        
      case 'chart':
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['animations', '3d-effects', 'gradients'],
          alternatives: {
            useSimpleColors: true,
            disableTooltipAnimation: true,
            reduce3D: true,
            maxDataPoints: 100
          }
        };
        
      case 'grid':
        return {
          useSimplifiedVersion: true,
          useReducedProps: false,
          disableFeatures: ['animations', 'virtual-scrolling-for-small-lists'],
          alternatives: {
            useLessColumns: true,
            forceVirtualize: strategies.virtualizationThreshold > 50
          }
        };
        
      case 'animation':
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['physics', 'spring', 'inertia'],
          alternatives: {
            useFadeOnly: false,
            useSimpleTransition: true,
            reduceDistance: true,
            duration: 0.7, // 30% shorter
          }
        };
        
      default:
        return {
          useSimplifiedVersion: true,
          useReducedProps: false,
          disableFeatures: ['animations', 'effects'],
          alternatives: {}
        };
    }
  }
  
  // For minimal strategy
  if (strategies.componentStrategy === ComponentStrategy.MINIMAL) {
    switch(componentType) {
      case 'glass':
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['animation', 'backdrop-blur', 'inner-reflection', 'shadow', 'hover-effects'],
          alternatives: {
            backdropFilter: false,
            useBoxShadowInstead: false,
            blurStrength: 0,
            useSolidBackground: true,
            useMinimalStyling: true
          }
        };
        
      case 'chart':
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['animations', '3d-effects', 'gradients', 'tooltips', 'interactions'],
          alternatives: {
            useSimpleColors: true,
            disableTooltipAnimation: true,
            reduce3D: true,
            maxDataPoints: 50,
            useStaticVersion: true
          }
        };
        
      case 'grid':
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['animations', 'virtual-scrolling-for-small-lists', 'cell-rendering'],
          alternatives: {
            useLessColumns: true,
            forceVirtualize: true,
            useMinimalCellRenderer: true,
            disableSorting: true
          }
        };
        
      case 'animation':
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['physics', 'spring', 'inertia', 'transitions', 'opacity'],
          alternatives: {
            useFadeOnly: true,
            useSimpleTransition: true,
            reduceDistance: true,
            duration: 0.5, // 50% shorter
            disableCompletely: true
          }
        };
        
      default:
        return {
          useSimplifiedVersion: true,
          useReducedProps: true,
          disableFeatures: ['animations', 'effects', 'interactions', 'hover-states'],
          alternatives: {
            useStaticVersion: true,
            disableInteractivity: true
          }
        };
    }
  }
  
  return defaultConfig;
};

/**
 * Get appropriate DOM rendering strategy
 * @returns Configuration for optimal DOM rendering
 */
export const getDOMRenderingStrategy = (): {
  useShadowDOM: boolean;
  useDocumentFragment: boolean;
  batchDOMOperations: boolean;
  batchingInterval: number;
  useVirtualDOM: boolean;
  disableRippleEffects: boolean;
  useLayerOptimization: boolean;
  useOffscreenRendering: boolean;
} => {
  const strategies = getFallbackStrategies();
  const deviceTier = getDeviceCapabilityTier();
  
  // Ultra tier - full performance
  if (deviceTier === DeviceCapabilityTier.ULTRA) {
    return {
      useShadowDOM: strategies.useShadowDOM,
      useDocumentFragment: true,
      batchDOMOperations: false,
      batchingInterval: 0,
      useVirtualDOM: false,
      disableRippleEffects: false,
      useLayerOptimization: true,
      useOffscreenRendering: true
    };
  }
  
  // High tier - balanced performance
  if (deviceTier === DeviceCapabilityTier.HIGH) {
    return {
      useShadowDOM: strategies.useShadowDOM,
      useDocumentFragment: true,
      batchDOMOperations: true,
      batchingInterval: 0,
      useVirtualDOM: false,
      disableRippleEffects: false,
      useLayerOptimization: true,
      useOffscreenRendering: true
    };
  }
  
  // Medium tier - balanced efficiency and performance
  if (deviceTier === DeviceCapabilityTier.MEDIUM) {
    return {
      useShadowDOM: strategies.useShadowDOM,
      useDocumentFragment: true,
      batchDOMOperations: true,
      batchingInterval: 0,
      useVirtualDOM: true,
      disableRippleEffects: false,
      useLayerOptimization: true,
      useOffscreenRendering: false
    };
  }
  
  // Low tier - optimize for efficiency
  if (deviceTier === DeviceCapabilityTier.LOW) {
    return {
      useShadowDOM: false,
      useDocumentFragment: true,
      batchDOMOperations: true,
      batchingInterval: 50,
      useVirtualDOM: true,
      disableRippleEffects: true,
      useLayerOptimization: false,
      useOffscreenRendering: false
    };
  }
  
  // Minimal tier - maximum optimization
  return {
    useShadowDOM: false,
    useDocumentFragment: true,
    batchDOMOperations: true,
    batchingInterval: 100,
    useVirtualDOM: true,
    disableRippleEffects: true,
    useLayerOptimization: false,
    useOffscreenRendering: false
  };
};

/**
 * Get resource loading configuration based on current strategies
 * @param resourceType Type of resource (script, style, image, font, video, audio)
 * @param priority Resource priority (critical, high, medium, low)
 */
export const getResourceLoadingStrategy = (
  resourceType: 'script' | 'style' | 'image' | 'font' | 'video' | 'audio',
  priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
): {
  shouldLoad: boolean;
  loadingStrategy: 'eager' | 'lazy' | 'async' | 'defer' | 'none';
  cachingStrategy: 'force-cache' | 'no-cache' | 'default-cache';
  optimizationTips: string[];
} => {
  const strategies = getFallbackStrategies();
  
  // Critical resources are always loaded
  if (priority === 'critical') {
    return {
      shouldLoad: true,
      loadingStrategy: 'eager',
      cachingStrategy: 'force-cache',
      optimizationTips: []
    };
  }
  
  // For minimal loading strategy
  if (strategies.resourceLoading === ResourceLoadingStrategy.MINIMAL) {
    // Only load critical and high priority resources
    if (priority === 'low' || priority === 'medium') {
      return {
        shouldLoad: false,
        loadingStrategy: 'none',
        cachingStrategy: 'force-cache',
        optimizationTips: ['Use placeholder', 'Provide text alternative']
      };
    }
    
    // High priority resources are loaded with optimization
    return {
      shouldLoad: true,
      loadingStrategy: resourceType === 'script' ? 'defer' : 'lazy',
      cachingStrategy: 'force-cache',
      optimizationTips: ['Reduce size', 'Optimize file']
    };
  }
  
  // For lazy loading strategy
  if (strategies.resourceLoading === ResourceLoadingStrategy.LAZY) {
    // Apply lazy loading for all non-critical resources
    return {
      shouldLoad: priority !== 'low' || resourceType !== 'video',
      loadingStrategy: resourceType === 'script' ? 'defer' : 'lazy',
      cachingStrategy: 'force-cache',
      optimizationTips: ['Use responsive sizes', 'Compress content']
    };
  }
  
  // For prioritized loading strategy
  if (strategies.resourceLoading === ResourceLoadingStrategy.PRIORITIZED) {
    // Prioritize loading based on resource type and priority
    if (resourceType === 'script') {
      return {
        shouldLoad: true,
        loadingStrategy: priority === 'high' ? 'eager' : 'defer',
        cachingStrategy: 'default-cache',
        optimizationTips: ['Split into chunks', 'Use code splitting']
      };
    }
    
    if (resourceType === 'image') {
      return {
        shouldLoad: true,
        loadingStrategy: priority === 'high' ? 'eager' : 'lazy',
        cachingStrategy: 'force-cache',
        optimizationTips: ['Use responsive images', 'Optimize format']
      };
    }
    
    // Default for other resources
    return {
      shouldLoad: true,
      loadingStrategy: priority === 'high' ? 'eager' : 'lazy',
      cachingStrategy: 'default-cache',
      optimizationTips: []
    };
  }
  
  // For normal loading strategy
  return {
    shouldLoad: true,
    loadingStrategy: priority === 'low' ? 'lazy' : 'eager',
    cachingStrategy: 'default-cache',
    optimizationTips: []
  };
};

/**
 * Determines if component should implement virtual scrolling
 * @param itemCount Number of items to display
 * @param componentType Type of component (list, table, grid, etc)
 */
export const shouldUseVirtualization = (
  itemCount: number,
  componentType = 'list'
): boolean => {
  const strategies = getFallbackStrategies();
  
  // If not using virtualization, return false
  if (!strategies.useVirtualScrolling) {
    return false;
  }
  
  // Apply different thresholds based on component type
  switch (componentType) {
    case 'table':
      // Tables benefit more from virtualization
      return itemCount >= Math.max(10, strategies.virtualizationThreshold / 2);
      
    case 'grid':
      // Grids also benefit significantly from virtualization
      return itemCount >= Math.max(20, strategies.virtualizationThreshold / 1.5);
      
    case 'tree':
      // Trees are complex structures, virtualize earlier
      return itemCount >= Math.max(15, strategies.virtualizationThreshold / 3);
      
    default:
      // Default to standard threshold
      return itemCount >= strategies.virtualizationThreshold;
  }
};

/**
 * Get appropriate pagination configuration based on device capabilities
 * @param totalItems Total number of items
 */
export const getPaginationStrategy = (totalItems: number): {
  itemsPerPage: number;
  maxPageButtons: number;
  useSimplifiedControls: boolean;
} => {
  const deviceTier = getDeviceCapabilityTier();
  
  // Set appropriate items per page based on device tier
  switch (deviceTier) {
    case DeviceCapabilityTier.ULTRA:
      return {
        itemsPerPage: 50,
        maxPageButtons: 7,
        useSimplifiedControls: false
      };
      
    case DeviceCapabilityTier.HIGH:
      return {
        itemsPerPage: 30,
        maxPageButtons: 7,
        useSimplifiedControls: false
      };
      
    case DeviceCapabilityTier.MEDIUM:
      return {
        itemsPerPage: 20,
        maxPageButtons: 5,
        useSimplifiedControls: false
      };
      
    case DeviceCapabilityTier.LOW:
      return {
        itemsPerPage: 15,
        maxPageButtons: 3,
        useSimplifiedControls: true
      };
      
    case DeviceCapabilityTier.MINIMAL:
      return {
        itemsPerPage: 10,
        maxPageButtons: 3,
        useSimplifiedControls: true
      };
      
    default:
      return {
        itemsPerPage: 20,
        maxPageButtons: 5,
        useSimplifiedControls: false
      };
  }
};

/**
 * Get the appropriate component variant based on device capabilities
 * @param componentName Name of the component
 * @param variants Available variants from most to least complex
 */
export const getBestComponentVariant = (
  componentName: string,
  variants: string[]
): string => {
  if (!variants.length) return '';
  
  const strategies = getFallbackStrategies();
  const deviceTier = getDeviceCapabilityTier();
  
  // Return appropriate variant based on component strategy
  if (strategies.componentStrategy === ComponentStrategy.FULL_FEATURED) {
    // Use the most complex variant
    return variants[0];
  }
  
  if (strategies.componentStrategy === ComponentStrategy.MINIMAL) {
    // Use the simplest variant
    return variants[variants.length - 1];
  }
  
  // For simplified strategy, pick based on device tier
  switch (deviceTier) {
    case DeviceCapabilityTier.HIGH:
      // High tier can handle the second most complex variant
      return variants[Math.min(1, variants.length - 1)];
      
    case DeviceCapabilityTier.MEDIUM:
      // Medium tier uses a middle variant
      const midIndex = Math.floor(variants.length / 2);
      return variants[midIndex];
      
    case DeviceCapabilityTier.LOW:
      // Low tier uses a simpler variant
      const lowIndex = Math.floor(variants.length * 0.75);
      return variants[Math.min(lowIndex, variants.length - 1)];
      
    default:
      // Default to the middle option
      const defaultIndex = Math.floor(variants.length / 2);
      return variants[defaultIndex];
  }
};

/**
 * Dynamic optimizer that analyzes input measurements to determine if quality should be reduced
 * @param metrics Performance metrics object
 * @returns Recommended optimization actions
 */
export const getDynamicOptimizations = (metrics: {
  fps: number;
  memory?: { used: number; total: number; limit: number } | null;
  cpuUsage?: number;
  renderTime?: number;
  jankScore?: number;
}): {
  reduceAnimations: boolean;
  reduceEffects: boolean;
  simplifyDOM: boolean;
  disableFeatures: string[];
  recommendations: string[];
} => {
  // Default result with no optimizations
  const defaultResult = {
    reduceAnimations: false,
    reduceEffects: false,
    simplifyDOM: false,
    disableFeatures: [],
    recommendations: []
  };
  
  // Check if dynamic optimization is disabled
  const strategies = getFallbackStrategies();
  if (!strategies.dynamicQualityReduction) {
    return defaultResult;
  }
  
  const result = { ...defaultResult };
  
  // FPS-based optimizations
  if (metrics.fps < 30) {
    result.reduceAnimations = true;
    result.recommendations.push('Reduce animations due to low FPS');
    
    if (metrics.fps < 20) {
      result.reduceEffects = true;
      result.recommendations.push('Simplify visual effects due to very low FPS');
    }
    
    if (metrics.fps < 15) {
      result.simplifyDOM = true;
      result.disableFeatures.push('parallax', 'blur-effects', 'transitions');
      result.recommendations.push('Drastically reduce visual complexity due to extremely low FPS');
    }
  }
  
  // Memory-based optimizations
  if (metrics.memory) {
    const memoryUsagePercent = (metrics.memory.used / metrics.memory.total) * 100;
    
    if (memoryUsagePercent > 85) {
      result.simplifyDOM = true;
      result.disableFeatures.push('webgl', '3d-effects');
      result.recommendations.push('Reduce memory usage through DOM simplification');
    } else if (memoryUsagePercent > 70) {
      result.reduceEffects = true;
      result.recommendations.push('Simplify effects to reduce memory pressure');
    }
  }
  
  // Jank score-based optimizations
  if (metrics.jankScore && metrics.jankScore > 5) {
    result.reduceAnimations = true;
    result.recommendations.push('Reduce animations due to high jank score');
    
    if (metrics.jankScore > 8) {
      result.simplifyDOM = true;
      result.disableFeatures.push('complex-interactions');
      result.recommendations.push('Simplify DOM and interactions due to very high jank score');
    }
  }
  
  // CPU usage-based optimizations
  if (metrics.cpuUsage && metrics.cpuUsage > 50) {
    result.reduceAnimations = true;
    result.recommendations.push('Reduce animations due to high CPU usage');
    
    if (metrics.cpuUsage > 80) {
      result.reduceEffects = true;
      result.simplifyDOM = true;
      result.disableFeatures.push('background-effects', 'shadows');
      result.recommendations.push('Implement emergency optimizations due to extremely high CPU usage');
    }
  }
  
  return result;
};

/**
 * Clear the fallback strategies cache
 */
export const clearFallbackStrategiesCache = (): void => {
  globalStrategies = null;
};