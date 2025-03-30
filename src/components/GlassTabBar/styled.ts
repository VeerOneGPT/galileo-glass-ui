/**
 * GlassTabBar Styled Components
 */
import styled, { keyframes } from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glow } from '../../core/mixins/glowEffects';
import { TabItemProps, TabSelectorProps, TabIconProps } from './types';

// Animations
export const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

export const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

export const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
`;

export const fadeAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.4); }
  50% { box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8); }
`;

export const fadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

/**
 * TabBar container component
 */
export const TabBarContainer = styled.div<{
  $orientation: string;
  $variant: string;
  $glassVariant: string;
  $blurStrength: string;
  $elevated: boolean;
  $background: boolean;
  $color: string;
  $width?: string | number;
  $height?: string | number;
  $borderRadius?: string | number;
  $iconPosition?: string;
  $verticalDisplayMode?: string;
  $placement?: string;
  $isResponsive?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'column' : 'row'};
  position: relative;
  
  /* Size handling - Auto size for vertical mode if not specified */
  ${props => {
    if (props.$orientation === 'vertical') {
      return `
        ${props.$width 
          ? `width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};` 
          : `width: ${props.$verticalDisplayMode === 'compact' ? '60px' : props.$verticalDisplayMode === 'icon-only' ? '60px' : '180px'};`
        }
        ${props.$height ? `height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};` : ''}
      `;
    } else {
      return `
        ${props.$width ? `width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};` : ''}
        ${props.$height ? `height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};` : ''}
      `;
    }
  }}
  
  /* Handle container placement */
  ${props => {
    if (props.$placement) {
      switch (props.$placement) {
        case 'left':
          return `
            border-right: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          `;
        case 'right':
          return `
            border-left: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          `;
        case 'bottom':
          return `
            border-top: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          `;
        case 'top':
        default:
          return `
            border-bottom: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          `;
      }
    }
    return '';
  }}
  
  /* Orientation specific styles */
  ${props => props.$orientation === 'vertical' && `
    ${props.$verticalDisplayMode === 'icon-only' ? `
      & > button {
        padding: 12px;
        height: 56px;
      }
    ` : ''}
    
    ${props.$verticalDisplayMode === 'compact' ? `
      & > button {
        padding: 12px 8px;
        height: 48px;
      }
    ` : ''}
  `}
  border-radius: ${props => props.$borderRadius ? 
    typeof props.$borderRadius === 'number' ? 
      `${props.$borderRadius}px` : 
      props.$borderRadius
    : 
    props.$variant === 'pills' ? 
      '50px' : 
      '8px'
  };
  
  ${props => {
    // Apply styles based on variant
    switch (props.$variant) {
      case 'pills':
        return `
          padding: 4px;
          gap: 4px;
        `;
      case 'buttons':
        return `
          padding: 4px;
          gap: 4px;
        `;
      case 'underlined':
        return `
          border-bottom: ${props.$orientation === 'horizontal' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          border-right: ${props.$orientation === 'vertical' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
        `;
      case 'enclosed':
        return `
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px;
        `;
      default:
        return `
          gap: 2px;
          padding: 2px;
        `;
    }
  }}
  
  /* Apply glass styling if background is enabled */
  ${props => props.$background && `
    ${
      (() => {
        const themeContext = createThemeContext({});
        
        // Apply appropriate glass styling
        switch (props.$glassVariant) {
          case 'clear':
            return glassSurface({
              elevation: props.$elevated ? 3 : 1,
              blurStrength: props.$blurStrength as any,
              backgroundOpacity: 'light',
              borderOpacity: 'subtle',
              themeContext,
            });
          case 'tinted':
            return `
              ${glassSurface({
                elevation: props.$elevated ? 3 : 1,
                blurStrength: props.$blurStrength as any,
                backgroundOpacity: 'medium',
                borderOpacity: 'subtle',
                themeContext,
              })}
              
              background-color: ${props.$color !== 'default' ? 
                `var(--color-${props.$color}-transparent)` : 
                'rgba(30, 41, 59, 0.5)'};
            `;
          default: // frosted
            return glassSurface({
              elevation: props.$elevated ? 3 : 1,
              blurStrength: props.$blurStrength as any,
              backgroundOpacity: 'medium',
              borderOpacity: 'subtle',
              themeContext,
            });
        }
      })()
    }
  `}
  
  ${props => props.$elevated && !props.$background && `
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `}
  
  /* Scrollable styles */
  ${props => props.$orientation === 'horizontal' && `
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch; /* Enable smooth scrolling on iOS */
    scroll-behavior: smooth; /* Enable smooth scrolling when not using physics */
    overscroll-behavior-x: contain; /* Prevent scroll chain from propagating */
    will-change: scroll-position, transform; /* Optimize for smooth scrolling */
    
    /* Hide scrollbar */
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    /* Optimize for scrolling performance */
    & > * {
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  `}
  
  ${props => props.$orientation === 'vertical' && `
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch; /* Enable smooth scrolling on iOS */
    scroll-behavior: smooth; /* Enable smooth scrolling when not using physics */
    overscroll-behavior-y: contain; /* Prevent scroll chain from propagating */
    will-change: scroll-position, transform; /* Optimize for smooth scrolling */
    
    /* Hide scrollbar */
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    /* Optimize for scrolling performance */
    & > * {
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  `}
`;

/**
 * Tab item component
 */
export const TabItem = styled.button<TabItemProps>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    // Use custom padding if provided
    if (props.$tabStyle?.padding) {
      return props.$tabStyle.padding;
    }
    
    // Default padding based on orientation and variant
    if (props.$orientation === 'vertical') {
      return props.$variant === 'pills' ? '14px 16px' : '12px 16px';
    }
    return props.$variant === 'pills' ? '10px 20px' : '10px 16px';
  }};
  
  /* Typography styles - use custom or default */
  font-family: ${props => props.$tabStyle?.fontFamily || 
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
  font-size: ${props => props.$tabStyle?.fontSize || '0.875rem'};
  font-weight: ${props => props.$tabStyle?.fontWeight || 500};
  
  /* Base styles */
  background: ${props => props.$active ? 
    (props.$tabStyle?.activeBackgroundColor || 'transparent') :
    (props.$tabStyle?.inactiveBackgroundColor || 'transparent')};
  border: none;
  cursor: pointer;
  transition: ${props => props.$tabStyle?.transitionDuration || 
    'color 0.2s ease, transform 0.15s ease-out, opacity 0.2s ease, background-color 0.2s ease'};
  
  /* Handle text wrapping based on orientation */
  white-space: ${props => props.$orientation === 'vertical' ? 'normal' : 'nowrap'};
  
  /* Vertical tab styles with different icon positions */
  ${props => props.$orientation === 'vertical' && `
    flex-direction: ${props.$iconPosition === 'top' ? 'column' : 'row'};
    text-align: ${props.$iconPosition === 'top' ? 'center' : 'left'};
    padding: ${props.$iconPosition === 'top' ? '12px 8px' : '10px 16px'};
    min-height: ${props.$iconPosition === 'top' ? '64px' : '48px'};
  `}
  
  /* Text color - use custom or default */
  color: ${props => props.$active ? 
    (props.$tabStyle?.activeTextColor || '#fff') : 
    (props.$tabStyle?.inactiveTextColor || 'rgba(255, 255, 255, 0.7)')};
  opacity: ${props => props.$active ? 1 : 0.9};
  will-change: transform, opacity, color;
  
  /* Border radius - use custom or variant-based default */
  border-radius: ${props => {
    if (props.$tabStyle?.borderRadius) {
      return typeof props.$tabStyle.borderRadius === 'number' ? 
        `${props.$tabStyle.borderRadius}px` : props.$tabStyle.borderRadius;
    }
    
    // Default based on variant
    if (props.$variant === 'pills') return '50px';
    if (props.$variant === 'buttons') return '6px';
    if (props.$variant === 'enclosed') return '4px';
    return '0px';
  }};

  /* Tab spacing */
  margin: ${props => {
    if (props.$tabStyle?.tabGap) {
      const gap = typeof props.$tabStyle.tabGap === 'number' ? 
        `${props.$tabStyle.tabGap}px` : props.$tabStyle.tabGap;
      
      return props.$orientation === 'horizontal' ? 
        `0 ${gap} 0 0` : `0 0 ${gap} 0`;
    }
    return '';
  }};
  
  /* Custom shadow for active tab */
  ${props => props.$active && props.$tabStyle?.activeShadow && `
    box-shadow: ${props.$tabStyle.activeShadow};
  `}
  
  /* Magnetic selection effect for non-active tabs */
  ${props => props.$magneticProgress !== undefined && 
    props.$magneticProgress > 0 && 
    !props.$active && 
    props.$animationStyle === 'magnetic' && `
    transform: scale(${1 + props.$magneticProgress * 0.05});
    color: ${props.$tabStyle?.hoverTextColor || 'rgba(255, 255, 255, 1)'};
    opacity: ${0.9 + props.$magneticProgress * 0.1};
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: ${props.$tabStyle?.hoverBackgroundColor || 
        (props.$color === 'default' ? 
          'rgba(255, 255, 255, 0.2)' : 
          `var(--color-${props.$color}-transparent)`)};
      opacity: ${Math.min(0.3, props.$magneticProgress * 0.3)};
      z-index: -1;
      pointer-events: none;
    }
  `}
  
  /* Full width handling */
  ${props => props.$fullWidth && `
    flex: 1;
    ${props.$orientation === 'horizontal' ? 'width: 100%;' : 'height: 100%;'}
  `}
  
  /* Styles based on alignment */
  ${props => {
    if (!props.$fullWidth) {
      switch (props.$alignment) {
        case 'start':
          return 'justify-content: flex-start;';
        case 'end':
          return 'justify-content: flex-end;';
        case 'stretch':
          return props.$orientation === 'horizontal' ? 'width: 100%;' : 'height: 100%;';
        default: // center
          return 'justify-content: center;';
      }
    }
    return '';
  }}
  
  /* Focus styling */
  &:focus {
    outline: none;
    color: ${props => props.$tabStyle?.activeTextColor || '#fff'};
    opacity: 1;
  }
  
  /* Focus-visible for keyboard users */
  &:focus-visible {
    outline: 2px solid ${props => props.$tabStyle?.activeBorderColor || 
      (props.$color === 'default' ? 
        'rgba(255, 255, 255, 0.6)' : 
        `var(--color-${props.$color}-light)`)};
    outline-offset: 2px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
  }
  
  /* Hover styling */
  &:hover {
    color: ${props => props.$tabStyle?.hoverTextColor || '#fff'};
    opacity: 1;
    background-color: ${props => props.$tabStyle?.hoverBackgroundColor || 
      (props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.05)')};
  }
  
  /* Disabled styling */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  /* Variant-specific styling - only apply if custom styles aren't overriding */
  ${props => {
    // If using mostly custom styling, skip default variant styling
    if (props.$tabStyle && 
        (props.$tabStyle.activeBackgroundColor || 
         props.$tabStyle.activeBorderColor || 
         props.$tabStyle.activeTextColor)) {
      // For underlined variant, we still need border handling
      if (props.$variant === 'underlined') {
        const borderColor = props.$tabStyle.activeBorderColor || 
          (props.$color === 'default' ? '#fff' : `var(--color-${props.$color})`);
        
        return props.$orientation === 'horizontal' ? 
          props.$active ? `border-bottom: 2px solid ${borderColor}; margin-bottom: -1px;` : 
          'border-bottom: 2px solid transparent;' :
          props.$active ? `border-right: 2px solid ${borderColor}; margin-right: -1px;` : 
          'border-right: 2px solid transparent;';
      }
      return '';
    }
    
    // Default variant styling
    switch (props.$variant) {
      case 'pills':
        return props.$active ? `
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.2)' : 
            `var(--color-${props.$color})`};
          color: #fff;
          
          ${props.$glassVariant !== 'clear' && !props.$tabStyle?.activeShadow && `
            box-shadow: 0 2px 8px ${props.$color === 'default' ? 
              'rgba(0, 0, 0, 0.2)' : 
              `var(--color-${props.$color}-shadow)`};
          `}
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.1)'};
          }
        `;
      
      case 'buttons':
        return props.$active ? `
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.15)' : 
            `var(--color-${props.$color}-transparent)`};
          color: #fff;
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.05)'};
          }
        `;
      
      case 'underlined':
        const borderColor = props.$tabStyle?.activeBorderColor || 
          (props.$color === 'default' ? '#fff' : `var(--color-${props.$color})`);
        
        return props.$orientation === 'horizontal' ? 
          props.$active ? `
            border-bottom: 2px solid ${borderColor};
            margin-bottom: -1px;
          ` : `
            border-bottom: 2px solid transparent;
          ` :
          // Vertical orientation
          props.$active ? `
            border-right: 2px solid ${borderColor};
            margin-right: -1px;
          ` : `
            border-right: 2px solid transparent;
          `;
      
      case 'enclosed':
        return props.$active ? `
          background-color: rgba(255, 255, 255, 0.1);
          color: #fff;
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.05)'};
          }
        `;
      
      default:
        return props.$active ? `
          color: #fff;
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.05)'};
          }
        `;
    }
  }}
`;

