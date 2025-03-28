import { useRef, useState, useEffect, useCallback } from 'react';
import { InertialMovement, InertialConfig, InertialPresets } from './inertialMovement';

export interface InertialMovementOptions {
  /**
   * Initial position
   */
  initialPosition?: number;
  
  /**
   * Initial velocity
   */
  initialVelocity?: number;
  
  /**
   * Inertial movement configuration
   */
  config?: Partial<InertialConfig> | keyof typeof InertialPresets;
  
  /**
   * Automatically start with initial velocity
   */
  autoStart?: boolean;
}

export interface InertialMovementResult {
  /**
   * Current position
   */
  position: number;
  
  /**
   * Current velocity
   */
  velocity: number;
  
  /**
   * Whether the movement is active (not at rest)
   */
  isMoving: boolean;
  
  /**
   * Set position and optionally velocity
   */
  setPosition: (position: number, velocity?: number) => void;
  
  /**
   * Add velocity to current movement
   */
  addVelocity: (velocity: number) => void;
  
  /**
   * Apply a "flick" gesture with velocity
   */
  flick: (velocity: number) => void;
  
  /**
   * Immediately stop all movement
   */
  stop: () => void;
  
  /**
   * Update configuration
   */
  updateConfig: (config: Partial<InertialConfig> | keyof typeof InertialPresets) => void;
}

/**
 * Hook for using inertial movement in React components
 * 
 * @example
 * ```tsx
 * const { position, addVelocity, flick, stop } = useInertialMovement({
 *   initialPosition: 0,
 *   config: 'SMOOTH',
 *   bounds: { min: 0, max: 1000 }
 * });
 * 
 * // In touch handlers
 * const handleTouchEnd = (e) => {
 *   // Calculate velocity from touch movement
 *   const velocity = calculateVelocity(touches);
 *   flick(velocity);
 * };
 * 
 * // Use position in styles
 * const style = {
 *   transform: `translateX(${position}px)`
 * };
 * ```
 */
export function useInertialMovement(
  options: InertialMovementOptions = {}
): InertialMovementResult {
  const {
    initialPosition = 0,
    initialVelocity = 0,
    config = 'DEFAULT',
    autoStart = false
  } = options;
  
  // State for position and movement status
  const [position, setPositionState] = useState<number>(initialPosition);
  const [velocity, setVelocityState] = useState<number>(initialVelocity);
  const [isMoving, setIsMoving] = useState<boolean>(autoStart && initialVelocity !== 0);
  
  // Refs for the inertial controller and animation frame
  const inertialRef = useRef<InertialMovement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Initialize the inertial controller
  useEffect(() => {
    if (!inertialRef.current) {
      // Create the inertial movement controller
      const configObject = typeof config === 'string' 
        ? InertialPresets[config] 
        : config;
        
      inertialRef.current = new InertialMovement(configObject);
      
      // Set initial state
      inertialRef.current.set(initialPosition, initialVelocity);
      
      // Start animation if autoStart is true and there's initial velocity
      if (autoStart && initialVelocity !== 0) {
        startAnimation();
      }
    }
    
    return () => {
      // Clean up animation frame on unmount
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Update config when it changes
  useEffect(() => {
    if (inertialRef.current) {
      const configObject = typeof config === 'string' 
        ? InertialPresets[config] 
        : config;
        
      inertialRef.current.updateConfig(configObject);
    }
  }, [config]);
  
  // Animation loop
  const animate = useCallback(() => {
    if (inertialRef.current) {
      const state = inertialRef.current.update();
      
      setPositionState(state.position);
      setVelocityState(state.velocity);
      
      if (!state.atRest) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsMoving(false);
        rafRef.current = null;
      }
    }
  }, []);
  
  // Start animation helper
  const startAnimation = useCallback(() => {
    if (!isMoving) {
      setIsMoving(true);
    }
    
    // Cancel existing animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Start the animation loop
    rafRef.current = requestAnimationFrame(animate);
  }, [animate, isMoving]);
  
  // Set position (and optionally velocity)
  const setPosition = useCallback((newPosition: number, newVelocity?: number) => {
    if (inertialRef.current) {
      // Set the new position and velocity
      inertialRef.current.set(
        newPosition, 
        newVelocity !== undefined ? newVelocity : 0
      );
      
      // Update state immediately for position
      setPositionState(newPosition);
      
      // Update velocity state
      if (newVelocity !== undefined) {
        setVelocityState(newVelocity);
        
        // Check against restThreshold from the configuration, falling back to default
        const configRestThreshold = typeof config === 'string'
          ? InertialPresets[config].restThreshold ?? 0.1
          : config.restThreshold ?? 0.1;
          
        if (Math.abs(newVelocity) >= configRestThreshold) {
          startAnimation();
        }
      } else {
        setVelocityState(0);
        setIsMoving(false);
        
        // Cancel any ongoing animation
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    }
  }, [startAnimation, config]);
  
  // Add velocity to current movement
  const addVelocity = useCallback((additionalVelocity: number) => {
    if (inertialRef.current) {
      // Add velocity to the movement
      inertialRef.current.addVelocity(additionalVelocity);
      
      // Update velocity state
      setVelocityState(inertialRef.current.getVelocity());
      
      // Start animation if not already running
      if (!isMoving && Math.abs(inertialRef.current.getVelocity()) > 0) {
        startAnimation();
      }
    }
  }, [isMoving, startAnimation]);
  
  // Apply a "flick" gesture
  const flick = useCallback((flickVelocity: number) => {
    if (inertialRef.current) {
      // Set velocity directly (replacing current velocity)
      inertialRef.current.set(
        inertialRef.current.getPosition(),
        flickVelocity
      );
      
      // Update velocity state
      setVelocityState(flickVelocity);
      
      // Check against restThreshold from the configuration, falling back to default
      const configRestThreshold = typeof config === 'string'
        ? InertialPresets[config].restThreshold ?? 0.1
        : config.restThreshold ?? 0.1;
        
      // Start animation if velocity is significant
      if (Math.abs(flickVelocity) >= configRestThreshold) {
        startAnimation();
      }
    }
  }, [startAnimation, config]);
  
  // Stop all movement
  const stop = useCallback(() => {
    if (inertialRef.current) {
      inertialRef.current.stop();
      
      // Update states
      setVelocityState(0);
      setIsMoving(false);
      
      // Cancel animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, []);
  
  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<InertialConfig> | keyof typeof InertialPresets) => {
    if (inertialRef.current) {
      const configObject = typeof newConfig === 'string' 
        ? InertialPresets[newConfig] 
        : newConfig;
        
      inertialRef.current.updateConfig(configObject);
    }
  }, []);
  
  return {
    position,
    velocity,
    isMoving,
    setPosition,
    addVelocity,
    flick,
    stop,
    updateConfig
  };
} 