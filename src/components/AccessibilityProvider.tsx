/**
 * AccessibilityProvider Component
 * 
 * A component that provides accessibility features for the Glass UI system
 */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useReducedMotion } from '../hooks';

/**
 * Accessibility options
 */
export interface AccessibilityOptions {
  /**
   * Whether reduced motion is enabled
   */
  reducedMotion: boolean;
  
  /**
   * Whether high contrast mode is enabled
   */
  highContrast: boolean;
  
  /**
   * Whether to reduce transparency effects
   */
  reduceTransparency: boolean;
  
  /**
   * Whether to disable animations completely
   */
  disableAnimations: boolean;
  
  /**
   * Font size scaling factor
   */
  fontScale: number;
  
  /**
   * Whether focus indicators should be enhanced
   */
  enhancedFocus: boolean;
  
  /**
   * Whether to enable screen reader support
   */
  screenReaderSupport: boolean;
  
  /**
   * Whether keyboard navigation indicators should be shown
   */
  keyboardNavigation: boolean;
}

/**
 * Context value with options and setters
 */
export interface AccessibilityContextValue extends AccessibilityOptions {
  /**
   * Set reduced motion preference
   */
  setReducedMotion: (value: boolean) => void;
  
  /**
   * Set high contrast preference
   */
  setHighContrast: (value: boolean) => void;
  
  /**
   * Set reduce transparency preference
   */
  setReduceTransparency: (value: boolean) => void;
  
  /**
   * Set disable animations preference
   */
  setDisableAnimations: (value: boolean) => void;
  
  /**
   * Set font scale preference
   */
  setFontScale: (value: number) => void;
  
  /**
   * Set enhanced focus preference
   */
  setEnhancedFocus: (value: boolean) => void;
  
  /**
   * Set screen reader support preference
   */
  setScreenReaderSupport: (value: boolean) => void;
  
  /**
   * Set keyboard navigation preference
   */
  setKeyboardNavigation: (value: boolean) => void;
}

/**
 * Default accessibility options
 */
const DEFAULT_OPTIONS: AccessibilityOptions = {
  reducedMotion: false,
  highContrast: false,
  reduceTransparency: false,
  disableAnimations: false,
  fontScale: 1,
  enhancedFocus: true,
  screenReaderSupport: true,
  keyboardNavigation: true
};

/**
 * Create context with default value
 */
const AccessibilityContext = createContext<AccessibilityContextValue>({
  ...DEFAULT_OPTIONS,
  setReducedMotion: () => {},
  setHighContrast: () => {},
  setReduceTransparency: () => {},
  setDisableAnimations: () => {},
  setFontScale: () => {},
  setEnhancedFocus: () => {},
  setScreenReaderSupport: () => {},
  setKeyboardNavigation: () => {}
});

/**
 * Props for AccessibilityProvider
 */
export interface AccessibilityProviderProps {
  /**
   * Initial accessibility options
   */
  initialOptions?: Partial<AccessibilityOptions>;
  
  /**
   * Whether to listen to system preferences
   */
  listenToSystemPreferences?: boolean;
  
  /**
   * Whether to persist preferences in localStorage
   */
  persistPreferences?: boolean;
  
  /**
   * Storage key for persisted preferences
   */
  storageKey?: string;
  
  /**
   * Children elements
   */
  children: React.ReactNode;
}

