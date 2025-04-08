/**
 * Unified Gesture Physics Hook
 * 
 * This hook provides a centralized, physics-based system for handling various gestures
 * across different input devices (touch, mouse, pointer) with consistent behavior
 * and natural-feeling responses through physics simulation.
 */

import { useRef, useState, useEffect, useCallback, RefObject, useMemo } from 'react';
import { useReducedMotion } from '../../accessibility/useReducedMotion';
import { 
  GestureType, 
  GestureState, 
  GestureDirection, 
  GestureEventData, 
  createGestureDetector 
} from './GestureDetector';
import { Vector2D } from '../types';
import { InertialMovement } from '../inertialMovement';
import { SpringPhysics, createSpring, SpringPresets } from '../springPhysics';
import { triggerHapticFeedback } from '../../../utils/haptics';

/**
 * Physics presets for different gesture responses
 */
export enum GesturePhysicsPreset {
  RESPONSIVE = 'responsive',   // Quick, highly responsive
  NATURAL = 'natural',         // Balanced, natural feeling
  SMOOTH = 'smooth',           // Smoother, more gradual
  BOUNCY = 'bouncy',           // Springy, with overshoot
  PRECISE = 'precise',         // Direct with minimal physics
  ELASTIC = 'elastic',         // Stretchy with resistance
  MOMENTUM = 'momentum',       // Heavy with continued motion
  SNAPPY = 'snappy'            // Quick with fast settle
}

/**
 * Configuration for specific gestures
 */
export interface GestureConfig {
  enabled: boolean;                // Whether this gesture is enabled
  threshold?: number;              // Detection threshold
  multiplier?: number;             // Force/effect multiplier
  constraints?: {                  // Constraints for this gesture
    min?: number;
    max?: number;
  };
  inertia?: boolean;              // Whether to apply inertia
  spring?: boolean;               // Whether to apply spring physics
  resistance?: number;            // Resistance against movement (0-1)
  friction?: number;              // Friction coefficient (0-1)
  momentum?: number;              // Momentum factor (0-1)
  snapPoints?: number[];          // Points to snap to
  snapThreshold?: number;         // Distance threshold for snapping
  onStart?: (event: GestureEventData) => void;
  onChange?: (event: GestureEventData, state: any) => void;
  onEnd?: (event: GestureEventData) => void;
}

/**
 * Configuration for the useGesturePhysics hook
 */
export interface GesturePhysicsOptions {
  elementRef: RefObject<HTMLElement>;  // Reference to the target element
  
  // Gesture-specific configurations
  pan?: Partial<GestureConfig>;
  swipe?: Partial<GestureConfig>;
  pinch?: Partial<GestureConfig>;
  rotate?: Partial<GestureConfig>;
  tap?: Partial<GestureConfig>;
  longPress?: Partial<GestureConfig>;
  doubleTap?: Partial<GestureConfig>;
  
  // General physics settings
  mass?: number;                        // Mass for physics calculations
  tension?: number;                     // Spring tension
  friction?: number;                    // Friction coefficient
  inertia?: boolean;                    // Global inertia enable/disable
  usePointerEvents?: boolean;           // Whether to use pointer events
  captureOutside?: boolean;             // Whether to capture events outside element
  
  // Preset configuration
  preset?: GesturePhysicsPreset;        // Quick configuration preset
  
  // Boundaries for movement
  boundaries?: {
    x?: { min?: number; max?: number };
    y?: { min?: number; max?: number };
    scale?: { min?: number; max?: number };
    rotation?: { min?: number; max?: number };
  };
  
  // Callbacks
  onGestureStart?: (type: GestureType, event: GestureEventData) => void;
  onGestureChange?: (type: GestureType, event: GestureEventData, state: any) => void;
  onGestureEnd?: (type: GestureType, event: GestureEventData) => void;
  onTransformChange?: (transform: GestureTransform) => void;
  
  // Advanced options
  preventDefaultEvents?: boolean;       // Whether to prevent default browser behavior
  enableHaptics?: boolean;              // Enable haptic feedback if available
  disableScroll?: boolean;              // Prevent scrolling during gestures
}

/**
 * Transform state tracking gesture effects
 */
export interface GestureTransform {
  x: number;                            // X translation
  y: number;                            // Y translation
  scale: number;                        // Scale factor
  rotation: number;                     // Rotation in degrees
  velocityX: number;                    // X velocity
  velocityY: number;                    // Y velocity
  velocityScale: number;                // Scale velocity
  velocityRotation: number;             // Rotation velocity
}

/**
 * Return type for the useGesturePhysics hook
 */
export interface GesturePhysicsResult {
  transform: GestureTransform;
  cssTransform: string;
  style: React.CSSProperties;
  elementRef: RefObject<HTMLElement>;
  reset: (animate?: boolean) => void;
  setTransform: (target: Partial<GestureTransform>) => void;
  animateTo: (target: Partial<GestureTransform>, config?: any) => void;
  isGestureActive: boolean;
}

