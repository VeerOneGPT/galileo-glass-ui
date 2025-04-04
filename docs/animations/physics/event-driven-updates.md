# Event-Driven Physics Updates

When working with the Galileo Physics Engine, there are two main approaches to updating your UI based on physics simulation:

1. **Polling-based updates**: Continuously checking body states on each frame
2. **Event-driven updates**: Responding to specific physics events to trigger updates

This guide focuses on the second approach, which is often more efficient and responsive.

## Why Use Event-Driven Updates?

- **Performance**: Only update when necessary, rather than on every frame
- **Responsiveness**: React immediately to physics events when they occur
- **Code Organization**: Separate physics logic from rendering logic

## Common Event Types for Position Updates

The Galileo Physics Engine provides several events you can subscribe to:

### 1. Collision Events

The most common trigger for position updates is collision detection:

```typescript
import { useGalileoPhysicsEngine, getPhysicsBodyState } from '@veerone/galileo-glass-ui';

function PhysicsComponent() {
  const engine = useGalileoPhysicsEngine();
  const uiElementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!engine) return;
    
    // Create a physics body
    const bodyId = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: 100, y: 100 },
      userData: { elementRef: uiElementRef } // Store ref for updates
    });
    
    // Listen for collision events
    const unsubscribeStart = engine.onCollisionStart((event) => {
      // Check if our body is involved in the collision
      if (event.bodyAId === bodyId || event.bodyBId === bodyId) {
        // Get the latest position after collision
        const state = getPhysicsBodyState(engine, bodyId);
        if (state && uiElementRef.current) {
          // Update UI element position
          uiElementRef.current.style.transform = 
            `translate(${state.position.x}px, ${state.position.y}px)`;
          
          // You can also trigger animations, sounds, or other effects
          uiElementRef.current.classList.add('collision-effect');
          setTimeout(() => {
            uiElementRef.current?.classList.remove('collision-effect');
          }, 300);
        }
      }
    });
    
    return () => {
      unsubscribeStart();
      engine.removeBody(bodyId);
    };
  }, [engine]);
  
  return <div ref={uiElementRef} className="physics-element" />;
}
```

### 2. Custom Events with Step Events

You can create your own custom events by checking conditions on each physics step:

```typescript
function CustomEventPhysics() {
  const engine = useGalileoPhysicsEngine();
  const [isInTargetZone, setIsInTargetZone] = useState(false);
  
  useEffect(() => {
    if (!engine) return;
    
    // Create bodies
    const movingBodyId = engine.addBody({
      shape: { type: 'circle', radius: 10 },
      position: { x: 50, y: 50 }
    });
    
    // Define a target zone
    const targetZone = { x: 200, y: 200, radius: 50 };
    
    // Set up a step event to check custom conditions
    let wasInZone = false;
    
    // Create a custom step listener using the physics system's step event
    const checkTargetZone = () => {
      const state = getPhysicsBodyState(engine, movingBodyId);
      if (!state) return;
      
      // Calculate distance to target zone
      const dx = state.position.x - targetZone.x;
      const dy = state.position.y - targetZone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if body entered or exited the zone
      const isInZone = distance < targetZone.radius;
      
      if (isInZone !== wasInZone) {
        // Zone state changed - trigger event
        if (isInZone) {
          console.log('Entered target zone!');
          setIsInTargetZone(true);
          // Trigger enter effects
        } else {
          console.log('Exited target zone!');
          setIsInTargetZone(false);
          // Trigger exit effects
        }
        wasInZone = isInZone;
      }
    };
    
    // Set up interval for checking (could use requestAnimationFrame too)
    const intervalId = setInterval(checkTargetZone, 16);
    
    return () => {
      clearInterval(intervalId);
      engine.removeBody(movingBodyId);
    };
  }, [engine]);
  
  return (
    <div className={`target-zone ${isInTargetZone ? 'active' : ''}`}>
      {isInTargetZone ? 'Object in zone!' : 'Zone empty'}
    </div>
  );
}
```

## 3. Hybrid Approach with Critical Updates

For many applications, a hybrid approach works best - using events for critical updates and a lightweight render loop for visual smoothness:

