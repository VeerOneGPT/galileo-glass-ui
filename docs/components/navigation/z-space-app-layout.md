# ZSpaceAppLayout

The `ZSpaceAppLayout` component provides a structured application layout with support for header, sidebar, content, and footer sections. It features advanced z-space depth effects, glass styling, and responsive behavior with physics-based animations.

## Import

```tsx
import { ZSpaceAppLayout } from '@veerone/galileo-glass-ui';
```

## Usage

```tsx
import React from 'react';
import { ZSpaceAppLayout } from '@veerone/galileo-glass-ui';
import { Box, Typography, ResponsiveNavigation } from '@veerone/galileo-glass-ui';

function MyApp() {
  // Create header content
  const Header = () => (
    <Box display="flex" alignItems="center" p={2}>
      <Typography variant="h6">My Application</Typography>
    </Box>
  );

  // Create sidebar content
  const Sidebar = () => (
    <Box p={2}>
      <Typography variant="subtitle1">Navigation</Typography>
      {/* Your navigation items here */}
    </Box>
  );

  // Create footer content
  const Footer = () => (
    <Box display="flex" alignItems="center" justifyContent="center" p={1}>
      <Typography variant="caption">© 2023 My Company</Typography>
    </Box>
  );

  return (
    <ZSpaceAppLayout
      header={<Header />}
      sidebar={<Sidebar />}
      footer={<Footer />}
      sidebarWidth={240}
      headerHeight={64}
      footerHeight={48}
      fixedHeader={true}
      fixedSidebar={true}
      enableZSpaceAnimations={true}
      zSpaceAnimationIntensity={0.5}
    >
      {/* Main content area */}
      <Box p={3}>
        <Typography variant="h4">Welcome to My Application</Typography>
        <Typography variant="body1" mt={2}>
          This is the main content area of the application.
        </Typography>
        {/* Additional content here */}
      </Box>
    </ZSpaceAppLayout>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | The main content of the application. |
| `navigation` | `ReactNode` | `undefined` | Optional navigation component that can float above other elements. |
| `sidebar` | `ReactNode` | `undefined` | Content for the sidebar section. |
| `header` | `ReactNode` | `undefined` | Content for the header section. |
| `footer` | `ReactNode` | `undefined` | Content for the footer section. |
| `fixedHeader` | `boolean` | `false` | Whether the header remains fixed during scrolling. |
| `fixedFooter` | `boolean` | `false` | Whether the footer remains fixed during scrolling. |
| `fixedSidebar` | `boolean` | `false` | Whether the sidebar remains fixed during scrolling. |
| `sidebarWidth` | `string \| number` | `240` | Width of the sidebar. |
| `headerHeight` | `string \| number` | `'64px'` | Height of the header section. |
| `footerHeight` | `string \| number` | `'56px'` | Height of the footer section. |
| `initialSidebarCollapsed` | `boolean` | `false` | Initial collapsed state of the sidebar. |
| `sidebarBreakpoint` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` | `'md'` | Breakpoint at which the sidebar becomes collapsible. |
| `className` | `string` | `undefined` | Additional CSS class for the root element. |
| `style` | `CSSProperties` | `undefined` | Additional inline styles for the root element. |
| `zLayers` | `object` | See below | Z-index values for different layout elements. |
| `maxContentWidth` | `string \| number` | `undefined` | Maximum width for the content area. |
| `contentPadding` | `string \| number` | `'1.5rem'` | Padding for the content area. |
| `backgroundComponent` | `ReactNode` | `undefined` | Optional background component. |
| `useGlassEffects` | `boolean` | `false` | Whether to apply glass effects to layout containers. |
| `glassIntensity` | `number` | `undefined` | Intensity of the glass effect (0-1). |
| `sidebarToggle` | `ReactNode` | `undefined` | Custom toggle component for the sidebar. |
| `enableZSpaceAnimations` | `boolean` | `true` | Whether to enable Z-space depth animations. |
| `zSpaceAnimationIntensity` | `number` | `0.5` | Intensity of the Z-space animations (0-1). |

