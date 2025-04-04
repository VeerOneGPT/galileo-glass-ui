import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { useOptimizedAnimation, useGlassPerformance, AnimationComplexity } from '../../src/hooks'; // Use direct path instead
import { getDeviceCapabilities, DeviceCapabilityTier } from '../../src/utils/deviceCapabilities';
import { Paper } from '../../src/components/Paper';
import { Select, SelectOption } from '../../src/components/Select';
import { Typography } from '../../src/components/Typography';
import { Button } from '../../src/components/Button';
import { fadeIn, slideUp } from '../../src/animations/keyframes/basic';

// Mock glass animations since they don't exist in the package
const glassReflection = fadeIn; // Use fadeIn as a fallback for now
const backgroundBlur = fadeIn; // Use fadeIn as a fallback for now

// Mock darkTheme for consistent styling
const darkTheme = {
  colors: {
    background: '#121212',
    backgroundVariant: '#1e1e1e',
    primary: '#5c6bc0',
    secondary: '#9c27b0',
    border: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    error: '#f44336',
    info: '#2196f3',
    infoTransparent: 'rgba(33, 150, 243, 0.1)',
    errorTransparent: 'rgba(244, 67, 54, 0.1)',
    glassBackground: 'rgba(30, 30, 30, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassBackgroundActive: 'rgba(40, 40, 40, 0.8)',
    success: '#4caf50',
    successTransparent: 'rgba(76, 175, 80, 0.1)',
    warning: '#ff9800',
    warningTransparent: 'rgba(255, 152, 0, 0.1)'
  },
  shape: {
    borderRadius: 4
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.2)',
    medium: '0 4px 8px rgba(0,0,0,0.2)',
    large: '0 8px 16px rgba(0,0,0,0.2)'
  }
};

// --- Styled Components (Adapted) ---
const StoryContainer = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  min-height: 100vh;
`;

const DemoWrapper = styled(Paper)`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
`;

const PerformanceIndicator = styled.div<{ $status: 'good' | 'warning' | 'poor' }>`
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
  background-color: ${({ $status, theme }) => {
    switch ($status) {
      case 'good': return theme.colors.successTransparent;
      case 'warning': return theme.colors.warningTransparent;
      case 'poor': return theme.colors.errorTransparent;
    }
  }};
  border: 1px solid
    ${({ $status, theme }) => {
      switch ($status) {
        case 'good': return theme.colors.success;
        case 'warning': return theme.colors.warning;
        case 'poor': return theme.colors.error;
      }
    }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'good': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'poor': return theme.colors.error;
    }
  }};
`;

interface OptimizedGlassCardProps {
  $complexity: AnimationComplexity; // Use transient prop
  children: React.ReactNode;
}

const OptimizedGlassCard = styled.div<OptimizedGlassCardProps>`
  background-color: ${({ theme }) => theme.colors.glassBackground};
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  color: ${({ theme }) => theme.colors.textPrimary};
  /* Apply animation */
  ${({ $complexity }) => {
    const { css: animationCss } = useOptimizedAnimation({
      animation:
        $complexity === AnimationComplexity.MINIMAL
          ? fadeIn
          : $complexity === AnimationComplexity.BASIC
          ? slideUp
          : glassReflection,
      reducedMotionFallback: fadeIn,
      complexity: $complexity,
      duration: $complexity === AnimationComplexity.COMPLEX ? 0.9 : 0.5,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      adaptToCapabilities: true,
      animatedProperties: ['opacity', 'transform'], // Removed filter as it might impact performance demo
      forceGPU: $complexity === AnimationComplexity.COMPLEX,
    });
    return animationCss;
  }}
