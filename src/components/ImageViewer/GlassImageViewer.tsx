/**
 * GlassImageViewer Component
 * 
 * A glass-styled image viewer component with physics-based interactions,
 * smooth zoom/pan functionality, and multi-touch gesture support.
 * 
 * Features:
 * - Advanced physics-based zoom and pan capabilities
 * - Momentum and inertial scrolling
 * - Multi-touch gesture support (pinch, drag, flick)
 * - Context-aware glass UI elements
 * - Accessibility support with reduced motion preferences
 * - Keyboard navigation and shortcuts
 * - Fullscreen mode with proper browser API integration
 * - Gallery mode for image collections
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';

// Import physics-related dependencies
import { 
    useInertialMovement2D, 
    type UseInertialMovement2DResult
} from '../../animations/physics/useInertialMovement2D';
import { 
    InertialPresets, 
    type InertialConfig 
} from '../../animations/physics/inertialMovement';
import { useMomentum } from '../../animations/physics/useMomentum';
import { magneticEffect } from '../../animations/physics/magneticEffect';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useGalileoStateSpring, GalileoStateSpringOptions } from '../../hooks/useGalileoStateSpring';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringPresets, type SpringConfig } from '../../animations/physics/springPhysics';
import { AnimationProps } from '../../animations/types';

// Define a Vector2D interface for position coordinates
interface Vector2D {
  x: number;
  y: number;
}

/**
 * Different modes for the image viewer
 */
export type ViewerMode = 'normal' | 'fullscreen' | 'gallery' | 'lightbox';

/**
 * Interface for image metadata
 */
export interface ImageMetadata {
  /** Image title */
  title?: string;
  /** Image description */
  description?: string;
  /** Image creation date */
  date?: string;
  /** Image author/creator */
  author?: string;
  /** Image location */
  location?: string;
  /** Image tags */
  tags?: string[];
  /** Any other custom metadata as key-value pairs */
  [key: string]: any;
}

/**
 * Main image item interface
 */
export interface ImageItem {
  /** Image source URL */
  src: string;
  /** Thumbnail source URL (optional, will use src if not provided) */
  thumbnail?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Image width (if known) */
  width?: number;
  /** Image height (if known) */
  height?: number;
  /** Image metadata */
  metadata?: ImageMetadata;
  /** Whether the image is currently loading */
  loading?: boolean;
  /** Optional image ID */
  id?: string;
}

/**
 * Props for the GlassImageViewer component
 */
export interface GlassImageViewerProps extends AnimationProps {
  /** The main image to display */
  image: ImageItem;
  /** Collection of images for gallery mode */
  images?: ImageItem[];
  /** Initial zoom level (1.0 = 100%) */
  initialZoom?: number;
  /** Maximum allowed zoom level */
  maxZoom?: number;
  /** Minimum allowed zoom level */
  minZoom?: number;
  /** Whether to show information panel */
  showInfo?: boolean;
  /** Whether to use glass styling for the viewer */
  glassEffect?: boolean;
  /** Glass variant */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  /** Glass blur strength */
  blurStrength?: 'light' | 'standard' | 'strong';
  /** Whether to enable zoom controls */
  zoomControls?: boolean;
  /** Whether to enable fullscreen mode */
  fullscreenEnabled?: boolean;
  /** Current viewer mode */
  mode?: ViewerMode;
  /** Whether to show navigation controls in gallery mode */
  navigationControls?: boolean;
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Whether to enable touch gestures */
  touchGestures?: boolean;
  /** Color theme for controls */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  /** Whether to show the image download button */
  downloadButton?: boolean;
  /** Physics configuration for interactions */
  physics?: {
    /** Spring tension/stiffness */
    tension?: number;
    /** Spring friction/damping */
    friction?: number;
    /** Spring mass */
    mass?: number;
    /** Damping factor for panning */
    panDamping?: number;
    /** Inertia factor for flick gestures */
    inertia?: number;
  };
  /** Width of the viewer */
  width?: string | number;
  /** Height of the viewer */
  height?: string | number;
  /** Border radius of the viewer */
  borderRadius?: string | number;
  /** Background color/image for the viewer */
  background?: string;
  /** Additional CSS class for the viewer */
  className?: string;
  /** Additional inline styles for the viewer */
  style?: React.CSSProperties;
  /** Function called when an image is clicked */
  onImageClick?: (image: ImageItem) => void;
  /** Function called when an image is double-clicked */
  onImageDoubleClick?: (image: ImageItem) => void;
  /** Function called when fullscreen mode changes */
  onFullscreenChange?: (isFullscreen: boolean) => void;
  /** Function called when zoom level changes */
  onZoomChange?: (zoomLevel: number) => void;
  /** Function called when active image changes in gallery mode */
  onImageChange?: (image: ImageItem, index: number) => void;
}

