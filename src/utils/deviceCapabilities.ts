/**
 * Device Capabilities Detector
 * 
 * Utility for detecting device capabilities to optimize performance
 */

/**
 * Device capability tiers for performance
 */
export enum DeviceCapabilityTier {
  ULTRA = 'ultra',   // High-end desktop/laptop with dedicated GPU
  HIGH = 'high',     // Modern desktop/laptop with good GPU
  MEDIUM = 'medium', // Average laptop or high-end mobile
  LOW = 'low',       // Lower-end mobile devices
  MINIMAL = 'minimal' // Very low-end or older devices
}

/**
 * Hardware acceleration feature detection
 */
export interface HardwareAcceleration {
  gpuAccelerated: boolean;
  webGLSupport: boolean;
  webGPUSupport: boolean;
  transformAccelerated: boolean;
  filterAccelerated: boolean;
}

/**
 * Browser-specific capabilities
 */
export interface BrowserCapabilities {
  backdropFilterSupport: boolean;
  webAnimationsSupport: boolean;
  compositingSupport: boolean;
  cssVariablesSupport: boolean;
}

/**
 * Complete device capability profile
 */
export interface DeviceCapabilityProfile {
  tier: DeviceCapabilityTier;
  memory: {
    lowMemory: boolean;
    estimatedMemory: number | null;
  };
  hardware: HardwareAcceleration;
  browser: BrowserCapabilities;
  processorCores: number;
  isLowEndDevice: boolean;
  devicePixelRatio: number;
  touchDevice: boolean;
  connectionType: string | null;
  batteryOptimization: boolean | null;
}

/**
 * Default fallback values when detection fails
 */
const DEFAULT_PROFILE: DeviceCapabilityProfile = {
  tier: DeviceCapabilityTier.MEDIUM,
  memory: {
    lowMemory: false,
    estimatedMemory: null
  },
  hardware: {
    gpuAccelerated: true,
    webGLSupport: true,
    webGPUSupport: false,
    transformAccelerated: true,
    filterAccelerated: true
  },
  browser: {
    backdropFilterSupport: true,
    webAnimationsSupport: true,
    compositingSupport: true,
    cssVariablesSupport: true
  },
  processorCores: 4,
  isLowEndDevice: false,
  devicePixelRatio: 1,
  touchDevice: false,
  connectionType: null,
  batteryOptimization: null
};

/**
 * Detect if device is likely a low-end device
 */
const detectLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Use device memory API if available
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory < 4;
  }
  
  // Fallback to hardware concurrency
  if ('hardwareConcurrency' in navigator) {
    return navigator.hardwareConcurrency < 4;
  }
  
  // Use device pixel ratio as another hint
  if (window.devicePixelRatio < 1.5) {
    return true;
  }
  
  return false;
};

/**
 * Detect hardware acceleration capabilities
 */
const detectHardwareAcceleration = (): HardwareAcceleration => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE.hardware;
  }
  
  // Check for WebGL support
  let webGLSupport = false;
  try {
    const canvas = document.createElement('canvas');
    webGLSupport = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    webGLSupport = false;
  }
  
  // Check for WebGPU support
  const webGPUSupport = 'gpu' in navigator;
  
  // Check for accelerated transform support
  // A decent proxy is to check if requestAnimationFrame exists
  const transformAccelerated = typeof requestAnimationFrame === 'function';
  
  // Filter acceleration is harder to detect precisely
  // So we use a proxy: is backdrop-filter supported?
  let filterAccelerated = false;
  if (typeof document !== 'undefined') {
    const testEl = document.createElement('div');
    // Safari uses -webkit-backdrop-filter
    filterAccelerated = 'backdropFilter' in testEl.style || 
                        'webkitBackdropFilter' in testEl.style;
  }
  
  return {
    gpuAccelerated: webGLSupport || transformAccelerated,
    webGLSupport,
    webGPUSupport,
    transformAccelerated,
    filterAccelerated
  };
};

/**
 * Detect browser-specific capabilities
 */
const detectBrowserCapabilities = (): BrowserCapabilities => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE.browser;
  }
  
  // Detect backdrop-filter support
  let backdropFilterSupport = false;
  try {
    const testEl = document.createElement('div');
    backdropFilterSupport = 'backdropFilter' in testEl.style || 
                           'webkitBackdropFilter' in testEl.style;
  } catch (e) {
    backdropFilterSupport = false;
  }
  
  // Detect Web Animations API support
  const webAnimationsSupport = typeof Element !== 'undefined' && 
    'animate' in Element.prototype;
  
  // Detect CSS Variables support
  let cssVariablesSupport = false;
  try {
    cssVariablesSupport = typeof CSS !== 'undefined' && CSS.supports('(--a: 0)');
  } catch (e) {
    cssVariablesSupport = false;
  }
  
  // Detect compositing support via will-change
  let compositingSupport = false;
  try {
    const testEl = document.createElement('div');
    compositingSupport = 'willChange' in testEl.style;
  } catch (e) {
    compositingSupport = false;
  }
  
  return {
    backdropFilterSupport,
    webAnimationsSupport,
    compositingSupport,
    cssVariablesSupport
  };
};

