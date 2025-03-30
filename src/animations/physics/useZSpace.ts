/**
 * useZSpace.ts
 * 
 * React hook for managing element depth and applying 3D perspective effects.
 * Creates a perception of depth within the interface by manipulating the Z-axis.
 */

import React, { useState, useMemo, useRef, useEffect, RefObject } from 'react';
import { useZSpaceContext } from './ZSpaceProvider'; // Import the context hook

/**
 * Configuration options for the useZSpace hook
 */
export interface ZSpaceOptions {
  /**
   * Initial depth level (unitless, higher means closer)
   * Default: 0
   */
  initialDepth?: number;
  
  /**
   * Factor to multiply depth level by to get translateZ value (pixels per depth unit)
   * Default: 50
   */
  depthScale?: number;
  
  /**
   * Whether to apply perspective origin correction based on element position
   * Default: true
   */
  applyOriginCorrection?: boolean;

  /**
   * Optional: Ref to the perspective container element (if not using ZSpaceProvider)
   */
  perspectiveContainerRef?: RefObject<HTMLElement>;
}

/**
 * Transform properties related to Z-space
 */
export interface ZSpaceTransform {
  /** CSS style object to apply to the element */
  style: React.CSSProperties;
  /** Current depth level */
  depth: number;
  /** Calculated translateZ value */
  translateZ: number;
}

/**
 * Result of the useZSpace hook
 */
export interface ZSpaceResult<T extends HTMLElement = HTMLElement> {
  /** Ref to attach to the target element */
  elementRef: RefObject<T>;
  /** Z-space transform properties */
  transform: ZSpaceTransform;
  /** Function to update the depth level */
  setDepth: (newDepth: number) => void;
}

/**
 * Hook to manage Z-space depth and perspective for an element.
 * 
 * NOTE: Requires a parent container with the `perspective` CSS property set.
 * Consider using the `ZSpaceProvider` component for easier setup.
 * 
 * @param options Configuration options
 * @returns ZSpaceResult containing refs, styles, and controls
 */
export function useZSpace<T extends HTMLElement = HTMLElement>(
  options: ZSpaceOptions = {}
): ZSpaceResult<T> {
  const {
    initialDepth = 0,
    depthScale = 50,
    applyOriginCorrection = true,
    perspectiveContainerRef
  } = options;

  const elementRef = useRef<T>(null);
  const [depth, setDepth] = useState<number>(initialDepth);
  // Get context values if inside a provider
  const zSpaceContext = useZSpaceContext(); 
  const containerRef = perspectiveContainerRef || zSpaceContext?.containerRef;

  const style = useMemo((): React.CSSProperties => {
    const translateZ = depth * depthScale;
    let originX = '50%';
    let originY = '50%';

    // Calculate perspective origin correction if enabled and container exists
    if (applyOriginCorrection && elementRef.current && containerRef?.current) {
      const elemRect = elementRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate element center relative to container top-left
      const elementCenterX = elemRect.left - containerRect.left + elemRect.width / 2;
      const elementCenterY = elemRect.top - containerRect.top + elemRect.height / 2;

      // Convert to percentage relative to container dimensions
      // Avoid division by zero if container has no size
      const containerWidth = containerRect.width || 1;
      const containerHeight = containerRect.height || 1;
      
      originX = `${(elementCenterX / containerWidth) * 100}%`;
      originY = `${(elementCenterY / containerHeight) * 100}%`;
    }

    return {
      transform: `translateZ(${translateZ}px)`,
      transformStyle: 'preserve-3d', // Important for nested 3D elements
      willChange: 'transform', // Performance hint
      // Apply perspective-origin to the element itself if correcting
      // This assumes the main perspective is set on the parent (provider)
      perspectiveOrigin: applyOriginCorrection ? `${originX} ${originY}` : undefined,
      // Ensure the element has its own stacking context if needed
      position: 'relative' // Or absolute/fixed depending on layout needs
    };
  }, [depth, depthScale, applyOriginCorrection, containerRef]);
  
  // Effect to recalculate style if element or container moves/resizes
  // This is a basic implementation; consider ResizeObserver for more robustness
  useEffect(() => {
    // Trigger a recalculation of the style memo when context potentially changes
    // This is a dependency array hack, but forces re-evaluation of useMemo
  }, [zSpaceContext]); 

  const transform: ZSpaceTransform = useMemo(() => ({
    style,
    depth,
    translateZ: depth * depthScale
  }), [style, depth, depthScale]);

  return {
    elementRef,
    transform,
    setDepth
  };
}

export default useZSpace; 