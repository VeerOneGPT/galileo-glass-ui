import styled, { css, keyframes } from 'styled-components';
import { glassSurface } from '../../../core/mixins/glassSurface';
import { glowEffects } from '../../../core/mixins/effects/glowEffects';
import { createThemeContext } from '../../../core/themeContext';

// Animations
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

export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
`;

/**
 * Main carousel container
 */
export const CarouselContainer = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $borderRadius?: string | number;
  $glassVariant: string;
  $blurStrength: string;
}>`
  position: relative;
  width: ${props => props.$width ? 
    (typeof props.$width === 'number' ? `${props.$width}px` : props.$width) : '100%'};
  height: ${props => props.$height ? 
    (typeof props.$height === 'number' ? `${props.$height}px` : props.$height) : '400px'};
  overflow: hidden;
  border-radius: ${props => props.$borderRadius ? 
    (typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius) 
    : '8px'};
  
  /* Apply glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    
    switch (props.$glassVariant) {
      case 'clear':
        return glassSurface({
          elevation: 2,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'light',
          borderOpacity: 'subtle',
          themeContext,
        });
      case 'tinted':
        return glassSurface({
          elevation: 2,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          tintColor: 'var(--color-primary-transparent)',
          themeContext,
        });
      default: // frosted
        return glassSurface({
          elevation: 2,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        });
    }
  }}
  
  /* Performance optimizations */
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  
  /* Common styles */
  user-select: none;
  touch-action: pan-y;
  
  /* Focus styling */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
  
  /* Focus-visible styling for keyboard users */
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 2px;
  }
  
  /* Enhanced keyboard navigation focus styles */
  &[data-keyboard-navigation="true"] {
    /* Show controls more prominently */
    & > button {
      opacity: 1;
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.3);
    }
    
    & > div[role="group"]:focus {
      outline: 2px solid rgba(255, 255, 255, 0.7);
      outline-offset: 2px;
      box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.2);
    }
  }
