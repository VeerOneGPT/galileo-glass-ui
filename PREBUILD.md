# Galileo Glass UI - Pre-built Installation Guide

This document provides detailed instructions on how to install and use the pre-built version of Galileo Glass UI.

## What is the Pre-built Version?

The pre-built version is a special distribution of Galileo Glass UI that has already been compiled and bundled, ready for immediate use in your projects. This version eliminates the need for your system to compile the package during installation, which can avoid compatibility issues and significantly speed up installation.

## Installation Options

### Option 1: Install from GitHub with Pre-built Tag (Recommended)

This is the recommended approach for most users:

```bash
npm install github:VeerOneGPT/galileo-glass-ui#prebuild styled-components
```

### Option 2: Install with Production Flag

If you need the latest version but want to avoid build issues:

```bash
NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui styled-components
```

### Option 3: Clone Repository and Use Install Script

For development or customization:

```bash
git clone https://github.com/VeerOneGPT/galileo-glass-ui.git
cd galileo-glass-ui
./install.sh
```

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