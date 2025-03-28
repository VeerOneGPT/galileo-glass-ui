# Accessibility in Galileo Glass UI

Galileo Glass UI provides comprehensive accessibility features to ensure your applications are usable by everyone, regardless of abilities or preferences.

## Core Accessibility Features

- **Keyboard Navigation**: All interactive elements are fully keyboard accessible
- **Screen Reader Support**: Proper ARIA attributes and semantic HTML
- **Focus Management**: Visual focus indicators and focus traps when needed
- **Motion Control**: Comprehensive motion preference system for animations
- **Color Contrast**: Accessible color themes and contrast options
- **Reduced Transparency**: Options to reduce glass effects for better readability
- **Font Scaling**: Text size adjustments for improved readability
- **Animation Controls**: Options to reduce or disable animations

## Getting Started

Wrap your application with the `AccessibilityProvider` to enable all accessibility features:

```tsx
import { AccessibilityProvider } from 'galileo-glass-ui';

function App() {
  return (
    <AccessibilityProvider>
      <YourApplication />
    </AccessibilityProvider>
  );
}
```

## User Preference Controls

Add the `AccessibilitySettings` component to allow users to customize their experience:

```tsx
import { AccessibilitySettings } from 'galileo-glass-ui';

function SettingsPage() {
  return (
    <div>
      <h1>Accessibility Settings</h1>
      <AccessibilitySettings />
    </div>
  );
}
```

## Main Features

### Motion and Animation Accessibility

Galileo Glass UI provides extensive options for motion control:

- [Animation Accessibility](./animation-accessibility.md) - ARIA attributes and screen reader support for animations
- [Motion Preferences](./motion-preferences.md) - Comprehensive motion sensitivity system
- [Reduced Motion](./reduced-motion.md) - Alternative animations with reduced motion

### Visual Accessibility

Adjust visual aspects for better readability:

- [Color Contrast](./color-contrast.md) - High contrast modes and accessible color schemes
- [Text Readability](./text-readability.md) - Font scaling and text enhancement features
- [Reduced Transparency](./reduced-transparency.md) - Controls for glass effect transparency

### Interaction Accessibility

Make interactions more accessible:

- [Keyboard Navigation](./keyboard-navigation.md) - Fully keyboard-accessible components
- [Focus Management](./focus-management.md) - Enhanced focus indicators and focus traps
- [Touch and Pointer Accessibility](./touch-accessibility.md) - Accessible touch targets and gestures

## Using Accessibility Hooks

Access accessibility features in your components with hooks:

```tsx
import { 
  useAccessibility, 
  useIsReducedMotion,
  useIsHighContrast,
  useFontScale
} from 'galileo-glass-ui';

function AccessibleComponent() {
  const accessibility = useAccessibility();
  const isReducedMotion = useIsReducedMotion();
  const isHighContrast = useIsHighContrast();
  const fontScale = useFontScale();
  
  // Use these values to adjust your component
  
  return (
    <div style={{ fontSize: `${fontScale * 100}%` }}>
      {isReducedMotion ? 'Static content' : 'Animated content'}
    </div>
  );
}
```

## Best Practices

### Design Principles

- **Perceivable**: Information must be presentable in ways all users can perceive
- **Operable**: User interface components must be operable by all users
- **Understandable**: Information and operation must be understandable to all users
- **Robust**: Content must be accessible by a wide variety of user agents

### Implementation Guidelines

- Always provide text alternatives for non-text content
- Ensure sufficient color contrast (minimum 4.5:1 for normal text)
- Provide clear focus indicators for keyboard navigation
- Make all functionality available from a keyboard
- Provide enough time for users to read and use content
- Don't use content that could cause seizures or physical reactions
- Provide ways to help users navigate and find content
- Make text readable and understandable
- Make content appear and operate in predictable ways
- Help users avoid and correct mistakes

## Testing Accessibility

- Use the built-in accessibility checker:
  ```tsx
  import { CheckAccessibility } from 'galileo-glass-ui/tools';
  
  // Run in development
  CheckAccessibility.audit(document);
  ```

- Test with keyboard navigation by tabbing through your interface
- Test with screen readers (VoiceOver, NVDA, JAWS)
- Test with motion sensitivity settings enabled
- Test with high contrast mode
- Test with large text

## Compliance

Galileo Glass UI is designed to help you build applications that comply with:

- Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
- Section 508 requirements
- ADA compliance requirements
- EN 301 549 (European accessibility requirements)

## Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG21/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)