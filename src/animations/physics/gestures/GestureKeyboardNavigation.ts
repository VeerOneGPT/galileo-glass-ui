/**
 * GestureKeyboardNavigation.ts
 * 
 * Provides keyboard navigation alternatives for gesture-based interactions, ensuring
 * that gesture-based UIs are accessible to keyboard users and assistive technologies.
 * This system maps common gesture patterns to appropriate keyboard controls while maintaining
 * the same physics-based feedback and animations.
 */

import { RefObject, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GestureType, GestureState, GestureEventData, GestureDirection } from './GestureDetector';
import { useReducedMotion } from '../../accessibility/useReducedMotion';
import { AnimationCategory } from '../../accessibility/MotionSensitivity';

/**
 * Keyboard activation modes determine how keyboard interactions are triggered
 */
export enum KeyboardActivationMode {
  /**
   * Requires user to press Enter or Space to activate keyboard gesture mode
   */
  EXPLICIT = 'explicit',
  
  /**
   * Automatically enables keyboard gesture mode when element receives focus
   */
  AUTO = 'auto',
  
  /**
   * Only enables keyboard gesture mode when element is actively focused
   * but doesn't require explicit activation
   */
  FOCUS = 'focus'
}

/**
 * Feedback types for keyboard gesture actions
 */
export enum KeyboardFeedbackType {
  /**
   * Visual indicator showing available keyboard controls
   */
  VISUAL = 'visual',
  
  /**
   * Announcements for screen readers
   */
  AUDITORY = 'auditory',
  
  /**
   * Both visual and auditory feedback
   */
  BOTH = 'both',
  
  /**
   * No additional feedback beyond standard focus indicators
   */
  NONE = 'none'
}

/**
 * Maps gesture types to keyboard controls
 */
export interface GestureKeyboardMapping {
  /**
   * Keys that trigger a tap/click gesture
   * Default: Enter, Space
   */
  tap?: string[];
  
  /**
   * Keys that trigger a double-tap gesture
   * Default: Double-press Enter or Space
   */
  doubleTap?: string[];
  
  /**
   * Keys that trigger a long press gesture
   * Default: Hold Enter or Space
   */
  longPress?: string[];
  
  /**
   * Keys that handle pan/drag gestures
   * Default: Arrow keys
   */
  pan?: {
    up?: string[];
    down?: string[];
    left?: string[];
    right?: string[];
    increaseSpeed?: string[]; // E.g. Shift to increase movement amount
    decreaseSpeed?: string[]; // E.g. Alt to decrease movement amount
  };
  
  /**
   * Keys that handle pinch gestures (for zoom)
   * Default: + and - keys
   */
  pinch?: {
    zoomIn?: string[];
    zoomOut?: string[];
    reset?: string[];
  };
  
  /**
   * Keys that handle rotation gestures
   * Default: [ and ] keys
   */
  rotate?: {
    clockwise?: string[];
    counterclockwise?: string[];
    reset?: string[];
  };
  
  /**
   * Keys that trigger a swipe gesture
   * Default: Shift + Arrow keys
   */
  swipe?: {
    up?: string[];
    down?: string[];
    left?: string[];
    right?: string[];
  };
  
  /**
   * Key to exit keyboard gesture mode
   * Default: Escape
   */
  exit?: string[];
  
  /**
   * Key to reset to default state
   * Default: Home
   */
  reset?: string[];
}

/**
 * Default keyboard mappings for gestures
 */
export const DEFAULT_KEYBOARD_MAPPING: GestureKeyboardMapping = {
  tap: ['Enter', ' '],
  doubleTap: ['Enter', ' '],
  longPress: ['Enter', ' '],
  pan: {
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    increaseSpeed: ['Shift'],
    decreaseSpeed: ['Alt']
  },
  pinch: {
    zoomIn: ['=', '+'],
    zoomOut: ['-', '_'],
    reset: ['0']
  },
  rotate: {
    clockwise: [']', '}'],
    counterclockwise: ['[', '{'],
    reset: ['\\']
  },
  swipe: {
    up: ['Shift+ArrowUp'],
    down: ['Shift+ArrowDown'],
    left: ['Shift+ArrowLeft'],
    right: ['Shift+ArrowRight']
  },
  exit: ['Escape'],
  reset: ['Home']
};

/**
 * Configuration options for keyboard navigation alternatives
 */
export interface KeyboardNavigationOptions {
  /**
   * Element to attach keyboard event listeners to
   */
  elementRef: RefObject<HTMLElement>;
  
  /**
   * Custom keyboard mapping for gestures
   */
  keyboardMapping?: Partial<GestureKeyboardMapping>;
  
  /**
   * Activation mode for keyboard gesture control
   * Default: FOCUS
   */
  activationMode?: KeyboardActivationMode;
  
  /**
   * Type of feedback to provide during keyboard interactions
   * Default: BOTH
   */
  feedbackType?: KeyboardFeedbackType;
  
  /**
   * Step size for pan/movement operations (in pixels)
   * Default: 10
   */
  movementStep?: number;
  
  /**
   * Fast movement multiplier when using speed modifiers
   * Default: 3
   */
  fastMovementMultiplier?: number;
  
  /**
   * Slow movement multiplier when using speed modifiers
   * Default: 0.25
   */
  slowMovementMultiplier?: number;
  
