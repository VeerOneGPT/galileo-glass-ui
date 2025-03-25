/**
 * Icon Component
 * 
 * A component for displaying icons with glass effects
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { cssWithKebabProps } from '../../core/cssUtils';

/**
 * Icon props
 */
export interface IconProps {
  /**
   * The SVG icon component to render
   */
  component?: React.ElementType;

  /**
   * Icon name (for predefined icons)
   */
  name?: string;

  /**
   * Size of the icon
   */
  size?: 'small' | 'medium' | 'large' | number;

  /**
   * Color of the icon
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'inherit' | string;

  /**
   * If true, the icon will have glass effects
   */
  glass?: boolean;

  /**
   * Blur strength for glass effect
   */
  blur?: 'light' | 'medium' | 'strong' | number;

  /**
   * If true, the icon will have an animated glow effect
   */
  glowEffect?: boolean;

  /**
   * If true, the icon will spin
   */
  spin?: boolean;

  /**
   * If true, the icon will pulse
   */
  pulse?: boolean;

  /**
   * If true, the icon will have a subtle hover animation
   */
  hoverEffect?: boolean;

  /**
   * Direction of icon rotation
   */
  rotate?: 0 | 90 | 180 | 270 | number;

  /**
   * If true, flip the icon horizontally
   */
  flipHorizontal?: boolean;

  /**
   * If true, flip the icon vertically
   */
  flipVertical?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * CSS inline style
   */
  style?: React.CSSProperties;
  
  /**
   * HTML title attribute
   */
  title?: string;
  
  /**
   * Function called when the icon is clicked
   */
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  
  /**
   * Additional HTML attributes
   */
  [key: string]: any;
}

/**
 * Get icon size based on size prop
 */
const getIconSize = (size?: 'small' | 'medium' | 'large' | number): string => {
  if (size === undefined || size === 'medium') return '24px';
  if (size === 'small') return '20px';
  if (size === 'large') return '32px';
  return `${size}px`;
};

/**
 * Get icon color based on color prop
 */
const getIconColor = (color?: string, theme?: any): string => {
  if (!color || color === 'inherit') return 'inherit';
  
  const isDarkMode = theme?.palette?.mode === 'dark' || false;
  
  // Default color mappings
  const colorMap: Record<string, string> = {
    primary: isDarkMode ? '#90caf9' : '#1976d2',
    secondary: isDarkMode ? '#ce93d8' : '#9c27b0',
    success: isDarkMode ? '#66bb6a' : '#4caf50',
    warning: isDarkMode ? '#ffa726' : '#ff9800',
    error: isDarkMode ? '#f44336' : '#d32f2f',
    info: isDarkMode ? '#29b6f6' : '#2196f3',
  };
  
  return colorMap[color] || color;
};

/**
 * Get blur value for glass effect
 */
const getBlurValue = (blur?: 'light' | 'medium' | 'strong' | number): string => {
  if (blur === undefined || blur === 'medium') return '4px';
  if (blur === 'light') return '2px';
  if (blur === 'strong') return '8px';
  return `${blur}px`;
};

/**
 * Get transform style based on props
 */
const getTransform = (rotate?: number, flipHorizontal?: boolean, flipVertical?: boolean): string => {
  const transforms: string[] = [];
  
  if (rotate) transforms.push(`rotate(${rotate}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');
  
  return transforms.length ? transforms.join(' ') : 'none';
};

/**
 * Styled icon component
 */
const IconRoot = styled.span<IconProps & { theme: any }>`
  ${props => {
    const size = getIconSize(props.size);
    const color = getIconColor(props.color, props.theme);
    const blurValue = getBlurValue(props.blur);
    const transform = getTransform(props.rotate, props.flipHorizontal, props.flipVertical);
    
    return cssWithKebabProps`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: ${size};
      height: ${size};
      color: ${color};
      font-size: ${size};
      transform: ${transform};
      user-select: none;
      
      & > svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
        
        ${props.glass ? `
          filter: drop-shadow(0 0 ${blurValue} ${color});
        ` : ''}
      }
      
      /* Glass effect */
      ${props.glass ? `
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.05;
          z-index: -1;
          filter: blur(${blurValue});
        }
      ` : ''}
      
      /* Glow effect */
      ${props.glowEffect ? `
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 2px ${color}) drop-shadow(0 0 4px ${color}40);
          }
          50% {
            filter: drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color}80);
          }
        }
        
        & > svg {
          animation: glow 2s ease-in-out infinite;
        }
      ` : ''}
      
      /* Spin animation */
      ${props.spin ? `
        @keyframes spin {
          0% {
            transform: ${transform} rotate(0deg);
          }
          100% {
            transform: ${transform} rotate(360deg);
          }
        }
        
        animation: spin 1.5s linear infinite;
      ` : ''}
      
      /* Pulse animation */
      ${props.pulse ? `
        @keyframes pulse {
          0%, 100% {
            transform: ${transform} scale(1);
            opacity: 1;
          }
          50% {
            transform: ${transform} scale(1.1);
            opacity: 0.8;
          }
        }
        
        animation: pulse 1.5s ease-in-out infinite;
      ` : ''}
      
      /* Hover effect */
      ${props.hoverEffect ? `
        transition: transform 0.2s ease, filter 0.2s ease;
        cursor: pointer;
        
        &:hover {
          transform: ${transform} scale(1.1);
          filter: brightness(1.2);
        }
        
        &:active {
          transform: ${transform} scale(0.95);
        }
      ` : ''}
    `;
  }}
`;

/**
 * Predefined SVG icons that can be used with the name prop
 */
const predefinedIcons: Record<string, React.FC> = {
  close: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  ),
  check: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ),
  error: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  info: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  warning: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  success: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  menu: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  ),
  search: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
};

/**
 * Icon component implementation
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(props, ref) {
  const {
    component: Component,
    name,
    size = 'medium',
    color = 'inherit',
    glass = false,
    blur = 'medium',
    glowEffect = false,
    spin = false,
    pulse = false,
    hoverEffect = false,
    rotate = 0,
    flipHorizontal = false,
    flipVertical = false,
    className,
    style,
    title,
    onClick,
    ...rest
  } = props;

  // Get the icon component to render
  let IconComponent: React.ReactNode = null;
  
  if (Component) {
    IconComponent = <Component />;
  } else if (name && predefinedIcons[name]) {
    const PredefinedIcon = predefinedIcons[name];
    IconComponent = <PredefinedIcon />;
  }
  
  if (!IconComponent) {
    console.warn('Icon component missing or invalid name provided');
    return null;
  }

  return (
    <IconRoot
      ref={ref}
      size={size}
      color={color}
      glass={glass}
      blur={blur}
      glowEffect={glowEffect}
      spin={spin}
      pulse={pulse}
      hoverEffect={hoverEffect || !!onClick}
      rotate={rotate}
      flipHorizontal={flipHorizontal}
      flipVertical={flipVertical}
      className={className}
      style={style}
      title={title}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {IconComponent}
    </IconRoot>
  );
});

export default Icon;