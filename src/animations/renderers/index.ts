/**
 * Animation Renderers Index
 * 
 * This file exports the available animation renderers and related types.
 */

export * from './types'; // Export all types first
export { default as GalileoRendererFactory } from './RendererFactory';
export type { RendererOptions } from './RendererFactory';

// Explicitly export classes and specific types to avoid collisions
export { WaapiRenderer } from './WaapiRenderer';
export { RafRenderer } from './RafRenderer';

// Export potentially colliding types from one source
export type { FillMode } from './WaapiRenderer'; 
// Add other potentially colliding types here if needed, e.g.:
// export type { SpecificRendererOptions } from './WaapiRenderer'; // Example