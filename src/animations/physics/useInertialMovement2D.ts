import { useRef, useState, useEffect, useCallback } from 'react';
import { InertialMovement, InertialConfig, InertialPresets } from './inertialMovement';

interface Vector2D {
  x: number;
  y: number;
}

interface UseInertialMovement2DOptions {
  /**
   * Initial position
   */
  initialPosition?: Vector2D;
  
  /**
   * Initial velocity
   */
  initialVelocity?: Vector2D;
  
  /**
   * Inertial movement configuration
   */
  config?: Partial<InertialConfig> | keyof typeof InertialPresets;
  
  /**
   * Automatically start with initial velocity
   */
  autoStart?: boolean;
}

interface MovementController {
  setVelocity: (velocity: Vector2D) => void;
}

export interface UseInertialMovement2DResult {
  /**
   * Current position
   */
  position: Vector2D;
  
  /**
   * Set position and optionally velocity
   */
  setPosition: (position: Vector2D, animate?: boolean) => void;
  
  /**
   * Movement controller with additional methods
   */
  movement: MovementController;
}

/**
 * Hook for using 2D inertial movement in React components
 * 
 * @example
 * ```tsx
 * const [position, setPosition, movement] = useInertialMovement2D({
 *   initialPosition: { x: 0, y: 0 },
 *   config: 'SMOOTH'
 * });
 * 
 * // In touch handlers
 * const handleTouchEnd = (e) => {
 *   // Calculate velocity from touch movement
 *   movement.setVelocity({ x: velocityX, y: velocityY });
 * };
 * 
 * // Use position in styles
 * const style = {
 *   transform: `translate(${position.x}px, ${position.y}px)`
 * };
 * ```
 */
export function useInertialMovement2D(
  options: UseInertialMovement2DOptions = {}
): UseInertialMovement2DResult {
  const {
    initialPosition = { x: 0, y: 0 },
    initialVelocity = { x: 0, y: 0 },
    config = 'DEFAULT',
    autoStart = false
  } = options;
  
  // State for position
  const [position, setPositionState] = useState<Vector2D>(initialPosition);
  
  // Refs for the inertial controllers (one for each axis)
  const inertialXRef = useRef<InertialMovement | null>(null);
  const inertialYRef = useRef<InertialMovement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  
  // Initialize the inertial controllers
  useEffect(() => {
    // Create the inertial movement controllers
    const configObject = typeof config === 'string' 
      ? InertialPresets[config] 
      : config;
      
    inertialXRef.current = new InertialMovement(configObject);
    inertialYRef.current = new InertialMovement(configObject);
    
    // Set initial state
    inertialXRef.current.set(initialPosition.x, initialVelocity.x);
    inertialYRef.current.set(initialPosition.y, initialVelocity.y);
    
    // Start animation if autoStart is true and there's initial velocity
    if (autoStart && (initialVelocity.x !== 0 || initialVelocity.y !== 0)) {
      startAnimation();
    }
    
    return () => {
      // Clean up animation frame on unmount
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Animation loop
  const animate = useCallback(() => {
    if (inertialXRef.current && inertialYRef.current) {
      // Update both axes
      const stateX = inertialXRef.current.update();
      const stateY = inertialYRef.current.update();
      
      // Update state
      setPositionState({
        x: stateX.position,
        y: stateY.position
      });
      
      // Continue animation if either axis is still moving
      if (!stateX.atRest || !stateY.atRest) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        rafRef.current = null;
      }
    }
  }, []);
  
  // Start animation helper
  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
    }
    
    // Cancel existing animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Start the animation loop
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);
  
  // Set position (and optionally animate)
  const setPosition = useCallback((newPosition: Vector2D, animate = false) => {
    if (inertialXRef.current && inertialYRef.current) {
      // Update inertial controllers
      inertialXRef.current.set(newPosition.x, 0);
      inertialYRef.current.set(newPosition.y, 0);
      
      // Update state
      setPositionState(newPosition);
      
      // If animate flag is set, start animation
      if (animate) {
        startAnimation();
      } else {
        // Otherwise, make sure animation is stopped
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        isAnimatingRef.current = false;
      }
    }
  }, [startAnimation]);
  
  // Set velocity for both axes
  const setVelocity = useCallback((velocity: Vector2D) => {
    if (inertialXRef.current && inertialYRef.current) {
      // Set velocity for both axes
      inertialXRef.current.set(
        inertialXRef.current.getPosition(),
        velocity.x
      );
      
      inertialYRef.current.set(
        inertialYRef.current.getPosition(),
        velocity.y
      );
      
      // Start animation if velocity is significant
      const configRestThreshold = typeof config === 'string'
        ? InertialPresets[config].restThreshold ?? 0.1
        : config.restThreshold ?? 0.1;
        
      if (Math.abs(velocity.x) >= configRestThreshold || 
          Math.abs(velocity.y) >= configRestThreshold) {
        startAnimation();
      }
    }
  }, [config, startAnimation]);
  
  // Movement controller interface
  const movement: MovementController = {
    setVelocity
  };
  
  return {
    position,
    setPosition,
    movement
  };
} 