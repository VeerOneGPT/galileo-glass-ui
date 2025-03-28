/**
 * Device Capabilities - Network Detection
 * 
 * Network connection type and quality detection
 */

import { NetworkCapabilities } from './types';

// Default network capabilities for SSR or when detection fails
export const DEFAULT_NETWORK_CAPABILITIES: NetworkCapabilities = {
  connectionType: null,
  online: true
};

/**
 * Detect connection type and quality
 */
export const detectNetworkCapabilities = (): NetworkCapabilities => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_NETWORK_CAPABILITIES;
  }
  
  // Start with defaults
  let connectionType: string | null = null;
  let bandwidth: number | undefined = undefined;
  let rtt: number | undefined = undefined;
  let dataSaverEnabled: boolean | undefined = undefined;
  let metered: boolean | undefined = undefined;
  
  // Check online status
  const online = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  
  // Use Network Information API if available
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    
    if (conn) {
      connectionType = conn.effectiveType || conn.type || null;
      
      // Get additional metrics if available
      if ('downlink' in conn) {
        bandwidth = conn.downlink; // Mbps
      }
      
      if ('rtt' in conn) {
        rtt = conn.rtt; // ms
      }
      
      if ('saveData' in conn) {
        dataSaverEnabled = conn.saveData; // boolean
      }
      
      if ('metered' in conn) {
        metered = conn.metered; // boolean
      }
    }
  }
  
  // If we still don't have a connection type, try to infer from user agent
  if (!connectionType) {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('android') || ua.includes('mobile') || ua.includes('iphone') || ua.includes('ipad')) {
      // Mobile device, but we don't know the connection type
      connectionType = 'unknown-mobile';
    } else {
      // Assume desktop connection
      connectionType = 'unknown-desktop';
    }
  }
  
  return {
    connectionType,
    bandwidth,
    rtt,
    dataSaverEnabled,
    metered,
    online
  };
};

/**
 * Set up network capability monitoring
 */
export const setupNetworkMonitoring = (
  callback: (capabilities: NetworkCapabilities) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  // Initial detection
  const initialCapabilities = detectNetworkCapabilities();
  callback(initialCapabilities);
  
  // Set up event listeners for online/offline status
  const handleOnlineStatusChange = () => {
    const updatedCapabilities = detectNetworkCapabilities();
    callback(updatedCapabilities);
  };
  
  window.addEventListener('online', handleOnlineStatusChange);
  window.addEventListener('offline', handleOnlineStatusChange);
  
  // Set up connection change listener if available
  let connectionChangeListener: (() => void) | null = null;
  
  if ('connection' in navigator && 'addEventListener' in (navigator as any).connection) {
    connectionChangeListener = () => {
      const updatedCapabilities = detectNetworkCapabilities();
      callback(updatedCapabilities);
    };
    
    (navigator as any).connection.addEventListener('change', connectionChangeListener);
  }
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnlineStatusChange);
    window.removeEventListener('offline', handleOnlineStatusChange);
    
    if (connectionChangeListener && 'connection' in navigator && 
        'removeEventListener' in (navigator as any).connection) {
      (navigator as any).connection.removeEventListener('change', connectionChangeListener);
    }
  };
};

/**
 * Get network condition recommendations
 */
export const getNetworkRecommendations = (
  capabilities: NetworkCapabilities
): {
  loadLargeAssets: boolean;
  prefetchAssets: boolean;
  useCompressedAssets: boolean;
  offlineSupport: boolean;
  recommendations: string[];
} => {
  // Default recommendations
  const result = {
    loadLargeAssets: true,
    prefetchAssets: true,
    useCompressedAssets: false,
    offlineSupport: false,
    recommendations: [] as string[]
  };
  
  // If we're offline, optimize for offline use
  if (!capabilities.online) {
    result.loadLargeAssets = false;
    result.prefetchAssets = false;
    result.offlineSupport = true;
    result.recommendations.push('Device is offline. Load essential content only.');
    result.recommendations.push('Enable offline mode if available.');
    return result;
  }
  
  // Analyze connection type
  if (capabilities.connectionType) {
    const connType = capabilities.connectionType;
    
    if (connType === 'slow-2g' || connType === '2g') {
      // Very slow connection
      result.loadLargeAssets = false;
      result.prefetchAssets = false;
      result.useCompressedAssets = true;
      result.offlineSupport = true;
      result.recommendations.push('Very slow connection detected. Minimize data usage.');
      result.recommendations.push('Load text and critical content only.');
    } else if (connType === '3g') {
      // Moderate connection
      result.loadLargeAssets = false;
      result.prefetchAssets = false;
      result.useCompressedAssets = true;
      result.recommendations.push('Moderate connection detected. Optimize image loading.');
      result.recommendations.push('Use compressed assets where possible.');
    } else if (connType === '4g' || connType.includes('wifi') || connType.includes('ethernet')) {
      // Fast connection
      result.loadLargeAssets = true;
      result.prefetchAssets = true;
      result.useCompressedAssets = false;
      result.recommendations.push('Fast connection detected. Standard loading strategy is appropriate.');
    }
  }
  
  // Check for metered connections or data saver
  if (capabilities.metered || capabilities.dataSaverEnabled) {
    result.loadLargeAssets = false;
    result.prefetchAssets = false;
    result.useCompressedAssets = true;
    result.recommendations.push('Data saving mode or metered connection detected. Minimize data usage.');
  }
  
  // Check for high latency
  if (capabilities.rtt && capabilities.rtt > 500) {
    result.recommendations.push('High latency detected. Minimize API calls and server round-trips.');
  }
  
  return result;
};