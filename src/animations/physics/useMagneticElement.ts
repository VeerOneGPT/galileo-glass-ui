/**
 * React hook for easy magnetic element integration with components
 * 
 * This hook provides a simplified API for adding magnetic effects
 * to React components with sensible defaults and integration with
 * the Galileo Glass physics system.
 */

import { useRef, useCallback, useEffect, useState, RefObject } from 'react';
import { MagneticEffectOptions } from './magneticEffect';
import { useMagneticEffect } from './useMagneticEffect';
import { useReducedMotion, EnhancedReducedMotionResult } from '../accessibility/useReducedMotion';
import { GalileoPhysicsSystem, PhysicsObjectConfig, PhysicsObject } from './galileoPhysicsSystem';

// Global physics system instance
let physicsSystem: GalileoPhysicsSystem | null = null;

// Get or create the physics system singleton
const getPhysicsSystem = (): GalileoPhysicsSystem => {
  if (!physicsSystem) {
    physicsSystem = new GalileoPhysicsSystem({
      gravity: { x: 0, y: 0, z: 0 }, // No gravity by default for UI elements
      enableSleeping: true,
      velocitySleepThreshold: 0.01,
      sleepTimeThreshold: 500
    });
    physicsSystem.start();
  }
  return physicsSystem;
};

// Type guard to check if an object is EnhancedReducedMotionResult
function isEnhancedReducedMotionResult(value: any): value is EnhancedReducedMotionResult {
  return typeof value === 'object' && value !== null && 'prefersReducedMotion' in value;
}

/**
 * Magnetic element configuration options
 */
export interface MagneticElementOptions extends MagneticEffectOptions {
  /**
   * Whether to register the element with the global physics system
   * for potential interactions with other magnetic elements
   */
  registerWithPhysics?: boolean;

  /**
   * Physics object configuration for advanced physics integration
   * Only used when registerWithPhysics is true
   */
  physicsConfig?: Partial<PhysicsObjectConfig>;

  /**
   * Whether to enable interaction with other magnetic elements
   */
  interactWithOtherElements?: boolean;
  
  /**
   * Optional CSS class name to apply when element is active/magnetized
   */
  activeClassName?: string;
  
  /**
   * Optional callback when element becomes active (enters magnetic field)
   */
  onActivate?: () => void;
  
  /**
   * Optional callback when element becomes inactive (exits magnetic field)
   */
  onDeactivate?: () => void;
  
  /**
   * Optional callback for each animation frame during interaction
   * @param transform The current magnetic transform values
   */
  onTransform?: (transform: MagneticTransform) => void;
}

/**
 * Current state of a magnetic element's transform
 */
export interface MagneticTransform {
  /**
   * Horizontal displacement in pixels
   */
  x: number;
  
  /**
   * Vertical displacement in pixels
   */
  y: number;
  
  /**
   * Rotation in degrees (if affectsRotation is true)
   */
  rotation: number;
  
  /**
   * Scale factor (if affectsScale is true)
   */
  scale: number;
  
  /**
   * Whether the element is currently active/magnetized
   */
  active: boolean;
  
  /**
   * Normalized force between 0-1 representing magnetic influence
   */
  force: number;
}

/**
 * Result of the useMagneticElement hook
 */
export interface MagneticElementResult<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the target element
   */
  elementRef: RefObject<T>;
  
  /**
   * Current state of the magnetic transform
   */
  transform: MagneticTransform;
  
  /**
   * Whether the element is currently magnetized
   */
  isActive: boolean;
  
  /**
   * CSS class to apply to the element for active state
   */
  activeClass: string | null;
  
  /**
   * Method to manually activate the magnetic effect
   */
  activate: () => void;
  
  /**
   * Method to manually deactivate the magnetic effect
   */
  deactivate: () => void;
}

/**
 * Hook to easily add magnetic effects to any component
 * 
 * @param options Configuration options for the magnetic effect
 * @returns Object with refs and state for the magnetic element
 */
