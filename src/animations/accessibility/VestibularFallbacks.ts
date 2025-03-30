/**
 * VestibularFallbacks.ts
 * 
 * Provides alternative feedback mechanisms for users with vestibular disorders
 * who may need to disable animations. These fallbacks ensure critical state
 * changes remain perceivable without motion.
 */

import { css, FlattenSimpleInterpolation, keyframes } from 'styled-components';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { AnimationCategory } from './MotionSensitivity';

/**
 * Types of non-animation feedback alternatives for state changes
 */
export enum FeedbackType {
  /**
   * Color changes (background, text, border)
   */
  COLOR = 'color',
  
  /**
   * Sound feedback (subtle tones, clicks)
   */
  SOUND = 'sound',
  
  /**
   * Haptic feedback (vibration)
   */
  HAPTIC = 'haptic',
  
  /**
   * Focus/selection changes
   */
  FOCUS = 'focus',
  
  /**
   * Element transformation without animation
   */
  TRANSFORM = 'transform',
  
  /**
   * Size or shape changes
   */
  SIZE = 'size',
  
  /**
   * Text/content changes
   */
  TEXT = 'text',
  
  /**
   * Border changes
   */
  BORDER = 'border',
  
  /**
   * Icon or visual marker changes
   */
  ICON = 'icon',
  
  /**
   * Shadow/depth changes
   */
  SHADOW = 'shadow',
  
  /**
   * Opacity/visibility changes
   */
  OPACITY = 'opacity',
  
  /**
   * ARIA announcements
   */
  ARIA = 'aria'
}

/**
 * State change event types that may need alternatives
 */
export enum StateChangeType {
  /**
   * Element appears
   */
  APPEAR = 'appear',
  
  /**
   * Element disappears
   */
  DISAPPEAR = 'disappear',
  
  /**
   * State transition (on/off, active/inactive)
   */
  TOGGLE = 'toggle',
  
  /**
   * User interaction feedback
   */
  INTERACTION = 'interaction',
  
  /**
   * Selection change
   */
  SELECT = 'select',
  
  /**
   * Focus change
   */
  FOCUS = 'focus',
  
  /**
   * Error state
   */
  ERROR = 'error',
  
  /**
   * Success state
   */
  SUCCESS = 'success',
  
  /**
   * Warning state
   */
  WARNING = 'warning',
  
  /**
   * Loading state
   */
  LOADING = 'loading',
  
  /**
   * Position change
   */
  MOVE = 'move',
  
  /**
   * Size change
   */
  RESIZE = 'resize',
  
  /**
   * Navigation between sections/views
   */
  NAVIGATE = 'navigate'
}

/**
 * Importance level for state change
 */
export enum ImportanceLevel {
  /**
   * Critical state changes that must be perceivable
   */
  CRITICAL = 'critical',
  
  /**
   * Important state changes that should be perceivable
   */
  IMPORTANT = 'important',
  
  /**
   * Informative state changes that are helpful but not necessary
   */
  INFORMATIVE = 'informative',
  
  /**
   * Decorative state changes that are purely aesthetic
   */
  DECORATIVE = 'decorative'
}

/**
 * Feedback threshold configuration
 */
export interface FeedbackThresholds {
  /**
   * Minimum importance level for visual feedback
   */
  visual: ImportanceLevel;
  
  /**
   * Minimum importance level for audio feedback
   */
  audio: ImportanceLevel;
  
  /**
   * Minimum importance level for haptic feedback
   */
  haptic: ImportanceLevel;
  
  /**
   * Minimum importance level for aria announcements
   */
  aria: ImportanceLevel;
}

/**
 * Options for vestibular fallbacks
 */
export interface VestibularFallbackOptions {
  /**
   * Type of state change that needs an alternative
   */
  stateChangeType: StateChangeType;
  
  /**
   * Importance level of the state change
   */
  importance?: ImportanceLevel;
  
  /**
   * Preferred fallback types in order of preference
   */
  preferredFallbacks?: FeedbackType[];
  
  /**
   * Color for visual feedback
   */
  color?: string;
  
  /**
   * Secondary color for visual feedback
   */
  secondaryColor?: string;
  
  /**
   * Text content to display or announce
   */
  message?: string;
  
  /**
   * ID of element for ARIA announcements
   */
  elementId?: string;
  
