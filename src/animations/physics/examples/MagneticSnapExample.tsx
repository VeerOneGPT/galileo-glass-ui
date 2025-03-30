/**
 * Magnetic Snap Points and Alignment Guides Example
 * 
 * This example demonstrates the magnetic snap points and alignment guides system
 * that enables precise positioning with physics-based snapping and visual guides.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useMagneticLayout, 
  MagneticLayoutResult 
} from '../useMagneticLayout';
import { 
  SnapPointType, 
  SnapOrientation, 
  SnapPointConfig 
} from '../snapPoints';
import { Vector2D } from '../magneticUtils';
import { accessibleAnimation } from '../../accessibility/accessibleAnimation';

// Styled components
const DesignCanvas = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #f0f5ff;
  border-radius: 8px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const GlassBlock = styled.div<{ $active: boolean }>`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: grab;
  
  /* Glow when active */
  ${props => props.$active && `
    box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.8), 0 4px 15px rgba(0, 0, 0, 0.1);
  `}
  
  transition: box-shadow 0.2s ease-out; // Apply transition directly
`;

const Button = styled.button`
  margin: 5px;
  padding: 8px 12px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3451d1;
  }
  
  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  margin: 5px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const Checkbox = styled.div`
  margin: 8px 0;
  display: flex;
  align-items: center;
  
  input {
    margin-right: 8px;
  }
`;

const Footer = styled.div`
  margin-top: 15px;
  font-size: 0.9em;
  color: #666;
`;

// Element types for the demo
interface DraggableElement {
  id: string;
  width: number;
  height: number;
  initialPosition: Vector2D;
  color?: string;
  label?: string;
}

// Initial elements for the demo
const initialElements: DraggableElement[] = [
  {
    id: 'block-1',
    width: 120,
    height: 80,
    initialPosition: { x: 50, y: 50 },
    color: 'rgba(74, 108, 247, 0.3)',
    label: 'Drag Me'
  },
  {
    id: 'block-2',
    width: 150,
    height: 100,
    initialPosition: { x: 250, y: 150 },
    color: 'rgba(247, 74, 108, 0.3)',
    label: 'Snap To Grid'
  },
  {
    id: 'block-3',
    width: 80,
    height: 180,
    initialPosition: { x: 450, y: 50 },
    color: 'rgba(108, 247, 74, 0.3)',
    label: 'Align With Me'
  }
];

// Snap points for the demo
const defaultSnapPoints: SnapPointConfig[] = [
  // Grid snap point
  {
    id: 'grid',
    type: SnapPointType.GRID,
    gridSize: { x: 50, y: 50 },
    strength: 0.7,
    threshold: 15
  },
  
  // Center point
  {
    id: 'center',
    type: SnapPointType.POINT,
    position: { x: 300, y: 250 },
    strength: 0.8,
    threshold: 20,
    metadata: { label: 'Center' }
  },
  
  // Horizontal guide lines
  {
    id: 'top-line',
    type: SnapPointType.LINE,
    position: { x: 0, y: 100 },
    orientation: SnapOrientation.HORIZONTAL,
    strength: 0.7,
    threshold: 15,
    metadata: { label: 'Top Guide' }
  },
  {
    id: 'bottom-line',
    type: SnapPointType.LINE,
    position: { x: 0, y: 400 },
    orientation: SnapOrientation.HORIZONTAL,
    strength: 0.7,
    threshold: 15,
    metadata: { label: 'Bottom Guide' }
  },
  
  // Vertical guide lines
  {
    id: 'left-line',
    type: SnapPointType.LINE,
    position: { x: 200, y: 0 },
    orientation: SnapOrientation.VERTICAL,
    strength: 0.7,
    threshold: 15,
    metadata: { label: 'Left Guide' }
  },
  {
    id: 'right-line',
    type: SnapPointType.LINE,
    position: { x: 400, y: 0 },
    orientation: SnapOrientation.VERTICAL,
    strength: 0.7,
    threshold: 15,
    metadata: { label: 'Right Guide' }
  }
];