  /**
   * Step size for rotation operations (in degrees)
   * Default: 15
   */
  rotationStep?: number;
  
  /**
   * Step size for pinch/zoom operations
   * Default: 0.1 (10% zoom per keypress)
   */
  zoomStep?: number;
  
  /**
   * Whether to provide visual indicators in the UI for available keyboard controls
   * Default: true
   */
  showVisualIndicators?: boolean;
  
  /**
   * Whether gestures can be activated via keyboard
   * Used to disable keyboard navigation temporarily
   * Default: true
   */
  enabled?: boolean;
  
  /**
   * Which gesture types to enable keyboard alternatives for
   * If not specified, all supported gestures will have keyboard alternatives
   */
  enabledGestures?: GestureType[];
  
  /**
   * Callback when keyboard gesture mode is activated
   */
  onKeyboardModeActivate?: () => void;
  
  /**
   * Callback when keyboard gesture mode is deactivated
   */
  onKeyboardModeDeactivate?: () => void;
  
  /**
   * Callback for generated gesture events
   */
  onGestureEvent?: (gestureEvent: GestureEventData) => void;
}

/**
 * Interface for a keyboard handler function that transforms a keyboard event
 * into a corresponding gesture event
 */
interface KeyboardHandlerFn {
  (
    event: KeyboardEvent,
    options: KeyboardNavigationOptions,
    state: KeyboardGestureState,
    active: boolean
  ): GestureEventData | null;
}

/**
 * State maintained during keyboard gesture interactions
 */
interface KeyboardGestureState {
  active: boolean;
  activeGestureType: GestureType | null;
  gestureStartPosition: { x: number; y: number } | null;
  currentScale: number;
  currentRotation: number;
  lastKeyEvents: Map<string, KeyboardEvent>;
  modifierKeys: Set<string>;
  lastTimestamp: number;
  longPressTimer: number | null;
  doubleTapTimer: number | null;
  tapCount: number;
}

/**
 * Creates a simulated gesture event from keyboard input
 */
function createGestureEvent(
  type: GestureType,
  state: GestureState,
  element: HTMLElement | null,
  keyboardEvent: KeyboardEvent | null,
  overrides: Partial<GestureEventData> = {}
): GestureEventData {
  // Get element position and dimensions
  const rect = element?.getBoundingClientRect() || { x: 0, y: 0, width: 100, height: 100 };
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const position = { x: centerX, y: centerY }; // Use center as current position

  // Base gesture event - Added missing required fields
  const baseEvent: GestureEventData = {
    type,
    state,
    target: element || undefined,
    position: position,
    initialPosition: position, // For keyboard, initial is often same as current unless tracked
    movement: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    distance: 0,
    duration: 0,
    direction: GestureDirection.NONE,
    event: keyboardEvent as any,
    timestamp: Date.now(),
  };

  // Merge with any overrides
  const finalEvent = { ...baseEvent, ...overrides };

  // Manually delete if overrides accidentally included invalid props
  delete (finalEvent as any).preventDefault;
  delete (finalEvent as any).stopPropagation;
  delete (finalEvent as any).absoluteRotation;
  
  // --- ADD isKeyboardGenerated property --- 
  finalEvent.isKeyboardGenerated = true;
  
  return finalEvent;
}

/**
 * Handler for tap and related gestures (tap, doubleTap, longPress)
 */
