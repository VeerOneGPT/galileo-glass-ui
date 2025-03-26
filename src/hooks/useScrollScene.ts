/**
 * useScrollScene Hook
 *
 * Hook for creating scroll-triggered animations with physics effects
 */
import { useState, useEffect, useRef, useCallback } from 'react';

import { SpringAnimationOptions } from '../animations/utils/types';

import { useReducedMotion } from './useReducedMotion';

interface ScrollTrigger {
  /**
   * Scroll position to start the animation (0-1)
   */
  start: number;

  /**
   * Scroll position to end the animation (0-1)
   */
  end: number;

  /**
   * Whether to reverse the animation when scrolling up
   */
  reverse?: boolean;

  /**
   * Offset in pixels to add to the scroll position
   */
  offset?: number;
}

interface ScrollElementOptions {
  /**
   * Type of animation to apply
   */
  type: 'fade' | 'slide' | 'scale' | 'custom';

  /**
   * Direction for slide animations
   */
  direction?: 'up' | 'down' | 'left' | 'right';

  /**
   * Custom animation function
   */
  customAnimation?: (progress: number) => string;

  /**
   * Physics properties for the animation
   */
  physics?: {
    /**
     * Whether to enable physics-based interpolation
     */
    enabled: boolean;

    /**
     * Mass of the object (higher = more inertia)
     */
    mass?: number;

    /**
     * Stiffness of the spring (higher = faster)
     */
    stiffness?: number;

    /**
     * Damping ratio (1 = critically damped, <1 = bouncy, >1 = overdamped)
     */
    dampingRatio?: number;

    /**
     * Initial velocity (pixels/ms)
     */
    initialVelocity?: number;
  };

  /**
   * Trigger points for the animation
   */
  trigger: ScrollTrigger;

  /**
   * Delay before animation starts (seconds)
   */
  delay?: number;
}

/**
 * Calculate spring physics for a value
 *
 * @param target Target value
 * @param current Current value
 * @param velocity Current velocity
 * @param options Spring options
 * @returns [newValue, newVelocity]
 */
const calculateSpring = (
  target: number,
  current: number,
  velocity: number,
  options: SpringAnimationOptions
): [number, number] => {
  const { mass = 1, stiffness = 170, dampingRatio = 0.8, initialVelocity = 0 } = options;

  // Calculate damping from damping ratio
  const damping = dampingRatio * 2 * Math.sqrt(mass * stiffness);

  // Calculate spring force
  const springForce = stiffness * (target - current);

  // Calculate damping force
  const dampingForce = damping * velocity;

  // Calculate acceleration
  const acceleration = (springForce - dampingForce) / mass;

  // Calculate new velocity (simple Euler integration)
  const deltaTime = 0.016; // ~60fps
  const newVelocity = velocity + acceleration * deltaTime;

  // Calculate new position
  const newPosition = current + newVelocity * deltaTime;

  return [newPosition, newVelocity];
};

/**
 * Hook for creating scroll-triggered element animations with physics
 *
 * @param elementId ID of the element to animate
 * @param options Animation options
 * @returns Object with ref and styles for the animated element
 */
