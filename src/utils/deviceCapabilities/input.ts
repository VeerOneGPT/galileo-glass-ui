/**
 * Device Capabilities - Input Detection
 * 
 * Input method and interaction capabilities detection
 */

import { InputCapabilities } from './types';

// Default input capabilities for SSR or when detection fails
export const DEFAULT_INPUT_CAPABILITIES: InputCapabilities = {
  touchDevice: false,
  multiTouchSupport: false,
  stylusSupport: false,
  gamepadSupport: false,
  pointerEventsSupport: false,
  forceTouchSupport: false,
  hoverCapability: true,
  finePointer: true
};

/**
 * Detect touch support
 */
const detectTouchSupport = (): { 
  touchDevice: boolean; 
  multiTouchSupport: boolean;
} => {
  if (typeof window === 'undefined') {
    return { 
      touchDevice: false,
      multiTouchSupport: false
    };
  }
  
  // Basic touch detection
  const touchDevice = (
    'ontouchstart' in window || 
    (window.navigator.maxTouchPoints > 0) || 
    (navigator.maxTouchPoints > 0)
  );
  
  // Multi-touch detection (more than 1 touch point)
  const multiTouchSupport = touchDevice && 
    ((window.navigator.maxTouchPoints > 1) || (navigator.maxTouchPoints > 1));
  
  return {
    touchDevice,
    multiTouchSupport
  };
};

/**
 * Detect stylus/pen support
 */
const detectStylusSupport = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for Pointer Events API with pen support
  if ('PointerEvent' in window) {
    return true; // Pointer events support pen/stylus
  }
  
  // Check for Microsoft's older API
  if ('msMaxTouchPoints' in navigator) {
    return true; // IE/Edge with pen support
  }
  
  // Some iPad detection with Apple Pencil
  const ua = navigator.userAgent;
  if ((/iPad/i.test(ua) || /Macintosh/i.test(ua) && 'ontouchend' in document)) {
    return true; // Possible Apple Pencil support
  }
  
  return false;
};

/**
 * Detect gamepad support
 */
const detectGamepadSupport = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  return 'getGamepads' in navigator;
};

/**
 * Detect pointer events support
 */
const detectPointerEventsSupport = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return 'PointerEvent' in window || 'MSPointerEvent' in window;
};

/**
 * Detect force/3D touch support
 */
const detectForceTouchSupport = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for 3D Touch (older iOS) or Force Touch
  let forceTouchSupported = false;
  
  // Check Touch API for force property
  if ('ontouchstart' in window && 'ontouchforcechange' in window) {
    forceTouchSupported = true;
  }
  
  // Check for pointer events with pressure
  if ('PointerEvent' in window && 'pressure' in PointerEvent.prototype) {
    forceTouchSupported = true;
  }
  
  return forceTouchSupported;
};

/**
 * Detect hover capability
 */
const detectHoverCapability = (): boolean => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return true; // Default to true for most environments
  }
  
  // Use hover media query to detect if device supports hover
  return matchMedia('(hover: hover)').matches;
};

/**
 * Detect if device likely has fine pointer precision
 */
const detectFinePointer = (): boolean => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return true; // Default to true for most environments
  }
  
  // Use pointer media query to detect fine pointer precision
  return matchMedia('(pointer: fine)').matches;
};

/**
 * Detect input capabilities
 */
export const detectInputCapabilities = (): InputCapabilities => {
  if (typeof window === 'undefined') {
    return DEFAULT_INPUT_CAPABILITIES;
  }
  
  // Get touch information
  const { touchDevice, multiTouchSupport } = detectTouchSupport();
  
  return {
    touchDevice,
    multiTouchSupport,
    stylusSupport: detectStylusSupport(),
    gamepadSupport: detectGamepadSupport(),
    pointerEventsSupport: detectPointerEventsSupport(),
    forceTouchSupport: detectForceTouchSupport(),
    hoverCapability: detectHoverCapability(),
    finePointer: detectFinePointer()
  };
};