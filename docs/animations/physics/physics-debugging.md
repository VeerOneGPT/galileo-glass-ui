# Physics Engine Debugging Guide

This guide provides recommended tools and approaches for debugging issues with the Galileo Physics Engine.

## Visualization Tools

Visualizing what's happening in the physics simulation is often the most effective way to debug issues.

### 1. Debug Renderer Component

This reusable component renders a visual overlay of all physics bodies in your scene:

```tsx
import React, { useEffect, useRef } from 'react';
import { getPhysicsBodyState } from '@veerone/galileo-glass-ui';

interface PhysicsDebugRendererProps {
  engine: any; // GalileoPhysicsEngineAPI
  showVelocity?: boolean;
  showLabels?: boolean;
  showBounds?: boolean;
  opacity?: number;
  colors?: {
    static: string;
    dynamic: string;
    sleeping: string;
    selected: string;
    velocity: string;
    boundary: string;
  };
}

export const PhysicsDebugRenderer: React.FC<PhysicsDebugRendererProps> = ({
  engine,
  showVelocity = true,
  showLabels = true,
  showBounds = true,
  opacity = 0.5,
  colors = {
    static: 'rgba(255, 0, 0, 0.7)',
    dynamic: 'rgba(0, 255, 0, 0.7)',
    sleeping: 'rgba(128, 128, 128, 0.7)',
    selected: 'rgba(255, 255, 0, 0.7)',
    velocity: 'rgba(0, 0, 255, 0.7)',
    boundary: 'rgba(255, 165, 0, 0.7)',
  },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!engine || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas fills its container
    const resizeObserver = new ResizeObserver(() => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    
    // Draw function
    const renderDebug = () => {
      // Clear canvas with adjustable opacity
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get all body states
      const allStates = engine.getAllBodyStates();
      
      // Draw each body
      allStates.forEach((state, id) => {
        if (!state) return;
        
        // Choose color based on body properties
        let fillColor = colors.dynamic;
        if (state.isStatic) {
          fillColor = colors.static;
        } else if ((state as any).isSleeping) {
          fillColor = colors.sleeping;
        }
        
        // Draw shape based on body type
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = 2;
        
        if (state.shape?.type === 'circle') {
          const radius = state.shape.radius || 10;
          ctx.beginPath();
          ctx.arc(state.position.x, state.position.y, radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw rotation indicator
          if (!state.isStatic) {
            ctx.beginPath();
            ctx.moveTo(state.position.x, state.position.y);
            ctx.lineTo(
              state.position.x + Math.cos(state.angle) * radius,
              state.position.y + Math.sin(state.angle) * radius
            );
            ctx.stroke();
          }
        } else if (state.shape?.type === 'rectangle') {
          const width = state.shape.width || 20;
          const height = state.shape.height || 20;
          
          // Draw rotated rectangle
          ctx.save();
          ctx.translate(state.position.x, state.position.y);
          ctx.rotate(state.angle);
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.restore();
        }
        
        // Draw velocity vector
        if (showVelocity && !state.isStatic) {
          const vel = state.velocity;
          const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
          
          if (speed > 0.1) {
            const lineLength = Math.min(speed * 2, 50);
            const normalizedVelX = vel.x / speed;
            const normalizedVelY = vel.y / speed;
            
            ctx.beginPath();
            ctx.moveTo(state.position.x, state.position.y);
            ctx.lineTo(
              state.position.x + normalizedVelX * lineLength,
              state.position.y + normalizedVelY * lineLength
            );
            ctx.strokeStyle = colors.velocity;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
        
        // Draw label
        if (showLabels) {
          ctx.fillStyle = '#000';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(
            id.substring(0, 8),
            state.position.x,
            state.position.y - (state.shape?.type === 'circle' ? state.shape.radius + 5 : 15)
          );
        }
      });
      
      // Continue animation
      frameRef.current = requestAnimationFrame(renderDebug);
    };
    
    // Start rendering
    frameRef.current = requestAnimationFrame(renderDebug);
    
    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (canvas.parentElement) {
        resizeObserver.unobserve(canvas.parentElement);
      }
    };
  }, [engine, showVelocity, showLabels, colors]);
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', 
      zIndex: 1000
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: opacity,
        }} 
      />
    </div>
  );
};
```