/**
 * Base tab badge component
 */
export const TabBadgeBase = styled.span<{ 
  $color: string;
  $backgroundColor?: string;
  $textColor?: string;
  $borderColor?: string;
  $borderWidth?: string;
  $opacity?: number;
  $scale?: number;
  $boxShadow?: string;
  $animationType?: string;
  $hidden?: boolean;
  $borderRadius?: string;
  $size?: string | number;
  $padding?: string;
  $fontSize?: string;
  $fontWeight?: string | number;
  $margin?: string;
}>`
  display: ${props => props.$hidden ? 'none' : 'inline-flex'};
  align-items: center;
  justify-content: center;
  min-width: ${props => props.$size ? 
    (typeof props.$size === 'number' ? `${props.$size}px` : props.$size) : 
    '20px'};
  height: ${props => props.$size ? 
    (typeof props.$size === 'number' ? `${props.$size}px` : props.$size) : 
    '20px'};
  padding: ${props => props.$padding || '0 6px'};
  border-radius: ${props => props.$borderRadius || '10px'};
  background-color: ${props => props.$backgroundColor || 
    (props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.2)' : 
      `var(--color-${props.$color})`)};
  color: ${props => props.$textColor || '#fff'};
  font-size: ${props => props.$fontSize || '0.75rem'};
  font-weight: ${props => props.$fontWeight || 'normal'};
  margin: ${props => props.$margin || '0 0 0 8px'};
  transform: scale(${props => props.$scale || 1});
  position: relative;
  z-index: 1;
  
  ${props => props.$borderColor && props.$borderWidth && `
    border: ${props.$borderWidth} solid ${props.$borderColor};
  `}
  
  ${props => props.$opacity !== undefined && `
    opacity: ${props.$opacity};
  `}
  
  ${props => props.$boxShadow && `
    box-shadow: ${props.$boxShadow};
  `}
  
  will-change: transform, opacity, background-color, box-shadow;
`;