`;

const PerformanceDashboard = styled(Paper)`
  backdrop-filter: blur(5px);
  padding: 1.5rem;
  margin-top: 2rem;
  font-size: 14px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  span:first-child {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  span:last-child {
    font-family: monospace;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const FpsBar = styled.div<{ $value: number }>`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin: 4px 0 12px 0;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $value }) => Math.min(Math.max($value / 60, 0), 1) * 100}%;
    background-color: ${({ $value, theme }) => {
      if ($value >= 55) return theme.colors.success;
      if ($value >= 30) return theme.colors.warning;
      return theme.colors.error;
    }};
    transition: width 0.3s ease, background-color 0.3s ease;
  }
`;

const ControlRow = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

// --- Component Definition ---
interface PerformanceOptimizedGlassProps {
    initialComplexity?: AnimationComplexity;
    autoOptimize?: boolean;
    logIssues?: boolean;
}

const PerformanceOptimizedGlassComponent: React.FC<PerformanceOptimizedGlassProps> = ({ 
    initialComplexity = AnimationComplexity.STANDARD,
    autoOptimize = true,
    logIssues = true,
 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [complexity, setComplexity] = useState<AnimationComplexity>(initialComplexity);

  // Fix the event handler function to handle either string or object with target
  const handleValueChange = (e: any) => {
    // Check if e is a string or an event object
    const value = typeof e === 'string' ? e : e?.target?.value;
    setComplexity(value as AnimationComplexity);
  };

  // Use the glass performance hook
  const { metrics, optimizationLevel, getSuggestions, isPoorPerformance } = useGlassPerformance({
    enabled: true,
    updateInterval: 1000,
    autoOptimize,
    logPerformanceIssues: logIssues,
    targetElement: containerRef.current, // Monitor the container with the cards
    // Set target FPS if needed
    // targetFPS: 60,
  });

  // Effect to re-attach targetElement if containerRef changes
  // This might be needed if the dashboard itself affects layout
  useEffect(() => {
    // No direct API to update targetElement, relies on initial setup or re-render
    // If issues arise, a key on the component might force re-initialization
  }, [containerRef.current]);

  // Helpers for display
  const getPerformanceStatus = (): 'good' | 'warning' | 'poor' => {
    if (metrics.fps >= 55) return 'good';
    if (metrics.fps >= 30) return 'warning';
    return 'poor';
  };

  const getDeviceTierLabel = (tier: DeviceCapabilityTier): string => {
    switch (tier) {
      case DeviceCapabilityTier.ULTRA: return 'Ultra';
      case DeviceCapabilityTier.HIGH: return 'High';
      case DeviceCapabilityTier.MEDIUM: return 'Medium';
      case DeviceCapabilityTier.LOW: return 'Low';
      case DeviceCapabilityTier.MINIMAL: return 'Minimal';
      default: return 'Unknown';
    }
  };

  const getOptimizationLabel = (level: number): string => {
    if (level <= 0) return 'None';
    if (level < 1.5) return 'Light';
    if (level < 2.5) return 'Medium';
    return 'Aggressive';
  };

  const complexityOptions: SelectOption[] = Object.values(AnimationComplexity).map(value => ({
      value: String(value), // Ensure value is a string
      label: String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase(),
  }));

  return (
    <StoryContainer>
      <DemoWrapper elevation={3}>
        <Typography variant="h4" gutterBottom style={{ textAlign: 'center' }}>
          Performance-Optimized Glass UI
        </Typography>
        <Typography variant="body1" paragraph style={{ textAlign: 'center' }}>
          This story demonstrates <code>useGlassPerformance</code> and <code>useOptimizedAnimation</code>.
          Adjust complexity and observe the performance metrics and auto-optimization levels.
        </Typography>

        <PerformanceIndicator $status={getPerformanceStatus()}>
          Performance Status: {getPerformanceStatus().toUpperCase()} ({metrics.fps.toFixed(1)} FPS)
        </PerformanceIndicator>

        <ControlRow>
          <Typography variant="body1" style={{ minWidth: '150px' }}>Animation Complexity:</Typography>
          <Select
            options={complexityOptions}
            value={complexity}
            onChange={handleValueChange}
            placeholder="Select Complexity"
          />
        </ControlRow>

        <div ref={containerRef}>
          {/* Render multiple cards to potentially stress performance */}
          {[...Array(3)].map((_, i) => (
            <OptimizedGlassCard key={i} $complexity={complexity}>
              <Typography variant="h6">Optimized Card {i + 1}</Typography>
              <Typography variant="body2" style={{ marginBottom: '10px' }}>
                Using optimized animations with <strong>{complexity}</strong> complexity.
              </Typography>
              {optimizationLevel > 0 && (
                <div
                  style={{
                    backgroundColor: darkTheme.colors.infoTransparent,
                    padding: '8px',
                    borderRadius: '4px',
                    marginTop: '10px',
                    border: `1px solid ${darkTheme.colors.info}`,
                    color: darkTheme.colors.info
                  }}
                >
                  <strong>Auto-Optimization:</strong> {getOptimizationLabel(optimizationLevel)}
                </div>
              )}
            </OptimizedGlassCard>
          ))}
        </div>

        <PerformanceDashboard elevation={2}>
          <Typography variant="h6" style={{ margin: '0 0 12px 0' }}>Performance Metrics</Typography>

          <MetricRow>
            <span>FPS:</span>
            <span>{metrics.fps.toFixed(1)}</span>
          </MetricRow>
          <FpsBar $value={metrics.fps} />

          <MetricRow>
            <span>Frame Time:</span>
            <span>{metrics.frameTiming.toFixed(2)} ms</span>
          </MetricRow>

          <MetricRow>
            <span>Jank Score:</span>
            <span>{metrics.jankScore}/10</span>
          </MetricRow>

          <MetricRow>
            <span>Device Capability:</span>
            <span>{getDeviceTierLabel(metrics.deviceCapabilityTier)}</span>
          </MetricRow>

          <MetricRow>
            <span>Optimization Level:</span>
            <span>{getOptimizationLabel(optimizationLevel)}</span>
          </MetricRow>

          {isPoorPerformance && (
            <div
              style={{
                marginTop: '15px',
                backgroundColor: darkTheme.colors.errorTransparent,
                padding: '10px',
                borderRadius: '4px',
                border: `1px solid ${darkTheme.colors.error}`,
                color: darkTheme.colors.error
              }}
            >
              <strong>Performance Issues Detected</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                {getSuggestions()
                  .slice(0, 3)
                  .map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
              </ul>
            </div>
          )}
        </PerformanceDashboard>
      </DemoWrapper>
    </StoryContainer>
  );
};

// --- Storybook Configuration ---
const meta: Meta<typeof PerformanceOptimizedGlassComponent> = {
  title: 'Performance/Optimized Glass & Monitoring',
  component: PerformanceOptimizedGlassComponent,
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
     initialComplexity: {
        control: 'select',
        options: Object.values(AnimationComplexity),
        description: 'Initial animation complexity level for the cards.',
        defaultValue: AnimationComplexity.STANDARD,
        table: { category: 'Setup' }
     },
     autoOptimize: {
         control: 'boolean',
         description: 'Enable/disable automatic performance optimization by useGlassPerformance.',
         defaultValue: true,
         table: { category: 'Monitoring' }
     },
     logIssues: {
         control: 'boolean',
         description: 'Log detected performance issues to the console.',
         defaultValue: true,
         table: { category: 'Monitoring' }
     }
  }
};

export default meta;

// --- Stories ---
const Template: StoryFn<PerformanceOptimizedGlassProps> = (args) => <PerformanceOptimizedGlassComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  // Default args are defined in argTypes
};

export const AutoOptimizeDisabled = Template.bind({});
AutoOptimizeDisabled.args = {
  autoOptimize: false,
  initialComplexity: AnimationComplexity.COMPLEX, // Start complex to see potential issues
}; 