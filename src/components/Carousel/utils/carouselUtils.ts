/**
 * Carousel utility functions
 */
import { Vector2D, SnapPointConfig, CarouselItem } from '../types';

/**
 * Calculate the target position for a given slide index
 */
export const calculateTargetPosition = (
  slideIndex: number,
  slideWidth: number,
  spacing: number,
  infinite: boolean,
  totalSlides: number
): number => {
  // Calculate base position
  const position = -(slideIndex * (slideWidth + spacing));
  
  // If not infinite, return the position as is
  if (!infinite) {
    return position;
  }
  
  // If infinite, calculate the modulo position
  const modPosition = position % (totalSlides * (slideWidth + spacing));
  return modPosition;
};

/**
 * Find the closest snap point to the current position
 */
export const findClosestSnapPoint = (
  currentPosition: number,
  snapPoints: SnapPointConfig[],
  containerWidth: number
): SnapPointConfig | null => {
  if (!snapPoints || snapPoints.length === 0) {
    return null;
  }
  
  let closestPoint = snapPoints[0];
  let closestDistance = Infinity;
  
  for (const point of snapPoints) {
    // Skip disabled snap points
    if (point.enabled === false) {
      continue;
    }
    
    // Calculate the actual position (convert ratio to pixels if needed)
    const actualPosition = point.isRatio 
      ? point.position * containerWidth 
      : point.position;
    
    // Calculate the distance to this snap point
    const distance = Math.abs(currentPosition - actualPosition);
    
    // Update if this point is closer
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPoint = point;
    }
  }
  
  return closestPoint;
};

/**
 * Calculate the resistance factor based on position, velocity and settings
 */
export const calculateResistance = (
  position: Vector2D,
  velocity: Vector2D,
  containerWidth: number,
  contentWidth: number,
  resistanceConfig: {
    edge?: number;
    nearSnap?: number;
    highVelocity?: number;
    velocityThreshold?: number;
  } = {}
): number => {
  // Default values
  const {
    edge = 0.8,
    nearSnap = 0.5,
    highVelocity = 0.3,
    velocityThreshold = 2
  } = resistanceConfig;
  
  // Check if we're at the edge
  const minPosition = containerWidth - contentWidth;
  const isAtStart = position.x >= 0;
  const isAtEnd = position.x <= minPosition;
  
  // Check if we have high velocity
  const hasHighVelocity = Math.abs(velocity.x) > velocityThreshold;
  
  // Calculate base resistance
  let resistance = 0.5; // Default mid-level resistance
  
  // Apply resistance based on conditions
  if (isAtStart || isAtEnd) {
    // Edge resistance
    resistance = edge;
  } else if (hasHighVelocity) {
    // High velocity resistance
    resistance = highVelocity;
  } else {
    // Near snap point resistance
    resistance = nearSnap;
  }
  
  return resistance;
};

/**
 * Generate slide snap points based on item count and dimensions
 */
export const generateSlideSnapPoints = (
  items: CarouselItem[],
  slideWidth: number,
  spacing: number,
  snapStrength = 0.8
): SnapPointConfig[] => {
  return items.map((_, index) => ({
    position: -(index * (slideWidth + spacing)),
    isRatio: false,
    strength: snapStrength,
    threshold: slideWidth * 0.3,
    enabled: true,
    name: `slide-${index}`
  }));
};

/**
 * Normalize index to handle infinite scrolling
 */
export const normalizeIndex = (
  index: number,
  totalItems: number,
  infinite: boolean
): number => {
  if (!infinite) {
    // Clamp to valid range for non-infinite carousels
    return Math.max(0, Math.min(index, totalItems - 1));
  }
  
  // Handle wrapping for infinite carousels
  return ((index % totalItems) + totalItems) % totalItems;
};

/**
 * Check if a slide is visible based on the current position
 */
export const isSlideVisible = (
  slideIndex: number,
  currentIndex: number,
  visibleSlides: number
): boolean => {
  const min = Math.floor(currentIndex - visibleSlides / 2);
  const max = Math.ceil(currentIndex + visibleSlides / 2);
  return slideIndex >= min && slideIndex <= max;
};

/**
 * Calculate dimensions for the carousel based on aspect ratio
 */
export const calculateDimensions = (
  width: string | number | undefined,
  height: string | number | undefined,
  aspectRatio: number | { width: number; height: number } | undefined,
  containerElement: HTMLElement | null
): { width: string; height: string } => {
  // Default dimensions
  const calculatedWidth = width 
    ? (typeof width === 'number' ? `${width}px` : width) 
    : '100%';
  let calculatedHeight = height 
    ? (typeof height === 'number' ? `${height}px` : height) 
    : '400px';
  
  // No aspect ratio, return as is
  if (!aspectRatio) {
    return { width: calculatedWidth, height: calculatedHeight };
  }
  
  // Get container width if needed
  const containerWidth = containerElement?.offsetWidth || 0;
  
  // Calculate based on aspect ratio
  if (typeof aspectRatio === 'number') {
    // Single number aspect ratio (width / height)
    if (containerWidth && calculatedWidth === '100%') {
      calculatedHeight = `${containerWidth / aspectRatio}px`;
    }
  } else {
    // Object with width and height properties
    const ratio = aspectRatio.width / aspectRatio.height;
    if (containerWidth && calculatedWidth === '100%') {
      calculatedHeight = `${containerWidth / ratio}px`;
    }
  }
  
  return { width: calculatedWidth, height: calculatedHeight };
};

/**
 * Calculate animation properties for spring animation
 */
export const calculateSpringConfig = (
  physics?: {
    tension?: number;
    friction?: number;
    mass?: number;
  }
) => {
  const defaultConfig = {
    tension: 180,
    friction: 20,
    mass: 1
  };
  
  if (!physics) {
    return defaultConfig;
  }
  
  return {
    tension: physics.tension ?? defaultConfig.tension,
    friction: physics.friction ?? defaultConfig.friction,
    mass: physics.mass ?? defaultConfig.mass
  };
};

/**
 * Get responsive configuration based on container width
 */
export const getResponsiveConfig = (
  containerWidth: number,
  responsive: any,
  defaultValue: any
) => {
  if (!responsive) {
    return defaultValue;
  }
  
  // Small screens
  if (containerWidth < 768 && responsive.small) {
    return responsive.small;
  }
  
  // Medium screens
  if (containerWidth < 1200 && responsive.medium) {
    return responsive.medium;
  }
  
  // Large screens
  if (responsive.large) {
    return responsive.large;
  }
  
  return defaultValue;
};