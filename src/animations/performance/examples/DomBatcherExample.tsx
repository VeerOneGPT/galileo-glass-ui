import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { domBatcher, BatchPriority } from '../DomBatcher';

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
  flex-wrap: wrap;
  gap: 8px;
  margin: 1rem 0;
`;

const Box = styled.div`
  width: 50px;
  height: 50px;
  background-color: #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #1976d2;
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
  
  &.batched {
    background-color: #e3f2fd;
  }
  
  &.unbatched {
    background-color: #ffebee;
  }
`;

/**
 * Example component demonstrating the DOM Batcher
 */
const DomBatcherExample: React.FC = () => {
  const [batchedBoxes, setBatchedBoxes] = useState<number[]>([]);
  const [unbatchedBoxes, setUnbatchedBoxes] = useState<number[]>([]);
  const [metrics, setMetrics] = useState(domBatcher.getMetrics());
  const [isRunning, setIsRunning] = useState(false);
  
  // Performance metrics
  const batchedTimeRef = useRef<number[]>([]);
  const unbatchedTimeRef = useRef<number[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    batched: {
      totalTime: 0,
      averageTime: 0,
      operations: 0,
      fps: 0
    },
    unbatched: {
      totalTime: 0,
      averageTime: 0,
      operations: 0,
      fps: 0
    }
  });
  
  // Refs for performance measurement
  const frameCountRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const fpsRef = useRef(0);
  
  // Measure FPS
  useEffect(() => {
    let frameId: number;
    
    const updateFps = (timestamp: number) => {
      // Skip first frame
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
        frameId = requestAnimationFrame(updateFps);
        return;
      }
      
      // Calculate FPS
      frameCountRef.current++;
      const elapsed = timestamp - lastTimestampRef.current;
      
      // Update FPS every second
      if (elapsed >= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / elapsed);
        frameCountRef.current = 0;
        lastTimestampRef.current = timestamp;
        
        // Update metrics
        setPerformanceMetrics(prev => ({
          ...prev,
          batched: {
            ...prev.batched,
            fps: isRunning ? fpsRef.current : prev.batched.fps
          },
          unbatched: {
            ...prev.unbatched,
            fps: isRunning ? fpsRef.current : prev.unbatched.fps
          }
        }));
      }
      
      frameId = requestAnimationFrame(updateFps);
    };
    
    frameId = requestAnimationFrame(updateFps);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isRunning]);
  
  // Update DOM batcher metrics
  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        setMetrics(domBatcher.getMetrics());
      }, 1000);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isRunning]);
  
  // Generate new boxes with batched DOM operations
  const addBatchedBoxes = async () => {
    setIsRunning(true);
    setBatchedBoxes([]);
    
    const startTime = performance.now();
    
    // Create 100 boxes with batched operations
    const newBoxes = Array.from({ length: 100 }, (_, i) => i);
    setBatchedBoxes(newBoxes);
    
    // Wait for next frame to ensure the boxes are rendered
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Apply a bunch of style changes using the batcher
    for (let i = 0; i < 100; i++) {
      const boxElement = document.getElementById(`batched-box-${i}`);
      if (boxElement) {
        // Schedule different operations with different priorities
        if (i % 3 === 0) {
          domBatcher.style(
            boxElement as HTMLElement,
            'backgroundColor',
            getRandomColor(),
            BatchPriority.HIGH
          );
        } else if (i % 3 === 1) {
          domBatcher.batchStyles(
            boxElement as HTMLElement,
            {
              backgroundColor: getRandomColor(),
              borderRadius: `${Math.random() * 20}px`,
              transform: `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`
            },
            BatchPriority.NORMAL
          );
        } else {
          domBatcher.transform(
            boxElement as HTMLElement,
            `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`,
            BatchPriority.LOW
          );
          
          domBatcher.batchAttributes(
            boxElement,
            {
              'data-modified': 'true',
              'aria-label': `Modified box ${i}`
            }
          );
        }
      }
    }
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    batchedTimeRef.current.push(operationTime);
    
    // Update performance metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      batched: {
        ...prev.batched,
        totalTime: batchedTimeRef.current.reduce((a, b) => a + b, 0),
        averageTime: batchedTimeRef.current.reduce((a, b) => a + b, 0) / batchedTimeRef.current.length,
        operations: batchedTimeRef.current.length
      }
    }));
  };
  
  // Generate new boxes with unbatched DOM operations
  const addUnbatchedBoxes = async () => {
    setIsRunning(true);
    setUnbatchedBoxes([]);
    
    const startTime = performance.now();
    
    // Create 100 boxes with unbatched operations
    const newBoxes = Array.from({ length: 100 }, (_, i) => i);
    setUnbatchedBoxes(newBoxes);
    
    // Wait for next frame to ensure the boxes are rendered
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Apply a bunch of style changes directly (causing layout thrashing)
    for (let i = 0; i < 100; i++) {
      const boxElement = document.getElementById(`unbatched-box-${i}`);
      if (boxElement) {
        if (i % 3 === 0) {
          (boxElement as HTMLElement).style.backgroundColor = getRandomColor();
        } else if (i % 3 === 1) {
          (boxElement as HTMLElement).style.backgroundColor = getRandomColor();
          (boxElement as HTMLElement).style.borderRadius = `${Math.random() * 20}px`;
          (boxElement as HTMLElement).style.transform = `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`;
        } else {
          (boxElement as HTMLElement).style.transform = `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`;
          boxElement.setAttribute('data-modified', 'true');
          boxElement.setAttribute('aria-label', `Modified box ${i}`);
        }
        
        // Force layout recalculation (layout thrashing)
        boxElement.getBoundingClientRect();
      }
    }
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    unbatchedTimeRef.current.push(operationTime);
    
    // Update performance metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      unbatched: {
        ...prev.unbatched,
        totalTime: unbatchedTimeRef.current.reduce((a, b) => a + b, 0),
        averageTime: unbatchedTimeRef.current.reduce((a, b) => a + b, 0) / unbatchedTimeRef.current.length,
        operations: unbatchedTimeRef.current.length
      }
    }));
  };
  
  // Reset the example
  const resetExample = () => {
    setIsRunning(false);
    setBatchedBoxes([]);
    setUnbatchedBoxes([]);
    domBatcher.resetMetrics();
    setMetrics(domBatcher.getMetrics());
    batchedTimeRef.current = [];
    unbatchedTimeRef.current = [];
    setPerformanceMetrics({
      batched: {
        totalTime: 0,
        averageTime: 0,
        operations: 0,
        fps: 0
      },
      unbatched: {
        totalTime: 0,
        averageTime: 0,
        operations: 0,
        fps: 0
      }
    });
  };
  
  // Run stress test
  const runStressTest = async () => {
    resetExample();
    setIsRunning(true);
    
    // Alternately run batched and unbatched operations
    for (let i = 0; i < 5; i++) {
      await addBatchedBoxes();
      await new Promise(resolve => setTimeout(resolve, 500));
      await addUnbatchedBoxes();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };
  
  // Generate a random color
  const getRandomColor = () => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#9e9e9e', '#607d8b'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <Container>
      <h1>DOM Batcher Example</h1>
      <p>
        This example demonstrates how the DOM Batcher can improve performance by batching
        DOM operations and reducing layout thrashing. Compare the performance between
        batched and unbatched operations.
      </p>
      
      <ControlPanel>
        <Button onClick={addBatchedBoxes} disabled={isRunning}>
          Run Batched Operations
        </Button>
        <Button onClick={addUnbatchedBoxes} disabled={isRunning}>
          Run Unbatched Operations
        </Button>
        <Button onClick={runStressTest} disabled={isRunning}>
          Run Stress Test
        </Button>
        <Button onClick={resetExample} disabled={isRunning}>
          Reset
        </Button>
      </ControlPanel>
      
      <ComparisonSection>
        <ComparisonPanel className="batched">
          <h2>Batched DOM Operations</h2>
          <p>
            These boxes are manipulated using the DomBatcher, which batches operations
            to minimize layout thrashing and optimize performance.
          </p>
          
          <BoxContainer>
            {batchedBoxes.map((i) => (
              <Box key={`batched-${i}`} id={`batched-box-${i}`}>
                {i + 1}
              </Box>
            ))}
          </BoxContainer>
          
          <div>
            <h3>Performance Metrics</h3>
            <p>Average operation time: {performanceMetrics.batched.averageTime.toFixed(2)}ms</p>
            <p>FPS during operation: {performanceMetrics.batched.fps}</p>
            <p>Total operations: {performanceMetrics.batched.operations}</p>
          </div>
        </ComparisonPanel>
        
        <ComparisonPanel className="unbatched">
          <h2>Unbatched DOM Operations</h2>
          <p>
            These boxes are manipulated directly, causing layout thrashing and potentially
            impacting performance.
          </p>
          
          <BoxContainer>
            {unbatchedBoxes.map((i) => (
              <Box key={`unbatched-${i}`} id={`unbatched-box-${i}`}>
                {i + 1}
              </Box>
            ))}
          </BoxContainer>
          
          <div>
            <h3>Performance Metrics</h3>
            <p>Average operation time: {performanceMetrics.unbatched.averageTime.toFixed(2)}ms</p>
            <p>FPS during operation: {performanceMetrics.unbatched.fps}</p>
            <p>Total operations: {performanceMetrics.unbatched.operations}</p>
          </div>
        </ComparisonPanel>
      </ComparisonSection>
      
      <MetricsPanel>
        <h2>DOM Batcher Metrics</h2>
        <p>Batches processed: {metrics.batchesProcessed}</p>
        <p>Tasks processed: {metrics.tasksProcessed}</p>
        <p>Average task time: {metrics.averageTaskTime.toFixed(2)}ms</p>
        <p>Average batch time: {metrics.averageBatchTime.toFixed(2)}ms</p>
        <p>Max batch time: {metrics.maxBatchTime.toFixed(2)}ms</p>
        <p>Layout thrashing prevented: {metrics.layoutThrashingPrevented} instances</p>
        
        <h3>When to use DOM Batcher</h3>
        <ul>
          <li>When making multiple style changes to many elements</li>
          <li>When mixing read and write operations (getBoundingClientRect followed by style changes)</li>
          <li>When you need to coordinate animations with DOM measurements</li>
          <li>For any performance-critical UI with frequent DOM updates</li>
        </ul>
      </MetricsPanel>
    </Container>
  );
};

export default DomBatcherExample;