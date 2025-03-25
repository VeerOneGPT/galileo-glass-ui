import React, { createContext, useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { colors, typography, spacing, shadows, borderRadius, zIndex } from './tokens';
import { THEME_NAMES, THEME_VARIANTS, GLASS_QUALITY_TIERS, BLUR_STRENGTHS, GLOW_INTENSITIES } from './constants';
import { createThemeContext } from '../core/themeUtils';
import type { ColorMode, ThemeVariant, Theme, GlassSurfaceProps } from '../core/types';

// ------ ColorMode Context ------
interface ColorModeContextType {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  isDarkMode: boolean;
  toggleColorMode: () => void;
  systemPrefersDark: boolean;
}

const ColorModeContext = createContext<ColorModeContextType>({
  colorMode: 'system',
  setColorMode: () => {},
  isDarkMode: false,
  toggleColorMode: () => {},
  systemPrefersDark: false
});

// ------ ThemeVariant Context ------
interface ThemeVariantContextType {
  themeVariant: string;
  setThemeVariant: (variant: string) => void;
  availableThemes: string[];
}

const ThemeVariantContext = createContext<ThemeVariantContextType>({
  themeVariant: THEME_VARIANTS.STANDARD,
  setThemeVariant: () => {},
  availableThemes: Object.values(THEME_VARIANTS)
});

// ------ StyleUtils Context ------
interface StyleUtilsContextType {
  getColor: (path: string, fallback?: string) => string;
  getSpacing: (size: string | number) => string;
  getShadow: (level: number, color?: string) => string;
  getBorderRadius: (size: string) => string;
  getZIndex: (layer: string) => number;
  getTypography: (variant: string) => React.CSSProperties;
}

const StyleUtilsContext = createContext<StyleUtilsContextType>({
  getColor: () => '',
  getSpacing: () => '',
  getShadow: () => '',
  getBorderRadius: () => '',
  getZIndex: () => 0,
  getTypography: () => ({})
});

// ------ GlassEffects Context ------
interface GlassEffectsContextType {
  qualityTier: 'ultra' | 'high' | 'medium' | 'low' | 'minimal';
  setQualityTier: (tier: 'ultra' | 'high' | 'medium' | 'low' | 'minimal') => void;
  getBlurStrength: (strength: string | number) => string;
  getBackgroundOpacity: (opacity: string | number) => number;
  getBorderOpacity: (opacity: string | number) => number;
  getGlowIntensity: (intensity: string | number) => number;
  createSurface: (props: GlassSurfaceProps) => string;
}

const GlassEffectsContext = createContext<GlassEffectsContextType>({
  qualityTier: 'high',
  setQualityTier: () => {},
  getBlurStrength: () => '',
  getBackgroundOpacity: () => 0,
  getBorderOpacity: () => 0,
  getGlowIntensity: () => 0,
  createSurface: () => ''
});

// ------ Preferences Context ------
interface PreferencesContextType {
  reducedMotion: boolean;
  reducedTransparency: boolean;
  highContrastMode: boolean;
  setPreference: (key: string, value: boolean) => void;
  getUserPreference: (key: string) => boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
  reducedMotion: false,
  reducedTransparency: false,
  highContrastMode: false,
  setPreference: () => {},
  getUserPreference: () => false
});

// ------ Responsive Context ------
interface ResponsiveContextType {
  breakpoints: Record<string, number>;
  currentBreakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  mediaQuery: (breakpoint: string) => string;
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  },
  currentBreakpoint: 'md',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  mediaQuery: () => ''
});

// ------ ThemeProvider Presence Context ------
const ThemeProviderPresenceContext = createContext<boolean>(false);

export const useThemeProviderPresence = () => useContext(ThemeProviderPresenceContext);

// ------ Unified Theme Provider Props ------
export interface ThemeProviderProps {
  /**
   * Children to render
   */
  children: React.ReactNode;
  
  /**
   * Initial color mode
   */
  initialColorMode?: ColorMode;
  
