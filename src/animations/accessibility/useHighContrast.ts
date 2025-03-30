/**
 * useHighContrast Hook
 * 
 * Advanced hook for creating accessible animations in high contrast mode
 * with visibility and perceivability guarantees.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { css, FlattenSimpleInterpolation } from 'styled-components';

import { useIsHighContrast } from '../../components/AccessibilityProvider';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { highContrast } from '../../core/mixins/accessibility/highContrast';

/**
 * High contrast animation types for different use cases
 */
export enum HighContrastAnimationType {
  /** Border focus animation - good for focus states */
  BORDER_FOCUS = 'border_focus',
  
  /** Border pulse - good for drawing attention */
  BORDER_PULSE = 'border_pulse',
  
  /** Background flash - good for state changes */
  BACKGROUND_FLASH = 'background_flash',
  
  /** Color inversion - good for toggled states */
  COLOR_INVERSION = 'color_inversion',
  
  /** Outline expansion - good for selection */
  OUTLINE_EXPANSION = 'outline_expansion',
  
  /** Size change - good for button presses */
  SIZE_CHANGE = 'size_change',
  
  /** Color shift - good for transitions */
  COLOR_SHIFT = 'color_shift',
  
  /** Static indicator - no animation, just visual marker */
  STATIC_INDICATOR = 'static_indicator',
  
  /** Content reveal - for progressive disclosure */
  CONTENT_REVEAL = 'content_reveal',
  
  /** Text emphasis - for text-specific highlights */
  TEXT_EMPHASIS = 'text_emphasis',
  
  /** Icon change - for icon state changes */
  ICON_CHANGE = 'icon_change',
  
  /** Custom animation defined by the user */
  CUSTOM = 'custom'
}

/**
 * Options for useHighContrast hook
 */
export interface HighContrastOptions {
  /**
   * If true, will respect system high contrast setting
   * If false, only use the app setting
   * Default: true
   */
  respectSystemPreference?: boolean;
  
  /**
   * Default animation type to use for high contrast mode
   * Default: BORDER_FOCUS
   */
  defaultAnimationType?: HighContrastAnimationType;
  
  /**
   * Default color for high contrast animations
   * If not provided, will use appropriate high contrast colors based on theme
   */
  primaryColor?: string;
  
  /**
   * Secondary color for high contrast animations that need two colors
   * If not provided, will use appropriate high contrast colors based on theme
   */
  secondaryColor?: string;
  
  /**
   * Border width for border-based animations
   * Default: 2
   */
  borderWidth?: number;
  
  /**
   * Animation duration in milliseconds
   * Default: 500
   */
  duration?: number;
  
  /**
   * Animation repetitions
   * Default: 1 (or "infinite" for certain animations like pulses)
   */
  iterations?: number | 'infinite';
  
  /**
   * Timing function/easing
   * Default: 'ease'
   */
  easing?: string;
  
  /**
   * For custom animation type, a custom CSS string or template literal
   */
  customAnimation?: FlattenSimpleInterpolation | string;
  
  /**
   * Whether to add aria-attributes for screen readers when using animations
   * Default: true
   */
  includeAriaAttributes?: boolean;
}

/**
 * Animation parameters for an individual high contrast animation
 */
export interface HighContrastAnimationParams {
  /**
   * Animation type
   */
  type: HighContrastAnimationType;
  
  /**
   * Primary color for the animation
   */
  primaryColor?: string;
  
  /**
   * Secondary color for animations that use two colors
   */
  secondaryColor?: string;
  
  /**
   * Border width for border-based animations
   */
  borderWidth?: number;
  
  /**
   * Duration in milliseconds
   */
  duration?: number;
  
  /**
   * Number of repetitions or 'infinite'
   */
  iterations?: number | 'infinite';
  
  /**
   * Timing function/easing
   */
  easing?: string;
  
  /**
   * For custom animation, the CSS to apply
   */
  customCss?: FlattenSimpleInterpolation | string;
  
  /**
   * Delay before animation starts
   */
  delay?: number;
  
  /**
   * Animation fill mode
   */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  
  /**
   * Animation direction
   */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

/**
 * Result from useHighContrast hook
 */
export interface HighContrastResult {
  /**
   * Whether high contrast mode is enabled (either system or app)
   */
  isHighContrast: boolean;
  
