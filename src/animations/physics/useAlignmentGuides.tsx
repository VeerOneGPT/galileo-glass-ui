/**
 * useAlignmentGuides Hook
 * 
 * React hook for rendering and managing alignment guides for the snap points system.
 * This provides visual feedback during element positioning and layout design.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlignmentGuide,
  GuideLineStyle,
  DEFAULT_GUIDE_STYLE,
  collectAllGuides,
  createGuidePath,
  calculateLabelPosition
} from './alignmentGuides';
import { 
  SnapPointConfig, 
  SnapSystemConfig, 
  DEFAULT_SNAP_CONFIG,
  SnapEvent
} from './snapPoints';

/**
 * Options for the useAlignmentGuides hook
 */
export interface AlignmentGuidesOptions {
  containerRef: React.RefObject<HTMLElement>;     // Reference to the container element
  snapPoints?: SnapPointConfig[];                 // Snap points to create guides from
  snapEvents?: SnapEvent[];                       // Active snap events
  elementRects?: Map<string, DOMRect>;            // Element rectangles to generate guides for
  systemConfig?: Partial<SnapSystemConfig>;       // Snap system configuration
  guideStyle?: Partial<GuideLineStyle>;           // Guide appearance customization
  showGuides?: boolean;                           // Whether guides are visible
  dynamicGuides?: boolean;                        // Whether to show guides only during dragging
  activeElementId?: string;                       // ID of currently active element
}

/**
 * Return type for the useAlignmentGuides hook
 */
export interface AlignmentGuidesResult {
  guides: AlignmentGuide[];                       // Current guides
  svgElement: React.ReactElement | null;          // SVG element to render guides
  addGuide: (guide: AlignmentGuide) => void;      // Add a custom guide
  removeGuide: (id: string) => void;              // Remove a guide
  clearGuides: () => void;                        // Clear all guides
  showGuides: (show: boolean) => void;            // Toggle guide visibility
  refreshGuides: () => void;                      // Force refresh guides
}

/**
 * Custom hook for rendering and managing alignment guides
 */
export function useAlignmentGuides(
  options: AlignmentGuidesOptions
): AlignmentGuidesResult {
  // Destructure options with defaults
  const {
    containerRef,
    snapPoints = [],
    snapEvents = [],
    elementRects = new Map(),
    systemConfig = {},
    guideStyle = {},
    showGuides: initialShowGuides = true,
    dynamicGuides = false,
    activeElementId
  } = options;
  
  // Merge with defaults
  const config = { ...DEFAULT_SNAP_CONFIG, ...systemConfig };
  const style = { ...DEFAULT_GUIDE_STYLE, ...guideStyle };
  
  // State for guides
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  
  // State for guide visibility
  const [showGuidesState, setShowGuidesState] = useState<boolean>(
    initialShowGuides && config.showGuides
  );
  
  // Refs
  const customGuidesRef = useRef<AlignmentGuide[]>([]);
  const containerBoundsRef = useRef<DOMRect | null>(null);
  
  // Get container bounds
  const updateContainerBounds = useCallback(() => {
    if (containerRef.current) {
      containerBoundsRef.current = containerRef.current.getBoundingClientRect();
    }
  }, [containerRef]);
  
  // Collect all guides
  const updateGuides = useCallback(() => {
    if (!containerBoundsRef.current) {
      updateContainerBounds();
    }
    
    if (!containerBoundsRef.current) {
      return; // Still no bounds
    }
    
    // Get all guides from the system
    const systemGuides = collectAllGuides(
      snapPoints,
      snapEvents,
      elementRects,
      containerBoundsRef.current,
      config,
      style
    );
    
    // Combine with custom guides
    const allGuides = [...systemGuides, ...customGuidesRef.current];
    
    // Update state
    setGuides(allGuides);
  }, [
    snapPoints, snapEvents, elementRects, config, style, 
    updateContainerBounds
  ]);
  
  // Update guides when inputs change
  useEffect(() => {
    if (showGuidesState) {
      updateGuides();
    }
  }, [
    snapPoints, snapEvents, elementRects, config,
    showGuidesState, updateGuides
  ]);
  
  // Add resize observer to update on container resize
  useEffect(() => {
    updateContainerBounds();
    
    const observer = new ResizeObserver(() => {
      updateContainerBounds();
      updateGuides();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
    };
  }, [containerRef, updateContainerBounds, updateGuides]);
  
  // Add a custom guide
  const addGuide = useCallback((guide: AlignmentGuide) => {
    customGuidesRef.current = [...customGuidesRef.current, guide];
    updateGuides();
  }, [updateGuides]);
  
  // Remove a guide
  const removeGuide = useCallback((id: string) => {
    customGuidesRef.current = customGuidesRef.current.filter(g => g.id !== id);
    updateGuides();
  }, [updateGuides]);
  
  // Clear all custom guides
  const clearGuides = useCallback(() => {
    customGuidesRef.current = [];
    updateGuides();
  }, [updateGuides]);
  
  // Toggle guide visibility
  const toggleGuides = useCallback((show: boolean) => {
    setShowGuidesState(show);
  }, []);
  
  // Force refresh guides
  const refreshGuides = useCallback(() => {
    updateContainerBounds();
    updateGuides();
  }, [updateContainerBounds, updateGuides]);
  
  // Create SVG element
  const svgElement = React.useMemo(() => {
    if (!showGuidesState || !containerBoundsRef.current || guides.length === 0) {
      return null;
    }
    
    const bounds = containerBoundsRef.current;
    
    // Filter guides to only show active ones
    const activeGuides = guides.filter(g => g.active);
    
    return (
      <svg
        className="alignment-guides"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: style.zIndex,
          overflow: 'visible'
        }}
      >
        {/* Guide lines */}
        {activeGuides.map(guide => (
          <path
            key={guide.id}
            d={createGuidePath(guide, bounds, style)}
            stroke={guide.color || style.color}
            strokeWidth={guide.thickness || style.thickness}
            strokeDasharray={guide.dashArray || style.dashArray}
            opacity={guide.opacity || style.opacity}
          />
        ))}
        
        {/* Guide labels */}
        {style.showLabels && activeGuides
          .filter(guide => guide.label)
          .map(guide => {
            const labelPos = calculateLabelPosition(guide, bounds);
            return (
              <g key={`label-${guide.id}`}>
                <rect
                  x={labelPos.x - 2}
                  y={labelPos.y - style.labelFontSize}
                  width={guide.label ? guide.label.length * style.labelFontSize * 0.6 + 4 : 40}
                  height={style.labelFontSize + 4}
                  rx={3}
                  ry={3}
                  fill={style.labelBackground}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fontSize={style.labelFontSize}
                  fill={style.labelColor}
                  fontFamily="sans-serif"
                >
                  {guide.label}
                </text>
              </g>
            );
          })}
      </svg>
    );
  }, [guides, showGuidesState, style]);
  
  // Return the public API
  return {
    guides,
    svgElement,
    addGuide,
    removeGuide,
    clearGuides,
    showGuides: toggleGuides,
    refreshGuides
  };
}