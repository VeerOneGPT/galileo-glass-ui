/**
 * Physics Interaction Hook
 * 
 * React hook for applying physics-based interactions to elements
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Physics interaction types
 */
export type PhysicsInteractionType = 'spring' | 'magnetic' | 'gravity' | 'particle' | 'attract' | 'repel' | 'follow' | 'orbit';

/**
 * Physics interaction options
 */
export interface PhysicsInteractionOptions {
  /**
   * Type of physics interaction
   */
  type?: PhysicsInteractionType;
  
  /**
   * Strength of the interaction (0-1)
   */
  strength?: number;
  
  /**
   * Activation radius in pixels
   */
  radius?: number;
  
  /**
   * Mass of the object (higher = more inertia)
   */
  mass?: number;
  
  /**
   * Stiffness for spring physics (higher = faster)
   */
  stiffness?: number;
  
  /**
   * Damping ratio (1 = critically damped, <1 = bouncy, >1 = overdamped)
   */
  dampingRatio?: number;
  
  /**
   * Ease factor for smoothing (0-1, lower = more smoothing)
   */
  easeFactor?: number;
  
  /**
   * Maximum displacement in pixels
   */
  maxDisplacement?: number;
  
  /**
   * If true, applies magnetic effect to rotation as well
   */
  affectsRotation?: boolean;
  
  /**
   * If true, applies magnetic effect to scale as well
   */
  affectsScale?: boolean;
  
  /**
   * Rotation amplitude in degrees (if affectsRotation is true)
   */
  rotationAmplitude?: number;
  
  /**
   * Scale amplitude (if affectsScale is true)
   */
  scaleAmplitude?: number;
  
  /**
   * If true, will optimize for GPU acceleration
   */
  gpuAccelerated?: boolean;
  
  /**
   * If true, applies transition to movement for smoother effect
   */
  smooth?: boolean;
  
  /**
   * Smoothing duration in milliseconds
   */
  smoothingDuration?: number;
  
  /**
   * If true, will only activate when hovering over the element
   */
  activeOnHoverOnly?: boolean;
}

/**
 * Physics state values
 */
export interface PhysicsState {
  /**
   * Current x position offset
   */
  x: number;
  
  /**
   * Current y position offset
   */
  y: number;
  
  /**
   * Current rotation in degrees
   */
  rotation: number;
  
  /**
   * Current scale factor
   */
  scale: number;
  
  /**
   * Boolean indicating if the element is currently active
   */
  active: boolean;
}

/**
 * Calculate distance between two points
 */
const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Hook for applying physics-based interactions to elements
 */
