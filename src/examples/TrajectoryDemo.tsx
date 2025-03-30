/**
 * TrajectoryDemo.tsx
 * 
 * A demo component showcasing the trajectory utilities and hooks
 * for creating projectile motion and other trajectory paths in UI animations.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useTrajectory, 
  TrajectoryHookResult,
  TrajectoryHookOptions
} from '../animations/physics/useTrajectory';
import { 
  TrajectoryType, 
  renderTrajectorySVG,
  calculateLaunchParameters
} from '../animations/physics/TrajectoryUtils';
import { Vector } from '../animations/physics/galileoPhysicsSystem';

// Demo container
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

// Scene container
const SceneContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #f0f5ff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: crosshair;
`;

// Styled trajectory path
const TrajectoryPath = styled.div<{ path: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(58, 134, 255, 0.3);
    clip-path: ${props => `path('${props.path}')`};
  }
`;

// Trajectory object
const TrajectoryObject = styled.div<{ size?: number, color?: string }>`
  position: absolute;
  width: ${props => props.size || 20}px;
  height: ${props => props.size || 20}px;
  background-color: ${props => props.color || '#ff006e'};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  pointer-events: none;
`;

// Target element
const Target = styled.div<{ active?: boolean }>`
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: ${props => props.active ? '#00b4d8' : 'rgba(0, 180, 216, 0.3)'};
  border: 2px dashed ${props => props.active ? '#0077b6' : 'rgba(0, 119, 182, 0.3)'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.active ? '0 0 15px rgba(0, 180, 216, 0.5)' : 'none'};
  transition: all 0.3s ease;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background-color: ${props => props.active ? '#0077b6' : 'rgba(0, 119, 182, 0.3)'};
  }
  
  &::before {
    width: 20px;
    height: 2px;
  }
  
  &::after {
    width: 2px;
    height: 20px;
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

// Select
const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d0d8f0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  margin: 0 10px;
`;

// Label
const Label = styled.label`
  font-weight: 600;
  margin-right: 10px;
`;

// Slider container
const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 10px;
`;

// Slider
const Slider = styled.input`
  width: 150px;
  margin: 0 8px;
`;

// Value display
const ValueDisplay = styled.span`
  font-weight: 500;
  min-width: 40px;
  text-align: right;
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

/**
 * Trajectory Demo Component
 */
