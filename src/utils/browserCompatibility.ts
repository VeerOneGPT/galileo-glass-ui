/**
 * Browser Compatibility Utilities
 * 
 * Utilities for detecting browser features and providing appropriate fallbacks
 */
// Import CSS type definitions
import '../types/css';

/**
 * Browser feature detection results
 */
export interface BrowserFeatures {
  /**
   * Whether the browser supports backdrop-filter
   */
  backdropFilter: boolean;
  
  /**
   * Whether the browser supports backdrop-filter with blur
   */
  backdropFilterBlur: boolean;
  
  /**
   * Whether the browser supports CSS Grid
   */
  cssGrid: boolean;
  
  /**
   * Whether the browser supports CSS Variables
   */
  cssVariables: boolean;
  
  /**
   * Whether the browser supports Touch events
   */
  touchEvents: boolean;
  
  /**
   * Whether the browser supports Flexbox
   */
  flexbox: boolean;
  
  /**
   * Whether the browser supports position: sticky
   */
  positionSticky: boolean;
  
  /**
   * Whether the browser supports WebGL
   */
  webGL: boolean;
  
  /**
   * Whether the browser supports WebP image format
   */
  webp: boolean;
  
  /**
   * Whether the browser supports CSS transitions
   */
  cssTransitions: boolean;
  
  /**
   * Whether the browser supports CSS animations
   */
  cssAnimations: boolean;
  
  /**
   * Whether the browser supports smooth scrolling
   */
  smoothScrolling: boolean;
  
  /**
   * Whether the browser supports intersection observer
   */
  intersectionObserver: boolean;
  
  /**
   * Whether the browser supports resize observer
   */
  resizeObserver: boolean;
  
  /**
   * Whether the browser supports passive event listeners
   */
  passiveEvents: boolean;
  
  /**
   * Whether the browser supports the Web Animations API
   */
  webAnimationsAPI: boolean;
  
  /**
   * Whether the device is high-DPI/retina
   */
  highDPI: boolean;
  
  /**
   * Whether the browser supports hardware acceleration
   */
  hardwareAcceleration: boolean;
  
  /**
   * Browser name
   */
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'opera' | 'samsung' | 'unknown';
  
  /**
   * Browser version (major)
   */
  browserVersion: number;
  
  /**
   * Operating system
   */
  os: 'windows' | 'mac' | 'ios' | 'android' | 'linux' | 'unknown';
  
  /**
   * Current color scheme preference
   */
  colorScheme: 'light' | 'dark' | 'no-preference';
}

/**
 * Default feature support values
 */
const DEFAULT_FEATURES: BrowserFeatures = {
  backdropFilter: false,
  backdropFilterBlur: false,
  cssGrid: false,
  cssVariables: false,
  touchEvents: false,
  flexbox: false,
  positionSticky: false,
  webGL: false,
  webp: false,
  cssTransitions: false,
  cssAnimations: false,
  smoothScrolling: false,
  intersectionObserver: false,
  resizeObserver: false,
  passiveEvents: false,
  webAnimationsAPI: false,
  highDPI: false,
  hardwareAcceleration: false,
  browser: 'unknown',
  browserVersion: 0,
  os: 'unknown',
  colorScheme: 'light'
};

/**
 * Detects browser name and version
 */
