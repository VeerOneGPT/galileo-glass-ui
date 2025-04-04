/**
 * useFallbackStrategies Hook
 * 
 * A React hook for implementing fallback strategies for different device capabilities
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getFallbackStrategies,
  shouldShowAnimation,
  getSimplifiedAnimation,
  shouldApplyVisualEffect,
  getAlternativeStyles,
  getOptimalImageSize,
  getVirtualizationConfig,
  getThrottlingConfig,
  getOptimizedRequestAnimationFrame,
  getComponentFallback,
  getDOMRenderingStrategy,
  getResourceLoadingStrategy,
  shouldUseVirtualization,
  getPaginationStrategy,
  getBestComponentVariant,
  getDynamicOptimizations,
  AnimationFallbackStrategy,
  VisualEffectFallbackStrategy,
  MediaFallbackStrategy,
  LayoutFallbackStrategy,
  RenderingFallbackStrategy,
  ComponentStrategy,
  ResourceLoadingStrategy,
  clearFallbackStrategiesCache
} from '../utils/fallback/strategies';
import { DeviceCapabilityTier, getDeviceCapabilities } from '../utils/deviceCapabilities';
import { useReducedMotion } from './useReducedMotion';

/**
 * Options for the useFallbackStrategies hook
 */
export interface FallbackOptions {
  /** The component or feature type this fallback is for */
  componentType?: string;
  
  /** The importance of this component (1-10) */
  importance?: number;
  
  /** Force a specific device tier for testing */
  forceTier?: DeviceCapabilityTier;
  
  /** Whether to dynamically optimize based on performance metrics */
  dynamicOptimization?: boolean;
  
  /** Override specific strategies */
  overrides?: {
    animation?: AnimationFallbackStrategy;
    visualEffects?: VisualEffectFallbackStrategy;
    media?: MediaFallbackStrategy;
    layout?: LayoutFallbackStrategy;
    rendering?: RenderingFallbackStrategy;
    componentStrategy?: ComponentStrategy;
    resourceLoading?: ResourceLoadingStrategy;
  };
}

/**
 * Return type for the useFallbackStrategies hook
 */
export interface FallbackStrategiesResult {
  /** The current fallback strategies */
  strategies: any;
  
  /** Whether animations should be shown */
  shouldShowAnimation: (animationName: string, localImportance?: number) => boolean;
  
  /** Get a simplified version of an animation */
  getSimplifiedAnimation: (animation: any) => any;
  
  /** Whether a visual effect should be applied */
  shouldApplyEffect: (effectType: 'glass' | 'blur' | 'shadow' | 'gradient' | 'parallax' | '3d' | 'filter') => boolean;
  
  /** Get alternative styles for an effect */
  getAlternativeStyles: (originalStyles: Record<string, any>, effectType: 'glass' | 'blur' | 'shadow' | 'gradient' | 'parallax' | '3d' | 'filter') => Record<string, any>;
  
  /** Get the optimal image configuration */
  getOptimalImage: (options: { original: string; sizes: Array<{ width: number; height: number; url: string; quality: number }>; importance?: 'high' | 'medium' | 'low'; lazyLoad?: boolean; }) => { url: string; width: number; height: number; loading: 'eager' | 'lazy'; };
  
  /** Get configuration for virtualization */
  getVirtualizationConfig: (itemCount: number) => { useVirtualization: boolean; itemsPerPage: number; overscan: number; };
  
  /** Get configuration for throttling */
  getThrottlingConfig: () => { throttleScroll: boolean; throttleResize: boolean; throttleMouseMove: boolean; scrollThrottleMs: number; resizeThrottleMs: number; mouseMoveThrottleMs: number; rafThrottleMs: number | null; };
  
  /** Get an optimized requestAnimationFrame function */
  getOptimizedRAF: () => (callback: FrameRequestCallback) => number;
  
  /** Get component-specific fallback configuration */
  getComponentFallback: (specificType?: string) => { useSimplifiedVersion: boolean; useReducedProps: boolean; disableFeatures: string[]; alternatives: Record<string, any>; };
  
  /** Get DOM rendering strategy */
  getDOMStrategy: () => { useShadowDOM: boolean; useDocumentFragment: boolean; batchDOMOperations: boolean; batchingInterval: number; useVirtualDOM: boolean; disableRippleEffects: boolean; useLayerOptimization: boolean; useOffscreenRendering: boolean; };
  
  /** Get resource loading strategy */
  getResourceStrategy: (resourceType: 'script' | 'style' | 'image' | 'font' | 'video' | 'audio', priority?: 'critical' | 'high' | 'medium' | 'low') => { shouldLoad: boolean; loadingStrategy: 'eager' | 'lazy' | 'async' | 'defer' | 'none'; cachingStrategy: 'force-cache' | 'no-cache' | 'default-cache'; optimizationTips: string[]; };
  
  /** Determine if virtualization should be used */
  shouldUseVirtualization: (itemCount: number, componentType?: string) => boolean;
  
  /** Get pagination strategy */
  getPaginationStrategy: (totalItems: number) => { itemsPerPage: number; maxPageButtons: number; useSimplifiedControls: boolean; };
  
  /** Get the best component variant based on device capabilities */
  getBestVariant: (variants: string[]) => string;
  
  /** Reset fallback strategies cache */
  resetStrategies: () => void;
  
  /** Current device tier */
  deviceTier: DeviceCapabilityTier;
  
  /** Whether the device is low-end */
  isLowEndDevice: boolean;
  
  /** Whether the user prefers reduced motion */
  prefersReducedMotion: boolean;
}

/**
 * A React hook that provides fallback strategies for different device capabilities.
 * 
 * @param options Options for customizing fallback behavior
 * @returns Object with fallback strategy helpers
 */
