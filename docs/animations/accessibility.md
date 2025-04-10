# Animation Accessibility

Ensuring animations are accessible to all users, including those with motion sensitivities or vestibular disorders, is crucial. The Galileo Glass UI library provides several tools and features to manage animation accessibility effectively.

## Table of Contents

- [`useReducedMotion` Hook (Basic)](#usereducedmotion-hook-basic)
- [`useEnhancedReducedMotion` Hook](#useenhancedreducedmotion-hook)
  - [Purpose](#purpose-enhanced)
  - [Signature & Return Value](#signature--return-value-enhanced)
  - [Key Concepts](#key-concepts-enhanced)
  - [Example Usage](#example-usage-enhanced)
- [Animation Categories](#animation-categories)
- [Alternative Animations](#alternative-animations)
- [Other Accessibility Considerations](#other-accessibility-considerations)
  - [Focus Indicators](#focus-indicators)
  - [Keyboard Navigation](#keyboard-navigation)
  - [Pause/Stop Controls](#pausestop-controls)
- [Best Practices](#best-practices)

---

## `useReducedMotion` Hook (Basic)

The simplest way to check the user's core preference.

### Purpose

- Detect the user's operating system preference for reduced motion via the `prefers-reduced-motion` media query.

### Signature & Return Value

```typescript
import { useReducedMotion } from '@veerone/galileo-glass-ui/hooks';

function useReducedMotion(): boolean;
```

- **Returns:** A boolean (`true` if the user prefers reduced motion, `false` otherwise).

### Usage

Use this hook for simple conditional logic where you only need to know the basic OS-level preference.

```typescript
import React from 'react';
import { useReducedMotion } from '@veerone/galileo-glass-ui/hooks';
import { GlassBox } from '@veerone/galileo-glass-ui/components';

function SimpleAnimatedComponent() {
  const prefersReduced = useReducedMotion();

  return (
    <GlassBox style={{ 
      transition: prefersReduced ? 'none' : 'transform 0.3s ease-out',
      // ... other styles
    }}>
      Content
    </GlassBox>
  );
}
```

---

## `useEnhancedReducedMotion` Hook

Provides a reliable way to check the user's reduced motion preference while also allowing for an application-level user override.

### Purpose {#purpose-enhanced}

- Detect the user's operating system preference for reduced motion via the `prefers-reduced-motion` media query.
- Allow users (or the application) to explicitly override the detected preference via a function (`setUserOverride`).
- Store the user's override preference persistently in `localStorage`.
- Provide clear information about both the system setting and the effective setting (considering the override).

### Signature & Return Value {#signature--return-value-enhanced}

```typescript
import { 
  useEnhancedReducedMotion, 
  EnhancedReducedMotionInfo // Type for return value
} from '@veerone/galileo-glass-ui/hooks'; // Correct import path needed

// Hook signature (takes no arguments)
function useEnhancedReducedMotion(): EnhancedReducedMotionInfo;

// Key return values (EnhancedReducedMotionInfo)
interface EnhancedReducedMotionInfo {
  /**
   * The effective preference for reduced motion.
   * True if the system prefers reduced motion OR if a user override forces it.
   * False if the system does not prefer reduced motion AND no user override forces it.
   */
  prefersReducedMotion: boolean; 
  /**
   * The raw value detected from the `(prefers-reduced-motion: reduce)` media query.
   */
  systemPrefersReducedMotion: boolean;
  /**
   * Indicates if the current `prefersReducedMotion` value is the result of an active user override.
   */
  isOverridden: boolean;
  /**
   * Function to set/clear an application-level override in localStorage.
   * - `setUserOverride(true)`: Force reduced motion.
   * - `setUserOverride(false)`: Force full motion.
   * - `setUserOverride(null)`: Clear override, respect system setting.
   */
  setUserOverride: (value: boolean | null) => void;
}
```

### Key Concepts {#key-concepts-enhanced}

- **Media Query:** Uses the standard `(prefers-reduced-motion: reduce)` media query as the base detection method.
- **User Override:** Provides a `setUserOverride` function allowing explicit user control stored in `localStorage` (`galileo-glass-reduced-motion-override` key). This override takes precedence over the media query result.
- **Stable Return:** Returns a memoized object containing the relevant booleans and the stable `setUserOverride` function.

### Example Usage {#example-usage-enhanced}

```typescript
// Example: Using the enhanced hook to display status and allow overrides
import React from 'react';
import { useEnhancedReducedMotion } from '@veerone/galileo-glass-ui/hooks'; // Adjust path
import { GlassButton, GlassBox, GlassTypography } from '@veerone/galileo-glass-ui/components'; // Adjust path

function MotionSettingsComponent() {
  const { 
    prefersReducedMotion, 
    systemPrefersReducedMotion,
    isOverridden,
    setUserOverride
  } = useEnhancedReducedMotion();

  // Example: Adjust animation duration based on the final preference
  const animationDuration = prefersReducedMotion ? 0 : 300; // Simple disable/enable

  return (
    <GlassBox style={{ padding: '16px' }}>
      <GlassTypography>Effective Preference: {prefersReducedMotion ? 'Reduced' : 'Full'}</GlassTypography>
      <GlassTypography>System Setting: {systemPrefersReducedMotion ? 'Prefers Reduced' : 'Prefers Full'}</GlassTypography>
      <GlassTypography>Is Overridden: {isOverridden.toString()}</GlassTypography>
      
      <GlassBox 
        style={{
          marginTop: '16px',
          height: '50px',
          width: '50px',
          backgroundColor: 'blue',
          transition: `transform ${animationDuration}ms ease-out`, // Use adjusted duration
          transform: 'translateX(50px)' // Example animation target
        }}
      />
      
      <GlassBox style={{ marginTop: '16px' }}>
        <GlassButton onClick={() => setUserOverride(true)}>Force Reduced</GlassButton>
        <GlassButton onClick={() => setUserOverride(false)}>Force Full</GlassButton>
        <GlassButton onClick={() => setUserOverride(null)}>Use System Setting</GlassButton>
      </GlassBox>
    </GlassBox>
  );
}
```

---

## Animation Categories

Animations are categorized to allow different handling based on user preferences or sensitivity levels. Components implementing animations should consider these categories.

- `ESSENTIAL`: Crucial for understanding state or interaction (e.g., focus indicators, loading spinners).
- `TRANSITION`: Navigational or state change transitions (e.g., page loads, modal entrance).
- `FEEDBACK`: Direct response to user input (e.g., button press effect).
- `HOVER`: Effects triggered by hovering.
- `SCROLL`: Parallax or effects linked to scrolling.
- `ATTENTION`: Animations designed to draw user attention (e.g., notification bounce).
- `LOADING`: Indeterminate progress indicators.
- `DECORATIVE`: Purely aesthetic animations with no functional purpose.
- `BACKGROUND`: Subtle background effects.

When using hooks like `useAlternativeAnimations`, you can specify the animation category to ensure proper adaptation:

```typescript
const { isAnimationDisabled, duration } = useAlternativeAnimations({
  category: AnimationCategory.ESSENTIAL // This category will get special treatment
});
```

---

## Alternative Animations

When `prefersReducedMotion` is true, components should ideally provide an alternative way to convey information or state changes. The Galileo Glass UI provides tools to implement these alternatives:

1. **`useAlternativeAnimations` Hook**: Provides utilities based on motion sensitivity.
2. **`withAlternativeAnimations` HOC**: Enhances components with alternative animation capabilities.

Common alternative types include:

- `FADE`: Replace motion with a cross-fade.
- `STATIC`: Remove the animation entirely, jump to the end state.
- `SIMPLIFIED`: Use a less complex version of the animation.
- `ALTERNATIVE_PROPERTY`: Animate a different property (e.g., background color instead of position).
- `NONE`: No specific alternative.

For detailed implementation guidance, see the [Alternative Animations](./alternative-animations.md) documentation.

---

## Other Accessibility Considerations

### Focus Indicators
- Ensure focus indicators are always clearly visible, even during animations.
- Focus ring animations should respect `prefersReducedMotion` (e.g., the basic `useReducedMotion` hook can be used to make the animation `immediate`).
- The `GlassFocusRing` component aims to handle this automatically (Verify its implementation).

### Keyboard Navigation
- All interactions achievable via pointer (mouse/touch) must also be achievable via keyboard.
- Animations triggered by hover should typically also trigger on focus for keyboard users.
- Ensure animations don't trap focus or interfere with expected navigation order.

### Pause/Stop Controls
- For continuous, looping, or potentially distracting animations (especially `DECORATIVE` or `BACKGROUND`), provide controls to pause, stop, or hide them, as required by WCAG 2.2.2 Pause, Stop, Hide.
- Hooks like `useAnimationSequence` provide `pause()` and `stop()` controls.

---

## Best Practices

- **Use `useReducedMotion` (Basic):** For simple checks of the OS preference where no user override is needed.
- **Use `useEnhancedReducedMotion`:** When you need to allow users to override the system preference via `localStorage`.
- **Consume Hook Correctly:** When using `useEnhancedReducedMotion`, destructure the specific properties you need (`prefersReducedMotion`, `systemPrefersReducedMotion`, `isOverridden`, `setUserOverride`) rather than using the entire returned object in dependency arrays.
- **Categorize Animations:** Conceptually assign `AnimationCategory` values when implementing animations to guide decisions about importance and fallbacks.
- **Provide Alternatives:** When motion is significant, design a non-motion alternative (fade, static state, property change) and implement it conditionally based on the `prefersReducedMotion` value from either hook.
- **Test Thoroughly:** Test animations with `prefersReducedMotion` enabled (system setting) and by using the `setUserOverride` function from `useEnhancedReducedMotion`.
- **Prefer System Settings:** The default behavior (when `setUserOverride` is `null`) respects the user's system-wide choice. Only force an override when providing explicit user controls within the application.
- **Keep Essential Motion:** Don't disable motion that is essential for understanding the UI state or interaction, unless a clear alternative is provided.

---

## Animation Categories

Animations are categorized to allow different handling based on user preferences or sensitivity levels. Components implementing animations should consider these categories.

- `ESSENTIAL`: Crucial for understanding state or interaction (e.g., focus indicators, loading spinners).
- `TRANSITION`: Navigational or state change transitions (e.g., page loads, modal entrance).
- `FEEDBACK`: Direct response to user input (e.g., button press effect).
- `HOVER`: Effects triggered by hovering.
- `SCROLL`: Parallax or effects linked to scrolling.
- `ATTENTION`: Animations designed to draw user attention (e.g., notification bounce).
- `LOADING`: Indeterminate progress indicators.
- `DECORATIVE`: Purely aesthetic animations with no functional purpose.
- `BACKGROUND`: Subtle background effects.

When using hooks like `useAlternativeAnimations`, you can specify the animation category to ensure proper adaptation:

```typescript
const { isAnimationDisabled, duration } = useAlternativeAnimations({
  category: AnimationCategory.ESSENTIAL // This category will get special treatment
});
```

---

## Alternative Animations

When `prefersReducedMotion` is true, components should ideally provide an alternative way to convey information or state changes. The Galileo Glass UI provides tools to implement these alternatives:

1. **`useAlternativeAnimations` Hook**: Provides utilities based on motion sensitivity.
2. **`withAlternativeAnimations` HOC**: Enhances components with alternative animation capabilities.

Common alternative types include:

- `FADE`: Replace motion with a cross-fade.
- `STATIC`: Remove the animation entirely, jump to the end state.
- `SIMPLIFIED`: Use a less complex version of the animation.
- `ALTERNATIVE_PROPERTY`: Animate a different property (e.g., background color instead of position).
- `NONE`: No specific alternative.

For detailed implementation guidance, see the [Alternative Animations](./alternative-animations.md) documentation.

---

## Other Accessibility Considerations

### Focus Indicators
- Ensure focus indicators are always clearly visible, even during animations.
- Focus ring animations should respect `prefersReducedMotion` (e.g., the basic `useReducedMotion` hook can be used to make the animation `immediate`).
- The `GlassFocusRing` component aims to handle this automatically (Verify its implementation).

### Keyboard Navigation
- All interactions achievable via pointer (mouse/touch) must also be achievable via keyboard.
- Animations triggered by hover should typically also trigger on focus for keyboard users.
- Ensure animations don't trap focus or interfere with expected navigation order.

### Pause/Stop Controls
- For continuous, looping, or potentially distracting animations (especially `DECORATIVE` or `BACKGROUND`), provide controls to pause, stop, or hide them, as required by WCAG 2.2.2 Pause, Stop, Hide.
- Hooks like `useAnimationSequence` provide `pause()` and `stop()` controls.

---

## Best Practices

- **Use `useReducedMotion` (Basic):** For simple checks of the OS preference where no user override is needed.
- **Use `useEnhancedReducedMotion`:** When you need to allow users to override the system preference via `localStorage`.
- **Consume Hook Correctly:** When using `useEnhancedReducedMotion`, destructure the specific properties you need (`prefersReducedMotion`, `systemPrefersReducedMotion`, `isOverridden`, `setUserOverride`) rather than using the entire returned object in dependency arrays.
- **Categorize Animations:** Conceptually assign `AnimationCategory` values when implementing animations to guide decisions about importance and fallbacks.
- **Provide Alternatives:** When motion is significant, design a non-motion alternative (fade, static state, property change) and implement it conditionally based on the `prefersReducedMotion` value from either hook.
- **Test Thoroughly:** Test animations with `prefersReducedMotion` enabled (system setting) and by using the `setUserOverride` function from `useEnhancedReducedMotion`.
- **Prefer System Settings:** The default behavior (when `setUserOverride` is `null`) respects the user's system-wide choice. Only force an override when providing explicit user controls within the application.
- **Keep Essential Motion:** Don't disable motion that is essential for understanding the UI state or interaction, unless a clear alternative is provided. 