/**
 * Fade-in animation keyframes
 */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/**
 * Main container for the image viewer
 */
const ViewerContainer = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $borderRadius?: string | number;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
  $background?: string;
  $isFullscreen?: boolean;
}>`
  position: relative;
  width: ${props => props.$isFullscreen 
    ? '100vw' 
    : (props.$width 
      ? (typeof props.$width === 'number' ? `${props.$width}px` : props.$width)
      : '100%')};
  height: ${props => props.$isFullscreen
    ? '100vh'
    : (props.$height
      ? (typeof props.$height === 'number' ? `${props.$height}px` : props.$height)
      : '500px')};
  overflow: hidden;
  border-radius: ${props => props.$isFullscreen 
    ? '0' 
    : (props.$borderRadius 
      ? (typeof props.$borderRadius === 'number' 
        ? `${props.$borderRadius}px` 
        : props.$borderRadius)
      : '8px')};
  background: ${props => props.$background || 'rgba(0, 0, 0, 0.2)'};
  
  /* Apply glass styling if requested */
  ${props => props.$glassVariant && css`
    ${() => {
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
  `}
  
  /* Fullscreen specific styles */
  ${props => props.$isFullscreen && css`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    background: ${props.$background || 'rgba(0, 0, 0, 0.9)'};
  `}
  
  /* Common styles */
  user-select: none;
  
  /* Performance optimizations */
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  
  /* Animation */
  animation: ${fadeIn} 0.3s ease-out;
`;

/**
 * Image container with pan and zoom capabilities
 */
const ImageContainer = styled.div<{
  $scale: number;
  $translateX: number;
  $translateY: number;
  $isGrabbing: boolean;
}>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(${props => props.$scale}) translate(${props => props.$translateX}px, ${props => props.$translateY}px);
  cursor: ${props => props.$isGrabbing ? 'grabbing' : 'grab'};
  transform-origin: center center;
  
  /* Performance optimizations */
  will-change: transform;
`;

/**
 * Main image element
 */
const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  
  /* Animation */
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-out forwards;
  animation-delay: 0.1s;
`;

/**
 * Control button with glass effect
 */
const ControlButton = styled.button<{
  $position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'center-left' | 'center-right';
  $color: string;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
}>`
  position: absolute;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-out;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  
  /* Position based on prop */
  ${props => {
    switch (props.$position) {
      case 'top-left': return 'top: 10px; left: 10px;';
      case 'top-right': return 'top: 10px; right: 10px;';
      case 'bottom-left': return 'bottom: 10px; left: 10px;';
      case 'bottom-right': return 'bottom: 10px; right: 10px;';
      case 'center': return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
      case 'center-left': return 'top: 50%; left: 10px; transform: translateY(-50%);';
      case 'center-right': return 'top: 50%; right: 10px; transform: translateY(-50%);';
      default: return '';
    }
  }}
  
  /* Apply glass styling if requested */
  ${props => props.$glassVariant && css`
    ${() => {
      const themeContext = createThemeContext({});
      
      switch (props.$glassVariant) {
        case 'clear':
          return glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'light',
            borderOpacity: 'subtle',
            themeContext,
          });
        case 'tinted':
          return glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          });
        default: // frosted
          return glassSurface({
            elevation: 3,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          });
      }
    }}
  `}
  
  /* Color-based enhancements */
  ${props => props.$color !== 'default' && css`
    color: var(--color-${props.$color}-light, white);
  `}
  
  /* Hover effects */
  &:hover {
    transform: ${props => props.$position === 'center' 
      ? 'translate(-50%, -50%) scale(1.1)' 
      : 'scale(1.1)'};
    opacity: 1;
  }
  
  /* Focus styling */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
  
  /* Icon styling */
  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

/**
 * Information panel component
 */
const InfoPanel = styled.div<{
  $color: string;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
  $isVisible: boolean;
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  transform: translateY(${props => props.$isVisible ? '0' : '100%'});
  transition: transform 0.3s ease-out;
  color: white;
  
  /* Apply glass styling */
  ${props => {
    const themeContext = createThemeContext({});
    
    if (props.$glassVariant) {
      switch (props.$glassVariant) {
        case 'clear':
          return glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'light',
            borderOpacity: 'none',
            themeContext,
          });
        case 'tinted':
          return glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'none',
            themeContext,
          });
        default: // frosted
          return glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'none',
            themeContext,
          });
      }
    } else {
      return css`
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
      `;
    }
  }}
  
  /* Base info panel styles */
  z-index: 5;
`;

