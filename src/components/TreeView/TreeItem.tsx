/**
 * TreeItem Component
 *
 * A item component for the TreeView.
 */
import React, { forwardRef, useContext, useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useGalileoSprings, SpringsAnimationResult } from '../../hooks/useGalileoSprings';

import { TreeViewContext } from './TreeView';
import { TreeItemProps } from './types';

// Default icons
const DefaultExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
  </svg>
);

const DefaultCollapseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor" />
  </svg>
);

const DefaultEndIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

// Styled components
const TreeItemRoot = styled.li`
  list-style: none;
  margin: 0;
  padding: 0;
  outline: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TreeItemContent = styled.div<{
  $selected: boolean;
  $focused: boolean;
  $disabled: boolean;
  $glass: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  padding: ${props =>
    props.$size === 'small' ? '4px 8px' : props.$size === 'large' ? '8px 16px' : '6px 12px'};
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  user-select: none;
  transition: background-color 0.2s ease;
  color: ${props =>
    props.$disabled
      ? 'rgba(255, 255, 255, 0.5)'
      : props.$selected
      ? 'var(--tree-view-color, rgba(255, 255, 255, 0.9))'
      : 'rgba(255, 255, 255, 0.8)'};

  /* Selected state */
  background-color: ${props => (props.$selected ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};

  /* Focused state */
  ${props =>
    props.$focused &&
    !props.$disabled &&
    `
    outline: 1px dashed var(--tree-view-color, rgba(255, 255, 255, 0.9));
  `}

  /* Glass hover effect */
  ${props =>
    !props.$disabled &&
    `
    &:hover {
      background-color: ${props.$glass ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.04)'};
    }
  `}
`;

const ContentLabel = styled.div`
  flex: 1;
  margin-left: 4px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
`;

const TreeItemChildren = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  padding-left: 16px;
  overflow: hidden;
