import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useGlassPerformance } from '../../hooks/useGlassPerformance';
import { detectFeatures, GLASS_REQUIREMENTS } from '../../utils/browserCompatibility';
import { DeviceCapabilityTier, getDeviceCapabilityTier } from '../../utils/deviceCapabilities';
import { OptimizationLevel } from '../../utils/performanceOptimizations';
import { Box } from '../Box';
import { Button } from '../Button';
import { Divider } from '../Divider';
import { Icon } from '../Icon';
import { Typography } from '../Typography';

import { PerformanceMonitorProps } from './types';

// Performance metrics interface
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
  glassEffectsRenderTime: number;
  layoutTime: number;
  paintTime: number;
  jankScore: number;
  deviceTier: DeviceCapabilityTier;
}

// Helper to format bytes to readable format
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to get a human-readable device tier label
const getDeviceTierLabel = (tier: DeviceCapabilityTier): string => {
  if (
    typeof tier === 'string' &&
    tier !== DeviceCapabilityTier.ULTRA &&
    tier !== DeviceCapabilityTier.HIGH &&
    tier !== DeviceCapabilityTier.MEDIUM &&
    tier !== DeviceCapabilityTier.LOW &&
    tier !== DeviceCapabilityTier.MINIMAL
  ) {
    return 'Unknown';
  }

  switch (tier) {
    case DeviceCapabilityTier.ULTRA:
      return 'Ultra High';
    case DeviceCapabilityTier.HIGH:
      return 'High';
    case DeviceCapabilityTier.MEDIUM:
      return 'Medium';
    case DeviceCapabilityTier.LOW:
      return 'Low';
    case DeviceCapabilityTier.MINIMAL:
      return 'Minimal';
    default:
      return 'Unknown';
  }
};

// Styled components
const MonitorContainer = styled.div<{
  $position: string;
  $isMinimized: boolean;
  $transparent: boolean;
  $glassIntensity: number;
}>`
  position: fixed;
  z-index: 9999;
  padding: ${({ $isMinimized }) => ($isMinimized ? '0.5rem' : '0.75rem 1rem')};
  border-radius: 8px;
  width: ${({ $isMinimized }) => ($isMinimized ? 'auto' : '300px')};
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: ${({ $isMinimized }) => ($isMinimized ? '40px' : '80vh')};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  ${({ $position }) => {
    switch ($position) {
      case 'top-left':
        return `
          top: 20px;
          left: 20px;
        `;
      case 'top-right':
        return `
          top: 20px;
          right: 20px;
        `;
      case 'bottom-left':
        return `
          bottom: 20px;
          left: 20px;
        `;
      case 'bottom-right':
      default:
        return `
          bottom: 20px;
          right: 20px;
        `;
    }
  }}

  ${({ theme, $glassIntensity, $transparent }) => {
    if (!$transparent) {
      const themeContext = createThemeContext(theme);
      return glassSurface({
        elevation: $glassIntensity,
        backgroundOpacity: 0.7,
        blurStrength: '8px',
        themeContext,
      });
    }
    return `
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
    `;
  }}
  
  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '1px',
      opacity: 0.3,
      themeContext,
    });
  }}
`;

const MonitorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ children }) => (children === null ? '0' : '0.75rem')};
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const MetricLabel = styled.span`
  opacity: 0.85;
`;

const MetricValue = styled.span<{ $warning?: boolean }>`
  font-family: monospace;
  ${({ $warning }) =>
    $warning &&
    `
    color: #ffcc00;
    font-weight: bold;
  `}
`;

const ChartContainer = styled.div`
  height: 80px;
  margin: 0.75rem 0;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ChartBar = styled.div<{ $height: number; $color: string }>`
  position: absolute;
  bottom: 0;
  width: 2px;
  height: ${({ $height }) => `${$height}%`};
  background-color: ${({ $color }) => $color};
  transition: height 0.1s ease;
`;

const StatusIndicator = styled.div<{ $status: 'good' | 'warning' | 'critical' }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${({ $status }) =>
    $status === 'good' ? '#4caf50' : $status === 'warning' ? '#ff9800' : '#f44336'};
`;

// Create styled components for buttons with compact styling
const CompactButton = styled(Button)`
  min-width: unset;
  padding: 4px;
`;

// Create styled Box component
const ButtonsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

/**
 * PerformanceMonitor component for tracking and displaying real-time performance metrics
 */
