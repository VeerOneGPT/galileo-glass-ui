/**
 * Device Capabilities - Display Detection
 * 
 * Screen and display capabilities detection
 */

import { DisplayCapabilities } from './types';

// Default display capabilities for SSR or when detection fails
export const DEFAULT_DISPLAY_CAPABILITIES: DisplayCapabilities = {
  devicePixelRatio: 1,
  colorDepth: 24,
  colorGamut: 'srgb',
  hdrSupport: false,
  screenWidth: 1920,
  screenHeight: 1080,
  availScreenWidth: 1920,
  availScreenHeight: 1080,
  orientation: 'landscape',
  refreshRate: 60
};

/**
 * Detect color gamut support
 */
const detectColorGamut = (): 'srgb' | 'p3' | 'rec2020' | 'unknown' => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return 'srgb';
  }
  
  // Test for various color gamuts
  if (matchMedia('(color-gamut: rec2020)').matches) {
    return 'rec2020'; // Widest gamut
  }
  
  if (matchMedia('(color-gamut: p3)').matches) {
    return 'p3'; // Apple's P3 color space, wider than sRGB
  }
  
  if (matchMedia('(color-gamut: srgb)').matches) {
    return 'srgb'; // Standard RGB space
  }
  
  return 'unknown';
};

/**
 * Detect HDR support
 */
const detectHdrSupport = (): boolean => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return false;
  }
  
  // Check for HDR display
  return matchMedia('(dynamic-range: high)').matches;
};

/**
 * Detect screen orientation
 */
const detectOrientation = (): 'portrait' | 'landscape' | 'unknown' => {
  if (typeof window === 'undefined') {
    return 'landscape';
  }
  
  // Use screen orientation API if available
  if ('orientation' in screen && screen.orientation && screen.orientation.type) {
    if (screen.orientation.type.includes('portrait')) {
      return 'portrait';
    }
    if (screen.orientation.type.includes('landscape')) {
      return 'landscape';
    }
  }
  
  // Fallback to window dimensions
  if (window.innerHeight > window.innerWidth) {
    return 'portrait';
  }
  
  if (window.innerWidth > window.innerHeight) {
    return 'landscape';
  }
  
  return 'unknown';
};

/**
 * Try to detect screen refresh rate
 */
const detectRefreshRate = (): Promise<number> => {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(60);
      return;
    }
    
    // Try using newer API if available
    if ('screen' in window && 'refreshRate' in screen) {
      resolve((screen as any).refreshRate || 60);
      return;
    }
    
    // Fallback method using requestAnimationFrame timing
    let lastTime = 0;
    const samples: number[] = [];
    const samplesDuration = 500; // Collect samples for 500ms
    const startTime = performance.now();
    
    function collectSamples(now: number) {
      if (lastTime !== 0) {
        const delta = now - lastTime;
        if (delta > 5 && delta < 33) { // Only collect reasonable values (30-200fps range)
          samples.push(delta);
        }
      }
      
      lastTime = now;
      
      if (now - startTime < samplesDuration) {
        requestAnimationFrame(collectSamples);
      } else {
        // Calculate refresh rate from samples
        if (samples.length === 0) {
          resolve(60); // Default if no samples
        } else {
          // Get average frame time
          const avgFrameTime = samples.reduce((sum, val) => sum + val, 0) / samples.length;
          // Convert to FPS and round to nearest common refresh rate
          const estimatedFps = 1000 / avgFrameTime;
          
          // Round to common refresh rates
          if (estimatedFps > 30 && estimatedFps <= 50) resolve(48);
          else if (estimatedFps > 50 && estimatedFps <= 70) resolve(60);
          else if (estimatedFps > 70 && estimatedFps <= 100) resolve(90);
          else if (estimatedFps > 100 && estimatedFps <= 130) resolve(120);
          else if (estimatedFps > 130 && estimatedFps <= 155) resolve(144);
          else if (estimatedFps > 155) resolve(165);
          else resolve(Math.round(estimatedFps)); // Non-standard rate
        }
      }
    }
    
    requestAnimationFrame(collectSamples);
  });
};

/**
 * Detect display capabilities
 */
export const detectDisplayCapabilities = async (): Promise<DisplayCapabilities> => {
  if (typeof window === 'undefined') {
    return DEFAULT_DISPLAY_CAPABILITIES;
  }
  
  // Get color settings
  const colorDepth = window.screen.colorDepth || 24;
  const colorGamut = detectColorGamut();
  const hdrSupport = detectHdrSupport();
  
  // Get screen dimensions
  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenWidth = window.screen.width || 1920;
  const screenHeight = window.screen.height || 1080;
  const availScreenWidth = window.screen.availWidth || screenWidth;
  const availScreenHeight = window.screen.availHeight || screenHeight;
  
  // Get orientation
  const orientation = detectOrientation();
  
  // Try to detect refresh rate
  const refreshRate = await detectRefreshRate();
  
  return {
    devicePixelRatio,
    colorDepth,
    colorGamut,
    hdrSupport,
    screenWidth,
    screenHeight,
    availScreenWidth,
    availScreenHeight,
    orientation,
    refreshRate
  };
};

/**
 * Get display capabilities synchronously (without refresh rate detection)
 */
export const getDisplayCapabilitiesSync = (): Omit<DisplayCapabilities, 'refreshRate'> & { refreshRate?: number } => {
  if (typeof window === 'undefined') {
    return DEFAULT_DISPLAY_CAPABILITIES;
  }
  
  return {
    devicePixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth || 24,
    colorGamut: detectColorGamut(),
    hdrSupport: detectHdrSupport(),
    screenWidth: window.screen.width || 1920,
    screenHeight: window.screen.height || 1080,
    availScreenWidth: window.screen.availWidth || window.screen.width || 1920,
    availScreenHeight: window.screen.availHeight || window.screen.height || 1080,
    orientation: detectOrientation(),
  };
};