# Galileo Glass UI Framework v1.0

> **A comprehensive independent glass morphism design system for modern interfaces**

Galileo Glass UI is a complete, standalone UI framework built on the principles of glass morphism, creating interfaces with depth, dimensionality, and sophisticated lighting effects. This custom design system has been built from the ground up, providing a solution that offers full creative control and optimized performance.

The system includes customizable components, responsive behaviors, and physics-based animations to create immersive, premium user experiences with a distinctive glass-like aesthetic.

---

## Introduction

Galileo Glass is a React-based UI framework that implements glass morphism design principles with styled-components. It provides a complete set of components, utilities, and design tokens to create consistent, beautiful interfaces with translucent, dimensional surfaces.

### Key Features

- **Premium Glass Components**: 90+ UI components including 79 specialized Glass components  
- **Enhanced Z-Space System**: Meaningful depth and layout hierarchy  
- **Physics-Based Animations**: Natural motion with spring animations and path physics  
- **Atmospheric Environments**: Dynamic backgrounds and contextual adaptations  
- **Advanced Light Effects**: Sophisticated glow, reflection, and shadow systems  
- **Responsive Adaptations**: Quality adjustments for different devices and screens  
- **Accessibility Compliance**: WCAG 2.1 AA compliant with reduced motion support  
- **Performance Optimization**: Device-aware quality adjustments  
- **Theme Variants**: Multiple visual themes with light/dark modes  

---

## Documentation Resources

This framework guide serves as the primary entry point for understanding the Galileo Glass UI system. For specific features and implementation details, please refer to the specialized documentation files:

### Core Concepts
- [Theme Provider](./ThemeProvider.md) - Theme system implementation details
- [Specialized Surfaces](./SpecializedSurfaces.md) - Advanced glass surfaces
- [Glass Charts](./GlassCharts.md) - Data visualization components
- [Advanced Components](./AdvancedComponents.md) - Complex UI components

### Implementation Guides
- [Optimization Techniques](./guides/OptimizationTechniques.md) - Performance optimization
- [Memoization Patterns](./guides/MemoizationPatterns.md) - Caching patterns for performance

### Project Architecture
- [Project Structure](../STRUCTURE.md) - Overall package architecture

---

## Table of Contents