/**
 * AccessibilityProvider component
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  initialOptions = {},
  listenToSystemPreferences = true,
  persistPreferences = true,
  storageKey = 'glass-ui-accessibility',
  children
}) => {
  // Get system reduced motion preference
  const systemReducedMotion = useReducedMotion();
  
  // Initialize state from localStorage, initial options, and system preferences
  const getInitialState = (): AccessibilityOptions => {
    let options = { ...DEFAULT_OPTIONS };
    
    // Apply system preferences if enabled
    if (listenToSystemPreferences) {
      options.reducedMotion = systemReducedMotion;
      
      // Detect high contrast mode
      if (typeof window !== 'undefined' && window.matchMedia) {
        const highContrastQuery = window.matchMedia('(forced-colors: active)');
        options.highContrast = highContrastQuery.matches;
        
        // Detect reduce transparency (approximate using prefers-contrast)
        const contrastQuery = window.matchMedia('(prefers-contrast: more)');
        options.reduceTransparency = contrastQuery.matches;
      }
    }
    
    // Apply persisted preferences
    if (persistPreferences && typeof window !== 'undefined') {
      try {
        const storedOptions = localStorage.getItem(storageKey);
        if (storedOptions) {
          const parsedOptions = JSON.parse(storedOptions);
          options = { ...options, ...parsedOptions };
        }
      } catch (e) {
        console.warn('Failed to load accessibility preferences from localStorage');
      }
    }
    
    // Apply initial options (overrides everything else)
    options = { ...options, ...initialOptions };
    
    return options;
  };
  
  // State for accessibility options
  const [options, setOptions] = useState<AccessibilityOptions>(getInitialState);
  
  // Update reducedMotion when system preference changes
  useEffect(() => {
    if (listenToSystemPreferences) {
      setOptions(prev => ({ ...prev, reducedMotion: systemReducedMotion }));
    }
  }, [systemReducedMotion, listenToSystemPreferences]);
  
  // Listen for high contrast mode changes
  useEffect(() => {
    if (!listenToSystemPreferences || typeof window === 'undefined') {
      return;
    }
    
    // High contrast mode detection
    const highContrastQuery = window.matchMedia('(forced-colors: active)');
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setOptions(prev => ({ ...prev, highContrast: e.matches }));
    };
    
    // Contrast preference detection
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setOptions(prev => ({ ...prev, reduceTransparency: e.matches }));
    };
    
    // Add event listeners
    if ('addEventListener' in highContrastQuery) {
      highContrastQuery.addEventListener('change', handleHighContrastChange);
      contrastQuery.addEventListener('change', handleContrastChange);
    } else {
      // For older browsers
      (highContrastQuery as any).addListener(handleHighContrastChange);
      (contrastQuery as any).addListener(handleContrastChange);
    }
    
    // Clean up
    return () => {
      if ('removeEventListener' in highContrastQuery) {
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
        contrastQuery.removeEventListener('change', handleContrastChange);
      } else {
        // For older browsers
        (highContrastQuery as any).removeListener(handleHighContrastChange);
        (contrastQuery as any).removeListener(handleContrastChange);
      }
    };
  }, [listenToSystemPreferences]);
  
  // Persist options to localStorage when they change
  useEffect(() => {
    if (persistPreferences && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(options));
      } catch (e) {
        console.warn('Failed to save accessibility preferences to localStorage');
      }
    }
  }, [options, persistPreferences, storageKey]);
  
  // Add keyboard navigation detection
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
        window.removeEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleMouseDown);
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('using-keyboard');
      window.removeEventListener('mousedown', handleMouseDown);
      window.addEventListener('keydown', handleKeyDown);
    };
    
    // Initial setup
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  // Create setters for each option
  const setReducedMotion = (value: boolean) => {
    setOptions(prev => ({ ...prev, reducedMotion: value }));
  };
  
  const setHighContrast = (value: boolean) => {
    setOptions(prev => ({ ...prev, highContrast: value }));
  };
  
  const setReduceTransparency = (value: boolean) => {
    setOptions(prev => ({ ...prev, reduceTransparency: value }));
  };
  
  const setDisableAnimations = (value: boolean) => {
    setOptions(prev => ({ ...prev, disableAnimations: value }));
  };
  
  const setFontScale = (value: number) => {
    // Clamp the value between 0.5 and 2
    const clampedValue = Math.max(0.5, Math.min(2, value));
    setOptions(prev => ({ ...prev, fontScale: clampedValue }));
  };
  
  const setEnhancedFocus = (value: boolean) => {
    setOptions(prev => ({ ...prev, enhancedFocus: value }));
  };
  
  const setScreenReaderSupport = (value: boolean) => {
    setOptions(prev => ({ ...prev, screenReaderSupport: value }));
  };
  
  const setKeyboardNavigation = (value: boolean) => {
    setOptions(prev => ({ ...prev, keyboardNavigation: value }));
  };
  
  // Build context value
  const contextValue = useMemo(
    () => ({
      ...options,
      setReducedMotion,
      setHighContrast,
      setReduceTransparency,
      setDisableAnimations,
      setFontScale,
      setEnhancedFocus,
      setScreenReaderSupport,
      setKeyboardNavigation
    }),
    [options]
  );
  
  // Apply accessibility attributes to the document
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    
    // Set data attributes for styling
    document.documentElement.setAttribute('data-reduced-motion', options.reducedMotion.toString());
    document.documentElement.setAttribute('data-high-contrast', options.highContrast.toString());
    document.documentElement.setAttribute('data-reduce-transparency', options.reduceTransparency.toString());
    document.documentElement.setAttribute('data-disable-animations', options.disableAnimations.toString());
    document.documentElement.setAttribute('data-font-scale', options.fontScale.toString());
    document.documentElement.setAttribute('data-enhanced-focus', options.enhancedFocus.toString());
    
    // Set font size scaling
    document.documentElement.style.fontSize = `${options.fontScale * 100}%`;
    
    // Set ARIA attributes
    if (options.screenReaderSupport) {
      document.documentElement.setAttribute('role', 'application');
    } else {
      document.documentElement.removeAttribute('role');
    }
  }, [options]);
  
  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to use accessibility context
 */
export const useAccessibility = (): AccessibilityContextValue => {
  return useContext(AccessibilityContext);
};

/**
 * Hook to check if reduced motion is enabled
 */
export const useIsReducedMotion = (): boolean => {
  const { reducedMotion, disableAnimations } = useContext(AccessibilityContext);
  return reducedMotion || disableAnimations;
};

/**
 * Hook to check if high contrast mode is enabled
 */
export const useIsHighContrast = (): boolean => {
  const { highContrast } = useContext(AccessibilityContext);
  return highContrast;
};

/**
 * Hook to check if transparency should be reduced
 */
export const useIsReduceTransparency = (): boolean => {
  const { reduceTransparency } = useContext(AccessibilityContext);
  return reduceTransparency;
};

/**
 * Hook to get font scale factor
 */
export const useFontScale = (): number => {
  const { fontScale } = useContext(AccessibilityContext);
  return fontScale;
};

/**
 * Hook to check if enhanced focus is enabled
 */
export const useIsEnhancedFocus = (): boolean => {
  const { enhancedFocus } = useContext(AccessibilityContext);
  return enhancedFocus;
};