/**
 * useParallax.ts
 * 
 * React hook for creating parallax scrolling or pointer-based effects.
 * Moves an element at a different rate relative to scroll or pointer movement.
 */

import React, { useState, useMemo, useRef, useEffect, RefObject, CSSProperties, useCallback } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';

/**
 * Parallax effect trigger type
 */
export enum ParallaxTrigger {
  SCROLL = 'scroll',
  POINTER = 'pointer'
}

/**
 * Parallax effect axis
 */
export enum ParallaxAxis {
  X = 'x',
  Y = 'y',
  BOTH = 'both'
}

/**
 * Configuration options for the useParallax hook
 */
export interface ParallaxOptions {
  /** 
   * Parallax factor determines how much the element moves relative to the trigger.
   * - Positive values move in the same direction but slower (e.g., 0.2 = 20% speed).
   * - Negative values move in the opposite direction (e.g., -0.1 = 10% speed opposite).
   * - Value of 0 means no parallax.
   * Default: 0.1
   */
  factor?: number;
  
  /** 
   * Trigger for the parallax effect.
   * Default: ParallaxTrigger.SCROLL
   */
  trigger?: ParallaxTrigger;
  
  /**
   * Axis or axes the parallax effect should apply to.
   * Default: ParallaxAxis.Y for SCROLL, ParallaxAxis.BOTH for POINTER
   */
  axis?: ParallaxAxis;
  
  /**
   * Reference to the scroll container element (if trigger is SCROLL and not window).
   */
  scrollContainerRef?: RefObject<HTMLElement>;
  
  /**
   * Reference to the pointer container element (if trigger is POINTER and not window).
   */
  pointerContainerRef?: RefObject<HTMLElement>;
  
  /**
   * Limits for the parallax translation (in pixels).
   */
  limits?: {
    x?: { min?: number; max?: number };
    y?: { min?: number; max?: number };
  };
  
  /**
   * Smoothing factor for pointer movement (0-1, lower = smoother). Only for POINTER trigger.
   * Default: 0.1
   */
  smoothing?: number;

  /**
   * Whether to respect user's reduced motion preference.
   * Default: true
   */
  respectReducedMotion?: boolean;
}

/**
 * Result of the useParallax hook
 */
export interface ParallaxResult<T extends HTMLElement = HTMLElement> {
  /** Ref to attach to the target element */
  elementRef: RefObject<T>;
  /** CSS style object with transform to apply */
  style: CSSProperties;
  /** Current parallax translation */
  translate: { x: number; y: number };
}

// Helper to get scroll position
const getScrollPosition = (element?: HTMLElement | Window): { scrollX: number; scrollY: number } => {
  if (!element) {
    return { scrollX: 0, scrollY: 0 };
  }
  if (element === window) {
    return { scrollX: window.scrollX, scrollY: window.scrollY };
  }
  return { 
    scrollX: (element as HTMLElement).scrollLeft,
    scrollY: (element as HTMLElement).scrollTop 
  };
};

/**
 * Hook to apply parallax effect to an element based on scroll or pointer movement.
 *
 * @param options Configuration options
 * @returns ParallaxResult containing refs and styles
 */