/**
 * Animated badge component with different animation types
 */
export const AnimatedBadge = styled(TabBadgeBase)<{
  $animationType: string;
  $duration: number;
  $delay: number;
  $loop: boolean;
  $count?: number;
  $glowColor?: string;
  $glowIntensity?: number;
}>`
  animation-delay: ${props => `${props.$delay}ms`};
  animation-duration: ${props => `${props.$duration}ms`};
  animation-timing-function: ease-in-out;
  animation-fill-mode: both;
  animation-iteration-count: ${props => props.$loop ? 'infinite' : props.$count || 1};
  
  ${props => {
    switch (props.$animationType) {
      case 'pulse':
        return `animation-name: ${pulseAnimation};`;
      case 'bounce':
        return `animation-name: ${bounceAnimation};`;
      case 'shake':
        return `animation-name: ${shakeAnimation};`;
      case 'fade':
        return `animation-name: ${fadeAnimation};`;
      case 'glow':
        return `
          animation-name: ${glowAnimation};
          box-shadow: 0 0 4px 1px ${props.$glowColor || 'rgba(255, 255, 255, 0.4)'};
        `;
      default:
        return '';
    }
  }}
`;

/**
 * Tab icon wrapper
 */
export const TabIcon = styled.span<TabIconProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    if (!props.$showLabel) {
      return 'margin: 0;';
    }
    
    if (props.$orientation === 'vertical') {
      if (props.$iconPosition === 'top') {
        return `
          margin: 0 0 8px 0;
          font-size: 1.5rem;
        `;
      } else {
        return `
          margin-right: 12px;
          font-size: 1.25rem;
        `;
      }
    } else {
      return `
        margin-right: 8px;
        font-size: 1.25rem;
      `;
    }
  }}
