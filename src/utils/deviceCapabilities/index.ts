/**
 * Device Capabilities - Main Integration Module
 * 
 * Comprehensive device capability detection system for optimal user experience
 */

import { 
  DeviceCapabilityProfile, 
  DeviceCapabilityTier,
  AccessibilityCapabilities,
  BrowserCapabilities,
  DisplayCapabilities,
  HardwareAcceleration,
  InputCapabilities,
  NetworkCapabilities,
  SystemCapabilities,
  FeatureSupport
} from './types';

import { 
  detectHardwareCapabilities, 
  DEFAULT_HARDWARE_CAPABILITIES,
  getAccelerationDetailsForFeature
} from './hardware';

import { 
  detectBrowserCapabilities, 
  DEFAULT_BROWSER_CAPABILITIES,
  getBrowserFeatureDetails
} from './browser';

import { 
  detectSystemCapabilities, 
  DEFAULT_SYSTEM_CAPABILITIES,
  getSystemCapabilitiesSync
} from './system';

import { 
  detectDisplayCapabilities, 
  DEFAULT_DISPLAY_CAPABILITIES,
  getDisplayCapabilitiesSync
} from './display';

import { 
  detectInputCapabilities, 
  DEFAULT_INPUT_CAPABILITIES 
} from './input';

import { 
  detectNetworkCapabilities, 
  DEFAULT_NETWORK_CAPABILITIES,
  setupNetworkMonitoring,
  getNetworkRecommendations
} from './network';

import { 
  detectAccessibilityCapabilities, 
  DEFAULT_ACCESSIBILITY_CAPABILITIES,
  setupAccessibilityMonitoring,
  getAccessibilityRecommendations
} from './accessibility';

// Re-export everything for convenience
export * from './types';
export * from './hardware';
export * from './browser';
export * from './system';
export * from './display';
export * from './input';
export * from './network';
export * from './accessibility';

// Cache for device capabilities to avoid recomputing
let cachedCapabilityProfile: DeviceCapabilityProfile | null = null;
let cachedCapabilityTier: DeviceCapabilityTier | null = null;

/**
 * Default capability profile for SSR or when detection fails
 */
const DEFAULT_CAPABILITY_PROFILE: DeviceCapabilityProfile = {
  tier: DeviceCapabilityTier.MEDIUM,
  isLowEndDevice: false,
  os: {
    name: 'unknown',
    version: 'unknown',
    platform: 'desktop'
  },
  formFactor: 'desktop',
  hardware: DEFAULT_HARDWARE_CAPABILITIES,
  browser: DEFAULT_BROWSER_CAPABILITIES,
  network: DEFAULT_NETWORK_CAPABILITIES,
  input: DEFAULT_INPUT_CAPABILITIES,
  display: DEFAULT_DISPLAY_CAPABILITIES,
  system: DEFAULT_SYSTEM_CAPABILITIES,
  accessibility: DEFAULT_ACCESSIBILITY_CAPABILITIES,
  profileDate: new Date(),
  profileVersion: '1.0.0'
};

/**
 * Detect basic device type and OS information
 */