### Default zLayers Configuration

```tsx
{
  background: 0,
  sidebar: 20,
  header: 30,
  content: 10,
  footer: 30,
  navigation: 40,
  overlay: 50
}
```

## Z-Space Physics-Based Animations

The `ZSpaceAppLayout` component features sophisticated physics-based animations that create a sense of depth and perspective:

1. **Content Movement**: As the user scrolls or interacts with the layout, the content area subtly shifts in 3D space, creating a parallax-like effect.

2. **Depth Perception**: Elements appear at different depths based on their z-index values, enhancing the sense of a layered interface.

3. **Smooth Transitions**: The physics-based springs ensure that all movements and transitions feel natural and fluid.

The animations are controlled by two main props:

- `enableZSpaceAnimations`: Toggles the animations on/off
- `zSpaceAnimationIntensity`: Controls the strength of the effect (0-1)

The component automatically respects the user's motion preferences by checking for the `prefers-reduced-motion` media query.

## Examples

### Basic Layout with Fixed Header and Sidebar

```tsx
<ZSpaceAppLayout
  header={<MyHeader />}
  sidebar={<MySidebar />}
  fixedHeader={true}
  fixedSidebar={true}
>
  <MyContent />
</ZSpaceAppLayout>
```

### With Maximum Content Width and Custom Padding

```tsx
<ZSpaceAppLayout
  header={<MyHeader />}
  sidebar={<MySidebar />}
  footer={<MyFooter />}
  maxContentWidth="1200px"
  contentPadding="2rem"
>
  <MyContent />
</ZSpaceAppLayout>
```

### With Glass Effects and Enhanced Z-Space Animations

```tsx
<ZSpaceAppLayout
  header={<MyHeader />}
  sidebar={<MySidebar />}
  useGlassEffects={true}
  enableZSpaceAnimations={true}
  zSpaceAnimationIntensity={0.8}
>
  <MyContent />
</ZSpaceAppLayout>
```

### Mobile-Optimized Layout

```tsx
<ZSpaceAppLayout
  header={<MyHeader />}
  sidebar={<MySidebar />}
  sidebarBreakpoint="sm"
  initialSidebarCollapsed={true}
  fixedHeader={true}
>
  <MyContent />
</ZSpaceAppLayout>
```

## Responsive Behavior

The `ZSpaceAppLayout` component includes built-in responsive behavior:

- Below the `sidebarBreakpoint`, the sidebar becomes collapsible with a toggle button
- The sidebar can be initially collapsed using `initialSidebarCollapsed`
- Fixed positioning for header and sidebar is automatically adjusted on smaller screens

## Accessibility

The component respects accessibility best practices:

- Proper ARIA attributes for interactive elements
- Keyboard navigation support for collapsible sidebar
- Respect for user motion preferences via `prefers-reduced-motion` media query
- Proper focus management for interactive elements

## Best Practices

1. **Content Organization**: Place main application content within the `children` prop, using the dedicated slots for `header`, `sidebar`, and `footer`.

2. **Z-Space Animation**: Use the Z-space animations thoughtfully. For busy interfaces or data-dense applications, consider reducing the `zSpaceAnimationIntensity` or disabling animations.

3. **Fixed Elements**: Be careful with `fixedHeader` and `fixedSidebar` on small screens, as they can take up significant screen real estate.

4. **Glass Effects**: When using `useGlassEffects`, ensure there is sufficient contrast for content readability.

5. **Custom Backgrounds**: When using a `backgroundComponent`, ensure it doesn't interfere with content readability.

## Related Components

- `ResponsiveNavigation`: Pairs well with ZSpaceAppLayout for the sidebar or header sections
- `GlassNavigation`: Can be used within the sidebar slot
- `GlassCard`: Effective for content sections within the main area