`;

/**
 * Tab selector indicator with enhanced physics and magnetic behavior
 */
export const TabSelector = styled.div<TabSelectorProps>`
  position: absolute;
  pointer-events: none;
  z-index: 1;
  transition: ${props => props.$animationStyle === 'none' ? 'none' : 'filter 0.3s ease, opacity 0.3s ease'};
  will-change: transform, width, height, opacity, box-shadow;
  
  /* Selection progress effect for magnetic selection */
  ${props => props.$selectionProgress !== undefined && props.$selectionProgress > 0 && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: ${props.$tabStyle?.selectorStyle?.backgroundColor || 
        (props.$color === 'default' ? 
          'rgba(255, 255, 255, 0.8)' : 
          `var(--color-${props.$color})`)};
      opacity: ${Math.min(0.4, props.$selectionProgress * 0.4)};
      filter: blur(${Math.min(8, props.$selectionProgress * 8)}px);
      z-index: -1;
      transform: scale(${1 + props.$selectionProgress * 0.1});
      transition: transform 0.1s ease-out, opacity 0.1s ease-out, filter 0.1s ease-out;
    }
  `}
  
  /* Custom border if specified */
  ${props => props.$tabStyle?.selectorStyle?.border && `
    border: ${props.$tabStyle.selectorStyle.border};
  `}
  
  /* Custom border radius if specified, otherwise use variant-based */
  border-radius: ${props => {
    if (props.$tabStyle?.selectorStyle?.borderRadius) {
      return typeof props.$tabStyle.selectorStyle.borderRadius === 'number' ? 
        `${props.$tabStyle.selectorStyle.borderRadius}px` : 
        props.$tabStyle.selectorStyle.borderRadius;
    }
    
    // Default based on variant
    if (props.$variant === 'pills') return '50px';
    if (props.$variant === 'buttons') return '6px';
    if (props.$variant === 'enclosed') return '4px';
    return '0px';
  }};
  
  /* Custom box shadow if specified */
  ${props => props.$tabStyle?.selectorStyle?.boxShadow && `
    box-shadow: ${props.$tabStyle.selectorStyle.boxShadow};
  `}
  
  /* Variants - only apply if no custom selector background is specified */
  ${props => {
    // If a custom background color is specified, use that instead of variant styling
    if (props.$tabStyle?.selectorStyle?.backgroundColor) {
      return `
        background-color: ${props.$tabStyle.selectorStyle.backgroundColor};
        ${
          !props.$tabStyle?.selectorStyle?.boxShadow && 
          props.$variant === 'pills' && 
          props.$glowEffect && 
          props.$color !== 'default' && 
          `box-shadow: 0 0 15px ${`var(--color-${props.$color}-shadow)`};`
        }
      `;
    }
    
    const themeContext = createThemeContext({});
    
    switch (props.$variant) {
      case 'pills':
        return `
          border-radius: 50px;
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.2)' : 
            `var(--color-${props.$color})`};
          ${props.$glowEffect && props.$color !== 'default' && glow.glass({
            glowIntensity: 'subtle',
            glowColor: props.$color,
            themeContext: createThemeContext(props.theme)
          })}
        `;
      
      case 'buttons':
        return `
          border-radius: 6px;
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.15)' : 
            `var(--color-${props.$color}-transparent)`};
        `;
      
      case 'underlined':
        return props.$orientation === 'horizontal' ? `
          height: 2px;
          bottom: 0;
          background-color: ${props.$tabStyle?.activeBorderColor || 
            (props.$color === 'default' ? 
              '#fff' : 
              `var(--color-${props.$color})`)};
        ` : `
          width: 2px;
          right: 0;
          background-color: ${props.$tabStyle?.activeBorderColor || 
            (props.$color === 'default' ? 
              '#fff' : 
              `var(--color-${props.$color})`)};
        `;
      
      case 'enclosed':
        return `
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.1);
        `;
      
      default:
        return `
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.1);
        `;
    }
  }}
  
  /* Glow effect for pills - only if no custom shadow */
  ${props => 
    !props.$tabStyle?.selectorStyle?.boxShadow && 
    props.$variant === 'pills' && 
    props.$glowEffect && 
    props.$color !== 'default' && 
    `box-shadow: 0 0 15px ${`var(--color-${props.$color}-shadow)`};`
  }
  
  /* Animation style-specific effects */
  ${props => {
    switch (props.$animationStyle) {
      case 'magnetic':
        return `
          transition: none;
          &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: inherit;
            opacity: 0.5;
            background: inherit;
            filter: blur(6px);
            z-index: -1;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          
          /* Liquid-like effect for magnetic animation */
          transform-origin: center center;
          backface-visibility: hidden;
          
          ${props.$variant === 'pills' ? `
            &:before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              border-radius: inherit;
              background: radial-gradient(
                circle at center,
                ${props.$tabStyle?.selectorStyle?.backgroundColor || 
                  (props.$color === 'default' ? 
                    'rgba(255, 255, 255, 0.2)' : 
                    `var(--color-${props.$color})`)} 0%,
                transparent 70%
              );
              opacity: 0.3;
              z-index: -2;
              filter: blur(2px);
              transition: opacity 0.3s ease;
            }
          ` : ''}
        `;
        
      case 'inertial':
        return `
          transition: none;
          transform-origin: center center;
          
          /* Trail effect for inertial animation */
          ${props.$variant === 'pills' ? `
            &:after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border-radius: inherit;
              background: inherit;
              opacity: 0.3;
              z-index: -1;
              filter: blur(8px);
              transform: scale(1.05);
              transition: opacity 0.1s ease, transform 0.1s ease;
            }
          ` : ''}
        `;
        
      case 'spring':
        return `
          transition: none;
          transform-origin: center center;
          
          /* Bounce effect for spring animation */
          ${props.$variant === 'pills' ? `
            &:after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border-radius: inherit;
              background: inherit;
              opacity: 0.2;
              z-index: -1;
              filter: blur(4px);
              transition: transform 0.2s ease;
            }
          ` : ''}
        `;
        
      default:
        return '';
    }
  }}
`;

