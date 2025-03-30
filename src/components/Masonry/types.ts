/**
 * Types for the GlassMasonry component
 */
import React from 'react';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { AnimationProps } from '../../animations/types';

/**
 * Item sizing options to determine how items flow in the masonry layout
 */
export type ItemSizeType = 
  | 'auto'      // Size determined by the item's own content (default)
  | 'uniform'   // All items are same size
  | 'variable'  // Custom size for each item defined by data
  | 'responsive'; // Item size changes based on available space

/**
 * Placement algorithm for masonry layout
 */
export type PlacementAlgorithm = 
  | 'columns'   // Items fill columns from top to bottom
  | 'rows'      // Items fill rows from left to right
  | 'balanced'  // Attempts to maintain equal height columns
  | 'optimal';  // Uses bin-packing algorithm for optimal space usage

/**
 * Direction of the masonry layout
 */
export type LayoutDirection = 'vertical' | 'horizontal';

/**
 * Animation type for item placement and transitions
 */
export type ItemAnimationType = 
  | 'spring'    // Physics-based spring animation
  | 'fade'      // Simple fade-in animation
  | 'slide'     // Slide-in animation
  | 'scale'     // Scale-in animation
  | 'none';     // No animation

/**
 * Trigger point for loading more content
 */
export type LoadMoreTrigger = 
  | 'scroll'    // Load more on scroll to bottom/end
  | 'button'    // Load more on button click
  | 'visibility'; // Load more when last item becomes visible

/**
 * Origin point for animations
 */
export type AnimationOrigin = 
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'center';

/**
 * Configuration for physics-based animations
 */
export interface PhysicsConfig {
  /** Spring stiffness/tension - higher values create more rigid/snappy animations */
  tension?: number;
  
  /** Friction coefficient - higher values create more damping */
  friction?: number;
  
  /** Mass of the object - higher values create more inertia */
  mass?: number;
  
  /** Animation preset name */
  preset?: 'gentle' | 'default' | 'snappy' | 'bouncy';
  
  /** Stagger delay between items in ms */
  staggerDelay?: number;
  
  /** Whether to apply random variation to animation parameters */
  randomizeParams?: boolean;
}

/**
 * Item in the masonry layout
 */
export interface MasonryItem {
  /** Unique identifier for the item */
  id: string | number;
  
  /** Element height (for variable sizing) */
  height?: number;
  
  /** Element width (for variable sizing) */
  width?: number;
  
  /** Number of columns this item should span */
  columnSpan?: number;
  
  /** Number of rows this item should span */
  rowSpan?: number;
  
  /** Whether to prioritize the placement of this item */
  priority?: number;
  
  /** Custom data associated with the item */
  data?: any;
}

/**
 * Props for the GlassMasonry component
 */
export interface MasonryProps extends AnimationProps {
  /** Array of items to display in the masonry layout */
  items: MasonryItem[];
  
  /** Child render function to render each item */
  children: (item: MasonryItem, index: number) => React.ReactNode;
  
  /** Number of columns (for columns layout) or rows (for rows layout) */
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  
  /** Gap between items (can be specified for x and y separately) */
  gap?: number | string | { x?: number | string; y?: number | string };
  
  /** Layout placement algorithm */
  placementAlgorithm?: PlacementAlgorithm;
  
  /** Direction of the layout flow */
  direction?: LayoutDirection;
  
  /** Type of sizing for items */
  itemSizing?: ItemSizeType;
  
  /** Type of animation for items */
  itemAnimation?: ItemAnimationType;
  
  /** Origin point for animations */
  animationOrigin?: AnimationOrigin;
  
  /** Configuration for physics-based animations */
  physics?: PhysicsConfig;
  
  /** Whether to enable lazy loading of images */
  lazyLoad?: boolean;
  
  /** Whether to enable virtualization for large lists */
  virtualized?: boolean;
  
  /** Number of items to render ahead/behind the visible area (for virtualization) */
  overscanCount?: number;
  
  /** Whether to filter out empty spaces in the layout */
  fillEmptySpaces?: boolean;
  
  /** Trigger for loading more content */
  loadMoreTrigger?: LoadMoreTrigger;
  
  /** Callback when more content should be loaded */
  onLoadMore?: () => void;
  
  /** Whether more content is available */
  hasMore?: boolean;
  
  /** Whether content is currently loading */
  loading?: boolean;
  
  /** Component to display while loading */
  loadingComponent?: React.ReactNode;
  
  /** Whether to enable dynamic layout recalculation on window resize */
  responsiveLayout?: boolean;
  
  /** Threshold for recalculating layout (prevents excessive calculations) */
  resizeThreshold?: number;
  
  /** Event callback when layout is calculated */
  onLayoutComplete?: (layout: any) => void;
  
  /** CSS class name */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
  
  /** Glass variant style */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  
  /** Blur strength for glass effect */
  blurStrength?: 'light' | 'standard' | 'strong';
  
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  
  /** Optional ID for the container */
  id?: string;
  
  /** Whether to use glass styling for items */
  glassItems?: boolean;
  
  /** Whether to enable drag to reorder items */
  dragToReorder?: boolean;
  
  /** Callback when item order changes */
  onOrderChange?: (newItems: MasonryItem[]) => void;
  
  /** Whether to display sorted by height or by input order */
  respectOrder?: boolean;
  
  /** Custom CSS class for each item */
  itemClassName?: string;
  
  /** Width of the masonry layout (defaults to 100%) */
  width?: string | number;
  
  /** Height of the masonry layout (if fixed height is desired) */
  height?: string | number;
  
  /** Whether to use a container with overflow for scrolling */
  useScroller?: boolean;
  
  /** Whether to show animations on mount */
  animateOnMount?: boolean;
  
  /** Whether to show animations on item additions/removals */
  animateOnChange?: boolean;
  
  /** Whether to enable full-screen image preview on item click */
  enableImagePreview?: boolean;
  
  /** Custom item renderer for the preview mode */
  previewRenderer?: (item: MasonryItem) => React.ReactNode;
  
  /** Whether to apply glass effect to the container */
  glassContainer?: boolean;
  
  /** Callback when an item is clicked */
  onItemClick?: (item: MasonryItem) => void;
}