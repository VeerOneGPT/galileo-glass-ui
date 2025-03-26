/**
 * HTML Element Type Utilities
 * 
 * This file provides utilities for safely handling HTML element type compatibility
 * between generic HTMLElement and more specific element types.
 */

import React from 'react';

/**
 * Type that allows flexible HTML element references
 * This solves compatibility issues between RefObject<HTMLElement> and RefObject<HTMLDivElement> etc.
 */
export type FlexibleElementRef<T extends HTMLElement = HTMLElement> = 
  | React.RefObject<T>
  | React.RefObject<HTMLElement>
  | React.MutableRefObject<T | null>
  | React.MutableRefObject<HTMLElement | null>
  | null;

/**
 * Type for any HTML element
 * Allows compatibility between specific element types
 */
export type AnyHTMLElement =
  | HTMLElement
  | HTMLDivElement
  | HTMLButtonElement
  | HTMLAnchorElement
  | HTMLSpanElement
  | HTMLInputElement
  | HTMLImageElement;

/**
 * Safely gets an element from a flexible ref
 * Returns null if the ref or current is null
 * 
 * @param ref Any React ref object to an HTML element
 * @returns The HTML element or null
 */
export function getElementFromRef<T extends HTMLElement = HTMLElement>(
  ref: FlexibleElementRef<T>
): HTMLElement | null {
  if (!ref || !ref.current) return null;
  return ref.current;
}

/**
 * Type-safe way to cast between HTML element types
 * This helps TypeScript understand element compatibility
 * 
 * @param element Any HTML element
 * @returns The same element with a different type
 */
export function castElement<T extends HTMLElement = HTMLElement>(
  element: AnyHTMLElement | null
): T | null {
  return element as T | null;
}

/**
 * Type-safe way to cast a React ref between HTML element types
 * This enables compatibility between generic HTMLElement refs and specific element refs
 * 
 * @param ref React ref to any HTML element
 * @returns The same ref cast to the target type
 */
export function castElementRef<T extends HTMLElement = HTMLElement>(
  ref: FlexibleElementRef
): React.RefObject<T> {
  return ref as React.RefObject<T>;
}

/**
 * Enhanced ButtonProps that works with both HTMLElement and HTMLButtonElement refs
 * Designed to help with the ref compatibility issues in components
 */
export interface FlexibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLElement> | React.Ref<HTMLButtonElement>;
}

/**
 * Enhanced DivProps that works with both HTMLElement and HTMLDivElement refs
 * Designed to help with the ref compatibility issues in components
 */
export interface FlexibleDivProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLElement> | React.Ref<HTMLDivElement>;
}

/**
 * Function to create a compatible React.Ref
 * that can be used with any HTML element type
 */
export function createCompatibleRef<T extends HTMLElement = HTMLElement, U extends HTMLElement = HTMLElement>(
  ref: React.Ref<T> | null | undefined
): React.Ref<U> {
  return ref as unknown as React.Ref<U>;
}

/**
 * Helper function to make a component work with both HTMLElement and a specific element type
 * 
 * @param Component React component to wrap
 * @returns Component that accepts any HTML element ref
 */
export function withFlexibleRef<P extends {}>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return Component as React.ComponentType<P>;
}

/**
 * Creates a ref that can be used with any HTML element type
 * 
 * @returns A React ref compatible with any HTML element
 */
export function createFlexibleRef<T extends HTMLElement = HTMLElement>(): React.RefObject<T> {
  return React.createRef<T>();
}