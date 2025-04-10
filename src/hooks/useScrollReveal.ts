import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ElementType,
  CSSProperties,
  ReactNode,
  RefObject,
  MutableRefObject,
  ForwardedRef,
} from 'react';
import { useGalileoStateSpring, SpringPresets } from './useGalileoStateSpring';
import { useEnhancedReducedMotion } from './useEnhancedReducedMotion';

// --- Types ---

/**
 * Available animation effects for scroll reveal.
 */
type RevealEffect =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'none';

/**
 * Configuration options for the useScrollReveal hook and ScrollReveal component.
 */
interface ScrollRevealOptions {
  /** IntersectionObserver threshold (0-1) */
  threshold?: number;
  /** IntersectionObserver rootMargin (css margin syntax) */
  rootMargin?: string;
  /** Animate only the first time the element becomes visible? */
  triggerOnce?: boolean;
  /** Type of animation effect */
  effect?: RevealEffect;
  /** Spring animation configuration (preset name or custom object) */
  animationConfig?: string | { tension: number; friction: number; mass?: number };
}

/**
 * Props for the ScrollReveal wrapper component.
 * Extends hook options and adds component-specific props.
 */
interface ScrollRevealProps extends ScrollRevealOptions {
  /** The content to wrap and animate */
  children: ReactNode;
  /** CSS class name(s) for the wrapper element */
  className?: string;
  /** HTML tag or React component type for the wrapper */
  as?: ElementType;
  /** Allows any other props (like style, id, data-*) to be passed down */
  [key: string]: any;
}

// --- Hook Implementation ---

/**
 * Hook to apply scroll-triggered reveal animations to an element.
 *
 * @param options - Configuration for the reveal effect.
 * @returns An object containing `ref` to attach to the element and `style` to apply.
 */
export function useScrollReveal({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  effect = 'fade-up',
  animationConfig = SpringPresets.GENTLE,
}: ScrollRevealOptions = {}): { ref: RefObject<HTMLElement>; style: CSSProperties } {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useEnhancedReducedMotion();

  // Determine the effective animation effect, respecting reduced motion
  const effectiveEffect = useMemo(
    () => (prefersReducedMotion ? 'none' : effect),
    [prefersReducedMotion, effect]
  );

  // Set up IntersectionObserver
  useEffect(() => {
    // If no animation needed, just mark as visible immediately
    if (effectiveEffect === 'none') {
      setIsVisible(true);
      // If triggerOnce, we don't need an observer at all
      if (triggerOnce) return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect(); // Clean up if only triggering once
          }
        } else if (!triggerOnce) {
          // Only hide again if triggerOnce is false
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, effectiveEffect]); // Rerun effect if options change

  // --- Animation Logic ---

  // Memoized function to get animation start/end states based on effect type
  const getAnimationProps = useCallback((effectType: RevealEffect) => {
    const baseHidden: { opacity: number; transform?: string } = { opacity: 0 };
    const baseVisible: { opacity: number; transform?: string } = { opacity: 1, transform: 'none' };

    switch (effectType) {
      case 'fade-up':
        return { from: { ...baseHidden, transform: 'translateY(20px)' }, to: baseVisible };
      case 'fade-down':
        return { from: { ...baseHidden, transform: 'translateY(-20px)' }, to: baseVisible };
      case 'fade-left':
        return { from: { ...baseHidden, transform: 'translateX(20px)' }, to: baseVisible };
      case 'fade-right':
        return { from: { ...baseHidden, transform: 'translateX(-20px)' }, to: baseVisible };
      case 'zoom-in':
        return { from: { ...baseHidden, transform: 'scale(0.95)' }, to: baseVisible };
      case 'none':
      default:
        return { from: { opacity: 1, transform: 'none' }, to: { opacity: 1, transform: 'none' } };
    }
  }, []);

  const { from, to } = useMemo(() => getAnimationProps(effectiveEffect), [effectiveEffect, getAnimationProps]);

  // Memoize the spring configuration
  const springConfig = useMemo(() => {
    const configBase = typeof animationConfig === 'string'
        ? SpringPresets[animationConfig as keyof typeof SpringPresets] || SpringPresets.GENTLE
        : animationConfig;
    return {
      ...configBase,
      immediate: effectiveEffect === 'none', // Bypass animation if effect is 'none'
    };
  }, [effectiveEffect, animationConfig]);

  // Get animated value (0 to 1) from the spring hook
  const animatedProgress = useGalileoStateSpring(isVisible ? 1 : 0, springConfig);

  // Calculate interpolated style based on spring progress
  const calculateStyle = useCallback((progress: number): CSSProperties => {
    // Clamp progress between 0 and 1
    const p = Math.max(0, Math.min(1, progress));
    if (effectiveEffect === 'none') return { opacity: 1 }; // Simple case for no animation

    const currentStyle: CSSProperties = {};

    // Interpolate opacity
    currentStyle.opacity = from.opacity + (to.opacity - from.opacity) * p;

    // Interpolate transform (handle different transform types)
    if (from.transform && to.transform && from.transform !== 'none') {
        let currentTransform = '';
        if (from.transform.includes('translateY')) {
            const startY = parseFloat(from.transform.match(/translateY\(([^p]+)px\)/)?.[1] ?? '0');
            const val = startY * (1 - p);
            currentTransform = `translateY(${val.toFixed(2)}px)`;
        } else if (from.transform.includes('translateX')) {
            const startX = parseFloat(from.transform.match(/translateX\(([^p]+)px\)/)?.[1] ?? '0');
            const val = startX * (1 - p);
            currentTransform = `translateX(${val.toFixed(2)}px)`;
        } else if (from.transform.includes('scale')) {
            const startScale = parseFloat(from.transform.match(/scale\(([^)]+)\)/)?.[1] ?? '1');
            const endScale = parseFloat(to.transform.match(/scale\(([^)]+)\)/)?.[1] ?? '1');
            const val = startScale + (endScale - startScale) * p;
            currentTransform = `scale(${val.toFixed(3)})`;
        }
        if (currentTransform) {
            currentStyle.transform = currentTransform;
        }
    } else {
       currentStyle.transform = to.transform; // Apply final transform if no interpolation needed
    }


    return currentStyle;
  }, [from, to, effectiveEffect]);

  // Ensure animatedProgress is a number before calculating style
  const progressValue = typeof animatedProgress === 'object' && animatedProgress !== null && 'value' in animatedProgress && typeof animatedProgress.value === 'number'
    ? animatedProgress.value
    : (typeof animatedProgress === 'number' ? animatedProgress : (isVisible ? 1 : 0));

  const finalStyle = useMemo(() => calculateStyle(progressValue), [calculateStyle, progressValue]);

  // Return the ref and calculated style
  return { ref: ref as RefObject<HTMLElement>, style: finalStyle };
}

