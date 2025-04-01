/**
 * GlassCarousel Component
 * 
 * A glass-styled carousel component with physics-based animations,
 * momentum scrolling, and snap points for natural interactions.
 */
import React, { useEffect, useRef, useState, useMemo, forwardRef, useCallback, Children, isValidElement, cloneElement, RefCallback, ReactElement, HTMLAttributes } from 'react';
import styled, { useTheme } from 'styled-components';

// Types
import { AnimationProps } from '../../types/animation';

// Hooks
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useInertialMovement2D } from '../../animations/physics/useInertialMovement2D';

// Components and styled components
import { 
  CarouselNavigation,
  CarouselIndicators,
  PlayPauseControl,
  CarouselContainer,
} from './components';

// Galileo Imports
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { createThemeContext } from '../../core/themeContext';

export interface GlassCarouselProps extends AnimationProps {
  /**
   * Carousel items (children)
   */
  children: React.ReactNode;

  /**
   * Width of each item
   */
  itemWidth?: number;

  /**
   * Gap between items
   */
  itemGap?: number;

  /**
   * Height of the carousel
   */
  height?: string | number;

  /**
   * Show controls
   */
  showControls?: boolean;

  /**
   * Show indicators
   */
  showIndicators?: boolean;

  /**
   * Loop through items
   */
  loop?: boolean;

  /**
   * Peek at the next or previous item
   */
  peek?: 'none' | 'left' | 'right';

  /**
   * Glass styling
   */
  glass?: boolean;

  /**
   * Rounded corners
   */
  rounded?: boolean;

  /**
   * Glow effect
   */
  glow?: boolean;

  /**
   * Glow color
   */
  glowColor?: string;

  /**
   * Edge highlight
   */
  edge?: boolean;

  /**
   * Inner padding
   */
  innerPadding?: number;

  /**
   * Add Custom className
   */
  className?: string;

  /**
   * If true, automatically moves through items
   */
  autoplay?: boolean;

  /**
   * Delay in ms for autoplay
   */
  autoplayDelay?: number;

  /**
   * If true, stops autoplay on hover
   */
  pauseOnHover?: boolean;

  /**
   * Custom sensitivity for motion-based interactions (e.g., drag velocity)
   */
  motionSensitivity?: number;

  /**
   * Remove animationConfig from here if it's in AnimationProps
   */
  // animationConfig?: Partial<SpringConfig>; 
}

// Styled Components
const CarouselInner = styled.div`
  display: flex;
  will-change: transform;
`;

const CarouselItem = styled.div<{
  $width: number;
  $fullHeight?: boolean;
  $itemGap: number;
}>`
  flex: 0 0 ${props => props.$width}px;
  width: ${props => props.$width}px;
  height: ${props => props.$fullHeight ? '100%' : 'auto'};
  position: relative;
  overflow: hidden;
  margin-right: ${props => props.$itemGap}px;

  &:last-child {
      margin-right: 0;
  }
`;

/**
 * Glass Carousel - A carousel component with glass styling and physics-based animations
 */
