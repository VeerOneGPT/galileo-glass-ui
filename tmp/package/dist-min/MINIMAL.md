# Galileo Glass UI - Minimal Installation Guide

This document explains how to use the minimal distribution of Galileo Glass UI for faster, more reliable installations.

## What is the Minimal Distribution?

The minimal distribution is an ultra-lightweight version of Galileo Glass UI that includes:

- Only core components (Button, Card)
- No optional dependencies
- Simplified package structure
- Minimal peer dependencies

This version is designed for quick testing, prototyping, or for users who need only basic glass UI elements without the full feature set.

## Installation

### Direct installation from GitHub (recommended)

```bash
npm install github:VeerOneGPT/galileo-glass-ui-minimal styled-components
```

### Local installation after cloning

```bash
# Clone the repository
git clone https://github.com/VeerOneGPT/galileo-glass-ui.git

# Navigate to the directory
cd galileo-glass-ui

# Run the minimal installation script
./install-minimal.sh

# Install in your project
npm install /path/to/galileo-glass-ui/dist-min styled-components
```

### IMPORTANT: For fastest installation and avoiding dependency conflicts

If you're experiencing slow installation or dependency resolution issues, use the local tarball:

```bash
# Create a direct tarball for instant installation
cd /path/to/galileo-glass-ui
tar -czf galileo-minimal.tgz -C dist-min .

# Then install the tarball
npm install /path/to/galileo-minimal.tgz styled-components
```

### Compatibility with framer-motion and other dependencies

This package works with multiple versions of its optional dependencies:

- framer-motion: ^10.0.0 or ^12.0.0
- react: ^17.0.0, ^18.0.0, or ^19.0.0
- styled-components: ^5.3.3 or ^6.0.0

The only required peer dependency is styled-components. To use animations, you may install framer-motion, but it's entirely optional.

## Usage Example

The minimal distribution includes the core components you need to get started:

```jsx
import { ThemeProvider, Button, Card } from 'galileo-glass-ui';

function App() {
  return (
    <ThemeProvider>
      <Card>
        <h2>Hello Galileo Glass!</h2>
        <Button variant="contained">Click me</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## Limited Component Set

The minimal distribution includes only these components:

- Button
- Card
- ThemeProvider (required for styling)

## When to Use Minimal vs. Full Distribution

### Use Minimal When:

- You need a quick installation for testing
- You only need basic UI components
- You're experiencing installation issues with the full version
- You're in a CI/CD environment with strict installation time limits

### Use Full Distribution When:

- You need access to all components
- You require advanced features like animations, chart components, etc.
- You're building a production application with the full Galileo Glass experience

## Upgrading to Full Version

If you start with the minimal version and later need additional components, you can upgrade to the full version:

```bash
# Remove minimal version
npm uninstall galileo-glass-ui

# Install full version
npm install github:VeerOneGPT/galileo-glass-ui#prebuild styled-components
```

## Troubleshooting

If you experience installation issues with both versions:

1. Make sure you have styled-components installed
2. Clear your npm cache: `npm cache clean --force`
3. Try using a different package manager (Yarn or pnpm)
4. Add the `--force` flag to npm: `npm install github:VeerOneGPT/galileo-glass-ui#minimal-dist styled-components --force`