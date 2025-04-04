/**
 * Interaction options for chart
 */
export interface ChartInteractionOptions {
  /** Enable zoom/pan capabilities */
  zoomPanEnabled?: boolean;
  /** Zoom mode */
  zoomMode?: 'x' | 'y' | 'xy';
  /** Enable physics-based hover effects */
  physicsHoverEffects?: boolean;
  /** Hover animation speed */
  hoverSpeed?: number;
  /** Show tooltips on hover */
  showTooltips?: boolean;
  /** Tooltip style */
  tooltipStyle?: 'glass' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';
  /** Follow cursor option for tooltips */
  tooltipFollowCursor?: boolean;
  /** Physics parameters for zoom/pan interaction */
  physics?: {
    /** Spring tension */
    tension?: number;
    /** Spring friction */
    friction?: number;
    /** Spring mass */
    mass?: number;
    /** Min zoom level (1.0 = 100%) */
    minZoom?: number;
    /** Max zoom level */
    maxZoom?: number;
    /** Wheel zoom sensitivity (lower = more sensitive) */
    wheelSensitivity?: number;
    /** Inertia duration in ms */
    inertiaDuration?: number;
  };
} 