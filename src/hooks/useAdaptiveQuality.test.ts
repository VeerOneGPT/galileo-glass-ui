// src/hooks/useAdaptiveQuality.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAdaptiveQuality } from './useAdaptiveQuality';
import { QualityTier } from '../types/accessibility';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator properties
const navigatorMock = (capabilities: Partial<{
  hardwareConcurrency: number;
  deviceMemory: number;
  connection: Partial<{
    effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    type: string;
    saveData: boolean;
  }>;
}>) => {
  Object.defineProperty(global.navigator, 'hardwareConcurrency', { 
    value: capabilities.hardwareConcurrency, 
    configurable: true 
  });
  
  Object.defineProperty(global.navigator, 'deviceMemory', { 
    value: capabilities.deviceMemory, 
    configurable: true 
  });
  
  Object.defineProperty(global.navigator, 'connection', { 
    value: capabilities.connection, 
    configurable: true 
  });
};

describe('useAdaptiveQuality', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });
  
  it('should return LOW for minimal capabilities', () => {
    navigatorMock({
      hardwareConcurrency: 2,
      deviceMemory: 2,
      connection: { effectiveType: '3g', saveData: false }
    });
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.qualityTier).toBe(QualityTier.LOW);
  });

  it('should return MEDIUM for mid-range capabilities', () => {
    navigatorMock({
      hardwareConcurrency: 4,
      deviceMemory: 4,
      connection: { effectiveType: '4g', saveData: false }
    });
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.qualityTier).toBe(QualityTier.MEDIUM);
  });

  it('should return HIGH for good capabilities', () => {
    navigatorMock({
      hardwareConcurrency: 8,
      deviceMemory: 8,
      connection: { effectiveType: '4g', saveData: false }
    });
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.qualityTier).toBe(QualityTier.HIGH);
  });

  it('should return ULTRA for high-end capabilities', () => {
    navigatorMock({
      hardwareConcurrency: 16,
      deviceMemory: 16,
      connection: { effectiveType: '4g', saveData: false }
    });
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.qualityTier).toBe(QualityTier.ULTRA);
  });

  it('should apply user preference over detected tier', () => {
    navigatorMock({
      hardwareConcurrency: 16,
      deviceMemory: 16
    });
    
    localStorageMock.setItem('galileo-glass-quality-preference', JSON.stringify(QualityTier.LOW));
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.qualityTier).toBe(QualityTier.LOW);
    expect(result.current.isUserPreferred).toBe(true);
  });

  it('should allow resetting to auto-detected tier', () => {
    navigatorMock({
      hardwareConcurrency: 8,
      deviceMemory: 8
    });
    
    localStorageMock.setItem('galileo-glass-quality-preference', JSON.stringify(QualityTier.LOW));
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.qualityTier).toBe(QualityTier.LOW);
    
    act(() => {
      result.current.resetToAutoDetect();
    });
    
    expect(result.current.qualityTier).toBe(QualityTier.HIGH);
    expect(result.current.isUserPreferred).toBe(false);
  });

  it('should cap at MEDIUM when saveData is true', () => {
    navigatorMock({
      hardwareConcurrency: 16,
      deviceMemory: 16,
      connection: { effectiveType: '4g', saveData: true }
    });
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.qualityTier).toBe(QualityTier.MEDIUM);
  });

  it('should return adaptive settings based on quality tier', () => {
    navigatorMock({
      hardwareConcurrency: 8,
      deviceMemory: 8
    });
    
    const { result } = renderHook(() => useAdaptiveQuality());
    expect(result.current.adaptiveSettings).toHaveProperty('maxParticles');
    expect(result.current.adaptiveSettings).toHaveProperty('enableBlurEffects');
    expect(result.current.adaptiveSettings.physicsAccuracy).toBe('standard');
  });
});