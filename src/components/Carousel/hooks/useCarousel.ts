import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useInertialMovement2D, UseInertialMovement2DResult } from '../../../animations/physics/useInertialMovement2D';
import { useAccessibilitySettings } from '../../../hooks/useAccessibilitySettings';
import { Vector2D as ExternalVector2D, SnapPointConfig, GlassCarouselProps } from '../types';
import { 
  calculateTargetPosition, 
  normalizeIndex,
  generateSlideSnapPoints,
} from '../utils/carouselUtils';
import { useAnimationContext } from '../../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../../animations/physics/springPhysics';
import { InertialConfig, InertialPresets } from '../../../animations/physics/inertialMovement';

// Define a local interface for the hook's return type to avoid implicit export
interface UseCarouselResult {
  containerRef: React.RefObject<HTMLDivElement>;
  trackRef: React.RefObject<HTMLDivElement>;
  slideRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  activeSlide: number;
  isGrabbing: boolean;
  isPlaying: boolean;
  slideWidth: number;
  activeSlideHeight: number | null;
  trackPosition: { x: number; y: number }; // Use a locally compatible structure
  goToSlide: (index: number, animate?: boolean) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  toggleAutoplay: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Custom hook for carousel functionality using useInertialMovement2D
 */
export const useCarousel = ({
  items,
  activeSlide: controlledActiveSlide,
  onChange,
  autoPlay = false,
  autoPlayInterval = 5000,
  pauseOnHover = true,
  pauseOnFocus = true,
  infinite = false,
  gesturesEnabled = true,
  spacing = 16,
  visibleSlides = 1,
  snapPoints: customSnapPoints,
  resistanceFactor = 0.5,
  adaptiveHeight = false,
  keyboardNavigation = true,
  animationConfig: propAnimationConfig,
  disableAnimation: propDisableAnimation,
}: GlassCarouselProps): UseCarouselResult => {
  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slideHeightRefs = useRef<(number | null)[]>([]);
  const dragStartPosRef = useRef<ExternalVector2D | null>(null);

  // --- State ---
  const [activeSlideHeight, setActiveSlideHeight] = useState<number | null>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [internalActiveSlide, setInternalActiveSlide] = useState(controlledActiveSlide ?? 0);
  const activeSlide = controlledActiveSlide !== undefined ? controlledActiveSlide : internalActiveSlide;
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);
  const [snapPointsArray, setSnapPointsArray] = useState<SnapPointConfig[]>([]);

  // --- Context & Settings ---
  const { isReducedMotion: prefersReducedMotion } = useAccessibilitySettings();
  const { defaultSpring } = useAnimationContext();

  // --- Physics Setup ---
  const finalInertiaConfig = useMemo<Partial<InertialConfig> | keyof typeof InertialPresets>(() => {
    if (propAnimationConfig) {
        // Ensure type compatibility before casting
        if (typeof propAnimationConfig === 'string' || typeof propAnimationConfig === 'object') {
            return propAnimationConfig as Partial<InertialConfig> | keyof typeof InertialPresets;
        }
    }
    return 'DEFAULT'; // Default inertial preset
  }, [propAnimationConfig, defaultSpring]);

  const {
      position: trackPositionInternal,
      setPosition: setTrackPositionInternal,
      movement
  } = useInertialMovement2D({
      initialPosition: { x: 0, y: 0 },
      config: finalInertiaConfig,
  });

  // --- Navigation Callbacks ---
  const setTrackPosition = setTrackPositionInternal;

  const goToSlide = useCallback((index: number, animate = true) => {
    const normalizedIndex = normalizeIndex(index, items.length, infinite);
    const targetPosition = calculateTargetPosition(
      normalizedIndex,
      slideWidth,
      spacing,
      infinite,
      items.length
    );

    if (controlledActiveSlide === undefined) {
        setInternalActiveSlide(normalizedIndex);
    }

    if (onChange && normalizedIndex !== activeSlide) {
      onChange(normalizedIndex);
    }

    setHasUserInteraction(true);

    const shouldAnimate = animate && !(propDisableAnimation ?? prefersReducedMotion);
    setTrackPosition({ x: targetPosition, y: 0 }, shouldAnimate);

  }, [
      items.length, infinite, slideWidth, spacing,
      controlledActiveSlide, onChange, activeSlide,
      propDisableAnimation, prefersReducedMotion, setTrackPosition
  ]);

  const nextSlide = useCallback(() => {
    goToSlide(activeSlide + 1, true);
  }, [activeSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(activeSlide - 1, true);
  }, [activeSlide, goToSlide]);

  // --- Effects ---
  useEffect(() => {
    if (items.length && slideWidth) {
      const width = items.length * slideWidth + (items.length - 1) * spacing;
      setContentWidth(width);
    }
  }, [items.length, slideWidth, spacing]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newContainerWidth = containerRef.current.offsetWidth;
        setContainerWidth(newContainerWidth);

        const calculatedSlideWidth = (newContainerWidth - (spacing * (visibleSlides - 1))) / visibleSlides;
        setSlideWidth(calculatedSlideWidth);

        const initialPosition = calculateTargetPosition(
          activeSlide, calculatedSlideWidth, spacing, infinite, items.length
        );
        setTrackPosition({ x: initialPosition, y: 0 }, false);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [activeSlide, visibleSlides, spacing, infinite, items.length, setTrackPosition]);

