/**
 * useMagneticLayout Hook
 * 
 * A comprehensive hook that combines snap points and alignment guides
 * to provide a complete magnetic layout system for precise element positioning.
 */

import { useRef, useState, useCallback, RefObject } from 'react';
import { Vector2D } from './magneticUtils';
import { 
  SnapPointConfig, 
  SnapSystemConfig, 
  DEFAULT_SNAP_CONFIG,
  SnapEvent,
  SnapResult
} from './snapPoints';
import { 
  useSnapPoints, 
  SnapPointsOptions, 
  SnapPointsResult 
} from './useSnapPoints';
import {
  useAlignmentGuides,
  AlignmentGuidesOptions,
  AlignmentGuidesResult
} from './useAlignmentGuides';
import {
  GuideLineStyle,
  DEFAULT_GUIDE_STYLE,
  AlignmentGuide
} from './alignmentGuides';

/**
 * Options for the useMagneticLayout hook
 */
export interface MagneticLayoutOptions {
  elementId: string;                      // Unique ID for this element
  initialPosition?: Vector2D;             // Starting position
  containerRef: RefObject<HTMLElement>;   // Reference to container element
  snapPoints?: SnapPointConfig[];         // Snap points for this element
  externalSnapPoints?: SnapPointConfig[]; // Global/external snap points
  externalElements?: Map<string, DOMRect>; // Other elements for snapping
  snapConfig?: Partial<SnapSystemConfig>; // Snap system configuration
  guideStyle?: Partial<GuideLineStyle>;   // Guide appearance customization
  showGuides?: boolean;                   // Whether guides are visible
  useMomentum?: boolean;                  // Use physics for dragging
  friction?: number;                      // Friction coefficient (0-1)
  constraints?: {                         // Movement constraints
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  onPositionChange?: (position: Vector2D, isSnap: boolean) => void;
  onSnap?: (result: SnapResult) => void;
  onDragStart?: (position: Vector2D) => void;
  onDragEnd?: (position: Vector2D) => void;
  disabled?: boolean;                     // Whether dragging is disabled
}

/**
 * Return type for the useMagneticLayout hook
 */
export interface MagneticLayoutResult<T extends HTMLElement = HTMLDivElement> {
  snapRef: RefObject<T>;                  // Ref to attach to the element
  position: Vector2D;                     // Current position
  isDragging: boolean;                    // Whether currently dragging
  snapInfo: SnapResult | null;            // Information about current snap
  startDrag: (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => void;
  stopDrag: () => void;
  moveTo: (position: Vector2D, snap?: boolean) => void;
  addSnapPoint: (point: SnapPointConfig) => void;
  removeSnapPoint: (id: string) => void;
  clearSnapPoints: () => void;
  toggleSnapping: (enabled: boolean) => void;
  toggleGuides: (show: boolean) => void;
  getElementRect: () => DOMRect | null;
  guidesElement: React.ReactElement | null; // SVG element with alignment guides
  styleProps: {                           // Style props to apply to element
    transform: string;
    cursor: string;
    userSelect: string;
    touchAction: string;
  };
}

/**
 * Custom hook that combines snap points and alignment guides
 * for a complete magnetic layout system
 */
export function useMagneticLayout<T extends HTMLElement = HTMLDivElement>(
  options: MagneticLayoutOptions
): MagneticLayoutResult<T> {
  // Destructure options with defaults
  const {
    elementId,
    initialPosition = { x: 0, y: 0 },
    containerRef,
    snapPoints: initialSnapPoints = [],
    externalSnapPoints = [],
    externalElements = new Map(),
    snapConfig = {},
    guideStyle = {},
    showGuides: initialShowGuides = true,
    useMomentum = true,
    friction = 0.92,
    constraints = {},
    onPositionChange,
    onSnap,
    onDragStart,
    onDragEnd,
    disabled = false
  } = options;
  
  // Merged configurations
  const mergedSnapConfig = { ...DEFAULT_SNAP_CONFIG, ...snapConfig };
  const mergedGuideStyle = { ...DEFAULT_GUIDE_STYLE, ...guideStyle };
  
  // Track snap events for guides
  const [snapEvents, setSnapEvents] = useState<SnapEvent[]>([]);
  
  // Elements map that includes this element
  const elementsMapRef = useRef<Map<string, DOMRect>>(new Map(externalElements));
  
  // Handle snap events from the snap points system
  const handleSnap = useCallback((result: SnapResult) => {
    // Update snap events for guides
    setSnapEvents(result.events);
    
    // Call external handler if provided
    if (onSnap) {
      onSnap(result);
    }
  }, [onSnap]);
  
  // Initialize snap points system
  const snapPointsResult = useSnapPoints<T>({
    elementId,
    initialPosition,
    parentRef: containerRef,
    snapConfig: mergedSnapConfig,
    snapPoints: initialSnapPoints,
    externalSnapPoints,
    useMomentum,
    friction,
    constraints,
    onPositionChange,
    onSnap: handleSnap,
    onDragStart,
    onDragEnd,
    disabled
  });
  
  // Update element rect in the map
  useCallback(() => {
    const rect = snapPointsResult.getElementRect();
    if (rect) {
      elementsMapRef.current.set(elementId, rect);
    }
  }, [elementId, snapPointsResult]);
  
  // Initialize alignment guides system
  const alignmentGuidesResult = useAlignmentGuides({
    containerRef,
    snapPoints: [...initialSnapPoints, ...externalSnapPoints],
    snapEvents,
    elementRects: elementsMapRef.current,
    systemConfig: mergedSnapConfig,
    guideStyle: mergedGuideStyle,
    showGuides: initialShowGuides,
    activeElementId: elementId
  });
  
  // Return the combined API
  return {
    snapRef: snapPointsResult.ref,
    position: snapPointsResult.position,
    isDragging: snapPointsResult.isDragging,
    snapInfo: snapPointsResult.snapInfo,
    startDrag: snapPointsResult.startDrag,
    stopDrag: snapPointsResult.stopDrag,
    moveTo: snapPointsResult.moveTo,
    addSnapPoint: (point: SnapPointConfig) => {
      snapPointsResult.addSnapPoint(point);
      alignmentGuidesResult.refreshGuides();
    },
    removeSnapPoint: (id: string) => {
      snapPointsResult.removeSnapPoint(id);
      alignmentGuidesResult.refreshGuides();
    },
    clearSnapPoints: () => {
      snapPointsResult.clearSnapPoints();
      alignmentGuidesResult.refreshGuides();
    },
    toggleSnapping: (enabled: boolean) => {
      snapPointsResult.toggleSnapSystem(enabled);
    },
    toggleGuides: (show: boolean) => {
      alignmentGuidesResult.showGuides(show);
    },
    getElementRect: snapPointsResult.getElementRect,
    guidesElement: alignmentGuidesResult.svgElement,
    styleProps: snapPointsResult.styleProps
  };
}