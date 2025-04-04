import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled, { keyframes, ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { Typography } from '../../src/components/Typography';
import { Button } from '../../src/components/Button';
import { Checkbox } from '../../src/components/Checkbox';
import { Slider } from '../../src/components/Slider';
import { Box } from '../../src/components/Box';
import { Paper } from '../../src/components/Paper';

// Mock implementations for missing utilities
// These would be replaced with actual implementations when available
const detectBrowserCapabilities = () => ({
  webGLSupport: true,
  webGL2Support: true,
  hasBackdropFilter: true,
  canUseTransformStyle: true,
  canUseWebAnimations: true
});

const getBrowserPerformanceScore = () => 85; // Mock score between 0-100

// Mock performance optimization hooks
const useRenderOptimizer = () => ({
  optimizeRender: (element: HTMLElement) => {},
  resetOptimizations: () => {}
});

const useFrameRateLimiter = (targetFPS: number = 60) => ({
  limitFrameRate: (callback: () => void) => requestAnimationFrame(callback),
  isLimiting: false
});

const useQualityAdjuster = (initialLevel: number = 2) => ({
  qualityLevel: initialLevel,
  adjustQuality: (performanceScore: number) => initialLevel
});

// Enum for optimization levels
enum OptimizationLevel {
  NONE = 'NONE',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE'
}

// Mock browser compatibility types and utilities
enum FeatureLevel {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  MINIMAL = 'MINIMAL',
  UNSUPPORTED = 'UNSUPPORTED'
}

const GLASS_REQUIREMENTS = {
  backdropFilter: ['backdrop-filter', '-webkit-backdrop-filter'],
  transformStyle: ['transform-style'],
  webAnimations: ['web-animations']
};

const getFeatureSupportLevel = () => FeatureLevel.FULL;

// Mock performance optimization utilities
class PerformanceMonitor {
  private callback: (metrics: any) => void;
  private intervalId: number | null = null;

  constructor(callback: (metrics: any) => void) {
    this.callback = callback;
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => {
      this.callback({
        fps: 60 * Math.random() * 0.5 + 30, // Random FPS between 30-60
        frameTime: Math.random() * 20 + 10, // Random frame time between 10-30ms
        hasJank: Math.random() > 0.7, // Randomly report jank
        featureSupportLevel: FeatureLevel.FULL
      });
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

const getOptimizedSettings = () => ({
  optimizationLevel: OptimizationLevel.MODERATE,
  useBackdropFilter: true,
  reduceMotion: false,
  reduceTransparency: false
});

const optimizeAnimatedElement = (element: HTMLElement, settings: any) => {
  // Mock implementation that would optimize the element
};

const applyCssOptimizations = (element: HTMLElement, level: OptimizationLevel) => {
  // Mock implementation that would apply CSS optimizations
};

// Create a mock darkTheme
const darkTheme = {
  colors: {
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    background: '#121212',
    backgroundVariant: '#1e1e1e',
    border: 'rgba(255, 255, 255, 0.12)',
    primary: '#5c6bc0',
    primaryHover: '#4d5cb3',
    secondary: '#9c27b0',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    disabledBackground: 'rgba(255, 255, 255, 0.1)',
    disabledText: 'rgba(255, 255, 255, 0.38)'
  }
};

// Create a GlassButton component
const GlassButton = styled(Button)`
  background: rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

// --- Styled Components (Adapted from Demo) ---
const DemoContainer = styled.div`
  padding: 24px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography).attrs({ variant: 'h3' })`
  margin-bottom: 16px;
`;

const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const ControlItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlLabel = styled(Typography).attrs({ variant: 'body1' })`
   margin-bottom: 0;
`;

const MetricsCard = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetricValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-family: monospace;
  display: flex;
  align-items: center;
`;

const StatusIndicator = styled.div<{ $status: 'good' | 'warning' | 'critical' }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props =>
    props.$status === 'good' ? props.theme.colors.success : props.$status === 'warning' ? props.theme.colors.warning : props.theme.colors.error};
`;

const StressArea = styled.div`
    margin-top: 20px;
    padding: 1rem;
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    min-height: 150px;
    text-align: center;
`;

// Basic keyframes for stress test elements
const pulse = keyframes` 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } `;
const float = keyframes` 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } `;

// Interface for performance monitoring state
interface PerformanceState {
  fps: number;
  frameTime: number;
  hasJank: boolean;
  featureSupport: FeatureLevel;
  optimizationLevel: OptimizationLevel;
}

// --- Performance Monitoring Component (Ported from Demo) ---
const PerformanceMonitoringComponent: React.FC = () => {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    fps: 0,
    frameTime: 0,
    hasJank: false,
    featureSupport: FeatureLevel.FULL, // Assuming default initially
    optimizationLevel: OptimizationLevel.NONE,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const [stressTest, setStressTest] = useState(false);
  const [stressTestCount, setStressTestCount] = useState(20);
  const stressElementsRef = useRef<HTMLDivElement>(null);

  // Start/stop performance monitoring
  useEffect(() => {
    // Check if PerformanceMonitor is available (might not be in SSR)
    if (typeof PerformanceMonitor === 'undefined') return;

    if (isMonitoring && !performanceMonitorRef.current) {
      performanceMonitorRef.current = new PerformanceMonitor(metrics => {
        setPerformanceState({
          fps: metrics.fps,
          frameTime: metrics.frameTime,
          hasJank: metrics.hasJank,
          featureSupport: metrics.featureSupportLevel,
          // Get current optimization level dynamically
          optimizationLevel: getOptimizedSettings ? getOptimizedSettings().optimizationLevel : OptimizationLevel.NONE,
        });
      });
      performanceMonitorRef.current.start();
    } else if (!isMonitoring && performanceMonitorRef.current) {
      performanceMonitorRef.current.stop();
      performanceMonitorRef.current = null;
      // Reset state when stopping
      setPerformanceState({
           fps: 0, frameTime: 0, hasJank: false,
           featureSupport: FeatureLevel.FULL, optimizationLevel: OptimizationLevel.NONE
       });
    }

    return () => {
      performanceMonitorRef.current?.stop();
      performanceMonitorRef.current = null;
    };
  }, [isMonitoring]);

  // Generate stress test elements
  const generateStressElements = useCallback(() => {
    if (!stressElementsRef.current) return;

    stressElementsRef.current.innerHTML = ''; // Clear previous
    if (!stressTest) return; // Don't generate if stress test is off

    const settings = getOptimizedSettings ? getOptimizedSettings() : { optimizationLevel: OptimizationLevel.NONE };

    for (let i = 0; i < stressTestCount; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 80px; height: 80px; margin: 8px; display: inline-block;
        background-color: rgba(99, 102, 241, ${Math.random() * 0.4 + 0.2});
        border-radius: 6px;
        animation: ${Math.random() > 0.5 ? pulse : float} ${Math.floor(Math.random() * 3) + 1.5}s infinite alternate ease-in-out;
        transform: translateZ(0);
        border: 1px solid rgba(255, 255, 255, 0.1);
      `;
       // Apply glass effect conditionally (simplified for demo)
       if (Math.random() > 0.3) { // Apply to most elements
           const blur = Math.floor(Math.random() * 8) + 2;
           el.style.backdropFilter = `blur(${blur}px)`;
           // @ts-ignore - Allow non-standard property for Safari compatibility
           el.style.webkitBackdropFilter = `blur(${blur}px)`;
           el.style.backgroundColor = `rgba(99, 102, 241, ${Math.random() * 0.2 + 0.1})`; // More transparent
       }

      // Apply performance optimizations
      if (optimizeAnimatedElement) {
          optimizeAnimatedElement(el, settings);
      }

      stressElementsRef.current.appendChild(el);
    }
  }, [stressTest, stressTestCount]);

  // Update stress test elements when count/status changes
  useEffect(() => {
    generateStressElements();
  }, [generateStressElements]); // generateStressElements has dependencies

  // Fix the Slider onChange prop type
  const handleSliderChange = (value: number) => {
    setStressTestCount(value);
  };

  return (
    <Section>
      <SectionTitle>Performance Monitoring & Optimization</SectionTitle>

      <ControlRow>
        <ControlItem>
          <GlassButton onClick={() => setIsMonitoring(!isMonitoring)} variant="outlined">
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </GlassButton>
        </ControlItem>
        <ControlItem>
          <Checkbox
            id="stress-test-cb"
            checked={stressTest}
            onChange={e => setStressTest(e.target.checked)}
            label="Enable Stress Test"
          />
        </ControlItem>
        <ControlItem>
          <ControlLabel as="label" htmlFor="stress-count">Elements:</ControlLabel>
          <Slider
            min={5}
            max={150} // Increased max
            step={5}
            value={stressTestCount}
            onChange={handleSliderChange}
            disabled={!stressTest}
          />
          <ControlLabel style={{ minWidth: '30px' }}>{stressTestCount}</ControlLabel>
        </ControlItem>
      </ControlRow>

      {isMonitoring && (
        <MetricsCard>
          <Typography variant="h5" gutterBottom>Live Performance Metrics</Typography>
          <MetricRow>
            <MetricLabel>FPS:</MetricLabel>
            <MetricValue>
              <StatusIndicator $status={ performanceState.fps >= 55 ? 'good' : performanceState.fps >= 30 ? 'warning' : 'critical' } />
              {performanceState.fps.toFixed(1)}
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Frame Time:</MetricLabel>
            <MetricValue>
              <StatusIndicator $status={ performanceState.frameTime <= 18 ? 'good' : performanceState.frameTime <= 33 ? 'warning' : 'critical' }/>
              {performanceState.frameTime.toFixed(2)} ms
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Jank Detected:</MetricLabel>
            <MetricValue>
              <StatusIndicator $status={performanceState.hasJank ? 'warning' : 'good'} />
              {performanceState.hasJank ? 'Yes' : 'No'}
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Feature Support:</MetricLabel>
            <MetricValue>
              <StatusIndicator $status={ performanceState.featureSupport === FeatureLevel.FULL ? 'good' : performanceState.featureSupport === FeatureLevel.PARTIAL ? 'warning' : 'critical' } />
              {performanceState.featureSupport}
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Optimization Level:</MetricLabel>
            <MetricValue>{performanceState.optimizationLevel}</MetricValue>
          </MetricRow>
        </MetricsCard>
      )}

      <StressArea ref={stressElementsRef}>
        {!stressTest && (
          <Typography variant="body2" style={{ color: darkTheme.colors.textSecondary }}>
            Enable the stress test to generate animated glass elements and observe performance.
          </Typography>
        )}
      </StressArea>
    </Section>
  );
};

// Renamed to match the export
const PerformanceOptimizationDemo = PerformanceMonitoringComponent;

// --- Storybook Configuration ---
export default {
  title: 'Performance/PerformanceOptimization',
  component: PerformanceOptimizationDemo,
  decorators: [
    (Story) => (
      <StyledThemeProvider theme={darkTheme}>
        <Story />
      </StyledThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    notes: 'Demonstrates performance monitoring, stress testing, and dynamic optimization levels.',
  },
} as Meta;

// --- Story ---
export const Default: StoryFn = () => <PerformanceMonitoringComponent />; 