export const useMagneticElement = <T extends HTMLElement = HTMLElement>(
  options: MagneticElementOptions = {}
): MagneticElementResult<T> => {
  // Extract options with defaults
  const {
    registerWithPhysics = false,
    physicsConfig = {},
    interactWithOtherElements = false,
    activeClassName,
    onActivate,
    onDeactivate,
    onTransform,
    ...magneticOptions
  } = options;
  
  // Check for reduced motion preference (this is the enhanced hook)
  const enhancedMotionResult = useReducedMotion();

  // Create basic magnetic effect ref
  const magneticRef = useMagneticEffect({
    ...magneticOptions,
    // Access the boolean property from the enhanced result object
    reducedMotion: enhancedMotionResult.prefersReducedMotion
  }) as unknown as RefObject<T>;
  
  // Track physics object ID if registered with physics system
  const physicsObjectId = useRef<string | null>(null);
  
  // State for the magnetic transform
  const [transform, setTransform] = useState<MagneticTransform>({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    active: false,
    force: 0
  });
  
  // Track active state
  const [isActive, setIsActive] = useState(false);
  
  // Register with physics system if enabled
  useEffect(() => {
    if (!registerWithPhysics) return;
    
    const system = getPhysicsSystem();
    const element = magneticRef.current;
    
    if (element) {
      // Get element position
      const rect = element.getBoundingClientRect();
      
      // Create physics object for this element
      const objectId = system.addObject({
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        shape: 'circle',
        radius: Math.max(rect.width, rect.height) / 2,
        mass: physicsConfig.mass ?? 1.0,
        restitution: physicsConfig.restitution ?? 0.3,
        isStatic: !interactWithOtherElements,
        userData: {
          element,
          isMagneticElement: true
        },
        ...physicsConfig
      });
      
      physicsObjectId.current = objectId;
      
      // Update physics object position when element moves
      const updatePhysicsPosition = () => {
        if (!element || !physicsObjectId.current) return;
        const rect = element.getBoundingClientRect();
        system.updateObject(physicsObjectId.current, {
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          }
        });
      };
      
      // Listen for layout changes
      window.addEventListener('resize', updatePhysicsPosition);
      window.addEventListener('scroll', updatePhysicsPosition);
      
      return () => {
        // Clean up
        window.removeEventListener('resize', updatePhysicsPosition);
        window.removeEventListener('scroll', updatePhysicsPosition);
        
        if (physicsObjectId.current) {
          system.removeObject(physicsObjectId.current);
          physicsObjectId.current = null;
        }
      };
    }
  }, [registerWithPhysics, interactWithOtherElements, physicsConfig]);
  
  // Track transform changes
  useEffect(() => {
    const element = magneticRef.current;
    if (!element) return;
    
    // Function to parse transform style into values
    const parseTransform = () => {
      const style = window.getComputedStyle(element);
      const transformMatrix = style.transform || style.webkitTransform;
      
      // Default values
      let x = 0;
      let y = 0;
      let scale = 1;
      let rotation = 0;
      
      // If no transform, return defaults
      if (transformMatrix === 'none') {
        return { x, y, scale, rotation, active: false, force: 0 };
      }
      
      // Parse matrix values
      if (transformMatrix.startsWith('matrix(')) {
        // 2D matrix: matrix(a, b, c, d, tx, ty)
        const values = transformMatrix.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number) || [];
        if (values.length === 6) {
          // Extract translation
          x = values[4];
          y = values[5];
          
          // Extract scale
          const scaleX = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
          const scaleY = Math.sqrt(values[2] * values[2] + values[3] * values[3]);
          scale = (scaleX + scaleY) / 2;
          
          // Extract rotation (in radians, convert to degrees)
          rotation = Math.atan2(values[1], values[0]) * (180 / Math.PI);
        }
      } else if (transformMatrix.startsWith('matrix3d(')) {
        // 3D matrix: harder to extract values, simplified approach
        const values = transformMatrix.match(/matrix3d\(([^)]+)\)/)?.[1].split(',').map(Number) || [];
        if (values.length === 16) {
          x = values[12];
          y = values[13];
          
          // Approximate scale and rotation for 3D
          scale = (values[0] + values[5] + values[10]) / 3;
          rotation = Math.atan2(values[1], values[0]) * (180 / Math.PI);
        }
      }
      
      // Calculate force based on distance from origin
      const distance = Math.sqrt(x * x + y * y);
      const maxDisplacement = magneticOptions.maxDisplacement || 50;
      const force = Math.min(distance / maxDisplacement, 1);
      
      return {
        x,
        y,
        scale,
        rotation,
        active: distance > 0.1, // Small threshold to check if active
        force
      };
    };
    
    // Create an observer to watch for transform changes
    const observer = new MutationObserver(() => {
      const newTransform = parseTransform();
      setTransform(newTransform);
      setIsActive(newTransform.active);
      
      // Call transform callback if provided
      if (onTransform) {
        onTransform(newTransform);
      }
      
      // Handle activation/deactivation callbacks
      if (newTransform.active && !transform.active && onActivate) {
        onActivate();
      } else if (!newTransform.active && transform.active && onDeactivate) {
        onDeactivate();
      }
    });
    
    // Observe changes to style attribute and transform
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    return () => {
      observer.disconnect();
    };
  }, [magneticOptions.maxDisplacement, onActivate, onDeactivate, onTransform, transform.active]);
  
  // Method to manually activate the magnetic effect
  const activate = useCallback(() => {
    const element = magneticRef.current;
    if (!element) return;
    
    // Fake a mouse event at the center of the element
    const rect = element.getBoundingClientRect();
    const event = new MouseEvent('mousemove', {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top - 10, // Slightly above to create attraction
      bubbles: true
    });
    
    document.dispatchEvent(event);
    setIsActive(true);
  }, []);
  
  // Method to manually deactivate
  const deactivate = useCallback(() => {
    const element = magneticRef.current;
    if (!element) return;
    
    // Move mouse far away from element
    const event = new MouseEvent('mousemove', {
      clientX: -1000,
      clientY: -1000,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    setIsActive(false);
  }, []);
  
  return {
    elementRef: magneticRef,
    transform,
    isActive,
    activeClass: isActive && activeClassName ? activeClassName : null,
    activate,
    deactivate
  };
};

export default useMagneticElement; 