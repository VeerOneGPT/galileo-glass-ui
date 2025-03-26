# Contributing to Galileo Glass UI

Thank you for considering contributing to Galileo Glass UI! This document outlines the process for contributing to the project and the standards we expect.

## Development Process

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/galileo-glass-ui.git`
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

### Development Workflow

1. Make your changes
2. Run verification tools: `./scripts/verify.sh`
3. Fix any issues
4. Commit your changes
5. Push to your fork: `git push origin feature/your-feature-name`
6. Submit a pull request

## Code Quality Tools

We've implemented several tools to maintain high code quality:

### Verification Script

The `verify.sh` script runs all verification steps:

```bash
./scripts/verify.sh
```

To automatically fix some issues:

```bash
./scripts/verify.sh --fix
```

This script performs:
- TypeScript type checking
- ESLint linting
- Building the package

### Fixing Unused Variables

To automatically prefix unused variables with underscores:

```bash
node scripts/fix-unused-vars.js
```

Preview changes without modifying files:

```bash
node scripts/fix-unused-vars.js --dry-run
```

### Fixing React Hook Dependencies

To identify and fix missing dependencies in useEffect, useCallback, and useMemo hooks:

```bash
node scripts/fix-hooks.js
```

Apply automatic fixes:

```bash
node scripts/fix-hooks.js --fix
```

## Glass UI Component Guidelines

When creating or modifying components:

1. **Use kebab-case for CSS properties in styled-components**
   ```tsx
   // CORRECT:
   const Component = styled.div`
     background-color: rgba(255, 255, 255, 0.1);
     backdrop-filter: blur(10px);
   `;

   // INCORRECT:
   const Component = styled.div`
     backgroundColor: rgba(255, 255, 255, 0.1);
     backdropFilter: blur(10px);
   `;
   ```

2. **Always pass themeContext to glass mixins**
   ```tsx
   ${props => glassSurface({
     elevation: 2,
     themeContext: createThemeContext(props.theme)
   })}
   ```

3. **Use proper animation utilities**
   ```tsx
   ${accessibleAnimation({
     animation: fadeIn,
     duration: 0.3
   })}
   ```

4. **Respect accessibility settings**
   - Check for reduced motion: `const prefersReducedMotion = useReducedMotion()`
   - Provide alternatives for complex animations

## Pull Request Process

1. Update the README.md or documentation with details of your changes if necessary
2. The PR should work on our continuous integration system
3. A maintainer will review your PR and may request changes
4. Once approved, a maintainer will merge your PR

## Code of Conduct

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) when participating in this project.

Thank you for contributing to Galileo Glass UI!