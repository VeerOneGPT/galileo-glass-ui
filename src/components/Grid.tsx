/**
 * Grid Component
 *
 * A responsive 12-column grid layout system for arranging content
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../core/cssUtils';

/**
 * Grid container props
 */
export interface GridProps {
  /**
   * Gap between grid items
   */
  spacing?: number | string;

  /**
   * Row gap between grid items
   */
  rowSpacing?: number | string;

  /**
   * Column gap between grid items
   */
  columnSpacing?: number | string;

  /**
   * Number of columns the grid should have
   */
  columns?: number;

  /**
   * Grid item column arrangement by breakpoint
   */
  container?: boolean;

  /**
   * Direction of the grid
   */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';

  /**
   * Defines the horizontal alignment of items
   */
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

  /**
   * Defines the vertical alignment of items
   */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

  /**
   * Defines whether the grid wraps its children
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';

  /**
   * Component type
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
   * Glass effect
   */
  glass?: boolean;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

/**
 * Grid item props
 */
export interface GridItemProps {
  /**
   * Number of columns item should span (1-12)
   */
  xs?: number | 'auto';

  /**
   * Number of columns item should span at sm breakpoint
   */
  sm?: number | 'auto';

  /**
   * Number of columns item should span at md breakpoint
   */
  md?: number | 'auto';

  /**
   * Number of columns item should span at lg breakpoint
   */
  lg?: number | 'auto';

  /**
   * Number of columns item should span at xl breakpoint
   */
  xl?: number | 'auto';

  /**
   * Custom column span
   */
  cols?: number | string;

  /**
   * Direction of the item
   */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';

  /**
   * Defines the horizontal alignment of content
   */
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

  /**
   * Defines the vertical alignment of content
   */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

  /**
   * CSS class name
   */
  className?: string;

  /**
   * CSS inline style
   */
  style?: React.CSSProperties;

  /**
   * Component type
   */
  component?: React.ElementType;

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
  return spacing;
};

/**
 * Get grid template columns based on columns and breakpoint
 */
const getColumnsTemplate = (columns = 12): string => {
  return `repeat(${columns}, 1fr)`;
};

/**
 * Get grid column span based on column value
 */
const getColumnSpan = (value: number | 'auto' | undefined, columns = 12): string => {
  if (value === undefined) return '';
  if (value === 'auto') return 'auto';
  if (typeof value === 'number') return `span ${value} / span ${value}`;
  return '';
};

/**
 * Get responsive styles for breakpoints
 */
const getResponsiveStyles = (props: GridItemProps, columns = 12): Record<string, string> => {
  const styles: Record<string, string> = {};

  // Base xs styles
  if (props.xs !== undefined) {
    styles.gridColumn = getColumnSpan(props.xs, columns);
  }

  // Responsive styles
  if (props.sm !== undefined) {
    styles['@media (min-width: 600px)'] = `grid-column: ${getColumnSpan(props.sm, columns)};`;
  }

  if (props.md !== undefined) {
    styles['@media (min-width: 960px)'] = `grid-column: ${getColumnSpan(props.md, columns)};`;
  }

  if (props.lg !== undefined) {
    styles['@media (min-width: 1280px)'] = `grid-column: ${getColumnSpan(props.lg, columns)};`;
  }

  if (props.xl !== undefined) {
    styles['@media (min-width: 1920px)'] = `grid-column: ${getColumnSpan(props.xl, columns)};`;
  }

  return styles;
};

// Styled Container for Grid
const GridContainer = styled.div<GridProps>`
  ${props =>
    props.container
      ? cssWithKebabProps`
      display: grid;
      grid-template-columns: ${getColumnsTemplate(props.columns)};
      gap: ${getSpacing(props.spacing)};
      row-gap: ${getSpacing(props.rowSpacing || props.spacing)};
      column-gap: ${getSpacing(props.columnSpacing || props.spacing)};
      ${props.direction ? `grid-auto-flow: ${props.direction};` : ''}
      ${props.justifyContent ? `justify-content: ${props.justifyContent};` : ''}
      ${props.alignItems ? `align-items: ${props.alignItems};` : ''}
      ${props.wrap ? `flex-wrap: ${props.wrap};` : ''}
      