### Usage Example

```tsx
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui';
import { PhysicsDebugRenderer } from './PhysicsDebugRenderer';

function PhysicsDemo() {
  const engine = useGalileoPhysicsEngine();
  const [showDebug, setShowDebug] = useState(false);
  
  // ... your regular physics setup code ...
  
  return (
    <div className="physics-container" style={{ position: 'relative' }}>
      {/* Your physics UI components */}
      <div className="physics-ui">
        <button onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>
      
      {/* Debug renderer overlay */}
      {showDebug && <PhysicsDebugRenderer engine={engine} />}
    </div>
  );
}
```

### 2. Console-Based Debugging Tools

For non-visual debugging, these utility functions can help log useful information to the console:

```typescript
// Log all physics bodies and their states
function debugLogAllBodies(engine) {
  const allStates = engine.getAllBodyStates();
  console.group('Physics Engine Bodies');
  console.log(`Total bodies: ${allStates.size}`);
  
  const dynamicBodies = Array.from(allStates.values())
    .filter(state => !state.isStatic);
  const staticBodies = Array.from(allStates.values())
    .filter(state => state.isStatic);
  
  console.log(`Dynamic bodies: ${dynamicBodies.length}`);
  console.log(`Static bodies: ${staticBodies.length}`);
  
  allStates.forEach((state, id) => {
    console.group(`Body ${id}`);
    console.log('Position:', state.position);
    console.log('Velocity:', state.velocity);
    console.log('Angle:', state.angle);
    console.log('Static:', state.isStatic);
    console.log('UserData:', state.userData);
    console.groupEnd();
  });
  
  console.groupEnd();
}

// Track body movement over time
function trackBodyMovement(engine, bodyId, duration = 3000, interval = 100) {
  const positions = [];
  const velocities = [];
  const startTime = Date.now();
  let timerId;
  
  console.log(`Tracking body ${bodyId} for ${duration}ms...`);
  
  function recordState() {
    const state = getPhysicsBodyState(engine, bodyId);
    if (state) {
      const elapsed = Date.now() - startTime;
      positions.push({
        time: elapsed,
        x: state.position.x,
        y: state.position.y
      });
      velocities.push({
        time: elapsed,
        x: state.velocity.x,
        y: state.velocity.y
      });
    }
    
    if (Date.now() - startTime < duration) {
      timerId = setTimeout(recordState, interval);
    } else {
      // Tracking complete, output results
      console.group(`Movement data for body ${bodyId}`);
      console.log('Position samples:', positions);
      console.log('Velocity samples:', velocities);
      
      // Calculate movement metrics
      const totalDistance = positions.reduce((total, pos, i) => {
        if (i === 0) return 0;
        const prev = positions[i - 1];
        const dx = pos.x - prev.x;
        const dy = pos.y - prev.y;
        return total + Math.sqrt(dx * dx + dy * dy);
      }, 0);
      
      console.log('Total distance traveled:', totalDistance);
      console.log('Average speed:', totalDistance / (duration / 1000));
      console.groupEnd();
    }
  }
  
  // Start recording
  recordState();
  
  // Return cancel function
  return () => {
    if (timerId) clearTimeout(timerId);
    console.log('Body tracking cancelled');
  };
}
```

### 3. In-browser Physics Visualization

For more advanced debugging, you can create a standalone visualization component that lets you inspect and modify physics properties in real-time:

