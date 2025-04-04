import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import useDynamicResolutionScaling, { ResolutionScalingConfig } from '../dynamicResolutionScaling';
import { QualityTier } from '../types';
import { PhysicsSettings } from '../physicsSettings';
import { waitFor } from '@testing-library/react';

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

describe('useDynamicResolutionScaling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useQualityTier
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      currentFps: 60,
      isPerformanceMonitoring: true,
      startPerformanceMonitoring: jest.fn()
    });
    
    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(1000);
  });
  
  test('should provide resolution based on quality tier', () => {
    // Test with MEDIUM tier
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      currentFps: 60,
      isPerformanceMonitoring: true,
      startPerformanceMonitoring: jest.fn()
    });
    
    const { result: mediumResult } = renderHook(() => useDynamicResolutionScaling());
    expect(mediumResult.current.resolution).toBe(1.0);
    
    // Test with MINIMAL tier
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MINIMAL,
      currentFps: 30,
      isPerformanceMonitoring: true,
      startPerformanceMonitoring: jest.fn()
    });
    
    const { result: minimalResult } = renderHook(() => useDynamicResolutionScaling());
    expect(minimalResult.current.resolution).toBe(0.5);
    
    // Test with ULTRA tier
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.ULTRA,
      currentFps: 90,
      isPerformanceMonitoring: true,
      startPerformanceMonitoring: jest.fn()
    });
    
    const { result: ultraResult } = renderHook(() => useDynamicResolutionScaling());
    expect(ultraResult.current.resolution).toBe(1.25);
  });
  
  test('should allow custom configuration', () => {
    const customConfig: Partial<ResolutionScalingConfig> = {
      targetFps: 45,
      minResolution: 0.3,
      maxResolution: 0.8,
      initialResolution: 0.6
    };
    
    const { result } = renderHook(() => useDynamicResolutionScaling(customConfig));
    
    // Should use the custom initial resolution
    expect(result.current.resolution).toBe(0.6);
    
    // Config should include custom values
    expect(result.current.config.targetFps).toBe(45);
    expect(result.current.config.minResolution).toBe(0.3);
    expect(result.current.config.maxResolution).toBe(0.8);
  });
  
  test('should apply resolution to physics settings', () => {
    const { result } = renderHook(() => useDynamicResolutionScaling());
    
    // Create mock physics settings
    const settings: PhysicsSettings = {
      updateFrequency: 60,
      maxStepsPerFrame: 5,
      gravity: { x: 0, y: 9.8 },
      friction: 0.3,
      restitution: 0.2,
      restVelocityThreshold: 0.01,
      restAngularVelocityThreshold: 0.01,
      enableSleeping: true,
      sleepFrameThreshold: 60,
      solverIterations: 10,
      positionCorrectionStrength: 0.2,
      useContinuousCollisionDetection: false,
      spatialGridCellSize: 100,
      useSpatialPartitioning: true,
      simulationResolution: 1.0,
      maxDynamicBodies: 100,
      highPrecisionCalculations: false,
      airResistance: 0.02,
      useSIMD: true,
      maxSpatialDepth: 8,
      useWebWorkers: false,
      maxPenetrationDepth: 0.5,
      warmStartingStrength: 0.8
    };
    
    // Apply current resolution to settings
    const updatedSettings = result.current.applyResolutionToSettings(settings);
    
    // Should update simulationResolution to match current resolution
    expect(updatedSettings.simulationResolution).toBe(result.current.resolution);
    
    // Other settings should remain unchanged
    expect(updatedSettings.updateFrequency).toBe(settings.updateFrequency);
    expect(updatedSettings.gravity).toEqual(settings.gravity);
  });
  
  test('should decrease resolution when FPS is too low', async () => {
    // Mock performance now to advance time
    let currentTime = 1000;
    jest.spyOn(performance, 'now').mockImplementation(() => currentTime);
    
    // Setup with low FPS
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      currentFps: 30, // Well below target of 60
      isPerformanceMonitoring: true,
      startPerformanceMonitoring: jest.fn()
    });
    
    const { result, rerender } = renderHook(() => useDynamicResolutionScaling({
      updateInterval: 100
    }));
    
    // Initial resolution should be 1.0 for MEDIUM tier
    expect(result.current.resolution).toBe(1.0);
    
    // Advance time beyond update interval and rerender
    await act(async () => {
        currentTime += 200;
        rerender();
        // Wait briefly for potential async updates within the hook
        await waitFor(() => expect(result.current.resolution).not.toBe(1.0), { timeout: 50 });
    });
    
    // Resolution should decrease
    expect(result.current.resolution).toBeLessThan(1.0);
  });
  
  test('should increase resolution when FPS is high', async () => {
    // Mock performance now to advance time
    let currentTime = 1000;
    jest.spyOn(performance, 'now').mockImplementation(() => currentTime);
    
    // Setup with high FPS
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      currentFps: 90, // Well above target of 60
      isPerformanceMonitoring: true,
      startPerformanceMonitoring: jest.fn()
    });
    
    const { result, rerender } = renderHook(() => useDynamicResolutionScaling({
      updateInterval: 100,
      initialResolution: 0.7
    }));
    
    // Initial resolution should be 0.7 (custom)
    expect(result.current.resolution).toBe(0.7);
    
    // Advance time beyond update interval and rerender
    await act(async () => {
        currentTime += 200;
        rerender();
        // Wait briefly for potential async updates within the hook
        await waitFor(() => expect(result.current.resolution).not.toBe(0.7), { timeout: 50 });
    });
    
    // Resolution should increase
    expect(result.current.resolution).toBeGreaterThan(0.7);
  });
  
  test('should respect min and max resolution bounds', () => {
    const { result } = renderHook(() => useDynamicResolutionScaling({
      minResolution: 0.4,
      maxResolution: 1.2
    }));
    
    // Test setting below minimum
    act(() => {
      result.current.setResolution(0.1);
    });
    expect(result.current.resolution).toBe(0.4); // Should clamp to min
    
    // Test setting above maximum
    act(() => {
      result.current.setResolution(1.5);
    });
    expect(result.current.resolution).toBe(1.2); // Should clamp to max
    
    // Test setting within valid range
    act(() => {
      result.current.setResolution(0.8);
    });
    expect(result.current.resolution).toBe(0.8); // Should accept valid value
  });
  
  test('should allow enabling and disabling', () => {
    const mockStartMonitoring = jest.fn();
    (useQualityTier as jest.Mock).mockReturnValue({
      qualityTier: QualityTier.MEDIUM,
      currentFps: 60,
      isPerformanceMonitoring: false,
      startPerformanceMonitoring: mockStartMonitoring
    });
    
    const { result } = renderHook(() => useDynamicResolutionScaling({
      enabled: false // Start disabled
    }));
    
    // Should start disabled
    expect(result.current.isEnabled).toBe(false);
    
    // Enable
    act(() => {
      result.current.enable();
    });
    
    // Should be enabled and start monitoring
    expect(result.current.isEnabled).toBe(true);
    expect(mockStartMonitoring).toHaveBeenCalled();
    
    // Disable
    act(() => {
      result.current.disable();
    });
    
    // Should be disabled
    expect(result.current.isEnabled).toBe(false);
  });
  
  test('should reset resolution', () => {
    const { result } = renderHook(() => useDynamicResolutionScaling({
      initialResolution: 1.0
    }));
    
    // Change resolution
    act(() => {
      result.current.setResolution(0.7);
    });
    expect(result.current.resolution).toBe(0.7);
    
    // Reset resolution
    act(() => {
      result.current.resetResolution();
    });
    
    // Should go back to initial value
    expect(result.current.resolution).toBe(1.0);
  });
}); 