/**
 * React hook for integrating elements with a magnetic system
 */

import { useRef, useEffect, useState, RefObject } from 'react';
import { 
  MagneticSystemManager, 
  getMagneticSystem, 
  MagneticSystemConfig, 
  MagneticElementOptions, 
  MagneticElement, 
  MagneticTransform 
} from './magneticSystem';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { DirectionalFieldConfig } from './directionalField';
import { ForceVector } from './magneticEffect';

/**
 * Options for the useMagneticSystemElement hook
 */
export interface MagneticSystemElementOptions extends Partial<MagneticElementOptions> {
  /**
   * ID of the magnetic system to connect to
   */
  systemId: string;
  
  /**
   * System configuration (only used if system doesn't exist yet)
   */
  systemConfig?: MagneticSystemConfig;
  
  /**
   * Whether to register the element with the system automatically
   */
  autoRegister?: boolean;
  
  /**
   * Callback when element is being transformed
   */
  onTransform?: (transform: MagneticTransform) => void;
  
  /**
   * Callback when element becomes active
   */
  onActivate?: () => void;
  
  /**
   * Callback when element becomes inactive
   */
  onDeactivate?: () => void;
  
  /**
   * Callback when element interacts with another element
   */
  onInteraction?: (other: MagneticElement) => void;
  
  /**
   * CSS class to add when element is active
   */
  activeClassName?: string;

  /**
   * Directional field configuration for this element
   */
  directionalField?: DirectionalFieldConfig;
  
  /**
   * Whether to respect user's reduced motion preferences
   */
  respectReducedMotion?: boolean;
  
  /**
   * Force direction for the element (if it affects others)
   */
  forceDirection?: ForceVector;
}

/**
 * Result of the useMagneticSystemElement hook
 */
export interface MagneticSystemElementResult<T extends HTMLElement = HTMLElement> {
  /**
   * Reference to attach to the element
   */
  ref: RefObject<T>;
  
  /**
   * Current element ID in the system (if registered)
   */
  elementId: string | null;
  
  /**
   * Current magnetic transform
   */
  transform: MagneticTransform;
  
  /**
   * Whether the element is currently active
   */
  isActive: boolean;
  
  /**
   * CSS class for active state
   */
  activeClass: string | null;
  
  /**
   * Reference to the magnetic system
   */
  system: MagneticSystemManager;
  
  /**
   * Register element with the system
   */
  register: () => void;
  
  /**
   * Unregister element from the system
   */
  unregister: () => void;
  
  /**
   * Apply force to the element
   */
  applyForce: (force: ForceVector) => void;
  
  /**
   * Manually activate the element
   */
  activate: () => void;
  
  /**
   * Manually deactivate the element
   */
  deactivate: () => void;
}

/**
 * Default transform state
 */
const DEFAULT_TRANSFORM: MagneticTransform = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  active: false,
  force: 0
};

/**
 * Hook to integrate an element with a magnetic system
 * 
 * @param options Configuration options for the magnetic system element
 * @returns Object with refs and methods for controlling the magnetic element
 */
