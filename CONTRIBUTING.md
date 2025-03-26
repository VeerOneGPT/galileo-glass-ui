# Contributing to Galileo Glass UI

We appreciate your interest in contributing to the Galileo Glass UI library! This document outlines the process for contributing and guidelines to follow.

## Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally
3. Install dependencies:
   ```
   npm install
   ```
4. Start development server:
   ```
   npm run dev
   ```
5. Start Storybook for component development:
   ```
   npm run storybook
   ```

## Development Workflow

1. Create a new branch for your feature or bug fix:
   ```
   git checkout -b feature/your-feature-name
   ```
   or
   ```
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes following our coding conventions and guidelines

3. Run tests to ensure your changes don't break existing functionality:
   ```
   npm run test
   ```

4. Run linting to ensure code quality:
   ```
   npm run lint
   ```

5. Run type checking:
   ```
   npm run typecheck
   ```

6. Commit your changes with a clear commit message

7. Push to your fork and submit a pull request

## Coding Guidelines

1. **CSS Properties**: Always use kebab-case in styled-components template literals
2. **Glass Mixins**: Always pass themeContext to glass mixins
3. **Component Structure**: Export both standard and Glass-prefixed versions
4. **Naming**: Use PascalCase for components, camelCase for functions
5. **TypeScript**: Define prop interfaces with JSDoc comments
6. **Imports**: Group imports by React, third-party, internal, relative
7. **Styled Components**: Use `$` prefix for transient props
8. **Error Handling**: Provide graceful fallbacks with feedback
9. **Animation**: Use accessibleAnimation for respecting motion preferences
10. **Performance**: Memoize complex components and computations

## Component Template

When creating a new component, use this basic template:

```tsx
import React from 'react';
import styled from 'styled-components';
import { glassSurface } from '../../core/mixins';
import { createThemeContext } from '../../core';
import type { ComponentProps } from '../../types';

/**
 * Props for the MyComponent component
 */
export interface MyComponentProps extends ComponentProps {
  /** Description of the prop */
  someProp?: string;
}

/**
 * My component description
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  someProp = 'default',
  children,
  ...props
}) => {
  return (
    <StyledContainer {...props}>
      {children}
    </StyledContainer>
  );
};

/**
 * Glass version of MyComponent with glass styling
 */
export const GlassMyComponent: React.FC<MyComponentProps> = (props) => {
  return <MyComponent $glass {...props} />;
};

const StyledContainer = styled.div<{ $glass?: boolean }>`
  /* Base styles */
  
  /* Glass styles if $glass prop is true */
  ${props => props.$glass && glassSurface({
    themeContext: createThemeContext(props.theme)
  })};
`;

export default MyComponent;
```

## Testing

1. Write unit tests for all components and utility functions
2. Test both standard and glass variants
3. Test with various prop combinations
4. Test accessibility features
5. Test animations and interactions

## Documentation

1. Add comprehensive JSDoc comments to all components and functions
2. Update relevant documentation in `/docs` directory
3. Add usage examples
4. Document any known limitations or edge cases

## Pull Request Process

1. Update the README.md or documentation with details of your changes
2. Update the CHANGELOG.md with details of your changes
3. Increase version numbers in package.json when applicable
4. Your PR will be merged once it receives approval from maintainers

## Code of Conduct

Please follow our code of conduct while contributing:

1. Be respectful and inclusive in your language and actions
2. Accept constructive criticism gracefully
3. Focus on the best outcome for the project
4. Show empathy towards other community members

## Questions?

If you have any questions about contributing, please reach out to the maintainers.

Thank you for contributing to Galileo Glass UI!