import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import WaapiRenderer from '../WaapiRenderer';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
`;

const AnimationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 800px;
`;

const AnimationElement = styled.div`
  width: 100px;
  height: 100px;
  background-color: #2196f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const ControlPanel = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976d2;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const OptionsPanel = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
`;

const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const RangeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatusDisplay = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  width: 100%;
  max-width: 400px;
`;

/**
 * Example component demonstrating the WaapiRenderer
 */
const WaapiRendererExample: React.FC = () => {
  const translateRef = useRef<HTMLDivElement>(null);
  const rotateRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const complexRef = useRef<HTMLDivElement>(null);
  
  const [renderer] = useState(() => new WaapiRenderer());
  const [translateAnimation, setTranslateAnimation] = useState<string | null>(null);
  const [rotateAnimation, setRotateAnimation] = useState<string | null>(null);
  const [scaleAnimation, setScaleAnimation] = useState<string | null>(null);
  const [complexAnimation, setComplexAnimation] = useState<string | null>(null);
  
  const [duration, setDuration] = useState(1000);
  const [easing, setEasing] = useState('ease-in-out');
  const [iterations, setIterations] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fillMode, setFillMode] = useState<'none' | 'forwards' | 'backwards' | 'both'>('both');
  
  const [translateState, setTranslateState] = useState<string | null>(null);
  const [rotateState, setRotateState] = useState<string | null>(null);
  const [scaleState, setScaleState] = useState<string | null>(null);
  const [complexState, setComplexState] = useState<string | null>(null);
  
  // Function to start all animations
  const runAnimations = () => {
    // Cancel any existing animations
    if (translateAnimation) renderer.cancel(translateAnimation);
    if (rotateAnimation) renderer.cancel(rotateAnimation);
    if (scaleAnimation) renderer.cancel(scaleAnimation);
    if (complexAnimation) renderer.cancel(complexAnimation);
    
    // Translation animation
    if (translateRef.current) {
      const { id } = renderer.animate(
        translateRef.current,
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(200px)' },
          { transform: 'translateX(0)' }
        ],
        {
          duration,
          easing,
          iterations,
          fill: fillMode,
          playbackRate,
          onFinish: () => updateAnimationStates()
        }
      );
      setTranslateAnimation(id);
    }
    
    // Rotation animation
    if (rotateRef.current) {
      const { id } = renderer.animate(
        rotateRef.current,
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' }
        ],
        {
          duration,
          easing,
          iterations,
          fill: fillMode,
          playbackRate,
          onFinish: () => updateAnimationStates()
        }
      );
      setRotateAnimation(id);
    }
    
    // Scale animation
    if (scaleRef.current) {
      const { id } = renderer.animate(
        scaleRef.current,
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.5)' },
          { transform: 'scale(1)' }
        ],
        {
          duration,
          easing,
          iterations,
          fill: fillMode,
          playbackRate,
          onFinish: () => updateAnimationStates()
        }
      );
      setScaleAnimation(id);
    }
    
    // Complex animation
    if (complexRef.current) {
      const { id } = renderer.animate(
        complexRef.current,
        [
          { 
            transform: 'translateY(0) rotate(0deg) scale(1)',
            backgroundColor: '#2196f3',
            borderRadius: '8px'
          },
          { 
            transform: 'translateY(-100px) rotate(180deg) scale(0.8)',
            backgroundColor: '#e91e63',
            borderRadius: '50%'
          },
          { 
            transform: 'translateY(0) rotate(360deg) scale(1)',
            backgroundColor: '#2196f3',
            borderRadius: '8px'
          }
        ],
        {
          duration,
          easing,
          iterations,
          fill: fillMode,
          playbackRate,
          onFinish: () => updateAnimationStates()
        }
      );
      setComplexAnimation(id);
    }
    
    // Update animation states
    updateAnimationStates();
  };
  
  // Function to pause all animations
  const pauseAnimations = () => {
    if (translateAnimation) renderer.pause(translateAnimation);
    if (rotateAnimation) renderer.pause(rotateAnimation);
    if (scaleAnimation) renderer.pause(scaleAnimation);
    if (complexAnimation) renderer.pause(complexAnimation);
    updateAnimationStates();
  };
  
  // Function to resume all animations
  const resumeAnimations = () => {
    if (translateAnimation) renderer.play(translateAnimation);
    if (rotateAnimation) renderer.play(rotateAnimation);
    if (scaleAnimation) renderer.play(scaleAnimation);
    if (complexAnimation) renderer.play(complexAnimation);
    updateAnimationStates();
  };
  
  // Function to cancel all animations
  const cancelAnimations = () => {
    if (translateAnimation) renderer.cancel(translateAnimation);
    if (rotateAnimation) renderer.cancel(rotateAnimation);
    if (scaleAnimation) renderer.cancel(scaleAnimation);
    if (complexAnimation) renderer.cancel(complexAnimation);
    setTranslateAnimation(null);
    setRotateAnimation(null);
    setScaleAnimation(null);
    setComplexAnimation(null);
    updateAnimationStates();
  };
  
  // Function to reverse all animations
  const reverseAnimations = () => {
    if (translateAnimation) renderer.reverse(translateAnimation);
    if (rotateAnimation) renderer.reverse(rotateAnimation);
    if (scaleAnimation) renderer.reverse(scaleAnimation);
    if (complexAnimation) renderer.reverse(complexAnimation);
    updateAnimationStates();
  };
  
  // Update playback rate
  const updatePlaybackRate = (value: number) => {
    setPlaybackRate(value);
    if (translateAnimation) renderer.setPlaybackRate(translateAnimation, value);
    if (rotateAnimation) renderer.setPlaybackRate(rotateAnimation, value);
    if (scaleAnimation) renderer.setPlaybackRate(scaleAnimation, value);
    if (complexAnimation) renderer.setPlaybackRate(complexAnimation, value);
  };
  
  // Function to update animation states
  const updateAnimationStates = () => {
    setTranslateState(translateAnimation ? renderer.getState(translateAnimation) : null);
    setRotateState(rotateAnimation ? renderer.getState(rotateAnimation) : null);
    setScaleState(scaleAnimation ? renderer.getState(scaleAnimation) : null);
    setComplexState(complexAnimation ? renderer.getState(complexAnimation) : null);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      renderer.dispose();
    };
  }, [renderer]);
  
  return (
    <Container>
      <h1>Web Animations API Renderer Example</h1>
      <p>
        This example demonstrates the WaapiRenderer using the browser's native Web Animations API
        for high-performance animations. Try the different controls to see how they affect the animations.
      </p>
      
      <AnimationContainer>
        <div>
          <h3>Translate Animation</h3>
          <AnimationElement ref={translateRef}>Translate</AnimationElement>
        </div>
        
        <div>
          <h3>Rotate Animation</h3>
          <AnimationElement ref={rotateRef}>Rotate</AnimationElement>
        </div>
        
        <div>
          <h3>Scale Animation</h3>
          <AnimationElement ref={scaleRef}>Scale</AnimationElement>
        </div>
        
        <div>
          <h3>Complex Animation</h3>
          <AnimationElement ref={complexRef}>Complex</AnimationElement>
        </div>
      </AnimationContainer>
      
      <ControlPanel>
        <Button onClick={runAnimations}>Start Animations</Button>
        <Button 
          onClick={pauseAnimations} 
          disabled={!translateAnimation}
        >
          Pause
        </Button>
        <Button 
          onClick={resumeAnimations} 
          disabled={!translateAnimation}
        >
          Resume
        </Button>
        <Button 
          onClick={cancelAnimations} 
          disabled={!translateAnimation}
        >
          Cancel
        </Button>
        <Button 
          onClick={reverseAnimations} 
          disabled={!translateAnimation}
        >
          Reverse
        </Button>
      </ControlPanel>
      
      <OptionsPanel>
        <RangeGroup>
          <label htmlFor="duration">Duration: {duration}ms</label>
          <input 
            id="duration"
            type="range" 
            min="500" 
            max="5000" 
            step="100" 
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value))} 
          />
        </RangeGroup>
        
        <SelectGroup>
          <label htmlFor="easing">Easing:</label>
          <Select 
            id="easing"
            value={easing} 
            onChange={(e) => setEasing(e.target.value)}
          >
            <option value="linear">Linear</option>
            <option value="ease">Ease</option>
            <option value="ease-in">Ease In</option>
            <option value="ease-out">Ease Out</option>
            <option value="ease-in-out">Ease In Out</option>
            <option value="cubic-bezier(0.68, -0.55, 0.27, 1.55)">Spring-like</option>
            <option value="cubic-bezier(0.25, 0.1, 0.25, 1.0)">Standard</option>
          </Select>
        </SelectGroup>
        
        <SelectGroup>
          <label htmlFor="iterations">Iterations:</label>
          <Select 
            id="iterations"
            value={iterations.toString()} 
            onChange={(e) => setIterations(
              e.target.value === "Infinity" ? Infinity : parseInt(e.target.value)
            )}
          >
            <option value="1">Once</option>
            <option value="2">Twice</option>
            <option value="3">Three times</option>
            <option value="5">Five times</option>
            <option value="Infinity">Infinite</option>
          </Select>
        </SelectGroup>
        
        <RangeGroup>
          <label htmlFor="playbackRate">Playback Rate: {playbackRate.toFixed(1)}x</label>
          <input 
            id="playbackRate"
            type="range" 
            min="0.1" 
            max="3" 
            step="0.1" 
            value={playbackRate} 
            onChange={(e) => updatePlaybackRate(parseFloat(e.target.value))} 
          />
        </RangeGroup>
        
        <SelectGroup>
          <label htmlFor="fillMode">Fill Mode:</label>
          <Select 
            id="fillMode"
            value={fillMode} 
            onChange={(e) => setFillMode(
              e.target.value as 'none' | 'forwards' | 'backwards' | 'both'
            )}
          >
            <option value="none">None</option>
            <option value="forwards">Forwards</option>
            <option value="backwards">Backwards</option>
            <option value="both">Both</option>
          </Select>
        </SelectGroup>
      </OptionsPanel>
      
      <StatusDisplay>
        <h3>Animation States</h3>
        <p>Translate: {translateState || 'No animation'}</p>
        <p>Rotate: {rotateState || 'No animation'}</p>
        <p>Scale: {scaleState || 'No animation'}</p>
        <p>Complex: {complexState || 'No animation'}</p>
        <p>
          <strong>WAAPI Support: </strong>
          {WaapiRenderer.isSupported() ? 'Supported' : 'Not supported (using fallback)'}
        </p>
      </StatusDisplay>
    </Container>
  );
};

export default WaapiRendererExample;