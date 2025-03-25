import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTheme, useGlassEffects, usePreferences } from './ThemeProvider';

interface ThemePerformanceMonitorProps {
  /**
   * Position of the monitor overlay
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /**
   * If true, starts minimized
   */
  startMinimized?: boolean;
  
  /**
   * If true, shows advanced debug information
   */
  showAdvanced?: boolean;
  
  /**
   * Custom styles for the monitor panel
   */
  style?: React.CSSProperties;
}

interface PerformanceMetrics {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  renderTime: number;
  contextUpdates: number;
  themeChanges: number;
}

// Helper to format bytes to readable format
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MonitorContainer = styled.div<{ position: string; isMinimized: boolean }>`
  position: fixed;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  font-family: monospace;
  font-size: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: ${props => props.isMinimized ? '100px' : '300px'};
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Position based on prop */
  ${props => {
    if (props.position === 'top-left') {
      return 'top: 10px; left: 10px;';
    }
    if (props.position === 'top-right') {
      return 'top: 10px; right: 10px;';
    }
    if (props.position === 'bottom-left') {
      return 'bottom: 10px; left: 10px;';
    }
    return 'bottom: 10px; right: 10px;'; // bottom-right (default)
  }}
`;

const MonitorHeader = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MonitorTitle = styled.div`
  font-weight: bold;
`;

const MonitorContent = styled.div<{ isMinimized: boolean }>`
  padding: ${props => props.isMinimized ? '0' : '10px'};
  max-height: ${props => props.isMinimized ? '0' : '300px'};
  overflow: hidden;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  align-items: center;
`;

const MetricLabel = styled.div`
  opacity: 0.8;
`;

const MetricValue = styled.div<{ isWarning?: boolean; isError?: boolean }>`
  font-weight: bold;
  ${props => props.isError && 'color: #ff5252;'}
  ${props => props.isWarning && 'color: #ffb347;'}
`;

const ThemeInfo = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  padding: 6px;
  border-radius: 3px;
  margin-top: 6px;
  font-size: 11px;
`;

const SectionTitle = styled.div`
  margin-top: 8px;
  margin-bottom: 4px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
