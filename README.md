# Galileo Glass UI

A comprehensive Glass UI framework for modern web applications, featuring glass morphism styling, performant animations, accessibility features, and a complete set of UI components. This standalone package provides all the tools you need to create beautiful, accessible, and performant interfaces with a glass-like aesthetic.

## 🌟 Features

- **Glass Morphism Styling**: Create beautiful glass-like UI elements with blur effects, transparency, and lighting
- **Comprehensive Component Library**: Over 30 UI components with glass styling options
- **Physics-Based Animations**: Natural animations using spring physics, particle systems, and magnetic effects
- **Accessibility-First Design**: Includes reduced motion support, high contrast mode, and keyboard navigation
- **Performance Optimized**: Adapts to device capabilities for smooth performance on all devices
- **Extensive Customization**: Powerful styling mixins for creating your own custom glass effects
- **TypeScript Support**: Fully typed API for better developer experience
- **Zero Material UI Dependencies**: Completely independent implementation using styled-components

## 🚀 Getting Started

### Installation

```bash
npm install galileo-glass-ui styled-components
```

### Basic Usage

```jsx
import React from 'react';
import { ThemeProvider, Button, Card, Typography } from 'galileo-glass-ui';

function App() {
  return (
    <ThemeProvider>
      <Card glass>
        <Typography variant="h4">Galileo Glass UI</Typography>
        <Typography variant="body1">
          Modern, beautiful UI components with glass morphism styling.
        </Typography>
        <Button variant="contained" glass>
          Get Started
        </Button>
      </Card>
    </ThemeProvider>
  );
}

export default App;
```

## 📋 Documentation

For more detailed documentation, please refer to:

- [GalileoGlass.md](./docs/GalileoGlass.md) - Complete documentation of the Glass UI framework
- [AnimationSystem.md](./docs/AnimationSystem.md) - In-depth guide to the animation system
- [ThemeProvider.md](./docs/ThemeProvider.md) - Theme system documentation
- [GlassCharts.md](./docs/GlassCharts.md) - Glass-styled chart components
- [STRUCTURE.md](./STRUCTURE.md) - Architecture and package structure

## ⚠️ Critical Implementation Requirements

### 1. CSS Property Naming in Styled Components

**ALWAYS use kebab-case (not camelCase) for CSS properties in styled-components template literals:**

```tsx
// ✅ CORRECT: Use kebab-case for CSS properties in styled-components
const Component = styled.div`
  background-color: rgba(255, 255, 255, 0.1);  // ✅ Correct!
  backdrop-filter: blur(10px);                // ✅ Correct!
  border-radius: 8px;                         // ✅ Correct!
`;

// ❌ INCORRECT: Will cause runtime errors!
const Component = styled.div`
  backgroundColor: rgba(255, 255, 255, 0.1);  // ❌ Wrong!
  backdropFilter: blur(10px);                // ❌ Wrong!
  borderRadius: 8px;                         // ❌ Wrong!
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
    themeContext: createThemeContext(props.theme) // ✅ Important!
  })}
`;
```

For more detailed requirements, see [GalileoGlass.md](./docs/GalileoGlass.md).

## 📦 Component Categories

- **Layout**: Box, Container, Paper, Grid, Stack, Divider
- **Typography**: Typography, Link
- **Input**: Button, TextField, Checkbox, Radio, Switch, Select, Slider
- **Navigation**: Tabs, Pagination, BottomNavigation
- **Feedback**: Alert, Progress, Snackbar, Loader
- **Data Display**: Card, Table, List, Chip, Avatar, Badge
- **Utility**: Backdrop, Modal, Drawer, Tooltip, Icon, Fab
- **Charts**: BarChart, LineChart, AreaChart, PieChart

## 🎭 Styling Example

```jsx
import { styled } from 'styled-components';
import { Box } from 'galileo-glass-ui';
import { glassSurface, glassGlow, innerGlow } from 'galileo-glass-ui/mixins';
import { createThemeContext } from 'galileo-glass-ui/core';

const GlassCard = styled(Box)`
  ${props => glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  
  padding: 24px;
  border-radius: 12px;
  
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

## 🧩 Examples by Feature

### Animation System

```jsx
import { styled } from 'styled-components';
import { accessibleAnimation } from 'galileo-glass-ui/animations';
import { fadeIn } from 'galileo-glass-ui/animations/keyframes';

const AnimatedComponent = styled.div`
  ${props => accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out'
  })}
`;
```

### Z-Space Layering

```jsx
import { styled } from 'styled-components';
import { zSpaceLayer } from 'galileo-glass-ui/mixins';
import { createThemeContext } from 'galileo-glass-ui/core';

const OverlayComponent = styled.div`
  ${props => zSpaceLayer({
    layer: 'OVERLAY',
    position: 'top',
    depth: 3,
    themeContext: createThemeContext(props.theme)
  })}
`;
```

### Physics Interactions

```jsx
import { usePhysicsInteraction } from 'galileo-glass-ui/hooks';

function MagneticButton() {
  const { ref, style, eventHandlers } = usePhysicsInteraction({
    type: 'magnetic',
    strength: 0.4,
    radius: 150
  });
  
  return (
    <button 
      ref={ref} 
      style={style} 
      {...eventHandlers}
    >
      Magnetic Button
    </button>
  );
}
```

## 🌐 Browser Support

- Chrome 76+
- Firefox 70+
- Safari 14+
- Edge 79+ (Chromium-based)
- iOS Safari 14.4+
- Android Chrome 86+

## 🧪 Testing

```bash
npm run test               # Run unit tests
npm run test:visual        # Run visual regression tests
npm run test:accessibility # Run accessibility tests
```

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

---

Made with ❤️ by the Galileo Glass UI Team