`;

/**
 * TreeItem Component Implementation
 */
function TreeItemComponent(props: TreeItemProps, ref: React.ForwardedRef<HTMLLIElement>) {
  const {
    nodeId,
    label,
    children,
    className,
    style,
    glass: propGlass,
    color,
    icon,
    expandIcon,
    collapseIcon,
    endIcon,
    disabled = false,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring, disableAnimation: contextDisableAnimation } = useAnimationContext();
  const finalDisableAnimation = disableAnimation ?? contextDisableAnimation ?? prefersReducedMotion;

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLUListElement>(null);

  // Get TreeView context
  const treeContext = useContext(TreeViewContext);

  if (!treeContext) {
    throw new Error('TreeItem must be used within a TreeView');
  }

  const {
    expanded,
    selected,
    focused,
    multiSelect,
    size,
    disabled: contextDisabled,
    glass: contextGlass,
    selectNode,
    toggleNode,
    focusNode,
  } = treeContext;

  // Merge props with context
  const finalGlass = propGlass !== undefined ? propGlass : contextGlass;
  const finalDisabled = disabled || contextDisabled;

  // Check if the node has children
  const hasChildren = Boolean(React.Children.count(children) > 0);

  // Check if the node is expanded
  const isExpanded = hasChildren && expanded.includes(nodeId);

  // Check if the node is selected
  const isSelected = selected.includes(nodeId);

  // Check if the node is focused
  const isFocused = focused === nodeId;

  // Animation Context and Config Calculation
  const finalSpringConfig = useMemo(() => {
    const baseConfig: SpringConfig = SpringPresets.DEFAULT;
    let contextConfig: Partial<SpringConfig> = {};
    if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
    } else if (typeof defaultSpring === 'object') {
      contextConfig = defaultSpring ?? {};
    }

    let propConfig: Partial<SpringConfig> = {};
    const propSource = animationConfig;
    if (typeof propSource === 'string' && propSource in SpringPresets) {
      propConfig = SpringPresets[propSource as keyof typeof SpringPresets];
    } else if (typeof propSource === 'object') {
      propConfig = propSource ?? {};
    }

    // Return merged config
    return { ...baseConfig, ...contextConfig, ...propConfig };

  }, [defaultSpring, animationConfig]);

  // State for measuring height
  const [measuredHeight, setMeasuredHeight] = useState<number | 'auto'>('auto');

  // UseLayoutEffect to measure height before animation
  useLayoutEffect(() => {
    let rafId: number | null = null;
    if (isExpanded && childrenRef.current) {
      // Use requestAnimationFrame to defer measurement slightly
      rafId = requestAnimationFrame(() => {
        if (childrenRef.current) { // Check ref again inside RAF
          const height = childrenRef.current.scrollHeight;
          setMeasuredHeight(height);
        }
      });
    } else {
        // Set to 0 when collapsed or no children
        setMeasuredHeight(0);
    }

    // Cleanup RAF on effect change or unmount
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isExpanded, children]); // Rerun when expansion state or children change

  // Define spring targets using useMemo
  const animationTargets = useMemo(() => ({
      // Use measuredHeight, ensuring it's a number for the spring
      height: isExpanded && typeof measuredHeight === 'number' ? measuredHeight : 0,
      opacity: isExpanded ? 1 : 0,
  }), [isExpanded, measuredHeight]);

  // Use useGalileoSprings hook for height and opacity animation
  const animatedStyle = useGalileoSprings(animationTargets, {
      config: finalSpringConfig,
      immediate: finalDisableAnimation, // Pass final disable state
      // onRest could be added here if needed after animation completes
  });

  // Handle click event
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    // Select the node
    if (!finalDisabled) {
      selectNode(event, nodeId);
    }
  };

  // Handle expand/collapse
  const handleToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    // Toggle the node
    if (!finalDisabled && hasChildren) {
      toggleNode(event, nodeId);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (finalDisabled) return;

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        selectNode(event, nodeId);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (hasChildren && !isExpanded) {
          toggleNode(event, nodeId);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (hasChildren && isExpanded) {
          toggleNode(event, nodeId);
        }
        break;
      default:
        break;
    }
  };

  // Handle focus
  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!finalDisabled) {
      focusNode(event, nodeId);
    }
  };

  // Determine which icon to show
  const renderToggleIcon = () => {
    if (!hasChildren) {
      return endIcon || <DefaultEndIcon />;
    }

    if (isExpanded) {
      return collapseIcon || <DefaultCollapseIcon />;
    }

    return expandIcon || <DefaultExpandIcon />;
  };

  return (
    <TreeItemRoot
      ref={ref}
      className={className}
      style={style}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      {...rest}
    >
      <TreeItemContent
        ref={contentRef}
        onClick={handleClick}
        onDoubleClick={handleToggle}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        tabIndex={finalDisabled ? -1 : 0}
        $selected={isSelected}
        $focused={isFocused}
        $disabled={finalDisabled}
        $glass={finalGlass}
        $size={size}
        aria-disabled={finalDisabled}
      >
        <IconContainer onClick={hasChildren ? handleToggle : undefined} style={{ cursor: hasChildren ? 'pointer' : 'default' }}>
          {renderToggleIcon()}
        </IconContainer>

        {icon && <IconContainer>{icon}</IconContainer>}

        <ContentLabel>{label}</ContentLabel>
      </TreeItemContent>

      {hasChildren && (
          <TreeItemChildren
            ref={childrenRef}
            role="group"
            key={`children-${nodeId}`}
            style={{
              ...animatedStyle, // Apply animated height and opacity
              // Add will-change for performance
              willChange: 'height, opacity',
            }}
          >
            {children}
          </TreeItemChildren>
        )}
    </TreeItemRoot>
  );
}

/**
 * TreeItem Component
 *
 * A item component for the TreeView.
 */
const TreeItem = forwardRef(TreeItemComponent);

/**
 * GlassTreeItem Component
 *
 * Glass variant of the TreeItem component.
 */
const GlassTreeItem = forwardRef<HTMLLIElement, TreeItemProps>((props, ref) => (
  <TreeItem {...props} glass={true} ref={ref} />
));

GlassTreeItem.displayName = 'GlassTreeItem';

export default TreeItem;
export { TreeItem, GlassTreeItem };