      ${
        props.glass
          ? `
        background-color: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      `
          : ''
      }
    `
      : ''}
`;

// Styled Component for Grid Item
const GridItemStyled = styled.div<GridItemProps & { parentColumns?: number }>`
  ${props => cssWithKebabProps`
    ${
      props.cols
        ? `grid-column: span ${props.cols} / span ${props.cols};`
        : props.xs !== undefined
        ? `grid-column: ${getColumnSpan(props.xs, props.parentColumns)};`
        : ''
    }
    
    ${props.direction ? `flex-direction: ${props.direction};` : ''}
    ${props.justifyContent ? `justify-content: ${props.justifyContent};` : ''}
    ${props.alignItems ? `align-items: ${props.alignItems};` : ''}
    
    /* Responsive breakpoints */
    @media (min-width: 600px) {
      ${
        props.sm !== undefined
          ? `grid-column: ${getColumnSpan(props.sm, props.parentColumns)};`
          : ''
      }
    }
    
    @media (min-width: 960px) {
      ${
        props.md !== undefined
          ? `grid-column: ${getColumnSpan(props.md, props.parentColumns)};`
          : ''
      }
    }
    
    @media (min-width: 1280px) {
      ${
        props.lg !== undefined
          ? `grid-column: ${getColumnSpan(props.lg, props.parentColumns)};`
          : ''
      }
    }
    
    @media (min-width: 1920px) {
      ${
        props.xl !== undefined
          ? `grid-column: ${getColumnSpan(props.xl, props.parentColumns)};`
          : ''
      }
    }
  `}
`;

/**
 * Extended Grid interface with static Item property
 */
export interface GridComponent
  extends React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLDivElement>> {
  Item: React.ForwardRefExoticComponent<
    GridItemProps & { parentColumns?: number } & React.RefAttributes<HTMLDivElement>
  >;
}

/**
 * Grid component
 */
const GridBase = forwardRef<HTMLDivElement, GridProps>(function Grid(props, ref) {
  const {
    spacing = 0,
    rowSpacing,
    columnSpacing,
    columns = 12,
    container = false,
    direction,
    justifyContent,
    alignItems,
    wrap,
    component = 'div',
    className,
    style,
    glass = false,
    children,
    ...rest
  } = props;

  return (
    <GridContainer
      as={component}
      ref={ref}
      container={container}
      spacing={spacing}
      rowSpacing={rowSpacing}
      columnSpacing={columnSpacing}
      columns={columns}
      direction={direction}
      justifyContent={justifyContent}
      alignItems={alignItems}
      wrap={wrap}
      className={className}
      style={style}
      glass={glass}
      {...rest}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement<GridItemProps & { parentColumns?: number }>(child) && child.type === (Grid as any).Item) {
          return React.cloneElement(child, {
            parentColumns: columns,
          });
        }
        return child;
      })}
    </GridContainer>
  );
});

/**
 * Grid Item component
 */
const GridItem = forwardRef<HTMLDivElement, GridItemProps & { parentColumns?: number }>(
  function GridItem(props, ref) {
    const {
      xs,
      sm,
      md,
      lg,
      xl,
      cols,
      direction,
      justifyContent,
      alignItems,
      className,
      style,
      component = 'div',
      parentColumns = 12,
      children,
      ...rest
    } = props;

    return (
      <GridItemStyled
        as={component}
        ref={ref}
        xs={xs}
        sm={sm}
        md={md}
        lg={lg}
        xl={xl}
        cols={cols}
        direction={direction}
        justifyContent={justifyContent}
        alignItems={alignItems}
        className={className}
        style={style}
        parentColumns={parentColumns}
        {...rest}
      >
        {children}
      </GridItemStyled>
    );
  }
);

// Create the Grid component with Item as a static property
const Grid = GridBase as unknown as GridComponent;
Grid.Item = GridItem;

// Export the Grid component
export { Grid };
export default Grid;