/**
 * Determine memory availability
 */
const detectMemory = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE.memory;
  }
  
  let estimatedMemory = null;
  let lowMemory = false;
  
  // Device Memory API
  if ('deviceMemory' in navigator) {
    estimatedMemory = (navigator as any).deviceMemory;
    lowMemory = estimatedMemory < 4;
  }
  
  // Memory info in Chrome
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo && memoryInfo.jsHeapSizeLimit) {
      // Convert to GB for easier comparison
      const heapLimit = memoryInfo.jsHeapSizeLimit / (1024 * 1024 * 1024);
      if (!estimatedMemory) {
        estimatedMemory = heapLimit;
      }
      // If heap limit is less than 1GB, consider it low memory
      lowMemory = lowMemory || heapLimit < 1;
    }
  }
  
  return {
    lowMemory,
    estimatedMemory
  };
};

/**
 * Detect network connection type
 */
const detectConnectionType = (): string | null => {
  if (typeof navigator === 'undefined') return null;
  
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn && conn.effectiveType) {
      return conn.effectiveType;
    }
  }
  
  return null;
};

/**
 * Detect if device is in a battery saving mode
 */
const detectBatteryOptimization = async (): Promise<boolean | null> => {
  if (typeof navigator === 'undefined') return null;
  
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return battery.level < 0.2; // Simplified check: likely saving battery when under 20%
    } catch (e) {
      return null;
    }
  }
  
  return null;
};

/**
 * Calculate overall capability tier based on all factors
 */
const calculateCapabilityTier = (profile: Partial<DeviceCapabilityProfile>): DeviceCapabilityTier => {
  // Low-end device is automatically MINIMAL or LOW
  if (profile.isLowEndDevice) {
    return profile.memory?.lowMemory ? DeviceCapabilityTier.MINIMAL : DeviceCapabilityTier.LOW;
  }
  
  // No GPU acceleration means at most MEDIUM
  if (profile.hardware && !profile.hardware.gpuAccelerated) {
    return DeviceCapabilityTier.MEDIUM;
  }
  
  // Limited processor = LOW
  if (profile.processorCores && profile.processorCores < 4) {
    return DeviceCapabilityTier.LOW;
  }
  
  // Check for high-end features
  if (
    profile.hardware?.webGLSupport &&
    profile.hardware?.filterAccelerated &&
    profile.browser?.compositingSupport &&
    profile.processorCores && profile.processorCores >= 8
  ) {
    // WebGPU support suggests a very modern device
    if (profile.hardware?.webGPUSupport) {
      return DeviceCapabilityTier.ULTRA;
    }
    return DeviceCapabilityTier.HIGH;
  }
  
  // Default to MEDIUM
  return DeviceCapabilityTier.MEDIUM;
};

/**
 * Get device capabilities
 */
export const getDeviceCapabilities = async (): Promise<DeviceCapabilityProfile> => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }
  
  const hardware = detectHardwareAcceleration();
  const browser = detectBrowserCapabilities();
  const memory = detectMemory();
  const isLowEndDevice = detectLowEndDevice();
  const processorCores = navigator.hardwareConcurrency || DEFAULT_PROFILE.processorCores;
  const connectionType = detectConnectionType();
  const devicePixelRatio = window.devicePixelRatio || DEFAULT_PROFILE.devicePixelRatio;
  const touchDevice = 'ontouchstart' in window;
  
  // Battery status requires async check
  const batteryOptimization = await detectBatteryOptimization();
  
  const partialProfile: Partial<DeviceCapabilityProfile> = {
    hardware,
    browser,
    memory,
    isLowEndDevice,
    processorCores,
    connectionType,
    devicePixelRatio,
    touchDevice,
    batteryOptimization
  };
  
  // Calculate the overall capability tier
  const tier = calculateCapabilityTier(partialProfile);
  
  return {
    ...DEFAULT_PROFILE,
    ...partialProfile,
    tier
  };
};

/**
 * Get device capability tier synchronously (with less accuracy)
 */
export const getDeviceCapabilityTier = (): DeviceCapabilityTier => {
  if (typeof window === 'undefined') {
    return DeviceCapabilityTier.MEDIUM;
  }
  
  const isLowEndDevice = detectLowEndDevice();
  if (isLowEndDevice) {
    return DeviceCapabilityTier.LOW;
  }
  
  const hardware = detectHardwareAcceleration();
  if (!hardware.gpuAccelerated) {
    return DeviceCapabilityTier.LOW;
  }
  
  const processorCores = navigator.hardwareConcurrency || 4;
  
  if (
    hardware.webGLSupport &&
    hardware.transformAccelerated &&
    processorCores >= 8 &&
    window.devicePixelRatio >= 2
  ) {
    return hardware.webGPUSupport ? 
      DeviceCapabilityTier.ULTRA : 
      DeviceCapabilityTier.HIGH;
  }
  
  return DeviceCapabilityTier.MEDIUM;
};