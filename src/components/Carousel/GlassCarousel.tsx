/**
 * GlassCarousel Component
 * 
 * A glass-styled carousel component with physics-based animations,
 * momentum scrolling, and snap points for natural interactions.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled, { css, keyframes, FlattenSimpleInterpolation } from 'styled-components';

// Import physics-related dependencies
import { useInertialMovement2D } from '../../animations/physics/useInertialMovement2D';
import { useMomentum } from '../../animations/physics/useMomentum';
import { useSpring } from '../../animations/physics/useSpring';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { useThemeColor } from '../../hooks/useGlassTheme';
import { MomentumResult } from '../../animations/physics/momentum';

/**
 * Vector2D interface for position coordinates
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Media aspect ratio options
 */
export type AspectRatio = '1:1' | '4:3' | '16:9' | '21:9' | '3:2' | '2:3' | '1:2' | '9:16' | 'custom';

/**
 * Content types for carousel items
 */
export type ContentType = 'image' | 'video' | 'custom' | 'html' | 'card';

/**
 * Type for video sources with multiple formats
 */
export interface VideoSource {
  src: string;
  type: string;
}

/**
 * Image options for carousel items
 */
export interface ImageOptions {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Loading strategy */
  loading?: 'eager' | 'lazy';
  /** Aspect ratio */
  aspectRatio?: AspectRatio;
  /** Whether to use object-fit: cover */
  cover?: boolean;
  /** Custom object-fit value */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Custom object-position value */
  objectPosition?: string;
}

/**
 * Video options for carousel items
 */
export interface VideoOptions {
  /** Video source URL or multiple sources for different formats */
  src: string | VideoSource[];
  /** Video poster image */
  poster?: string;
  /** Whether to autoplay the video */
  autoplay?: boolean;
  /** Whether to loop the video */
  loop?: boolean;
  /** Whether to mute the video */
  muted?: boolean;
  /** Whether to show controls */
  controls?: boolean;
  /** Whether to play video only when slide is active */
  playWhenActive?: boolean;
  /** Whether to pause when slide is not visible */
  pauseWhenInactive?: boolean;
  /** Aspect ratio */
  aspectRatio?: AspectRatio;
}

/**
 * Card options for glass card styled content
 */
export interface CardOptions {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card content */
  content?: React.ReactNode;
  /** Card image */
  image?: string;
  /** Card actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Card icon */
  icon?: React.ReactNode;
  /** Custom glass variant for this card */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  /** Card elevation */
  elevation?: 1 | 2 | 3 | 4;
}

/**
 * HTML content options
 */
export interface HtmlOptions {
  /** HTML content as string */
  html: string;
  /** Whether to sanitize the HTML */
  sanitize?: boolean;
}

/**
 * CarouselItem interface for carousel content
 */
export interface CarouselItem {
  /** Unique identifier */
  id?: string;
  /** Content to render in the slide (can be any React node) */
  content?: React.ReactNode;
  /** Content type */
  contentType?: ContentType;
  /** Image options (when contentType is 'image') */
  image?: ImageOptions;
  /** Video options (when contentType is 'video') */
  video?: VideoOptions;
  /** Card options (when contentType is 'card') */
  card?: CardOptions;
  /** HTML options (when contentType is 'html') */
  html?: HtmlOptions;
  /** Optional caption text */
  caption?: string;
  /** Background color for this specific item */
  backgroundColor?: string;
  /** Optional alt text for accessibility (if content is an image) */
  alt?: string;
  /** Whether to disable this item */
  disabled?: boolean;
  /** Custom styles for this item */
  style?: React.CSSProperties;
}

/**
 * Snap point configuration for advanced slide snapping
 */
export interface SnapPointConfig {
  /** Position for the snap point (in pixels or ratio from 0.0-1.0) */
  position: number;
  /** Whether the position is a ratio (0.0-1.0) or absolute pixels */
  isRatio?: boolean;
  /** Snap strength for this snap point (0.0-1.0) */
  strength?: number;
  /** Threshold in pixels around the snap point where snapping starts */
  threshold?: number;
  /** Whether the snap point is enabled */
  enabled?: boolean;
  /** Minimum velocity required to bypass this snap point */
  velocityThreshold?: number;
  /** Resistance factor for this specific snap point (0.0-1.0) */
  resistance?: number;
  /** Name or label for the snap point */
  name?: string;
}

/**
 * Responsive sizing for different breakpoints
 */
