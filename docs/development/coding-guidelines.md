# Galileo Glass UI Coding Guidelines

## Build/Lint/Test Commands
- Build: `npm run build`
- Development: `npm run dev`
- Lint code: `npm run lint`
- Type check: `npm run typecheck`
- Test all: `npm run test`
- Run Storybook: `npm run storybook`

## Code Style Guidelines
1. **CSS Properties**: Always use kebab-case in styled-components (e.g., `background-color`, not `backgroundColor`).
2. **Glass Mixins**: Always pass `themeContext` to glass mixins using `createThemeContext(props.theme)`.
3. **Component Structure**: Export both standard and Glass-prefixed versions of components.
4. **Naming**: Use PascalCase for components, camelCase for functions and variables.
5. **TypeScript**: Define prop interfaces with JSDoc comments for all components.
6. **Imports**: Group imports: React, third-party, internal modules, relative imports.
7. **Styled Components**: Use `$` prefix for transient props (e.g., `$variant`).
8. **Error Handling**: For user interactions, provide graceful fallbacks with feedback.
9. **Animation**: Use `accessibleAnimation` to respect user's reduced motion preferences.
10. **Performance**: Use memoization for complex components and computations.