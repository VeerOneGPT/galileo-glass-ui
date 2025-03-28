# Animation Accessibility in Galileo Glass UI

This guide explains how to use the accessibility features of the animation system in Galileo Glass UI, ensuring that your animations are accessible to all users, including those with vestibular disorders or those who prefer reduced motion.

## Core Concepts

### Motion Sensitivity

Galileo Glass UI provides a comprehensive motion sensitivity system that allows users to control animation behavior according to their preferences:

- **Motion Sensitivity Levels**: From `NONE` (full animations) to `MAXIMUM` (no animations)
- **Animation Complexity Controls**: Fine-grained control over animation complexity
- **Category-Specific Settings**: Different settings for different animation types (entrance, hover, etc.)
- **Distance Scaling**: Control how far elements move during animations
- **Speed Adjustments**: Make animations faster or slower based on preferences

### Accessibility Features

The animation system provides several features to improve accessibility:

1. **Reduced Motion Detection**: Automatically respects the user's system preferences
2. **Alternative Animations**: Provides less motion-intensive alternatives
3. **Speed Controls**: Allows customizing animation speed
4. **Motion Intensity Profiling**: Analyzes animation complexity to make appropriate adjustments
5. **ARIA Attributes**: Proper screen reader support for animations
6. **Animation Announcements**: Optional screen reader announcements for important animations

## Using Accessible Animations

### The `useAccessibleAnimation` Hook

The simplest way to create accessible animations is with the `useAccessibleAnimation` hook:

```tsx
import { useAccessibleAnimation, AnimationCategory } from 'galileo-glass-ui';
import { keyframes, css } from 'styled-components';

// Define your animation
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const animation = css`
  animation: ${fadeIn} 300ms ease-out forwards;
`;

function MyComponent() {
  // Make the animation accessible
  const { 
    animation: accessibleAnimation, 
    ariaAttributes, 
    Announcer 
  } = useAccessibleAnimation(animation, {
    category: AnimationCategory.ENTRANCE,
    duration: 300,
    description: 'Content fading in',
  });

  return (
    <>
      <div 
        css={accessibleAnimation}
        {...ariaAttributes}
      >
        My animated content
      </div>
      <Announcer />
    </>
  );
}
```

### With Animation Accessibly HOC

For components that are frequently animated, you can use the `withAnimationAccessibility` HOC:

```tsx
import { withAnimationAccessibility, AnimationCategory } from 'galileo-glass-ui';

const MyAnimatedComponent = ({ className, children }) => (
  <div className={className}>
    {children}
  </div>
);

// Make the component accessible
const AccessibleAnimatedComponent = withAnimationAccessibility(
  MyAnimatedComponent,
  AnimationCategory.ENTRANCE,
  {
    description: 'Content appearing',
    announce: true,
  }
);

// Use it with styled-components
const StyledAnimatedComponent = styled(AccessibleAnimatedComponent)`
  animation: ${fadeIn} 300ms ease-out forwards;
`;
```

### ARIA Attributes for Animations

You can also get ARIA attributes for animations directly:

```tsx
import { getAnimationAriaAttributes, AnimationCategory } from 'galileo-glass-ui';

const ariaAttributes = getAnimationAriaAttributes(AnimationCategory.LOADING, {
  isAnimating: true,
  description: 'Loading content',
});

// Use in JSX
<div {...ariaAttributes}>Loading...</div>
```

## Animation Categories

Galileo Glass UI organizes animations into categories, each with appropriate accessibility defaults:

| Category | Description | Announce by Default | Default Role |
|----------|-------------|---------------------|-------------|
| ENTRANCE | Elements appearing | No | - |
| EXIT | Elements disappearing | No | - |
| HOVER | Hover effects | No | - |
| FOCUS | Focus effects | No | - |
| ACTIVE | Active/pressed state | No | - |
| LOADING | Loading indicators | Yes (polite) | status |
| BACKGROUND | Decorative animations | No | - |
| SCROLL | Scroll-triggered | No | - |
| ATTENTION | Attention-grabbing | Yes (polite) | - |
| ESSENTIAL | Core UI feedback | No | - |

## User Preferences

Users can configure their motion preferences through the `AccessibilitySettings` component, which provides a comprehensive UI for all accessibility options:

```tsx
import { AccessibilitySettings } from 'galileo-glass-ui';

function MyApp() {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowSettings(true)}>
        Open Accessibility Settings
      </button>
      
      {showSettings && (
        <AccessibilitySettings 
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
```

## Best Practices

1. **Always Categorize Animations**: Specify the correct category for your animations
2. **Provide Descriptions**: Add clear descriptions for screen readers
3. **Announce Important Changes**: Use announcements for important UI state changes
4. **Test with Reduced Motion**: Always test your UI with reduced motion settings
5. **Make Interactive Animations Optional**: Allow users to disable hover/focus animations
6. **Keep Background Animations Subtle**: Background animations should never distract
7. **Respect System Preferences**: Always respect prefers-reduced-motion setting

## Advanced Features

### Motion Intensity Profiling

For complex animations, you can use the motion intensity profiler:

```tsx
import { useMotionProfiler } from 'galileo-glass-ui';

function ComplexAnimation() {
  const { profile, intensity } = useMotionProfiler('my-animation', {
    transformProperties: ['translateY', 'rotate'],
    distance: 100,
    duration: 500,
    autoPlay: true,
  });
  
  // Use profile to adjust the animation
  console.log(`Animation intensity: ${intensity}`);
  
  return (
    // Animation implementation
  );
}
```

### Animation Speed Controls

You can customize animation speed for different categories:

```tsx
import { 
  useAnimationSpeed, 
  AnimationSpeedPreference 
} from 'galileo-glass-ui';

function SpeedSettings() {
  const { setGlobalSpeed, setCategorySpeed } = useAnimationSpeed();
  
  return (
    <div>
      <select onChange={(e) => setGlobalSpeed(e.target.value)}>
        <option value={AnimationSpeedPreference.NORMAL}>Normal</option>
        <option value={AnimationSpeedPreference.FASTER}>Faster</option>
        <option value={AnimationSpeedPreference.SLOWER}>Slower</option>
      </select>
    </div>
  );
}
```

### Alternative Animations

You can provide alternative animations for different motion sensitivity levels:

```tsx
import { useReducedMotionAlternative, AnimationCategory } from 'galileo-glass-ui';

function MyComponent() {
  // Get an alternative for a specific animation
  const alternativeAnimation = useReducedMotionAlternative(
    originalAnimation,
    {
      category: AnimationCategory.ENTRANCE,
      preferredType: AlternativeType.FADE,
    }
  );
  
  return <div css={alternativeAnimation}>Content</div>;
}
```

## Conclusion

By using these accessibility features, you can ensure that your animations are inclusive and respect user preferences. The Galileo Glass UI animation system makes it easy to create beautiful, performant animations that work for everyone.