/**
 * Info panel title
 */
const InfoTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 500;
`;

/**
 * Info panel description
 */
const InfoDescription = styled.p`
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

/**
 * Info panel metadata list
 */
const InfoMetadata = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  margin: 8px 0 0 0;
  font-size: 0.8rem;
`;

/**
 * Info metadata term
 */
const InfoTerm = styled.dt`
  font-weight: 500;
  opacity: 0.9;
`;

/**
 * Info metadata value
 */
const InfoValue = styled.dd`
  margin: 0;
  opacity: 0.8;
`;

/**
 * Controls container
 */
const ControlsContainer = styled.div<{
  $position: 'top' | 'bottom';
  $color: string;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
}>`
  position: absolute;
  ${props => props.$position === 'top' ? 'top: 0;' : 'bottom: 0;'}
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  z-index: 10;
  
  /* Apply glass styling */
  ${props => {
    const themeContext = createThemeContext({});
    
    if (props.$glassVariant) {
      switch (props.$glassVariant) {
        case 'clear':
          return glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'light',
            borderOpacity: 'none',
            themeContext,
          });
        case 'tinted':
          return glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'none',
            themeContext,
          });
        default: // frosted
          return glassSurface({
            elevation: 2,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'none',
            themeContext,
          });
      }
    } else {
      return css`
        background: ${props.$position === 'top' ? 
          'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))' : 
          'linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))'};
      `;
    }
  }}
  
  /* Animation */
  opacity: 0;
  transition: opacity 0.3s ease-out;
  
  &:hover {
    opacity: 1;
  }
`;

/**
 * Simple Spinner Component
 */
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div<{$color: string}>`
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-left-color: ${props => `var(--color-${props.$color}-light, white)`};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

/**
 * GlassImageViewer Component
 */
