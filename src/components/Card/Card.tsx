import React, { forwardRef, ReactNode, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { PolymorphicProps, GlassSurfaceProps } from '../../core/types';
import { AnimationProps } from '../../animations/types';

import { glassGlow } from '../../core/mixins/effects/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import DimensionalGlass from '../surfaces/DimensionalGlass';
import { MotionSensitivityLevel } from '../../animations/accessibility/MotionSensitivity';

// Card props interface
export interface CardProps extends GlassSurfaceProps, AnimationProps, HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the card
   */
  children: ReactNode;

  /**
   * The variant of the card
   */
  variant?: 'elevation' | 'outlined' | 'standard' | 'frosted' | 'dimensional' | 'heat';

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

  /**
   * Optional title for the card
   */
  title?: string;
  
  /**
   * Padding size
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  /**
   * Maximum width of the card (CSS value)
   */
  maxWidth?: string;

  /**
   * If true, the card will be raised
   */
  raised?: boolean;
}

// Interfaces (ensure these are correctly defined or imported)
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  avatar?: ReactNode;
  action?: ReactNode;
  title?: ReactNode;
  subheader?: ReactNode;
  disableTypography?: boolean;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  disableSpacing?: boolean;
}

// Styled components definitions (re-added)
const StyledCardHeader = styled.div<CardHeaderProps>`
  /* Add original CardHeader styles here */
  display: flex;
  padding: 16px;
  align-items: center;
`;

const StyledCardContent = styled.div<CardContentProps>`
  /* Add original CardContent styles here */
  padding: 16px;
`;

const StyledCardActions = styled.div<CardActionsProps>`
  /* Add original CardActions styles here */
  display: flex;
  padding: 8px;
  align-items: center;
  ${({ disableSpacing }) =>
    !disableSpacing &&
    css`
      & > :not(:first-child) {
        margin-left: 8px;
      }
    `}
`;

/**
 * Card Component
 *
 * A versatile container component representing a card.
 */
const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const {
    children,
    variant = 'elevation',
    elevation = 1,
    hover = true,
    glow = 'none',
    glowColor = 'primary',
    className,
    onClick,
    title,
    padding = 'medium',
    maxWidth,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    raised = false,
    ...rest
  } = props;

  // Map Card padding prop to DimensionalGlass padding prop
  const dimensionalPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return 12;
      case 'medium': return 24;
      case 'large': return 32;
      default: return 24;
    }
  };

  return (
    <DimensionalGlass
      ref={ref}
      className={className}
      style={{ maxWidth, ...(onClick && { cursor: 'pointer' }) }}
      elevation={elevation}
      interactive={hover}
      padding={dimensionalPadding()}
      borderRadius={8}
      depth={0.5}
      dynamicShadow={true}
      onClick={onClick}
      animationConfig={animationConfig}
      disableAnimation={disableAnimation}
      motionSensitivity={motionSensitivity}
      {...rest}
    >
      {title && (
        <div className="glass-card-title">
          <h3>{title}</h3>
        </div>
      )}
      
      <div className="glass-card-content">
        {children}
      </div>
    </DimensionalGlass>
  );
});

Card.displayName = 'Card';

/**
 * CardHeader Component
 */
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({ 
  avatar,
  action,
  title,
  subheader,
  disableTypography,
  ...rest
}, ref) => {
  return (
    <StyledCardHeader ref={ref} {...rest}>
      {/* Add logic for avatar, action, title, subheader based on original implementation */}
      {avatar}
      <div style={{ flex: 1 }}>
        {title}
        {subheader}
      </div>
      {action}
    </StyledCardHeader>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * CardContent Component
 */
const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({ 
  children, 
  ...rest 
}, ref) => {
  return (
    <StyledCardContent ref={ref} {...rest}>
      {children}
    </StyledCardContent>
  );
});

CardContent.displayName = 'CardContent';

/**
 * CardActions Component
 */
const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(({ 
  children, 
  disableSpacing = false, 
  ...rest
}, ref) => {
  return (
    <StyledCardActions ref={ref} disableSpacing={disableSpacing} {...rest}>
      {children}
    </StyledCardActions>
  );
});

CardActions.displayName = 'CardActions';

export { Card, CardHeader, CardContent, CardActions };
