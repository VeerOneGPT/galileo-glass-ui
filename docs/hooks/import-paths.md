# Hook Import Paths Guide

## Overview

This guide clarifies the correct import paths for various hooks in the Galileo Glass UI library. Due to package structure changes during development, some hooks may have different import paths than what is mentioned in other documentation.

## Core Animation and Physics Hooks

```javascript
// Main animation and physics hooks
import { 
  useGalileoStateSpring, 
  useMultiSpring, 
  usePhysicsInteraction 
} from '@veerone/galileo-glass-ui/hooks';

// Animation sequence orchestration
import { useAnimationSequence } from '@veerone/galileo-glass-ui/animations/sequence';

// Physics-based magnetic effects
import { useMagneticElement } from '@veerone/galileo-glass-ui/magnetic';

// Chart-specific physics interactions
import { useChartPhysicsInteraction } from '@veerone/galileo-glass-ui/charts/useChartPhysicsInteraction';
```

## Device and Quality Hooks

```javascript
// For device capabilities and quality tier
import { useAdaptiveQuality } from '@veerone/galileo-glass-ui/hooks';

// The useAdaptiveQuality hook provides a comprehensive API for adaptive rendering:
const { 
  deviceCapabilities,   // Device hardware and browser capabilities
  qualityTier,          // Overall quality tier (LOW, MEDIUM, HIGH, ULTRA)
  adaptiveSettings,     // Specific settings derived from the tier
  isUserPreferred,      // Whether user has set a preference
  setQualityPreference, // Set user's preferred quality tier
  resetToAutoDetect     // Reset to automatic detection
} = useAdaptiveQuality({
  // Optional configuration
  allowUserOverride: true,
  respectBatterySaver: true
});

// Check device capabilities
if (deviceCapabilities.supportsBackdropFilter) {
  // Use backdrop filters
}

// Network and battery awareness
if (deviceCapabilities.saveData) {
  // User has enabled data-saving mode
  // Hook automatically caps quality tier at MEDIUM to reduce data usage
}

if (deviceCapabilities.exactConnectionType === '2g') {
  // Precise connection type information available
}

if (deviceCapabilities.isBatterySaving) {
  // Battery is low, hook automatically reduces quality
}

// Check quality tier
if (qualityTier === QualityTier.HIGH || qualityTier === QualityTier.ULTRA) {
  // Use higher quality effects
}
```

## Z-Space and Layout Hooks

```javascript
// For Z-space layering and management
import { useZSpace } from '@veerone/galileo-glass-ui/core';

// For physics-based layouts
import { usePhysicsLayout } from '@veerone/galileo-glass-ui/hooks';
```

## Accessibility Hooks

```javascript
// For reduced motion and accessibility settings
import { 
  useReducedMotion,
  useAccessibilitySettings
} from '@veerone/galileo-glass-ui/hooks';
```

## Hook API Changes

Several hooks have undergone API changes during development:

### useZSpace (formerly useZSpaceAnimation)

```javascript
// Current usage pattern
const { style, setZIndex, zIndex } = useZSpace({
  depth: 3,
  layer: 'FOREGROUND',
  position: 'relative', // optional
  responsiveDepth: true // optional
});
```

### useAdaptiveQuality

```javascript
// Current usage pattern
const { 
  deviceCapabilities, // Device hardware and browser capabilities
  qualityTier,        // Overall quality tier (LOW, MEDIUM, HIGH, ULTRA)
  adaptiveSettings,   // Specific settings derived from the tier
  isUserPreferred,    // Whether user has set a preference
  setQualityPreference, // Set user's preferred quality tier
  resetToAutoDetect   // Reset to automatic detection
} = useAdaptiveQuality({
  allowUserOverride: true,  // Allow user preferences to override automatic detection
  respectBatterySaver: true // Reduce quality when battery is low
});

// Check device capabilities
if (deviceCapabilities.supportsBackdropFilter) {
  // Use backdrop filters
}

// Network and battery awareness
if (deviceCapabilities.saveData) {
  // User has enabled data-saving mode
  // Hook automatically caps quality tier at MEDIUM to reduce data usage
}

if (deviceCapabilities.exactConnectionType === '2g') {
  // Precise connection type information available
}

if (deviceCapabilities.isBatterySaving) {
  // Battery is low, hook automatically reduces quality
}

// Check quality tier
if (qualityTier === QualityTier.HIGH || qualityTier === QualityTier.ULTRA) {
  // Use higher quality effects
}

// Use adaptive settings directly
const maxParticles = adaptiveSettings.maxParticles;
const shouldEnableBlur = adaptiveSettings.enableBlurEffects;
```

