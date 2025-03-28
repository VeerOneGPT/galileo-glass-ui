/**
 * Device Capabilities - System Resources
 * 
 * System resource detection including memory, CPU, battery and storage
 */

import { SystemCapabilities } from './types';

// Default system capabilities for SSR or when detection fails
export const DEFAULT_SYSTEM_CAPABILITIES: SystemCapabilities = {
  memory: {
    lowMemory: false,
    estimatedMemory: null,
    maxArrayBufferSize: undefined
  },
  processor: {
    cores: 4,
    performanceScore: 5 // Medium score by default
  },
  battery: {
    supported: false,
    powerSaveMode: null
  },
  storage: {
    persistentStorageAvailable: false
  }
};

/**
 * Calculate processor performance score based on available metrics
 */
const calculateProcessorScore = (cores: number): number => {
  // Simple estimation - each core adds 1 point up to 8 cores
  const coreScore = Math.min(8, cores);
  
  // Default score is core-based
  let score = coreScore;
  
  // Attempt to estimate speed through a quick benchmark if possible
  if (typeof window !== 'undefined') {
    try {
      // Simple benchmark by measuring how many iterations we can do in a fixed time
      const iterationCount = performQuickBenchmark();
      
      // Normalize benchmark result to 0-5 range and add to score
      const benchmarkScore = Math.min(5, iterationCount / 100000);
      score += benchmarkScore;
    } catch (e) {
      // If benchmark fails, stick with core-based estimation
    }
  }
  
  // Cap at 10
  return Math.min(10, score);
};

/**
 * Perform a quick CPU benchmark to estimate performance
 */
const performQuickBenchmark = (): number => {
  const startTime = performance.now();
  const endTime = startTime + 5; // 5ms benchmark
  
  let iterations = 0;
  
  // Perform a computationally intensive task
  while (performance.now() < endTime) {
    // Simple math operations and array manipulations
    Math.sqrt(Math.random() * 10000);
    iterations++;
  }
  
  return iterations;
};

/**
 * Detect memory capabilities
 */
const detectMemoryCapabilities = async () => {
  if (typeof window === 'undefined') {
    return DEFAULT_SYSTEM_CAPABILITIES.memory;
  }

  let estimatedMemory = null;
  let lowMemory = false;
  let maxArrayBufferSize = undefined;

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
      
      // Set max array buffer size estimate (usually a fraction of heap limit)
      maxArrayBufferSize = memoryInfo.jsHeapSizeLimit / 4;
    }
  }
  
  // Determine maximum array buffer size experimentally if not detected
  if (!maxArrayBufferSize && typeof ArrayBuffer !== 'undefined') {
    maxArrayBufferSize = await determineMaxArrayBufferSize();
  }

  return {
    lowMemory,
    estimatedMemory,
    maxArrayBufferSize
  };
};

/**
 * Determine maximum array buffer size through trial and error
 */
const determineMaxArrayBufferSize = async (): Promise<number | undefined> => {
  // Starting sizes to test (in bytes)
  const testSizes = [
    1 * 1024 * 1024 * 1024, // 1GB
    512 * 1024 * 1024,      // 512MB
    256 * 1024 * 1024,      // 256MB
    128 * 1024 * 1024,      // 128MB
    64 * 1024 * 1024,       // 64MB
    32 * 1024 * 1024,       // 32MB
  ];
  
  // Try allocating each size with a small delay to avoid locking up the browser
  for (const size of testSizes) {
    try {
      // Try to allocate the buffer
      const buffer = new ArrayBuffer(size);
      
      // If successful, try to actually use the buffer to verify it's really available
      const view = new Uint8Array(buffer);
      view[0] = 1;
      view[view.length - 1] = 1;
      
      // If we got here, the allocation worked
      return size;
    } catch (e) {
      // This size failed, try a smaller one
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
  
  // If all sizes failed, return a small safe value
  return 16 * 1024 * 1024; // 16MB
};

/**
 * Detect processor capabilities
 */
const detectProcessorCapabilities = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_SYSTEM_CAPABILITIES.processor;
  }
  
  // Get CPU core count
  const cores = navigator.hardwareConcurrency || DEFAULT_SYSTEM_CAPABILITIES.processor.cores;
  
  // Calculate performance score
  const performanceScore = calculateProcessorScore(cores);
  
  return {
    cores,
    performanceScore
  };
};

/**
 * Detect battery status
 */
const detectBatteryStatus = async () => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_SYSTEM_CAPABILITIES.battery;
  }
  
  // Check if Battery API is supported
  if (!('getBattery' in navigator)) {
    return {
      supported: false,
      powerSaveMode: null
    };
  }
  
  try {
    // Get battery information
    const battery = await (navigator as any).getBattery();
    
    return {
      supported: true,
      level: battery.level,
      charging: battery.charging,
      timeRemaining: battery.charging ? battery.chargingTime : battery.dischargingTime,
      // Assume power save mode if battery level is below 20%
      powerSaveMode: battery.level < 0.2
    };
  } catch (e) {
    return {
      supported: false,
      powerSaveMode: null
    };
  }
};

/**
 * Detect storage capabilities
 */
const detectStorageCapabilities = async () => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_SYSTEM_CAPABILITIES.storage;
  }
  
  let persistentStorageAvailable = false;
  let quotaAvailable = undefined;
  
  // Check for persistent storage
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      persistentStorageAvailable = await navigator.storage.persisted();
      
      // Try to get quota information
      if ('estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        quotaAvailable = estimate.quota;
      }
    } catch (e) {
      // Storage API not fully supported
    }
  }
  
  return {
    persistentStorageAvailable,
    quotaAvailable
  };
};

/**
 * Detect system capabilities
 */
export const detectSystemCapabilities = async (): Promise<SystemCapabilities> => {
  if (typeof window === 'undefined') {
    return DEFAULT_SYSTEM_CAPABILITIES;
  }
  
  // Run all detections in parallel
  const [memory, battery, storage] = await Promise.all([
    detectMemoryCapabilities(),
    detectBatteryStatus(),
    detectStorageCapabilities()
  ]);
  
  // Processor detection is synchronous
  const processor = detectProcessorCapabilities();
  
  return {
    memory,
    processor,
    battery,
    storage
  };
};

/**
 * Get system capabilities synchronously (with less accuracy)
 */
export const getSystemCapabilitiesSync = (): SystemCapabilities => {
  if (typeof window === 'undefined') {
    return DEFAULT_SYSTEM_CAPABILITIES;
  }
  
  // Memory detection (simplified)
  let memory = { 
    lowMemory: false, 
    estimatedMemory: null
  };
  
  if ('deviceMemory' in navigator) {
    memory = {
      lowMemory: (navigator as any).deviceMemory < 4,
      estimatedMemory: (navigator as any).deviceMemory
    };
  }
  
  // Processor detection
  const cores = navigator.hardwareConcurrency || DEFAULT_SYSTEM_CAPABILITIES.processor.cores;
  const processor = {
    cores,
    performanceScore: Math.min(10, (cores / 2) + 1) // Simplified score calculation
  };
  
  // Battery detection not available synchronously
  const battery = { 
    supported: 'getBattery' in navigator,
    powerSaveMode: null
  };
  
  // Storage detection not available synchronously
  const storage = {
    persistentStorageAvailable: false
  };
  
  return {
    memory,
    processor,
    battery,
    storage
  };
};