  /**
   * Whether high contrast mode is enabled at system level
   */
  systemHighContrast: boolean;
  
  /**
   * Whether high contrast mode is enabled at app level
   */
  appHighContrast: boolean;
  
  /**
   * Generate animation CSS for an element
   */
  getHighContrastAnimation: (params?: Partial<HighContrastAnimationParams>) => FlattenSimpleInterpolation;
  
  /**
   * Get static high contrast styles for an element
   */
  getHighContrastStyles: (type?: 'borders' | 'colors' | 'both' | 'custom', customCss?: string) => FlattenSimpleInterpolation;
  
  /**
   * Set app-level high contrast mode
   */
  setHighContrast: (value: boolean) => void;
  
  /**
   * Get ARIA attributes for animation
   */
  getAriaAttributes: (description: string) => Record<string, string>;
}

/**
 * Local storage key for app-level high contrast setting
 */
const HIGH_CONTRAST_STORAGE_KEY = 'galileo-glass-high-contrast';

/**
 * Border focus animation keyframes
 */
const borderFocusKeyframes = `
  0% {
    outline-width: 0;
    outline-offset: 0px;
  }
  50% {
    outline-width: 3px;
    outline-offset: 2px;
  }
  100% {
    outline-width: 2px;
    outline-offset: 0px;
  }
`;

/**
 * Border pulse animation keyframes
 */
const borderPulseKeyframes = `
  0%, 100% {
    border-color: var(--hc-primary-color);
  }
  50% {
    border-color: var(--hc-secondary-color);
  }
`;

/**
 * Background flash animation keyframes
 */
const backgroundFlashKeyframes = `
  0%, 100% {
    background-color: var(--hc-secondary-color);
  }
  50% {
    background-color: var(--hc-primary-color);
  }
`;

/**
 * Color inversion animation keyframes
 */
const colorInversionKeyframes = `
  0%, 100% {
    color: var(--hc-primary-color);
    background-color: var(--hc-secondary-color);
  }
  50% {
    color: var(--hc-secondary-color);
    background-color: var(--hc-primary-color);
  }
`;

/**
 * Outline expansion animation keyframes
 */
const outlineExpansionKeyframes = `
  0% {
    outline-width: 0;
    outline-offset: 0;
  }
  100% {
    outline-width: var(--hc-border-width);
    outline-offset: 3px;
  }
`;

/**
 * Size change animation keyframes
 */
const sizeChangeKeyframes = `
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * Color shift animation keyframes
 */
const colorShiftKeyframes = `
  0% {
    border-color: var(--hc-primary-color);
    color: var(--hc-primary-color);
  }
  100% {
    border-color: var(--hc-secondary-color);
    color: var(--hc-secondary-color);
  }
`;

/**
 * Content reveal animation keyframes
 */
const contentRevealKeyframes = `
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Text emphasis animation keyframes
 */
const textEmphasisKeyframes = `
  0%, 100% {
    font-weight: normal;
    text-decoration: none;
  }
  50% {
    font-weight: bold;
    text-decoration: underline;
  }
`;

/**
 * Generate CSS for a specific animation type
 */
const generateAnimationCss = (
  type: HighContrastAnimationType,
  params: HighContrastAnimationParams
): FlattenSimpleInterpolation => {
  const {
    primaryColor,
    secondaryColor,
    borderWidth = 2,
    duration = 500,
    iterations = 1,
    easing = 'ease',
    customCss,
    delay = 0,
    fillMode = 'forwards',
    direction = 'normal'
  } = params;
  
  // Set CSS variables for the animation
  let cssVariables = `
    --hc-primary-color: ${primaryColor || 'currentColor'};
    --hc-secondary-color: ${secondaryColor || 'currentColor'};
    --hc-border-width: ${borderWidth}px;
  `;
  
  // Select the keyframes based on animation type
  let keyframes = '';
  let animationName = '';
  
  switch (type) {
    case HighContrastAnimationType.BORDER_FOCUS:
      keyframes = borderFocusKeyframes;
      animationName = 'hcBorderFocus';
      break;
      
    case HighContrastAnimationType.BORDER_PULSE:
      keyframes = borderPulseKeyframes;
      animationName = 'hcBorderPulse';
      break;
      
    case HighContrastAnimationType.BACKGROUND_FLASH:
      keyframes = backgroundFlashKeyframes;
      animationName = 'hcBackgroundFlash';
      break;
      
    case HighContrastAnimationType.COLOR_INVERSION:
      keyframes = colorInversionKeyframes;
      animationName = 'hcColorInversion';
      break;
      
    case HighContrastAnimationType.OUTLINE_EXPANSION:
      keyframes = outlineExpansionKeyframes;
      animationName = 'hcOutlineExpansion';
      break;
      
    case HighContrastAnimationType.SIZE_CHANGE:
      keyframes = sizeChangeKeyframes;
      animationName = 'hcSizeChange';
      break;
      
    case HighContrastAnimationType.COLOR_SHIFT:
      keyframes = colorShiftKeyframes;
      animationName = 'hcColorShift';
      break;
      
    case HighContrastAnimationType.CONTENT_REVEAL:
      keyframes = contentRevealKeyframes;
      animationName = 'hcContentReveal';
      break;
      
    case HighContrastAnimationType.TEXT_EMPHASIS:
      keyframes = textEmphasisKeyframes;
      animationName = 'hcTextEmphasis';
      break;
      
    case HighContrastAnimationType.STATIC_INDICATOR:
      // For static indicators, return the static CSS without animation
      return css`
        ${cssVariables}
        outline: ${borderWidth}px solid ${primaryColor || 'currentColor'};
        outline-offset: 2px;
      `;
      
    case HighContrastAnimationType.ICON_CHANGE:
      // This is handled differently as it requires changing the actual icon
      // Just add a subtle animation to draw attention
      keyframes = sizeChangeKeyframes;
      animationName = 'hcIconChange';
      break;
      
    case HighContrastAnimationType.CUSTOM:
      // For custom animation type, use the provided customCss
      if (typeof customCss === 'string') {
        return css`
          ${cssVariables}
          ${customCss}
        `;
      } else if (customCss) {
        return css`
          ${cssVariables}
          ${customCss}
        `;
      }
      
      // Fallback to a simple animation if no custom css provided
      keyframes = borderFocusKeyframes;
      animationName = 'hcCustom';
      break;
      
    default:
      keyframes = borderFocusKeyframes;
      animationName = 'hcDefault';
      break;
  }
  
  // Return the CSS with keyframes and animation properties
  return css`
    ${cssVariables}
    
    @keyframes ${animationName} {
      ${keyframes}
    }
    
    animation-name: ${animationName};
    animation-duration: ${duration}ms;
    animation-timing-function: ${easing};
    animation-iteration-count: ${iterations};
    animation-fill-mode: ${fillMode};
    animation-delay: ${delay}ms;
    animation-direction: ${direction};
  `;
};

/**
 * Enhanced hook for creating accessible animations in high contrast mode
 * 
 * This hook provides utilities for creating animations that remain visible
 * and perceivable in high contrast mode, ensuring critical state changes
 * are communicated effectively to all users.
 * 
 * @param options Configuration options
 * @returns High contrast animation utilities and state
 */
export function useHighContrast(options: HighContrastOptions = {}): HighContrastResult {
  const {
    respectSystemPreference = true,
    defaultAnimationType = HighContrastAnimationType.BORDER_FOCUS,
    primaryColor,
    secondaryColor,
    borderWidth = 2,
    duration = 500,
    iterations = 1,
    easing = 'ease',
    customAnimation,
    includeAriaAttributes = true
  } = options;
  
  // Get existing system and app high contrast preferences
  const accessibilitySettings = useAccessibilitySettings();
  
  // State for system high contrast preference
  const [systemHighContrast, setSystemHighContrast] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    
    // Check system preference via media query
    const highContrastQuery = window.matchMedia('(forced-colors: active)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    
    return highContrastQuery.matches || contrastQuery.matches;
  });
  