/**
 * Gesture state tracking
 */
interface InternalGestureState {
  active: boolean;                      // Whether gesture is active
  initialEvent?: GestureEventData;      // Initial event that started the gesture
  lastEvent?: GestureEventData;         // Most recent event
  initialTransform: GestureTransform;   // Transform when gesture started
}

// Default configurations by gesture type
const DEFAULT_GESTURES: Record<GestureType, Partial<GestureConfig>> = {
  [GestureType.PAN]: {
    enabled: true,
    threshold: 5,
    multiplier: 1,
    inertia: true,
    spring: false,
    resistance: 0,
    friction: 0.92,
    momentum: 0.8
  },
  [GestureType.SWIPE]: {
    enabled: true,
    threshold: 10,
    multiplier: 1.2,
    inertia: true,
    spring: false,
    resistance: 0,
    friction: 0.9,
    momentum: 1
  },
  [GestureType.PINCH]: {
    enabled: true,
    threshold: 0.05,
    multiplier: 0.8,
    inertia: false,
    spring: true,
    constraints: { min: 0.5, max: 3 }
  },
  [GestureType.ROTATE]: {
    enabled: true,
    threshold: 5,
    multiplier: 1,
    inertia: false,
    spring: true
  },
  [GestureType.TAP]: {
    enabled: true,
    threshold: 10
  },
  [GestureType.LONG_PRESS]: {
    enabled: true,
    threshold: 500 // milliseconds
  },
  [GestureType.DOUBLE_TAP]: {
    enabled: true,
    threshold: 300 // milliseconds between taps
  },
  [GestureType.HOVER]: {
    enabled: true
  }
};

// Physics presets for quick configuration
const PHYSICS_PRESETS: Record<GesturePhysicsPreset, Partial<GesturePhysicsOptions>> = {
  [GesturePhysicsPreset.RESPONSIVE]: {
    mass: 0.8,
    tension: 350,
    friction: 15,
    inertia: true
  },
  [GesturePhysicsPreset.NATURAL]: {
    mass: 1,
    tension: 200,
    friction: 20,
    inertia: true
  },
  [GesturePhysicsPreset.SMOOTH]: {
    mass: 1.2,
    tension: 150,
    friction: 25,
    inertia: true
  },
  [GesturePhysicsPreset.BOUNCY]: {
    mass: 1,
    tension: 400,
    friction: 10,
    inertia: true
  },
  [GesturePhysicsPreset.PRECISE]: {
    mass: 0.7,
    tension: 500,
    friction: 30,
    inertia: false
  },
  [GesturePhysicsPreset.ELASTIC]: {
    mass: 1,
    tension: 100,
    friction: 5,
    inertia: true
  },
  [GesturePhysicsPreset.MOMENTUM]: {
    mass: 2,
    tension: 150,
    friction: 10,
    inertia: true
  },
  [GesturePhysicsPreset.SNAPPY]: {
    mass: 0.6,
    tension: 450,
    friction: 20,
    inertia: true
  }
};

/**
 * Default transform state
 */
const DEFAULT_TRANSFORM: GestureTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  velocityX: 0,
  velocityY: 0,
  velocityScale: 0,
  velocityRotation: 0
};

/**
 * Custom hook for gesture physics
 */
