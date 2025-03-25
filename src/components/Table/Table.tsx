import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';

export interface TableProps {
  /**
   * The content of the table
   */
  children: React.ReactNode;
  
  /**
   * If true, the table will take up the full width of its container
   */
  fullWidth?: boolean;
  
  /**
   * If true, table cells will have equal width
   */
  equalColumnWidth?: boolean;
  
  /**
   * If true, table rows will have alternating background colors
   */
  striped?: boolean;
  
  /**
   * If true, apply hover effect to table rows
   */
  hover?: boolean;
  
  /**
   * Border style for the table
   */
  borderStyle?: 'none' | 'horizontal' | 'vertical' | 'all';
  
  /**
   * Size of the table cells
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * The variant of the table appearance
   */
  variant?: 'standard' | 'glass';
  
  /**
   * The color theme of the table
   */
  color?: 'primary' | 'secondary' | 'default';
  
  /**
   * If true, the table header will be sticky
   */
  stickyHeader?: boolean;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

export interface TableHeadProps {
  /**
   * The content of the table head
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

export interface TableBodyProps {
  /**
   * The content of the table body
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

export interface TableRowProps {
  /**
   * The content of the table row
   */
  children: React.ReactNode;
  
  /**
   * If true, the row will be highlighted
   */
  selected?: boolean;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

export interface TableCellProps {
  /**
   * The content of the table cell
   */
  children?: React.ReactNode;
  
  /**
   * The alignment of the cell content
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * If true, the cell will be a header cell
   */
  header?: boolean;
  
  /**
   * Colspan attribute for the cell
   */
  colSpan?: number;
  
  /**
   * Rowspan attribute for the cell
   */
  rowSpan?: number;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    default:
      return '#1F2937'; // default dark gray
  }
};

// Get padding based on size
const getPadding = (size: string): string => {
  switch (size) {
    case 'small':
      return '6px 10px';
    case 'large':
      return '16px 24px';
    default: // medium
      return '12px 16px';
  }
};

// Get font size based on size
const getFontSize = (size: string): string => {
  switch (size) {
    case 'small':
      return '0.75rem';
    case 'large':
      return '1rem';
    default: // medium
      return '0.875rem';
  }
};

// Styled components
const TableContainer = styled.table<{
  $fullWidth: boolean;
  $equalColumnWidth: boolean;
  $borderStyle: string;
  $size: string;
  $variant: string;
  $color: string;
  $striped: boolean;
  $hover: boolean;
  $stickyHeader: boolean;
}>`
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Inter', sans-serif;
  font-size: ${props => getFontSize(props.$size)};
  line-height: 1.5;
  
  /* Table cell padding */
  th, td {
    padding: ${props => getPadding(props.$size)};
    transition: background-color 0.2s;
  }
  
  /* Equal column width */
  ${props => props.$equalColumnWidth && css`
    table-layout: fixed;
  `}
  
  /* Border styles */
  ${props => {
    if (props.$borderStyle === 'all') {
      if (props.$variant === 'glass') {
        return css`
          th, td {
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
        `;
      }
      return css`
        th, td {
          border: 1px solid #E2E8F0;
        }
      `;
    }
    
    if (props.$borderStyle === 'horizontal') {
      if (props.$variant === 'glass') {
        return css`
          th, td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          }
        `;
      }
      return css`
        th, td {
          border-bottom: 1px solid #E2E8F0;
        }
      `;
    }
    
    if (props.$borderStyle === 'vertical') {
      if (props.$variant === 'glass') {
        return css`
          th:not(:last-child), td:not(:last-child) {
            border-right: 1px solid rgba(255, 255, 255, 0.15);
          }
        `;
      }
      return css`
        th:not(:last-child), td:not(:last-child) {
          border-right: 1px solid #E2E8F0;
        }
      `;
    }
    
    return '';
  }}
  
  /* Variant styles */
  ${props => {
    if (props.$variant === 'glass') {
      return css`
        background-color: rgba(255, 255, 255, 0.06);
        color: white;
        border-radius: 8px;
        overflow: hidden;
        
        /* Header styling */
        thead {
          background-color: rgba(31, 41, 55, 0.4);
        }
        
        /* Sticky header */
        ${props.$stickyHeader && css`
          thead th {
            position: sticky;
            top: 0;
            z-index: 2;
            background-color: rgba(31, 41, 55, 0.7);
            backdrop-filter: blur(10px);
          }
        `}
        
        /* Striped rows */
        ${props.$striped && css`
          tbody tr:nth-child(odd) {
            background-color: rgba(255, 255, 255, 0.03);
          }
        `}
        
        /* Hover effect */
        ${props.$hover && css`
          tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
        `}
        
