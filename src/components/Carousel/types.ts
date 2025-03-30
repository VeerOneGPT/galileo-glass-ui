/**
 * Type definitions for the Carousel component
 */

import React from 'react';
import { GalileoSpringConfig } from '../../hooks/useGalileoStateSpring';
import { SpringConfig } from '../../animations/physics/springPhysics';
import { PhysicsConfig } from '../../animations/physics/galileoPhysicsSystem';

/**
 * Basic AnimationProps definition (replace with canonical import if found)
 */
interface AnimationProps {
  animationConfig?: SpringConfig | PhysicsConfig | string;
  disableAnimation?: boolean;
}

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
  /** Options for large screens (e 1200px) */
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
export interface GlassCarouselProps extends AnimationProps {
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
  /**
   * Aria label for the previous button
   */
  prevButtonAriaLabel?: string;
  /**
   * Aria label for the next button
   */
  nextButtonAriaLabel?: string;
}