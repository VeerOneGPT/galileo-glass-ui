# Galileo Glass UI

<div align="center">
  <img width="200" height="200" src="./assets/galileo-glass-logo.svg?v=2" alt="Galileo Glass UI Logo">
  <p><em>Modern glass morphism UI components for React, Next.js, and any TypeScript application</em></p>

  <p>
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui"><img src="https://img.shields.io/github/stars/VeerOneGPT/galileo-glass-ui.svg" alt="GitHub stars" /></a>
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui/network/members"><img src="https://img.shields.io/github/forks/VeerOneGPT/galileo-glass-ui.svg" alt="GitHub forks" /></a>
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VeerOneGPT/galileo-glass-ui.svg" alt="license" /></a>
  </p>
</div>

A comprehensive Glass UI framework for modern web applications, featuring glass morphism styling, performant animations, accessibility features, and a complete set of UI components. This versatile package works seamlessly with React, Next.js, and any TypeScript project, providing all the tools you need to create beautiful, accessible, and performant interfaces with a glass-like aesthetic.

## 🌟 Features

- **Glass Morphism Styling**: Create beautiful glass-like UI elements with blur effects, transparency, and lighting
- **Comprehensive Component Library**: Over 40 UI components with glass styling options
- **Physics-Based Animations**: Natural animations using spring physics, particle systems, and magnetic effects
- **Accessibility-First Design**: Includes reduced motion support, high contrast mode, and keyboard navigation
- **Performance Optimized**: Adapts to device capabilities for smooth performance on all devices
- **Bundle Optimization**: Multiple import options including granular component imports and a slim bundle
- **Tree-Shaking Support**: Fully optimized for modern bundlers with extensive tree-shaking capabilities
- **Extensive Customization**: Powerful styling mixins for creating your own custom glass effects
- **Environmental Awareness**: Dynamic adaptation to light conditions and surrounding content
- **Z-Space System**: Sophisticated depth management for creating meaningful layering
- **Specialized Surfaces**: HeatGlass, FrostedGlass, DimensionalGlass and other advanced surface types
- **Chart Components**: Glass-style data visualization components built on Chart.js
- **Typed API**: Comprehensive TypeScript support with flexible type configurations
- **Tested & Reliable**: Extensive test coverage for components, animations, and core utilities

## 🚀 Getting Started

### Installation

<div align="center">
  <table>
    <tr>
      <th>Pre-built (Recommended)</th>
      <th>With Install Script</th>
      <th>npm</th>
      <th>yarn/pnpm</th>
    </tr>
    <tr>
      <td>
        
```bash
# Install pre-built version
npm install github:VeerOneGPT/galileo-glass-ui#prebuild styled-components
```
      </td>
      <td>
        
```bash
# Clone the repo
git clone https://github.com/VeerOneGPT/galileo-glass-ui.git
cd galileo-glass-ui
# Run the installation script
./install.sh
```
      </td>
      <td>
        
```bash
# Use NODE_ENV to prevent build issues
NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui styled-components
```
      </td>
      <td>
        
```bash
# For yarn
NODE_ENV=production yarn add github:VeerOneGPT/galileo-glass-ui styled-components

# For pnpm
NODE_ENV=production pnpm add github:VeerOneGPT/galileo-glass-ui styled-components
```
      </td>
    </tr>
  </table>
</div>

#### Optional Feature Dependencies

Galileo Glass UI uses a modular approach where specialized features only require their dependencies when you use them:

```bash
# Only if using chart components (BarChart, LineChart, etc.)
npm install chart.js react-chartjs-2

# Only if using physics animations (spring, magnetic effects)
npm install react-spring

# Only if using advanced animations 
npm install framer-motion popmotion

# Only if using virtualized lists
npm install react-window
```

This keeps your bundle size small by only including what you need!

> **Important**: For detailed installation instructions, see our [Installation Guide](./INSTALLATION.md) and [Pre-built Guide](./PREBUILD.md).

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

### Next.js Integration

```jsx
// pages/_app.js or app/layout.js
import { ThemeProvider } from 'galileo-glass-ui';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

```jsx
// Any Next.js page or component
import { Card, Button, Typography } from 'galileo-glass-ui';

export default function HomePage() {
  return (
    <Card glass>
      <Typography variant="h4">Welcome to Next.js with Galileo Glass</Typography>
      <Typography variant="body1">
        Beautiful glass morphism styling in your Next.js application.
      </Typography>
      <Button variant="contained" glass>
        Explore
      </Button>
    </Card>
  );
}
```

### Optimized Imports

Galileo Glass UI now supports multiple import patterns for optimal bundle size:

```jsx
// Option 1: Slim bundle with essential components only (smallest bundle size)
import { Button, Card, Typography, ThemeProvider } from 'galileo-glass-ui/slim';