export const GlassCarousel = forwardRef<HTMLDivElement, GlassCarouselProps>((props, ref) => {
  const {
    children,
    itemWidth = 200,
    itemGap = 16,
    height = 'auto',
    showControls = true,
    showIndicators = true,
    loop = true,
    peek = 'none',
    glass = true,
    rounded = true,
    glow = true,
    glowColor,
    edge = true,
    innerPadding = 0,
    className,
    autoplay = false,
    autoplayDelay = 3000,
    pauseOnHover = true,
    motionSensitivity,
    animationConfig,
    disableAnimation: propDisableAnimation,
    ...rest
  } = props;

  const theme = useGlassTheme();
  const themeContext = useMemo(() => createThemeContext(theme.theme), [theme.theme]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScrollX = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });

  // Animation Context and Settings
  const { defaultSpring, disableAnimation: contextDisableAnimation } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  const finalDisableAnimation = propDisableAnimation ?? contextDisableAnimation ?? prefersReducedMotion;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Callback ref to collect item refs
  const setItemRef = useCallback(
    (index: number): RefCallback<HTMLDivElement> => (el) => {
      itemRefs.current[index] = el;
    },
    []
  );

  const childrenArray = Children.toArray(children);

  // Adjust itemRefs array size when children change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, Children.count(children));
  }, [children]);

  // State for container width
  const [containerWidthState, setContainerWidthState] = useState(0);
  useEffect(() => {
      const updateWidth = () => {
          if (containerRef.current) {
              setContainerWidthState(containerRef.current.offsetWidth);
          }
      };
      const handleResize = () => requestAnimationFrame(updateWidth);
      updateWidth();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate total width and bounds
  const totalWidth = useMemo(() => {
      return itemWidth * childrenArray.length + itemGap * (childrenArray.length > 0 ? childrenArray.length - 1 : 0);
  }, [childrenArray.length, itemWidth, itemGap]);

  const bounds = useMemo(() => {
    if (!containerWidthState || totalWidth <= containerWidthState) return { min: 0, max: 0 };
    const scrollableWidth = containerWidthState - 2 * innerPadding;
    const maxScroll = totalWidth - scrollableWidth;
    return { min: Math.min(0, -maxScroll), max: 0 };
  }, [containerWidthState, totalWidth, innerPadding]);

  // Merged Inertial Config
  const finalInertialConfig = useMemo(() => {
      const baseConfig = SpringPresets.DEFAULT;
      let resolvedContextConfig = {};
      if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
        resolvedContextConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
        resolvedContextConfig = defaultSpring;
      }
      let propConf = {};
      const propSource = animationConfig;
      if (typeof propSource === 'string' && propSource in SpringPresets) {
        propConf = SpringPresets[propSource as keyof typeof SpringPresets];
      } else if (typeof propSource === 'object' && propSource !== null) {
        propConf = propSource;
      }
      return { ...baseConfig, ...resolvedContextConfig, ...propConf };
  }, [defaultSpring, animationConfig]);

  // Inertial Movement Hook
  const { position, setPosition, movement } = useInertialMovement2D({
    config: finalInertialConfig,
  });

  // --- Manual Drag Handling --- 
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartScrollX.current = position.x;
    movement.setVelocity({ x: 0, y: 0 });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [position.x, movement]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    const newX = dragStartScrollX.current + deltaX;
    const clampedX = Math.max(bounds.min, Math.min(bounds.max, newX));
    setPosition({ x: clampedX, y: 0 }, true);
    velocityRef.current = { x: e.movementX, y: 0 };
  }, [isDragging, setPosition, bounds]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    movement.setVelocity(velocityRef.current);
    velocityRef.current = { x: 0, y: 0 };
  }, [isDragging, movement]);

  // --- End Manual Drag Handling --- 

  // Function to scroll to a specific index
  const scrollToIndex = useCallback((index: number, immediate = false) => {
    const targetIndex = loop ? index : Math.max(0, Math.min(childrenArray.length - 1, index));
    const targetX = -targetIndex * (itemWidth + itemGap);
    const boundedTargetX = Math.max(bounds.min, Math.min(bounds.max, targetX));
    setPosition({ x: boundedTargetX, y: 0 }, !immediate);
    if (currentIndex !== targetIndex) {
        setCurrentIndex(targetIndex);
    }
  }, [loop, childrenArray.length, itemWidth, itemGap, setPosition, bounds, currentIndex]);

  // Handle window resize
  useEffect(() => {
      scrollToIndex(currentIndex, true);
  }, [containerWidthState, scrollToIndex, currentIndex]);

  // Autoplay logic
  useEffect(() => {
    if (!autoplay || childrenArray.length <= 1) return;
    let intervalId: NodeJS.Timeout | null = null;
    const startAutoplay = () => {
      stopAutoplay();
      intervalId = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % childrenArray.length);
      }, autoplayDelay);
    };
    const stopAutoplay = () => {
      if (intervalId) clearInterval(intervalId);
    };
    if ((!isHovering || !pauseOnHover) && !isDragging) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return stopAutoplay;
  }, [autoplay, autoplayDelay, childrenArray.length, isHovering, pauseOnHover, isDragging]);

  // Effect to scroll when currentIndex changes (triggered by controls/autoplay)
  useEffect(() => {
      if (!isDragging) {
          scrollToIndex(currentIndex);
      }
  }, [currentIndex, scrollToIndex, isDragging]);

  // --- Handlers ---
  const handlePrev = () => {
    const newIndex = loop ? (currentIndex - 1 + childrenArray.length) % childrenArray.length : Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
  };
  const handleNext = () => {
    const newIndex = loop ? (currentIndex + 1) % childrenArray.length : Math.min(childrenArray.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
  };
  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };
  const handleMouseEnter = () => {
    if (pauseOnHover) setIsHovering(true);
  };
  const handleMouseLeave = () => {
    if (pauseOnHover) setIsHovering(false);
  };

  // Determine glow color
  const finalGlowColor = glowColor || (theme?.theme?.colors?.primary ?? '#6366F1');

  return (
    <CarouselContainer
      ref={ref}
      className={className}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      $glassVariant={glass ? 'frosted' : undefined}
      $borderRadius={rounded ? '8px' : '0px'}
      $blurStrength={"standard"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...rest}
    >
      <CarouselInner
        ref={innerRef}
        style={{ transform: `translateX(${position.x}px)`, cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {childrenArray.map((child, index) => (
            <CarouselItem
                key={index}
                ref={setItemRef(index)}
                $width={itemWidth}
                $fullHeight={height === 'auto' ? false : true}
                $itemGap={itemGap}
            >
                {child}
            </CarouselItem>
        ))}
      </CarouselInner>

      {showControls && childrenArray.length > 1 && (
        <>
          <CarouselNavigation
            currentSlide={currentIndex}
            totalSlides={childrenArray.length}
            infinite={loop}
            onPrevClick={handlePrev}
            onNextClick={handleNext}
            color={finalGlowColor}
            glassVariant={glass ? 'frosted' : undefined}
            showArrows={true}
          />
          {showIndicators && (
            <CarouselIndicators
              totalSlides={childrenArray.length}
              activeSlide={currentIndex}
              onChange={handleIndicatorClick}
              indicatorType="dots"
              color={finalGlowColor}
              position="bottom"
            />
          )}
          {autoplay && (
              <PlayPauseControl
                isPlaying={!isHovering || !pauseOnHover && !isDragging}
                onToggle={() => {}}
                position="bottom-right"
                color={finalGlowColor}
                glassVariant={glass ? 'frosted' : undefined}
                show={true} 
              />
          )}
        </>
      )}
    </CarouselContainer>
  );
});

GlassCarousel.displayName = 'GlassCarousel';

export default GlassCarousel;