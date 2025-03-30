/**
 * Device capabilities detection hook for adaptive performance
 * 
 * Detects hardware capabilities of the current device to enable
 * intelligent scaling of animation complexity.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Device tier classification
 */
export enum DeviceTier {
  /** Low-end devices with limited GPU/CPU */
  LOW = 'low',
  
  /** Mid-range devices */
  MEDIUM = 'medium',
  
  /** High-end devices */
  HIGH = 'high',
  
  /** Extremely powerful devices */
  ULTRA = 'ultra'
}

/**
 * Device type classification
 */
export enum DeviceType {
  /** Mobile phones */
  MOBILE = 'mobile',
  
  /** Tablets */
  TABLET = 'tablet',
  
  /** Desktop computers */
  DESKTOP = 'desktop',
  
  /** Unknown device type */
  UNKNOWN = 'unknown'
}

/**
 * Device capability information
 */
export interface DeviceCapabilities {
  /** CPU cores (approximated) */
  cpuCores: number;
  
  /** Available memory in GB (approximated) */
  memory: number;
  
  /** Whether GPU acceleration is available */
  hasGPU: boolean;
  
  /** GPU information if available */
  gpuInfo?: string;
  
  /** Screen specifications */
  screen: {
    /** Width in pixels */
    width: number;
    
    /** Height in pixels */
    height: number;
    
    /** Device pixel ratio */
    pixelRatio: number;
    
    /** Estimated refresh rate */
    refreshRate: number;
  };
  
  /** Detected device tier */
  deviceTier: DeviceTier;
  
  /** Detected device type */
  deviceType: DeviceType;
  
  /** Whether this is a high-DPI display */
  isHighDPI: boolean;
  
  /** Whether battery is being conserved (low power mode) */
  batterySaving: boolean;
  
  /** Whether the device supports WebGL */
  webglSupport: boolean;
  
  /** WebGL version supported (1 or 2) */
  webglVersion: number;
  
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
  
  /** Whether the device is touch capable */
  touchDevice: boolean;
  
  /** Maximum texture size for WebGL */
  maxTextureSize?: number;
  
  /** Browser and OS information */
  userAgent: {
    /** Browser name */
    browser: string;
    
    /** Browser version */
    browserVersion: string;
    
    /** Operating system */
    os: string;
    
    /** Operating system version */
    osVersion: string;
  };
}

/**
 * Estimated device capabilities for server-side rendering
 */
const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  cpuCores: 4,
  memory: 4,
  hasGPU: true,
  screen: {
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    refreshRate: 60
  },
  deviceTier: DeviceTier.MEDIUM,
  deviceType: DeviceType.DESKTOP,
  isHighDPI: false,
  batterySaving: false,
  webglSupport: true,
  webglVersion: 1,
  prefersReducedMotion: false,
  touchDevice: false,
  userAgent: {
    browser: 'Unknown',
    browserVersion: '0',
    os: 'Unknown',
    osVersion: '0'
  }
};

/**
 * Estimates CPU performance using a benchmark
 * @returns Estimated number of operations per second
 */
function estimateCPUPerformance(): number {
  const startTime = performance.now();
  let operations = 0;
  
  // Perform a simple benchmark for a fixed time period
  const endTime = startTime + 5; // 5ms benchmark
  
  while (performance.now() < endTime) {
    // Simple math operations
    Math.sin(operations) * Math.cos(operations);
    operations++;
  }
  
  const duration = performance.now() - startTime;
  
  // Return operations per second
  return Math.floor(operations / duration * 1000);
}

/**
 * Detects browser and OS information
 */
