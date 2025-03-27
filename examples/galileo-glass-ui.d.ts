/**
 * Type declarations for Galileo Glass UI examples
 * 
 * This file provides TypeScript declarations for the Galileo Glass UI components
 * when imported by example applications.
 */
import * as React from 'react';

// Reference source types instead of duplicating them

declare module 'galileo-glass-ui' {
  // Export all from the source components
  export * from '../src/components';

  // Re-export types
  export * from 'galileo-glass-ui/types';
}

// Export the core mixins and effects
declare module 'galileo-glass-ui/core' {
  export * from '../src/design/core';
}

// Export animation and physics
declare module 'galileo-glass-ui/animations' {
  export * from '../src/design/animations';
}

// Common component props interfaces 
declare module 'galileo-glass-ui/types' {
  export * from '../src/types';
}