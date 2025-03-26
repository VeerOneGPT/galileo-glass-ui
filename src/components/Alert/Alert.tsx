import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, slideRight } from '../../animations/keyframes/basic';

export interface AlertProps {
  /**
   * The content of the alert
   */
  children: React.ReactNode;
  
  /**
   * The severity of the alert
   */
  severity?: 'success' | 'info' | 'warning' | 'error';
  
  /**
   * The variant of the alert
   */
  variant?: 'standard' | 'filled' | 'outlined' | 'glass';
  
  /**
   * The title of the alert
   */
  title?: string;
  
  /**
   * The icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * If true, the alert will take up the full width of its container
   */
  fullWidth?: boolean;
  
  /**
   * If true, the alert will be closable
   */
  closable?: boolean;
  
  /**
   * Callback fired when the alert is closed
   */
  onClose?: () => void;
  
  /**
   * The size of the alert
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * If true, adds a subtle animation
   */
  animated?: boolean;
}

// Get color based on severity
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'success':
      return '#10B981';
    case 'info':
      return '#3B82F6';
    case 'warning':
      return '#F59E0B';
    case 'error':
      return '#EF4444';
    default:
      return '#3B82F6';
  }
};

// Get color with opacity
const getColorWithOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Default icons for each severity
const getDefaultIcon = (severity: string): string => {
  switch (severity) {
    case 'success':
      return '✓';
    case 'info':
      return 'ℹ';
    case 'warning':
      return '⚠';
    case 'error':
      return '✕';
    default:
      return 'ℹ';
  }
};

// Styled components
const AlertRoot = styled.div<{
  $severity: string;
  $variant: string;
  $fullWidth: boolean;
  $size: string;
  $animated: boolean;
}>`
  display: flex;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  position: relative;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  
  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 6px 12px;
          font-size: 0.8125rem;
          border-radius: 4px;
        `;
      case 'large':
        return `
          padding: 12px 20px;
          font-size: 0.9375rem;
          border-radius: 8px;
        `;
      default: // medium
        return `
          padding: 10px 16px;
          font-size: 0.875rem;
          border-radius: 6px;
        `;
    }
  }}
  
  /* Variant styles */
  ${props => {
    const color = getSeverityColor(props.$severity);
    
    switch (props.$variant) {
      case 'filled':
        return `
          background-color: ${color};
          color: white;
        `;
      case 'outlined':
        return `
          background-color: transparent;
          border: 1px solid ${color};
          color: ${color};
        `;
      case 'glass':
        return `
          background-color: ${getColorWithOpacity(color, 0.12)};
          color: ${color};
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid ${getColorWithOpacity(color, 0.3)};
        `;
      default: // standard
        return `
          background-color: ${getColorWithOpacity(color, 0.12)};
          color: ${color};
        `;
    }
  }}
  
  /* Glass effect for glass variant */
  ${props => props.$variant === 'glass' && glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    backgroundOpacity: 'subtle',
    borderOpacity: 'medium',
    themeContext: createThemeContext({})
  })}
  
  /* Subtle glow for filled and glass variants */
  ${props => (props.$variant === 'filled' || props.$variant === 'glass') && glassGlow({
    glowIntensity: 'light',
    glowColor: getSeverityColor(props.$severity),
    themeContext: createThemeContext({})
  })}
  
  /* Animation if enabled */
  ${props => props.$animated && accessibleAnimation({
    animation: fadeIn,
    duration: '0.3s',
    easing: 'ease-out'
  })}
`;

const AlertIcon = styled.div<{ $severity: string; $variant: string }>`
  display: flex;
  align-items: center;
  font-size: 1.25em;
  margin-right: 12px;
  color: ${props => props.$variant === 'filled' ? 'white' : getSeverityColor(props.$severity)};
`;

const AlertContent = styled.div`
  flex: 1;
  padding: 0;
`;

const AlertTitle = styled.div<{ $hasChildren: boolean }>`
  font-weight: 600;
  margin-bottom: ${props => props.$hasChildren ? '4px' : '0'};
`;

const AlertMessage = styled.div`
  font-weight: 400;
`;

const AlertCloseButton = styled.button<{ $variant: string; $severity: string }>`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  font-size: 1.2em;
  color: ${props => props.$variant === 'filled' ? 'white' : getSeverityColor(props.$severity)};
  opacity: 0.7;
  border-radius: 50%;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.08);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => getColorWithOpacity(getSeverityColor(props.$severity), 0.4)};
  }
`;

/**
 * Alert Component
 * 
 * Component for displaying alert messages with different severities.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  const {
    children,
    severity = 'info',
    variant = 'standard',
    title,
    icon,
    fullWidth = false,
    closable = false,
    onClose,
    size = 'medium',
    className,
    animated = true,
    ...rest
  } = props;
  
  const [visible, setVisible] = useState(true);
  
  // Handle close button click
  const handleClose = () => {
    setVisible(false);
    
    if (onClose) {
      onClose();
    }
  };
  
  // If alert has been closed, don't render anything
  if (!visible) {
    return null;
  }
  
  // Determine which icon to show
  const alertIcon = icon ?? getDefaultIcon(severity);
  
  return (
    <AlertRoot
      ref={ref}
      className={className}
      $severity={severity}
      $variant={variant}
      $fullWidth={fullWidth}
      $size={size}
      $animated={animated}
      role="alert"
      {...rest}
    >
      <AlertIcon $severity={severity} $variant={variant}>
        {alertIcon}
      </AlertIcon>
      
      <AlertContent>
        {title && (
          <AlertTitle $hasChildren={!!children}>
            {title}
          </AlertTitle>
        )}
        
        {children && (
          <AlertMessage>{children}</AlertMessage>
        )}
      </AlertContent>
      
      {closable && (
        <AlertCloseButton 
          onClick={handleClose}
          $variant={variant}
          $severity={severity}
          aria-label="Close"
        >
          &times;
        </AlertCloseButton>
      )}
    </AlertRoot>
  );
});

Alert.displayName = 'Alert';

/**
 * GlassAlert Component
 * 
 * Alert component with glass morphism styling.
 */
export const GlassAlert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Alert
      ref={ref}
      className={`glass-alert ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassAlert.displayName = 'GlassAlert';