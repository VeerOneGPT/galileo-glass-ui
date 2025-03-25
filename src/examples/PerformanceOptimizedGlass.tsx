/**
 * Performance Optimized Glass Example
 * 
 * This example demonstrates how to use the useOptimizedAnimation and useGlassPerformance hooks
 * to create high-performance glass UI components that adapt to device capabilities
 */
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useOptimizedAnimation, 
  useGlassPerformance,
  AnimationComplexity
} from '../hooks';
import { fadeIn, scaleIn } from '../animations/keyframes/basic';
import { glassSlideFadeIn } from '../animations/keyframes/glass';
import { DeviceCapabilityTier } from '../utils/deviceCapabilities';

// Indicators for current performance state
const PerformanceIndicator = styled.div<{ status: 'good' | 'warning' | 'poor' }>`
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
  background-color: ${({ status }) => {
    switch (status) {
      case 'good': return 'rgba(72, 187, 120, 0.2)';
      case 'warning': return 'rgba(237, 137, 54, 0.2)';
      case 'poor': return 'rgba(229, 62, 62, 0.2)';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'good': return 'rgba(72, 187, 120, 0.6)';
      case 'warning': return 'rgba(237, 137, 54, 0.6)';
      case 'poor': return 'rgba(229, 62, 62, 0.6)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'good': return 'rgba(39, 103, 73, 1)';
      case 'warning': return 'rgba(124, 58, 13, 1)';
      case 'poor': return 'rgba(155, 28, 28, 1)';
    }
  }};
`;

// Animated glass card with optimized animations
interface OptimizedGlassCardProps {
  complexity: AnimationComplexity;
  children: React.ReactNode;
}

const OptimizedGlassCard = styled.div<OptimizedGlassCardProps>`
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  ${({ complexity }) => {
    // Use optimized animation with different settings based on complexity
    const animation = useOptimizedAnimation({
      animation: complexity === AnimationComplexity.MINIMAL ? fadeIn : 
                 complexity === AnimationComplexity.REDUCED ? scaleIn : 
                 glassSlideFadeIn,
      reducedMotionFallback: fadeIn,
      complexity,
      duration: complexity === AnimationComplexity.COMPLEX ? 0.9 : 0.5,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      adaptToCapabilities: true,
      animatedProperties: ['opacity', 'transform', 'filter'],
      forceGPU: complexity === AnimationComplexity.COMPLEX
    });
    
    return animation.css;
  }}
`;

// Performance Dashboard component
const PerformanceDashboard = styled.div`
  background-color: rgba(23, 25, 35, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
`;

// Metric Row
const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  
  span:first-child {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }
  
  span:last-child {
    font-family: monospace;
  }
`;

// Progress bar for FPS visualization
const FpsBar = styled.div<{ value: number }>`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin: 4px 0 10px 0;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ value }) => Math.min(Math.max(value / 60, 0), 1) * 100}%;
    background-color: ${({ value }) => {
      if (value >= 55) return 'rgba(72, 187, 120, 0.8)';
      if (value >= 30) return 'rgba(237, 137, 54, 0.8)';
      return 'rgba(229, 62, 62, 0.8)';
    }};
    transition: width 0.3s ease, background-color 0.3s ease;
  }
