/**
 * TabItem Component
 * 
 * Represents a single tab in the tab bar.
 */
import React, { forwardRef } from 'react';
import { TabItem as StyledTabItem, TabIcon } from '../styled';
import TabBadge from './TabBadge';
import { TabItem as TabItemType, BadgeAnimationType, BadgeAnimationOptions } from '../types';

interface TabItemComponentProps {
  tab: TabItemType;
  index: number;
  isActive: boolean;
  isMoreTab: boolean;
  orientation: string;
  variant: string;
  color: string;
  fullWidth: boolean;
  alignment: string;
  glassVariant: string;
  animationStyle?: string;
  iconPosition?: string;
  tabStyle?: any;
  showLabels: boolean;
  magneticProgress?: number;
  handleClick: (e: React.MouseEvent<HTMLButtonElement>, index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
  handleContextMenu?: (e: React.MouseEvent, index: number) => void;
  tabClassName?: string;
  activeTabClassName?: string;
  keyboardNavigation?: boolean;
  tabIndex?: number;
  defaultBadgeAnimation?: BadgeAnimationType | BadgeAnimationOptions;
  badgeStyle?: any;
  showCollapsedMenu?: boolean;
}

const TabItemComponent = forwardRef<HTMLButtonElement, TabItemComponentProps>(({
  tab,
  index,
  isActive,
  isMoreTab,
  orientation,
  variant,
  color,
  fullWidth,
  alignment,
  glassVariant,
  animationStyle,
  iconPosition,
  tabStyle,
  showLabels,
  magneticProgress,
  handleClick,
  handleKeyDown,
  handleContextMenu,
  tabClassName,
  activeTabClassName,
  keyboardNavigation,
  tabIndex,
  defaultBadgeAnimation,
  badgeStyle,
  showCollapsedMenu
}, ref) => {
  return (
    <StyledTabItem
      ref={ref}
      $active={isActive}
      $orientation={orientation}
      $variant={variant}
      $color={color}
      $fullWidth={fullWidth}
      $alignment={alignment}
      $glassVariant={glassVariant}
      $animationStyle={animationStyle}
      $iconPosition={iconPosition}
      $tabStyle={tabStyle}
      $magneticProgress={
        !isMoreTab && 
        magneticProgress !== undefined &&
        !isActive 
          ? magneticProgress 
          : undefined
      }
      disabled={tab.disabled}
      onClick={e => handleClick(e, index)}
      onKeyDown={e => handleKeyDown(e, index)}
      onContextMenu={handleContextMenu && !isMoreTab ? e => handleContextMenu(e, index) : undefined}
      className={`${tab.className || ''} ${tabClassName || ''} ${isActive && activeTabClassName ? activeTabClassName : ''} ${isMoreTab ? 'more-menu-tab' : ''}`}
      style={tab.style}
      aria-selected={isActive}
      aria-controls={isMoreTab ? undefined : `tab-panel-${tab.id || index}`}
      id={`tab-${tab.id || index}`}
      role="tab"
      tabIndex={isActive ? 0 : (keyboardNavigation ? -1 : tabIndex)}
      aria-disabled={tab.disabled}
      aria-haspopup={isMoreTab ? 'true' : undefined}
      aria-expanded={isMoreTab ? showCollapsedMenu : undefined}
    >
      {tab.icon && (
        <TabIcon 
          $showLabel={showLabels && !!tab.label} 
          $orientation={orientation} 
          $iconPosition={iconPosition}
        >
          {tab.icon}
        </TabIcon>
      )}
      {(showLabels || !tab.icon) && tab.label}
      {/* Render badge for normal tab or "More" tab */}
      {tab.badge && (
        <TabBadge 
          value={tab.badge}
          color={color}
          animation={isMoreTab ? (defaultBadgeAnimation || 'pulse') : (tab.badgeAnimation || defaultBadgeAnimation)}
          hidden={!isMoreTab && tab.badgeHidden}
          $borderRadius={badgeStyle?.borderRadius}
          $size={badgeStyle?.size}
          $padding={badgeStyle?.padding}
          $fontSize={badgeStyle?.fontSize}
          $fontWeight={badgeStyle?.fontWeight}
          $boxShadow={badgeStyle?.boxShadow}
          $margin={badgeStyle?.margin}
          $backgroundColor={badgeStyle?.backgroundColor}
          $textColor={badgeStyle?.color}
        />
      )}
    </StyledTabItem>
  );
});

TabItemComponent.displayName = 'TabItem';

export default TabItemComponent;