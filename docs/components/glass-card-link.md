# GlassCardLink Component

## Overview

The `GlassCardLink` component renders a card-like element that functions as a link, featuring enhanced visual styling and hover effects. It combines glass morphism aesthetics with interactive elements suitable for navigation or displaying linked content previews.

Based on source code inspection, the hover effects (3D tilt, shadow, glow) are primarily implemented using CSS transitions and pseudo-elements rather than the library's physics engine hooks.

## Import

```tsx
import { GlassCardLink } from '@veerone/galileo-glass-ui';
```

## Props

| Prop             | Type                      | Required | Default        | Description                                                                  |
| :--------------- | :------------------------ | :------- | :------------- | :--------------------------------------------------------------------------- |
| `title`          | `string`                  | Yes      | -              | The main title text displayed on the card.                                    |
| `description`    | `string`                  | Yes      | -              | The descriptive text displayed below the title.                              |
| `link`           | `string`                  | Yes      | -              | The URL the card links to. Used in the `href` of the underlying `<a>` tag.      |
| `icon?`          | `React.ReactNode`         | No       | `undefined`    | An optional icon element (e.g., `<YourIcon />`) displayed in the header area. |
| `buttonText?`    | `string`                  | No       | "Learn more"   | Text displayed in the footer link area, next to the arrow icon.              |
| `glassVariant?`  | `'clear' \| 'frosted' \| 'tinted' \| 'luminous'` | No | `'frosted'`  | Applies different predefined glass surface styles.                           |
| `customPreview?` | `React.ReactNode`         | No       | `undefined`    | Optional custom JSX content to render within the main content area.          |
| `onClick?`       | `(e: React.MouseEvent) => void` | No | `undefined`  | Custom click handler. If provided, it prevents default link navigation.      |
| `children?`      | `React.ReactNode`         | No       | `undefined`    | If provided, replaces the default icon/title/description/footer structure.   |
| `className?`     | `string`                  | No       | `""`           | Additional CSS class name(s) applied to the link wrapper element.          |

## Usage Example

```jsx
import React from 'react';
import { GlassCardLink } from '@veerone/galileo-glass-ui';
// Assuming you have an icon component, e.g., from @mui/icons-material
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

function MyCardDemo() {
  const handleCustomClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    alert('Custom click handler executed!');
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* Basic Example */}
      <GlassCardLink
        icon={<RocketLaunchIcon fontSize="large" />}
        title="Launch Project"
        description="Click here to start the deployment process and monitor progress."
        link="/deploy/project-alpha"
        buttonText="Initiate Launch"
        glassVariant="luminous"
        style={{ width: '300px' }} // Example inline style
      />

      {/* Example with Custom Click Handler */}
      <GlassCardLink
        title="Settings Panel"
        description="Configure application settings (custom click)."
        link="/settings" // Link is still present but overridden by onClick
        buttonText="Open Settings"
        onClick={handleCustomClick}
        glassVariant="tinted"
        style={{ width: '300px' }}
      />

      {/* Example with Children Prop */}
      <GlassCardLink
        link="/custom-content"
        style={{ width: '300px' }}
      >
        <div style={{ padding: '20px' }}>
          <h4>Completely Custom Content</h4>
          <p>This card's content is defined by the children prop.</p>
          <button>A Custom Button</button>
        </div>
      </GlassCardLink>
    </div>
  );
}

export default MyCardDemo;
```

## Styling

*   The component uses `styled-components` internally.
*   The `glassVariant` prop applies different base styles.
*   You can pass a `className` for additional CSS targeting or use styled-component wrappers.
*   Hover effects (tilt, shadow, glow) are primarily CSS-driven. 