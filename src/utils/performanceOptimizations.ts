/**
 * Performance Optimizations
 * 
 * Utilities for optimizing the performance of Glass UI components
 */
// Import CSS type definitions
import '../types/css';
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../utils/deviceCapabilities';
import { detectFeatures, getFeatureSupportLevel, GLASS_REQUIREMENTS, FeatureLevel } from './browserCompatibility';

/**
 * Performance optimization levels
 */
export enum OptimizationLevel {
  /**
   * No optimizations applied
   */
  NONE = 'none',
  
  /**
   * Light optimizations for minor performance improvements
   */
  LIGHT = 'light',
  
  /**
   * Moderate optimizations with some visual trade-offs
   */
  MODERATE = 'moderate',
  
  /**
   * Aggressive optimizations with significant visual simplification
   */
  AGGRESSIVE = 'aggressive',
  
  /**
   * Maximum optimization with minimal visual effects
   */
  MAXIMUM = 'maximum'
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /**
   * Frames per second
   */
  fps: number;
  
  /**
   * Time per frame in milliseconds
   */
  frameTime: number;
  
  /**
   * Whether there's jank (frame time > 16.67ms)
   */
  hasJank: boolean;
  
  /**
   * Memory usage in MB
   */
  memoryUsage?: number;
  
  /**
   * CPU usage percentage
   */
  cpuUsage?: number;
  
  /**
   * GPU usage percentage
   */
  gpuUsage?: number;
  
  /**
   * Network latency in milliseconds
   */
  networkLatency?: number;
  
  /**
   * Browser features support level
   */
  featureSupportLevel: FeatureLevel;
  
  /**
   * Device capability tier
   */
  deviceCapabilityTier: DeviceCapabilityTier;
  
  /**
   * Last update timestamp
   */
  timestamp: number;
}

/**
 * Default performance metrics
 */
const DEFAULT_METRICS: PerformanceMetrics = {
  fps: 60,
  frameTime: 16.67,
  hasJank: false,
  featureSupportLevel: FeatureLevel.FULL,
  deviceCapabilityTier: DeviceCapabilityTier.MEDIUM,
  timestamp: Date.now()
};

/**
 * Glass UI performance settings
 */
export interface PerformanceSettings {
  /**
   * Current optimization level
   */
  optimizationLevel: OptimizationLevel;
  
  /**
   * Whether to enable hardware acceleration
   */
  hardwareAcceleration: boolean;
  
  /**
   * CSS backdrop-filter blur strength
   */
  blurStrength: number;
  
  /**
   * Maximum number of animated elements
   */
  maxAnimatedElements: number;
  
  /**
   * Whether to enable glass effects
   */
  enableGlassEffects: boolean;
  
  /**
   * Whether to use alternative rendering for low-end devices
   */
  useAlternativeRendering: boolean;
  
  /**
   * Whether animations are enabled
   */
  enableAnimations: boolean;
  
  /**
   * Animation complexity level
   */
  animationComplexity: 'minimal' | 'reduced' | 'standard' | 'enhanced';
  
  /**
   * Whether parallax effects are enabled
   */
  enableParallax: boolean;
  
  /**
   * Whether glow effects are enabled
   */
  enableGlowEffects: boolean;
  
  /**
   * Whether to use simple shadows
   */
  simpleGlassShadows: boolean;
}

/**
 * Default performance settings
 */
const DEFAULT_SETTINGS: PerformanceSettings = {
  optimizationLevel: OptimizationLevel.NONE,
  hardwareAcceleration: true,
  blurStrength: 8,
  maxAnimatedElements: 50,
  enableGlassEffects: true,
  useAlternativeRendering: false,
  enableAnimations: true,
  animationComplexity: 'standard',
  enableParallax: true,
  enableGlowEffects: true,
  simpleGlassShadows: false
};

/**
 * Get appropriate performance settings for the current environment
 */
