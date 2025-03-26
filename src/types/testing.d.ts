/**
 * Test-specific type declarations
 */

import { FlattenSimpleInterpolation as _FlattenSimpleInterpolation } from 'styled-components';

// Extend FlattenSimpleInterpolation for testing purposes
declare module 'styled-components' {
  interface FlattenSimpleInterpolation {
    __cssString?: string;
  }
}

// Interface for mock IntersectionObserver in tests
interface MockIntersectionObserver {
  observe: jest.Mock;
  unobserve: jest.Mock;
  disconnect: jest.Mock;
  takeRecords: jest.Mock;
  root: Element | null;
  rootMargin: string;
  thresholds: ReadonlyArray<number>;
  readonly this: IntersectionObserver;
}

// Fix the error in animation pipeline test
declare module '../../orchestration/GestaltPatterns' {
  export function createStaggeredSequence(options: any): any;
}

// Fix missing function in MotionSensitivity
declare module '../../accessibility/MotionSensitivity' {
  export function getAdjustedAnimation(
    options: any,
    sensitivity?: any
  ): {
    duration: number;
    shouldAnimate: boolean;
  };
}

// Make the performance monitoring test a module
export {};
