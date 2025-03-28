/**
 * GlassMasonry Component
 * 
 * A glass-styled masonry layout component with physics-based animations
 * for smooth item positioning and transitions.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { ResizeObserver } from '@juggle/resize-observer';

// Physics-related imports
import { useSpring } from '../../animations/physics/useSpring';
import { useInertialMovement } from '../../animations/physics/useInertialMovement';
import { SpringPresets } from '../../animations/physics/springPhysics';

// Core styling imports
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

// Hooks and utilities
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Types
import { 
  MasonryProps, 
  MasonryItem,
  PlacementAlgorithm,
  ItemAnimationType,
  AnimationOrigin,
  PhysicsConfig
} from './types';

// Animation keyframes
const fadeInKeyframes = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleInKeyframes = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const slideInKeyframes = (origin: AnimationOrigin) => {
  switch (origin) {
    case 'top':
      return keyframes`
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      `;
    case 'bottom':
      return keyframes`
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      `;
    case 'left':
      return keyframes`
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      `;
    case 'right':
      return keyframes`
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      `;
    default:
      return keyframes`
        from { opacity: 0; }
        to { opacity: 1; }
      `;
  }
};

// Styled components
const MasonryContainer = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $useScroller: boolean;
  $isGlassContainer: boolean;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
  $color?: string;
}>`
  position: relative;
  width: ${props => props.$width 
    ? (typeof props.$width === 'number' ? `${props.$width}px` : props.$width) 
    : '100%'
  };
  
  ${props => props.$height && css`
    height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};
  `}
  
  ${props => props.$useScroller && css`
    overflow-y: auto;
    overflow-x: hidden;
  `}
  
  /* Glass container styling if enabled */
  ${props => props.$isGlassContainer && props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 1,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent)` : undefined,
      themeContext: createThemeContext(props.theme),
    })}
    
    border-radius: 8px;
    padding: 10px;
  `}
`;

const MasonryLayout = styled.div<{
  $columns: number;
  $gapX: string;
  $gapY: string;
  $direction: 'vertical' | 'horizontal';
}>`
  display: grid;
  grid-template-columns: ${props => props.$direction === 'vertical' 
    ? `repeat(${props.$columns}, 1fr)` 
    : '1fr'
  };
  grid-template-rows: ${props => props.$direction === 'horizontal' 
    ? `repeat(${props.$columns}, auto)` 
    : 'auto'
  };
  grid-gap: ${props => `${props.$gapY} ${props.$gapX}`};
  grid-auto-flow: ${props => props.$direction === 'vertical' ? 'row' : 'column'};
`;

const MasonryItemContainer = styled.div<{
  $x: number;
  $y: number;
  $width: number;
  $height: number;
  $columnSpan: number;
  $rowSpan: number;
  $isGlassItem: boolean;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
  $color?: string;
  $animation: ItemAnimationType;
  $origin: AnimationOrigin;
  $delay: number;
  $reducedMotion: boolean;
  $isDragging: boolean;
  $animateOnMount: boolean;
  $translateX: number;
  $translateY: number;
  $scale: number;
  $opacity: number;
  $rotation: number;
}>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  grid-column: ${props => props.$columnSpan > 1 ? `span ${props.$columnSpan}` : 'auto'};
  grid-row: ${props => props.$rowSpan > 1 ? `span ${props.$rowSpan}` : 'auto'};
  transform-origin: center;
  transition: ${props => props.$reducedMotion ? 'none' : 'transform 0.05s linear'};
  will-change: transform;
  z-index: ${props => props.$isDragging ? 10 : 1};
  box-sizing: border-box;
  
  /* Dragging state */
  ${props => props.$isDragging && css`
    user-select: none;
    cursor: grabbing;
  `}
  
  /* Apply glass styling if enabled */
  ${props => props.$isGlassItem && props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 2,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent)` : undefined,
      themeContext: createThemeContext(props.theme),
    })}
    
    border-radius: 8px;
    overflow: hidden;
  `}
  
  /* Apply physics-based transform */
  transform: translate(${props => props.$translateX}px, ${props => props.$translateY}px) 
             scale(${props => props.$scale}) 
             rotate(${props => props.$rotation}deg);
  opacity: ${props => props.$opacity};
  
  /* Animation types */
  ${props => {
    if (props.$reducedMotion || !props.$animateOnMount) return '';
    
    let animation;
    switch (props.$animation) {
      case 'fade':
        animation = css`animation: ${fadeInKeyframes} 0.5s ease-out forwards;`;
        break;
      case 'scale':
        animation = css`animation: ${scaleInKeyframes} 0.5s ease-out forwards;`;
        break;
      case 'slide':
        animation = css`animation: ${slideInKeyframes(props.$origin)} 0.5s ease-out forwards;`;
        break;
      case 'spring':
        // Spring animation is handled by the physics hooks
        return '';
      default:
        return '';
    }
    
    return css`
      ${animation}
      animation-delay: ${props.$delay}ms;
      animation-fill-mode: backwards;
    `;
  }}
`;

