# GlassCardLink Component

An enhanced card component with 3D transform effects and link functionality. Features physics-inspired animations, intuitive hover states and smooth transitions.

## Features

- 3D perspective transforms on hover for depth effect
- Subtle lighting effects and gradients
- Enhanced icon container with glow effects
- Animated arrow for intuitive interaction
- Support for custom content and previews

## Usage

```jsx
import { GlassCardLink } from '@veerone/galileo-glass-ui';

function App() {
  return (
    <GlassCardLink
      icon={<UserIcon />}
      title="User Profile"
      description="View and edit your personal information"
      link="/profile"
      buttonText="View Profile"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | ReactNode | - | Optional icon to display in the card |
| `title` | string | - | Card title text |
| `description` | string | - | Card description text |
| `link` | string | - | URL to navigate to when clicked |
| `buttonText` | string | "Learn more" | Text for the call-to-action button |
| `className` | string | "" | Additional CSS class name |
| `customPreview` | ReactNode | - | Custom content to display in the card |
| `glassVariant` | 'clear' \| 'frosted' \| 'tinted' \| 'luminous' | "frosted" | Glass styling variant |
| `onClick` | (e: React.MouseEvent) => void | - | Optional custom click handler |
| `children` | ReactNode | - | Optional children to render instead of default content |

## Examples

### Basic Link Card

```jsx
<GlassCardLink
  title="Getting Started"
  description="Learn how to integrate Galileo Glass UI into your project"
  link="/getting-started"
/>
```

### Card with Custom Preview

```jsx
<GlassCardLink
  title="Analytics Dashboard"
  description="Visualize your data with interactive charts"
  link="/analytics"
  customPreview={<LineChart data={sampleData} height={120} />}
  buttonText="View Dashboard"
/>
```

### Using Custom Content with Children

```jsx
<GlassCardLink link="/custom-content">
  <div className="custom-layout">
    <h3>Custom Card Layout</h3>
    <p>You can fully customize the card content</p>
    <MyCustomComponent />
  </div>
</GlassCardLink>
```

## Animation Details

The component uses a combination of CSS transitions and transforms to create smooth, physics-inspired animations:

- **Hover transform**: Uses perspective transform and subtle scale
- **Light reflection**: Linear gradient that creates a lighting effect
- **Icon float**: Subtle upward animation of the icon container on hover

## Accessibility

- Proper ARIA attributes for interactive elements
- Keyboard navigable with proper focus states
- Motion respects user preferences 