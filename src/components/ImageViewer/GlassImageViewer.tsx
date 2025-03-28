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
import { useInertialMovement } from '../../animations/physics/useInertialMovement';
import { useMomentum } from '../../animations/physics/useMomentum';
import { useSpring } from '../../animations/physics/useSpring';
import { magneticEffect } from '../../animations/physics/magneticEffect';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';

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
export interface GlassImageViewerProps {
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
  transition: ${props => props.$isGrabbing ? 'none' : 'transform 0.1s ease-out'};
  
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
  $position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
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
  physics = {
    tension: 180,
    friction: 20,
    mass: 1,
    panDamping: 0.85,
    inertia: 0.8
  },
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
  onImageChange
}) => {
  // State variables for the component
  const [isFullscreen, setIsFullscreen] = useState(mode === 'fullscreen');
  const [showInfoPanel, setShowInfoPanel] = useState(showInfo);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(image);
  
  // State for zoom and pan
  const [scale, setScale] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  
  // Accessibility settings
  const { isReducedMotion } = useAccessibilitySettings();
  
  // Calculate the effective image collection
  const imageCollection = useMemo(() => {
    if (images && images.length > 0) {
      return images;
    } else if (image) {
      return [image];
    }
    return [];
  }, [image, images]);
  
  // Update current image when index changes
  useEffect(() => {
    if (imageCollection.length > 0 && currentIndex >= 0 && currentIndex < imageCollection.length) {
      setCurrentImage(imageCollection[currentIndex]);
    }
  }, [currentIndex, imageCollection]);
  
  // Reset state when image changes
  useEffect(() => {
    setScale(initialZoom);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
  }, [currentImage, initialZoom]);
  
  // Handle fullscreen change
  useEffect(() => {
    if (onFullscreenChange) {
      onFullscreenChange(isFullscreen);
    }
    
    // Setup fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, onFullscreenChange]);
  
  // Handle zoom change
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(scale);
    }
  }, [scale, onZoomChange]);
  
  // Handle image change
  useEffect(() => {
    if (onImageChange && imageCollection.length > 0) {
      onImageChange(currentImage, currentIndex);
    }
  }, [currentImage, currentIndex, imageCollection, onImageChange]);
  
  // Image loading handler
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  // Zoom in function
  const zoomIn = useCallback(() => {
    setScale(prevScale => Math.min(maxZoom, prevScale + 0.5));
  }, [maxZoom]);
  
  // Zoom out function
  const zoomOut = useCallback(() => {
    setScale(prevScale => Math.max(minZoom, prevScale - 0.5));
  }, [minZoom]);
  
  // Reset zoom and position
  const resetView = useCallback(() => {
    setScale(initialZoom);
    setPosition({ x: 0, y: 0 });
  }, [initialZoom]);
  
  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    } else {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    }
  }, [isFullscreen]);
  
  // Toggle info panel
  const toggleInfo = useCallback(() => {
    setShowInfoPanel(prev => !prev);
  }, []);
  
  // Navigate to previous image
  const navigatePrevious = useCallback(() => {
    if (imageCollection.length > 1) {
      setCurrentIndex(prev => 
        prev === 0 ? imageCollection.length - 1 : prev - 1
      );
    }
  }, [imageCollection]);
  
  // Navigate to next image
  const navigateNext = useCallback(() => {
    if (imageCollection.length > 1) {
      setCurrentIndex(prev => 
        prev === imageCollection.length - 1 ? 0 : prev + 1
      );
    }
  }, [imageCollection]);
  
  // Download current image
  const downloadImage = useCallback(() => {
    const link = document.createElement('a');
    link.href = currentImage.src;
    link.download = currentImage.alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentImage]);
  
  // Pointer event handlers for panning
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchGestures || scale <= 1) return;
    
    setIsGrabbing(true);
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Capture pointer to track movement
    if (e.currentTarget) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, [touchGestures, scale]);
  
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isGrabbing || !touchGestures) return;
    
    // Calculate delta movement
    const deltaX = e.clientX - lastPositionRef.current.x;
    const deltaY = e.clientY - lastPositionRef.current.y;
    
    // Update last position
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Calculate boundaries based on image size and scale
    const calculateBoundaries = () => {
      if (!imageRef.current || !containerRef.current) return null;
      
      const imgWidth = imageRef.current.naturalWidth * scale;
      const imgHeight = imageRef.current.naturalHeight * scale;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // If image is smaller than container, don't allow panning
      if (imgWidth <= containerWidth && imgHeight <= containerHeight) {
        return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
      }
      
      // Calculate maximum pan distance
      const xMax = Math.max(0, (imgWidth - containerWidth) / 2) / scale;
      const yMax = Math.max(0, (imgHeight - containerHeight) / 2) / scale;
      
      return { xMin: -xMax, xMax, yMin: -yMax, yMax };
    };
    
    const boundaries = calculateBoundaries();
    if (!boundaries) return;
    
    // Apply movement with boundaries
    setPosition(prev => ({
      x: Math.min(boundaries.xMax, Math.max(boundaries.xMin, prev.x + deltaX / scale)),
      y: Math.min(boundaries.yMax, Math.max(boundaries.yMin, prev.y + deltaY / scale))
    }));
  }, [isGrabbing, touchGestures, scale]);
  
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isGrabbing || !touchGestures) return;
    
    setIsGrabbing(false);
    
    // Release pointer capture
    if (e.currentTarget) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, [isGrabbing, touchGestures]);
  
  // Enhanced touch gesture handlers (pinch-to-zoom) with improved physics
  const prevTouchDistance = useRef<number | null>(null);
  const prevTouchCenter = useRef<{x: number, y: number} | null>(null);
  const touchStartTime = useRef<number>(0);
  const pinchSpring = useRef<{value: number, velocity: number}>({ value: 1, velocity: 0 });
  
  // Enhanced touch gesture handler with focal point tracking
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Record touch start time for velocity calculations
    touchStartTime.current = Date.now();
    
    if (!touchGestures) return;
    
    // Handle different touch scenarios
    if (e.touches.length === 1) {
      // Single touch - prepare for potential pan
      prevTouchCenter.current = null;
      prevTouchDistance.current = null;
    } else if (e.touches.length === 2) {
      // Two touches - prepare for pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate initial distance between touch points
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Store initial pinch center point for focal zooming
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      prevTouchCenter.current = { x: centerX, y: centerY };
      
      // Record initial distance
      prevTouchDistance.current = distance;
      
      // Initialize pinch spring with current scale
      pinchSpring.current = { 
        value: scale, 
        velocity: 0 
      };
    }
    
    // Prevent default behavior
    e.preventDefault();
  }, [touchGestures, scale]);
  
  // Enhanced touch move handler with smoother pinch zoom and focal point
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchGestures) return;
    
    // Handle pinch-to-zoom with two fingers
    if (e.touches.length === 2 && prevTouchDistance.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate new distance and center between touch points
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      // Calculate zoom factor with nonlinear scaling for more control
      // Square root provides more precision for small pinch movements
      const rawDelta = distance / prevTouchDistance.current;
      const delta = rawDelta < 1 
        ? 1 - Math.sqrt(1 - rawDelta) // More precision when zooming out
        : 1 + Math.sqrt(rawDelta - 1); // More precision when zooming in
      
      // Calculate new scale with physics-based smoothing
      const timeElapsed = Math.min(50, Date.now() - touchStartTime.current) / 1000;
      const dampingFactor = 0.5; // Controls how quickly zoom responds
      
      // Update pinch spring value using spring physics for smoother zooming
      const targetScale = Math.max(minZoom, Math.min(maxZoom, scale * delta));
      pinchSpring.current.velocity = (targetScale - pinchSpring.current.value) / timeElapsed;
      pinchSpring.current.value += pinchSpring.current.velocity * timeElapsed * dampingFactor;
      
      // Apply bounds
      pinchSpring.current.value = Math.max(minZoom, Math.min(maxZoom, pinchSpring.current.value));
      
      // Apply the new scale
      setScale(pinchSpring.current.value);
      
      // Focal point zooming - adjust position based on touch center point
      if (prevTouchCenter.current) {
        // Calculate position adjustment to keep the focal point in the same relative position
        const dx = (centerX - prevTouchCenter.current.x) / (scale * 10);
        const dy = (centerY - prevTouchCenter.current.y) / (scale * 10);
        
        setPosition(prev => ({
          x: prev.x - dx,
          y: prev.y - dy
        }));
        
        // Update the center point
        prevTouchCenter.current = { x: centerX, y: centerY };
      }
      
      // Update reference for next calculation
      prevTouchDistance.current = distance;
      touchStartTime.current = Date.now();
    }
    
    // Prevent default to avoid page zooming
    e.preventDefault();
  }, [touchGestures, scale, minZoom, maxZoom]);
  
  // Enhanced touch end handler with inertial finish
  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      // Apply inertial finish to zooming if velocity is significant
      if (pinchSpring.current && pinchSpring.current.velocity !== 0 && Math.abs(pinchSpring.current.velocity) > 0.5) {
        // Calculate target scale based on velocity, with damping
        const targetScale = Math.max(
          minZoom, 
          Math.min(
            maxZoom, 
            scale + pinchSpring.current.velocity * 0.3
          )
        );
        
        // Spring-based animation to settle on final zoom level
        setScale(targetScale);
      }
      
      // Reset all touch tracking
      if (prevTouchDistance.current !== null) {
        prevTouchDistance.current = null;
      }
      
      if (prevTouchCenter.current !== null) {
        prevTouchCenter.current = null;
      }
      
      if (pinchSpring.current) {
        pinchSpring.current = { value: scale, velocity: 0 };
      }
    }
  }, [scale, minZoom, maxZoom]);
  
  // Enhanced double click to zoom with focal point control
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Get container dimensions and position
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative click position within the container
    const relativeX = (e.clientX - containerRect.left) / containerRect.width;
    const relativeY = (e.clientY - containerRect.top) / containerRect.height;
    
    if (scale > 1) {
      // If already zoomed in, reset to default with smooth animation
      resetView();
    } else {
      // Get target zoom level (2x)
      const targetScale = 2;
      
      // Calculate new center point based on click position
      // Center the view on the click point by calculating the required translation
      const newCenterX = (relativeX - 0.5) / initialZoom;
      const newCenterY = (relativeY - 0.5) / initialZoom;
      
      // Apply new scale first
      setScale(targetScale);
      
      // Then pan to center on the clicked position
      setPosition({ 
        x: newCenterX, 
        y: newCenterY 
      });
    }
    
    // Call user-provided handler if available
    if (onImageDoubleClick) {
      onImageDoubleClick(currentImage);
    }
  }, [scale, resetView, onImageDoubleClick, currentImage, initialZoom]);
  
  // Single click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger if not dragging
    if (!isGrabbing && onImageClick) {
      onImageClick(currentImage);
    }
  }, [isGrabbing, onImageClick, currentImage]);
  
  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!keyboardNavigation) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        navigatePrevious();
        break;
      case 'ArrowRight':
        navigateNext();
        break;
      case '+':
      case '=':
        zoomIn();
        break;
      case '-':
        zoomOut();
        break;
      case '0':
        resetView();
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'i':
        toggleInfo();
        break;
      case 'Escape':
        if (isFullscreen) {
          toggleFullscreen();
        }
        break;
    }
  }, [
    keyboardNavigation, 
    navigatePrevious, 
    navigateNext, 
    zoomIn, 
    zoomOut, 
    resetView, 
    toggleFullscreen, 
    toggleInfo, 
    isFullscreen
  ]);
  
  // Render metadata in info panel
  const renderMetadata = () => {
    const metadata = currentImage.metadata;
    if (!metadata) return null;
    
    // Filter out empty values
    const filteredMetadata = Object.entries(metadata).filter(
      ([key, value]) => value && key !== 'title' && key !== 'description'
    );
    
    if (filteredMetadata.length === 0) return null;
    
    return (
      <InfoMetadata>
        {filteredMetadata.map(([key, value]) => (
          <React.Fragment key={key}>
            <InfoTerm>{key.charAt(0).toUpperCase() + key.slice(1)}</InfoTerm>
            <InfoValue>{value}</InfoValue>
          </React.Fragment>
        ))}
      </InfoMetadata>
    );
  };
  
  return (
    <ViewerContainer
      ref={containerRef}
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      $background={background}
      $glassVariant={glassEffect ? glassVariant : undefined}
      $blurStrength={glassEffect ? blurStrength : undefined}
      $isFullscreen={isFullscreen}
      className={className}
      style={style}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <ImageContainer
        $scale={scale}
        $translateX={position.x}
        $translateY={position.y}
        $isGrabbing={isGrabbing}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <Image
          ref={imageRef}
          src={currentImage.src}
          alt={currentImage.alt || 'Image'}
          onLoad={handleImageLoad}
        />
      </ImageContainer>
      
      {/* Info panel */}
      {currentImage.metadata && (
        <InfoPanel
          $color={color}
          $glassVariant={glassEffect ? glassVariant : undefined}
          $blurStrength={glassEffect ? blurStrength : undefined}
          $isVisible={showInfoPanel}
        >
          {currentImage.metadata.title && (
            <InfoTitle>{currentImage.metadata.title}</InfoTitle>
          )}
          {currentImage.metadata.description && (
            <InfoDescription>{currentImage.metadata.description}</InfoDescription>
          )}
          {renderMetadata()}
        </InfoPanel>
      )}
      
      {/* Zoom controls */}
      {zoomControls && (
        <ControlsContainer
          $position="top"
          $color={color}
          $glassVariant={glassEffect ? glassVariant : undefined}
          $blurStrength={glassEffect ? blurStrength : undefined}
        >
          <ControlButton
            $color={color}
            $glassVariant={glassEffect ? glassVariant : undefined}
            $blurStrength={glassEffect ? blurStrength : undefined}
            onClick={zoomOut}
            aria-label="Zoom out"
            disabled={scale <= minZoom}
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </ControlButton>
          
          <ControlButton
            $color={color}
            $glassVariant={glassEffect ? glassVariant : undefined}
            $blurStrength={glassEffect ? blurStrength : undefined}
            onClick={resetView}
            aria-label="Reset zoom"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z" />
            </svg>
          </ControlButton>
          
          <ControlButton
            $color={color}
            $glassVariant={glassEffect ? glassVariant : undefined}
            $blurStrength={glassEffect ? blurStrength : undefined}
            onClick={zoomIn}
            aria-label="Zoom in"
            disabled={scale >= maxZoom}
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </ControlButton>
        </ControlsContainer>
      )}
      
      {/* Navigation controls */}
      {navigationControls && imageCollection.length > 1 && (
        <ControlsContainer
          $position="bottom"
          $color={color}
          $glassVariant={glassEffect ? glassVariant : undefined}
          $blurStrength={glassEffect ? blurStrength : undefined}
        >
          <ControlButton
            $color={color}
            $glassVariant={glassEffect ? glassVariant : undefined}
            $blurStrength={glassEffect ? blurStrength : undefined}
            onClick={navigatePrevious}
            aria-label="Previous image"
          >
            <svg viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </ControlButton>
          
          {/* Image counter */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'white',
            fontSize: '14px' 
          }}>
            {currentIndex + 1} / {imageCollection.length}
          </div>
          
          <ControlButton
            $color={color}
            $glassVariant={glassEffect ? glassVariant : undefined}
            $blurStrength={glassEffect ? blurStrength : undefined}
            onClick={navigateNext}
            aria-label="Next image"
          >
            <svg viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </ControlButton>
        </ControlsContainer>
      )}
      
      {/* Action buttons */}
      <ControlButton
        $position="top-right"
        $color={color}
        $glassVariant={glassEffect ? glassVariant : undefined}
        $blurStrength={glassEffect ? blurStrength : undefined}
        onClick={toggleInfo}
        aria-label={showInfoPanel ? "Hide image info" : "Show image info"}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </ControlButton>
      
      {fullscreenEnabled && (
        <ControlButton
          $position="top-left"
          $color={color}
          $glassVariant={glassEffect ? glassVariant : undefined}
          $blurStrength={glassEffect ? blurStrength : undefined}
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <svg viewBox="0 0 24 24">
            {isFullscreen ? (
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            ) : (
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            )}
          </svg>
        </ControlButton>
      )}
      
      {downloadButton && (
        <ControlButton
          $position="bottom-right"
          $color={color}
          $glassVariant={glassEffect ? glassVariant : undefined}
          $blurStrength={glassEffect ? blurStrength : undefined}
          onClick={downloadImage}
          aria-label="Download image"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        </ControlButton>
      )}
    </ViewerContainer>
  );
};

export default GlassImageViewer;