# Galileo Glass UI Documentation

Welcome to the Galileo Glass UI documentation. This guide will help you get started with using and customizing the library.

## Installation

The simplest way to install Galileo Glass UI is via NPM:

```bash
npm install @veerone/galileo-glass-ui styled-components
```

For detailed installation instructions, see the [Installation Guide](./installation/INSTALLATION.md).

## Quick Start

```jsx
import React from 'react';
import { ThemeProvider, Button, Card } from '@veerone/galileo-glass-ui';

function App() {
  return (
    <ThemeProvider>
      <Card glass>
        <h2>Hello Galileo Glass!</h2>
        <Button variant="contained" glass>Click me</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## Core Framework

| Documentation | Description |
|---------------|-------------|
| [**Framework Guide**](./core/framework-guide.md) | Main documentation for the Galileo Glass UI framework |
| [**Theme System**](./core/theme-system.md) | Theme implementation and customization |
| [**Project Structure**](./core/project-structure.md) | Overall package architecture |

## Components

| Documentation | Description |
|---------------|-------------|
| [**Advanced Components**](./components/advanced-components.md) | Documentation for complex UI components |
| [**Glass Charts**](./components/glass-charts.md) | Data visualization components |
| [**Specialized Surfaces**](./components/specialized-surfaces.md) | Advanced glass surface implementations |

## Animations

The Galileo Glass UI features a powerful, integrated physics-based animation system.

| Documentation | Description |
|---------------|-------------|
| [**Animation System**](./animations/index.md) | Core concepts, physics hooks, orchestration, accessibility. |
| [**Physics Engine API**](./physics/engine-api.md) | Direct access to the physics engine (v1.0.8+) |
| [**Core Physics Hooks**](./animations/physics-hooks.md) | Documentation for physics interaction hooks (`useGalileoPhysicsEngine`, `usePhysicsInteraction`, etc.) |
| [**Sequence Orchestration**](./animations/orchestration.md) | Guide to `useAnimationSequence` for complex, timed animations |
| [**Context & Configuration**](./animations/context-config.md) | Using `AnimationProvider` and presets for global configuration |
| [**Accessibility**](./animations/accessibility.md) | Details on `useReducedMotion` and accessibility features |
| [**(WIP) Transition Hooks**](./animations/transition-hooks.md) | Documentation for state/transition hooks (e.g., `useTransitioningState`) |

## Performance & Optimization

| Documentation | Description |
|---------------|-------------|
| [**Bundle Optimization**](./performance/optimization/bundle-optimization.md) | Bundle size optimization techniques |
| [**Import Optimization**](./performance/optimization/import-optimization.md) | Efficient import strategies |
| [**Optimization Techniques**](./performance/optimization/optimization-techniques.md) | Performance optimization strategies |
| [**Memoization Patterns**](./performance/optimization/memoization-patterns.md) | Effective component and style memoization |
| [**GPU Acceleration**](./performance/optimization/gpu-acceleration.md) | Hardware acceleration techniques for smooth animations |
| [**DOM Performance**](./performance/optimization/dom-performance.md) | DOM operation batching and transform consolidation |
| [**Device Capability Detection**](./performance/device-capabilities.md) | Adaptive performance based on device capabilities |

## Installation & Deployment

| Documentation | Description |
|---------------|-------------|
| [**Installation Guide**](./installation/INSTALLATION.md) | Complete installation instructions |
| [**Pre-built Version**](./installation/PREBUILD.md) | Using the pre-built distribution |
| [**Minimal Installation**](./installation/MINIMAL.md) | Fast, minimal installation option |

## Development

| Documentation | Description |
|---------------|-------------|
| [**Coding Guidelines**](./development/coding-guidelines.md) | Code style and development standards |
| [**Component Patterns**](./development/component-patterns.md) | Recommended component implementation patterns |
| [**Implementation Status**](./development/implementation-status.md) | Current development status |
| [**Implementation Notes**](./development/implementation-notes.md) | Technical notes on migration and implementation |
| [**Build Fixes**](./development/BUILD_FIXES.md) | Recent build system improvements |

## Common Issues & Troubleshooting

If you encounter issues while using the Galileo Glass UI library, refer to the [Framework Guide Troubleshooting](./core/framework-guide.md#troubleshooting) section for solutions to common problems.

## Accessibility

Galileo Glass UI is built with a strong focus on accessibility, ensuring that all components work well for users with different needs and preferences:

### Motion Sensitivity & Reduced Motion

- **Configurable Reduced Motion**: Utilizes `useReducedMotion` for system detection and app-level overrides.
- **Motion Sensitivity Levels**: Fine-grained control (Low, Medium, High) over animation intensity.
- **Animation Categories**: Allows different handling for essential vs. decorative animations.
- **Alternative Animations**: Provides mechanisms (e.g., fade, static) when motion is disabled.
- **Preference Persistence**: User accessibility settings saved via `localStorage`.

### Keyboard Navigation & Screen Readers

- **Full Keyboard Support**: All components can be navigated and operated using only a keyboard
- **ARIA Attributes**: Comprehensive ARIA implementation for screen reader compatibility
- **Focus Management**: Intelligent focus handling for complex components
- **Accessible Labels**: All interactive elements have proper accessible names

### Settings & Customization

- **Accessibility Settings Component**: User interface for personalizing accessibility preferences
- **Category-Specific Controls**: Granular settings for different animation categories
- **Persistent Preferences**: Saves user preferences for consistent experience

For detailed accessibility documentation, see the [Animation Accessibility Guide](./animations/accessibility.md) and the older general [Accessibility Guide](./accessibility/index.md).

## Component Library

The Galileo Glass UI library includes 85+ components across the following categories:

- **Layout Components**: Box, Container, Grid, Stack, Paper, Divider, PageGlassContainer, GlassMasonry
- **Typography Components**: Typography, Link
- **Input Components**: Button, TextField, Select, Checkbox, Radio, Switch, Slider, Autocomplete, DatePicker, GlassDateRangePicker, GlassMultiSelect, TagInput, Form components
- **Navigation Components**: Tabs, Pagination, BottomNavigation, Accordion, SpeedDial, TreeView, Breadcrumbs, GlassBreadcrumbs, GlassTabBar, GlassCarousel, GlassNavigation, GlassTimeline, Navigation components
- **Feedback Components**: Alert, Progress, Snackbar, Loader, VisualFeedback, RippleButton, FocusIndicator, StateIndicator
- **Data Display Components**: Card, Table, List, Chip, Avatar, Badge, ImageList, KpiCard, GlassDataChart, PerformanceMetricCard
- **Utility Components**: Backdrop, Modal, Drawer, Tooltip, GlassTooltip, Icon, GlassImageViewer, Theme components, Performance components
- **Specialized Surfaces**: DimensionalGlass, HeatGlass, FrostedGlass, WidgetGlass, AtmosphericBackground, ParticleBackground

For a complete component reference, see the [Framework Guide](./core/framework-guide.md#component-library).

## Key Features

- **Premium Glass Components**: 85+ UI components including 58 specialized Glass components
- **Enhanced Z-Space System**: Meaningful depth and layout hierarchy
- **Advanced Physics-Based Animation System**: Natural motion with spring physics, orchestration, and interaction hooks.
- **Atmospheric Environments**: Dynamic backgrounds and contextual adaptations
- **Advanced Light Effects**: Sophisticated glow, reflection, and shadow systems
- **Responsive Adaptations**: Quality adjustments for different devices and screens
- **Accessibility Compliance**: WCAG 2.1 AA compliant with reduced motion support
- **Performance Optimization**: Device-aware quality adjustments
- **Theme Variants**: Multiple visual themes with light/dark modes

## Getting Started

For a quick introduction to using the Galileo Glass UI library, refer to the [Framework Guide Getting Started](./core/framework-guide.md#getting-started) section.

## Implementation Requirements

To ensure proper functionality, be sure to follow these critical implementation requirements:

1. **Use kebab-case for CSS properties** in styled-components template literals
2. **Always pass themeContext** to glass mixins
3. **Follow the recommended import patterns**

For details on these requirements, refer to the [Framework Guide Implementation Requirements](./core/framework-guide.md#implementation-requirements) section.

### Key Documentation Areas

*   [Installation Guide](../INSTALLATION.md) - Start here for setup instructions.
*   [Framework Guide](./core/framework-guide.md) - Overview of core concepts, styling, Z-space.
*   [Theme System](./core/theme-system.md) - Customizing appearance with `ThemeProvider`.
*   [Animation System](./animations/index.md) - Core concepts, physics hooks, orchestration, accessibility.
*   [Physics Engine API](./physics/engine-api.md) - (WIP) Lower-level access to the physics engine for custom simulations.
*   [Advanced Components](./components/advanced-components.md) - Guides for complex components like `GlassDataChart`, `GlassTimeline`, etc.
*   [Performance](./performance/optimization/optimization-techniques.md) - Optimization techniques and bundle size reduction.
*   [Development](./development/component-patterns.md) - Guidelines for contributing and developing components.