1. [Implementation Requirements](#implementation-requirements)  
   1. [CSS Property Naming in Styled Components](#1-css-property-naming-in-styled-components)  
   2. [Glass UI Import Patterns](#2-glass-ui-import-patterns)  
2. [Quick Start Templates](#quick-start-templates)  
   1. [Basic Glass Card Component](#basic-glass-card-component-with-standard-pattern)  
   2. [Glass Button with Effects](#glass-button-with-effects-using-standard-pattern)  
3. [Design System Structure](#design-system-structure)  
4. [Common Errors and Solutions](#common-errors-and-solutions)  
   1. [Missing Theme Context](#error-1-missing-theme-context)  
   2. [CSS Properties Not Applying](#error-2-css-properties-not-applying)  
5. [Core Concepts](#core-concepts)  
   1. [Glass Morphism Principles](#glass-morphism-principles)  
   2. [Design Philosophy](#design-philosophy)  
6. [Getting Started](#getting-started)  
   1. [Installation](#installation)  
   2. [Basic Setup](#basic-setup)  
   3. [Import Patterns](#import-patterns)  
7. [Theme System](#theme-system)  
   1. [Theme Variants](#theme-variants)  
   2. [Primary Theme Colors](#primary-theme-colors)  
   3. [Domain-Specific Token Files](#domain-specific-token-files)  
   4. [Animation System](#animation-system)  
   5. [Theme Access Pattern](#theme-access-pattern)  
   6. [Theme Spacing System](#theme-spacing-system)  
   7. [Typography System](#typography-system)  
   8. [Theme Hook](#theme-hook)  
   9. [Creating Custom Themed Components](#creating-custom-themed-components)  
8. [Component Library](#component-library)  
   1. [Layout Components](#layout-components)  
   2. [Typography Components](#typography-components)  
   3. [Input Components](#input-components)  
   4. [Navigation Components](#navigation-components)  
   5. [Feedback Components](#feedback-components)  
   6. [Data Display Components](#data-display-components)  
   7. [Utility Components](#utility-components)  
   8. [Glass Presets](#glass-presets)  
   9. [GlassIcon Component](#glassicon-component)  
9. [Glass Surface System](#glass-surface-system)  
   1. [Glass Surface Properties](#glass-surface-properties)  
   2. [Standard Glass Surface CSS](#standard-glass-surface-css)  
   3. [Mixins Directory Structure](#mixins-directory-structure)  
   4. [Using Glass Mixins](#using-glass-mixins)  
10. [Z-Space Layering](#z-space-layering)  
    1. [Dual Z-Index Systems](#dual-z-index-systems)  
    2. [Elevation Shadow Standards](#elevation-shadow-standards)  
    3. [Relationship Between Z-Index Systems](#relationship-between-z-index-systems)  
    4. [Component-to-Layer Mapping](#component-to-layer-mapping)  
    5. [Z-Space Mixins](#z-space-mixins)  
11. [Animation System (v1.0.5 Overhaul)](#animation-system-v105-overhaul)  
    1. [Animation Principles](#animation-principles)  
    2. [Animation Architecture](#animation-architecture)  
    3. [Core Animation Hooks](#core-animation-hooks)  
    4. [Performance & Optimization](#performance-optimization)  
    5. [Accessibility](#accessibility)  
    6. [Configuration](#configuration)  
    7. [Timing Guidelines](#timing-guidelines)  
12. [Advanced Features](#advanced-features)  
    1. [Dynamic Atmospheric Backgrounds](#dynamic-atmospheric-backgrounds)  
    2. [Context-Aware Glass](#context-aware-glass)  
13. [Implementation Guidelines](#implementation-guidelines)  
    1. [Component Best Practices](#component-best-practices)  
    2. [Styling Guidelines](#styling-guidelines)  
    3. [Animation Guidelines](#animation-guidelines)  
14. [Accessibility](#accessibility)  
15. [Performance Optimization](#performance-optimization)  
16. [Browser Compatibility](#browser-compatibility)  
17. [Common Patterns](#common-patterns)  
18. [Troubleshooting](#troubleshooting)  
19. [Modular Architecture (April 2025 Update)](#modular-architecture-april-2025-update)  

---

## Implementation Requirements

### 1. CSS Property Naming in Styled Components

> **⚠️ WARNING**: Always use kebab-case (not camelCase) for CSS properties in styled-components template literals. Using camelCase will cause runtime errors!

```tsx
// ✅ CORRECT: Use kebab-case for CSS properties in template literals
const Component = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

// ❌ INCORRECT: Will cause runtime errors!
const Component = styled.div`
  backgroundColor: rgba(255, 255, 255, 0.1); 
  backdropFilter: blur(10px);                
  borderRadius: 8px;                         
  boxShadow: 0 4px 20px rgba(0, 0, 0, 0.15); 
`;
```

> **Note:** Use camelCase only for inline styles in JSX/TSX:

```tsx
// For inline styles in JSX/TSX, use camelCase (this is standard React)
<div 
  style={{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  }}
/>
```

### 2. Glass UI Import Patterns

The Glass UI components use a domain-specific import structure. Here are the two correct ways to import Glass UI components:

```tsx
// Pattern 1: Standard import pattern for all components
import { innerGlow } from '../../mixins/depth/innerEffects';
import { glassGlow } from '../../mixins/effects/glowEffects';
import { edgeHighlight } from '../../mixins/effects/edgeEffects';
import { createThemeContext } from '../../core/themeUtils';

// Pattern 2: Import Glass components directly
import { 
  GlassButton, 
  GlassCard, 
  GlassTypography 
} from '../../components/Glass';
```

**When to use each pattern:**
- **Pattern 1**: For all components requiring custom glass styling (standard approach)  
- **Pattern 2**: For using pre-built Glass components (simplest approach)  

#### Glass UI Architecture

The Glass UI design system uses a modular architecture where:

1. **Domain-specific modules** contain all implementations organized by function type  
2. **ThemeContext** is properly passed to all functions for theme-aware styling  

This architecture ensures runtime safety, maintainability, and a standardized approach across all components.

#### Troubleshooting Import-Related Errors

> **⚠️ Common Error**: If you encounter runtime errors like `innerGlow is not a function` or similar issues, it's likely due to missing the `themeContext` parameter:

```tsx
// CORRECT: Domain-specific import with theme context
import { innerGlow } from '../../mixins/depth/innerEffects';
import { createThemeContext } from '../../core/themeContext';

${props => innerGlow({ 
  color: 'primary', 
  intensity: 'medium', 
  spread: 15,
  themeContext: createThemeContext(props.theme)
})}
```

**Common Error**: Missing `themeContext` parameter:

```tsx
// PROBLEM: Missing themeContext parameter 
import { innerGlow } from '../../mixins/depth/innerEffects';

${innerGlow({ color: 'primary', intensity: 'medium' })}
```

**Solution**: Always pass `themeContext` created from `props.theme`:

```tsx
import { innerGlow } from '../../mixins/depth/innerEffects';
import { createThemeContext } from '../../core/themeContext';

const Component = styled.div<{ theme: any }>`
  ${props => innerGlow({ 
    color: 'primary', 
    intensity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
`;
```

---

## Quick Start Templates

### Basic Glass Card Component with Standard Pattern

```tsx
import React from 'react';
import styled from 'styled-components';
import { glassSurface } from '../../mixins/surfaces/glassSurface';
import { GlassTypography, GlassButton } from '../../components/Glass';
import { createThemeContext } from '../../core/themeUtils';

const CardContainer = styled.div<{ theme: any }>`
  ${props => glassSurface({ 
    elevation: 2, 
    blurStrength: 'standard', 
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  /* Transitions for hover/active effects are now typically handled by animation hooks */
  /* See Section 11 or the Animation Migration Guide */
`;

interface GlassCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  title, 
  description, 
  buttonText, 
  onClick 
}) => {
  return (
    <CardContainer>
      <GlassTypography variant="h4" style={{ marginBottom: '16px' }}>
        {title}
      </GlassTypography>
      <GlassTypography variant="body1" inBo}>
    ion}sTypassBy" o
   
       <xportCard;th Efatter Reacimpor-components';
import { innerGlow } from '../../mixins/depth/innerEffects';
import { glassGlow } from '../../mixins/effects/glowEffects';
import { cssWithKebabProps } from '../../core';
import { createThemeContext } from '../../core/themeUtils';

const StyledButton = styled.button<{ theme: any }>`
  ${cssWithKebabProps`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    cursor: pointer;
  `}
  
  /* Add inner glow effect with theme context */
  ${props => innerGlow({ 
    color: 'primary', 
    intensity: 'medium', 
    spread: 15,
    themeContext: createThemeContext(props.theme)
  })}
  
  /* Hover/Active effects are now typically handled by animation hooks */
  /* See Section 11 or the Animation Migration Guide */
`;

interface CustomGlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const CustomGlassButton: React.FC<CustomGlassButtonProps> = ({ 
  children, 
  onClick 
}) => {
  return (
    <StyledButton onClick={onClick}>
      {children}
    </StyledButton>
  );
};

export default CustomGlassButton;
```

---

## Design System Structure

```
frontend/src/
├── components/
│   └── Glass/            # Pre-built Glass UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Typography.tsx
│       └── ...
│
└── design/               # Glass UI design system
    ├── core/             # Core utilities and types
    │   ├── types.ts      # Type definitions
    │   ├── styleUtils.ts # Style utilities
    │   └── ...
    ├── mixins/           # Glass effect mixins by domain
    │   ├── depth/        # Depth-related effects
    │   │   └── innerEffects.ts
    │   ├── effects/      # Visual effects
    │   │   ├── glowEffects.ts
    │   │   └── edgeEffects.ts
    │   └── surfaces/     # Surface styles
    │       └── glassSurface.ts
    ├── animations/       # Animation system
    │   ├── keyframes/    # Animation keyframes
    │   └── utils/        # Animation utilities
    └── index.ts          # Main exports
```

---

## Common Errors and Solutions

### Error 1: Missing Theme Context

> **⚠️ CRITICAL**: The most common issue is missing the `themeContext` parameter.

**Solution**:

```tsx
// ❌ INCORRECT: Missing theme context
import { innerGlow } from '../../mixins/depth/innerEffects';
// ...
${innerGlow({ color: 'primary', intensity: 'medium', spread: 15 })} // Missing themeContext!

// ✅ CORRECT: Standard pattern with theme context
import { innerGlow } from '../../mixins/depth/innerEffects';
import { createThemeContext } from '../../core/themeUtils';
// ...
${props => innerGlow({ 
  color: 'primary', 
  intensity: 'medium', 
  spread: 15,
  themeContext: createThemeContext(props.theme)
})}
```

### Error 2: CSS Properties Not Applying

> **⚠️ CRITICAL**: This occurs when using camelCase instead of kebab-case in styled-components template literals.

**Solution**:

```tsx
// ❌ INCORRECT: Using camelCase in styled-components
const Component = styled.div`
  boxShadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  borderRadius: 8px;
`;

// ✅ SOLUTION 1: Use kebab-case directly
const Component = styled.div`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

// ✅ SOLUTION 2: Use the cssWithKebabProps helper
import { cssWithKebabProps } from '../../core';

const Component = styled.div`
  ${cssWithKebabProps`
    boxShadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    borderRadius: 8px;
  `}
`;
```

---

## Core Concepts

### Glass Morphism Principles

Glass morphism creates the illusion of frosted glass with these key characteristics:

1. **Transparency**: Subtle background transparency allows content beneath to show through  
2. **Blur Effect**: Background blur creates a "frosted glass" appearance  
3. **Subtle Border**: Light borders define the glass edges  
4. **Light Interaction**: Subtle highlights and shadows suggest physical properties  
5. **Layering**: Proper z-index management creates meaningful depth  

### Design Philosophy

The Galileo Glass system is built on these foundational principles:

1. **Purposeful Transparency**: Use transparency to create depth and hierarchy  
2. **Natural Motion**: Animations mimic natural physics with appropriate easing and timing  
3. **Layered Composition**: Build interfaces with intentional layering that supports content hierarchy  
4. **Appropriate Contrast**: Maintain readability with sufficient contrast between text and glass surfaces  
5. **Balanced Effects**: Apply glass effects carefully to avoid overwhelming the interface  

---

## Getting Started

### Installation

The Glass UI system is integrated into the Galileo project and requires no additional installation.

### Basic Setup

To use Glass components, ensure you have the proper provider hierarchy:

```tsx
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AnimationProvider } from '@veerone/galileo-glass-ui';

const App: React.FC = () => {
  return (
    <ThemeProvider initialTheme="nebula">
      <AnimationProvider value={{ /* Optional animation defaults */ }}>
          {/* Application content */}
      </AnimationProvider>
    </ThemeProvider>
  );
};
```

### Import Patterns

Import Glass components from the Glass directory:

```tsx
// Import individual components
import { 
  GlassButton, 
  GlassCard, 
  GlassTypography 
} from '../../components/Glass';

// Import themed preset components
import {
  CleanGlassContainer,
  FrostedGlassContainer
} from '../../components/Glass';

// Or use preset object imports
import { ThemedGlassPresets } from '../../components/Glass';
const { Clean, Frosted } = ThemedGlassPresets.Environmental;
const { Dashboard, Form } = ThemedGlassPresets.Context;
```

---

## Theme System

### Theme Variants

The Glass UI includes several theme variants:

| Theme Variant      | Primary Colors  | Secondary Colors | Atmosphere                          |
|--------------------|-----------------|------------------|--------------------------------------|
| **Nebula** (Default) | Blues/indigos   | Light blues      | Space-like with star particles       |
| **Cosmic**         | Purples/violets | Light purples    | Deep space with cosmic dust          |
| **Aurora**         | Teals/greens    | Emerald greens   | Northern lights-inspired             |
| **Frost**          | Ice blues/cyans | Light cyans      | Cry   l**/magentas  | Light pinks      | Sunrise/sunset gradients             |

### Primary Theme Colors

| Theme Variant | Primary Light | Primary Dark | Secondary Light | Secondary Dark |
|---------------|---------------|--------------|-----------------|----------------|
| Nebula        | #4B66EA       | #3651D3      | #2CA2F6         | #1582E0        |
| Cosmic        | #8B5CF6       | #7C3AED      | #C084FC         | #A855F7        |
| Aurora        | #10B981       | #059669      | #34D399         | #10B981        |
| Frost         | #38BDF8       | #0EA5E9      | #7DD3FC         | #38BDF8        |
| Celestial     | #EC4899       | #DB2777      | #F472B6         | #EC4899        |

### Domain-Specific Token Files

```
frontend/src/design/
├── core/                  # Core system files
│   ├── types.ts           # Shared type definitions
│   ├── styleUtils.ts      # Style creation utilities
│   └── themeContext.ts    # Theme context utilities
├── domain/                # Domain-specific token files
│   ├── index.ts           # Central export hub
│   ├── colors.ts          # Color system
│   ├── spacing.ts         # Spacing system
│   ├── typography.ts      # Typography system
│   ├── shadows.ts         # Shadow system
│   └── borders.ts         # Border system
├── animations/            # Complete animation system
│   ├── core/              # Animation core architecture
│   ├── keyframes/         # Animation keyframes
│   ├── presets/           # Animation preset configurations
│   ├── orchestration/     # Animation sequencing system
│   ├── performance/       # Performance optimizations
│   ├── accessibility/     # Reduced motion support
│   └── dimensional/       # Z-Space animation system
└── ThemeProvider.tsx      # Unified theme provider
```

### Animation System (v1.0.5+)

_Introduced in v1.0.5, replacing previous animation methods._

The animation system is a core part of the Galileo Glass UI, built on an integrated physics engine (powered by React Spring) for natural, performant, and accessible motion. It utilizes a set of hooks for implementation and context for global configuration.

See [Section 11: Animation System (v1.0.5 Overhaul)](#animation-system-v105-overhaul) for a comprehensive overview and links to detailed documentation.

### Theme Access Pattern

```tsx
import { useGlassTheme } from '../../theme/ThemeProvider';
import { 
  createColorStyle, 
  createSpacingStyle, 
  createTypographyStyle 
} from '../../core/styleUtils';

const MyComponent = () => {
  const { themeContext } = useGlassTheme();
  
  return (
    <StyledElement $themeContext={themeContext} />
  );
};

interface StyledElementProps {
  $themeContext: any;
}

const StyledElement = styled.div<StyledElementProps>`
  // Type-safe color style
  ${props => createColorStyle(props.$themeContext, 'backgroundColor', 'surface')}
  
  // Type-safe spacing style
  ${props => createSpacingStyle(props.$themeContext, 'padding', 'md')}
  
  // Type-safe typography style
  ${props => createTypographyStyle(props.$themeContext, 'body1')}
`;
```

### Theme Spacing System

| Size | Value | Usage                              |
|------|-------|------------------------------------|
| xxs  | 2px   | Tiny spacing, borders              |
| xs   | 4px   | Minimal spacing, tight layouts     |
| sm   | 8px   | Small spacing, compact layouts     |
| md   | 16px  | Standard spacing, most layouts     |
| lg   | 24px  | Large spacing, section separations |
| xl   | 32px  | Extra large spacing, group separations |
| xxl  | 48px  | Major section separations          |

### Typography System

| Style     | Use Case           | Weight | Size     |
|-----------|--------------------|--------|----------|
| h1        | Page titles        | 700    | 2.5rem   |
| h2        | Section headers    | 700    | 2rem     |
| h3        | Sub-section headers | 600    | 1.5rem   |
| h4        | Card headers       | 600    | 1.25rem  |
| h5        | Small headers      | 600    | 1.125rem |
| h6        | Minor headers      | 600    | 1rem     |
| subtitle1 | Large supporting text | 500 | 1.125rem |
| subtitle2 | Supporting text    | 500    | 0.875rem |
| body1     | Primary body text  | 400    | 1rem     |
| body2     | Secondary body text | 400   | 0.875rem |
| button    | Button text        | 500    | 0.875rem |
| caption   | Small supporting text | 400 | 0.75rem  |
| overline  | Label text         | 400    | 0.75rem  |

### Theme Hook

```tsx
import { useGlassTheme } from '../../theme/GlassThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { 
    themeVariant, 
    setThemeVariant, 
    colorMode, 
    setColorMode,
    createThemedGlassEffect 
  } = useGlassTheme();

  const handleChangeTheme = () => {
    setThemeVariant('cosmic');
  };

  const handleToggleMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <GlassButton onClick={handleChangeTheme}>
        Change Theme
      </GlassButton>
      <GlassButton onClick={handleToggleMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
      </GlassButton>
    </div>
  );
};
```

### Creating Custom Themed Components

```tsx
import { useGlassTheme } from '../../theme/GlassThemeProvider';
import styled from 'styled-components';

const CustomComponent: React.FC = () => {
  const { createThemedGlassEffect } = useGlassTheme();
  
  const StyledComponent = styled.div`
    ${props => createThemedGlassEffect({ 
      depth: 2,
      glowIntensity: 'medium',
      blurStrength: 'standard',
      borderStyle: 'gradient'
    })}
    padding: 24px;
    border-radius: 12px;
  `;
  
  return (
    <StyledComponent>
      Custom themed glass component
    </StyledComponent>
  );
};
```

---

## Component Library

*Note: Many components listed with a `Glass*` prefix achieve their appearance via props (e.g., `glass={true}`) on the standard component export (like `Card`, `Grid`, `Stack`). Other components have distinct `Glass*` exports.* 

### Layout Components

- **GlassBox**: Fundamental layout component  
- **GlassContainer**: Max-width container  
- **GlassGrid**: 12-column responsive grid  
- **GlassStack**: Flexbox stack layout  
- **GlassPaper**: Surface component  
- **GlassDivider**: Horizontal/vertical divider  
- **PageGlassContainer**: Specialized container for full page layouts

### Typography Components

- **GlassTypography**: Text component with variants  
- **GlassLink**: Styled link component  

### Input Components

- **GlassButton**: Button with variants
- **MagneticButton**: Button with physics-based magnetic hover effect
- **GlassTextField**: Text input field
- **GlassSelect**: Dropdown select  
- **GlassCheckbox**: Checkbox input  
- **GlassRadio**: Radio button input  
- **GlassSwitch**: Toggle switch  
- **GlassSlider**: Range slider  
- **GlassAutocomplete**: Autocomplete input with suggestions
- **GlassDatePicker**: Date picker with calendar
- **GlassDateRangePicker**: Date range picker with comparison mode
- **GlassMultiSelect**: Token-based multi-select with physics animations
- **GlassTagInput**: Input for managing tags/labels
- **GlassToggleButton**: Toggleable button group
- **GlassRating**: Star rating component
- **GlassForm**: Form control components (FormControl, FormGroup, FormHelperText, FormLabel)

### Navigation Components

- **GlassTabs**: Tab navigation  
- **GlassTabBar**: Physics-based animated tab bar
- **GlassCardLink**: Interactive card for navigation
- **GlassPagination**: Pagination controls  
- **GlassBottomNavigation**: Mobile navigation  
- **GlassBreadcrumbs**: Breadcrumb navigation  
- **GlassToolbar**: App bar toolbar  
- **GlassAccordion**: Expandable accordion panels
- **GlassSpeedDial**: Floating action menu with speed dial
- **GlassTreeView**: Hierarchical tree navigation
- **GlassNavigation**: Advanced navigation component
- **GlassResponsiveNavigation**: Responsive navigation system
- **GlassPageTransition**: Page transition effects
- **GlassZSpaceAppLayout**: Advanced 3D layout with Z-space layering
- **GlassCarousel**: Carousel with physics-based animations
- **GlassTimeline**: Chronological data display with physics animations

### Feedback Components

- **GlassAlert**: Status alerts  
- **GlassLoader**: Loading indicators  
- **GlassProgress**: Progress bars  
- **GlassSnackbar**: Toast notifications  
- **GlassSkeleton**: Loading placeholders  
- **GlassVisualFeedback**: Enhanced visual feedback system
- **GlassRippleButton**: Button with ripple effects
- **GlassFocusIndicator**: Accessible focus indicators
- **GlassStateIndicator**: Component state visualization
- **GlassCookieConsent**: Cookie consent notifications

### Data Display Components

- **GlassCard**: Surface for content (use `<Card>`) 
- **GlassTable**: Data tables (use `<Table>`)
- **GlassList**: List containers  
- **GlassAvatar**: User avatars  
- **GlassBadge**: Badge indicators  
- **GlassImageList**: Grid of images with optional captions
- **GlassKpiCard**: Key performance indicator cards (use `<KpiCard glass>`) 
- **GlassDataChart**: Data visualization with physics animations
- **GlassPerformanceMetricCard**: Performance metric visualization
- **GlassInteractiveKpiCard**: Interactive data visualization card
- **GlassCodeBlock**: Displays formatted code snippets

### Utility Components

- **GlassBackdrop**: Modal backdrop (use `<Backdrop>`) 
- **GlassFab**: Floating action button  
- **GlassDrawer**: Side drawer  
- **GlassModal**: Modal dialog  
- **GlassTooltip**: Contextual tooltips  
- **GlassImageViewer**: Interactive image viewer with zoom and pan
- **Icon**: Component for displaying icons (use props like `glass` and `glowEffect` for styling)
- **GlassThemeComponents**: Theme management (GlassThemeSwitcher, GlassThemeDemo)
- **GlassPerformanceMonitor**: Performance monitoring utilities
- **GlassOptimizedContainer**: Performance-optimized container
- **GlassDynamicAtmosphere**: Dynamic background effects
- **ChartWrapper**: Wrapper for chart components

### Specialized Surface Components

- **GlassDimensionalGlass**: Glass with enhanced 3D depth effects
- **GlassHeatGlass**: Heat-sensitive glass effects
- **GlassFrostedGlass**: Frosted glass visual treatment
- **GlassWidgetGlass**: Specialized glass for dashboard widgets
- **GlassAtmosphericBackground**: Advanced atmospheric backgrounds
- **GlassParticleBackground**: Interactive particle system backgrounds
- **GlassContextAwareGlass**: Content-adaptive glass surfaces

### Glass Presets

- **Environmental**:
  - `CleanGlassContainer`
  - `FrostedGlassContainer`
  - `TexturedGlassContainer`
- **Intensity**:
  - `SubtleGlassContainer`
  - `StandardGlassContainer`
  - `ImmersiveGlassContainer`
- **Context**:
  - `DashboardGlassContainer`
  - `FormGlassContainer`
  - `ModalGlassContainer`

### GlassIcon Component

*(Previous content of Section 9 removed or merged into notes for the standard Icon component)*

---

## Glass Surface System

### Glass Surface Properties

| Surface Type  | Light Mode | Dark Mode |
|---------------|-----------|-----------|
| Base          | 6% opacity  | 65% opacity |
| Elevated      | 12% opacity | 70% opacity |
| Interactive   | 15% opacity | 75% opacity |
| Modal/Dialog  | 20% opacity | 80% opacity |

#### Blur Values

| Level   | Light Mode Blur | Dark Mode Blur | Saturation Adjustment |
|---------|-----------------|----------------|------------------------|
| 1 (Base) | 5px             | 8px            | 105%                  |
| 2 (Card) | 10px            | 12px           | 110%                  |
| 3 (Elevated) | 15px        | 18px           | 115%                  |
| 4 (Modal) | 20px           | 25px           | 120%                  |

#### Border Styles

| Border Type  | Light Mode                                        | Dark Mode                                         |
|--------------|---------------------------------------------------|---------------------------------------------------|
| Standard     | rgba(255, 255, 255, 0.10)                         | rgba(255, 255, 255, 0.08)                         |
| Enhanced     | rgba(255, 255, 255, 0.20)                         | rgba(255, 255, 255, 0.15)                         |
| Highlighted  | rgba(255, 255, 255, 0.30)                         | rgba(255, 255, 255, 0.25)                         |
| Gradient     | Linear gradient rgba(255, 255, 255, 0.2 → 0.05)   | Linear gradient rgba(255, 255, 255, 0.15 → 0.03)  |

### Standard Glass Surface CSS

```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(10px);
border-radius: 12px;
border: 1px solid rgba(255, 255, 255, 0.12);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
```

### Mixins Directory Structure

```
frontend/src/design/
├── mixins/
│   ├── index.ts          
│   ├── core/
│   │   ├── index.ts      
│   │   ├── colors.ts     
│   │   ├── types.ts      
│   │   └── utils.ts      
│   ├── surfaces/
│   │   ├── index.ts
│   │   ├── glassSurface.ts
│   │   └── backgroundEffects.ts
│   ├── effects/
│   │   ├── index.ts
│   │   ├── glowEffects.ts     
│   │   ├── edgeEffects.ts     
│   │   └── ambientEffects.ts  
│   ├── interaction/
│   │   ├── index.ts
│   │   ├── focusStates.ts     
│   │   └── hoverStates.ts
│   └── depth/
│       ├── index.ts
│       ├── innerEffects.ts    
│       └── zSpaceEffects.ts
```

### Using Glass Mixins

#### glassSurface

```tsx
import { glassSurface } from '../../mixins/surfaces/glassSurface';
import styled from 'styled-components';

const GlassCard = styled.div`
  ${glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    borderOpacity: 'medium'
  })}
  padding: 24px;
  border-radius: 12px;
`;
```

#### interactiveGlass

```tsx
import { interactiveGlass } from '../../mixins/interaction/interactiveGlass';
import styled from 'styled-components';

const InteractiveCard = styled.div`
  ${interactiveGlass({
    variant: 'primary',
    feedback: 'all',
    glowColor: 'primary', 
    depth: 2
  })}
  padding: 24px;
  border-radius: 12px;
`;
```

#### glassGlow

```tsx
import { glassGlow } from '../../mixins/effects/glowEffects';
import styled from 'styled-components';

const GlowingElement = styled.div`
  ${glassGlow({
    intensity: 'medium', 
    color: 'primary',
    pulsing: false
  })}
  padding: 16px;
`;
```

#### glassBorder

```tsx
import { glassBorder } from '../../mixins/surfaces/glassBorder';
import styled from 'styled-components';

const BorderedCard = styled.div`
  ${glassBorder({
    style: 'solid',
    color: 'neutral',
    opacity: 'subtle',
    width: 1
  })}
  padding: 16px;
`;

const GlowBorderButton = styled.button`
  ${glassBorder({
    style: 'glow',
    color: 'primary',
    opacity: 'medium',
    width: 1
  })}
  padding: 10px 20px;
`;
```

#### innerGlow

```tsx
import { innerGlow } from '../../mixins/depth/innerEffects';
import styled from 'styled-components';

const GlowCard = styled.div`
  ${innerGlow({
    color: 'primary',
    intensity: 'medium',
    spread: 15
  })}
  padding: 20px;
`;
```

#### ambientGlow

```tsx
import { ambientGlow } from '../../mixins/effects/ambientEffects';
import styled from 'styled-components';

const AmbientCard = styled.div`
  ${ambientGlow({
    direction: 'top',
    color: 'rgba(255, 255, 255, 0.3)',
    size: '80%',
    intensity: 'medium'
  })}
  padding: 20px;
`;
```

---

## Z-Space Layering

The Glass UI framework implements two complementary z-index systems for proper visual layering.

### Dual Z-Index Systems

#### 1. Standard Four-Layer System

| Z-Layer      | Z-Index Value | Usage                                                           |
|-------------:|--------------:|-----------------------------------------------------------------|
| Base         | 0             | Background elements and non-interactive content                 |
| Content      | 10            | Primary containers, cards, and panels                           |
| Interactive  | 20            | Interactive elements and focused content                        |
| Elevated     | 30            | Modals, tooltips, and attention-requiring elements              |

| Component   | Z-Index Value | Layer        |
|-------------|---------------|--------------|
| Background  | 0             | Base         |
| Card        | 5             | Content      |
| Panel       | 8             | Content      |
| Header      | 15            | Interactive  |
| Navigation  | 18            | Interactive  |
| Dropdown    | 25            | Interactive  |
| Overlay     | 28            | Interactive  |
| Modal       | 35            | Elevated     |
| Dialog      | 38            | Elevated     |
| Tooltip     | 40            | Elevated     |
| Notification| 45            | Elevated     |
| Spotlight   | 50            | Elevated     |

#### 2. Advanced Layer System

| Z-Layer          | Z-Index Value | Usage                                      |
|------------------|--------------:|--------------------------------------------|
| Background       | -100          | Content positioned behind the baseline     |
| Base Layer       | 0             | Background panels, non-interactive elements |
| Content Layer    | 1000          | Primary content – articles, cards, sections |
| Interactive Layer| 2000          | Buttons, inputs, interactive components     |
| Floating Layer   | 3000          | Dropdowns, tooltips, popovers               |
| Sticky Elements  | 4000          | Headers, nav bars, sticky elements          |
| Sidebar Layer    | 5000          | Sidebars, panels, drawers                   |
| Overlay Layer    | 6000          | Overlays, backdrops                         |
| Modal Layer      | 7000          | Modal dialogs, alert boxes                  |
| Notification Layer| 8000         | Toast notifications, banners                |
| Top Layer        | 9000          | Critical alerts, global notifications       |
| Debug Layer      | 10000         | Debug tools, visualizers                    |

### Elevation Shadow Standards

| Elevation | Box Shadow Value                                                  |
|----------:|-------------------------------------------------------------------|
| 0         | none                                                              |
| 1         | 0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)        |
| 2         | 0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12)       |
| 3         | 0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15)       |
| 4         | 0 12px 24px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.18)    |
| 5         | 0 16px 32px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.2)    |

### Relationship Between Z-Index Systems

The standard four-layer system is mapped to the advanced layer system internally as needed:

| Four-Layer System | Z-Space Value    | Advanced Layer System |
|-------------------|------------------|------------------------|
| Base              | Z_SPACE.BASE     | BASE_LAYER (0)         |
| Content           | Z_SPACE.CONTENT  | CONTENT_LAYER (1000)   |
| Interactive       | Z_SPACE.INTERACTIVE | INTERACTIVE_LAYER (2000) |
| Elevated          | Z_SPACE.ELEVATED | FLOATING_LAYER (3000)  |

### Component-to-Layer Mapping

| Component Type | Z-Layer           | System        |
|----------------|-------------------|---------------|
| background     | BASE_LAYER        | Advanced      |
| card           | CONTENT_LAYER     | Advanced      |
| button         | INTERACTIVE_LAYER | Advanced      |
| input          | INTERACTIVE_LAYER | Advanced      |
| dropdown       | FLOATING_LAYER    | Advanced      |
| tooltip        | FLOATING_LAYER    | Advanced      |
| header         | STICKY_ELEMENTS   | Advanced      |
| navigation     | STICKY_ELEMENTS   | Advanced      |
| modal          | MODAL_LAYER       | Advanced      |
| dialog         | MODAL_LAYER       | Advanced      |
| notification   | NOTIFICATION_LAYER| Advanced      |
| alert          | TOP_LAYER         | Advanced      |

### Z-Space Mixins

```tsx
import { zSpaceLayer } from '../../mixins/depth/zSpaceEffects';
import styled from 'styled-components';
import { createThemeContext } from '../../core';

const BaseLayer = styled.div<{ theme: any }>`
  ${props => zSpaceLayer({
    layer: 1,
    themeContext: createThemeContext(props.theme)
  })}
  padding: 16px;
`;

const ElevatedLayer = styled.div<{ theme: any }>`
  ${props => zSpaceLayer({
    layer: 3,
    color: 'primary',
    glowEffect: true,
    glowIntensity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  padding: 20px;
`;

const ModalContainer = styled.div<{ theme: any }>`
  ${props => zSpaceLayer({
    componentType: 'modal',
    createStackingContext: true,
    themeContext: createThemeContext(props.theme)
  })}
  padding: 24px;
`;
```

---

## Animation System (v1.0.5 Overhaul)

Version 1.0.5 introduced a completely redesigned, integrated animation system built from the ground up for Galileo Glass UI. This system prioritizes **realistic physics-based motion**, **performance**, **accessibility**, and a **unified developer experience**, replacing previous methods and external dependencies.

### Animation Principles

- **Natural Motion**: Leverage spring physics for organic, responsive movement that mimics the real world.
- **Purposeful Interaction**: Animations should provide clear feedback, guide attention, and enhance usability without being distracting.
- **Performance First**: Ensure smooth 60fps animations across devices through adaptive quality scaling and GPU acceleration.
- **Accessibility Centric**: Comprehensive support for reduced motion preferences with fine-grained control.
- **Consistency**: Provide a unified set of hooks and patterns for all animations.

### Animation Architecture

The new system is built around a core set of integrated modules:

- **Physics Engine (`galileoPhysicsSystem.ts`)**: Manages spring calculations, collision detection, forces, and performance optimizations.
- **Interaction Hooks**: Provide easy-to-use abstractions for common animation scenarios:
    - `usePhysicsInteraction`: For hover/press effects on elements.
    - `useGalileoStateSpring`: For animating single numerical values.
    - `useMultiSpring`: For animating multiple values (vectors) concurrently.
    - `useGesturePhysics`: For physics-based responses to user gestures.
- **Orchestration (`useAnimationSequence`)**: Enables complex, timed, and dependent sequences.
- **Accessibility (`useReducedMotion`)**: Manages user preferences for reduced motion, sensitivity levels, categories, and alternatives.
- **Adaptive Performance**: The `useAdaptiveQuality` hook adjusts animation fidelity based on the runtime environment.
- **Rendering**: Primarily uses `requestAnimationFrame` for direct style manipulation, ensuring optimal control and performance.

### Core Animation Hooks

These hooks are the primary tools for implementing animations:

- **`usePhysicsInteraction`**: Apply physics (spring, magnetic) to elements on hover/press. Ideal for buttons, cards, interactive elements.
  ```tsx
  import { usePhysicsInteraction } from '../../hooks/usePhysicsInteraction';
  
  const { ref, style, eventHandlers } = usePhysicsInteraction({
    animationConfig: 'gentle', // Use context presets
    affectsScale: true,
    scaleAmplitude: 0.05
  });
  // Apply ref, style, eventHandlers to the element
  ```
- **`useGalileoStateSpring`**: Animate a single number (e.g., opacity, height).
  ```tsx
  import { useGalileoStateSpring } from '../../hooks/useGalileoStateSpring';
  
  const { value: opacity } = useGalileoStateSpring(isVisible ? 1 : 0, {
    animationConfig: 'DEFAULT'
  });
  // Use opacity in style={{ opacity }}
  ```
- **`useMultiSpring`**: Animate multiple numbers simultaneously (e.g., position, scale).
  ```tsx
  import { useMultiSpring } from '../../animations/physics/useMultiSpring';
  
  const { values } = useMultiSpring({
    from: { x: 0, scale: 1 },
    to: { x: 100, scale: 1.1 },
    animationConfig: 'wobbly'
  });
  // Use values.x, values.scale in transform style
  ```
- **`useAnimationSequence`**: Create complex sequences with timing, dependencies, and staggering.
  ```tsx
  import { useAnimationSequence } from '../../animations/orchestration/useAnimationSequence';

  const controls = useAnimationSequence({
    stages: [
      { id: 'fade', type: 'style', targets: '#el', duration: 500, from: { opacity: 0 }, to: { opacity: 1 } },
      { id: 'move', type: 'style', targets: '#el', duration: 800, dependsOn: ['fade'], to: { transform: 'translateX(100px)' } }
    ]
  });
  // Use controls.play(), controls.pause(), etc.
  ```

**For detailed API and usage, see:**
- [Core Physics Hooks Documentation](../../hooks/physics-interaction.md)
- [Sequence Orchestration Documentation](../../animations/orchestration.md)

### Performance & Optimization

- **Adaptive Quality**: Automatically adjusts physics precision and effect fidelity based on device capabilities.
- **Object Sleeping**: Physics calculations pause for elements at rest.
- **GPU Acceleration**: Utilizes `transform: translate3d` and `will-change` where appropriate.

### Accessibility (`useReducedMotion`)

The system provides robust accessibility support via the `useReducedMotion` hook:
- Detects system `prefers-reduced-motion`.
- Allows app-level overrides and persistence via `localStorage`.
- Supports **Motion Sensitivity Levels** (Low, Medium, High) to fine-tune animation intensity.
- Uses **Animation Categories** (Essential, Transition, Feedback, etc.) to allow selective disabling/modification.
- Provides **Alternative Animations** (Fade, Static, etc.) when motion is reduced.

Components internally use `useReducedMotion` to check `prefersReducedMotion`, `isAnimationAllowed(category)`, `getAdjustedDuration()`, etc., to adapt behavior.

**For details, see:** [Animation Accessibility Documentation](../../animations/accessibility.md)

### Configuration (`useAnimationContext`)

Default animation behaviors (especially spring presets) can be configured globally using `AnimationProvider`.

```tsx
import { AnimationProvider } from '../../contexts/AnimationContext';

<AnimationProvider value={{ defaultSpring: 'gentle', pressSpringConfig: 'SNAPPY' }}>
  {/* App components */} 
</AnimationProvider>
```

Components use `useAnimationContext` to consume these defaults, ensuring consistency.

**For details, see:** [Context & Configuration Documentation](../../animations/context-config.md)

### Timing Guidelines

While physics-based animations don't have fixed durations, the perceived speed is controlled by `tension` and `friction` (or presets). General timing goals remain similar:

| Interaction Type       | Goal           | Typical Presets              |
|------------------------|----------------|------------------------------|
| Micro-interactions     | Quick Feedback | `SNAPPY`, `PRESS_FEEDBACK`, `HOVER_QUICK` |
| UI Entrances/Exits     | Smooth & Clear | `DEFAULT`, `GENTLE`, `MODAL_TRANSITION` |
| Complex Transitions    | Engaging Flow  | `GENTLE`, `WOBBLY` (use carefully) |
| Attention Effects      | Noticeable     | `BOUNCY`, `ELASTIC` (use sparingly) |

---

## Advanced Features

### Dynamic Atmospheric Backgrounds

```tsx
import { DynamicAtmosphereBackground } from '../../components/Glass';

<DynamicAtmosphereBackground
  type="nebula"
  intensity="medium"
  interactivity="mouse"
  fullscreen
>
  <GlassContainer>
    <GlassTypography variant="h2">
      Content with Dynamic Background
    </GlassTypography>
  </GlassContainer>
</DynamicAtmosphereBackground>
```

**Atmosphere Types**:
- nebula, aurora, cosmos, quantum, gradient, flow, glimmer, matrix, ambient

### Context-Aware Glass

```tsx
import { ContextAwareGlass } from '../../components/Glass';

<ContextAwareGlass
  adaptationMode="content"
  contentColorSensitivity="medium"
  glassParams={{
    elevation: 2,
    borderStyle: 'gradient'
  }}
>
  <GlassTypography>
    This glass adapts to its content and surroundings
  </GlassTypography>
  <img src="/path/to/image.jpg" alt="Sample content" />
</ContextAwareGlass>
```

---

## Implementation Guidelines

### Component Best Practices

1. **Follow Import Patterns**: Import components directly from the Glass directory  
2. **Respect Z-Space Hierarchy**: Use consistent elevation levels and z-indices  
3. **Use Glass Presets**: Leverage preset containers for common scenarios  
4. **Maintain Accessibility**: Ensure all Glass components are accessible  
5. **Consider Performance**: Use simplified effects on lower-end devices  

### Styling Guidelines

1. **Use kebab-case in styled-components**:
   
   const Component = styled.div`
     background-color: rgba(255, 255, 255, 0.1);
     backdrop-filter: blur(10px);
     border-radius: 8px;
     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
     align-items: center;
     text-transform: uppercase;
   `;
   
2. **Use Mixins for Consistency**:
   
   const GlassElement = styled.div`
     ${glassSurface({
       elevation: 2,
       blurStrength: 'standard',
       borderOpacity: 'medium'
     })}
     padding: 24px;
   `;
   
3. **Limit Nested Glass Layers**:
   
   // Avoid too many nested glass layers
   <GlassContainer>
     <GlassCard>
       <GlassPanel>
         <GlassBox>Too many layers!</GlassBox>
       </GlassPanel>
     </GlassCard>
   </GlassContainer>
   
   // Better
   <GlassContainer>
     <GlassCard>
       <RegularPanel>
         Minimal layering
       </RegularPanel>
     </GlassCard>
   </GlassContainer>
   

### Animation Guidelines (v1.0.5+)

1.  **Use Core Animation Hooks:**
    *   Prefer the provided hooks (`usePhysicsInteraction`, `useGalileoStateSpring`, `useMultiSpring`, `useAnimationSequence`) over direct CSS transitions/animations or external libraries (like Framer Motion, which has been removed).
    *   Choose the appropriate hook for the task (single value, multiple values, interaction, sequence).
2.  **Leverage Animation Context & Presets:**
    *   Use `useAnimationContext` to consume default spring configurations.
    *   Prefer using standard preset names (e.g., `'gentle'`, `'PRESS_FEEDBACK'`) passed to the `animationConfig` prop of hooks for consistency.
    *   Define custom `SpringConfig` objects (`{ tension, friction, mass }`) only when necessary.
3.  **Prioritize Performance:**
    *   The new system is optimized, but be mindful of animating many elements simultaneously, especially with complex sequences or physics.
    *   Rely on the built-in adaptive performance features.
    *   Continue to prefer animating `transform` and `opacity` where applicable, although the hooks manage this internally.
    *   Use `will-change` judiciously if profiling reveals specific bottlenecks not handled by the hooks.
4.  **Ensure Accessibility:**
    *   Assign meaningful `AnimationCategory` values where appropriate (though hooks often infer this).
    *   Rely on the `useReducedMotion` hook (used internally by core hooks) to handle `prefers-reduced-motion`.
    *   Test components with reduced motion enabled.
    *   Provide non-animation alternatives for conveying critical information if complex animations are used.
5.  **Keep Animations Purposeful:**
    *   Ensure animations serve a purpose (feedback, guidance, delight) and aren't purely decorative unless appropriate and controllable (e.g., background effects).
    *   Follow recommended timing/feel guidelines by using appropriate presets.

---

## Accessibility

Galileo Glass UI is designed with accessibility as a fundamental principle.

### Contrast Requirements

- **Minimum 4.5:1** contrast ratio for text on glass (WCAG 2.1 AA).
- **7:1** ratio for highly important text (AAA compliance) recommended.
- Distinctive focus states for interactive elements (minimum 3:1 contrast ratio for the focus indicator against its background).

### Reduced Motion (v1.0.5+)

- **Comprehensive Support:** The framework deeply integrates accessibility for motion sensitivity using the `useReducedMotion` hook.
- **System & App Settings:** Detects `prefers-reduced-motion` and allows persistent app-level overrides via `localStorage`.
- **Fine-Grained Control:** Supports sensitivity levels, animation categories, and alternative animation types (e.g., fade, static).
- **Automatic Adaptation:** Core animation hooks (`usePhysicsInteraction`, `useGalileoStateSpring`, etc.) automatically respect these preferences, often disabling or modifying animations appropriately.
- **Developer Guidance:** See the dedicated [Animation Accessibility Documentation](../../animations/accessibility.md) for details on using `useReducedMotion` and best practices.

### Keyboard Navigation & Focus Management
- All interactive components are designed for full keyboard navigability (Tab, Shift+Tab, Arrow keys where appropriate).
- Focus indicators (`GlassFocusIndicator`) are clearly visible and respect reduced motion.
- Focus is managed logically within complex components like Modals, Drawers, and Menus.

### ARIA Attributes
- Appropriate ARIA roles, states, and properties are used to ensure compatibility with screen readers and other assistive technologies.

---

## Performance Optimization

### Device-Aware Quality with useAdaptiveQuality

The Galileo Glass UI framework provides a comprehensive hook for adaptive quality rendering that automatically adjusts visual complexity based on device capabilities:

```tsx
import { useAdaptiveQuality } from '@veerone/galileo-glass-ui/hooks';

const OptimizedComponent = () => {
  const { 
    qualityTier, 
    adaptiveSettings,
    setQualityPreference
  } = useAdaptiveQuality();
  
  return (
    <GlassContainer
      blurStrength={adaptiveSettings.blurStrength}
      enableGlowEffects={adaptiveSettings.enableGlowEffects}
    >
      <GlassTypography>Performance-optimized content</GlassTypography>
      
      {/* Quality tier selector for user preference */}
      <GlassSelect
        value={qualityTier}
        onChange={(value) => setQualityPreference(value)}
        options={[
          { value: 'Low', label: 'Low Quality (Best Performance)' },
          { value: 'Medium', label: 'Medium Quality' },
          { value: 'High', label: 'High Quality' },
          { value: 'Ultra', label: 'Ultra Quality (Best Visual)' }
        ]}
      />
    </GlassContainer>
  );
};
```

**Key Features:**

1. **Automatic Detection:** Analyzes device capabilities including CPU cores, memory, WebGL support, backdrop filter support, and more.
2. **Quality Tiers:** Determines the appropriate quality level (LOW, MEDIUM, HIGH, ULTRA) based on detected capabilities.
3. **Ready-to-Use Settings:** Provides specific settings like `maxParticles`, `blurStrength`, and `enableGlowEffects` that components can use directly.
4. **User Preferences:** Allows users to override the automatic detection with their preferred quality level, saved to localStorage.
5. **Battery Awareness:** Can automatically reduce quality when battery is low to conserve power.
6. **Data-Saving Support:** Respects the browser's data-saving mode setting and reduces quality accordingly.
7. **Network Detection:** Provides information about the connection type and speed for further optimization.
8. **SSR Compatibility:** Works in server-side rendering environments with appropriate defaults.

**Implementation Example:**

```tsx
// In a particle system component
function ParticleSystemBackground() {
  const { adaptiveSettings } = useAdaptiveQuality();
  
  return (
    <ParticleSystem
      maxParticles={adaptiveSettings.maxParticles}
      complexity={adaptiveSettings.particleComplexity}
      useHighResTextures={adaptiveSettings.useHighResTextures}
    />
  );
}
```

This approach ensures your application provides the best possible visual experience while maintaining smooth performance across a wide range of devices.

### Performance Best Practices

1. **Limit Blur Radius**: Typically 5–15px  
2. **Reduce Stacked Glass Surfaces**: No more than 2–3 nested surfaces  
3. **Optimize Animations**: Animate `transform`/`opacity`  

---

## Browser Compatibility

### Backdrop Filter Support

| Browser      | Support | Notes                                                  |
|--------------|---------|--------------------------------------------------------|
| Chrome 76+   | ✅ Full | Works on all Chromium browsers                         |
| Firefox 103+ | ✅ Full | Prior versions require enabling in `about:config`      |
| Safari 9+    | ✅ Full | iOS Safari also supported                              |
| Edge 17+     | ✅ Full | Legacy Edge required `-webkit-` prefix                |
| IE 11        | ❌ None | Use solid background fallback                          |

### Implementing Fallbacks

```tsx
const supportsBackdropFilter = () => {
  return (
    'backdropFilter' in document.body.style ||
    'webkitBackdropFilter' in document.body.style
  );
};

const GlassComponent = styled.div`
  background-color: ${props =>
    props.supportsBackdropFilter
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(240, 240, 245, 0.85)'
  };
  
  ${props => props.supportsBackdropFilter && `
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  `}
`;
```

---

## Common Patterns

### Glass Card Pattern

```tsx
<GlassCard elevation={2} interactive glowOnHover>
  <GlassTypography variant="h4">Card Title</GlassTypography>
  <GlassTypography variant="body1">
    This glass card features interactive hover effects with a subtle glow.
  </GlassTypography>
  <GlassButton variant="primary" style={{ marginTop: '16px' }}>
    Action Button
  </GlassButton>
</GlassCard>
```

### Form Implementation Pattern

```tsx
<FormGlassContainer maxWidth="sm">
  <form onSubmit={handleSubmit}>
    <GlassStack spacing="24px">
      <GlassTypography variant="h4">Create Account</GlassTypography>
      
      <GlassTextField
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
      />
      
      <GlassTextField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        helperText="We'll never share your email."
        fullWidth
        required
      />
      
      <GlassButton 
        type="submit" 
        variant="primary"
        size="large"
        fullWidth
        glowOnHover
      >
        Create Account
      </GlassButton>
    </GlassStack>
  </form>
</FormGlassContainer>
```

---

## Troubleshooting

### "innerGlow is not a function" or Similar Errors

> **⚠️ COMMON ERROR**: This usually means you've imported from the wrong location or forgotten to include `themeContext`.

```tsx
// ✅ For options-based API (correct usage):
import { innerGlow } from '../../mixins/depth/innerEffects';
// ...
${innerGlow({ color: 'primary', intensity: 'medium', spread: 15 })}
```