import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { 
  performanceMonitor,
  usePerformanceMonitoring,
  usePerformanceMetrics,
  useTimedFunction,
  PerformanceCategory,
  PerformanceSeverity,
  MonitoringScope
} from '../';

// Styled components for the demo
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

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const MetricsDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

const MetricValue = styled.div<{ $warning?: boolean; $critical?: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => {
    if (props.$critical) return '#e74c3c';
    if (props.$warning) return '#f39c12';
    return 'inherit';
  }};
`;

const IssuesSection = styled.div`
  margin-top: 30px;
`;

const IssuesList = styled.div`
  margin-top: 16px;
`;

const Issue = styled.div<{ $severity: PerformanceSeverity }>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.$severity) {
      case 'critical': return '#FFECEC';
      case 'high': return '#FFF5EC';
      case 'medium': return '#FFFBEC';
      case 'low': return '#F0F8FF';
      default: return '#F5F5F5';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#f1c40f';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  }};
`;

const IssueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const IssueDescription = styled.div`
  font-weight: 500;
`;

const IssueTime = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const IssueDetails = styled.div`
  font-size: 14px;
  margin-top: 8px;
`;

const IssueRecommendation = styled.div`
  font-size: 14px;
  margin-top: 8px;
  font-style: italic;
  color: #2c3e50;
`;

const DemoSection = styled.div`
  margin-top: 30px;
`;

const AnimationsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

