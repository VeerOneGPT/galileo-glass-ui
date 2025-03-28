/**
 * Device Capabilities - Accessibility Detection
 * 
 * User accessibility preferences detection
 */

import { AccessibilityCapabilities } from './types';

// Default accessibility capabilities for SSR or when detection fails
export const DEFAULT_ACCESSIBILITY_CAPABILITIES: AccessibilityCapabilities = {
  prefersReducedMotion: false,
  prefersReducedTransparency: false,
  prefersContrast: 'no-preference',
  prefersColorScheme: 'light',
  likelyUsingScreenReader: false,
  fontSizeAdjustment: 1.0
};

/**
 * Detect if user prefers reduced motion
 */
const detectPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return false;
  }
  
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detect if user prefers reduced transparency
 */
const detectPrefersReducedTransparency = (): boolean => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return false;
  }
  
  return matchMedia('(prefers-reduced-transparency: reduce)').matches;
};

/**
 * Detect if user prefers increased/decreased contrast
 */
const detectPrefersContrast = (): 'no-preference' | 'more' | 'less' | 'custom' => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return 'no-preference';
  }
  
  if (matchMedia('(prefers-contrast: more)').matches) {
    return 'more';
  }
  
  if (matchMedia('(prefers-contrast: less)').matches) {
    return 'less';
  }
  
  if (matchMedia('(prefers-contrast: custom)').matches) {
    return 'custom';
  }
  
  return 'no-preference';
};

/**
 * Detect if user prefers dark or light color scheme
 */
const detectPrefersColorScheme = (): 'light' | 'dark' | 'no-preference' => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return 'light';
  }
  
  if (matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  if (matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'no-preference';
};

/**
 * Try to detect if user might be using a screen reader
 * NOTE: This is a best-guess heuristic and not reliable
 */
const detectScreenReaderUsage = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  
  // Check for common screen reader detection methods
  let possibleScreenReader = false;
  
  // Check for NVDA (may expose navigator.userAgent NV)
  if (navigator.userAgent.toLowerCase().indexOf('nvda') !== -1) {
    possibleScreenReader = true;
  }
  
  // Check for JAWS (may expose window.JAWS)
  if ('JAWS' in window) {
    possibleScreenReader = true;
  }
  
  // Check for VoiceOver (Mac/iOS - may modify the focus ring)
  const voTestElement = document.createElement('div');
  voTestElement.setAttribute('role', 'button');
  voTestElement.setAttribute('aria-label', 'screen reader test');
  document.body.appendChild(voTestElement);
  voTestElement.focus();
  
  // Check if we have an outline style that might indicate VoiceOver
  const computedStyle = window.getComputedStyle(voTestElement);
  const outlineStyle = computedStyle.getPropertyValue('outline-style');
  
  if (outlineStyle === 'auto' || outlineStyle === 'solid') {
    possibleScreenReader = true;
  }
  
  // Remove the test element
  document.body.removeChild(voTestElement);
  
  // Check if we have a high-contrast setting enabled
  // (often used by people with visual impairments)
  if (detectPrefersContrast() === 'more') {
    possibleScreenReader = true;
  }
  
  return possibleScreenReader;
};

/**
 * Detect font size adjustment from user preferences
 */
const detectFontSizeAdjustment = (): number => {
  if (typeof document === 'undefined') {
    return 1.0;
  }
  
  // Create a test element to measure font size
  const testElement = document.createElement('div');
  testElement.style.fontSize = '1rem';
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.textContent = 'M'; // Use a character with relatively stable width
  
  document.body.appendChild(testElement);
  
  // Get the computed font size
  const computedStyle = window.getComputedStyle(testElement);
  const fontSizeStr = computedStyle.getPropertyValue('font-size');
  
  // Remove the test element
  document.body.removeChild(testElement);
  
  // Parse the font size (will be in px)
  const fontSize = parseFloat(fontSizeStr);
  
  // Normalize against the expected base size (typically 16px)
  const baseSize = 16; // standard browser default
  const adjustment = fontSize / baseSize;
  
  return adjustment;
};

/**
 * Detect accessibility capabilities and user preferences
 */
export const detectAccessibilityCapabilities = (): AccessibilityCapabilities => {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCESSIBILITY_CAPABILITIES;
  }
  
  return {
    prefersReducedMotion: detectPrefersReducedMotion(),
    prefersReducedTransparency: detectPrefersReducedTransparency(),
    prefersContrast: detectPrefersContrast(),
    prefersColorScheme: detectPrefersColorScheme(),
    likelyUsingScreenReader: detectScreenReaderUsage(),
    fontSizeAdjustment: detectFontSizeAdjustment()
  };
};

