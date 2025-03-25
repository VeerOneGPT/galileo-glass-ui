import { useRef, useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type ZPlane = 'foreground' | 'midground' | 'background' | number;

export interface ZSpaceAnimationOptions {
  /**
   * The Z-plane for the element (foreground, midground, background, or custom number)
   */
  plane?: ZPlane;
  
  /**
   * If true, the element will move in response to mouse movement
   */
  interactive?: boolean;
  
  /**
   * The amount of parallax effect (0-1)
   */
  intensity?: number;
  
  /**
   * If true, the element will have a subtle floating animation
   */
  floating?: boolean;
  
  /**
   * If true, the effect will be applied on scroll rather than mouse movement
   */
  scrollBased?: boolean;
  
  /**
   * The depth in pixels for 3D perspective
   */
  perspectiveDepth?: number;
  
  /**
   * If true, the animation will be disabled
   */
  disabled?: boolean;
  
  /**
   * If true, disable the animation in reduced motion mode
   */
  respectReducedMotion?: boolean;
  
  /**
   * Optional root element to use for mouse tracking (defaults to window)
   */
  rootElement?: React.RefObject<HTMLElement>;
}

interface ZSpaceStyles {
  transform: string;
  transition: string;
  zIndex: number;
  willChange: string;
}

const planeToZIndex = (plane: ZPlane): number => {
  if (typeof plane === 'number') {
    return Math.max(1, Math.min(999, Math.round(plane)));
  }
  
  switch (plane) {
    case 'foreground': return 10;
    case 'midground': return 5;
    case 'background': return 1;
    default: return 5;
  }
};

const planeToIntensity = (plane: ZPlane, baseIntensity: number = 0.1): number => {
  if (typeof plane === 'number') {
    // Convert plane number to an intensity value (higher plane = more movement)
    return Math.max(0, Math.min(1, baseIntensity * (plane / 10)));
  }
  
  switch (plane) {
    case 'foreground': return baseIntensity * 2; // More movement
    case 'midground': return baseIntensity;
    case 'background': return baseIntensity * 0.5; // Less movement
    default: return baseIntensity;
  }
};

/**
 * Hook for creating Z-space (parallax) animations
 * 
 * This hook adds 3D perspective and depth to elements, creating a 
 * sense of parallax based on mouse movement or scroll position.
 */
export const useZSpaceAnimation = (options: ZSpaceAnimationOptions = {}): {
  ref: React.RefObject<HTMLElement>;
  style: ZSpaceStyles;
  isPerspectiveActive: boolean;
} => {
  const {
    plane = 'midground',
    interactive = true,
    intensity = 0.1,
    floating = false,
    scrollBased = false,
    perspectiveDepth = 1000,
    disabled = false,
    respectReducedMotion = true,
    rootElement,
  } = options;
  
  const elementRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInView, setIsInView] = useState(false);
  
  // Calculate the zIndex based on the plane
  const zIndex = planeToZIndex(plane);
  
  // Determine if animations should be active
  const isAnimationDisabled = disabled || (respectReducedMotion && prefersReducedMotion);
  
  // Mouse move handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isAnimationDisabled || !interactive || !elementRef.current || scrollBased) {
      return;
    }
    
    // Get the bounds of the container (window or custom root element)
    let containerWidth = window.innerWidth;
    let containerHeight = window.innerHeight;
    let containerLeft = 0;
    let containerTop = 0;
    
    // If a custom root element is provided, use its bounds
    if (rootElement && rootElement.current) {
      const rect = rootElement.current.getBoundingClientRect();
      containerWidth = rect.width;
      containerHeight = rect.height;
      containerLeft = rect.left;
      containerTop = rect.top;
    }
    
    // Calculate the mouse position relative to the center of the container
    const mouseX = ((event.clientX - containerLeft) / containerWidth) * 2 - 1;
    const mouseY = ((event.clientY - containerTop) / containerHeight) * 2 - 1;
    
    // Apply the intensity based on the plane
    const effectiveIntensity = planeToIntensity(plane, intensity);
    
    // Set the position for the parallax effect
    setPosition({
      x: mouseX * effectiveIntensity * 30, // Scale to make the effect more visible
      y: mouseY * effectiveIntensity * 30,
    });
  }, [isAnimationDisabled, interactive, scrollBased, rootElement, plane, intensity]);
  
  // Scroll handler
  const handleScroll = useCallback(() => {
    if (isAnimationDisabled || !scrollBased || !elementRef.current) {
      return;
    }
    
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Calculate how far the element is from the top of the document
    const rect = elementRef.current.getBoundingClientRect();
    const elementTop = rect.top + scrollPosition;
    
    // Calculate the percentage of the scroll position relative to the element
    const scrollPercentage = (scrollPosition - elementTop + windowHeight) / (windowHeight + rect.height);
    
    // Apply the intensity based on the plane
    const effectiveIntensity = planeToIntensity(plane, intensity);
    
    // Set the position for the parallax effect
    setPosition({
      x: 0,
      y: (scrollPercentage - 0.5) * effectiveIntensity * 100, // Scale for better visibility
    });
  }, [isAnimationDisabled, scrollBased, plane, intensity]);
  
  // Intersection observer to detect when the element is in view
  useEffect(() => {
    if (!elementRef.current || isAnimationDisabled) {
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(elementRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [isAnimationDisabled]);
  
  // Set up event listeners
  useEffect(() => {
    if (isAnimationDisabled) {
      return;
    }
    
    if (interactive && !scrollBased) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    if (scrollBased) {
      window.addEventListener('scroll', handleScroll);
      // Initial calculation
      handleScroll();
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAnimationDisabled, interactive, scrollBased, handleMouseMove, handleScroll]);
  
  // Generate floating animation styles
  const floatingTransform = useCallback(() => {
    if (!floating || isAnimationDisabled) {
      return '';
    }
    
    const floatAmount = planeToIntensity(plane, intensity) * 10;
    
    return `
      @keyframes floating {
        0% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(0, ${floatAmount}px, 0); }
        100% { transform: translate3d(0, 0, 0); }
      }
    `;
  }, [floating, isAnimationDisabled, plane, intensity]);
  
  // Determine the CSS transform based on position and options
  const transform = isAnimationDisabled || !isInView
    ? 'translate3d(0, 0, 0)'
    : `translate3d(${position.x}px, ${position.y}px, 0)`;
  
  // Determine if perspective should be active
  const isPerspectiveActive = !isAnimationDisabled && isInView;
  
  // Create the style object
  const style: ZSpaceStyles = {
    transform,
    transition: interactive ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
    zIndex,
    willChange: isAnimationDisabled ? 'auto' : 'transform',
  };
  
  // Add floating animation if enabled
  if (floating && !isAnimationDisabled && isInView) {
    const floatAmount = planeToIntensity(plane, intensity) * 10;
    const floatDuration = 3 + Math.random() * 2; // Random duration between 3-5s
    
    style.transform += ` translate3d(0, ${Math.sin(Date.now() / 1000) * floatAmount}px, 0)`;
    style.transition = `transform ${floatDuration}s ease-in-out`;
  }
  
  return {
    ref: elementRef as React.RefObject<HTMLElement>,
    style,
    isPerspectiveActive
  };
};

export default useZSpaceAnimation;