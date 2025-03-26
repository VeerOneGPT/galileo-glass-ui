/**
 * Z-Space Layer Mixin
 *
 * Creates z-space layering effects for components
 */
import { css } from 'styled-components';

import { cssWithKebabProps } from '../../cssUtils';

/**
 * Layer types in the z-space system
 */
export enum ZSpaceLayerType {
  BACKGROUND = 'background',
  BASE = 'base',
  CONTENT = 'content',
  OVERLAY = 'overlay',
  POPUP = 'popup',
  MODAL = 'modal',
  TOOLTIP = 'tooltip',
  TOP = 'top',
}

/**
 * Layer position within its parent ZSpaceLayerType
 */
export enum ZSpacePosition {
  BOTTOM = 'bottom',
  MIDDLE = 'middle',
  TOP = 'top',
}

/**
 * Z-space layer options
 */
export interface ZSpaceLayerOptions {
  /**
   * The layer type in the z-space system
   */
  layer?: ZSpaceLayerType | string;

  /**
   * The position within the layer type
   */
  position?: ZSpacePosition | string;

  /**
   * Custom z-index value (overrides the layer system)
   */
  zIndex?: number;

  /**
   * The 3D translation depth in pixels (positive = closer to viewer)
   */
  depth?: number;

  /**
   * Perspective value for 3D transformations
   */
  perspective?: number;

  /**
   * If true, creates a stacking context
   */
  createStackingContext?: boolean;

  /**
   * If true, applies hardware acceleration
   */
  hardwareAccelerated?: boolean;

  /**
   * If true, applies transform-style: preserve-3d
   */
  preserve3d?: boolean;

  /**
   * Rotation around the X axis in degrees
   */
  rotateX?: number;

  /**
   * Rotation around the Y axis in degrees
   */
  rotateY?: number;

  /**
   * Scale factor for the element
   */
  scale?: number;

  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Z-index values for each layer type and position
 */
const Z_INDEX_MAP: Record<ZSpaceLayerType, Record<ZSpacePosition, number>> = {
  [ZSpaceLayerType.BACKGROUND]: {
    [ZSpacePosition.BOTTOM]: -10,
    [ZSpacePosition.MIDDLE]: -5,
    [ZSpacePosition.TOP]: -1,
  },
  [ZSpaceLayerType.BASE]: {
    [ZSpacePosition.BOTTOM]: 0,
    [ZSpacePosition.MIDDLE]: 5,
    [ZSpacePosition.TOP]: 9,
  },
  [ZSpaceLayerType.CONTENT]: {
    [ZSpacePosition.BOTTOM]: 10,
    [ZSpacePosition.MIDDLE]: 15,
    [ZSpacePosition.TOP]: 19,
  },
  [ZSpaceLayerType.OVERLAY]: {
    [ZSpacePosition.BOTTOM]: 20,
    [ZSpacePosition.MIDDLE]: 25,
    [ZSpacePosition.TOP]: 29,
  },
  [ZSpaceLayerType.POPUP]: {
    [ZSpacePosition.BOTTOM]: 30,
    [ZSpacePosition.MIDDLE]: 35,
    [ZSpacePosition.TOP]: 39,
  },
  [ZSpaceLayerType.MODAL]: {
    [ZSpacePosition.BOTTOM]: 40,
    [ZSpacePosition.MIDDLE]: 45,
    [ZSpacePosition.TOP]: 49,
  },
  [ZSpaceLayerType.TOOLTIP]: {
    [ZSpacePosition.BOTTOM]: 50,
    [ZSpacePosition.MIDDLE]: 55,
    [ZSpacePosition.TOP]: 59,
  },
  [ZSpaceLayerType.TOP]: {
    [ZSpacePosition.BOTTOM]: 60,
    [ZSpacePosition.MIDDLE]: 65,
    [ZSpacePosition.TOP]: 69,
  },
};

/**
 * Get z-index value from layer and position
 */
const getZIndexFromLayer = (
  layer: ZSpaceLayerType | string = ZSpaceLayerType.BASE,
  position: ZSpacePosition | string = ZSpacePosition.MIDDLE
): number => {
  const layerType = layer as ZSpaceLayerType;
  const positionType = position as ZSpacePosition;

  if (Z_INDEX_MAP[layerType] && Z_INDEX_MAP[layerType][positionType] !== undefined) {
    return Z_INDEX_MAP[layerType][positionType];
  }

  // Default to base middle if not found
  return Z_INDEX_MAP[ZSpaceLayerType.BASE][ZSpacePosition.MIDDLE];
};

/**
 * Creates z-space layering effects
 */
export const zSpaceLayer = (options: ZSpaceLayerOptions) => {
  const {
    layer = ZSpaceLayerType.BASE,
    position = ZSpacePosition.MIDDLE,
    zIndex: customZIndex,
    depth = 0,
    perspective = 1000,
    createStackingContext = true,
    hardwareAccelerated = true,
    preserve3d = false,
    rotateX = 0,
    rotateY = 0,
    scale = 1,
    themeContext,
  } = options;

  // Determine z-index
  const zIndex = customZIndex !== undefined ? customZIndex : getZIndexFromLayer(layer, position);

  // Build transform string
  let transform = '';

  if (depth !== 0 || rotateX !== 0 || rotateY !== 0 || scale !== 1) {
    const transforms = [];

    if (depth !== 0) {
      transforms.push(`translateZ(${depth}px)`);
    }

    if (rotateX !== 0) {
      transforms.push(`rotateX(${rotateX}deg)`);
    }

    if (rotateY !== 0) {
      transforms.push(`rotateY(${rotateY}deg)`);
    }

    if (scale !== 1) {
      transforms.push(`scale(${scale})`);
    }

    transform = transforms.join(' ');
  }

  // Build CSS
  return cssWithKebabProps`
    position: relative;
    z-index: ${zIndex};
    
    ${
      createStackingContext
        ? `
      isolation: isolate;
    `
        : ''
    }
    
    ${
      perspective !== undefined
        ? `
      perspective: ${perspective}px;
    `
        : ''
    }
    
    ${
      preserve3d
        ? `
      transform-style: preserve-3d;
    `
        : ''
    }
    
    ${
      transform
        ? `
      transform: ${transform};
    `
        : ''
    }
    
    ${
      hardwareAccelerated
        ? `
      will-change: transform;
      backface-visibility: hidden;
    `
        : ''
    }
  `;
};

export default zSpaceLayer;