export const useFallbackStrategies = (options: FallbackOptions = {}): FallbackStrategiesResult => {
  // Get options with defaults
  const {
    componentType = 'general',
    importance = 5,
    forceTier,
    dynamicOptimization = false,
    overrides = {}
  } = options;
  
  // State for device capabilities
  const [deviceTier, setDeviceTier] = useState<DeviceCapabilityTier>(
    forceTier || DeviceCapabilityTier.MEDIUM
  );
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  
  // Get fallback strategies
  const strategies = useMemo(() => {
    const baseStrategies = getFallbackStrategies(forceTier);
    
    // Apply overrides if any
    return {
      ...baseStrategies,
      ...(overrides.animation ? { animation: overrides.animation } : {}),
      ...(overrides.visualEffects ? { visualEffects: overrides.visualEffects } : {}),
      ...(overrides.media ? { media: overrides.media } : {}),
      ...(overrides.layout ? { layout: overrides.layout } : {}),
      ...(overrides.rendering ? { rendering: overrides.rendering } : {}),
      ...(overrides.componentStrategy ? { componentStrategy: overrides.componentStrategy } : {}),
      ...(overrides.resourceLoading ? { resourceLoading: overrides.resourceLoading } : {})
    };
  }, [forceTier, overrides]);
  
  // Get device capabilities on mount
  useEffect(() => {
    if (forceTier) {
      return;
    }
    
    const getDeviceInfo = async () => {
      const capabilities = await getDeviceCapabilities();
      setDeviceTier(capabilities.tier);
      setIsLowEndDevice(capabilities.isLowEndDevice);
    };
    
    getDeviceInfo();
  }, [forceTier]);
  
  // Create memoized wrapper functions
  const shouldShowAnimationFn = React.useCallback(
    (animationName: string, localImportance?: number) =>
      shouldShowAnimation(animationName, localImportance ?? importance),
    [importance]
  );
  
  const getSimplifiedAnimationFn = React.useCallback(
    (animation: any) => getSimplifiedAnimation(animation),
    []
  );
  
  const shouldApplyEffectFn = React.useCallback(
    (effectType: 'glass' | 'blur' | 'shadow' | 'gradient' | 'parallax' | '3d' | 'filter') =>
      shouldApplyVisualEffect(effectType),
    []
  );
  
  const getAlternativeStylesFn = React.useCallback(
    (
      originalStyles: Record<string, any>,
      effectType: 'glass' | 'blur' | 'shadow' | 'gradient' | 'parallax' | '3d' | 'filter'
    ) => getAlternativeStyles(originalStyles, effectType),
    []
  );
  
  const getOptimalImageFn = React.useCallback(
    (options: {
      original: string;
      sizes: Array<{ width: number; height: number; url: string; quality: number }>;
      importance?: 'high' | 'medium' | 'low';
      lazyLoad?: boolean;
    }) => getOptimalImageSize(options),
    []
  );
  
  const getVirtualizationConfigFn = React.useCallback(
    (itemCount: number | undefined | null) => {
      // Add safeguard for invalid itemCount
      const safeItemCount = (typeof itemCount === 'number' && !isNaN(itemCount)) ? itemCount : 0;
      return getVirtualizationConfig(safeItemCount);
    },
    []
  );
  
  const getThrottlingConfigFn = React.useCallback(
    () => getThrottlingConfig(),
    []
  );
  
  const getOptimizedRAFFn = React.useCallback(
    () => getOptimizedRequestAnimationFrame(),
    []
  );
  
  const getComponentFallbackFn = React.useCallback(
    (specificType?: string) => getComponentFallback(specificType || componentType),
    [componentType]
  );
  
  const getDOMStrategyFn = React.useCallback(
    () => getDOMRenderingStrategy(),
    []
  );
  
  const getResourceStrategyFn = React.useCallback(
    (
      resourceType: 'script' | 'style' | 'image' | 'font' | 'video' | 'audio',
      priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
    ) => getResourceLoadingStrategy(resourceType, priority),
    []
  );
  
  const shouldUseVirtualizationFn = React.useCallback(
    (itemCount: number, specificType = 'list') =>
      shouldUseVirtualization(itemCount, specificType),
    []
  );
  
  const getPaginationStrategyFn = React.useCallback(
    (totalItems: number) => getPaginationStrategy(totalItems),
    []
  );
  
  const getBestVariantFn = React.useCallback(
    (variants: string[]) => getBestComponentVariant(componentType, variants),
    [componentType]
  );
  
  const resetStrategiesFn = React.useCallback(
    () => clearFallbackStrategiesCache(),
    []
  );
  
  // Return the fallback strategies result
  return {
    strategies,
    shouldShowAnimation: shouldShowAnimationFn,
    getSimplifiedAnimation: getSimplifiedAnimationFn,
    shouldApplyEffect: shouldApplyEffectFn,
    getAlternativeStyles: getAlternativeStylesFn,
    getOptimalImage: getOptimalImageFn,
    getVirtualizationConfig: getVirtualizationConfigFn,
    getThrottlingConfig: getThrottlingConfigFn,
    getOptimizedRAF: getOptimizedRAFFn,
    getComponentFallback: getComponentFallbackFn,
    getDOMStrategy: getDOMStrategyFn,
    getResourceStrategy: getResourceStrategyFn,
    shouldUseVirtualization: shouldUseVirtualizationFn,
    getPaginationStrategy: getPaginationStrategyFn,
    getBestVariant: getBestVariantFn,
    resetStrategies: resetStrategiesFn,
    deviceTier,
    isLowEndDevice,
    prefersReducedMotion
  };
};

export default useFallbackStrategies;