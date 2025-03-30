// TypeScript-friendly PropTypes implementation
import React from 'react';
// import PropTypes from 'prop-types'; // Removed import
import styled from 'styled-components';

// Define our own prop types without relying on external imports
interface GlassCardProps {
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

  /**
   * Card variant
   */
  variant?: 'standard' | 'frosted' | 'dimensional' | 'heat';
  
  /**
   * Blur strength
   */
  blurStrength?: string | number;
  
  /**
   * Background opacity
   */
  backgroundOpacity?: string | number;
  
  /**
   * Border opacity
   */
  borderOpacity?: string | number;
  
  /**
   * Glow intensity
   */
  glowIntensity?: string | number;
  
  /**
   * Elevation level
   */
  elevation?: number | 'none' | 'low' | 'medium' | 'high';
  
  /**
   * Interactive state
   */
  interactive?: boolean;
  
  /**
   * Dark mode
   */
  darkMode?: boolean;
}

/**
 * GlassCard Component
 * 
 * A card component with glass morphism styling.
 * Utilizes glass surface props for consistent glass styling.
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
  // Get Glass effects from context - replace with proper access method
  // This would need to be updated to match the actual implementation
  const createSurface = (props: any) => {
    // Placeholder implementation
    return `
      backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
  };
  
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

// Define propTypes for runtime validation
// Removed GlassCard.propTypes definition
// GlassCard.propTypes = { ... };

export default GlassCard; 