  /**
   * Icon to display
   */
  icon?: string;
  
  /**
   * Duration to show fallback (in ms)
   */
  duration?: number;
  
  /**
   * Volume level for audio feedback (0-1)
   */
  volume?: number;
  
  /**
   * Frequency for audio feedback
   */
  frequency?: number;
  
  /**
   * Intensity for haptic feedback (0-1)
   */
  intensity?: number;
  
  /**
   * Custom CSS for visual fallbacks
   */
  customCSS?: string | FlattenSimpleInterpolation;
}

/**
 * Default thresholds for different feedback types
 */
const DEFAULT_THRESHOLDS: FeedbackThresholds = {
  visual: ImportanceLevel.DECORATIVE,
  audio: ImportanceLevel.IMPORTANT,
  haptic: ImportanceLevel.IMPORTANT,
  aria: ImportanceLevel.IMPORTANT
};

/**
 * Default options for different state changes
 */
const DEFAULT_STATE_OPTIONS: Record<StateChangeType, Partial<VestibularFallbackOptions>> = {
  [StateChangeType.APPEAR]: {
    importance: ImportanceLevel.INFORMATIVE,
    preferredFallbacks: [FeedbackType.OPACITY, FeedbackType.BORDER, FeedbackType.ARIA],
    duration: 500
  },
  [StateChangeType.DISAPPEAR]: {
    importance: ImportanceLevel.INFORMATIVE,
    preferredFallbacks: [FeedbackType.OPACITY, FeedbackType.BORDER, FeedbackType.ARIA],
    duration: 500
  },
  [StateChangeType.TOGGLE]: {
    importance: ImportanceLevel.IMPORTANT,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.BORDER, FeedbackType.ICON],
    duration: 500
  },
  [StateChangeType.INTERACTION]: {
    importance: ImportanceLevel.INFORMATIVE,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.BORDER, FeedbackType.SOUND],
    duration: 300
  },
  [StateChangeType.SELECT]: {
    importance: ImportanceLevel.IMPORTANT,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.BORDER, FeedbackType.FOCUS, FeedbackType.ARIA],
    duration: 500
  },
  [StateChangeType.FOCUS]: {
    importance: ImportanceLevel.IMPORTANT,
    preferredFallbacks: [FeedbackType.BORDER, FeedbackType.COLOR, FeedbackType.SHADOW],
    duration: 0 // Persistent until focus changes
  },
  [StateChangeType.ERROR]: {
    importance: ImportanceLevel.CRITICAL,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.BORDER, FeedbackType.ICON, FeedbackType.ARIA],
    color: '#e74c3c',
    duration: 0 // Persistent until error is resolved
  },
  [StateChangeType.SUCCESS]: {
    importance: ImportanceLevel.IMPORTANT,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.ARIA],
    color: '#2ecc71',
    duration: 2000
  },
  [StateChangeType.WARNING]: {
    importance: ImportanceLevel.IMPORTANT,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.ARIA],
    color: '#f39c12',
    duration: 0 // Persistent until warning is acknowledged
  },
  [StateChangeType.LOADING]: {
    importance: ImportanceLevel.INFORMATIVE,
    preferredFallbacks: [FeedbackType.TEXT, FeedbackType.ICON, FeedbackType.COLOR],
    duration: 0 // Persistent until loading is complete
  },
  [StateChangeType.MOVE]: {
    importance: ImportanceLevel.INFORMATIVE,
    preferredFallbacks: [FeedbackType.TRANSFORM, FeedbackType.ARIA],
    duration: 500
  },
  [StateChangeType.RESIZE]: {
    importance: ImportanceLevel.INFORMATIVE,
    preferredFallbacks: [FeedbackType.SIZE, FeedbackType.ARIA],
    duration: 500
  },
  [StateChangeType.NAVIGATE]: {
    importance: ImportanceLevel.IMPORTANT,
    preferredFallbacks: [FeedbackType.COLOR, FeedbackType.TEXT, FeedbackType.ARIA],
    duration: 500
  }
};

/**
 * Mapping of feedback types to their implementation
 */
export type FeedbackImplementation = (options: VestibularFallbackOptions) => any;

/**
 * Sound cache to prevent creating duplicate audio contexts
 */
const soundCache = new Map<string, AudioContext>();

