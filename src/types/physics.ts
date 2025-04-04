/**
 * Configuration options for the ambient tilt effect.
 */
export interface AmbientTiltOptions {
  /** Maximum rotation angle (degrees) around the X-axis. Defaults to 5. */
  maxRotateX?: number;
  /** Maximum rotation angle (degrees) around the Y-axis. Defaults to 5. */
  maxRotateY?: number;
  /** Influence range (radius in pixels from center) for full effect. Defaults to viewport width/height. */
  influenceRange?: number | undefined;
  /** Smoothing factor for the tilt transition (0 to 1). Higher means smoother/slower. Defaults to 0.1. */
  smoothingFactor?: number;
  /** Scale factor applied on tilt. Defaults to 1 (no scaling). */
  scaleFactor?: number;
  /** Perspective value for the CSS transform (used internally by hook). */
  perspective?: number;
  /** Whether the effect is enabled. Defaults to true. */
  enabled?: boolean;
} 