// @ts-nocheck - TypeScript has difficulty with PropTypes validation
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GlassSurfacePropTypes, useGlassEffects } from '../../theme/ThemeProvider';
import type { GlassSurfaceProps } from '../../core/types';

interface GlassCardProps extends GlassSurfaceProps {
  /**
   * Content to render inside the card
   */
  children?: React.ReactNode;
  
  /**
   * Optional title for the card
   */
  title?: string;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional onClick handler
   */
  onClick?: () => void;
  
  /**
   * Padding size
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  /**
   * Maximum width of the card (CSS value)
   */
  maxWidth?: string;
}

/**
 * GlassCard Component
 * 
 * A card component with glass morphism styling.
 * Utilizes the shared GlassSurfaceProps for consistent glass styling.
 */
const GlassCard: React.FC<GlassCardProps> = ({
  children,
  title,
  className = '',
  onClick,
  padding = 'medium',
  maxWidth,
  // Glass surface props with defaults
  variant = 'standard',
  blurStrength = 'medium',
  backgroundOpacity = 'medium',
  borderOpacity = 'medium',
  glowIntensity = 'medium',
  elevation = 1,
  interactive = false,
  darkMode,
  ...rest
}) => {
  // Get Glass effects from context
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
  
  // Create style tag with unique ID for the component
  const componentId = React.useId();
  const glassStyles = createSurface({
    variant,
    blurStrength,
    backgroundOpacity,
    borderOpacity,
    glowIntensity,
    elevation,
    interactive: interactive || !!onClick,
    darkMode,
  });
  
  return (
    <div 
      id={componentId}
      className={`glass-card ${className}`}
      onClick={onClick}
      style={{ maxWidth }}
      {...rest}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        #${componentId} {
          ${glassStyles}
          padding: ${getPadding()};
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
};

// Use our exported GlassSurfacePropTypes for validation
/* eslint-disable react/prop-types */
// @ts-expect-error TypeScript has difficulty with PropTypes validation
GlassCard.propTypes = {
  // Include all glass surface props
  variant: PropTypes.oneOf(['standard', 'frosted', 'dimensional', 'heat']),
  blurStrength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backgroundOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  glowIntensity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  elevation: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['none', 'low', 'medium', 'high'])
  ]),
  interactive: PropTypes.bool,
  darkMode: PropTypes.bool,
  // Component-specific props
  children: PropTypes.node,
  title: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  maxWidth: PropTypes.string
};
/* eslint-enable react/prop-types */

export default GlassCard; 