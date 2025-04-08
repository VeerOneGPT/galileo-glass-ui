import React, { useState, useEffect, useRef, useMemo, RefObject, CSSProperties } from 'react';
import type { ParallaxScrollOptions, ParallaxScrollResult } from '../types/hooks';
import { useReducedMotion } from './useReducedMotion';

// Default options
const DEFAULT_PARALLAX_OPTIONS: Required<Omit<ParallaxScrollOptions, 'scrollContainerRef'>> = {
    factor: 0.5,
    axis: 'y',
    disabled: false,
};

/**
 * Applies a parallax scrolling effect to an element based on scroll position.
 *
 * @param options Configuration options for the parallax effect.
 * @returns An object containing a ref for the target element and the style object to apply.
 */
export const useParallaxScroll = <T extends HTMLElement>(
    options: ParallaxScrollOptions = {}
): ParallaxScrollResult & { ref: RefObject<T> } => {
    const elementRef = useRef<T>(null);
    const [translate, setTranslate] = useState<number>(0);
    const requestRef = useRef<number | null>(null); // For requestAnimationFrame

    const prefersReducedMotion = useReducedMotion();

    const {
        factor = DEFAULT_PARALLAX_OPTIONS.factor,
        axis = DEFAULT_PARALLAX_OPTIONS.axis,
        disabled: optionDisabled = DEFAULT_PARALLAX_OPTIONS.disabled,
        scrollContainerRef,
    } = options;

    const isDisabled = optionDisabled || prefersReducedMotion;

    useEffect(() => {
        if (isDisabled) {
            // Reset translation if disabled
            if (translate !== 0) setTranslate(0);
            return;
        }

        const scrollElement = scrollContainerRef?.current || window;
        const isWindow = scrollElement === window;

        const handleScroll = () => {
            // Use requestAnimationFrame to throttle updates
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }

            requestRef.current = requestAnimationFrame(() => {
                 if (!elementRef.current) {
                     requestRef.current = null;
                     return;
                 }
                
                let scrollPosition: number;
                if (isWindow) {
                    scrollPosition = axis === 'y' ? window.scrollY : window.scrollX;
                } else {
                    scrollPosition = axis === 'y' ? (scrollElement as HTMLElement).scrollTop : (scrollElement as HTMLElement).scrollLeft;
                }
                
                // Simple parallax: offset based directly on scroll position and factor
                // Negative factor makes it move slower (appears further)
                // Positive factor > 1 makes it move faster (appears closer)
                const offset = -scrollPosition * (1 - factor); // Adjusted calculation for intuitive factor

                setTranslate(offset);
                requestRef.current = null;
            });
        };

        // Set initial position
        handleScroll();

        scrollElement.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
            scrollElement.removeEventListener('scroll', handleScroll);
        };
        // Rerun effect if options change
    }, [isDisabled, factor, axis, scrollContainerRef, translate]); // Include translate to reset if disabled

    const style = useMemo((): CSSProperties => {
        if (isDisabled) return {};

        const transform = axis === 'y'
            ? `translate3d(0, ${translate.toFixed(1)}px, 0)`
            : `translate3d(${translate.toFixed(1)}px, 0, 0)`;

        return {
            transform,
            willChange: 'transform',
        };
    }, [isDisabled, axis, translate]);

    return {
        ref: elementRef,
        style,
    };
}; 