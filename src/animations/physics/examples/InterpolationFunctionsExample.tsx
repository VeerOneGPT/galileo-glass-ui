/**
 * Interpolation Functions Example
 * 
 * This example demonstrates the various easing and interpolation functions
 * available in the physics animation system.
 */

import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Easings, EasingFunction, InterpolationFunction } from '../interpolation';

// Styled components
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 600;
`;

const Description = styled.p`
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.8);
`;

const CategoryHeading = styled.h3`
  margin: 30px 0 15px;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 8px;
`;

const EasingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const EasingCard = styled.div<{ $selected: boolean }>`
  background: ${props => props.$selected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.$selected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const EasingName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EasingDescription = styled.p`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 15px;
  min-height: 40px;
`;

const EasingPreview = styled.div`
  height: 60px;
  position: relative;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  overflow: hidden;
`;

const EasingLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const IntensityBadge = styled.span<{ $intensity: number }>`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${props => {
    const colors = [
      'rgba(34, 197, 94, 0.2)',
      'rgba(34, 197, 94, 0.3)',
      'rgba(234, 179, 8, 0.3)',
      'rgba(234, 88, 12, 0.3)',
      'rgba(239, 68, 68, 0.3)'
    ];
    return colors[props.$intensity - 1];
  }};
  border: 1px solid ${props => {
    const colors = [
      'rgba(34, 197, 94, 0.4)',
      'rgba(34, 197, 94, 0.5)',
      'rgba(234, 179, 8, 0.5)',
      'rgba(234, 88, 12, 0.5)',
      'rgba(239, 68, 68, 0.5)'
    ];
    return colors[props.$intensity - 1];
  }};
  color: ${props => {
    const colors = [
      'rgba(21, 128, 61, 1)',
      'rgba(21, 128, 61, 1)',
      'rgba(161, 98, 7, 1)',
      'rgba(154, 52, 18, 1)',
      'rgba(153, 27, 27, 1)'
    ];
    return colors[props.$intensity - 1];
  }};
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
`;

const Controls = styled.div`
  margin: 30px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ControlTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
`;

const ControlLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  width: 100px;
`;

const AnimationPreview = styled.div`
  position: relative;
  height: 400px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden;
`;

const AnimationObject = styled.div<{ $left: number; $top: number }>`
  position: absolute;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  left: ${props => props.$left}px;
  top: ${props => props.$top}px;
  transform: translate(-50%, -50%);
`;

const AdvancedControls = styled.div`
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const AdvancedControlsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
`;

// Helper to create SVG path for easing function visualization
const createEasingPath = (
  easingFn: EasingFunction | InterpolationFunction,
  width: number,
  height: number,
  steps = 100
): string => {
  const fn = typeof easingFn === 'function' ? easingFn : easingFn.function;
  let path = `M 0 ${height}`;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * width;
    const y = height - fn(t) * height;
    path += ` L ${x} ${y}`;
  }
  
  return path;
};

/**
 * Interpolation Functions Example Component
 */
export const InterpolationFunctionsExample: React.FC = () => {
  // State for selected easing function
  const [selectedEasing, setSelectedEasing] = useState<string>('easeOutQuad');
  const [duration, setDuration] = useState<number>(1000);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [objectPosition, setObjectPosition] = useState<{ x: number; y: number }>({ x: 50, y: 200 });
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number }>({ x: 350, y: 200 });
  
  // Animation preview references
  const previewRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Get categories of easing functions
  const categories = Array.from(
    new Set(
      Object.values(Easings)
        .filter(e => typeof e === 'object' && 'category' in e)
        .map(e => (e as EasingFunction).category)
    )
  ).sort();
  
  // Group easing functions by category
  const easingsByCategory = categories.reduce((acc, category) => {
    acc[category] = Object.entries(Easings)
      .filter(([_, easing]) => 
        typeof easing === 'object' && 
        'category' in easing && 
        (easing as EasingFunction).category === category
      )
      .map(([key, easing]) => ({ key, easing: easing as EasingFunction }));
    return acc;
  }, {} as Record<string, { key: string; easing: EasingFunction }[]>);
  
  // Animation function
  const animateObject = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // Get the selected easing function
    const easingFn = (Easings as any)[selectedEasing];
    const easingFunc = typeof easingFn === 'function' ? easingFn : easingFn.function;
    
    // Apply easing to position
    const easedProgress = easingFunc(progress);
    
    // Calculate new position
    const newX = objectPosition.x + (targetPosition.x - objectPosition.x) * easedProgress;
    const newY = objectPosition.y + (targetPosition.y - objectPosition.y) * easedProgress;
    
    // Update object position
    setObjectPosition({ x: newX, y: newY });
    
    // Continue animation if not complete
    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animateObject);
    } else {
      setIsAnimating(false);
      startTimeRef.current = 0;
    }
  };
  
  // Start animation
  const startAnimation = () => {
    if (isAnimating) return;
    
    // Reset positions
    setObjectPosition({ x: 50, y: 200 });
    setIsAnimating(true);
    
    // Start animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    startTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animateObject);
  };
  
  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Update target position when preview is clicked
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current || isAnimating) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTargetPosition({ x, y });
  };
  
  return (
    <Container>
      <Title>Animation Interpolation Functions</Title>
      <Description>
        This example demonstrates the various easing and interpolation functions available in the physics
        animation system. Select a function to see it in action and experiment with different settings.
      </Description>
      
      <Controls>
        <ControlTitle>Animation Settings</ControlTitle>
        <ControlRow>
          <ControlLabel>Duration:</ControlLabel>
          <input
            type="range"
            min="100"
            max="3000"
            step="100"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          />
          <span>{(duration / 1000).toFixed(1)}s</span>
        </ControlRow>
        <ControlRow>
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            style={{
              background: isAnimating ? '#ccc' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: isAnimating ? 'default' : 'pointer'
            }}
          >
            {isAnimating ? 'Animating...' : 'Start Animation'}
          </button>
          <span style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
            Click anywhere in the preview to set the target position
          </span>
        </ControlRow>
      </Controls>
      
      <AnimationPreview ref={previewRef} onClick={handlePreviewClick}>
        <AnimationObject $left={objectPosition.x} $top={objectPosition.y} />
        {!isAnimating && (
          <div
            style={{
              position: 'absolute',
              left: targetPosition.x,
              top: targetPosition.y,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px dashed rgba(0, 0, 0, 0.3)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimationPreview>
      
      {categories.map(category => (
        <div key={category}>
          <CategoryHeading>
            {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Easing Functions
          </CategoryHeading>
          <EasingGrid>
            {easingsByCategory[category].map(({ key, easing }) => (
              <EasingCard
                key={key}
                $selected={selectedEasing === key}
                onClick={() => setSelectedEasing(key)}
              >
                <EasingName>{easing.name}</EasingName>
                <EasingDescription>{easing.description}</EasingDescription>
                <EasingPreview>
                  <EasingLine>
                    <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                      <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                      <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                      <line x1="0" y1="0" x2="0" y2="60" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                      <line x1="50" y1="0" x2="50" y2="60" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                      <line x1="100" y1="0" x2="100" y2="60" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                      
                      {/* Easing function path */}
                      <path
                        d={createEasingPath(easing, 100, 60)}
                        fill="none"
                        stroke={selectedEasing === key ? '#3b82f6' : '#64748b'}
                        strokeWidth="2"
                      />
                      
                      {/* Show dots at 0, 0.5, and 1 */}
                      <circle cx="0" cy="60" r="2" fill={selectedEasing === key ? '#3b82f6' : '#64748b'} />
                      <circle 
                        cx="50" 
                        cy={60 - easing.function(0.5) * 60} 
                        r="2" 
                        fill={selectedEasing === key ? '#3b82f6' : '#64748b'} 
                      />
                      <circle cx="100" cy="0" r="2" fill={selectedEasing === key ? '#3b82f6' : '#64748b'} />
                    </svg>
                  </EasingLine>
                  <IntensityBadge $intensity={easing.intensity}>
                    {['Very Mild', 'Mild', 'Moderate', 'Strong', 'Intense'][easing.intensity - 1]}
                  </IntensityBadge>
                </EasingPreview>
              </EasingCard>
            ))}
          </EasingGrid>
        </div>
      ))}
      
      <AdvancedControls>
        <AdvancedControlsTitle>Creating Custom Easing Functions</AdvancedControlsTitle>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p>The interpolation system provides several ways to create custom easing functions:</p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li><strong>Bezier Curves</strong>: <code>bezier(x1, y1, x2, y2)</code> - Create CSS-like cubic bezier curves</li>
            <li><strong>Spring Animations</strong>: <code>createSpringEasing(mass, stiffness, damping)</code> - Physically accurate spring motion</li>
            <li><strong>Compose Easings</strong>: <code>composeEasings([easing1, easing2], [0.5])</code> - Chain multiple easings together</li>
            <li><strong>Blend Easings</strong>: <code>blendEasings(easing1, easing2, 0.5)</code> - Interpolate between two easing functions</li>
            <li><strong>Steps</strong>: <code>steps(5)</code> - Create a step function with the specified number of steps</li>
          </ul>
          <p style={{ marginTop: '15px' }}>
            Example code:
          </p>
          <pre style={{ background: 'rgba(0, 0, 0, 0.05)', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { Easings, bezier, createSpringEasing } from 'galileo-glass-ui/animations/physics';

// Create a custom cubic-bezier function
const customBezier = bezier(0.2, -0.2, 0.8, 1.3);

// Create a physics-based spring animation
const bounceSpring = createSpringEasing(1, 80, 4, 0);

// Apply easing to a value
const easedValue = Easings.applyEasing(customBezier, progress, start, end);`}
          </pre>
        </div>
      </AdvancedControls>
    </Container>
  );
};

export default InterpolationFunctionsExample;