/**
 * Animation Renderer Factory
 * 
 * Creates the appropriate renderer based on device capabilities and performance requirements.
 */

import { AnimationRenderer, AnimationRendererFactory, AnimationPerformanceMetrics } from './types';
import WaapiRenderer from './WaapiRenderer';
import RafRenderer from './RafRenderer';

export interface RendererOptions {
  /**
   * Preferred renderer type
   */
  preferredRenderer?: 'waapi' | 'raf' | 'auto';
  
  /**
   * Performance priority
   */
  performancePriority?: 'quality' | 'battery' | 'balanced';
  
  /**
   * Device capability tier (auto-detected if not specified)
   */
  deviceTier?: 'high' | 'medium' | 'low';
  
  /**
   * Throttling options for RAF renderer
   */
  throttle?: {
    rate: number;
    interpolate: boolean;
  };
  
  /**
   * WAAPI renderer options
   */
  waapi?: {
    useComposite: boolean;
    fill: 'none' | 'forwards' | 'backwards' | 'both';
  };
  
  /**
   * Target FPS when using the RAF renderer
   */
  targetFps?: number;
}

/**
 * Creates the appropriate renderer based on device capabilities and options
 */
export class GalileoRendererFactory implements AnimationRendererFactory {
  private static instance: GalileoRendererFactory;
  private rendererCache: Map<string, AnimationRenderer> = new Map();
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): GalileoRendererFactory {
    if (!GalileoRendererFactory.instance) {
      GalileoRendererFactory.instance = new GalileoRendererFactory();
    }
    return GalileoRendererFactory.instance;
  }
  
  /**
   * Create an appropriate renderer based on options and device capabilities
   */
  public createRenderer(options: RendererOptions = {}): AnimationRenderer {
    const {
      preferredRenderer = 'auto',
      performancePriority = 'balanced',
      deviceTier = this.detectDeviceTier(),
      targetFps = this.getTargetFps(performancePriority, deviceTier),
      throttle = { rate: 1000 / targetFps, interpolate: true },
      waapi = { useComposite: true, fill: 'both' as const }
    } = options;
    
    // Create cache key
    const cacheKey = `${preferredRenderer}-${performancePriority}-${deviceTier}-${targetFps}`;
    
    // Check cache
    if (this.rendererCache.has(cacheKey)) {
      return this.rendererCache.get(cacheKey)!;
    }
    
    // Create appropriate renderer
    let renderer: AnimationRenderer;
    
    if (preferredRenderer === 'waapi' || (preferredRenderer === 'auto' && WaapiRenderer.isSupported() && deviceTier !== 'low')) {
      // Use WAAPI for high and medium tier devices when supported
      renderer = new WaapiRenderer(waapi);
    } else {
      // Use RAF renderer with appropriate throttling
      renderer = new RafRenderer({
        throttleRate: throttle.rate,
        interpolate: throttle.interpolate
      });
    }
    
    // Cache renderer
    this.rendererCache.set(cacheKey, renderer);
    
    return renderer;
  }
  
  /**
   * Get performance metrics for a renderer
   */
  public getPerformanceMetrics(renderer: AnimationRenderer): AnimationPerformanceMetrics {
    // Default metrics
    const metrics: AnimationPerformanceMetrics = {
      fps: 60,
      animationDelay: 0,
      gpuAccelerated: false,
      startupLatency: 0
    };
    
    // In a real implementation, we would measure these metrics
    // For now, provide reasonable default values
    
    if (renderer instanceof WaapiRenderer) {
      metrics.fps = 60;
      metrics.animationDelay = 5;
      metrics.gpuAccelerated = true;
      metrics.startupLatency = 8;
    } else if (renderer instanceof RafRenderer) {
      const rafRenderer = renderer as any;
      const throttleRate = rafRenderer.defaultOptions?.throttleRate || 16.67;
      metrics.fps = Math.min(60, Math.round(1000 / throttleRate));
      metrics.animationDelay = 10;
      metrics.gpuAccelerated = false;
      metrics.startupLatency = 2;
    }
    
    return metrics;
  }
  
  /**
   * Detect device capability tier
   */
  private detectDeviceTier(): 'high' | 'medium' | 'low' {
    // Check for navigator.deviceMemory, hardwareConcurrency, and connection type
    // to determine device capability
    
    const memory = (navigator as any).deviceMemory as number | undefined;
    const cores = navigator.hardwareConcurrency || 1;
    const connection = (navigator as any).connection as any;
    
    if (
      // High-end device indicators
      (memory && memory >= 4) ||
      cores >= 6 ||
      (connection && connection.effectiveType === '4g' && !connection.saveData)
    ) {
      return 'high';
    } else if (
      // Low-end device indicators
      (memory && memory <= 1) ||
      cores <= 2 ||
      (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.saveData))
    ) {
      return 'low';
    } else {
      // Default to medium
      return 'medium';
    }
  }
  
  /**
   * Get target FPS based on performance priority and device tier
   */
  private getTargetFps(
    performancePriority: 'quality' | 'battery' | 'balanced',
    deviceTier: 'high' | 'medium' | 'low'
  ): number {
    const fpsTable = {
      quality: {
        high: 60,
        medium: 60,
        low: 30
      },
      balanced: {
        high: 60,
        medium: 40,
        low: 24
      },
      battery: {
        high: 40,
        medium: 30,
        low: 20
      }
    };
    
    return fpsTable[performancePriority][deviceTier];
  }
}

export default GalileoRendererFactory;