/**
 * Create a simple audio feedback tone
 */
function createTone(options: {
  frequency?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
}): void {
  const {
    frequency = 440,
    duration = 200,
    volume = 0.2,
    type = 'sine'
  } = options;
  
  try {
    // Use cached audio context if possible
    const cacheKey = `tone-${frequency}-${type}`;
    let audioContext = soundCache.get(cacheKey);
    
    if (!audioContext) {
      audioContext = new AudioContext();
      soundCache.set(cacheKey, audioContext);
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      // Remove from cache after a delay to allow reuse
      setTimeout(() => {
        soundCache.delete(cacheKey);
      }, 1000);
    }, duration);
  } catch (error) {
    console.warn('Audio feedback unavailable:', error);
  }
}

/**
 * Create haptic feedback (vibration)
 */
function createHapticFeedback(options: {
  pattern?: number | number[];
  intensity?: number;
}): void {
  const {
    pattern = 50,
    intensity = 1
  } = options;
  
  try {
    if ('vibrate' in navigator) {
      // Adjust pattern based on intensity
      let vibrationPattern: number | number[];
      
      if (Array.isArray(pattern)) {
        // Scale each value by intensity
        vibrationPattern = pattern.map(p => Math.round(p * intensity));
      } else {
        // Scale single value by intensity
        vibrationPattern = Math.round(pattern * intensity);
      }
      
      navigator.vibrate(vibrationPattern);
    }
  } catch (error) {
    console.warn('Haptic feedback unavailable:', error);
  }
}

/**
 * Create ARIA announcement
 */
function createAriaAnnouncement(message: string, options: {
  assertive?: boolean;
  elementId?: string;
}): void {
  const {
    assertive = false,
    elementId
  } = options;
  
  try {
    let announcementElement: HTMLElement | null = null;
    
    // Use specified element if provided
    if (elementId) {
      announcementElement = document.getElementById(elementId);
    }
    
    // Create announcement element if needed
    if (!announcementElement) {
      // Check if we already have an announcement element
      announcementElement = document.getElementById('vestibular-announcement');
      
      if (!announcementElement) {
        announcementElement = document.createElement('div');
        announcementElement.id = 'vestibular-announcement';
        announcementElement.className = 'sr-only';
        announcementElement.style.position = 'absolute';
        announcementElement.style.width = '1px';
        announcementElement.style.height = '1px';
        announcementElement.style.padding = '0';
        announcementElement.style.margin = '-1px';
        announcementElement.style.overflow = 'hidden';
        announcementElement.style.clip = 'rect(0, 0, 0, 0)';
        announcementElement.style.whiteSpace = 'nowrap';
        announcementElement.style.border = '0';
        
        document.body.appendChild(announcementElement);
      }
    }
    
    // Set appropriate ARIA role
    announcementElement.setAttribute('role', assertive ? 'alert' : 'status');
    announcementElement.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    
    // Clear existing content and add new announcement
    announcementElement.textContent = '';
    
    // Use setTimeout to ensure announcement is made
    setTimeout(() => {
      if (announcementElement) {
        announcementElement.textContent = message;
      }
    }, 50);
  } catch (error) {
    console.warn('ARIA announcement unavailable:', error);
  }
}

/**
 * Generate CSS for a color-based fallback
 */
function generateColorFallback(options: VestibularFallbackOptions): FlattenSimpleInterpolation {
  const {
    color = '#3498db',
    duration = 500
  } = options;
  
  return css`
    background-color: ${color};
    transition: background-color ${duration}ms ease-out;
  `;
}

/**
 * Generate CSS for a border-based fallback
 */
function generateBorderFallback(options: VestibularFallbackOptions): FlattenSimpleInterpolation {
  const {
    color = '#3498db',
    duration = 500
  } = options;
  
  return css`
    border: 2px solid ${color};
    transition: border-color ${duration}ms ease-out;
  `;
}

/**
 * Generate CSS for an opacity-based fallback
 */
function generateOpacityFallback(options: VestibularFallbackOptions): FlattenSimpleInterpolation {
  const {
    duration = 500
  } = options;
  
  // For appear/disappear state changes
  if (options.stateChangeType === StateChangeType.APPEAR) {
    return css`
      opacity: 1;
      transition: opacity ${duration}ms ease-out;
    `;
  } else if (options.stateChangeType === StateChangeType.DISAPPEAR) {
    return css`
      opacity: 0;
      transition: opacity ${duration}ms ease-out;
    `;
  }
  
  return css`
    opacity: 1;
    transition: opacity ${duration}ms ease-out;
  `;
}

