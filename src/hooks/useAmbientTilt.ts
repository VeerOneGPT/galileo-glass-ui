import React, { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface AmbientTiltOptions {
  /** Maximum rotation around the X-axis in degrees. */
  maxRotateX?: number; 
  /** Maximum rotation around the Y-axis in degrees. */
  maxRotateY?: number; 
  /** Distance (in pixels) from viewport center where effect starts to fade. 0 means full effect always. */
  influenceRange?: number; 
   /** Smoothing factor for the interpolation (0 to 1). Lower values mean smoother/slower interpolation. */
  smoothingFactor?: number; 
  /** Whether the effect is enabled. */
  enabled?: boolean;
  /** CSS perspective value applied for the 3D effect. */
  perspective?: number; 
}

/** Internal state for tracking hover status and potentially other interaction details. */
interface AmbientTiltState {
  isHovering: boolean;
  // Add other state properties if needed later (e.g., pointer entry point)
}

// Define default options with required type for better clarity
type RequiredAmbientTiltOptions = Required<Omit<AmbientTiltOptions, 'enabled'>> & Pick<AmbientTiltOptions, 'enabled'>;

const defaultOptions: RequiredAmbientTiltOptions = {
  maxRotateX: 4, // Default to subtle rotation
  maxRotateY: 6,
  influenceRange: 600, // Start fading effect 600px from center
  smoothingFactor: 0.08, // Default smoothing
  enabled: true, // Enabled by default if hook is used
  perspective: 1000, // Standard perspective default
};

/**
 * Applies a subtle tilt effect based on cursor position relative to viewport center.
 * Intended for global background elements or non-interactive large surfaces.
 */
export const useAmbientTilt = (options?: AmbientTiltOptions): { style: CSSProperties } => {
  // Merge provided options with defaults
  const config: RequiredAmbientTiltOptions = { ...defaultOptions, ...options };
  
  // Initialize style with defaults
  const [style, setStyle] = useState<React.CSSProperties>(() => ({
    perspective: `${config.perspective}px`,
    transform: 'rotateX(0deg) rotateY(0deg)',
    willChange: 'transform',
  }));
  const rafId = useRef<number | null>(null);
  const currentRotation = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Determine if the effect should be disabled
  const isDisabled = !config.enabled || prefersReducedMotion;

  // Define updateStyle callback using useRef to avoid dependency issues in useEffect
  const updateStyleCallback = useRef<() => void>(undefined);

  // Refs for DOM elements and state
  const elementRef = useRef<HTMLDivElement>(null);
  const state = useRef<AmbientTiltState>({
    isHovering: false,
  });

  useEffect(() => {
    // Define the update logic within the effect where config is stable
    updateStyleCallback.current = () => {
        // Interpolate current rotation towards target using the smoothing factor
        currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, config.smoothingFactor);
        currentRotation.current.y = lerp(currentRotation.current.y, targetRotation.current.y, config.smoothingFactor);

        // Apply perspective and rotation transform
        const transform = `perspective(${config.perspective}px) rotateX(${currentRotation.current.x.toFixed(2)}deg) rotateY(${currentRotation.current.y.toFixed(2)}deg)`;
        
        // Update style state
        setStyle({ transform, willChange: 'transform' }); // Apply transform and hint browser

        // Continue animation loop only if the rotation hasn't settled near the target
        if (Math.abs(targetRotation.current.x - currentRotation.current.x) > 0.01 || 
            Math.abs(targetRotation.current.y - currentRotation.current.y) > 0.01 ||
            // Also continue if disabled but not yet at 0 (animating back)
            (isDisabled && (Math.abs(currentRotation.current.x) > 0.01 || Math.abs(currentRotation.current.y) > 0.01)) 
            ) {
            rafId.current = requestAnimationFrame(updateStyleCallback.current);
        } else {
            rafId.current = null; // Stop the loop when settled
             // If disabled and settled at 0, ensure style is fully reset
             if (isDisabled) {
                 setStyle({});
             }
        }
    };
  }, [isDisabled, config.smoothingFactor, config.perspective]); // Dependencies for the update logic itself


  useEffect(() => {
    // --- Effect disabled handler ---
    if (isDisabled) {
      // If currently rotating, reset to non-rotated state smoothly
      if (currentRotation.current.x !== 0 || currentRotation.current.y !== 0) {
          targetRotation.current = { x: 0, y: 0 }; // Target zero rotation
          // Restart loop if not running to animate back to 0
          if (!rafId.current && updateStyleCallback.current) {
              rafId.current = requestAnimationFrame(updateStyleCallback.current);
          }
      } else {
         // Already at rest, ensure style is empty and loop is stopped
         setStyle({});
         if (rafId.current) cancelAnimationFrame(rafId.current);
         rafId.current = null;
      }
      // No need for event listener if disabled
      return; 
    }
    
    // --- Effect enabled logic --- 
    
    // Mouse move handler to calculate target rotation
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;
      
      if (innerWidth === 0 || innerHeight === 0) return;

      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const range = config.influenceRange;

      if (range > 0) {
         const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
         if (distance > range) {
             targetRotation.current.x = 0;
             targetRotation.current.y = 0;
             return; 
         }
      }
      
      const deltaXNorm = clamp(deltaX / centerX, -1, 1);
      const deltaYNorm = clamp(deltaY / centerY, -1, 1);
      
      // Correct axis mapping and signs (attempt 2)
      targetRotation.current.x = deltaYNorm * config.maxRotateX; // Positive Y mouse -> Positive X rotation
      targetRotation.current.y = -deltaXNorm * config.maxRotateY; // Positive X mouse -> Negative Y rotation
    };
    
    // Add listener and start loop if enabled
    window.addEventListener('mousemove', handleMouseMove); // Remove options object
    // Start the loop using the ref callback
    if (!rafId.current && updateStyleCallback.current) {
        rafId.current = requestAnimationFrame(updateStyleCallback.current);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove); // Remove options object
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
    // Dependencies for setting up/tearing down the effect
  }, [isDisabled, config.maxRotateX, config.maxRotateY, config.influenceRange]); // Removed perspective/smoothing from setup deps

  return { style };
};

// Helper: Clamp value between min and max
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Helper: Linear interpolation
const lerp = (start: number, end: number, amount: number): number => {
  return (1 - amount) * start + amount * end;
};
