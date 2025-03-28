/**
 * Device Capabilities - Type Definitions
 * 
 * Comprehensive type definitions for device capability detection system
 */

/**
 * Device capability tiers for performance
 */
export enum DeviceCapabilityTier {
  ULTRA = 'ultra', // High-end desktop/laptop with dedicated GPU
  HIGH = 'high', // Modern desktop/laptop with good GPU
  MEDIUM = 'medium', // Average laptop or high-end mobile
  LOW = 'low', // Lower-end mobile devices
  MINIMAL = 'minimal', // Very low-end or older devices
}

/**
 * Specific feature support flags
 */
export enum FeatureSupport {
  SUPPORTED = 'supported',
  PARTIAL = 'partial',
  UNSUPPORTED = 'unsupported',
  UNKNOWN = 'unknown'
}

/**
 * Hardware acceleration feature detection
 */
export interface HardwareAcceleration {
  /** General GPU acceleration availability */
  gpuAccelerated: boolean;
  
  /** WebGL 1.0 support */
  webGLSupport: boolean;
  
  /** WebGL 2.0 support */
  webGL2Support: boolean;
  
  /** WebGPU API support (next gen graphics) */
  webGPUSupport: boolean;
  
  /** CSS transform acceleration */
  transformAccelerated: boolean;
  
  /** Filter effects acceleration */
  filterAccelerated: boolean;
  
  /** Maximum texture size */
  maxTextureSize?: number;
  
  /** GPU vendor information (when available) */
  gpuVendor?: string;
  
  /** GPU model information (when available) */
  gpuModel?: string;
  
  /** Performance score (0-10) */
  performanceScore: number;
}

/**
 * Browser-specific capabilities
 */
export interface BrowserCapabilities {
  /** Basic information */
  name: string;
  engine: string;
  version: string;
  
  /** CSS capabilities */
  backdropFilterSupport: boolean;
  cssGridSupport: boolean;
  flexboxSupport: boolean;
  cssVariablesSupport: boolean;
  
  /** Animation capabilities */
  webAnimationsSupport: boolean;
  requestAnimationFrameSupport: boolean;
  
  /** Rendering capabilities */
  compositingSupport: boolean;
  layerOptimizationSupport: boolean;
  
  /** Performance and security features */
  sharedArrayBufferSupport: boolean;
  webWorkerSupport: boolean;
  webAssemblySupport: boolean;
  
  /** Advanced features support */
  webComponentsSupport: boolean;
  shadowDomSupport: boolean;
  intersectionObserverSupport: boolean;
  resizeObserverSupport: boolean;
  mutationObserverSupport: boolean;
  pointerEventsSupport: boolean;
  
  /** Level of offline caching support */
  offlineCapabilities: FeatureSupport;
}

/**
 * Network connection information
 */
export interface NetworkCapabilities {
  /** Network connection type (4g, 3g, 2g, slow-2g, wifi, ethernet) */
  connectionType: string | null;
  
  /** Effective bandwidth in Mbps (when available) */
  bandwidth?: number;
  
  /** Round trip time in ms (when available) */
  rtt?: number;
  
  /** Whether the user has enabled data-saving mode */
  dataSaverEnabled?: boolean;
  
  /** Whether network connection is metered */
  metered?: boolean;
  
  /** Network status for offline detection */
  online: boolean;
}

/**
 * Input method capabilities
 */
export interface InputCapabilities {
  /** Touch screen availability */
  touchDevice: boolean;
  
  /** Multi-touch support */
  multiTouchSupport: boolean;
  
  /** Stylus/pen support */
  stylusSupport: boolean;
  
  /** Gamepad API support */
  gamepadSupport: boolean;
  
  /** Pointer events support */
  pointerEventsSupport: boolean;
  
  /** Force/pressure touch support */
  forceTouchSupport: boolean;
  
  /** Hover capability (true for mouse, false for most touchscreens) */
  hoverCapability: boolean;
  
  /** Fine pointer precision (mouse vs. touchscreen/touchpad) */
  finePointer: boolean;
}

/**
 * Display capabilities
 */
export interface DisplayCapabilities {
  /** Device pixel ratio */
  devicePixelRatio: number;
  
  /** Color depth in bits */
  colorDepth: number;
  
  /** Color gamut support */
  colorGamut: 'srgb' | 'p3' | 'rec2020' | 'unknown';
  
  /** HDR support */
  hdrSupport: boolean;
  
  /** Current screen width */
  screenWidth: number;
  
  /** Current screen height */
  screenHeight: number;
  
  /** Maximum available screen width */
  availScreenWidth: number;
  
  /** Maximum available screen height */
  availScreenHeight: number;
  
  /** Screen orientation */
  orientation: 'portrait' | 'landscape' | 'unknown';
  
  /** Refresh rate when available (in Hz) */
  refreshRate?: number;
}

/**
 * System resource capabilities
 */
export interface SystemCapabilities {
  /** Memory information */
  memory: {
    /** Whether device has low memory */
    lowMemory: boolean;
    
    /** Estimated memory in GB (when available) */
    estimatedMemory: number | null;
    
    /** Maximum ArrayBuffer size supported */
    maxArrayBufferSize?: number;
  };
  
  /** CPU information */
  processor: {
    /** Number of cores */
    cores: number;
    
    /** Estimated processing power score (1-10) */
    performanceScore: number;
  };
  
  /** Battery status */
  battery: {
    /** Whether battery status can be detected */
    supported: boolean;
    
    /** Battery charge level (0-1) */
    level?: number;
    
    /** Whether device is charging */
    charging?: boolean;
    
    /** Estimated battery time remaining in seconds */
    timeRemaining?: number;
    
    /** Whether device is in power saving mode */
    powerSaveMode: boolean | null;
  };
  
  /** Storage capabilities */
  storage: {
    /** Whether persistent storage is available */
    persistentStorageAvailable: boolean;
    
    /** Quota available for storage (when available) */
    quotaAvailable?: number;
  };
}

/**
 * Accessibility and user preferences
 */
export interface AccessibilityCapabilities {
  /** Prefers reduced motion */
  prefersReducedMotion: boolean;
  
  /** Prefers reduced transparency */
  prefersReducedTransparency: boolean;
  
  /** Prefers contrast */
  prefersContrast: 'no-preference' | 'more' | 'less' | 'custom';
  
  /** Color scheme preference */
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  
  /** Whether screen reader is likely being used */
  likelyUsingScreenReader: boolean;
  
  /** Font size adjustment from user preferences */
  fontSizeAdjustment: number;
}

/**
 * Complete device capability profile
 */
export interface DeviceCapabilityProfile {
  /** Overall capability tier */
  tier: DeviceCapabilityTier;
  
  /** Whether device is considered low-end */
  isLowEndDevice: boolean;
  
  /** Operating system information */
  os: {
    name: string;
    version: string;
    platform: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'unknown';
  };
  
  /** Device form factor */
  formFactor: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'wearable' | 'unknown';
  
  /** Hardware capabilities */
  hardware: HardwareAcceleration;
  
  /** Browser capabilities */
  browser: BrowserCapabilities;
  
  /** Network capabilities */
  network: NetworkCapabilities;
  
  /** Input method capabilities */
  input: InputCapabilities;
  
  /** Display capabilities */
  display: DisplayCapabilities;
  
  /** System resource capabilities */
  system: SystemCapabilities;
  
  /** Accessibility preferences */
  accessibility: AccessibilityCapabilities;
  
  /** Date when profile was generated */
  profileDate: Date;
  
  /** Profile version */
  profileVersion: string;
}