```tsx
import React, { useState, useEffect } from 'react';
import { useGalileoPhysicsEngine, getPhysicsBodyState } from '@veerone/galileo-glass-ui';

export const PhysicsInspector: React.FC = () => {
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [bodyList, setBodyList] = useState<string[]>([]);
  const [bodyState, setBodyState] = useState<any>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Get engine reference from a context or prop
  const engine = useGalileoPhysicsEngine();
  
  useEffect(() => {
    if (!engine) return;
    
    // Update body list every second
    const intervalId = setInterval(() => {
      const allStates = engine.getAllBodyStates();
      setBodyList(Array.from(allStates.keys()));
    }, 1000);
    
    // Update selected body state at 60fps
    let frameId: number;
    const updateSelectedBody = () => {
      if (selectedBodyId) {
        const state = getPhysicsBodyState(engine, selectedBodyId);
        if (state) {
          setBodyState(state);
          setPosition(state.position);
          setVelocity(state.velocity);
        }
      }
      frameId = requestAnimationFrame(updateSelectedBody);
    };
    frameId = requestAnimationFrame(updateSelectedBody);
    
    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(frameId);
    };
  }, [engine, selectedBodyId]);
  
  // Apply changes to the selected body
  const applyChanges = () => {
    if (!selectedBodyId || !engine) return;
    
    engine.updateBodyState(selectedBodyId, {
      position,
      velocity
    });
  };
  
  // Apply an impulse to the selected body
  const applyImpulse = (x: number, y: number) => {
    if (!selectedBodyId || !engine) return;
    
    engine.applyImpulse(selectedBodyId, { x, y });
  };
  
  return (
    <div className="physics-inspector" style={{ 
      position: 'fixed', 
      right: 10, 
      top: 10, 
      width: 300, 
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #ccc',
      borderRadius: 4,
      padding: 10,
      zIndex: 1000
    }}>
      <h3>Physics Inspector</h3>
      
      <div>
        <label>Select Body:</label>
        <select 
          value={selectedBodyId || ''} 
          onChange={(e) => setSelectedBodyId(e.target.value || null)}
        >
          <option value="">Select a body</option>
          {bodyList.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>
      
      {bodyState && (
        <div style={{ marginTop: 10 }}>
          <h4>Body Properties</h4>
          
          <div>
            <label>Position X:</label>
            <input 
              type="number" 
              value={position.x}
              onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })}
            />
          </div>
          
          <div>
            <label>Position Y:</label>
            <input 
              type="number" 
              value={position.y}
              onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })}
            />
          </div>
          
          <div>
            <label>Velocity X:</label>
            <input 
              type="number" 
              value={velocity.x}
              onChange={(e) => setVelocity({ ...velocity, x: parseFloat(e.target.value) })}
            />
          </div>
          
          <div>
            <label>Velocity Y:</label>
            <input 
              type="number" 
              value={velocity.y}
              onChange={(e) => setVelocity({ ...velocity, y: parseFloat(e.target.value) })}
            />
          </div>
          
          <div>
            <button onClick={applyChanges}>Apply Changes</button>
          </div>
          
          <h4>Quick Actions</h4>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => applyImpulse(0, -10)}>Up</button>
            <button onClick={() => applyImpulse(-10, 0)}>Left</button>
            <button onClick={() => applyImpulse(10, 0)}>Right</button>
            <button onClick={() => applyImpulse(0, 10)}>Down</button>
          </div>
          
          <h4>Body Info</h4>
          <div style={{ fontSize: 12, overflowY: 'auto', maxHeight: 200 }}>
            <pre>{JSON.stringify(bodyState, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Next Steps

This initial section focuses on visualization tools. In future updates, we'll add:

1. **Profiling and Performance Troubleshooting**
2. **Working with the Collision System**
3. **Advanced Console Debugging Techniques**

## Performance Profiling

Understanding and optimizing the performance of your physics-based animations is crucial for maintaining smooth user experiences.

### 1. Physics Performance Monitor

This component can be added to your application to track and display real-time physics performance metrics:

```tsx
import React, { useEffect, useState, useRef } from 'react';
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui';

interface PerformanceStats {
  bodyCount: number;
  fps: number;
  updateTime: number;
  collisionChecks: number;
  activeCollisions: number;
  sleepingBodies: number;
}

