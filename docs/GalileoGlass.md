# Galileo Glass UI Framework v1.0

> **A comprehensive independent glass morphism design system for modern interfaces**

Galileo Glass UI is a complete, standalone UI framework built on the principles of glass morphism, creating interfaces with depth, dimensionality, and sophisticated lighting effects. This custom design system has been built from the ground up, providing a solution that offers full creative control and optimized performance.

The system includes customizable components, responsive behaviors, and physics-based animations to create immersive, premium user experiences with a distinctive glass-like aesthetic.

---

## Introduction

Galileo Glass is a React-based UI framework that implements glass morphism design principles with styled-components. It provides a complete set of components, utilities, and design tokens to create consistent, beautiful interfaces with translucent, dimensional surfaces.

### Key Features

- **Premium Glass Components**: 40+ pure styled-components based UI components  
- **Enhanced Z-Space System**: Meaningful depth and layout hierarchy  
- **Physics-Based Animations**: Natural motion with spring animations and path physics  
- **Atmospheric Environments**: Dynamic backgrounds and contextual adaptations  
- **Advanced Light Effects**: Sophisticated glow, reflection, and shadow systems  
- **Responsive Adaptations**: Quality adjustments for different devices and screens  
- **Accessibility Compliance**: WCAG 2.1 AA compliant with reduced motion support  
- **Performance Optimization**: Device-aware quality adjustments  
- **Theme Variants**: Multiple visual themes with light/dark modes  

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
11. [Animation System](#animation-system-1)  
    1. [Animation Principles](#animation-principles)  
    2. [Animation Architecture](#animation-architecture)  
    3. [Performance-Optimized Animation System](#performanmation-system)  
    4. [Dimensional Depth Animation System](#dimensional-depth-animation-system)  
    5. [Micro-Interaction Choreography](#micro-interaction-choreography)  
    6. [Enhanced Accessibility System](#enhanced-accessibility-system)  
    7. [Animation Implementation](#animation-implementation)  
    8. [Using the Optimized Animation Hook](#using-the-optimized-animation-hook)  
    9. [Animation Utilities](#animation-utilities)  
    10. [Timing Guidelines](#timing-guidelines)  
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
import { innerGlow } from '../../design/mixins/depth/innerEffects';
import { glassGlow } from '../../design/mixins/effects/glowEffects';
import { edgeHighlight } from '../../design/mixins/effects/edgeEffects';
import { createThemeContext } from '../../design/core/themeUtils';

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
import { innerGlow } from '../../design/mixins/depth/innerEffects';
import { createThemeContext } from '../../design/core/themeContext';

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
import { innerGlow } from '../../design/mixins/depth/innerEffects';

${innerGlow({ color: 'primary', intensity: 'medium' })}
```

**Solution**: Always pass `themeContext` created from `props.theme`:

```tsx
import { innerGlow } from '../../design/mixins/depth/innerEffects';
import { createThemeContext } from '../../design/core/themeContext';

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
import { glassSurface } from '../../design/mixins/surfaces/glassSurface';
import { GlassTypography, GlassButton } from '../../components/Glass';
import { createThemeContext } from '../../design/core/themeUtils';

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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
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
import { innerGlow } from '../../design/mixins/depth/innerEffects';
import { glassGlow } from '../../design/mixins/effects/glowEffects';
import { cssWithKebabProps } from '../../design/core';
import { createThemeContext } from '../../design/core/themeUtils';

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
  
  /* Add hover glow effect with theme context */
  &:hover {
    transform: translateY(-2px);
    ${props => glassGlow({ 
      intensity: 'medium', 
      color: 'primary',
      themeContext: createThemeContext(props.theme)
    })}
  }
  
  /* Add active state */
  &:active {
    transform: translateY(1px);
  }
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
import { innerGlow } from '../../design/mixins/depth/innerEffects';
// ...
${innerGlow({ color: 'primary', intensity: 'medium', spread: 15 })} // Missing themeContext!

// ✅ CORRECT: Standard pattern with theme context
import { innerGlow } from '../../design/mixins/depth/innerEffects';
import { createThemeContext } from '../../design/core/themeUtils';
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
import { cssWithKebabProps } from '../../design/core';

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
import { StyledThemeProvider } from '../../design/StyledThemeProvider';
import { GlassProvider, GlassThemeProvider } from '../../components/Glass';

const App: React.FC = () => {
  return (
    <StyledThemeProvider>
      <GlassProvider>
        <GlassThemeProvider initialTheme="nebula">
          {/* Application content */}
        </GlassThemeProvider>
      </GlassProvider>
    </StyledThemeProvider>
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

### Animation System

The animation system focuses on performance, accessibility, and browser compatibility:

#### Key Features

- **Dimensional Depth Animation**: Z-Space animation system for creating true depth perception  
- **Micro-Interaction Choreography**: Coordination of animations across components for narrative experiences  
- **Reduced Motion Support**: Comprehensive accessibility features for users with motion sensitivity  
- **Performance Optimization**: Automatic adaptation based on device capabilities  
- **Browser Compatibility**: Robust support across Chrome 76+, Firefox 70+, Safari 9+, Edge 79+  

#### Usage Example

```tsx
import { animate } from '../../design/animations/presets/accessibleAnimations';
import { fadeIn } from '../../design/animations/keyframes/basic';
import { createThemeContext } from '../../design/core/themeContext';

const MyAnimatedComponent = styled.div`
  ${props => animate({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out',
    fillMode: 'forwards',
    themeContext: createThemeContext(props.theme)
  })}
`;
```

#### Documentation

- @Animation System Documentation  
- @Release Notes  
- @Known Issues  

### Theme Access Pattern

```tsx
import { useGlassTheme } from '../../design/ThemeProvider';
import { 
  createColorStyle, 
  createSpacingStyle, 
  createTypographyStyle 
} from '../../design/core/styleUtils';

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
import { useGlassTheme } from '../../design/GlassThemeProvider';

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
import { useGlassTheme } from '../../design/GlassThemeProvider';
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

### Layout Components

- **GlassBox**: Fundamental layout component  
- **GlassContainer**: Max-width container  
- **GlassGrid**: 12-column responsive grid  
- **GlassStack**: Flexbox stack layout  
- **GlassPaper**: Surface component  
- **GlassDivider**: Horizontal/vertical divider  

### Typography Components

- **GlassTypography**: Text component with variants  
- **GlassLink**: Styled link component  

### Input Components

- **GlassButton**: Button with variants  
- **GlassTextField**: Text input field  
- **GlassSelect**: Dropdown select  
- **GlassCheckbox**: Checkbox input  
- **GlassRadio**: Radio button input  
- **GlassSwitch**: Toggle switch  
- **GlassSlider**: Range slider  

### Navigation Components

- **GlassTabs**: Tab navigation  
- **GlassPagination**: Pagination controls  
- **GlassBottomNavigation**: Mobile navigation  
- **GlassBreadcrumbs**: Breadcrumb navigation  
- **GlassToolbar**: App bar toolbar  

### Feedback Components

- **GlassAlert**: Status alerts  
- **GlassLoader**: Loading indicators  
- **GlassProgress**: Progress bars  
- **GlassSnackbar**: Toast notifications  
- **GlassSkeleton**: Loading placeholders  

### Data Display Components

- **GlassCard**: Card container  
- **GlassTable**: Data tables  
- **GlassChip**: Tags/pills  
- **GlassList**: List containers  
- **GlassAvatar**: User avatars  
- **GlassBadge**: Badge indicators  

### Utility Components

- **GlassBackdrop**: Modal backdrop  
- **GlassFab**: Floating action button  
- **GlassDrawer**: Side drawer  
- **GlassModal**: Modal dialog  
- **GlassTooltip**: Contextual tooltips  

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

```tsx
import { GlassIcon } from '../../components/Glass';
import HomeIcon from '@mui/icons-material/Home';

<GlassIcon component={HomeIcon} />

<GlassIcon 
  component={HomeIcon} 
  fontSize="medium" 
  color="primary" 
  glow="subtle" 
  glowColor="primary"
/>
```

| Prop       | Options                                                           |
|------------|-------------------------------------------------------------------|
| `fontSize` | 'inherit', 'small', 'medium', 'large'                             |
| `color`    | 'inherit', 'primary', 'secondary', 'action', 'error', 'disabled' |
| `glow`     | 'none', 'subtle', 'medium', 'strong'                              |
| `glowColor`| 'primary', 'success', 'warning', 'error', 'info', 'frost', 'celestial' |

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
import { glassSurface } from '../../design/mixins/surfaces/glassSurface';
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
import { interactiveGlass } from '../../design/mixins/interaction/interactiveGlass';
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
import { glassGlow } from '../../design/mixins/effects/glowEffects';
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
import { glassBorder } from '../../design/mixins/surfaces/glassBorder';
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
import { innerGlow } from '../../design/mixins/depth/innerEffects';
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
import { ambientGlow } from '../../design/mixins/effects/ambientEffects';
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
import { zSpaceLayer } from '../../design/mixins/depth/zSpaceEffects';
import styled from 'styled-components';
import { createThemeContext } from '../../design/core';

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

## Animation System

The Glass UI includes a comprehensive animation system with physically accurate motion, focusing on consistency, performance, accessibility, and developer experience.

### Animation Principles

- **Purpose**: Animations should guide attention, provide feedback, or express brand personality  
- **Natural Motion**: Mimic natural physics with appropriate easing and timing  
- **Subtlety**: Enhance the experience without being distracting  
- **Consistency**: Keep animation patterns consistent throughout the application  
- **Accessibility**: Respect user preferences for reduced motion  
- **Performance**: Optimize animations across all devices  

### Animation Architecture

- **React Spring**: Physics-based animations with natural motion  
- **Framer Motion**: Gesture handling and advanced transitions  
- **Popmotion**: Animation primitives and sophisticated easing functions  

Proprietary extensions:
- **Z-Space Animation System**: Custom 3D space management for glass depth  
- **Animation Choreography System**: Orchestration for coordinated animations  
- **Glass-Specific Physics**: Custom material properties for glass interactions  

### Performance-Optimized Animation System

1. **Quality-Adaptive Animations**  
2. **Motion Sensitivity System**  
3. **GPU Acceleration**  
4. **Animation Repository**  

### Dimensional Depth Animation System

```tsx
import { useZSpaceAnimation } from '../../hooks/useZSpaceAnimation';
import { ZSpaceLayer } from '../../design/animations/dimensional/ZSpaceAnimation';

function ZSpaceComponent() {
  const { animate, styles } = useZSpaceAnimation({
    fromLayer: ZSpaceLayer.SURFACE,
    toLayer: ZSpaceLayer.FOREGROUND,
    trajectory: 'forward',
    atmosphericFog: true,
    depthShadows: true
  });
  
  return (
    <div style={styles} onClick={() => animate()}>
      Click to animate in Z-Space
    </div>
  );
}
```

### Micro-Interaction Choreography

```tsx
import { useOrchestration } from '../../hooks/useOrchestration';
import { gestaltPatterns } from '../../design/animations/orchestration/GestaltPatterns';

function OrchestrationDemo() {
  const elementRefs = {
    hero: useRef(null),
    subtitle: useRef(null),
    cards: [useRef(null), useRef(null), useRef(null)]
  };
  
  const { playSequence } = useOrchestration(
    gestaltPatterns.hierarchicalReveal(elementRefs, {
      continuity: 'smooth',
      pacing: 'natural'
    })
  );
  
  useEffect(() => {
    playSequence();
  }, []);
  
  return (
    <div>
      <h1 ref={elementRefs.hero}>Title</h1>
      <p ref={elementRefs.subtitle}>Subtitle</p>
      {elementRefs.cards.map((ref, i) => (
        <div key={i} ref={ref}>Card {i+1}</div>
      ))}
    </div>
  );
}
```

### Enhanced Accessibility System

```tsx
import { MotionSensitivity } from '../../design/animations/accessibility/MotionSensitivity';
import { useReducedMotion } from '../../hooks/useReducedMotion';

function AccessibleComponent() {
  const { motionSensitivity } = useReducedMotion();
  
  let animationVariant;
  switch(motionSensitivity) {
    case MotionSensitivity.NONE:
      animationVariant = "none";
      break;
    case MotionSensitivity.MINIMAL:
      animationVariant = "opacity";
      break;
    case MotionSensitivity.REDUCED:
      animationVariant = "subtle";
      break;
    default:
      animationVariant = "standard";
  }
  
  return (
    <AnimatedElement variant={animationVariant}>
      Motion-sensitive content
    </AnimatedElement>
  );
}
```

### Animation Implementation

```tsx
import { 
  slideInBottom,
  fadeIn,
  createGlassReveal,
  naturalTimingFunctions
} from '../../design/enhancedAnimations';

const EnhancedComponent = styled.div`
  ${slideInBottom.animation(0.5, 'standardSpring')}
`;

const CustomComponent = styled.div`
  ${fadeIn.animation(0.3, { dampingRatio: 0.7, frequency: 2.5 })}
`;
```

### Using the Optimized Animation Hook

```tsx
import { useOptimizedAnimation } from '../../hooks/useOptimizedAnimation';
import { fadeIn } from '../../design/animations/keyframes';

function PerformanceOptimizedComponent() {
  const { animationProps, shouldAnimate } = useOptimizedAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out',
    reducedMotionAlternative: 'opacity',
    qualityTierAdjustments: true
  });
  
  return shouldAnimate ? (
    <div style={animationProps}>
      Performance-optimized animation
    </div>
  ) : (
    <div>Static alternative</div>
  );
}
```

### Animation Utilities

#### accessibleAnimation()

```tsx
accessibleAnimation({
  animation: keyframe,     
  duration: 0.3,          
  easing: 'ease',         
  delay: 0,               
  iterationCount: 1,      
  direction: 'normal',    
  fillMode: 'none',       
  themeContext: themeContext
});
```

#### createStaggered()

```tsx
createStaggered(
  animation,      
  index,          
  baseDelay = 0.1,
  staggerDelay = 0.05,
  duration = 0.4,
  easing = 'standardSpring'
)
```

### Timing Guidelines

| Animation Type         | Recommended Duration | Examples                                     |
|------------------------|---------------------:|----------------------------------------------|
| Micro-interactions     | 100–300ms           | Button clicks, toggles, small state changes  |
| UI Entrances/Exits     | 200–500ms           | Component entrances, modal dialogs           |
| Complex Transitions    | 400–800ms           | Page transitions, complex view changes       |
| Attention Effects      | 500–1500ms          | Often looped or repeated                     |

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
   

### Animation Guidelines

1. **Always Use CSS Helper with Keyframes**:
   
   import { css } from 'styled-components';
   import { fadeIn } from '../../design/animations';
   
   // Correct: Wrap keyframes with css helper
   const AnimatedComponent = styled.div`
     animation: ${css`${fadeIn}`} 0.5s ease-out;
   `;
   
   // Alternatively, use animation utility functions
   
2. **Use Animation Utility Functions**:
   
   import { animate, accessibleAnimation } from '../../design/animationUtils';
   import { fadeIn } from '../../design/animations';
   
   const Component = styled.div`
     ${animate({
       animation: fadeIn,
       duration: 0.3,
       easing: 'ease-out'
     })}
     
     ${accessibleAnimation({
       animation: fadeIn,
       duration: 0.3,
       easing: 'ease-out'
     })}
   `;
   
3. **Honor Reduced Motion Preferences**:
   
   const AccessibleComponent = styled.div`
     ${accessibleAnimation({
       animation: fadeIn,
       duration: 0.3
     })}
   `;
   
4. **Use Animation Keyframes from Central Libraries**:
   
   import { fadeIn, slideUp, pulse } from '../../design/animations';
   
5. **Performance Considerations**:
   - Prefer animating `transform` and `opacity`  
   - Avoid animating layout properties (`width`, `height`, `position`)  
   - Use `will-change` sparingly  
   - Reduce complexity on lower-end devices  

---

## Accessibility

### Contrast Requirements

- **Minimum 4.5:1** contrast ratio for text on glass (WCAG 2.1 AA)  
- **7:1** ratio for highly important text (AAA compliance)  
- Distinctive focus states for interactive elements (3:1 contrast)  

### Reduced Motion

- All Glass UI animations respect `prefers-reduced-motion`  
- Use the `accessibleAnimation` utility for consistent handling  
- Provide static alternatives for highly animated elements  

---

## Performance Optimization

### Device-Aware Quality

```tsx
import { useGlassPerformance } from '../../hooks/useGlassPerformance';

const OptimizedComponent = () => {
  const { isLowPerformanceDevice, glassQualityLevel } = useGlassPerformance();
  
  return (
    <GlassContainer
      blurStrength={glassQualityLevel === 'high' ? 'standard' : 'light'}
      animated={!isLowPerformanceDevice}
    >
      <GlassTypography>Performance-optimized glass</GlassTypography>
    </GlassContainer>
  );
};
```

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
import { innerGlow } from '../../design/mixins/depth/innerEffects';
// ...
${innerGlow({ color: 'primary', intensity: 'medium', spread: 15 })}
```

### CSS Properties Not Working

> **⚠️ COMMON ERROR**: Usually due to using camelCase instead of kebab-case.

```tsx
// ❌ WRONG
const Card = styled.div`
  backgroundColor: rgba(255, 255, 255, 0.1);
  backdropFilter: blur(10px);
`;

// ✅ CORRECT
const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;
```

---

## Modular Architecture (April 2025 Update)

The Glass UI framework has been refactored into a fully modular architecture for improved maintainability, better organization, and enhanced developer experience.

### Modular Structure Overview

```
/design
  /core             
    types.ts        
    themeContext.ts 
    styleUtils.ts   
  /mixins           
    /depth          
      innerEffects.ts
      zSpaceLayer.ts
      depthEffects.ts
    /effects        
      glowEffects.ts
      edgeEffects.ts
      ambientEffects.ts
      borderEffects.ts
    /interaction    
      hoverEffects.ts
      focusEffects.ts
    /surfaces       
      glassSurface.ts
    /typography     
      textStyles.ts
    /accessibility  
      highContrast.ts
      reducedTransparency.ts
      focusStyles.ts
      visualFeedback.ts
  /animations       
  mixins.ts         # Re-export file for backward compatibility
```

### Standardized Import Pattern (April 2025)

Use domain-specific imports and always pass the `themeContext` parameter:

```tsx
import { innerGlow } from '../../design/mixins/depth/innerEffects';
import { glassGlow } from '../../design/mixins/effects/glowEffects';
import { glassSurface } from '../../design/mixins/surfaces/glassSurface';
import { createThemeContext } from '../../design/core/themeUtils';

const StyledCard = styled.div<{ theme: any }>`
  ${props => glassSurface({ 
    elevation: 2, 
    blurStrength: 'standard', 
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  
  &:hover {
    ${props => glassGlow({ 
      intensity: 'medium', 
      color: 'primary',
      themeContext: createThemeContext(props.theme)
    })}
  }
  
  ${props => innerGlow({ 
    color: 'primary', 
    intensity: 'subtle', 
    spread: 10,
    themeContext: createThemeContext(props.theme)
  })}
`;
```

### Modern Options-Based API

All mixins support an options-based API for clarity and type safety:

```tsx
// Example: innerGlow
${innerGlow({
  color: 'primary',
  intensity: 'medium',
  spread: 15,
  pulsing: false,
  position: 'all'
})}
```

### Function Migration Reference

| Function       | Module Path                                  |
|----------------|----------------------------------------------|
| `glassSurface` | `./mixins/surfaces/glassSurface`             |
| `innerGlow`    | `./mixins/depth/innerEffects`                |
| `zSpaceLayer`  | `./mixins/depth/zSpaceLayer`                 |
| `depthBlur`    | `./mixins/depth/depthEffects`                |
| `glassGlow`    | `./mixins/effects/glowEffects`               |
| `edgeHighlight`| `./mixins/effects/edgeEffects`               |
| `ambientGlow`  | `./mixins/effects/ambientEffects`            |
| `glassText`    | `./mixins/typography/textStyles`             |
| `glassHighContrast` | `./mixins/accessibility/highContrast`    |
| `reducedTransparencyAlternative` | `./mixins/accessibility/reducedTransparency` |
| `highContrastFocus` | `./mixins/accessibility/focusStyles`     |
| `enhancedVisualFeedback` | `./mixins/accessibility/visualFeedback` |

---

*Galileo Glass UI v1.0 • MIT License*

```