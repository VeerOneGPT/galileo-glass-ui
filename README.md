# Galileo Glass UI

<div align="center">
  <img width="200" height="200" src="./assets/galileo-glass-logo.png" alt="Galileo Glass UI Logo">
  <p><em>Modern glass morphism UI components for React, Next.js, and any TypeScript application</em></p>

  <p>
    <a href="https://www.npmjs.com/package/@veerone/galileo-glass-ui"><img src="https://img.shields.io/npm/v/@veerone/galileo-glass-ui.svg" alt="npm version" /></a>
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui"><img src="https://img.shields.io/github/stars/VeerOneGPT/galileo-glass-ui.svg" alt="GitHub stars" /></a>
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VeerOneGPT/galileo-glass-ui.svg" alt="license" /></a>
  </p>
</div>

A comprehensive Glass UI framework for modern web applications, featuring glass morphism styling, performant animations, accessibility features, and a complete set of UI components. This versatile package works seamlessly with React, Next.js, and any TypeScript project, providing all the tools you need to create beautiful, accessible, and performant interfaces with a glass-like aesthetic.

## 🌟 Features

- **Glass Morphism Styling**: Create beautiful glass-like UI elements with blur effects, transparency, and lighting
- **Comprehensive Component Library**: 85+ UI components including 58 specialized Glass components with glass morphism styling options
- **Advanced Physics-Based Animation System**: Create complex, performant, and natural-feeling animations using an integrated spring physics engine. Features include interaction hooks (`usePhysicsInteraction`, `useGalileoStateSpring`, `useMultiSpring`), sequence orchestration (`useAnimationSequence`), gesture physics, magnetic effects, and more.
- **Accessibility-First Design**: Comprehensive support including configurable reduced motion (`useReducedMotion`), motion sensitivity levels, animation categories, high contrast mode adaptations, and keyboard navigation.
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
      <th>NPM (Recommended)</th>
      <th>Next.js Projects</th>
      <th>Other Package Managers</th>
      <th>GitHub (Development)</th>
    </tr>
    <tr>
      <td>
        
```bash
# Install from NPM (recommended)
npm install @veerone/galileo-glass-ui styled-components
```
      </td>
      <td>
        
```bash
# Install in Next.js project
npm install @veerone/galileo-glass-ui styled-components

# In next.config.js:
transpilePackages: ['@veerone/galileo-glass-ui']
```
      </td>
      <td>
        
```bash
# For yarn
yarn add @veerone/galileo-glass-ui styled-components

# For pnpm
pnpm add @veerone/galileo-glass-ui styled-components
```
      </td>
      <td>
        
```bash
# Install from GitHub repository
npm install github:VeerOneGPT/galileo-glass-ui styled-components
```
      </td>
    </tr>
  </table>
</div>

#### What's New in v1.0.5

#### Enhanced Chart Components
- **ModularGlassDataChart Architecture**: Completely refactored GlassDataChart into smaller, modular components
- **Adaptive Quality System**: Charts automatically adjust rendering quality based on device capabilities
- **Physics-Based Animations**: Enhanced animations with damping ratio adjustments and proper motion preferences
- **KPI Chart Type**: Specialized key performance indicator chart displays
- **Specialized Components**: ChartRenderer, ChartTooltip, ChartFilters, KpiChart, and AtmosphericEffects

#### New Glass Components
- **GlassCardLink Component**: Enhanced 3D perspective transforms with physics-based hover effects
- **GlassTabs Component**: Glass-morphism styled tabs with animated active indicator
- **ChartWrapper Component**: Lightweight container for chart components with consistent glass styling

#### React 19 Compatibility
- **Full Type Safety**: Proper forwardRef with TypeScript-friendly typing for props and refs
- **Enhanced Refs**: Well-defined interfaces for component methods and APIs
- **Null Safety**: Implemented proper default values and null-safe operations for all components
- **DevTools Integration**: Added displayName for better debugging and React DevTools integration

