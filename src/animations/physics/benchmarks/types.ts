/**
 * Types for the benchmarking system
 */

/**
 * Configuration for a single benchmark
 */
export interface BenchmarkConfig<T extends unknown[]> {
  /** Name of the benchmark/engine being tested */
  name: string;
  
  /** Function to render the component */
  renderComponent: (...args: T) => React.ReactElement;
  
  /** Function to trigger the animation */
  triggerAnimation: (...args: T) => void;
  
  /** Duration of the animation in milliseconds */
  duration?: number;
  
  /** Number of warmup runs to perform */
  warmupCount?: number;
  
  /** Number of iterations for measurement */
  iterations?: number;
  
  /** Rate at which to sample frames */
  sampleFrameRate?: number;
  
  /** DOM element to benchmark */
  element: HTMLElement | null;
  
  /** Arguments to pass to renderComponent and triggerAnimation */
  args: T;
}

/**
 * Data for a single animation frame
 */
export interface FrameData {
  /** Time since animation start in milliseconds */
  time: number;
  
  /** X position of the element */
  x: number;
  
  /** Y position of the element */
  y: number;
  
  /** Width of the element */
  width: number;
  
  /** Height of the element */
  height: number;
  
  /** Transform property string */
  transform: string;
}

/**
 * Performance metrics from a benchmark
 */
export interface PerformanceMetrics {
  /** FPS (frames per second) metrics */
  fps: {
    average: number;
    values: number[];
  };
  
  /** Frame duration metrics in milliseconds */
  frameDurations: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  };
  
  /** Animation delay metrics in milliseconds */
  delay: {
    average: number;
    values: number[];
  };
  
  /** Animation smoothness metrics (percentage) */
  smoothness: {
    average: number;
    values: number[];
  };
  
  /** Memory usage metrics in bytes */
  memory: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

/**
 * Results from a benchmark run
 */
export interface BenchmarkResult {
  /** Name of the benchmark/engine */
  name: string;
  
  /** Performance metrics */
  metrics: PerformanceMetrics;
  
  /** Recorded animation frames */
  frames: FrameData[];
  
  /** Duration of the animation in milliseconds */
  duration: number;
}