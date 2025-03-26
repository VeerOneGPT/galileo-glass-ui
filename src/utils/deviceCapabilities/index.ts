/**
 * Device Capabilities
 *
 * Utilities for detecting and adapting to device capabilities.
 */

/**
 * Device capability tiers
 */
export enum DeviceCapabilityTier {
  ULTRA = 'ultra', // High-end devices with excellent performance
  HIGH = 'high', // Good performance devices
  MEDIUM = 'medium', // Mid-range devices
  LOW = 'low', // Lower-end devices that may struggle with complex animations
  MINIMAL = 'minimal', // Minimal capability devices that should avoid most animations
  UNKNOWN = 'unknown', // Capability could not be determined
}

/**
 * Browser feature support detection
 */
export interface BrowserFeatures {
  /** Whether the browser supports WebGL */
  webgl: boolean;

  /** Whether the browser supports WebGL2 */
  webgl2: boolean;

  /** Whether the browser supports Web Animations API */
  webAnimations: boolean;

  /** Whether the browser supports intersection observer */
  intersectionObserver: boolean;

  /** Whether the browser supports requestAnimationFrame */
  requestAnimationFrame: boolean;

  /** Whether the browser supports particular CSS features and provides a feature detection method */
  supports: {
    backdropFilter: boolean;
    webkitBackdropFilter: boolean;
    transform3d: boolean;
    willChange: boolean;
    (feature: string): boolean;
  };

  /** Browser rendering engine */
  engine: 'gecko' | 'webkit' | 'blink' | 'trident' | 'unknown';
}

/**
 * Detect browser features
 * @returns Object with detected browser features
 */
export const detectFeatures = (): BrowserFeatures => {
  const features: BrowserFeatures = {
    webgl: false,
    webgl2: false,
    webAnimations: false,
    intersectionObserver: false,
    requestAnimationFrame: false,
    supports: Object.assign(
      {
        backdropFilter: false,
        webkitBackdropFilter: false,
        transform3d: false,
        willChange: false,
      },
      // Add a function to the supports object
      function (feature: string): boolean {
        if (typeof window === 'undefined') return false;

        // Check for common features
        switch (feature.toLowerCase()) {
          case 'transform3d':
            return !!(this as any).transform3d;
          case 'backdrop-filter':
          case 'backdropfilter':
            return !!(this as any).backdropFilter;
          case '-webkit-backdrop-filter':
          case 'webkitbackdropfilter':
            return !!(this as any).webkitBackdropFilter;
          default:
            // Generic CSS property check
            return (
              typeof CSS !== 'undefined' &&
              typeof CSS.supports === 'function' &&
              CSS.supports(feature)
            );
        }
      }
    ),
    engine: 'unknown',
  };

  if (typeof window === 'undefined') {
    return features;
  }

  // Detect WebGL support
  try {
    const canvas = document.createElement('canvas');
    const hasWebGL =
      !!(window as any).WebGLRenderingContext &&
      !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    features.webgl = hasWebGL;

    const hasWebGL2 = !!(window as any).WebGL2RenderingContext && !!canvas.getContext('webgl2');
    features.webgl2 = hasWebGL2;
  } catch (e) {
    // WebGL not supported
  }

  // Detect Web Animations API
  features.webAnimations = 'animate' in Element.prototype;

  // Detect Intersection Observer
  features.intersectionObserver = 'IntersectionObserver' in window;

  // Detect requestAnimationFrame
  features.requestAnimationFrame = 'requestAnimationFrame' in window;

  // Detect CSS features
  if ('CSS' in window && (window as any).CSS.supports) {
    features.supports.backdropFilter = (window as any).CSS.supports(
      'backdrop-filter',
      'blur(10px)'
    );
    features.supports.webkitBackdropFilter = (window as any).CSS.supports(
      '-webkit-backdrop-filter',
      'blur(10px)'
    );
    features.supports.transform3d = (window as any).CSS.supports('transform', 'translate3d(0,0,0)');
    features.supports.willChange = (window as any).CSS.supports('will-change', 'transform');
  }

  // Detect browser engine
  const ua = navigator.userAgent;
  if (ua.includes('Gecko/')) {
    features.engine = 'gecko';
  } else if (ua.includes('AppleWebKit/')) {
    if (ua.includes('Chrome/') || ua.includes('Chromium/')) {
      features.engine = 'blink';
    } else {
      features.engine = 'webkit';
    }
  } else if (ua.includes('Trident/')) {
    features.engine = 'trident';
  }

  return features;
};

/**
 * Estimate device performance
 * @returns Performance score from 0 (low) to 10 (high)
 */
export const estimateDevicePerformance = (): number => {
  if (typeof window === 'undefined') {
    return 5; // Default to medium performance for SSR
  }

  // Base score
  let score = 5;

  // Adjust score based on device memory
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory) {
      if (memory >= 8) score += 2;
      else if (memory >= 4) score += 1;
      else if (memory < 2) score -= 1;
      else if (memory < 1) score -= 2;
    }
  }

  // Adjust score based on hardware concurrency
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores >= 8) score += 2;
    else if (cores >= 4) score += 1;
    else if (cores <= 2) score -= 1;
  }

  // Mobile devices typically have lower performance
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    score -= 1;
  }

  // Reduce score for iOS Safari due to animation performance issues
  if (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream &&
    /Safari/i.test(navigator.userAgent) &&
    !/Chrome/i.test(navigator.userAgent)
  ) {
    score -= 1;
  }

  // Older browsers typically have lower performance
  if (/Trident|MSIE|EdgeHTML/i.test(navigator.userAgent)) {
    score -= 2;
  }

  // Detect WebGL support (good indicator of graphics capability)
  const features = detectFeatures();
  if (features.webgl) score += 1;
  if (features.webgl2) score += 1;

  // Ensure score is between 0 and 10
  return Math.max(0, Math.min(10, score));
};

/**
 * Get device capability tier
 * @returns Device capability tier
 */
export const getDeviceCapabilityTier = (): DeviceCapabilityTier => {
  const performanceScore = estimateDevicePerformance();

  if (performanceScore >= 9) return DeviceCapabilityTier.ULTRA;
  if (performanceScore >= 7) return DeviceCapabilityTier.HIGH;
  if (performanceScore >= 5) return DeviceCapabilityTier.MEDIUM;
  if (performanceScore >= 3) return DeviceCapabilityTier.LOW;
  if (performanceScore >= 0) return DeviceCapabilityTier.MINIMAL;

  return DeviceCapabilityTier.UNKNOWN;
};
