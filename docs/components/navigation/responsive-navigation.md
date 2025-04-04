# ResponsiveNavigation

The `ResponsiveNavigation` component provides an adaptive navigation interface that automatically switches between desktop and mobile layouts based on screen width. It utilizes the underlying `GlassNavigation` component and adds responsive behavior with drawer functionality for mobile views.

## Import

```tsx
import { ResponsiveNavigation } from '@veerone/galileo-glass-ui';
import type { NavigationItem } from '@veerone/galileo-glass-ui'; // If you need the type
```

## Usage

```tsx
import React, { useState } from 'react';
import { ResponsiveNavigation } from '@veerone/galileo-glass-ui';
import { Icon } from '@veerone/galileo-glass-ui';

// Define your navigation items
const navItems = [
  { id: 'home', label: 'Home', icon: <Icon>home</Icon>, href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: <Icon>dashboard</Icon>, href: '/dashboard' },
  { id: 'settings', label: 'Settings', icon: <Icon>settings</Icon>, href: '/settings' },
];

// Create a simple logo component
const Logo = () => <div style={{ fontWeight: 'bold' }}>My App</div>;

function AppNavigation() {
  const [activeItem, setActiveItem] = useState('home');

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    // Add your navigation logic here
  };

  return (
    <ResponsiveNavigation
      items={navItems}
      activeItem={activeItem}
      onItemClick={handleItemClick}
      logo={<Logo />}
      mobileBreakpoint="md"
      useDrawer={true}
      mobileMenuPosition="left"
      mobileMenuLabel="Menu"
      position="top"
    />
  );
}
```

## Props

The `ResponsiveNavigation` component extends the props from `GlassNavigation` and adds responsive-specific props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mobileBreakpoint` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` | `'md'` | Screen width breakpoint at which to switch to mobile view. |
| `useDrawer` | `boolean` | `true` | Whether to use a slide-out drawer for mobile navigation. |
| `mobileMenuLabel` | `string` | `'Menu'` | Text label for the mobile menu button/drawer header. |
| `menuIcon` | `ReactNode` | `<Icon>menu</Icon>` | Custom icon for the mobile menu toggle button. |
| `useMinimalBefore` | `boolean` | `false` | Whether to use minimal variant before switching to mobile view. |
| `showLogoInMobile` | `boolean` | `true` | Whether to show the logo in mobile view. |
| `mobileMenuPosition` | `'left' \| 'right'` | `'left'` | Position from which the mobile drawer opens. |
| `mobileBackdropOpacity` | `number` | `0.5` | Opacity of the backdrop when mobile drawer is open. |
| `drawerWithHeader` | `boolean` | `true` | Whether to show a header in the mobile drawer. |
| `drawerWidth` | `string \| number` | `280` | Width of the mobile drawer. |

### GlassNavigation Props (Inherited)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavigationItem[]` | `[]` | Array of navigation items to display. |
| `activeItem` | `string` | `undefined` | ID of the currently active navigation item. |
| `onItemClick` | `(id: string) => void` | `undefined` | Callback when an item is clicked. |
| `position` | `'top' \| 'left' \| 'right' \| 'bottom'` | `'top'` | Position of the navigation. |
| `variant` | `'standard' \| 'minimal' \| 'prominent'` | `'standard'` | Style variant. |
| `logo` | `ReactNode` | `undefined` | Logo or brand component. |
| `actions` | `ReactNode` | `undefined` | Additional actions to display. |
| `showDivider` | `boolean` | `false` | Whether to show a divider. |
| `glassIntensity` | `number` | `0.7` | Glass effect intensity (0-1). |
| `sticky` | `boolean` | `false` | Whether the nav is sticky. |
| `maxWidth` | `string \| number` | `undefined` | Maximum width of the container. |
| `compact` | `boolean` | `false` | Whether to use compact design. |
| `centered` | `boolean` | `false` | Whether to use centered layout. |
| `zIndex` | `number` | `100` | Custom z-index. |
| `width` | `string \| number` | `'240px'` | Width for side navigation. |
| `collapsible` | `boolean` | `false` | Whether the navigation is collapsible. |
| `initialExpandedItems` | `string[]` | `[]` | Initial state for collapsible items. |

## NavigationItem Interface

```tsx
interface NavigationItem {
  /** Unique identifier for the item */
  id: string;
  
  /** Display text for the item */
  label: string;
  
  /** Optional icon to display */
  icon?: React.ReactNode;
  
  /** Optional URL for the item */
  href?: string;
  
  /** Whether the item is disabled */
  disabled?: boolean;
  
  /** Whether the item is active (alternative to using activeItem prop) */
  active?: boolean;
  
  /** Optional nested navigation items */
  children?: NavigationItem[];
  
  /** Optional badge content (notifications, etc.) */
  badge?: string | number;
  
  /** Custom click handler */
  onClick?: () => void;
  
  /** Whether the link opens in a new tab (requires href) */
  external?: boolean;
  
  /** Additional CSS class for the item */
  className?: string;
  
  /** Tooltip text for the item */
  tooltip?: string;
  
  /** Custom element to render instead of default item */
  customElement?: React.ReactNode;
}
```

## Physics-Based Animation

The `ResponsiveNavigation` component includes several physics-based animations:

1. **Drawer Animation**: The mobile drawer uses physics-based spring animations for smooth, natural opening and closing transitions.

2. **Active Item Indicator**: The active item indicator (inherited from `GlassNavigation`) uses physics-based animations to move between items with a natural, spring-like motion.

3. **Collapsible Items**: When expanding/collapsing nested navigation items, physics-based animations provide fluid transitions.

The component respects the user's motion preferences by checking for the `prefers-reduced-motion` media query.

## Examples

### Top Navigation with Mobile Drawer

```tsx
<ResponsiveNavigation
  items={navItems}
  activeItem="dashboard"
  onItemClick={handleItemClick}
  position="top"
  mobileBreakpoint="md"
  useDrawer={true}
  logo={<Logo />}
/>
```

### Side Navigation with Custom Mobile Menu Position

```tsx
<ResponsiveNavigation
  items={navItems}
  activeItem="settings"
  onItemClick={handleItemClick}
  position="left"
  mobileBreakpoint="lg"
  mobileMenuPosition="right"
  useDrawer={true}
  width={280}
/>
```

### With Custom Menu Icon and Minimal Before Mobile

```tsx
<ResponsiveNavigation
  items={navItems}
  activeItem="profile"
  onItemClick={handleItemClick}
  menuIcon={<Icon>menu_open</Icon>}
  useMinimalBefore={true}
  mobileBreakpoint="sm"
/>
```

## Accessibility

The `ResponsiveNavigation` component implements several accessibility features:

- Proper ARIA attributes for navigation elements
- Keyboard navigation support
- Focus management for mobile drawer
- Respect for user motion preferences

## Best Practices

1. **Consistent Active State**: Manage the `activeItem` state in your parent component to ensure consistent highlighting.

2. **Mobile Experience**: Test the mobile drawer experience at various screen sizes.

3. **Logo Usage**: Provide a logo for better branding, especially in mobile views.

4. **Icons**: Use icons for all navigation items to improve usability in minimal and mobile views.

5. **Responsive Adjustments**: Consider using `useMinimalBefore` to create a graduated responsive experience.

## Related Components

- `GlassNavigation`: The base navigation component used internally
- `ZSpaceAppLayout`: A layout component that can incorporate ResponsiveNavigation
- `Drawer`: Used internally for the mobile menu
