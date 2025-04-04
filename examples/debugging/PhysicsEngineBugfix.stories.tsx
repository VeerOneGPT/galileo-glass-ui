import React, { useEffect, useRef, useState } from 'react';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';
import { ThemeProvider } from '../../src/theme';
import { useGalileoPhysicsEngine } from '../../src/animations/physics/useGalileoPhysicsEngine';
import {
  getPhysicsBodyState,
  verifyPhysicsEngineState,
  forcePhysicsEngineUpdate,
  debugPhysicsEngine
} from '../../src/animations/physics/physicsEngineDebug';
// Import the type from the core physics engine
// import { PhysicsEngineConfig } from '../../src/animations/physics/types';
import { Paper } from '../../src/components/Paper';
import { Button } from '../../src/components/Button';
import { Typography } from '../../src/components/Typography';
import { Slider } from '../../src/components/Slider';
// The debug panel is likely created locally or is an internal component
// import { PhysicsEngineDebugPanel } from '../../src/animations/physics/physicsEngineDebug';

// Create a darkTheme object for use in the component
const darkTheme = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    background: '#1F2937',
    backgroundVariant: '#111827',
    border: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#E5E7EB'
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  shape: {
    borderRadius: 8
  }
};

// --- Mock Theme (similar to other stories) ---
const mockDarkTheme = {
  colors: {
    background: '#121212',
    backgroundVariant: '#1e1e1e',
    primary: '#6366f1',
    secondary: '#ec4899',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    primaryTransparent: 'rgba(99, 102, 241, 0.1)',
    secondaryTransparent: 'rgba(236, 72, 153, 0.1)',
    // Add other necessary colors
  },
  shape: {
    borderRadius: 8, // Ensure this exists
  },
  // Add other theme parts if needed
};

// --- Styled Components ---
const StoryContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

const DemoContainer = styled(Paper)`
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
`;

const CanvasContainer = styled.div`
  width: 100%;
  max-width: 600px; /* Match canvas width */
  height: 300px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
  position: relative;
  margin: 0 auto 1rem auto; /* Center the canvas */
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
`;

const InfoPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DebugStatus = styled(Paper)`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  font-family: monospace;
  font-size: 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

// --- Component Definition ---
const PhysicsEngineBugfixDemoComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bodyCount, setBodyCount] = useState<number>(0);
  const [collisionCount, setCollisionCount] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing physics...');

  // Body references
  const bodyARef = useRef<string | null>(null);
  const bodyBRef = useRef<string | null>(null);
  const boundaryIds = useRef<string[]>([]); // Store boundary IDs

  // Initialize the physics engine
  const engine = useGalileoPhysicsEngine({ gravity: { x: 0, y: 0 }, enableSleeping: false });

  // Setup the physics simulation
  useEffect(() => {
    if (!engine || !canvasRef.current) return;
    console.log('[Physics Debug] Setting up simulation...');

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    // Cleanup previous bodies if re-running
    boundaryIds.current.forEach(id => engine.removeBody(id));
    if (bodyARef.current) engine.removeBody(bodyARef.current);
    if (bodyBRef.current) engine.removeBody(bodyBRef.current);
    boundaryIds.current = [];
    bodyARef.current = null;
    bodyBRef.current = null;
    setCollisionCount(0);

    // Create boundaries
    const wallThickness = 40; // Thicker invisible walls
    const boundaries = [
      // Top
      engine.addBody({ shape: { type: 'rectangle', width: canvasWidth, height: wallThickness }, position: { x: canvasWidth / 2, y: -wallThickness / 2 }, isStatic: true, userData: { type: 'wall' } }),
      // Bottom
      engine.addBody({ shape: { type: 'rectangle', width: canvasWidth, height: wallThickness }, position: { x: canvasWidth / 2, y: canvasHeight + wallThickness / 2 }, isStatic: true, userData: { type: 'wall' } }),
      // Left
      engine.addBody({ shape: { type: 'rectangle', width: wallThickness, height: canvasHeight }, position: { x: -wallThickness / 2, y: canvasHeight / 2 }, isStatic: true, userData: { type: 'wall' } }),
      // Right
      engine.addBody({ shape: { type: 'rectangle', width: wallThickness, height: canvasHeight }, position: { x: canvasWidth + wallThickness / 2, y: canvasHeight / 2 }, isStatic: true, userData: { type: 'wall' } })
    ];
    boundaryIds.current = boundaries;

    // Create colliding bodies
    const bodyA = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: canvasWidth * 0.2, y: canvasHeight / 2 },
      velocity: { x: 60, y: 10 }, // Adjusted velocity
      mass: 1, restitution: 0.8, friction: 0.1, isStatic: false,
      userData: { type: 'bodyA', color: darkTheme.colors.primary }
    });

    const bodyB = engine.addBody({
      shape: { type: 'circle', radius: 20 },
      position: { x: canvasWidth * 0.8, y: canvasHeight / 2 },
      velocity: { x: -60, y: -10 }, // Adjusted velocity
      mass: 1, restitution: 0.8, friction: 0.1, isStatic: false,
      userData: { type: 'bodyB', color: darkTheme.colors.secondary }
    });

    bodyARef.current = bodyA;
    bodyBRef.current = bodyB;
    console.log('[Physics Debug] Bodies created:', bodyA, bodyB);
    setBodyCount(2 + boundaries.length);

    // Initial diagnostics
    debugPhysicsEngine(engine);
    setTimeout(() => {
      const directStateA = engine.getBodyState(bodyA);
      const robustStateA = getPhysicsBodyState(engine, bodyA);
      console.log('[Physics Debug] Direct getBodyState result:', directStateA);
      console.log('[Physics Debug] Enhanced getPhysicsBodyState result:', robustStateA);
      if (directStateA) {
        setDebugInfo('Engine state retrieval OK.');
      } else if (robustStateA) {
        setDebugInfo('Engine bug workaround active (direct state failed).');
      } else {
        setDebugInfo('Engine state issue detected (check console).');
      }
    }, 150);

    // Collision listener
    const unsubscribeStart = engine.onCollisionStart((event) => {
      if ((event.bodyAId === bodyA && event.bodyBId === bodyB) || (event.bodyAId === bodyB && event.bodyBId === bodyA)) {
        console.log('[Physics Debug] Main body collision:', event);
        setCollisionCount(prev => prev + 1);
      }
    });

    // Render loop setup
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    function render() {
      if (!canvasRef.current || !ctx || !engine) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Engine update method with fallback
      // @ts-ignore - Ensure we try all possible update methods
      if (engine.step) {
        // @ts-ignore
        engine.step();
      // @ts-ignore
      } else if (engine.updatePhysics) {
        // @ts-ignore
        engine.updatePhysics();
      } else {
        // @ts-ignore
        engine.update && engine.update();
      }

      const allStates = engine.getAllBodyStates();

      allStates.forEach((state, id) => {
        if (!state || state.userData?.type === 'wall') return; // Skip null states and walls

        // Use getPhysicsBodyState for robustness
        const robustState = getPhysicsBodyState(engine, id);
        if (!robustState) return;

        const { position, userData } = robustState;
        ctx.fillStyle = userData?.color || darkTheme.colors.textSecondary;
        ctx.beginPath();
        
        // Shape information should be available in userData
        const shapeInfo = userData?.shape || { type: 'circle', radius: 15 }; // Fallback
        
        if (shapeInfo.type === 'circle') {
          ctx.arc(position.x, position.y, shapeInfo.radius, 0, Math.PI * 2);
        } else if (shapeInfo.type === 'rectangle') {
          // Basic rectangle drawing (could add rotation if needed)
           ctx.save();
           ctx.translate(position.x, position.y);
           ctx.rotate(robustState.angle || 0);
           ctx.fillRect(-shapeInfo.width / 2, -shapeInfo.height / 2, shapeInfo.width, shapeInfo.height);
           ctx.restore();
        }
        ctx.fill();

        // Add label
        if (userData?.type === 'bodyA' || userData?.type === 'bodyB') {
            ctx.fillStyle = darkTheme.colors.background; // White text on colored circles
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(userData.type === 'bodyA' ? 'A' : 'B', position.x, position.y);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      unsubscribeStart();
      cancelAnimationFrame(animationFrameId);
      // No need to remove bodies here if they are cleaned up at the start
      console.log('[Physics Debug] Simulation cleanup.');
    };
  }, [engine]); // Rerun if engine instance changes

  // Interaction handlers
  const handleApplyImpulse = () => {
    if (!engine || !bodyARef.current || !bodyBRef.current) return;
    const impulseStrength = 100; // Increased impulse
    engine.applyImpulse(bodyARef.current, { x: (Math.random() - 0.5) * impulseStrength, y: (Math.random() - 0.5) * impulseStrength });
    engine.applyImpulse(bodyBRef.current, { x: (Math.random() - 0.5) * impulseStrength, y: (Math.random() - 0.5) * impulseStrength });
    console.log('[Physics Debug] Applied random impulses.');
  };

  const handleTestEngine = () => {
    if (!engine) return;
    // Force update (optional, engine updates in loop now)
    // if (bodyARef.current) forcePhysicsEngineUpdate(engine, bodyARef.current);
    // else forcePhysicsEngineUpdate(engine);

    const engineState = verifyPhysicsEngineState(engine);
    setDebugInfo(engineState.message);
    debugPhysicsEngine(engine); // Log full details
    console.log('[Physics Debug] Engine state tested.');
  };

  return (
    <StoryContainer>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center' }}>
        Physics Engine Debugging & Bugfix Demo
      </Typography>
      <Typography variant="body1" paragraph style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2rem auto' }}>
        This story demonstrates internal physics engine state management, specifically showcasing robustness
        added via <code>getPhysicsBodyState</code> and other debug utilities. Observe the collision count and status messages.
      </Typography>

      <DemoContainer elevation={2}>
        <InfoPanel>
            <StatRow>
                <Typography variant="body1">Body Count:</Typography>
                <Typography variant="body1"><strong>{bodyCount}</strong></Typography>
            </StatRow>
            <StatRow>
                 <Typography variant="body1">Collisions (A vs B):</Typography>
                <Typography variant="body1"><strong>{collisionCount}</strong></Typography>
            </StatRow>
          <DebugStatus elevation={1}>
            <Typography variant="body2">Status: {debugInfo}</Typography>
          </DebugStatus>
        </InfoPanel>

        <CanvasContainer>
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            style={{ display: 'block' }}
          />
        </CanvasContainer>

        <ButtonRow>
          <Button onClick={handleApplyImpulse} variant="contained" color="primary">
            Apply Random Impulses
          </Button>
          <Button onClick={handleTestEngine} variant="contained" color="secondary">
            Test Engine State
          </Button>
        </ButtonRow>

        <Typography variant="caption" color="textSecondary" style={{ textAlign: 'center', display: 'block' }}>
          Open the browser console to see detailed debugging information and event logs.
        </Typography>
      </DemoContainer>
    </StoryContainer>
  );
};

// --- Storybook Configuration ---
const meta: Meta<typeof PhysicsEngineBugfixDemoComponent> = {
  title: 'Debugging/Physics Engine State',
  component: PhysicsEngineBugfixDemoComponent,
  decorators: [
    (Story) => (
      <StyledThemeProvider theme={mockDarkTheme}>
        <ThemeProvider initialTheme="dark">
          <Story />
        </ThemeProvider>
      </StyledThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// --- Stories ---
const Template: StoryFn = (args) => <PhysicsEngineBugfixDemoComponent {...args} />;

export const Default = Template.bind({});
Default.args = {}; 