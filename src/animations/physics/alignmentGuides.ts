/**
 * Alignment Guides System
 * 
 * This system provides visual guides for alignment when using the snap points system.
 * It renders guidelines to show where elements will snap to, enhancing the UX
 * for precise positioning in design/layout systems.
 */

import { Vector2D } from './magneticUtils';
import { 
  SnapPointConfig, 
  SnapPointType, 
  SnapOrientation, 
  SnapSystemConfig,
  SnapEvent
} from './snapPoints';

/**
 * Guide line appearance options
 */
export interface GuideLineStyle {
  color: string;                // Guide color
  thickness: number;            // Line thickness (pixels)
  dashArray?: string;           // SVG dash array pattern (e.g., "5,5")
  opacity: number;              // Opacity (0-1)
  zIndex: number;               // Z-index for guide lines
  showLabels: boolean;          // Whether to show labels on guides
  labelFontSize: number;        // Font size for labels
  labelColor: string;           // Color for labels
  labelBackground: string;      // Background color for labels
  extendBeyondContent: boolean; // Whether guides extend beyond the content area
  extension: number;            // How far guides extend (pixels)
}

/**
 * Default guide line style
 */
export const DEFAULT_GUIDE_STYLE: GuideLineStyle = {
  color: 'rgba(74, 108, 247, 0.7)',
  thickness: 1,
  dashArray: '5,5',
  opacity: 0.8,
  zIndex: 9999,
  showLabels: true,
  labelFontSize: 12,
  labelColor: '#ffffff',
  labelBackground: 'rgba(74, 108, 247, 0.9)',
  extendBeyondContent: true,
  extension: 10000
};

/**
 * A single alignment guide
 */
export interface AlignmentGuide {
  id: string;                  // Unique identifier
  type: 'horizontal' | 'vertical'; // Line orientation
  position: number;            // Position on the corresponding axis
  label?: string;              // Optional label
  color?: string;              // Override color
  dashArray?: string;          // Override dash pattern
  thickness?: number;          // Override thickness
  opacity?: number;            // Override opacity
  points?: Vector2D[];         // Specific points to draw between instead of a full line
  active: boolean;             // Whether guide is currently active/visible
  snapPointIds: string[];      // IDs of snap points that created this guide
}

/**
 * Create a horizontal guide from a snap point
 */
export function createHorizontalGuide(
  snapPoint: SnapPointConfig,
  style: GuideLineStyle = DEFAULT_GUIDE_STYLE
): AlignmentGuide | null {
  if (!snapPoint.position) return null;
  
  // For point-type snap points
  if (snapPoint.type === SnapPointType.POINT) {
    return {
      id: `horizontal-guide-${snapPoint.id || Date.now()}`,
      type: 'horizontal',
      position: snapPoint.position.y,
      label: snapPoint.metadata?.label || `Y: ${snapPoint.position.y}`,
      color: style.color,
      dashArray: style.dashArray,
      thickness: style.thickness,
      opacity: style.opacity,
      active: true,
      snapPointIds: [snapPoint.id || 'unknown']
    };
  }
  
  // For line-type snap points with horizontal orientation
  if (snapPoint.type === SnapPointType.LINE && 
     (snapPoint.orientation === SnapOrientation.HORIZONTAL || 
      snapPoint.orientation === SnapOrientation.BOTH)) {
    return {
      id: `horizontal-guide-${snapPoint.id || Date.now()}`,
      type: 'horizontal',
      position: snapPoint.position.y,
      label: snapPoint.metadata?.label || `Y: ${snapPoint.position.y}`,
      color: style.color,
      dashArray: style.dashArray,
      thickness: style.thickness,
      opacity: style.opacity,
      active: true,
      snapPointIds: [snapPoint.id || 'unknown']
    };
  }
  
  return null;
}

/**
 * Create a vertical guide from a snap point
 */
