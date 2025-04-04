import React, { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useReducedMotion } from './useReducedMotion';
import { useGlassTheme } from '../hooks'; // Correct import path for useGlassTheme

interface UseGlassFocusOptions {
  /** Ref of the element to apply the focus ring to. */
  elementRef: React.RefObject<HTMLElement>;
  /** Style variant for the ring (e.g., 'primary', 'secondary'). Uses theme colors. */
  variant?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  /** Offset of the ring from the element bounds (px). */
  offset?: number;
  /** Border radius of the ring. Defaults to element's radius + offset. */
  borderRadius?: string | number;
  /** Thickness of the ring (px). */
  thickness?: number;
  /** Disable the focus ring effect. */
  disabled?: boolean;
}

interface UseGlassFocusReturn {
  /** Boolean indicating if the element currently has focus. */
  isFocused: boolean;
  /** Props to spread onto the focus ring element. */
  focusRingProps: {
    style: CSSProperties;
    'data-glass-focus-ring': boolean;
    'aria-hidden': true;
  };
}

// --- Keyframes for Animation ---
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

// --- Styled Component for the Ring (Internal Use) ---
const FocusRingElement = styled.div<{ 
  $visible: boolean; 
  $color: string; 
  $offset: number; 
  $thickness: number; 
  $radius: string; 
  $reducedMotion: boolean; 
}>`
  position: absolute;
  top: ${props => -props.$offset}px;
  left: ${props => -props.$offset}px;
  right: ${props => -props.$offset}px;
  bottom: ${props => -props.$offset}px;
  border-radius: ${props => props.$radius};
  border: ${props => props.$thickness}px solid ${props => props.$color};
  box-shadow: 0 0 8px 2px ${props => props.$color}80; // Subtle glow
  
  // Glass effect (subtle background blur if possible, might impact performance)
  // background-color: ${props => props.$color}1A; // Very low opacity background
  // backdrop-filter: blur(2px); 

  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: none; // Ring should not intercept pointer events
  z-index: 1; // Ensure it's above the element but below other overlays maybe?
  transition: opacity 0.2s ease-in-out;
  will-change: opacity, transform;

  /* Animation */
  ${({ $visible, $reducedMotion }) => 
    $visible && !$reducedMotion && css`
      animation: ${pulseAnimation} 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    `}
    
  /* Reduced Motion: Static but visible */
  ${({ $visible, $reducedMotion }) => 
    $visible && $reducedMotion && css`
      opacity: 0.9; // Slightly less intense static opacity
      transform: scale(1); // Ensure no scaling
    `}
`;

/**
 * Hook to apply an animated, glass-styled focus ring around an element.
 */
export function useGlassFocus({
  elementRef,
  variant = 'primary',
  offset = 2,
  thickness = 2,
  borderRadius,
  disabled = false,
}: UseGlassFocusOptions): UseGlassFocusReturn {
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const themeContext = useGlassTheme(); // Get the whole context
  const theme = themeContext.theme; // Access the theme object within the context

  const handleFocus = useCallback(() => {
    if (!disabled) {
      setIsFocused(true);
    }
  }, [disabled]);

  const handleBlur = useCallback(() => {
    if (!disabled) {
      setIsFocused(false);
    }
  }, [disabled]);

  useEffect(() => {
    const element = elementRef.current;
    if (element && !disabled) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);

      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, [elementRef, handleFocus, handleBlur, disabled]);

  // Determine color based on variant - Directly use the color string
  const focusColor = theme?.colors?.[variant] || theme?.colors?.primary || '#007bff';

  // Determine border radius
  const [computedRadius, setComputedRadius] = useState('0px');

  useEffect(() => {
    if (borderRadius !== undefined) {
       setComputedRadius(typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius);
    } else if (elementRef.current) {
       const elementStyle = window.getComputedStyle(elementRef.current);
       const elementRadius = elementStyle.borderRadius;
       // Try to parse and add offset, fallback to element radius or default
       try {
           if (elementRadius.endsWith('px')) {
               const numRadius = parseFloat(elementRadius);
               setComputedRadius(`${numRadius + offset}px`);
           } else {
               // Handle percentages or other units - complex, fallback
               setComputedRadius(elementRadius || `${offset * 2}px`); 
           }
       } catch (e) {
           setComputedRadius(`${offset * 2}px`); // Default if parsing fails
       }
    } else {
        setComputedRadius(`${offset * 2}px`); // Default if no element/radius
    }
  }, [borderRadius, elementRef, offset]);

  // Render the ring conditionally using the styled component
  // We return props for an external ring element to allow composition
  const focusRingProps = {
    style: {
        position: 'absolute' as const,
        top: `${-offset}px`,
        left: `${-offset}px`,
        right: `${-offset}px`,
        bottom: `${-offset}px`,
        borderRadius: computedRadius,
        border: `${thickness}px solid ${focusColor}`,
        boxShadow: `0 0 8px 2px ${focusColor}80`,
        opacity: isFocused ? (prefersReducedMotion ? 0.9 : 1) : 0,
        pointerEvents: 'none' as const,
        zIndex: 1,
        transition: 'opacity 0.2s ease-in-out',
        animation: isFocused && !prefersReducedMotion ? `${pulseAnimation} 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite` : 'none',
        transform: isFocused && prefersReducedMotion ? 'scale(1)' : 'none',
        willChange: 'opacity, transform',
    } as CSSProperties,
    'data-glass-focus-ring': true,
    'aria-hidden': true as const,
  };

  return {
    isFocused,
    focusRingProps,
  };
}

// Helper component example (optional, hook returns props)
/*
interface GlassFocusRingProps extends UseGlassFocusOptions {}

export const GlassFocusRing: React.FC<GlassFocusRingProps> = (options) => {
    const { isFocused, focusRingProps } = useGlassFocus(options);
    return <div {...focusRingProps} />;
};
*/ 