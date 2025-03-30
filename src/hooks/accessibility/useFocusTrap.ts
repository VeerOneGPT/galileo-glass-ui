import { useEffect, useRef, useCallback } from 'react';

/**
 * Selectors for focusable elements.
 * Added role="dialog" and role="alertdialog" for modal/dialog components.
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex^="-"])',
  '[contenteditable="true"]',
  '[role="dialog"]',
  '[role="alertdialog"]',
].join(', ');

/**
 * A hook to trap focus within a specific container element.
 * Useful for modals, drawers, and other overlay components to improve accessibility.
 *
 * @param containerRef A React ref object pointing to the container element.
 * @param active A boolean indicating whether the focus trap should be active.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  active: boolean
): void {
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) {
        return;
      }

      const focusableElements = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter(el => el.offsetParent !== null); // Ensure elements are visible

      if (focusableElements.length === 0) {
        // No focusable elements, prevent tabbing away
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentFocusedIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      );

      if (event.shiftKey) {
        // Shift + Tab: Go backwards
        if (document.activeElement === firstElement || currentFocusedIndex === -1) {
          // If focus is on the first element or outside the trap, wrap to the last
          event.preventDefault();
          lastElement.focus();
        }
        // Default browser behavior handles tabbing within the trap otherwise
      } else {
        // Tab: Go forwards
        if (document.activeElement === lastElement || currentFocusedIndex === -1) {
          // If focus is on the last element or outside the trap, wrap to the first
          event.preventDefault();
          firstElement.focus();
        }
        // Default browser behavior handles tabbing within the trap otherwise
      }
    },
    [containerRef]
  );

  useEffect(() => {
    if (active && containerRef.current) {
      // Save the element that was focused before the trap activated
      lastFocusedElementRef.current = document.activeElement as HTMLElement;

      // Add event listener
      document.addEventListener('keydown', handleKeyDown);

      // Optionally, focus the first element in the trap or the container itself
      // const firstFocusable = containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      // if (firstFocusable) {
      //   firstFocusable.focus();
      // } else {
      //   containerRef.current.focus(); // Ensure container is focusable if no elements inside
      // }

    } else {
      // Remove event listener
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the element that was focused before the trap activated
      if (lastFocusedElementRef.current && typeof lastFocusedElementRef.current.focus === 'function') {
        lastFocusedElementRef.current.focus();
        lastFocusedElementRef.current = null; // Clear the ref
      }
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Ensure focus is restored if component unmounts while active
      if (active && lastFocusedElementRef.current && typeof lastFocusedElementRef.current.focus === 'function') {
          // Check if the previously focused element is still in the DOM
          if (document.body.contains(lastFocusedElementRef.current)) {
              lastFocusedElementRef.current.focus();
          }
      }
    };
  }, [active, containerRef, handleKeyDown]);
} 