/**
 * Set up accessibility monitoring
 */
export const setupAccessibilityMonitoring = (
  callback: (capabilities: AccessibilityCapabilities) => void
): (() => void) => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return () => {}; // No-op for SSR
  }
  
  // Get initial capabilities
  const capabilities = detectAccessibilityCapabilities();
  callback(capabilities);
  
  // Set up media query listeners
  const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const darkModeQuery = matchMedia('(prefers-color-scheme: dark)');
  const contrastQuery = matchMedia('(prefers-contrast: more)');
  
  const mediaChangeHandler = () => {
    const updatedCapabilities = detectAccessibilityCapabilities();
    callback(updatedCapabilities);
  };
  
  // Add event listeners with appropriate compatibility
  if ('addEventListener' in reducedMotionQuery) {
    reducedMotionQuery.addEventListener('change', mediaChangeHandler);
    darkModeQuery.addEventListener('change', mediaChangeHandler);
    contrastQuery.addEventListener('change', mediaChangeHandler);
  } else if ('addListener' in reducedMotionQuery) {
    // Older browsers
    (reducedMotionQuery as any).addListener(mediaChangeHandler);
    (darkModeQuery as any).addListener(mediaChangeHandler);
    (contrastQuery as any).addListener(mediaChangeHandler);
  }
  
  // Return cleanup function
  return () => {
    if ('removeEventListener' in reducedMotionQuery) {
      reducedMotionQuery.removeEventListener('change', mediaChangeHandler);
      darkModeQuery.removeEventListener('change', mediaChangeHandler);
      contrastQuery.removeEventListener('change', mediaChangeHandler);
    } else if ('removeListener' in reducedMotionQuery) {
      // Older browsers
      (reducedMotionQuery as any).removeListener(mediaChangeHandler);
      (darkModeQuery as any).removeListener(mediaChangeHandler);
      (contrastQuery as any).removeListener(mediaChangeHandler);
    }
  };
};

/**
 * Get accessibility recommendations based on user preferences
 */
export const getAccessibilityRecommendations = (
  capabilities: AccessibilityCapabilities
): {
  recommendations: string[];
  animationStrategy: 'normal' | 'reduced' | 'none';
  transparencyStrategy: 'normal' | 'reduced';
  colorStrategy: 'light' | 'dark' | 'high-contrast';
} => {
  const recommendations: string[] = [];
  let animationStrategy: 'normal' | 'reduced' | 'none' = 'normal';
  let transparencyStrategy: 'normal' | 'reduced' = 'normal';
  let colorStrategy: 'light' | 'dark' | 'high-contrast' = 'light';
  
  // Check motion preferences
  if (capabilities.prefersReducedMotion) {
    recommendations.push('User prefers reduced motion. Minimize or remove animations.');
    
    // If they also have large font size, they might need zero motion
    if (capabilities.fontSizeAdjustment > 1.3) {
      animationStrategy = 'none';
      recommendations.push('User has increased text size and prefers reduced motion. Consider removing all animations.');
    } else {
      animationStrategy = 'reduced';
    }
  }
  
  // Check transparency preferences
  if (capabilities.prefersReducedTransparency) {
    recommendations.push('User prefers reduced transparency. Avoid backdrop blur and glass effects.');
    transparencyStrategy = 'reduced';
  }
  
  // Check contrast preferences
  if (capabilities.prefersContrast === 'more') {
    recommendations.push('User prefers increased contrast. Use high contrast color combinations.');
    colorStrategy = 'high-contrast';
  }
  
  // Check color scheme preference
  if (capabilities.prefersColorScheme === 'dark') {
    recommendations.push('User prefers dark mode. Use dark theme with appropriate contrast.');
    colorStrategy = 'dark';
  }
  
  // Check for screen reader usage
  if (capabilities.likelyUsingScreenReader) {
    recommendations.push('User may be using a screen reader. Ensure proper ARIA attributes and keyboard navigation.');
  }
  
  // Check for font size adjustments
  if (capabilities.fontSizeAdjustment > 1.3) {
    recommendations.push('User has increased text size. Ensure layouts accommodate larger text without breaking.');
  }
  
  return {
    recommendations,
    animationStrategy,
    transparencyStrategy,
    colorStrategy
  };
};