export function useGesturePhysics(options: GesturePhysicsOptions): GesturePhysicsResult {
  // Extract options and merge with defaults
  const { 
    elementRef,
    preset = GesturePhysicsPreset.NATURAL,
    preventDefaultEvents = true,
    enableHaptics = false,
    disableScroll = false,
    boundaries,
    onTransformChange,
    onGestureStart,
    onGestureChange,
    onGestureEnd,
    ...gestureOptions
  } = options;
  
  // Apply preset configuration as base
  const presetConfig = PHYSICS_PRESETS[preset] || PHYSICS_PRESETS.natural;
  
  // Merge configurations from preset and explicit options
  const config = {
    mass: options.mass ?? presetConfig.mass ?? 1,
    tension: options.tension ?? presetConfig.tension ?? 200,
    friction: options.friction ?? presetConfig.friction ?? 20,
    inertia: options.inertia ?? presetConfig.inertia ?? true,
    usePointerEvents: options.usePointerEvents ?? true,
    captureOutside: options.captureOutside ?? true
  };
  
  // Create gesture configs by merging defaults with provided options
  const gestureConfigs = {
    [GestureType.PAN]: { ...DEFAULT_GESTURES[GestureType.PAN], ...gestureOptions.pan },
    [GestureType.SWIPE]: { ...DEFAULT_GESTURES[GestureType.SWIPE], ...gestureOptions.swipe },
    [GestureType.PINCH]: { ...DEFAULT_GESTURES[GestureType.PINCH], ...gestureOptions.pinch },
    [GestureType.ROTATE]: { ...DEFAULT_GESTURES[GestureType.ROTATE], ...gestureOptions.rotate },
    [GestureType.TAP]: { ...DEFAULT_GESTURES[GestureType.TAP], ...gestureOptions.tap },
    [GestureType.LONG_PRESS]: { ...DEFAULT_GESTURES[GestureType.LONG_PRESS], ...gestureOptions.longPress },
    [GestureType.DOUBLE_TAP]: { ...DEFAULT_GESTURES[GestureType.DOUBLE_TAP], ...gestureOptions.doubleTap },
    [GestureType.HOVER]: { ...DEFAULT_GESTURES[GestureType.HOVER] }
  };
  
  // State for current transform
  const [transform, setTransform] = useState<GestureTransform>(DEFAULT_TRANSFORM);
  
  // Refs for gesture state tracking
  const gestureStateRef = useRef<Record<GestureType, InternalGestureState>>({
    [GestureType.PAN]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } },
    [GestureType.SWIPE]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } },
    [GestureType.PINCH]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } },
    [GestureType.ROTATE]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } },
    [GestureType.TAP]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } },
    [GestureType.LONG_PRESS]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } },
    [GestureType.DOUBLE_TAP]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } },
    [GestureType.HOVER]: { active: false, initialTransform: { ...DEFAULT_TRANSFORM } }
  });
  
  // Refs for physics controllers
  const physicsControllers = useRef<{
    x: InertialMovement | null;
    y: InertialMovement | null;
    scale: SpringPhysics | null;
    rotation: SpringPhysics | null;
    active: boolean;
    animationFrameId: number | null;
  }>({
    x: null,
    y: null,
    scale: null,
    rotation: null,
    active: false,
    animationFrameId: null
  });

  // Check for reduced motion preferences
  const preferReducedMotion = useReducedMotion();
  
  // Ref for gesture detector
  const detectorRef = useRef<ReturnType<typeof createGestureDetector> | null>(null);
  
  // Initialize physics controllers
  useEffect(() => {
    // Configure based on reduced motion preferences
    const adjustedFriction = preferReducedMotion 
      ? Math.min(config.friction * 1.5, 40) 
      : config.friction;
    
    const adjustedTension = preferReducedMotion
      ? Math.max(config.tension * 1.5, 400)
      : config.tension;
    
    const adjustedInertia = preferReducedMotion ? false : config.inertia;
    
    // Create inertial controllers for position
    physicsControllers.current.x = new InertialMovement({
      friction: adjustedFriction / 20, // Scale to 0-1 range
      restThreshold: 0.01
    });
    
    physicsControllers.current.y = new InertialMovement({
      friction: adjustedFriction / 20, // Scale to 0-1 range
      restThreshold: 0.01
    });
    
    // Create spring controllers for scale and rotation
    physicsControllers.current.scale = createSpring({
      tension: adjustedTension,
      friction: adjustedFriction,
      mass: config.mass
    });
    
    physicsControllers.current.rotation = createSpring({
      tension: adjustedTension,
      friction: adjustedFriction,
      mass: config.mass
    });
    
    // Set initial positions
    physicsControllers.current.x.set(transform.x, 0);
    physicsControllers.current.y.set(transform.y, 0);
    physicsControllers.current.scale.setTarget(transform.scale, { from: transform.scale, velocity: 0 });
    physicsControllers.current.rotation.setTarget(transform.rotation, { from: transform.rotation, velocity: 0 });
    
    return () => {
      // Clean up controllers on unmount
      if (physicsControllers.current.animationFrameId) {
        cancelAnimationFrame(physicsControllers.current.animationFrameId);
      }
    };
  }, [config.mass, config.tension, config.friction, config.inertia, preferReducedMotion, transform.x, transform.y, transform.scale, transform.rotation]);
  
  // Initialize gesture detector
  useEffect(() => {
    if (!elementRef.current) return;
    
    detectorRef.current = createGestureDetector(elementRef.current, {
      enableMouseEvents: true,
      enableTouchEvents: true,
      enablePointerEvents: config.usePointerEvents,
      preventDefaultEvents,
      preventEventPropagation: disableScroll,
    });
    
    // Attach event handlers for each enabled gesture type
    Object.entries(gestureConfigs).forEach(([gestureType, gestureConfig]) => {
      if (gestureConfig.enabled) {
        detectorRef.current?.on(gestureType as GestureType, handleGestureEvent);
      }
    });
    
    return () => {
      // Clean up detector on unmount
      if (detectorRef.current) {
        detectorRef.current.destroy();
      }
    };
  }, [elementRef, config.usePointerEvents, preventDefaultEvents, disableScroll]);
  
  // Animation loop for physics simulation
  const startAnimationLoop = useCallback(() => {
    if (physicsControllers.current.active) return;
    
    physicsControllers.current.active = true;
    
    const animate = () => {
      const { x, y, scale, rotation } = physicsControllers.current;
      
      if (!x || !y || !scale || !rotation) return;
      
      // Update physics
      x.update();
      y.update();
      const scaleState = scale.update();
      const rotationState = rotation.update();
      
      // Get new values
      const newX = x.getPosition();
      const newY = y.getPosition();
      const newScale = scaleState.position;
      const newRotation = rotationState.position;
      
      // Get velocities
      const velocityX = x.getVelocity();
      const velocityY = y.getVelocity();
      const velocityScale = scaleState.velocity;
      const velocityRotation = rotationState.velocity;
      
      // Apply boundaries if configured
      let boundedX = newX;
      let boundedY = newY;
      let boundedScale = newScale;
      let boundedRotation = newRotation;
      
      if (boundaries) {
        if (boundaries.x) {
          if (boundaries.x.min !== undefined && boundedX < boundaries.x.min) boundedX = boundaries.x.min;
          if (boundaries.x.max !== undefined && boundedX > boundaries.x.max) boundedX = boundaries.x.max;
        }
        if (boundaries.y) {
          if (boundaries.y.min !== undefined && boundedY < boundaries.y.min) boundedY = boundaries.y.min;
          if (boundaries.y.max !== undefined && boundedY > boundaries.y.max) boundedY = boundaries.y.max;
        }
        if (boundaries.scale) {
          if (boundaries.scale.min !== undefined && boundedScale < boundaries.scale.min) boundedScale = boundaries.scale.min;
          if (boundaries.scale.max !== undefined && boundedScale > boundaries.scale.max) boundedScale = boundaries.scale.max;
        }
        if (boundaries.rotation) {
          if (boundaries.rotation.min !== undefined && boundedRotation < boundaries.rotation.min) boundedRotation = boundaries.rotation.min;
          if (boundaries.rotation.max !== undefined && boundedRotation > boundaries.rotation.max) boundedRotation = boundaries.rotation.max;
        }
      }
      
      // Update transform
      const newTransform: GestureTransform = {
        x: boundedX,
        y: boundedY,
        scale: boundedScale,
        rotation: boundedRotation,
        velocityX,
        velocityY,
        velocityScale,
        velocityRotation
      };
      
      setTransform(newTransform);
      onTransformChange?.(newTransform);
      
      // Check if physics is still active
      const isActive = !x.isAtRest() || !y.isAtRest() || 
                      Math.abs(velocityScale) > 0.01 || 
                      Math.abs(velocityRotation) > 0.01 ||
                      Object.values(gestureStateRef.current).some((state: InternalGestureState) => state.active);
      
      if (isActive) {
        physicsControllers.current.animationFrameId = requestAnimationFrame(animate);
      } else {
        physicsControllers.current.active = false;
        physicsControllers.current.animationFrameId = null;
      }
    };
    
    physicsControllers.current.animationFrameId = requestAnimationFrame(animate);
  }, [boundaries, onTransformChange]);
  
  // Handle gesture events
  const handleGestureEvent = useCallback((event: GestureEventData) => {
    const { type, state } = event;
    
    // Skip disabled gestures
    if (!gestureConfigs[type]?.enabled) return;
    
    // Get gesture configuration
    const gestureConfig = gestureConfigs[type];
    
    // Handle different gesture states
    switch (state) {
      case GestureState.BEGAN:
      case GestureState.RECOGNIZED:
        handleGestureStart(type, event, gestureConfig);
        break;
        
      case GestureState.CHANGED:
        handleGestureChange(type, event, gestureConfig);
        break;
        
      case GestureState.ENDED:
        handleGestureEnd(type, event, gestureConfig);
        break;
        
      case GestureState.CANCELLED:
        handleGestureCancel(type, event);
        break;
    }
  }, [gestureConfigs]);
  
  // Handle gesture start
  const handleGestureStart = useCallback((
    type: GestureType, 
    event: GestureEventData, 
    config: Partial<GestureConfig>
  ) => {
    // Update gesture state
    gestureStateRef.current[type] = {
      active: true,
      initialEvent: event,
      lastEvent: event,
      initialTransform: { ...transform }
    };
    
    // Use event.state instead of state
    if (event.state === GestureState.RECOGNIZED) {
      if (type === GestureType.TAP) {
        applyTapEffect();
      } else if (type === GestureType.DOUBLE_TAP) {
        handleDoubleTap(event);
      }
    } else {
      // Start physics animation loop if not already running
      if (!physicsControllers.current.active) {
        startAnimationLoop();
      }
    }
    
    // Trigger haptic feedback if enabled using the utility
    if (enableHaptics) {
      // Select the appropriate haptic feedback based on gesture type
      switch(type) {
        case GestureType.TAP:
          triggerHapticFeedback('light');
          break;
        case GestureType.DOUBLE_TAP:
          triggerHapticFeedback('success');
          break;
        case GestureType.LONG_PRESS:
          triggerHapticFeedback('medium');
          break;
        case GestureType.PAN:
        case GestureType.SWIPE:
          triggerHapticFeedback('selection');
          break;
        case GestureType.PINCH:
        case GestureType.ROTATE:
          triggerHapticFeedback('light');
          break;
        default:
          triggerHapticFeedback('selection');
      }
    }
    
    // Call gesture start callback
    config.onStart?.(event);
    onGestureStart?.(type, event);
  }, [transform, enableHaptics, onGestureStart, startAnimationLoop]);
  
  // Handle gesture change
  const handleGestureChange = useCallback((
    type: GestureType, 
    event: GestureEventData, 
    config: Partial<GestureConfig>
  ) => {
    // Get gesture state
    const gestureState = gestureStateRef.current[type];
    if (!gestureState.active || !gestureState.initialEvent) return;
    
    // Update last event
    gestureState.lastEvent = event;
    
    // Apply physics based on gesture type
    switch (type) {
      case GestureType.PAN:
        handlePanGestureChange(event, config);
        break;
        
      case GestureType.PINCH:
        handlePinchGestureChange(event, config);
        break;
        
      case GestureType.ROTATE:
        handleRotateGestureChange(event, config);
        break;
    }
    
    // Call gesture change callback
    config.onChange?.(event, gestureState);
    onGestureChange?.(type, event, gestureState);
  }, [onGestureChange]);
  
  // Handle gesture end
  const handleGestureEnd = useCallback((
    type: GestureType, 
    event: GestureEventData, 
    config: Partial<GestureConfig>
  ) => {
    // Get gesture state
    const gestureState = gestureStateRef.current[type];
    if (!gestureState.active) return;
    
    // Mark gesture as inactive
    gestureState.active = false;
    gestureState.lastEvent = event;
    
    // Apply end effects based on gesture type
    switch (type) {
      case GestureType.PAN:
      case GestureType.SWIPE:
        if (config.inertia) {
          // Pass type to applyInertia
          applyInertia(type, event, config);
        }
        if (config.snapPoints && config.snapPoints.length > 0) {
          applySnapForce(type, config);
          // Add haptic feedback for snap
          if (enableHaptics) {
            triggerHapticFeedback('success');
          }
        }
        break;
        
      case GestureType.PINCH:
      case GestureType.ROTATE:
        // Apply spring settling if enabled
        if (config.spring) {
          applySpringSettle(type, config);
          // Add subtle haptic feedback for spring settle
          if (enableHaptics) {
            triggerHapticFeedback('light');
          }
        }
        break;
    }
    
    // Call gesture end callback
    config.onEnd?.(event);
    onGestureEnd?.(type, event);
  }, [onGestureEnd, enableHaptics]);
  
  // Handle gesture cancellation
  const handleGestureCancel = useCallback((type: GestureType, event: GestureEventData) => {
    // Get gesture state
    const gestureState = gestureStateRef.current[type];
    if (!gestureState.active) return;
    
    // Reset to state before gesture
    setTransform(prevTransform => {
      const newTransform = { ...prevTransform };
      
      // Depending on gesture type, reset different properties
      switch (type) {
        case GestureType.PAN:
          newTransform.x = gestureState.initialTransform.x;
          newTransform.y = gestureState.initialTransform.y;
          break;
          
        case GestureType.PINCH:
          newTransform.scale = gestureState.initialTransform.scale;
          break;
          
        case GestureType.ROTATE:
          newTransform.rotation = gestureState.initialTransform.rotation;
          break;
      }
      
      return newTransform;
    });
    
    // Reset the controllers to match
    if (type === GestureType.PAN) {
      physicsControllers.current.x?.set(gestureState.initialTransform.x, 0);
      physicsControllers.current.y?.set(gestureState.initialTransform.y, 0);
    } else if (type === GestureType.PINCH) {
      physicsControllers.current.scale?.setTarget(
        gestureState.initialTransform.scale, 
        { from: gestureState.initialTransform.scale, velocity: 0 }
      );
    } else if (type === GestureType.ROTATE) {
      physicsControllers.current.rotation?.setTarget(
        gestureState.initialTransform.rotation, 
        { from: gestureState.initialTransform.rotation, velocity: 0 }
      );
    }
    
    // Mark gesture as inactive
    gestureState.active = false;
    gestureState.lastEvent = event;
    
    // Call gesture end callback
    onGestureEnd?.(type, event);
  }, [onGestureEnd]);
  
  // Handle pan gesture change
  const handlePanGestureChange = useCallback((
    event: GestureEventData, 
    config: Partial<GestureConfig>
  ) => {
    const { movement } = event;
    const { initialTransform } = gestureStateRef.current[GestureType.PAN];
    const multiplier = config.multiplier || 1;
    const resistance = config.resistance || 0;
    
    // Calculate resistance factor (0-1, where 1 is no resistance)
    const resistanceFactor = 1 - resistance;
    
    // Apply movement with resistance
    const newX = initialTransform.x + movement.x * multiplier * resistanceFactor;
    const newY = initialTransform.y + movement.y * multiplier * resistanceFactor;
    
    // Set position directly during active pan
    physicsControllers.current.x?.set(newX, event.velocity.x * multiplier);
    physicsControllers.current.y?.set(newY, event.velocity.y * multiplier);
  }, []);
  
  // Handle pinch gesture change
  const handlePinchGestureChange = useCallback((
    event: GestureEventData, 
    config: Partial<GestureConfig>
  ) => {
    if (event.scale === undefined) return;
    
    const { initialTransform } = gestureStateRef.current[GestureType.PINCH];
    const multiplier = config.multiplier || 1;
    const resistance = config.resistance || 0;
    
    // Calculate resistance factor (0-1, where 1 is no resistance)
    const resistanceFactor = 1 - resistance;
    
    // Apply scale with resistance
    let newScale = initialTransform.scale * Math.pow(event.scale, multiplier * resistanceFactor);
    
    // Apply constraints if configured
    if (config.constraints) {
      if (config.constraints.min !== undefined && newScale < config.constraints.min) {
        newScale = config.constraints.min;
      }
      if (config.constraints.max !== undefined && newScale > config.constraints.max) {
        newScale = config.constraints.max;
      }
    }
    
    // Set scale directly during active pinch
    const scaleVelocity = (newScale - transform.scale) * 60; // Approximate velocity
    physicsControllers.current.scale?.setTarget(
      newScale, 
      { from: newScale, velocity: scaleVelocity }
    );
  }, [transform.scale]);
  
  // Handle rotate gesture change
  const handleRotateGestureChange = useCallback((
    event: GestureEventData, 
    config: Partial<GestureConfig>
  ) => {
    if (event.rotation === undefined) return;
    
    const { initialTransform } = gestureStateRef.current[GestureType.ROTATE];
    const multiplier = config.multiplier || 1;
    const resistance = config.resistance || 0;
    
    // Calculate resistance factor (0-1, where 1 is no resistance)
    const resistanceFactor = 1 - resistance;
    
    // Apply rotation with resistance
    let newRotation = initialTransform.rotation + event.rotation * multiplier * resistanceFactor;
    
    // Apply constraints if configured
    if (config.constraints) {
      if (config.constraints.min !== undefined && newRotation < config.constraints.min) {
        newRotation = config.constraints.min;
      }
      if (config.constraints.max !== undefined && newRotation > config.constraints.max) {
        newRotation = config.constraints.max;
      }
    }
    
    // Normalize rotation to -180 to 180 degrees
    if (newRotation > 180) newRotation -= 360;
    if (newRotation < -180) newRotation += 360;
    
    // Set rotation directly during active rotation
    const rotationVelocity = (newRotation - transform.rotation) * 60; // Approximate velocity
    physicsControllers.current.rotation?.setTarget(
      newRotation, 
      { from: newRotation, velocity: rotationVelocity }
    );
  }, [transform.rotation]);
  
  // Apply inertia after a gesture ends
  const applyInertia = useCallback((
    type: GestureType, 
    event: GestureEventData, 
    config: Partial<GestureConfig>
  ) => {
    const { velocity } = event;
    const multiplier = config.multiplier || 1;
    const momentumFactor = config.momentum || 0.8;
    const velocityScale = multiplier * momentumFactor;
    
    // Apply velocity to inertial controllers using addVelocity
    if (type === GestureType.PAN || type === GestureType.SWIPE) { 
      physicsControllers.current.x?.addVelocity(velocity.x * velocityScale);
      physicsControllers.current.y?.addVelocity(velocity.y * velocityScale);
    }
  }, []);
  
  // Apply snap forces to find nearest snap point
  const applySnapForce = useCallback((
    type: GestureType,
    config: Partial<GestureConfig>
  ) => {
    if (!config.snapPoints || config.snapPoints.length === 0) return;
    
    const snapThreshold = config.snapThreshold || 20;
    const property: keyof GestureTransform = 'x';
    const physicsController = physicsControllers.current.x;
    
    // Determine which property to snap based on gesture type
    if (type === GestureType.PAN) {
      // We'll check x and y snap points
      const currentX = transform.x;
      const currentY = transform.y;
      
      // Find closest x and y snap points
      let closestX = null;
      let closestY = null;
      let closestDistX = Infinity;
      let closestDistY = Infinity;
      
      for (const snapPoint of config.snapPoints) {
        const distX = Math.abs(snapPoint - currentX);
        const distY = Math.abs(snapPoint - currentY);
        
        if (distX < closestDistX && distX <= snapThreshold) {
          closestDistX = distX;
          closestX = snapPoint;
        }
        
        if (distY < closestDistY && distY <= snapThreshold) {
          closestDistY = distY;
          closestY = snapPoint;
        }
      }
      
      // Apply snap to x if found using set(pos, vel)
      if (closestX !== null) {
        physicsControllers.current.x?.set(closestX, 0); // Set position, velocity 0
      }
      
      // Apply snap to y if found using set(pos, vel)
      if (closestY !== null) {
        physicsControllers.current.y?.set(closestY, 0); // Set position, velocity 0
      }
    }
  }, [transform]);
  
  // Apply spring settling to return to valid bounds or stable state
  const applySpringSettle = useCallback((
    type: GestureType,
    config: Partial<GestureConfig>
  ) => {
    // For pinch/scale
    if (type === GestureType.PINCH) {
      let targetScale = transform.scale;
      
      // Apply constraints if configured
      if (config.constraints) {
        if (config.constraints.min !== undefined && targetScale < config.constraints.min) {
          targetScale = config.constraints.min;
        }
        if (config.constraints.max !== undefined && targetScale > config.constraints.max) {
          targetScale = config.constraints.max;
        }
      }
      
      // If we have snap points for scale, check them
      if (config.snapPoints && config.snapPoints.length > 0) {
        const snapThreshold = config.snapThreshold || 0.2;
        let closestSnap = null;
        let closestDist = Infinity;
        
        for (const snapPoint of config.snapPoints) {
          const dist = Math.abs(snapPoint - targetScale);
          if (dist < closestDist && dist <= snapThreshold) {
            closestDist = dist;
            closestSnap = snapPoint;
          }
        }
        
        if (closestSnap !== null) {
          targetScale = closestSnap;
        }
      }
      
      // Apply spring to settle to target scale
      physicsControllers.current.scale?.setTarget(
        targetScale, 
        { from: transform.scale, velocity: transform.velocityScale }
      );
    }
    
    // For rotation
    if (type === GestureType.ROTATE) {
      let targetRotation = transform.rotation;
      
      // Apply constraints if configured
      if (config.constraints) {
        if (config.constraints.min !== undefined && targetRotation < config.constraints.min) {
          targetRotation = config.constraints.min;
        }
        if (config.constraints.max !== undefined && targetRotation > config.constraints.max) {
          targetRotation = config.constraints.max;
        }
      }
      
      // If we have snap points for rotation, check them
      if (config.snapPoints && config.snapPoints.length > 0) {
        const snapThreshold = config.snapThreshold || 10;
        let closestSnap = null;
        let closestDist = Infinity;
        
        for (const snapPoint of config.snapPoints) {
          // Consider rotation wrapping when calculating distance
          const rawDist = Math.abs(snapPoint - targetRotation);
          const wrappedDist = Math.min(rawDist, 360 - rawDist);
          
          if (wrappedDist < closestDist && wrappedDist <= snapThreshold) {
            closestDist = wrappedDist;
            closestSnap = snapPoint;
          }
        }
        
        if (closestSnap !== null) {
          targetRotation = closestSnap;
        }
      }
      
      // Apply spring to settle to target rotation
      physicsControllers.current.rotation?.setTarget(
        targetRotation, 
        { from: transform.rotation, velocity: transform.velocityRotation }
      );
    }
  }, [transform]);
  
  // Apply tap effect (small pulse)
  const applyTapEffect = useCallback(() => {
    // Create a small scale pulse
    const currentScale = transform.scale;
    const pulseAmount = 0.05; // 5% increase
    
    physicsControllers.current.scale?.setTarget(
      currentScale * (1 + pulseAmount), 
      { from: currentScale, velocity: 0 }
    );
    
    // After a short delay, return to original scale
    setTimeout(() => {
      physicsControllers.current.scale?.setTarget(
        currentScale, 
        { from: currentScale * (1 + pulseAmount), velocity: 0 }
      );
      startAnimationLoop();
    }, 100);
  }, [transform.scale, startAnimationLoop]);
  
  // Handle double tap (e.g., reset transform)
  const handleDoubleTap = useCallback((event: GestureEventData) => {
    // Default action for double tap - reset to defaults
    physicsControllers.current.x?.set(0, 0);
    physicsControllers.current.y?.set(0, 0);
    physicsControllers.current.scale?.setTarget(1, { from: transform.scale, velocity: 0 });
    physicsControllers.current.rotation?.setTarget(0, { from: transform.rotation, velocity: 0 });
    
    startAnimationLoop();
  }, [transform.scale, transform.rotation, startAnimationLoop]);
  
  // Set transform directly
  const setGestureTransform = useCallback((newTransform: Partial<GestureTransform>) => {
    // Update state
    setTransform(prevTransform => {
      const updatedTransform = { ...prevTransform };
      
      // Apply any provided values
      if (newTransform.x !== undefined) updatedTransform.x = newTransform.x;
      if (newTransform.y !== undefined) updatedTransform.y = newTransform.y;
      if (newTransform.scale !== undefined) updatedTransform.scale = newTransform.scale;
      if (newTransform.rotation !== undefined) updatedTransform.rotation = newTransform.rotation;
      
      return updatedTransform;
    });
    
    // Update physics controllers to match
    if (newTransform.x !== undefined) {
      physicsControllers.current.x?.set(newTransform.x, 0);
    }
    if (newTransform.y !== undefined) {
      physicsControllers.current.y?.set(newTransform.y, 0);
    }
    if (newTransform.scale !== undefined) {
      physicsControllers.current.scale?.setTarget(
        newTransform.scale, 
        { from: newTransform.scale, velocity: 0 }
      );
    }
    if (newTransform.rotation !== undefined) {
      physicsControllers.current.rotation?.setTarget(
        newTransform.rotation, 
        { from: newTransform.rotation, velocity: 0 }
      );
    }
  }, []);
  
  // Animate transform to target values
  const animateToTransform = useCallback((
    targetTransform: Partial<GestureTransform>,
    options: {
      duration?: number;
      easing?: (t: number) => number;
    } = {}
  ) => {
    // Find values to animate
    const initialTransform = { ...transform };
    const targets: Record<keyof GestureTransform, number> = {
      x: targetTransform.x ?? initialTransform.x,
      y: targetTransform.y ?? initialTransform.y,
      scale: targetTransform.scale ?? initialTransform.scale,
      rotation: targetTransform.rotation ?? initialTransform.rotation,
      velocityX: 0,
      velocityY: 0,
      velocityScale: 0,
      velocityRotation: 0
    };
    
    // Apply to physics controllers to animate
    if (targetTransform.x !== undefined) {
      physicsControllers.current.x?.set(targets.x, 0); // Use set for instant jump, or need spring for position
    }
    if (targetTransform.y !== undefined) {
      physicsControllers.current.y?.set(targets.y, 0); // Use set for instant jump, or need spring for position
    }
    if (targetTransform.scale !== undefined) {
      physicsControllers.current.scale?.setTarget(
        targets.scale, 
        { from: initialTransform.scale, velocity: 0 }
      );
    }
    if (targetTransform.rotation !== undefined) {
      physicsControllers.current.rotation?.setTarget(
        targets.rotation, 
        { from: initialTransform.rotation, velocity: 0 }
      );
    }
    
    startAnimationLoop();
  }, [transform, startAnimationLoop]);
  
  // Reset transform to initial values
  const resetTransform = useCallback((animate = true) => {
    if (animate) {
      animateToTransform({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      });
    } else {
      setGestureTransform({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      });
    }
  }, [animateToTransform, setGestureTransform]);
  
  // Memoize the style object to avoid unnecessary re-renders
  const style = useMemo((): React.CSSProperties => {
    const isDragging = Object.values(gestureStateRef.current).some(state => 
        state.active && 
        (state.initialEvent?.type === GestureType.PAN || 
         state.initialEvent?.type === GestureType.PINCH || 
         state.initialEvent?.type === GestureType.ROTATE)
    );

    return {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
      userSelect: isDragging ? 'none' as const : 'auto' as const,
      touchAction: 'none',
      cursor: isDragging ? 'grabbing' : 'grab',
      willChange: 'transform', // Performance hint
    };
  }, [transform]);
  
  return {
    // Transform state and refs
    transform,
    cssTransform: style.transform,
    elementRef,
    
    // Direct control methods
    setTransform: setGestureTransform,
    animateTo: animateToTransform,
    reset: resetTransform,
    
    // Check active gesture state
    isGestureActive: Object.values(gestureStateRef.current).some(state => state.active),
    
    // CSS styles that can be directly applied to the element
    style,
  };
}

/**
 * Factory function to create a gesture physics system
 */
export function createGesturePhysics(element: HTMLElement, options: Omit<GesturePhysicsOptions, 'elementRef'>) {
  const elementRef = { current: element };
  const { transform, setTransform, animateTo, reset, style } = useGesturePhysics({
    ...options,
    elementRef
  });
  
  // Apply initial style
  Object.assign(element.style, {
    transform: style.transform,
    touchAction: style.touchAction,
    userSelect: style.userSelect
  });
  
  // Return control interface
  return {
    getTransform: () => ({ ...transform }),
    setTransform,
    animateTo,
    reset,
    applyStyle: () => {
      Object.assign(element.style, {
        transform: style.transform
      });
    },
    destroy: () => {
      // Clean up (implementation depends on hook internals)
    }
  };
}