export const TrajectoryDemo: React.FC = () => {
  // References
  const sceneRef = useRef<HTMLDivElement>(null);
  
  // State for scene dimensions
  const [sceneDimensions, setSceneDimensions] = useState({ width: 800, height: 500 });
  
  // State for trajectory configuration
  const [trajectoryType, setTrajectoryType] = useState<TrajectoryType>(TrajectoryType.PROJECTILE);
  const [gravity, setGravity] = useState(9.8);
  const [initialVelocity, setInitialVelocity] = useState(200);
  const [launchAngle, setLaunchAngle] = useState(45);
  const [objectCount, setObjectCount] = useState(1);
  const [showTarget, setShowTarget] = useState(false);
  const [targetPosition, setTargetPosition] = useState<Vector>({ x: 600, y: 250, z: 0 });
  const [targetReached, setTargetReached] = useState(false);
  
  // Bezier control for bezier curves
  const [controlPoint1, setControlPoint1] = useState<Vector>({ x: 400, y: 100, z: 0 });
  const [controlPoint2, setControlPoint2] = useState<Vector>({ x: 600, y: 100, z: 0 });
  
  // Spiral controls
  const [spiralTurns, setSpiralTurns] = useState(2);
  const [spiralRadius, setSpiralRadius] = useState(100);
  
  // Sine wave controls
  const [waveAmplitude, setWaveAmplitude] = useState(50);
  const [waveFrequency, setWaveFrequency] = useState(0.01);
  
  // Starting position is always bottom left of scene
  const startPosition: Vector = { x: 50, y: sceneDimensions.height - 50, z: 0 };
  
  // Calculate end position based on scene dimensions (for non-projectile trajectories)
  const endPosition: Vector = { x: sceneDimensions.width - 50, y: sceneDimensions.height - 50, z: 0 };
  
  // Calculate initial velocity vector from angle and magnitude
  const initialVelocityVector: Vector = {
    x: initialVelocity * Math.cos(launchAngle * Math.PI / 180),
    y: -initialVelocity * Math.sin(launchAngle * Math.PI / 180),
    z: 0
  };
  
  // Config for different trajectory types
  const trajectoryConfigs = {
    [TrajectoryType.PROJECTILE]: {
      type: TrajectoryType.PROJECTILE,
      startPosition,
      initialVelocity: initialVelocityVector,
      gravity: { x: 0, y: gravity, z: 0 },
      maxTime: 10,
      timeStep: 0.05,
      numPoints: 100,
      stopAtGround: false,
      bounce: true,
      boundaries: {
        left: 0, 
        right: sceneDimensions.width,
        top: 0,
        bottom: sceneDimensions.height
      }
    },
    [TrajectoryType.BEZIER]: {
      type: TrajectoryType.BEZIER,
      startPosition,
      endPosition,
      controlPoints: [controlPoint1, controlPoint2],
      numPoints: 100
    },
    [TrajectoryType.SPIRAL]: {
      type: TrajectoryType.SPIRAL,
      center: { 
        x: sceneDimensions.width / 2, 
        y: sceneDimensions.height / 2, 
        z: 0 
      },
      startRadius: spiralRadius,
      angularSpeed: 2,
      turns: spiralTurns,
      numPoints: 200
    },
    [TrajectoryType.SINE_WAVE]: {
      type: TrajectoryType.SINE_WAVE,
      startPosition,
      direction: { x: 1, y: 0, z: 0 },
      distance: sceneDimensions.width - 100,
      amplitude: waveAmplitude,
      frequency: waveFrequency,
      numPoints: 100
    },
    [TrajectoryType.CUSTOM]: {
      type: TrajectoryType.CUSTOM,
      trajectoryFn: (t: number) => ({
        x: sceneDimensions.width * t,
        y: sceneDimensions.height / 2 + Math.sin(t * Math.PI * 4) * 100,
        z: 0
      }),
      numPoints: 100
    }
  };
  
  // Animation options
  const animationOptions = {
    animate: true,
    duration: 3000,
    easing: 'easeInOut',
    animationStyle: 'full',
    loop: true,
    autoPlay: true,
    objectCount
  };
  
  // Get correct config based on type
  const trajectoryConfig = trajectoryConfigs[trajectoryType];
  
  // Use trajectory hook
  const trajectory = useTrajectory(
    trajectoryConfig as TrajectoryHookOptions,
    animationOptions as any // type casting to avoid prop errors
  );
  
  // Update scene dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (sceneRef.current) {
        const { width, height } = sceneRef.current.getBoundingClientRect();
        setSceneDimensions({ width, height });
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Update on resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Update trajectory when scene dimensions change
  useEffect(() => {
    if (trajectoryType === TrajectoryType.PROJECTILE) {
      trajectory.recalculate({
        startPosition: { x: 50, y: sceneDimensions.height - 50, z: 0 },
        boundaries: {
          left: 0, 
          right: sceneDimensions.width,
          top: 0,
          bottom: sceneDimensions.height
        }
      });
    } else if (trajectoryType === TrajectoryType.BEZIER) {
      trajectory.recalculate({
        startPosition: { x: 50, y: sceneDimensions.height - 50, z: 0 },
        endPosition: { x: sceneDimensions.width - 50, y: sceneDimensions.height - 50, z: 0 }
      });
    } else if (trajectoryType === TrajectoryType.SPIRAL) {
      trajectory.recalculate({
        center: { 
          x: sceneDimensions.width / 2, 
          y: sceneDimensions.height / 2, 
          z: 0 
        }
      });
    } else if (trajectoryType === TrajectoryType.SINE_WAVE) {
      trajectory.recalculate({
        startPosition: { x: 50, y: sceneDimensions.height - 50, z: 0 },
        distance: sceneDimensions.width - 100
      });
    } else if (trajectoryType === TrajectoryType.CUSTOM) {
      trajectory.recalculate({
        trajectoryFn: (t: number) => ({
          x: 50 + (sceneDimensions.width - 100) * t,
          y: sceneDimensions.height / 2 + Math.sin(t * Math.PI * 4) * 100,
          z: 0
        })
      });
    }
  }, [sceneDimensions, trajectoryType]);
  
  // Update control points when scene dimensions change (for bezier)
  useEffect(() => {
    setControlPoint1({ 
      x: sceneDimensions.width / 3, 
      y: 100, 
      z: 0 
    });
    setControlPoint2({ 
      x: (sceneDimensions.width / 3) * 2, 
      y: 100, 
      z: 0 
    });
  }, [sceneDimensions]);
  
  // Update spiral settings when scene dimensions change
  useEffect(() => {
    setSpiralRadius(Math.min(sceneDimensions.width, sceneDimensions.height) / 5);
  }, [sceneDimensions]);
  
  // Update target position when scene dimensions change
  useEffect(() => {
    setTargetPosition({
      x: sceneDimensions.width * 0.75,
      y: sceneDimensions.height * 0.5,
      z: 0
    });
  }, [sceneDimensions]);
  
  // Handle trajectory type change
  const handleTrajectoryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as TrajectoryType;
    setTrajectoryType(newType);
    
    // Reset target reached state
    setTargetReached(false);
    
    // Recalculate trajectory with new type
    trajectory.recalculate(trajectoryConfigs[newType]);
  };
  
  // Handle control point drag (for bezier curves)
  const handleControlPointDrag = (e: React.MouseEvent, point: 1 | 2) => {
    if (trajectoryType !== TrajectoryType.BEZIER) return;
    
    const updateControlPoint = (event: MouseEvent) => {
      if (!sceneRef.current) return;
      
      const rect = sceneRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(sceneDimensions.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(sceneDimensions.height, event.clientY - rect.top));
      
      if (point === 1) {
        setControlPoint1({ x, y, z: 0 });
        trajectory.recalculate({
          controlPoints: [{ x, y, z: 0 }, controlPoint2]
        });
      } else {
        setControlPoint2({ x, y, z: 0 });
        trajectory.recalculate({
          controlPoints: [controlPoint1, { x, y, z: 0 }]
        });
      }
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', updateControlPoint);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', updateControlPoint);
    document.addEventListener('mouseup', stopDrag);
  };
  
  // Handle target drag
  const handleTargetDrag = (e: React.MouseEvent) => {
    if (!showTarget) return;
    
    const updateTarget = (event: MouseEvent) => {
      if (!sceneRef.current) return;
      
      const rect = sceneRef.current.getBoundingClientRect();
      const x = Math.max(20, Math.min(sceneDimensions.width - 20, event.clientX - rect.left));
      const y = Math.max(20, Math.min(sceneDimensions.height - 20, event.clientY - rect.top));
      
      setTargetPosition({ x, y, z: 0 });
      setTargetReached(false);
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', updateTarget);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', updateTarget);
    document.addEventListener('mouseup', stopDrag);
  };
  
  // Handle launch angle change
  const handleLaunchAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const angle = parseFloat(e.target.value);
    setLaunchAngle(angle);
    
    if (trajectoryType === TrajectoryType.PROJECTILE) {
      // Recalculate velocity vector with new angle
      const velocity = {
        x: initialVelocity * Math.cos(angle * Math.PI / 180),
        y: -initialVelocity * Math.sin(angle * Math.PI / 180),
        z: 0
      };
      
      trajectory.recalculate({ initialVelocity: velocity });
    }
  };
  
  // Handle initial velocity change
  const handleVelocityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const velocity = parseFloat(e.target.value);
    setInitialVelocity(velocity);
    
    if (trajectoryType === TrajectoryType.PROJECTILE) {
      // Recalculate velocity vector with new magnitude
      const velocityVector = {
        x: velocity * Math.cos(launchAngle * Math.PI / 180),
        y: -velocity * Math.sin(launchAngle * Math.PI / 180),
        z: 0
      };
      
      trajectory.recalculate({ initialVelocity: velocityVector });
    }
  };
  
  // Handle gravity change
  const handleGravityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gravity = parseFloat(e.target.value);
    setGravity(gravity);
    
    if (trajectoryType === TrajectoryType.PROJECTILE) {
      trajectory.recalculate({ 
        gravity: { x: 0, y: gravity, z: 0 } 
      });
    }
  };
  
  // Handle object count change
  const handleObjectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    setObjectCount(count);
  };
  
  // Handle spiral turns change
  const handleSpiralTurnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const turns = parseFloat(e.target.value);
    setSpiralTurns(turns);
    
    if (trajectoryType === TrajectoryType.SPIRAL) {
      trajectory.recalculate({ turns });
    }
  };
  
  // Handle spiral radius change
  const handleSpiralRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const radius = parseFloat(e.target.value);
    setSpiralRadius(radius);
    
    if (trajectoryType === TrajectoryType.SPIRAL) {
      trajectory.recalculate({ startRadius: radius });
    }
  };
  
  // Handle wave amplitude change
  const handleWaveAmplitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amplitude = parseFloat(e.target.value);
    setWaveAmplitude(amplitude);
    
    if (trajectoryType === TrajectoryType.SINE_WAVE) {
      trajectory.recalculate({ amplitude });
    }
  };
  
  // Handle wave frequency change
  const handleWaveFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = parseFloat(e.target.value);
    setWaveFrequency(frequency);
    
    if (trajectoryType === TrajectoryType.SINE_WAVE) {
      trajectory.recalculate({ frequency });
    }
  };
  
  // Calculate trajectory to hit target
  const calculateToTarget = () => {
    if (!showTarget || trajectoryType !== TrajectoryType.PROJECTILE) return;
    
    const result = trajectory.calculateTarget(targetPosition, initialVelocity);
    setTargetReached(result);
  };
  
  // Toggle target visibility
  const toggleTarget = () => {
    setShowTarget(!showTarget);
    setTargetReached(false);
  };
  
  // Render trajectory objects
  const renderTrajectoryObjects = () => {
    return trajectory.objectPositions.map((point, index) => (
      <TrajectoryObject
        key={index}
        style={{
          left: `${point.position.x}px`,
          top: `${point.position.y}px`
        }}
        size={20}
        color="#ff006e"
      />
    ));
  };
  
  // Render control points for bezier curves
  const renderControlPoints = () => {
    if (trajectoryType !== TrajectoryType.BEZIER) return null;
    
    return (
      <>
        <TrajectoryObject
          style={{
            left: `${controlPoint1.x}px`,
            top: `${controlPoint1.y}px`,
            cursor: 'move'
          }}
          size={15}
          color="#9c27b0"
          onMouseDown={(e) => handleControlPointDrag(e, 1)}
        />
        <TrajectoryObject
          style={{
            left: `${controlPoint2.x}px`,
            top: `${controlPoint2.y}px`,
            cursor: 'move'
          }}
          size={15}
          color="#9c27b0"
          onMouseDown={(e) => handleControlPointDrag(e, 2)}
        />
        {/* Lines connecting control points */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line
            x1={startPosition.x}
            y1={startPosition.y}
            x2={controlPoint1.x}
            y2={controlPoint1.y}
            stroke="#9c27b0"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <line
            x1={controlPoint1.x}
            y1={controlPoint1.y}
            x2={controlPoint2.x}
            y2={controlPoint2.y}
            stroke="#9c27b0"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <line
            x1={controlPoint2.x}
            y1={controlPoint2.y}
            x2={endPosition.x}
            y2={endPosition.y}
            stroke="#9c27b0"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />
        </svg>
      </>
    );
  };
  
  // Render trajectory controls based on trajectory type
  const renderTrajectoryControls = () => {
    switch (trajectoryType) {
      case TrajectoryType.PROJECTILE:
        return (
          <>
            <ControlRow>
              <SliderContainer>
                <Label>Launch Angle:</Label>
                <Slider
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={launchAngle}
                  onChange={handleLaunchAngleChange}
                />
                <ValueDisplay>{launchAngle}°</ValueDisplay>
              </SliderContainer>
              
              <SliderContainer>
                <Label>Velocity:</Label>
                <Slider
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={initialVelocity}
                  onChange={handleVelocityChange}
                />
                <ValueDisplay>{initialVelocity}</ValueDisplay>
              </SliderContainer>
              
              <SliderContainer>
                <Label>Gravity:</Label>
                <Slider
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={gravity}
                  onChange={handleGravityChange}
                />
                <ValueDisplay>{gravity}</ValueDisplay>
              </SliderContainer>
            </ControlRow>
            
            <ControlRow>
              <Button onClick={toggleTarget}>
                {showTarget ? 'Hide Target' : 'Show Target'}
              </Button>
              
              {showTarget && (
                <Button onClick={calculateToTarget}>
                  Calculate To Target
                </Button>
              )}
            </ControlRow>
          </>
        );
        
      case TrajectoryType.BEZIER:
        return (
          <ControlRow>
            <div>
              <Label>Control Points:</Label>
              <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
                Drag the purple control points to change the curve shape
              </span>
            </div>
          </ControlRow>
        );
        
      case TrajectoryType.SPIRAL:
        return (
          <ControlRow>
            <SliderContainer>
              <Label>Turns:</Label>
              <Slider
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={spiralTurns}
                onChange={handleSpiralTurnsChange}
              />
              <ValueDisplay>{spiralTurns}</ValueDisplay>
            </SliderContainer>
            
            <SliderContainer>
              <Label>Radius:</Label>
              <Slider
                type="range"
                min="20"
                max={Math.min(sceneDimensions.width, sceneDimensions.height) / 2.5}
                step="10"
                value={spiralRadius}
                onChange={handleSpiralRadiusChange}
              />
              <ValueDisplay>{spiralRadius}px</ValueDisplay>
            </SliderContainer>
          </ControlRow>
        );
        
      case TrajectoryType.SINE_WAVE:
        return (
          <ControlRow>
            <SliderContainer>
              <Label>Amplitude:</Label>
              <Slider
                type="range"
                min="10"
                max={sceneDimensions.height / 3}
                step="5"
                value={waveAmplitude}
                onChange={handleWaveAmplitudeChange}
              />
              <ValueDisplay>{waveAmplitude}px</ValueDisplay>
            </SliderContainer>
            
            <SliderContainer>
              <Label>Frequency:</Label>
              <Slider
                type="range"
                min="0.001"
                max="0.03"
                step="0.001"
                value={waveFrequency}
                onChange={handleWaveFrequencyChange}
              />
              <ValueDisplay>{waveFrequency.toFixed(3)}</ValueDisplay>
            </SliderContainer>
          </ControlRow>
        );
        
      default:
        return null;
    }
  };
  
  // Common controls for all trajectory types
  const renderCommonControls = () => (
    <ControlRow>
      <Label>Animation Objects:</Label>
      <Slider
        type="range"
        min="1"
        max="10"
        step="1"
        value={objectCount}
        onChange={handleObjectCountChange}
      />
      <ValueDisplay>{objectCount}</ValueDisplay>
      
      <div style={{ marginLeft: '20px' }}>
        <Button onClick={() => trajectory.play()} disabled={trajectory.isPlaying}>
          Play
        </Button>
        <Button onClick={() => trajectory.pause()} disabled={!trajectory.isPlaying}>
          Pause
        </Button>
        <Button onClick={() => trajectory.reset()}>
          Reset
        </Button>
      </div>
    </ControlRow>
  );
  
  return (
    <DemoContainer>
      <h2>Trajectory Animation Demo</h2>
      
      <InfoText>
        This demo showcases the trajectory animation utilities in Galileo Glass UI.
        These tools allow for creating realistic physics-based motion paths for UI elements,
        including projectile trajectories, bezier curves, spirals, and more.
      </InfoText>
      
      <ControlsBar>
        <ControlRow>
          <Label>Trajectory Type:</Label>
          <Select value={trajectoryType} onChange={handleTrajectoryTypeChange}>
            <option value={TrajectoryType.PROJECTILE}>Projectile</option>
            <option value={TrajectoryType.BEZIER}>Bezier Curve</option>
            <option value={TrajectoryType.SPIRAL}>Spiral</option>
            <option value={TrajectoryType.SINE_WAVE}>Sine Wave</option>
            <option value={TrajectoryType.CUSTOM}>Custom Path</option>
          </Select>
        </ControlRow>
        
        {renderTrajectoryControls()}
        {renderCommonControls()}
      </ControlsBar>
      
      <SceneContainer ref={sceneRef}>
        {/* Render trajectory path */}
        {trajectory.svgPath && (
          <TrajectoryPath path={trajectory.svgPath} />
        )}
        
        {/* Start point marker */}
        <TrajectoryObject
          style={{
            left: `${startPosition.x}px`,
            top: `${startPosition.y}px`,
            backgroundColor: '#3a86ff'
          }}
          size={15}
        />
        
        {/* End point marker for non-projectile paths */}
        {trajectoryType !== TrajectoryType.PROJECTILE && (
          <TrajectoryObject
            style={{
              left: `${endPosition.x}px`,
              top: `${endPosition.y}px`,
              backgroundColor: '#3a86ff'
            }}
            size={15}
          />
        )}
        
        {/* Render control points for bezier curves */}
        {renderControlPoints()}
        
        {/* Render trajectory objects */}
        {renderTrajectoryObjects()}
        
        {/* Render target if enabled */}
        {showTarget && (
          <Target 
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`
            }}
            active={targetReached}
            onMouseDown={handleTargetDrag}
          />
        )}
      </SceneContainer>
      
      <InfoText>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li><strong>Projectile Motion</strong> - Physics-based trajectories with gravity, velocity and bounce</li>
          <li><strong>Bezier Curves</strong> - Smooth curved paths with adjustable control points</li>
          <li><strong>Spiral Paths</strong> - Circular spiral motions with configurable radius and turns</li>
          <li><strong>Sine Waves</strong> - Oscillating wave-like motion with adjustable amplitude and frequency</li>
          <li><strong>Custom Paths</strong> - Arbitrary motion paths defined by mathematical functions</li>
          <li><strong>Target Calculation</strong> - Automatically calculate trajectory parameters to hit targets</li>
          <li><strong>Multiple Objects</strong> - Animate multiple elements along the same path</li>
          <li><strong>Animation Controls</strong> - Play, pause, and reset trajectory animations</li>
        </ul>
        
        <h3>Usage Applications:</h3>
        <ul>
          <li><strong>UI Animations</strong> - Create engaging motion effects for UI elements</li>
          <li><strong>Micro-interactions</strong> - Add subtle physics-based behaviors to interface components</li>
          <li><strong>Data Visualization</strong> - Animate data points along mathematically meaningful paths</li>
          <li><strong>Game Elements</strong> - Create game-like behaviors in interactive applications</li>
          <li><strong>Tutorial Guides</strong> - Direct user attention along natural-feeling motion paths</li>
        </ul>
      </InfoText>
    </DemoContainer>
  );
};

export default TrajectoryDemo;