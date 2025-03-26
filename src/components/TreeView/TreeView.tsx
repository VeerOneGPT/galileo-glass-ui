/**
 * Glass TreeView Component
 *
 * A hierarchical list with collapsible items.
 */
import React, { forwardRef, useState, useCallback, useMemo, createContext } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

import { TreeViewProps, TreeViewContextProps } from './types';

// Create context for TreeView state
export const TreeViewContext = createContext<TreeViewContextProps | null>(null);

// Styled components
const TreeViewRoot = styled.ul<{
  $glass: boolean;
  $color: string;
  $disabled: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  list-style: none;
  margin: 0;
  padding: 0;
  outline: 0;
  width: 100%;

  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      borderOpacity: 'subtle',
      themeContext: createThemeContext(props.theme),
    })}

  /* Glass styling */
  ${props =>
    props.$glass &&
    `
    border-radius: 8px;
    padding: 8px;
  `}
  
  /* Color variations */
  ${props => {
    switch (props.$color) {
      case 'primary':
        return `--tree-view-color: rgba(99, 102, 241, 0.9);`;
      case 'secondary':
        return `--tree-view-color: rgba(156, 39, 176, 0.9);`;
      case 'error':
        return `--tree-view-color: rgba(240, 82, 82, 0.9);`;
      case 'info':
        return `--tree-view-color: rgba(3, 169, 244, 0.9);`;
      case 'success':
        return `--tree-view-color: rgba(76, 175, 80, 0.9);`;
      case 'warning':
        return `--tree-view-color: rgba(255, 152, 0, 0.9);`;
      case 'default':
      default:
        return `--tree-view-color: rgba(255, 255, 255, 0.9);`;
    }
  }}
  
  /* Size variations */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `font-size: 0.8125rem;`;
      case 'large':
        return `font-size: 1rem;`;
      case 'medium':
      default:
        return `font-size: 0.875rem;`;
    }
  }}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.6;
    pointer-events: none;
  `}
`;

/**
 * TreeView Component Implementation
 */
function TreeViewComponent(props: TreeViewProps, ref: React.ForwardedRef<HTMLUListElement>) {
  const {
    defaultExpanded = [],
    defaultSelected = [],
    defaultFocused = '',
    expanded: controlledExpanded,
    selected: controlledSelected,
    multiSelect = false,
    onNodeToggle,
    onNodeSelect,
    onNodeFocus,
    children,
    className,
    style,
    glass = false,
    color = 'default',
    size = 'medium',
    disabled = false,
    ...rest
  } = props;

  // State for uncontrolled component
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpanded);
  const [internalSelected, setInternalSelected] = useState<string[]>(
    multiSelect ? defaultSelected : defaultSelected.length ? [defaultSelected[0]] : []
  );
  const [internalFocused, setInternalFocused] = useState<string | null>(defaultFocused || null);

  // Determine if component is controlled
  const isExpandedControlled = controlledExpanded !== undefined;
  const isSelectedControlled = controlledSelected !== undefined;

  // Get values based on controlled/uncontrolled state
  const expanded = isExpandedControlled ? controlledExpanded : internalExpanded;
  const selected = isSelectedControlled
    ? Array.isArray(controlledSelected)
      ? controlledSelected
      : [controlledSelected].filter(Boolean)
    : internalSelected;

  // Toggle node expansion
  const toggleNode = useCallback(
    (event: React.SyntheticEvent, nodeId: string) => {
      const newExpanded = expanded.includes(nodeId)
        ? expanded.filter(id => id !== nodeId)
        : [...expanded, nodeId];

      if (!isExpandedControlled) {
        setInternalExpanded(newExpanded);
      }

      if (onNodeToggle) {
        onNodeToggle(event, newExpanded);
      }
    },
    [expanded, isExpandedControlled, onNodeToggle]
  );

  // Select node
  const selectNode = useCallback(
    (event: React.SyntheticEvent, nodeId: string) => {
      let newSelected: string[];

      if (multiSelect) {
        newSelected = selected.includes(nodeId)
          ? selected.filter(id => id !== nodeId)
          : [...selected, nodeId];
      } else {
        newSelected = [nodeId];
      }

      if (!isSelectedControlled) {
        setInternalSelected(newSelected);
      }

      if (onNodeSelect) {
        onNodeSelect(event, multiSelect ? newSelected : nodeId);
      }
    },
    [selected, isSelectedControlled, onNodeSelect, multiSelect]
  );

  // Focus node
  const focusNode = useCallback(
    (event: React.SyntheticEvent, nodeId: string) => {
      setInternalFocused(nodeId);

      if (onNodeFocus) {
        onNodeFocus(event, nodeId);
      }
    },
    [onNodeFocus]
  );

  // Create context value
  const contextValue = useMemo<TreeViewContextProps>(
    () => ({
      expanded,
      selected,
      focused: internalFocused,
      multiSelect,
      size,
      disabled,
      glass,
      selectNode,
      toggleNode,
      focusNode,
    }),
    [
      expanded,
      selected,
      internalFocused,
      multiSelect,
      size,
      disabled,
      glass,
      selectNode,
      toggleNode,
      focusNode,
    ]
  );

  return (
    <TreeViewContext.Provider value={contextValue}>
      <TreeViewRoot
        ref={ref}
        role="tree"
        className={className}
        style={style}
        $glass={glass}
        $color={color}
        $disabled={disabled}
        $size={size}
        aria-multiselectable={multiSelect}
        {...rest}
      >
        {children}
      </TreeViewRoot>
    </TreeViewContext.Provider>
  );
}

/**
 * TreeView Component
 *
 * A hierarchical list with collapsible items.
 */
const TreeView = forwardRef(TreeViewComponent);

/**
 * GlassTreeView Component
 *
 * Glass variant of the TreeView component.
 */
const GlassTreeView = forwardRef<HTMLUListElement, TreeViewProps>((props, ref) => (
  <TreeView {...props} glass={true} ref={ref} />
));

GlassTreeView.displayName = 'GlassTreeView';

export default TreeView;
export { TreeView, GlassTreeView };
