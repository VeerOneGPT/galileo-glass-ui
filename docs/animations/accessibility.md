# Animation Accessibility

Ensuring animations are accessible to all users, including those with motion sensitivities or vestibular disorders, is crucial. The Galileo Glass UI library provides several tools and features to manage animation accessibility effectively.

## Table of Contents

- [`useReducedMotion` Hook](#usereducedmotion-hook)
  - [Purpose](#purpose)
  - [Signature & Return Value](#signature--return-value)
  - [Key Concepts](#key-concepts)
  - [Example Usage](#example-usage)
- [Motion Sensitivity](#motion-sensitivity)
  - [Levels](#levels)
  - [Configuration](#configuration)
- [Animation Categories](#animation-categories)
- [Alternative Animations](#alternative-animations)
- [Other Accessibility Considerations](#other-accessibility-considerations)
  - [Focus Indicators](#focus-indicators)
  - [Keyboard Navigation](#keyboard-navigation)
  - [Pause/Stop Controls](#pausestop-controls)
- [Best Practices](#best-practices)

---

## `useReducedMotion` Hook

The primary tool for managing animation accessibility is the enhanced `useReducedMotion` hook.

### Purpose

- Detect the user's operating system preference for reduced motion (`prefers-reduced-motion` media query).
- Allow users to override the system setting with an application-specific reduced motion preference (stored in `localStorage`).
- Provide fine-grained control over animation behavior based on `MotionSensitivityLevel`.
- Enable configuration of animation behavior per `AnimationCategory`.
- Determine appropriate `AlternativeType` for animations when reduced motion is active.
- Provide utility functions to check if an animation is allowed and adjust its parameters (duration, distance) based on sensitivity settings.

### Signature & Return Value

```typescript
import { 
  useReducedMotion, 
  EnhancedReducedMotionOptions, 
  EnhancedReducedMotionResult 
} from 'galileo-glass-ui';

function useReducedMotion(
  options?: EnhancedReducedMotionOptions
): EnhancedReducedMotionResult;

// Key return values in EnhancedReducedMotionResult:
interface EnhancedReducedMotionResult {
  // System preference (from media query)
  systemReducedMotion: boolean;
  // App-level preference (from localStorage)
  appReducedMotion: boolean;
  // Combined preference (true if either system or app is true)
  prefersReducedMotion: boolean; 
  // Current sensitivity level (LOW, MEDIUM, HIGH)
  motionSensitivity: MotionSensitivityLevel; 
  // Detailed config based on sensitivity level
  sensitivityConfig: MotionSensitivityConfig; 
  // User's preferred general alternative type (e.g., FADE)
  preferredAlternativeType: AlternativeType; 
  // Preferences per animation category
  categoryPreferences: Record<AnimationCategory, CategoryPreference>; 

  // Functions to control settings:
  setAppReducedMotion: (value: boolean) => void;
  setMotionSensitivity: (level: MotionSensitivityLevel) => void;
  setPreferredAlternativeType: (type: AlternativeType) => void;
  setCategoryPreference: (category: AnimationCategory, prefs: Partial<CategoryPreference>) => void;
  resetPreferences: () => void;

  // Utility functions for components:
  isAnimationAllowed: (category: AnimationCategory) => boolean;
  getAlternativeForCategory: (category: AnimationCategory) => AlternativeType;
  getAdjustedDuration: (baseDuration: number, category?: AnimationCategory) => number;
  getDistanceScale: (category?: AnimationCategory) => number;
}
```

- **Options (`EnhancedReducedMotionOptions`)**: Allows setting defaults for sensitivity, alternative types, and initial category preferences. `respectAppSettings` (default `true`) determines if the app-level setting overrides the system one.

### Key Concepts

- **System vs. App Preference:** The hook distinguishes between the OS-level setting (`systemReducedMotion`) and an optional app-level toggle (`appReducedMotion`). `prefersReducedMotion` is the combined value used by most components.
- **Persistence:** App-level settings (reduced motion toggle, sensitivity, category preferences) are stored in `localStorage` to persist across sessions.
- **Granular Control:** When `useGranularControl` (default `true`) is enabled in options, the hook uses `MotionSensitivityLevel` and `categoryPreferences` to determine if/how animations run, rather than just turning them all off.
- **Utility Functions:** Components primarily use `prefersReducedMotion` to conditionally skip animations or use the utility functions (`isAnimationAllowed`, `getAdjustedDuration`, etc.) to modify animation behavior based on user preferences.

### Example Usage

**1. Setting up a Global Provider (Optional but Recommended)**

It's often useful to call `useReducedMotion` once near the top of your app and provide its result via context, so settings can be controlled globally.

```typescript
// Example: src/contexts/AccessibilityContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { 
  useReducedMotion, 
  EnhancedReducedMotionResult, 
  MotionSensitivityLevel,
  // ... other necessary imports
} from 'galileo-glass-ui';

const AccessibilityContext = createContext<EnhancedReducedMotionResult | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const reducedMotion = useReducedMotion({ /* Default options if needed */ });
  return (
    <AccessibilityContext.Provider value={reducedMotion}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): EnhancedReducedMotionResult => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
    // Or return default fallback values if preferred
  }
  return context;
};
```

**2. Using Preferences in a Component**

```typescript
// Example: src/components/MyAnimatedComponent.tsx
import React from 'react';
import { useGalileoStateSpring, AnimationCategory } from 'galileo-glass-ui';
import { useAccessibility } from '../contexts/AccessibilityContext'; // Import custom hook
import { Box } from '@mui/material';

const MyAnimatedComponent = () => {
  const { 
    prefersReducedMotion, 
    isAnimationAllowed, 
    getAdjustedDuration, 
    // ... other needed values
  } = useAccessibility();

  const category = AnimationCategory.TRANSITION; // Assign a category

  const { value } = useGalileoStateSpring(1, {
    from: 0,
    // Skip animation if not allowed or globally preferred
    immediate: !isAnimationAllowed(category) || prefersReducedMotion, 
    config: { 
      tension: 170, 
      friction: 26, 
      // Adjust duration based on sensitivity
      // Note: Spring physics duration isn't directly set, 
      // but adjusting tension/friction based on sensitivity might be an approach.
      // This example focuses on the immediate flag.
    }
  });

  // Example of adjusting a CSS transition duration
  const cssDuration = getAdjustedDuration(300, category); // Get adjusted duration

  return (
    <Box sx={{ 
      opacity: value, 
      transition: isAnimationAllowed(category) ? `opacity ${cssDuration}ms ease-out` : 'none',
    }}> 
      Animated Content
    </Box>
  );
};
```

---

## Motion Sensitivity

Provides finer control than a simple on/off switch for reduced motion.

### Levels

- `MotionSensitivityLevel.LOW`: Significant reduction in animation speed, distance, and complexity. Favors simpler alternatives.
- `MotionSensitivityLevel.MEDIUM`: Moderate reduction. Default level when reduced motion is enabled.
- `MotionSensitivityLevel.HIGH`: Minimal reduction. Allows most animations but might slightly reduce speed or distance.

### Configuration

Each level corresponds to a `MotionSensitivityConfig` which defines:
- `speedMultiplier`: Factor to adjust animation durations (e.g., 1.5 might mean 50% longer).
- `distanceScale`: Enum (`SHORT`, `MEDIUM`, `LONG`) influencing travel distance.
- `maxComplexity`: Maximum allowed `AnimationComplexity` (`MINIMAL`, `STANDARD`, `ENHANCED`).
- `categorySettings`: Overrides for specific `AnimationCategory` values.

Components use `sensitivityConfig` (from `useReducedMotion`) along with `getAdjustedDuration` and `getDistanceScale` to modify animations.

---

## Animation Categories

Animations can be categorized to allow different handling based on user preferences:

- `ESSENTIAL`: Crucial for understanding state or interaction (e.g., focus indicators, loading spinners).
- `TRANSITION`: Navigational or state change transitions (e.g., page loads, modal entrance).
- `FEEDBACK`: Direct response to user input (e.g., button press effect).
- `HOVER`: Effects triggered by hovering.
- `SCROLL`: Parallax or effects linked to scrolling.
- `ATTENTION`: Animations designed to draw user attention (e.g., notification bounce).
- `LOADING`: Indeterminate progress indicators.
- `DECORATIVE`: Purely aesthetic animations with no functional purpose.
- `BACKGROUND`: Subtle background effects.

Users can potentially disable or request alternatives for specific categories via `setCategoryPreference`.

---

## Alternative Animations

When `prefersReducedMotion` is true, components should ideally provide an alternative way to convey information or state changes. `useReducedMotion` helps manage this via `AlternativeType`:

- `FADE`: Replace motion with a cross-fade.
- `STATIC`: Remove the animation entirely, jump to the end state.
- `SIMPLIFIED`: Use a less complex version of the animation.
- `ALTERNATIVE_PROPERTY`: Animate a different property (e.g., background color instead of position).
- `NONE`: No specific alternative suggested (component decides).

Components use `getAlternativeForCategory` to determine which alternative to apply.

---

## Other Accessibility Considerations

### Focus Indicators
- Ensure focus indicators are always clearly visible, even during animations.
- Focus ring animations should respect `prefersReducedMotion` (e.g., using `useGalileoStateSpring` with the `immediate` flag).
- The `FocusIndicator` component aims to handle this automatically.

### Keyboard Navigation
- All interactions achievable via pointer (mouse/touch) must also be achievable via keyboard.
- Animations triggered by hover should typically also trigger on focus for keyboard users.
- Ensure animations don't trap focus or interfere with expected navigation order.

### Pause/Stop Controls
- For continuous, looping, or potentially distracting animations (especially `DECORATIVE` or `BACKGROUND`), provide controls to pause, stop, or hide them, as required by WCAG 2.2.2 Pause, Stop, Hide.
- `useAnimationSequence` provides `pause()` and `stop()` controls.

---

## Best Practices

- **Use `useReducedMotion`:** Rely on the hook to detect preferences rather than manually checking the media query.
- **Categorize Animations:** Assign meaningful `AnimationCategory` values when implementing animations.
- **Provide Alternatives:** When motion is significant, design a non-motion alternative (fade, static state, property change).
- **Test Thoroughly:** Test animations with `prefersReducedMotion` enabled (system setting) and with different app-level sensitivity settings.
- **Prefer System Settings:** Avoid overriding system preferences unless providing explicit user control within the application.
- **Check `isAnimationAllowed`:** Before running potentially non-essential animations, check `isAnimationAllowed(category)`.
- **Adjust Parameters:** Use `getAdjustedDuration` and `getDistanceScale` to subtly modify animations based on sensitivity, rather than just turning them off, for a smoother experience.
- **Keep Essential Motion:** Don't disable motion that is essential for understanding the UI state or interaction, unless a clear alternative is provided. 