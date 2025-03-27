import React, { forwardRef } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { glassGlow } from '../../core/mixins/effects/glowEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useGlassEffects, GlassSurfacePropTypes } from '../../theme/ThemeProvider';
import type { GlassSurfaceProps } from '../../core/types';

// Card props interface
export interface CardProps {
  /**
   * The content of the card
   */
  children: React.ReactNode;

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
}

// Styled card with glass effects
const StyledCard = styled.div<{
  $variant: 'elevation' | 'outlined' | 'standard' | 'frosted' | 'dimensional' | 'heat';
  $elevation: number;
  $hover: boolean;
  $glow: 'none' | 'subtle' | 'medium' | 'strong';
  $glowColor: string;
  $padding?: 'none' | 'small' | 'medium' | 'large';
  $maxWidth?: string;
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
  
  /* Padding based on prop */
  padding: ${props => {
    switch (props.$padding) {
      case 'none': return '0';
      case 'small': return '12px';
      case 'medium': return '24px';
      case 'large': return '32px';
      default: return '24px';
    }
  }};
  
  /* Max width if provided */
  ${props => props.$maxWidth && `max-width: ${props.$maxWidth};`}

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
    
  /* Title styling */
  .glass-card-title {
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }
  }
  
  /* Content styling */
  .glass-card-content {
    flex: 1;
  }
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
    title,
    padding = 'medium',
    maxWidth,
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
      $padding={padding}
      $maxWidth={maxWidth}
      onClick={onClick}
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
    </StyledCard>
  );
});

Card.displayName = 'Card';

/**
 * GlassCard Component
 *
 * A card component with glass morphism styling.
 * Combines the functionality of both implementations.
 */
export const GlassCard = forwardRef<HTMLDivElement, CardProps & Partial<GlassSurfaceProps>>((props, ref) => {
  const {
    children,
    variant = 'elevation',
    elevation = 2,
    hover = true,
    glow = 'subtle',
    glowColor = 'primary',
    className,
    onClick,
    title,
    padding = 'medium',
    maxWidth,
    blurStrength,
    backgroundOpacity,
    borderOpacity,
    glowIntensity,
    interactive = !!onClick,
    darkMode,
    ...rest
  } = props;

  // Get Glass effects from context if needed
  const { createSurface } = useGlassEffects();

  // Get padding value
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'small': return '12px';
      case 'medium': return '24px';
      case 'large': return '32px';
      default: return '24px';
    }
  };

  // Create unique ID for the component - moved outside of conditional
  const componentId = React.useId();

  // Map glow values to valid glowIntensity values
  const mapGlowToIntensity = (glowValue: string): 'minimal' | 'light' | 'medium' | 'strong' | 'extreme' => {
    if (glowValue === 'none') return 'minimal';
    if (glowValue === 'subtle') return 'light';
    if (glowValue === 'medium') return 'medium';
    if (glowValue === 'strong') return 'strong';
    return 'medium';
  };

  // Use advanced glass effects if special variants are requested
  // Use type guard to handle special glass variants
  if (
    variant === 'frosted' ||
    variant === 'dimensional' ||
    variant === 'heat' ||
    variant === 'standard'
  ) {
    // Get glass styles
    const glassStyles = createSurface({
      variant,
      blurStrength: blurStrength || 'medium',
      backgroundOpacity: backgroundOpacity || 'medium',
      borderOpacity: borderOpacity || 'medium',
      glowIntensity: glowIntensity || mapGlowToIntensity(glow),
      elevation: typeof elevation === 'number' ? elevation : 2,
      interactive: interactive || hover,
      darkMode,
    });

    return (
      <div 
        ref={ref}
        id={componentId}
        className={`glass-card ${className || ''}`}
        onClick={onClick}
        style={{ maxWidth, padding: getPadding() }}
        {...rest}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          #${componentId} {
            ${glassStyles}
            border-radius: 12px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
        `}} />
        
        {title && (
          <div className="glass-card-title">
            <h3>{title}</h3>
          </div>
        )}
        
        <div className="glass-card-content">
          {children}
        </div>
      </div>
    );
  }

  // Otherwise, use the original Card implementation
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
      title={title}
      padding={padding}
      maxWidth={maxWidth}
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
    </Card>
  );
});

GlassCard.displayName = 'GlassCard';

// Note: PropTypes validation removed in favor of TypeScript interface checking
// Runtime validation is handled by TypeScript interfaces during compilation
