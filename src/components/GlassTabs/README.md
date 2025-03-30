# GlassTabs Component

A tabbed interface with glass styling and animated indicator. Features interactive hover effects, smooth transitions, and keyboard navigation support.

## Features

- Glass-morphism styling with backdrop blur
- Animated indicator that slides between active tabs
- Interactive glow effects on active tab
- Smooth content transitions between tabs
- Keyboard accessible with arrow key navigation
- Respects reduced motion preferences

## Usage

```jsx
import { GlassTabs } from '@veerone/galileo-glass-ui';

function MyTabbedInterface() {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewContent />
    },
    {
      id: 'details',
      label: 'Details',
      content: <DetailsContent />
    },
    {
      id: 'settings',
      label: 'Settings',
      content: <SettingsContent />
    }
  ];

  return (
    <GlassTabs 
      tabs={tabs}
      defaultTab="overview"
      onChange={(tabId) => console.log(`Switched to tab: ${tabId}`)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | GlassTabItem[] | - | Array of tab items |
| `defaultTab` | string | First tab | ID of the default active tab |
| `onChange` | (tabId: string) => void | - | Callback when tab changes |
| `className` | string | "" | Additional CSS class name |

### GlassTabItem Interface

```typescript
interface GlassTabItem {
  id: string;      // Unique identifier for the tab
  label: string;   // Display text for the tab
  content: React.ReactNode; // Tab panel content
}
```

## Examples

### Basic Tabs

```jsx
<GlassTabs
  tabs={[
    { id: 'tab1', label: 'First Tab', content: <div>First tab content</div> },
    { id: 'tab2', label: 'Second Tab', content: <div>Second tab content</div> }
  ]}
/>
```

### With Custom Styling

```jsx
<GlassTabs
  className="custom-tabs"
  tabs={tabData}
  defaultTab="details"
  onChange={handleTabChange}
/>
```

### In a Dashboard Layout

```jsx
<DashboardPanel>
  <PanelHeader>User Analytics</PanelHeader>
  <PanelContent>
    <GlassTabs
      tabs={[
        { id: 'daily', label: 'Daily', content: <DailyChart data={dailyData} /> },
        { id: 'weekly', label: 'Weekly', content: <WeeklyChart data={weeklyData} /> },
        { id: 'monthly', label: 'Monthly', content: <MonthlyChart data={monthlyData} /> }
      ]}
    />
  </PanelContent>
</DashboardPanel>
```

## Animation Details

The component includes several animations:

- **Active indicator**: Smooth transition between tabs with spring-like physics
- **Glow effect**: Subtle pulsing glow on the active tab
- **Content transition**: Fade and slide animation when switching between tab panels
- **Shine effect**: Interactive shine effect that moves across tabs on hover

## Accessibility Features

- Full keyboard navigation with arrow keys
- ARIA roles and attributes for tab structure
- Focus management for keyboard users
- Respects user's reduced motion preferences (disables animations)
- Proper tabindex management

## Browser Support

All modern browsers that support:
- CSS custom properties
- CSS backdrop-filter
- CSS transitions and animations

For older browsers, the component degrades gracefully while maintaining functionality. 