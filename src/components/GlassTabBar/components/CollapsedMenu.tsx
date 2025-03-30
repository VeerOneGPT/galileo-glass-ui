/**
 * CollapsedMenu Component
 * 
 * Displays a dropdown menu for tabs that don't fit in the tab bar.
 */
import React, { useRef, useEffect } from 'react';
import { CollapsedMenu as StyledCollapsedMenu, CollapsedMenuItem } from '../styled';
import { CollapsedMenuProps, TabItem } from '../types';

/**
 * Default collapsed menu implementation
 */
const CollapsedMenu: React.FC<CollapsedMenuProps> = ({ 
  tabs, 
  activeTab, 
  onSelect, 
  open, 
  onClose,
  color,
  orientation,
  variant,
  glassVariant
}) => {
  // Reference to the menu element for click outside detection
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);
  
  // Find the actual active tab index from the collapsed tabs
  const findCollapsedTabIndex = (tabs: TabItem[], globalActiveTab: number) => {
    // We need to find the actual index of the active tab within the collapsed menu
    if (globalActiveTab >= tabs.length) return -1;
    return tabs.findIndex(tab => tab.value === tabs[globalActiveTab]?.value);
  };
  
  // Determine if any of the collapsed tabs is the active tab
  const collapsedActiveTabIndex = findCollapsedTabIndex(tabs, activeTab);
  
  return (
    <StyledCollapsedMenu 
      ref={menuRef}
      $open={open} 
      $orientation={orientation}
      $variant={variant}
      $color={color}
      $glassVariant={glassVariant}
    >
      {tabs.map((tab, index) => (
        <CollapsedMenuItem
          key={tab.id || `collapsed-${index}`}
          $active={index === collapsedActiveTabIndex}
          $color={color}
          onClick={() => {
            onSelect(index);
            onClose();
          }}
          aria-selected={index === collapsedActiveTabIndex}
          role="tab"
        >
          {tab.icon && <span style={{ marginRight: '12px', display: 'inline-flex' }}>{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '0.75rem', 
              backgroundColor: `var(--color-${color})`,
              borderRadius: '10px',
              padding: '2px 6px',
              marginRight: '-6px'
            }}>
              {tab.badge}
            </span>
          )}
        </CollapsedMenuItem>
      ))}
    </StyledCollapsedMenu>
  );
};

export default CollapsedMenu;