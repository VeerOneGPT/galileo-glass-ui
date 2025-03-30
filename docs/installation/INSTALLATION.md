# Galileo Glass UI - Installation Guide

## Installation Methods

Galileo Glass UI can be installed in several ways, depending on your needs and environment.

### Method 1: NPM Package (Recommended)

The simplest and most reliable way to install Galileo Glass UI:

```bash
# Install from NPM
npm install @veerone/galileo-glass-ui styled-components

# For yarn
yarn add @veerone/galileo-glass-ui styled-components

# For pnpm
pnpm add @veerone/galileo-glass-ui styled-components
```

This installs the pre-built package that's ready to use without any build steps.

### Method 2: GitHub Installation (Development)

If you need the latest development version from GitHub:

```bash
# For npm
NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui styled-components

# For yarn
NODE_ENV=production yarn add github:VeerOneGPT/galileo-glass-ui styled-components

# For pnpm 
NODE_ENV=production pnpm add github:VeerOneGPT/galileo-glass-ui styled-components
```

### Method 3: Using the install.sh Script (For Contributors)

When contributing to the project or needing a local development setup:

```bash
# Clone the repository
git clone https://github.com/VeerOneGPT/galileo-glass-ui.git

# Navigate to the directory
cd galileo-glass-ui

# Run the installation script
./install.sh
```

This script:
- Sets the environment to production to skip build processes
- Cleans up any problematic dependencies
- Runs the npm installation with optimal settings

## Dependencies

### Required Dependencies

Galileo Glass UI requires the following peer dependencies for basic functionality:

```bash
npm install react react-dom styled-components
```

### Optional Feature Dependencies

We use a modular approach where specialized features only require dependencies when you actually use them:

```bash
# Only if using chart components (BarChart, LineChart, PieChart, etc.)
npm install chart.js react-chartjs-2

# Only if using virtualized lists for large datasets
npm install react-virtual

# Only if using advanced data grids
npm install react-window
```

This keeps your bundle size smaller by only including what you need!

For more detailed information on the optional features, see [Pre-built Guide](./PREBUILD.md).

## Troubleshooting

If you encounter installation issues:

1. **File System Errors**: If you see ENOTEMPTY errors related to chart.js or other dependencies:
   ```
   npm error code ENOTEMPTY
   npm error syscall rename
   npm error path /path/to/node_modules/chart.js
   ```
   
   Solution:
   ```bash
   # Remove the problematic folder
   rm -rf node_modules/chart.js
   rm -rf node_modules/.chart.js-*
   
   # Clear npm cache and try again
   npm cache clean --force
   NODE_ENV=production npm install
   ```

2. **Build Process Failures**: If the build process fails during installation:
   
   Solution:
   ```bash
   # Use the environment variable to skip build
   NODE_ENV=production npm install
   ```

3. **Path Resolution Errors**: If you see errors about missing dependencies or paths:
   
   Solution:
   ```bash
   # Install with --legacy-peer-deps flag
   NODE_ENV=production npm install --legacy-peer-deps
   ```

## Using with Next.js

For Next.js applications, we recommend the following installation:

```bash
# Install with specific flags for Next.js compatibility
NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui --legacy-peer-deps
```

Add styled-components configuration to your Next.js project:

```js
// next.config.js
module.exports = {
  compiler: {
    styledComponents: true,
  },
}
```

## Monorepo Setup

If you're using a monorepo, we recommend installing Galileo Glass UI at the workspace level and ensuring all projects use the same version to avoid duplicate installations.

For more detailed information on integration with different frameworks, please see the [documentation](./docs/index.md).