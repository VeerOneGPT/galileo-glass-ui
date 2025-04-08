import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

// Import types from their correct location
import {
    GalileoPhysicsEngineAPI,
    Vector2D,
    PhysicsBodyOptions,
    PhysicsBodyState
} from '../../src/animations/physics/engineTypes';

// Import hook from the hooks directory - imported as an alias
import { usePhysicsEngine } from '../../src/hooks';

// Import components from source
import {
    GlassBox,
    GlassButton
} from '../../src/components';

interface BodyRepresentation {
  id: string;
  state: PhysicsBodyState;
  isStatic: boolean;
  radius?: number;
  width?: number;
  height?: number;
}

// Use GlassBox with styled()
const SimulationContainer = styled(GlassBox)`
  position: relative;
  width: 100%; // Make responsive
  max-width: 600px;
  height: 400px;
  border: 1px solid #ccc;
  overflow: hidden;
  background-color: #f0f0f0;
  margin: auto; // Center if needed
`;

// Use GlassBox with styled()
const PhysicsBodyElement = styled(GlassBox)<{
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
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

// Use GlassBox with styled()
const ControlsContainer = styled(GlassBox)`
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 4px;
  z-index: 10;
`;

// Story Component Wrapper
const CustomPhysicsEngineDemo: React.FC = () => {
  const physicsConfig = {
    gravity: { x: 0, y: 200 },
  };
  const engine = usePhysicsEngine(physicsConfig);
  const [bodies, setBodies] = useState<Map<string, BodyRepresentation>>(new Map());
  const rafRef = useRef<number | null>(null);
  const latestBodiesRef = useRef(bodies);

  useEffect(() => {
    latestBodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    if (!engine) return;

    // Add initial bodies
    const floorId = engine.addBody({
      id: 'floor',
      shape: { type: 'rectangle', width: 600, height: 20 },
      position: { x: 300, y: 390 },
      isStatic: true,
      userData: { name: 'Floor', width: 600, height: 20 }
    });
    const ballId = engine.addBody({
      id: 'ball1',
      shape: { type: 'circle', radius: 20 },
      position: { x: 300, y: 50 },
      restitution: 0.7,
      friction: 0.05,
      userData: { name: 'Bouncing Ball', radius: 20 }
    });
    const boxId = engine.addBody({
      id: 'box1',
      shape: { type: 'rectangle', width: 40, height: 40 },
      position: { x: 250, y: 100 },
      mass: 2,
      friction: 0.1,
      userData: { name: 'Falling Box', width: 40, height: 40 }
    });

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

    const unsubscribeCollision = engine.onCollisionStart((event) => {
        console.log('[Demo] Collision Start:',
             `(${event.bodyAUserData?.name ?? event.bodyAId})`, '<=>',
             `(${event.bodyBUserData?.name ?? event.bodyBId})`
         );
    });

    return () => {
        unsubscribeCollision();
    }

  }, [engine]);

  useEffect(() => {
    if (!engine) return;

    const animate = () => {
      const allStates = engine.getAllBodyStates();
      setBodies(prevBodies => {
          const newMap = new Map(prevBodies);
          let changed = false;

          allStates.forEach((state, id) => {
              const existingRep = newMap.get(id);
              const positionChanged = !existingRep ||
                  Math.hypot(state.position.x - existingRep.state.position.x, state.position.y - existingRep.state.position.y) > 0.5 ||
                  Math.abs(state.angle - existingRep.state.angle) > 0.02;

              if (!existingRep || positionChanged) {
                  newMap.set(id, {
                      radius: existingRep?.radius ?? state.userData?.radius,
                      width: existingRep?.width ?? state.userData?.width,
                      height: existingRep?.height ?? state.userData?.height,
                      id: state.id,
                      state: state,
                      isStatic: state.isStatic,
                  });
                  changed = true;
              }
          });

          if (prevBodies.size !== allStates.size) {
              prevBodies.forEach((_, id) => {
                  if (!allStates.has(id)) {
                      newMap.delete(id);
                      changed = true;
                  }
              });
          }
          return changed ? newMap : prevBodies;
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
        x: (Math.random() - 0.5) * 10000,
        y: (Math.random() - 0.5) * 10000
    };
    console.log(`Applying force to ${randomId}:`, force);
    engine.applyForce(randomId, force);

  }, [engine]);

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
          {body.state.userData?.name ?? body.id.substring(0, 6)}
        </PhysicsBodyElement>
      ))}
      <ControlsContainer>
         {/* Use GlassButton with correct size prop */}
        <GlassButton onClick={handleAddCircle} size="small">Add Circle</GlassButton>
        <GlassButton onClick={handleApplyForceToRandom} size="small">Apply Force</GlassButton>
      </ControlsContainer>
    </SimulationContainer>
  );
};

// Storybook Meta
const meta: Meta<typeof CustomPhysicsEngineDemo> = {
    title: 'Examples/Animations/useGalileoPhysicsEngine',
    component: CustomPhysicsEngineDemo,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {}; 