/**
 * MenuItem Component (Placeholder)
 *
 * A menu item component that displays a clickable option in a menu.
 */
import React, { forwardRef } from 'react';

// MenuItem Props
export interface MenuItemProps {
  /**
   * Callback fired when the menu item is clicked
   */
  onClick?: (event: React.MouseEvent<HTMLLIElement>) => void;

  /**
   * If true, the menu item is disabled
   */
  disabled?: boolean;

  /**
   * If true, the menu item is selected
   */
  selected?: boolean;

  /**
   * MenuItem content
   */
  children?: React.ReactNode;
}

// MenuItem Component (Placeholder)
const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(function MenuItem(props, ref) {
  return <li ref={ref}>MenuItem Placeholder</li>;
});

// GlassMenuItem Component (Placeholder)
const GlassMenuItem = forwardRef<HTMLLIElement, MenuItemProps>(function GlassMenuItem(props, ref) {
  return <li ref={ref}>GlassMenuItem Placeholder</li>;
});

export { MenuItem, GlassMenuItem };
export default MenuItem;
