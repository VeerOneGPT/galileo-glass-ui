import React, { useState } from 'react';
import { useMomentum } from '../useMomentum';
import { MomentumDirection, MomentumInteractionType } from '../momentum';

/**
 * Example of momentum-based interactions
 */
export const MomentumExample: React.FC = () => {
  // Configure momentum with initial settings
  const {
    x, 
    y, 
    isMoving,
    isDragging,
    lastMomentum,
    handleStart,
    handleMove, 
    handleEnd,
    stop
  } = useMomentum({
    type: MomentumInteractionType.DRAG,
    direction: MomentumDirection.BOTH,
    friction: 0.95,
    velocityMultiplier: 1.2,
    smallGestureMultiplier: 2,
    minimumVelocity: 1,
    minimumDistance: 10
  });
  
  // Simple UI state
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev.slice(0, 4)]);
  };
  
  // Log momentum info when it changes
  React.useEffect(() => {
    if (lastMomentum && !isDragging && isMoving) {
      addLog(`Momentum: vX=${lastMomentum.velocityX.toFixed(1)}, vY=${lastMomentum.velocityY.toFixed(1)}, dir=${lastMomentum.primaryDirection || 'none'}`);
    }
  }, [lastMomentum, isDragging, isMoving]);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Momentum Interactions</h2>
      <p>Drag the element and flick it - notice the natural momentum</p>
      
      {/* Draggable element */}
      <div 
        style={{ 
          position: 'relative', 
          height: '300px', 
          backgroundColor: '#f4f4f8',
          border: '1px solid #e0e0e4',
          borderRadius: '8px',
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        <div
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            backgroundColor: isDragging ? '#8b5cf6' : (isMoving ? '#3b82f6' : '#6366f1'),
            boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            transform: `translate(${x}px, ${y}px)`,
            transition: 'background-color 0.2s'
          }}
        >
          {isDragging ? 'Dragging' : (isMoving ? 'Moving' : 'Drag Me')}
        </div>
      </div>
      
      {/* Controls and info */}
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={stop}
          disabled={!isMoving && !isDragging}
          style={{
            padding: '8px 16px',
            backgroundColor: (!isMoving && !isDragging) ? '#d1d5db' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!isMoving && !isDragging) ? 'default' : 'pointer',
            opacity: (!isMoving && !isDragging) ? 0.7 : 1
          }}
        >
          Stop Movement
        </button>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Status:</h3>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            backgroundColor: '#f8fafc',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px' 
          }}>
            <div>
              <strong>Position:</strong> x:{x.toFixed(0)}, y:{y.toFixed(0)}
            </div>
            <div>
              <strong>State:</strong> {isDragging ? 'Dragging' : (isMoving ? 'Moving with momentum' : 'Stationary')}
            </div>
          </div>
          
          <h3>Momentum Logs:</h3>
          <ul style={{ 
            listStyleType: 'none', 
            padding: '0',
            margin: '0',
            backgroundColor: '#f0f9ff',
            border: '1px solid #e0f2fe',
            borderRadius: '4px'
          }}>
            {logs.map((log, i) => (
              <li key={i} style={{ 
                padding: '8px 12px',
                borderBottom: i < logs.length - 1 ? '1px solid #e0f2fe' : 'none' 
              }}>
                {log}
              </li>
            ))}
            {logs.length === 0 && (
              <li style={{ padding: '8px 12px', color: '#64748b' }}>
                Flick the element to see momentum data
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}; 