// Main example component
export const MagneticSnapExample: React.FC = () => {
  // Container ref for the design canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State for elements
  const [elements, setElements] = useState<DraggableElement[]>(initialElements);
  
  // State for active element
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  
  // State for snap settings
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToLines, setSnapToLines] = useState(true);
  const [snapToElements, setSnapToElements] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  
  // Refs for magnetic layout hooks
  const magneticHooksRef = useRef<{
    [key: string]: MagneticLayoutResult;
  }>({});
  
  // Create a map of external elements for cross-element snapping
  const [externalElements, setExternalElements] = useState<Map<string, DOMRect>>(new Map());
  
  // Update external elements map when elements change
  useEffect(() => {
    const elementsMap = new Map<string, DOMRect>();
    
    // Create mock DOMRects for each element
    elements.forEach(element => {
      const position = magneticHooksRef.current[element.id]?.position || element.initialPosition;
      
      const rect = new DOMRect(
        position.x,
        position.y,
        element.width,
        element.height
      );
      
      elementsMap.set(element.id, rect);
    });
    
    setExternalElements(elementsMap);
  }, [elements]);
  
  // Create and register an element for dragging with snap points
  const registerElement = (element: DraggableElement) => {
    // Configuration for the magnetic layout
    const snapConfig = {
      snapToGrid,
      snapToLines,
      snapToElements,
      showGuides
    };
    
    // Create the magnetic layout hook
    const {
      snapRef,
      position,
      isDragging,
      guidesElement,
      styleProps,
      ...hookMethods
    } = useMagneticLayout({
      elementId: element.id,
      initialPosition: element.initialPosition,
      containerRef: canvasRef,
      snapPoints: defaultSnapPoints,
      externalElements,
      snapConfig,
      showGuides,
      onDragStart: () => setActiveElementId(element.id),
      onDragEnd: () => setActiveElementId(null)
    });
    
    // Save the hook in the ref for access from other components
    magneticHooksRef.current[element.id] = {
      snapRef,
      position,
      isDragging,
      guidesElement,
      styleProps,
      ...hookMethods
    };
    
    // Render the draggable element
    return (
      <React.Fragment key={element.id}>
        <GlassBlock
          ref={snapRef}
          $active={activeElementId === element.id}
          style={{
            ...(styleProps as React.CSSProperties),
            width: `${element.width}px`,
            height: `${element.height}px`,
            backgroundColor: element.color || 'rgba(255, 255, 255, 0.15)'
          }}
          onMouseDown={(e) => hookMethods.startDrag(e)}
          onTouchStart={(e) => hookMethods.startDrag(e)}
        >
          <div style={{ padding: '10px' }}>{element.label}</div>
        </GlassBlock>
        
        {/* Only show guides for the active element */}
        {activeElementId === element.id && guidesElement}
      </React.Fragment>
    );
  };
  
  // Add a new element
  const addElement = () => {
    const newId = `block-${elements.length + 1}`;
    const newElement: DraggableElement = {
      id: newId,
      width: 100 + Math.random() * 50,
      height: 80 + Math.random() * 50,
      initialPosition: { 
        x: 50 + Math.random() * 400, 
        y: 50 + Math.random() * 300 
      },
      color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`,
      label: `Block ${elements.length + 1}`
    };
    
    setElements([...elements, newElement]);
  };
  
  // Reset positions
  const resetPositions = () => {
    // Reset elements to their initial positions
    elements.forEach(element => {
      const hook = magneticHooksRef.current[element.id];
      if (hook) {
        hook.moveTo(element.initialPosition, false);
      }
    });
  };
  
  // Render the example
  return (
    <div>
      <h2>Magnetic Snap Points & Alignment Guides</h2>
      <p>
        Drag the blocks to see physics-based magnetic snapping and alignment guides in action.
        Elements will snap to grid points, guide lines, and each other's edges.
      </p>
      
      <DesignCanvas ref={canvasRef}>
        {/* Control panel */}
        <ControlPanel>
          <h3>Snapping Controls</h3>
          
          <Checkbox>
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              id="snap-grid"
            />
            <label htmlFor="snap-grid">Snap to Grid</label>
          </Checkbox>
          
          <Checkbox>
            <input
              type="checkbox"
              checked={snapToLines}
              onChange={(e) => setSnapToLines(e.target.checked)}
              id="snap-lines"
            />
            <label htmlFor="snap-lines">Snap to Lines</label>
          </Checkbox>
          
          <Checkbox>
            <input
              type="checkbox"
              checked={snapToElements}
              onChange={(e) => setSnapToElements(e.target.checked)}
              id="snap-elements"
            />
            <label htmlFor="snap-elements">Snap to Elements</label>
          </Checkbox>
          
          <Checkbox>
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
              id="show-guides"
            />
            <label htmlFor="show-guides">Show Guides</label>
          </Checkbox>
          
          <div>
            <Button onClick={addElement}>Add Element</Button>
            <Button onClick={resetPositions}>Reset Positions</Button>
          </div>
          
          <Footer>
            Try dragging elements near grid points, guide lines, and other elements to see snapping in action.
          </Footer>
        </ControlPanel>
        
        {/* Draggable elements */}
        {elements.map(element => registerElement(element))}
      </DesignCanvas>
      
      {/* Feature explanation */}
      <div style={{ marginTop: '20px' }}>
        <h3>Features</h3>
        <ul>
          <li>Physics-based magnetic snapping with natural motion</li>
          <li>Visual alignment guides with distance indicators</li>
          <li>Snap to grid, lines, points, and other elements</li>
          <li>Snap to edges and centers for precise alignment</li>
          <li>Configurable snap strength and threshold</li>
          <li>Momentum-based dragging with physics</li>
          <li>Dynamically shows guides only when needed</li>
          <li>Fully customizable appearance and behavior</li>
        </ul>
      </div>
    </div>
  );
};