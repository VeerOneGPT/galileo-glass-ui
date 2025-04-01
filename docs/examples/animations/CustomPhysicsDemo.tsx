// NOTE: This example uses internal paths for the documentation.
// In your own code, you should import from the public package like this:
//
// import { Box, useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui';
// import type { 
//   PhysicsBodyState, 
//   PhysicsBodyOptions,
//   Vector2D,
//   GalileoPhysicsEngineAPI 
// } from '@veerone/galileo-glass-ui/physics';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box } from '../../../src/components/Box';
import styled from 'styled-components';
import { 
    useGalileoPhysicsEngine 
} from '../../../src/animations/physics/useGalileoPhysicsEngine';
import { 
    PhysicsBodyState, 
    PhysicsBodyOptions, 
    Vector2D,
    GalileoPhysicsEngineAPI
} from '../../../src/animations/physics/engineTypes';

interface BodyRepresentation {
  id: string;
  state: PhysicsBodyState;
  isStatic: boolean;
  radius?: number;
  width?: number;
  height?: number;
}

const SimulationContainer = styled(Box)`
  position: relative;
  width: 600px;
  height: 400px;
  border: 1px solid #ccc;
  overflow: hidden;
  background-color: #f0f0f0;
`;

const PhysicsBodyElement = styled(Box)<{
  $left: number;
  $top: number;
  $width?: number;
  $height?: number;
  $radius?: number;
  $angle: number;
  $isStatic: boolean;
}>`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  width: ${({ $width, $radius }) => ($width ?? $radius! * 2)}px;
  height: ${({ $height, $radius }) => ($height ?? $radius! * 2)}px;
  background-color: ${({ $isStatic }) => ($isStatic ? '#aaa' : '#3498db')};
  border: 1px solid #555;
  border-radius: ${({ $radius }) => ($radius ? '50%' : '4px')};
  transform-origin: center center;
  transform: translate(-50%, -50%) rotate(${({ $angle }) => $angle}rad);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  overflow: hidden; // Prevent content spillover
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ControlsContainer = styled(Box)`
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
`;

const CustomPhysicsDemo: React.FC = () => {
  // Example custom config (using public API configuration)
  const physicsConfig = {
    gravity: { x: 0, y: 200 }, // Adjusted gravity for demo (removed z component)
    // fixedTimeStep: 1 / 120, // Example: Smoother simulation
  };
  const engine = useGalileoPhysicsEngine(physicsConfig); 
  const [bodies, setBodies] = useState<Map<string, BodyRepresentation>>(new Map());
  const rafRef = useRef<number>(null);
  const latestBodiesRef = useRef(bodies); // Ref to access latest bodies map in callbacks

  // Update ref whenever bodies state changes
  useEffect(() => {
    latestBodiesRef.current = bodies;
  }, [bodies]);

  // Add initial bodies
  useEffect(() => {
    if (!engine) return;

    // Add a static floor
    const floorId = engine.addBody({
      id: 'floor',
      shape: { type: 'rectangle', width: 600, height: 20 },
      position: { x: 300, y: 390 },
      isStatic: true,
      userData: { name: 'Floor', width: 600, height: 20 } // Store shape info for rendering
    });

    // Add a dynamic circle
    const ballId = engine.addBody({
      id: 'ball1',
      shape: { type: 'circle', radius: 20 },
      position: { x: 300, y: 50 },
      restitution: 0.7, // Bouncy
      friction: 0.05,
      userData: { name: 'Bouncing Ball', radius: 20 } // Store shape info
    });

    // Add a dynamic box
    const boxId = engine.addBody({
      id: 'box1',
      shape: { type: 'rectangle', width: 40, height: 40 },
      position: { x: 250, y: 100 },
      mass: 2,
      friction: 0.1,
      userData: { name: 'Falling Box', width: 40, height: 40 } // Store shape info
    });
    
    // Add initial representations for rendering
    const initialBodies = new Map<string, BodyRepresentation>();
    [floorId, ballId, boxId].forEach(id => {
        const state = engine.getBodyState(id);
        if (state) {
            initialBodies.set(id, {
                id: state.id,
                state: state,
                isStatic: state.isStatic,
                radius: state.userData?.radius,
                width: state.userData?.width,
                height: state.userData?.height,
            });
        }
    });
    setBodies(initialBodies);
    
    // --- Example Collision Listener ---
    const unsubscribeCollision = engine.onCollisionStart((event) => {
        console.log('[Demo] Collision Start:',
             `(${event.bodyAUserData?.name ?? event.bodyAId})`, '<=>',
             `(${event.bodyBUserData?.name ?? event.bodyBId})`
         );
        
        // Example: Impulse on collision with floor - Apply carefully
        // const dynamicBodyId = event.bodyAId === floorId ? event.bodyBId : event.bodyBId === floorId ? event.bodyAId : null;
        // if(dynamicBodyId) {
        //     // Apply slight upward impulse only if hitting floor from above
        //     if(event.normal?.y && event.normal.y < -0.8) { // Check normal direction
        //         console.log(`Applying impulse to ${dynamicBodyId}`);
        //         engine.applyImpulse(dynamicBodyId, {x: 0, y: -150}); // Reduced impulse
        //     }
        // }
    });
    
    // Cleanup function: Unsubscribe from events.
    // Body removal is handled implicitly by the hook's own cleanup.
    return () => {
        unsubscribeCollision();
    }

  }, [engine]); // Engine reference is stable

  // Animation loop to synchronize rendering with physics state
  useEffect(() => {
    if (!engine) return;

    const animate = () => {
      const allStates = engine.getAllBodyStates();
      setBodies(prevBodies => {
          const newMap = new Map(prevBodies);
          let changed = false;
          
          // Update existing or add new
          allStates.forEach((state, id) => {
              const existingRep = newMap.get(id);
              // Basic check for significant change to avoid unnecessary updates
              const positionChanged = !existingRep || 
                  Math.hypot(state.position.x - existingRep.state.position.x, state.position.y - existingRep.state.position.y) > 0.5 || // Check distance moved
                  Math.abs(state.angle - existingRep.state.angle) > 0.02; // Check angle change
              
              if (!existingRep || positionChanged) { // Update if new or changed significantly
                  newMap.set(id, {
                      // Reuse existing shape info if available
                      radius: existingRep?.radius ?? state.userData?.radius,
                      width: existingRep?.width ?? state.userData?.width,
                      height: existingRep?.height ?? state.userData?.height,
                      // Update state
                      id: state.id,
                      state: state,
                      isStatic: state.isStatic, 
                  });
                  changed = true;
              }
          });

          // Remove bodies that no longer exist in the engine state
          if (prevBodies.size !== allStates.size) {
              prevBodies.forEach((_, id) => {
                  if (!allStates.has(id)) {
                      newMap.delete(id);
                      changed = true;
                  }
              });
          }

          return changed ? newMap : prevBodies; // Only update state if changes occurred
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [engine]);

  // --- Interaction Callbacks ---
  const handleAddCircle = useCallback(() => {
    const x = 50 + Math.random() * 500;
    const y = 50 + Math.random() * 100;
    const radius = 10 + Math.random() * 15;
    engine.addBody({
      shape: { type: 'circle', radius },
      position: { x, y },
      restitution: 0.6,
      friction: 0.1,
      userData: { name: 'New Circle', radius }
    });
  }, [engine]);

  const handleApplyForceToRandom = useCallback(() => {
    const bodyIds = Array.from(latestBodiesRef.current.keys()).filter(id => id !== 'floor');
    if (bodyIds.length === 0) return;
    
    const randomId = bodyIds[Math.floor(Math.random() * bodyIds.length)];
    const force: Vector2D = {
        x: (Math.random() - 0.5) * 10000, // Apply significant force
        y: (Math.random() - 0.5) * 10000
    };
    console.log(`Applying force to ${randomId}:`, force);
    engine.applyForce(randomId, force);

  }, [engine]); // engine dependency is stable

  return (
    <SimulationContainer>
      {[...bodies.values()].map((body) => (
        <PhysicsBodyElement
          key={body.id}
          $left={body.state.position.x}
          $top={body.state.position.y}
          $width={body.width}
          $height={body.height}
          $radius={body.radius}
          $angle={body.state.angle}
          $isStatic={body.isStatic}
        >
          {body.state.userData?.name ?? body.id.substring(0, 6)} {/* Show name or Short ID */}
        </PhysicsBodyElement>
      ))}
      <ControlsContainer>
        <Button onClick={handleAddCircle}>Add Circle</Button>
        <Button onClick={handleApplyForceToRandom}>Apply Force</Button>
      </ControlsContainer>
    </SimulationContainer>
  );
};

export default CustomPhysicsDemo; 