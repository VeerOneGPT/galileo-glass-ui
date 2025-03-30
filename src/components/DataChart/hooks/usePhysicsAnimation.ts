/**
 * usePhysicsAnimation Hook
 * 
 * A hook that provides physics-based animations for UI elements.
 * Based on spring physics for natural, responsive animations.
 */
import { useState, useRef, useEffect } from 'react';
import { useAccessibilitySettings } from '../../../hooks/useAccessibilitySettings';

// Type of animation
export type AnimationType = 'spring' | 'inertia' | 'none';

// Animation properties with physics parameters
export interface PhysicsAnimationProps {
  // Animation type
  type: AnimationType;
  // Spring stiffness (force constant k in physics)
  stiffness: number;
  // Damping coefficient
  damping: number;
  // Mass of the object being animated
  mass: number;
  // Initial velocity
  initialVelocity?: number;
  // Whether to adapt animation based on device performance
  adaptiveMotion?: boolean;
  // Whether to respect user's reduced motion preferences
  respectReducedMotion?: boolean;
  // Precision for stopping the animation
  precision?: number;
}

// Default physics parameters
const DEFAULT_PARAMS: PhysicsAnimationProps = {
  type: 'spring',
  stiffness: 170,
  damping: 26,
  mass: 1,
  initialVelocity: 0,
  adaptiveMotion: true,
  respectReducedMotion: true,
  precision: 0.01
};

/**
 * Hook providing physics-based animations with spring dynamics.
 * Returns animation value, isAnimating flag, ref to be attached to the target element,
 * and apply* methods to trigger different animations.
 */
export const usePhysicsAnimation = (props: Partial<PhysicsAnimationProps> = {}) => {
  // Merge default parameters with provided props
  const params: PhysicsAnimationProps = { ...DEFAULT_PARAMS, ...props };
  
  // Check for reduced motion preference
  const { isReducedMotion } = useAccessibilitySettings();
  const shouldReduceMotion = isReducedMotion && params.respectReducedMotion;
  
  // Animation state
  const [value, setValue] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Animation frame references
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Physics state
  const physicsRef = useRef({
    position: 1,
    velocity: params.initialVelocity || 0,
    target: 1
  });
  
  // Element reference
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  /**
   * Performs one step of the spring physics simulation
   */
  const updateSpringAnimation = (time: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
      animationRef.current = requestAnimationFrame(updateSpringAnimation);
      return;
    }
    
    // Time delta in seconds (clamped to avoid large jumps if browser throttles)
    const deltaTime = Math.min(0.064, (time - lastTimeRef.current) / 1000);
    lastTimeRef.current = time;
    
    // Get current state
    const { position, velocity, target } = physicsRef.current;
    
    // Calculate spring force: F = -k * (position - target)
    const springForce = -params.stiffness * (position - target);
    
    // Calculate damping force: F = -c * velocity
    const dampingForce = -params.damping * velocity;
    
    // Total force
    const force = springForce + dampingForce;
    
    // Acceleration: F = ma, so a = F/m
    const acceleration = force / params.mass;
    
    // Update velocity: v = v0 + a*t
    const newVelocity = velocity + acceleration * deltaTime;
    
    // Update position: p = p0 + v*t
    const newPosition = position + newVelocity * deltaTime;
    
    // Update physics state
    physicsRef.current = {
      position: newPosition,
      velocity: newVelocity,
      target
    };
    
    // Update the animation value
    setValue(newPosition);
    
    // Check if animation has settled
    const isSettled = 
      Math.abs(newPosition - target) < (params.precision || 0.01) && 
      Math.abs(newVelocity) < (params.precision || 0.01);
    
    if (isSettled) {
      // Snap exactly to target
      setValue(target);
      physicsRef.current.position = target;
      physicsRef.current.velocity = 0;
      setIsAnimating(false);
      animationRef.current = null;
    } else {
      // Continue animation
      animationRef.current = requestAnimationFrame(updateSpringAnimation);
    }
  };
  
  /**
   * Start the animation with given parameters
   */
  const startAnimation = (targetValue: number) => {
    // If reduced motion is preferred and we respect it, jump directly to target
    if (shouldReduceMotion) {
      setValue(targetValue);
      physicsRef.current = {
        position: targetValue,
        velocity: 0,
        target: targetValue
      };
      return;
    }
    
    // Set target for the physics simulation
    physicsRef.current.target = targetValue;
    
    // Indicate animation is running
    setIsAnimating(true);
    
    // Start animation loop if not already running
    if (!animationRef.current) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(updateSpringAnimation);
    }
  };
  
  /**
   * Apply a pop animation (scale from small to normal)
   */
  const applyPopIn = () => {
    if (params.type === 'none') return;
    
    physicsRef.current = {
      ...physicsRef.current,
      position: 0.6,
      velocity: 0
    };
    
    startAnimation(1);
  };
  
  /**
   * Apply an oscillation effect (like shaking or pulsing)
   */
  const applyOscillation = (intensity: number = 1) => {
    if (params.type === 'none') return;
    
    // Get current position and add a burst of velocity
    const currentPosition = physicsRef.current.position;
    physicsRef.current = {
      ...physicsRef.current,
      position: currentPosition,
      velocity: 8 * intensity * (shouldReduceMotion ? 0.2 : 1)
    };
    
    startAnimation(1);
  };
  
  /**
   * Apply a rebound animation (stretch and bounce back)
   */
  const applyRebound = (intensity: number = 1) => {
    if (params.type === 'none') return;
    
    // Set position beyond target to create stretch effect
    physicsRef.current = {
      ...physicsRef.current,
      position: 1 + (0.2 * intensity),
      velocity: 0
    };
    
    startAnimation(1);
  };
  
  /**
   * Handle resize events for adaptive motion
   */
  useEffect(() => {
    if (!params.adaptiveMotion) return;
    
    const handleResize = () => {
      // Adjust animation based on viewport size 
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Use gentler animations on mobile
        params.stiffness = Math.max(100, params.stiffness * 0.8);
        params.damping = params.damping * 1.2;
      }
    };
    
    // Initial adjustment
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [params.adaptiveMotion]);
  
  // Return the animation value, isAnimating flag, and the element ref
  return {
    value,
    isAnimating,
    ref: elementRef,
    applyPopIn,
    applyOscillation,
    applyRebound,
    start: startAnimation,
    style: {
      transform: `scale(${value})`,
      transformOrigin: 'center'
    }
  };
};

export default usePhysicsAnimation; 