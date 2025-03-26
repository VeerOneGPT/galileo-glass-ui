import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { glassGlow } from '../../core/mixins/effects/glowEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

// Card props interface
export interface CardProps {
  /**
   * The content of the card
   */
  children: React.ReactNode;

  /**
   * The variant of the card
   */
  variant?: 'elevation' | 'outlined';

  /**
   * The elevation level of the card
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;

  /**
   * If true, the card will have a hover effect
   */
  hover?: boolean;

  /**
   * If true, the card will have a glow effect
   */
  glow?: 'none' | 'subtle' | 'medium' | 'strong';

  /**
   * The color of the glow effect
   */
  glowColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// Styled card with glass effects
const StyledCard = styled.div<{
  $variant: 'elevation' | 'outlined';
  $elevation: number;
  $hover: boolean;
  $glow: 'none' | 'subtle' | 'medium' | 'strong';
  $glowColor: string;
}>`
  /* Base styles */
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-clip: border-box;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;

  /* Variant styles */
  ${props => {
    if (props.$variant === 'outlined') {
      return `
        border: 1px solid rgba(255, 255, 255, 0.12);
        background-color: transparent;
      `;
    }

    // For elevation variant, use glassSurface mixin
    return glassSurface({
      elevation: props.$elevation,
      blurStrength: 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}), // In real usage, this would use props.theme
    });
  }}

  /* Hover effect */
  ${props =>
    props.$hover &&
    `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
    }
  `}
  
  /* Glow effect */
  ${props =>
    props.$glow !== 'none' &&
    glassGlow({
      intensity: props.$glow,
      color: props.$glowColor,
      themeContext: createThemeContext({}), // In real usage, this would use props.theme
    })}
`;

/**
 * Card Component
 *
 * A flexible card component for content containers.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const {
    children,
    variant = 'elevation',
    elevation = 1,
    hover = false,
    glow = 'none',
    glowColor = 'primary',
    className,
    onClick,
    ...rest
  } = props;

  return (
    <StyledCard
      ref={ref}
      className={className}
      $variant={variant}
      $elevation={elevation}
      $hover={hover}
      $glow={glow}
      $glowColor={glowColor}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledCard>
  );
});

Card.displayName = 'Card';

/**
 * GlassCard Component
 *
 * A card component with glass morphism styling.
 */
export const GlassCard = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const {
    children,
    variant = 'elevation',
    elevation = 2,
    hover = true,
    glow = 'subtle',
    glowColor = 'primary',
    className,
    onClick,
    ...rest
  } = props;

  // Add glass styling to the base card
  return (
    <Card
      ref={ref}
      variant={variant}
      elevation={elevation}
      hover={hover}
      glow={glow}
      glowColor={glowColor}
      className={`glass-card ${className || ''}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Card>
  );
});

GlassCard.displayName = 'GlassCard';
