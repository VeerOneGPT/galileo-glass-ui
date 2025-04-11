# Galileo Glass UI Testing Strategy

## Overview

This document outlines the testing challenges and solutions for the Galileo Glass UI library. The library makes heavy use of advanced animations, physics simulations, and styled-components, which can be challenging to test in a Jest environment.

## Common Testing Challenges

### 1. Styled-Components Integration Issues

**Challenge**: The `jest-styled-components` package can cause errors in test runs:
- `scStyles is not iterable`
- `Cannot read properties of undefined (reading 'removeChild')`

**Solution Options**:
- Skip tests that heavily rely on styled-components in CI runs
- Use a custom mock for jest-styled-components (see `src/test/utils/mockStyledComponents.js`)
- Run tests with a simplified configuration that doesn't include styled-components matchers (use `jest.config.core.js`)

### 2. Animation Timing Issues

**Challenge**: Animation hooks that use `requestAnimationFrame` and state updates often have inconsistent timing in tests:
- Hard to synchronize mock RAF callbacks with React state updates
- Timeouts due to state updates not happening when expected
- Difficult to advance frames and maintain consistent timing

**Solution**:
- Use the animation test utilities in `src/test/utils/animationTestUtils.ts`
- These utilities provide controlled RAF and timer mocks with helper functions
- When facing persistent issues, it may be necessary to skip certain tests that are too timing-sensitive

### 3. Mock Controller Issues

**Challenge**: Testing components that rely on animation controllers can be difficult:
- Mock controller methods may not be called as expected
- Callback registration and triggering can be complex
- State changes may not happen in the expected order

**Solution**:
- Create robust mocks that include callback registration and triggering
- Use the `testWithAnimationControl` wrapper from the animation test utilities
- Manually trigger callbacks at appropriate times to simulate animation events

## Animation Test Utilities

The `src/test/utils/animationTestUtils.ts` file provides several utilities to help with animation testing:

```typescript
// Example usage
import { testWithAnimationControl } from '../../test/utils/animationTestUtils';

test('animation hook works', async () => {
  await testWithAnimationControl(async (animationControl) => {
    // Render your hook or component
    const { result } = renderHook(() => useAnimationHook());
    
    // Start an animation
    act(() => { result.current.start(); });
    
    // Advance animation frames
    animationControl.advanceFramesAndTimers(10);
    
    // Check if animation progressed
    expect(result.current.progress).toBeGreaterThan(0);
  });
});
```

## Best Practices

1. **Divide and Conquer**: Break complex animation tests into smaller, focused tests
2. **Isolate Side Effects**: Minimize side effects in tests to make them more predictable
3. **Mock Aggressively**: Replace complex animations with simpler mocks when testing other functionality
4. **Prefer Unit Tests**: Focus on unit testing isolated pieces rather than integrated animations
5. **Manual Verification**: Some aspects of animations are best verified manually or in E2E tests

## Skipped Tests

In some cases, tests may be skipped due to persistent environment issues. When skipping tests:

1. Add clear documentation about why the test is skipped
2. Verify the functionality manually to ensure it works in the actual application
3. Consider alternative testing approaches (e.g., component storybook tests)

## Future Improvements

1. Investigate better ways to mock styled-components in Jest
2. Explore using a browser testing environment for animation tests
3. Consider creating specialized animation testing tools for Galileo Glass
4. Refactor animation code to be more testable when possible 