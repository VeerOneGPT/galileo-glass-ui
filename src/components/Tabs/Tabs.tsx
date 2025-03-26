import React, { useState, useEffect, useRef, Children, forwardRef } from 'react';
import styled from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, slideRight } from '../../animations/keyframes/basic';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

export interface TabsProps {
  /**
   * The currently selected tab index
   */
  value?: number;

  /**
   * Callback fired when the value changes
   */
  onChange?: (event: React.SyntheticEvent, value: number) => void;

  /**
   * The content of the component - should be Tab components
   */
  children: React.ReactNode;

  /**
   * The variant of the tabs
   */
  variant?: 'standard' | 'fullWidth' | 'scrollable';

  /**
   * The orientation of the tabs
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * The color of the tabs
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

  /**
   * The appearance of the tabs
   */
  appearance?: 'default' | 'glass' | 'elevated' | 'minimal';

  /**
   * The size of the tabs
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * If true, adds animation to the tab indicator
   */
  animated?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;
}

export interface TabProps {
  /**
   * The label of the tab
   */
  label: string | React.ReactNode;

  /**
   * If true, the tab will be disabled
   */
  disabled?: boolean;

  /**
   * Icon element shown before the label
   */
  icon?: React.ReactNode;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Callback fired when the tab is clicked
   */
  onClick?: (event: React.MouseEvent) => void;

  /**
   * The content of the tab panel
   */
  children?: React.ReactNode;
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
      return '#6366F1';
  }
};

// Styled components
const TabsContainer = styled.div<{
  $orientation: 'horizontal' | 'vertical';
  $appearance: 'default' | 'glass' | 'elevated' | 'minimal';
}>`
  display: flex;
  flex-direction: ${props => (props.$orientation === 'horizontal' ? 'column' : 'row')};
  width: 100%;

  /* Glass appearance styling */
  ${props =>
    props.$appearance === 'glass' &&
    glassSurface({
      elevation: 1,
      blurStrength: 'standard',
      backgroundOpacity: 'subtle',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}

  /* Elevated appearance styling */
  ${props =>
    props.$appearance === 'elevated' &&
    `
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  `}
  
  /* Minimal appearance styling */
  ${props =>
    props.$appearance === 'minimal' &&
    `
    background: transparent;
  `}
  
  /* Default appearance styling */
  ${props =>
    props.$appearance === 'default' &&
    `
    background-color: #F9FAFB;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  `}
`;

const TabListContainer = styled.div<{
  $orientation: 'horizontal' | 'vertical';
  $variant: 'standard' | 'fullWidth' | 'scrollable';
}>`
  display: flex;
  flex-direction: ${props => (props.$orientation === 'horizontal' ? 'row' : 'column')};

  ${props =>
    props.$variant === 'fullWidth' &&
    props.$orientation === 'horizontal' &&
    `
    > * {
      flex: 1;
    }
  `}

  ${props =>
    props.$variant === 'scrollable' &&
    props.$orientation === 'horizontal' &&
    `
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  `}
  
  position: relative;