/**
 * Generate CSS for a shadow-based fallback
 */
function generateShadowFallback(options: VestibularFallbackOptions): FlattenSimpleInterpolation {
  const {
    color = 'rgba(0, 0, 0, 0.2)',
    duration = 500
  } = options;
  
  return css`
    box-shadow: 0 0 8px 2px ${color};
    transition: box-shadow ${duration}ms ease-out;
  `;
}

/**
 * Generate CSS for a transform-based fallback (without animation)
 */
function generateTransformFallback(options: VestibularFallbackOptions): FlattenSimpleInterpolation {
  const {
    stateChangeType,
    duration = 0
  } = options;
  
  // Direct transform based on state type (no animation)
  if (stateChangeType === StateChangeType.MOVE) {
    return css`
      transform: translate(0, 0);
      transition: ${duration > 0 ? `transform ${duration}ms ease-out` : 'none'};
    `;
  }
  
  return css`
    transform: scale(1.05);
    transition: ${duration > 0 ? `transform ${duration}ms ease-out` : 'none'};
  `;
}

/**
 * Generate CSS for a size-based fallback
 */
function generateSizeFallback(options: VestibularFallbackOptions): FlattenSimpleInterpolation {
  const {
    stateChangeType,
    duration = 0
  } = options;
  
  return css`
    width: ${stateChangeType === StateChangeType.RESIZE ? 'auto' : '100%'};
    height: ${stateChangeType === StateChangeType.RESIZE ? 'auto' : '100%'};
    transition: ${duration > 0 ? `width ${duration}ms ease-out, height ${duration}ms ease-out` : 'none'};
  `;
}

/**
 * Get appropriate feedback for a state change based on importance and preferences
 */
function getFeedbackImplementation(
  feedbackType: FeedbackType,
  options: VestibularFallbackOptions
): any {
  switch (feedbackType) {
    case FeedbackType.COLOR:
      return generateColorFallback(options);
      
    case FeedbackType.SOUND:
      return () => createTone({
        frequency: options.frequency || getFeedbackTone(options.stateChangeType),
        duration: options.duration || 200,
        volume: options.volume || 0.2
      });
      
    case FeedbackType.HAPTIC:
      return () => createHapticFeedback({
        pattern: getHapticPattern(options.stateChangeType),
        intensity: options.intensity || 1
      });
      
    case FeedbackType.FOCUS:
      return css`
        outline: 2px solid ${options.color || '#3498db'};
        outline-offset: 2px;
      `;
      
    case FeedbackType.TRANSFORM:
      return generateTransformFallback(options);
      
    case FeedbackType.SIZE:
      return generateSizeFallback(options);
      
    case FeedbackType.TEXT:
      // Not directly generating CSS, would be handled by the component
      return options.message || getDefaultMessage(options.stateChangeType);
      
    case FeedbackType.BORDER:
      return generateBorderFallback(options);
      
    case FeedbackType.ICON:
      // Not directly generating CSS, would be handled by the component
      return options.icon || getDefaultIcon(options.stateChangeType);
      
    case FeedbackType.SHADOW:
      return generateShadowFallback(options);
      
    case FeedbackType.OPACITY:
      return generateOpacityFallback(options);
      
    case FeedbackType.ARIA:
      return () => createAriaAnnouncement(
        options.message || getDefaultMessage(options.stateChangeType),
        {
          assertive: isImportant(options.importance),
          elementId: options.elementId
        }
      );
      
    default:
      // Return custom CSS if provided, otherwise empty CSS
      return options.customCSS || css``;
  }
}

/**
 * Get default feedback tone frequency based on state change type
 */
function getFeedbackTone(stateChangeType: StateChangeType): number {
  switch (stateChangeType) {
    case StateChangeType.ERROR:
      return 220; // Lower tone for errors
      
    case StateChangeType.SUCCESS:
      return 660; // Higher tone for success
      
    case StateChangeType.WARNING:
      return 440; // Middle tone for warnings
      
    case StateChangeType.APPEAR:
    case StateChangeType.SELECT:
      return 550; // Higher tone for positive actions
      
    case StateChangeType.DISAPPEAR:
      return 330; // Lower tone for negative actions
      
    default:
      return 440; // Default A4 tone
  }
}

