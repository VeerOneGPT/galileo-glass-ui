/**
 * Glass ImageList Component
 *
 * A grid of images with glass morphism styling.
 */
import React, { forwardRef, createContext, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Import animation sequence hook and types
import { useAnimationSequence } from '../../animations/orchestration/useAnimationSequence';
import { 
  StaggerAnimationStage,
  StyleAnimationStage,
  AnimationStage,
  AnimationSequenceConfig,
  SequenceControls
} from '../../animations/types';
import { Easings } from '../../animations/physics/interpolation'; // Import Easings

// Hook for reduced motion
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

// Import types (assuming types.ts is updated)
import { ImageListProps } from './types'; 
import { AnimationProps } from '../../animations/types';

// Create ImageList context
export interface ImageListContextProps extends AnimationProps { // Extend with AnimationProps
  variant: 'standard' | 'quilted' | 'masonry' | 'woven';
  rowHeight: number | 'auto';
  gap: number;
  cols: number;
  glass: boolean;
  variableSize: boolean;
  rounded: boolean;
}

export const ImageListContext = createContext<ImageListContextProps>({
  variant: 'standard',
  rowHeight: 'auto',
  gap: 8,
  cols: 2,
  glass: false,
  variableSize: false,
  rounded: false,
  // Default animation props
  animationConfig: undefined,
  disableAnimation: false,
  motionSensitivity: undefined,
});

// Styled components
const ImageListRoot = styled.ul<{
  $variant: 'standard' | 'quilted' | 'masonry' | 'woven';
  $rowHeight: number | 'auto';
  $gap: number;
  $cols: number;
  $glass: boolean;
  $rounded: boolean;
}>`
  display: grid;
  padding: 0;
  margin: 0;
  list-style: none;
  box-sizing: border-box;

  /* Standard, quilted, and woven variants use CSS grid */
  ${props =>
    props.$variant !== 'masonry' &&
    `
    grid-template-columns: repeat(${props.$cols}, 1fr);
    gap: ${props.$gap}px;
    
    ${
      props.$variant === 'standard' &&
      `
      grid-auto-rows: ${typeof props.$rowHeight === 'number' ? `${props.$rowHeight}px` : 'auto'};
    `
    }
    
    ${
      props.$variant === 'quilted' &&
      `
      /* Quilted layout has more complex sizing handled by the items */
    `
    }
    
    ${
      props.$variant === 'woven' &&
      `
      /* Woven layout alternates items */
    `
    }
  `}

  /* Masonry variant uses column-count */
  ${props =>
    props.$variant === 'masonry' &&
    `
    column-count: ${props.$cols};
    column-gap: ${props.$gap}px;
    
    & > li {
      margin-bottom: ${props.$gap}px;
      break-inside: avoid;
    }
  `}
  
  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      borderOpacity: 'light',
      themeContext: createThemeContext(props.theme),
    })}
  
  /* Glass styling */
  ${props =>
    props.$glass &&
    `
    background-color: rgba(255, 255, 255, 0.03);
    padding: ${props.$gap}px;
  `}
  
  /* Rounded corners */
  ${props =>
    props.$rounded &&
    `
    border-radius: 12px;
    overflow: hidden;
  `}
`;

/**
 * ImageList Component Implementation
 */
function ImageListComponent(props: ImageListProps, ref: React.ForwardedRef<HTMLUListElement>) {
  const {
    children,
    className,
    style,
    cols = 2,
    gap = 8,
    rowHeight = 'auto',
    variant = 'standard',
    glass = false,
    rounded = false,
    variableSize = false,
    enableEntranceAnimation = true,
    animationConfig, 
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Determine if the entrance animation should run
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const shouldAnimateEntrance = enableEntranceAnimation && !finalDisableAnimation;

  // Ref for the root ul element
  const rootRef = useRef<HTMLUListElement>(null);

  // --- Entrance Animation Setup --- 
  // Define the sequence configuration MEMOIZED
  const entranceSequenceConfig = useMemo((): AnimationSequenceConfig => {
    const entranceStage: StaggerAnimationStage = {
      id: 'list-item-entrance',
      type: 'stagger',
      targets: '.galileo-image-list-item', // Target the class name
      from: { opacity: 0, transform: 'translateY(20px)' },
      properties: { opacity: 1, transform: 'translateY(0px)' },
      duration: 400, 
      staggerDelay: 50,
      easing: 'easeOutCubic',
    };
    return {
      id: `imagelist-entrance-${Date.now()}`,
      stages: [entranceStage],
      autoplay: false, // We will trigger play manually in useEffect
      // Pass animation config details if useAnimationSequence supports them
      // e.g., could pass disableAnimation directly if supported
      // For now, we control via shouldAnimateEntrance flag
    };
  }, []); // Empty dependency array - config doesn't change

  // Instantiate the sequence hook at the TOP LEVEL
  const { play: playEntranceAnimation }: SequenceControls = useAnimationSequence(entranceSequenceConfig);

  // Trigger the entrance animation on mount if enabled
  useEffect(() => {
    if (shouldAnimateEntrance) {
      // Small delay to ensure elements are rendered before targeting
      const timer = setTimeout(() => {
        playEntranceAnimation();
      }, 50); // Adjust delay if needed
      return () => clearTimeout(timer);
    }
    // Dependency: only run when shouldAnimateEntrance changes (or on mount)
  }, [shouldAnimateEntrance, playEntranceAnimation]);
  // --- End Entrance Animation Setup ---

  // Assign forwarded ref to internal ref if provided
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(rootRef.current);
    } else {
      ref.current = rootRef.current;
    }
  }, [ref]);

  // Create context value including animation props
  const contextValue = useMemo<ImageListContextProps>(
    () => ({
      variant,
      rowHeight,
      gap,
      cols,
      glass,
      variableSize,
      rounded,
      // Pass down animation props
      animationConfig,
      disableAnimation: finalDisableAnimation, // Pass the resolved value
      motionSensitivity,
    }),
    [
      variant, rowHeight, gap, cols, glass, variableSize, rounded, 
      animationConfig, finalDisableAnimation, motionSensitivity
    ]
  );

  return (
    <ImageListContext.Provider value={contextValue}>
      <ImageListRoot
        ref={rootRef}
        className={className}
        style={style}
        $variant={variant}
        $rowHeight={rowHeight}
        $gap={gap}
        $cols={cols}
        $glass={glass}
        $rounded={rounded}
        {...rest}
      >
        {/* Ensure children (ImageListItem) have the class name */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement<React.HTMLAttributes<HTMLElement>>(child)) {
            // Clone element, merging className
            return React.cloneElement(child, {
              className: `${child.props.className || ''} galileo-image-list-item`,
            });
          }
          return child;
        })}
      </ImageListRoot>
    </ImageListContext.Provider>
  );
}

/**
 * ImageList Component
 *
 * A grid of images.
 */
const ImageList = forwardRef<HTMLUListElement, ImageListProps>(ImageListComponent);

/**
 * GlassImageList Component
 *
 * Glass variant of the ImageList component.
 */
const GlassImageList = forwardRef<HTMLUListElement, ImageListProps>((props, ref) => (
  <ImageList {...props} glass={true} ref={ref} />
));

GlassImageList.displayName = 'GlassImageList';

export default ImageList;
export { ImageList, GlassImageList };