function detectBrowser(): { browser: BrowserFeatures['browser']; version: number } {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { browser: 'unknown', version: 0 };
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detect browser
  let browser: BrowserFeatures['browser'] = 'unknown';
  let version = 0;
  
  if (userAgent.indexOf('edge') > -1 || userAgent.indexOf('edg/') > -1) {
    browser = 'edge';
    const match = userAgent.match(/edge\/(\d+)|edg\/(\d+)/);
    version = match ? parseInt(match[1] || match[2], 10) : 0;
  } else if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg/') === -1) {
    browser = 'chrome';
    const match = userAgent.match(/chrome\/(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  } else if (userAgent.indexOf('firefox') > -1) {
    browser = 'firefox';
    const match = userAgent.match(/firefox\/(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
    browser = 'safari';
    const match = userAgent.match(/version\/(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  } else if (userAgent.indexOf('msie') > -1 || userAgent.indexOf('trident') > -1) {
    browser = 'ie';
    const match = userAgent.match(/(?:msie |rv:)(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  } else if (userAgent.indexOf('opera') > -1 || userAgent.indexOf('opr/') > -1) {
    browser = 'opera';
    const match = userAgent.match(/(?:opera|opr)\/(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  } else if (userAgent.indexOf('samsungbrowser') > -1) {
    browser = 'samsung';
    const match = userAgent.match(/samsungbrowser\/(\d+)/);
    version = match ? parseInt(match[1], 10) : 0;
  }
  
  return { browser, version };
}

/**
 * Detects operating system
 */
function detectOS(): BrowserFeatures['os'] {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unknown';
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('windows') > -1) {
    return 'windows';
  } else if (userAgent.indexOf('mac') > -1 && userAgent.indexOf('mobile') === -1) {
    return 'mac';
  } else if (/(iphone|ipad|ipod)/.test(userAgent)) {
    return 'ios';
  } else if (userAgent.indexOf('android') > -1) {
    return 'android';
  } else if (userAgent.indexOf('linux') > -1) {
    return 'linux';
  }
  
  return 'unknown';
}

/**
 * Detects color scheme preference
 */
function detectColorScheme(): BrowserFeatures['colorScheme'] {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'light';
}

/**
 * Detects features using feature detection techniques
 */
export function detectFeatures(): BrowserFeatures {
  // Return default features if running in a non-browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return DEFAULT_FEATURES;
  }
  
  const { browser, version } = detectBrowser();
  const os = detectOS();
  const colorScheme = detectColorScheme();
  
  // CSS Property Detection Helper
  const supportsCSSProperty = (property: string): boolean => {
    return typeof document.body.style[property as any] !== 'undefined';
  };
  
  // Create a test div for feature detection
  const testDiv = document.createElement('div');
  
  // Test for backdrop-filter support with proper casing handling
  const backdropFilter = supportsCSSProperty('backdropFilter') || 
                          supportsCSSProperty('WebkitBackdropFilter') ||
                          supportsCSSProperty('-webkit-backdrop-filter');
  
  // Test for backdrop-filter blur specifically
  let backdropFilterBlur = false;
  if (backdropFilter) {
    try {
      testDiv.style.backdropFilter = 'blur(5px)';
      backdropFilterBlur = !!testDiv.style.backdropFilter;
      
      if (!backdropFilterBlur) {
        // Try both camel case and kebab case
        testDiv.style.WebkitBackdropFilter = 'blur(5px)';
        backdropFilterBlur = !!testDiv.style.WebkitBackdropFilter;
        
        if (!backdropFilterBlur) {
          // Using string index access to avoid TypeScript errors with kebab case
          testDiv.style['-webkit-backdrop-filter' as any] = 'blur(5px)';
          backdropFilterBlur = !!(testDiv.style['-webkit-backdrop-filter' as any]);
        }
      }
    } catch (e) {
      backdropFilterBlur = false;
    }
  }
  
  // Test for CSS Grid support
  const cssGrid = window.CSS && CSS.supports && (
    CSS.supports('display', 'grid') || 
    CSS.supports('display', '-ms-grid')
  );
  
  // Test for CSS Variables support
  const cssVariables = window.CSS && CSS.supports && CSS.supports('--custom-prop', 'value');
  
  // Test for touch events
  const touchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Test for flexbox support
  const flexbox = CSS.supports && (
    CSS.supports('display', 'flex') ||
    CSS.supports('display', '-webkit-flex')
  );
  
  // Test for position: sticky support
  const positionSticky = CSS.supports && CSS.supports('position', 'sticky');
  
  // Test for WebGL support
  let webGL = false;
  try {
    const canvas = document.createElement('canvas');
    webGL = !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    webGL = false;
  }
  
  // Test for WebP support
  let webp = false;
  const webpPromise = new Promise<boolean>(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  });
  // We'll set this asynchronously, but initially assume false
  webpPromise.then(result => { webp = result; });
  
  // Test for CSS transitions
  const cssTransitions = supportsCSSProperty('transition') || 
                          supportsCSSProperty('webkitTransition');
  
  // Test for CSS animations
  const cssAnimations = supportsCSSProperty('animation') || 
                         supportsCSSProperty('webkitAnimation');
  
  // Test for smooth scrolling
  const smoothScrolling = 'scrollBehavior' in document.documentElement.style;
  
  // Test for Intersection Observer
  const intersectionObserver = 'IntersectionObserver' in window;
  
  // Test for Resize Observer
  const resizeObserver = 'ResizeObserver' in window;
  
  // Test for passive event listeners
  let passiveEvents = false;
  try {
    // Test via a getter in the options object to see if the passive property is accessed
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        passiveEvents = true;
        return true;
      }
    });
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {
    passiveEvents = false;
  }
  
  // Test for Web Animations API
  const webAnimationsAPI = typeof Element !== 'undefined' && 
                           typeof Element.prototype.animate === 'function';
  
  // Check for high-DPI/retina display
  const highDPI = window.devicePixelRatio > 1;
  
  // Check for hardware acceleration (approximation)
  const hardwareAcceleration = webGL || 
                              (browser === 'chrome' && version >= 33) || 
                              (browser === 'firefox' && version >= 57) ||
                              (browser === 'safari' && version >= 9) ||
                              (browser === 'edge' && version >= 16);
  
  return {
    backdropFilter,
    backdropFilterBlur,
    cssGrid,
    cssVariables,
    touchEvents,
    flexbox,
    positionSticky,
    webGL,
    webp,
    cssTransitions,
    cssAnimations,
    smoothScrolling,
    intersectionObserver,
    resizeObserver,
    passiveEvents,
    webAnimationsAPI,
    highDPI,
    hardwareAcceleration,
    browser,
    browserVersion: version,
    os,
    colorScheme
  };
}

/**
 * Feature support requirements for Glass UI components
 */
export interface FeatureRequirements {
  /**
   * Required features that must be present
   */
  required: Array<keyof BrowserFeatures>;
  
  /**
   * Optional features that enhance the component if present
   */
  optional: Array<keyof BrowserFeatures>;
  
  /**
   * Minimum browser versions required
   */
  browsers: {
    chrome?: number;
    firefox?: number;
    safari?: number;
    edge?: number;
    ie?: number;
    opera?: number;
    samsung?: number;
  };
}

/**
 * Feature requirement levels
 */
export enum FeatureLevel {
  /**
   * Feature is fully supported
   */
  FULL = 'full',
  
  /**
   * Feature is supported with some visual degradation
   */
  PARTIAL = 'partial',
  
  /**
   * Feature falls back to a simpler alternative
   */
  FALLBACK = 'fallback',
  
  /**
   * Feature is not supported
   */
  UNSUPPORTED = 'unsupported'
}

/**
 * Get feature support level based on requirements
 */
export function getFeatureSupportLevel(
  requirements: FeatureRequirements,
  features: BrowserFeatures = detectFeatures()
): FeatureLevel {
  // Check required features
  const hasAllRequired = requirements.required.every(feature => !!features[feature]);
  if (!hasAllRequired) {
    return FeatureLevel.UNSUPPORTED;
  }
  
  // Check browser version requirements
  const { browser, browserVersion } = features;
  const minVersion = requirements.browsers[browser];
  if (minVersion && browserVersion < minVersion) {
    return FeatureLevel.FALLBACK;
  }
  
  // Check optional features
  const hasAllOptional = requirements.optional.every(feature => !!features[feature]);
  
  return hasAllOptional ? FeatureLevel.FULL : FeatureLevel.PARTIAL;
}

/**
 * Get a fallback value for unsupported features
 */
export function getFeatureFallback<T>(
  feature: keyof BrowserFeatures,
  fullValue: T,
  fallbackValue: T,
  features: BrowserFeatures = detectFeatures()
): T {
  return features[feature] ? fullValue : fallbackValue;
}

/**
 * Feature requirements for Glass UI components
 */
export const GLASS_REQUIREMENTS: FeatureRequirements = {
  required: ['cssVariables', 'flexbox', 'cssTransitions'],
  optional: ['backdropFilter', 'backdropFilterBlur', 'hardwareAcceleration'],
  browsers: {
    chrome: 76,
    firefox: 70,
    safari: 13,
    edge: 79,
    opera: 63,
    samsung: 12
  }
};

/**
 * Feature requirements for animation features
 */
export const ANIMATION_REQUIREMENTS: FeatureRequirements = {
  required: ['cssAnimations', 'cssTransitions'],
  optional: ['webAnimationsAPI', 'hardwareAcceleration'],
  browsers: {
    chrome: 70,
    firefox: 65,
    safari: 12,
    edge: 79,
    opera: 60,
    samsung: 10
  }
};

/**
 * Feature requirements for advanced glass effects
 */
export const ADVANCED_GLASS_REQUIREMENTS: FeatureRequirements = {
  required: ['backdropFilter', 'cssVariables', 'flexbox'],
  optional: ['backdropFilterBlur', 'hardwareAcceleration', 'highDPI'],
  browsers: {
    chrome: 76,
    firefox: 70,
    safari: 13,
    edge: 79,
    opera: 63,
    samsung: 12
  }
};

/**
 * Get appropriate backdrop filter value with fallback
 */
export function getBackdropFilterValue(
  blurValue: string | number,
  features: BrowserFeatures = detectFeatures()
): string {
  // If backdrop filter is not supported, return empty string
  if (!features.backdropFilter) {
    return '';
  }
  
  // Normalize blur value
  const blurPx = typeof blurValue === 'number' ? `${blurValue}px` : blurValue;
  
  // Use vendor prefix if needed
  if (features.browser === 'safari') {
    return `backdrop-filter: blur(${blurPx}); -webkit-backdrop-filter: blur(${blurPx});`;
  }
  
  return `backdrop-filter: blur(${blurPx});`;
}

/**
 * Get a fallback background color for when backdrop filter is not supported
 */
export function getBackdropFilterFallback(
  color: string,
  opacity: number,
  features: BrowserFeatures = detectFeatures()
): string {
  // If backdrop filter is supported, return original color with opacity
  if (features.backdropFilter) {
    return color;
  }
  
  // If color is already in rgba format, adjust its opacity
  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/, 
                        (_, r, g, b) => `rgba(${r}, ${g}, ${b}, ${Math.min(1, opacity + 0.8)})`);
  }
  
  // If color is rgb format, convert to rgba with adjusted opacity
  if (color.startsWith('rgb(')) {
    return color.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/, 
                         (_, r, g, b) => `rgba(${r}, ${g}, ${b}, ${Math.min(1, opacity + 0.8)})`);
  }
  
  // If color is hex format, convert to rgba with adjusted opacity
  if (color.startsWith('#')) {
    // Convert hex to rgb
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(x => x + x).join('');
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${Math.min(1, opacity + 0.8)})`;
  }
  
  // Default fallback
  return `rgba(255, 255, 255, ${Math.min(1, opacity + 0.8)})`;
}

/**
 * Create a glassmorphism style with appropriate fallbacks
 */
export function createGlassStyle(
  options: {
    backgroundColor: string;
    backgroundOpacity: number;
    blurStrength: string | number;
    borderColor: string;
    borderOpacity: number;
  },
  features: BrowserFeatures = detectFeatures()
): string {
  const { 
    backgroundColor, 
    backgroundOpacity, 
    blurStrength, 
    borderColor, 
    borderOpacity 
  } = options;
  
  // Check if advanced glass effects are supported
  const supportLevel = getFeatureSupportLevel(ADVANCED_GLASS_REQUIREMENTS, features);
  
  if (supportLevel === FeatureLevel.FULL || supportLevel === FeatureLevel.PARTIAL) {
    // Full glass effect with backdrop filter
    return `
      background-color: ${getBackdropFilterFallback(backgroundColor, backgroundOpacity, features)};
      ${getBackdropFilterValue(blurStrength, features)}
      border: 1px solid ${borderColor.replace(')', `, ${borderOpacity})`).replace('rgb', 'rgba')};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    `;
  } else {
    // Fallback style without backdrop filter
    return `
      background-color: ${getBackdropFilterFallback(backgroundColor, backgroundOpacity, features)};
      border: 1px solid ${borderColor.replace(')', `, ${Math.min(borderOpacity + 0.1, 1)})`).replace('rgb', 'rgba')};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    `;
  }
}