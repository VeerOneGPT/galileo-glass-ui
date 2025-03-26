import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

export interface ListProps {
  /**
   * The content of the list
   */
  children: React.ReactNode;

  /**
   * The component used for the root node (advanced)
   */
  component?: React.ElementType;

  /**
   * If true, compact vertical padding will be used
   */
  dense?: boolean;

  /**
   * If true, the left and right padding will be removed
   */
  disablePadding?: boolean;

  /**
   * The variant of the list
   */
  variant?: 'standard' | 'outlined' | 'glass';

  /**
   * The width of the list
   */
  width?: string | number;

  /**
   * If true, horizontal dividers will be rendered between items
   */
  dividers?: boolean;

  /**
   * The color scheme of the list
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * If true, the list will have rounded corners
   */
  rounded?: boolean;

  /**
   * If true, the list will have a subtle background
   */
  hasBackground?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * If true, add shadow to the list
   */
  elevated?: boolean;
}

export interface ListItemProps {
  /**
   * The content of the list item
   */
  children: React.ReactNode;

  /**
   * If true, the list item will be a button
   */
  button?: boolean;

  /**
   * If true, the list item will be disabled
   */
  disabled?: boolean;

  /**
   * If true, the list item will be focused
   */
  focused?: boolean;

  /**
   * If true, the list item will be selected
   */
  selected?: boolean;

  /**
   * Primary text for the list item (used with secondaryText for two-line items)
   */
  primaryText?: React.ReactNode;

  /**
   * Secondary text for the list item (used with primaryText for two-line items)
   */
  secondaryText?: React.ReactNode;

  /**
   * Icon to display at the beginning of the list item
   */
  icon?: React.ReactNode;

  /**
   * Element to display at the end of the list item
   */
  action?: React.ReactNode;

  /**
   * If true, display a left border accent
   */
  accentLeft?: boolean;

  /**
   * Callback fired when the list item is clicked
   */
  onClick?: React.MouseEventHandler<HTMLDivElement | HTMLLIElement>;

  /**
   * Additional CSS class
   */
  className?: string;
}

// Get color by name for theme consistency
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#E5E7EB'; // default light gray
  }
};

