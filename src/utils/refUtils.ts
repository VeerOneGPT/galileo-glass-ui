/**
 * React Ref Utilities
 * 
 * Helper functions for working with React refs, especially when combining
 * multiple refs like when using physics hooks with forwardRef
 */

import { MutableRefObject, Ref, RefCallback } from 'react';

/**
 * Type guard to check if a ref is a callback ref
 */
function isRefCallback<T>(ref: Ref<T>): ref is RefCallback<T> {
  return typeof ref === 'function';
}

/**
 * Type guard to check if a ref is a mutable ref object
 */
function isRefObject<T>(ref: Ref<T>): ref is MutableRefObject<T> {
  return ref !== null && typeof ref === 'object' && 'current' in ref;
}

/**
 * Merge multiple React refs into a single ref callback
 * This is useful when you need to combine refs, such as:
 * - A ref from forwardRef
 * - A ref from a physics hook
 * - Your own local ref
 * 
 * @param refs Array of React refs to merge
 * @returns A callback ref that updates all provided refs
 */
export function mergeRefs<T>(...refs: Ref<T>[]): RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (isRefCallback(ref)) {
        ref(value);
      } else if (isRefObject(ref)) {
        ref.current = value;
      }
    });
  };
}

/**
 * Specifically designed for physics hooks that return a ref object 
 * along with additional props. This merges the physics ref with 
 * another ref (like from forwardRef).
 * 
 * @param forwardedRef Ref from forwardRef or other external source
 * @param physicsRef Ref object from a physics hook
 * @returns A merged ref that can be used in place of the physics ref
 */
export function mergePhysicsRef<T>(
  forwardedRef: Ref<T>, 
  physicsRef: MutableRefObject<T | null>
): MutableRefObject<T | null> {
  // Create a new callback that updates both refs
  const mergedCallback = mergeRefs(forwardedRef, physicsRef);
  
  // Set up a proxy ref object that will update both refs when its current is set
  const proxyRef: MutableRefObject<T | null> = {
    get current() {
      return physicsRef.current;
    },
    set current(value) {
      // When current is set, update both refs
      mergedCallback(value);
    }
  };
  
  return proxyRef;
}

/**
 * Similar to mergePhysicsRef but designed for the common pattern where
 * physics hooks return an object with a ref property.
 * 
 * @param forwardedRef Ref from forwardRef
 * @param hooksResult Object with a ref property from a physics hook
 * @returns A copy of the hooksResult with the ref merged with forwardedRef
 */
export function withForwardedRef<
  T, 
  R extends { ref: MutableRefObject<T | null> }
>(forwardedRef: Ref<T>, hooksResult: R): R {
  // Create a merged ref
  const mergedRef = mergePhysicsRef(forwardedRef, hooksResult.ref);
  
  // Return a new object with the merged ref
  return {
    ...hooksResult,
    ref: mergedRef
  };
} 