/**
 * Stack Component
 * 
 * A flexbox-based layout component that arranges children vertically or horizontally with customizable spacing
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { cssWithKebabProps } from '../../core/cssUtils';
import { glassSurface, GlassSurfaceOptions } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeUtils';

/**
 * Stack component props
 */
export interface StackProps {
  /**
   * Direction of the stack
   */
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  
  /**
   * Spacing between items (multiplied by 8px)
   */
  spacing?: number | string;
  
  /**
   * Dividers between items
   */
  divider?: React.ReactNode;
  
  /**
   * Wrap items if they overflow
   */
  wrap?: boolean | 'nowrap' | 'wrap' | 'wrap-reverse';
  
  /**
   * Horizontal alignment of items
   */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  
  /**
   * Vertical alignment of items
   */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  
  /**
   * Glass effect
   */
  glass?: boolean;
  
  /**
   * Glass surface options (if glass is true)
   */
  glassOptions?: Omit<GlassSurfaceOptions, 'themeContext'>;
  
  /**
   * Component to use as the root
   */
  component?: React.ElementType;
  
  /**
   * CSS class name
   */
  className?: string;
  
  /**
   * CSS inline style
   */
  style?: React.CSSProperties;
  
  /**
   * Reference to the root element
   */
  ref?: React.Ref<any>;
  
  /**
   * Children elements
   */
  children?: React.ReactNode;
}

/**
 * Convert spacing to pixel value
 */
const getSpacing = (spacing?: number | string): string => {
  if (spacing === undefined) return '0px';
  if (typeof spacing === 'number') return `${spacing * 8}px`;
  return String(spacing);
};

/**
 * Get wrap value
 */
const getWrapValue = (wrap: boolean | string): string => {
  if (typeof wrap === 'boolean') {
    return wrap ? 'wrap' : 'nowrap';
  }
  return wrap;
};

/**
 * Styled component for Stack
 */
const StackContainer = styled.div<StackProps>`
  ${props => cssWithKebabProps`
    display: flex;
    flex-direction: ${props.direction || 'column'};
    justify-content: ${props.justifyContent || 'flex-start'};
    align-items: ${props.alignItems || 'stretch'};
    flex-wrap: ${props.wrap ? getWrapValue(props.wrap) : 'nowrap'};
    
    ${props.spacing ? `gap: ${getSpacing(props.spacing)};` : ''}
    
    ${props.glass ? props.theme && glassSurface({
      ...props.glassOptions,
      themeContext: createThemeContext(props.theme)
    }) : ''}
  `}
`;

/**
 * Styled component for Stack.Item
 */
const StackItemContainer = styled.div`
  ${cssWithKebabProps`
    display: flex;
  `}
`;

/**
 * Extended Stack interface with static Item property
 */
export interface StackComponent extends React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>> {
  Item: React.ForwardRefExoticComponent<StackItemProps & React.RefAttributes<HTMLDivElement>>;
}

/**
 * Stack component for arranging children vertically or horizontally
 */
const StackBase = forwardRef<HTMLDivElement, StackProps>(function Stack(props, ref) {
  const {
    direction = 'column',
    spacing = 0,
    divider,
    wrap = false,
    justifyContent,
    alignItems,
    glass = false,
    glassOptions,
    component = 'div',
    className,
    style,
    children,
    ...rest
  } = props;

  const childrenArray = React.Children.toArray(children).filter(Boolean);
  
  const renderChildren = () => {
    if (!divider) {
      return children;
    }
    
    return childrenArray.map((child, index) => {
      const isLastChild = index === childrenArray.length - 1;
      
      return (
        <React.Fragment key={index}>
          {child}
          {!isLastChild && divider}
        </React.Fragment>
      );
    });
  };

  return (
    <StackContainer
      as={component}
      ref={ref}
      direction={direction}
      spacing={spacing}
      wrap={wrap}
      justifyContent={justifyContent}
      alignItems={alignItems}
      glass={glass}
      glassOptions={glassOptions}
      className={className}
      style={style}
      {...rest}
    >
      {renderChildren()}
    </StackContainer>
  );
});

/**
 * Stack Item component
 */
export interface StackItemProps {
  /**
   * CSS flex grow property
   */
  grow?: number;
  
  /**
   * CSS flex shrink property
   */
  shrink?: number;
  
  /**
   * CSS flex basis property
   */
  basis?: string | number;
  
  /**
   * CSS align-self property
   */
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  
  /**
   * CSS class name
   */
  className?: string;
  
  /**
   * CSS inline style
   */
  style?: React.CSSProperties;
  
  /**
   * Component to use as the root
   */
  component?: React.ElementType;
  
  /**
   * Children elements
   */
  children?: React.ReactNode;
}

const Item = forwardRef<HTMLDivElement, StackItemProps>(function StackItem(props, ref) {
  const {
    grow,
    shrink,
    basis,
    alignSelf,
    className,
    style,
    component = 'div',
    children,
    ...rest
  } = props;
  
  const itemStyle = {
    ...style,
    flexGrow: grow,
    flexShrink: shrink,
    flexBasis: basis,
    alignSelf
  };
  
  return (
    <StackItemContainer
      as={component}
      ref={ref}
      className={className}
      style={itemStyle}
      {...rest}
    >
      {children}
    </StackItemContainer>
  );
});

// Create the Stack component with Item as a static property
const Stack = StackBase as StackComponent;
Stack.Item = Item;

// Export the Stack component
export { Stack };
export default Stack;