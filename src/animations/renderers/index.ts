/**
 * Animation Renderers
 * 
 * This module exports animation renderers for the Galileo Glass UI system.
 * - WaapiRenderer: Uses the Web Animations API for high-performance animations.
 * - RafRenderer: Uses requestAnimationFrame with throttling for more control.
 * - GalileoRendererFactory: Creates the optimal renderer based on device capabilities.
 */

export * from './types';
export { default as WaapiRenderer } from './WaapiRenderer';
export { default as RafRenderer } from './RafRenderer';
export { default as GalileoRendererFactory } from './RendererFactory';
export type { RendererOptions } from './RendererFactory';
export { default as WaapiRendererExample } from './examples/WaapiRendererExample';
export { default as RafRendererExample } from './examples/RafRendererExample';