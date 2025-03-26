/**
 * Glass ImageList Component
 *
 * A grid of images with glass morphism styling.
 */
import React, { forwardRef, createContext, useMemo } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

import { ImageListProps } from './types';

// Create ImageList context
export interface ImageListContextProps {
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
    ...rest
  } = props;

  // Create context value
  const contextValue = useMemo<ImageListContextProps>(
    () => ({
      variant,
      rowHeight,
      gap,
      cols,
      glass,
      variableSize,
      rounded,
    }),
    [variant, rowHeight, gap, cols, glass, variableSize, rounded]
  );

  return (
    <ImageListContext.Provider value={contextValue}>
      <ImageListRoot
        ref={ref}
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
        {children}
      </ImageListRoot>
    </ImageListContext.Provider>
  );
}

/**
 * ImageList Component
 *
 * A grid of images.
 */
const ImageList = forwardRef(ImageListComponent);

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
