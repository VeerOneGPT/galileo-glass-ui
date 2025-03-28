/**
 * Physics Engine Benchmark Component
 * 
 * Compares performance between Galileo Glass physics, React Spring, and Framer Motion
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSpring as useReactSpring, animated as animatedSpring } from 'react-spring';
import { motion, useAnimation } from 'framer-motion';

import { useSpring, springAnimation, GalileoPhysics, Physics } from '../../physics';
import { runBenchmark, compareBenchmarks } from './benchmarkEngine';
import { BenchmarkResult } from './types';

// Styled components
const BenchmarkContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
`;

const Title = styled.h1`
  margin-bottom: 16px;
  font-size: 28px;
`;

const Subtitle = styled.h2`
  margin-top: 32px;
  margin-bottom: 16px;
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
`;

const Description = styled.p`
  margin-bottom: 20px;
  line-height: 1.5;
`;

const TestArea = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #3a56d4;
  }
  
  &:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const ResultsContainer = styled.div`
  margin-top: 32px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  overflow-x: auto;
`;

const TestObject = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
`;

// Global configs
const testConfigs = {
  spring: {
    mass: 1,
    stiffness: 80,
    damping: 10,
    from: { left: '5%', top: '50%' },
    to: { left: '85%', top: '50%' }
  },
  duration: 2000 // ms
};

/**
 * Benchmark component for comparing physics engines
 */