export const PhysicsPerformanceMonitor: React.FC<{
  refreshRate?: number;
  showGraph?: boolean;
}> = ({ 
  refreshRate = 500, 
  showGraph = true 
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    bodyCount: 0,
    fps: 60,
    updateTime: 0,
    collisionChecks: 0,
    activeCollisions: 0,
    sleepingBodies: 0
  });
  
  const [history, setHistory] = useState<PerformanceStats[]>([]);
  const historyLimit = 60; // Store one minute of data at 1s intervals
  
  const engine = useGalileoPhysicsEngine();
  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(0);
  const activeCollisionsRef = useRef<number>(0);
  
  // Calculate FPS and update times
  useEffect(() => {
    if (!engine) return;
    
    // Track frame times for FPS calculation
    const trackFrame = () => {
      const now = performance.now();
      
      if (lastFrameTime.current > 0) {
        const delta = now - lastFrameTime.current;
        frameTimeRef.current.push(delta);
        
        // Keep only last 60 frames for averaging
        if (frameTimeRef.current.length > 60) {
          frameTimeRef.current.shift();
        }
      }
      
      lastFrameTime.current = now;
      requestAnimationFrame(trackFrame);
    };
    
    // Start tracking frames
    requestAnimationFrame(trackFrame);
    
    // Track collision events to gauge collision load
    const onCollisionStart = () => {
      activeCollisionsRef.current++;
    };
    
    const onCollisionEnd = () => {
      activeCollisionsRef.current = Math.max(0, activeCollisionsRef.current - 1);
    };
    
    const startUnsubscribe = engine.onCollisionStart(onCollisionStart);
    const endUnsubscribe = engine.onCollisionEnd(onCollisionEnd);
    
    // Periodically update stats
    const updateStats = () => {
      // Calculate average frame time and FPS
      const avgFrameTime = frameTimeRef.current.length > 0 
        ? frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length 
        : 16.67;
      
      const fps = Math.round(1000 / avgFrameTime);
      
      // Get body counts
      const allStates = engine.getAllBodyStates();
      const bodyCount = allStates.size;
      
      // Estimate sleeping bodies (might need engine internals for exact count)
      let sleepingBodies = 0;
      allStates.forEach(state => {
        const vel = state.velocity;
        const isMoving = Math.abs(vel.x) > 0.01 || Math.abs(vel.y) > 0.01;
        if (!isMoving) sleepingBodies++;
      });
      
      // Create stats object
      const newStats: PerformanceStats = {
        bodyCount,
        fps,
        updateTime: avgFrameTime,
        collisionChecks: bodyCount * (bodyCount - 1) / 2, // Upper bound O(n²), actual may be lower
        activeCollisions: activeCollisionsRef.current,
        sleepingBodies
      };
      
      // Update stats
      setStats(newStats);
      
      // Update history
      setHistory(prev => {
        const updated = [...prev, newStats];
        if (updated.length > historyLimit) {
          return updated.slice(updated.length - historyLimit);
        }
        return updated;
      });
    };
    
    const intervalId = setInterval(updateStats, refreshRate);
    
    return () => {
      clearInterval(intervalId);
      startUnsubscribe();
      endUnsubscribe();
    };
  }, [engine, refreshRate]);
  
  // Render mini performance graph
  const renderGraph = () => {
    if (!showGraph || history.length < 2) return null;
    
    const width = 280;
    const height = 60;
    const points = history.map((stat, i) => {
      const x = (i / (historyLimit - 1)) * width;
      const y = height - (stat.fps / 120) * height; // Assume 120 FPS max
      return `${x},${y}`;
    });
    
    return (
      <div style={{ marginTop: 10 }}>
        <svg width={width} height={height} style={{ border: '1px solid #ddd' }}>
          {/* FPS graph */}
          <polyline
            points={points.join(' ')}
            stroke="#4CAF50"
            strokeWidth="2"
            fill="none"
          />
          
          {/* 60 FPS threshold line */}
          <line
            x1="0"
            y1={height - (60 / 120) * height}
            x2={width}
            y2={height - (60 / 120) * height}
            stroke="#FF9800"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          {/* Label */}
          <text x="5" y="15" fill="#333" fontSize="10">
            FPS over time
          </text>
        </svg>
      </div>
    );
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      left: 10,
      background: 'rgba(255, 255, 255, 0.9)',
      padding: 10,
      borderRadius: 4,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      fontFamily: 'monospace',
      fontSize: 12,
      zIndex: 9999,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 5 }}>Physics Performance</div>
      <div>Bodies: {stats.bodyCount} (Sleeping: {stats.sleepingBodies})</div>
      <div>FPS: {stats.fps} (Update: {stats.updateTime.toFixed(2)}ms)</div>
      <div>Active Collisions: {stats.activeCollisions}</div>
      <div>Est. Collision Checks: {stats.collisionChecks}</div>
      
      {renderGraph()}
    </div>
  );
};
```

### 2. Browser Performance Tools

The browser's built-in performance tools can be invaluable for debugging physics performance issues:

#### Chrome DevTools Performance Panel

1. Open Chrome DevTools (F12 or Right-click > Inspect)
2. Go to the "Performance" tab
3. Click the record button (●) and interact with your physics-based UI
4. Stop recording and analyze the results

Look for:
- Long frames (red bars in the frame chart)
- JavaScript execution time in physics-related functions
- Excessive garbage collection (gray bar)

#### Identifying Bottlenecks

When examining a performance recording, search for:

1. **Long-running Physics Functions**: Look for functions like `updatePhysics`, `detectCollisions`, or `applyConstraints`.

2. **Excessive Body Creation/Removal**: Creating and destroying physics bodies frequently can impact performance.

3. **DOM Updates**: Check if physics state updates are causing too many DOM manipulations.

```typescript
// Example optimization: Use batched updates for DOM elements
// Instead of updating DOM position on every physics step:
function inefficientUpdate() {
  engine.getAllBodyStates().forEach((state, id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`;
    }
  });
}

// Batch updates with requestAnimationFrame:
let pendingUpdates = new Map();

engine.onCollisionActive((event) => {
  // Queue state for update
  const state = engine.getBodyState(event.bodyAId);
  if (state) pendingUpdates.set(event.bodyAId, state);
});

// Apply updates once per frame
function efficientUpdate() {
  if (pendingUpdates.size > 0) {
    requestAnimationFrame(() => {
      pendingUpdates.forEach((state, id) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`;
        }
      });
      pendingUpdates.clear();
    });
  }
}
```

### 3. Optimization Strategies

Here are key strategies to improve physics performance:

#### Body Management

1. **Limit Active Bodies**: Keep the number of dynamic bodies below 50 for optimal performance.

2. **Enable Sleeping**: Use the engine's sleeping optimization:
   ```typescript
   const engine = useGalileoPhysicsEngine({
     enableSleeping: true,         // Default is true
     velocitySleepThreshold: 0.05, // Bodies below this velocity may sleep
     sleepTimeThreshold: 1000      // Time below threshold before sleeping (ms)
   });
   ```

3. **Simplify Collision Shapes**: Use circles instead of complex polygons where possible.

#### Collision Optimization

1. **Use Collision Filtering**: Set appropriate groups and masks:
   ```typescript
   // Only collide with specific groups
   const bodyA = engine.addBody({
     // ...
     collisionFilter: { 
       group: 1,
       mask: 0x0002 // Only collide with group 2
     }
   });
   ```

2. **Implement Broadphase Boundaries**: For large scenes, create a spatial grid:
   ```typescript
   const engine = useGalileoPhysicsEngine({
     boundsCheckEnabled: true,
     bounds: {
       min: { x: -1000, y: -1000 },
       max: { x: 1000, y: 1000 }
     }
   });
   ```

3. **Dynamic Collision Activation**: Only enable collision handling for objects in view.

#### Rendering Optimization

1. **Use Opacity or Visibility**: Hide off-screen elements instead of removing them from the physics system.

2. **CSS Transform Instead of Position**: Always use `transform` for position updates:
   ```javascript
   // Good - uses hardware acceleration
   element.style.transform = `translate(${x}px, ${y}px)`;
   
   // Bad - causes layout reflows
   element.style.left = `${x}px`;
   element.style.top = `${y}px`;
   ```

3. **Throttle Visual Updates**: For fast-moving objects, consider updating at 30fps instead of 60fps:
   ```typescript
   let lastUpdateTime = 0;
   const updateInterval = 1000 / 30; // 30fps
   
   function update() {
     const now = performance.now();
     if (now - lastUpdateTime > updateInterval) {
       updateVisuals();
       lastUpdateTime = now;
     }
     requestAnimationFrame(update);
   }
   ```

## Working with the Collision System

The collision system is a crucial part of the physics engine. Understanding how it works can help you diagnose and fix issues with interactions between physics bodies.

### 1. Collision Visualization Component

This component helps visualize collision points and normals:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui';

interface CollisionPoint {
  pointA: { x: number, y: number };
  pointB: { x: number, y: number };
  normal: { x: number, y: number };
  depth: number;
  timestamp: number;
  bodyIds: [string, string];
}

export const CollisionVisualizer: React.FC<{
  maxPoints?: number;
  pointDuration?: number;
  showNormals?: boolean;
}> = ({
  maxPoints = 50,
  pointDuration = 2000, // ms
  showNormals = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collisionPoints, setCollisionPoints] = useState<CollisionPoint[]>([]);
  const engine = useGalileoPhysicsEngine();
  
  useEffect(() => {
    if (!engine || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize observer to ensure canvas fills container
    const resizeObserver = new ResizeObserver(() => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    
    // Subscribe to collision events
    const onCollisionStart = (event) => {
      if (!event.contactPoint) return;
      
      const now = Date.now();
      
      // Add new collision point
      const newPoint: CollisionPoint = {
        pointA: event.contactPoint,
        pointB: {
          x: event.contactPoint.x + (event.normal?.x || 0) * (event.penetration || 5),
          y: event.contactPoint.y + (event.normal?.y || 0) * (event.penetration || 5)
        },
        normal: event.normal || { x: 0, y: 1 },
        depth: event.penetration || 0,
        timestamp: now,
        bodyIds: [event.bodyAId, event.bodyBId]
      };
      
      setCollisionPoints(prev => {
        const updated = [...prev, newPoint];
        // Limit the number of points
        if (updated.length > maxPoints) {
          return updated.slice(updated.length - maxPoints);
        }
        return updated;
      });
    };
    
    const unsubscribe = engine.onCollisionStart(onCollisionStart);
    
    // Render function
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const now = Date.now();
      
      // Draw each collision point
      collisionPoints.forEach(point => {
        const age = now - point.timestamp;
        if (age > pointDuration) return;
        
        // Fade out based on age
        const opacity = 1 - (age / pointDuration);
        
        // Draw contact point
        ctx.beginPath();
        ctx.arc(point.pointA.x, point.pointA.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        ctx.fill();
        
        // Draw normal vector
        if (showNormals) {
          const normalLength = 15; // Fixed length for visibility
          const endX = point.pointA.x + point.normal.x * normalLength;
          const endY = point.pointA.y + point.normal.y * normalLength;
          
          ctx.beginPath();
          ctx.moveTo(point.pointA.x, point.pointA.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(0, 0, 255, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw arrow head
          const arrowSize = 5;
          const angle = Math.atan2(point.normal.y, point.normal.x);
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = `rgba(0, 0, 255, ${opacity})`;
          ctx.fill();
        }
      });
      
      // Clean up old points
      if (collisionPoints.length > 0) {
        setCollisionPoints(prev => 
          prev.filter(point => (now - point.timestamp) <= pointDuration)
        );
      }
      
      requestAnimationFrame(render);
    };
    
    const animationId = requestAnimationFrame(render);
    
    return () => {
      unsubscribe();
      cancelAnimationFrame(animationId);
      if (canvas.parentElement) {
        resizeObserver.unobserve(canvas.parentElement);
      }
    };
  }, [engine, maxPoints, pointDuration, showNormals]);
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', 
      zIndex: 1000
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%'
        }} 
      />
    </div>
  );
};
```

