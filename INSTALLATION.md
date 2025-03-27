# Galileo Glass UI - Installation Guide

## Installation Methods

Galileo Glass UI can be installed in several ways, depending on your needs and environment.

### Method 1: Using the install.sh Script (Recommended)

The most reliable way to install Galileo Glass UI is to use the provided installation script:

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

### Method 2: Direct Installation with NODE_ENV

You can also install directly with npm by setting the NODE_ENV:

```bash
# For npm
NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui styled-components

# For yarn
NODE_ENV=production yarn add github:VeerOneGPT/galileo-glass-ui styled-components

# For pnpm 
NODE_ENV=production pnpm add github:VeerOneGPT/galileo-glass-ui styled-components
```

### Method 3: Using Pre-built Version (Recommended for Production)

For the most stable experience with no build step required, install from the pre-built version:

```bash
# Install the pre-built version
npm install github:VeerOneGPT/galileo-glass-ui#prebuild

# For yarn
yarn add github:VeerOneGPT/galileo-glass-ui#prebuild

# For pnpm
pnpm add github:VeerOneGPT/galileo-glass-ui#prebuild
```

This version has been pre-compiled and is the most reliable for production use.

## Peer Dependencies

Galileo Glass UI requires the following peer dependencies:

```bash
npm install react react-dom styled-components
```

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