`;

const ToggleButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  margin-left: 5px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

/**
 * ThemePerformanceMonitor Component
 * 
 * Provides real-time performance monitoring for theme-related operations.
 * Designed for development use only.
 */
const ThemePerformanceMonitor: React.FC<ThemePerformanceMonitorProps> = ({
  position = 'bottom-right',
  startMinimized = false,
  showAdvanced = false,
  style = {}
}) => {
  const { isDark, currentColorMode, currentTheme } = useTheme();
  const { qualityTier } = useGlassEffects();
  const { reducedMotion } = usePreferences();
  
  const [isMinimized, setIsMinimized] = useState(startMinimized);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(showAdvanced);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: null,
    renderTime: 0,
    contextUpdates: 0,
    themeChanges: 0,
  });
  
  // Refs for tracking
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const lastThemeRef = useRef(currentTheme);
  const lastColorModeRef = useRef(currentColorMode);
  const updateCountRef = useRef(0);
  const themeChangeCountRef = useRef(0);
  
  // Track FPS
  useEffect(() => {
    // Calculate FPS
    const calculateFPS = () => {
      frameCountRef.current++;
      
      const now = performance.now();
      const elapsed = now - lastFrameTimeRef.current;
      
      // Update FPS every second
      if (elapsed >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCountRef.current * 1000) / elapsed),
        }));
        
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      
      // Get memory info if available
      if (window.performance && (performance as any).memory) {
        setMetrics(prev => ({
          ...prev,
          memory: (performance as any).memory,
        }));
      }
      
      requestAnimationFrame(calculateFPS);
    };
    
    const frameId = requestAnimationFrame(calculateFPS);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
  
  // Track theme changes
  useEffect(() => {
    // Track theme or color mode changes
    if (lastThemeRef.current !== currentTheme || lastColorModeRef.current !== currentColorMode) {
      lastThemeRef.current = currentTheme;
      lastColorModeRef.current = currentColorMode;
      themeChangeCountRef.current++;
      
      setMetrics(prev => ({
        ...prev,
        themeChanges: themeChangeCountRef.current,
      }));
      
      // Measure render time after theme change
      const startTime = performance.now();
      
      // Use requestAnimationFrame to measure when the render completes
      requestAnimationFrame(() => {
        const renderTime = performance.now() - startTime;
        setMetrics(prev => ({
          ...prev,
          renderTime,
        }));
      });
    }
    
    // Track context updates
    updateCountRef.current++;
    setMetrics(prev => ({
      ...prev,
      contextUpdates: updateCountRef.current,
    }));
  }, [currentTheme, currentColorMode]);
  
  // Render the performance monitor
  return (
    <MonitorContainer position={position} isMinimized={isMinimized} style={style}>
      <MonitorHeader onClick={() => setIsMinimized(!isMinimized)}>
        <MonitorTitle>
          {isMinimized ? 'PERF' : 'Theme Performance Monitor'}
        </MonitorTitle>
        {!isMinimized && (
          <ToggleButton onClick={(e) => {
            e.stopPropagation();
            setShowAdvancedInfo(!showAdvancedInfo);
          }}>
            {showAdvancedInfo ? 'Basic' : 'Advanced'}
          </ToggleButton>
        )}
      </MonitorHeader>
      
      <MonitorContent isMinimized={isMinimized}>
        <MetricRow>
          <MetricLabel>FPS:</MetricLabel>
          <MetricValue isWarning={metrics.fps < 50} isError={metrics.fps < 30}>
            {metrics.fps}
          </MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Render Time:</MetricLabel>
          <MetricValue isWarning={metrics.renderTime > 50} isError={metrics.renderTime > 100}>
            {metrics.renderTime.toFixed(2)} ms
          </MetricValue>
        </MetricRow>
        
        {metrics.memory && (
          <MetricRow>
            <MetricLabel>Memory:</MetricLabel>
            <MetricValue isWarning={metrics.memory.usedJSHeapSize > metrics.memory.totalJSHeapSize * 0.7}>
              {formatBytes(metrics.memory.usedJSHeapSize)}
            </MetricValue>
          </MetricRow>
        )}
        
        {showAdvancedInfo && (
          <>
            <SectionTitle>Theme Info</SectionTitle>
            
            <ThemeInfo>
              <div>Theme: {currentTheme}</div>
              <div>Color Mode: {currentColorMode}</div>
              <div>Dark Mode: {isDark ? 'Yes' : 'No'}</div>
              <div>Quality Tier: {qualityTier}</div>
              <div>Reduced Motion: {reducedMotion ? 'Yes' : 'No'}</div>
            </ThemeInfo>
            
            <SectionTitle>Context Updates</SectionTitle>
            
            <MetricRow>
              <MetricLabel>Context Updates:</MetricLabel>
              <MetricValue>{metrics.contextUpdates}</MetricValue>
            </MetricRow>
            
            <MetricRow>
              <MetricLabel>Theme Changes:</MetricLabel>
              <MetricValue>{metrics.themeChanges}</MetricValue>
            </MetricRow>
            
            {metrics.memory && (
              <>
                <SectionTitle>Memory Details</SectionTitle>
                
                <MetricRow>
                  <MetricLabel>Used Heap:</MetricLabel>
                  <MetricValue>
                    {formatBytes(metrics.memory.usedJSHeapSize)}
                  </MetricValue>
                </MetricRow>
                
                <MetricRow>
                  <MetricLabel>Total Heap:</MetricLabel>
                  <MetricValue>
                    {formatBytes(metrics.memory.totalJSHeapSize)}
                  </MetricValue>
                </MetricRow>
                
                <MetricRow>
                  <MetricLabel>Heap Limit:</MetricLabel>
                  <MetricValue>
                    {formatBytes(metrics.memory.jsHeapSizeLimit)}
                  </MetricValue>
                </MetricRow>
              </>
            )}
          </>
        )}
      </MonitorContent>
    </MonitorContainer>
  );
};

export default ThemePerformanceMonitor;