  /**
   * Initial theme variant
   */
  initialTheme?: string;
  
  /**
   * If true, automatically detect system preferences
   */
  enableAutoDetection?: boolean;
  
  /**
   * If true, respect system color mode preference
   */
  respectSystemPreference?: boolean;
  
  /**
   * Force specific color mode (overrides other settings)
   */
  forceColorMode?: ColorMode;
  
  /**
   * If true, disable CSS transitions during theme changes
   */
  disableTransitions?: boolean;
  
  /**
   * If true, optimize glass effects during scrolling
   */
  enableScrollOptimization?: boolean;
  
  /**
   * Initial glass quality tier
   */
  initialQualityTier?: 'ultra' | 'high' | 'medium' | 'low' | 'minimal';
  
  /**
   * If true, theme will isolate from parent themes
   */
  isolateTheme?: boolean;
  
  /**
   * If true, enable performance optimizations
   */
  enableOptimizations?: boolean;
  
  /**
   * If true, enable additional debug information
   */
  debug?: boolean;
  
  /**
   * If true, enable performance monitoring
   */
  performanceMonitoring?: boolean;
  
  /**
   * Throttle time in ms for context updates
   */
  contextUpdateThrottle?: number;
  
  /**
   * If true, only update on React commit phases
   */
  updateOnlyOnCommit?: boolean;
  
  /**
   * Callback when color mode changes
   */
  onColorModeChange?: (mode: ColorMode) => void;
  
  /**
   * Callback when theme variant changes
   */
  onThemeChange?: (theme: string) => void;
}

/**
 * Unified Theme Provider Component
 * 
 * Provides a comprehensive theme context for Glass UI components.
 */
const UnifiedThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialColorMode = 'system',
  initialTheme = THEME_VARIANTS.STANDARD,
  enableAutoDetection = true,
  respectSystemPreference = true,
  forceColorMode,
  disableTransitions = false,
  enableScrollOptimization = true,
  initialQualityTier = 'high',
  isolateTheme = false,
  enableOptimizations = true,
  debug = false,
  performanceMonitoring = false,
  contextUpdateThrottle = 0,
  updateOnlyOnCommit = false,
  onColorModeChange,
  onThemeChange
}) => {
  // ------ Color Mode State ------
  const [colorMode, setColorModeState] = useState<ColorMode>(initialColorMode);
  
  // State for whether the system prefers dark mode
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(
    typeof window !== 'undefined' && window.matchMedia 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false
  );
  
  // ------ Theme Variant State ------
  const [themeVariant, setThemeVariantState] = useState<string>(initialTheme);
  
  // ------ Glass Effects State ------
  const [qualityTier, setQualityTierState] = useState<'ultra' | 'high' | 'medium' | 'low' | 'minimal'>(initialQualityTier);
  
  // ------ Preferences State ------
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    reducedTransparency: false,
    highContrastMode: false
  });
  
  // ------ Responsive State ------
  const [currentBreakpoint, setCurrentBreakpoint] = useState('md');
  
  // ------ Performance Tracking ------
  const renderCount = useRef(0);
  const lastUpdateTime = useRef(Date.now());
  const pendingUpdates = useRef<Record<string, any>>({});
  const commitTimerRef = useRef<number | null>(null);
  
  // ------ Initialize System Preferences ------
  useEffect(() => {
    if (enableAutoDetection) {
      // Detect dark mode preference
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleDarkModeChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };
      
      darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
      setSystemPrefersDark(darkModeMediaQuery.matches);
      
      // Detect reduced motion preference
      const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = (e: MediaQueryListEvent) => {
        setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
      };
      
      motionMediaQuery.addEventListener('change', handleMotionChange);
      setPreferences(prev => ({ ...prev, reducedMotion: motionMediaQuery.matches }));
      
      // Clean up
      return () => {
        darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
        motionMediaQuery.removeEventListener('change', handleMotionChange);
      };
    }
  }, [enableAutoDetection]);
  
  // ------ Load Saved Preferences ------
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load color mode
      const savedColorMode = localStorage.getItem('glass-ui-color-mode');
      if (savedColorMode && !forceColorMode) {
        setColorModeState(savedColorMode as ColorMode);
      }
      
      // Load theme variant
      const savedThemeVariant = localStorage.getItem('glass-ui-theme-variant');
      if (savedThemeVariant) {
        setThemeVariantState(savedThemeVariant);
      }
      
      // Load quality tier
      const savedQualityTier = localStorage.getItem('glass-ui-quality-tier');
      if (savedQualityTier) {
        setQualityTierState(savedQualityTier as any);
      }
      
      // Load user preferences
      const savedPreferences = localStorage.getItem('glass-ui-preferences');
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setPreferences(prev => ({ ...prev, ...parsedPreferences }));
        } catch (e) {
          console.error('Failed to parse saved preferences', e);
        }
      }
    }
  }, [forceColorMode]);
  
  // ------ Initialize Responsive Breakpoints ------
  useEffect(() => {
    const breakpoints = {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    };
    
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint = 'xs';
      
      if (width >= breakpoints.xl) {
        newBreakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        newBreakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        newBreakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        newBreakpoint = 'sm';
      }
      
      setCurrentBreakpoint(newBreakpoint);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // ------ Optimized Update Handlers ------
  
  // Handle color mode change with throttling
  const setColorMode = useCallback((mode: ColorMode) => {
    if (forceColorMode) return; // Don't change if force mode is active
    
    if (contextUpdateThrottle > 0) {
      pendingUpdates.current.colorMode = mode;
      
      if (!commitTimerRef.current) {
        commitTimerRef.current = window.setTimeout(() => {
          setColorModeState(pendingUpdates.current.colorMode);
          if (onColorModeChange) onColorModeChange(pendingUpdates.current.colorMode);
          localStorage.setItem('glass-ui-color-mode', pendingUpdates.current.colorMode);
          commitTimerRef.current = null;
        }, contextUpdateThrottle);
      }
    } else {
      setColorModeState(mode);
      if (onColorModeChange) onColorModeChange(mode);
      localStorage.setItem('glass-ui-color-mode', mode);
    }
  }, [forceColorMode, contextUpdateThrottle, onColorModeChange]);
  
  // Toggle between light and dark mode
  const toggleColorMode = useCallback(() => {
    if (forceColorMode) return; // Don't toggle if force mode is active
    
    setColorMode(
      colorMode === 'light' ? 'dark' : 
      colorMode === 'dark' ? 'light' : 
      systemPrefersDark ? 'light' : 'dark'
    );
  }, [colorMode, forceColorMode, systemPrefersDark, setColorMode]);
  
  // Handle theme variant change
  const setThemeVariant = useCallback((variant: string) => {
    setThemeVariantState(variant);
    if (onThemeChange) onThemeChange(variant);
    localStorage.setItem('glass-ui-theme-variant', variant);
  }, [onThemeChange]);
  
  // Handle quality tier change
  const setQualityTier = useCallback((tier: 'ultra' | 'high' | 'medium' | 'low' | 'minimal') => {
    setQualityTierState(tier);
    localStorage.setItem('glass-ui-quality-tier', tier);
  }, []);
  
  // Handle preference changes
  const setPreference = useCallback((key: string, value: boolean) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: value };
      localStorage.setItem('glass-ui-preferences', JSON.stringify(newPreferences));
      return newPreferences;
    });
  }, []);
  
  // Get user preference
  const getUserPreference = useCallback((key: string) => {
    return preferences[key as keyof typeof preferences] || false;
  }, [preferences]);
  
  // ------ Theme Utilities ------
  
  // Determine if dark mode is active based on all factors
  const isDarkMode = useMemo(() => {
    if (forceColorMode) {
      return forceColorMode === 'dark';
    }
    
    return colorMode === 'dark' || 
      (colorMode === 'system' && respectSystemPreference && systemPrefersDark);
  }, [colorMode, forceColorMode, respectSystemPreference, systemPrefersDark]);
  
  // Create style utility functions
  const getColor = useCallback((path: string, fallback = '') => {
    const parts = path.split('.');
    let value: any = colors;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return fallback;
      }
    }
    
    return typeof value === 'string' ? value : fallback;
  }, []);
  
  const getSpacing = useCallback((size: string | number) => {
    if (typeof size === 'number') {
      return `${size * 8}px`;
    }
    
    if (spacing[size as keyof typeof spacing]) {
      return spacing[size as keyof typeof spacing];
    }
    
    return '0';
  }, []);
  
  const getShadow = useCallback((level: number, color?: string) => {
    const shadowKey = `${level < 1 ? 'none' : level > 5 ? '5xl' : 
      level === 1 ? 'sm' : 
      level === 2 ? 'md' : 
      level === 3 ? 'lg' : 
      level === 4 ? 'xl' : '2xl'}`;
    
    let shadow = shadows[shadowKey as keyof typeof shadows] || shadows.none;
    
    // Apply custom color if provided
    if (color && shadow !== 'none') {
      // Replace rgba colors in shadow string
      shadow = shadow.replace(/rgba\([^)]+\)/g, color);
    }
    
    return shadow;
  }, []);
  
  const getBorderRadius = useCallback((size: string) => {
    return borderRadius[size as keyof typeof borderRadius] || '0';
  }, []);
  
  const getZIndex = useCallback((layer: string) => {
    return zIndex[layer as keyof typeof zIndex] || 0;
  }, []);
  
  const getTypography = useCallback((variant: string) => {
    if (variant in typography) {
      return typography[variant as keyof typeof typography];
    }
    
    return {};
  }, []);
  
  // Create glass effect utilities
  const getBlurStrength = useCallback((strength: string | number) => {
    if (typeof strength === 'number') {
      return `${strength}px`;
    }
    
    return BLUR_STRENGTHS[strength as keyof typeof BLUR_STRENGTHS] || BLUR_STRENGTHS.STANDARD;
  }, []);
  
  const getBackgroundOpacity = useCallback((opacity: string | number) => {
    if (typeof opacity === 'number') {
      return Math.max(0, Math.min(1, opacity));
    }
    
    const opacityMap: Record<string, number> = {
      'transparent': 0,
      'lightest': 0.05,
      'light': 0.1,
      'medium': 0.2,
      'high': 0.5,
      'solid': 1
    };
    
    return opacityMap[opacity] || 0.2;
  }, []);
  
  const getBorderOpacity = useCallback((opacity: string | number) => {
    if (typeof opacity === 'number') {
      return Math.max(0, Math.min(1, opacity));
    }
    
    const opacityMap: Record<string, number> = {
      'none': 0,
      'minimal': 0.05,
      'subtle': 0.1,
      'medium': 0.2,
      'high': 0.4
    };
    
    return opacityMap[opacity] || 0.2;
  }, []);
  
  const getGlowIntensity = useCallback((intensity: string | number) => {
    if (typeof intensity === 'number') {
      return Math.max(0, Math.min(1, intensity));
    }
    
    const intensityMap: Record<string, number> = {
      'minimal': 0.02,
      'light': 0.05,
      'medium': 0.1,
      'strong': 0.15,
      'extreme': 0.25
    };
    
    return intensityMap[intensity] || 0.1;
  }, []);
  
  // Helper to create glass surface styles
  const createSurface = useCallback((props: GlassSurfaceProps) => {
    // This is a simplified version - the real implementation would use themeUtils
    return '';
  }, []);
  
  // ------ Create Responsive Utilities ------
  const breakpoints = useMemo(() => {
    return {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    };
  }, []);
  
  const mediaQuery = useCallback((breakpoint: string) => {
    const width = breakpoints[breakpoint as keyof typeof breakpoints] || 0;
    return `@media (min-width: ${width}px)`;
  }, [breakpoints]);
  
  const isMobile = useMemo(() => {
    return ['xs', 'sm'].includes(currentBreakpoint);
  }, [currentBreakpoint]);
  
  const isTablet = useMemo(() => {
    return currentBreakpoint === 'md';
  }, [currentBreakpoint]);
  
  const isDesktop = useMemo(() => {
    return ['lg', 'xl'].includes(currentBreakpoint);
  }, [currentBreakpoint]);
  
  // ------ Create Context Values ------
  
  // ColorMode context
  const colorModeContextValue = useMemo(() => ({
    colorMode: forceColorMode || colorMode,
    setColorMode,
    isDarkMode,
    toggleColorMode,
    systemPrefersDark
  }), [forceColorMode, colorMode, setColorMode, isDarkMode, toggleColorMode, systemPrefersDark]);
  
  // ThemeVariant context
  const themeVariantContextValue = useMemo(() => ({
    themeVariant,
    setThemeVariant,
    availableThemes: Object.values(THEME_VARIANTS)
  }), [themeVariant, setThemeVariant]);
  
  // StyleUtils context
  const styleUtilsContextValue = useMemo(() => ({
    getColor,
    getSpacing,
    getShadow,
    getBorderRadius,
    getZIndex,
    getTypography
  }), [getColor, getSpacing, getShadow, getBorderRadius, getZIndex, getTypography]);
  
  // GlassEffects context
  const glassEffectsContextValue = useMemo(() => ({
    qualityTier,
    setQualityTier,
    getBlurStrength,
    getBackgroundOpacity,
    getBorderOpacity,
    getGlowIntensity,
    createSurface
  }), [qualityTier, setQualityTier, getBlurStrength, getBackgroundOpacity, getBorderOpacity, getGlowIntensity, createSurface]);
  
  // Preferences context
  const preferencesContextValue = useMemo(() => ({
    reducedMotion: preferences.reducedMotion,
    reducedTransparency: preferences.reducedTransparency,
    highContrastMode: preferences.highContrastMode,
    setPreference,
    getUserPreference
  }), [preferences, setPreference, getUserPreference]);
  
  // Responsive context
  const responsiveContextValue = useMemo(() => ({
    breakpoints,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    mediaQuery
  }), [breakpoints, currentBreakpoint, isMobile, isTablet, isDesktop, mediaQuery]);
  
  // Create unified theme object for styled-components
  const theme = useMemo(() => {
    return {
      isDarkMode,
      colorMode: forceColorMode || colorMode,
      themeVariant,
      colors: {
        ...colors,
        // Add variant-specific colors here
      },
      typography,
      spacing,
      shadows,
      borderRadius,
      zIndex,
      glass: {
        qualityTier,
        blurStrengths: BLUR_STRENGTHS,
        glowIntensities: GLOW_INTENSITIES
      },
      utils: {
        getColor,
        getSpacing,
        getShadow,
        getBorderRadius,
        getZIndex,
        getTypography
      }
    };
  }, [
    isDarkMode, forceColorMode, colorMode, themeVariant, qualityTier,
    getColor, getSpacing, getShadow, getBorderRadius, getZIndex, getTypography
  ]);
  
  // Performance debugging
  useEffect(() => {
    if (debug && performanceMonitoring) {
      renderCount.current++;
      const renderTime = Date.now() - lastUpdateTime.current;
      console.log(`[ThemeProvider] Render #${renderCount.current} took ${renderTime}ms`);
      lastUpdateTime.current = Date.now();
    }
  });
  
  // Prevent transitions during theme changes
  useEffect(() => {
    if (disableTransitions) {
      document.documentElement.classList.add('disable-transitions');
      const timeout = setTimeout(() => {
        document.documentElement.classList.remove('disable-transitions');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isDarkMode, themeVariant, disableTransitions]);
  
  // Apply scroll optimization
  useEffect(() => {
    if (enableScrollOptimization) {
      let scrollTimer: number | null = null;
      let isScrolling = false;
      
      const handleScroll = () => {
        if (!isScrolling) {
          isScrolling = true;
          document.documentElement.classList.add('is-scrolling');
        }
        
        if (scrollTimer) {
          clearTimeout(scrollTimer);
        }
        
        scrollTimer = window.setTimeout(() => {
          isScrolling = false;
          document.documentElement.classList.remove('is-scrolling');
        }, 150);
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimer) {
          clearTimeout(scrollTimer);
        }
      };
    }
  }, [enableScrollOptimization]);
  
  // Render multi-context provider
  return (
    <ThemeProviderPresenceContext.Provider value={true}>
      <ColorModeContext.Provider value={colorModeContextValue}>
        <ThemeVariantContext.Provider value={themeVariantContextValue}>
          <StyleUtilsContext.Provider value={styleUtilsContextValue}>
            <GlassEffectsContext.Provider value={glassEffectsContextValue}>
              <PreferencesContext.Provider value={preferencesContextValue}>
                <ResponsiveContext.Provider value={responsiveContextValue}>
                  <StyledThemeProvider theme={theme}>
                    {children}
                  </StyledThemeProvider>
                </ResponsiveContext.Provider>
              </PreferencesContext.Provider>
            </GlassEffectsContext.Provider>
          </StyleUtilsContext.Provider>
        </ThemeVariantContext.Provider>
      </ColorModeContext.Provider>
    </ThemeProviderPresenceContext.Provider>
  );
};

/**
 * Memoized ThemeProvider wrapper with presence tracking.
 * 
 * This component prevents unnecessary re-renders and provides theme context.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = React.memo(UnifiedThemeProvider);

// ------ Create Hooks for Accessing Context ------

/**
 * Main hook for accessing the full theme.
 * Use more specific hooks for better performance when possible.
 */
export const useTheme = () => {
  const colorModeContext = useContext(ColorModeContext);
  const themeVariantContext = useContext(ThemeVariantContext);
  const styleUtilsContext = useContext(StyleUtilsContext);
  
  if (!colorModeContext || !themeVariantContext || !styleUtilsContext) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return {
    isDark: colorModeContext.isDarkMode,
    currentColorMode: colorModeContext.colorMode,
    toggleColorMode: colorModeContext.toggleColorMode,
    setColorMode: colorModeContext.setColorMode,
    currentTheme: themeVariantContext.themeVariant,
    setTheme: themeVariantContext.setThemeVariant,
    availableThemes: themeVariantContext.availableThemes,
    ...styleUtilsContext
  };
};

/**
 * Hook for accessing only color mode aspects of the theme.
 * More efficient than useTheme when only color mode is needed.
 */
export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  
  if (!context) {
    throw new Error('useColorMode must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for accessing only theme variant aspects.
 * More efficient than useTheme when only theme variant is needed.
 */
export const useThemeVariant = () => {
  const context = useContext(ThemeVariantContext);
  
  if (!context) {
    throw new Error('useThemeVariant must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for accessing only style utilities.
 */
export const useStyleUtils = () => {
  const context = useContext(StyleUtilsContext);
  
  if (!context) {
    throw new Error('useStyleUtils must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for accessing only glass effect utilities.
 */
export const useGlassEffects = () => {
  const context = useContext(GlassEffectsContext);
  
  if (!context) {
    throw new Error('useGlassEffects must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for accessing only preference settings.
 */
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  
  if (!context) {
    throw new Error('usePreferences must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for accessing only responsive context.
 */
export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  
  if (!context) {
    throw new Error('useResponsive must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * ThemeObserver hook for subscribing to theme changes without re-rendering.
 */
export const useThemeObserver = (callback: (theme: any, isDark: boolean) => void) => {
  const { isDark, currentTheme } = useTheme();
  
  useEffect(() => {
    callback(currentTheme, isDark);
  }, [callback, currentTheme, isDark]);
};

export default ThemeProvider;