/**
 * Get default haptic pattern based on state change type
 */
function getHapticPattern(stateChangeType: StateChangeType): number | number[] {
  switch (stateChangeType) {
    case StateChangeType.ERROR:
      return [100, 50, 100]; // Two quick buzzes for error
      
    case StateChangeType.SUCCESS:
      return 150; // Single longer buzz for success
      
    case StateChangeType.WARNING:
      return [50, 50, 50]; // Three quick buzzes for warning
      
    case StateChangeType.SELECT:
    case StateChangeType.INTERACTION:
      return 50; // Quick short buzz for interactions
      
    default:
      return 50; // Default short buzz
  }
}

/**
 * Get default message for a state change
 */
function getDefaultMessage(stateChangeType: StateChangeType): string {
  switch (stateChangeType) {
    case StateChangeType.APPEAR:
      return 'Item has appeared';
      
    case StateChangeType.DISAPPEAR:
      return 'Item has disappeared';
      
    case StateChangeType.TOGGLE:
      return 'State has changed';
      
    case StateChangeType.INTERACTION:
      return 'Interaction detected';
      
    case StateChangeType.SELECT:
      return 'Item selected';
      
    case StateChangeType.FOCUS:
      return 'Item focused';
      
    case StateChangeType.ERROR:
      return 'Error occurred';
      
    case StateChangeType.SUCCESS:
      return 'Action successful';
      
    case StateChangeType.WARNING:
      return 'Warning';
      
    case StateChangeType.LOADING:
      return 'Loading';
      
    case StateChangeType.MOVE:
      return 'Item moved';
      
    case StateChangeType.RESIZE:
      return 'Item resized';
      
    case StateChangeType.NAVIGATE:
      return 'Navigated to new section';
      
    default:
      return 'State changed';
  }
}

/**
 * Get default icon for a state change
 */
function getDefaultIcon(stateChangeType: StateChangeType): string {
  switch (stateChangeType) {
    case StateChangeType.APPEAR:
      return '➕';
      
    case StateChangeType.DISAPPEAR:
      return '➖';
      
    case StateChangeType.TOGGLE:
      return '🔄';
      
    case StateChangeType.INTERACTION:
      return '👆';
      
    case StateChangeType.SELECT:
      return '✓';
      
    case StateChangeType.FOCUS:
      return '👁️';
      
    case StateChangeType.ERROR:
      return '❌';
      
    case StateChangeType.SUCCESS:
      return '✅';
      
    case StateChangeType.WARNING:
      return '⚠️';
      
    case StateChangeType.LOADING:
      return '⏳';
      
    case StateChangeType.MOVE:
      return '🔄';
      
    case StateChangeType.RESIZE:
      return '⤢';
      
    case StateChangeType.NAVIGATE:
      return '🔀';
      
    default:
      return '📋';
  }
}

/**
 * Check if importance level meets threshold
 */
function isImportant(
  importance: ImportanceLevel = ImportanceLevel.INFORMATIVE
): boolean {
  return (
    importance === ImportanceLevel.CRITICAL ||
    importance === ImportanceLevel.IMPORTANT
  );
}

/**
 * Create vestibular fallback styles and behaviors
 * 
 * @param options Vestibular fallback options
 * @returns CSS styles and callbacks for the fallback
 */
