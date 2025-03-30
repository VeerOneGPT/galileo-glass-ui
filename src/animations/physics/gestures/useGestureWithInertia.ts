/**
 * Gesture with Inertia Hook
 * 
 * React hook for handling multi-touch gestures with inertial motion.
 * Enables flick/swipe gestures that continue with natural momentum,
 * creating more engaging and natural interactions.
 */

import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { useReducedMotion } from '../../accessibility/useReducedMotion';
import { 
  GestureType, 
  GestureState, 
  GestureEventData, 
  createGestureDetector 
} from './GestureDetector';
import { 
  GestureResponder, 
  createGestureResponder, 
  ResponderConfig, 
  ResponseType, 
  PhysicsState 
} from './gestureResponders';
import { Vector2D } from '../types';

/**
 * Gesture with inertia options
 */
export interface GestureWithInertiaOptions {
  elementRef: RefObject<HTMLElement>;    // Element to attach gestures to
  initialPosition?: Vector2D;            // Starting position
  mass?: number;                         // Mass for physics calculations
  friction?: number;                     // Friction coefficient (0-1)
  
  // Gesture configurations
  enablePan?: boolean;                   // Enable pan gesture
  enableSwipe?: boolean;                 // Enable swipe gesture
  enablePinch?: boolean;                 // Enable pinch gesture
  enableRotate?: boolean;                // Enable rotate gesture
  
  // Inertia options
  inertiaStrength?: number;              // Inertia strength multiplier
  decelerationRate?: number;             // Rate of deceleration (0-1)
  
  // Boundaries for movement
  boundaries?: {
    x?: { min?: number; max?: number };
    y?: { min?: number; max?: number };
  };
  
  // Snap options
  snapPoints?: Vector2D[];               // Points to snap to
  snapThreshold?: number;                // Distance threshold for snapping
  
  // Callback options
  onMove?: (position: Vector2D, source: 'gesture' | 'inertia') => void;
  onInertiaStart?: (velocity: Vector2D) => void;
  onInertiaEnd?: (position: Vector2D) => void;
  onSnap?: (position: Vector2D, snapPoint: Vector2D) => void;
}

/**
 * Result of the useGestureWithInertia hook
 */
export interface GestureWithInertiaResult {
  position: Vector2D;                     // Current position
  isGestureActive: boolean;               // Whether gesture is active
  isInertiaActive: boolean;               // Whether inertia is active
  
  // Methods for controlling
  startInertia: (velocity: Vector2D) => void;
  stopInertia: () => void;
  snapToPoint: (point: Vector2D) => void;
  moveTo: (position: Vector2D, animate?: boolean) => void;
  
  // Gesture event handling
  handleGestureEvent: (event: GestureEventData) => void;
}

/**
 * Default responder configurations
 */
const DEFAULT_RESPONDERS: ResponderConfig[] = [
  // Pan with inertia
  {
    type: ResponseType.INERTIA,
    gestures: [GestureType.PAN],
    states: [GestureState.ENDED],
    strength: 1,
    decay: 0.95,
    threshold: 0.05
  },
  
  // Swipe with stronger inertia
  {
    type: ResponseType.IMPULSE,
    gestures: [GestureType.SWIPE],
    states: [GestureState.RECOGNIZED],
    strength: 1.5,
    decay: 0.9
  },
  
  // Elastic boundaries
  {
    type: ResponseType.ELASTIC,
    gestures: [GestureType.PAN, GestureType.SWIPE],
    states: [GestureState.CHANGED, GestureState.ENDED],
    strength: 1.2,
    dampingRatio: 0.6,
    frequency: 1.8
  }
];

/**
 * Hook for gesture handling with inertial physics
 */
