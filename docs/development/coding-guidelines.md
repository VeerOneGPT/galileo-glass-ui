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
9. **Animation (v1.0.5+)**: Utilize the integrated Galileo Animation System hooks (`usePhysicsInteraction`, `useGalileoStateSpring`, `useMultiSpring`, `useAnimationSequence`). Avoid direct CSS animations/transitions or external libraries. Always ensure animations respect user preferences via `useReducedMotion` (often handled internally by hooks).
10. **Performance**: Use memoization for complex components and computations.