export const PerformanceMonitor = forwardRef<HTMLDivElement, PerformanceMonitorProps>(
  (
    {
      position = 'bottom-right',
      startMinimized = false,
      showAdvanced = false,
      className,
      style,
      autoAdapt = true,
      showBudget = true,
      monitorMemory = true,
      transparent = false,
      logToConsole = false,
      refreshInterval = 1000,
      footer,
      showChart = true,
      historyDuration = 30,
      trackEvent,
      glassIntensity = 0.7,
      ...rest
    }: PerformanceMonitorProps,
    ref
  ) => {
    // State
    const [isMinimized, setIsMinimized] = useState(startMinimized);
    const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(showAdvanced);
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
      fps: 0,
      memory: null,
      renderTime: 0,
      contextUpdates: 0,
      themeChanges: 0,
      glassEffectsRenderTime: 0,
      layoutTime: 0,
      paintTime: 0,
      jankScore: 0,
      deviceTier: DeviceCapabilityTier.MEDIUM,
    });
    const [fpsHistory, setFpsHistory] = useState<number[]>([]);
    const [optimization, setOptimization] = useState<OptimizationLevel>(OptimizationLevel.NONE);

    // Refs
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const animFrameRef = useRef<number | null>(null);
    const lastRenderTimeRef = useRef(0);

    // Get glass performance metrics - remove unsupported properties
    const glassPerformance = useGlassPerformance({});

    // Function to measure FPS
    const measurePerformance = useCallback(() => {
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        // Calculate FPS
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);

        // Get memory info if available
        const memory = (performance as any).memory
          ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            }
          : null;

        // Calculate render time
        const renderTime = lastRenderTimeRef.current;

        // Get device tier
        const deviceTier = getDeviceCapabilityTier();

        // Create updated metrics
        const updatedMetrics: PerformanceMetrics = {
          fps,
          memory: monitorMemory ? memory : null,
          renderTime,
          contextUpdates: 0, // TODO: Track context updates
          themeChanges: 0, // TODO: Track theme changes
          glassEffectsRenderTime: glassPerformance?.metrics?.styleCalculationTime || 0,
          layoutTime: 0, // TODO: Track layout time
          paintTime: 0, // TODO: Track paint time
          jankScore: glassPerformance?.metrics?.jankScore || 0,
          deviceTier,
        };

        // Update state
        setMetrics(updatedMetrics);

        // Update FPS history
        setFpsHistory(prev => {
          // Only keep enough history for historyDuration
          const maxEntries = Math.ceil(historyDuration * (1000 / refreshInterval));
          const newHistory = [...prev, fps].slice(-maxEntries);
          return newHistory;
        });

        // Adapt optimization level if needed
        if (autoAdapt && fps < 30) {
          const newLevel = fps < 20 ? OptimizationLevel.AGGRESSIVE : OptimizationLevel.MODERATE;

          setOptimization(newLevel);
        } else if (autoAdapt && fps > 55 && optimization !== OptimizationLevel.NONE) {
          setOptimization(fps > 58 ? OptimizationLevel.NONE : OptimizationLevel.LIGHT);
        }

        // Log to console if enabled
        if (logToConsole) {
          console.log('[Performance Monitor]', updatedMetrics);
        }

        // Reset counters
        frameCountRef.current = 0;
        lastTimeRef.current = now;
        lastRenderTimeRef.current = 0;
      } else {
        // Increment frame counter
        frameCountRef.current++;

        // Track render time
        const renderTime = performance.now() - now;
        lastRenderTimeRef.current = (lastRenderTimeRef.current + renderTime) / 2;
      }

      // Schedule next measurement
      animFrameRef.current = requestAnimationFrame(measurePerformance);
    }, [
      refreshInterval,
      monitorMemory,
      historyDuration,
      autoAdapt,
      optimization,
      logToConsole,
      glassPerformance,
    ]);

    // Start/stop performance measurement
    useEffect(() => {
      // Initialize
      frameCountRef.current = 0;
      lastTimeRef.current = performance.now();

      // Start measurement loop
      animFrameRef.current = requestAnimationFrame(measurePerformance);

      // Cleanup
      return () => {
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }, [measurePerformance]);

    // Toggle minimized state
    const toggleMinimized = () => {
      setIsMinimized(prev => !prev);
    };

    // Toggle advanced metrics
    const toggleAdvancedMetrics = () => {
      setShowAdvancedMetrics(prev => !prev);
    };

    // Get status based on FPS
    const getStatus = (fps: number): 'good' | 'warning' | 'critical' => {
      if (fps >= 55) return 'good';
      if (fps >= 30) return 'warning';
      return 'critical';
    };

    // Get color for chart bars
    const getChartColor = (fps: number): string => {
      if (fps >= 55) return '#4caf50';
      if (fps >= 30) return '#ff9800';
      return '#f44336';
    };

    const deviceTierLabel = typeof metrics.deviceTier === 'string' ? metrics.deviceTier : 'unknown';

    // Use type assertion for browser feature check
    const browserFeatures = detectFeatures();
    const browserSupport = (browserFeatures as any)?.meetsRequirements?.(
      (GLASS_REQUIREMENTS as any)?.MINIMAL
    );

    return (
      <MonitorContainer
        ref={ref}
        className={className}
        style={style}
        $position={position}
        $isMinimized={isMinimized}
        $transparent={transparent}
        $glassIntensity={glassIntensity}
        {...rest}
      >
        <MonitorHeader>
          <Box display="flex" alignItems="center">
            <StatusIndicator $status={getStatus(metrics.fps)} />
            {!isMinimized && <Typography variant="subtitle2">Performance Monitor</Typography>}
            {isMinimized && <Typography variant="subtitle2">{`${metrics.fps} FPS`}</Typography>}
          </Box>

          <ButtonsContainer>
            {!isMinimized && (
              <CompactButton
                variant="text"
                size="small"
                onClick={toggleAdvancedMetrics}
                aria-label={showAdvancedMetrics ? 'Hide advanced' : 'Show advanced'}
              >
                <Icon>{showAdvancedMetrics ? 'expand_less' : 'expand_more'}</Icon>
              </CompactButton>
            )}

            <CompactButton
              variant="text"
              size="small"
              onClick={toggleMinimized}
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Icon>{isMinimized ? 'fullscreen' : 'fullscreen_exit'}</Icon>
            </CompactButton>
          </ButtonsContainer>
        </MonitorHeader>

        {!isMinimized && (
          <>
            {/* FPS Chart */}
            {showChart && (
              <ChartContainer>
                {fpsHistory.map((fps, index) => (
                  <ChartBar
                    key={index}
                    $height={Math.min((fps / 60) * 100, 100)}
                    $color={getChartColor(fps)}
                    style={{
                      left: `${(index / fpsHistory.length) * 100}%`,
                      width: `${100 / Math.max(fpsHistory.length, 1)}%`,
                    }}
                  />
                ))}
              </ChartContainer>
            )}

            {/* Basic Metrics */}
            <Box mt={1}>
              <MetricRow>
                <MetricLabel>FPS</MetricLabel>
                <MetricValue $warning={metrics.fps < 30}>{metrics.fps}</MetricValue>
              </MetricRow>

              <MetricRow>
                <MetricLabel>Device Tier</MetricLabel>
                <MetricValue>{getDeviceTierLabel(metrics.deviceTier)}</MetricValue>
              </MetricRow>

              <MetricRow>
                <MetricLabel>Optimization</MetricLabel>
                <MetricValue>{optimization}</MetricValue>
              </MetricRow>

              {metrics.memory && (
                <MetricRow>
                  <MetricLabel>Memory Usage</MetricLabel>
                  <MetricValue>
                    {formatBytes(metrics.memory.usedJSHeapSize)} /{' '}
                    {formatBytes(metrics.memory.totalJSHeapSize)}
                  </MetricValue>
                </MetricRow>
              )}

              {showBudget && (
                <MetricRow>
                  <MetricLabel>Jank Score</MetricLabel>
                  <MetricValue $warning={metrics.jankScore > 5}>
                    {metrics.jankScore.toFixed(1)}
                  </MetricValue>
                </MetricRow>
              )}
            </Box>

            {/* Advanced Metrics */}
            {showAdvancedMetrics && (
              <>
                <Divider style={{ margin: '0.75rem 0' }} />

                <Box>
                  <Typography variant="caption" style={{ opacity: 0.7 }}>
                    Advanced Metrics
                  </Typography>

                  <MetricRow>
                    <MetricLabel>Glass Render Time</MetricLabel>
                    <MetricValue>{metrics.glassEffectsRenderTime.toFixed(2)} ms</MetricValue>
                  </MetricRow>

                  <MetricRow>
                    <MetricLabel>Render Time</MetricLabel>
                    <MetricValue>{metrics.renderTime.toFixed(2)} ms</MetricValue>
                  </MetricRow>

                  {glassPerformance?.metrics?.recalculateStyleCount !== undefined && (
                    <MetricRow>
                      <MetricLabel>Style Recalculations</MetricLabel>
                      <MetricValue>{glassPerformance.metrics.recalculateStyleCount}</MetricValue>
                    </MetricRow>
                  )}

                  {glassPerformance?.metrics?.layoutCount !== undefined && (
                    <MetricRow>
                      <MetricLabel>Layout Operations</MetricLabel>
                      <MetricValue>{glassPerformance.metrics.layoutCount}</MetricValue>
                    </MetricRow>
                  )}

                  <MetricRow>
                    <MetricLabel>Browser Support</MetricLabel>
                    <MetricValue>{browserSupport ? 'Compatible' : 'Limited'}</MetricValue>
                  </MetricRow>
                </Box>
              </>
            )}

            {/* Footer */}
            {footer && (
              <>
                <Divider style={{ margin: '0.75rem 0' }} />
                {footer}
              </>
            )}
          </>
        )}
      </MonitorContainer>
    );
  }
);

PerformanceMonitor.displayName = 'PerformanceMonitor';