export function getOptimizedSettings(): PerformanceSettings {
  const deviceTier = getDeviceCapabilityTier();
  const features = detectFeatures();
  const featureSupportLevel = getFeatureSupportLevel(GLASS_REQUIREMENTS, features);
  
  // Start with default settings
  const settings: PerformanceSettings = { ...DEFAULT_SETTINGS };
  
  // Adjust based on feature support
  if (featureSupportLevel === FeatureLevel.UNSUPPORTED || featureSupportLevel === FeatureLevel.FALLBACK) {
    settings.enableGlassEffects = false;
    settings.useAlternativeRendering = true;
    settings.optimizationLevel = OptimizationLevel.AGGRESSIVE;
    settings.blurStrength = 0;
    settings.enableGlowEffects = false;
    settings.simpleGlassShadows = true;
  } else if (featureSupportLevel === FeatureLevel.PARTIAL) {
    settings.optimizationLevel = OptimizationLevel.MODERATE;
    settings.blurStrength = 4;
    settings.enableGlowEffects = false;
    settings.simpleGlassShadows = true;
  }
  
  // Adjust based on device capability
  switch (deviceTier) {
    case DeviceCapabilityTier.ULTRA:
      // No changes, use defaults
      break;
      
    case DeviceCapabilityTier.HIGH:
      // Minor optimizations
      settings.optimizationLevel = OptimizationLevel.LIGHT;
      settings.maxAnimatedElements = 30;
      break;
      
    case DeviceCapabilityTier.MEDIUM:
      // Moderate optimizations
      settings.optimizationLevel = OptimizationLevel.MODERATE;
      settings.blurStrength = 6;
      settings.maxAnimatedElements = 20;
      settings.animationComplexity = 'reduced';
      break;
      
    case DeviceCapabilityTier.LOW:
      // Aggressive optimizations
      settings.optimizationLevel = OptimizationLevel.AGGRESSIVE;
      settings.blurStrength = 4;
      settings.maxAnimatedElements = 10;
      settings.enableParallax = false;
      settings.animationComplexity = 'reduced';
      settings.enableGlowEffects = false;
      settings.simpleGlassShadows = true;
      break;
      
    case DeviceCapabilityTier.MINIMAL:
      // Maximum optimizations
      settings.optimizationLevel = OptimizationLevel.MAXIMUM;
      settings.blurStrength = 0;
      settings.maxAnimatedElements = 5;
      settings.enableParallax = false;
      settings.animationComplexity = 'minimal';
      settings.enableGlowEffects = false;
      settings.simpleGlassShadows = true;
      
      // For extremely low-end devices, consider disabling glass effects entirely
      if (!features.hardwareAcceleration || !features.backdropFilterBlur) {
        settings.enableGlassEffects = false;
        settings.useAlternativeRendering = true;
      }
      
      break;
  }
  
  return settings;
}

/**
 * Track FPS and frame time
 */
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private frameTimeSamples: number[] = [];
  private active: boolean = false;
  private animationFrameId: number | null = null;
  private onMetricsUpdate: (metrics: PerformanceMetrics) => void;
  private currentMetrics: PerformanceMetrics = { ...DEFAULT_METRICS };
  
  constructor(onMetricsUpdate: (metrics: PerformanceMetrics) => void) {
    this.onMetricsUpdate = onMetricsUpdate;
  }
  
  /**
   * Start monitoring performance
   */
  start() {
    if (this.active) return;
    
    this.active = true;
    this.lastTime = performance.now();
    
    // Collect initial metrics
    this.updateFeatureMetrics();
    
    // Start the animation frame loop
    this.tick(performance.now());
  }
  
  /**
   * Stop monitoring performance
   */
  stop() {
    this.active = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Get the current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }
  
  /**
   * Update the feature support metrics
   */
  private updateFeatureMetrics() {
    const features = detectFeatures();
    const featureSupportLevel = getFeatureSupportLevel(GLASS_REQUIREMENTS, features);
    const deviceCapabilityTier = getDeviceCapabilityTier();
    
    this.currentMetrics.featureSupportLevel = featureSupportLevel;
    this.currentMetrics.deviceCapabilityTier = deviceCapabilityTier;
    
    // Try to get memory usage if available
    if (performance && 'memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo && memoryInfo.usedJSHeapSize) {
        this.currentMetrics.memoryUsage = Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024));
      }
    }
  }
  
  /**
   * Animation frame tick function
   */
  private tick(timestamp: number) {
    if (!this.active) return;
    
    // Calculate time since last frame
    const elapsed = timestamp - this.lastTime;
    
    // Store frame time
    if (this.lastTime !== 0) {
      this.frameTimeSamples.push(elapsed);
      
      // Keep a reasonable sample size
      if (this.frameTimeSamples.length > 60) {
        this.frameTimeSamples.shift();
      }
    }
    
    // Increment frame count
    this.frameCount++;
    
    // Update metrics every second
    if (timestamp - this.currentMetrics.timestamp >= 1000) {
      // Calculate FPS
      const fps = Math.round(this.frameCount * 1000 / (timestamp - this.currentMetrics.timestamp));
      
      // Calculate average frame time
      const avgFrameTime = this.frameTimeSamples.reduce((sum, time) => sum + time, 0) / 
                          (this.frameTimeSamples.length || 1);
      
      // Check for jank
      const hasJank = avgFrameTime > 16.67 || this.frameTimeSamples.some(time => time > 33.33);
      
      // Update metrics
      this.currentMetrics = {
        ...this.currentMetrics,
        fps,
        frameTime: avgFrameTime,
        hasJank,
        timestamp
      };
      
      // Call the metrics update callback
      this.onMetricsUpdate(this.currentMetrics);
      
      // Reset frame count
      this.frameCount = 0;
      this.currentMetrics.timestamp = timestamp;
    }
    
    // Store current time for next frame
    this.lastTime = timestamp;
    
    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }
}