### 2. Collision Debug Logging

Add enhanced logging to debug collision issues:

```typescript
// Enhanced collision logging system
function setupCollisionDebugging(engine) {
  // Keep track of bodies for logging
  const bodyInfo = new Map();
  
  // Track when bodies are added
  const storeBodyInfo = (bodyId, options) => {
    bodyInfo.set(bodyId, {
      options,
      collisions: 0,
      lastCollision: null
    });
  };
  
  // Enhanced addBody with logging
  const originalAddBody = engine.addBody;
  engine.addBody = (options) => {
    const id = originalAddBody(options);
    storeBodyInfo(id, options);
    return id;
  };
  
  // Set up enhanced collision event logging
  const onCollisionStart = (event) => {
    console.group(`Collision Start: ${event.bodyAId} ↔ ${event.bodyBId}`);
    
    // Log body A info
    if (bodyInfo.has(event.bodyAId)) {
      const info = bodyInfo.get(event.bodyAId);
      info.collisions++;
      info.lastCollision = Date.now();
      
      console.log(`Body A (${event.bodyAId}):`);
      console.log('  Options:', info.options);
      console.log('  State:', engine.getBodyState(event.bodyAId));
      console.log('  Collision count:', info.collisions);
    }
    
    // Log body B info
    if (bodyInfo.has(event.bodyBId)) {
      const info = bodyInfo.get(event.bodyBId);
      info.collisions++;
      info.lastCollision = Date.now();
      
      console.log(`Body B (${event.bodyBId}):`);
      console.log('  Options:', info.options);
      console.log('  State:', engine.getBodyState(event.bodyBId));
      console.log('  Collision count:', info.collisions);
    }
    
    // Log collision details
    console.log('Collision details:');
    console.log('  Contact point:', event.contactPoint);
    console.log('  Normal:', event.normal);
    console.log('  Penetration:', event.penetration);
    console.log('  Relative velocity:', event.relativeVelocity);
    console.log('  Impact force:', event.impactForce);
    
    console.groupEnd();
  };
  
  // Subscribe to collision events
  const unsubscribeStart = engine.onCollisionStart(onCollisionStart);
  
  // Utility to print collision statistics
  const printCollisionStats = () => {
    console.group('Collision Statistics');
    
    let totalCollisions = 0;
    const collisionsByBody = Array.from(bodyInfo.entries())
      .map(([id, info]) => ({
        id,
        collisions: info.collisions,
        lastCollision: info.lastCollision ? new Date(info.lastCollision).toISOString() : 'never',
        options: info.options
      }))
      .sort((a, b) => b.collisions - a.collisions);
    
    collisionsByBody.forEach(body => {
      totalCollisions += body.collisions;
    });
    
    console.log(`Total bodies: ${bodyInfo.size}`);
    console.log(`Total collisions: ${totalCollisions}`);
    console.table(collisionsByBody);
    
    console.groupEnd();
  };
  
  // Return cleanup and utility functions
  return {
    cleanup: () => {
      unsubscribeStart();
      // Restore original addBody
      engine.addBody = originalAddBody;
    },
    printStats: printCollisionStats
  };
}

// Usage:
const engine = useGalileoPhysicsEngine();
const collisionDebug = setupCollisionDebugging(engine);

// Later, print statistics:
collisionDebug.printStats();

// Clean up when done:
collisionDebug.cleanup();
```

