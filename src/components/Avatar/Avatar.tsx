import React, { forwardRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';

export interface AvatarProps {
  /**
   * The alt text for the avatar
   */
  alt?: string;
  
  /**
   * The src attribute for the img element
   */
  src?: string;
  
  /**
   * The fallback letter to use when src is not available and alt is provided
   */
  children?: React.ReactNode;
  
  /**
   * The variant of the avatar
   */
  variant?: 'circular' | 'rounded' | 'square';
  
  /**
   * The size of the avatar
   */
  size?: 'small' | 'medium' | 'large' | number;
  
  /**
   * The color to use for the avatar background when src is not available
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | string;
  
  /**
   * If true, the component will use glass styling
   */
  glassEffect?: boolean;
  
  /**
   * If true, the avatar will be surrounded by a border
   */
  bordered?: boolean;
  
  /**
   * If true, the avatar will have a shadow
   */
  elevated?: boolean;
  
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * Triggered when an error occurs on the img element
   */
  onError?: React.EventHandler<React.SyntheticEvent<HTMLImageElement>>;
  
  /**
   * Callback fired when the avatar is clicked
   */
  onClick?: React.EventHandler<React.MouseEvent<HTMLDivElement>>;
}

// Get color by name for theme consistency
const getColorByName = (color: string): string => {
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color; // If already a valid CSS color, return it
  }
  
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#6366F1';
  }
};

// Generate a consistent color from a string (name)
const stringToColor = (string: string): string => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  
  return color;
};

// Get size value based on size prop
const getSizeValue = (size: 'small' | 'medium' | 'large' | number): number => {
  if (typeof size === 'number') {
    return size;
  }
  
  switch (size) {
    case 'small':
      return 32;
    case 'large':
      return 56;
    default: // medium
      return 40;
  }
};

// Get font size based on avatar size
const getFontSize = (size: number): number => {
  return Math.floor(size * 0.4);
};

// Get border radius based on variant and size
const getBorderRadius = (variant: string, size: number): string => {
  switch (variant) {
    case 'rounded':
      return `${size * 0.125}px`;
    case 'square':
      return '0';
    default: // circular
      return '50%';
  }
};

// Extract first letter from string
const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.charAt(0).toUpperCase();
  }
  
  // Return first letters of first and last parts
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

// Styled components
const AvatarRoot = styled.div<{
  $size: number;
  $variant: string;
  $color: string;
  $glassEffect: boolean;
  $bordered: boolean;
  $elevated: boolean;
  $hasImage: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: ${props => getBorderRadius(props.$variant, props.$size)};
  background-color: ${props => props.$hasImage ? 'transparent' : props.$color};
  color: ${props => {
    // Determine if background color is light or dark
    const color = props.$color;
    
    // Simple heuristic for detecting light colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Perceived brightness formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      return brightness > 128 ? 'rgba(0, 0, 0, 0.87)' : 'white';
    }
    
    return 'white'; // Default for non-hex colors
  }};
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: ${props => getFontSize(props.$size)}px;
  user-select: none;
  overflow: hidden;
  transition: all 0.2s ease;
  
  /* Border styles */
  border: ${props => props.$bordered ? `2px solid white` : 'none'};
  
  /* Elevation with shadow */
  box-shadow: ${props => props.$elevated 
    ? '0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12)'
    : 'none'
  };
  
  /* Glass effect for glass styling */
  ${props => props.$glassEffect && !props.$hasImage && glassSurface({
    elevation: props.$elevated ? 2 : 1,
    blurStrength: 'standard',
    backgroundOpacity: 'medium',
    borderOpacity: props.$bordered ? 'high' : 'subtle',
    themeContext: createThemeContext({})
  })}
  
  /* Glass glow for glass styling */
  ${props => props.$glassEffect && !props.$hasImage && glassGlow({
    intensity: 'low',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
  
  /* Edge highlight for bordered avatars */
  ${props => props.$bordered && !props.$hasImage && edgeHighlight({
    position: 'all',
    thickness: 2,
    opacity: 0.7,
    themeContext: createThemeContext({})
  })}
  
  /* Clickable avatar styles */
  ${props => props.onClick && `
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  `}
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  text-align: center;
  object-fit: cover;
  color: transparent;
  text-indent: 10000px;
`;

const AvatarChildren = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

/**
 * Avatar Component
 * 
 * A component to display user avatars or icons.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const {
    alt,
    src,
    children,
    variant = 'circular',
    size = 'medium',
    color: colorProp,
    glassEffect = false,
    bordered = false,
    elevated = false,
    className,
    onError,
    onClick,
    ...rest
  } = props;
  
  const [imgError, setImgError] = useState(false);
  
  // Reset error state when src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);
  
  // Handle image load error
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImgError(true);
    
    if (onError) {
      onError(event);
    }
  };
  
  // Determine color to use
  let color: string;
  if (colorProp) {
    color = getColorByName(colorProp);
  } else if (alt) {
    color = stringToColor(alt);
  } else {
    color = '#6366F1'; // Default primary color
  }
  
  // Determine content for the avatar
  const sizeValue = getSizeValue(size);
  const hasImage = src && !imgError;
  
  // Determine what to render inside the avatar
  const renderContent = () => {
    if (hasImage) {
      return <AvatarImg src={src} alt={alt} onError={handleError} />;
    }
    
    if (children) {
      return <AvatarChildren>{children}</AvatarChildren>;
    }
    
    if (alt) {
      return getInitials(alt);
    }
    
    return null;
  };
  
  return (
    <AvatarRoot
      ref={ref}
      className={className}
      $size={sizeValue}
      $variant={variant}
      $color={color}
      $glassEffect={glassEffect}
      $bordered={bordered}
      $elevated={elevated}
      $hasImage={hasImage}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {renderContent()}
    </AvatarRoot>
  );
});

Avatar.displayName = 'Avatar';

/**
 * GlassAvatar Component
 * 
 * An avatar component with glass morphism styling.
 */
export const GlassAvatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const {
    className,
    glassEffect = true,
    ...rest
  } = props;
  
  return (
    <Avatar
      ref={ref}
      className={`glass-avatar ${className || ''}`}
      glassEffect={glassEffect}
      {...rest}
    />
  );
});

GlassAvatar.displayName = 'GlassAvatar';