import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled, { css, keyframes, DefaultTheme, FlattenSimpleInterpolation, useTheme } from 'styled-components';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useGlassEffects, useStyleUtils } from '../../theme/ThemeProvider';
import { conditionalAnimation } from '../../animations';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins';

// --- Define Prop Types ---
type AnimationPreset = 'pulse' | 'fade' | 'static';
type RingThickness = 'sm' | 'md' | 'lg';

interface GlassFocusRingProps {
  children: React.ReactNode;
  /** Offset of the focus ring from the element bounds. Default: theme.spacing.xs or 2px. */
  offset?: number;
  /** Border radius adjustment (e.g., add to child's radius). Default: theme.spacing.sm or 4px. */
  radiusAdjust?: number;
  /** Color preset or specific color string for the ring. Default: 'primary'. */
  color?: string;
  /** Disable the focus ring. Default: false. */
  disabled?: boolean;
  /** Animation preset for the focus ring. Default: 'pulse'. */
  animationPreset?: AnimationPreset;
  /** Thickness preset for the focus ring. Default: 'md'. */
  thickness?: RingThickness;
  /** Custom duration for the 'pulse' animation (e.g., '1.5s'). Overrides theme/defaults. */
  animationDuration?: string;
  /** Custom CSS easing function for the 'pulse' animation. Overrides theme/defaults. */
  animationEasing?: string;
}
// --- End Prop Types ---

// --- Keyframes ---
// Pulse animation (existing)
const focusRingPulseAnimation = keyframes`
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
`;

// Simple fade animation (can rely on transition, but define for clarity)
const focusRingFadeAnimation = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
// --- End Keyframes ---

// Define animation options for conditionalAnimation
// Base options for transitions (used for fade/static)
const baseTransitionOptions = {
    duration: '200ms', // Match CSS transition duration
    easing: 'ease-out',
    category: 'focus' as const,
};

// Pulse options (keep separate as it uses different keyframes/timing)
const pulseAnimationOptions = (duration: string, easing: string) => ({
    duration: duration,
    easing: easing,
    iterations: Infinity,
    category: 'focus' as const,
});

const FocusRingElement = styled.div<{
  $show: boolean;
  $offset: number;
  $radiusAdjust: number;
  $color: string;
  $thickness: number;
  $animationPreset: AnimationPreset;
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
  // Apply initial scale only for pulse, otherwise rely on opacity transition
  transform: scale(${props => props.$show && props.$animationPreset === 'pulse' ? 1 : 0.95});
  transition: opacity 0.2s ease-out, transform 0.2s ease-out; // Keep base transition
  pointer-events: none;
  z-index: ${props => props.theme?.zIndex?.overlay || 10};

  // Apply keyframe animation CSS from conditionalAnimation hook
  ${props => props.$animationCss}
`;

// Wrapper div to capture focus events
const FocusWrapper = styled.div`
  position: relative; // Context for absolute positioning of FocusRingElement
  display: inline-block; // Or block, depending on desired layout
  outline: none; // Hide default browser focus outline on the wrapper
`;

// Helper function to parse theme value
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
  animationPreset = 'pulse', // Default to 'pulse'
  thickness = 'md',        // Default to 'md'
  animationDuration: durationProp,
  animationEasing: easingProp,
}) => {
  const theme = useTheme();

  // Define defaults using theme, parse to number, fall back if missing/invalid
  const offset = offsetProp ?? (parseThemeValue(theme?.spacing?.xs) ?? 2);
  const radiusAdjust = radiusAdjustProp ?? (parseThemeValue(theme?.spacing?.sm) ?? 4);

  // Map thickness preset to pixel value
  const ringThickness = useMemo(() => {
    switch (thickness) {
      case 'sm': return parseThemeValue(theme?.borderWidths?.thin) ?? 1;
      case 'lg': return parseThemeValue(theme?.borderWidths?.thick) ?? 3;
      case 'md':
      default: return parseThemeValue(theme?.borderWidths?.medium) ?? 2;
    }
  }, [thickness, theme]);

  const [isFocused, setIsFocused] = useState(false);
  const { getColor } = useStyleUtils();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const ringColor = getColor(color) || color;

  // Get animation values from props, theme, or defaults (specifically for pulse)
  const pulseDuration = durationProp
      ?? theme?.animations?.focusRing?.duration
      ?? '1500ms'; // Default duration
  const pulseEasing = easingProp
      ?? theme?.animations?.focusRing?.easing
      ?? 'ease-in-out'; // Default easing

  // Memoize the pulse animation options object
  const memoizedPulseOptions = useMemo(() => pulseAnimationOptions(pulseDuration, pulseEasing), [
      pulseDuration, pulseEasing
  ]);

  // Determine animation based on preset
  const animationStyles = useMemo(() => {
    switch (animationPreset) {
      case 'pulse':
        return conditionalAnimation(
            isFocused, // Apply only when focused
            focusRingPulseAnimation,
            memoizedPulseOptions
        );
      case 'fade':
         // For fade, we mostly rely on the CSS transition.
         // We could apply a simple fade-in keyframe, but opacity transition handles it.
         // Return undefined or empty css`` if no explicit keyframe animation is needed.
         return css``;
      case 'static':
      default:
        // No animation keyframes for static
        return css``;
    }
  }, [isFocused, animationPreset, memoizedPulseOptions]);

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
          $animationPreset={animationPreset} // Pass preset for styling
          $animationCss={animationStyles} // Pass generated styles
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