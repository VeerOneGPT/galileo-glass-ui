# Ref Forwarding with Physics Hooks

This document provides guidance on correctly implementing React's `forwardRef` pattern with Galileo physics hooks.

## Issue Background

We've identified an issue with components that combine React's `forwardRef` pattern with our physics hooks like `usePhysicsInteraction`. The error message was:

```
forwardRef render functions accept exactly two parameters: props and ref. Did you forget to use the ref parameter?
```

This error occurs particularly when using these components with third-party libraries that utilize the `asChild` pattern (such as Radix UI).

## Root Cause

The issue stems from how refs are combined in components that need to:
1. Forward a ref from a parent component (via `forwardRef`)
2. Use a physics hook that also requires access to the same DOM node (via the hook's `ref`)

Incorrect ref merging can break the ref chain or cause React to interpret the component's render function incorrectly.

## Solution: Using `mergePhysicsRef`

We've introduced a utility function that properly merges refs from both sources:

```tsx
import { mergePhysicsRef } from '../../utils/refUtils';

const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>((props, ref) => {
  // Get ref from physics hook
  const { ref: physicsRef, style: physicsStyle } = usePhysicsInteraction<HTMLDivElement>(options);
  
  // Correctly merge the forwarded ref with the physics ref
  const combinedRef = mergePhysicsRef(ref, physicsRef);
  
  return (
    <div ref={combinedRef} style={physicsStyle}>
      {props.children}
    </div>
  );
});
```

## Best Practices

1. **Always use `mergePhysicsRef` when combining forwardRef with physics hooks**:
   ```tsx
   const combinedRef = mergePhysicsRef(forwardedRef, physicsRef);
   ```

2. **For components that need additional ref merging**, you can extend the pattern:
   ```tsx
   const combinedRef = useCallback((node) => {
     const mergedRef = mergePhysicsRef(ref, physicsRef);
     mergedRef(node);
     
     // Add any additional ref handling
     if (otherRef) otherRef(node);
   }, [ref, physicsRef, otherRef]);
   ```

3. **Don't manually combine refs** using ad-hoc approaches as this can lead to subtle bugs.

## Compatibility with Third-Party Libraries

Using `mergePhysicsRef` ensures compatibility with libraries that use the `asChild` pattern (like Radix UI), allowing our components to be seamlessly integrated into complex component hierarchies.

## Testing

When writing tests for components that use forwardRef with physics hooks, ensure you test:

1. That the component correctly forwards refs to the DOM node
2. That physics interactions work correctly
3. That the component can be used as a child of components that modify the ref chain

## Debugging Tips

If you encounter ref-related issues:

1. Check that you're using `mergePhysicsRef` correctly
2. Verify that the DOM element you're attaching the ref to matches the expected type
3. Use React DevTools to inspect the component hierarchy and ref chain 