export interface ResponsiveOptions {
  /** Options for small screens (< 768px) */
  small?: {
    /** Number of visible slides */
    visibleSlides?: number;
    /** Spacing between slides */
    spacing?: number;
    /** Height of the carousel */
    height?: string | number;
    /** Whether to show arrows */
    arrows?: boolean;
    /** Whether to show indicators */
    indicators?: boolean | 'dots' | 'lines' | 'numbers';
    /** Type of indicator to show */
    indicatorType?: 'dots' | 'lines' | 'numbers';
    /** Whether to show play/pause control */
    showPlayPauseControl?: boolean;
    /** Position of play/pause control */
    playPausePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
  /** Options for medium screens (768px - 1199px) */
  medium?: {
    /** Number of visible slides */
    visibleSlides?: number;
    /** Spacing between slides */
    spacing?: number;
    /** Height of the carousel */
    height?: string | number;
    /** Whether to show arrows */
    arrows?: boolean;
    /** Whether to show indicators */
    indicators?: boolean | 'dots' | 'lines' | 'numbers';
    /** Type of indicator to show */
    indicatorType?: 'dots' | 'lines' | 'numbers';
    /** Whether to show play/pause control */
    showPlayPauseControl?: boolean;
    /** Position of play/pause control */
    playPausePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
  /** Options for large screens (≥ 1200px) */
  large?: {
    /** Number of visible slides */
    visibleSlides?: number;
    /** Spacing between slides */
    spacing?: number;
    /** Height of the carousel */
    height?: string | number;
    /** Whether to show arrows */
    arrows?: boolean;
    /** Whether to show indicators */
    indicators?: boolean | 'dots' | 'lines' | 'numbers';
    /** Type of indicator to show */
    indicatorType?: 'dots' | 'lines' | 'numbers';
    /** Whether to show play/pause control */
    showPlayPauseControl?: boolean;
    /** Position of play/pause control */
    playPausePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
}

/**
 * Aspect ratio options for the carousel
 */
export interface CarouselAspectRatio {
  /** Width ratio */
  width: number;
  /** Height ratio */
  height: number;
}

/**
 * GlassCarousel Props
 */
export interface GlassCarouselProps {
  /** Array of items to display in the carousel */
  items: CarouselItem[];
  /** Active slide index */
  activeSlide?: number;
  /** Callback when active slide changes */
  onChange?: (index: number) => void;
  /** Whether to enable auto-play */
  autoPlay?: boolean;
  /** Auto-play interval in ms */
  autoPlayInterval?: number;
  /** Pause auto-play on hover */
  pauseOnHover?: boolean;
  /** Pause auto-play on focus */
  pauseOnFocus?: boolean;
  /** Display indicators */
  indicators?: boolean | 'dots' | 'lines' | 'numbers'; 
  /** Display navigation arrows */
  arrows?: boolean;
  /** Show play/pause control for autoPlay */
  showPlayPauseControl?: boolean;
  /** Position of the play/pause control */
  playPausePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  /** Allow user interactions (touch, mouse) */
  interactive?: boolean;
  /** Enable infinite scrolling */
  infinite?: boolean;
  /** Physics configuration for scrolling behavior */
  physics?: {
    /** Spring tension/stiffness */
    tension?: number;
    /** Spring friction/damping */
    friction?: number;
    /** Spring mass */
    mass?: number;
    /** Inertia smoothing factor (0.0-1.0) */
    inertia?: number;
    /** Snap strength for snap points (0.0-1.0) */
    snapStrength?: number;
  };
  /** Animation style */
  animationStyle?: 'spring' | 'inertial' | 'none';
  /** Should keyboard navigation be enabled */
  keyboardNavigation?: boolean;
  /** Glass styling variant */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  /** Glass blur strength */
  blurStrength?: 'light' | 'standard' | 'strong';
  /** Color variant for controls and indicators */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  /** Snap to slides, or allow free scrolling */
  snapToSlides?: boolean;
  /** Enable touch and mouse gestures */
  gesturesEnabled?: boolean;
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Border radius */
  borderRadius?: string | number;
  /** Number of partially visible slides on each side */
  visibleSlides?: number;
  /** Spacing between slides */
  spacing?: number;
  /** Slide transition duration in ms */
  transitionDuration?: number;
  /** Optional custom renderer for slides */
  renderSlide?: (item: CarouselItem, index: number, isActive: boolean) => React.ReactNode;
  /** Optional custom renderer for indicators */
  renderIndicator?: (index: number, isActive: boolean, onClick: () => void) => React.ReactNode;
  /** The amount of resistance when scrolling beyond boundaries (0.0-1.0) */
  resistanceFactor?: number;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** ARIA label for the carousel */
  ariaLabel?: string;
  /** 
   * Custom snap points configuration. If provided, overrides the default slide-based snap points.
   * Use this for custom snap behavior like stopping at specific positions.
   */
  snapPoints?: SnapPointConfig[];
  /** Whether to enable variable resistance based on velocity and scroll position */
  variableResistance?: boolean;
  /** 
   * Resistance config for different scroll positions.
   * The closer to the edge, the stronger the resistance (0.0-1.0)
   */
  resistanceConfig?: {
    /** Resistance at edges (when reaching the start/end boundaries) */
    edge?: number;
    /** Resistance when near a snap point */
    nearSnap?: number;
    /** Resistance during fast movement */
    highVelocity?: number;
    /** Threshold for high velocity detection */
    velocityThreshold?: number;
  };
  /**
   * Responsive options for different screen sizes
   */
  responsive?: ResponsiveOptions;
  /**
   * Whether to maintain a specific aspect ratio
   * If a number is provided, it's treated as a width/height ratio (e.g., 16/9)
   * If an object is provided, the width and height properties define the ratio
   */
  aspectRatio?: number | CarouselAspectRatio;
  /**
   * Adaptive height based on content
   * When true, the carousel height will adapt to the height of the active slide
   */
  adaptiveHeight?: boolean;
}

// Remove duplicate fadeInAnimation, keep only the first instance
// Here's how it should look:
const fadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
`;

/**
 * Main carousel container
 */
const CarouselContainer = styled.div<{
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
const CarouselTrack = styled.div<{ 
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
const CarouselSlide = styled.div<{
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
  transition: opacity 0.3s ease, transform 0.3s ease;
  
  /* Active slide styling */
  ${props => props.$isActive && css`
    opacity: 1;
    transform: scale(1);
    
    ${props.$glassVariant === 'clear' && css`
      box-shadow: 0 0 15px 1px rgba(255, 255, 255, 0.2);
    `}
  `}
  
  /* Make slides scale slightly on hover for better UX */
  &:hover {
    opacity: 1;
  }
  
  /* Content will take full size */
  & > * {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

/**
 * Card container for card-type slides
 */
const CardContainer = styled.div<{
  $glassVariant: 'clear' | 'frosted' | 'tinted';
  $blurStrength: 'light' | 'standard' | 'strong';
  $color: string;
  $elevation: 1 | 2 | 3 | 4;
}>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
  border-radius: 6px;
  
  /* Apply glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    const elevationLevel = props.$elevation || 2;
    
    switch (props.$glassVariant) {
      case 'clear':
        return glassSurface({
          elevation: elevationLevel,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'light',
          borderOpacity: 'subtle',
          themeContext,
        });
      case 'tinted':
        return glassSurface({
          elevation: elevationLevel,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          tintColor: "var(--color-" + props.$color + "-transparent)",
          themeContext,
        } as any);
      default: // frosted
        return glassSurface({
          elevation: elevationLevel,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        });
    }
  }}
`;

/**
 * Card header component
 */
const CardHeader = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  .icon {
    margin-right: 1rem;
    display: flex;
  }
`;

/**
 * Card title component
 */
const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
`;

/**
 * Card subtitle component
 */
const CardSubtitle = styled.h4`
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  font-weight: 400;
  opacity: 0.8;
  color: #fff;
`;

/**
 * Card image container
 */
const CardImageContainer = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
  border-radius: 4px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/**
 * Card content component
 */
const CardContent = styled.div`
  flex: 1;
  overflow: auto;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  line-height: 1.5;
`;

/**
 * Card actions component
 */
const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 0.5rem;
`;

/**
 * Responsive image with aspect ratio
 */
const ResponsiveImage = styled.img<{
  $aspectRatio?: AspectRatio;
  $objectFit?: string;
  $objectPosition?: string;
}>`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  object-position: ${props => props.$objectPosition || 'center'};
  
  ${props => {
    // Apply aspect ratio if provided
    if (props.$aspectRatio && props.$aspectRatio !== 'custom') {
      let ratio;
      switch (props.$aspectRatio) {
        case '1:1': ratio = '100%'; break;
        case '4:3': ratio = '75%'; break;
        case '16:9': ratio = '56.25%'; break;
        case '21:9': ratio = '42.86%'; break;
        case '3:2': ratio = '66.67%'; break;
        case '2:3': ratio = '150%'; break;
        case '1:2': ratio = '200%'; break;
        case '9:16': ratio = '177.78%'; break;
        default: ratio = '100%';
      }
      
      return css`
        height: auto;
        aspect-ratio: ${props.$aspectRatio.replace(':', '/')};
      `;
    }
    
    return '';
  }}
`;

/**
 * Video container with aspect ratio
 */
const VideoContainer = styled.div<{
  $aspectRatio?: AspectRatio;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  ${props => {
    // Apply aspect ratio if provided
    if (props.$aspectRatio && props.$aspectRatio !== 'custom') {
      let ratio;
      switch (props.$aspectRatio) {
        case '1:1': ratio = '100%'; break;
        case '4:3': ratio = '75%'; break;
        case '16:9': ratio = '56.25%'; break;
        case '21:9': ratio = '42.86%'; break;
        case '3:2': ratio = '66.67%'; break;
        case '2:3': ratio = '150%'; break;
        case '1:2': ratio = '200%'; break;
        case '9:16': ratio = '177.78%'; break;
        default: ratio = '100%';
      }
      
      return css`
        height: auto;
        aspect-ratio: ${props.$aspectRatio.replace(':', '/')};
      `;
    }
    
    return '';
  }}
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/**
 * Html content container with sanitized HTML
 */
const HtmlContent = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 1rem;
  box-sizing: border-box;
  color: #fff;
  
  /* Basic styling for HTML content */
  h1, h2, h3, h4, h5, h6 {
    color: #fff;
    margin-top: 0;
  }
  
  p {
    margin: 0.5rem 0;
  }
  
  a {
    color: inherit;
    text-decoration: underline;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
`;

/**
 * Function to sanitize HTML (simple version)
 */
const sanitizeHtml = (html: string): string => {
  // This is a very basic sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/g, '');
};

/**
 * Play/Pause button component
 */
const PlayPauseButton = styled.button<{
  $isPlaying: boolean;
  $color: string;
  $glassVariant: 'clear' | 'frosted' | 'tinted';
  $blurStrength: 'light' | 'standard' | 'strong';
  $position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}>`
  position: absolute;
  z-index: 3;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0.85;
  
  /* Position based on $position prop */
  ${props => {
    switch (props.$position) {
      case 'top-left':
        return 'top: 16px; left: 16px;';
      case 'top-right':
        return 'top: 16px; right: 16px;';
      case 'bottom-left':
        return 'bottom: 16px; left: 16px;';
      case 'bottom-right':
        return 'bottom: 16px; right: 16px;';
      case 'center':
        return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
      default:
        return 'bottom: 16px; right: 16px;';
    }
  }}
  
  /* Apply glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    
    switch (props.$glassVariant) {
      case 'clear':
        return css`
          ${glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'light',
            borderOpacity: 'subtle',
            themeContext,
          })}
          box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.15);
        `;
      case 'tinted':
        return css`
          ${glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            tintColor: "var(--color-" + props.$color + "-transparent)",
            themeContext,
          })}
          box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.15);
        `;
      default: // frosted
        return css`
          ${glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          })}
          box-shadow: 0 0 8px 0 rgba(255, 255, 255, 0.2);
        `;
    }
  }}
  
  /* Color-based enhancements */
  ${props => props.$color !== 'default' && css`
    color: var(--color-${props.$color}-light, #fff);
    
    /* Apply glow effect based on color */
    ${() => {
      const themeContext = createThemeContext({});
      return glowEffects.glassGlow({
        color: "var(--color-" + props.$color + ")",
        intensity: 'subtle',
        themeContext,
      });
    }}
  `}
  
  /* Hover effects */
  &:hover {
    opacity: 1;
    transform: ${props => props.$position === 'center' ? 'translate(-50%, -50%) scale(1.08)' : 'scale(1.08)'};
    box-shadow: 0 0 15px 2px ${props => 
      props.$color !== 'default' 
        ? "var(--color-" + props.$color + "-transparent, rgba(255, 255, 255, 0.25))"
        : 'rgba(255, 255, 255, 0.25)'
    };
  }
  
  /* Active state */
  &:active {
    transform: ${props => props.$position === 'center' ? 'translate(-50%, -50%) scale(0.96)' : 'scale(0.96)'};
    opacity: 0.9;
  }
  
  /* Focus styles for accessibility */
  &:focus {
    outline: none;
    opacity: 1;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4), 0 0 15px 2px ${props => 
      props.$color !== 'default' 
        ? "var(--color-" + props.$color + "-transparent, rgba(255, 255, 255, 0.25))"
        : 'rgba(255, 255, 255, 0.25)'
    };
  }
  
  /* Icon styling */
  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 0.5;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
  
  /* Animation for appearance */
  animation: ${fadeInAnimation} 0.3s ease-out;
  
  /* Performance optimizations */
  will-change: transform, opacity;
`;

/**
 * Caption component for slides with glass styling
 */
const SlideCaption = styled.div<{
  $color: string;
  $glassVariant: 'clear' | 'frosted' | 'tinted';
  $blurStrength: 'light' | 'standard' | 'strong';
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  color: #fff;
  font-size: 0.875rem;
  text-align: center;
  pointer-events: none;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  transform-origin: bottom center;
  
  /* Apply glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    
    switch (props.$glassVariant) {
      case 'clear':
        return css`
          ${glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'subtle',
            borderOpacity: 'none',
            themeContext,
          })}
          
          /* Gradient overlay for better text readability */
          &::before {
            content: '';
            position: absolute;
            top: -60px;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
            pointer-events: none;
            z-index: -1;
          }
        `;
      case 'tinted':
        return css`
          ${glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'subtle',
            borderOpacity: 'none',
            themeContext,
          })}
          
          /* Gradient overlay for better text readability */
          &::before {
            content: '';
            position: absolute;
            top: -60px;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to top, 
              rgba(0, 0, 0, 0.4), 
              rgba(0, 0, 0, 0));
            pointer-events: none;
            z-index: -1;
          }
        `;
      default: // frosted
        return css`
          ${glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'light',
            borderOpacity: 'none',
            themeContext,
          })}
          
          /* Gradient overlay for better text readability */
          &::before {
            content: '';
            position: absolute;
            top: -40px;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
            pointer-events: none;
            z-index: -1;
          }
        `;
    }
  }}
  
  /* Color enhancements */
  ${props => props.$color !== 'default' && css`
    /* Subtle text shadow with color for emphasis */
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 10px var(--color-${props.$color}-transparent, rgba(255, 255, 255, 0.2));
    
    /* Special text color */
    color: var(--color-${props.$color}-light, #fff);
  `}
  
  /* Performance optimization */
  will-change: transform, opacity;
  
  /* Improved typography */
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.4;
  
  /* Hover effect on parent */
  ${CarouselSlide}:hover & {
    transform: translateY(-3px);
  }
`;

/**
 * Navigation arrow component with glass styling
 */
const NavigationArrow = styled.button<{
  $direction: 'left' | 'right';
  $color: string;
  $glassVariant: 'clear' | 'frosted' | 'tinted';
  $blurStrength: 'light' | 'standard' | 'strong';
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'left' ? 'left: 16px;' : 'right: 16px;'}
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  color: #fff;
  opacity: 0.85;
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.3s ease;
  
  /* Apply glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    
    switch (props.$glassVariant) {
      case 'clear':
        return css`
          ${glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'light',
            borderOpacity: 'subtle',
            themeContext,
          })}
          box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.15);
        `;
      case 'tinted':
        return css`
          ${glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            tintColor: "var(--color-" + props.$color + "-transparent)",
            themeContext,
          })}
          box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.15);
        `;
      default: // frosted
        return css`
          ${glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          })}
          box-shadow: 0 0 8px 0 rgba(255, 255, 255, 0.2);
        `;
    }
  }}
  
  /* Color-based enhancements */
  ${props => props.$color !== 'default' && css`
    color: var(--color-${props.$color}-light, #fff);
    
    /* Apply glow effect based on color */
    ${() => {
      const themeContext = createThemeContext({});
      return glowEffects.glassGlow({
        color: "var(--color-" + props.$color + ")",
        intensity: 'subtle',
        themeContext,
      });
    }}
  `}
  
  /* Hover effects */
  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.08);
    box-shadow: 0 0 15px 2px ${props => 
      props.$color !== 'default' 
        ? "var(--color-" + props.$color + "-transparent, rgba(255, 255, 255, 0.25))"
        : 'rgba(255, 255, 255, 0.25)'
    };
  }
  
  /* Active state */
  &:active {
    transform: translateY(-50%) scale(0.96);
    opacity: 0.9;
  }
  
  /* Focus styles for accessibility */
  &:focus {
    outline: none;
    opacity: 1;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4), 0 0 15px 2px ${props => 
      props.$color !== 'default' 
        ? "var(--color-" + props.$color + "-transparent, rgba(255, 255, 255, 0.25))"
        : 'rgba(255, 255, 255, 0.25)'
    };
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: translateY(-50%) scale(0.95);
    box-shadow: none;
  }
  
  /* Animation for appearance */
  animation: ${fadeInAnimation} 0.3s ease-out;
  
  /* Icon styling */
  svg {
    width: 22px;
    height: 22px;
    stroke-width: 2.5;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
  
  /* Performance optimizations */
  will-change: transform, opacity, box-shadow;
`;

/**
 * Indicators component for slide dots/numbers with glass styling
 */
const IndicatorsContainer = styled.div<{
  $color: string;
  $glassVariant: string;
  $blurStrength: string;
  $position?: 'top' | 'bottom';
  $isActive?: boolean;
  $type?: 'dots' | 'lines' | 'numbers';
}>`
  position: absolute;
  ${props => props.$position === 'top' ? 'top: 16px;' : 'bottom: 16px;'}
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  z-index: 2;
  
  /* Apply glass styling based on variant */
  ${props => {
    const themeContext = createThemeContext({});
    
    switch (props.$glassVariant) {
      case 'clear':
        return css`
          ${glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'light',
            borderOpacity: 'subtle',
            themeContext,
          })}
        `;
      case 'tinted':
        return css`
          ${glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            tintColor: "var(--color-" + props.$color + "-transparent)",
            themeContext,
          })}
        `;
      default: // frosted
        return css`
          ${glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          })}
        `;
    }
  }}
  
  /* Color-based enhancements */
  ${props => props.$color !== 'default' && css`
    ${() => {
      const themeContext = createThemeContext({});
      return glowEffects.glassGlow({
        color: "var(--color-" + props.$color + ")",
        intensity: 'subtle',
        themeContext,
      });
    }}
  `}
  
  /* Animation for appearance */
  animation: ${fadeInAnimation} 0.3s ease-out;
  
  /* Special coloring for active state */
  ${props => props.$isActive && css`
    background-color: ${props.$color === 'default' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : `var(--color-${props.$color}-transparent, rgba(255, 255, 255, 0.15))`};
    
    /* Add glow effect for active indicators */
    ${props.$color !== 'default' && css`
      ${() => { 
        const themeContext = createThemeContext({}); 
        return glowEffects.glassGlow({
          color: `var(--color-${props.$color})`,
          intensity: 'subtle',
          themeContext,
        });
      }}
    `}
  `}
  
  /* Scale effect when active */
  transform: ${props => props.$isActive ? 'scale(1.1)' : 'scale(1)'};
  
  /* Glow animation for active indicator */
  ${props => props.$isActive && props.$color !== 'default' && css`
    box-shadow: 0 0 8px ${`var(--color-${props.$color}-light, rgba(255, 255, 255, 0.7))`};
    animation: ${glow} 2.5s infinite ease-in-out;
  `}
  
  /* Hover effect */
  &:hover {
    transform: ${props => props.$isActive ? 'scale(1.15)' : 'scale(1.08)'};
    
    /* Lines indicator special hover effect */
    ${props => props.$type === 'lines' && !props.$isActive && css`
      &::after {
        width: 50%;
      }
    `}
  }
  
  /* Active state */
  &:active {
    transform: scale(0.95);
  }
  
  /* Focus styling */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
  
  /* Performance optimizations */
  will-change: transform, opacity, box-shadow;
`;

/**
 * Individual indicator dot/line/number with glass styling
 */
const IndicatorDot = styled.button<{
  $isActive: boolean; 
  $color: string;
  $type: 'dots' | 'lines' | 'numbers';
  $glassVariant: string;
  $blurStrength: string;
}>`
  position: relative;
  width: ${props => props.$type === 'numbers' ? '30px' : props.$type === 'lines' ? '24px' : '12px'};
  height: ${props => props.$type === 'numbers' ? '30px' : props.$type === 'lines' ? '4px' : '12px'};
  border-radius: ${props => props.$type === 'lines' ? '2px' : '50%'};
  margin: 0 4px;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${props => props.$type === 'numbers' ? '12px' : '0'};
  color: white;
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
  opacity: ${props => props.$isActive ? 1 : 0.7};
  background-color: ${props => props.$isActive 
    ? props.$color === 'default' 
      ? 'rgba(255, 255, 255, 0.3)' 
      : `var(--color-${props.$color}-light, rgba(255, 255, 255, 0.3))` 
    : 'rgba(255, 255, 255, 0.15)'};
  
  /* Apply glass styling */
  ${props => {
    let glassStyle = '';
    
    // Only apply glass to active indicators or number indicators
    if (props.$isActive || props.$type === 'numbers') {
      const themeContext = createThemeContext({});
      
      switch(props.$glassVariant) {
        case 'clear':
        case 'frosted':
          // Convert the CSS result to string by using string interpolation
          glassStyle = `${glassSurface({
            elevation: 1,
            blurStrength: 'light' as any,
            backgroundOpacity: 'subtle',
            borderOpacity: 'subtle',
            themeContext,
          })}`;
          break;
      }
    }
    
    return glassStyle;
  }}
  
  /* Special coloring for active state */
  ${props => props.$isActive && css`
    background-color: ${props.$color === 'default' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : `var(--color-${props.$color}-transparent, rgba(255, 255, 255, 0.15))`};
    
    /* Add glow effect for active indicators */
    ${props.$color !== 'default' && css`
      ${glowEffects.glassGlow({
        color: `var(--color-${props.$color})`,
        intensity: 'subtle',
        themeContext: createThemeContext({}),
      })}
    `}
  `}
  
  /* Scale effect when active */
  transform: ${props => props.$isActive ? 'scale(1.1)' : 'scale(1)'};
  
  /* Glow animation for active indicator */
  ${props => props.$isActive && props.$color !== 'default' && css`
    box-shadow: 0 0 8px ${`var(--color-${props.$color}-light, rgba(255, 255, 255, 0.7))`};
    animation: ${glow} 2.5s infinite ease-in-out;
  `}
  
  /* Hover effect */
  &:hover {
    transform: ${props => props.$isActive ? 'scale(1.15)' : 'scale(1.08)'};
    
    /* Lines indicator special hover effect */
    ${props => props.$type === 'lines' && !props.$isActive && css`
      &::after {
        width: 50%;
      }
    `}
  }
  
  /* Active state */
  &:active {
    transform: scale(0.95);
  }
  
  /* Focus styling */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
  
  /* Performance optimizations */
  will-change: transform, opacity, box-shadow;
`;

/**
 * GlassCarousel Component
 */
export const GlassCarousel: React.FC<GlassCarouselProps> = ({
  items,
  activeSlide = 0,
  onChange,
  autoPlay = false,
  autoPlayInterval = 5000,
  pauseOnHover = true,
  pauseOnFocus = true,
  indicators = true,
  arrows = true,
  showPlayPauseControl = true,
  playPausePosition = 'bottom-right',
  interactive = true,
  infinite = true,
  physics = {
    tension: 240,
    friction: 24,
    mass: 1,
    inertia: 0.85,
    snapStrength: 0.8
  },
  animationStyle = 'spring',
  keyboardNavigation = true,
  glassVariant = 'frosted',
  blurStrength = 'standard',
  color = 'primary',
  snapToSlides = true,
  gesturesEnabled = true,
  width,
  height,
  borderRadius,
  visibleSlides = 1,
  spacing = 16,
  transitionDuration = 300,
  renderSlide,
  renderIndicator,
  resistanceFactor = 0.3,
  className,
  style,
  ariaLabel = 'Image carousel',
  snapPoints,
  variableResistance = false,
  resistanceConfig = {
    edge: 0.2,
    nearSnap: 0.5,
    highVelocity: 0.8,
    velocityThreshold: 1.0
  },
  responsive,
  aspectRatio,
  adaptiveHeight = false
}) => {
  // Initialize refs and state
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Record<string, HTMLDivElement>>({});
  const slideHeightRefs = useRef<Record<string, number>>({});
  
  // Screen size state
  type ScreenSize = 'small' | 'medium' | 'large';
  const [screenSize, setScreenSize] = useState<ScreenSize>('medium');
  
  // Responsive options state
  const [responsiveConfig, setResponsiveConfig] = useState({
    visibleSlides: visibleSlides,
    spacing: spacing,
    height: height,
    arrows: arrows,
    indicators: indicators,
    showPlayPauseControl: showPlayPauseControl,
    playPausePosition: playPausePosition
  });
  
  // Internal state for active slide to allow controlled/uncontrolled usage
  const [currentSlide, setCurrentSlide] = useState(activeSlide);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [currentVelocity, setCurrentVelocity] = useState({ x: 0, y: 0 });
  const [adaptiveContentHeight, setAdaptiveContentHeight] = useState<number | undefined>(undefined);
  const { isReducedMotion } = useAccessibilitySettings();
  
  // Physical measurements
  const slideCount = items.length;
  const totalWidth = slideWidth * slideCount + spacing * (slideCount - 1);
  
  // Calculate default snap points based on slides
  const defaultSlideSnapPoints = useMemo(() => {
    if (!slideWidth) return [];
    
    return Array.from({ length: slideCount }).map((_, index) => ({
      position: -(index * (slideWidth + spacing)),
      isRatio: false,
      strength: physics.snapStrength || 0.8,
      threshold: slideWidth * 0.3,
      enabled: true,
      name: `slide-${index}`,
    }));
  }, [slideWidth, slideCount, spacing, physics.snapStrength]);
  
  // Merge provided snap points with default slide snap points
  const effectiveSnapPoints = useMemo(() => {
    if (snapPoints && snapPoints.length > 0) {
      return snapPoints.map(point => ({
        ...point,
        // If position is a ratio, convert to pixels
        position: point.isRatio 
          ? point.position * -(totalWidth - slideWidth) 
          : point.position,
        // Ensure enabled is defined
        enabled: point.enabled !== false,
      }));
    }
    
    return snapToSlides ? defaultSlideSnapPoints : [];
  }, [snapPoints, snapToSlides, defaultSlideSnapPoints, totalWidth, slideWidth]);
  
  // Calculate variable resistance based on position, velocity, and snap points
  const calculateVariableResistance = useCallback((positionX: number, velocityX: number) => {
    if (!variableResistance) return resistanceFactor;
    
    const config = resistanceConfig;
    const absVelocity = Math.abs(velocityX);
    const isHighVelocity = absVelocity > (config.velocityThreshold || 1.0);
    
    // Calculate boundaries
    const minX = -(totalWidth - slideWidth);
    const maxX = 0;
    
    // Check if we're near boundaries
    const distanceFromStart = Math.abs(positionX - maxX);
    const distanceFromEnd = Math.abs(positionX - minX);
    const isNearBoundary = distanceFromStart < slideWidth * 0.3 || distanceFromEnd < slideWidth * 0.3;
    
    // Check if we're near a snap point
    let isNearSnapPoint = false;
    let nearestDistance = Number.MAX_VALUE;
    
    for (const point of effectiveSnapPoints) {
      if (!point.enabled) continue;
      
      const distance = Math.abs(positionX - point.position);
      nearestDistance = Math.min(nearestDistance, distance);
      
      if (distance < (point.threshold || slideWidth * 0.3)) {
        isNearSnapPoint = true;
        break;
      }
    }
    
    // Calculate final resistance factor
    if (isNearBoundary) {
      return config.edge || 0.2; // Stronger resistance near boundaries
    } else if (isNearSnapPoint) {
      return config.nearSnap || 0.5; // Moderate resistance near snap points
    } else if (isHighVelocity) {
      return config.highVelocity || 0.8; // Lighter resistance when moving fast
    }
    
    return resistanceFactor; // Default resistance
  }, [
    variableResistance, 
    resistanceFactor, 
    resistanceConfig, 
    totalWidth, 
    slideWidth, 
    effectiveSnapPoints
  ]);
  
  // Set up physics hooks
  const { position: scrollPosition, setPosition: setScrollTarget, movement: scrollMovement } = useInertialMovement2D({
    initialPosition: { x: -currentSlide * (slideWidth + spacing), y: 0 },
    config: {
      // Add only supported properties
      restThreshold: 0.1
    }
  });
  
  // Setup momentum for flick scrolling
  const momentum = useMomentum({
    friction: physics.inertia || 0.85,
    restThreshold: 0.1
  });
  
  // Setup spring animation
  const springConfig = {
    tension: physics.tension || 240,
    friction: physics.friction || 24,
    mass: physics.mass || 1
  };
  
  // Effect to update current slide based on activeSlide prop (if controlled)
  useEffect(() => {
    if (activeSlide !== undefined && activeSlide !== currentSlide) {
      setCurrentSlide(activeSlide);
      updateScrollPosition(activeSlide);
    }
  }, [activeSlide]);
  
  // Determine screen size
  useEffect(() => {
    const handleScreenResize = () => {
      const windowWidth = window.innerWidth;
      
      if (windowWidth < 768) {
        setScreenSize('small');
      } else if (windowWidth >= 768 && windowWidth < 1200) {
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };
    
    // Initial calculation
    handleScreenResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleScreenResize);
    return () => window.removeEventListener('resize', handleScreenResize);
  }, []);
  
  // Update responsive configuration based on screen size
  useEffect(() => {
    if (!responsive) return;
    
    // Get responsive options for the current screen size
    const sizeConfig = responsive[screenSize];
    
    if (sizeConfig) {
      // Merge default with responsive options
      setResponsiveConfig({
        visibleSlides: sizeConfig.visibleSlides ?? visibleSlides,
        spacing: sizeConfig.spacing ?? spacing,
        height: sizeConfig.height ?? height,
        arrows: sizeConfig.arrows ?? arrows,
        indicators: typeof sizeConfig.indicators !== 'undefined' ? sizeConfig.indicators : indicators,
        showPlayPauseControl: sizeConfig.showPlayPauseControl ?? showPlayPauseControl,
        playPausePosition: sizeConfig.playPausePosition ?? playPausePosition
      });
    } else {
      // Reset to default props if no config for this screen size
      setResponsiveConfig({
        visibleSlides,
        spacing,
        height,
        arrows,
        indicators,
        showPlayPauseControl,
        playPausePosition
      });
    }
  }, [
    screenSize, 
    responsive, 
    visibleSlides, 
    spacing, 
    height, 
    arrows, 
    indicators, 
    showPlayPauseControl,
    playPausePosition
  ]);
  
  // Calculate container height based on aspect ratio
  const calculateAspectRatioHeight = useCallback((containerWidth: number) => {
    if (!aspectRatio) return undefined;
    
    let width = 1;
    let height = 1;
    
    if (typeof aspectRatio === 'number') {
      width = 1;
      height = 1 / aspectRatio;
    } else if (typeof aspectRatio === 'object') {
      width = aspectRatio.width;
      height = aspectRatio.height;
    }
    
    return (containerWidth * height) / width;
  }, [aspectRatio]);
  
  // Calculate adaptive height
  useEffect(() => {
    if (!adaptiveHeight) return;
    
    // Update the height based on current slide height
    const updateAdaptiveHeight = () => {
      const slideRef = slideRefs.current[`slide-${currentSlide}`];
      if (slideRef) {
        const height = slideRef.offsetHeight;
        slideHeightRefs.current[`slide-${currentSlide}`] = height;
        setAdaptiveContentHeight(height);
      }
    };
    
    // Initial update
    updateAdaptiveHeight();
    
    // Setup mutation observer to detect changes in slide content
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(updateAdaptiveHeight);
      const slideRef = slideRefs.current[`slide-${currentSlide}`];
      
      if (slideRef) {
        observer.observe(slideRef, { 
          attributes: true,
          childList: true,
          subtree: true
        });
      }
      
      return () => observer.disconnect();
    }
  }, [currentSlide, adaptiveHeight]);
  
  // Effect to recalculate dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && trackRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const effectiveVisibleSlides = responsiveConfig.visibleSlides;
        const effectiveSpacing = responsiveConfig.spacing;
        
        const newSlideWidth = effectiveVisibleSlides > 1 
          ? (containerWidth - effectiveSpacing * (effectiveVisibleSlides - 1)) / effectiveVisibleSlides
          : containerWidth;
        
        setSlideWidth(newSlideWidth);
        setTrackWidth(newSlideWidth * slideCount + effectiveSpacing * (slideCount - 1));
        
        // Update scroll position based on current slide
        updateScrollPosition(currentSlide, false);
      }
    };
    
    // Initial calculation
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [
    responsiveConfig.visibleSlides, 
    responsiveConfig.spacing, 
    slideCount, 
    currentSlide
  ]);
  
  // Update scroll position based on slide index
  const updateScrollPosition = useCallback((slideIndex: number, animate = true) => {
    if (!trackRef.current || slideWidth === 0) return;
    
    // Get effective spacing from responsive config
    const effectiveSpacing = responsiveConfig.spacing;
    
    // Calculate target position
    const targetPosition = -(slideIndex * (slideWidth + effectiveSpacing));
    
    // Apply scroll with or without animation
    if (animate && animationStyle !== 'none' && !isReducedMotion) {
      setIsAnimating(true);
      
      if (animationStyle === 'spring') {
        // Use spring animation
        const springPosition = { 
          x: targetPosition, 
          y: 0 
        };
        
        setScrollTarget(springPosition);
      } else {
        // Use inertial animation
        const distance = targetPosition - scrollPosition.x;
        const velocity = distance / (transitionDuration / 1000) * 0.3;
        
        // Set initial velocity for momentum-based animation
        scrollMovement.setVelocity({ x: velocity, y: 0 });
        setScrollTarget({ x: targetPosition, y: 0 });
      }
      
      // Reset animation flag after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, transitionDuration);
    } else {
      // Immediate position change
      setScrollTarget({ x: targetPosition, y: 0 }, false);
    }
  }, [
    slideWidth, 
    responsiveConfig.spacing, 
    animationStyle, 
    isReducedMotion, 
    scrollPosition.x, 
    transitionDuration, 
    setScrollTarget, 
    scrollMovement
  ]);
  
  // Find closest slide or snap point based on current scroll position
  const findClosestSlide = useCallback(() => {
    if (slideWidth === 0) return currentSlide;
    
    // If we're using custom snap points, find closest snap point that corresponds to a slide
    if (effectiveSnapPoints.length > 0 && snapPoints) {
      let closestSnapPoint = null;
      let closestDistance = Number.MAX_VALUE;
      
      // Find closest snap point
      for (const snapPoint of effectiveSnapPoints) {
        if (!snapPoint.enabled) continue;
        
        const distance = Math.abs(scrollPosition.x - snapPoint.position);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSnapPoint = snapPoint;
        }
      }
      
      // Try to find which slide this snap point corresponds to
      if (closestSnapPoint) {
        const position = closestSnapPoint.position;
        
        // Look through default slide snap points for a match
        for (let i = 0; i < defaultSlideSnapPoints.length; i++) {
          if (Math.abs(position - defaultSlideSnapPoints[i].position) < 5) {
            return i;
          }
        }
        
        // If no match found but snap point is named slide-X
        const name = closestSnapPoint.name || '';
        if (name.startsWith('slide-')) {
          const slideIndex = parseInt(name.substring(6), 10);
          if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < slideCount) {
            return slideIndex;
          }
        }
        
        // Otherwise guess based on position
        const slideStep = slideWidth + spacing;
        const approximateIndex = Math.round(Math.abs(position) / slideStep);
        return Math.max(0, Math.min(slideCount - 1, approximateIndex));
      }
    }
    
    // Default behavior - find closest slide based on position
    const currentOffset = Math.abs(scrollPosition.x);
    const slideStep = slideWidth + spacing;
    
    let closestSlide = Math.round(currentOffset / slideStep);
    
    // Constrain to valid slide range
    closestSlide = Math.max(0, Math.min(slideCount - 1, closestSlide));
    
    return closestSlide;
  }, [
    slideWidth, 
    spacing, 
    currentSlide, 
    scrollPosition.x, 
    slideCount, 
    effectiveSnapPoints, 
    snapPoints, 
    defaultSlideSnapPoints
  ]);
  
  // Autoplay state
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionTime = useRef<number>(Date.now());
  
  // Play/pause controls
  const playCarousel = useCallback(() => {
    setIsAutoPlaying(true);
    setIsPaused(false);
  }, []);
  
  const pauseCarousel = useCallback(() => {
    setIsAutoPlaying(false);
    setIsPaused(true);
    
    // Clear any existing interval
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);
  
  const togglePlayPause = useCallback(() => {
    if (isAutoPlaying) {
      pauseCarousel();
    } else {
      playCarousel();
    }
  }, [isAutoPlaying, pauseCarousel, playCarousel]);
  
  // Set up auto-play with restart capability
  useEffect(() => {
    // Don't run autoplay if:
    // - autoPlay is disabled
    // - carousel is explicitly paused
    // - there's only one or zero items
    if (!autoPlay || isPaused || items.length <= 1) {
      // Clean up any existing interval
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }
    
    // Clear any existing interval before setting a new one
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    
    // Set new interval
    autoPlayTimerRef.current = setInterval(() => {
      // Additional check to prevent unexpected slides during user interaction
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteractionTime.current;
      
      // Only advance if it's been at least 500ms since the last interaction
      if (timeSinceLastInteraction > 500) {
        // Move to next slide, looping back to the beginning if needed
        const nextSlide = (currentSlide + 1) % items.length;
        
        // Inline implementation of slide navigation
        setCurrentSlide(nextSlide);
        updateScrollPosition(nextSlide);
        
        // Trigger onChange callback
        if (onChange) {
          onChange(nextSlide);
        }
      }
    }, autoPlayInterval);
    
    // Clear interval on unmount
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [autoPlay, autoPlayInterval, currentSlide, isPaused, items.length, updateScrollPosition, onChange]);
  
  // Update autoPlay state when the prop changes
  useEffect(() => {
    setIsAutoPlaying(autoPlay && !isPaused);
  }, [autoPlay, isPaused]);
  
  // Define the navigation function implementation (without useCallback to avoid circular reference)
  const navigateToSlide = (index: number) => {
    // Handle infinite scrolling edge cases
    let targetIndex = index;
    
    if (!infinite) {
      // Constrain to valid slide range if not infinite
      targetIndex = Math.max(0, Math.min(slideCount - 1, targetIndex));
    } else {
      // Handle wrapping for infinite scrolling
      if (index < 0) {
        targetIndex = slideCount - 1;
      } else if (index >= slideCount) {
        targetIndex = 0;
      }
    }
    
    setCurrentSlide(targetIndex);
    updateScrollPosition(targetIndex);
    
    // Trigger onChange callback
    if (onChange) {
      onChange(targetIndex);
    }
  };
  
  // Now create the memoized versions that use the implementation
  const goToSlide = useCallback(navigateToSlide, [infinite, slideCount, updateScrollPosition, onChange]);
  
  const goToNextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);
  
  const goToPrevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);
  
  // Touch gesture state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const lastTouchTime = useRef<number | null>(null);
  const swipeVelocity = useRef<number>(0);
  const isMultiTouch = useRef<boolean>(false);
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);
  const currentScale = useRef<number>(1);
  const dragStartPositionX = useRef<number>(0);
  const touchDirection = useRef<'horizontal' | 'vertical' | null>(null);
  
  // Swipe detection threshold
  const SWIPE_THRESHOLD = 50;  // Minimum distance to be considered a swipe
  const SWIPE_VELOCITY_THRESHOLD = 0.5;  // Minimum velocity to be considered a swipe
  
  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList | TouchList): number => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!interactive || !gesturesEnabled) return;
    
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    lastTouchX.current = e.touches[0].clientX;
    lastTouchTime.current = Date.now();
    dragStartPositionX.current = scrollPosition.x;
    touchDirection.current = null;
    
    // Detect multi-touch (e.g., pinch zoom)
    if (e.touches.length > 1) {
      isMultiTouch.current = true;
      initialDistance.current = getTouchDistance(e.touches);
      initialScale.current = currentScale.current;
    } else {
      isMultiTouch.current = false;
    }
    
    // Pause autoplay during interaction
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [interactive, gesturesEnabled, pauseOnHover, scrollPosition.x]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!interactive || !gesturesEnabled || touchStartX.current === null) return;
    
    // Prevent default to avoid page scrolling
    if (touchDirection.current === 'horizontal') {
      e.preventDefault();
    }
    
    // Handle multi-touch gestures like pinch zoom
    if (isMultiTouch.current && e.touches.length > 1 && initialDistance.current !== null) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialDistance.current * initialScale.current;
      
      // Limit scale to reasonable bounds
      const boundedScale = Math.max(0.8, Math.min(3, scale));
      currentScale.current = boundedScale;
      
      // Apply scale transformation to track if desired
      // For demonstration purposes, we're not implementing the actual scaling
      
      return;
    }
    
    // Handle single touch movement
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    // Calculate deltas
    const deltaX = touchX - (lastTouchX.current || touchX);
    const deltaY = touchY - (touchStartY.current || touchY);
    
    // Determine scroll direction if not already set
    if (touchDirection.current === null) {
      const absX = Math.abs(touchX - (touchStartX.current || 0));
      const absY = Math.abs(touchY - (touchStartY.current || 0));
      
      if (absX > 10 || absY > 10) {
        touchDirection.current = absX > absY ? 'horizontal' : 'vertical';
      }
    }
    
    // Update last touch position and time for velocity calculation
    if (lastTouchTime.current !== null && lastTouchX.current !== null) {
      const timeDelta = Date.now() - lastTouchTime.current;
      if (timeDelta > 0) {
        swipeVelocity.current = deltaX / timeDelta;
      }
    }
    
    lastTouchX.current = touchX;
    lastTouchTime.current = Date.now();
    
    // Only handle horizontal scrolling, let vertical scrolling work normally
    if (touchDirection.current === 'horizontal') {
      // Calculate resistance factor based on position and velocity
      const effectiveResistance = variableResistance
        ? calculateVariableResistance(scrollPosition.x + deltaX, swipeVelocity.current)
        : resistanceFactor;
      
      // Apply scroll with boundaries and resistance
      const newX = scrollPosition.x + deltaX;
      const minX = -(trackWidth - slideWidth);
      const maxX = 0;
      
      if (!infinite) {
        // Apply boundaries with resistance for non-infinite carousels
        if (newX > maxX) {
          // Pulling past start - apply resistance
          const overscroll = newX - maxX;
          const dampenedPosition = maxX + overscroll * effectiveResistance;
          setScrollTarget({ x: dampenedPosition, y: 0 }, false);
        } else if (newX < minX) {
          // Pulling past end - apply resistance
          const overscroll = newX - minX;
          const dampenedPosition = minX + overscroll * effectiveResistance;
          setScrollTarget({ x: dampenedPosition, y: 0 }, false);
        } else {
          // Check for snap point resistance
          for (const snapPoint of effectiveSnapPoints) {
            if (!snapPoint.enabled) continue;
            
            const snapDistance = Math.abs(newX - snapPoint.position);
            const threshold = snapPoint.threshold || slideWidth * 0.3;
            
            if (snapDistance < threshold) {
              const snapOvershoot = newX - snapPoint.position;
              const snapResistance = 'resistance' in snapPoint && snapPoint.resistance !== undefined
                ? snapPoint.resistance 
                : (variableResistance 
                  ? calculateVariableResistance(newX, swipeVelocity.current) 
                  : resistanceFactor);
              const dampenedPosition = snapPoint.position + snapOvershoot * snapResistance;
              
              setScrollTarget({ x: dampenedPosition, y: 0 }, false);
              return;
            }
          }
          
          // Normal scrolling within bounds
          setScrollTarget({ x: newX, y: 0 }, false);
        }
      } else {
        // Infinite scrolling
        setScrollTarget({ x: newX, y: 0 }, false);
      }
    }
  }, [
    interactive, 
    gesturesEnabled, 
    scrollPosition.x, 
    setScrollTarget, 
    trackWidth, 
    slideWidth, 
    infinite, 
    effectiveSnapPoints,
    variableResistance,
    calculateVariableResistance,
    resistanceFactor
  ]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!interactive || !gesturesEnabled || touchStartX.current === null || touchStartTime.current === null) return;
    
    // Calculate final velocity for momentum scrolling
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;
    const touchEndX = e.changedTouches[0].clientX;
    const touchDeltaX = touchEndX - touchStartX.current;
    
    // Reset multi-touch state
    isMultiTouch.current = false;
    initialDistance.current = null;
    
    // Only process horizontal swipes
    if (touchDirection.current === 'horizontal') {
      // Calculate velocity for momentum scrolling
      const velocity = touchDuration > 0 ? touchDeltaX / touchDuration : 0;
      
      // Check if swipe was fast and long enough to trigger a slide change
      const isSwipe = Math.abs(touchDeltaX) > SWIPE_THRESHOLD && Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD;
      
      if (snapToSlides) {
        // Find closest slide or determine slide based on swipe direction
        if (isSwipe) {
          // Determine direction based on touch delta
          const direction = touchDeltaX > 0 ? -1 : 1;
          const targetSlide = Math.max(0, Math.min(slideCount - 1, currentSlide + direction));
          goToSlide(targetSlide);
        } else {
          // Find closest slide and snap to it
          const closestSlide = findClosestSlide();
          goToSlide(closestSlide);
        }
      } else if (effectiveSnapPoints.length > 0) {
        // Snap to closest snap point or based on swipe
        let targetSnapPoint = null;
        
        if (isSwipe) {
          // Find snap points in swipe direction
          const direction = touchDeltaX > 0 ? -1 : 1;
          const snapPointsInDirection = effectiveSnapPoints.filter(point => 
            point.enabled && (
              (direction > 0 && point.position < scrollPosition.x) ||
              (direction < 0 && point.position > scrollPosition.x)
            )
          );
          
          if (snapPointsInDirection.length > 0) {
            // Sort by distance from current position
            snapPointsInDirection.sort((a, b) => 
              Math.abs(a.position - scrollPosition.x) - Math.abs(b.position - scrollPosition.x)
            );
            
            // Get the closest point in the swipe direction
            targetSnapPoint = snapPointsInDirection[0];
          }
        }
        
        if (!targetSnapPoint) {
          // Find closest snap point
          let closestDistance = Number.MAX_VALUE;
          
          for (const point of effectiveSnapPoints) {
            if (!point.enabled) continue;
            
            const distance = Math.abs(scrollPosition.x - point.position);
            if (distance < closestDistance) {
              closestDistance = distance;
              targetSnapPoint = point;
            }
          }
        }
        
        if (targetSnapPoint) {
          setScrollTarget({ x: targetSnapPoint.position, y: 0 });
          
          // If this snap point corresponds to a slide, update current slide
          const snapIndex = defaultSlideSnapPoints.findIndex(p => 
            p.position === targetSnapPoint?.position
          );
          
          if (snapIndex !== -1) {
            setCurrentSlide(snapIndex);
            if (onChange) onChange(snapIndex);
          }
        }
      } else {
        // Free momentum scrolling
        const momentumVelocity = { x: -velocity * 1000, y: 0 };
        scrollMovement.setVelocity(momentumVelocity);
      }
    }
    
    // Reset touch tracking state
    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
    lastTouchX.current = null;
    lastTouchTime.current = null;
    touchDirection.current = null;
    
    // Resume autoplay after delay
    if (pauseOnHover) {
      setTimeout(() => {
        setIsPaused(false);
      }, 500);
    }
  }, [
    interactive, 
    gesturesEnabled, 
    scrollPosition.x, 
    snapToSlides, 
    effectiveSnapPoints, 
    currentSlide, 
    findClosestSlide, 
    slideCount, 
    goToSlide, 
    setScrollTarget, 
    scrollMovement, 
    pauseOnHover,
    onChange,
    defaultSlideSnapPoints
  ]);
  
  // Gesture handlers for momentum scrolling
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!interactive || !gesturesEnabled) return;
    
    // Capture pointer to track movement across the screen
    if (trackRef.current) {
      trackRef.current.setPointerCapture(e.pointerId);
    }
    
    setIsGrabbing(true);
    momentum.start(e.clientX, e.clientY);
    
    // Pause autoplay during interaction
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [interactive, gesturesEnabled, momentum, pauseOnHover]);
  
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isGrabbing || !interactive || !gesturesEnabled) return;
    
    // Update momentum with new position
    momentum.update(e.clientX, e.clientY);
    
    // Calculate delta manually
    const delta = { x: e.movementX, y: e.movementY };
    
    // Track current velocity for variable resistance
    const currentVel = { x: delta.x, y: delta.y };
    setCurrentVelocity(currentVel);
    
    // Apply movement to scroll position
    const newX = scrollPosition.x + delta.x;
    
    // Apply scroll with resistance near boundaries if not infinite
    if (!infinite) {
      const minX = -(trackWidth - slideWidth);
      const maxX = 0;
      
      // Calculate effective resistance
      const effectiveResistance = variableResistance
        ? calculateVariableResistance(newX, delta.x)
        : resistanceFactor;
      
      if (newX > maxX) {
        // Pulling past start - apply resistance
        const overscroll = newX;
        const dampenedPosition = maxX + overscroll * effectiveResistance;
        setScrollTarget({ x: dampenedPosition, y: 0 }, false);
      } else if (newX < minX) {
        // Pulling past end - apply resistance
        const overscroll = newX - minX;
        const dampenedPosition = minX + overscroll * effectiveResistance;
        setScrollTarget({ x: dampenedPosition, y: 0 }, false);
      } else {
        // Check for snap points resistance when scrolling
        if (effectiveSnapPoints.length > 0) {
          // Find if we're near a snap point for potential resistance
          for (const snapPoint of effectiveSnapPoints) {
            if (!snapPoint.enabled) continue;
            
            const snapDistance = Math.abs(newX - snapPoint.position);
            const threshold = snapPoint.threshold || slideWidth * 0.3;
            
            // If near a snap point, apply point-specific resistance
            if (snapDistance < threshold) {
              const snapOvershoot = newX - snapPoint.position;
              const snapResistance = 'resistance' in snapPoint && snapPoint.resistance !== undefined
                ? snapPoint.resistance 
                : (variableResistance 
                  ? calculateVariableResistance(newX, delta.x) 
                  : resistanceFactor);
              const dampenedPosition = snapPoint.position + snapOvershoot * snapResistance;
              
              setScrollTarget({ x: dampenedPosition, y: 0 }, false);
              return;
            }
          }
        }
        
        // Normal scrolling (not near any snap points)
        setScrollTarget({ x: newX, y: 0 }, false);
      }
    } else {
      // Infinite scrolling - check only for snap points
      if (effectiveSnapPoints.length > 0) {
        // Find if we're near a snap point for potential resistance
        for (const snapPoint of effectiveSnapPoints) {
          if (!snapPoint.enabled) continue;
          
          const snapDistance = Math.abs(newX - snapPoint.position);
          const threshold = snapPoint.threshold || slideWidth * 0.3;
          
          // If near a snap point, apply point-specific resistance
          if (snapDistance < threshold) {
            const snapOvershoot = newX - snapPoint.position;
            const snapResistance = 'resistance' in snapPoint && snapPoint.resistance !== undefined
              ? snapPoint.resistance 
              : (variableResistance 
                ? calculateVariableResistance(newX, delta.x) 
                : resistanceFactor);
            const dampenedPosition = snapPoint.position + snapOvershoot * snapResistance;
            
            setScrollTarget({ x: dampenedPosition, y: 0 }, false);
            return;
          }
        }
      }
      
      // Normal scrolling (not near any snap points)
      setScrollTarget({ x: newX, y: 0 }, false);
    }
  }, [
    isGrabbing, 
    interactive, 
    gesturesEnabled, 
    momentum, 
    scrollPosition.x, 
    setScrollTarget, 
    infinite, 
    trackWidth, 
    slideWidth, 
    resistanceFactor, 
    variableResistance, 
    calculateVariableResistance,
    effectiveSnapPoints
  ]);
  
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!interactive || !gesturesEnabled) return;
    
    setIsGrabbing(false);
    
    // Get final velocity for momentum
    const velocity = momentum.end();
    setCurrentVelocity({ x: velocity.velocityX, y: velocity.velocityY });
    
    if (effectiveSnapPoints.length > 0) {
      // If we have custom snap points, find the closest one
      let closestSnapPoint = null;
      let closestDistance = Number.MAX_VALUE;
      let skipSnapping = false;
      
      // Calculate velocity magnitude to determine if it's a fast swipe
      const velocityMagnitude = Math.abs(velocity.velocityX);
      
      // Loop through all snap points to find the closest
      for (const snapPoint of effectiveSnapPoints) {
        if (!snapPoint.enabled) continue;
        
        const distance = Math.abs(scrollPosition.x - snapPoint.position);
        
        // Check if this is the closest snap point so far
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSnapPoint = snapPoint;
        }
        
        // Check if velocity is high enough to bypass this snap point
        if ('velocityThreshold' in snapPoint && snapPoint.velocityThreshold !== undefined && velocityMagnitude > snapPoint.velocityThreshold) {
          // If velocity is above threshold, we might skip snapping
          // This is for the "flick through" behavior
          const inDirectionOfMovement = (velocity.velocityX > 0 && snapPoint.position > scrollPosition.x) ||
                                        (velocity.velocityX < 0 && snapPoint.position < scrollPosition.x);
          if (inDirectionOfMovement) {
            skipSnapping = true;
          }
        }
      }
      
      if (closestSnapPoint && !skipSnapping) {
        // Snap to the closest point
        const snapPosition = closestSnapPoint.position;
        const snapStrength = closestSnapPoint.strength || physics.snapStrength || 0.8;
        
        if (animationStyle === 'spring') {
          // Use spring animation with stronger tension for snappier feel
          const springPosition = { 
            x: snapPosition, 
            y: 0 
          };
          
          // Create snappier spring config for snap points
          const snapSpringConfig = {
            tension: (physics.tension || 240) * snapStrength,
            friction: physics.friction || 24,
            mass: physics.mass || 1
          };
          
          setIsAnimating(true);
          setScrollTarget(springPosition);
          
          // Reset animation flag after transition
          setTimeout(() => {
            setIsAnimating(false);
          }, transitionDuration);
          
          // Update current slide based on the snap point
          if (snapToSlides) {
            // Try to identify which slide this snap point corresponds to
            const snapIndex = defaultSlideSnapPoints.findIndex(p => 
              p.position === closestSnapPoint?.position
            );
            
            if (snapIndex !== -1) {
              setCurrentSlide(snapIndex);
              if (onChange) onChange(snapIndex);
            }
          }
        } else {
          // Use inertial animation
          scrollMovement.setVelocity({ 
            x: (snapPosition - scrollPosition.x) / (transitionDuration / 1000) * 0.3, 
            y: 0 
          });
          setScrollTarget({ x: snapPosition, y: 0 });
        }
      } else {
        // If skipping snap or no snap points, use momentum
        // Free scrolling with momentum, but check for boundaries
        const momentumVelocity = { x: -velocity.velocityX * 10, y: 0 };
        
        // If this is a quick flick, find the snap point in that direction
        if (velocityMagnitude > 0.8) {
          const direction = velocity.velocityX > 0 ? -1 : 1;
          
          // Find potential snap points in the direction of the swipe
          const snapPointsInDirection = effectiveSnapPoints.filter(point => 
            point.enabled && (
              (direction > 0 && point.position < scrollPosition.x) ||
              (direction < 0 && point.position > scrollPosition.x)
            )
          );
          
          if (snapPointsInDirection.length > 0) {
            // Sort by distance from current position
            snapPointsInDirection.sort((a, b) => 
              Math.abs(a.position - scrollPosition.x) - Math.abs(b.position - scrollPosition.x)
            );
            
            // Get the closest point in the direction of movement
            const targetPoint = snapPointsInDirection[0];
            
            // Calculate velocity to reach this point
            const targetVelocity = { 
              x: (targetPoint.position - scrollPosition.x) / (transitionDuration / 1000) * 0.3 * direction, 
              y: 0 
            };
            
            scrollMovement.setVelocity(targetVelocity);
            setScrollTarget({ x: targetPoint.position, y: 0 });
          } else {
            // No snap points in that direction, just use momentum
            scrollMovement.setVelocity(momentumVelocity);
          }
        } else {
          // Not a fast swipe, just use momentum
          scrollMovement.setVelocity(momentumVelocity);
        }
      }
    } else if (snapToSlides) {
      // Default slide-based snapping behavior
      // Find closest slide and snap to it
      const closestSlide = findClosestSlide();
      
      // Apply velocity to help determine target slide
      let targetSlide = closestSlide;
      
      // If swipe was fast enough, use velocity to determine direction
      if (Math.abs(velocity.velocityX) > 0.5) {
        targetSlide = velocity.velocityX > 0 ? Math.max(0, closestSlide - 1) : Math.min(slideCount - 1, closestSlide + 1);
      }
      
      goToSlide(targetSlide);
    } else {
      // Free scrolling with momentum
      scrollMovement.setVelocity({ x: -velocity.velocityX * 10, y: 0 });
    }
    
    // Resume autoplay after delay
    if (pauseOnHover) {
      setTimeout(() => {
        setIsPaused(false);
      }, 500);
    }
    
    // Release pointer capture
    if (trackRef.current) {
      trackRef.current.releasePointerCapture(e.pointerId);
    }
  }, [
    interactive, 
    gesturesEnabled, 
    momentum, 
    snapToSlides, 
    findClosestSlide, 
    slideCount, 
    goToSlide, 
    pauseOnHover, 
    scrollMovement,
    effectiveSnapPoints,
    scrollPosition.x,
    physics,
    animationStyle,
    transitionDuration,
    setScrollTarget,
    onChange,
    defaultSlideSnapPoints
  ]);
  
  // Keyboard navigation state and refs
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const lastKeyPressTime = useRef<number>(0);
  // Using slideRefs declared earlier
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!keyboardNavigation) return;
    
    const now = Date.now();
    lastKeyPressTime.current = now;
    
    // Set keyboard navigation state for focus visibility
    if (!isKeyboardNavigating) {
      setIsKeyboardNavigating(true);
    }
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNextSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slideCount - 1);
        break;
      case 'Tab':
        // Don't interfere with Tab navigation
        break;
      case ' ': // Space
      case 'Enter':
        // If we're focused on an indicator or arrow, let the button handle it
        if (
          e.target instanceof HTMLButtonElement &&
          (e.target.getAttribute('aria-label')?.includes('slide') || 
           e.target.getAttribute('aria-label')?.includes('Previous') ||
           e.target.getAttribute('aria-label')?.includes('Next'))
        ) {
          // Let the button handle it
          break;
        }
        
        // Otherwise, we're on the container - toggle play/pause
        e.preventDefault();
        if (autoPlay) {
          setIsPaused(!isPaused);
        }
        break;
      case 'Escape':
        e.preventDefault();
        // Exit fullscreen or hide controls if implemented
        // For now, just move focus to the container
        if (containerRef.current) {
          containerRef.current.focus();
        }
        break;
    }
  }, [
    keyboardNavigation, 
    goToPrevSlide, 
    goToNextSlide, 
    goToSlide, 
    slideCount, 
    isKeyboardNavigating,
    autoPlay,
    isPaused
  ]);
  
  // Focus management for accessibility
  useEffect(() => {
    // Focus the active slide when navigating with keyboard
    if (isKeyboardNavigating && slideRefs.current) {
      const slideRef = slideRefs.current[`slide-${currentSlide}`];
      if (slideRef) {
        slideRef.focus({ preventScroll: true });
      }
    }
  }, [currentSlide, isKeyboardNavigating]);
  
  // Reset keyboard navigation state on mouse move
  const handleMouseMove = useCallback(() => {
    if (isKeyboardNavigating) {
      const now = Date.now();
      if (now - lastKeyPressTime.current > 500) {
        setIsKeyboardNavigating(false);
      }
    }
  }, [isKeyboardNavigating]);
  
  // Pause autoplay on hover/focus if configured
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && autoPlay) {
      setIsPaused(true);
      lastInteractionTime.current = Date.now();
      
      // Clear any existing interval
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
  }, [pauseOnHover, autoPlay]);
  
  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover && autoPlay && isAutoPlaying) {
      setIsPaused(false);
      lastInteractionTime.current = Date.now();
    }
  }, [pauseOnHover, autoPlay, isAutoPlaying]);
  
  const handleFocus = useCallback(() => {
    if (pauseOnFocus && autoPlay) {
      setIsPaused(true);
      lastInteractionTime.current = Date.now();
      
      // Clear any existing interval
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
  }, [pauseOnFocus, autoPlay]);
  
  const handleBlur = useCallback(() => {
    if (pauseOnFocus && autoPlay && isAutoPlaying) {
      setIsPaused(false);
      lastInteractionTime.current = Date.now();
    }
  }, [pauseOnFocus, autoPlay, isAutoPlaying]);
  
  // Update track position from scroll position
  useEffect(() => {
    if (!trackRef.current) return;
    
    trackRef.current.style.transform = `translateX(${scrollPosition.x}px)`;
  }, [scrollPosition.x]);
  
  // Update current slide when scrolling ends
  useEffect(() => {
    if (!isGrabbing && snapToSlides && !isAnimating) {
      const newSlideIndex = findClosestSlide();
      
      if (newSlideIndex !== currentSlide) {
        setCurrentSlide(newSlideIndex);
        
        // Only trigger onChange if this wasn't already triggered by goToSlide
        if (onChange && newSlideIndex !== activeSlide) {
          onChange(newSlideIndex);
        }
      }
    }
  }, [isGrabbing, findClosestSlide, snapToSlides, isAnimating, currentSlide, onChange, activeSlide]);
  
  // Video refs for playing/pausing
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  
  // Effect to control video playback based on active slide
  useEffect(() => {
    // Handle video playback/pause when active slide changes
    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      const slideIndex = parseInt(id.split('-')[1], 10);
      const isVideoActive = slideIndex === currentSlide;
      
      const videoItem = items[slideIndex]?.video;
      if (!videoItem) return;
      
      if (isVideoActive && videoItem.playWhenActive) {
        videoEl.play().catch(e => console.log('Autoplay prevented:', e));
      } else if (!isVideoActive && videoItem.pauseWhenInactive) {
        videoEl.pause();
      }
    });
  }, [currentSlide, items]);
  
  // Render image content
  const renderImageContent = (image: ImageOptions, alt?: string) => {
    return (
      <ResponsiveImage
        src={image.src}
        alt={image.alt || alt || 'Carousel image'}
        loading={image.loading || 'lazy'}
        $aspectRatio={image.aspectRatio}
        $objectFit={image.objectFit || (image.cover ? 'cover' : 'contain')}
        $objectPosition={image.objectPosition}
      />
    );
  };
  
  // Render video content
  const renderVideoContent = (video: VideoOptions, index: number) => {
    const videoId = `carousel-video-${index}`;
    
    // Handle multiple video sources
    const renderVideoSources = () => {
      if (typeof video.src === 'string') {
        return null; // No sources needed, using src attribute
      }
      
      return video.src.map((source, i) => (
        <source key={i} src={source.src} type={source.type} />
      ));
    };
    
    return (
      <VideoContainer $aspectRatio={video.aspectRatio}>
        <video
          ref={el => {
            if (el) videoRefs.current[videoId] = el;
          }}
          src={typeof video.src === 'string' ? video.src : undefined}
          poster={video.poster}
          autoPlay={video.autoplay}
          loop={video.loop}
          muted={video.muted}
          controls={video.controls}
          playsInline
        >
          {renderVideoSources()}
          Your browser does not support the video tag.
        </video>
      </VideoContainer>
    );
  };
  
  // Render card content
  const renderCardContent = (card: CardOptions) => {
    return (
      <CardContainer
        $glassVariant={card.glassVariant || glassVariant}
        $blurStrength={blurStrength}
        $color={color}
        $elevation={card.elevation || 2}
      >
        {(card.title || card.subtitle || card.icon) && (
          <CardHeader>
            {card.icon && <div className="icon">{card.icon}</div>}
            <div>
              {card.title && <CardTitle>{card.title}</CardTitle>}
              {card.subtitle && <CardSubtitle>{card.subtitle}</CardSubtitle>}
            </div>
          </CardHeader>
        )}
        
        {card.image && (
          <CardImageContainer>
            <img src={card.image} alt={card.title || 'Card image'} />
          </CardImageContainer>
        )}
        
        <CardContent>
          {card.content}
        </CardContent>
        
        {card.actions && (
          <CardActions>
            {card.actions}
          </CardActions>
        )}
      </CardContainer>
    );
  };
  
  // Render HTML content
  const renderHtmlContent = (htmlOptions: HtmlOptions) => {
    const cleanHtml = htmlOptions.sanitize !== false ? sanitizeHtml(htmlOptions.html) : htmlOptions.html;
    
    return (
      <HtmlContent dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    );
  };
  
  // Render slide content
  const renderSlideContent = (item: CarouselItem, index: number, isActive: boolean) => {
    if (renderSlide) {
      return renderSlide(item, index, isActive);
    }
    
    // Determine content to render based on contentType
    let slideContent: React.ReactNode;
    
    if (item.contentType) {
      switch (item.contentType) {
        case 'image':
          if (item.image) {
            slideContent = renderImageContent(item.image, item.alt);
          } else {
            slideContent = item.content || <div>Missing image configuration</div>;
          }
          break;
          
        case 'video':
          if (item.video) {
            slideContent = renderVideoContent(item.video, index);
          } else {
            slideContent = item.content || <div>Missing video configuration</div>;
          }
          break;
          
        case 'card':
          if (item.card) {
            slideContent = renderCardContent(item.card);
          } else {
            slideContent = item.content || <div>Missing card configuration</div>;
          }
          break;
          
        case 'html':
          if (item.html) {
            slideContent = renderHtmlContent(item.html);
          } else {
            slideContent = item.content || <div>Missing HTML configuration</div>;
          }
          break;
          
        case 'custom':
        default:
          slideContent = item.content;
          break;
      }
    } else {
      // Default to content if contentType not specified
      slideContent = item.content;
    }
    
    // Default rendering
    return (
      <CarouselSlide 
        $isActive={isActive}
        $isVisible={Math.abs(index - currentSlide) <= visibleSlides}
        $color={color}
        $glassVariant={glassVariant}
        style={{
          ...item.style,
          backgroundColor: item.backgroundColor
        }}
      >
        {slideContent}
        {item.caption && (
          <SlideCaption 
            $color={color}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
          >
            {item.caption}
          </SlideCaption>
        )}
      </CarouselSlide>
    );
  };
  
  // Render indicators
  const renderIndicators = () => {
    if (!indicators || slideCount <= 1) return null;
    
    const indicatorType = typeof indicators === 'string' ? indicators : 'dots';
    
    return (
      <IndicatorsContainer 
        $color={color} 
        $glassVariant={glassVariant}
        $blurStrength={blurStrength}
      >
        {items.map((_, index) => (
          renderIndicator ? (
            renderIndicator(index, index === currentSlide, () => goToSlide(index))
          ) : (
            <IndicatorDot
              key={`indicator-${index}`}
              $isActive={index === currentSlide}
              $color={color}
              $type={indicatorType}
              $glassVariant={glassVariant}
              $blurStrength={blurStrength}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              {indicatorType === 'numbers' ? index + 1 : ''}
            </IndicatorDot>
          )
        ))}
      </IndicatorsContainer>
    );
  };
  
  // Render play/pause button based on state
  const renderPlayPauseButton = () => {
    if (!autoPlay && !showPlayPauseControl) return null;
    
    return (
      <PlayPauseButton
        $isPlaying={!isPaused}
        $color={color}
        $glassVariant={glassVariant}
        $blurStrength={blurStrength}
        $position={playPausePosition || 'bottom-right'}
        onClick={togglePlayPause}
        aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
        tabIndex={keyboardNavigation ? 0 : -1}
      >
        {isPaused ? (
          // Play icon
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          // Pause icon
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </PlayPauseButton>
    );
  };
  
  // Calculate container height based on various factors
  const getContainerHeight = useCallback(() => {
    // First priority: Adaptive height based on current slide
    if (adaptiveHeight && adaptiveContentHeight) {
      return adaptiveContentHeight;
    }
    
    // Second priority: Aspect ratio
    if (aspectRatio && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const calculatedHeight = calculateAspectRatioHeight(containerWidth);
      if (calculatedHeight) {
        return calculatedHeight;
      }
    }
    
    // Third priority: Responsive height
    if (responsiveConfig.height) {
      return responsiveConfig.height;
    }
    
    // Final fallback: Default height
    return '400px'; // Default height
  }, [adaptiveHeight, adaptiveContentHeight, aspectRatio, calculateAspectRatioHeight, responsiveConfig.height]);
  
  return (
    <CarouselContainer
      ref={containerRef}
      $width={width}
      $height={getContainerHeight()}
      $borderRadius={borderRadius}
      $glassVariant={glassVariant}
      $blurStrength={blurStrength}
      className={className}
      style={{
        ...style,
        transition: adaptiveHeight ? 'height 0.3s ease-out' : undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={keyboardNavigation ? 0 : -1}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      data-keyboard-navigation={isKeyboardNavigating ? "true" : "false"}
    >
      <CarouselTrack
        ref={trackRef}
        $spacing={responsiveConfig.spacing}
        $isAnimating={isAnimating}
        $visibleSlides={responsiveConfig.visibleSlides}
        $isGrabbing={isGrabbing}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-live={autoPlay ? 'off' : 'polite'}
      >
        {items.map((item, index) => (
          <div 
            key={item.id || `slide-${index}`}
            ref={el => {
              if (el) slideRefs.current[`slide-${index}`] = el;
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${slideCount}`}
            aria-hidden={index !== currentSlide}
            tabIndex={keyboardNavigation && index === currentSlide ? 0 : -1}
            onKeyDown={handleKeyDown}
            style={{
              outline: 'none', // Remove default focus outline, we'll use custom styling
            }}
          >
            {renderSlideContent(item, index, index === currentSlide)}
          </div>
        ))}
      </CarouselTrack>
      
      {/* Navigation arrows */}
      {responsiveConfig.arrows && slideCount > 1 && (
        <>
          <NavigationArrow
            $direction="left"
            $color={color}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
            onClick={goToPrevSlide}
            aria-label="Previous slide"
            tabIndex={keyboardNavigation ? 0 : -1}
            disabled={!infinite && currentSlide === 0}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </NavigationArrow>
          <NavigationArrow
            $direction="right"
            $color={color}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
            onClick={goToNextSlide}
            aria-label="Next slide"
            tabIndex={keyboardNavigation ? 0 : -1}
            disabled={!infinite && currentSlide === slideCount - 1}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </NavigationArrow>
        </>
      )}
      
      {/* Play/Pause control */}
      {responsiveConfig.showPlayPauseControl && renderPlayPauseButton()}
      
      {/* Indicators */}
      {responsiveConfig.indicators && renderIndicators()}
    </CarouselContainer>
  );
};

export default GlassCarousel;