export function useMagneticSystemElement<T extends HTMLElement = HTMLElement>(
  options: MagneticSystemElementOptions
): MagneticSystemElementResult<T> {
  // Get references to the magnetic system
  const system = getMagneticSystem(options.systemId, options.systemConfig || {});
  
  // Create element reference
  const elementRef = useRef<T>(null);
  
  // Track element ID in the system
  const [elementId, setElementId] = useState<string | null>(null);
  
  // Track transform state
  const [transform, setTransform] = useState<MagneticTransform>(DEFAULT_TRANSFORM);
  
  // Track active state
  const [isActive, setIsActive] = useState(false);
  
  // Get reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion && options.respectReducedMotion !== false;
  
  // Custom transform application function
  const applyTransform = (newTransform: MagneticTransform) => {
    if (!elementRef.current) return;
    
    // Adjust transform for reduced motion if needed
    let adjustedTransform = newTransform;
    
    if (shouldReduceMotion) {
      adjustedTransform = {
        ...newTransform,
        x: newTransform.x * 0.3,
        y: newTransform.y * 0.3,
        rotation: 0,
        scale: 1 + (newTransform.scale - 1) * 0.3
      };
    }
    
    // Apply transform to the DOM element
    elementRef.current.style.transform = `
      translate(${adjustedTransform.x}px, ${adjustedTransform.y}px)
      ${adjustedTransform.rotation !== 0 ? `rotate(${adjustedTransform.rotation}deg)` : ''}
      ${adjustedTransform.scale !== 1 ? `scale(${adjustedTransform.scale})` : ''}
    `;
    
    // Update state
    setTransform(adjustedTransform);
    setIsActive(adjustedTransform.active);
    
    // Call transform callback if provided
    if (options.onTransform) {
      options.onTransform(adjustedTransform);
    }
    
    // Handle activation/deactivation callbacks
    if (adjustedTransform.active && !transform.active && options.onActivate) {
      options.onActivate();
    } else if (!adjustedTransform.active && transform.active && options.onDeactivate) {
      options.onDeactivate();
    }
    
    // Add/remove active class if specified
    if (options.activeClassName) {
      if (adjustedTransform.active) {
        elementRef.current.classList.add(options.activeClassName);
      } else {
        elementRef.current.classList.remove(options.activeClassName);
      }
    }
  };
  
  // Function to register the element with the system
  const register = () => {
    if (!elementRef.current || elementId) return;
    
    const newElementId = system.registerElement({
      element: elementRef.current,
      id: options.id,
      mass: options.mass,
      radius: options.radius,
      isStatic: options.isStatic,
      isAttractor: options.isAttractor,
      isRepeller: options.isRepeller,
      strength: options.strength,
      directionalField: options.directionalField,
      role: options.role,
      userData: options.userData,
      applyTransform
    });
    
    setElementId(newElementId);
    
    // Add interaction event listener if needed
    if (options.onInteraction) {
      system.addEventListener('interaction', (event) => {
        if (!elementRef.current) return;
        
        // Check if this element is involved in the interaction
        if (event.elementA.id === newElementId) {
          options.onInteraction!(event.elementB);
        } else if (event.elementB.id === newElementId) {
          options.onInteraction!(event.elementA);
        }
      });
    }
  };
  
  // Function to unregister the element from the system
  const unregister = () => {
    if (!elementId) return;
    
    // Remove element from system
    system.unregisterElement(elementId);
    setElementId(null);
    
    // Reset transform
    setTransform(DEFAULT_TRANSFORM);
    setIsActive(false);
    
    // Remove active class if specified
    if (options.activeClassName && elementRef.current) {
      elementRef.current.classList.remove(options.activeClassName);
    }
  };
  
  // Function to apply force to the element
  const applyForce = (force: ForceVector) => {
    if (!elementId) return;
    
    system.applyForce(elementId, force);
  };
  
  // Function to manually activate the element
  const activate = () => {
    if (!elementId || !elementRef.current) return;
    
    // Update element's position
    const rect = elementRef.current.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    // Apply a small force to "activate" the element
    const force = options.forceDirection || { x: 0, y: -10 };
    applyForce(force);
    
    // Update isActive state
    setIsActive(true);
  };
  
  // Function to manually deactivate the element
  const deactivate = () => {
    if (!elementId || !elementRef.current) return;
    
    // Apply a force in the opposite direction to reset position
    const element = system.getElement(elementId);
    if (element) {
      const oppositeForce = {
        x: -element.transform.x * 2,
        y: -element.transform.y * 2
      };
      
      applyForce(oppositeForce);
    }
    
    // Update isActive state
    setIsActive(false);
  };
  
  // Auto-register the element when the ref is set
  useEffect(() => {
    if (!elementRef.current || elementId || !options.autoRegister) return;
    
    register();
    
    return () => {
      unregister();
    };
  }, [elementRef.current, options.autoRegister]);
  
  // Update element when options change
  useEffect(() => {
    if (!elementId) return;
    
    system.updateElement(elementId, {
      mass: options.mass,
      radius: options.radius,
      isStatic: options.isStatic,
      isAttractor: options.isAttractor,
      isRepeller: options.isRepeller,
      strength: options.strength,
      directionalField: options.directionalField,
      role: options.role,
      userData: options.userData
    });
  }, [
    elementId,
    options.mass,
    options.radius,
    options.isStatic,
    options.isAttractor,
    options.isRepeller,
    options.strength,
    options.directionalField,
    options.role,
    options.userData
  ]);
  
  return {
    ref: elementRef,
    elementId,
    transform,
    isActive,
    activeClass: isActive && options.activeClassName ? options.activeClassName : null,
    system,
    register,
    unregister,
    applyForce,
    activate,
    deactivate
  };
}

export default useMagneticSystemElement;