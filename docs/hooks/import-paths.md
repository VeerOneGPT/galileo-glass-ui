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

// The useAdaptiveQuality hook provides both device capability and quality tier information
const { deviceCapabilities, qualityTier } = useAdaptiveQuality();

// Note: useDeviceCapabilities and useQualityTier as separate hooks are deprecated
// and have been consolidated into useAdaptiveQuality
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

### useAdaptiveQuality (consolidation of useDeviceCapabilities and useQualityTier)

```javascript
// Current usage pattern
const { 
  deviceCapabilities, // Previously from useDeviceCapabilities
  qualityTier,        // Previously from useQualityTier
  adaptiveSettings    // New consolidated settings
} = useAdaptiveQuality();

// Check device capabilities
if (deviceCapabilities.supportsBackdropFilter) {
  // Use backdrop filters
}

// Check quality tier
if (qualityTier >= 2) {
  // Use higher quality effects
}
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