export function createVestibularFallback(options: VestibularFallbackOptions): {
  cssStyles: FlattenSimpleInterpolation;
  applyFallback: () => void;
  ariaProps: Record<string, string>;
  iconContent?: string;
  textContent?: string;
} {
  // Merge with defaults for the state change type
  const stateDefaults = DEFAULT_STATE_OPTIONS[options.stateChangeType] || {};
  const mergedOptions: VestibularFallbackOptions = {
    ...stateDefaults,
    ...options
  };
  
  // Use preferred fallbacks or defaults
  const fallbackTypes = mergedOptions.preferredFallbacks || [
    FeedbackType.COLOR,
    FeedbackType.BORDER,
    FeedbackType.ARIA
  ];
  
  // Generate CSS for visual fallbacks
  const visualFallbacks = fallbackTypes.filter(type => 
    [
      FeedbackType.COLOR,
      FeedbackType.BORDER,
      FeedbackType.FOCUS,
      FeedbackType.TRANSFORM,
      FeedbackType.SIZE,
      FeedbackType.SHADOW,
      FeedbackType.OPACITY
    ].includes(type)
  );
  
  const cssFragments = visualFallbacks.map(type => 
    getFeedbackImplementation(type, mergedOptions)
  );
  
  // Combine all CSS fragments
  const cssStyles = css`
    ${cssFragments}
  `;
  
  // Get non-CSS fallbacks
  const applyFallbacks = fallbackTypes.filter(type => 
    [
      FeedbackType.SOUND,
      FeedbackType.HAPTIC,
      FeedbackType.ARIA
    ].includes(type)
  );
  
  // Function to apply non-CSS fallbacks
  const applyFallback = () => {
    applyFallbacks.forEach(type => {
      const implementation = getFeedbackImplementation(type, mergedOptions);
      if (typeof implementation === 'function') {
        implementation();
      }
    });
  };
  
  // Get icon and text content if requested
  const iconContent = fallbackTypes.includes(FeedbackType.ICON)
    ? (options.icon || getDefaultIcon(options.stateChangeType))
    : undefined;
    
  const textContent = fallbackTypes.includes(FeedbackType.TEXT)
    ? (options.message || getDefaultMessage(options.stateChangeType))
    : undefined;
  
  // Generate ARIA props
  const ariaProps: Record<string, string> = {};
  
  if (fallbackTypes.includes(FeedbackType.ARIA)) {
    const isAssertive = isImportant(mergedOptions.importance);
    ariaProps['aria-live'] = isAssertive ? 'assertive' : 'polite';
    
    // Add role based on state type
    if (mergedOptions.stateChangeType === StateChangeType.ERROR) {
      ariaProps.role = 'alert';
    } else if (mergedOptions.stateChangeType === StateChangeType.LOADING) {
      ariaProps.role = 'status';
    } else if (mergedOptions.stateChangeType === StateChangeType.SELECT) {
      ariaProps['aria-selected'] = 'true';
    }
  }
  
  return {
    cssStyles,
    applyFallback,
    ariaProps,
    iconContent,
    textContent
  };
}

/**
 * Hook for managing vestibular fallbacks
 * 
 * This hook provides styled alternatives to animations for users
 * with vestibular disorders who prefer reduced or no motion.
 */
export function useVestibularFallback(options: VestibularFallbackOptions): {
  /**
   * CSS styles to apply for the fallback
   */
  styles: FlattenSimpleInterpolation;
  
  /**
   * Apply non-CSS fallbacks (sound, haptic, ARIA)
   */
  applyFallback: () => void;
  
  /**
   * Props to spread to the component for accessibility
   */
  props: Record<string, any>;
  
  /**
   * Whether fallbacks are active (reduced motion is enabled)
   */
  isActive: boolean;
} {
  // Check for reduced motion preferences
  const { prefersReducedMotion, isAnimationAllowed } = useReducedMotion();
  
  // Track active state for non-persistent fallbacks
  const [isRecentlyActivated, setIsRecentlyActivated] = useState(false);
  const activationTimerRef = useRef<number | null>(null);
  
  // Generate fallback based on options
  const fallback = useMemo(() => createVestibularFallback(options), [options]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (activationTimerRef.current !== null) {
        window.clearTimeout(activationTimerRef.current);
      }
    };
  }, []);
  
  // Check if fallbacks should be active based on animation category
  const shouldUseAlternative = useMemo(() => {
    return prefersReducedMotion && !isAnimationAllowed(AnimationCategory.INTERACTION);
  }, [prefersReducedMotion, isAnimationAllowed]);
  
  // Function to activate fallbacks
  const applyFallback = useCallback(() => {
    if (shouldUseAlternative) {
      fallback.applyFallback();
      
      // Set recently activated state for temporary visual effects
      setIsRecentlyActivated(true);
      
      // Clear any existing timer
      if (activationTimerRef.current !== null) {
        window.clearTimeout(activationTimerRef.current);
      }
      
      // Reset after duration if one is specified
      if (options.duration && options.duration > 0) {
        activationTimerRef.current = window.setTimeout(() => {
          setIsRecentlyActivated(false);
          activationTimerRef.current = null;
        }, options.duration);
      }
    }
  }, [shouldUseAlternative, fallback, options.duration]);
  
  // Prepare props for the component
  const props = useMemo(() => {
    // Default props for accessibility
    const baseProps: Record<string, any> = {
      ...fallback.ariaProps
    };
    
    // Add icon and text content if available
    if (fallback.iconContent) {
      baseProps['data-icon'] = fallback.iconContent;
    }
    
    if (fallback.textContent) {
      baseProps['data-content'] = fallback.textContent;
    }
    
    // Add event handlers for certain state changes
    if (options.stateChangeType === StateChangeType.INTERACTION) {
      baseProps.onClick = (e: any) => {
        applyFallback();
        // Call original handler if it exists
        if (baseProps.onClick && typeof baseProps.onClick === 'function') {
          baseProps.onClick(e);
        }
      };
    }
    
    if (options.stateChangeType === StateChangeType.FOCUS) {
      baseProps.onFocus = (e: any) => {
        applyFallback();
        // Call original handler if it exists
        if (baseProps.onFocus && typeof baseProps.onFocus === 'function') {
          baseProps.onFocus(e);
        }
      };
    }
    
    return baseProps;
  }, [fallback, options.stateChangeType, applyFallback]);
  
  return {
    styles: fallback.cssStyles,
    applyFallback,
    props,
    isActive: shouldUseAlternative || isRecentlyActivated
  };
}