  // State for app high contrast setting
  const [appHighContrast, setAppHighContrastState] = useState<boolean>(() => {
    // First try to get from accessibility context
    if (accessibilitySettings && 'highContrast' in accessibilitySettings) {
      return accessibilitySettings.highContrast;
    }
    
    // If not available, try localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY) === 'true';
      } catch (e) {
        // Ignore localStorage errors
        return false;
      }
    }
    
    return false;
  });
  
  // Effect to listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia || !respectSystemPreference) {
      return;
    }
    
    // High contrast mode detection
    const highContrastQuery = window.matchMedia('(forced-colors: active)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setSystemHighContrast(e.matches || contrastQuery.matches);
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSystemHighContrast(highContrastQuery.matches || e.matches);
    };
    
    // Add event listeners with browser compatibility
    if ('addEventListener' in highContrastQuery) {
      highContrastQuery.addEventListener('change', handleHighContrastChange);
      contrastQuery.addEventListener('change', handleContrastChange);
    } else {
      // For older browsers
      (highContrastQuery as any).addListener(handleHighContrastChange);
      (contrastQuery as any).addListener(handleContrastChange);
    }
    
    // Initial settings
    setSystemHighContrast(highContrastQuery.matches || contrastQuery.matches);
    
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
  }, [respectSystemPreference]);
  
  // Effect to sync with accessibility context
  useEffect(() => {
    if (accessibilitySettings && 'highContrast' in accessibilitySettings) {
      setAppHighContrastState(accessibilitySettings.highContrast);
    }
  }, [accessibilitySettings]);
  
  // Update app high contrast setting and persist to localStorage
  const setAppHighContrast = useCallback((value: boolean) => {
    setAppHighContrastState(value);
    
    // If we have access to the global setter, use it
    if (accessibilitySettings && 'setHighContrast' in accessibilitySettings) {
      (accessibilitySettings as any).setHighContrast(value);
    }
    
    // Also store in localStorage for persistence
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, value.toString());
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [accessibilitySettings]);
  
  // Determine if high contrast mode is enabled
  const isHighContrast = useMemo(() => {
    return respectSystemPreference
      ? (systemHighContrast || appHighContrast)
      : appHighContrast;
  }, [respectSystemPreference, systemHighContrast, appHighContrast]);
  
  // Generate animation CSS for high contrast mode
  const getHighContrastAnimation = useCallback((params: Partial<HighContrastAnimationParams> = {}) => {
    // If high contrast mode is not enabled, return empty CSS
    if (!isHighContrast) {
      return css``;
    }
    
    // Merge params with defaults
    const mergedParams: HighContrastAnimationParams = {
      type: params.type || defaultAnimationType,
      primaryColor: params.primaryColor || primaryColor,
      secondaryColor: params.secondaryColor || secondaryColor,
      borderWidth: params.borderWidth || borderWidth,
      duration: params.duration || duration,
      iterations: params.iterations || iterations,
      easing: params.easing || easing,
      customCss: params.customCss || customAnimation,
      delay: params.delay || 0,
      fillMode: params.fillMode || 'forwards',
      direction: params.direction || 'normal'
    };
    
    // Generate the animation CSS
    return generateAnimationCss(mergedParams.type, mergedParams);
  }, [
    isHighContrast, 
    defaultAnimationType, 
    primaryColor, 
    secondaryColor, 
    borderWidth, 
    duration, 
    iterations, 
    easing, 
    customAnimation
  ]);
  
  // Get static high contrast styles
  const getHighContrastStyles = useCallback((
    type: 'borders' | 'colors' | 'both' | 'custom' = 'both',
    customCss?: string
  ) => {
    // If high contrast mode is not enabled, return empty CSS
    if (!isHighContrast) {
      return css``;
    }
    
    // Use the core highContrast mixin
    return highContrast({
      enabled: true,
      type,
      borderWidth,
      borderColor: primaryColor,
      textColor: primaryColor,
      backgroundColor: secondaryColor,
      customCss,
      respectSystemPreference: false // We already checked this
    });
  }, [isHighContrast, borderWidth, primaryColor, secondaryColor]);
  
  // Get ARIA attributes for animations
  const getAriaAttributes = useCallback((description: string) => {
    if (!includeAriaAttributes || !isHighContrast) {
      return {};
    }
    
    return {
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'aria-description': description
    };
  }, [includeAriaAttributes, isHighContrast]);
  
  // Return the complete result
  return {
    isHighContrast,
    systemHighContrast,
    appHighContrast,
    getHighContrastAnimation,
    getHighContrastStyles,
    setHighContrast: setAppHighContrast,
    getAriaAttributes
  };
}

export default useHighContrast;