# Troubleshooting Guide

This guide helps you troubleshoot common issues when working with Galileo Glass UI.

## Installation Issues

### Installation Fails with NPM

**Problem**: You encounter errors when installing the NPM package.

**Solution**:
- Clear your npm cache and try again:
  ```bash
  npm cache clean --force
  npm install @veerone/galileo-glass-ui styled-components
  ```
- Try using the `--legacy-peer-deps` flag:
  ```bash
  npm install @veerone/galileo-glass-ui styled-components --legacy-peer-deps
  ```

### Installation Fails with Build Errors (GitHub)

**Problem**: The package build process fails during installation from GitHub.

**Solution**:
- Use the production environment flag to skip build:
  ```bash
  NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui
  ```
- Alternatively, use our installation script:
  ```bash
  ./install.sh
  ```
- Or simply install from NPM instead:
  ```bash
  npm install @veerone/galileo-glass-ui styled-components
  ```

### ENOTEMPTY Errors with chart.js

**Problem**: You see errors related to chart.js during installation:
```
npm error code ENOTEMPTY
npm error syscall rename
npm error path /Users/username/project/node_modules/chart.js
npm error dest /Users/username/project/node_modules/.chart.js-XXXX
```

**Solution**:
1. Clean the problematic folders:
   ```bash
   rm -rf node_modules/chart.js node_modules/.chart.js-*
   ```
2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
3. Try installation with production flag:
   ```bash
   NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui
   ```

### Dependency Conflicts in Next.js

**Problem**: Next.js projects show dependency conflicts with styled-components or other libraries.

**Solution**:
1. Install with the legacy peer deps flag:
   ```bash
   NODE_ENV=production npm install github:VeerOneGPT/galileo-glass-ui --legacy-peer-deps
   ```
2. Configure Next.js for styled-components:
   ```js
   // next.config.js
   module.exports = {
     compiler: {
       styledComponents: true,
     },
   }
   ```

## Build Issues

### TypeScript Errors

**Problem**: You encounter TypeScript errors when trying to build the library.

**Solution**:
- Use our more permissive TypeScript configuration:
  ```bash
  npm run typecheck:permissive
  ```
- For building, use:
  ```bash
  npm run build:fix
  ```

### Rollup Errors with Path Resolution

**Problem**: Rollup shows errors about not being able to resolve imports.

**Solution**:
- Check the import paths in your components
- Make sure you're using the correct import paths:
  ```tsx
  // Use this:
  import { Button } from 'galileo-glass-ui/components/Button';
  
  // Not this:
  import { Button } from '../components/Button';
  ```

## Component Issues

### Glass Effects Not Applying

**Problem**: The glass styling isn't appearing on components.

**Solution**:
1. Make sure you're using the ThemeProvider:
   ```tsx
   import { ThemeProvider } from 'galileo-glass-ui';
   
   function App() {
     return (
       <ThemeProvider>
         {/* Your components */}
       </ThemeProvider>
     );
   }
   ```

2. Check that you're using Glass components or the `glass` prop:
   ```tsx
   // Either use Glass variants:
   <GlassButton>Click me</GlassButton>
   
   // Or use the glass prop:
   <Button glass>Click me</Button>
   ```

### CSS Props Not Working

**Problem**: Styled-components props with camelCase aren't being applied.

**Solution**:
- Always use kebab-case for CSS properties in styled-components template literals:
  ```tsx
  // Correct:
  const Component = styled.div`
    background-color: rgba(255, 255, 255, 0.1);
  `;
  
  // Incorrect:
  const Component = styled.div`
    backgroundColor: rgba(255, 255, 255, 0.1);
  `;
  ```

### Animations Not Working

**Problem**: The animations aren't displaying properly.

**Solution**:
1. Check browser compatibility - make sure you're using a supported browser
2. Verify the ThemeProvider is properly set up
3. For physics animations, ensure the dependencies are installed:
   ```bash
   npm install framer-motion popmotion
   ```

## Performance Issues

### Slow Rendering Performance

**Problem**: The glass effects cause slowdowns, especially on mobile devices.

**Solution**:
1. Use the OptimizedGlassContainer:
   ```tsx
   import { OptimizedGlassContainer } from 'galileo-glass-ui/components/Performance';
   
   <OptimizedGlassContainer>
     {/* Glass components */}
   </OptimizedGlassContainer>
   ```

2. Reduce the number of glass effects on screen at once
3. Use the performance monitor to identify bottlenecks:
   ```tsx
   import { PerformanceMonitor } from 'galileo-glass-ui/components/Performance';
   
   <PerformanceMonitor>
     {/* Your app */}
   </PerformanceMonitor>
   ```

## Still Having Issues?

If you're still experiencing problems after trying these solutions:

1. Check the [GitHub issues](https://github.com/VeerOneGPT/galileo-glass-ui/issues) to see if your problem has been reported
2. Create a new issue with detailed reproduction steps
3. Try the minimal reproduction in [CodeSandbox](https://codesandbox.io) to isolate the problem
