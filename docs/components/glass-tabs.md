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