function detectUserAgent(): DeviceCapabilities['userAgent'] {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'Unknown',
      browserVersion: '0',
      os: 'Unknown',
      osVersion: '0'
    };
  }
  
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let browserVersion = '0';
  let os = 'Unknown';
  let osVersion = '0';
  
  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)![1];
  } else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg/') > -1) {
    browser = 'Edge';
    browserVersion = (ua.match(/Edge\/([\d.]+)/) || ua.match(/Edg\/([\d.]+)/))![1];
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)![1];
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)![1];
  }
  
  // Detect OS
  if (ua.indexOf('Windows') > -1) {
    os = 'Windows';
    osVersion = (ua.match(/Windows NT ([\d.]+)/) || ['', ''])[1];
  } else if (ua.indexOf('Mac') > -1) {
    os = 'MacOS';
    osVersion = (ua.match(/Mac OS X ([\d_.]+)/) || ['', ''])[1].replace(/_/g, '.');
  } else if (ua.indexOf('Android') > -1) {
    os = 'Android';
    osVersion = (ua.match(/Android ([\d.]+)/) || ['', ''])[1];
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    os = 'iOS';
    osVersion = (ua.match(/OS ([\d_]+)/) || ['', ''])[1].replace(/_/g, '.');
  } else if (ua.indexOf('Linux') > -1) {
    os = 'Linux';
  }
  
  return { browser, browserVersion, os, osVersion };
}

/**
 * Detects device type based on screen size and user agent
 */
function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined' || !window.navigator) {
    return DeviceType.UNKNOWN;
  }
  
  const ua = navigator.userAgent;
  
  // Check for mobile/tablet specifically mentioned in user agent
  if (/(iPad|iPhone|iPod)/i.test(ua)) {
    return window.innerWidth > 1024 ? DeviceType.TABLET : DeviceType.MOBILE;
  }
  
  if (/Android/i.test(ua)) {
    return window.innerWidth > 1024 ? DeviceType.TABLET : DeviceType.MOBILE;
  }
  
  // Use screen size as a fallback detection method
  if (window.innerWidth <= 768) {
    return DeviceType.MOBILE;
  } else if (window.innerWidth <= 1024) {
    return DeviceType.TABLET;
  }
  
  return DeviceType.DESKTOP;
}

/**
 * Detect if reduced motion is preferred
 */
function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect WebGL support and version
 */
function detectWebGLSupport(): { supported: boolean; version: number; maxTextureSize?: number } {
  if (typeof document === 'undefined') {
    return { supported: false, version: 0 };
  }
  
  try {
    const canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl2') as WebGLRenderingContext;
    
    if (gl) {
      return { 
        supported: true, 
        version: 2,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
      };
    }
    
    gl = canvas.getContext('webgl') as WebGLRenderingContext;
    
    if (gl) {
      return { 
        supported: true, 
        version: 1,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) 
      };
    }
    
    return { supported: false, version: 0 };
  } catch (e) {
    return { supported: false, version: 0 };
  }
}