#### TypeScript and API Improvements
- **Reference APIs**: Created comprehensive ref APIs for component control
- **Safe Operations**: Made color conversion and animation properties safer with fallbacks
- **Enhanced Tooltips**: Improved tooltip rendering with proper null checks
- **IDE Integration**: Enhanced TypeScript definitions for better developer experience

#### Optional Feature Dependencies

Galileo Glass UI uses a modular approach where specialized features only require their dependencies when you use them:

```bash
# Only if using chart components (BarChart, LineChart, etc.)
npm install chart.js react-chartjs-2

# Only if using virtualized lists
npm install react-window
```

This keeps your bundle size small by only including what you need!

> **Important**: For detailed installation instructions, see our installation guides:
> - [Complete Installation Guide](./docs/installation/INSTALLATION.md) - Full installation options
> - [NPM Package Reference](https://www.npmjs.com/package/@veerone/galileo-glass-ui) - Using the NPM package
> - [Bundle Optimization Guide](./docs/performance/optimization/bundle-optimization.md) - Optimizing your bundle size

### Basic Usage

```jsx
import React from 'react';
import { ThemeProvider, Button, Card, Typography } from '@veerone/galileo-glass-ui';
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
import { ThemeProvider } from '@veerone/galileo-glass-ui';

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
import { Card, Button, Typography } from '@veerone/galileo-glass-ui';

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
import { Button, Card, Typography, ThemeProvider } from '@veerone/galileo-glass-ui/slim';

// Option 2: Direct component imports (optimal tree-shaking)
import { Button } from '@veerone/galileo-glass-ui/components/Button';
import { Card } from '@veerone/galileo-glass-ui/components/Card';
import { ThemeProvider } from '@veerone/galileo-glass-ui/theme';

// Option 3: Domain-specific imports
import { accessibleAnimation } from '@veerone/galileo-glass-ui/animations';
import { glassSurface, glassGlow } from '@veerone/galileo-glass-ui/core';
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui/hooks';
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
      <th>🔄 Animation System</th>
      <th>📊 Advanced Features</th>
      <th>🏗️ Development</th>
    </tr>
    <tr>
      <td><a href="./docs/core/framework-guide.md">Framework Guide</a></td>
      <td><a href="./docs/core/framework-guide.md#glass-surface-system">Glass Surfaces</a></td>
      <td><a href="./docs/animations/physics-hooks.md">Core Physics Hooks</a></td>
      <td><a href="./docs/components/glass-charts.md">Chart Components</a></td>
      <td><a href="./docs/core/project-structure.md">Package Architecture</a></td>
    </tr>
    <tr>
      <td><a href="./docs/core/theme-system.md">Theme System</a></td>
      <td><a href="./docs/core/framework-guide.md#z-space-layering">Z-Space Layering</a></td>
      <td><a href="./docs/animations/orchestration.md">Sequence Orchestration</a></td>
      <td><a href="./docs/components/specialized-surfaces.md">Specialized Surfaces</a></td>
      <td><a href="./docs/performance/optimization/optimization-techniques.md">Optimization Techniques</a></td>
    </tr>
    <tr>
      <td><a href="./docs/components/advanced-components.md">Advanced Components</a></td>
      <td><a href="./docs/core/framework-guide.md#common-patterns">Common Patterns</a></td>
      <td><a href="./docs/animations/context-config.md">Context & Configuration</a></td>
      <td><a href="./docs/animations/physics-animations.md">Physics System (Legacy)</a></td> 
      <td><a href="./docs/development/component-patterns.md">Component Patterns</a></td>
    </tr>
    <tr>
      <td><a href="./INSTALLATION.md">Installation Guide</a></td>
      <td><a href="./docs/components/TROUBLESHOOTING.md">Troubleshooting</a></td>
      <td><a href="./docs/animations/accessibility.md">Accessibility</a></td> 
      <td><a href="./docs/development/implementation-status.md">Implementation Status</a></td>
      <td><a href="./docs/performance/optimization/memoization-patterns.md">Memoization Patterns</a></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><a href="./docs/animations/transition-hooks.md">(WIP) Transition Hooks</a></td>
      <td></td>
      <td><a href="./docs/development/implementation-notes.md">Implementation Notes</a></td>
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
import { glassSurface } from '@veerone/galileo-glass-ui/mixins';
import { createThemeContext } from '@veerone/galileo-glass-ui/core';

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
          <li>GlassMasonry</li>
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
          <li>GlassDateRangePicker</li>
          <li>GlassMultiSelect</li>
          <li>TagInput</li>
          <li>ToggleButton</li>
          <li>Rating</li>
          <li>FormControl</li>
          <li>FormGroup</li>
          <li>FormLabel</li>
          <li>FormHelperText</li>
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
          <li>GlassBreadcrumbs</li>
          <li>Menu</li>
          <li>MenuItem</li>
          <li>Toolbar</li>
          <li>GlassNavigation</li>
          <li>GlassTabBar</li>
          <li>GlassCarousel</li>
          <li>ResponsiveNavigation</li>
          <li>PageTransition</li>
          <li>ZSpaceAppLayout</li>
          <li>GlassTimeline</li>
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
          <li>Dialog</li>
          <li>Snackbar</li>
          <li>Loader</li>
          <li>Skeleton</li>
          <li>VisualFeedback</li>
          <li>RippleButton</li>
          <li>FocusIndicator</li>
          <li>StateIndicator</li>
          <li>CookieConsent</li>
          <li>GlobalCookieConsent</li>
          <li>CompactCookieNotice</li>
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
          <li>ImageListItem</li>
          <li>ImageListItemBar</li>
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
          <li>GlassTooltip</li>
          <li>Icon</li>
          <li>Fab</li>
          <li>GlassThemeSwitcher</li>
          <li>GlassThemeDemo</li>
          <li>ThemedGlassComponents</li>
          <li>PerformanceMonitor</li>
          <li>OptimizedGlassContainer</li>
          <li>DynamicAtmosphere</li>
          <li>GlassLocalizationProvider</li>
          <li>AccessibilityProvider</li>
          <li>AccessibilitySettings</li>
          <li>GlassImageViewer</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>BarChart</li>
          <li>LineChart</li>
          <li>AreaChart</li>
          <li>PieChart</li>
          <li>GlassChart</li>
          <li>GlassDataChart</li>
          <li>GlassTooltip</li>
          <li>EnhancedGlassTabs</li>
          <li>SafeChartRenderer</li>
          <li>SimpleChart</li>
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
import { Box } from '@veerone/galileo-glass-ui';
import { glassSurface, glassGlow, innerGlow } from '@veerone/galileo-glass-ui/mixins';
import { createThemeContext } from '@veerone/galileo-glass-ui/core';

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
import { accessibleAnimation } from '@veerone/galileo-glass-ui/animations';
import { fadeIn } from "@veerone/galileo-glass-ui"/animations/keyframes';

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
import { zSpaceLayer } from '@veerone/galileo-glass-ui/mixins';
import { createThemeContext } from '@veerone/galileo-glass-ui/core';

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
import { usePhysicsInteraction } from '@veerone/galileo-glass-ui/hooks';

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
    <a href="https://github.com/VeerOneGPT/galileo-glass-ui/issues">Report an Issue</a> •
    <a href="mailto:support@veerone.com">Contact Support</a>
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
9. **Animation**: Utilize the integrated Galileo Animation System hooks (`usePhysicsInteraction`, `useGalileoStateSpring`, `useMultiSpring`, `useAnimationSequence`). Respect user preferences via `useReducedMotion`.
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

### Optional Peer Dependencies

*   **Icons:** `@mui/icons-material` (for using Material Icons)

```bash
npm install @mui/icons-material @emotion/react @emotion/styled
```