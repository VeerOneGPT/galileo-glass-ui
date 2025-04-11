/**
 * Timing Provider
 * 
 * Abstracts over browser timing mechanisms to provide consistent timing for animations.
 * This allows for better testability and more precise control over animation timing.
 */

import { isFeatureEnabled } from '../../utils/featureFlags';

/**
 * Callback function type for requestAnimationFrame
 */
export type AnimationFrameCallback = (timestamp: number) => void;

/**
 * Timing provider interface
 */
export interface TimingProvider {
  /**
   * Current time in milliseconds
   */
  readonly now: number;
  
  /**
   * Schedule a callback to run on the next animation frame
   */
  requestAnimationFrame: (callback: AnimationFrameCallback) => number;
  
  /**
   * Cancel a previously scheduled callback
   */
  cancelAnimationFrame: (id: number) => void;
  
  /**
   * Schedule a callback to run after a delay
   */
  setTimeout: (callback: () => void, delay: number) => number;
  
  /**
   * Cancel a previously scheduled timeout
   */
  clearTimeout: (id: number | undefined) => void;
  
  /**
   * Schedule a recurring callback
   */
  setInterval: (callback: () => void, delay: number) => number;
  
  /**
   * Cancel a previously scheduled interval
   */
  clearInterval: (id: number | undefined) => void;
}

/**
 * Browser timing provider implementation
 * 
 * Uses the browser's native timing APIs.
 */
export class BrowserTimingProvider implements TimingProvider {
  /**
   * Get the current time in milliseconds
   */
  get now(): number {
    return performance.now();
  }
  
  /**
   * Schedule a callback to run on the next animation frame
   */
  requestAnimationFrame(callback: AnimationFrameCallback): number {
    return window.requestAnimationFrame(callback);
  }
  
  /**
   * Cancel a previously scheduled callback
   */
  cancelAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id);
  }
  
  /**
   * Schedule a callback to run after a delay
   */
  setTimeout(callback: () => void, delay: number): number {
    return window.setTimeout(callback, delay);
  }
  
  /**
   * Cancel a previously scheduled timeout
   */
  clearTimeout(id: number | undefined): void {
    window.clearTimeout(id);
  }
  
  /**
   * Schedule a recurring callback
   */
  setInterval(callback: () => void, delay: number): number {
    return window.setInterval(callback, delay);
  }
  
  /**
   * Cancel a previously scheduled interval
   */
  clearInterval(id: number | undefined): void {
    window.clearInterval(id);
  }
}

/**
 * Global default timing provider instance
 */
const defaultTimingProvider = new BrowserTimingProvider();

/**
 * Get the active timing provider
 * 
 * This will use the new timing provider if the feature flag is enabled,
 * otherwise it will use the browser's native timing APIs directly.
 */
export function getTimingProvider(): TimingProvider {
  return isFeatureEnabled('ANIMATION_TIMING_PROVIDER')
    ? defaultTimingProvider
    : {
        get now() {
          return performance.now();
        },
        requestAnimationFrame: window.requestAnimationFrame.bind(window),
        cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
        setTimeout: window.setTimeout.bind(window),
        clearTimeout: window.clearTimeout.bind(window),
        setInterval: window.setInterval.bind(window),
        clearInterval: window.clearInterval.bind(window),
      };
}

export default getTimingProvider(); 