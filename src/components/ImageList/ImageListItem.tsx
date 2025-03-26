/**
 * ImageListItem Component
 * 
 * An item component for the ImageList with glass morphism styling.
 */
import React, { forwardRef, useContext, useState } from 'react';
import styled from 'styled-components';
import { ImageListContext } from './ImageList';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { ImageListItemProps } from './types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Styled components
const ImageListItemRoot = styled.li<{
  $cols: number;
  $rows: number;
  $variant: 'standard' | 'quilted' | 'masonry' | 'woven';
  $glass: boolean;
  $index?: number;
  $hoverOverlay: boolean;
  $elevation: number;
  $rounded: boolean;
  $reducedMotion: boolean;
}>`
  position: relative;
  display: block;
  overflow: hidden;
  z-index: 1;
  
  /* Handle different variants */
  ${props => props.$variant === 'standard' && `
    grid-column-end: span ${props.$cols};
    grid-row-end: span ${props.$rows};
  `}
  
  ${props => props.$variant === 'quilted' && `
    grid-column-end: span ${props.$cols};
    grid-row-end: span ${props.$rows};
  `}
  
  ${props => props.$variant === 'woven' && `
    grid-column-end: span ${props.$cols};
    grid-row-end: span ${props.$rows};
  `}
  
  /* Masonry doesn't use grid-column/grid-row */
  
  /* Glass styling */
  ${props => props.$glass && glassSurface({
    elevation: props.$elevation,
    blurStrength: props.$elevation > 2 ? 'standard' : 'light',
    borderOpacity: 'light',
    themeContext: createThemeContext(props.theme)
  })}
  
  /* Box shadow based on elevation */
  ${props => props.$elevation > 0 && !props.$glass && `
    box-shadow: ${
      props.$elevation === 1 ? '0 2px 4px rgba(0, 0, 0, 0.1)' :
      props.$elevation === 2 ? '0 3px 6px rgba(0, 0, 0, 0.15)' :
      props.$elevation === 3 ? '0 5px 10px rgba(0, 0, 0, 0.2)' :
      props.$elevation === 4 ? '0 8px 16px rgba(0, 0, 0, 0.25)' :
      '0 12px 24px rgba(0, 0, 0, 0.3)'
    };
  `}
  
  /* Rounded corners */
  ${props => props.$rounded && `
    border-radius: 8px;
    overflow: hidden;
  `}
  
  /* Hover effects */
  transition: ${props => !props.$reducedMotion ? 'transform 0.3s, box-shadow 0.3s' : 'none'};
  
  &:hover {
    ${props => props.$elevation > 0 && !props.$glass && `
      box-shadow: ${
        props.$elevation === 1 ? '0 3px 6px rgba(0, 0, 0, 0.15)' :
        props.$elevation === 2 ? '0 5px 10px rgba(0, 0, 0, 0.2)' :
        props.$elevation === 3 ? '0 8px 16px rgba(0, 0, 0, 0.25)' :
        props.$elevation === 4 ? '0 12px 24px rgba(0, 0, 0, 0.3)' :
        '0 16px 32px rgba(0, 0, 0, 0.35)'
      };
      transform: translateY(-2px);
    `}
  }
`;

const ImageContainer = styled.div<{
  $glass: boolean;
}>`
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  
  /* Image height should fill the container */
  & > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HoverOverlay = styled.div<{
  $visible: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: ${props => !props.$reducedMotion ? 'opacity 0.3s ease' : 'none'};
  pointer-events: none;
`;

/**
 * ImageListItem Component Implementation
 */
function ImageListItemComponent(
  props: ImageListItemProps,
  ref: React.ForwardedRef<HTMLLIElement>
) {
  const {
    children,
    className,
    style,
    cols: propCols,
    rows: propRows,
    glass: propGlass,
    hoverOverlay = false,
    elevation = 0,
    rounded: propRounded,
    alt,
    src,
    srcSet,
    ...rest
  } = props;
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // Get ImageList context
  const { 
    variant, 
    cols: contextCols, 
    glass: contextGlass,
    variableSize,
    rounded: contextRounded
  } = useContext(ImageListContext);
  
  // Calculate cols and rows based on variableSize
  const cols = propCols !== undefined ? propCols : (
    // If variable size is enabled, allow items to span multiple columns/rows
    // Otherwise, enforce single-cell items
    variableSize ? 1 : 1
  );
  const rows = propRows !== undefined ? propRows : (
    variableSize ? 1 : 1
  );
  
  // Merge props with context
  const glass = propGlass !== undefined ? propGlass : contextGlass;
  const rounded = propRounded !== undefined ? propRounded : contextRounded;
  
  // State for hover
  const [isHovered, setIsHovered] = useState(false);
  
  // Prepare image element if src is provided
  const image = src ? (
    <img
      src={src}
      srcSet={srcSet}
      alt={alt || ''}
      loading="lazy"
      {...rest}
    />
  ) : null;
  
  return (
    <ImageListItemRoot
      ref={ref}
      className={className}
      style={style}
      $cols={cols}
      $rows={rows}
      $variant={variant}
      $glass={glass}
      $hoverOverlay={hoverOverlay}
      $elevation={elevation}
      $rounded={rounded}
      $reducedMotion={prefersReducedMotion}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ImageContainer $glass={glass}>
        {image}
        {children}
        
        {hoverOverlay && (
          <HoverOverlay 
            $visible={isHovered}
            $reducedMotion={prefersReducedMotion}
          />
        )}
      </ImageContainer>
    </ImageListItemRoot>
  );
}

/**
 * ImageListItem Component
 * 
 * An item component for the ImageList.
 */
const ImageListItem = forwardRef(ImageListItemComponent);

/**
 * GlassImageListItem Component
 * 
 * Glass variant of the ImageListItem component.
 */
const GlassImageListItem = forwardRef<HTMLLIElement, ImageListItemProps>((props, ref) => (
  <ImageListItem {...props} glass={true} ref={ref} />
));

GlassImageListItem.displayName = 'GlassImageListItem';

export default ImageListItem;
export { ImageListItem, GlassImageListItem };