# Galileo Glass UI

<div align="center">
  <img src="https://github.com/VeerOneGPT/galileo-glass-ui/raw/main/logo.png" alt="Galileo Glass UI Logo" width="200" />
  <p><em>Modern glass morphism UI components for React applications</em></p>

  <p>
    <a href="https://www.npmjs.com/package/galileo-glass-ui"><img src="https://img.shields.io/npm/v/galileo-glass-ui.svg" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/galileo-glass-ui"><img src="https://img.shields.io/npm/dm/galileo-glass-ui.svg" alt="npm downloads" /></a>
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VeerOneGPT/galileo-glass-ui.svg" alt="license" /></a>
  </p>
</div>

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

<div align="center">
  <table>
    <tr>
      <th>npm</th>
      <th>yarn</th>
      <th>pnpm</th>
    </tr>
    <tr>
      <td>
        
```bash
npm install galileo-glass-ui styled-components
```
      </td>
      <td>
        
```bash
yarn add galileo-glass-ui styled-components
```
      </td>
      <td>
        
```bash
pnpm add galileo-glass-ui styled-components
```
      </td>
    </tr>
  </table>
</div>

### Basic Usage

```jsx
import React from 'react';
import { ThemeProvider, Button, Card, Typography } from 'galileo-glass-ui';
import styled from 'styled-components';

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

<details>
<summary><strong>Live Demo</strong></summary>

Check out our [interactive examples](https://github.com/VeerOneGPT/galileo-glass-ui/blob/main/examples/README.md) to see Galileo Glass UI in action!

</details>

## 📋 Documentation

<div align="center">
  <table>
    <tr>
      <th>📚 Core Docs</th>
      <th>🎨 Styling</th>
      <th>🔄 Animation</th>
      <th>📊 Charts</th>
      <th>🏗️ Structure</th>
    </tr>
    <tr>
      <td><a href="./docs/GalileoGlass.md">Framework Guide</a></td>
      <td><a href="./docs/GalileoGlass.md#glass-surface-system">Glass Surfaces</a></td>
      <td><a href="./docs/AnimationSystem.md">Animation System</a></td>
      <td><a href="./docs/GlassCharts.md">Chart Components</a></td>
      <td><a href="./STRUCTURE.md">Package Architecture</a></td>
    </tr>
    <tr>
      <td><a href="./docs/ThemeProvider.md">Theme System</a></td>
      <td><a href="./docs/GalileoGlass.md#z-space-layering">Z-Space Layering</a></td>
      <td><a href="./docs/AnimationSystem.md#physics-animation-system-for-modern-glass-ui">Physics Animations</a></td>
      <td><a href="./docs/GlassCharts.md#glass-styling-implementation">Chart Styling</a></td>
      <td><a href="./STRUCTURE.md#component-pattern">Component Patterns</a></td>
    </tr>
  </table>
</div>

## ⚠️ Critical Implementation Requirements

<details open>
<summary><b>1. CSS Property Naming in Styled Components</b></summary>
<br>

**ALWAYS use kebab-case (not camelCase) for CSS properties in styled-components template literals:**

```tsx
// ✅ CORRECT: Use kebab-case for CSS properties
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

> **Note**: Use camelCase only for inline styles: `<div style={{ backgroundColor: 'red' }} />`
</details>

<details open>
<summary><b>2. Always Pass Theme Context to Glass Mixins</b></summary>
<br>

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

> **Why?** The theme context provides color mode, variant, and other critical styling information
</details>

For a complete implementation guide, see the [Glass UI Framework Documentation](./docs/GalileoGlass.md).

## 📦 Component Library

<div align="center">
  <table>
    <tr>
      <th align="center">🧩 Layout</th>
      <th align="center">🔤 Typography</th>
      <th align="center">🎛️ Input</th>
      <th align="center">🧭 Navigation</th>
    </tr>
    <tr valign="top">
      <td>
        <ul>
          <li>Box</li>
          <li>Container</li>
          <li>Paper</li>
          <li>Grid</li>
          <li>Stack</li>
          <li>Divider</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Typography</li>
          <li>Link</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Button</li>
          <li>TextField</li>
          <li>Checkbox</li>
          <li>Radio</li>
          <li>Switch</li>
          <li>Select</li>
          <li>Slider</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Tabs, Tab</li>
          <li>Pagination</li>
          <li>BottomNavigation</li>
        </ul>
      </td>
    </tr>
    <tr>
      <th align="center">📱 Feedback</th>
      <th align="center">📊 Data Display</th>
      <th align="center">🛠️ Utility</th>
      <th align="center">📈 Charts</th>
    </tr>
    <tr valign="top">
      <td>
        <ul>
          <li>Alert</li>
          <li>Progress</li>
          <li>Snackbar</li>
          <li>Loader</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Card</li>
          <li>Table</li>
          <li>List</li>
          <li>Chip</li>
          <li>Avatar</li>
          <li>Badge</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Backdrop</li>
          <li>Modal</li>
          <li>Drawer</li>
          <li>Tooltip</li>
          <li>Icon</li>
          <li>Fab</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>BarChart</li>
          <li>LineChart</li>
          <li>AreaChart</li>
          <li>PieChart</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

## 🧩 Code Examples

<details open>
<summary><b>🎭 Glass Card with Hover Effects</b></summary>
<br>

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
</details>

<details>
<summary><b>🔄 Accessible Animations</b></summary>
<br>

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

> **Accessibility**: This animation automatically respects the user's `prefers-reduced-motion` settings
</details>

<details>
<summary><b>🌎 Z-Space Layering</b></summary>
<br>

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

> **Z-Space** creates meaningful depth in interfaces by controlling elevation and visual hierarchy
</details>

<details>
<summary><b>🧲 Physics Interactions</b></summary>
<br>

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

> **Magnetic Interactions** create natural-feeling UI elements that respond to user movements
</details>

## 🌐 Browser Support

<div align="center">
  <table>
    <tr>
      <th align="center">Browser</th>
      <th align="center">Supported Versions</th>
      <th align="center">Notes</th>
    </tr>
    <tr>
      <td align="center">Chrome</td>
      <td align="center">76+</td>
      <td>Full support</td>
    </tr>
    <tr>
      <td align="center">Firefox</td>
      <td align="center">70+</td>
      <td>Full support</td>
    </tr>
    <tr>
      <td align="center">Safari</td>
      <td align="center">14+</td>
      <td>Full support</td>
    </tr>
    <tr>
      <td align="center">Edge</td>
      <td align="center">79+</td>
      <td>Chromium-based</td>
    </tr>
    <tr>
      <td align="center">iOS Safari</td>
      <td align="center">14.4+</td>
      <td>Full support</td>
    </tr>
    <tr>
      <td align="center">Android Chrome</td>
      <td align="center">86+</td>
      <td>Full support</td>
    </tr>
  </table>
</div>

## 🧪 Testing & Development

<div align="center">

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests |
| `npm run test:visual` | Run visual regression tests |
| `npm run test:accessibility` | Run accessibility tests |
| `npm run storybook` | Start Storybook for component development |
| `npm run lint` | Run ESLint to check code style |
| `npm run typecheck` | Verify TypeScript types |

</div>

## 📄 License

[MIT License](./LICENSE) © Galileo Glass UI

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

---

<div align="center">
  <p>Made with ❤️ by the VeerOne UI Team</p>
  <p>
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui/stargazers">Star us on GitHub</a> •
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui/issues">Report an Issue</a>
  </p>
</div>