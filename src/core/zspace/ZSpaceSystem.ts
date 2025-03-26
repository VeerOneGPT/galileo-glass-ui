/**
 * Z-Space Layering System
 *
 * A system for managing z-index values and 3D space in the application.
 * This provides consistent depth management across components.
 */

// Z-index values for different layers
export enum ZLayer {
  // Background layers
  Background = 0,
  BackgroundAccent = 10,

  // Content layers
  Content = 100,
  ContentAccent = 110,
  ContentOverlay = 120,

  // UI element layers
  Controls = 200,
  ControlsAccent = 210,

  // Surface layers
  Surface = 300,
  SurfaceAccent = 310,

  // Feedback layers
  Tooltip = 400,
  Toast = 410,
  Notification = 420,

  // Navigation layers
  Navigation = 500,
  NavigationFixed = 510,

  // Overlay layers
  Backdrop = 600,
  Dialog = 700,
  Modal = 800,
  Drawer = 900,

  // Top layers
  Popover = 1000,
  Menu = 1100,
  Dropdown = 1200,

  // Floating layers
  FloatingActions = 1300,

  // Highest layers
  TopLayer = 9000,
  SystemNotification = 9100,
  DebugTools = 9500,
}

// 3D space depth values for perspective effects (in pixels)
export enum ZDepth {
  Background = -300,
  BackgroundAccent = -200,

  Content = -100,
  ContentAccent = -50,

  Surface = 0, // Baseline

  ControlsAbove = 50,

  Floating = 100,
  FloatingAccent = 150,

  Overlay = 200,
  OverlayAccent = 250,

  Top = 300,
}

// Layer descriptions for debugging and documentation
export const ZLayerDescription: Record<ZLayer, string> = {
  [ZLayer.Background]: 'Main background elements',
  [ZLayer.BackgroundAccent]: 'Highlighted background elements',

  [ZLayer.Content]: 'Primary content',
  [ZLayer.ContentAccent]: 'Highlighted content',
  [ZLayer.ContentOverlay]: 'Content that overlays other content',

  [ZLayer.Controls]: 'UI controls like buttons, inputs',
  [ZLayer.ControlsAccent]: 'Highlighted or active controls',

  [ZLayer.Surface]: 'Cards, papers, containers',
  [ZLayer.SurfaceAccent]: 'Highlighted surfaces',

  [ZLayer.Tooltip]: 'Tooltips and small informational elements',
  [ZLayer.Toast]: 'Toast messages',
  [ZLayer.Notification]: 'Notification badges or alerts',

  [ZLayer.Navigation]: 'Navigation elements',
  [ZLayer.NavigationFixed]: 'Fixed navigation bars',

  [ZLayer.Backdrop]: 'Backdrops for modals and dialogs',
  [ZLayer.Dialog]: 'Dialog boxes',
  [ZLayer.Modal]: 'Modal windows',
  [ZLayer.Drawer]: 'Side drawer panels',

  [ZLayer.Popover]: 'Popover elements',
  [ZLayer.Menu]: 'Menu panels',
  [ZLayer.Dropdown]: 'Dropdown selectors',

  [ZLayer.FloatingActions]: 'Floating action buttons',

  [ZLayer.TopLayer]: 'Elements that should always be on top',
  [ZLayer.SystemNotification]: 'System-level notifications',
  [ZLayer.DebugTools]: 'Debugging overlays and tools',
};

// Interface for Z-space context
export interface ZSpaceContextValue {
  // The base Z-index for the current context
  baseZIndex: number;

  // The perspective depth for 3D effects
  perspectiveDepth: number;

  // Whether Z-space animations are enabled
  animationsEnabled: boolean;

  // Get a Z-index value for a specific layer
  getZIndex: (layer: ZLayer | number) => number;

  // Get a Z-depth value for 3D transformations
  getZDepth: (depth: ZDepth | number) => number;

  // Get CSS for 3D transformations
  getTransformCSS: (depth: ZDepth | number) => string;
}

// Default Z-space context
export const DefaultZSpaceContext: ZSpaceContextValue = {
  baseZIndex: 0,
  perspectiveDepth: 1000,
  animationsEnabled: true,

  getZIndex: (layer: ZLayer | number): number => {
    return typeof layer === 'number' ? layer : layer;
  },

  getZDepth: (depth: ZDepth | number): number => {
    return typeof depth === 'number' ? depth : depth;
  },

  getTransformCSS: (depth: ZDepth | number): string => {
    const zDepth = typeof depth === 'number' ? depth : depth;
    return `translateZ(${zDepth}px)`;
  },
};

/**
 * Creates a Z-space layer modifier
 *
 * This function is used to create CSS for Z-index and 3D transformations
 * with consistent values across the application.
 *
 * @param layer - The Z-layer to use for z-index
 * @param depth - The Z-depth to use for 3D transformations
 * @param context - The Z-space context
 * @returns CSS properties for z-index and transform
 */
export const zLayer = (
  layer: ZLayer | number,
  depth?: ZDepth | number,
  context: ZSpaceContextValue = DefaultZSpaceContext
): string => {
  const zIndex = context.getZIndex(layer);

  if (depth !== undefined) {
    const transform = context.getTransformCSS(depth);
    return `
      z-index: ${zIndex};
      transform: ${transform};
    `;
  }

  return `z-index: ${zIndex};`;
};

/**
 * Creates a 3D transformation CSS
 *
 * @param depth - The Z-depth to use for 3D transformations
 * @param extraTransform - Additional transform properties to include
 * @param context - The Z-space context
 * @returns CSS properties for transform
 */
export const zDepth = (
  depth: ZDepth | number,
  extraTransform?: string,
  context: ZSpaceContextValue = DefaultZSpaceContext
): string => {
  const transform = context.getTransformCSS(depth);

  if (extraTransform) {
    return `transform: ${transform} ${extraTransform};`;
  }

  return `transform: ${transform};`;
};

/**
 * Creates a CSS perspective property for containing 3D elements
 *
 * @param depth - The perspective depth value
 * @returns CSS properties for perspective
 */
export const zPerspective = (depth = 1000): string => {
  return `
    perspective: ${depth}px;
    perspective-origin: center center;
  `;
};

export default {
  ZLayer,
  ZDepth,
  zLayer,
  zDepth,
  zPerspective,
};
