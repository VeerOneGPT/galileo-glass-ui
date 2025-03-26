/**
 * Mark Element as Animating
 *
 * Utilities for marking elements as actively animating.
 */

// Animation performance tracking
const animatingElements = new Set<HTMLElement>();

/**
 * Mark an element as currently animating
 * @param element The element that is animating
 */
export const markAsAnimating = (element: HTMLElement): void => {
  if (!element) return;

  // Add to set of animating elements
  animatingElements.add(element);

  // Optimize for animation
  element.style.willChange = 'transform, opacity';
};

/**
 * Mark an element as done animating
 * @param element The element that is done animating
 */
export const markAsAnimationComplete = (element: HTMLElement): void => {
  if (!element) return;

  // Remove from set of animating elements
  animatingElements.delete(element);

  // Remove optimization
  element.style.willChange = 'auto';
};

/**
 * Check if an element is currently animating
 * @param element The element to check
 * @returns True if the element is currently animating
 */
export const isAnimating = (element: HTMLElement): boolean => {
  return animatingElements.has(element);
};

/**
 * Get the number of elements currently animating
 * @returns The count of animating elements
 */
export const getAnimatingElementCount = (): number => {
  return animatingElements.size;
};

/**
 * Clear all animation tracking
 */
export const resetAnimationTracking = (): void => {
  animatingElements.clear();
};
