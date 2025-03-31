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

## Animation & Interaction Problems

### Problem: Animations are not smooth or are causing performance issues.

**Cause**: This could be due to complex animations, too many animated elements, or lower-end device capabilities.

**Solution**:
1. **Check Reduced Motion**: Ensure animations respect the user's `prefers-reduced-motion` setting (handled automatically by most core hooks).
2. **Simplify**: Reduce the complexity or number of simultaneous animations.
3. **Use Presets**: Rely on standard animation presets provided via `AnimationProvider` where possible.
4. **Performance Monitor**: Use the `<PerformanceMonitor>` component to identify specific bottlenecks.
5. **Optimize Components**: Ensure components are properly memoized if re-rendering frequently.

### Problem: Physics-based interactions feel wrong or are not working.

**Cause**: Incorrect configuration of physics hooks (`usePhysicsInteraction`, `useGesturePhysics`, etc.) or issues within the internal physics engine.

**Solution**:
1. **Verify Hook Config**: Double-check the `animationConfig` (presets or specific tension/friction/mass values) passed to the physics hooks.
2. **Check Context**: Ensure an `AnimationProvider` is wrapping the application to provide default presets if needed.
3. **Isolate**: Try the interaction in a minimal example to rule out conflicts.
4. **Consult Hook Docs**: Review the documentation for the specific physics hook being used.

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

npm install chart.js react-chartjs-2

### Problem: VirtualizedList or DataGrid components are not working.

**Cause**: Missing optional peer dependencies (`react-virtual` or `react-window`).

**Solution**: Install the required dependency:

```bash
# For VirtualizedList
npm install react-virtual

# For DataGrid
npm install react-window
```

## Styling Issues
