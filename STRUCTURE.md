# Galileo Glass UI - Architecture

This document outlines the architecture of the galileo-glass-ui package, a standalone UI component library that implements glass morphism design.

## Core Directories

```
galileo-glass-ui/
├── src/
│   ├── components/    # UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Charts/    # Chart components
│   │   ├── TextField/
│   │   └── ...
│   ├── core/          # Core utilities
│   │   ├── mixins/
│   │   ├── cssUtils.ts
│   │   ├── colorUtils.ts
│   │   └── ...
│   ├── theme/         # Theme system
│   │   ├── ThemeProvider.tsx
│   │   ├── GlassContext.tsx
│   │   ├── tokens.ts
│   │   └── ...
│   ├── animations/    # Animation system
│   │   ├── keyframes/
│   │   ├── physics/
│   │   ├── animationUtils.ts
│   │   └── ...
│   ├── hooks/         # React hooks
│   │   ├── useGlassEffects.ts
│   │   ├── useReducedMotion.ts
│   │   ├── usePhysicsInteraction.ts
│   │   └── ...
│   └── index.ts       # Main entry point
├── docs/              # Documentation
│   ├── GalileoGlass.md  # Main framework documentation
│   ├── AnimationSystem.md # Animation system documentation
│   ├── ThemeProvider.md # Theme system documentation
│   └── GlassCharts.md   # Chart components documentation
├── package.json       # Package config with subpath exports
└── rollup.config.js   # Build configuration
```

## Key Design Principles

- **Zero Material UI Dependencies**: Completely independent implementation using styled-components
- **Accessibility-First**: All components respect user preferences, including reduced motion
- **Performance-Optimized**: Components adapt to device capabilities
- **Consistent API**: All components follow consistent patterns and naming conventions
- **TypeScript Support**: Fully typed API for better developer experience

## Module Structure

### Components Module

The components module contains UI components with a consistent structure:

```
components/
├── Button/
│   ├── Button.tsx     # Implementation with both Button and GlassButton
│   ├── index.ts       # Re-exports from Button.tsx
│   └── Button.test.tsx # Tests (optional)
├── Card/
│   ├── Card.tsx
│   ├── index.ts
│   └── Card.test.tsx
├── Charts/            # Chart components
│   ├── BarChart.tsx  
│   ├── LineChart.tsx
│   ├── PieChart.tsx
│   ├── SafeChartRenderer.tsx
│   └── index.ts
├── ...
└── index.ts           # Re-exports all components
```

Each component follows these patterns:
- Exports both standard and Glass-prefixed versions (e.g., `Button` and `GlassButton`)
- Uses styled-components with kebab-case CSS properties
- Accepts comprehensive props with TypeScript types
- Uses theme context for styling
- Handles accessibility considerations

### Core Module

The core module provides utilities and mixins:

```
core/
├── mixins/
│   ├── glassSurface.ts      # Main glass surface effect
│   ├── glassBorder.ts       # Glass border effects
│   ├── backgroundEffects.ts # Background effects
│   ├── effects/
│   │   ├── glowEffects.ts   # Glow effects
│   │   ├── edgeEffects.ts   # Edge highlighting
│   │   ├── innerEffects.ts  # Inner glow effects
│   │   └── ambientEffects.ts # Ambient lighting effects
│   ├── interactions/
│   │   ├── interactiveGlass.ts # Interactive glass effects
│   │   ├── focusEffects.ts     # Focus state effects
│   │   └── hoverEffects.ts     # Hover state effects
│   ├── depth/
│   │   ├── depthEffects.ts  # Depth perception effects
│   │   └── zSpaceLayer.ts   # Z-space layering system
│   └── accessibility/
│       ├── highContrast.ts      # High contrast mode adaptations
│       ├── reducedTransparency.ts # Reduced transparency adaptations
│       ├── focusStyles.ts       # Accessible focus styles
│       └── visualFeedback.ts    # Visual feedback styles
├── cssUtils.ts        # CSS utilities
├── colorUtils.ts      # Color manipulation
├── themeContext.ts    # Theme context creation
├── themeUtils.ts      # Theme utility functions
├── styleUtils.ts      # Style utility functions
├── types.ts           # Type definitions
└── index.ts
```

The core utilities provide:
- Glass effect mixins for styled-components
- CSS utility functions for kebab-case properties
- Color manipulation functions
- Theme context creation

### Theme Module

The theme module provides theming support:

```
theme/
├── ThemeProvider.tsx  # Theme provider component
├── GlassContext.tsx   # Glass UI context
├── tokens.ts          # Design tokens (colors, spacing, etc.)
├── constants.ts       # Theme constants
└── index.ts
```

This module includes:
- A theme provider that respects user preferences
- Design tokens (colors, typography, spacing)
- Constants for theme variants and presets
- Glass-specific context for glass effects

### Animations Module

The animations module provides animation utilities:

```
animations/
├── keyframes/
│   ├── basic.ts       # Basic animations (fade, slide, etc.)
│   ├── glass.ts       # Glass-specific animations
│   └── motion.ts      # Motion animations
├── physics/
│   ├── springAnimation.ts   # Spring physics animations
│   ├── particleSystem.ts    # Particle effects
│   └── magneticEffect.ts    # Magnetic effects
├── hooks/
│   ├── useMouseCursorEffect.ts # Mouse cursor effects
│   └── index.ts
├── animationUtils.ts  # Animation utility functions
└── index.ts
```