export function useParallax<T extends HTMLElement = HTMLElement>(
  options: ParallaxOptions = {}
): ParallaxResult<T> {
  const {
    factor = 0.1,
    trigger = ParallaxTrigger.SCROLL,
    axis = trigger === ParallaxTrigger.SCROLL ? ParallaxAxis.Y : ParallaxAxis.BOTH,
    scrollContainerRef,
    pointerContainerRef,
    limits,
    smoothing = 0.1,
    respectReducedMotion = true,
  } = options;

  const elementRef = useRef<T>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ x: number, y: number } | null>(null);
  const currentSmoothPositionRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const { prefersReducedMotion } = useReducedMotion();
  const isDisabled = respectReducedMotion && prefersReducedMotion;

  // Main effect loop for calculating and applying transform
  useEffect(() => {
    if (isDisabled) {
        // Reset transform if disabled
        setTranslate({ x: 0, y: 0 });
        return;
    }

    const targetElement = elementRef.current;
    if (!targetElement) return;

    const scrollTarget = scrollContainerRef?.current ?? window;
    const pointerTarget = pointerContainerRef?.current ?? window;

    const calculateParallax = (currentX: number, currentY: number) => {
      if (lastPositionRef.current === null) {
        lastPositionRef.current = { x: currentX, y: currentY };
        currentSmoothPositionRef.current = { x: 0, y: 0 }; // Initialize smooth position too
        setTranslate({ x: 0, y: 0 }); // Ensure initial state is zero
        return; // Initialize on first run
      }

      const deltaX = currentX - lastPositionRef.current.x;
      const deltaY = currentY - lastPositionRef.current.y;
      
      // Update reference for next frame BEFORE applying factor
      lastPositionRef.current = { x: currentX, y: currentY };

      // Calculate target parallax translation based on current state + delta
      let currentTranslateX = (trigger === ParallaxTrigger.POINTER) ? currentSmoothPositionRef.current.x : translate.x;
      let currentTranslateY = (trigger === ParallaxTrigger.POINTER) ? currentSmoothPositionRef.current.y : translate.y;

      let targetTranslateX = currentTranslateX + (axis === ParallaxAxis.X || axis === ParallaxAxis.BOTH ? deltaX * factor : 0);
      let targetTranslateY = currentTranslateY + (axis === ParallaxAxis.Y || axis === ParallaxAxis.BOTH ? deltaY * factor : 0);
      
      // Apply limits
      if (limits) {
        if (limits.x) {
          targetTranslateX = Math.max(limits.x.min ?? -Infinity, Math.min(limits.x.max ?? Infinity, targetTranslateX));
        }
        if (limits.y) {
          targetTranslateY = Math.max(limits.y.min ?? -Infinity, Math.min(limits.y.max ?? Infinity, targetTranslateY));
        }
      }
      
      // Apply smoothing for pointer movement or set directly for scroll
      if (trigger === ParallaxTrigger.POINTER) {
          currentSmoothPositionRef.current.x += (targetTranslateX - currentSmoothPositionRef.current.x) * smoothing;
          currentSmoothPositionRef.current.y += (targetTranslateY - currentSmoothPositionRef.current.y) * smoothing;
          // Check for minimal change to avoid unnecessary updates
          if (Math.abs(currentSmoothPositionRef.current.x - translate.x) > 0.01 || Math.abs(currentSmoothPositionRef.current.y - translate.y) > 0.01) {
            setTranslate({ x: currentSmoothPositionRef.current.x, y: currentSmoothPositionRef.current.y });
          }
      } else {
          // Apply directly for scroll
          if (Math.abs(targetTranslateX - translate.x) > 0.01 || Math.abs(targetTranslateY - translate.y) > 0.01) {
            setTranslate({ x: targetTranslateX, y: targetTranslateY });
          }
      }
    };

    // --- Event Handlers ---
    const handleScroll = () => {
      const { scrollX, scrollY } = getScrollPosition(scrollTarget as HTMLElement | Window);
      if (rafRef.current === null) { // Throttle using rAF
          rafRef.current = requestAnimationFrame(() => {
              calculateParallax(scrollX, scrollY);
              rafRef.current = null;
          });
      }
    };

    const handlePointerMove = (event: MouseEvent | PointerEvent) => {
      let currentX = event.clientX;
      let currentY = event.clientY;

      // Adjust if relative to a container
      if (pointerContainerRef?.current && pointerTarget !== window) {
         const rect = (pointerTarget as HTMLElement).getBoundingClientRect();
         currentX = event.clientX - rect.left;
         currentY = event.clientY - rect.top;
      }

      if (rafRef.current === null) { // Throttle using rAF
          rafRef.current = requestAnimationFrame(() => {
              calculateParallax(currentX, currentY);
              rafRef.current = null;
          });
      }
    };
    
    // Reset last position on trigger change
    lastPositionRef.current = null;

    // Attach listeners based on trigger
    if (trigger === ParallaxTrigger.SCROLL) {
      // Initial position calculation for scroll
      handleScroll(); 
      scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      // Initial position calculation for pointer
      // We need an initial event position, using center of container or window
      let initialX = window.innerWidth / 2;
      let initialY = window.innerHeight / 2;
      if (pointerContainerRef?.current && pointerTarget !== window) {
          const rect = (pointerTarget as HTMLElement).getBoundingClientRect();
          initialX = rect.width / 2;
          initialY = rect.height / 2;
      }
      // Simulate an initial move to establish baseline
      calculateParallax(initialX, initialY);
       
      const eventType = ('PointerEvent' in window) ? 'pointermove' : 'mousemove';
      pointerTarget.addEventListener(eventType, handlePointerMove as EventListener, { passive: true });
    }

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (trigger === ParallaxTrigger.SCROLL) {
        scrollTarget.removeEventListener('scroll', handleScroll);
      } else {
        const eventType = ('PointerEvent' in window) ? 'pointermove' : 'mousemove';
        pointerTarget.removeEventListener(eventType, handlePointerMove as EventListener);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled, trigger, axis, factor, scrollContainerRef, pointerContainerRef, limits, smoothing]); // Rerun effect if options change

  // Calculate style memo
  const style = useMemo((): CSSProperties => ({
    // Use translate3d for hardware acceleration
    transform: `translate3d(${translate.x.toFixed(2)}px, ${translate.y.toFixed(2)}px, 0)`,
    willChange: isDisabled ? 'auto' : 'transform',
  }), [translate, isDisabled]);

  return {
    elementRef,
    style,
    translate,
  };
}

export default useParallax; 