// Option 2: Direct component imports (optimal tree-shaking)
import { Button } from 'galileo-glass-ui/components/Button';
import { Card } from 'galileo-glass-ui/components/Card';
import { ThemeProvider } from 'galileo-glass-ui/theme';

// Option 3: Domain-specific imports
import { accessibleAnimation } from 'galileo-glass-ui/animations';
import { glassSurface, glassGlow } from 'galileo-glass-ui/core';
import { usePhysicsInteraction } from 'galileo-glass-ui/hooks';
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
      <th>📊 Advanced Features</th>
      <th>🏗️ Development</th>
    </tr>
    <tr>
      <td><a href="./docs/core/framework-guide.md">Framework Guide</a></td>
      <td><a href="./docs/core/framework-guide.md#glass-surface-system">Glass Surfaces</a></td>
      <td><a href="./docs/animations/animation-system.md">Animation System</a></td>
      <td><a href="./docs/components/glass-charts.md">Chart Components</a></td>
      <td><a href="./docs/core/project-structure.md">Package Architecture</a></td>
    </tr>
    <tr>
      <td><a href="./docs/core/theme-system.md">Theme System</a></td>
      <td><a href="./docs/core/framework-guide.md#z-space-layering">Z-Space Layering</a></td>
      <td><a href="./docs/animations/animation-system.md#physics-animation-system-for-modern-glass-ui">Physics Animations</a></td>
      <td><a href="./docs/components/specialized-surfaces.md">Specialized Surfaces</a></td>
      <td><a href="./docs/performance/optimization/optimization-techniques.md">Optimization Techniques</a></td>
    </tr>
    <tr>
      <td><a href="./docs/components/advanced-components.md">Advanced Components</a></td>
      <td><a href="./docs/core/framework-guide.md#common-patterns">Common Patterns</a></td>
      <td><a href="./docs/animations/animation-system.md#advanced-animation-systems">Advanced Animations</a></td>
      <td><a href="./docs/animations/physics-animations.md">Physics System</a></td>
      <td><a href="./docs/development/component-patterns.md">Component Patterns</a></td>
    </tr>
    <tr>
      <td><a href="./INSTALLATION.md">Installation Guide</a></td>
      <td><a href="./docs/components/TROUBLESHOOTING.md">Troubleshooting</a></td>
      <td><a href="./docs/development/implementation-notes.md">Implementation Notes</a></td>
      <td><a href="./docs/development/implementation-status.md">Implementation Status</a></td>
      <td><a href="./docs/performance/optimization/memoization-patterns.md">Memoization Patterns</a></td>
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

For a complete implementation guide, see the [Glass UI Framework Documentation](./docs/core/framework-guide.md).

## 📦 Component Library

Galileo Glass UI offers a comprehensive set of components that work universally across React, Next.js, and TypeScript applications:

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
          <li>Autocomplete</li>
          <li>DatePicker</li>
          <li>TagInput</li>
          <li>Form Components</li>
          <li>ToggleButton</li>
          <li>Rating</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Tabs, Tab</li>
          <li>Pagination</li>
          <li>BottomNavigation</li>
          <li>Accordion</li>
          <li>SpeedDial</li>
          <li>TreeView</li>
          <li>Breadcrumbs</li>
          <li>GlassNavigation</li>
          <li>ResponsiveNavigation</li>
          <li>PageTransition</li>
          <li>ZSpaceAppLayout</li>
        </ul>
      </td>
    </tr>
    <tr>
      <th align="center">📱 Feedback</th>
      <th align="center">📊 Data Display</th>
      <th align="center">🛠️ Utility</th>
      <th align="center">📈 Charts & Specialized</th>
    </tr>
    <tr valign="top">
      <td>
        <ul>
          <li>Alert</li>
          <li>Progress</li>
          <li>Snackbar</li>
          <li>Loader</li>
          <li>VisualFeedback</li>
          <li>RippleButton</li>
          <li>FocusIndicator</li>
          <li>StateIndicator</li>
          <li>CookieConsent</li>
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
          <li>ImageList</li>
          <li>KpiCard</li>
          <li>PerformanceMetricCard</li>
          <li>InteractiveKpiCard</li>
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
          <li>ThemeComponents</li>
          <li>PerformanceMonitor</li>
          <li>OptimizedGlassContainer</li>
          <li>DynamicAtmosphere</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>BarChart</li>
          <li>LineChart</li>
          <li>AreaChart</li>
          <li>PieChart</li>
          <li>GlassChart</li>
          <li>DimensionalGlass</li>
          <li>HeatGlass</li>
          <li>FrostedGlass</li>
          <li>PageGlassContainer</li>
          <li>WidgetGlass</li>
          <li>AtmosphericBackground</li>
          <li>ParticleBackground</li>
          <li>ContextAwareGlass</li>
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

## ⚡ Performance Optimization

Galileo Glass UI is designed for optimal performance in production environments:

### Bundle Size Optimization

