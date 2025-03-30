import { renderHook, act } from '@testing-library/react-hooks';
import { useAnimationPreferences, PreferenceMode } from '../useAnimationPreferences';
import { QualityTier } from '../useQualityTier';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAnimationPreferences', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });
  
  it('should initialize with default preferences', () => {
    const { result } = renderHook(() => useAnimationPreferences());
    
    expect(result.current.preferences).toEqual({
      mode: PreferenceMode.AUTO,
      qualityTier: QualityTier.MEDIUM,
      useCustomFeatures: false,
      customFeatures: {},
      prefersReducedMotion: false,
    });
  });
  
  it('should update preference mode', () => {
    const { result } = renderHook(() => useAnimationPreferences());
    
    act(() => {
      result.current.updatePreferenceMode(PreferenceMode.BATTERY_SAVER);
    });
    
    // Should have battery saver mode with its preset values
    expect(result.current.preferences.mode).toBe(PreferenceMode.BATTERY_SAVER);
    expect(result.current.preferences.qualityTier).toBe(QualityTier.LOW);
    expect(result.current.preferences.useCustomFeatures).toBe(true);
    expect(result.current.preferences.customFeatures).toHaveProperty('blurEffects', false);
    
    // Should save to localStorage
    expect(window.localStorage.getItem('galileo-glass-preference-mode')).toBe(PreferenceMode.BATTERY_SAVER);
    expect(window.localStorage.getItem('galileo-glass-battery-saver')).toBe('true');
  });
  
  it('should update quality tier and switch to custom mode', () => {
    const { result } = renderHook(() => useAnimationPreferences());
    
    act(() => {
      result.current.updateQualityTier(QualityTier.ULTRA);
    });
    
    expect(result.current.preferences.qualityTier).toBe(QualityTier.ULTRA);
    expect(result.current.preferences.mode).toBe(PreferenceMode.CUSTOM);
    
    // Should save to localStorage
    expect(window.localStorage.getItem('galileo-glass-quality-preference')).toBe(QualityTier.ULTRA);
    expect(window.localStorage.getItem('galileo-glass-preference-mode')).toBe(PreferenceMode.CUSTOM);
  });
  
  it('should update custom features', () => {
    const { result } = renderHook(() => useAnimationPreferences());
    
    const customFeatures = {
      maxParticles: 50,
      blurEffects: true,
      textureScale: 0.75,
    };
    
    act(() => {
      result.current.updateCustomFeatures(customFeatures);
    });
    
    expect(result.current.preferences.useCustomFeatures).toBe(true);
    expect(result.current.preferences.customFeatures).toEqual(customFeatures);
    expect(result.current.preferences.mode).toBe(PreferenceMode.CUSTOM);
    
    // Should save to localStorage
    expect(window.localStorage.getItem('galileo-glass-custom-features')).toBe(JSON.stringify(customFeatures));
    expect(window.localStorage.getItem('galileo-glass-preference-mode')).toBe(PreferenceMode.CUSTOM);
  });
  
  it('should toggle reduced motion preference', () => {
    const { result } = renderHook(() => useAnimationPreferences());
    
    act(() => {
      result.current.toggleReducedMotion(true);
    });
    
    expect(result.current.preferences.prefersReducedMotion).toBe(true);
    
    // Should save to localStorage
    expect(window.localStorage.getItem('galileo-glass-reduced-motion')).toBe('true');
    
    act(() => {
      result.current.toggleReducedMotion(false);
    });
    
    expect(result.current.preferences.prefersReducedMotion).toBe(false);
    expect(window.localStorage.getItem('galileo-glass-reduced-motion')).toBe('false');
  });
  
  it('should toggle battery saver mode', () => {
    const { result } = renderHook(() => useAnimationPreferences());
    
    act(() => {
      result.current.toggleBatterySaver(true);
    });
    
    expect(result.current.preferences.mode).toBe(PreferenceMode.BATTERY_SAVER);
    
    act(() => {
      result.current.toggleBatterySaver(false);
    });
    
    expect(result.current.preferences.mode).toBe(PreferenceMode.AUTO);
  });
  
  it('should reset preferences to defaults', () => {
    const { result } = renderHook(() => useAnimationPreferences());
    
    // First set some non-default preferences
    act(() => {
      result.current.updateQualityTier(QualityTier.ULTRA);
      result.current.toggleReducedMotion(true);
    });
    
    // Then reset
    act(() => {
      result.current.resetPreferences();
    });
    
    expect(result.current.preferences).toEqual({
      mode: PreferenceMode.AUTO,
      qualityTier: QualityTier.MEDIUM,
      useCustomFeatures: false,
      customFeatures: {},
      prefersReducedMotion: false,
    });
    
    // Should clear localStorage
    expect(window.localStorage.getItem('galileo-glass-preference-mode')).toBeNull();
    expect(window.localStorage.getItem('galileo-glass-quality-preference')).toBeNull();
    expect(window.localStorage.getItem('galileo-glass-reduced-motion')).toBeNull();
  });
  
  it('should load preferences from localStorage on mount', () => {
    // Set up localStorage with some preferences
    window.localStorage.setItem('galileo-glass-preference-mode', PreferenceMode.QUALITY);
    window.localStorage.setItem('galileo-glass-quality-preference', QualityTier.HIGH);
    window.localStorage.setItem('galileo-glass-reduced-motion', 'true');
    
    const { result } = renderHook(() => useAnimationPreferences());
    
    // Should load preferences from localStorage
    expect(result.current.preferences.mode).toBe(PreferenceMode.QUALITY);
    expect(result.current.preferences.qualityTier).toBe(QualityTier.HIGH);
    expect(result.current.preferences.prefersReducedMotion).toBe(true);
  });
  
  it('should respect persistPreferences option', () => {
    const { result } = renderHook(() => useAnimationPreferences({ persistPreferences: false }));
    
    act(() => {
      result.current.updateQualityTier(QualityTier.ULTRA);
    });
    
    // Should not save to localStorage when persistPreferences is false
    expect(window.localStorage.getItem('galileo-glass-quality-preference')).toBeNull();
  });
  
  it('should respect custom storage key prefix', () => {
    const customPrefix = 'custom-prefix-';
    const { result } = renderHook(() => useAnimationPreferences({ storageKeyPrefix: customPrefix }));
    
    act(() => {
      result.current.updatePreferenceMode(PreferenceMode.PERFORMANCE);
    });
    
    // Should use custom prefix for storage keys
    expect(window.localStorage.getItem(`${customPrefix}preference-mode`)).toBe(PreferenceMode.PERFORMANCE);
  });
}); 