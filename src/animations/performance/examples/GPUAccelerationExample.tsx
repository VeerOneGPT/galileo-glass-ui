import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { 
  AnimationComplexity,
  gpuAccelerationManager,
  getGPUAccelerationCSS,
  getOptimizedGPUAcceleration,
  useGPUAcceleration,
  analyzeElementComplexity
} from '../GPUAcceleration';
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../../../utils/deviceCapabilities';

// Styled containers for the demo
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, sans-serif;
`;

const Header = styled.h1`
  margin-bottom: 20px;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2980b9;
  }
`;

const DemoSection = styled.div`
  margin-top: 30px;
`;

const MetricsDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin: 20px 0;
`;

const MetricCard = styled.div`
  padding: 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const MetricName = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const DemoItems = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

// Base element for the different animation types
interface AnimatedItemProps {
  isOptimized?: boolean;
  complexity?: AnimationComplexity;
  background?: string;
}

const AnimatedItem = styled.div.attrs<AnimatedItemProps>(props => ({
  style: props.isOptimized ? getOptimizedGPUAcceleration(props.complexity || AnimationComplexity.MINIMAL) : {}
}))<AnimatedItemProps>`
  height: 200px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  background: ${props => props.background || 'linear-gradient(135deg, #3498db, #8e44ad)'};
`;

// Different animation complexity examples
const BasicAnimation = styled(AnimatedItem)`
  animation: basic-animation 2s infinite alternate;
  
  @keyframes basic-animation {
    0% { transform: translateX(0); }
    100% { transform: translateX(30px); }
  }
`;

const MediumAnimation = styled(AnimatedItem)`
  animation: medium-animation 3s infinite alternate;
  
  @keyframes medium-animation {
    0% { 
      transform: translateX(0) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateX(20px) scale(0.95);
      opacity: 0.9;
    }
    100% { 
      transform: translateX(40px) scale(1.05);
      opacity: 1;
    }
  }
`;

const ComplexAnimation = styled(AnimatedItem)`
  animation: complex-animation 4s infinite alternate;
  
  @keyframes complex-animation {
    0% { 
      transform: translateX(0) translateY(0) rotate(0deg) scale(1);
      filter: brightness(1);
      background-position: 0% 0%;
    }
    25% {
      transform: translateX(20px) translateY(-10px) rotate(5deg) scale(0.95);
      filter: brightness(1.1);
      background-position: 25% 0%;
    }
    50% {
      transform: translateX(40px) translateY(0px) rotate(0deg) scale(1);
      filter: brightness(1);
      background-position: 50% 0%;
    }
    75% {
      transform: translateX(20px) translateY(10px) rotate(-5deg) scale(1.05);
      filter: brightness(0.9);
      background-position: 75% 0%;
    }
    100% { 
      transform: translateX(0) translateY(0) rotate(0deg) scale(1);
      filter: brightness(1);
      background-position: 100% 0%;
    }
  }
