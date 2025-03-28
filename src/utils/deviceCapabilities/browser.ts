/**
 * Device Capabilities - Browser Detection
 * 
 * Browser feature detection and capabilities analysis
 */

import { BrowserCapabilities, FeatureSupport } from './types';

// Default browser capabilities for SSR or when detection fails
export const DEFAULT_BROWSER_CAPABILITIES: BrowserCapabilities = {
  name: 'unknown',
  engine: 'unknown',
  version: 'unknown',
  backdropFilterSupport: true,
  cssGridSupport: true,
  flexboxSupport: true,
  cssVariablesSupport: true,
  webAnimationsSupport: true,
  requestAnimationFrameSupport: true,
  compositingSupport: true,
  layerOptimizationSupport: true,
  sharedArrayBufferSupport: false,
  webWorkerSupport: true,
  webAssemblySupport: true,
  webComponentsSupport: true,
  shadowDomSupport: true,
  intersectionObserverSupport: true,
  resizeObserverSupport: true,
  mutationObserverSupport: true,
  pointerEventsSupport: true,
  offlineCapabilities: FeatureSupport.UNKNOWN
};

/**
 * Parse user agent to extract browser details
 */
const parseBrowserInfo = (): { name: string; engine: string; version: string } => {
  if (typeof navigator === 'undefined') {
    return { name: 'unknown', engine: 'unknown', version: 'unknown' };
  }
  
  const ua = navigator.userAgent;
  let browserName = 'unknown';
  let browserVersion = 'unknown';
  let renderingEngine = 'unknown';
  
  // Extract browser name and version
  if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
    renderingEngine = 'Gecko';
    const match = ua.match(/Firefox\/(\d+(\.\d+)?)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('SamsungBrowser/')) {
    browserName = 'Samsung Browser';
    renderingEngine = 'Blink';
    const match = ua.match(/SamsungBrowser\/(\d+(\.\d+)?)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
    browserName = 'Opera';
    renderingEngine = 'Blink';
    const match = ua.match(/OPR\/(\d+(\.\d+)?)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge';
    renderingEngine = 'Blink';
    const match = ua.match(/Edg\/(\d+(\.\d+)?)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome';
    renderingEngine = 'Blink';
    const match = ua.match(/Chrome\/(\d+(\.\d+)?)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Safari/') && ua.includes('Version/')) {
    browserName = 'Safari';
    renderingEngine = 'WebKit';
    const match = ua.match(/Version\/(\d+(\.\d+)?)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    browserName = 'Internet Explorer';
    renderingEngine = 'Trident';
    const match = ua.match(/MSIE (\d+(\.\d+)?)/);
    if (match) browserVersion = match[1];
    else {
      const tridentMatch = ua.match(/Trident\/.*rv:(\d+(\.\d+)?)/);
      if (tridentMatch) browserVersion = tridentMatch[1];
    }
  }
  
  return {
    name: browserName,
    engine: renderingEngine,
    version: browserVersion
  };
};

/**
 * Test if a CSS feature is supported
 */
const supportsCSS = (property: string, value?: string): boolean => {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false;
  }
  
  if (value) {
    return CSS.supports(property, value);
  } else {
    return CSS.supports(property);
  }
};

/**
 * Detect browser-specific capabilities
 */
export const detectBrowserCapabilities = (): BrowserCapabilities => {
  if (typeof window === 'undefined') {
    return DEFAULT_BROWSER_CAPABILITIES;
  }
  
  // Get browser info
  const { name, engine, version } = parseBrowserInfo();
  
  // CSS features
  const backdropFilterSupport = supportsCSS('backdrop-filter', 'blur(10px)') || 
                               supportsCSS('-webkit-backdrop-filter', 'blur(10px)');
  
  const cssGridSupport = supportsCSS('display', 'grid');
  const flexboxSupport = supportsCSS('display', 'flex');
  const cssVariablesSupport = supportsCSS('--test', '0');
  
  // Animation APIs
  const webAnimationsSupport = typeof Element !== 'undefined' && 'animate' in Element.prototype;
  const requestAnimationFrameSupport = typeof requestAnimationFrame === 'function';
  
  // Rendering capabilities
  const compositingSupport = supportsCSS('will-change', 'transform');
  const layerOptimizationSupport = supportsCSS('contain', 'paint layout');
  
  // Advanced features
  const sharedArrayBufferSupport = typeof SharedArrayBuffer !== 'undefined';
  const webWorkerSupport = typeof Worker !== 'undefined';
  const webAssemblySupport = typeof WebAssembly !== 'undefined';
  
  // DOM features
  const webComponentsSupport = typeof customElements !== 'undefined';
  const shadowDomSupport = typeof Element !== 'undefined' && 'attachShadow' in Element.prototype;
  const intersectionObserverSupport = typeof IntersectionObserver !== 'undefined';
  const resizeObserverSupport = typeof ResizeObserver !== 'undefined';
  const mutationObserverSupport = typeof MutationObserver !== 'undefined';
  const pointerEventsSupport = typeof PointerEvent !== 'undefined';
  
  // Check offline capabilities
  let offlineCapabilities = FeatureSupport.UNKNOWN;
  
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    offlineCapabilities = FeatureSupport.SUPPORTED;
  } else if (typeof window !== 'undefined' && 'applicationCache' in window) {
    // Legacy AppCache API (deprecated)
    offlineCapabilities = FeatureSupport.PARTIAL;
  } else {
    offlineCapabilities = FeatureSupport.UNSUPPORTED;
  }
  
  return {
    name,
    engine,
    version,
    backdropFilterSupport,
    cssGridSupport,
    flexboxSupport,
    cssVariablesSupport,
    webAnimationsSupport,
    requestAnimationFrameSupport,
    compositingSupport,
    layerOptimizationSupport,
    sharedArrayBufferSupport,
    webWorkerSupport,
    webAssemblySupport,
    webComponentsSupport,
    shadowDomSupport,
    intersectionObserverSupport,
    resizeObserverSupport,
    mutationObserverSupport,
    pointerEventsSupport,
    offlineCapabilities
  };
};

/**
 * Get information about a specific browser feature
 */
export const getBrowserFeatureDetails = (
  feature: keyof BrowserCapabilities, 
  browser: BrowserCapabilities
): {
  supported: boolean;
  alternative?: string;
  description: string;
} => {
  // Get the feature value
  const supported = Boolean(browser[feature]);
  let description = '';
  let alternative = undefined;
  
  // Provide useful information about each feature
  switch (feature) {
    case 'backdropFilterSupport':
      description = 'Allows for backdrop blur and filter effects';
      alternative = 'Fall back to solid background colors or use opacity';
      break;
      
    case 'cssGridSupport':
      description = 'Enables advanced grid-based layouts';
      alternative = 'Use flexbox or traditional float-based layouts';
      break;
      
    case 'flexboxSupport':
      description = 'Enables flexible box layouts';
      alternative = 'Use traditional CSS layouts with floats and positioning';
      break;
      
    case 'cssVariablesSupport':
      description = 'Allows for dynamic CSS values with variables';
      alternative = 'Use preprocessor variables or duplicate values';
      break;
      
    case 'webAnimationsSupport':
      description = 'Native Web Animations API for JavaScript animations';
      alternative = 'Use CSS animations or requestAnimationFrame';
      break;
      
    case 'compositingSupport':
      description = 'Enables browser optimizations for smooth animations';
      alternative = 'Use simpler animations with fewer properties';
      break;
      
    case 'webComponentsSupport':
      description = 'Supports custom elements and web components';
      alternative = 'Use regular DOM elements with class-based behavior';
      break;
    
    case 'intersectionObserverSupport':
      description = 'Efficiently detect when elements enter the viewport';
      alternative = 'Use scroll event listeners with throttling';
      break;
      
    case 'offlineCapabilities':
      description = 'Support for offline web applications';
      alternative = 'Ensure critical functionality works without advanced offline features';
      break;
      
    default:
      description = `Support for ${feature}`;
  }
  
  return {
    supported,
    alternative,
    description
  };
};