/**
 * Styled component helper for vestibular fallbacks
 * 
 * This is a tagged template literal function that can be used directly in
 * styled-components to add vestibular fallbacks to a component.
 */
export function vestibularFallback(options: VestibularFallbackOptions) {
  const fallback = createVestibularFallback(options);
  return fallback.cssStyles;
}

/**
 * Create a global registry for vestibular fallback preferences
 */
let globalVestibularFallbackPreferences = {
  feedbackThresholds: { ...DEFAULT_THRESHOLDS },
  enabledFeedbackTypes: [
    FeedbackType.COLOR,
    FeedbackType.BORDER,
    FeedbackType.ICON,
    FeedbackType.ARIA
  ],
  audioEnabled: true,
  hapticEnabled: true,
  visualEnabled: true
};

/**
 * Set global preferences for vestibular fallbacks
 */
export function setVestibularFallbackPreferences(preferences: {
  feedbackThresholds?: Partial<FeedbackThresholds>;
  enabledFeedbackTypes?: FeedbackType[];
  audioEnabled?: boolean;
  hapticEnabled?: boolean;
  visualEnabled?: boolean;
}): void {
  globalVestibularFallbackPreferences = {
    ...globalVestibularFallbackPreferences,
    ...preferences,
    feedbackThresholds: {
      ...globalVestibularFallbackPreferences.feedbackThresholds,
      ...preferences.feedbackThresholds
    }
  };
  
  // Save to localStorage for persistence
  try {
    localStorage.setItem(
      'galileo-glass-vestibular-preferences', 
      JSON.stringify(globalVestibularFallbackPreferences)
    );
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Get global preferences for vestibular fallbacks
 */
export function getVestibularFallbackPreferences() {
  // Try to load from localStorage
  try {
    const savedPrefs = localStorage.getItem('galileo-glass-vestibular-preferences');
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      globalVestibularFallbackPreferences = {
        ...globalVestibularFallbackPreferences,
        ...parsed,
        feedbackThresholds: {
          ...globalVestibularFallbackPreferences.feedbackThresholds,
          ...parsed.feedbackThresholds
        }
      };
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  return globalVestibularFallbackPreferences;
}

/**
 * Reset global preferences for vestibular fallbacks to defaults
 */
export function resetVestibularFallbackPreferences(): void {
  globalVestibularFallbackPreferences = {
    feedbackThresholds: { ...DEFAULT_THRESHOLDS },
    enabledFeedbackTypes: [
      FeedbackType.COLOR,
      FeedbackType.BORDER,
      FeedbackType.ICON,
      FeedbackType.ARIA
    ],
    audioEnabled: true,
    hapticEnabled: true,
    visualEnabled: true
  };
  
  // Remove from localStorage
  try {
    localStorage.removeItem('galileo-glass-vestibular-preferences');
  } catch (e) {
    // Ignore storage errors
  }
}