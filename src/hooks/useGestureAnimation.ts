import { useRef, useEffect, useState, RefObject } from 'react';
import { 
  GestureAnimation, 
  GestureAnimationConfig, 
  GestureTransform,
  GestureAnimationPreset
} from '../animations/physics/gestures/GestureAnimation';
import { GestureType, GestureEventData } from '../animations/physics/gestures/GestureDetector';
import { useReducedMotion } from './useReducedMotion';

interface UseGestureAnimationOptions extends Omit<GestureAnimationConfig, 'element'> {
  ref: RefObject<HTMLElement>;
  enabled?: boolean;
  respectReducedMotion?: boolean;
  onTransformChange?: (transform: GestureTransform) => void;
}

interface UseGestureAnimationReturn {
  transform: GestureTransform;
  setTransform: (transform: Partial<GestureTransform>) => void;
  animateTo: (transform: Partial<GestureTransform>) => void;
  reset: (animate?: boolean) => void;
  isActive: boolean;
}

/**
 * React hook for integrating gesture animations into components
 * 
 * @param options Configuration options for the gesture animation
 * @returns Object with current transform state and control functions
 */
export function useGestureAnimation(
  options: UseGestureAnimationOptions
): UseGestureAnimationReturn {
  const { ref, enabled = true, respectReducedMotion = true, onTransformChange, ...config } = options;
  
  // Get reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  const shouldUseReducedMotion = respectReducedMotion && prefersReducedMotion;
  
  // Refs for gesture animation instance and element
  const gestureAnimationRef = useRef<GestureAnimation | null>(null);
  
  // State to track current transform and activity
  const [transform, setTransformState] = useState<GestureTransform>({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotation: 0,
    velocity: { x: 0, y: 0 }
  });
  
  const [isActive, setIsActive] = useState(false);
  
  // Initialize and clean up gesture animation
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    
    // Modify config for reduced motion if needed
    const finalConfig: GestureAnimationConfig = {
      ...config,
      element,
      // Adjust physics parameters for reduced motion
      ...(shouldUseReducedMotion ? {
        tension: (config.tension || 180) * 1.5,  // Higher tension for quicker settling
        friction: (config.friction || 12) * 1.5, // Higher friction for less bouncing
        velocityScale: ((config.velocityScale || 1) * 0.5), // Reduce velocity for gentler motion
        translateMultiplier: ((config.translateMultiplier || 1) * 0.7), // Reduce movement distance
        scaleMultiplier: ((config.scaleMultiplier || 0.01) * 0.7), // Reduce scaling
        rotateMultiplier: ((config.rotateMultiplier || 1) * 0.5) // Reduce rotation
      } : {}),
      // Wrap callbacks to track activity and update state
      onGestureStart: (data: GestureEventData) => {
        setIsActive(true);
        config.onGestureStart?.(data);
      },
      onGestureEnd: (data: GestureEventData, transform: GestureTransform) => {
        setIsActive(false);
        config.onGestureEnd?.(data, transform);
      },
      onTransformChange: (newTransform: GestureTransform) => {
        setTransformState(newTransform);
        onTransformChange?.(newTransform);
      }
    };
    
    // Create gesture animation instance
    const gestureAnimation = new GestureAnimation(finalConfig);
    gestureAnimationRef.current = gestureAnimation;
    
    // Initial transform state
    setTransformState(gestureAnimation.getTransform());
    
    // Clean up
    return () => {
      gestureAnimation.destroy();
      gestureAnimationRef.current = null;
    };
  }, [
    ref, enabled, shouldUseReducedMotion,
    // Only re-create if these important config properties change
    config.preset,
    config.gestures?.join(','),
    config.boundaries
  ]);
  
  // Update transform 
  const setTransform = (newTransform: Partial<GestureTransform>) => {
    if (gestureAnimationRef.current) {
      gestureAnimationRef.current.setTransform(newTransform);
    }
  };
  
  // Animate to new transform
  const animateTo = (newTransform: Partial<GestureTransform>) => {
    if (gestureAnimationRef.current) {
      gestureAnimationRef.current.animateTo(newTransform);
    }
  };
  
  // Reset to initial transform
  const reset = (animate = true) => {
    if (gestureAnimationRef.current) {
      gestureAnimationRef.current.reset(animate && !shouldUseReducedMotion);
    }
  };
  
  return {
    transform,
    setTransform,
    animateTo,
    reset,
    isActive
  };
}

/**
 * Preset configurations for common gesture animation patterns
 */
export const GestureAnimationPresets = GestureAnimationPreset;

/**
 * Export gesture types for easier usage
 */
export const GestureTypes = GestureType;