export const useScrollElement = (elementId: string, options: ScrollElementOptions) => {
  // Reference to the element
  const elementRef = useRef<HTMLElement | null>(null);

  // State for animation progress
  const [progress, setProgress] = useState(0);

  // State for animation styles
  const [styles, setStyles] = useState('');

  // Animation state
  const animationState = useRef({
    current: 0,
    velocity: 0,
    isVisible: false,
    hasTriggered: false,
    lastFrameTime: 0,
  });

  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Animation frame reference
  const animationFrameRef = useRef<number | null>(null);

  // Generate styles based on animation type and progress
  const generateStyles = useCallback(
    (animationProgress: number) => {
      const { type, direction = 'up', customAnimation } = options;

      // For reduced motion preference, use simpler animations
      if (prefersReducedMotion) {
        switch (type) {
          case 'fade':
            return `opacity: ${animationProgress};`;
          case 'slide':
          case 'scale':
            return `opacity: ${animationProgress};`;
          case 'custom':
            return customAnimation ? customAnimation(animationProgress) : '';
          default:
            return '';
        }
      }

      // Standard animations
      switch (type) {
        case 'fade':
          return `opacity: ${animationProgress};`;
        case 'slide': {
          const distance = 50 * (1 - animationProgress);
          switch (direction) {
            case 'up':
              return `opacity: ${animationProgress}; transform: translateY(${distance}px);`;
            case 'down':
              return `opacity: ${animationProgress}; transform: translateY(-${distance}px);`;
            case 'left':
              return `opacity: ${animationProgress}; transform: translateX(${distance}px);`;
            case 'right':
              return `opacity: ${animationProgress}; transform: translateX(-${distance}px);`;
            default:
              return `opacity: ${animationProgress}; transform: translateY(${distance}px);`;
          }
        }
        case 'scale':
          const scale = 0.8 + 0.2 * animationProgress;
          return `opacity: ${animationProgress}; transform: scale(${scale});`;
        case 'custom':
          return customAnimation ? customAnimation(animationProgress) : '';
        default:
          return '';
      }
    },
    [options, prefersReducedMotion]
  );

  // Update animation loop
  const updateAnimation = useCallback(() => {
    if (!elementRef.current) return;

    const { physics } = options;

    // Calculate time delta
    const now = performance.now();
    const deltaTime = now - animationState.current.lastFrameTime;
    animationState.current.lastFrameTime = now;

    if (physics && physics.enabled) {
      // Apply spring physics to create smooth animation
      const [newProgress, newVelocity] = calculateSpring(
        progress,
        animationState.current.current,
        animationState.current.velocity,
        {
          mass: physics.mass,
          stiffness: physics.stiffness,
          dampingRatio: physics.dampingRatio,
          initialVelocity: physics.initialVelocity,
        }
      );

      // Update animation state
      animationState.current.current = newProgress;
      animationState.current.velocity = newVelocity;

      // Generate styles
      const newStyles = generateStyles(newProgress);
      setStyles(newStyles);

      // Apply styles directly for smoother animation
      Object.assign(elementRef.current.style, {
        opacity: String(newProgress),
        transform: `translateY(${50 * (1 - newProgress)}px)`,
      });

      // Continue animation if still moving
      const isStillMoving =
        Math.abs(newProgress - progress) > 0.001 || Math.abs(newVelocity) > 0.001;

      if (isStillMoving) {
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
      } else {
        animationFrameRef.current = null;
      }
    } else {
      // Direct animation without physics
      animationState.current.current = progress;

      // Generate styles
      const newStyles = generateStyles(progress);
      setStyles(newStyles);

      // Apply styles directly
      if (elementRef.current) {
        elementRef.current.style.cssText = newStyles;
      }

      animationFrameRef.current = null;
    }
  }, [options, progress, generateStyles]);

  // Start animation loop
  const startAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationState.current.lastFrameTime = performance.now();
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, [updateAnimation]);

  // Check if element is in viewport
  const checkVisibility = useCallback(() => {
    if (!elementRef.current) return;

    const {
      trigger: { start, end, reverse = true, offset = 0 },
    } = options;

    // Calculate element position relative to viewport
    const rect = elementRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate scroll progress (0-1)
    const startPosition = windowHeight * start - offset;
    const endPosition = windowHeight * end - offset;
    const elementPosition = rect.top + rect.height / 2;

    let scrollProgress = 1;

    if (elementPosition > startPosition) {
      scrollProgress = 0;
    } else if (elementPosition < endPosition) {
      scrollProgress = 1;
    } else {
      scrollProgress = (startPosition - elementPosition) / (startPosition - endPosition);
    }

    // Clamp progress to 0-1
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));

    // Update element visibility
    const isCurrentlyVisible = scrollProgress > 0;

    // If element is becoming visible
    if (isCurrentlyVisible && !animationState.current.isVisible) {
      animationState.current.isVisible = true;

      // Only trigger animation once if reverse is false
      if (!animationState.current.hasTriggered || reverse) {
        animationState.current.hasTriggered = true;

        // Apply the delay if specified
        if (options.delay && options.delay > 0) {
          setTimeout(() => setProgress(scrollProgress), options.delay * 1000);
        } else {
          setProgress(scrollProgress);
        }

        // Start animation loop
        startAnimation();
      }
    }
    // If element is becoming invisible and reverse is true
    else if (!isCurrentlyVisible && animationState.current.isVisible && reverse) {
      animationState.current.isVisible = false;
      setProgress(scrollProgress);

      // Start animation loop
      startAnimation();
    }
    // If element is visible and progress changed
    else if (isCurrentlyVisible && Math.abs(progress - scrollProgress) > 0.01) {
      setProgress(scrollProgress);

      // Start animation loop
      startAnimation();
    }
  }, [options, progress, startAnimation]);

  // Initialize element reference and scroll listener
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (element) {
      elementRef.current = element;

      // Set initial visibility to invisible
      if (prefersReducedMotion) {
        // With reduced motion, start visible
        setProgress(1);
        setStyles(generateStyles(1));
      } else {
        // Initially invisible
        setProgress(0);
        setStyles(generateStyles(0));
      }

      // Add scroll event listener
      const handleScroll = () => {
        window.requestAnimationFrame(checkVisibility);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      // Check initial visibility
      checkVisibility();

      // Clean up
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [elementId, checkVisibility, generateStyles, prefersReducedMotion]);

  return {
    ref: elementRef,
    styles,
    progress,
  };
};

/**
 * Creates an orchestrated scroll scene with multiple animated elements
 *
 * @param elements Array of element configurations
 * @returns Object with methods to manipulate the scene
 */
export const useScrollScene = (
  elements: Array<{
    id: string;
    options: ScrollElementOptions;
  }>
) => {
  // Create refs for elements
  const elementRefs = useRef<Record<string, HTMLElement | null>>({});

  // State for scene progress
  const [sceneProgress, setSceneProgress] = useState(0);

  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Update scene progress on scroll
  useEffect(() => {
    // Only apply scroll effects if reduced motion is not preferred
    if (prefersReducedMotion) {
      // With reduced motion, show all elements immediately
      setSceneProgress(1);
      return;
    }

    const handleScroll = () => {
      // Calculate overall scene progress based on scroll position
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const newProgress = Math.min(1, Math.max(0, scrollPosition / documentHeight));

      setSceneProgress(newProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prefersReducedMotion]);

  // Register elements
  const registerElement = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      elementRefs.current[id] = element;
    }
  }, []);

  return {
    registerElement,
    sceneProgress,
    elementRefs: elementRefs.current,
  };
};
