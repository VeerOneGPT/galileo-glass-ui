/**
 * Device Capabilities - Hardware Detection
 * 
 * Hardware acceleration and GPU capabilities detection
 */

import { HardwareAcceleration } from './types';

// Default hardware capabilities for SSR or when detection fails
export const DEFAULT_HARDWARE_CAPABILITIES: HardwareAcceleration = {
  gpuAccelerated: true,
  webGLSupport: true,
  webGL2Support: false,
  webGPUSupport: false,
  transformAccelerated: true,
  filterAccelerated: true,
  performanceScore: 5 // Medium score by default
};

/**
 * Extract GPU information from WebGL context
 */
const extractGPUInfo = (gl: WebGLRenderingContext) => {
  // Get WebGL debug info
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  
  let vendor = 'unknown';
  let renderer = 'unknown';
  
  if (debugInfo) {
    vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
  }
  
  return {
    vendor,
    renderer,
    extensions: gl.getSupportedExtensions() || []
  };
};

/**
 * Calculate GPU performance score based on detection results
 */
const calculateGPUScore = (
  webgl: boolean, 
  webgl2: boolean, 
  webgpu: boolean,
  extensions: string[],
  renderer: string
): number => {
  let score = 0;
  
  // Basic capabilities
  if (webgl) score += 2;
  if (webgl2) score += 2;
  if (webgpu) score += 4;
  
  // Extensions as a proxy for GPU capabilities
  if (extensions.length > 20) score += 1;
  if (extensions.length > 30) score += 1;
  
  // Look for high-performance keywords in renderer name
  const highPerformanceGPUs = [
    'nvidia', 'geforce', 'rtx', 'gtx', 'quadro',
    'amd', 'radeon', 'firepro', 'rx', 'vega',
    'intel', 'iris', 'arc', 'xe',
    'apple', 'm1', 'm2', 'm3'
  ];
  
  const rendererLower = renderer.toLowerCase();
  
  for (const keyword of highPerformanceGPUs) {
    if (rendererLower.includes(keyword)) {
      score += 1;
      break;
    }
  }
  
  // Cap at 10
  return Math.min(10, score);
};

/**
 * Detect hardware acceleration capabilities
 */
export const detectHardwareCapabilities = (): HardwareAcceleration => {
  if (typeof window === 'undefined') {
    return DEFAULT_HARDWARE_CAPABILITIES;
  }

  // WebGL support and details
  let webGLSupport = false;
  let webGL2Support = false;
  let webGPUSupport = false;
  let maxTextureSize = 0;
  let gpuInfo = { vendor: 'unknown', renderer: 'unknown', extensions: [] as string[] };
  
  try {
    const canvas = document.createElement('canvas');
    
    // Check WebGL1
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (gl) {
      webGLSupport = true;
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      gpuInfo = extractGPUInfo(gl);
    }
    
    // Check WebGL2
    const gl2 = canvas.getContext('webgl2') as WebGLRenderingContext;
    if (gl2) {
      webGL2Support = true;
      // If we got GL2 context, use it for better info
      maxTextureSize = gl2.getParameter(gl2.MAX_TEXTURE_SIZE);
      gpuInfo = extractGPUInfo(gl2);
    }
  } catch (e) {
    // Failed to check WebGL, this could be a security restriction
    webGLSupport = false;
    webGL2Support = false;
  }
  
  // Check WebGPU
  webGPUSupport = 'gpu' in navigator;
  
  // Check for transform acceleration 
  // We use a combination of tests to be more certain
  const transformAccelerated = typeof requestAnimationFrame === 'function';
  
  // Filter acceleration check
  let filterAccelerated = false;
  if (typeof document !== 'undefined') {
    const testEl = document.createElement('div');
    filterAccelerated = 
      'backdropFilter' in testEl.style || 
      'webkitBackdropFilter' in testEl.style ||
      'filter' in testEl.style;
  }
  
  // Calculate performance score
  const performanceScore = calculateGPUScore(
    webGLSupport,
    webGL2Support,
    webGPUSupport,
    gpuInfo.extensions,
    gpuInfo.renderer
  );
  
  return {
    gpuAccelerated: webGLSupport || transformAccelerated,
    webGLSupport,
    webGL2Support,
    webGPUSupport,
    transformAccelerated,
    filterAccelerated,
    maxTextureSize,
    gpuVendor: gpuInfo.vendor,
    gpuModel: gpuInfo.renderer,
    performanceScore
  };
};

/**
 * Get acceleration details for a specific feature
 */
export const getAccelerationDetailsForFeature = (
  feature: 'transform' | 'opacity' | 'filter' | 'backdrop-filter' | 'animation' | '3d-transform',
  hardware: HardwareAcceleration
): {
  accelerated: boolean;
  performanceImpact: 'low' | 'medium' | 'high';
  recommended: boolean;
} => {
  // Default response
  const result = {
    accelerated: true,
    performanceImpact: 'low' as const,
    recommended: true
  };
  
  // Based on hardware capability
  switch (feature) {
    case 'transform':
      result.accelerated = hardware.transformAccelerated;
      result.performanceImpact = 'low';
      result.recommended = true;
      break;
      
    case 'opacity':
      result.accelerated = hardware.gpuAccelerated;
      result.performanceImpact = 'low';
      result.recommended = true;
      break;
      
    case 'filter':
      result.accelerated = hardware.filterAccelerated;
      result.performanceImpact = 'low' as const;
      result.recommended = hardware.performanceScore >= 4;
      break;
      
    case 'backdrop-filter':
      result.accelerated = hardware.filterAccelerated;
      result.performanceImpact = 'low' as const;
      result.recommended = hardware.performanceScore >= 6;
      break;
      
    case 'animation':
      result.accelerated = hardware.gpuAccelerated;
      result.performanceImpact = 'low' as const;
      result.recommended = true;
      break;
      
    case '3d-transform':
      result.accelerated = hardware.webGLSupport;
      result.performanceImpact = 'low' as const;
      result.recommended = hardware.webGLSupport && hardware.performanceScore >= 5;
      break;
  }
  
  return result;
};