export function createVerticalGuide(
  snapPoint: SnapPointConfig,
  style: GuideLineStyle = DEFAULT_GUIDE_STYLE
): AlignmentGuide | null {
  if (!snapPoint.position) return null;
  
  // For point-type snap points
  if (snapPoint.type === SnapPointType.POINT) {
    return {
      id: `vertical-guide-${snapPoint.id || Date.now()}`,
      type: 'vertical',
      position: snapPoint.position.x,
      label: snapPoint.metadata?.label || `X: ${snapPoint.position.x}`,
      color: style.color,
      dashArray: style.dashArray,
      thickness: style.thickness,
      opacity: style.opacity,
      active: true,
      snapPointIds: [snapPoint.id || 'unknown']
    };
  }
  
  // For line-type snap points with vertical orientation
  if (snapPoint.type === SnapPointType.LINE && 
     (snapPoint.orientation === SnapOrientation.VERTICAL || 
      snapPoint.orientation === SnapOrientation.BOTH)) {
    return {
      id: `vertical-guide-${snapPoint.id || Date.now()}`,
      type: 'vertical',
      position: snapPoint.position.x,
      label: snapPoint.metadata?.label || `X: ${snapPoint.position.x}`,
      color: style.color,
      dashArray: style.dashArray,
      thickness: style.thickness,
      opacity: style.opacity,
      active: true,
      snapPointIds: [snapPoint.id || 'unknown']
    };
  }
  
  return null;
}

/**
 * Create grid guides from a grid snap point
 */
export function createGridGuides(
  snapPoint: SnapPointConfig,
  viewportBounds: DOMRect,
  style: GuideLineStyle = DEFAULT_GUIDE_STYLE
): AlignmentGuide[] {
  if (snapPoint.type !== SnapPointType.GRID || !snapPoint.gridSize) {
    return [];
  }
  
  const guides: AlignmentGuide[] = [];
  const { gridSize } = snapPoint;
  
  // Calculate grid line positions
  const startX = Math.floor(viewportBounds.left / gridSize.x) * gridSize.x;
  const endX = Math.ceil(viewportBounds.right / gridSize.x) * gridSize.x;
  const startY = Math.floor(viewportBounds.top / gridSize.y) * gridSize.y;
  const endY = Math.ceil(viewportBounds.bottom / gridSize.y) * gridSize.y;
  
  // Create vertical grid lines
  for (let x = startX; x <= endX; x += gridSize.x) {
    guides.push({
      id: `grid-vertical-${x}`,
      type: 'vertical',
      position: x,
      color: style.color,
      dashArray: style.dashArray,
      thickness: style.thickness,
      opacity: style.opacity * 0.7, // Slightly more transparent for grid
      active: true,
      snapPointIds: [snapPoint.id || 'grid']
    });
  }
  
  // Create horizontal grid lines
  for (let y = startY; y <= endY; y += gridSize.y) {
    guides.push({
      id: `grid-horizontal-${y}`,
      type: 'horizontal',
      position: y,
      color: style.color,
      dashArray: style.dashArray,
      thickness: style.thickness,
      opacity: style.opacity * 0.7, // Slightly more transparent for grid
      active: true,
      snapPointIds: [snapPoint.id || 'grid']
    });
  }
  
  return guides;
}

/**
 * Create alignment guides from element edges
 */
