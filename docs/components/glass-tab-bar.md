# GlassTabBar

The `GlassTabBar` component provides a versatile and interactive tabbed interface with physics-based animations, glass styling, and adaptive layouts. It supports horizontal and vertical orientations, various style variants, responsive designs, and advanced interactive features like magnetic selection and momentum scrolling.

## Import

```tsx
import { GlassTabBar } from '@veerone/galileo-glass-ui';
import type { TabItem } from '@veerone/galileo-glass-ui'; // If you need the type
```

## Usage

```tsx
import React, { useState } from 'react';
import { GlassTabBar } from '@veerone/galileo-glass-ui';
import { Card } from '@veerone/galileo-glass-ui';
import { Icon } from '@veerone/galileo-glass-ui';

function TabExample() {
  // Define your tabs
  const tabs = [
    { label: 'Home', value: 'home', icon: <Icon>home</Icon> },
    { label: 'Profile', value: 'profile', icon: <Icon>person</Icon> },
    { label: 'Settings', value: 'settings', icon: <Icon>settings</Icon> },
    { label: 'Notifications', value: 'notifications', icon: <Icon>notifications</Icon>, badge: 5 }
  ];

  // Set up state for active tab
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab change
  const handleTabChange = (event, index) => {
    setActiveTab(index);
  };

  return (
    <Card>
      <GlassTabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="pills"
        glassVariant="frosted"
        color="primary"
        animationStyle="spring"
        physics={{ tension: 280, friction: 26, mass: 1 }}
      />
      
      {/* Content for the active tab */}
      <div style={{ padding: '20px' }}>
        {activeTab === 0 && <div>Home Content</div>}
        {activeTab === 1 && <div>Profile Content</div>}
        {activeTab === 2 && <div>Settings Content</div>}
        {activeTab === 3 && <div>Notifications Content</div>}
      </div>
    </Card>
  );
}
```

## TabItem Interface

```tsx
interface TabItem {
  /** Tab unique identifier */
  id?: string;
  
  /** Tab label text */
  label: string;
  
  /** Tab value (used for identification) */
  value: string | number;
  
  /** Optional icon for the tab */
  icon?: React.ReactNode;
  
  /** Whether the tab is disabled */
  disabled?: boolean;
  
  /** Badge count or content */
  badge?: number | string;
  
  /** Controls how the badge animation behaves */
  badgeAnimation?: BadgeAnimationType | BadgeAnimationOptions;
  
  /** Whether the badge is hidden initially */
  badgeHidden?: boolean;
  
  /** Custom styling for this tab */
  style?: React.CSSProperties;
  
  /** Additional classes for this tab */
  className?: string;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabItem[]` | `[]` | **Required.** Array of tab items. |
| `activeTab` | `number` | `0` | Index of the currently active tab. |
| `onChange` | `(event, index) => void` | `undefined` | Callback when active tab changes. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab bar layout orientation. |
| `variant` | `'default' \| 'pills' \| 'buttons' \| 'underlined' \| 'enclosed'` | `'default'` | Tab bar style variant. |
| `glassVariant` | `'clear' \| 'frosted' \| 'tinted'` | `'frosted'` | Glass styling variant. |
| `blurStrength` | `'light' \| 'standard' \| 'strong'` | `'standard'` | Glass blur strength. |
| `animationStyle` | `'spring' \| 'magnetic' \| 'inertial' \| 'none'` | `'spring'` | Animation style for the selector. |
| `physics` | `{ tension?: number; friction?: number; mass?: number }` | `{ tension: 280, friction: 26, mass: 1 }` | Spring physics parameters. |
| `alignment` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'center'` | Alignment of tabs. |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'primary'` | Color variant. |
| `fullWidth` | `boolean` | `false` | Whether tabs should take full width. |
| `scrollable` | `boolean` | `true` | Enable scrolling for many tabs. |
| `showLabels` | `boolean` | `true` | Show labels (useful when using icons). |
| `elevated` | `boolean` | `false` | Add box shadow to tab bar. |
| `background` | `boolean` | `true` | Enable background for tab bar. |
| `width` | `string \| number` | `undefined` | Custom tab bar width. |
| `height` | `string \| number` | `undefined` | Custom tab bar height. |
| `borderRadius` | `string \| number` | `8` | Border radius for tab bar. |
| `className` | `string` | `undefined` | Additional CSS class. |
| `style` | `React.CSSProperties` | `undefined` | Additional inline styles. |
| `onContextMenu` | `(event, index) => void` | `undefined` | Callback when tab is right-clicked. |
| `renderTab` | `(tab, index, isActive) => ReactNode` | `undefined` | Custom tab renderer. |
| `iconPosition` | `'top' \| 'left' \| 'right'` | `'left'` | Icon position within tabs. |
| `verticalDisplayMode` | `'compact' \| 'expanded' \| 'icon-only'` | `'expanded'` | Display mode for vertical tabs. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Placement within a parent container. |
| `responsiveOrientation` | `{ base, breakpoint, belowBreakpoint }` | `undefined` | Configuration for responsive orientation changes. |
| `responsiveConfig` | `{ base?, small?, medium?, large? }` | `undefined` | Responsive behavior configuration. |
| `collapseTabs` | `boolean` | `false` | Collapse overflow tabs into a menu. |
| `renderCollapsedMenu` | `(tabs, activeTab, onSelect) => ReactNode` | `undefined` | Custom renderer for collapsed tabs menu. |
| `keyboardNavigation` | `boolean` | `true` | Enable keyboard navigation. |
| `tabIndex` | `number` | `0` | Tab index for keyboard accessibility. |
| `ariaLabel` | `string` | `'Tab Navigation'` | ARIA label for accessibility. |
| `tabStyle` | `TabStyleOptions` | `undefined` | Custom styles for tabs. |
| `tabClassName` | `string` | `undefined` | Custom class for all tabs. |
| `activeTabClassName` | `string` | `undefined` | Custom class for active tab. |
| `defaultBadgeAnimation` | `BadgeAnimationType \| BadgeAnimationOptions` | `undefined` | Default badge animation. |
| `badgeStyle` | `BadgeStyleOptions` | `undefined` | Custom badge styling. |