`;

/**
 * Performance-Optimized Glass Example Component
 */
export const PerformanceOptimizedGlass: React.FC = () => {
  // Reference to the glass container for monitoring
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Current animation complexity level
  const [complexity, setComplexity] = useState<AnimationComplexity>(AnimationComplexity.STANDARD);
  
  // Use the glass performance hook to monitor performance
  const { 
    metrics, 
    optimizationLevel,
    getSuggestions,
    isPoorPerformance
  } = useGlassPerformance({
    enabled: true,
    updateInterval: 1000,
    autoOptimize: true,
    logPerformanceIssues: true,
    targetElement: containerRef.current
  });
  
  // Update the container reference
  useEffect(() => {
    if (containerRef.current) {
      // Force repaint to ensure the hook picks up the new element
      containerRef.current.style.display = 'none';
      void containerRef.current.offsetHeight;
      containerRef.current.style.display = 'block';
    }
  }, [containerRef.current]);
  
  // Get performance status
  const getPerformanceStatus = (): 'good' | 'warning' | 'poor' => {
    if (metrics.fps >= 55) return 'good';
    if (metrics.fps >= 30) return 'warning';
    return 'poor';
  };
  
  // Get device tier label
  const getDeviceTierLabel = (tier: DeviceCapabilityTier): string => {
    switch (tier) {
      case DeviceCapabilityTier.ULTRA:
        return 'Ultra (High-End Desktop/Laptop)';
      case DeviceCapabilityTier.HIGH:
        return 'High (Modern Desktop/Laptop)';
      case DeviceCapabilityTier.MEDIUM:
        return 'Medium (Average Laptop/High-End Mobile)';
      case DeviceCapabilityTier.LOW:
        return 'Low (Lower-End Mobile)';
      case DeviceCapabilityTier.MINIMAL:
        return 'Minimal (Very Low-End Device)';
      default:
        return 'Unknown';
    }
  };
  
  // Get optimization level label
  const getOptimizationLabel = (level: number): string => {
    if (level < 0.5) return 'None';
    if (level < 1.5) return 'Light';
    if (level < 2.5) return 'Medium';
    return 'Aggressive';
  };
  
  return (
    <div>
      <h2>Performance-Optimized Glass UI</h2>
      <p>
        This example demonstrates how to use the performance hooks to create optimized
        glass UI components that adapt to device capabilities.
      </p>
      
      <PerformanceIndicator status={getPerformanceStatus()}>
        Performance Status: {getPerformanceStatus().toUpperCase()} 
        ({metrics.fps.toFixed(1)} FPS)
      </PerformanceIndicator>
      
      <div>
        <label htmlFor="complexity-slider">Animation Complexity:</label>
        <select 
          id="complexity-slider"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value as AnimationComplexity)}
        >
          <option value={AnimationComplexity.MINIMAL}>Minimal</option>
          <option value={AnimationComplexity.REDUCED}>Reduced</option>
          <option value={AnimationComplexity.STANDARD}>Standard</option>
          <option value={AnimationComplexity.ENHANCED}>Enhanced</option>
          <option value={AnimationComplexity.COMPLEX}>Complex</option>
        </select>
      </div>
      
      <div ref={containerRef}>
        <OptimizedGlassCard complexity={complexity}>
          <h3>Optimized Glass Card</h3>
          <p>
            This card uses optimized animations that adapt to your device capabilities.
            The current complexity level is: <strong>{complexity}</strong>
          </p>
          {optimizationLevel > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(66, 153, 225, 0.2)', 
              padding: '8px', 
              borderRadius: '4px',
              marginTop: '10px'
            }}>
              <strong>Auto-Optimization Applied:</strong> {getOptimizationLabel(optimizationLevel)}
            </div>
          )}
        </OptimizedGlassCard>
        
        <OptimizedGlassCard complexity={complexity}>
          <h3>Second Glass Card</h3>
          <p>
            This card also uses the same optimization settings to ensure
            consistent performance across the interface.
          </p>
        </OptimizedGlassCard>
      </div>
      
      <PerformanceDashboard>
        <h4 style={{ margin: '0 0 12px 0' }}>Performance Metrics</h4>
        
        <MetricRow>
          <span>FPS:</span>
          <span>{metrics.fps.toFixed(1)}</span>
        </MetricRow>
        <FpsBar value={metrics.fps} />
        
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
          <div style={{ 
            marginTop: '15px', 
            backgroundColor: 'rgba(229, 62, 62, 0.1)', 
            padding: '10px',
            borderRadius: '4px'
          }}>
            <strong>Performance Issues Detected</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {getSuggestions().slice(0, 3).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </PerformanceDashboard>
    </div>
  );
};