```typescript
function HybridPhysicsUpdates() {
  const engine = useGalileoPhysicsEngine();
  const objectRefs = useRef(new Map<string, HTMLElement>());
  const frameRef = useRef<number | null>(null);
  
  // Track which objects need immediate updates due to events
  const needsUpdateRef = useRef(new Set<string>());
  
  useEffect(() => {
    if (!engine) return;
    
    // Create several physics bodies
    const bodyIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const id = engine.addBody({
        shape: { type: 'circle', radius: 15 },
        position: { x: 50 + i * 60, y: 50 },
        velocity: { x: 0, y: 0 }
      });
      bodyIds.push(id);
      
      // Create corresponding DOM elements
      const element = document.createElement('div');
      element.className = 'physics-object';
      document.getElementById('physics-container')?.appendChild(element);
      objectRefs.current.set(id, element);
    }
    
    // Handle collisions - high priority updates
    const unsubscribeCollision = engine.onCollisionStart((event) => {
      // Mark the colliding objects for immediate update
      needsUpdateRef.current.add(event.bodyAId);
      needsUpdateRef.current.add(event.bodyBId);
      
      // Apply visual effect for collision
      const elementA = objectRefs.current.get(event.bodyAId);
      const elementB = objectRefs.current.get(event.bodyBId);
      
      if (elementA) elementA.classList.add('colliding');
      if (elementB) elementB.classList.add('colliding');
      
      // Remove effect after animation completes
      setTimeout(() => {
        if (elementA) elementA.classList.remove('colliding');
        if (elementB) elementB.classList.remove('colliding');
      }, 300);
    });
    
    // Less frequent render loop for general visual updates
    const render = () => {
      // Update positions for all tracked objects
      for (const [id, element] of objectRefs.current.entries()) {
        const state = getPhysicsBodyState(engine, id);
        if (state) {
          // Apply position update
          element.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`;
          
          // Apply rotation
          element.style.rotate = `${state.angle}rad`;
          
          // Clear from immediate update set if it was there
          needsUpdateRef.current.delete(id);
        }
      }
      
      // Schedule next frame
      frameRef.current = requestAnimationFrame(render);
    };
    
    // Start render loop
    frameRef.current = requestAnimationFrame(render);
    
    return () => {
      // Clean up
      unsubscribeCollision();
      bodyIds.forEach(id => engine.removeBody(id));
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      
      // Clean up DOM elements
      for (const element of objectRefs.current.values()) {
        element.parentNode?.removeChild(element);
      }
      objectRefs.current.clear();
    };
  }, [engine]);
  
  return <div id="physics-container" className="physics-world" />;
}
```

## Best Practices for Event-Driven Updates

1. **Optimize Event Handlers**: Keep collision handlers lightweight, especially for `onCollisionActive` which fires frequently.

2. **Use Event Throttling**: For high-frequency events, consider throttling updates:

   ```typescript
   // Throttling example for active collision events
   let lastUpdateTime = 0;
   const throttleInterval = 50; // ms
   
   const unsubscribeActive = engine.onCollisionActive((event) => {
     const now = Date.now();
     if (now - lastUpdateTime > throttleInterval) {
       // Update UI only occasionally during continuous collision
       updatePosition(event.bodyAId);
       lastUpdateTime = now;
     }
   });
   ```

3. **Batch Updates**: Group multiple position updates to minimize DOM reflows:

   ```typescript
   // Collect updates and apply in batches
   const pendingUpdates = new Map<string, PhysicsBodyState>();
   
   engine.onCollisionStart((event) => {
     // Queue updates rather than applying immediately
     const stateA = getPhysicsBodyState(engine, event.bodyAId);
     if (stateA) pendingUpdates.set(event.bodyAId, stateA);
     
     const stateB = getPhysicsBodyState(engine, event.bodyBId);
     if (stateB) pendingUpdates.set(event.bodyBId, stateB);
   });
   
   // Apply updates in a batch on next animation frame
   requestAnimationFrame(() => {
     for (const [id, state] of pendingUpdates.entries()) {
       updateElementPosition(id, state.position);
     }
     pendingUpdates.clear();
   });
   ```

4. **Selective Updates**: Only update visual elements that need it:

   ```typescript
   // Track which elements have moved significantly
   const significantChange = (oldPos, newPos, threshold = 1) => {
     const dx = oldPos.x - newPos.x;
     const dy = oldPos.y - newPos.y;
     return (dx * dx + dy * dy) > threshold * threshold;
   };
   
   // Check if update is needed before applying
   const previousPositions = new Map<string, Vector2D>();
   
   function updateIfNeeded(id: string) {
     const state = getPhysicsBodyState(engine, id);
     if (!state) return;
     
     const prevPos = previousPositions.get(id);
     if (!prevPos || significantChange(prevPos, state.position)) {
       // Position changed enough to warrant an update
       updateElementPosition(id, state.position);
       previousPositions.set(id, {...state.position});
     }
   }
   ```

## Example: Physics-Driven UI Component

Here's a complete example of a draggable card component that uses the physics engine with an event-driven approach:

```tsx
import React, { useEffect, useRef } from 'react';
import { 
  useGalileoPhysicsEngine, 
  getPhysicsBodyState 
} from '@veerone/galileo-glass-ui';

const PhysicsCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const engine = useGalileoPhysicsEngine({
    gravity: { x: 0, y: 0 },
    enableSleeping: true
  });
  const bodyIdRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!engine || !cardRef.current) return;
    
    // Create a body for the card
    const bodyId = engine.addBody({
      shape: { type: 'rectangle', width: 200, height: 150 },
      position: { x: 150, y: 150 },
      mass: 1,
      damping: 0.85, // Add some drag for smoother movement
      restitution: 0.3,
      isStatic: false
    });
    
    bodyIdRef.current = bodyId;
    
    // Set up boundaries
    const boundaries = [
      // Top boundary
      engine.addBody({
        shape: { type: 'rectangle', width: 800, height: 10 },
        position: { x: 400, y: -5 },
        isStatic: true
      }),
      // Bottom boundary
      engine.addBody({
        shape: { type: 'rectangle', width: 800, height: 10 },
        position: { x: 400, y: 605 },
        isStatic: true
      }),
      // Left boundary
      engine.addBody({
        shape: { type: 'rectangle', width: 10, height: 600 },
        position: { x: -5, y: 300 },
        isStatic: true
      }),
      // Right boundary
      engine.addBody({
        shape: { type: 'rectangle', width: 10, height: 600 },
        position: { x: 805, y: 300 },
        isStatic: true
      })
    ];
    
    // Listen for collisions with boundaries
    const unsubscribeCollision = engine.onCollisionStart((event) => {
      if (event.bodyAId === bodyId || event.bodyBId === bodyId) {
        // Card collided with something - apply bounce effect
        if (cardRef.current) {
          cardRef.current.classList.add('bouncing');
          setTimeout(() => {
            cardRef.current?.classList.remove('bouncing');
          }, 300);
        }
      }
    });
    
    // Set up initial position
    updateCardPosition();
    
    // Mouse/touch event handlers for dragging
    const handleMouseDown = (e: MouseEvent) => {
      if (bodyIdRef.current) {
        isDraggingRef.current = true;
        lastPositionRef.current = { x: e.clientX, y: e.clientY };
        
        // Reduce damping during drag for more direct control
        engine.updateBodyState(bodyIdRef.current, {
          velocity: { x: 0, y: 0 } // Stop any current motion
        });
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && bodyIdRef.current) {
        const dx = e.clientX - lastPositionRef.current.x;
        const dy = e.clientY - lastPositionRef.current.y;
        
        // Apply impulse based on mouse movement
        engine.applyImpulse(bodyIdRef.current, { 
          x: dx * 0.1, 
          y: dy * 0.1 
        });
        
        lastPositionRef.current = { x: e.clientX, y: e.clientY };
        
        // Update position immediately for responsive feel
        updateCardPosition();
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    // Function to update card position from physics state
    function updateCardPosition() {
      if (!bodyIdRef.current || !cardRef.current) return;
      
      const state = getPhysicsBodyState(engine, bodyIdRef.current);
      if (state) {
        cardRef.current.style.transform = `
          translate(${state.position.x - 100}px, ${state.position.y - 75}px)
          rotate(${state.angle}rad)
        `;
      }
    }
    
    // Set up animation frame for smooth motion
    let animationFrameId: number;
    function animate() {
      updateCardPosition();
      animationFrameId = requestAnimationFrame(animate);
    }
    animationFrameId = requestAnimationFrame(animate);
    
    // Add event listeners
    cardRef.current.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      if (bodyIdRef.current) {
        engine.removeBody(bodyIdRef.current);
      }
      
      boundaries.forEach(id => engine.removeBody(id));
      unsubscribeCollision();
      
      cardRef.current?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);
  
  return (
    <div className="physics-container">
      <div 
        ref={cardRef} 
        className="physics-card"
      >
        <h3>Draggable Physics Card</h3>
        <p>Drag me around!</p>
      </div>
    </div>
  );
};

export default PhysicsCard;
```

## Conclusion

Event-driven position updates offer significant advantages for physics-based UIs:

1. **Responsiveness**: Elements react instantly to relevant physics events
2. **Efficiency**: Processing happens only when needed, saving resources
3. **Flexibility**: Easily combine with other event systems in your application

By using the collision event system along with custom event detection, you can create interfaces that feel natural and responsive while maintaining good performance. 