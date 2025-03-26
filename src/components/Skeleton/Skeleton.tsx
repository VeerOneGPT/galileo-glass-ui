import React, { forwardRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

export interface SkeletonProps {
  /**
   * The type of content to render
   */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';

  /**
   * Width of the skeleton
   */
  width?: string | number;

  /**
   * Height of the skeleton
   */
  height?: string | number;

  /**
   * If true, the skeleton will animate
   */
  animation?: 'pulse' | 'wave' | 'shimmer' | false;

  /**
   * If true, apply glass styling
   */
  glass?: boolean;

  /**
   * The theme color to use for glass effects
   */
  color?: 'primary' | 'secondary' | 'default';

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * If set to true, renders a multi-line text skeleton with varying widths
   */
  multiline?: boolean;

  /**
   * Number of lines to show when multiline is true
   */
  lines?: number;
}

// Animation keyframes
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const wave = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    default:
      return '#E2E8F0'; // default gray
  }
};

// Convert dimension to CSS value
const toCssValue = (value: string | number | undefined, defaultValue: string): string => {
  if (value === undefined) {
    return defaultValue;
  }
  return typeof value === 'number' ? `${value}px` : value;
};

// Get random width for multiline skeletons
const getRandomWidth = (lineIndex: number, totalLines: number): string => {
  // Last line is usually shorter
  if (lineIndex === totalLines - 1) {
    return `${30 + Math.floor(Math.random() * 40)}%`;
  }

  // First line often full
  if (lineIndex === 0) {
    return '100%';
  }

  // Middle lines vary between 70% and 100%
  return `${70 + Math.floor(Math.random() * 30)}%`;
};

// Styled components
const SkeletonContainer = styled.span<{
  $variant: string;
  $width: string;
  $height: string;
  $animation: string | false;
  $glass: boolean;
  $color: string;
}>`
  display: block;
  background-color: ${props =>
    props.$glass
      ? `${getColorByName(props.$color)}40` // transparent for glass
      : '#E2E8F0'};
  width: ${props => props.$width};
  height: ${props => props.$height};
  position: relative;
  overflow: hidden;

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'text':
        return `
          border-radius: 4px;
          margin-top: 0;
          margin-bottom: 8px;
          transform: scale(1, 0.6);
          transform-origin: 0 60%;
        `;
      case 'circular':
        return `border-radius: 50%;`;
      case 'rounded':
        return `border-radius: 16px;`;
      default: // rectangular
        return `border-radius: 4px;`;
    }
  }}

  /* Animation styles */
  ${props => {
    if (props.$animation === 'pulse') {
      return css`
        animation: ${pulse} 1.5s ease-in-out infinite;
      `;
    }

    if (props.$animation === 'shimmer') {
      return css`
        background: ${props.$glass
          ? `linear-gradient(90deg, ${getColorByName(props.$color)}40 25%, ${getColorByName(
              props.$color
            )}80 50%, ${getColorByName(props.$color)}40 75%)`
          : 'linear-gradient(90deg, #E2E8F0 25%, #F8FAFC 50%, #E2E8F0 75%)'};
        background-size: 200% 100%;
        animation: ${shimmer} 2s infinite;
      `;
    }

    if (props.$animation === 'wave') {
      return css`
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            ${props.$glass ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'},
            transparent
          );
          animation: ${wave} 1.6s linear 0.5s infinite;
        }
      `;
    }

    return '';
  }}
  
  /* Glass effects */
  ${props =>
    props.$glass &&
    css`
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid ${`${getColorByName(props.$color)}30`};
    `}
  
  /* Glass glow effect */
  ${props =>
    props.$glass &&
    glassGlow({
      intensity: 'minimal',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
`;

const MultilineContainer = styled.div`
  width: 100%;
`;

/**
 * Skeleton Component
 *
 * A placeholder preview for content that will load
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>((props, ref) => {
  const {
    variant = 'text',
    width,
    height,
    animation = 'pulse',
    glass = false,
    color = 'default',
    className,
    multiline = false,
    lines = 3,
    ...rest
  } = props;

  // Default dimensions based on variant
  let defaultWidth;
  let defaultHeight;

  if (variant === 'text') {
    defaultWidth = '100%';
    defaultHeight = '1.2em';
  } else if (variant === 'circular') {
    defaultWidth = '40px';
    defaultHeight = '40px';
  } else if (variant === 'rectangular' || variant === 'rounded') {
    defaultWidth = '100%';
    defaultHeight = '100px';
  }

  const widthValue = toCssValue(width, defaultWidth || '100%');
  const heightValue = toCssValue(height, defaultHeight || '100%');

  // Render multiline skeleton
  if (multiline && variant === 'text') {
    return (
      <MultilineContainer
        className={className}
        ref={ref as React.RefObject<HTMLDivElement>}
        {...rest}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonContainer
            key={index}
            $variant={variant}
            $width={getRandomWidth(index, lines)}
            $height={heightValue}
            $animation={animation}
            $glass={glass}
            $color={color}
            style={{ marginBottom: index === lines - 1 ? 0 : 8 }}
          />
        ))}
      </MultilineContainer>
    );
  }

  // Render single skeleton
  return (
    <SkeletonContainer
      ref={ref}
      className={className}
      $variant={variant}
      $width={widthValue}
      $height={heightValue}
      $animation={animation}
      $glass={glass}
      $color={color}
      {...rest}
    />
  );
});

Skeleton.displayName = 'Skeleton';

/**
 * GlassSkeleton Component
 *
 * A skeleton component with glass morphism styling.
 */
export const GlassSkeleton = forwardRef<HTMLSpanElement, SkeletonProps>((props, ref) => {
  const { className, glass = true, color = 'primary', ...rest } = props;

  return (
    <Skeleton
      ref={ref}
      className={`glass-skeleton ${className || ''}`}
      glass={glass}
      color={color}
      {...rest}
    />
  );
});

GlassSkeleton.displayName = 'GlassSkeleton';
