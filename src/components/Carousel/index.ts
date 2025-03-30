/**
 * Export Carousel components
 */

// Main component
export { default } from './GlassCarousel';
export { default as GlassCarousel } from './GlassCarousel';

// Types
export * from './types';

// Subcomponents - export these for advanced use cases
export { default as CarouselNavigation } from './components/CarouselNavigation';
export { default as CarouselIndicators } from './components/CarouselIndicators';
export { default as CarouselSlideItem } from './components/CarouselSlideItem';
export { default as PlayPauseControl } from './components/PlayPauseControl';

// Hooks - export for custom carousel implementations
export { useCarousel } from './hooks/useCarousel';

// Utility functions
export * from './utils/carouselUtils';