## Physics-Based Animations

The `GlassTabBar` component features several physics-based animations that create a natural and responsive interface:

1. **Active Tab Indicator**: The selector that highlights the active tab uses spring physics for smooth, natural transitions between tabs.

2. **Magnetic Selection**: When using the `'magnetic'` animation style, the tab selector creates a magnetic attraction effect as the cursor approaches tabs.

3. **Inertial Scrolling**: For scrollable tab bars, the component implements physics-based inertial scrolling with momentum and friction.

4. **Badge Animations**: Badges on tabs can be animated with physics-based effects like bounce, pulse, and shake.

The physics parameters can be customized through the `physics` prop:

```tsx
<GlassTabBar
  physics={{
    tension: 280,   // Higher value = stiffer spring
    friction: 26,   // Higher value = less bounce
    mass: 1         // Higher value = more inertia
  }}
  // ...other props
/>
```

## TabBarRef Methods

You can access component methods using a ref:

```tsx
import React, { useRef } from 'react';
import { GlassTabBar } from '@veerone/galileo-glass-ui';
import type { TabBarRef } from '@veerone/galileo-glass-ui';

function MyComponent() {
  const tabBarRef = useRef<TabBarRef>(null);
  
  const handleSomeAction = () => {
    // Programmatically select a tab
    tabBarRef.current?.selectTab(2);
    
    // Update a badge
    tabBarRef.current?.updateBadge(3, 10);
  };
  
  return (
    <GlassTabBar
      ref={tabBarRef}
      tabs={myTabs}
      activeTab={activeTab}
      onChange={handleChange}
    />
  );
}
```

Available methods:

- `getContainerElement()`: Get the container DOM element
- `getTabElements()`: Get all tab button elements
- `getTabElement(index)`: Get a specific tab element
- `selectTab(index)`: Programmatically select a tab
- `scrollToTab(index, smooth?)`: Scroll to bring a tab into view
- `toggleBadge(index, show)`: Show or hide a badge on a tab
- `updateBadge(index, value)`: Update badge content/count
- `isScrolling()`: Check if scrolling is active

## Examples

### Horizontal Pills With Icons

```tsx
<GlassTabBar
  tabs={tabsWithIcons}
  activeTab={activeTab}
  onChange={handleChange}
  variant="pills"
  color="primary"
  iconPosition="left"
  showLabels={true}
/>
```

### Vertical Tab Bar

```tsx
<GlassTabBar
  tabs={tabs}
  activeTab={activeTab}
  onChange={handleChange}
  orientation="vertical"
  variant="default"
  verticalDisplayMode="expanded"
  width={200}
  height={400}
/>
```

### Responsive Tab Bar

```tsx
<GlassTabBar
  tabs={tabs}
  activeTab={activeTab}
  onChange={handleChange}
  responsiveOrientation={{
    base: 'horizontal',
    breakpoint: 'md',
    belowBreakpoint: 'vertical'
  }}
  responsiveConfig={{
    base: { showLabels: true, iconPosition: 'left' },
    small: { showLabels: false, iconPosition: 'top' }
  }}
/>
```

### With Collapsing Tabs

```tsx
<GlassTabBar
  tabs={manyTabs}
  activeTab={activeTab}
  onChange={handleChange}
  collapseTabs={true}
  scrollable={true}
  variant="buttons"
/>
```

## Accessibility

The `GlassTabBar` component implements several accessibility features:

- Proper ARIA roles (`tablist`, `tab`, `tabpanel`)
- Keyboard navigation with arrow keys, Home, and End
- Focus management
- Support for screen readers through appropriate labeling
- Respect for user motion preferences

## Best Practices

1. **Consistent Content Height**: Try to maintain consistent height for tab content to avoid layout shifts.

2. **Tab Labels**: Keep tab labels concise and descriptive.

3. **Icon Usage**: When using icons, ensure they clearly represent the tab's purpose, especially if `showLabels` is set to `false`.

4. **Responsive Behavior**: Use the `responsiveOrientation` and `responsiveConfig` props to ensure a good experience across device sizes.

5. **Animation Preferences**: Respect user preferences by using `animationStyle="none"` when responding to `prefers-reduced-motion`.

## Related Components

- `GlassTabs`: A simpler tab component when you need basic tab functionality
- `GlassCard`: Pairs well as a container for tabs and tab content
- `Icon`: For adding icons to tabs
