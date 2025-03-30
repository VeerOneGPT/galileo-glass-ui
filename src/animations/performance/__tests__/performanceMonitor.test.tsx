import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import usePerformanceMonitor, { PerformanceMetricType } from '../performanceMonitor';
import { QualityTier } from '../types';

// Mock the useQualityTier hook
jest.mock('../useQualityTier', () => {
  return {
    __esModule: true,
    useQualityTier: jest.fn(),
    QualityTier: {
      MINIMAL: 'minimal',
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      ULTRA: 'ultra'
    }
  };
});

// Import the mocked module to control its behavior
import { useQualityTier } from '../useQualityTier';

describe('usePerformanceMonitor', () => {
  // Mock requestAnimationFrame and performance.now
  const originalRAF = global.requestAnimationFrame;
  const originalCancelRAF = global.cancelAnimationFrame;
  const originalPerformanceNow = performance.now;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock performance.now to control timing
    let mockTime = 1000;
    performance.now = jest.fn(() => mockTime);
    
    // Mock requestAnimationFrame to execute immediately
    global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback): number => {
      mockTime += 16.67; // Simulate ~60fps
      setTimeout(() => cb(mockTime), 0);
      return 1; // Return a simple number handle
    });
    
    global.cancelAnimationFrame = jest.fn((id: number): void => clearTimeout(id));
    
    // Default mock implementation for useQualityTier
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      setQualityPreference: jest.fn(),
      featureFlags: { maxParticles: 100 },
      autoAdjusted: false,
      startPerformanceMonitoring: jest.fn(),
      stopPerformanceMonitoring: jest.fn()
    });
  });
  
  afterEach(() => {
    // Restore original functions
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCancelRAF;
    performance.now = originalPerformanceNow;
  });
  
  test('should start performance monitoring when enabled', () => {
    const mockStartMonitoring = jest.fn();
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      setQualityPreference: jest.fn(),
      featureFlags: {},
      autoAdjusted: false,
      startPerformanceMonitoring: mockStartMonitoring,
      stopPerformanceMonitoring: jest.fn()
    });
    
    const { result } = renderHook(() => usePerformanceMonitor({ enabled: true }));
    
    // Should call startPerformanceMonitoring from useQualityTier
    expect(mockStartMonitoring).toHaveBeenCalled();
    expect(result.current.isEnabled).toBe(true);
  });
  
  test('should stop performance monitoring when disabled', () => {
    const mockStopMonitoring = jest.fn();
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      setQualityPreference: jest.fn(),
      featureFlags: {},
      autoAdjusted: false,
      startPerformanceMonitoring: jest.fn(),
      stopPerformanceMonitoring: mockStopMonitoring
    });
    
    const { result } = renderHook(() => usePerformanceMonitor());
    
    act(() => {
      result.current.disable();
    });
    
    // Should call stopPerformanceMonitoring from useQualityTier
    expect(mockStopMonitoring).toHaveBeenCalled();
    expect(result.current.isEnabled).toBe(false);
  });
  
  test('should provide performance metrics', async () => {
    // Simulate frame time for ~30fps
    const mockFrameTime = 33.3;
    
    // Override requestAnimationFrame to simulate specific framerate
    global.requestAnimationFrame = jest.fn(cb => {
      performance.now = jest.fn(() => performance.now() + mockFrameTime);
      setTimeout(() => cb(performance.now()), 0);
      return 1; // Return a number (request ID)
    });
    
    const { result, waitForNextUpdate } = renderHook(() => usePerformanceMonitor({
      sampleInterval: 10, // Short interval for testing
      sampleSize: 5
    }));
    
    // Wait for a few frames to be processed
    await waitForNextUpdate();
    
    // Should have calculated FPS
    expect(result.current.fps).toBeDefined();
    
    // FPS should be approximately 30 (1000/33.3)
    expect(result.current.averageMetrics[PerformanceMetricType.FPS]).toBeCloseTo(30, 0);
  });
  
  test('should downgrade quality when performance is poor', () => {
    const mockSetQualityPreference = jest.fn();
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      setQualityPreference: mockSetQualityPreference,
      featureFlags: {},
      autoAdjusted: false,
      startPerformanceMonitoring: jest.fn(),
      stopPerformanceMonitoring: jest.fn()
    });
    
    const { result, rerender } = renderHook(() => usePerformanceMonitor({
      enabled: true,
      targetFps: 60,
      minFpsThreshold: 45,
      downgradeCooldown: 0, // No cooldown for testing
      sampleInterval: 10 // Short interval for testing
    }));
    
    // Modify the average metrics directly to simulate poor performance
    act(() => {
      (result.current as any).averageMetrics = {
        [PerformanceMetricType.FPS]: 30 // Well below threshold
      };
      (result.current as any).checkPerformance(30);
    });
    
    rerender();
    
    // Should have called setQualityPreference to downgrade
    expect(mockSetQualityPreference).toHaveBeenCalled();
    expect(result.current.isPerformanceIssue).toBe(true);
  });
  
  test('should upgrade quality when performance is good', () => {
    const mockSetQualityPreference = jest.fn();
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.LOW,
      setQualityPreference: mockSetQualityPreference,
      featureFlags: {},
      autoAdjusted: true, // Previously auto-adjusted
      startPerformanceMonitoring: jest.fn(),
      stopPerformanceMonitoring: jest.fn()
    });
    
    const { result, rerender } = renderHook(() => usePerformanceMonitor({
      enabled: true,
      targetFps: 60,
      upgradeCooldown: 0, // No cooldown for testing
      sampleInterval: 10 // Short interval for testing
    }));
    
    // Modify the average metrics directly to simulate good performance
    act(() => {
      (result.current as any).averageMetrics = {
        [PerformanceMetricType.FPS]: 90 // Well above target
      };
      (result.current as any).consecutiveHighFpsFrames = 30; // Enough frames above target
      (result.current as any).checkPerformance(90);
    });
    
    rerender();
    
    // Should have called setQualityPreference to upgrade
    expect(mockSetQualityPreference).toHaveBeenCalled();
    expect(result.current.isPerformanceIssue).toBe(false);
  });
  
  test('should provide current quality tier and feature flags', () => {
    const mockFeatureFlags = {
      maxParticles: 200,
      blurEffects: true,
      reflectionEffects: true
    };
    
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.HIGH,
      setQualityPreference: jest.fn(),
      featureFlags: mockFeatureFlags,
      autoAdjusted: false,
      startPerformanceMonitoring: jest.fn(),
      stopPerformanceMonitoring: jest.fn()
    });
    
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Should provide quality tier
    expect(result.current.qualityTier).toBe(QualityTier.HIGH);
    
    // Should provide feature flags
    expect(result.current.featureFlags).toBe(mockFeatureFlags);
  });
}); 