/**
 * Hook to detect device capabilities
 * @returns Device capability information
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(DEFAULT_CAPABILITIES);
  
  useEffect(() => {
    // Skip detection on server-side
    if (typeof window === 'undefined') {
      return;
    }
    
    // Detect user agent info first
    const userAgent = detectUserAgent();
    
    // Detect WebGL support
    const { supported: webglSupport, version: webglVersion, maxTextureSize } = detectWebGLSupport();
    
    // Estimate CPU cores (navigator.hardwareConcurrency is not available in all browsers)
    const cpuCores = navigator.hardwareConcurrency || 
      // Fallbacks based on device type/OS
      (userAgent.os === 'iOS' ? 2 : 
       userAgent.os === 'Android' ? 4 : 
       userAgent.os === 'Windows' ? 4 : 2);
    
    // Estimate memory (not directly accessible in browsers)
    // Use device tier heuristics as fallback
    let memory = 4; // Default 4GB estimate
    
    // CPU performance benchmark
    const cpuPerformance = estimateCPUPerformance();
    
    // Determine device tier based on capabilities
    let deviceTier: DeviceTier;
    const deviceType = detectDeviceType();
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Screen information
    const { width, height } = window.screen;
    const pixelRatio = window.devicePixelRatio || 1;
    const isHighDPI = pixelRatio >= 2;
    
    // Attempt to detect refresh rate
    let refreshRate = 60; // Default
    
    // Try to get refresh rate from screen object (only works in some browsers)
    if ('currentRefreshRate' in screen) {
      refreshRate = (screen as any).currentRefreshRate || 60;
    }
    
    // Determine tier based on multiple factors
    if (
      cpuCores >= 8 && 
      cpuPerformance > 1000000 && 
      webglVersion >= 2 && 
      deviceType === DeviceType.DESKTOP && 
      !touchDevice
    ) {
      deviceTier = DeviceTier.ULTRA;
      memory = 16;
    } else if (
      cpuCores >= 6 && 
      cpuPerformance > 500000 && 
      webglSupport && 
      (deviceType === DeviceType.DESKTOP || isHighDPI) 
    ) {
      deviceTier = DeviceTier.HIGH;
      memory = 8;
    } else if (
      cpuCores >= 4 && 
      cpuPerformance > 200000 && 
      webglSupport
    ) {
      deviceTier = DeviceTier.MEDIUM;
      memory = 4;
    } else {
      deviceTier = DeviceTier.LOW;
      memory = 2;
    }
    
    // GPU detection (limited in browsers)
    let hasGPU = webglSupport;
    let gpuInfo: string | undefined;
    
    // Try to get GPU info from WebGL context
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {
      // Silently fail
    }
    
    // Check for battery saving mode (approximation)
    // Note: The Battery API is deprecated in some browsers
    let batterySaving = false;
    
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setCapabilities(prev => ({
          ...prev,
          batterySaving: !battery.charging && battery.level < 0.2 // Low battery
        }));
      }).catch(() => {
        // Silently fail
      });
    }
    
    const prefersReducedMotion = detectReducedMotion();
    
    // Set all gathered capabilities
    setCapabilities({
      cpuCores,
      memory,
      hasGPU,
      gpuInfo,
      screen: {
        width,
        height,
        pixelRatio,
        refreshRate
      },
      deviceTier,
      deviceType,
      isHighDPI,
      batterySaving,
      webglSupport,
      webglVersion,
      prefersReducedMotion,
      touchDevice,
      maxTextureSize,
      userAgent
    });
    
    // Listen for changes in reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setCapabilities(prev => ({
        ...prev,
        prefersReducedMotion: e.matches
      }));
    };
    
    try {
      // Modern API
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    } catch (e) {
      // Fallback for older browsers
      try {
        reducedMotionQuery.addListener(handleReducedMotionChange);
      } catch (e2) {
        // Silently fail
      }
    }
    
    // Listen for screen resize to update device type
    const handleResize = () => {
      setCapabilities(prev => ({
        ...prev,
        deviceType: detectDeviceType(),
        screen: {
          ...prev.screen,
          width: window.screen.width,
          height: window.screen.height
        }
      }));
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('resize', handleResize);
      
      try {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      } catch (e) {
        try {
          reducedMotionQuery.removeListener(handleReducedMotionChange);
        } catch (e2) {
          // Silently fail
        }
      }
    };
  }, []);
  
  return capabilities;
}

/**
 * Hook to get the best estimate of the device's refresh rate
 * @returns The detected refresh rate in Hz
 */
export function useRefreshRate(): number {
  const capabilities = useDeviceCapabilities();
  return capabilities.screen.refreshRate;
}

/**
 * Hook to check if the device is in a battery saving mode
 * @returns True if battery saving is active
 */
export function useBatterySavingMode(): boolean {
  const capabilities = useDeviceCapabilities();
  return capabilities.batterySaving;
}

/**
 * Hook to check if the current device is a mobile device
 * @returns True if the device is mobile
 */
export function useIsMobileDevice(): boolean {
  const capabilities = useDeviceCapabilities();
  return capabilities.deviceType === DeviceType.MOBILE;
}

/**
 * Hook to determine if the device supports high-quality animations
 * @returns Whether the device can handle high-quality animations
 */
export function useSupportsHighQualityAnimations(): boolean {
  const capabilities = useDeviceCapabilities();
  
  // Consider both device tier and reduced motion preference
  return (
    (capabilities.deviceTier === DeviceTier.HIGH || capabilities.deviceTier === DeviceTier.ULTRA) &&
    !capabilities.prefersReducedMotion &&
    !capabilities.batterySaving
  );
}

export default useDeviceCapabilities; 