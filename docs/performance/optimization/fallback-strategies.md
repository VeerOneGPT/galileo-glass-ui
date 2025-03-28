# Fallback Strategies for Lower-End Devices

Galileo Glass UI provides a comprehensive fallback strategy system to ensure great user experiences across all device capabilities. This documentation explains how to use these strategies in your applications.

## Overview

The fallback strategies system automatically adapts visual effects, animations, and behaviors based on device capabilities. This ensures:

1. **Performance optimization** on lower-end devices
2. **Accessibility compliance** with user preferences
3. **Battery optimization** for mobile devices
4. **Network optimization** for users with limited connectivity

## Device Capability Tiers

The system classifies devices into five capability tiers:

| Tier | Description | Example Devices |
|------|-------------|-----------------|
| `ULTRA` | High-end desktops with dedicated GPUs | Gaming PCs, Mac Pro |
| `HIGH` | Modern desktops/laptops with good GPUs | Recent MacBook Pro, high-end Windows laptops |
| `MEDIUM` | Average laptops or high-end mobile | Standard laptops, iPad Pro, flagship phones |
| `LOW` | Lower-end mobile devices | Budget phones, older tablets |
| `MINIMAL` | Very low-end or older devices | Legacy devices, extremely resource-constrained environments |

## Fallback Strategy Types

The system applies various fallback strategies based on the device capability tier:

### Animation Fallbacks

- `NONE`: Keep all animations as designed (ULTRA, HIGH)
- `SIMPLIFY`: Reduce animation complexity and duration (MEDIUM)
- `REDUCE`: Only show important animations (LOW)
- `DISABLE`: Turn off all animations (MINIMAL)

### Visual Effects Fallbacks

- `NONE`: Keep all visual effects as designed (ULTRA, HIGH)
- `SIMPLIFY`: Use simpler versions of effects (MEDIUM)
- `ALTERNATIVE`: Use solid backgrounds instead of glass (LOW)
- `DISABLE`: Turn off special effects completely (MINIMAL)

### Media Fallbacks

- `FULL`: Load all media as designed (ULTRA, HIGH)
- `OPTIMIZED`: Use optimized versions with lower quality (MEDIUM, LOW)
- `PLACEHOLDER`: Use placeholder content (LOW)
- `ESSENTIAL_ONLY`: Hide non-essential media (MINIMAL)

### Component Strategy Fallbacks

- `FULL_FEATURED`: Use all features of components (ULTRA, HIGH)
- `SIMPLIFIED`: Use simplified versions of components (MEDIUM, LOW)
- `MINIMAL`: Use minimal versions with only core functionality (MINIMAL)

## Using Fallback Strategies

Galileo Glass UI provides several ways to implement fallback strategies:

### 1. Using the Hook

The `useFallbackStrategies` hook provides access to all fallback strategies:

```tsx
import { useFallbackStrategies } from '@galileo-glass-ui/hooks';

function MyComponent() {
  const fallback = useFallbackStrategies({
    componentType: 'glass', // Type of component
    importance: 7           // Importance level (1-10)
  });
  
  // Check if an animation should be shown
  const showAnimation = fallback.shouldShowAnimation('hover-effect');
  
  // Get alternative styles for glass effects
  const styles = fallback.shouldApplyEffect('glass')
    ? originalStyles
    : fallback.getAlternativeStyles(originalStyles, 'glass');
    
  return (
    <div style={styles}>
      {showAnimation && <AnimatedElement />}
    </div>
  );
}
```

### 2. Using the Higher-Order Component

The `withFallbackStrategies` HOC automatically applies fallback strategies to your components:

```tsx
import { withFallbackStrategies } from '@galileo-glass-ui/utils';

interface MyComponentProps {
  title: string;
  // Fallback props are injected by the HOC
  fallbackStrategies?: any;
  useFallback?: boolean;
  reducedProps?: boolean;
  disabledFeatures?: string[];
  alternatives?: Record<string, any>;
}

function MyComponent({
  title,
  fallbackStrategies,
  useFallback = false,
  reducedProps = false,
  disabledFeatures = [],
  alternatives = {}
}: MyComponentProps) {
  // Use fallback props to adapt component behavior
  return (
    <div className={useFallback ? 'simplified' : 'full-featured'}>
      <h2>{title}</h2>
      {!disabledFeatures.includes('animation') && <Animation />}
    </div>
  );
}

// Apply fallback strategies with options
export default withFallbackStrategies(MyComponent, {
  componentType: 'glass',
  importance: 5
});
```

### 3. Using the Utilities Directly

You can also use the utility functions directly:

```tsx
import {
  getFallbackStrategies,
  shouldShowAnimation,
  getAlternativeStyles
} from '@galileo-glass-ui/utils';

function MyComponent() {
  const strategies = getFallbackStrategies();
  
  const showAnimation = shouldShowAnimation('hover-effect', 5);
  
  const glassStyles = shouldApplyVisualEffect('glass')
    ? originalStyles
    : getAlternativeStyles(originalStyles, 'glass');
    
  return (
    <div style={glassStyles}>
      {showAnimation && <Animation />}
    </div>
  );
}
```

## Advanced Configuration

### Overriding Strategy Detection

You can override the automatic device capability detection:

```tsx
const fallback = useFallbackStrategies({
  forceTier: DeviceCapabilityTier.LOW, // Force a specific tier
  overrides: {
    // Override specific strategies
    animation: AnimationFallbackStrategy.DISABLE,
    visualEffects: VisualEffectFallbackStrategy.ALTERNATIVE
  }
});
```

### Dynamic Optimization

The system can dynamically adjust strategies based on runtime performance:

```tsx
const fallback = useFallbackStrategies({
  dynamicOptimization: true // Enable dynamic optimization
});

// Or with the HOC
export default withFallbackStrategies(MyComponent, {
  dynamicOptimization: true
});
```

### Using Component-Specific Fallbacks

Get component-specific fallback configurations:

```tsx
const fallback = useFallbackStrategies({ componentType: 'chart' });
const config = fallback.getComponentFallback();

// Access component-specific fallback options
if (config.useSimplifiedVersion) {
  // Use simplified chart implementation
}

// Check for specific disabled features
if (config.disableFeatures.includes('3d-effects')) {
  // Use 2D version instead
}

// Apply alternative settings
const chartOptions = {
  ...defaultOptions,
  ...config.alternatives
};
```

## Testing Fallback Strategies

You can test different fallback strategies by forcing a specific device tier:

```tsx
import { DeviceCapabilityTier } from '@galileo-glass-ui/utils';

// In your test or development environment
<MyComponent forceTier={DeviceCapabilityTier.LOW} />

// Or with the hook
const fallback = useFallbackStrategies({
  forceTier: DeviceCapabilityTier.MINIMAL
});
```

## FallbackStrategiesDemo Component

The library includes a demonstration component showing how fallback strategies adapt across different device tiers:

```tsx
import { FallbackStrategiesDemo } from '@galileo-glass-ui/examples';

function App() {
  return (
    <div>
      <h1>Fallback Strategies Demo</h1>
      <FallbackStrategiesDemo />
    </div>
  );
}
```

## Best Practices

1. **Assign appropriate importance levels** (1-10) to your components and animations
2. **Test your application across different device tiers** to ensure a good experience
3. **Don't override fallback strategies** unless absolutely necessary
4. **Provide alternatives** for complex visual effects and animations
5. **Use component-specific fallbacks** for optimal adaptation
6. **Consider user preferences** like reduced motion and data-saving mode