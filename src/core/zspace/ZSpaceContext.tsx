import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ZSpaceContextValue, DefaultZSpaceContext, ZLayer, ZDepth } from './ZSpaceSystem';

// Create context with default values
export const ZSpaceContext = createContext<ZSpaceContextValue>(DefaultZSpaceContext);

export interface ZSpaceProviderProps {
  /**
   * The children to render within the Z-space context
   */
  children: React.ReactNode;
  
  /**
   * Base Z-index for this context
   */
  baseZIndex?: number;
  
  /**
   * Perspective depth for 3D effects
   */
  perspectiveDepth?: number;
  
  /**
   * Whether Z-space animations are enabled
   */
  animationsEnabled?: boolean;
  
  /**
   * Optional custom Z-index modifier function
   */
  zIndexModifier?: (layer: ZLayer | number, baseZIndex: number) => number;
  
  /**
   * Optional custom Z-depth modifier function
   */
  zDepthModifier?: (depth: ZDepth | number, baseDepth: number) => number;
}

/**
 * ZSpaceProvider Component
 * 
 * Provider component for the Z-space layering system.
 * Provides context for z-index and 3D transformation values.
 */
export const ZSpaceProvider: React.FC<ZSpaceProviderProps> = ({
  children,
  baseZIndex = 0,
  perspectiveDepth = 1000,
  animationsEnabled = true,
  zIndexModifier,
  zDepthModifier
}) => {
  // State for dynamic values
  const [baseZ, setBaseZ] = useState(baseZIndex);
  const [perspectiveValue, setPerspectiveValue] = useState(perspectiveDepth);
  const [animationsEnabledValue, setAnimationsEnabled] = useState(animationsEnabled);
  
  // Function to get final z-index value
  const getZIndex = useCallback((layer: ZLayer | number): number => {
    const layerValue = typeof layer === 'number' ? layer : layer;
    
    if (zIndexModifier) {
      return zIndexModifier(layer, baseZ);
    }
    
    return baseZ + layerValue;
  }, [baseZ, zIndexModifier]);
  
  // Function to get final z-depth value
  const getZDepth = useCallback((depth: ZDepth | number): number => {
    const depthValue = typeof depth === 'number' ? depth : depth;
    
    if (zDepthModifier) {
      return zDepthModifier(depth, 0);
    }
    
    return depthValue;
  }, [zDepthModifier]);
  
  // Function to get CSS transform for z-depth
  const getTransformCSS = useCallback((depth: ZDepth | number): string => {
    const zDepthValue = getZDepth(depth);
    return `translateZ(${zDepthValue}px)`;
  }, [getZDepth]);
  
  // Create context value
  const contextValue = useMemo<ZSpaceContextValue>(() => ({
    baseZIndex: baseZ,
    perspectiveDepth: perspectiveValue,
    animationsEnabled: animationsEnabledValue,
    getZIndex,
    getZDepth,
    getTransformCSS
  }), [
    baseZ,
    perspectiveValue,
    animationsEnabledValue,
    getZIndex,
    getZDepth,
    getTransformCSS
  ]);
  
  return (
    <ZSpaceContext.Provider value={contextValue}>
      {children}
    </ZSpaceContext.Provider>
  );
};

/**
 * Hook to access the Z-space context
 * 
 * @returns The Z-space context values and utilities
 */
export const useZSpace = (): ZSpaceContextValue => {
  const context = useContext(ZSpaceContext);
  
  if (!context) {
    throw new Error('useZSpace must be used within a ZSpaceProvider');
  }
  
  return context;
};

export default {
  ZSpaceContext,
  ZSpaceProvider,
  useZSpace
};