export const GlassImageViewer: React.FC<GlassImageViewerProps> = ({
  image,
  images,
  initialZoom = 1.0,
  maxZoom = 5.0,
  minZoom = 0.5,
  showInfo = false,
  glassEffect = true,
  glassVariant = 'frosted',
  blurStrength = 'standard',
  zoomControls = true,
  fullscreenEnabled = true,
  mode = 'normal',
  navigationControls = true,
  keyboardNavigation = true,
  touchGestures = true,
  color = 'primary',
  downloadButton = true,
  physics: legacyPhysics,
  width,
  height,
  borderRadius,
  background,
  className,
  style,
  onImageClick,
  onImageDoubleClick,
  onFullscreenChange,
  onZoomChange,
  onImageChange,
  animationConfig,
  disableAnimation,
  motionSensitivity,
}) => {
  // State variables
  const [currentImage, setCurrentImage] = useState<ImageItem>(image);
  const [currentIndex, setCurrentIndex] = useState<number>(() => 
    images ? images.findIndex(img => img.id === image.id || img.src === image.src) : 0
  );
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom);
  const [position, setPosition] = useState<Vector2D>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Vector2D | null>(null);
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [pinchStartDistance, setPinchStartDistance] = useState<number>(0);
  const [pinchStartZoom, setPinchStartZoom] = useState<number>(initialZoom);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(mode === 'fullscreen');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Animation Context and Settings
  const { defaultSpring, disableAnimation: contextDisableAnimation } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  
  // Calculate final disable state
  const finalDisableAnimation = disableAnimation ?? contextDisableAnimation ?? prefersReducedMotion;

  // Extract legacy physics props or use defaults
  const finalLegacyPhysics = useMemo(() => ({
    tension: 180,
    friction: 20,
    mass: 1,
    panDamping: 0.85,
    inertia: 0.8,
    ...(legacyPhysics || {}),
  }), [legacyPhysics]);

  // Calculate final spring config for zoom level animation
  const finalZoomSpringConfig = useMemo(() => {
      const baseConfig: SpringConfig = SpringPresets.GENTLE; // Use GENTLE preset for zoom
      let contextConfig: Partial<SpringConfig> = {};
      if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
          contextConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else if (typeof defaultSpring === 'object') {
          contextConfig = defaultSpring ?? {};
      }

      // Prioritize animationConfig prop, then legacy physics prop
      let propConfig: Partial<SpringConfig> = {};
      const propSource = animationConfig ?? finalLegacyPhysics; // Check animationConfig first
      if (typeof propSource === 'string' && propSource in SpringPresets) {
          propConfig = SpringPresets[propSource as keyof typeof SpringPresets];
      } else if (typeof propSource === 'object') {
          // Extract relevant spring properties
          propConfig = {
              tension: (propSource as any).tension,
              friction: (propSource as any).friction,
              mass: (propSource as any).mass,
          };
          // Filter out undefined values
          propConfig = Object.fromEntries(Object.entries(propConfig).filter(([_, v]) => v !== undefined));
      }

      return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, animationConfig, finalLegacyPhysics]);

  // Use Galileo Spring for zoom level
  const animatedZoom = useGalileoStateSpring(zoomLevel, {
      ...(finalZoomSpringConfig as SpringConfig), // Cast if needed, properties are directly on options
      immediate: finalDisableAnimation, // Use final disable state
      onRest: (result) => {
        // Optionally handle animation end
        if (onZoomChange && result.finished) {
            onZoomChange(result.value); // Notify with final value
        }
      }
  });

  // Calculate final panning config (using InertialPresets)
  const finalPanningConfig = useMemo(() => {
    const baseConfig: Partial<InertialConfig> = InertialPresets.DEFAULT;
    let contextConfig: Partial<InertialConfig> = {};
    // Use defaultSpring from context, adapting if possible
    if (typeof defaultSpring === 'string' && defaultSpring in InertialPresets) {
      contextConfig = InertialPresets[defaultSpring as keyof typeof InertialPresets];
    } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
      // Adapt SpringConfig to InertialConfig if necessary
      // Note: InertialConfig uses 'friction' (0-1), SpringConfig uses 'friction' (damping ratio)
      // Direct mapping might not be perfect. Using spring values directly if they exist.
      contextConfig = {
          friction: defaultSpring.friction, // This might need adjustment based on expected range
      };
      // Filter out undefined
      contextConfig = Object.fromEntries(Object.entries(contextConfig).filter(([_, v]) => v !== undefined));
    }

    // Prioritize animationConfig prop
    let propConfig: Partial<InertialConfig> = {};
    const propSource = animationConfig;
    if (typeof propSource === 'string' && propSource in InertialPresets) {
        propConfig = InertialPresets[propSource as keyof typeof InertialPresets];
    } else if (typeof propSource === 'object' && propSource !== null) {
        // Use InertialConfig props if present in animationConfig object
        propConfig = {
            friction: (propSource as Partial<InertialConfig>).friction,
            restThreshold: (propSource as Partial<InertialConfig>).restThreshold,
            maxVelocity: (propSource as Partial<InertialConfig>).maxVelocity,
        };
        // Filter out undefined
        propConfig = Object.fromEntries(Object.entries(propConfig).filter(([_, v]) => v !== undefined));
    }

    // Merge: Base < Context < Prop
    return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, animationConfig]);

  // Calculate movement bounds here, AFTER dimensions state but BEFORE inertial hook
  const movementBounds = useMemo(() => {
    if (!containerDimensions.width || !containerDimensions.height || !imageDimensions.width || !imageDimensions.height) {
      return undefined;
    }
    const currentZoom = animatedZoom.value;
    const scaledWidth = imageDimensions.width * currentZoom;
    const scaledHeight = imageDimensions.height * currentZoom;
    const maxX = Math.max(0, (scaledWidth - containerDimensions.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerDimensions.height) / 2);
    return { minX: -maxX, maxX: maxX, minY: -maxY, maxY: maxY };
  }, [containerDimensions, imageDimensions, animatedZoom.value]);

  // Use Inertial Movement for Panning - AFTER bounds calculation
  const { 
      position: inertialPosition,
      setPosition: setInertialPosition,
  } = useInertialMovement2D({
      config: finalPanningConfig, 
  });

  // --- Sync Position State & Apply Bounds ---
  // This effect comes AFTER hook and bounds calculation
  useEffect(() => {
      let clampedX = inertialPosition.x;
      let clampedY = inertialPosition.y;

      if (movementBounds) {
          clampedX = Math.max(movementBounds.minX, Math.min(movementBounds.maxX, inertialPosition.x));
          clampedY = Math.max(movementBounds.minY, Math.min(movementBounds.maxY, inertialPosition.y));
      }
      
      if (clampedX !== position.x || clampedY !== position.y) {
        setPosition({ x: clampedX, y: clampedY }); // Use state setter
      }
  }, [inertialPosition, movementBounds, position.x, position.y]);

  // --- Image Loading & Dimension Calculation ---
  useEffect(() => {
    // Update container dimensions
    if (containerRef.current) {
      setContainerDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    }
    // Load image and update its dimensions
    setIsLoading(true);
    const img = new window.Image();
    img.src = currentImage.src;
    img.onload = () => {
        setIsLoading(false);
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      console.error("Failed to load image:", currentImage.src);
      setIsLoading(false);
      setImageDimensions({ width: 0, height: 0 }); // Reset dimensions on error
    };
    // Add ResizeObserver here for container changes if needed
  }, [currentImage.src]); // Re-run only when image src changes

  // --- Fullscreen Handling ---
  const handleFullscreenChange = useCallback(() => {
      const isFs = document.fullscreenElement === containerRef.current;
      setIsFullscreen(isFs);
      if (onFullscreenChange) {
          onFullscreenChange(isFs);
      }
  }, [onFullscreenChange]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
      if (!fullscreenEnabled || !containerRef.current) return;
      if (!document.fullscreenElement) {
          containerRef.current.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      } else {
          if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      }
  }, [fullscreenEnabled]);

  // --- Control Visibility Logic ---
  const hideControls = useCallback(() => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (showControls) setShowControls(false);
  }, [showControls]);

  const scheduleHideControls = useCallback(() => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(hideControls, 3000); // Hide after 3s
  }, [hideControls]);

  const revealControls = useCallback(() => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (!showControls) setShowControls(true);
      scheduleHideControls();
  }, [showControls, scheduleHideControls]);

  // Initial setup and cleanup for controls visibility
  useEffect(() => {
      if (!isDragging && !isPinching) {
          scheduleHideControls();
      }
      return () => {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      };
  }, [isDragging, isPinching, scheduleHideControls]);

  // Reset controls on image change
  useEffect(() => {
      revealControls();
  }, [currentImage, revealControls]);

  // --- Zoom Handling ---
  const handleZoom = useCallback((delta: number, origin?: Vector2D) => {
    // ... (existing zoom logic, but use setZoomLevel instead of direct spring updates)
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel * delta));
    
    if (newZoom !== zoomLevel) {
        // TODO: Adjust position based on zoom origin
        setZoomLevel(newZoom);
        // No need to call onZoomChange here, spring's onRest handles it
    }
    revealControls(); // Show controls on interaction
  }, [zoomLevel, minZoom, maxZoom, revealControls]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    // Zoom in on double click, or reset if already zoomed
    const targetZoom = zoomLevel > initialZoom * 1.5 ? initialZoom : zoomLevel * 2;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, targetZoom));
    
    // Calculate zoom origin based on click position
    // ... (origin calculation logic) ...
    
    setZoomLevel(clampedZoom);
    
    if (onImageDoubleClick) {
        onImageDoubleClick(currentImage);
    }
    revealControls();
  }, [zoomLevel, initialZoom, minZoom, maxZoom, onImageDoubleClick, currentImage, revealControls]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 1.1 : 1 / 1.1; // Zoom factor
      // Calculate origin based on mouse position
      // ... (origin calculation) ...
      handleZoom(delta);
  }, [handleZoom]);

  // --- Pan Handling ---
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
      if (event.button !== 0) return; // Only main click
      if (isPinching) return;
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      containerRef.current?.setPointerCapture(event.pointerId);
      revealControls();
  }, [isPinching, revealControls]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
      if (!isDragging || !dragStart) return;
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      
      // Apply movement directly via setInertialPosition to allow smooth transition to inertia
      setInertialPosition({ x: position.x + dx, y: position.y + dy });
      
      setDragStart({ x: event.clientX, y: event.clientY }); // Update drag start for next move delta
      revealControls();
  }, [isDragging, dragStart, position, setInertialPosition, revealControls]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      setDragStart(null);
      containerRef.current?.releasePointerCapture(event.pointerId);
      
      // Inertia is handled by useInertialMovement2D if velocity was tracked
      // Need to potentially pass velocity to the hook on release if it supports it
      // applyForce({ x: velocityX, y: velocityY }); // Example if hook supports applyForce
      scheduleHideControls(); // Restart hide timer
  }, [isDragging, scheduleHideControls /*, applyForce */]);

  // --- Pinch Handling (Simplified Example) ---
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
      if (event.touches.length === 2) {
          event.preventDefault();
          setIsPinching(true);
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
          setPinchStartDistance(dist);
          setPinchStartZoom(zoomLevel);
          revealControls();
      } else if (event.touches.length === 1) {
          // Handle single touch drag start (like pointer down)
          const touch = event.touches[0];
          handlePointerDown(touch as any); // Cast might be needed
      }
  }, [zoomLevel, setIsPinching, handlePointerDown, revealControls]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
      if (isPinching && event.touches.length === 2) {
          event.preventDefault();
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          const currentDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
          const zoomFactor = currentDist / pinchStartDistance;
          const newZoom = Math.max(minZoom, Math.min(maxZoom, pinchStartZoom * zoomFactor));
          
          if (newZoom !== zoomLevel) {
              // TODO: Pinch zoom origin calculation
              setZoomLevel(newZoom);
          }
          revealControls();
      } else if (isDragging && event.touches.length === 1) {
          // Handle single touch drag move (like pointer move)
          const touch = event.touches[0];
          handlePointerMove(touch as any);
      }
  }, [
      isPinching, 
      pinchStartDistance, 
      pinchStartZoom, 
      minZoom, 
      maxZoom, 
      zoomLevel, 
      isDragging, 
      handlePointerMove, 
      revealControls
  ]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
      if (isPinching) {
          setIsPinching(false);
          scheduleHideControls();
      } 
      if (isDragging && event.touches.length === 0) {
          // Handle drag end (like pointer up)
          handlePointerUp(null as any); // Pass dummy event or refactor to not need it
      }
  }, [isPinching, isDragging, handlePointerUp, scheduleHideControls]);

  // --- Keyboard Navigation ---
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!keyboardNavigation) return;
      // ... (Implement keyboard controls: arrow keys for pan, +/- for zoom, F for fullscreen, Esc)
      revealControls();
  }, [keyboardNavigation, revealControls]);

  // --- Gallery Navigation ---
  const navigateGallery = useCallback((direction: 'next' | 'prev') => {
    if (!images || images.length <= 1) return;
    let newIndex = currentIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }
    setCurrentImage(images[newIndex]);
    setCurrentIndex(newIndex);
    // Reset zoom and pan on image change
    setZoomLevel(initialZoom);
    setInertialPosition({ x: 0, y: 0 });
    if (onImageChange) {
      onImageChange(images[newIndex], newIndex);
    }
    revealControls();
  }, [
    images, 
    currentIndex, 
    initialZoom, 
    setInertialPosition, 
    onImageChange, 
    revealControls
  ]);

  // --- Click Handling ---
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
      // Only trigger if not dragging/pinching
      if (!isDragging && !isPinching && onImageClick) {
          // Check if click was on the image itself potentially
          if (event.target === imageRef.current) {
              onImageClick(currentImage);
          }
      }
      revealControls(); // Always reveal on click
  };

  // --- Render Functions ---
  const renderControls = () => (
    <>
      {zoomControls && showControls && (
        <>
          <ControlButton
            onClick={() => handleZoom(1.2)} 
            $position="bottom-left" 
            $color={color}
            $glassVariant={glassVariant} 
            $blurStrength={blurStrength}
            aria-label="Zoom In"
            style={{ marginBottom: '50px' }} // Adjust position to avoid overlap
          >
            {/* Zoom In Icon */}
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </ControlButton>
          <ControlButton
            onClick={() => handleZoom(1 / 1.2)} 
            $position="bottom-left" 
            $color={color}
            $glassVariant={glassVariant} 
            $blurStrength={blurStrength}
            aria-label="Zoom Out"
          >
            {/* Zoom Out Icon */}
            <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
          </ControlButton>
        </>
      )}
      {fullscreenEnabled && showControls && (
          <ControlButton
          onClick={toggleFullscreen} 
          $position="top-right" 
            $color={color}
          $glassVariant={glassVariant} 
          $blurStrength={blurStrength}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? 
            <svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v3H8v2h5z"/></svg> : 
            <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zm-3-7V7h-2v3H7v2h5z"/></svg>
          }
          </ControlButton>
      )}
      {/* Add Download Button */}
      {mode === 'gallery' && navigationControls && images && images.length > 1 && showControls && (
          <>
          <ControlButton
                onClick={() => navigateGallery('prev')} 
                $position="center-left" /* Position needs custom logic/styling */
                $color={color} $glassVariant={glassVariant} $blurStrength={blurStrength}
                aria-label="Previous Image"
                style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            >
                 <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </ControlButton>
          <ControlButton
                onClick={() => navigateGallery('next')} 
                $position="center-right" /* Position needs custom logic/styling */
                $color={color} $glassVariant={glassVariant} $blurStrength={blurStrength}
                aria-label="Next Image"
                 style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
            >
                <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </ControlButton>
          </>
      )}
    </>
  );

  const renderInfoPanel = () => (
      showInfo && currentImage.metadata && (
          <InfoPanel
        $color={color}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
            $isVisible={showControls} // Tie visibility to controls
          >
              {/* Render metadata here */}
              {currentImage.metadata.title && <h4>{currentImage.metadata.title}</h4>}
              {/* ... other metadata fields */}
          </InfoPanel>
      )
  );

  return (
    <ViewerContainer
      ref={containerRef}
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
          $glassVariant={glassEffect ? glassVariant : undefined}
          $blurStrength={glassEffect ? blurStrength : undefined}
      $background={background}
      $isFullscreen={isFullscreen}
      className={`glass-image-viewer ${className || ''}`}
      style={style}
      onClick={handleContainerClick}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp} // Treat leave as pointer up
      onTouchStart={touchGestures ? handleTouchStart : undefined}
      onTouchMove={touchGestures ? handleTouchMove : undefined}
      onTouchEnd={touchGestures ? handleTouchEnd : undefined}
      onTouchCancel={touchGestures ? handleTouchEnd : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={keyboardNavigation ? 0 : -1} // Allow focus for keyboard nav
    >
      <ImageContainer
        $scale={animatedZoom.value} // Use animated zoom value
        $translateX={position.x}
        $translateY={position.y}
        $isGrabbing={isDragging}
      >
        {isLoading ? (
          <Spinner $color={color} />
        ) : (
          <Image
            ref={imageRef}
            src={currentImage.src}
            alt={currentImage.alt || 'Image'}
            draggable="false"
          />
        )}
      </ImageContainer>
      
      {renderControls()}
      {renderInfoPanel()}

      {/* Optional: Thumbnail Strip for Gallery Mode */}
      {/* {mode === 'gallery' && images && images.length > 1 && <ThumbnailStrip> ... </ThumbnailStrip>} */}

    </ViewerContainer>
  );
};

// Default export
export default GlassImageViewer;