const detectOsAndFormFactor = () => {
  if (typeof navigator === 'undefined') {
    return {
      os: DEFAULT_CAPABILITY_PROFILE.os,
      formFactor: DEFAULT_CAPABILITY_PROFILE.formFactor
    };
  }
  
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  let osName = 'unknown';
  let osVersion = 'unknown';
  let osPlatform: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'unknown' = 'unknown';
  let formFactor: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'wearable' | 'unknown' = 'unknown';
  
  // Detect OS
  if (ua.includes('Win')) {
    osName = 'Windows';
    osPlatform = 'desktop';
    
    const matches = ua.match(/Windows NT (\d+\.\d+)/);
    if (matches) {
      const ntVersion = matches[1];
      
      // Map NT version to Windows version
      switch (ntVersion) {
        case '10.0': osVersion = '10/11'; break;
        case '6.3': osVersion = '8.1'; break;
        case '6.2': osVersion = '8'; break;
        case '6.1': osVersion = '7'; break;
        case '6.0': osVersion = 'Vista'; break;
        case '5.2': 
        case '5.1': 
          osVersion = 'XP'; 
          break;
        default: osVersion = ntVersion;
      }
    }
  } else if (ua.includes('Mac OS')) {
    osName = 'macOS';
    osPlatform = 'desktop';
    
    const matches = ua.match(/Mac OS X (\d+[._]\d+[._\d]*)/);
    if (matches) {
      osVersion = matches[1].replace(/_/g, '.');
    }
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    osName = 'iOS';
    osPlatform = 'mobile';
    
    const matches = ua.match(/OS (\d+[._]\d+[._\d]*)/);
    if (matches) {
      osVersion = matches[1].replace(/_/g, '.');
    }
  } else if (ua.includes('Android')) {
    osName = 'Android';
    osPlatform = 'mobile';
    
    const matches = ua.match(/Android (\d+(\.\d+)+)/);
    if (matches) {
      osVersion = matches[1];
    }
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
    osPlatform = 'desktop';
  } else if (ua.includes('CrOS')) {
    osName = 'ChromeOS';
    osPlatform = 'desktop';
  }
  
  // Detect form factor
  if (ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('iPod')) {
    formFactor = 'mobile';
  } else if (ua.includes('iPad') || ua.includes('Tablet')) {
    formFactor = 'tablet';
  } else if (ua.includes('TV') || ua.includes('SmartTV') || 
             platform === 'WebTV' || ua.includes('Android TV')) {
    formFactor = 'tv';
    osPlatform = 'tv';
  } else if (ua.includes('Watch')) {
    formFactor = 'wearable';
  } else if (osPlatform === 'desktop') {
    formFactor = 'desktop';
  }
  
  // Additional check for tablets by screen size
  if (formFactor === 'unknown' && typeof window !== 'undefined') {
    // Tablets typically have larger screens
    const isLargeScreen = window.innerWidth >= 600 && window.innerHeight >= 600;
    
    if (isLargeScreen && osPlatform === 'mobile') {
      formFactor = 'tablet';
    } else if (isLargeScreen) {
      formFactor = 'desktop';
    }
  }
  
  return {
    os: {
      name: osName,
      version: osVersion,
      platform: osPlatform
    },
    formFactor
  };
};

/**
 * Calculate the capability tier based on all detected features
 */
const calculateCapabilityTier = (profile: DeviceCapabilityProfile): DeviceCapabilityTier => {
  // Start with a score-based approach
  let score = 0;
  
  // Hardware capabilities (maximum 10 points)
  score += profile.hardware.performanceScore * 0.4; // 0-4 points for hardware
  
  // System capabilities (maximum 3 points)
  score += profile.system.processor.performanceScore * 0.3; // 0-3 points for processor
  
  // Memory constraints (-2 points if low memory)
  if (profile.system.memory.lowMemory) {
    score -= 2;
  }
  
  // Display quality (maximum 2 points)
  const displayScore = profile.display.devicePixelRatio >= 2 ? 1 : 0;
  score += displayScore;
  
  if (profile.display.colorGamut === 'rec2020' || profile.display.colorGamut === 'p3') {
    score += 1;
  }
  
  // Input precision (for proper UI interaction, maximum 1 point)
  if (profile.input.finePointer) {
    score += 1;
  }
  
  // Map score to tier (0-10 range)
  if (score < 2) {
    return DeviceCapabilityTier.MINIMAL;
  } else if (score < 4) {
    return DeviceCapabilityTier.LOW;
  } else if (score < 6) {
    return DeviceCapabilityTier.MEDIUM;
  } else if (score < 8) {
    return DeviceCapabilityTier.HIGH;
  } else {
    return DeviceCapabilityTier.ULTRA;
  }
};

/**
 * Check if a device is considered low-end
 */
