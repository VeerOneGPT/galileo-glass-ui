# Troubleshooting Glass Components

This guide addresses common issues when working with Galileo Glass UI components.

## Common Issues and Solutions

### Glass Effects Not Showing Up

**Issue**: Glass effects (blur, transparency, glow) aren't appearing on components.

**Possible Causes and Solutions**:

1. **CSS Property Naming**
   - **Problem**: Using camelCase instead of kebab-case in styled-components.
   - **Solution**: Always use kebab-case for CSS properties in styled components:
     ```tsx
     // WRONG
     const GlassComponent = styled.div`
       backgroundColor: rgba(255, 255, 255, 0.2);
       backdropFilter: blur(10px);
     `;
     
     // CORRECT
     const GlassComponent = styled.div`
       background-color: rgba(255, 255, 255, 0.2);
       backdrop-filter: blur(10px);
     `;
     ```

2. **Missing ThemeContext**
   - **Problem**: Glass mixins require theme context to work properly.
   - **Solution**: Always pass themeContext to glass mixins:
     ```tsx
     ${props => glassSurface({
       elevation: 2,
       themeContext: createThemeContext(props.theme)
     })}
     ```

3. **Browser Support**
   - **Problem**: Browser doesn't support backdrop-filter.
   - **Solution**: Enable fallback styles and check browser compatibility.
     ```tsx
     import { browserSupportsBackdropFilter } from '../../utils/browserCompatibility';
     
     const GlassComponent = styled.div`
       ${props => browserSupportsBackdropFilter() ? `
         backdrop-filter: blur(10px);
       ` : `
         background-color: rgba(255, 255, 255, 0.85);
       `}
     `;
     ```

### React Hook Rules Violations

**Issue**: ESLint warnings about React Hook rules violations.

**Solutions**:

1. **Missing Dependencies**
   - Use the `fix-hooks.js` script to identify and fix missing dependencies:
     ```
     node scripts/fix-hooks.js --fix
     ```
   - Ensure all variables used in the hook body are included in the dependency array.

2. **Hook in Callback Functions**
   - Don't call hooks inside callbacks, conditionals, or loops.
   - Move the hook to the top level of the component.

3. **Hook in Component Map Function**
   - **Problem**: Creating hooks in a map function.
   - **Solution**: Create a separate component for each mapped item.

### TypeScript Errors

**Issue**: TypeScript compilation errors with Glass components.

**Solutions**:

1. **Theme Types**
   - Use proper typing for theme access:
     ```tsx
     import { DefaultTheme } from 'styled-components';
     
     const Component = styled.div<{ theme: DefaultTheme }>`
       color: ${props => props.theme.colors.primary};
     `;
     ```

2. **Prop Naming Conflicts**
   - Use transient props with `$` prefix to avoid HTML attribute conflicts:
     ```tsx
     const Button = styled.button<{ $glass: boolean }>`
       /* glass styling */
     `;
     ```

3. **CSS Type Issues**
   - Use `css` helper from styled-components for type safety:
     ```tsx
     import { css } from 'styled-components';
     
     const glassStyles = css`
       backdrop-filter: blur(10px);
     `;
     ```

### Performance Issues

**Issue**: Glass effects causing performance issues.

**Solutions**:

1. **Use Performance Optimization**
   - Wrap glass components with OptimizedGlassContainer:
     ```tsx
     <OptimizedGlassContainer>
       <GlassComponent />
     </OptimizedGlassContainer>
     ```

2. **Reduce Blur Values**
   - Lower blur values for better performance:
     ```tsx
     ${glassSurface({
       blurStrength: 'light',  // Use light instead of standard or strong
       // ...
     })}
     ```

3. **Disable Effects on Low-End Devices**
   - Use the performance detection hook:
     ```tsx
     const { isPoorPerformance } = useGlassPerformance();
     
     ${props => glassSurface({
       blurStrength: isPoorPerformance ? 'minimal' : 'standard',
       // ...
     })}
     ```

4. **Throttle Animations**
   - Use the throttledAnimation helper for hover effects:
     ```tsx
     import { throttledAnimation } from '../../animations/performance';
     
     &:hover {
       ${props => throttledAnimation(fadeIn, 0.3)}
     }
     ```

## ESLint Rules Violations

**Issue**: Many ESLint warnings about unused variables or incorrect imports.

**Solutions**:

1. **Unused Variables**
   - Prefix unused variables with underscore: `_unusedVar`
   - Use the automated script: `node scripts/fix-unused-vars.js`

2. **Import/Export Issues**
   - Use named exports consistently
   - Fix circular dependencies by refactoring common code to separate utility files

## Z-Index and Layering Issues

**Issue**: Components appear behind or in front of the wrong elements.

**Solution**: Use the Z-Space system:

```tsx
import { zSpaceLayer } from '../../core/mixins/depth/zSpaceLayer';

const Overlay = styled.div`
  ${props => zSpaceLayer({
    layer: 'OVERLAY',
    themeContext: createThemeContext(props.theme)
  })}
`;
```

## Animation Issues

**Issue**: Animations not respecting reduced motion preferences.

**Solution**: Use the accessibleAnimation helper:

```tsx
import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn } from '../../animations/keyframes';

const AnimatedComponent = styled.div`
  ${props => accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out'
  })}
`;
```

## How to Get Further Help

If you encounter issues not covered in this guide:

1. Run the verification script for detailed errors: `./scripts/verify.sh`
2. Check the detailed documentation in `frontend/GalileoGlass.md`
3. Use the combined auto-fix tool: `./scripts/auto-fix-all.sh`
4. Open an issue on GitHub with the error details and reproduction steps 