// Styled components
const ListRoot = styled.ul<{
  $dense: boolean;
  $disablePadding: boolean;
  $variant: string;
  $width: string | number;
  $dividers: boolean;
  $color: string;
  $rounded: boolean;
  $hasBackground: boolean;
  $elevated: boolean;
}>`
  list-style: none;
  margin: 0;
  padding: ${props => (props.$disablePadding ? 0 : props.$dense ? '4px 0' : '8px 0')};
  width: ${props => (typeof props.$width === 'number' ? `${props.$width}px` : props.$width)};
  font-family: 'Inter', sans-serif;
  position: relative;

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `
          border: 1px solid rgba(0, 0, 0, 0.12);
        `;
      case 'glass':
        return `
          background-color: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
      default: // standard
        return props.$hasBackground
          ? `background-color: ${
              props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)'
            };`
          : '';
    }
  }}

  /* Rounded corners */
  border-radius: ${props => (props.$rounded ? '8px' : '0')};

  /* Elevation/shadow */
  box-shadow: ${props => (props.$elevated ? '0 2px 10px rgba(0, 0, 0, 0.08)' : 'none')};

  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassSurface({
      elevation: props.$elevated ? 2 : 1,
      blurStrength: 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}

  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    props.$color !== 'default' &&
    glassGlow({
      intensity: 'minimal',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
`;

const ListItemRoot = styled.li<{
  $button: boolean;
  $disabled: boolean;
  $focused: boolean;
  $selected: boolean;
  $accentLeft: boolean;
  $color: string;
  $hasIcon: boolean;
  $hasAction: boolean;
  $hasBothTexts: boolean;
}>`
  display: flex;
  align-items: ${props => (props.$hasBothTexts ? 'flex-start' : 'center')};
  position: relative;
  padding: 8px 16px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  ${props => (props.$button ? 'cursor: pointer;' : '')}
  ${props => (props.$disabled ? 'opacity: 0.5; pointer-events: none;' : '')}
  ${props => (props.$focused ? `background-color: rgba(0, 0, 0, 0.04);` : '')}
  ${props =>
    props.$selected
      ? `
    background-color: rgba(${props.$color === 'default' ? '0, 0, 0' : '99, 102, 241'}, 0.08);
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 2px;
      background-color: ${
        props.$color === 'default' ? 'rgba(0, 0, 0, 0.6)' : getColorByName(props.$color)
      };
    }
  `
      : ''}
  
  /* Accent left border */
  ${props =>
    props.$accentLeft &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 4px;
      background-color: ${
        props.$color === 'default' ? 'rgba(0, 0, 0, 0.6)' : getColorByName(props.$color)
      };
    }
  `}
  
  /* Button functionality */
  ${props =>
    props.$button &&
    !props.$disabled &&
    `
    transition: background-color 0.2s ease;
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    &:active {
      background-color: rgba(0, 0, 0, 0.08);
    }
  `}
`;

const ListItemIcon = styled.div`
  min-width: 40px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ListItemTexts = styled.div`
  flex: 1;
  min-width: 0;
`;

const PrimaryText = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SecondaryText = styled.div`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
`;

const ListItemAction = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

const Divider = styled.hr`
  margin: 0;
  flex-shrink: 0;
  border: 0;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.12);
`;

/**
 * List Component
 *
 * A component for displaying lists of items.
 */
export const List = forwardRef<HTMLUListElement, ListProps>((props, ref) => {
  const {
    children,
    component: Component = 'ul',
    dense = false,
    disablePadding = false,
    variant = 'standard',
    width = '100%',
    dividers = false,
    color = 'default',
    rounded = false,
    hasBackground = false,
    className,
    elevated = false,
    ...rest
  } = props;

  // Process children to add dividers between list items
  const processedChildren = React.Children.toArray(children).map((child, index, array) => {
    if (index === array.length - 1) {
      return child; // Last item doesn't need a divider
    }

    return dividers ? (
      <React.Fragment key={index}>
        {child}
        <Divider />
      </React.Fragment>
    ) : (
      child
    );
  });

  return (
    <ListRoot
      ref={ref}
      as={Component}
      className={className}
      $dense={dense}
      $disablePadding={disablePadding}
      $variant={variant}
      $width={width}
      $dividers={dividers}
      $color={color}
      $rounded={rounded}
      $hasBackground={hasBackground}
      $elevated={elevated}
      {...rest}
    >
      {processedChildren}
    </ListRoot>
  );
});

List.displayName = 'List';

/**
 * ListItem Component
 *
 * A component for displaying individual items within a list.
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>((props, ref) => {
  const {
    children,
    button = false,
    disabled = false,
    focused = false,
    selected = false,
    primaryText,
    secondaryText,
    icon,
    action,
    accentLeft = false,
    onClick,
    className,
    ...rest
  } = props;

  // Determine if we have a text structure
  const hasTextStructure = primaryText !== undefined;
  const hasBothTexts = hasTextStructure && secondaryText !== undefined;

  return (
    <ListItemRoot
      ref={ref}
      className={className}
      onClick={onClick}
      $button={button || !!onClick}
      $disabled={disabled}
      $focused={focused}
      $selected={selected}
      $accentLeft={accentLeft}
      $color="primary"
      $hasIcon={!!icon}
      $hasAction={!!action}
      $hasBothTexts={hasBothTexts}
      {...rest}
    >
      {icon && <ListItemIcon>{icon}</ListItemIcon>}

      {hasTextStructure ? (
        <ListItemTexts>
          <PrimaryText>{primaryText}</PrimaryText>
          {secondaryText && <SecondaryText>{secondaryText}</SecondaryText>}
        </ListItemTexts>
      ) : (
        children
      )}

      {action && <ListItemAction>{action}</ListItemAction>}
    </ListItemRoot>
  );
});

ListItem.displayName = 'ListItem';

/**
 * GlassList Component
 *
 * A list component with glass morphism styling.
 */
export const GlassList = forwardRef<HTMLUListElement, ListProps>((props, ref) => {
  const { className, variant = 'glass', hasBackground = true, ...rest } = props;

  return (
    <List
      ref={ref}
      className={`glass-list ${className || ''}`}
      variant={variant}
      hasBackground={hasBackground}
      {...rest}
    />
  );
});

GlassList.displayName = 'GlassList';

/**
 * GlassListItem Component
 *
 * A list item with glass morphism styling.
 */
export const GlassListItem = forwardRef<HTMLLIElement, ListItemProps>((props, ref) => {
  const { className, ...rest } = props;

  return <ListItem ref={ref} className={`glass-list-item ${className || ''}`} {...rest} />;
});

GlassListItem.displayName = 'GlassListItem';