const isLowEndDevice = (profile: DeviceCapabilityProfile): boolean => {
  // Several indicators could qualify a device as low-end
  
  // Clear low-end indicators
  if (profile.system.memory.lowMemory) {
    return true;
  }
  
  if (profile.hardware.performanceScore < 4) {
    return true;
  }
  
  if (profile.system.processor.cores < 4) {
    return true;
  }
  
  // If device struggles with basic GPU features
  if (!profile.hardware.webGLSupport) {
    return true;
  }
  
  // Network considerations
  if (profile.network.connectionType === 'slow-2g' || profile.network.connectionType === '2g') {
    return true;
  }
  
  // If the device has data-saving enabled, treat it carefully
  if (profile.network.dataSaverEnabled) {
    return true;
  }
  
  return false;
};

/**
 * Get complete device capabilities
 */
export const getDeviceCapabilities = async (): Promise<DeviceCapabilityProfile> => {
  if (typeof window === 'undefined') {
    return DEFAULT_CAPABILITY_PROFILE;
  }
  
  // Return cached profile if available
  if (cachedCapabilityProfile) {
    return cachedCapabilityProfile;
  }
  
  // Run all detection functions in parallel
  const [
    hardware,
    browser,
    system,
    display,
    network,
    accessibility
  ] = await Promise.all([
    Promise.resolve(detectHardwareCapabilities()),
    Promise.resolve(detectBrowserCapabilities()),
    detectSystemCapabilities(),
    detectDisplayCapabilities(),
    Promise.resolve(detectNetworkCapabilities()),
    Promise.resolve(detectAccessibilityCapabilities())
  ]);
  
  // Input detection is synchronous
  const input = detectInputCapabilities();
  
  // Get OS and form factor information
  const { os, formFactor } = detectOsAndFormFactor();
  
  // Create the full profile
  const profile: DeviceCapabilityProfile = {
    hardware,
    browser,
    system,
    display,
    input,
    network,
    accessibility,
    os,
    formFactor,
    isLowEndDevice: false, // Will be calculated
    tier: DeviceCapabilityTier.MEDIUM, // Will be calculated
    profileDate: new Date(),
    profileVersion: '1.0.0'
  };
  
  // Calculate derived properties
  profile.isLowEndDevice = isLowEndDevice(profile);
  profile.tier = calculateCapabilityTier(profile);
  
  // Cache the profile
  cachedCapabilityProfile = profile;
  cachedCapabilityTier = profile.tier;
  
  return profile;
};

/**
 * Get device capability tier synchronously (with less accuracy)
 */
export const getDeviceCapabilityTier = (): DeviceCapabilityTier => {
  if (typeof window === 'undefined') {
    return DeviceCapabilityTier.MEDIUM;
  }
  
  // Return cached tier if available
  if (cachedCapabilityTier) {
    return cachedCapabilityTier;
  }
  
  // Build a simplified profile with synchronous-only methods
  const hardware = detectHardwareCapabilities();
  const browser = detectBrowserCapabilities();
  const system = getSystemCapabilitiesSync();
  const display = getDisplayCapabilitiesSync();
  const input = detectInputCapabilities();
  const network = detectNetworkCapabilities();
  const accessibility = detectAccessibilityCapabilities();
  const { os, formFactor } = detectOsAndFormFactor();
  
  const profile: DeviceCapabilityProfile = {
    hardware,
    browser,
    system,
    display: { ...display, refreshRate: 60 } as DisplayCapabilities,
    input,
    network,
    accessibility,
    os,
    formFactor,
    isLowEndDevice: false, // Will be calculated
    tier: DeviceCapabilityTier.MEDIUM, // Will be calculated
    profileDate: new Date(),
    profileVersion: '1.0.0'
  };
  
  // Calculate derived properties
  profile.isLowEndDevice = isLowEndDevice(profile);
  profile.tier = calculateCapabilityTier(profile);
  
  // Cache the tier
  cachedCapabilityTier = profile.tier;
  
  return profile.tier;
};

/**
 * Clear cached device capabilities to force a fresh detection
 */
export const clearDeviceCapabilitiesCache = (): void => {
  cachedCapabilityProfile = null;
  cachedCapabilityTier = null;
};

/**
 * Get feature support recommendation based on device capabilities
 */