export function createElementEdgeGuides(
  elementRect: DOMRect,
  elementId: string,
  style: GuideLineStyle = DEFAULT_GUIDE_STYLE
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  
  // Left edge
  guides.push({
    id: `edge-left-${elementId}`,
    type: 'vertical',
    position: elementRect.left,
    label: `Left: ${Math.round(elementRect.left)}`,
    color: style.color,
    dashArray: style.dashArray,
    thickness: style.thickness,
    opacity: style.opacity,
    active: true,
    snapPointIds: ['element-edge']
  });
  
  // Right edge
  guides.push({
    id: `edge-right-${elementId}`,
    type: 'vertical',
    position: elementRect.right,
    label: `Right: ${Math.round(elementRect.right)}`,
    color: style.color,
    dashArray: style.dashArray,
    thickness: style.thickness,
    opacity: style.opacity,
    active: true,
    snapPointIds: ['element-edge']
  });
  
  // Top edge
  guides.push({
    id: `edge-top-${elementId}`,
    type: 'horizontal',
    position: elementRect.top,
    label: `Top: ${Math.round(elementRect.top)}`,
    color: style.color,
    dashArray: style.dashArray,
    thickness: style.thickness,
    opacity: style.opacity,
    active: true,
    snapPointIds: ['element-edge']
  });
  
  // Bottom edge
  guides.push({
    id: `edge-bottom-${elementId}`,
    type: 'horizontal',
    position: elementRect.bottom,
    label: `Bottom: ${Math.round(elementRect.bottom)}`,
    color: style.color,
    dashArray: style.dashArray,
    thickness: style.thickness,
    opacity: style.opacity,
    active: true,
    snapPointIds: ['element-edge']
  });
  
  // Center X
  guides.push({
    id: `edge-centerX-${elementId}`,
    type: 'vertical',
    position: elementRect.left + elementRect.width / 2,
    label: `Center X: ${Math.round(elementRect.left + elementRect.width / 2)}`,
    color: style.color,
    dashArray: '3,3',
    thickness: style.thickness,
    opacity: style.opacity,
    active: true,
    snapPointIds: ['element-center']
  });
  
  // Center Y
  guides.push({
    id: `edge-centerY-${elementId}`,
    type: 'horizontal',
    position: elementRect.top + elementRect.height / 2,
    label: `Center Y: ${Math.round(elementRect.top + elementRect.height / 2)}`,
    color: style.color,
    dashArray: '3,3',
    thickness: style.thickness,
    opacity: style.opacity,
    active: true,
    snapPointIds: ['element-center']
  });
  
  return guides;
}

/**
 * Create guides based on snap events
 */
export function createGuidesFromSnapEvents(
  snapEvents: SnapEvent[],
  snapPoints: SnapPointConfig[],
  style: GuideLineStyle = DEFAULT_GUIDE_STYLE
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  
  for (const event of snapEvents) {
    const snapPoint = snapPoints.find(sp => sp.id === event.snapPointId);
    if (!snapPoint || !snapPoint.position) continue;
    
    // Create different guides based on snap type
    switch (event.type) {
      case SnapPointType.POINT:
        const hGuide = createHorizontalGuide(snapPoint, style);
        const vGuide = createVerticalGuide(snapPoint, style);
        if (hGuide) guides.push(hGuide);
        if (vGuide) guides.push(vGuide);
        break;
        
      case SnapPointType.LINE:
        if (snapPoint.orientation === SnapOrientation.HORIZONTAL || 
            snapPoint.orientation === SnapOrientation.BOTH) {
          const hGuide = createHorizontalGuide(snapPoint, style);
          if (hGuide) guides.push(hGuide);
        }
        if (snapPoint.orientation === SnapOrientation.VERTICAL || 
            snapPoint.orientation === SnapOrientation.BOTH) {
          const vGuide = createVerticalGuide(snapPoint, style);
          if (vGuide) guides.push(vGuide);
        }
        break;
        
      // Add other types as needed
    }
  }
  
  return guides;
}

/**
 * Filter out duplicate guides that represent the same alignment line
 */
export function deduplicateGuides(guides: AlignmentGuide[]): AlignmentGuide[] {
  const deduped: AlignmentGuide[] = [];
  const posMap: Record<string, boolean> = {};
  
  for (const guide of guides) {
    const key = `${guide.type}-${guide.position}`;
    
    if (!posMap[key]) {
      posMap[key] = true;
      deduped.push(guide);
    } else {
      // If there's already a guide at this position, combine their snapPointIds
      const existing = deduped.find(g => g.type === guide.type && g.position === guide.position);
      if (existing) {
        existing.snapPointIds = [...existing.snapPointIds, ...guide.snapPointIds];
      }
    }
  }
  
  return deduped;
}