`;

const VeryComplexAnimation = styled(AnimatedItem)`
  animation: very-complex-animation 5s infinite alternate;
  background: linear-gradient(135deg, #3498db, #8e44ad, #e74c3c, #f39c12);
  background-size: 400% 400%;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.2) 100%);
    animation: pulse 3s infinite alternate;
  }
  
  @keyframes very-complex-animation {
    0% { 
      transform: translateX(0) translateY(0) rotate(0deg) scale(1) perspective(500px) rotateX(0deg);
      filter: brightness(1) blur(0px);
      background-position: 0% 0%;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    25% {
      transform: translateX(20px) translateY(-15px) rotate(5deg) scale(0.95) perspective(500px) rotateX(10deg);
      filter: brightness(1.2) blur(1px);
      background-position: 30% 10%;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    }
    50% {
      transform: translateX(40px) translateY(0px) rotate(0deg) scale(1) perspective(500px) rotateX(0deg);
      filter: brightness(1) blur(0px);
      background-position: 60% 50%;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    75% {
      transform: translateX(20px) translateY(15px) rotate(-5deg) scale(1.05) perspective(500px) rotateX(-10deg);
      filter: brightness(0.8) blur(1px);
      background-position: 30% 90%;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    }
    100% { 
      transform: translateX(0) translateY(0) rotate(0deg) scale(1) perspective(500px) rotateX(0deg);
      filter: brightness(1) blur(0px);
      background-position: 0% 0%;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
  }
  
  @keyframes pulse {
    0% { opacity: 0.4; }
    100% { opacity: 0.8; }
  }
`;

// GPU Acceleration Example Component
const GPUAccelerationExample: React.FC = () => {
  // State for controls
  const [complexity, setComplexity] = useState<AnimationComplexity>(AnimationComplexity.MEDIUM);
  const [isOptimized, setIsOptimized] = useState(true);
  const [deviceTier, setDeviceTier] = useState<DeviceCapabilityTier | null>(null);
  
  // Refs for animation performance measurement
  const basicAnimRef = useRef<HTMLDivElement>(null);
  const mediumAnimRef = useRef<HTMLDivElement>(null);
  const complexAnimRef = useRef<HTMLDivElement>(null);
  const veryComplexAnimRef = useRef<HTMLDivElement>(null);
  
  // Performance metrics
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    animatingElements: 0,
  });
  
  // Register elements with GPU acceleration manager
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get device tier
      setDeviceTier(getDeviceCapabilityTier());
      
      // Register elements for acceleration if optimization is enabled
      if (isOptimized) {
        if (basicAnimRef.current) {
          gpuAccelerationManager.registerElement(basicAnimRef.current, {
            complexity: AnimationComplexity.MINIMAL,
            adaptToDevice: true,
          });
          gpuAccelerationManager.markElementAsAnimating(basicAnimRef.current, true);
        }
        
        if (mediumAnimRef.current) {
          gpuAccelerationManager.registerElement(mediumAnimRef.current, {
            complexity: AnimationComplexity.LOW,
            adaptToDevice: true,
          });
          gpuAccelerationManager.markElementAsAnimating(mediumAnimRef.current, true);
        }
        
        if (complexAnimRef.current) {
          gpuAccelerationManager.registerElement(complexAnimRef.current, {
            complexity: AnimationComplexity.HIGH,
            adaptToDevice: true,
          });
          gpuAccelerationManager.markElementAsAnimating(complexAnimRef.current, true);
        }
        
        if (veryComplexAnimRef.current) {
          gpuAccelerationManager.registerElement(veryComplexAnimRef.current, {
            complexity: AnimationComplexity.EXTREME,
            adaptToDevice: true,
          });
          gpuAccelerationManager.markElementAsAnimating(veryComplexAnimRef.current, true);
        }
      }
      
      // Start performance monitoring
      const interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(calculateFps()),
          animatingElements: document.querySelectorAll('[style*="animation"]').length,
          // Memory usage estimation (not accurate in all browsers)
          memoryUsage: window.performance && (window.performance as any).memory ? 
            Math.round(((window.performance as any).memory.usedJSHeapSize / (window.performance as any).memory.jsHeapSizeLimit) * 100) :
            prev.memoryUsage,
        }));
      }, 1000);
      
      return () => {
        // Clean up
        clearInterval(interval);
        
        // Unregister elements
        if (isOptimized) {
          if (basicAnimRef.current) gpuAccelerationManager.unregisterElement(basicAnimRef.current);
          if (mediumAnimRef.current) gpuAccelerationManager.unregisterElement(mediumAnimRef.current);
          if (complexAnimRef.current) gpuAccelerationManager.unregisterElement(complexAnimRef.current);
          if (veryComplexAnimRef.current) gpuAccelerationManager.unregisterElement(veryComplexAnimRef.current);
        }
      };
    }
  }, [isOptimized]);
  
  // FPS calculation
  const lastFrameTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  
  const calculateFps = () => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    return 1000 / avgFrameTime;
  };
  
  // Toggle optimization
  const toggleOptimization = () => {
    setIsOptimized(!isOptimized);
  };
  
  // Analyze animations
  const analyzeAnimations = () => {
    if (typeof window !== 'undefined') {
      // Get all animated elements and analyze their complexity
      const animatedElements = document.querySelectorAll('[style*="animation"]');
      console.log(`Found ${animatedElements.length} animated elements`);
      
      animatedElements.forEach((el, index) => {
        const complexity = analyzeElementComplexity(el as HTMLElement);
        console.log(`Element ${index}: Complexity ${complexity}`);
      });
    }
  };
  
  // Helper for device tier display
  const getDeviceTierLabel = (tier: DeviceCapabilityTier | null) => {
    if (!tier) return 'Unknown';
    
    switch (tier) {
      case DeviceCapabilityTier.ULTRA: return 'Ultra (High-End Desktop/Laptop)';
      case DeviceCapabilityTier.HIGH: return 'High (Modern Desktop/Laptop)';
      case DeviceCapabilityTier.MEDIUM: return 'Medium (Average Laptop/High-End Mobile)';
      case DeviceCapabilityTier.LOW: return 'Low (Lower-End Mobile)';
      case DeviceCapabilityTier.MINIMAL: return 'Minimal (Very Low-End Device)';
      default: return tier;
    }
  };
  
  return (
    <DemoContainer>
      <Header>GPU Acceleration Hinting System</Header>
      
      <Controls>
        <ControlGroup>
          <Label>Animation Complexity</Label>
          <Select 
            value={complexity}
            onChange={(e) => setComplexity(parseInt(e.target.value) as AnimationComplexity)}
          >
            <option value={AnimationComplexity.MINIMAL}>Minimal</option>
            <option value={AnimationComplexity.LOW}>Low</option>
            <option value={AnimationComplexity.MEDIUM}>Medium</option>
            <option value={AnimationComplexity.HIGH}>High</option>
            <option value={AnimationComplexity.EXTREME}>Extreme</option>
          </Select>
        </ControlGroup>
        
        <ControlGroup>
          <Label>Optimization</Label>
          <Button onClick={toggleOptimization}>
            {isOptimized ? 'Disable Optimization' : 'Enable Optimization'}
          </Button>
        </ControlGroup>
        
        <ControlGroup>
          <Label>Analysis</Label>
          <Button onClick={analyzeAnimations}>
            Analyze Animations
          </Button>
        </ControlGroup>
      </Controls>
      
      <MetricsDisplay>
        <MetricCard>
          <MetricName>Device Tier</MetricName>
          <MetricValue>{getDeviceTierLabel(deviceTier)}</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>Estimated FPS</MetricName>
          <MetricValue>{metrics.fps}</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>Memory Usage</MetricName>
          <MetricValue>{metrics.memoryUsage}%</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>Animating Elements</MetricName>
          <MetricValue>{metrics.animatingElements}</MetricValue>
        </MetricCard>
      </MetricsDisplay>
      
      <DemoSection>
        <h2>Animation Complexity Examples</h2>
        <DemoItems>
          <div>
            <h3>Minimal Complexity</h3>
            <p>Simple translation animation</p>
            <BasicAnimation 
              ref={basicAnimRef}
              complexity={AnimationComplexity.MINIMAL}
              isOptimized={isOptimized}
            >
              Minimal Complexity
            </BasicAnimation>
          </div>
          
          <div>
            <h3>Low Complexity</h3>
            <p>Translation, scale, and opacity</p>
            <MediumAnimation 
              ref={mediumAnimRef}
              complexity={AnimationComplexity.LOW}
              isOptimized={isOptimized}
            >
              Low Complexity
            </MediumAnimation>
          </div>
          
          <div>
            <h3>High Complexity</h3>
            <p>Multiple transforms and filters</p>
            <ComplexAnimation 
              ref={complexAnimRef}
              complexity={AnimationComplexity.HIGH}
              isOptimized={isOptimized}
            >
              High Complexity
            </ComplexAnimation>
          </div>
          
          <div>
            <h3>Extreme Complexity</h3>
            <p>3D transforms, filters, backgrounds, pseudo-elements</p>
            <VeryComplexAnimation 
              ref={veryComplexAnimRef}
              complexity={AnimationComplexity.EXTREME}
              isOptimized={isOptimized}
            >
              Extreme Complexity
            </VeryComplexAnimation>
          </div>
        </DemoItems>
      </DemoSection>
      
      <DemoSection>
        <h2>Optimization Impact</h2>
        <p>
          This demo showcases the GPU acceleration hinting system's impact on performance.
          When optimization is enabled, animations are analyzed and appropriate GPU acceleration
          hints are applied based on:
        </p>
        <ul>
          <li>Animation complexity (properties being animated)</li>
          <li>Device capability tier (hardware performance level)</li>
          <li>Real-time performance metrics (FPS, memory usage)</li>
          <li>Animation characteristics (frequency, duration)</li>
        </ul>
        <p>
          The system automatically adapts to your device's capabilities, applying more
          aggressive optimizations on high-end devices and reducing hints on lower-end devices
          to prevent GPU memory issues.
        </p>
      </DemoSection>
    </DemoContainer>
  );
};

export default GPUAccelerationExample;