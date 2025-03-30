/**
 * useSnapPoints Hook
 * 
 * React hook for adding magnetic snap points to draggable elements.
 * This provides a UI component with snapping capabilities to points, grids, lines,
 * and other elements in a physics-based, natural feeling way.
 */

import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { InertialMovement } from './inertialMovement';
import { Vector2D } from './magneticUtils';
import {
  SnapPointType,
  SnapOrientation,
  SnapPointConfig,
  SnapSystemConfig,
  SnapResult,
  DEFAULT_SNAP_CONFIG,
  processElementSnap
} from './snapPoints';

/**
 * Interface for working with a draggable element
 */
export interface DraggableElementState {
  position: Vector2D;
  isDragging: boolean;
  snapInfo: SnapResult | null;
  dragStart: Vector2D | null;
  dragOffset: Vector2D;
  lastSnapInfo: SnapResult | null;
}

/**
 * Options for the useSnapPoints hook
 */
export interface SnapPointsOptions {
  elementId: string;                        // Unique ID for this element
  initialPosition?: Vector2D;               // Starting position
  parentRef?: RefObject<HTMLElement>;       // Reference to container element (for offset calculation)
  snapConfig?: Partial<SnapSystemConfig>;   // Custom snap system configuration
  snapPoints?: SnapPointConfig[];           // Snap points to use
  externalSnapPoints?: SnapPointConfig[];   // Additional snap points from external sources
  useMomentum?: boolean;                    // Whether to use physics-based momentum for dragging
  friction?: number;                        // Friction coefficient for physics (0-1)
  constraints?: {                           // Movement constraints
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  onPositionChange?: (position: Vector2D, isSnap: boolean) => void;
  onSnap?: (result: SnapResult) => void;
  onDragStart?: (position: Vector2D) => void;
  onDragEnd?: (position: Vector2D) => void;
  disabled?: boolean;                      // Whether dragging is disabled
}

/**
 * Return type for the useSnapPoints hook
 */
export interface SnapPointsResult<T extends HTMLElement = HTMLDivElement> {
  ref: RefObject<T>;                       // Ref to attach to the draggable element
  position: Vector2D;                      // Current position of the element
  isDragging: boolean;                     // Whether currently dragging
  snapInfo: SnapResult | null;             // Information about the current snap
  startDrag: (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => void;
  stopDrag: () => void;
  moveTo: (position: Vector2D, snap?: boolean) => void;
  addSnapPoint: (point: SnapPointConfig) => void;
  removeSnapPoint: (id: string) => void;
  toggleSnapSystem: (enabled: boolean) => void;
  clearSnapPoints: () => void;
  getElementRect: () => DOMRect | null;
  styleProps: {                            // Style props to apply to the element
    transform: string;
    cursor: string;
    userSelect: string;
    touchAction: string;
  };
}

/**
 * Custom hook for adding magnetic snap points to a draggable element
 */
export function useSnapPoints<T extends HTMLElement = HTMLDivElement>(
  options: SnapPointsOptions
): SnapPointsResult<T> {
  // Destructure options with defaults
  const {
    elementId,
    initialPosition = { x: 0, y: 0 },
    parentRef,
    snapConfig = {},
    snapPoints: initialSnapPoints = [],
    externalSnapPoints = [],
    useMomentum = true,
    friction = 0.92,
    constraints = {},
    onPositionChange,
    onSnap,
    onDragStart,
    onDragEnd,
    disabled = false
  } = options;

  // Merge with default config
  const config = { ...DEFAULT_SNAP_CONFIG, ...snapConfig };
  
  // Element reference
  const elementRef = useRef<T>(null);
  
  // State for element position and dragging
  const [state, setState] = useState<DraggableElementState>({
    position: initialPosition,
    isDragging: false,
    snapInfo: null,
    dragStart: null,
    dragOffset: { x: 0, y: 0 },
    lastSnapInfo: null
  });
  
  // State for snap points
  const [snapPoints, setSnapPoints] = useState<SnapPointConfig[]>(initialSnapPoints);
  const [systemEnabled, setSystemEnabled] = useState<boolean>(config.enabled);
  
  // Refs for physics
  const inertialXRef = useRef<InertialMovement | null>(null);
  const inertialYRef = useRef<InertialMovement | null>(null);
  const animationRequestRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  
  // Check for reduced motion preference
  const shouldReduceMotion = useReducedMotion();

  // Function to get element and parent rects
  const getElementRect = useCallback((): DOMRect | null => {
    return elementRef.current ? elementRef.current.getBoundingClientRect() : null;
  }, []);
  
  const getParentRect = useCallback((): DOMRect | null => {
    return parentRef && parentRef.current ? parentRef.current.getBoundingClientRect() : null;
  }, [parentRef]);
  
  // Initialize physics controllers
  useEffect(() => {
    // Create physics controllers
    const physicsConfig = {
      friction: shouldReduceMotion ? Math.max(friction, 0.95) : friction,
      mass: 1,
      restThreshold: shouldReduceMotion ? 0.5 : 0.1
    };
    
    inertialXRef.current = new InertialMovement(physicsConfig);
    inertialYRef.current = new InertialMovement(physicsConfig);
    
    // Set initial position
    inertialXRef.current.set(initialPosition.x, 0);
    inertialYRef.current.set(initialPosition.y, 0);
    
    return () => {
      // Clean up
      if (animationRequestRef.current) cancelAnimationFrame(animationRequestRef.current);
    };
  }, [initialPosition.x, initialPosition.y, friction, shouldReduceMotion]);
  
  // Apply constraints to a position
  const applyConstraints = useCallback((position: Vector2D): Vector2D => {
    const { minX, maxX, minY, maxY } = constraints;
    
    return {
      x: minX !== undefined && position.x < minX ? minX :
         maxX !== undefined && position.x > maxX ? maxX : 
         position.x,
      y: minY !== undefined && position.y < minY ? minY :
         maxY !== undefined && position.y > maxY ? maxY : 
         position.y
    };
  }, [constraints]);
  
  // Process element position through snap system
  const processSnapping = useCallback((position: Vector2D): SnapResult => {
    // If snapping disabled, return non-snap result
    if (!systemEnabled) {
      return {
        snapped: false,
        position: { ...position },
        delta: { x: 0, y: 0 },
        force: { x: 0, y: 0 },
        strength: 0,
        events: []
      };
    }
    
    // Get element rect if available
    const elementRect = getElementRect();
    
    // Get target rects for element snapping
    const targetRects = new Map<string, DOMRect>();
    
    // Process the snap
    return processElementSnap(
      elementId,
      position,
      [...snapPoints, ...externalSnapPoints],
      { ...config, enabled: systemEnabled },
      elementRect || undefined,
      targetRects
    );
  }, [elementId, snapPoints, externalSnapPoints, config, systemEnabled, getElementRect]);
  
  // Animation loop for physics
  const animatePhysics = useCallback(() => {
    if (!inertialXRef.current || !inertialYRef.current) return;
    
    inertialXRef.current.update();
    inertialYRef.current.update();
    
    // Replace getValue() with getPosition()
    const physicsX = inertialXRef.current.getPosition();
    const physicsY = inertialYRef.current.getPosition();
    
    // Apply constraints
    const constrainedPosition = applyConstraints({ x: physicsX, y: physicsY });
    
    // Apply snapping if enabled
    const snapResult = processSnapping(constrainedPosition);
    
    // Update state with new position and snap info
    setState(prev => ({
      ...prev,
      position: snapResult.position,
      snapInfo: snapResult.snapped ? snapResult : null
    }));
    
    // Notify about position change
    if (onPositionChange) {
      onPositionChange(snapResult.position, snapResult.snapped);
    }
    
    // Notify about snap
    if (snapResult.snapped && onSnap) {
      onSnap(snapResult);
    }
    
    // Continue animation if moving
    const isMoving = 
      inertialXRef.current.getVelocity() !== 0 || 
      inertialYRef.current.getVelocity() !== 0 ||
      isDraggingRef.current;
    
    if (isMoving) {
      animationRequestRef.current = requestAnimationFrame(animatePhysics);
    } else {
      animationRequestRef.current = null;
    }
  }, [applyConstraints, processSnapping, onPositionChange, onSnap]);
  
  // Get page coordinates from event
  const getPageCoordinates = useCallback((e: MouseEvent | TouchEvent): Vector2D => {
    if ('touches' in e) {
      return { x: e.touches[0].pageX, y: e.touches[0].pageY };
    } else {
      return { x: e.pageX, y: e.pageY };
    }
  }, []);
  
  // Get local coordinates within the parent container
  const getLocalCoordinates = useCallback((pageX: number, pageY: number): Vector2D => {
    const parentRect = getParentRect();
    
    if (parentRect) {
      return {
        x: pageX - parentRect.left,
        y: pageY - parentRect.top
      };
    }
    
    return { x: pageX, y: pageY };
  }, [getParentRect]);
  
  // Start dragging handler
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (disabled) return;
    
    // Prevent default to avoid text selection during drag
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    
    // Get event coordinates
    const coords = getPageCoordinates(e as MouseEvent | TouchEvent);
    const localCoords = getLocalCoordinates(coords.x, coords.y);
    
    // Calculate drag offset from element position
    const dragOffset = {
      x: state.position.x - localCoords.x,
      y: state.position.y - localCoords.y
    };
    
    // Update state
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { ...localCoords },
      dragOffset
    }));
    
    isDraggingRef.current = true;
    
    // Start animation loop
    if (!animationRequestRef.current) {
      animationRequestRef.current = requestAnimationFrame(animatePhysics);
    }
    
    if (onDragStart) {
      onDragStart(state.position);
    }
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      
      // Get move coordinates
      const moveCoords = getPageCoordinates(moveEvent);
      const localMoveCoords = getLocalCoordinates(moveCoords.x, moveCoords.y);
      
      // Calculate new position with drag offset
      const newPosition = {
        x: localMoveCoords.x + dragOffset.x,
        y: localMoveCoords.y + dragOffset.y
      };
      
      // Apply constraints
      const constrainedPosition = applyConstraints(newPosition);
      
      // Process snap points
      const snapResult = processSnapping(constrainedPosition);
      
      // Update physics engine
      if (inertialXRef.current && inertialYRef.current) {
        if (useMomentum) {
          inertialXRef.current.set(snapResult.position.x, 0);
          inertialYRef.current.set(snapResult.position.y, 0);
        } else {
          inertialXRef.current.set(snapResult.position.x, 0);
          inertialYRef.current.set(snapResult.position.y, 0);
        }
      }
      
      // Update state
      setState(prev => ({
        ...prev,
        position: snapResult.position,
        snapInfo: snapResult.snapped ? snapResult : null
      }));
      
      // Notify on position change
      if (onPositionChange) {
        onPositionChange(snapResult.position, snapResult.snapped);
      }
      
      // Notify about snap
      if (snapResult.snapped && onSnap) {
        onSnap(snapResult);
      }
    };
    
    const handleEnd = () => {
      // Update state
      setState(prev => ({
        ...prev,
        isDragging: false,
        lastSnapInfo: prev.snapInfo
      }));
      
      // Update ref
      isDraggingRef.current = false;
      
      // Notify drag end
      if (onDragEnd) {
        onDragEnd(state.position);
      }
      
      // Clean up event listeners
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMove, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  }, [
    disabled, getPageCoordinates, getLocalCoordinates, state.position,
    applyConstraints, processSnapping, useMomentum, onPositionChange,
    onSnap, onDragStart, onDragEnd, animatePhysics
  ]);
  
  // Function to stop dragging
  const stopDrag = useCallback(() => {
    isDraggingRef.current = false;
    
    setState(prev => ({
      ...prev,
      isDragging: false,
      lastSnapInfo: prev.snapInfo
    }));
  }, []);
  
  // Function to move element to a specific position
  const moveTo = useCallback((position: Vector2D, snap = true) => {
    // Apply constraints
    const constrainedPosition = applyConstraints(position);
    
    // Apply snapping if enabled
    const snapResult = snap ? processSnapping(constrainedPosition) : {
      snapped: false,
      position: constrainedPosition,
      delta: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      strength: 0,
      events: []
    };
    
    // Update physics engine
    if (inertialXRef.current && inertialYRef.current) {
      inertialXRef.current.set(snapResult.position.x, 0);
      inertialYRef.current.set(snapResult.position.y, 0);
    }
    
    // Update state
    setState(prev => ({
      ...prev,
      position: snapResult.position,
      snapInfo: snapResult.snapped ? snapResult : null
    }));
    
    // Notify on position change
    if (onPositionChange) {
      onPositionChange(snapResult.position, snapResult.snapped);
    }
    
    // Notify about snap
    if (snapResult.snapped && onSnap) {
      onSnap(snapResult);
    }
  }, [applyConstraints, processSnapping, onPositionChange, onSnap]);
  
  // Function to add a new snap point
  const addSnapPoint = useCallback((point: SnapPointConfig) => {
    setSnapPoints(prev => [...prev, point]);
  }, []);
  
  // Function to remove a snap point
  const removeSnapPoint = useCallback((id: string) => {
    setSnapPoints(prev => prev.filter(p => p.id !== id));
  }, []);
  
  // Function to toggle snap system
  const toggleSnapSystem = useCallback((enabled: boolean) => {
    setSystemEnabled(enabled);
  }, []);
  
  // Function to clear all snap points
  const clearSnapPoints = useCallback(() => {
    setSnapPoints([]);
  }, []);
  
  // Style props to apply to the element
  const styleProps = {
    transform: `translate(${state.position.x}px, ${state.position.y}px)`,
    cursor: disabled ? 'default' : state.isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    touchAction: 'none'
  };
  
  // Return public API
  return {
    ref: elementRef,
    position: state.position,
    isDragging: state.isDragging,
    snapInfo: state.snapInfo,
    startDrag,
    stopDrag,
    moveTo,
    addSnapPoint,
    removeSnapPoint,
    toggleSnapSystem,
    clearSnapPoints,
    getElementRect,
    styleProps
  };
}