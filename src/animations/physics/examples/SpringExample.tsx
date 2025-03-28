import React, { useEffect, useState, useRef } from 'react';
import { SpringPhysics, SpringPresets } from '../springPhysics';

// Extend the preset type to include CUSTOM
type ExtendedPresetType = keyof typeof SpringPresets | 'CUSTOM';

/**
 * Example component demonstrating the SpringPhysics system in action
 */
export const SpringExample: React.FC = () => {
  const [position, setPosition] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<ExtendedPresetType>('DEFAULT');
  const [customConfig, setCustomConfig] = useState({
    tension: SpringPresets.DEFAULT.tension,
    friction: SpringPresets.DEFAULT.friction,
    mass: SpringPresets.DEFAULT.mass
  });
  
  const springRef = useRef<SpringPhysics | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Initialize the spring
  useEffect(() => {
    springRef.current = new SpringPhysics(
      selectedPreset === 'CUSTOM' ? customConfig : SpringPresets[selectedPreset as keyof typeof SpringPresets]
    );
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Update spring config when preset changes
  useEffect(() => {
    if (springRef.current) {
      if (selectedPreset === 'CUSTOM') {
        springRef.current.updateConfig(customConfig);
      } else {
        springRef.current.updateConfig(SpringPresets[selectedPreset as keyof typeof SpringPresets]);
      }
    }
  }, [selectedPreset, customConfig]);
  
  // Animation loop
  const animate = () => {
    if (springRef.current) {
      const state = springRef.current.update();
      setPosition(state.position);
      
      if (!state.atRest) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }
  };
  
  // Handle target value changes
  const handleTargetChange = (target: number) => {
    if (springRef.current) {
      springRef.current.setTarget(target);
      
      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Start animation loop
      rafRef.current = requestAnimationFrame(animate);
    }
  };
  
  // Handle preset changes
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPreset(e.target.value as ExtendedPresetType);
  };
  
  // Handle custom config changes
  const handleCustomConfigChange = (property: keyof typeof customConfig, value: number) => {
    setCustomConfig(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  return (
    <div className="spring-example">
      <h2>Spring Physics Demo</h2>
      
      {/* Visualization */}
      <div className="spring-visualization" style={{ position: 'relative', height: '100px', width: '100%', marginBottom: '20px' }}>
        <div 
          className="spring-object"
          style={{
            position: 'absolute',
            left: `${position}%`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#6d28d9',
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
            <option value="CUSTOM">CUSTOM</option>
          </select>
        </div>
        
        {/* Custom config controls (only shown when CUSTOM is selected) */}
        {selectedPreset === 'CUSTOM' && (
          <div className="custom-config" style={{ marginBottom: '20px' }}>
            <h3>Custom Configuration</h3>
            
            <div className="config-control" style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Tension: {customConfig.tension}
              </label>
              <input 
                type="range"
                min="10"
                max="1000"
                value={customConfig.tension}
                onChange={(e) => handleCustomConfigChange('tension', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="config-control" style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Friction: {customConfig.friction}
              </label>
              <input 
                type="range"
                min="1"
                max="100"
                value={customConfig.friction}
                onChange={(e) => handleCustomConfigChange('friction', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="config-control" style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Mass: {customConfig.mass}
              </label>
              <input 
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={customConfig.mass}
                onChange={(e) => handleCustomConfigChange('mass', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
        
        {/* Current state display */}
        <div className="spring-state">
          <p><strong>Current Position:</strong> {position.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}; 