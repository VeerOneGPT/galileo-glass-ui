/**
 * Higher-Order Component for applying fallback strategies to components
 * 
 * Provides automatic fallback strategy application based on device capabilities
 */

import React, { ComponentType, useEffect, useState } from 'react';
import { FallbackOptions, useFallbackStrategies } from '../../hooks/useFallbackStrategies';
import { DeviceCapabilityTier } from '../deviceCapabilities';

export interface WithFallbackStrategiesProps {
  /** Override the component type */
  componentType?: string;
  
  /** Override the component importance */
  importance?: number;
  
  /** Force a specific device tier (for testing) */
  forceTier?: DeviceCapabilityTier;
  
  /** Whether to apply dynamic optimization */
  dynamicOptimization?: boolean;
  
  /** Custom fallback options */
  fallbackOptions?: FallbackOptions;
}

/**
 * Higher-Order Component that applies fallback strategies to a component
 * 
 * @param Component The component to wrap
 * @param options Default fallback options for the component
 * @returns A component with fallback strategies applied
 */
export const withFallbackStrategies = <P extends object>(
  Component: ComponentType<P>,
  options: FallbackOptions = {}
) => {
  // Create the wrapped component
  const WithFallbackStrategies = (props: P & WithFallbackStrategiesProps) => {
    // Extract fallback props
    const {
      componentType,
      importance,
      forceTier, 
      dynamicOptimization,
      fallbackOptions,
      ...componentProps
    } = props as WithFallbackStrategiesProps & P;
    
    // Merge options with props
    const mergedOptions: FallbackOptions = {
      ...options,
      ...(componentType ? { componentType } : {}),
      ...(importance !== undefined ? { importance } : {}),
      ...(forceTier ? { forceTier } : {}),
      ...(dynamicOptimization !== undefined ? { dynamicOptimization } : {}),
      ...fallbackOptions
    };
    
    // Use fallback strategies
    const fallback = useFallbackStrategies(mergedOptions);
    
    // Get the component-specific fallback configuration
    const componentFallback = fallback.getComponentFallback();
    
    // Use simplified version if needed
    const [Component2Use, setComponent2Use] = useState<ComponentType<P>>(Component);
    
    // Track performance metrics for dynamic optimization
    const [metrics, setMetrics] = useState({
      fps: 60,
      renderTime: 0
    });
    
    // Effect for performance tracking (if dynamic optimization is enabled)
    useEffect(() => {
      if (!mergedOptions.dynamicOptimization) return;
      
      let frameCount = 0;
      let lastTime = performance.now();
      let frameId: number;
      
      const trackPerformance = () => {
        const now = performance.now();
        frameCount++;
        
        const elapsed = now - lastTime;
        
        if (elapsed >= 1000) {
          const fps = Math.round((frameCount * 1000) / elapsed);
          setMetrics(prev => ({
            ...prev,
            fps
          }));
          
          frameCount = 0;
          lastTime = now;
        }
        
        frameId = requestAnimationFrame(trackPerformance);
      };
      
      frameId = requestAnimationFrame(trackPerformance);
      
      return () => {
        cancelAnimationFrame(frameId);
      };
    }, [mergedOptions.dynamicOptimization]);
    
    // Apply dynamic optimizations
    const dynamicProps: Record<string, any> = {};
    
    if (mergedOptions.dynamicOptimization) {
      const optimizations = fallback.strategies.dynamicQualityReduction 
        ? getDynamicOptimizations(metrics)
        : { reduceAnimations: false, reduceEffects: false, simplifyDOM: false, disableFeatures: [], recommendations: [] };
      
      // Apply dynamic optimizations
      if (optimizations.reduceAnimations) {
        dynamicProps.disableAnimations = true;
      }
      
      if (optimizations.reduceEffects) {
        dynamicProps.disableEffects = true;
      }
      
      if (optimizations.simplifyDOM) {
        dynamicProps.simplifyDOM = true;
      }
      
      if (optimizations.disableFeatures.length > 0) {
        dynamicProps.disabledFeatures = optimizations.disableFeatures;
      }
    }
    
    // Prepare fallback props to pass to the component
    const fallbackProps = {
      fallbackStrategies: fallback,
      useFallback: componentFallback.useSimplifiedVersion,
      reducedProps: componentFallback.useReducedProps,
      disabledFeatures: componentFallback.disableFeatures,
      alternatives: componentFallback.alternatives,
      deviceTier: fallback.deviceTier,
      isLowEndDevice: fallback.isLowEndDevice,
      prefersReducedMotion: fallback.prefersReducedMotion,
      ...dynamicProps
    };
    
    // Forward the component props along with fallback props
    return <Component {...componentProps as P} {...fallbackProps} />;
  };
  
  // Set display name
  const displayName = Component.displayName || Component.name || 'Component';
  WithFallbackStrategies.displayName = `withFallbackStrategies(${displayName})`;
  
  return WithFallbackStrategies;
};

// Helper function to get dynamic optimizations based on metrics
function getDynamicOptimizations(metrics: { fps: number; renderTime: number }) {
  // Placeholder implementation
  return {
    reduceAnimations: metrics.fps < 30,
    reduceEffects: metrics.fps < 20,
    simplifyDOM: metrics.fps < 15,
    disableFeatures: metrics.fps < 15 ? ['parallax', 'blur-effects'] : [],
    recommendations: []
  };
}

export default withFallbackStrategies;