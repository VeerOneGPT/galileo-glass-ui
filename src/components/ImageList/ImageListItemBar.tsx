/**
 * ImageListItemBar Component
 *
 * A title bar for an ImageListItem with glass morphism styling.
 */
import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { ImageListItemBarProps } from './types';

// Styled components
const ImageListItemBarRoot = styled.div<{
  $position: 'top' | 'bottom' | 'below';
  $glass: boolean;
  $actionPosition: 'left' | 'right';
  $showOnHover: boolean;
  $isHovered: boolean;
  $reducedMotion: boolean;
}>`
  position: ${props => (props.$position === 'below' ? 'relative' : 'absolute')};
  left: 0;
  right: 0;

  /* Position at top or bottom */
  ${props => (props.$position === 'top' ? 'top: 0;' : '')}
  ${props => (props.$position === 'bottom' ? 'bottom: 0;' : '')}
  
  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: 1,
      blurStrength: 'medium',
      borderOpacity: 'light',
      themeContext: createThemeContext(props.theme),
    })}
  
  /* Base styling */
  background-color: ${props => (props.$glass ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)')};
  color: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  display: flex;
  align-items: center;

  /* Action positioning */
  flex-direction: ${props => (props.$actionPosition === 'left' ? 'row-reverse' : 'row')};

  /* Show on hover */
  opacity: ${props => (props.$showOnHover ? (props.$isHovered ? 1 : 0) : 1)};
  transition: ${props => (!props.$reducedMotion ? 'opacity 0.3s ease' : 'none')};
`;

const TitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
  margin-right: 12px;
`;

const Title = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const Subtitle = styled.div`
  font-size: 0.75rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  opacity: 0.8;
`;

const ActionIconContainer = styled.div<{
  $actionPosition: 'left' | 'right';
}>`
  display: flex;
  align-items: center;
  margin: ${props => (props.$actionPosition === 'left' ? '0 8px 0 0' : '0 0 0 8px')};
`;

/**
 * ImageListItemBar Component Implementation
 */
function ImageListItemBarComponent(
  props: ImageListItemBarProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    className,
    style,
    title,
    subtitle,
    position = 'bottom',
    glass = false,
    actionIcon,
    actionPosition = 'right',
    showOnHover = false,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // State for hover
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ImageListItemBarRoot
      ref={ref}
      className={className}
      style={style}
      $position={position}
      $glass={glass}
      $actionPosition={actionPosition}
      $showOnHover={showOnHover}
      $isHovered={isHovered}
      $reducedMotion={prefersReducedMotion}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      <TitleWrapper>
        {title && <Title>{title}</Title>}
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleWrapper>

      {actionIcon && (
        <ActionIconContainer $actionPosition={actionPosition}>{actionIcon}</ActionIconContainer>
      )}

      {children}
    </ImageListItemBarRoot>
  );
}

/**
 * ImageListItemBar Component
 *
 * A title bar for an ImageListItem.
 */
const ImageListItemBar = forwardRef(ImageListItemBarComponent);

/**
 * GlassImageListItemBar Component
 *
 * Glass variant of the ImageListItemBar component.
 */
const GlassImageListItemBar = forwardRef<HTMLDivElement, ImageListItemBarProps>((props, ref) => (
  <ImageListItemBar {...props} glass={true} ref={ref} />
));

GlassImageListItemBar.displayName = 'GlassImageListItemBar';

export default ImageListItemBar;
export { ImageListItemBar, GlassImageListItemBar };