  useEffect(() => {
    if (!adaptiveHeight) return;
    const updateSlideHeight = () => {
      if (trackRef.current) {
        const slideElements = Array.from(trackRef.current.children);
        if (slideElements.length > activeSlide) {
          const activeElement = slideElements[activeSlide] as HTMLElement;
          if (activeElement) {
            const height = activeElement.offsetHeight;
            setActiveSlideHeight(height);
            if (containerRef.current) {
               containerRef.current.style.height = `${height}px`;
            }
          }
        }
      }
    };
    updateSlideHeight();
    const timer = setTimeout(updateSlideHeight, 150);
    return () => clearTimeout(timer);
  }, [activeSlide, adaptiveHeight, slideWidth]);

  useEffect(() => {
    if (slideWidth > 0) {
      const newSnapPoints = customSnapPoints ||
        generateSlideSnapPoints(items, slideWidth, spacing, 0.8);
      setSnapPointsArray(newSnapPoints);
    }
  }, [slideWidth, spacing, items, customSnapPoints]);

  useEffect(() => {
    if (controlledActiveSlide !== undefined && controlledActiveSlide !== activeSlide) {
      goToSlide(controlledActiveSlide, !(propDisableAnimation ?? prefersReducedMotion));
    }
  }, [controlledActiveSlide]);

  useEffect(() => {
    if (!isPlaying || hasUserInteraction || isHovered || isFocused) return;
    const intervalId = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(intervalId);
  }, [isPlaying, hasUserInteraction, isHovered, isFocused, autoPlayInterval, nextSlide]);

  useEffect(() => { setIsPlaying(autoPlay); }, [autoPlay]);

  useEffect(() => {
    if (hasUserInteraction) {
      const timer = setTimeout(() => setHasUserInteraction(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasUserInteraction]);

  // --- Interaction Handlers ---
  const handleInteractionStart = useCallback((clientX: number, clientY: number) => {
    if (!gesturesEnabled || !containerRef.current) return;
    dragStartPosRef.current = { x: clientX, y: clientY };
    setIsGrabbing(true);
    setHasUserInteraction(true);
  }, [gesturesEnabled]);

  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStartPosRef.current || !containerRef.current) return;
    const currentX = clientX;
    const deltaX = currentX - dragStartPosRef.current.x;
    const startTrackX = trackPositionInternal.x;
    let newTargetX = startTrackX + deltaX;

    if (!infinite) {
        const minX = -(contentWidth - containerWidth);
        const maxX = 0;
        if (newTargetX > maxX) newTargetX = maxX + (newTargetX - maxX) * resistanceFactor;
        if (newTargetX < minX) newTargetX = minX + (newTargetX - minX) * resistanceFactor;
    }

    setTrackPosition({ x: newTargetX, y: 0 }, false);

    dragStartPosRef.current = { x: clientX, y: clientY };

  }, [containerWidth, contentWidth, infinite, resistanceFactor, setTrackPosition, trackPositionInternal.x]);

  const handleInteractionEnd = useCallback(() => {
    if (!dragStartPosRef.current) return;
    setIsGrabbing(false);
    dragStartPosRef.current = null;

    const finalX = trackPositionInternal.x;
    const closestIndex = Math.round(-finalX / (slideWidth + spacing));

    goToSlide(closestIndex, true);

  }, [goToSlide, slideWidth, spacing, trackPositionInternal.x]);

  // --- Mouse/Touch Event Listeners ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
      handleInteractionStart(e.clientX, e.clientY);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  }, [handleInteractionStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
      handleInteractionMove(e.clientX, e.clientY);
  }, [handleInteractionMove]);

  const handleMouseUp = useCallback(() => {
      handleInteractionEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
  }, [handleInteractionEnd]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
      handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
  }, [handleInteractionStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
      if (dragStartPosRef.current) {
          const touch = e.touches[0];
          const start = dragStartPosRef.current;
          e.preventDefault();
      }
      handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleInteractionMove]);

  const handleTouchEnd = useCallback(() => {
      handleInteractionEnd();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
  }, [handleInteractionEnd]);

  // --- Other Handlers ---
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleFocus = useCallback(() => { setIsFocused(true); setHasUserInteraction(true); }, []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const toggleAutoplay = useCallback(() => {
      setIsPlaying(prev => !prev);
      setHasUserInteraction(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!keyboardNavigation) return;
      switch (e.key) {
          case 'ArrowLeft':
              e.preventDefault(); prevSlide(); break;
          case 'ArrowRight':
              e.preventDefault(); nextSlide(); break;
          case 'Home':
              e.preventDefault(); goToSlide(0, true); break;
          case 'End':
              e.preventDefault(); goToSlide(items.length - 1, true); break;
      }
  }, [keyboardNavigation, nextSlide, prevSlide, goToSlide, items.length]);

  return {
    containerRef,
    trackRef,
    slideRefs,
    activeSlide,
    isGrabbing,
    isPlaying,
    slideWidth,
    activeSlideHeight,
    trackPosition: trackPositionInternal,
    goToSlide,
    nextSlide,
    prevSlide,
    toggleAutoplay,
    handleMouseDown,
    handleTouchStart,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
    handleKeyDown,
  };
};