// Performance demo component
const PerformanceMonitorDemo: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [animationCount, setAnimationCount] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  
  // Get current performance metrics
  const metrics = usePerformanceMetrics();
  
  // Use performance monitoring for this component
  const monitoring = usePerformanceMonitoring('PerformanceMonitorDemo', {
    trackInteractions: true,
    trackRenders: true,
    trackEffects: true
  });
  
  // Initialize monitoring on mount
  useEffect(() => {
    // Configure the monitor
    performanceMonitor.configure({
      enabled: true,
      monitoringInterval: 2000,
      verbose: true,
      autoDetectIssues: true,
      fpsWarningThreshold: 40,
      fpsErrorThreshold: 20
    });
    
    // Set up issue listener
    const removeIssueListener = performanceMonitor.addIssueListener(newIssues => {
      setIssues(prev => [...prev, ...newIssues]);
    });
    
    return () => {
      removeIssueListener();
    };
  }, []);
  
  // Toggle monitoring
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      performanceMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      performanceMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  }, [isMonitoring]);
  
  // Take a snapshot
  const takeSnapshot = useCallback(() => {
    monitoring.takeSnapshot();
  }, [monitoring]);
  
  // Clear issues
  const clearIssues = useCallback(() => {
    setIssues([]);
  }, []);
  
  // Time a function for simulating heavy work
  const doHeavyWork = useTimedFunction(() => {
    const startTime = performance.now();
    
    // Simulate heavy computation
    let result = 0;
    for (let i = 0; i < 5000000; i++) {
      result += Math.sqrt(i);
    }
    
    const endTime = performance.now();
    return endTime - startTime;
  }, 'heavyWork', PerformanceCategory.SCRIPT);
  
  // Simulate heavy work
  const simulateHeavyWork = useCallback(() => {
    setIsBusy(true);
    
    // Start a timer
    monitoring.startTimer('simulateHeavyWork', PerformanceCategory.SCRIPT);
    
    // Simulate multiple heavy tasks
    setTimeout(() => {
      const duration = doHeavyWork();
      
      setTimeout(() => {
        doHeavyWork();
        
        setTimeout(() => {
          doHeavyWork();
          
          // Stop the timer
          monitoring.stopTimer('simulateHeavyWork');
          setIsBusy(false);
          
          // Record an issue for demonstration
          monitoring.recordIssue({
            description: `Completed heavy work in ${duration.toFixed(0)}ms`,
            severity: duration > 500 ? PerformanceSeverity.HIGH : duration > 200 ? PerformanceSeverity.MEDIUM : PerformanceSeverity.LOW,
            category: PerformanceCategory.SCRIPT,
            recommendation: 'Consider moving intensive computations to a Web Worker'
          });
        }, 100);
      }, 100);
    }, 100);
  }, [monitoring, doHeavyWork]);
  
  // Toggle animations to create some load
  const toggleAnimation = useCallback(() => {
    if (animationCount > 0) {
      setAnimationCount(0);
    } else {
      setAnimationCount(10);
    }
  }, [animationCount]);
  
  // Add more animations to stress test
  const addMoreAnimations = useCallback(() => {
    setAnimationCount(prev => prev + 10);
  }, []);
  
  return (
    <DemoContainer>
      <Header>Performance Monitoring System</Header>
      
      <Controls>
        <Button onClick={toggleMonitoring}>
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
        
        <Button onClick={takeSnapshot}>
          Take Snapshot
        </Button>
        
        <Button onClick={simulateHeavyWork} disabled={isBusy}>
          {isBusy ? 'Processing...' : 'Simulate Heavy Work'}
        </Button>
        
        <Button onClick={toggleAnimation}>
          {animationCount > 0 ? 'Stop Animations' : 'Start Animations'}
        </Button>
        
        {animationCount > 0 && (
          <Button onClick={addMoreAnimations}>
            Add More Animations
          </Button>
        )}
        
        <Button onClick={clearIssues}>
          Clear Issues
        </Button>
      </Controls>
      
      <MetricsDisplay>
        <MetricCard>
          <MetricName>Frame Rate</MetricName>
          <MetricValue 
            $warning={metrics.fps && metrics.fps < 40}
            $critical={metrics.fps && metrics.fps < 20}
          >
            {metrics.fps ? `${metrics.fps.toFixed(1)} FPS` : 'N/A'}
          </MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>Memory Usage</MetricName>
          <MetricValue 
            $warning={metrics.memoryUsage && metrics.memoryUsage > 70}
            $critical={metrics.memoryUsage && metrics.memoryUsage > 90}
          >
            {metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(1)}%` : 'N/A'}
          </MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>DOM Nodes</MetricName>
          <MetricValue 
            $warning={metrics.domNodes && metrics.domNodes > 1000}
            $critical={metrics.domNodes && metrics.domNodes > 2000}
          >
            {metrics.domNodes || 'N/A'}
          </MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>Layout Operations</MetricName>
          <MetricValue 
            $warning={metrics.layoutOperations && metrics.layoutOperations > 30}
            $critical={metrics.layoutOperations && metrics.layoutOperations > 60}
          >
            {metrics.layoutOperations || 'N/A'}
          </MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>Performance Score</MetricName>
          <MetricValue 
            $warning={metrics.performanceScore && metrics.performanceScore < 70}
            $critical={metrics.performanceScore && metrics.performanceScore < 50}
          >
            {metrics.performanceScore ? `${metrics.performanceScore.toFixed(0)}/100` : 'N/A'}
          </MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricName>Active Issues</MetricName>
          <MetricValue 
            $warning={issues.length > 3}
            $critical={issues.length > 10}
          >
            {issues.length}
          </MetricValue>
        </MetricCard>
      </MetricsDisplay>
      
      {animationCount > 0 && (
        <DemoSection>
          <h2>Animations ({animationCount})</h2>
          <AnimationsContainer>
            {Array.from({ length: animationCount }).map((_, i) => (
              <AnimatedBox key={i} index={i} />
            ))}
          </AnimationsContainer>
        </DemoSection>
      )}
      
      <IssuesSection>
        <h2>Performance Issues</h2>
        
        {issues.length === 0 ? (
          <p>No performance issues detected yet.</p>
        ) : (
          <IssuesList>
            {issues.map(issue => (
              <Issue key={issue.id} $severity={issue.severity}>
                <IssueHeader>
                  <IssueDescription>{issue.description}</IssueDescription>
                  <IssueTime>
                    {new Date(issue.timestamp).toLocaleTimeString()}
                  </IssueTime>
                </IssueHeader>
                
                {issue.value !== undefined && issue.threshold !== undefined && (
                  <IssueDetails>
                    Value: {issue.value} {issue.unit} (Threshold: {issue.threshold} {issue.unit})
                  </IssueDetails>
                )}
                
                {issue.recommendation && (
                  <IssueRecommendation>
                    💡 {issue.recommendation}
                  </IssueRecommendation>
                )}
              </Issue>
            ))}
          </IssuesList>
        )}
      </IssuesSection>
    </DemoContainer>
  );
};

// Animation component to create load
const AnimatedBox: React.FC<{ index: number }> = ({ index }) => {
  // Use performance monitoring for animation
  usePerformanceMonitoring(`AnimatedBox-${index}`, {
    trackRenders: true,
    trackEffects: false
  });
  
  // Calculate animation delay and duration
  const delay = (index % 5) * 0.2;
  const duration = 2 + (index % 3);
  
  // Use more intensive animations for boxes with higher indexes
  const useComplex = index > 5;
  
  // Style with animation
  const boxStyle: React.CSSProperties = {
    width: '100%',
    height: '150px',
    borderRadius: '8px',
    backgroundColor: `hsl(${(index * 36) % 360}, 80%, 60%)`,
    animation: `animatedBox-${useComplex ? 'complex' : 'simple'} ${duration}s infinite alternate`,
    animationDelay: `${delay}s`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: useComplex ? '0 5px 15px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
    willChange: 'transform, opacity'
  };
  
  // Using keyframes in styled-components would be better in practice,
  // but for this demo we'll use dynamic styles
  return (
    <div style={boxStyle}>
      <style>
        {`
          @keyframes animatedBox-simple {
            0% { transform: translateX(0) scale(1); opacity: 1; }
            100% { transform: translateX(20px) scale(0.95); opacity: 0.8; }
          }
          
          @keyframes animatedBox-complex {
            0% { 
              transform: translateX(0) translateY(0) rotate(0deg) scale(1);
              filter: brightness(1) blur(0px);
              background-color: hsl(${(index * 36) % 360}, 80%, 60%);
            }
            25% {
              transform: translateX(10px) translateY(-5px) rotate(5deg) scale(0.95);
              filter: brightness(1.1) blur(1px);
              background-color: hsl(${((index * 36) + 20) % 360}, 80%, 60%);
            }
            50% {
              transform: translateX(20px) translateY(0px) rotate(0deg) scale(1);
              filter: brightness(1) blur(0px);
              background-color: hsl(${((index * 36) + 40) % 360}, 80%, 60%);
            }
            75% {
              transform: translateX(10px) translateY(5px) rotate(-5deg) scale(1.05);
              filter: brightness(0.9) blur(1px);
              background-color: hsl(${((index * 36) + 60) % 360}, 80%, 60%);
            }
            100% { 
              transform: translateX(0) translateY(0) rotate(0deg) scale(1);
              filter: brightness(1) blur(0px);
              background-color: hsl(${((index * 36) + 80) % 360}, 80%, 60%);
            }
          }
        `}
      </style>
      Box {index + 1}
    </div>
  );
};

export default PerformanceMonitorDemo;