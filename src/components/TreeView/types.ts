/**
 * TreeView Component Types
 *
 * Type definitions for the TreeView component.
 */

import React from 'react';

/**
 * TreeViewProps interface
 */
export interface TreeViewProps {
  /** The ids of the items that will be expanded by default */
  defaultExpanded?: string[];
  
  /** The ids of the items that will be selected by default */
  defaultSelected?: string[];
  
  /** The id of the item that will be focused by default */
  defaultFocused?: string;
  
  /** The ids of the items that are expanded */
  expanded?: string[];
  
  /** The ids of the items that are selected */
  selected?: string | string[];
  
  /** If true, multiple selection is allowed */
  multiSelect?: boolean;
  
  /** Callback fired when tree items are expanded/collapsed */
  onNodeToggle?: (event: React.SyntheticEvent, nodeIds: string[]) => void;
  
  /** Callback fired when tree items are selected/unselected */
  onNodeSelect?: (event: React.SyntheticEvent, nodeIds: string | string[]) => void;
  
  /** Callback fired when tree items are focused */
  onNodeFocus?: (event: React.SyntheticEvent, nodeId: string) => void;
  
  /** The children of the component */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** If true, applies glass morphism effect */
  glass?: boolean;
  
  /** The color of the component */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;
  
  /** The size of the component */
  size?: 'small' | 'medium' | 'large';
  
  /** If true, the component is disabled */
  disabled?: boolean;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * TreeItem interface
 */
export interface TreeItemProps {
  /** The id of the item */
  nodeId: string;
  
  /** The label of the item */
  label: React.ReactNode;
  
  /** The children of the item */
  children?: React.ReactNode;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** If true, applies glass morphism effect */
  glass?: boolean;
  
  /** The color of the component */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;
  
  /** The icon to display next to the item */
  icon?: React.ReactNode;
  
  /** The icon to display next to the item when expanded */
  expandIcon?: React.ReactNode;
  
  /** The icon to display next to the item when collapsed */
  collapseIcon?: React.ReactNode;
  
  /** The icon to display next to the item when it has no children */
  endIcon?: React.ReactNode;
  
  /** If true, the component is disabled */
  disabled?: boolean;
  
  /** If true, the item will be expanded by default */
  defaultExpanded?: boolean;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * TreeView context interface
 */
export interface TreeViewContextProps {
  /** The ids of the expanded nodes */
  expanded: string[];
  
  /** The ids of the selected nodes */
  selected: string[];
  
  /** The id of the focused node */
  focused: string | null;
  
  /** If true, multiple selection is allowed */
  multiSelect: boolean;
  
  /** The size of the component */
  size: 'small' | 'medium' | 'large';
  
  /** If true, the component is disabled */
  disabled: boolean;
  
  /** If true, applies glass morphism effect */
  glass: boolean;
  
  /** Handle node selection */
  selectNode: (event: React.SyntheticEvent, nodeId: string) => void;
  
  /** Handle node toggle */
  toggleNode: (event: React.SyntheticEvent, nodeId: string) => void;
  
  /** Handle node focus */
  focusNode: (event: React.SyntheticEvent, nodeId: string) => void;
}