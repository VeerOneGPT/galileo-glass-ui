# GlassTabs Component

**Status:** Core Component

## Overview

The `GlassTabs` component provides a tabbed interface with the signature Galileo Glass UI styling. It features smooth, **physics-based animation** for the active tab indicator (using `usePhysicsAnimation`) and supports keyboard navigation.

## Import

```typescript
import { GlassTabs } from '@veerone/galileo-glass-ui';
// Or
import { GlassTabs } from '@veerone/galileo-glass-ui/components';
```

## Usage

```typescript
import React, { useState } from 'react';
import { GlassTabs, GlassTabItem } from '@veerone/galileo-glass-ui';

const MyTabsComponent = () => {
  const tabItems: GlassTabItem[] = [
    {
      id: 'tab1',
      label: 'Profile',
      content: <div>Profile Content Here</div>,
    },
    {
      id: 'tab2',
      label: 'Settings',
      content: <div>Settings Content Here</div>,
    },
    {
      id: 'tab3',
      label: 'Notifications',
      content: <div>Notifications Content Here</div>,
    },
  ];

  const [activeTabId, setActiveTabId] = useState('tab1');

  return (
    <GlassTabs
      tabs={tabItems}
      defaultTab={activeTabId}
      onChange={setActiveTabId}
      // Optional: Customize indicator animation physics
      physics={{
        stiffness: 500,
        damping: 20,
        mass: 0.8
      }}
    />
  );
};

export default MyTabsComponent;
```

## API

### Props (`GlassTabsProps`)

| Prop         | Type                               | Required | Default                   | Description                                                                                                  |
| :----------- | :--------------------------------- | :------- | :------------------------ | :----------------------------------------------------------------------------------------------------------- |
| `tabs`       | `GlassTabItem[]`                   | Yes      |                           | An array of objects defining each tab's ID, label, and content.                                              |
| `defaultTab` | `string`                           | No       | First tab ID or ''        | The ID of the tab to be active initially.                                                                    |
| `onChange`   | `(tabId: string) => void`          | No       |                           | Callback function invoked when the active tab changes, receiving the new active tab ID.                    |
| `variant`    | `'equal' \| 'auto' \| 'scrollable'` | No       | `'equal'`                 | Controls tab sizing and behavior: `'equal'` (tabs share width), `'auto'` (tabs size to content), `'scrollable'` (`auto` + horizontal scrolling). |
| `verticalAlign` | `'top' \| 'center' \| 'bottom' \| 'stretch'` | No    | `'center'`              | Controls the vertical alignment of tabs within the tab list (`align-items`).                               |
| `className`  | `string`                           | No       | ''                        | Additional CSS class name(s) to apply to the root container element.                                         |
| `physics`    | `Partial<PhysicsAnimationProps>` | No       | `{ tension: 500, friction: 25, mass: 1 }` | Optional physics parameters (tension, friction, mass) for the active indicator's spring animation. |

### `GlassTabItem` Interface

```typescript
export interface GlassTabItem {
  id: string; // Unique identifier for the tab
  label: string; // Text label displayed on the tab button
  content: React.ReactNode; // React content to display when the tab is active
}
```

### Ref Handle (`GlassTabsRef`)

You can get a ref to the `GlassTabs` component to access imperative methods:

```typescript
export interface GlassTabsRef {
  getContainerElement: () => HTMLDivElement | null;
  getTabListElement: () => HTMLDivElement | null;
  setActiveTab: (tabId: string) => void;
  getActiveTab: () => string;
}
```

Usage:
```typescript
const tabsRef = useRef<GlassTabsRef>(null);

// ...

<GlassTabs ref={tabsRef} tabs={...} />

// Call methods later:
// tabsRef.current?.setActiveTab('tab2');
```

## Features

*   **Glass Styling:** Applies standard Galileo Glass surface effects to the tab list container.
*   **Physics-Based Indicator:** The underline/highlight indicating the active tab animates using the internal `usePhysicsAnimation` hook for smooth, configurable transitions. Customize the spring behavior (tension, friction, mass) via the `physics` prop.
*   **Accessibility:** Supports keyboard navigation (Left/Right arrows) between tabs and manages focus appropriately (`aria-selected`, `role="tab"`, etc.). Respects reduced motion preferences by disabling the indicator animation.
*   **Imperative Control:** Provides a `ref` handle to programmatically control the active tab.
*   **Layout Flexibility (New):** The `variant` prop allows control over how tabs fill the available space (`'equal'`) or size to their content (`'auto'`). The `'scrollable'` variant enables horizontal scrolling when tabs overflow.

## Integration Examples

### Standard Equal Width Tabs (Default)

```typescript
// All tabs will stretch to fill the container width equally.
<GlassTabs tabs={tabItems} />
```

### Auto-Width Tabs

```typescript
// Tabs will size based on their label content.
// If they collectively exceed container width, they might wrap or cause overflow
// depending on the parent container's flex properties.
<GlassTabs tabs={tabItems} variant="auto" />
```

### Scrollable Tabs

```typescript
// Tabs size based on content. If total width exceeds container, 
// the tab list becomes horizontally scrollable.
// Useful in constrained spaces like headers.
<GlassTabs tabs={tabItems} variant="scrollable" />
```

### Custom Styling

While direct style props are limited, you can customize `GlassTabs` using standard CSS techniques:

1.  **Targeting Class Names:** Apply styles to `.glass-tabs` (root), `.glass-tabs .tab-list`, `.glass-tabs .tab-button`, etc. (Inspect element for exact class names if needed).
2.  **Styled Components Wrapper:** Wrap `GlassTabs` with `styled()`:

    ```typescript
    import styled from 'styled-components';
    import { GlassTabs } from '@veerone/galileo-glass-ui';

    const CustomStyledTabs = styled(GlassTabs)`
      margin-bottom: 40px; // Override margin

      /* Target internal elements (use with caution) */
      button[role="tab"] { 
        font-size: 16px; 
      }
    `;

    // Usage
    <CustomStyledTabs tabs={tabItems} />
    ```

Remember that excessively specific overrides targeting internal structure might break with future library updates. 

### Variants (`variant`)

Controls how tabs are sized and handle overflow:

-   `'equal'` (Default): Tabs stretch equally to fill the container width.
-   `'auto'`: Tabs take their natural width based on content.
-   `'scrollable'`: Tabs take their natural width, and the container becomes scrollable if tabs overflow. **When overflowing, horizontal scroll buttons will appear automatically.**

### Vertical Alignment (`verticalAlign`)

Controls the vertical alignment of tab items within the list container. Accepts standard CSS `align-items` values like `'center'`, `'flex-start'`, `'flex-end'`, `'stretch'`. Default: `'center'`. 