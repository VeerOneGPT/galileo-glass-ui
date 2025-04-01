/**
 * GamePhysicsDemo.tsx
 * 
 * A demonstration of the useGamePhysics hook for creating interactive
 * game-like physics interactions in the UI.
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  useGamePhysics, 
  GamePhysicsBehavior,
  GamePhysicsObjectConfig,
  GameGravityPreset,
  GamePhysicsEnvironment
} from '../animations/physics/useGamePhysics';
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

// Demo container
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

// Physics scene container
const PhysicsScene = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #f0f5ff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  user-select: none;
`;

// Physics object
const PhysicsObject = styled.div<{ size: number; color: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: ${props => props.color};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.size * 0.4}px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translate(0, 0);
  will-change: transform;
`;

// Rectangle object
const RectangleObject = styled.div<{ width: number; height: number; color: string }>`
  position: absolute;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translate(0, 0);
  will-change: transform;
`;

// Button
const Button = styled.button`
  background: #3a5bd9;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  margin: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(58, 91, 217, 0.2);
  
  &:hover {
    background: #2a4bc8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 91, 217, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 4px rgba(58, 91, 217, 0.2);
  }
  
  &:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
    transform: none;
  }
`;

// Controls bar
const ControlsBar = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

// Control row
const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  align-items: center;
`;

// Info text
const InfoText = styled.div`
  margin: 15px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
`;

// Select
const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d0d8f0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  margin-left: 10px;
`;

// Label
const Label = styled.label`
  font-weight: 600;
  margin-right: 10px;
`;

// Canvas
const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

/**
 * Game physics demo component
 */
