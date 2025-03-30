# Galileo Glass UI - Pre-built Installation Guide

This document provides detailed instructions on how to install and use the pre-built version of Galileo Glass UI.

## What is the Pre-built Version?

The pre-built version is a special distribution of Galileo Glass UI that has already been compiled and bundled, ready for immediate use in your projects. This version eliminates the need for your system to compile the package during installation, which can avoid compatibility issues and significantly speed up installation.

## Installation Options

### Option 1: NPM Package (Recommended)

The simplest way to install the pre-built Galileo Glass UI:

```bash
npm install @veerone/galileo-glass-ui styled-components
```

This is the official NPM package, pre-built and ready to use.

### Option 2: Install from GitHub with Pre-built Tag (Development)

If you need the development version from GitHub:

```bash
npm install github:VeerOneGPT/galileo-glass-ui#prebuild styled-components
```

### Option 3: Install with Production Flag

If you need the latest version but want to avoid build issues:

```bash
NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui styled-components
```

### Option 4: Clone Repository and Use Install Script

For development or customization:

```bash
git clone https://github.com/VeerOneGPT/galileo-glass-ui.git
cd galileo-glass-ui
./install.sh
```

## Optional Features and Dependencies

Galileo Glass UI uses a modular approach where specialized features only require their dependencies when you actually use them. **You only need to install these packages if you use the corresponding features:**

### Chart Components

If you want to use the chart components like BarChart, LineChart, or PieChart:

```bash
npm install chart.js react-chartjs-2
```

Example usage:
```jsx
import { BarChart, LineChart, PieChart } from 'galileo-glass-ui/components/Charts';
// Or directly:
import { BarChart } from 'galileo-glass-ui';
```

### Physics Animations

For spring animations, magnetic effects, and particle systems:

```bash
npm install react-spring
```

Example usage:
```jsx
import { springAnimation, magneticEffect } from 'galileo-glass-ui/animations/physics';
// Or via hooks:
import { usePhysicsInteraction } from 'galileo-glass-ui/hooks';
```

### Advanced Animations

For complex motion effects and transitions:

```bash
npm install framer-motion popmotion
```

Example usage:
```jsx
import { advancedPhysicsAnimations } from 'galileo-glass-ui/animations';
// Or specialized animations:
import { Orchestrator } from 'galileo-glass-ui/animations/orchestration';
```

### Virtualized Lists

For efficiently rendering large lists:

```bash
npm install react-window
```

Example usage:
```jsx
import { OptimizedList } from 'galileo-glass-ui/components/Performance';
```

# Only if using virtualized lists
npm install react-virtual

This modular approach keeps your bundle size smaller by only including the dependencies you actually need. If you try to use a component that requires an optional dependency without installing it first, you'll receive a helpful error message explaining which package to install.

## Verifying Installation

After installation, you can verify that the package is working correctly by importing and using a simple component:

```jsx
import { ThemeProvider, Button } from 'galileo-glass-ui';

function App() {
  return (
    <ThemeProvider>
      <Button variant="contained" glass>
        Hello Galileo Glass
      </Button>
    </ThemeProvider>
  );
}
```

## Troubleshooting

If you encounter any installation issues:

1. Make sure you have styled-components installed:
   ```bash
   npm install styled-components
   ```

2. Clear your npm cache and try again:
   ```bash
   npm cache clean --force
   ```

3. For local installations, try running the install script with sudo (if necessary):
   ```bash
   sudo ./install.sh
   ```

4. If you still encounter issues, please [report them](https://github.com/VeerOneGPT/galileo-glass-ui/issues) with specific error messages and your environment details.

## Notes for Package Maintainers

To create a new pre-built version:

1. Run `node prebuild.js` to generate the pre-built distribution
2. Commit the changes
3. Tag the commit with `prebuild`
4. Push the tag to GitHub

```bash
# Create pre-built version
node prebuild.js

# Commit and tag
git add .
git commit -m "Update pre-built version"
git tag prebuild -f
git push origin prebuild -f
```

## Additional Resources

- [Main Installation Guide](./INSTALLATION.md)
- [Component Documentation](./docs/components/glass-components.md)
- [Theme System](./docs/core/theme-system.md)