This module provides:
- Keyframe definitions for common animations
- Physics-based animation effects
- Utility functions for accessible animations
- Support for reduced motion preferences

### Hooks Module

The hooks module provides React hooks:

```
hooks/
├── useGlassEffects.ts      # Hook for glass effects
├── useReducedMotion.ts     # Hook for motion preferences
├── useGlassTheme.ts        # Hook for theme access
├── usePhysicsInteraction.ts # Hook for physics interactions
└── index.ts
```

These hooks enable:
- Easy access to glass effects in components
- Physics-based interactions for elements
- Detection of user preferences
- Theme-aware styling
- Optimized performance

## Package Exports

The package.json defines subpath exports for each module:

```json
"exports": {
  ".": {
    "import": "./dist/index.esm.js",
    "require": "./dist/index.js",
    "types": "./dist/index.d.ts"
  },
  "./core": { ... },
  "./theme": { ... },
  "./animations": { ... },
  "./components": { ... },
  "./hooks": { ... }
}
```

This enables importing from specific modules:

```js
// Import the entire library
import { Button, Card } from 'galileo-glass-ui';

// Import from specific modules for better tree-shaking
import { Button } from 'galileo-glass-ui/components';
import { createThemeContext } from 'galileo-glass-ui/core';
import { useGlassEffects } from 'galileo-glass-ui/hooks';
```

## Component Pattern

Each component follows a consistent pattern:

1. **Props Interface**: Define props with TypeScript
2. **Styled Components**: Define styled components with proper CSS properties
3. **Base Component**: Implement the standard component
4. **Glass Component**: Extend the base component with glass styling
5. **Re-export Both**: Export both standard and glass versions

Example:

```jsx
// Standard component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // Implementation
});

// Glass variant
export const GlassButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <Button
      ref={ref}
      glass={true}
      {...props}
    />
  );
});
```

## Mixin Pattern

Glass effect mixins follow a consistent pattern:

1. **Options Interface**: Define options with TypeScript
2. **Function Implementation**: Accept options and return CSS
3. **Theme Context Usage**: Use theme context for styling

Example:

```jsx
export interface GlassSurfaceOptions {
  elevation?: number;
  blurStrength?: string;
  themeContext?: any;
  // ...
}

export const glassSurface = (options: GlassSurfaceOptions) => {
  // Implementation that returns CSS
};
```

## Animation Pattern

Animations follow a consistent pattern:

1. **Keyframe Definition**: Define keyframes using styled-components
2. **Animation Utility**: Provide utility functions for using animations
3. **Accessibility Support**: Include support for reduced motion

Example:

```jsx
// Keyframe definition
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Animation utility
export const accessibleAnimation = (options: AnimateOptions) => {
  // Implementation that returns CSS with accessibility support
};
```

## Physics Hook Pattern

Physics hooks follow a consistent pattern:

1. **Options Interface**: Define options with TypeScript
2. **Function Implementation**: Accept options and provide physics effects
3. **Accessibility Support**: Include reduced motion support

Example:

```jsx
export interface PhysicsInteractionOptions {
  type?: PhysicsInteractionType;
  strength?: number;
  // ...
}

export const usePhysicsInteraction = (options: PhysicsInteractionOptions) => {
  // Implementation that returns physics-based effects
  return {
    ref,
    style,
    state,
    eventHandlers
  };
};
```

## Hook Pattern

Hooks follow a consistent pattern:

1. **Parameter Interface**: Define parameters with TypeScript
2. **Return Interface**: Define return values with TypeScript
3. **Implementation**: Follow React hooks best practices

Example:

```jsx
export const useGlassEffects = () => {
  // Implementation that returns glass effect functions
  return {
    createGlassSurface,
    createGlassGlow,
    // ...
  };
};
```

## Critical Implementation Requirements

### 1. CSS Property Naming in Styled Components

**ALWAYS use kebab-case (not camelCase) for CSS properties in styled-components template literals:**

```tsx
// ✅ CORRECT: Use kebab-case for CSS properties in styled-components
const Component = styled.div`
  background-color: rgba(255, 255, 255, 0.1);  // ✅ Correct!
  backdrop-filter: blur(10px);                // ✅ Correct!
  border-radius: 8px;                         // ✅ Correct!
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); // ✅ Correct!
`;

// ❌ INCORRECT: Will cause runtime errors!
const Component = styled.div`
  backgroundColor: rgba(255, 255, 255, 0.1);  // ❌ Wrong!
  backdropFilter: blur(10px);                // ❌ Wrong!
  borderRadius: 8px;                         // ❌ Wrong!
  boxShadow: 0 4px 20px rgba(0, 0, 0, 0.15); // ❌ Wrong!
`;
```

### 2. Always Pass Theme Context to Glass Mixins

**ALWAYS pass themeContext to glass mixins:**

```tsx
// ✅ CORRECT: Pass themeContext to glass mixins
import { glassSurface } from 'galileo-glass-ui/mixins';
import { createThemeContext } from 'galileo-glass-ui/core';

const GlassComponent = styled.div`
  ${props => glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    themeContext: createThemeContext(props.theme) // Important!
  })}
`;
```

For more detailed documentation on specific components and features, please refer to the documentation in the docs/ directory.

This architecture provides a clean, modular, and maintainable foundation for the Glass UI system.