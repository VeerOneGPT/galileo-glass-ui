# Animation Context & Global Configuration

This document explains how to configure default animation behaviors globally within a Galileo Glass UI application using `AnimationProvider` and the `useAnimationContext` hook. It also details the standard animation presets available.

## Table of Contents

- [Purpose](#purpose)
- [Core Components](#core-components)
  - [`AnimationProvider`](#animationprovider)
  - [`useAnimationContext`](#useanimationcontext)
- [Configuration Values](#configuration-values)
- [Standard Spring Presets](#standard-spring-presets)
- [Example Usage](#example-usage)
- [Best Practices](#best-practices)
- [Adaptive Performance & Quality Tiers](#adaptive-performance-quality-tiers)

---

## Purpose

The Animation Context system allows developers to:

- **Define Default Behaviors:** Set application-wide default spring configurations (or other animation parameters in the future) for common interaction types (e.g., hover, press, modal transitions).
- **Ensure Consistency:** Maintain a consistent animation feel across different components without repeatedly specifying configurations.
- **Theme Animations:** Potentially integrate animation settings with the application's theme.
- **Simplify Component Usage:** Reduce the need for individual components to define their animation parameters if the defaults are suitable.
- **Global Control:** Easily disable animations application-wide if needed (e.g., for performance testing or specific user settings).

---

## Core Components

### `AnimationProvider`

This is a React Context Provider component that should wrap a significant portion of your application, typically near the root (e.g., surrounding your main layout or inside your theme provider).

```typescript
import { AnimationProvider } from 'galileo-glass-ui';

// In your main App component or layout
function App() {
  return (
    <AnimationProvider value={{ defaultSpring: 'gentle' /* , other defaults */ }}>
      {/* Rest of your application */}
    </AnimationProvider>
  );
}
```

- **Props:**
    - `children`: (`ReactNode`, required) The child components to wrap.
    - `value`: (`Partial<AnimationContextState>`, optional) An object containing the default animation settings you want to override. See [Configuration Values](#configuration-values).

### `useAnimationContext`

This hook is used *within* Galileo Glass components (or potentially your custom components) to access the default animation configurations provided by the nearest `AnimationProvider` up the tree.

```typescript
import { useAnimationContext } from 'galileo-glass-ui';

function MyAnimatedComponent() {
  const { defaultSpring, disableAnimation } = useAnimationContext();

  // Use defaultSpring config in an animation hook
  const { value } = useGalileoStateSpring(target, {
    animationConfig: defaultSpring, // Applies the context default
    immediate: disableAnimation, // Respects global disable flag
  });

  // ... component logic ...
}
```

- **Return Value:** (`AnimationContextState`) An object containing the resolved animation configurations. If used outside an `AnimationProvider`, it returns fallback defaults (and logs a warning).

---

## Configuration Values

The `value` prop of `AnimationProvider` accepts an object (`AnimationContextState`) with the following optional properties:

- `disableAnimation` (`boolean`): If `true`, hints to components that animations should be skipped (e.g., transitions happen instantly).
- `defaultSpring` (`string | SpringConfig`): The default spring configuration used by many components if no specific prop is provided. Can be a preset name (string) or a custom `SpringConfig` object (`{ tension, friction, mass }`).
- `gentleSpring`, `hoverSpringConfig`, `focusSpringConfig`, `pressSpringConfig`, `modalSpringConfig`, `menuSpringConfig`, `notificationSpringConfig` (`string | SpringConfig`): Specific defaults for different common UI scenarios. Components might look for these specific context values first before falling back to `defaultSpring`.
- `animationConfig` (`SpringConfig | PhysicsConfig`): A potential future general configuration object (less used currently).

**Priority:** When a component uses an animation hook (like `useGalileoStateSpring` or `usePhysicsInteraction`), the configuration is typically resolved in this order:
1.  **Direct Prop:** A specific `animationConfig` passed directly to the hook/component.
2.  **Specific Context Default:** A relevant named config from context (e.g., `hoverSpringConfig` if it's a hover interaction).
3.  **General Context Default:** The `defaultSpring` from context.
4.  **Hook/Component Internal Default:** A hardcoded default within the hook/component itself (often `SpringPresets.DEFAULT`).

---

## Standard Spring Presets

The following preset names (strings) can be used in the `animationConfig` props or within the `AnimationProvider` value:

| Preset Name            | Tension | Friction | Mass | Typical Use Case                               |
| :--------------------- | :------ | :------- | :--- | :--------------------------------------------- |
| `DEFAULT`              | 170     | 26       | 1    | General purpose, balanced.                     |
| `GENTLE`               | 120     | 14       | 1    | Softer, smoother transitions.                  |
| `WOBBLY`               | 180     | 12       | 1    | Noticeable overshoot/bounce.                   |
| `STIFF`                | 210     | 20       | 1    | Faster, more rigid, less bounce.               |
| `SLOW`                 | 80      | 20       | 1    | Very slow and gradual movement.                |
| `MASSIVE`              | 190     | 30       | 3    | Heavier feel, slower to start/stop.            |
| `RESPONSIVE`           | 300     | 25       | 1    | Quick and responsive, minimal bounce.          |
| `SNAPPY`               | 400     | 22       | 1    | Very quick, sharp movements.                   |
| `BOUNCY`               | 150     | 10       | 1    | Very bouncy, pronounced overshoot.             |
| `HEAVY`                | 250     | 35       | 2    | Combination of stiffness and mass.             |
| `REDUCED_MOTION`       | 170     | 40       | 1    | Less bouncy, quicker settle for reduced motion.|
| **UI Presets:**        |         |          |      | **Specific Interaction Defaults**              |
| `HOVER_QUICK`          | 350     | 25       | 1    | Quick, subtle hover effects.                   |
| `FOCUS_HIGHLIGHT`      | 250     | 28       | 1    | Visible but not distracting focus indicators.  |
| `PRESS_FEEDBACK`       | 500     | 30       | 1    | Very quick, tactile feedback for presses.      |
| `MODAL_TRANSITION`     | 200     | 22       | 1    | Standard entrance/exit for modals/dialogs.     |
| `MENU_POPOVER`         | 280     | 24       | 1    | Quick transitions for menus/popovers.          |
| `NOTIFICATION_SLIDE`   | 220     | 26       | 1    | Smooth slide-in/out for notifications.         |

You can also provide a custom `SpringConfig` object (e.g., `{ tension: 200, friction: 18, mass: 1.2 }`) instead of a preset name.

---

## Example Usage

```tsx
// src/App.tsx (or equivalent top-level component)
import React from 'react';
import { ThemeProvider, AnimationProvider } from 'galileo-glass-ui'; // Import Galileo ThemeProvider
import MyMainLayout from './MyMainLayout';

// Define custom animation defaults
const customAnimationDefaults = {
  defaultSpring: 'GENTLE', // Make most animations gentle by default
  pressSpringConfig: { tension: 450, friction: 28, mass: 1 }, // Slightly softer press feedback
  modalSpringConfig: 'SLOW', // Make modals transition slowly
  // disableAnimation: true, // Uncomment to disable all animations
};

function App() {
  return (
    <ThemeProvider initialTheme="nebula" initialColorMode="dark">
      <AnimationProvider value={customAnimationDefaults}>
        <MyMainLayout />
      </AnimationProvider>
    </ThemeProvider>
  );
}

export default App;

// src/components/MyButton.tsx (Example Component using context)
import React from 'react';
import { GlassButton, GlassButtonProps } from 'galileo-glass-ui'; 
import { usePhysicsInteraction, useAnimationContext } from 'galileo-glass-ui';

export const MyButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>((
  props,
  ref
) => {
  const { pressSpringConfig, hoverSpringConfig, disableAnimation } = useAnimationContext();
  
  // NOTE: Actual Button likely combines hover/press/focus logic more intricately
  // This is a simplified example showing context usage.
  const { ref: physicsRef, style } = usePhysicsInteraction<HTMLButtonElement>({
    // Use specific context defaults if available, otherwise fallback might happen internally
    animationConfig: pressSpringConfig, 
    // Hover config might be handled by conditional logic inside usePhysicsInteraction 
    // or separate hooks depending on implementation.
    reducedMotion: disableAnimation, // Respect global disable flag
    affectsScale: true,
    scaleAmplitude: 0.04,
  });

  return (
    <GlassButton
      ref={physicsRef} // Attach physics ref
      style={{ ...style, ...props.style }} // Combine styles
      {...props} // Pass other props
    />
  );
});
```

---

## Best Practices

- **Wrap Early:** Place the `AnimationProvider` high up in your component tree, ideally just inside your ThemeProvider.
- **Use Presets:** Prefer using the standard preset names (`string`) for consistency unless a truly custom feel is required.
- **Targeted Overrides:** Use the specific context keys (`hoverSpringConfig`, `modalSpringConfig`, etc.) for targeted overrides rather than just changing `defaultSpring` if you only want to affect certain interactions.
- **Component Fallbacks:** Ensure your custom components gracefully handle the case where `useAnimationContext` might return fallback defaults (e.g., if used outside the provider, although this should be avoided).
- **Keep it Consistent:** Avoid overly complex or numerous overrides unless necessary. The goal is usually a consistent feel.
- **Testing:** Test how changes to the context values affect various components in your application.

---

## Adaptive Performance & Quality Tiers

The Galileo animation system includes features to help provide smooth performance across a range of devices by detecting capabilities and classifying them into quality tiers.

### Core Hooks

> **IMPORTANT UPDATE (v1.0.24):** The hooks mentioned below have been consolidated. See the updated information.

- **`useAdaptiveQuality`**: This hook replaces the previously separate `useDeviceCapabilities` and `useQualityTier` hooks. It provides a unified interface for device capability detection and quality tier determination.

```javascript
import { useAdaptiveQuality } from '@veerone/galileo-glass-ui/hooks';

function MyComponent() {
  const { 
    deviceCapabilities, // Contains info like CPU cores, memory, etc.
    qualityTier,        // QualityTier.LOW, MEDIUM, HIGH, or ULTRA
    adaptiveSettings    // Combined settings based on capabilities
  } = useAdaptiveQuality();
  
  // Use the data as needed
  console.log(`Running in ${qualityTier} quality mode`);
  
  // Check specific capabilities
  if (deviceCapabilities.supportsBackdropFilter) {
    // Use backdrop filters...
  }
  
  return <div>{/* Component content */}</div>;
}
```

> **Note:** The previously documented `useDeviceCapabilities` and `useQualityTier` hooks are deprecated as of v1.0.24. Please migrate to `useAdaptiveQuality`.

### Integration with `AnimationContext`

- **Automatic Detection**: By default, `AnimationProvider` uses `useAdaptiveQuality` internally to determine the `activeQualityTier`.
- **Forcing a Tier**: You can override the automatic detection by passing the `forceQualityTier` prop to `AnimationProvider`.
- **Accessing the Tier**: Components and hooks can access the currently active tier using `const { activeQualityTier } = useAnimationContext();`.

### Provider Configuration (`AnimationProvider` prop)

```typescript
import { AnimationProvider, QualityTier } from 'galileo-glass-ui';

function App() {
  return (
    <AnimationProvider 
      forceQualityTier={QualityTier.HIGH} // Optional: Override auto-detection
      // value={{ ... other animation defaults ... }}
    >
      {/* ... App Content ... */}
    </AnimationProvider>
  );
}
```

- `forceQualityTier` (`QualityTier | null`, optional): Set to `QualityTier.LOW`, `MEDIUM`, `HIGH`, `ULTRA` to force a tier, or `null` (default) to use automatic detection.

### Context Value (`useAnimationContext` return)

```typescript
import { useAnimationContext, QualityTier } from 'galileo-glass-ui';

function MyPerformanceAwareComponent() {
  const { 
    activeQualityTier, 
    // ... other context values ... 
  } = useAnimationContext();

  // Example: Adjust behavior based on tier
  const particleLimit = useMemo(() => {
    switch (activeQualityTier) {
      case QualityTier.LOW: return 100;
      case QualityTier.MEDIUM: return 500;
      case QualityTier.HIGH: return 1000;
      case QualityTier.ULTRA: return 2000;
      default: return 500;
    }
  }, [activeQualityTier]);

  // ... use particleLimit ...
}
```

- `activeQualityTier` (`QualityTier`): The resulting tier, either forced via the provider prop or automatically detected. Fallback is `QualityTier.MEDIUM` if used outside a provider.

### Use Cases

- **Particle Systems (`useParticleSystem`)**: Automatically adjusts `maxParticles` and `emissionRate` based on the `activeQualityTier` to prevent overwhelming lower-end devices.
- **Complex Physics**: Hooks involving intensive physics calculations could reduce simulation steps or complexity on lower tiers.
- **Visual Effects**: Components rendering many layers or complex shaders could simplify effects on lower tiers.

**Note:** Components are responsible for checking the `activeQualityTier` from the context and adjusting their behavior accordingly. The system provides the tier; components consume it.

---