export const getFeatureSupportRecommendation = (
  feature: string,
  capabilities?: DeviceCapabilityProfile
): {
  supported: boolean;
  tier: DeviceCapabilityTier;
  recommendation: 'enable' | 'disable' | 'adapt';
  fallback?: string;
} => {
  // Default recommendation
  const defaultResult = {
    supported: true,
    tier: DeviceCapabilityTier.MEDIUM,
    recommendation: 'enable' as const
  };
  
  // If no capabilities provided, use the cached tier or get synchronously
  const tier = capabilities?.tier || cachedCapabilityTier || getDeviceCapabilityTier();
  
  // Map features to capabilities and provide recommendations
  switch (feature) {
    case 'advancedAnimations':
      return {
        supported: tier >= DeviceCapabilityTier.MEDIUM,
        tier,
        recommendation: tier >= DeviceCapabilityTier.MEDIUM ? 'enable' : 'adapt',
        fallback: 'Use simpler animations or static transitions'
      };
      
    case 'glassEffects':
      return {
        supported: tier >= DeviceCapabilityTier.MEDIUM,
        tier,
        recommendation: tier >= DeviceCapabilityTier.MEDIUM ? 'enable' : 'disable',
        fallback: 'Use solid backgrounds with subtle shadows'
      };
      
    case 'particleEffects':
      return {
        supported: tier >= DeviceCapabilityTier.HIGH,
        tier,
        recommendation: tier >= DeviceCapabilityTier.HIGH ? 'enable' : 'disable',
        fallback: 'Use static graphics or very limited particles'
      };
      
    case '3dTransforms':
      return {
        supported: tier >= DeviceCapabilityTier.MEDIUM,
        tier,
        recommendation: tier >= DeviceCapabilityTier.MEDIUM ? 'enable' : 'adapt',
        fallback: 'Use 2D transforms or static elements'
      };
      
    case 'videoBackgrounds':
      return {
        supported: tier >= DeviceCapabilityTier.HIGH,
        tier,
        recommendation: tier >= DeviceCapabilityTier.HIGH ? 'enable' : 'disable',
        fallback: 'Use static images or subtle gradients'
      };
      
    case 'parallaxEffects':
      return {
        supported: tier >= DeviceCapabilityTier.MEDIUM,
        tier,
        recommendation: tier >= DeviceCapabilityTier.MEDIUM ? 'enable' : 'disable',
        fallback: 'Use static backgrounds with depth created by shadows'
      };
      
    case 'backdropFilters':
      return {
        supported: tier >= DeviceCapabilityTier.MEDIUM,
        tier,
        recommendation: tier >= DeviceCapabilityTier.MEDIUM ? 'enable' : 'disable',
        fallback: 'Use solid backgrounds with opacity'
      };
      
    default:
      return defaultResult;
  }
};

/**
 * Set up device capability monitoring for changes
 */
export const setupDeviceCapabilityMonitoring = (
  callback: (capabilities: Partial<DeviceCapabilityProfile>) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => { /* No-op for SSR */ }; // No-op for SSR
  }
  
  // Track which parts of the profile have changed
  const changedParts: Partial<DeviceCapabilityProfile> = {};
  
  // Set up network monitoring
  const networkCleanup = setupNetworkMonitoring(network => {
    changedParts.network = network;
    callback({ network });
  });
  
  // Set up accessibility monitoring
  const accessibilityCleanup = setupAccessibilityMonitoring(accessibility => {
    changedParts.accessibility = accessibility;
    callback({ accessibility });
  });
  
  // Monitor orientation changes for display capabilities
  const orientationHandler = async () => {
    const display = await detectDisplayCapabilities();
    changedParts.display = display;
    callback({ display });
  };
  
  window.addEventListener('orientationchange', orientationHandler);
  window.addEventListener('resize', () => {
    // Debounce resize events to avoid excessive updates
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(orientationHandler, 250);
  });
  
  let resizeTimeout: any = null;
  
  // Return cleanup function
  return () => {
    networkCleanup();
    accessibilityCleanup();
    window.removeEventListener('orientationchange', orientationHandler);
    window.removeEventListener('resize', orientationHandler);
    
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  };
};