/**
 * Scroll button component
 */
export const ScrollButton = styled.button<{ $direction: 'left' | 'right' | 'up' | 'down' }>`
  position: absolute;
  ${props => {
    if (props.$direction === 'left') return 'left: 0;';
    if (props.$direction === 'right') return 'right: 0;';
    if (props.$direction === 'up') return 'top: 0;';
    return 'bottom: 0;';
  }}
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$direction === 'left' || props.$direction === 'right' ? '24px' : '100%'};
  height: ${props => props.$direction === 'up' || props.$direction === 'down' ? '24px' : '100%'};
  background: linear-gradient(to ${props => props.$direction}, 
    rgba(0, 0, 0, 0.3), 
    transparent
  );
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  
  &:hover {
    color: #fff;
  }
  
  &:focus {
    outline: none;
    color: #fff;
  }
`;

/**
 * Collapsed menu button style
 */
export const MoreButton = styled(TabItem)`
  position: relative;
`;

/**
 * Collapsed menu container
 */
export const CollapsedMenu = styled.div<{
  $open: boolean;
  $orientation: string;
  $variant: string;
  $color: string;
  $glassVariant: string;
}>`
  position: absolute;
  z-index: 10;
  overflow: hidden;
  display: ${props => props.$open ? 'block' : 'none'};
  min-width: 180px;
  margin-top: ${props => props.$orientation === 'horizontal' ? '8px' : '0'};
  margin-left: ${props => props.$orientation === 'vertical' ? '8px' : '0'};
  
  /* Position menu depending on orientation */
  ${props => {
    if (props.$orientation === 'horizontal') {
      return `
        bottom: auto;
        right: 0;
        top: 100%;
        left: auto;
      `;
    } else {
      return `
        bottom: auto;
        right: auto;
        top: 0;
        left: 100%;
      `;
    }
  }}
  
  /* Glass styling */
  background-color: rgba(18, 26, 36, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  /* Animation */
  animation: ${fadeInAnimation} 0.2s ease-out forwards;
  transform-origin: top right;
`;

/**
 * Menu item in collapsed menu
 */
export const CollapsedMenuItem = styled.button<{
  $active: boolean;
  $color: string;
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.875rem;
  
  &:hover {
    background-color: ${props => props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.1)' : 
      `var(--color-${props.$color}-transparent)`};
  }
  
  &:focus {
    outline: none;
    background-color: ${props => props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.1)' : 
      `var(--color-${props.$color}-transparent)`};
  }
  
  /* Active state */
  ${props => props.$active && `
    background-color: ${props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.15)' : 
      `var(--color-${props.$color}-transparent)`};
    font-weight: 500;
  `}
`;