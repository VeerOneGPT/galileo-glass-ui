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

| Documentation | Description |
|---------------|-------------|
| [**Animation System**](./animations/animation-system.md) | Details of the animation framework |
| [**Physics Animations**](./animations/physics-animations.md) | Physics-based animation system | 

## Performance & Optimization

| Documentation | Description |
|---------------|-------------|
| [**Bundle Optimization**](./performance/optimization/bundle-optimization.md) | Bundle size optimization techniques |
| [**Import Optimization**](./performance/optimization/import-optimization.md) | Efficient import strategies |
| [**Optimization Techniques**](./performance/optimization/optimization-techniques.md) | Performance optimization strategies |
| [**Memoization Patterns**](./performance/optimization/memoization-patterns.md) | Effective component and style memoization |

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

## Component Library

The Galileo Glass UI library includes 75+ components across the following categories:

- **Layout Components**: Box, Container, Grid, Stack, Paper, Divider, PageGlassContainer
- **Typography Components**: Typography, Link
- **Input Components**: Button, TextField, Select, Checkbox, Radio, Switch, Slider, Autocomplete, DatePicker, TagInput, Form components
- **Navigation Components**: Tabs, Pagination, BottomNavigation, Accordion, SpeedDial, TreeView, Navigation components
- **Feedback Components**: Alert, Progress, Snackbar, Loader, VisualFeedback, RippleButton, FocusIndicator, StateIndicator
- **Data Display Components**: Card, Table, List, Chip, Avatar, Badge, ImageList, KpiCard, PerformanceMetricCard
- **Utility Components**: Backdrop, Modal, Drawer, Tooltip, Icon, Theme components, Performance components
- **Specialized Surfaces**: DimensionalGlass, HeatGlass, FrostedGlass, WidgetGlass, AtmosphericBackground, ParticleBackground

For a complete component reference, see the [Framework Guide](./core/framework-guide.md#component-library).

## Key Features

- **Premium Glass Components**: 75+ UI components including 48 specialized Glass components
- **Enhanced Z-Space System**: Meaningful depth and layout hierarchy
- **Physics-Based Animations**: Natural motion with spring animations and path physics
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

## Common Issues & Troubleshooting

If you encounter issues while using the Galileo Glass UI library, refer to the [Framework Guide Troubleshooting](./core/framework-guide.md#troubleshooting) section for solutions to common problems.