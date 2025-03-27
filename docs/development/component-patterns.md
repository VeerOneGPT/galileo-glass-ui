# Component Architecture Patterns

## Glass Component Pattern

The Galileo Glass UI framework follows a consistent pattern for component architecture to ensure maintainability, consistency, and optimal performance. This document outlines the recommended patterns for creating and using components.

### Base Component + Glass Variant Pattern

Each UI element in the Galileo Glass UI framework follows a "Base + Glass" pattern:

1. **Base Component**: The standard component implementation with optional glass styling.
2. **Glass Variant**: A specialized variant that applies glass morphism styling by default.

```tsx
// Example pattern - Button component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // Implementation of standard button
});

export const GlassButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // Implementation that applies glass styling to the standard button
  return <Button glass {...props} ref={ref} />;
});
```

### File Structure

Components should be organized in a consistent directory structure:

```
components/
  └── Button/               # Each component in its own directory
      ├── Button.tsx        # Main component file with both variants
      ├── __tests__/        # Tests directory
      │   └── Button.test.tsx
      └── index.ts          # Export file
```

The `index.ts` file should export both the base and glass variant:

```tsx
// components/Button/index.ts
export { Button, GlassButton } from './Button';
```

### Glass Directory

The `Glass` directory serves as a convenience re-export of all glass components:

```
components/
  └── Glass/
      └── index.ts          # Re-exports all glass variants
```

The `index.ts` file re-exports all glass components from their primary locations:

```tsx
// components/Glass/index.ts
export { GlassButton } from '../Button';
export { GlassCard } from '../Card';
// ...
```

This allows users to import all glass components from a single location:

```tsx
import { GlassButton, GlassCard } from 'galileo-glass-ui/components/Glass';
```

### Import Paths

For optimal tree-shaking, components should be importable in multiple ways:

```tsx
// Option 1: Full bundle import
import { Button, GlassButton } from 'galileo-glass-ui';

// Option 2: Component-specific import
import { Button, GlassButton } from 'galileo-glass-ui/components/Button';

// Option 3: Glass variant import
import { GlassButton } from 'galileo-glass-ui/components/Glass';
```

## Styling Pattern

Components should use styled-components with a consistent pattern:

1. Define styled components with transient props (prefixed with `$`)
2. Apply glass mixins via styled-components functions
3. Forward all appropriate props to DOM elements

```tsx
const StyledButton = styled.button<{
  $variant: string;
  $glass: boolean;
}>`
  /* Base styles */
  
  /* Glass styles conditionally applied */
  ${props => props.$glass && glassSurface({ 
    /* glass options */ 
    themeContext: createThemeContext(props.theme)
  })}
`;
```

## Props Pattern

Components should follow a consistent props pattern:

1. Use descriptive prop names
2. Provide sensible defaults
3. Use TypeScript for strict typing
4. Include JSDoc comments for props

```tsx
export interface ButtonProps {
  /**
   * The content of the button
   */
  children: React.ReactNode;
  
  /**
   * If true, applies glass styling
   */
  glass?: boolean;
  
  /**
   * The variant of the button
   */
  variant?: 'contained' | 'outlined' | 'text';
}
```

## Do's and Don'ts

### Do
- Follow the "Base + Glass" pattern for all components
- Put both component variants in the same file
- Use JSDoc comments for props and components
- Re-export glass variants from the Glass directory

### Don't
- Create separate implementations for the glass variants
- Duplicate functionality between base and glass variants
- Use different prop patterns for similar components
- Create glass-specific props that could apply to all variants

By following these patterns, we ensure a consistent, maintainable, and performant component library.