## Troubleshooting Import Issues

If you're experiencing issues with imports, you can:

1. Check the TypeScript definitions in your project:
   ```bash
   # Navigate to node_modules and check definitions
   cat node_modules/@veerone/galileo-glass-ui/dist/hooks/index.d.ts
   ```

2. Try a more general import and check available exports:
   ```javascript
   import * as Hooks from '@veerone/galileo-glass-ui/hooks';
   console.log(Object.keys(Hooks)); // Lists all available exports
   ```

3. If a hook mentioned in documentation isn't available at the expected path, try:
   - Checking both `/hooks` and `/core` imports
   - Looking for a similarly named hook that may have replaced it
   - Exploring the library exports systematically

## Future Updates

A comprehensive documentation revision is planned for v1.0.25 to ensure all import paths are correctly documented. This will include:

- Updated API references for all hooks
- Consistent import path documentation
- Migration guides for renamed or consolidated hooks
- TypeScript-friendly examples

For specific hook usage questions, please refer to the individual hook documentation files or contact support.

## Physics Hooks

### Physics Engine Hooks

```typescript
// Main Physics Engine Hook - Available via two methods:
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui'; // Direct import
import { usePhysicsEngine } from '@veerone/galileo-glass-ui'; // Alias

// Alternative subpath import:
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui/physics';

// If you encounter TypeScript errors with the direct import, you can use:
// eslint-disable-next-line @typescript-eslint/no-var-requires
const useGalileoPhysicsEngine = require('@veerone/galileo-glass-ui').useGalileoPhysicsEngine;
```

### Pointer Following Hooks

```typescript
// Pointer Following Hooks - Available from both main package and physics subpath:
import { usePointerFollow, usePointerFollowGroup } from '@veerone/galileo-glass-ui'; // Main package import (recommended)
// OR
import { usePointerFollow, usePointerFollowGroup } from '@veerone/galileo-glass-ui/physics'; // Physics subpath import

// Example usage:
const { ref, transform, isFollowing } = usePointerFollow({
  behavior: 'momentum',
  physics: 'SMOOTH',
  alwaysFollow: true,
  offset: { x: -16, y: -16 } // Center the cursor (assuming 32px width/height)
});

// Apply the transform to your element:
<div 
  ref={ref}
  style={{
    transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg) scale(${transform.scale})`,
    position: 'fixed',
    pointerEvents: 'none'
  }}
/>
```

### Gesture Physics Hooks

```typescript
// Gesture Physics Hook
import { useGesturePhysics } from '@veerone/galileo-glass-ui'; // From main package
import { useGesturePhysics } from '@veerone/galileo-glass-ui/hooks'; // From hooks subpath

// When using useGesturePhysics, if you encounter type errors with event parameters:
const { style } = useGesturePhysics({
  elementRef: myRef as React.RefObject<HTMLElement>, // Fix ref type if needed
  
  // Use type 'any' for event parameters if the types don't match
  pan: {
    enabled: true,
    onStart: (event: any) => {
      // Access position safely with optional chaining
      const x = event.position?.x || event.xy?.[0] || 0;
      const y = event.position?.y || event.xy?.[1] || 0;
      // ...
    }
  }
});
```

## Card Components

The library includes standard card components:

```typescript
// Card component - both imports work
import { Card } from '@veerone/galileo-glass-ui';
import { Card as GlassCard } from '@veerone/galileo-glass-ui'; // GlassCard is an alias for Card
```

## Other Physics Hooks

```typescript
// Additional physics hooks
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui';
import { usePhysicsConstraint } from '@veerone/galileo-glass-ui';
import { usePhysicsLayout } from '@veerone/galileo-glass-ui';
```

## Animation Hooks

```typescript
// Animation hooks
import { useAnimationContext } from '@veerone/galileo-glass-ui';
import { useStaggeredAnimation } from '@veerone/galileo-glass-ui';
import { useOrchestration } from '@veerone/galileo-glass-ui';
```

## Note on Hook Implementations

Some hooks may have two implementations within the codebase:
1. A primary implementation in `src/animations/physics/` for core physics hooks
2. A wrapper or adapter implementation in `src/hooks/` for compatibility

Always prefer the import paths shown in this document to ensure stable functionality.