### 3. Common Collision Problems and Solutions

#### Problem: Bodies pass through each other

**Causes:**
1. Collision filters preventing interaction
2. Bodies moving too fast (tunneling)
3. Incorrect collision shapes

**Solutions:**
1. **Verify collision masks**:
   ```typescript
   // Ensure both bodies have compatible collision filters
   const bodyA = engine.addBody({
     // ...
     collisionFilter: { group: 1, mask: 0xFFFFFFFF }
   });
   const bodyB = engine.addBody({
     // ...
     collisionFilter: { group: 2, mask: 0xFFFFFFFF }
   });
   ```

2. **Adjust time step or limit velocity**:
   ```typescript
   // Smaller time step for better accuracy
   const engine = useGalileoPhysicsEngine({
     fixedTimeStep: 1/120 // Default is 1/60
   });
   
   // Or limit velocity manually
   useEffect(() => {
     const limitVelocity = () => {
       const state = engine.getBodyState(bodyId);
       if (state) {
         const maxSpeed = 10;
         const speed = Math.sqrt(
           state.velocity.x * state.velocity.x + 
           state.velocity.y * state.velocity.y
         );
         
         if (speed > maxSpeed) {
           const scale = maxSpeed / speed;
           engine.updateBodyState(bodyId, {
             velocity: {
               x: state.velocity.x * scale,
               y: state.velocity.y * scale
             }
           });
         }
       }
       requestAnimationFrame(limitVelocity);
     };
     
     const animationId = requestAnimationFrame(limitVelocity);
     return () => cancelAnimationFrame(animationId);
   }, [engine, bodyId]);
   ```

