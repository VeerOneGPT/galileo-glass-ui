# Galileo Glass UI Maintenance Guide

This document outlines the procedures and tools for maintaining the Galileo Glass UI codebase.

## Automated Verification Tools

We've developed several tools to help maintain code quality and identify common issues:

### 1. Comprehensive Verification

The `verify.sh` script runs a complete verification process:

```bash
./scripts/verify.sh
```

This script:
- Runs TypeScript type checking
- Runs ESLint to identify code style and best practice issues
- Builds the package to ensure it can be compiled successfully

To automatically fix some issues:

```bash
./scripts/verify.sh --fix
```

### 2. Unused Variables Fixer

The `fix-unused-vars.js` script automatically prefixes unused variables with underscores to suppress ESLint warnings:

```bash
node scripts/fix-unused-vars.js
```

To preview changes without modifying files:

```bash
node scripts/fix-unused-vars.js --dry-run
```

### 3. React Hook Dependencies Fixer

The `fix-hooks.js` script helps fix React Hook dependency issues:

```bash
node scripts/fix-hooks.js
```

Apply automatic fixes:

```bash
node scripts/fix-hooks.js --fix
```

### 4. Combined Auto-Fix Script

The `auto-fix-all.sh` script runs all the tools in sequence:

```bash
./scripts/auto-fix-all.sh
```

This is useful for a quick cleanup before committing or when working on a large codebase change.

## Common Issues and Fixes

### 1. CSS Property Naming in Styled Components

**Issue**: Using camelCase instead of kebab-case in styled-components template literals.

**Incorrect:**
```tsx
const Component = styled.div`
  backgroundColor: white;
  borderRadius: 8px;
`;
```

**Correct:**
```tsx
const Component = styled.div`
  background-color: white;
  border-radius: 8px;
`;
```

### 2. Missing Theme Context in Glass Mixins

**Issue**: Not passing themeContext to glass mixins.

**Incorrect:**
```tsx
${glassSurface({ elevation: 2 })}
```

**Correct:**
```tsx
${props => glassSurface({
  elevation: 2,
  themeContext: createThemeContext(props.theme)
})}
```

### 3. Missing Hook Dependencies

**Issue**: Missing dependencies in useEffect, useCallback, or useMemo hooks.

**Incorrect:**
```tsx
useEffect(() => {
  doSomethingWith(dependency);
}, []); // Missing dependency
```

**Correct:**
```tsx
useEffect(() => {
  doSomethingWith(dependency);
}, [dependency]);
```

### 4. Unused Variables

**Issue**: Variables defined but never used.

**Fix**: Prefix with underscore (e.g., `_unusedVar`) or remove if not needed.

## CI/CD Pipeline

Our GitHub Actions workflow runs these verification tools on all pull requests:

1. Runs full verification
2. Reports issues in the PR comments
3. Verifies the fixes before merging

## Publishing to NPM

The Galileo Glass UI package is published to NPM as `@veerone/galileo-glass-ui`. Follow these steps to publish a new version:

1. Update the version in package.json: `npm version patch` (or `minor` or `major` as appropriate)
2. Ensure all tests pass: `npm test`
3. Run full verification: `./scripts/verify.sh`
4. Build the production bundle: `npm run build:clean`
5. Publish to NPM: `npm publish --access public`
6. Create a GitHub release for the new version
7. Update the documentation as needed

When publishing to NPM, make sure to:
- Use NODE_ENV=production to skip build process if needed
- Include all distribution files (dist, dist-min)
- Verify the package works correctly after publishing

## Release Process

1. Ensure all tests pass: `npm test`
2. Run full verification: `./scripts/verify.sh`
3. Update version in package.json
4. Update CHANGELOG.md
5. Create a release tag
6. Publish to npm

## Version Management

When updating the package version:

- **Patch** (`1.0.x`): Bug fixes and minor changes
- **Minor** (`1.x.0`): New features, backward compatible
- **Major** (`x.0.0`): Breaking changes

## Documentation Updates

When making significant changes:

1. Update component documentation in `/docs/components/`
2. Update README.md if necessary
3. Update examples in `/examples/`
4. Update CHANGELOG.md with the changes

## Performance Monitoring

Regularly check for performance issues:

1. Bundle size: `npm run build && du -h dist/`
2. Runtime performance: `npm run perf`

## Code Health Metrics

We track several metrics for code health:

1. Test coverage
2. ESLint warning count
3. TypeScript strict compliance
4. Dependency count

Run `npm run metrics` to generate a full report. 