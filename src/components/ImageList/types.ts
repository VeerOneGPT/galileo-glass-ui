/**
 * ImageList Component Types
 *
 * Type definitions for the ImageList components.
 */

import React from 'react';

/**
 * Props for the ImageList component
 */
export interface ImageListProps {
  /** The content of the component (ImageListItem components) */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** The number of columns in the grid */
  cols?: number;
  
  /** The gap between the items in the grid (in px) */
  gap?: number;
  
  /** The height of the grid rows (in px) */
  rowHeight?: number | 'auto';
  
  /** The variant to use, 'standard', 'quilted', 'masonry' or 'woven' */
  variant?: 'standard' | 'quilted' | 'masonry' | 'woven';
  
  /** If true, applies glass morphism effect */
  glass?: boolean;
  
  /** If true, the component will have rounded corners */
  rounded?: boolean;
  
  /** If true, the grid items will be of different sizes */
  variableSize?: boolean;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the ImageListItem component
 */
export interface ImageListItemProps {
  /** The content of the component (usually img or picture tag) */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** Number of grid columns the item should span */
  cols?: number;
  
  /** Number of grid rows the item should span */
  rows?: number;
  
  /** If true, applies glass morphism effect */
  glass?: boolean;
  
  /** If true, the item will have overlay on hover */
  hoverOverlay?: boolean;
  
  /** If true, the item will have box shadow */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
  /** If true, the item will have rounded corners */
  rounded?: boolean;
  
  /** Image alt text (passed to the img element) */
  alt?: string;
  
  /** Image source (passed to the img element) */
  src?: string;
  
  /** Image source set (passed to the img element) */
  srcSet?: string;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the ImageListItemBar component
 */
export interface ImageListItemBarProps {
  /** The content of the component (icon, etc.) */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** The title to display */
  title?: React.ReactNode;
  
  /** The subtitle to display */
  subtitle?: React.ReactNode;
  
  /** The position of the title bar */
  position?: 'top' | 'bottom' | 'below';
  
  /** If true, applies glass morphism effect */
  glass?: boolean;
  
  /** An IconButton that will be displayed */
  actionIcon?: React.ReactNode;
  
  /** If true, the bar will only appear on hover */
  actionPosition?: 'left' | 'right';
  
  /** If true, the bar will only appear on hover */
  showOnHover?: boolean;
  
  /** Additional props */
  [key: string]: any;
}