const PhysicsEngineBenchmark: React.FC = () => {
  // DOM refs
  const testAreaRef = useRef<HTMLDivElement>(null);
  const galileoRef = useRef<HTMLDivElement>(null);
  const reactSpringRef = useRef<HTMLDivElement>(null);
  const framerMotionRef = useRef<HTMLDivElement>(null);
  
  // State
  const [benchmarkType, setBenchmarkType] = useState<'simple' | 'complex'>('simple');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<'galileo' | 'spring' | 'framer' | 'all' | null>(null);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [comparison, setComparison] = useState<string>('');
  
  // Animation controllers
  const framerControls = useAnimation();

  // React Spring animation
  const [springProps, springApi] = useReactSpring(() => ({
    from: { 
      left: testConfigs.spring.from.left, 
      top: testConfigs.spring.from.top,
      transform: 'translate(-50%, -50%)'
    },
    config: {
      mass: testConfigs.spring.mass,
      tension: testConfigs.spring.stiffness * 10, // React Spring uses different units
      friction: testConfigs.spring.damping * 10 // React Spring uses different units
    }
  }));

  // Run Galileo physics benchmark
  const runGalileoBenchmark = async () => {
    setIsRunning(true);
    setLastRun('galileo');
    
    // Use our unified API
    const result = await runBenchmark({
      name: 'Galileo Physics',
      renderComponent: () => <TestObject ref={galileoRef}>Galileo</TestObject>,
      triggerAnimation: (callback?: () => void) => {
        // Reset position
        if (galileoRef.current) {
          galileoRef.current.style.transition = 'none';
          galileoRef.current.style.left = testConfigs.spring.from.left;
          galileoRef.current.style.top = testConfigs.spring.from.top;
          galileoRef.current.style.transform = 'translate(-50%, -50%)';
          
          // Force reflow
          galileoRef.current.offsetHeight;
          
          // Apply spring animation
          const springConfig = {
            mass: testConfigs.spring.mass,
            stiffness: testConfigs.spring.stiffness,
            damping: testConfigs.spring.damping
          };
          
          // Apply animation
          const animation = springAnimation({
            target: galileoRef.current,
            properties: { 
              left: testConfigs.spring.to.left, 
              top: testConfigs.spring.to.top 
            },
            config: springConfig,
            duration: testConfigs.duration,
            onComplete: callback
          });
          
          animation.start();
        }
      },
      element: galileoRef.current,
      args: [],
      duration: testConfigs.duration,
      warmupCount: 2,
      iterations: 3
    });
    
    setResults(prev => {
      const newResults = [...prev.filter(r => r.name !== 'Galileo Physics'), result];
      
      if (newResults.length > 1) {
        const { summary } = compareBenchmarks(newResults);
        setComparison(summary);
      }
      
      return newResults;
    });
    
    setIsRunning(false);
  };
  
  // Run React Spring benchmark
  const runReactSpringBenchmark = async () => {
    setIsRunning(true);
    setLastRun('spring');
    
    const result = await runBenchmark({
      name: 'React Spring',
      renderComponent: () => (
        <animatedSpring.div 
          ref={reactSpringRef} 
          style={{
            ...springProps,
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)'
          }}
        >
          Spring
        </animatedSpring.div>
      ),
      triggerAnimation: (callback?: () => void) => {
        // Reset and then animate
        springApi.set({
          left: testConfigs.spring.from.left,
          top: testConfigs.spring.from.top,
          transform: 'translate(-50%, -50%)'
        });
        
        // Force reflow
        if (reactSpringRef.current) {
          reactSpringRef.current.offsetHeight;
        }
        
        // Start animation
        springApi.start({
          to: {
            left: testConfigs.spring.to.left,
            top: testConfigs.spring.to.top
          },
          onRest: callback
        });
      },
      element: reactSpringRef.current,
      args: [],
      duration: testConfigs.duration,
      warmupCount: 2,
      iterations: 3
    });
    
    setResults(prev => {
      const newResults = [...prev.filter(r => r.name !== 'React Spring'), result];
      
      if (newResults.length > 1) {
        const { summary } = compareBenchmarks(newResults);
        setComparison(summary);
      }
      
      return newResults;
    });
    
    setIsRunning(false);
  };
  
  // Run Framer Motion benchmark
  const runFramerMotionBenchmark = async () => {
    setIsRunning(true);
    setLastRun('framer');
    
    const result = await runBenchmark({
      name: 'Framer Motion',
      renderComponent: () => (
        <motion.div
          ref={framerMotionRef}
          animate={framerControls}
          initial={{
            position: 'absolute',
            left: testConfigs.spring.from.left,
            top: testConfigs.spring.from.top,
            x: '-50%',
            y: '-50%',
            width: '100px',
            height: '100px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)'
          }}
        >
          Framer
        </motion.div>
      ),
      triggerAnimation: async (callback?: () => void) => {
        // Reset position
        await framerControls.set({
          left: testConfigs.spring.from.left,
          top: testConfigs.spring.from.top,
          x: '-50%',
          y: '-50%'
        });
        
        // Force reflow
        if (framerMotionRef.current) {
          framerMotionRef.current.offsetHeight;
        }
        
        // Start animation
        framerControls.start({
          left: testConfigs.spring.to.left,
          top: testConfigs.spring.to.top,
          transition: {
            type: 'spring',
            mass: testConfigs.spring.mass,
            stiffness: testConfigs.spring.stiffness,
            damping: testConfigs.spring.damping,
            duration: testConfigs.duration / 1000,
          }
        }).then(() => {
          if (callback) callback();
        });
      },
      element: framerMotionRef.current,
      args: [],
      duration: testConfigs.duration,
      warmupCount: 2,
      iterations: 3
    });
    
    setResults(prev => {
      const newResults = [...prev.filter(r => r.name !== 'Framer Motion'), result];
      
      if (newResults.length > 1) {
        const { summary } = compareBenchmarks(newResults);
        setComparison(summary);
      }
      
      return newResults;
    });
    
    setIsRunning(false);
  };
  
  // Run all benchmarks in sequence
  const runAllBenchmarks = async () => {
    setIsRunning(true);
    setLastRun('all');
    
    // Clear previous results
    setResults([]);
    
    // Run each benchmark in sequence
    await runGalileoBenchmark();
    await runReactSpringBenchmark();
    await runFramerMotionBenchmark();
    
    setIsRunning(false);
  };
  
  return (
    <BenchmarkContainer>
      <Title>Physics Engine Benchmark</Title>
      <Description>
        This benchmark compares Galileo Physics system with React Spring and Framer Motion
        libraries. It measures performance metrics such as FPS, animation delay, smoothness,
        and memory usage.
      </Description>
      
      <Controls>
        <Select 
          value={benchmarkType} 
          onChange={e => setBenchmarkType(e.target.value as 'simple' | 'complex')}
          disabled={isRunning}
        >
          <option value="simple">Simple Spring Motion</option>
          <option value="complex">Complex Physics Interaction</option>
        </Select>
        <Button onClick={runGalileoBenchmark} disabled={isRunning}>
          Run Galileo Benchmark
        </Button>
        <Button onClick={runReactSpringBenchmark} disabled={isRunning}>
          Run React Spring Benchmark
        </Button>
        <Button onClick={runFramerMotionBenchmark} disabled={isRunning}>
          Run Framer Motion Benchmark
        </Button>
        <Button onClick={runAllBenchmarks} disabled={isRunning}>
          Run All Benchmarks
        </Button>
      </Controls>
      
      <TestArea ref={testAreaRef}>
        {isRunning && <div style={{ padding: 20 }}>Running benchmark...</div>}
        
        {(lastRun === 'galileo' || lastRun === 'all') && (
          <TestObject 
            ref={galileoRef}
            style={{
              left: testConfigs.spring.from.left,
              top: testConfigs.spring.from.top,
              transform: 'translate(-50%, -50%)'
            }}
          >
            Galileo
          </TestObject>
        )}
        
        {(lastRun === 'spring' || lastRun === 'all') && (
          <animatedSpring.div 
            ref={reactSpringRef} 
            style={{
              ...springProps,
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)'
            }}
          >
            Spring
          </animatedSpring.div>
        )}
        
        {(lastRun === 'framer' || lastRun === 'all') && (
          <motion.div
            ref={framerMotionRef}
            animate={framerControls}
            initial={{
              position: 'absolute',
              left: testConfigs.spring.from.left,
              top: testConfigs.spring.from.top,
              x: '-50%',
              y: '-50%',
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)'
            }}
          >
            Framer
          </motion.div>
        )}
      </TestArea>
      
      {results.length > 0 && (
        <Subtitle>Benchmark Results</Subtitle>
      )}
      
      {results.length > 0 && results.map(result => (
        <div key={result.name} style={{ marginBottom: 24 }}>
          <h3>{result.name}</h3>
          <ul>
            <li>Average FPS: {result.metrics.fps.average.toFixed(2)}</li>
            <li>Animation Delay: {result.metrics.delay.average.toFixed(2)}ms</li>
            <li>Smoothness Score: {result.metrics.smoothness.average.toFixed(2)}%</li>
            <li>Average Frame Time: {result.metrics.frameDurations.mean.toFixed(2)}ms</li>
            <li>Memory Usage: {(result.metrics.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)}MB</li>
          </ul>
        </div>
      ))}
      
      {results.length > 1 && comparison && (
        <ResultsContainer>
          <div dangerouslySetInnerHTML={{ __html: comparison.replace(/\n/g, '<br>') }} />
        </ResultsContainer>
      )}
    </BenchmarkContainer>
  );
};

export default PhysicsEngineBenchmark;