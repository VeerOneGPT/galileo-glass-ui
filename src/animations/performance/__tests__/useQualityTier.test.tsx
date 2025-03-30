import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useQualityTier } from '../useQualityTier';
import { QualityTier } from '../types';
import { DeviceTier, DeviceType } from '../useDeviceCapabilities';

// Mock the useDeviceCapabilities hook
jest.mock('../useDeviceCapabilities', () => {
  return {
    __esModule: true,
    default: jest.fn(),
    DeviceTier: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      ULTRA: 'ultra'
    },
    DeviceType: {
      MOBILE: 'mobile',
      TABLET: 'tablet',
      DESKTOP: 'desktop',
      UNKNOWN: 'unknown'
    }
  };
});

// Import the mocked module to control its behavior
import useDeviceCapabilities from '../useDeviceCapabilities';

describe('useQualityTier', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  
  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 0) as unknown as number;
  };
  
  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
  
  // Mock performance.now
  let mockTime = 0;
  const originalPerformanceNow = performance.now;
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockTime = 0;
    
    // Reset performance.now mock
    performance.now = originalPerformanceNow;
    
    // Default device capabilities
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      deviceTier: DeviceTier.MEDIUM,
      deviceType: DeviceType.DESKTOP,
      cpuCores: 4,
      webglSupport: true,
      prefersReducedMotion: false,
      batterySaving: false
    });
  });
  
  test('should return a default quality tier', () => {
    const { result } = renderHook(() => useQualityTier());
    
    expect(result.current.qualityTier).toBeDefined();
    expect(result.current.featureFlags).toBeDefined();
  });
  
  test('should map device tier to quality tier', () => {
    // High-end device
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      deviceTier: DeviceTier.HIGH,
      deviceType: DeviceType.DESKTOP,
      cpuCores: 8,
      webglSupport: true,
      prefersReducedMotion: false,
      batterySaving: false
    });
    
    const { result: highEndResult } = renderHook(() => useQualityTier());
    expect(highEndResult.current.qualityTier).toBe(QualityTier.HIGH);
    
    // Low-end device
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      deviceTier: DeviceTier.LOW,
      deviceType: DeviceType.MOBILE,
      cpuCores: 2,
      webglSupport: true,
      prefersReducedMotion: false,
      batterySaving: false
    });
    
    const { result: lowEndResult } = renderHook(() => useQualityTier());
    expect(lowEndResult.current.qualityTier).toBe(QualityTier.MINIMAL);
  });
  
  test('should respect user preferences', () => {
    localStorageMock.setItem('galileo-glass-quality-preference', QualityTier.LOW);
    
    const { result } = renderHook(() => useQualityTier());
    expect(result.current.qualityTier).toBe(QualityTier.LOW);
  });
  
  test('should allow manual setting of quality tier', () => {
    const { result } = renderHook(() => useQualityTier());
    
    act(() => {
      result.current.setQualityPreference(QualityTier.ULTRA);
    });
    
    expect(result.current.qualityTier).toBe(QualityTier.ULTRA);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'galileo-glass-quality-preference', 
      QualityTier.ULTRA
    );
  });
  
  test('should reset to automatic tier detection', () => {
    localStorageMock.setItem('galileo-glass-quality-preference', QualityTier.LOW);
    
    const { result } = renderHook(() => useQualityTier());
    expect(result.current.qualityTier).toBe(QualityTier.LOW);
    
    act(() => {
      result.current.resetQualityToAuto();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalled();
    // Should now be based on device tier which is mocked as MEDIUM
    expect(result.current.qualityTier).toBe(QualityTier.MEDIUM);
  });
  
  test('should reduce quality tier when battery saving is active', () => {
    // Set up a high-end device with battery saving mode
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      deviceTier: DeviceTier.HIGH,
      deviceType: DeviceType.DESKTOP,
      cpuCores: 8,
      webglSupport: true,
      prefersReducedMotion: false,
      batterySaving: true // Battery saving active
    });
    
    const { result } = renderHook(() => useQualityTier({
      reduceTierOnBatterySaving: true // Explicitly enable the feature
    }));
    
    // Should have been reduced from HIGH to MEDIUM
    expect(result.current.qualityTier).toBe(QualityTier.MEDIUM);
  });
  
  test('should use minimal tier for reduced motion preference', () => {
    // Set up a high-end device with reduced motion preference
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      deviceTier: DeviceTier.HIGH,
      deviceType: DeviceType.DESKTOP,
      cpuCores: 8,
      webglSupport: true,
      prefersReducedMotion: true, // Reduced motion preference
      batterySaving: false
    });
    
    const { result } = renderHook(() => useQualityTier());
    
    // Should use minimal tier for accessibility
    expect(result.current.qualityTier).toBe(QualityTier.MINIMAL);
  });
  
  test('should start and stop performance monitoring', () => {
    const { result } = renderHook(() => useQualityTier());
    
    // Initially not monitoring
    expect(result.current.isPerformanceMonitoring).toBe(false);
    
    // Start monitoring
    act(() => {
      result.current.startPerformanceMonitoring();
    });
    
    expect(result.current.isPerformanceMonitoring).toBe(true);
    
    // Stop monitoring
    act(() => {
      result.current.stopPerformanceMonitoring();
    });
    
    expect(result.current.isPerformanceMonitoring).toBe(false);
  });
  
  test('should provide feature flags for the current quality tier', () => {
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      deviceTier: DeviceTier.HIGH,
      deviceType: DeviceType.DESKTOP,
      cpuCores: 8,
      webglSupport: true,
      prefersReducedMotion: false,
      batterySaving: false
    });
    
    const { result } = renderHook(() => useQualityTier());
    
    // Should have HIGH tier feature flags
    expect(result.current.qualityTier).toBe(QualityTier.HIGH);
    expect(result.current.featureFlags.blurEffects).toBe(true);
    expect(result.current.featureFlags.reflectionEffects).toBe(true);
    expect(result.current.featureFlags.highPrecisionPhysics).toBe(true);
    expect(result.current.featureFlags.maxParticles).toBe(200);
  });
}); 