We've implemented several strategies to minimize bundle size:

- **External Dependencies**: All major dependencies are marked as external to avoid duplication
- **Tree-Shaking**: Enhanced configuration for effective dead code elimination
- **Component-Level Code Splitting**: Import only the components you need
- **Slim Bundle**: A lightweight bundle with only essential components (~83% smaller than full bundle)
- **Optimized Minification**: Advanced Terser configuration for maximum compression

### Runtime Performance

- **Adaptive Quality**: Automatically adjusts effect complexity based on device capabilities
- **Style Caching**: Prevents unnecessary style recalculations
- **Animation Optimization**: GPU-accelerated animations with fallbacks for lower-end devices
- **Memoization**: Strategic use of React.memo and useMemo for expensive calculations
- **Z-Space Management**: Optimized rendering of layered elements
- **Optimized Glass Effects**: Simplified effects for large surfaces on low-end devices

For detailed optimization guidelines, see our [performance documentation](./docs/performance/optimization/bundle-optimization.md).

## 🧪 Testing & Development

<div align="center">

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run storybook` | Start Storybook for component development |
| `npm run lint` | Run ESLint to check code style |
| `npm run typecheck` | Verify TypeScript types |
| `npm run typecheck:permissive` | Run type checking with less strict rules |
| `npm run build` | Build the production bundle |
| `npm run dev` | Start development mode |

</div>

### Unit Test Implementation

Galileo Glass UI follows a comprehensive testing strategy to ensure reliability:

1. **Component Tests**: We use React Testing Library to verify that components render correctly and respond to user interactions as expected.

2. **Hook Tests**: Our custom hooks are tested for proper behavior, reactivity, and performance optimizations.

3. **Utility Tests**: Core utilities and mixins have unit tests to ensure they produce the expected output.

4. **Theme Tests**: The theming system is tested to ensure proper context propagation and consistent styling.

5. **Accessibility Tests**: We verify that our components maintain accessibility standards, including support for reduced motion and keyboard navigation.

To run a specific test:

```bash
npm test -- -t "Button Component"
```

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

## Verification Tools

We've implemented several tools to help maintain code quality:

#### 1. Comprehensive Verification

Run the complete verification process including typechecking, linting, and building:

```bash
./scripts/verify.sh
```

To automatically fix common issues:

```bash
./scripts/verify.sh --fix
```

#### 2. Fix Unused Variables

Automatically prefix unused variables with underscores to suppress warnings:

```bash
node scripts/fix-unused-vars.js
```

Run in dry-run mode to preview changes:

```bash
node scripts/fix-unused-vars.js --dry-run
```

#### 3. Fix React Hook Dependencies

Identify and suggest fixes for React Hook dependency issues:

```bash
node scripts/fix-hooks.js
```

Apply automatic fixes when possible:

```bash
node scripts/fix-hooks.js --fix
```

### Code Style Guidelines

1. **CSS Properties**: Always use kebab-case in styled-components (e.g., `background-color`, not `backgroundColor`).
2. **Glass Mixins**: Always pass `themeContext` to glass mixins using `createThemeContext(props.theme)`.
3. **Component Structure**: Export both standard and Glass-prefixed versions of components.
4. **Naming**: Use PascalCase for components, camelCase for functions and variables.
5. **TypeScript**: Define prop interfaces with JSDoc comments for all components.
6. **Imports**: Group imports: React, third-party, internal modules, relative imports.
7. **Styled Components**: Use `$` prefix for transient props (e.g., `$variant`).
8. **Error Handling**: For user interactions, provide graceful fallbacks with feedback.
9. **Animation**: Use `accessibleAnimation` to respect user's reduced motion preferences.
10. **Performance**: Use memoization for complex components and computations.

For complete documentation on glass morphism styling guidelines, see [GalileoGlass.md](./frontend/GalileoGlass.md).

## Development Tools

We've created several tools to maintain code quality and fix common issues:

### Automated Verification

Run comprehensive verification including type checking, linting, and building:

```bash
./scripts/verify.sh
```

To automatically fix common issues:

```bash
./scripts/verify.sh --fix
```

### Fix Unused Variables

Automatically prefix unused variables with underscores to suppress ESLint warnings:

```bash
node scripts/fix-unused-vars.js
```

Run in dry-run mode to preview changes:

```bash
node scripts/fix-unused-vars.js --dry-run
```

### Fix React Hook Dependencies

Identify and fix missing dependencies in React hooks:

```bash
node scripts/fix-hooks.js
```

Apply automatic fixes when possible:

```bash
node scripts/fix-hooks.js --fix
```

### Pre-commit Hooks

We've configured automatic checks to run before each commit to maintain code quality:

- TypeScript type checking
- ESLint for code style and best practices
- Automatic prefixing of unused variables
- Hook dependency validation

## Documentation

For detailed documentation, see our [documentation site](https://docs.galileo-glass.dev).