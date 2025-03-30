import React, { useState } from 'react';
import styled from 'styled-components';
import { useGalileoStateSpring } from '../../../hooks/useGalileoStateSpring';
import { SpringPresets } from '../springPhysics';

/**
 * Example component demonstrating the useSpring hook
 */
export const UseSpringExample: React.FC = () => {
  const [target, setTarget] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof SpringPresets>('DEFAULT');
  const [isToggled, setIsToggled] = useState(false);
  const targetValue = isToggled ? 100 : 0;
  
  // Use the spring hook
  const { value: springValue, start, stop, reset } = useGalileoStateSpring(targetValue, {
    tension: 170, 
    friction: 26, 
    mass: 1, // Configuration is now part of the options object
    onRest: () => console.log('Spring animation rested'), // Callback remains in options
  });
  
  // Handle preset changes
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPreset = e.target.value as keyof typeof SpringPresets;
    setSelectedPreset(newPreset);
  };
  
  // Handle target changes
  const handleTargetChange = (newTarget: number) => {
    setTarget(newTarget);
    setIsToggled(newTarget === 100);
  };
  
  return (
    <div className="use-spring-example">
      <h2>useSpring Hook Demo</h2>
      
      {/* Visualization */}
      <div className="spring-visualization" style={{ position: 'relative', height: '100px', width: '100%', marginBottom: '20px' }}>
        <div 
          className="spring-object"
          style={{
            position: 'absolute',
            left: `${springValue}%`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'box-shadow 0.3s ease'
          }}
        />
        <div 
          className="spring-target-0"
          style={{
            position: 'absolute',
            left: '0%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '10px',
            height: '50px',
            backgroundColor: '#ddd'
          }}
        />
        <div 
          className="spring-target-100"
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translate(-100%, -50%)',
            width: '10px',
            height: '50px',
            backgroundColor: '#ddd'
          }}
        />
      </div>
      
      {/* Controls */}
      <div className="spring-controls">
        <div className="button-group" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => handleTargetChange(0)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Move to Left
          </button>
          <button 
            onClick={() => handleTargetChange(100)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Move to Right
          </button>
          <button 
            onClick={() => handleTargetChange(50)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Move to Center
          </button>
        </div>
        
        {/* Animation controls */}
        <div className="animation-controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setIsToggled(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Set Target (0)
          </button>
          <button 
            onClick={() => setIsToggled(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Set Target (100)
          </button>
          <button 
            onClick={stop}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Stop
          </button>
          <button 
            onClick={() => reset()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
        
        {/* Preset selector */}
        <div className="preset-selector" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Spring Preset:
          </label>
          <select 
            value={selectedPreset}
            onChange={handlePresetChange}
            style={{
              padding: '8px',
              width: '100%',
              borderRadius: '4px',
              border: '1px solid #d1d5db'
            }}
          >
            {Object.keys(SpringPresets).map(preset => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>
        
        {/* Current state display */}
        <div className="spring-state" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p><strong>Current Value:</strong> {springValue.toFixed(2)}</p>
          <p><strong>Target:</strong> {target}</p>
          <p><strong>Status:</strong> {isToggled ? 'Animating' : 'Stopped'}</p>
        </div>
        
        {/* Code example */}
        <div className="code-example" style={{ marginTop: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '4px' }}>
          <h3>Code Example:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
{`// Using the useGalileoStateSpring hook
const { value: springValue, start, stop, reset } = useGalileoStateSpring(${target}, {
  tension: 170,
  friction: 26,
  mass: 1,
  onRest: () => console.log('Spring animation rested')
});

// In your component's JSX
<div style={{ transform: \`translateX(\${springValue}px)\` }} />

// Starting an animation
start({ to: 100 });`}
          </pre>
        </div>
      </div>
    </div>
  );
}; 