// --- Component Implementation ---

/**
 * Wrapper component to easily apply scroll reveal effects using JSX.
 */
export const ScrollReveal = React.forwardRef<Element, ScrollRevealProps>(
  (
    {
      children,
      className,
      as: Component = 'div',
      // Extract hook options
      threshold,
      rootMargin,
      triggerOnce,
      effect,
      animationConfig,
      // Collect remaining props (like style, id, data-*, etc.)
      ...restProps
    },
    forwardedRef // The ref passed from the parent component
  ) => {
    // Consolidate options for the hook
    const hookOptions = useMemo(
      () => ({
        threshold,
        rootMargin,
        triggerOnce,
        effect,
        animationConfig,
      }),
      [threshold, rootMargin, triggerOnce, effect, animationConfig]
    );

    // Call the hook to get the internal ref and animation style
    const { ref: internalRef, style: hookStyle } = useScrollReveal(hookOptions);

    // Combine the internal ref (for the observer) and the forwarded ref (from parent)
    const ref = useMemo(() => {
      const setRef = (el: Element | null) => {
        // Update internal ref
        (internalRef as MutableRefObject<Element | null>).current = el;

        // Update forwarded ref if provided
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else if (forwardedRef) {
          forwardedRef.current = el;
        }
      };
      return setRef;
    }, [internalRef, forwardedRef]);

    // Merge the hook's animated style with any style prop passed to the component
    const combinedStyle = useMemo(
      () => ({
        ...hookStyle, // Apply animation styles
        ...(restProps.style || {}), // Merge with user-provided styles
      }),
      [hookStyle, restProps.style]
    );

    // Render the component using React.createElement for dynamic tag type
    return React.createElement(
      Component, // The tag type (e.g., 'div', 'section')
      {
        ...restProps, // Pass down all other props
        ref: ref, // Assign the combined ref handler
        className: className,
        style: combinedStyle, // Apply the merged styles
      },
      children // Render children inside the wrapper
    );
  }
);

ScrollReveal.displayName = 'ScrollReveal'; // Set display name for React DevTools