export const GamePhysicsDemo: React.FC = () => {
  // Refs for scene element
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // For circles and objects
  const circleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [objectCount, setObjectCount] = useState(0);
  
  // Selected behavior and gravity
  const [selectedBehavior, setSelectedBehavior] = useState<GamePhysicsBehavior>(GamePhysicsBehavior.BOUNCING);
  const [selectedGravity, setSelectedGravity] = useState<GameGravityPreset>(GameGravityPreset.EARTH);
  
  // Reduced motion support
  const { appReducedMotion, setAppReducedMotion } = useReducedMotion();
  
  // Environment settings
  const [environment, setEnvironment] = useState<GamePhysicsEnvironment>({
    gravity: GameGravityPreset.EARTH,
    fluidResistance: 0.01,
    enableSleeping: true,
    boundaries: {
      left: 0,
      right: 1000, // Will update on mount
      top: 0,
      bottom: 500 // Will update on mount
    },
    bounceOffBoundaries: true,
    boundaryRestitution: 0.7,
    category: AnimationCategory.BACKGROUND
  });
  
  // Setup initial objects - use an empty object instead of an array
  const initialObjects: Record<string, GamePhysicsObjectConfig> = {};
  
  // Initialize the game physics hook
  const gamePhysics = useGamePhysics({
    environment,
    objects: initialObjects,
    autoStart: true,
    useRAF: true,
    timestep: 1000 / 60,
    animationMode: appReducedMotion ? undefined : undefined,
    category: AnimationCategory.BACKGROUND,
    onCollision: (objA, objB, contactPoint) => {
      // Optional collision sounds or effects could be added here
    }
  });
  
  // Update scene dimensions and create boundaries
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const sceneRect = sceneRef.current.getBoundingClientRect();
    
    // Update environment boundaries
    const updatedEnvironment = {
      ...environment,
      boundaries: {
        left: 0,
        right: sceneRect.width,
        top: 0,
        bottom: sceneRect.height
      }
    };
    
    setEnvironment(updatedEnvironment);
    gamePhysics.updateEnvironment(updatedEnvironment);
    
    // Setup canvas for drawing
    if (canvasRef.current) {
      canvasRef.current.width = sceneRect.width;
      canvasRef.current.height = sceneRect.height;
    }
    
    // Create floor
    gamePhysics.addObject({
      id: 'floor',
      shape: 'rectangle',
      position: { x: sceneRect.width / 2, y: sceneRect.height - 10 },
      width: sceneRect.width,
      height: 20,
      isStatic: true,
      restitution: 0.5,
      friction: 0.2
    });
    
    // Create side walls
    gamePhysics.addObject({
      id: 'left-wall',
      shape: 'rectangle',
      position: { x: 10, y: sceneRect.height / 2 },
      width: 20,
      height: sceneRect.height,
      isStatic: true,
      restitution: 0.5,
      friction: 0.2
    });
    
    gamePhysics.addObject({
      id: 'right-wall',
      shape: 'rectangle',
      position: { x: sceneRect.width - 10, y: sceneRect.height / 2 },
      width: 20,
      height: sceneRect.height,
      isStatic: true,
      restitution: 0.5,
      friction: 0.2
    });
    
    // Create ceiling
    gamePhysics.addObject({
      id: 'ceiling',
      shape: 'rectangle',
      position: { x: sceneRect.width / 2, y: 10 },
      width: sceneRect.width,
      height: 20,
      isStatic: true,
      restitution: 0.5,
      friction: 0.2
    });
    
    // Add orbital and path objects for demo
    createOrbitalObjects();
    createPathFollowingObjects();
    
    // Setup mouse interaction
    const handleMouseDown = (e: MouseEvent) => {
      const rect = sceneRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Add force field at click position
      applyForceField(x, y);
    };
    
    sceneRef.current.addEventListener('mousedown', handleMouseDown);
    
    // Keyboard controls for controlled object
    const handleKeyDown = (e: KeyboardEvent) => {
      const controlledObj = gamePhysics.getObject('controlled-object');
      if (!controlledObj) return;
      
      const inputVector = { x: 0, y: 0, z: 0 };
      
      switch (e.key) {
        case 'ArrowUp':
          inputVector.y = -1;
          break;
        case 'ArrowDown':
          inputVector.y = 1;
          break;
        case 'ArrowLeft':
          inputVector.x = -1;
          break;
        case 'ArrowRight':
          inputVector.x = 1;
          break;
      }
      
      if (controlledObj.userData) {
        controlledObj.userData.inputVector = inputVector;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const controlledObj = gamePhysics.getObject('controlled-object');
      if (!controlledObj || !controlledObj.userData) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          controlledObj.userData.inputVector.y = 0;
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          controlledObj.userData.inputVector.x = 0;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Create player controlled object
    gamePhysics.addObject({
      id: 'controlled-object',
      shape: 'circle',
      position: { x: sceneRect.width / 2, y: sceneRect.height / 2 },
      radius: 25,
      mass: 1,
      behavior: GamePhysicsBehavior.CONTROLLED,
      restitution: 0.7,
      friction: 0.1,
      userData: {
        inputVector: { x: 0, y: 0, z: 0 },
        controlSpeed: 50
      }
    });
    
    // Create DOM element for controlled object
    createObjectElement(
      'controlled-object', 
      50, 
      '#ff5722', 
      '🎮'
    );
    
    return () => {
      sceneRef.current?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Handle gravity changes
  useEffect(() => {
    const updatedEnvironment = {
      ...environment,
      gravity: selectedGravity
    };
    
    setEnvironment(updatedEnvironment);
    gamePhysics.updateEnvironment(updatedEnvironment);
  }, [selectedGravity]);
  
  /**
   * Create orbital objects demonstration
   */
  const createOrbitalObjects = () => {
    if (!sceneRef.current) return;
    
    const sceneRect = sceneRef.current.getBoundingClientRect();
    const centerX = sceneRect.width * 0.75;
    const centerY = sceneRect.height * 0.25;
    
    // Create center object
    gamePhysics.addObject({
      id: 'orbital-center',
      shape: 'circle',
      position: { x: centerX, y: centerY },
      radius: 20,
      isStatic: true,
      userData: {
        type: 'orbital-center'
      }
    });
    
    // Create DOM element for center
    createObjectElement(
      'orbital-center', 
      40, 
      '#ffc107', 
      '☀️'
    );
    
    // Create orbiting objects
    for (let i = 0; i < 3; i++) {
      const radius = 60 + i * 30;
      const id = `orbital-${i}`;
      const size = 20 - i * 3;
      
      gamePhysics.createOrbital(
        { x: centerX, y: centerY, z: 0 },
        radius,
        1.5 - (i * 0.3),
        {
          id,
          shape: 'circle',
          radius: size / 2,
          mass: 0.5,
          restitution: 0.7
        }
      );
      
      // Create DOM element
      createObjectElement(
        id, 
        size, 
        i === 0 ? '#e91e63' : i === 1 ? '#2196f3' : '#4caf50', 
        i === 0 ? '🪐' : i === 1 ? '🌎' : '☄️'
      );
    }
  };
  
  /**
   * Create path following objects demonstration
   */
  const createPathFollowingObjects = () => {
    if (!sceneRef.current) return;
    
    const sceneRect = sceneRef.current.getBoundingClientRect();
    
    // Create figure-8 path
    const centerX = sceneRect.width * 0.25;
    const centerY = sceneRect.height * 0.25;
    const width = 100;
    const height = 60;
    
    const path: {x: number, y: number, z: number}[] = [];
    
    // Generate figure-8 path points
    for (let i = 0; i < 20; i++) {
      const t = (i / 20) * Math.PI * 2;
      const x = centerX + Math.sin(t) * width;
      const y = centerY + Math.sin(t * 2) * height;
      path.push({ x, y, z: 0 });
    }
    
    // Create path following object
    const id = 'path-follower';
    gamePhysics.createPathFollower(
      path,
      2,
      true,
      {
        id,
        shape: 'circle',
        radius: 15,
        restitution: 0.7
      }
    );
    
    // Create DOM element
    createObjectElement(
      id, 
      30, 
      '#9c27b0', 
      '🔄'
    );
    
    // Draw path
    drawPath(path);
  };
  
  /**
   * Draw a path on the canvas
   */
  const drawPath = (path: {x: number, y: number, z: number}[]) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    
    // Close the path
    ctx.lineTo(path[0].x, path[0].y);
    
    ctx.strokeStyle = 'rgba(156, 39, 176, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  /**
   * Create and add a new physics object
   */
  const addNewObject = () => {
    if (!sceneRef.current) return;
    
    const sceneRect = sceneRef.current.getBoundingClientRect();
    const id = `object-${objectCount}`;
    
    // Random properties
    const size = Math.random() * 30 + 20;
    const x = Math.random() * (sceneRect.width - 100) + 50;
    const y = Math.random() * (sceneRect.height / 2) + 50;
    
    // Create configuration based on selected behavior
    let config: GamePhysicsObjectConfig = {
      id,
      shape: 'circle',
      position: { x, y, z: 0 },
      radius: size / 2,
      mass: size / 20,
      behavior: selectedBehavior,
      restitution: 0.7,
      friction: 0.1
    };
    
    // Add behavior-specific properties
    switch (selectedBehavior) {
      case GamePhysicsBehavior.BOUNCING:
        config = {
          ...config,
          restitution: 0.8,
          velocity: { 
            x: (Math.random() - 0.5) * 200, 
            y: Math.random() * -100 
          }
        };
        break;
        
      case GamePhysicsBehavior.FLOATING:
        config = {
          ...config,
          affectedByGravity: false,
          userData: {
            floatAmplitude: Math.random() * 10 + 5,
            floatFrequency: Math.random() * 2 + 0.5
          }
        };
        break;
        
      case GamePhysicsBehavior.INERTIAL:
        config = {
          ...config,
          velocity: { 
            x: (Math.random() - 0.5) * 200, 
            y: (Math.random() - 0.5) * 200 
          },
          friction: 0.01,
          drag: 0.005
        };
        break;
        
      case GamePhysicsBehavior.PROJECTILE:
        // Position at bottom of screen
        config = {
          ...config,
          position: { 
            x: Math.random() * (sceneRect.width - 100) + 50, 
            y: sceneRect.height - 50 
          },
          velocity: { 
            x: (Math.random() - 0.5) * 100, 
            y: -300 - Math.random() * 200 
          }
        };
        break;
    }
    
    // Add to physics system
    gamePhysics.addObject(config);
    
    // Create DOM element
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const emoji = selectedBehavior === GamePhysicsBehavior.BOUNCING ? '🏀' :
                 selectedBehavior === GamePhysicsBehavior.FLOATING ? '🎈' :
                 selectedBehavior === GamePhysicsBehavior.INERTIAL ? '🏒' :
                 selectedBehavior === GamePhysicsBehavior.PROJECTILE ? '🚀' : '●';
    
    createObjectElement(id, size, randomColor, emoji);
    
    // Increment counter
    setObjectCount(prevCount => prevCount + 1);
  };
  
  /**
   * Create a DOM element for a physics object
   */
  const createObjectElement = (id: string, size: number, color: string, content = '') => {
    if (!sceneRef.current) return;
    
    // Create the element
    const element = document.createElement('div');
    element.id = id;
    element.style.position = 'absolute';
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.backgroundColor = color;
    element.style.borderRadius = '50%';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.color = 'white';
    element.style.fontSize = `${size * 0.5}px`;
    element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    element.style.transform = 'translate(0, 0)';
    element.style.willChange = 'transform';
    element.style.userSelect = 'none';
    element.innerHTML = content;
    
    // Add to scene
    sceneRef.current.appendChild(element);
    
    // Store reference
    circleRefs.current.set(id, element);
  };
  
  /**
   * Remove all dynamic objects
   */
  const removeAllObjects = () => {
    const objects = gamePhysics.getAllObjects();
    
    objects.forEach(obj => {
      // Skip static objects and special objects
      if (obj.isStatic || 
          obj.id === 'controlled-object' || 
          obj.id === 'orbital-center' ||
          obj.id.startsWith('orbital-') ||
          obj.id === 'path-follower') {
        return;
      }
      
      // Remove from physics system
      gamePhysics.removeObject(obj.id);
      
      // Remove DOM element
      const element = circleRefs.current.get(obj.id);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
      
      // Remove from refs
      circleRefs.current.delete(obj.id);
    });
  };
  
  /**
   * Apply a force field (explosion) at a point
   */
  const applyForceField = (x: number, y: number) => {
    const objects = gamePhysics.getAllObjects();
    const strength = 2000;
    const radius = 200;
    
    objects.forEach(obj => {
      // Skip static objects
      if (obj.isStatic) return;
      
      // Calculate force
      const force = gamePhysics.forces.explosion(
        obj.position,
        { x, y, z: 0 },
        strength,
        radius
      );
      
      // Apply force
      gamePhysics.applyForce(obj.id, force);
    });
    
    // Visual effect for explosion
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Clear previous
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw explosion circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
        ctx.fill();
        
        // Fade out
        setTimeout(() => {
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }, 300);
      }
    }
  };
  
  // Update DOM elements on each frame
  useEffect(() => {
    const updateElements = () => {
      const objects = gamePhysics.getAllObjects();
      
      objects.forEach(obj => {
        const element = circleRefs.current.get(obj.id);
        if (!element) return;
        
        // Update position
        element.style.transform = `translate(${obj.position.x - element.offsetWidth / 2}px, ${obj.position.y - element.offsetHeight / 2}px)`;
      });
      
      requestAnimationFrame(updateElements);
    };
    
    const rafId = requestAnimationFrame(updateElements);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return (
    <DemoContainer>
      <h2>Game Physics Demo</h2>
      
      <InfoText>
        This demo showcases the useGamePhysics hook, which provides game-like physics interactions
        for creating engaging and interactive UI elements. The physics system includes support for
        various behaviors like bouncing, floating, projectiles, orbital motion, and path following.
      </InfoText>
      
      <ControlsBar>
        <ControlRow>
          <Label>Object Type:</Label>
          <Select 
            value={selectedBehavior} 
            onChange={(e) => setSelectedBehavior(e.target.value as GamePhysicsBehavior)}
          >
            <option value={GamePhysicsBehavior.BOUNCING}>Bouncing</option>
            <option value={GamePhysicsBehavior.FLOATING}>Floating</option>
            <option value={GamePhysicsBehavior.INERTIAL}>Inertial</option>
            <option value={GamePhysicsBehavior.PROJECTILE}>Projectile</option>
          </Select>
          
          <Label style={{ marginLeft: '20px' }}>Gravity:</Label>
          <Select 
            value={selectedGravity} 
            onChange={(e) => setSelectedGravity(e.target.value as GameGravityPreset)}
          >
            <option value={GameGravityPreset.NONE}>None</option>
            <option value={GameGravityPreset.EARTH}>Earth</option>
            <option value={GameGravityPreset.MOON}>Moon</option>
            <option value={GameGravityPreset.HEAVY}>Heavy</option>
            <option value={GameGravityPreset.MICRO}>Micro</option>
            <option value={GameGravityPreset.SIDEWAYS}>Sideways</option>
          </Select>
          
          <Label style={{ marginLeft: '20px' }}>
            Reduced Motion:
            <input 
              type="checkbox" 
              checked={appReducedMotion}
              onChange={() => setAppReducedMotion(!appReducedMotion)}
              style={{ marginLeft: '5px' }}
            />
          </Label>
        </ControlRow>
        
        <ControlRow>
          <Button onClick={addNewObject}>Add Object</Button>
          <Button onClick={removeAllObjects}>Remove All</Button>
          <Button onClick={() => gamePhysics.pause()}>Pause</Button>
          <Button onClick={() => gamePhysics.resume()}>Resume</Button>
          <Button onClick={() => gamePhysics.reset()}>Reset</Button>
        </ControlRow>
      </ControlsBar>
      
      <PhysicsScene ref={sceneRef}>
        <Canvas ref={canvasRef} />
      </PhysicsScene>
      
      <InfoText>
        <h3>Usage Instructions:</h3>
        <ul>
          <li><strong>Add Objects</strong> - Click the Add Object button to create new physics objects</li>
          <li><strong>Change Types</strong> - Select different behaviors from the dropdown</li>
          <li><strong>Click in Scene</strong> - Click anywhere to create an explosion force</li>
          <li><strong>Control Game Object</strong> - Use arrow keys to control the orange game object (🎮)</li>
          <li><strong>Observe Physics</strong> - Watch how different objects interact with each other</li>
        </ul>
        
        <h3>Features Demonstrated:</h3>
        <ul>
          <li><strong>Multiple Physics Behaviors</strong> - Bouncing, floating, inertial, projectile motion</li>
          <li><strong>Orbital Motion</strong> - Objects orbiting around a center point (☀️ system)</li>
          <li><strong>Path Following</strong> - Objects following predefined paths (purple circle)</li>
          <li><strong>Player Controls</strong> - Keyboard-controlled object with physics response</li>
          <li><strong>Collision Detection</strong> - Realistic bouncing and interaction between objects</li>
          <li><strong>Force Fields</strong> - Click to create explosions that affect nearby objects</li>
          <li><strong>Gravity Presets</strong> - Different gravity environments for varied behaviors</li>
          <li><strong>Accessibility</strong> - Reduced motion preferences integration</li>
        </ul>
      </InfoText>
    </DemoContainer>
  );
};

export default GamePhysicsDemo;