/**
 * Get all guide pathways for the current viewport and snap system
 */
export function collectAllGuides(
  snapPoints: SnapPointConfig[],
  snapEvents: SnapEvent[],
  elementRects: Map<string, DOMRect>,
  viewportBounds: DOMRect,
  systemConfig: SnapSystemConfig,
  guideStyle: GuideLineStyle = DEFAULT_GUIDE_STYLE
): AlignmentGuide[] {
  let guides: AlignmentGuide[] = [];
  
  // Add guides from active snap points
  for (const snapPoint of snapPoints) {
    if (snapPoint.disabled) continue;
    
    if (snapPoint.type === SnapPointType.POINT || 
        snapPoint.type === SnapPointType.LINE) {
      const hGuide = createHorizontalGuide(snapPoint, guideStyle);
      const vGuide = createVerticalGuide(snapPoint, guideStyle);
      
      if (hGuide) guides.push(hGuide);
      if (vGuide) guides.push(vGuide);
    } else if (snapPoint.type === SnapPointType.GRID && systemConfig.snapToGrid) {
      const gridGuides = createGridGuides(snapPoint, viewportBounds, guideStyle);
      guides = [...guides, ...gridGuides];
    }
  }
  
  // Add guides from elements if element snapping is enabled
  if (systemConfig.snapToElements) {
    for (const [elementId, rect] of elementRects.entries()) {
      const elementGuides = createElementEdgeGuides(rect, elementId, guideStyle);
      guides = [...guides, ...elementGuides];
    }
  }
  
  // Add guides from active snap events
  const eventGuides = createGuidesFromSnapEvents(snapEvents, snapPoints, guideStyle);
  guides = [...guides, ...eventGuides];
  
  // Deduplicate guides
  return deduplicateGuides(guides);
}

/**
 * Create SVG path data for a guide line
 */
export function createGuidePath(
  guide: AlignmentGuide,
  viewportBounds: DOMRect,
  style: GuideLineStyle = DEFAULT_GUIDE_STYLE
): string {
  if (guide.points && guide.points.length >= 2) {
    // Draw between specific points
    const points = guide.points;
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }
  
  // Draw full guideline
  if (guide.type === 'horizontal') {
    const y = guide.position;
    
    if (style.extendBeyondContent) {
      // Extended line
      const x1 = viewportBounds.left - style.extension;
      const x2 = viewportBounds.right + style.extension;
      return `M ${x1} ${y} L ${x2} ${y}`;
    } else {
      // Contained line
      const x1 = viewportBounds.left;
      const x2 = viewportBounds.right;
      return `M ${x1} ${y} L ${x2} ${y}`;
    }
  } else { // vertical
    const x = guide.position;
    
    if (style.extendBeyondContent) {
      // Extended line
      const y1 = viewportBounds.top - style.extension;
      const y2 = viewportBounds.bottom + style.extension;
      return `M ${x} ${y1} L ${x} ${y2}`;
    } else {
      // Contained line
      const y1 = viewportBounds.top;
      const y2 = viewportBounds.bottom;
      return `M ${x} ${y1} L ${x} ${y2}`;
    }
  }
}

/**
 * Calculate the position for a guide's label
 */
export function calculateLabelPosition(
  guide: AlignmentGuide,
  viewportBounds: DOMRect
): Vector2D {
  if (guide.type === 'horizontal') {
    // Horizontal guide - place label on the left side
    return {
      x: viewportBounds.left + 10,
      y: guide.position - 10
    };
  } else {
    // Vertical guide - place label at the top
    return {
      x: guide.position + 10,
      y: viewportBounds.top + 20
    };
  }
}