const handleTapGestures: KeyboardHandlerFn = (
  event,
  options,
  state,
  active
) => {
  const { keyboardMapping = DEFAULT_KEYBOARD_MAPPING } = options;
  const tapKeys = keyboardMapping.tap || DEFAULT_KEYBOARD_MAPPING.tap;
  
  // Check if the key pressed is a tap key
  if (!tapKeys.includes(event.key)) {
    return null;
  }
  
  // Prevent default to avoid space bar scrolling, etc.
  event.preventDefault();
  
  if (event.type === 'keydown') {
    const now = Date.now();
    
    // Clear any existing long press timer
    if (state.longPressTimer !== null) {
      window.clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
    
    // Set up long press detection
    state.longPressTimer = window.setTimeout(() => {
      if (state.activeGestureType === null) {
        state.activeGestureType = GestureType.LONG_PRESS;
        if (options.onGestureEvent && active) {
          const gestureEvent = createGestureEvent(
            GestureType.LONG_PRESS,
            GestureState.RECOGNIZED,
            options.elementRef.current,
            event,
            { timestamp: Date.now() }
          );
          options.onGestureEvent(gestureEvent);
        }
      }
      state.longPressTimer = null;
    }, 500);
    
    // Handle double tap detection
    if (state.doubleTapTimer !== null) {
      // This is a second tap within the double tap threshold
      window.clearTimeout(state.doubleTapTimer);
      state.doubleTapTimer = null;
      state.tapCount = 0;
      
      // Trigger double tap gesture
      state.activeGestureType = GestureType.DOUBLE_TAP;
      
      if (options.onGestureEvent && active) {
        const gestureEvent = createGestureEvent(
          GestureType.DOUBLE_TAP,
          GestureState.RECOGNIZED,
          options.elementRef.current,
          event,
          { timestamp: now }
        );
        return gestureEvent;
      }
    } else {
      // This is the first tap, start double tap timer
      state.tapCount = 1;
      state.doubleTapTimer = window.setTimeout(() => {
        // If no second tap after threshold, reset
        state.doubleTapTimer = null;
        state.tapCount = 0;
      }, 300); // 300ms is typical double tap threshold
    }
    
    // Store initial press state but don't generate event yet
    state.lastTimestamp = now;
    return null;
  } 
  else if (event.type === 'keyup') {
    // Clear long press timer on key up
    if (state.longPressTimer !== null) {
      window.clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
    
    // If this wasn't a long press or double tap, then it's a regular tap
    if (state.activeGestureType === null) {
      state.activeGestureType = GestureType.TAP;
      
      if (options.onGestureEvent && active) {
        const gestureEvent = createGestureEvent(
          GestureType.TAP,
          GestureState.RECOGNIZED,
          options.elementRef.current,
          event,
          { timestamp: Date.now() }
        );
        
        // Reset active gesture type after sending event
        setTimeout(() => {
          state.activeGestureType = null;
        }, 0);
        
        return gestureEvent;
      }
    }
    
    // Reset active gesture type after key up
    if (state.activeGestureType === GestureType.LONG_PRESS) {
      state.activeGestureType = null;
    }
  }
  
  return null;
};

/**
 * Handler for pan gestures using arrow keys
 */
const handlePanGestures: KeyboardHandlerFn = (
  event,
  options,
  state,
  active
) => {
  if (!active) return null;
  
  // --- ADD CHECK: Ignore pan if shift key is pressed (likely for swipe) ---
  if (event.shiftKey) {
    return null;
  }
  // --- END CHECK ---
  
  const { 
    keyboardMapping = DEFAULT_KEYBOARD_MAPPING,
    movementStep = 10,
    fastMovementMultiplier = 3,
    slowMovementMultiplier = 0.25
  } = options;
  
  const panMapping = keyboardMapping.pan || DEFAULT_KEYBOARD_MAPPING.pan;
  const modifierKeys = new Set(state.modifierKeys);
  
  // Track modifier keys for speed adjustments
  if (event.type === 'keydown') {
    if (panMapping.increaseSpeed?.includes(event.key)) {
      modifierKeys.add(event.key);
    }
    if (panMapping.decreaseSpeed?.includes(event.key)) {
      modifierKeys.add(event.key);
    }
  } else if (event.type === 'keyup') {
    modifierKeys.delete(event.key);
  }
  
  // Update state
  state.modifierKeys = modifierKeys;
  
  // Detect arrow key presses for panning
  const movement = { x: 0, y: 0 };
  let direction = GestureDirection.NONE;
  
  if (event.type === 'keydown') {
    // Calculate movement based on which arrow key was pressed
    if (panMapping.up?.includes(event.key)) {
      movement.y = -movementStep;
      direction = GestureDirection.UP;
      event.preventDefault();
    } 
    else if (panMapping.down?.includes(event.key)) {
      movement.y = movementStep;
      direction = GestureDirection.DOWN;
      event.preventDefault();
    } 
    else if (panMapping.left?.includes(event.key)) {
      movement.x = -movementStep;
      direction = GestureDirection.LEFT;
      event.preventDefault();
    } 
    else if (panMapping.right?.includes(event.key)) {
      movement.x = movementStep;
      direction = GestureDirection.RIGHT;
      event.preventDefault();
    }
    else {
      // Not an arrow key, no pan gesture
      return null;
    }
    
    // Apply speed modifiers if active
    const hasSpeedUp = Array.from(modifierKeys).some(key => 
      panMapping.increaseSpeed?.includes(key)
    );
    
    const hasSlowDown = Array.from(modifierKeys).some(key => 
      panMapping.decreaseSpeed?.includes(key)
    );
    
    if (hasSpeedUp) {
      movement.x *= fastMovementMultiplier;
      movement.y *= fastMovementMultiplier;
    } else if (hasSlowDown) {
      movement.x *= slowMovementMultiplier;
      movement.y *= slowMovementMultiplier;
    }
    
    // Initialize or update the pan gesture
    if (state.activeGestureType !== GestureType.PAN) {
      // Start new pan gesture
      state.activeGestureType = GestureType.PAN;
      state.gestureStartPosition = { 
        x: options.elementRef.current?.getBoundingClientRect().left || 0,
        y: options.elementRef.current?.getBoundingClientRect().top || 0
      };
      
      if (options.onGestureEvent) {
        // Send BEGAN event
        const gestureEvent = createGestureEvent(
          GestureType.PAN,
          GestureState.BEGAN,
          options.elementRef.current,
          event,
          { 
            movement: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            direction: GestureDirection.NONE,
            timestamp: Date.now()
          }
        );
        options.onGestureEvent(gestureEvent);
      }
    }
    
    // Calculate velocity based on time since last event
    const now = Date.now();
    const deltaTime = now - state.lastTimestamp;
    const velocity = {
      x: deltaTime > 0 ? movement.x / deltaTime : 0,
      y: deltaTime > 0 ? movement.y / deltaTime : 0
    };
    
    state.lastTimestamp = now;
    
    // Send pan gesture CHANGED event
    if (options.onGestureEvent) {
      const gestureEvent = createGestureEvent(
        GestureType.PAN,
        GestureState.CHANGED,
        options.elementRef.current,
        event,
        { 
          movement,
          velocity,
          direction,
          timestamp: now
        }
      );
      return gestureEvent;
    }
  } 
  else if (event.type === 'keyup') {
    // End pan gesture only when all arrow keys are released
    const arrowKeys = [
      ...(panMapping.up || []),
      ...(panMapping.down || []),
      ...(panMapping.left || []),
      ...(panMapping.right || [])
    ];
    
    if (arrowKeys.includes(event.key) && state.activeGestureType === GestureType.PAN) {
      // Check if any other arrow keys are still pressed
      const anyArrowKeyStillPressed = Array.from(state.lastKeyEvents.entries())
        .some(([key, keyEvent]) => {
          return arrowKeys.includes(key) && 
                 keyEvent.type === 'keydown' && 
                 key !== event.key;
        });
      
      if (!anyArrowKeyStillPressed) {
        // All arrow keys released, end pan gesture
        state.activeGestureType = null;
        
        if (options.onGestureEvent) {
          const now = Date.now();
          const deltaTime = now - state.lastTimestamp;
          
          // Calculate final velocity
          const finalVelocity = {
            x: deltaTime > 10 ? movement.x / deltaTime : 0,
            y: deltaTime > 10 ? movement.y / deltaTime : 0
          };
          
          const gestureEvent = createGestureEvent(
            GestureType.PAN,
            GestureState.ENDED,
            options.elementRef.current,
            event,
            { 
              movement: { x: 0, y: 0 },
              velocity: finalVelocity,
              direction,
              timestamp: now
            }
          );
          return gestureEvent;
        }
      }
    }
  }
  
  return null;
};

/**
 * Handler for swipe gestures using Shift+Arrow keys
 */
const handleSwipeGestures: KeyboardHandlerFn = (
  event,
  options,
  state,
  active
) => {
  if (!active) return null;
  
  const { 
    keyboardMapping = DEFAULT_KEYBOARD_MAPPING,
    movementStep = 10
  } = options;
  
  const swipeMapping = keyboardMapping.swipe || DEFAULT_KEYBOARD_MAPPING.swipe;
  
  // Check if this is a swipe key combo
  let isSwipeCombo = false;
  let swipeDirection: GestureDirection = GestureDirection.NONE;
  let movement = { x: 0, y: 0 };
  
  // Convert key combinations like "Shift+ArrowUp" to check match
  if (event.shiftKey) {
    if (event.key === 'ArrowUp' && swipeMapping.up?.includes('Shift+ArrowUp')) {
      isSwipeCombo = true;
      swipeDirection = GestureDirection.UP;
      movement = { x: 0, y: -movementStep * 3 }; // Larger movement for swipes
    } 
    else if (event.key === 'ArrowDown' && swipeMapping.down?.includes('Shift+ArrowDown')) {
      isSwipeCombo = true;
      swipeDirection = GestureDirection.DOWN;
      movement = { x: 0, y: movementStep * 3 };
    } 
    else if (event.key === 'ArrowLeft' && swipeMapping.left?.includes('Shift+ArrowLeft')) {
      isSwipeCombo = true;
      swipeDirection = GestureDirection.LEFT;
      movement = { x: -movementStep * 3, y: 0 };
    } 
    else if (event.key === 'ArrowRight' && swipeMapping.right?.includes('Shift+ArrowRight')) {
      isSwipeCombo = true;
      swipeDirection = GestureDirection.RIGHT;
      movement = { x: movementStep * 3, y: 0 };
    }
  }
  
  if (!isSwipeCombo) {
    return null;
  }
  
  event.preventDefault();
  
  if (event.type === 'keydown') {
    // Only trigger swipe on initial keydown, not on repeat events
    if (state.activeGestureType === GestureType.SWIPE) {
      return null;
    }
    
    state.activeGestureType = GestureType.SWIPE;
    const now = Date.now();
    const velocity = { x: movement.x * 0.5, y: movement.y * 0.5 };
    
    // Construct and return ENDED event directly 
      const endedEvent = createGestureEvent(
        GestureType.SWIPE,
        GestureState.ENDED,
        options.elementRef.current,
        event,
      { movement, velocity, direction: swipeDirection, timestamp: now + 20 }
      );
      
      // Reset active gesture after completion
        state.activeGestureType = null;
      
    // Return the final ENDED event 
      return endedEvent;
  }
  else if (event.type === 'keyup') {
    state.activeGestureType = null;
  }
  
  return null;
};

/**
 * Handler for pinch/zoom gestures using +/- keys
 */
const handlePinchGestures: KeyboardHandlerFn = (
  event,
  options,
  state,
  active
) => {
  if (!active) return null;
  
  const { 
    keyboardMapping = DEFAULT_KEYBOARD_MAPPING,
    zoomStep = 0.1
  } = options;
  
  const pinchMapping = keyboardMapping.pinch || DEFAULT_KEYBOARD_MAPPING.pinch;
  
  // Check if a zoom key was pressed
  let zoomChange = 0;
  
  if (event.type === 'keydown') {
    if (pinchMapping.zoomIn?.includes(event.key)) {
      zoomChange = zoomStep;
      event.preventDefault();
    } 
    else if (pinchMapping.zoomOut?.includes(event.key)) {
      zoomChange = -zoomStep;
      event.preventDefault();
    } 
    else if (pinchMapping.reset?.includes(event.key)) {
      // Reset to original scale (1.0)
      zoomChange = 1.0 - state.currentScale;
      event.preventDefault();
    }
    else {
      // Not a zoom key
      return null;
    }
    
    // Initialize or update the pinch gesture
    const isNewGesture = state.activeGestureType !== GestureType.PINCH;
    state.activeGestureType = GestureType.PINCH;
    
    const now = Date.now();
    let newScale = state.currentScale;
    
    if (pinchMapping.reset?.includes(event.key)) {
      newScale = 1.0; // Reset to default scale
    } else {
      newScale = Math.max(0.1, state.currentScale + zoomChange);
    }
    
    // Maintain scale state
    state.currentScale = newScale;
    
    // Calculate scale factor relative to initial scale (for pinch gesture)
    const scaleFactor = newScale / (isNewGesture ? newScale - zoomChange : 1);
    
    if (options.onGestureEvent) {
      // Send appropriate event based on whether this is new or continuing
      const gestureState = isNewGesture ? GestureState.BEGAN : GestureState.CHANGED;
      
      const gestureEvent = createGestureEvent(
        GestureType.PINCH,
        gestureState,
        options.elementRef.current,
        event,
        { 
          scale: scaleFactor,
          velocity: { x: 0, y: 0 },
          timestamp: now
        }
      );
      return gestureEvent;
    }
  } 
  else if (event.type === 'keyup') {
    const pinchKeys = [
      ...(pinchMapping.zoomIn || []),
      ...(pinchMapping.zoomOut || []),
      ...(pinchMapping.reset || [])
    ];
    
    if (pinchKeys.includes(event.key) && state.activeGestureType === GestureType.PINCH) {
      // Check if any other pinch keys are still pressed
      const anyPinchKeyStillPressed = Array.from(state.lastKeyEvents.entries())
        .some(([key, keyEvent]) => {
          return pinchKeys.includes(key) && 
                 keyEvent.type === 'keydown' && 
                 key !== event.key;
        });
      
      if (!anyPinchKeyStillPressed) {
        // All pinch keys released, end pinch gesture
        state.activeGestureType = null;
        
        if (options.onGestureEvent) {
          const gestureEvent = createGestureEvent(
            GestureType.PINCH,
            GestureState.ENDED,
            options.elementRef.current,
            event,
            { 
              scale: state.currentScale,
              timestamp: Date.now()
            }
          );
          return gestureEvent;
        }
      }
    }
  }
  
  return null;
};

/**
 * Handler for rotation gestures using [ and ] keys
 */
const handleRotateGestures: KeyboardHandlerFn = (
  event,
  options,
  state,
  active
) => {
  if (!active) return null;
  
  const { 
    keyboardMapping = DEFAULT_KEYBOARD_MAPPING,
    rotationStep = 15
  } = options;
  
  const rotateMapping = keyboardMapping.rotate || DEFAULT_KEYBOARD_MAPPING.rotate;
  
  // Check if a rotation key was pressed
  let rotationChange = 0;
  
  if (event.type === 'keydown') {
    if (rotateMapping.clockwise?.includes(event.key)) {
      rotationChange = rotationStep;
      event.preventDefault();
    } 
    else if (rotateMapping.counterclockwise?.includes(event.key)) {
      rotationChange = -rotationStep;
      event.preventDefault();
    } 
    else if (rotateMapping.reset?.includes(event.key)) {
      // Reset to original rotation (0)
      rotationChange = -state.currentRotation;
      event.preventDefault();
    }
    else {
      // Not a rotation key
      return null;
    }
    
    // Initialize or update the rotation gesture
    const isNewGesture = state.activeGestureType !== GestureType.ROTATE;
    state.activeGestureType = GestureType.ROTATE;
    
    const now = Date.now();
    let newRotation = state.currentRotation;
    
    if (rotateMapping.reset?.includes(event.key)) {
      newRotation = 0; // Reset to default rotation
    } else {
      newRotation = state.currentRotation + rotationChange;
    }
    
    // Normalize rotation to -180 to 180 degrees
    if (newRotation > 180) newRotation -= 360;
    if (newRotation < -180) newRotation += 360;
    
    // Maintain rotation state
    state.currentRotation = newRotation;
    
    // Send gesture event
    if (options.onGestureEvent) {
      const gestureState = 
        state.activeGestureType === GestureType.ROTATE 
          ? GestureState.CHANGED 
          : GestureState.BEGAN;
      
      state.activeGestureType = GestureType.ROTATE;
      
      const gestureEvent = createGestureEvent(
        GestureType.ROTATE,
        gestureState,
        options.elementRef.current,
        event,
        { 
          rotation: rotationChange,
          timestamp: Date.now()
        }
      );
      return gestureEvent;
    }
  } 
  else if (event.type === 'keyup') {
    const rotateKeys = [
      ...(rotateMapping.clockwise || []),
      ...(rotateMapping.counterclockwise || []),
      ...(rotateMapping.reset || [])
    ];
    
    if (rotateKeys.includes(event.key) && state.activeGestureType === GestureType.ROTATE) {
      // Check if any other rotation keys are still pressed
      const anyRotateKeyStillPressed = Array.from(state.lastKeyEvents.entries())
        .some(([key, keyEvent]) => {
          return rotateKeys.includes(key) && 
                 keyEvent.type === 'keydown' && 
                 key !== event.key;
        });
      
      if (!anyRotateKeyStillPressed) {
        // All rotation keys released, end rotation gesture
        state.activeGestureType = null;
        
        if (options.onGestureEvent) {
          const gestureEvent = createGestureEvent(
            GestureType.ROTATE,
            GestureState.ENDED,
            options.elementRef.current,
            event,
            { 
              rotation: 0, // No additional rotation on end
              timestamp: Date.now()
            }
          );
          return gestureEvent;
        }
      }
    }
  }
  
  return null;
};

/**
 * Handler for global control keys (escape, reset)
 */
const handleControlGestures: KeyboardHandlerFn = (
  event,
  options,
  state,
  active
) => {
  if (!active) return null;
  
  const { keyboardMapping = DEFAULT_KEYBOARD_MAPPING } = options;
  
  if (event.type === 'keydown') {
    // Exit keyboard gesture mode
    if (keyboardMapping.exit?.includes(event.key)) {
      // Kill any active gesture
      if (state.activeGestureType && options.onGestureEvent) {
        const gestureEvent = createGestureEvent(
          state.activeGestureType,
          GestureState.CANCELLED,
          options.elementRef.current,
          event
        );
        options.onGestureEvent(gestureEvent);
      }
      
      // Reset state
      state.activeGestureType = null;
      
      // Trigger deactivation callback
      options.onKeyboardModeDeactivate?.();
      
      event.preventDefault();
      return null;
    }
    
    // Reset to initial state
    if (keyboardMapping.reset?.includes(event.key)) {
      // Reset all state values
      state.currentScale = 1.0;
      state.currentRotation = 0;
      
      // Kill any active gesture
      if (state.activeGestureType && options.onGestureEvent) {
        const gestureEvent = createGestureEvent(
          state.activeGestureType,
          GestureState.CANCELLED,
          options.elementRef.current,
          event
        );
        options.onGestureEvent(gestureEvent);
      }
      
      state.activeGestureType = null;
      
      event.preventDefault();
      return null;
    }
  }
  
  return null;
};

/**
 * Create ARIA feedback for keyboard gesture interactions
 */
function createAccessibilityFeedback(
  element: HTMLElement | null, 
  gestureType: GestureType | null,
  feedbackType: KeyboardFeedbackType
): void {
  if (!element || feedbackType === KeyboardFeedbackType.NONE) {
    return;
  }
  
  // Remove existing indicators first
  element.querySelectorAll('.galileo-keyboard-indicator').forEach(el => {
    // Add type check/cast before accessing style
    if (el instanceof HTMLElement) {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    } else {
      el.remove(); // Remove if not HTMLElement
    }
  });
  
  if (!gestureType) return;
  
  // Add new indicator
  const indicator = document.createElement('div');
  indicator.className = 'galileo-keyboard-indicator';
  indicator.setAttribute('aria-live', 'polite');
  indicator.setAttribute('role', 'status');
  
  // Basic styling (should be refined via CSS)
  Object.assign(indicator.style, {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '5px 10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    zIndex: '10000',
    opacity: '0',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  });
  
  // Get appropriate text based on gesture
  let textContent = '';
  switch (gestureType) {
    case GestureType.PAN:
      textContent = 'Panning: Use Arrow Keys (Shift=Fast, Alt=Slow)';
      break;
    // ... add cases for other gestures ...
    default:
      textContent = `Keyboard mode active for ${gestureType}`;
  }
  
  indicator.textContent = textContent;
  element.appendChild(indicator);
  
  // Fade in
  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
  });
  
  // Announce for screen readers if needed
  if (feedbackType === KeyboardFeedbackType.AUDITORY || feedbackType === KeyboardFeedbackType.BOTH) {
    // Simple announcement for now
    // A more robust solution might involve a dedicated announcer div
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    
    announcer.textContent = textContent;
    document.body.appendChild(announcer);
    
    // Remove after a delay
    setTimeout(() => announcer.remove(), 1000);
  }
}