`;

const StyledTab = styled.button<{
  $selected: boolean;
  $disabled: boolean;
  $orientation: 'horizontal' | 'vertical';
  $color: string;
  $size: 'small' | 'medium' | 'large';
  $appearance: 'default' | 'glass' | 'elevated' | 'minimal';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  text-decoration: none;
  outline: 0;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  transition: color 0.2s ease, background-color 0.2s ease;
  position: relative;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  overflow: hidden;

  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 6px 12px;
          font-size: 0.8125rem;
          min-height: 32px;
        `;
      case 'large':
        return `
          padding: 12px 24px;
          font-size: 0.9375rem;
          min-height: 48px;
        `;
      default: // medium
        return `
          padding: 10px 16px;
          font-size: 0.875rem;
          min-height: 40px;
        `;
    }
  }}

  /* Selected state styling */
  color: ${props => (props.$selected ? getColorByName(props.$color) : 'rgba(0, 0, 0, 0.6)')};

  /* Hover state */
  &:hover {
    ${props =>
      !props.$disabled &&
      !props.$selected &&
      `
      color: rgba(0, 0, 0, 0.87);
      background-color: rgba(0, 0, 0, 0.04);
    `}
  }

  /* Glass appearance styling for selected tab */
  ${props =>
    props.$appearance === 'glass' &&
    props.$selected &&
    glassSurface({
      elevation: 1,
      blurStrength: 'minimal',
      backgroundOpacity: 'subtle',
      borderOpacity: 'medium',
      themeContext: createThemeContext({}),
    })}

  /* Selected tab glow effect */
  ${props =>
    props.$selected &&
    !props.$disabled &&
    glassGlow({
      intensity: 'low',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Orientation-specific styles */
  ${props =>
    props.$orientation === 'vertical' &&
    `
    justify-content: flex-start;
    width: 100%;
  `}
`;

const TabIcon = styled.span`
  display: flex;
  margin-right: 8px;
`;

const TabLabel = styled.span`
  display: flex;
`;

const TabIndicator = styled.span<{
  $left: number;
  $top: number;
  $width: number;
  $height: number;
  $color: string;
  $orientation: 'horizontal' | 'vertical';
  $animated: boolean;
}>`
  position: absolute;
  background-color: ${props => getColorByName(props.$color)};
  transition: ${props =>
    props.$animated
      ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none'};

  ${props =>
    props.$orientation === 'horizontal'
      ? `
      bottom: 0;
      left: ${props.$left}px;
      width: ${props.$width}px;
      height: 2px;
    `
      : `
      left: 0;
      top: ${props.$top}px;
      width: 2px;
      height: ${props.$height}px;
    `}

  border-radius: 1px;
  box-shadow: 0 0 4px ${props => getColorByName(props.$color)}80;
`;

const TabPanelsContainer = styled.div<{
  $animated: boolean;
}>`
  margin-top: 16px;

  ${props =>
    props.$animated &&
    accessibleAnimation({
      animation: fadeIn,
      duration: 0.3,
      easing: 'ease-out',
    })}
`;

/**
 * Tab Component
 *
 * Individual tab within a Tabs component
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps>((props, ref) => {
  const { label, disabled = false, icon, className, onClick, children, ...rest } = props;

  return (
    <button ref={ref} className={className} disabled={disabled} onClick={onClick} {...rest}>
      {icon && <TabIcon>{icon}</TabIcon>}
      <TabLabel>{label}</TabLabel>
    </button>
  );
});

Tab.displayName = 'Tab';

/**
 * TabPanel Component
 *
 * Content associated with a tab
 */
export const TabPanel = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    value: number;
    index: number;
    className?: string;
  }
>((props, ref) => {
  const { children, value, index, className, ...rest } = props;

  return (
    <div
      ref={ref}
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={className}
      {...rest}
    >
      {value === index && children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

/**
 * Tabs Component
 *
 * Container for a set of tabs and tab panels
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const {
    value = 0,
    onChange,
    children,
    variant = 'standard',
    orientation = 'horizontal',
    color = 'primary',
    appearance = 'default',
    size = 'medium',
    animated = true,
    className,
    ...rest
  } = props;

  const [tabRefs, setTabRefs] = useState<Map<number, HTMLElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const tabListRef = useRef<HTMLDivElement>(null);

  // Update indicator position when selected tab changes
  useEffect(() => {
    const selectedTabElement = tabRefs.get(value);
    if (selectedTabElement && tabListRef.current) {
      const tabRect = selectedTabElement.getBoundingClientRect();
      const tabListRect = tabListRef.current.getBoundingClientRect();

      if (orientation === 'horizontal') {
        setIndicatorStyle({
          left: selectedTabElement.offsetLeft,
          top: 0,
          width: tabRect.width,
          height: 2,
        });
      } else {
        setIndicatorStyle({
          left: 0,
          top: selectedTabElement.offsetTop,
          width: 2,
          height: tabRect.height,
        });
      }
    }
  }, [value, tabRefs, orientation]);

  // Handle tab selection
  const handleTabClick = (index: number, event: React.MouseEvent) => {
    if (onChange) {
      onChange(event, index);
    }
  };

  // Collect tab elements and properties
  const tabs: React.ReactElement[] = [];
  const tabPanels: React.ReactElement[] = [];

  Children.forEach(children, (child: React.ReactElement | null, index) => {
    if (!React.isValidElement(child)) return;

    // Check if component type is Tab using proper type guards
    const isTabComponent =
      typeof child.type === 'function' &&
      (child.type === Tab || (child.type as any).displayName === 'Tab');

    // Check if component type is TabPanel using proper type guards
    const isTabPanelComponent =
      typeof child.type === 'function' &&
      (child.type === TabPanel || (child.type as any).displayName === 'TabPanel');

    if (isTabComponent) {
      // Type assertion for props to handle them safely with TypeScript
      const childProps = child.props as TabProps;

      const tabProps = {
        key: `tab-${index}`,
        ref: (node: HTMLElement | null) => {
          if (node) {
            setTabRefs(prev => new Map(prev).set(index, node));
          }
        },
        'aria-selected': value === index,
        'aria-controls': `tabpanel-${index}`,
        id: `tab-${index}`,
        role: 'tab',
        onClick: (event: React.MouseEvent) => {
          handleTabClick(index, event);
          if (childProps.onClick) {
            childProps.onClick(event);
          }
        },
        label: childProps.label,
        disabled: childProps.disabled,
        icon: childProps.icon,
        className: childProps.className,
      };

      tabs.push(React.cloneElement(child, tabProps));

      // Check if children exist with type guard
      if (childProps.children) {
        tabPanels.push(
          <TabPanel key={`tabpanel-${index}`} value={value} index={index}>
            {childProps.children}
          </TabPanel>
        );
      }
    } else if (isTabPanelComponent) {
      // Type assertion for TabPanel props
      const panelProps = {
        key: `tabpanel-${index}`,
        value,
        index,
        children: (child.props as { children?: React.ReactNode }).children,
      };

      tabPanels.push(React.cloneElement(child, panelProps));
    }
  });

  return (
    <TabsContainer
      ref={ref}
      className={className}
      $orientation={orientation}
      $appearance={appearance}
      {...rest}
    >
      <TabListContainer
        ref={tabListRef}
        role="tablist"
        $orientation={orientation}
        $variant={variant}
      >
        {tabs.map((tab, index) => (
          <StyledTab
            key={tab.key}
            $selected={value === index}
            $disabled={tab.props.disabled || false}
            $orientation={orientation}
            $color={color}
            $size={size}
            $appearance={appearance}
            {...tab.props}
          >
            {tab.props.icon && <TabIcon>{tab.props.icon}</TabIcon>}
            <TabLabel>{tab.props.label}</TabLabel>
          </StyledTab>
        ))}

        <TabIndicator
          $left={indicatorStyle.left}
          $top={indicatorStyle.top}
          $width={indicatorStyle.width}
          $height={indicatorStyle.height}
          $color={color}
          $orientation={orientation}
          $animated={animated}
        />
      </TabListContainer>

      <TabPanelsContainer $animated={animated}>{tabPanels}</TabPanelsContainer>
    </TabsContainer>
  );
});

Tabs.displayName = 'Tabs';

/**
 * GlassTabs Component
 *
 * A tabs component with glass morphism styling
 */
export const GlassTabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const { className, appearance = 'glass', ...rest } = props;

  return (
    <Tabs ref={ref} className={`glass-tabs ${className || ''}`} appearance={appearance} {...rest} />
  );
});

GlassTabs.displayName = 'GlassTabs';

/**
 * GlassTab Component
 *
 * A tab component with glass morphism styling
 */
export const GlassTab = forwardRef<HTMLButtonElement, TabProps>((props, ref) => {
  const { className, ...rest } = props;

  return <Tab ref={ref} className={`glass-tab ${className || ''}`} {...rest} />;
});

GlassTab.displayName = 'GlassTab';
