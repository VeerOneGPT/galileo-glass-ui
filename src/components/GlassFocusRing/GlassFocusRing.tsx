import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled, { css, keyframes, DefaultTheme, FlattenSimpleInterpolation, useTheme } from 'styled-components';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useGlassEffects, useStyleUtils } from '../../theme/ThemeProvider';
import { conditionalAnimation } from '../../animations';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins';
import { AnimationFunction } from '../../animations/types'; // Corrected import

interface GlassFocusRingProps {
  children: React.ReactNode;
  /** Offset of the focus ring from the element bounds. */
  offset?: number;
  /** Border radius adjustment (e.g., add to child's radius). */
  radiusAdjust?: number;
  /** Color preset or specific color for the ring. */
  color?: string; // Add presets later
  /** Disable the focus ring. */
  disabled?: boolean;
  /** Optional: Define animation preset/config. */
  animationConfig?: any; // Define type later
  ringThickness?: number;
  pulseAnimation?: boolean;
  /** Custom duration for the pulse animation (e.g., '1.5s'). Overrides theme. */
  animationDuration?: string;
  /** Custom easing for the pulse animation. Overrides theme. */
  animationEasing?: AnimationFunction; // Corrected type
}

// RESTORE original keyframes
const focusRingAnimation = keyframes`
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
`;

// Define animation options for conditionalAnimation
const pulseAnimationOptions = {
    duration: '1500ms', // Use string format for duration
    easing: 'ease-in-out',
    iterations: Infinity,
    category: 'focus' as const, // Add category
    // fillMode, delay, direction default as needed
};

const FocusRingElement = styled.div<{
  $show: boolean;
  $offset: number;
  $radiusAdjust: number;
  $color: string;
  $thickness: number;
  $animationCss?: FlattenSimpleInterpolation;
  theme?: DefaultTheme;
}>`
  position: absolute;
  top: ${props => -props.$offset}px;
  left: ${props => -props.$offset}px;
  right: ${props => -props.$offset}px;
  bottom: ${props => -props.$offset}px;
  border-radius: calc(var(--gg-focus-ring-child-radius, 6px) + ${props => props.$radiusAdjust}px);
  border: ${props => props.$thickness}px solid ${props => props.$color};
  box-shadow: 0 0 8px 2px ${props => props.$color}4D;
  opacity: ${props => props.$show ? 1 : 0};
  transform: scale(${props => props.$show ? 1 : 0.95});
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
  pointer-events: none;
  z-index: ${props => props.theme?.zIndex?.overlay || 10};

  ${props => props.$animationCss}
`;

// Wrapper div to capture focus events
const FocusWrapper = styled.div`
  position: relative; // Context for absolute positioning of FocusRingElement
  display: inline-block; // Or block, depending on desired layout
  outline: none; // Hide default browser focus outline on the wrapper
`;

// Helper function to parse theme values (e.g., '4px', '2') to numbers
const parseThemeValue = (value: string | number | undefined): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/px$/i, ''));
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

export const GlassFocusRing: React.FC<GlassFocusRingProps> = ({
  children,
  offset: offsetProp,
  radiusAdjust: radiusAdjustProp,
  color = 'primary',
  disabled = false,
  animationConfig, // Still unused
  ringThickness: ringThicknessProp,
  pulseAnimation = true,
  animationDuration: durationProp, // Added prop
  animationEasing: easingProp,   // Added prop
}) => {
  const theme = useTheme(); // Get theme context

  // Define defaults using theme, parse to number, fall back if missing/invalid
  const offset = offsetProp ?? (parseThemeValue(theme?.spacing?.xs) ?? 2);
  const radiusAdjust = radiusAdjustProp ?? (parseThemeValue(theme?.spacing?.sm) ?? 4);
  const ringThickness = ringThicknessProp ?? (parseThemeValue(theme?.borderWidths?.medium) ?? 2);

  const [isFocused, setIsFocused] = useState(false);
  const { getColor } = useStyleUtils();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const ringColor = getColor(color) || color;

  // Get animation values from props, theme, or defaults
  const animationDuration = durationProp 
      ?? theme?.animations?.focusRing?.duration 
      ?? '1500ms'; // Default duration
  const animationEasing = easingProp 
      ?? theme?.animations?.focusRing?.easing 
      ?? 'ease-in-out'; // Default easing

  // Memoize the animation options object
  const pulseAnimationOptions = useMemo(() => ({
      duration: animationDuration,
      easing: animationEasing,
      iterations: Infinity,
      category: 'focus' as const, 
  }), [animationDuration, animationEasing]); // Dependencies

  // Use conditionalAnimation hook with memoized options
  const pulseAnimationStyles = conditionalAnimation(
      isFocused && pulseAnimation,
      focusRingAnimation,
      pulseAnimationOptions // Use memoized options
  );

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!disabled) {
      setIsFocused(true);
      // Set CSS variable on focus
      if(wrapperRef.current && wrapperRef.current.firstElementChild) {
        const childStyle = window.getComputedStyle(wrapperRef.current.firstElementChild);
        wrapperRef.current.style.setProperty('--gg-focus-ring-child-radius', childStyle.borderRadius || '6px');
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  return (
    <FocusWrapper
      ref={wrapperRef}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
      tabIndex={-1}
    >
      {children}
      {!disabled && (
        <FocusRingElement
          data-testid="glass-focus-ring-element"
          $show={isFocused}
          $offset={offset}
          $radiusAdjust={radiusAdjust}
          $color={ringColor}
          $thickness={ringThickness}
          $animationCss={pulseAnimationStyles}
          aria-hidden="true"
        />
      )}
    </FocusWrapper>
  );
};

// TODO: Export from index
// TODO: Add tests
// TODO: Add documentation
// TODO: Add Storybook example 