/**
 * Hook providing keyboard alternatives for gesture interactions
 * 
 * This hook enables keyboard users to perform the same interactions as touch/mouse
 * gesture users, maintaining physical behaviors and animations for accessibility.
 */
export function useKeyboardGestureAlternatives(
  options: KeyboardNavigationOptions
): {
  /**
   * Whether keyboard gesture mode is currently active
   */
  isKeyboardModeActive: boolean;
  
  /**
   * Activate keyboard gesture mode programmatically
   */
  activateKeyboardMode: () => void;
  
  /**
   * Deactivate keyboard gesture mode programmatically
   */
  deactivateKeyboardMode: () => void;
  
  /**
   * Currently active gesture type, if any
   */
  activeGestureType: GestureType | null;
  
  /**
   * Reset gesture state to defaults
   */
  resetGestureState: () => void;
  
  /**
   * ARIA attributes to add to the target element
   */
  ariaAttributes: Record<string, string>;
} {
  const {
    elementRef,
    keyboardMapping: customMapping,
    activationMode = KeyboardActivationMode.FOCUS,
    feedbackType = KeyboardFeedbackType.BOTH,
    enabled = true,
    enabledGestures,
    onGestureEvent,
    onKeyboardModeActivate,
    onKeyboardModeDeactivate
  } = options;
  
  // Check for reduced motion preference
  const preferReducedMotion = useReducedMotion();
  
  // State tracking
  const [isKeyboardModeActive, setIsKeyboardModeActive] = useState(false);
  const [activeGestureType, setActiveGestureType] = useState<GestureType | null>(null);
  
  // Refs to avoid recreating objects on each render
  const stateRef = useRef<KeyboardGestureState>({
    active: false,
    activeGestureType: null,
    gestureStartPosition: null,
    currentScale: 1.0,
    currentRotation: 0,
    lastKeyEvents: new Map(),
    modifierKeys: new Set(),
    lastTimestamp: 0,
    longPressTimer: null,
    doubleTapTimer: null,
    tapCount: 0
  });
  
  // Keep local state and ref in sync
  useEffect(() => {
    setActiveGestureType(stateRef.current.activeGestureType);
  }, [stateRef.current.activeGestureType]);
  
  // Merge keyboard mappings
  const keyboardMapping = useMemo(() => ({ 
    ...DEFAULT_KEYBOARD_MAPPING,
    ...customMapping,
    // Deep merge nested objects like pan, pinch etc.
    pan: { ...DEFAULT_KEYBOARD_MAPPING.pan, ...customMapping?.pan },
    pinch: { ...DEFAULT_KEYBOARD_MAPPING.pinch, ...customMapping?.pinch },
    rotate: { ...DEFAULT_KEYBOARD_MAPPING.rotate, ...customMapping?.rotate },
    swipe: { ...DEFAULT_KEYBOARD_MAPPING.swipe, ...customMapping?.swipe },
  }), [customMapping]);
  
  // Gesture handlers for different gesture types
  const handlers: KeyboardHandlerFn[] = [
    handleTapGestures,
    handlePanGestures,
    handleSwipeGestures,
    handlePinchGestures,
    handleRotateGestures,
    handleControlGestures
  ];
  
  // Process a keyboard event through all gesture handlers
  const processKeyboardEvent = useCallback((event: KeyboardEvent) => {
    if (!enabled || !isKeyboardModeActive) {
      return;
    }
    
    // Store the event for tracking key state
    stateRef.current.lastKeyEvents.set(event.key, event);
    
    // Process through all handlers until one returns a gesture event
    for (const handler of handlers) {
      const gestureEvent = handler(event, options, stateRef.current, isKeyboardModeActive);
      
      if (gestureEvent) {
        // Set active gesture type in state
        if (stateRef.current.activeGestureType !== activeGestureType) {
          setActiveGestureType(stateRef.current.activeGestureType);
        }
        
        // Provide accessibility feedback
        createAccessibilityFeedback(
          elementRef.current,
          stateRef.current.activeGestureType,
          feedbackType
        );
        
        // Forward the gesture event to caller
        onGestureEvent?.(gestureEvent);
        return true;
      }
    }
    
    return false;
  }, [
    enabled,
    isKeyboardModeActive,
    activeGestureType,
    options,
    elementRef,
    feedbackType,
    onGestureEvent
  ]);
  
  // Activate keyboard gesture mode
  const activateKeyboardMode = useCallback(() => {
    if (!enabled) return;
    
    // Only activate if not already active
    if (!isKeyboardModeActive) {
      setIsKeyboardModeActive(true);
      stateRef.current.active = true;
      
      // Call activation callback
      onKeyboardModeActivate?.();
      
      // Initialize state
      stateRef.current.activeGestureType = null;
      stateRef.current.lastKeyEvents.clear();
      stateRef.current.modifierKeys.clear();
      stateRef.current.lastTimestamp = Date.now();
      
      // Provide initial accessibility feedback
      if (elementRef.current) {
        createAccessibilityFeedback(
          elementRef.current,
          null, // No active gesture yet
          feedbackType
        );
      }
    }
  }, [
    enabled, 
    isKeyboardModeActive, 
    onKeyboardModeActivate, 
    elementRef, 
    feedbackType
  ]);
  
  // Deactivate keyboard gesture mode
  const deactivateKeyboardMode = useCallback(() => {
    if (isKeyboardModeActive) {
      setIsKeyboardModeActive(false);
      stateRef.current.active = false;
      
      // Cancel any active gestures
      if (stateRef.current.activeGestureType && onGestureEvent) {
        const gestureEvent = createGestureEvent(
          stateRef.current.activeGestureType,
          GestureState.CANCELLED,
          elementRef.current,
          null
        );
        onGestureEvent(gestureEvent);
      }
      
      // Reset state
      stateRef.current.activeGestureType = null;
      setActiveGestureType(null);
      
      // Remove accessibility feedback elements
      if (elementRef.current) {
        const feedbackEl = elementRef.current.querySelector('.keyboard-gesture-feedback');
        const srFeedbackEl = elementRef.current.querySelector('.keyboard-gesture-sr-feedback');
        
        if (feedbackEl) {
          elementRef.current.removeChild(feedbackEl);
        }
        
        if (srFeedbackEl) {
          elementRef.current.removeChild(srFeedbackEl);
        }
      }
      
      // Call deactivation callback
      onKeyboardModeDeactivate?.();
    }
  }, [isKeyboardModeActive, onGestureEvent, elementRef, onKeyboardModeDeactivate]);
  
  // Reset gesture state to defaults
  const resetGestureState = useCallback(() => {
    stateRef.current.currentScale = 1.0;
    stateRef.current.currentRotation = 0;
    
    // Cancel any active gesture
    if (stateRef.current.activeGestureType && onGestureEvent) {
      const gestureEvent = createGestureEvent(
        stateRef.current.activeGestureType,
        GestureState.CANCELLED,
        elementRef.current,
        null
      );
      onGestureEvent(gestureEvent);
    }
    
    // Reset state
    stateRef.current.activeGestureType = null;
    setActiveGestureType(null);
  }, [onGestureEvent, elementRef]);
  
  // Attach event listeners to the element
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Event handlers
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Activate on Enter or Space if in EXPLICIT mode
      if (!isKeyboardModeActive && activationMode === KeyboardActivationMode.EXPLICIT) {
        if (event.key === 'Enter' || event.key === ' ') {
          activateKeyboardMode();
          event.preventDefault();
          return;
        }
      }
      
      // Otherwise process for gesture equivalents
      if (isKeyboardModeActive) {
        processKeyboardEvent(event);
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!enabled || !isKeyboardModeActive) return;
      
      processKeyboardEvent(event);
    };
    
    const handleFocus = () => {
      if (!enabled) return;
      
      // Activate on focus if in AUTO or FOCUS mode
      if (activationMode === KeyboardActivationMode.AUTO || 
          activationMode === KeyboardActivationMode.FOCUS) {
        activateKeyboardMode();
      }
    };
    
    const handleBlur = () => {
      if (!enabled) return;
      
      // Always deactivate on blur
      deactivateKeyboardMode();
    };
    
    // Attach event listeners
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    
    // Clean up
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('keyup', handleKeyUp);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      
      // Clean up any timers
      if (stateRef.current.longPressTimer) {
        clearTimeout(stateRef.current.longPressTimer);
      }
      if (stateRef.current.doubleTapTimer) {
        clearTimeout(stateRef.current.doubleTapTimer);
      }
    };
  }, [
    elementRef, 
    enabled, 
    isKeyboardModeActive, 
    activationMode, 
    activateKeyboardMode, 
    deactivateKeyboardMode, 
    processKeyboardEvent
  ]);
  
  // Construct ARIA attributes for the element
  const ariaAttributes = useMemo(() => {
    const attrs: Record<string, string> = {
      'role': 'application', // Indicates this is an interactive application
      'tabIndex': '0', // Makes the element focusable
      'aria-label': `Interactive element with gesture controls${isKeyboardModeActive ? '. Keyboard navigation active' : ''}`
    };
    
    // Indicate when keyboard mode is active
    if (isKeyboardModeActive) {
      attrs['aria-keyshortcuts'] = 'ArrowUp ArrowDown ArrowLeft ArrowRight Plus Minus';
    }
    
    // Add gesture-specific attributes based on active gesture
    if (isKeyboardModeActive && activeGestureType) {
      attrs['aria-pressed'] = 
        (activeGestureType === GestureType.TAP || 
         activeGestureType === GestureType.LONG_PRESS).toString();
         
      if (activeGestureType === GestureType.PAN) {
        attrs['aria-live'] = 'polite';
        attrs['aria-relevant'] = 'additions text';
      }
    }
    
    return attrs;
  }, [isKeyboardModeActive, activeGestureType]);
  
  // Return interface for consumers
  return {
    isKeyboardModeActive,
    activateKeyboardMode,
    deactivateKeyboardMode,
    activeGestureType,
    resetGestureState,
    ariaAttributes
  };
}

