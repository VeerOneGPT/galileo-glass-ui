# Animation Accessibility

Ensuring animations are accessible to all users, including those with motion sensitivities or vestibular disorders, is crucial. The Galileo Glass UI library provides several tools and features to manage animation accessibility effectively.

## Table of Contents

- [`useReducedMotion` Hook (Basic)](#usereducedmotion-hook-basic)
- [`useEnhancedReducedMotion` Hook](#useenhancedreducedmotion-hook)
  - [Purpose](#purpose-enhanced)
  - [Signature & Return Value](#signature--return-value-enhanced)
  - [Key Concepts](#key-concepts-enhanced)
  - [Example Usage](#example-usage-enhanced)
- [Motion Sensitivity Levels (Concept)](#motion-sensitivity-levels-concept)
- [Animation Categories (Concept)](#animation-categories-concept)
- [Alternative Animations (Concept)](#alternative-animations-concept)
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

Provides a more sophisticated detection mechanism considering multiple factors beyond the basic media query.

### Purpose {#purpose-enhanced}

- Detect the user's preference for reduced motion using multiple signals (media query, user agent, power saving mode, performance hints, user override).
- Provide a confidence score for the detection.
- Recommend a `MotionSensitivityLevel` based on the combined signals.
- Allow users to explicitly override the detected preference via `localStorage`.

### Signature & Return Value {#signature--return-value-enhanced}

```typescript
import { 
  useEnhancedReducedMotion, 
  EnhancedReducedMotionOptions, // Type for hook options
  EnhancedReducedMotionInfo, // Type for return value
  ReducedMotionDetectionMethod, // Enum for detection methods
  MotionSensitivityLevel // Enum for sensitivity levels
} from '@veerone/galileo-glass-ui/hooks'; // Assuming types are exported here

// Hook signature
function useEnhancedReducedMotion(
  options?: EnhancedReducedMotionOptions
): EnhancedReducedMotionInfo;

// Options structure (from source)
interface EnhancedReducedMotionOptions {
  useMediaQuery?: boolean; // Default: true
  useUserAgent?: boolean; // Default: true
  usePowerSaving?: boolean; // Default: true
  useUserPreference?: boolean; // Default: true
  usePerformance?: boolean; // Default: true
  useHardwareAcceleration?: boolean; // Default: true
  useAccessibilityTools?: boolean; // Default: true
  confidenceThresholds?: Partial<Record<ReducedMotionDetectionMethod, number>>;
  autoApplyFallbacks?: boolean; // Default: true (Note: Actual fallback application might be handled elsewhere)
}

// Key return values (EnhancedReducedMotionInfo - from source)
interface EnhancedReducedMotionInfo {
  // The final calculated preference (true if signals suggest reduced motion)
  prefersReducedMotion: boolean; 
  // The detection method with the highest confidence that indicated reduced motion
  detectionMethod: ReducedMotionDetectionMethod;
  // Other methods that also indicated reduced motion
  additionalDetectionMethods: ReducedMotionDetectionMethod[];
  // Normalized confidence score (0-1) based on active detection methods
  confidence: number;
  // Recommended sensitivity level based on confidence
  recommendedSensitivityLevel: MotionSensitivityLevel;
  // Function to set/clear an app-level override in localStorage
  setUserOverride: (value: boolean | null) => void;
}
```

### Key Concepts {#key-concepts-enhanced}

- **Multiple Signals:** Goes beyond `prefers-reduced-motion` to infer user needs from power saving mode, device performance hints, user agent, etc.
- **Confidence Score:** Aggregates signals to provide a confidence level (0-1) in the `prefersReducedMotion` result.
- **Recommended Sensitivity:** Suggests a `MotionSensitivityLevel` (e.g., `LOW`, `MEDIUM`, `HIGH`) based on the confidence score. Components *can* use this recommendation to adjust animation intensity.
- **User Override:** Provides `setUserOverride` function to let users explicitly enable/disable reduced motion for the application, storing the choice in `localStorage`. This override takes precedence over all other detection methods.
- **No Direct Control Functions:** Unlike the previous documentation, this hook **does not** directly return functions like `setMotionSensitivity`, `setCategoryPreference`, `isAnimationAllowed`, `getAdjustedDuration`, etc. It provides the *information* (preference, confidence, recommended level), and components or other systems would need to *use* that information to implement granular control or fallbacks.

### Example Usage {#example-usage-enhanced}

```typescript
// Example: Using the enhanced hook to potentially adjust behavior
import React from 'react';
import { 
  useEnhancedReducedMotion, 
  MotionSensitivityLevel 
} from '@veerone/galileo-glass-ui/hooks';
import { GlassButton, GlassBox, GlassTypography } from '@veerone/galileo-glass-ui/components';

function EnhancedMotionComponent() {
  const { 
    prefersReducedMotion, 
    recommendedSensitivityLevel,
    confidence,
    detectionMethod,
    setUserOverride
  } = useEnhancedReducedMotion();

  // Example: Adjust animation duration based on sensitivity recommendation
  let animationDuration = 300; // Default duration
  if (prefersReducedMotion) {
    switch (recommendedSensitivityLevel) {
      case MotionSensitivityLevel.LOW:
        animationDuration = 600; // Slower
        break;
      case MotionSensitivityLevel.MEDIUM:
        animationDuration = 450; // Slightly slower
        break;
      // HIGH or NONE might use default or slightly faster
    }
  }

  // Example: Conditionally render a simpler animation or static state
  const showFullAnimation = !prefersReducedMotion || recommendedSensitivityLevel === MotionSensitivityLevel.HIGH;

  return (
    <GlassBox style={{ padding: '16px' }}>
      <GlassTypography>Prefers Reduced Motion: {prefersReducedMotion.toString()}</GlassTypography>
      <GlassTypography>Confidence: {confidence.toFixed(2)}</GlassTypography>
      <GlassTypography>Primary Detection: {detectionMethod}</GlassTypography>
      <GlassTypography>Recommended Sensitivity: {recommendedSensitivityLevel}</GlassTypography>
      
      <GlassBox 
        style={{
          marginTop: '16px',
          height: '50px',
          width: '50px',
          backgroundColor: 'blue',
          transition: showFullAnimation ? `transform ${animationDuration}ms ease-out` : 'none',
          transform: showFullAnimation ? 'translateX(50px)' : 'none'
        }}
      />
      
      <GlassBox style={{ marginTop: '16px' }}>
        <GlassButton onClick={() => setUserOverride(true)}>Force Reduced</GlassButton>
        <GlassButton onClick={() => setUserOverride(false)}>Force Normal</GlassButton>
        <GlassButton onClick={() => setUserOverride(null)}>Use Detection</GlassButton>
      </GlassBox>
    </GlassBox>
  );
}
```

---

## Motion Sensitivity Levels (Concept) {#motion-sensitivity-levels-concept}

The library defines conceptual levels of motion sensitivity that *can* be used to adjust animations when reduced motion is preferred. The `useEnhancedReducedMotion` hook *recommends* a level, but doesn't enforce its application.

### Levels

- `MotionSensitivityLevel.LOW`: Suggests significant reduction in animation speed, distance, and complexity. Favors simpler alternatives.
- `MotionSensitivityLevel.MEDIUM`: Suggests moderate reduction. Often the default level when reduced motion is detected.
- `MotionSensitivityLevel.HIGH`: Suggests minimal reduction. Allows most animations but might slightly reduce speed or distance.
- `MotionSensitivityLevel.NONE`: No sensitivity adjustment recommended (implies `prefersReducedMotion` is false).
- *(Other potential levels like `MEDIUM_HIGH`, `LOW_MEDIUM` might exist internally)*

### Configuration
*(Internal Concept)*: Internally, each level likely maps to configuration values (speed multipliers, distance scales, complexity limits) that components *could* use to adjust their behavior, but these configuration details are not directly exposed or controlled via the `useEnhancedReducedMotion` hook itself.

---

## Animation Categories (Concept) {#animation-categories-concept}

Animations *can* be conceptually categorized to allow different handling based on user preferences or sensitivity levels. Components implementing animations *should* consider these categories.

- `ESSENTIAL`: Crucial for understanding state or interaction (e.g., focus indicators, loading spinners).
- `TRANSITION`: Navigational or state change transitions (e.g., page loads, modal entrance).
- `FEEDBACK`: Direct response to user input (e.g., button press effect).
- `HOVER`: Effects triggered by hovering.
- `SCROLL`: Parallax or effects linked to scrolling.
- `ATTENTION`: Animations designed to draw user attention (e.g., notification bounce).
- `LOADING`: Indeterminate progress indicators.
- `DECORATIVE`: Purely aesthetic animations with no functional purpose.
- `BACKGROUND`: Subtle background effects.

**Note:** The current `useEnhancedReducedMotion` hook does *not* provide direct mechanisms to set preferences per category. This would require additional state management or context.

---

## Alternative Animations (Concept) {#alternative-animations-concept}

When `prefersReducedMotion` is true, components should ideally provide an alternative way to convey information or state changes. Common alternative types include:

- `FADE`: Replace motion with a cross-fade.
- `STATIC`: Remove the animation entirely, jump to the end state.
- `SIMPLIFIED`: Use a less complex version of the animation.
- `ALTERNATIVE_PROPERTY`: Animate a different property (e.g., background color instead of position).
- `NONE`: No specific alternative.

**Note:** The current hooks do not directly manage or select alternative animations. Components are responsible for implementing appropriate fallbacks based on the `prefersReducedMotion` value and potentially the `recommendedSensitivityLevel`.

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

- **Use `useReducedMotion` (Basic):** For simple checks of the OS preference.
- **Use `useEnhancedReducedMotion`:** When more nuanced detection or user overrides are needed. Use the returned `prefersReducedMotion` and `recommendedSensitivityLevel` to *inform* animation adjustments.
- **Categorize Animations:** Conceptually assign `AnimationCategory` values when implementing animations to guide decisions about importance and fallbacks.
- **Provide Alternatives:** When motion is significant, design a non-motion alternative (fade, static state, property change) and implement it conditionally based on `prefersReducedMotion`.
- **Test Thoroughly:** Test animations with `prefersReducedMotion` enabled (system setting) and by using the `setUserOverride` function from `useEnhancedReducedMotion`.
- **Prefer System Settings:** Avoid overriding system preferences unless providing explicit user control (like the `setUserOverride` functionality).
- **Keep Essential Motion:** Don't disable motion that is essential for understanding the UI state or interaction, unless a clear alternative is provided. 