3. **Use appropriate collision shapes**:
   ```typescript
   // Use larger shapes or add buffer radius
   const bodyId = engine.addBody({
     shape: { 
       type: 'circle', 
       radius: actualRadius * 1.1 // Add 10% buffer
     },
     // ...
   });
   ```

#### Problem: Unstable collisions or jittering

**Causes:**
1. Restitution (bounciness) too high
2. Bodies stacking or in complex arrangements
3. Penetration resolution issues

**Solutions:**
1. **Reduce restitution**:
   ```typescript
   const bodyId = engine.addBody({
     // ...
     restitution: 0.2 // Lower value (0-1)
   });
   ```

2. **Increase damping**:
   ```typescript
   const bodyId = engine.addBody({
     // ...
     damping: 0.2 // Higher value for more stability
   });
   ```

3. **Use constraints for complex arrangements**:
   ```typescript
   // Use distance constraints instead of relying on collisions
   engine.addConstraint({
     type: 'distance',
     bodyAId: bodyA,
     bodyBId: bodyB,
     distance: desiredDistance,
     stiffness: 0.5 // More forgiving
   });
   ```

#### Problem: Collision callbacks not firing

**Causes:**
1. Bodies not actually colliding
2. Subscription issues
3. Event propagation problems

**Solutions:**
1. **Verify collision timing**:
   ```typescript
   // Make sure to subscribe after bodies are created
   const bodyA = engine.addBody({ /* ... */ });
   const bodyB = engine.addBody({ /* ... */ });
   
   // Now subscribe to events
   const unsubscribe = engine.onCollisionStart((event) => {
     console.log("Collision between:", event.bodyAId, event.bodyBId);
   });
   ```

2. **Debug with collision visualization**:
   ```typescript
   // Use the CollisionVisualizer component to see if collisions
   // are actually occurring
   <CollisionVisualizer engine={engine} />
   ```

3. **Check for multiple subscriptions**:
   ```typescript
   // Store unsubscribe functions
   const unsubscribeFunctions = [];
   
   // Add subscription with tracking
   const subscribe = (callback) => {
     const unsubscribe = engine.onCollisionStart(callback);
     unsubscribeFunctions.push(unsubscribe);
     return unsubscribe;
   };
   
   // Clean up all subscriptions
   const cleanup = () => {
     unsubscribeFunctions.forEach(fn => fn());
     unsubscribeFunctions.length = 0;
   };
   