/**
 * Create a GestureKeyboardMapping object from key name arrays
 * Utility function to simplify mapping definition
 */
export function createKeyboardMapping(mapping: {
  tap?: string[];
  doubleTap?: string[];
  longPress?: string[];
  panUp?: string[];
  panDown?: string[];
  panLeft?: string[];
  panRight?: string[];
  panFaster?: string[];
  panSlower?: string[];
  zoomIn?: string[];
  zoomOut?: string[];
  zoomReset?: string[];
  rotateClockwise?: string[];
  rotateCounterclockwise?: string[];
  rotateReset?: string[];
  swipeUp?: string[];
  swipeDown?: string[];
  swipeLeft?: string[];
  swipeRight?: string[];
  exit?: string[];
  reset?: string[];
}): GestureKeyboardMapping {
  return {
    tap: mapping.tap,
    doubleTap: mapping.doubleTap,
    longPress: mapping.longPress,
    pan: {
      up: mapping.panUp,
      down: mapping.panDown,
      left: mapping.panLeft,
      right: mapping.panRight,
      increaseSpeed: mapping.panFaster,
      decreaseSpeed: mapping.panSlower
    },
    pinch: {
      zoomIn: mapping.zoomIn,
      zoomOut: mapping.zoomOut,
      reset: mapping.zoomReset
    },
    rotate: {
      clockwise: mapping.rotateClockwise,
      counterclockwise: mapping.rotateCounterclockwise,
      reset: mapping.rotateReset
    },
    swipe: {
      up: mapping.swipeUp,
      down: mapping.swipeDown,
      left: mapping.swipeLeft,
      right: mapping.swipeRight
    },
    exit: mapping.exit,
    reset: mapping.reset
  };
}