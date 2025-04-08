import React, { useRef, useMemo, useEffect, useState } from 'react';
import type { ZSpaceOptions, ZSpaceResult } from '../types/hooks';
import { useReducedMotion } from './useReducedMotion';

const DEFAULT_OPTIONS: Required<Omit<ZSpaceOptions, 'perspective' | 'scrollDepthRange' | 'scrollThreshold' | 'linkEffects'>> = {
    depth: 0,
    perspectiveOrigin: 'center center',
    applyPerspectiveToParent: false,
    preserve3d: true,
    disabled: false,
    animateOnScroll: false,
};

// Helper to map a value from one range to another
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    const clampedValue = Math.max(inMin, Math.min(inMax, value));
    return ((clampedValue - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

// Get element's scroll position relative to viewport (0-1)
const getScrollProgress = (element: HTMLElement, thresholds: [number, number] = [0, 1]): number => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate actual thresholds based on percentage
    const startPos = windowHeight * thresholds[0];
    const endPos = windowHeight * (1 - thresholds[1]);
    
    // Element top relative to viewport
    const elementTop = rect.top;
    const elementBottom = rect.bottom;
    
    // If element is not in threshold range, return extremes
    if (elementBottom <= startPos) return 1; // Already past top threshold
    if (elementTop >= endPos) return 0; // Not yet reached bottom threshold
    
    // Calculate the actual progress between thresholds
    const availableScrollDistance = endPos - startPos;
    const currentPosition = elementTop - startPos;
    
    // Inverse the progress (1 when at top threshold, 0 when at bottom threshold)
    return 1 - Math.max(0, Math.min(1, currentPosition / availableScrollDistance));
};

export const useZSpace = <T extends HTMLElement = HTMLElement>(
    options: ZSpaceOptions = {}
): ZSpaceResult => {
    const elementRef = useRef<T>(null);
    const prefersReducedMotion = useReducedMotion();
    const [scrollProgress, setScrollProgress] = useState(0);

    const { 
        depth = DEFAULT_OPTIONS.depth, 
        perspectiveOrigin = DEFAULT_OPTIONS.perspectiveOrigin,
        perspective, // Not applying to element by default
        applyPerspectiveToParent = DEFAULT_OPTIONS.applyPerspectiveToParent,
        preserve3d = DEFAULT_OPTIONS.preserve3d,
        disabled = DEFAULT_OPTIONS.disabled,
        animateOnScroll = DEFAULT_OPTIONS.animateOnScroll,
        scrollDepthRange = [-50, 50], // Default range if animateOnScroll is true
        scrollThreshold = [0.1, 0.1], // Start/end thresholds for scroll animation
        linkEffects,
    } = options;

    // Don't animate when reduced motion is preferred
    const shouldAnimateOnScroll = animateOnScroll && !prefersReducedMotion && !disabled;

    // Apply perspective to parent if requested
    useEffect(() => {
        if (disabled || !applyPerspectiveToParent || !elementRef.current?.parentElement) {
            return;
        }
        const parent = elementRef.current.parentElement;
        const perspectiveValue = typeof applyPerspectiveToParent === 'number' 
            ? `${applyPerspectiveToParent}px` 
            : '1000px'; // Default perspective value if boolean true
        
        // Store original styles to revert on cleanup
        const originalPerspective = parent.style.perspective;
        const originalPerspectiveOrigin = parent.style.perspectiveOrigin;
        const originalPosition = parent.style.position;

        parent.style.perspective = perspectiveValue;
        parent.style.perspectiveOrigin = perspectiveOrigin;
        // Ensure parent is positioned if not already
        if (!originalPosition || originalPosition === 'static') {
             parent.style.position = 'relative';
        }

        return () => {
            try {
                // Revert styles only if they were changed
                parent.style.perspective = originalPerspective;
                parent.style.perspectiveOrigin = originalPerspectiveOrigin;
                if (!originalPosition || originalPosition === 'static') {
                     parent.style.position = originalPosition;
                }
            } catch (e) { 
                // Element might have been removed
            }
        };
    }, [applyPerspectiveToParent, perspectiveOrigin, disabled]);

    // Handle scroll animation
    useEffect(() => {
        if (!shouldAnimateOnScroll || !elementRef.current) return;

        const element = elementRef.current;
        
        const handleScroll = () => {
            if (!element) return;
            const progress = getScrollProgress(element, scrollThreshold);
            setScrollProgress(progress);
        };

        // Initial calculation
        handleScroll();
        
        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [shouldAnimateOnScroll, scrollThreshold]);

    // Calculate styles for the element itself, including scroll-based depth and linked effects
    const style = useMemo((): React.CSSProperties => {
        if (disabled) return {};

        const elementStyle: React.CSSProperties = {};

        // Calculate actual depth based on scroll position if animateOnScroll is enabled
        let actualDepth = depth;
        if (shouldAnimateOnScroll) {
            actualDepth = mapRange(scrollProgress, 0, 1, scrollDepthRange[0], scrollDepthRange[1]);
        }

        // Apply transform for depth
        if (actualDepth !== 0) {
            elementStyle.transform = `translateZ(${actualDepth}px)`;
        }

        // Apply perspective directly to the element if specified
        if (perspective !== undefined) {
            elementStyle.perspective = typeof perspective === 'number' ? `${perspective}px` : perspective;
            elementStyle.perspectiveOrigin = perspectiveOrigin;
        }
        
        // Apply transform-style
        if (preserve3d) {
            elementStyle.transformStyle = 'preserve-3d';
        }

        // Apply linked effects if specified
        if (linkEffects) {
            const filters: string[] = [];
            
            // Add blur effect linked to Z-position
            if (linkEffects.blur) {
                const { range, invertZ = false } = linkEffects.blur;
                const [minBlur, maxBlur] = range;
                const blurProgress = invertZ ? 
                    mapRange(actualDepth, scrollDepthRange[1], scrollDepthRange[0], 0, 1) :
                    mapRange(actualDepth, scrollDepthRange[0], scrollDepthRange[1], 0, 1);
                const blurValue = mapRange(blurProgress, 0, 1, minBlur, maxBlur);
                filters.push(`blur(${blurValue}px)`);
            }
            
            // Set filter if any filter effects are applied
            if (filters.length > 0) {
                elementStyle.filter = filters.join(' ');
            }
            
            // Add scale effect linked to Z-position
            if (linkEffects.scale) {
                const { range, invertZ = false } = linkEffects.scale;
                const [minScale, maxScale] = range;
                const scaleProgress = invertZ ? 
                    mapRange(actualDepth, scrollDepthRange[1], scrollDepthRange[0], 0, 1) :
                    mapRange(actualDepth, scrollDepthRange[0], scrollDepthRange[1], 0, 1);
                const scaleValue = mapRange(scaleProgress, 0, 1, minScale, maxScale);
                
                // Update transform to include scale
                const existingTransform = elementStyle.transform || '';
                elementStyle.transform = `${existingTransform} scale(${scaleValue})`.trim();
            }
            
            // Add opacity effect linked to Z-position
            if (linkEffects.opacity) {
                const { range, invertZ = false } = linkEffects.opacity;
                const [minOpacity, maxOpacity] = range;
                const opacityProgress = invertZ ? 
                    mapRange(actualDepth, scrollDepthRange[1], scrollDepthRange[0], 0, 1) :
                    mapRange(actualDepth, scrollDepthRange[0], scrollDepthRange[1], 0, 1);
                elementStyle.opacity = mapRange(opacityProgress, 0, 1, minOpacity, maxOpacity);
            }
        }

        return elementStyle;

    }, [
        depth, perspective, perspectiveOrigin, preserve3d, disabled,
        shouldAnimateOnScroll, scrollProgress, scrollDepthRange, linkEffects
    ]);

    // Parent style is handled by the useEffect
    const parentStyle = undefined;

    return {
        ref: elementRef,
        style,
        parentStyle, // Not directly returned, applied via effect
    };
}; 