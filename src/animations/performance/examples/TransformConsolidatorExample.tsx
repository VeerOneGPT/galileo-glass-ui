import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { transformConsolidator, TransformType } from '../TransformConsolidator';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
`;

const DemoSection = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`;

const BoxContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
  justify-content: center;
`;

const Box = styled.div`
  width: 100px;
  height: 100px;
  background-color: #3f51b5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ComparisonSection = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ComparisonPanel = styled.div`
  flex: 1;
  min-width: 300px;
  padding: 1rem;
  border-radius: 4px;
  
  &.consolidated {
    background-color: #e8eaf6;
  }
  
  &.unconsolidated {
    background-color: #ffebee;
  }
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #303f9f;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const MetricsPanel = styled.div`
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  width: 100%;
  max-width: 800px;
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 300px;
`;

const Label = styled.label`
  font-weight: bold;
`;

const Slider = styled.input`
  width: 100%;
`;

const TransformDisplay = styled.div`
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  width: 100%;
  max-width: 800px;
  overflow-x: auto;
  white-space: pre-wrap;
`;

/**
 * Example component demonstrating the Transform Consolidator
 */
const TransformConsolidatorExample: React.FC = () => {
  const consolidatedBoxRef = useRef<HTMLDivElement>(null);
  const unconsolidatedBoxRef = useRef<HTMLDivElement>(null);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [consolidatedTransform, setConsolidatedTransform] = useState('');
  const [unconsolidatedTransform, setUnconsolidatedTransform] = useState('');
  
  // Transform parameters
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  
  // Reset transforms
  const resetTransforms = () => {
    setTranslateX(0);
    setTranslateY(0);
    setScale(1);
    setRotate(0);
    
    if (consolidatedBoxRef.current) {
      transformConsolidator.resetTransforms(consolidatedBoxRef.current, { immediateRender: true });
      setConsolidatedTransform('');
    }
    
    if (unconsolidatedBoxRef.current) {
      // Reset unconsolidated box
      unconsolidatedBoxRef.current.style.transform = '';
      setUnconsolidatedTransform('');
    }
  };
  
  // Apply transforms based on current parameters
  const applyTransforms = () => {
    if (consolidatedBoxRef.current && unconsolidatedBoxRef.current) {
      // Apply consolidated transforms using the consolidator
      transformConsolidator.translate(
        consolidatedBoxRef.current,
        translateX,
        translateY,
        'px',
        { 
          clearExisting: true,
          immediateRender: true
        }
      );
      
      transformConsolidator.scale(
        consolidatedBoxRef.current,
        scale,
        scale,
        { immediateRender: true }
      );
      
      transformConsolidator.rotate(
        consolidatedBoxRef.current,
        rotate,
        'deg',
        { immediateRender: true }
      );
      
      // Get the consolidated transform string
      const state = transformConsolidator.getTransformState(consolidatedBoxRef.current);
      setConsolidatedTransform(state?.lastTransformString || '');
      
      // Apply unconsolidated transforms directly
      const translateTransform = `translate(${translateX}px, ${translateY}px)`;
      const scaleTransform = `scale(${scale}, ${scale})`;
      const rotateTransform = `rotate(${rotate}deg)`;
      
      // Apply each transform separately to simulate unconsolidated transforms
      unconsolidatedBoxRef.current.style.transform = `${translateTransform} ${scaleTransform} ${rotateTransform}`;
      setUnconsolidatedTransform(`${translateTransform} ${scaleTransform} ${rotateTransform}`);
    }
  };
  
  // Apply transforms when parameters change
  useEffect(() => {
    applyTransforms();
  }, [translateX, translateY, scale, rotate]);
  
  // Start simple animation
  const startSimpleAnimation = () => {
    setIsAnimating(true);
    
    let frame = 0;
    const maxFrames = 120;
    const animationDuration = 2000; // 2 seconds
    const frameTime = animationDuration / maxFrames;
    
    const animateFrame = () => {
      if (frame >= maxFrames) {
        setIsAnimating(false);
        return;
      }
      
      const progress = frame / maxFrames;
      const easedProgress = easeInOut(progress);
      
      // Update transform parameters
      setTranslateX(Math.sin(easedProgress * Math.PI * 2) * 100);
      setTranslateY(Math.cos(easedProgress * Math.PI * 2) * 50);
      setScale(0.8 + Math.sin(easedProgress * Math.PI * 4) * 0.3);
      setRotate(easedProgress * 360);
      
      frame++;
      setTimeout(animateFrame, frameTime);
    };
    
    animateFrame();
  };
  
  // Start complex animation
  const startComplexAnimation = () => {
    setIsAnimating(true);
    
    let frame = 0;
    const maxFrames = 240;
    const animationDuration = 4000; // 4 seconds
    const frameTime = animationDuration / maxFrames;
    
    const animateFrame = () => {
      if (frame >= maxFrames) {
        setIsAnimating(false);
        return;
      }
      
      const progress = frame / maxFrames;
      const easedProgress = easeInOut(progress);
      
      // More complex transform parameters
      setTranslateX(Math.sin(easedProgress * Math.PI * 4) * 100);
      setTranslateY(Math.cos(easedProgress * Math.PI * 3) * 50);
      setScale(0.5 + Math.sin(easedProgress * Math.PI * 8) * 0.5 + 0.5);
      setRotate(easedProgress * 720);
      
      frame++;
      setTimeout(animateFrame, frameTime);
    };
    
    animateFrame();
  };
  
  // Easing function
  const easeInOut = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };
  
  // Apply a specific preset
  const applyPreset = (preset: 'flipHorizontal' | 'flipVertical' | 'zoomIn' | 'zoomOut') => {
    if (consolidatedBoxRef.current && unconsolidatedBoxRef.current) {
      // Reset first
      resetTransforms();
      
      // Apply preset to the consolidated box
      transformConsolidator.applyPreset(
        consolidatedBoxRef.current,
        preset,
        { immediateRender: true }
      );
      
      // Get the consolidated transform string
      const state = transformConsolidator.getTransformState(consolidatedBoxRef.current);
      setConsolidatedTransform(state?.lastTransformString || '');
      
      // Apply equivalent transforms manually to the unconsolidated box
      switch (preset) {
        case 'flipHorizontal':
          unconsolidatedBoxRef.current.style.transform = 'rotate3d(0, 1, 0, 180deg)';
          setUnconsolidatedTransform('rotate3d(0, 1, 0, 180deg)');
          break;
        case 'flipVertical':
          unconsolidatedBoxRef.current.style.transform = 'rotate3d(1, 0, 0, 180deg)';
          setUnconsolidatedTransform('rotate3d(1, 0, 0, 180deg)');
          break;
        case 'zoomIn':
          unconsolidatedBoxRef.current.style.transform = 'scale(1, 1)';
          setUnconsolidatedTransform('scale(1, 1)');
          break;
        case 'zoomOut':
          unconsolidatedBoxRef.current.style.transform = 'scale(0, 0)';
          setUnconsolidatedTransform('scale(0, 0)');
          break;
      }
    }
  };
  
  return (
    <Container>
      <h1>Transform Consolidator Example</h1>
      <p>
        This example demonstrates how the Transform Consolidator can improve performance
        by consolidating transform operations and optimizing their order for hardware
        acceleration.
      </p>
      
      <ComparisonSection>
        <ComparisonPanel className="consolidated">
          <h2>Consolidated Transforms</h2>
          <p>
            This box uses the Transform Consolidator to manage and optimize transforms,
            reducing repaints and improving performance.
          </p>
          
          <Box ref={consolidatedBoxRef}>
            Consolidated
          </Box>
          
          <TransformDisplay>
            <strong>Applied Transform:</strong>
            <br />
            {consolidatedTransform || 'None'}
          </TransformDisplay>
        </ComparisonPanel>
        
        <ComparisonPanel className="unconsolidated">
          <h2>Unconsolidated Transforms</h2>
          <p>
            This box applies transforms directly without optimization,
            potentially causing more repaints and reduced performance.
          </p>
          
          <Box ref={unconsolidatedBoxRef}>
            Unconsolidated
          </Box>
          
          <TransformDisplay>
            <strong>Applied Transform:</strong>
            <br />
            {unconsolidatedTransform || 'None'}
          </TransformDisplay>
        </ComparisonPanel>
      </ComparisonSection>
      
      <ControlPanel>
        <Button 
          onClick={startSimpleAnimation}
          disabled={isAnimating}
        >
          Simple Animation
        </Button>
        <Button 
          onClick={startComplexAnimation}
          disabled={isAnimating}
        >
          Complex Animation
        </Button>
        <Button 
          onClick={() => applyPreset('flipHorizontal')}
          disabled={isAnimating}
        >
          Flip Horizontal
        </Button>
        <Button 
          onClick={() => applyPreset('flipVertical')}
          disabled={isAnimating}
        >
          Flip Vertical
        </Button>
        <Button 
          onClick={resetTransforms}
          disabled={isAnimating}
        >
          Reset
        </Button>
      </ControlPanel>
      
      <DemoSection>
        <h2>Manual Transforms</h2>
        <p>
          Adjust the sliders to manually apply transforms and see how they are
          consolidated and optimized.
        </p>
        
        <SliderContainer>
          <Label>TranslateX: {translateX}px</Label>
          <Slider 
            type="range" 
            min="-100" 
            max="100" 
            value={translateX} 
            onChange={(e) => setTranslateX(parseInt(e.target.value))}
            disabled={isAnimating}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>TranslateY: {translateY}px</Label>
          <Slider 
            type="range" 
            min="-100" 
            max="100" 
            value={translateY} 
            onChange={(e) => setTranslateY(parseInt(e.target.value))}
            disabled={isAnimating}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>Scale: {scale.toFixed(2)}</Label>
          <Slider 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.01" 
            value={scale} 
            onChange={(e) => setScale(parseFloat(e.target.value))}
            disabled={isAnimating}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>Rotate: {rotate}°</Label>
          <Slider 
            type="range" 
            min="0" 
            max="360" 
            value={rotate} 
            onChange={(e) => setRotate(parseInt(e.target.value))}
            disabled={isAnimating}
          />
        </SliderContainer>
      </DemoSection>
      
      <MetricsPanel>
        <h2>Key Benefits of Transform Consolidation</h2>
        <ul>
          <li>
            <strong>Optimized Transform Order:</strong> Transforms are arranged in an order that
            maximizes hardware acceleration and minimizes layout reflow.
          </li>
          <li>
            <strong>Reduced Repaints:</strong> Multiple transform operations are batched into a single
            update, reducing the number of repaints.
          </li>
          <li>
            <strong>Automatic Hardware Acceleration:</strong> 3D transforms are automatically
            applied to enable GPU acceleration when possible.
          </li>
          <li>
            <strong>Transform Management:</strong> Transform state is tracked and managed,
            allowing for more complex and efficient transform operations.
          </li>
        </ul>
        
        <h3>When to use Transform Consolidator</h3>
        <ul>
          <li>When applying multiple transforms to an element</li>
          <li>For performant animations involving transforms</li>
          <li>When you need hardware acceleration for smoother animations</li>
          <li>For complex UI with many transformed elements</li>
        </ul>
      </MetricsPanel>
    </Container>
  );
};

export default TransformConsolidatorExample;