`;

/**
 * Inner track that holds and moves the slides
 */
export const CarouselTrack = styled.div<{ 
  $spacing: number;
  $isAnimating: boolean;
  $visibleSlides: number;
  $isGrabbing: boolean;
}>`
  display: flex;
  height: 100%;
  transition: ${props => props.$isAnimating ? 'none' : 'transform 0.1s ease-out'};
  gap: ${props => props.$spacing}px;
  
  /* When user is grabbing/dragging, change cursor */
  cursor: ${props => props.$isGrabbing ? 'grabbing' : 'grab'};
  
  /* If we have visible slides, adjust width */
  ${props => props.$visibleSlides > 1 && css`
    & > * {
      flex: 0 0 calc((100% - (${props.$spacing}px * ${props.$visibleSlides - 1})) / ${props.$visibleSlides});
    }
  `}
  
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
`;

/**
 * Individual slide component
 */
export const CarouselSlide = styled.div<{
  $isActive: boolean;
  $isVisible: boolean;
  $color: string;
  $glassVariant: string;
}>`
  flex: 0 0 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  opacity: ${props => props.$isVisible ? 1 : 0.8};
  transition: opacity 0.3s ease;
  will-change: transform, opacity;
  
  /* Active slide styling */
  ${props => props.$isActive && css`
    opacity: 1;
    
    ${props.$glassVariant === 'clear' && css`
      box-shadow: 0 0 15px 1px rgba(255, 255, 255, 0.2);
    `}
  `}
  
  /* Content will take full size */
  & > * {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

/**
 * Caption for slides
 */
export const SlideCaption = styled.div<{
  $color: string;
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 12px;
  font-size: 14px;
  backdrop-filter: blur(4px);
  transition: transform 0.3s ease;
  transform: translateY(0);
  
  /* On non-active slides, partially hide caption */
  ${props => props.$color === 'primary' && css`
    border-top: 1px solid rgba(var(--color-primary-rgb), 0.3);
  `}
  
  ${props => props.$color === 'secondary' && css`
    border-top: 1px solid rgba(var(--color-secondary-rgb), 0.3);
  `}
`;

/**
 * Card container for card content type
 */
export const CardContainer = styled.div<{
  $glassVariant: string;
  $elevation?: 1 | 2 | 3 | 4;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 6px;
  
  /* Apply glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    const elevation = props.$elevation ?? 2;
    
    switch (props.$glassVariant) {
      case 'clear':
        return glassSurface({
          elevation,
          blurStrength: 'standard',
          backgroundOpacity: 'light',
          borderOpacity: 'subtle',
          themeContext,
        });
      case 'tinted':
        return glassSurface({
          elevation,
          blurStrength: 'standard',
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          tintColor: 'var(--color-primary-transparent)',
          themeContext,
        });
      default: // frosted
        return glassSurface({
          elevation,
          blurStrength: 'standard',
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        });
    }
  }}
`;

/**
 * Card media container
 */
export const CardMedia = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  
  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/**
 * Card content container
 */
export const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

/**
 * Card header container
 */
export const CardHeader = styled.div`
  margin-bottom: 12px;
`;

/**
 * Card title
 */
export const CardTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
`;

/**
 * Card subtitle
 */
export const CardSubtitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
`;

/**
 * Card body content
 */
export const CardBody = styled.div`
  flex: 1;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
`;

/**
 * Card actions container
 */
export const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * HTML content container
 */
export const HtmlContent = styled.div`
  padding: 16px;
  height: 100%;
  width: 100%;
  overflow: auto;
  color: rgba(255, 255, 255, 0.9);
  
  /* Basic styling for common HTML elements */
  h1, h2, h3, h4, h5, h6 {
    color: rgba(255, 255, 255, 0.95);
    margin-top: 0;
  }
  
  p {
    margin-bottom: 12px;
  }
  
  a {
    color: #89CFF0;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 12px;
    border-radius: 4px;
    overflow: auto;
    font-family: monospace;
  }
`;

/**
 * Responsive image container with aspect ratio support
 */
export const ResponsiveImage = styled.div<{
  $aspectRatio?: string;
  $objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  $objectPosition?: string;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  ${props => props.$aspectRatio && css`
    &::before {
      content: '';
      display: block;
      padding-top: ${getAspectRatioPadding(props.$aspectRatio)};
    }
  `}
  
  & > img {
    position: ${props => props.$aspectRatio ? 'absolute' : 'relative'};
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: ${props => props.$objectFit || 'cover'};
    object-position: ${props => props.$objectPosition || 'center'};
  }
`;

/**
 * Video container with aspect ratio support
 */
export const VideoContainer = styled.div<{
  $aspectRatio?: string;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  ${props => props.$aspectRatio && css`
    &::before {
      content: '';
      display: block;
      padding-top: ${getAspectRatioPadding(props.$aspectRatio)};
    }
  `}
  
  & > video {
    position: ${props => props.$aspectRatio ? 'absolute' : 'relative'};
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/**
 * Helper function to calculate padding based on aspect ratio
 */
function getAspectRatioPadding(aspectRatio: string): string {
  // Default to 16:9 if invalid format
  if (!aspectRatio || !aspectRatio.includes(':')) {
    return '56.25%'; // 9/16 * 100%
  }
  
  const [width, height] = aspectRatio.split(':').map(Number);
  if (!width || !height) {
    return '56.25%'; // Default to 16:9
  }
  
  return `${(height / width) * 100}%`;
}

/**
 * Navigation arrow buttons
 */
export const NavButton = styled.button<{
  $direction: 'prev' | 'next';
  $color: string;
  $glassVariant: string;
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'prev' ? 'left: 10px;' : 'right: 10px;'}
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  
  /* Glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    
    return props.$glassVariant === 'clear' ? 
      glassSurface({
        elevation: 1,
        blurStrength: 'standard',
        backgroundOpacity: 'light',
        borderOpacity: 'subtle',
        themeContext,
      }) : 
      glassSurface({
        elevation: 1,
        blurStrength: 'standard',
        backgroundOpacity: 'medium',
        borderOpacity: 'subtle',
        themeContext,
      });
  }}
  
  /* Apply glow effect for focus state */
  &:focus {
    outline: none;
    ${props => glowEffects.glassGlow({
      color: `var(--color-${props.$color})`,
      intensity: 'medium',
    })}
  }
  
  /* Hover effects */
  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.05);
  }
  
  /* Active state */
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  /* Arrow icon */
  &:before {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    border-top: 2px solid white;
    border-left: 2px solid white;
    transform: ${props => props.$direction === 'prev' ? 'rotate(-45deg)' : 'rotate(135deg)'};
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    
    &:hover {
      transform: translateY(-50%);
    }
  }
`;

/**
 * Indicators container
 */
export const IndicatorsContainer = styled.div<{
  $type: 'dots' | 'lines' | 'numbers';
  $position?: 'top' | 'bottom';
}>`
  position: absolute;
  ${props => props.$position === 'top' ? 'top: 15px;' : 'bottom: 15px;'}
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 2;
  
  /* Apply animations */
  animation: ${fadeInAnimation} 0.3s ease-out;
`;

/**
 * Individual indicator
 */
export const Indicator = styled.button<{
  $isActive: boolean;
  $type: 'dots' | 'lines' | 'numbers';
  $color: string;
}>`
  border: none;
  background: ${props => props.$isActive ? 
    `rgba(var(--color-${props.$color}-rgb), 0.8)` : 
    'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Type-specific styling */
  ${props => props.$type === 'dots' && css`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    
    ${props.$isActive && css`
      transform: scale(1.2);
      ${glowEffects.glassGlow({
        color: `var(--color-${props.$color})`,
        intensity: 'subtle',
      })}
    `}
  `}
  
  ${props => props.$type === 'lines' && css`
    width: 20px;
    height: 4px;
    border-radius: 2px;
    
    ${props.$isActive && css`
      width: 30px;
      ${glowEffects.glassGlow({
        color: `var(--color-${props.$color})`,
        intensity: 'subtle',
      })}
    `}
  `}
  
  ${props => props.$type === 'numbers' && css`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: white;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    ${props.$isActive && css`
      background: rgba(var(--color-${props.$color}-rgb), 0.9);
      ${glowEffects.glassGlow({
        color: `var(--color-${props.$color})`,
        intensity: 'subtle',
      })}
    `}
  `}
  
  /* Hover effect */
  &:hover {
    background: ${props => props.$isActive ? 
      `rgba(var(--color-${props.$color}-rgb), 1)` : 
      'rgba(255, 255, 255, 0.5)'};
  }
  
  /* Focus styles */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  
  /* Focus visible for keyboard users */
  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

/**
 * Play/Pause control button
 */
export const PlayPauseButton = styled.button<{
  $isPlaying: boolean;
  $position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  $color: string;
  $glassVariant: string;
}>`
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  
  /* Position based on the prop */
  ${props => {
    switch(props.$position) {
      case 'top-left':
        return 'top: 15px; left: 15px;';
      case 'top-right':
        return 'top: 15px; right: 15px;';
      case 'bottom-left':
        return 'bottom: 15px; left: 15px;';
      case 'bottom-right':
        return 'bottom: 15px; right: 15px;';
      case 'center':
        return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
      default:
        return 'bottom: 15px; right: 15px;';
    }
  }}
  
  /* Glass styling */
  ${props => {
    const themeContext = createThemeContext({});
    
    return glassSurface({
      elevation: 1,
      blurStrength: 'standard',
      backgroundOpacity: 'medium',
      borderOpacity: 'subtle',
      themeContext,
    });
  }}
  
  /* Icon styling */
  &:before {
    content: '';
    display: block;
    width: 14px;
    height: 14px;
    
    ${props => props.$isPlaying ? css`
      /* Pause icon */
      background: white;
      clip-path: polygon(0 0, 40% 0, 40% 100%, 0 100%, 0 0, 60% 0, 60% 100%, 100% 100%, 100% 0);
    ` : css`
      /* Play icon */
      clip-path: polygon(0 0, 0 100%, 100% 50%);
      background: white;
    `}
  }
  
  /* Hover effect */
  &:hover {
    opacity: 1;
    transform: ${props => props.$position === 'center' ? 
      'translate(-50%, -50%) scale(1.1)' : 'scale(1.1)'};
  }
  
  /* Active state */
  &:active {
    transform: ${props => props.$position === 'center' ? 
      'translate(-50%, -50%) scale(0.95)' : 'scale(0.95)'};
  }
  
  /* Focus styles */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  
  /* Focus visible for keyboard users */
  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;