export const usePhysicsInteraction = (options: PhysicsInteractionOptions = {}) => {
  const prefersReducedMotion = useReducedMotion();
  
  const {
    type = 'spring',
    strength = 0.5,
    radius = 200,
    mass = 1,
    stiffness = 170,
    dampingRatio = 0.8,
    easeFactor = 0.15,
    maxDisplacement = 40,
    affectsRotation = false,
    affectsScale = false,
    rotationAmplitude = 10,
    scaleAmplitude = 0.1,
    gpuAccelerated = true,
    smooth = true,
    smoothingDuration = 200,
    activeOnHoverOnly = false,
  } = options;
  
  // Element ref that the physics will be applied to
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Animation frame ref for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // State for position and animation
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    active: false
  });
  
  // State to track if the mouse is inside the element (for hover-only mode)
  const [isHovering, setIsHovering] = useState(false);
  
  // Current mouse position
  const mousePositionRef = useRef({ x: 0, y: 0 });
  
  // Current element position (center)
  const elementPositionRef = useRef({ x: 0, y: 0 });
  
  // Current state (for use in animation loop without re-renders)
  const currentStateRef = useRef({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    active: false
  });
  
  // Apply reduced motion if needed
  const adjustedStrength = prefersReducedMotion ? Math.min(strength * 0.2, 0.1) : strength;
  const adjustedMaxDisplacement = prefersReducedMotion ? Math.min(maxDisplacement * 0.2, 10) : maxDisplacement;
  const adjustedRotationAmplitude = prefersReducedMotion ? 0 : rotationAmplitude;
  const adjustedScaleAmplitude = prefersReducedMotion ? 0 : scaleAmplitude;
  
  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Update element position if ref exists
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      elementPositionRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      
      // Calculate distance
      const distance = calculateDistance(
        mousePositionRef.current.x,
        mousePositionRef.current.y,
        elementPositionRef.current.x,
        elementPositionRef.current.y
      );
      
      // Only process if we're not in hover-only mode, or if we are and the element is being hovered
      const shouldProcess = !activeOnHoverOnly || isHovering;
      
      // Activate physics if within radius and should process
      if (distance < radius && shouldProcess) {
        if (!currentStateRef.current.active) {
          currentStateRef.current.active = true;
          
          // Start animation loop if not already running
          if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(updateAnimation);
          }
        }
      } else {
        currentStateRef.current.active = false;
      }
    }
  }, [radius, activeOnHoverOnly, isHovering]);
  
  // Function to handle mouse enter and leave for hover-only mode
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);
  
  // Animation update function based on type
  const updateAnimation = useCallback(() => {
    if (!elementRef.current) {
      animationFrameRef.current = null;
      return;
    }
    
    // Calculate current values based on physics type
    let targetX = 0;
    let targetY = 0;
    let targetRotation = 0;
    let targetScale = 1;
    
    if (currentStateRef.current.active) {
      // Calculate distance and direction vector
      const distanceX = mousePositionRef.current.x - elementPositionRef.current.x;
      const distanceY = mousePositionRef.current.y - elementPositionRef.current.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Apply different physics based on type
      if (distance < radius) {
        switch (type) {
          case 'spring':
          case 'attract':
            // Spring physics (attraction)
            const pull = (1 - distance / radius) * adjustedStrength;
            targetX = distanceX * pull;
            targetY = distanceY * pull;
            
            // Apply rotation based on position
            if (affectsRotation) {
              targetRotation = (distanceX / radius) * adjustedRotationAmplitude;
            }
            
            // Apply scale based on distance
            if (affectsScale) {
              targetScale = 1 + (1 - distance / radius) * adjustedScaleAmplitude;
            }
            break;
            
          case 'magnetic':
            // Magnetic attraction without rotation or scale
            const magneticPull = (1 - distance / radius) * adjustedStrength;
            targetX = distanceX * magneticPull;
            targetY = distanceY * magneticPull;
            
            // No rotation or scale for pure magnetic effect
            targetRotation = 0;
            targetScale = 1;
            break;
            
          case 'repel':
            // Magnetic repulsion
            const repel = (1 - distance / radius) * adjustedStrength;
            targetX = -distanceX * repel;
            targetY = -distanceY * repel;
            
            // Apply inverse rotation
            if (affectsRotation) {
              targetRotation = -(distanceX / radius) * adjustedRotationAmplitude;
            }
            
            // Apply inverse scale
            if (affectsScale) {
              targetScale = 1 - (1 - distance / radius) * adjustedScaleAmplitude;
            }
            break;
            
          case 'gravity':
            // Gravity follows inverse square law
            const gravityForce = Math.min(
              adjustedStrength * (mass / Math.max(distance * distance * 0.001, 0.1)),
              adjustedStrength * 2
            );
            
            // Calculate direction vector
            const dirX = distance ? distanceX / distance : 0;
            const dirY = distance ? distanceY / distance : 0;
            
            targetX = dirX * gravityForce * 10;
            targetY = dirY * gravityForce * 10;
            
            // Scale increases slightly with gravity
            if (affectsScale) {
              targetScale = 1 + gravityForce * 0.05;
            }
            targetRotation = 0;
            break;
            
          case 'follow':
            // Follow with decreasing strength as distance increases
            const follow = Math.min(adjustedStrength, adjustedStrength * (1 - distance / (radius * 2)));
            targetX = distanceX * follow;
            targetY = distanceY * follow;
            break;
            
          case 'orbit':
            // Calculate angle for orbit
            const angle = Math.atan2(distanceY, distanceX) + (Date.now() * 0.001) % (Math.PI * 2);
            const orbitDistance = distance * adjustedStrength;
            
            targetX = Math.cos(angle) * orbitDistance;
            targetY = Math.sin(angle) * orbitDistance;
            break;
            
          case 'particle':
            // Particle effect - jitter randomly
            const jitterAmount = (1 - distance / radius) * adjustedStrength * 5;
            targetX = (Math.random() - 0.5) * jitterAmount;
            targetY = (Math.random() - 0.5) * jitterAmount;
            
            if (affectsRotation) {
              targetRotation = (Math.random() - 0.5) * jitterAmount * 2;
            }
            
            if (affectsScale) {
              targetScale = 1 + (Math.random() - 0.5) * 0.05 * adjustedStrength;
            }
            break;
            
          default:
            break;
        }
        
        // Apply max displacement
        const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
        if (magnitude > adjustedMaxDisplacement) {
          const scale = adjustedMaxDisplacement / magnitude;
          targetX *= scale;
          targetY *= scale;
        }
      }
    }
    
    // Apply easing for smooth motion
    currentStateRef.current.x += (targetX - currentStateRef.current.x) * easeFactor;
    currentStateRef.current.y += (targetY - currentStateRef.current.y) * easeFactor;
    currentStateRef.current.rotation += (targetRotation - currentStateRef.current.rotation) * easeFactor;
    currentStateRef.current.scale += (targetScale - currentStateRef.current.scale) * easeFactor;
    
    // Check if animation should continue
    const isMoving = (
      Math.abs(currentStateRef.current.x) > 0.1 ||
      Math.abs(currentStateRef.current.y) > 0.1 ||
      Math.abs(currentStateRef.current.rotation) > 0.1 ||
      Math.abs(currentStateRef.current.scale - 1) > 0.01
    );
    
    // Update state only if significant change (to avoid unnecessary re-renders)
    if (isMoving || currentStateRef.current.active) {
      setPhysicsState({
        x: currentStateRef.current.x,
        y: currentStateRef.current.y,
        rotation: currentStateRef.current.rotation,
        scale: currentStateRef.current.scale,
        active: currentStateRef.current.active
      });
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    } else {
      // Stop animation loop if movement is minimal
      setPhysicsState({
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        active: false
      });
      animationFrameRef.current = null;
    }
  }, [
    adjustedMaxDisplacement, 
    adjustedStrength, 
    adjustedRotationAmplitude,
    adjustedScaleAmplitude,
    easeFactor, 
    mass, 
    radius, 
    type,
    affectsRotation,
    affectsScale
  ]);
  
  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    
    const element = elementRef.current;
    if (element && activeOnHoverOnly) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Apply GPU acceleration if requested
    if (gpuAccelerated && element) {
      element.style.willChange = 'transform';
      element.style.backfaceVisibility = 'hidden';
    }
    
    // Apply smooth transitions if requested
    if (smooth && element) {
      element.style.transition = `transform ${smoothingDuration}ms ease-out`;
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (element && activeOnHoverOnly) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      // Cancel animation frame on cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Reset styles
      if (element) {
        element.style.willChange = '';
        element.style.backfaceVisibility = '';
        element.style.transition = '';
        element.style.transform = '';
      }
    };
  }, [
    handleMouseMove, 
    handleMouseEnter, 
    handleMouseLeave, 
    gpuAccelerated, 
    smooth, 
    smoothingDuration, 
    activeOnHoverOnly
  ]);
  
  // Get transform style based on current state
  const style = {
    transform: `translate(${physicsState.x}px, ${physicsState.y}px)${
      affectsRotation ? ` rotate(${physicsState.rotation}deg)` : ''
    }${
      affectsScale ? ` scale(${physicsState.scale})` : ''
    }`,
    transition: smooth ? `transform ${smoothingDuration}ms ease-out` : 'none',
  };
  
  // Create event handlers for use in components
  const eventHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
  
  return { ref: elementRef, style, state: physicsState, eventHandlers };
};

export default usePhysicsInteraction;