const LoadMoreButton = styled.button<{
  $color?: string;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
}>`
  padding: 8px 16px;
  margin: 16px auto;
  display: block;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  ${props => props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 2,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent)` : undefined,
      themeContext: createThemeContext(props.theme),
    })}
    
    color: rgba(255, 255, 255, 0.9);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  
  .spinner {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: rgba(255, 255, 255, 0.7);
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Intersection Observer options
const observerOptions = {
  root: null,
  rootMargin: '100px',
  threshold: 0.1
};

/**
 * Generate staggered animation delay based on item position
 */
const getStaggeredDelay = (
  itemIndex: number,
  columnIndex: number,
  columnCount: number,
  staggerDelay = 50
): number => {
  // Different staggering patterns
  // For vertical masonry, stagger by column and then by item index
  return (columnIndex * staggerDelay) + (Math.floor(itemIndex / columnCount) * staggerDelay);
};

/**
 * Add small random variation to physics parameters for natural feel
 */
const randomizePhysicsParams = (value: number, intensity = 0.2): number => {
  const variation = (Math.random() - 0.5) * 2 * intensity;
  return value * (1 + variation);
};

// Custom hook to manage 2D position with inertia
interface Position2D {
  x: number;
  y: number;
}

interface UsePositionInertiaResult {
  position: Position2D;
  setPosition: (position: Position2D, animate?: boolean) => void;
}

const usePositionInertia = (
  initialPosition: Position2D = { x: 0, y: 0 },
  config: any = {}
): UsePositionInertiaResult => {
  const { position: xPosition, setPosition: setXPosition } = useInertialMovement({
    initialPosition: initialPosition.x,
    ...config
  });
  
  const { position: yPosition, setPosition: setYPosition } = useInertialMovement({
    initialPosition: initialPosition.y,
    ...config
  });
  
  const position = { x: xPosition, y: yPosition };
  
  const setPosition = (newPosition: Position2D, animate = true) => {
    setXPosition(newPosition.x, animate ? undefined : 0);
    setYPosition(newPosition.y, animate ? undefined : 0);
  };
  
  return { position, setPosition };
};

/**
 * GlassMasonry Component
 */
export const GlassMasonry: React.FC<MasonryProps> = ({
  // Core props
  items = [],
  children,
  columns = 3,
  gap = 16,
  
  // Layout props
  placementAlgorithm = 'columns',
  direction = 'vertical',
  itemSizing = 'auto',
  
  // Animation props
  itemAnimation = 'spring',
  animationOrigin = 'bottom',
  physics = {
    preset: 'default',
    staggerDelay: 50,
    randomizeParams: false
  },
  
  // Loading props
  lazyLoad = true,
  virtualized = false,
  overscanCount = 5,
  loadMoreTrigger = 'scroll',
  onLoadMore,
  hasMore = false,
  loading = false,
  loadingComponent,
  
  // Layout props
  fillEmptySpaces = false,
  responsiveLayout = true,
  resizeThreshold = 100,
  onLayoutComplete,
  respectOrder = true,
  
  // Styling props
  className,
  style,
  itemClassName,
  width,
  height,
  glassVariant = 'frosted',
  blurStrength = 'standard',
  color = 'primary',
  glassItems = true,
  glassContainer = false,
  
  // Interaction props
  dragToReorder = false,
  onOrderChange,
  useScroller = false,
  animateOnMount = true,
  animateOnChange = true,
  enableImagePreview = false,
  previewRenderer,
  id
}) => {
  // State for masonry layout
  const [layout, setLayout] = useState<{
    items: Array<{
      item: MasonryItem;
      x: number;
      y: number;
      width: number;
      height: number;
      columnIndex: number;
    }>;
    containerHeight: number;
    columnHeights: number[];
  }>({
    items: [],
    containerHeight: 0,
    columnHeights: []
  });
  
  const [visibleItems, setVisibleItems] = useState<Set<string | number>>(new Set());
  const [previewItem, setPreviewItem] = useState<MasonryItem | null>(null);
  const [isDragging, setIsDragging] = useState<string | number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number, y: number } | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastResizeTime = useRef<number>(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const itemSizeCache = useRef<Map<string | number, { width: number, height: number }>>(new Map());
  
  // Accessibility
  const reducedMotion = useReducedMotion();
  
  // Determine actual column count (handle responsive columns)
  const columnCount = useMemo(() => {
    if (typeof columns === 'number') {
      return columns;
    }
    
    if (typeof window === 'undefined') {
      return columns.md || 3; // Default for SSR
    }
    
    const width = window.innerWidth;
    
    if (width < 600 && columns.xs !== undefined) {
      return columns.xs;
    }
    if (width < 960 && columns.sm !== undefined) {
      return columns.sm;
    }
    if (width < 1280 && columns.md !== undefined) {
      return columns.md;
    }
    if (width < 1920 && columns.lg !== undefined) {
      return columns.lg;
    }
    if (columns.xl !== undefined) {
      return columns.xl;
    }
    
    return 3; // Default
  }, [columns, typeof window !== 'undefined' ? window.innerWidth : 0]);
  
  // Parse gap values
  const gapValues = useMemo(() => {
    if (typeof gap === 'number') {
      return { x: `${gap}px`, y: `${gap}px` };
    }
    if (typeof gap === 'string') {
      return { x: gap, y: gap };
    }
    return {
      x: typeof gap.x === 'number' ? `${gap.x}px` : gap.x || '16px',
      y: typeof gap.y === 'number' ? `${gap.y}px` : gap.y || '16px'
    };
  }, [gap]);
  
  // Parse numeric gap for calculations
  const numericGap = useMemo(() => {
    const parseGap = (g: string) => {
      const match = g.match(/^(\d+)(?:px|rem|em|%)?$/);
      return match ? parseInt(match[1], 10) : 16;
    };
    
    return {
      x: parseGap(gapValues.x),
      y: parseGap(gapValues.y)
    };
  }, [gapValues]);
  
  // Get physics configuration
  const springConfig = useMemo(() => {
    const baseConfig = physics.preset 
      ? SpringPresets[physics.preset.toUpperCase() as keyof typeof SpringPresets] 
      : {
          tension: physics.tension || 170,
          friction: physics.friction || 26,
          mass: physics.mass || 1
        };
    
    // If not randomizing params, just return the config
    if (!physics.randomizeParams) {
      return baseConfig;
    }
    
    // Add slight random variation for more natural feel
    return {
      tension: randomizePhysicsParams(baseConfig.tension),
      friction: randomizePhysicsParams(baseConfig.friction),
      mass: randomizePhysicsParams(baseConfig.mass)
    };
  }, [physics]);
  
  // Create a spring for each item (for physics animation)
  const [itemPhysicsProps, setItemPhysicsProps] = useState<Record<string | number, {
    translateX: number;
    translateY: number;
    scale: number;
    opacity: number;
    rotation: number;
  }>>({});
  
  // For drag to reorder functionality
  const { position: dragOffset, setPosition: setDragOffset } = usePositionInertia({ x: 0, y: 0 });
  
  /**
   * Calculate the masonry layout
   */
  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const colWidth = (containerWidth - (numericGap.x * (columnCount - 1))) / columnCount;
    
    // Initialize column heights
    const columnHeights = Array(columnCount).fill(0);
    const layoutItems: typeof layout.items = [];
    
    // Function to get the shortest column
    const getShortestColumnIndex = () => {
      return columnHeights.indexOf(Math.min(...columnHeights));
    };
    
    // Function to get the tallest column
    const getTallestColumnIndex = () => {
      return columnHeights.indexOf(Math.max(...columnHeights));
    };
    
    // Prepare items with dimensions
    const itemsWithDimensions = items.map((item) => {
      // Use cached dimensions if available
      if (itemSizeCache.current.has(item.id)) {
        const cached = itemSizeCache.current.get(item.id)!;
        return {
          ...item,
          calculatedWidth: cached.width,
          calculatedHeight: cached.height,
          aspectRatio: cached.width / cached.height
        };
      }
      
      // For auto sizing, we'll use default values until measured
      return {
        ...item,
        calculatedWidth: colWidth * (item.columnSpan || 1),
        calculatedHeight: 200,  // Default height, will be updated later
        aspectRatio: (item.width && item.height) ? item.width / item.height : 1
      };
    });
    
    // Sort items by priority if not respecting original order
    const sortedItems = [...itemsWithDimensions].sort((a, b) => {
      if (respectOrder) return 0;
      
      if (placementAlgorithm === 'optimal' && a.aspectRatio && b.aspectRatio) {
        // For optimal placement, sort by aspect ratio to help bin packing
        return b.aspectRatio - a.aspectRatio;
      }
      
      if (a.priority !== undefined && b.priority !== undefined) {
        return b.priority - a.priority;
      }
      
      if (a.columnSpan !== undefined && b.columnSpan !== undefined) {
        return b.columnSpan - a.columnSpan;
      }
      
      return 0;
    });
    
    // Place items according to the selected algorithm
    if (placementAlgorithm === 'columns') {
      // Standard column-based layout
      sortedItems.forEach((item) => {
        const columnSpan = item.columnSpan || 1;
        
        if (columnSpan > 1) {
          // For items spanning multiple columns, find the best placement
          let minHeight = Infinity;
          let startColumn = 0;
          
          // Find the starting column with minimum height
          for (let i = 0; i <= columnCount - columnSpan; i++) {
            const maxHeightInSpan = Math.max(...columnHeights.slice(i, i + columnSpan));
            if (maxHeightInSpan < minHeight) {
              minHeight = maxHeightInSpan;
              startColumn = i;
            }
          }
          
          const x = startColumn * (colWidth + numericGap.x);
          const y = minHeight;
          const width = (colWidth * columnSpan) + (numericGap.x * (columnSpan - 1));
          const height = item.height || (item.calculatedHeight || 200);
          
          // Update column heights
          for (let i = 0; i < columnSpan; i++) {
            columnHeights[startColumn + i] = y + height + numericGap.y;
          }
          
          layoutItems.push({
            item,
            x,
            y,
            width,
            height,
            columnIndex: startColumn
          });
        } else {
          // For single-column items, place in the shortest column
          const shortestColumn = getShortestColumnIndex();
          const x = shortestColumn * (colWidth + numericGap.x);
          const y = columnHeights[shortestColumn];
          const width = colWidth;
          const height = item.height || (item.calculatedHeight || 200);
          
          columnHeights[shortestColumn] += height + numericGap.y;
          
          layoutItems.push({
            item,
            x,
            y,
            width,
            height,
            columnIndex: shortestColumn
          });
        }
      });
    } else if (placementAlgorithm === 'balanced') {
      // Balanced layout tries to keep columns of even height
      
      // First pass: place items with column spans > 1
      const multiColItems = sortedItems.filter(item => (item.columnSpan || 1) > 1);
      const singleColItems = sortedItems.filter(item => (item.columnSpan || 1) === 1);
      
      // Place multi-column items first
      multiColItems.forEach((item) => {
        const columnSpan = item.columnSpan || 1;
        let minHeight = Infinity;
        let startColumn = 0;
        
        // Find the starting column with minimum height
        for (let i = 0; i <= columnCount - columnSpan; i++) {
          const maxHeightInSpan = Math.max(...columnHeights.slice(i, i + columnSpan));
          if (maxHeightInSpan < minHeight) {
            minHeight = maxHeightInSpan;
            startColumn = i;
          }
        }
        
        const x = startColumn * (colWidth + numericGap.x);
        const y = minHeight;
        const width = (colWidth * columnSpan) + (numericGap.x * (columnSpan - 1));
        const height = item.height || (item.calculatedHeight || 200);
        
        // Update column heights
        for (let i = 0; i < columnSpan; i++) {
          columnHeights[startColumn + i] = y + height + numericGap.y;
        }
        
        layoutItems.push({
          item,
          x,
          y,
          width,
          height,
          columnIndex: startColumn
        });
      });
      
      // Then place single-column items with balanced algorithm
      singleColItems.forEach((item) => {
        const shortestColumn = getShortestColumnIndex();
        const x = shortestColumn * (colWidth + numericGap.x);
        const y = columnHeights[shortestColumn];
        const width = colWidth;
        const height = item.height || (item.calculatedHeight || 200);
        
        columnHeights[shortestColumn] += height + numericGap.y;
        
        layoutItems.push({
          item,
          x,
          y,
          width,
          height,
          columnIndex: shortestColumn
        });
      });
    } else if (placementAlgorithm === 'optimal') {
      // Bin packing algorithm for optimal placement
      // Simplified version of full bin packing for this example
      
      // First pre-sort items by height (descending)
      const sortedByHeight = [...sortedItems].sort((a, b) => {
        const heightA = a.height || a.calculatedHeight || 200;
        const heightB = b.height || b.calculatedHeight || 200;
        return heightB - heightA;
      });
      
      sortedByHeight.forEach((item) => {
        const columnSpan = item.columnSpan || 1;
        
        if (columnSpan > 1) {
          // For multi-column items, find optimal placement
          let minHeight = Infinity;
          let bestColumn = 0;
          
          // Find the lowest vertical point to place the item
          for (let i = 0; i <= columnCount - columnSpan; i++) {
            const maxHeightInSpan = Math.max(...columnHeights.slice(i, i + columnSpan));
            if (maxHeightInSpan < minHeight) {
              minHeight = maxHeightInSpan;
              bestColumn = i;
            }
          }
          
          const x = bestColumn * (colWidth + numericGap.x);
          const y = minHeight;
          const width = (colWidth * columnSpan) + (numericGap.x * (columnSpan - 1));
          const height = item.height || (item.calculatedHeight || 200);
          
          // Update column heights
          for (let i = 0; i < columnSpan; i++) {
            columnHeights[bestColumn + i] = y + height + numericGap.y;
          }
          
          layoutItems.push({
            item,
            x,
            y,
            width,
            height,
            columnIndex: bestColumn
          });
        } else {
          // For single-column items, try to fill gaps
          let bestColumn = 0;
          let bestY = Infinity;
          
          // Find the optimal position
          for (let c = 0; c < columnCount; c++) {
            const y = columnHeights[c];
            if (y < bestY) {
              bestY = y;
              bestColumn = c;
            }
          }
          
          const x = bestColumn * (colWidth + numericGap.x);
          const y = bestY;
          const width = colWidth;
          const height = item.height || (item.calculatedHeight || 200);
          
          columnHeights[bestColumn] += height + numericGap.y;
          
          layoutItems.push({
            item,
            x,
            y,
            width,
            height,
            columnIndex: bestColumn
          });
        }
      });
    } else if (placementAlgorithm === 'rows') {
      // Horizontal layout - we invert the logic from columns
      const rowPositions = Array(columnCount).fill(0); // This is now row positions
      
      sortedItems.forEach((item) => {
        const rowSpan = item.rowSpan || 1;
        
        if (rowSpan > 1) {
          // For items spanning multiple rows, find best position
          let minPos = Infinity;
          let startRow = 0;
          
          for (let i = 0; i <= columnCount - rowSpan; i++) {
            const maxPosInSpan = Math.max(...rowPositions.slice(i, i + rowSpan));
            if (maxPosInSpan < minPos) {
              minPos = maxPosInSpan;
              startRow = i;
            }
          }
          
          const y = startRow * (colWidth + numericGap.y); // Using colWidth as rowHeight
          const x = minPos;
          const height = (colWidth * rowSpan) + (numericGap.y * (rowSpan - 1));
          const width = item.width || (item.calculatedWidth || 200);
          
          // Update row positions
          for (let i = 0; i < rowSpan; i++) {
            rowPositions[startRow + i] = x + width + numericGap.x;
          }
          
          layoutItems.push({
            item,
            x,
            y,
            width,
            height,
            columnIndex: startRow // Actually row index in this case
          });
        } else {
          // For single-row items
          const shortestRow = rowPositions.indexOf(Math.min(...rowPositions));
          const y = shortestRow * (colWidth + numericGap.y);
          const x = rowPositions[shortestRow];
          const height = colWidth;
          const width = item.width || (item.calculatedWidth || 200);
          
          rowPositions[shortestRow] += width + numericGap.x;
          
          layoutItems.push({
            item,
            x,
            y,
            width,
            height,
            columnIndex: shortestRow
          });
        }
      });
      
      // For horizontal layout, the container height is the height of all rows
      const updatedColumnHeights = rowPositions;
      
      // Get the maximum height across all columns to set container height
      const containerHeight = Math.max(...updatedColumnHeights);
      
      // Apply animations to newly added items
      if (animateOnChange) {
        const existingItemIds = new Set(
          layout.items.map(layoutItem => layoutItem.item.id.toString())
        );
        
        // Apply physics animations to newly added items
        layoutItems.forEach((layoutItem, index) => {
          const itemId = layoutItem.item.id;
          
          // If item wasn't in previous layout, animate it
          if (!existingItemIds.has(itemId.toString())) {
            // Create physics props for new items with initial values
            setItemPhysicsProps(prev => ({
              ...prev,
              [itemId]: {
                translateX: direction === 'vertical' ? 0 : 20,
                translateY: direction === 'vertical' ? 20 : 0,
                scale: 0.9,
                opacity: 0,
                rotation: 0
              }
            }));
            
            // Animate to final position with slight delay
            setTimeout(() => {
              setItemPhysicsProps(prev => ({
                ...prev,
                [itemId]: {
                  translateX: 0,
                  translateY: 0,
                  scale: 1,
                  opacity: 1,
                  rotation: 0
                }
              }));
            }, getStaggeredDelay(index, layoutItem.columnIndex, columnCount, physics.staggerDelay));
          }
        });
      }
      
      // Update layout state
      setLayout({
        items: layoutItems,
        containerHeight,
        columnHeights: updatedColumnHeights
      });
      
      // Callback when layout is complete
      onLayoutComplete?.({
        items: layoutItems,
        containerHeight
      });
      
      return;
    }
    
    // Get the maximum height across all columns to set container height
    const containerHeight = Math.max(...columnHeights);
    
    // Apply animations to newly added items
    if (animateOnChange) {
      const existingItemIds = new Set(
        layout.items.map(layoutItem => layoutItem.item.id.toString())
      );
      
      // Apply physics animations to newly added items
      layoutItems.forEach((layoutItem, index) => {
        const itemId = layoutItem.item.id;
        
        // If item wasn't in previous layout, animate it
        if (!existingItemIds.has(itemId.toString())) {
          // Create physics props for new items with initial values
          setItemPhysicsProps(prev => ({
            ...prev,
            [itemId]: {
              translateX: direction === 'vertical' ? 0 : 20,
              translateY: direction === 'vertical' ? 20 : 0,
              scale: 0.9,
              opacity: 0,
              rotation: 0
            }
          }));
          
          // Animate to final position with slight delay
          setTimeout(() => {
            setItemPhysicsProps(prev => ({
              ...prev,
              [itemId]: {
                translateX: 0,
                translateY: 0,
                scale: 1,
                opacity: 1,
                rotation: 0
              }
            }));
          }, getStaggeredDelay(index, layoutItem.columnIndex, columnCount, physics.staggerDelay));
        }
      });
    }
    
    // Update layout state
    setLayout({
      items: layoutItems,
      containerHeight,
      columnHeights
    });
    
    // Callback when layout is complete
    onLayoutComplete?.({
      items: layoutItems,
      containerHeight
    });
  }, [
    items,
    columnCount,
    numericGap,
    placementAlgorithm,
    direction,
    layout.items,
    animateOnChange,
    physics.staggerDelay,
    respectOrder,
    onLayoutComplete
  ]);
  
  // Handle resize events
  useEffect(() => {
    if (!responsiveLayout) return;
    
    const handleResize = () => {
      const now = Date.now();
      
      // Debounce resize calculations
      if (now - lastResizeTime.current > resizeThreshold) {
        lastResizeTime.current = now;
        calculateLayout();
      } else {
        // Cancel existing timeout and set a new one
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        
        rafRef.current = requestAnimationFrame(calculateLayout);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [responsiveLayout, resizeThreshold, calculateLayout]);
  
  // Set up ResizeObserver to measure items
  useEffect(() => {
    // Skip if we're not auto-sizing
    if (itemSizing !== 'auto') return;
    
    // Create a new ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      let shouldRecalculate = false;
      
      entries.forEach(entry => {
        const itemId = entry.target.getAttribute('data-item-id');
        
        if (itemId) {
          const { width, height } = entry.contentRect;
          
          // Only update if size has changed significantly
          const cached = itemSizeCache.current.get(itemId);
          const hasChanged = !cached || 
            Math.abs(cached.width - width) > 2 || 
            Math.abs(cached.height - height) > 2;
          
          if (hasChanged) {
            itemSizeCache.current.set(itemId, { width, height });
            shouldRecalculate = true;
          }
        }
      });
      
      if (shouldRecalculate) {
        calculateLayout();
      }
    });
    
    // Observe all item elements
    itemRefs.current.forEach(element => {
      resizeObserver.observe(element);
    });
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [itemSizing, calculateLayout]);
  
  // Setup intersection observer for lazy loading and load more
  useEffect(() => {
    if (!loadMoreRef.current || !loadMoreTrigger || !onLoadMore) return;
    
    const observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    }, observerOptions);
    
    observer.observe(loadMoreRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadMoreTrigger, onLoadMore]);
  
  // Setup intersection observer for lazy loading items
  useEffect(() => {
    if (!lazyLoad) {
      // If lazy loading is disabled, mark all items as visible
      setVisibleItems(new Set(items.map(item => item.id)));
      return;
    }
    
    const itemObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const itemId = entry.target.getAttribute('data-item-id');
        
        if (itemId) {
          if (entry.isIntersecting) {
            setVisibleItems(prev => {
              const newSet = new Set(prev);
              newSet.add(itemId);
              return newSet;
            });
          } else if (virtualized) {
            // Only remove if virtualization is enabled
            setVisibleItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(itemId);
              return newSet;
            });
          }
        }
      });
    }, {
      rootMargin: `${overscanCount * 100}px 0px ${overscanCount * 100}px 0px`,
      threshold: 0.01
    });
    
    // Observe all items
    itemRefs.current.forEach(element => {
      itemObserver.observe(element);
    });
    
    return () => {
      itemObserver.disconnect();
    };
  }, [lazyLoad, virtualized, overscanCount, items]);
  
  // Calculate layout on initial render and when dependencies change
  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);
  
  // Handle drag start for reordering
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, itemId: string | number) => {
    if (!dragToReorder) return;
    
    e.preventDefault();
    setIsDragging(itemId);
    
    // Get mouse/touch position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStartPos({ x: clientX, y: clientY });
    
    // Reset drag offset
    setDragOffset({ x: 0, y: 0 }, false);
    
    // Attach document event listeners
    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dragStartPos) return;
      
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      // Calculate delta from start position
      const deltaX = moveClientX - dragStartPos.x;
      const deltaY = moveClientY - dragStartPos.y;
      
      // Update drag offset
      setDragOffset({ x: deltaX, y: deltaY }, false);
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
      setDragStartPos(null);
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      
      // Handle item reordering
      handleItemReordering(itemId);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
  }, [dragToReorder, setDragOffset]);
  
  // Handle reordering after drag
  const handleItemReordering = useCallback((draggedItemId: string | number) => {
    // Find the dragged item in the layout
    const draggedLayoutItem = layout.items.find(item => item.item.id === draggedItemId);
    if (!draggedLayoutItem) return;
    
    // Calculate the final position of the dragged item
    const finalX = draggedLayoutItem.x + dragOffset.x;
    const finalY = draggedLayoutItem.y + dragOffset.y;
    
    // Find which item it was dropped onto
    const dropTarget = layout.items.find(item => {
      if (item.item.id === draggedItemId) return false;
      
      return (
        finalX + draggedLayoutItem.width / 2 >= item.x &&
        finalX + draggedLayoutItem.width / 2 <= item.x + item.width &&
        finalY + draggedLayoutItem.height / 2 >= item.y &&
        finalY + draggedLayoutItem.height / 2 <= item.y + item.height
      );
    });
    
    if (dropTarget) {
      // Reorder the items
      const newItems = [...items];
      const draggedIndex = newItems.findIndex(item => item.id === draggedItemId);
      const dropIndex = newItems.findIndex(item => item.id === dropTarget.item.id);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Swap the items
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);
        
        // Notify parent
        onOrderChange?.(newItems);
      }
    }
    
    // Reset position with animation
    setDragOffset({ x: 0, y: 0 }, true);
  }, [dragOffset, items, layout.items, onOrderChange, setDragOffset]);
  
  // Handle item click for image preview
  const handleItemClick = useCallback((item: MasonryItem) => {
    if (enableImagePreview) {
      setPreviewItem(item);
    }
  }, [enableImagePreview]);
  
  // Close preview
  const handleClosePreview = useCallback(() => {
    setPreviewItem(null);
  }, []);
  
  // Render the image preview
  const renderImagePreview = () => {
    if (!previewItem) return null;
    
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={handleClosePreview}
      >
        {previewRenderer 
          ? previewRenderer(previewItem)
          : <img 
              src={previewItem.data?.src || ''} 
              alt={previewItem.data?.alt || 'Preview'} 
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            />
        }
        <div 
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={handleClosePreview}
        >
          &times;
        </div>
      </div>
    );
  };
  
  return (
    <MasonryContainer
      ref={containerRef}
      className={className}
      style={style}
      $width={width}
      $height={height}
      $useScroller={useScroller}
      $isGlassContainer={glassContainer}
      $glassVariant={glassVariant}
      $blurStrength={blurStrength}
      $color={color}
      id={id}
    >
      <div style={{ position: 'relative', height: `${layout.containerHeight}px` }}>
        {layout.items.map(layoutItem => {
          const itemId = layoutItem.item.id;
          const isItemVisible = visibleItems.has(itemId);
          const isItemDragging = isDragging === itemId;
          
          // Get physics props for this item
          const physicsProps = itemPhysicsProps[itemId] || {
            translateX: 0,
            translateY: 0,
            scale: 1,
            opacity: 1,
            rotation: 0
          };
          
          // For dragging items, override translateX/Y with drag offset
          const finalTranslateX = isItemDragging ? dragOffset.x : physicsProps.translateX;
          const finalTranslateY = isItemDragging ? dragOffset.y : physicsProps.translateY;
          
          // Calculate staggered delay
          const staggerDelay = getStaggeredDelay(
            layout.items.indexOf(layoutItem),
            layoutItem.columnIndex,
            columnCount,
            physics.staggerDelay
          );
          
          // Skip rendering if virtualization is enabled and item is not visible
          if (virtualized && !isItemVisible) {
            return null;
          }
          
          return (
            <MasonryItemContainer
              key={itemId}
              ref={el => {
                if (el) itemRefs.current.set(itemId, el);
                else itemRefs.current.delete(itemId);
              }}
              data-item-id={itemId}
              className={itemClassName}
              $x={layoutItem.x}
              $y={layoutItem.y}
              $width={layoutItem.width}
              $height={layoutItem.height}
              $columnSpan={layoutItem.item.columnSpan || 1}
              $rowSpan={layoutItem.item.rowSpan || 1}
              $isGlassItem={glassItems}
              $glassVariant={glassVariant}
              $blurStrength={blurStrength}
              $color={color}
              $animation={itemAnimation}
              $origin={animationOrigin}
              $delay={staggerDelay}
              $reducedMotion={reducedMotion}
              $isDragging={isItemDragging}
              $animateOnMount={animateOnMount}
              $translateX={finalTranslateX}
              $translateY={finalTranslateY}
              $scale={physicsProps.scale}
              $opacity={physicsProps.opacity}
              $rotation={physicsProps.rotation}
              onMouseDown={e => handleDragStart(e, itemId)}
              onTouchStart={e => handleDragStart(e, itemId)}
              onClick={() => handleItemClick(layoutItem.item)}
            >
              {children(layoutItem.item, layout.items.indexOf(layoutItem))}
            </MasonryItemContainer>
          );
        })}
      </div>
      
      {/* Load more trigger */}
      {loadMoreTrigger === 'scroll' && hasMore && (
        <div ref={loadMoreRef}>
          {loading ? (
            loadingComponent || (
              <LoadingIndicator>
                <div className="spinner" />
              </LoadingIndicator>
            )
          ) : null}
        </div>
      )}
      
      {/* Load more button */}
      {loadMoreTrigger === 'button' && hasMore && (
        <LoadMoreButton
          onClick={onLoadMore}
          disabled={loading}
          $color={color}
          $glassVariant={glassVariant}
          $blurStrength={blurStrength}
        >
          {loading ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}
      
      {/* Image preview */}
      {renderImagePreview()}
    </MasonryContainer>
  );
};

export default GlassMasonry;