/**
 * Apply CSS optimizations to an element
 */
export function applyCssOptimizations(
  element: HTMLElement,
  settings: PerformanceSettings
): void {
  if (!element) return;
  
  // Apply hardware acceleration
  if (settings.hardwareAcceleration) {
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
    
    if (settings.optimizationLevel === OptimizationLevel.LIGHT) {
      element.style.willChange = 'transform, opacity';
    }
  } else {
    element.style.transform = '';
    element.style.backfaceVisibility = '';
    element.style.willChange = '';
  }
  
  // Apply blur strength adjustment with proper webkit handling
  const backdropFilter = element.style.backdropFilter || 
                        element.style.WebkitBackdropFilter || 
                        element.style['-webkit-backdrop-filter' as any];
  if (backdropFilter && backdropFilter.includes('blur')) {
    const newFilter = `blur(${settings.blurStrength}px)`;
    
    // Apply to standard property
    element.style.backdropFilter = newFilter;
    
    // Apply to webkit properties with different casing options
    element.style.WebkitBackdropFilter = newFilter;
    
    // Use bracket notation for kebab-case property
    element.style['-webkit-backdrop-filter' as any] = newFilter;
  }
  
  // Apply shadow simplification
  if (settings.simpleGlassShadows && element.style.boxShadow) {
    // Simplify complex shadows
    if (element.style.boxShadow.includes(',')) {
      element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }
  }
  
  // Apply data attributes for styling
  element.setAttribute('data-optimization-level', settings.optimizationLevel);
  element.setAttribute('data-glass-enabled', settings.enableGlassEffects.toString());
  element.setAttribute('data-animation-complexity', settings.animationComplexity);
  
  // Disable parallax if needed
  if (!settings.enableParallax) {
    element.style.perspective = 'none';
  }
}

/**
 * Apply optimizations to an animated element
 */
export function optimizeAnimatedElement(
  element: HTMLElement,
  settings: PerformanceSettings
): void {
  if (!element) return;
  
  // Apply basic CSS optimizations
  applyCssOptimizations(element, settings);
  
  // Disable animations if needed
  if (!settings.enableAnimations) {
    element.style.animation = 'none';
    element.style.transition = 'none';
    return;
  }
  
  // Optimize existing animations
  if (element.style.animation) {
    // Get animation properties
    const animationProps = element.style.animation.split(' ');
    
    // If animation is too complex for current settings, simplify it
    if (
      settings.animationComplexity === 'minimal' || 
      settings.optimizationLevel === OptimizationLevel.MAXIMUM
    ) {
      // Keep only opacity transitions for minimal complexity
      if (animationProps.length > 2) {
        // Keep the name and duration, set simple easing
        element.style.animation = `${animationProps[0]} ${animationProps[1]} ease-out forwards`;
      }
    } else if (
      settings.animationComplexity === 'reduced' || 
      settings.optimizationLevel === OptimizationLevel.AGGRESSIVE
    ) {
      // Reduce animation duration for aggressive optimization
      if (animationProps.length > 1) {
        const duration = parseFloat(animationProps[1]);
        if (!isNaN(duration)) {
          // Reduce duration by 25%
          const newDuration = duration * 0.75;
          animationProps[1] = animationProps[1].replace(`${duration}`, `${newDuration}`);
          element.style.animation = animationProps.join(' ');
        }
      }
    }
  }
  
  // Optimize transitions
  if (element.style.transition) {
    // For maximum optimization, limit transitions to opacity only
    if (settings.optimizationLevel === OptimizationLevel.MAXIMUM) {
      if (element.style.transition.includes('opacity')) {
        element.style.transition = 'opacity 0.2s ease-out';
      } else {
        element.style.transition = 'none';
      }
    }
    // For aggressive optimization, reduce transition duration
    else if (settings.optimizationLevel === OptimizationLevel.AGGRESSIVE) {
      element.style.transition = element.style.transition
        .split(',')
        .map(transition => {
          const parts = transition.trim().split(' ');
          if (parts.length >= 2) {
            const duration = parseFloat(parts[1]);
            if (!isNaN(duration)) {
              // Reduce duration by 25%
              const newDuration = duration * 0.75;
              parts[1] = parts[1].replace(`${duration}`, `${newDuration}`);
            }
          }
          return parts.join(' ');
        })
        .join(', ');
    }
  }
}