export function useGestureWithInertia(
  options: GestureWithInertiaOptions
): GestureWithInertiaResult {
  // Extract options with defaults
  const {
    elementRef,
    initialPosition = { x: 0, y: 0 },
    mass = 1,
    friction = 0.9,
    enablePan = true,
    enableSwipe = true,
    enablePinch = false,
    enableRotate = false,
    inertiaStrength = 1,
    decelerationRate = 0.95,
    boundaries,
    snapPoints,
    snapThreshold = 20,
    onMove,
    onInertiaStart,
    onInertiaEnd,
    onSnap
  } = options;
  
  // State for position and active status
  const [position, setPosition] = useState<Vector2D>(initialPosition);
  const [isGestureActive, setIsGestureActive] = useState<boolean>(false);
  const [isInertiaActive, setIsInertiaActive] = useState<boolean>(false);
  
  // Check for reduced motion
  const preferReducedMotion = useReducedMotion();
  
  // Adjust physics parameters based on reduced motion preference
  const adjustedInertiaStrength = preferReducedMotion ? 0.5 : inertiaStrength;
  const adjustedDeceleration = preferReducedMotion ? Math.min(decelerationRate + 0.1, 0.98) : decelerationRate;
  
  // Refs for gesture and physics state
  const gestureStartPositionRef = useRef<Vector2D>({ ...initialPosition });
  const lastGestureEventRef = useRef<GestureEventData | null>(null);
  const responderRef = useRef<GestureResponder | null>(null);
  const gestureDetectorRef = useRef<ReturnType<typeof createGestureDetector> | null>(null);
  
  // Create responder configurations
  const createResponders = useCallback((): ResponderConfig[] => {
    const responders: ResponderConfig[] = [];
    
    // Pan with inertia
    if (enablePan) {
      responders.push({
        type: ResponseType.FORCE,
        gestures: [GestureType.PAN],
        states: [GestureState.CHANGED],
        strength: 1
      });
      
      responders.push({
        type: ResponseType.INERTIA,
        gestures: [GestureType.PAN],
        states: [GestureState.ENDED],
        strength: adjustedInertiaStrength,
        decay: adjustedDeceleration,
        threshold: 0.05,
        onResponse: (response) => {
          setIsInertiaActive(true);
          onInertiaStart?.(response.velocity || { x: 0, y: 0 });
        }
      });
    }
    
    // Swipe with stronger inertia
    if (enableSwipe) {
      responders.push({
        type: ResponseType.IMPULSE,
        gestures: [GestureType.SWIPE],
        states: [GestureState.RECOGNIZED],
        strength: adjustedInertiaStrength * 1.5,
        decay: adjustedDeceleration,
        onResponse: (response) => {
          setIsInertiaActive(true);
          onInertiaStart?.(response.impulse || { x: 0, y: 0 });
        }
      });
    }
    
    // Elastic boundaries if configured
    if (boundaries) {
      responders.push({
        type: ResponseType.ELASTIC,
        gestures: [GestureType.PAN, GestureType.SWIPE],
        states: [GestureState.CHANGED, GestureState.ENDED],
        strength: 1.2,
        dampingRatio: 0.6,
        frequency: 1.8,
        constraints: boundaries
      });
    }
    
    // Snap responder if snap points are provided
    if (snapPoints && snapPoints.length > 0) {
      responders.push({
        type: ResponseType.MAGNET,
        gestures: [GestureType.PAN, GestureType.SWIPE],
        states: [GestureState.ENDED],
        strength: 1,
        threshold: snapThreshold,
        target: () => findNearestSnapPoint(position),
        onResponse: (response) => {
          if (response.target) {
            onSnap?.(position, response.target);
          }
        }
      });
    }
    
    return responders;
  }, [
    enablePan, 
    enableSwipe, 
    adjustedInertiaStrength, 
    adjustedDeceleration, 
    boundaries, 
    snapPoints, 
    snapThreshold, 
    position, 
    onInertiaStart, 
    onSnap
  ]);
  
  // Find nearest snap point
  const findNearestSnapPoint = useCallback((pos: Vector2D): Vector2D => {
    if (!snapPoints || snapPoints.length === 0) {
      return pos;
    }
    
    let nearestPoint = pos;
    let minDistance = Number.MAX_VALUE;
    
    for (const point of snapPoints) {
      const dx = point.x - pos.x;
      const dy = point.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance && distance <= snapThreshold) {
        minDistance = distance;
        nearestPoint = point;
      }
    }
    
    return nearestPoint;
  }, [snapPoints, snapThreshold]);
  
  // Initialize gesture detector and responder
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Create gesture detector
    gestureDetectorRef.current = createGestureDetector(elementRef.current, {
      enableMouseEvents: true,
      enableTouchEvents: true,
      preventDefaultEvents: true,
      preventEventPropagation: false
    });
    
    // Create responder
    responderRef.current = createGestureResponder({
      responders: createResponders(),
      initialState: {
        position: { ...initialPosition },
        velocity: { x: 0, y: 0 }
      },
      mass,
      friction: adjustedDeceleration,
      constraints: boundaries,
      onStateUpdate: (state: PhysicsState) => {
        // Update position
        setPosition({ ...state.position });
        
        // Call move callback
        onMove?.(
          state.position, 
          isGestureActive ? 'gesture' : 'inertia'
        );
        
        // Detect when inertia ends
        if (isInertiaActive && state.isAtRest) {
          setIsInertiaActive(false);
          onInertiaEnd?.(state.position);
          
          // Check for snap points
          const nearestPoint = findNearestSnapPoint(state.position);
          if (nearestPoint !== state.position) {
            responderRef.current?.animateTo(nearestPoint);
            onSnap?.(state.position, nearestPoint);
          }
        }
      }
    });
    
    // Attach event handlers for enabled gestures
    if (enablePan) {
      gestureDetectorRef.current.on(GestureType.PAN, handleGestureEvent);
    }
    
    if (enableSwipe) {
      gestureDetectorRef.current.on(GestureType.SWIPE, handleGestureEvent);
    }
    
    if (enablePinch) {
      gestureDetectorRef.current.on(GestureType.PINCH, handleGestureEvent);
    }
    
    if (enableRotate) {
      gestureDetectorRef.current.on(GestureType.ROTATE, handleGestureEvent);
    }
    
    return () => {
      // Clean up
      if (gestureDetectorRef.current) {
        gestureDetectorRef.current.destroy();
      }
      
      if (responderRef.current) {
        responderRef.current.destroy();
      }
    };
  }, [
    elementRef, 
    initialPosition, 
    mass, 
    adjustedDeceleration, 
    boundaries, 
    enablePan, 
    enableSwipe, 
    enablePinch, 
    enableRotate,
    onMove,
    onInertiaEnd,
    onSnap,
    isGestureActive,
    isInertiaActive,
    findNearestSnapPoint,
    createResponders
  ]);
  
  // Handle gesture events
  const handleGestureEvent = useCallback((event: GestureEventData) => {
    const { type, state } = event;
    
    // Store last event
    lastGestureEventRef.current = event;
    
    // Handle gesture state
    switch (state) {
      case GestureState.BEGAN:
        setIsGestureActive(true);
        gestureStartPositionRef.current = { ...position };
        break;
        
      case GestureState.ENDED:
      case GestureState.CANCELLED:
        setIsGestureActive(false);
        break;
    }
    
    // Process with responder
    if (responderRef.current) {
      responderRef.current.processGesture(event);
    }
  }, [position]);
  
  // Start inertia manually
  const startInertia = useCallback((velocity: Vector2D) => {
    if (!responderRef.current) return;
    
    // Apply impulse
    responderRef.current.applyForce({
      x: velocity.x * adjustedInertiaStrength,
      y: velocity.y * adjustedInertiaStrength
    });
    
    setIsInertiaActive(true);
    onInertiaStart?.(velocity);
  }, [adjustedInertiaStrength, onInertiaStart]);
  
  // Stop inertia manually
  const stopInertia = useCallback(() => {
    if (!responderRef.current) return;
    
    // Stop physics animation
    responderRef.current.stop();
    
    setIsInertiaActive(false);
    onInertiaEnd?.(position);
  }, [position, onInertiaEnd]);
  
  // Snap to a specific point
  const snapToPoint = useCallback((point: Vector2D) => {
    if (!responderRef.current) return;
    
    // Animate to the point
    responderRef.current.animateTo(point, {
      dampingRatio: 0.7,
      frequency: 2
    });
    
    onSnap?.(position, point);
  }, [position, onSnap]);
  
  // Move to position (with or without animation)
  const moveTo = useCallback((newPosition: Vector2D, animate = true) => {
    if (!responderRef.current) return;
    
    if (animate) {
      responderRef.current.animateTo(newPosition);
    } else {
      responderRef.current.setPosition(newPosition);
      setPosition(newPosition);
    }
  }, []);
  
  return {
    position,
    isGestureActive,
    isInertiaActive,
    startInertia,
    stopInertia,
    snapToPoint,
    moveTo,
    handleGestureEvent
  };
}