        /* Selected row */
        tr.selected {
          background-color: ${`${getColorByName(props.$color)}20`} !important;
        }
      `;
    }
    
    // standard variant
    return css`
      background-color: white;
      color: #1F2937;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      /* Header styling */
      thead {
        background-color: #F8FAFC;
      }
      
      /* Sticky header */
      ${props.$stickyHeader && css`
        thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background-color: #F8FAFC;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}
      
      /* Striped rows */
      ${props.$striped && css`
        tbody tr:nth-child(odd) {
          background-color: #F8FAFC;
        }
      `}
      
      /* Hover effect */
      ${props.$hover && css`
        tbody tr:hover {
          background-color: #F1F5F9;
        }
      `}
      
      /* Selected row */
      tr.selected {
        background-color: ${`${getColorByName(props.$color)}15`} !important;
      }
    `;
  }}
  
  /* Glass effect for glass variant */
  ${props => props.$variant === 'glass' && glassSurface({
    elevation: 1,
    blurStrength: 'standard',
    backgroundOpacity: 'minimal',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({})
  })}
  
  /* Glass glow for glass variant */
  ${props => props.$variant === 'glass' && props.$color !== 'default' && glassGlow({
    intensity: 'minimal',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
  
  /* Edge highlight for glass variant */
  ${props => props.$variant === 'glass' && edgeHighlight({
    thickness: 1,
    opacity: 0.3,
    position: 'all',
    themeContext: createThemeContext({})
  })}
`;

const TableHeadContainer = styled.thead``;

const TableBodyContainer = styled.tbody``;

const TableRowContainer = styled.tr<{
  $selected: boolean;
}>`
  ${props => props.$selected && css`
    &.selected {
      background-color: inherit;
    }
  `}
`;

const TableCellContainer = styled.td<{
  $align: string;
  $header: boolean;
}>`
  text-align: ${props => props.$align};
  font-weight: ${props => props.$header ? '600' : '400'};
  
  ${props => props.$header && css`
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.75em;
  `}
`;

/**
 * Table Component
 * 
 * A component for displaying tabular data.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>((props, ref) => {
  const {
    children,
    fullWidth = true,
    equalColumnWidth = false,
    striped = false,
    hover = false,
    borderStyle = 'horizontal',
    size = 'medium',
    variant = 'standard',
    color = 'default',
    stickyHeader = false,
    className,
    ...rest
  } = props;
  
  return (
    <TableContainer
      ref={ref}
      className={className}
      $fullWidth={fullWidth}
      $equalColumnWidth={equalColumnWidth}
      $borderStyle={borderStyle}
      $size={size}
      $variant={variant}
      $color={color}
      $striped={striped}
      $hover={hover}
      $stickyHeader={stickyHeader}
      {...rest}
    >
      {children}
    </TableContainer>
  );
});

Table.displayName = 'Table';

/**
 * GlassTable Component
 * 
 * A table component with glass morphism styling.
 */
export const GlassTable = forwardRef<HTMLTableElement, TableProps>((props, ref) => {
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Table
      ref={ref}
      className={`glass-table ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassTable.displayName = 'GlassTable';

/**
 * TableHead Component
 * 
 * Table header component.
 */
export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>((props, ref) => {
  const { children, className, ...rest } = props;
  
  return (
    <TableHeadContainer
      ref={ref}
      className={className}
      {...rest}
    >
      {children}
    </TableHeadContainer>
  );
});

TableHead.displayName = 'TableHead';

/**
 * TableBody Component
 * 
 * Table body component.
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  const { children, className, ...rest } = props;
  
  return (
    <TableBodyContainer
      ref={ref}
      className={className}
      {...rest}
    >
      {children}
    </TableBodyContainer>
  );
});

TableBody.displayName = 'TableBody';

/**
 * TableRow Component
 * 
 * Table row component.
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>((props, ref) => {
  const { 
    children, 
    selected = false, 
    className, 
    ...rest 
  } = props;
  
  return (
    <TableRowContainer
      ref={ref}
      className={`${selected ? 'selected' : ''} ${className || ''}`}
      $selected={selected}
      {...rest}
    >
      {children}
    </TableRowContainer>
  );
});

TableRow.displayName = 'TableRow';

/**
 * TableCell Component
 * 
 * Table cell component.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>((props, ref) => {
  const { 
    children, 
    align = 'left', 
    header = false, 
    colSpan,
    rowSpan,
    className, 
    ...rest 
  } = props;
  
  // Render as th or td based on header prop
  const Component = header ? 'th' : 'td';
  
  return (
    <TableCellContainer
      as={Component}
      ref={ref}
      className={className}
      $align={align}
      $header={header}
      colSpan={colSpan}
      rowSpan={rowSpan}
      {...rest}
    >
      {children}
    </TableCellContainer>
  );
});

TableCell.displayName = 'TableCell';